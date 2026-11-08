// $Id$
function getIPAddressFromLong(ipLongVal) {
    // Taken this code from http://javascript.about.com/library/blipconvert.htm

    var ipAddr = "";//No I18N
    if (ipLongVal !== undefined) {
        ipAddr = ipLongVal % 256;
        for (var i = 3; i > 0; i--) {
            ipLongVal = Math.floor(ipLongVal / 256);
            ipAddr = ipLongVal % 256 + '.' + ipAddr;//No I18N
        }
    }
    return ipAddr;
	
}
function showIPEditMsg(){
    $('#iptodnsHelpCard').show();
}
function hideEditMsg(){
    $('#iptodnsHelpCard').hide();
}
function gotoEditAD(params)
{
    OPMClient.SettingsOpUtilConfigController.set('uniqueID',$(params).attr('id'));//No I18N
    OPMClient.InventoryOpUtilsController.set("backtoParantRoute","/Inventory/List/OpUtils/DHCP"); //No I18N
    OPMClient.InventoryOpUtilsController.set("backToInvDynamicParam","DHCP");//No I18N
    OPMClient.InventoryOpUtilsController.set("dhcpServerAddress",$(params).attr('value'));//No I18N
}
function gotovalidateAD(params){
    if(params!=='-1'&&params!==""){
    var json = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/ipam/getAdDomainDetails?domainId="+params); //No I18n
    var json = json.result[0];
    if(json['user-name']===''||json['user-name']===null){
        $('#ADUserCredUpdate').show();
        OPMClient.InventoryOpUtilsController.set('updateADUserCredEnabled',true);//No I18N
        OPMClient.InventoryOpUtilsController.set('ADDomain',json["ad-domain-name"]);//No I18N
        OPMClient.InventoryOpUtilsController.set('ADDomainControlName',json["domain-controller-name"]);//No I18N
    }
    else{
        $('#ADUserCredUpdate').hide();
        OPMClient.InventoryOpUtilsController.set('updateADUserCredEnabled',false);//No I18N
    }
}
    else{
            $('#ADUserCredUpdate').hide();
            OPMClient.InventoryOpUtilsController.set('updateADUserCredEnabled',false);//No I18N
        }
}

function updateDHCPPortNo(params){
    if(params=='HTTPS'){
        $('#dhcpPortNo').val(5986);
        $('#protocolInfoMsg').show();
    }else{
        $('#dhcpPortNo').val(5985);
        $('#protocolInfoMsg').hide();
    }
}

function opm_validateIPorHostName(paramVal){
    if (paramVal != ""){
        var objRegExp  = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;  
        return objRegExp.test(trimAll(paramVal));    
    }else{
        return false;
    }
}

function deleteSubnetsInWidget(gid,subnetid){
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.SUBNET_DELETED',this)); //No I18N
            var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N 
            reloadSnapWidgetsByWidgetID(wid);
        }
    }
    if(confirm(Ember.I18n.t('opu.tree.ipam.DELETE_SUBNET_CONFORM',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/deleteSubnets";//NO I18N
        opm_ajaxPostRequestWithMsg(url, {"NETID":subnetid}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }
    
}

function deletePolicyInWidget(gid,policyId,serverId){
    if(confirm(Ember.I18n.t('opu.ipam.DHCP.POLICY_DELETE_CONFIRM',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/removeDHCPIPv4Policy";//NO I18N
        opm_ajaxPostRequestWithMsg(url,{"dhcpPolicyId":policyId, "dhcpServerId":serverId}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
            if(response !== null && response.status == "Success")
                {
                    if(response.result !== null && response.result !== undefined){
                        opm_infoMsgs("successMsg",response.result); //No I18N
                    }else{
                        opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
                    }
                     var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
                    OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N
                    reloadSnapWidgetsByWidgetID(wid);
                }else{
                    if(response.message !== undefined && response.message !== ""){
                        opm_infoMsgs("errorMsg",response.message); //No I18N
                    }
                    else{
                        opm_infoMsgs("errorMsg",response.error.message); //No I18N
                    }
                }
        },otpPageType: 'slide'});//NO I18N
    }
}

function deleteScopeInWidget(gid,scopeId){
    if(confirm(Ember.I18n.t('opu.ipam.DHCP.SCOPE_DELETE_CONFIRM',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/removeDHCPIPv4Scope";//NO I18N
        opm_ajaxPostRequestWithMsg(url,{"dhcpScopeId":scopeId,"dhcpServerId":OPMClient.InventoryOpUtilsController.dhcpServerID}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
            if(response !== null && response.status == "Success")
                {
                    if(response.result !== null && response.result !== undefined){
                        opm_infoMsgs("successMsg",response.result); //No I18N
                    }else{
                        opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
                    }
                     var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
                    OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N
                    reloadSnapWidgetsByWidgetID(wid);
                }else{
                    if(response.message !== undefined && response.message !== ""){
                        opm_infoMsgs("errorMsg",response.message); //No I18N
                    }
                    else{
                        opm_infoMsgs("errorMsg",response.error.message); //No I18N
                    }
                }
        },otpPageType: 'slide'});//NO I18N
    }
}
function fetchDHCPPolicyDetailsForEditPage()
{
    var cbmethod = function(response)
    {
        if(response.status === "Failure")
        {
            if(response.message !== undefined && response.message !== ""){
                opm_infoMsgs("errorMsg",response.message); //No I18N
            }
            else{
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
            }
            deviceSlideOut(2);
            backToDevSnapshotPage();
        }else
        {
            $("#dhcpPolicyLodingPageDiv").hide();
            $("#dhcpAddPolicyPageDiv").show();
            OPMClient.InventoryOpUtilsController.DHCPPolicyRespDetails=response.rows[0];
            var policydetails = OPMClient.InventoryOpUtilsController.DHCPPolicyRespDetails;
            var serverid = policydetails['dhcpServer-id'];//NO I18N
            var assingto = policydetails['assign-to'];//NO I18N
            $('#dhcpserverip').val(serverid).change();
            if(assingto === "Scope"){
                var scopeid = policydetails['dhcpScope-id'];//NO I18N
                var dhcpscopes = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getDHCPScopeDetails?dhcpServerId='+$("#dhcpserverip option:selected").text());//No I18N
                OPMClient.InventoryOpUtilsController.set("MicroSoftDHCPScopes",[]);//NO I18N
                var allScopes = [];
                $.each(dhcpscopes.rows, function(dsindex,dhcpscp)
                {
                    var scopeobj = {"scopeaddr":dhcpscp['dhcp-scope-address'],"scopename":dhcpscp['dhcp-scope-name'],"scopeid":dhcpscp['dhcp-scope-id']};//No I18N
                    if(scopeid === dhcpscp['dhcp-scope-id']){//No I18N
                        scopeobj.isSelected=true;
                    }else{
                        scopeobj.isSelected=false;
                    }
                    allScopes.push(scopeobj);
                })
                OPMClient.InventoryOpUtilsController.set('MicroSoftDHCPScopes',allScopes); //No I18N
            }
            
            $("#policyname").val(policydetails.policyName);
            $("#policydesc").val(policydetails['policy-description']);//NO I18N
            if(policydetails['policy-status-int'] === "1"){
                $("#activeScope").prop("checked",true)
            }
            var assingto = policydetails['assign-to'];//NO I18N
            if(assingto === "Scope"){
                $('#dhcppolicyassignto').val("scopepolicy").change();
                var policyiprange = policydetails['policy-iprange'];//No I18N
                if(policyiprange !== undefined){
                    var pallstartendip = policyiprange.split(",");
                    $.each(pallstartendip, function(dsindex,iprange)
                    {
                        if(iprange.indexOf("-") !== -1){
                            var ips=iprange.split("-");
                            loadDHCPPolicyScopeStartEndIPList({"startip":ips[0],"endip":ips[1]});//No I18N
                        }
                    })
                }
                $("#dhcpscopes").prop("disabled", true);
            }
            $("#dhcppolicyassignto").prop("disabled", true);

            var lduration = policydetails.leaseDuration;
            if(lduration !== undefined){
               if(lduration == "Unlimited"){
                   $("input[name=leaseduration][value=unlimited]").prop("checked",true);
                   $("#leasdureationdiv").css("display","none");
               }else{
                   $("input[name=leaseduration][value=limited]").prop("checked",true);
                   $("#leasdureationdiv").css("display","block");
                   var ld = lduration.split(":");
                   $("#policyDurationDays").val(ld[0]);
                   $("#policyDurationHourly").val(ld[1]);
                   $("#policyDurationMinutes").val(ld[2]);
               }
            }
            var dhcpOptions = policydetails.Options;
            if(dhcpOptions !== undefined){
                $("#advacedsettings").addClass("active");
                $("#vendorclassoptionsrow").css("display","block");
                $("#dhcppolicyoptions").css("display","block");
                $.each(dhcpOptions, function(index,dops)
                {
                    var dhcpScopeRowData = {'vendorclasstext':dops.vendorClass,'vendorclassvalue':dops.vendorClass,"dhcpoptionstext":dops.optionName,"dhcpoptionvalue":dops.optionId,'value':dops.optionValue}; //No I18N
                    loadDHCPVendorClassList(dhcpScopeRowData);
                })
            }
            var condition = policydetails.condition;
            if(condition === "OR"){
                $("input[name=policyConditionMatch][value=or]").prop("checked",true);//No I18N
            }else{
                $("input[name=policyConditionMatch][value=and]").prop("checked",true);//No I18N
            }
            var pconditions = policydetails.Conditions;
            if(pconditions !== undefined){
                $.each(pconditions, function(index,pcond)
                {
                    $.each(pcond, function(eindex,epcond)
                    {
                        if(eindex === "EQ"){
                            for(var pcv=0;pcv<epcond.length;pcv++){
                                var pcondObj = {'value':epcond[pcv],'criteria':index,'key':index,"operator":eindex,'condition':Ember.I18n.t('webclient.admin.traps.equals',this),'conditionVal':eindex}; //No I18N
                                loadDHCPPolicyCriteriaList(pcondObj);
                            }
                        }else{
                            for(var pcv=0;pcv<epcond.length;pcv++){
                                var pcondObj = {'value':epcond[pcv],'criteria':index,'key':index,"operator":eindex,'condition':Ember.I18n.t('webclient.admin.traps.notequals',this),'conditionVal':eindex}; //No I18N
                                loadDHCPPolicyCriteriaList(pcondObj);
                            }
                        }

                    })
                })
            }
        }
    }
    var params = {"dhcpPolicyId":OPMClient.InventoryOpUtilsController.DHCPEditPolicyID,"dhcpServerId":OPMClient.InventoryOpUtilsController.DHCPEditPolicyServerID};//NO I18N
    var policyDetails = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/ipam/getDHCPIPv4PolicySummary', params,Ember.I18n.t('opu.ipam.fetching.configuration.msg',this),cbmethod);//No I18N
}
function editPolicyInWidget(wid, serverId, policyId){
    if(wid!=undefined&& (typeof wid != "number")){//No I18N
        if(wid.indexOf("opm_DeviceSnapList")!=-1){
            wid=wid.split('opm_DeviceSnapList')[1];//No I18N
        }
    }
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    OPMClient.InventoryOpUtilsController.set("DHCPEditPolicyServerID",serverId);//No I18N
    OPMClient.InventoryOpUtilsController.set("DHCPEditPolicyID",policyId);//No I18N
    opmGlobalRoute.transitionTo('Inventory.Device.EditDHCPPolicy');//No I18N
    fetchDHCPPolicyDetailsForEditPage();
}

function editScopeInWidget(wid, scopeId){
    if(wid!=undefined&& (typeof wid != "number")){//No I18N
        if(wid.indexOf("opm_DeviceSnapList")!=-1){
            wid=wid.split('opm_DeviceSnapList')[1];//No I18N
        }
    }
    var scopeDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getDHCPScopeDetails?dhcpScopeId='+scopeId+'&dhcpServerId='+OPMClient.InventoryOpUtilsController.dhcpServerID);//No I18N
    OPMClient.InventoryOpUtilsController.DHCPScopeRespDetails=scopeDetails.rows[0];
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    var dhcpsuperscopes = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getDHCPIPv4SuperscopeDetails?dhcpServerId='+OPMClient.InventoryOpUtilsController.dhcpServerID);//No I18N
    OPMClient.InventoryOpUtilsController.set("MicroSoftDHCPSuperscopes",[]);//NO I18N
    $.each(dhcpsuperscopes.result, function(dsindex,dhcpscp) {
        var objData = {"superscopeName":dhcpscp.superscopeName,"superscopeid":dhcpscp["superscope-id"]}//No I18N
        OPMClient.InventoryOpUtilsController.get('MicroSoftDHCPSuperscopes').pushObject(objData);
    })
    OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=OPMClient.InventoryOpUtilsController.DHCPScopeRespDetails;
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/EditDDIDHCPScope"; //No I18N
}
function editSubnetInWidget(gid,subnet){
    EditSubnet(subnet,gid);   
}
function scanSubnets(snapid,widgetIndex,wid,ids){

    if(ids==undefined){
        ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"subnetid");//No I18N
    } 
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        return;
    }
    var url = window.OPM.apiUrlPattern + "/ipam/scanSubnets";//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            if(wid==undefined){
                reloadSnapWidgets(widgetIndex, true);
            }
            else{
                OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
                reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID)
            }
            opm_infoMsgs("successMsg",msg); //No I18N
        }
    }
    opm_ajaxPostRequestWithMsg(url, {"NETID":ids}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}
function deleteSubnets(snapid,widgetIndex){
    var ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"subnetid");//No I18N
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('opu.client.SELECT_ONE_ROW_DELETE', this)); //No I18N
        return;
    }

    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            reloadSnapWidgets(widgetIndex, true);
            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
            opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.SUBNET_DELETED',this)); //No I18N
        }
    }
    if(confirm(Ember.I18n.t('opu.tree.ipam.DELETE_SUBNET_CONFORM',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/deleteSubnets";//NO I18N
        
        opm_ajaxPostRequestWithMsg(url, {"NETID":ids}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }
}

function updateForecastingMetaInfo(rsp, type) {
    if(rsp === undefined || rsp === null) {
        return;
    }
    var isDHCP = type === "Scope";//No I18N
    var countKey = isDHCP ? 'totalDHCPForecastingEnabledCount' : 'totalForecastingEnabledCount';//No I18N
    var capKey = isDHCP ? 'dhcpScopeForecastingCap' : 'subnetForecastingCap';//No I18N
    var totalEnabledCount = isDHCP ? rsp.totalDHCPForecastingEnabledCount : rsp.totalForecastingEnabledCount;
    var capValue = isDHCP ? rsp.dhcpScopeForecastingCap : rsp.subnetForecastingCap;
    if(totalEnabledCount !== undefined){
        OPMClient.InventoryOpUtilsController.set(countKey, parseInt(totalEnabledCount, 10) || 0);
    }
    if(capValue !== undefined){
        OPMClient.InventoryOpUtilsController.set(capKey, parseInt(capValue, 10) || 0);
    }
}

function showForecastingCapExceededMsg(capValue, totalEnabledCount, typeLabel) {
    var cap = parseInt(capValue, 10) || 0;
    var total = parseInt(totalEnabledCount, 10) || 0;
    var label = typeLabel || (Ember.I18n.t('webclient.Scope') + "/" + Ember.I18n.t('opstor.inventory.emc.isilon.network.pools.subnet'));
    var errMsg = Ember.I18n.t('opu.ipam.forecasting.cap.exceeded', {param0: label, param1: cap, param2: total});//No I18N
    opm_infoMsgs("errorMsg", errMsg); //No I18N
}
function isForecastingCapExceededForSelection(isAddAction, selectedCount, type){
    if(!isAddAction || selectedCount <= 0){
        return false;
    }
    var isDHCP = type === "Scope";//No I18N
    var countKey = isDHCP ? 'totalDHCPForecastingEnabledCount' : 'totalForecastingEnabledCount';//No I18N
    var capKey = isDHCP ? 'dhcpScopeForecastingCap' : 'subnetForecastingCap';//No I18N
    var typeLabel = isDHCP ? Ember.I18n.t('webclient.Scope') : Ember.I18n.t('opstor.inventory.emc.isilon.network.pools.subnet');//No I18N
    var totalEnabledCount = parseInt(OPMClient.InventoryOpUtilsController.get(countKey), 10);
    var forecastingCap = parseInt(OPMClient.InventoryOpUtilsController.get(capKey), 10);
    if(!isNaN(totalEnabledCount) && !isNaN(forecastingCap) && forecastingCap > 0 && (totalEnabledCount + selectedCount) > forecastingCap){
        showForecastingCapExceededMsg(forecastingCap, totalEnabledCount, typeLabel);
        return true;
    }
    return false;
}

function opm_getForecastingActionMessageKey(isAddAction, isSuccess){
    if(isAddAction){
        return isSuccess ? 'opu.ipam.forecasting.add.success' : 'opu.ipam.forecasting.add.failure';//No I18N
    }
    return isSuccess ? 'opu.ipam.forecasting.remove.success' : 'opu.ipam.forecasting.remove.failure';//No I18N
}

function opm_confirmForecastingRemoval(isAddAction) {
    if(isAddAction) {
        return true;
    }
    return confirm(Ember.I18n.t('opu.ipam.forecasting.remove.confirmation', this));//No I18N
}

function resetSelect2ActionById(selectId) {
    if($(selectId).length > 0){
        $(selectId).val("-1").trigger("change.select2");//No I18N
    }
}

function addSubnetForecasting(snapid, widgetIndex, actionType, wid){
    var selectId = "#param_" + wid + "_foreCasting";//No I18N
    if(actionType === undefined || actionType === null || actionType === "-1") {
        return;
    }
    var isAddAction = actionType === "addForecasting";//No I18N
    var ids = isAddAction?getEmberSelectedRowsWithCondition("opm_DeviceSnapList"+snapid,"subnetid","isforecastenabled",Ember.I18n.t('webclient.admin.scheduledt.disabled',this)):getEmberSelectedRowsWithCondition("opm_DeviceSnapList"+snapid,"subnetid","isforecastenabled",Ember.I18n.t('webclient.admin.scheduledt.enabled',this));//No I18N
    if(ids === undefined || ids === ""){
        var allSelectedIds = getEmberSelectedRows("opm_DeviceSnapList"+snapid,"subnetid");//No I18N
        if(allSelectedIds === undefined || allSelectedIds === "") {
            alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        } else {
            opm_infoMsgs("successMsg", Ember.I18n.t(opm_getForecastingActionMessageKey(isAddAction, true), this)); //No I18N
        }
        resetSelect2ActionById(selectId);
        return;
    }
    var widgetID = parseInt(wid, 10);
    if(isNaN(widgetID) && isNaN(parseInt(snapid, 10))) {
        resetSelect2ActionById(selectId);
        return;
    }
    if(isForecastingCapExceededForSelection(isAddAction, ids.split(",").length, "Subnet")){
        resetSelect2ActionById(selectId);
        return;
    }
    if(!opm_confirmForecastingRemoval(isAddAction)){
        resetSelect2ActionById(selectId);
        return;
    }
    var url = window.OPM.apiUrlPattern + (isAddAction ? "/ipam/addIPAMPerformanceMonitor" : "/ipam/removeIPAMPerformanceMonitor");//No I18N
    var params = {
        subnetIds: ids,
        type: "Subnet" //No I18N
    };
    var rsp = opm_ajaxPostRequest(url, params);
    var isSuccess = (rsp !== undefined && rsp.status !== "Failure" && rsp.status !== "false" && rsp.error === undefined);//No I18N
    updateForecastingMetaInfo(rsp, "Subnet");//No I18N
    if(isSuccess){
        opm_infoMsgs("successMsg", Ember.I18n.t(opm_getForecastingActionMessageKey(isAddAction, true), this)); //No I18N
        if(!isNaN(widgetID)) {
            OPMClient.InventoryOpUtilsController.widgetID = widgetID;
            reloadSnapWidgetsByWidgetID(widgetID);
        } else {
            reloadSnapWidgets(widgetIndex, true);
        }
    } else {
        var errMsg = Ember.I18n.t(opm_getForecastingActionMessageKey(isAddAction, false), this);
        var backendMessage = (rsp && rsp.message) || (rsp && rsp.error && rsp.error.message);
        if(backendMessage && backendMessage.indexOf('forecasting') !== -1){
            showForecastingCapExceededMsg(rsp ? rsp.subnetForecastingCap : undefined, rsp ? rsp.totalForecastingEnabledCount : undefined, Ember.I18n.t('opstor.inventory.emc.isilon.network.pools.subnet'));//No I18N
            errMsg = undefined;
        }
        if(errMsg !== undefined){
            opm_infoMsgs("errorMsg", errMsg); //No I18N
        }
    }
    resetSelect2ActionById(selectId);
}

function addDHCPForecasting(snapid, widgetIndex, actionType, wid){
    var selectId = "#param_" + wid + "_dhcpForeCasting";//No I18N
    if(actionType === undefined || actionType === null || actionType === "-1") {
        return;
    }
    var isAddAction = actionType === "addForecasting";//No I18N
    var selectedScopeIds = isAddAction ? getEmberSelectedRowsWithCondition("opm_DeviceSnapList"+snapid,"dhcp-scope-id","isforecastenabled",Ember.I18n.t('webclient.admin.scheduledt.disabled',this)) : getEmberSelectedRowsWithCondition("opm_DeviceSnapList"+snapid,"dhcp-scope-id","isforecastenabled",Ember.I18n.t('webclient.admin.scheduledt.enabled',this));//No I18N
    if(selectedScopeIds === undefined || selectedScopeIds === ""){
        var allSelectedScopeIds = getEmberSelectedRows("opm_DeviceSnapList"+snapid,"dhcp-scope-id");//No I18N
        if(allSelectedScopeIds === undefined || allSelectedScopeIds === "") {
            alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        } else {
            opm_infoMsgs("successMsg", Ember.I18n.t(opm_getForecastingActionMessageKey(isAddAction, true), this)); //No I18N
        }
        resetSelect2ActionById(selectId);
        return;
    }
    var widgetID = parseInt(wid, 10);
    if(isNaN(widgetID) && isNaN(parseInt(snapid, 10))) {
        resetSelect2ActionById(selectId);
        return;
    }
    var selectedCount = selectedScopeIds.split(",").length;
    if(isForecastingCapExceededForSelection(isAddAction, selectedCount, "Scope")){
        resetSelect2ActionById(selectId);
        return;
    }
    if(!opm_confirmForecastingRemoval(isAddAction)){
        resetSelect2ActionById(selectId);
        return;
    }
    var url = window.OPM.apiUrlPattern + (isAddAction ? "/ipam/addIPAMPerformanceMonitor" : "/ipam/removeIPAMPerformanceMonitor");//No I18N
    var params = {
        scopeIds: selectedScopeIds,
        type: "Scope" //No I18N
    };
    var rsp = opm_ajaxPostRequest(url, params);
    var isSuccess = (rsp !== undefined && rsp.status !== "Failure" && rsp.status !== "false" && rsp.error === undefined);//No I18N
    updateForecastingMetaInfo(rsp, "Scope");//No I18N
    if(isSuccess){
        opm_infoMsgs("successMsg", Ember.I18n.t(opm_getForecastingActionMessageKey(isAddAction, true), this)); //No I18N
        if(!isNaN(widgetID)) {
            OPMClient.InventoryOpUtilsController.widgetID = widgetID;
            reloadSnapWidgetsByWidgetID(widgetID);
        } else {
            reloadSnapWidgets(widgetIndex, true);
        }
    } else {
        var errMsg = Ember.I18n.t(opm_getForecastingActionMessageKey(isAddAction, false), this);
        var backendMessage = (rsp && rsp.message) || (rsp && rsp.error && rsp.error.message);
        if(backendMessage && backendMessage.indexOf('forecasting') !== -1){
            showForecastingCapExceededMsg(rsp ? rsp.dhcpScopeForecastingCap : undefined, rsp ? rsp.totalDHCPForecastingEnabledCount : undefined, Ember.I18n.t('webclient.Scope'));//No I18N
            errMsg = undefined;
        }
        if(errMsg !== undefined){
            opm_infoMsgs("errorMsg", errMsg); //No I18N
        }
    }
    resetSelect2ActionById(selectId);
}

function removeEntityForecasting(type, wid){
    var entityId;
    if("Scope" === type){
        entityId = OPMClient.InventoryDeviceDetailsController.selDevice;
    } else {
        var deviceDet = OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet;
        entityId = deviceDet && deviceDet.subnetid;
    }
    if(entityId === undefined || entityId === null || entityId === ""){
        return;
    }
    if(!opm_confirmForecastingRemoval(false)){
        return;
    }
    var url = window.OPM.apiUrlPattern + "/ipam/removeIPAMPerformanceMonitor";//No I18N
    var params = { type: type };
    if("Scope" === type){
        params.dhcpServerAddress = entityId;
    } else {
        params.subnetIds = entityId;
    }
    var rsp = opm_ajaxPostRequest(url, params);
    var isSuccess = (rsp !== undefined && rsp.status !== "Failure" && rsp.status !== "false" && rsp.error === undefined);//No I18N
    updateForecastingMetaInfo(rsp, type);
    var widgetID = parseInt(wid, 10);
    if(isSuccess){
        opm_infoMsgs("successMsg", Ember.I18n.t(opm_getForecastingActionMessageKey(false, true), this)); //No I18N
        if("Scope" === type){
            redirectToSnapshot('DHCPSummary', 'GROUP_3');//No I18N
        } else {
            redirectToSnapshot('IPAMSubnetGroupSummary', 'GROUP_2');//No I18N
        }
    } else {
        var errMsg = Ember.I18n.t(opm_getForecastingActionMessageKey(false, false), this);
        var backendMessage = (rsp && rsp.message) || (rsp && rsp.error && rsp.error.message);
        if(backendMessage && backendMessage.indexOf('forecasting') !== -1){
            var capKeyName = "Scope" === type ? "dhcpScopeForecastingCap" : "subnetForecastingCap"; //No I18N
            var countKeyName = "Scope" === type ? "totalDHCPForecastingEnabledCount" : "totalForecastingEnabledCount"; //No I18N
            var typeLabel = "Scope" === type ? Ember.I18n.t('webclient.Scope') : Ember.I18n.t('opstor.inventory.emc.isilon.network.pools.subnet');//No I18N
            showForecastingCapExceededMsg(rsp ? rsp[capKeyName] : undefined, rsp ? rsp[countKeyName] : undefined, typeLabel);
            errMsg = undefined;
        }
        if(errMsg !== undefined){
            opm_infoMsgs("errorMsg", errMsg); //No I18N
        }
    }
}

function opm_getForecastResponseMessage(forecastResponse, defaultMessage) {
    if(forecastResponse && forecastResponse !== undefined && forecastResponse.error !== null) {
        if(typeof forecastResponse.error === 'string' && forecastResponse.error !== '') {
            return forecastResponse.error;
        }
        if(forecastResponse.error.message) {
            return forecastResponse.error.message;
        }
    }
    return defaultMessage || Ember.I18n.t('webclient.opm.forecasttrend.data.insufficient');//No I18N
}

function opm_hasForecastPlotData(forecastResponse) {
    if(!forecastResponse) {
        return false;
    }
    return opm_extractForecastDataPoints(forecastResponse.datacollectedValues).length > 0
        || opm_extractForecastDataPoints(forecastResponse.forecastedValues).length > 0;
}

function opm_plotForecastChartZChart(chartElementId, forecastResponse, yAxisLabel, period) {
    var chartElement = $('#' + chartElementId);//No I18N
    if(!chartElement.length) {
        return;
    }

    chartElement.empty();
    if(!opm_hasForecastPlotData(forecastResponse)) {
        var noDataMessage = opm_getForecastResponseMessage(forecastResponse);
        chartElement.html('<div style="text-align:center;color:#999;padding:40px;height:400px;display:flex;align-items:center;justify-content:center;">' + noDataMessage + '</div>');//No I18N
        return;
    }
    var zChartConfig = opm_transformForecastToZChartFormat(forecastResponse, chartElementId, yAxisLabel, period);
    zChart(zChartConfig);
}

function opm_transformForecastToZChartFormat(forecastResponse, chartId, yAxisLabel, period) {
    var collectedData = opm_extractForecastDataPoints(forecastResponse.datacollectedValues);
    var forecastedData = opm_extractForecastDataPoints(forecastResponse.forecastedValues);

    var seriesData = [];
    if(forecastedData.length) {
        seriesData.push({
            seriesname: forecastResponse.expectedDisplay || 'Expected Value',//No I18N
            data: forecastedData,
            plotoptions: {"mode":"monotone","dashStyle":"dotted","marker":{"enabled":false}} //No I18N
        });
    }
    if(collectedData.length) {
        seriesData.push({
            seriesname: forecastResponse.datacollectedDisplay || 'Collected Value',//No I18N
            data: collectedData,
            plotoptions: {"mode":"monotone","dashStyle":"solid","marker":{"enabled":false}} //No I18N
        });
    }

    return {
        placeholder: [chartId],
        chartobj: [{
            id: chartId,
            type: 'line', //No I18N
            series: 'multi', //No I18N
            jsonData: seriesData,
            height: 350,
            width: '100%',
            columns: {
                datatype_1: 'time', //No I18N
                datatype_2: 'numeric', //No I18N
                columnname_1: forecastResponse.xAxis || Ember.I18n.t('webclient.vimonitor.Time'),//No I18N
                columnname_2: yAxisLabel || forecastResponse.yAxis || Ember.I18n.t('opu.ipam.forecasting.subnet.ip.usage')//No I18N
            },
            canvas: { title: { show: false} },
            legend: {
                enabled: true,
                layout: 'horizontal',//No I18N
                vAlign: 'bottom',//No I18N
                hAlign: 'center',//No I18N
                colors: ['#00BFF3', '#4472C4']//No I18N
            },
            axes: {
                xaxis: { label: { text: forecastResponse.xAxis || Ember.I18n.t('webclient.vimonitor.Time') }, ticklabel: { rotation: -45 }, show: true },//No I18N
                yaxis: [{ label: { text: yAxisLabel || forecastResponse.yAxis || Ember.I18n.t('opu.ipam.forecasting.subnet.ip.usage') }, minRange: 0, maxRange: 100 }]//No I18N
            },
            chart: { stacked: false },
            period: period
        }]
    };
}

function opm_plotDHCPScopeForecastChart(chartElementId, forecastResponse, yAxisLabel, period) {
    var chartElement = $('#' + chartElementId);//No I18N
    if(!chartElement.length) {
        return;
    }
    chartElement.empty();

    var seriesData = [];
    if(forecastResponse && Array.isArray(forecastResponse.scopeForecastData)){
        $.each(forecastResponse.scopeForecastData, function(i, forecastData){
            if(!forecastData || !forecastData.scopeId){
                return;
            }
            var points = [];
            if(forecastData.forecastedValues){
                points = opm_extractForecastDataPoints(forecastData.forecastedValues);
            } else if(forecastData.datacollectedValues){
                points = opm_extractForecastDataPoints(forecastData.datacollectedValues);
            }
            if(points.length){
                seriesData.push({
                    seriesname: forecastData.scopeName || ('Scope ' + forecastData.scopeId),//No I18N
                    data: points,
                    plotoptions: {"mode":"monotone","marker":{"enabled":false}} //No I18N
                });
            }
        });
    }
    if(!seriesData.length){
        var noDataMessage = opm_getForecastResponseMessage(forecastResponse);
        chartElement.html('<div style="text-align:center;color:#999;padding:40px;height:400px;display:flex;align-items:center;justify-content:center;">' + noDataMessage + '</div>');//No I18N
        return;
    }
    zChart({
        placeholder: [chartElementId],
        chartobj: [{
            id: chartElementId,
            type: 'line', //No I18N
            series: 'multi', //No I18N
            jsonData: seriesData,
            height: 350,
            width: '100%',
            columns: {
                datatype_1: 'time', //No I18N
                datatype_2: 'numeric', //No I18N
                columnname_1: Ember.I18n.t('webclient.vimonitor.Time'),//No I18N
                columnname_2: yAxisLabel || Ember.I18n.t('opu.ipam.forecasting.dhcp.lease.usage')//No I18N
            },
            canvas: { title: { show: false} },
            //Vertical legend so all (up to 10) scopes can be listed and toggled on/off by clicking
            legend: {
                enabled: true,
                layout: 'vertical',//No I18N
                vAlign: 'middle',//No I18N
                hAlign: 'right'//No I18N
            },
            axes: {
                xaxis: { label: { text: Ember.I18n.t('webclient.vimonitor.Time') }, ticklabel: { rotation: -45 }, show: true },//No I18N
                yaxis: [{ label: { text: yAxisLabel || Ember.I18n.t('opu.ipam.forecasting.dhcp.lease.usage') }, minRange: 0, maxRange: 100 }]//No I18N
            },
            chart: { stacked: false },
            period: period
        }]
    });
}

function opm_extractForecastDataPoints(dataArray) {
    var points = [];
    if(!Array.isArray(dataArray)) {
        return points;
    }
    $.each(dataArray, function(i, item) {
        if(item && Array.isArray(item) && item.length >= 2) {
            var timestamp = parseInt(item[0]);
            var value = parseFloat(item[1]);

            if(!isNaN(timestamp) && !isNaN(value)) {
                points.push([timestamp, value]);
            }
        }
    });

    return points;
}

function scanDHCP(snapid,widgetIndex,wid,ips){
	if(ips==undefined){
		ips=getEmberSelectedRows("opm_DeviceSnapList"+snapid,"dhcp-server-address");//No I18N
	}
	if(ips === undefined || ips === ""){
        alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        return;
    }
    var url = window.OPM.apiUrlPattern + "/ipam/scanDHCPServers";//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            if(wid==undefined){
        		reloadSnapWidgets(widgetIndex, true);
        	}
            else{
            	OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
            	reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID);
            }
            setTimeout(function(){
                opm_infoMsgs("successMsg",msg); //No I18N
            }, 100);
        }
    }
    opm_ajaxPostRequestWithMsg(url, {"ServerAddress":ips}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}
function scanDNS(snapid,widgetIndex,wid,ips){
	if(ips==undefined){
		ips=getEmberSelectedRows("opm_DeviceSnapList"+snapid,"DNSServerAddress");//No I18N
	}
	if(ips === undefined || ips === ""){
        alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        return;
    }
    var url = window.OPM.apiUrlPattern + "/ipam/scanDNSServers";//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    opm_ajaxPostRequestWithMsg(url,{"ServerAddress":ips},Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this),{callback: function(response){//No I18N
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            if(wid==undefined){
                reloadSnapWidgets(widgetIndex, true);
            }
            else{
                OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
                reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID);
            }
            setTimeout(function(){
                opm_infoMsgs("successMsg",msg); //No I18N
            }, 100);
        }
    },otpPageType: 'slide'});//NO I18N
}
function deleteDHCP(snapid,widgetIndex,wid,ips){
	if(ips==undefined){
		ips=getEmberSelectedRows("opm_DeviceSnapList"+snapid,"dhcp-server-address");//No I18N
	}
    if(ips === undefined || ips === ""){
        alert(Ember.I18n.t('opu.client.SELECT_ONE_ROW_DELETE', this)); //No I18N
        return;
    }
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
        	if(wid==undefined){
        		reloadSnapWidgets(widgetIndex, true);
        	}
            else{
            	OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
            	reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID);
                OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N 
            }
            opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
        }
    }
    if(confirm(Ember.I18n.t('js.common.DeleteAlert1',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/deleteDHCPServers";//NO I18N
        opm_ajaxPostRequestWithMsg(url, {"ServerAddress":ips}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }
}
function deleteDNSZone(gid,dnsServerName,zoneName,zoneId){
	if(zoneName !== null && zoneName !== undefined && zoneName !== ''){
		if(confirm(Ember.I18n.t('opu.ipam.DELETE_DNS_ZONE_CONFIRM',this))){//No I18N
			var url =window.OPM.apiUrlPattern + "/ipam/deleteDNSZone";//NO I18N
			var params = {};
			params.dnsServerAddress = dnsServerName;
			params.zoneName = zoneName;
			if (zoneId !== undefined && zoneId !== null && zoneId !== '') {
				params.dnsZoneId = zoneId;
			}

			var url = window.OPM.apiUrlPattern + "/ipam/deleteDNSZone";//No I18N
			opm_ajaxPostRequestWithMsg(url,params,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this),{callback: function(response){//No I18N
				if(response.status === "Failure"){
					opm_infoMsgs("errorMsg",response.message); //No I18N
				}else{
					var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
					OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N
					reloadSnapWidgetsByWidgetID(wid);
					opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.DNS_ZONE_DELETED',this)); //No I18N
				}
				
			},otpPageType: 'slide'});//NO I18N
		}
	}
}
function deleteDNSRecord(gid,recordId){
	if(confirm(Ember.I18n.t('js.common.DeleteAlert1',this))){
		var rowData = {};
		try { rowData = $("#" + gid).jqGrid('getRowData', recordId) || {}; } catch (e) { }
		awsSyncBeforeAction(rowData, gid, function (/*awsExt*/) {
			var url = window.OPM.apiUrlPattern + "/ipam/deleteDNSRecord";//No I18N
			var params = {};
			if(recordId && recordId !== '' && recordId !== 'undefined' && recordId !== 'null'){
				params.recordId = recordId;
			}

			opm_ajaxPostRequestWithMsg(url,params,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this),{callback: function(response){//No I18N
				if(response.status === "Failure"){
					opm_infoMsgs("errorMsg",response.message); //No I18N
				}else{
					var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
					OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N
					reloadSnapWidgetsByWidgetID(wid);
					opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.DNS_RECORD_DELETED',this)); //No I18N
				}

			},otpPageType: 'slide'});//NO I18N
		});
	}
}
function ipamDNSRecordEdit(gid,rowId){
    var rowData = $("#" + gid).jqGrid('getRowData', rowId);
    var recordType = rowData['dns-record-type'];//No I18N
    var isAws = (rowData['dns-server-type-int'] === '2' || rowData['dns-server-type-int'] === 2); //No I18N
    var isGcp = (rowData['dns-server-type-int'] === '3' || rowData['dns-server-type-int'] === 3); //No I18N
    var dnsRecordTypes;
    if (isAws) {
        dnsRecordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "PTR"]; //No I18N
    } else if (isGcp) {
        dnsRecordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV"]; //No I18N
    } else {
        dnsRecordTypes = (recordType === "NS" || recordType === "PTR")? ["NS", "PTR"] : ["A", "AAAA", "CNAME", "MX", "NS", "SRV"]; //No I18N
    }
    awsSyncBeforeAction(rowData, gid, function (awsExt) {
        if (awsExt) { $.extend(rowData, awsExt); }
        OPMClient.InventoryOpUtilsController.set('dnsZoneRecords', dnsRecordTypes);//No I18N
        OPMClient.InventoryOpUtilsController.set('currentZoneName', rowData['dns-zone-name']);//No I18N
        OPMClient.InventoryOpUtilsController.set('currentDNSAddr', rowData['dns-server-address'] || OPMClient.InventoryOpUtilsController.currentDNSAddr);//No I18N
        OPMClient.InventoryOpUtilsController.set('isGcpDnsServer', !!isGcp);//No I18N
        OPMClient.InventoryOpUtilsController.set('currentZoneId', rowData['dns-zone-id'] || '');//No I18N
        OPMClient.InventoryOpUtilsController.dnsRecordData = rowData;
        opmGlobalRoute.transitionTo('Inventory.Device.EditRecord');//No I18N
    });
}
function awsSyncBeforeAction(rowData, gid, onProceed) {
    var isAws = (rowData['dns-server-type-int'] === '2' || rowData['dns-server-type-int'] === 2); //No I18N
    var isGcp = (rowData['dns-server-type-int'] === '3' || rowData['dns-server-type-int'] === 3); //No I18N
    if (!isAws && !isGcp) { onProceed(null); return; }

    var params = {
        dnsServerAddress: rowData['dns-server-address'] || '', //No I18N
        zoneName:         rowData['dns-zone-name'] || '',      //No I18N
        dnsZoneId:        rowData['dns-zone-id'] || '',        //No I18N
        recordId:         rowData['dns-record-id'] || ''       //No I18N
    };
    if (!params.dnsServerAddress || !params.zoneName || !params.recordId) {
        onProceed(null);
        return;
    }

    var url = window.OPM.apiUrlPattern + '/ipam/syncDNSZone'; //No I18N
    opm_ajaxPostRequestWithMsg(url, params,
        Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this),                            //No I18N
        { callback: function (response) {
            if (!response || response.status === 'unsupported') { onProceed(null); return; } //No I18N
            if (response.message) {
                opm_infoMsgs("errorMsg", response.message);                                   //No I18N
                var wid = parseInt((gid || '').split('opm_DeviceSnapList')[1]);           //No I18N
                if (!isNaN(wid)) { reloadSnapWidgetsByWidgetID(wid); }
                return;
            }
            if (response.recordExists === false) {
                opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.jqgrid.no.data.found', this));//No I18N
                try {
                    var wid = parseInt((gid || '').split('opm_DeviceSnapList')[1]);           //No I18N
                    if (!isNaN(wid)) { reloadSnapWidgetsByWidgetID(wid); }
                } catch (e) { }
                return;
            }
            onProceed(response.awsExt || response.gcpExt || null);
        }, otpPageType: 'slide' });                                                            //No I18N
}

function populateDNSRecordEditForm(rowData) {
    var recordType = rowData['dns-record-type'];//No I18N
    var recordData = rowData['dns-record-data'];//No I18N
    var hostName = rowData['dns-host-name'];//No I18N
    var zoneName = rowData['dns-zone-name'];//No I18N
    var isAws = (rowData['dns-server-type-int'] === '2' || rowData['dns-server-type-int'] === 2);//No I18N
    var isGcp = (rowData['dns-server-type-int'] === '3' || rowData['dns-server-type-int'] === 3);//No I18N

    OPMClient.InventoryOpUtilsController.set('isAwsDnsServer', !!isAws);//No I18N
    OPMClient.InventoryOpUtilsController.set('isGcpDnsServer', !!isGcp);//No I18N
    OPMClient.InventoryOpUtilsController.dnsRecordData = rowData;

    if (isAws || isGcp) {
        OPMClient.InventoryOpUtilsController.set('awsOriginalFqdn', hostName);//No I18N
        OPMClient.InventoryOpUtilsController.set('awsOriginalType', recordType);//No I18N
        OPMClient.InventoryOpUtilsController.set('awsOriginalSetIdentifier', rowData['dns-aws-set-identifier'] || '');//No I18N

        showAwsConsoleRecordUI(zoneName);
        $("#dnsRecordsSelBoxDiv").val(recordType).trigger('change');
        $("#dnsRecordsSelBoxDiv").prop('disabled', true);//No I18N
        $('#awsRecordName').val(stripZoneSuffix(hostName, zoneName));
        $('#awsRecordName').prop('disabled', true);//No I18N
        var rpKind = isGcp ? (rowData['dns-gcp-routing-policy-kind'] || 'SIMPLE').toString().toUpperCase() : null;//No I18N
        if (!isGcp || rpKind === 'SIMPLE') {
            $('#awsRecordValue').val(awsRecordValueToText(recordType, recordData));
        }
        $('#awsRecordTTL').val(rowData['dns-record-ttl-raw'] || rowData['dns-record-ttl'] || 300);//No I18N

        if (isGcp) {
            $("#awsRoutingPolicyDiv").hide();//No I18N
            $("#gcpRoutingPolicyDiv").show();//No I18N
            if (typeof applyGcpRoutingPolicyOptions === 'function') { applyGcpRoutingPolicyOptions(recordType, rpKind); }//No I18N
            try { gcpRehydrateRoutingPolicyRows(rpKind, rowData['dns-gcp-routing-policy'], recordType); } catch (e) {}//No I18N
        } else {
            $("#gcpRoutingPolicyDiv").hide();//No I18N
            $("#awsRoutingPolicyDiv").show();//No I18N
            var rp = (rowData['dns-aws-routing-policy'] || rowData['routingPolicy'] || 'SIMPLE').toString().toUpperCase();//No I18N
            $("#awsRoutingPolicy").val(rp).trigger('change');
            if (rowData['dns-aws-set-identifier']) { $("#awsSetIdentifier").val(rowData['dns-aws-set-identifier']); }//No I18N
            if (rowData['dns-aws-weight'] !== undefined && rowData['dns-aws-weight'] !== null && rowData['dns-aws-weight'] !== '') {
                $("#awsWeight").val(rowData['dns-aws-weight']);//No I18N
            }
            if (rowData['dns-aws-failover']) { $("#awsFailoverType").val(rowData['dns-aws-failover']).trigger('change'); }//No I18N
            if (rowData['dns-aws-region']) { $("#awsRegion").val(rowData['dns-aws-region']).trigger('change.select2'); }//No I18N
            if (rowData['dns-aws-geoloc']) { $("#awsGeoLoc").val(rowData['dns-aws-geoloc']).trigger('change.select2'); }//No I18N
            $("#awsHealthCheckId").val(rowData['dns-aws-healthcheck-id'] || '');//No I18N
            if (typeof toggleAwsRoutingPolicyFields === 'function') { toggleAwsRoutingPolicyFields(); }
        }
        return;
    }
    hideAwsConsoleRecordUI();
    $("#awsRoutingPolicyDiv").hide();//No I18N

    $("#dnsRecordsSelBoxDiv").val(recordType).trigger('change');
    $("#dnsRecordsSelBoxDiv").prop('disabled', true).trigger('change');
    $("#recordName").val(hostName);
    if (recordType === 'A' || recordType === 'AAAA') {
        $("#ipInRecords").val(recordData);
        $("#fqdnFromRecord").val(zoneName);
        getConstructedFQDN('recordName');//No I18N
    }
    else if (recordType === 'MX') {
        var mxParts = recordData.split(' ');
        if (mxParts.length >= 2) {
            $("#mxPriorityTxt").val(mxParts[0]);
            $("#fqdnForMx").val(mxParts[1]);
        }
        if (hostName === '@' || hostName === '(same as parent folder)') {
            $("#hostOrChildName").val('');//No I18N
            $("#fqdnFromRecord3").val(zoneName);
        } else {
            $("#hostOrChildName").val(hostName);//No I18N
            $("#fqdnFromRecord3").val(zoneName);
            getConstructedFQDN('hostOrChildName');//No I18N
        }
    }
    else if (recordType === 'CNAME') {
        $("#fqdnForHostForTargetHost").val(recordData);
        $("#aliasName").val(hostName);
        $("#fqdnFromRecord1").val(zoneName);
        getConstructedFQDN('aliasName');//No I18N
    }
    else if (recordType === 'NS') {
        $("#fqdnForHostForNS").val(recordData);
    }
    else if (recordType === 'PTR') {
        var ipParts = recordData.split('.');
        if (ipParts.length === 4) {
            $("#hostIPAddr1").val(ipParts[0]);
            $("#hostIPAddr2").val(ipParts[1]);
            $("#hostIPAddr3").val(ipParts[2]);
            $("#hostIPAddr4").val(ipParts[3]);
        }
        $("#hostNameForMX").val(hostName);
        $("#fqdnFromRecord2").val(zoneName);
    }
    else if (recordType === 'SRV') {
        var srvParts = recordData.split(' ');
        if (srvParts.length >= 4) {
            $("#srvPriority").val(srvParts[0]);
            $("#srvWeightDiv").val(srvParts[1]);
            $("#srvPortNum").val(srvParts[2]);
            $("#srvHostDiv").val(srvParts[3]);
        }
        if (hostName === '@' || hostName === '(same as parent folder)') {
            $("#fqdnFromRecord4").val('');//No I18N - service
            $("#protocolForSrv").val('');//No I18N - protocol
            $("#domainForSrv").val('');//No I18N - domain/subdomain
        } else if (hostName) {
            var srvHostParts = hostName.split('.');
            if (srvHostParts.length >= 2) {
                var service = srvHostParts[0].replace(/^_/, '');
                var protocol = srvHostParts[1].replace(/^_/, '');
                var domain = '';
                if (srvHostParts.length > 2) {
                    domain = srvHostParts.slice(2).join('.');
                    if (domain === '@' || domain === '(same as parent folder)') {
                        domain = '';
                    }
                }
                $("#fqdnFromRecord4").val(service);//No I18N
                $("#protocolForSrv").val(protocol);//No I18N
                $("#domainForSrv").val(domain);//No I18N
            }
        }
    }
    else if (recordType === 'TXT') {
        $("#txtRecordValue").val(recordData);
        $("#recordName").val(hostName);
    }
    if (rowData['dns-record-ttl-raw'] || rowData['dns-record-ttl']) {
        $("#recordTTL").val(rowData['dns-record-ttl-raw'] || rowData['dns-record-ttl']);
    }
    $("#recordNameDiv").find('input, select').prop('disabled', true);//No I18N
    $("#recordNameDiv").find('label .mandatory').hide();//No I18N
    $("#aliasNameDiv").find('input, select').prop('disabled', true);//No I18N
    $("#aliasNameDiv").find('label .mandatory').hide();//No I18N
    $("#hostOrChildNameDiv").find('input, select').prop('disabled', true);//No I18N
    $("#hostIPAddrDiv").find('input, select').prop('disabled', true);//No I18N
    $("#hostIPAddrDiv").find('label .mandatory').hide();//No I18N
    $("#fqdnFromRecord4").prop('disabled', true);//No I18N
    $("#protocolForSrv").prop('disabled', true);//No I18N
    $("#domainForSrv").prop('disabled', true);//No I18N
    // SRV: service/protocol/domain are disabled in edit mode — drop their mandatory indicators
    $("#fqdnFromRecord4").closest('.opmFormCol').find('label .mandatory').hide();//No I18N
    $("#protocolForSrv").closest('.opmFormCol').find('label .mandatory').hide();//No I18N
    $("#domainForSrv").closest('.opmFormCol').find('label .mandatory').hide();//No I18N
    $("#createPtrRecord").hide();//No I18N
    $("#isAgingEnabled").hide();//No I18N
}


function toggleAwsRoutingPolicyFields() {
    var rp = $("#awsRoutingPolicy").val() || 'SIMPLE';//No I18N
    // Reset
    $("#awsSetIdentifierDiv").hide();
    $("#awsWeightDiv").hide();
    $("#awsFailoverTypeDiv").hide();
    $("#awsRegionDiv").hide();
    $("#awsGeoLocDiv").hide();
    $("#awsRoutingExtraRow").hide();
    if (rp === 'SIMPLE' ) {//No I18N
        updateAwsHealthCheckIdRequirement(rp);
        return;
    }
    $("#awsSetIdentifierDiv").show();
    $("#awsRoutingExtraRow").show();
    if (rp === 'WEIGHTED') { $("#awsWeightDiv").show(); }//No I18N
    else if (rp === 'FAILOVER') {//No I18N
        $("#awsFailoverTypeDiv").show();
        $("#awsFailoverType").off('change.awsHcId').on('change.awsHcId', function () {//No I18N
            updateAwsHealthCheckIdRequirement('FAILOVER');//No I18N
        });
    }
    else if (rp === 'LATENCY') { $("#awsRegionDiv").show(); }//No I18N
    else if (rp === 'GEOLOCATION') { $("#awsGeoLocDiv").show(); }//No I18N
    updateAwsHealthCheckIdRequirement(rp);
}

function updateAwsHealthCheckIdRequirement(rp) {
    var ft = ($("#awsFailoverType").val() || 'PRIMARY').toUpperCase();//No I18N
    var required = (rp === 'FAILOVER' && ft === 'PRIMARY');//No I18N
    $("#awsHealthCheckIdMandatory").toggle(required);
}

function addRoutingItemDom() {
    var count = $('#routing-items-container .routing-item').length;
    var newId = 'wrr-item-' + count;//No I18N

    var first = $('#routing-items-container .routing-item').first();
    var clone = first.clone(true);

    clone.attr('id', newId);//No I18N
    clone.find('.weight').val('').attr('id', 'wrr-weight-' + count);//No I18N
    clone.find('.ip-address').val('');
    clone.find('.health-check').prop('checked', false);//No I18N
    clone.find('.ip-row:not(:first)').remove();
    var firstWrrIpRow = clone.find('.ip-row').first().attr('id', 'wrr-ip-' + count + '-0');//No I18N
    firstWrrIpRow.find('.ip-address').attr('id', 'wrr-ip-' + count + '-0-addr');//No I18N
    firstWrrIpRow.find('.health-check').attr('id', 'wrr-ip-' + count + '-0-hc');//No I18N
    clone.find('.addIpBtn').attr('data-id', newId);//No I18N
    clone.attr('data-is-new', 'true');//No I18N
    clone.find('.routing-title-action').text(Ember.I18n.t('webclient.map.view.new'));//No I18N
    $('#routing-items-container').append(clone);
}

function addGeoItemDom() {
    var count = $('#geo-items-container .geo-item').length;
    var newId = 'geo-item-' + count;//No I18N

    var first = $('#geo-items-container .geo-item').first();
    var clone = first.clone(false);

    clone.attr('id', newId).removeAttr('data-select2-id');//No I18N
    clone.find('.select2-container').remove();//No I18N
    clone.find('[data-select2-id]').removeAttr('data-select2-id');//No I18N
    var geoRegionSelect = clone.find('.geo-region');
    geoRegionSelect.attr('id', 'geo-region-' + count).val('-1');//No I18N
    geoRegionSelect.show().removeClass('select2-hidden-accessible select2-offscreen').removeAttr('aria-hidden tabindex').removeData('select2');//No I18N
    clone.find('.ip-address').val('');
    clone.find('.health-check').prop('checked', false);//No I18N
    clone.find('.ip-row:not(:first)').remove();
    clone.find('.ip-container').attr('id', 'geo-ip-container-' + count);//No I18N
    var firstGeoIpRow = clone.find('.ip-row').first().attr('id', 'geo-ip-' + count + '-0');//No I18N
    firstGeoIpRow.find('.ip-address').attr('id', 'geo-ip-' + count + '-0-addr');//No I18N
    firstGeoIpRow.find('.health-check').attr('id', 'geo-ip-' + count + '-0-hc');//No I18N
    clone.find('.addGeoIpBtn').attr('data-id', newId);//No I18N
    clone.attr('data-is-new', 'true');//No I18N
    clone.find('.routing-title-action').text(Ember.I18n.t('webclient.map.view.new'));//No I18N
    geoRegionSelect.find('option[value="-1"]').prop('selected', true);//No I18N
    geoRegionSelect.find('option').removeAttr('data-select2-id');//No I18N

    $('#geo-items-container').append(clone);
    geoRegionSelect.select2();
    geoRegionSelect.trigger('change.select2');//No I18N
}

function addPbBackupItemDom() {
    var container = $('#gcpPbBackupContainer');
    var count = container.find('.geo-item').length;
    var newId = 'gcpPb-geo-item-'+count;//No I18N

    var first = container.find('.geo-item').first();
    var clone = first.clone(false);

    clone.attr('id', newId).removeAttr('data-select2-id');//No I18N
    clone.find('.select2-container').remove();//No I18N
    clone.find('[data-select2-id]').removeAttr('data-select2-id');//No I18N
    var pbRegionSelect = clone.find('.geo-region');
    pbRegionSelect.attr('id', 'gcpPb-region-' + count).val('-1');//No I18N
    pbRegionSelect.show().removeClass('select2-hidden-accessible select2-offscreen').removeAttr('aria-hidden tabindex').removeData('select2');//No I18N
    clone.find('.ip-address').val('');
    clone.find('.ip-row:not(:first)').remove();
    var firstPbIpRow = clone.find('.ip-row').first().attr('id', 'gcpPb-ip-'+count+'-0');//No I18N
    firstPbIpRow.find('.ip-address').attr('id', 'gcpPb-ip-'+count+'-0-addr');//No I18N
    clone.find('.ip-container').attr('id', 'gcpPb-ip-container-'+count); //No I18N
    clone.find('.addPbIpBtn').attr('data-id', newId);//No I18N
    clone.attr('data-is-new', 'true');//No I18N
    clone.find('.routing-title-action').text(Ember.I18n.t('webclient.map.view.new'));//No I18N
    pbRegionSelect.find('option').removeAttr('data-select2-id');//No I18N
    container.append(clone);
    pbRegionSelect.select2();
    pbRegionSelect.trigger('change.select2');//No I18N
}

function opm_isDecimalNumberKey(e) {
    var charCode = e.which ? e.which : e.keyCode;
    if (charCode <= 31) { return true; } // control keys (backspace, tab, arrows, etc.)
    if (charCode === 46) { // '.'
        if ($(e.target).val().indexOf('.') !== -1) { e.preventDefault(); return false; }
        return true;
    }
    if (charCode < 48 || charCode > 57) {
        e.preventDefault();
        return false;
    }
    return true;
}
function opm_bindDecimalRangeInput(selector, min, max) {
    var $el = $(selector);
    if (!$el.length) { return; }
    var ns = '.decimalRangeInput'; //No I18N
    $el.off('keypress' + ns + ' input' + ns + ' blur' + ns);//No I18N
    $el.on('keypress' + ns, opm_isDecimalNumberKey);
    $el.on('input' + ns + ' blur' + ns, function () {
        var val = $.trim($(this).val());
        if (val === '') { return; }
        var num = parseFloat(val);
        if (isNaN(num)) { $(this).val(''); return; }
        if (min !== undefined && min !== null && num < min) { num = min; }
        if (max !== undefined && max !== null && num > max) { num = max; }
        if (String(num) !== val) { $(this).val(num); }
    });
}

function opm_bindGcpPbTrickleValidation() {
    opm_bindDecimalRangeInput('#gcpPbTrickle', 0, 100); //No I18N
}

function toggleGcpRoutingPolicyFields(recordType, rpKind) {
    resetGcpRoutingPolicy();
    var rp = (rpKind  || 'SIMPLE').toUpperCase(); //No I18N
    $("#awsRecordValueDiv").toggle(rp == 'SIMPLE'); //No I18N
    $("#gcpRoutingPolicyFields").toggle(rp !== 'SIMPLE'); //No I18N
    $("#gcpWrrFields").toggle(rp === 'WRR'); //No I18N
    $("#gcpGeoFields").toggle(rp === 'GEO'); //No I18N
    $("#gcpPbFields").toggle(rp === 'PRIMARY_BACKUP'); //No I18N
    onGcpHealthCheckToggle(recordType, rp);
}

function gcpRehydrateRoutingPolicyRows(rpKind, rpJsonOrObj, recordType) {
    if (!rpJsonOrObj) { return; }
    var rp = rpJsonOrObj;
    if (typeof rp === 'string') {
        try { rp = JSON.parse(rp); } catch (e) { return; }
    }
    if (!rp || typeof rp !== 'object') { return; }

    var kind = (rpKind || '').toUpperCase();
    resetGcpRoutingPolicy();
    toggleGcpRoutingPolicyFields(recordType, kind);

    if (kind === 'WRR' && rp.wrr && Array.isArray(rp.wrr.items)) { // No I18N
        $.each(rp.wrr.items, function (i, item) {
            var itemEl;
            if (i === 0) {
                itemEl = $('#routing-items-container .routing-item').first();
            } else {
                addRoutingItemDom();
                itemEl = $('#routing-items-container .routing-item').last();
            }
            itemEl.find('.weight').val(item.weight);
            gcpFillIpRows(itemEl, item, 'wrrAddIp', itemEl.attr('id'));//No I18N
            itemEl.attr('data-is-new', 'false');//No I18N
            itemEl.find('.routing-title-action').text(Ember.I18n.t('webclient.action.edit'));//No I18N
        });

    } else if (kind === 'GEO' && rp.geo && Array.isArray(rp.geo.items)) { // No I18N
        $('#gcpGeoFencing').prop('checked', !!rp.geo.enableFencing); // No I18N
        $.each(rp.geo.items, function (i, item) {
            var itemEl;
            if (i === 0) {
                itemEl = $('#geo-items-container .geo-item').first();
            } else {
                addGeoItemDom();
                itemEl = $('#geo-items-container .geo-item').last();
            }
            itemEl.find('.geo-region').val(item.location).trigger("change");//No I18N
            gcpFillIpRows(itemEl, item, 'geoAddIp', itemEl.attr('id'));//No I18N
            itemEl.attr('data-is-new', 'false');//No I18N
            itemEl.find('.routing-title-action').text(Ember.I18n.t('webclient.action.edit'));//No I18N
        });

    } else if (kind === 'PRIMARY_BACKUP' && rp.primaryBackup) { // No I18N
        var pb = rp.primaryBackup;

        if (pb.primaryTargets && Array.isArray(pb.primaryTargets.externalEndpoints)) {
            var ips = pb.primaryTargets.externalEndpoints;
            $.each(ips, function (i, ip) {
                var row;
                if (i === 0) {
                    row = $('#gcpPbPrimaryContainer .ip-row').first();
                } else {
                    pbAddPrimaryIp();
                    row = $('#gcpPbPrimaryContainer .ip-row').last();
                }
                row.find('.ip-address').val(ip);
            });
        }

        if (pb.trickleTraffic !== undefined && pb.trickleTraffic !== null) {
            $('#gcpPbTrickle').val(pb.trickleTraffic); // No I18N
        }

        if (pb.backupGeoTargets) {
            $('#gcpPbGeoFencing').prop('checked', !!pb.backupGeoTargets.enableFencing); // No I18N

            if (Array.isArray(pb.backupGeoTargets.items)) {
                $.each(pb.backupGeoTargets.items, function (i, item) {
                    var itemEl;
                    if (i === 0) {
                        itemEl = $('#gcpPbBackupContainer .geo-item').first();
                    } else {
                        addPbBackupItemDom();
                        itemEl = $('#gcpPbBackupContainer .geo-item').last();
                    }
                    itemEl.find('.geo-region').val(item.location).trigger("change");//No I18N
                    gcpFillIpRows(itemEl, item, 'pbAddBackupIp', itemEl.attr('id'));//No I18N
                    itemEl.attr('data-is-new', 'false');//No I18N
                    itemEl.find('.routing-title-action').text(Ember.I18n.t('webclient.action.edit'));//No I18N
                });
            }
        }
    }

    if (rp.healthCheck) {
        var hcName = rp.healthCheck.split('/').pop();
        $('#gcpHealthCheck').val(hcName);//No I18N
    }
    onGcpHealthCheckToggle(recordType, kind);
}

function gcpFillIpRows(itemEl, item, addIpFnName, itemId) {
    var rrdatas = item.rrdatas || [];
    var endpoints = (item.healthCheckedTargets && item.healthCheckedTargets.externalEndpoints) || [];
    var allValues = [];

    $.each(rrdatas, function (i, v) { allValues.push({ value: v, checked: false }); });
    $.each(endpoints, function (i, v) { allValues.push({ value: v, checked: true }); });

    if (allValues.length === 0) { return; }

    var ipContainer = itemEl.find('.ip-container');

    $.each(allValues, function (i, entry) {
        var row;
        if (i === 0) {
            row = ipContainer.find('.ip-row').first();
        } else {
            window[addIpFnName](itemId);
            row = ipContainer.find('.ip-row').last();
        }
        row.find('.ip-address').val(entry.value);
        row.find('.health-check').prop('checked', entry.checked);//No I18N
    });
}


function isValidGcpRecordValue(recordType, v) {
    if (recordType === 'A') { return isValidIPAddress(v); }//No I18N
    if (recordType === 'AAAA') { return opm_isIpV6Address(v); }//No I18N
    if (recordType === 'CNAME') { return isValidDnsDomainName(v); }//No I18N
    if (recordType === 'MX') {//No I18N
        var parts = v.split(/\s+/);
        var p = Number(parts[0]);
        return !(parts.length < 2 || isNaN(p) || p < 0 || p > 65535 || !isValidDnsDomainName(parts.slice(1).join(' ')));
    }
    if (recordType === 'SRV') {//No I18N
        var sp = v.split(/\s+/);
        if (sp.length < 4) { return false; }
        var pr = Number(sp[0]), sw = Number(sp[1]), pt = Number(sp[2]);
        return !(isNaN(pr) || pr < 0 || pr > 65535 || isNaN(sw) || sw < 0 || sw > 65535 ||
            isNaN(pt) || pt < 1 || pt > 65535 || !isValidDnsDomainName(sp.slice(3).join(' ')));
    }
    if (recordType === 'TXT') { return (v.charAt(0) === '"' && v.charAt(v.length - 1) === '"'); }//No I18N
    return true;
}

function gcpRecordValueMsgKey(recordType) {
    return (recordType === 'A') ? 'webclient.invalidip' ://No I18N
        (recordType === 'AAAA') ? 'opu.ipv6.ENTER_VALID_IPV6_ADDRESS' ://No I18N
        (recordType === 'TXT') ? 'webclient.common.invalidData' ://No I18N
        'webclient.common.invalidData';//No I18N
}

function applyGcpRoutingPolicyParams(params, recordType) {
    var rp = ($("#gcpRoutingPolicy").val() || 'SIMPLE').toUpperCase(); //No I18N
    if (rp === 'SIMPLE') { return runGcpSimpleRecordValidation(params, recordType) ? null : false; } //No I18N

    var routingPolicy = {};
    var isIpRecord = (recordType === 'A' || recordType === 'AAAA');//No I18N
    var errFound = false;

    if(isIpRecord && ($('.health-check:checked').length > 0 || rp === 'PRIMARY_BACKUP')) {
       var healthCheck = $.trim($('#gcpHealthCheck').val() || '');
        if (!healthCheck) { $('#gcpHealthCheck').focus(); opm_showErrorInField('gcpHealthCheck', Ember.I18n.t('webclient.this.field.cannotempty', this)); return false; } //No I18N
        routingPolicy.healthCheck = healthCheck;
    }
    if (rp === 'WRR') {
        var wItems = [];

        $('#routing-items-container .routing-item').each(function(n) {
            if (errFound) { return; }
            var w = $.trim($(this).find('.weight').val() || '');
            if (!w && $(this).find('.ip-address').filter(function() { return $.trim($(this).val()); }).length === 0) { return; }
            if (!w || isNaN(parseFloat(w)) || parseFloat(w) < 1 || parseFloat(w) > 1000) { $('#wrr-weight-'+n).focus(); opm_showErrorInField('wrr-weight-'+n, Ember.I18n.t('webclient.generic.Between', { param0: 1, param1: 1000 })); errFound = true; return; } //No I18N

            var item = { weight: parseFloat(w) };
            var healthCheckedEndpoints = [];
            var rrdatas = [];

            $(this).find('.ip-row').each(function(m) {
                if (errFound) { return; }
                var val = $.trim($(this).find('.ip-address').val() || '');
                if (isIpRecord && $(this).find('.health-check').is(':checked')) {
                    if (!isValidGcpRecordValue(recordType, val)) { $('#wrr-ip-'+n+'-'+m+'-addr').focus(); opm_showErrorInField('wrr-ip-'+n+'-'+m+'-addr', Ember.I18n.t(gcpRecordValueMsgKey(recordType), this)); errFound = true; return; } //No I18N
                    healthCheckedEndpoints.push(val);
                } else {
                    if (!isValidGcpRecordValue(recordType, val)) { $('#wrr-ip-'+n+'-'+m+'-addr').focus(); opm_showErrorInField('wrr-ip-'+n+'-'+m+'-addr', Ember.I18n.t(gcpRecordValueMsgKey(recordType), this)); errFound = true; return; } //No I18N
                    rrdatas.push(val);
                }
            });
            if (errFound) { return; }
            if (!rrdatas.length && !healthCheckedEndpoints.length) { $('#wrr-ip-'+n+'-0-addr').focus(); opm_showErrorInField('wrr-ip-'+n+'-0-addr', Ember.I18n.t('webclient.this.field.cannotempty', this)); errFound = true; return; } //No I18N
            if (rrdatas.length) { item.rrdatas = rrdatas; }
            if (healthCheckedEndpoints.length) { item.healthCheckedTargets = { externalEndpoints: healthCheckedEndpoints }; }

            wItems.push(item);
        });

        if (errFound) { return false; }
        if (!wItems.length) { $('#wrr-weight-0').focus(); opm_showErrorInField('wrr-weight-0', Ember.I18n.t('webclient.this.field.cannotempty', this)); return false; } //No I18N
        routingPolicy.wrr = { items: wItems };

    } else if (rp === 'GEO') { //No I18N
        var gItems = [];

        $('#geo-items-container .geo-item').each(function(n) {
            if (errFound) { return; }
            var loc = $.trim($(this).find('.geo-region').val() || '');
            if (loc === '-1') { loc = ''; } //No I18N
            if (!loc && $(this).find('.ip-address').filter(function() { return $.trim($(this).val()); }).length === 0) { return; }
            if (!loc) { $('#geo-region-'+n).focus(); opm_showErrorInField('geo-region-'+n, Ember.I18n.t('webclient.ziabot.drpdwn.selectvalue', this)); errFound = true; return; } //No I18N

            var item = { location: loc };
            var healthCheckedEndpoints = [];
            var rrdatas = [];

            $(this).find('.ip-row').each(function(m) {
                if (errFound) { return; }
                var val = $.trim($(this).find('.ip-address').val() || '');
                if (isIpRecord && $(this).find('.health-check').is(':checked')) {
                    if (!isValidGcpRecordValue(recordType, val)) { $('#geo-ip-'+n+'-'+m+'-addr').focus(); opm_showErrorInField('geo-ip-'+n+'-'+m+'-addr', Ember.I18n.t(gcpRecordValueMsgKey(recordType), this)); errFound = true; return; } //No I18N
                    healthCheckedEndpoints.push(val);
                } else {
                    if (!isValidGcpRecordValue(recordType, val)) { $('#geo-ip-'+n+'-'+m+'-addr').focus(); opm_showErrorInField('geo-ip-'+n+'-'+m+'-addr', Ember.I18n.t(gcpRecordValueMsgKey(recordType), this)); errFound = true; return; } //No I18N
                    rrdatas.push(val);
                }
            });

            if (errFound) { return; }
            if (!rrdatas.length && !healthCheckedEndpoints.length) { $('#geo-ip-'+n+'-0-addr').focus(); opm_showErrorInField('geo-ip-'+n+'-0-addr', Ember.I18n.t('webclient.this.field.cannotempty', this)); errFound = true; return; } //No I18N
            if (rrdatas.length) { item.rrdatas = rrdatas; }
            if (healthCheckedEndpoints.length) { item.healthCheckedTargets = { externalEndpoints: healthCheckedEndpoints }; }

            gItems.push(item);
        });

        if (errFound) { return false; }
        if (!gItems.length) { $('#geo-region-0').focus(); opm_showErrorInField('geo-region-0', Ember.I18n.t('webclient.ziabot.drpdwn.selectvalue', this)); return false; } //No I18N
        routingPolicy.geo = {
            enableFencing: $('#gcpGeoFencing').prop("checked"),
            items: gItems
        };

    } else if (rp === 'PRIMARY_BACKUP') { //No I18N
        var primaryEndpoints = [];
        $('#gcpPbPrimaryContainer .ip-row').each(function(m) {
            if (errFound) { return; }
            var val = $.trim($(this).find('.ip-address').val() || '');
            if (!val) { return; }
            if (!isValidGcpRecordValue(recordType, val)) { $('#gcpPb-primary-'+m+'-addr').focus(); opm_showErrorInField('gcpPb-primary-'+m+'-addr', Ember.I18n.t(gcpRecordValueMsgKey(recordType), this)); errFound = true; return; } //No I18N
            primaryEndpoints.push(val);
        });
        if (errFound) { return false; }
        if (!primaryEndpoints.length) { $('#gcpPb-primary-0-addr').focus(); opm_showErrorInField('gcpPb-primary-0-addr', Ember.I18n.t('webclient.this.field.cannotempty', this)); return false; } //No I18N

        var bItems = [];
        $('#gcpPbBackupContainer .geo-item').each(function(n) {
            if (errFound) { return; }
            var loc = $.trim($(this).find('.geo-region').val() || '');
            if (loc === '-1') { loc = ''; } //No I18N
            if (!loc && $(this).find('.ip-address').filter(function() { return $.trim($(this).val()); }).length === 0) { return; }
            if (!loc) { $('#gcpPb-region-'+n).focus(); opm_showErrorInField('gcpPb-region-'+n, Ember.I18n.t('webclient.ziabot.drpdwn.selectvalue', this)); errFound = true; return; } //No I18N

            // backup geo - no health check, always rrdatas only
            var rrdatas = [];
            $(this).find('.ip-row').each(function(m) {
                if (errFound) { return; }
                var val = $.trim($(this).find('.ip-address').val() || '');
                if (!isValidGcpRecordValue(recordType, val)) { $('#gcpPb-ip-'+n+'-'+m+'-addr').focus(); opm_showErrorInField('gcpPb-ip-'+n+'-'+m+'-addr', Ember.I18n.t(gcpRecordValueMsgKey(recordType), this)); errFound = true; return; } //No I18N
                rrdatas.push(val);
            });

            if (errFound) { return; }
            if (!rrdatas.length) { $('#gcpPb-ip-'+n+'-0-addr').focus(); opm_showErrorInField('gcpPb-ip-'+n+'-0-addr', Ember.I18n.t('webclient.this.field.cannotempty', this)); errFound = true; return; } //No I18N
            bItems.push({ location: loc, rrdatas: rrdatas });
        });

        if (errFound) { return false; }
        if (!bItems.length) { $('#gcpPb-region-0').focus(); opm_showErrorInField('gcpPb-region-0', Ember.I18n.t('webclient.ziabot.drpdwn.selectvalue', this)); return false; } //No I18N

        var trickle = $.trim($("#gcpPbTrickle").val() || ""); //No I18N
        if (trickle) {
            var tn = parseFloat(trickle);
            if (isNaN(tn) || tn < 0 || tn > 100) { $('#gcpPbTrickle').focus(); opm_showErrorInField('gcpPbTrickle', Ember.I18n.t('webclient.generic.Between', { param0: 0, param1: 100 })); return false; } //No I18N
        }

        routingPolicy.primaryBackup = {
            primaryTargets: {
                externalEndpoints: primaryEndpoints
            },
            backupGeoTargets: {
                enableFencing: $('#gcpPbGeoFencing').prop("checked"),//No I18N
                items: bItems
            },
            trickleTraffic: trickle ? parseFloat(trickle) : 0
        };
    }

    params.routingPolicy = JSON.stringify(routingPolicy);
    return null;
}

function opm_initAwsDnsCredFields(preselectCredId) {
    $("#awsCredId").select2(); //No I18N
    $("#awsNewCredFields").hide(); //No I18N
    $("#awsCredId").off("change.awsCred").on("change.awsCred", function () { //No I18N
        $("#awsNewCredFields").toggle($(this).val() === "new"); //No I18N
    });
    try {
        var credResp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/listAWSCredentials'); //No I18N
        if (credResp && credResp.rows) {
            $("#awsCredId").find("option[value!='-1'][value!='new']").remove(); //No I18N
            $.each(credResp.rows, function (i, row) {
                $("#awsCredId").append($("<option>").val(row.CRED_ID).text(row.CRED_NAME)); //No I18N
            });
            var justAdded = OPMClient.InventoryOpUtilsController.AWSCredentialAdded;
            if (justAdded) {
                $("#awsCredId option").each(function () {
                    if ($(this).text() === justAdded) {
                        $("#awsCredId").val($(this).val());
                        return false;
                    }
                });
                OPMClient.InventoryOpUtilsController.set('AWSCredentialAdded', '');//No I18N
            }
            else if (preselectCredId !== undefined && preselectCredId !== null && ("" + preselectCredId) !== "" && ("" + preselectCredId) !== "-1") {
                $("#awsCredId option").each(function () {
                    if (("" + $(this).val()) === ("" + preselectCredId)) {
                        $("#awsCredId").val($(this).val());
                        return false;
                    }
                });
            }
            $("#awsCredId").trigger('change.select2'); //No I18N
        }
    } catch (e) { }
}

function opm_applyAwsDnsCredPayload(payload) {
    var credId = trimAll($("#awsCredId").val()); //No I18N
    if (!credId || credId === "-1") {
        opm_infoMsgs("errorMsg", Ember.I18n.t("opu.ipam.AWS_CRED_REQUIRED")); //No I18N
        $("#awsCredId").focus(); //No I18N
        return false;
    }
    if (credId === "new") {
        var newCredName  = $.trim($("#awsNewCredName").val());  //No I18N
        var newAccessKey = $.trim($("#awsNewAccessKey").val()); //No I18N
        var newSecretKey = $.trim($("#awsNewSecretKey").val()); //No I18N
        if (!newCredName || !newAccessKey || !newSecretKey) {
            opm_infoMsgs("errorMsg", Ember.I18n.t("opu.ipam.AWS_CRED_FIELDS_REQUIRED")); //No I18N
            return false;
        }
        payload.credName  = newCredName;
        payload.accessKey = newAccessKey;
        payload.secretKey = newSecretKey;
    } else {
        payload.credId = credId;
    }
    return true;
}

function opm_initGcpDnsCredFields(preselectCredId) {
    $("#gcpCredId").select2(); //No I18N
    try {
        var credResp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/listGCPCredentials'); //No I18N
        if (credResp && credResp.rows) {
            $("#gcpCredId").find("option[value!='-1']").remove(); //No I18N
            $.each(credResp.rows, function (i, row) {
                var displayName = row.CRED_NAME;
                if (row.PROJECT_ID) {
                    displayName += " (" + row.PROJECT_ID + ")"; //No I18N
                }
                $("#gcpCredId").append($("<option>").val(row.CRED_ID).text(displayName)); //No I18N
            });
            var justAdded = OPMClient.InventoryOpUtilsController.GCPCredentialAdded;
            if (justAdded) {
                $("#gcpCredId option").each(function () {
                    if ($(this).text().split(" (")[0] === justAdded) {
                        $("#gcpCredId").val($(this).val());
                        return false;
                    }
                });
                OPMClient.InventoryOpUtilsController.set('GCPCredentialAdded', '');//No I18N
            }
            else if (preselectCredId !== undefined && preselectCredId !== null && ("" + preselectCredId) !== "" && ("" + preselectCredId) !== "-1") {
                $("#gcpCredId option").each(function () {
                    if (("" + $(this).val()) === ("" + preselectCredId)) {
                        $("#gcpCredId").val($(this).val());
                        return false;
                    }
                });
            }
            $("#gcpCredId").trigger('change.select2'); //No I18N
        }
    } catch (e) { }
}


function opm_findDNSServerEntryById(serverId) {
    if (serverId === null || serverId === undefined || serverId === "") { return undefined; }
    var key = "" + serverId;
    var servers = (OPMClient && OPMClient.InventoryOpUtilsController) ? (OPMClient.InventoryOpUtilsController.allDNSServers || []) : [];
    return servers.find(function (dat) {
        return ("" + (dat.serverID != null ? dat.serverID : dat.DNSServerID)) === key;
    });
}

function opm_updateDHCPWinrmOptionMsg(mode) {
    $("#automaticMSG").show();
    OPMClient.InventoryOpUtilsController.set("DHCPWinrmOptionMsg",({'header': Ember.I18n.t('opu.ipam.DHCP.WINRM_MODES')+" "+"("+Ember.I18n.t('ncm.tools.DisasterRecoveryTransformer.OnDemand')+"):", 'message': Ember.I18n.t('opu.ipam.DHCP.GENERAL_ONDEMAND_MSG',{ "productName": window.OPM.productName })}));//No I18N
    if (mode === "Automatic") { //No I18N
        $("#onDemandWarnMsg").show();
        OPMClient.InventoryOpUtilsController.set("DHCPWinrmOptionMsg",({'header': Ember.I18n.t('opu.ipam.DHCP.WINRM_MODES')+" "+"("+Ember.I18n.t('ncm.tools.DisasterRecoveryTransformer.OnDemand')+"):", 'message': Ember.I18n.t('opu.ipam.DHCP.GENERAL_ONDEMAND_MSG',{ "productName": window.OPM.productName })}));//No I18N
    } else if (mode === "AlwaysOn") { //No I18N
        $("#onDemandWarnMsg").hide();
        OPMClient.InventoryOpUtilsController.set("DHCPWinrmOptionMsg", ({'header': Ember.I18n.t('opu.ipam.DHCP.WINRM_MODES')+" "+"("+Ember.I18n.t('webclient.opm.snapshot.monitors.graph.always')+" "+Ember.I18n.t('webclient.admin.alarmesc.Enabled')+"):", 'message': Ember.I18n.t('opu.ipam.DHCP.GENERAL_ALWAYS_MSG',{ "productName": window.OPM.productName })}));//No I18N
    } else if (mode === "Manual"){ //No I18N
        $("#onDemandWarnMsg").hide();
        OPMClient.InventoryOpUtilsController.set("DHCPWinrmOptionMsg", ({'header': Ember.I18n.t('opu.ipam.DHCP.WINRM_MODES')+" "+"("+Ember.I18n.t('webclient.settings.ImportCertificate.manualButton')+"):", 'message': Ember.I18n.t('opu.ipam.DHCP.GENERAL_MANUAL_MSG',{ "productName": window.OPM.productName })}));//No I18N
    } else{
        $("#onDemandWarnMsg,#automaticMSG").hide();
    }
}

function opm_applyDNSAssociateUI(serverId) {
    var entry = opm_findDNSServerEntryById(serverId);
    if (!entry) { return; }

    if (parseInt(entry.serverTypeInt, 10) === 2) {
        $("#microsoftDNS").hide(); //No I18N
        $("#gcpDNS").hide(); //No I18N
        $("#awsDNS").show(); //No I18N
        opm_initAwsDnsCredFields(entry.awsCredId);
        return;
    }

    if (parseInt(entry.serverTypeInt, 10) === 3) {
        $("#microsoftDNS").hide(); //No I18N
        $("#awsDNS").hide(); //No I18N
        $("#gcpDNS").show(); //No I18N
        opm_initGcpDnsCredFields(entry.gcpCredId);
        return;
    }

    // Microsoft path
    $("#awsDNS").hide(); //No I18N
    $("#gcpDNS").hide(); //No I18N
    $("#microsoftDNS").show(); //No I18N

    if (parseInt(entry.serverTypeInt, 10) !== 1) { return; }

    if (entry.authType != null && entry.authType !== "") {
        $('#dhcpAuthType').val(entry.authType).change(); //No I18N
    }
    if (entry.winrmOption != null && entry.winrmOption !== "") {
        $('#dhcpWinRMMode').val(entry.winrmOption).change(); //No I18N
        opm_updateDHCPWinrmOptionMsg(entry.winrmOption);
    }
    if (entry.winrmProtocol != null && entry.winrmProtocol !== "") {
        $('#dhcpProtocolType').val(entry.winrmProtocol).change(); //No I18N
        if (entry.winrmProtocol === 'HTTP') { //No I18N
            $('#protocolInfoMsg').hide(); //No I18N
        }
    }
    if (entry.winrmPort != null && entry.winrmPort !== "") {
        $('#dhcpPortNo').val(entry.winrmPort); //No I18N
    }
}

function opm_getSelectedDNSServerId() {
    return $("#dnsServerAddressSelBox").val(); //No I18N
}

function opm_toggleAwsFieldsForDnsZone(serverName) {
    var isAws = false;
    var isGcp = false;
    var servers = (OPMClient && OPMClient.InventoryOpUtilsController) ? OPMClient.InventoryOpUtilsController.allDNSServers : [];
    $.each(servers || [], function (i, srv) {
        if (srv.serverName === serverName) {
            if (srv.serverType == 2) { isAws = true; return false; }
            if (srv.serverType == 3) { isGcp = true; return false; }
        }
    });
    if (isAws || isGcp) {
        $('#zoneCategoryOptions').hide(); //No I18N
        $('#zoneType').hide(); //No I18N
        $('#ipV4NetworkLookupDiv').hide(); //No I18N
        $('#ipV4ReverseLookupDiv').hide(); //No I18N
        $('#zoneNameInfoMessage').hide(); //No I18N
        $('#zoneStep2').hide(); //No I18N
        $('#zoneStep3').hide(); //No I18N
        $('#addZone .infoMssg').hide(); //No I18N
        $('#zoneNameDiv').show(); //No I18N
        $('#forwardLookup').prop('checked', true); //No I18N
        $('#opuDNSNextbtn').hide(); //No I18N
        $('#dnsZoneSavebtn').show(); //No I18N
        if (isAws) {
            $('#awsZoneOptions').show(); //No I18N
            $('#gcpZoneOptions').hide(); //No I18N
        } else {
            $('#gcpZoneOptions').show(); //No I18N
            $('#awsZoneOptions').hide(); //No I18N
            opm_toggleGcpZoneFields();
        }
    } else {
        $('#zoneCategoryOptions').show(); //No I18N
        $('#zoneNameInfoMessage').show(); //No I18N
        $('#zoneStep2').show(); //No I18N
        $('#zoneStep3').show(); //No I18N
        $('#addZone .infoMssg').show(); //No I18N
        $('#awsZoneOptions').hide(); //No I18N
        $('#gcpZoneOptions').hide(); //No I18N
        $('#opuDNSNextbtn').show(); //No I18N
        $('#dnsZoneSavebtn').hide(); //No I18N
    }
}

// Show/hide GCP zone-specific config blocks based on the selected visibility radio.
function opm_toggleGcpZoneFields() {
    var v = $('input[name="gcpZoneVisibility"]:checked').val(); //No I18N
    $('#gcpVpcFields').toggle(v === 'private' || v === 'forwarding' || v === 'reverse'); //No I18N
    $('#gcpForwardingFields').toggle(v === 'forwarding'); //No I18N
    $('#gcpPeeringFields').toggle(v === 'peering'); //No I18N
}

function isValidGcpManagedZoneName(name) {
    return /^[a-z][a-z0-9-]{0,61}[a-z0-9]$/.test(name || ''); //No I18N
}

function isValidDnsDomainName(name) {
    if (!name || typeof name !== 'string') { return false; }
    name = name.replace(/\.$/, '');
    if (name.length === 0 || name.length > 253) { return false; }
    var re = /^([a-zA-Z0-9_]([a-zA-Z0-9_\-]{0,61}[a-zA-Z0-9_])?)(\.[a-zA-Z0-9_]([a-zA-Z0-9_\-]{0,61}[a-zA-Z0-9_])?)*$/;
    return re.test(name);
}

function validateDnsRecordValueField(recordType, fields) {
    var values = parseAwsRecordValuesText($('#awsRecordValue').val());//No I18N
    var valueInvalid = (values.length === 0);
    for (var i = 0; !valueInvalid && i < values.length; i++) {
        var v = values[i];
        if (recordType === 'A')          { valueInvalid = !isValidIPAddress(v); }//No I18N
        else if (recordType === 'AAAA')  { valueInvalid = !opm_isIpV6Address(v); }//No I18N
        else if (recordType === 'CNAME') { valueInvalid = (values.length > 1 || !isValidDnsDomainName(v)); }//No I18N
        else if (recordType === 'NS' || recordType === 'PTR') { valueInvalid = !isValidDnsDomainName(v); }//No I18N
        else if (recordType === 'MX') {//No I18N
            var parts = v.split(/\s+/);
            var p = Number(parts[0]);
            valueInvalid = (parts.length < 2 || isNaN(p) || p < 0 || p > 65535 || !isValidDnsDomainName(parts.slice(1).join(' ')));
        } else if (recordType === 'SRV') {//No I18N
            var sp = v.split(/\s+/);
            if (sp.length < 4) { valueInvalid = true; }
            else {
                var pr = Number(sp[0]), sw = Number(sp[1]), pt = Number(sp[2]);
                valueInvalid = (isNaN(pr) || pr < 0 || pr > 65535 || isNaN(sw) || sw < 0 || sw > 65535 ||
                    isNaN(pt) || pt < 1 || pt > 65535 || !isValidDnsDomainName(sp.slice(3).join(' ')));
            }
        } else if (recordType === 'TXT') { valueInvalid = (v.charAt(0) !== '"' || v.charAt(v.length - 1) !== '"'); }//No I18N
    }
    var valueMsgKey = (recordType === 'A') ? 'webclient.invalidip' ://No I18N
                        (recordType === 'AAAA') ? 'opu.ipv6.ENTER_VALID_IPV6_ADDRESS' ://No I18N
                      (recordType === 'NS' || recordType === 'PTR') ? 'opu.ipam.nameServer.err.msg' ://No I18N
                      (recordType === 'TXT') ? 'webclient.common.invalidData' ://No I18N
                      'webclient.common.invalidData';//No I18N
    fields.custom.push({ identifier: 'awsRecordValue', condition: valueInvalid, message: Ember.I18n.t(valueMsgKey, this) });//No I18N
}
function runGcpSimpleRecordValidation(params, recordType) {
    var fields = { custom: [] };
    validateDnsRecordValueField(recordType, fields);
    if (!opm_validateFields(fields)) { return false; }
    return true;
}

function runAwsRecordValidation(params, recordType) {
    var isAwsCtx = false;
    try { isAwsCtx = !!OPMClient.InventoryOpUtilsController.get('isAwsDnsServer'); } catch(e) {}//No I18N
    var rp = isAwsCtx ? ($("#awsRoutingPolicy").val() || 'SIMPLE') : 'SIMPLE';//No I18N
    var fields = { custom: [] };

    validateDnsRecordValueField(recordType, fields);

    if (rp === 'FAILOVER' && ($("#awsFailoverType").val() || 'PRIMARY').toUpperCase() === 'PRIMARY' && !($("#awsHealthCheckId").val() || '').trim()) {//No I18N
        fields.custom.push({ identifier: 'awsHealthCheckId', condition: true, message: Ember.I18n.t('opu.ipam.aws.health.check.id.required.error', this) });//No I18N
    }
    if (rp !== 'SIMPLE' && rp !== 'MULTIVALUE') {//No I18N
        fields.empty = ['awsSetIdentifier'];//No I18N
        if (rp === 'WEIGHTED') { fields.validIntegerValue = ['awsWeight']; }//No I18N
        else if (rp === 'LATENCY') { fields.empty.push('awsRegion'); }//No I18N
        else if (rp === 'GEOLOCATION') { fields.empty.push('awsGeoLoc'); }//No I18N
    } else if (rp === 'MULTIVALUE') {//No I18N
        fields.empty = ['awsSetIdentifier'];//No I18N
    }

    if (!opm_validateFields(fields)) { return false; }

    // Valid -> populate routing-policy params on the request object.
    params.routingPolicy = rp;
    params.healthCheckId = ($("#awsHealthCheckId").val() || '').trim();
    if (rp !== 'SIMPLE') {//No I18N
        params.setIdentifier = ($("#awsSetIdentifier").val() || '').trim();
        if (rp === 'WEIGHTED') { params.weight = parseInt($("#awsWeight").val(), 10); }//No I18N
        else if (rp === 'FAILOVER') { params.failoverType = $("#awsFailoverType").val() || 'PRIMARY'; }//No I18N
        else if (rp === 'LATENCY') { params.awsRegion = ($("#awsRegion").val() || '').trim(); }//No I18N
        else if (rp === 'GEOLOCATION') { params.geoLocation = ($("#awsGeoLoc").val() || '').trim(); }//No I18N
    }
    return true;
}


var AWS_RECORD_TYPE_META = {
    'A':     { hint: Ember.I18n.t('webclient.devices.details.ipaddress'),                                                                                  placeholder: '192.0.2.1\n192.0.2.2' }, //No I18N
    'AAAA':  { hint: Ember.I18n.t('webclient.devices.details.ipaddress'),                                                                                  placeholder: '2001:db8::1' }, //No I18N
    'CNAME': { hint: Ember.I18n.t('opu.ipam.fqdn.name'),                                                                                                   placeholder: 'example.com' }, //No I18N
    'MX':    { hint: Ember.I18n.t('webclient.topo.actions.deviceinfo.priority') + ' ' + Ember.I18n.t('opu.ipam.fqdn.name.mxServer'),                       placeholder: '10 mail1.example.com\n20 mail2.example.com' }, //No I18N
    'TXT':   { hint: Ember.I18n.t('opu.ipam.dns.TXT_VALUE'),                                                                                                                    placeholder: '0 issue "letsencrypt.org"\n0 iodef "mailto:admin@example.com"' }, //No I18N
    'PTR':   { hint: Ember.I18n.t('opu.ipam.fqdn.name.target.host'),                                                                                       placeholder: 'host.example.com' }, //No I18N
    'SRV':   { hint: Ember.I18n.t('webclient.topo.actions.deviceinfo.priority') + ' ' + Ember.I18n.t('webclient.opm.kemplb.summary.weight') + ' ' + Ember.I18n.t('webclinet.devices.details.portnumber') + ' ' + Ember.I18n.t('opu.ipam.zone.host.offering.service'), placeholder: '1 10 5060 sip.example.com' }, //No I18N
    'NS':    { hint: Ember.I18n.t('opu.ipam.fqdn.name.target.host'),                                                                                       placeholder: 'ns-1.example.com\nns-2.example.com' } //No I18N
};

function showAwsConsoleRecordUI(zoneName) {
    var msSelectors = ['#recordNameDiv','#aliasNameDiv','#hostOrChildNameDiv', //No I18N
        '#hostIPAddrDiv','#domainForSrvDiv','#nsRecord', //No I18N
        '#ATypeRecord','#cNameRecord','#ptrRecord','#mxRecord','#srvRecord','#txtRecord', //No I18N
        '#createPtrRecord','#isAgingEnabled','#ttlDiv']; //No I18N
    for (var i = 0; i < msSelectors.length; i++) { $(msSelectors[i]).hide(); }
    $('#awsConsoleRecord').show();//No I18N
    var suffix = (zoneName || OPMClient.InventoryOpUtilsController.currentZoneName || '').replace(/\.$/,'');
    $('#awsRecordZoneSuffix').val(suffix ? '.' + suffix : '');
}

function hideAwsConsoleRecordUI() {
    $('#awsConsoleRecord').hide();//No I18N
}

function applyAwsRecordTypeMeta(recordType) {
    var meta = AWS_RECORD_TYPE_META[recordType] || { hint: '', placeholder: '' }; //No I18N
    $('#awsRecordValueHint').text(meta.hint);
    var $val = $('#awsRecordValue'); //No I18N
    $val.attr('placeholder', meta.placeholder); //No I18N
}


function parseAwsRecordValuesText(text) {
    if (!text) { return []; }
    var lines = String(text).split(/\r?\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
        var l = lines[i].trim();
        if (l !== '') { out.push(l); }
    }
    return out;
}


function normalizeAwsTxtValues(values) {
    var out = [];
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        if (v.charAt(0) !== '"') { v = '"' + v.replace(/"/g, '\\"') + '"'; }
        out.push(v);
    }
    return out;
}

function buildAwsFqdn(recordType, recordName, zoneName) {
    var z = (zoneName || '').replace(/\.$/,'');
    var n = (recordName || '').trim().replace(/\.$/,'');
    if (!n || n === '@') { return z; }
    if (n === z || n.endsWith('.' + z)) { return n; } // already FQDN
    if (recordType === 'SRV') {
        return n + '.' + z;
    }
    return n + '.' + z;
}
function stripZoneSuffix(fqdn, zoneName) {
    if (!fqdn) { return ''; }
    var z = (zoneName || '').replace(/\.$/,'');
    var n = fqdn.replace(/\.$/,'');
    if (n === z) { return ''; }
    if (n.endsWith('.' + z)) { return n.substring(0, n.length - z.length - 1); }
    return n;
}

function awsRecordValueToText(recordType, recordValue) {
    if (recordValue === undefined || recordValue === null) { return ''; }
    var s = String(recordValue);
    if (s.indexOf(',') !== -1 && (recordType === 'A' || recordType === 'AAAA' || recordType === 'NS' || recordType === 'TXT')) {
        return s.split(',').map(function(v){ return v.trim(); }).filter(Boolean).join('\n');
    }
    return s;
}


function loadDNSServersForBulkImport() {
    OPMClient.InventoryOpUtilsController.dnsServerListForImport = [];
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAllDNSServers');//No I18N
    var currentDNSAddr = OPMClient.InventoryOpUtilsController.currentDNSAddr;
    if (jsonData && jsonData.rows) {
        $.each(jsonData.rows, function(key, value) {
            var group = {};
            var address = value['DNSServerAddress'] || '';//No I18N
            var isAws = ('' + value['DNSServerTypeInt']) === '2';//No I18N
            if (address && !isAws) {
                if (currentDNSAddr && currentDNSAddr === address) {
                    group.isSelected = true;
                } else {
                    group.isSelected = false;
                }
                group.address = address;
                group.displayName = address;
                OPMClient.InventoryOpUtilsController.dnsServerListForImport.push(group);
            }
        });
    }
    opmGlobalRoute.transitionTo('Inventory.Device.BulkImportDNSRecords');//No I18N
}

function loadDNSZonesForBulkImport(dnsServerAddress) {
    OPMClient.InventoryOpUtilsController.set('dnsZoneListForImport', []);//No I18N
    if (!dnsServerAddress) {
        Ember.run.scheduleOnce('afterRender', function() {//No I18N
            if ($("#bulkImportZoneName").data('select2')) {
                $("#bulkImportZoneName").select2('destroy');
            }
            $("#bulkImportZoneName").select2({minimumResultsForSearch:10});
        });
        return;
    }
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getDNSZoneNames?dnsServerId=' + encodeURIComponent(dnsServerAddress));//No I18N
    var currentZoneName = OPMClient.InventoryOpUtilsController.currentZoneName;
    var zoneList = [];
    if (jsonData && jsonData.rows) {
        $.each(jsonData.rows, function(key, value) {
            var group = {};
            var zoneName = value['dns-zone-name'] || '';//No I18N
            var zoneId = key || '';//No I18N
            if (zoneName) {
                if (currentZoneName && currentZoneName === zoneName) {
                    group.isSelected = true;
                } else {
                    group.isSelected = false;
                }
                group.zoneName = zoneName;
                group.zoneId = zoneId;
                zoneList.push(group);
            }
        });
    }
    OPMClient.InventoryOpUtilsController.set('dnsZoneListForImport', zoneList);//No I18N
    Ember.run.scheduleOnce('afterRender', function() {//No I18N
        if ($("#bulkImportZoneName").data('select2')) {
            $("#bulkImportZoneName").select2('destroy');
        }
        $("#bulkImportZoneName").select2({minimumResultsForSearch:10});
    });
}


function backToBulkImportStep1() {
    $("#bulkImportStep2").hide();//No I18N
    $("#bulkImportResult").hide();//No I18N
    $("#bulkImportStep1").show();//No I18N
    $("#bulkImportSubmitBtn").show();//No I18N
    $("#bulkImportBackBtn").show();//No I18N
    $(".opmForm").removeClass('noMaxWd');//No I18N
}

function parseBulkImportRecords() {
    var fileInput = document.getElementById('bindZoneFileInput');//No I18N
    var dnsServerAddress = $("#bulkImportDNSServerName").val().trim();//No I18N
    var zoneName = $("#bulkImportZoneName").val().trim();//No I18N

    if (!fileInput.files.length) {
        opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.fwa.select.file", this));//No I18N
        return;
    }

    var file = fileInput.files[0];
    var fileName = file.name.toLowerCase();
    if (fileName.lastIndexOf(".csv") === -1 && fileName.lastIndexOf(".txt") === -1 && fileName.lastIndexOf(".zone") === -1 && fileName.lastIndexOf(".db") === -1) {
        opm_infoMsgs('errorMsg', Ember.I18n.t("webclient.common.invalidFormat", this));//No I18N
        return;
    }

    OPMClient.InventoryOpUtilsController.set('currentDNSAddr', dnsServerAddress);//No I18N
    OPMClient.InventoryOpUtilsController.set('currentZoneName', zoneName);//No I18N
    OPMClient.InventoryOpUtilsController.set('storingDNSImportFile', file);//No I18N

    var formData = new FormData();
    formData.set('file', file);//No I18N
    formData.set('dnsServerAddress', dnsServerAddress);//No I18N
    formData.set('zoneName', zoneName);//No I18N

    var url = window.OPM.apiUrlPattern + "/ipam/previewBINDZoneImport";//No I18N
    var response = opm_ajaxMultiPostRequest(url, formData);

    if (response === undefined || response === null) {
        opm_infoMsgs("errorMsg", Ember.I18n.t('opu.ipam.dns.no.valid.data.found', this));//No I18N
        return;
    }
    if (response.error !== undefined) {
        opm_infoMsgs('errorMsg', escapeHTML(response.error.message || response.error));//No I18N
        return;
    }
    if (response.message !== undefined && response.status === 'Failure') {//No I18N
        opm_infoMsgs('errorMsg', escapeHTML(response.message));//No I18N
        return;
    }

    var resultData = response;
    if (response.result !== undefined) {
        resultData = response.result;
        if (typeof resultData === 'string') {//No I18N
            resultData = JSON.parse(resultData);
        }
    }

    var records = resultData.records || [];
    if (records.length === 0) {
        opm_infoMsgs("errorMsg", Ember.I18n.t('opu.ipam.dns.no.valid.data.found', this));//No I18N
        return;
    }

    OPMClient.InventoryOpUtilsController.set('bulkImportParsedRecords', records);//No I18N

    // Hide step1, show step2 with full width like subnet import
    $("#bulkImportStep1").hide();//No I18N
    $("#bulkImportStep2").show();//No I18N
    $("#bulkImportResult").hide();//No I18N
    $("#bulkImportSubmitBtn").show();//No I18N
    $('.opmForm').addClass('noMaxWd');//No I18N

    buildBulkImportPreviewGrid(records);
}

function buildBulkImportPreviewGrid(records) {
    var gridData = [];
    for (var i = 0; i < records.length; i++) {
        var rec = records[i];
        gridData.push({
            recordType: rec.recordType || '',//No I18N
            recordName: rec.msDnsName || rec.name || '',//No I18N
            recordData: rec.recordData || '',//No I18N
            ttl: rec.ttl || '',//No I18N
            importable: rec.importable === true,
            message: rec.statusMessage || ''//No I18N
        });
    }

    var colNamesList = [Ember.I18n.t('opu.dns.record_type', this), Ember.I18n.t('opu.views.NAME', this), Ember.I18n.t('webclient.script.test.data', this), Ember.I18n.t('opu.dns.ttl', this), Ember.I18n.t('opu.dns.import.col.importable', this), Ember.I18n.t('opu.views.REMARKS', this)];//No I18N
    var colModelList = [
        { name: 'recordType', index: 'recordType', width: 80, sortable: true },//No I18N
        { name: 'recordName', index: 'recordName', width: 150, sortable: true },//No I18N
        { name: 'recordData', index: 'recordData', width: 200, sortable: true },//No I18N
        { name: 'ttl', index: 'ttl', width: 60, sortable: true },//No I18N
        { name: 'importable', index: 'importable', width: 110, sortable: true, formatter: bulkImportImportableFormatter },//No I18N
        { name: 'message', index: 'message', width: 190, sortable: false }//No I18N
    ];

    var defaultOptions = {
        pagerId: "bulkImportPreviewPager",   //No I18N
        hideCSV: true,                        //No I18N - suppress CSV export icon (ui-icon-newwin)
        hideExcel: true,                      //No I18N - suppress XLS export icon (ui-icon-document)
        columnChooser: false,                 //No I18N - do not add column-chooser navButton
        showPagerColumnChooser: false,        //No I18N - belt-and-braces (empty glyph if added)
        searchOption: true,                   //No I18N - attach inline filterToolbar
        toggleSearch: false,                  //No I18N - start hidden; revealed by #bulkImportSearchIcon
        Search: false,                        //No I18N - no pager magnifying-glass modal dialog
        sortable: false,
        shrinkToFit: true,                    //No I18N - distribute container width across columns
                                              //          so filterToolbar aligns with no trailing
                                              //          whitespace under the last column.
        autoWidth: true,
        rowNum: 20,
        rowList: [20, 50, 100],
        overflow: "auto"                      //No I18N
    };

    $("#bulkImportPreviewGrid").jqGrid('GridUnload');//No I18N
    opm_loadJQgridWithData("#bulkImportPreviewGrid", gridData, colNamesList, colModelList, '', "#bulkImportPreviewPager", "bulkImportPreviewGrid", defaultOptions);//No I18N
    $('#bulkImportPreviewGrid').jqGrid('setGridWidth', $('#bulkImportPreviewGrid').closest(".opmForm").width());//No I18N
}

function bulkImportImportableFormatter(cellValue, options, rowdata) {
    // backend sets rowdata.importable = true for OK/WARNING, false for ERROR/SOA
    if (rowdata && rowdata.importable) {
        return "<div class='flex flex-middle-align gap-sm'>"
             + "<em class='svgIcon size14 success-color'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#tick-circle'></use></svg></em>"
             + Ember.I18n.t('webclient.yes') + "</div>";//No I18N
    }
    return "<div class='flex flex-middle-align gap-sm'>"
         + "<em class='svgIcon size14 failed-color'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#close-circle'></use></svg></em>"
         + Ember.I18n.t('webclient.no') + "</div>";//No I18N
}

function submitBulkImportRecords() {
    var records = OPMClient.InventoryOpUtilsController.bulkImportParsedRecords;
    var validCount = 0;
    if (records && records.length > 0) {
        for (var i = 0; i < records.length; i++) {
            var st = (records[i].status || '').toUpperCase();//No I18N
            if (st !== 'ERROR' && st !== 'SKIPPED') {//No I18N
                validCount++;
            }
        }
    }
    if (validCount === 0) {
        opm_infoMsgs("errorMsg", Ember.I18n.t('opu.ipam.dns.no.valid.data.found', this));//No I18N
        return;
    }

    if (!confirm(Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed', this))) {//No I18N
        return;
    }

    var dnsServerAddress = OPMClient.InventoryOpUtilsController.currentDNSAddr;
    var zoneName = OPMClient.InventoryOpUtilsController.currentZoneName;
    var file = OPMClient.InventoryOpUtilsController.storingDNSImportFile;

    var formData = new FormData();
    formData.set('file', file);//No I18N
    formData.set('dnsServerAddress', dnsServerAddress);//No I18N
    formData.set('zoneName', zoneName);//No I18N
    formData.set('actionType', 'import');//No I18N
    formData.set('wsId', sessionStorage.getItem("wsId"));//No I18N

    var url = window.OPM.apiUrlPattern + "/ipam/previewBINDZoneImport";//No I18N
    backToDevSnapshotPage();
    deviceSlideOut(2);
    opm_infoMsgs('infoMsg',Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this));//No I18N
    opm_ajaxMultiPostAsyncRequestWithMsg(url, formData,"" , false, function(response) {//No I18N
        try {
            if (response === undefined || response === null) {
                opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.ncm.discovery.addToInventory.failure', this));//No I18N
                return;
            }
            
            if (response.status === "in progress" || response.status === "accepted") { //No I18N
                // Import is processing in background - PNS callback will handle result
                // Keep showing processing message
                return;
            }
            
            if (response.error !== undefined) {
                opm_infoMsgs("errorMsg", escapeHTML(response.error.message || response.error));//No I18N
                return;
            }
            if (response.message !== undefined && response.status === 'Failure') {//No I18N
                opm_infoMsgs("errorMsg", escapeHTML(response.message));//No I18N
                return;
            }

            var resultData = response;
            if (response.result !== undefined) {
                resultData = response.result;
                if (typeof resultData === 'string') {//No I18N
                    resultData = JSON.parse(resultData);
                }
            }

            var successCount = resultData.successCount || 0;
            var failCount = resultData.failCount || 0;

            if (failCount === 0 && successCount > 0) {
                opm_infoMsgs("successMsg", Ember.I18n.t('opu.dns.import_success', {successCount: successCount}));//No I18N
            } else if (successCount > 0 && failCount > 0) {
                var partialMsg = Ember.I18n.t('opu.dns.import_partial', {successCount: successCount, failCount: failCount}) + " " + Ember.I18n.t('opu.dns.import_error');//No I18N
                opm_infoMsgs("errorMsg", partialMsg);//No I18N
            } else {
                var failMsg = Ember.I18n.t('opu.dns.import_failed', {failCount: failCount}) + " " + Ember.I18n.t('opu.dns.import_error');//No I18N
                opm_infoMsgs("errorMsg", failMsg);//No I18N
            }
        } catch(e) {
            opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.ncm.discovery.addToInventory.failure', this));//No I18N
        }
    });
}

function buildDNSImportErrorLink(){
    var label = Ember.I18n.t('opu.dns.import_error_download');//No I18N
    return "<a class='opm_link' style='text-decoration:underline;cursor:pointer;' onclick='downloadDNSImportErrorFile();return false;'>" + label + "</a>";//No I18N
}

function downloadDNSImportErrorFile(){
    var eeProbeID = window.OPM.selectedEEProbe || '';//No I18N
    var url = window.OPM.apiUrlPattern + "/ipam/downloadDNSImportErrorFile";//No I18N
    if (eeProbeID) {
        url += "?eeProbeID=" + encodeURIComponent(eeProbeID);//No I18N
    }
    location.href = url;
}


function DNSImportStatusRevAjax(prop) {
    try {
        var data = (typeof prop === 'string') ? JSON.parse(prop) : prop; //No I18N

        var notif = data.DNSImportStatus || data;
        if (data.DNSImportStatus === undefined && data.eventType !== "DNSImportStatus") { //No I18N
            return;
        }

        if (notif.status === "success") { //No I18N
            var successCount = notif.successCount || 0;
            var failCount = notif.failCount || 0;
            
            if (failCount === 0 && successCount > 0) {
                opm_infoMsgs("successMsg", Ember.I18n.t('opu.dns.import_success', {param0: successCount})); //No I18N
            } else if (successCount > 0 && failCount > 0) {
                var partialMsg = Ember.I18n.t('opu.dns.import_partial', {param0: successCount, param1: failCount}) + " " + Ember.I18n.t('opu.dns.import_error'); //No I18N
                opm_infoMsgs("errorMsg", partialMsg); //No I18N
            } else {
                opm_infoMsgs("errorMsg", notif.message); //No I18N
            }
        } else if (notif.status === "error" || notif.status === "Failed") { //No I18N
            var errorText = notif.message || notif.errorMessage || Ember.I18n.t('opu.dns.import_error'); //No I18N
            if (typeof errorText === 'string' && (errorText.indexOf('opu.') === 0 || errorText.indexOf('webclient.') === 0)) { //No I18N
                errorText = Ember.I18n.t(errorText);
            }
            var errorMsg = escapeHTML(errorText);
            opm_infoMsgs("errorMsg", errorMsg); //No I18N
        }
    } catch(e) {
        opm_infoMsgs("errorMsg", "Failed to process DNS import status"); //No I18N
    }
}

function deleteDNS(snapid,widgetIndex,wid,ips){
	if(ips==undefined){
		ips=getEmberSelectedRows("opm_DeviceSnapList"+snapid,"DNSServerAddress");//No I18N
	}
    if(ips === undefined || ips === ""){
        alert(Ember.I18n.t('opu.client.SELECT_ONE_ROW_DELETE', this)); //No I18N
        return;
    }
   
    if(confirm(Ember.I18n.t('js.common.DeleteAlert1',this))){
        var url = window.OPM.apiUrlPattern + "/ipam/deleteDNSServers";//No I18N
		opm_ajaxPostRequestWithMsg(url,{"DNSServerAddress":ips},Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this),{callback: function(response){//No I18N
			if(response.status === "Failure"){
				opm_infoMsgs("errorMsg",response.message); //No I18N
			}else{
				if(wid==undefined){
					reloadSnapWidgets(widgetIndex, true);
				}
				else{
					OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
					reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID);
					OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N
				}
				opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.DNS_DELETED',this)); //No I18N
				OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
			}
		},otpPageType: 'slide'});//NO I18N
    }
}
function editDisplayName(cellValue, options, rowdata, action){
    var val=cellValue;
    if(cellValue==""){
        val=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//NO I18N
    }
    return "<a class='right opm_link'>"+val+"</a>"; //No I18N
}
function SubnetEdit(cellValue, options, rowdata, action)
{
    var val=cellValue;
    if(cellValue==""){
        val=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//NO I18N
    }
    if(window.OPM.isAuthorized){
        return "<a class='opm_link' onclick=EditSubnet('"+rowdata.subnetid+"','"+options.gid.split('opm_DeviceSnapList')[1]+"') target='_blank'>"+val+"</a>";//No I18N
    }else{
        return val;
    }
}
function oputilsDHCPScopeName(cellValue, options, rowdata, action)
{
    var val=cellValue;
    if(cellValue==""){
        val=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//NO I18N
    }
    if(window.OPM.isAuthorized){
        return "<a class='opm_link' onclick=editDHCPScope('"+options.gid.split('opm_DeviceSnapList')[1]+"','"+rowdata['dhcp-scope-id']+"') target='_blank'>"+escapeHTML(val)+"</a>";//No I18N
    }else{
        return val;
    }
}
function rdcCountDisplay(cellValue, options, rowdata, action){
    var dcName = $.jgrid.htmlEncode(rowdata['domain-controller-name']);//No I18N
    if(rowdata['rdcCount'] > 0){
        return "<div>"+dcName+" <span class='blue-chip inline ml-xs'>+"+rowdata['rdcCount']+"</span></div>";//No I18N
    }
    else{
        return $.jgrid.htmlEncode(rowdata['domain-controller-name']);//No I18N
    }
}
function oputilsDHCPScopeAddress(cellValue, options, rowdata, action)
{
    var val=cellValue;
    if(cellValue==""){
        val=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//NO I18N
    }
    if(window.OPM.isAuthorized){
        return "<i  style='color: #3996dd;'>"+val+"</i>";//No I18N
    }else{
        return val;
    }
}
function oputilsDNSZoneName(cellValue, options, rowdata, action)
{
    var val=cellValue;
    var dnsServerTypeInt = rowdata['dns-server-type-int']; //No I18N
    var dnsZoneType = rowdata['dns-zone-type-int']; //No I18N
    if(cellValue==""){
        val=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//NO I18N
    }
    if (window.OPM.isAuthorized && (dnsServerTypeInt != 3 || (dnsZoneType == 4 || dnsZoneType == 5))) {
        return "<i  style='color: #3996dd;'>"+val+"</i>";//No I18N
    }else{
        return val;
    }
}

function OputilsDNSServerAddress(cellValue, options, rowdata, action)
{
     var val=cellValue;
     if (rowdata["dns-server-type-int"] == 2 || rowdata["dns-server-type-int"] == 3) {
         return "<i style='color: #3996dd;' class='cursorPointer' title='"+cellValue+"'>"+cellValue+"</i>";//No I18N
     }
    if(cellValue!=""){
        return " <i style='color: #3996dd;' class='cursorPointer' title='"+cellValue+"'>"+cellValue+"</i><i title='"+cellValue+"' data-ip='"+cellValue+"' class='cursorPointer icon-right-dir oputilsippingicon'></i>";//No I18N
    }
    else{
        val=Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//NO I18N
        return val;
    }
}
function editDHCPServer(wid,dhcpAddress,dhcpServerType){
    if(wid!=undefined&& (typeof wid != "number")){//No I18N
        if(wid.indexOf("opm_DeviceSnapList")!=-1){
            wid=wid.split('opm_DeviceSnapList')[1];//No I18N
        }
    }
    var dhcpDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getDHCPCredentials?dhcpServerAddress='+dhcpAddress+'&dhcpServerType='+dhcpServerType);//No I18N
    if(dhcpDetails.status==="Success"){
        OPMClient.InventoryOpUtilsController.dhcpDetails=dhcpDetails.result;
        OPMClient.InventoryOpUtilsController.dhcpDetails.dhcpServerType=dhcpServerType;
    }else{
        return;
    }
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/EditDHCP"; //No I18N
}
function EditSubnet(subnetId,wid){
    if(wid!=undefined&& (typeof wid != "number")){//No I18N
        if(wid.indexOf("opm_DeviceSnapList")!=-1){
            wid=wid.split('opm_DeviceSnapList')[1];//No I18N
        }
    }
    var subnetdetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getSubnetSummary?subnetId='+subnetId);//No I18N
    OPMClient.InventoryOpUtilsController.subnetDetails=subnetdetails.rows[0];
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=OPMClient.InventoryOpUtilsController.subnetDetails;
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/SubnetEdit"; //No I18N
}
function editDHCPScope(wid,dhcpScopeId){
    OPMClient.InventoryOpUtilsController.set("dhcpScopeId",dhcpScopeId);//No I18N
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/EditDHCPScope"; //No I18N
}
function editDNSServerAddressInWidget(wid,dnsServerId,dnsAddr){
    OPMClient.InventoryOpUtilsController.set("dnsServerEditId",dnsServerId);//No I18N
    OPMClient.InventoryOpUtilsController.set("dnsServerEditAddress",dnsAddr);//No I18N
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/EditDNSServerAddress"; //No I18N
}
function IPV6SubnetEdit(cellValue, options, rowdata, action)
{
    if(cellValue==""){
        cellValue = Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//No I18N
    }
    if(window.OPM.userPermissions.ipamWrite){
        return "<a class='opm_link' onclick=IPV6EditSubnet('"+rowdata.subnetid+"','"+options.gid.split('opm_DeviceSnapList')[1]+"','"+rowdata['subnet-name']+"') target='_blank'>"+cellValue+"</a>"
    }else{
        return cellValue;
    }
}
function IPV6EditSubnet(subnetid,wid,subnetPrefix){
    OPMClient.InventoryOpUtilsController.set('isInvListActionsPgActive',true);//No I18N
    OPMClient.InventoryOpUtilsController.set('opuInvListpartialPageSmall','opuInvListPageActions');//No I18N
    OPMClient.InventoryOpUtilsController.set('invListActionsPgHeader',Ember.I18n.t('opu.views.MODIFY_SUBNET',this));//No I18N
    OPMClient.InventoryOpUtilsController.set('invListActions',"editSubnetPrfixFromWidget");//No I18N
    OPMClient.InventoryOpUtilsController.set('subnetPrefix',subnetPrefix);//No I18N
    OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetId=subnetid;
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
}
function EditIP(cellValue, options, rowdata, action)
{
    if(cellValue==""){
        cellValue= Ember.I18n.t('ipam.v6.ip.commonstr.notdefined', this);//No I18N
    }
    if(window.OPM.isAuthorized){
        return "<a onclick=EditIpDetails('"+rowdata['ip-address']+"','"+options.gid.split('opm_DeviceSnapList')[1]+"') target='_blank'>"+cellValue+"</a>"
    }else{
        return cellValue;
    }
}
function DHCPIPStatus(cellValue, options, rowdata, action){
    var classColor = "iconStatusRed";//No I18N
    var val =rowdata["scan-status-int"];//No I18N
    if(val === "2"){
        classColor = "iconStatusYellow";//NO I18N
    }else if(val === "3"){
        classColor = "iconStatusGreen";//NO I18N
    }else if(val === "5"){
        classColor = "iconStatusBlue";//NO I18N
    }
    return "<i class='iconStatusColor "+classColor+"' title='"+cellValue+"'></i><span>"+cellValue+"</span>"
}

function DHCPFilterStatus(cellValue, options, rowdata, action){
    var val =rowdata["block-status-int"];//No I18N
    if(val === "1"){
        return "<div class='flex flex-middle-align gap-sm'><em class='svgIcon size14 success-color'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#tick-circle'></use></svg></em>"+cellValue+"</div>";
    }else if(val === "2"){
        return "<div class='flex flex-middle-align gap-sm'><em class='svgIcon size14 failed-color'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#close-circle'></use></svg></em>"+cellValue+"</div>";
    }
}

function DHCPPolicyStatus(cellValue, options, rowdata, action){
    var val =rowdata["policy-status-int"];//No I18N
    if(val === "1"){
        return "<div class='flex flex-middle-align gap-sm'><em class='svgIcon size14 success-color'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#tick-circle'></use></svg></em>"+cellValue+"</div>";
    }else if(val === "2"){
        return "<div class='flex flex-middle-align gap-sm'><em class='svgIcon size14 failed-color'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#close-circle'></use></svg></em>"+cellValue+"</div>";
    }
}

function EditIPStatus(cellValue, options, rowdata, action){
    var classColor = "iconStatusRed";//No I18N
    var val =rowdata["scan-status-int"];//No I18N
    if(val === "2"){
        classColor = "iconStatusYellow";//NO I18N
    }else if(val === "3"){
        classColor = "iconStatusGreen";//NO I18N
    }else if(val === "5"){
        classColor = "iconStatusBlue";//NO I18N
    }
    if(window.OPM.userPermissions.ipamWrite && !window.OPM.isCentralServer){
        return "<i class='iconStatusColor "+classColor+"' title='"+cellValue+"'></i><a onclick=EditIpDetails('"+rowdata['ip-address']+"','"+options.gid.split('opm_DeviceSnapList')[1]+"') target='_blank'>"+cellValue+"</a>";
    }else{
        return "<i class='iconStatusColor "+classColor+"' title='"+cellValue+"'></i>"+cellValue;
    }
}
function EditIPStatusicon(cellValue, options, rowdata, action){
    if(window.OPM.isAuthorized){
        return "<i class='icon-configedit' title='"+Ember.I18n.t("webclient.title.edit",this)+"' onclick=EditIpDetails('"+rowdata['ip-address']+"','"+options.gid.split('opm_DeviceSnapList')[1]+"') target='_blank'></i>";
    }
}
function oputilsDNSZoneState(cellValue, options, rowdata, action){
    var classColor = "iconStatusRed";//No I18N
    var val =Ember.I18n.t("opu.ipam.dns.zone.paused",this);//No I18N
    if(cellValue === "true"){//NO I18N
        classColor = "iconStatusGreen";//NO I18N
        val =Ember.I18n.t("jsp.commonstr.Running",this);//No I18N
    }else if(cellValue === "flase"){//NO I18N
        classColor = "iconStatusRed";//NO I18N
        val =Ember.I18n.t("opu.ipam.dns.zone.paused",this);//No I18N
    }
    return "<i class='iconStatusColor "+classColor+"' title='"+val+"'></i>"+val;
}
function EditIpDetails(ipAddress,wid){
    if(window.OPM.userPermissions.ipamWrite){
        OPMClient.InventoryOpUtilsController.pingtooltipip=ipAddress;//No I18N
        if(wid!=undefined){
            OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
        }
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/EditIP/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }
}

function getOpUtilsUsageChartProp(usageCount){
    var ipUtilization = Math.round(usageCount);
    var lowUtil = 20;
    var highUtil = 80;
    if(OPMClient.InventoryDeviceDetailsController.subFilterType ==="Subnets"){
        lowUtil=OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.IPAM.Low;
        highUtil=OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.IPAM.High;
    } else if(OPMClient.InventoryDeviceDetailsController.subFilterType ==="DHCP"){ //No I18N
        lowUtil=OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.DHCP.Low;
        highUtil=OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.DHCP.High;
    }
    else{
        lowUtil=OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.SPM.Low;
        highUtil=OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.SPM.High;
    }
    var bgUtil = Math.round((usageCount * 80) / 100);
        //Green
    var usageColor = "severity_5";//No I18N
    if (ipUtilization > lowUtil && ipUtilization <= highUtil) {
        //Yellow
        usageColor = "severity_2";//No I18N
    } else if (ipUtilization > highUtil) {
        //Red
        usageColor = "severity_1";//No I18N
    }
    return {"class":usageColor,"bgUtil":bgUtil,"ipUtil":ipUtilization};//No I18N
}

function OpUtilsUsageGraph(cellValue, options, rowdata, action)
{
    var prop =getOpUtilsUsageChartProp(cellValue);
    var switchusagecss = prop['class'];
    var bgUtil = prop.bgUtil;
    var ipUtil = prop.ipUtil;
    var renderString = "<div nowrap style='float:left;white-space: nowrap;width:120px;'><div style='float:left;padding-top:0px;background-color: #e4e2e5; width:80px;'><div class='" +switchusagecss+ "' style='width:" +bgUtil + "px;height:20px;float:left;'></div></div><span nowrap style='float:left'>&nbsp;" + ipUtil + "% </span></div>"; //No I18N
    return renderString;
}

function getOpUtilsUsageGraph(cellValue, options, rowdata, action)
{
    var ipUtilization = Math.round(cellValue);
    if (OPMClient.InventoryOpUtilsController.viewType.mapView === "List") {
        return ipUtilization + "%";//No I18N
    }
    return OpUtilsUsageGraph(cellValue, options, rowdata, action);
//    return ""
//    return "<div class='StatusColor'><span class="+usageColor+" style='w idth: 20;' ></span></div>"
}
function oputils_ClickRadialDialSeverity(rp)
{
    var obj = $("#" + rp.id()).data().obj;
    var rogueType = obj.status;
    if (rogueType === "3") {//No I18N
        OPMClient.InventoryOpUtilsController.rogueType = "Discovered";//No I18N
    } else if (rogueType === "4") {//No I18N
        OPMClient.InventoryOpUtilsController.rogueType = "Guest";//No I18N
    } else if (rogueType === "5") {//No I18N
        OPMClient.InventoryOpUtilsController.rogueType = "Trusted";//No I18N
    } else {
        OPMClient.InventoryOpUtilsController.rogueType = "Rogue";//No I18N
    }

    $("#CatServiceDown-A").removeClass("active");
    $("#CatAttention-A").removeClass("active");
    $("#CatTrouble-A").removeClass("active");
    $("#CatCritical-A").removeClass("active");
    $("#" + rp.id()).addClass("active");
    var url = window.OPM.apiUrlPattern + '/rogue/getNicSummaryForRogue?severity='+rogueType;//No I18N
    if(window.OPM.isCentralServer){
        url = eeClientReqToProbe(url,OPMClient.InventoryOpUtilsController.selectedprobeid);
    }
    $.getJSON(url,function(jsonData)
    {
        OPMClient.InventoryOpUtilsController.subFilterObj=jsonData;
        var subFilterType = $('.opm_filterBy ul .active').data("type");//NO I18N
        OPMClient.Inventory.getOpUtilsHrztlBarChartData(OPMClient.InventoryOpUtilsController.subFilterObj[subFilterType],'#BarHolderInvent');//No I18N
    });
    OPMClient.Inventory.oputils_ClearFiltersList();
    if(window.OPM.isOPUtils){
        $('.opmGroupInventory li[data-nav="'+OPMClient.InventoryDeviceDetailsController.subFilterType+'"]').text(obj.title);//No I18N
    }
    OPMClient.Inventory.oputils_loadListViewDetails();
}
function showHideIPAMGroups()
{
    if ($("#existinggroups").css('display') === "block") {
        $("#newgroupdiv").css('display', 'block');
        $("#newgroup").focus();
        $("#existinggroups").css('display', 'none');
    } else {
        $("#newgroupdiv").css('display', 'none');
        $("#existinggroups").css('display', 'block');
    }
}

function backToAddDHCP(page){
    redirectToSnapshot('DHCPSummary', 'GROUP_3');//No I18N
    var timeout = 1000;
    if(window.OPM.isMSPCentral){
        timeout = 10000;
    }
    setTimeout(function(){
        if(page === 'AssociateDHCP'){
            opmGlobalRoute.transitionTo('Inventory.Device.AssociateDHCP');//No I18N
            adDomainForAddSubnet(true);
            $("#dhcpServerAddressSelBox").val(OPMClient.InventoryOpUtilsController.dhcpServerAddress);
        }else{
            opmGlobalRoute.transitionTo('Inventory.Device.AddDHCP');//No I18N
            $("#dhcpServerAddress").val(OPMClient.InventoryOpUtilsController.dhcpServerAddress);
        }
        
    },timeout);
    OPMClient.InventoryOpUtilsController.set('getBacktoSnapshotPage',false);//No I18N
}
function backToAddDNS(page){
    redirectToSnapshot('DNSSummary', 'GROUP_5');//No I18N
    var timeout = 1000;
    if(window.OPM.isMSPCentral){
        timeout = 10000;
    }
    setTimeout(function(){
        if(page === 'AssociateDNS'){
            opmGlobalRoute.transitionTo('Inventory.Device.AssociateDNS');//No I18N
            adDomainForAddSubnet(true);
            $("#dnsServerAddressSelBox").val(OPMClient.InventoryOpUtilsController.dnsServerAddress);
        }else{
            opmGlobalRoute.transitionTo('Inventory.Device.AddDNS');//No I18N
            $("#dnsServerAddress").val(OPMClient.InventoryOpUtilsController.dnsServerAddress);
        }

    },timeout);
    OPMClient.InventoryOpUtilsController.set('getBacktoDNSSnapshotPage',false);//No I18N
    OPMClient.InventoryOpUtilsController.set('getBacktoAssociateDHCPPage',false);//No I18N
}

function fromSnapshotToSettings(url){
    OPMClient.InventoryOpUtilsController.set("fromSnapshotToSettings",true);//No I18N
    location.href = window.OPM.apiclientUrl+url;//No I18N
}

function ipamAddDevice(url){
    OPMClient.InventoryOpUtilsController.set('dhcpServerAddress',"");//No I18N
    OPMClient.InventoryOpUtilsController.set('dnsServerAddress',"");//No I18N
    opmGlobalRoute.transitionTo(url);
}

function openAddADDomainPage()
{
    location.href = "#/Settings/OpUtils/Discovery/AD/Add";//NO I18N
}
function showHideADDomainOption()
{
    if ($("#wmiScan").prop("checked") === true) {
        //$("#addomainoption").css('display', 'block');
    $("#addomainoption").show();
    } else {
        //$("#addomainoption").css('display', 'none');
    $("#addomainoption").hide();
    }
}
function showHideSubnetCredentialOption()
{
    if ($("#pingSNMP").prop("checked") === true) {
        $("#subnetCredential").show();
    } else {
        $("#subnetCredential").hide();
    }
}
function openSPMPortDetailsPage(switchname,ifindex)
{
    if(window.OPM.isCentralServer){
        if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice"){
            OPMClient.InventoryOpUtilsController.selectedprobeid=OPMClient.InventoryDeviceDetailsController.eeProbeID;
        }
        //ifindex = ifindex+"."+OPMClient.InventoryOpUtilsController.selectedprobeid;
    }
    //this is for call SPM tree api
    if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice"){
        OPMClient.InventoryOpUtilsController.set("isPortSnapFromOPMSwitch",true);//NO I18N
    }
    location.href = "#/Inventory/Snapshot/IPAMPort/"+switchname+" "+ifindex;//NO I18N
}
function computeNetworkClass(ip)
{
    if (ip.length == 0)
    {
        return "None";//No I18N
    }
    parts = ip.split(".");
    var oct1 = parts[0];
    var nwClass = "None";//No I18N
    if ((oct1 > 0) && (oct1 <= 127))
    {
        nwClass = "A";//No I18N
    }
    if ((oct1 > 127) && (oct1 < 192))
    {
        nwClass = "B";//No I18N
    }
    if ((oct1 > 191) && (oct1 < 224))
    {
        nwClass = "C";//No I18N
    }
    if (oct1 >= 224 && oct1 <= 239)
    {
        return "D";//No I18N
    }
    if (oct1 >= 240 && oct1 <= 247)
    {
        return "E";//No I18N
    }
    return nwClass;
}

function setButtonState(buttonSelectors, enabled) {
    var cursor = enabled ? 'pointer' : 'not-allowed';//No I18N
    buttonSelectors.forEach(function(selector) {
        $(selector).prop('disabled', !enabled).css('cursor', cursor);
    });
}

function hideAndRemoveValidations(hideDiv, removeClassDiv) {
    $(removeClassDiv).removeClass("validateField error errorBg");
    $(hideDiv).css('display', 'none');
}

function ipamshowIpRange() {
    var subnetAddress = $("#subnetaddr").val();
    var mask = $("#subnetmsk").val();
    var assignTo = $("#assignto").val();
    var isValidInput = subnetAddress.length > 0 && mask.length > 0 && subnetAddress !== '0.0.0.0' && mask !== "selectMask";//No I18N

    if(isValidInput){
        hideAndRemoveValidations('#ipamtreegroup2ErrMsg', '#ipamtreegroup2');//No I18N
        hideAndRemoveValidations('#subnetaddrErrMsg', '#subnetaddr');//No I18N
        setButtonState(['#addsubnetbtn', '#approvesubnetbtn', '#nextBtn', '#updateBtn'], true);//No I18N
    }
    var configPage = OPMClient.InventoryDeviceDetailsController.confPage;
    if (isValidInput && OPMClient.InventoryOpUtilsController.isliscenceNotViolated && (configPage && configPage !== 'AddSupernet' && configPage !== 'EditSupernet')) {
        if ($('#subnetmsk :selected').parent().attr('label') === 'Class B') {
            var msg = Ember.I18n.t('opu.ipam.RESTRICTION_IN_IPAM_LICENSE', { params:"sales@manageengine.com" }, this); //No I18N
            OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg2', msg);//No I18N
            setButtonState(['#addsubnetbtn', '#approvesubnetbtn'], false);//No I18N
            $('#liscenceWarning2').show();
            return;
        } else {
            setButtonState(['#addsubnetbtn', '#approvesubnetbtn'], true);//No I18N
            $('#liscenceWarning2').hide();
        }
    }
    if (isValidInput) {
        var subnet = computeNetAddress(subnetAddress, mask);
        $("#subnetaddr").val(subnet);
        if (assignTo === "supernetLevel") {
            $("#ipamtreegroup2").prop("disabled", false);
            var supernetList = OPMClient.InventoryOpUtilsController.ipamSupernetList;
            if (supernetList !== undefined && supernetList.length > 0) {
                var supernet = findMatchingSupernet(supernetList, subnet, mask);
                if (Object.keys(supernet).length > 0) {
                    $("#ipamtreegroup2").val(supernet.groupId).trigger('change').prop("disabled", true);//No I18N
                    hideAndRemoveValidations('#ipamtreegroup2ErrMsg', '#ipamtreegroup2');//No I18N
                    setButtonState(['#addsubnetbtn', '#approvesubnetbtn', '#nextBtn', '#updateBtn'], true);//No I18N
                } else {
                    setButtonState(['#addsubnetbtn', '#approvesubnetbtn', '#nextBtn', '#updateBtn'], false);//No I18N
                    hideAndRemoveValidations('#subnetaddrErrMsg', '#subnetaddr');//No I18N
                    $("#ipamtreegroup2").prop("disabled", false);
                    opmValidateFormsNew("#ipamtreegroup2", ".ipamtreegroup2_validationError", Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                }
            }
        }
    }
}

function ipamCheckSupernetIP() {

    var subnet = $("#subnetaddr").val();
    var mask = $("#subnetmsk").val();
    var assignTo = $("#assignto").val();
    var selectedSupernet = $("#ipamtreegroup2").val();

    var isValidInput = subnet.length > 0 && mask.length > 0 && subnet !== '0.0.0.0' &&
        mask !== "selectMask";//No I18N

    if(isValidInput){
        hideAndRemoveValidations('#ipamtreegroup2ErrMsg', '#ipamtreegroup2');//No I18N
        hideAndRemoveValidations('#subnetaddrErrMsg', '#subnetaddr');//No I18N
        setButtonState(['#addsubnetbtn', '#approvesubnetbtn', '#nextBtn', '#updateBtn'], true);//No I18N
    }

    if (isValidInput && assignTo === "supernetLevel") {
        var supernetList = OPMClient.InventoryOpUtilsController.ipamSupernetList;
        if (supernetList !== undefined && supernetList.length > 0 && selectedSupernet) {
            var confPage = OPMClient.InventoryDeviceDetailsController.confPage;
            var leastSupernetObj = getParentSupernet(supernetList, subnet, mask);
            var isAvailableParent = leastSupernetObj.find(function(obj) {
                return obj.groupId === selectedSupernet;
            });
            if (isAvailableParent) {
                hideAndRemoveValidations('#subnetaddrErrMsg', '#subnetaddr');//No I18N
                setButtonState(['#addsubnetbtn', '#approvesubnetbtn', '#nextBtn', '#updateBtn'], true);//No I18N
            } else {
                setButtonState(['#addsubnetbtn', '#approvesubnetbtn', '#nextBtn', '#updateBtn'], false);//No I18N
                if(confPage === undefined || (confPage && confPage !== "ApproveSubnet")){ //No I18N
                    hideAndRemoveValidations('#ipamtreegroup2ErrMsg', '#ipamtreegroup2');//No I18N
                    opmValidateFormsNew("#subnetaddr", ".subnetaddr_validationError", Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                }else if(confPage && confPage === "ApproveSubnet"){ //No I18N
                    opmValidateFormsNew("#ipamtreegroup2", ".ipamtreegroup2_validationError", Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                }
            }
        }
    }
}

function ipToBinary(ip) {
    var octets = ip.split('.');
    var binaryOctets = [];
    for (var i = 0; i < octets.length; i++) {
        var num = parseInt(octets[i], 10);
        var bin = num.toString(2);
        while (bin.length < 8) {
            bin = '0' + bin;
        }
        binaryOctets.push(bin);
    }
    return binaryOctets.join('');
}

function findMatchingSupernet(supernetList, subnetIp, subnetMask) {
    var subnetBinary = ipToBinary(subnetIp);
    var subnetPrefixLength = getCIDRForSubnetMask(subnetMask);
    var bestMatch={};
    var bestPrefixLength = -1;
    for (var i=0;i< supernetList.length;i++) {
        var supernet = supernetList[i];
        var supernetdata = supernet.groupName.split('/');
        var netIp = supernetdata[0];
        var netPrefixLength = parseInt(supernetdata[1], 10);
        if (subnetPrefixLength <= netPrefixLength) {
            continue;
        }
        var netBinary = ipToBinary(netIp);
        if (subnetBinary.slice(0, netPrefixLength) === netBinary.slice(0, netPrefixLength)) {
            if (netPrefixLength > bestPrefixLength) {
                bestPrefixLength = netPrefixLength;
                bestMatch = supernet;
            }
        }
    }
    return bestMatch;
}

function getParentSupernet(supernetList, subnetIp, subnetMask) {
    var subnetBinary = ipToBinary(subnetIp);
    var subnetPrefixLength = getCIDRForSubnetMask(subnetMask);
    var bestParent = [];
    for (var i = 0; i < supernetList.length; i++) {
        var supernet = supernetList[i];
        var supernetdata = supernet.groupName.split('/');
        var netIp = supernetdata[0];
        var netPrefixLength = parseInt(supernetdata[1], 10);
        if (netPrefixLength >= subnetPrefixLength) {
            continue;
        }
        var netBinary = ipToBinary(netIp);
        if (subnetBinary.slice(0, netPrefixLength) === netBinary.slice(0, netPrefixLength)) {
            bestParent.push(supernet);
        }
    }
    return bestParent;
}

function ipamSubnetActions(colName, action, subnetid123)
{
    var selectedRows = ""
    var closeShortSummary = false;
    if (subnetid123 !== undefined) {
        selectedRows = subnetid123;
    } else {
        selectedRows = getEmberSelectedRows("opm_Devices", colName);//No I18N
        if(selectedRows === undefined || selectedRows === ""){
            selectedRows =OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet.subnetid;
            closeShortSummary=true;
        }
    }
    var actionKey = "";
    var msg ="";
    var selectedIPAMGroup = "";
    if (action === "ipamsubnet_deleteIcon") {
        if(OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetIPType == "IPv6"){
            actionKey = "deleteIpv6Prefix";//No I18N
        }else{
            actionKey = "deleteSubnets";//No I18N
        }
        msg=Ember.I18n.t("opu.ipam.SUBNET_DELETED",this);//No I18N
        if(!confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUBNET_CONFORM",this))){
            return false;
        }
    }
    else if (action === "ipamsubnet_scanIcon") {//No I18N
        if(OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetIPType == "IPv6"){
            actionKey = "scanv6Subnet";//No I18N
        }else{
            actionKey = "scanSubnets";//No I18N
        }
        msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    }

    var paramsdata = {};
    if (selectedRows !== "" && selectedRows !== undefined) {

        if(OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetIPType == "IPv6"){
            paramsdata.subnetID = selectedRows;
        }else{
            paramsdata.NETID = selectedRows;
        }
    }

    if (selectedIPAMGroup !== "" && selectedIPAMGroup !== undefined) {
        paramsdata.treeNodeID = selectedIPAMGroup;
    }
    // var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ipam/' + actionKey, paramsdata);//No I18N
    // slideSuccessHandler(rsp, "", "");
    var calb = function(response){
        oputilsInventoryReload("Subnets");//No I18N
    if(response.status === "Success"){
            opm_infoMsgs("successMsg",msg);//No I18N    
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
        if(closeShortSummary){
            $('#DeviceList, .opmInventoryHolder').removeClass('deviceShortSummaryActive');
        }
        
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    };
    var rsp = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/ipam/' + actionKey, paramsdata,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}
function oputilsSnapshotActions(tool,action,snappage)
{
    var url = "";
    var msg ="";
    var paramsdata = {};
    var selectedIPAMGroup = "";
    if (snappage === "Subnet" && action === "delete") {
        url = window.OPM.apiUrlPattern + "/ipam/deleteSubnets";//No I18N
        msg=Ember.I18n.t("opu.ipam.SUBNET_DELETED",this);//No I18N
        paramsdata.NETID=OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet.subnetid;
        if(!confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUBNET_CONFORM",this))){
            return false;
        }
    }
    else if (snappage === "Subnet" && action === "scan") {//No I18N
        url = window.OPM.apiUrlPattern + "/ipam/scanSubnets";//No I18N
        paramsdata.NETID=OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet.subnetid;
        msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    }
    else if (snappage === "Subnet" && action === "edit") {//No I18N
        var subnet=OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet['subnet-address'];//NO I18N
        var subnetdetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getSubnetSummary?subnetAddress='+subnet);//No I18N
        OPMClient.InventoryOpUtilsController.subnetDetails=subnetdetails.rows[0];
        location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMSubnet/"+subnet+"/SubnetEdit"; //No I18N
        OPMClient.InventoryOpUtilsController.subnetDetails=OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet;
    }else if (snappage === "IP" && action === "edit") {//No I18N
        var ipaddress =OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet['ip-address'];//NO I18N
        location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMIP/"+ipaddress+"/UpdateIPDetails"; //No I18N
    }
    
    else if (snappage === "IP" && action === "edit") {//No I18N
        var ipaddress =OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet['ip-address'];//NO I18N
        location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMIP/"+ipaddress+"/UpdateIPDetails"; //No I18N
    }
    else if (snappage === "IPv6Subnet" && action === "delete") {//No I18N
        url = window.OPM.apiUrlPattern + "/ipam/deleteIpv6Prefix";//No I18N
        msg=Ember.I18n.t("opu.ipam.SUBNET_DELETED",this);//No I18N
        paramsdata.subnetID=OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet.subnetid;
        if(!confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUBNET_CONFORM",this))){
            return false;
        }
    }
    else if (snappage === "IPv6Subnet" && action === "scan") {//No I18N
        url = window.OPM.apiUrlPattern + "/ipam/scanv6Subnet";//No I18N
        msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
        paramsdata.subnetID=OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet.subnetid;
    }


    var calb = function(response){
        if(response.status === "Success"){
            if ((snappage === "Subnet"||snappage==="IPv6Subnet") && action === "scan") {
		if(!(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSubnet" && OPMClient.ApplicationController.currentPath === "Inventory.Device.index")){
                    reloadSnapWidgets(0)
                }
            }else if ((snappage === "Subnet"  || snappage === "IPv6Subnet" )&& action === "delete") {//No I18N
                redirectToSnapshot('IPAMSubnetGroupSummary', 'GROUP_0');//No I18N
                OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
            }
            opm_infoMsgs("successMsg",msg);//No I18N
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
    };
    if (action !== "edit"){
        var rsp = opm_ajaxPostRequestWithMsg(url, paramsdata,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
    }
}
function oputilsAlarmAction(tool){
    var  selectedRows = getEmberSelectedRows("opm_Alarms","alertid");//NO I18N
    var paramsData = {};//NO I18N
    var actionKey="";

     if(tool === "IPAM"){//NO I18N
        actionKey="ipam/deleteIPAMAlerts";//NO I18N
    }else if(tool === "SPM"){//NO I18N
        actionKey="spm/deleteSPMAlerts";//NO I18N
    }
    paramsData.ALERTID=selectedRows;
    paramsData.actionFrom="deleteAlert";//NO I18N
    var calb = function(response){
         OPMClient.Alarms.OpUtilsAlarmsListView(tool);
         if(response.status === "Failure"){
              opm_infoMsgs("errorMsg",response.message); //No I18N
         }else{
              opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
         }
    };
     var rsp = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/' + actionKey, paramsData,"",calb);//No I18N
}
function spmSwitchActions(tableid,colName,action,configid){
    var selectedRows = ""
    var closeShortSummary = false;
    if(configid !== undefined){
            selectedRows = configid;
    }else{
        if(colName !== undefined && colName !== ""){
            selectedRows = getEmberSelectedRows(tableid,colName);
        }
        if(selectedRows === undefined || selectedRows === ""){
            selectedRows = OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet["config-id"];//No I18N
            closeShortSummary = true;
        }

    }
    var paramsData = {};//NO I18N
    var actionKey="";
    var msg ="";
     if(action === "spmswitch_scanIcon"){//NO I18N
        actionKey="scanSwitches";//NO I18N
        paramsData.CONFIG_ID=selectedRows;
        paramsData.wsId=sessionStorage.getItem("wsId");//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    }else if(action === "spmswitch_deleteIcon"){//NO I18N
        actionKey="deleteSwitches";//NO I18N
        paramsData.configID=selectedRows;
        msg=Ember.I18n.t("webclient.api.deletedevice.success",this);//No I18N
        if(!confirm(Ember.I18n.t("opu.spm.DELETE_CONFORMATION",this))){
            return false;
        }
    }
    var calb = function(response){
        if(action === "spmswitch_scanIcon"){
            if(window.OPM.currentView.name.indexOf("Inventory.Device")==-1){
//                reloadSPMSwitchesListbyGroup();
                $("#opm_Devices").jqGrid('resetSelection');
                //close short summary when scan switch from short summary
                if($("#DeviceList").hasClass("deviceShortSummaryActive")){
                    redirectList("OpUtils");//No I18N
                }
            }else if(window.OPM.currentView.name.indexOf("Inventory.Device")!=-1) {
                slideOut(1);
                backToDevSnapshotPage();
                reloadSnapWidgets(1, true);
                OPMClient.Inventory.getIPAMSPMTreeView("SPM");//NO I18N
            }
        }else{
            if(window.OPM.currentView.name.indexOf("Inventory.Device")!=-1) {
                slideOut(1);
                backToDevSnapshotPage();
                reloadSnapWidgets(1, true);
                OPMClient.Inventory.getIPAMSPMTreeView("SPM");//NO I18N
            }else{
                oputilsInventoryReload("Switches");//No I18N
            }
        }
        if(response.status === "Success"){
            opm_infoMsgs("successMsg",msg);//No I18N    
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
        
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    };
     var rsp = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/spm/' + actionKey, paramsData,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}
function oputilsNetworkMonitorsActions(action,ipaddresses)
{
    if(ipaddresses==undefined){
        var ipaddresses = getEmberSelectedRows("opm_Devices", "ip-address");//No I18N
        if (ipaddresses == "" || ipaddresses === undefined)
        {
            alert(Ember.I18n.t('webclient.general.selectdevices', this)); //No I18N
            return;
        }
    }
    var actionKey = "nwmStartMonitor";//No I18N
    if (action == "Start")
    {
        actionKey = "nwmStartMonitor";//No I18N
        if(!confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_START_MONITORING",this))){//NO I18N
            return false;
        }
    }
    else if (action == "Pause")
    {
        actionKey = "nwmPauseMonitor";//No I18N
        if(!confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_PAUSE_MONITORING",this))){//NO I18N
            return false;
        }
    }
    else if (action == "Delete")
    {
        actionKey = "deleteNWMDevices";//No I18N
        if(!confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_DELETE_DEVICE",this))){//NO I18N
            return false;
        }
    }
    var paramsData = {"IPADDRESS": ipaddresses};//No I18N

    var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/nwm/' + actionKey, paramsData);//No I18N
    if (rsp.status === "Success" && action === "Delete") {
        // OPMClient.Inventory.oputils_getInventoryTotalCount();
        opm_infoMsgs("successMsg",Ember.I18n.t("webclient.api.deletedevice.success",this));//No I18N
        oputilsInventoryReload("Ping");//No I18N
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    } else {
        opm_infoMsgs("successMsg",Ember.I18n.t("fwa.compliance.Update_Successful",this));//No I18N
        OPMClient.Inventory.oputils_loadListViewDetails();
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    }
}

function reserveUnReserve(actionFrom){
    var fieldsToValidate = {'empty':['reserveIPAddress','reserveMACAddress'],'macCheck':['reserveMACAddress']};//No I18N
    if(!(opm_validateFields(fieldsToValidate))){
        return false;
    }   
    var gridId = "opm_DeviceSnapList" + OPMClient.InventoryOpUtilsController.widgetID;//No I18N
    var selectedRowID = OPMClient.InventoryOpUtilsController.selectedRowID;
    var rowData = jQuery('#'+gridId).jqGrid('getGridParam','data')[selectedRowID-1];  
    var dhcpServerId = rowData['dhcp-server-id'];//No I18n
    var macAddress=$('#reserveMACAddress').val();
    var dhcpScopeAddress=rowData['dhcp-scope-address']; //No I18n
    var ipAddress=rowData['ip-address']; //No I18n
    var description = $('#reservDescriptionBox').val();
    var data ={};
    if(dhcpServerId!=undefined && dhcpServerId!=""){
        data.dhcpServerId = dhcpServerId;
    }    
    if(macAddress!=undefined && macAddress != ""){
        data.macAddress = macAddress;
    } 
    if(dhcpScopeAddress!=undefined && dhcpScopeAddress != ""){
        data.dhcpScopeAddress = dhcpScopeAddress;
    } 
    if(ipAddress!=undefined && ipAddress != ""){
        data.ipAddress = ipAddress;
    } 
    if(actionFrom!=undefined && actionFrom != ""){
        if(actionFrom == "reserv"){//No I18n
            data.actionFrom = "addReserv"; //No I18n
        }else{
            data.actionFrom = "removeReserv";//No I18n
        }
    } 
    if(description!=undefined && description != ""){
        data.description = description;
    }

    if(actionFrom!=undefined && actionFrom != ""){//NO I18N
        if(!confirm(Ember.I18n.t('opu.ipam.RESERV_IP_WARNING_BANNER',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
            return;
        }else{
        deviceSlideOut(3);
        }
    }

    url = window.OPM.apiUrlPattern+"/ipam/updateDHCPReservations";//No I18N
    opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
        if(response !== null && response.status=="Success"){
                if(response.result !== null && response.result !== undefined){
                    opm_infoMsgs("successMsg",response.result); //No I18N
                }else{
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.devices.details.updatesuccess',this));//No I18N
                }
                reloadSnapshotPage();                
        }else if(response !== null && response.status=="Failure"){//NO I18N
                opm_infoMsgs("errorMsg",response.message);//NO I18N
        }
        else if(response.error!=undefined && response.error.message!=undefined){
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }
    },otpPageType: 'slide'});//NO I18N
}

function blockUnblockSelectedMACFromDHCPServer(operationType){
    var macList ="";
    var data = {};
    var successmsg ="";
    if(OPMClient.InventoryOpUtilsController.dhcpFilterDetails !== undefined){
        if(OPMClient.InventoryOpUtilsController.dhcpFilterDetails.selectedMAC !== undefined && OPMClient.InventoryOpUtilsController.dhcpFilterDetails.selectedMAC.length > 0){
            var macList=OPMClient.InventoryOpUtilsController.dhcpFilterDetails.selectedMAC.toString();
        }
    }    
    if(macList !== undefined && macList!== null){
        macList = macList.replaceAll(' ', '');
    }
    data.macAddress = macList;
    if(operationType != undefined && operationType == "block"){//NO I18N 
        data.actionFrom = "block"; //NO I18N 
    }else if(operationType != undefined && operationType == "unblock"){ //NO I18N 
        data.actionFrom = "unblock"; //NO I18N 
    }else if(operationType != undefined && operationType == "remove"){ //NO I18N 
        data.actionFrom = "removeMac"; //NO I18N 
    }

    if($('#filterDesc').val()!==undefined){
        data.description=$('#filterDesc').val();
    }
    
    if(OPMClient.InventoryOpUtilsController.selDhcpCredCount > 0){
        var serverList = [];
        $.each($('.multiSelOptionList input[type=checkbox].dhcpCredentials:checked'), function(k, v) { //No I18N
            serverList.push(v.value);
        });
        data.dhcpServerId=serverList.toString();
    }else{
        alert(Ember.I18n.t("webclient.common.widgets.selectadevice", this));//NO I18N
        return;
    }    
    if(operationType != undefined && operationType == "block"){//NO I18N
        if(!confirm(Ember.I18n.t('opu.ipam.BLOCK_MAC_CONFIRM',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
            return;
        }else{
        deviceSlideOut(3);
        }
    }
    if(operationType != undefined && operationType == "remove"){//NO I18N
        if(!confirm(Ember.I18n.t('opu.ipam.REMOVE_MAC_CONFIRM',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
            return;
        }else{
        deviceSlideOut(3);
        }
    }
    var url = window.OPM.apiUrlPattern+'/ipam/allowOrBlockDevicesInDHCPMacFilter';//NO I18N
    opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
        if(response !== null && response.status=="Success"){
                if(response.result !== null && response.result !== undefined){
                    opm_infoMsgs("successMsg",response.result); //No I18N
                }else{
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.devices.details.updatesuccess',this));//No I18N
                }               
                if (OPMClient.InventoryDeviceDetailsController.subFilterType == "Rogue") {
                    oputilsInventoryReload(OPMClient.InventoryDeviceDetailsController.subFilterType);
                    OPMClient.Inventory.oputils_loadListViewDetails();
                }else{
                    reloadSnapshotPage();
                }
                OPMClient.InventoryOpUtilsController.set("dhcpFilterDetails",{}); //NO I18N
                OPMClient.InventoryOpUtilsController.set("selDhcpCredCount",0); //NO I18N
                $('.deviceSlideContent.deviceSlideDivIn-3.slideMedium').removeClass('slideMedium').addClass('slideSmall');
        }else if(response !== null && response.status=="Failure"){//NO I18N
                opm_infoMsgs("errorMsg",response.message);//NO I18N
        }
        else if(response.error!=undefined && response.error.message!=undefined){
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }
    },otpPageType: 'slide'});//NO I18N  
}

function oputilsDHCPFilterActions(widgetID,actionFrom,action,moreparams){
    var data = {};
    var selectedMACs="";
    var selectedServer="";
    var selecteddhcpids = [];

    if(actionFrom !== undefined && actionFrom !== "" && actionFrom !== "macFilter"){//NO I18N
        var selectedMACs = getEmberSelectedRows("opm_Devices", "MacAddress");//No I18N
        var selectedServer = getEmberSelectedRows("opm_Devices", "dhcpServer-id");//No I18N
    }
    if(actionFrom !== undefined && actionFrom !== "" && actionFrom === "macFilter"){//NO I18N
        if(action !== undefined && action !== "allFilters"){//NO I18N
            if(widgetID != undefined && widgetID != "" && widgetID !== null){
               var selectedMACs = getEmberSelectedRows("opm_DeviceSnapList"+widgetID, "MacAddress");//No I18N
               var selectedServer = getEmberSelectedRows("opm_DeviceSnapList"+widgetID, "dhcpServer-id");//No I18N
            }
        }
    }

    if ((selectedMACs === undefined || selectedMACs.length === 0) && (action != undefined && action !== "allFilters")) {
        alert(Ember.I18n.t("opu.views.SELECT_ONE_VALUE_AVAILABLE_COL",this));//No I18N
        return false;
    }

    var selectedMACArr = (selectedMACs != "") ? selectedMACs.split(',') : [];
    var selectedServArr = (selectedServer != "") ? selectedServer.split(','):[];

    if(selectedMACArr.length >0  &&  selectedServArr.length>0){        
        for(var i=0 ;i<selectedServArr.length;i++){
            if(selecteddhcpids.length > 0){
                if(!selecteddhcpids.includes(selectedServArr[i])){
                    selecteddhcpids.push(selectedServArr[i]);
                }
            }else{
                selecteddhcpids.push(selectedServArr[i]);
            }
        }
        data.macAddress = selectedMACs;
        data.dhcpServerId = selecteddhcpids.join(",");
    }

    if (action === "allowMAC") {
        data.actionFrom = "unblock";//No I18N
    }
    else if(action === "removeMAC"){//NO I18N
        if(!confirm(Ember.I18n.t("opu.ipam.REMOVE_MAC_CONFIRM",this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed', this))){//NO I18N
            return false;
        }else{
            deviceSlideOut(3);
        }
        data.actionFrom = "removeMac";//No I18N
    }else if(action === "allFilters"){//No I18N
        data.dhcpServerId = OPMClient.InventoryOpUtilsController.dhcpServerID;
        data.actionFrom = "allFilters";//No I18N
    }
    var url = window.OPM.apiUrlPattern+'/ipam/allowOrBlockDevicesInDHCPMacFilter'; //NO I18N    
    opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
        if(response !== null && response.status=="Success"){
            if(response.result !== null && response.result !== undefined){
                opm_infoMsgs("successMsg",response.result); //No I18N
            }else{
                if(action != undefined && action == "allFilters"){
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.admin.dbmanagement.updated',this));//No I18N
                }else{
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.api.deletedevice.success',this));//No I18N
                }
            }
            reloadSnapshotPage();
        }else if(response !== null && response.status=="Failure"){//NO I18N
            if(action != undefined && action == "allFilters"){
                opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.fwa.flow.action.failed', this));//No I18N
            }else{
                opm_infoMsgs("errorMsg",response.message);//NO I18N
            }
        }
        else if(response.error!=undefined && response.error.message!=undefined){
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }        
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    },otpPageType: 'slide'});//NO I18N    
}

function oputilsDHCPPolicyActions(widgetID,actionFrom,action,moreparams){
    var data = {};
    var selectedIPs="";
    if(actionFrom !== undefined && actionFrom !== "" && actionFrom !== "dhcpPolicy"){//NO I18N
        var selectedIPs = getEmberSelectedRows("opm_Devices", "policy-id");//No I18N
    }
    if(actionFrom !== undefined && actionFrom !== "" && actionFrom === "dhcpPolicy"){//NO I18N
        if(action !== undefined && action !== "allPolicies"){//NO I18N
            if(widgetID != undefined && widgetID != "" && widgetID !== null){
               var selectedIPs = getEmberSelectedRows("opm_DeviceSnapList"+widgetID, "policy-id");//No I18N
            }
        }
    }
    if ((selectedIPs === undefined || selectedIPs.length === 0) && (action != undefined && action !== "allPolicies")) {
        alert(Ember.I18n.t("opu.views.SELECT_ONE_VALUE_AVAILABLE_COL",this));//No I18N
        return false;
    }
    var selectedIPArr = (selectedIPs != "") ? selectedIPs.split(',') : [];
    if(selectedIPArr.length >0){
        data.dhcpPolicyId = selectedIPs;
    }
    if(action === "removePolicy"){//NO I18N
        var url = window.OPM.apiUrlPattern+'/ipam/removeDHCPIPv4Policy'; //NO I18N
        if(!confirm(Ember.I18n.t('opu.ipam.DHCP.POLICY_DELETE_CONFIRM',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
            return false;
        }else{
            deviceSlideOut(3);
        }
    }else if(action === "allPolicies"){//No I18N
        var url = window.OPM.apiUrlPattern+'/ipam/syncDHCPIPv4Policy'; //NO I18N

    }
    data.dhcpServerId = OPMClient.InventoryOpUtilsController.dhcpServerID;
    opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
        if(response !== null && response.status=="Success"){
            if(response.result !== null && response.result !== undefined){
                opm_infoMsgs("successMsg",response.result); //No I18N
            }else{
                if(action != undefined && action == "allPolicies"){
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.admin.dbmanagement.updated',this));//No I18N
                }else{
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.api.deletedevice.success',this));//No I18N
                }
            }
            reloadSnapshotPage();
        }else if(response !== null && response.status=="Failure"){//NO I18N
           if(response.message != undefined && response.message !== null){
               opm_infoMsgs("errorMsg",response.message);//NO I18N
           }else if(action != undefined && action == "allPolicies"){ //NO I18N
               opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.fwa.flow.action.failed', this));//No I18N
           }
        }
        else if(response.error!=undefined && response.error.message!=undefined){
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    },otpPageType: 'slide'});//NO I18N
}

function saveRogueComments(){
    var commentsBox=$("#rogueCommentsBox");
    if(commentsBox.val().trim()==Ember.I18n.t('ipam.v6.ip.commonstr.notdefined')){
        deviceSlideOut(3);
        return;
    }
    var calb = function(response){
    	if(response.status=="Success"){
            opm_infoMsgs("successMsg",Ember.I18n.t("UpdatedSuccessFully",this)); //No I18N
            deviceSlideOut(3);
            OPMClient.Inventory.oputils_loadListViewDetails();
        }else if(response.status=="Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//NO I18N
        }
        else if(response.error!=undefined && response.error.message!=undefined){
            opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }
    };
    var data = {"RESOURCEID":commentsBox.attr("resId"),"comments":commentsBox.val()};//No I18N
    opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+'/rogue/updateRogueComments', data ,"",calb);//No I18N
}

function saveFilterDescription(){
    var descriptionBox=$("#filterDescriptionBox");
    if(descriptionBox.val().trim()==Ember.I18n.t('ipam.v6.ip.commonstr.notdefined')){
        deviceSlideOut(3);
        return;
    }
    var calb = function(response){
    	if(response.status=="Success"){
            opm_infoMsgs("successMsg",Ember.I18n.t("UpdatedSuccessFully",this)); //No I18N
            deviceSlideOut(3);
            reloadSnapshotPage();
        }else if(response.status=="Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//NO I18N
        }
        else if(response.error!=undefined && response.error.message!=undefined){
            opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }
    };
    var data = {"FILTERID":descriptionBox.attr("filterId"),"description":descriptionBox.val()};//No I18N
    opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+'/ipam/updateMacFilterDescription', data ,"",calb);//No I18N
}

function oputilsRogueActions(action, moreparams)
{
    var selectedRows = getEmberSelectedRows("opm_Devices", "resource-id");//No I18N
    var operationkey = "";
    var data = {};//No I18N

    if (action === "MarkAsTrust") {
        operationkey = "markAsTrusted";//NO I18N
        if (!confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_MARK_SYS_TRUSTED", this))) {//NO I18N
            return false;
        }
    }
    // else if(action === "MarkAsTrustAll"){//NO I18N
    //     if(!confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_MARK_SYS_TRUSTED_ALL",this))){//NO I18N
    //         return false;
    //     }
    //     operationkey = "markAllAsTrusted";//NO I18N
    // }
    else if (action === "MarkAsGuest") {
        data.validDate=$("#rogueGuestValidPeriod").val();
        if(data.validDate ===  undefined || data.validDate === "" ){
            alert(Ember.I18n.t("opu.common.VALID_DATE_FOR_GUEST",this));//NO I18N
            return;
        }
        if($('#GuestDescription').val()!==undefined){
            data.description=$('#GuestDescription').val();
        }
        operationkey = "markAsGuest";//NO I18N
    }
    else if (action === "Delete") {
        if (!confirm(Ember.I18n.t('opu.views.DO_YOU_WANT_DELETE_DEVICE', this))) {//NO I18N
            return false;
        }
        operationkey = "deleteDiscoveredDevices";//NO I18N
    }
    else if (action === "MarkAsRogue") {
        if (!confirm(Ember.I18n.t("opu.views.DO_YOU_WANT_MARK_SYS_ROGUE", this))) {//NO I18N
            return false;
        }
        operationkey = "markAsRogue";//NO I18N
    }
    else if (action === "DeleteAll") {
        if (!confirm(Ember.I18n.t('opu.rogue.DELETE_CONFORMATION',{param0:getrogueTypeI18n(OPMClient.InventoryOpUtilsController.rogueType)}, this))) {//NO I18N
            return false;
        }
        operationkey = "deleteAllDiscoveredDevices?rogueType="+OPMClient.InventoryOpUtilsController.rogueType;//NO I18N
        var subFilterType = $('.opm_filterBy ul .active').data("type");//NO I18N
        if(subFilterType!=undefined && OPMClient.InventoryOpUtilsController.subFilterData.length>0){
            operationkey = operationkey + '&subfilter=' + subFilterType+'&' +subFilterType+'='+OPMClient.InventoryOpUtilsController.subFilterData.toString();//No I18N
        }
    }
    if (action === "MarkAsGuest" && OPMClient.ApplicationController.gridIdData == null) { //No I18N
        data.ID = selectedRows;
    } else if(action === "MarkAsGuest" && OPMClient.ApplicationController.gridIdData != null){ //No I18N
        data.ID = OPMClient.ApplicationController.gridIdData.selDev;
    }else {
        data.RESOURCEID = selectedRows;
    }

    var calb = function (response) {
        if (response.status == "Success") {
            if (action === "MarkAsGuest" && OPMClient.ApplicationController.gridIdData != null) {
                reloadSnapWidgets(OPMClient.ApplicationController.gridIdData.gridData.snapIndex);
                OPMClient.ApplicationController.set("gridIdData", null); //No I18N
	    }
            if(action === "Delete" || action === "DeleteAll"){
                opm_infoMsgs("successMsg", Ember.I18n.t('webclient.ncm.discovery.deleteMsg', this)); //No I18N
            }else{
                opm_infoMsgs("successMsg", Ember.I18n.t("UpdatedSuccessFully", this)); //No I18N
            }
        } else if (response.status == "Failure") {//NO I18N
            opm_infoMsgs("errorMsg", response.message);//NO I18N
        }
        else if (response.error != undefined && response.error.message != undefined) {
            opm_infoMsgs("errorMsg", response.error.message); //No I18N
        }
        deviceSlideOut(3);
        OPMClient.Inventory.oputils_ClearFiltersList();
        OPMClient.Inventory.oputils_loadListViewDetails();		
        if (OPMClient.InventoryDeviceDetailsController.subFilterType == "Rogue") {
	   OPMClient.Inventory.OpUtilsInventoryRogueSummary(OPMClient.InventoryOpUtilsController.rogueType);
        }
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    };

    opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/rogue/' + operationkey, data, "", calb);//No I18N
}

function getrogueTypeI18n(param){
    if(param==="Discovered"){//No I18N
        return Ember.I18n.t('webclient.discovery.success.discovered',this);//No I18N
    }else if(param==="Trusted"){//No I18N
        return Ember.I18n.t('opu.common.TRUSTED',this);//No I18N
    }else if(param==="Guest"){//No I18N
        return Ember.I18n.t('opu.common.GUEST',this);//No I18N
    }else if(param==="Rogue"){//No I18N
        return Ember.I18n.t('opu.tools.ROGUE',this);//No I18N
    }
}

function oputilsIPAMChangeIPStatus()
{
    var selectedRows = getEmberSelectedRows("opm_Devices", "resource-id");//No I18N
    var closeShortSummary =false;
    if((selectedRows === undefined || selectedRows ==="") && OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet !== undefined){
        selectedRows = OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet["resource-id"];//No I18N
        closeShortSummary =true;
    }
    if(OPMClient.InventoryOpUtilsController.ipamUpdateIPStatus === "Rogue"){

        var ipstatus = $('input:radio[name=roguests]:checked').val();
        if(ipstatus === "Guest"){
            OPMClient.Inventory.oputilsRogueMoveGuest()
        }else{
            oputilsRogueActions(ipstatus);
        }
    }else{
        var ipstatus = $('input:radio[name=availabilitysts]:checked').val();
        if(OPMClient.InventoryOpUtilsController.ipamUpdateIPStatus === "Reserved")
        {
            ipstatus = $('input:radio[name=reservedsts]:checked').val();
        }
       var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ipam/updateIPState', {"markAs":ipstatus,"RESOURCEID":selectedRows});//No I18N
        if (rsp !== undefined) {
            if(closeShortSummary){
                $('#DeviceList, .opmInventoryHolder').removeClass('deviceShortSummaryActive');
            }
            deviceSlideOut(3);
            oputilsInventoryReload(OPMClient.InventoryDeviceDetailsController.subFilterType);//No I18N
            $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
        }
    }
}

function RogueBlockUnBlockSwitchPort(operation)
{
    var data = {"macAddress": $("#roguemacaddress").text()};//No I18N
    var switchname = $("#switchname").val();
    var ifindex = $("#IFINDEX").val();
    if (switchname === undefined || switchname === "") {
        alert(Ember.I18n.t('opu.spm.SWITCH_NAME_CANNOT_BE_EMPTY', this));//No I18N
        $("#switchname").focus();
        return;
    }
   /* if (opm_checkSpecialChars(switchname))
    {
        alert(Ember.I18n.t('opu.common.PLEASE_ENTER_HOSTNAME_WITHOUT_SPL_CHARS', this));//No I18N
        $("#switchname").focus();
        return;
    }*/
    if (ifindex === undefined || ifindex === "" || !opm_IsNumeric(ifindex))
    {
        alert(Ember.I18n.t('opu.spm.EnterValidIfIndex', this));//No I18N
        $("#IFINDEX").focus();
        return;
    }

    var successmsg = Ember.I18n.t("opu.spm.SUCCESSFULLY_BLOCKED_THE_SELECTED_PORT",this);//NO I18N
    if(operation === "unBlockSwitchPort"){
        successmsg = Ember.I18n.t("opu.spm.SUCCESSFULLY_UNBLOCKED_THE_SELECTED_PORT",this);//NO I18N
    }


    data.switchName = switchname;
    data.ifIndex = ifindex;
    
    oputilsDisableEnableSwitchPort(window.OPM.apiUrlPattern + '/rogue/' + operation, data,successmsg,true);//No I18N
}
function oputilsDisableEnableSwitchPort(url,data,successMSG,willcolsedive,reloadsubfilter)
{
	var credentialName = unescape($('#hostCred option:selected').val());
    
        if (credentialName == "" || credentialName == undefined || credentialName == "None") {
			opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.settings.selectcredential', this));//No I18N 
			$("#hostCred").focus();
			return;
		}
        data.credentialName = credentialName;
    opm_ajaxPostMethod(url,data,{callback: function(response){
    	Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this);//NO I18N
        if(willcolsedive){
                if(response !== null && response.status === "Failure"){
                    opm_infoMsgs("errorMsg",response.message);//No I18N
                }else{
                    opm_infoMsgs("successMsg",successMSG);//No I18N
                      deviceSlideOut(3);
                    $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');//No I18N
                    if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMPort"){
                        reloadSnapWidgetsByWidgetName("ipam.port.summary"); // No I18N
                    } else if(reloadsubfilter && OPMClient.InventoryOpUtilsController.portsWidgetId===""){
                        oputilsInventoryReload(OPMClient.InventoryDeviceDetailsController.subFilterType);
                    }else if(OPMClient.InventoryOpUtilsController.portsWidgetId!==""){
                        reloadSnapWidgets(OPMClient.InventoryOpUtilsController.portsSnapIndex)
                    }
                    else{
                        OPMClient.Inventory.oputils_loadListViewDetails();
                    }
                    $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
                }
        }
    },otpPageType: 'slide'});//NO I18N

}
function oputilsAdministrativeDisableEnablePort(operation){
    var id = "#opm_Devices";//No I18N
    if(OPMClient.InventoryOpUtilsController.portsWidgetId!==""){
        id = "#"+OPMClient.InventoryOpUtilsController.portsWidgetId;
    }
    var successmsg = Ember.I18n.t("opu.spm.SUCCESSFULLY_BLOCKED_THE_SELECTED_PORT",this);//NO I18N
    if(operation === "adminEnableInterfaces"){
        successmsg = Ember.I18n.t("opu.spm.SUCCESSFULLY_UNBLOCKED_THE_SELECTED_PORT",this);//NO I18N
    }
    if (OPMClient.InventoryDeviceDetailsController.inventorysnapType == "IPAMPort") {
        var portDetails = OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet;
        var ifindex = portDetails["connected-port-ifindex"];//No I18N
        var key = portDetails["switch-name"];//No I18N
        var switchID = portDetails["config-id"];//No I18N
        oputilsDisableEnableSwitchPort(window.OPM.apiUrlPattern + '/spm/' + operation, {"ifIndex":ifindex,"switchID":switchID,"switchName":key},successmsg,true,true);//No I18N
    } else {
        var selRowIds = $(id).jqGrid('getGridParam', 'selarrrow');  //No I18N
        if (selRowIds.length === 0) {
            alert(Ember.I18n.t("opu.views.BLOCK_UNBLOCK_SWITCH_PORT",this));//No I18N
            return false;
        }

        var ifindexBySwitch = {};
        var totalswitchescount = 0;
        for(var i=0;i<selRowIds.length;i++)
        {
            var ifindex = $(id).jqGrid('getCell', selRowIds[i], 'connected-port-ifindex');
            var switchName = $(id).jqGrid('getCell', selRowIds[i], 'switch-name');
            var switchid = $(id).jqGrid('getCell', selRowIds[i], 'config-id');

            var switchdetails =ifindexBySwitch[switchName];
            if(switchdetails === undefined){
                totalswitchescount++;
                ifindexBySwitch[switchName]={"ifindex":ifindex,"switchid":switchid};//No I18N
            }else{
                var switchInterfaces = switchdetails.ifindex;
                switchdetails.ifindex=switchInterfaces+","+ifindex;//No I18N
                ifindexBySwitch[switchName]=switchdetails;
            }
        }
        var willColsediv = false;
        var islastswitch=1;
        $.each(ifindexBySwitch, function(key,vals)
        {
            if(totalswitchescount == islastswitch){
                willColsediv=true;
            }
            islastswitch++;
            oputilsDisableEnableSwitchPort(window.OPM.apiUrlPattern + '/spm/' + operation, {"ifIndex":vals.ifindex,"switchID":vals.switchid,"switchName":key},successmsg,willColsediv,willColsediv);//No I18N
        });
    }


}function oputilsSPMChangePortIfAlias(){
    var id = "#opm_Devices";//No I18N
    if(OPMClient.InventoryOpUtilsController.portsWidgetId!==""){
        id = "#"+OPMClient.InventoryOpUtilsController.portsWidgetId;
    }
    var selRowIds = $(id).jqGrid('getGridParam', 'selarrrow');  //No I18N    
    var ifindexBySwitch = {};
    var willColsediv = false;
  if (selRowIds.length === 0){
        var shortinfo =OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet;
        willColsediv=true;
        var ifIndex = shortinfo["connected-port-ifindex"];//No I18N
        var switchName = shortinfo["switch-name"];//No I18N
        var ifalias = document.getElementById(switchName+"_"+ifIndex).value;//No I18N
        ifindexBySwitch[switchName]={"ifindex":ifIndex,"switchid":shortinfo["config-id"],"ifAliasList":ifalias};//No I18N
        
    }
    // if (selRowIds.length === 0) {
    //     alert(Ember.I18n.t("opu.spm.SELECT_SELECT_PORT_TO_MODIFY_IFALIAS_NAME",this));//No I18N
    //     return false;
    // } 
    
    
    var totalswitchescount = 0;
    for(var i=0;i<selRowIds.length;i++)
    {
        var ifindex = $(id).jqGrid('getCell', selRowIds[i], 'connected-port-ifindex');
        var switchName = $(id).jqGrid('getCell', selRowIds[i], 'switch-name');
        var switchid = $(id).jqGrid('getCell', selRowIds[i], 'config-id');
        var ifalias = document.getElementById(switchName+"_"+ifindex).value;
        var switchdetails =ifindexBySwitch[switchName];
        if(switchdetails === undefined){
            totalswitchescount++;
            ifindexBySwitch[switchName]={"ifindex":ifindex,"switchid":switchid,"ifAliasList":ifalias};//No I18N
        }else{
            var switchInterfaces = switchdetails.ifindex;
            switchdetails.ifindex=switchInterfaces+","+ifindex;//No I18N
            switchdetails.ifAliasList=switchdetails.ifAliasList+","+ifalias;//No I18N
            ifindexBySwitch[switchName]=switchdetails;
        }
    }
    
    var islastswitch=1;
    $.each(ifindexBySwitch, function(key,vals)  
    {
        if(totalswitchescount == islastswitch){
            willColsediv=true;
        }
        islastswitch++;
        oputilsDisableEnableSwitchPort(window.OPM.apiUrlPattern + "/spm/updateBulkIfAliasName", {"ifIndex":vals.ifindex,"ifAliasList":vals.ifAliasList,"switchID":vals.switchid,"switchName":key},Ember.I18n.t("opu.spm.SUCCESSFULLY_MODIFIED_THE_SELECTED_IFALIAS_NAME",this),willColsediv);//No I18N
    });
}
function oputilsDHCPServerScan(serverIP){
    var paramsData = {};
    var url="";
    var msg =Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    url=window.OPM.apiUrlPattern + '/ipam/scanDHCPServers';//No I18N
    paramsData.ServerAddress=""+serverIP;
    var calb = function(response){
    if(response.status === "Success"){
            opm_infoMsgs("successMsg",msg);//No I18N
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
        oputilsInventoryReload("DHCP");//No I18N
    };

    var rsp = opm_ajaxPostRequestWithMsg(url , paramsData,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}
function oputilsDHCPServerActions(hasClass,classs){
    
    var dhcpservers = $('.dhcpServerDetails .dhcpServerDetailsSingle > input:checked');
    var selectedRows = [dhcpservers.length]
    $.each(dhcpservers, function(k,obj)
    {
        selectedRows[k]=$(obj).data("dhcpserver")
    });

    var paramsData = {};
    var url="";
    var msg ="";
    if(classs.hasClass("ipamDHCP_scanIcon")){
        url = "scanDHCPServers";//No I18N
        msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    }else if(classs.hasClass("ipamDHCP_deleteIcon")){//No I18N
        url = "deleteDHCPServers";//No I18N
        msg=Ember.I18n.t("webclient.api.deletedevice.success",this);//No I18N
}
    paramsData.ServerAddress=""+selectedRows;
    var calb = function(response){
    if(response.status === "Success"){
            opm_infoMsgs("successMsg",msg);//No I18N
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
        oputilsInventoryReload("DHCP");//No I18N
        $('.opmInventoryHolder').removeClass('AETIDRowChecked');
    };
     var rsp = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/ipam/' + url , paramsData,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}
function drawSPMSwitchPort(jsonData1)
{
    if (jsonData1.status !== "Failure") {
        if(window.OPM.isCentralServer){//Select probe & name for list OPU probe drop down.
            if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice"){
                OPMClient.InventoryOpUtilsController.selectedprobeid=OPMClient.InventoryDeviceDetailsController.eeProbeID;
                if(OPMClient.InventoryOpUtilsController.probedetails.length >0){//select relavent probe name
                    $.each(OPMClient.InventoryOpUtilsController.probedetails, function(key,vals)  
                    {
                        if(OPMClient.InventoryOpUtilsController.selectedprobeid == vals.probeID){
                            OPMClient.InventoryOpUtilsController.selectedprobeName=vals.probeName;
                        }
                    });
                }
            }
        }
        var totalPorts = jsonData1.result.length;
        if(totalPorts != 0){
            $('#switchsnapshot').show();
            var onesetOfPortsRows = "";
            var numberOfSetOfPorts = 0;
            var addRows = "";
            var allPorts = "";
            var setofport16 = 1;
            var ifNameFontCss = "";
            var portgroupcount = parseInt(jsonData1.PortGroupCount);
            for (i = 1; i <= totalPorts; i++) {
                var portDetails = jsonData1.result[i - 1];
                var portstatus = portDetails['operational-status-int'];//NO I18N
                var portnumber = portDetails["connected-switch-port"];//NO I18N 
                var portstatusStr = portDetails["operational-status"];//NO I18N 
                var ifindex = portDetails["connected-port-ifindex"];//NO I18N 
                var switchname = portDetails["switch-name"];//NO I18N 
                var ifname = portDetails["connected-port-ifname"];//NO I18N
                var viewnameonport = portDetails.spviewname;
                ifNameFontCss = portDetails.spviewnamestyle;
                // var tooltip = "<b>" + Ember.I18n.t("webclient.topo.details.tabs.port", this) + " </b>&nbsp;: " + portnumber + "<br><b>" + Ember.I18n.t("webclient.topo.status", this) + " </b>&nbsp;: " + portstatusStr + "<br><b>" + Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this) + "</b>&nbsp;: " + portDetails['connected-mac'] + "<br><b>" + Ember.I18n.t("webclient.topo.addnoderesult.ipaddress", this) + "</b>&nbsp;: " + portDetails['connected-ip'] + "<br><b>" + Ember.I18n.t("webclient.vimonitor.devices.snapshot.dnsname", this) + "</b>&nbsp;: " + portDetails['connected-dns'];//NO I18N
                var macaddr = portDetails['connected-mac'];//NO I18N
                if(macaddr !==""){
                    macaddr = macaddr.split(",");
                    if(macaddr.length >2){
                        macaddr = macaddr[0]+", "+macaddr[1]+", ....";//NO I18N 
                    }
                }else{
                    macaddr =" - ";
                }
                var ipaddres = portDetails["connected-ip"];//NO I18N
                if(ipaddres !==""){
                    ipaddres = ipaddres.split(",");
                    if(ipaddres.length >2){
                        ipaddres = ipaddres[0]+", "+ipaddres[1]+", ....";//NO I18N 
                    }
                }else{
                    ipaddres =" - ";
                }
                var tooltip = '{"'+Ember.I18n.t("webclient.topo.details.tabs.port", this)+'":"'+portnumber+'","'+Ember.I18n.t("opu.views.IFINDEX", this)+'":"'+ifindex+'","'+Ember.I18n.t("opu.views.IFNAME", this)+'":"'+ifname+'","'+Ember.I18n.t("webclient.topo.status", this)+'":"'+portstatusStr+'","'+Ember.I18n.t("webclient.vimonitor.snapshot.macaddress", this)+'":"'+macaddr+'","'+Ember.I18n.t("webclient.admin.appmanager.serverip", this)+'":"'+ipaddres+'"}';//No I18N

                if(i % 2 == 0) {
                    onesetOfPortsRows += "<div class='spmswitchColumn'>" + addRows + getSwitchPortSnapshot(portstatus, portnumber, tooltip,switchname,ifindex,viewnameonport) + "</div>";//NO I18N
                    addRows = "";
                } else {
                    addRows = getSwitchPortSnapshot(portstatus, portnumber, tooltip,switchname,ifindex,viewnameonport);
                }
                if (setofport16 === portgroupcount) {
                    allPorts += "<div class='spmswitchRow "+ifNameFontCss+"'>" + onesetOfPortsRows + "</div>";//NO I18N
                    setofport16 = 0;
                    onesetOfPortsRows = "";
                    numberOfSetOfPorts++;
                }
                setofport16++;
            }
            //if have one port or total port count is oddnumber...
            if (addRows !== "") {
                addRows += "<div></div>";//NO I18N
                onesetOfPortsRows += "<div class='spmswitchColumn'>" + addRows + "</div>";//NO I18N
            }
            if (setofport16 > 1) {
                allPorts += "<div class='spmswitchRow "+ifNameFontCss+"'>" + onesetOfPortsRows + "</div>";//NO I18N
            }
            if (totalPorts <= 64) {//enble scorell if more then two rows...
                $("#switchsnapshotContainer").css("overflow", "hidden");//NO I18N
            }
            $("#switchsnapshotresult").html(allPorts);//NO I18N
            opm_customTooltip();
        }
    }
}

function showHideOpUtilsAddDiv(id){
    if(id === "addbyManualDiv"){
        $("#addbyManualDiv").show();
        $("#addbyImportDiv").hide();
        $("#addSubnetByManual").show();
        $("#addSubnetByImport").hide();
        $("#subnetImport").hide();
    }else{
        $("#addbyImportDiv").show();
        $("#addbyManualDiv").hide();
        $("#addSubnetByImport").show();
        $("#subnetImport").show();
        $("#addSubnetByManual").hide();
    }
}
function showHideTrapReceiveAddDiv(id){
    if(id === "trapWithCommunityDiv"){
        OPMClient.SettingsTabController.set("withorwithoutcredential","with");//No I18N
        $("#trapWithCommunityDiv").show();
        $("#trapWithoutCommunityDiv").hide();
    }else{
        OPMClient.SettingsTabController.set("withorwithoutcredential","without");//No I18N
        $("#trapWithoutCommunityDiv").show();
        $("#trapWithCommunityDiv").hide();
    }
}
function startOrStop(){
    var runState = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/tools/getTrapReceiverStatus");//No I18N
    OPMClient.SettingsOpUtilConfigController.portnum=runState.result.trapPort;
    if(runState.result.isTrapReceiverRunning){
        OPMClient.SettingsTabController.set("startorstoptrap","Stop");//No I18N
        $("#portnum").attr('disabled',true);
        $("#credentialName").attr('disabled',true);
        $("#trapstop").show();
        $("#trapstart").hide();
        if(runState.result.listeningCredential===""||runState.result.listeningCredential===null){
        OPMClient.SettingsOpUtilConfigController.opuRouterNewAddCred='1';
        }else{
	    OPMClient.SettingsOpUtilConfigController.opuRouterNewAddCred=runState.result.listeningCredential;
	}
    }else{
        OPMClient.SettingsTabController.set("startorstoptrap","Start");//No I18N
        $("#portnum").attr('disabled',false);
        $("#trapstop").hide();
        $("#trapstart").show();
    }
}
function runningOrStopped(){
    var runState = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/tools/getTrapReceiverStatus");//No I18N
    if(runState.result.isTrapReceiverRunning){
        OPMClient.SettingsOpUtilConfigController.portnum=''+runState.result.trapPort;
        $("#Trp_running").show();
        $("#Trp_stopped").hide();
    }else{
        $("#Trp_running").hide();
        $("#Trp_stopped").show();
    }
}
function showHideOpUtilsAddSwitchDiv(id){
    if(id === "addbyManualDiv"){
        $("#oputilsaddmanual").show();
        $("#oputilsadddiscover").hide();
        $("#oputilsaddswitchcsv").hide();
        $("#spmaddmanualbtn").show();
        $("#spmdiscoverbtn").hide();
        $("#spmimportbtn").hide();
        $("#oputilsscandetails").show();
        $("#spmTaskNameDiv").show();
        checkOputilsLiscenceAddSwitch();

    }else if(id==="addbyCsvDiv"){//No I18N
        $("#oputilsaddmanual").hide();
        $("#oputilsadddiscover").hide();
        $("#oputilsaddswitchcsv").show();
        $("#spmimportbtn").show();
        $("#spmdiscoverbtn").hide();
        $("#spmaddmanualbtn").hide();
        $("#oputilsscandetails").hide();
        $("#spmTaskNameDiv").hide();
        checkOputilsLiscenceAddSwitch();
    }
    else{
        $("#oputilsaddmanual").hide();
        $("#oputilsadddiscover").show();
        $("#oputilsaddswitchcsv").hide();
        $("#spmdiscoverbtn").show();
        $("#spmimportbtn").hide();
        $("#spmaddmanualbtn").hide();
        $("#oputilsscandetails").hide();
        $("#spmTaskNameDiv").hide();
        $("#netmask").parent().parent().hide();
        checkOputilsLiscenceAddSwitch();
    }
}

function showHideInputDiv(thisDiv){
    
    $("input[name='"+$(thisDiv).attr('name')+"']").each(function(i,val){
       $("#"+$(val).attr('data-div')).hide();
    });
    $("#"+$(thisDiv).attr('data-div')).show();
}
function showRouterImportCSVInfo(){
    window.open("https://www.manageengine.com/products/oputils/help/network/switch_port_mapper_tool.html#Importing-Router-Inputs-from-a-CSV-File");
}

function getEmberSelectedRows(jqgridid,colName)
{
    if(colName !== undefined && colName !== ""){
    var arr = new Array();
    var grid = jQuery("#"+jqgridid);    //No I18N
    var selRowIds = grid.jqGrid('getGridParam','selarrrow');    //No I18N
    if(selRowIds !== undefined){
        $.each(selRowIds, function(){
            var id = grid.jqGrid('getCell', this, colName); //No I18N
            arr.push(id);
        });
    }
    if(arr.length > 0){
           return arr.toString();
        }
    }
    return "";
}

function getEmberSelectedRowsWithCondition(jqgridid,colName,conditionColName,conditionValue)
{
    if(colName !== undefined && colName !== ""){
    var arr = new Array();
    var grid = jQuery("#"+jqgridid);    //No I18N
    var selRowIds = grid.jqGrid('getGridParam','selarrrow');    //No I18N
    if(selRowIds !== undefined){
        $.each(selRowIds, function(){
            var conditionCellValue = grid.jqGrid('getCell', this, conditionColName); //No I18N
            if(conditionCellValue === conditionValue){
                var id = grid.jqGrid('getCell', this, colName); //No I18N
                arr.push(id);
            }
        });
    }
    if(arr.length > 0){
           return arr.toString();
        }
    }
    return "";
}

function showOpUtilsResponse(response,functionName,params,transitionURL,successMsg){
    if(response !== undefined && !$.isEmptyObject(response) && response !== ""){
        var jsonObj = response;
        try{
            jsonObj = $.parseJSON(response);
        }catch (e) {
            jsonObj = response;
        }
        if(jsonObj.status === "Failure"){//No I18N
            opm_infoMsgs('errorMsg',jsonObj.message);//No I18N
        }
        else if(jsonObj.error){
            opm_infoMsgs('errorMsg',jsonObj.error.message);//No I18N
        }
        else if(jsonObj.status === "Success"){
            if(successMsg === undefined || successMsg === "" || successMsg === null){
                successMsg = Ember.I18n.t("opu.common.SUCCESSFULLY_ADDED",this);//No I18N
            }
            var options = {};
            options.callback_func = function(){
                if(transitionURL !== undefined && transitionURL !== null && transitionURL !== ""){
                   opm_transitionToParentRoute(transitionURL);
                   slideOut(1);
                }
                if(params !== undefined && params !== "" && params !== null){
                    window[functionName](params);
                }else if(functionName !== undefined && functionName !== "" && functionName !== null){
                    window[functionName]();
                }
        }
            opm_infoMsgs('successMsg',successMsg,options);//No I18N
            
        }
    }
}
function opu_smallSlideHandler(response,message){
    if(message === undefined){
        message = Ember.I18n.t('webclient.admin.dbmanagement.updated',this);//No I18N
    }
    if(response !== undefined && !$.isEmptyObject(response) && response !== ""){//No I18N
        var jsonObj = response;//$.parseJSON(response);
        if(jsonObj.status === "Failure"){//No I18N
            opm_infoMsgs('errorMsg',jsonObj.message);//No I18N
        }else if(jsonObj.status === "Success"){//No I18N
            var options = {};
            options.callback_func = function(){
                slideOut(5);
            }
            opm_infoMsgs("successMsg",message,options);//No I18N
        }
    }
}
function showImportCSVInfo(url){
    window.open(url, '_blank');
}
function changeIPAMStatusSnapshotPage(obj){
    var comboid=obj.id;
    var markas =obj.value;
    if(markas === "0"){//Rogue  mark as guest
        return;
    }
    var selectedRows = getEmberSelectedRows("opm_DeviceSnapList"+comboid, "resource-id");//No I18N

    if(selectedRows === undefined || selectedRows === ""){
        alert(Ember.I18n.t('opu.view.AT_LEAST_ONE_IP', this)); //No I18N
        $('#'+comboid).val('0').change();
        return;
    }
    OPMClient.InventoryOpUtilsController.resourceidlist=selectedRows;
    if(markas ==="Guest"){

        redirectSnapShot('MarkAsGuest');//No I18N
        $('#'+comboid).val('0').change();////No I18N 
        // changed to "select action" option in combo box
        return;
    }
    var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ipam/updateIPState', {"markAs":markas,"RESOURCEID":selectedRows});//No I18N
    if (rsp !== undefined) {
        

        if(rsp.status === "Failure"){
            opm_infoMsgs('errorMsg',rsp.message);//No I18N
        }else{
            reloadSnapWidgets(1)
            opm_infoMsgs('successMsg',Ember.I18n.t("webclient.devices.details.updatesuccess",this));//No I18N
        }
        $('#'+comboid).val('0').change();//No I18N
        // changed to "select action" option in combo box
    }
}
function showOpUtilsIPTroubleshootPage(viewpage,tool){
    if(viewpage =="IPSnapShot"){
        location.href = "#/Inventory/Snapshot/IPAMIP/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryDeviceDetailsController.selDevice;//NO I18N
    }
}
function showHideHostField(div,portchg)
{
    
    if ($("#"+div).css('display') === "block") {
        $("#new"+div).css('display', 'block');
        $("#"+div).css('display', 'none');
        $("#newhost").focus();
    } else {
        $("#new"+div).css('display', 'none');
        $("#"+div).css('display', 'block');
       portchg = false;
    }

    if(portchg && div == "cmStr"){
        $("#snmpPort").val('161');
    }
    else if(!portchg && div == "cmStr") //No I18N
    {
        $("#commu").trigger('change');
    }
}

function trapViewerAddCredentail() {
    OPMClient.SettingsMibController.set('isAddCredentialFrmMIB',true);//No I18N
    if(window.OPM.currentView.name.indexOf('Alarms.Alarm.Trap')!==-1) {
        settingsGlobalRoute.transitionTo('Alarms.Alarm.Trap.TrapViewer.AddCredential');//No I18N
    } else {
        settingsGlobalRoute.transitionTo('Settings.Tools.TrapViewer.AddCredential');//No I18N
    }
    Ember.run.schedule('afterRender', function() {//No I18N
        $(".addCredentialBrickNav").hide();
        $(".credentials").show();
        $("#snmp3").show();
        OPMClient.SettingsAddEditController.set("selectedCredential","snmp3");//No I18N
    });
}

function showCrdSelBoxOnEsc(e){
    if(e.keyCode == "27"){
        showHideHostField("cmStr",true);//No I18N
        $("#commu").trigger('change');
    }
}
function showHostSelectionOnEsc(e){
    if(e.keyCode == "27"){
        showHideHostField("hostDiv",false);//No I18N
        $("#spmHostName").trigger('change');
    }
}
function bwmDeleteAction(cellValue, options, rowdata, action){
    return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' onclick='deleteBWMonitor(&#39;"+rowdata.interfaceid+"&#39;)'></i>"; //No I18n
}
function deleteBWMonitor(intfId)
{
    if(confirm(Ember.I18n.t('webclient.delete.confirmation',this))){//No I18N
        var paramsdata = {'ID':intfId}; //No I18N
        var calb = function(response){
        oputilsInventoryReload("BWM");//No I18N
        if(response.status === "Success"){
                opm_infoMsgs("successMsg",Ember.I18n.t('opu.bwm.intfdeletesuccessmsg',this));//No I18N    
            }else if(response.status === "Failure"){//NO I18N
                opm_infoMsgs("errorMsg",response.message);//No I18N
            }
            $('#opm_Devices,.opmInventoryHolder').removeClass('AETIDRowChecked');
        };
        var rsp = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/bwm/deleteInterfaces', paramsdata,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
    }
}
function resetNWMButtons(){
    $("#OpUtilsPing").css("display","none");
    $(".oputilsPingTimeIntIcon").show();
    $("#oputilsaddbutton").show();
    $("#ipamSreachIcon").show();
    $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
}
function opu_IfStatusColor(cellvalue, options, rowObject)
{
    if(rowObject.ifStatusInt== '1')
    {
        return "<div class='deviceLegendIndex' style='background-color:#46bb7d;' data-val="+cellvalue+">"+cellvalue+"</div>"; //No I18N
    }
    else
    {
        return "<div class='deviceLegendIndex' style='background-color:#fa5b5a' data-val="+cellvalue+">"+cellvalue+"</div>"; //No I18N
    }
}
function opu_BwmSeverityColorBar(cellValue, options, rowdata, action)
{
    var status = rowdata.ifStatusInt;
    if(status == "1"){
       var str =  "<i class='severity_5 statusColor'></i>";//No I18N
    }else{
       var str =  "<i class='severity_1 statusColor'></i>";//No I18N
    }
    return str;
}
function opu_BwmSeverityColorIcon(cellValue, options, rowdata, action){
    var status = rowdata.ifStatusInt;
    if(status == "1"){
       return "<i class='icon-status5'></i> "+rowdata.ifstatus;//No I18N
    }else{
       return "<i class='icon-status1'></i> "+rowdata.ifstatus;//No I18N
    }
}
function oputilsNWMAlertStatusIcon(cellValue, options, rowdata, action)
{
    var classColor = "icon-status1";//No I18N
    var text = Ember.I18n.t('webclient.admin.threshold.Critical',this);//No I18N
    if(cellValue === 2 || cellValue === "2"){
        classColor = "icon-status3";//NO I18N
        text = Ember.I18n.t('jsp.compliance.AddCompRule.Warning',this);//No I18N
    }else if(cellValue === 3 || cellValue === "3"){
        classColor = "icon-status5";//NO I18N
        text = Ember.I18n.t('opu.common.HEALTHY',this);//No I18N
    }
    return "<i class='"+classColor+"' title='"+text+"'></i>"+text;//No I18N 
}
function oputilsNWMAlertMsgIcon(cellValue, options, rowdata, action)
{
    var val =rowdata["severity-int"];//No I18N
    if(val === 1 || val === "1"){
        return "<i class='warningInfoMsgDiv-red' title='"+cellValue+"'>"+cellValue+"</i>";//No I18N 
    }else{
        return cellValue;
    }
}
function SystemDetailsUpdateRevAjax(prop)
{
    if(prop ==="refreshPage"){
        getSystemDetailsUpdateList();
    }
}
function oputilsIPTools(cellValue, options, rowdata, action){
    if(cellValue!=""){
        return " <i class='cursorPointer' title='"+cellValue+"'>"+cellValue+"</i><i title='"+cellValue+"' data-ip='"+cellValue+"' class='cursorPointer icon-right-dir oputilsippingicon'></i>";//No I18N
    }
    else{
        return cellValue;
    }
}
function ipRequestPreview(cellValue, options, rowdata, action){
    if(cellValue!=""){
        return " <i class='cursorPointer' onclick='getIPPreview(&#39;"+rowdata['request-id']+"&#39);' title='"+cellValue+"'>"+cellValue+"</i><i title='"+cellValue+"' data-ip='"+cellValue+"' class='cursorPointer'></i>";//No I18N
    }
    else{
        return cellValue;
    }
}
function dhcpScanStatus(cellValue, options, rowdata, action){
    var status = rowdata['scan-status-int'];//No I18N
    var serverType = rowdata['server-type-int'];//No I18N
    var remarks = rowdata['remarks']; //No I18N
    var dhcpServer = rowdata['dhcp-server-address'];//NO I18N
    if(status === "3"){
        OPMClient.SettingsOpUtilConfigController.set('uniqueID',rowdata['ad-domain-id']);//No I18N
        OPMClient.InventoryOpUtilsController.set("fromSnapshotToSettings",true); //No I18N
        var title = Ember.I18n.t('webclient.credential.failurereasons',this)+'<i class="icon-remove"></i>'; //No I18N
        var reason1 =Ember.I18n.t('opu.DHCP.Failure_Reasons', {param0:'AD'},this)+' <a  href="#/Settings/OpUtils/Discovery/AD/Edit" style="color:#0099ff">'+Ember.I18n.t("opu.views.EDIT_DOMAIN_DETAILS",this)+'</a>'; //No I18N
        remarks=Ember.I18n.t('ipsla.failed',true)//No I18N
        if(serverType==1){
            var reason1 =Ember.I18n.t('opu.DHCP.Failure_Reasons', {param0:'AD'},this)+' <a  href="#/Settings/OpUtils/Discovery/AD/Edit" style="color:#0099ff">'+Ember.I18n.t("opu.views.EDIT_DOMAIN_DETAILS",this)+'</a>'; //No I18N
            var info = "<a class='hasHelpCard hasHelpCard2 type2 oputils' tabindex='0' onclick='helpcard2Click(this)' data-title='"+title+ "'data-content1='"+reason1+"'></a>";//No I18N
            return "<div id='scanStatusDHCP' onmouseover='dhcpHoverMenu(\""+remarks+"\");' class='hideTooltip textLink DHCPstatusIcon' data-title='"+ title+ "'data-content1='"+reason1+"'><i class='icon-status1'></i>"+Ember.I18n.t('ipsla.failed',true) + info +"</div>";//No I18N
        }else{
            return "<div class='DHCPstatusIcon' id='scanStatusDHCP'onmouseover='dhcpHoverMenu(\""+remarks+"\");'><i class='icon-status1'></i>"+Ember.I18n.t('ipsla.failed',true)+"</div>";
        }
    }else if(status === "1"){
        remarks=Ember.I18n.t('opu.common.IN_PROGRESS',true)//No I18N
        return '<div class="DHCPstatusIcon DHCPstatusInProgress" id="scanStatusDHCP" onmouseover="dhcpHoverMenu(\''+remarks+'\');"><div class="opmLoading-circle"><div class="opmLoading-circle1 opmLoading-circle"></div> <div class="opmLoading-circle2 opmLoading-circle"></div> <div class="opmLoading-circle3 opmLoading-circle"></div> <div class="opmLoading-circle4 opmLoading-circle"></div> <div class="opmLoading-circle5 opmLoading-circle"></div> <div class="opmLoading-circle6 opmLoading-circle"></div> <div class="opmLoading-circle7 opmLoading-circle"></div> <div class="opmLoading-circle8 opmLoading-circle"></div> <div class="opmLoading-circle9 opmLoading-circle"></div> <div class="opmLoading-circle10 opmLoading-circle"></div> <div class="opmLoading-circle11 opmLoading-circle"></div> <div class="opmLoading-circle12 opmLoading-circle"></div></div>'+Ember.I18n.t('opu.common.IN_PROGRESS',true)+'</div>';//No I18N
    }else if(status === "2"){
        remarks=Ember.I18n.t('opu.common.SCANNED',true);//No I18N
        return "<div class='DHCPstatusIcon' id='scanStatusDHCP' onmouseover='dhcpHoverMenu(\""+remarks+"\");'><i class='icon-status5'></i> "+Ember.I18n.t('opu.common.SCANNED',true)+"</div>";//No I18N
    }else if(status === "4"){
        remarks=Ember.I18n.t('opu.common.WAITING_QUE',true);//No I18N
        return '<div class="DHCPstatusIcon" id="scanStatusDHCP" onmouseover="dhcpHoverMenu(\"'+remarks+'\");"><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em>'+Ember.I18n.t('opu.common.WAITING_QUE',true)+'</div>';//No I18N
    }else if(status === "5"){
        remarks = Ember.I18n.t('opu.common.Apply_Credentials',true)//No I18N
        return '<div class="DHCPstatusIcon" id="scanStatusDHCP" onmouseover="dhcpHoverMenu(\''+remarks+'\');">'+"<a style='color:#0099ff' onclick='associateCredential(\""+dhcpServer+"\")'>"+Ember.I18n.t('opu.common.Apply_Credentials',true)+"</a>"+'</div>';//No I18N
    }
}
function dnsScanStatus(cellValue, options, rowdata, action) {
    var status = rowdata['ScanStatus']; // No I18N
    var dnsServer = rowdata['DNSServerAddress']; // No I18N
    var remarks = ""; // No I18N

    if (status === "3") {
        remarks = Ember.I18n.t('ipsla.failed', true); // No I18N
        return '<div class="DNSstatusIcon success"><i class="icon-status1"></i>' + remarks + '</div>'; // No I18N
    } else if (status === "1") {
        remarks = Ember.I18n.t('opu.common.IN_PROGRESS', true); // No I18N
        return  '<div class="DHCPstatusIcon DHCPstatusInProgress" id="scanStatusDHCP" onmouseover="dhcpHoverMenu(\''+remarks+'\');"><div class="opmLoading-circle"><div class="opmLoading-circle1 opmLoading-circle"></div> <div class="opmLoading-circle2 opmLoading-circle"></div> <div class="opmLoading-circle3 opmLoading-circle"></div> <div class="opmLoading-circle4 opmLoading-circle"></div> <div class="opmLoading-circle5 opmLoading-circle"></div> <div class="opmLoading-circle6 opmLoading-circle"></div> <div class="opmLoading-circle7 opmLoading-circle"></div> <div class="opmLoading-circle8 opmLoading-circle"></div> <div class="opmLoading-circle9 opmLoading-circle"></div> <div class="opmLoading-circle10 opmLoading-circle"></div> <div class="opmLoading-circle11 opmLoading-circle"></div> <div class="opmLoading-circle12 opmLoading-circle"></div></div>'+Ember.I18n.t('opu.common.IN_PROGRESS',true)+'</div>';//No I18N
    } else if (status === "2") {
        remarks = Ember.I18n.t('opu.common.SCANNED', true); // No I18N
        return '<div class="DNSstatusIcon scanned"><i class="icon-status5"></i> ' + remarks + '</div>'; // No I18N
    } else if (status === "4") {
        remarks = Ember.I18n.t('opu.common.WAITING_QUE', true); // No I18N
        return '<div class="DNSstatusIcon waiting"><em class="waiting svgIcon size16">' +
            '<svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em>' +
            remarks + '</div>'; // No I18N
    } else if (status === "5") {
        remarks = Ember.I18n.t('opu.common.Apply_Credentials', true); // No I18N
        return '<div class="DNSstatusIcon applyCredentials">' +
            "<a style='color:#0099ff' onclick='associateCredential(\"" + dnsServer + "\")'>" +
            remarks + '</a></div>'; // No I18N
    }
}
function dhcpHoverMenu(val){
    var id = 'scanStatusDHCP'; //No I18N
    $('[id="'+id+'"]').attr('title', val);
}
function oputilsIPToolsBWM(cellValue, options, rowdata, action){
    return " <i class='cursorPointer' title='"+cellValue+"'>"+cellValue+"</i><i title='"+cellValue+"' data-ip='"+cellValue+"' class='cursorPointer icon-right-dir oputilsippingicon ips'></i>";//No I18N
}
function opUtilsIPToolTipIPs(){
    $('.oputilsippingicon.ips').off('click');
    $('.oputilsippingicon.ips').click(function(){
        OPMClient.InventoryOpUtilsController.pingtooltipip = $(this).attr("data-ip");
        Pos=$(this).offset();
        PosY=Pos.top+10;
        PosX=(Pos.left)+10;
        opUtilsTotalHt=PosY+200;
        if(wHt>opUtilsTotalHt){
            $('.oputilsIPTools.ips').css({top:PosY,left:PosX,display:'block'});
        }else{
            $('.oputilsIPTools.ips').css({top:PosY-205,left:PosX,display:'block'});
        }
        oputilsCloseIPToolTipOnBodyClick();
    });
}
function opUtilsIPToolTip(){
    $('.oputilsippingicon').off('click');
    $('.oputilsippingicon').click(function(){
        OPMClient.InventoryOpUtilsController.pingtooltipip = $(this).attr("data-ip");
        Pos=$(this).offset();
        PosY=Pos.top+10;
        PosX=(Pos.left)+10;
        opUtilsTotalHt=PosY+200;
        if(wHt>opUtilsTotalHt){
            $('.oputilsIPTools').css({top:PosY,left:PosX,display:'block'});
        }else{
            $('.oputilsIPTools').css({top:PosY-205,left:PosX,display:'block'});
        }
        oputilsCloseIPToolTipOnBodyClick();
    });
}

function getOpUtilsToolsResult(tool,obj)
{
    $(".oputilsIPTools").hide();
    if(OPMClient.InventoryOpUtilsController.IPRelatedToolActionPage === "MACIPTools"){//No I18N
        location.href=window.OPM.apiclientUrl+"Settings/Tools/Address/MACIP/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryOpUtilsController.IPRelatedToolActionPage === "CFM"){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/List/OpUtils/CFM/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryOpUtilsController.IPRelatedToolActionPage === "BWM"){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/List/OpUtils/BWM/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.subFilterType === "IPs"){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/List/OpUtils/IPs/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.subFilterType === "Rogue"){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/List/OpUtils/Rogue/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSubnet" && OPMClient.InventoryDeviceDetailsController.selDevice!==undefined){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMSubnet/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSubnetGroupSummary" && OPMClient.InventoryDeviceDetailsController.selDevice!==undefined){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMSubnetGroupSummary/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "DHCPSummary" && OPMClient.InventoryDeviceDetailsController.selDevice!==undefined){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/DHCPSummary/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "DNSSummary" && OPMClient.InventoryDeviceDetailsController.selDevice!==undefined){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/DNSSummary/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }
    else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMDHCP" && OPMClient.InventoryDeviceDetailsController.selDevice!==undefined){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMDHCP/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMIP" && OPMClient.InventoryDeviceDetailsController.selDevice!==undefined){//No I18N
        location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMIP/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+tool+"/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
    }
}

function oputilsCloseIPToolTipOnBodyClick()
{
    $('body').click(function(e){
        var opuClass = e.target.className;
        if(typeof opuClass === "string"){
            if(opuClass.indexOf("oputilsippingicon") === -1 &&  $('.oputilsIPTools').css("display") === "block"){
                $('.oputilsIPTools').hide();    
            }
        }
		if(opuClass.indexOf('expOption') == -1 && $('#opuMACIPExp').hasClass('active') ) {
            $('#opuMACIPExp').removeClass('active').parent().find('ul').css({display:'none',opacity:'0',top:'0'});//No I18N
        }
    });
	
}

function redrictToPortActions(selectedAction,id){
    var numberOfPortsSelected = $("#opm_DeviceSnapList"+id).jqGrid("getGridParam", "selrow");
    if(numberOfPortsSelected){
        var widgetId = "opm_DeviceSnapList"+id;//No I18N
        if(selectedAction==="1"){
            OPMClient.Inventory.oputilsDisableEnablePortAdminStatus('disable');//No I18N
        }else if(selectedAction==="2"){
            OPMClient.Inventory.oputilsDisableEnablePortAdminStatus('enable');//No I18N
        }else if(selectedAction==="3"){
            OPMClient.Inventory.oputilsChangeSPMPortIfAlias(widgetId);
        }else if(selectedAction==="4"){
            OPMClient.Inventory.oputilsExcludeIncludePorts('excludePort',widgetId);//No I18N
        }else if(selectedAction==="5"){
            OPMClient.Inventory.oputilsExcludeIncludePorts('includePort',widgetId);//No I18N
        }else{
            return;
        }
    }else if(selectedAction===""){
        return;
    }
    else{
        opm_infoMsgs('errorMsg',Ember.I18n.t("opu.ports.PLEASE_SELECT_PORTS",this));//No I18N
    }
    var portActionsId = "#param_"+id+"_portActions";//No I18N
    $(portActionsId).val("");
    $(portActionsId).change();
}

function opuBwmMonitorAlertState(cellValue, options, rowdata, action)
{
    return "<i class='icon-status"+rowdata.alerttypeint+"'></i> "+rowdata.alerttype;//No I18N
}
/*function opuBwmDataInVal(cellValue, options, rowdata, action){
    return "<span title='"+rowdata.inDoubleValue+"'>"+cellValue+"</span>";// NO I18N
}
function opuBwmDataOutVal(cellValue, options, rowdata, action){
    return "<span title='"+rowdata.outDoubleValue+"'>"+cellValue+"</span>";// NO I18N
}*/

function opuBwmEditImg(cellValue, options, rowdata, action){
  return "<div onmouseover='$(&#39;#edit_"+rowdata.interfaceid+"&#39;).show();' onmouseout='$(&#39;#edit_"+rowdata.interfaceid+"&#39;).hide();' title='"+cellValue+"'><span>"+escapeHTML(cellValue)+"</span><span style='display:none;' class='icon-configedit' id='edit_"+rowdata.interfaceid+"'></span></div>"; //No I18N
}

function opuBwmEditIfSpeed(cellValue, options, rowdata, action){
    return "<div onmouseover='$(&#39;#edit_"+rowdata.interfaceid+"&#39;).show();' onmouseout='$(&#39;#edit_"+rowdata.interfaceid+"&#39;).hide();' title='"+cellValue+"'><span id='ifSpeed_Existing_"+rowdata.interfaceid+"'>"+cellValue+"</span><input id='ifSpeed_New_"+rowdata.interfaceid+"' class='opuEditBox' type='text' style='display:none;' value='"+rowdata.ifSpeedInt+"'><i style='display:none;' title='"+Ember.I18n.t('webclient.title.edit',this)+"' class='icon-configedit pointer' onclick='editifSpeed(&#39;"+rowdata.interfaceid+"&#39;)' id='edit_"+rowdata.interfaceid+"'></i></div>"; //No I18N
}
function deleteLoggedOnUser(cellValue, options, rowdata, action){
   return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'  onclick='deleteADUserdetails(&#39;"+rowdata['owner-id']+"&#39;)'></i>"
}
function deleteFQDN(cellValue, options, rowdata, action){
   return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'  onclick='deleteFQDNIP(&#39;"+rowdata['ipAddress']+"&#39;)'></i>"
}
function deleteFQDNZoneTransfer(cellValue, options, rowdata, action){
   return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'  onclick='deleteFQDNIPZoneTransfer(&#39;"+rowdata['ipAddress']+"&#39;)'></i>"
}
function deleteFqdnNotifyTransfer(cellValue, options, rowdata, action){
   return "<i class='icon-trash delete' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'  onclick='deleteNotifyZoneTransfer(&#39;"+rowdata['ipAddress']+"&#39;)'></i>"
}
function opuLoggedOnUserData(cellValue, options, rowdata, action){
	var val=cellValue;
    var getCellId = 'loggedOnUser_'+rowdata["ip-address"];//No I18N
	return "<a class='hasHelpCard hasHelpCard6 noBeforeAfter overflow-visible' tabindex='0' id='"+getCellId+"' onmouseover=showLoggedOnUserData('"+rowdata["ip-address"]+"')>"+val+"</a>";//No I18N
}
function showLoggedOnUserData(val){
	var ipAddress = val;
	var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getLoggedOnADUserDetails?ipAddress='+ipAddress);//NO I18N
	var adUserFetchData = {Email: response['email-id'] , Phone: response['phone-number'], Designation: response['designation'], Location: response['location']};//No I18N
	OPMClient.SettingsOpUtilConfigController.set('loggedOnUserDetailsOnHover',adUserFetchData);//No I18N
	if (response.status === "Success") {
			var id = 'loggedOnUser_'+val;//No I18N
			var data = Ember.I18n.t('fwa.compliance.Email',this)+ " : " + response['email-id'] + "\n" + Ember.I18n.t('webclient.admin.adduser.phone',this)+" : " + response['phone-number'] + "\n" + Ember.I18n.t('webclient.enduser.Designation',this)+" : " + response['designation'] + "\n" + Ember.I18n.t('webclient.enduser.Location',this)+" : " + response['location'];//No I18N
			$('[id="'+id+'"]').attr('title', data);
    }
	
}
function validateExpiryLimit(limit,time) {
	var $input = $('#' + limit);
    var unit = $('#' + time).val();
	var inputVal = $input.val().replace(/\D/g, '');
	var maxValues = {
        'Days': 49710,//No I18N
        'Hours': 1193046,//No I18N
        'Minutes': 71582778,//No I18N
        'Seconds': 2147483647//No I18N
    };

    var max = maxValues[unit] || 60;
    var maxLength = max.toString().length;

    // Prevent typing more digits than max allows
    if (inputVal.length > maxLength) {
        inputVal = inputVal.slice(0, maxLength);
    }

    var value = parseInt(inputVal, 10);
    if (isNaN(value)) {
        $input.val('');
        return;
    }

    if (value > max && inputVal.length >= maxLength) {
        $input.val(max);
    } else if(value != 0) {
        if (unit === 'Seconds') {//NO I18N
            if (value % 86400 === 0) {
                value = value / 86400;
                unit = 'Days';//NO I18N
            } else if (value % 3600 === 0) {
                value = value / 3600;
                unit = 'Hours';//NO I18N
            } else if (value % 60 === 0) {
                value = value / 60;
                unit = 'Minutes';//NO I18N
            }
        } else if (unit === 'Minutes') {//NO I18N
            if (value % 1440 === 0) {           // perfect days
                value = value / 1440;
                unit = 'Days';//NO I18N
            } else if (value % 60 === 0) {      // perfect hours
                value = value / 60;
                unit = 'Hours';//NO I18N
            }
        } else if (unit === 'Hours') {//NO I18N
            if (value % 24 === 0) {             // perfect days
                value = value / 24;
                unit = 'Days';//NO I18N
            }
        }
        $input.val(value);
        $('#' + time).val(unit).trigger('change');
    }
}


function validateMinutes(input) {
    var max = 60;
    var maxLength = max.toString().length;
	var valueStr = input.value.replace(/\D/g, '');

    if (valueStr.length > maxLength) {
        valueStr = valueStr.slice(0, maxLength);
    }

    var value = parseInt(valueStr, 10);
	if (isNaN(valueStr) || valueStr === '') {
        input.value = '';
        return;
    }
	
	if (value > max && valueStr.length >= maxLength) {
        input.value = max;
    } else {
        input.value = valueStr;
    }
}
function validateHours(input) {
	var max = 24;
    var maxLength = max.toString().length;
	var valueStr = input.value.replace(/\D/g, '');

    if (valueStr.length > maxLength) {
        valueStr = valueStr.slice(0, maxLength);
    }

    var value = parseInt(valueStr, 10);

    if (isNaN(valueStr) || valueStr === '') {
        input.value = '';
        return;
    }

	if (value > max && valueStr.length >= maxLength) {
        input.value = max;
    } else {
        input.value = valueStr;
    }
}
function ADUserFetchScanStatusRevAjax(prop){
    if(prop ==="refreshPage"){
       listOwnerDetails();
    }
}
function DeleteStatusRevAjax(prop){
    if(prop ==="refreshPage"){
       listOwnerDetails();
    }
}
function DeleteAllStatusRevAjax(prop){
    if(prop ==="refreshPage"){
       listOwnerDetails();
    }
}
function deleteAllADUserDetails(){
    var url = window.OPM.apiUrlPattern + "/ipam/deleteAllADUserDetails";//NO I18N
    if(confirm(Ember.I18n.t('webclient.js.confirmdelete',this))){
        var calb = function(rsp){
            if (rsp.status === "Success") {
                opm_infoMsgs("successMsg",Ember.I18n.t('webclient.ncm.discovery.deleteMsg',this));//No I18N
            }else{
               opm_infoMsgs("errorMsg",rsp.message);//No I18N 
            }
        }
        $("#OwnerDetailsList").jqGrid("GridUnload");
        opm_ajaxPostRequestWithMsg(url,"",Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
    }
}
function deleteADUserdetails(ownerId){
    var params = {"ownerId":ownerId.toString()};//NO I18N
    var url = window.OPM.apiUrlPattern + "/ipam/deleteADUserDetails";//NO I18N
    if(confirm(Ember.I18n.t('webclient.js.confirmdelete',this))){
        var calb = function(rsp){
            if (rsp.status === "Success") {
                opm_infoMsgs("successMsg",Ember.I18n.t('webclient.ncm.discovery.deleteMsg',this));//No I18N
            }else{
               opm_infoMsgs("errorMsg",rsp.error.message);//No I18N 
            }
            $("#ownerTabDeleteBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
            $("#ownerTabDeleteAllBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
            $("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
        }
        $("#OwnerDetailsList").jqGrid("GridUnload");
        opm_ajaxPostRequestWithMsg(url, params,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
    }
    
}
function scanADUserManually(){
        var url = window.OPM.apiUrlPattern + "/ipam/scanADUserDetails";//NO I18N
        var calb = function(rsp){
            if (rsp.status === "Success") {
                opm_infoMsgs("successMsg",Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this));//No I18N
            }else{
                opm_infoMsgs("errorMsg",rsp.message);//No I18N 
            }
        }
        $("#adScanInProgress").show();
        $("#adLastScanTime").hide();
        opm_ajaxPostRequestWithMsg(url,"",Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}
function checkADToggleBtn(){
        var url = window.OPM.apiUrlPattern + "/ipam/enableOrDisableADUser";//NO I18N
        var params = {};
        var msgBanner = "";
        if ($("#adUserToggleBtn").attr('checked') === undefined) {
            $('#adUserToggleBtn').attr('checked', '');
            $("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
            params.adminStatus='Enabled';//No I18N
            msgBanner=Ember.I18n.t("webclient.aduser.toggle.ON",this);//No I18N
        }else{
            $('#adUserToggleBtn').removeAttr('checked');
            $("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
            params.adminStatus='Disabled';//No I18N
            msgBanner=Ember.I18n.t("webclient.aduser.toggle.OFF",this);//No I18N
        }
        var calb = function(rsp){
            if (rsp.status === "Success") {
                opm_infoMsgs("successMsg",msgBanner);//No I18N
            }else{
                opm_infoMsgs("errorMsg",rsp.error.message);//No I18N 
            }
        }
        opm_ajaxPostRequestWithMsg(url,params,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N    
}
function editifSpeed(ifspeed){
    if($("#ifSpeed_New_"+ifspeed).css('display') == 'none'){// NO I18N
        $('#ifSpeed_Existing_'+ifspeed).hide();// NO I18N
        $('#ifSpeed_New_'+ifspeed).show();// NO I18N
        $('#ifSpeed_New_'+ifspeed).focus();// NO I18N
        $("#edit_"+ifspeed).removeClass("icon-configedit");// NO I18N
        $("#edit_"+ifspeed).addClass("icon-arrows-cw");// NO I18N
        $("#edit_"+ifspeed).addClass("opuResetBtn");// NO I18N
        $("#edit_"+ifspeed).attr('title',Ember.I18n.t('webclient.topo.addnode.clearbutton',this));// NO I18N
    }else{
        $('#ifSpeed_Existing_'+ifspeed).show();// NO I18N
        $('#ifSpeed_New_'+ifspeed).hide();// NO I18N
        $("#edit_"+ifspeed).removeClass("icon-arrows-cw");// NO I18N
        $("#edit_"+ifspeed).addClass("icon-configedit");// NO I18N
        $("#edit_"+ifspeed).removeClass("opuResetBtn");// NO I18N
        $("#edit_"+ifspeed).attr('title',Ember.I18n.t('webclient.title.edit',this));// NO I18N
    }
}

function opu_TrafficColSort(cell)
{
    if(cell.indexOf("KB")>0 || cell.indexOf("Kbps")>0)//No I18N 
    {
        return parseFloat(cell) * 1024; 
    }
    else if(cell.indexOf("MB")>0 || cell.indexOf("Mbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024;
    }
    else if(cell.indexOf("GB")>0 || cell.indexOf("Gbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024* 1024;
    }
    else if(cell.indexOf("TB")>0 || cell.indexOf("Tbps")>0)//No I18N    
    {   
        return parseFloat(cell) * 1024 * 1024* 1024*1024;
    }
    else if(cell.indexOf("Bytes")>0 || cell.indexOf("bps")>0)//No I18N  
    {   
        return parseFloat(cell) ;
    }
    else if(cell.indexOf("-") != -1)//No I18N   
    {
        return 0 ;
    }
    else
    {
        return parseFloat(cell);
    }
}

function opu_packetColSorting(cell){
    if(cell.indexOf("-") != -1)//No I18N   
    {
        return 0 ;
    }
    else
    {
        return parseFloat(cell);
    }
}

function opu_CommonShowHideDivFn(divToShow,divToHide)
{
    $('#'+divToShow).show();
    $('#'+divToHide).hide();
}
function opu_cfmConfigViewIco(cellValue, options, rowdata, action)
{
    //return '<span>'+cellValue+'</span>';//No I18N

    var device = rowdata['ip-address']; //No I18N
    var cmFile = (rowdata.startupfile !== "") && (rowdata.runningfile !== "");//No I18N
    var re = "";
    if(rowdata.startupfile !== ""){
       re += "<i class='opm-icon oputils-icon startup-config' title='View StartUp Config' onclick='viewConfigFile(&#39;"+device+"&#39;,&#39;"+rowdata.startupfile+"&#39;,&#39;"+rowdata.runningfile+"&#39;,&#39;StartUp&#39;)'></i>"; //No I18N
    }
    if(rowdata.runningfile !== ""){
        re += "<i class='opm-icon oputils-icon running-config' title='View Running Config' onclick='viewConfigFile(&#39;"+device+"&#39;,&#39;"+rowdata.startupfile+"&#39;,&#39;"+rowdata.runningfile+"&#39;,&#39;Running&#39;)'></i>"; //No I18N
    }
    if(cmFile){
        re += "<i class='opm-icon oputils-icon compare-config' title='View difference between this startup and running config' onclick='gotoCompareConfig(&#39;"+device+"&#39;,&#39;"+rowdata.startupfile+"&#39;,&#39;"+rowdata.runningfile+"&#39;)'></i>"; //No I18N
    }
    if(re === "")
    {
        re += "<span>"+Ember.I18n.t('webclient.common.nodata',this)+"</span>" ;//No I18N
    }
    return re;  
    //return "<span style='cursor:pointer;padding-left:10px;' onclick='gotoCompareConfig(&#39;"+device+"&#39;,&#39;"+rowdata.startupfile+"&#39;,&#39;"+rowdata.runningfile+"&#39;)'>C</span>"; //No I18N
}
function opu_cfmDeviceRemarks(cellValue, options, rowdata, action){
    return "<span>"+cellValue+"</span>";//No I18N
}
function opu_cfmEditDeviceIco(cellValue, options, rowdata, action){
    return "<i style='cursor:pointer;clear:none;float:left;margin: 2px 0 0 0 !important;font-size: 15px;' class='icon-configedit'></i>"+"<i class='opm-icon icon-scan' style='cursor:pointer;clear:none;float:left;margin: 1px 5px 0 4px !important;font-size: 15px;' title='Scan' onclick='scanCfmDevice(&#39;"+rowdata['ip-address']+"&#39;)'></i>"+"<span><i class='icon-trash' style='font-size:14px; cursor:pointer'  title='Delete' onclick='deleteCFMDevices(&#39;"+rowdata['ip-address']+"&#39;)'></i></span>"; //No I18N
}
function viewHistoryConfig(cellValue, options, rowdata, action){
    var device = OPMClient.InventoryOpUtilsController.cfmInvListActionObj.ipAddress;
    var re = ""; // No I18N

    if(rowdata.SC){
        var fileName= "SC_"+rowdata.name+".config";//No I18N
        re +="<i class='opm-icon oputils-icon startup-config' style='cursor:pointer;' title='View StartUp Config' id='startupConfigIcon' onclick='gotoViewHistoryConfig(&#39;"+fileName+"&#39;,&#39;true&#39;,&#39;"+device+"&#39;)'></i>";//No I18N
    }
    if(rowdata.RC){
        var fileName= "RC_"+rowdata.name+".config";//No I18N
        re +="<i class='opm-icon oputils-icon running-config' style='cursor:pointer;padding-left:10px;' title='View Running Config' id='runningConfigIcon' onclick='gotoViewHistoryConfig(&#39;"+fileName+"&#39;,&#39;false&#39;,&#39;"+device+"&#39;)'></i>"; //No I18N
    }
    return re;
}
function historyConfigAction(cellValue, options, rowdata, action)
{
    var div= "";
    var SCFileName= "SC_"+rowdata.name+".config";//No I18N
    var RCFileName= "RC_"+rowdata.name+".config";//No I18N
    if(rowdata.SC && rowdata.RC){
        div+="<i class='opm-icon oputils-icon compare-config' style='cursor:pointer;' title='View difference between this startup and running config' onclick='gotoHistoryCompareConfig(&#39;"+SCFileName+"&#39;,&#39;"+RCFileName+"&#39;);'></i>";
    }
    if(rowdata.SC){
        div+= "<i class='opm-icon oputils-icon startup-config-upload' style='cursor:pointer;padding-left:10px;' title='Upload this StartUp Config' onclick='uploadConfigHistory(&#39;SC_"+rowdata.name+"&#39;,&#39;startUp&#39;)'></i>";
    }
    if(rowdata.RC){
        div+= "<i class='opm-icon oputils-icon running-config-upload' style='cursor:pointer;padding-left:10px;' title='Upload this Running Config' onclick='uploadConfigHistory(&#39;RC_"+rowdata.name+"&#39;,&#39;running&#39;)'></i>"; //No I18N   
    }
    return div;
}
function ipam_CFM_ipAddress(selDevice,rowElem){
    if(rowElem.target.className.indexOf("oputilsippingicon") === -1){   
        OPMClient.InventoryOpUtilsController.cfmInvListActionObj.ipAddress = selDevice;
        OPMClient.InventoryOpUtilsController.cfmInvListActionObj.action = "Edit";//No I18N
        redirectList('OpUtils',"History");//No I18N
    }else{
        OPMClient.InventoryOpUtilsController.pingtooltipip=selDevice;
        OPMClient.InventoryOpUtilsController.set('IPRelatedToolActionPage','CFM'); //No I18N
    }
    
}
function ipam_CFM_editIP(selDevice,desc){   
    OPMClient.InventoryOpUtilsController.cfmInvListActionObj.ipAddress = selDevice;
    OPMClient.InventoryOpUtilsController.cfmInvListActionObj.description = desc;
    OPMClient.InventoryOpUtilsController.cfmInvListActionObj.action = "Edit";//No I18N
    redirectList('OpUtils',"AddCFMDevice");//No I18N
}

function scheduleReportsSelectAll(){
    $('#AllDevices').on('click',function(){
        var className = $('input:radio[name="scheduleselected"]:checked').val()== "SWITCH_PORT_MAPPER"? "SPMReportsList" : "IPAMReportsList";//No I18N
        if(this.checked){
            $('.'+className).each(function(){
                this.checked = true;
            });
        }else{
             $('.'+className).each(function(){
                this.checked = false;
            });
        }
    });
    
    $('.IPAMReportsList').on('click',function(){
        if($('.IPAMReportsList:checked').length == $('.IPAMReportsList').length){
            $('#AllDevices').prop('checked',true);
        }else{
            $('#AllDevices').prop('checked',false);
        }
    });

    $('.SPMReportsList').on('click',function(){
        if($('.SPMReportsList:checked').length == $('.SPMReportsList').length){
            $('#AllDevices').prop('checked',true);
        }else{
            $('#AllDevices').prop('checked',false);
        }
    });

    $("#repSizeCheck").on('click',function(){
        if($("#repSizeCheck").prop("checked")==true){
            $("#repSize").prop("disabled", false);  
        }else{
            $("#repSize").prop("disabled", true);  
        }
    });
}
function opuInventoryRedirect(pageURL){
	var params = pageURL.split('_')
	localStorage.removeItem("opu_mapView");//No I18N 
	OPMClient.InventoryDeviceDetailsController.set("subFilterType",params[0]); 
	if(window.OPM.currentView.name=="Inventory.List.OpUtils.Sub.Configure.index" || window.OPM.currentView.name=="Inventory.List.OpUtils.Sub.index"){
		location.href= window.OPM.apiclientUrl+params[2];
	}else{
		opmGlobalRoute.transitionTo("Inventory.List.OpUtils.Sub",params[0]);
	}
}

function enableDisableRouterAddOption(id,blockfieldid){
    var status = $("#"+id).prop("checked");//No I18N
    if(status){
        $("#"+blockfieldid+" .toDisable").prop('disabled',false);
    }else{
        $("#"+blockfieldid+" .toDisable").prop('disabled',true);
    }
}

function showHideIPV6PrefixDiv(obj){
    if(obj.value === "globalPrefix"){
        $("#IPV6TreeGroupDiv").hide();
        $("#ipv6Ex").val('2001:bd8:: , 2001:bd8:AAAA:bbbb:cccc:0:0:1');
        $("#ipv6Ex1").css("display","none");

        loadIpv6PrefixLen(1);

    }else{
        $("#IPV6TreeGroupDiv").show();
        var parentPrefix = $('#ipamIPv6TreeGroup').val();
        var fromPrfix = (parentPrefix.split("/")[1]!= undefined)? (parentPrefix.split("/")[1]):0;
        loadIpv6PrefixLen(parseInt(fromPrfix)+1);
        /*var data = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getIPAMTree');

        $('#subNetTree').jstree('destroy');
        $('#subNetTree')
        .on('select_node.jstree', function (e, data) {
            var nodeid = data.node.id;
            OPMClient.InventoryOpUtilsController.selectedTreeNodeId = nodeid;
            if(nodeid.indexOf("GROUP") !== -1){
                var params = undefined;
                if(nodeid !== "GROUP_0"){
                    params="&subfilter=byGroup&byGroup="+nodeid.split("_")[1];//NO I18N
                }
                if(nodeid === "GROUP_4"){
                    $('.opm_deviceView .icon-rediscovery').css('display','block');
                }
                OPMClient.Inventory.oputils_loadListViewDetails(params);
            }else if(nodeid.indexOf("SUBNET") !== -1){
                var subnet = data.node.text.split("/")[0];
                OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMSubnet";//NO I18N
                opm_deviceShortSummaryView(subnet,'Subnets.ShortSummary','true');//NO I18N
            }else if(nodeid.indexOf("SWITCH") !== -1){
                var switchname = data.node.text.split("/")[0];
                OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMSwitch";//NO I18N
                opm_deviceShortSummaryView(switchname,'Subnets.ShortSummary','true');//NO I18N
            }
        }).jstree({
            'core': {//NO I18N
                "multiple" : false,//NO I18N
                'data': data.result, //NO I18N
                "check_callback" : true//NO I18N
            }, 
            'plugins': ['contextmenu'], //No I18N
            "animation" : 0,//NO I18N
            "check_callback" : true,//NO I18N
            "themes" : { "stripes" : true },//NO I18N
            "open_all":true//NO I18N
        });*/
    }
}
function treeActionsOfV6(tree,treenode,items){

    var nodeId = treenode.id;
    var isv6Folder = treenode.icon.indexOf("v6_newfolder") != -1 ? true : false;
    OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetId = nodeId.split("_")[1];
    OPMClient.InventoryOpUtilsController.invListActionsParamsObj.nodeId = nodeId;
    OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subnetText = treenode.text;

    if(treenode.icon.indexOf("v6_hosts") != -1){
    	items = {
                "AddDiscoveredV6Host": {//No I18N
                    "label": Ember.I18n.t("opu.msgbd.DISCOVER_V6_HOSTS",this),//No I18N
                    "icon":"contextMenuIcon rediscover16",//No I18N
                    "action": function (obj) {//No I18N
                    	discoverIpV6Hosts();
                    }
                }
            }
               //For Operator users
        if(!window.OPM.isAuthorized){
            delete items.AddDiscoveredV6Host;
        }
        return items;
    }
    else if(isv6Folder){
        items = {
            "AddSubnet": {//No I18N
                "label": Ember.I18n.t("opu.views.ADD_SUBNET",this),//No I18N
                "icon":"contextMenuIcon add16",//No I18N
                "action": function (obj) {//No I18N
                    OPMClient.InventoryOpUtilsController.set('ipv6AddGlobPrefixOrSubnet','global');//No I18N
                    OPMClient.InventoryOpUtilsController.addSubnetPage="IPv4";//NO I18N
                    if(window.OPM.currentView.name!=="Inventory.Device.index"){
                        redirectList('OpUtils','AddSubnet');//No I18N
                    }else{
                        location.href=window.OPM.apiclientUrl + "Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/AddSubnet/IPv6";
                    }
                }
            },
            "EditSubnet": {//No I18N
                "label": Ember.I18n.t("opu.tree.EDIT_SUBNET",this),//No I18N
                "icon":"contextMenuIcon edit16",//No I18N
                "action": function (obj) {//No I18N
                    OPMClient.InventoryOpUtilsController.set('isInvListActionsPgActive',true);//No I18N
                    OPMClient.InventoryOpUtilsController.set('opuInvListpartialPageSmall','opuInvListPageActions');//No I18N
                    OPMClient.InventoryOpUtilsController.set('invListActionsPgHeader',Ember.I18n.t('opu.views.MODIFY_SUBNET',this));//No I18N
                    OPMClient.InventoryOpUtilsController.set('invListActions',"editSubnetPrfix");//No I18N
                    OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetId=nodeId.split("_")[1];
                }
            },
            "Delete": {//No I18N
                "label": Ember.I18n.t("opu.tree.DELETE_SUBNET",this),//No I18N
                "icon":"contextMenuIcon delete16",//No I18N
                "action": function (obj) {//No I18N
                    if(confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUBNET_CONFORM",this))){
                        OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
                        var url = window.OPM.apiUrlPattern + '/ipam/deleteIpv6Prefix?subnetID='+nodeId.split("_")[1];//No I18N
                        var resp=opm_ajaxPostRequest(url);
                        if(resp.status==="Success"){
                            $("#oputree").jstree("select_node",treenode.parent);
                            opm_infoMsgs("successMsg",Ember.I18n.t("opu.ipam.SUBNET_DELETED"));//No I18N
                            if(window.OPM.currentView.name==="Inventory.Device.index"){
                                reloadSnapshotPage();
                                $("#oputree").jstree("select_node","GROUP_0");//No I18N
                            }else{
                                OPMClient.Inventory.oputils_loadListViewDetails();//No I18N
                            }
                        }else{
                            opm_infoMsgs("errorMsg",resp.msg);//No I18N
                        }
                    }
                }
            }
            
        }
    }
   else if(nodeId.indexOf("SUBNET") !== -1 && !isv6Folder)
   {
        items = {
            "Split": {//No I18N
                "label": "Split IPv6 Subnet",//No I18N
                "icon":"contextMenuIcon split16",//No I18N
                "action": function (obj) {//No I18N
                    OPMClient.InventoryOpUtilsController.set('isInvListActionsPgActive',true);//No I18N
                    OPMClient.InventoryOpUtilsController.set('opuInvListpartialPageSmall','opuInvListPageActions');//No I18N
                    OPMClient.InventoryOpUtilsController.set('invListActionsPgHeader',Ember.I18n.t('opu.ipv6.SPLIT_IPV6_SUBNET',true));//No I18N
                    OPMClient.InventoryOpUtilsController.set('invListActions',"splitV6Subnet");//No I18N
                }
            },
            "AddSubnet": {//No I18N
                "label": Ember.I18n.t("opu.views.ADD_SUBNET",this),//No I18N
                "icon":"contextMenuIcon add16",//No I18N
                "action": function (obj) {//No I18N
                    OPMClient.InventoryOpUtilsController.set('ipv6AddGlobPrefixOrSubnet','subnet');//No I18N
                    OPMClient.InventoryOpUtilsController.addSubnetPage="IPv6";//NO I18N
                    if(window.OPM.currentView.name!=="Inventory.Device.index"){
                        redirectList('OpUtils','AddSubnet');//No I18N
                    }else{
                        location.href=window.OPM.apiclientUrl + "Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/AddSubnet/IPv6";
                    }
                }
            },
            "EditSubnet": {//No I18N
                "label": Ember.I18n.t("opu.tree.EDIT_SUBNET",this),//No I18N
                "icon":"contextMenuIcon edit16",//No I18N
                "action": function (obj) {//No I18N
                    OPMClient.InventoryOpUtilsController.set('isInvListActionsPgActive',true);//No I18N
                    OPMClient.InventoryOpUtilsController.set('opuInvListpartialPageSmall','opuInvListPageActions');//No I18N
                    OPMClient.InventoryOpUtilsController.set('invListActionsPgHeader',Ember.I18n.t('opu.tree.EDIT_SUBNET',true));//No I18N
                    OPMClient.InventoryOpUtilsController.set('invListActions',"editSubnetPrfix");//No I18N
                }
            },
            "ScanSubnets": {//No I18N
                "label": Ember.I18n.t("webclient.Scan.Subnet",this),//No I18N
                "icon":"contextMenuIcon scan16",//No I18N
                "action": function (obj) {//No I18N
                    opm_infoMsgs('successMsg',Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this));//No I18N
                    var resp=opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/ipam/scanv6Subnet", {"subnetID":nodeId.split("_")[1]});//No I18N
                    if(resp.status==="Success"){
                        location.href=window.OPM.apiclientUrl + "Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice;
                    }else{
                        opm_infoMsgs("errorMsg",resp.msg);//No I18N
                    }
                }
            },
            "Delete": {//No I18N
                "label": Ember.I18n.t("opu.tree.DELETE_SUBNET",this),//No I18N
                "icon":"contextMenuIcon delete16",//No I18N
                "action": function (obj) {//No I18N
                    if(confirm(Ember.I18n.t("opu.tree.ipam.DELETE_SUBNET_CONFORM",this))){
                        tree.delete_node(treenode);
                        var url =window.OPM.apiUrlPattern + '/ipam/deleteIpv6Prefix?subnetID='+nodeId.split("_")[1];//No I18N
                        var resp=opm_ajaxPostRequest(url);
                        if(resp.status==="Success"){
                            $("#oputree").jstree("select_node",treenode.parent);
                            opm_infoMsgs("successMsg",Ember.I18n.t("opu.ipam.SUBNET_DELETED"));//No I18N
                            if(window.OPM.currentView.name==="Inventory.Device.index"){
                                reloadSnapshotPage();
                                $("#oputree").jstree("select_node","GROUP_0");//No I18N
                            }else{
                                OPMClient.Inventory.oputils_loadListViewDetails();//No I18N
                            }
                        }

                            
                    }
                }
            }
        }
    }
    //For Operator users
    // if(!window.OPM.isAuthorized){
    //     delete items.Delete;
    //     delete items.EditSubnet;
    //     delete items.AddSubnet;
    //     delete items.Split;
    // }

    if(((window.OPM.userPermissions.ipamRead || window.isoperator) && !(window.OPM.userPermissions.ipamWrite))){
        delete items.Delete;
        delete items.EditSubnet;
        delete items.AddSubnet;
        delete items.Split;
    }
    return items;
}
function deleteOpUtilsIPV6Subnet(snapid,widgetIndex){
    var ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"subnetid");//No I18N
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('opu.client.SELECT_ONE_ROW_DELETE', this)); //No I18N
        return;
    }

    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            reloadSnapWidgets(widgetIndex, true);
            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
            opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.SUBNET_DELETED',this)); //No I18N
        }
    }
    if(confirm(Ember.I18n.t('opu.tree.ipam.DELETE_SUBNET_CONFORM',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/deleteIpv6Prefix";//NO I18N
        
        opm_ajaxPostRequestWithMsg(url, {"subnetID":ids}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }
}
function scanOpUtilsIPV6Subnet(snapid,widgetIndex){
    var ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"subnetid");//No I18N
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('opu.client.SELECT_ONE_ROW_DELETE', this)); //No I18N
        return;
    }
    var url = window.OPM.apiUrlPattern + "/ipam/scanv6Subnet";//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            reloadSnapWidgets(widgetIndex, true);
            opm_infoMsgs("successMsg",msg); //No I18N
        }
    }
    opm_ajaxPostRequestWithMsg(url, {"subnetID":ids}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}
function ipamSpmTreeSearch(searchString){
    if(OPMClient.InventoryDeviceDetailsController.debounce!=null){
         clearTimeout(OPMClient.InventoryDeviceDetailsController.debounce);
    }
    OPMClient.InventoryDeviceDetailsController.debounce=setTimeout(function(){
        $('#oputree').jstree('search', searchString);
        if (searchString=='') {
            $('#oputree').find('.hide-discovered-subnet').addClass('jstree-leaf');
            $('.hide-discovered-subnet i').removeClass('jstree-ocl');
        }
        else{
            $('#oputree').find('.jstree-leaf.hide-discovered-subnet').each(function() {
                var node = $(this);
                if (node.find('ul > li').length === 0) {
                    $('.hide-discovered-subnet i').removeClass('jstree-ocl');
                    node.addClass('jstree-leaf');
                } else {
                    node.removeClass('jstree-leaf');
                }
            });
        }
        clearTimeout(OPMClient.InventoryDeviceDetailsController.debounce);
    }, "300");
}
function opu_isValidPrfixName(pName)
{
    var iChars = '!@#$%^&*()+=-[]\\\';,./{}|\":<>?_';//No I18N
    for (var i = 0; i < pName.length; i++) 
    {
        if (iChars.indexOf(pName.charAt(i)) != -1) 
        {
            return false;
        }
    }
    return true;
}
function opuv6IpStatuscolor(cellValue, options, rowdata, action)
{
    var val =rowdata["status-int"];//No I18N
    var ipId = rowdata["ipv6-details-id"];//No I18N
    var classColor='';
    if(val === 1 || val === "1"){
        classColor = "iconStatusGreen";//NO I18N
    }else if(val === 2 || val === "2"){
        classColor = "iconStatusYellow";//NO I18N
    }else if(val === 3 || val === "3"){
        classColor = "iconStatusRed";//NO I18N
    }else if(val === 5 || val === "5"){
        classColor = "iconStatusBlue";//NO I18N
    }
    if(window.OPM.userPermissions.ipamWrite){
        return "<span  onclick='changeIpv6Status(&#39;"+val+"&#39;,&#39;"+ipId+"&#39;,"+options.gid.split('opm_DeviceSnapList')[1]+")' style='cursor:pointer;'><i class='iconStatusColor "+classColor+"' title='"+cellValue+"'></i>"+cellValue+"</span>";//No I18N
    }else{
        return "<i class='iconStatusColor "+classColor+"' title='"+cellValue+"'></i>"+cellValue;//No I18N   
    }
    
}
function changeIpv6Status(status,id,wid){
    if(window.OPM.userPermissions.ipamWrite){
        OPMClient.InventoryOpUtilsController.ipv6SnapActionObj.ipAddId = id;
        OPMClient.InventoryOpUtilsController.ipv6SnapActionObj.ipStatusInt = status;
        OPMClient.InventoryOpUtilsController.widgetId=wid;
        var pg ="changeIpState"; //No I18N
       location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/OPUSnapAction/"+pg; //No I18N 
   }
}
function oputilsIpV6SnapshotActions(pg,wid){
    OPMClient.InventoryOpUtilsController.widgetId=wid;
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/OPUSnapAction/"+pg; //No I18N 
}
function loadIpv6PrefixLen(strIndex){
    $("#ipv6PrefixLen").empty();
    $("#ipv6PrefixLen").append("<option value='-1'>"+Ember.I18n.t('webclient.Select',this)+"</option>");//No I18N
    for(var i=strIndex; i <= 128; i++){
        $("#ipv6PrefixLen").append("<option value='"+i+"'>"+i+"</option>");//No I18N
    }
}
function getIPv6AllowedRangeAddress(subNetText,subNetNodeId){
    var index = 0;
    if(subNetText !== undefined || subNetNodeId !== undefined ){
        $("#ipamIPv6TreeGroup").val(subNetText);
        $("#ipamIPv6TreeGroup").attr("data-value",subNetNodeId);
        index = subNetText.split("/")[1];
    }else{
        node=$('#oputree').jstree(true).get_node('GROUP_0');
        index= node.text.split("/")[1]; 
        subNetNodeId = node.id.split("_")[1]
    }
    $("#ipv6Ex").text("");
    var exData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getValidIpv6Example?parentID='+subNetNodeId);//NO I18N
    $("#ipv6Ex").text(exData.result.example); //No I18N
    $("#ipv6Ex1").css("display","none");
    $("#ipv6Ex2").text("");
    if(exData.result.allowedRange){
        $("#ipv6Ex1").css("display","block");
        $("#ipv6Ex2").text(exData.result.allowedRange); //No I18N
    }
    loadIpv6PrefixLen(parseInt(index)+1);
}
function isHexWithColon(str,formElement)
{
    var objRegExp = /^[a-fA-F0-9\:]+$/;
    if (objRegExp.test(str)) {
        if(str.indexOf(":::") !== -1){
            return false;
        }else if(str.indexOf("::") === -1){
            var substrings = str.split(":");  
            if(substrings.length === 8){
                return true;
            }
        }else{
            var substrings = str.split("::");  
            if(substrings.length === 2){
                return true;
            }
        }
    }
    return false;
}
function validatesplitIPV6Prefix(selItemText,splitToLen){
    var selItemTextval = selItemText.split("/");
    if (selItemTextval.length === 2) {
        var actualPrefixLen = parseInt(selItemTextval[1]);
        if((actualPrefixLen===128) ||
                (actualPrefixLen === 127 && splitToLen !== 1) || 
                (actualPrefixLen === 126 && splitToLen !== 1 && splitToLen !== 2) 
                || (actualPrefixLen === 125 && splitToLen === 4)){
                alert(Ember.I18n.t("opu.ipv6.INVALID_IPV6_SPLITTING",this)); // No I18N
            return false;
        }
    }
    return true;
}
function redirectSnapShottoEditphy(name){
    // redirectSnapShot(name,"IPAMPort",OPMClient.InventoryDeviceDetailsController.selDevice)
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMPort/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/"+name; //No I18N
}
function hideOpUtilsPortEditDiv(){   
    deviceSlideOut(3)
    $('#oputilsactionsslide').hide();
    if(window.OPM.currentView.name==="Inventory.Device.EditOpUtilsCustomCol"||window.OPM.currentView.name==="Inventory.Device.EditPhyLocation"){
        backToDevSnapshotPage();
    }
}
function guestSnapRefresh(){
    if (OPMClient.ApplicationController.gridIdData != null) {
        reloadSnapWidgets(OPMClient.ApplicationController.gridIdData.gridData.snapIndex);
    }
}
function gotoAddPage(){
    oputilsGSRedirect(OPMClient.InventoryOpUtilsController.gridNoData.addLink);
}
function getCredentials(isNeedAll,isneedSNMPv3){
    var allCrdList = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listCredentials"); //No I18n
    var listCredentials = [];
    if((allCrdList.snmpcredential || allCrdList.snmpv3credential) && (isNeedAll === undefined || isNeedAll)){
        listCredentials.push({'credentialName':'All','className':'All'});
    }
    if(allCrdList.snmpcredential){
        for(i=0;i<allCrdList.snmpcredential.length;i++){
            var cred = allCrdList.snmpcredential[i];
            cred.className = 'credential'; //No I18N           
            listCredentials.push(cred);
        }
    }
    if(isneedSNMPv3 == undefined || isneedSNMPv3){
        if(allCrdList.snmpv3credential){
            for(i=0;i<allCrdList.snmpv3credential.length;i++){
                var cred = allCrdList.snmpv3credential[i];
                cred.className = 'credential';//No I18N                  
                listCredentials.push(cred);
            }
        }
    }
    OPMClient.SettingsOpUtilConfigController.set('credentialsList',listCredentials);//No I18N
    return listCredentials;
}

function communityCheckerPageShowHide(thisDiv){
    $("input[name='"+$(thisDiv).attr('name')+"']").each(function(i,val){
       $("#"+$(val).attr('data-div')).hide();
    });
    $("#"+$(thisDiv).attr('data-div')).show();
    var formId = $(thisDiv).attr('data-div');
    $("#"+formId).trigger('reset');
    $('.multiSelOptionList input[type=checkbox]').attr('checked',false);
    $("#CommunityResultTable").hide();
    $("#CCsnmpTimeout").val(5);
    $("#CCsnmpRet").val(0);
    $('#hostName').find('option:first').select2().trigger('change');//No I18N
    if(!($("#hostName").is(':visible'))) {
        $("#newhostDiv").css('display', 'none');
        $("#hostDiv").css('display', 'block');
    }
    if(window.OPM.isDemoUser){
        $("#CommunityResultTable").show();
    }
    $('.multiSelOptionList input[type=checkbox]').prop('checked',false);//No I18N
    OPMClient.SettingsOpUtilConfigController.set('selCredCount',0);//No I18N
}

function selectDHCPCredential(thisDiv){   
    if($(thisDiv).attr('class')=="All"){
        if($('.multiSelOptionList input[type=checkbox].All').prop('checked')){
            $('.multiSelOptionList input[type=checkbox].dhcpCredentials').prop('checked', true);//No I18N
        }else{
            $('.multiSelOptionList input[type=checkbox].dhcpCredentials').prop('checked', false);//No I18N
        }
    }else{
        if($('.multiSelOptionList input[type=checkbox].dhcpCredentials:checked').length==(OPMClient.InventoryOpUtilsController.allDHCPServers.length)){
            $('.multiSelOptionList input[type=checkbox].All').prop('checked', true);//No I18N
        }else{
            $('.multiSelOptionList input[type=checkbox].All').prop('checked', false);//No I18N
        }
    }
    OPMClient.InventoryOpUtilsController.set('selDhcpCredCount',$('.multiSelOptionList input[type=checkbox].dhcpCredentials:checked').length);//No I18N
}

function selectCredential(thisDiv){
    if($(thisDiv).attr('class')=="All"){
        if($('.multiSelOptionList input[type=checkbox].All').prop('checked')){
            $('.multiSelOptionList input[type=checkbox].credential').prop('checked', true);//No I18N 
        }else{
            $('.multiSelOptionList input[type=checkbox].credential').prop('checked', false);//No I18N 
        }
    }else{
        if($('.multiSelOptionList input[type=checkbox].credential:checked').length==(OPMClient.SettingsOpUtilConfigController.credentialsList.length-1)){
            $('.multiSelOptionList input[type=checkbox].All').prop('checked', true);//No I18N 
        }else{
            $('.multiSelOptionList input[type=checkbox].All').prop('checked', false);//No I18N 
        }
    }
    OPMClient.SettingsOpUtilConfigController.set('selCredCount',$('.multiSelOptionList input[type=checkbox].credential:checked').length);//No I18N
}
function selectVersion(thisDiv){
    if($(thisDiv).attr('class')=="All"){
        if($('.multiSelOptionList input[type=checkbox].All').prop('checked')){
            $("#trapViewerVersion").text(Ember.I18n.t('opu.common.ALL',this)+" "+Ember.I18n.t('webclient.fwa.data.storage.config.versions',this));
            $('.multiSelOptionList input[type=checkbox].credential').prop('checked', true);//No I18N
            $('#credentialDiv').show();
        }else{
            $("#trapViewerVersion").text("--"+Ember.I18n.t('webclient.action.select',this)+" "+Ember.I18n.t('webclient.topo.version',this)+"--");
            $('.multiSelOptionList input[type=checkbox].credential').prop('checked', false);//No I18N
            $('#credentialDiv').hide();
        }
    }else{
        if($('.multiSelOptionList input[type=checkbox].credential:checked').length==4){
            $("#trapViewerVersion").text(Ember.I18n.t('opu.common.ALL',this)+" "+Ember.I18n.t('webclient.fwa.data.storage.config.versions',this));
            $('.multiSelOptionList input[type=checkbox].All').prop('checked', true);//No I18N
            $('#credentialDiv').show();
        }else{
            if($('.multiSelOptionList input[type=checkbox].credential:checked').length>0){
                var selectedVersions = [];
                $('.multiSelOptionList input[type=checkbox].credential:checked').each(function(i,val){
                    $('#credentialDiv').hide();
                    if($(this).attr('value') == 0) {
                        selectedVersions.push("1");
                    } if($(this).attr('value') == 1) {
                        selectedVersions.push("2");
                    } if($(this).attr('value') == 2) {
                        selectedVersions.push("2c");
                    } if($(this).attr('value') == 3) {
                        selectedVersions.push("3");
                        $('#credentialDiv').show();
                    }
                });
                var dispSelectedVersions = selectedVersions.toString().replaceAll(",",", ");
                $("#trapViewerVersion").text(Ember.I18n.t("webclient.topo.version",this)+" - "+dispSelectedVersions); //No I18N
            } else {
                $("#trapViewerVersion").text("--"+Ember.I18n.t('webclient.action.select',this)+" "+Ember.I18n.t('webclient.topo.version',this)+"--");
                $('#credentialDiv').hide();
            }
            $('.multiSelOptionList input[type=checkbox].All').prop('checked', false);//No I18N
        }
    }
}
function opu_getParentPath(wholeArray,currentNode,currentPath){
    if(currentNode!=undefined){
        currentPath.push({id:currentNode.id,text:currentNode.text});
        if(currentNode.parent==="#"){
            return true;
        }
        else{
            for (var i = (wholeArray).length - 1; i >= 0; i--) {
                if(wholeArray[i].id===currentNode.id){
                    for (var j = (wholeArray).length - 1; j >= 0; j--) {
                        if(wholeArray[j].id===wholeArray[i].parent){
                            opu_getParentPath(wholeArray,wholeArray[j],currentPath);
                            return true;
                        }
                    }
                }
            }
        }
    }
}
function getSubnetNodeId(deviceName,currentNode){
    var children = currentNode.children;
    var nodeId = currentNode.id;
    var data=$('#oputree').jstree(true).get_json('#',{flat:true});
    var subnetNodeId = deviceName;
    if(children.length>0){
        for(var i = data.length - 1; i >= 0; i--){
            for(var j = children.length - 1; j >= 0; j--){
                if(data[i].id===children[j]){
                    if(data[i].text.includes(deviceName)){
                        return data[i].id;
                    }
                }
            }
        }
    }else{
        for(var i = data.length - 1; i >= 0; i--){
            if(data[i].id === nodeId && data[i].text.includes(deviceName)){
                return data[i].id;
            }
        }
    }
    return subnetNodeId;
}
function oputilsSnapshotHeader(node,isIPAMIP,port){
    if(window.OPM.isCentralServer){//Remove probe id from device
        if(node !== undefined && node.indexOf("."+OPMClient.InventoryOpUtilsController.selectedprobeid) != -1){
            node = node.replace("."+OPMClient.InventoryOpUtilsController.selectedprobeid,"");
        }
    }
    if($('#oputree').jstree(true)!==undefined && $('#oputree').jstree(true)!==false){
        //here node is selected Device Name. Change device name to tree display name(switch sysname).

        if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMIP"){
            var groupID="";
            if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.result != undefined && 
                OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.result["group-id"] != undefined){ //No I18N
                groupID = "SUBNET_"+OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.result["group-id"]; //No I18N
            }
            if(groupID != ""){
                node = groupID;//ipam- tree display parent text
            }
        }
        var parentPath=[];
        var data=$('#oputree').jstree(true).get_json('#',{flat:true});
        var currentNode = $('#oputree').jstree(true).get_json(node,{flat:true,no_children:true});
        if(currentNode===false){
            for (var i = data.length - 1; i >= 0; i--) {
                if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "DNSSummary" || OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMDNS"){
                    var original = $('#oputree').jstree(true).get_node(data[i].id).original;
                    if(data[i].id.includes("DNS")){
                        if( original.ipAddress != undefined && original.ipAddress === node){
                            currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                        }
                        else if(data[i].text===node){
                            currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                        }
                    }
                }
                else if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "DHCPSummary" || OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMDHCP"){
                    var original = $('#oputree').jstree(true).get_node(data[i].id).original;
                    if(data[i].id.includes("DHCP")){
                        if( original.ipAddress != undefined && original.ipAddress === node){
                            currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                        }
                        else if(data[i].text===node){
                            currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                        }
                    }
                }
                else{
                    if(data[i].text.split('/')[0]===node){
                        currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                    }
                    if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSwitch" || OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMPort"){
                        var original = $('#oputree').jstree(true).get_node(data[i].id).original;
                        if(original.switchname != undefined && original.switchname === node){
                            currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                        }
                    }
                }
                if(currentNode===false){
                    if(data[i].id.split('GROUP_').length>1 && data[i].id.split('GROUP_')[1]!==undefined && data[i].id.split('GROUP_')[1]===node){
                        currentNode=$('#oputree').jstree(true).get_json(data[i].id,{flat:true,no_children:true});
                    }
                }
            }
        }
        opu_getParentPath(data,currentNode[0],parentPath);
        parentPath.reverse();
        var pathRoute = [];
        var id="";
        var addProbeIdInUrl = "";
        if(window.OPM.isCentralServer){
            addProbeIdInUrl = "."+OPMClient.InventoryOpUtilsController.selectedprobeid;   
        }
        for(i=0;i<parentPath.length;i++){
            id=parentPath[i].id;
            if(parentPath[i].id=="GROUP_3"){
                snapType="DHCPSummary"; //No I18N
            }else if(parentPath[i].id=="GROUP_5"){
                snapType="DNSSummary"; //No I18N
            }else if(parentPath[i].id.indexOf('GROUP')!=-1 && parentPath[i].id.indexOf('IPV6')==-1 && parentPath[i].id.indexOf('SPM')==-1){
                snapType="IPAMSubnetGroupSummary";//No I18N
            }else if(parentPath[i].id.indexOf('GROUP_4')==-1 && parentPath[i].id.indexOf('GROUP')!=-1 && parentPath[i].id.indexOf('IPV6')!=-1 && parentPath[i].id.indexOf('SPM')==-1){
                snapType="IPV6SubnetGroupSummary";//No I18N
                id=parentPath[i].id.split("_")[1];
            }else if(parentPath[i].id.indexOf('SUBNET')!=-1 && parentPath[i].id.indexOf('IPV6')==-1 && parentPath[i].id.indexOf('SPM')==-1){
                id=parentPath[i].id;
                snapType="IPAMSubnet";//No I18N
            }else if(parentPath[i].id.indexOf('SUBNET')!=-1 && parentPath[i].id.indexOf('IPV6')!=-1){
                snapType="IPAMV6Subnet";//No I18N
            }else if(parentPath[i].id.indexOf('SPMGROUP')!=-1){
                snapType="IPAMSwitchGroup";//No I18N
            }else if(parentPath[i].id.indexOf('SWITCH')!=-1){
                snapType="IPAMSwitch";//No I18N
                id=parentPath[i].text;//No I18N
                if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMPort"){
                    var sdevice = OPMClient.InventoryDeviceDetailsController.deviceName;
                    id=sdevice.split(" ")[0];//Replace sysName to switch name 
                }
            }
            pathRoute.push({'snapName':snapType,'snapType':'redirectToSnapshot("'+snapType+'","'+id+addProbeIdInUrl+'")','displayName':parentPath[i].text,'lastNode':((parentPath.length-1)===i&&!isIPAMIP)?true:false})
        }
        if(isIPAMIP&&port==undefined){
            var ipadrr = OPMClient.InventoryDeviceDetailsController.selDevice;
            if(window.OPM.isCentralServer){
                if(ipadrr.indexOf("."+OPMClient.InventoryOpUtilsController.selectedprobeid) != -1){
                    ipadrr = ipadrr.replace("."+OPMClient.InventoryOpUtilsController.selectedprobeid,"");
                }
            }
            pathRoute.push({'snapName':"IPAMIP",'snapType':'redirectToSnapshot("IPAMIP","'+ipadrr+'")','displayName':ipadrr,'lastNode':true});//No I18N
        }
        if(port!=undefined){
            if(window.OPM.isCentralServer){
                if(port.indexOf("."+OPMClient.InventoryOpUtilsController.selectedprobeid) != -1){
                    port = port.replace("."+OPMClient.InventoryOpUtilsController.selectedprobeid,"");
                }
            }
            pathRoute.push({'snapName':'IPAMPort','snapType':'redirectToSnapshot("IPAMPort","'+port+'")','displayName':port,'lastNode':true})//No I18N
        }
        $('#oputree').jstree("deselect_all");
        setTimeout(function(){
            if(!($(".DI-Accordion .DIA-Header").hasClass("oputilsHeader"))){
                $(".DI-Accordion .DIA-Header").addClass("oputilsHeader");
            }
        },100);
        if(parentPath[parentPath.length-1]!=undefined){
            if(window.OPM.currentView.name!=="Inventory.Device.AddSubnet" && window.OPM.currentView.name!=="Inventory.Device.AddDHCP" && !isIPAMIP){//No I18N
                $('#oputree').jstree('select_node', (parentPath[parentPath.length-1].id));
            }
        }
        OPMClient.InventoryDeviceDetailsController.set('nodeHeader',pathRoute);//No I18N
    }
    $("#nameOnly").css({'width':'500px'});
    $("#nameOnly .ember-view").css({'width':'500px'});
}



function enableDisableField(id,className){
    var flag = $("#"+id).prop("checked");//No I18N
    if(flag){
        if(isMailServerConfigured("Settings.OpUtils.Ping.AlertRule",Ember.I18n.t('webclient.admin.mailserver.message',this)+" "+Ember.I18n.t('opu.common.PLEASE_CONFIGURE',this))){//No I18N
            $("."+className).attr('disabled',false);//No I18N
        }
    }else{
        $("."+className).attr('disabled',true);//No I18N
    }
}
function enableDisableFieldtrap(id,className){
    var flag = $("#"+id).prop("checked");//No I18N
    if(flag){
        if(isMailServerConfigured("Settings.Tools.SNMPTools.TrapReceiver.ConfigureAlerts",Ember.I18n.t('webclient.admin.mailserver.message',this)+" "+Ember.I18n.t('opu.common.PLEASE_CONFIGURE',this))){//No I18N
            $("."+className).attr('disabled',false);//No I18N
        }
    }else{
        $("."+className).attr('disabled',true);//No I18N
    }
}
function trapReceiverNotificationInstantlyJS(prop)
{
    if(prop==="refresh"){
    getTrapDetailsUpdateList();
    filterContentstrapreceiver();
    $('#filterTrap').load();
    }   
}
function gotoRouterScheduler(){
    location.href = window.OPM.apiclientUrl+'Settings/OpUtils/Scheduler/Router'; //No I18N  
}
function gotoAddRouter(){
    location.href = window.OPM.apiclientUrl+'Settings/OpUtils/Discovery/Router/Add'; //No I18N    
}
function gotoAddSwitch(){
    oputilsGSRedirect("Switches_switchaddbyManual_Inventory/List/OpUtils/Switches/AddSwitch");//No I18N
}
function gotoSPMScheduler(){
    location.href = window.OPM.apiclientUrl+'Settings/OpUtils/Scheduler/SPM'; //No I18N    
}
function addPercentageSymbol(cellValue, options, rowdata, action)
{
    return cellValue+"%"
}

function subnetApproveFunc(selDevice,gid){
    if(gid!=undefined){
        var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
        OPMClient.InventoryOpUtilsController.widgetID=wid;
    }
    var url = window.OPM.apiUrlPattern + '/ipam/getSubnetSummary?subnetAddress='+selDevice;//No I18N
    var subnetdetails = opm_ajaxGetResponse(url);
    OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet=subnetdetails.rows[0];
    if(window.OPM.currentView.name==="Inventory.Device.index") {
        location.href = window.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/ApproveSubnet"; //No I18N
    }
    else{
        redirectList('OpUtils','ApproveSubnet');//No I18N
    }
    return;
}
function opm_goToTrapSettings(){
    if(window.OPM.userPermissions.toolsetWrite){
        opmGlobalRoute.transitionTo('Settings.Tools.SNMPTools.TrapReceiver.SNMPTrapSettings'); //No I18N
    }
}
function compareCFM(){
    var url = window.OPM.apiUrlPattern + "/cfm/getConfigDetails";//No I18N
    var resp = opm_ajaxGetResponse(url);
    if(resp.status=="Failure"){
        location.href = window.apiclientUrl+"Inventory/List/OpUtils/CFM/AddCFMDevice"; //No I18N
    }else{
        gotoCompareConfig(resp.result[0]["ip-address"],resp.result[0]["startupfile"],resp.result[0]["runningfile"]);
    }
}
function applysourcefilterfortrap(param){
    OPMClient.SettingsTabController.set("source",param);//No I18N
    getTrapDetailsUpdateList();
    }
function applyoidfilterfortrap(param){
    OPMClient.SettingsTabController.set("oid",param);//No I18N
    getTrapDetailsUpdateList();
}

function uploadCFM(){
    var url = window.OPM.apiUrlPattern + "/cfm/getConfigDetails";//No I18N
    var resp = opm_ajaxGetResponse(url);
    if(resp.status=="Failure"){
        location.href = window.apiclientUrl+"Inventory/List/OpUtils/CFM/AddCFMDevice"; //No I18N
    }else{
        OPMClient.InventoryOpUtilsController.cfmInvListActionObj.devices = resp.result[0]["ip-address"];
        location.href = window.apiclientUrl+"Inventory/List/OpUtils/CFM/uploadConfig"; //No I18N
    }
}

function approveSubnet(){
    //setTimeout(function(){
        $("#GROUP_1_anchor").click();
    //},100); 
}
function enableHorizontalScroll(){
    $('.ui-jqgrid-bdiv').scroll(function(){
        var scrollX = this.scrollLeft;
        $('.ui-jqgrid-htable').css({position:'relative',left:'-'+scrollX+'px'});
    });
}
function checkOputilsLiscenceAddSubnet(){

        var url = window.OPM.apiUrlPattern + "/oputilsadmin/checkForIPAMLicense";//No I18N
        var resp = opm_ajaxGetResponse(url);
        var url1 = window.OPM.apiUrlPattern + "/oputilsadmin/getInventoryTotalCounts?hzTabName=IPAM";//No I18N
        var resp1 = opm_ajaxGetResponse(url1);
        var msg='';
        if(resp.status!==undefined && resp.status!=='Failure' && resp.result!==undefined){
            if(resp.result.errorStatus=="FreeVersion"){
                msg=Ember.I18n.t('opu.ipam.NEED_ADDITIONAL_LICENSE_FOR_OPUTILS', { param0:Ember.I18n.t('opu.tools.IP_ADDRESS_MANAGER'),param1:"sales@manageengine.com" },this);//No I18N
                OPMClient.InventoryOpUtilsController.set('isliscenceNotViolated',true);//No I18N
                if(resp1.result[0].count>='1'){
                    msg1=Ember.I18n.t('opu.ipam.RESTRICTION_OF_FREE_IPAM_LICENSE',this);//No I18N
                    if(OPMClient.ApplicationController.isProbe){
                        msg1=msg1+' '+Ember.I18n.t('opu.common.PROBE_LICENSE_INFORMATION', { param0:Ember.I18n.t('opu.views.IP_ADDRESS')},this);
                    }
                    OPMClient.InventoryOpUtilsController.set('isliscenceNotViolated',false);//No I18N
                    $('#liscenceWarning1').removeClass("style1");
                    $('#liscenceWarning3').removeClass("style1");
                    $('#warningicon1').addClass("failure");
                    $('#warningicon').addClass("failure");
                    $('#liscenceWarning1').show();
                    $('#liscenceWarning3').show();
                    $('#addsubnetbtn').prop("disabled", true);//No I18N
                    $('#addsubnetbtn').css("cursor", 'not-allowed');//No I18N
                    $('#approvesubnetbtn').prop("disabled", true);//No I18N
                    $('#approvesubnetbtn').css("cursor", 'not-allowed');//No I18N
                    $('#AddIPV6SubnetBtn').prop("disabled", true);//No I18N
                    $('#AddIPV6SubnetBtn').css("cursor", 'not-allowed');//No I18N
                    OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg1',msg1);//No I18N
                }
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                $('#importsubnetbtn').prop("disabled", true);//No I18N
                $('#importsubnetbtn').css("cursor", 'not-allowed');//No I18N
                $('#liscenceWarning').removeClass("style1");
                $('#warningicon0').addClass("failure");
                $('#liscenceWarning').show();
            }else if(resp.result.errorStatus=="Exceeded"){//No I18N
                msg=Ember.I18n.t('opu.common.IPADDRESS_LICENSE_LIMIT_EXCEEDED_MSG', { param0:resp.result.licensedCount,param1:resp.result.managedCount },this);//No I18N
                if(OPMClient.ApplicationController.isProbe){
                    msg=msg+' '+Ember.I18n.t('opu.common.PROBE_LICENSE_INFORMATION', { param0:Ember.I18n.t('opu.views.IP_ADDRESS')},this);
                }
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg1',msg);//No I18N
                OPMClient.InventoryOpUtilsController.set('isliscenceNotViolated',false);//No I18N
                $('#liscenceWarning1').removeClass("style1");
                $('#liscenceWarning3').removeClass("style1");
                $('#liscenceWarning').removeClass("style1");
                $('#warningicon0').addClass("failure");
                $('#warningicon1').addClass("failure");
                $('#warningicon').addClass("failure");
                $('#liscenceWarning1').show();
                $('#liscenceWarning3').show();
                $('#addsubnetbtn').prop("disabled", true);//No I18N
                $('#addsubnetbtn').css("cursor", 'not-allowed');//No I18N
                $('#approvesubnetbtn').prop("disabled", true);//No I18N
                $('#approvesubnetbtn').css("cursor", 'not-allowed');//No I18N
                $('#AddIPV6SubnetBtn').prop("disabled", true);//No I18N
                $('#AddIPV6SubnetBtn').css("cursor", 'not-allowed');//No I18N
                $('#importsubnetbtn').prop("disabled", true);//No I18N
                $('#importsubnetbtn').css("cursor", 'not-allowed');//No I18N
                $('#liscenceWarning').show();
            }else if(resp.result.errorStatus=="NearExceed"){//No I18N
                msg=Ember.I18n.t('opu.ipam.LICENSE_LIMIT_EXCEED_WARNING', { param0:resp.result.managedCount,param1:"sales@manageengine.com" },this);//No I18N
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg1',msg);//No I18N
                OPMClient.InventoryOpUtilsController.set('isliscenceNotViolated',false);//No I18N
                $('#warningicon0').removeClass("failure");
                $('#warningicon1').removeClass("failure");
                $('#warningicon').removeClass("failure");
                $('#liscenceWarning').addClass("style1");
                $('#liscenceWarning1').addClass("style1");
                $('#liscenceWarning3').addClass("style1");
                $('#liscenceWarning').show();
                $('#liscenceWarning1').show();
                $('#liscenceWarning3').show();
            }
        }
        else{
            OPMClient.InventoryOpUtilsController.set('isliscenceNotViolated',false);//No I18N
            $('#liscenceWarning').hide();
            $('#liscenceWarning1').hide();
            $('#liscenceWarning3').hide();
        }    
}
function checkOputilsLiscenceAddSwitch(){

    var url = window.OPM.apiUrlPattern + "/oputilsadmin/checkForSPMLicense";//No I18N
    var resp = opm_ajaxGetResponse(url);
    var url1 = window.OPM.apiUrlPattern + "/oputilsadmin/getInventoryTotalCounts?hzTabName=SPM";//No I18N
    var resp1 = opm_ajaxGetResponse(url1);
    var tab = $("input[name='AddSwitch']:checked"). val();
    if(resp.result!=undefined){
        if(resp.result.errorStatus=="FreeVersion"){//No I18N
            msg=Ember.I18n.t('opu.ipam.NEED_ADDITIONAL_LICENSE_FOR_OPUTILS', { param0:Ember.I18n.t('webclient.action.switchport.header'),param1:"sales@manageengine.com" },this);//No I18N
            $('#liscenceWarning').removeClass("style1");
            $('#warningicon').addClass("failure");
            $('#liscenceWarning').show();
            if(tab==='addbyManual'){
                if(resp1.result[0].count>='1'){
                    msg=Ember.I18n.t('opu.ipam.RESTRICTION_OF_FREE_SPM_LICENSE',this);//No I18N
                    if(OPMClient.ApplicationController.isProbe){
                        msg=msg+' '+Ember.I18n.t('opu.common.PROBE_LICENSE_INFORMATION', { param0:Ember.I18n.t('opu.views.PORT')},this);
                    }
                    $('#spmaddmanualbtn').prop("disabled", true);//No I18N
                    $('#spmaddmanualbtn').css("cursor", 'not-allowed');//No I18N
                    $('#liscenceWarning').show();
                }else{
                    $('#liscenceWarning').hide();
                }
            }
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
            $('#spmimportbtn').prop("disabled", true);//No I18N
            $('#spmimportbtn').css("cursor", 'not-allowed');//No I18N
            $('#spmdiscoverbtn').prop("disabled", true);//No I18N
            $('#spmdiscoverbtn').css("cursor", 'not-allowed');//No I18N
        }else if(resp.result.errorStatus=="Exceeded"){//No I18N
            msg=Ember.I18n.t('opu.spm.LINCESE_LIMIT_EXCEED', { param0:resp.result.licensedCount,param1:resp.result.managedCount },this);//No I18N
            if(resp.result.licensedCount===51){
                msg=Ember.I18n.t('opu.spm.LINCESE_NFA_LIMIT_EXCEED', { param0:resp.result.managedCount,param1:50 },this);//No I18N
            }
            if(OPMClient.ApplicationController.isProbe){
                msg=msg+' '+Ember.I18n.t('opu.common.PROBE_LICENSE_INFORMATION', { param0:Ember.I18n.t('opu.views.PORT')},this);
            }
            OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
            $('#spmaddmanualbtn').prop("disabled", true);//No I18N
            $('#spmaddmanualbtn').css("cursor", 'not-allowed');//No I18N
            $('#spmimportbtn').prop("disabled", true);//No I18N
            $('#spmimportbtn').css("cursor", 'not-allowed');//No I18N
            $('#spmdiscoverbtn').prop("disabled", true);//No I18N
            $('#spmdiscoverbtn').css("cursor", 'not-allowed');//No I18N
            $('#liscenceWarning').removeClass("style1");
            $('#warningicon').addClass("failure");
            $('#liscenceWarning').show();
        }else if(resp.result.errorStatus=="FreeVersionInNFA"){//No I18N
            msg=Ember.I18n.t('opu.ipam.NEED_ADDITIONAL_LICENSE_FOR_OPUTILS', { param0:Ember.I18n.t('webclient.action.switchport.header'),param1:"sales@manageengine.com" },this);//No I18N
            $('#liscenceWarning').removeClass("style1");
            $('#warningicon').addClass("failure");
            $('#liscenceWarning').show();
            if(tab==='addbyManual'){
                if(resp.result.managedCount>35){
                    msg=Ember.I18n.t('opu.spm.NFA_FREE_LICENSE_NEAR_EXCEED', { param0:resp.result.managedCount,param1:50 },this);//No I18N
                    OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                    $('#liscenceWarning').addClass("style1");
                    $('#warningicon').removeClass("failure");
                    $('#liscenceWarning').show();
                }else{
                    $('#liscenceWarning').hide();
                }
            }
            OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
            $('#spmimportbtn').prop("disabled", true);//No I18N
            $('#spmimportbtn').css("cursor", 'not-allowed');//No I18N
            $('#spmdiscoverbtn').prop("disabled", true);//No I18N
            $('#spmdiscoverbtn').css("cursor", 'not-allowed');//No I18N
        }else if(resp.result.errorStatus=="NearExceed"){//No I18N
            msg=Ember.I18n.t('opu.spm.LICENSE_LIMIT_EXCEED_WARNING', { param0:resp.result.managedCount,param1:"sales@manageengine.com" },this);//No I18N
            OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
            $('#liscenceWarning').addClass("style1");
            $('#warningicon').removeClass("failure");
            $('#liscenceWarning').show();
        }
    }
    else{
        $('#liscenceWarning').hide();
    }
    
}
function checkOputilsLiscenceAddDHCP(){

        var url = window.OPM.apiUrlPattern + "/oputilsadmin/checkForIPAMLicense";//No I18N
        var resp = opm_ajaxGetResponse(url);
        var msg='';
        if(resp.result!=undefined){
            if(resp.result.errorStatus=="FreeVersion"){
                msg=Ember.I18n.t('opu.ipam.NEED_ADDITIONAL_LICENSE_FOR_OPUTILS', { param0:Ember.I18n.t('opu.tools.IP_ADDRESS_MANAGER'),param1:"sales@manageengine.com" },this);//No I18N
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                $('#opuAddDHCPbtn').prop("disabled", true);//No I18N
                $('#opuAddDHCPbtn').css("cursor", 'not-allowed');//No I18N
                $('#liscenceWarning').removeClass("style1");
                $('#warningicon').addClass("failure");
                $('#liscenceWarning').show();
            }else if(resp.result.errorStatus=="Exceeded"){//No I18N
                msg=Ember.I18n.t('opu.common.IPADDRESS_LICENSE_LIMIT_EXCEEDED_MSG', { param0:resp.result.licensedCount,param1:resp.result.managedCount },this);//No I18N
                if(OPMClient.ApplicationController.isProbe){
                    msg=msg+' '+Ember.I18n.t('opu.common.PROBE_LICENSE_INFORMATION', { param0:Ember.I18n.t('opu.views.IP_ADDRESS')},this);
                }
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                $('#opuAddDHCPbtn').prop("disabled", true);//No I18N
                $('#opuAddDHCPbtn').css("cursor", 'not-allowed');//No I18N
                $('#liscenceWarning').removeClass("style1");
                $('#warningicon').addClass("failure");
                $('#liscenceWarning').show();
            }else if(resp.result.errorStatus=="NearExceed"){//No I18N
                msg=Ember.I18n.t('opu.ipam.LICENSE_LIMIT_EXCEED_WARNING', { param0:resp.result.managedCount,param1:"sales@manageengine.com" },this);//No I18N
                OPMClient.InventoryOpUtilsController.set('liscenceWarningMsg',msg);//No I18N
                $('#warningicon').removeClass("failure");
                $('#liscenceWarning').addClass("style1");
                $('#liscenceWarning').show();
            }
        }
        else{
            $('#liscenceWarning').hide();
        }
    
}
function filterContentstrapreceiver()
{
    var IPList = opm_ajaxGetResponse(window.OPM.apiUrlPattern +"/tools/getTrapfilter"); //No I18n
        if(IPList!==null){
        OPMClient.SettingsTabController.set("filterIP",IPList.trapIPs);//No I18N
        OPMClient.SettingsTabController.set("filterOID",IPList.trapOID);//No I18N
        }
}

function changeManualorCsv(type){
    if(type === 'manual'){
                $('.nwmImportBtn').hide();
                $('#nwmAddByImport').hide();
                $('.nwmAddBtn').show();
                $('#nwmAddManually').show();
            }else{
                $('#nwmAddManually').hide();
                $('.nwmAddBtn').hide();
                $('#nwmAddByImport').show();
                $('.nwmImportBtn').show();
            }
    return;
}
function networkmonitorNotificationInstantlyJS(prop)
{
	if(prop==="refresh" && OPMClient.InventoryDeviceDetailsController.subFilterType==="Ping" && OPMClient.InventoryOpUtilsController.oldViewFilterType==="NetworkingTools"){
	OPMClient.Inventory.OpUtilsInventoryNetWorkMonitorSummary();
	OPMClient.Inventory.oputils_loadListViewDetails();
	}	
}
function checkScheduleNameAlreadyExist(param){
    var url = window.OPM.apiUrlPattern + "/oputilsreports/getScheduledReportList";//No I18N
    var resp = opm_ajaxGetResponse(url);
    if(resp.status!=='Failure'&&OPMClient.ReportsIPAMReportsController.scheduleReportPageHeader!==Ember.I18n.t('fwa.compliance.editSch',this)){
        var reports=resp.result.scheduledReport;
        for (i = 0; i < reports.length; i++) {
          report=reports[i];
          if(report['reports-name']===param.trim())//No I18N
          {
             return true;
          }
        }
        if(i>=reports.length){
            return false;
        }
    }
    return false;
}
function colChooserWidthScrollerForSPM(id,isspm)
{
    if(isspm==undefined || !isspm){
        $(".opm_widget_title").addClass("opUtilsWidgetHdrVisibleXY");
        //Column width size increase when less columns selected from column chooser
        if($(".opUtilsWidgetHdrVisibleXY").width() > $(".ui-jqgrid-htable").width()){
            $("#opm_DeviceSnapList"+id).jqGrid('setGridWidth',$(".opUtilsWidgetHdrVisibleXY").width()+30 ,true);
        }
    }
    if(isspm){
        $(".opm_widget_title").addClass("opUtilsWidgetHdrVisibleXY");
        //Column width size increase when less columns selected from column chooser
        if($("#opm_DeviceSnapPager"+id).width() > $("#gview_opm_DeviceSnapList"+id+" .ui-jqgrid-htable").width()){
            $("#opm_DeviceSnapList"+id).jqGrid('setGridWidth',$(".opUtilsWidgetHdrVisibleXY").width()+30 ,true);
        }
    }
    // $("#opm_DeviceSnapList"+id).closest(".opm_jqGridUI").find('.columnChooserBtn').remove();
    $("#opm_DeviceSnapList"+id+"_colChooserIndex").addClass("columnChooserBtn");
    $('.columnChooserBtn').detach().appendTo($("#opm_DeviceSnapList"+id).closest(".opm_jqGridUI"));//No I18N
    setTimeout(function(){
        if($('.ipam').hasClass('ipamGrid')){
            $('.columnChooserBtn').css('cssText', 'background:#eee !important;width:30px;height:31px;position:absolute;top:42px;right:0px'); 
        }else{
            $('.columnChooserBtn').css('cssText', 'background:rgb(248, 245, 245) !important;width:30px;height:31px;position:absolute;top:44px;right:0'); 
        }
    },100)
}

function AddIPv6SubnetFromSnapshot(route,param,type){
    OPMClient.InventoryOpUtilsController.ipv6AddGlobPrefixOrSubnet=type;
    if(window.OPM.currentView.name!=="Inventory.Device.index"){
        redirectToSnapshot('IPAMSubnetGroupSummary','GROUP_0',undefined,true);//No I18N
        var timeout=2000;
        if(window.OPM.isMSPCentral && param=='IPv6'){//route render issues in MSP
            timeout=3500;
        }
        setTimeout(function(){
            opmGlobalRoute.transitionTo(route,param);
        },timeout);
    }else{
        opmGlobalRoute.transitionTo(route,param);
    }
}
function reloadSPMSwitchesListbyGroup(){
    if(window.OPM.currentView.name==="Inventory.Device.index"){
        OPMClient.Inventory.getIPAMSPMTreeView("SPM");//NO I18N
        reloadSnapshotPage();
    }
    else{
        var selectedGroup = OPMClient.InventoryOpUtilsController.selectedTreeNodeId;
        var params="";
        if(selectedGroup !=="" && selectedGroup !== "SPMGROUP_0" && selectedGroup.indexOf("SWITCH_") === -1){
            params="&subfilter=byGroup&byGroup="+selectedGroup.split("_")[1]+"&groupId="+selectedGroup;//NO I18N
        }
        OPMClient.Inventory.oputils_loadListViewDetails(params);
    }
}

function headerScroll(){
    setTimeout(function(){
    	var didScroll, lastScrollTop=0, delta=5, navbarHeight=$('#header').outerHeight();
    	$('.DIA-Content').scroll(function(event){ didScroll=true; });
    	setInterval(function(){ if(didScroll){ hasScrolled();didScroll=false; } },250);
    	function hasScrolled(){
    		var st=$('.DIA-Content').scrollTop();
    		if(Math.abs(lastScrollTop-st)<=delta){
    			return;
    		}
    		if(st>lastScrollTop&&st>navbarHeight){
    			$('html').removeClass('showMainTopBand').addClass('hideMainTopBand');
    		}else{
    			if(st+$(window).height()<$('#inventoryGridStyle')[0].scrollHeight){
    				$('html').removeClass('hideMainTopBand').addClass('showMainTopBand');
    			}
    		}
    	lastScrollTop=st;
    	}
    },2000);
}
function GotoAssociateDHCP(pageURL){
    if ($("#associateDHCPAlert").is(":visible")){
        $("#associateDHCPAlert").hide();
        $("#associateDHCPAlert").dialog( "close" );
    }
    var params = pageURL.split('_')
    var timeout = 1000;
    if(window.OPM.isMSPCentral){
        timeout = 10000;
    }
    if(window.OPM.currentView.name!=="Inventory.Device.index"){
        if(params[1] =="AssociateDHCP"){
            redirectToSnapshot('DHCPSummary', 'GROUP_3',undefined,true);//No I18N
        }
        OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N 
        setTimeout(function(){
            if(params[1] =="AssociateDHCP"){
                getAllDHCPServersList();
                opmGlobalRoute.transitionTo('Inventory.Device.AssociateDHCP');//No I18N
            }
        },timeout);
    }else{
        redirectToSnapshot('DHCPSummary', 'GROUP_3',undefined,true);//No I18N
        setTimeout(function(){
            if(params[1] =="AssociateDHCP"){
                getAllDHCPServersList();
                opmGlobalRoute.transitionTo('Inventory.Device.AssociateDHCP');//No I18N
            }
        },timeout);
    }
}
function GotoAddSubnetorDHCP(pageURL){
    var params = pageURL.split('_')
    if(window.OPM.currentView.name!=="Inventory.Device.index"){
        if(params[0]=="Subnets" || params[0]=="DHCP"){
            redirectToSnapshot('IPAMSubnetGroupSummary', 'GROUP_0',undefined,true);//No I18N
            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N 
            setTimeout(function(){
                if(params[0]=="DHCP"){
                    opmGlobalRoute.transitionTo('Inventory.Device.AddDHCP');//No I18N
                }else{
                    opmGlobalRoute.transitionTo('Inventory.Device.AddSubnet','IPv4');//No I18N
                }
            },1000);
        }
    }else{
        if(params[0]=="DHCP"){
            opmGlobalRoute.transitionTo('Inventory.Device.AddDHCP');//No I18N
        }else{
            opmGlobalRoute.transitionTo('Inventory.Device.AddSubnet','IPv4');//No I18N
        }  
        
    }
}


function redirectIPsListPage(filter,isSubnet){
    OPMClient.InventoryOpUtilsController.set('isBargraph',isSubnet);//No I18N
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/IPs/"+filter+"/"+OPMClient.InventoryDeviceDetailsController.deviceName; //No I18N                       
}
function redirectPortsListPage(filter,isSwitch){
    OPMClient.InventoryOpUtilsController.set('isBargraph',isSwitch);//No I18N
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/Ports/"+filter+"/"+OPMClient.InventoryDeviceDetailsController.deviceName; //No I18N                     
}
function opuDiscoverMerakiSwitches(){
     if(window.OPM.isOPUtils){
        opmGlobalRoute.transitionTo('Settings.OpUtils.Meraki.AddMeraki');//No I18N
    }else{
        opmGlobalRoute.transitionTo('Settings.Discovery.AddMeraki');//No I18N
    }
}
function addCiscoACISwitch(){
     if(window.OPM.isOPUtils){
        opmGlobalRoute.transitionTo('Settings.OpUtils.ACI.AddCiscoACI');//No I18N
    }else{
        opmGlobalRoute.transitionTo('Settings.Discovery.AddCiscoACI');//No I18N
    }
}
function AddSwitchFromSnapshot(option){
    opmGlobalRoute.transitionTo('Inventory.Device.AddSwitch');//No I18N
    setTimeout(function(){
        $("#"+option).click();
    },100);
}

function enableIPAMAddonLicense(tool){
    var resp=opm_ajaxPostRequest(window.OPM.apiUrlPattern+"/oputilsadmin/enableOpUtilsAddOnLicense"); //No I18n
    if(resp.status==="Success"){
        opm_infoMsgs("successMsg",Ember.I18n.t("fwa.compliance.Update_Successful",this)); //No I18N
        setTimeout(function(){
            if(tool === "SPM"){
            location.href=window.OPM.apiclientUrl + "Inventory/List/OpUtils/Switches";
            }else{
            location.href=window.OPM.apiclientUrl + "Inventory/List/OpUtils/Subnets";
            }
            window.location.reload();
        },300);
    }else{
        opm_infoMsgs("errorMsg",resp.message); //No I18N
    }
}

function enableIPAMModule(tool){
	var resp=opm_ajaxPostRequest(window.OPM.apiUrlPattern+"/oputilsadmin/updateIPAMSettings?enableIPAMModule=true"); //No I18n
	if(resp.status==="Success"){
		opm_infoMsgs("successMsg",Ember.I18n.t("fwa.compliance.Update_Successful",this)); //No I18N
		setTimeout(function(){
			if(tool === "SPM"){
				location.href=window.OPM.apiclientUrl + "Inventory/List/OpUtils/Switches"; //No I18N
			}
			/*else{
				location.href=window.OPM.apiclientUrl + "Inventory/List/OpUtils/Subnets";
			}*/	
			window.location.reload();
		},300);
	}else{
		opm_infoMsgs("errorMsg",resp.message); //No I18N
	}
}

function showNMAPOptions(){
    slideIn(1);//No I18N
    OPMClient.SettingsOpUtilConfigController.set("opu_slideHeader",Ember.I18n.t('webClient.slidehead.nmap',this));//No I18N
    $(document).keydown(function(e){
    if(e.keyCode == 27){
        slideOut(5);
    }
    });
    $("#NMAPScanOptions").show();//No I18N
    $("#NMAPScanSettingsDiv").show();//No I18N
    var url = window.OPM.apiUrlPattern + "/ipam/configureNmapScanOptions";//No I18N
    var response = opm_ajaxPostRequest(url);
    var jsonData = response.result.options;
    $('#nmaprttValue').val(response.result.IPAM_MIN_RTT_VALUE);
    var colNames = [Ember.I18n.t('webclient.devices.snapshot.options',this),Ember.I18n.t('opu.common.ENABLE',this),""];
    var colModel = [{name: 'description', index: 'description',width:60,formatter:nmapscanoptionsDesc,title:false}, //No I18N
                    {name: 'isEnabled', index: 'isEnabled',formatter:nmapScanAction,width:20}, //No I18N
                    {name: 'optionName', index: 'optionName', hidden:true}]; //No I18N
    var defaultOptions ={'sortName': 'description', 'sortOrder': 'asc'};//No I18N
	$("#nmapScanOptionsList").jqGrid('GridUnload');
    opm_loadJQgridWithData("#nmapScanOptionsList",jsonData,colNames,colModel,"","","",defaultOptions);//No I18N
    $("#nmapScanOptionsList").jqGrid('setGridWidth',$("#NMAPScanOptions").width()-45);
}
function savenmapScanOptions()
{
    url = window.OPM.apiUrlPattern + "/ipam/configureNmapScanOptions";//No I18N
    params={};
    params.EXCLUDE_ECHO_REQUEST=$('#NMAPOPT_EXCLUDE_ECHO_REQUEST').prop("checked");
    params.USE_SYSTEM_DNS=$('#NMAPOPT_USE_SYSTEM_DNS').prop("checked");
    params.DISABLE_ARP_PING=$('#NMAPOPT_DISABLE_ARP_PING').prop("checked");
	params.LINUX_DATA_DIR=$('#NMAPOPT_LINUX_DATA_DIR').prop("checked");
	params.IP_FORWARD_MIB=$('#NMAPOPT_SUBNET_DISC_IP_FORWARD_MIB').prop("checked");
    
    if($('#nmaprttValue').val()!==""||$('#nmaprttValue').val()!==null){
        params.IPAM_MIN_RTT_VALUE=$('#nmaprttValue').val();
    }
    var calb = function(response){
        if(response.status === "Success"){
            var msg=Ember.I18n.t("opu.common.YOUR_CHANGES_HAVE_BEEN_SAVED",this);//No I18N
            opm_infoMsgs("successMsg",msg);//No I18N
            slideOut(1);
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
    };
    var rsp = opm_ajaxPostRequestWithMsg(url, params,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}
function restoreDefaultNmap()
{
    url = window.OPM.apiUrlPattern + "/ipam/configureNmapScanOptions";//No I18N
    params={};
    params.resetScanOptions=true;
    var calb = function(response){
        if(response.status === "Success"){
            var msg=Ember.I18n.t("opu.common.YOUR_CHANGES_HAVE_BEEN_SAVED",this);//No I18N
            opm_infoMsgs("successMsg",msg);//No I18N
            slideOut(1);
        }else if(response.status === "Failure"){//NO I18N
            opm_infoMsgs("errorMsg",response.message);//No I18N
        }
    };
    var rsp = opm_ajaxPostRequestWithMsg(url, params,Ember.I18n.t("opu.common.PROCESSING_PL_WAIT",this),calb);//No I18N
}

function scanSwitches(snapid,widgetIndex,wid,ids){
    if(ids==undefined){
        ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"config-id");//No I18N
    } 
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        return;
    }
    var url = window.OPM.apiUrlPattern + "/spm/scanSwitches";//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            /*
            if(wid==undefined){
                reloadSnapWidgets(widgetIndex, true);
            }
            else{
                OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
                reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID)
            }*/
            opm_infoMsgs("successMsg",msg); //No I18N
        }
    }
    opm_ajaxPostRequestWithMsg(url, {"CONFIG_ID":ids,"wsId":sessionStorage.getItem("wsId")}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}
function deleteSwitches(snapid,widgetIndex){
    var ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"config-id");//No I18N
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('opu.client.SELECT_ONE_ROW_DELETE', this)); //No I18N
        return;
    }

    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            reloadSnapWidgets(widgetIndex, true);
            OPMClient.Inventory.getIPAMSPMTreeView("SPM");//NO I18N
            opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
        }
    }
    if(confirm(Ember.I18n.t('opu.spm.DELETE_CONFORMATION',this))){
        var url =window.OPM.apiUrlPattern + "/spm/deleteSwitches";//NO I18N
        opm_ajaxPostRequestWithMsg(url, {"configID":ids}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }
}
function editSwitches(snapid,widgetIndex){
    var ids= getEmberSelectedRows("opm_DeviceSnapList"+snapid,"config-id");//No I18N
    if(ids === undefined || ids === ""){
        alert(Ember.I18n.t('webclient.select.onedevice', this)); //No I18N
        return;
    }
    idsArr=ids.split(',');//No I18N
    OPMClient.InventoryOpUtilsController.set('widgetId','opm_DeviceSnapList'+snapid);//No I18N
    OPMClient.InventoryOpUtilsController.set('snapIndex',widgetIndex);//No I18N
    if(idsArr.length>1){
        opmGlobalRoute.transitionTo('Inventory.Device.EditSwitches');//No I18N   
    }else{
        var switches= getEmberSelectedRows("opm_DeviceSnapList"+snapid,'switch-name');//No I18N
        var sdetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/spm/getSwitchSummary?switchIP='+switches+'&isNeedGroup=true');//No I18N
        OPMClient.InventoryOpUtilsController.switchDetails=sdetails.result;
        opmGlobalRoute.transitionTo('Inventory.Device.EditSwitch');//No I18N
    }
}

function editSwitch(swtch,wid){
    OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    var sdetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/spm/getSwitchSummary?switchIP='+swtch+'&isNeedGroup=true');//No I18N
    OPMClient.InventoryOpUtilsController.switchDetails=sdetails.result;
    opmGlobalRoute.transitionTo('Inventory.Device.EditSwitch');//No I18N
}

function scanSwitch(configId,wid){
    var url = window.OPM.apiUrlPattern + "/spm/scanSwitches";//No I18N
    msg=Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this);//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
            reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID)
            opm_infoMsgs("successMsg",msg); //No I18N
        }
    }
    opm_ajaxPostRequestWithMsg(url, {"CONFIG_ID":configId,"wsId":sessionStorage.getItem("wsId")}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}

function opu_SwitchScanColorIcon(cellValue, options, rowdata, action){
    var status = rowdata['scan-status-int'];//No I18N
    var switchstatus = rowdata["scan-status"];//NO I18N
    var spmstatusclass = "icon-status1";//No I18N
    if(status == "2"){
        spmstatusclass = "icon-status5";// No I18N
    }
    var inprogressdiv = '<div class="opmLoading-circle"><div class="opmLoading-circle1 opmLoading-circle"></div> <div class="opmLoading-circle2 opmLoading-circle"></div> <div class="opmLoading-circle3 opmLoading-circle"></div> <div class="opmLoading-circle4 opmLoading-circle"></div> <div class="opmLoading-circle5 opmLoading-circle"></div> <div class="opmLoading-circle6 opmLoading-circle"></div> <div class="opmLoading-circle7 opmLoading-circle"></div> <div class="opmLoading-circle8 opmLoading-circle"></div> <div class="opmLoading-circle9 opmLoading-circle"></div> <div class="opmLoading-circle10 opmLoading-circle"></div> <div class="opmLoading-circle11 opmLoading-circle"></div> <div class="opmLoading-circle12 opmLoading-circle"></div></div>';//NO I18N
    if(status == "2"){//scanned
       return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog" style="display:none;">'+inprogressdiv+'<span></span></div><div class="DHCPstatusIcon ipamwaitingquestatus" style="display:none;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span></span></div><div style="display: block;"  class="hideTooltip spmstatuscomp"><i class="icon-status5"></i> <span>'+Ember.I18n.t('opu.common.SCANNED', this)+'</span></div>';//No I18N
    }else if(status=="1"){// in prograss
        return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog"  style="display:block;">'+inprogressdiv+'<span>'+Ember.I18n.t('opu.common.IN_PROGRESS', this)+'</span></div><div class="DHCPstatusIcon ipamwaitingquestatus" style="display:none;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span></span></div><div style="display: none;" class="spmstatuscomp"><i class="icon-status5"></i> <span></span></div>';//No I18N
    }else if(status =="6"){//Waiting in queue.
        return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog" style="display:none;">'+inprogressdiv+'<span></span></div><div class="hideTooltip DHCPstatusIcon ipamwaitingquestatus" style="display:block;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span>'+Ember.I18n.t('opu.common.WAITING_QUE', this)+'</span></div><div style="display: none;" class="spmstatuscomp"><i class="icon-status5"></i> <span></span></div>';//No I18N
    }else{//failed or Not started
        return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog" style="display:none;">'+inprogressdiv+'<span></span></div><div class="DHCPstatusIcon ipamwaitingquestatus" style="display:none;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span></span></div><div style="display: block;" class="spmstatuscomp"><i class="'+spmstatusclass+'"></i> <span>'+switchstatus+'</span></div>';//No I18N
    }
}

function opu_adScanStatus(cellValue,options,rowdata,action){
    var status = rowdata['scan-status'];//No I18N
    if(status === "2"){
       return "<i class='icon-status5'></i> "+Ember.I18n.t('opu.common.SCANNED', this);//No I18N
    }else if(status === "3"){
       return "<i class='icon-status1'></i> "+Ember.I18n.t('webclient.credential.snmp.failed', this);//No I18N
    }else if(status === "4" || status === "0"){
       return "<i class='icon-status3'></i> "+Ember.I18n.t('opu.common.Yet_to_scan', this);//No I18N
    }else if(status === "1"){
       return "<div class='relative pl-xl'>"+'<div class="opmLoading-circle"><div class="opmLoading-circle1 opmLoading-circle"></div> <div class="opmLoading-circle2 opmLoading-circle"></div> <div class="opmLoading-circle3 opmLoading-circle"></div> <div class="opmLoading-circle4 opmLoading-circle"></div> <div class="opmLoading-circle5 opmLoading-circle"></div> <div class="opmLoading-circle6 opmLoading-circle"></div> <div class="opmLoading-circle7 opmLoading-circle"></div> <div class="opmLoading-circle8 opmLoading-circle"></div> <div class="opmLoading-circle9 opmLoading-circle"></div> <div class="opmLoading-circle10 opmLoading-circle"></div> <div class="opmLoading-circle11 opmLoading-circle"></div> <div class="opmLoading-circle12 opmLoading-circle"></div></div>'+Ember.I18n.t('opu.common.IN_PROGRESS', this)+"</div>";
    }else{
        return status;
    }
}

function opu_unknowMac_url(cellValue,options,rowdata,action){
    var mac=rowdata['mac-address'];//No I18N
    var text=mac;
    if(mac=="")
    {
        text=Ember.I18n.t('webclient.common.unknown', this);//No I18N
        return "<a href='https://pitstop.manageengine.com/portal/en/kb/articles/switch-port-mapper-does-not-display-the-associated-ip-for-mac-addresses' target='_blank' style='color:#0099ff'>"+text+"</a>";
    }else{
        return text;
    }
}
function opu_SubnetScanColorIcon(cellValue, options, rowdata, action){
    var status = rowdata['scan-status-int'];//No I18N

    var statusValue = rowdata["scan-status"];//NO I18N
    var spmstatusclass = "icon-status1";//No I18N
    if(status == "2"){
        spmstatusclass = "icon-status5";// No I18N
    }
    var inprogressdiv = '<div class="opmLoading-circle"><div class="opmLoading-circle1 opmLoading-circle"></div> <div class="opmLoading-circle2 opmLoading-circle"></div> <div class="opmLoading-circle3 opmLoading-circle"></div> <div class="opmLoading-circle4 opmLoading-circle"></div> <div class="opmLoading-circle5 opmLoading-circle"></div> <div class="opmLoading-circle6 opmLoading-circle"></div> <div class="opmLoading-circle7 opmLoading-circle"></div> <div class="opmLoading-circle8 opmLoading-circle"></div> <div class="opmLoading-circle9 opmLoading-circle"></div> <div class="opmLoading-circle10 opmLoading-circle"></div> <div class="opmLoading-circle11 opmLoading-circle"></div> <div class="opmLoading-circle12 opmLoading-circle"></div></div>';//NO I18N
    if(status == "2"){
       // return "<i class='icon-status5'></i> "+rowdata['scan-status'];//No I18N
       return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog" style="display:none;">'+inprogressdiv+'<span></span></div><div class="DHCPstatusIcon ipamwaitingquestatus" style="display:none;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span></span></div><div style="display: block;"  class="hideTooltip spmstatuscomp"><i class="icon-status5"></i> <span>'+Ember.I18n.t('opu.common.SCANNED', this)+'</span></div>';//No I18N
    }else if(status=="1"){
        return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog"  style="display:block;">'+inprogressdiv+'<span>'+Ember.I18n.t('opu.common.IN_PROGRESS', this)+'</span></div><div class="DHCPstatusIcon ipamwaitingquestatus" style="display:none;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span></span></div><div style="display: none;" class="spmstatuscomp"><i class="icon-status5"></i> <span></span></div>';//No I18N
    }else if(status=="0"){
        return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog" style="display:none;">'+inprogressdiv+'<span></span></div><div class="DHCPstatusIcon ipamwaitingquestatus" style="display:none;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span></span></div><div style="display: none;" class="spmstatuscomp"><i class="icon-status5"></i> <span></span></div><div class = "DHCPstatusIcon ipamnotstarted"  style="display:block;"><i class="icon-status3"></i><span>'+Ember.I18n.t('opu.common.NOT_STARTED', this)+'</span></div>';//No I18N
    }
    else{//value 4- Waiting in que.
        return '<div class="DHCPstatusIcon DHCPstatusInProgress spmstatusinprog" style="display:none;">'+inprogressdiv+'<span></span></div><div class="hideTooltip DHCPstatusIcon ipamwaitingquestatus" style="display:block;" ><em class="waiting svgIcon size16"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#wait"/></svg></em><span>'+Ember.I18n.t('opu.common.WAITING_QUE', this)+'</span></div><div style="display: none;" class="spmstatuscomp"><i class="icon-status5"></i> <span></span></div>';//No I18N
    }
}

function opu_forecastingStatusFormatter(cellValue, options, rowdata, action){
    if(cellValue === true || cellValue === "true"){
        return Ember.I18n.t('webclient.admin.scheduledt.enabled',this);//No I18N
    }
    return Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//No I18N
}

function slideOutAndUnload(){
    slideOut(10);
    $("#macAddressTable").jqGrid('GridUnload');//No I18N
}

function scanStatusIcon(cellValue, options, rowdata, action){
    var classColor = "iconStatusRed";//No I18N
    var val =rowdata["scan-status-int"];//No I18N
    if(val === 2 || val === "2"){
        classColor = "iconStatusYellow";//NO I18N
    }else if(val === 5 || val === "5"){
        classColor = "iconStatusGreen";//NO I18N
    }
    return "<i class='iconStatusColor "+classColor+"' title='"+cellValue+"'></i>"+cellValue;
}

function operationalStatusIcon(cellValue, options, rowdata, action){
    var classColor = "statusDownIcon";//NO I18N
    var val =rowdata['operational-status-int'];//No I18N
    if(val === 1 || val === "1"){
        classColor = "statusUpIcon";//NO I18N
    }
    return "<i class='"+classColor+"' title='"+cellValue+"'></i> "+cellValue;
}

function showHideReportHeaderEventsOputils(hdrClass,isClose){
    if(isClose){
        $('.'+hdrClass).removeClass('active').parent().find('ul').css({display:'none',opacity:'0',top:'0'});//No I18N
    }else{
        if($('.'+hdrClass).hasClass('active') ) {
            $('.'+hdrClass).removeClass('active').parent().find('ul').css({display:'none',opacity:'0',top:'0'});//No I18N
        }
        else{
            $('.'+hdrClass).addClass('active').parent().find('ul').css({display:'block'}).animate({opacity:'1',top:'35px'},300);//No I18N
        }
    }
}


function closeOpenTreeMenu(operation,id){
    if(id==undefined){
        id= OPMClient.InventoryOpUtilsController.toggleId;
    }
    if(operation==="close"){
        $('body').addClass('noFilterSectionOputils');//No I18N
        $("#filterSectionOputils").show();
        if(OPMClient.InventoryOpUtilsController.toggleId==="filterIcon"){
            $(".oputilsSnapshot .ui-jqgrid").width($("#OPUSnapshotDeviceListDiv").width());
            $(".oputilsSnapshot .ui-jqgrid-view").width($("#OPUSnapshotDeviceListDiv").width());
            $(".oputilsSnapshot .ui-jqgrid-pager").width($("#OPUSnapshotDeviceListDiv").width());
            $(".oputilsSnapshot .ui-jqgrid-hdiv").width($("#OPUSnapshotDeviceListDiv").width());
            $(".oputilsSnapshot .ui-jqgrid-hdiv .ui-jqgrid-htable").width($("#OPUSnapshotDeviceListDiv").width());
            $(".oputilsSnapshot .ui-jqgrid-bdiv").width($("#OPUSnapshotDeviceListDiv").width());
            $(".oputilsSnapshot .ui-jqgrid .ui-jqgrid-view .ui-jqgrid-bdiv table").width($("#OPUSnapshotDeviceListDiv").width());
        }else{
            $(".oputilsSnapshot .ui-jqgrid").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .ui-jqgrid-view").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .ui-jqgrid-pager").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .ui-jqgrid-hdiv").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .ui-jqgrid-hdiv .ui-jqgrid-htable").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .ui-jqgrid-bdiv").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .ui-jqgrid .ui-jqgrid-view .ui-jqgrid-bdiv table").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".oputilsSnapshot .columnChooserBtn").css('right','8px');//No I18N
        }
    }else if(operation==="open"){//No I18N
        $('body').removeClass('noFilterSectionOputils');//No I18N
        $("#filterSectionOputils").hide();
        if(id==="filterIcon"){
            OPMClient.Inventory.oputils_ClearFiltersList();
            $(".subFilter").empty();
            $(".mainFilter").empty();
            $("#filterDataBy").hide();
            $("#OPUSnapshotDeviceListDiv").removeClass('filterDataByActive');//No I18N
        }
        closeOpenFilterOption(id)
        $(".columnChooserBtn").css('right','0px');//No I18N
        if(OPMClient.InventoryOpUtilsController.toggleId!=="filterIcon"){
            $(".ui-jqgrid").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".ui-jqgrid-view").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".ui-jqgrid-pager").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".ui-jqgrid-hdiv").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".ui-jqgrid-hdiv .ui-jqgrid-htable").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".ui-jqgrid-bdiv").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".ui-jqgrid .ui-jqgrid-view .ui-jqgrid-bdiv table").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
            $(".columnChooserBtn").css('right','8px');//No I18N
        }
    }
}

function closeOpenFilterOption(id){
    OPMClient.InventoryOpUtilsController.set('toggleId',id);//No I18N
    if(id==="treeViewIcon"){
        $(".DI-Content").show();
        $(".DI-Header").show();
        $("#ListPage").hide();
        $("#filterIcon").removeClass("active");//No I18N
        $("#filterby").css("display", "none");//NO I18N
        $("#treeViewIcon").addClass('active');//No I18N
        $("#treeFilterOputils").css("display", "block");//NO I18N
        $(".treeFilter").css("display", "block");//NO I18N
        $(".oputilsSnapshot .ui-jqgrid").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .ui-jqgrid-view").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .ui-jqgrid-pager").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .ui-jqgrid-hdiv").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .ui-jqgrid-hdiv .ui-jqgrid-htable").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .ui-jqgrid-bdiv").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .ui-jqgrid .ui-jqgrid-view .ui-jqgrid-bdiv table").width($(".ui-jqgrid").closest(".opm_jqGridUI").width()-10);
        $(".oputilsSnapshot .columnChooserBtn").css('right','8px');//No I18N
        reloadSnapshotPage();
        OPMClient.Inventory.oputils_ClearFiltersList();
        $(".subFilter").empty();
        $(".mainFilter").empty();
        $("#filterDataBy").hide();
        $("#oputree").jstree("search","");
        $("#searchIPAM").val("");
        $("#OPUSnapshotDeviceListDiv").removeClass('filterDataByActive');//No I18N
    }else if(id==="filterIcon"){//No I18N
        //Hide Donut view for scope user
        if(OPMClient.InventoryDeviceDetailsController.filterInSnapshotType == "Ports" || !window.OPM.userPermissions.opuRestricted){
            DonutFilterView();
            $(".DI-Content").hide();
            $(".DI-Header").hide();
            $("#ListPage").show();
            $("#treeViewIcon").removeClass('active');//No I18N
            $("#treeFilterOputils").css("display", "none");//NO I18N
            $("#filterby").css("display", "block");//NO I18N
            $("#filterIcon").addClass("active");//No I18N
            filterInSnapshot(OPMClient.InventoryDeviceDetailsController.filterInSnapshotType) //No I18N
        }
    }
}

function filterInSnapshot(subFilterType){
    OPMClient.Inventory.OpUtilsInventorySubFilter(subFilterType);
    $("#OpUtilsAvaiChart").css("display", "block");//NO I18N
    $(".opm_filterBy").show();
    $(".oputilslefttab").css("display","block");
    $('#BarHolderInvent').removeClass("active");//NO I18N
    if(subFilterType==="IPs"){//No I18N
        OPMClient.Inventory.OpUtilsInventoryIPAddressSummary();
        // $("#ListPageHeader").text(Ember.I18n.t('webclient.snapshot.name.IPs', this));//No I18N
    }else if(subFilterType==="Ports"){//No I18N
        // $("#ListPageHeader").text(Ember.I18n.t('opu.spm.Ports', this));//No I18N
        OPMClient.Inventory.OpUtilsInventoryPortSummary();
    }
}
function addRouterforMACIP(){
    opmGlobalRoute.transitionTo('/Settings/OpUtils/Discovery/Router/operation','Add');//No I18N
}

function guestValidDateshow()
{
    if($('#authenticity').val() === 'Guest'){
        $('#guestValidity').show();
        $('#rogueGuestValidPeriod').datepicker({dateFormat:'yy/mm/dd', minDate: new Date(parseInt(window.OPM.jyear),parseInt(window.OPM.jmon),parseInt(window.OPM.jday))});//No I18N
       $('#rogueGuestValidPeriod').val(parseInt(window.OPM.jyear)+"/"+("0" + (parseInt(window.OPM.jmon) + 1)).slice(-2)+"/"+("0" +window.OPM.jday).slice(-2));//No I18N
    }else{
        $('#guestValidity').hide();
    }
}
function bulkApproveSubnets(snapid,widgetIndex,wid,ids){
    var arr = new Array();
    var grid = jQuery("#"+"opm_DeviceSnapList"+snapid);    //No I18N
    var selRowIds = grid.jqGrid('getGridParam','selarrrow');    //No I18N
	var subnetMaskList = getSubnetMaskList();
	var actualSubnetList = [];
    var i = 0;
    OPMClient.InventoryOpUtilsController.approveSubnetsList=[];
    if(selRowIds !== undefined){
        $.each(selRowIds, function(){
            var selDevice = {};
			var subnetMask = grid.jqGrid('getCell', this, 'subnet-mask'); //No I18N
			if(subnetMaskList.includes(subnetMask)) 														//check whether the subnetMask is in the subnetMaskList(subnetMasks that are allowed to get approved) and add it to the list.
            {
				selDevice.subnetAddress = grid.jqGrid('getCell', this, 'subnet-address'); //No I18N
				selDevice.subnetid = grid.jqGrid('getCell', this, 'subnetid'); //No I18N
				selDevice.subnetMask = subnetMask;
				arr.push(grid.jqGrid('getCell', this, 'subnet-address'));
				OPMClient.InventoryOpUtilsController.approveSubnetsList.push(selDevice);
				actualSubnetList[i] = selDevice.subnetAddress;												//Adds value of actualSubnetAddress
                i++;
			}
        });
		OPMClient.InventoryController.bulkActualSubnetAddress = actualSubnetList;							//Assigns all the actualSubnetAddress values to single variable
    }
    if(arr.length > 0){
       opm_transitionToParentRoute("Inventory.Device.BulkApprove");//No I18n
       OPMClient.InventoryOpUtilsController.set('widgetID',snapid);//No I18N
    }else{
        alert(Ember.I18n.t('opu.view.SELECT_ATLEAST_ONE_SUBNET',this));//No I18n
    }
}
function approveSubnetGridLoad(){
    var colNames = ['',Ember.I18n.t('opu.views.SUBNET_ADDRESS',this),Ember.I18n.t('opu.views.SUBNET_MASK',this),Ember.I18n.t('opu.ipv6.PARENT_NODE',this),Ember.I18n.t('opu.views.SUBNET_NAME',this),Ember.I18n.t('webclient.admin.traps.action',this)];
    var colModel = [{name: 'subnetid', index: 'subnetid',hidden:true}, //No I18N
        {name: 'subnetAddress', index: 'subnetAddress', sortable: true, sorttype: 'text',width:50}, //No I18N
        {name: 'subnetMask', index: 'subnetMask', sortable: false,width:40, formatter: getSubnetMaskSelectBox}, //No I18N
        {name: 'group-name', index: 'group-name', sortable: false,width:60, formatter: getgroupNameSelectBox}, //No I18N
        {name: 'subnet-name', index: 'subnet-name', sortable: false,width:40, formatter: getSubnetNameTextBox}, //No I18N
        {name: 'remove', index: 'remove',width:40, sortable: false,formatter:getRemoveFromApprove}];//No I18n
    opm_loadJQgridWithData("#BulkApproveSubnetsList",OPMClient.InventoryOpUtilsController.approveSubnetsList,colNames,colModel,"","","","");//No I18N 	
    $("#BulkApproveSubnetsList").jqGrid('setGridWidth',$('#BulkApproveSubnetsList').closest(".opmFormHolder").width()-30);
    $('.select2').select2();
}
function IPRequestForm(){
    var url = window.OPM.apiUrlPattern + "/ipam/getIPRequest";//NO I18N
    var colNames = [Ember.I18n.t('webclient.common.requestedby',this),Ember.I18n.t('opu.common.Total-IPs',this),Ember.I18n.t('opu.common.purpose',this),Ember.I18n.t('webclient.common.requestedon',this),Ember.I18n.t('opu.views.STATUS',this),Ember.I18n.t('opu.common.reviewed-time',this),Ember.I18n.t('opu.common.reviewed-by',this)];//NO I18N
    var colModel = [
                        //{name: 'requester-name', index: 'requester-name', width:100,sortable: true,formatter: function(cellValue, options, rowdata, action){return "<a onclick='getIPPreview(&#39;"+rowdata['request-id']+"&#39);' style='color:#0099ff'>"+cellValue+"</a>"}}, //No I18N
                        {name: 'requester-name', index: 'requester-name', width:100,sortable: true,formatter: ipRequestPreview}, //No I18N
                        {name: 'request-ip-count', index: 'request-ip-count',width:100, sortable: false,formatter: ipRequestPreview},//No I18N
                        {name: 'purpose', index: 'purpose', width:100,sortable: false,formatter: ipRequestPreview}, //No I18N
                        {name: 'request-time', index: 'request-time', width:100,sortable: false,formatter: ipRequestPreview},//No I18N
                        {name: 'status', index: 'status', width:100,sortable: false,formatter: IPRequestSeverityColorIcon}, //No I18N
                        {name: 'reviewed-time', index: 'reviewed-time', width:100,sortable: false,formatter: ipRequestPreview},//No I18N
                        {name: 'reviewedby', index: 'reviewedby',width:100, sortable: false}//No I18N
                   ];
     var dObj = {
        "id":"#IPFormList",//No I18N
        "apiUrl":url,//No I18N
        "data":"",//No I18N
        "colNamesList":colNames,//No I18N
        "colModelList":colModel,//No I18N
        "pagerId":"#IPFormPager",//No I18N
        "defaultOptions":{"multiselect":false,savePagination:true},//No I18N
        "sortByType": "desc",//NO I18N
        "sortByColumn": "request-time",//NO I18N
        "searchOption":false,//No I18N
        "minRowsPerPage":50,//No I18N
        "toggleSearch":false,//No I18N
        "gridTableId":"IPRequest"// No I18N
        };
    $("#IPFormList").jqGrid("GridUnload");
    opm_loadJqGridBasedOnCount(dObj);
    $("#IPFormList").jqGrid('setGridWidth',$('#IPFormList').closest(".opmFormHolder").width()-30);
    
}
function getIPPreview(requestId)
{
    window.location.href = window.OPM.apiclientUrl+"Reports/Reports.OpUtils/IPRequest/IPRequestPreview"; //No I18N
    var resp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/ipam/getIPRequest?RequestId="+requestId);//NO I18N
    OPMClient.InventoryOpUtilsController.ipRequestDetails.reqId = resp.rows[0]["request-id"]
    OPMClient.InventoryOpUtilsController.ipRequestDetails.userId = resp.rows[0]["user-id"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.ipCount = resp.rows[0]["request-ip-count"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.purpose = resp.rows[0]["purpose"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.status = resp.rows[0]["status"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.username = resp.rows[0]["requester-name"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.mail = resp.rows[0]["email-id"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.reqTime = resp.rows[0]["request-time"];
    var selectedIPs = resp.rows[0]["ip-address"];
    var arr = selectedIPs.split(',');
    var arrLen = 0;
    if(arr.length === 0){
        arrLen = 0
    }else{
        arrLen = arr.length;
    }
    selectedIPs = arr;
    OPMClient.InventoryOpUtilsController.ipRequestDetails.ips = selectedIPs;
    OPMClient.InventoryOpUtilsController.ipRequestDetails.preferredSubnet = resp.rows[0]["preferred-Subnet"];
    if(resp.rows[0]["remarks"] === "null")
    {
        OPMClient.InventoryOpUtilsController.ipRequestDetails.remarks = "";
    }
    else
    {
        OPMClient.InventoryOpUtilsController.ipRequestDetails.remarks = resp.rows[0]["remarks"];
    }
    if(resp.rows[0]["reviewedby"] === "null")
    {
        OPMClient.InventoryOpUtilsController.ipRequestDetails.reviewedBy = "-";
    }
    else{
        OPMClient.InventoryOpUtilsController.ipRequestDetails.reviewedBy = resp.rows[0]["reviewedby"];
    }
    
    if(OPMClient.InventoryOpUtilsController.ipRequestDetails.ips.length > 0){
        var subIP = (OPMClient.InventoryOpUtilsController.ipRequestDetails.ips).toString();
        if (subIP.indexOf(',') > -1)
        {
            var subnetLength = OPMClient.InventoryOpUtilsController.ipRequestDetails.ips.length;
            subIP = subIP.slice(0,subnetLength+1);
        }
        var lastIndex = subIP.lastIndexOf('.');
        subIP = subIP.slice(0,lastIndex+1) + "0";
        OPMClient.ReportsDetailsController.ipRequestSelectedSubnet = subIP;
    }
    
    OPMClient.InventoryOpUtilsController.ipRequestDetails.uId = resp.rows[0]["user-id"];
    OPMClient.InventoryOpUtilsController.ipRequestDetails.reviewedTime = resp.rows[0]["reviewed-time"];
}
function editIP()
{
   if(OPMClient.InventoryOpUtilsController.ipRequestDetails.preferredSubnet === '-'){
        $("#availBox").removeClass("opmForm maxWd100 pr-xlg disabledBlock").addClass("opmForm maxWd100 pr-xlg");
   }
   else if ($( "#ipView" ).hasClass('opmBtn active') || $( "#ipView" ).hasClass('active opmBtn'))
   {
       $("#selectedIPsPreview").hide();
       $("#availBox").removeClass("opmForm maxWd100 pr-xlg").addClass("opmForm maxWd100 pr-xlg disabledBlock");
       $("#tableView").removeClass("opmBtn active").addClass("opmBtn");
       
   }
   else if($( "#tableView" ).hasClass('opmBtn active') || $( "#tableView" ).hasClass('active opmBtn')){
       $("#availBox").removeClass("opmForm maxWd100 pr-xlg disabledBlock").addClass("opmForm maxWd100 pr-xlg");
       $("#ipView").removeClass("opmBtn active").addClass("opmBtn");
   }
   
}
function checkSubnetCount(SubnetAddr)
{
    var subnetAdd = $("#SubnetAddr").val();
    var ip = subnetAdd.split("/")[0];
    OPMClient.ReportsDetailsController.preferredSubnet = ip;
   
    var flag = false;
    var respon = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getUnUsedIP?subnetAddress='+OPMClient.ReportsDetailsController.preferredSubnet+'&status=3&reservedStatus=1');//NO I18N
    var totalIP = $("#totalIP").val();
    if(totalIP === undefined){
        totalIP = OPMClient.InventoryOpUtilsController.ipRequestDetails.ipCount;
    }
        if(respon.status === "Success")
        {
            if(respon.rows.length >= totalIP)
            {
                $('#availBox').show();
                $('#editIP1').show();
                $('#noMsg').hide();
                setCriteriaForIpformReport();
                $('#subnetlistMsg').hide();
                $('#approvalButton').css('display','block');
                OPMClient.ReportsDetailsController.set('ipsRequested',$("#totalIP").val());//NO I18N
            }
        }
        else{
            $('#subnetlistMsg').show();
            $('#approvalButton').css('display','none');
            $('#availBox').hide();
            $('#noMsg').show();
        }
}
function showDiv(thisDiv){
    if(($('#ipCheckbox').is(":checked")) && (totalIP.value != undefined && totalIP.value != "" && totalIP.value != 0)){
        $('#subnetlist').show();
        if($('#SubnetAddr').val() !== 'All'){
            checkSubnetCount();
        }
    }
    else {
        if(totalIP.value == undefined || totalIP.value == "" || totalIP.value == 0)
        {
            alert(Ember.I18n.t('opu.common.Enter_No_Of_IP_Value',this));//NO I18N
            $("#ipCheckbox").prop("checked", false);
            $('#subnetlist').hide();
            $("#totalIP").focus();

        }
        else{
            $('#subnetlist').hide();
            $('#availBox').hide();
            $('#subnetlistMsg').hide();
        }
        
    }
    $('#noMsg').hide();
}
function selectedSubnetsGridLoad(){
    var colNames = [Ember.I18n.t('opu.ipam.SELECTED_SUBNETS',this),Ember.I18n.t('webclient.admin.traps.action',this)];//No I18N
    var colModel = [
                {name: 'subnetAddressCidr', index: 'subnetAddressCidr', sortable: false, formatter: getsubnetAddedDetails}, //No I18N
                {name: 'remove', index: 'remove',width:40, sortable: false,formatter:removeFromSupernetPreview}];//No I18n
	$("#selectedSubnetsList").jqGrid("GridUnload");
    opm_loadJQgridWithData("#selectedSubnetsList",OPMClient.InventoryOpUtilsController.supernetDetails.selectedSubnets,colNames,colModel,"","","","");//No I18N
    $("#selectedSubnetsList").jqGrid('setGridWidth',$('#selectedSubnetsList').closest("#subnetPreviewDiv").width());
    $('.select2').select2();
}
function removeFromSuperPreview(supernetAddresscidr){
    OPMClient.InventoryOpUtilsController.supernetDetails.selectedSubnets = OPMClient.InventoryOpUtilsController.supernetDetails.selectedSubnets.filter(function(supernet){
        if(supernet.subnetAddressCidr===supernetAddresscidr){
            return false;
        }else{
            return true;
        }
    });
    selectedSubnetsGridLoad()
}
function updateSubnetMask(){
    var supernetMsk = $("#subnetmsk").val();
    var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/ipam/getInclusiveSubnetMasks?supernetMask="+supernetMsk);//NO I18N
    var subnetList = response.result.subnetMask;
    var classCsubnetList = [];
    var classBsubnetList = [];
    selectedSubnetMask = '';
    $.each(subnetList,function(i,subnetmask){
        if(subnetmask.count<=254){
            if(subnetmask.count==254){
                subnetmask.selected = true;
            }
            classCsubnetList.push(subnetmask);
            selectedSubnetMask = subnetmask.mask;
        }else{
            classBsubnetList.push(subnetmask);
        }
    });
    var jsonObj = {};
    jsonObj.classCsubnetList = classCsubnetList;
    jsonObj.classBsubnetList = classBsubnetList;
    jsonObj.selectedMask = selectedSubnetMask;
    OPMClient.InventoryOpUtilsController.set("subnetMask",jsonObj);//NO I18N
}
function getCIDRForSubnetMask(subnetMask){
    var param = {};
    param["255.0.0.0"] = 8                                 //NO I18N
    param["255.128.0.0"] = 9                               //NO I18N
    param["255.192.0.0"] = 10                              //NO I18N
    param["255.224.0.0"] = 11                              //NO I18N
    param["255.240.0.0"] = 12                              //NO I18N
    param["255.248.0.0"] = 13                              //NO I18N
    param["255.252.0.0"] = 14                              //NO I18N
    param["255.254.0.0"] = 15                              //NO I18N
    param["255.255.0.0"] = 16                              //NO I18N
    param["255.255.128.0"] = 17                            //NO I18N
    param["255.255.192.0"] = 18                            //NO I18N
    param["255.255.224.0"] = 19                            //NO I18N
    param["255.255.240.0"] = 20                            //NO I18N
    param["255.255.248.0"] = 21                            //NO I18N
    param["255.255.252.0"] = 22                            //NO I18N
    param["255.255.254.0"] = 23                            //NO I18N
    param["255.255.255.0"] = 24                            //NO I18N
    param["255.255.255.128"] = 25                          //NO I18N
    param["255.255.255.192"] = 26                          //NO I18N
    param["255.255.255.224"] = 27                          //NO I18N
    param["255.255.255.240"] = 28                          //NO I18N
    param["255.255.255.248"] = 29                          //NO I18N
    param["255.255.255.252"] = 30                          //NO I18N
    param["255.255.255.254"] = 31                          //NO I18N
    param["255.255.255.255"] = 32                          //NO I18N
    return param[subnetMask];
}
function getInclusiveSubnetGridLoad(isSubnetMaskchanged){
    var supernetMask = OPMClient.InventoryOpUtilsController.supernetDetails.supernetMask;
    var supernetCIDR = getCIDRForSubnetMask(supernetMask);
    var subnetMask = "255.255.255.0"; //No I18N
    if(supernetCIDR >= 24){
        subnetMask = "255.255.255.255"; //No I18N
    }
    if(isSubnetMaskchanged){
        subnetMask = $("#subnetMask").val();
    }
    var url = window.OPM.apiUrlPattern + "/ipam/getInclusiveSubnets";//NO I18N
    var selectedSubnetList = [];
    $.each(OPMClient.InventoryOpUtilsController.supernetDetails.selectedSubnets, function (index, subnets) {
        var param = {};
        param.subnetAddress = subnets.subnetAddress;
        param.subnetMask = subnets.subnetMask;
        selectedSubnetList.push(param);
    });
    postData = {};
    postData.supernetAddress = OPMClient.InventoryOpUtilsController.supernetDetails.supernetAddress;
    postData.supernetMask = OPMClient.InventoryOpUtilsController.supernetDetails.supernetMask;
    postData.subnetMask = subnetMask;
    postData.selectedSubnetList = JSON.stringify(selectedSubnetList);
    var colNamesList = [Ember.I18n.t('opu.views.SUBNET_ADDRESS',this),Ember.I18n.t('opu.views.SUBNET_MASK',this),Ember.I18n.t('opu.ipv6.PARENT_NODE',this),Ember.I18n.t('opu.views.SUBNET_NAME',this),Ember.I18n.t('webclient.admin.traps.action',this)];//No I18N
    var colModelList = [
        {name: 'subnetAddress', index: 'subnetAddress', sortable: false,width:50}, //No I18N
        {name: 'subnetMask', index: 'subnetMask', sortable: false,width:40}, //No I18N
        {name: 'group-name', index: 'group-name', sortable: false,width:60, formatter: getgroupNameSelectBox}, //No I18N
        {name: 'subnet-name', index: 'subnet-name', sortable: false,width:40, formatter: getSubnetNameTextBox}, //No I18N
        {name: 'remove', index: 'remove',width:40, sortable: false,formatter:getSelectForInclude}];//No I18n
    var dObj = {
        "id":"#InclusiveSubnetsList",//No I18N
        "apiUrl":url,//No I18N
        "data":postData,//No I18N
        "colNamesList":colNamesList,//No I18N
        "colModelList":colModelList,//No I18N
        "pagerId":"#InclusiveSubnetsPager",//No I18N
        "defaultOptions":{"multiselect":false},//No I18N
        "searchOption":false,//No I18N
        "toggleSearch":false//No I18N
    };
    $("#InclusiveSubnetsList").jqGrid("GridUnload");
    opm_loadJqGridBasedOnCount(dObj);
    $("#InclusiveSubnetsList").jqGrid('setGridWidth',$('#InclusiveSubnetsList').closest(".opmFormHolder").width()-30);
    $("#InclusiveSubnetsList").on("jqGridAfterLoadComplete", function () { //No I18N
        $('.select2').select2();
        $('#InclusiveSubnetsPager_right').empty();
    });
}
function addSubnetToExclude(subnetAddress,subnetMask,rowID){
    var jsonObj = {};
    jsonObj.subnetAddress = subnetAddress;
    jsonObj.subnetMask = subnetMask;
    var groupId = "";
    var groupName = "";
    groupId = $("#groupForSubnet_"+rowID).val().trim();
    if(groupId && groupId !== 'undefined' && groupId === "-1") {
        groupName = $( "#groupForSubnet_"+rowID+" option:selected" ).text().trim();
    }else{
        groupId = "GROUP_" + groupId;//NO I18N
        groupName = $( "#groupForSubnet_"+rowID+" option:selected" ).text().trim();
    }
    var subnetName = $("#subnetname_"+rowID).val();
    if(groupId && groupId !== 'undefined'){
        jsonObj.groupName = groupId;
    }
    if(groupName && groupName !== 'undefined'){
        jsonObj.group = groupName;
    }
    if(subnetName && subnetName !== 'undefined'){
        jsonObj.subnetName = subnetName;
    }else{
        jsonObj.subnetName = "";
    }
    jsonObj.subnetAddressCidr = subnetAddress + "/" + getCIDRForSubnetMask(subnetMask);
    OPMClient.InventoryOpUtilsController.supernetDetails.selectedSubnets.push(jsonObj);
    $(rowID).addClass("ui-state-highlight");
    $('#InclusiveSubnetsList').jqGrid('delRowData',rowID);
}

function groupChangeInSupernet(){
    OPMClient.InventoryOpUtilsController.ipamGroupListOptions = [];
    $.each(OPMClient.InventoryOpUtilsController.supernetGroupList, function (index, groups) {
        if ("-1" === groups.groupId) {
            OPMClient.InventoryOpUtilsController.selectedGroupId=groups.groupId;
            OPMClient.InventoryOpUtilsController.ipamGroupListOptions=OPMClient.InventoryOpUtilsController.ipamGroupListOptions+'<option value="' + groups.groupId + '" selected>' + groups.groupName + '</option>';//No I18N
        } else {
            OPMClient.InventoryOpUtilsController.ipamGroupListOptions=OPMClient.InventoryOpUtilsController.ipamGroupListOptions+'<option value="' + groups.groupId + '">' + groups.groupName + '</option>';//No I18N
        }
    });
    $('.select2').select2();
    getInclusiveSubnetGridLoad(false);
}
function groupChange(reloadGrid){																			   //reloadgrid chooses when to reload the whole data.
    $('#ipamtreegroup').select2('close');
    if($('#existinggroups').css("display") === "block"){
        var selectedGroup = $('#ipamtreegroup').val();
        OPMClient.InventoryOpUtilsController.ipamGroupListOptions = [];
        $.each(OPMClient.InventoryOpUtilsController.ipamGroupList, function (index, groups) {
            if (selectedGroup === groups.groupId) {
                OPMClient.InventoryOpUtilsController.selectedGroupId=groups.groupId;//No I18N
                OPMClient.InventoryOpUtilsController.ipamGroupListOptions=OPMClient.InventoryOpUtilsController.ipamGroupListOptions+'<option value="' + groups.groupId + '" selected>' + groups.groupName + '</option>';//No I18N
            } else {
                OPMClient.InventoryOpUtilsController.ipamGroupListOptions=OPMClient.InventoryOpUtilsController.ipamGroupListOptions+'<option value="' + groups.groupId + '">' + groups.groupName + '</option>';//No I18N
            }
        });
		var rowsWithData  = $('#BulkApproveSubnetsList').jqGrid('getDataIDs');
        var numberOfRows = rowsWithData.length;
		if(!reloadGrid){
            for(var i = 0 ; i<numberOfRows ; i++) {													//updates selected group-name without reloading other data in table.
                $("#BulkApproveSubnetsList").jqGrid('setCell', rowsWithData[i] , "group-name" ,OPMClient.InventoryOpUtilsController.ipamGroupListOptions );
            }
        }
    }else{
        var groupName = $('#newgroup').val();
        var charsToRestrict = "!$%^&*()+=[]\';{}|\"<>?~";//NO I28N
        var xssResult =  checkForXSS(groupName,charsToRestrict);
        if(xssResult === 'failed'){
            alert(Ember.I18n.t("webclient.ncm.terminal.change.validGroupName",this));//No I18N
            $('#newgroup').val('');
            $('#newgroup').focus();
            return;
        }
        OPMClient.InventoryOpUtilsController.ipamGroupListOptions ='<option >' + groupName + '</option>';
		var rowsWithData  = $('#BulkApproveSubnetsList').jqGrid('getDataIDs');
		var numberOfRows = rowsWithData.length;
		for(var i = 0 ; i<numberOfRows ; i++) {												//updates new group-name without reloading other data in table.
            $("#BulkApproveSubnetsList").jqGrid('setCell', rowsWithData[i] , "group-name" ,OPMClient.InventoryOpUtilsController.ipamGroupListOptions );
         }
    }
    $('.select2').select2();
	if(reloadGrid) {										//Grid reloading will be done only if whole table/data has to be reloaded. 
		approveSubnetGridLoad();
	}
}

function exportSPMReport(context,format,widgetDataId,widgetDataName){
    var switches = '';
    var groupId = '';
    if(OPMClient.InventoryDeviceDetailsController.selDevice.indexOf('SPMGROUP_')!==-1){
        groupId = OPMClient.InventoryDeviceDetailsController.selDevice;
    }else{
        switches = OPMClient.InventoryDeviceDetailsController.selDevice;
    }
    url = window.OPM.apiUrlPattern + '/oputilsreports/getOputilsReportsData?reportName='+context+'&viewAs='+format;//No I18N
    if(window.OPM.isCentralServer){
        //opm snapshot -> port view-> export
        if(OPMClient.InventoryDeviceDetailsController.inventorysnapType !== "IPAMSwitch" && (OPMClient.InventoryDeviceDetailsController.eeProbeID !== undefined && OPMClient.InventoryDeviceDetailsController.eeProbeID !== "")){
            url = eeClientReqToProbe(url,OPMClient.InventoryDeviceDetailsController.eeProbeID);
        }else{
            url=oputilsAppendProbeID(url);
        }
    }
    if(window.OPM.isEEProbeSelected){
        url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
    }
    if(switches!=undefined&&switches!=''){
        url = url+'&switchIP='+switches;//No I18N
    }
    if(groupId!=undefined&&groupId!=''){
        url = url + '&groupId='+groupId;//No I18N
    }
    var selectedColumnsArr = getSelectedColumns("OpUtils_SnapShot_Ports");//No I18N
    if(selectedColumnsArr.length!=0){
        url = url + '&columnChoosen='+selectedColumnsArr.toString();//No I18N
    }
    if(widgetDataName!==undefined && widgetDataName === 'ipam.switch.ports'){
        if(widgetDataId!==undefined){
            var severity = $('#param_'+widgetDataId+'_severity').val();
            if(severity!=undefined&&severity!=''){
                url = url + '&severity='+severity;//No I18N
            }
        }
    }
    url = url +'&wsId='+sessionStorage.getItem("wsId");//No I18N
    if(widgetDataId !== undefined && (OPMClient.InventoryDeviceDetailsController.inventorysnapType == "IPAMSwitchGroup" || OPMClient.InventoryDeviceDetailsController.inventorysnapType == "IPAMSwitch"))
    {
        var apiurildata = $('#opm_DeviceSnapList'+widgetDataId).jqGrid('getGridParam', 'postData');
        if(apiurildata !== undefined && apiurildata.filters !== undefined){
             url = url + '&_search=true&filters='+encodeURIComponent(JSON.parse(JSON.stringify(apiurildata.filters)));//No I18N
        }
    }
    location.href=url;
}
function getColumnSelected(gridID){
    var selectedColChooserArr = [];
    $.ajax({
        url:window.OPM.apiUrlPattern + '/ncmclient/getGridColumnChoosers', //No I18N
        type:'GET', // No i18n
        data:{
            "GRID_ID":gridID//No I18N
        },
        async: false,
        success:function(jsonData){
            if(jsonData != null && jsonData[gridID] != null && jsonData[gridID].length > 0) {
                selectedColChooserArr = jsonData[gridID];
            }
        }
    });
    return selectedColChooserArr;
}
function getADCompReport(format){
    var domainId = OPMClient.SettingsOpUtilConfigController.adDomainId;
    var url = window.OPM.apiUrlPattern + '/oputilsreports/getOputilsReportsData?reportName=adComputerReport&viewAs='+format+'&adDomainID='+domainId;//No I18N
    if(window.OPM.isCentralServer){
        url=oputilsAppendProbeID(url);
    }
    if(window.OPM.isEEProbeSelected){
        url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
    }
    location.href=url;
}
function exportRogueReport(format){
    var url = window.OPM.apiUrlPattern + '/oputilsreports/getOputilsReportsData?reportName=rogueReport&viewAs='+format;//No I18N
    var rougeType = OPMClient.InventoryOpUtilsController.rogueType;
    var subFilterType = OPMClient.InventoryOpUtilsController.subFilterData;
    var selectedColChooserArr = [];//No I18N
    if(rougeType!=undefined&&rougeType!=''){
        url = url+'&rogueType='+rougeType;//No I18N
        selectedColChooserArr = getColumnSelected('OpUtils_Rogue_'+rougeType);//No I18N
    }
    if(OPMClient.InventoryOpUtilsController.subFilterData.length>0){
        url = url+'&byNICType='+subFilterType;//No I18N
    }
    if(selectedColChooserArr.length!=0){
        url = url + '&columnChoosen='+selectedColChooserArr.toString();//No I18N
    }
    if(window.OPM.isCentralServer){
        url = oputilsAppendProbeID(url);
    }
    if(window.OPM.isEEProbeSelected){
        url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
    }
    //adding filters in export url
    var apiurildata = $('#opm_Devices').jqGrid('getGridParam', 'postData');
    if(apiurildata !== undefined && apiurildata.filters !== undefined){
        url = url + '&_search=true&filters='+encodeURIComponent(JSON.parse(JSON.stringify(apiurildata.filters)));//No I18N
    }

    location.href=url;
}
function exportIPAMReport(context,format,widgetDataId){
    var filterBy = $('#filterByAction').val();
    var subnetId = '';
    var groupId = '';
    if(OPMClient.InventoryDeviceDetailsController.selDevice.indexOf('GROUP_')!==-1||OPMClient.InventoryDeviceDetailsController.selDevice.indexOf('SUPERNET_')!==-1){
        groupId = OPMClient.InventoryDeviceDetailsController.selDevice;
    }else if(OPMClient.InventoryDeviceDetailsController.selDevice.indexOf('SUBNET_')!==-1||OPMClient.InventoryDeviceDetailsController.selDevice.indexOf('SUBNETX_')!==-1){
        subnetId = OPMClient.InventoryDeviceDetailsController.selDevice;
    }
    url = window.OPM.apiUrlPattern + '/oputilsreports/getOputilsReportsData?reportName='+context+'&viewAs='+format;//No I18N
    if(window.OPM.isCentralServer){
        url = oputilsAppendProbeID(url);
    }
    if(window.OPM.isEEProbeSelected){
        url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
    }
    if(subnetId!=undefined&&subnetId!=''){
        if(window.OPM.isCentralServer){
            subnetId = subnetId.split(".")[0];
        }
        url = url+'&subnetId='+subnetId;//No I18N
    }
    if(groupId!=undefined&&groupId!=''){
        if(window.OPM.isCentralServer){
            groupId = groupId.split(".")[0];
        }
        url = url + '&groupId='+groupId;//No I18N
    }
    if(filterBy!=undefined&&filterBy!=''){
        url = url + '&pageType=snapshot&filterBy='+filterBy;//No I18N
    }
    if(context != undefined && context === 'DHCPScopeReport'){
        url = url + '&dhcpServerAddress='+OPMClient.InventoryOpUtilsController.dhcpServerIP;//No I18N
    }
    if(context != undefined && (context === 'DNSZoneReport' || context === 'DNSRecordReport' || context === 'DNSServerReport')){
        url = url + '&dnsServerId='+OPMClient.InventoryOpUtilsController.dnsServerIP;//No I18N
    }
    if(context != undefined && context === 'IPHistoryReport'){
        var subnetDetails = OPMClient.InventoryOpUtilsController.selectedSubnetDetails
        if(subnetDetails != undefined && subnetDetails.nodeText != undefined){
            url = url + '&devicename='+subnetDetails.nodeText;//No I18N
        }
    }
    if(widgetDataId!==undefined){
        if(context === 'DHCPIPReport' || context === 'DHCPPolicyReport' || context === 'DHCPFilterReport' || context === 'DHCPSuperscopeReport'){
            url = url + '&dhcpServerAddress='+OPMClient.InventoryOpUtilsController.dhcpServerIP;//No I18N
        }
        if(widgetDataId === 'ipam.subnet.global.v6'){
            url = url + '&viewName=IPV6DetailsNoSubnet&isGlobal=true';//No I18N
        }else if(widgetDataId === "ipam.subnet.local.v6"){//No I18N
            url = url + '&isGlobal=false';//No I18N
        }else{
            var status = $('#param_'+widgetDataId+'_status').val();
            var vendor = $('#param_'+widgetDataId+'_vendor').val();
            var createdtime = $('#param_'+widgetDataId+'_historyTime').val();
            var changesin = $('#param_'+widgetDataId+'_changesin').val();
            var dhcpStatus = $('#param_'+widgetDataId+'_dhcpStatus').val();
            var dhcpScopeId = $('#param_'+widgetDataId+'_dhcpScopeId').val();
            var dnsZoneId = $('#param_'+widgetDataId+'_dnsZoneId').val();
            if(status!=undefined&&status!=''){
                url = url + '&status='+status;//No I18N
            }
            if(vendor!=undefined&&vendor!=''){
                url = url + '&vendor='+vendor;//No I18N
            }
            if(createdtime!=undefined&&createdtime!=''){
                url = url + '&historyTime='+createdtime;//No I18N
            }
            if(changesin!=undefined&&changesin!=''){
                url = url + '&changesin='+changesin;//No I18N
            }
            if(dhcpStatus!=undefined&&dhcpStatus!=''){
                url = url + '&dhcpStatus='+dhcpStatus;//No I18N
            }
            if(dhcpScopeId!=undefined&&dhcpScopeId!=''){
                url = url + '&dhcpScopeId='+dhcpScopeId;//No I18N
            }
            if(dnsZoneId!=undefined&&dnsZoneId!=''){
                url = url + '&dnsZoneId='+dnsZoneId;//No I18N
            }
        }
    }
    url = url +'&wsId='+sessionStorage.getItem("wsId");//No I18N
    if(widgetDataId !== undefined && (OPMClient.InventoryDeviceDetailsController.inventorysnapType == "IPAMSubnetGroupSummary" || OPMClient.InventoryDeviceDetailsController.inventorysnapType == "IPAMSubnet")  )
    {
        var apiurildata = $('#opm_DeviceSnapList'+widgetDataId).jqGrid('getGridParam', 'postData');
        if(apiurildata !== undefined && apiurildata.filters !== undefined){
             url = url + '&_search=true&filters='+encodeURIComponent(JSON.parse(JSON.stringify(apiurildata.filters)));//No I18N
        }
    }

    location.href=url;
}

function exportIPAMStructureReport() {
    var url = window.OPM.apiUrlPattern + '/oputilsreports/getOputilsReportsData?reportName=SubnetStructure&viewAs=CSV';//No I18N
    var groupName = OPMClient.InventoryDeviceDetailsController.deviceName;
    if(groupName != null){
        url= url+"&groupId="+groupName;//No I18N
    }
    if(window.OPM.isEEProbeSelected){
        url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
    }
    url = url +'&wsId='+sessionStorage.getItem("wsId");//No I18N
    location.href=url;
}
function getSelectedColumns(gridID){
    var selectedColChooserArr = [];
    $.ajax({
        url:window.OPM.apiUrlPattern + '/ncmclient/getGridColumnChoosers', //No I18N
        type:'GET', // No i18n
        data:{
            "GRID_ID":gridID//No I18N
        },
        async: false,
        success:function(jsonData){
            if(jsonData != null && jsonData[gridID] != null && jsonData[gridID].length > 0) {
                selectedColChooserArr = jsonData[gridID];
            }
        }
    });
    return selectedColChooserArr;
}
function tooltipPositionCalc(){
    var bodyWidth = $('#v2BodyHolder').outerWidth();
    var bodyHeight = $('#v2BodyHolder').outerHeight();
    var tooltipHeight = $(".infoTooltip").outerHeight();
    if((bodyHeight-OPMClient.InventoryOpUtilsController.pageY)<tooltipHeight){
        OPMClient.InventoryOpUtilsController.set('pageY',(bodyHeight-tooltipHeight)); //No I18N
    }
}

function treeNodeMouseHover(){
    var timer;
    $(".jstree-anchor").on( "mouseenter", function( event ) {
        if($(".jstree-contextmenu").is(':visible')){
            $(".infoTooltip").css({'display':'none'});
            return;
        }
        var id=(this.id).split("_anchor")[0];//No I18N
        var text=trimAll($("#"+id).text());
        var url=window.OPM.apiUrlPattern;//NO I18N
        if(id!=="GROUP_1" && id!= "GROUP_4"){//NO I18N
            timer = setTimeout(function () {
                if(id.indexOf("IPV6")!=-1){
                    return;
                    // url=url+"/ipam/getIPAMToolTip?selSubnetID="+id;//NO I18N
                }else if(id.indexOf("DHCP")!=-1){
                    url=url+"/ipam/getIPAMToolTip?dhcpServerId="+id;//NO I18N
                }else if(id.indexOf("SPMGROUP")!=-1){
                    url=url+"/spm/getSPMToolTip?groupId="+id;//NO I18N
                }else if(id.indexOf("GROUP")!=-1){
                    url=url+"/ipam/getIPAMToolTip?groupId="+id;//NO I18N
                }else if(id.indexOf("SWITCH")!=-1){
                    url=url+"/spm/getSPMToolTip?switchIP="+text;//NO I18N
                }else if(id.indexOf("SUBNET")!=-1){
                    text=text.split("/")[0];
                    url=url+"/ipam/getIPAMToolTip?subnetId="+id;//NO I18N
                }else if(id.indexOf("SUPERNET")!=-1){
                    url=url+"/ipam/getIPAMToolTip?supernetId="+id;//NO I18N
                }
                OPMClient.ApplicationController.set('infoToolTipUrl',url);//No I18N
                OPMClient.InventoryOpUtilsController.set('pageX',event.pageX);//No I18N
                OPMClient.InventoryOpUtilsController.set('pageY',event.pageY);//No I18N
                setTimeout(function(){
                    $(".infoTooltip").css({'display':'block'});
                    tooltipPositionCalc();
                    $(".infoTooltip").css({'left':OPMClient.InventoryOpUtilsController.pageX,'top':OPMClient.InventoryOpUtilsController.pageY});
                },10)
            }, 1500);
        }
    });
    $(".jstree-anchor").on( "mouseleave", function( event ) { 
        OPMClient.ApplicationController.set('infoToolTipUrl','');//No I18n
        setTimeout(function(){
            $(".infoTooltip").css({'display':'none'});
        },100);
        clearTimeout(timer);
    });
}

function showHideIPAMGroupsforApproveSubnets()
{
    if ($("#existinggroups").css('display') === "block") {
        $("#newgroupdiv").css('display', 'block');
        $("#newgroup").focus();
        $("#existinggroups").css('display', 'none');
    } else {
        $("#newgroupdiv").css('display', 'none');
        $("#existinggroups").css('display', 'block');
    }
    groupChange(false);
}

function closeFilterBy(){
    // OPMClient.Inventory.oputils_ClearFiltersList();
    // OPMClient.Inventory.oputils_loadListViewDetails();
    OPMClient.Inventory.ReloadOpUtilsInventorySubFilter();
    oputilsInventoryReload(OPMClient.InventoryDeviceDetailsController.subFilterType);
    $(".treeFilter").css("display", "block");//NO I18N
    }
function getOpUtilsSPMCredential(){
    var selectedCred="";
    var allCrdList = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listCredentials?isExcludeVirtualCred=true"); //No I18n
    var snmpCreden=[];
    OPMClient.InventoryOpUtilsController.credentialList=[]
    if(OPMClient.InventoryDeviceDetailsController.confPage =="EditSwitch"){
        selectedCred = OPMClient.InventoryOpUtilsController.switchDetails.credentialname;
    }
    var total = 0;
    if(allCrdList.snmpcredential != undefined){
        $.each(allCrdList.snmpcredential,function(k,v){
            if(v.credentialName === selectedCred){
                total++;
                snmpCreden[k]={"credentialId":v.credentialId,"credentialName":v.credentialName,"selected":true};//No I18N
            }else{
                snmpCreden[k]={"credentialId":v.credentialId,"credentialName":v.credentialName,"selected":false};//No I18N
            }
        });
        OPMClient.InventoryOpUtilsController.credentialList[0]={"displayName":allCrdList.snmpcredential[0].type,"Value":snmpCreden}
    }
    if(allCrdList.snmpv3credential != undefined){
        snmpCreden=[];
        $.each(allCrdList.snmpv3credential,function(k,v){
            if(v.credentialName === selectedCred){
                total++;
                snmpCreden[k]={"credentialId":v.credentialId,"credentialName":v.credentialName,"selected":true};//No I18N
            }else{
                snmpCreden[k]={"credentialId":v.credentialId,"credentialName":v.credentialName,"selected":false};//No I18N
            }
        });
        OPMClient.InventoryOpUtilsController.credentialList[1]={"displayName":allCrdList.snmpv3credential[0].type,"Value":snmpCreden}
    }
     if(total > 0){
         OPMClient.InventoryOpUtilsController.selCredCount = total;
    }
}
function opu_WOLStatusColorIcon(cellValue, options, rowdata, action){
    var status = rowdata.status;
    if(status == "5"){
       return "<i class='icon-status5'></i> "+Ember.I18n.t('webclient.devices.intftypes.up',this);//No I18N
    }else if(status == "1"){
       return "<i class='icon-status1'></i> "+Ember.I18n.t('webclient.map.down',this);//No I18N
    }else if(status == "3"){
        return Ember.I18n.t('webclient.discovery.scanning.info',this);//No I18N
    }
}
function showHideWOLAddDiv(tabName){
    if(tabName === 'addWOLmanuallyDiv'){//No I18N
        $('#addWOLmanuallyDiv').show();
        $('#addWOLfromSubnetsDiv').hide();
    }else if(tabName === 'addWOLfromSubnetsDiv'){//No I18N
        $('#addWOLmanuallyDiv').hide();
        $('#addWOLfromSubnetsDiv').show();
        var url = window.OPM.apiUrlPattern + '/wol/getSubnetsforWOL';//NO I18N
        var response = opm_ajaxGetResponse(url);//No I18N
        var subnetList = [];
        subnetList.push({"value":'all',"display":Ember.I18n.t('webclient.maps.allcategs',this),"isSelected":true});
        if(response!=undefined && !$.isEmptyObject(response)){
            $.each(response.subnets,function(index,devices){
                var isSelected = false;
                subnetList.push({"value":devices.subnetAddress,"display":devices.subnetAddress,"isSelected":isSelected});
            });
        }
        subnetList.push({"value":'others',"display":Ember.I18n.t('webclient.map.others',this),"isSelected":false});
        OPMClient.InventoryOpUtilsController.set('wolSubnetList',subnetList);//No I18N
        url = window.OPM.apiUrlPattern + '/tools/getMACIPList?fromWOL=fromWOL';//NO I18N
        var subnet = $('#subnets').val();
        if(subnet !== undefined && subnet !== "" && subnet.length != 0){
            url = url + '&subnetAddress='+subnet;//No I18N
        }
        response = opm_ajaxGetResponse(url);//No I18N
        var deviceList=[];
        if(response !== undefined && !$.isEmptyObject(response)){
            if(response.status === 'Success'){
                $.each(response.rows,function(index,devices){
                    deviceList.push({"value":devices.resourceid,"display":devices['ip-address']});
                });
            }
        }
        OPMClient.InventoryOpUtilsController.set('wolDeviceList',deviceList);//No I18N
    }
}
function OpuWOL_getMACAddressResolve(){
    var url=window.OPM.apiUrlPattern + '/tools/getMacAddressFromIp';//NO I18N
    hostName = $('#hostName').val();
    if(hostName !== undefined && hostName !== "" && hostName.length != 0){
        var cbmethod = function(resp){
            if(resp.status !== 'Failure'){
                if(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(resp.result.ipmac_macaddress)){
                    opm_infoMsgs("successMsg",Ember.I18n.t('ncm.firmvuln.Resolved',this)); //No I18N
                    $('#macAddress').val(resp.result.ipmac_macaddress);
                }
                else{
                    opm_infoMsgs("errorMsg",resp.result.ipmac_macaddress); //No I18N
                }
            }else{
                opm_infoMsgs("errorMsg",Ember.I18n.t('opu.common.NOT_ABLE_TO_RESOLVE',this)); //No I18N
            }
        }
        opm_ajaxPostRequestWithMsg(url, {"ipOrHost":hostName}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }else{
        alert(Ember.I18n.t('webclient.import3data.host.name',this));//NO I18N
    }
}
function ipamshowIpRangeinWOL() {
    var subnetAddress = $("#hostName").val();
    var mask = $("#subnetmsk").val();
    if(mask!==undefined && mask!=='' && mask!==null){
        if (subnetAddress.length > 0 && mask.length > 0 && subnetAddress != '0.0.0.0' && /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(subnetAddress)) {
            var subnet = computeNetAddress(subnetAddress, mask);
            $("#subnetaddr").val(subnet);
        }

    }
}
function opuWOLScheduler(){
    $('.tab1 li').on('click',function(){
        $('.tab1 > ul > li').removeClass('active')
        $(this).addClass('active')
        var currentTabId = $(this).attr('rel');
        $('.tab1Content').removeClass('active')
        $(currentTabId).addClass('active')
    });
}
function getDevicesforgroup(params){
    var url = window.OPM.apiUrlPattern + '/wol/getWOLGroupInfo';//NO I18N
    if(params !== undefined){
        url=url+'?groupId='+params;//NO I18N
    }
    var response = opm_ajaxGetResponse(url);//No I18N
    var deviceList=[];
    if(response !== undefined && !$.isEmptyObject(response)){
        $.each(response.availableDevices,function(index,devices){
            deviceList.push({"value":devices['resource-id'],"display":devices['ip-address']});
        });
        OPMClient.InventoryOpUtilsController.set('wolDeviceAvailableList',deviceList);//No I18N
        deviceList=[];
        if(response.selectedDevices!==undefined){
            $.each(response.selectedDevices,function(index,devices){
                deviceList.push({"value":devices['resource-id'],"display":devices['ip-address']});
            });
        }
        OPMClient.InventoryOpUtilsController.set('wolDeviceSelectedList',deviceList);//No I18N
    }
}
function opUtilsWOLDeviceAjaxRev(params){
    if(OPMClient.InventoryDeviceDetailsController.subFilterType===params){
        oputilsInventoryReload(OPMClient.InventoryDeviceDetailsController.subFilterType);
    }
}
function setCriteriaForWOL(){
    url = window.OPM.apiUrlPattern + '/tools/getMACIPList?fromWOL=fromWOL';//NO I18N
    var subnet = $('#subnetAddress').val();
    
    var selectedReports = $("#selectedReport option").map(function () { return this.value; }).get();
    var availableReports = $("#availableReport option").map(function () { return this.value; }).get();
    
    if(subnet != undefined){
        url = url + '&subnetAddress='+subnet;//No I18N
    }
    var response = opm_ajaxGetResponse(url);//No I18N
    var deviceList=[];
    if(response !== undefined && !$.isEmptyObject(response)){
        if (availableReports.length > 0) {
            $('#availableReport option').remove();
        }
        if(response.status === 'Success'){
            if (selectedReports.length > 0) {
                $.each(response.rows, function (index, devices) {
                    if (selectedReports.indexOf('' + devices.resourceid) == -1) {
                        deviceList.push({ "value": devices.resourceid, "display": devices['ip-address'] });
                    }
                });
            } else {
                $.each(response.rows, function (index, devices) {
                    deviceList.push({ "value": devices.resourceid, "display": devices['ip-address'] });
                });
            }
        }
    }
    OPMClient.InventoryOpUtilsController.set('wolDeviceList',deviceList);//No I18N
}

function ipamdhcpAddOptions(selectedValue) {

    if(selectedValue == undefined){
        selectedValue = $('#dhcpserverType').val();
    }
    var dhcpDivs = ['microsoftDHCP', 'LinuxDHCP', 'PaloAlto', 'ciscoDHCP', 'fortinetDHCP', 'infobloxDHCP', 'sonicDHCP']; //No I18N
    dhcpDivs.forEach(function(div) {
        $('#' + div).hide();
    });
    switch (selectedValue) {
        case "1": // Microsoft DHCP
            $('#microsoftDHCP').show();
            var roleHelpObj = [{ 'description': Ember.I18n.t('opu.DHCP.username.info') }]; //NO I18N
            OPMClient.SettingsAddEditController.set('roleHelp', roleHelpObj); //No I18N
            break;

        case "2": // Palo Alto
            $('#PaloAlto').show();
            $('#scanByRESTAPI').prop("checked", true);
            showHideElements('.dhcpRestAPIDiv', '.dhcpCLIQueryDiv'); //No I18N
            break;

        case "3": // Linux DHCP
            $('#LinuxDHCP').show();
            break;

        case "4": // Cisco DHCP
            $('#ciscoDHCP').show();
            showHideElements('.dhcpCLIQueryDiv', '.dhcpRestAPIDiv'); //No I18N
            break;

        case "5": // Fortinet DHCP
            $('#fortinetDHCP').show();
            $('#fortiipamimportoptions').hide();
            showHideElements('.dhcpCLIQueryDiv', '.dhcpRestAPIDiv'); //No I18N
            break;

            // 6 is for meraki
        case "7": // Infoblox DHCP
            $('#infobloxDHCP').show();
            showHideElements('.dhcpRestAPIDiv', '.dhcpCLIQueryDiv'); //No I18N
            break;

        case "8": // SonicWall DHCP
            $('#sonicDHCP').show();
            showHideElements('.dhcpRestAPIDiv', '.dhcpCLIQueryDiv'); //No I18N
            break;

        default:
            break;
    }
}
function ipamDnsAddOptions(selectedValue) {
    if (selectedValue == undefined) {
        selectedValue = $('#dnsServerType').val();
    }
    var dnsDivs = ['microsoftDNS', 'awsDNS', 'gcpDNS']; //No I18N
    dnsDivs.forEach(function (div) {
        $('#' + div).hide();
    });
    var dnsHelpLinks = ['dnsMsHelpLink', 'dnsAwsHelpLink', 'dnsGcpHelpLink']; //No I18N
    dnsHelpLinks.forEach(function (link) {
        $('#' + link).addClass('hide'); //No I18N
    });
    switch (selectedValue) {
        case "2": // AWS Route53
            $('#awsDNS').show();
            $('#dnsAwsHelpLink').removeClass('hide'); //No I18N
            if (typeof opm_initAwsDnsCredFields === 'function') { opm_initAwsDnsCredFields(); }//No I18N
            break;
        case "3": // Google Cloud DNS
            $('#gcpDNS').show();
            $('#dnsGcpHelpLink').removeClass('hide'); //No I18N
            if (typeof opm_initGcpDnsCredFields === 'function') { opm_initGcpDnsCredFields(); }//No I18N
            break;
        case "1": // Microsoft DNS
            if (OPMClient.ApplicationController.isWindowsOS) {
                $('#microsoftDNS').show();
                $('#dnsMsHelpLink').removeClass('hide'); //No I18N
            }
            break;
        default:
            break;
    }
}
function reloadBWMBlockGrid(){
    $('#deviceNamecollection').val('Global');// NO I18N
    $('#deviceNamecollection').change();// NO I18N
}
function loadBlockCollectionGrid(params)
{
    if(params!==undefined){
        var colNamesList = ['',Ember.I18n.t('webclient.addserver.devicenameip',this),Ember.I18n.t('webclient.map.actions.ifindex',this),Ember.I18n.t('webclient.devices.details.ifname',this),'','',Ember.I18n.t('opu.views.IF_SPEED',this),Ember.I18n.t('opu.bwm.DISCARD_UNICAST_PACKET',this),Ember.I18n.t('opu.bwm.DISCARD_NON_UNICAST_PACKET',this),'']; //No I18N
        var colModelList = [
            { name: 'interfaceid', index:'interfaceid',hidden:true, search: false}, //No I18N
            { name: 'hostname', index: 'hostname', sortable: true, sorttype: 'text', width:20, search: true}, //No I18N
            { name: 'ifindex', index: 'ifindex', sortable: true, sorttype: 'int', width:20, search: true, formatter:opu_IfStatusColor}, //No I18N
            { name: 'ifname', index: 'ifname', sortable: true, sorttype: 'text', search: true,width:20}, //No I18N
            { name: 'ifstatusint', index:'ifstatusint',hidden:true, search: false}, //No I18N
            { name: 'ifSpeedInt', index:'ifstatusint',hidden:true, search: false}, //No I18N
            { name: 'ifspeed', index: 'ifspeed', sortable: true,sorttype:opu_TrafficColSort, search: true,width:20,formatter:opuBwmEditIfSpeed}, //No I18N
            { name: 'isUnicast', index: 'isUnicast', sortable: false, search: false,width:20,formatter:bwmBlockAction}, //No I18N
            { name: 'isBroadcast', index: 'isBroadcast', sortable: false, search: false,width:20,formatter:bwmBlockAction}, //No I18N
            {name: 'id', index: 'id', sortable: false, hidden:true} //No I18N
        ];
        
        var defaultOptions = {"multiselect":false,"minRowsPerPage": 10 , "searchOption": true,"toggleSearch":false};//No I18N
        opm_loadJQgridWithData("#bwmIntfList",params.result, colNamesList, colModelList, '', "#bwmIntfPager", "bwmIntfList",defaultOptions); //No I18N
        $("#bwmIntfList").jqGrid('setGridWidth',$('#bwmIntfList').closest(".opmFormHolder").width()-30);
        $("#bwmIntfList").jqGrid('setGridHeight',350);
    }
}
function addSwitchfromSPM(param){
    opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.discovery.addwait',this)); //No I18N
    setTimeout(function(){
        var addurl = window.OPM.apiUrlPattern + '/spm/bulkAddToSPM';//No I18N 
        if(window.OPM.isCentralServer){
            addurl = oputilsAppendProbeID(addurl);
        }
        $.ajax({
            url: addurl,
            type: 'POST',//No I18N
            dataType: 'json',//No I18N
            data: {"deviceName":""+param},//No I18N
            success: function(jsonData, status) {
                location.href = window.OPM.apiclientUrl+'Inventory/List/OpUtils/Switches';//No I18N
                setTimeout(function(){
                    opm_infoMsgs("successMsg",Ember.I18n.t('webclient.topo.actions.startdiscovery.success',this)); //No I18N
                },100);
            }
        });
    },300);
}

function closeInfo(){
    OPMClient.ApplicationController.set('infoToolTipUrl','');//No I18n
    $(".infoTooltip").remove();
}

function getTrapViewer(){
    location.href = window.OPM.apiclientUrl+"Settings/Tools/TrapViewer"; //No I18N
}
function getTrapViewerUpdateList(onSelectFunc,data) {
    var list=[];
    if(data!==undefined){
        list=[data];
    }
    var hideCol = true;
    if(window.OPM.userPermissions.monitoringWrite) {
        hideCol = false;
    }
    var colNamesList = [Ember.I18n.t('opu.views.NAME',this)+'/'+Ember.I18n.t('webclient.snapshot.testlinks.oid',this),Ember.I18n.t('webclient.admin.traps.gentype',this),Ember.I18n.t('webclient.fault.event.displayName',this),Ember.I18n.t('opu.tools.TRAP_RECEIVED_TIME',this),'','',Ember.I18n.t('webclient.admin.alarmesc.message',this),Ember.I18n.t('webclient.admin.traps.action',this)]; //No I18N
    var colModelList = [
        { name: 'oid', index: 'oid',width:50,formatter:oidWithVersion}, //No I18N
        { name: 'traptype', index: 'traptype',width:50,formatter:getTrapGenericType}, //No I18N
        { name: 'source', index: 'source',width:50}, //No I18N
        { name: 'received-time', index: 'received-time',width:50}, //No I18N
        { name: 'version', index: 'version',hidden:true}, //No I18N
        { name: 'tid', index: 'tid',hidden:true}, //No I18N
        { name: 'varbind-values', index: 'varbind-values',width:100,formatter:varBindValueDesc}, //No I18N
        { name:'action', index:'action',width:50,sortable:false,formatter:addTrapToTrapProcessor,hidden:hideCol} //No I18N
    ];
    var defaultOptions = {"minRowsPerPage":1000};//No I18n
    $("#TrapViewerList").jqGrid("GridUnload");
    opm_loadJQgridWithData("#TrapViewerList", list, colNamesList, colModelList, "", "#TrapViewerPager",onSelectFunc,defaultOptions); //No I18N
    $("#TrapViewerList").jqGrid("setGridWidth",$("#TrapViewerList").closest(".opmFormHolder").width()-30);
}
function addTrapProcessor(oid,traptype,version,specificType){
    var snmpObj = {};
    snmpObj.oid = oid;
    snmpObj.gentype = traptype;
    if(version == 0){
        snmpObj.version = 'v1';//No I18n
    }else{
        snmpObj.version = 'v2/v3';//No I18n
    }
    snmpObj.specificType = specificType;
    OPMClient.SettingsAddEditController.pageObj.snmpObj = snmpObj;
    if(window.OPM.currentView.name == "Alarms.Alarm.Trap.TrapViewer.index"){
        alrmsGlobalRoute.transitionTo('Alarms.Alarm.Trap.TrapViewer.AddTrapProcessor')//No I18N
    }else{
        settingsGlobalRoute.transitionTo('Settings.Tools.TrapViewer.AddTrapProcessor');//No I18N
    }
    
}
function getTrapGenericTypeMsg(type){
    if(type==='coldstart'){//No I18n
        return Ember.I18n.t('webclient.admin.traps.coldstart',this);//No I18N
    }else if(type==='warmstart'){//No I18n
        return Ember.I18n.t('webclient.admin.traps.warmstart',this);//No I18N
    }else if(type==='linkdown'){//No I18n
        return Ember.I18n.t('webclient.admin.traps.linkdown',this);//No I18N
    }else if(type==='linkup'){//No I18n
        return Ember.I18n.t('webclient.admin.traps.linkup',this);//No I18N
    }else if(type==='authenticationFailure'){//No I18n
        return Ember.I18n.t('webclient.admin.traps.authfail',this);//No I18N
    }else if(type==='egpNeighborLoss'){//No I18n
        return Ember.I18n.t('webclient.admin.traps.nbrloss',this);//No I18N
    }else if(type==='-'){//No I18n
        return "-";//No I18N
    }else{
        return Ember.I18n.t('webclient.admin.traps.ent',this);//No I18N
    }
}
function startOrStopTrapViewer(params){
    if(!OPMClient.AlarmDetailsController.isTrapEnabled){
        return;
    }
    var action=OPMClient.SettingsTabController.startorstoptrapViewer;
    if(action==="StopTrapviewer"){
        msg=Ember.I18n.t('opu.snmp.SNMP_TRAP_SETTINGS_STOPPED');//No I18N
        OPMClient.SettingsTabController.startorstoptrapViewer = 'StartTrapviewer';//No I18N
        OPMClient.SettingsTabController.isTrapViewerListening = false;
        $('#startTrapViewer').show();
        $('#stopTrapViewer').hide();
    }else{
        msg=Ember.I18n.t('opu.snmp.SNMP_TRAP_SETTINGS_STARTED');//No I18N
        OPMClient.SettingsTabController.startorstoptrapViewer = 'StopTrapviewer';//No I18N
        OPMClient.SettingsTabController.isTrapViewerListening = true;
        $('#stopTrapViewer').show();
        $('#startTrapViewer').hide();
    }
    var data={"action":action,"wsId":sessionStorage.getItem("wsId")};//No I18N
    url = window.OPM.apiUrlPattern + '/tools/updateTrapViewerSettings';//No I18N
    var response = opm_ajaxPostRequest(url,data);	//No I18N
    if(response.status==="Failure"){
        opm_infoMsgs("errorMsg",response.message);	//No I18N
    }else{
        opm_infoMsgs("successMsg",msg);	//No I18N
    }
}
function getTrapRowforTrapViewer(params){
    if(OPMClient.SettingsTabController.isTrapViewerListening){
        var gridLen = $('#TrapViewerList').jqGrid('getRowData').length;
        if(gridLen>0){
            $("#TrapViewerList").jqGrid('addRowData',$.jgrid.randId(),params,'first');//No I18N
            if($('#TrapViewerList').jqGrid('getRowData').length>=1000){
                $("#TrapViewerList").jqGrid('delRowData',$("#TrapViewerList").jqGrid('getDataIDs')[gridLen]);//No I18N
            }
        }else{
            getTrapViewerUpdateList(OPMClient.SettingsOpUtilConfigController.trapViewerSelFunc,params);
        }
    }
}
function getTrapDetailsInfo(id,slideNo,onSelFunc){
    $('#TrapDetailsSlide').show();
    slideIn(slideNo);
    OPMClient.SettingsOpUtilConfigController.set("opu_slideHeader",Ember.I18n.t('opu.snmp.TRAP_VIEWER',this));//No I18N
    $("#TrapDetails").show();//No I18N
    $("#TrapDetailsDiv").show();//No I18N
    $.getJSON(window.OPM.apiUrlPattern + '/tools/getTrapDetails?trapID='+id,function(jsonData)//NO I18N
    {
        var colNamesList = [Ember.I18n.t('webclient.admin.profile.varbind', this), '','']; //No I18N
        var colModelList = [
            {name: 'varbind-values', index: 'varbind-values', sortable: false,formatter: trapDataFormat}, //No I18N
            {name: 'message', index: 'message', hidden: true}, //No I18N
            {name: 'values', index: 'values', hidden: true} //No I18N
        ];
        var defaultOptions = {"multiselect": false};//No I18N
        $("#TrapDetailsList").jqGrid("GridUnload");
        opm_loadJQgridWithData("#TrapDetailsList", jsonData.result.message, colNamesList, colModelList, "", "#TrapDetailsPager", onSelFunc,defaultOptions); //No I18N
        $('#trapSource').text(jsonData.result.source);
        $('agentAddrdiv').hide();
        if(jsonData.result.agent!=undefined&&jsonData.result.agent!=''){
            $('#agentAddrdiv').show();
            $('#agentAddr').text(jsonData.result.agent);
        }
        if(jsonData.result['specific-type']!=undefined&&jsonData.result['specific-type']!=''){
            $('#specificTypeDiv').show();
            $('#trapSpecificType').text(jsonData.result['specific-type']);//No I18N
        }
        $('#trapreceivedtime').text(jsonData.result['received-time']);//No I18n
        if(jsonData.result.version === 0){
            $('#trapVersion').text(Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+' 1');//No I18N
        }else if(jsonData.result.version === 1){
            $('#trapVersion').text(Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+' 2');//No I18N
        }else if(jsonData.result.version === 2){
            $('#trapVersion').text(Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+' 2c');//No I18N
        }else if(jsonData.result.version === 3){
            $('#trapVersion').text(Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+' 3');//No I18N
        }
        $('#trapOID').text(jsonData.result.oid);
        $('#trapGenType').text(getTrapGenericTypeMsg(jsonData.result.traptype));
        $('#TrapDetailsList').jqGrid('setGridWidth',$(".singleRow").width());
    });
}

function openOPUImportSummaryDetails(){
    var stool = $("#oputilsGoToInvBtn").attr("data-oputool");
    if(stool !== undefined &&  stool === "CFM"){
        location.href = window.OPM.apiclientUrl + "Inventory/List/OpUtils/CFM";//No I18N
    }else{
        redirectToSnapshot("IPAMSwitchGroup", "SPMGROUP_0",undefined,true);//No I18N
    }
}

function updateExcludeMACAddr(){
    var maclist = $('#Exclude_MAC_IP_List').val();//No I18N
    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/ipam/updateExcludeMAC?ExcludeMacs="+maclist);//No I18N
    if(response.error !== undefined && response.error.errorcode==="PATTERN_NOT_MATCHED"){
        alert(Ember.I18n.t('opu.common.ENTER_VALID_MAC',this)+".\n"+Ember.I18n.t('jsp.commonstr.NotesUseComma',this)+".");//No I18N
	}else{
        opu_smallSlideHandler(response);
    }
}


function getProbeDetails(){
    var allprobes = opm_ajaxGetResponse(window.OPM.apiUrlPattern +"/admin/listProbes"); //No I18n
    var probes =   opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/ipam/getOnlyIPAMEnabledProbes"); //No I18n
    var map = new Map();

    if(probes.result!=undefined && probes.result.length > 0 ){
        probes.result.forEach(
            function(item){
                map.set(item.id , item.name)
            }
         );
    }
    var probelist=[]
    var isSelected = true;
    $.each(allprobes, function(key,vals)  
    {
        if(OPMClient.InventoryOpUtilsController.selectedprobeid == vals.PRIMARY.probeID){
            isSelected = false;
            $('.opuLeftPanelDD .selection').text(vals.PRIMARY.probeDisplayName);
        }
        if(map.size == 0 ){
            probelist.push({'probeID':vals.PRIMARY.probeID,'probeName':vals.PRIMARY.probeDisplayName});//No I18n
        }
        else{
            if(map.get(vals.PRIMARY.probeID)!=undefined && map.get(vals.PRIMARY.probeID) == vals.PRIMARY.probeDisplayName ){
                probelist.push({'probeID':vals.PRIMARY.probeID,'probeName':vals.PRIMARY.probeDisplayName});//No I18n
            }
        }
    });
    OPMClient.InventoryOpUtilsController.selectedprobeid=probelist[0].probeID;
    OPMClient.InventoryOpUtilsController.selectedprobeName=probelist[0].probeName;
    if(isSelected){
        $('.opuLeftPanelDD .selection').text(probelist[0].probeName);
    }
    
    return probelist;
}
function changeOpUtilsProbeServer(probeid,probeName){
    if(OPMClient.InventoryOpUtilsController.selectedprobeid != probeid){
        $('.opuLeftPanelDD .selection').text(probeName);
        OPMClient.InventoryOpUtilsController.selectedprobeid=probeid;
        OPMClient.InventoryOpUtilsController.selectedprobeName=probeName;
        if(OPMClient.InventoryDeviceDetailsController.opuNewSnapshot)
        {   
            var snaptype = "IPAMSubnetGroupSummary";//NO I18N
            var groupid =  'GROUP';//NO I18N
            if(OPMClient.InventoryDeviceDetailsController.inventorysnapType =="IPAMSwitchGroup"  || OPMClient.InventoryDeviceDetailsController.inventorysnapType =="IPAMSwitch")
            {
                snaptype = "IPAMSwitchGroup";//NO I18N
                groupid =  'SPMGROUP';//NO I18N
            }
            redirectToSnapshot(snaptype, groupid+'_0.'+probeid,undefined,true)
        }else{
            getOpUtilsInvDevicesCount();
            oputilsInventoryReload(OPMClient.InventoryDeviceDetailsController.subFilterType)
        }
    }
}

function getOpUtilsInvDevicesCount(params)
{
    var url = window.OPM.apiUrlPattern + '/oputilsadmin/getInventoryTotalCounts';//NO I18N
    if(params !== undefined && params !== "")
    {
        url = opm_checkIndexOf(url,"?") ? url + params : url + "?" +params.substr(1); //No I18N
    }
    if(window.OPM.isCentralServer && !window.OPM.isEECentralSelected){
        url = eeClientReqToProbe(url,OPMClient.InventoryOpUtilsController.selectedprobeid);
    }
    $.getJSON(url,function(jsonData) 
    {
        if(jsonData.result !== undefined)
        {
            for(var i=0;i<jsonData.result.length;i++)
            {
                $('.opmGroupInventory li[data-nav="'+jsonData.result[i].tool+'"]').attr('data-count',jsonData.result[i].count);//NO I18N
            }
        }
    });
}
function alertForOverlapping(isOverlapped,subnetId){
    if($('input[id="sub_'+subnetId+'"]:checked').length>0){
        if(isOverlapped){
            alert(Ember.I18n.t('opu.ipam.delete_overlapping_subnet_msg', this));//NO I18N
        }
    }
}
function exportTreeData(rName,format)
{
    url = window.OPM.apiUrlPattern + '/oputilsreports/getOputilsReportsData?reportName='+rName+'&viewAs='+format;//No I18N
    location.href=url;
}

function flushAllDNSData()
{
    if(confirm(Ember.I18n.t("opu.ipam.FLUSH_DNS_CONFORM"))) { //NO I18N
    	var cbmethod = function(response){
            if(response.status === "Failure"){
                opm_infoMsgs("errorMsg",response.message); //No I18N
            }else if(response.error !=undefined && response.error.message!=undefined){
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
            }else{
                opm_infoMsgs("successMsg",Ember.I18n.t("webclient.devices.details.updatesuccess",this)); //No I18N
            }
        }
        var url =window.OPM.apiUrlPattern + "/ipam/ipamFlushAllDNS";//NO I18N
        opm_ajaxPostRequestWithMsg(url, undefined, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
    }
}

function refreshLoggedOnUser(){
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            opm_infoMsgs("successMsg",Ember.I18n.t('opu.spm.SCAN_STARTED_SUCCESSFULLY',this)); //No I18N
        }
    }
    var url =window.OPM.apiUrlPattern + "/ipam/executeLoggedOnUserScript";//NO I18N
    opm_ajaxPostRequestWithMsg(url, undefined, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}
function updateSPMSwitchSummaryDetails(prop){
    if (window.OPM.currentView.name.indexOf("Inventory.Device") != -1){
        var selectedDevice = OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet;
        if(selectedDevice != undefined && selectedDevice['switch-name'] == prop.switchname){
            var widId = $("#switchSummaryScanStatus").attr("widId");
            if(widId != undefined && prop.status == "2"){
                OPMClient.InventoryOpUtilsController.widgetID=parseInt(widId);
                reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID)
            }
            updateSwitchSummaryStatus(prop.status);
            updatePoeStatus(prop["poe-type"]);//No I18N
        }
    }
    var tableid = undefined;
    if(OPMClient.ApplicationController.currentPath === "Inventory.List.OpUtils.Sub.index" && OPMClient.InventoryDeviceDetailsController.subFilterType === "Switches")
    {
        tableid = "opm_Devices";//NO I18N
    }else if(OPMClient.ApplicationController.currentPath === "Inventory.Device.index" && OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSwitchGroup" && ($(".DIA-Header.oputilsHeader .intfSubTabs").find("li.active").attr("data-tabname") === "webclient.admin.statuspollsettings.switches")){//NO I18N
        tableid = $(".ipam.ipamGrid .ui-jqgrid-view .ui-jqgrid-bdiv").find("table").attr("id");
    }
    if(tableid != undefined){
        updatePoeStatus(prop["poe-type"]);//No I18N
        var rowid = -1;
        var switchname = prop.switchname
        if(switchname !== "null"){
            var spmSumRows = $("#"+tableid).jqGrid('getRowData');
            var totalLen = spmSumRows.length;
            for(r = 1; r <= totalLen; r++){
                var switch1 = $("#"+tableid).jqGrid('getCell',r,'switch-name');
                if(switchname == switch1){
                    var sstatus = prop.status;
                    if(sstatus ==2){//Scanned
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('opu.common.SCANNED'));
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","block");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp i").removeClass();//NO I18N
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp i").addClass("icon-status5");//NO I18N
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp i");//NO I18N
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp span").text(Ember.I18n.t('opu.common.SCANNED', this));//NO I18N
                        
                        var displayName = prop.displayName == undefined ? switchname : prop.displayName;
                        var usedcount = prop.used;
                        var totalcount = prop.total;
                        var availcount = prop.available;
                        var trancount = prop["transient"];
                        var pusagecount = prop.usage;
                        var lastscantime = prop.lastscantime;
                        if(usedcount != undefined){
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_display-name]").text(displayName);
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_total-count]").text(totalcount);
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_used-count]").text(usedcount);
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_available-count]").text(availcount);
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_transient-count]").text(trancount);
                            var switchusageprop = getOpUtilsUsageChartProp(pusagecount);
                            var usageClass = switchusageprop['class'];
                            var bgUtil = switchusageprop.bgUtil;
                            var ipUtil = switchusageprop.ipUtil;
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] div div div").removeClass();
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] div div div").addClass(usageClass);
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] div div div").width(bgUtil);
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] span").text(ipUtil+"%");//NO I18N
                        }
                        if(lastscantime != undefined){
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_last-scan-time]").text(lastscantime);
                        }
                    }else if(sstatus ==3){//failed switches
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('webclient.map.flash.failed', this));
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","block");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp i").removeClass();//NO I18N
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp i").addClass("icon-status1");//NO I18N
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp span").text(Ember.I18n.t('webclient.map.flash.failed', this));//NO I18N

                    }else if(sstatus ==1){//Scanning in progress
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('opu.common.IN_PROGRESS'));
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","block");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog span").text(Ember.I18n.t('opu.common.IN_PROGRESS'));//NO I18N
                    }
                    else if(sstatus == "6"){// waiting in Queue
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('opu.common.WAITING_QUE',true));
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","none");
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css('display','block');
                        $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus span").text(Ember.I18n.t('opu.common.WAITING_QUE',true));//NO I18N
                    }
                    break;
                }
            }
        }
    }
}
function updateSubnetScanStatus(prop){
    //Update status on subnet snapshot summary page
    if (OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSubnet"){
        var selectedDevice = OPMClient.InventoryOpUtilsController.opuSeletedDeviceDet;
        if(selectedDevice != undefined && selectedDevice['subnet-address'] == prop.subnetaddr){
            var widId = $("#subnetSummaryScanStatus").attr("widId");
            if(widId != undefined && prop.status === 2){//Scanned
                OPMClient.InventoryOpUtilsController.widgetID=parseInt(widId);
                reloadSnapWidgetsByWidgetID(OPMClient.InventoryOpUtilsController.widgetID);
		$('.select2').select2();
            }else{
                updateSubnetSummaryStatus(prop.status);
            }
        }
        return;
    }
    var tableid = undefined;
    if(OPMClient.ApplicationController.currentPath === "Inventory.List.OpUtils.Sub.index" && (OPMClient.InventoryDeviceDetailsController.subFilterType === "Subnets" || OPMClient.InventoryDeviceDetailsController.subFilterType === "Supernets"))
    {
        tableid = "opm_Devices";//NO I18N
    }else if(OPMClient.ApplicationController.currentPath === "Inventory.Device.index" && OPMClient.InventoryDeviceDetailsController.inventorysnapType === "IPAMSubnetGroupSummary" && ($(".DIA-Header.oputilsHeader .intfSubTabs").find("li.active").attr("data-tabname") === "opu.views.SUBNET_DETAILS")){//NO I18N
        tableid = $(".ipam.ipamGrid .ui-jqgrid-view .ui-jqgrid-bdiv").find("table").attr("id");
    }
    if(tableid != undefined){
        var rowid = -1;
        var subnetaddr = prop.subnetaddr
        if(subnetaddr !== "null"){
            if(subnetaddr === "refrespage"){
                if(window.OPM.currentView.name==="Inventory.Device.index" && OPMClient.InventoryDeviceDetailsController.subFilterType ==="Subnets"){
                    reloadSnapshotPage();
                }else if(OPMClient.InventoryDeviceDetailsController.subFilterType ==="Subnets"){
                    OPMClient.Inventory.oputils_loadListViewDetails();
                }
            }else{
                var ipamSumRows = $("#"+tableid).jqGrid('getRowData');
                var totalLen = ipamSumRows.length;
                for(r = 1; r <= totalLen; r++){
                    var subnet1 = $("#"+tableid).jqGrid('getCell',r,'subnet-address');
                    subnet1 = subnet1.split("/")[0];
                    if(subnetaddr == subnet1){
                        var sstatus = prop.status;
                        if(sstatus ==2){//Scanned
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('opu.common.SCANNED',true));
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","block");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamnotstarted").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp span").text(Ember.I18n.t('opu.common.SCANNED',true));
                            var usedcount = prop.used;
                            var totalcount = prop.total;
                            var availcount = prop.available;
                            var trancount = prop["transient"];
                            var pusagecount = prop.usage;
                            var lastscantime = prop.lastscantime;
                            if(usedcount != undefined){
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_subnet-size]").text(totalcount);
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedCount]").text(usedcount);
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_availableCount]").text(availcount);
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_transientCount]").text(trancount);
                                var subnetusageprop = getOpUtilsUsageChartProp(pusagecount);
                                var usageClass = subnetusageprop['class'];
                                var bgUtil = subnetusageprop.bgUtil;
                                var ipUtil = subnetusageprop.ipUtil;
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] div div div").removeClass();
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] div div div").addClass(usageClass);
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] div div div").width(bgUtil);
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_usedPercentage] span").text(ipUtil+"%");//NO I18N
                            }
                            if(lastscantime != undefined){
                                $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_last-scan-time]").text(lastscantime);
                            }
                        }else if(sstatus ==3){//failed subnet
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('webclient.map.flash.failed', this));
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamnotstarted").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","block");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp span").text(Ember.I18n.t('webclient.map.flash.failed', this));//NO I18N
                        }else if(sstatus ==1){//Scanning in progress
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('opu.common.IN_PROGRESS',true));
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamnotstarted").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","block");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog span").text(Ember.I18n.t('opu.common.IN_PROGRESS',true));                        
                        }else if(sstatus ==4){//Waiting in que
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status]").attr("title",Ember.I18n.t('opu.common.WAITING_QUE',true));
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatuscomp").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.spmstatusinprog").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamnotstarted").css("display","none");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus");
                            $("#"+tableid+" tr[id="+r+"] td[aria-describedby="+tableid+"_scan-status] div.ipamwaitingquestatus span").text(Ember.I18n.t('opu.common.WAITING_QUE',true));
                        }
                        break;
                    }
                }

            }
        }
    }
}

function opuEnableInterfacesAndScan(widgetId){
    var postData;
	if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.result != null){
		postData={"CONFIG_ID":OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.result["config-id"]};//No I18N
	}
	else{
		postData={"switchName":OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ipAddress};//No I18N
	}
    postData.wsId=sessionStorage.getItem("wsId");//No I18N
    var getSPMSettingsUrl = window.OPM.apiUrlPattern + "/oputilsadmin/getSPMSettings"; //No I18N
    var setSPMSettingsUrl = window.OPM.apiUrlPattern + "/oputilsadmin/updateSPMSettings?actionFrom=spmGenrelSettings"; //No I18N
    var scanSwitcUrl = window.OPM.apiUrlPattern + "/spm/scanSwitches"; //No I18N
    var response=opm_ajaxGetResponse(getSPMSettingsUrl);
    response=response.result.generalSettings;

    var data = new FormData();
    data.set("stackedPortCount",response.stackedPortCount); //No I18N
    data.set("noOfThread",response.queThreshold); //No I18N
    data.set("resolveDNS",response.isDnsResolve); //No I18N
    data.set("ifIndex","true"); //No I18N
    data.set("RememberMacAddress",(response.isRememberMac=="true")?1:0); //No I18N
    data.set("excludeTP4Scanning",response.isExcludeTp4Scan); //No I18N
    data.set("portlabel",response.portLabale); //No I18N
    data.set("pgcount",response.pgcount); //No I18N
    data.set("excludeTP4Export",response.excludeTP4Export); //No I18N
    data.set("spmtreedisplay",response.spmtreedisplay); //No I18N
    data.set("ciscoVlan",response.ciscoVlan); //No I18N
    data.set("stopSwitchARP",response.stopSwitchARP); //No I18N
    var successMsg=Ember.I18n.t('opu.common.YOUR_CHANGES_HAVE_BEEN_SAVED')+', '+Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY"); //No I18N
    var plsWaitMsg=Ember.I18n.t('opu.common.PROCESSING_PL_WAIT'); //No I18N

    var callback=function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            reloadSnapWidgetsByWidgetID(widgetId);
            opm_infoMsgs("successMsg",successMsg); //No I18N
            OPMClient.InventoryOpUtilsController.widgetID=widgetId;
        }
    }

    opm_ajaxPostRequestWithClbk(setSPMSettingsUrl, data, plsWaitMsg,
        function(response){
            if(response.status === "Success"){
                opm_ajaxPostRequestWithMsg(scanSwitcUrl, postData, plsWaitMsg, callback);
            }else if(response.status === "Failure"){//NO I18N
                opm_infoMsgs("errorMsg",response.message);//No I18N
            }
            else{
                opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.devices.snapshot.errormsglogs'));//No I18N
            }
        });
}

function oputilsAppendProbeID(url){
    if(window.OPM.isCentralServer)
    {
        if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice"){//Probe ID append when add switch from opm sample data of switch
            return eeClientReqToProbe(url,OPMClient.InventoryDeviceDetailsController.eeProbeID);
        }else{
            return eeClientReqToProbe(url,OPMClient.InventoryOpUtilsController.selectedprobeid);
        }
    }else{
        return eeClientReqToProbe(url);
    }
}
function getDevicesLists(skipPoller)
{

    var devUrl = window.OPM.apiUrlPattern + "/tools/getAllDevicesForTools"; //No I18N
    if(skipPoller !== "undefined" && skipPoller){
        devUrl+="?skipPoller="+skipPoller;//No I18N
    }
    OPMClient.SettingsOpUtilConfigController.set('snmpDeviceList',[]);//No I18N
    OPMClient.SettingsOpUtilConfigController.set('credentialList1',[]);//No I18N
    var jsonData = opm_ajaxGetResponse(devUrl);
        $.each(jsonData.result.deviceList, function (index, groups) {
            var group = {};
            group.ipAddress = groups['ipAddress'];
            group.name = groups['name'];
            group.displayName = groups['displayName'];
            OPMClient.SettingsOpUtilConfigController.snmpDeviceList.push(group);
        });
       
    var jsonData1 = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listCredentials"); //No I18N
    OPMClient.SettingsOpUtilConfigController.credentialList1.push({"checked":"None","type":"None","credentialName":"None","id":true});
    $.each(jsonData1.snmpcredential, function (index, groups) {
        var group = {};
        group.type = groups['type'];
        group.credentialName = groups['credentialName'];
        group.id = false;
        OPMClient.SettingsOpUtilConfigController.credentialList1.push(group);
    });
    $.each(jsonData1.snmpv3credential, function (index, groups) {
        var group = {};
        group.type = groups['type'];
        group.credentialName = groups['credentialName'];
        group.id = false;
        OPMClient.SettingsOpUtilConfigController.credentialList1.push(group);
    });
}
function EditSwitchesWithGroupName(){
    var spmgroups = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/spm/getGroupList');//No I18N
    $.each(spmgroups.result.spmNodes, function (index, groups) {
        var group = {};
        group.groupId = groups['group-id'];//No I18N
        group.groupName = groups['group-name'];//No I18N
        OPMClient.InventoryOpUtilsController.treegroupsList.push(group);
    });
}
function editSingleSwitchWithSelectedGroupName(){
    var selectedGroup = OPMClient.InventoryOpUtilsController.switchDetails["group-name"];//No I18N
        var spmgroups = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/spm/getGroupList');//No I18N
        $.each(spmgroups.result.spmNodes, function (index, groups) {
            var group = {};
             if (selectedGroup === groups['group-name']) {
                group.isSelected = true;
             }
             else{
                group.isSelected = false;
             }
            group.groupId = groups['group-id'];//No I18N
            group.groupName = groups['group-name'];//No I18N
            OPMClient.InventoryOpUtilsController.treegroupsList.push(group);
        });
}

function populateSwitchTaskName(isAddPageCall) {
    var selectedTaskId = OPMClient.InventoryOpUtilsController.switchDetails["task-id"];//No I18N
    var spmTasks = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/oputilsadmin/getSPMScheduledTasks');//No I18N
    OPMClient.InventoryOpUtilsController.spmTaskList = [];
    var newlyAddedScheduler = "";
    if(OPMClient.InventoryOpUtilsController.addingSwitchData != undefined) {
        newlyAddedScheduler = OPMClient.InventoryOpUtilsController.addingSwitchData.newlyAddedScheduler;
    }
    $.each(spmTasks.result, function(index, tasks) {
        var taskId = tasks['task-id'];//No I18N
        var taskName = tasks['task_name'];//No I18N
        if(taskName=="Default Group"){
            tasks['task_name'] = taskName = "Default Task"; //No I18N
        }
        var isSelected = isAddPageCall ? taskName === "Default Task" : selectedTaskId === taskId; //No I18N
        if (newlyAddedScheduler != undefined && newlyAddedScheduler != "") {
            isSelected = newlyAddedScheduler === taskName;
            if (isSelected) {
                newlyAddedScheduler = "";
                OPMClient.InventoryOpUtilsController.addingSwitchData.newlyAddedScheduler = "";
            }
        }
        OPMClient.InventoryOpUtilsController.spmTaskList.push({taskId: taskId, taskName: taskName, isSelected: isSelected});
    });
}
function getSubnetMaskList(){                                                        //approvable subnetMaskList
    return  ["255.255.255.0","255.255.255.128","255.255.255.192","255.255.255.224","255.255.255.240","255.255.255.248","255.255.255.252","255.255.255.254","255.255.255.255","255.255.0.0","255.255.128.0","255.255.192.0","255.255.224.0","255.255.240.0","255.255.248.0","255.255.252.0","255.255.254.0"];
}
function adDomainForAddSubnet(isAddDHCPPage){
    var jsonObj = [];
    $.ajax({
        url: window.OPM.apiUrlPattern + "/ipam/getAdDomainList", //No I18N
        type: 'GET', //No I18N
        async: false,
        dataType: 'json', //No I18N
        success: function (jsonData)
        {
            if (jsonData.status == "Success") {
                var totalAD = jsonData.result.domainDetails.length;
                for (i = 0; i < totalAD; i++) {
                    var isselectedad=false;
                    if(isAddDHCPPage){
                        if(OPMClient.InventoryOpUtilsController.ADDomainAdded!==""&&OPMClient.InventoryOpUtilsController.ADDomainAdded===jsonData.result.domainDetails[i]["ad-domain-name"]){//NO I18N
                            isselectedad=true;
                        }
                    }
                    else if(jsonData.result.domainDetails[i]["ad-domain-name"] === OPMClient.InventoryOpUtilsController.subnetDetails['ad-domain-name']){
                        isselectedad=true;
                    }
                    jsonObj[i] = {"ad-domain-name": jsonData.result.domainDetails[i]["ad-domain-name"], "ad-domain-id": jsonData.result.domainDetails[i]["ad-domain-id"], "ad-domain-contr": jsonData.result.domainDetails[i]["domain-controller-name"], "IsValidAd": jsonData.result.domainDetails[i].isValid, "isSelected": isselectedad}//NO I18N
                }
            }
        }
    });
    OPMClient.InventoryOpUtilsController.set("adDomainForAddSubnet", {"domainDetails": jsonObj}); //No I18N
}
function listADComputers(domainID,domainName){
    if(!window.OPM.isCentralServer){
            $("#listingADComp").show();
            $('body').addClass('slideDivIn-12');
            OPMClient.SettingsOpUtilConfigController.adDomainId = domainID;
            var rsp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/ipam/getADComputersList?domainId="+domainID);//No I18N
            $("#adCompHeader").text(rsp["list_header_message"]);//No I18N
            listADComputersInGrid(rsp);
            showMessage(rsp,"oputils_listAD","");//No I18N 
    }else{
        opm_infoMsgs('errorMsg',Ember.I18n.t("webclient.api.xml.blockedurl",this));//No I18N
    }
}
function deleteOpUtilsAD(cellValue, options, rowdata, action)
{
    return "<span class='mr-sm' data-title:'Delete' onclick='deleteOPUAD(&#39;"+rowdata["ad-domain-name"]+"&#39);'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#delete'></use></svg></span><span class='mr-sm' title='"+Ember.I18n.t('opu.views.ad.list')+"' data-title:'ListADComputers' onclick='listADComputers(&#39;"+rowdata["ad-domain-id"]+"&#39,&#39;"+rowdata["ad-domain-name"]+"&#39);'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#multiple-device'></use></svg></span>"; //No I18n
}

function probeTree(treeData){
    $('#oputree').jstree('destroy');
    $('#oputree').on('loaded.jstree', function() {
        $('#oputree').jstree("open_all");
        $('.header .icon-collapse, .treeFilter.opuInvSubFilter .icon-collapse').click(function(){
            $('#oputree').jstree('open_all');
        })
        $('.header .icon-minus, .treeFilter.opuInvSubFilter .icon-minus').click(function(){
            $('#oputree').jstree('close_all')
            setTimeout(function(){
                $('#oputree').jstree("open_node", $("#opuAllCustomers"));
            },10);
        })
    }).on('select_node.jstree', function (e, data) {
        var probeid = data.node.original.probeid;
        var custid=data.node.original.custid;
        params=""
        if(window.OPM.isMSPCentral){
            params="&mspProbe="+probeid+"&mspCustomer="+custid;//No I18N
        }
        if(window.OPM.isEECentralSelected && probeid!='-1'){
            params="&ProbeID="+probeid;//No I18N
        }
        getOpUtilsInvDevicesCount(params)
        OPMClient.Inventory.oputils_loadListViewDetails(params);
    }).jstree({
        'core': {//NO I18N
            'data': treeData, //NO I18N
            'force_text': true, //NO I18N
            'multiple': false //NO I18N
        },
        "animation" : 0,//NO I18N
        "themes" : { "stripes" : true }//NO I18N
    });
}

function mspTreeData(tool){
    var resp=opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/oputilsadmin/getInventoryDeviceCounts?tool="+tool);//No I18N
    if(!resp.result){
        resp.result={};
    }
    var foundPrevious = $('#oputree').jstree('get_selected', true)[0].original;
    var isFullTree = (window.OPM.selCustomerID=='-1')
    var dispName= Ember.I18n.t("webclient.settings.customer.all",true);//No I18N
    if(resp.result["-1"]!=null){
        dispName=dispName+' ( '+resp.result["-1"]+' )';
    }
    var mspTree = !isFullTree ? {} : {'id':'opuAllCustomers','text':dispName,'custid':'-1','probeid':'-1','children':[],'icon':'all-customers',state:{selected:!foundPrevious || foundPrevious.id=='opuAllCustomers'}};//No I18N
    var customers=window.OPM.customerNameList;
    for(var i=0;i<customers.length;i++){
        var customerid=customers[i].CustomerID;
        if(customerid==window.OPM.selCustomerID || isFullTree){
            dispName=customers[i].CustomerName;
            if(resp.result[customerid]!=null){
                dispName=dispName+' ( '+resp.result[customerid]+' )';
            }
            var node={'id':customerid+'.-1','text':dispName,'custid':customerid,'probeid':'-1','children':[],'icon':'customer',state:{selected:(!isFullTree && !foundPrevious) || (foundPrevious && foundPrevious.id==(customerid+'.-1'))}}//No I18N
            var probes=customers[i].ProbeInfo;
            for(var j=0;j<probes.length;j++){
                probeid=probes[j].RegionID;
                dispName=probes[j].ProbeDisplayName
                if(resp.result[probeid]!=null){
                    dispName=dispName+' ( '+resp.result[probeid]+' )';
                }
                node.children.push({'id':customerid+'.'+probeid,'text':dispName,'custid':customerid,'probeid':probeid,'icon':'probe',state:{selected:foundPrevious && foundPrevious.id==(customerid+'.'+probeid)}})
            }
            if(isFullTree){
                mspTree.children.push(node)
            }
            else{
                mspTree=node;
                break;
            }
        }
    }
    return mspTree;
}

function centralTreeData(tool){
    var resp=opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/oputilsadmin/getInventoryDeviceCounts?tool="+tool);//No I18N
    if(!resp.result){
        resp.result={};
    }
    var foundPrevious = $('#oputree').jstree('get_selected', true)[0].original;
    var dispName= Ember.I18n.t("webclient.dashboard.allprobes",true);//No I18N
    if(resp.result["-1"]!=null){
        dispName=dispName+' ( '+resp.result["-1"]+' )';
    }
    var treeData={'text':dispName,'probeid':'-1','children':[],'icon':'all-customers',state:{selected:!foundPrevious || foundPrevious.probeid=='-1'}};//No I18N
    var probes=OPMClient.ApplicationController.probeList;
    for(var i=0;i<probes.length;i++){
        dispName=probes[i].DISPLAYNAME;
        probeid=probes[i].PROBEID
        if(resp.result[probeid]!=null && resp.result[probeid] >0 ){//To show only IPAM and SPM which have atleast one subnet or switch in central tree
            dispName=dispName+' ( '+resp.result[probeid]+' )';
            treeData.children.push({'text':dispName,'probeid':probeid,'icon':'probe',state:{selected:foundPrevious && foundPrevious.probeid==probeid}});
        }
    }
    return treeData;
}
function renderNewColChooser(obj){
    var gridTable = obj.id;
    var displayedColStr="",hiddenColStr="", addOnName = "";
    for (var index = 0; index < obj.colModelList.length; index++) {
        addOnName = "";
        var column1 = obj.colModelList[index];
        var isVisible = column1.hidden == null || column1.hidden == false;
        var colName=htmlEncode(obj.colNamesList[index]);
        if(window.OPM.isOPM && window.OPM.currentView.name.indexOf("Inventory") !== -1) {
            if(column1.index.indexOf("NCMRESOURCECUSTOMCOLUMN") !== -1) {
                addOnName = "NCM";
            } else if(column1.index.indexOf("SPMSwitchLevelCustomField") !== -1) {
                addOnName = "SPM";
            }
        }
        if(column1.hidedlg == null || column1.hidedlg != true){
            if(isVisible){
                displayedColStr+="<li><div class='opmCheckBox small'><div><input type='checkbox' checked colIndex='"+index+"'><label class='word-break'>"+colName +( addOnName ? ("<span class='yellow-tag'>" + addOnName +"</span>") : '')+"</label></div></div><svg class='sortable-icon svgIcon size14'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#drag'/></svg></li>"
            }
            else{
                hiddenColStr+="<li><div class='opmCheckBox small'><div><input type='checkbox' colIndex='"+index+"'><label class='word-break'>"+colName+ ( addOnName ? ("<span class='yellow-tag'>" + addOnName +"</span>") : '')+"</label></div></div><svg class='sortable-icon svgIcon size14'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#drag'/></svg></li>"
            }
        }
        else if(isVisible && colName.trim().length != 0){
            displayedColStr+="<li><div class='opmCheckBox small'><div><input type='checkbox' checked disabled colIndex='"+index+"'><label class='word-break'>"+colName +( addOnName ? ("<span class='yellow-tag'>" + addOnName +"</span>") : '')+"</label></div></div><svg class='sortable-icon svgIcon size14'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#drag'/></svg></li>"
        }
    }
    var colChooserContainer = document.querySelector('#colchooser_' + gridTable.substring(1) + '>div');//No I18N
    colChooserContainer.innerHTML = "<div id='"+gridTable.substring(1)+"_sortableDiv' class='height-full'><ul class='column-chooser-list'>"+displayedColStr+hiddenColStr+"</ul></div>";
    var colChooserList = $(gridTable+"_sortableDiv .column-chooser-list");
    $(gridTable+"_sortableDiv .sortable-icon").mousedown(function () {
        var placeholderHeight=$(this).parent().outerHeight();
        colChooserList.sortable({
            placeholder:'column-chooser-highlight',//No I18N
            axis: "y",//No I18N
            start: function (event, ui) {
                colChooserList.addClass('column-grabbing')
                ui.placeholder.height(placeholderHeight-10+"px");//No I18N
            },
            stop: function () {
                colChooserList.removeClass('column-grabbing')
                colChooserList.sortable("disable");//No I18N
            }
        });
        colChooserList.sortable( "option", "disabled", false );//No I18N
    });
}

function sortNewColChooser(obj,jsonData,selectedColChooserArr){
    var sortIndex=[]
    var columnMap={}
    var visibleCols = jsonData[obj.gridTableId];
    if(jsonData[obj.gridTableId] != null && jsonData[obj.gridTableId].length > 0) {
        for (var index = 0; index < obj.colModelList.length; index++) {
            var column1 = obj.colModelList[index];
            var indexFound = visibleCols.indexOf(column1.index) != -1;
            var nameFound = visibleCols.indexOf(column1.name) != -1;
            var isVisible = column1.hidden == null || column1.hidden == false;
            if(column1.hidedlg == null || column1.hidedlg != true) {
                if(indexFound || nameFound) {
                    selectedColChooserArr.push(column1.name);
                    column1.hidden=false;
                    sortIndex.push(index);
                    var key=indexFound?column1.index:column1.name;
                    columnMap[key]=[column1,obj.colNamesList[index]];
                } else {
                    column1.hidden=true;
                }
            }
            else if(isVisible && (indexFound || nameFound) && obj.colNamesList[index].trim().length != 0) {
                    sortIndex.push(index);
                    var key=indexFound?column1.index:column1.name;
                    columnMap[key]=[column1,obj.colNamesList[index]];
            }
        }
        sortIndex.sort(function(a, b){return a-b});
        for(var i=0,j=0;i<visibleCols.length && j<sortIndex.length;i++){
            if(columnMap[visibleCols[i]]){
                obj.colModelList[sortIndex[j]]=columnMap[visibleCols[i]][0];
                obj.colNamesList[sortIndex[j]]=columnMap[visibleCols[i]][1];
                j++;
                delete columnMap[visibleCols[i]];
            }
        }
    }
    else if(jsonData[obj.gridTableId] == null || jsonData[obj.gridTableId].length == 0) {
        selectedColChooserArr.push('isSuppressed');
    }
}

function saveNewColChooser(obj,selectedColChooserArr){
    var selectedCols=[];
    var gridTable = obj.id;
    $(gridTable+"_sortableDiv input:checked").each(function() {
        var idx=$(this).attr('colIndex');
        if(obj.onSelectFunction !== "opm_DevicesList"){
            selectedCols.push(obj.colModelList[idx].name);
        }else{
            selectedCols.push(obj.colModelList[idx].index);
            if(obj.colModelList[idx].hidedlg == null || obj.colModelList[idx].hidedlg!=true){
                
                obj.colModelList[idx].index != 'isSuppressed' ? selectedColChooserArr.push(obj.colModelList[idx].index) : '';
            }
        }
    });
    return selectedCols;
}
function probeTree(treeData){
    $('#oputree').jstree('destroy');
    $('#oputree').on('loaded.jstree', function() {
        $('#oputree').jstree("open_all");
        $('.header .icon-collapse, .treeFilter.opuInvSubFilter .icon-collapse').click(function(){
            $('#oputree').jstree('open_all');
        })
        $('.header .icon-minus, .treeFilter.opuInvSubFilter .icon-minus').click(function(){
            $('#oputree').jstree('close_all')
            setTimeout(function(){
                $('#oputree').jstree("open_node", $("#opuAllCustomers"));
            },10);
        })
    }).on('select_node.jstree', function (e, data) {
        var probeid = data.node.original.probeid;
        var custid=data.node.original.custid;
        params=""
        if(window.OPM.isMSPCentral){
            params="&mspProbe="+probeid+"&mspCustomer="+custid;//No I18N
        }
        if(window.OPM.isEECentralSelected && probeid!='-1'){
            params="&ProbeID="+probeid;//No I18N
        }
        getOpUtilsInvDevicesCount(params)
        OPMClient.Inventory.oputils_loadListViewDetails(params);
    }).jstree({
        'core': {//NO I18N
            'data': treeData, //NO I18N
            'force_text': true, //NO I18N
            'multiple': false //NO I18N
        },
        "animation" : 0,//NO I18N
        "themes" : { "stripes" : true }//NO I18N
    });
}

function mspTreeData(tool){
    var resp=opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/oputilsadmin/getInventoryDeviceCounts?tool="+tool);//No I18N
    if(!resp.result){
        resp.result={};
    }
    var foundPrevious = $('#oputree').jstree('get_selected', true)[0].original;
    var isFullTree = (window.OPM.selCustomerID=='-1')
    var dispName= Ember.I18n.t("webclient.settings.customer.all",true);//No I18N
    if(resp.result["-1"]!=null){
        dispName=dispName+' ( '+resp.result["-1"]+' )';
    }
    var mspTree = !isFullTree ? {} : {'id':'opuAllCustomers','text':dispName,'custid':'-1','probeid':'-1','children':[],'icon':'all-customers',state:{selected:!foundPrevious || foundPrevious.id=='opuAllCustomers'}};//No I18N
    var customers=window.OPM.customerNameList;
    for(var i=0;i<customers.length;i++){
        var customerid=customers[i].CustomerID;
        if(customerid==window.OPM.selCustomerID || isFullTree){
            dispName=customers[i].CustomerName;
            if(resp.result[customerid]!=null){
                dispName=dispName+' ( '+resp.result[customerid]+' )';
            }
            var node={'id':customerid+'.-1','text':dispName,'custid':customerid,'probeid':'-1','children':[],'icon':'customer',state:{selected:(!isFullTree && !foundPrevious) || (foundPrevious && foundPrevious.id==(customerid+'.-1'))}}//No I18N
            var probes=customers[i].ProbeInfo;
            for(var j=0;j<probes.length;j++){
                probeid=probes[j].RegionID;
                dispName=probes[j].ProbeDisplayName
                if(resp.result[probeid]!=null){
                    dispName=dispName+' ( '+resp.result[probeid]+' )';
                }
                node.children.push({'id':customerid+'.'+probeid,'text':dispName,'custid':customerid,'probeid':probeid,'icon':'probe',state:{selected:foundPrevious && foundPrevious.id==(customerid+'.'+probeid)}})
            }
            if(isFullTree){
                mspTree.children.push(node)
            }
            else{
                mspTree=node;
                break;
            }
        }
    }
    return mspTree;
}

function centralTreeData(tool){
    var resp=opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/oputilsadmin/getInventoryDeviceCounts?tool="+tool);//No I18N
    if(!resp.result){
        resp.result={};
    }
    var foundPrevious = $('#oputree').jstree('get_selected', true)[0].original;
    var dispName= Ember.I18n.t("webclient.dashboard.allprobes",true);//No I18N
    if(resp.result["-1"]!=null){
        dispName=dispName+' ( '+resp.result["-1"]+' )';
    }
    var treeData={'text':dispName,'probeid':'-1','children':[],'icon':'all-customers',state:{selected:!foundPrevious || foundPrevious.probeid=='-1'}};//No I18N
    var probes=OPMClient.ApplicationController.probeList;
    for(var i=0;i<probes.length;i++){
        dispName=probes[i].DISPLAYNAME;
        probeid=probes[i].PROBEID
        if(resp.result[probeid]!=null && resp.result[probeid] >0 ){//To show only IPAM and SPM which have atleast one subnet or switch in central tree
            dispName=dispName+' ( '+resp.result[probeid]+' )';
            treeData.children.push({'text':dispName,'probeid':probeid,'icon':'probe',state:{selected:foundPrevious && foundPrevious.probeid==probeid}});
        }
    }
    return treeData;
}
function showKB(hideId, showId){
    $('#'+hideId).hide();
    $('#'+showId).show();
}
function hideKB(hideId,showId) {
    $('#'+hideId).hide();
    $('#'+showId).show();
}
function listADComputers(domainID,domainName){
    if(!window.OPM.isCentralServer){
            $("#listingADComp").show();
            $('body').addClass('slideDivIn-12');
            OPMClient.SettingsOpUtilConfigController.adDomainId = domainID;
            var rsp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/ipam/getADComputersList?domainId="+domainID);//No I18N
            $("#adCompHeader").text(rsp["list_header_message"]);//No I18N
            listADComputersInGrid(rsp);
            showMessage(rsp,"oputils_listAD","");//No I18N 
    }else{
        opm_infoMsgs('errorMsg',Ember.I18n.t("webclient.api.xml.blockedurl",this));//No I18N
    }
}
function deleteOpUtilsAD(cellValue, options, rowdata, action)
{
    return "<span class='mr-sm' data-title:'Delete' onclick='deleteOPUAD(&#39;"+rowdata["ad-domain-name"]+"&#39);'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#delete'></use></svg></span><span class='mr-sm' title='"+Ember.I18n.t('opu.views.ad.list')+"' data-title:'ListADComputers' onclick='listADComputers(&#39;"+rowdata["ad-domain-id"]+"&#39,&#39;"+rowdata["ad-domain-name"]+"&#39);'><svg class='svgIcon size16'><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#multiple-device'></use></svg></span>"; //No I18n
}
function associateCredential(dhcpaddr){
    OPMClient.InventoryOpUtilsController.set('allDHCPServers',[]);
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAllDHCPServers');//No I18N
    $.each(jsonData.rows, function (key, value) {
        var group = {};
        if (dhcpaddr === value['dhcp-server-address']) {
            group.isSelected = true;
            OPMClient.InventoryOpUtilsController.set('associatedDHCPDomain',value['ad-domain-id']);//No I18N
        }
        else{
            group.isSelected = false;
        }
        if(value['server-type-int'] !== null && value['server-type-int'] !== "" && value['server-type-int'] !== undefined && value['server-type-int'] === "1"){
            if(value.winrmOption !== undefined && value.winrmOption !== null){
                group.winrmOption = value.winrmOption;
            }
            if(value.winrmEnableState !== undefined && value.winrmEnableState !== null){
                group.winrmEnableState = (value.winrmEnableState === "true");
            }
            if(value.authType !== undefined && value.authType !== null){
                group.authType = value.authType;
            }
            if(value.winrmProtocol !== undefined && value.winrmProtocol !== null){
                group.winrmProtocol = value.winrmProtocol;
            }
            if(value.winrmPort !== undefined && value.winrmPort !== null){
                group.winrmPort = value.winrmPort;
            }
            group.serverTypeInt = value['server-type-int'];//No I18N
        }
        group.serverID = value['dhcp-server-id'];//NO I18N
        group.serverName=value['dhcp-server-address'];//NO I18N
        group.domainName = value['ad-domain-name'];//No I18N
        OPMClient.InventoryOpUtilsController.allDHCPServers.push(group);
    });
    OPMClient.InventoryOpUtilsController.set('dhcpServerIP',dhcpaddr);//No I18N
    getADDomainList();

    opmGlobalRoute.transitionTo('Inventory.Device.AssociateDHCP');//No I18N
}
function associateDNSCredential(dnsaddr){
    OPMClient.InventoryOpUtilsController.set('allDNSServers',[]);//No I18N
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAllDNSServers');//No I18N
    $.each(jsonData.rows, function (key, value) {
        var group = {};
        if (dnsaddr == value['DNSServerAddress']) {
            group.isSelected = true;
            OPMClient.InventoryOpUtilsController.set('associatedDNSDomain',value['DomainID']);//No I18N
        }
        else{
            group.isSelected = false;
        }
        group.serverID = value['DNSServerID'];//NO I18N
        group.DNSServerID = value['DNSServerID'];//NO I18N
        group.serverName=value['DNSServerAddress'];//NO I18N
        group.domainName = value['ad-domain-name'];//No I18N
        group.serverTypeInt = value['DNSServerTypeInt'] || value['dns-server-type-int'] || 1; //No I18N
        group.serverType = group.serverTypeInt;
        if(value['DNSServerTypeInt'] !== null && value['DNSServerTypeInt'] !== "" && value['DNSServerTypeInt'] !== undefined && value['DNSServerTypeInt'] == 1){
            if(value.winrmOption !== undefined && value.winrmOption !== null){
                group.winrmOption = value.winrmOption;
            }
            if(value.winrmEnableState !== undefined && value.winrmEnableState !== null){
                group.winrmEnableState = (value.winrmEnableState === "true");
            }
            if(value.authType !== undefined && value.authType !== null){
                group.authType = value.authType;
            }
            if(value.winrmProtocol !== undefined && value.winrmProtocol !== null){
                group.winrmProtocol = value.winrmProtocol;
            }
            if(value.winrmPort !== undefined && value.winrmPort !== null){
                group.winrmPort = value.winrmPort;
            }
        }
        else if(value['DNSServerTypeInt'] !== null && value['DNSServerTypeInt'] !== "" && value['DNSServerTypeInt'] !== undefined && value['DNSServerTypeInt'] == 2){
            if(value['CloudCredID'] !== undefined && value['CloudCredID'] !== null){
                group.awsCredId = value['CloudCredID'];//No I18N
            }
        }
        else if(value['DNSServerTypeInt'] !== null && value['DNSServerTypeInt'] !== "" && value['DNSServerTypeInt'] !== undefined && value['DNSServerTypeInt'] == 3){
            if(value['CloudCredID'] !== undefined && value['CloudCredID'] !== null){
                group.gcpCredId = value['CloudCredID'];//No I18N
            }
        }
        OPMClient.InventoryOpUtilsController.allDNSServers.push(group);
    });
    OPMClient.InventoryOpUtilsController.set('dnsServerIP',dnsaddr);//No I18N
    getADDomainListForDNS();

    opmGlobalRoute.transitionTo('Inventory.Device.AssociateDNS');//No I18N
}
function getAllDHCPServersList(){
    OPMClient.InventoryOpUtilsController.set('allDHCPServers',[]);//No I18N
    var isDHCPNotAssociated = false;
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAllDHCPServers');//No I18N
    $.each(jsonData.rows, function (key, value) {
        var group = {};
        group.serverID = value['dhcp-server-id'];//NO I18N
        group.serverName=value['dhcp-server-address'];//NO I18N
        group.scanStatus=value['scan-status'];//No I18N
        group.serverType=value['server-type']//No I18N
        group.serverTypeInt=value['server-type-int']//No I18N
        if(value['scan-status'] == 5){
            isDHCPNotAssociated = true;
            group.isSelected = true;
            OPMClient.InventoryOpUtilsController.set('dhcpServerIP',value['dhcp-server-address']);//No I18N
        }else{
            group.isSelected = false;
        }
        OPMClient.InventoryOpUtilsController.allDHCPServers.push(group);
    });

    getADDomainList(isDHCPNotAssociated);
}

function changeSelectedServerType(dhcpServerData){
    var serverTypeInt = dhcpServerData['server-type-int'];//No I18N
    $("#dhcpserverType").select2().val(serverTypeInt).trigger("change"); //No I18N
    ipamdhcpAddOptions(serverTypeInt)
}

function getMicrosoftDNSServersList(){
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAllDNSServers');//No I18N
	if (jsonData.rows && jsonData.rows.length > 0){
		OPMClient.InventoryOpUtilsController.set("isWindowsDNSServerAdded",true);//No I18N
	}else{
		OPMClient.InventoryOpUtilsController.set("isWindowsDNSServerAdded",false);//No I18N
	}
}
function getMicrosoftDHCPServersList(){
    OPMClient.InventoryOpUtilsController.set('allDHCPServers',[]);//No I18N
    var isDHCPNotAssociated = false;
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAllDHCPServers');//No I18N
    $.each(jsonData.rows, function (key, value) {
        if(value['server-type-int'] != undefined && value['server-type-int'] == "1"){
            var group = {};
            group.serverID = value['dhcp-server-id'];//NO I18N
            group.serverName=value['dhcp-server-address'];//NO I18N
            group.scanStatus=value['scan-status'];//No I18N
            group.serverType=value['server-type']//No I18N
            group.serverTypeInt=value['server-type-int']//No I18N
            group.className="dhcpCredentials"//No I18N
            if(value['scan-status'] == 5){
                group.isSelected = true;
                OPMClient.InventoryOpUtilsController.set('dhcpServerID',value['dhcp-server-id']);//No I18N
                OPMClient.InventoryOpUtilsController.set('dhcpServerIP',value['dhcp-server-address']);//No I18N
            }else{
                group.isSelected = false;
            }
            OPMClient.InventoryOpUtilsController.allDHCPServers.push(group);
	if(window.OPM.userPermissions.ipamWrite && !window.OPM.userPermissions.opuRestricted){
            	OPMClient.InventoryOpUtilsController.set("isMicroSoftDHCPServerAdded",true);//NO I18N
	}
        }
    });
}

function getADDomainList(isDHCPNotAssociated){
    var jsonObj = [];
    OPMClient.InventoryOpUtilsController.adDomainForAddSubnet=[];
    var adJSONData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAdDomainList');//No I18N
    if (adJSONData.status == "Success") {
        var totalAD = adJSONData.result.domainDetails.length;
        for (i = 0; i < totalAD; i++) {
            var isselectedad=false;
            if(isDHCPNotAssociated != true){
                if(OPMClient.InventoryOpUtilsController.associatedDHCPDomain!==""&&OPMClient.InventoryOpUtilsController.associatedDHCPDomain===adJSONData.result.domainDetails[i]["ad-domain-id"]){//NO I18N
                    isselectedad=true;
                }
            }
            jsonObj[i] = {"ad-domain-name": adJSONData.result.domainDetails[i]["ad-domain-name"], "ad-domain-id": adJSONData.result.domainDetails[i]["ad-domain-id"], "ad-domain-contr": adJSONData.result.domainDetails[i]["domain-controller-name"], "IsValidAd": adJSONData.result.domainDetails[i].isValid,"isSelected": isselectedad}//NO I18N
        }
        OPMClient.InventoryOpUtilsController.set("adDomainForAddSubnet", {"domainDetails": jsonObj}); //No I18N
    }
}
function getADDomainListForDNS(isDNSNotAssociated){
    var jsonObj = [];
    OPMClient.InventoryOpUtilsController.adDomainForAddSubnet=[];
    var adJSONData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getAdDomainList');//No I18N
    if (adJSONData.status == "Success") {
        var totalAD = adJSONData.result.domainDetails.length;
        for (i = 0; i < totalAD; i++) {
            var isselectedad=false;
            if(isDNSNotAssociated != true){
                if(OPMClient.InventoryOpUtilsController.associatedDNSDomain!==""&&OPMClient.InventoryOpUtilsController.associatedDNSDomain==adJSONData.result.domainDetails[i]["ad-domain-id"]){//NO I18N
                    isselectedad=true;
                }
            }
            jsonObj[i] = {"ad-domain-name": adJSONData.result.domainDetails[i]["ad-domain-name"], "ad-domain-id": adJSONData.result.domainDetails[i]["ad-domain-id"], "ad-domain-contr": adJSONData.result.domainDetails[i]["domain-controller-name"], "IsValidAd": adJSONData.result.domainDetails[i].isValid,"isSelected": isselectedad}//NO I18N
        }
        OPMClient.InventoryOpUtilsController.set("adDomainForAddSubnet", {"domainDetails": jsonObj}); //No I18N
    }
}
function closeAssociateDHCPPopup()
{
    $("#associateDHCPAlert").hide();//No I18N
    $("#associateDHCPAlert").dialog( "close" );
    $("#v2BodyHolder").removeClass("ui-dialog-style2");
}
function closeEnableOpUtilsPopUp(){
    $("#spmenableportpopup").hide();
}
function openEnableOpUtilsPopUp(){
    $("#spmenableportpopup").show();
}

function downloadConnectedIPDetailsReport(params){
    var url = opm_getOpUtilsReportsAPIURL()+'getOputilsReportsData?'+"viewAs=CSV&reportName=connectedIPDetails";//No I18N
    if(params != null){
        url= url+"&"+params;//No I18N
    }
    if(window.OPM.isEEProbeSelected){
        url = appendProbeIDForExternal(url,window.OPM.selectedEEProbe);
    }
    url = url +'&wsId='+sessionStorage.getItem("wsId");//No I18N
    location.href=url;
}
function exportConnectedIPDetails(params)
{
    var selr = $('#opm_Devices').jqGrid('getGridParam','selarrrow');
    var colName = 'deviceName';//No I18N
    if(params!==undefined && params==='NFA'){
        colName = 'Name';//No I18N
    }
    var entityArr=new Array();
    if(selr!==undefined && selr.length > 0)
    {
        $.each(selr, function(){
            var id = this;
            var entity = $('#opm_Devices').jqGrid('getCell', id, colName); 
            entityArr.push(entity);
        });
    }
    downloadConnectedIPDetailsReport("devicename="+entityArr.toString());//No I18N
}
function addRemoteDC(event){
    if (event.keyCode === 13 || event.keyCode === 44) {
        $('#multipleRdc').off('keypress');
        var rdcArray = $('#multipleRdc').val().split(",");
        for(var i=0;i<rdcArray.length;i++){
            var rdcName =  rdcArray[i];
            rdcName = rdcName.replace(/[^a-zA-Z0-9.!:@#$\s\-\_\\\/\']/ig,'');
            if(rdcName.length != 0){
                OPMClient.SettingsOpUtilConfigController.multipleRDC.pushObject(trimAll(rdcName));
            }
        }
        $('#multipleRdc').val('');
    }
}
function deviceCredDetails(toolType){
    var deviceList=[];
    var response =  opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/tools/getWmiOrCliDeviceList?deviceType="+toolType);//NO i18N
    if(response != undefined){
        $.each(response.result,function(k,v) {
            var deviceDetails = {};
            deviceDetails.displayName = v.displayName;
            deviceDetails.ipAddress = v.ipAddress;
            deviceDetails.isCredentialAssociated = v.isCredentialAssociated;
            deviceDetails.deviceName = v.deviceName;
            if(v.isCredentialAssociated){
                deviceDetails.credentialName = v.credentialName;
            }
            deviceList.push(deviceDetails);
        });
    }
    return deviceList;
}
function showAddCredentialPage(credType)
{
    opm_transitionToParentRoute('Settings.Discovery.Credentials.Category','Monitors');//No I18N
    Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
        openCredentialSlide();
        Ember.run.next(function(){
            $("#opmCrendentialTypes").val(credType).select().trigger("change");//No I18N
        });
    });
}
function showCliQueryTestConn(){
    $("#OpmToolsLinErrorMsg").css("display","none");
    $("#OpmToolsLinOutput").css("display","none");
    $('#OpmToolsLinUserName').val('');
    $('#OpmToolsLinPassword').val('');
}
function hideWMIQueryCred(){
    $("#username").val('');
    $("#wmipassword").val('');
}
function validateOnEditCustomFields(tool){
    if(OPMClient.InventoryOpUtilsController.oputilsCustomColumnsDetails == undefined){
        getOpUtilsCustomColumnDetails();
    }
    if(OPMClient.InventoryOpUtilsController.oputilsCustomColumns == undefined){
        getOpUtilsCustomColumnNames();
    }
    var CustomFields = OPMClient.InventoryOpUtilsController.oputilsCustomColumnsDetails[tool];
    var columnNames = OPMClient.InventoryOpUtilsController.oputilsCustomColumns[tool];

    if(tool == "SPMSwitchLevelCustomField" || tool == "SPMPortLevelCustomField"){
        var customUrl = window.OPM.apiUrlPattern + "/oputilsadmin/getCustomColumnDetails?tool=SPM";//No I18N
        var response = opm_ajaxGetResponse(customUrl);
        CustomFields={}
        if(response!=undefined && response.status=="Success" && response.result!=undefined){
            $.each(response.result,function(indx,col){
                if(col.tablename!=undefined && col.tablename == tool ){
                    var column = col.columnname;
                    if (column != undefined) {
                        CustomFields[column] = {};
                    }
                }
                CustomFields[column]={"datatypename":col.datatypename,"defaultvalue":col.defaultvalue,"size":col.size,"allowedValues":col.allowedValues,"isMandatory":col.isMandatory};//No I18N
            });
        }
    }
    var fieldsToValidate = {'empty':[],'nonnegative':[],'opu_customFieldValidation':[]};//No I18N
    if(columnNames != undefined && columnNames != ""){
        columnNames.forEach(function(column){
            fieldsToValidate.opu_customFieldValidation.push(column);
            if(CustomFields[column].isMandatory == "true"){
                fieldsToValidate.empty.push(column);
             }
             if((CustomFields[column].allowedValues==undefined || CustomFields[column].allowedValues == "" ) ){
                if(CustomFields[column].isMandatory == "true"){
                    fieldsToValidate.empty.push(column);
                }
            }
        })
    }
    var isValid = opm_validateFields(fieldsToValidate);
    return isValid;
}

function callColorPicker(obj,defaultColor,type)
{
    var myColor = ($(obj).val() !== undefined && $(obj).val() !== "" ? $(obj).val() : defaultColor);
    $(obj).ColorPicker({
        eventName:'click', //No I18N
        color: "#"+myColor,
        onShow: function (colpkr) {
            $(obj).css('backgroundColor', '#' + $(obj).val());//No I18N
            $(colpkr).fadeIn(500);
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
        },
        onChange: function(hsb, hex, rgb) {
            $(obj).val(hex);
            $(obj).closest('.colorBoxWrapper').find('#criticalColorInput').val(hex);
            $(obj).css('backgroundColor', '#' + hex);//No I18N
            var wrapper = $(obj).closest('li').find('.colorBoxWrapper');
            var existColorNameAndCode =OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode;

            var colorName = $(obj).attr('data-obj');
            existColorNameAndCode.set(colorName,'#'+hex);
            if (wrapper.length > 0) {
                var input = wrapper.find('#criticalColorInput');
                if (input.length > 0) {
                    input.val(hex); // Update the input value
                }
            }
        }

    });

}
function getOpuColorBoxForCustomValues(){
    OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.arrayIcons = [];
    if($("#multipleCustomValues").val().length>0){
        $("#colorCodeSelectText").show();
    }
    else{
        $("#colorCodeSelectText").hide();
    }
    var allowedValues = $("#multipleCustomValues").val().trim();
    var optionsList = allowedValues.split(",").map(function(eachOption) {
         return eachOption.trim().replace(/\s+/g, ' ');
    });
    var uniqueOptions = [];
    var optionsSet = [];
    var existColorNameAndCode;
    if(OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode == undefined){
        existColorNameAndCode = new Map();
        OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode = new Map();
    }
    else{
        existColorNameAndCode = OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode
    }
    var id =0;
    for (var ind =0 ; ind < optionsList.length ; ind++) {
        var lowerWord = optionsList[ind].toLowerCase();
        var existColorHexCode = existColorNameAndCode.get(optionsList[ind]);
        if (!uniqueOptions.includes(lowerWord) && optionsList[ind].length > 0) {
            uniqueOptions.push(lowerWord);
            if(existColorHexCode){
                optionsSet.push({id:"colorColumn_"+id,name:optionsList[ind],color:existColorHexCode.split('#')[1],style:'background-color:'+existColorHexCode});
            }
            else{
                optionsSet.push({id:"colorColumn_"+id,name:optionsList[ind],color:"000000",style:'background-color:#000000'});
            }
            id = id + 1;
        }
    }
    var params = {};
    params.arrayIcons = optionsSet;
    params.colorNameAndCode = existColorNameAndCode;
    params.isColorCodeExist = OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.isColorCodeExist;
    params.selectedColorColumnName = OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.selectedColorColumnName;
    params.isCurrentColumnHasColorCode = OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.isCurrentColumnHasColorCode;
    Ember.set(OPMClient.SettingsOpUtilConfigController,"subnetIconColorCode",params);//No I18N
}
function deviceCredDetails(toolType){
    var deviceList=[];
    var response =  opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/tools/getWmiOrCliDeviceList?deviceType="+toolType);//NO i18N
    if(response != undefined){
        $.each(response.result,function(k,v) {
            var deviceDetails = {};
            deviceDetails.displayName = v.displayName;
            deviceDetails.ipAddress = v.ipAddress;
            deviceDetails.isCredentialAssociated = v.isCredentialAssociated;
            deviceDetails.deviceName = v.deviceName;
            if(v.isCredentialAssociated){
                deviceDetails.credentialName = v.credentialName;
            }
            deviceList.push(deviceDetails);
        });
    }
    return deviceList;
}
function showAddCredentialPage(credType)
{
    opm_transitionToParentRoute('Settings.Discovery.Credentials.Category','Monitors');//No I18N
    Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
        openCredentialSlide();
        Ember.run.next(function(){
            $("#opmCrendentialTypes").val(credType).select().trigger("change");//No I18N
        });
    });
}
function showCliQueryTestConn(){
    $("#OpmToolsLinErrorMsg").css("display","none");
    $("#OpmToolsLinOutput").css("display","none");
    $('#OpmToolsLinUserName').val('');
    $('#OpmToolsLinPassword').val('');
}
function hideWMIQueryCred(){
    $("#username").val('');
    $("#wmipassword").val('');
}
function findOpUHeadersDuplicates(selectedColNames){
   return new Set(selectedColNames).size !== selectedColNames.length;
}
function reorderColmodel(colModels,customOrder){
    var orderedColModel = [];
    customOrder.forEach(function(columnName){
        var trimmedColumnName = columnName.trim().toLowerCase();
        var column = colModels.find(function(col){
            var trimmedColModelName = col.name.trim().toLowerCase();
            return trimmedColModelName === trimmedColumnName;
        });
        if(column){
            orderedColModel.push(column);
        }
    });
    return orderedColModel;
}


function getSubnetFilePath(){
    var file = $("#csvPath")[0].files[0];//No I18N
    OPMClient.InventoryOpUtilsController.storingSubnetFileForImport = file;
    if ($('#csvPath').is('[data-error]')){
        $("#csvPath").removeClass('validateField error');//No I18N
        $("#csvPath").removeAttr('data-error',Ember.I18n.t('webclient.general.fileselecterror',this));//No I18N
    }
}
function ShowReservationText() {
    $("#reservationStatusTxt").css('display','block');
}

function updateSwitchSummaryStatus(status){
    $("#switchSummaryScanStatus > *").css("display", "none");
    if(status == "1"){
        $("#switchSummaryScanStatus > #inProgress").show();
    }else if((status=="2" )){
        $("#switchSummaryScanStatus > #scanned").show();
    }else if(status == "3"){
        $("#switchSummaryScanStatus > #failed").show();
    }else if(status =="4"){
        $("#switchSummaryScanStatus > #notStarted").show();
    }else if(status == "6"){
        $("#switchSummaryScanStatus > #waitingInQueue").show();
    }else{
        $("#switchSummaryScanStatus > #unknown").show();
    }
}
function updatePoeStatus(status){
    if (status === "Active") {
        return "<span class='active'>"+Ember.I18n.t('opstor.inventory.active',this)+"</span>";
    } else if (status === "Inactive") {//No I18N
        return "<span class='inactive'>"+Ember.I18n.t('webclient.nfa.inventory.inactive',this)+"</span>";
    } else {
        return "<span class='In Progress'>"+Ember.I18n.t('opu.common.IN_PROGRESS',this)+"</span>";
    }
}
function updateSubnetSummaryStatus(status){
    $("#subnetSummaryScanStatus > *").css("display", "none");
    if(status == "1"){
        $("#subnetSummaryScanStatus > #inProgress").show();
    }else if((status=="2" )){
        $("#subnetSummaryScanStatus > #scanned").show();
    }else if(status == "0"){
        $("#subnetSummaryScanStatus > #notStarted").show();
    }else if(status =="4"){
        $("#subnetSummaryScanStatus > #waitingInQueue").show();
    }

}
function hideErrMsgDiv(id){
    $("#"+id).css('display','none');
}

function checkExistingDHCPOptions(newOption,existingArray){
    var returnVal = false;
    $.each(existingArray, function(i,val){
        if(val.key===newOption){
            returnVal = true;
        }
    });
    return returnVal;
}
function hideErrMsgDiv(id){
    $("#"+id).css('display','none');
}

function checkExistingDHCPOptions(newOption,existingArray){
    var returnVal = false;
    $.each(existingArray, function(i,val){
        if(val.key===newOption){
            returnVal = true;
        }
    });
    return returnVal;
}
function addFqdnForNotifyTransfer(){
	var fqdn = $("#fdqnTextNotifyTransfer").val();
	var fieldsToValidate = {'empty': ['fdqnTextNotifyTransfer'],'validFqdnIP': ['fdqnTextNotifyTransfer']};//No I18N
    if (!opm_validateFields(fieldsToValidate)) {
        return false;
    }
    else{
        loadFqdnNotifyZoneTransfer(fqdn);
    }
}
function addFqdnForZoneTransfer(){
	var fqdn = $("#fdqnTextInZoneTransfer").val();
	var fieldsToValidate = {'empty': ['fdqnTextInZoneTransfer'],'validFqdnIP': ['fdqnTextInZoneTransfer']};//No I18N
    if (!opm_validateFields(fieldsToValidate)) {
        return false;
    }
    else{
        loadFqdnListInZoneTransfer(fqdn);
    }
}
function addFqdn(){
    var fqdn = $("#fdqnText").val();
	var fieldsToValidate = {'empty': ['fdqnText'],'validFqdnIP': ['fdqnText']};//No I18N
    if (!opm_validateFields(fieldsToValidate)) {
        return false;
    }
    else{
        loadFqdnList(fqdn);
    }
    
}
function deleteFQDNIP(ipAddress){
    $("#dnsZoneList").jqGrid('delRowData', ipAddress);
    var rowCount = $("#dnsZoneList").jqGrid('getGridParam', 'reccount');
    if (rowCount === 0){
        $("#fqdnGrid").hide();
        $("#masterDnsServerList").hide();
    }
}
function deleteFQDNIPZoneTransfer(ipAddress){
    $("#dnsZoneTransferList").jqGrid('delRowData', ipAddress);
    var rowCount = $("#dnsZoneTransferList").jqGrid('getGridParam', 'reccount');
    if (rowCount === 0){
        $("#fqdnZoneTransferGrid").hide();
        $("#secondaryServerList").hide();
    }
}
function deleteNotifyZoneTransfer(ipAddress){
	$("#zoneNotifyTransferList").jqGrid('delRowData', ipAddress);
    var rowCount = $("#zoneNotifyTransferList").jqGrid('getGridParam', 'reccount');
    if (rowCount === 0){
        $("#fqdnNotifyTransferGrid").hide();
        $("#notifyServerList").hide();
    }
}
function ipv4RvLookup(){
    $("#zoneNameInfoMessage").hide();
    $('#zoneNameDiv').css('display','none');
    $("#ipV4ReverseLookupDiv").css('display','none');
    $('#ipV4NetworkLookupDiv').css('display','block');
    $("#zoneName").val('');
    $("#networkIDAdressTxt").val('');
    $("#zoneType").css('display','block');
    $('#networkIDDataType').prop('checked', true);
}
function ipv6RvLookup(){
    $("#zoneNameInfoMessage").hide();
    $("#zoneName").val('');
    $("#networkIDAdressTxt").val('');
    $("#zoneNameDiv").css('display','block');
    $("#zoneType").css('display','block');
    $("#fwZoneNameDiv").css('display','block');
    $("#reverseZoneName").remove();
    $('#networkIDDataType').prop('checked', true);
    if($("#networkIDAdressDiv").length === 0){
        $("<div class='opmFormCol' id='networkIDAdressDiv'><label>Network Address<i class=\"mandatory\">*</i></label><input type='text' id='networkIDAdressTxt'/></div>").insertBefore('#fwZoneNameDiv'); // or .before()
    }
}
function rvLookupType(){
    $("#zoneNameInfoMessage").hide();
    $("#ipV4ReverseLookupDiv").css('display','block');
    $("#ipV4NetworkLookupDiv").css('display','none');
}
function fwLookupType(){
    $("#zoneNameInfoMessage").show();
    $("#zoneName").val('');
    $("#zoneNameDiv").css('display','block');
    $("#fwZoneNameDiv").css('display','block');
    $("#ipV4ReverseLookupDiv").css('display','none');
    $("#zoneType").css('display','none');
    $('#ipV4NetworkLookupDiv').css('display','none');
}
function removeZoneNameTxt(argument) {
    $("#networkZoneName").val('');
}
function networkIdToZoneName(networkId) {
  if(validateZoneNetworkID(networkId)){
    $("#dnsNetworkIdError").remove();
    var parts = networkId.split('/');
    var ip = parts[0];
    var octets = ip.split('.');
    if (octets.length < 3 || octets.length > 4){
        return 'invalid network id';//No I18N
    }
    return octets[2] + '.' + octets[1] + '.' + octets[0] + '.in-addr.arpa';
  }
}
function addMasterDNSServer(){
    $("#masterServerTxt").show();
    $("#fqdnAddress").show();
}
function primaryZone(){
    $("#fqdnGrid").hide();
    $("#masterDnsServerList").hide();
    $("#fqdnAddress").hide();
    $("#masterServerTxt").hide();
}
function networkToZoneName(){
    $("#zoneType").css('display','block');
    $("#ipV4NetworkLookupDiv").css('display','block');
    $("#ipV4ReverseLookupDiv").css('display','none');
    $("#networkZoneName").val('');
}

function expandIPv6Address(ipv6){
    var expanded = "";
    if (ipv6.includes(':')){

          var fullAddress = '';
          var parts = ipv6.split('::');

          if (parts.length > 2) return null; // Invalid IPv6

          var head = parts[0] ? parts[0].split(':') : [];
          var tail = parts[1] ? parts[1].split(':') : [];

          // Fill missing 0 groups
          var totalParts = head.length + tail.length;
          var missing = 8 - totalParts;
          if (missing < 0) return null; // Too many parts

          var zeros = Array(missing).fill('0000');

          var fullParts = head.concat(zeros, tail).map(function(part) {
            return part.padStart(4, '0');
          });

          if (fullParts.length !== 8) return null;

          expanded = fullParts.join(':');
    }
    if (expanded) {
        var zone = ipv6ToReverseZone(expanded);
        return zone
    }
}
function ipv6ToReverseZone(expandedAddr){
    return expandedAddr.replace(/:/g, '').split('').reverse().join('.') + '.ip6.arpa';
}
function getZoneName(id){
    var networkAddress = $("#networkIDAdressTxt").val();
    if(($('input[name="dnsCategory"]:checked').val() === 'reverseLookUp') ||($('input[name="dnsCategory"]:checked').val() === 'IPV6reverseLookUp')){
        if(networkAddress !== null && networkAddress !== undefined && networkAddress !== ''){
            var zoneName = "";
            if($('input[name="dnsCategory"]:checked').val() === 'IPV6reverseLookUp'){
                zoneName = expandIPv6Address(networkAddress);
            }else{
                zoneName = networkIdToZoneName(networkAddress);
            }
            
            if(zoneName !== null && zoneName !== undefined && zoneName !== ''){
                $("#"+id).val(zoneName);
            }
        }
    }
}
function addZoneRecord(dnsServer,zoneName,lookupType,cloudFlag,zoneId){
	var isAws = (cloudFlag === true) || (cloudFlag === 'aws');//No I18N
	var isGcp = (cloudFlag === 'gcp');//No I18N
	var isForward = (lookupType === Ember.I18n.t('opu.ipam.dns.forward',this) || lookupType === 'Forward');//No I18N
	var dnsRecordTypes;
	if (isAws) {
		dnsRecordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "PTR"];//No I18N
	} else if (isGcp) {
		dnsRecordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV"];//No I18N
	} else {
		dnsRecordTypes = isForward
			? ["A", "AAAA", "CNAME", "MX", "NS","SRV"]//No I18N
			: ["NS", "PTR"];//No I18N
	}

    OPMClient.InventoryOpUtilsController.set('dnsZoneRecords', dnsRecordTypes);//No I18N
    OPMClient.InventoryOpUtilsController.set('currentZoneName', zoneName);//No I18N
    OPMClient.InventoryOpUtilsController.set('currentDNSAddr', dnsServer);//No I18N
    OPMClient.InventoryOpUtilsController.set('currentZoneId', zoneId || '');//No I18N
    OPMClient.InventoryOpUtilsController.set('isAwsDnsServer', !!isAws);//No I18N
    OPMClient.InventoryOpUtilsController.set('isGcpDnsServer', !!isGcp);//No I18N
    // Clear any leftover AWS edit-only context
    OPMClient.InventoryOpUtilsController.set('awsOriginalFqdn', '');//No I18N
    OPMClient.InventoryOpUtilsController.dnsRecordData = null;

    opmGlobalRoute.transitionTo('Inventory.Device.AddRecord');//No I18N
    setTimeout(function () {
        if (isAws || isGcp) {
            return;
        }
        $("#fqdnFromRecord").val(zoneName);
        if (isForward) {
            $("#ATypeRecord").show();
            $("#nsRecord").hide();
            $("#recordNameDiv").show();
            $("#createPtrRecord").show();
        } else {
            $("#ATypeRecord").hide();
            $("#nsRecord").show();
            $("#recordNameDiv").hide();
            $("#createPtrRecord").hide();
        }
        $("#txtRecord").hide();
    },100);
}

function addMissingDNSRecord(ipAddress, gid, rowId){
    var grid = jQuery('#' + gid);//No I18N
    var rowData = grid.jqGrid('getRowData', rowId);//No I18N
    proceedToAddMissingRecord(ipAddress, rowData);
    var loadingMsg = Ember.I18n.t('opu.dns.CHECKING_DNS_NAME', this); //No I18N
    var disableSaveBtn = function(){
        $('#opuDNSSaveRecordbtn').addClass('disabled') //No I18N
            .attr('disabled', true) //No I18N
            .css({'pointer-events': 'none', 'opacity': '0.5'}); //No I18N
    };
    if($('#opuDNSSaveRecordbtn').length){ //No I18N
        disableSaveBtn();
    } else {
        setTimeout(disableSaveBtn, 600);
    }

    var url = window.OPM.apiUrlPattern + "/tools/getDNSNameFromIP";//No I18N
    var params = { hostName: ipAddress };
    var notAbleToResolve = Ember.I18n.t('opu.common.NOT_ABLE_TO_RESOLVE', this);//No I18N
    opm_ajaxGetResponseWithMsg(url, params, loadingMsg, function(data){
        if(data === undefined || data.status === "Failure" || data.result === undefined ||
           data.result.dnsName === undefined || data.result.dnsName === "" ||
           data.result.dnsName === notAbleToResolve){
            OPMClient.InventoryOpUtilsController.set('dnsWarningMsg', ''); //No I18N
            $('#opuDNSSaveRecordbtn').removeClass('disabled').removeAttr('disabled').css({'pointer-events': '', 'opacity': ''}); //No I18N
            return;
        }
        var msg = "IP address " + ipAddress + " is already having a DNS record with name " + data.result.dnsName + ". Adding another record is not allowed.";//No I18N
        OPMClient.InventoryOpUtilsController.set('dnsWarningMsg', msg); //No I18N
    });
}

function proceedToAddMissingRecord(ipAddress, rowData) {
    var dnsStatusint = rowData['dns-status-int'];//No I18N
    if (dnsStatusint === "2") {
        OPMClient.InventoryOpUtilsController.set('missingRecordType', 'PTR');//No I18N
        OPMClient.InventoryOpUtilsController.set('missingRecordIP', ipAddress);//No I18N
    }
    opmGlobalRoute.transitionTo('Inventory.Device.AddMissingRecord');//No I18N
}
function getConstructedFQDN(id){
    var record = $('#'+id).val().trim();
	var recordType = $("#dnsRecordsSelBoxDiv").val();
	var recordId = "fqdnFromRecord";//No I18N
	if(recordType === 'CNAME'){//No I18N
		recordId = "fqdnFromRecord1";//No I18N
	}else if(recordType === 'MX'){//No I18N
		recordId = "fqdnFromRecord3";//No I18N
	}else if(recordType === 'PTR'){//No I18N
		recordId = "fqdnFromRecord2";//No I18N
		var octets = [];
		$('.ipCheck').each(function(){
			if(!$(this).prop("disabled")){
				var val = $(this).val().trim();
				if(val !== ""){
					octets.push(val);
				}
			}
		});
		record = octets.join(".");
	}
	
	if(recordType === 'PTR'){//No I18N
        record = octets.reverse().join(".");
    }
	
    var zone = OPMClient.InventoryOpUtilsController.currentZoneName;
    record = record.replace(/\.$/, '');
    zone = zone.replace(/^\./, '');

    // Apex markers must resolve to the zone itself, not "(same as parent folder).zone.com" / "@.zone.com"
    if (record === '@' || record === '(same as parent folder)') {
        record = '';
    }

    var fqdn = record ? record + '.' + zone : zone;
    $('#'+recordId).val(fqdn);
}
function disableReplicationScope(){
	$('#adZoneScopeDiv').hide();
    var dynamicUpdate = $('input[name="dynamicUpdate"]:checked').val()
    if(dynamicUpdate == 'Secure'){
        $("input[name='dynamicUpdate'][value='NonsecureAndSecure']").prop('checked', true);
    }
	$('#dynamicUpdateDiv #secureDynamicUpdate').hide();
}
function enableReplicationScope(){
	$('#adZoneScopeDiv').show();
    $('#dynamicUpdateDiv #secureDynamicUpdate').show();
	var replicationScope = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.ReplicationScope;
	$("input[name='adZoneScope'][value='" + replicationScope + "']").prop('checked', true);
	if(replicationScope === 'Custom'){
        $('#directoryPartitionDiv').show();
	}
}
function showStoreInAdMsg(e){
    if ($('#storeZoneInAD').is(':checked')){
        e.preventDefault();
        var cancelCallBack = function(){
            $('#storeZoneInFile').prop('checked',true);
            $('#storeZoneInAD').prop('checked',false);
            
            disableReplicationScope();
        } 
        var proceedCalBack = function(){
            $('#storeZoneInFile').prop('checked',false);
            $('#storeZoneInAD').prop('checked',true);
            
            enableReplicationScope();
        } 
        opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert',this),Ember.I18n.t('opu.ipam.dns.ad.integrated.msg',this),'400',proceedCalBack,Ember.I18n.t('webclient.restapi.copy.okBtnText',this),cancelCallBack,Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'',false,true,false,true);//No I18N
    }
}
function showStoreInFileMsg(e){
    if ($('#storeZoneInFile').is(':checked')){
        e.preventDefault();
        var cancelCallBack = function(){
            $('#storeZoneInAD').prop('checked',true);
            $('#storeZoneInFile').prop('checked',false);
            
            enableReplicationScope();
        }
        var proceedCalBack = function(){
            $('#storeZoneInFile').prop('checked',true);
            $('#storeZoneInAD').prop('checked',false);
            
            disableReplicationScope();
        } 
        opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert',this),Ember.I18n.t('opu.ipam.dns.zone.integrated.msg',this),'400',proceedCalBack,Ember.I18n.t('webclient.restapi.copy.okBtnText',this),cancelCallBack,Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'',false,true,false,true);//No I18N
        
    }
}
function zoneConfiguration1(dnsServerAddr,zoneName){
    opmGlobalRoute.transitionTo('Inventory.Device.AddZoneConfiguration');//No I18N
	OPMClient.InventoryOpUtilsController.set('currentDNSAddr',dnsServerAddr);//No I18N
	$("#deviceSnapshotMoreHeader").text(zoneName + " - "+ Ember.I18n.t('webclient.cit.advancedconfiguration',this)); //No I18N
    var url = window.OPM.apiUrlPattern + "/ipam/getDNSZoneAdvancedConfig";//No I18N
    var data = {
        dnsServerAddress:dnsServerAddr,
        zoneName:zoneName
    }

    opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.ipam.fetching.configuration.msg', this),{callback: function(response){//No I18N
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            $("#zoneConfigurationLoader").hide();
            $("#zoneConfigurationStep1").css('display','block');
            $("#zoneConfigNextbtn").show();
            $("#zoneConfigCancelbtn").show();
            OPMClient.InventoryOpUtilsController.getZoneConfigDet = response;
            var storeZone = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.ZoneFile;
            var isDnsADIntegrated = false;
            var isDnsADIntegrated = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.IsDsIntegrated;
            if(isDnsADIntegrated){
                $("#adZoneScopeDiv").show();
                $('#storeZoneInAD').prop('checked', true);
                $('#dynamicUpdateDiv #secureDynamicUpdate').show();
            }
            else{
                $("#adZoneScopeDiv").hide();
                $('#storeZoneInFile').prop('checked', true).trigger('change');
                $('#dynamicUpdateDiv #secureDynamicUpdate').hide();
            }
            var replicationScope = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.ReplicationScope;
            $("input[name='adZoneScope'][value='" + replicationScope + "']").prop('checked', true);
            
            var dynamicUpdate = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.DynamicUpdate;
            $("input[name='dynamicUpdate'][value='" + dynamicUpdate + "']").prop('checked', true);

            var isAgingEnabled = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Scavenging.AgingEnabled;
            if(isAgingEnabled){
                $('#staleRecords').prop('checked', true).trigger('change');
            }
            var nonRefreshInterval = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Scavenging.NoRefreshInterval;
            parseServerTime(nonRefreshInterval,'non-refresh');//No I18N
            
            var refreshInterval = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Scavenging.RefreshInterval;
            parseServerTime(refreshInterval,'refresh');//No I18N
            
            var nameServer = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].NS; 
            if(nameServer.length > 0){
                OPMClient.InventoryOpUtilsController.dnsNameServer = nameServer;
            }
            
            var primaryServer = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.PrimaryServer;
            var respPerson = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.ResponsiblePerson;
            var serialNumber = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.SerialNumber;
            
            var refreshInt2 = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.RefreshInterval;
            parseServerTime(refreshInt2,'refreshInt2');//No I18N
            
            var retryInt2 = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.RetryDelay;
            parseServerTime(retryInt2,'retryInt2');//No I18N
            
            var expiryLimit = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.ExpireLimit;
            parseServerTime(expiryLimit,'expiryLimit');//No I18N
            
            var minimumTTL = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].SOA.MinimumTimeToLive;
            parseServerTime(minimumTTL,'minimumTTL');//No I18N
            
            if(primaryServer !== '' && primaryServer !== undefined && primaryServer !== null){
                $('#primaryServer').val(primaryServer);
            }
            if(respPerson !== '' && respPerson !== undefined && respPerson !== null){
                $('#responsiblePerson').val(respPerson);
            }
            if(serialNumber !== '' && serialNumber !== undefined && serialNumber !== null){
                    $('#serialNumber').val(serialNumber);
            }
            var zoneTransferTo = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.SecureSecondaries;
            var notifyOption = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.Notify;
            if($('#zoneTransferCb').prop('checked', false)){
                $('#zoneTransferParentDiv').addClass('disabledBlock');
                $("#notifyDNSConfig").addClass('disabledBlock');
                $("#notifyOptionsParentDiv").css('display','none');
		$("#fqdnInZoneTransfer").hide();
		$("#secondaryServerList").hide();
		$("#fqdnZoneTransferGrid").hide();
		$("#dnsZoneTransferList").jqGrid('clearGridData');
				
            }
            if(zoneTransferTo === Ember.I18n.t('opu.ipam.dns.noTransfer',this)){
                $('#zoneTransferCb').prop('checked', false);
                $('#zoneTransferParentDiv').addClass('disabledBlock');
                $("#notifyDNSConfig").addClass('disabledBlock');
                $("#notifyOptionsParentDiv").css('display','none');
                $("#zoneTransfer").val('TransferAnyServer').trigger('change');
            }else{
                $("#zoneTransferCb").prop('checked', true);
                $("#zoneTransferParentDiv").removeClass('disabledBlock');
                $("#notifyDNSConfig").removeClass('disabledBlock');
                $("#zoneTransfer").val(zoneTransferTo).trigger('change');
            }
            if(notifyOption !== Ember.I18n.t('opu.ipam.dns.noNotify',this) && zoneTransferTo !== Ember.I18n.t('opu.ipam.dns.noTransfer',this)){
                $("#zoneNotifyCb").prop('checked', true);
                $("#notifyOptionsParentDiv").css('display','block');
                $("#notifyOptions").val(notifyOption);
                if(notifyOption === 'NotifyServers'){
                    $("#fqdnNotifyZoneTransfer").show();
                }else{
                    $("#fqdnNotifyZoneTransfer").hide();
                }
            }
        }
    },otpPageType: 'slide'});//NO I18N
}
function handleSelect2AutoClose(containerClasses, action) {
    var selector = containerClasses.join(', ');
    if (action === 'attach') {
        $(selector).off('scroll.select2AutoClose').on('scroll.select2AutoClose', function () {
            $(this).find('select').each(function () {
                if ($(this).data('select2')) {
                    $(this).select2('close');
                }
            });
        });
    }
    else if (action === 'detach') {
        $(selector).off('scroll.select2AutoClose');
    }
}
function notifySecureServers(){
	var notifyOption = $("#notifyOptions").val();
    var notifyServers = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.NotifyServers;
	if(notifyOption === 'NotifyServers'){
		$("#fqdnNotifyZoneTransfer").show();
        if(notifyServers !== null && notifyServers !== []){
            var rowData = notifyServers.map(function(ip, index) {
                return {
                    id: ip,          
                    dnsName: Ember.I18n.t('opu.common.NOT_ABLE_TO_RESOLVE',this), //No I18N            
                    ipAddress: ip,          
                    action: ""              
                };
            });
            $("#fqdnNotifyTransferGrid").show();
            $('#notifyServerList').show();
            loadZoneConfigNotifyServersGrid('zoneNotifyTransferList', rowData);//No I18N
        }
	}else{
		$('#fqdnNotifyZoneTransfer').hide();
		$('#notifyServerList').hide();
		$("#zoneNotifyTransferList").jqGrid("clearGridData");
		$("#zoneNotifyTransferList").closest(".ui-jqgrid").hide();
	}
}
function secureServerZoneTransfer(){
	var SecureSecondaries = $("#zoneTransfer").val();
    var secondaryServerIPs = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.SecondaryServers;
	if(SecureSecondaries === 'TransferToSecureServers'){
		$('#fqdnInZoneTransfer').show();
        if(secondaryServerIPs !== null && secondaryServerIPs !== []){
            var rowData = secondaryServerIPs.map(function(ip, index) {
                return {
                    id: ip,          
                    dnsName: Ember.I18n.t('opu.common.NOT_ABLE_TO_RESOLVE',this), //No I18N            
                    ipAddress: ip,          
                    action: ""             
                };
            });
            $("#fqdnZoneTransferGrid").show();
            $('#secondaryServerList').show();
            loadZoneConfigSecondaryServersGrid('dnsZoneTransferList', rowData);//No I18N
        }
	}else{
		$('#fqdnInZoneTransfer').hide();
        $('#dnsZoneTransferList').jqGrid("clearGridData");
        $('#dnsZoneTransferList').closest(".ui-jqgrid").hide();
        $("#secondaryServerList").hide();
        $("#fqdnZoneTransferGrid").hide();
	}
}
function parseServerTime(timeStr,intervalName) {
    var value = 0;
    var unit = '';
    var totalSeconds = 0;

    // Split days and time part
    var dayPart = 0;
    var timePart = timeStr;
    if (timeStr.indexOf('.') !== -1) {
        var parts = timeStr.split('.');
        dayPart = parts[0];
        timePart = parts[1];
    }

    var days = parseInt(dayPart, 10) || 0;
    var timeParts = timePart.split(':');
    var hh = parseInt(timeParts[0], 10) || 0;
    var mm = parseInt(timeParts[1], 10) || 0;
    var ss = parseInt(timeParts[2], 10) || 0;

    // Convert everything to total seconds
    totalSeconds = (days * 86400) + (hh * 3600) + (mm * 60) + ss;

    // Choose the largest unit that divides evenly
    if (totalSeconds % 86400 === 0) {
        value = totalSeconds / 86400;
        unit = 'Days'; // No I18N
    } else if (totalSeconds % 3600 === 0) {
        value = totalSeconds / 3600;
        unit = 'Hours'; // No I18N
    } else if (totalSeconds % 60 === 0) {
        value = totalSeconds / 60;
        unit = 'Minutes'; // No I18N
    } else {
        value = totalSeconds;
        unit = 'Seconds'; // No I18N
    }
		if(intervalName === 'non-refresh'){//No I18N
            $('#nonRefreshIntTimeVal').val(value).trigger('change');
            $('#nonRefreshInterval').val(unit).trigger('change');
        }else if(intervalName === 'refresh'){//No I18N
            $('#refreshIntTimeVal').val(value).trigger('change');
            $('#refreshInterval').val(unit).trigger('change');
        }else if(intervalName === 'refreshInt2'){//No I18N
			$('#refreshInt2').val(value).trigger('change');
            $('#refreshInterval2').val(unit).trigger('change');
        }else if(intervalName === 'retryInt2'){//No I18N
			$('#retryInt2').val(value).trigger('change');
			$('#retryInterval').val(unit).trigger('change');
        }else if(intervalName === 'expiryLimit'){//No I18N
            $('#expiryLimit').val(value).trigger('change');
            $('#expiresTime').val(unit).trigger('change');
        }else if(intervalName === 'minimumTTL'){//No I18N
			$('#timeToLive').val(value).trigger('change');
			$('#timeToLiveSelBox').val(unit).trigger('change');
        }
}
function isNumberKey(e){
	var charCode = e.which ? e.which : e.keyCode;
    if (charCode < 48 || charCode > 57) {
        e.preventDefault(); // Prevent non-numeric input
    }
}
function convertTimeIntervalToSecs(timeVal,unit){
  var seconds = timeVal;
  if (!isNaN(timeVal)) {
     switch(unit) {
		case 'Days'://No I18N
		  seconds = timeVal * 24 * 60 * 60;
		  break;
		case 'Hours'://No I18N
		  seconds = timeVal * 60 * 60;
		  break;
		case 'Minutes'://No I18N
		  seconds = timeVal * 60;
		  break;
		default:
		  return seconds;
	  }
  }
  return seconds;
}
function adZoneInCustom(){
    $('#directoryPartitionDiv').show();
    var directoryParVal = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.DirectoryPartitionName;
    if(directoryParVal !== null && directoryParVal !== "" && directoryParVal !== undefined){
        $("#directoryPartition").val(directoryParVal);
    }
}
function removeCustomInZoneConfig(){
    $('#directoryPartitionDiv').hide();
    $("#directoryPartition").val('');
}
function confirmLegacyChange(value){
    var originalRelationScope = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.ReplicationScope;
    var previousReplicationScope = OPMClient.InventoryOpUtilsController.previousReplicationScope;
    if(previousReplicationScope == undefined){
        previousReplicationScope = originalRelationScope;
    }
    if(originalRelationScope == 'Legacy' &&  previousReplicationScope == 'Legacy' && value!='Legacy'){
        opmConfirm('', Ember.I18n.t('opu.ipam.DNS_Legacy_Confirmation',this), '',function(){OPMClient.InventoryOpUtilsController.previousReplicationScope = value;}, '',function(){$('#adZoneInLegacy').prop('checked', true); },"","","","",false,"","","",true,"");
    }
    else{
        OPMClient.InventoryOpUtilsController.previousReplicationScope = value;
    }
}
function zoneTransfer(){
    var zoneTransferTo = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.SecureSecondaries;
    var secondaryServerIPs = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.SecondaryServers;
    var notifyOptionFromServer = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.Notify;
    var notifyServers = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.NotifyServers;
    
    if ($('#zoneTransferCb').is(':checked')){
        $("#zoneTransferParentDiv").removeClass("disabledBlock");
        $("#notifyDNSConfig").removeClass("disabledBlock");
        if(zoneTransferTo === 'TransferToSecureServers' )
		{
			$("#fqdnInZoneTransfer").show();
			if(secondaryServerIPs !== null && secondaryServerIPs !== []){
				var rowData = secondaryServerIPs.map(function(ip, index) {
					return {
						id: ip,          
						dnsName: Ember.I18n.t('opu.common.NOT_ABLE_TO_RESOLVE',this),//No I18N         
						ipAddress: ip,          
						action: ""              
					};
				});
				$("#fqdnZoneTransferGrid").show();
				$('#secondaryServerList').show();
				setTimeout(function() {
					loadZoneConfigSecondaryServersGrid('dnsZoneTransferList', rowData);//No I18N
				}, 100);
			}
        }
		if(notifyOptionFromServer !== 'NoNotify'){
			$('#zoneNotifyCb').prop('checked', true);
			$("#notifyOptionsParentDiv").show();
			$("#notifyOptions").val(notifyOptionFromServer).trigger('change');
		}
		if(notifyOptionFromServer === 'NotifyServers'){
			$("#fqdnNotifyZoneTransfer").show();
            if(notifyServers !== null){
                $("#notifyServerList").show();
                $("#fqdnNotifyTransferGrid").show();
            }
		}
    }else{
        $("#zoneTransferParentDiv").addClass("disabledBlock");
        $("#notifyDNSConfig").addClass("disabledBlock");
        $("#notifyOptionsParentDiv").css('display','none');
        $('#zoneNotifyCb').prop('checked', false);
		$("#fqdnInZoneTransfer").hide();
		$("#secondaryServerList").hide();
		$("#fqdnZoneTransferGrid").hide();
		$("#dnsZoneTransferList").jqGrid('clearGridData');
		$("#fqdnNotifyZoneTransfer").hide();
		$("#notifyServerList").hide();
		$("#fqdnNotifyTransferGrid").hide();
    }
}
function zoneNotify(){
	var notifyOptionFromServer = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.Notify;
    var notifyServers = OPMClient.InventoryOpUtilsController.getZoneConfigDet.dnsZoneConfig[0].Zone.NotifyServers;
    if ($('#zoneNotifyCb').is(':checked')){
		$("#notifyOptionsParentDiv").css('display','block');
		if(notifyOptionFromServer === 'NotifyServers'){
			$("#notifyOptions").val(notifyOptionFromServer).trigger('change');
		}
        if(notifyOptionFromServer === 'NotifyServers' && notifyServers !== null && notifyServers !== []){
            var rowData = notifyServers.map(function(ip, index) {
                return {
                    id: ip,          
                    dnsName: Ember.I18n.t('opu.common.NOT_ABLE_TO_RESOLVE',this),//No I18N        
                    ipAddress: ip,          
                    action: ""              
                };
            });
            $("#fqdnNotifyTransferGrid").show();
            $('#notifyServerList').show();
            setTimeout(function() {
                loadZoneConfigNotifyServersGrid('zoneNotifyTransferList', rowData);//No I18N
            }, 100);
        }
    }else{
        $("#notifyOptionsParentDiv").css('display','none');
		$("#notifyServerList").hide();
		$("#fqdnNotifyTransferGrid").hide();
		$("#fqdnNotifyZoneTransfer").hide();
    }
}
function zoneStaleRecords(){
    if ($('#staleRecords').is(':checked')){
        $("#staleRecordsDiv").removeClass("disabledBlock");
    }else{
        $("#staleRecordsDiv").addClass("disabledBlock");
    }
}
function showHideAddFqdnBtn(){
	if($("#newfqdnSelBox").val().length > 0){
		$('#addFqdnBtn').removeClass("disabledBlock");
	}else{
		$('#addFqdnBtn').addClass("disabledBlock");
	}
}
function addFqdnInZoneConfig(){
    $('#addFqdnBtn').addClass("disabledBlock");
    var fqdn = $("#newfqdnSelBox").val();
	var fieldsToValidate = {'empty': ['newfqdnSelBox'],'validNameServer': ['newfqdnSelBox']};//No I18N
    if (!opm_validateFields(fieldsToValidate)) {
        return false;
    }
    var fqdnArr = OPMClient.InventoryOpUtilsController.dnsZoneFqdn.toArray();
    fqdnArr.push(fqdn);
    OPMClient.InventoryOpUtilsController.set('dnsZoneFqdn',fqdnArr);//No I18N
    if(OPMClient.InventoryOpUtilsController.dnsZoneFqdn.length > 0){
        $("#newfqdnSelBox").css('display','none');
        $("#fqdnSelBoxParentDiv").css('display','block');
        $("#addNewFqdn").css('display','block');

        Ember.run.next(function () {
            $("#fqdnSelBox").select2();
            var lastServerName = fqdnArr[fqdnArr.length - 1];
            $('#fqdnSelBox').val(lastServerName).trigger('change');
        });
    }
}
function showHideFqdnDiv(){
    if ($("#newfqdnSelBox").is(":visible")) {
        $("#fqdnSelBoxParentDiv").css('display','block');
        $("#fqdnSelBox").css('display', 'block');
        $("#newfqdnSelBox").css('display', 'none');
        $("#newfqdnDiv").css('display', 'none');
    } else {
        $("#fqdnSelBox").css('display', 'none');
        $("#fqdnSelBoxParentDiv").css('display','none');
        $("#newfqdnSelBox").val('');
        $("#newfqdnDiv").css('display','block');
        $("#newfqdnSelBox").css('display','block');
        $("#newfqdnSelBox").focus();
    }
}
function addNewFqdnInZoneConfig(){
	$("#newfqdnDiv").css('display','block');
    $("#fqdnSelBoxParentDiv").css('display','none');
    $("#newfqdnSelBox").val('');
	$("#newfqdnSelBox").css('display','block');
}
function enableFqdnAddButton(){
    var fqdnVal = $("#newfqdnSelBox").val().trim();
    if(fqdnVal.length > 0){
        $("#addFqdnBtn").removeClass("disabledBlock");
    }
}
function isValidPriorityInt(number){
	if(number >= 0 && number <=65535){
		return true;
	}else{
		return false;
	}
}
function validateZoneNetworkID(networkAddr){
    var networkAddrRegex = /^((25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})\.(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})\.(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})(\.(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2}))?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    return networkAddrRegex.test(networkAddr);
}
function isValidReverseZone(zoneName) {
    var regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.in-addr\.arpa$/i;
    return regex.test(zoneName);
}
function isValidNameServer(fqdn){
    var regex = /^(?!\d{1,3}(\.\d{1,3}){3}$)([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
    return regex.test(fqdn);
}
function isValidIPv6ReverseZone(zoneName){
    var regex = /^([0-9a-f]\.){1,32}ip6\.arpa$/i;
    return regex.test(zoneName);
}
function selectRecordType(){
    var recordType = $("#dnsRecordsSelBoxDiv").val();
    var isAws = false;
    var isGcp = false;
    try { isAws = !!OPMClient.InventoryOpUtilsController.get('isAwsDnsServer'); } catch(e) {}//No I18N
    try { isGcp = !!OPMClient.InventoryOpUtilsController.get('isGcpDnsServer'); } catch(e) {}//No I18N
    if (isAws || isGcp) {
        showAwsConsoleRecordUI(OPMClient.InventoryOpUtilsController.currentZoneName);
        if (isGcp) {
             applyAwsRecordTypeMeta(recordType);
             applyGcpRecordTypeMeta(recordType);
             applyGcpRoutingPolicyOptions(recordType, $("#gcpRoutingPolicy").val());
            $("#awsRoutingPolicyDiv").hide();//No I18N
            $("#gcpRoutingPolicyDiv").show();//No I18N
            if (typeof toggleGcpRoutingPolicyFields === 'function') { toggleGcpRoutingPolicyFields(recordType,$("#gcpRoutingPolicy").val()); }
        } else {
             applyAwsRecordTypeMeta(recordType);
            $("#gcpRoutingPolicyDiv").hide();//No I18N
            $("#awsRoutingPolicyDiv").show();//No I18N
            if (typeof toggleAwsRoutingPolicyFields === 'function') { toggleAwsRoutingPolicyFields(); }
        }
        return;
    }
    hideAwsConsoleRecordUI();
    $("#awsRoutingPolicyDiv").hide();//No I18N
    $("#gcpRoutingPolicyDiv").hide();//No I18N

    // Hide TXT by default for all types
    $("#txtRecord").hide();
    if(recordType === 'A' || recordType === 'AAAA'){
		$("#ATypeRecord").show();
		$("#createPtrRecord").show();
		$("#recordNameDiv").show();
		$("#aliasNameDiv").hide();
		$("#hostOrChildNameDiv").hide();
		$("#cNameRecord").hide();
		$("#ptrRecord").hide();
		$("#nsRecord").hide();
		$("#mxRecord").hide();
		$("#srvRecord").hide();
		$("#recordName").val('');
		$("#hostIPAddrDiv").hide();
		$("#domainForSrvDiv").hide();
        $("#isAgingEnabled").show();
        $('#fqdnFromRecord').addClass('disabledBlock');
        $("#fqdnFromRecord").val(OPMClient.InventoryOpUtilsController.currentZoneName);
		
    }else if(recordType === 'CNAME'){//No I18N
		$("#cNameRecord").show();
		$("#hostIPAddrDiv").hide();
		$("#domainForSrvDiv").hide();
		$("#recordNameDiv").hide();
		$("#aliasNameDiv").show();
		$("#hostOrChildNameDiv").hide();
		$("#createPtrRecord").hide();
		$("#ATypeRecord").hide();
		$("#ptrRecord").hide();
		$("#nsRecord").hide();
		$("#mxRecord").hide();
		$("#srvRecord").hide();
        $("#isAgingEnabled").show();
		$("#recordName").val('');
		$('#fqdnFromRecord1').addClass('disabledBlock');
        $("#fqdnFromRecord1").val(OPMClient.InventoryOpUtilsController.currentZoneName);
    }else if(recordType === 'MX'){//No I18N
		$("#ptrRecord").hide();
		$("#hostIPAddrDiv").hide();
		$("#hostOrChildNameDiv").show();
		$("#domainForSrvDiv").hide();
		$("#recordNameDiv").hide();
		$("#aliasNameDiv").hide();
		$("#createPtrRecord").hide();
		$("#ATypeRecord").hide();
		$("#cNameRecord").hide();
		$("#nsRecord").hide();
		$("#mxRecord").show();
		$("#srvRecord").hide();
		$("#recordName").val('');
        $("#isAgingEnabled").hide();
        $('#fqdnFromRecord3').addClass('disabledBlock');
        $("#fqdnFromRecord3").val(OPMClient.InventoryOpUtilsController.currentZoneName);
    }else if(recordType === 'PTR'){//No I18N
		$("#ptrRecord").show();
		$("#domainForSrvDiv").hide();
		$("#hostIPAddrDiv").show();
		$("#recordNameDiv").hide();
		$("#aliasNameDiv").hide();
		$("#hostOrChildNameDiv").hide();
		$("#createPtrRecord").hide();
		$("#ATypeRecord").hide();
		$("#cNameRecord").hide();
		$("#nsRecord").hide();
		$("#mxRecord").hide();
		$("#srvRecord").hide();
        $("#isAgingEnabled").show();
		$("#recordName").val('');
        $('#fqdnFromRecord2').addClass('disabledBlock');
        $("#fqdnFromRecord2").val(OPMClient.InventoryOpUtilsController.currentZoneName);
		var reverseZoneName = OPMClient.InventoryOpUtilsController.currentZoneName;
        reverseZoneName = reverseZoneName.replace(/\.in-addr\.arpa\.?$/i, '');
        var reversed = reverseZoneName.split('.').reverse().join('.');
		var octets = reversed.split('.');
        var octetCount = octets.length;
        $('.ipCheck').each(function(i){
            if (i < octets.length) {
              $(this).val(octets[i]).prop('disabled', true);   // fill & disable
            } else {
              $(this).val('').prop('disabled', false).on('input', function() {                 // attach input handler
                   getConstructedFQDN(this.id);
               });         // empty & enable
            }
        });
    }else if(recordType === 'NS'){//No I18N
		$("#recordNameDiv").hide();
		$("#aliasNameDiv").hide();
		$("#domainForSrvDiv").hide();
		$("#hostOrChildNameDiv").hide();
		$("#nsRecord").show();
		$("#ptrRecord").hide();
		$("#createPtrRecord").hide();
		$("#ATypeRecord").hide();
		$("#cNameRecord").hide();
		$("#mxRecord").hide();
		$("#srvRecord").hide();
		$("#recordName").val('');
		$("#hostIPAddrDiv").hide();
        $("#isAgingEnabled").hide();
	}
    else if(recordType === 'SRV'){//No I18N
		$("#domainForSrvDiv").show();
		$("#hostIPAddrDiv").hide();
		$("#aliasNameDiv").hide();
		$("#recordNameDiv").hide();
		$("#hostOrChildNameDiv").hide();
		$("#ptrRecord").hide();
		$("#createPtrRecord").hide();
		$("#ATypeRecord").hide();
		$("#cNameRecord").hide();
		$("#nsRecord").hide();
		$("#mxRecord").hide();
		$("#srvRecord").show();
		$("#recordName").val('');
        $("#isAgingEnabled").hide();
        $('#domainForSrv').addClass('disabledBlock');
        $("#domainForSrv").val(OPMClient.InventoryOpUtilsController.currentZoneName);
    }
    else if(recordType === 'TXT'){//No I18N
		$("#txtRecord").show();
		$("#recordNameDiv").show();
		$("#aliasNameDiv").hide();
		$("#domainForSrvDiv").hide();
		$("#hostOrChildNameDiv").hide();
		$("#hostIPAddrDiv").hide();
		$("#ATypeRecord").hide();
		$("#cNameRecord").hide();
		$("#ptrRecord").hide();
		$("#nsRecord").hide();
		$("#mxRecord").hide();
		$("#srvRecord").hide();
		$("#createPtrRecord").hide();
		$("#isAgingEnabled").hide();
		$("#recordName").val('');
    }
}

function enableDisableWarningMSG(input){
    if(input == "./"){
        $("#nonADWarningDiv").show();
        $('#collectRdcData').prop("checked", false);
        $('#collectRdcData').prop("disabled", true);
        $("#rdcBadgeRow").css('display','none');
    }else{
        $("#nonADWarningDiv").hide();
        $('#collectRdcData').prop("disabled", false);
        $('#collectRdcData').prop("checked", true);
        $("#rdcBadgeRow").css('display','block');
    }
}
function oputilsExportjs(data){
	if(data.Message !== undefined){
		opm_infoMsgs('errorMsg', data.Message); //No I18N
	}
}

function handleOPUMigration (migrationType){
    var url = window.OPM.apiUrlPattern + "/oputilsadmin/handleOPUMigrations";//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            OPMClient.InventoryOpUtilsController.set('netidToIpMapping','true'); //No I18N
            opm_infoMsgs("successMsg","NetIdToIPMaping Migration is success",this); //No I18N
        }
    }
    opm_ajaxPostRequestWithMsg(url, {"migrationType": migrationType}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
}
function updateCLIPortNo(params, portid){
    if(params == 'SSH'){
        $('#'+portid).val(22);
    }else{
        $('#'+portid).val(23);
    }
}

function fetchDHCPSuperscopeDetailsForEditPage()
{
    var cbmethod = function(response)
    {
        if(response.status === "Failure")
        {
            if(response.message !== undefined && response.message !== ""){
                opm_infoMsgs("errorMsg",response.message); //No I18N
            }
            else{
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
            }
            deviceSlideOut(2);
            backToDevSnapshotPage();
        }else
        {
            $("#dhcpSuperscopeLodingPageDiv").hide();
            $("#dhcpAddSuperscopePageDiv").show();
            OPMClient.InventoryOpUtilsController.DHCPSuperscopeRespDetails=response.rows[0];
            var superscopedetails = OPMClient.InventoryOpUtilsController.DHCPSuperscopeRespDetails;
            var serverid = superscopedetails.dhcpServerId;
            $('#dhcpserverip').val(serverid).change();
            $("#superscopename").val(superscopedetails.superscopeName);
            $("#superscopedesc").val(superscopedetails['superscope-desc']);//NO I18N
            var selectedScopes = superscopedetails.selectedScopes
            OPMClient.InventoryOpUtilsController.set("DHCPSuperscopeSubnets",[]);//NO I18N
            for (var id in selectedScopes) {
                if (selectedScopes.hasOwnProperty(id)) {
                    var scope = selectedScopes[id];
                    var objData = {"scopeaddr":scope.scopeAddress,"scopename":scope.scopeName,"scopeid":id};//NO I18N
                    loadDHCPScopesForSuperscope(objData);
                }
            }
            OPMClient.InventoryOpUtilsController.set("MicroSoftDHCPScopes",[]);//NO I18N
            var dhcpscopes = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getDHCPScopeDetails?dhcpServerId='+OPMClient.InventoryOpUtilsController.DHCPEditSuperscopeServerID);//No I18N
            $.each(dhcpscopes.rows, function(dsindex,dhcpscp) {
                if(dhcpscp['dhcp-superscope-id'] == null || dhcpscp['dhcp-superscope-id'] == undefined || dhcpscp['dhcp-superscope-id'] == "") {//No I18N
                    var objData1 = {"scopeaddr":dhcpscp['dhcp-scope-address'],"scopename":dhcpscp['dhcp-scope-name'],"scopeid":dhcpscp['dhcp-scope-id']} //No I18N
                    OPMClient.InventoryOpUtilsController.MicroSoftDHCPScopes.push(objData1);
                }
            })
        }
    }
    var params = {"dhcpSuperscopeId":OPMClient.InventoryOpUtilsController.DHCPEditSuperscopeID,"dhcpServerId":OPMClient.InventoryOpUtilsController.DHCPEditSuperscopeServerID};//NO I18N
    var superscopeDetails = opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/ipam/getDHCPIPv4SuperscopeSummary', params,Ember.I18n.t('opu.ipam.fetching.configuration.msg',this),cbmethod);//No I18N
}

function editSuperscopeInWidget(wid, serverId, superScopeId){
    if(wid!=undefined&& (typeof wid != "number")){//No I18N
        if(wid.indexOf("opm_DeviceSnapList")!=-1){
            wid=wid.split('opm_DeviceSnapList')[1];//No I18N
        }
    }
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    OPMClient.InventoryOpUtilsController.set("DHCPEditSuperscopeServerID",serverId);//No I18N
    OPMClient.InventoryOpUtilsController.set("DHCPEditSuperscopeID",superScopeId);//No I18N
    opmGlobalRoute.transitionTo('Inventory.Device.EditDHCPSuperscope');//No I18N
    fetchDHCPSuperscopeDetailsForEditPage();
}

function checkExistingSuperscopeSubnet(newOption,existingArray){
    var returnVal = false;
    $.each(existingArray, function(i,val){
        if(val.scopeid===newOption){
            returnVal = true;
        }
    });
    return returnVal;
}

function oputilsDHCPSuperscopeActions(widgetID,actionFrom,action,moreparams){
    var data = {};
    var url = window.OPM.apiUrlPattern+'/ipam/syncDHCPIPv4Superscope'; //NO I18N
    data.dhcpServerId = OPMClient.InventoryOpUtilsController.dhcpServerID;
    opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
        if(response !== null && response.status=="Success"){
            if(response.result !== null && response.result !== undefined){
                opm_infoMsgs("successMsg",response.result); //No I18N
            }else{
                if(action != undefined && action == "allSuperscopes"){
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.admin.dbmanagement.updated',this));//No I18N
                }else{
                    opm_infoMsgs("successMsg", Ember.I18n.t('webclient.api.deletedevice.success',this));//No I18N
                }
            }
            reloadSnapshotPage();
        }else if(response !== null && response.status=="Failure"){//NO I18N
           if(response.message != undefined && response.message !== null){
               opm_infoMsgs("errorMsg",response.message);//NO I18N
           }else if(action != undefined && action == "allSuperscopes"){ //NO I18N
               opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.fwa.flow.action.failed', this));//No I18N
           }
        }
        else if(response.error!=undefined && response.error.message!=undefined){
                opm_infoMsgs("errorMsg",response.error.message); //No I18N
        }
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    },otpPageType: 'slide'});//NO I18N
}

function deleteSuperscopeInWidget(gid,superscopeId,serverId){
    if(confirm(Ember.I18n.t('opu.ipam.DHCP.SUPERSCOPE_DELETE_CONFIRM',this)+" "+Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed',this))){
        var url =window.OPM.apiUrlPattern + "/ipam/removeDHCPIPv4Superscope";//NO I18N
        opm_ajaxPostRequestWithMsg(url,{"dhcpSuperscopeId":superscopeId, "dhcpServerId":serverId}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT',this),{callback: function(response){//NO I18N
            if(response !== null && response.status == "Success")
                {
                    if(response.result !== null && response.result !== undefined){
                        opm_infoMsgs("successMsg",response.result); //No I18N
                    }else{
                        opm_infoMsgs("successMsg",Ember.I18n.t('webclient.api.deletedevice.success',this)); //No I18N
                    }
                     var wid = parseInt(gid.split('opm_DeviceSnapList')[1]);
                    OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//No I18N
                    reloadSnapWidgetsByWidgetID(wid);
                } else {
                    if(response.message !== undefined && response.message !== ""){
                        opm_infoMsgs("errorMsg",response.message); //No I18N
                    }
                    else{
                        opm_infoMsgs("errorMsg",response.error.message); //No I18N
                    }
                }
        },otpPageType: 'slide'});//NO I18N
    }
}
function toggleDDIPromotion() {
    $('.ddi-info-content').slideToggle();
    $('.ddi-info-action svg').toggleClass('rotate');
}
function saveDDIPromotion() {
    var isEnabled = $('#ddiPromotion').is(':checked'); //No I18N
    var params = { ddiPromotionEnabled : isEnabled };
    var url = window.OPM.apiUrlPattern + '/ipam/updateDDIPromotion'; //No I18N
    opm_ajaxPostRequestWithMsg(url, params, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), {//No I18N
        callback: function(response) {
            if (response !== null && response.status === 'Success') { //No I18N
                OPMClient.ApplicationController.isDDIPromotionEnabled = isEnabled;
                window.OPM.isDDIPromotionEnabled = isEnabled;
                if (response.result !== null && response.result !== undefined) {
                    opm_infoMsgs('successMsg', response.result); //No I18N
                } else {
                    opm_infoMsgs('successMsg', Ember.I18n.t('webclient.tabUpdate.Success', this)); //No I18N
                }
            } else {
                opm_infoMsgs('errorMsg', Ember.I18n.t('opu.common.UPDATE_FAILED', this)); //No I18N
            }
        }
    });
}
function oputilsNWMAlertDeleteActions(action,alertIds)
{
    if(alertIds==undefined){
        var alertIds = getEmberSelectedRows("opm_Devices", "alert-id");//No I18N
        if (alertIds == "" || alertIds === undefined)
        {
            alert(Ember.I18n.t('webclient.general.selectdevices', this)); //No I18N
            return;
        }
    }
    if(!confirm(Ember.I18n.t("opu.comman.ALERT_DELETE_CONFIRMATION",this))){//NO I18N
        return false;
    }
    var selRowIds = $("#opm_Devices").jqGrid('getGridParam', 'selarrrow');  //No I18N
    var idArr = new Array();
    for(var i=0;i<selRowIds.length;i++)
    {
        var rowData = jQuery("#opm_Devices").getRowData(selRowIds[i]);//NO I18N
        var id = rowData['alert-id'];//No I18N
        idArr.push(id);
    }
    var paramsData = {"ALERTID": idArr.join(",")}; //No I18N
    var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/nwm/deleteNWMAlerts', paramsData);//No I18N
    if (rsp.status === "Success") {
        opm_infoMsgs("successMsg",Ember.I18n.t("opu.ipam.ALERT_DELETED",this));//No I18N
        oputilsInventoryReload("NWMAlerts");//No I18N
        $('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
    }else{
        opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.fwa.flow.action.failed', this));//No I18N
    }
}

function dhcpAuthenticity(cellValue, options, rowdata, action){
    var authenticity = rowdata['authenticity_val'];//No I18N
    if(window.OPM.isAuthorized && authenticity){
        return "<i style='color: #3996dd;' title='"+authenticity+"'>"+authenticity+"</i>";//No I18N
    }else{
        return authenticity;
    }
}

function editDHCPAuthenticity(wid, dhcpServerID){
    OPMClient.InventoryOpUtilsController.set("selectedDhcpServerID", dhcpServerID);//No I18N
    if(wid!=undefined){
        OPMClient.InventoryOpUtilsController.widgetID=parseInt(wid);
    }
    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/EditDHCPAuthenticity"; //No I18N
}
function oputilsDHCPIconTools(cellValue, options, rowdata, action){
    if(cellValue != ""){
        var authenticity = rowdata.authenticity;
        var ipToolIcon = "<i class='cursorPointer' title='"+cellValue+"'>"+cellValue+"</i><i title='"+cellValue+"' data-ip='"+cellValue+"' class='cursorPointer icon-right-dir oputilsippingicon'></i>";
        if(authenticity === "1"){
            return '<em class="svgIcon size18 pull-left line-height-0 mr-xs" title="'+Ember.I18n.t('webclient.discovery.success.discovered',this)+'"><svg fill="#ff9424"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#loading-circle"/></svg></em>'+ipToolIcon;//No I18N
        }else if(authenticity === "2"){
            return '<em class="svgIcon size18 pull-left line-height-0 mr-xs" title="'+Ember.I18n.t('opu.common.TRUSTED',this)+'"><svg fill="#268733"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#verified-shield"/></svg></em>'+ipToolIcon;//No I18N
        }else if(authenticity === "3"){
            return '<em class="svgIcon size18 pull-left line-height-0 mr-xs" title="'+Ember.I18n.t('opu.tools.ROGUE',this)+'"><svg fill="#DB3136"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#block-1"/></svg></em>'+ipToolIcon;//No I18N
        }else{
            return "<i class='icon-status6' title='"+Ember.I18n.t('webclient.ncm.eol.na',this)+"'></i>"+ipToolIcon;//No I18N
        }
    }
    else{
        return cellValue;
    }
}

function opuDHCPDiscoveryTab(){
    location.href = window.OPM.apiclientUrl+"Settings/OpUtils/DHCP/RogueDiscovery";//NO I18N
}

function rogueDHCPDiscoverySelectAll(){
    $('#AllOptions').on('click',function(){
        var className = "discOptList";//No I18N
        if(this.checked){
            $('.'+className).each(function(){
                this.checked = true;
            });
        }else{
            $('.'+className).each(function(){
                this.checked = false;
            });
        }
    });
    $('#powershellCheck').on('click',function(){
        var childCheckboxes = $('#accessList input[class="discOptList"]');//No I18N
        if(this.checked){
            childCheckboxes.each(function(){
                this.checked = true;
            });
        }else{
            childCheckboxes.each(function(){
                this.checked = false;
            });
        }
        if($('.discOptList:checked').length == $('.discOptList').length){
            $('#AllOptions').prop('checked',true);
        }else{
            $('#AllOptions').prop('checked',false);
        }
    });
    $('#accessList input[class="discOptList"]').on('click',function(){
        var childCheckboxes = $('#accessList input[class="discOptList"]');//No I18N
        var anyChildChecked = childCheckboxes.is(':checked');//No I18N
        $('#powershellCheck').prop('checked', anyChildChecked);
        if($('.discOptList:checked').length == $('.discOptList').length){
            $('#AllOptions').prop('checked',true);
        }else{
            $('#AllOptions').prop('checked',false);
        }
    });
    $('.discOptList').on('click',function(){
        if($('.discOptList:checked').length == $('.discOptList').length){
            $('#AllOptions').prop('checked',true);
        }else{
            $('#AllOptions').prop('checked',false);
        }
    });
}

function discoverRogueDHCP(){
    var url = window.OPM.apiUrlPattern + "/ipam/discoverRogueDHCPServers";//No I18N
    var cbmethod = function(response){
        if(response.status === "Failure"){
            opm_infoMsgs("errorMsg",response.message); //No I18N
        }else{
            setTimeout(function(){
                opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.dhcp.discovery.manual_scan_resp",this)); //No I18N
            }, 100);
        }
    }
    opm_ajaxPostRequestWithMsg(url, "", "", cbmethod);//No I18N
}

function dhcpDiscoveryDisabledAlert(jsonData) {
    if (jsonData === null || jsonData === undefined || jsonData.code === undefined) {
        return;
    }
    var responseCode = jsonData.code;
    var DHCP_DISCOVERY_CODES = {
        2003: { type: 'errorMsg', messageKey: 'webclient.dhcp.discovery.scan.disabled.msg' },//No I18N
        1000: { type: 'successMsg', messageKey: 'webclient.dhcp.discovery.scan.success.msg' },//No I18N
        1002: { type: 'successMsg', messageKey: 'webclient.dhcp.discovery.scan.nodata.msg' }//No I18N
    };
    var config = DHCP_DISCOVERY_CODES[responseCode];
    if (OPMClient.InventoryDeviceDetailsController.inventorysnapType === "DHCPSummary" && responseCode === 1000) {
        reloadSnapshotPage();
    }
    if (config) {
        setTimeout(function() {
            var title = Ember.I18n.t('webclient.action.roguedhcp.discovery', this);//No I18N
            var message = Ember.I18n.t(config.messageKey, this);
            opm_infoMsgs(config.type, title + " : " + message); //No I18N
        }, 200);
    }
}

function setSearchOptionsByColName(colModelList, colName, value) {
    for (var i = 0; i < colModelList.length; i++) {
        if (colModelList[i].name === colName) {
            colModelList[i].searchoptions = {value: value, defaultValue: ""};
            break;
        }
    }
}
function setHiddenColumn(colModel, colNames, status) {
    for(var i=0; i<colModel.length; i++) {
        if(colNames.contains(colModel[i].name)) {
            colModel[i].hidden = status;
            colModel[i].hidedlg = status;
        }
    }
}

function getGetIPPortUtilization() {
    var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/ipam/getIPPortUtilization')//No I18N
    OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.IPAM.Low=response.result.IPAM.Low;
    OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.IPAM.High=response.result.IPAM.High;
    OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.SPM.Low=response.result.SPM.Low;
    OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.SPM.High=response.result.SPM.High;
    OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.DHCP.High=response.result.DHCP.High;
    OPMClient.InventoryOpUtilsController.oputilsSwitchSubnetUtilization.DHCP.Low=response.result.DHCP.Low;
}

function wrrAddIp(itemId) {
    var ipContainer = $('#'+itemId +' .ip-container');
    var ipCount = ipContainer.find('.ip-row').length;
    var newIpId = 'wrr-ip-'+itemId.split('-').pop()+'-'+ipCount;//No I18N

    var clone = ipContainer.find('.ip-row').first().clone(true);
    clone.attr('id', newIpId);// No I18N
    clone.find('.ip-address').val('').attr('id', newIpId + '-addr');//No I18N
    clone.find('.health-check').prop('checked', false).attr('id', newIpId + '-hc');//No I18N

    ipContainer.append(clone);
  };

function wrrRemoveIp(el) {
    var ipContainer = $(el).closest('.ip-container');
    if (ipContainer.find('.ip-row').length > 1) {
      $(el).closest('.ip-row').remove();
    }
  };

function wrrRemoveRoutingItem(el) {
    if ($('#routing-items-container .routing-item').length > 1) {
      $(el).closest('.routing-item').remove();
    } else {
      opm_infoMsgs("errorMsg",Ember.I18n.t('opu.ipam.gcp.routing.CANNOT_DELETE_ONLY_ITEM',this)); //No I18N
    }
  };

  function applyGcpRecordTypeMeta(recordType) {
	  var meta = GCP_RECORD_TYPE_META[recordType] || { label: '', placeholder: '', hint: '' };
	  $('.gcpDataLabel').text(meta.label);
	  $('.gcpText').each(function() {
		$(this).attr('placeholder', meta.placeholder);
	  });

	  if (meta.healthCheck) {
			$(' .gcpHealthCheckCol').show();
            $('#gcpGeoFencing').closest('.opmFormRow').show();
        } else {
            $('.gcpHealthCheckCol').hide();
            $('.gcpHealthCheckHeader').hide();
            $('.health-check').prop('checked', false);
            $('#gcpGeoFencing').closest('.opmFormRow').hide();
            $('input[name="gcpPbGeoFencing"]').closest('.opmFormRow').hide();
        }

        if (recordType === 'CNAME') {
            // hide add value button inside wrr/geo items - only one canonical name per weight
            $('#routing-items-container .addIpBtn').hide();
            $('#geo-items-container .addGeoIpBtn').hide();
        } else {
            var btnLabel = Ember.I18n.t('jsp.commonstr.Add', this) + ' ' + Ember.I18n.t('opu.ipam.records', this) + ' ' + Ember.I18n.t('jsp.commonstr.Value', this);//No I18N
            $('#routing-items-container .addIpBtn').show().text(btnLabel);
            $('#geo-items-container .addGeoIpBtn').show().text(btnLabel);
        }
        onGcpHealthCheckToggle(recordType);
	}

function applyGcpRoutingPolicyOptions(recordType, selectedValue) {
    OPMClient.InventoryOpUtilsController.set('gcpRoutingPolicyOptions', []);//No I18N
    var rpMeta = GCP_ROUTING_POLICY_META[recordType] || { policies: ['SIMPLE'] };//No I18N
    var allOptions = [
        { value: 'SIMPLE',         label: Ember.I18n.t('webclinet.inventory.acl.standard',this) },//No I18N
        { value: 'WRR',            label: Ember.I18n.t('opu.ipam.gcp.weighted.round.robin',this) },//No I18N
        { value: 'GEO',            label: Ember.I18n.t('NFAWidget.geo',this) },//No I18N
        { value: 'PRIMARY_BACKUP', label: Ember.I18n.t('webclient.Primary',this) + ' / ' + Ember.I18n.t('dashboard.name.backup',this) + ' (' + Ember.I18n.t('webclient.audit.failover',this) + ')' }//No I18N
    ];
    var selected = (selectedValue || 'SIMPLE').toString().toUpperCase();//No I18N
    if (rpMeta.policies.indexOf(selected) === -1) {
        selected = 'SIMPLE';//No I18N
    }
    var filteredOptions = allOptions.filter(function(opt) {
        return rpMeta.policies.indexOf(opt.value) !== -1;
    }).map(function(opt) {
        return { value: opt.value, label: opt.label, isSelected: opt.value === selected };
    });
    OPMClient.InventoryOpUtilsController.set('gcpRoutingPolicyOptions', filteredOptions);//No I18N
}


var GCP_RECORD_TYPE_META = {
  'A':     { label: Ember.I18n.t('webclient.devices.details.ipaddress'),            placeholder: '192.0.2.91',                  healthCheck: true  },//No I18N
  'AAAA':  { label: Ember.I18n.t('webclient.devices.details.ipaddress'),            placeholder: '2001:db8::1',                 healthCheck: true  },//No I18N
  'CNAME': { label: Ember.I18n.t('opu.ipam.fqdn.name'),                             placeholder: 'example.com.',                healthCheck: false },//No I18N
  'MX':    { label: Ember.I18n.t('opu.ipam.fqdn.name.mxServer'),                    placeholder: '10 mail.example.com.',         healthCheck: false },//No I18N
  'SRV':   { label: Ember.I18n.t('opu.ipam.gcp.srv.data'),                          placeholder: '0 1 587 mail.example.com.',   healthCheck: false },// No I18N
  'TXT':   { label: Ember.I18n.t('opu.ipam.gcp.txt.data'),                          placeholder: 'v=spf1 include:example.com.', healthCheck: false }// No I18N
};

function geoAddIp(itemId) {
  var ipContainer = $('#' + itemId + ' .ip-container');
  var ipCount = ipContainer.find('.ip-row').length;
  var newIpId = 'geo-ip-'+itemId.split('-').pop()+'-'+ipCount;//No I18N
  var clone = ipContainer.find('.ip-row').first().clone(true);
  clone.attr('id', newIpId);//No I18N
  clone.find('.ip-address').val('').attr('id', newIpId + '-addr');//No I18N
  clone.find('.health-check').prop('checked', false).attr('id', newIpId + '-hc');//No I18N
  ipContainer.append(clone);
};

function geoRemoveIp(el) {
  var ipContainer = $(el).closest('.ip-container');
  if (ipContainer.find('.ip-row').length > 1) {
    $(el).closest('.ip-row').remove();
  }
};

function geoRemoveItem(el) {
  if ($('#geo-items-container .geo-item').length > 1) {
    $(el).closest('.geo-item').remove();
  }
};

var GCP_ROUTING_POLICY_META = {
    'A':     { policies: ['SIMPLE', 'WRR', 'GEO', 'PRIMARY_BACKUP'] },//No I18N
    'AAAA':  { policies: ['SIMPLE', 'WRR', 'GEO', 'PRIMARY_BACKUP'] },//No I18N
    'CNAME': { policies: ['SIMPLE', 'WRR', 'GEO'] },//No I18N
    'MX':    { policies: ['SIMPLE', 'WRR', 'GEO'] },//No I18N
    'SRV':   { policies: ['SIMPLE', 'WRR', 'GEO'] },//No I18N
    'TXT':   { policies: ['SIMPLE', 'WRR', 'GEO'] }//No I18N
};

function resetGcpRoutingPolicy() {
    // WRR - keep only first item, clear all values
    $('#routing-items-container .routing-item:not(:first)').remove();
    var firstWrr = $('#routing-items-container .routing-item').first();
    firstWrr.find('.weight').val('');
    firstWrr.find('.ip-row:not(:first)').remove();
    firstWrr.find('.ip-address').val('');
    firstWrr.find('.health-check').prop('checked', false);//No I18N
    firstWrr.attr('data-is-new', 'true');//No I18N
    firstWrr.find('.routing-title-action').text(Ember.I18n.t('webclient.map.view.new'));//No I18N

    // GEO - keep only first item, clear all values
    $('#geo-items-container .geo-item:not(:first)').remove();
    var firstGeo = $('#geo-items-container .geo-item').first();
    firstGeo.find('.geo-region').val('-1').trigger('change.select2');//No I18N
    firstGeo.find('.ip-row:not(:first)').remove();
    firstGeo.find('.ip-address').val('');
    firstGeo.find('.health-check').prop('checked', false);//No I18N
    firstGeo.attr('data-is-new', 'true');//No I18N
    firstGeo.find('.routing-title-action').text(Ember.I18n.t('webclient.map.view.new'));//No I18N

    // PRIMARY_BACKUP - clear primary IPs (keep only first row)
    $('#gcpPbPrimaryContainer .ip-row:not(:first)').remove();
    $('#gcpPbPrimaryContainer .ip-address').val('');

    // PRIMARY_BACKUP - clear backup geo (keep only first item)
    $('#gcpPbBackupContainer .geo-item:not(:first)').remove();
    var firstPb = $('#gcpPbBackupContainer .geo-item').first();
    firstPb.find('.geo-region').val('-1').trigger('change.select2');//No I18N
    firstPb.find('.ip-row:not(:first)').remove();
    firstPb.find('.ip-address').val('');
    firstPb.find('.health-check').prop('checked', false);//No I18N
    firstPb.attr('data-is-new', 'true');//No I18N
    firstPb.find('.routing-title-action').text(Ember.I18n.t('webclient.map.view.new'));//No I18N
    $('#gcpPbTrickle').val('');
    $('#gcpGeoFencing').prop('checked', false);
    $('#gcpPbGeoFencingDisabled').prop('checked', true);
    $('#gcpHealthCheck').val('');
}

function pbAddPrimaryIp() {
    var container = $('#gcpPbPrimaryContainer');
    var count = container.find('.ip-row').length;
    var newId = 'gcpPb-primary-'+count;//No I18N
    var clone = container.find('.ip-row').first().clone(true);
    clone.attr('id', newId);// No I18N
    clone.find('.ip-address').val('').attr('id', newId + '-addr');//No I18N
    container.append(clone);
}

function pbRemovePrimaryIp(el) {
    var container = $('#gcpPbPrimaryContainer');
    if (container.find('.ip-row').length <= 1) { return; } // keep at least one
    $(el).closest('.ip-row').remove();
}

function pbAddBackupIp(itemId) {
    var ipContainer = $('#'+itemId+' .ip-container');
    var count = ipContainer.find('.ip-row').length;
    var itemIndex = itemId.split('-').pop();
    var newId = 'gcpPb-ip-'+itemIndex+'-'+count;//No I18N
    var clone = ipContainer.find('.ip-row').first().clone(true);
    clone.attr('id', newId);// No I18N
    clone.find('.ip-address').val('').attr('id', newId + '-addr');//No I18N
    ipContainer.append(clone);
}

function pbRemoveBackupIp(el) {
    var ipContainer = $(el).closest('.ip-container');
    if (ipContainer.find('.ip-row').length <= 1) { return; } // keep at least one
    $(el).closest('.ip-row').remove();
}

function pbRemoveBackupItem(el) {
    var container = $('#gcpPbBackupContainer');
    if (container.find('.geo-item').length <= 1) { return; } // keep at least one
    $(el).closest('.geo-item').remove();
}

function onGcpHealthCheckToggle(recordType, rpKind) {
    var rp = (rpKind || $("#gcpRoutingPolicy").val() || 'SIMPLE').toUpperCase(); //No I18N
    var rt = recordType || $('#dnsRecordsSelBoxDiv').val() || ''; //No I18N
    var isIpRecord = (rt === 'A' || rt === 'AAAA'); //No I18N
    var isPb = (rp === 'PRIMARY_BACKUP'); //No I18N
    var hasChecked = $('.health-check:checked').length > 0; //No I18N
    var showHealthCheck = isIpRecord && (isPb || hasChecked);
    $('#gcpHealthCheckRow').toggle(showHealthCheck); //No I18N
}
