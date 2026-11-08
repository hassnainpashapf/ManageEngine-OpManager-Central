//$Id$
//This file has Elements Grouping related functions
var bselectedCustomer = "";
var bselectedProbe = "";
function opm_getGroupElements()
{
	return (opm_ajaxGetResponse(window.OPM.apiUrlPattern +'/admin/getGroupCategories?'));//No I18N
}
function getGroupSubElements()
{
	var jsonData = opm_ajaxGetRequest(window.OPM.apiUrlPattern +"/device/getDeviceCategories?type=group"); //No I18N
	var optionsHeader = {'Business View':Ember.I18n.t('webclient.reports.rightlist.businessview',this),'Infrastructure View':Ember.I18n.t('webclient.Categories',this),'General':Ember.I18n.t('webclient.devices.details.general',this),'Groups':Ember.I18n.t('webclient.opm.groups',this)};//No I18N
	var elementArr = [];
	var arr = [];
	if(jsonData.data !== undefined)
	{

		$.each(jsonData.data, function (header, val)
		{
			if(!$.isEmptyObject(val))
			{	
				var arrObj = {};
				arrObj.id = optionsHeader[header];
				arrObj.text = optionsHeader[header];
				arrObj.children = [];
				$.each(val,function(k,j){
					arrObj.children.push({id:k,text:j});
				});
				elementArr.push(arrObj);
			}
	    });
	}
	Ember.run.scheduleOnce('afterRender',function(){//No I18N
		$("#grpSubElements").empty();
		$("#grpSubElements").select2({data:elementArr}); //No I18N
		$("#grpSubElements").val('4').trigger('change');
	});
}

function getInterfaceTypeList()
{
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/device/getInterfaceTypes');//No I18N
	var arrObj = [{key:'-1',value:Ember.I18n.t('webclient.Select')}];//No I18N
	if(jsonData !== undefined)
	{

		$.each(jsonData, function (key, val)
		{
			if(!$.isEmptyObject(val))
			{
				arrObj.push({key:val.typeid,value:val.name});

			}
	    });
	}
	return arrObj;
}

function getApmMonitorTypesList(){
	var jsonData =opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/device/getCustomCategoryList',{isFluidic:true,categoryType:'APMType'});//No I18N
	var arrObj = [{key:'-1',value:Ember.I18n.t('webclient.Select')}];//No I18N
	 if(jsonData !== undefined && jsonData.error === undefined){
		$.each(jsonData,function(){
			arrObj.push({key:this.categoryName,value:this.categoryDisplayName});
		});
	}
	return arrObj;
}

function getProbeListForCustomer(customerId)
{
	var jsonData = opm_ajaxGetRequest(window.OPM.apiUrlPattern + "/admin/getProbeListForCustomer?CustomerID="+customerId); //No I18N
	var arrObj = [];
	$.each(jsonData.data,function(k,v) {
	 	arrObj.push({DISPLAYNAME:v.ProbeDisplayName,PROBEID:v.ProbeID,NAME:v.ProbeName});
	});
	return arrObj;
}

function getAndSetSelectedMembersArr(){
	var selMembers = OPMClient.entitySelectionController.selectedEntities;
	var arr = [];
	if(selMembers.length > 0)
	{
		if(!OPMClient.SettingsAddEditController.operation && (OPMClient.SettingsAddEditController.pageObj.GroupDetails.alertMembers !== undefined && OPMClient.SettingsAddEditController.pageObj.GroupDetails.alertMembers.length >0))
		{
			$.each(selMembers,function(k,opt){
				var optSelected = false;
				$.each(OPMClient.SettingsAddEditController.pageObj.GroupDetails.alertMembers,function(k,v){
					var entity = OPMClient.entitySelectionController;
					if((entity.isInterfacesTab && opt.interfaceName === v.key)  || (entity.isGroupsTab && opt.groupName === v.key) || (opt.deviceName === v.key))
					{
						optSelected = true;
						return;
					}
				});
				getselectedMembersForGroups(arr,opt,optSelected);
			});
			
		}else{
			$.each(selMembers,function(index,entityObject){

				getselectedMembersForGroups(arr,entityObject,false);
			});
		}
		
		OPMClient.GroupingController.set('selectedGroupElementsArr',arr);//No I18N
		return true;
	}
}
function getselectedMembersForGroups(arr,entityObject,isSelected){
	if(OPMClient.entitySelectionController.isInterfacesTab){
		arr.push({'value':entityObject.id,'displayName':entityObject.interfaceDisplayName,"isSelected":isSelected}); //No I18N
	}
	else if(OPMClient.entitySelectionController.isGroupsTab){
		arr.push({'value':entityObject.id,'displayName':entityObject.displayName,"isSelected":isSelected}); //No I18N
	}
	else{
		arr.push({'value':entityObject.id,'displayName':entityObject.displayName,"isSelected":isSelected}); //No I18N
	}

}
function loadAvailGroupMembersByCustomer(element,subElem)
{
	var groupElements = $("#grpElements").val();
	if(groupElements !== "0")
	{
		var eleUrl = (window.OPM.apiUrlPattern +"/admin/getGroupElements?entityid="+element); //No I18N
		if(!OPMClient.SettingsAddEditController.operation){
			eleUrl += "&groupName="+OPMClient.SettingsAddEditController.pageObj.GroupDetails.groupName; //No I18N
		}
		if(element === "device"){
			$("#grpSubElements").val(subElem);
			eleUrl += "&typeid="+subElem; //No I18N
		}
		if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
		{
			OPMClient.GroupingController.selectedGroupElementsArr = new Array();
			var probeID=$("#probegrpElements").val();
			if(probeID==="All"){
				probeID=-1;
			}
			eleUrl += "&customerID="+$("#customergrpElements").val()+"&probeID="+probeID; //No I18n
		}
		getAndSetEleObjects(eleUrl);
	}
}
function loadAvailGroupMembersByProbe(element,subElem)
{
	var groupElements = $("#grpElements").val();
	if(groupElements !== "0")
	{
		var eleUrl = (window.OPM.apiUrlPattern +"/admin/getGroupElements?entityid="+element); //No I18N
		if(!OPMClient.SettingsAddEditController.operation){
			eleUrl += "&groupName="+OPMClient.SettingsAddEditController.pageObj.GroupDetails.groupName; //No I18N
		}
		if(element === "device"){
			$("#grpSubElements").val(subElem);
			eleUrl += "&typeid="+subElem; //No I18N
		}
		if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
		{
			if(OPMClient.GroupingController.selectedGroupElementsArr.length >0 && OPMClient.SettingsAddEditController.operation){

				if(!confirm(Ember.I18n.t('opm.group.changecustomer.device',this))){
					$("#probegrpElements").val(bselectedProbe).select2();
					return;
				}else{
					OPMClient.GroupingController.selectedGroupElementsArr = new Array();
				}
			}

			var probeID=$("#probegrpElements").val();
			if(probeID==="All"){
				probeID=-1;
			}
			eleUrl += "&customerID="+$("#customergrpElements").val()+"&probeID="+probeID; //No I18n
		}
		getAndSetEleObjects(eleUrl);
	}
}
function loadAvailGroupMembers(element,subElem){

	var eleUrl = (window.OPM.apiUrlPattern +"/admin/getGroupElements?entityid="+element); //No I18N
	if(!OPMClient.SettingsAddEditController.operation){
		eleUrl += "&groupName="+OPMClient.SettingsAddEditController.pageObj.GroupDetails.groupName; //No I18N
	}
	if(window.OPM.isCentralServer){//No I18N
		eleUrl += '&probeID='+$('#grpByProbe').val();//No I18N
	}
	if(element === "device"){
		$("#grpSubElements").val(subElem);
		eleUrl += "&typeid="+subElem; //No I18N
	}else if(element === "interface"){ //No I18N
		$("#grpSubElements").val(subElem);
		eleUrl += "&typeid="+subElem; //No I18N
	}
	if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
	{
		/*if(OPMClient.GroupingController.selectedGroupElementsArr.length >0 && OPMClient.SettingsAddEditController.operation){

			if(!confirm(Ember.I18n.t('opm.group.changecustomer.device',this))){
				$("#probegrpElements").val(bselectedProbe).select2();
				return;
			}
		}*/
		eleUrl += "&customerID="+$("#customergrpElements").val()+"&probeID="+$("#probegrpElements").val(); //No I18n
	}

	//$("#grpSubElements").trigger('change');
	var selMembers = $("#selectedListName option");

	if(selMembers.length > 0)
	{
		OPMClient.GroupingController.selectedGroupElementsArr = new Array();
		$.each(selMembers,function(k,v){
			var removeIndex = OPMClient.GroupingController.selectedGroupElementsArr.map(function(item){return item.value;}).indexOf($(v).val());
			if(removeIndex === "-1" || removeIndex === -1)
			{
				 OPMClient.GroupingController.selectedGroupElementsArr.pushObject({'value':$(v).val(),'displayName':$(v).text()});//No I18N
			}
		});
	}
	getAndSetEleObjects(eleUrl);
}
function getAndSetEleObjects(eleUrl)
{
	var resultArr = [];
	$.ajax({
            url: eleUrl,
            type: 'GET', //No I18N
            async: false,
            dataType:'json',//No I18N
            success: function(jsonResp)
            {
            	if(jsonResp !== undefined && jsonResp !== null && Object.keys(jsonResp).length > 0){
            		$.each(jsonResp,function(i,obj){
            			if(OPMClient.GroupingController.selectedGroupElementsArr.length >0 ){
            				resultArr.push({'value':obj.key,'displayName':obj.value});
            				$.each(OPMClient.GroupingController.selectedGroupElementsArr,function(k,v){
            					if(obj.key === v.value){
            						resultArr.pop();
            					}
            				});
            			}else{
            				resultArr.push({"value":obj.key,"displayName":obj.value});
            			}
	                });
            	}
            	OPMClient.GroupingController.set("availableGroupElementsArr",resultArr);//No I18N
            	//triggerAssociationComponent(OPMClient.GroupingController.availableGroupElementsArr,OPMClient.GroupingController.selectedGroupElementsArr,Ember.I18n.t('webclient.opm.group.availMember',this),Ember.I18n.t('webclient.opm.group.selectedMember',this),"250");//No I18N
            	triggerAssociationComponent(OPMClient.GroupingController.availableGroupElementsArr,OPMClient.GroupingController.selectedGroupElementsArr);//No I18N
            }
        });
		
}
function setGroupBasicDetails(editObj)
{
	if(editObj.copyAs!==undefined && editObj.copyAs===true)
	{
		$('#loGroupName').val("Copy of "+editObj.GroupDetails.groupDisplayName);
	}
	else{
		$('#loGroupName').val(editObj.GroupDetails.groupDisplayName);
	}
	$('#loGroupDesc').val(editObj.GroupDetails.description);
	var arr = [];
	if(editObj.GroupDetails.selectedMembers !== undefined)
	{
		// $.each(editObj.GroupDetails.selectedMembers,function(k,obj){
		// 	arr.push({"value":obj.key,"displayName":obj.value});
		// });
		OPMClient.entitySelectionController.set('selectedEntities',editObj.GroupDetails.selectedMembers);//No I18N
		OPMClient.GroupingController.set('selectedGroupElementsArr',arr);//No I18N
	}
}
function setAlertElemetselection(editObj)
{
	var arr = [];
		if(editObj.GroupDetails.alertMembers !== undefined)
		{
			$.each(editObj.GroupDetails.alertMembers,function(k,obj){
				$('input:checkbox[name="alerMem"][value="'+obj.key+'"]').prop('checked',true);
			});
		}
}
function validateGroupingStepOne()
{
	var grpName = $("#loGroupName").val();
	var grDesc = $("#loGroupDesc").val();
	var isInValidName = !opm_isValidName(grpName,"~!@#$%^&*()+=[]\\\';,/{}|\":<>?`"); //No I18N 
	var isInValidDesc = !opm_isValidName(grDesc,"~!@#$%^&*()+=[]\\\';,/{}|\":<>?_`"); //No I18N 
	var fieldsToValidate = {'empty':['loGroupName'],'maxCheck':{'loGroupName':50,'loGroupDesc':250},'custom':[{'identifier':'loGroupName','condition':isInValidName,'message':Ember.I18n.t('webclient.splcharmsg.dtmonname')},{'identifier':'loGroupDesc','condition':isInValidDesc,'message':Ember.I18n.t('webclient.splcharmsg.dtmonname')}]}; //No I18N
	return opm_validateFields(fieldsToValidate);
}

function goToOnOrBackwardSteps(frmStep,toStep,action)
{
    $('.grpSteps').hide();
    $('#groupCreationSt'+toStep).show();
    $('#stage'+frmStep).addClass('complete');
    $(".opmFormHolder").scrollTop(0);
}
function validateSelectionCriteria(filtersList)
{
	var eleSelectType = $("input:radio[name='eleSelect']:checked").val();
	var elem = $('#grpElements option:selected').val();
	if(eleSelectType === "1")
	{
		//var selMembers = $("#selectedListName option");//No I18N
		var selMembers = OPMClient.entitySelectionController.selectedEntities;

		if(selMembers.length <= 0)
		{
			alert(Ember.I18n.t('webclient.settings.group.elemt.empty',this));//No I18N
			return false;
		}else{
			// $.each(selMembers,function(k,v){
			// 	var removeIndex = OPMClient.GroupingController.selectedGroupElementsArr.map(function(item){return item.value;}).indexOf($(v).val());
			// 	var removeAvailArIndex = OPMClient.GroupingController.availableGroupElementsArr.map(function(item){return item.value;}).indexOf($(v).val());
			// 	if(removeIndex === "-1" || removeIndex === -1)
			// 	{
			// 		 OPMClient.GroupingController.selectedGroupElementsArr.pushObject({'value':$(v).attr("value"),'displayName':$(v).text()});//No I18N
			// 	}

			// 	if(removeAvailArIndex !== "-1" || removeIndex !== -1)
			// 	{
			// 		OPMClient.GroupingController.availableGroupElementsArr.splice(removeAvailArIndex,1);
			// 	}
			// });
			return true;
		}
	}else{
		//validate criteria in AdvancedReport Flow
		var filtersData = getSelectedFiltersData(filtersList,'GroupingCriteria');//NO I18N
		if(filtersData===false) {
			return false;
		}
		return filtersData;
	}
}
function loadCriteriaBaseMembers(gName,resource,selectedFiltersData)
{
	var data = {};
	data.groupName = gName;
	data.groupType = resource;
	data.selectedFilters = JSON.stringify(selectedFiltersData);
	if (window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected) {
		data.customerID = $("#customergrpElements").val(); //No I18N
	}
	var resultArr = [];
	$.ajax({
            url: window.OPM.apiUrlPattern+"/admin/runRuleFilter?",//No I18N
            type: 'GET', //No I18N
            async: false,
            data:data,
            dataType:'json',//No I18N
            success: function(jsonResp)
            {
            	if(jsonResp !== undefined && jsonResp !== null && Object.keys(jsonResp).length > 0 && jsonResp.error === undefined && jsonResp.result === undefined){

            		if(!OPMClient.SettingsAddEditController.operation && (OPMClient.SettingsAddEditController.pageObj.GroupDetails.alertMembers !== undefined &&OPMClient.SettingsAddEditController.pageObj.GroupDetails.alertMembers.length >0))
            		{
            			$.each(jsonResp,function(i,obj){
            				var optSelected = false;
	            			$.each(OPMClient.SettingsAddEditController.pageObj.GroupDetails.alertMembers,function(k,v){
	            				if(obj.key===v.id || obj.key === v.key)
	            				{
	            					optSelected = true;
	            					return;
	            				}
	            			});
	            			resultArr.push({"value":obj.key,"displayName":obj.value,isSelected:optSelected});
		                });	
            		}else{
            			$.each(jsonResp,function(i,obj){
	            			resultArr.push({"value":obj.key,"displayName":obj.value,isSelected:false});
		                });
	            	}
	             	OPMClient.GroupingController.set('selectedGroupElementsArr',resultArr);//No I18N
            	}
            	else{
            		showMessage(jsonResp);
            		OPMClient.GroupingController.set('selectedGroupElementsArr',resultArr);//No I18N
            	}
            }
        });

}
function logicalGroupSnapActions(action)
{	var grpName = OPMClient.InventoryDeviceDetailsController.selDevice;
	var rowData = [];
	var arr = [];
	rowData.groupName = grpName;
	if(action === "edit")
	{
		if(window.OPM.isRMMCentral) {
			rowData = {}
			rowData.groupName = grpName;
			localStorage.setItem('rmm_groupedit_obj', JSON.stringify(rowData)); //No I18n
		}
		OPMClient.SettingsAddEditController.pageObj = rowData;
		OPMClient.SettingsAddEditController.slidePageHeader=Ember.I18n.t('webclient.action.edit')+" - "+grpName; //No I18N
		settingsGlobalRoute.transitionTo('Settings.Configurations.ElementsGroup.Update');  //No I18N

	}else{
		arr.push(grpName);
		var re = opm_deleteLogicalGroupsFrmInv(arr);
		if(re)
		{
			if(window.OPM.isMSPCentral){
				opmGlobalRoute.transitionTo('Settings.Configurations.ElementsGroup.Index'); //No I18n
			}
			else{
				location.href=window.OPM.apiclientUrl+"Inventory/List/Summary/GROUP"; //No I18N
			}
		}
	}
}
function showHideMemberselectionOpt(ele,selMethod)
{
	OPMClient.entitySelectionController.initializeFields();
	if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
	{
		OPMClient.entitySelectionController.setProperties({hideApplyButton:true,hideCustomerFilter:false,hideProbeFilter:false});
	}
	if(ele == "group")
		{
			$(".chooseType").show();
			$(".nonCriteria").show();
		//	$(".grpSubElements").hide();
			if(selMethod === "1")
			{
				$("input:radio[name='eleSelect'][value='1']").prop('checked',true);
				OPMClient.entitySelectionController.setProperties({hideApplyButton:true,isGroupsTab:true});
				OPMClient.entitySelectionController.initEditDeviceProps();
				//loadAvailGroupMembers(ele);
			}else{
				$(".nonCriteria").hide();
				$(".criteriaOpts").show();
				$("input:radio[name='eleSelect'][value='2']").prop('checked',true);
				var filtersData = loadGroupCriteriaAndConditions(ele);
				return filtersData;
			}
			
		}
		else if(ele === "device")
		{
			//getGroupSubElements();
			$(".chooseType").show();
			$(".nonCriteria").show();
		//	$(".grpSubElements").show();
		//	$("#grpSubElements").val("4").prop('selected',true);
			if(OPMClient.SettingsAddEditController.operation){
				OPMClient.GroupingController.selectedGroupElementsArr = new Array();
			}
			if(selMethod === "1")
			{
				$("input:radio[name='eleSelect'][value='1']").prop('checked',true);
				OPMClient.entitySelectionController.setProperties({hideCategoryFilter:false});
				enableCentralFiltersForGroups();
				OPMClient.entitySelectionController.initEditDeviceProps();
			//	loadAvailGroupMembers(ele,"4");
			}else{
				$(".nonCriteria").hide();
				$(".criteriaOpts").show();
				$("input:radio[name='eleSelect'][value='2']").prop('checked',true);
				var filtersData = loadGroupCriteriaAndConditions(ele);
				return filtersData;
			}
		}else if(ele === "interface") //No I18N
		{
			//getGroupSubElementsForInterface();
			$(".chooseType").show();
			$(".nonCriteria").show();
		//	$(".grpSubElements").show();
		//	$("#grpSubElements").val("4").prop('selected',true);
			if(OPMClient.SettingsAddEditController.operation){
				OPMClient.GroupingController.selectedGroupElementsArr = new Array();
			}
			if(selMethod === "1")
			{
				$("input:radio[name='eleSelect'][value='1']").prop('checked',true);
				OPMClient.entitySelectionController.setProperties({hideInterfaceTypeFilter:false,isInterfacesTab:true});
				enableCentralFiltersForGroups();
				OPMClient.entitySelectionController.initEditDeviceProps();
			//	loadAvailGroupMembers(ele,"6");
			}else{
				$(".nonCriteria").hide();
				$(".criteriaOpts").show();
				$("input:radio[name='eleSelect'][value='2']").prop('checked',true);
				var filtersData = loadGroupCriteriaAndConditions(ele);
				return filtersData;
			}
		}else if(ele === "apmservers") //No I18N
		{

			$(".chooseType").hide();
			$(".nonCriteria").show();
	//		$(".grpSubElements").hide();
			if(selMethod === "1")
			{
				$("input:radio[name='eleSelect'][value='1']").prop('checked',true);
				OPMClient.entitySelectionController.setProperties({hideApplyButton:true,isAPMServersTab:true});
				OPMClient.entitySelectionController.initEditDeviceProps();
				//loadAvailGroupMembers(ele);
			}else{
				$(".nonCriteria").hide();
				$(".criteriaOpts").show();
				$("input:radio[name='eleSelect'][value='2']").prop('checked',true);
				loadGroupCriteriaAndConditions(ele);
			}
		}else if(ele === "apmmonitors") //No I18N
		{
			$(".chooseType").show(); //No I18N
			$(".nonCriteria").show(); //No I18N
			if(OPMClient.SettingsAddEditController.operation){
				OPMClient.GroupingController.selectedGroupElementsArr = new Array();
			}
			if(selMethod === "1") //No I18N
			{
				$("input:radio[name='eleSelect'][value='1']").prop('checked',true); //No I18N
				OPMClient.entitySelectionController.setProperties({hideAPMMonitorsTypeFilter:false,isAPMMonitorsTab:true});
				enableCentralFiltersForGroups();
				OPMClient.entitySelectionController.initEditDeviceProps();
			//	loadAvailGroupMembers(ele,"6");
			}else{
				$(".nonCriteria").hide(); //No I18N
				$(".criteriaOpts").show(); //No I18N
				$("input:radio[name='eleSelect'][value='2']").prop('checked',true); //No I18N
				var filtersData = loadGroupCriteriaAndConditions(ele);
				return filtersData;
			}
		}else if(ele === "ipsla") //No I18N
		{
			$(".chooseType").hide();
			$(".nonCriteria").show();
			$(".grpSubElements").hide();
			if(selMethod === "1")
			{
				$("input:radio[name='eleSelect'][value='1']").prop('checked',true);
				OPMClient.entitySelectionController.setProperties({hideApplyButton:true,isIPSLATab:true});
				OPMClient.entitySelectionController.initEditDeviceProps();
				//loadAvailGroupMembers(ele);
			}else{
				$(".nonCriteria").hide();
				$(".criteriaOpts").show();
				$("input:radio[name='eleSelect'][value='2']").prop('checked',true);
				loadGroupCriteriaAndConditions(ele);
			}
		}
		else{
			$(".chooseOpts").hide();
			$(".nonCriteria").hide();
			$(".criteriaOpts").show();
			$("input:radio[name='eleSelect'][value='2']").prop('checked',true);
			if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
			{
				OPMClient.entitySelectionController.initializeEEFilterData();
			}
			var filtersData = loadGroupCriteriaAndConditions(ele);
			return filtersData;
		}
}
function enableCentralFiltersForGroups(){
	if(window.OPM.isMSPCentral && OPMClient.ApplicationController.isMSPCentralSelected)
	{
		OPMClient.entitySelectionController.setProperties({hideCustomerFilter:false,hideProbeFilter:false});
	}
	else if(OPMClient.ApplicationController.isCentralServer)
	{
		OPMClient.entitySelectionController.setProperties({hideProbeFilter:false});
	}else{
		OPMClient.entitySelectionController.setProperties({hideApplyButton:true});
	}

}
function checkGroupRuleAlreadyExists(rowObj)
{
	var retBoolean = false;
	if(OPMClient.GroupingController.groupCriterialObj!==undefined && OPMClient.GroupingController.groupCriterialObj.ruleSet !==undefined && OPMClient.GroupingController.groupCriterialObj.ruleSet.rules!==undefined)
	{
		retBoolean = checkContainsRule(rowObj,OPMClient.GroupingController.groupCriterialObj.ruleSet.rules.PROPERTIES);
	}
	return retBoolean;
}

function updateGroupName(grpName,grpID)
{		
	var groupNameField = document.getElementById("groupNameVal"); //No I18n
	groupNameField.addEventListener("keyup", function(event) 
	{
		event.preventDefault();
		if(event.key === "Enter" && event.keyCode === 13) { //No I18n		    
		    var url = window.OPM.apiUrlPattern +'/admin/updateLogicalGroup';//No I18N
			var groupDisplayName = $('#groupNameVal').val().trim();
			var data = {'groupName':grpName,'displayName':groupDisplayName,'groupID':grpID,'displayNameUpdate':'true','callAction':'GroupSnapshot'}; //No I18N	
			var isInValidName = !opm_isValidName(groupDisplayName,"~!@#$%^&*()+=[]\\\';,/{}|\":<>?`"); //No I18N 
			var fieldsToValidate = {'empty':['groupNameVal'],'maxCheck':{'groupNameVal':50},'custom':[{'identifier':'groupNameVal','condition':isInValidName,'message':Ember.I18n.t('webclient.splcharmsg.dtmonname')}]}; //No I18N
			
			if(opm_validateFields(fieldsToValidate))
			{
				$.ajax({
					url: url,	
					type: 'POST', //No I18N
					dataType:'json',//No I18N
					data: data,
					success: function(response){					
						if(response.error != undefined && response.error.message !== undefined)
						{
							opm_infoMsgs("errorMsg",response.error.message);	//No I18N	
							$('#groupNameVal').focus();														
							return false;
						}
						else if(response.result != undefined && response.result.message !== undefined)
						{
			    			opm_infoMsgs("successMsg",response.result.message);	//No I18N
			    			$('.groupNameSection').removeClass('active');
			    			$('.groupName').text(groupDisplayName);
			    			$('#nameOnly').text(groupDisplayName);			    	
						}
					}
				});
			}			
		}
		else if(event.key === 'Escape')
		{
			$('.groupNameSection').removeClass('active');
	    	$('.groupName').text($('#nameOnly').text());	
	    	$("#groupNameVal").removeClass('validateField error');//No I18N
		}
	});
}
function opm_createSmartGroup(type,uID,action)
{
	var url = window.OPM.apiUrlPattern +'/admin/updateCustomFieldGroupAction';//No I18N
	var data = {"type":type,"key":uID,"groupAction":action};//No I18N
	var response = opm_ajaxPostRequest(url,data);
	if(response.result != undefined && response.result.message !== undefined && action != "ignore")
	{
		$("html").removeClass("MessageViewBoxOpen secondLevelNavActive");//No I18N
		showMessage(response);
		opm_loadGroupingGrid();

	}
	else if(response.error != undefined && response.error.message !== undefined)
	{
		showMessage(response);
	}else if(action === "ignore")//No I18N
	{
		$("html").removeClass("MessageViewBoxOpen secondLevelNavActive");//No I18N
	}

}
function showGroupsMapSlide(groupName,grpID,groupType) {
	
	var groupDetails = {groupID:grpID,groupName:unescape(groupName),groupType:groupType};
	OPMClient.GroupingController.set("groupDetails",groupDetails);//No I18N
	Ember.run.schedule("afterRender", function () { //No I18N
		var mapSlideDetails = {};
		mapSlideDetails.id = "groups_map";//No I18N
		mapSlideDetails.componentName = "OPMClient.OpmGroupsMapComponent";//No I18N
		mapSlideDetails.isFull = true;
		mapSlideDetails.slideHeader = Ember.I18n.t('webclient.selectview.MapView',this)+" - "+ unescape(groupName);//No I18N
		OPMClient.GroupingController.set("mapSlideDetails",undefined);//No I18N
    OPMClient.GroupingController.set("mapSlideDetails",mapSlideDetails);//No I18N

	});
	
}
function showGroupsMapSlide(groupName,grpID,groupType) {
	
	var groupDetails = {groupID:grpID,groupName:unescape(groupName),groupType:groupType};
	OPMClient.GroupingController.set("groupDetails",groupDetails);//No I18N
	Ember.run.schedule("afterRender", function () { //No I18N
		var mapSlideDetails = {};
		mapSlideDetails.id = "groups_map";//No I18N
		mapSlideDetails.componentName = "OPMClient.OpmGroupsMapComponent";//No I18N
		mapSlideDetails.isFull = true;
		mapSlideDetails.slideHeader = Ember.I18n.t('webclient.selectview.MapView',this)+" - "+ unescape(groupName);//No I18N
		OPMClient.GroupingController.set("mapSlideDetails",undefined);//No I18N
    OPMClient.GroupingController.set("mapSlideDetails",mapSlideDetails);//No I18N

	});
	
}

