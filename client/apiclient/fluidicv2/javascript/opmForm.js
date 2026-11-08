//$Id$
// Regex containing the keys listed immediately above.
var opm_htmlEscaper = /[&<>"'\/]/g;
function setMainTabSelection(tabId){
    $(".settingsHdr > ul li").removeClass('active');
    $(".settingsHdr > ul li:nth-child("+tabId+")").addClass('active');
}
function isNotEmpty(str)
{
    var temp = trimAll(str);
    if (temp.length > 0 ) {
        return true;
    }
    return false;
}
function validateTimeInput(time) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}
function opmFileUpload(filename) {
    tis=$(filename);
    if(tis.value == ''){
        fileLabel.innerHTML = "Choose file"; //No I18N
    }else{
        var theSplit = filename.value.split('\\');
        tis.parent().find('.fileUploadTxt').text(theSplit[theSplit.length-1]);
    }
}

function opm_cancel(route,params){
    //if(confirm(Ember.I18n.t('webclient.common.cancel.confirmalert',this))){//No I18N
        if(route !== undefined && route !== "" && route !== null){//No I18N
            if(params !== undefined && params !== "" && params !== null){//No I18N
                settingsGlobalRoute.transitionTo(route,params);
            }else{
                settingsGlobalRoute.transitionTo(route);
            }
        }
        return true;
    //}
    //return false;
}
function proxyFormenableDisable(checkedVal){
    if(checkedVal === true || checkedVal === "true"){
        $("#proxyForm .opmFormCol input").prop('disabled',false);//No I18N
        $("#proxyForm .opmFormCol textarea").prop('disabled',false);//No I18N

    }else{
        $("#proxyForm .opmFormCol input").prop('disabled',true);//No I18N
        $("#proxyForm .opmFormCol textarea").prop('disabled',true);//No I18N
    }
}
function opm_isNumber(e)
{
    var unicode=e.charCode? e.charCode : e.keyCode;
    if (unicode!=8 && unicode != 9){
        if (unicode<48||unicode>57)
        {
            return false ;
        }
    }
    return true;
}
function opm_addMultipleMobileNumbers(e) {
    var unicode = e.charCode ? e.charCode : e.keyCode;           
    if (unicode != 8 && unicode != 9) {
          if (unicode !== 44 && unicode !== 43 && (unicode < 48 || unicode > 57)) {
                return false;
          }
    }
    return true;
}
function opm_isStringValue(e)
{
    var unicode=e.charCode? e.charCode : e.keyCode;
    if (unicode!=8 && unicode != 9){
        if (unicode<48||unicode>57)
        {
            return true ;
        }
    }
    return false;
}
function opm_isFloatNumber(e)
{
    var unicode=e.charCode? e.charCode : e.keyCode;
    if (unicode!=8 && unicode!=46){
        if (unicode<48||unicode>57) {
            return false ;
        }
    }
    return true;
}
function opm_validateSignedFloat(value)
{
    var reg = /^(-)?(?=.+)(?:[0-9]\d*|0)?(?:\.\d+)?$/;
    return reg.test(value);
}
function opm_validateUnsignedFloat(val)
{
    var reg = /^(?=.+)(?:[0-9]\d*|0)?(?:\.\d+)?$/;
    return reg.test(val)
}
function opm_validateDecimalPlacesForSignedFloat(value)
{
    var regexp = /^(-)?\d*(\.\d{1,3})?$/; //3 decimal places are hardcorded.
    return regexp.test(value);
}
function opm_validateDecimalPlaces(val)
{
    var regexp = /^\d*(\.\d{1,3})?$/; //3 decimal places are hardcorded.
    return regexp.test(val);
}
function opm_validateFloat(e)
{
    var unicode=e.charCode? e.charCode : e.keyCode;
    if (unicode!=8 || unicode!=9){
        if ((unicode<48||unicode>57)&&(unicode!=46)) {
            return false ;
        }
    }
    return true;
}
//Credential Related Functions
var credDisplayNames = {
    "snmp1": Ember.I18n.t('webclient.admin.credential.snmpcredential',this),
    "snmp3": Ember.I18n.t('webclient.admin.credential.snmpv3credential',this),
    "telnet": Ember.I18n.t('webclient.admin.credential.telnetcredential',this),
    "windows": Ember.I18n.t('webclient.admin.credential.windowscredential',this),
    "nutanixdev": Ember.I18n.t('dashboard.name.nutanix',this), //No I18n
    "videvice": Ember.I18n.t('webclient.admin.credential.vmwarecredential',this),
    "citrixdev": Ember.I18n.t('webclient.admin.credential.citrixcredential',this),
    "ucs": Ember.I18n.t('webclient.devices.ucs.ucs',this),
    "nCredDiv":Ember.I18n.t('webclient.device.de.backup',this), //No I18n
    //"restapi":Ember.I18n.t('webclient.common.restapi',this),//No I18n
    "restapi":Ember.I18n.t('webclient.opm.perf.settings.discovery.ipmi',this), //No I18n
    "restapiFrmk":Ember.I18n.t('webclient.common.restapi',this), //No I18n
    "ciscoACI": Ember.I18n.t('opm.ciscoaci.aci',this), //No I18n
    "telemetry": Ember.I18n.t('webclient.opm.credential.type.telemetry',this), //No I18n
    "gcp": Ember.I18n.t('opu.ipam.GCP_CREDENTIAL',this) //No I18n
};
function showCredentialDiv(credentialType,self)
{
    OPMClient.SettingsAddEditController.selectedCredential = credentialType;

    var header = Ember.I18n.t('webclient.discovery.addcredential',this);
    if(OPMClient.SettingsTabController.isEdit) {
      header = Ember.I18n.t('webclient.discovery.editcredential',this);
    }
    if(credDisplayNames[credentialType]!==undefined) {
        $("#credentialHeader span").html(header+" ("+credDisplayNames[credentialType]+")");
    } else {
        $("#credentialHeader span").html(header+" (Storage)"); //No I18N
    }
    $('#addCredHeaderInfo').hide();
    $(".credentials").show();
    $("#credentialCategoryDiv").hide();
    $("#snmp1").hide();//No I18N
    $("#snmp3").hide();//No I18N
    $("#windows").hide();//No I18N
    $("#telnet").hide();//No I18N
    $("#virtual").hide();//No I18N
    $("#ucs").hide();//No I18N
    $("#restapi").hide();//No I18N
    $("#ciscoACI").hide();
    $("#gcp").hide();//No I18N
    $("#restapiFrmk").hide();
    $("#storagesnmp1").hide();//No I18N
    $("#storagesnmp3").hide();//No I18N
    $("#CLI").hide();
    $("#SMI").hide();
    $("#HPEVA SSSU").hide();
    $("#LSI SSCS").hide();
    $("#NetAppAPI").hide();
    $("#StorageAPI").hide();
    $("#telemetry").hide();
    $("#nutanixdescriptionCol").hide();
        $("#nutanixprotocolDiv").hide();

            $("#vmPortDiv").show();
            $("#vmautodiscovery").show();
    if(credentialType === "videvice" || credentialType === "citrixdev" || credentialType === "nutanixdev"){//No I18n
        if(credentialType === "nutanixdev")
        {
            $("#vmautodiscovery").hide();
            $("#nutanixdescriptionCol").show();
            $("#nutanixprotocolDiv").show();
            $("#vmPortDiv").hide();

        }
        $("#virtual").show();
        if(OPMClient.InventoryDeviceDetailsController.showUnknownCredentialPage){
             $("#credentialContent #virtual").show();//No I18N
        }
    }
    else if(credentialType === "CLI" || credentialType === "SMI" || credentialType === "NetAppAPI" || credentialType === "StorageAPI" || credentialType === "StorageToken" || credentialType === "storagesnmp1" || credentialType === "storagesnmp3"){
        $("#monitorDiv").hide();
        $("#nCredDiv").hide();  
        $("#storageDiv").show();
        $("#"+credentialType).show();       
    }
    else{
        $("#storageDiv").hide();
        $("#"+credentialType).show();
        if(OPMClient.InventoryDeviceDetailsController.showUnknownCredentialPage){
             $("#credentialContent #"+credentialType).show();//No I18N
        }
    }
    if(credentialType === "telemetry"){
        var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+ '/admin/ismTLSExternalCAAvailable'); //No I18n
        OPMClient.CredentialsAddEditController.set('telemetryExtCaExists', response.isExternalCAAvailable? true : false);//No I18n
    }
    if(self !== undefined && self.get('isVirtualDiscovery')){
        OPMClient.SettingsTabController.set('slideHeader',header+' ('+credDisplayNames[credentialType]+')');//No I18N
    }

}
function hideCredentialDiv()
{
    $("#credentialHeader span").html(Ember.I18n.t('webclient.discovery.addcredential',this));
    $(".addCredentialBrickNav").show();
    $("#credentialCategoryDiv").hide();
    $(".credentials").hide();
    $("#telnetssh_info").hide();
    $("#snmpv3_info").hide();
    $("#gcp_info").hide();
    $('#addCredHeaderInfo').show();
    if(window.OPM.isOPM) {
        $('#credentialSection').addClass("credentialHeaderAlign"); //No I18n
    }
    OPMClient.SettingsTabController.set('slideHeader',Ember.I18n.t('webclient.discovery.addcredential'));//No I18n
}
function changeAuthProto()
{
    var authprotoVal = $('#authprotocol').val();
    if(authprotoVal !== "None")
    {
        $('#authpwd').attr("disabled",false);
        $('#password_authpwdRe').attr("disabled",false);
        $('#authpwdRe_eye').show();
        $('#authpwdRe').attr("disabled",false);
        $('#password_authpwd').attr("disabled",false);
        $('#privprotocol').attr("disabled",false);
        var encProtoVal = $('#privprotocol').val();
        if(encProtoVal === "None")
        {
            $('#privpwd').attr("disabled",true);
            $('#password_privpwdRe').attr("disabled",true);
            $('#password_privpwd').attr("disabled",true);
        }
        else
        {
            $('#privpwd').attr("disabled",false);
            $('#password_privpwdRe').attr("disabled",false);
            $('#password_privpwd').attr("disabled",false);
        }
    }
    else
    {
        $('#authprotocol').attr("value","None");
        $('#authpwd').attr("disabled",true);
         $('#password_authpwdRe').attr("disabled",true);
        $('#privprotocol').select2().val('None').trigger('change');//No I18N
        $('#privprotocol').attr("disabled",true);
        $('#privpwd').attr("disabled",true);
        $('#password_authpwd').attr("disabled",true);
        $('#authpwdRe_eye').hide();
        $('#authpwdRe').attr("disabled",true);
    }
}
function changeEncProto()
{
    var encProtoVal = $('#privprotocol').val();
    if(encProtoVal !== "None"){
        $('#privpwd').attr("disabled",false);
        $('#privpwdRe_eye').show();
        $('#privpwdRe').attr("disabled",false);
        $('#password_privpwdRe').attr("disabled",false);
        $('#password_privpwd').attr("disabled",false);
    }
    else{
        $('#privpwd').attr("disabled",true);
        $('#password_privpwdRe').attr("disabled",true);
        $('#password_privpwd').attr("disabled",true);
        $('#privpwdRe_eye').hide();
        $('#privpwdRe').attr("disabled",true);
    }
}

function showKey(isChecked)
{
    if(isChecked){
        $('#linPassword').hide();
        $('#linPasswordRe').hide();
        $('#linCredPrompt').hide();
        if(!OPMClient.SettingsTabController.isEdit){
            $('#sshKey').show();
        }
        else{
            if($('#fileInfo').attr('data-status')!==undefined && $('#fileInfo').attr('data-status')==='cleared'){
                $('#sshKey').show();
            }
            else{
                if($('#fileInfo #fileInput').text()!==undefined && $('#fileInfo #fileInput').text()!==null && $('#fileInfo #fileInput').text()!==""){
                    $('#fileInfo').show();
                }
                else{
                    $('#sshKey').show();
                }
            }
        }
    }
    else{
        if(!OPMClient.SettingsTabController.isEdit){
            $('#sshKey').hide();
        }
        else{
            if($('#fileInfo').attr('data-status')!==undefined && $('#fileInfo').attr('data-status')==='cleared'){
                $('#sshKey').hide();
            }
            else{
                if($('#fileInfo #fileInput').text()!==undefined && $('#fileInfo #fileInput').text()!==null && $('#fileInfo #fileInput').text()!==""){
                    $('#fileInfo').hide();
                }
                else{
                    $('#sshKey').hide();
                }
            }
        }
        $('#linPassword').show();
        $('#linPasswordRe').show();
        $('#linCredPrompt').show();
    }
}

function changeProtocol()
{
   var linPro = $('#linProtocol').val();
    if(linPro === 'ssh'){
        $('#linPort').attr('value','22');
        $('#sshkeyDisplay').show();
        if($('#linSSHKey').prop('checked')) {
            showKey(true);
        }
    }
    else if (linPro === 'telnet'){
        $('#linPort').attr('value','23');
        $('#sshkeyDisplay').hide();
        showKey(false);
    }
}

function setSSLDefaultPort() {
    var isEnabled = $('input[name="ssl"]:checked').val();
    if(isEnabled !== "enabled") {
        $('#restAPIPort').prop('value','80');
    } else {
        $('#restAPIPort').prop('value','443');
    }
}

function enableFieldLength(){
    var type = $('#fieldType').val();
    if(type === "Text"){
        $('#fieldLengthRow').show();
    }else{
        $('#fieldLengthRow').hide();
    }
}

function slideSuccessHandler(response,functionName,params,transitionURL,transitionParams,slideNumber)
{
    var addClasses = "";//No I18N
    var message = "";// No I18N
    var flag =false;
    if(response !== undefined && !$.isEmptyObject(response))
    {
        if(response.result !== undefined || response.message != undefined)
        {
            addClasses = "successMsg";//No I18N
            if(response.result !== undefined){
                message =response.result.message;
            }else{
                message = response.message;
            }
                        //window.history.back();
            if(params !== undefined && params !== "" && params !== null){
                window[functionName](params);
            }else if(functionName !== undefined && functionName !== "" && functionName !== null){
                window[functionName]();
            }
            if(transitionURL !== undefined && transitionURL !== null && transitionURL !== ""){
                if(transitionParams !== undefined && transitionParams !== null && transitionParams !== ""){
                    opm_transitionToParentRoute(transitionURL,transitionParams);
                }else{
               opm_transitionToParentRoute(transitionURL);
            }
            }
            if(slideNumber !== undefined){
                slideOut(slideNumber);
            }else{
        slideOut(1);
        if(params=="DeviceTemplate"){//No I18N
            opm_showInfoMsgAfterAssociate();
        }
        }
        }
        else if(response.error !== undefined)
        {
            addClasses = "errorMsg";//No I18N
            message = response.error.message;
            if(response.error.code == 8115 && OPMClient.ApplicationController.currentPath.indexOf("Settings.Agents.OPM") >=0)
            {
                var link = 'https://www.manageengine.com/network-monitoring/kb/agent-status-troubleshooting.html?utm_source=inproduct';//No I18N
                message = Ember.I18n.t(message,{storeLink: link});
                flag = true;
            }
        }
        if(flag == false && OPMClient.ApplicationController.currentPath.indexOf('Settings.Agents.OPM') !=-1)
        {   
            message = escapeHTML(message);
        }
        opm_infoMsgs(addClasses,message);
    }
}
function opm_transitionToTheRoute(route){
    if(OPMClient.SettingsTabController.monitorName !== "agents"){
     settingsGlobalRoute.transitionTo(route);
    }else if(OPMClient.SettingsAddEditController.fromAlarmsPage){
        alrmsGlobalRoute.transitionTo(route);
    }
    else{
        window.location.href = "/"+route; //No I18n
    }

}
function opm_constructVarbindXML(name)
{
    var criteriaLen = $('#'+name+'CriteriaDiv > div').length;
    /*if(criteriaLen === 1){
        return ""; //No I18N
    }*/
    var type = $('[name='+name+'Type]:checked').val(); // No I18N
    var version = $('#trapProcessorTab ul li.active').data('value'); // No I18N
    //var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";  // No I18N
    var xmlString = "";  // No I18N
    if(name === "match")
    {
        xmlString += "<MatchCriteria matchType=\""+type+"\" trapVersion=\""+version+"\">"; //No I18n
    }
    else
    {
        xmlString += "<RearmMatchCriteria matchType=\""+type+"\" trapVersion=\""+version+"\">"; //No I18n
    }
    
    if(criteriaLen === 1){
        var messageVal =  $("#"+name+"Criteria :input[type='text']").val();
        var conditionVal = $("#"+name+"Criteria").find('select')[1].value;
        var varbindVal = $("#"+name+"Criteria").find('select')[0].value;
        if(messageVal!==undefined && messageVal !== "") {
            xmlString += "<CRITERIA VarBindNo=\""+varbindVal+"\" MatchCondition=\""+conditionVal+"\" Message=\""+messageVal+"\"/>"; //No I18n
        } else {
            return "";
        }
    }
    else {
    $.each($('#'+name+'CriteriaDiv > div'),function(){
        var id = $(this).attr("id");
        if(id !== undefined){
           var messageVal =  $("#"+id+" :input[type='text']").val();
           var conditionVal = $("#"+id).find('select')[1].value;
           var varbindVal = $("#"+id).find('select')[0].value;
           //var conditionVal = $("#"+id+" select :last").val();
           //var varbindVal = $("#"+id+" select :first").val();
           xmlString += "<CRITERIA VarBindNo=\""+varbindVal+"\" MatchCondition=\""+conditionVal+"\" Message=\""+messageVal+"\"/>"; //No I18n
        } else {
            var messageVal =  $("#"+name+"Criteria :input[type='text']").val();
            var conditionVal = $("#"+name+"Criteria").find('select')[1].value;
            var varbindVal = $("#"+name+"Criteria").find('select')[0].value;
            if(messageVal!==undefined && messageVal !== "") {
                xmlString += "<CRITERIA VarBindNo=\""+varbindVal+"\" MatchCondition=\""+conditionVal+"\" Message=\""+messageVal+"\"/>"; //No I18n
            }
        }
    });
    }
    if(name === "match")
    {
        xmlString += "</MatchCriteria>"; //No I18n
    }
    else
    {
        xmlString += "</RearmMatchCriteria>"; //No I18n
    }
    return xmlString;
}
function opm_validateSNMPOID(oid)
{
    var emailRegex = /^([\.\<\*\0-9]+)*(\.|[\>\0-9]|\*)$/ ;  //No I18n
    var eachEmailId = oid.split(","); //No I18n
    for(i=0; i<eachEmailId.length; i++)
    {
        if(!(emailRegex.test(eachEmailId[i])))
        {
            return false;
        }
    }
    return true;
}
function opm_setThresholdDetails_script(jsonData)
{
    if(jsonData.warningThresholdValue !== undefined)
    {
        $("#warningThresholdValue").val(jsonData.warningThresholdValue);
    }
    if(jsonData.warningThresholdType !== undefined)
    {
        $("#warningThresholdType").val(jsonData.warningThresholdType);
        $("#troubleThresholdType").val(jsonData.warningThresholdType);
        $("#criticalThresholdType").val(jsonData.warningThresholdType);
    }
    if(jsonData.warningThresholdTextualType !== undefined)
    {
        $("#warningThresholdTextualType").val(jsonData.warningThresholdTextualType);
    }
    if(jsonData.warningThresholdTextValue !== undefined)
    {
        $("#warningThresholdValue").val(jsonData.warningThresholdTextValue);
    }
    if(jsonData.warningMessage !== undefined)
    {
        $("#warningMessage").val(jsonData.warningMessage);
    }
    if (jsonData.troubleThresholdValue !== undefined)
    {
        $("#troubleThresholdValue").val(jsonData.troubleThresholdValue);
    }
    if(jsonData.troubleThresholdType !== undefined)
    {
        $("#troubleThresholdType").val(jsonData.troubleThresholdType);
         $("#warningThresholdType").val(jsonData.troubleThresholdType);
        $("#criticalThresholdType").val(jsonData.troubleThresholdType);
    }
    if (jsonData.troubleThresholdTextualType !== undefined)
    {
        $("#troubleThresholdTextualType").val(jsonData.troubleThresholdTextualType);
    }
    if (jsonData.troubleThresholdTextValue !== undefined)
    {
        $("#troubleThresholdValue").val(jsonData.troubleThresholdTextValue);
    }
    if(jsonData.troubleMessage !== undefined)
    {
        $("#troubleMessage").val(jsonData.troubleMessage);
    }
    if(jsonData.criticalThresholdValue !== undefined)
    {
        $("#criticalThresholdValue").val(jsonData.criticalThresholdValue);
    }
    if(jsonData.criticalThresholdType !== undefined)
    {
        $("#criticalThresholdType").val(jsonData.criticalThresholdType);
         $("#troubleThresholdType").val(jsonData.criticalThresholdType);
         $("#warningThresholdType").val(jsonData.criticalThresholdType);
    }
    if(jsonData.criticalThresholdTextualType !== undefined)
    {
        $("#criticalThresholdTextualType").val(jsonData.criticalThresholdTextualType);
    }
    if(jsonData.criticalThresholdTextValue !== undefined)
    {
        $("#criticalThresholdValue").val(jsonData.criticalThresholdTextValue);
    }
    if(jsonData.criticalMessage !== undefined)
    {
        $("#criticalMessage").val(jsonData.criticalMessage);
    }
    if(jsonData.rearmTextualType !== undefined)
    {
        $("#clearThresholdTextualType").val(jsonData.rearmTextualType);
    }
    if(jsonData.rearmTextValue !== undefined)
    {
        $("#rearmValue").val(jsonData.rearmTextValue);
    }

    if((jsonData.warningThresholdType !== undefined && jsonData.warningThresholdType === "notEqual") || (jsonData.troubleThresholdType !== undefined && jsonData.troubleThresholdType === "notEqual") || (jsonData.criticalThresholdType !== undefined && jsonData.criticalThresholdType === "notEqual"))
    {
        $("#clearThresholdType").val("equal");//No I18N
        $('input[name="rearmValue"]').prop('disabled',true);//No I18N
        $("#rearmValue").val("");//No I18N
    }
    else if(jsonData.rearmValue !== undefined)
    {
        $("#rearmValue").val(jsonData.rearmValue);
    }

    if(jsonData.dataType != undefined && jsonData.dataType != 2)
    {
        $('.perf_NonNumeric').hide();
        $('.perf_numeric').show();
        var thresholdType = $("#criticalThresholdType").val();
        switch(thresholdType)
        {
            case "min" : //No I18N
                $("#clearThresholdType").val("maxEqual");//No I18N
                break;
            case "minEqual" : //No I18N
                $("#clearThresholdType").val("max");//No I18N
                break;
            case "max" : //No I18N
                $("#clearThresholdType").val("minEqual");//No I18N
                break;
            case "maxEqual" : //No I18N
                $("#clearThresholdType").val("min");//No I18N
                break;
            case "equal" : //No I18N
                $("#clearThresholdType").val("equal");//No I18N
                break;
        }
    }
    
    if(jsonData.clrMessage)
    {
        $("#clrMessage").val(jsonData.clrMessage);
    }
    if(jsonData.clearThresholdType)
    {
        $("#clearThresholdType").val(jsonData.clearThresholdType);
    }
    if(jsonData.failureThreshold)
    {
        $("#failureThreshold").val(jsonData.failureThreshold);
    }
}

function opm_setHeader(pageName){
    $(".validateField").removeClass("error");
    OPMClient.SettingsTabController.set('subHeader',Ember.I18n.t('webclient.topo.addnode.ipaddress',this));//No I18N
    if(pageName == "AddHyperV")
    {
         OPMClient.SettingsTabController.set('subHeader',Ember.I18n.t('webclient.topo.addnode.hyperV.ipaddress',this));//No I18N
    }
    if(pageName == "AddUCS")
    {
         OPMClient.SettingsTabController.set('subHeader',Ember.I18n.t('webclient.topo.addnode.UCS.ipaddress',this));//No I18N
    }
    OPMClient.SettingsAddEditController.set('selectedCredential',"snmp1"); //No I18N
    OPMClient.SettingsAddEditController.set('isUCS',false); //No I18N
    OPMClient.CredentialsAddEditController.set("parentRoute","Settings.Discovery.AddDevice");//No I18N   
    OPMClient.CredentialsAddEditController.set("dynamicParam",pageName);//No I18N
    $("#ipAddress").val("");//No I18N
    $("#netmask").val("255.255.255.0");//No I18N
    if(errorDiv !== ""){
        $("#"+errorDiv).remove();
    }
   
    if(pageName === "AddDevice" || pageName === "AddNewDevice"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["WithOutVMWare"]);//No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.topo.addnode.header',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.add.credentials',this));//No I18N
        opm_getCredentialList(["WithOutVMWare"],undefined,undefined,undefined,'addDevice'); //No I18N
         $("#AddToNCMOputils").show();
         $('.addDeviceForm').addClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddvxRail")
    {
 	OPMClient.SettingsAddDeviceController.set('credToDisplay',["vmware","WithOutVMWare"]); //No I18N
 	OPMClient.SettingsAddEditController.set('selectedCredential',"videvice"); //No I18N        
	OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.topo.addnode.header',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.add.credentials',this));//No I18N
        opm_getCredentialList(["WithOutVMWare"]); //No I18N
	 $("#AddToNCMOputils").hide();    
}
    else if(pageName === "AddProxmox")
        {
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["restapi-frmwk"]); //No I18N
        OPMClient.SettingsAddEditController.set('selectedCredential',"videvice"); //No I18N        
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.topo.addnode.header',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.add.credentials',this));//No I18N
        opm_getCredentialList(["restapi-frmwk"]); //No I18N
        $("#AddToNCMOputils").hide();    
    }
    else if(pageName === "AddVMware"){
        //errorDiv = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.viserver.discovery.restriction',this));//No I18N
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["vmware","WithOutVMWare"]); //No I18N
        OPMClient.SettingsAddEditController.set('selectedCredential',"videvice"); //No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.settings.addvmware',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.settings.addvmwarecredential',this));//No I18N
        OPMClient.SettingsTabController.set('subHeader',Ember.I18n.t('webclient.inventory.nfa.ipdns',this));//No I18N
        opm_getCredentialList(["WithOutVMWare"]); //No I18N
        $("#AddToNCMOputils").hide();
    }
    else if(pageName === "AddHyperV"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["WithOutVMWare"]); //No I18N
        OPMClient.SettingsAddEditController.set('selectedCredential',"windows"); //No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.vmware.discoverhyperv',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.settings.addhypervcredential',this));//No I18N
        opm_getCredentialList(["WithOutVMWare"]); //No I18N
        $("#AddToNCMOputils").hide();
        $('.addDeviceForm').removeClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddXen"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["citrix","WithOutVMWare"]); //No I18N
        OPMClient.SettingsAddEditController.set('selectedCredential',"citrixdev"); //No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.vmware.addxenserver',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.devices.add',this)+" "+Ember.I18n.t('webclient.admin.credential.citrixcredential',this)+" "+Ember.I18n.t('webclient.admin.processtemplate.credential',this));//No I18N
        OPMClient.SettingsTabController.set('subHeader',Ember.I18n.t('webclient.xen.master.deviceip',this));//No I18N
        opm_getCredentialList(["citrix","WithOutVMWare"]); //No I18N
        $("#AddToNCMOputils").hide();
        $('.addDeviceForm').removeClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddUCS"){
        OPMClient.SettingsAddEditController.set('isUCS',true); //No I18N
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["UCS"]); //No I18N
        OPMClient.SettingsAddEditController.set('selectedCredential',"ucs"); //No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.devices.ucs.addUCS',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.settings.adducscredential',this));//No I18N
        opm_getCredentialList(["UCS"]); //No I18N
        $("#AddToNCMOputils").hide();
        $('.addDeviceForm').removeClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddStorage"){
        OPMClient.SettingsAddStorageController.set('isStorage',true); //No I18N
        OPMClient.SettingsAddStorageController.set('credToDisplay',[]); //No I18N
        OPMClient.SettingsAddStorageController.set('selectedCredential',"CLI"); //No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.devices.opstor.add.storage',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.settings.addstoragecredential',this));//No I18N
        //opstor_getCredentialList(); //No I18N
    $("#AddToNCMOputils").hide();
    }
    else if(pageName === "AddWireless"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["snmp"]);//No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.settings.addwireless',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.addcredential',this));//No I18N
        opm_getCredentialList(["snmpv3", "restapi-frmwk"]);//No I18n
         $("#AddToNCMOputils").show();
         $('.addDeviceForm').addClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddNGFW"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["snmp"]);//No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.settings.addNGFW',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.addcredential',this));//No I18N
        opm_getCredentialList(["snmpv3", "restapi-frmwk"]);//No I18n
         $('.addDeviceForm').addClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddCiscoACI"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["CiscoACI"]);//No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.add.ciscoaci',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.addcredential',this));//No I18N
        opm_getCredentialList(["CiscoACI"]);
        //opm_getCredentialList(["CiscoACI_SNMP"]);
        //opm_getCredentialList(["CiscoACI_WMI"]);
       $('.addDeviceForm').addClass('addDeviceTop'); //No I18n
    } else if(pageName === "AddSD-WAN"){//No I18n
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["SD-wAN"]);//No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.add.ciscoaci',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.addcredential',this));//No I18N
        opm_getCredentialList(["SD-WAN"]);//No I18n
     //   opm_getCredentialList(["CiscoACI_SNMP"]);//No I18n
        //opm_getCredentialList(["CiscoACI_WMI"]);
       $('.addDeviceForm').addClass('addDeviceTop'); //No I18n
    }
    else if(pageName === "AddDeviceByType"){
        OPMClient.SettingsAddDeviceController.set('credToDisplay',["WithOutVMWare"]);//No I18N
        OPMClient.SettingsTabController.set('header',Ember.I18n.t('webclient.settings.adddevicebytype',this)); //No I18N
        OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.addcredential',this));//No I18N
        opm_getCredentialList(["WithOutVMWare"]);
       $('.addDeviceForm').addClass('addDeviceTop'); //No I18n
    }
}


function showCredentialCategory(){
    var credCategory = $('input:radio[name=credentialSelectMenu]:checked').val();//No I18N

    if(credCategory === 'monitor'){//No I18N
        $('#monitorDiv').show();
        $('#nCredDiv').hide();
        $('#storageDiv').hide();
    }else if(credCategory === 'nCred'){//No I18N
        $('#nCredDiv').show();
        $('#monitorDiv').hide();
        $('#storageDiv').hide();
    }
    else if(credCategory === 'storage'){//No I18N
        $('#storageDiv').show();
        /*var credentialType = $('#storageCredentialType').val();
        if(credentialType === 'snmp1' || credentialType === 'snmp3') {
            credentialType = "stoarge"+credentialType;
        }
        //showCredentialDiv(credentialType);*/
        $('#nCredDiv').hide();
        $('#monitorDiv').hide();
    }
}

function toggleToolsDiv(){
    var connectionType = $("input[name=toolConType]:checked").val();//No I18N
    if(connectionType === "monitor"){//No I18N
        $('#DBConnectionTable').show();
        $('#RestAPITable').hide();
    }else if(connectionType === "nCred"){//No I18N
         $('#DBConnectionTable').hide();
        $('#RestAPITable').show();
    }
}

function doEnableDisableAction(className,action,id)
{
    if(action !== undefined && action !== ""){
       action = action;
    }else{
        action = $('#'+id).prop('checked') === true?false:true;
    }

    $("."+className+" input").prop('disabled',action);//No I18N
    $("."+className+" select").prop('disabled',action);//No I18N    
    action === true? $("."+className).css("opacity","0.6"):$("."+className).css("opacity","1"); //No I18n

    /*To Check Threshold condition is enable or disabled*/
    if(action === false)
    {
        Intf_doEnableDisableAction('utilThrs','','enableUtilThres'); //No I18n
        Intf_doEnableDisableAction('errThrs','','enableErrThres'); //No I18n
        Intf_doEnableDisableAction('discThrs','','enableDiscThres'); //No I18n
        Intf_doEnableDisableAction('pwrConsumpThrs','','enablepwrConsumpThres'); //No I18n
    }    

    /*To Check status poll field is enabled or disabled*/     
    var isStatusPollEnabled = $("input[name=statusPoll]:checked").val(); //No I18n
    if(isStatusPollEnabled === "false")
    {
        $("#pollThresh").prop("disabled",true); //No I18n
    }
}

function Intf_doEnableDisableAction(className,action,id,tab)
{   
    if(action !== undefined && action !== ""){
       action = action;
    }else{
        action = $('#'+id).prop('checked') === true?false:true;
    }
    $("."+className+" input").prop('disabled',action);//No I18N
    $("."+className+" select").prop('disabled',action);//No I18N

    action === true? $("."+className).css("opacity","0.6"):$("."+className).css("opacity","1"); //No I18n
    if(tab !== undefined )
    {
        action === true? $(".IntfThresholdSettingsTab .editThresholdTab #"+tab+" ").removeClass('active'):$(".IntfThresholdSettingsTab .editThresholdTab #"+tab+" ").addClass('active');//No I18N
    }
    $("#utilThresholdType_Rearm").prop('disabled',true); //No I18n
    $("#errorThresholdType_Rearm").prop('disabled',true); //No I18n
    $("#DiscardThresholdType_Rearm").prop('disabled',true); //No I18n  
}

function loadDropDownValue(array,keyName,keyValue,id){
    $('#'+id).html("");
    $.each(array, function(key,val){
       $('#'+id).append("<option value='"+val.keyValue+"'>"+val.keyName+"</option>");
    });
}


/** User Page Functions ***/
function showOrHideDivwithClassName(showC,hideC){

    $("."+showC).show();//No I18N
    $("."+hideC).hide();//No I18N
}

function multiselectMoveOptions(frmClass,toClass){
    $('.'+frmClass+' option:selected').remove().appendTo('.'+toClass);
    $('.'+frmClass).val(null);
    $('.'+toClass).val(null);
}
function opm_getMultiSelectValue(dropDownId,displayNameOrValue,returnArrayString){
    var options = $('#'+dropDownId+' option');
    var selValues = [];
    if(options.length >0 && options !== undefined)
    {
        if(displayNameOrValue === "" || displayNameOrValue === "value")
        {
            $.each(options,function(k,v){
                selValues.push(v.value);
            });

        }else{
            
            $.each(options,function(k,v){
                selValues.push(v.text);
            });
        }
        if(returnArrayString) {
            return JSON.stringify(selValues);
        }
        return selValues.toString();
    }else{
        return "";
    }
}
function opm_validateNumberVal(paramVal)
{
    if (paramVal !== "")
    {
        var objRegExp  = /^[0-9]+$/; //No I18N
        return objRegExp.test(paramVal); 
    }
    else
    {
        return false;
    }
}
/*function opm_validateEmail(paramVal)
{
    if (paramVal != "")
    {
        var objRegExp  = /^[a-z0-9]([a-z0-9_\-\.]*)@([a-z0-9_\-\.]*)(\.[a-z]{2,4}(\.[a-z]{2}){0,2})$/i; //No I18N
        return objRegExp.test(paramVal);    
    }
    else
    {
        return false;
    }
}*/
function NCMConfigletShowAlert(text)
{
     $("#configletContent").addClass('validateField error');//No I18N
     $("#configletContent").attr('data-error',text);//No I18N
}
function checkNumber(str)
{
    str=parseInt(str);
    if(str.toString()==="NaN"){//No I18N
        return false;
    }
    else if(str!==undefined) {
    for(i=0;i<str.length;i++)
        {
            ch = str.charAt(i);
            if(isNaN(ch))
            {
             return false;
            }
            
        }
    }
return true;        
}

function descriptionMultiByte(str) {
    var regexp =  /^[^<>%$#&~`?+\/"*\[\]\{\}\\|\^]+$/;
    return regexp.test(str);
}

function opm_validateFields(invalidEnteries){
    var count = 0;
    var firstElement = "";//No I18N
    $(".validateField").removeClass("error");//No I18N
    if(invalidEnteries !== undefined && !$.isEmptyObject(invalidEnteries)){//No I18N
        if(invalidEnteries.empty !== undefined && invalidEnteries.empty.length > 0)//No I18N 
        {
            $.each(invalidEnteries.empty,function(key,val){
                var emptyAlert = "webclient.this.field.cannotempty";//No I18N
                if(val === "triggerInterval"){
                    emptyAlert = 'webclient.trigger.interval.cannotempty'; //No I18N
                }
                var validatingField = trim($("#"+val).val());//No I18N
                if($("#"+val).attr("multiple")!==undefined && $("#"+val+" option").length==0){
                    validatingField = undefined;
                }
              else if($("#"+val).attr("multiple")!==undefined && $("#"+val+" option").length>0)
              {
                 validatingField=$("#"+val+" option").attr('value');
                }
                if(validatingField === undefined || validatingField === "" || validatingField === null ){//No I18N
                    if(count === 0){ firstElement = "#"+val; }//No I18N
                    $("#"+val).addClass('validateField error');//No I18N
                    $("#"+val).attr('data-error',Ember.I18n.t(emptyAlert,this));//No I18N
                    count++;
                }
            });
          
        }
        
        if(count === 0){
            if(invalidEnteries.nonZero !== undefined && invalidEnteries.nonZero.length > 0){//No I18N
                $.each(invalidEnteries.nonZero,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(validatingField==0){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.port !== undefined && invalidEnteries.port.length > 0){//No I18N
                $.each(invalidEnteries.port,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidPort(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.invalidport',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.oputilsCFMDropdown !== undefined && invalidEnteries.oputilsCFMDropdown.length > 0){
                $.each(invalidEnteries.oputilsCFMDropdown,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!oputils_cfmDropdown(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t("webclient.this.field.cannotempty",this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.dropdown !== undefined && invalidEnteries.dropdown.length > 0){
                $.each(invalidEnteries.dropdown,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_validDropdownValue(validatingField))
                    {
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t("webclient.ziabot.drpdwn.selectvalue",this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.multidropdown !== undefined && invalidEnteries.multidropdown.length > 0){
                $.each(invalidEnteries.multidropdown,function(key,val){
                    var validatingField = trim($("#"+val).val().toString());//No I18N
                    if(!opm_validDropdownValue(validatingField))
                    {
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t("webclient.ziabot.drpdwn.selectvalue",this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.displayName !== undefined && invalidEnteries.displayName.length > 0){
                $.each(invalidEnteries.displayName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidDisplayName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.settings.displayName.info',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.customColumnName !== undefined && invalidEnteries.customColumnName.length > 0){
                $.each(invalidEnteries.customColumnName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidCustomColumnName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.settings.customColumnName.info',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.textBasicSymbols !== undefined && invalidEnteries.textBasicSymbols.length > 0){
                $.each(invalidEnteries.textBasicSymbols,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidRoleDesc(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.roleDesc.field.error',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.hostName !== undefined && invalidEnteries.hostName.length > 0){
                $.each(invalidEnteries.hostName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidValidHostName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr("data-error", Ember.I18n.t("nfa.flowExport.invalid.iporhost")); //NO I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.hostNameNoIP !== undefined && invalidEnteries.hostNameNoIP.length > 0){
                $.each(invalidEnteries.hostNameNoIP,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidHostNameNotIP(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr("data-error", Ember.I18n.t("webclient.ncm.terminal.change.validHostName")); //NO I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.subnetAddr !== undefined && invalidEnteries.subnetAddr.length > 0){
                $.each(invalidEnteries.subnetAddr,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidValidSubnet(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        // $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.invalidport',this));//No I18N
                        $("#"+val).attr('data-error','Invalid network address');//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.portRange !== undefined && invalidEnteries.portRange.length > 0){//No I18N
                $.each(invalidEnteries.portRange,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidPortRange(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.invalidport',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipv6MaskValidation !== undefined && invalidEnteries.ipv6MaskValidation.length > 0){//No I18N
                $.each(invalidEnteries.ipv6MaskValidation,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidIpv6Mask(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error','Invalid subnet mask');//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ValidateMultipleIP !== undefined && invalidEnteries.ValidateMultipleIP.length > 0){
                $.each(invalidEnteries.ValidateMultipleIP,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_MultipleIPValidation(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.iprange.valid',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.timeout !== undefined && invalidEnteries.timeout.length > 0){//No I18N
                $.each(invalidEnteries.timeout,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidTimeout(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.timeout.range',{param0: 1, param1: 300}));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipV4 !== undefined && invalidEnteries.ipV4.length > 0){//No I18N
                $.each(invalidEnteries.ipV4,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isIpV4Address(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.invalidip',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipCheck !== undefined && invalidEnteries.ipCheck.length > 0){//No I18N
                $.each(invalidEnteries.ipCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isIPAddressValid(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.invalidip',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipv4Validation !== undefined && invalidEnteries.ipv4Validation.length > 0){
                $.each(invalidEnteries.ipv4Validation,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_isIpV4Address(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.nfa.invalidip'));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.macCheck !== undefined && invalidEnteries.macCheck.length > 0){//No I18N
                $.each(invalidEnteries.macCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isValidMACAddress(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('opu.common.ENTER_VALID_MAC',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.dscpCheck !== undefined && invalidEnteries.dscpCheck.length > 0){//No I18N
                $.each(invalidEnteries.dscpCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isValidDSCPcode(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.nfasettings.dscpcode',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.retries !== undefined && invalidEnteries.retries.length > 0){//No I18N
                $.each(invalidEnteries.retries,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_checkIfValidRetries(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.addnode.error.retries.range',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.emailValidation !== undefined && invalidEnteries.emailValidation.length > 0){//No I18N
                $.each(invalidEnteries.emailValidation,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((validatingField !==  undefined && validatingField !== "") && !opm_validateMultipleEmail(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.mailserver.invalidemailid',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.emailWithSplcharOrDefault !== undefined && invalidEnteries.emailWithSplcharOrDefault.length > 0){
                $.each(invalidEnteries.emailWithSplcharOrDefault,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((validatingField !==  undefined && validatingField !== "") && !opm_validateEmailWithAllSplCharOrDefault(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.common.invalidData',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.emailWithSplchar !== undefined && invalidEnteries.emailWithSplchar.length > 0){//No I18N
                $.each(invalidEnteries.emailWithSplchar,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((validatingField !==  undefined && validatingField !== "") && !opm_validateEmailWithAllSplChar(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.mailserver.invalidemailid',this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.mulitpleEmailWithSplchar !== undefined && invalidEnteries.mulitpleEmailWithSplchar.length > 0) {//No I18N
                $.each(invalidEnteries.mulitpleEmailWithSplchar, function (key, val) {
                    var validatingField = trim($("#" + val));
                    if ((validatingField !== undefined && validatingField !== "") && !opm_validateMultipleEmailWithSplChar(validatingField)) {//No I18N
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.admin.mailserver.invalidemailid', this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.validateEmailWithSpecialChar !== undefined && invalidEnteries.validateEmailWithSpecialChar.length > 0) {//No I18N
                $.each(invalidEnteries.validateEmailWithSpecialChar, function (key, val) {
                    var validatingField = trim($("#" + val).val());
                    if ((validatingField !== undefined && validatingField !== "") && !opm_validateMultipleEmailWithSplChar($("#" + val))) {//No I18N
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.admin.mailserver.invalidemailid', this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.loginValidation !== undefined && !$.isEmptyObject(invalidEnteries.loginValidation)){//No I18N
                $.each(invalidEnteries.loginValidation,function(key,val){
                    var username = trim($("#"+key).val());//No I18N
                    var password = trim($("#"+val).val());//No I18N
                    if((password !== undefined && password !== "") && (username === undefined || username === "")){//No I18N
                        if(count === 0){ firstElement = "#"+key; }//No I18N
                        $("#"+key).addClass('validateField error'); //No I18N
                        $("#"+key).attr('data-error',Ember.I18n.t('webclient.admin.mailserver.blankusername',this)); //No I18N
                        count++;
                    }
                    if((username !== undefined && username !== "") && (password === undefined || password === "")){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error'); //No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.mailserver.blankpassword',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.fromToTime !== undefined && !$.isEmptyObject(invalidEnteries.fromToTime)){//No I18N
                $.each(invalidEnteries.fromToTime,function(key,val){
                    var fromTime = trim($("#"+key).val());//No I18N
                    var toTime = trim($("#"+val).val());//No I18N
                    if(fromTime > toTime){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error'); //No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.reports.rightlist.selecterr',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.hourlyCheck !== undefined && invalidEnteries.hourlyCheck.length > 0){
                $.each(invalidEnteries.hourlyCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(validatingField > 90){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.dbManage.hstats',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.dailyCheck !== undefined && invalidEnteries.dailyCheck.length > 0){
                $.each(invalidEnteries.dailyCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(validatingField > 3650){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.dbManage.dailystats',this));//No I18N
                        count++;
                    }
                });
            }
             if(invalidEnteries.positive !== undefined && invalidEnteries.positive.length > 0){
                $.each(invalidEnteries.positive,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_IsNumeric(validatingField) || validatingField <= 0){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.enter',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.positiveorempty !== undefined && invalidEnteries.positiveorempty.length > 0){
                $.each(invalidEnteries.positiveorempty,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((!opm_IsNumeric(validatingField) || validatingField <= 0 )&& validatingField !='' ){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.enter',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.validIntegerorDecimal !== undefined && invalidEnteries.validIntegerorDecimal.length > 0){
                $.each(invalidEnteries.validIntegerorDecimal,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_validateNumberAndDecimal(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opm.perfgrp.rearm.value.validationtxt',this));//No I18N
                        count++;
                    }
                });
            }
			if(invalidEnteries.validIntegerValue !== undefined && invalidEnteries.validIntegerValue.length > 0){
                $.each(invalidEnteries.validIntegerValue,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isValidPriorityInt(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opm.perfgrp.rearm.value.validationtxt',this));//No I18N
                        count++;
                    }
                });
            }
			if(invalidEnteries.validZoneName !== undefined && invalidEnteries.validZoneName.length > 0){
                $.each(invalidEnteries.validZoneName,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_NoSpecialSymbols(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('opu.ipam.zoneName.err.msg',this));//No I18N
                        count++;
                    }
                });
            }
			if(invalidEnteries.ipV4CheckWithCIDR !== undefined && invalidEnteries.ipV4CheckWithCIDR.length > 0){
                $.each(invalidEnteries.ipV4CheckWithCIDR,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!validateZoneNetworkID(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.invalidip',this));//No I18N
                        count++;
                    }
                });
            }
			if(invalidEnteries.validFqdnIP !== undefined && invalidEnteries.validFqdnIP.length > 0){
                $.each(invalidEnteries.validFqdnIP,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_NoSpecialSymbols(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('opu.ipam.fqdn.err.msg',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.validNameServer !== undefined && invalidEnteries.validNameServer.length > 0){
                $.each(invalidEnteries.validNameServer,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isValidNameServer(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('opu.ipam.nameServer.err.msg',this));//No I18N
                        count++;
                    }
                });
            }
			if(invalidEnteries.validIpV4RvZoneName !== undefined && invalidEnteries.validIpV4RvZoneName.length > 0){
                $.each(invalidEnteries.validIpV4RvZoneName,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isValidReverseZone(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',"Enter a valid reverse zone name");//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.validInteger !== undefined && invalidEnteries.validInteger.length > 0){
                $.each(invalidEnteries.validInteger,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_isSignedInteger(validatingField) || validatingField===""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opm.perfgrp.rearm.value.validationtxt',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.nonnegativeorempty !== undefined && invalidEnteries.nonnegativeorempty.length > 0){
                $.each(invalidEnteries.nonnegativeorempty,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((!opm_IsNumeric(validatingField) || validatingField < 0 )&& validatingField !='' ){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.enternonnegative',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.nonnegative !== undefined && invalidEnteries.nonnegative.length > 0){
                $.each(invalidEnteries.nonnegative,function(key,val){
                var validatingField = trim($("#"+val).val());
                if((!opm_IsNumeric(validatingField) || validatingField < 0 )){
                    if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.enternonnegative',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.signedIntegerValueOrEmpty !== undefined && invalidEnteries.signedIntegerValueOrEmpty.length > 0){
                $.each(invalidEnteries.signedIntegerValueOrEmpty,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((!opm_isSignedInteger(validatingField) )&& validatingField !='' ){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.StatusPoll.Pleaseenterintegervalue',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.unSignedFloatOrEmpty !== undefined && invalidEnteries.unSignedFloatOrEmpty.length > 0){
                $.each(invalidEnteries.unSignedFloatOrEmpty,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((!opm_validateUnsignedFloat(validatingField) || validatingField <= 0)&& validatingField !='') {//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.validfloatvalue',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.nonnegativeFloatOrEmpty !== undefined && invalidEnteries.nonnegativeFloatOrEmpty.length > 0){
                $.each(invalidEnteries.nonnegativeFloatOrEmpty,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((!opm_validateUnsignedFloat(validatingField) || validatingField < 0)&& validatingField !='') {//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.validfloatvalue',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.signedFloatOrEmpty !== undefined && invalidEnteries.signedFloatOrEmpty.length > 0){
                $.each(invalidEnteries.signedFloatOrEmpty,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if((!opm_validateSignedFloat(validatingField))&& validatingField !='') {//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.message.validFloat',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.integer !== undefined && invalidEnteries.integer.length > 0){
                $.each(invalidEnteries.integer,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_validateSignedFloat(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.common.search.validation.integer',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.positiveIntegerWithoutFloat !== undefined && invalidEnteries.positiveIntegerWithoutFloat.length > 0){
                $.each(invalidEnteries.positiveIntegerWithoutFloat,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_validateNumberVal(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.enter',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.dateCheck !== undefined && invalidEnteries.dateCheck.length > 0){
                $.each(invalidEnteries.dateCheck,function(key,val){
                    var validatingField = trim($("#"+val).val()); //No I18N
                    var checkDate = new Date(validatingField);
                    if ( Object.prototype.toString.call(checkDate) === "[object Date]" ) { //No I18N
                      if ( isNaN( checkDate.getTime() ) ) {  //No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.common.validation.invaliddate',this));//No I18N
                        count++;
                      }
                    }
                    else {
                      if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.common.validation.notadate',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.unSignedFloat !== undefined && invalidEnteries.unSignedFloat.length > 0){
                $.each(invalidEnteries.unSignedFloat,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_validateUnsignedFloat(validatingField) || validatingField <= 0){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.profiledetails.validfloatvalue',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.fileCheck !== undefined && invalidEnteries.fileCheck.length > 0){
                $.each(invalidEnteries.fileCheck,function(key,val){
                    if($("#"+val)[0].files[0] === undefined){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.general.fileselecterror',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.alphaNumeric !== undefined && invalidEnteries.alphaNumeric.length > 0){
                $.each(invalidEnteries.alphaNumeric,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isAlphaNumeric(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.alphaNumericProfileName !== undefined && invalidEnteries.alphaNumericProfileName.length > 0){
                $.each(invalidEnteries.alphaNumericProfileName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!ncm_isAlphanumeric_basic(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opm.testCredential.fieldError',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.alphaNumericWithBasic !== undefined && invalidEnteries.alphaNumericWithBasic.length > 0){
                $.each(invalidEnteries.alphaNumericWithBasic,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!ncm_isAlphanumeric_basic(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.alphaNumericWithBasicSpecialChars !== undefined && invalidEnteries.alphaNumericWithBasicSpecialChars.length > 0){
                $.each(invalidEnteries.alphaNumericWithBasicSpecialChars,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!alphanumeric_basic_SpecialChars(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opm.advancedreport.specchar',{param0:'()-_.!:@\\s$'},this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.isValidName !== undefined && invalidEnteries.isValidName.length > 0){
                $.each(invalidEnteries.isValidName,function(key,val){
                    var validatingField = trim($("#"+val.fieldName).val());//No I18N
                    if(!opm_isValidName(validatingField, val.notAllowed)){
                        if(count === 0){ firstElement = "#"+val.fieldName; }//No I18N
                        $("#"+val.fieldName).addClass('validateField error');//No I18N
                        $("#"+val.fieldName).attr('data-error',Ember.I18n.t('webclient.opm.advancedreport.specchar',{param0: val.notAllowed},this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.alphaNumericWithSpace !== undefined && invalidEnteries.alphaNumericWithSpace.length > 0){
                $.each(invalidEnteries.alphaNumericWithSpace,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isAlphaNumericWithSpace(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.opu_customFieldValidation !== undefined && invalidEnteries.opu_customFieldValidation.length > 0){
                $.each(invalidEnteries.opu_customFieldValidation,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opu_customFieldValidation(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.dcName !== undefined && invalidEnteries.dcName.length > 0){
                $.each(invalidEnteries.dcName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_dcNameValidation(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.dcName !== undefined && invalidEnteries.dcName.length > 0){
                $.each(invalidEnteries.dcName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_dcNameValidation(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.profName !== undefined && invalidEnteries.profName.length > 0){
                $.each(invalidEnteries.profName,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidProfName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.userName !== undefined && invalidEnteries.userName.length > 0) {
                $.each(invalidEnteries.userName, function (key, val) {
                    var validatingField = trim($("#" + val).val());//No I18N
                    if (!opm_validateUsername(validatingField)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.settings.username.info', this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.domainNameWithComma !== undefined && invalidEnteries.domainNameWithComma.length > 0) {
                $.each(invalidEnteries.domainNameWithComma, function (key, val) {
                    var validatingField = trim($("#" + val).val());//No I18N
                    if (!opm_validateDomainNameWithComma(validatingField)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.admin.customDeviceTemplate.additionalPropError', {param0: '.-,'}, this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.domainName !== undefined && invalidEnteries.domainName.length > 0) {
                $.each(invalidEnteries.domainName, function (key, val) {
                    var validatingField = trim($("#" + val).val());//No I18N
                    if (!opm_validateDomainName(validatingField)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.admin.customDeviceTemplate.additionalPropError', {param0: '.-'}, this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.nfaNameCheck !== undefined && invalidEnteries.nfaNameCheck.length > 0){
                $.each(invalidEnteries.nfaNameCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!nfa_isValidGroupName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.appNameCheck !== undefined && invalidEnteries.appNameCheck.length > 0){
                $.each(invalidEnteries.appNameCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_isValidAppName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.invalid.appName',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ssh !== undefined && invalidEnteries.ssh.length > 0){
                $.each(invalidEnteries.ssh,function(key,val){
                    if($("#"+val)[0].files[0] === undefined || $("#"+val)[0].files[0].type!=="text/plain"){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.general.fileselecterror',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.snmpGraphRangeCheck !== undefined && invalidEnteries.snmpGraphRangeCheck.length > 0){
                $.each(invalidEnteries.snmpGraphRangeCheck,function(key,val){
                    var value = trim($("#"+val).val());//No I18N
                    if(!opu_SnmpGraphRangeCheck(value,val)){    
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('opu.general.Validate_Range',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.checkPromptSpecialChars !== undefined && invalidEnteries.checkPromptSpecialChars.length > 0) {
                $.each(invalidEnteries.checkPromptSpecialChars,function(key,val){
                    var value = trim($("#"+val).val());//No I18N
                    if(!checkPromptSpecialChars(value)){    
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.invalidprompt.alert',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.checkIsSpecialCharsAvail !== undefined && invalidEnteries.checkIsSpecialCharsAvail.length > 0) {
                $.each(invalidEnteries.checkIsSpecialCharsAvail,function(key,val){
                    var value = trim($("#"+val).val());//No I18N
                    if(opm_checkSpecialChars(value)){    
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.splcharmsg.dtmonname',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipValidation !== undefined && !$.isEmptyObject(invalidEnteries.ipValidation))
            {
                if($("#IPRangeDetails").is(':visible'))
                {
                    var IPrangeLength = $("#IPRangeDetails").val().length;
                }
                else
                {
                    var IPrangeLength = null;
                }
                if(IPrangeLength === 0 || IPrangeLength === null)
                {
                    $.each(invalidEnteries.ipValidation,function(key,val){
                        var flag = true;
                        for(var i=1;i<=4;i++){
                            var startIP = "#"+key+i;
                            var endIP = "#"+val+i;
                            if($(startIP).val() === undefined || $(startIP).val() === "" || $(startIP).val() === null || $(startIP).val() > 255){
                                flag = false;
                                if(count === 0){ firstElement = startIP; }//No I18N
                                $(startIP).addClass('validateField error');//No I18N
                                $(startIP).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));//No I18N
                                count++;
                            }
                            if($(endIP).val() === undefined || $(endIP).val() === "" || $(endIP).val() === null || $(endIP).val() > 255){
                                flag = false;
                                if(count === 0){ firstElement = endIP; }//No I18N 
                                $(endIP).addClass('validateField error');//No I18N
                                $(endIP).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));//No I18N
                                count++;
                            }


                            if(flag){
                                if(i == 1){
                                    if(parseInt($(endIP).val()) < parseInt($(startIP).val()))
                                    {//No I18N
                                        if(count === 0){ firstElement = endIP; }//No I18N 
                                        $(endIP).addClass('validateField error');//No I18N
                                        $(endIP).attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                                        flag = false;
                                        count++;
                                    }
                                }else if(flag){
                                    var j = i-1;
                                    var startIP1 = "#"+key+j;
                                    var endIP1 = "#"+val+j;
                                    if(parseInt($(endIP1).val()) > parseInt($(startIP1).val())){
                                        return false;
                                    }
                                    if(parseInt($(endIP1).val()) === parseInt($(startIP1).val()))//No I18N
                                    {
                                        if(parseInt($(endIP).val()) < parseInt($(startIP).val()))//No I18N
                                        {
                                            if(count === 0){ firstElement = endIP; }//No I18N 
                                            $(endIP).addClass('validateField error');//No I18N
                                            $(endIP).attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                    });  
                }
            }
            if(IPrangeLength !== 0 && IPrangeLength !== undefined && IPrangeLength !== null)
            {
                var IPrangeDetails = $("#IPRangeDetails").val();
                var newLineSplit = IPrangeDetails.split("\n");
                var flag = true;
                $.each(newLineSplit,function(key,ipRange)
                {
                    var ips = ipRange.split('-');                        
                    var ip1 = ips[0].replace('FromIP=','');
                    var ip2 = ips[1].replace(' ToIP=','');
                    if(opm_isIpV4Address(ip1) ===  false)
                    {
                        if(count === 0){ firstElement = "#IPRangeDetails"; }//No I18N
                        flag = false;
                        $("#IPRangeDetails").focus();//No I18N
                        $("#IPRangeDetails").addClass('validateField error');//No I18N
                        $("#IPRangeDetails").attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                        count++;
                    }
                    else if(opm_isIpV4Address(ip2) === false)
                    {
                        if(count === 0){ firstElement = "#IPRangeDetails"; }//No I18N 
                        flag = false;
                        $("#IPRangeDetails").focus();//No I18N
                        $("#IPRangeDetails").addClass('validateField error');//No I18N
                        $("#IPRangeDetails").attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                        count++;
                    }
                    else if(parseInt(ip2) < parseInt(ip1))
                    {//No I18N
                        if(count === 0){ firstElement = "#IPRangeDetails"; }//No I18N 
                        flag = false;
                        $("#IPRangeDetails").focus();//No I18N
                        $("#IPRangeDetails").addClass('validateField error');//No I18N
                        $("#IPRangeDetails").attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipv6Validation !== undefined && invalidEnteries.ipv6Validation.length > 0){
                $.each(invalidEnteries.ipv6Validation,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_isIpV6Address(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.discovery.validipv6from',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.custom !== undefined && invalidEnteries.custom.length > 0){
                $.each(invalidEnteries.custom, function(key,val){
                    if(val.condition){
                        if(count === 0){ firstElement = "#"+val.identifier; }//No I18N
                        $("#"+val.identifier).addClass('validateField error');//No I18N
                        if(val.message !== undefined) {
                            $("#"+val.identifier).attr('data-error',val.message);//No I18N
                        }
                        count++;
                    }
                });
            }
        if(invalidEnteries.hourCheck !== undefined && invalidEnteries.hourCheck.length > 0){
                $.each(invalidEnteries.hourCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isHour(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',"Hour should be between 0 and 23");//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.minuteCheck !== undefined && invalidEnteries.minuteCheck.length > 0){
                $.each(invalidEnteries.minuteCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!isMinute(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',"Minutes should be between 0 and 59");//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.lengthCheck !== undefined  && !$.isEmptyObject(invalidEnteries.lengthCheck))
            {
                $.each(invalidEnteries.lengthCheck,function(field,pwdLen){
                    var pwd = trim($("#"+field).val());//No I18N
                    if(pwd.length < parseInt(pwdLen)){//No I18N
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.settings.usermanagement.passwordlength.error',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.limitCheck !== undefined  && !$.isEmptyObject(invalidEnteries.limitCheck))
            {
                $.each(invalidEnteries.limitCheck,function(key,val){
                    var pwd = trim($("#"+val).val());//No I18N
                    if(pwd.length > 50){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error'); //No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('jsp.credential.TestCredentialView.CredentialsAreInValid',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.minCheck !== undefined  && !$.isEmptyObject(invalidEnteries.minCheck))
            {
                $.each(invalidEnteries.minCheck,function(field,pwdLen){
                    var pwd = trim($("#"+field).val());//No I18N
                    if(pwd.length < parseInt(pwdLen)){//No I18N
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.min.characters.allowed',this)+":"+pwdLen); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.maxCharacters !== undefined  && !$.isEmptyObject(invalidEnteries.maxCharacters))
            {
                $.each(invalidEnteries.maxCharacters,function(field,pwdLen){
                    var pwd = trim($("#"+field).val());//No I18N
                    if(pwd.length > parseInt(pwdLen)){//No I18N
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.max.characters.allowed',this)+":"+pwdLen); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.maxCheck !== undefined  && !$.isEmptyObject(invalidEnteries.maxCheck))
            {
                $.each(invalidEnteries.maxCheck,function(field,pwdLen){
                    var pwd = trim($("#"+field).val());//No I18N
                    if(pwd.length > parseInt(pwdLen)){//No I18N
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.max.characters.allowed',this)+":"+pwdLen); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.perfNameCheck !== undefined && invalidEnteries.perfNameCheck.length > 0){
                $.each(invalidEnteries.perfNameCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_NoPerfGrpSpecialSymbols(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.allowCertianChars',{param0:'-_()/'},this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.matchPassword !== undefined  && !$.isEmptyObject(invalidEnteries.matchPassword))
            {
                $.each(invalidEnteries.matchPassword,function(field1,field2){
                    var pwd = trim($("#"+field1).val());//No I18N
                    var rePwd = trim($("#"+field2).val());//No I18N
                    if(trim(pwd)!== trim(rePwd)){//No I18N
                        if(count === 0){ firstElement = field2; }
                         var validateField = field2;
                        if(field2 === "repassword" || field2 === "rePassword" || field2 === "retypePassword") { //No I18N
                            validateField = field2;
                        }
                        $("#"+validateField).addClass('validateField error'); //No I18N
                        $("#"+validateField).attr('data-error',Ember.I18n.t('webclient.login.samepwds.required.message',this)); //No I18N
                        $("#"+validateField).focus();
                        opmValidate($("#"+validateField));
                        count++;
                    }
                });
            }
            if(invalidEnteries.validateUrl !== undefined && invalidEnteries.validateUrl.length > 0)
            {
                $.each(invalidEnteries.validateUrl, function(key,val){
                    var urlVal = trim($("#"+val).val());//No I18N
                    if(urlVal === "http://"){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.url.enterurl',this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.validateProperUrl !== undefined && invalidEnteries.validateProperUrl.length > 0) {
                $.each(invalidEnteries.validateProperUrl, function (key, val) {
                    var urlVal = trim($("#" + val).val());//No I18N
                    if (!isValidURL(urlVal)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.sms.customsms.invalideurl', this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.validateframeworkMultipleUrlCsv !== undefined && invalidEnteries.validateframeworkMultipleUrlCsv.length > 0) {
                            $.each(invalidEnteries.validateframeworkMultipleUrlCsv, function (key, val) {
                                var urlVal = trim($("#" + val).val());//No I18N
                                if (!isValidCSVURL(urlVal)) {
                                    if (count === 0) { firstElement = "#" + val; }//No I18N
                                    $("#" + val).addClass('validateField error');//No I18N
                                    $("#" + val).attr('data-error', Ember.I18n.t('webclient.sms.customsms.invalideurl', this));//No I18N
                                    count++;
                                }
                            });
                        }
            if (invalidEnteries.validateProperUrlTPI !== undefined && invalidEnteries.validateProperUrlTPI.length > 0) {
                $.each(invalidEnteries.validateProperUrlTPI, function (key, val) {
                    var urlVal = trim($("#" + val).val());//No I18N
                    if (!isValidURLTPI(urlVal)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.sms.customsms.invalideurl', this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.checkValidURLwithPort !== undefined && invalidEnteries.checkValidURLwithPort.length > 0) {
                $.each(invalidEnteries.checkValidURLwithPort, function (key, val) {
                    var urlVal = trim($("#" + val).val());//No I18N
                    if (!checkValidURLwithPort(urlVal)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.sms.customsms.invalideurl', this));//No I18N
                        count++;
                    }
                });
            }
			if (invalidEnteries.isValidHostName !== undefined && invalidEnteries.isValidHostName.length > 0) {
                $.each(invalidEnteries.isValidHostName, function (key, val) {
                    var urlVal = trim($("#" + val).val());//No I18N
                    if (!isValidHostName(urlVal)) {
                        if (count === 0) { firstElement = "#" + val; }//No I18N
                        $("#" + val).addClass('validateField error');//No I18N
                        $("#" + val).attr('data-error', Ember.I18n.t('webclient.ncm.terminal.change.validHostName', this));//No I18N
                        count++;
                    }
                });
            }
            if (invalidEnteries.validateMultipleUrlCsv !== undefined && invalidEnteries.validateMultipleUrlCsv.length > 0) {
                $.each(invalidEnteries.validateMultipleUrlCsv, function (key, val) {
                    var urlVal = trim($("#" + val).val());//No I18N
                    var urls = urlVal.split(",");
                    for (var i = 0; i < urls.length; i++) {
                        var eachUrl = urls[i];
                        if (!isValidURL(eachUrl)) {
                            if (count === 0) { firstElement = "#" + val; }//No I18N
                            $("#" + val).addClass('validateField error');//No I18N
                            $("#" + val).attr('data-error', Ember.I18n.t('webclient.sms.customsms.invalideurl', this));//No I18N
                            count++;
                            break;
                        }
                    }
                    
                });
            }
            if(invalidEnteries.smpOID !== undefined && invalidEnteries.smpOID.length > 0){
                $.each(invalidEnteries.smpOID,function(key,val){
                    var value = trim($("#"+val).val());
                    if(!opm_validateSNMPOID(value)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.string',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipslaSettings !== undefined && invalidEnteries.ipslaSettings.length > 0){
                $.each(invalidEnteries.ipslaSettings,function(key,val){
                    var value = trim($("#"+val).val());
                    if(value > 60000 || value <0){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.ipsla.admin.inrange',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.spclCharacters !== undefined && invalidEnteries.spclCharacters.length > 0){
                $.each(invalidEnteries.spclCharacters,function(key,val){
                    var value = trim($("#"+val).val());
                    if(isSpecialCharacter(value)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.netmask !== undefined && invalidEnteries.netmask.length > 0){
                $.each(invalidEnteries.netmask, function(key,val){
                    var ipAddress = trim($('#'+val.addressField).val());
                    var netmaskVal = trim($('#'+val.netmaskField).val());
                    var isValid = opm_isIpV4Address(ipAddress);
                    if(isValid) {
                        isValid=opm_isIpV4Address(netmaskVal);
                    }else {
                        isValid=opm_isValidIpv6Mask(netmaskVal);
                    }
                    if(!isValid){
                        if(count === 0){ firstElement = "#"+val.netmaskField; }//No I18N
                        $("#"+val.netmaskField).addClass('validateField error');
                        $("#"+val.netmaskField).attr('data-error',Ember.I18n.t('webclient.discovery.netmaskalert',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipRange !== undefined && invalidEnteries.ipRange.length > 0){
                $.each(invalidEnteries.ipRange, function(key,val){
                    var startIP = trim($('#'+val.startIP).val());
                    var endIP = trim($('#'+val.endIP).val());
                    var isIpV4 = opm_isIpV4Address(startIP);
                    if(count === 0 && !opm_isIPAddressValid(startIP)){
                       if(count === 0){ firstElement = "#"+val.startIP; }//No I18N
                       nfa_addIPCheckError(val.startIP);
                       count++;
                    }
                    if(count === 0 && !opm_isIPAddressValid(endIP)){
                        if(count === 0){ firstElement = "#"+val.endIP; }//No I18N
                        nfa_addIPCheckError(val.endIP);
                        count++;
                    }
                    if(count === 0 && !nfa_validateIPRange(startIP,endIP,isIpV4)){
                        if(count === 0){ firstElement = "#"+val.startIP; }//No I18N
                        $("#"+val.startIP+",#"+val.endIP).addClass('validateField error');
                        $("#"+val.startIP+",#"+val.endIP).attr('data-error',Ember.I18n.t('fwa.DiagnoseConn.Alert11',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.isAlphaNumericDotDashAtOpU !== undefined && invalidEnteries.isAlphaNumericDotDashAtOpU.length > 0){
                $.each(invalidEnteries.isAlphaNumericDotDashAtOpU,function(key,val){
                    var value = trim($("#"+val).val());
                    if(val == "multipleCustomValues"){
                        value = value.replace(/,/g, '');
                    }
                    if(!isAlphaNumericDotDashAtOpU(value)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.opm_NoSpecialSymbols!==undefined && invalidEnteries.opm_NoSpecialSymbols.length>0) {
                $.each(invalidEnteries.opm_NoSpecialSymbols,function(key,val){
                    var value = trim($("#"+val).val());
                    if(!opm_NoSpecialSymbols(value)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.isAlphaNumericDotDashAt !== undefined && invalidEnteries.isAlphaNumericDotDashAt.length > 0){
                $.each(invalidEnteries.isAlphaNumericDotDashAt,function(key,val){
                    var value = trim($("#"+val).val());
                    if(!isAlphaNumericDotDashAt(value)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.spclCharactersWithoutSpace !== undefined && invalidEnteries.spclCharactersWithoutSpace.length > 0){
                $.each(invalidEnteries.spclCharactersWithoutSpace,function(key,val){
                    var value = trim($("#"+val).val());
                    if(isSpecialCharacterWithoutSpace(value)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.phoneNumber !== undefined  && invalidEnteries.phoneNumber.length > 0)
            {
                $.each(invalidEnteries.phoneNumber,function(key, val){
                    var phone = trim($("#"+val).val());//No I18N
                    if(phone.length > 20){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error'); //No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.phonenumber.lengthcheck',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.checkEdbStmExtension !== undefined && Object.keys(invalidEnteries.checkEdbStmExtension).length > 0){
                $.each(invalidEnteries.checkEdbStmExtension,function(key,val){
                    var value = trim($("#"+val).val());
                    var flag = opm_checkEdbStmExtension(value,key);
                    if(flag!==true){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',flag);//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.phoneNumberWithCountryCode !== undefined  && invalidEnteries.phoneNumberWithCountryCode.length > 0)
            {
                $.each(invalidEnteries.phoneNumberWithCountryCode,function(key, val){
                    var phoneNumArray = trim($("#"+val).val()).split(",");//No I18N
                    var flag = false;
                    $.each(phoneNumArray, function(k,v){
                        if(!isValidMobileNumber(v)){
                           flag = true;
                        }
                    });
                    if(flag){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error'); 
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.notification.validmobilenumber',this)); 
                        count++;
                    }
                });
            }
            if(invalidEnteries.mobileNumberWithPlusOnly !== undefined  && invalidEnteries.mobileNumberWithPlusOnly.length > 0)
            {
                $.each(invalidEnteries.mobileNumberWithPlusOnly,function(key, val){
                    var mobileNumber = trim($("#"+val).val());//No I18N
                    var flag = false;
                    if(!isValidMobileNumber(mobileNumber) || mobileNumber.indexOf(",") !== -1){
                       flag = true;
                    }
                    if(flag){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error'); 
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.notification.validmobilenumber',this)); 
                        count++;
                    }
                });
            }
            if(invalidEnteries.wholeNumber !== undefined && invalidEnteries.wholeNumber.length > 0){
                $.each(invalidEnteries.wholeNumber,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_IsNumeric(validatingField) || validatingField < 0){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.validation.propervalue',this));
                        count++;
                    }
                });
            }
           if(invalidEnteries.rangeCheck !== undefined  && !$.isEmptyObject(invalidEnteries.rangeCheck))
            {
                $.each(invalidEnteries.rangeCheck,function(field,maxVal){
                    var val = trim($("#"+field).val());//No I18N
                    if(parseInt(val) > parseInt(maxVal)){//No I18N
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.error.rangeCheck',this)+":"+maxVal); //No I18N
                        count++;
                    }
                });
            }
             if(invalidEnteries.spclCharForBV !== undefined && invalidEnteries.spclCharForBV.length > 0){
                $.each(invalidEnteries.spclCharForBV,function(key,val){
                    var value = trim($("#"+val).val());
                    if(!opm_isValidBVRackFloorName(value)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.maps.specialchar.restrictmessage',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.minRangeCheck !== undefined  && !$.isEmptyObject(invalidEnteries.minRangeCheck))
            {
                $.each(invalidEnteries.minRangeCheck,function(field,minVal){
                    var val = trim($("#"+field).val());//No I18N
                    if(parseInt(val) < parseInt(minVal)){
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.general.minValAlwd',this)+" "+minVal); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.minrangeCheck !== undefined  && !$.isEmptyObject(invalidEnteries.minrangeCheck))
            {
                $.each(invalidEnteries.minrangeCheck,function(field,minVal){
                    var val = trim($("#"+field).val());//No I18N
                    if(parseInt(val) < parseInt(minVal)){
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.admin.syslogrules.timegreat',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.ipValidation2 !== undefined  && !$.isEmptyObject(invalidEnteries.ipValidation2))
            { 
                $.each(invalidEnteries.ipValidation2,function(field,minVal){
                    $.each(invalidEnteries.ipValidation2,function(key,val){
                        for(var i=1;i<=4;i++){
                            var startIP = "#"+key+i;
                            var endIP = "#"+val+i;
                            if(opm_isValidCustomColumnName($(startIP).val())){
                                if(count === 0){ firstElement = startIP; }//No I18N
                                $(startIP).addClass('validateField error');//No I18N
                                $(startIP).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));//No I18N
                                count++;
                            }
                            if(opm_isValidCustomColumnName($(endIP).val())){
                                if(count === 0){ firstElement = endIP; }//No I18N 
                                $(endIP).addClass('validateField error');//No I18N
                                $(endIP).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));//No I18N
                                count++;
                            }
                        }
                    });
                });
            }
            if(invalidEnteries.sharedFolderCheck !== undefined && !$.isEmptyObject(invalidEnteries.sharedFolderCheck)) {
             $.each(invalidEnteries.sharedFolderCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    var regexBasedOnOs = /^\\\\[a-zA-Z0-9\.\-_]{1,}(\\(?! )[a-zA-Z0-9\-_ !@#$%^&(){}'.]{1,}(?! )){1,}[\$]{0,1}\\?$/;
                    if(!window.OPM.isWindows) {
                        regexBasedOnOs = /^([a-zA-Z0-9\-_]+):(\/[a-zA-Z0-9\-_]+)+\/?$/;
                    }
                    if(!regexBasedOnOs.test(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.failover.sharedfoldercheck',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.noSpaceCheck !== undefined && !$.isEmptyObject(invalidEnteries.noSpaceCheck)) 
            {
                $.each(invalidEnteries.noSpaceCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(validatingField.indexOf(' ') >= 0){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.field.space.notallowed',this));
                        count++;
                    }
                });
            }
             if(invalidEnteries.isNumeric !== undefined && invalidEnteries.isNumeric.length > 0){
                $.each(invalidEnteries.isNumeric,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(!opm_IsNumeric(validatingField)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.discovery.maskbit',this));
                        count++;
                    }
                });
            }
            if(invalidEnteries.spclCharProbeName !== undefined && invalidEnteries.spclCharProbeName.length > 0){
                $.each(invalidEnteries.spclCharProbeName,function(key,val){
                    var value = trim($("#"+val).val());
                    if(!spclCharProbeName(value)){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.spclCharCustomerName !== undefined && invalidEnteries.spclCharCustomerName.length > 0){
                $.each(invalidEnteries.spclCharCustomerName,function(key,val){
                    var value = $("#"+val).val();
                    if(!spclCharCustomerName(value)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.DTVendorNameCheck !== undefined && invalidEnteries.DTVendorNameCheck.length > 0) {
                $.each(invalidEnteries.DTVendorNameCheck,function(key,val){
                    var value = trim($("#"+val).val());//No I18N
                    if(!opm_DTVendorNameCheck(value)){    
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.roleDesc.field.error',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.isValidPwdCheck !== undefined && !$.isEmptyObject(invalidEnteries.isValidPwdCheck)) {
                var isValidPwdCheck = invalidEnteries.isValidPwdCheck;
                var pwdField = isValidPwdCheck.newPassword;
                var pwd = $("#" + pwdField).val();
                if(isValidPwd(pwd, isValidPwdCheck.userName, isValidPwdCheck.pwdMinLen,isValidPwdCheck.pwdMaxLen ,isValidPwdCheck.complexPwd).result !== true){
                    if(count === 0){ firstElement = "#"+pwdField; }//No I18N
                    $("#"+pwdField).addClass('validateField error');//No I18N
                    $("#"+pwdField).attr('data-error', Ember.I18n.t("webclient.password.nomatchall"));//No I18N
                    count++;
                }
            }
            if(invalidEnteries.alphabetsOnly !== undefined && invalidEnteries.alphabetsOnly.length > 0){
                $.each(invalidEnteries.alphabetsOnly,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!/^[A-Za-z]+$/.test(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opmformvalidation.alphabets',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.alphabetsWithSpaceOnly !== undefined && invalidEnteries.alphabetsWithSpaceOnly.length > 0){
                $.each(invalidEnteries.alphabetsWithSpaceOnly,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!/^[A-Za-z ]+$/.test(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opmformvalidation.alphabets',this));//No I18N
                        count++;
                    }
                });
            }
            
              if(invalidEnteries.selBoxEmptyCheck !== undefined && invalidEnteries.selBoxEmptyCheck.length > 0){
                $.each(invalidEnteries.selBoxEmptyCheck,function(key,val){
                    var validatingField = trim($("#"+val).val());
                    if(validatingField == -1 || validatingField == "None" || validatingField == ""){//No I18N
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.inventory.secondaryDevice.select',this));//No I18N
                        count++;
                    }
                });
            }
             if(invalidEnteries.minRangeCustomMsg !== undefined  && !$.isEmptyObject(invalidEnteries.minRangeCustomMsg))
            {
                $.each(invalidEnteries.minRangeCustomMsg,function(field,minVal){
                    var val = trim($("#"+field).val());//No I18N
                    if(parseInt(val) < parseInt(minVal)){
                        if(count === 0){ firstElement = "#"+field; }//No I18N
                        $("#"+field).addClass('validateField error'); //No I18N
                        $("#"+field).attr('data-error',Ember.I18n.t('webclient.opm.realtime.monitoring.timeinterval.min',this)); //No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.descriptionMultiByte !== undefined && invalidEnteries.descriptionMultiByte.length > 0){
                $.each(invalidEnteries.descriptionMultiByte,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!descriptionMultiByte(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            } 
            if(invalidEnteries.rackPeripheralsLabel !== undefined && invalidEnteries.rackPeripheralsLabel.length > 0){
                $.each(invalidEnteries.rackPeripheralsLabel,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!opm_isValidRackLabelName(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.criteriaAPVal !== undefined && invalidEnteries.criteriaAPVal.length > 0){
                $.each(invalidEnteries.criteriaAPVal,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!opm_isValidAPCriteriaVal(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.admin.traps.specialchar',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.fwaRepMaxRowCount !== undefined && invalidEnteries.fwaRepMaxRowCount.length > 0){
                $.each(invalidEnteries.fwaRepMaxRowCount,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!fwa_validateMaxRountVal(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.fwa.report.rowcount.msg7',{param0:OPMClient.FWACustomReportRowcountController.maxRowCount},this));//No I18N
                        count++;
                    }
                });
            }
            
            if(invalidEnteries.fwapaloVirtualdevice !== undefined && invalidEnteries.fwapaloVirtualdevice.length > 0){
                $.each(invalidEnteries.fwapaloVirtualdevice,function(key,val){
                    var validatingField = $("#"+val).val();//No I18N
                    if(!validatingField.includes("vsys")){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.fwa.manual.add.virtual.msg3',this));//No I18N
                        count++;
                    }
                });
            }
            
            //Date is already validated by jquery date picker, hence validating time for current date
            if(invalidEnteries.isDateTimePast !== undefined && invalidEnteries.isDateTimePast.date && invalidEnteries.isDateTimePast.time){
                if(isDatePast($("#"+invalidEnteries.isDateTimePast.date).val())) {
                    if(count === 0){ firstElement = "#"+invalidEnteries.isDateTimePast.date; }//No I18N
                    $("#"+invalidEnteries.isDateTimePast.date).addClass('validateField error');//No I18N
                    $("#"+invalidEnteries.isDateTimePast.date).attr('data-error',Ember.I18n.t('webclient.common.pastdate'));//No I18N
                    count++
                } else if(isDateTimePast($("#"+invalidEnteries.isDateTimePast.date).val(), $("#"+invalidEnteries.isDateTimePast.time).val())) {
                    if(count === 0){ firstElement = "#"+invalidEnteries.isDateTimePast.time; }//No I18N
                        $("#"+invalidEnteries.isDateTimePast.time).addClass('validateField error');//No I18N
                        $("#"+invalidEnteries.isDateTimePast.time).attr('data-error',Ember.I18n.t("webclient.common.pasttime"));//No I18N
                        count++;
                }
            }
             //Date is already validated by jquery date picker, hence validating time for current date is not in future
            if(invalidEnteries.isDateTimeFuture !== undefined && invalidEnteries.isDateTimeFuture.length > 0){
                $.each(invalidEnteries.isDateTimeFuture,function(key,val){
                    if(isDateFuture($("#"+val.date).val())) {
                        if(count === 0){ firstElement = "#"+val.date; }//No I18N
                        $("#"+val.date).addClass('validateField error');//No I18N
                        $("#"+val.date).attr('data-error',Ember.I18n.t('webclient.common.futureDate'));//No I18N
                        count++
                    } else if(isDateTimeFuture($("#"+val.date).val(), $("#"+val.time).val())) {
                        if(count === 0){ firstElement = "#"+val.time; }//No I18N
                            $("#"+val.time).addClass('validateField error');//No I18N
                            $("#"+val.time).attr('data-error',Ember.I18n.t("webclient.common.futureTime"));//No I18N
                            count++;
                    }
                });
            }
            if(invalidEnteries.textBasicSymbols !== undefined && invalidEnteries.textBasicSymbols.length > 0){
                $.each(invalidEnteries.textBasicSymbols,function(key,val){
                    var validatingField = trim($("#"+val).val());//No I18N
                    if(!opm_dcNameValidation(validatingField)){
                        if(count === 0){ firstElement = "#"+val; }//No I18N
                        $("#"+val).addClass('validateField error');//No I18N
                        $("#"+val).attr('data-error',Ember.I18n.t('webclient.opm.testCredential.fieldError',this));//No I18N
                        count++;
                    }
                });
            }
            if(invalidEnteries.customErrorFocus !== undefined && invalidEnteries.customErrorFocus.length > 0){
                $.each(invalidEnteries.customErrorFocus, function(key,val){
                    if(count === 0){ firstElement = "#"+val.identifier; }//No I18N
                    $("#"+val.identifier).addClass('validateField error');//No I18N
                    if(val.message !== undefined) {
                        $("#"+val.identifier).attr('data-error',val.message);//No I18N
                    }
                    count++;
                });
            }
        }
    }
    $(firstElement).focus();
    opmValidate($(firstElement));
    $('.validateField').on('focusin',function(){
        opmValidate($(this));
    });
    $('.validateField').on('focusout',function(){
        $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
    });
    if(count > 0){
        return false;    
    }
    return true;
}
function opm_showErrorInField(fieldName,errorMsg)
{
    var errorField = $("#"+fieldName);
    errorField.addClass('validateField error');//No I18N
    errorField.attr('data-error',errorMsg);//No I18N
    opmValidate(errorField);
    
    $('.validateField').on('focusout',function(){
        $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
    });
}
function opmValidate(tisVar){
    if(tisVar.hasClass('error')){//No I18N
        dataError=tisVar.attr('data-error');//No I18N
        if(dataError) {
        Pos=tisVar.offset();
        PosY=Pos.top+tisVar.outerHeight()+7;//No I18N
        PosX=Pos.left;
        if($('html').hasClass('onScrollTopBandHide')){//No I18N
            PosY += 50;
        }
        $('body').append("<div class='OpMToolBar' style='top:"+PosY+"px'><div class='title'>"+dataError+"</div></div>");//No I18N
        ToolBarWd=$('.OpMToolBar').outerWidth()+1;//No I18N
        dis=PosX+(tisVar.outerWidth()/2);
        TotalWd=dis+(ToolBarWd/2);
        $('.OpMToolBar').css({width:ToolBarWd});
        if(wWd>TotalWd){
            CtrPos=dis-(ToolBarWd/2);
            if(CtrPos < 0) {
                $('body').append('<style class="OpMToolBarStyle">.OpMToolBar:before{left:'+dis+'px;right:auto}</style>');//No I18N
                CtrPos = 0;
            }
            $('.OpMToolBar').css({left:CtrPos,opacity:'1'});
        }else{
            PosX=(PosX+tisVar.outerWidth())-ToolBarWd;
            ArrowPos=(tisVar.width()/2)+2;//No I18N
            $('body').append('<style class="OpMToolBarStyle">.OpMToolBar:before{right:'+ArrowPos+'px;left:auto}</style>');//No I18N
            $('.OpMToolBar').css({left:PosX,opacity:'1'});//No I18N
        }
    }
}
}

/*
Duplicate Method
function opmValidateSelect(tisVar){
    if(tisVar.hasClass('error')){//No I18N
        dataError=tisVar.attr('data-error');//No I18N
     
        Pos=tisVar.offset();
        PosY=Pos.top+tisVar.outerHeight()+39;
        PosX=Pos.left;
        $('body').append("<div class='OpMToolBar' style='top:"+PosY+"px'><div class='title'>"+dataError+"</div></div>");//No I18N
        ToolBarWd=$('.OpMToolBar').outerWidth()+1;//No I18N
        dis=PosX+(tisVar.outerWidth()/2);
        TotalWd=dis+(ToolBarWd/2);
        $('.OpMToolBar').css({width:ToolBarWd});
        if(wWd>TotalWd){
            CtrPos=dis-(ToolBarWd/2);
            $('.OpMToolBar').css({left:CtrPos+77,opacity:'1'});
        }else{
            PosX=(PosX+tisVar.outerWidth())-ToolBarWd;
            ArrowPos=(tisVar.width()/2)+2;
            $('body').append('<style class="OpMToolBarStyle">.OpMToolBar:before{right:'+ArrowPos+'px;left:auto}</style>');//No I18N
            $('.OpMToolBar').css({left:PosX+77,opacity:'1'});//No I18N
        }
    }
}
*/

//Used for MailServersettings and Notification Profile initially 
function opm_validateEmailWithAllSplChar(paramVal){
    if (paramVal != ""){
        var objRegExp  = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/;  
        return objRegExp.test(trimAll(paramVal));    
    }else{
        return false;
    }
}

function opm_validateEmailWithAllSplCharOrDefault(paramVal){
    if (paramVal != ""){
        var objRegExp  = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))|\$defaultFromAddress)$/;  
        return objRegExp.test(trimAll(paramVal));    
    }else{
        return false;
    }
}

function opm_validateEmail(paramVal)
{
    if (paramVal != ""){
        var objRegExp  = /^[%_+a-zA-Z0-9]([a-zA-Z0-9%_\-\.\']*)@([a-zA-Z0-9_\-\.]*)(\.[a-zA-Z]+)$/i;  
        return objRegExp.test(trimAll(paramVal));    
    }else{
        return false;
    }
}
function opm_validateUsername(paramVal) {
    if (paramVal != "") {
        var objRegExp = /^[a-zA-Z0-9$_\-+\.@\s]([a-zA-Z0-9$_\-+\.@\s]*)$/;
        return objRegExp.test(trimAll(paramVal));
    } else {
        return false;
    }
}
function opm_validateDomainNameWithComma(paramVal) {
    if (paramVal != "") {
        var objRegExp = /^[A-Za-z0-9.-]+(\s*,\s*[A-Za-z0-9.-]+)*$/;
        return objRegExp.test(trimAll(paramVal));
    } else {
        return false;
    }
}
function opm_validateDomainName(paramVal) {
    if (paramVal != "") {
        var objRegExp = /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/;
        return objRegExp.test(trimAll(paramVal));
    } else {
        return false;
    }
}
function opm_validateDomainNameWithComma(paramVal) {
    if (paramVal != "") {
        var objRegExp = /^[A-Za-z0-9.-]+(\s*,\s*[A-Za-z0-9.-]+)*$/;
        return objRegExp.test(trimAll(paramVal));
    } else {
        return false;
    }
}
function opm_validateDomainName(paramVal) {
    if (paramVal != "") {
        var objRegExp = /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/;
        return objRegExp.test(trimAll(paramVal));
    } else {
        return false;
    }
}
function opm_validateMultipleEmail(paramVal)
{
    if(paramVal === "" || paramVal === undefined)
    {
        return false;
    }
    var emailIds = paramVal.split(","); //No I18n
    for(var i=0;i<emailIds.length;i++)
    {
        if(!opm_validateEmail(emailIds[i]))
        {
            return false;
        }
    }
    return true;
}
function opm_validateMultipleEmailWithSplChar(param) {
    var paramVal = param.val(); 
    if (paramVal === "" || paramVal === undefined) {
        return false;
    }
    var emailIds = paramVal.split(","); //No I18n
    for (var i = 0; i < emailIds.length; i++) {
        emailIds[i] = trimAll(emailIds[i]);
        if (!opm_validateEmailWithAllSplChar(emailIds[i])) {
            var customFieldPattern = /^\$(CustomField)\([^)]+\)$/;
            if(!customFieldPattern.test(emailIds[i])) {
                return false;
            }
        }
    }
    param.val(emailIds.join(','))
    return true;
}
function opm_DTVendorNameCheck(name) {
    var fieldRegex=/^[\w\u00C0-\u024F\u1E00-\u1EFF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF ]+$/;
    return fieldRegex.test(name);
}
function onSMSGatewayChange(sel) {
    var isInBuiltGateway = ($.inArray(sel, OPMClient.SettingsAddEditController.inBuiltSMSGatewayNames) !== -1);
    OPMClient.SettingsAddEditController.set('isSMSServerConfigured', false); //No I18N
    if (sel === 'Custom' || sel === 'smpp' || isInBuiltGateway) {
        $('#clickModem').show();
        $('.modemPro #EOSMsg').hide();
    } 
    else {
        $('#clickModem').hide();
        $('.modemPro #EOSMsg').show();
        OPMClient.SettingsAddEditController.set('isSMSServerConfigured', true); //No I18N 
    }
    if (OPMClient.SettingsNotificationsController.smsGatewayConf !== undefined) {
        if (
            (sel === 'Custom' && OPMClient.SettingsNotificationsController.smsGatewayConf.custom === 'true') || //No I18N
            (sel === 'smpp' && OPMClient.SettingsNotificationsController.smsGatewayConf.smpp === 'true') || //No I18N
            (isInBuiltGateway && isInBuiltGatewayConfigured(sel, OPMClient.SettingsNotificationsController.smsGatewayConf))
        ) {
            OPMClient.SettingsAddEditController.set('isSMSServerConfigured', true); //No I18N 
        }
    }
}

function multiSelectViewList(element) {
    var intfName=$(element).parent().find('.intfName').text(); //No I18N
    var value=$(element).val();
    var headerName=$(element).parent().parent().parent().parent().parent().find('.routerName').text(); //No I18N
    if($(element).prop('checked')) { //No I18N
        var flag=false;
        var currentCatHdr;
        $('.selectedFilterList .catHdr i').each(function(){ //No I18N
            if(headerName === $(this).text()){
                currentCatHdr=this;
                flag=true;
                return;
            }
        })
        if(flag){
            $(currentCatHdr).parent().parent().find('.catList').append('<i data-value='+value+'>'+htmlEncode(intfName)+'</i>'); //No I18N
        }else {
            $('.selectedFilterList').append('<div class="opmFormRow"><div class="catHdr"><i data-value="'+value+'">'+htmlEncode(headerName)+'</i></div><div class="catList"><i data-value='+value+'>'+htmlEncode(intfName)+'</i></div></div>'); //No I18N
        }
    }else {
        if($('.catList i[data-value="'+value+'"]').parent().find('i').length ===1){
            $('.catList i[data-value="'+value+'"]').parent().parent().remove();
        }else{
            $('.catList i[data-value="'+value+'"]').remove();
        } 
    }
    $('.selectedFilterList .catHdr i').off().click(function(){ //No I18N
        var value=$(this).data('value'); //No I18N
        $('.opmAccListChkChild input[value="'+value+'"]').parent().parent().parent().parent().find('input:checkbox:not(".chkParent"):checked').click(); //No I18N
    }); 
    $('.selectedFilterList .catList i').off().click(function(){ //No I18N
        var value=$(this).data('value'); //No I18N
        $('.opmAccListChkChild input[value="'+value+'"]').click(); //No I18N
    });
}
function initializeMultiSelectEvents(){
    $('.selectedFilterList').empty();
    $('.opmAccListChk > ul > li:first-child').addClass('active');
    $('.opmCheckBox.noDataCheck input').attr("disabled", true);
    $('#credentials').prop('checked',false);
    $('.opmAccListChk').removeAttr('style');
    if($('.chkParentChild.active').find('ul')[0] !== undefined) { //No I18N
        var scrlListHt=$('.chkParentChild.active').find('ul')[0].scrollHeight; //No I18N
        if(scrlListHt<268){
            scrlListHt=268;
        }
        $('.opmAccListChk').css({height:scrlListHt,'max-height':'350px'});
    }
    $('.opmAccListChk > ul').off().on("click","li",function(e){
        if(!$(this).hasClass('active') && !$(this).hasClass('chkDisabled') && !$(e.target).closest('.opmAccListChkChild').length){
            if($(this).index()==0){
                $(this).removeClass('noActive');
            }else{
                $('.opmAccListChk > ul > li:first-child').addClass('noActive');
            }
            $('.opmAccListChk > ul > li').removeClass('active');
            $(this).addClass('active');
            $('.opmAccListChk').removeAttr('style').css({height:$(this).find('ul')[0].scrollHeight,'max-height':'350px'}); //No I18N
        }
    });

    $('.opmAccListChk .chk:not(.chkParent)').off().click(function() {
        var totLstCnt= ($(this).parent().parent().parent().parent().find('.chk:not(.chkParent)')).length;
        var selLstParent = $(this).parent().parent().parent().parent();
        var selLstCnt = ($(selLstParent).find('input:checkbox:not(".chkParent"):checked')).length;
        if(totLstCnt == selLstCnt) {
            $(selLstParent).find('.chkParent').prop('checked',true); //No I18N
        }else{
            $(selLstParent).find('.chkParent').prop('checked',false); //No I18N
        }

        var allChkCnt= $('.opmAccListChk').find('.chk:not([disabled="disabled"])').length;
        var allCheckedChkCnt = $('.opmAccListChk .chk:checkbox:checked').length;
        if(allChkCnt == allCheckedChkCnt) {
            $('#credentials').prop('checked',true); //No I18N
        }else{
            $('#credentials').prop('checked',false); //No I18N
        }
        multiSelectViewList(this);
    });

    $('.opmAccListChkChild .chkParent').off().click(function() {
        if($(this).prop('checked')){
            $(this).parent().parent().parent().parent().find('input:checkbox:not(".chkParent"):not(:checked)').click();
        }else{
            $(this).parent().parent().parent().parent().find('input:checkbox:not(".chkParent")').click();
        }                   
    });

    $('#credentials').off().click(function() {
        if($(this).prop('checked')){
            $('.opmAccListChk').find('.chk:not(.chkParent):not([disabled="disabled"]):not(:checked)').click();  //No I18N
        }else{
            $('.opmAccListChk').find('.chk:not(.chkParent):not([disabled="disabled"])').click();  //No I18N
        }                   
    });
    if(OPMClient.ReportsDetailsController.selectedListForMultiSelect !== undefined) {
        populateMultiSelect(OPMClient.ReportsDetailsController.selectedListForMultiSelect);
        delete OPMClient.ReportsDetailsController.selectedListForMultiSelect;
    }
}
function opmAccListChk(){
    credChk=$('.opmAccListChk .chk');
    credFlag=0;
    credChk.each(function(){
        if(!this.checked){
        credFlag=1;
        }
    });
    if(credFlag==0){
        $('#credentials').prop('checked',true);
    }else{
        $('#credentials').prop('checked',false);
    }
}

function getMultiSelectedDevices(returnArray) {
    var list = $("input:checkbox[class='chkChild chk']:checked"); //NO I18N
    var selectedValues=[];
    for(var i=0;i<list.length;i++) {
        selectedValues.push(list[i].value);
    }
    if(returnArray) {
        return selectedValues;
    }
    return selectedValues.toString();
}

function populateMultiSelect(Ids)
{
    for(var i=0;i<Ids.length;i++) {
        $('.opmAccListChkChild input[value="'+Ids[i]+'"]').click(); //No I18N
    }
}
function searchFromMultiSelecDeviceList(str){
    $('#routerList .chkParentChild .routerName').each(function () {//No I18N
        if($(this).text().search(new RegExp(str, "i")) >= 0) {//No I18N
            $(this).closest('li').click().show();
        }else {
            $(this).closest('li').hide();
        }
    });

    var scrlListHt=$('.chkParentChild.active').find('ul')[0].scrollHeight; //No I18N
    if(scrlListHt<268){scrlListHt=268;}
    $('.opmAccListChk').css({height:scrlListHt,'max-height':'630px'});
}
function searchFromMultiSelecIntfList(str){
    $('#routerList .chkParentChild.active .intfName').each(function () {//No I18N
        if($(this).text().search(new RegExp(str, "i")) >= 0) {//No I18N
            $(this).closest('li').show();
        }else {
            $(this).closest('li').hide();
        }
        $('.opmAccListChk').removeAttr('style').css({height:$('.chkParentChild.active').find('ul')[0].scrollHeight,'max-height':'630px'}); //No I18N
    });

}
function showFileBrowse(){
    $("#fileInfo").hide();
    $("#sshKey").show();
    $('#fileInfo').attr('data-status','cleared');
}

function successMsgAndPageRedirection(response,mainRoute,route)
{
    if(response !== undefined && !$.isEmptyObject(response)){
        if(response.result !== undefined){
            opm_infoMsgs("successMsg",response.result.message);//No I18N
            $('#OpM_AlertInfo').promise().done(function(){
                mainRoute.transitionTo(route);
            });
        }
        if(response.message !== undefined){
            opm_infoMsgs("successMsg",response.message);//No I18N
            $('#OpM_AlertInfo').promise().done(function(){
                mainRoute.transitionTo(route);
            });
        }else if(response.error !== undefined){
            opm_infoMsgs("errorMsg",response.error.message);//No I18N
        }
    }
}
function showAgentMonitorIcon(){
    var hideDeployAgent  = ((( window.OPM.isMSPCentral || window.OPM.isCentralServer) && !window.OPM.isProbeSelected) || !window.OPM.isOpmPlug || window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition || !window.OPM.userPermissions.discoveryWrite);
    var deployAgentButton = '';
    if(!hideDeployAgent){
        deployAgentButton = "<div class='opmBtn addUserBtn' name='agentTitle' style='display:none' id='deployAgentButton' onclick='opm_DeployAgent();'>"+Ember.I18n.t('webclient.Deploy.Agent')+"</div>"; //No I18N
    }
    return deployAgentButton;
}
function showApplicationMonitorsIcons(){
    return "<a class='hasHelpCard hasHelpCard4 hasHelpCardHover' style='float: right;;top: 10px;' tabindex='-1'><div class='helpCard left'><div class='helpCardInfo'><div class='helpCardContent'><div><p>"+Ember.I18n.t('webclient.applnmon.saveconfiginfo',this)+"</p></div></div></div></div></a><div class='opmBtn addUserBtn' onclick='opm_bulkSave();'>"+Ember.I18n.t("webclient.button.save",this)+" "+Ember.I18n.t('webclient.cmdb.config',this)+ "</div><div class='opmBtn addUserBtn' onclick='opm_bulkEdit();'>"+Ember.I18n.t("webclient.common.skinselection.apply",this)+" "+Ember.I18n.t('webclient.cmdb.config',this)+"</div>"; //No I18N
}
function opm_DeployAgent()
{
    if(window.OPM.isDemoUser){
        opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.api.demoopmanager.notauthmsg'));//No I18N
    }else{
        settingsGlobalRoute.transitionTo("Settings.Discovery.DeployAgent");//No I18N
    }
}
function isAgentActionHidden(){
    if(!(OPMClient.SettingsAddEditController.installedAgents && OPMClient.SettingsAddEditController.installedAgents.length)) {
        return true;
    }
    return ((( window.OPM.isMSPCentral || window.OPM.isCentralServer) && !window.OPM.isProbeSelected) || !window.OPM.isOpmPlug || !window.OPM.userPermissions.discoveryWrite);
}
function getAgentActionButton(){
    if(isAgentActionHidden()){
        return '';
    }
    return "<div class='actionDropDown bgGreen w-120px' id='agentActionDropDown' tabindex='0' role='button'>"+Ember.I18n.t('webclient.action.actions',this)+"<div class='actionDropDown__list'><ul><li style='display:flex;align-items:center;line-height:normal;padding:8px 20px' onclick='opm_AgentBulkUpdate();'><em class='svgIcon size14 mr-xs' title='" + Ember.I18n.t('webclient.smartupgrade.upgrade',this) + "' data-title='"+Ember.I18n.t('webclient.smartupgrade.upgrade',this)+"'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#upgrade'></use></svg></em>"+Ember.I18n.t('webclient.smartupgrade.upgrade',this)+"</li><li onclick='opm_AgentBulkDelete();'> <i class='icon-trash delete mr-xs size12 inline-block' data-title='Delete'></i>"+Ember.I18n.t('webclient.action.delete',this)+"</li></ul></div></div>"; //No I18N
}
function opm_getSelectedAgentsForBulkAction(action)
{
    var selectedAgents = [];
    var selectedRows = [];
    if($("#agentsList").length && $("#agentsList").jqGrid){
        selectedRows = Object.values(OPMClient.SettingsAddEditController.get('selectedAgents') || {}) || []; //No I18N
        var versionMap = OPMClient.SettingsAddEditController.agentVersionMap;
        $.each(selectedRows, function(index, rowData){
            var isClearStatus = rowData.STATUS === 5 || rowData.STATUS === "5" || (rowData.STATUSMSG && rowData.STATUSMSG.toString().toLowerCase() === "clear"); //No I18N
            if(action === 'delete' && !isClearStatus){ return; } //No I18N
            if(action === 'upgrade'){ //No I18N
                if(!isClearStatus){ return; }
                var isOldVersion = false;
                if(versionMap && rowData.VERSION){
                    var isWindows = rowData.AGENT_OS && rowData.AGENT_OS.toString().toLowerCase().indexOf('windows') !== -1; //No I18N
                    var latestVersion = isWindows ? versionMap.winAgentVersion : versionMap.linAgentVersion;
                    isOldVersion = !!(latestVersion && rowData.VERSION !== latestVersion);
                }
                if(!isOldVersion){ return; }
            }
            selectedAgents.push(rowData.AGENTKEY || rowId);
        });
    }
    if(!selectedAgents.length && OPMClient.SettingsGlobalMonitors && OPMClient.SettingsGlobalMonitors.agents && OPMClient.SettingsGlobalMonitors.agents.selectedAgent){
        selectedAgents.push(OPMClient.SettingsGlobalMonitors.agents.selectedAgent);
    }
    return selectedAgents;
}
function opm_AgentBulkDelete() {
    var selectedAgents = Object.keys(OPMClient.SettingsAddEditController.get('selectedAgents') || {});  // NO I18N
    var selectedValidAgents = opm_getSelectedAgentsForBulkAction('delete'); //No I18N
    if(selectedAgents.length === 0){
        opm_infoMsgs('infoMsg',Ember.I18n.t("webclient.agent.select.validation.message")); //No I18N
        return;
    }

    if(selectedAgents.length > 0 && selectedValidAgents.length == 0) {
        opm_infoMsgs('infoMsg',Ember.I18n.t("webclient.agent.delete.validation.message")); //No I18N
        return;
    }

    opmConfirm(Ember.I18n.t('webclient.agent.confirm', this), Ember.I18n.t('webclient.agent.delete.confirm.msg', this), '', function() { //No I18N
        opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/admin/deleteAgentDetails', {selectedDevices: JSON.stringify(selectedValidAgents)}, '', function(response){ //No I18N
            showMessage(response);
            opm_SettingsGlobalMonitorsGridLoad(OPMClient.SettingsTabController.monitorName);
        });
    }, '', '', '', '', 'dialogStyle2', true, false, '', true, true); //No I18N
}
function opm_AgentSettings()
{
    settingsGlobalRoute.transitionTo("Settings.Discovery.DeployAgent.Settings");//No I18N
}
function opm_AgentBulkUpdate()
{
    var selectedAgents = Object.keys(OPMClient.SettingsAddEditController.get('selectedAgents') || {}) // NO I18N
    var selectedValidAgents = opm_getSelectedAgentsForBulkAction('upgrade'); //No I18N
    if(selectedAgents.length === 0){
        opm_infoMsgs('infoMsg',Ember.I18n.t("webclient.agent.select.validation.message")); //No I18N
        return;
    }
    if(selectedAgents.length > 0 && selectedValidAgents.length == 0) {
        opm_infoMsgs('infoMsg',Ember.I18n.t("webclient.agent.update.validation.message")); //No I18N
        return;
    }
    opmConfirm(Ember.I18n.t('webclient.agent.confirm', this), Ember.I18n.t('webclient.agent.upgrade.confirm.msg', this), '', function() { //No I18N
        opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/admin/upgradeAgent', {selectedDevices: JSON.stringify(selectedValidAgents)}, '', function(response){ //No I18N
            showMessage(response);
        });
    }, '', '', '', '', 'dialogStyle2', true, false, '', true, true); //No I18N
}
function showCustomIcons(operation,params,name){
    return "<div class='opmBtn addUserBtn' onclick='"+operation+"(&#39;"+params+"&#39;);' tabindex='0' role='button'>"+name+"</div>";//No I18N
}
function showHideDiv(name,currentVal,classToShow){
    $("input[name="+name+"]").each(function(){
       $("#"+$(this).attr('data-title')).hide();
    });
    $("#"+$(currentVal).attr('data-title')).show();
    if(classToShow!=undefined){
        $("."+classToShow).show();
    }
}

function showHideElements(showEle, hideEle) {
    if(showEle) {
        $(showEle).show();
    }
    if(hideEle) {
        $(hideEle).hide();
    }
}

function onFileSelected(evt) 
{
    var selectedFile = evt.target.files[0];
    var reader = new FileReader();
    var imgtag = document.getElementById("userprofileimg"); //No I18N
    var fsrc = "";
   
    reader.onload = function(e) 
    {
        fsrc = e.target.result;
        OPMClient.SettingsUsersController.userImageSrc = fsrc;
        if($('#cropperImg').css('display') !== undefined){
            $('#cropperImg').attr('src',fsrc);
            
        }
    };

    if(imgtag !== undefined && imgtag !== null){
        imgtag.title = selectedFile.name;
        imgtag.src = fsrc;
    }
   reader.readAsDataURL(selectedFile);
}
function getloadedimg()
{
   setImgCropper();
}

function showCorrespondingTemplate(){
    var status = $("input:radio[name=emailTemplate]:checked").val();//No I18N
    var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/oputilsadmin/getNWMEmailTemplate?status="+status);//No I18N
    $("#mailSubject").val(response.result.emailTemplateSettings.mailSubject);//No I18N
    $("#mailDescription").val(response.result.emailTemplateSettings.mailDescription);//No I18N
}
function submitSMSServerSettings(modemType, parentRoute) {
    var callBackFunc = function() {
    var rspFlag = false;
    var data = {};
    var response = {};
    if (modemType === "custom" || modemType === "smpp") { //No I18N
        var smsType;
        if (modemType === "custom") {
            data = getCustomSMSDetails();
            smsType = $('#smsProviderSelBox').val();
        } else if (modemType === "smpp") { //No I18n
            data = getSmppSMSDetails(false);
            smsType = 'SMPP' // No I18N
        }
        if ((typeof (data) === "boolean") && data === false) {
            return;
        }
        response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/addSMSSettings?smsType=" + smsType, data); //No I18N
        showMessage(response);
        rspFlag = true;

        //Model 1
        var callBackFn = function(){
            openAssociateToProbes("SMSServerSettings",true, smsType,false);//No I18N
        }
        initProbeAssociation("SETTINGS","SMSServerSettings",smsType,callBackFn);//No I18N
    }

    if (rspFlag && parentRoute !== undefined && parentRoute !== "") {
        opm_transitionToTheRoute(parentRoute);//No I18N
    }
    }
    checkIsCentralizedConfigSettingsProbeModified(callBackFunc,"SMSServerSettings");//No I18N

}
function getSmppSMSDetails(testSMS) {
    var fieldsToValidate = { 'empty': ['smppServerName', 'smppServerPort', 'smppUserName'], 'port': ['smppServerPort'] };//No I18N
    if(!OPMClient.SettingsController.smppSettingsExists) {
        fieldsToValidate.empty.push('smppPassword');
    }
    var isValid = opm_validateFields(fieldsToValidate);
    if (!isValid) {
        return isValid;
    }
    var data = {
        "smppServer": $('#smppServerName').val(),"port": $('#smppServerPort').val(),"userName": $('#smppUserName').val(),"password": $('#smppPassword').val(),"systemType": $('#smppSystemType').val(),"sourceAddress": $('#smppSourceAddr').val(),"sourceTON": $('#smppSourceAddrTON').find(":selected").val(), "sourceNPI": $('#smppSourceAddrNPI').find(":selected").val(),"destinationTON": $('#smppDestinationAddrTON').find(":selected").val(),"destinationNPI": $('#smppDestinationAddrNPI').find(":selected").val()}; //No I18N
    if (testSMS) {
        fieldsToValidate = { 'empty': ['testSMSRecipient'], 'mobileNumberWithPlusOnly': ['testSMSRecipient']}; //No I18n
        if(!opm_validateFields(fieldsToValidate)) {
            return false;
        }
        data.recipient = $('#testSMSRecipient').val();
    }
    return data;
}
function getCustomSMSDetails() {
    var isValid;
    var modemType = $('#smsProviderSelBox').val();
    var fieldsToValidate;
    var ifConfigured = false;
    var data;
    var currentGatewayObj = Ember.get(OPMClient.SettingsBasicSMSController,'currentGateway');
    if(Object.keys(currentGatewayObj).length !== 0) {
        
        ifConfigured = true;
    }
    if(modemType === "Clickatell"){
        if ($("#communicatorAccount").prop("checked")) {
            var clickatellUserName = $("#clickatellUserName").val(); //No I18N
            var clickatellPswd = $("#clickatellPswd").val(); //No I18N
            var communicatorApiId = $("#communicatorApiId").val(); //No I18N
            fieldsToValidate = { 'empty': ['clickatellUserName', 'communicatorApiId']};//No I18N
            if(clickatellPswd === '' && !ifConfigured) {
                fieldsToValidate.empty.push('clickatellPswd'); //No I18N
            }
            isValid = opm_validateFields(fieldsToValidate);
            if (!isValid) {
                return isValid;
            }
            data = {"ACCOUNT_TYPE":"Communicator","USERNAME": clickatellUserName, "PASSWORD": clickatellPswd, "API_ID": communicatorApiId}; //No I18N
        }
        else if ($("#platformAccount").prop("checked")) {
            var platformApiKey = $("#platformApiKey").val();
            isValid = opm_validateFields({ 'empty': ['platformApiKey'] }); //No I18N
            if (!isValid) {
                return isValid;
            }
            
            if ("not_to_display" === platformApiKey) {
                //platform api key masked hence send it as empty so the actual value can be taken from db
                platformApiKey = "";
            }
            data = {"ACCOUNT_TYPE": "Platform", "PLATFORM_APIKEY": platformApiKey }; //No I18N
        }
    }
    else if(modemType === "Twilio") {
        var twilioAccountSid = $("#twilioAccountSid").val();
        var twilioAuthToken = $("#twilioAuthToken").val();
        var twilioPhoneNumber = $('#twilioPhoneNumber').val();
        fieldsToValidate = { 'empty': ['twilioAccountSid','twilioPhoneNumber'],'mobileNumberWithPlusOnly':['twilioPhoneNumber'] }; //No I18N
        if(twilioAuthToken === '' && !ifConfigured) {
            fieldsToValidate.empty.push('twilioAuthToken'); //No I18N
        }                       
        isValid = opm_validateFields(fieldsToValidate); //No I18N
        if (!isValid) {
            return isValid;
        }
        data = {"ACCOUNT_SID": twilioAccountSid, "AUTH_TOKEN": twilioAuthToken,"TWILIO_PHONE_NUMBER": twilioPhoneNumber }; //No I18N
    }
    else if(modemType === "SMSEagle") {
        var smsEagleServer = $("#smsEagleServer").val();
        var smsEagleUserName = $("#smsEagleUserName").val();
        var smsEaglePswd = $('#smsEaglePswd').val();
        fieldsToValidate = { 'empty': ['smsEagleServer','smsEagleUserName'],'noSpaceCheck':['smsEagleServer'] }; //No I18N
        if(smsEaglePswd === '' && !ifConfigured) {
            fieldsToValidate.empty.push('smsEaglePswd'); //No I18N
        }
        isValid = opm_validateFields(fieldsToValidate);
        if (!isValid) {
            return isValid;
        }
        data = {"SERVER_NAME": smsEagleServer, "USERNAME": smsEagleUserName,"PASSWORD": smsEaglePswd }; //No I18N
    }
    else if(modemType === "Custom") {
        var customSMSUrl = $('#customSMSUrl').val();
        var httpRequestParameters = $('#httpRequestParameters').val();
        fieldsToValidate = { 'empty': ['customSMSUrl','httpRequestParameters'],'noSpaceCheck':['customSMSUrl'] }; //No I18N
        if($('#basicAuth').is(':checked')){
            fieldsToValidate.empty.push('authUserName'); //No I18N
            if(currentGatewayObj.username === ''){
                fieldsToValidate.empty.push('authPassword');//No I18N
            }
        }
        else{
            $('#authUserName').val('');
            $('#authPassword').val('');
        }
        isValid = opm_validateFields(fieldsToValidate);
        if (!isValid) {
            return isValid;
        } 
        data = {
            "method": $('#httpMethod').val(), //No I18n
            "url": customSMSUrl, //No I18n
            "requestParams": httpRequestParameters, //No I18n
            "headers": ($('#httpRequestHeaders').val()).trim(), //No I18n
            "contentType":$('#contentTypeSelBox').val(), //No I18n
            "unicode": $('#sendUnicodeChars').prop('checked')?true:false, //No I18n
            "authtype":$("input[type=radio][name=authTypeRadio]:checked").val(), //No I18N
            "username":$('#authUserName').val(), //No I18n
            "password":$('#authPassword').val() //No I18n
        };
    }
    return data;
}
function probeDownloadLink(){
    return "<div class='opmBtn'><a href='"+OPMClient.SettingsConfigurationController.enterpriseDownloadLink+"' target='_blank'>"+Ember.I18n.t('webclient.go.probe',this)+"</a></div>";//No I18N
}
function updateCleanUpSettings(cleanupURL,tool){
    var count = $("#COUNT").val();
    var noOfLinesInFile = $("#NUMBEROFLINES").val();
    var noOfFile = $("#MAINTAIN_NUMBER_OF_FILE").val();
    var fieldsToValidate = {'empty':['COUNT','NUMBEROFLINES','MAINTAIN_NUMBER_OF_FILE']};//No I18N
    /*if(tool === "IPAM"){//No I18N
        fieldsToValidate.empty.push('auditDir');//No I18N
    }*/
    fieldsToValidate.positive = ['COUNT'];//No I18N
    var noofLines = trimAll($("#NUMBEROFLINES").val());
    var noOfFile = trimAll($("#MAINTAIN_NUMBER_OF_FILE").val());
    fieldsToValidate.custom = [{'condition':(noofLines < 5000 || noofLines > 50000), 'identifier':'NUMBEROFLINES', 'message':Ember.I18n.t('opu.common.ALERT_FILE_NO_OF_LINE_CANNOT_EXCEED_50000',this)},{'condition':(noOfFile > 50), 'identifier':'MAINTAIN_NUMBER_OF_FILE', 'message':Ember.I18n.t('opu.common.ALERT_NO_OF_FILE_CANNOT_EXCEED_50',this)}];//No I18N
    if(!opm_validateFields(fieldsToValidate)){
        return false;
    }
    var urlSign = opm_checkIndexOf(cleanupURL,"?") ? "&" : "?"; // NO I18N
    cleanupURL  = cleanupURL + urlSign + "COUNT="+count+"&NUMBEROFLINES="+noOfLinesInFile+"&MAINTAIN_NUMBER_OF_FILE="+noOfFile;//NO I18N
    if($("#historyStatus").prop("checked")){
        cleanupURL += "&HISTORY_STATUS=1";//NO I18N
    }else{
        cleanupURL += "&HISTORY_STATUS=0";//NO I18N
    }
    if(tool === "IPAM"){
        var auditMonth = $("#auditMonth").val();
        // var auditDir = $("#auditDir").val();
        var ipHistoryMonth = $("#ipHistoryMonth").val();
        cleanupURL += "&auditMonth="+auditMonth+"&ipHistoryMonth="+ipHistoryMonth;//No I18N
    }
    var response = opm_ajaxPostRequest(cleanupURL);
    showOpUtilsResponse(response,"","","",Ember.I18n.t('opu.common.YOUR_CHANGES_HAVE_BEEN_SAVED',this));//No I18N
}

function showScanResults(value){
    $("#scanResults").hide();
    if(value === "1"){//No I18N
        $("#noOfBackUp").attr('disabled',true);//No I18N
    }else{
        $("#noOfBackUp").attr('disabled',false);//No I18N
        if(OPMClient.SettingsOpUtilConfigController.tool === "SPM"){//No I18N
            $("#scanResults").show();
        }
    }
}

function enableDisablePublish(){
    var status = $("#backupHistory").prop("checked");//No I18N
    if(status){
        $(".toDisable").prop('disabled',false);
    }else{
        $(".toDisable").prop('disabled',true);
    }
}

function toggleWordsInMandateCommand(tableName){
    if(tableName=="columnFor" || tableName == "columnFor1"){
        var selectElement = document.getElementById(tableName);
        var selectedOption = selectElement.options[selectElement.selectedIndex];
        tableName = selectedOption.getAttribute('data-tablename'); //No I18N
    }
    var mandateLabel = document.getElementById('mandateFieldWords');
    switch (tableName) {
       case "IPAMIPLevelCustomField"://No I18N
           mandateLabel.textContent = Ember.I18n.t('opu.common.customcolumn.mandate',{field:Ember.I18n.t('opu.views.ipdetails',this)});//No I18N
           if(OPMClient.SettingsOpUtilConfigController.operation === "Add"){//No I18N
               $("#isColorCodeDiv").hide();
               $("#colorCodeSelectText").hide();
               $("#isColorCodeCheckBox").prop("checked",false);
               $("#dataType").attr("disabled",false);//No I18N
           }
           break;
       case "SubnetLevelCustomField"://No I18N
           mandateLabel.textContent = Ember.I18n.t('opu.common.customcolumn.mandate',{field:Ember.I18n.t('opu.views.SUBNET_DETAILS',this)});//No I18N
           if(OPMClient.SettingsOpUtilConfigController.operation === "Add"){//No I18N
               Ember.set('OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.arrayIcons',[]);//NO I18N
               OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode.clear();
               $('#isColorCodeDiv').show();
               $("#isColorCodeCheckBox").prop("checked",false);
            }
           break;
       case "SPMPortLevelCustomField"://No I18N
           mandateLabel.textContent = Ember.I18n.t('opu.common.customcolumn.mandate',{field:Ember.I18n.t('webclient.opm.meraki.msportsDetails',this)});//No I18N
           break;
       case "SPMSwitchLevelCustomField"://No I18N
           mandateLabel.textContent =  Ember.I18n.t('opu.common.customcolumn.mandate', {field:Ember.I18n.t('opu.common.switch.details',this)});//No I18N
    }
}

function toggleDatatype(){
    var datatype = $("#dataType").val();
    $("#defVal").show();
    $("#defBooleanVal").hide();
    $("#size").prop("disabled",false);
    if(datatype === "Text,1"){//No I18N
//        $("#size").val("50");//No I18N
        $("#isMandatoryCheckBoxDiv").css("display","block");
        $("#multipleCustomValues").val("");
        $("#customDefaultOption").css("display","block");
        $("#customDefaultValuesRow").css("display","none");
        $("#customSelectBox").empty().select2();
        $("#defaultValue").val("");
    }else if(datatype === "Numeric,2"){//No I18N
//        $("#size").val("4");//No I18N
        $("#isMandatoryCheckBoxDiv").css("display","block");
        $("#multipleCustomValues").val("");
        $("#customDefaultOption").css("display","block");
        $("#customDefaultValuesRow").css("display","none");
        $("#customSelectBox").empty().select2();
        $("#defaultValue").val("");
    }else if(datatype === "Boolean,3"){//No I18N
//        $("#size").val("1");//No I18N
//        $("#size").prop("disabled",true);
        $("#isMandatoryCheckBoxDiv").css("display","none");
        $("#defVal").hide();
        $("#defBooleanVal").show();
        $("#multipleCustomValues").val("");
        $("#customDefaultOption").css("display","none");
        $("#customSelectBox").empty().select2();
        $("#defaultValue").val("");
    }
    else if(datatype === "List,4"){
        $("#defBooleanVal").css("display","none");
        $("#defVal").val("");
        $("#defVal").css("display","none");
        $("#isMandatoryCheckBoxDiv").css("display","block");
        $("#customDefaultOption").css("display","block");
        $("#customDefaultValuesRow").css("display","block");
        $("#customSelectBox").empty().select2();
        $("#defaultValue").val("");
    }
}


function createDropdownFromText(isCreate, defaultvalue){
    var textField = document.getElementById('multipleCustomValues');
    var selectElement = document.getElementById('customSelectBox');
    selectElement.innerHTML = '';
    var textValue = textField.value;
    var optionsList = textValue.split(",").map(function(eachOption) {
        return eachOption.trim().replace(/\s+/g, ' ');
    });
    if($('#isColorCodeCheckBox').prop("checked")){
        var colorNameAndCode = new Map();
        var existColorNameAndCode =OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode;
    }
    var uniqueOptions = [];
    var options =[];
    if(textValue!=undefined && textValue.length>0){
        options.push({id:"",text:Ember.I18n.t('opm.selectvalue',this),selected:true});
    }
    for (var ind =0 ; ind < optionsList.length ; ind++) {
        var lowerWord = optionsList[ind].toLowerCase();
        if (!uniqueOptions.includes(lowerWord) && optionsList[ind].length > 0) {
            uniqueOptions.push(lowerWord);
            var isSelected = false;
            if(!isCreate && defaultvalue!=undefined && defaultvalue == optionsList[ind] ){
                isSelected = true;
            }
            options.push({id:optionsList[ind],text:optionsList[ind],selected:isSelected})
            if($('#isColorCodeCheckBox').prop("checked")){
                var existColorHexCode =existColorNameAndCode!=undefined?existColorNameAndCode.get(optionsList[ind]):false;
                if(existColorHexCode){
                    colorNameAndCode.set(optionsList[ind],existColorHexCode);
                }
                else{
                    colorNameAndCode.set(optionsList[ind],"");
                }
            }
        }
    }
    $("#customSelectBox").select2('destroy').empty().select2({
        minimumResultsForSearch: 10,
        data: options
    });
}

function addCustomColumn(url, tool){
    var fieldsToValidate = {'empty':['columnName'],'opu_customFieldValidation':['defaultValue'],'isAlphaNumericDotDashAtOpU': ['desc','multipleCustomValues'],'customColumnName':['columnName'],'nonnegative':[]};//No I18N
    var dataType = trimAll($('#dataType').val());//No I18N
    var columnName = $("#columnName").val();//No I18N
    var isMandatoryField = $("#isMandatoryField").prop("checked");
    if(dataType === "Numeric,2")
    {
//        fieldsToValidate.empty.push("defaultValue");
        fieldsToValidate.nonnegative.push("defaultValue");
    }
    if(!opm_validateFields(fieldsToValidate)){
        return false;
    }
   
    var defaultVal = trimAll($("#defaultValue").val());//No I18N
    if(dataType === "Boolean,3"){//No I18N
        defaultVal = trimAll($("#defaultBooleanValue").val());//No I18N
    }
    var isCustomDefaultValue  = (dataType=="List,4");//No I18N
    var allowedValues = "";
    var optionsSet = [];
    if(isCustomDefaultValue){
       defaultVal = $("#customSelectBox").val();
       allowedValues = $("#multipleCustomValues").val().trim();
       if(allowedValues === undefined || allowedValues==null || allowedValues.replace(/,/g, '').replace(/\s+/g, '') === "" ){//No I18N
           $("#multipleCustomValues").addClass('validateField error');//No I18N
           $("#multipleCustomValues").attr('data-error',Ember.I18n.t("webclient.this.field.cannotempty",this));//No I18N
           $("#multipleCustomValues").focus();
               opmValidate($("#multipleCustomValues"));
               $('.validateField').on('focusin',function(){
                   opmValidate($(this));
               });
               $('.validateField').on('focusout',function(){
                   $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
               });
           return;
          }
       if(!opm_validateFields({"empty":["multipleCustomValues"]})){
            return;
       }
       var optionsList = allowedValues.split(",").map(function(eachOption) {
            return eachOption.trim().replace(/\s+/g, ' ');
        });
        var uniqueOptions = [];        
        for (var ind =0 ; ind < optionsList.length ; ind++) {
            var lowerWord = optionsList[ind].toLowerCase();
            if (!uniqueOptions.includes(lowerWord) && optionsList[ind].length > 0) {
                uniqueOptions.push(lowerWord);
                optionsSet.push(optionsList[ind]);
            }
        }
        allowedValues = optionsSet.join(",");
        if(OPMClient.SettingsOpUtilConfigController.operation === "Edit"){
            var previousValues = OPMClient.SettingsOpUtilConfigController.currentColumnAllowedValues;
            var deletedOrModifiedValues = [];
            previousValues.split(",").forEach(
                function(item){
                    if(!optionsSet.contains(item)){
                        deletedOrModifiedValues.push(item);
                    }
                }
            )
            if(deletedOrModifiedValues.length>0){
                if(!confirm(Ember.I18n.t("opu.common.customValues.alertmsg"))){//No I18N
                    return;
                }
            }
        }
    }
    var column = "columnFor";//No I18N
    if(tool === "SPM"){//No I18N
        column = "columnFor1";//No I18N
    }
    var tableId = $('#'+column).val();//No I18N
    var tableName = $('#'+column+' option[value="'+tableId+'"]').attr('data-tablename');//No I18N
    var colorCode = [];
    var isColorCodeSelected = "false";
    if(tableName == "SubnetLevelCustomField"){
        if($('#isColorCodeCheckBox').prop("checked")){
            isColorCodeSelected = "true";
            for(var ind =0 ; ind < optionsSet.length ; ind++){
                colorCode.push(getColorCode($("#colorColumn_"+ind+" .colorBox").css("background-color")));
            }
        }
        else if(OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.isCurrentColumnHasColorCode){
            for(var ind =0 ; ind < optionsSet.length ; ind++){
                var colorHexCode = "#000000";
                if(OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode!=undefined){
                    colorHexCode = OPMClient.SettingsOpUtilConfigController.subnetIconColorCode.colorNameAndCode.get(optionsSet[ind]);
                }
                if(colorHexCode==undefined){
                    colorHexCode = "#000000";
                }
                colorCode.push(colorHexCode)
            }
        }
    }

    var desc = $("#desc").val();
    var params ={};
    if(dataType!=undefined && columnName!=undefined){
        params.dataType = dataType;
        params.columnName = columnName;
    }
    if(isCustomDefaultValue && allowedValues !=undefined && allowedValues.length > 0){
        params.allowedValues = allowedValues;
    }
    if(defaultVal !== undefined ){
        params.defaultValue = defaultVal;
    }
    if(isMandatoryField!=undefined){
        params.isMandatory = isMandatoryField;
    }
    if(desc !== undefined && desc.length >0){
        params.desc = desc;
    }

    if(tool==="IPAM"){
       params.isColorCodeSelected=isColorCodeSelected;
    }
    params.tableName = tableName;
    params.tableID = tableId;
    if(colorCode != undefined && colorCode.length>0){
        params.colorCode=JSON.stringify(colorCode);
    }
    var calb = function(response){
        var a=response;
        if(typeof(response)=="string")
        {
             a=JSON.parse(response);
        }
        if(a.status === "Success")
        {
            opm_infoMsgs("successMsg",Ember.I18n.t('webclient.cstm.colmn',this)+" "+Ember.I18n.t('mediatrace.Success',this));//No I18N
            opm_cancel("Settings.OpUtils."+tool+".Custom");//No I18N
            listCustomColumns(tool)
            getOpUtilsCustomColumnNames();
            getOpUtilsCustomColumnDetails();
        }
        else if(a.status==="Failure")
        {
            opm_infoMsgs('errorMsg',a.message);//No I18N
        }
        else
        {
            opm_infoMsgs('errorMsg',a.error.message);//No I18N
        }
    }
    opm_ajaxPostRequestWithMsg(url,params,"",calb);
}

function updatePublish(publishURL,publishData, tool){
    var ipampubenable="&enablePublish=0";//No I18N
    var enablePublish = false;
    var fieldsToValidate = {'empty':[]};//No I18N
    if($("#backupHistory").prop("checked")) {//No I18N
        enablePublish = true;
        if(tool === "IPAM"){//No I18N
            ipampubenable="&enablePublish=1";//No I18N
        }
    }
    publishData = publishData + ipampubenable.substr(1);
    var fileType  = $('#publishType').val();//NO I18N
    var backupType = $('input:radio[name=maintainType]:checked').val();//NO I18N
    var backupTypeByGroup = $('#SPMPublishReportBy').val();//NO I18N
    var noOfBackUp = $("#noOfBackUp").val();//No I18N
    if(backupType === "2") {//No I18N
       fieldsToValidate.empty.push('noOfBackUp');//No I18N
    }
    else{
        backupTypeByGroup="1";//No I18N
    }
    var publishPath = trimAll($("#userSpecifyDir").val());//No I18N
    
    if(!opm_validateFields(fieldsToValidate)){
        return false;
    }
    if(tool === "SPM"){//No I18N
        var createMasterFileTrace ="&createMasterFile=false";//NO I18N
        if($("#createMasterFile").prop("checked")) {//No I18N
              createMasterFileTrace = "&createMasterFile=true";//NO I18N
        }
        publishData += createMasterFileTrace;
        if((OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.masterCsvFlag==="1" && !($("#createMasterFile").prop("checked"))) || (OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.masterCsvFlag==="0" && ($("#createMasterFile").prop("checked")))){
            publishData +=  "&createMasterFileTrace=createMasterFileTrace";//NO I18N
        }
    }
    
    if((OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.enablePublish !== "enabled" && enablePublish) || (OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.enablePublish === "enabled" && !enablePublish)){
        publishData +=  "&backupHistoryTrace=backupHistoryTrace";//NO I18N
    }

    var selectedcols = "";//No I18N
    $('#selectedReport option').each(function(){
        selectedcols +=","+this.value;//NO I18N
    });
    selectedcols = selectedcols.substring(1,selectedcols.length);
    publishData += "&backupHistory="+enablePublish+"&fileType="+fileType+"&backupType="+backupType+"&noOfBackUp="+noOfBackUp+"&selectedColumnforpublish="+selectedcols+"&HistoryBackUpType="+backupTypeByGroup; //NO I18N
    var response = opm_ajaxPostRequest(publishURL,publishData);
    if(tool === "SPM"){//No I18N
        OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.masterCsvFlag="0";//NO I18N
        if($("#createMasterFile").prop("checked")) {//No I18N
            OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.masterCsvFlag="1";//NO I18N
        }
    }
    OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.enablePublish="disabled";//NO I18N
    if(enablePublish){
        OPMClient.SettingsOpUtilConfigController.SPMSettingsValues.enablePublish="enabled";//NO I18N
    }
    showOpUtilsResponse(response,"","","",Ember.I18n.t('opu.common.YOUR_CHANGES_HAVE_BEEN_SAVED',this));//No I18N
}

function getPublishSettings(url, tool){
    var response = opm_ajaxGetResponse(url);
    var response = response.result.publishSettings;  
    OPMClient.SettingsOpUtilConfigController.SPMSettingsValues=response;
    var isDisabled = response.enablePublish;
    if(isDisabled == "enabled"){//No I18N
        $("#backupHistory").prop("checked", true);//No I18N
    }
    enableDisablePublish();
    $.each(response.publishColumns.AvailableColumns,function(key,val){
        $("<option value='"+val.value+"'>"+val.display+"</option>").appendTo("#availableReport");//No I18N
    });
    $.each(response.publishColumns.SelectedColumns,function(key,val){
        $("<option value='"+val.value+"'>"+val.display+"</option>").appendTo("#selectedReport");//No I18N
    });
    $("#noOfBackUp").val(response.publishBackUpCount);
    
    if(response.publishBackupType ==="2"){
        $('input:radio[name=maintainType][value="2"]').prop("checked",true);

        showScanResults("2")
        if(OPMClient.SettingsOpUtilConfigController.tool === "SPM"){//No I18N
            if(response.publishMaintainType == "1"){
                $("#SPMPublishReportBy").select2().val("1").trigger("change");//No I18N
                response.publishViewPath = response.publishViewPath+"ByDate";//No I18N
            }else{
                $("#SPMPublishReportBy").select2().val("2").trigger("change");//No I18N
                response.publishViewPath = response.publishViewPath+"ByGroup";//No I18N
            }
        }
    }
    else{
        showScanResults("1")
    }
    $("#maintainType").select2().val(response.publishBackupType).trigger("change");//No I18N
    $("#publishType").select2().val(response.publishFileType).trigger("change");//No I18N
    if(response.masterCsvFlag === "1"){//No I18N
     $("#createMasterFile").prop("checked", true);//No I18N
    }
    $("#userSpecifyDir").val(response.publishPath)
}

function isHour(str){
        str = trimAll(str);
        if(str==""){//No I18N
                return false;
        }
        var regEx = /^[0-9]+$/;//No I18N
        if(regEx.test(str)){
                if(str <= 23){
                        return true;
                }
        }
        return false;
}

function isMinute(str){
        str = trimAll(str);
        if(str==""){//No I18N
                return false;
        }
        var regEx = /^[0-9]+$/;//No I18N
        if(regEx.test(str)){
                if(str <= 59){
                        return true;
                }
        }
        return false;
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
function opu_scanAD(){
    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ipam/scanAllActiveDirectory');//No I18N
    showOpUtilsResponse(response,"oputils_listAD","","",Ember.I18n.t("opu.spm.SCAN_STARTED_SUCCESSFULLY",this));//No I18N
}
function openImageEditPage(e,route)
{  
    if (e.target.files[0] && e.target.files[0].name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
        if (e.target.files[0].size > 2097152) {
            alert(Ember.I18n.t('webclient.settings.uploadImage.alert.fileSize', this)); //No I18N
        }
        else{
            OPMClient.SettingsAddEditController.outputSlideView = 'imageCrop';//No I18N
            opm_transitionToTheRoute(route);
            onFileSelected(e);
        }
    }
    else{
        alert(Ember.I18n.t('webclient.settings.uploadImage.alert.notAnImage', this)); //No I18N
    }
}
var trapMatchRows = 1;
var trapRearmRows = 1;
function addMatchCriteria()
{
    var matchTxt = trim($('#matchValue').val());
    var varbind = $('#matchVar option:selected').val();
    var cnd = $('#matchCondition option:selected').val();
    
    if(matchTxt !== "" && matchTxt !== null){
        
        var newRow = $('#CriteriaDivToClone').clone();
        $('#matchCriteriaDiv').append(newRow);
        $(newRow).show();
        $(newRow).attr("id","matchCri"+trapMatchRows);

        $("#matchCri"+trapMatchRows+" :input[type='text']").attr('id',"matchCriVal"+trapMatchRows);//No I18N
        $("#matchCri"+trapMatchRows + " select").each(function(i) {
            var ids=$(this).attr("id");
            $(this).attr("id","match"+ids+trapMatchRows);
            $(this).addClass('select2');
        });

        $('#matchCriVarbind'+trapMatchRows).val(varbind);
        $('#matchCriCnd'+trapMatchRows).val(cnd);
        $('#matchCriVal'+trapMatchRows).val(matchTxt);
        $('#matchValue').val('');
        $('.select2').select2();
        trapMatchRows++;
    }else{
        $("#matchValue").addClass('validateField error');//No I18N
        $("#matchValue").attr('placeholder',Ember.I18n.t('webclient.admin.traps.emptyval.match'));//No I18N
        $("#matchValue").focus();
    }
}
function removeMatchCriteria(e)
{
    var parentDiv = $(e).parent().parent().parent().attr("id");//No I18N
    if(parentDiv.indexOf("match") !== -1){
        trapMatchRows=trapMatchRows-1;

    }else{
        trapRearmRows=trapRearmRows-1;
    }
    $(e).parent().parent().parent().remove();
}
function addRearmCriteria()
{
    var rearmTxt = trim($('#rearmValue').val());
    var varbind = $('#rearmVarbind option:selected').val();
    var cnd = $('#rearmCnd option:selected').val();
    
    if(rearmTxt !== "" && rearmTxt !== null){
        trapRearmRows++;
        var newRow = $('#CriteriaDivToClone').clone();
        $('#rearmCriteriaDiv').append(newRow);
        $(newRow).show();
        $(newRow).attr("id","rearmCri"+trapRearmRows);

        $("#rearmCri"+trapRearmRows+" :input[type='text']").attr('id',"rearmCriVal"+trapRearmRows);//No I18N
        $("#rearmCri"+trapRearmRows + " select").each(function(i) {
            var ids=$(this).attr("id");
            $(this).attr("id","rearm"+ids+trapRearmRows);
            $(this).addClass('select2');
        });

        $('#rearmCriVarbind'+trapRearmRows).val(varbind);
        $('#rearmCriCnd'+trapRearmRows).val(cnd);
        $('#rearmCriVal'+trapRearmRows).val(rearmTxt);
        $('#rearmValue').val('');
        $('.select2').select2();
        trapRearmRows++;
    }else{
        $("#rearmValue").addClass('validateField error');//No I18N
        $("#rearmValue").attr('placeholder',Ember.I18n.t('webclient.admin.traps.emptyval.rearm'));//No I18N
        $("#rearmValue").focus();
    }
}
function setTrapCriteriaList(arr,str){

    $.each(arr,function(index,obj){
        var newRow = $('#CriteriaDivToClone').clone();//No I18N
        $('#'+str+'CriteriaDiv').append(newRow);//No I18N
        $(newRow).show();
        $(newRow).attr("id",str+"Cri"+trapRearmRows);//No I18N
        $("#"+str+"Cri"+trapRearmRows+" :input[type='text']").attr('id',str+"CriVal"+trapRearmRows); //No I18N
        //$("#"+str+"Cri"+trapRearmRows+" select :first").attr('id',str+"CriVarbind"+trapRearmRows);//No I18N
        $("#"+str+"Cri"+trapRearmRows).find('select')[0].setAttribute('id',str+"CriVarbind"+trapRearmRows);//No I18N
        //$("#"+str+"Cri"+trapRearmRows+" select :last").attr('id',str+"CriCnd"+trapRearmRows);//No I18N
        $("#"+str+"Cri"+trapRearmRows).find('select')[1].setAttribute('id',str+"CriCnd"+trapRearmRows);//No I18N

        $('#'+str+'CriVarbind'+trapRearmRows).val(obj.VarBindNo);//No I18N
        $('#'+str+'CriCnd'+trapRearmRows).val(obj.MatchCondition);//No I18N
        $('#'+str+'CriVal'+trapRearmRows).val(obj.Message);//No I18N
        $('#'+str+'CriVarbind'+trapRearmRows).addClass('select2');//No I18N
        $('#'+str+'CriCnd'+trapRearmRows).addClass('select2');//No I18N
        trapRearmRows++;
    });
}
function initializeCredentialAcc(){
    $('.opmAccListChk > ul').on("click","li",function(e){
        if(!$(this).hasClass('active') && !$(this).hasClass('chkDisabled') && !$(e.target).closest('.opmAccListChkChild').length){
            if($(this).index()==0){
                $(this).removeClass('noActive');
            }else{
                $('.opmAccListChk > ul > li:first-child').addClass('noActive');
            }
            $('.opmAccListChk > ul > li').removeClass('active');
            $(this).addClass('active');
            prntListHt=$('.opmAccListChkPrnt').height();
            scrlListHt=$(this).find('ul')[0].scrollHeight;
            if(scrlListHt>prntListHt){
                $('.opmAccListChk').css({height:scrlListHt});
            }else{
                $('.opmAccListChk').css({height:prntListHt});
            }
        }
    });

    //credentials select all
    $('#credentials').change(function(){
        that=$('.opmAccListChk .chk');
        if(this.checked){
            that.each(function(){this.checked=true;});
        }else{
            that.each(function(){this.checked=false;});
        }
    });
    //credentials onclick input.chk checks respective input & to uncheck '#credentials' input
    $('.opmAccListChk').on("click",".chk",function(){

        opmAccListChk();
        if(!$(this).hasClass('chkParent')){
            childChk=$(this).parent().parent().parent().parent().find('.chk:not(.chkParent)');
            childFlag=0;
            childChk.each(function(){
                if(!this.checked){
                childFlag=1;}
            });
            if(childFlag==0){
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
            }else{
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
            }
            opmAccListChk();
        }
    });

    //credentials chkParent select all chkChild
    $('.opmAccListChk').on("click",'.chkParent',function(){
        that=$(this).parent().parent().parent().parent().find('.chk:not(.chkParent)');
        if(this.checked){
            that.prop('checked',true); //No I18N
        }else{
            that.prop('checked',false); //No I18N
        }
        opmAccListChk();
    });

}
function opu_initializeCredentialAcc(){
    $('.opmListChk > ul').on("click","li",function(e){
        if(!$(this).hasClass('active') && !$(this).hasClass('chkDisabled') && !$(e.target).closest('.opmAccListChkChild').length){
            if($(this).index()==0){
                $(this).removeClass('noActive');
            }else{
                $('.opmAccListChk > ul > li:first-child').addClass('noActive');
            }
            $('.opmAccListChk > ul > li').removeClass('active');
            $(this).addClass('active');

            prntListHt=$('.opmAccListChkPrnt').height();
            scrlListHt=$(this).find('ul')[0].scrollHeight;
            if(scrlListHt>prntListHt){
                $('.opmListChk').css({height:scrlListHt});
            }else{
                $('.opmListChk').css({height:prntListHt});
            }
        }
    });

    //credentials select all
    $('#credentials').change(function(){
        that=$('.opmChckList .chk');
        if(this.checked){
            that.each(function(){this.checked=true;});
        }else{
            that.each(function(){this.checked=false;});
        }
    });
    //credentials onclick input.chk checks respective input & to uncheck '#credentials' input
    $('.opmChckList').on("click",".chk",function(){
//        opmAccListChk();
        if(!$(this).hasClass('chkParent')){
            childChk=$(this).parent().parent().parent().parent().find('.chk:not(.chkParent)');
            childFlag=0;
            childChk.each(function(){
                if(!this.checked){
                childFlag=1;}
            });
            if(childFlag==0){
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
            }else{
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
            }
        OPMClient.InventoryOpUtilsController.set("selCredCount",$("#credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
        }
    });

    //credentials chkParent select all chkChild
    $('.opmChckList .chkParent').off("click"); //No I18n
        $('.opmChckList').on("click",'.chkParent',function(){
            that=$(this).parent().parent().parent().find('ul .chk');
            if(this.checked){
                that.prop('checked',true); //No I18N
            }else{
                that.prop('checked',false); //No I18N
            }
            OPMClient.InventoryOpUtilsController.set("selCredCount",$("#credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
        });

}
function opm_AddDevinitializeCredentialAcc(){

    //credentials select all
    $('#Allcredentials').change(function(){
        that=$('.chk');
        if(this.checked){
            that.each(function(){this.checked=true;});
        }else{
            that.each(function(){this.checked=false;});
        }
    });

     //credentials onclick input.chk checks respective input & to uncheck '#credentials' input
     $('.opmChckList .chk').off("click"); //No I18n
     $('.opmChckList').on("click",".chk",function(){
        //opmAccListChk();
        if(!$(this).hasClass('chkParent')){
           childChk=$(this).parent().parent().parent().find('ul .chk');
            childFlag=0;
            childChk.each(function(){
                if(!this.checked){
                childFlag=1;}
            });
            if(childFlag==0){
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
            }else{
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
            }
        }
        OPMClient.SettingsTabController.set("selCredCount",$("#credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    $('.opmChckList .checkBoxAccr').find('ul').slideUp();

    //credentials chkParent select all chkChild
    $('.opmChckList .chkParent').off("click"); //No I18n
    $('.opmChckList').on("click",'.chkParent',function(){
        that=$(this).parent().parent().parent().find('ul .chk');
        if(this.checked){
            that.prop('checked',true); //No I18N
        }else{
            that.prop('checked',false); //No I18N
        }
        OPMClient.SettingsTabController.set("selCredCount",$("#credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    //Credential search
    $("#credentialSearch").keyup(function () {
        var searchString = $(this).val();
        listSearch(searchString,"credentialsList");//No I18N
    });

    //Credential accordion
    $('.opmChckList .checkBoxAccr').off("click"); //No I18n
    $('.opmChckList .checkBoxAccr').on('click', '.opmCheckBoxAccrBtn', function (e) {
        if(!$(e.target).closest('.checkBoxAccr .opmCheckBoxAccrBtn input').length){
            if (!$(this).hasClass('active')) {
                $(this).removeClass('active').find('ul').slideUp();
                $(this).addClass('active').parent().find('ul').slideDown();
                $(this).removeClass('icon-down-dir').addClass('icon-up-dir');
            } else {
                $(this).removeClass('active').parent().find('ul').slideUp();
                $(this).removeClass('icon-up-dir').addClass('icon-down-dir');
            }
        }
    });

    $('#credSearch').off("click"); //No I18n
    $('#credSearch').on('click',function() //No I18n
    {
        if($('.srch').is(":visible")) {
            $('.srch').slideUp();
        } else  {
            $('.srch').slideDown();
        }
    });

    //Adjust Credential box for screen height size.
    if(!OPMClient.SettingsAddDeviceController.isCredentialEmpty && !OPMClient.SettingsAddDeviceController.isSingleCredential && $('.list.credList')[0] !== undefined)
    {
        var totalscreenheight = ($('.opmFormHolder.addDeviceForm').outerHeight()-132)-($('.addDeviceInputs').outerHeight()+$('.addDeviceActions').outerHeight()); //No I18n
        var credScrollHeight = $('.list.credList')[0] ?  $('.list.credList')[0].scrollHeight : 0; //No I18n
        if(totalscreenheight <= credScrollHeight ) 
        {
           $('.list.credList').css({"max-height":totalscreenheight});  //No I18n
        }
        else
        {
            $('.list.credList').css({"max-height":'250px'}); //No I18n
        }
      
    }
}

function opm_SDNinitializeCredentialAcc(){

     //credentials onclick input.chk checks respective input & to uncheck '#credentials' input
     $('#SDNCredential .opmChckList .chk').off("click"); //No I18n
     $('#SDNCredential .opmChckList').on("click",".chk",function(){
        //opmAccListChk();
        if(!$(this).hasClass('chkParent')){
           childChk=$(this).parent().parent().parent().find('ul .chk');
            childFlag=0;
            childChk.each(function(){
                if(!this.checked){
                childFlag=1;}
            });
            if(childFlag==0){
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
            }else{
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
            }
        }
        OPMClient.SettingsTabController.set("selCredCount_SDN",$("#SDNCredential #credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    $('#SDNCredential .opmChckList .checkBoxAccr').find('ul').slideUp();

    //credentials chkParent select all chkChild
    $('#SDNCredential .opmChckList .chkParent').off("click"); //No I18n
    $('#SDNCredential .opmChckList').on("click",'.chkParent',function(){
        that=$(this).parent().parent().parent().find('ul .chk');
        if(this.checked){
            that.prop('checked',true); //No I18N
        }else{
            that.prop('checked',false); //No I18N
        }
        OPMClient.SettingsTabController.set("selCredCount_SDN",$("#SDNCredential #credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    //Credential search
    $("#SDNCredential #credentialSearch").keyup(function () {
        var searchString = $(this).val();
        listSearch(searchString,"credentialsList");//No I18N
    });

    //Credential accordion
    $('#SDNCredential .opmChckList .checkBoxAccr').off("click"); //No I18n
    $('#SDNCredential .opmChckList .checkBoxAccr').on('click', '.opmCheckBoxAccrBtn', function (e) {
        if(!$(e.target).closest('.checkBoxAccr .opmCheckBoxAccrBtn input').length){
            if (!$(this).hasClass('active')) {
                $(this).removeClass('active').find('ul').slideUp();
                $(this).addClass('active').parent().find('ul').slideDown();
                $(this).removeClass('icon-down-dir').addClass('icon-up-dir');
            } else {
                $(this).removeClass('active').parent().find('ul').slideUp();
                $(this).removeClass('icon-up-dir').addClass('icon-down-dir');
            }
        }
    });

    //Adjust Credential box for screen height size.
    if(!OPMClient.SettingsAddDeviceController.isCredentialEmpty && !OPMClient.SettingsAddDeviceController.isSingleCredential && $('.list.credList')[0] !== undefined)
    {
        var totalscreenheight = ($('.opmFormHolder.addDeviceForm').outerHeight()-132)-($('.addDeviceInputs').outerHeight()+$('.addDeviceActions').outerHeight()); //No I18n
        var credScrollHeight = $('.list.credList')[0] ?  $('.list.credList')[0].scrollHeight : 0; //No I18n
        if(totalscreenheight <= credScrollHeight ) 
        {
           $('.list.credList').css({"max-height":totalscreenheight});  //No I18n
        }
        else
        {
            $('.list.credList').css({"max-height":'250px'}); //No I18n
        }
    }
}

function opm_SDNSNMPinitializeCredentialAcc(){

     //credentials onclick input.chk checks respective input & to uncheck '#credentials' input
     $('#ciscoACI_SNMP .opmChckList .chk').off("click"); //No I18n
     $('#ciscoACI_SNMP .opmChckList').on("click",".chk",function(){
        //opmAccListChk();
        if(!$(this).hasClass('chkParent')){
           childChk=$(this).parent().parent().parent().find('ul .chk');
            childFlag=0;
            childChk.each(function(){
                if(!this.checked){
                childFlag=1;}
            });
            if(childFlag==0){
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
            }else{
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
            }
        }
        OPMClient.SettingsTabController.set("selCredCount_SNMP",$("#ciscoACI_SNMP #credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    $('#ciscoACI_SNMP .opmChckList .checkBoxAccr').find('ul').slideUp();

    //credentials chkParent select all chkChild
    $('#ciscoACI_SNMP .opmChckList .chkParent').off("click"); //No I18n
    $('#ciscoACI_SNMP .opmChckList').on("click",'.chkParent',function(){
        that=$(this).parent().parent().parent().find('ul .chk');
        if(this.checked){
            that.prop('checked',true); //No I18N
        }else{
            that.prop('checked',false); //No I18N
        }
        OPMClient.SettingsTabController.set("selCredCount_SNMP",$("#ciscoACI_SNMP #credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    //Credential search
    $("#ciscoACI_SNMP #credentialSearch").keyup(function () {
        var searchString = $(this).val();
        listSearch(searchString,"credentialsList");//No I18N
    });

    //Credential accordion
    $('#ciscoACI_SNMP .opmChckList .checkBoxAccr').off("click"); //No I18n
    $('#ciscoACI_SNMP .opmChckList .checkBoxAccr').on('click', '.opmCheckBoxAccrBtn', function (e) {
        if(!$(e.target).closest('.checkBoxAccr .opmCheckBoxAccrBtn input').length){
            if (!$(this).hasClass('active')) {
                $(this).removeClass('active').find('ul').slideUp();
                $(this).addClass('active').parent().find('ul').slideDown();
                $(this).removeClass('icon-down-dir').addClass('icon-up-dir');
            } else {
                $(this).removeClass('active').parent().find('ul').slideUp();
                $(this).removeClass('icon-up-dir').addClass('icon-down-dir');
            }
        }
    });

    //Adjust Credential box for screen height size.
    if(!OPMClient.SettingsAddDeviceController.isCredentialEmpty && !OPMClient.SettingsAddDeviceController.isSingleCredential && $('.list.credList')[0] !== undefined)
    {
        var totalscreenheight = ($('.opmFormHolder.addDeviceForm').outerHeight()-132)-($('.addDeviceInputs').outerHeight()+$('.addDeviceActions').outerHeight()); //No I18n
        var credScrollHeight = $('.list.credList')[0] ?  $('.list.credList')[0].scrollHeight : 0; //No I18n
        if(totalscreenheight <= credScrollHeight ) 
        {
           $('.list.credList').css({"max-height":totalscreenheight});  //No I18n
        }
        else
        {
            $('.list.credList').css({"max-height":'250px'}); //No I18n
        }
    }
}

function opm_SDNWMIinitializeCredentialAcc(){

     //credentials onclick input.chk checks respective input & to uncheck '#credentials' input
     $('#ciscoACI_WMI .opmChckList .chk').off("click"); //No I18n
     $('#ciscoACI_WMI .opmChckList').on("click",".chk",function(){
        //opmAccListChk();
        if(!$(this).hasClass('chkParent')){
           childChk=$(this).parent().parent().parent().find('ul .chk');
            childFlag=0;
            childChk.each(function(){
                if(!this.checked){
                childFlag=1;}
            });
            if(childFlag==0){
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
            }else{
                $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
            }
        }
        OPMClient.SettingsTabController.set("selCredCount_WMI",$("#ciscoACI_WMI #credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    $('#ciscoACI_WMI .opmChckList .checkBoxAccr').find('ul').slideUp();

    //credentials chkParent select all chkChild
    $('#ciscoACI_WMI .opmChckList .chkParent').off("click"); //No I18n
    $('#ciscoACI_WMI .opmChckList').on("click",'.chkParent',function(){
        that=$(this).parent().parent().parent().find('ul .chk');
        if(this.checked){
            that.prop('checked',true); //No I18N
        }else{
            that.prop('checked',false); //No I18N
        }
        OPMClient.SettingsTabController.set("selCredCount_WMI",$("#ciscoACI_WMI #credentialsList .chkChild[type=checkbox]:checked").length);//No I18N
    });

    //Credential search
    $("#ciscoACI_WMI #credentialSearch").keyup(function () {
        var searchString = $(this).val();
        listSearch(searchString,"credentialsList");//No I18N
    });

    //Credential accordion
    $('#ciscoACI_WMI .opmChckList .checkBoxAccr').off("click"); //No I18n
    $('#ciscoACI_WMI .opmChckList .checkBoxAccr').on('click', '.opmCheckBoxAccrBtn', function (e) {
        if(!$(e.target).closest('.checkBoxAccr .opmCheckBoxAccrBtn input').length){
            if (!$(this).hasClass('active')) {
                $(this).removeClass('active').find('ul').slideUp();
                $(this).addClass('active').parent().find('ul').slideDown();
                $(this).removeClass('icon-down-dir').addClass('icon-up-dir');
            } else {
                $(this).removeClass('active').parent().find('ul').slideUp();
                $(this).removeClass('icon-up-dir').addClass('icon-down-dir');
            }
        }
    });

    //Adjust Credential box for screen height size.
    if(!OPMClient.SettingsAddDeviceController.isCredentialEmpty && !OPMClient.SettingsAddDeviceController.isSingleCredential && $('.list.credList')[0] !== undefined)
    {
        var totalscreenheight = ($('.opmFormHolder.addDeviceForm').outerHeight()-132)-($('.addDeviceInputs').outerHeight()+$('.addDeviceActions').outerHeight()); //No I18n
        var credScrollHeight = $('.list.credList')[0] ?  $('.list.credList')[0].scrollHeight : 0; //No I18n
        if(totalscreenheight <= credScrollHeight ) 
        {
           $('.list.credList').css({"max-height":totalscreenheight});  //No I18n
        }
        else
        {
            $('.list.credList').css({"max-height":'250px'}); //No I18n
        }
    }
}


function opm_selectARP(selectedProtocol)    {
    if(selectedProtocol.checked && (selectedProtocol.value == 5 || selectedProtocol.value == 2))    {
        $("#discProtocolDiv input:checkbox[value=4]").prop("checked", true);
    }
}
function listCentralDetails(){
    var centralURI= window.OPM.apiUrlPattern + '/enterprise/listCentralDetails';//No I18N
    var isStandby=false;
     $.ajax({
        url: centralURI,
        type: 'GET',//No I18N
        data: opm_constructRequestData(),
        success: function(jsonData){
            var msgClass = "danger"; //No I18N
            var isPrimaryUp = false;
            $.each(jsonData.CentralDetails,function(key,value){
                if(value.Servertype == 'PRIMARY'){//No I18N
                    if(value.Status === "UP") {
                        msgClass = "success"; //No I18N
                        isPrimaryUp = true;
                    }
                    $('#primaryCentralServer').val(value.ServerName);
                    $('#primaryCentralPort').val(value.ServerPort);
                    $('#primaryProtocol').select2().val(value.Protocol).trigger("change");//No I18N
                }else if(value.Servertype == 'STANDBY'){//No I18N
                    if(value.Status === "UP") {
                        msgClass = "success"; //No I18N
                    }
                    isStandby=true;
                    $('#standbyProtocol').select2().val(value.Protocol).trigger("change");//No I18N
                    $('#standbyCentralServer').val(value.ServerName);//No I18N
                    $('#standbyCentralPort').val(value.ServerPort);//No I18N
                }
            });
            OPMClient.SettingsCentralDetailsController.set('isMultiNodeCentralDetails',undefined);//No I18N
            if(jsonData.CentralDetails.isMultiNodeEnabledInCentral) {
                var centralDetails = {};
                centralDetails.isMultiNodeEnabledInCentral = jsonData.CentralDetails.isMultiNodeEnabledInCentral;
                if(jsonData.CentralDetails.centralConnectionType === "VIRTUAL_IP") {
                    if(jsonData.CentralDetails.nodeOne !== undefined && jsonData.CentralDetails.nodeTwo !== undefined) {
                        centralDetails.displayNodeOneAndTwo = Ember.I18n.t('webclient.settings.fos.virtualIP') + ' ( ' + Ember.I18n.t('opstor.inventory.emc.isilon.node.displayname') + ' : ' + jsonData.CentralDetails.nodeOne + ' & ' + jsonData.CentralDetails.nodeTwo + ' )'; //No I18N
                    }
                    if(jsonData.CentralDetails.nodeThree !== undefined) {
                        centralDetails.displayNodeThreeAndFour = Ember.I18n.t('webclient.settings.fos.virtualIP') + ' ( ' + Ember.I18n.t('opstor.inventory.emc.isilon.node.displayname') + ' : ' + jsonData.CentralDetails.nodeThree + (jsonData.CentralDetails.nodeFour !== undefined ? ' & ' + jsonData.CentralDetails.nodeFour : '') + ' )'; //No I18N
                    }
                }
                OPMClient.SettingsCentralDetailsController.set('isPrimaryServerUp',isPrimaryUp);//No I18N
                OPMClient.SettingsCentralDetailsController.set('isMultiNodeCentralDetails',centralDetails);//No I18N
            }
            if(isStandby) {
                if(jsonData.CentralDetails.PRIMARY.Status === "UP" && jsonData.CentralDetails.STANDBY.Status === "DOWN") {
                    $("#primaryDiagnose").show();
                    $("#standbyDiagnose").hide();
                    if(jsonData.CentralDetails.isMultiNodeEnabledInCentral) {
                        $('#standbyProtocol').prop('disabled', true);//No I18N
                        $('#standbyCentralPort').prop('disabled', true);//No I18N
                    }
                } else if(jsonData.CentralDetails.PRIMARY.Status === "DOWN" && jsonData.CentralDetails.STANDBY.Status === "UP") { //No I18N
                    $("#standbyDiagnose").show();
                    $("#primaryDiagnose").hide();
                    if(jsonData.CentralDetails.isMultiNodeEnabledInCentral) {
                        $('#primaryProtocol').prop('disabled', true);//No I18N
                        $('#primaryCentralPort').prop('disabled', true);//No I18N
                    }
                } else {
                    $("#primaryDiagnose").show();
                    $("#standbyDiagnose").show();
                }
            }

            if(jsonData.CentralDetails.msg!==undefined) {
                OPMClient.SettingsCentralDetailsController.set('message',jsonData.CentralDetails.msg); //No I18N
                if(jsonData.CentralDetails.PRIMARY!==undefined) {
                    OPMClient.SettingsCentralDetailsController.set('PRIMARY',jsonData.CentralDetails.PRIMARY); //No I18N
                }
                if(jsonData.CentralDetails.STANDBY!==undefined) {
                    OPMClient.SettingsCentralDetailsController.set('STANDBY',jsonData.CentralDetails.STANDBY); //No I18N
                }
				$(".centralinfoMsg").removeClass("danger"); //No I18N
                $(".centralinfoMsg").removeClass("success"); //No I18N
                $(".centralinfoMsg").addClass(msgClass); //No I18N
            }
            OPMClient.SettingsCentralDetailsController.set('isStandbyCentral',isStandby);//No I18N
            } 
        });
}
function listFailOverDetails(){
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/v2/admin/listFailOverDetails');//No I18N
    var newJsonArr = [];//No I18N
    if(jsonData.isMickeyFOS || !jsonData.isOPMFOS) {
        opmGlobalRoute.transitionTo("Settings.Basic.FosConfiguration"); //No I18N
        return;
    }
    $.each(jsonData.failoverDetails,function(key,value)
    {
        value.serverDisplay = key;
        value.connectUrl = value.Protocol+'://'+value.Host+':'+value.Port;//No I18N
        if(value.Servertype == 'PRIMARY'){//No I18N
            value.type = "PRIMARY";//No I18N
        }else{
            value.type = "STANDBY";//No I18N
        }
        newJsonArr.push(value);
    });
    var newJson = {"failover":newJsonArr};//No I18N
    var colNames = [Ember.I18n.t("webclient.admin.failover.type",this),Ember.I18n.t("webclient.admin.downtimescheduler.status",this),Ember.I18n.t("webclient.admin.logging.httpclient",this),Ember.I18n.t("webclient.action.actions",this),"","","",""];//No I18N
    var colModel = [{ name: 'serverDisplay', index: 'serverDisplay',classes:'cursorPointer'}, //No I18N
                    { name: 'Status', index: 'Status'}, //No I18N
                    { name: 'connectUrl', index: 'connectUrl',formatter:redirectURL}, //No I18N
                    { name: 'gridAction', index: 'gridAction',formatter:deleteFailOverServer, hidden: !window.OPM.userPermissions.generalSettingsWrite}, //No I18N
                    { name: 'Protocol', index: 'Protocol',hidden: true}, //No I18N
                    { name: 'Host', index: 'Host',hidden: true}, //No I18N
                    { name: 'type', index: 'type',hidden: true},//No I18N
                    { name: 'Port', index: 'Port',hidden: true} //No I18N
                ];
    $('#jqgridList').closest(".opm_jqGridUI").addClass("opmReportsGridview");//No I18N
    opm_loadJQgridWithData("#jqgridList",newJson.failover, colNames, colModel, "", "", "editFailover", "");//No I18N
    $("#jqgridList").jqGrid("setGridWidth",$('#jqgridList').closest(".opmFormHolder").width()-30);//No I18N
    listAuditReports(jsonData.auditDetails);
}


function showArchiveList(value){
    var availableModules = {};//No I18N
    if(value === "hourlyArchive"){//No I18N
        if(OPMClient.SettingsConfigurationController.hourlyArchive !== undefined && !$.isEmptyObject(OPMClient.SettingsConfigurationController.hourlyArchive)){//No I18N
            availableModules = OPMClient.SettingsConfigurationController.hourlyArchive;//No I18N
        }
        $("#startHour").closest(".opmFormRow").show();
        $("#endHour").closest(".opmFormRow").show();
    }
    if(value === "dailyArchive"){//No I18N
        if(OPMClient.SettingsConfigurationController.dailyArchive !== undefined && !$.isEmptyObject(OPMClient.SettingsConfigurationController.dailyArchive)){//No I18N
            availableModules = OPMClient.SettingsConfigurationController.dailyArchive;//No I18N
        }
        $("#startHour").closest(".opmFormRow").hide();
        $("#endHour").closest(".opmFormRow").hide();
    }
    var availHeight = $(".slideContent-1 .slideContentContainer").outerHeight() - 330;
    //triggerAssociationComponent(covertObjectToArray(availableModules),[],Ember.I18n.t('webclient.dbmaintenance.availablemodules',this),Ember.I18n.t('webclient.dbmaintenance.selectedmodules',this),availHeight);//No I18N
    triggerAssociationComponent(covertObjectToArray(availableModules),[]);//No I18N
}
function gotoRunArchive(){
    var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getRunArchiveDetails");//No I18N
    if(response.probes!==undefined) {
        OPMClient.SettingsConfigurationController.set("probes",response.probes);//No I18N
    }
    if(response.error !== undefined){//No I18N
        alert(response.error.message);
    }else if(response !== undefined && !$.isEmptyObject(response)){//No I18N
        if(response.dailyModule !== undefined){//No I18N
            OPMClient.SettingsConfigurationController.set("dailyArchive",response.dailyModule);//No I18N
        }
        if(response.hourlyModule !== undefined){//No I18N
            OPMClient.SettingsConfigurationController.set("hourlyArchive",response.hourlyModule);//No I18N
        }
        opm_transitionToParentRoute("Settings.Basic.Database.RunArchive");//No I18n
    }
}

function listSearch(searchString, listToCheck){
    if(listToCheck === "existingDevicesList")
    {
        $("#"+listToCheck+" li:not(#discSelectallLi)").each(function () {//No I18N
            if ($(this).text().search(new RegExp(searchString, "i")) < 0) {//No I18N
                $(this).hide();
            } else {
                $(this).show()
            }
        });
    }
    else if(listToCheck === "auditModules") 
    {
        if(searchString == "") {
            $("#"+listToCheck).find(".opmAccordionSingle").show();
            $("#"+listToCheck).find(".opmAccCont").show();
            $("#"+listToCheck).find("li").show();
        } else {
            $("#"+listToCheck+" li").each(function () {//No I18N
                if ($(this).text().search(new RegExp(searchString, "i")) < 0) {//No I18N
                    $(this).hide();
                    $(this).closest('.opmAccCont').hide();
                } else {
                    $(this).show();
                    $(this).closest('.opmAccCont').show();
                    $(this).closest(".opmAccordionSingle").show();
                }
            });
            $("#"+listToCheck).find(".opmAccordionSingle").each(function(key,val) {
                if(!$(this).find('.opmAccCont').is(":visible")) {
                    if(!$(this).hasClass("shown")) {
                        $(this).hide();
                    }
                } else {
                    $(this).addClass("shown").show();
                }
            });
            $("#"+listToCheck).find(".opmAccordionSingle").removeClass('shown');
        }
    } else {
        $("#"+listToCheck+" li").each(function () {//No I18N
            if ($(this).text().search(new RegExp(searchString, "i")) < 0) {//No I18N
                $(this).hide();
            } else {
                $(this).show()
            }
        });
    }
}

function toggleDiscProfReports(){
    if($("#toggleDiscoveryProfile").is(":checked")){//No I18N
        opm_listDiscoveryProfile("reports");//No I18N
        $('#discRepHeader p').text(Ember.I18n.t("opm.discovery.profile.infoMsg",this));//No I18N
    }else{
        opm_listDiscoveryProfile("profiles");//No I18N
        $('#discRepHeader p').text(Ember.I18n.t("opm.discovery.report.infoMsg",this));//No I18N

    }
}
function opm_listPendingDevices(obj){
    OPMClient.DiscoveryWizardAddEditController.set('profID',$(obj).attr("data-profileID"));//No I18N
    OPMClient.DiscoveryWizardAddEditController.set('repTime',$(obj).attr("data-time"));//No I18N
    OPMClient.DiscoveryWizardAddEditController.set("index",$(obj).attr("data-index"));//No I18N
    opm_transitionToParentRoute("Settings.Discovery.DiscoveryProfiles.Devices");//No I18N
}
function showIPSLATabs(div){
    if($('.opmForm').hasClass('opmFormType5')){//No I18N
        $('.opmForm').removeClass('opmFormType5');//No I18N
        $("#actionDiv").css("max-width","100%");//No I18N
    }
    var monitorType = {"VoipThresholdTemplate":"voip","WanThresholdTemplate":"wan","VideoThresholdTemplate":"video"};//No I18N
    $(".validateField").removeClass("error");//No I18N
    $("#VoipCallSettingsDiv").hide();//No I18N
    $("#VoipThresholdTemplateDiv").hide();//No I18N
    $("#WanThresholdTemplateDiv").hide();//No I18N
    $("#VideoCallSettingsDiv").hide();//No I18N
    $("#VideoThresholdTemplateDiv").hide();//No I18N
    $("#WanTestParamsDiv").hide();//No I18N
    $("#notificationDiv").hide();//No I18N
    $("#"+div+"Div").show();//No I18N
    $('#ipslaSaveNassobtn').hide();
    if(div === "VoipCallSettings"){//No I18N
        var jsonData =opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getIpslaSettings?monitorType=voip'); //No I18N
        $("#surcePort").val(jsonData.sourcePort);//No I18N
        $("#CodecId").val(jsonData.codecId).select2();//No I18N
        $("#pollInterval").val(jsonData.pollInterval);//No I18N
        $("#timeout").val(jsonData.timeout);//No I18N
        $("#VoipTos").val(jsonData.typeOfService);//No I18N
        $("#VoipMos").val(jsonData.mosAdvFactor);//No I18N
    }if(div === "VideoCallSettings"){//No I18N
        var jsonData =opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getIpslaSettings?monitorType=video'); //No I18N
        $("#vsurcePort").val(jsonData.sourcePort);//No I18N
        $("#vCodecId").val(jsonData.codecId).select2();//No I18N
        $("#vpollInterval").val(jsonData.pollInterval);//No I18N
        $("#vtimeout").val(jsonData.timeout);//No I18N
    }
    if(div === "WanTestParams") //No I18N
    {
        $(".opmForm").addClass("opmFormType5");//No I18N
         $("#actionDiv").css("max-width","76%");//No I18N
        var jsonData =opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getIpslaSettings?monitorType=wan'); //No I18N
        $("#EchoPayload").val(jsonData.echoPayLoad);//No I18N
        $("#EchoTos").val(jsonData.typeOfService);//No I18N
        $("#Pollinterval").val(jsonData.pollInterval);//No I18N
        $("#Timeout").val(jsonData.timeout);//No I18N
        if(jsonData.enablePathEcho==="true") 
        {
            $("#true").prop("checked", true)
        } 
        else 
        {
            $("#false").prop("checked", true)
        }
    }
    if(div === "VoipThresholdTemplate" ||  div === "WanThresholdTemplate" || div === "VideoThresholdTemplate"){//No I18N
        $(".opmForm").addClass("opmFormType5");//No I18N
        $("#actionDiv").css("max-width","76%");//No I18N
        $("#notificationDiv").show();//No I18N
        $('#ipslaSaveNassobtn').show();
        var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getIpslaThresholds?monitorType='+monitorType[div]);//No I18N
        if(jsonData !== undefined && !$.isEmptyObject(jsonData)){
            var availArr = [];
            var selectArr = [];
            if(jsonData.notificationProfiles !== undefined && jsonData.notificationProfiles.length >0){
                $.each(jsonData.notificationProfiles, function(key,val){
                    if(val.isSelected === true){
                        selectArr.push({"value":val.ProfileID,"displayName":val.ProfileName});
                    }else if(val.isSelected === false){
                        availArr.push({"value":val.ProfileID,"displayName":val.ProfileName});
                    }
                });
            }
            //triggerAssociationComponent(availArr,selectArr,Ember.I18n.t('webclient.Available',this),Ember.I18n.t('webclient.Selected',this));//No I18N
            triggerAssociationComponent(availArr,selectArr);//No I18N
            if(div === "VoipThresholdTemplate"){//No I18N
                $("#errorMos").val(jsonData.errorMos);//No I18N
                $("#warningMos").val(jsonData.warningMos);//No I18N
                $("#errorJitter").val(jsonData.errorJitter);//No I18N
                $("#warningJitter").val(jsonData.warningJitter);//No I18N
                $("#errorLatency").val(jsonData.errorLatency);//No I18N
                $("#warningLatency").val(jsonData.warningLatency);//No I18N
                $("#errorPacketloss").val(jsonData.errorPacketLoss);//No I18N
                $("#warningPacketloss").val(jsonData.warningPacketLoss);//No I18N
                $("#errorRtt").val(jsonData.errorRtt);//No I18N
                $("#warningRtt").val(jsonData.warningRtt);//No I18N
                 $("#errorAvail").val(jsonData.errorAvail);//No I18N
                $("#warningAvail").val(jsonData.warningAvail);//No I18N
                OPMClient.SettingsAddEditController.set("IPSLANotifyInfo","opm.ipsla.voipthreshold.notification"); //No I18n
            }else if(div === 'VideoThresholdTemplate'){ //No I18N
                $("#vErrorLatency").val(jsonData.errorLatency);//No I18N
                $("#vWarningLatency").val(jsonData.warningLatency);//No I18N
                $("#vErrorJitter").val(jsonData.errorJitter);//No I18N
                $("#vWarningIA").val(jsonData.warningIA);//No I18N
                $("#vWarningJitter").val(jsonData.warningJitter);//No I18N
                $("#vErrorPacketloss").val(jsonData.errorPacketLoss);//No I18N
                $("#vErrorIA").val(jsonData.errorIA);//No I18N
                $("#vWarningPacketloss").val(jsonData.warningPacketLoss);//No I18N
                OPMClient.SettingsAddEditController.set("IPSLANotifyInfo","opm.ipsla.videothreshold.notification"); //No I18n
            }
            else {
                $("#wanErrorRtt").val(jsonData.errorRtt);//No I18N
                $("#wanWarningRtt").val(jsonData.warningRtt);//No I18N
                $("#wanErrorAvail").val(jsonData.errorAvail);//No I18N
                $("#wanWarningAvail").val(jsonData.warningAvail);//No I18N
                OPMClient.SettingsAddEditController.set("IPSLANotifyInfo","opm.ipsla.wanthreshold.notification"); //No I18n
            }
        }   
    }
}
function gotoSupportPage(pageName){
    productDetails=$('#wrapper').offset().left+$('#wrapper').outerWidth();
    $('.PDTNav > a').parent().removeClass('active').find('.PDTContainer').css({width:'0',left:productDetails});//No I18N
    $('body').removeClass('quickLinksOverlay');
    opm_transitionToParentRoute("Support",pageName);//No I18N
}

function opm_supportPage(pageName){
    if (document.getElementById('SupportInfoDiv') !== null) {
        setCombo('');
    var pageHeaders = {"SupportInfo":Ember.I18n.t('webclient.support.opm.support.supportinformationform',this),"SIF":Ember.I18n.t('webclient.support.report.issue',this),"ThreadDump":Ember.I18n.t('webclient.support.thread.threaddump',this),"SubmitQuery":Ember.I18n.t('webclient.support.tab.dbquery',this),"ViewLogs":Ember.I18n.t('webclient.workflow.viewlogs',this),"Diagnostics":Ember.I18n.t('webclient.SIF.Diagnostics.Diagnostics',this)};//No I18N
    if(window.OPM.isFWA || window.OPM.isOPUtils){
        pageHeaders.SupportInfo=Ember.I18n.t('webclient.common.supporttitle',this);//NO I18N
    }    
    $("#SupportInfoDiv").hide();
        $("#SIFDiv").hide();
        $("#ThreadDumpDiv").hide();
        $("#SubmitQueryDiv").hide();
        $("#ViewLogsDiv").hide();
        $("#viewLogsSearch").hide();
        $("#exportToCSV").hide();        
        $("#loadingImg").hide();
    $("#DiagnosticsDiv").hide();
        $("#" + pageName + "Div").show();//No I18N        
        OPMClient.SettingsConfigurationController.set("supportHeader", pageHeaders[pageName]);//No I18N
        if (pageName === "ThreadDump") {//No I18N
            var url = "";//No I18N
            $.getJSON(window.OPM.apiUrlPattern + '/admin/GetThreadDump', function (jsonData) { //No I18N
                url = jsonData.fileName;
                $.get(url, function (data) {
                    $('#threads').val(data);
                });
                var $textarea = $("#threads");//No I18N
                setTimeout(function () {
                    $textarea.height($textarea[0].scrollHeight);
                }, 300);
            });
        } else if (pageName === "SubmitQuery") {//No I18N
            $('#resultDiv').width($('.settingsContent').width());
            $('.showQueryField').click(function () {
                $('.opmQueryExecute').show();
                $('.opmQueryFieldbtn').hide();
            });
            if ($('div.ui-jqgrid-bdiv table').length > 1) {
                $("#exportToCSV").show();
            }
        } else if (pageName === "ViewLogs") {//No I18N
            $("#viewLogsSearch").show();
            $('#logList').width($('.opmFormHolder').width() - 30);
            OPMClient.Settings.generateViewLogs();
        }
        else if (pageName === "SnapshotsReport") {//No I18N
            fetchSnapshorReport();
    } else if(pageName === "Diagnostics") { //No I18N
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
        OPMClient.Settings.getCountComparisionDetails();
        OPMClient.Settings.getCompareDetails();
        OPMClient.Settings.getDataComparison();
        }
        $('.select2').select2(); //No I18N
    }
}

function showLicenseRigisterSlide(){
    setTimeout(function(){
        productDetails=$('#wrapper').offset().left+$('#wrapper').outerWidth();
        $("li.PDTNav").addClass('active').find('.PDTContainer').addClass('active').css({width:'490px',left:productDetails-490});//No I18N
        $('body').addClass('quickLinksOverlay');
        $('.ProAccordion ul li.register').click();
    },100);
    
}

function fetchSnapshorReport()
{
    
    var ColName = ["Widget"]; //No I18n
        var ColModel = [{
            name: 'NAME', //No I18N
            index: 'NAME',//No I18N
            width: 0,
            hidden: false,
            search: true
            // ,cellattr: function (rowId, cellValue, rowObject) {
            //        return ' title="'+rowObject.DATA_URL+'"';
            //        // return 'onclick="ReturnCellTitle(' + '\'' +rowObject.DATA_URL + '\'' + ')"';
            //   }
        }];
        var apiReportdata;
        $.getJSON(window.OPM.apiUrlPattern + '/admin/getSnapshotReport', function(jsonData) //No I18N
        {
            apiReportdata = jsonData.data;
            // console.log(apiReportdata)
            for (i = 0; i < jsonData.headers.length; i++) {
                ColName.push(jsonData.headers[i]);
            }
            // ColName.push('DATA_URL');   //No I18N
            // ColName.push('RESULT');   //No I18N
            // ColName.push('ASSOCIATION_ID');   //No I18N
            // ColName.push('CONDITION');   //No I18N

            for (j = 1; j < ColName.length; j++) {
                var obj = {};
                obj.name = ColName[j];
                obj.index = ColName[j];
                obj.search = true;
                obj.hidden=(obj.name=='DATA_URL' || obj.name=='RESULT' || obj.name=='ASSOCIATION_ID' || obj.name=='CONDITION');//No I18N
                obj.width= (obj.hidden==true)?0:20;
                ColModel.push(obj);
            }

            var defaultOptions = {
                "sortOrder": "asc",//No I18N
                "grouping": false,//No I18N
                // "rowNumNeeded": true, //No I18N
                "minRowsPerPage":1000//No I18N
            }; //No I18N
            opm_loadJQgridWithData("#snapshot_report", apiReportdata, ColName, ColModel, "", "#SnapshotReport_Pager", "snapshot_report", defaultOptions); //No I18N
            $("#snapshot_report").jqGrid('filterToolbar', {//No I18N
                searchOperators: true
            });
            $("#snapshot_report").setGridWidth($("#opmFormHolder").width());
        }).done(function()
        {
            $('#loadingImg').hide();
        });
}

function changeSelectList(str,divId){
    $("#"+divId+" option").each(function () {//No I18N
        if ($(this).text().search(new RegExp(str, "i")) >= 0 || $(this).val().search(new RegExp(str, "i")) >= 0) {//No I18N
            $(this).show();
        } else {
            $(this).hide()
        }
    });
}
function opm_isIPAddressValid(ipAddress)
{
    if(opm_isIpV4Address(ipAddress)){
         return true;
    }
    if(opm_isIpV6Address(ipAddress)){
    return true;
    }
    return false;
}
function nfa_addIPCheckError(divID){
    $("#"+divID).addClass("validateField error");//No I18N
    $("#"+divID).attr("data-error",Ember.I18n.t("webclient.invalidip"));//No I18N
}

function opm_isIpV4Address(ipAddress)
{
    if(/^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/.test(ipAddress)) {
         return true;
    }
    return false;
}
function opm_isIpV6Address(ipAddress){
    var regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
    return regex.test(ipAddress);
}

function isValidMACAddress(addr){
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(addr)
}

function nfa_validateIPRange(startIP,endIP,isIpV4) {
    var radix=16,splitChar=':';
    if(isIpV4) {
        radix=10;
        splitChar='.';
    }
    startIP = nfa_formatIPAddress(startIP,isIpV4);
    endIP = nfa_formatIPAddress(endIP,isIpV4);
    return nfa_ipAddressRangeCmpr(startIP.split(splitChar),endIP.split(splitChar),0,false,radix)
}
function nfa_formatIPAddress(ipAddress,isIpV4) {
    if(isIpV4) {
        var ipArr = ipAddress.split('.');
        for(var i=0;i<ipArr.length;i++) {
            ipArr[i] = ("000" + ipArr[i]).slice(-3)
        }
        return ipArr.join('.');
    }else{
        var returnIPArr = [];
        var ipArr=ipAddress.split('::');
        if(ipArr.length == 1) {
            returnIPArr = ipAddress.split(':');
        }else {
            returnIPArr= ipArr[0].split(':');
            var ipArrPart2 = ipArr[1].split(':');
            for (var i = ipArrPart2.length; i > 0; --i) {
                returnIPArr[7 - (ipArrPart2.length - i)] = ipArrPart2[i - 1];
            }
        }
        for (var i =0;i<returnIPArr.length;i++) {
            returnIPArr[i] = ("0000" +((returnIPArr[i]!=undefined)?returnIPArr[i]:'')).slice(-4);
        }
        return returnIPArr.join(':');
    }
}

function nfa_ipAddressRangeCmpr(startIPArr,endIPArr,n,isValid,radix) {
    if(parseInt(endIPArr[n], radix) > parseInt(startIPArr[n], radix)) {
        isValid = true;
    }else if(parseInt(endIPArr[n], radix) < parseInt(startIPArr[n], radix)) {
        isValid = false;
        n=startIPArr.length;
    }else {
        isValid = false;
    }
    if(n==startIPArr.length || isValid) {
        return isValid;
    }
    return nfa_ipAddressRangeCmpr(startIPArr,endIPArr,n+1,isValid,radix);
}
function nfa_isValidGroupName(name) {
    var iChars = '~`!%&-+\\\'\"?:,;<>=()/'; //No I18N
    for (var i = 0; i < name.length; i++) 
    {
        if (iChars.indexOf(name.charAt(i)) != -1) 
        {
            return false;
        }
    }
    return true;
}
function changePassword(){
    var isValid = opm_validateFields({ "empty": ["oldPassword", "retypePassword"] });//No I18N
    var userName = window.OPM.userName;
    var oldPassword = $("#oldPassword").val();//No I18N
    var newPassword = $("#newPassword").val();//No I18N
    var retypePassword = $("#retypePassword").val();//No I18N
    if (isValidPwd(newPassword, userName).result !== true) {
        $('#newPassword').addClass('validateField error');//No I18N
        return false;
    }
    if (isValid) {
        if(trim(newPassword) !== trim(retypePassword))
        {
            alert(Ember.I18n.t('webclient.admin.modifyuserprofile.validation.newpassword.check',this));//No I18N
            $("retypePassword").focus();//No I18N
        }
         else if(trim(newPassword) === trim(oldPassword))
        {
            alert(Ember.I18n.t('webclient.api.password.update.same',this));//No I18N
            $("#retypePassword").empty();//No I18N
            $("#newPassword").focus();//No I18N
        }else{
            var pwdData = {"oldPassword":oldPassword,"newPassword":newPassword}; //No I18N
            var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/admin/changePassword?userName="+encodeURIComponent(userName),pwdData); //No I18N
            if(response !== undefined){
                if(response.result !== undefined){
                    var options = {};
                    options.callback_func = function(){
                        $(".toClear").val("");//No I18N
                        //$('.opmSettingsContainer .content.btn').css({left:'0'});//No I18N
                        //$('.opmSettingsContainer .content.details').css({left:'100%'});//No I18N
                        $("html").click();//No I18N
                    };
                    opm_infoMsgs("successMsg",response.result.message,options);//No I18N
                    if(OPMClient.ApplicationController.currentPath === "Settings.Basic.SSLSettings.SecurityRecommendations") { //No I18n
                        OPMClient.__container__.lookup("controller:SettingsBasicSSLSettingsSecurityRecommendations").send("refreshModel"); //No I18n
                    } else {
						setSecurityScore();
					}
                }else if(response.error !== undefined){
                    opm_infoMsgs("errorMsg",response.error.message);//No I18N
                }
           }
        }
    }
}
function cancelDropDown(keepApiKeyCache){
//    $('.opmSettingsContainer .content.btn').css({left:'0'});//No I18N
  //  $('.opmSettingsContainer .content.details').css({left:'100%'});//No I18N
    $("html").click();
    $(".opmSettingsContainer").hide();
    if(!keepApiKeyCache){
        $('#restapiVal, #mcpKey').prop('value',''); //No I18N
    }
}
function opm_changeLanguage()
{
    var selectedLang = $('input:radio[name=selectedLang]:checked').val();//No I18N
    var params = {};
    params.languageSelected = selectedLang;
    var lUrl = window.OPM.apiUrlPattern + "/admin/updateLanguageSettings"; //No I18n
    var response = opm_ajaxPostRequest(lUrl,params);
    location.reload();
}

function loadSelectedLanguage(){
    var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getLanguageSettings"); //No I18N
    if(jsonData.sellang !== undefined){
            jsonData.sellang === $("#"+jsonData.sellang).prop("checked",true);//No I18N
    }
}
function isSpecialCharacter(dnsname)
{
    for (i=0; i<dnsname.length; i++)
    {
        var ipChar = dnsname.charCodeAt(i);
        if ((ipChar < 48 && ipChar != 45 && ipChar != 46) || (ipChar > 57 && ipChar < 65) || (ipChar > 90 && ipChar != 95 && ipChar < 97 ) || (ipChar > 122 && ipChar <= 125) || ipChar == 126)
        {
            return true;
        }
    }
    return false;
}
function isSpecialCharacterWithoutSpace(dnsname)
{
    for (i=0; i<dnsname.length; i++)
    {
        var ipChar = dnsname.charCodeAt(i);
        if ((ipChar < 48 && ipChar != 45 && ipChar != 46 && ipChar != 32) || (ipChar > 57 && ipChar < 65) || (ipChar > 90 && ipChar != 95 && ipChar < 97 ) || (ipChar > 122 && ipChar <= 125) || ipChar == 126)
        {
            return true;
        }
    }
    return false;
}
function isNumber(str)
{ 
    str = trimAll(str);
    if(str.length==0){ return false;}
    numdecs = 0; 
    for (i = 0; i < str.length; i++) 
    {
        mychar = str.charAt(i); 
        if ((mychar >= "0" && mychar <= "9") || mychar == "." )
        { 
        if (mychar == "."){ 
        numdecs++; }
        } 
        else{ return false; }
    } 
        if (numdecs > 1){return false;} 
        return true; 
}
function mibToggleAll(action){
    if(action === "expand"){//No I18N
        $("#treeListView").jstree("open_all");//No I18N
    }else if(action === "collapse"){//No I18N
        $("#treeListView").jstree("close_all");//No I18N
    }
}
function getMibList(){
    $.getJSON(window.OPM.apiUrlPattern + "/mibbrowser/getMibList",function(jsonData)  //No I18n
        {
            // if(jsonData.error !== undefined)
            // {
            //     //Error message
            // }
            var fileName;
            if((jsonData.mibList).length !== 0)
            {
                var mibList = [];
                var selectedMIB = '';
                $.each(jsonData.mibList,function(key,value)
                {
                    fileName =  value.split('.').pop();
                     if(fileName == 'cds' || fileName == 'cmi') {
                            return true;
                        }
                    if(value === "RFC1213-MIB")
                    {
                        selectedMIB = value;
                    }
                    mibList.push(value);
                });
                $('#mibList').select2({data:mibList});
                $('#mibList').val(selectedMIB).select2().trigger('change');//No I18N
                if(OPMClient.SettingsMibController.isMibUpload)
                {
                    OPMClient.SettingsMibController.isMibUpload=false;
                    $('#mibList').val(OPMClient.SettingsMibController.uploadedmibFileName).select2().trigger('change');//No I18N
                }
            }
        });
}
function opmValidateTooltipDefine()
{
    $('.validateField').on('focusin',function(){
        opmValidate($(this));
    });
    $('.validateField').on('focusout',function(){
        $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
    });
}

function checkStatusPoll() {
    if ($('#statusPoll input').is(":checked") && $('#statusPoll input:checked').length === 1 && !$('#profileCriteria').find("#1").hasClass("ui-state-highlight")) {
        $('#profileCriteria').jqGrid('setSelection', 1);
    } else if (!$('#statusPoll input').is(":checked") && $('#statusPoll input:checked').length < 1 && $('#profileCriteria').find("#1").hasClass("ui-state-highlight")) { //No I18N
        $('#profileCriteria').jqGrid('setSelection', 1, false);
    }
}

function enableAlarmMsgMatch() {
    var alarmContent = $('#alarmMsgContent').val();
    if(alarmContent.length > 0) {
        if(!$(OPMClient.SettingsNotificationsController.alarmMsgCheckbox).is(":checked")) {
            $(OPMClient.SettingsNotificationsController.alarmMsgCheckbox).click();
        }
    } else {
        if($(OPMClient.SettingsNotificationsController.alarmMsgCheckbox).is(":checked")) {
            $(OPMClient.SettingsNotificationsController.alarmMsgCheckbox).click();
        }
    }
}

function checkIntfThreshSelected() {
    var intfCheckedLength = $('#intfThreshDiv input:checked').length;
    if (intfCheckedLength == 1 && !$(OPMClient.SettingsNotificationsController.selectedForIntfThreshSel).is(":checked") || intfCheckedLength == 0) {
        $(OPMClient.SettingsNotificationsController.selectedForIntfThreshSel).trigger("click")
    }
}

function getCriteriaArray()
{
    var reArr = new Array();

    if(!OPMClient.SettingsAddEditController.fromSnapshotPage)
    {
        $.each(OPMClient.SettingsNotificationsController.criteriaGrid,function(index,details){
           if(window.OPM.isNCM) {
            if(details.monitorName === "configBackup"){
                details.isVisible = true;
                details.Name =  Ember.I18n.t('webclient.admin.configurecriteria.configbackupfail'); //No I18N
            }
            if(details.monitorName === "configChange") {
                details.isVisible = true;
                details.Name =  Ember.I18n.t('webclient.admin.configurecriteria.configchangedown'); //No I18N
            }
           } else {
            if(details.monitorName === "url")
            {
                details.isVisible = !window.OPM.isURLMonitoringRestricted;
                details.Name =  Ember.I18n.t('webclient.admin.configurecriteria.urldown'); //No I18N
            }
            else if(details.monitorName === "probe")
            {
                details.isVisible = window.OPM.isCentralServer || window.OPM.isMSPCentral;
            }
            else if(details.monitorName === "agent")
            {
                details.isVisible = true;
            }
            else if(details.monitorName === "ipslaMonitors")
            {
                details.isVisible = false;
            }else{
                details.isVisible = true;
            }
            if(window.OPM.isOPMStandardEdition) {
                switch(details.monitorName) {
                    //case "url": //No I18n
                    case "hardwareMonitor": //No I18n
                    case "adMonitors": //No I18n
                    case "adServices": //No I18n
                    case "exchangeMonitors": //No I18n
                    case "exchangeServices": //No I18n
                    case "mssqlMonitors": //No I18n
                    case "mssqlServices": //No I18n
                    case "virtualDeviceMonitor": //No I18n
                    case "ucsMonitor":details.isVisible = false; //No I18n
                }
            }
            if(window.OPM.isOPMLiteEdition)
            {
                if(details.monitorName === "devicemissespolls" || details.monitorName === "clearalarm")
                {
                    details.isVisible = true;
                }
                else
                {
                    details.isVisible = false;
                }
            }
        }
            reArr.push(details);
        });
    }
    else
    {
        var devCategory  = deviceBasicDetails.category;
        if(deviceBasicDetails.parentCategory !== undefined && devCategory !== 'UCS'){
            devCategory = deviceBasicDetails.parentCategory; //For Handling Criteria for Custom Category Devices.
        }
    //For providing proper criteria for Microsoft Devices
        var isMicrosoftProduct = ((deviceBasicDetails.vendorName!==undefined && deviceBasicDetails.vendorName.indexOf("Microsoft") !== -1) || (deviceBasicDetails.type !==undefined && deviceBasicDetails.type.indexOf("Windows") !== -1)); //No i18N 
        $.each(OPMClient.SettingsNotificationsController.criteriaGrid,function(index,details){
            
            if(window.OPM.isNCM) {
            if(details.monitorName === "configBackup"){
                details.isVisible = true;
                details.Name =  Ember.I18n.t('webclient.admin.configurecriteria.configbackupfail'); //No I18N
            }
            if(details.monitorName === "configChange") {
                details.isVisible = true;
                details.Name =  Ember.I18n.t('webclient.admin.configurecriteria.configchangedown'); //No I18N
            }
           } else {
            if(details.monitorName === "url")
            {
                details.isVisible = !window.OPM.isURLMonitoringRestricted;
                details.Name =  Ember.I18n.t('webclient.admin.notification.profile.criteria.url'); //No I18N
            }
            else if(details.monitorName === "probe")
            {
                details.isVisible = false;
            }
            else if(details.monitorName === "ntServices")
            {
               details.isVisible = (isMicrosoftProduct && (devCategory === "Server" || devCategory === "Desktop" || devCategory === "DomainController" || devCategory === "LoadBalancer" || devCategory === "WANAccelerator" || devCategory === "Unknown" || devCategory === "Storage")); //No I18N
            }
            else if(details.monitorName === "fileMonitors" || details.monitorName === "folderMonitors")
            {
                details.isVisible =  (isMicrosoftProduct && (devCategory === "Server" || devCategory === "Desktop" || devCategory === "DomainController"));//No I18N
            }
            else if(details.monitorName === "eventlog")
            {
                details.isVisible =  (isMicrosoftProduct && (devCategory === "Server" || devCategory === "Desktop" || devCategory === "Firewall" || devCategory === "DomainController"));//No I18N
            }
            else if(details.monitorName === "exchangeMonitors" || details.monitorName === "exchangeServices"){
                details.isVisible =  (isMicrosoftProduct && deviceBasicDetails.isExchangeEnabled);
            }else if(details.monitorName === "adMonitors" || details.monitorName === "adServices"){//No I18N
                details.isVisible =  (isMicrosoftProduct && deviceBasicDetails.isADEnabled);
            }else if(details.monitorName === "mssqlMonitors" || details.monitorName === "mssqlServices"){//No I18N
                details.isVisible =  (isMicrosoftProduct && deviceBasicDetails.isMSSQLEnabled);
            }
            else if(details.monitorName === "ipslaMonitors")
            {
                details.isVisible = (devCategory === "Router" || devCategory === "Firewall" || devCategory === "Switch");//No I18N
            }
            else if(details.monitorName === "upsMonitors")
            {
                details.isVisible = (devCategory === "UPS");//No I18N
            }
            else if(details.monitorName === "ucsMonitor")
            {
                details.isVisible =  (devCategory === "UCS");//No I18N
            }
            else if(details.monitorName === "printersMonitors")
            {
                details.isVisible =  (devCategory === "Printer");//No I18N
            }
            else if(details.monitorName === "agent")
            {
                details.isVisible =  (devCategory === "Server" || devCategory === "Desktop");//No I18N
            }
            else if(details.monitorName === "nfaAlarm")
            {
                details.isVisible =  (devCategory === "Router" || devCategory === "Firewall" || devCategory === "LoadBalancer");//No I18N
            }
            else if(details.monitorName === "configBackup" || details.monitorName === "configChange")
            {
                details.isVisible =  (devCategory === "Router" || devCategory === "Firewall" || devCategory === "LoadBalancer" || devCategory === "Switch" || devCategory === "Unknown");//No I18N
            }else if(details.monitorName === "virtualDeviceMonitor"){//No I18N
                details.isVisible = ((deviceBasicDetails.entityType !== undefined && (deviceBasicDetails.entityType.indexOf("VMware") !== -1 || deviceBasicDetails.entityType.indexOf("HyperV") !== -1 || deviceBasicDetails.entityType.indexOf("Xen") !== -1)) || (deviceBasicDetails.oldVirtualCenter === "true" || deviceBasicDetails.oldVirtualDev === "true")); // First check is for new model and the second check is for Old model
            }
            else if(details.monitorName === "lbAlarm" && !OPMClient.InventoryDeviceDetailsController.isKempLoadBalancer)//No I18N
            {
                details.isVisible =  false;
            }
            else{
                details.isVisible = true;
            }
            if(window.OPM.isOPMStandardEdition) {
                switch(details.monitorName) {
                    case "url": //No I18n
                    case "hardwareMonitor": //No I18n
                    case "adMonitors": //No I18n
                    case "adServices": //No I18n
                    case "exchangeMonitors": //No I18n
                    case "exchangeServices": //No I18n
                    case "mssqlMonitors": //No I18n
                    case "mssqlServices": //No I18n
                    case "virtualDeviceMonitor": //No I18n
                    case "ucsMonitor":details.isVisible = false; //No I18n
                }
            }
            //Show only the below monitors for open framework type device in snapshot notification profile
            if(OPMClient.SettingsAddEditController.fromSnapshotPage && OPMClient.InventoryDeviceDetailsController.isOpenFWDevice)  {
                switch(details.monitorName) {
                    case "devicemissespolls": //No I18n
                    case "alarmMsg": //No I18n
                    case "threshold": //No I18n
                    case "clearalarm": details.isVisible = true; //No I18n
                    break;
                    default: details.isVisible = false;
                }
            }
            if(window.OPM.isOPMLiteEdition)
            {
                if(details.monitorName === "devicemissespolls" || details.monitorName === "clearalarm")
                {
                    details.isVisible = true;
                }
                else
                {
                    details.isVisible = false;
                }
            }
            }
            reArr.push(details);
        });
    }
    return reArr;
}

function opm_setAutoRefresh(sessionMessage)
{
    var refreshTime;
    var lUrl = window.OPM.apiUrlPattern + "/admin/updateLanguageSettings?"; //No I18n
    var params = {};
    if(!window.OPM.isRMMCentral) {
        if($('input[name="autoRefreshBtn"][data-value="autorefresh"]').is(':checked')){
            refreshTime = $('#autoRefreshInterval').val();//No I18N
            if(!opm_validateFields({'empty':["autoRefreshInterval"],'rangeCheck':{'autoRefreshInterval':60},'positive':['autoRefreshInterval']})){
		return false;
	     }
            if(refreshTime < 10){
            alert(Ember.I18n.t('webclient.common.autoRefresh.infoMsg',this));//No I18N
            return;
            }else{
           refreshTime = Number(refreshTime);  
        }
            params.refreshinterval = refreshTime;
        }else{
            params.sessiontimeout = $("#sessionTimeoutVal").val();//No I18N
        }
    } else {
        params.languageSelected = sessionMessage.locale;
        params.sessiontimeout = sessionMessage.sessionExpiryTime;
    }
    var response = opm_ajaxPostRequest(lUrl,params);
    showMessage(response)
    cancelDropDown();
    if(response.result && response.result.message !== undefined)
    {
        if(refreshTime!==undefined){
            window.OPM.autoRefresh = refreshTime;
            window.OPM.sessiontimeout = "";
        }else{
            window.OPM.autoRefresh = "";
            window.OPM.sessiontimeout = params.sessiontimeout;
            if(OPMClient.ApplicationController.currentPath === "Settings.Basic.SSLSettings.SecurityRecommendations") { //No I18n
                OPMClient.__container__.lookup("controller:SettingsBasicSSLSettingsSecurityRecommendations").send("refreshModel"); //No I18n
            } else {
                setSecurityScore();
            }
        }
        opm_autoRefreshPage();
        if(window.OPM.isRMMCentral) {
            var dataToPostMessage = {name:"gen_settings_changed_response_from_opm", message:{languageChanged: true, sessionTimeoutUpdated: true}}; //No I18N
            window.MESSAGE_HANDLER.postMessage(dataToPostMessage, 'selfcast'); //No I18n
        }
    }
}
function enableIPManagement(successMsg){
    $('#OputilPlug').prop('checked', true);
    var url = window.OPM.apiUrlPattern + '/admin/updateVisibleModules'; //No I18n
    var frmData = {};
    var visibleModules = {
        "isDPIVisible":window.OPM.isDpiPlug, //No I18n
        "isNCMVisible": window.OPM.isNcmPlug, //No I18n
        "isNFAVisible": window.OPM.isNfaPlug, //No I18n
        "isAPMVisible": window.OPM.isApmPlug,//No I18n
        "isStorageVisible": window.OPM.isStoragePlug, //No I18n
        "isFWAVisible": window.OPM.isFwaPlug, //No I18n
        "isOPMVisible": true, //No I18n
        "isIPAMVisible": true //No I18n
    }
    
    frmData.visibleModules = JSON.stringify(visibleModules); 
    var response = opm_ajaxPostRequest(url, frmData);
    if(response !== undefined){
        if(response.error !== undefined){
                opm_infoMsgs("errorMsg",response.error.message); //NO I18n
        }else if(response.result !== undefined){
                var options = {};
                options.callback_func = function(){
                window.location.reload();
                }
                if(successMsg === undefined){
                    successMsg=response.result.message;
                }else if(successMsg === "OpUtilsEnabledFromOPMInt"){
                    successMsg = Ember.I18n.t('opu.spm.OpUtils_ENABLED_FROM_OPMINT', this);//No I18N
                }
            opm_infoMsgs("successMsg",successMsg,options); //No I18n
        }
        
    }  
}
function saveDisplayedModules(){
    var url = window.OPM.apiUrlPattern + '/admin/updateVisibleModules'; //No I18n
    var frmData = {};
    var visibleModules = {
        "isDPIVisible":false, //No I18n
        "isNCMVisible": $('#NcmPlug').is(':checked'), //No I18n
        "isNFAVisible": $('#NfaPlug').is(':checked'), //No I18n
        "isAPMVisible": $('#APMPlug').is(':checked'),//No I18n
        "isStorageVisible": $('#StoragePlug').is(':checked'), //No I18n
        "isFWAVisible": $('#FwallPlug').is(':checked'), //No I18n
        "isOPMVisible": true, //No I18n
        "isIPAMVisible": $('#OputilPlug').is(':checked') //No I18n
    }
    if(window.OPM.isDPIEnabled && $("#DpiPlug").is(":visible")){
        visibleModules.isDPIVisible = $("#DpiPlug").is(":checked"); //NO I18N
    }
    if(window.OPM.isOPMPLUS || window.OPM.isOPMAddOnModeEnabled) {
        visibleModules.isOPMVisible = $('#OpmPlug').is(':checked');
    }
    if((window.OPM.isOPMPLUS || window.OPM.isOPMAddOnModeEnabled) && !$('input[name="chkPlug"]').is(":checked")){
        opm_infoMsgs("infoMsg", Ember.I18n.t('webclient.moduleactivation.infomsg', this)); //No I18N
        return;
    }
    var doRefresh = false;
    var opmPlugActive = true;
    var nfaPlugActive = true;
    var ncmPlugActive = true;
    var fwaPlugActive = true;
    var opuPlugActive = true;
    var dpiPlugActive = true;
    var apmPlugActive = true;
    var storagePlugActive = true;
    $.each($('input[name="chkPlug"]'), function(k, v) {
        if (v.value == "OPM") {
            opmPlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (opmPlugActive !== window.OPM.isOpmPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isOpmPlug = window.OPM.isOpmPlug = opmPlugActive;
        } else if (v.value == "Storage") { //No I18N
            storagePlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (storagePlugActive !== window.OPM.isStoragePlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isStoragePlug = window.OPM.isStoragePlug = storagePlugActive;
        } else if (v.value == "NFA") { //No I18N
            nfaPlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (nfaPlugActive !== window.OPM.isNfaPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isNfaPlug = window.OPM.isNfaPlug = nfaPlugActive;
        } else if (v.value == "NCM") { //No I18N
            ncmPlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (ncmPlugActive !== window.OPM.isNcmPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isNcmPlug = window.OPM.isNcmPlug = ncmPlugActive;
        } else if (v.value == "FWA") { //No I18N
            fwaPlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (fwaPlugActive !== window.OPM.isFwaPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isFwaPlug = window.OPM.isFwaPlug = fwaPlugActive;
        } else if (v.value == "DPI") { //No I18N
            dpiPlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (dpiPlugActive !== window.OPM.isDpiPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isDpiPlug = window.OPM.isDpiPlug = dpiPlugActive;
        } else if (v.value == "OPUTILS") { //No I18N
            opuPlugActive =($('#' + v.id).prop('checked')) ? true : false;
            if (opuPlugActive !== window.OPM.isOPUPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isOPUPlug = window.OPM.isOPUPlug = opuPlugActive;
        } else if (v.value == "APM") { //No I18N
            apmPlugActive = ($('#' + v.id).prop('checked')) ? true : false;
            if (apmPlugActive !== window.OPM.isApmPlug) {
                doRefresh = true;
            }
            OPMClient.ApplicationController.isApmPlug = window.OPM.isApmPlug = apmPlugActive;
        }
    });
    frmData.visibleModules = JSON.stringify(visibleModules); //No I18n
    var response = opm_ajaxPostRequest(url, frmData);
    if(response !== undefined){
        if(doRefresh){
            if(response.error !== undefined){
                opm_infoMsgs("errorMsg",response.error.message); //NO I18n
            }else if(response.result !== undefined){
                var options = {};
                options.callback_func = function(){
                    if(OPMClient.ApplicationController.currentPath.indexOf("Home.Dashboard") > -1) {
                        sessionStorage.setItem("displayedModulesChangedInDashboard", true); //No I18n
                    }
                    window.location.reload();
                }
                opm_infoMsgs("successMsg",response.result.message,options); //No I18n
            }
        }else{
            showMessage(response);
            cancelDropDown();
        }
    }    
}
function uploadCustomImg(obj, fileDivId, drpDivId)
{
    var frmData = new FormData();
    var file = $("#"+fileDivId)[0].files[0];//No I18N
    if(file !== undefined && file !== null)
    {
        var mimeType=file.type;
        if(mimeType.split('/')[0]!=='image'){
            alert(Ember.I18n.t('webclient.settings.uploadproperimg',this)); //No I18N
            return false;
        }
    }
    
    var url = window.OPM.apiUrlPattern + '/businessview/uploadBusinessViewBG';//No I18N

    var _URL = window.URL || window.webkitURL;
    if(file = obj.files[0])
    {
        img = new Image();
        img.onload = function () {
            var width = this.width;
            var height = this.height;
            if(width <= 1000 && height <= 1000)
            {
            
                frmData.append('bvImage',file);//No I18N
                if(fileDivId === "bv_customPeripheralImg")
                {
                    frmData.append("fileUpload","bvObjImg"); //No I18N
                }else{
                    frmData.append("fileUpload","customIcons"); //No I18N
                }
                var response = opm_ajaxMultiPostRequestWithMsg(url,frmData,"",true);//No I18N    
                $("#"+fileDivId).val("");
                if(response !== undefined && !$.isEmptyObject(response))
                {
                    var message = Ember.I18n.t("webclient.map.upload.customerimg.failuremsg",this); //No I18N
                    if(response.result != undefined && response.result.message !== undefined)
                    {
                      
                        addClasses = "successMsg";//No I18N
                        message = Ember.I18n.t("webclient.map.uploadimg.successmsgs",this); //No I18N
                        if(drpDivId !==  null)
                        {
                            if(OPMClient.BVMapDetailsController.isJointBV)
                            {
                                
                                     if(fileDivId === "bv_customPeripheralImg")
                                     {
                                        OPMClient.BVMapDetailsController.peripheralsList.unshiftObject({imgSrc:bv_peripheralsImgUrl+response.result.message,iconName:response.result.message,name:response.result.message,displayName:opmSplitImageExtension(response.result.message),id:"_Menu_"+response.result.message,isCustom:true});//No I18N
                                     }else{
                                        OPMClient.BVMapDetailsController.customIconsList.unshiftObject({value:"/images/deviceicons/"+response.result.message,key:response.result.message});//No I18N
                                        Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
                                            $(".bv_element_Icons .bv-slider__thumb-device-icon[data-icon='"+response.result.message+"']").off().on("click",function(e){
                                                $(".bv-slider__thumb-device-icon.active").removeClass("active");
                                                $(this).addClass("active");
                                            });
                                        });
                                     }
                                 
                            }else{
                                $("#"+drpDivId+" select").select2({data:[{id: response.result.message, text: response.result.message}]});      
                                $("#"+drpDivId+" select").val(response.result.message).trigger('change');
                            }
                        }
                    }
                    else if(response.error != undefined && response.error.message !== undefined)
                    {
                         addClasses = "errorMsg";//No I18N  
                         message = response.error.message; 
                    }
                    else if(response.id !== undefined && response.text !== undefined)
                    {
                        addClasses = "successMsg";//No I18N
                        message = Ember.I18n.t("webclient.map.uploadimg.successmsgs",this); //No I18N
                         if(OPMClient.BVMapDetailsController.isJointBV)
                        {
                            if(window.OPM.isEEProbeSelected !== undefined && window.OPM.isEEProbeSelected)
                            {
                                 if(fileDivId === "bv_customPeripheralImg")
                                 {
                                    OPMClient.BVMapDetailsController.peripheralsList.unshiftObject({imgSrc:"data:image;base64,"+response.text,iconName:response.id,name:response.id,displayName:opmSplitImageExtension(response.id),id:"_Menu_"+response.id,isCustom:true});//No I18N
                                 }else{
                                    OPMClient.BVMapDetailsController.customIconsList.unshiftObject({value:"data:image;base64,"+response.text,key:response.id});//No I18N
                                    Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
                                        $(".bv_element_Icons .bv-slider__thumb-device-icon[data-icon='"+response.id+"']").off().on("click",function(e){
                                            $(".bv-slider__thumb-device-icon.active").removeClass("active");
                                            $(this).addClass("active");
                                        });
                                    });
                                 }
                             }
                        }
                        else if(drpDivId !==  null)
                        {
                            $("#"+drpDivId+" select").select2({data:[{id: response.text, text: response.id}]});      
                            $("#"+drpDivId+" select").val(response.text).trigger('change');
                        }
                    }
                    else
                    {
                        addClasses = "errorMsg";//No I18N
                    }
                    opm_infoMsgs(addClasses,message);
                }
            }
            else
            {
                alert(Ember.I18n.t("webclient.opm.bv.customicon.upload.info",this)); //No I18N
            }
        };
        img.src = _URL.createObjectURL(file);
        img.onerror = function(err)
        {
            opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.api.file.notsupport',this));//No I18N
        }
    }
}

function isValidMobileNumber(number){
    if(! /^[-+]?\d+(\.\d+)?$/.test(number)){
        return false;
    }
    return true;
}

function opm_goToAddvCenterPage(){
    opm_transitionToParentRoute("Settings.Discovery.AddDevice","AddVMware");//No I18N
}
var myCars=new Array("@comcast","@webex","@gmail","@yahoo","@hotmail","@msn","@rediff","@ymail","@live","@mail","@hushmail","@verizon","@metromail","@sbcglobal","@aol","@bellsouth","@rocketmail","@myspace","@facebook","@email","@bigpond","@optusnet","@primus","@tpg","@iprimus","@virginbroadband","@fastmail","@iinet","@y7mail","@dodo","@ozemail","@optus","@westnet");//No I18N
function businessEmailCheck(test)
{
    for(i=0;i<=myCars.length-1;i++)
    {
            var singleValue = myCars[i];
            var ex = test.match(singleValue);
            if (ex != null)
            {
                return true;
            }
    }
    return false;
}

function deleteVirtualEntity(){
    var msg = Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog_msg');//No I18N
    if (OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails.snapshotName === "Proxmox-Cluster") { //No I18N
        msg = Ember.I18n.t("webclient.opm.device.proxmox.deletewarning"); //No I18N
    }
    opmConfirm(Ember.I18n.t("webclient.admin.eventlogrules.warning"), msg, '',function() {//No I18n
        var probeID = "";
        if(window.OPM.isCentralServer)
        {
            probeID = ee_addManualProbeIDOnNeed(OPMClient.InventoryDeviceDetailsController.deviceName);
        }
        var entityType = "VMware-Datastore"; //No I18N
        // Set entityType based on snapshotName
        if (OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails.snapshotName === "Proxmox-Cluster") { //No I18N
            entityType = "Proxmox-Cluster"; //No I18N
        }
        var deleteVirtualEntityUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/deleteVirtualEntity?name='+OPMClient.InventoryDeviceDetailsController.deviceName+'&entityType='+entityType,probeID); //No I18N
        opm_ajaxPostRequestWithMsg(deleteVirtualEntityUrl, {}, Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'), function(response){ //No I18n
            if(response !== undefined){
                if(response.error !== undefined){
                    opm_infoMsgs("errorMsg",response.error.message); //No I18N
                }else if(response.result !== undefined){
                    var options = {};
                    options.callback_func = function(){
                        if(window.OPM.deviceListForNextPrev !== undefined && window.OPM.deviceListForNextPrev.includes(OPMClient.InventoryDeviceDetailsController.selDevice))
                        {
                            if(window.OPM.deviceListForNextPrev.indexOf(OPMClient.InventoryDeviceDetailsController.deviceName) < window.OPM.deviceListForNextPrev.length-1) 
                            {
                                OPMClient.DeviceActionController.next(OPMClient.InventoryDeviceDetailsController.inventorysnapType, OPMClient.InventoryDeviceDetailsController.selDevice);
                            }
                            else
                            {
                                OPMClient.DeviceActionController.prev(OPMClient.InventoryDeviceDetailsController.inventorysnapType, OPMClient.InventoryDeviceDetailsController.selDevice);
                            }
                        }       
                        else
                        {
                            var selectedMenu = (window.OPM.oldView)?"Summary":"Monitoring";//No I18N
                            location.href=window.OPM.apiclientUrl+"Inventory/List/"+selectedMenu+"/Devices"; //No I18N
                            loadDevicesListIntoGrid();
                        }
                    }
                    opm_infoMsgs("successMsg",response.result.message,options); //No I18N
                }
            }
        });
    }, "", "", "", "", "dialogStyle2", "", "", "", true, true, true);//No I18N

}
function opmBtnHldrFloat(){

    setTimeout(function()
    {
        opmBtnHldrPrntWd=$('.opmBtnHldr.floatingBtn').parent().outerWidth();
        opmBtnHldrPrntHt=$('.opmBtnHldr.floatingBtn').parent().outerHeight()-26;

        opmBtnHldrWd=$('.opmBtnHldr.floatingBtn').outerWidth();
        opmBtnHldrHt=$('.opmBtnHldr.floatingBtn').outerHeight();
        var opmBtnHldrPosLft;
        $('.opmBtnHldr.floatingBtn').offset() ? opmBtnHldrPosLft=$('.opmBtnHldr.floatingBtn').offset().left : '';

        $('.opmBtnHldr.floatingBtn').parent().css({width:opmBtnHldrPrntWd,height:opmBtnHldrPrntHt});
        $('.opmBtnHldr.floatingBtn').css({width:opmBtnHldrWd,height:opmBtnHldrHt,position:'fixed',bottom:'25px',left:opmBtnHldrPosLft});
    }, 1000);
}

function closeProductAppAd(id){
    $("#"+id).remove();
}

function openOPMAppDownloadLink(mobOSType){
     if(mobOSType === "android"){//No I18N
        window.open(Ember.I18n.t("webclient.applinks.opm.android",{param0:getCampaign()}),"_blank");//No I18N
    }else if(mobOSType === "ios"){//No I18N
        window.open(Ember.I18n.t("webclient.applinks.opm.ios",{param0:getCampaign()}),"_blank");//No I18N
    }
}

function checkAssociatedVMwareEvents(){
    var grid = $("#VmwareAddEventsList");//No I18N
    var gridData = grid.jqGrid("getGridParam","data");//No I18N
    for(var i=0; i<gridData.length; i++){
        if(gridData[i].ALREADY_MAPPED !== undefined && gridData[i].ALREADY_MAPPED === true){
            $("#VmwareAddEventsList").jqGrid("setSelection",gridData[i]._id_,true);//No I18N
            $("#jqg_VmwareAddEventsList_"+gridData[i]._id_).attr("disabled",true);//No I18N
        }
    }
}

function validateVMwareEventSelection(){
    var selRowIds = $("#vmwareEventsList").jqGrid('getGridParam','selarrrow'); //No I18N
    if(selRowIds!==undefined && selRowIds.length === 0){
        alert(Ember.I18n.t('webclient.inventory.attacks.eventselectalert',this));//No I18N
        return false;
    }else{
        var selectedEventsStr = [];
        $.each(selRowIds, function(i,val){
            var name =  $('#vmwareEventsList').jqGrid('getCell', val, 'EVENT_NAME'); //No I18N
            selectedEventsStr.push(name); //No I18N
        });
        redirectToAssociatePage({'selectedEvents':selectedEventsStr.toString()});//No I18N
    }
}

function loadCountryDetails(response){
    if(response === undefined){
        response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/licenseDetails?isFluidic=true");//No I18N
    }
    $("#licenseExpiryDays").html(Ember.I18n.t('webclient.opm.licenseexpireson',this)+" "+response.EvaluationExpiryDate);
    var countryList = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antarctica","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Benin","Bermuda","Bhutan","Bolivia","Bosnia","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Fiji","Finland","France","French Guiana","French Polynesia","Gabon","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","MarshallIslands","Martinique","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","NewZealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","PuertoRico","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","SanMarino","SaudiArabia","Senegal","Seychelles","Singapore","Slovakia","Slovenia","Somalia","SouthAfrica","SouthKorea","Spain","SriLanka","Sweden","Switzerland","Taiwan","Tajikistan","Tanzania","Thailand","Tibet","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","U.A.E","USA","Uganda","Ukraine","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Yugoslavia","Zambia","Zimbabwe"];//No I18N 
    var countryOptions = "";
    for(var i=0;i<countryList.length;i++) {
        countryOptions += "<option value='"+countryList[i]+"'>"+countryList[i]+"</option>"; //No I18N
    }
    $("#el_country").html(countryOptions);
    $("#el_country").select2().val("USA").trigger("change");//No I18N 
}

function redirectToLicenseRegisterPage(){
    closeProductAppAd('productTrialExpiresInfo');//No I18N
    showLicenseRigisterPage();
}

function opm_gotoASFRegistrationPage(){
    closeProductAppAd('productExpiresInfo');//No I18N
    window.open(OPMClient.ApplicationController.asfRenewalLink,"_blank");//No I18N
}

function gotoDbQueryPg(){
    window.open("/apiclient/ember/dbQuery.jsp","_blank");
}
function helpcard2Click(e,page)
{
    $('.hasHelpCardBar,.hasHelpCardBarStyle').remove();
    tis=$(e);
    if(!$(tis).hasClass('clicked')){
        $('.hasHelpCard2').removeClass('clicked');
        $(tis).addClass('clicked');
        title=$(tis).attr('data-title');
        content2=$(tis).attr('data-content2');
        if(content2===undefined){
            content=$(tis).attr('data-content1');
        }else{
            if($(tis).hasClass('oputils')){
                content=$(tis).attr('data-content1')+"</br></br>"+$(tis).attr('data-content2');
            }else{
                if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Agents.OPM") >= 0)
                {
                    content=""+$(tis).attr('data-content1')+"</br></br>"+$(tis).attr('data-content2');
                }
                else
                {
                    content="</br>"+$(tis).attr('data-content1')+"</br></br>"+$(tis).attr('data-content2');
                }
            }
        }
        Pos=$(tis).offset();
        PosY=Pos.top+$(tis).outerHeight()+7;
        ArrowPosY=Pos.top+$(tis).outerHeight()+7;
        PosX=Pos.left;
        ArrowPosX=Pos.left;
        ToolBarWd=580;
        TotalHt=PosY+175;
        if(wHt<TotalHt){
            ArrowPosY=PosY;
            PosY=PosY-210;
        }

        $('body').append("<div class='hasHelpCardBar' style='top:"+PosY+"px'><div class='title'>"+title+"</div></div>");
        $('.hasHelpCardBar').css({width:ToolBarWd});
        $('.hasHelpCardBar').append("<div class='content ProductCustomScroll'>"+content+"</div>");
        $('.hasHelpCardBar .content').mCustomScrollbar();
        dis=PosX+($(tis).outerWidth()/2);
        TotalWd=dis+(ToolBarWd/2);
        if(wWd>TotalWd && ($(tis).attr('data-align') != 'left')){
            CtrPos=dis-(ToolBarWd/2);
            $('.hasHelpCardBar').css({left:CtrPos});
            if(wHt<TotalHt){
                $('body').append('<style class="hasHelpCardBarStyle">.hasHelpCardBar:before{position:abosolute;top:auto;bottom:-7px;left:-5px}</style>');
            }
        }else{
            ArrowPosX=PosX+($(tis).outerWidth()/2)-4;
            PosX=wWd-(ToolBarWd+15);
            if($(tis).attr('data-align') == 'left'){
                ArrowPosX = dis-3;
                PosX = dis-70;
                if(wHt < TotalHt){
                    ArrowPosY -= 41; 
                    ArrowPosX -= 4;
                    if(content2 == undefined){
                        $('.hasHelpCardBar').css({top:PosY+49});
                    }
                }
                if(content2 == undefined){
                    $('.hasHelpCardBar > .content').css('height','80px');
                    if(page === 'fromDevAlarm'){
                        $('.hasHelpCardBar > .content').css('height','170px');
                    }
                }
            }
            $('body').append('<style class="hasHelpCardBarStyle">.hasHelpCardBar:before{position:fixed;top:'+(ArrowPosY-7)+'px;right:auto;left:'+ArrowPosX+'px}</style>');
            $('.hasHelpCardBar').css({left:PosX});
        }
    }else{
        $('.hasHelpCard2').removeClass('clicked');
    }
}
function opm_mask(strToMask, first, last) {
    if(strToMask!==undefined && strToMask!==null){
        first = (first || 0);
        last = (last || 0);
        return strToMask.substring(0, first) + strToMask.substring(first, strToMask.length - last).replace(/./g, "*") + strToMask.substring(strToMask.length - last);
    }
    return "";
}
function isValidPwd(pwd, sameUsrPwd, pwdMinLen, pwdMaxLen, complexPwd) {
    pwdMinLen = (pwdMinLen !== undefined) ? pwdMinLen : OPMClient.SettingsUsersController.minLength;
    pwdMaxLen = (pwdMaxLen !== undefined) ? pwdMaxLen : OPMClient.SettingsUsersController.maxLength;
    complexPwd = (complexPwd !== undefined) ? complexPwd : OPMClient.SettingsUsersController.isComplexPwd;
    var obj = {
        'result': true, //No I18N
        'emptyCheck': true, //No I18N
        'minLen': true, //No I18N
        'maxLen': true, //No I18N
        'upperChar': false, //No I18N
        'lowerChar': false, //No I18N
        'specialChar': false, //No I18N
        'usrPwdEql': false //No I18N
    };
    if (pwd === undefined || pwd === '') {
        obj.emptyCheck = obj.minLen = obj.maxLen = obj.result = false;
    } else {
        if (pwd.length < pwdMinLen) {
            obj.minLen = obj.result = false;
        }
        if (pwd.length < 1 || pwd.length > pwdMaxLen) {
            obj.maxLen = obj.result = false;
        }
        if (OPMClient.SettingsUsersController.loginName_indepndt && sameUsrPwd !== undefined && sameUsrPwd === pwd) {
            obj.usrPwdEql = true;
            obj.result = false;
        }
        if (complexPwd === true) {
            var anUpperCase = /[A-Z]/;
            var aLowerCase = /[a-z]/;
            var aSpecial = /[~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
            for (var i = 0; i < pwd.length; i++) {
                if (anUpperCase.test(pwd[i])) {
                    obj.upperChar = true;
                }
                else if (aLowerCase.test(pwd[i])) {
                    obj.lowerChar = true;
                }
                else if (aSpecial.test(pwd[i])) {
                    obj.specialChar = true;
                }
            }
            if (
                obj.upperChar === false ||
                obj.lowerChar === false ||
                obj.specialChar === false
            ) {
                obj.result = false;
            }
        }
    }
    return obj;
}
function passwordCheck(mainDiv, result) {
    if (result.emptyCheck === true) { $(mainDiv + ' .emtyPwd').addClass('done'); } else { $(mainDiv + ' .emtyPwd').removeClass('done'); }
    if (result.usrPwdEql !== true) { $(mainDiv + ' .sameUsrPwd').addClass('done'); } else { $(mainDiv + ' .sameUsrPwd').removeClass('done'); }
    if (result.minLen === true) { $(mainDiv + ' .pwdMnLn').addClass('done'); } else { $(mainDiv + ' .pwdMnLn').removeClass('done'); }
    if (result.maxLen === true) { $(mainDiv + ' .pwdMxLn').addClass('done'); } else { $(mainDiv + ' .pwdMxLn').removeClass('done'); }
    if (result.specialChar === true) { $(mainDiv + ' .oneSpclChar').addClass('done'); } else { $(mainDiv + ' .oneSpclChar').removeClass('done'); }
    if (result.upperChar === true && result.lowerChar === true) { $(mainDiv + ' .oneLwrUprChar').addClass('done'); } else { $(mainDiv + ' .oneLwrUprChar').removeClass('done'); }
}

function toggleElementVisibilityByID(id){
    $("#"+id).toggle();
    }

function closeChangePassPopup(){
    $('#passwordChangeAlert').hide();
}

function gotoPasswordPage(){
    $('#passwordChangeAlert').hide();
    // opm_transitionToTheRoute("Settings.Basic.UserMgmt.List");//No I18N
    setTimeout(function(){
            opm_quickLinksSelector('changePassword');//No I18n
    }, 100);
}

function showSDPV3UpdatePopup(){
    setTimeout(function(){
    $("#SDPV3UpdateAlert").show();
    $("body").addClass("ui-dialog-style2 ui-dialog-hide-title ui-dialog-custom-title");
    $("#SDPV3UpdateAlert").dialog({
                modal: true,
                resizable: false,
                width: 500,
                closeOnEscape: false
            });
    },1000);
}

function closeSDPV3UpdatePopup(){
    $("#SDPV3UpdateAlert").hide();
    $("body").removeClass("ui-dialog-style2 ui-dialog-hide-title ui-dialog-custom-title");
    $('#SDPV3UpdateAlert').dialog('close');
    sessionStorage.setItem("SDPV3_UPDATE_ALERT", "false");//No i18N
}

function showSDPMSPV3UpdatePopup(){
    setTimeout(function(){
    $("#SDPMSPV3UpdateAlert").show();
    $("body").addClass("ui-dialog-style2 ui-dialog-hide-title ui-dialog-custom-title");
    $("#SDPMSPV3UpdateAlert").dialog({
                modal: true,
                resizable: false,
                width: 500,
                closeOnEscape: false
            });
    },1000);
}

function closeSDPMSPV3UpdatePopup(){
    $("#SDPMSPV3UpdateAlert").hide();
    $("body").removeClass("ui-dialog-style2 ui-dialog-hide-title ui-dialog-custom-title");
    $('#SDPMSPV3UpdateAlert').dialog('close');
    sessionStorage.setItem("SDPMSPV3_UPDATE_ALERT", "false");//No i18N
}

function showPasswordChangeAlert(){
    setTimeout(function(){
        $("#passwordChangeAlert").show();
    },1000);
    sessionStorage.setItem("PASSWORD_POLICY_ALERT", "false");//No i18N
}

function checkAPMPluginCompatability(){
    if(!window.OPM.isDemoUser && !window.OPM.isEEProbeSelected && OPMClient.AppsApmDetailsController.apmInstalled && ((window.OPM.apmBuildNumber === undefined || window.OPM.apmBuildNumber === "null" || window.OPM.apmBuildNumber === null) || ((parseInt(window.OPM.apmBuildNumber) < window.OPM.APMCompatibleVersion) && (window.OPM.productBuildNumber !== undefined && window.OPM.productBuildNumber !== "null" && window.OPM.productBuildNumber !== null) && (parseInt(window.OPM.productBuildNumber) >= window.OPM.OPMCompatibleVersion)))){
        setTimeout(function(){
            $("#APMUpgradeInfo").show();
        },500);
    }
}

function openAPMDownloadLink(){
    window.open(Ember.I18n.t('webclient.apm.upgrade.servicepack.link'),"_blank");//No I18N
}

function opstor_changeAuthProto()
{
    var authprotoVal = $('#sanauthprotocol').val();
    if(authprotoVal !== "None")
    {
        $("#sanauthpwd_eye").show();
        $('#sanauthpwd').attr("disabled",false);
        $('#sanprivprotocol').attr("disabled",false);
        var encProtoVal = $('#sanprivprotocol').val();
        if(encProtoVal === "None")
        {
            $('#sanprivpwd').attr("disabled",true);
        }
        else
        {
            $('#sanprivpwd').attr("disabled",false);
        }
    }
    else
    {
        $("#sanauthpwd_eye").hide();
        $('#sanauthprotocol').attr("value","None");
        $('#sanauthpwd').attr("disabled",true);
        $('#sanprivprotocol').select2().val('None').trigger('change');//No I18N
        $('#sanprivprotocol').attr("disabled",true);
        $('#sanprivpwd').attr("disabled",true);
    }
}

function opstor_changeEncProto()
{
    var encProtoVal = $('#sanprivprotocol').val();
    if(encProtoVal !== "None"){
        $("#sanprivpwd_eye").show();
        $('#sanprivpwd').attr("disabled",false);
    }
    else{
        $("#sanprivpwd_eye").hide();
        $('#sanprivpwd').attr("disabled",true);
    }
}
var opm_htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};
// Escape a string for HTML interpolation.
function opm_escapeHTML(string) {
  return ('' + string).replace(opm_htmlEscaper, function(match)
  {
    return opm_htmlEscapes[match];
  });
};
function confIntfEditedCnt(rowId)
{
    if(OPMClient.InventoryDeviceDetailsController.configuredPortsArr.indexOf(rowId) === -1)
    {
        OPMClient.InventoryDeviceDetailsController.configuredPortsArr.push(rowId);
    }
}


function goToSNMPUploadMIB(){
    if(window.OPM.currentView.name.indexOf("Settings.Monitors.SubMonitors.AddSNMPMonitor") > -1){//No I18N
        opm_transitionToParentRoute("Settings.Monitors.SubMonitors.AddSNMPMonitor.AddSNMP.SNMPMIBBrowser");//No I18N
    }else{
        opm_transitionToParentRoute("Inventory.Device.Monitors.AddSNMPMonitor.AddSNMP.SNMPMIBBrowser");//No I18N
    }
}
function isDescContainsSpecialChar(val)
{
     /**** This function excludes space hyphen and Underscore characters ****/
     var iChars = '!@#$^&*()+={}[]\\\;/\":<>';//No I18N
     for (var i = 0; i < val.length; i++) 
    {
        if (iChars.indexOf(val.charAt(i)) != -1) 
        {
            return false;
        }
    }
    return true;
}

function customSNMPMIBTreeView(mib){
    $.ajax(
    {
        url: window.OPM.apiUrlPattern + '/v2/mibbrowser/loadMibModulesAndNodes?mibname='+mib, //No I18n
        type: 'GET', //No I18N
        async:false,
        success: function(jsonData)
        {
            if(jsonData.error !== undefined)
            {
                opm_infoMsgs('errorMsg',opm_escapeHTML(jsonData.error.message)); //No I18N
            }
            else
            {
                $('.errorMsg').hide();
            }
            var mibNameFrmData = Object.keys(jsonData)[0];
            var myVar = setTimeout(function(){
               $('#csnmp_treeListView').on('changed.jstree', function (e, data) { //No I18N
                    if(data!==undefined && data.node!==undefined){
                        if(data.node.original.ObjectID!==undefined){
                            $("#csnmp_objectID").val(data.node.original.ObjectID);
                            $("#csnmp_oidName").val(data.node.original.text);
                            $("#csnmp_objectID").attr('node-type',data.node.original.nodeType);//No I18N
                            $("#csnmp_objectID").attr('data-type',data.node.original.type);
                            if(data.node.original.checkNumeric!==undefined && data.node.original.checkNumeric===false){
                                $("#csnmp_objectID").attr('data-checkNumeric',false);
                            }
                            else{
                                $("#csnmp_objectID").attr('data-checkNumeric',true);
                            }
                            if(data.node.original.isTable!==undefined && data.node.original.isTable===true){
                                $("#csnmp_objectID").attr('data-isTable',true);
                            }
                            else{
                                $("#csnmp_objectID").attr('data-isTable',false);
                            }
                        }
                        if(data.node.original.Syntax!==undefined){
                            $("#csnmp_syntax").val(data.node.original.Syntax);
                        }
                        if(data.node.original.Description!==undefined){
                            var desc = data.node.original.Description.replace("\'","\\'").replace(/\s{2,}/g, ' ').replace(/"/g,'').replace(/'/g,'');
                            $("#csnmp_mib_node_description").val(desc);
                        }
                        else{
                            $("#csnmp_mib_node_description").val("");
                        }
                    }
                })
                .jstree({
                    'core' : { //No I18N
                        'themes' : { 'responsive' : false }, //No I18N
                        'data' : jsonData[mibNameFrmData] //No I18N
                    }, 
                    'search': {//No I18N

                        'case_insensitive': true,//No I18N
                        'show_only_matches' : true,//No I18N
                        'search_callback': function(str, node) {//No I18N

                          var searchFor = str.toLowerCase().replace(/^\s+/g, '').replace(/\s+$/g, '');//No I18N
                        
                            if ((node.original.ObjectID || "").toLowerCase().indexOf(searchFor) >= 0 || (node.text || "").toLowerCase().indexOf(searchFor) >= 0 || (node.original.Description || "").toLowerCase().indexOf(searchFor) >= 0 ) {//No I18N
                              return true;
                            }
                          return false;
                        }
                    },

                    'plugins' : ['dnd','wholerow','search'] //No I18N

                }).bind("loaded.jstree", function (event, data) {
                    $(this).jstree("open_all");//No I18N
                })
                clearInterval(myVar);
            }, 500);
            if($('#csnmp_treeListView').jstree(true).settings !== undefined){
                $('#csnmp_treeListView').jstree(true).settings.core.data = jsonData[mibNameFrmData];
                $('#csnmp_treeListView').jstree(true).refresh();
                custommibToggleAll('csnmp_treeListView','open_all');//No I18N
            }
        }
    });
}

function custommibToggleAll(id,action){
    $("#"+id).jstree(action);//No I18N
}

function openProbeDownloadLink(){
    if (window.OPM.language === 'ja_JP'){
        window.open(OPMClient.SettingsConfigurationController.enterpriseDownloadLink,"_blank");
    } else {
        if(confirm(Ember.I18n.t('opm.ee.confirm.probedownload',{ param0:window.OPM.productBuildNumber},this))){//No I18N
            if(window.OPM.isNCMEE) {
                window.open("https://archives.manageengine.com/network-configuration-manager/"+window.OPM.productBuildNumber,"_blank");//No I18N
            } else if(window.OPM.isOPMPlusCentral) {
                window.open("https://archives2.manageengine.com/it-operations-management/"+window.OPM.productBuildNumber,"_blank");//No I18N
            } else {
                window.open("https://archives.manageengine.com/opmanager/"+window.OPM.productBuildNumber,"_blank");//No I18N
            }
        }
    }
}

function opm_ip4RangeValidate(rangeList)
{
        var count = 0;
        var firstElement = "";

        for(var k=0;k<rangeList.length;k++){
                var startVal = $("#"+rangeList[k].fromId).val();
                var endVal = $("#"+rangeList[k].toId).val();
                var startRange = startVal.split(".");
                var endRange = endVal.split(".");
                var flag = true;

                for(var i=0;i<=3;i++){
                     
                    var startIP = startRange[i];
                    var endIP = endRange[i];
                    if(flag){
                        if(i == 0){
                            if(parseInt(endIP) < parseInt(startIP))
                            {
                                if(count === 0){ firstElement = "#"+rangeList[k].toId;}//No I18N 
                                $("#"+rangeList[k].toId).addClass('validateField error');//No I18N
                                $("#"+rangeList[k].toId).attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                                flag = false;
                                count++;
                            }
                        }else if(flag){
                            var startIP1 = startRange[i-1];
                            var endIP1 = endRange[i-1];
                         /* if(parseInt(endIP1) > parseInt(startIP1)){
                                return false;
                            }*/
                            if(parseInt(endIP1) === parseInt(startIP1))//No I18N
                            {
                                if(parseInt(endIP) < parseInt(startIP))//No I18N
                                {
                                    if(count === 0){ firstElement = "#"+rangeList[k].toId; }//No I18N 
                                    $("#"+rangeList[k].toId).addClass('validateField error');//No I18N
                                    $("#"+rangeList[k].toId).attr('data-error',Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                                    count++;
                                }
                            }
                        }
                    }
                }

            }
            $(firstElement).focus();
            opmValidate($(firstElement));
            $('.validateField').on('focusin',function(){
                opmValidate($(this));
            });
            $('.validateField').on('focusout',function(){
                $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
            });
        if(count > 0){
          return false;    
         }    
        return true;
}

function opm_IPRangeConfirmation(rangeList)
{
    for(var k=0;k<rangeList.length;k++){
        var startVal = $("#"+rangeList[k].fromId).val();
        var endVal = $("#"+rangeList[k].toId).val();
        var startRange = startVal.split(".");
        var endRange = endVal.split(".");
        if(parseInt(startRange[0]) !== parseInt(endRange[0]) || parseInt(startRange[1]) !== parseInt(endRange[1]))
        {
            return confirm(Ember.I18n.t('webclient.discovery.range.confirm',this));//No I18N
        }
        else if((parseInt(endRange[2]) - parseInt(startRange[2])) >= 254)
        {
            return confirm(Ember.I18n.t('webclient.discovery.range.confirm',this));//No I18N   
        }
    }
    return true;
}

function spclCharProbeName(probeName) {
    if(/^[a-zA-Z0-9_\s]+$/.test(probeName)) {
        return true;
    }
    return false;
}

function spclCharCustomerName(customerName) {
    var allSpclCharsForRegex = "~\\s!@#$%^&*()+{}|:\"<>?`[\\]\\-;',./\\\\";
    var withoutSpace = allSpclCharsForRegex.replace('\\s','');
    var regex = new RegExp("^([^"+allSpclCharsForRegex+"][^"+withoutSpace+"]*)*[^"+allSpclCharsForRegex+"]$");
    if(regex.test(customerName)) {
        return true;
    }
    return false;
}

function resizeIframe(obj) {
  var height=$(document).height();
    obj.style.height =height-335+'px';
}

function addFieldCriteriaValidation(pageId){
    $("#criteriaPattern_"+pageId).addClass('validateField error'); //No I18N
    $("#criteriaPattern_"+pageId).focus();
}

function getSelectedFiltersData(list,pageId){
    if(list===undefined || list.length===0){
        list=OPMClient.ReportsArrayController.list;
    }
    var  cList = OPMClient.ReportsArrayController.criteriaList[pageId];
    if(cList === undefined){
        return;
    }
    if(cList.length==1 && cList[0].filter==0){
        if(pageId!=='AdvRep') {
            //atleast one criteria is needed
            $('#criteria0'+"_"+pageId+' .filterTextValue').addClass('validateField error'); //No I18N
            $('#criteria0'+"_"+pageId+' .filterTextValue').focus();
            opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.ipgrp.atleastonecrit')); //No I18N
            return false;
        }
        return ;
    }
    if(cList.length==1 && cList[0].filter!=0){
        var flag=validateCriteria(cList[0]);
        if(!flag) {
            if(pageId==='AdvRep') {
                openTabStatic("ApplyCriteria",true);//No I18N
                validateCriteria(cList[0]);
                return false;
            } else {
                return false;
            }
        }
    }
    var filtersData = {},filters={},operator,value;
    var flag = false;
    if((cList).length > 0 ){
        var hasAvailability = false;
        $.each(cList,function(key,criteria){
            flag =validateCriteria(criteria);
            var pageId = criteria.pageId;
            if(pageId==='AdvRep') {
                if(!flag) {
                    openTabStatic("ApplyCriteria",true);//No I18N
                    validateCriteria(criteria);
                    return false;
                }
            }
            var idSuffix = criteria.index;
            var rowNumber = criteria.rowNumber;
            var operator = criteria.filterTypeValue;
            var value = criteria.selectedValueType != undefined && criteria.disable!==true ? criteria.filterTextValue:criteria.filterTextValue;
            var filterIndex = list.map(function(e){return e.columnId;}).indexOf(criteria.selectedColumnId);
            var componentId =  list[filterIndex].componentId;
            var columnName = list[filterIndex].columnName;
            if(componentId === 1001 && columnName==="Availability"){
                hasAvailability = true;   
            }
            if(OPMClient.ReportsArrayController.moduleID==="7") {
                if(criteria.filterList) {
                    value = criteria.filterValue;
                }
            }
            if(value.length <1 && criteria.disable!==true){
                $('#criteria'+idSuffix+"_"+pageId+' .filterTextValue').addClass('validateField error'); //No I18N
                $('#criteria'+idSuffix+"_"+pageId+' .filterTextValue').focus();
                opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.admin.thresholdedit.empty',this)); //No I18N
                return false;
            }
            if(operator === '--'){
                $('#criteria'+idSuffix+"_"+pageId+' .OperatorValue').addClass('validateField error'); //No I18N
                $('#criteria'+idSuffix+"_"+pageId+' .OperatorValue').focus();
                opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.report.filter.select.operator',this)); //No I18N
                return false;
            }
            if(!filters[componentId]){
                filters[componentId] = [];
            }
            if(!Array.isArray(value))
            {
                value =[value];
            }
            if(value.length < 1){
                value.push("");
            }
            var map = {
                'operator':operator,//NO I18N
                'value':value,//NO I18N
                'columnName':columnName,//NO I18N
                'filterId':rowNumber//NO I18N
            };
            if(criteria.valueTypeNeeded) {
                if($("#selectedValueType"+idSuffix+"_"+pageId+" :selected").attr("data-tag") === "95thPercentile") {
                    map.valueType = $("#selectedValueType"+idSuffix+"_"+pageId).val()+getNumberSuffix($("#selectedValueType"+idSuffix+"_"+pageId).val()); //No I18N
                    map.isPercentile=true;
                } else {
                    map.valueType = $("#selectedValueType"+idSuffix+"_"+pageId).val();
                }
            }
            filters[componentId].push(map);
        });
		var rowCount = Object.keys(filters).length;
        filtersData.filterCount = (cList).length;
        filtersData.filters = filters;
        if((cList).length > 1){
            filtersData.filtersPattern = $('#criteriaPattern_'+pageId).val();
        }
        filtersData.hasAvailability=hasAvailability;
    }
 
      
    if(!flag) {return false;}
    return (filtersData);
}
function enableMerakiProxy()
{
    var proxyStatus = $("#proxyEnabled").prop('checked');//No I18N
    proxyFormenableDisable(proxyStatus);
    if(!proxyStatus){
        $("#proxyEnabled").prop('disabled',false);//No I18N
    }
}
function editMspCustomerAllocation(actionContext,actionName,id, cancelActionName) {
    var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getElementAllocation?customerID='+(id ? id : window.OPM.selCustomerID)); //No I18N
    if(response) {
        response.actionContext = actionContext;
        response.id = id;
        response.actionName = actionName;
        response.cancelActionName = cancelActionName;
        OPMClient.ApplicationController.set('allocatedDetails',response);//No I18N
        OPMClient.ApplicationController.set('allocatedDetails.'+actionName,true);//No I18N
        Ember.run.schedule('afterRender', function() {//No I18N
            $('.licenceDetails.exceeding').addClass('slideOpened'); //No I18n
        }); 
    }
}
function removeAllocationSlide() {
    $('.licenceDetails.exceeding').removeClass('slideOpened'); //No I18n
    OPMClient.ApplicationController.set('allocatedDetails',undefined); //No I18n
}

function opm_isValidRackLabelName(paramVal) 
{
    var iChars = '~`!%&+\\\'\"?:,;<>=/'; //No I18N
    for (var i = 0; i < paramVal.length; i++) 
    {
        if (iChars.indexOf(paramVal.charAt(i)) != -1) 
        {
            return false;
        }
    }
    return true;
}

function opm_isValidAPCriteriaVal(paramVal)
{
    var iChars = '\'\"<>'; //No I18N
    for (var i = 0; i < paramVal.length; i++)
    {
        if (iChars.indexOf(paramVal.charAt(i)) != -1)
        {
            return false;
        }
    }
    return true;
}

function opm_ansibleCommandInputVal(value) 
{
    var reg = /[|;&>]|[$]\s|\$\(/;
    return reg.test(value);
}

function checkUrl(){
    if(window.OPM.apmInstalled==="true" && window.OPM.isAPMAdmin){//No I18N
        if((Number(window.OPM.apmBuildNumber)>=173100)){
            var url = $('#urlAddress').val();//No I18N
            if(url !== undefined){
                if(!url.startsWith("https://")){//No I18N
                    $('#httperrormsg').show();//No I18N
                    $('#SSLcheckbox').prop('checked', false);//No I18N
                    $('#SSLcheckbox').attr("disabled",true);//No I18N
                }else{
                    $('#httperrormsg').hide();//No I18N
                    $('#SSLcheckbox').attr("disabled",false);//No I18N
                }
            }
        }
    }
}

function toggleTrapDeviceDropDown(){
    $("#disableTrapSpcDeviceDropdown").toggle(); //No I18n
    if($("#disableTrapSpcDeviceChk").prop('checked')){
        $("#disableTrapSpcDeviceSearch").focus(); //No I18n
        checkAndShowTrapDisableDropDown(OPMClient.TrapsController.trapDisabledDevicesList, true);
    }
}
function checkAndShowTrapDisableDropDown(disabledDevicesList, isMulti){
    if (!disabledDevicesList) {
        disabledDevicesList = [];
    } else if (disabledDevicesList.length > 0) {
        $("#disableTrapSpcDeviceChk").prop('checked',true);
        $("#disableTrapSpcDeviceDropdown").show(); //No I18n
        OPMClient.TrapsController.set("selDevicesCount",disabledDevicesList.length);//No I18N
    }
    if($("#disableTrapSpcDeviceChk").prop('checked') || isMulti){
        var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getTrapSettings"); //No I18N
        var trapDisabledList = [];
        var trapNotDisabledList = [];
        var trapEnabledDevices = response.devices.filter(function (device) {
        return device.trapEnabled;
        });
        if (trapEnabledDevices.length === 0) {
            OPMClient.TrapsController.trapEnabledDevices = undefined;
            return;
        } else {
            OPMClient.TrapsController.trapEnabledDevices = trapEnabledDevices;

            $.each(trapEnabledDevices, function(index, device)
            {
                var checked = "";
                if(disabledDevicesList.indexOf(device.moid) !== -1)
                {
                    checked = "checked"; //No I18n
                    trapDisabledList.push({"moid":device.moid,"displayname":device.displayname,"isChecked":checked}); //No I18n
                } else {
                    trapNotDisabledList.push({"moid":device.moid,"displayname":device.displayname,"isChecked":checked}); //No I18n
                }
            });
            if(trapDisabledList.length === 0 && !isMulti) {
                OPMClient.TrapsController.set("selDevicesCount",0);//No I18N
                $("#disableTrapSpcDeviceChk").prop('checked',false);
                $("#disableTrapSpcDeviceDropdown").hide(); //No I18n
            } else{
                OPMClient.TrapsController.set("selDevicesCount",trapDisabledList.length);//No I18N
                trapDisabledList.push.apply(trapDisabledList, trapNotDisabledList);
                OPMClient.TrapsController.set("trapDeviceList",trapDisabledList); //No I18n
            }
        }

        $('#disableTrapForDevices .credentialBox .selectBox').off("click"); //No I18n
        $('#disableTrapForDevices .credentialBox .selectBox').on('click',function(){
            $(this).parents('.credentialBox').toggleClass('active');  //No I18n
        });
        $(document).mouseup(function (e){
            var container = $('.credentialBox');
            if (!container.is(e.target) && container.has(e.target).length === 0)
            {
                container.removeClass('active');
            }
        });
        $("#disableTrapSpcDeviceSearch").keyup(function () {
            var searchString = $(this).val();
            listSearch(searchString,"trapDeviceList");//No I18N
        });

        $('#disableTrapForDevices .opmChckList .chk').off("click"); //No I18n
        $('#disableTrapForDevices .opmChckList').on("click",".chk",function(){
            if(!$(this).hasClass('chkParent')){
            childChk=$(this).parent().parent().parent().find('ul .chk');
                childFlag=0;
                childChk.each(function(){
                    if(!this.checked){
                    childFlag=1;}
                });
                if(childFlag==0){
                    $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',false); //No I18N
                }else{
                    $(this).parent().parent().parent().parent().find('.chkParent').prop('checked',true); //No I18N
                }
            }
            OPMClient.TrapsController.set("selDevicesCount",$("#trapDeviceList .chkChild[type=checkbox]:checked").length);//No I18N
            });

        $('#disableTrapForDevices .opmChckList .chkParent').change(function(){
            that=$('.chk');
            if(this.checked){
                that.each(function(){this.checked=true;});
            }else{
                that.each(function(){this.checked=false;});
            }
            OPMClient.TrapsController.set("selDevicesCount",0);//No I18N
        });
    }
}

function highlightInputsByWords(inputSelector, words) {
    $(inputSelector).each(function() {
        var $li = $(this);
        // Find the text node (not inside any span)
        $li.contents().filter(function() {
            return this.nodeType === 3; // Node.TEXT_NODE
        }).each(function() {
            var text = this.nodeValue;
            var regex = new RegExp('(' + words + ')', 'gi');
            var highlighted = text.replace(regex, '<span class="searchTxt">$1</span>');
            // Replace only the text node with highlighted HTML
            $(this).replaceWith(highlighted);
        });
    });
}

function searchMSPDropdown(searchString) {
    // Probe Search and Batch update
    var mspCurrentScopeList = JSON.parse(JSON.stringify(window.OPM.mspCustomerNameList));
    if (!searchString || searchString.trim() === '') {
        mspCurrentScopeList = JSON.parse(JSON.stringify(window.OPM.mspCustomerNameList));
    } else if (mspCurrentScopeList[0].CustomerName === Ember.I18n.t('webclient.settings.customer.all')) {
        mspCurrentScopeList = mspCurrentScopeList.slice(1);
    }
    mspCurrentScopeList = mspCurrentScopeList.map(function (item) {
        var count = 0;
        var isCustomerMatch = item.CustomerName.toLowerCase().indexOf(searchString.toLowerCase()) >= 0;
        // If search string is empty, set matchedProbeCount to 0 and show all items
        if (!searchString || searchString.trim() === '') {
            return $.extend({}, item, {matchedProbeCount: 0});
        }
        
        //Dashboard Page handling exceptional case no probe list search needed
        else if (window.location.href.indexOf("Home/Dashboard") >= 0) {
            var allProbesStr = "all probes"; //No I18N
            if (allProbesStr.indexOf(searchString) !== -1) {
                return $.extend({}, item, {matchedProbeCount: 1, isCustomerMatch: isCustomerMatch});
            }
            return $.extend({}, item, {matchedProbeCount: 0, isCustomerMatch: isCustomerMatch});
        }

        // Existing probe matching logic
        if (item.ProbeInfo) {
            item.ProbeInfo.forEach(function (probe) {
                if (probe.ProbeDisplayName.toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
                    count++;
                }
            });
        }
        
        return $.extend({}, item, {matchedProbeCount: count,  isCustomerMatch: isCustomerMatch});
    });
    
    OPMClient.ApplicationController.set('mspCurrentScopeList', mspCurrentScopeList);//No I18N
    OPMClient.ApplicationController.set('ProbeInfo', []);//No I18N
    Ember.run.schedule('afterRender', function() {//No I18N
        highlightInputsByWords('#selectCustProbe__customer li .customerName', searchString); //No I18N
        $("#selectCustProbe__customer li.customerList").each(function () {
            var customerID = $(this).attr('value');
                var customer = mspCurrentScopeList.find(function(c) {
                    return c.CustomerID == customerID;
                });
                if (!searchString || searchString.trim() === '') {
                    $(this).show(); // Show all items when search is empty
                } else if (customer && (customer.isCustomerMatch || customer.matchedProbeCount > 0)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
    });
}
function showmTLSImport(selectedProtocol){
    if(selectedProtocol === 'mtls'){
        $('#tlsCertSection').hide();
        $('#mtlsCertSection').show();
    }else{
        $('#mtlsCertSection').hide();
        $('#tlsCertSection').show();
    }
}
function showMTLSImportSec(showImport){
    if(showImport){
        $('#existCertiSection').hide();
        $('#mtlsImportSection').show();
    }else{
        $('#mtlsImportSection').hide();
        $('#existCertiSection').show();
    }
}
function toggleAutoFetchCert(id,actDiv){
    var isChecked = $('#'+id).prop('checked');
    if(isChecked){
        $('#'+actDiv).hide();
    }else{
        $('#'+actDiv).show();
    }
}
function toggleMtlsCertSection(showMtlsImport){
    $('.mtlsCertSection').hide();
    $('#' + showMtlsImport).show();
}
function getMtlsCert(){
    var url = window.OPM.apiUrlPattern + '/admin/exportmTLSSelfSignedCertificate'; //No I18n	
     opm_exportFilesPostMethod(url, {}, "_blank"); //No I18N
}
