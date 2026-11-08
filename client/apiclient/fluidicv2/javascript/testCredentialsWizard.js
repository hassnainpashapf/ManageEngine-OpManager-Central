function executeTestCredential() {
	var emailID = $.trim($("#credMailId").val());
	if(emailID !== "" && !isMailServerConfiguredPopUp())
	{
		return false;
	} else if(emailID !== "" && !opm_validateMultipleEmail(emailID)) {        $("#credMailId").addClass('validateField error');
        $("#credMailId").attr('data-error',Ember.I18n.t('webclient.admin.mailserver.invalidemailid',this));
        $("#credMailId").focus();
        return false;
    }
	var profileName = $.trim($("#credScheduleName").val());
	var fieldsToValidate = {'empty':['credScheduleName'], 'alphaNumericProfileName': ['credScheduleName'],'alphaNumericWithBasicSpecialChars':[]};//No I18N
	$("#credMailSubject").val() != "" ? fieldsToValidate.alphaNumericWithBasicSpecialChars.push('credMailSubject') : '';
	$("#credMailMessage").val() != "" ? fieldsToValidate.alphaNumericWithBasicSpecialChars.push('credMailMessage') : '';
	var isValid = opm_validateFields(fieldsToValidate);
	emailID = emailID.split(",").map(function(email) {return trim(email)}).join(",");//trimming space between and sending
	if(!isValid) {
		return false;
	} else {
		var jsonData = {};
		jsonData = getTestCredentialSelectedDeviceInfo(jsonData);
		jsonData.email = emailID;
		jsonData.subject = ($("#credMailSubject").val() === "") ?   Ember.I18n.t('weblcient.credential.test.emailsubject',this) + " - " + jsonData.profileName  : $("#credMailSubject").val();
		jsonData.message = ($("#credMailMessage").val() === "") ?   Ember.I18n.t('webclient.credential.test.emailmessage',this) : $("#credMailMessage").val();
		if($('#credScheduleTypeLater').is(':checked')) {
			jsonData = getScheduledTimeData(jsonData);
			var frequency = $("#credScheduleFrequency > div[class=active]").attr("value");
			if(!validateScheduleFrequency(frequency)) {
				return false;
			}
		}
		var url = window.OPM.apiUrlPattern + "/admin/addTestCredentialProfile"; //No I18N
		if (OPMClient.TestCredentialAddEditController.editPage) {
			jsonData.profileId = OPMClient.TestCredentialAddEditController.profileData.profileId;
			url = window.OPM.apiUrlPattern + "/admin/updateTestCredentialProfile";  //No I18N
		}
		else{
                            jsonData.profileName = profileName;
                        }
		addTestCredentialProfile(url, jsonData);
	}
}

function loadTestCredentialResultPage () {
	opm_transitionToParentRoute('Settings.Discovery.TestCredentials.Result');//No I18N
}	

function testCredentialReportDownload (fileType) {
	var url = window.OPM.apiUrlPattern + "/admin/getTestCredentialReport?profileId="+OPMClient.TestCredentialAddEditController.executeNowProfileId + "&fileType="+fileType;  //No I18N
	if(OPMClient.TestCredentialAddEditController.resultData.length != 0 && OPMClient.TestCredentialAddEditController.resultData[0].length == 0) {
		alert(Ember.I18n.t('webclient.reports.view.nodata',this));//No I18N
		return;	
	}
	opm_exportFilesPostMethod(url,{},'_blank');//No I18N
}

function testCredentialViewReport(profileId, profileName) {
	profileName = unescape(profileName);
	var url = window.OPM.apiUrlPattern + "/admin/getTestCredentialReport?profileId="+profileId; //No I18N
	var response = opm_ajaxPostRequest(url);
	OPMClient.TestCredentialAddEditController.resultData.push(response.reportDetails);
	OPMClient.TestCredentialAddEditController.executeNowProfileId = profileId;
	OPMClient.TestCredentialAddEditController.executeNowProfileName = profileName;
	loadTestCredentialResultPage();
}

function executeTestCredentialProfile() {
	if (OPMClient.TestCredentialAddEditController.executeNowProfileId === "") {
		return;
	}
	var profileId = OPMClient.TestCredentialAddEditController.executeNowProfileId 
	url = window.OPM.apiUrlPattern + "/admin/runTestCredentialProfile?profileId="+profileId; //No I18N
	var loadingMsg = Ember.I18n.t('webclient.test.credential',this) + " "+ Ember.I18n.t('jsp.commonstr.PlsWait',this);
	var response = opm_ajaxPostRequestWithMsg(url,  {}, loadingMsg, function (response) {
		OPMClient.TestCredentialAddEditController.resultData.push(response);
		OPMClient.TestCredentialAddEditController.executeNow = true;
		if(window.OPM.currentView.name == "Settings.Discovery.TestCredentials.index") {
			loadTestCredentialResultPage();
		}
	});
}

function loadTestResultData(jsonData, profileName) {
	$("#monitorHeader").find('span').text(Ember.I18n.t('webclient.credential.testresult.header',this) + " - " + profileName);
	$.each(jsonData,function(index,data)  {	
		var colNames =
	   [
		    Ember.I18n.t('webclient.map.bulkCredentialTest.credentialName',this), //No I18N
		    Ember.I18n.t('webclient.snmpv3.EncryptionProtocol',this), //No I18N
		    Ember.I18n.t('webclient.credential.result',this), //No I18N
		    Ember.I18n.t('webclient.devices.snapshot.statreason',this) //No I18N
	   ];
			var colModel =
	   [
		    { name: 'displayName', index: 'displayName',width:'30'}, //No I18N
		    { name: 'protocol', index: 'protocol',width:'20'}, //No I18N
		    { name: 'result', index: 'result',width:'20'}, //No I18N
		    { name: 'reason', index: 'reason',width:'50'} //No I18N
	   ];
	   var hideXLSIcon =  function(){
	   		setTimeout(function() {
		   		$('#TestCredentialResultPager_left').find('.ui-icon-document').hide();
		   	}, 50);
		};
	   	var defaultOptions = {"sortName":"displayName","sortOrder":"asc",'rowNumNeeded':false, "gridCallBack":hideXLSIcon};//No I18N
		opm_loadJQgridWithData("#TestCredentialResult", data, colNames, colModel, "", "#TestCredentialResultPager", "TestCredentialResults",defaultOptions); //No I18N
	    $("#Result_jqgridList").jqGrid('setGridWidth',$('#Result_jqgridList').closest('.opmFormHolder').width()-30); 
	    $("#Result_jqgridList").jqGrid("GridUnload");
	});
}

function addTestCredentialProfile(url, jsonData) {
	var response = opm_ajaxPostRequest(url, jsonData);
	var addClasses = "errorMsg";//No I18N
	var message = "";// No I18N
	if(response !== undefined && !$.isEmptyObject(response)) {
		message = (response.error !== undefined && response.error.message !== undefined) ? response.error.message  : response.message;
		if(response.result) {
			addClasses = "successMsg";//No I18N
			loadTestCredentialsListPage();
			if ("true" === jsonData.executeNow) {
				OPMClient.TestCredentialAddEditController.executeNowProfileId = OPMClient.TestCredentialAddEditController.editPage ? OPMClient.TestCredentialAddEditController.profileData.profileId : response.profileId;
				OPMClient.TestCredentialAddEditController.executeNowProfileName = jsonData.profileName;
			}
		} 
		opm_infoMsgs(addClasses,message);
	}
}

function getTestCredentialSelectedDeviceInfo(jsonData) {
	jsonData.deviceFilter = $('#testCredentialDeviceFilter').val();
	var selectedArray = $("#testCredentialDeviceRight > option");
	var csvDevices = [];
	var jsonArray=$.merge(OPMClient.TestCredentialAddEditController.profileData.remainingDevices,OPMClient.TestCredentialAddEditController.profileData.selectedDevices);
	var moid;
	$.each(selectedArray, function (key, obj) {
		$.each(jsonArray,function(kee,val)
         {
            if($(obj).attr("value")===$(val).attr("name")){
            	moid=$(val).attr("moid");
            } 
         });
		csvDevices.push($(obj).attr("value") + "#MOID#" +moid);//No I18N
	});
    jsonData.devices = JSON.stringify(csvDevices);
    jsonData.totalDevices = selectedArray.length;
    jsonData.executeNow = $('input[name=credTestScheduleType]:checked').val();
    jsonData.generateAlarm = $('input[name=credScheduleAlarm]:checked').val();
	jsonData.rearm = $('input[name=credScheduleRearm]:checked').val();
    return jsonData;
}

function getProfileName (profileName) {
	if (profileName === "") {
		var dt = new Date();
		var year = dt.getFullYear();
		var month = parseInt(dt.getMonth()) + 1;
		var date = dt.getDate();
		var hour = dt.getHours();
		var minute = dt.getMinutes();
		var second = dt.getSeconds()
		profileName = "Profile_"+year+"_"+month+"_"+date+"_"+hour+"_"+minute+"_"+second;
	} 
	return profileName;
}

function getScheduledTimeData(jsonData) {
	jsonData.schedType =  $("#credScheduleFrequency").find('.active').attr("value");
	switch (jsonData.schedType) {
		case '1' : 
			jsonData.onceDate = $("#onceDate").val();
			jsonData.onceHour = $("#onceHour").val();
			jsonData.onceMin = $("#onceMin").val();
			return jsonData;
		case '2' : 
			jsonData.dailyStartDate = $("#dailyStartDate").val();	
			jsonData.dailyHour = $("#dailyHour").val();	
			jsonData.dailyMin = $("#dailyMin").val();
			return jsonData;
		case '3' : 
			var schDays = "";//No I18
			var selectedWeeklyDays = $("#weeklyDayCheBox input[type=checkbox]:checked");
			$.each(selectedWeeklyDays, function(key, val){
				schDays += $(this).val();
				if (key < (selectedWeeklyDays.length - 1)) {
					schDays += ",";
				}
			});
			jsonData.weeklyDay = schDays;
			jsonData.weeklyHour = $("#weeklyHour").val();
			jsonData.weeklyMin = $("#weeklyMin").val();
			return jsonData;
		case '4' :
            jsonData.monthlyType = $('input:radio[name="monthlyType"]:checked').val();//No I18N	
            jsonData.monthlyDate = $("#monthlyDate").val();
            jsonData.monthlyWeekNum = $("#monthlyWeekNum").val();
            var schDays = "";//No I18
			var selectedMonthlyDays = $("#monthlyDayCheBox input[type=checkbox]:checked");
			$.each(selectedMonthlyDays, function(key, val){
				schDays += $(this).val();
				if (key < (selectedMonthlyDays.length - 1)) {
					schDays += ",";
				}
			});
			jsonData.monthlyDay = schDays;
			jsonData.monthlyHour = $('#monthlyHour').val();
            jsonData.monthlyMin = $('#monthlyMin').val();
            if (jsonData.monthlyType === '5') {
            	jsonData.schedType = '5';
            }
            return jsonData;
        case '6' :     
        	var schMonths = "";//No I18
			var selectedYearlyMonths = $("#yearlyMonthCheBox input[type=checkbox]:checked");
			$.each(selectedYearlyMonths, function(key, val){
				schMonths += $(this).val();
				if (key < (selectedYearlyMonths.length - 1)) {
					schMonths += ",";
				}
			});
			jsonData.yearlyMonth = schMonths;
			jsonData.yearlyDate = $('#yearlyDate').val();
			jsonData.yearlyHour = $('#yearlyHour').val();
			jsonData.yearlyMin = $('#yearlyMin').val();
			return jsonData;			
	}
}

function editTestCredentialProfile(profileId) {
	$.getJSON(window.OPM.apiUrlPattern + '/admin/getTestCredentialProfile?profileId='+profileId,function(response) { 	//No I18N
		if(response !== undefined && !$.isEmptyObject(response) && response.error !== undefined) {
			opm_infoMsgs("errorMsg", response.message);
		} else {
			OPMClient.TestCredentialAddEditController.editPage = true;
			OPMClient.TestCredentialAddEditController.profileData = response;
			loadTestCredentialEditSchedulePage();//No I18N
		}	
	});
}

function deleteTestCredentialProfile(profileId) {
	var url = window.OPM.apiUrlPattern + '/admin/deleteTestCredentialProfile?profileId='+profileId; //No I18N
	if(confirm(Ember.I18n.t('webclient.common.deleteconfirmation',this))) {
		var addClasses = "";//No I18N
		var message = "";// No I18N
		var response = opm_ajaxPostRequest(url);
		if(response !== undefined && !$.isEmptyObject(response)) {
			if(response.successMsg !== undefined || response.result && response.result.message) {
				addClasses = "successMsg";//No I18N
				message =response.successMsg ? response.successMsg : response.result.message;
				loadTestCredentialProfiles();
			} else if(response.errorMsg !== undefined || response.error != undefined) {
				addClasses = "errorMsg";//No I18N
				message = response.errorMsg ? response.errorMsg : response.error;
			}
		}
		showMessage(response);
	}
}

function loadTestCredentialProfiles() {
	var scheduleStatus = {"":Ember.I18n.t('webclient.maps.allcategs')}; //No I18N
	var scheduleFrequencyLabel = {"":Ember.I18n.t('webclient.maps.allcategs')}; //No I18N
	$.getJSON(window.OPM.apiUrlPattern + '/admin/getTestCredentialProfiles?wsId='+sessionStorage.getItem("wsId"),function(jsonData) { 	//No I18N
		if(jsonData.result) {
			for(var i=0; i < jsonData.result.length; i++) {
				scheduleFrequencyLabel[opm_escapeHTML(jsonData.result[i].scheduleFrequencyLabel)] = opm_escapeHTML(jsonData.result[i].scheduleFrequencyLabel);
			}
		}
		if(jsonData.scheduleStatusList) {
			for(var i=0; i < jsonData.scheduleStatusList.length; i++) {
				scheduleStatus[opm_escapeHTML(jsonData.scheduleStatusList[i])] = opm_escapeHTML(jsonData.scheduleStatusList[i]);
			}
		}
	   var colNames =
		   [
			    Ember.I18n.t('webclient.admin.notifprofiles.profilename',this), //No I18N
			    Ember.I18n.t('webclient.WAN.Frequency',this), //No I18N
			    Ember.I18n.t('webclient.admin.schedulereports.status',this), //No I18N
			    Ember.I18n.t('webclient.admin.schedulereports.schdesc',this), //No I18N
			    Ember.I18n.t('webclient.commonstr.profileId',this), //No I18N
			    Ember.I18n.t('webclient.action.actions',this), //No I18N
			    '',
				'',
			    Ember.I18n.t('webclient.support.submitquery.execute', this) //No I18N
		   ];
	   var colModel =
		   [
			    { name: 'profileName', index: 'profileName',width:'30',classes:"cursorPointer", formatter: testCredProfName}, //No I18N
				{ name: 'scheduleFrequencyLabel', index: 'scheduleFrequencyLabel',width:'20',stype:"select", searchoptions: {sopt:['eq'],value: scheduleFrequencyLabel}},//No I18N
			    { name: 'statusMessage', index: 'statusMessage',width:'30',formatter:testCredentialStatusIcon, stype:"select",searchoptions: {sopt:['eq'],value: scheduleStatus}}, //No I18N
				{ name: 'scheduleStatus', index: 'scheduleStatus',width:'60', classes:"wordBreak"}, //No I18N
			    { name: 'profileId', index: 'profileId',hidden:true}, //No I18N
			    { name: 'gridAction', index: 'gridAction',width:30,formatter:testCredentialActions, sortable: false, search:false}, //No I18N
			    { name: 'statusCode', index: 'statusCode',hidden:true}, //No I18N
				{ name: 'id', index: 'id',sortable:false,hidden:true}, //No I18N
			    { name: 'execute', index: 'execute',hidden:true} //No I18N
		   ];
		$("#jqgridList").jqGrid("GridUnload");
	   	var defaultOptions = {"sortName":"profileName","sortOrder":"asc",'rowNumNeeded':false, searchOption : true, Search: false, hideCSV: true, hideExcel: true };//No I18N
		opm_loadJQgridWithData("#jqgridList", jsonData.result, colNames, colModel, "", "#jqgridPager", "TestCredentialProfiles",defaultOptions); //No I18N
	    $("#jqgridList").jqGrid('setGridWidth',$('#jqgridList').closest('.opmFormHolder').width()-30); 
		$('#gs_scheduleFrequencyLabel').select2();
		$('#gs_statusMessage').select2();
		$("#jqgridList").setGridParam({sortname:"profileName",sortorder:"asc"}).trigger("reloadGrid"); //NO I18N
  	});
}

function testCredentialResultClose() {
	loadTestCredentialsListPage();
	loadTestCredentialProfiles();
}

function loadTestCredentialsListPage() {
	if(window.OPM.prevView !== undefined && window.OPM.prevView.name !== undefined && window.OPM.prevView.name === "Settings.Discovery.Credentials.Category.index")
	{
		opm_transitionToParentRoute('Settings.Discovery.Credentials.Category','Monitors');//No I18N
	}
	else
	{
		opm_transitionToParentRoute('Settings.Discovery.TestCredentials');//No I18N
	}
}

function loadTestCredentialAddSchedulePage() {
 	opm_transitionToParentRoute('Settings.Discovery.TestCredentialsAdd');//No I18N
}

function loadTestCredentialEditSchedulePage() {
 	opm_transitionToParentRoute('Settings.Discovery.TestCredentialsEdit');//No I18N
}

function testCredentialsGetDeviceCategoryList() {
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/getDeviceCategories?",{"excludeAP":"true"}); //No I18n
    var optionsHeader = {'Business View':Ember.I18n.t('webclient.reports.rightlist.businessview',this),'Infrastructure View':Ember.I18n.t('webclient.common.widgets.category',this),'General':Ember.I18n.t('webclient.devices.details.general',this),'Groups':Ember.I18n.t('webclient.opm.groups',this)};//No I18N
	if(jsonData.message === undefined && Object.keys(jsonData).length > 0) {
		var dropDownOptions = "";
		firstName = "AllDevices";//No I18N
		$.each(jsonData, function(i, item){
            if(!$.isEmptyObject(item)){
	            var displayName = optionsHeader.hasOwnProperty(i) ? optionsHeader[i] : i ;
				dropDownOptions += "<optgroup label='"+opm_escapeHTML(displayName)+"'>"; //No I18N
				$.each(item, function(i2, item2){
					dropDownOptions += "<option value='"+opm_escapeHTML(i2)+"'>"+opm_escapeHTML(item2)+"</option>"; //No I18N
				});
				dropDownOptions += "</optgroup>"; //No I18N
            }
		});
		$("#testCredentialDeviceFilter").html(dropDownOptions);
		$('#testCredentialDeviceFilter').val('4');
 	}
}

function testCredentialsGetDevicesByFilter (option) {
	var filterID = (option === "AllDevices") ? '4' : option;//No I18N
	jsonResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/getDeviceListForFilter?type=credential&filterID="+filterID+"&excludeAP=true&excludeOpenFWDevice=true"); //No I18n
	if (jsonResponse !== undefined && jsonResponse.remainingDevices !== undefined) {
		OPMClient.TestCredentialAddEditController.profileData.remainingDevices = jsonResponse.remainingDevices;
		testCredentialsDevicesInMultiSelectBox(jsonResponse.remainingDevices, "testCredentialDeviceLeft");
	}
	if (jsonResponse !== undefined && jsonResponse.selectedDevices !== undefined) {
		OPMClient.TestCredentialAddEditController.profileData.selectedDevices = jsonResponse.selectedDevices;
		testCredentialsDevicesInMultiSelectBox(jsonResponse.selectedDevices, "testCredentialDeviceRight");
	}
}

function testCredentialsDevicesInMultiSelectBox(devices, selectBoxId) {
	if(selectBoxId=="testCredentialDeviceLeft" || selectBoxId=="testCredentialDeviceRight"){
		var emptyArr=[];
		$.each(devices, function (index, value) {
				emptyArr.push({"value":value.name,"displayName":value.displayName});
		 });
		if(selectBoxId=="testCredentialDeviceLeft"){
		 	triggerAssociationComponentForURL(emptyArr,OPMClient.ApplicationController.assoDetailsURL.selectedListURL);//No I18N
		}
		else{
			triggerAssociationComponentForURL(OPMClient.ApplicationController.assoDetailsURL.availableListURL,emptyArr);//No I18N
		}
	}
	else if(selectBoxId=="DTAssociationLeft" ||selectBoxId=="DTAssociationRight" ){


		var emptyArr=[];
		$.each(devices, function (index, value) {
				emptyArr.push({"value":value.name,"displayName":value.displayName,"moid":value.moid});
		 });
		if(selectBoxId=="DTAssociationLeft"){
		 	triggerAssociationComponent(emptyArr,OPMClient.ApplicationController.assoDetails.selectedList);//No I18N
		}
		else{
			triggerAssociationComponent(OPMClient.ApplicationController.assoDetails.availableList,emptyArr);//No I18N
		}
		
	}
}

function testCredentialHandleEmailSchedule(executeNow) {
	if (executeNow) {
		$("#schedule").hide();
	} else {
		$("#schedule").show();
		preSelectCurrentTime();
	}	
}

function preSelectCurrentTime() {
	var dt = new Date();
	var hour = dt.getHours();
	var minute = dt.getMinutes();
	minute = (minute < 10) ? "0".concat(minute) : minute; 
	$("#onceHour").val(hour);
	$("#dailyHour").val('0');
	$("#onceMin").val(minute);
	$("#onceHour, #dailyHour, #onceMin, #dailyMin").select2();
}

function wizardNavigator(currentStage, direction, toStage) {
	var proceed =  true;
	var isEditPage = OPMClient.TestCredentialAddEditController.editPage;
	if ("fwd" === direction) {
		proceed = validateCredCheckFields(currentStage, toStage);
		if(!isEditPage) {
			$("#testCredentialAddEditHdr").text(" > " + Ember.I18n.t('webclient.action.notificationprofile.add',this)); //No I18N
		}
		if ("schedule" === toStage && isEditPage) {
			opm_loadDateInProfileEdit(OPMClient.TestCredentialAddEditController.profileData.scheduleDetails);
		} else if ("schedule" === toStage ) {
			preSelectCurrentTime();
		}
	} else if(!isEditPage) {
		$("#testCredentialAddEditHdr").text(" > " + Ember.I18n.t('webclient.topo.addnode.header',this)); //No I18N
	}
	if (proceed) {
		$("#"+currentStage+"Div").hide();
		$("#"+toStage+"Div").show();
	}
}

function testCredentialScheduleAccShowHideEvents() {
    $('.verticalAcc .verticalAccHdr > div').click(function(){
         if(!$(this).hasClass('active')){
            if($(this).index()==0){
                $(this).removeClass('noActive');
            }else{
                $('.verticalAcc .verticalAccHdr > div:first-child').addClass('noActive');
            }
            $('.verticalAcc .verticalAccHdr > div').removeClass('active');
            $(this).addClass('active');
            $(this).parent().parent().find('.verticalAccSignle').removeClass('active').hide();
            verAccShw='#' + $(this).data('href');
            $(verAccShw).show();
        }
    });
	$(".dateCheck").datepicker({minDate: new Date(), dateFormat: 'yy-mm-dd'}).datepicker('setDate', '+0');//No I18N
}

function validateCredCheckFields(currentStage, toStage) {
	var executeNow = $('input[name=credTestScheduleType]:checked').val();
	if(currentStage === "devices" && !opm_validateFields( {'empty':['testCredentialDeviceRight']})){
		return false;
	} else if ("schedule" === currentStage && executeNow === "false") {
		var frequency = $("#credScheduleFrequency > div[class=active]").attr("value");
		return validateScheduleFrequency(frequency);
	}
	return true;
}

function validateScheduleFrequency(frequency) {
	var dt = new Date();
	var year = parseInt(dt.getFullYear());
	var month = parseInt(dt.getMonth()) + 1;
	var date = parseInt(dt.getDate());
	var hour = parseInt(dt.getHours());
	var minute = parseInt(dt.getMinutes());
	var todayDateStr = year+"-"+((month > 9) ? month : '0'+month )+"-"+(date);
	if ("1" === frequency) {	
		var onceDate = $("#onceDate").val();
		var onceHour = parseInt($("#onceHour").val());
		var onceMin = parseInt($("#onceMin").val());
		if (todayDateStr === onceDate) {
			if (onceHour < hour) {
				alert('Please select a future period');
				return false;
			} else if (onceHour === hour && (onceMin <= minute)) {
				alert('Please select a future period');
				return false;
			}
		}
		return true;
	} else if ("3" === frequency) {
		var selectedDays = $("#weeklyDayCheBox input[type=checkbox]:checked").length;
		if (selectedDays === 0) {
			alert('Please select a day');
			return false;
		}
	} else if ("4" === frequency) {
		var monthlyType = $("input[name=monthlyType]:checked").val();
		var selectedDays = $("#monthlyDayCheBox input[type=checkbox]:checked").length;
		if (monthlyType === "5" && selectedDays === 0) {
			alert('Please select a day');
			return false;
		}
	} else if ("6" === frequency) {
		var selectedMonths = $("#yearlyMonthCheBox input[type=checkbox]:checked").length;
		if (selectedMonths === 0) {
			alert('Please select a month');
			return false;
		}
	}
	return true;	
}

function fillTestCredentialProfileDataInEditPage(profileData) {
	$("#testCredentialAddEditHdr").text(" > " + profileData.profileName + " - " + Ember.I18n.t('webclient.title.edit', this)); //No I18n
	$("#testCredentialDeviceFilter").select2();
	$("#testCredentialDeviceFilter").val(profileData.deviceFilter);
	var remainArr = [];
	var seleArr = [];
	$.each(profileData.remainingDevices, function (index, value) {
		remainArr.push({"value":value.name,"displayName":value.displayName});
	});
	$.each(profileData.selectedDevices, function (index, value) {
		seleArr.push({"value":value.name,"displayName":value.displayName});
	});
	$("input[name=credScheduleAlarm][value='"+profileData.generateAlarm+"']").prop("checked",true);
	$("input[name=credScheduleRearm][value='"+profileData.rearm+"']").prop("checked",true);
	$("#credScheduleName").val(profileData.profileName);
    $("#credScheduleName").attr("disabled", true);
 	$("#credMailId").val(profileData.email);
    $("#credMailSubject").val(profileData.subject);
    $("#credMailMessage").val(profileData.message);    
	if ("NOW" === profileData.execute) {
		$(".testCredentialExecuteNow, #executeNowSave").show();
		$("input[name=credTestScheduleType][value=true]").prop("checked",true);
		$(".credScheduleDiv").hide();
	} else {
		$(".credScheduleDiv").show();
		$("input[name=credTestScheduleType][value=false]").prop("checked",true);
		loadScheduleDataInProfileEdit(profileData.scheduleDetails);
	}
	triggerAssociationComponentForURL(remainArr,seleArr);//No I18N
}

function opm_loadDateInProfileEdit(scheduleDetails) {
	if (scheduleDetails !== undefined &&  !$.isEmptyObject(scheduleDetails)) {
		if ("1" === scheduleDetails.schedType) {
			$("#onceDate").datepicker({minDate: new Date(), dateFormat: 'yy-mm-dd'}).datepicker('setDate',  scheduleDetails.onceDate); //No I18N
		} else if ("2" === scheduleDetails.schedType) {
			$("#dailyStartDate").datepicker({minDate: new Date(), dateFormat: 'yy-mm-dd'}).datepicker('setDate', scheduleDetails.dailyStartDate); //No I18N
		}
	}
}

function loadScheduleDataInProfileEdit(scheduleData) {
	if(scheduleData !== undefined && !$.isEmptyObject(scheduleData)) {
		$('.verticalAcc .verticalAccHdr > div[value=1]').removeClass().addClass("noActive");
		$('.verticalAcc .verticalAccContent > div[id=once]').removeClass('active');
		$(".verticalAcc .verticalAccHdr > div[value='"+scheduleData.schedType+"']").removeClass().addClass('active');
		switch (scheduleData.schedType) {
			case '1' :
				$('.verticalAcc .verticalAccContent > div[id=once]').addClass('active');
				$("#onceDate").datepicker({minDate: new Date(),  dateFormat: 'yy-mm-dd'}).datepicker('setDate',  scheduleDetails.onceDate); //No I18N
				$("#onceHour").val(scheduleData.onceHour);
				var onceMinVal = parseInt(scheduleData.onceMin) < 10 ? "0".concat(scheduleData.onceMin) : scheduleData.onceMin;
				$("#onceMin").val(onceMinVal);
				break;
			case '2' :
				$('.verticalAcc .verticalAccContent > div[id=daily]').addClass('active');
				$("#dailyStartDate").datepicker({minDate: new Date(),  dateFormat: 'yy-mm-dd'}).datepicker('setDate', scheduleDetails.dailyStartDate); //No I18N
				$("#dailyHour").val(scheduleData.dailyHour);
				var dailyMinVal = parseInt(scheduleData.dailyMin) < 10 ? "0".concat(scheduleData.dailyMin) : scheduleData.dailyMin;
				$("#dailyMin").val(dailyMinVal);
				break;
			case '3' :
				$('.verticalAcc .verticalAccContent > div[id=weekly]').addClass('active');
				$.each(scheduleData.weeklyDay, function(key, value) {
					$("#weeklyDayCheBox input[type=checkbox][value='"+value+"']").prop('checked', true);//No I18N
				});
				$("#weeklyHour").val(scheduleData.weeklyHour);
				var weeklyMinVal = parseInt(scheduleData.weeklyMin) < 10 ? "0".concat(scheduleData.weeklyMin) : scheduleData.weeklyMin;
				$("#weeklyMin").val(weeklyMinVal);
				break;				
			case '4' :
				$('.verticalAcc .verticalAccContent > div[id=monthly]').addClass('active');
				$("#monthlyDate").val(scheduleData.monthlyDate);
				$("input[name=monthlyType][value='"+scheduleData.schedType+"']").prop("checked",true);
				$("#monthlyDayCheBox").hide();
				$("#monthlyHour").val(scheduleData.monthlyHour);
				var monthlyMinVal = parseInt(scheduleData.monthlyMin) < 10 ? "0".concat(scheduleData.monthlyMin) : scheduleData.monthlyMin;
				$("#monthlyMin").val(monthlyMinVal);
				break;
			case '5' :
				$(".verticalAcc .verticalAccHdr > div[value=4]").removeClass().addClass('active');
				$('.verticalAcc .verticalAccContent > div[id=monthly]').addClass('active');
				$("input[name=monthlyType][value='"+scheduleData.schedType+"']").prop("checked",true);
				$("#monthlyDayCheBox").show();
				$("#monthlyHour").val(scheduleData.monthlyHour);
				$("#monthlyWeekNum").val(scheduleData.monthlyWeekNum);
				var monthlyMinVal = parseInt(scheduleData.monthlyMin) < 10 ? "0".concat(scheduleData.monthlyMin) : scheduleData.monthlyMin;
				$("#monthlyMin").val(monthlyMinVal);
				$.each(scheduleData.monthlyDay, function(key, value) {
					$("#monthlyDayCheBox input[type=checkbox][value='"+value+"']").prop('checked', true);//No I18N
				});
				break;
			case '6' :
				$('.verticalAcc .verticalAccContent > div[id=yearly]').addClass('active');
				$("#yearlyDate").val(scheduleData.yearlyDate);
				$("#yearlyHour").val(scheduleData.yearlyHour);
				var yearlyMinVal = parseInt(scheduleData.yearlyMin) < 10 ? "0".concat(scheduleData.yearlyMin) : scheduleData.yearlyMin;
				$("#yearlyMin").val(yearlyMinVal);
				$.each(scheduleData.yearlyMonth, function(key, value) {
					$("#yearlyMonthCheBox input[type=checkbox][value='"+value+"']").prop('checked', true);//No I18N
				});
				break;
		}
	}	
}
function testCredentialUpdateInstantlyJS(profileStatus) {
	if(OPMClient.ApplicationController.currentRouteName == 'Settings.Discovery.TestCredentials.index') {
		var grid = $('#jqgridList');
		var gridData = grid[0].p.data;
		var rowKeys = grid.getGridParam("_index");//No I18N
		var rowIds = Object.keys(rowKeys).length;
		for (var i = 1; i <= rowIds; i++) {
			var rowData = gridData[i-1];
			if(profileStatus.profileId == rowData['profileId']) {
				grid.jqGrid('setCell', i, "scheduleStatus", profileStatus.scheduleStatus);
				grid.jqGrid('setCell', i, "statusCode", profileStatus.statusCode);
				grid.jqGrid('setCell', i, 'statusMessage', profileStatus.statusMessage);
				grid.jqGrid('setCell', i, "gridAction");
				grid.trigger('reloadGrid');//No I18n
				if(!grid.find('#'+i).length) {
					var invisibleData = grid.jqGrid('getGridParam', 'data');
					invisibleData[i-1].scheduleStatus =  profileStatus.scheduleStatus;
					invisibleData[i-1].statusCode =  profileStatus.statusCode;
					invisibleData[i-1].statusMessage =  profileStatus.statusMessage;
					grid.jqGrid('setGridParam', { data: invisibleData }).trigger('reloadGrid');
				}
				var rowsFiltered = jQuery(grid).getRowData();
	         	if(rowsFiltered.length == 0) {
	         		$(grid).prev().text(Ember.I18n.t('webclient.jqgrid.no.data.found')); //No I18n
					$(grid).prev().addClass("gridnodata");
	         	} else {
	         		$(grid).prev().text(''); //No I18n
					$(grid).prev().removeClass("gridnodata");
				}
			}
		}
	}
}

function isIEBrowser() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    var edge = ua.indexOf('Edge/');
    if (msie > 0) {
    	return true;
    } else if (trident > 0) {
    	return true;
    } else if (edge > 0) {
    	return true;
    } else {
	    return false;
    }
}
