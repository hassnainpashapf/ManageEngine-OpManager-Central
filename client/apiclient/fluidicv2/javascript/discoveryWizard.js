
//$Id$
//This file has Discovery Wizard related functions

var inputDivUrl = "";//No I18N
var credentialsDivUrl = "";//No I18N
var rulesDivUrl = "";//No I18N
var interfaceDivUrl = "";//No I18N
var scheduleDivUrl = "";//No I18N
var csvData = new FormData();//No I18N
var disc_csv_file = "";//No I18N
var selectedCriteriaArr = []; 
var input_data = {};
var schedule_data = {};//No I18N
var nd_profileId = "";
var isNetDisModify = false;
var netDisTempObj = {};

function discoveryWizardSlider(currentStage,direction,toStage,virtualDiscovery){
    $("#discoveryHeader").closest(".title").removeClass("topTitle");
    $('#roadmapLinkvmwareDiscovery').hide();

    if(toStage==="entities"){
        $("#discoverySubHeader").text(Ember.I18n.t('webclient.desc.esx.discovery.entities',this));//No I18N
    }else if(toStage==="credentials"){//No I18N

        $("#discoverySubHeader").text(Ember.I18n.t('webclient.desc.esx.discovery.credentials',this));//No I18N
       
    }else if(toStage==="interface"){//No I18N
    	if(virtualDiscovery !== undefined && virtualDiscovery === "VMware"){
            $("#discoveryHeader").closest(".title").addClass("topTitle"); //No I18n
    	}
        $("#discoverySubHeader").text(Ember.I18n.t('webclient.desc.esx.discovery.interface',this));//No I18N
    }else{
        $('#roadmapLinkvmwareDiscovery').show();
        $("#discoverySubHeader").text("");
    }
    var currentDivHeader = {"input":Ember.I18n.t('webclient.settings.discovery.schedule.inputs',this),"credentials":Ember.I18n.t('webclient.topo.bulkedit.changecredential',this),"rules":Ember.I18n.t('webclient.action.rule',this),"interface":Ember.I18n.t('widget.typename.nfainterface',this),"schedule":Ember.I18n.t('webclient.general.Schedule',this),"summary":Ember.I18n.t('webclient.snapshot.testlinks.summary',this),"entities":Ember.I18n.t('webclient.vmware.entities',this)};//No I18N
    
    var currentDivHeaderInfo =  {"input":'opm.discoveryinput.info',"credentials":'opm.info.discovery.credential.what',"rules":'opm.info.topology.ruleengine.detail',"interface":'opm.info.discprofile.intf.types',"schedule":'opm.info.discovery.report.notify'};//No I18N


	var header = toStage+"Header";//No I18N
	var divId = toStage+"Div";//No I18N
    var passthrough = true;//No I18N
    OPMClient.VMwareDiscoveryController.set("currentStage",toStage);//No I18N
    if(direction === "fwd"){//No I18N
        if(virtualDiscovery !== undefined && virtualDiscovery === "VMware"){
            passthrough = validateVMwareDiscoveryStages(currentStage,toStage);
        }else{
       passthrough = validateSteps(currentStage,toStage);
        }
    }
    if(passthrough){
        if(virtualDiscovery !== undefined && virtualDiscovery === "VMware"){
            if(toStage === "credentials"){
                $("#discoveryHeader").text(Ember.I18n.t('webclient.VM.discoveryHeader.credentials',this));//No I18N
            }else{
                var headerText = Ember.I18n.t('webclient.discovery.vmwarediscovery',this);//No I18N
                if(toStage!=="input"){
                    headerText += " - "+currentDivHeader[toStage];//No I18N
                }
                $("#discoveryHeader").text(headerText);
            }
        }else{
        $("#currentDiv").text(currentDivHeader[toStage]);

        }
        $("#inputDiv").hide();
        $("#credentialsDiv").hide();
        $("#rulesDiv").hide();
        $("#interfaceDiv").hide();
        $("#scheduleDiv").hide();
        $("#summaryDiv").hide();
        $("#entitiesDiv").hide();
        $("#addFilter").hide();
        $("#addCredential").hide();
        $("#interfaceButton").hide();
        $("#addDiscRule").hide();
        checkClass(header,direction);
        if(header === "inputHeader"){ //No I18N
            if($("#singleDevice").hasClass('active') === true)
            {
                $("#addFilter").hide();
            }
            else
            {
                $("#addFilter").show();
            }
            
        }
        if(header === "credentialsHeader" || (virtualDiscovery !== undefined && virtualDiscovery === "VMware" && header === "inputHeader")){     //No I18N
            $("#addCredential").show();
        }
        if(header === "interfaceHeader"){     //No I18N
            $("#interfaceButton").show();
        }
        if(header === "rulesHeader")
        {
            $("#addDiscRule").show();
        }
        var executeNow = $('input[name=discoveryScheduleType]:checked').val();
        if(header === "summaryHeader" || (window.OPM.isOPMStandardEdition && header === "scheduleHeader"))
        {
            $("#discoveryHeader #disc_Helpicon").hide();
        }
        else
        {
            $("#discoveryHeader #disc_Helpicon").show();
            OPMClient.SettingsAddDeviceController.set("currentDivHeaderInfo",currentDivHeaderInfo[toStage]); //No I18n
        }
        if(direction === "bwd" && toStage === "schedule")
        {
            OPMClient.SettingsAddDeviceController.set("currentDivHeaderInfo","opm.info.discovery.report.notify"); //No I18n
        }
	var executeNow = $('input[name=discoveryScheduleType]:checked').val();
        if(executeNow === "true" && direction === "fwd" && toStage === "schedule" && currentStage === "interface")
        {
            $("#"+divId).show();
            $("#scheduleDetails,.disScheduleBtns").hide();
            $("#emailDiv").show();
        }
        else
        {
            $("#"+divId).show();   
        }

        $("#"+header).addClass("active");//No I18N
    }
    $(".discoveryWizard .opmFormHolder.scrollTop").scrollTop(0);
}

function checkClass(stage,direction){
	if(direction === "fwd"){//No I18N
		if(stage === "summaryHeader"){//No I18N
			$("#scheduleHeader").removeClass();
			$("#scheduleHeader").addClass("completed");//No I18N
		}else{
			$("#"+stage).prev().removeClass();
			$("#"+stage).prev().addClass("completed");//No I18N
		}
		
	}else if(direction === "bwd"){//No I18N
		$("#"+stage).next().removeClass();//No I18N
		$("#"+stage).removeClass();//No I18N
	}
}

function validateSteps(currentStage,toStage){
    $(".validateField").removeClass("error");
    var fieldsToValidate = {};//No I18N
    var isValid = false;
    var currentdate = new Date();//No I18N
    var profileName = $('#discName').val();//No I18N
    if(currentStage === "schedule" || toStage === "schedule"){//No I18N
        
        if(profileName === "" || profileName === undefined){//No I18N
            profileName = "Profile_"+currentdate.getFullYear()+"_"+(currentdate.getMonth()+1)+"_"+currentdate.getDate()+"_"+currentdate.getHours()+"_"+currentdate.getMinutes()+"_"+currentdate.getSeconds(); //No I18N
            $('#discName').attr('placeholder',profileName);//No I18N
        }

        if(OPMClient.DiscoveryWizardAddEditController.operation === 'Edit'){//No I18N
            if(OPMClient.DiscoveryWizardAddEditController.editRediscovery){
                $("#rediscoveryDiv").show();
            }
        }
        var subject = trimAll($("#subject").val());//No I18N
        var message = trimAll($("#message").val());//No I18N
        var emailID = $("#discMailId").val();
       

        if(subject === "" || subject === undefined){//No I18N
            subject = Ember.I18n.t('weblcient.discovery.device.reports.emailsubject',this);//No I18N
        }
        if(message === "" || message === undefined){//No I18N
            message = Ember.I18n.t('webclient.discovery.maildescription',this);//No I18N
        }
        if(emailID !== "" && !opm_validateMultipleEmail(emailID))
        {
            $("#discMailId").addClass('validateField error');
            $("#discMailId").attr('data-error',Ember.I18n.t('webclient.admin.mailserver.invalidemailid',this));
            $("#discMailId").focus();
            return false;
        }
        $('#subject').attr('placeholder',subject);//No I18N
        $('#message').attr('placeholder',message);//No I18N
    }
    if(toStage === "summary"){//No I18N
        if($("#discMailId").val() !== ""){ //No I18N
            if(OPMClient.DiscoveryWizardAddEditController.mailConfigured === false){
                OPMClient.DiscoveryWizardAddEditController.set("infoMsgId",opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.mail.configurealert',this)));//No I18N
            }
        }
        var executeNow = $('input[name=discoveryScheduleType]:checked').val();
        OPMClient.DiscoveryWizardAddEditController.set('executeOnly',false);//No I18N
        $("#summaryDiv .discScheSummary").show();
        if(executeNow === "true")
        {
            OPMClient.DiscoveryWizardAddEditController.set('executeOnly',true);//No I18N
            $("#summaryDiv .discScheSummary").hide();
        }

    }
    if(currentStage === "input"){//No I18N
        inputDivUrl = "";//No I18N
        input_data = {};
        var inputContent = "";//No I18N
        var discoveryType = $("ul#discoveryList li.active").attr("id");//No I18N
        OPMClient.DiscoveryWizardAddEditController.set("isExisting",false);//No I18N
        $("#rediscoveryDiv").hide();//No I18N
        if(discoveryType === "ExistingDevices"){
            OPMClient.DiscoveryWizardAddEditController.set("isExisting",true);//No I18N
           $("#rediscoveryDiv").show();//No I18N
        }
        var version = "";//No I18N
      
        if(discoveryType === "singleDevice"){//No I18N
            disc_csv_file = "";
            fieldsToValidate = {'empty':['ipAddress','ipNetmask']};//No I18N
            if(opm_validateFields(fieldsToValidate)){
                var netmask = $('#ipNetmask').val();//No I18N
                var ipversion = "4";//No I18N
                var IPAddressVal = $('#ipAddress').val();
              
                if(checkIsIPV4($('#ipAddress').val()))
                {
                    if(!opm_validateFields({'custom':[{'identifier':'ipNetmask','condition':!checkIsIPV4($('#ipNetmask').val()),'message':Ember.I18n.t('webclient.discovery.netmaskalert',this)}]})){//No I18N
                        return false;
                    }
                }else if(opm_isIpV6Address($('#ipAddress').val())){
                    ipversion = "6";//No I18N
                    if(!opm_validateFields({'custom':[{'identifier':'ipNetmask','condition':!opm_isIpV6Address($('#ipNetmask').val()),'message':Ember.I18n.t('webclient.discovery.netmaskalert',this)}]})){//No I18N
                        return false;
                    }
                }
               
               // inputDivUrl = '&discoveryType=SingleDevice&ipVersion='+ipversion+'&rangeDetails=FromIP='+$('#ipAddress').val()+', ToIP='+$('#ipAddress').val()+'&toIP='+$('#ipAddress').val()+'&netmask='+netmask+'&rediscoverExistingDevices=false&isSingleIPDiscovery=true';//No I18N
 		input_data.discoveryType='SingleDevice';//No I18N
                input_data.ipVersion=ipversion;
                input_data.rangeDetails='FromIP='+$('#ipAddress').val()+', ToIP='+$('#ipAddress').val();//No I18N
                input_data.toIP=$('#ipAddress').val();
                input_data.netmask=netmask;
                input_data.rediscoverExistingDevices='false';//No I18N
                input_data.isSingleIPDiscovery='true';//No I18N
                inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": "+Ember.I18n.t('webclient.topo.addnode.ipaddress',this)+" : "+$('#ipAddress').val();//No I18N
            }else{
                return false;
            }
        }else if(discoveryType === "IPRange"){//No I18N
            disc_csv_file = "";
            version = $('input:radio[name="ipRangeType"]:checked').val();//No I18N
            if(version ==="ipv4")//No I18N
            {
                fieldsToValidate = {'ipValidation':{'startIP':'endIP'}};//No I18N
                isValid = opm_validateFields(fieldsToValidate);
                if(!isValid){
                    return isValid;
                }
                var startIpRange = $('#startIP1').val()+"."+$('#startIP2').val()+"."+$('#startIP3').val()+"."+$('#startIP4').val();//No I18N
                var endIpRange = $('#endIP1').val()+"."+$('#endIP2').val()+"."+$('#endIP3').val()+"."+$('#endIP4').val();//No I18N
                var netmask = $('#netmask').val();//No I18N                
                var IPLength =  $("#IPRangeDetails").val().length;
                if(IPLength !== 0)
                {
                     var IPRangeValues = $("#IPRangeDetails").val();
                    var  IPDetails =  IPRangeValues.replace(/\n/g, ":");
                    var IPV4 = IPDetails.replace(/-/g, ","); //No I18n
//                    inputDivUrl = '&&ipVersion=4&rangeDetails='+IPV4+'&toIP='+endIpRange+'&netmask='+netmask+'&rediscoverExistingDevices=false&isSingleIPDiscovery=false';//No I18N
                    input_data.discoveryType='IPRange';//No I18N
                    input_data.ipVersion='4';//No I18N
                    input_data.rangeDetails=IPV4;
                    input_data.toIP=endIpRange;
                    input_data.netmask=netmask;
                    input_data.rediscoverExistingDevices='false';//No I18N
                    input_data.isSingleIPDiscovery='false';//No I18N
                    inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+" | "+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+": v4 | "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+": "+IPDetails;//No I18N
                }
                else
                {
                    var returnCnfm = true;
                    if($('#startIP1').val() !== $('#endIP1').val() || $('#startIP2').val() !== $('#endIP2').val())
                    {
                        returnCnfm = confirm(Ember.I18n.t('webclient.discovery.range.confirm',this)); //No I18n
                    }

                    if(returnCnfm)
                    {
                       // inputDivUrl = '&discoveryType=IPRange&ipVersion=4&rangeDetails=FromIP='+startIpRange+', ToIP='+endIpRange+'&toIP='+endIpRange+'&netmask='+netmask+'&rediscoverExistingDevices=false&isSingleIPDiscovery=false';//No I18N
                        input_data.discoveryType='IPRange';//No I18N
                        input_data.ipVersion='4';//No I18N
                        input_data.rangeDetails='FromIP='+startIpRange+', ToIP='+endIpRange;//No I18N
                        input_data.toIP=endIpRange;
                        input_data.netmask=netmask;
                        input_data.rediscoverExistingDevices='false';//No I18N
                        input_data.isSingleIPDiscovery='false';//No I18N

                        inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+" | "+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+": v4 | "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+": "+startIpRange+" - "+endIpRange;//No I18N
                    }
                    else
                    {
                        return false;
                    }
                }
            }else if(version === 'ipv6'){//No I18N
                disc_csv_file = "";
                fieldsToValidate = {'empty':['startIpV61','endIpV61','maskIpV61'],'ipv6Validation':['startIpV61','endIpV61','maskIpV61']};//No I18N
                isValid = opm_validateFields(fieldsToValidate);
                if(!isValid){
                    return isValid;
                }
                ipv6StartIpRange = $('#startIpV61').val();//No I18N
                ipv6EndIpRange = $('#endIpV61').val();//No I18N
                networkAddress = $('#maskIpV61').val();//No I18N
              //  inputDivUrl = '&discoveryType=IPRange&ipVersion=6&rangeDetails=FromIP='+ipv6StartIpRange+', ToIP='+ipv6EndIpRange+'&toIP='+ipv6EndIpRange+'&netmask='+networkAddress+'&rediscoverExistingDevices=false&isSingleIPDiscovery=false';//No I18N
                input_data.discoveryType='IPRange';//No I18N
                input_data.ipVersion='6';//No I18N
                input_data.rangeDetails='FromIP='+ipv6StartIpRange+', ToIP='+ipv6EndIpRange;//No I18N
                input_data.toIP=ipv6EndIpRange;
                input_data.netmask=networkAddress;
                input_data.rediscoverExistingDevices='false';//No I18N
                input_data.isSingleIPDiscovery='false';//No I18N
                inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+" | "+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+": v6 | "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+": "+ipv6StartIpRange+" - "+ipv6EndIpRange;//No I18N
            }
           
        }else if(discoveryType === "CIDR"){//No I18N
            disc_csv_file = "";
            version = $('input:radio[name="cidrType"]:checked').val();
            if(version === "cidrv4"){//No I18N
                var fromIP = "";//No I18N
                var maskbit = "";//No I18N
                var count = 0;//No I18N
                var firstElement = "";//No I18N
                for(var i=1;i<=5;i++){
                    if(i != 5){
                        if(trimAll($('#nwIpStart'+i).val()) === undefined || trimAll($('#nwIpStart'+i).val()) === null || trimAll($('#nwIpStart'+i).val()) === "" || trimAll($('#nwIpStart'+i).val()) > 255){//No I18N
                            if(count === 0){ firstElement = "#nwIpStart"+i; }//No I18N 
                            $("#nwIpStart"+i).addClass('validateField error');//No I18N
                            $("#nwIpStart"+i).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));
                            count++;
                        }
                    }else{
                        if(trimAll($('#nwIpStart'+i).val()) === undefined || trimAll($('#nwIpStart'+i).val()) === null || trimAll($('#nwIpStart'+i).val()) === "" || trimAll($('#nwIpStart'+i).val()) > 32){//No I18N
                            if(count === 0){ firstElement = "#nwIpStart"+i; }//No I18N 
                            $("#nwIpStart"+i).addClass('validateField error');//No I18N
                            $("#nwIpStart"+i).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));
                            count++;
                         }
                    }
                }
                $('.validateField').on('focusin',function(){
                    opmValidate($(this));
                });
                $('.validateField').on('focusout',function(){
                    $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
                });
                $(firstElement).focus();
                if(count > 0){
                    return false;    
                }
                fromIP = $('#nwIpStart1').val()+"."+$('#nwIpStart2').val()+"."+$('#nwIpStart3').val()+"."+$('#nwIpStart4').val();//No I18N
                maskbit = $('#nwIpStart5').val();//No I18N
                if(maskbit <= 15 && !confirm(Ember.I18n.t('webclient.discovery.range.confirm',this)))
                {
                    $('#nwIpStart5').focus();
                    return false;
                }
                version = '4';//No I18N
            }else if(version === 'cidrv6'){//No I18N
                disc_csv_file = "";
                fieldsToValidate = {'ipv6Validation':['networkIP']};//No I18N
                if(!opm_isIpV6Address(trimAll($('#networkIP').val()))){
                    alert(Ember.I18n.t('webclient.discovery.validipv6nw',this));    //No I18N
                    $("#networkIP").focus();//No I18N
                    return false;
                }else if($('#maskBit').val() === ""){
                    alert(Ember.I18n.t('webclient.discovery.maskbit',this));    //No I18N
                    $("#maskBit").focus();//No I18N
                    return false;
                }
                fromIP = $('#networkIP').val();//No I18N
                maskbit = $('#maskBit').val();//No I18N
                version = '6';//No I18N
            }
            //inputDivUrl = '&discoveryType=CIDR&ipVersion='+version+'&rangeDetails=FromIP='+fromIP+'&netmask='+maskbit+'&rediscoverExistingDevices=false&isSingleIPDiscovery=false';//No I18N
            input_data.discoveryType = 'CIDR';//No I18N
            input_data.ipVersion = version;
            input_data.rangeDetails = 'FromIP='+fromIP;//No I18N
            input_data.netmask = maskbit;
            input_data.rediscoverExistingDevices = 'false';//No I18N
            input_data.isSingleIPDiscovery = 'false';//No I18N

            inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": CIDR | "+Ember.I18n.t('webclient.vimonitor.devices.snapshot.version',this)+": v"+version+" | "+Ember.I18n.t('webclient.layer.discovery.iprange',this)+": "+fromIP;//No I18N
        }else if(discoveryType === 'CSV'){//No I18N
            disc_csv_file = $("#importCsv")[0].files[0];//No I18N
            if(disc_csv_file === undefined){
                alert(Ember.I18n.t('webclient.discovery.csvformatfile',this)); //No I18N
                $("#importCsv").focus();//No I18N
                return false;
            }
            //csvData = new FormData(); 
            //csvData.append('file',file);//No I18N 
            var netMask = $("#csvNetmask").val();//No I18N
           // inputDivUrl = '&discoveryType=CSV&ipVersion=4&rangeDetails=CSV&netmask='+netMask+csvDataURL+'&isSingleIPDiscovery=false';//No I18N
         
            input_data.discoveryType = 'CSV';//No I18N
            input_data.ipVersion = '4';//No I18N
            input_data.rangeDetails = 'CSV';//No I18N
            input_data.netmask = netMask;
            input_data.isSingleIPDiscovery = 'false';//No I18N
            $.each(opm_csvData, function(key,val){
                input_data[key] = val;
            });

            if(OPMClient.DiscoveryWizardAddEditController.operation === 'Edit'){//No I18N
               //inputDivUrl += '&updateCSV=true';//No I18N
               input_data.updateCSV='true';//No I18N
            }
            inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": CSV | File: "+disc_csv_file.name;//No I18N
        }else if(discoveryType === 'ExistingDevices'){//No I18N
            disc_csv_file = "";
            var group = $('#groupOptions option:selected').val();//No I18N
            var groupStr = $('#groupOptions option:selected').text();//No I18N
            var groupArr = [];//No I18N
            $("#existingDevicesList li").each(function(key,val){
                if(!$(this).find('div').hasClass('noCount')){//No I18N
                    var currentLi = $(this).find("input");//No I18N
                    if(currentLi.is(":checked")){
                        groupArr.push(currentLi.val());
                    }
                }
            });
            if(groupArr.length <= 0){
                alert("Please select "+groupStr+" to discover"); //No I18N
                return false;
            }   
           // inputDivUrl = '&discoveryType='+discoveryType+'&ipVersion=4&rangeDetails=&members='+groupArr+'&existingDevices=true&type='+group+'&netmask=&isSingleIPDiscovery=false';//No I18N 
            
            input_data.discoveryType = discoveryType;
            input_data.ipVersion = '4';//No I18N
            input_data.rangeDetails = '';
            input_data.members = groupArr;
            input_data.existingDevices = 'true';//No I18N
            input_data.type = group;
            input_data.netmask = '';
            input_data.isSingleIPDiscovery = 'false';//No I18N

            inputContent = Ember.I18n.t('webclient.admin.downtimescheduler.type',this)+": "+Ember.I18n.t('webclient.settings.discovery.schedule.type.existing',this);//No I18N
        }
        var ignoreRuleArr = [];//No I18N
        var addRuleArr = [];//No I18N
        var addRule = false;
        var ignoreRule = false;
        if($.trim($('#filterContent').html()).length > 0){
            $("#filterContent .filterRow").each(function(key,val){
               var ignoreRuleObj = {};//No I18N
               var addRuleObj = {};//No I18N
               if($(this).find("input").is(":checked")){//No I18N
                    addRuleObj.type = $(this).find('.filterType').attr('data-val');
                    addRuleObj.condition = $(this).find('.filterCondition').attr('data-val');
                    addRuleObj.value = $(this).find('.filterValue').text();//No I18N
                    addRuleArr.push(addRuleObj);
               }else{
                    ignoreRuleObj.type = $(this).find('.filterType').attr('data-val');
                    ignoreRuleObj.condition = $(this).find('.filterCondition').attr('data-val');
                    ignoreRuleObj.value = $(this).find('.filterValue').text();//No I18N
                    ignoreRuleArr.push(ignoreRuleObj);
               }
            });

            if(ignoreRuleArr.length > 0){
                ignoreRule = true;
                //inputDivUrl += '&ignoreFilter='+encodeURIComponent(JSON.stringify(ignoreRuleArr)); //No I18N
                input_data.ignoreFilter = JSON.stringify(ignoreRuleArr); //No I18N
            }

            if(addRuleArr.length > 0){
                addRule = true;
                //inputDivUrl += '&addFilter='+encodeURIComponent(JSON.stringify(addRuleArr)); //No I18N
               input_data.addFilter = JSON.stringify(addRuleArr); //No I18N
            }
        }
        //inputDivUrl += '&addRule='+addRule+'&ignoreRule='+ignoreRule; //No I18N
        input_data.addRule=addRule;
        input_data.ignoreRule=ignoreRule;
        

        $("#inputContent").text(inputContent);
        //console.log(inputContent);
        return true;// For Passthrough
    }
    if(currentStage === "credentials"){//No I18N
        credentialsDivUrl = "";//No I18N
        var credContent = "";//No I18N
        var  credListArr = [];//No I18N
        var credRowIds = $('#DECredProfList').jqGrid('getGridParam','selarrrow');    //No I18N
        if(credRowIds !== "" && credRowIds !== undefined){
            $.each(credRowIds, function(){
                var id = this;
                var name =  $('#DECredProfList').jqGrid('getCell', id, 'credentialName'); //No I18N
                credListArr.push(name);
                credContent += name+", ";//No I18N
            });
        }
        if(credListArr.length > 0){
            if(credListArr.length < 5 || (credListArr.length >= 5 && confirm(Ember.I18n.t('webclient.cred.disimpatc.message',this))))
            {
                //credentialsDivUrl = '&credentialNames='+credListArr.toString(); //No I18N
                input_data.credentialNames=credListArr.toString(); //No I18N
                $("#credentialContent").text(credContent.substring(0,credContent.length-2));//No I18N
            }
            else
            {
                return false;
            }
        }else{
            if(window.OPM.isNCM || window.OPM.isNFA){
                alert(Ember.I18n.t('webclient.discovery.nocredential.error',this)); //No I18N
                return false;
            }else{
                $("#credentialContent").text(Ember.I18n.t('webclient.topo.objectdetails.managed.no',this)+" "+Ember.I18n.t('webclient.topo.bulkedit.changecredential',this)+" "+ Ember.I18n.t('webclient.Selected',this));//No I18N
            }
        }
        return true;
    }
    if(currentStage === "rules"){//No I18N
        rulesDivUrl = "";//No I18N
        var ruleRowIds = $('#jqgridList').jqGrid('getGridParam','selarrrow');   //No I18N
        if(ruleRowIds !== "" && ruleRowIds !== undefined){
            rulesArr = [];//No I18N
            rulesNamesArr = "";//No I18N
            $.each(ruleRowIds, function(){
                var id = this;
                var ruleIds =  $('#jqgridList').jqGrid('getCell', id, 'ruleid'); //No I18N
                var name =  $('#jqgridList').jqGrid('getCell', id, 'name'); //No I18N
                rulesArr.push(ruleIds);
                rulesNamesArr += escapeHTML(name)+", ";//No I18N
            });
        }
        if(rulesArr.length > 0){
            //rulesDivUrl = '&ruleIds='+rulesArr.toString(); //No I18N
            input_data.ruleIds=rulesArr.toString(); 
            $("#ruleContent").html(rulesNamesArr.substring(0,rulesNamesArr.length-2));//No I18N
        }else{
            $("#ruleContent").html(Ember.I18n.t('webclient.discovery.norules',this));//No I18N
        }
        return true;
    }
    if(currentStage === 'interface'){
        interfaceDivUrl = "";//No I18N
        var enableDisableIntf = $("#doIntfDiscovery").is(':checked') === true ? 'true' : 'false';//No I18N
        var operState = [];//No I18N
        var adminState = [];//No I18N
        var intftypes = [];//No I18N
        var intfNames = "";//No I18N
        if(enableDisableIntf === 'true'){//No I18N
            $("#intfList li").each(function(key,val){//No I18N
                if(!$(this).find('div').hasClass('noCount')){//No I18N
                    var currentLi = $(this).find("input");//No I18N
                    if(currentLi.is(":checked")){//No I18N
                        intftypes.push(currentLi.val());//No I18N
                        intfNames += $(this).find("label").text()+", ";//No I18N
                    }
                }
            });
            $.each($("input[name=adminStatus]:checked"),function(k,v){//No I18N
                adminState.push(v.value);
            });
            $.each($("input[name=operStatus]:checked"),function(k,v){//No I18N
                operState.push(v.value);
            });
        }
        //interfaceDivUrl = '&interfaceDiscovery='+enableDisableIntf;//No I18N
        input_data.interfaceDiscovery=enableDisableIntf;
        if(enableDisableIntf === 'true' && intftypes.length <= 0){
            alert(Ember.I18n.t('webclient.disc.intf.selecttype',this)); //No I18N
            return false;
        }else{
            var checkValues = $('input[name=interfaceTypes]:checked').map(function(){//No I18N
                return $(this).attr('dispName');
            }).get();
           // interfaceDivUrl += '&intfTypeIds='+intftypes+'&intfAdminStatus='+adminState+'&intfOperStatus='+operState;//No I18N
            input_data.intfTypeIds = intftypes;
            input_data.intfAdminStatus = adminState;
            input_data.intfOperStatus = operState;

            $("#interfaceContent").show();
            $("#interfaceContentMin").hide();
            $("#interfaceContent").text(intfNames.substring(0,intfNames.length-2));//No I18N
            var tempStr = intfNames.split(",");//No I18N
            if(tempStr.length > 4)
            {   
                $("#interfaceContent").hide();
                $("#interfaceContentMin").show();
                 tempStr = tempStr.slice(0,4);
                $("#interfaceContentMin .spanMoreTxt").text(tempStr.toString()+"...");//No I18N
            }
        }
        if(enableDisableIntf === 'false'){//No I18N
            $("#interfaceContent").text(Ember.I18n.t('webclient.discovery.nointerfaces',this));//No I18N
        }
        return true;
    }
    if(currentStage === 'schedule'){
        if(profileName === "" || profileName === undefined){//No I18N
            profileName = "Profile_"+currentdate.getFullYear()+"_"+(currentdate.getMonth()+1)+"_"+currentdate.getDate()+"_"+currentdate.getHours()+"_"+currentdate.getMinutes(); //No I18N
        }
        $('#discName').attr('placeholder',profileName);//No I18N
        $("#profName").text(profileName);//No I18N
        scheduleDivUrl = "";//No I18N
        schedule_data = {};
        var schDays = "";//No I18N
        var devActionAdd, devActionRem, intfActionAdd, intfActionRem;
        $("#schDayRow").hide();
        $("#schDateRow").hide();
        $("#schMonthRow").hide();
        //var isRediscovery = $('#isRediscoveryEnabled').prop("checked");//No I18N
        var isRediscovery = true;
     //   if($("#isScheduleEnabled").is(":checked")){
            //OPMClient.DiscoveryWizardAddEditController.set('executeOnly',false);//No I18N
            //scheduleDivUrl += '&sheduleDiscovery='+true;//No I18N
            var schFrequency = $("#discFrequency .active").attr("value");//No I18N
            var schFreqContent = $("#discFrequency .active").text();//No I18N
            var discSchDate,discSchTime,discSchMin,discSchDay,discSchMonthWeekNumber,discSchMonthType,discSchMonth;
            if(schFrequency == 1){//No I18N
                if(OPMClient.DiscoveryWizardAddEditController.isExisting === false){
                    isRediscovery = false;
                }
                var executeNow = $('input[name=discoveryScheduleType]:checked').val();
                
                var year = curTime.getFullYear();
                var month = curTime.getMonth()+1;
                var date = curTime.getDate();
                var hours = curTime.getHours();
                var mins = curTime.getMinutes();
                discSchDate = $('#onceDate').val();
                discSchTime = Number($('#onceHour option:selected').val());
                discSchMin = Number($('#onceMin option:selected').val());
                if(month < 10)
                {
                    month = "0"+month;
                }
                if(date < 10)
                {
                    date = "0"+date;
                }
                var todayDateStr = year+"-"+month+"-"+(date);
                var inputDate = discSchDate.split("-");
                var selectedTime = new Date(Number(inputDate[0]),Number(inputDate[1]),Number(inputDate[2]));
                var serverTime = new Date(year,Number(month),Number(date));
                var fieldsToValidate = {'empty':['onceDate']};//No I18N
                var isValid = opm_validateFields(fieldsToValidate);
                if(!isValid)
                {
                    return false;
                }
                
                if((selectedTime.getTime() < serverTime.getTime()) && executeNow === "false")
                {
                    alert(Ember.I18n.t('webclient.common.date.msg',this));//No I18N
                    return false;
                }
                else if((todayDateStr === discSchDate) && executeNow === "false") {
                    if (discSchTime < hours) {
                        alert(Ember.I18n.t('webclient.common.date.msg',this));//No I18N
                        return false;
                    } else if (discSchTime === hours && (discSchMin <= mins)) {
                        alert(Ember.I18n.t('webclient.common.date.msg',this));//No I18N
                        return false;
                    }
                }

                //scheduleDivUrl += '&schedType='+schFrequency+'&onceDate='+discSchDate+'&onceHour='+discSchTime+'&onceMin='+discSchMin;//No I18N
                schedule_data.schedType=schFrequency;
                schedule_data.onceDate=discSchDate;
                schedule_data.onceHour=discSchTime;
                schedule_data.onceMin=discSchMin;

            }else if(schFrequency == 2){//No I18N
                discSchDate = $('#dailyStartDate').val();
                discSchTime = $('#dailyHour option:selected').val();
                discSchMin = $('#dailyMin option:selected').val();
             //   scheduleDivUrl += '&schedType='+schFrequency+'&dailyStartDate='+discSchDate+'&dailyHour='+discSchTime+'&dailyMin='+discSchMin;//No I18N
                schedule_data.schedType=schFrequency;
                schedule_data.dailyStartDate=discSchDate;
                schedule_data.dailyHour=discSchTime;
                schedule_data.dailyMin=discSchMin;

            }else if(schFrequency == 3){//No I18N
                discSchDay = [];//No I18N
                discSchTime = $('#weeklyHour option:selected').val();
                discSchMin = $('#weeklyMin option:selected').val();
                $.each($("#weeklyDayCheBox input[type=checkbox]:checked"), function(key, val){
                    discSchDay.push(val.value);//No I18N
                   // console.log( $(this).parent().find('label').text());
                    schDays += $(this).parent().find('label').text()+", ";//No I18N
                });
                $("#schDayRow").show();
                $("#schDay").html(schDays.substring(0,schDays.length-2));//No I18N
              //  scheduleDivUrl += '&schedType='+schFrequency+'&weeklyDay='+discSchDay.toString()+'&weeklyHour='+discSchTime+'&weeklyMin='+discSchMin;//No I18N

                schedule_data.schedType=schFrequency;
                schedule_data.weeklyDay=discSchDay.toString();
                schedule_data.weeklyHour=discSchTime;
                schedule_data.weeklyMin=discSchMin;

            }else if(schFrequency == 4){//No I18N
                discSchDay =[];//No I18N
                discSchTime = $('#monthlyHour option:selected').val();
                discSchMin = $('#monthlyMin option:selected').val();
                discSchMonthType = $('input:radio[name="monthlyType"]:checked').val();//No I18N

                if(discSchMonthType === '4')//No I18N
                {
                    discSchDate = $("#monthlyDate option:selected").val();
                 //   scheduleDivUrl += '&schedType='+schFrequency+'&monthlyDate='+discSchDate+'&monthlyHour='+discSchTime+'&monthlyMin='+discSchMin;//No I18N
                    schedule_data.schedType=schFrequency;
                    schedule_data.monthlyDate=discSchDate;
                    schedule_data.monthlyHour=discSchTime;
                    schedule_data.monthlyMin=discSchMin;

                    $("#schDateRow").show();
                    $("#schDate").html(discSchDate);
                }
                else
                {
                    discSchMonthWeekNumber = $("#monthlyWeekNum option:selected").val();
                    var monthlyDayCheBox = $("#monthlyDayCheBox input[type=checkbox]:checked");

                    $.each(monthlyDayCheBox, function(key, val){
                        discSchDay.push(val.value);//No I18N
                        schDays += $(this).parent().find('label').text()+", ";//No I18N
                    });
                    
                    if(discSchDay === undefined ||discSchDay === "" || discSchDay.length === 0){//No I18N
                        alert(Ember.I18n.t('webclient.admin.daytoschedule',this)); //No I18N
                        return false;
                    }
                  //  scheduleDivUrl += '&schedType=5&monthlyDay='+discSchDay.toString()+'&monthlyHour='+discSchTime+'&monthlyMin='+discSchMin+'&monthlyWeekNum='+discSchMonthWeekNumber;//No I18N
                    schedule_data.schedType='5';//No I18N
                    schedule_data.monthlyDay=discSchDay.toString();
                    schedule_data.monthlyHour=discSchTime;
                    schedule_data.monthlyMin=discSchMin;
                    schedule_data.monthlyWeekNum=discSchMonthWeekNumber;

                    $("#schDayRow").show();
                    $("#schDay").html("Every "+$("#monthlyWeekNum option:selected").text()+" "+schDays.substring(0,schDays.length-2));//No I18N
                }
            }else if(schFrequency == 6){//No I18N
                discSchDate = $('#yearlyDate option:selected').val();
                discSchTime = $('#yearlyHour option:selected').val();
                discSchMin = $('#yearlyMin option:selected').val();
                discSchMonth = [];//No I18N

                $.each($("#yearlyMonthCheBox input[type=checkbox]:checked"), function(key, val){//No I18N
                    discSchMonth.push(val.value);//No I18N
                    schDays += $(this).parent().find('label').text()+", ";//No I18N
                });

                if(discSchMonth === undefined ||discSchMonth === "" || discSchMonth.length === 0){//No I18N
                    alert(Ember.I18n.t('webclient.admin.monthtoschedule',this)); //No I18N
                    return false;
                }

                //scheduleDivUrl += '&schedType='+schFrequency+'&yearlyDate='+discSchDate+'&yearlyHour='+discSchTime+'&yearlyMin='+discSchMin+'&yearlyMonth='+discSchMonth.toString();//No I18N
                schedule_data.schedType=schFrequency;
                schedule_data.yearlyDate=discSchDate;
                schedule_data.yearlyHour=discSchTime;
                schedule_data.yearlyMin=discSchMin;
                schedule_data.yearlyMonth=discSchMonth.toString();
                
                $("#schDateRow").show();
                $("#schMonthRow").show();
                $("#schDate").html(discSchDate);
                $("#schMonth").html(schDays.substring(0,schDays.length-2));//No I18N
            }
            $("#schFrequency").html(schFreqContent);
            $("#schTime").html(discSchTime+" : "+discSchMin);//No I18N
        /*}else{//Schedule has made mandatory so commenting this
            if(OPMClient.DiscoveryWizardAddEditController.isExisting === false){
                isRediscovery = false;
            }
            OPMClient.DiscoveryWizardAddEditController.set('executeOnly',true);//No I18N
            scheduleDivUrl += '&sheduleDiscovery='+false;//No I18N
        }*/
        if(isRediscovery){
            devActionAdd = $('#devAdd').val();//No I18N
            devActionRem = $('#devRemove').val();//No I18N
            intfActionAdd = $('#intfAdd').val();//No I18N
            intfActionRem = $('#intfRemove').val();//No I18N
            $("#devAddRule").html($('#devAdd option:selected').text());//No I18N
            $("#devDel").html($('#devRemove option:selected').text());//No I18N
            $("#interfaceAdd").html($('#intfAdd option:selected').text());//No I18N
            $("#interfaceDel").html($('#intfRemove option:selected').text());//No I18N
            $("#rediscoveryContent").show();
        }else{
            $("#rediscoveryContent").hide();
        }
        /*if(devActionAdd === "SKIP" || devActionRem === "SKIP" || intfActionAdd === "SKIP" || intfActionRem === "SKIP" ){
            var isValid = opm_validateFields({'empty':['discMailId'],'emailValidation':['discMailId']});//No I18N
            if(!isValid){
                return isValid;
            }
        }*/
        var subject = trimAll($("#subject").val());//No I18N
        var message = trimAll($("#message").val());//No I18N
        if(subject === "" || subject === undefined){
            subject = Ember.I18n.t('weblcient.discovery.device.reports.emailsubject',this);//No I18N
        }
        if(message === "" || message === undefined){
            message = Ember.I18n.t('webclient.discovery.maildescription',this);//No I18N
        }
        $('#subject').attr('placeholder',subject);//No I18N
        $('#message').attr('placeholder',message);//No I18N
      //  scheduleDivUrl += '&subject='+subject+"&message="+message+'&rediscoveryRule='+isRediscovery+'&deviceAddAction='+devActionAdd+'&deviceRemoveAction='+devActionRem+'&intfAddAction='+intfActionAdd+'&intfRemoveAction='+intfActionRem+'&profileName='+profileName;//No I18N


        input_data.subject=subject;
        input_data.message=message;
        input_data.rediscoveryRule=isRediscovery;
        input_data.deviceAddAction=devActionAdd;
        input_data.deviceRemoveAction=devActionRem;
        input_data.intfAddAction=intfActionAdd;
        input_data.intfRemoveAction=intfActionRem;
        input_data.profileName=profileName;

        return true;
    }
    if(currentStage === 'summary'){//No I18N
       // var profileName = $('#discName').val();//No I18N
        input_data.wsId=sessionStorage.getItem("wsId");//No I18N
        var email = $('#discMailId').val();//No I18N
        discoveryWizardUrl = window.OPM.apiUrlPattern + '/v2/discovery/addDiscoveryProfile'; //No I18N
        if(OPMClient.DiscoveryWizardAddEditController.operation === 'Edit'){//No I18N
            discoveryWizardUrl = window.OPM.apiUrlPattern + '/v2/discovery/editDiscoveryProfile';//No I18N
            input_data.profileId=OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.profileId;
        }
        if(window.OPM.isNCM || window.OPM.isNFA)
        {
            //interfaceDivUrl = '&interfaceDiscovery='+false;//No I18N
            input_data.interfaceDiscovery=false;//No I18N
        }
       // var urlsign = opm_checkIndexOf(discoveryWizardUrl,"?") ? "&" : "?";
    //    discoveryWizardUrl = discoveryWizardUrl + urlsign + 'emailId='+email+inputDivUrl+credentialsDivUrl+rulesDivUrl+interfaceDivUrl+scheduleDivUrl;//No I18N
        input_data.emailId = email;
        if(toStage === 'save'){//No I18N
            input_data.executeNow=false;//No I18N
            input_data.sheduleDiscovery=true;//No I18N
        }else{
            input_data.executeNow=true;//No I18N
            input_data.sheduleDiscovery=false;//No I18N
        }
        var exec = false;
        var discResponse = function(response){
            if(response !== undefined && !$.isEmptyObject(response)){
                if(response.message !== undefined || (response.result !== undefined && response.result.message !== undefined)){

                    if(response.message !== undefined ){
                        var sucMsg = response.message;
                    }else{
                        var sucMsg = response.result.message;
                    }

                    if(exec){
                        var uniqueId = opm_infoMsgs('infoMsg',sucMsg + " " + (!window.OPM.isRMMCentral ? Ember.I18n.t('webclient.discoveryprofile.gotoInvpage') : ''));//No I18N
                        OPMClient.DiscoveryWizardAddEditController.set('topBandID',uniqueId);//No I18N
                        $("#discoverSaveAndExecBtn").prop('disabled',false); //No I18n
                        $("#discoverySave").prop('disabled',false); //No I18n
                        setTimeout(function(){
                            settingsGlobalRoute.transitionTo('Settings.Discovery.DiscoveryProfiles');//No I18N
                        },1000);
                    }else{
                        opm_infoMsgs('successMsg',sucMsg);//No I18N
                        setTimeout(function(){
                            settingsGlobalRoute.transitionTo('Settings.Discovery.DiscoveryProfiles');//No I18N
                        },1000);
                    }
                    
                }else if(response.error !== undefined){
                    opm_infoMsgs('errorMsg',response.error.message);//No I18N
                    $("#discoverSaveAndExecBtn").prop('disabled',false); //No I18n
                    $("#discoverySave").prop('disabled',false); //No I18n
                }
            }
        }
        csvData = new FormData();
        if(disc_csv_file !== "")
        {
            csvData.append('file',disc_csv_file);//No I18N 
        }
       $.each(input_data,function(key,val){
            csvData.append(key,val);
        });
       $.each(schedule_data,function(key,val){
            csvData.append(key,val);
        });
        if(toStage !== 'save'){//No I18N
            exec = true;
            $("#discoverSaveAndExecBtn").prop('disabled',true); //No I18n
            $("#discoverySave").prop('disabled',true); //No I18n
            opm_ajaxPostRequestWithClbk(discoveryWizardUrl,csvData,Ember.I18n.t('webclient.topo.discovery.success',this),discResponse);//No I18N
        }else{
            exec = false;
            opm_ajaxPostRequestWithClbk(discoveryWizardUrl,csvData,Ember.I18n.t('webclient.discovery.addwait',this),discResponse);//No I18N
        }
    }
}
function deleteFilter(id){
    if(confirm(Ember.I18n.t('webclient.admin.credential.delete',this))){//No I18N
        $(id).closest('div[class=filterRow]').remove();
        if($.trim( $('#filterContent').html() ).length === 0){
            $("#filterDiv").hide();
        }
    }
}

function showFilterOptions(type){
    $("#IPRangeDiv,#IPRangeDiv_ipv6").hide();
    $("#IPAddressDiv").hide();
    $("#categoryDiv").hide();
    $("#filterCondition").empty();
    OPMClient.DiscoveryWizardAddEditController.set("selectedDiscFilter",type); //No I18n
    if(type === "IPRange"){//No I18N
        $("#filterCondition").append('<option value="equals">'+Ember.I18n.t("webclient.threshold.condition.equals",this)+'</option>');//No I18N
    }else{
        $("#filterCondition").append('<option value="equals">'+Ember.I18n.t('webclient.threshold.condition.equals',this)+'</option><option value="contains">'+Ember.I18n.t('webclient.threshold.condition.contains',this)+'</option>');//No I18N
    }
    if(type === "Category" || type === "DeviceType" || type === "Device"){//No I18N
        var searchData = [];//No I18N
        $("#categoryDiv").show();
           if(type == "Category"){//No I18N
                apiUrl=window.OPM.apiUrlPattern + "/device/getCategoryList";   //No I18N
                $.ajax({
                url:apiUrl, //No I18N
                type:'GET', //No I18N
                async:false,
                success:function(data){ //No I18N
                    $.each(data,function(k,v){
                        searchData.push({'prop':k,'label':v}); //No I18N
                    });
                }
            });
            showSearchValues(searchData,'filterValue');//No I18N
        }
    }else{
        var ipRangeType = $("input:radio[name=ipRangeType]:checked").val();//No I18N
        if(ipRangeType === "ipv6" && type === "IPRange")
        {
            $("#"+type+"Div_"+ipRangeType).show();
        }
        else{
            $("#"+type+"Div").show();
        }
    }
}

function opm_ipTraversal(event,start,end){
    var id = $("*:focus").attr("id");//No I18N
    if(id!==undefined) {
    var hasStartindex = id.indexOf(start);
    var hasEndindex = id.indexOf(end);
    if(id === start+"4" &&  $('#'+id).val() !== undefined){//No I18N
        $('#'+end+'1').val($('#'+start+'1').val());//No I18N
        $('#'+end+'2').val($('#'+start+'2').val());//No I18N
        $('#'+end+'3').val($('#'+start+'3').val());//No I18N
        if($('#'+start+'4').val().length === 3){//No I18N
            $("#"+end+"4").focus();
        }
    }
    else if($("#"+id).val().length === 3 && (id !== start+'4') && (hasStartindex != -1 || hasEndindex != -1)){//No I18N
        $($("*:focus")).next().focus();
    }
    else if(event.key === "." || event.keyCode === 190)
    {
         $($("*:focus")).next().focus();
    }
    }
}

function showIPRange(){
    $("#ipv4Div").hide();
    $("#ipv6Div").hide();
    var selected = $("input:radio[name=ipRangeType]:checked").val();//No I18N
    $("#"+selected+"Div").show();
}

function showCIDRDiv(){
    $("#cidrv4Div").hide();
    $("#cidrv6Div").hide();
    var selected = $("input:radio[name=cidrType]:checked").val();//No I18N
    $("#"+selected+"Div").show();
}

function loadGroupwiseDetails(filterVal){
    //$("#existingDevicesList").empty();
    if(filterVal !== undefined && filterVal !== "")
    {
        var toLoad = filterVal;
    }
    else
    {
        var toLoad = $("#groupOptions option:selected" ).val();
    }
    var rspLen = 2;
    var discoveryType = $('input:radio[name=discoveryType]:checked').val();//No I18N
     $("#searchDiv").show();
     $(".selectallLi").show();
     $("#discSelectallLi").show();
     $('.selectAll').prop('checked',false)
    var url = "";//No I18N
    if(toLoad != ""){
    	if(toLoad === "devices"){//No I18N
    		url = window.OPM.apiUrlPattern + '/device/fetchDevicesList?excludeWLC=true&excludeAgentDevice=true&excludeIPMI=true&includeWLCOnly=true&excludeOpenFWDevice=true';//No I18N
    	}else if(toLoad === "category"){//No I18N
    		url = window.OPM.apiUrlPattern + '/device/getCategoryList?excludeAP=true&excludeIPMI=true&excludeSDWAN=true&excludeMeraki=true';//No I18N
    	}else if(toLoad === "bv"){//No I18N
    		url = window.OPM.apiUrlPattern + '/businessview/getBusinessView';//No I18N
    	}
	else if(toLoad === "group"){//No I18N
            url = window.OPM.apiUrlPattern +'/admin/listGroupsbasedType?groupType=device';//No I18N
        }
        if(window.OPM.showMiniPollerfld && toLoad === "devices"){
            var rcId = $("#rmPollerName option:selected").val();
            url = url + "&pollerID="+rcId;//No I18N
        }
    	$.ajax({
            url:url, //No I18N
            type:'GET', //No I18N
            async:false,
            success:function(jsonData){ //No I18N
            	if(jsonData !== undefined && !$.isEmptyObject(jsonData)){
                    var listArr = new Array();
                    if(toLoad === "devices"){//No I18N
                        $.each(jsonData,function(key,val){
                           listArr.push({"displayName":val.displayName,"value":val.name});//No I18n
                           rspLen ++;
                        });
                    }else if(toLoad === "category"){//No I18N
                        $.each(jsonData,function(key,val){
                           listArr.push({"displayName":val,"value":key});//No I18n
                            rspLen ++;
                        });
                    }else if(toLoad === "bv"){//No I18N
                        if(jsonData.BusinessView.Details !== undefined){
                            $.each(jsonData.BusinessView.Details,function(key,val){
                                listArr.push({"displayName":val.displayName,"value":val.name});//No I18n
                                 rspLen ++;
                            });
                        }else{
                            $("#searchDiv").hide();
                            $("#discSelectallLi").hide();
                            listArr.push({"displayName":Ember.I18n.t('webclient.api.businessviews.notfound',this),"value":'','isNoData':true});//No I18N
                            rspLen ++;
                        }
                    }
                    else if(toLoad === "group"){//No I18N
                            
                        if(jsonData.result !== undefined && jsonData.result.message !== undefined){
                            $("#searchDiv").hide();
                            $(".selectallLi").hide();
                             $("#discSelectallLi").hide();
                            listArr.push({"displayName":Ember.I18n.t('webclient.opm.group.notfound',this),"value":'','isNoData':true});//No I18N
                            rspLen ++;
                        }else{
                            $.each(jsonData,function(key,val){
                               listArr.push({"displayName":val,"value":key});
                                rspLen ++;
                            });
                        }
                    }
                    Ember.set(OPMClient.DiscoveryWizardAddEditController,"discoveryWizExistingDeviceArr",listArr);//No I18N
                }
            }
        });
       /* //For Assigning chosen members while Editing
        if(OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.members !== undefined && OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.members.length > 0){//No I18N
            var selectedMembers = OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.members.split(",");//No I18N
            $.each(selectedMembers,function(key,val){
                setSelection(val);
            });
            
        }*/
    }

    $('.selectAll').change(function(){
        that=$(this).parent().parent().parent().parent().find('.chk:visible');
        if(this.checked){
            that.each(function(){this.checked=true;});
        }else{
            that.each(function(){this.checked=false;});
        }
    });
    $('.chk').click(function(){
        that=$(this).parent().parent().parent().parent();
        selectAll=that.find('.selectAll');
        if(that.find('.chk:checkbox:not(:checked)').length==0){
            selectAll.prop('checked',true);//No I18N
        }else{
            selectAll.prop('checked',false);//No I18N
        }
    });
    $('.opmAccListChk').css({height:''});//No I18N
    prntListHt=$('.opmAccListChkPrnt').height();
    scrlListHt = 0;
    if($('.opmAccListChkPrnt li.active').find('ul')[0]){
        scrlListHt=$('.opmAccListChkPrnt li.active').find('ul')[0].scrollHeight;
   }
    if(scrlListHt>prntListHt){
        $('.opmAccListChk').css({height:scrlListHt,'max-height':'630px'});
    }else{
        $('.opmAccListChk').css({height:prntListHt,'max-height':'630px'});
    }
    $('.opmAccListChk.discoveryWizardHolder').css({'z-index':'0'}); //No I18n
}

function setSelection(value){
    $("#existingDevicesList li").each(function(){
      var name = $(this).find("input").val();
        if(name === value){
            $(this).find("input").prop("checked",true);
         }
    });
}

function enableDisableDiv(enableId,showDiv){	
	var isChecked = $('#'+enableId).prop("checked");//No I18N
    if(OPMClient.DiscoveryWizardAddEditController.isExisting === false){
        //OPMClient.DiscoveryWizardAddEditController.set("showRediscoveryDiv",false);//No I18N
        $("#rediscoveryDiv").hide();//No I18N
    }else{
        //OPMClient.DiscoveryWizardAddEditController.set("showRediscoveryDiv",true);//No I18N
        $("#rediscoveryDiv").show();//No I18N
    }
	if(isChecked){
		$('#'+showDiv).show();
        var schFrequency = $("#discFrequency .active").attr("value");//No I18N
        if(schFrequency !== "1"){
            //OPMClient.DiscoveryWizardAddEditController.set("showRediscoveryDiv",true);//No I18N
            $("#rediscoveryDiv").show();//No I18N
        }
	}else{
		$('#'+showDiv).hide();
	}
}
function loadDiscoveryProfileDetails(profileId,profileName){
    var rsp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/discovery/getDiscoveryProfile?profileId="+profileId);//No I18N
     $("#addFilter").show();
    if(rsp !== undefined && !$.isEmptyObject(rsp)){
        OPMClient.DiscoveryWizardAddEditController.set("wizardDetailsObj",rsp[0]);
        var wizardDetails = rsp[0];
        var type = wizardDetails.discoveryType;
        var ipVersion = wizardDetails.ipVersion;
        $('#discName').val(wizardDetails.profileName);//No I18N
        var range = wizardDetails.rangeDetails;
        var mask = wizardDetails.netmask;
        if(type === 'SingleDevice')
        {
            type = 'singleDevice'; //No I18n
        }
        changediscoverType(type);
        if(type === 'IPRange'){//No I18N
            $('input[name=ipRangeType][value="ipv'+ipVersion+'"]').prop('checked',true);//No I18N
            showIPRange();
            if(ipVersion === '4')
            {
                var rangeDetails = wizardDetails.rangeDetails;
                var replaceNewLine = rangeDetails.replace(/:/g, "\n"); //No I18n
                var IPV4Range = replaceNewLine.replace(/,/g, "-"); //No I18n
                $("#IPRangeDetails").val(IPV4Range);
                /*var fromTo = (wizardDetails.rangeDetails).split(",");//No I18N
                $.each(fromTo,function(k,v){
                    var temp = v.split("=");
                     $.each(temp,function(p,q){
                        if(p==1){
                            var ipTemp = q.split(".");
                            $.each(ipTemp,function(r,s){
                                if(k==0 && r==0){
                                    $("#startIP1").val(s);
                                }else if(k==0 && r==1){
                                    $("#startIP2").val(s);
                                }else if(k==0 && r==2){
                                    $("#startIP3").val(s);
                                }else if(k==0 && r==3){
                                    $("#startIP4").val(s);
                                }else if(k==1 && r==0){
                                    $("#endIP1").val(s);
                                }else if(k==1 && r==1){
                                    $("#endIP2").val(s);
                                }else if(k==1 && r==2){
                                    $("#endIP3").val(s);
                                }else if(k==1 && r==3){
                                    $("#endIP4").val(s);
                                }
                            });
                        }
                     });
                });*/
                $('#netmask').val(mask);
            }else if(ipVersion === '6'){
                var fromIp = (wizardDetails.rangeDetails).split(",");
                $('#startIpV61').val(fromIp[0].split("=")[1]);
                $('#endIpV61').val(fromIp[1].split("=")[1]);
                $('#maskIpV61').val(mask);
            }
        }else if(type === "CIDR"){ //No I18N
            $('input[name=cidrType][value="cidrv'+ipVersion+'"]').prop('checked',true);
            showCIDRDiv();
            if(ipVersion === '4'){//No I18N

                $('#nwIpStart5').val(mask);
                var fromIp = ((wizardDetails.rangeDetails).split("="))[1].split(",")[0].split(".");
                for(var i=1; i<=4; i++){
                    $('#nwIpStart'+i).val(fromIp[i-1]);
                }
            }else if(ipVersion === '6'){//No I18N
                $('#maskBit').val(mask);
                $('#networkIP').val((wizardDetails.rangeDetails).split("=")[1]);
            }
        }else if(type === "CSV"){ //No I18N
            $("#csvNetmask").val(mask);
        }else if(type === "ExistingDevices"){  //No I18N
            OPMClient.DiscoveryWizardAddEditController.set("isExisting",true);//No I18N
          //  OPMClient.DiscoveryWizardAddEditController.set("showRediscoveryDiv",true);
            $("#rediscoveryDiv").show();//No I18N
            $("#addFilter").show();
            $('#groupOptions').val(wizardDetails.type).prop('selected',true);//No I18N
            loadGroupwiseDetails();
        }else if(type === 'singleDevice'){ //No I18n
            $("#ipAddress").val(range);
            $('#ipNetmask').val(mask);
        }

        if(wizardDetails.addRule == "true" || wizardDetails.ignoreRule == "true"){//No I18N
            var discoverCriteriaList = {"IPRange":Ember.I18n.t('webclient.layer.discovery.iprange',this),"IPAddress":Ember.I18n.t('webclient.topo.actions.deviceinfo.ipaddress',this),"Category":Ember.I18n.t('webclient.devices.details.category',this),"DeviceType":Ember.I18n.t('webclient.action.devicetype',this),"Device":Ember.I18n.t('webclient.devices.details.devicename',this)};  //No I18N
            var filterConditionList ={"equals":Ember.I18n.t('webclient.threshold.condition.equals',this),"contains":Ember.I18n.t('webclient.threshold.condition.contains',this)};//No I18N
            if(wizardDetails.addRule == "true"){//No I18N
                $.each(wizardDetails.addFilter,function(index,details){
                    details.value = escapeHTML(details.value);
                    $("#filterContent").append("<div class='filterRow'><div class='filterType' data-val='"+details.type+"'>"+discoverCriteriaList[details.type]+"</div><div class='filterCondition' data-val='"+details.condition+"'>"+filterConditionList[details.condition]+"</div><div class='filterValue'>"+(details.value).toString()+"</div><div><div class='enableDisableBtn'><input type='checkbox' checked/><label><i>"+Ember.I18n.t('webclient.admin.re.add',this)+"</i><i>"+Ember.I18n.t('webclient.common.ignore',this)+"</i></label></div></div><div><i class='icon-trash' onclick='deleteFilter(this);'></i></div></div>");//No I18N
                });
            }
            if(wizardDetails.ignoreRule === "true"){//No I18N
                $.each(wizardDetails.ignoreFilter,function(index,details){
                    details.value = escapeHTML(details.value);
                    $("#filterContent").append("<div class='filterRow'><div class='filterType' data-val='"+details.type+"'>"+discoverCriteriaList[details.type]+"</div><div class='filterCondition' data-val='"+details.condition+"'>"+filterConditionList[details.condition]+"</div><div class='filterValue'>"+(details.value).toString()+"</div><div><div class='enableDisableBtn'><input type='checkbox'/><label><i>"+Ember.I18n.t('webclient.admin.re.add',this)+"</i><i>"+Ember.I18n.t('webclient.common.ignore',this)+"</i></label></div></div><div><i class='icon-trash' onclick='deleteFilter(this);'></i></div></div>");//No I18N
                });
            }
            $("#filterDiv").show();
        }
        
        //For Interface

        var isIntfDiscEnable = wizardDetails.interfaceDiscovery;
       
        if(isIntfDiscEnable === "true" && wizardDetails.intfTypeIds !== undefined && wizardDetails.intfTypeIds !== ""){//No I18N
            $("#doIntfDiscovery").prop('checked',true);
            intfEnableDisable();
            $('input[name="adminStatus"]').attr('checked',false);
            $('input[name="operStatus"]').attr('checked',false);
            var intfIds = (wizardDetails.intfTypeIds).split(',');

            if(wizardDetails.intfAdminStatus !== "" && wizardDetails.intfAdminStatus !== undefined){//No I18N
                var adminState = (wizardDetails.intfAdminStatus).split(',');
                $.each(adminState,function(k,v){
                    $('input[name="adminStatus"][value="'+v+'"]').prop('checked',true);
                });
            }
            if(wizardDetails.intfOperStatus !== "" && wizardDetails.intfOperStatus !== undefined){//No I18N
                var operState = (wizardDetails.intfOperStatus).split(',');
                $.each(operState,function(k,v){
                    $('input[name="operStatus"][value="'+v+'"]').prop('checked',true);
                });
            }

            $.each(intfIds,function(k,v){
                $('input:checkbox[name=interfaceTypes][value="'+v+'"]').attr('checked',true);
            });
        }else{
            $("#doIntfDiscovery").prop('checked',false);
            intfEnableDisable();
            /*$('input[name="interfaceTypes"]').attr('disabled',true);
            $('#allIntfTypes').prop('disabled',true)
            $('input[name="selectAllInterfaceStatus"]').attr('checked',false);
            $('input[name="selectAllInterfaceStatus"]').attr('disabled',true);
            $('input[name="adminStatus"]').attr('disabled',true);
            $('input[name="operStatus"]').attr('disabled',true);*/
        }

        //For Schedule

        var email = wizardDetails.emailId;
        if(email !== "" || email !== undefined){
            $('#discMailId').val(email);
            $("#subject").val(wizardDetails.subject);
            $("#message").val(wizardDetails.message);
        }
        
        if(wizardDetails.scheduleDetails === undefined){
            $("#discExecuteNow").prop("checked",true);
            $('#isScheduleEnabled').prop('checked',false);
            opm_discoveryScheduleType(true);
             enableDisableDiv('isScheduleEnabled','scheduleDetails');//No I18N
        }else if(!window.OPM.isOPMStandardEdition && wizardDetails.scheduleDetails.schedType !== undefined){//No I18N
          //  $('#isScheduleEnabled').prop('checked',true);
           // enableDisableDiv('isScheduleEnabled','scheduleDetails');//No I18N
           $("#discExecuteLater").prop("checked",true);
           opm_discoveryScheduleType(false);
            $('#discFrequency').find('div[value=1]').addClass("noActive").removeClass("active");//No I18N
            $("#once").removeClass("active");//No I18N
            var divToShow;
            if(wizardDetails.scheduleDetails.schedType === '5'){//No I18N
                $('#discFrequency').find('div[value=4]').addClass("active");//No I18N
                divToShow =  $('#discFrequency').find('div[value=4]').attr("data-href");//No I18N

            }else{
                $('#discFrequency').find('div[value='+wizardDetails.scheduleDetails.schedType+']').addClass("active");//No I18N
                divToShow =  $('#discFrequency').find('div[value='+wizardDetails.scheduleDetails.schedType+']').attr("data-href");//No I18N
            }
            $("#"+divToShow).addClass("active");//No I18N
            var selFrequency = wizardDetails.scheduleDetails.schedType;
            if(selFrequency === "1"){//No I18N
                $('#onceHour').val(wizardDetails.scheduleDetails.onceHour).prop('selected',true);
                if(wizardDetails.scheduleDetails.onceMin.length === 1 && Number(wizardDetails.scheduleDetails.onceMin) <= 9){//No I18N
                    wizardDetails.scheduleDetails.onceMin = "0"+wizardDetails.scheduleDetails.onceMin;//No I18N
                }
                $('#onceMin').val(wizardDetails.scheduleDetails.onceMin).prop('selected',true);
                $("#onceDate").datepicker({ dateFormat: 'yy-mm-dd'}).datepicker('setDate', wizardDetails.scheduleDetails.onceDate); //No I18N
            }else if(selFrequency === "2"){//No I18N
                $('#dailyHour').val(wizardDetails.scheduleDetails.dailyHour).prop('selected',true);
                if(wizardDetails.scheduleDetails.dailyMin === "0" || wizardDetails.scheduleDetails.dailyMin === "5"){//No I18N
                    wizardDetails.scheduleDetails.dailyMin = "0"+wizardDetails.scheduleDetails.dailyMin;//No I18N
                }
                $('#dailyMin').val(wizardDetails.scheduleDetails.dailyMin).prop('selected',true);
                $("#dailyStartDate").datepicker({ dateFormat: 'yy-mm-dd'}).datepicker('setDate', wizardDetails.scheduleDetails.dailyStartDate); //No I18N
            }else if(selFrequency === "3"){//No I18N
                $('#weeklyHour').val(wizardDetails.scheduleDetails.weeklyHour).prop('selected',true);
                if(wizardDetails.scheduleDetails.weeklyMin === "0" || wizardDetails.scheduleDetails.weeklyMin === "5"){//No I18N
                    wizardDetails.scheduleDetails.weeklyMin = "0"+wizardDetails.scheduleDetails.weeklyMin;//No I18N
                }
                $('#weeklyMin').val(wizardDetails.scheduleDetails.weeklyMin).prop('selected',true);
                var weekDays = wizardDetails.scheduleDetails.weeklyDay;
                $.each(weekDays,function(k,v){
                    $("#weeklyDayCheBox input[type=checkbox][value='"+v+"']").prop('checked', true);//No I18N
                });
            }else if(selFrequency === "4"){//No I18N
                $('input:radio[name="monthlyType"][value="4"]').prop('checked', true);//No I18N
                $('#monthlyDate').val(wizardDetails.scheduleDetails.monthlyDate).prop('selected',true); // No I18N
                $('#monthlyHour').val(wizardDetails.scheduleDetails.monthlyHour).prop('selected',true);
                if(wizardDetails.scheduleDetails.monthlyMin === "0" || wizardDetails.scheduleDetails.monthlyMin === "5"){//No I18N
                    wizardDetails.scheduleDetails.monthlyMin = "0"+wizardDetails.scheduleDetails.monthlyMin;//No I18N
                }
                $('#monthlyMin').val(wizardDetails.scheduleDetails.monthlyMin).prop('selected',true);//No I18N
                showDaysFields();
            }else if(selFrequency === "5"){//No I18N
                $('input:radio[name="monthlyType"][value="5"]').prop('checked', true);//No I18N
                $('#monthlyWeekNum').val(wizardDetails.scheduleDetails.monthlyWeekNum).prop('selected',true);
                var weekDays = wizardDetails.scheduleDetails.monthlyDay;
                $.each(weekDays,function(k,v){
                    $("#monthlyDayCheBox input[type=checkbox][value='"+v+"']").prop('checked', true);//No I18N
                });
                $('#monthlyHour').val(wizardDetails.scheduleDetails.monthlyHour).prop('selected',true);
                if(wizardDetails.scheduleDetails.monthlyMin === "0" || wizardDetails.scheduleDetails.monthlyMin === "5"){//No I18N
                    wizardDetails.scheduleDetails.monthlyMin = "0"+wizardDetails.scheduleDetails.monthlyMin;//No I18N
                }
                $('#monthlyMin').val(wizardDetails.scheduleDetails.monthlyMin).prop('selected',true);
                showDaysFields();
            }else if(selFrequency === "6"){//No I18N
                $('#yearlyHour').val(wizardDetails.scheduleDetails.yearlyHour).prop('selected',true);
                if(wizardDetails.scheduleDetails.yearlyMin === "0" || wizardDetails.scheduleDetails.yearlyMin === "5"){//No I18N
                    wizardDetails.scheduleDetails.yearlyMin = "0"+wizardDetails.scheduleDetails.yearlyMin;//No I18N
                }
                $('#yearlyMin').val(wizardDetails.scheduleDetails.yearlyMin).prop('selected',true);
                $('#yearlyDate').val(wizardDetails.scheduleDetails.yearlyDate).prop('selected',true); //No I18N

                var months = wizardDetails.scheduleDetails.yearlyMonth;
                $.each(months,function(k,v){
                    $("#yearlyMonthCheBox input[type=checkbox][value='"+v+"']").prop('checked', true);//No I18N
                });
            }
        }
        if(wizardDetails.rediscoveryIntfRule === "true" || wizardDetails.rediscoveryDeviceRule === "true"){//No I18N
            //$('#isRediscoveryEnabled').prop("checked",true);
            //enableDisableDiv('isRediscoveryEnabled','rediscoveryDiv'); //No I18N
          //  OPMClient.DiscoveryWizardAddEditController.set("showRediscoveryDiv",true); //No I18N
            $("#rediscoveryDiv").show();//No I18N
            OPMClient.DiscoveryWizardAddEditController.set("editRediscovery",true);//No I18N
            $('#intfRemove').val(wizardDetails.intfRemoveAction);
            $('#intfAdd').val(wizardDetails.intfAddAction.replace("\"",""));
            $('#devRemove').val(wizardDetails.deviceRemoveAction);
            $('#devAdd').val(wizardDetails.deviceAddAction);
        }else{
            OPMClient.DiscoveryWizardAddEditController.set("editRediscovery",false);//No I18N
        }
    }
}
function setSelectedProfileCredentials(){
    if(OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.credentialNames !== undefined && OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.credentialNames !== ""){//No I18N
        var selCrd = (OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.credentialNames).split(',');
        var grid = $('#DECredProfList');
        var crdGridIds = grid.jqGrid('getGridParam','data'); //No I18N
       
        for(var i=1; i <= crdGridIds.length; i++){
            var ret = grid.jqGrid('getRowData', i);  //No I18N
            $.each(selCrd,function(k,v){
                if(ret.credentialName === v){
                    $('#DECredProfList').jqGrid('setSelection', i, true);//No I18N
                }
            }); 
        }
    }
}
function setSelectedRuleEngines(){
    if(OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.ruleIds !== undefined){
        var selrule = (OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.ruleIds).split(',');
        var grid = $('#jqgridList');
        var ruleGridIds = grid.jqGrid('getGridParam','data'); //No I18N
        for(var i=1; i <= ruleGridIds.length; i++){
            var ret = grid.jqGrid('getRowData', i); //No I18N
            $.each(selrule,function(k,v){
                if(ret.ruleid === v){
                    $('#jqgridList').jqGrid('setSelection', i, true);//No I18N
                 }
            });
        }
    }
}
function changediscoverType(discType){
    $('.discoveryWizardHolder > ul > li').removeClass('active noActive');
    $('ul#discoveryList').find("#"+discType).addClass('active');
    $('ul#discoveryList').find("#"+discType).find("input").prop("checked",true);//No I18N
    //if(discType !== "IPRange"){
        $('.discoveryWizardHolder > ul > li:first-child').addClass('noActive');
    //}
}

var currentValue = "";//No I18N
function showSearchValues(dataArr,div)
{
    currentValue = "";//No I18N
    var searchData = [];//No I18N
    searchData = dataArr;
    $("#"+div).focus();//No I18N
    
    $("#"+div)
      .bind( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).autocomplete( "instance" ).menu.active ) {//No I18N
          event.preventDefault();
        }
      })
      .autocomplete({
        minLength: 0,
        source: function( request, response ) {
          response( $.ui.autocomplete.filter(
            searchData, extractLast( request.term ) ) );
        },
        focus: function() {
          return false;
        },
        select: function( event, ui ) {
            $("#"+div).val( ui.item.label );
            $("#"+div).attr("data-selectVal",ui.item.prop);
            currentMoId = ui.item.prop;
            return false;
          }
      });
}
function split( val ) {
    return val.split( /,\s*/ );
}
function extractLast( term ) {
    return split( term ).pop();
}

function opmAccListChkHt(){
    prntListHt=$('.opmAccListChk > ul').height();
    scrlListHt=$('.opmAccListChk ul ul')[0].scrollHeight;
    if(scrlListHt>prntListHt){
        $('.opmAccListChk').css({height:scrlListHt});
    }else{
        $('.opmAccListChk').css({height:prntListHt});
    }
}

function showDaysFields()
{
    var monthlyType = $('input:radio[name="monthlyType"]:checked').val(); //No I18N
    if(monthlyType === "4")//No I18N
    {
      $("#monthlyDayCheBox").hide();
      $("#monthlyDate").prop("disabled",false);
      $("#monthlyWeekNum").prop("disabled",true);
      
    }
    else
    {
       $("#monthlyWeekNum").prop("disabled",false);
       $("#monthlyDayCheBox").show();
       $("#monthlyDate").prop("disabled",true);
    }
}
//Temp Old function
function opm_selectAllChecks(e,targetChecks)
{
	if (targetChecks != undefined)
	{
		if (targetChecks.length == undefined)
		{
			if (e.checked == true)
			{
				targetChecks.checked = true;
			}
			else
			{
				targetChecks.checked = false;
			}
		}
		else
		{
			if (e.checked == true)
			{			
				for (var i=0; i<targetChecks.length; i++)
				{
					targetChecks[i].checked = true;
				}
			}
			else
			{
				for (var i=0; i<targetChecks.length; i++)
				{
					targetChecks[i].checked = false;
				}
			}
		}
	}
}

function opm_skipIntfDiscovery(e,targetChecks){

		if (targetChecks.length == undefined)
		{
			if (e.checked == true)
			{
				$('#allIntfTypes').prop('disabled',true)
				$('#allIntfTypes').attr('checked', false);
				$('input[name="selectAllInterfaceStatus"]')[0].checked = false;
				$('input[name="selectAllInterfaceStatus"]')[0].disabled = true;
			}
			else
			{
				$('#allIntfTypes').prop('disabled',false)
				$('#allIntfTypes').attr('checked', false);
				$('input[name="selectAllInterfaceStatus"]')[0].checked = true;
				$('input[name="selectAllInterfaceStatus"]')[0].disabled = false;

			}
		}
		else
		{
			if (e.checked == true)
			{
				for (var i=0; i<targetChecks.length; i++)
				{
					targetChecks[i].disabled = true;
					targetChecks[i].checked = false;
				}
			}
			else
			{
				for (var i=0; i<targetChecks.length; i++)
				{
					targetChecks[i].checked = false;
					targetChecks[i].disabled = false;
				}
				$('input[name="adminStatus"]')[0].checked = true;
				$('input[name="adminStatus"]')[1].checked = true;
				$('input[name="operStatus"]')[0].checked = true;
				$('input[name="operStatus"]')[1].checked = true;
			}
		}
}

function opm_checkIfAnyThingIsChecked(checkBoxElem)
{
    var result = "";
    if (checkBoxElem != undefined)
    {
        if (checkBoxElem.length != undefined)
        {
            for(var i=0; i<checkBoxElem.length; i++)
            {
                if(checkBoxElem[i].checked == true)
                {
                    if (result == "")
                    {
                        result = checkBoxElem[i].value;
                    }
                    else
                    {
                        result = result +","+ checkBoxElem[i].value;
                    }
                }
            }
        }
        else
        {
            if(checkBoxElem.checked == true)
            {
                result = checkBoxElem.value;
            }
        }
    }
    return result;
}   

function isValidIPV4Address(startHeader,endHeader){
    for(var i=1;i<=4;i++){
        if(trimAll($('#'+startHeader+i).val()).length ===0 || $('#'+startHeader+i).val() > 255){
            alert(Ember.I18n.t('webclient.discovery.validip',this));//No I18N
            $('#'+startHeader+i).focus();
            return false;
        }else if(trimAll($('#'+endHeader+i).val()).length ===0  || $('#'+endHeader+i).val() > 255 ){
            alert(Ember.I18n.t('webclient.discovery.validip',this));//No I18N
            $('#'+endHeader+i).focus();
            return false;
        }else{
            if(i == 1){
                if(parseInt($('#'+endHeader+i).val()) < parseInt($('#'+startHeader+i).val())){
                    alert(Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                    $('#'+endHeader+i).focus();
                    return false;
                }
            }else{
                var j = i-1;
                if(parseInt($('#'+endHeader+j).val())  === parseInt($('#'+startHeader+j).val()))
                {
                    if(parseInt($('#'+endHeader+i).val()) < parseInt($('#'+startHeader+i).val()))
                    {
                        alert(Ember.I18n.t('webclient.discovery.rangecheck',this));//No I18N
                        $('#'+endHeader+i).focus();
                        return false;
                    }
                }
            }
        } 
    }
    return true;
}
 function redirectToDevices(){
    $("#"+OPMClient.DiscoveryWizardAddEditController.topBandID).remove();
    if(OPMClient.ApplicationController.isNFA || OPMClient.ApplicationController.isNCM) {
        settingsGlobalRoute.transitionTo("Inventory.List.ConfigMgmt.Sub","Devices");//No I18N
    }else {
        if(window.OPM.isOpmPlug){
        	//settingsGlobalRoute.transitionTo("Inventory.List.Summary.Sub","Devices");//No I18N
            redirectToInventoryList(settingsGlobalRoute,"Devices");//No I18N
        }else{
            settingsGlobalRoute.transitionTo("Inventory.List.ConfigMgmt.Sub","Devices");//No I18N
        }
    }
}

function intfEnableDisable(){
   if($("#doIntfDiscovery").is(":checked")){//No I18N
	   if($('#interfaceDiscOptions').hasClass('disabledDiv')){
		   $('#interfaceDiscOptions').removeClass('disabledDiv');
	   }
        $(".toDisable").prop("disabled",false);//No I18N
        $("input[name=adminStatus]").prop("checked",true);//No I18N
        $("input[name=operStatus]").prop("checked",true);//No I18N
   }else{
	   if(!$('#interfaceDiscOptions').hasClass('disabledDiv')){
		   $('#interfaceDiscOptions').addClass('disabledDiv');
	   }
        $(".toDisable").prop("disabled",true);//No I18N
        $("input[name=adminStatus]").prop("checked",false);//No I18N
        $("input[name=operStatus]").prop("checked",false);//No I18N
   }
}
function showScheduleSubDiv(divId){
    if(divId === "emailDiv"){
        if(validateSteps("schedule")){
            $("#subScheduleDiv").hide();
            $("#emailDiv").show();
            OPMClient.SettingsAddDeviceController.set("currentDivHeaderInfo","opm.info.discovery.report.notify"); //No I18n
        }
    }
    else if(divId === "subScheduleDiv"){
        var executeNow = $('input[name=discoveryScheduleType]:checked').val();
        if(executeNow === "true")
        {
            discoveryWizardSlider("schedule","bwd","interface");//No I18N
            //$("#emailDiv,#scheduleDiv").hide();
        }
        else{
            $("#subScheduleDiv").show();
            $("#emailDiv").hide();
        }
    $(".discoveryWizard .opmFormHolder.scrollTop").scrollTop(0);

    }
    else{
        $("#subScheduleDiv").show();
        $("#emailDiv").hide();
    }

}
//Notification Profile related functions


var profileStep1 = false;
var profileStep2 = false;
var profileStep3 = false;
var profileStep4 = false;
var profileStep5 = false;
var optSelCnt = 0;
var dropDownOptions = "";

function getCountOfSelectedOptions(name)
{
     var allCri = OPMClient.SettingsNotificationsController.allCriteriaSelectOptions[name];
     var tot = 0;
     var cnt = 0;
     var str = "";
     if(allCri !== undefined && allCri !== ""){
            $.each(allCri,function(i,obj){
            tot+=1;
            if(obj.selected){
                cnt+=1;
            }
        });
        str = ""+Ember.I18n.t('webclient.Selected',this)+"&nbsp;&nbsp;(&nbsp;"+cnt+"&nbsp;|&nbsp;"+tot+"&nbsp;)"; //No I18N
    }else{
        str = ""+Ember.I18n.t('webclient.Selected',this)+"&nbsp;&nbsp;(&nbsp;"+cnt+"&nbsp;|&nbsp;"+tot+"&nbsp;)"; //No I18N
    }
    
    return str;
}



function getProfileRowSpecificFormat (cellValue, options, rowdata, action) {
   var criName = rowdata.monitorName;
   var dispName = rowdata.Name;
   var cntStr = "";
   var re = "";
   var intfThreshDiv = '<div class="opmMultiSelect" id="intfThreshDiv" onclick="checkIntfThreshSelected()"><div class="checkBoxLabel"><input class="intfThreshRadio" type="checkbox" value="UTIL"><div class="labelName">'+Ember.I18n.t('webclient.reports.createreport.utilization',this)+'</div></div><div class="checkBoxLabel"><input class="intfThreshRadio" type="checkbox" value="ERROR"><div class="labelName">'+Ember.I18n.t('webclient.snapshot.name.Error.Rate',this)+'</div></div><div class="checkBoxLabel"><input class="intfThreshRadio" type="checkbox" value="DISCARD"><div class="labelName">'+Ember.I18n.t('webclient.snapshot.name.Discard.Rate',this)+'</div></div></div> ' + Ember.I18n.t("webclient.admin.notifications.monitor.violated"); //No I18n

   if(criName === 'devicemissespolls')
   {
        //re = dispName + ' <div class="opmMultiSelect" id="statusPoll" onclick="checkStatusPoll()"> <div> <input value="1" type="checkbox"/> <i>1</i> </div> <div> <input value="2" type="checkbox" /> <i>3</i> </div> <div> <input value="3" type="checkbox" /> <i>5</i> </div> </div> ' + Ember.I18n.t("webclient.cnt.polls", this); //No I18N
        re = dispName + '<div class="opmMultiSelect" id="statusPoll" onclick="checkStatusPoll()"><div class="checkBoxLabel"><input type="checkbox" value="1"><div class="labelName">'+Ember.I18n.t('webclient.admin.threshold.Attention',this)+'</div></div><div class="checkBoxLabel"><input type="checkbox" value="2"><div class="labelName">'+Ember.I18n.t('webclient.admin.threshold.Trouble',this)+'</div></div><div class="checkBoxLabel"><input type="checkbox" value="3"><div class="labelName">'+Ember.I18n.t('webclient.admin.threshold.Critical',this)+'</div></div></div> ' + Ember.I18n.t("severity", this); //No I18N
   } else if(criName === 'interfaceMonTypes') { //No I18n
        if(!OPMClient.SettingsAddEditController.fromSnapshotPage) {
            re = Ember.I18n.t('webclient.common.whenany',this)+ "&nbsp;&nbsp;" + intfThreshDiv; //No I18n
        } else {
            cntStr = getCountOfSelectedOptions(criName,options.rowId);
            re =  ''+Ember.I18n.t('webclient.common.whenany',this) +'&nbsp;&nbsp;<div class="opmBtn-2" onclick="loadCriteriaPage(&#34;'+criName+'&#34;,&#34;'+rowdata.header+'&#34;,&#34;'+options.rowId+'&#34;);" id="criCount_'+options.rowId+'" tabindex="0" role="button">'+cntStr+'</div>'+ intfThreshDiv;//No I18N
        }
   }
   else if(criName === 'url' && OPMClient.SettingsAddEditController.fromSnapshotPage)
   {
        cntStr = getCountOfSelectedOptions(criName,options.rowId);
        re =  ''+Ember.I18n.t('webclient.common.whenany',this)+'&nbsp;&nbsp;<div class="opmBtn-2" onclick="loadCriteriaPage(&#34;'+criName+'&#34;,&#34;'+rowdata.header+'&#34;,&#34;'+options.rowId+'&#34;);" id="criCount_'+options.rowId+'" tabindex="0" role="button">'+cntStr+'</div>'+dispName;//No I18N
    }
    else if (criName === 'clearalarm') 
    {
        var module = OPMClient.SettingsConfigurationController.get('module');
        if(module === 'NP') {
        re = '<div style="color:#F76520"><label>' + dispName + '<a class="hasHelpCard hasHelpCard4" tabindex="-1"> <div class="helpCard top" style="display:none"> <div class="helpCardInfo"> <div class="helpCardContent"> <div> <p>' + Ember.I18n.t('opm.inforMsg.notification.clearalarm.tooltip',{ param0 : getCampaign() }, this) + '</p> </div> </div> </div> </div> </a></label></div>';
        } else {
            re = '<div style="color:#F76520"><label>' + Ember.I18n.t('webclient.admin.configurecriteria.clearalarm.wf.execute',this) + '<a class="hasHelpCard hasHelpCard4" tabindex="-1"> <div class="helpCard top" style="display:none"> <div class="helpCardInfo"> <div class="helpCardContent"> <div> <p>' + Ember.I18n.t('opm.inforMsg.workflow.clearalarm.tooltip',{ param0 : getCampaign() }, this) + '</p> </div> </div> </div> </div> </a></label></div>';
        }
    }
    else if (criName === 'alarmMsg') 
    {
         re = '<div class="flex flex-middle-align gap-sm">' + Ember.I18n.t('webclient.common.whenany',this) + "  "+Ember.I18n.t('webclient.admin.notifications.alarmMsg.matched',this)+" " + '<div class="opmFormCol pull-none w-big">';
        if(OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions')[criName]) {
            re += '<input type="text" id="alarmMsgContent" onkeyup="enableAlarmMsgMatch()" placeholder="' + Ember.I18n.t('webclient.admin.alarmCriteria.placeholder') +'" value="' + opm_escapeHTML(OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions')[criName]) +'" ' + (window.OPM.userPermissions.notificationProfileWrite ? "" : "disabled") +'/>';
        } else {
            re += '<input type="text" id="alarmMsgContent" onkeyup="enableAlarmMsgMatch()" placeholder="' + Ember.I18n.t('webclient.admin.alarmCriteria.placeholder') +'" ' + (window.OPM.userPermissions.notificationProfileWrite ? "" : "disabled") +'/>';
        }
        re += '</div><a class="hasHelpCard hasHelpCard4" tabindex="-1"> <div class="helpCard bottom left" style="display:none"> <div class="helpCardInfo"> <div class="helpCardContent"> <div> <p>' + Ember.I18n.t('webclient.notifications.alarmMsg.regexTooltip',{param0:getCampaign()}, this) + '</p> </div> </div> </div> </div> </a></label></div>';
    }
   else if((OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions')[criName] === undefined || Object.keys(OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions')[criName]).length <= 0) && (criName === 'hardwareMonitor' || criName === 'interFaces'|| criName === 'threshold'|| criName === 'url'|| criName === 'agent'|| criName === 'ucsMonitor'|| criName === 'configBackup'|| criName === 'configChange'|| criName === 'nfaAlarm'|| criName === 'clearalarm')){ //No I18N
        re = dispName;
   }
   else if($.isArray(OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions')[criName]))
   {
        cntStr = getCountOfSelectedOptions(criName,options.rowId);
        re =  ''+Ember.I18n.t('webclient.common.whenany',this) +'&nbsp;&nbsp;<div class="opmBtn-2" onclick="loadCriteriaPage(&#34;'+criName+'&#34;,&#34;'+rowdata.header+'&#34;,&#34;'+options.rowId+'&#34;);" id="criCount_'+options.rowId+'" tabindex="0" role="button">'+cntStr+'</div>'+dispName;//No I18N
   }
   else {
        re = dispName;
        if(criName === 'interfaces') {//No I18N
            if(!OPMClient.SettingsAddEditController.fromSnapshotPage) {
                re =  Ember.I18n.t('webclient.common.whenany',this) + " " + dispName;//No I18N
            } 
        }
    }
    var helpIconFirstPart = '<a class="hasHelpCard hasHelpCard4" tabindex="-1"> <div class="helpCard" style="display:none"> <div class="helpCardInfo"> <div class="helpCardContent"> <div> <p>',
        helpIconLastPart = '</p> </div> </div> </div> </div> </a>';
    if (criName === 'hardwareMonitor') {
        re += helpIconFirstPart + Ember.I18n.t('webclient.np.criteria.hardwareMonitor.tooltip',{param0:getCampaign()}, this) + helpIconLastPart; //No I18N
    } else if (criName === 'threshold') { //No I18N
        re += helpIconFirstPart + Ember.I18n.t('webclient.np.criteria.threshold.tooltip', this) + helpIconLastPart; //No I18N
    } else if (criName === 'agent') { //No I18N
        re += helpIconFirstPart + Ember.I18n.t('webclient.np.criteria.agent.tooltip', this) + helpIconLastPart; //No I18N
    }else if (criName === 'lbAlarm') { //No I18N
        re += helpIconFirstPart + Ember.I18n.t('webclient.opm.lb.np.helptxt', this) + helpIconLastPart; //No I18N
    } else if (criName === 'BGPMonitor') { //No I18N
        re += helpIconFirstPart + Ember.I18n.t('webclient.notificationProfiles.criteria.bgpmonitor.tooltip', this) + helpIconLastPart; //No I18N
    }
   return re;

}

// function NBAProfileRowSpecificFormat (cellValue, options, rowdata, action) {
//     var totalCount = 0;
//     var selectedCount = 0;
//     if(cellValue !== undefined) {
//         totalCount = cellValue.length;
//         for(var i=0;i<cellValue.length;i++) {
//             if(cellValue[i][3]) {
//                 selectedCount++;
//             }
//         }
//     }
//     var labelText = Ember.I18n.t('webclient.Selected')+" ( "+selectedCount+" | "+totalCount+" )"; //No I18N
//     var onclickFunc = 'NBAloadCriteriaPage(\"'+htmlEncode(rowdata.headerList)+'\",\"'+options.rowId+'\",'+(selectedCount == totalCount)+');'; //No I18N
//     var returnString = "<div id=criCount_"+options.rowId+" class='opmBtn-2' onclick=\'"+onclickFunc+"\'>"+labelText+"</div>"; //No I18N
//     return returnString;
// }

// function NBAloadCriteriaPage(header,rowId,isSelectAll) {
//     OPMClient.SettingsNotificationsController.criteriaPageObj = {};
//     var criteriasLi =  OPMClient.SettingsNotificationsController.allCriteriaSelectOptions[rowId-1].childList;
//     var pgObj = {'monitorName':'NBA','rowId':rowId,'pageHeader':header,'isSelectAll':isSelectAll,'optLen':criteriasLi.length,"isNBA":true}; //No I18N
//     OPMClient.SettingsNotificationsController.set('criteriaSelectOptions',criteriasLi); //No I18N
//     OPMClient.SettingsNotificationsController.set('criteriaPageObj',pgObj); //No I18N
//     slideIn(5);
//     setTimeout(function(){ doCheckSelectedOptions(pgObj); }, 100);
// }

function goForwardOrBackward(frmStep,toStep,action)
{
    if(toStep === "1" && action === "bwd" && !OPMClient.SettingsAddEditController.operation) {
        var validation = validateCriteriaPage();
        if(validation.dontSave) {
            return false;	
        }
    }
    $('.nfProfilePage').hide();
    $('#input'+toStep).show();
    $('#stage'+toStep).addClass('active');
    var stage = "stage"+toStep; //No I18N
    makeActiveSteps(stage,action);
    if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Notification.Add")!=-1 || OPMClient.ApplicationController.currentPath.indexOf("Settings.Notification.Edit")!=-1 || OPMClient.ApplicationController.currentPath.indexOf("Inventory.Device.Notification.Add")!=-1 || OPMClient.ApplicationController.currentPath.indexOf("Inventory.Device.Notification.Edit")!=-1)
    {
        var profileTypeKey = OPMClient.SettingsNotificationsController.profileType;
        if(profileTypeKey == "CITInternal"){
            profileTypeKey = "Log a Ticket";//No I18N
        }
        var profTitle = profileTypeDisplayName[profileTypeKey];
        if(toStep==="2"){
            $("#criteriaDesc").show();
            //$('.discoveryWizard > .title').css({'padding-bottom':'0px'});
            //$('.discoveryWizard > .opmFormHolder').css({'top':'55px'});
            profTitle = profileTypeDisplayName[profileTypeKey]+" - "+Ember.I18n.t('opm.inforMsg.notification.choosecriteria',this);//No I18N
        }else{
            $("#criteriaDesc").hide();
            //$('.discoveryWizard > .title').css({'padding-bottom':'10px'});
            //$('.discoveryWizard > .opmFormHolder').css({'top':'45px'});
            if(toStep==="3"){
                profTitle = profileTypeDisplayName[profileTypeKey]+" - "+Ember.I18n.t('opm.infoMsg.notification.associate',this);//No I18N
            }
        }
        if(OPMClient.SettingsAddEditController.operation){
            if(toStep==="0"){
                profTitle = Ember.I18n.t('webclient.map.create',this)+' '+Ember.I18n.t("webclient.topo.bulkedit.associatenotification",this);//No I18N
            }
        }
        if(toStep==="1"){
            if( OPMClient.SettingsAddEditController.operation){
               $('.notifyProfileType1').addClass('page1');//No I18N
                if(OPMClient.ApplicationController.testActionSuccess) {
                    $('.cmdOutput').addClass('block');
                }
            }
            var profileType = $('.NotifyProfile li.active').data('value');
            if(profileType == "CITemplate"){
                $('#notificationProfileForm #InputPage1Testaction').hide();
            }
            profTitle="";
            $(".notifyProfileType1 .notifyProfileBrdCrumb").show();//No I18N
        }else{
             $(".notifyProfileType1 .notifyProfileBrdCrumb").hide();//No I18N
        }
        $('#nProfileTitle').text(profTitle);//No I18N
        $("#npFormHolder").scrollTop(0);//No I18N
        if(toStep === "1" && !OPMClient.SettingsAddEditController.operation && action === "bwd") {
            var details = OPMClient.SettingsAddEditController.pageObj;
            var profileTypeKey = OPMClient.SettingsNotificationsController.profileType;
            if(profileTypeKey == "CITInternal"){
                profileTypeKey = "Log a Ticket";//No I18N
            }
            if(OPMClient.SettingsAddEditController.pageAction !== 'copyAs')
            {
                $('#nProfileTitle').text(details.profileDetails.name+" ( "+profileTypeDisplayName[profileTypeKey]+" )");//No I18N
            }else{
                $('#nProfileTitle').text(details.profileDetails.name+"- "+Ember.I18n.t("button.Copy",this)+" - ("+profileTypeDisplayName[profileTypeKey]+")");//No I18N
            }
            $(".notifyProfileType1 .notifyProfileBrdCrumb").hide();//No I18N
        }
        $('.opmFormHolder-FixedBtnBottom').hide();
        $('.opmFormHolder-FixedBtnBottom + div').hide()
        if(toStep==="2")
        {
            $('.opmFormHolder-FixedBtnBottom').show();
            $('.opmFormHolder-FixedBtnBottom + div').show()
        }
    }
}
function makeActiveSteps(stage,action) {
    if(action === "fwd"){//No I18N
        $("#"+stage).prev().removeClass('active');
        $("#"+stage).prev().addClass("completed");//No I18N
         $("#"+stage).addClass('active');
    }else if(action === "bwd"){//No I18N
        $("#"+stage).next().removeClass('active');//No I18N
        $("#"+stage).addClass('active');//No I18N
        $("#"+stage).removeClass('completed');//No I18N
    }
}

function updateCriteriaOptions(isEditWF)
{
    var data = OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions');
    $.each(data,function(monitor,criteriasLi){
       if(monitor === "exchangeServices" || monitor === "adServices")//No I18N
        {
             $.each(criteriasLi,function(k,v){
                criteriasLi[k].name = v.serviceDisplayName;
                criteriasLi[k].id = v.serviceid;
            });
        }
        else if(monitor === "adMonitors" || monitor === "mssqlMonitors" || monitor === "exchangeMonitors"){ //No I18N
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.name;
                criteriasLi[k].name = v.DISPLAYNAME;
            });
        }else if(monitor === "mssqlServices"){ //No I18N
             $.each(criteriasLi,function(k,v){
                criteriasLi[k].name = v.serviceDisplayName;
                criteriasLi[k].id = v.serviceid;
            });
        }
        else if(monitor === "virtualDeviceMonitor")//No I18N
        {
             $.each(criteriasLi,function(k,v){
                criteriasLi[k].name = v.monitorName;
                criteriasLi[k].id = v.monitorType;
            });
        }else if(monitor === "syslog"){ //No I18N
             $.each(criteriasLi,function(k,v){
                criteriasLi[k].name = v.RuleName;
                criteriasLi[k].id = v.RuleId;
            });
           
        }else if(monitor === "eventlog"){ //No I18N
             $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.ruleId;
            });
        }
        else if(monitor === "snmpTrap") //No I18N
        {
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].name = v.displayName;
                criteriasLi[k].id = v.id;
            });
        }
        else if(monitor === "interfaces" || monitor === "interfaceMonTypes") //No I18N
        {
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.ifIndex;
                criteriasLi[k].name = v.displayName;
            });
        }
        else if(monitor === "threshold") //No I18N
        {
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.monitorName;
                criteriasLi[k].name = v.displayName;
            });
        }
        else if(monitor === "url" && OPMClient.SettingsAddEditController.fromSnapshotPage) //No I18N
        {
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.name;
                criteriasLi[k].name = v.urlName;
            });
        }
        else if(monitor === "fileMonitors" || monitor === "folderMonitors") //No I18N
        {
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.fileFolderMonitiorID;
                criteriasLi[k].name = v.monitorName;
            });
        }
        else if(monitor === "ipslaMonitors") //No I18N
        {
            $.each(criteriasLi,function(k,v){
                criteriasLi[k].id = v.probeGroupId;
                criteriasLi[k].name = v.monitorName;
            });
        }
        
        if(!OPMClient.SettingsAddEditController.operation || isEditWF){
            var strArr = [];
            for(var key in criteriasLi) {
                if(criteriasLi[key] && criteriasLi[key].selected) {
                    strArr.push(criteriasLi[key].id)
                }
                OPMClient.SettingsNotificationsController.criteriaToSave[monitor]= strArr.toString();
            }
        }
        OPMClient.SettingsNotificationsController.allCriteriaSelectOptions[monitor] = criteriasLi;
    });
}
function loadCriteriaPage(monitor,header,rowId)
{
    OPMClient.SettingsNotificationsController.criteriaPageObj = {};
    var criteriasLi = OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions')[monitor];
    var selectAll = $('#profileCriteria').find('#'+rowId+' input[type=checkbox]').prop('checked'); //No I18N
    var pgObj = {'monitorName':monitor,'rowId':rowId,'pageHeader':header,'isSelectAll':selectAll,'optLen':criteriasLi.length}; //No I18N
    OPMClient.SettingsNotificationsController.set('criteriaSelectOptions',criteriasLi); //No I18N
    OPMClient.SettingsNotificationsController.set('criteriaPageObj',pgObj); //No I18N
    slideIn(77);
    setTimeout(function(){ doCheckSelectedOptions(pgObj); }, 100);
}

function doCheckSelectedOptions(pgObj)
{
     var arrayObj = OPMClient.SettingsNotificationsController.criteriaToSave[pgObj.monitorName];
    if((arrayObj === undefined || arrayObj === "") && pgObj.isSelectAll && pgObj.optLen < 1)
    {
        $('.nCriteriaOptionsHolder').find('.chk').prop('checked',true);

    }else if(arrayObj !== undefined && arrayObj !== ""){
        doEnableProfileOptions(arrayObj.split(','));
    }
    else{
       $('.nCriteriaOptionsHolder').find('.chk').prop('checked',false);
    }
    makeCriteriaRowChecked(pgObj.isSelectAll);
}
function makeCriteriaRowChecked(isSelectAll){
    var id =OPMClient.SettingsNotificationsController.criteriaPageObj.rowId;
    $('#profileCriteria').find('#'+id+' input[type=checkbox]:not(.intfThreshRadio)').prop('checked',isSelectAll); //No I18n
    var monitorName = OPMClient.SettingsNotificationsController.criteriaPageObj.monitorName;
    if(monitorName === "interfaceMonTypes"){ //No I18n
        if ($('#intfThreshDiv input:checked').length < 1) {
            $('#intfThreshDiv input:checkbox:first').prop('checked', true);
        }
    }
}
function getCountTextForCriteria(name,frm,id)
{
    var allCri = OPMClient.SettingsNotificationsController.allCriteriaSelectOptions[name];
    var savedCri = OPMClient.SettingsNotificationsController.criteriaToSave[name];
    var isAll = $('#profileCriteria').find('#'+id+' input[type=checkbox]').prop('checked');
    var cnt = 0;
    var str = "";
    if(isAll)
     {
         if(Array.isArray(OPMClient.SettingsNotificationsController.allCriteriaSelectOptions[name])) {
             OPMClient.SettingsNotificationsController.criteriaToSave[name] = OPMClient.SettingsNotificationsController.allCriteriaSelectOptions[name].map(function(obj){return obj.id}).join(',');
         }
         if(frm =="grid" && allCri !== undefined && allCri !== ""){ //No I18N
            cnt = allCri.length;
         }else if(frm =="grid" && allCri === undefined || allCri === ""){ //No I18N
            return ;
         }else{
           cnt = savedCri.split(',').length;
         }
        str = Ember.I18n.t('webclient.Selected',this)+"&nbsp;&nbsp;(&nbsp;"+cnt+"&nbsp;|&nbsp;"+allCri.length+"&nbsp;)"; //No I18N
    }else if(allCri !== undefined && allCri.length !== undefined){
         str = Ember.I18n.t('webclient.Selected',this)+"&nbsp;&nbsp;(&nbsp;"+cnt+"&nbsp;|&nbsp;"+allCri.length+"&nbsp;)";//No I18N
        delete OPMClient.SettingsNotificationsController.criteriaToSave[name];
    }
    $('#criCount_'+id).empty().html(str);
    return;
}
function doUpdateSelectedCnt(status,len)
{
    optSelCnt = len;
    if(OPMClient.SettingsNotificationsController.criteriaPageObj.optLen == len){
        $('input[name="proOptionParent"]').prop('checked',true); //No I18N
    }else{
        $('input[name="proOptionParent"]').prop('checked',false); //No I18N
    }
}
function doEnableProfileOptions(arr)
{
    $.each(arr,function(index,val){
        var ckVal = val.replace(/\\/g,"\\\\");
         $('input[name="proOptionLi"][value="'+ckVal+'"]').prop('checked',true); //No I18N
         optSelCnt+=1;
    });
    doUpdateSelectedCnt(true,arr.length);//No I18N
}
var alarmUniqueId = '';
function validateCriteriaPage()
{
    var  myGrid = "profileCriteria"; //No I18N
    selectedCriteriaArr = [];
    var checkedBoxCount = $("#" + myGrid + " tr:not([hidden='true']) input:checked").length; //No I18N
    if(checkedBoxCount <= 0){
        return false;
    }
    var names=[];
    for(var i=0;i<checkedBoxCount;i++)
    {
        var id = $("#" + myGrid + " tr:not([hidden='true']) input:checked")[i].id.split("_")[2]; //No I18N
        names.push($('#'+myGrid).jqGrid('getCell', id, 'monitorName')); //No I18N
    }
    if(names.indexOf('clearalarm')>=0 && names.length<2){//No I18N
        return false;
    }
    if(names.indexOf('alarmMsg')>=0 && names.length>0){//No I18N
        var alarmMsgValue = OPMClient.SettingsNotificationsController.get('allCriteriaSelectOptions').alarmMsg;//No I18N
        var currentValue = $('#alarmMsgContent').val(); 
        if(alarmMsgValue && alarmMsgValue.length > 0 && alarmMsgValue === currentValue) {
            return true;
        }
        var fieldsToValidate = {'empty': ['alarmMsgContent'], "maxCheck":{'alarmMsgContent':250}}//No I18n
        var id = "alarmMsgContent";//No I18N
        var data = {};
        data.regexPattern = opm_escapeHTML(currentValue);
        if(opm_validateFields(fieldsToValidate)) {
            var alarmRegexWorking =  opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/v2/admin/isValidRegexPattern", data);//No I18N
            if(alarmRegexWorking.error && alarmRegexWorking.error.code === 5154) {
                $("#"+id).addClass('validateField error');//No I18N
                $("#"+id).removeAttr("data-error");//No I18n
                alarmUniqueId = opm_infoMsgs("errorMsg",alarmRegexWorking.error.message); //No I18N
                $("#"+id).focus();
                opmValidateTooltipDefine();
                opmValidate($("#"+id));
                return {dontSave: true};
            } else {
                alarmUniqueId ? $("#"+alarmUniqueId).remove() : "";
            }
            return true;
        }
        return {dontSave: true};
    }
    for(var i=0;i<checkedBoxCount;i++)
    {
        var id = $("#" + myGrid + " tr:not([hidden='true']) input:checked")[i].id.split("_")[2];
        selectedCriteriaArr.push($("#"+myGrid).jqGrid('getCell', id, 'monitorName')); //No I18N
    }
    return true;
}
function getSelectedCriteriaList()
{
    var mygrid =  'profileCriteria'; //No I18N
    var checkedBoxCount = $("#" + mygrid + " tr:not([hidden]) input:checked").length; //No I18N
    var names = [];
    var dispName = [];
    var allCri = OPMClient.SettingsNotificationsController.allCriteriaSelectOptions;
    var savedCri = OPMClient.SettingsNotificationsController.criteriaToSave;

    for(var i=0;i<checkedBoxCount;i++)
    {
        var id = $("#" + mygrid + " tr:not([hidden='true']) input:checked")[i].id.split("_")[2];
        names.push($('#'+mygrid).jqGrid('getCell', id, 'monitorName')); //No I18N
        dispName.push($('#'+mygrid).jqGrid('getCell', id, 'header')); //No I18N
    }
    
    $.each(names,function(index,name){
        var totalMon = allCri[name];
        var bb = savedCri[name];
        var isMonitorChecked = true;
        var monIds = "";
        var criName = 'checked'+name; //No I18N
        var selAllName = 'selectAll'+name; //No I18N
        var selectedMon = 'selected'+name; //No I18N
        notificationDetails.Criteria[criName]=true; //No I18N

        if(name === "interfaceMonTypes"){ //No I18n
            var selectedIntfThresh = [];
            $('#intfThreshDiv input:checked').each(function () {
                selectedIntfThresh.push($(this).attr('value'));
            });
            notificationDetails.Criteria.intfMonTypes = selectedIntfThresh.toString();
        }
        if(name === "clearalarm"){
            notificationDetails.Criteria.isClear = true; //No I18N
        } else  if(name === "alarmMsg"){//No I18N
            notificationDetails.Criteria.alarmMsgContent = $("#alarmMsgContent").val(); //No I18N
        }
        else if((totalMon !== undefined && totalMon !== "") && (bb !== undefined && bb !== ""))
        {
            monIds = bb;
    	    if(totalMon.length == bb.split(',').length){
    		    notificationDetails.Criteria[selAllName]=true;
    	    }else{
                	notificationDetails.Criteria[selAllName]=false;
                    notificationDetails.Criteria[selectedMon]=monIds.toString();
    	    }
        }
        else if(totalMon === undefined || totalMon === ""){
            if(criName === "checkeddevicemissespolls"){
                var selected = [];
                $('#statusPoll input:checked').each(function () {
                    selected.push($(this).attr('value'));
                });
               notificationDetails.Criteria.noofpolls = selected.toString() === '' ? '1' : selected.toString();
            }
            else if(!OPMClient.SettingsAddEditController.fromSnapshotPage){
                notificationDetails.Criteria[selAllName]=true;
            }
        }
    });
    //setNotifySeverityCriteria();
    setPreviewStr('monitorsToNotify',returnAsMultipleRow(dispName));//No I18N
}
function getMonitorIds(arr){
    var valArr = [];
    var ids = "";

    
        $.each(arr,function(k,obj){
            valArr.push(obj.id);
        });
        ids = valArr;
    return ids;
}

function validateTimeWindowDetails(allowSave)
{
    var twoption = $("[name=twoption]:checked").val();
    var delayInterval = $("#delayInterval").val();
    var delayAck = $("#delayAck").prop("checked");
    var triggerInterval = $("#triggerInterval").val();
    var toValidate = {"positive":[],"empty":[]};//No I18N
     notificationDetails.TimeDetails = {};
    if(twoption === "Timewindow")
    {
        var sHr = $("#startHour").val();
        var sMin = $("#startMinute").val();
        var eHr = $("#endHour").val();
        var eMin = $("#endMinute").val();
        // This hour check condition removed to handle overnight Schedule
        //Due this overnight schedule won't work, we have enable this check again.
        if((parseInt(sHr) === parseInt(eHr) && (parseInt(sMin) === parseInt(eMin))))
        {
            if(allowSave) {
                goForwardOrBackward("3","4","fwd");
            }
            setTimeout(function(){alert(Ember.I18n.t("webclient.notification.timeWindow.criteria"))},0); //No I18n
            return false;
        }
        if($("#days input:checked").length === 0)
        {
            if(allowSave) {
                goForwardOrBackward("3","4","fwd");
            }
            setTimeout(function(){alert(Ember.I18n.t("webclient.notiftimewindow.selectadate",this))},0); //No I18n
            return false;
        }
    }
    if(delayInterval !== undefined && delayInterval !==""){
        toValidate.positive.push('delayInterval');//No I18N

        notificationDetails.TimeDetails.delayAck = delayAck;
        notificationDetails.TimeDetails.delayInterval = parseInt(delayInterval)*60000;
    }

    if(triggerInterval !== undefined && triggerInterval !==""){
        (toValidate.positive).push('triggerInterval');//No I18N
        notificationDetails.TimeDetails.triggerInterval = parseInt(triggerInterval)*60000;
    }
    
    if($("#tcount").prop("checked"))
    {
        if(triggerInterval === "" || triggerInterval === undefined || triggerInterval === null){
            (toValidate.empty).push('triggerInterval');//No I18N
        }
        var triggerCount = $("#triggerCount").val();
        (toValidate.positive).push('triggerCount');//No I18N
        (toValidate.empty).push('triggerCount');//No I18N
        toValidate.rangeCheck = {'triggerCount':25};//No I18N
        notificationDetails.TimeDetails.tcount = triggerCount;
    }
    if(allowSave) {
        goForwardOrBackward("3","4","fwd");
    }
    var isValid = opm_validateFields(toValidate);
    return isValid;   

}
function getProfileDeviceDetails(profileAssociationType)
{
    if(!profileAssociationType) {
        profileAssociationType = "MANUAL"; //No I18n
    }
    var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/device/getDeviceCategories?showNotificationProfileEntities=true');//No I18N
    var url = window.OPM.apiUrlPattern + '/device/getDeviceListForFilter?filterID=4&type=Notification&moEntities=All';//No I18N
    if (!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.pageObj.profileId != undefined) {
        if (OPMClient.SettingsAddEditController.pageObj.profileDetails && profileAssociationType === OPMClient.SettingsAddEditController.pageObj.profileDetails.associationtype) {
            url += '&profileID=' + OPMClient.SettingsAddEditController.pageObj.profileId; //No I18N
        }
    }
    url = url + "&profileAssociationType="+profileAssociationType; //No I18n
    Ember.set(OPMClient.ApplicationController,'assoDetails',{});//No I18N
    Ember.set(OPMClient.ApplicationController,'assoDetailsURL',{});//No I18N
    Ember.set(OPMClient.ApplicationController, 'assoDetailsDevGroups', {}) //No I18n
    Ember.set(OPMClient.ApplicationController, 'assoDetailsIntfGroups', {}) //No I18n
    Ember.set(OPMClient.ApplicationController, 'notificationProfileEntites', []) //No I18n

    if(OPMClient.ApplicationController.isCentralServer){//No I18N
        url += '&probeID='+$('#grpByProbe').val();//No I18N
    }else if(OPMClient.ApplicationController.isMSPCentral && OPMClient.SettingsNotificationsController.profileType == "Log a Ticket"){//No i18n
        $("#filterDeviceID").hide();
        $("#grpByCustomer").val($('#sdpmsp_customer').val()).select2();
        $("#grpByCustomer").attr("disabled",true);
        url += '&customerFilterID='+$('#sdpmsp_customer').val()+'&probeID='+$('#sdpmsp_probe').val();//No i18n

    }else if(OPMClient.ApplicationController.isMSPCentral){//No I18N
        url += '&customerFilterID='+$('#grpByCustomer').val();//No I18N
    }

    var isInterfaceCriteriaSelected = false;
    if (notificationDetails && notificationDetails.Criteria && (notificationDetails.Criteria.checkedinterfaces || notificationDetails.Criteria.checkedinterfaceMonTypes || notificationDetails.Criteria.checkedBandwidthExceeded)) {
        isInterfaceCriteriaSelected = true;
    }
    url += '&isInterfaceCriteriaselectedInClient='+isInterfaceCriteriaSelected;//No I18N

    $('#noGrpMsgForGrps').hide();
    if(profileAssociationType === "MANUAL") {
        if((OPMClient.ApplicationController.isCentralServer || OPMClient.ApplicationController.isMSPCentral) && notificationDetails.Criteria && !notificationDetails.Criteria.checkedprobe) {
            url += '&excludeProbeEntity=true'; //No I18N
        }
        var deviceList = opm_ajaxGetResponse(url);
        var bvList = getBvList();
        var groupsList = getGroupList('device'); //No I18N
        var catList = list["Infrastructure View"];
        var availableList=[];
        var selectedList=[];
    
        var  remainingURL=[];
        var selectedURL=[];
        
        var notificationProfileEntites = [];
        var excludeRegionEntity = notificationDetails.Criteria && !notificationDetails.Criteria.checkedprobe;
        if(list["NotificationProfileEntites"] !== undefined){
            $.each(list["NotificationProfileEntites"], function(k,v){
                notificationProfileEntites.push({'label':v,'value':k});//No I18N   
            });
            Ember.set(OPMClient.ApplicationController, 'notificationProfileEntites', notificationProfileEntites) //No I18n
        }
        
        $.each(catList, function(id,name){
            if(Object.keys(catList).indexOf(id)===0){
                $('#notifyCategory').append("<option value='' selected>-- "+Ember.I18n.t("webclient.common.widgets.categoryoption",this)+" --</option>"); //No I18N  
                $('#notifyCategory').append("<option value='"+id+"'>"+name+"</option>"); //No I18N
            }
            else{
                $('#notifyCategory').append("<option value='"+id+"'>"+name+"</option>"); //No I18N
            }
        });

        if(deviceList.remainingDevices !== undefined && deviceList.remainingDevices !== null){
            $.each(deviceList.remainingDevices,function(k,v){
                availableList.pushObject({'displayName':v,"value":k});//No I18N
            });
        }
    
        if(deviceList.selectedDevices !== undefined && deviceList.selectedDevices !== null){
            $.each(deviceList.selectedDevices,function(k,v){
               selectedList.pushObject({'displayName':v,"value":k});//No I18N
            });
            if(OPMClient.ApplicationController.isMSPCentral && OPMClient.SettingsNotificationsController.profileType == "Log a Ticket" && OPMClient.SettingsAddEditController.pageObj.profileDetails != undefined && OPMClient.SettingsAddEditController.pageObj.profileDetails.customerId != undefined){
                if(OPMClient.SettingsAddEditController.pageObj.profileDetails.customerId != $('#sdpmsp_customer').val()){
                        selectedList = [];
                }
            }
        }
        if(groupsList !== undefined && groupsList.result === undefined && Object.keys(groupsList).length > 0){
            var opt = [];
            $.each(groupsList,function(k,v){
                opt.push({'label':v,'value':k});
            });
            OPMClient.SettingsNotificationsController.set('logicalGrpArr',opt);//No I18N
        }
    
        if(bvList.BusinessView !== undefined && bvList.BusinessView.Details !== undefined && bvList.BusinessView.Details.length > 0){
            $('#notifyBVList').show();
            $.each(bvList.BusinessView.Details,function(k,v){
                if(Object.keys(bvList.BusinessView.Details).indexOf(k.toString())===0){
                    $('#notifybv').append("<option value='' selected>-- "+Ember.I18n.t("webclient.action.select",this)+" --</option>"); //No I18N
                    $('#notifybv').append('<option value="'+v.name+'">'+v.displayName+'</option>');//No I18N
                }
                else{
                    $('#notifybv').append("<option value='"+v.name+"'>"+v.displayName+"</option>"); //No I18N
                }
            }); 
        } else {
            $('#notifyBVList').hide();
        }
    
        var urlList;
        if(notificationDetails.Criteria && notificationDetails.Criteria.checkedurl && !OPMClient.SettingsAddEditController.fromSnapshotPage){
            var check = OPMClient.ApplicationController.currentRouteName.indexOf('Settings.Notification') != -1;
            var monitorurl=window.OPM.apiUrlPattern + '/admin/listURLMonitors';//No I18N
            monitorurl +=check ? '?onlyMonitorName=true' : '' ;//No I18N
            urlList = opm_ajaxGetResponse(monitorurl);
        }
        if (urlList !== undefined && urlList !== null && urlList.length > 0) {
            if (urlList !== undefined && urlList !== null) {
                $.each(urlList, function (k, val) {
                   remainingURL.pushObject({'displayName':val.displayName,'value':val.name});//No I18N
                });
            }
        }

        if(urlList && urlList.length > 0 && notificationDetails.Criteria && notificationDetails.Criteria.checkedurl && !OPMClient.SettingsAddEditController.fromSnapshotPage){
            $("#byUrl").show();
        } else{
            $("#byUrl").hide();
        }
        
        if(!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.pageAction !== 'copyAs'){

            //To make by devices dropdown as selected by default
            $('input[name="deviceType"][value="byDevices"]').prop('checked',true);

            var selDevicess = OPMClient.SettingsAddEditController.pageObj.deviceList;
            var selUrls = OPMClient.SettingsAddEditController.pageObj.associatedURLs;
            /*if(selDevicess !== undefined && Object.keys(selDevicess).length > 0){
                $.each(selDevicess,function(key,dName){
                    $('#notifySelDevice').append('<option value="'+key+'">'+dName+'</option>'); //No I18N
                    $("#notifyRemainDevice option[value='"+key+"']").remove();
                });
                $('#byDevices').addClass('active');
                $('#byDevices').show();
            }*/
            if(selUrls !== undefined && Object.keys(selUrls).length > 0){
                $.each(selUrls,function(key,dName){
                    selectedURL.pushObject({'displayName':dName,'value':key});//No I18N
                    //$("#notifyRemainUrls option[value='"+key+"']").remove();
                });
                $.each(selectedURL,function(key,selectedURL){
                    var available=remainingURL.findBy('value', selectedURL.value); //No I18N
                        if(available!=undefined){
                            remainingURL.removeObject(available); 
                        }
                }); 
                $('#byUrl').show();
                $('input[name="profileUrlType"][value="byUrl"]').prop('checked',true);
            }
            else{
                $('input[name="deviceType"][value="byDevices"]').prop('checked',true);
            }
        }

        $('#notifyCategory').trigger('change');
        $('#notifybv').trigger('change');
        var params = {};
        params.availableList = availableList;
        params.selectedList = selectedList;
        Ember.set(OPMClient.ApplicationController,'assoDetails',params);//No I18N
        triggerAssociationComponentForURL(remainingURL,selectedURL);
        //  setAssociateProfileHeight();
    } else if(profileAssociationType === "BY_DEVICE_GROUP") {//No I18N
        var deviceGrpList = opm_ajaxGetResponse(url);
        if(Object.keys(deviceGrpList.remainingGroups).length === 0 && Object.keys(deviceGrpList.selectedGroups).length === 0) {
            $('#noGrpMsgForGrps').show();
        }
        setDevGroupAssoc(deviceGrpList);
        $("#byUrl").hide();
    } else if(profileAssociationType === "BY_INTERFACE_GROUP") {//No I18N
        var intfGrpList = opm_ajaxGetResponse(url);
        if(Object.keys(intfGrpList.remainingGroups).length === 0 && Object.keys(intfGrpList.selectedGroups).length === 0) {
            $('#noGrpMsgForGrps').show();
        }
        setIntfGroupAssoc(intfGrpList);
        $("#byUrl").hide();
    }
}

function setIntfGroupAssoc(intfGrpList) {
    var availableListIntfGroup=[];
    var selectedListIntfGroup=[];
    if(intfGrpList){
        $.each(intfGrpList.remainingGroups,function(k,v){
            if(OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.fromGroupSnapshotPageGrpName && k === OPMClient.SettingsAddEditController.fromGroupSnapshotPageGrpName) {
                selectedListIntfGroup.pushObject({'displayName':v,"value":k});//No I18N
            } else{
                availableListIntfGroup.pushObject({'displayName':v,"value":k});//No I18N
            }
        });
        $.each(intfGrpList.selectedGroups,function(k,v){
            selectedListIntfGroup.pushObject({'displayName':v,"value":k});//No I18N
        });
    }
    Ember.set(OPMClient.ApplicationController, 'assoDetailsIntfGroups', {availableListIntfGroup: availableListIntfGroup, selectedListIntfGroup: selectedListIntfGroup}) //No I18n
    var pageInstance;
    if(OPMClient.ApplicationController.currentPath === "Settings.Configurations.QuickConfig.Operation.index") {//No I18N
        pageInstance = OPMClient.__container__.lookup("router:main")._activeViews['Settings.Configurations.QuickConfig.Operation'][0];
    } else if(OPMClient.SettingsNotificationsController.currentInstance) {
        pageInstance = OPMClient.SettingsNotificationsController.currentInstance;
    }
    if(pageInstance) {
        var combinedIgnoreList=[];
        if(intfGrpList.ignoreGroupList){
            $.each(intfGrpList.ignoreGroupList,function(k,v){
                combinedIgnoreList.push({'displayName':v,'value':k,'name':k,'selected':true});//No I18N
            });
        }
        if(intfGrpList.remainingignoreGroupList){
            $.each(intfGrpList.remainingignoreGroupList,function(k,v){
                if(!intfGrpList.ignoreGroupList || !intfGrpList.ignoreGroupList[k]){
                    combinedIgnoreList.push({'displayName':v,'value':k,'name':k,'selected':false});//No I18N
                }
            });
        }
        pageInstance.set("controller.ignoreGroupList",combinedIgnoreList);//No I18N
        if(intfGrpList.ignoreGroupList && Object.keys(intfGrpList.ignoreGroupList).length > 0) {
            pageInstance.set("controller.showGroupAdvancedSettings", true);//No I18N
        } else {
            pageInstance.set("controller.showGroupAdvancedSettings", false);//No I18N
        }
    }
}
function setDevGroupAssoc(deviceGrpList) {
    var availableListDevGroups=[];
    var selectedListDevGroups=[];

    if(deviceGrpList){
        $.each(deviceGrpList.remainingGroups,function(k,v){
            if(OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.fromGroupSnapshotPageGrpName && k === OPMClient.SettingsAddEditController.fromGroupSnapshotPageGrpName) {
                selectedListDevGroups.pushObject({'displayName':v,"value":k});//No I18N
            } else {
                availableListDevGroups.pushObject({'displayName':v,"value":k});//No I18N
            }
        });
        $.each(deviceGrpList.selectedGroups,function(k,v){
            selectedListDevGroups.pushObject({'displayName':v,"value":k});//No I18N
        });
    }
    Ember.set(OPMClient.ApplicationController, 'assoDetailsDevGroups', {availableListDevGroups: availableListDevGroups, selectedListDevGroups: selectedListDevGroups}) //No I18n
    var pageInstance;
    if(OPMClient.ApplicationController.currentPath === "Settings.Configurations.QuickConfig.Operation.index") {//No I18N
        pageInstance = OPMClient.__container__.lookup("router:main")._activeViews['Settings.Configurations.QuickConfig.Operation'][0];
    } else if(OPMClient.SettingsNotificationsController.currentInstance) {
        pageInstance = OPMClient.SettingsNotificationsController.currentInstance;
    }
    if(pageInstance){
        var combinedIgnoreList=[];
        if(deviceGrpList.ignoreGroupList){
            $.each(deviceGrpList.ignoreGroupList,function(k,v){
                combinedIgnoreList.push({'displayName':v,'value':k,'name':k,'selected':true});//No I18N
            });
        }
        if(deviceGrpList.remainingignoreGroupList){
            $.each(deviceGrpList.remainingignoreGroupList,function(k,v){
                if(!deviceGrpList.ignoreGroupList || !deviceGrpList.ignoreGroupList[k]){
                    combinedIgnoreList.push({'displayName':v,'value':k,'name':k,'selected':false});//No I18N
                }
            });
        }
        pageInstance.set("controller.ignoreGroupList",combinedIgnoreList);//No I18N
        if(deviceGrpList.ignoreGroupList&&Object.keys(deviceGrpList.ignoreGroupList).length>0){
            pageInstance.set("controller.showGroupAdvancedSettings",true);//No I18N
        }else{
            pageInstance.set("controller.showGroupAdvancedSettings",false);//No I18N
        }
    }
}
function setAssociateProfileHeight(){
    var prntListHt=$('.opmAccListChkPrnt').height();
    var scrlList = $('#opmAccListChkDiscovery.opmAccListChk > ul').find('ul');
    var scrlListHt=scrlList.length > 0 ? scrlList[0].scrollHeight : 0;
    
    if(scrlListHt>prntListHt){
        $('#opmAccListChkDiscovery.opmAccListChk').css({height:scrlListHt,'max-height':'630px'});//No I18N
    }
    else{
        $('#opmAccListChkDiscovery.opmAccListChk').css({height:prntListHt});
    }

}
function validateDeviceDetails()
{

    var dType = $('input[name="profileAssociationType"]:checked').val();
    var msg = "";
    var devices = "";
    var previewTxt = "";

    var isUrlChecked = false;
    var associateUrls = "";
    $('.preViewDeviceDiv').hide();
    $('.preViewURLDiv').hide();
    $('.preViewProbeDiv').hide();


    if(notificationDetails.Criteria.checkedurl)
    {
        isUrlChecked = true;
    }
    notificationDetails.Devices = {};

    if(dType === "MANUAL"){//No I18N
        var selectedValues = [];
        var selectedDisplayNames=[];
        $.each(OPMClient.ApplicationController.assoDetails.selectedList,function(k,v){
                selectedValues.push(v.value);
                selectedDisplayNames.push(v.displayName);
        });
       devices=selectedValues.toString();
       msg = Ember.I18n.t('webclient.general.pleaseselect', {param: Ember.I18n.t("Device")}); //No I18N
       if(!isUrlChecked && devices === "")
       {
        return msg;
       }
       notificationDetails.Devices.selectedDevicesStr = JSON.stringify(selectedValues);
       previewTxt=selectedDisplayNames.toString();
       notificationDetails.Devices.selectedAssociationType = "MANUAL"; //No I18n
    } else if(dType === "BY_DEVICE_GROUP"){//No I18N
        var selectedValues = [];
        var selectedDisplayNames=[];
        $.each(OPMClient.ApplicationController.assoDetailsDevGroups.selectedListDevGroups,function(k,v){
                selectedValues.push(v.value);
                selectedDisplayNames.push(v.displayName);
        });
       devices=selectedValues.toString();
       msg = Ember.I18n.t('webclient.general.pleaseselect', {param: Ember.I18n.t("jsp.commonstr.DeviceGroup")}); //No I18N
       if(!isUrlChecked && devices === "")
       {
        return msg;
       }
       notificationDetails.Devices.selectedDevicesStr = JSON.stringify(selectedValues);
       previewTxt=selectedDisplayNames.toString();
       notificationDetails.Devices.selectedAssociationType = "BY_DEVICE_GROUP"; //No I18n
    } else if(dType === "BY_INTERFACE_GROUP"){//No I18N
        var selectedValues = [];
        var selectedDisplayNames=[];
        $.each(OPMClient.ApplicationController.assoDetailsIntfGroups.selectedListIntfGroup,function(k,v){
                selectedValues.push(v.value);
                selectedDisplayNames.push(v.displayName);
        });
       devices=selectedValues.toString();
       msg = Ember.I18n.t('webclient.general.pleaseselect', {param: Ember.I18n.t("alertProfile.interfaceGroup")}); //No I18N
       if(!isUrlChecked && devices === "")
       {
        return msg;
       }
       notificationDetails.Devices.selectedDevicesStr = JSON.stringify(selectedValues);
       previewTxt=selectedDisplayNames.toString();
       notificationDetails.Devices.selectedAssociationType = "BY_INTERFACE_GROUP"; //No I18n
    }
    var multiselectView = Ember.View.views['multiselect-dropdown-id'];//No I18n
    var ignoredGroups = multiselectView ? multiselectView.get("selectedData") : [];

    if(ignoredGroups && ignoredGroups.length > 0) {
        var ignoredGroupNames = [];
        $.each(ignoredGroups, function(index, group) {
            ignoredGroupNames.push(group.name);
        });
        notificationDetails.Devices.selectedIgnoreGroups = JSON.stringify(ignoredGroupNames);
        if (devices) {
            var selectedValuesArray = devices.split(',');
            var overlap = selectedValuesArray.some(function(value) {
            return ignoredGroupNames.indexOf(value) !== -1;
            });
            if (overlap) {
                return Ember.I18n.t("webclient.admin.notification.ignoreGroups.selectederror",this); //No I18N
            }
        }
    }

     if(isUrlChecked)//No I18N
    {
       var selectedValues = [];
       var selectedDisplayNames=[];
       $.each(OPMClient.ApplicationController.assoDetailsURL.selectedListURL,function(k,v){
            selectedValues.push(v.value);
            selectedDisplayNames.push(v.displayName);
        });
        associateUrls=selectedValues.toString();
       notificationDetails.Devices.selectedURLs = associateUrls.toString();
       msg = Ember.I18n.t('webclient.notif.selurlordev'); //No I18N
       if(associateUrls.length === 0 && devices === "")
       {
        return msg;
       }
       if(associateUrls.length > 0)
       {
            $('.preViewURLDiv').show();
            setPreviewStr("nofificationUrlDetails",escapeHtmlTags(selectedDisplayNames.toString()));//No I18N    
       }
    }
       
    if(!isUrlChecked && devices.length <= 0)
    {
        return msg;
    }
    else if(isUrlChecked && (devices.length <= 0 && associateUrls.length <= 0))
    {
        $('#byUrl').addClass('active');
        return msg;
    }
    else if(devices.length > 0)
    {
         $('.preViewDeviceDiv').show();
        setPreviewStr("nofificationDevDetails",escapeHtmlTags(previewTxt));//No I18N
        return "";
    }

}
function changeProfileType(type)
{
    if(OPMClient.SettingsNotificationsController.currentInstanceID) {
        $(".OpMAlertMsg ").remove();
    }
    OPMClient.SettingsNotificationsController.set('currentInstanceID', undefined);//No I18N  
    $('.testActionNp').removeClass("disabledBlock");  //For run program and run system command we disable this test action. It shouldnt affect other profiles
    if (type === "Send SMS") {
        $('#addCC').hide();
    } else if(type === "Send Modem SMS") { //No I18N    
        var jsonResp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getSMSGatewayConfiguration'); //No I18N
        OPMClient.SettingsNotificationsController.set('smsGatewayConf', jsonResp); //No I18N
        if(OPMClient.SettingsAddEditController.operation) {
           var selOption = ''
            $.each(jsonResp, function(gateway, value) {
                if (value === 'true') {
                    selOption = gateway;
                    return false;
                }
            });
            if(selOption == '') {
                selOption = 'Clickatell'; //No I18N
            }
            $('#smsgateway').val(selOption).trigger('change');
        }
    } else if(type === "Log a Ticket"&&window.OPM.helpdeskName!=="SDPSERVLETAPI"){//No I18N
        if(!window.OPM.isMSPCentral){
            var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getDefaultLogaTicketValues");//No I18N
        }

        //  if(response.error !== undefined)
        // {
            // opm_infoMsgs('infoMsg',response.error.message); //No I18N
            // opm_transitionToTheRoute('Settings.Basic.AddOnProduct.SDP');//No I18N
            // OPMClient.SettingsAddEditController.set('isLogTicketConfigured', false);
        // }
        // else
        if (!window.OPM.isMSPCentral && response.error === undefined)
        { 
            OPMClient.SettingsAddEditController.set('isLogTicketConfigured', true); //No I18N
            /*if(response.priorityList!==undefined)
            {
                $.each(response.priorityList,function(key,val){
                    $("#ticketPriority").append('<option data-idvalue="'+val.ID+'" value="'+val.NAME+'">'+val.NAME+'</option>');
                });
            }
            if(response.categoryList!==undefined)
            {
                $.each(response.categoryList,function(key,val){
                    $("#ticketCategory").append('<option data-idvalue="'+val.ID+'" value="'+val.NAME+'">'+val.NAME+'</option>');
                });
            }
            if(response.grpTechList!==undefined)
            {
                $.each(response.grpTechList,function(key,val){
                    $("#ticketGrpTech").append("<option data-idvalue='"+val.GROUPID+"' value='"+val.GROUPNAME+"'>"+val.GROUPNAME+"</option>");
                });
            }*/
            
            /*$('#ticketCategory').change(function(){
                getTktSubCategory("ticketCategory","ticketSubCategory");//No I18N
            });
            $('#ticketSubCategory').change(function(){
                getTktItem("ticketSubCategory","ticketItem");//No I18N
            });
            $('#ticketGrpTech').change(function(){
                getTktTech("ticketGrpTech","ticketTechnician");//No I18N
            });*/
        }else{
            //showMessage(response);
        }          
    }
    else if(type === "Web Alarm") { //No I18N
        $("#userUL li").remove();
        var userList = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listWebAlarmUsers"); //No I18N
        var users = [];
        $.each(userList, function(i,val){
            users.push({"roleList":i,"roleId" : val.roleId, "roleName":val.roleName,"UserList" : val.users, "totalUsers" : val.users.length});
        });
        userList = {};
        var roles = loadRolesList();
        for(var i=0;i<roles.length;i++){
            $.each(users, function(j,val){
                if(roles[i].roleName==val.roleName){
                    roles[i].UserList = val.UserList;
                    roles[i].roleList = val.roleList;
                    roles[i].totalUsers = val.totalUsers;
                }
            });
        }
        roles.sort(function(a,b) {
            return a.UserList ? (b.UserList ? 0 : -1) : 1;
        });
        userList.users = roles;
        var soundList = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getWebAlarmSoundFiles"); //No I18N
        var selectedVal = 'webalarm.mp3'; //No I18N
        if (OPMClient.SettingsAddEditController.pageObj.profileDetails !== undefined) {
            selectedVal = OPMClient.SettingsAddEditController.pageObj.profileDetails.soundFile; //No I18N
            if(!OPMClient.SettingsAddEditController.operation){
                var userEdit = OPMClient.SettingsAddEditController.pageObj.profileDetails;
                userList.isEdit = true;
                userList.associatedRoleIDs = userEdit.selRoleIds;
                userList.associatedUserIDs = userEdit.selUserIds;
            }
        }
        for (var i = 0; i < soundList.length; i++) {
            soundList[i].isSelected = (soundList[i].filePath === selectedVal || soundList[i].fileName === selectedVal) ? 'selected' : '';
        }
        OPMClient.SettingsAddEditController.set('webAlarmUserList', userList); //No I18N
        OPMClient.SettingsAddEditController.set('webAlarmSoundFiles', soundList); //No I18N
        $("#soundFileSel").select2();
    }
}
function saveTimeWindowDetails()
{
   var option = $("[name=twoption]:checked").val();
   notificationDetails.TimeDetails = {};
   notificationDetails.TimeDetails.twoption = option;
    if(option === "Timewindow")
    {
        var daysSelected = [];
        var daysSelectedText = [];
        var startTime = "";
        var endTime = "";
        var days = $("#days input:checked"); 
        for(i=0;i<days.length;i++)
        {
            daysSelected.push(days[i].value);
            if(days[i].value !== "on"){
            daysSelectedText.push(days[i].name);
            }
          
        }
        startTime = $("#startHour").val()+":"+$("#startMinute").val();
        endTime = $("#endHour").val()+":"+$("#endMinute").val();

        notificationDetails.TimeDetails.startTime = startTime;
        notificationDetails.TimeDetails.endTime = endTime;
        notificationDetails.TimeDetails.daysSelected=daysSelected.toString();
        var content = Ember.I18n.t('webclient.trigger.startat',this)+" "+startTime+" "+Ember.I18n.t('webclient.trigger.endat',this)+" "+endTime+""+Ember.I18n.t('webclient.during',this)+" "+daysSelectedText.toString(); //No I18n
        setPreviewStr("nofificationTimeDetails",content); //No I18n
    }
    else
    {
        setPreviewStr("nofificationTimeDetails","24*7");  //No I18n 
    }
    getRecurringDetails();
}
function getRecurringDetails()
{
    var delayInterval = $("#delayInterval").val();
    var delayAck = $("#delayAck").prop("checked");
    var triggerInterval = $("#triggerInterval").val();
    var tCount = $("#tcount").prop("checked");
    var triggerCount = $("#triggerCount").val();
    var triggerAck = $("#triggerAck").prop("checked");

    if(tCount)
    {
        notificationDetails.TimeDetails.tcount = triggerCount;
    }

    if(delayInterval !== undefined && delayInterval !==""){
        notificationDetails.TimeDetails.delayAck = delayAck;
        notificationDetails.TimeDetails.delayInterval = parseInt(delayInterval)*60000;
    }

    if(triggerInterval !== undefined && triggerInterval !==""){
        notificationDetails.TimeDetails.triggerInterval = parseInt(triggerInterval)*60000;
        notificationDetails.TimeDetails.triggerAck = triggerAck;
    }
}
function validateProfileTypeDetails(dataObject)
{
    var profileType = $('.NotifyProfile li.active').data('value');
    
    var profileTypeValue = $('.NotifyProfile li.active').data('dispname'); //No I18n
    if(!OPMClient.SettingsAddEditController.operation){
        profileType = OPMClient.SettingsAddEditController.pageObj.profileDetails.type;
    }

    if(profileType === "Log a Ticket" && OPMClient.SettingsNotificationsController.helpDeskProductName==="OnDemand"){
        profileType = "SDPOnDemand";//No I18N
    }
    if(profileType === "Log a Ticket" && OPMClient.SettingsNotificationsController.helpDeskProductName==="SDPMSPCloud"){
        profileType = "SDPMSPOD";//No I18N
    }
    if(profileType === "MSTeams"){
        profileType = "Chat";//No I18N
    }
    if(profileType === "Log a Ticket" && OPMClient.SettingsNotificationsController.InternalTemplateDetails!= undefined && OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateName == OPMClient.SettingsNotificationsController.helpDeskProductName){
        profileType = "CITInternal";//No I18N
    }
    var restrictedMessage = window.OPM.userPermissions.devGrouporBVRestricted;
    notificationDetails.typeDetails = {};
    OPMClient.SettingsNotificationsController.set("profileType",profileType);//No I18N
    OPMClient.SettingsNotificationsController.set("profileTypeValue",profileTypeValue);//No I18N

    // setPreviewStr("nofificationType",profileType); //No I18n

    if(profileType === "Send Email" || profileType === "Send SMS")
    {
        if(restrictedMessage) {
            if(!isMailServerConfigured()) {
                opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                return false;
            } else {
                return opm_validateEmailProfileNP();
            }
        }
        else if (isMailServerConfiguredPopUp(true)) {
            return opm_validateEmailProfileNP();
        } else {
            return false;
        }
    }
    if(profileType === "Send Modem SMS")
    {
        var flag = true;
        var smsServerDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getSMSGatewayConfiguration"); //No I18n
        var selectedGateway = $('#smsgateway').find(":selected").val();
        notificationDetails.smsDetails = {};
        notificationDetails.smsDetails.clickatellSet = smsServerDetails.Clickatell;
        notificationDetails.smsDetails.customSet = smsServerDetails.custom;
        notificationDetails.smsDetails.smppSet = smsServerDetails.smpp;

        OPMClient.SettingsNotificationsController.modemDetails.smsprofileType=selectedGateway;

        if(
            ((selectedGateway=="Custom") && (notificationDetails.smsDetails.customSet === false || notificationDetails.smsDetails.customSet === "false")) || // No I18N
            ((selectedGateway=="clickatell") && (notificationDetails.smsDetails.clickatellSet==false || notificationDetails.smsDetails.clickatellSet=="false")) ||  // No I18N 
            ((selectedGateway == "smpp") && (notificationDetails.smsDetails.smppSet == false || notificationDetails.smsDetails.smppSet == "false")) ||  // No I18N 
            (($.inArray(selectedGateway, OPMClient.SettingsAddEditController.inBuiltSMSGatewayNames) !== -1) && !isInBuiltGatewayConfigured(selectedGateway, smsServerDetails))
        ) {
            flag = false;
            OPMClient.SettingsAddEditController.set("parentRoute", "Settings.Notification.Add");//No I18N
            // OPMClient.SettingsAddEditController.set("smsGateway", selectedGateway); //No I18N
            if(restrictedMessage) {
                opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
            } else {
                opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.SMSComposition.tooltip',this)); //No I18n
            }
        }
        if(flag){
            var gatewayChecked = $('.modemPro').find(":selected").html(); // No I18N
            if(!gatewayChecked)
            {
                alert(Ember.I18n.t('webclient.sms.notification.gatewayselect',this)); //No I18N
                return;
            }
            else
            {
                return validateModemSMSProfile();
            }
        }
    }
    if(profileType === "Run System Command")
    {
        return validateRunSystemCmd();
    }
    if(profileType === "Run Program")
    {
        return validateRunProg();
    }
    if(profileType === "Log a Ticket" || profileType === "CITInternal")
    {
        var configuredDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/admin/checkForAddon?AddOn=helpDesk'); //No I18n
        if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="serviceDesk"){
            if(configuredDetails.serviceDeskEnabled){
                return validateLogATicket();
            }else{
                if(restrictedMessage) {
                    opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                } else {
                    opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.logTicket.serviceDesk.tooltip',this)); //No I18N
                }
                return false;
            }
        }else if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="serviceNow"){//No I18N
            if(configuredDetails.serviceNowEnabled){
                return validateLogATicket();
            }else{
                if(restrictedMessage) {
                    opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                } else {
                    opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.logTicket.serviceNow.tooltip',this)); //No I18N
                }
                return false;
            }
        }
        else if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName === "Jira"){
                 if(configuredDetails.jiraEnabled){
                    return validateJiraIssue(dataObject);
                }else{
                    if(restrictedMessage) {
                        opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                    } else {
                        opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.logTicket.jira.tooltip',this)); //No I18N
                    }
                    return false;
            }
        }else if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName === "SDPMSPRESTAPI"){//No I18N
                 if(configuredDetails.serviceDeskEnabled){
                    return validateServiceDeskMSP();
                }else{
                    if(restrictedMessage) {
                        opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                    } else {
                        opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.logTicket.serviceDeskmsp.tooltip',this)); //No I18N
                    }
                    return false;
            }
        }else if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName === "SDPMSPCloud"){//No I18N
                 if(configuredDetails.serviceDeskMSPCloudEnabled){
                    return validateSDPMSPCloud();
                }else{
                    if(restrictedMessage) {
                        opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                    } else {
                        opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.logTicket.serviceDeskMSPCloud.tooltip',this)); //No I18N
                    }
                    return false;
            }
        }else if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.InternalTemplateDetails!= undefined && OPMClient.SettingsNotificationsController.helpDeskProductName === OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateName){
            if(OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateIsEnabled){
               return validateCITInternalInteg(false);
           }else{
               opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.cit.internal.integration.notconfigured',{param0:OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateDisplayName,param1:OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateId},this)); //No I18N
               return false;
       }
   }
        
    }
    if(profileType === "SDPOnDemand"){
        var configuredDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/admin/checkForAddon?AddOn=helpDesk'); //No I18n
        if(configuredDetails.serviceDeskOnDemandEnabled){
            return validateOnDemand();
        }else{
            if(restrictedMessage) {
                opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
            } else {
                opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.sdpod.tooltip',this)); //No I18N
            }
            return false;
        }
    }
    if(profileType === "SDPMSPOD"){
        var configuredDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/admin/checkForAddon?AddOn=helpDesk'); //No I18n
        if(configuredDetails.serviceDeskMSPCloudEnabled){
            return validateSDPMSPCloud();
        }else{
            if(restrictedMessage) {
                opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
            } else {
                opm_infoMsgs('infoMsg', Ember.I18n.t('opm.infoMsg.logTicket.serviceDeskMSPCloud.tooltip',this)); //No I18N
            }
            return false;
        }
    }
    if(profileType === "Web Alarm")
    {
        return validateWebAlarm();
    }
    if(profileType === "Send SysLog")
    {
        return validateSyslogProfile();
    }
    if(profileType === "Send Trap")
    {
        return validateTrapProfile();
    }
    if(profileType === "Chat"){
        if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="MSTeams"){
            return validateMSTeamsProfile();
        }
        else{
            if($("#chatInfoMsgDiv").is(":visible")){
                if(restrictedMessage) {
                    opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
                } else {
                    opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.slack.notification.message.missing1',this)); //No I18N
                }
                return false;
            }else{
                return validateChatProfile();
            }

        }

    }
    if(profileType ==="MSTeams"){
        if(restrictedMessage) {
            opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.notificationProfile.devGroup.note',this)); //No I18n
            return false;
        } 
        if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="MSTeams"){
            return validateMSTeamsProfile();
        }
    }
    if(profileType === "Webhook"){

       return validateWebhookProfile();
    }
    if(profileType === "Ansible") {
        return validateAnsibleNotifyProfile();   
    }
    if(profileType === "CITemplate"){
        return validateCITemplate();
     }
    if(profileType == "SIEM"){
        return validateSIEMProfile();
    }

 }

function opm_validateEmailProfileNP()
{
    var fromAddress = $("#fromAddress").val();
    var subject = $("#emailSubject").val();
    var message = $("#emailMessage").val();
    var ccAddress = $("#ccAddress").val();
    var mailFormat = $('input[name="MAILFORMAT"]:checked').val();
    var fieldsToValidate = {'empty':['toAddress','fromAddress','emailSubject','emailMessage'],'emailWithSplcharOrDefault':['fromAddress'],'mulitpleEmailWithSplchar':['toAddress'],'maxCheck': {'emailMessage':4000 ,'emailSubject':4000}}; //No I18N    
    var isCCAddrAdded = ($('#ccDiv').is(":visible") && ccAddress !== undefined && ccAddress !== "");
    var isDefaultFromAddress = $('#enableEditEmail').prop('checked');
    if (isCCAddrAdded) {
        fieldsToValidate.mulitpleEmailWithSplchar.push('ccAddress');
        fieldsToValidate.maxCheck.ccAddress = 500;
    }
    var isValid = opm_validateFields(fieldsToValidate);
    var toAddress = $("#toAddress").val();
    ccAddress = $("#ccAddress").val();

    if(isValid){

        notificationDetails.typeDetails.fromAddress = encodeURIComponent(fromAddress);
        notificationDetails.typeDetails.toAddress = encodeURIComponent(toAddress);
        notificationDetails.typeDetails.isDefaultFromAddress = isDefaultFromAddress;
        if (isCCAddrAdded) {
            notificationDetails.typeDetails.ccAddress = encodeURIComponent(ccAddress);
        }
        notificationDetails.typeDetails.message = encodeURIComponent(message);
        notificationDetails.typeDetails.subject = encodeURIComponent(subject);
        if(OPMClient.SettingsNotificationsController.profileType !== "Send SMS")
        {
            notificationDetails.typeDetails.MAILFORMAT = mailFormat;
        }
        var content = Ember.I18n.t("webclient.admin.profiledetails.subject", this) + ": " + escapeHtmlTags(subject) + "<br/><br/> " + Ember.I18n.t('webclient.admin.scheduledt.endsat', this) + ": " + toAddress; //No I18N
        if (isCCAddrAdded) {
            content += "<br/><br/> " + Ember.I18n.t('webclient.notifyprofile.email.cc', this) + ": " + ccAddress; //No I18N
        }
        content += "<br/><br/> " + Ember.I18n.t('webclient.admin.alarmesc.message', this) + ": " + _.escape(message); //No I18N
        setPreviewStr("notificationDetails",content); //No I18n
    }
    return isValid;
}

function validateSyslogProfile()
{
    var sysLogHost = $("#sysLogHost").val();
    var sysLogPort = $("#sysLogPort").val();
    var facility = $("#sysFacility").val();
    var severity = $("#sysSeverity").val();
    var variables = $("#sysVariables").val();
    var fieldsToValidate = {'empty':['sysLogHost','sysLogPort','sysVariables'],'port':['sysLogPort']};//No I18N
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid){
        notificationDetails.typeDetails.sysLogHost = sysLogHost;
        notificationDetails.typeDetails.sysLogPort = sysLogPort;
        notificationDetails.typeDetails.facility = facility;
        notificationDetails.typeDetails.severity = severity;
        notificationDetails.typeDetails.variables = variables;

        var content = Ember.I18n.t("webclient.admin.forward.destinationhost", this) + ": " + escapeHtmlTags(sysLogHost) + "<br/> " + Ember.I18n.t("webclient.admin.forward.destinationport", this) + ": " + sysLogPort; //No I18n
        setPreviewStr("notificationDetails",content); //No I18n
    }
    return isValid;    
}

function validateModemSMSProfile()
{
    var toNumber = $("#toNumber").val();
    var message = $("#modemMessage").val();
    var gateWay = $('#smsgateway').find(":selected").val();
    var fieldsToValidate = {'empty':['toNumber','modemMessage'],'phoneNumberWithCountryCode':['toNumber']};//No I18N
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid){
        notificationDetails.typeDetails.toNumber = encodeURIComponent(toNumber);
        notificationDetails.typeDetails.message = message;

        if (gateWay === "clickatell") {  // No I18N
            notificationDetails.typeDetails.gateway = "2";
        } else if (gateWay === "Custom") { //No I18N
            notificationDetails.typeDetails.gateway = "5";
        } else if (gateWay === "smpp") { //No I18N
            notificationDetails.typeDetails.gateway = "6";
        } else {
            $.each(OPMClient.SettingsAddEditController.inBuiltSMSGateways, function(index, defaultGateway) {
                if (gateWay === defaultGateway.gatewayName) {
                     notificationDetails.typeDetails.gateway = defaultGateway.gatewayId;
                     return false;
                }
            });
        }

        var content = Ember.I18n.t('webclient.map.flash.Dialog_5', this) + toNumber + "<br/><br/> " + Ember.I18n.t('webclient.admin.traps.message', this) + ": " + escapeHtmlTags(message); //No I18N
        setPreviewStr("notificationDetails",content); //No I18n
    }

    return isValid;   
}
function validateRunProg()
{
    var sysprogram = $("#runprogram").val();
    var sysarguments = $("#runarguments").val();
    var fieldsToValidate = {'empty':['runprogram'],'maxCheck':{'runarguments':1000}};//No I18N
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid)
    {
        notificationDetails.typeDetails.sysprogram = sysprogram;
        notificationDetails.typeDetails.sysarguments = sysarguments;

        var content = Ember.I18n.t('webclient.admin.profiledetails.command', this) + ": " + escapeHtmlTags(sysprogram); //No I18n
        if(sysarguments !== "")
        {
            content += "<br><br>" + Ember.I18n.t('webclient.admin.profiledetails.programarguments', this) + ": " + escapeHtmlTags(sysarguments); //No I18n
        }
        setPreviewStr("notificationDetails",content); //No I18n 
    }
    return isValid; 
}
function validateServiceDeskMSP(){
    if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="SDPMSPRESTAPI"){
        var customer = $('#sdpmsp_customer').val();
        var probe = $('#sdpmsp_probe').val();
        var title = $('#sdpmsp_title').val();
        var ticketDescription = $('#sdpmsp_ticketDescription').val();
        var fieldsToValidate = {'empty':['sdpmsp_customer','sdpmsp_probe','sdpmsp_openStatus','sdpmsp_closeStatus','sdpmsp_title','sdpmsp_ticketDescription'],'maxCheck':{'sdpmsp_title':160,'sdpmsp_ticketDescription':2000}};//No I18N
        var ticketCategory = $('#sdpmsp_category').val();
        var ticketSubCategory = $('#sdpmsp_subcategory').val();
        var ticketItem = $('#sdpmsp_item').val();
        var ticketGrpTech = $('#sdpmsp_group').val();
        var ticketTechnician = $('#sdpmsp_technician').val();
        var ticketPriority = $('#sdpmsp_priority').val();
        var ticketCloseStatus = $('#sdpmsp_closeStatus').val();
        var ticketOpenStatus = $('#sdpmsp_openStatus').val();

        var isValid = opm_validateFields(fieldsToValidate);

        if(ticketCloseStatus != null && ticketOpenStatus!= null && ticketCloseStatus != undefined && ticketOpenStatus!= undefined && ticketCloseStatus != "" && ticketOpenStatus!= "" && ticketCloseStatus === ticketOpenStatus){//No I18N
            if(!opm_validateFields({'custom':[{condition:ticketCloseStatus == ticketOpenStatus, identifier:'sdpmsp_closeStatus', message:Ember.I18n.t('webclient.sdpmsp.status.duplicatemsg',this)}]})){//No I18N
                return false;
            }
        }
        if(isValid ){
            notificationDetails.typeDetails.customerId = encodeURIComponent(customer);
            notificationDetails.typeDetails.probeId = encodeURIComponent(probe);
            notificationDetails.typeDetails.openStatusName = encodeURIComponent(ticketOpenStatus);
            notificationDetails.typeDetails.closeStatusName = encodeURIComponent(ticketCloseStatus);
            notificationDetails.typeDetails.ticketCategory = encodeURIComponent(ticketCategory);
            notificationDetails.typeDetails.ticketSubCategory = encodeURIComponent(ticketSubCategory);
            notificationDetails.typeDetails.ticketItem = encodeURIComponent(ticketItem);
            notificationDetails.typeDetails.ticketGrpTech = encodeURIComponent(ticketGrpTech);
            notificationDetails.typeDetails.ticketTechnician = encodeURIComponent(ticketTechnician);
            notificationDetails.typeDetails.ticketPriority = encodeURIComponent(ticketPriority);
            notificationDetails.typeDetails.subject = encodeURIComponent(title);
            notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
            notificationDetails.typeDetails.ticketCloseNotes = ""; //No I18N
            notificationDetails.typeDetails.productName = "SDPMSPRESTAPI"; //No I18n
        }
        return isValid;
    }
}
function validateSDPMSPCloud(){
    var title = $('#subjectVariable').val();
    var ticketDescription = $('#messageVariable').val();
    var ticketCategory = '';
    var ticketSubCategory = '';
    var ticketItem = '';
    var ticketSite = '';
    var ticketGrpTech = '';
    var ticketTechnician = '';
    var ticketPriority = '';
    var ticketUrgency = '';
    var ticketImpact = '';
    var ticketTemplate = '';
    var ticketRequester = '';
    var customerId = '';

    // Read values from nfa-multi-value-select-box selects and customer select
    var component = $('.service-desk-msp-cloud-template');
    if(component.length > 0){
        customerId = component.find('select.sdpmspcloudCustomer').val() || '';
        ticketCategory = component.find('select.category').val() || '';
        ticketSubCategory = component.find('select.subCategory').val() || '';
        ticketItem = component.find('select.item').val() || '';
        ticketSite = component.find('select.site').val() || '';
        ticketGrpTech = component.find('select.group').val() || '';
        ticketTechnician = component.find('select.technician').val() || '';
        ticketPriority = component.find('select.priority').val() || '';
        ticketUrgency = component.find('select.urgency').val() || '';
        ticketImpact = component.find('select.impact').val() || '';
        ticketTemplate = component.find('select.incidentTemplate').val() || '';
        ticketRequester = component.find('select.sdpmspodRequester').val() || '';

        // Clear error style as soon as user corrects values.
        component.find('select.sdpmspcloudCustomer').off('change.sdpmspodErr').on('change.sdpmspodErr', function(){//No I18N
            $(this).closest('.opmFormCol').removeClass('error-border'); //No I18N
        });
        component.find('select.incidentTemplate').off('change.sdpmspodErr').on('change.sdpmspodErr', function(){//No I18N
            $(this).closest('.opmFormCol').removeClass('error-border'); //No I18N
        });
        component.find('input[id^="sdpmspod_mf_"]').off('input.sdpmspodErr blur.sdpmspodErr').on('input.sdpmspodErr blur.sdpmspodErr', function(){//No I18N
            if(($.trim($(this).val() || '')) !== ''){
                $(this).closest('.sdpmspod-mf-control').removeClass('error-border'); //No I18N
                $(this).removeClass('error-border').css('color', '#212121'); //No I18N
            }
        });
    }

    if(!customerId || customerId === ''){
        opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.sdpmsp.customer.mandatory')); //No I18N
        component.find('select.sdpmspcloudCustomer').closest('.opmFormCol').addClass('error-border'); //No I18N
        return false;
    } else {
        component.find('select.sdpmspcloudCustomer').closest('.opmFormCol').removeClass('error-border'); //No I18N
    }

    if(!ticketTemplate || ticketTemplate === ''){
        opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.sdpmspcloud.template.mandatory')); //No I18N
        component.find('select.incidentTemplate').closest('.opmFormCol').addClass('error-border'); //No I18N
        return false;
    } else {
        component.find('select.incidentTemplate').closest('.opmFormCol').removeClass('error-border'); //No I18N
    }

    // Validate all mandatory default fields together
    var hasDynamicMandatoryError = false;

    // Requester is always mandatory
    var requesterCol = component.find('select.sdpmspodRequester').closest('.opmFormCol');//No I18N
    if(!ticketRequester || ticketRequester === ''){
        requesterCol.addClass('error-border'); //No I18N
        hasDynamicMandatoryError = true;
    } else {
        requesterCol.removeClass('error-border'); //No I18N
    }

    // Validate dynamically mandatory default fields
    var dynamicMandatoryFields = [
        {selector: 'select.category', value: ticketCategory},//No I18N
        {selector: 'select.subCategory', value: ticketSubCategory},//No I18N
        {selector: 'select.item', value: ticketItem},//No I18N
        {selector: 'select.site', value: ticketSite},//No I18N
        {selector: 'select.group', value: ticketGrpTech},//No I18N
        {selector: 'select.technician', value: ticketTechnician},//No I18N
        {selector: 'select.priority', value: ticketPriority},//No I18N
        {selector: 'select.urgency', value: ticketUrgency},//No I18N
        {selector: 'select.impact', value: ticketImpact}//No I18N
    ];
    for(var d = 0; d < dynamicMandatoryFields.length; d++){
        var dmf = dynamicMandatoryFields[d];
        var fieldCol = component.find(dmf.selector).closest('.opmFormCol');//No I18N
        if(fieldCol.find('label.mandatoryLabel').length > 0){
            if(!dmf.value || dmf.value === ''){
                fieldCol.addClass('error-border'); //No I18N
                hasDynamicMandatoryError = true;
            } else {
                fieldCol.removeClass('error-border'); //No I18N
            }
        } else {
            fieldCol.removeClass('error-border'); //No I18N
        }
    }

    // Validate mandatory template fields (custom fields)
    component.find('input[id^="sdpmspod_mf_"]').each(function(){
        var fieldValue = $(this).val() || '';
        if(fieldValue.trim() === ''){
            $(this).closest('.sdpmspod-mf-control').addClass('error-border'); //No I18N
            hasDynamicMandatoryError = true;
        } else {
            $(this).closest('.sdpmspod-mf-control').removeClass('error-border'); //No I18N
            $(this).removeClass('error-border').css('color', '#212121'); //No I18N
        }
    });

    if(hasDynamicMandatoryError){
        opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.sdpmspcloud.mandatoryfields.empty')); //No I18N
        return false;
    }

    // Validate description conditionally (only if dynamically mandatory)
    var isDescMandatory = component.find('#messageVariable').closest('.opmFormCol').find('label.mandatoryLabel').length > 0;//No I18N
    var fieldsToValidate;
    if(isDescMandatory){
        fieldsToValidate = {'empty':['subjectVariable','messageVariable'],'maxCheck':{'subjectVariable':160,'messageVariable':2000}};//No I18N
    } else {
        fieldsToValidate = {'empty':['subjectVariable'],'maxCheck':{'subjectVariable':160,'messageVariable':2000}};//No I18N
    }
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid){
        notificationDetails.typeDetails.sdpMspCloudCustomerId = encodeURIComponent(customerId);
        notificationDetails.typeDetails.ticketCategory = encodeURIComponent(ticketCategory);
        notificationDetails.typeDetails.ticketSubCategory = encodeURIComponent(ticketSubCategory);
        notificationDetails.typeDetails.ticketItem = encodeURIComponent(ticketItem);
        notificationDetails.typeDetails.ticketSite = encodeURIComponent(ticketSite);
        notificationDetails.typeDetails.ticketGrpTech = encodeURIComponent(ticketGrpTech);
        notificationDetails.typeDetails.ticketTechnician = encodeURIComponent(ticketTechnician);
        notificationDetails.typeDetails.ticketPriority = encodeURIComponent(ticketPriority);
        notificationDetails.typeDetails.ticketUrgency = encodeURIComponent(ticketUrgency);
        notificationDetails.typeDetails.ticketImpact = encodeURIComponent(ticketImpact);
        notificationDetails.typeDetails.ticketTemplate = encodeURIComponent(ticketTemplate);
        notificationDetails.typeDetails.ticketRequester = encodeURIComponent(ticketRequester);
        notificationDetails.typeDetails.subject = encodeURIComponent(title);
        notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
        notificationDetails.typeDetails.productName = "SDPMSPOD"; //No I18n
        // Collect mandatory template fields
        var sdpmspodComponent = component.closest('.service-desk-msp-cloud-template');//No I18N
        var mandatoryFieldsData = [];
        sdpmspodComponent.find('input[id^="sdpmspod_mf_"]').each(function(){
            var fieldName = this.id.replace('sdpmspod_mf_', '');
            var fieldValue = $(this).val() || '';
            var fieldId = $(this).attr('data-fieldid') || '';
            if(fieldName && fieldName !== ''){
                mandatoryFieldsData.push({name: fieldName, value: fieldValue, id: fieldId});
            }
        });
        if(mandatoryFieldsData.length > 0){
            notificationDetails.typeDetails.sdpMspCloudCustomFields = encodeURIComponent(JSON.stringify(mandatoryFieldsData));
        }
    }
    return isValid;
}
function validateCITInternalInteg(isNTemplate){
    var templateFields = OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplatenpFields;
    var templateName = OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateName;
    var fieldsToValidate = {'empty':[]};//No I18N
    var selectedFields = [];
    for(var iter = 0 ; iter < templateFields.length ; iter++){
        var currentField = templateFields[iter];
        var currentFieldElement = $('#'+currentField.key);
        if(templateFields[iter].isMandatory || templateFields[iter].isMandatoryForClosure){
            fieldsToValidate.empty.push(templateFields[iter].key);
        }
        if(templateFields[iter].isCheckBox){
            if($('#'+templateFields[iter].key).is(":checked")){
                templateFields[iter].selectedValue = "true";
            }else{
                templateFields[iter].selectedValue = "false";
            }
        } else if (templateName === "TPI_TOPDESK" && !currentField.isCustomKeyValue && currentFieldElement.length > 0) {//No I18N
            var currentValue = currentFieldElement.val();
            if (currentValue !== undefined && currentValue !== null) {
                currentField.selectedValue = currentValue;
            }
        }
        if(templateFields[iter].key ==="customdetailskey"){
            var customdetails=OPMClient.SettingsNotificationsController.customdetailsArray;
            var customDetailArray=[];
            for(var j=0;j<customdetails.length;j++){
                var key=customdetails[j].key.trim();
                var value=customdetails[j].value.trim();
                if((key== "" && value!="")||(key!= "" && value=="") || (key=="" && value=="" && j!=customdetails.length-1)){
                    if(key=="" && value==""){
                        fieldsToValidate.empty.push(customdetails[j].keyId,customdetails[j].valueId);
                    }
                    else if(key== ""){
                        fieldsToValidate.empty.push(customdetails[j].keyId);
                    }else{
                        fieldsToValidate.empty.push(customdetails[j].valueId);
                    }
                }
                customDetailArray.push({ key: key, value: value });

            }
          templateFields[iter].selectedValue=customDetailArray;
        }
        if(templateFields[iter].selectedValue != null && templateFields[iter].selectedValue != undefined && templateFields[iter].selectedValue != ""){
            var templateField= {};
            templateField.id=templateFields[iter].id;
            templateField.key=templateFields[iter].key;
            templateField.displayName=templateFields[iter].displayName;
            templateField.selectedValue=templateFields[iter].selectedValue;
            templateField.fieldType=templateFields[iter].fieldType;
            templateField.apiParam_KeyFormat=templateFields[iter].apiParam_KeyFormat;
            templateField.valueType=templateFields[iter].valueType;
            templateField.isCreate=templateFields[iter].isCreate;
            templateField.isUpdate=templateFields[iter].isUpdate;
            templateField.isClose=templateFields[iter].isClose;
            templateField.isReopen=templateFields[iter].isReopen;
            selectedFields.pushObject(templateField);
        }
    }
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid && !isNTemplate){
        notificationDetails.typeDetails.CITNPFieldsArray = encodeURIComponent(JSON.stringify(selectedFields));
        notificationDetails.typeDetails.templateId = OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateId;
        notificationDetails.typeDetails.templateName = OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateName;
    }else if(isValid && isNTemplate){
        var npDetails=OPMClient.SettingsNotificationsController.InternalNotificationTemplateDetails;
        if(npDetails==undefined){
            npDetails=OPMClient.SettingsNotificationsController.InternalTemplateDetails;
        }
        var nTemplateParam = {
            templateId : npDetails.internalTemplateId,
            templateName : npDetails.internalTemplateName,
            CITNPFieldsArray : JSON.stringify(selectedFields)
        };
        OPMClient.SettingsNotificationsController.InternalTemplateDetails.nTemplateParam = nTemplateParam;
    }
    return isValid;
}
function validateOnDemand(){

    if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="OnDemand"){
        var title = $('#sdpondemand_title').val();
        var ticketDescription = $('#sdpondemand_ticketDescription').val();
        var fieldsToValidate = {'empty':['sdpondemand_title','sdpondemand_ticketDescription'],'maxCheck':{'sdpondemand_title':160,'sdpondemand_ticketDescription':2000}};//No I18N
        var ticketCategory = $('#sdpondemand_ticketCategory').val();
        var ticketSubCategory = $('#sdpondemand_ticketSubCategory').val();
        var ticketItem = $('#sdpondemand_ticketItem').val();
        var ticketSite = $('#sdpondemand_ticketSite').val();
        var ticketGrpTech = $('#sdpondemand_ticketGroup').val();
        var ticketTechnician = $('#sdpondemand_ticketTechnician').val();
        var ticketPriority = $('#sdpondemand_ticketPriority').val();
        var ticketUrgency = $('#sdpondemand_ticketUrgency').val();
        var ticketImpact = $('#sdpondemand_ticketImpact').val();

        var isValid = opm_validateFields(fieldsToValidate);
        if(isValid){
            notificationDetails.typeDetails.ticketCategory = encodeURIComponent(ticketCategory);
            notificationDetails.typeDetails.ticketSubCategory = encodeURIComponent(ticketSubCategory);
            notificationDetails.typeDetails.ticketItem = encodeURIComponent(ticketItem);
            notificationDetails.typeDetails.ticketSite = encodeURIComponent(ticketSite);
            notificationDetails.typeDetails.ticketGrpTech = encodeURIComponent(ticketGrpTech);
            notificationDetails.typeDetails.ticketTechnician = encodeURIComponent(ticketTechnician);
            notificationDetails.typeDetails.ticketPriority = encodeURIComponent(ticketPriority);
            notificationDetails.typeDetails.ticketUrgency = encodeURIComponent(ticketUrgency);
            notificationDetails.typeDetails.ticketImpact = encodeURIComponent(ticketImpact);
            notificationDetails.typeDetails.subject = encodeURIComponent(title);
            notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
            notificationDetails.typeDetails.ticketCloseNotes = ""; //No I18n
            notificationDetails.typeDetails.productName = "OnDemand"; //No I18n
        }
        return isValid;
    }
}
function validateLogATicket()
{
    if(OPMClient.SettingsNotificationsController.helpDeskProductName!==undefined && OPMClient.SettingsNotificationsController.helpDeskProductName==="serviceNow"){
        // Per-profile event/incident detection
        var snowTicketType = $('input[name="snowTicketType"]:checked').val() || "incident";//No I18N
        if(snowTicketType === "event"){//No I18N
            // Event flow: validate and collect event fields
            var checkEmptyFields = ['snow_event_title','snow_event_description'];//No I18N
            var fieldsToValidate = {'empty':checkEmptyFields};//No I18N
            var isValid = opm_validateFields(fieldsToValidate);
            if(isValid){
                notificationDetails.typeDetails.productName = "SERVICENOW";//No I18N
                notificationDetails.typeDetails.snowTicketType = "event";//No I18N
                var eventFieldKeys = ['source','node','type','resource','metric_name','event_class','severity','cmdb_ci','message_key'];//No I18N
                for(var i=0; i<eventFieldKeys.length; i++){
                    notificationDetails.typeDetails['event_'+eventFieldKeys[i]] = encodeURIComponent($('#snow_event_'+eventFieldKeys[i]).val() || "");
                }
                // If severity is empty (choose a value), default to 'auto'
                if(!notificationDetails.typeDetails.event_severity || notificationDetails.typeDetails.event_severity === ''){//No I18N
                    notificationDetails.typeDetails.event_severity = encodeURIComponent('auto');//No I18N
                }
                // Send subject/message for reportProps (ticketDescription used in notification report)
                notificationDetails.typeDetails.subject = encodeURIComponent($('#snow_event_title').val() || "");
                notificationDetails.typeDetails.message = encodeURIComponent($('#snow_event_description').val() || "");
            }
            return isValid;
        }
        // Incident flow (existing)
        var checkEmptyFields = [];
        checkEmptyFields.push('servicenow_ticketDescription');
        checkEmptyFields.push('servicenow_title');
        if(OPMClient.ApplicationController.snowCustomFieldsList!==undefined && OPMClient.ApplicationController.snowCustomFieldsList!==null) {
            for(var iter=0; iter<OPMClient.ApplicationController.snowCustomFieldsList.length; iter++) {
                checkEmptyFields.push(OPMClient.ApplicationController.snowCustomFieldsList[iter].element);
                delete OPMClient.ApplicationController.snowCustomFieldsList[iter].internal_type
                delete OPMClient.ApplicationController.snowCustomFieldsList[iter].placeHolder;
                delete OPMClient.ApplicationController.snowCustomFieldsList[iter].choices;
                delete OPMClient.ApplicationController.snowCustomFieldsList[iter].iconID;
                delete OPMClient.ApplicationController.snowCustomFieldsList[iter].dropdownID;
                if(OPMClient.ApplicationController.snowCustomFieldsList[iter].value=="") {
                    OPMClient.ApplicationController.snowCustomFieldsList[iter].value = $('#'+OPMClient.ApplicationController.snowCustomFieldsList[iter].element).val();
                }
            }
        }
        if(OPMClient.ApplicationController.snowCustomFieldsList==undefined || OPMClient.ApplicationController.snowCustomFieldsList==null) {
            OPMClient.ApplicationController.snowCustomFieldsList=[];
        }
        var title = $('#servicenow_title').val();
        var ticketDescription = $('#servicenow_ticketDescription').val();
        var fieldsToValidate = {'empty':checkEmptyFields,'maxCheck':{'servicenow_title':160,'servicenow_ticketDescription':2000}};//No I18N
        var ticketCategory = $('#servicenow_ticketCategory').val();
        var ticketSubCategory = $('#servicenow_ticketSubCategory').val();
        var ticketItem = $('#servicenow_ticketItem').val();
        var ticketPriority = $('#servicenow_ticketPriority').val();
        var ticketGrpTech = $('#servicenow_ticketGrpTech').val();
        var ticketTechnician = $('#servicenow_ticketTechnician').val();

        var ticketImpact = $('#servicenow_ticketImpact').val();
        var ticketUrgency = $('#servicenow_ticketUrgency').val();

        var isValid = opm_validateFields(fieldsToValidate);
        if(isValid){
           notificationDetails.typeDetails.ticketCategory = encodeURIComponent(ticketCategory);
            notificationDetails.typeDetails.ticketSubCategory = encodeURIComponent(ticketSubCategory);
            notificationDetails.typeDetails.ticketItem = encodeURIComponent(ticketItem);
            notificationDetails.typeDetails.ticketPriority = encodeURIComponent(ticketPriority);
            if (ticketGrpTech!== undefined && (ticketGrpTech === null || ticketGrpTech == "none" || ticketGrpTech =="null")) {
                ticketGrpTech = "";
            }
            notificationDetails.typeDetails.ticketGrpTech = encodeURIComponent(ticketGrpTech);
            if (ticketTechnician !== undefined && (ticketTechnician === null || ticketTechnician == "none" || ticketTechnician == "null")) {
                ticketTechnician = "";
            }
            notificationDetails.typeDetails.ticketTechnician = encodeURIComponent(ticketTechnician);
            notificationDetails.typeDetails.ticketImpact = encodeURIComponent(ticketImpact);
            notificationDetails.typeDetails.ticketUrgency = encodeURIComponent(ticketUrgency);
            notificationDetails.typeDetails.subject = encodeURIComponent(title);
            notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
            notificationDetails.typeDetails.ticketCloseNotes = ""; //No I18N
            notificationDetails.typeDetails.productName = "SERVICENOW"; //No I18N
            notificationDetails.typeDetails.snowTicketType = "incident"; //No I18N
            notificationDetails.typeDetails.snowCustomFields = encodeURIComponent(JSON.stringify(OPMClient.ApplicationController.snowCustomFieldsList));
        }
        return isValid;
    }
    else{
        var title = $('#sdp_title').val();
        var ticketDescription = $('#sdp_ticketDescription').val();
        var fieldsToValidate = {'empty':['sdp_title','sdp_ticketDescription'],'maxCheck':{'sdp_title':250,'sdp_ticketDescription':2000}};//No I18N
        var ticketCategory = $('#ticketCat').val().slice($('#ticketCat').val().indexOf("_")+1, $('#ticketCat').val().length);
        var ticketSubCategory = $('#ticketSubCat').val().slice($('#ticketSubCat').val().indexOf("_")+1, $('#ticketSubCat').val().length);
        var ticketItem = $('#ticketItem').val().slice($('#ticketItem').val().indexOf("_")+1, $('#ticketItem').val().length);
        var ticketPriority = $('#ticketPriority').val().slice($('#ticketPriority').val().indexOf("_")+1, $('#ticketPriority').val().length);
        var ticketGrpTech = $('#ticketGrpTech').val().slice($('#ticketGrpTech').val().indexOf("_")+1, $('#ticketGrpTech').val().length);
        var ticketTechnician = $('#ticketTechnician').val().slice($('#ticketTechnician').val().indexOf("_")+1, $('#ticketTechnician').val().length);

        var isValid = opm_validateFields(fieldsToValidate);
        if(isValid){
           notificationDetails.typeDetails.ticketCategory = encodeURIComponent(ticketCategory);
            notificationDetails.typeDetails.ticketSubCategory = encodeURIComponent(ticketSubCategory);
            notificationDetails.typeDetails.ticketItem = encodeURIComponent(ticketItem);
            notificationDetails.typeDetails.ticketPriority = encodeURIComponent(ticketPriority);
            notificationDetails.typeDetails.ticketGrpTech = encodeURIComponent(ticketGrpTech);
            notificationDetails.typeDetails.ticketTechnician = encodeURIComponent(ticketTechnician);
            notificationDetails.typeDetails.subject = encodeURIComponent(title);
            notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
            notificationDetails.typeDetails.productName = "SERVICEDESK"; //No I18N
        }
        return isValid; 
    }
}
function validateJiraIssue(dataObject){
    var fields = dataObject.dynamicFields;
    var emptyCheck = [];
    var dynamicFields = {};
    var message = $('#Jira_ticketMessage').val();
    var subject = $('#Jira_ticketSubject').val();
    emptyCheck = ['JOP_key_projectkey','JOP_name_issuetype','Jira_ticketSubject'];//No I18N
    for(var i=0;i<fields.length;i++){
        var typeValueObj = {};
        var field = fields[i];
        if(field.isRequired){
            emptyCheck.push(field.key);
        }
        if(!field.isMultiSelect && !field.haveChild){
            typeValueObj.type = field.type;
            typeValueObj.value = field.value;
            dynamicFields[field.key] = typeValueObj;
        }else if(!field.haveChild){
             typeValueObj.type = field.type;
            typeValueObj.value = (field.arrayValue);
            dynamicFields[field.key] = typeValueObj;
        }else{
            var tempJSON = {};
            tempJSON.value = field.value;
            if(field.value != null){
            tempJSON.childValue = field.childValue;
            }else{
                tempJSON.childValue = null;
            }
            typeValueObj.type = field.type;
            typeValueObj.value = tempJSON;   
            dynamicFields[field.key] = typeValueObj;
        }
    }
    var fieldsToValidate = {'empty':emptyCheck};//No I18N
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid){
        notificationDetails.typeDetails.dynamicFields = encodeURIComponent(JSON.stringify(dynamicFields));
        notificationDetails.typeDetails.productName = encodeURIComponent("JIRA");//No I18N 
    }
    notificationDetails.typeDetails.message = encodeURIComponent(message);
    notificationDetails.typeDetails.subject = encodeURIComponent(subject);
    return isValid;
}
function validateChatProfile()
{
    if(OPMClient.SettingsNotificationsController.chatProductName!==undefined && OPMClient.SettingsNotificationsController.chatProductName==="SLACK"){
        var title = $('#slack_title').val();
        var ticketDescription = $('#slack_description').val();

        var fieldsToValidate = {'empty':['slack_title','slack_description'],'maxCheck':{'slack_title':160,'slack_description':500}};//No I18N

        if($('input[name="receiverType"]:checked').val()===0 || $('input[name="receiverType"]:checked').val()==="0"){
            fieldsToValidate.empty.push('slack_channel');
        }
        else{
            fieldsToValidate.empty.push('slack_user');
        }

        var isValid = opm_validateFields(fieldsToValidate);
        if(isValid){
            notificationDetails.typeDetails.subject = encodeURIComponent(title);
            notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
            notificationDetails.typeDetails.ischannel = $('input[name="receiverType"]:checked').val()==="0"?true:false;
            if(notificationDetails.typeDetails.ischannel){
                notificationDetails.typeDetails.receiverid=$('#slack_channel').val();
            }
            else{
                notificationDetails.typeDetails.receiverid=$('#slack_user').val().split('_#_')[0];
            }
            notificationDetails.typeDetails.productName = "SLACK"; //No I18N
        }
        return isValid;
    }
}
function validateMSTeamsProfile()
{

    if(OPMClient.SettingsNotificationsController.chatProductName!==undefined && OPMClient.SettingsNotificationsController.chatProductName==="MSTeams") {

        var title = $('#MSTeams_title').val();
        var ticketDescription = $('#MSTeams_description').val();

        var fieldsToValidate = {'empty':['MSTeams_title','MSTeams_description','MSTeams_Teams','MSTeams_channelsTest'],'maxCheck':{'MSTeams_title':160,'MSTeams_description':500}};//No I18N
        var isValid = opm_validateFields(fieldsToValidate);


        if(isValid){
            notificationDetails.typeDetails.subject = encodeURIComponent(title);
            notificationDetails.typeDetails.message = encodeURIComponent(ticketDescription);
            notificationDetails.typeDetails.productName = "MSTeams"; //No I18N

        }
        return isValid;

    }
        return true;
    
}
function validateWebAlarm()
{
    var userNames = [];
    var userNameTxt = [];
    var soundFile = '';
    if($('#addSoundFile').is(':hidden')){
        soundFile = $('#soundFileSel').val();
    } else if($('#addSoundFileBtn').hasClass('hide')){
        soundFile = $('#webAlarmSoundFile').val(); 
    }
    if(soundFile.length === 0) {
        alert(Ember.I18n.t("webclient.np.webalarm.addSoundFile.uploadAlert", this)); //No I18n
        return false;
    }
   var chkBox = $(".chkSelectAll:checked").not('.ignoreRole');
    var index;
    var userchkBox = $('.treeList').find('input[class="dashUser"]:checked').not('.ignoreAll').not('.ignoreUser');//No I18N
    var selectedUserIDs=[];
    var selectedRoleIDs=[];
    if(userchkBox.length !== 0){
        for(index=0;index<userchkBox.length;index++) {
            selectedUserIDs.push(userchkBox[index].value); // NO i18N
        }
         $('#AssociateUserList .opmCheckBox').find('input:checkbox:checked:not(".chkSelectAll")').each(function (i, v) {
            userNames.push(v.value);
            userNameTxt.push(v.nextSibling.nextSibling.innerHTML);
        });
    }
    if(chkBox.length !== 0) {
        for(index=0;index<chkBox.length;index++) {
            selectedRoleIDs.push(chkBox[index].value); // NO i18N
        }
    }
    if (selectedUserIDs.length === 0 && selectedRoleIDs.length === 0) {
        alert(Ember.I18n.t("webclient.admin.profiledetails.userName", this)); //No I18n
        return false;
    }
    notificationDetails.typeDetails.selectedUserIds = JSON.stringify(selectedUserIDs);
    notificationDetails.typeDetails.selectedRoleIds = JSON.stringify(selectedRoleIDs);
    notificationDetails.typeDetails.soundFile = soundFile;
    var content = "Users : " + userNameTxt.join(', '); //No I18n
    setPreviewStr("notificationDetails", content); //No I18n
    return true;
}
function validateRunSystemCmd()
{
    var command = $("#sysCommand").val();
    var errappend = $("#errappend").prop("checked");
    var append = $("#append").prop("checked");
     var fieldsToValidate = {'empty':['sysCommand'],'maxCheck': {"sysCommand": 1000}};//No I18N
    var isValid = opm_validateFields(fieldsToValidate);
    if(isValid){
        if(errappend){
            notificationDetails.typeDetails.errappend = errappend;
        }
        if(append){
            notificationDetails.typeDetails.append = append;
        }
        notificationDetails.typeDetails.command = command;

        var content = Ember.I18n.t('opu.views.COMMAND', this) + " : " + escapeHtmlTags(command); //No I18n
        setPreviewStr("notificationDetails",content); //No I18n
    }
    return isValid; 
}

function validateAnsibleNotifyProfile()
{
    var sysprogram = $("#ansiblePlayBookList").val();
    var sysarguments = $("#ansible_runarguments").val();

    if(sysprogram === "" || sysprogram === null){
        $("#ansiblePlayBookList").addClass('validateField error');//No I18N
        $("#ansiblePlayBookList").attr('data-error',Ember.I18n.t('webcient.ansible.playbook.select.alert',this));//No I18N
        $('#ansiblePlayBookList').focus();
        opmValidate($('#ansiblePlayBookList')); //No I18n
        return false;
    }
    else if(opm_ansibleCommandInputVal(sysarguments)){
        $("#ansible_runarguments").addClass('validateField error');//No I18N
        $("#ansible_runarguments").attr('data-error',Ember.I18n.t('webclient.opm.testCredential.fieldError',this));//No I18N
        $('#ansible_runarguments').focus();
        opmValidate($('#ansible_runarguments')); //No I18n
        return false;
    } 
    else {
        notificationDetails.typeDetails.command = "ansible-playbook "+sysprogram+" "+sysarguments
        notificationDetails.typeDetails.playbookName = sysprogram;
        notificationDetails.typeDetails.sysarguments = sysarguments;

        var content = Ember.I18n.t('webclient.admin.profiledetails.command', this) + ": " + escapeHtmlTags(sysprogram); //No I18n
        if(sysarguments !== "")
        {
            content += "<br><br>" + Ember.I18n.t('webclient.admin.profiledetails.programarguments', this) + ": " + escapeHtmlTags(sysarguments); //No I18n
        }
        setPreviewStr("notificationDetails",content); //No I18n 
        return true;
    }
}
function validateWebhookProfile()
{
        var methodtype = $("#httpMethod option:selected").attr("value");
        var urlval=$("#hookURL").val()
        var timeout=$('#timeout').val();
        var type = $('input[name="DATATYPE"]:checked').val(); 
        var header = OPMClient.SettingsConfigurationController.headerList;
        var isValid;
        var fieldsToValidate;
        urlval = urlval.trim();
        fieldsToValidate = {'empty':["hookURL","timeout"],'validateProperUrl':["hookURL"],'positive':["timeout"],'timeout':["timeout"]};//No I18n
        isValid = opm_validateFields(fieldsToValidate);
         if(!isValid) {
                return isValid;
        }   
        for(var j=0;j<header.length;j++) {
                var key=$("#"+ header[j].RequestName).val();
                var value=$("#"+header[j].RequestValue).val();
                value=value.replace(/\s/g, '');
                if((key== '' && value!="")||(key!= '' && value=="") || (key=='' && value=='' && j!=header.length-1)) {
                    fieldsToValidate = {'empty':[header[j].RequestName,header[j].RequestValue]};
                    isValid = opm_validateFields(fieldsToValidate);
                    if(!isValid) {
                            return isValid;
                    }  
                }
        } 

        if(methodtype!="GET" && methodtype!="HEAD" && methodtype!="DELETE"){
            if(type==="raw"){
                var bodyContent=$("#body").val()
                fieldsToValidate = {'empty':["body"]}; //No I18n
                isValid = opm_validateFields(fieldsToValidate);
                if(!isValid) {
                    return isValid;
                }  
            }
            else if(type=="form-urlencoded" || type=="form-data"){
                var customList = OPMClient.SettingsConfigurationController.customList;
                for(var j=0;j<customList.length;j++){
                    var key=$("#"+ customList[j].customkey).val();
                    var value=$("#"+customList[j].customval).val();
                    if((key== '' && value!="")||(key!= '' && value=="") || (key=="" && value=="" && j!=customList.length-1)) {
                        fieldsToValidate = {'empty':[customList[j].customkey,customList[j].customval]};
                        isValid = opm_validateFields(fieldsToValidate);
                        if(!isValid) {
                            return isValid;
                        }      
                    }                
                }
            }    
        }
        return true; 
}

function validateCITemplate(){
    if(OPMClient.SettingsNotificationsController.CITemplateId > 0){
        return true;
    }
}

function validateSIEMProfile(){
    var siemObject = OPMClient.SettingsNotificationsController.get("siemObject");
    if((siemObject.productName === "TPI_SIEM" && siemObject.siemEnabled) || (siemObject.productName === "TPI_SPLUNK" && siemObject.splunkEnabled) || (siemObject.productName === "TPI_LOG360" && siemObject.log360Enabled) || (siemObject.productName === "TPI_LOG360CLOUD" && siemObject.log360CloudEnabled)){
        var fieldsToValidate = {'empty':['siem_description','sev_Values','fac_Values']}; //No I18N
        if (OPMClient.SettingsNotificationsController.get("siemObject.isStructured") && Array.isArray(siemObject.structuredData) && siemObject.structuredData.length > 0) {
            $.each(siemObject.structuredData, function(index, value) {
                if (value.customvalue1 == "" && value.customvalue2 != "") {
                    fieldsToValidate.empty.push(value.customkey);
                }else if(value.customvalue1 != "" && value.customvalue2 == ""){
                    fieldsToValidate.empty.push(value.customval);
                }else if(siemObject.structuredData.length == 1 && value.customvalue1 == "" && value.customvalue2 == ""){
                    fieldsToValidate.empty.push(value.customkey);
                    fieldsToValidate.empty.push(value.customval);
                }
            });
        }
        var isValid = opm_validateFields(fieldsToValidate);
        if(isValid){
            return true;
        }else{
            return false;
        }
    }else{
        if(siemObject.productName === "TPI_SIEM"){
            opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.siem.notification.message.missing', this));//No I18n
            return false;
        }else if(siemObject.productName === "TPI_LOG360CLOUD"){//No I18n
            opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.log360cloud.notification.message.missing', this));//No I18n
            return false;
        }else if(siemObject.productName === "TPI_SPLUNK"){//No I18n
            opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.splunk.notification.message.missing', this));//No I18n
            return false;
        }else if(siemObject.productName === "TPI_LOG360"){//No I18n
            opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.log360.notification.message.missing', this));//No I18n
            return false;
        }
    }
}

function validateTrapProfile()
{
    var peername = $("#peername").val();
    var trap_port = $("#trap_port").val();
    var community = $("#trapCommunity").val().trim();
    var varbind = $("#trapVarbind").val();
    var version = $("#version").val();
    var credentialId = $("#v3Credentials").val();
    
    var fieldsToValidate = {'empty':['peername','trap_port','trapVarbind'],'port':['trap_port']};//No I18N
    fieldsToValidate.custom = [{'condition':(trap_port <=0 || trap_port > 65535), 'identifier':'trap_port', 'message':Ember.I18n.t('webclient.admin.forward.porterror',this)}];//No I18N
    if (OPMClient.SettingsAddEditController.operation === true || OPMClient.SettingsAddEditController.pageObj.profileDetails.version !== version) {
        fieldsToValidate.empty.push('trapCommunity'); //No I18N
    }
    if (version === "V3") {
        fieldsToValidate.empty=['peername','trap_port','trapVarbind']; //No I18N
    }
    var isValid = opm_validateFields(fieldsToValidate);
    if (version === "V3" && (credentialId === null || credentialId === "")) {
        alert(Ember.I18n.t("jsp.commonstr.CredentialNotSupplied",this)); //No I18N
        return false;
    }
    if(isValid){
        notificationDetails.typeDetails.trap_port = trap_port;
        if (OPMClient.SettingsAddEditController.operation === true || community !== '') {
            notificationDetails.typeDetails.community = community;
        }
        notificationDetails.typeDetails.varbind = varbind;  
        notificationDetails.typeDetails.peername = peername;    
        notificationDetails.typeDetails.version = version;
        credentialId = credentialId == undefined ? 0 : credentialId;
        notificationDetails.typeDetails.credentialId = credentialId;

        var content = Ember.I18n.t("webclient.admin.forward.destinationhost", this) + " : " + escapeHtmlTags(peername) + "<br/> " + Ember.I18n.t("webclient.admin.forward.destinationport", this) + " : " + trap_port; //No I18n
        setPreviewStr("notificationDetails",content); //No I18n
    }
    return isValid;
}

function validateConfiglet(model){
    var configletId = model.selectedConfiglet;
    if(isNaN(configletId)){
        opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.admin.notification.clientutil.ConfigletSelection', this)); //No I18N
        return false;
    }
    return true;
}

function validateNCMRollback(model){
    var rollbackBaseline = model.rollbackBaseline;
    var rollbackPrevVersion = model.rollbackPrevVersion;

    return true;
}
function returnAsMultipleRow(arr)
{
    var str = "";
    $.each(arr,function(index,name){
        str +=name+'<br/>';//No I18N
    });
    return str;
}
function setPreviewStr(id,content)
{
    $("#"+id).empty().html(content);
}
function setMailVariables()
{
    //var LogaTicketOptions = "";
    var dropDownOptions = "";
    if(dropDownOptions === "")
    {
        var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables"); //No I18n
        OPMClient.SettingsNotificationsController.set('mailVariables',jsonData); //No I18N
        var formattedData = {groups:[],content:[]};
        $.each(jsonData,function(key,values)
        {
            /*var alarmVar = Ember.I18n.t("webclient.admin.profiledetails.message.AlarmVariable",this);//No I18N
            if(key === alarmVar)
            {
                $.each(values,function(kee,val)
                {
                    LogaTicketOptions += "<option value='"+val.value+"'>"+val.key+"</option>"; //No I18n
                });
            }*/
            dropDownOptions += "<optgroup label='"+key+"'>"; //No I18n
            formattedData.groups.push({label:key,value:key});
            $.each(values,function(kee,val)
            {
                dropDownOptions += "<option value='"+escapeHTML(val.value)+"'>"+escapeHTML(val.key)+"</option>"; //No I18n
                formattedData.content.push({label:val.key,value:val.value,group:key});
            });
            dropDownOptions += "</optgroup>"; //No I18n
        });
        OPMClient.SettingsNotificationsController.set('ticketDefaultMsgs',formattedData); //No I18N
    }
    $("#subjecttext").append(dropDownOptions);
    $("#messagetext").append(dropDownOptions);
    $("#sysargumenttext").append(dropDownOptions);
    $("#runargumenttext").append(dropDownOptions);
    $("#sysVartext").append(dropDownOptions);
    $("#modemvariables").append(dropDownOptions);
    $("#varbindtext").append(dropDownOptions);
	$("#ticketTitle").append(dropDownOptions);
    $("#ticketMessage").append(dropDownOptions);
    $("#ansible_runargumenttext").append(dropDownOptions);
    
}
function setMailVariablesForNT()
{
        var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables",{isNotificationTemplate:true}); //No I18n
        OPMClient.SettingsNotificationsController.set('mailVariables',jsonData); //No I18N
        var formattedData = {groups:[],content:[]};
        $.each(jsonData,function(key,values)
        {

            formattedData.groups.push({label:key,value:key});
            $.each(values,function(kee,val)
            {
                formattedData.content.push({label:val.key,value:val.value,group:key});
            });
        });
        OPMClient.SettingsNotificationsController.set('ticketDefaultMsgs',formattedData); //No I18N
    
}
function chooseV3Credential(version) {

    if (version === 'V3'){
        $("#v3Selection").show();
        $("#community").hide();
    }
    else{
        $("#v3Selection").hide();
        $("#community").show();
    }
}
function setProfileMsgtext(frmId,toId)
{
    $('.validateField').removeClass('error');
    var msgtxt = $('#'+toId).val();
    var varibletxt = $('#'+frmId+' option:selected').val(); //No I18N
    if(varibletxt.indexOf("--")!=-1) {
        return false;
    }
    if(toId === 'allocationMessage' || toId === 'allocationSubject') {
        if(varibletxt === "-1") {
            return true;
        }
    }
    if(msgtxt.trim() === "")
    {
        if(toId === 'runarguments' || toId === 'sysCommand') {
            varibletxt = "\""+ varibletxt + "\""; 
        } 
        $("#"+toId).val(varibletxt); //No I18N
        return true;
    }
    else if (msgtxt.indexOf(varibletxt.trim()) !== -1)
    {
        alert(Ember.I18n.t("webclient.admin.profile.varexists",this)); //No I18n
        return false;
    }
    else if(toId === 'runarguments' || toId === 'sysCommand' || toId === "ansible_runarguments"){
        $("#"+toId).val(msgtxt+" \""+varibletxt+"\""); //No I18N
        return true;
    }
    else
    {
        $("#"+toId).val(msgtxt+"\n"+varibletxt); //No I18N
        return true;
    }

}
function validateProfileName(isTestAction)
{
    var toValidate = { 'empty': ['profileName'] };//No I18N
    var name = $('#profileName').val();
    var isValid = opm_validateFields(toValidate);
    if(isValid && !isTestAction && (OPMClient.SettingsAddEditController.operation || 
        (!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.pageObj.profileDetails.name !== name))
        || (!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.fromSnapshotPage
            && OPMClient.SettingsAddEditController.pageObj.criteria.isGlobal === true))        
    {
        var resp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/checkNProfile?name='+encodeURIComponent(name)); //No I18N
        if(resp.error !== undefined)
        {
            $("#profileName").addClass('validateField error');//No I18N
            opm_infoMsgs('errorMsg', resp.error.message); //No I18N
            isValid = false;
        }
    }
    return isValid;
}
function getConstructedData()
{
    var data = ""; //No I18N
    $.each(notificationDetails,function(k,obj){
        $.each(obj,function(name,value){
            if(!((name === "selectedDevicesStr" || name === "selectedURLs") && OPMClient.SettingsAddEditController.fromSnapshotPage)) //No I18N
            {
                if(name==="sysprogram" || name==="sysarguments" || name==="command" || name==="name" || name === "Webhookcustoms"|| name == "alarmMsgContent"){
                    data +="&"+name+"="+encodeURIComponent(value);//No I18N
                }
                else{
                    if(name === "checkedBGPMonitor") {
                        name = "checkedBGPPeerAlarm"; //No I18N
                    }
                    if(name === "selectAllBGPMonitor") {
                        name = "selectAllBGPAlarm"; //No I18N
                    }
                    data +="&"+name+"="+value;//No I18N
                }
            }
        });
    });
    if (!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.pageObj.profileId && OPMClient.SettingsAddEditController.pageAction !== 'copyAs') {
        data += "&profileID=" + OPMClient.SettingsAddEditController.pageObj.profileId; //No I18N
    }
    return data;
}
function enableWebhookIcon(requestValueID,selectboxID){
	$('.propertiesDropdown__icon[id!="'+selectboxID+'"]').removeClass('active');//No I18N
	if($("#"+selectboxID).hasClass("active")){
		$("#"+selectboxID).removeClass("active");//No I18N
	}
	else{
		$("#"+selectboxID).addClass("active");//No I18N
	}
}
function disableWebhookIcon(requestValue,dropdownvalue){
    var value;
     var msgtxt = $("#"+dropdownvalue).val();
   var varibletxt=OPMClient.SettingsConfigurationController.dropvalue.value;
   varibletxt = varibletxt.trim();
   if(dropdownvalue==="hookURL"){
        if(varibletxt!==undefined){
          /*  if(!varibletxt.includes("=")){
               // varibletxt=OPMClient.SettingsConfigurationController.dropvalue.key+"="+varibletxt.trim();
                varibletxt=varibletxt.trim();
            }
            if(!msgtxt.includes("?")&& msgtxt!=""){
                if(isValidURL(msgtxt)){
                 varibletxt="?"+varibletxt;
                }
            }
            else if(msgtxt!=""){
                if(msgtxt.includes("=") && msgtxt.slice(-1)!="&"){
                 varibletxt="&"+varibletxt;
             }
           }*/
           varibletxt=varibletxt;
        }
    }


   if(dropdownvalue==="userAgent" || dropdownvalue==="body"){
     if(msgtxt==""){
         $("#"+dropdownvalue).val(varibletxt);
     }
     else{
        $("#"+dropdownvalue).val(msgtxt+"\n"+varibletxt);
    }
   }
   else if(dropdownvalue ==="hookURL"){
             $("#"+dropdownvalue).val(msgtxt+""+varibletxt);
    }
   else{
        if(msgtxt==""){
            $("#"+dropdownvalue).val(varibletxt);
        }
        else{
         $("#"+dropdownvalue).val(msgtxt+varibletxt);
        }
   }
}
function saveNotificationProfile(url,testAction,testObjNeeded, instance)
{
    var saveNotifFunc = function() {
        var name = $('#profileName').val().trim();    
        var type = OPMClient.SettingsNotificationsController.profileType;
        notificationDetails.basic = {};
        var rsp = "";
        notificationDetails.basic.profileType = type;
        if(!(testAction || testObjNeeded)){
            notificationDetails.basic.name = name;
        }
    
        if((notificationDetails.basic.profileType == "Chat" && OPMClient.SettingsNotificationsController.chatProductName == "MSTeams") || notificationDetails.basic.profileType == "MSTeams"){
                var selectedChannels= OPMClient.SettingsNotificationsController.Teamslist;
                var teamID=$('#MSTeams_Teams').val();
                var channelID=$('#MSTeams_channelsTest').val();
                for(i = 0; i < selectedChannels.length; i++) {
                    if(selectedChannels[i].teamReferenceId == teamID) {
                        notificationDetails.typeDetails.teamReferenceId=selectedChannels[i].id;
                        var channels= selectedChannels[i].channels;
                        for (j = 0; j < channels.length; j++) {
                            if(channels[j].channelReferenceId ==channelID ){
                                notificationDetails.typeDetails.channelReferenceId=channels[j].id;
                            }
                        }
                    }
    
                }
        }
    
        if(type === "Webhook"){
        
                    var methodtype = $("#httpMethod option:selected").attr("value");
               var urlval= $("#hookURL").val().trim();
                   var useragent=$("#userAgent").val();
                    var timeout=$('#timeout').val();
                    var header = OPMClient.SettingsConfigurationController.headerList;
                    var headerparams=[];
                    var headerCount=0;
                    var customCount=0;
                    for(var j=0;j<header.length;j++){
                             var key=$("#"+ header[j].RequestName).val().trim();
                         var value=$("#"+ header[j].RequestValue).val().trim();
                             if(key!= '' && value!= ''){
                                headerparams[headerCount] ={ "key": escape(key),"value": escape(value)};//No I18N
                                headerCount++;
                             }
                    }
                    var type = $('input[name="DATATYPE"]:checked').val();
                    var formatType = $("#format option:selected").attr("value");
                    var customparams=[];
                    if(type === "raw"){
                                   key="Body-content";//No I18N
                               value=$("#body").val().trim();
                                   length=customparams.length;
                                   customparams[length]={ "type":type,"key": key,"value": value};//No I18N
    
    
                            }
    
                    if(methodtype!= "GET" && methodtype!= "HEAD" && methodtype!= "DELETE"){
                        var customList = OPMClient.SettingsConfigurationController.customList;
                         for(var j=0;j<customList.length;j++){
                             var key=$("#"+ customList[j].customkey).val().trim();
                         var value=$("#"+ customList[j].customval).val().trim();
                             if(key!= '' && value!='' && type!= "raw"){
                             customparams[customCount] ={ "type":type,//No I18N
                                            "key": key,//No I18N
                                           "value": value};//No I18N
                                customCount++;
                            }
                        }
                    }
                    notificationDetails.basic.Webhookmethodtype=methodtype;
                    notificationDetails.basic.Webhookurl=escape(urlval);
                    notificationDetails.basic.Webhookuseragent=useragent;
                    notificationDetails.basic.Webhooktimeout=timeout;
                    notificationDetails.basic.Webhookheaders=JSON.stringify(headerparams);
                    notificationDetails.basic.Webhookcustoms=JSON.stringify(customparams);
    
        }
    
        if(type === "CITemplate"){
            notificationDetails.basic.templateId=OPMClient.SettingsNotificationsController.CITemplateId;
        }
        if(type === "SIEM"){
            var siemObject = OPMClient.SettingsNotificationsController.get("siemObject");
            notificationDetails.basic.productName = siemObject.productName;
            notificationDetails.basic.isStructured = siemObject.isStructured;
            if($('#rfc-3164').is(':checked')){
                notificationDetails.basic.format = "3164"; //No I18N
                notificationDetails.basic.isStructured = false;
            }else{
                notificationDetails.basic.format = "5424"; //No I18N
            }
            var structuredData = [];
            if(notificationDetails.basic.isStructured){
                if (Array.isArray(siemObject.structuredData) && siemObject.structuredData.length > 0) {
                    structuredData = siemObject.structuredData
                        .filter(function(item) {
                            return !(item.customvalue1 === "" && item.customvalue2 === "");
                        })
                        .map(function(item) {
                            return {
                                key: item.customvalue1,
                                value: item.customvalue2
                            };
                        });
                }
            }
            notificationDetails.basic.structuredData = JSON.stringify(structuredData);
            notificationDetails.basic.severity = siemObject.severity;
            notificationDetails.basic.facility = siemObject.facility;
            // notificationDetails.basic.structuredData = siemObject.structuredData;
            notificationDetails.basic.rawMessage = siemObject.message;
        }
            // if(testObjNeeded){
            //     var response = OPMClient.SettingsNotificationsController.CITemplateDetails;
            //     if(response.addWebhook != undefined){
            //         if(response.addWebhook.Webhookcustom!=undefined){
            //             notificationDetails.basic.Webhookcustoms= JSON.stringify(response.addWebhook.Webhookcustom);
            //         }
            //         if(response.addWebhook.Webhookuseragent != undefined){
            //             notificationDetails.basic.Webhookuseragent=response.addWebhook.Webhookuseragent;
            //         }
            //         if(response.addWebhook.webhookheaders!=undefined){
            //             notificationDetails.basic.Webhookheaders = JSON.stringify(response.addWebhook.webhookheaders);
            //         }
            //         if( response.addWebhook.webhookmethodtype != undefined){
            //             notificationDetails.basic.Webhookmethodtype= response.addWebhook.webhookmethodtype;
            //         }
            //         if( response.addWebhook.webhooktimeout != undefined){
            //             notificationDetails.basic.Webhooktimeout=response.addWebhook.webhooktimeout;
            //         }
            //         if( response.addWebhook.webhookurl != undefined){
            //             notificationDetails.basic.Webhookurl=response.addWebhook.webhookurl;
            //         }
            //         if(response.addWebhook.webhookAuth !=undefined){
            //             notificationDetails.basic.webhookAuth=JSON.stringify(response.addWebhook.webhookAuth);
            //         }
            //         delete notificationDetails.basic.templateId;
    
            //     }
            // }        var testDataParams = setRequestParams('',testData);

        if(OPMClient.SettingsAddEditController.fromSnapshotPage && OPMClient.SettingsAddEditController.fromAlarmsPage) {
            notificationDetails.basic.deviceName = OPMClient.AlarmDetailsController.alarmDetails.source;
        }   else if(OPMClient.SettingsAddEditController.fromSnapshotPage){
            notificationDetails.basic.deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
        }
        if(testObjNeeded){
            var testData = $.extend(true,{},notificationDetails.basic);
            if(type === "CITemplate" && testObjNeeded && testData.deviceName!= undefined){
                delete testData.deviceName;
            }
            $.extend(true,testData,notificationDetails.typeDetails);
            if(!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.pageObj.profileId && OPMClient.SettingsAddEditController.pageAction !== 'copyAs'){
                testData.profileID = OPMClient.SettingsAddEditController.pageObj.profileId;
            }
            var testDataParams = setRequestParams('',testData);
            testDataParams = testDataParams.substr(1,testDataParams.length);
            if(notificationDetails.basic.profileType == "Webhook"){
                testDataParams = testData;
                    testDataParams.Webhookurl = $("#hookURL").val().trim();
            }
            OPMClient.SettingsAddEditController.set('notificationTestData',testDataParams);//No I18N
            if(testAction){
                doTestAction(url,testDataParams, instance);
            }
            return;
        }
        opm_ajaxPostMethod(url,getConstructedData(),{callback:function(postResponse){
            if(postResponse !== undefined){
                rsp = postResponse;
                if(postResponse.result !== undefined || postResponse.message !== undefined){
                    if(!$.isEmptyObject(OPMClient.ReportsDetailsController.scheduleDefaultProps))
                    {
                        OPMClient.ReportsDetailsController.scheduleDefaultProps.profileList[rsp.profileId]=rsp.profileName;
                    }
                    if(OPMClient.SettingsAddEditController.fromGroupSnapshotPage) {
                        showMessage(rsp,'deviceSlideOut',4); //No I18N
                        location.href = "#/Inventory/Snapshot/"+(OPMClient.SettingsAddEditController.fromIntfGroupSnapshotPage ? "LogicalIntfGroup" : "LogicalDeviceGroup") +"/" + OPMClient.SettingsAddEditController.fromGroupSnapshotPageGrpName + "/Notification";
                    } 
                    else if(OPMClient.SettingsAddEditController.fromAlarmsPage && OPMClient.SettingsAddEditController.fromSnapshotPage){
                        OPMClient.AlarmOptionsController.set('isConfigNotification',false);//No I18N
                        showMessage(rsp,'deviceSlideOut',4);//No I18N
                        redirectToDeviceSnapshot(notificationDetails.basic.deviceName,'Notification','MonitoringDevice');//No I18N
                        //opm_transitionToTheRoute(window.OPM.currentView.name); //No I18N
                    }
                    else if(!OPMClient.SettingsAddEditController.fromSnapshotPage){
                        slideSuccessHandler(rsp,"","","Settings.Notification"); //No I18N
                    }else{
                    showMessage(rsp); 
                        redirectToDeviceSnapshot(OPMClient.InventoryDeviceDetailsController.deviceName,'Notification','MonitoringDevice');//No I18N
                    }
                }else if(postResponse.error.message != undefined){
                    opm_infoMsgs("errorMsg", postResponse.error.message); //No I18N
                }
            }
        },otpPageType:'slide'});//No I18N
    }
    var proceedWithSave = function() {
        if(!testAction && !testObjNeeded && !OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.fromGroupSnapshotPage) {
            opmConfirm("",Ember.I18n.t("webclient.group.notifications.global.savechanges"),"",function(){
                saveNotifFunc();
            },"","","","","dialogStyle2");
        } else {
            saveNotifFunc();
        }
    };
    var goBackToTypeConfigPage = function(typeToRestore) {
        var currentStepId = $('.nfProfilePage:visible').attr('id');//No I18N
        if(currentStepId !== undefined && currentStepId !== null && currentStepId.indexOf('input') === 0) {//No I18N
            var currentStep = currentStepId.replace('input', '');//No I18N
            if(currentStep !== "1") {//No I18N
                goForwardOrBackward(currentStep,"1","bwd");//No I18N
            }
        }
        if(typeToRestore === 'event') {//No I18N
            $('#snowTicketType_event').prop('checked', true).trigger('change');//No I18N
        } else if(typeToRestore === 'incident') {//No I18N
            $('#snowTicketType_incident').prop('checked', true).trigger('change');//No I18N
        }
    };
    // Confirmation dialog when SNOW profile type changes (Incident <-> Event) during update
    if(!testAction && !testObjNeeded && !OPMClient.SettingsAddEditController.operation && OPMClient.SettingsNotificationsController.helpDeskProductName === "serviceNow" && OPMClient.SettingsAddEditController.get('originalSnowTicketType') !== null && OPMClient.SettingsAddEditController.get('originalSnowTicketType') !== undefined){//No I18N
        var currentSnowType = $('input[name="snowTicketType"]:checked').val() || "incident";//No I18N
        var originalSnowType = OPMClient.SettingsAddEditController.get('originalSnowTicketType');//No I18N
        if(currentSnowType !== originalSnowType){
            opmConfirm("",Ember.I18n.t("webclient.servicenow.np.profiletype.change.confirm"),"",function(){//No I18N
                proceedWithSave();
            },Ember.I18n.t('webclient.topo.objectdetails.managed.yes'),function(){//No I18N
                goBackToTypeConfigPage(originalSnowType);
            },Ember.I18n.t('webclient.topo.objectdetails.managed.no'),"","dialogStyle2");//No I18N
        } else {
            proceedWithSave();
        }
    } else {
        proceedWithSave();
    }
    return;
}
function doTestAction(url,data, instance){
    var type = OPMClient.SettingsNotificationsController.profileType;
    OPMClient.ApplicationController.set('testActionSuccess', undefined);//No I18N
    if(type === 'Web Alarm'){
        var webAlarm = {entity:'true',soundFile:notificationDetails.typeDetails.soundFile};//No I18N
        playSoundForWebAlarm(webAlarm);
    }else{
        if(type == "Run Program" || type == "Run System Command") {
            $('.cmdOutput').removeClass('block');
            $('.testActionNp').addClass("disabledBlock");
            var viewID = Date.now();
            OPMClient.SettingsNotificationsController.currentInstanceID = viewID;
        }
        opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT', this),{callback:function(postResponse){//No I18N
            if((type == "Run Program" || type == "Run System Command") && OPMClient.SettingsNotificationsController.currentInstanceID !== viewID) {
                return false;
            } else {
                $('.testActionNp').removeClass("disabledBlock");
                var profileTypeKey = OPMClient.SettingsNotificationsController.profileType;
                if(profileTypeKey == "CITInternal" || profileTypeKey == "SDPMSPOD" || profileTypeKey == "SDPOnDemand"){
                  profileTypeKey = "Log a Ticket";//No I18N
                 }
                if(postResponse !== undefined && OPMClient.SettingsNotificationsController.currentInstance == instance && (!OPMClient.SettingsAddEditController.operation || profileTypeKey == $('.NotifyProfile li.active').data('value'))){
                    if(postResponse.result !== undefined && postResponse.result.message !== undefined){
                        slideSuccessHandler(postResponse,"","",""); //No I18N
                    }else if(postResponse.Message !== undefined){
                            opm_infoMsgs('successMsg',postResponse.Message); //No I18N
                    }
                    else{
                        showMessage(postResponse);
                    }
                    OPMClient.SettingsNotificationsController.set('currentInstanceID', undefined); //No I18n
                if((type == "Run Program" || type == "Run System Command") && postResponse.Response) {
                        OPMClient.ApplicationController.set('testActionSuccess', postResponse.Response);//No I18N
                        if(OPMClient.ApplicationController.testActionSuccess) {
                            $('.cmdOutput').addClass('block');
                            $('.copySvg').show();
                            $('.tickSvg').hide(); 
                        }
                        $('.command_copy').on('click', function() {
                            var step = this.id;
                            $('.tickCommand_'+step).show(); 
                            $('.copyCommand_'+step).hide();
                            $('#code_commandOutput_'+step).text(postResponse.Response);
                            $('#code_commandOutput_'+step).show();
                            opm_CopyToClipBoard('#code_commandOutput_'+step);//No I18N
                            $('#code_commandOutput_'+step).hide();
                        });
                    }
                }
            }
        },otpPageType:'slide'});//No I18N
    }
}
function deleteNotificationProfile(profileID)
{
    if(confirm(Ember.I18n.t("webclient.admin.notification.areusure",this)))
    {
        showMessage(opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/deleteNotificationProfile?ID="+profileID,"")); //No I18n
          if(!$.isEmptyObject(OPMClient.ReportsDetailsController.scheduleDefaultProps))
                        {   
                             delete OPMClient.ReportsDetailsController.scheduleDefaultProps.profileList[profileID];  
                        }
        opm_loadNotificationGrid();
    }
}
function setProfileDetails(details,productName)
{
    var profileType = details.profileDetails.type;
    if(profileType == "CITInternal" && details.profileDetails.templateType != undefined && details.profileDetails.templateType=="INCIDENT" ){
        profileType = "Log a Ticket";//No I18N
    }
    var profileTypeDisplayName = {"Send Email":Ember.I18n.t('webclient.admin.profiledetails.sendemail',this),"Send SMS":Ember.I18n.t('webclient.admin.profiledetails.sendemailsms',this),"Send Modem SMS":Ember.I18n.t('webclient.admin.profiledetails.sendsms',this),"Run System Command":Ember.I18n.t('webclient.admin.profiledetails.runsystemcommand',this),"Run Program":Ember.I18n.t('webclient.admin.profiledetails.runprogram',this),"Log a Ticket":Ember.I18n.t('webclient.admin.profiledetails.LogaTicket',this),"Web Alarm":Ember.I18n.t('webclient.admin.profiledetails.WebAlarm',this),"Send SysLog":Ember.I18n.t('webclient.admin.profiledetails.syslog',this),"Send Trap":Ember.I18n.t('webclient.admin.profiledetails.trap',this),"Chat":Ember.I18n.t('webclient.notificationprofile.chat.title',this), "SDPOnDemand":Ember.I18n.t('webclient.admin.profiledetails.LogaTicket',this),"SDPMSPOD":Ember.I18n.t('webclient.admin.profiledetails.LogaTicket',this),"Webhook":Ember.I18n.t('webclient.admin.notification.clientutil.InvokeAWebhook',this),"MSTeams":Ember.I18n.t('webclient.notificationprofile.chat.title',this),"Ansible":Ember.I18n.t('webclient.ansible.integ',this),"CITemplate":Ember.I18n.t('webclient.opm.tpi.tagname.customintegration',this),"SIEM":Ember.I18n.t('webclient.siem.siem',this)};//No I18N
    if(OPMClient.SettingsAddEditController.pageAction !== 'copyAs')
    {
        $('#nProfileTitle').text(details.profileDetails.name+" ( "+profileTypeDisplayName[profileType]+" )");//No I18N
    }else{
        $('#nProfileTitle').text(details.profileDetails.name+"- "+Ember.I18n.t("button.Copy",this)+" - ("+profileTypeDisplayName[profileType]+")");//No I18N
    }
    setPreviewStr("nofificationType", profileTypeDisplayName[profileType]); //No I18n

    $('.profileTypes').hide();
    if(profileType === "Run System Command")
    {
        $('.systemPro').show();
        if(details.profileDetails.append === "true"){
            $("#append").prop("checked",true);
        }if(details.profileDetails.errappend === "true"){
            $("#errappend").prop("checked",true);
        }
        $("#sysCommand").text(details.profileDetails.command);  //No I18n
    }
    else if (profileType === "Run Program")
    {
        $('.runPro').show();
        $("#runprogram").val(details.profileDetails.sysprogram);  //No I18n
        $("#runarguments").text(details.profileDetails.sysarguments);  //No I18n
    }
    else if (profileType === "Send Email")
    {
        $('.emailPro').show();
        $("#emailMessage").text(details.profileDetails.message);  //No I18n
        $("#emailSubject").val(details.profileDetails.subject);  //No I18n
        $('input[name="MAILFORMAT"][value='+details.profileDetails.MAILFORMAT+']').prop("checked",true);
        $("#fromAddress").val(details.profileDetails.fromAddress);  //No I18n
        $("#toAddress").val(details.profileDetails.toAddress);  //No I18n
        $('#enableEditEmail').prop('checked', details.profileDetails.isDefaultFromAddress == "true" ? true: false);
        details.profileDetails.isDefaultFromAddress == "true" ? ($('#fromAddress').prop('disabled', true),$("#fromAddress").val("$defaultFromAddress")) : ($('#fromAddress').prop('disabled', false),$("#fromAddress").val(details.profileDetails.fromAddress)); 
        if (details.profileDetails.ccAddress !== undefined && details.profileDetails.ccAddress !== ""){
            $('#ccDiv').show();
            $('#addCC').text(Ember.I18n.t('webclient.notifyprofile.email.removecc', this)); //No I18N
            $('#ccAddress').val(details.profileDetails.ccAddress);
        }
    }
    else if (profileType === "Send SMS")
    {
        $('.smsPro').show();
        $("#emailMessage").text(details.profileDetails.message);  //No I18n
        $("#emailSubject").val(details.profileDetails.subject);  //No I18n
        $("#fromAddress").val(details.profileDetails.fromAddress);  //No I18n
        $("#toAddress").val(details.profileDetails.toAddress);  //No I18n  //No I18n
        $('#enableEditEmail').prop('checked', details.profileDetails.isDefaultFromAddress == "true" ? true: false);
        details.profileDetails.isDefaultFromAddress == "true" ? $('#fromAddress').prop('disabled', true) : $('#fromAddress').prop('disabled', false); 
    }
    else if (profileType === "Send Modem SMS") {
        changeProfileType(profileType);
        $('.modemPro').show();
        if (details.profileDetails.gateway === "OPMApp") { //No I18N
           showAppSmsAlertMsg(true);
        } else if (details.profileDetails.gateway === "Custom") { //No I18N
            $('#smsgateway').val('Custom').trigger('change');
        } else if (details.profileDetails.gateway === "SMPP") { //No I18N
            $('#smsgateway').val('smpp').trigger('change');
        } 
        else if ($.inArray(details.profileDetails.gateway, OPMClient.SettingsAddEditController.inBuiltSMSGatewayNames) !== -1) {
            $('#smsgateway').val(details.profileDetails.gateway).trigger('change');
        } else {
            $('#smsgateway').val('').trigger('change');
        }
        $("#toNumber").val(details.profileDetails.toNumber);
        $("#modemMessage").text(details.profileDetails.message);
    }
    else if (profileType === "Web Alarm")
    {
        $('.webPro').show(); 
        $('#notificationProfileForm .testAction_profile').hide();
        changeProfileType(profileType);       
    }
    else if (profileType === "Send SysLog")
    {
        $('.syslogPro').show();
        $("#sysLogHost").val(details.profileDetails.sysLogHost);  //No I18n
        $("#sysLogPort").val(details.profileDetails.sysLogPort);  //No I18n
        $("#sysFacility").select2().val(details.profileDetails.facility).trigger("change");//No I18n
        $("#sysSeverity").select2().val(details.profileDetails.severity).trigger("change");//No I18n
        $("#sysVariables").text(details.profileDetails.variables);
    }
    else if (profileType === "Send Trap")
    {
        $('.trapPro').show();
        $("#trap_port").val(details.profileDetails.trap_port);  //No I18n
        //$("#trapCommunity").val(details.profileDetails.community);  //No I18n
        $("#trapVarbind").text(details.profileDetails.varbind);  //No I18n
        $("#peername").val(details.profileDetails.peername);  //No I18n
        $("#version").select2().val(details.profileDetails.version).trigger("change");//No I18n
        $("#v3Credentials").val(details.profileDetails.credentialId).select2();  //No I18n
    }
    else if (profileType === "Log a Ticket" || profileType === "SDPMSPOD")
    {
        $('.logPro').show();
    }
    else if(profileType === "Ansible"){
        $(".AnsiblePro").show();
    }
    else if (profileType === "Webhook")
    {
        $('.webhookPro').show();
        $('#httpMethod').val(details.profileDetails.Webhookmethodtype).trigger('change');
        $("#hookURL").val(details.profileDetails.Webhookurl);
        $('#timeout').val(details.profileDetails.Webhooktimeout);
        $('#userAgent').val(details.profileDetails.Webhoookuseragent);

        var headerlist = JSON.parse(details.profileDetails.Webhookheaders);
        var customlist=JSON.parse(details.profileDetails.Webhookcustom);
        var datatype="";
        var len=headerlist.length;
        if(customlist.length>0){
            datatype=customlist[0].type;
        }
        else if(headerlist.length>0){
            for (var i = 0; i < headerlist.length; i++) {
                if(headerlist[i].key === "Content-Type" && (headerlist[i].value === "multipart/form-data" || headerlist[i].value === "application/x-www-form-urlencoded") && details.profileDetails.Webhookmethodtype!= "GET" && details.profileDetails.Webhookmethodtype!= "HEAD" && details.profileDetails.Webhookmethodtype!= "DELETE"){
                    datatype = (headerlist[i].value).substring(headerlist[i].value.indexOf('f'));
                    break;
                }
            }
        }
        if(datatype === "raw"){
            for(j=0;j<headerlist.length;j++){
                    if(headerlist[j].key === "Content-Type"){
                         var formatType=headerlist[j].value;
                         var value= (formatType === "text/plain" ? "Text" : formatType === "application/xml" ? "XML" : formatType === "application/json" ? "JSON" : formatType === "application/javascript" ? "JavaScript" : formatType === "text/html"? "HTML" :"NONE");//No I18N
                         $('#format').val(value).trigger('change');
                    }
            }
            $('#body').val(customlist[0].value);
        }
        else if(datatype.trim()!= ""){
           $('#formatselect').css({'display':'none'});
            $('#bodycontent').css({'display':'none'});
            $('#hidden').css({'display':'block'});
            $('#heading').css({'display':'block'});
             $('input[name="DATATYPE"][value='+datatype+']').prop("checked",true);
        }
        else if(details.profileDetails.Webhookmethodtype!= "GET" && details.profileDetails.Webhookmethodtype!= "HEAD" && details.profileDetails.Webhookmethodtype!= "DELETE"){
            $('#formatselect').css({'display':'none'});
            $('#bodycontent').css({'display':'none'});
            $('#hidden').css({'display':'block'});
            $('#heading').css({'display':'block'});
             $('input[name="DATATYPE"][value='+"form-data"+']').prop("checked",true);
        }

       var header = [];
       var count=-1;
       var iconvalue;
       if(headerlist.length==1 && headerlist[0].key=="Content-Type"){
            count=count+1;
            header.pushObject({
                            index:count,
                            RequestName: "RequestName"+count,//No I18n
                            RequestValue: "RequestValue"+count,//No I18n
                            addIcon:"addIcon"+count,//No I18n
                            value1:headerlist[0].key,
                            value2:headerlist[0].value,
                            Iconvalue:false,
                            dropdownValue:"dropdownValue"+count,//No I18N
                            webhookRequestValue:"webhookRequestValue"+count,//No I18N
                            webhookSelectBox:"webhookSelectBox"+count//No I18N
                        });
            count=count+1;
                 header.pushObject({
                            index:count,
                            RequestName: "RequestName"+count,//No I18n
                            RequestValue: "RequestValue"+count,//No I18n
                            addIcon:"addIcon"+count,//No I18n
                            value1:"",
                            value2:"",
                            Iconvalue:true,
                            dropdownValue:"dropdownValue"+count,//No I18N
                            webhookRequestValue:"webhookRequestValue"+count,//No I18N
                            webhookSelectBox:"webhookSelectBox"+count//No I18N
         });
        }
      else if(headerlist.length>0){
        for(j=0;j<headerlist.length;j++){
            if(j<headerlist.length-1){
                iconvalue=false;
            }
            else{
                iconvalue=true;
            }
            count=count+1;
            header.pushObject({
                            index:count,
                            RequestName: "RequestName"+count,//No I18n
                            RequestValue: "RequestValue"+count,//No I18n
                            addIcon:"addIcon"+count,//No I18n
                            value1:headerlist[j].key,
                            value2:headerlist[j].value,
                            Iconvalue:iconvalue,
                            dropdownValue:"dropdownValue"+count,//No I18N
                            webhookRequestValue:"webhookRequestValue"+count,//No I18N
                            webhookSelectBox:"webhookSelectBox"+count//No I18N
                        });

        }
    }
     else{
            count=count+1;
                 header.pushObject({
                            index:count,
                            RequestName: "RequestName"+count,//No I18n
                            RequestValue: "RequestValue"+count,//No I18n
                            addIcon:"addIcon"+count,//No I18n
                            value1:"",
                            value2:"",
                            Iconvalue:true,
                            dropdownValue:"dropdownValue"+count,//No I18N
                            webhookRequestValue:"webhookRequestValue"+count,//No I18N
                            webhookSelectBox:"webhookSelectBox"+count//No I18N
         });
        }
        OPMClient.SettingsConfigurationController.set("headerList",header);//No I18n
        OPMClient.SettingsConfigurationController.set('count',count);//No I18n

       var custom=[];
       var customcount=-1;
       var customiconvalue;
        if(customlist.length ==0 ||(customlist.length ==1 && customlist[0].key =="Body-content")){
                customcount=customcount+1;
                    custom.pushObject({
                                       value:customcount,
                                        keyvalue:"keyvalue"+customcount,//No I18n
                                        customkey: "customkey"+customcount,//No I18n
                                        customval: "customval"+customcount,//No I18n
                                        addButton:"addButton"+customcount,//No I18n
                                        customvalue1:"",
                                        customvalue2:"",
                                        customIconvalue:true,
                                        dropdownlist:"dropdownlist"+customcount,//No I18N
                                        webhookCustomValue:"webhookCustomValue"+customcount,//No I18N
                                        customSelectBox:"customSelectBox"+customcount//No I18N
             });
        }
        else if(customlist.length>0){
        for(j=0;j<customlist.length;j++){
            if(j<customlist.length-1){
                customiconvalue=false;
            }
            else{
                customiconvalue=true;
            }
            customcount=customcount+1;
            custom.pushObject({
                                    value:customcount,
                                    keyvalue:"keyvalue"+customcount,//No I18n
                                    customkey: "customkey"+customcount,//No I18n
                                    customval: "customval"+customcount,//No I18n
                                    addButton:"addButton"+customcount,//No I18n
                                    customvalue1:customlist[j].key,
                                    customvalue2:customlist[j].value,
                                    customIconvalue:customiconvalue,
                                    dropdownlist:"dropdownlist"+customcount,//No I18n
                                    webhookCustomValue:"webhookCustomValue"+customcount,//No I18n
                                    customSelectBox:"customSelectBox"+customcount//No I18n
                        });

        }

        }
       
        OPMClient.SettingsConfigurationController.set("customList",custom);//No I18n
        OPMClient.SettingsConfigurationController.set('customcount',customcount);//No I18n
    }
    else if(profileType === "Chat"){
        $('.chatPro').show();
    }
    else if(profileType === "MSTeams"){
        $('.chatPro').show();
        $("#slackmenu").addClass("noActive");
        $("#MSTeamsmenu").addClass("active");
    }
    if(OPMClient.SettingsAddEditController.pageAction !== 'copyAs'){
        if(!OPMClient.SettingsAddEditController.operation && OPMClient.SettingsAddEditController.fromSnapshotPage && 
            OPMClient.SettingsAddEditController.pageObj.criteria.isGlobal === true) {
                $('#profileName').val((OPMClient.SettingsAddEditController.pageObj.profileName+'_'+OPMClient.InventoryDeviceDetailsController.displayName).substring(0,100));
        }
        else {
            $('#profileName').val(OPMClient.SettingsAddEditController.pageObj.profileName);
        }        
    }else{
        $('#profileName').val(OPMClient.SettingsAddEditController.pageObj.profileName+"- copy");
    }
    if(details && details.profileDetails && details.profileDetails.associationtype) {
        $("input[name='profileAssociationType'][value='"+details.profileDetails.associationtype+"']").prop("checked", true).trigger("change"); //No I18n
    }
}
function setEditProfileCriDetails(isFrmWf, isFrmDeviceSnapshot)
{
    var editObj = OPMClient.SettingsAddEditController.pageObj;
    if(isFrmWf) {
        if(isFrmDeviceSnapshot) {
            //Device snaphot criterias & severities.
            var criteriaList = editObj.criteriaList;
            var severities = editObj.severities;
        } else {
            var criteriaList = editObj.criteria.criteriaProp.criteriaList;
            var severities = editObj.criteria.criteriaProp.severities;
        }
    } else {
        var criteriaList = editObj.criteria.criteriaList;
        var severities = editObj.criteria.severities;
    }
    var monName = "";
    $.each(criteriaList,function(k,v)
    {
        if(v){

            if(k === "STATUSPOLL")
            {
                monName = "devicemissespolls"; //No I18N
            }
            if(k === "HARDWAREMONITOR")
            {
                monName = "hardwareMonitor";//No I18n
            }
            if(k === 'CLEAR')
            {
                monName = "clearalarm"; //No I18n
            }
            if(k === 'URL')
            {
                monName = "url";//No I18n
            }
            if(k === 'INTF')
            {
                monName = "interfaces";//No I18n
            }
            if(k === "INTFMONITORTYPE") {
                monName = "interfaceMonTypes";//No I18n
            }
            if(k === "AGENTDOWN")
            {
                monName = "agent";//No I18n
            }
            if(k === "THRESHOLD")
            {
                monName = "threshold";//No I18n
            }
            if(k === "SERVICE")
            {
                monName = "services";//No I18n
            }
            if(k === "WINSERVICE")
            {
                monName = "ntServices";//No I18n
            }
            if(k === "EVENTLOG")
            {
                monName = "eventlog";//No I18n
            }
            if(k === "SYSLOG")
            {
                monName = "syslog";//No I18n
            }
            if(k === "SCRIPTMONITOR")
            {
                monName = "scriptMonitors";//No I18n
            }
            if(k === "PROCESSMONITOR")
            {
                monName = "processMonitors";//No I18n
            }
            if(k === "FILEMONITOR")
            {
                monName = "fileMonitors";//No I18n
            }
            if(k === "FOLDERMONITOR")
            {
                monName = "folderMonitors";//No I18n
            }
            if(k === "VIRTUALDEVICEMONITOR")
            {
                monName = "virtualDeviceMonitor";//No I18n
            }
            if(k === "TRAP")
            {
                monName = "snmpTrap";//No I18n
            }
            if(k === "NCMBACKUP")
            {
                monName = "configBackup";//No I18n
            }
            if(k === "NCMCONFIGCHANGES")
            {
                monName = "configChange";//No I18n
            }
            if(k === "NFAALARM")
            {
                monName = "nfaAlarm";//No I18n
            }
            if(k === "EXCHANGEMONITOR")
            {
                monName = "exchangeMonitors";//No I18n
            }
            if(k === "EXCHANGESERVICE")
            {
                monName = "exchangeServices";//No I18n
            }
            if(k === "MSSQLSERVICE")
            {
                monName = "mssqlServices";//No I18n
            }
            if(k === "MSSQLMONITOR")
            {
                monName = "mssqlMonitors";//No I18n
            }
            if(k === "ADMONITOR")
            {
                monName = "adMonitors";//No I18n
            }
            if(k === "ADSERVICE")
            {
                monName = "adServices";//No I18n
            }
            if(k === "PRINTERMONITOR")
            {
                monName = "printersMonitors";//No I18n
            }
            if(k === "UPSMONITOR")
            {
                monName = "upsMonitors";//No I18n
            }
            if(k === "IPSLAMONITOR")
            {
                monName = "ipslaMonitors";//No I18n
            }
            if(k === "PROBEDOWN")
            {
                monName = "probe";//No I18n
            }
            if(k === "CLEAR")
            {
                monName = "clearalarm";//No I18n
            }
            if (k === "UCSFAULT")
            {
                monName = "ucsMonitor";//No I18n
            }
            if(k === "STORAGEALARM") {
                monName = "storageAlarm"; //No I18n
            }
            if(k === "BANDWIDTHEXCEEDED") {
                monName = "BandwidthExceeded"; //No I18n
            } 

            if(k === "LOADBALANCERALARM"){//No I18n
                monName = "lbAlarm"; //No I18n
            } 
            if(k === "BGPPEERALARM") {
                monName = "BGPMonitor"; //No I18n
            }
            if(k === "ALARMMESSAGE") {
                monName = "alarmMsg"; //No I18n
            }
            $.each(OPMClient.SettingsNotificationsController.criteriaGrid, function(i,val){
                if(val.monitorName===monName){
                    OPMClient.SettingsNotificationsController.criteriaGrid[i].isSelected="true";
                }
            });
        }
    });
    $('input[name="notifySeverity"]').prop('checked',false);//No I18N
    if(severities !== undefined){
        $.each(severities,function(k,v){
            $('input[name="notifySeverity"][value="'+k+'"]').prop('checked',true);//No I18N
        });
    }
}
function setSelectedCriterias()
{
    var mygrid =  'profileCriteria'; //No I18N
    $.each(OPMClient.SettingsNotificationsController.selectedEditCriteria,function(k,v)
    {
        if(v !== undefined && v !== ""){
            for(var r in row)
            {
                var data = $('#'+mygrid).jqGrid('getRowData',row[r]);
                 if(data.monitorName === v)
                 {
                    $('#'+mygrid).jqGrid('setSelection', r, true);//No I18N
                 }
            }
        }
    });
}
function setTimeWindowDetails()
{
    var data = OPMClient.SettingsAddEditController.pageObj;
    if(data.timeWindow.twoption === "Timewindow")
    {
        $("[name='twoption'][value='Timewindow']").prop("checked",true);
        if(data.timeWindow.sunday && data.timeWindow.monday && data.timeWindow.tuesday && data.timeWindow.wednesday && data.timeWindow.thursday && data.timeWindow.friday && data.timeWindow.saturday){
            $('.npDTDays').prop('checked',true);
        }else{
            $("#monday").prop("checked",data.timeWindow.monday);
            $("#tuesday").prop("checked",data.timeWindow.tuesday);
            $("#wednesday").prop("checked",data.timeWindow.wednesday);
            $("#thursday").prop("checked",data.timeWindow.thursday);
            $("#friday").prop("checked",data.timeWindow.friday);
            $("#saturday").prop("checked",data.timeWindow.saturday);
            $("#sunday").prop("checked",data.timeWindow.sunday);
        }
        
        var starttime = data.timeWindow.starttime.split(":");
        $("#startHour").val(starttime[0]);
        $("#startMinute").val(starttime[1]);

        var endtime = data.timeWindow.endtime.split(":");
        $("#endHour").val(endtime[0]);
        $("#endMinute").val(endtime[1]);

        $("#startHour").trigger('change');
        $("#startMinute").trigger('change');
        $("#endHour").trigger('change');
        $("#endMinute").trigger('change');
        opm_setDisplayShowHideDiv('timeWindowDiv','block');//No I18n
    }
    else
    {
        $("[name=twoption][value=All]").prop("checked",true);
    }
    setRecurringDetails(data.recurring);
}
function setRecurringDetails(recurring)
{
    if(recurring !== undefined)
    {
        if(recurring.delayAck !== undefined)
        {
            $("#delayAck").prop("checked",recurring.delayAck);
        }
        if(recurring.triggerInterval !== undefined)
        {
            $("#triggerInterval").val(recurring.triggerInterval/60000);
        }
        if(recurring.delayInterval !== undefined)
        {
            $("#delayInterval").val(recurring.delayInterval/60000);
        }
        if(recurring.triggerAck !== undefined)
        {
            $("#triggerAck").prop("checked",recurring.triggerAck);
        }
        if(recurring.triggerCount !== undefined && recurring.triggerCount > 0)
        {
            $("#tcount").prop("checked",true);
            $("#triggerCount").val(recurring.triggerCount);
            enableTriggerCount(false);
        }
    }
}
function enableTriggerCount(enabled){
    $('#triggerCount').prop('disabled',enabled);
}

function setNotifySeverityCriteria(allowSave)
{
    var notifySeverity = "";//No I18N
    notificationDetails.Criteria = {};
    
    var notifySevObj = $("[name=notifySeverity]:checked"); //No I18N
    if(notifySevObj.length <=0){
        if(allowSave) {
            goForwardOrBackward("1","2","fwd");
        }
        $('.opmFormHolder-FixedBtnBottom').animate({
            scrollTop: $('[name=notifySeverity]').offset().top
        }, 'slow');//No I18N
        setTimeout(function(){alert(Ember.I18n.t('webclient.admin.syslogrules.selectseverity',this))},1000); //No I18N
        return false;
    }else{
        for(i=0;i<notifySevObj.length;i++)
        {
            if(i === 0)
            {
                notifySeverity += notifySevObj[i].value;//No I18N
            }
            else
            {
                notifySeverity += ","+notifySevObj[i].value;//No I18N
            }
        }
        notificationDetails.Criteria.selectedseverities=notifySeverity;
        return true;
    }
}

function discoveryExecuteNow(profileID)
{
   var discProfileData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/discovery/getDiscoveryProfile',{"profileId":profileID}); //No I18n
   var queryString="";
   $.each(discProfileData,function(key,profileProps)
   {
        var addRule = false;
        var scheduleDiscovery = false;
        var isSingleIPDiscovery = false;
        var ignoreRule = false;
        var ipRange = profileProps.rangeDetails;
        var toIP;
        var fromIP;
        if(profileProps.discoveryType !== 'ExistingDevices' && profileProps.discoveryType !== 'CSV')
        {
            toIP = ipRange.split("="); //No I18n
            fromIP = toIP[1].split(",")[0]; //No I18n
        }
        if(profileProps.scheduleDetails !== undefined)
        {
            scheduleDiscovery = true;
        }
        if(profileProps.discoveryType === 'singleDevice' || fromIP === toIP[2])
        {
            isSingleIPDiscovery = true; 
        }
        var url = window.OPM.apiUrlPattern + '/discovery/editDiscoveryProfile?profileId='+profileID+'&emailid='+profileProps.emailId+'&discoveryType='+profileProps.discoveryType+'&ipVersion='+profileProps.ipVersion+'&netmask='+profileProps.netmask+'&isSingleIPDiscovery='+isSingleIPDiscovery+'&credentialNames='+profileProps.credentialNames.toString()+'&interfaceDiscovery='+profileProps.interfaceDiscovery+'&intfTypeIds='+profileProps.intfTypeIds+'&intfAdminStatus='+profileProps.intfAdminStatus+'&intfOperStatus='+profileProps.intfOperStatus+'&sheduleDiscovery='+scheduleDiscovery+'&schedType='+profileProps.scheduleDetails.schedType+'&onceDate='+profileProps.scheduleDetails.onceDate+'&onceHour='+profileProps.scheduleDetails.onceHour+'&onceMin='+profileProps.scheduleDetails.onceMin+'&subject='+profileProps.subject+'&message='+profileProps.message+'&deviceAddAction='+profileProps.deviceAddAction+'&deviceRemoveAction='+profileProps.deviceRemoveAction+'&intfAddAction='+profileProps.intfAddAction+'&intfRemoveAction='+profileProps.intfRemoveAction+'&profileName='+profileProps.profileName+'&executeNow=true'; //No I18n

        if(profileProps.discoveryType === "CSV")
        {
            var CSVRangeData = JSON.stringify(profileProps.rangeDetails);
            url += '&rangeDetails=CSV'; //No I18n
        }
        else
        {
            url += '&rangeDetails='+profileProps.rangeDetails; //No I18n
        }
        if(profileProps.discoveryType !== "CSV" && profileProps.discoveryType !== 'ExistingDevices')
        {
            url += '&toIP='+toIP[2]; //No I18n
        }
        if(profileProps.rediscoveryDeviceRule !== undefined)
        {
            url += '&rediscoverExistingDevices='+profileProps.rediscoveryDeviceRule; //No I18n
        }
        if(profileProps.existingDevices !== undefined)
        {
            url += '&rediscoveryRule='+profileProps.existingDevices;  //No I18n
        }
        if(profileProps.ignoreFilter.length > 0)
        {
            $.each(profileProps.ignoreFilter,function(index,json)
            {
                json.value = json.value[0];
            });
            url += '&ignoreRule=true'; //No I18n
            url += '&ignoreFilter='+JSON.stringify(profileProps.ignoreFilter); //No I18N
        }
        else
        {
            url += '&ignoreRule=false'; //No I18n
        }
        if(profileProps.addFilter.length > 0)
        {
            $.each(profileProps.addFilter,function(index,json)
            {
                json.value = json.value[0];
            });
            url += '&addRule=true'; //No I18n
            url += '&addFilter='+JSON.stringify(profileProps.addFilter); //No I18N
        }
        else
        {
            url += '&addRule=false'; //No I18n
        }
        if(profileProps.discoveryType === 'ExistingDevices')
        {
            url += '&members='+profileProps.members+'&existingDevices=true'+'&type='+profileProps.type; //No I18n
        }
        if(profileProps.discoveryType === 'CSV')
        {
            url += '&updateCSV=true'; //No I18n
        }

        var discResponse = function(response){
            if(response !== undefined && !$.isEmptyObject(response)){
                if(response.message !== undefined){
                        var uniqueId = opm_infoMsgs('infoMsg',response.message + " " + (!window.OPM.isRMMCentral ? Ember.I18n.t('webclient.discoveryprofile.gotoInvpage') : ''));//No I18N
                        OPMClient.DiscoveryWizardAddEditController.set('topBandID',uniqueId);//No I18N
                    
                }else if(response.error !== undefined){
                    opm_infoMsgs('errorMsg',response.error.message);//No I18N
                }
            }
        };
        opm_ajaxPostRequestWithClbk(url,CSVRangeData,Ember.I18n.t('webclient.topo.discovery.success',this),discResponse);//No I18N
   });
}


function validateVMwareDiscoveryStages(currentStage, toStage){
    if(currentStage === "input"){
        return true;
    }else if(currentStage === "entities"){//No I18N
        var vmListArr = [];//No I18N
        var selectedVMsListForRediscovery = [];
        if(OPMClient.VMwareDiscoveryController.updateVMwareInventory === true){
            selectedVMsListForRediscovery = OPMClient.VMwareDiscoveryController.selectedVMs;
        }
        var vmRowIds = $('#virtualMachinesList').jqGrid('getGridParam','selarrrow');    //No I18N
        if(vmRowIds !== "" && vmRowIds !== undefined){
            $.each(vmRowIds, function(){
                var id = this;
                var vmRefID =  $('#virtualMachinesList').jqGrid('getCell', id, 'ENTITY_REFID'); //No I18N
                if($.inArray(vmRefID,selectedVMsListForRediscovery) === -1){
                    vmListArr.push(vmRefID);
                }
                $.each(OPMClient.VMwareDiscoveryController.selectedVMEntities, function(key,val) {
                    var stats = $.inArray(key, vmListArr);
                    if (stats == -1) 
                    {
                        vmListArr.push(key);
                    }
                });
            });
        }
        if(OPMClient.VMwareDiscoveryController.updateVMwareInventory === true){
            vmListArr.push.apply(vmListArr,selectedVMsListForRediscovery);
        }
        OPMClient.VMwareDiscoveryController.dataParams.virtualMachines = JSON.stringify(vmListArr);
        //opm_jqgridToggleCheckbox($("#monitorUsingWMI"),'DECredProfList');//No I18N
        /*
        if(credListArr.length <=0){
            alert(Ember.I18n.t('webclient.discovery.nocredential.error',this)); //No I18N
            return false;
        }*/
        return true;
    }else if(currentStage === "credentials"){//No I18N
        OPMClient.VMwareDiscoveryController.dataParams.updateInterval = $("#rediscoveryInterval").val();
        //if($("#monitorUsingWMI").is(":checked")){
            var  credListArr = [];//No I18N
            var credRowIds = $('#DECredProfList').jqGrid('getGridParam','selarrrow');    //No I18N
            if(credRowIds !== "" && credRowIds !== undefined){
                $.each(credRowIds, function(){
                    var id = this;
                    var name =  $('#DECredProfList').jqGrid('getCell', id, 'credentialName'); //No I18N
                    credListArr.push(name);
                });
            }
            if(credListArr.length > 0){
                OPMClient.VMwareDiscoveryController.dataParams.credentialNames = credListArr.toString();
                /*alert(Ember.I18n.t('webclient.discovery.nocredential.error',this)); //No I18N
                return false;*/
            }
            
        //}
        return true;
    }else if(currentStage === "rules"){//No I18N
        var ruleRowIds = $('#jqgridList').jqGrid('getGridParam','selarrrow');   //No I18N
        if(ruleRowIds !== "" && ruleRowIds !== undefined){
            rulesArr = [];//No I18N
            $.each(ruleRowIds, function(){
                var id = this;
                var ruleIds =  $('#jqgridList').jqGrid('getCell', id, 'ruleid'); //No I18N
                rulesArr.push(ruleIds);
            });
        }
        if(rulesArr.length > 0){
            OPMClient.VMwareDiscoveryController.dataParams.ruleIds = rulesArr.toString(); //No I18N
        }
        return true;
    }
}

function addVMwareDevice(fromSnapshotPage,entityType){
OPMClient.VMwareDiscoveryController.selectedVMEntities={};
    var showVMwareEntityList = function(response){
        if(response.error !== undefined){
            opm_infoMsgs("errorMsg",response.error.message);//No I18N
            return false;
        }
        else if(response!== undefined)
        {
            if(response.device !== undefined && response.device.message !== undefined)
            {
                opm_infoMsgs("errorMsg",response.device.message);//No I18N
                return false;
            }
            else if(response !== undefined)
            {
                if(fromSnapshotPage)
                {
                    OPMClient.VMwareDiscoveryController.entities = response;
                    // opm_transitionToTheRoute("Settings.Discovery.VMwareDiscovery");//No I18N
                    var vendor ='';//= entityType !== "Nutanix-Cluster" ? "vmware" : "nutanix";//No I18N
                    if(entityType == "Nutanix-Cluster"){
                        vendor = 'nutanix';//No I18N
                        var sample = (response.device!==undefined && response.device.clusters!==undefined ? response.device.clusters : response.clusters!==undefined? response.clusters : undefined)
                        if(sample)
                        {
                            $.each(sample, function(index,cluster)
                            {
                                if(cluster.hosts)
                                {
                                    $.each(cluster.hosts, function(index2,vms)
                                    {
                                        if(!(vms.vms) || ((vms.vms) && !(vms.vms.length)))
                                        {
                                            vms.className="hidecheckBox";//No I18N
                                        }
                                    });
                                }
                            });
                        }
                    }
                    else if(entityType == "Nutanix-PrismCentral"){
                        vendor = 'nutanix';//No I18N
                    }
                    else if(entityType == 'HyperV-Host')
                    {
                        vendor = 'hyperv';//No I18N
                    }
                    else
                    {
                        vendor = 'vmware';//No I18N
                    }
                    if(window.OPM.isRMMCentral) { // To handle RMM Admin page transition becos 2 different tabs, hence setting in sessionstorage
                        sessionStorage.setItem("RMM_VMDISCOVERY_ENTITIES", JSON.stringify(response)); //No I18N
                    }
                    opm_transitionToParentRoute("Settings.Discovery.Virtualization.Vendor",vendor);//No I18N

                }
            }
        }
    };


    if(fromSnapshotPage !== undefined && fromSnapshotPage === true){
        OPMClient.VMwareDiscoveryController.updateVMwareInventory = true;
        OPMClient.VMwareDiscoveryController.discoveryType = entityType;
        if(["Nutanix-PrismCentral", "Nutanix-Cluster"].includes(entityType))
        {
            opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + "/device/getNxInventoryForUpdate",{"name":OPMClient.InventoryDeviceDetailsController.deviceName},Ember.I18n.t('webclient.vmware.discovery.progresmsg',this),showVMwareEntityList);//No I18N
        }
        else if (entityType == "HyperV-Host")
        {
            opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + "/device/getHyperVInventoryForUpdate",{"name":OPMClient.InventoryDeviceDetailsController.deviceName},Ember.I18n.t('webclient.vmware.discovery.progresmsg',this),showVMwareEntityList);//No I18N
        }
        else
        {
            opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + "/device/checkAndGetVMwareInventoryForUpdate",{"name":OPMClient.InventoryDeviceDetailsController.deviceName},Ember.I18n.t('webclient.vmware.discovery.progresmsg',this),showVMwareEntityList);//No I18N
        }

    }
}
function addIPRangeNetworks()
{
   if(!opm_validateFields({'ipValidation':{'startIP':'endIP'}})){//No I18N
        return false;
    }
    var returnCnfm = true;
    if($('#startIP1').val() !== $('#endIP1').val() || $('#startIP2').val() !== $('#endIP2').val())
    {
        returnCnfm = confirm(Ember.I18n.t('webclient.discovery.range.confirm',this));//No I18N
    }

    if(returnCnfm)
    {
        var startIpRange = $('#startIP1').val()+"."+$('#startIP2').val()+"."+$('#startIP3').val()+"."+$('#startIP4').val();//No I18N
        var endIpRange = $('#endIP1').val()+"."+$('#endIP2').val()+"."+$('#endIP3').val()+"."+$('#endIP4').val();//No I18N
        var ipRange = $("#IPRangeDetails").val();//No I18N
        if(ipRange === ""){//No I18N
            $("#IPRangeDetails").val(ipRange + "FromIP="+startIpRange+"- "+"ToIP="+endIpRange); //No I18N
        }else{
            $("#IPRangeDetails").val(ipRange + "\n"+"FromIP="+startIpRange+"- "+"ToIP="+endIpRange); //No I18N
        }
        $(".validateField").removeClass('error');//No I18N
        $(".ipCheck").val("");//No I18N
    }
}
function opm_discoveryScheduleType(isExecuteNow)
{
    if(isExecuteNow)
    {
        OPMClient.DiscoveryWizardAddEditController.set('executeOnly',true);//No I18N
        $("#scheduleDetails,.disScheduleBtns").hide();
        $("#emailDiv").show();
    }
    else
    {
        OPMClient.DiscoveryWizardAddEditController.set('executeOnly',false);//No I18N
        $("#emailDiv").hide();
        $("#scheduleDetails,.disScheduleBtns").show();
    }
}


function showAutoDiscoveryStatus(obj)
{
    if(obj.message !== undefined && obj.message !== "" && window.OPM.isOPM)
    {
        if(OPMClient.ApplicationController.gettingStartedInfo.infoMsg !== undefined)
        {
            Ember.set(OPMClient.ApplicationController.gettingStartedInfo,'infoMsg',obj.message);//No I18N
            Ember.set(OPMClient.ApplicationController.gettingStartedInfo,'showInfo',true);//No I18N
        }
        
        var info_Obj = OPMClient.ApplicationController.gettingStarted.steps[0].infoObj;
        Ember.set(info_Obj,'infoMsg',obj.message);//No I18N
        Ember.set(info_Obj,'showInfo',true);//No I18N

        
        if(obj.isRunning !== undefined && obj.isRunning === "true" || obj.isRunning)
        {
            Ember.set(info_Obj,'showLoading',true);//No I18N
        }
        else
        {
            Ember.set(info_Obj,'showLoading',false);//No I18N
        }

    }
}


function shallowDiscoveryDevices(obj)
{
        
        /*if(obj.discoveryId !== undefined)
        {
            OPMClient.NetworkDiscoveryController.set("profileId",obj.discoveryId);//No I18n
         //   OPMClient.NetworkDiscoveryController.set("enableImportDevices",true);//No I18N    
            nd_profileId = obj.discoveryId;

        }*/
        /*else if(OPMClient.NetworkDiscoveryController.profileId === "" && obj.data.profileId !== undefined)
        {
            OPMClient.NetworkDiscoveryController.set("profileId",obj.data.profileId);//No I18n
            nd_profileId = obj.data.profileId;
        }

*/        if(obj.data !== undefined && OPMClient.NetworkDiscoveryController.profileId == obj.data.profileId){
            if(obj.percentage !== undefined)
            {
                obj.percentage = (obj.percentage >= 100?100:obj.percentage);
                $(".discoveryLoading .greenLine").css("width",Number(obj.percentage)+"%");//No I18N    
                $(".discoveryLoading .loadingText .ndPerCount").text(obj.percentage+"%");//No I18N    
                if(obj.percentage === 100)
                {
                    $(".discoveryLoading .loadingText .ndPerTxt").text(Ember.I18n.t("webclient.discovery.comp.infoMsg",this));//No I18N    
                }

                if(obj.percentage === 100 && !$(".discoveryLoading .nd_startApprove .ndApproveMsg").is(":visible"))
                {
                    $(".discoveryLoading .nd_startApprove .ndApproveMsg,.discoveryLoading .nd_startApprove .ndNoDevMsg").hide();
                    $(".discoveryLoading .nd_startApprove, .discoveryLoading .nd_startApprove .ndStartMsg").show();//No I18N    
                    $(".discoveryLoading .nd_startApprove .nd_startApproveTxt").removeClass("FailureIcon").addClass("successIcon");
                    if($("#ndGridParent li").length <= 1){
                        $(".discoveryLoading .nd_startApprove .ndNoDevMsg").show();
                        $(".discoveryLoading .nd_startApprove .nd_startApproveTxt").removeClass("successIcon").addClass("FailureIcon");
                        $(".discoveryLoading .nd_startApprove .nd_startApproveTxt .ndStartMsg").text(Ember.I18n.t("webclient.discovery.no.devices.found",this));//No I18N
                        netDisTempObj.discoveryType = OPMClient.NetworkDiscoveryController.discoveryType;
                        netDisTempObj.profileId = OPMClient.NetworkDiscoveryController.profileId;
                        netDisTempObj.profileName = OPMClient.NetworkDiscoveryController.profileName;

                    }
                }
            }

            if(obj.data !== undefined && obj.data.vendorId !== undefined && obj.data.vendorId !== -1)
            {
                    var id = "ndGrid_"+obj.data.vendorId;//No I18N
                    var rowlen = $("#"+id).jqGrid('getRowData').length;
                    var vendorLen = $(".accordion1 ul li[data-vendorid='"+obj.data.vendorId+"']").length;
                    
                    if(vendorLen === 0)
                    {
                        if(opm_getObjFromArray(OPMClient.NetworkDiscoveryController.gridList,'vendorId',obj.data.vendorId) === undefined)
                        {   var vendorList = {vendorName:obj.data.vendorName,vendorId:obj.data.vendorId,gridId:id,list:obj.data.props};
                            OPMClient.NetworkDiscoveryController.gridList.pushObject(vendorList);
                        }
                        else
                        {
                             setTimeout(function(){
                                 $("#"+id).jqGrid('addRowData',$.jgrid.randId(),obj.data.props,'last');    
                                   var rowlen = $("#"+id).jqGrid('getRowData').length;
                                    $(".accordion1 ul li[data-vendorid='"+obj.data.vendorId+"'] .deviceCount").text(rowlen); 
                                },250);
                        }
                    }
                    else if(rowlen !== undefined)   
                    {
                         $("#"+id).jqGrid('addRowData',$.jgrid.randId(),obj.data.props,'last');    
                         $(".accordion1 ul li[data-vendorid='"+obj.data.vendorId+"'] .deviceCount").text(rowlen+1);        
                    }
            }
            else if(obj.data.vendorId === -1){
                var rowlen = $("#nwd_existingDev").jqGrid('getRowData').length;
                $("#nwd_ed").show();
                 if(rowlen !== undefined && rowlen > 0)      
                 {
                    $("#nwd_existingDev").jqGrid('addRowData',$.jgrid.randId(),obj.data.props,'last');    //No I18N
                    $(".accordion1 ul li[data-vendorid='nwd_ed'] .deviceCount").text(rowlen+1);        //No I18N
                 }
                 else
                 {
                    opmLoadDiscoveredDevices("nwd_existingDev",[obj.data.props]);//No I18N
                    $(".accordion1 ul li[data-vendorid='nwd_ed'] .deviceCount").text(1);//No I18N
                 }
            }
    }
}


function opmLoadDiscoveredDevices(id,data)
{
        var colNames = [];//No I18n
        var colModel = [];//No I18n
        colNames =
        [
          Ember.I18n.t('webclient.devices.details.devicename',this), //No I18N
          Ember.I18n.t('webclient.devices.details.ipaddress',this), //No I18N
          Ember.I18n.t('webclient.topo.objectdetails.type',this), //No I18N
            '',
            '',
            ''
        ];
        colModel =
        [
            { name: 'displayName', index: 'displayName'}, //No I18N
            { name: 'ipAddress', index: 'ipAddress'}, //No I18N
            { name: 'deviceType', index: 'deviceType'}, //No I18N
            { name: 'name', index: 'name',hidden:true}, //No I18N
            { name: 'profileId', index: 'profileId',hidden:true}, //No I18N
            { name: 'actions', index: 'actions',formatter:ndImportActions,title:false} //No I18N
        ];
    
        var multiselect = true;
        if(id == "nwd_existingDev")
        {
            multiselect = false;
        }
        $("#"+id).jqGrid("GridUnload");//No I18n
        var defaultOptions = {"sortName":"displayName","sortOrder":"asc","multiselect":multiselect,"disableNoDataText":true};//No I18N
        opm_loadJQgridWithData("#"+id, data, colNames, colModel, "", "", "",defaultOptions); //No I18N
        // $("#"+id).jqGrid('setGridWidth',$("#ndGridParent").width()-40);//No I18N
        $(".networkDisAccordion").css("width",$('.discoveryTableTopInfo').width()+"px");//No I18N
        $("#"+id).jqGrid('setGridWidth',$('.discoveryTableTopInfo').width()-25);//No I18N

        if(!$($('.accordion1__cont')[0]).is(":visible") && $("#ndGridParent li .accordion1__nav.active").length == 0 && id !== "nwd_existingDev")
        {
            $($('.accordion1__cont')[0]).slideDown();
            $($('.accordion1__nav')[0]).addClass("active");
        }
}


function showMonthlyFields()
{
    var monthlyType = $('input:radio[name="nd_monthlyType"]:checked').val(); //No I18N
    if(monthlyType === "4")//No I18N
    {
      $("#nd_monthlyDayCheBox").hide();
      $("#nd_monthlyDate").prop("disabled",false);
      $("#nd_monthlyWeekNum").prop("disabled",true);
      
    }
    else
    {
       $("#nd_monthlyWeekNum").prop("disabled",false);
       $("#nd_monthlyDayCheBox").show();
       $("#nd_monthlyDate").prop("disabled",true);
    }
}

function opm_loadNetDisProfileDetails(profileId,profileName){
    var rsp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/discovery/getDiscoveryProfile?profileId="+profileId);//No I18N
    if(rsp !== undefined && !$.isEmptyObject(rsp)){
        OPMClient.DiscoveryWizardAddEditController.set("wizardDetailsObj",rsp[0]);
        var wizardDetails = rsp[0];
        var type = wizardDetails.discoveryType;
        var ipVersion = wizardDetails.ipVersion;
        $('#opm_DiscoveryName').val(wizardDetails.profileName);//No I18N
        var range = wizardDetails.rangeDetails;
        var mask = wizardDetails.netmask;

       $(".tab1 > ul > li[data-type='"+type+"']").click();  

        if(type === 'IPRange'){//No I18N
            $('input[name=ipRangeType][value="ipv'+ipVersion+'"]').prop('checked',true);//No I18N
            showIPRange();
            if(ipVersion === '4')
            {
                var rangeDetails = wizardDetails.rangeDetails;
                var ranges = (rangeDetails).split(":");//No I18N
                $.each(ranges,function(k,v){
                    var temp = v.split(", ");
                    var from_ips = temp[0].split("=")[1];
                    var to_ips = temp[1].split("=")[1];
                    if(k == 0)
                    {
                        $('#opm_fromIP').val(from_ips);
                        $('#opm_toIP').val(to_ips);
                    }
                    else
                    {
                        var unq_id = (Math.floor(Math.random() * 50) + Date.now());
                        var obj = {id:unq_id,fromVal:from_ips,toVal:to_ips}
                        OPMClient.NetworkDiscoveryController.addIPRange.pushObject(obj);
                    }
                });
                $("#opm_IP_Range .addMoreRange").show();
                
            }else if(ipVersion === '6'){
                var fromIp = (wizardDetails.rangeDetails).split(",");
                $('#opm_fromIP').val(fromIp[0].split("=")[1]);
                $('#opm_toIP').val(fromIp[1].split("=")[1]);
                $("#opm_IP_Range .addMoreRange").hide();
            }
        }else if(type === "CIDR"){ //No I18N
            $('#nd_maskBit').val(mask);
            $('#nd_networkIP').val((wizardDetails.rangeDetails).split("=")[1]);
        }
        else if(type === "ExistingDevices"){  //No I18N
            OPMClient.DiscoveryWizardAddEditController.set("isExisting",true);//No I18N
            $('.tab1 > ul > li').removeClass('active');
            $(".tab1 > ul > li[data-type='"+wizardDetails.type+"']").addClass('active');
            if(window.OPM.showMiniPollerfld && wizardDetails.pollerID !== undefined && wizardDetails.pollerID !== "-1"){
                $('#rmPollerName').val(wizardDetails.pollerID).select2();
                $('#exDevType_tab > li').not('[data-type="devices"]').addClass('jiraBlur');	//No I18N
				$("#exDevType_tab > li").removeClass('active').filter("[data-type='devices']").addClass('active');
            }
          //  OPMClient.DiscoveryWizardAddEditController.set("showRediscoveryDiv",true);
            loadGroupwiseDetails(wizardDetails.type);
        }
        else if(type === "ActiveDirectory"){ //No I18N
            $('#nd_AD_domainName').val(wizardDetails.domainDetails.domainName);
            $('#nd_AD_domainCntr').val(wizardDetails.domainDetails.domainControllerName);
            $('#nd_AD_userName').val(wizardDetails.domainDetails.userName);
            
        }
        else if(type === "CSV"){ //No I18N
            if(wizardDetails.discoverNonPingableDevice==="false"){//No I18N
                $("#nonPingableDevice").prop("checked",false);//No I18N
            }else{
                $("#nonPingableDevice").prop("checked",true);//No I18N
            }
        }

        if(window.OPM.showMiniPollerfld && wizardDetails.pollerID !== undefined && wizardDetails.pollerID !== "-1" && type !== "ActiveDirectory" && type !== "ServiceNow"&& type !== "ExistingDevices"){//No I18N
			$('#netDevType_tab > li').not('[data-type="IPRange"],[data-type="CIDR"],[data-type="CSV"]').addClass('jiraBlur');	//No I18N
        }
        /*else if(type === "CSV"){ //No I18N
         //   $("#csvNetmask").val(mask);
        }*/

        //Discovery filter 
        if(wizardDetails.addRule == "true" || wizardDetails.ignoreRule == "true"){//No I18N
            var discoverCriteriaList = {"IPRange":Ember.I18n.t('webclient.layer.discovery.iprange',this),"IPAddress":Ember.I18n.t('webclient.topo.actions.deviceinfo.ipaddress',this),"Category":Ember.I18n.t('webclient.devices.details.category',this),"DeviceType":Ember.I18n.t('webclient.action.devicetype',this),"Device":Ember.I18n.t('webclient.devices.details.devicename',this)};  //No I18N
            var filterConditionList ={"equals":Ember.I18n.t('webclient.threshold.condition.equals',this),"contains":Ember.I18n.t('webclient.threshold.condition.contains',this)};//No I18N
            var ndfilterList = [];
            if(wizardDetails.addRule == "true"){//No I18N
                $.each(wizardDetails.addFilter,function(index,details){
                    var filterArr = {};
                    filterArr.actionType = "add";//No I18N
                    filterArr.displayActType = Ember.I18n.t('webclient.admin.discoverdevices.discover',this)+" "+Ember.I18n.t('webclient.filter.devices',this);//No I18N
                    filterArr.type = details.type;//No I18N
                    filterArr.displayType = discoverCriteriaList[details.type];
                    filterArr.condition = details.condition;
                    filterArr.displayCondition = filterConditionList[details.condition];
                    filterArr.value = (details.value).toString();
                    ndfilterList.push(filterArr);
                });
            }
            if(wizardDetails.ignoreRule === "true"){//No I18N
                $.each(wizardDetails.ignoreFilter,function(index,details){
                      var filterArr = {};
                    filterArr.actionType = "ignore";//No I18N
                    filterArr.displayActType = Ember.I18n.t('webclient.common.ignore',this)+" "+Ember.I18n.t('webclient.filter.devices',this);//No I18N
                    filterArr.type = details.type;//No I18N
                    filterArr.displayType = discoverCriteriaList[details.type];
                    filterArr.condition = details.condition;
                    filterArr.displayCondition = filterConditionList[details.condition];
                    filterArr.value = (details.value).toString();
                    ndfilterList.push(filterArr);
                });
            }
            opm_ndFilterActionsList(ndfilterList);
            
        }
        if(wizardDetails.credentialNames !== undefined && wizardDetails.credentialNames !== ""){//No I18N
            var selCrd = (wizardDetails.credentialNames).split(',');
            OPMClient.SettingsTabController.set("selCredCount",selCrd.length);//No I18N
        }
        //To set remotePoller ID selection
        if(wizardDetails.pollerID !== undefined && wizardDetails.pollerID !==""){
            $('#rmPollerName').val(wizardDetails.pollerID).select2();
        }
        if(wizardDetails.isAvailEnabled !== undefined && wizardDetails.isAvailEnabled === "true") { //No I18n
            Ember.run.schedule('afterRender', function() {//No I18N
                $('#nt_liteCheckBox').attr('checked',true);
            });
        }
    }
}

function opm_ndFilterActionsList(jsonData,id)
{
    var colNames =
    [
        Ember.I18n.t('webclient.discovery.action.header',this),//No I18N
        Ember.I18n.t('webclient.discovery.type',this),//No I18N
        Ember.I18n.t('webclient.admin.re.condition',this),//No I18N
        Ember.I18n.t('jsp.commonstr.Value',this),//No I18N
        Ember.I18n.t('webclient.action.actions',this), //No I18N
        '',
        '',
        ''
    ];
    var colModels =
    [
        { name:'displayActType',index:'displayActType'}, //No I18N
        { name:'displayType',index:'displayType'}, //No I18N
        { name:'displayCondition',index:'displayCondition'}, //No I18N
        { name:'value',index:'value'}, //No I18N
        { name:'actions',index:'actions',formatter:ndFilterActions}, //No I18N
        { name:'actionType',index:'actionType',hidden:true}, //No I18N
        { name:'type',index:'type',hidden:true}, //No I18N
        { name:'condition',index:'condition',hidden:true}//No I18N
    ];
    var defaultOptions = {"sortName":"displayName","sortOrder":"asc","multiselect":true,"searchOption":true,"minRowsPerPage":25};//No I18N
    if(id == undefined || id === "")
    {
        id = "opmDisFilterList";//No I18N
    }
    opm_loadJQgridWithData("#"+id, jsonData, colNames, colModels, '', "", "opmDisFilterList",''); //No I18N
    $("#"+id).jqGrid('setGridWidth',650);//No I18N
    $("#opm_ndFilterContainer").show();
    $("#"+id).closest(".ndFilter").show();
}

function nd_showFilterOptions(type){
    $("#IPRangeDiv,#IPRangeDiv_ipv6,#IPAddressDiv,#categoryDiv").hide();
    OPMClient.NetworkDiscoveryController.set("selectedDiscFilter",type); //No I18n

    if(type === "Category" || type === "DeviceType" || type === "Device"){//No I18N
        var searchData = [];//No I18N
        $("#categoryDiv").show();
           if(type == "Category"){//No I18N
                apiUrl=window.OPM.apiUrlPattern + "/device/getCategoryList";   //No I18N
                $.ajax({
                url:apiUrl, //No I18N
                type:'GET', //No I18N
                async:false,
                success:function(data){ //No I18N
                    $.each(data,function(k,v){
                        searchData.push({'prop':k,'label':v}); //No I18N
                    });
                    showSearchValues(searchData,'filterValue');//No I18N
                }
            });
        }
        else
        {
            showSearchValues(searchData,'filterValue');//No I18N
        }

    }
    else if(OPMClient.DiscoveryWizardAddEditController.isFromL2Discovery)
    {
        OPMClient.NetworkDiscoveryController.set("discVersion","ipv4");//No I18N
        $("#"+type+"Div").show();
    }
    else if(!OPMClient.NetworkDiscoveryController.isExisting){
        var discoveryType = OPMClient.NetworkDiscoveryController.discoveryType;
        var startIpRange = (discoveryType == "CIDR" ? trimAll($('#nd_networkIP').val()) : trimAll($('#opm_fromIP').val()));//No I18n
        if(type === "IPRange" && opm_isIpV6Address(startIpRange))
        {
            OPMClient.NetworkDiscoveryController.set("discVersion","ipv6");//No I18N
            $("#IPRangeDiv_ipv6").show();
        }
        else{
            OPMClient.NetworkDiscoveryController.set("discVersion","ipv4");//No I18N
            $("#"+type+"Div").show();
        }    
    }else{
        OPMClient.NetworkDiscoveryController.set("discVersion","ipv4");//No I18N
        $("#"+type+"Div").show();
    }  
}

function nd_setCredentials(val){
    if(OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.credentialNames !== undefined && OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.credentialNames !== ""){//No I18N
        var selCrd = (OPMClient.DiscoveryWizardAddEditController.wizardDetailsObj.credentialNames).split(',');
        //for(var i=0; i < selCrd.length; i++){
            //var cred = selCrd[i];
            if(selCrd.indexOf(val) !== -1)
            {
                $("#credentialsList input[type='checkbox'][value='"+val+"']").prop("checked",true);
            }
        //}
        OPMClient.SettingsTabController.set("selCredCount",selCrd.length);//No I18N
    }
}

function opmSetAddNetworkRange(e)
{

    var dataObj = e.clipboardData || window.clipboardData;
    if(dataObj !== undefined)
    {
        var pasteVal = dataObj.getData('Text');//No I18N
    }
    else
    {
        var pasteVal = trimAll($('#opm_fromIP').val());
    }

    $("#opm_IP_Range .addMoreRange").show();
    if(opm_isIpV6Address(pasteVal))
    {
        $("#opm_IP_Range .addMoreRange").hide();
    }
    e.stopPropagation();
    
}

function isInBuiltGatewayConfigured(selectedGateway, smsServerDetails) {
    var configured = false; 
    $.each(smsServerDetails, function(inBuiltGatewayName, value) {
        if (inBuiltGatewayName === selectedGateway && value === "true") {
            configured = true;
            return true;
        }
    });

    return configured;
}
