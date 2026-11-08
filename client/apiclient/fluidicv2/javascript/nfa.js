//============== NFA_DE Related Methods Starts  =====================
function getNFAProbes() {
	var formattedProbes = [];
	var noFlowCollectors = [];
	$.ajax({
		url: window.OPM.apiUrlPattern + '/nfaee/getAllCollInfo', // NO I18N
		type: 'GET', // NO I18N
		async: false,
		success: function (response) {
			var probes = (response!==null && response!==undefined) ? response : [];

			for (var i = 0; i < probes.length; i++) {
				var probe = probes[i];
				var status = (probe.collStatus || '').toLowerCase(); //NO I18N
				var isDisabled = status !== 'up'; //NO I18N

				if (!probe.colIntf && !probe.colDPI) {
					noFlowCollectors.push(probe.id.toString());
				}
			
				formattedProbes.push({
					id: 'ee_probe_' + probe.id, // NO I18N
					_id: probe.id,
					label: probe.name,
					value: probe.id.toString(),
					status: status,
					disabled: isDisabled
				});
			}
		}
	});
	window.noFlowCollectors = noFlowCollectors;
	window.showInstallationInfo = noFlowCollectors.length > 0;
	window.nfaProbeList = formattedProbes;
	return formattedProbes;
}

function nfa_setProbeID(probeId) {
	sessionStorage.setItem("selectedProbeId", probeId); //NO I18N
}


function getFirstActiveNFAProbeId() {
	var probes = window.nfaProbeList || getNFAProbes();
	for (var i = 0; i < probes.length; i++) {
		if (!probes[i].disabled) {
			return probes[i]._id;
		}
	}
	return null; // No active probe found
}

function nfa_setFirstActiveProbeId() {
	var probeId = getFirstActiveNFAProbeId();
	if (probeId === null) {
		probeId = window.nfaProbeList.legth > 0 ? window.nfaProbeList[0]._id : "-1"; // Default to -1 if no probes are available
	}
	nfa_setProbeID(probeId);
}

function nfa_setAllProbeId () {
	nfa_setProbeID("-1"); // NO I18N
}

function updateCollector()
{
	if(!window.isserver) {return;}

	var collOpt = nfa_getCollectorID();
	
	if(collOpt == undefined || collOpt == null) {
		collOpt = "-1"; nfa_setCollectorID(collOpt);
	}
	window.showInstallationInfo = true;
	var jsonResponse;
	$.ajax({
		url: window.OPM.apiUrlPattern + '/nfaee/getAllCollInfo', //No I18N
		type: 'GET', //No I18N
		async:false,
		success: function(jsonResp)
   		{
   			var Options="<option value='-1'>"+Ember.I18n.t('webclient.dashboard.allprobes')+"</option>";
   			if(jsonResp.length !== 0) {
   				window.showInstallationInfo = false;
	   			window.noFlowCollectors = [];
	   			if(OPMClient.ApplicationController.isLicenseExceeded) {Options='';}
	   			
	   			for(var i=0;i<jsonResp.length;i++) {
					window.isCollectorsExist = true;
					if(!jsonResp[i].colIntf && !jsonResp[i].colDPI){
						window.showInstallationInfo = true;
						window.noFlowCollectors.push(jsonResp[i].id.toString());
					}
					var isDisabled = jsonResp[i].collStatus !== "Up" ? "disabled" : ""; //NO I18N
					Options += "<option collStatus='"+jsonResp[i].collStatus+"' value='"+jsonResp[i].id+"' "+isDisabled+">"+jsonResp[i].name+"</option>"; //No I18n
				}
			}
			window.CollectorOptions = Options;

			$(".AllColCombo").html(Options);
			$('.AllColCombo').val(collOpt).prop('selected',true); //No I18n

			if(collOpt === "-1") { //NO I18N
				OPMClient.ApplicationController.set("isAllCollector",true); //NO I18N
				OPMClient.ApplicationController.set("isCollectorSelected", false); //NO I18N
			}else {
				OPMClient.ApplicationController.set("isAllCollector",false); //NO I18N
				OPMClient.ApplicationController.set("isCollectorSelected", true); //NO I18N
			}
			nfa_handleCollectorComboStatus();
			jsonResponse=jsonResp;
		}
	});
	return jsonResponse;
}

function nfa_handleCollectorComboStatus()
{
	$('.collectors > .nfaCollectorStatus').hide();
	var collStatusInfo = $(".AllColCombo option:selected").attr("collStatus");
	if(collStatusInfo === "Up") { //NO I18N
		$('.collectors > .collector-up').show();
	}else if (collStatusInfo === "Down") { //NO I18N
		$('.collectors > .collector-down').show();
	}else if (collStatusInfo === "Incompatible") { //NO I18N
		$('.collectors > .collector-incompatible').show();
	}else if (collStatusInfo === "Broken") { //NO I18N
		$('.collectors > .collector-broken').show();
	}
}

function CheckCollectorAvailable()
{
	var jsonResponse = updateCollector();
	var selectedCol = nfa_getCollectorID();

	if(jsonResponse.length == 0) {
		nfa_showInstallInfoDivs("#noCollectorMsg"); //NO I18N
		return;
	}

	var noFlowMsg,noRoutermsg,isRestartMsg;
	var isBrokenCollector = false;
	var isDownCollector = false;
	var csURL = ""; //No I18N
	if(selectedCol !== "-1") {
		for(var i=0; i<jsonResponse.length; i++) {
			if(jsonResponse[i].id === parseInt(selectedCol)) {
				isBrokenCollector = (jsonResponse[i].collStatus === "Broken"); //NO I18N
				isDownCollector = (jsonResponse[i].collStatus !== "Up"); //NO I18N
				if(!jsonResponse[i].colIntf && !jsonResponse[i].colDPI) {
					noFlowMsg = jsonResponse[i].NOFlowmsg;
					noRoutermsg = jsonResponse[i].NoRoutermsg;
				}
				isRestartMsg = jsonResponse[i].collRestart;
				csURL = jsonResponse[i].url;
				break;
			}
		}
	}else if(jsonResponse.length == window.noFlowCollectors.length) {
		noFlowMsg = jsonResponse[0].NOFlowmsg;
		noRoutermsg = jsonResponse[0].NoRoutermsg;
		isRestartMsg = jsonResponse[0].collRestart;
		csURL = jsonResponse[0].url;
	}

	if(isBrokenCollector){
		nfa_showInstallInfoDivs("#collectorBrokenMsgDiv"); //NO I18N
		$("#nfaDEInfoMsgDiv").hide();
		return;
	}else if(isDownCollector) {
		nfa_showInstallInfoDivs("#collectorDownMsgDiv"); //NO I18N
		$("#nfaDEInfoMsgDiv").hide();
		return;
	}

	if(isRestartMsg == undefined && noFlowMsg == undefined && noRoutermsg == undefined) {
		nfa_hideInstallInfoDivs();
		return;
	}

	if(isRestartMsg){
		nfa_showInstallInfoDivs("#restartServerMsg"); //NO I18N
		OPMClient.NFAHomeDashboardController.set("csURLforDEMigration", csURL); //No I18N
	}else if(noFlowMsg !== undefined) {
		nfa_showInstallInfoDivs("#noFlowMsg"); //NO I18N
	}else if(noRoutermsg !== undefined) {
		nfa_showInstallInfoDivs("#routerAdd"); //NO I18N
		var rows="";
		for(var i=0; i<noRoutermsg.length; i++) {
			rows += '<tr><td>'+opm_escapeHTML(noRoutermsg[i])+'</td></tr>'; //NO I18N
		}
		$('#routerAddTbl').html('').append(rows); //NO I18N
	}
}

function nfa_showInstallInfoDivs(divElement) {
	nfa_disableSidePaneTabs();
	$("#installinfoDiv").removeClass('fullMsgDiv'); //NO I18N
	$('body').addClass('initialMsg'); //NO I18N
	$("#main").css({'visibility':'hidden'}); //NO I18N
	$("#noCollectorMsg").hide(); //NO I18N
	$("#restartServerMsg").hide(); //No I18N
	$("#noFlowMsg").hide(); //NO I18N
	$("#routerAdd").hide(); //NO I18N
	$("#nfaDEInfoMsgDiv").show(); //NO I18N
	$("#collectorDownMsgDiv").hide(); //NO I18N
	$("#collectorBrokenMsgDiv").hide(); //NO I18N
	$("#noDeviceMsg").hide(); //NO I18N
	$(divElement).show();
}

function nfa_hideInstallInfoDivs() {
	nfa_enableSidePaneTabs();
	$("#main").css({'visibility':''}); //NO I18N
	$("#installinfoDiv").addClass('fullMsgDiv'); //NO I18N
	$('body').removeClass('initialMsg'); //NO I18N
	$("#noCollectorMsg").hide(); //NO I18N
	$("#restartServerMsg").hide(); //No I18N
	$("#noFlowMsg").hide(); //NO I18N
	$("#routerAdd").hide(); //NO I18N
	$("#nfaDEInfoMsgDiv").hide(); //NO I18N
	$("#collectorDownMsgDiv").hide(); //NO I18N
	$("#collectorBrokenMsgDiv").hide(); //NO I18N
	$("#noDeviceMsg").hide(); //NO I18N
}

function nfa_disableSidePaneTabs() {
	$('#MainNav .NavUl li:not([data-title="Settings"]').addClass('mainLinkdisable'); //NO I18N
	$('#MainNav .NavUl li[data-title="Settings"] ul li').removeClass('mainLinkdisable'); //NO I18N
	$('#ProductSettings .NavUl li:nth-child(1)').addClass('mainLinkdisable'); //NO I18N
}

function nfa_enableSidePaneTabs() {
	$('#MainNav .NavUl li').removeClass('mainLinkdisable'); //NO I18N
	$('#ProductSettings .NavUl li:nth-child(1)').removeClass('mainLinkdisable'); //NO I18N
}

function nfa_setCollectorID(collOpt) {
	var previousCollectorID = nfa_getCollectorID();
	sessionStorage.setItem("selectedProbeId",collOpt); //NO I18N
	if(previousCollectorID !== collOpt) {
		nfa_updateNBAandNDRValues(true);
		nfa_loadHoverLinks(); // For update Menu Links
		OPMClient.ApplicationController.set("tabDetails",[]); //NO I18N
		OPMClient.ApplicationController.set("tabDetails",(window.OPM.oldView)?getTabDetails():[]); //No I18N
		(collOpt === "-1")?$('#gettingStartedIcon').hide():$('#gettingStartedIcon').show(); //No I18N
		OPMClient.ApplicationController.set("hideEmergencyPatchSettings", getHideEmergencyPatchSettings()); //No I18N
	}
}

function nfa_changeColOpt(collOpt) {
	if(collOpt===undefined) {
		collOpt = $('.AllColCombo > option[collStatus="Up"]').val(); //No I18N
		collOpt = (collOpt !== undefined) ? collOpt : $('.AllColCombo > option:nth-child(2)').val(); //No I18N
	}
	nfa_setCollectorID(collOpt);
	$(".AllColCombo").val(collOpt); //NO I18N
	$(".AllColCombo option:selected").prop("selected",true); //NO I18N
	$(".nfaDEColComboDiv .AllColCombo.select2").select2(); //No I18N

	if(collOpt==="-1") { //NO I18N
		OPMClient.ApplicationController.set("isAllCollector",true); //NO I18N
		OPMClient.ApplicationController.set("isCollectorSelected", false); //NO I18N
	}else{
		OPMClient.ApplicationController.set("isAllCollector",false); //NO I18N
		OPMClient.ApplicationController.set("isCollectorSelected", true); //NO I18N
	}
	nfa_handleCollectorComboStatus();

	var collStatus = $(".AllColCombo option[value='"+collOpt+"']").attr("collStatus");//NO I18N
	if(collStatus === "Broken"){
		nfa_showInstallInfoDivs("#collectorBrokenMsgDiv"); //NO I18N
		$("#nfaDEInfoMsgDiv").hide();
		return;
	}else if(collStatus !== undefined && collStatus !== "Up") {//NO I18N
		nfa_showInstallInfoDivs("#collectorDownMsgDiv"); //NO I18N
		$("#nfaDEInfoMsgDiv").hide();
		return false;
	}
	return true;
}

function setCombo(option) {
	if(!window.isserver) {
		return;
	}
	if(!window.isCollectorsExist || OPMClient.ApplicationController === undefined) {
		return;
	}
	if(window.showInstallationInfo) {
		if(!OPMClient.ApplicationController.hideMandatoryDetails)
		{
			OPMClient.ApplicationController.set("showNFAProbeKeyAfterPassword", true); //No I18N
			return;
		}
		CheckCollectorAvailable();
	}

	// $(".AllColCombo option").removeAttr('disabled');//NO I18N
	$(".AllColCombo option").filter(function () { //NO I18N
		return $(this).attr("collStatus") === "Up" || $(this).val() === "-1"; //NO I18N
	}).removeAttr("disabled"); //NO I18N

	var collOpt = nfa_getCollectorID();
	if(option === "withOutAll") { //NO I18N
		collOpt = (collOpt === "-1")?undefined:collOpt;
		OPMClient.ApplicationController.set("isAllCollector",false); //NO I18N
		OPMClient.ApplicationController.set("isCollectorSelected", true); //NO I18N
		$('.AllColCombo option[value="-1"]').attr('disabled','disabled'); //NO I18N
	}else if(option === "withAllOnly") { //NO I18N
		collOpt = "-1"; //NO I18N
		OPMClient.ApplicationController.set("isAllCollector",true); //NO I18N
		OPMClient.ApplicationController.set("isCollectorSelected", false); //NO I18N
		$('.AllColCombo option:not([value="-1"])').attr('disabled','disabled'); //NO I18N
	}
	nfa_changeColOpt(collOpt);
}

window.comboChanged =false;
function collComboChanged(URL,selCol)
{
	if($('.dashboardSlideDivIn-2').is(':visible')){dashboardSlideOut(2);} //NO I18N
	window.comboChanged=true;
	var previousSelCol = nfa_getCollectorID();
	nfa_setCollectorID(selCol);

	CheckCollectorAvailable();
	var indexURL =URL.substr(URL.indexOf("#/")+2,URL.length);
	var routeName = indexURL.split("/")[0];
	if(previousSelCol === "-1" || selCol === '-1') {
		indexURL=getUrlForComboChange(indexURL,selCol);
	}
	OPMClient.ApplicationController.set("isAllCollector",(selCol==="-1")); //NO I18N
	OPMClient.ApplicationController.set("isCollectorSelected", (selCol!=="-1")); //NO I18N
	window.FullIndexURL = window.OPM.apiclientUrl + indexURL;
	location.href="#/"; //NO I18N
}

function getUrlForComboChange(indexURL,selCol) {
	var urlVaules = indexURL.split("/"); //NO I18N
	var routeName = urlVaules[0];
	var returnURL = indexURL;
	switch(routeName) {
		case "Home"			: 	var dbName=urlVaules[urlVaules.length-1]; //NO I18N
								if(["NFADB.Apps","NFADB.qos"].indexOf(dbName)===-1) { //NO I18N
									dbName = (selCol!=="-1")?"NFADB.traffic":OPMClient.ApplicationController.defaultDashboard; //NO I18N
									urlVaules[urlVaules.length-2]="NFA"; //NO I18N
								}
								returnURL = "Home/Dashboard/"+urlVaules[urlVaules.length-2]+"/"+dbName; //NO I18N
								break;
		case 'Inventory'	: 	if(["Groups","Attacks","ASView","CloudServices","Users"].indexOf(urlVaules[3]) !== -1) { //NO I18N
									returnURL="Inventory/List/FlowAnalysis/Devices"; //NO I18N
								}else if(urlVaules[2]==="WlcAnalysis" && urlVaules[3] !== "Controllers") { //NO I18N
									returnURL="Inventory/List/WlcAnalysis/Controllers"; //NO I18N
								}
								break;
		case "Alarms"		: 	returnURL="Alarms/Alarm/Active"; //NO I18N
								break;
		case "Settings"		: 	if(!window.OPM.isAuthorized) { //NO I18N
									returnURL=((selCol!=="-1") ? "Settings/NetflowConfig/AlertProfiles/RealTime" : "Settings/NetflowConfig/Basic/Timezone"); //NO I18N
									break;
								}
								if(["Basic","UserMgmt","Discovery","Configurations","NcmConfig","OpUtils","Agents"].indexOf(urlVaules[1])!==-1) { //NO I18N
									returnURL="Settings/Basic/Mail"; //NO I18N
								}else if(urlVaules[1]==="NetflowConfig") { //NO I18N
									if(window.OPM.isAdministrator) {
										returnURL=(selCol!=="-1")?"Settings/NetflowConfig/Basic/Geolocation":"Settings/NetflowConfig/Basic/Timezone"; //NO I18N
									}else if(OPMClient.MenuController.nfaSettingsMenuLinks.length!==0) {
										returnURL = OPMClient.MenuController.nfaSettingsMenuLinks[0].route.split(".").join("/"); //NO I18N
									}else {
										returnURL = "SettingsSummary"; //NO I18N
									}
								}
								break;
	}
	return returnURL;
}

function nfa_showCollectorKeyInfo(){
	OPMClient.ApplicationController.set("globalSlide","nfaInstallCollector"); //NO I18N
	OPMClient.ApplicationController.set("isGlobalVisible",false); //NO I18N
	OPMClient.ApplicationController.set("isGlobalVisible",true); //NO I18N
	setTimeout(function(){
		$("body").addClass("opmAdvancedSettings"); //NO I18N
		$(".opmAdvancedSettingsContainer").css({width:"360px",left:advancedSettingsSlider-360}); //NO I18N
		nfa_loadCollectorKey();
		OPMClient.ApplicationController.set("installationKeyToShow",opm_mask(OPMClient.ApplicationController.nfaCollectorKey,4,4)); //NO I18N
	});
}

function nfa_loadCollectorKey() {
	if(window.OPM.isDemoUser) {
		OPMClient.ApplicationController.set("nfaCollectorKey", "1234CollectorInstallationKey5678"); //NO I18N
		return;
	}
	if(window.OPM.userPermissions.generalSettingsWrite) {
		var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaee/getPIKeyDetails"); //NO I18N
		OPMClient.ApplicationController.set("nfaCollectorKey",response.installKey); //NO I18N
	}
}

//============== NFA_DE Related Methods Ends =====================

function getMonthNames() {
	var months=[
		"webclient.general.january","webclient.general.february","webclient.general.march", //No I18N
		"webclient.general.april","webclient.general.may","webclient.general.june", //No I18N
		"webclient.general.july","webclient.general.august","webclient.general.september", //No I18N
		"webclient.general.october","webclient.general.november","webclient.general.december" //No I18N
	];
	return months;
}

function loadNFATimeZone(divName) {
	var tzoneList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/nfaadmin/getCurrentTimeZone"); //NO I18N
	$.each(tzoneList.tzList,function(index,zone){
		$('#'+divName).append('<option value="'+zone+'">'+zone+'</option>');
	});
	$("#"+divName).val(tzoneList.tZone).prop("selected",true); //NO I18N
	$("#"+divName+".select2").select2(); //NO I18N
}

function redirectToNFAGroupSettings(groupName) {
	if(groupName == undefined) {
		switch(OPMClient.Inventory.getGroupsSelectedFilterVal()){
			case 'IPGroups' : groupName = 'IP'; break; //No I18N
			case 'InterfaceGroups' : groupName = 'Interface'; break; //No I18N
			case 'AccessPointGroups' : groupName = 'AccessPoint'; break; //No I18N
			case 'SSIDGroups' : groupName = 'SSID'; break; //No I18N	
		}
	}
	location.href = window.OPM.apiclientUrl+'Settings/NetflowConfig/Groups/'+groupName+'/Add';	//No I18N
}

function redirectToNFASnapshotFromAlarm(type,devName,collOpt, page) {
	if(OPMClient.ApplicationController.isNFACentralServer) {
		nfa_setCollectorID(collOpt);
		$(".AllColCombo").val(collOpt);
	}
	location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+type+"/"+devName;	//No I18N
}
/* for service policy actions */
function redirectToServicePolicy(type,devName,page) {
	if(page !== undefined && page !== "") {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+type+"/"+devName+"/ListServicePolicy/"+page;	//No I18N
	}
	else {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+type+"/"+devName+"/ListServicePolicy";	//No I18N
	}
}

/* for acl actions */
function redirectToACL(type,devName,page) {
	if(page !== undefined && page !== "") {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+type+"/"+devName+"/ListACL/"+page;	//No I18N
	}
	else {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+type+"/"+devName+"/ListACL";	//No I18N
	}
}
function redirectToNFADeviceSnapshot(devname) {
	if(!OPMClient.ApplicationController.isCentralServer) {
		if(window.isserver) {
			//setCombo('withOutAll');//No I18n
			OPMClient.InventoryDeviceDetailsController.nfaDeviceID=undefined;
		}
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/FlowDevice/"+devname; //No I18N
	}
}

function redirectToNFASnapshot(devname, snapType) {
	//if(!OPMClient.ApplicationController.isCentralServer){
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+((snapType != undefined) ? snapType : "FlowInterface")+"/"+devname; //No I18N
	//}
}

function getEndTimeWithTimeZone(formData) {
	var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getCurrentTime",formData); //NO I18N
	var end = new Date();
	if(jsonData.error===undefined) {
		end.setHours(jsonData.HOUR_OF_DAY);
		end.setMinutes(jsonData.MINUTE);
		end.setFullYear(jsonData.YEAR);
		end.setDate(jsonData.DAY_OF_MONTH);
		end.setMonth(jsonData.MONTH);
	}else { 
		showMessage(jsonData);
	}
	return end;
}

function modifySchReportLink(rowObject) {
	var pdfURL = rowObject;
	window.open(pdfURL);
	return false;
}

function nfa_interfaceUtilBarFormatter(cellvalue, options, rowObject){
	if(rowObject.isVPCInterface === true){
		return "-"; //NO I18N
	}else{
		var props = nfa_getUtilProps(htmlEncode(cellvalue),70);
		return "<div nowrap style='float:left;white-space:nowrap;'><div style='float:left;padding-top:0px;background-color:#e4e2e5;width:70px;'><div class='"+props.severity+"' style='"+props.fgWidth+"height:20px;float:left;'></div></div><span nowrap style='float:left'>&nbsp;"+props.label+"</span></div>"; //NO I18N
	}
}

function nfaUtilBarFormatter(cellValue,options,rowdata,action) {
	var props = nfa_getUtilProps(htmlEncode(cellValue),70);
	var renderString = "<div nowrap style='float:left;white-space:nowrap;'><div style='float:left;padding-top:0px;background-color:#e4e2e5;width:70px;'><div class='"+props.severity+"' style='"+props.fgWidth+"height:20px;float:left;'></div></div><span nowrap style='float:left'>&nbsp;"+props.label+"</span></div>"; //NO I18N
	return renderString;
}

function nfa_getUtilProps(value,bgWidth) {
	var props={};
	if(value>100) {
		value = 100;
		props.label = ">100 %"; //NO I18N
	}else {
		props.label = value+" %"; //NO I18N
	}

	if(value>0 && value<=25) {
		props.severity = "severity_5"; //NO I18N
	}else if(value>25 && value<=50) {
		props.severity = "severity_2"; //NO I18N
	}else if(value>50 && value<=75) {
		props.severity = "severity_4"; //NO I18N
	}else if(value<=100){
		props.severity = "severity_1"; //NO I18N
	}else {
		props.severity = "severity_7"; //NO I18N
	}
	props.fgWidth = "width:"+Math.round((value*bgWidth)/100)+"px;"; //NO I18N

	return props;
}

function nfa_validatePort(input) {
    var num = +input;
    return num >= 1 && num <= 65535 && input === num.toString();
}
function checkNFADeviceCount()
{
	if(!window.OPM.isNFA || window.isserver) {
		return;
	}

	$.ajax({
		url: window.OPM.apiUrlPattern + '/nfadevice/getDeviceCount', //No I18N
		type: 'GET', //No I18N
		success: function(response) {
			if(response.intfcount == 0 && response.intfGrpcount == 0 && response.ipGrpcount == 0 && response.wlccount == 0) {
				$('#main').hide();
				$("#installinfoDiv").removeClass('fullMsgDiv'); //NO I18N
				$('#noDeviceMsg').show();
				$("#nfaport").text(response.LISTENER_PORT);
			}else {
				showMainDiv();
			}
		}
	});
}
function showMainDiv()
{
	$("#installinfoDiv").addClass('fullMsgDiv'); //NO I18N
	$('#main').show();
	$('#noDeviceMsg').hide();
}

function nfa_loadInvDeviceTree(routerID,subgridTableId,cloudInterface) {
	var formData = {TimeFrame:OPMClient.InventoryNFAController.timeFrame,DeviceID:routerID};
	if(window.OPM.isCentralServer && !cloudInterface) {
		formData.eeProbeID = nfa_getOPMEEProbeID(routerID);
	}else if(window.OPM.isMSPAllCustomerOrAllProbeSelected) {
		nfa_setMSPCustomerIDRegionID(routerID);
	}
	$.ajax({
		url: window.OPM.apiUrlPattern+"/nfadevice/getIndexInterfaceData", //NO I18N
		data: formData,
		dataType:"json", //NO I18N
		type:"GET", //NO I18N
		async:false,
		success: function(response) {
			if(response.error !== undefined && response.error.probeURL !== undefined) {
				opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.probe.unable.to.connect")+" : <a href='"+response.error.probeURL+"' target='_blank'>"+response.error.probeURL+"</a>"); //NO I18N
			}
			var gridData = [];
			if(response.data !== undefined) {
				gridData = response.data;
			}
			var colNamesList = ["",Ember.I18n.t("jsp.commonstr.Status"),Ember.I18n.t("opu.views.TYPE"),Ember.I18n.t("NFAWidget.intfName"),Ember.I18n.t("nfa.units.in.percentage"),Ember.I18n.t("nfa.units.out.percentage"),Ember.I18n.t("nfa.units.in.speed"), Ember.I18n.t("nfa.units.out.speed"),Ember.I18n.t("webclient.map.flash.DeleteConfirmDialog"),"","","","","","",""]; //NO I18N
			var colModelList = [
				{ name:"ID",		index:"ID",			hidden:true}, //No I18N
				{ name:"Status",	index:"Status",		classes:"pointer", width:17, formatter:nfa_interfaceStatusFormatter}, //NO I18N
				{ name:"intfType",	index:"intfType",	classes:"pointer", width:12, formatter:nfa_interfaceTypeFormatter,	hidden: cloudInterface}, //NO I18N
				{ name:"Name",		index:"Name",		classes:"pointer", width:35, sortable:true, sorttype:"string",	formatter:jqGridHTMLEncode}, //NO I18N
				{ name:"UtilIN",	index:"UtilIN",		classes:"pointer", width:30, sortable:true, sorttype:"number",	formatter:nfa_interfaceUtilBarFormatter, hidden: cloudInterface}, //NO I18N
				{ name:"UtilOUT",	index:"UtilOUT",	classes:"pointer", width:30, sortable:true, sorttype:"number",	formatter:nfa_interfaceUtilBarFormatter, hidden: cloudInterface}, //NO I18N
				{ name:"IN",		index:"IN",			classes:"pointer", width:20, sorttype:nfa_customSort}, //NO I18N
				{ name:"OUT",		index:"OUT",		classes:"pointer", width:20, sorttype:nfa_customSort}, //NO I18N
				{ name:"alert",		index:"alert",		classes:"pointer", width:12, sortable:true, sorttype:"number", hidden: cloudInterface}, //NO I18N
				{ name:"RouterID",	index:"RouterID",	hidden:true}, //NO I18N
				{ name:"state",		index:"state",		hidden:true}, //NO I18N
				{ name:"statuscode",index:"statuscode",	hidden:true}, //NO I18N
				{ name:"routerType",index:"routerType",	hidden:true}, //NO I18N
				{ name:"isVPCInterface",index:"isVPCInterface",	hidden:true}, //NO I18N
				{ name:"lastContactTime",index:"lastContactTime",hidden:true}, //NO I18N
				{ name:"Type",		index:"Type",		hidden:true} //NO I18N
			];
			var defaultOptions = {minRowsPerPage:gridData.length,pagination:false};
			defaultOptions.gridCallBack = nfa_getInvListSubGridCallBack();
			opm_loadJQgridWithData("#"+subgridTableId,gridData,colNamesList,colModelList,"","","search_nfa_interfaces",defaultOptions); //NO I18N
			nfa_setInvListTimeInfo(response);
			if(window.OPM.isMSPAllCustomerOrAllProbeSelected) {
				nfa_setMSPCustomerIDRegionID();
			}
		}
	});
}

function loadNFAWlcDeviceTree(routerID,subgridTableId) {
	var formData = {RouterID:routerID,TimeFrame:OPMClient.InventoryNFAController.timeFrame};
	var onSelectFunction = "nfa_wlc_AccessPoint"; //NO I18N
	if(nfa_getInvSubFilterKey()==="AccessPointGroups"){ //NO I18N
		formData.isApGrp=true;
		if(!window.OPM.isAuthorized){onSelectFunction="";} //NO I18N
	}
	if(window.OPM.isCentralServer) {
		formData.eeProbeID = nfa_getOPMEEProbeID(routerID);
	}else if(window.OPM.isMSPAllCustomerOrAllProbeSelected) {
		nfa_setMSPCustomerIDRegionID(routerID);
	}
	$.ajax({
		url: window.OPM.apiUrlPattern+"/nfadevice/listApMacIcons", //NO I18N
		data:formData,
		dataType:"json", //NO I18N
		type:"GET", //NO I18N
		async:false,
		success: function(response) {
			if(response.error !== undefined && response.error.probeURL !== undefined) {
				opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.probe.unable.to.connect")+" : <a href='"+response.error.probeURL+"' target='_blank'>"+response.error.probeURL+"</a>"); //NO I18N
			}
			var gridData = [];
			if(response.ICONList !== undefined) {
				gridData = response.ICONList
			}
			
			var colNamesList = ["",Ember.I18n.t("jsp.commonstr.Status"),Ember.I18n.t("webclinet.inventory.wlc.apmacname"),Ember.I18n.t("webclinet.inventory.wlc.apmac"),Ember.I18n.t("webclient.IN.Traffic"),Ember.I18n.t("webclient.OUT.Traffic"),Ember.I18n.t("nfa.units.in.speed"),Ember.I18n.t("nfa.units.out.speed"),Ember.I18n.t("webclient.map.flash.DeleteConfirmDialog"),"","","",""]; //NO I18N
			var colModelList = [
				{ name:"ID",		index:"ID",			hidden:true}, //NO I18N
				{ name:"Status",	index:"Status",		classes:"pointer",	width:17, formatter: nfa_interfaceStatusFormatter}, //NO I18N
				{ name:"Name",		index:"Name",		classes:"pointer",	width:60, sorttype:"string",formatter: jqGridHTMLEncode}, //NO I18N
				{ name:"apmac",		index:"apmac",		classes:"pointer",	width:30, sorttype:"string"}, //NO I18N
				{ name:"inTraffic",	index:"inTraffic",	classes:"pointer",	width:25, sorttype:nfa_customSort}, //NO I18N
				{ name:"outTraffic",index:"outTraffic",	classes:"pointer",	width:25, sorttype:nfa_customSort}, //NO I18N
				{ name:"inSpeed",	index:"inSpeed",	classes:"pointer",	width:20, sorttype:nfa_customSort}, //NO I18N
				{ name:"outSpeed",	index:"outSpeed",	classes:"pointer",	width:20, sorttype:nfa_customSort}, //NO I18N
				{ name:"alert",		index:"alert",		classes:"pointer",	width:18, sorttype:"number"}, //NO I18N
				{ name:"RouterID",	index:"RouterID",	hidden:true}, //NO I18N
				{ name:"state",		index:"state",		hidden:true}, //NO I18N
				{ name:"statuscode",index:"statuscode",	hidden:true}, //NO I18N
				{ name:"lastContactTime",index:"lastContactTime",hidden:true} //NO I18N
			];
			var defaultOptions={minRowsPerPage:gridData.length,pagination:false};
			defaultOptions.gridCallBack = nfa_getInvListSubGridCallBack();
			opm_loadJQgridWithData("#"+subgridTableId,gridData,colNamesList,colModelList,"","",onSelectFunction,defaultOptions); //NO I18N
			nfa_setInvListTimeInfo(response);
			if(window.OPM.isMSPAllCustomerOrAllProbeSelected) {
				nfa_setMSPCustomerIDRegionID();
			}
		}
	});
}

function nfa_getInvListSubGridCallBack() {
	var callBckFunc = function(subGridID){
		var divID = subGridID.substring(0,subGridID.length-2);
		var colspan = $("#"+divID).parent().attr("colspan"); //NO I18N
		$("#"+divID).parent().attr("colspan",(Number(colspan)+1)); //NO I18N
		$("#"+subGridID).setGridWidth($("#opm_devListHolder").width()-100); //NO I18N
	};
	return callBckFunc;
}

function getNFACustomPagerDetails(widgetData,returnWhat) {
	var customPagerObj = {};
	if(widgetData.nfaCustomPagerDetails == undefined) {
		widgetData.nfaCustomPagerDetails = customPagerObj;
		customPagerObj.pageCount =  1;
		customPagerObj.rows =  50;
	}else {
		customPagerObj = widgetData.nfaCustomPagerDetails;
	}
	if(returnWhat==="pageCount") { //NO I18N
		return customPagerObj.pageCount;
	}else if(returnWhat==="rows") { //NO I18N
		return customPagerObj.rows;
	}
	customPagerObj.showPager = true;
	customPagerObj.rowList = [50,100,500,1000,5000];
	customPagerObj.previousPage = (customPagerObj.pageCount > 1)?"":"iconDisabled"; //NO I18N
	customPagerObj.nextPage = (widgetData.apiData!==undefined && widgetData.apiData.nextPage!==undefined && widgetData.apiData.nextPage)?"":"iconDisabled"; //NO I18N
	return customPagerObj;
}

function nfa_getInvTimeFrameValue() {
	return (OPMClient.InventoryDeviceDetailsController.expandSnapWidget && OPMClient.FWAGlobalDataController.expandtimePeriod) ? OPMClient.FWAGlobalDataController.expandtimePeriod : OPMClient.FWAGlobalDataController.timePeriod;
}

function nfa_getInvTimeFrameString() {
	return nfa_getTimeFrameString(nfa_getInvTimeFrameValue());
}

function nfa_getReporstHeaderInfo(reportType,headerDetails) {
	var headerDetails=(headerDetails!=undefined)?headerDetails:{};
	switch(reportType) {
		case 'SearchReport'			: 	headerDetails.timeFrameString = $('#time :selected').text(); //No I18N
										var sourceType = $('#sourcetype').val(); //No I18N
										if(sourceType == "2") { //NO I18N
											headerDetails.title1 = "NFAWidget.ifgName"; //NO I18N
											headerDetails.value1 = $('#intfgroup :selected').text(); //NO I18N
										}else if(sourceType == "3") { //NO I18N
											headerDetails.title1 = "webclient.settings.ip.grp.name"; //NO I18N
											headerDetails.value1 = $('#ipgroup :selected').text(); //NO I18N
										}else{
											headerDetails.reportSubTitle = $('#sourcetype :selected').text(); //No I18N
										}
										break;
		case 'ReportProfiles'		: 	headerDetails.reportTitle = Ember.I18n.t('webclient.nfa.reportprofiles'); //No I18N
										headerDetails.reportSubTitle = $('.reportGraph.netflowReportGraph > header h2 span.active').text(); //No I18N
										headerDetails.timeFrameString = OPMClient.ReportsDetailsController.timeFrameString;
										break;
		case 'billingOnDemand' 		: //NO I18N								 
		case 'billingReport' 		: //NO I18N
										headerDetails.reportTitle = Ember.I18n.t('webclient.billing.reports'); //No I18N
										if(reportType == "billingOnDemand") {
											headerDetails.reportSubTitle = Ember.I18n.t("webclient.billing.ondemand"); //No I18N
										}
										headerDetails.title1 = "webclient.billing.billplanname"; //No I18N
										headerDetails.value1 = (reportType == "billingReport") ? $('#billName').text() : OPMClient.NFAReportsController.billData.name; //No I18N
										headerDetails.title2 = "webclient.nfa.billing.basedOn"; //No I18N
										headerDetails.value2 = $('#billType').text();
										headerDetails.title3 = "webclient.nfa.billing.intfOrGroup.name"; //No I18N
										headerDetails.value3 = (reportType == "billingReport") ? $('#devName').text() : OPMClient.NFAReportsController.billData.dev; //No I18N

										headerDetails.billPeriodValue = $('#devRepTime').text();
										headerDetails.reportTimeValue = $('#lastRepTime').text();

										headerDetails.baseCostValue = $('#basetxt').text();
										headerDetails.dataTransTitle = $("#billedValueLabel").text(); //NO I18N
										headerDetails.dataTransValue = $('#devPerc').text();
										headerDetails.addCostValue = $('#addtxt').text();
										headerDetails.usageCostValue = OPMClient.NFAReportsController.billData.usageCost;
										
										if(OPMClient.NFAReportsController.billData.taxList != undefined){
											var taxList = OPMClient.NFAReportsController.billData.taxList;
											for(var i=1; i<=taxList.length; i++){
												headerDetails["taxTitle"+i] = taxList[i-1].taxName; //NO I18N
												headerDetails["taxValue"+i] = taxList[i-1].taxValue; //NO I18N
											}	
										}
										
										headerDetails.totalCost = OPMClient.NFAReportsController.billData.totalCost;
										headerDetails.reportType = reportType;
										break; 
	}
	if($('#graphdivelement .viewIcon i.active').data('key') != undefined){
		headerDetails.grapPlotType = $('#graphdivelement .viewIcon i.active').data('key'); //NO I18N
	}
	switch(Number(headerDetails.sourceType)) {
		case 1	: 	headerDetails.title1 = "NFAWidget.Devname"; //NO I18N
					headerDetails.value1 = $('#device :selected').text(); //NO I18N
					headerDetails.title2 = "jsp.commonstr.IpAddress"; //NO I18N
					headerDetails.value2 = $('#device :selected').data('routerip'); //NO I18N
					headerDetails.title3 = "webclient.map.interfaceName"; //NO I18N
					headerDetails.value3 = $('#interface :selected').text(); //NO I18N
					break;
		case 2	: 	headerDetails.title1 = "NFAWidget.ifgName"; //NO I18N
					headerDetails.value1 = $('#intfgroup :selected').text(); //NO I18N
					break;
		case 3	: 	headerDetails.title1 = "webclient.settings.ip.grp.name"; //NO I18N
					headerDetails.value1 = $('#ipgroup :selected').text(); //NO I18N
					break;
		case 4	: 	headerDetails.title1 = "webclinet.inventory.wlc.controllername"; //NO I18N
					headerDetails.value1 = $('#device :selected').text(); //NO I18N
					headerDetails.title2 = "jsp.commonstr.IpAddress"; //NO I18N
					headerDetails.value2 = $('#device :selected').data('routerip'); //NO I18N
					headerDetails.title3 = "webclinet.inventory.wlc.apmacname"; //NO I18N
					headerDetails.value3 = $('#interface :selected').text(); //NO I18N
					headerDetails.title4 = "opu.views.MAC_ADDRESS"; //NO I18N
					headerDetails.value4 = $('#interface :selected').data('apmac'); //NO I18N
					break;
		case 5	: 	headerDetails.title1 = "webclient.nfa.accessPointGrpName"; //NO I18N
					headerDetails.value1 = $('#apgroup :selected').text(); //NO I18N
					break;
		case 6	: 	headerDetails.title1 = "webclient.nfa.ssidGrp.name"; //NO I18N
					headerDetails.value1 = $('#ssidGroup :selected').text(); //NO I18N
					break;
		case 15	: 	headerDetails.title1 = "nfa.region.name"; //NO I18N
					headerDetails.value1 = $('#device :selected').text(); //NO I18N
					headerDetails.title2 = "nfa.cloudInterface.name"; //NO I18N
					headerDetails.value2 = $('#interface :selected').text(); //NO I18N
					break;
	}
	return headerDetails;
}

function nfa_spliteQosNameAndID(qosString) {
	var qosObj = {};
	var splitArr = qosString.split('_');
	qosObj.deviceID = splitArr.pop();
	qosObj.name = splitArr.join('_');
	return qosObj;
}

function nfa_isValidName(testName,restrictedChars) {
	restrictedChars = (restrictedChars !== undefined)?restrictedChars:'~!@#$%^&*()+=-[]\\\';,./{}|\":<>?`'; //No I18N
	for (var i = 0; i < testName.length; i++) {
		if (restrictedChars.indexOf(testName.charAt(i))!=-1) {
			return false;
		}
	}
	return true;
}

function nfa_postAjaxResponseWithAsync(apiURL,formData,callBckFunc,callBckParams,message) {
	var uniqueID;
	$.ajax({
		url: apiURL,
		data: formData,
		type: "POST", //NO I18N
		dataType: "json", //NO I18N
		async:true,
		beforeSend: function(XMLHttpRequest,settings) {
			if(message != undefined){
				uniqueID = opm_infoMsgs("infoMsg", message); //NO I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(jsonData) {
			if(message != undefined){
				$("#"+uniqueID).remove(); //NO I18N
			}
			callBckFunc(jsonData,callBckParams);
		}
	});
}

function nfa_getAjaxResponse(apiURL,formData) {
	var responseObj = {};
	$.ajax({
		url: apiURL,
		data: formData,
		type: 'GET', //No I18N
		dataType: 'json', //No I18n
		async:false,
		beforeSend: function(XMLHttpRequest,settings) {
  			appendCollectorDetails(XMLHttpRequest, settings);
  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
  		},
		success: function(jsonData) {
			if(jsonData !== null) {
				responseObj = jsonData;
			}
		}
	});
	return responseObj;
}

function nfa_redirectToGeoLocation() {
	if(window.isserver) {
		nfa_changeColOpt();
	}
	inventoryGlobalRoute.transitionTo("Settings.NetflowConfig.Basic.Geolocation"); //NO I18N
}

function nfa_convertMillisToMinutes(milliSeconds) {
  var minutes = Math.floor(milliSeconds / 60000);
  var seconds = ((milliSeconds % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds; //No I18N
}

function nfa_menuAlignmentHandler(menuAlignment) {
	if(!window.OPM.oldView && menuAlignment == "horizontal") { //No I18N
		if(JSON.parse(localStorage.getItem('FlowAnalysis')) !== null) { //No I18N
			viewTab = JSON.parse(localStorage.getItem('FlowAnalysis')); //No I18N
			if(["WLC","Attacks"].contains(viewTab.selSub)) { //No I18N
				viewTab.selSub = "Devices"; //No I18N 
			}
			localStorage.setItem('FlowAnalysis',JSON.stringify(viewTab)); //No I18N
			updateLocalStorageToDB('FlowAnalysis', viewTab); //NO I18N
		}
	}
	if(window.OPM.currentView.name !== undefined) {
		var paramsArr = window.OPM.currentView.name.split('.'); //No I18N
		if(['FlowAnalysis','WlcAnalysis','AttacksAnalysis'].contains(paramsArr[2])) { //No I18N
			window.location.href = window.OPM.apiclientUrl+"Inventory/List/FlowAnalysis/Devices"; //No I18N
		}else if(paramsArr[0] === "ReportsSummary") { //No I18N
			window.location.href = getV3PageURL('reports/netflow/search'); //No I18N
		}else if(paramsArr[0] === "SettingsSummary") { //No I18N
			window.location.href = window.OPM.apiclientUrl+((window.OPM.isAuthorized)?"Settings/Basic/Mail":"Settings/NetflowConfig/Basic/Timezone"); //No I18N
		}
	}
}

function nfa_getSchedulerReportInfo(formData) {
	formData.reportType = $("#scheduleFrequency > div.active").attr("value"); //NO I18N
	formData.startInHrs = $("#"+formData.reportType+"Hour").val(); //NO I18N
	formData.startInMin = $("#"+formData.reportType+"Minutes").val(); //NO I18N
	switch(formData.reportType){
		case "once"		: 	formData.reportDate = $("#onceDate").val(); break; //NO I18N
		case "hourly"	: 	formData.unitValue = $("#hourlyInterval").val(); break; //NO I18N
		case "weekly"	: 	formData.reportDay = nfa_getCheckedBoxesVal("weeklyDays"); break; //NO I18N
		case "monthly"	: 	formData.reportWeekDay = $("#monthlyDates").val(); //NO I18N
							formData.reportMonth = nfa_getCheckedBoxesVal("monthlyMonths"); break; //NO I18N
	}
	return formData;
}

function nfa_checkCheckBoxes(name,valueList) {
    for (var i=0;i<valueList.length;i++) {
        $("input[name='"+name+"'][value='"+valueList[i]+"']").prop("checked",true); //NO I18N
    }
}

function nfa_getCheckedBoxesVal(inputName) {
	return $.map($('input[name="'+inputName+'"]:checked'),function(a){return $(a).val();}).join(","); //NO I18N
}

function nfa_ValidateScheduleTime(scheduleTime) {
	var currentTime = getEndTimeWithTimeZone();
	currentTime = new Date(currentTime).getTime();
	scheduleTime = new Date(scheduleTime).getTime();
	return (scheduleTime > currentTime);
}

function nfa_isEmptyObject(obj) {
	return (obj == null || obj == undefined || obj === ""); //NO I18N
}

function nfa_getAjaxResponseWithAsync(apiURL,formData,callBckFunc,callBckParams,message) {
	$.ajax({
		url:apiURL,
		data:formData, //NO I18N
		type:"GET", //NO I18N
		dataType:"json", //NO I18N
		async:true,
		uniqueID:"", //NO I18N
		beforeSend: function(XMLHttpRequest,settings) {
			if(message!==undefined){
				this.uniqueID=opm_infoMsgs("infoMsg",message); //NO I18N
			}
			appendCollectorDetails(XMLHttpRequest,settings);
		},
		success: function(jsonData) {
			if(message!==undefined) {
				$("#"+this.uniqueID).remove(); //NO I18N
			}
			callBckFunc(jsonData,callBckParams);
		}
	});
}

function nfa_getModelForIntfMultiSelect(self){
	var response = jQuery.extend(true,[],self.get("deviceList")); //No I18N
	var routerObj = {};
	var deviceList = [],totalAvailIntfCount = 0,totalSelIntfCount = 0;
	for(var i=0;i<response.length;i++) {
		routerObj.className = "chkParentChild"; //No I18N
		routerObj.routerId = "router_"+i; //No I18N
		routerObj.intfLstId = "intfLst_"+i; //No I18N

		if(self.isCustomModel) {
			routerObj.displayName = response[i].name;
			routerObj.intfList = response[i].childList;
			routerObj.rID = response[i].id;
		}else if(self.isWLC){
			routerObj.displayName = response[i].RouterName;
			routerObj.intfList = response[i].ApMacList;
			routerObj.rID = (response[i].rID === undefined ? "" : response[i].rID); //NO I18N
		}else {
			routerObj.displayName = response[i].rName;
			routerObj.intfList = response[i].Interface;
			routerObj.rID = (response[i].rID === undefined ? "" : response[i].rID); //NO I18N
		}
		routerObj = nfa_changeIntfListCheckedVal(routerObj,self.selInterfaceList);

		deviceList[i] = routerObj;
		totalAvailIntfCount +=  routerObj.intfList.length;
		totalSelIntfCount += routerObj.selectedIntfCount;
		routerObj ={};
	}
	if(deviceList[0] !== undefined){
		deviceList[0].className += " active"; //NO I18N
	}
	self.set("totalAvailIntfCount",totalAvailIntfCount); //NO I18N
	self.set("totalSelIntfCount",totalSelIntfCount); //NO I18N
	self.set("availInterfaceList",deviceList); //NO I18N
}

function nfa_changeIntfListCheckedVal(routerObj,selInterfaceList) {
	routerObj.selectedIntfCount = 0;
	for(var i=0;i<routerObj.intfList.length;i++){
		if(selInterfaceList.contains(routerObj.intfList[i][0])) {
			routerObj.selectedIntfCount++;
			routerObj.intfList[i].push("checked"); //No I18N
		}else{
			routerObj.intfList[i].push(""); //No I18N
		}
	}
	routerObj.allIntfSelected = (routerObj.selectedIntfCount == routerObj.intfList.length)?"checked":""; //No I18N
	return routerObj;
}

function nfa_getSelect2List(list,valueKey,value) {
	if(value !== undefined){
		for(var i=0;i<list.length;i++){
			list[i].selected = (list[i][valueKey] == value)?"selected":"";
		}
	}
	return list;
}

function nfa_getActiveList(list,valueKey,value) {
	for(var i=0;i<list.length;i++){
		list[i].className = (list[i][valueKey]===value)?"active":""; //NO I18N
	}
	return list;
}

function nfa_getCheckedList(list,valueKey,value) {
	for(var i=0;i<list.length;i++){
		list[i].checked = (list[i][valueKey]==value)?"checked":""; //NO I18N
	}
	return list;
}

function nfa_getSelectedCheckBoxAsString(tableID, requiredCellValue){
	var selectedRowIDs = $("#"+tableID).jqGrid("getGridParam", "selarrrow"); //NO I18N
	var value = "";
	for(var i=0; i<selectedRowIDs.length; i++) {
		value = value + $("#"+tableID).jqGrid("getCell", selectedRowIDs[i], requiredCellValue);//NO I18N
		if(i !== (selectedRowIDs.length - 1)) {
			value = value +","; //NO I18N
		}
	}
	return value;
}

function nfa_getSelectedCheckBoxAsArray(tableID, requiredCellValue){
	var selectedRowIDs = $("#"+tableID).jqGrid("getGridParam", "selarrrow"); //NO I18N
	var value = [];
	for(var i=0; i<selectedRowIDs.length; i++) {
		value.push($("#"+tableID).jqGrid("getCell", selectedRowIDs[i], requiredCellValue)); //NO I18N
	}
	return value;
}

function nfa_loadJqGridWithAjax(gridTable,apiURL,colNamesList,colModelList,captionTitle,gridPager,onSelectFunction,defaultOptions) {
	defaultOptions = (defaultOptions)?defaultOptions:{};

	var grid = $(gridTable);
	var rowList = [10,25,50,100,500,1000];
	var minRowsPerPage = 10;
	var rowNumNeeded = false;
	var searchOption = false;
	var toggleSearch = false;
	var loadonce = false;
	var defaultSortName = "STARTON"; //NO I18N
	var defaultSortOrder = "desc"; //NO I18N
	var formData = {};

	if(defaultOptions.searchOption!==undefined) {
		searchOption = defaultOptions.searchOption;
		colNamesList.push(""); //NO I18N
		colModelList.push({index:"searchIndex",name:"searchIndex",width:40,search:false,sortable:false,hidedlg:true,hidden:true}); //NO I18N
	}
	if(defaultOptions.formData!==undefined) {
		formData = defaultOptions.formData;
	}
	if(defaultOptions.sortName!==undefined) {
		defaultSortName = defaultOptions.sortName;
	}
	if(defaultOptions.rowNumNeeded!==undefined) {
		rowNumNeeded = defaultOptions.rowNumNeeded;
	}
	if(defaultOptions.sortOrder!==undefined) {
		defaultSortOrder = defaultOptions.sortOrder;
	}
	if(defaultOptions.loadonce!==undefined) {
		loadonce = defaultOptions.loadonce;
	}

	grid.jqGrid({
		url 		: apiURL,
		mtype 		: "GET", //NO I18N
		datatype 	: "json", //NO I18N
		postData 	: formData,
		colNames 	: escapeGridColumnNames(colNamesList), 
		colModel 	: colModelList,
		prmNames	: {totalrows:null},
		loadonce 	: loadonce,
		viewrecords	: true,
		gridview 	: true,
		multiselect	: false,
		autowidth 	: true,
		shrinkToFit	: true,
		hidegrid 	: false,
		ignoreCase	: true,
		pager 		: gridPager,
		rowList 	: rowList,
		rownumbers 	: rowNumNeeded,
		rowNum 		: minRowsPerPage,
		rownumWidth	: 25,
		caption 	: captionTitle,
		sortorder 	: defaultSortOrder,
		sortname 	: defaultSortName,
		height 		: "auto", //NO I18N
		jsonReader 	: {root:"data",page:"page",total:"total",records:"records",repeatitems:false}, //NO I18N
		beforeProcessing:function() {
		},
		beforeRequest:function() {
		},
		loadBeforeSend:function(xhr,settings) {
			appendCollectorDetails(xhr,settings)
		},
		loadComplete:function(data) {
			if(defaultOptions.gridCallBack!==undefined) {
				defaultOptions.gridCallBack();
			}
		},
		onSortCol:function(colIndexName,colIndex,sortOrder) {
		},
		onCellSelect:function(rowID,colIndex,colContent,e) {
			var colModel = grid.jqGrid("getGridParam","colModel"); //NO I18N
			var rowData = grid.jqGrid("getRowData",rowID); //NO I18N
			OPMClient.SettingsNFAConfigController.gridRowData = rowData;
			switch(onSelectFunction) {
				case "asViewEdit": //NO I18N
					if(colModel[colIndex].name!=="ipdetails" && colModel[colIndex].name!=="actions") { //NO I18N
						opm_transitionToParentRoute("Settings.NetflowConfig.Map.AsView.Operation","Edit"); //NO I18N
					}
					break;
				case "nbaAlarmEventList": //NO I18N
					if(colModel[colIndex].name==="EVENT_MESSAGE") { //NO I18N
						var callBckFunc = function(response) {
							if(response!==undefined) {
								if(response.error!==undefined) {
									showMessage(response);
								}else if(response.isExist) {
									redirectToSnapshot("FlowAttacks", rowData.EVID); //NO I18N
								}else {
									opm_infoMsgs("infoMsg", response.message); //NO I18N
								}
							}
						};
						nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nbaEventReport/eventExist", {evid:rowData.EVID}, callBckFunc); //NO I18N
					}
					break;
			}
		},
		onSelectRow:function(rowID,status,e) {
		}
	});

	if(searchOption) {
		grid.jqGrid("filterToolbar",{stringResult:true, searchOnEnter:false, defaultSearch:"cn", groupOp:"OR"}); //NO I18N
		grid[0].toggleToolbar();
		$(".ui-search-toolbar").show(); //NO I18N
		if(toggleSearch) {
			$(gridTable+"_searchIndex").show(); //NO I18N
			$(gridTable+"_searchIndex").css({"width":"40px","position":"absolute","right":"0","top":"0","left":"auto","height":"36px"}); //NO I18N

			if($(gridTable+"_searchIndex>div .jqSearchIcon").length===0 && !toggleSearch) { //NO I18N
				$(gridTable+"_searchIndex>div").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ncmToggleSearch(true,\''+(gridTable.replace("#", "#gview_"))+'\')" class="icon-search devsearchicon"></i></div>'); //NO I18N
			}else if($(gridTable+"_searchIndex>div .jqSearchIcon").length===0) { //NO I18N
				$(gridTable+"_searchIndex>div").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ncmToggleSearch(false,\''+(gridTable.replace("#", "#gview_"))+'\')" class="icon-search devsearchicon"></i></div>'); //NO I18N
			}
		}
	}
}

function nfa_loadJQgridWithData(gridTable,jsonData,colNamesList,colModelList,captionTitle,gridNavigator,onSelectFunction,defaultOptions) {
	var defaultSortName = ""; //NO I18N
	var defaultSortOrder = "asc"; //NO I18N
	var rowNumNeeded = false;
	var minRowsPerPage = 50;
	var rowList = [10,25,50,100,500,1000];
	var subGrid = false;
	var multiselect = false;
	var headertitles = false;
	var searchOption = false;
	var toggleSearch = false;
	var grouping = false;
	var gridCallBack;
	if(defaultOptions!==undefined) {
		if(defaultOptions.grouping!==undefined) {
			grouping = defaultOptions.grouping;
		}
		if(defaultOptions.subGrid!==undefined) {
			subGrid = defaultOptions.subGrid;
		}
		if(defaultOptions.multiselect!==undefined) {
			multiselect = defaultOptions.multiselect;
		}
		if(defaultOptions.sortName!==undefined) {
			defaultSortName = defaultOptions.sortName;
		}
		if(defaultOptions.sortOrder!==undefined) {
			defaultSortOrder = defaultOptions.sortOrder;
		}
		if(defaultOptions.rowNumNeeded!==undefined) {
			rowNumNeeded = defaultOptions.rowNumNeeded;
		}
		if(defaultOptions.headertitles!==undefined) {
			headertitles=defaultOptions.headertitles
		}
		if(defaultOptions.gridCallBack!==undefined) {
			gridCallBack=defaultOptions.gridCallBack;
		}
		if(defaultOptions.minRowsPerPage!==undefined) {
			minRowsPerPage = defaultOptions.minRowsPerPage;
		}
		if(defaultOptions.rowList!==undefined) {
			rowList = defaultOptions.rowList;
		}
		if(defaultOptions.toggleSearch!==undefined) {
			toggleSearch = defaultOptions.toggleSearch;
		}
		if(defaultOptions.searchOption!==undefined) {
			searchOption = defaultOptions.searchOption;
			colNamesList.push(""); //NO I18N
			colModelList.push({index:"searchIndex",name:"searchIndex",width:40,search:false,sortable:false,hidedlg:true,hidden:true}); //NO I18N
		}
	}else {
		defaultOptions = {};
	}

	var grid = $(gridTable);
	var gridDivId = "#gbox_"; //NO I18N
	var gridTableIdAlone = gridTable.substring(1);
	gridDivId = gridDivId+gridTableIdAlone;
	var gridDiv = $(gridDivId);

	jsonData = (jsonData==undefined) ? [] : jsonData;
	if(gridDiv.length>0) {
		grid.jqGrid("clearGridData"); //NO I18N
		grid.jqGrid("setGridParam",{datatype:"jsonstring",datastr:jsonData}); //NO I18N
		grid.trigger("reloadGrid"); //NO I18N
	}else {

		grid.jqGrid({
			colNames: escapeGridColumnNames(colNamesList),
			colModel: colModelList,
			datatype: "jsonstring", //NO I18N
			prmNames:{totalrows:null},
			datastr: jsonData,
			loadOnce: true,
			autoencode: true,
			headertitles:headertitles,
			jsonReader: {root:function(obj){return obj;},repeatitems:false},
			rownumbers: rowNumNeeded,
			rowNum: minRowsPerPage,
			rowList:rowList,
			pager: gridNavigator,
			rownumWidth:25,
			viewrecords: true,
			caption: escapeHTML(captionTitle),
			height: "auto", //NO I18N
			autowidth: true,
			shrinkToFit: true,
			hidegrid: false,
			ignoreCase: true,
			subGrid:subGrid,
			multiselect:multiselect,
			sortable:true,
			sortname: defaultSortName,
			sortorder: defaultSortOrder,
			gridview:false,
			emptyrecords:Ember.I18n.t("webclient.jqgrid.no.data.found"), //NO I18N
			subGridOptions: {
				plusicon  : "ui-icon-triangle-1-e", //NO I18N
				minusicon : "ui-icon-triangle-1-s", //NO I18N
				openicon  : "ui-icon-arrowreturn-1-e", //NO I18N
				reloadOnExpand : false,
				selectOnExpand : true
			},
			grouping:grouping,
			groupingView:(defaultOptions.groupingView)?defaultOptions.groupingView:{},
			onSelectAll:function(rowIds,allChecked) {
			},
			subGridBeforeExpand:function(subgrid_id,row_id) {
				if(defaultOptions.lastExpandedRowID !== undefined) {
					grid.collapseSubGridRow(defaultOptions.lastExpandedRowID);
				}
			},
			subGridRowColapsed:function(subgrid_id,row_id) {
			},
			subGridRowExpanded:function(subgrid_id,row_id) {
				var subgrid_table_id = subgrid_id+"_t"; //NO I18N
				$("#"+subgrid_id).addClass("opm_jqGridUI"); //NO I18N
				var tableHtml ="<table id='"+subgrid_table_id+"'></table>"; //NO I18N
				$("#"+subgrid_id).html(tableHtml);
				var sub_grid_div = "#"+subgrid_table_id;

				// switch(defaultOptions.subGridFunction) {
				// 	case "nfaLicenseGrid": //NO I18N
				// 		var sub_grid_data = grid.jqGrid("getLocalRow",row_id).interfaceList; //NO I18N
				// 		defaultOptions.colNamesList[3] = Ember.I18n.t((grid.jqGrid("getLocalRow",row_id).isWlc) ? "webclient.general.accesspoints.tab":"NFAWidget.routVia"); //NO I18N
				// 		nfa_loadJQgridWithData(sub_grid_div, sub_grid_data, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "", {minRowsPerPage:sub_grid_data.length,pagination:false}); //NO I18N
				// 		break;
				// 	case "nbaLicenseGrid": //NO I18N
				// 		var sub_grid_data = grid.jqGrid("getLocalRow",row_id).interfaceList; //NO I18N
				// 		nfa_loadJQgridWithData(sub_grid_div, sub_grid_data, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "", {minRowsPerPage:sub_grid_data.length,pagination:false}); //NO I18N
				// 		break;
				// 	case "nbaThresholdGrid": //NO I18N
				// 		var sub_grid_data = grid.jqGrid("getLocalRow",row_id).childList; //NO I18N
				// 		nfa_loadJQgridWithData(sub_grid_div, sub_grid_data, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "nbaAdvSettingsGrid", {minRowsPerPage:sub_grid_data.length,pagination:false}); //NO I18N
				// 		break;
				// }
			},
			subGridRowColapsed:function(subgrid_id, row_id) {
			},
			afterInsertRow:function(rowId,rowData,rowElem) {
			},
			rowattr:function(rd) {
			},
			// beforeSelectRow: function(row_id, rowElem) {
			// },
			onSelectRow: function(row_id,status,e) {
				grid.expandSubGridRow(row_id);
			},
			onCellSelect:function(row_id,col,content,event) {
				var colModel = grid.jqGrid("getGridParam", "colModel"); //NO I18N

				switch(onSelectFunction) {
					case "nbaAdvSettingsGrid": //NO I18N
						if(colModel[col].name==="action") { //NO I18N
							var rowData = grid.jqGrid("getRowData", row_id); //NO I18N
							OPMClient.SettingsNFAConfigController.set("nbaAlgorithmID", rowData[0]); //NO I18N
							nfa_getNBAThresholdAdvSettings(rowData[0]);
						}
						break;
					case "tpAnomalyTbl": //NO I18N
						if(colModel[col].name==="indvTrafficGraph") { //NO I18N
							var rowData = grid.jqGrid("getRowData", row_id); //NO I18N
							delete rowData.indvTrafficGraph;
							var flowType =  gridTable.split("#tpAnomalyTbl")[1]; //NO I18N
							var tpaData = Object.values(rowData);
							tpaData.push(flowType);
							OPMClient.InventoryNFAController.set("tpAnomalyData", tpaData); //NO I18N
							opm_transitionToTheRoute("Inventory.Device.TrafficPattern.AnomalyReport"); //NO I18N
						}
						break;
				}
			},
			loadComplete:function() {
				if($(gridTable).jqGrid("getGridParam","groupHeader")!==null) {
					$(gridTable).jqGrid("destroyGroupHeader");
				}

				if(defaultOptions.groupHeaders!==undefined) {
					$(gridTable).jqGrid("setGroupHeaders",{ //NO I18N
						useColSpanStyle:true,
						groupHeaders:defaultOptions.groupHeaders
					});
					$("#gview_"+gridTableIdAlone+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove();
				}

				if(gridCallBack!==undefined && gridCallBack!==null) {
					gridCallBack(gridTableIdAlone);
				}

				if($(gridTable).getGridParam("reccount")===0) { //NO I18N
					if(defaultOptions.noDataText!==undefined) {
						$(gridTable).show().text(defaultOptions.noDataText);
					}else {
						$(gridTable).show().text(Ember.I18n.t("webclient.jqgrid.no.data.found")); //NO I18N
					}
					$(gridTable).addClass("gridnodata"); //NO I18N
				}else {
					$(gridTable).removeClass("gridnodata"); //NO I18N
				}
			}
		});
	}

	if(grid!==undefined && grid[0]!==undefined && gridNavigator!==undefined && gridNavigator!==null && gridNavigator!=="") { //NO I18N
		grid.jqGrid("navGrid",gridNavigator, //NO I18N
			{add:false,edit:false,del:false,refresh:false,cloneToTop:false,search:false},
			{sopt:["eq","ne","bw","ew","cn"]} //search options //NO I18N
		);
		grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
			caption:"", //NO I18N
			buttonicon:"ui-icon-newwin", //NO I18N
			title:Ember.I18n.t("webclient.grid.exportcsv"), //NO I18N
			jqModal:true,
			onClickButton:function() {
				opm_generateCSV(grid,captionTitle);
			}
		});
		grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
			caption:"", //NO I18N
			buttonicon:"ui-icon-document", //NO I18N
			title:Ember.I18n.t("webclient.grid.exportxls"), //NO I18N
			jqModal:true,
			onClickButton:function() {
				opm_generateXLSFromServer(grid,captionTitle);
			}
		});
	}
	
	if(searchOption) {
		grid.jqGrid("filterToolbar",{stringResult:true, searchOnEnter:false, defaultSearch:"cn", groupOp:"OR"}); //NO I18N
		grid[0].toggleToolbar();
		$(".ui-search-toolbar").show(); //NO I18N
		if(toggleSearch) {
			$(gridTable+"_searchIndex").show(); //NO I18N
			$(gridTable+"_searchIndex").css({"width":"40px","position":"absolute","right":"0","top":"0","left":"auto","height":"36px"}); //NO I18N

			if($(gridTable+"_searchIndex>div .jqSearchIcon").length===0 && !toggleSearch) { //NO I18N
				$(gridTable+"_searchIndex>div").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ncmToggleSearch(true,\''+(gridTable.replace("#", "#gview_"))+'\')" class="icon-search devsearchicon"></i></div>'); //NO I18N
			}else if($(gridTable+"_searchIndex>div .jqSearchIcon").length===0) { //NO I18N
				$(gridTable+"_searchIndex>div").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ncmToggleSearch(false,\''+(gridTable.replace("#", "#gview_"))+'\')" class="icon-search devsearchicon"></i></div>'); //NO I18N
			}
		}
	}
}

function nfa_getGroupHeaders(groupHeaders,groupHeaderNames) {
	for(var i=0;i<groupHeaders.length;i++) {
		groupHeaders[i].titleText = "<div align='center'>"+groupHeaderNames[i]+"</div>"; //NO I18N
	}
	return groupHeaders;
}

function nfa_validateColumnModelList(colModelList) {
	if(colModelList===null) {
		return;
	}
	for(var i=0;i<colModelList.length;i++) {
		try {
			if(colModelList[i].formatter!==null && colModelList[i].formatter!=="") { //NO I18N
				var tmpFunc = new Function('return '+colModelList[i].formatter); //NO I18N
				colModelList[i].formatter = tmpFunc();
			}
			if(colModelList[i].sorttype!==null && colModelList[i].sorttype!=="") { //NO I18N
				var tmpFunc = new Function('return '+colModelList[i].sorttype); //NO I18N
				colModelList[i].sorttype = tmpFunc();
			}
			if(colModelList[i].hidden!==null && colModelList[i].hidden!=="") { //NO I18N
				colModelList[i].hidden = Boolean(colModelList[i].hidden);
			}
		}catch(e) {
			// ignore formatter undefined exceptions as of now. Remove once
			// finalized
		}
	}
	return colModelList;
}

function nfa_dataRateConverter(bytes,isVolume,baseVal,decimalCount) {
	decimalCount = decimalCount || window.OPM.nfaDecimalCount; //default 3
	baseVal = baseVal || ((window.OPM.isNFAVolumeCalcWith1024)?1024:1000);
	var unitNames;
	if(baseVal==1000) {
		unitNames = (isVolume)?["Bytes","KB","MB","GB","TB"]:["bps","Kbps","Mbps","Gbps","Tbps"]; //NO I18N
	}else {
		unitNames = (isVolume)?["Bytes","KiB","MiB","GiB","TiB"]:["bps","Kibps","Mibps","Gibps","Tibps"]; //NO I18N
	}
	if(bytes==="" || bytes==undefined || bytes==0 || isNaN(Number(bytes))) { //NO I18N
		return parseFloat(0).toFixed(decimalCount)+" "+unitNames[0]; //NO I18N
	}
	var unitIndex;
	if(window.OPM.nfaDivValueForSpeed!==1) {
		var speedUnitsMap = {"kilo":1,"mega":2,"giga":3}; //NO I18N
		unitIndex = speedUnitsMap[window.NFASpeedUnit];
		return parseFloat(bytes/window.OPM.nfaDivValueForSpeed).toFixed(decimalCount)+" "+unitNames[unitIndex]; //NO I18N
	}else {
		unitIndex = unitNames.length-1;
		var maxConditionVal=0,returnUnit=""; //NO I18N
		var flag = true;
		while(flag) {
			maxConditionVal = Math.pow(baseVal,unitIndex);
			if(bytes >= maxConditionVal) {
				flag = false;
				return parseFloat(bytes/maxConditionVal).toFixed(decimalCount)+" "+unitNames[unitIndex]; //NO I18N
			}else {
				unitIndex--;
			}
		}
	}
}

function nfa_getDeviceList(isWlc) {
	var apiURL = window.OPM.apiUrlPattern+"/nfadevice/"+((isWlc)?"listWlcDevices":"listDevices"); //NO I18N
	var jsonData = nfa_getAjaxResponse(apiURL);
	jsonData = (jsonData.message===undefined)?jsonData:[];
	return jsonData;
}

function nfa_getInterfaceList(routerID,isWlc) {
	var apiURL = window.OPM.apiUrlPattern+"/nfadevice/"+((isWlc)?"listWlcAccessPoints":"listInterfaces"); //NO I18N
	var jsonData = nfa_getAjaxResponse(apiURL,{RouterID:routerID});
	var returnArr = [];
	if(jsonData.message===undefined) {
		for(var i=0;i<jsonData.data.length;i++) {
			returnArr.push({name:jsonData.data[i][1],ID:jsonData.data[i][0]});
		}
	}
	return returnArr;
}

function nfa_getWlcGroupsList(isApMacGrp) {
	var apiURL = "/nfaadmin"+((isApMacGrp)?"/listAPGroup":"/listSSIDGroup"); //NO I18N
	var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+apiURL); //NO I18N
	var returnArr = [];
	for(var i=0;i<jsonData.Group_List.length;i++) {
		returnArr.push({name:jsonData.Group_List[i].Name,ID:jsonData.Group_List[i].ID});
	}
	return returnArr;
}

function nfa_getSSIDList() {
	var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfadevice/listSSIDForMultiSel"); //NO I18N
	var returnArr = [];
	for(var i=0;i<jsonData.length;i++) {
		returnArr.push({name:jsonData[i][1],ID:jsonData[i][0]});
	}
	return returnArr;
}

function nfa_getCloudRegionsList(){
	var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/cloudflow/listSelectedRegions"); //NO I18N
	var returnArr = [];
	if(response.error === undefined){
		for(var i=0, length=response.length; i<length; i++){
			returnArr.push({routerID: response[i].ID, Name: response[i].name});
		}
	}
	return returnArr;
}

function nfa_getCloudInterfacesList(regionID){
	var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/cloudflow/listSelectedInterfaces", {regionID: regionID}); //NO I18N
	return ((response.error === undefined) ? response : []);
}

function nfa_getReportPDFInputs(headerDetails,self) {
	switch(self.selectedSource) {
		case "1"	: 	headerDetails.title1 = "NFAWidget.Devname"; //NO I18N
						headerDetails.value1 = self.selectedRouterName;
						headerDetails.title2 = "jsp.commonstr.IpAddress"; //NO I18N
						headerDetails.value2 = self.selectedRouterIP;
						headerDetails.title3 = "webclient.map.interfaceName"; //NO I18N
						headerDetails.value3 = self.selectedSourceName;
						break;
		case "2"	: 	headerDetails.title1 = "NFAWidget.ifgName"; //NO I18N
						headerDetails.value1 = self.selectedSourceName;
						break;
		case "3"	: 	headerDetails.title1 = "webclient.settings.ip.grp.name"; //NO I18N
						headerDetails.value1 = self.selectedSourceName;
						break;
		case "4"	: 	headerDetails.title1 = "webclinet.inventory.wlc.controllername"; //NO I18N
						headerDetails.value1 = self.selectedRouterName;
						headerDetails.title2 = "jsp.commonstr.IpAddress"; //NO I18N
						headerDetails.value2 = self.selectedRouterIP;
						headerDetails.title3 = "webclinet.inventory.wlc.apmacname"; //NO I18N
						headerDetails.value3 = self.selectedSourceName;
						break;
		case "5"	: 	headerDetails.title1 = "webclient.nfa.accessPointGrpName"; //NO I18N
						headerDetails.value1 = self.selectedSourceName;
						break;
		case "6"	: 	headerDetails.title1 = "webclient.nfa.ssidGrp.name"; //NO I18N
						headerDetails.value1 = self.selectedSourceName;
						break;
		case "7"	: 	headerDetails.title1 = "webclient.reports.SSID"; //NO I18N
						headerDetails.value1 = self.selectedSourceName;
						break;
		case "8"	: 	headerDetails.title1 = "nfa.region.name"; //NO I18N
						headerDetails.value1 = self.selectedRouterName;
						headerDetails.title2 = "nfa.cloudInterface.name"; //NO I18N
						headerDetails.value2 = self.selectedSourceName;
						break;
	}
	return headerDetails;
}

function nfa_loadGraph(gparams) {
	var arraObj={placeholder:[gparams.id],chartobj:[nfa_getGraphChartObject(gparams)]};
	zChart(arraObj);
	return arraObj;
}

function nfa_getGraphChartObject(gparams) {
	var chartObj = {
		id : opm_escapeHTML(gparams.id),
		type : (gparams.graphPlotType)?gparams.graphPlotType:"area", //NO I18N
		jsonData : gparams.data,
		series : "multi", //NO I18N
		height : 350,
		columns:{
			datatype_1:"time", //NO I18N
			datatype_2:"numeric", //NO I18N
			columnname_1: Ember.I18n.t("NFAWidget.Time"), //NO I18N
			columnname_2: Ember.I18n.t("NFAWidget.trfc"), //NO I18N
			timeFormat: OPMClient.InventoryDateTimeLegends.get(OPMClient.InventoryDateTimeNFAController.get(gparams.TimeFrame))
		},
		tooltip:[0,1],
		canvas : {
			title : {
				text :(gparams.title)?gparams.title:"", //NO I18N
				show :true,
				hAlign : "center", //NO I18N
				vAlign : "top" //NO I18N
			}
		},
		legend : {
			colorBox: {
				shape: "circle", //NO I18N
				strokeOpacity: 1
			},
			fontFamily: "LatoRegular", //NO I18N
			fontSize: 16,
			hAlign: (gparams.hAlign)?gparams.hAlign:"right", //NO I18N
			vAlign: (gparams.vAlign)?gparams.vAlign:"top" //NO I18N
		},
		axes: {
			xaxis: {
				label: {
					text:Ember.I18n.t("NFAWidget.Time") //NO I18N
				}
			},
			yaxis:[{
				label:{text:gparams.yAxis}
			}]
		},
		noDataHandler : {
			text:Ember.I18n.t("webclient.common.nodata") //NO I18N
		},
		chart : {stacked:false},
		isNFATimeSeriesGraph:true
	}
	if(gparams.width) {
		chartObj.width = gparams.width;
	}
	if(gparams.legend) {
		chartObj.legend = gparams.legend;
	}
	if(gparams.yAxisThresholdArray) {
		chartObj = nfa_addThresholdLineInfo(chartObj,gparams.yAxisThresholdArray,gparams.yAxisThresholdText,gparams.isAnomaly);
	}
	if(gparams.plot){
		chartObj.plot = gparams.plot;
	}
	if(gparams.brush_options){
		chartObj.brush_options = gparams.brush_options;
	}
	if(gparams.timePatternString){
		chartObj.timePatternString=gparams.timePatternString;
	}
	return chartObj;
}

function nfa_getNewGraphChartObject(gparams) {
	var graphParams = {
		graphId: gparams.id,
		graphStyle: gparams.graphPlotType ? gparams.graphPlotType : "area", //NO I18N
		graphHeight: 400,
		series: "multi", //NO I18N
		datatype_1: "time", //NO I18N
		datatype_2: "numeric", //NO I18N
		xTitle: Ember.I18n.t("NFAWidget.Time"), //NO I18N
		yTitle: gparams.yTitle,
		timePeriod: OPMClient.InventoryDateTimeLegends.get(OPMClient.InventoryDateTimeNFAController.get(gparams.TimeFrame)),
		legendNeeded: gparams.legendNeeded !== undefined ? gparams.legendNeeded : false,
		showGridlines: true,
		yAxisPlacement: "left", //NO I18N
		minRange: gparams.minRange ? gparams.minRange : null,
		maxRange: gparams.maxRange ? gparams.maxRange : null,
		stacked: false,
		showPoints: "always", //NO I18N
		totalSeries: (gparams.data && gparams.data.length) || 0,
		legendPlacement: "right", //NO I18N
		tooltip: [0, 1],
		smoothEdges: true,
		showLegendForSingleGraph: gparams.showLegendForSingleGraph !== undefined ? gparams.showLegendForSingleGraph : false
	};
	var chartObj = getZChartProps({graphData: gparams.data}, graphParams);
	chartObj.isNFATimeSeriesGraph = true;
	chartObj.noDataHandler = {text: Ember.I18n.t("webclient.common.nodata")}; //NO I18N
	if(gparams.yAxisSuffix !== undefined) {
		chartObj.columns.unit_suffix = gparams.yAxisSuffix;
	}
	return chartObj;
}

function nfa_loadPieChart(gparams) {
	var arraObj={placeholder:[gparams.id],chartobj:[nfa_getPieChartObject(gparams)]};
	zChart(arraObj);
	return arraObj;
}

function nfa_getPieChartObject(gparams) {
	var chartObj = {
		id:opm_escapeHTML(gparams.id),
		type:"pie", //NO I18N
		subType:"nfaSchedulePie", //NO I18N
		jsonData: gparams.data,
		height:350,
		margin:25,
		columns:{
			datatype_1:"ordinal",  //NO I18N
			columnname_1: (gparams.colName1)?gparams.colName1:Ember.I18n.t("jsp.commonstr.Name"), //NO I18N
			columnname_4: Ember.I18n.t("NFAWidget.trfc") //NO I18N
		},
		tooltip:[0,3],
		legend:{
			enabled:false
		},
		noDataHandler:{
			text:Ember.I18n.t("webclient.common.nodata") //NO I18N
		}
	}
	return chartObj;
}

function nfa_getSelectedSourceValues(self){
	if(self.selectedSource == "1" || self.selectedSource == "4"){ //NO I18N
		return getMultiSelectedDevices();
	}else{
		var sourceName = ""; //NO I18N
		switch(self.selectedSource){
			case "2"	: 	sourceName = "InterfaceGroups"; break; //NO I18N
			case "3"	: 	sourceName = "IPGroups"; break; //NO I18N
			case "5"	: 	sourceName = "APGroups"; break; //NO I18N
			case "6"	: 	sourceName = "SSIDGroups"; break; //NO I18N
			case "7"	: 	sourceName = "SSIDs"; break; //NO I18N
		}
		self.set("lists.available"+sourceName, $.map($("#remainingList option"), function(a){ //NO I18N
			return {"ID":a.value,"name":a.text}; //NO I18N
		}));
		self.set("lists.selected"+sourceName, $.map($("#selectedList option"), function(a){ //NO I18N
			return {"ID":a.value,"name":a.text}; //NO I18N
		}));
		return OPMClient.Settings.getSelectedDTList("selectedList"); //NO I18N
	}
}

function nfa_getInventoryReportCriteria(trafficType, isAppReport){
	var criteria = [], inCriteria = $("#inCriteria3").val(), outCriteria = $("#outCriteria3").val(); //NO I18N
	if(inCriteria !== "" && inCriteria !== undefined){
		criteria.push({"type": "IN", "value": inCriteria, "unit": ((trafficType == "percentage") ? "percentage" : $("select[name='inUnitList']").val()), "comp": $("#inCriteria2").val()}); //NO I18N
	}
	if(outCriteria !== "" && outCriteria !== undefined){
		criteria.push({"type": "OUT", "value": outCriteria, "unit": ((trafficType == "percentage") ? "percentage" : $("select[name='outUnitList']").val()), "comp": $("#outCriteria2").val()}); //NO I18N
	}
	if(!isAppReport){
		var percINCriteria = $("#percINCriteriaDiv2").val(), percOUTCriteria = $("#percOUTCriteriaDiv2").val(); //NO I18N
		if(percINCriteria !== "" && percINCriteria !== undefined){ //NO I18N
			criteria.push({"type": "95thIN", "value": percINCriteria, "unit": ((trafficType == "percentage") ? "percentage" : $("select[name='percINUnitList']").val()), "comp": $("#percINCriteriaDiv1").val()}); //NO I18N
		}
		if(percOUTCriteria !== "" && percOUTCriteria !== undefined){ //NO I18N
			criteria.push({"type": "95thOUT", "value": percOUTCriteria, "unit": ((trafficType == "percentage") ? "percentage" : $("select[name='percOUTUnitList']").val()), "comp": $("#percOUTCriteriaDiv1").val()}); //NO I18N
		}
	}
	return criteria;
}

function nfa_getSpeedUnits(){
	if(window.OPM.isNFAVolumeCalcWith1024){
		return [
			{name: Ember.I18n.t("webclinet.billing.bps"), value: "bps"}, //NO I18N
			{name: Ember.I18n.t("webclient.speedUnit.Kibps"), value: "Kibps"}, //NO I18N
			{name: Ember.I18n.t("webclient.speedUnit.Mibps"), value: "Mibps"}, //NO I18N
			{name: Ember.I18n.t("webclient.speedUnit.Gibps"), value: "Gibps"}, //NO I18N
			{name: Ember.I18n.t("webclient.speedUnit.Tibps"), value: "Tibps"} //NO I18N
		];
	}else{
		return [
			{name: Ember.I18n.t("webclinet.billing.bps"), value: "bps"}, //NO I18N
			{name: Ember.I18n.t("webclient.Kbps"), value: "Kbps"}, //NO I18N
			{name: Ember.I18n.t("webclient.Mbps"), value: "Mbps"}, //NO I18N
			{name: Ember.I18n.t("webclient.Gbps"), value: "Gbps"}, //NO I18N
			{name: Ember.I18n.t("webclient.speed.unit.Tbps"), value: "Tbps"} //NO I18N
		];
	}
}

function nfa_getVolumeUnits(){
	if(window.OPM.isNFAVolumeCalcWith1024){
		return [
			{name: Ember.I18n.t("webclient.devices.intfgraph.totalbytes"), value: "bytes"}, //NO I18N
			{name: Ember.I18n.t("webclient.volumeUnit.KiB"), value: "KiB"}, //NO I18N
			{name: Ember.I18n.t("webclient.volumeUnit.MiB"), value: "MiB"}, //NO I18N
			{name: Ember.I18n.t("webclient.volumeUnit.GiB"), value: "GiB"}, //NO I18N
			{name: Ember.I18n.t("webclient.volumeUnit.TiB"), value: "TiB"} //NO I18N
		];
	}else{
		return [
			{name: Ember.I18n.t("webclient.devices.intfgraph.totalbytes"), value: "bytes"}, //NO I18N
			{name: Ember.I18n.t("webclient.map.filefoldermonitor.units.kilobyte"), value: "KB"}, //NO I18N
			{name: Ember.I18n.t("webclient.map.filefoldermonitor.units.megabyte"), value: "MB"}, //NO I18N
			{name: Ember.I18n.t("webclient.map.filefoldermonitor.units.gigabyte"), value: "GB"}, //NO I18N
			{name: Ember.I18n.t("webclient.volume.unit.TB"), value: "TB"} //NO I18N
		];
	}
}

function nfa_getConvertedDataUnits(unit, isConvert) {
	if(!isConvert) {
		return unit;
	}
	switch(unit) {
		case "bps"		: return "bps"; //NO I18N
		case "Kibps"	: return "Kbps"; //NO I18N
		case "Mibps"	: return "Mbps"; //NO I18N
		case "Gibps"	: return "Gbps"; //NO I18N
		case "Tibps"	: return "Tbps"; //NO I18N
		case "Kbps"		: return "Kibps"; //NO I18N
		case "Mbps"		: return "Mibps"; //NO I18N
		case "Gbps"		: return "Gibps"; //NO I18N
		case "Tbps"		: return "Tibps"; //NO I18N
		case "bytes"	: return "bytes"; //NO I18N
		case "KiB"		: return "KB"; //NO I18N
		case "MiB"		: return "MB"; //NO I18N
		case "GiB"		: return "GB"; //NO I18N
		case "TiB"		: return "TB"; //NO I18N
		case "KB"		: return "KiB"; //NO I18N
		case "MB"		: return "MiB"; //NO I18N
		case "GB"		: return "GiB"; //NO I18N
		case "TB"		: return "TiB"; //NO I18N
	}
}

function nfa_toggleCollectorKey(){
	if($("#apiMaskEyeProbe").hasClass("icon-eye-slash")){ //NO I18N
		$("#apiMaskEyeProbe").removeClass("icon-eye-slash"); //NO I18N
		$("#apiMaskEyeProbe").addClass("icon-eye"); //NO I18N
		OPMClient.ApplicationController.set("installationKeyToShow", opm_mask(OPMClient.ApplicationController.nfaCollectorKey, 4, 4)); //NO I18N
	}else{
		$("#apiMaskEyeProbe").addClass("icon-eye-slash"); //NO I18N
		$("#apiMaskEyeProbe").removeClass("icon-eye"); //NO I18N
		OPMClient.ApplicationController.set("installationKeyToShow", OPMClient.ApplicationController.nfaCollectorKey); //NO I18N
	}
}

function nfa_copyToClipBoard(str){
	var el = document.createElement("textarea"); //NO I18N
	el.value = str;
	el.setAttribute("readonly", ""); //NO I18N
	el.style = {position: "absolute", left: "-9999px"}; //NO I18N
	document.body.appendChild(el);
	el.select();
	document.execCommand("copy"); //NO I18N
	document.body.removeChild(el);
}

function nfa_getSNMPCredentials(isComponent){
	var data = {};
	if(isComponent){
		data.RouterID = (isComponent === "snapshot") ? nfa_getInterfaceID() : "-1"; //NO I18N
	}
	var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/admin/listCredentials", data); //NO I18N
	if(response.associatedSNMPCredentialName !== undefined && response.associatedSNMPCredentialName !== ""){ //NO I18N
		OPMClient.SettingsNFAConfigController.set("associatedSNMP", response.associatedSNMPCredentialName); //NO I18N
	}
	var credList = [];
	if(response.snmpcredential != undefined){
		for(var i=0; i<response.snmpcredential.length; i++){
			credList.push({
				name: response.snmpcredential[i].credentialName+" ("+response.snmpcredential[i].type+")", //NO I18N
				value: response.snmpcredential[i].credentialName
			});
		}
	}
	if(response.snmpv3credential != undefined){
		for(var i=0; i<response.snmpv3credential.length; i++){
			credList.push({
				name: response.snmpv3credential[i].credentialName+" ("+response.snmpv3credential[i].type+")", //NO I18N
				value: response.snmpv3credential[i].credentialName
			});
		}
	}
	OPMClient.SettingsNFAConfigController.set("nfaSNMPCredentials", credList); //NO I18N
	if(isComponent && response.snmpWarningMessage){
		return response.snmpWarningMessage;
	}
	return false;
}

function nfa_changeInventoryTimeFrame(isDPI,timeFrame){
	$("#timeFrameSelectBox .ddType1__list ul").on("click", "li", function() { //NO I18N
		if(!$(this).hasClass("active") || $(this).data("value")==="custom"){ //NO I18N
			if($(this).data("value")==="custom") { //NO I18N
				OPMClient.InventoryNFAController.set("showCustomTime",true); //NO I18N
				Ember.run.scheduleOnce("afterRender", function() { //NO I18N
					deviceSlideIn(6);
				});
				return;
			}else {
				OPMClient.InventoryNFAController.set("showCustomTime",false); //NO I18N
				nfa_updateInvTimeList(this);
				if(isDPI){
					dpi_filterCallBackFunction();
				}else{
					OPMClient.Inventory.getNFAFilters(OPMClient.InventoryDeviceDetailsController.subFilterType,isDPI);
				}
			}
		}
	});
	nfa_updateInvTimeList($("#timeFrameSelectBox .ddType1__list ul li[data-value='"+(timeFrame || OPMClient.InventoryNFAController.timeFrame)+"']")); //NO I18N
}

function nfa_updateInvTimeList(element) {
	$("#timeFrameSelectBox .ddType1__list ul li").removeClass("active"); //NO I18N
	$(element).addClass("active"); //NO I18N
	$("#timeFrameInfo").text($(element).text()); //NO I18N
	var timeFrame = $(element).data("value"); //NO I18N
	OPMClient.InventoryNFAController.set("timeFrame",(timeFrame)?timeFrame:"hourly"); //NO I18N
}

function nfa_validateCustomTime(startTime,endTime) {
	var sDate = startTime.split(" "); //NO I18N
	var eDate = endTime.split(" "); //NO I18N
	if(startTime==="" || endTime==="" || sDate[0]==="" || eDate[0]==="") { //NO I18N
		opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.customTime.emptyMsg")); //NO I18N
		return false;
	}
	var sDate = startTime.split(" "); //NO I18N
	var eDate = endTime.split(" "); //NO I18N
	var returnVal=true;
	if(sDate[0]>eDate[0]) {
		returnVal=false;
	}else if(sDate[0]===eDate[0]) {
		var sTime = sDate[1].split(":"); //NO I18N
		var eTime = eDate[1].split(":"); //NO I18N
		if(sTime[0]>eTime[0]) {
			returnVal=false;
		}else if(sTime[0]===eTime[0]) {
			if((sTime[1]>eTime[1])||(sTime[1]===eTime[1])){
				returnVal=false;
			}
		}
	}
	if(!returnVal) {
		opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.admin.archive.timeerr")); //NO I18N
	}
	return returnVal;
}

function nfa_getInvSubFilterKey() {
	var filterType = OPMClient.InventoryDeviceDetailsController.subFilterType;
	if(filterType==="Groups") { //NO I18N
		filterType=OPMClient.Inventory.getGroupsSelectedFilterVal();
	}else if(filterType==="WLC") { //NO I18N
		filterType=OPMClient.Inventory.getWlcSelectedFilterVal();
	}
	return filterType;
}

function nfa_getPortView(jsonData) {
	if(jsonData.status==="Failure" || jsonData.result.length==0) { //NO I18N
		return;
	}
	var port;
	var portDetails=[],rows=[],columns=[];
	for (i=1;i<=jsonData.result.length;i++) {
		port = jsonData.result[i-1];
		var statusClassName = "spmswitchportstatus "+((port["operational-status-int"]==2)?"":"up"); //NO I18N
		
		var tooltipObj = {};
		tooltipObj[Ember.I18n.t("webclient.map.flash.portNum")] = port["connected-switch-port"]; //NO I18N 
		tooltipObj[Ember.I18n.t("opu.views.IFINDEX")] = port["connected-port-ifindex"]; //NO I18N 
		tooltipObj[Ember.I18n.t("opu.views.IFNAME")] = port["connected-port-ifname"]; //NO I18N
		tooltipObj[Ember.I18n.t("opstor.inventory.operationalstatus")] = port["operational-status"]; //NO I18N 
		tooltipObj[Ember.I18n.t("opu.views.CONNECTED_MAC")] = nfa_getDotedString(port["connected-mac"]); //NO I18N
		tooltipObj[Ember.I18n.t("opu.views.CONNECTED_IP")] = nfa_getDotedString(port["connected-ip"]); //NO I18N

		columns.push({className:statusClassName,tooltip:JSON.stringify(tooltipObj),portViewName:port.spviewname,interfaceID:port.NFAIFIndex});
		if(i%2 == 0) {
			rows.push(columns);
			columns = [];
			if(rows.length==8) {
				portDetails.push({style:port.spviewnamestyle,rows:rows});
				rows = [];
			}
		}
	}
	rows.push(columns);
	portDetails.push({style:port.spviewnamestyle,rows:rows});
	return portDetails;
}

function nfa_getDotedString(str) {
	if(str!=="") { //NO I18N
		var strArr = str.split(","); //NO I18N
		return (strArr.length>2)?(strArr[0]+", "+strArr[1]+", ..."):str; //NO I18N
	}else {
		return " - "; //NO I18N
	}
}

function nfa_getPortLinkToSnap(cellvalue,options,rowObject) {
	options.colModel.classes = (rowObject.NFAIFIndex!=-1)?"pointer underlineLink opm_link":""; //NO I18N
	return htmlEncode(cellvalue);
}

function nfa_customTooltip(element1,element2) {
	$(element1).off().on("mouseenter",element2,function(){ //NO I18N
		var self=$(this);
		clearTimeout(self.data("hoverTimer")); //NO I18N
		var timer = setTimeout(function(){
			opm_showCustomTooltip(self);
		},0);
		self.data("hoverTimer",timer); //NO I18N
	}).on("mouseleave",element2,function(){ //NO I18N
		var self=$(this);
		clearTimeout(self.data("hoverTimer")); //NO I18N
		var timer = setTimeout(function(){
			$(".opmToolTipDescBar").remove(); //NO I18N
		},0);
		self.data("hoverTimer",timer); //NO I18N
	});
}

function nfa_getFormattedTime(year,month,day,hour,minute) {
	var dateObj = new Date(); 
	dateObj.setFullYear(year);
	dateObj.setMonth(month);
	dateObj.setDate(day);
	dateObj.setHours(hour);
	dateObj.setMinutes(minute);
	return dateObj.format(window.OPM.tooltipTimeFormat);
}

function nfa_getDECommunicationStatus(){
	var callBackFunction = function(response){
		(response.error === undefined) ? nfa_showDECommunicationStatus(response) : showMessage(response);
	};
	nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaee/getDECommunicationStatus", {}, callBackFunction, {}); //NO I18N
}

function nfa_showDECommunicationStatus(response) {
	if (window.isserver) {
		var upCount = response.up.length;
		var downCount = response.down.length;
		var brokenCount = response.broken.length;

		OPMClient.ApplicationController.set("nfaCollectorUp", upCount); //NO I18N
		OPMClient.ApplicationController.set("nfaCollectorDown", downCount); //NO I18N
		OPMClient.ApplicationController.set("nfaCollectorBroken", brokenCount); //NO I18N

		if (upCount || downCount || brokenCount) {
			$('.centralProbStatusInfo').show(); //NO I18N
		} else {
			$('.centralProbStatusInfo').hide(); //NO I18N
		}
	} else if (window.iscollector) {
		OPMClient.ApplicationController.set("nfaCentralStatus", response.centralStatus); //NO I18N
	}
}

function nfa_redirectToCollectorsPage(){
	if(window.OPM.userPermissions.generalSettingsRead) {
		opm_transitionToParentRoute("Loading");//NO I18N
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			opmGlobalRoute.transitionTo("Settings.Basic.NFACollectors.index"); //NO I18N
		});
	}
}

function nfa_redirectToCentralPage(){
	opmGlobalRoute.transitionTo("Settings.Basic.NFACentral"); //NO I18N
}

function nfa_addValidationError(selector, message){
	$(selector).addClass("validateField error"); //NO I18N
	$(selector).attr("data-error", message); //NO I18N
	opmValidate($(selector));
}

function nfa_openColChooserInGridWithNoPager(gridTable, gridTableId, callBackFunction, callBackData, position){
	$('#'+gridTable).jqGrid('columnChooser', {	//NO I18N
		dialog_opts: {
			modal: true,
			title: Ember.I18n.t('webclient.grid.selectcolumn'), //NO I18N
			resizable: false,
			draggable: false,
			width: 250,
			position: {my: 'right top', at: 'right top', of: position} // NO I18N
		},
		done: function(perm) {
			if(perm) {
				var colModelList = this.jqGrid('getGridParam', 'colModel'), visibleColumns = []; //NO I18N
				for(var i=0; i<colModelList.length; i++) {
					if(!colModelList[i].hidden) {
						visibleColumns.push(colModelList[i].name);
					}
				}
				if(visibleColumns.length && !(visibleColumns.length === 1 && visibleColumns[0] === 'indvTrafficGraph')) { //NO I18N
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern+'/ncmclient/updateGridColumnChooser', {'GRID_ID': gridTableId, 'VISIBLE_COLUMNS': JSON.stringify(visibleColumns)}); //NO I18N
				}
				callBackFunction(callBackData, visibleColumns);
			}
		}
	});
	$('#colchooser_'+gridTable+' > div').css('padding', '0');
	$('#colchooser_'+gridTable+' select').mousedown(function(e) {
		e.preventDefault();
		var select = this;
		var scroll = select.scrollTop;
		e.target.selected = !e.target.selected;
		setTimeout(function(){select.scrollTop = scroll;}, 0);
		$(select).focus();
	}).mousemove(function(e){e.preventDefault()});
}

function nfa_getReportsTimeFrames(isNeedMinutes) {
	var timeList = [
		{name:Ember.I18n.t("nfa.timeframe.lasthour"),					value:"hourly"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.last6hours"),	value:"6Hour"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.last24hrs"),	value:"daily"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.today"),		value:"today"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.yesterday"),	value:"yesterday"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.last7days"),	value:"Weekly"}, //NO I18N
		{name:Ember.I18n.t("nfa.timeframe.previousweek"),				value:"PrevWeek"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.last30days"),	value:"Monthly"}, //NO I18N
		{name:Ember.I18n.t("nfa.timeframe.previousmonth"),				value:"PrevMonth"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.last90days"),	value:"Quarterly"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.custom"),		value:"custom"} //NO I18N
	];
	if(isNeedMinutes) {
		timeList.unshift(
			{name:Ember.I18n.t("nfa.timeframe.last15minutes"),	value:"15Minute"}, //NO I18N
			{name:Ember.I18n.t("nfa.timeframe.last30minutes"),	value:"30Minute"} //NO I18N
		);
	}
	return timeList;
}

function nfa_getMultiSelectedDevicesAsInt(returnArray) {
	var list = $("input:checkbox[class='chkChild chk']:checked"); //NO I18N
	var selectedValues=[];
	for(var i=0,length=list.length; i<length; i++) {
		selectedValues.push(parseInt(list[i].value));
	}
	if(returnArray) {
		return selectedValues;
	}
	return selectedValues.toString();
}

function nfa_getAnomalyReport(flowType, time) {
	var tpaData;
	var tableData = OPMClient.InventoryNFAController.tpAnalysis[flowType].TableData;
	for(var i=tableData.length-1; i>=0; i--) {
		if(tableData[i][0]==time) {
			tpaData = tableData[i];
			break;
		}
	}
	if(tpaData!==undefined) {
		tpaData.push(flowType);
		OPMClient.InventoryNFAController.set("tpAnomalyData", tpaData); //NO I18N
		opm_transitionToTheRoute("Inventory.Device.TrafficPattern.AnomalyReport"); //NO I18N
	}
}

function nfa_isNumericInput(textbox) {
	textbox.value = textbox.value.replace(/\D/g,""); //NO I18N
}

function nfa_showNFAAddonPromotionDiv() {
	var promotionDetails = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getNFAPromotionDetails"); //NO I18N

	//Addon promotion content handling
	var obj = {display: false, showExportFlow: false, showEnableNetFlow: false};
	if(window.OPM.isNfaPlug && promotionDetails.nfaManagedInterfaceCount === 0) {
		obj.display = true;
		obj.showExportFlow = true;
	}else if(!window.OPM.isNfaPlug) {
		obj.display = true;
		obj.showEnableNetFlow = true;
	}
	obj.display ? $("#opm_devListHolder").hide() : $("#opm_devListHolder").show(); //NO I18N
	OPMClient.InventoryNFAController.set("nfaAddonPromotion", obj); //NO I18N

	//Addon trial popup handling
	if(promotionDetails.showOptionToEnableTrialLicense) {
		var addOnProperties = checkWidgetIsAddOnAndsetData("nfa.promotion.top.band"); //NO I18N
		addOnProperties.nfaCloseIcon = true;
		addOnProperties.showCloseOptions = true;
		OPMClient.InventoryDeviceDetailsController.set("opmAddOnPopupProps", addOnProperties); //NO I18N
		nfa_showAddonPopup();
	}
}

function nfa_addonLicensePopupAction(remindMe) {
	var callBackFunction = function(response) {
		hideAddonPopup();
	};
	nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/updateNFAPromotionDetails", {closePreference: remindMe}, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
}

function nfa_showNFAAddonPromotionDivFromMsgFramework() {
	var addOnProperties = checkWidgetIsAddOnAndsetData("nfa.promotion.top.band"); //NO I18N
	addOnProperties.nfaCloseIcon = true;
	addOnProperties.showCloseOptions = false;
	OPMClient.InventoryDeviceDetailsController.set("opmAddOnPopupProps", addOnProperties); //NO I18N
	nfa_showAddonPopup();
}

function nfa_showAddonPopup() {
	if(window.OPM.isProbe) {
		$("#probeMsg").show(); $("#tryNowBtn").hide();
	}else {
		$("#probeMsg").hide(); $("#tryNowBtn").show();
	}
	$(".addon-popup__wrapper .addon-popup__modal").addClass("nfa-addon relative"); //NO I18N
	$(".addon-popup__wrapper").css({"display": "flex", "opacity": 1}); //NO I18N
}
function nfa_getCriteriaI18Name(key){
	var i18n = {
		"SrcAddr"			:Ember.I18n.t("webclient.Source.Address"), //NO I18N
		"SrcEntNet"			:Ember.I18n.t("webclient.Source.Nework"), //NO I18N
		"SrcSetNodes"		:Ember.I18n.t("webclient.Source.Nodes"), //NO I18N
		"DstAddr"			:Ember.I18n.t("webclient.Destination.Address"), //NO I18N
		"DstEntNet"			:Ember.I18n.t("webclient.Destination.Network"), //NO I18N
		"DstSetNodes"		:Ember.I18n.t("webclient.Destination.Nodes"), //NO I18N
		"Application"		:Ember.I18n.t("NFAWidget.App"), //NO I18N
		"Port"				:Ember.I18n.t("webclient.admin.appmanager.port"), //NO I18N
		"PortRange"			:Ember.I18n.t("opu.ipam.PORT_RANGE"), //NO I18N
		"DSCP"				:Ember.I18n.t("NFAWidget.dscp"), //NO I18N
		"SrcAS"				:Ember.I18n.t("nfa.asview.srcas"), //NO I18N
		"DstAS"				:Ember.I18n.t("nfa.asview.dstas"), //NO I18N
		"Protocol"			:Ember.I18n.t("opu.common.PROTOCOL"), //NO I18N
		"TOS"				:Ember.I18n.t("sch.tos"), //NO I18N
		"TCP_FLAGS"			:Ember.I18n.t("webclient.TCP_FLAGS"), //NO I18N
		"NBARApplication"	:Ember.I18n.t("webclient.reports.NBARApplication"), //NO I18N
		"NextHop"			:Ember.I18n.t("webclient.forensics.nexthop"), //NO I18N
		"TranslatedSRCIP"	:Ember.I18n.t("webclient.nfa.srcnat"), //NO I18N
		"TranslatedDSTIP" 	:Ember.I18n.t("webclient.nfa.dstnat"), //NO I18N
		"SSID"				:Ember.I18n.t("webclient.reports.SSID"), //NO I18N
		"IPHost"			:Ember.I18n.t("NFAWidget.CliIP"), //NO I18N
		"Host"				:Ember.I18n.t("webclinet.inventory.wlc.clientmac"), //NO I18N
		"DSCPIn"			:Ember.I18n.t("webclient.reports.PreDSCP"), //NO I18N
		"DSCPOut"			:Ember.I18n.t("webclient.reports.PostDSCP"), //NO I18N
		"IPHostNet"			:Ember.I18n.t("webclient.iphost.network"), //NO I18N
		"IPHostNodes"		:Ember.I18n.t("webclient.iphost.nodes"), //NO I18N
		"SrcCategory"		:Ember.I18n.t("nfa.cloud.srccategory"), //NO I18N
		"DstCategory"		:Ember.I18n.t("nfa.cloud.dstcategory"), //NO I18N
		"SrcResolvedBy"		:Ember.I18n.t("nfa.cloud.srcresolvedby"), //NO I18N
		"DstResolvedBy"		:Ember.I18n.t("nfa.cloud.dstresolvedby") //NO I18N
	};
	return i18n[key];
}
function nfa_getCriteriaValue(list){
	var result=[];
	if(list.includeList != undefined){
		for(var i=0; i<list.includeList.length;i++){
			for (var key in list.includeList[i]){
				var obj = {type : Ember.I18n.t("webclient.Include")}; //NO I18N
				if(key === "SrcEntNet" || key === "DstEntNet" || key === "IPHostNet"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.includeList[i][key][0]+" ( "+list.includeList[i][key][1]+" ) ";
				}else if(key === "SrcSetNodes" || key === "DstSetNodes" || key === "IPHostNodes"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.includeList[i][key][1]+" - "+list.includeList[i][key][2]+" ( "+list.includeList[i][key][0]+" ) ";
				}else if(key === "PortRange"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.includeList[i][key][0]+" - "+list.includeList[i][key][1]
				}else if(key === "SrcAS" || key === "DstAS"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.includeList[i][key][1];
				}else if(key === "SrcResolvedBy" || key === "DstResolvedBy"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					var value = list.includeList[i][key];
					obj.value = (value === "AD") ? Ember.I18n.t("webclient.reports.createreport.ad") : (value === "DHCP") ? Ember.I18n.t("opu.common.DHCP") : (value === "ManualMapping") ? Ember.I18n.t("webclient.manualmapping") : Ember.I18n.t("nfa.cloudService"); //NO I18N
				}
				else{
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.includeList[i][key];
				}
				result.push(obj);
			}
		}
	}
	if(list.excludeList != undefined){
		for(var i=0; i<list.excludeList.length;i++){
			for (var key in list.excludeList[i]){
				var obj = {type : Ember.I18n.t("webclient.Exclude")}; //NO I18N
				if(key === "SrcEntNet" || key === "DstEntNet" || key === "IPHostNet"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.excludeList[i][key][0]+" ( "+list.excludeList[i][key][1]+" ) ";
				}else if(key === "SrcSetNodes" || key === "DstSetNodes" || key === "IPHostNodes"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.excludeList[i][key][1]+" - "+list.excludeList[i][key][2]+" ( "+list.excludeList[i][key][0]+" ) ";
				}else if(key === "PortRange"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.excludeList[i][key][0]+" - "+list.excludeList[i][key][1];
				}else if(key === "SrcAS" || key === "DstAS"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.excludeList[i][key][1];
				}else if(key === "SrcResolvedBy" || key === "DstResolvedBy"){ //NO I18N
					obj.cri = nfa_getCriteriaI18Name(key);
					var value = list.excludeList[i][key];
					obj.value = (value === "AD") ? Ember.I18n.t("webclient.reports.createreport.ad") : (value === "DHCP") ? Ember.I18n.t("opu.common.DHCP") : (value === "ManualMapping") ? Ember.I18n.t("webclient.manualmapping") : Ember.I18n.t("nfa.cloudService"); //NO I18N
				}
				else{
					obj.cri = nfa_getCriteriaI18Name(key);
					obj.value = list.excludeList[i][key];
				}
				result.push(obj);
			}
		}
	}
	return result;
}

function nfa_fileUpload(element) {
	if($(element).closest(".validateField.error") !== null) { //NO I18N
		$(element).closest(".validateField.error").removeClass("validateField error"); //NO I18N
		$(".OpMToolBar").remove(); //NO I18N
	}
	opmFileUpload(element);
}

function nfa_getMailServerSettings(returnRoute, message) {
	var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/admin/GetNFACentralMailServerSettings"); //NO I18N
	if(response !== undefined && response.isMailServerConfigured) {
		OPMClient.SettingsAddEditController.set("mailServerSettings", response); //NO I18N
		OPMClient.SettingsAddEditController.set("isMailServerConfigured", true); //NO I18N
		return true;
	}else {
		var options = {};
		if(window.OPM.userPermissions.generalSettingsRead) {
			options.callback_func = function() {
				if(window.isserver && nfa_getCollectorID() !== "-1") nfa_changeColOpt("-1"); //NO I18N
				redirectToMailServerSettings(returnRoute);
			}
		}
		if(message && message !== "") { //NO I18N
			opm_infoMsgs("infoMsg-1", message, options); //NO I18N
		}
		return false;
	}
}
function nfa_closeAlertPopup(){
	$("#tempDialog").dialog("close");
}
function nfa_getGraphTypes(){
	var graphTypes = [
		{name: Ember.I18n.t("webclient.reports.graph.output.format.area"),	value: 1,	isChecked:true}, //NO I18N
		{name: Ember.I18n.t("webclient.reports.graph.output.format.line"),	value: 2,	isChecked:false},//NO I18N
		{name: Ember.I18n.t("webclient.reports.graph.output.format.bar"),	value: 3,	isChecked:false} //NO I18N
	];
	return graphTypes;
}

function nfa_goToSecurityInventory() {
	// var isNDRAddon = window.isNDRAddon;
	if (window.isserver) {
		if (isAllCollectorSelected()) {
			setCombo('withOutAll'); // NO I18N
		}
		// var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern + "/ndr/getNDRStatus"); // NO I18N
		// isNDRAddon = (response && response.NDR_AVAILABLE);
	}
	var pageURL = (window.isNDRAddon) ? "/apiclient/fluidicv3/index.jsp#/security/overview" : "/apiclient/ember/index.jsp#/Inventory/List/AttacksAnalysis/Attacks"; // NO I18N
	location.href = pageURL;
}

function nfa_getNBAandNDRValues() {
	nfa_updateNBAandNDRValues();
	return {isNBAAddOn: window.isNBAAddOn, isNDRAddon: window.isNDRAddon};
}

function nfa_showNDRUpgradePopup() {
	var showNDRUpgradePopup = sessionStorage.getItem("showNDRUpgradePopup"); // NO I18N
	if (showNDRUpgradePopup === undefined || showNDRUpgradePopup === null) {
		return true;
	}
	return showNDRUpgradePopup === 'true'; // NO I18N
}

function nfa_getNDRStatus() {
	var ndrStatus = nfa_getAjaxResponse(window.OPM.apiUrlPattern + "/ndr/getNDRStatus"); //NO I18N
	return ndrStatus.error === undefined ? ndrStatus : {NDR_AVAILABLE: false, NDR_ENABLED: false};
}

function nps_fetchNPSEthernetCardDetails(rcID) {
	var etherCard = [];
	var callBackFun = function(response) {
		if(response !== undefined && response.EthernetList !== undefined) {
			etherCard = response.EthernetList;
		}
		return etherCard;
	}
	nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern + "/poller/sendRequestToRemoteCollector",{'rcID':rcID,"module":"NPS","dataToBeFetched":"fetchEthernetData"},callBackFun); //No I18N
}
function nfa_configReportSettings(response){
    window.OPM.percentileInformation = (response.percentileInformation==="true"); //NO I18N
}

function nfa_getNSTColumnModelList(){
    return [
            {name: "time", 		index:"time"}, //NO I18N
            {name: "upload", 	index:"upload"}, //NO I18N
            {name: "download", 	index:"download"} //NO I18N
    ];
}
function nfa_redirectToSnapshot(snapName, sourceID, subTab, dataDirection, type, timeFrame) {
    var drillDownWidgetParams = {};
    drillDownWidgetParams.inOutVal = dataDirection;
    drillDownWidgetParams.Type = type;
    drillDownWidgetParams.param = "Type"; //NO I18N
	drillDownWidgetParams.ResolveDNS = false;
	drillDownWidgetParams.isNetwork = false;
	drillDownWidgetParams.isLocation = false;

	if("Conversation"===type) {
        drillDownWidgetParams.param = "ResolveDNS"; //NO I18N
    }

    nfa_setTimeFrameForDashboardDrillDown(timeFrame);
    OPMClient.HomeDetailsController.set("isNFANetworkMapDrillDown", false); //NO I18N
    OPMClient.HomeDetailsController.isFromDashboardDrillDown=true;
    OPMClient.InventoryDeviceDetailsController.expandSnapWidget=false;
    OPMClient.HomeDetailsController.drillDownWidgetName=subTab;
	OPMClient.HomeDetailsController.drillDownWidgetParams = drillDownWidgetParams;

    redirectToSnapshot(snapName,sourceID);
}
function nfa_switchCentAndRedirectToTPI(){
	if(window.isserver && !isAllCollectorSelected()){
		nfa_changeColOpt("-1"); //NO I18N
	}
	location.href = '/apiclient/ember/index.jsp#/Settings/Basic/AddOnProductSummary';
}
