//$Id$	

var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

// Regex containing the keys listed immediately above.
var htmlEscaper = /[&<>"'\/]/g;

// Escape a string for HTML interpolation.
function escapeHTML(string) {
  if(string===undefined){
		return "";
	}else{
	  return ('' + string).replace(htmlEscaper, function(match) {
	    return htmlEscapes[match];
	  });
	}
};

function opm_toggleConfigContent(contentID, toggleID) {
	var textArea = $("#" + contentID);
	textArea.addClass("blur");
	textArea.bind('cut copy', function (e) {
	    e.preventDefault(); 
	});
	var toggle = $("#" + toggleID);
	toggle.attr("title", Ember.I18n.t("webclient.NCM.Snapshot.Configuration.view", this)); //No I18N
	toggle.click(function() {
		if(textArea.hasClass("blur")) {
			textArea.removeClass("blur");
			textArea.unbind('cut copy'); //No I18N
			toggle.attr("title", Ember.I18n.t("webclient.NCM.Snapshot.Configuration.hide", this)); //No I18N
			toggle.removeClass("icon-eye");
			toggle.addClass("icon-eye-slash"); 
		} else {
			textArea.addClass("blur");
			textArea.bind('cut copy', function (e) {
			    e.preventDefault(); 
			});
			toggle.attr("title", Ember.I18n.t("webclient.NCM.Snapshot.Configuration.view", this)); //No I18N
			toggle.removeClass("icon-eye-slash");
			toggle.addClass("icon-eye");
		}
	});
} 

/*     ---- NCM DeviceTemplate Functions Starts ----      */

function getIdOfCurrentUrl(){ 
	/*
	 * RETURNS ID AS CLONE OR EDIT BASED ON THE URL
	 */
	var url = location.href;
	if(url.includes('CloneDeviceTemplate')){
		return "'clone'"; // No I18N
	}else if(url.includes('DeviceTemplatesEdit')){ //No I18N
		return "'edit'"; //No I18N
	}
}
function initCommands(){
	/*
	 * Iint Command variables as empty to avoid not found exception in server side
	 */
	var command = {};
	command.command = ''; //No I18N
	command.timeout = ''; //No I18N
	command.prompt = ''; //No I18N
	command.responseparserId = ''; //No I18N
	command.parserCommandName = ''; //No I18N
	command.sequenceId = ''; //No I18N
	command.errorcode = ''; //No I18N
	command.taskhandling = ''; //No I18N
	command.promptActionId = ''; //No I18N
	command.messageSuffix = ''; //No I18N
	return command;
}
function editIconEnable(current_div){
	/*
	 * Operation Performed when edit icon near group name is clicked
	 */
	var $req_elem = $(current_div).parent().find('div');
	if($req_elem.hasClass('active')){
		if(checkForXSS($req_elem.find('input').val(),'!^*()+[]\';|\"<>?~@$#{}%&`/+-=') === 'failed'){
			validateFocus($req_elem.find('input'),null,null,null,Ember.I18n.t("ncm.devicetemplate.noSpecialChars")); //No I18N
			validFields = false;
			return false;
		}
		$(current_div).removeClass('opmSaveIcon');
		$(current_div).addClass('opmEditIcon');
		$(current_div).attr('title', Ember.I18n.t("webclient.ncm.title.grpName.edit",this));
		$req_elem.removeClass('active');
		var title_text = $req_elem.find('input').val();
		$req_elem.find('h6').text(title_text);
	}else{
		$(current_div).removeClass('opmEditIcon');
		$(current_div).addClass('opmSaveIcon');
		$(current_div).attr('title', Ember.I18n.t("webclient.ncm.title.grpName.save",this));
		$req_elem.addClass('active');
	}
}

function operationNameChange(currentElem){
     var operName = $(currentElem).val();
     var opNameIp = $(currentElem).closest(".opmFormRow").find('#operationGrpName');
     if (operName === "Others") {
    	 opNameIp.show();
     } else {
    	 opNameIp.hide();
     }
}

function removeProtocolTab(current_div){
	/*
	 * From UI prespective
	 * -------------------------
	 * 1]	Removes All Operations of that protocol,...except the BackupStartup(first default operation)
	 * 2]	And removed protocol Name is added to protocolList
	 * 3]	When we try to remove the active Tab protocol...the previous protocol becomes active,when this is removed
	 * 
	 */

	if($(current_div) && $(current_div).parent() && $(current_div).parent().parent()){
		var $remove_div = $(current_div).parent().parent();
    	var protocolId = $remove_div.attr('id'); //No I18N
    	var protocolIds = $remove_div.attr('data-deviceprotocolid'); //No I18N
    	var protocolTab = $("#"+protocolId); //No I18N
    	var protocolDiv = $("#"+protocolId+"_div"); //No I18N
    	if(protocolIds != undefined || protocolIds != null){
    		var confirmBody=Ember.I18n.t('webclient.ncm.deviceTemplateNew.deleteProtocol',{param0:'"'+$remove_div.text()+'"'},this); //No I18N
    		var okCallBack= function() {
            	    var operations = {};
            	    operations.operation = "delete"; //No I18N
            	    operations.operatedOn = "protocol"; //No I18N
            	    operations.deviceProtocolIds = protocolIds;
            	    OPMClient.SettingsNCMConfigController.dtEditOperationDetails.push(operations);
            	    protocolTab.find(".cfg-icon").remove();
            	    protocolTab.find(".icon-cancel").remove();
            		protocolDiv.find('.configDetails').hide();
            		protocolDiv.find('.noDataContainer').show();
            		protocolDiv.find(".opmForm").remove()
    	          }
    	    ncmConfirm("Delete Protocol",confirmBody,400,okCallBack); // No I18N
    	}else{
    		protocolTab.find(".cfg-icon").remove();
    		protocolTab.find(".icon-cancel").remove();
    		protocolDiv.find('.configDetails').hide();
    		protocolDiv.find('.noDataContainer').show();
    		protocolDiv.find(".opmForm").remove();
    		protocolDiv.removeClass("editedProtocol");
    	}
    	OPMClient.NCMDeviceTemplateController.dtProtocolRemoved = true;
	}
}

function checkAllowedOperationCount(protocol,configName){
	var cfgName=configName.toLowerCase();
    var configCount=$("#"+protocol+"_div").find("."+cfgName+"-config .configuration-list-box").length;
    var validate=false;
    if(configName!=undefined && configName!=null){
        var msgId="";
        if(configName=='Backup'){
        	if(configCount>7){
                validate=true;
                msgId=opm_infoMsgs("infoMsg", Ember.I18n.t('ncm.devicetemplate.maximum.backupConfig'));//No I18N
            }
        }else if(configName=="Upload"){//No I18N
            if(configCount>2){
                validate=true;
                msgId=opm_infoMsgs("infoMsg", Ember.I18n.t('ncm.devicetemplate.maximum.uploadConfig'));//No I18N
            }
        }
        setTimeout(function() {
        	$("#"+msgId).remove();
        },5000);
    }else{
       validate=true;
    }
	return validate;
}
function getAvlOperNames(protocol,configName){
	if(configName=='Backup'){
	    //removing used operation from dropdown
	    $('#configSel').find('option:not(:first)').remove();
	    var operationList=OPMClient.NCMDeviceTemplateController.allOperationNames;
		$.each(operationList,function(key,val){
			val=escapeHTML(val);
			if($("#"+protocol+"_div").find(".backup-config .opmForm").hasClass("Backup_"+val)){
				$("#configSel").append('<option value="'+val+'"> '+val+'</option>');
	    		$("#configSel option[value='"+val+"']").remove();
			}else{
	    		$("#configSel").append('<option value="'+val+'"> '+val+'</option>');
			}
		});
    } else if(configName=='Upload'){//No I18N
	    $('#configSel').find('option:not(:first)').remove();
	    var uploadAllowedOperations=["Running","Startup"];//No I18N
		$.each(uploadAllowedOperations,function(key,val){
			if($("#"+protocol+"_div").find(".upload-config .opmForm").hasClass("Upload_"+val)){
				$("#configSel").append('<option value="'+val+'"> '+val+'</option>');
	    		$("#configSel option[value='"+val+"']").remove();
			}else{
	    		$("#configSel").append('<option value="'+val+'"> '+val+'</option>');
			}
		});
    }
}
function addConfig(configName){
    var protocol = $('#protocolTabs li.active').attr('id');
    if(!OPMClient.NCMDeviceTemplateController.isMultiConfigTemplate && checkAllowedOperationCount(protocol,configName)){
    	return;
    }
    if(configName==null || configName==undefined){
        return;
    }
    getAvlOperNames(protocol,configName);
	$('#configType').attr('disabled',true);
    $("#cmdLoadDiv").hide();
    var $trRow=getNCMDTCmdRow("newDT",true,protocol,configName,"add",null); //No I18N
    $('tbody#cmd-table').append($trRow);
    $('body').addClass('slideDivIn-11');
    $('#cmd-table').find('.select2').select2();
    $('.config-row').attr("id",configName);
    $('#saveConfig').attr('onClick', 'saveNewConfiguration("newDT","'+protocol+'","'+configName+'","add");');

	if(protocol=="ssh_telnet" && configName=='Backup'){
		$("#backup-res").show();
	}else{
		$("#backup-res").hide();
	}
    if(configName=='Backup' || configName=='Upload'){
        $('#configDispName').attr("disabled",false);
        $("#baseTemplateInfo").show();
        $('#resetConfig').show();
    	$(".cfg-title").html(escapeHTML(configName+" Configuration"));//No I18N
        $('#configSelTab').addClass("config-sel-req");
        $('#cfgTypeDiv').hide();
        $('#cfgNameDiv').hide();
        $('#configSel').val('Select').change();
        $('#configSelTab').show();
        $(".create-config").show();
        if(configName=='Upload'){
        	$(".create-config").hide();
        }
    }else{
       $('#configDispName').attr("disabled",true);
       $("#baseTemplateInfo").hide();
       $('#resetConfig').hide();
       $('#cfgTypeDiv').show();
       $("#cfgNameDiv").show();
       $('#configSelTab').removeClass("config-sel-req");
       $('#configSelTab').hide();
       if(configName=='Others_Syncconfiguration'){//No I18N
       		$(".cfg-title").html(Ember.I18n.t('webclient.ncm.dt.syncConfig'));//No I18N
            $('#configType').val(Ember.I18n.t('webclient.ncm.dt.syncConfig'));
            $('#configDispName').val(Ember.I18n.t('webclient.ncm.dt.syncConfig'));
       }else if(configName=='Others_InterfaceDetails'){//No I18N
       		$(".cfg-title").html(Ember.I18n.t('ncm.devicetemplate.config.getInterfaceDetails'));//No I18N
            $('#configType').val(Ember.I18n.t('ncm.devicetemplate.config.getInterfaceDetails'));
            $('#configDispName').val(Ember.I18n.t('ncm.devicetemplate.config.getInterfaceDetails'));
       }else if(configName=='Changedetection_Enable'){//No I18N
      		$(".cfg-title").html(Ember.I18n.t('webclient.ncm.dt.changeEnable'));//No I18N
            $('#configType').val(Ember.I18n.t('webclient.ncm.dt.changeEnable'));
            $('#configDispName').val(Ember.I18n.t('jsp.commonstr.Enable'));
       }else if(configName=='Changedetection_Disable'){ //No I18N
     		$(".cfg-title").html(Ember.I18n.t('webclient.ncm.dt.changeDisable'));//No I18N
            $('#configType').val(Ember.I18n.t('webclient.ncm.dt.changeDisable'));
            $('#configDispName').val(Ember.I18n.t('jsp.commonstr.Disable'));
       }
    }
    setTimeout(function(){
        $('#cmd-table').find('[name = command]').focus();
    },500);
}

function createConfig(){
	if(OPMClient.NCMDeviceTemplateController.isMultiConfigTemplate){
	    $('#configSel').val('Select').change();
	    $('#configSelTab').removeClass("config-sel-req");
		$("#cfgTypeDiv").show();
		$("#cfgNameDiv").show();
		$("#configType").attr("disabled",false);
		$("#configType").val('');
		$("#configDispName").val('');
		resetConfigTab();
	}else{
		var msgId=opm_infoMsgs("infoMsg", Ember.I18n.t('ncm.devicetemplate.newOperation.info'));// no i18n
		setTimeout(function() {
        	$("#"+msgId).remove();
        },5000);
	}
}

function viewConfig(mode,element,oper,operType){
	OPMClient.SettingsNCMConfigController.dtDeletedCmdTemp=[];
	var dataMap=JSON.parse($(element).closest(".configuration-list-box").attr("data-map"));
    var protocol = $('#protocolTabs li.active').attr('id');
    if(oper=='clone'&& !OPMClient.NCMDeviceTemplateController.isMultiConfigTemplate){
        if(checkAllowedOperationCount(protocol,operType)){
        		return;
        }
    }
    if(operType=="Backup" || operType=="Upload"){
    	$("#configDispName").attr('disabled',false)
    }else{
    	$("#configDispName").attr('disabled',true)
    }
    $('body').addClass('slideDivIn-11');
    $("#cmdLoadDiv").hide();
    $("#baseTemplateInfo").hide();
    $('#configSelTab').hide();
    $('#cfgTypeDiv').show();
    $('#cfgNameDiv').show();
    $('#resetConfig').hide();
    $('#configSelTab').removeClass("config-sel-req");
    $('.config-row').attr("id",dataMap["operation"]);
    $('#configType').val(dataMap["operType"]);
    $(".cfg-title").html(escapeHTML(dataMap["groupName"]));//No I18N
    $('#configDispName').val(dataMap["groupName"]);
    var cmdList=dataMap["commands"];
    for(var i=0;i<cmdList.length;i++){
    	var $trRow;
    	if(i==0){
            $trRow=getNCMDTCmdRow(mode,true,protocol,operType,"edit",cmdList[i]);//No I18N
    	}else{
    		$trRow=getNCMDTCmdRow(mode,false,protocol,operType,"edit",cmdList[i]);//No I18N
    	}
        $('tbody#cmd-table').append($trRow);
	    $trRow.find('.msgSuffix .select2').val(cmdList[i].messageSuffix).change();//No I18N
	    $trRow.find('.promptActionId .select2').val(cmdList[i].promptActionId).change();//No I18N
    }
    $('#cmd-table').find('.select2').select2();
    if(oper=='edit'){
    	$('#configType').attr('disabled',true);
    	$('#saveConfig').attr('onClick', 'saveNewConfiguration("'+mode+'","'+protocol+'","'+dataMap["operation"]+'","edit");');
    } else if(oper=='clone'){//No I18N
    	$('#configType').attr('disabled',false);
    	$('#saveConfig').attr('onClick', 'saveNewConfiguration("newDT","'+protocol+'","'+operType+'","add");');
				}
			}

function devTemplateNavigate(element){
	if(!$(element).hasClass('active')){
	    var prevTab=$(element).parent().find('li.active').data('nav');//No I18N
	    var selectedTab = $(element).data('nav');//No I18N
	    if(selectedTab !== undefined){
	    	$("#"+prevTab).hide();
	    	$("#"+selectedTab).show();
	    }
	}
}

function clearConfigTab(){
    $("tbody .cmd-row").remove();
    //$('#configSel').val('Select').change();
}

function resetConfigTab(){
    clearConfigTab();
    var protocol = $('#protocolTabs li.active').attr('id');
    var operation=$(".config-row").attr("id").split("_")[0];
    var $trRow=getNCMDTCmdRow("newDT",true,protocol,operation,"add",null);//No I18N
     $('tbody#cmd-table').append($trRow);
     $('#cmd-table').find('[name = command]').focus();
     $('#cmd-table').find('.select2').select2();
}

function cancelConfigTab(){
    clearConfigTab();
    $('body').removeClass('slideDivIn-11');
}

function getBaseTemplates(){
	var vendorId=$('#devVendorList').val();
	var vendorName=$('#devVendorList :selected').text();
	$("#devTypeList").val("");
	$("#devTypeList").attr("data-id",-1);
	$('#devBaseTemp').empty().append('<option selected="selected" value="Select">Select</option>');
	if(vendorName!="Select"){
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/getBaseTemplateDetails?VENDORID='+vendorId; //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			type: 'GET',//No I18N
			dataType: 'json',//No I18N
			success: function(jsonData, status) {
				var baseTemplateList=jsonData.baseTemplateDetails;
				baseTemplateList.forEach(function(val){
						$("#devBaseTemp").append("<option value='"+val.baseTemplateId+"' data-map='"+val.personalityMap+"'>"+val.templateName+"</option>");
				});
			}
		});
	}
}

function getPersonalityDetails(element){
	if($("#devBaseTemp").val()!="Select"){
		var map=JSON.parse($("#devBaseTemp").find(":selected").attr("data-map"));
		$("#devTypeList").attr("data-id",map.personalityId);
		$("#devTypeList").val(map.personalityName);
	}else{
		$("#devTypeList").val("");
		$("#devTypeList").attr("data-id",-1);
	}

}

function populateConfigName(){
    var selConfig=$('#configSel').val();
    var dispConfig=selConfig;
    if(selConfig=='Select'){
        $('#cfgTypeDiv').hide()
        $('#cfgNameDiv').hide();
        $('#configType').val('');
        $('#configDispName').val('');
    }else{
    	var protocolId=$('#protocolTabs li.active').attr("id");
        var protocolName = $('#protocolTabs li.active').text().trim();
        var dtId=	$("#devBaseTemp").val();
        $('#configType').val(selConfig);
        $('#configType').attr('disabled',true);
        var operation=$(".config-row").attr("id").indexOf("Upload")>=0?"Upload":"Backup";//No I18N
        $('#configDispName').val(operation+" "+selConfig);
    	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/populateCliCommandsByOperName?DTID='+dtId+'&OPERATION='+operation+'&FILETYPE='+selConfig+'&PROTOCOLNAME='+protocolName; //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			type: 'GET',//No I18N
			dataType: 'json',//No I18N
			success: function(jsonData, status) {
				if(jsonData.commands.length >= 1){
					$('tbody#cmd-table').hide();
					$('#cmdLoadDiv').show();
			        $('#configDispName').val(jsonData.desc);
			        var cmdList=jsonData.commands;
			        clearConfigTab();
			    	setTimeout(function() {
				        for(var i=0;i<cmdList.length;i++){
				        	var first=(i==0);
				            var $trRow=getNCMDTCmdRow("newDT",first,protocolId,operation,"edit",cmdList[i]);//No I18N
				            $('tbody#cmd-table').append($trRow);
				    	    $trRow.find('.msgSuffix .select2').val(cmdList[i]["msgSuffix"]).change();//No I18N
				    	    $trRow.find('.promptActionId .select2').val(cmdList[i]["promptActionId"]).change();//No I18N
				        }
						$('#cmdLoadDiv').hide();
						$('tbody#cmd-table').show();
				        $('#cmd-table').find('.select2').select2();
			    	},1000);
				}else{
					//opm_infoMsgs("infoMsg", Ember.I18n.t('webclient.ncm.dt.operation.allSelected', this));//No I18N
					var msgId=opm_infoMsgs("infoMsg", Ember.I18n.t('ncm.devicetemplate.baseTemplate.commandNotAvl'));//No I18N
			    	setTimeout(function() {
				        $("#"+msgId).remove();
			    	},5000);
					resetConfigTab();
			        $('#cmd-table').find('.select2').select2();
				}
			}
		});
        $('#cfgTypeDiv').show()
        $('#cfgNameDiv').show();
    }
}

function moveSelectedToFirst(parent_div,isSelected){
	if(isSelected == true || isSelected == 'true'){
		var $first_div = parent_div.children(':nth-child(1)'); //No I18N
		$first_div.find('input[type=radio]').prop('checked',true); //No I18N
	}
}

function cancelCommand(CURRENT_DIV,edit){
	/*
	 * When value of edit is "edit", the details of deleted values are added into the controller to send it to server
	 *
	 */
	var $parent_div = $(CURRENT_DIV);
	if($parent_div.hasClass('cmd-delete-icon')){
		$parent_div = $parent_div.closest(".cmd-row"); //No I18N
	}else{
		$parent_div = $parent_div.closest(".opmForm");	 //No I18N
	}
	if(edit == "sysoid"){
		$parent_div = $(CURRENT_DIV).closest(".sysoid-row");
		var operation  = "delete"; //No I18N
		var operations = {};
		operations.operation = operation;
		var operatedOn = "sysoid"; //No I18N
		operations.operatedOn = operatedOn;
		operations.sysoid = $parent_div.attr('data-sysoid'); //No I18N
		operations.sysType = $parent_div.attr('default-custom'); //No I18N
		if(operations.sysoid != null && operations.sysType != null){
			OPMClient.SettingsNCMConfigController.dtEditOperationDetails.push(operations);
		}
		$parent_div.remove();
	}
	else if(edit == 'editDT'){
		var operation  = "delete"; //No I18N
		var operations = {};
		operations.operation = operation;
		var confirmBody=Ember.I18n.t('webclient.ncm.devicetemplateNew.deleteCommand',this); // No I18N
	    var okCallBack=function() {
	        	if($parent_div.hasClass('opmForm')){
	        		var cmdInfo= JSON.parse($parent_div.attr("data-Map")); //No I18N
	      			if(cmdInfo["executionGroupId"]!=undefined && cmdInfo["executionGroupId"]!=null){
		      			operations.executionGroupId = cmdInfo.executionGroupId.toString();
		      			operations.operatedOn = "operationBlock"; //No I18N
	      			operations.deviceProtocolId=$parent_div.closest(".protocolDiv").attr("data-deviceprotocolid"); //No I18N
	      			operationType = cmdInfo.operation;
	      			operations.operationType = operationType;
	    				OPMClient.SettingsNCMConfigController.dtEditOperationDetails.push(operations);
	      			}
	      			if($parent_div.hasClass("other-conf")){
	      				resetOtherConfDiv($parent_div);
	      			}else{
	      				$parent_div.remove();
	      			}
	      		}else{
	      			operations.operatedOn="command";
	      			var command = initCommands();
	      			var commandArray = new Array();
	        		var cmdInfo= JSON.parse($parent_div.attr("cmd-info")); //No I18N
	        		if(cmdInfo["executionGroupId"]!=undefined && cmdInfo["executionGroupId"]!=null){
		      			operations.executionGroupId = cmdInfo.executionGroupId.toString();
		      			operations.recordId = cmdInfo.recordId.toString();
		      			operations.interactionId = cmdInfo.interactionId.toString();
		      			operations.sequenceId = cmdInfo.sequenceId.toString();
	    				OPMClient.SettingsNCMConfigController.dtDeletedCmdTemp.push(operations);
	        		}
	      			$parent_div.find('input').each(function(){
	      				if($(this).attr('type') == 'radio'){
	      					//command.taskhandling= $(this).prop('checked');
	      					moveSelectedToFirst($(this).closest("#cmd-table"),$(this).prop('checked'));
	      				}else{
	      					command[[$(this).attr('name')]] = $(this).val();
	      				}
	      			});
	    			$parent_div.remove();
	      		}
			  }
	    	ncmConfirm("Delete",confirmBody,400,okCallBack); // No I18N
	}else{
		var checked = $parent_div.find('input[type=radio]').prop('checked'); //No I18N
		if(checked == true || checked == 'true'){
				moveSelectedToFirst($parent_div.closest("#cmd-table"),true); //No I18N
		}
		if($parent_div.hasClass("other-conf")){
			resetOtherConfDiv($parent_div);
  		}else{
  			$parent_div.remove();
  		}
	}
/*	if(confirmDelete){
		$parent_div.parent().remove();
	}*/
	if(edit == "sysoid"){
		if($('#addSysOid').find("tbody").children().length==1){
			$('#firstSysRow').show();
		}else{
			$('#firstSysRow').hide();
		}
	}
}

function resetOtherConfDiv($configDiv){
	var classVar=$configDiv.attr('class');//No I18N
	var confName="";
	if(classVar.indexOf("Changedetection_Enable")>=0){
		confName="Changedetection_Enable";//No I18N
	}else if(classVar.indexOf("Changedetection_Disable")>=0){
		confName="Changedetection_Disable";//No I18N
	}else if(classVar.indexOf("Syncconfiguration")>=0){
		confName="Others_Syncconfiguration";//No I18N
	}else if(classVar.indexOf("InterfaceDetails")>=0){
		confName="Others_InterfaceDetails";//No I18N
	}
    var $contentRow=$('<div class="configuration-list-content">'
            +'<svg class="svgIcon size32 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#config-outline" /></svg>'//No I18N
    		+'<div class="fs14 mt-sm mb-xlg"><p>Not Configured, </p><p>Do you want to configure?</p><a onclick="addConfig('+"'"+confName+"'"+')" class="opm_link">Click here</a></div>'
    		+'</div>'); //No I18N
    $configDiv.removeClass("opmForm");
    $configDiv.addClass("add-configuration");
    $configDiv.find(".actionDropDown").remove();
    $configDiv.find(".configuration-list-content").replaceWith($contentRow);
}

function getNCMDTCmdRow(mode,first,protocolName,operationType,operation,cmdMap){
    var devTempDet = ncmDevTemplateDetails;
    var $trRow=$('<tr class="cmd-row"></tr>');
    var $commandStr=$('<td><input type="text" name="command" id=""></td>');
    var $prompt=$('<td><input type="text" name="prompt" id="" placeholder="${UserInput:EnablePrompt}"></td>');
    var $timeOut=$('<td><input type="number" name="timeout" id="" placeholder="20000"></td>');
    var $msgSuffix=$('<td>'+'<div class="selBox msgSuffix">'+'<div>'+
    '<select id="" class="select2 select2-hidden-accessible" data-live-search="true" aria-hidden="true">'+
    '<option value="${LF}">LF</option>'+'<option value="${CRLF}">CRLF</option>'+'<option value="${CR}">CR</option>'+'</select>'+
    '</div>'+'</div>'+'</td>');
    var $promptActionId=$('<td></td>');
    var $divSel=$('<div class="selBox promptActionId"></div>');
    var $divEmpty=$('<div></div>');
    var $select_div=$('<select id="" class="select2 select2-hidden-accessible" data-live-search="true" aria-hidden="true"></select>');
    $select_div.append('<option disabled hidden selected="selected" value="select"><-- SELECT --></option>');
    $select_div.append('<option value="NA"><-- Not Needed --></option>');
    for (var index = 0; index < devTempDet.promptActionIds.length; index++) {
        var arrE = devTempDet.promptActionIds[index];
        if(arrE.PROMPTACTIONID != "NA"){
            $select_div.append('<option value="'+arrE.PROMPTACTIONID+'">'+arrE.PROMPTACTIONID+'</option>');
        }
    }
    if(operation=='edit'){
        $commandStr=$('<td><input type="text" name="command" id=""></td>');
        $commandStr.find('input').val(cmdMap["command"]);
        $prompt=$('<td><input type="text" name="prompt" id="" placeholder="${UserInput:EnablePrompt}" value="'+cmdMap["prompt"]+'"></td>');
        $timeOut=$('<td><input type="text" name="timeout" id="" placeholder="20000" value="'+cmdMap["timeout"]+'"></td>');
        if(mode=="editDT"){
            $trRow=$("<tr class='cmd-row'></tr>");
            $trRow.attr('cmd-info',JSON.stringify(cmdMap));
        }
    }

    var radioBtnName=protocolName;
    //appending select box and div to promptactionid
    $divEmpty.append($select_div);
    $divSel.append($divEmpty);
    $promptActionId.append($divSel);
    //appending all rows
    $trRow.append($commandStr);
    $trRow.append($prompt);
    $trRow.append($timeOut);
    $trRow.append($msgSuffix);
    $trRow.append($promptActionId);
    if(protocolName == "ssh_telnet" && operationType == "Backup"){
    	$("#backup-res").show();
        var $taskHandling=$('<td>'+'<div class="opmRadioBtn">'+'<div data-label="serialModem">'+'<input type="radio" name="taskhandling">'+
    '<label></label>'+'</div>'+'</div>'+'</td>');
        $trRow.append($taskHandling);
        if(operation=='edit'){
        	if(cmdMap["taskhandling"]=="true" || cmdMap["taskhandling"]==true){
                $trRow.find('.opmRadioBtn input').prop('checked',true); //No I18N
        	}
        }else if(first == true || first == 'true'){
            $trRow.find('.opmRadioBtn input').prop('checked',true); //No I18N
        }

    }else{
    	$("#backup-res").hide();
    }
    var $buttons=$('<td><a onclick="addCommand(this)"><svg class="svgIcon size14 mr-md"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#plus"/></svg></a></td>');
    if(first != true && first != 'true'){
    	if(mode=="editDT"){
            $buttons.append('<a class="cmd-delete-icon" onclick="cancelCommand(this,'+"'editDT'"+')"><svg class="svgIcon size14 mr-md"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#delete"/></svg></a>');
    	}else{
            $buttons.append('<a class="cmd-delete-icon" onclick="cancelCommand(this,'+"'newDT'"+')"><svg class="svgIcon size14 mr-md"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#delete"/></svg></a>');
    	}
    }
    $trRow.append($buttons);
    return $trRow;
}
function addCommand(CURRENT_DIV){
	/*
	 * Adds new row of command Details
	 */
	var operation = $(".config-row").attr('id'); //No I18N
	var protocolName = $('#protocolTabs li.active').attr("id");
	var $trRow = getNCMDTCmdRow("newDT",false,protocolName,operation.split('_')[0],"add",null);//No I18N
	if($('#configSelTab').hasClass("config-sel-req")){
		if($("#configSel").val()== 'Select') {
			validateFocus($("#configSel"),null,null,null,Ember.I18n.t('ncm.devicetemplate.selectConfig'));// no i18n
			return false;
		}
	}
	if(!validateDTCommands($(".cmd-row").find("input"))) {
		return;
	}
	$trRow.insertAfter($(CURRENT_DIV).closest('tr'));
	$trRow.find('[name = command]').focus();
	$trRow.find('.select2').select2();
}
function validateConfigNames(){
	if($('#configSelTab').hasClass("config-sel-req")){
		if($("#configSel").val()== 'Select') {
			validateFocus($("#configSel"),null,null,null,Ember.I18n.t('ncm.devicetemplate.selectConfig'));// no i18n
			return false;
		}
	}
	var configNameCheck = '!^*()+[]\';|\"<>?~@$#{}%&`/+-=_';
	var configType=$("#configType").val().trim();
	if(configType== '') {
		validateFocus($("#configType"));// no i18n
		return false;
	}else if(checkForXSS(configType,configNameCheck) === 'failed'){ //No I18N
		validateFocus($("#configType"),null,null,null,Ember.I18n.t('ncm.devicetemplate.noSpecialChars')); //No I18N
		return false;
	}
	if(configType.length>40) {
		validateFocus($("#configType"), "maxlen",Ember.I18n.t('ncm.devicetemplate.configName'), 40);// no i18n
		return;
	}
	var configName=$("#configDispName").val().trim();
	if(configName== '') {
		validateFocus($("#configDispName"));// no i18n
		return false;
	}else if(checkForXSS(configName,configNameCheck) === 'failed'){ //No I18N
		validateFocus($("#configDispName"),null,null,null,Ember.I18n.t('ncm.devicetemplate.noSpecialChars')); //No I18N
		return false;
	}
	if(configName.length>40) {
		validateFocus($("#configDispName"), "maxlen",Ember.I18n.t('ncm.devicetemplate.configDispName'), 40);// no i18n
		return;
	}
	return true;
}
function validateDTCommands(commandMap){
	/*
	 * Validate DT field
	 * ---------------------------
	 * Command -- Empty
	 * timeout -- number
	 * Prompt -- Empty
	 */
	var validFields = true;
	$.each(commandMap,function(){
		var name = $(this).attr('name');
		var value = $(this).val();
		if(name == 'command'){
			if(value == ''){
				validateFocus($(this));
	    		validFields = false;
	    		return false;
			}
		}else if(name == 'timeout'){ //No I18N
			var temp  = parseInt(value,10);
			var objRegExp = /(^\d\d*$)/;
			if(!objRegExp.test(temp) && value != ''){
				validateFocus($(this), 'positive');// no i18n
	    		validFields = false;
	    		return false;
			}
		}
	});
	return validFields;
}
function showProtocol(selProt){
    var prevProt = $('#protocolTabs li.active').attr('id');
    $("#"+prevProt).removeClass("active");
    $("#"+selProt).addClass("active");
    $("#"+prevProt+"_div").hide();
    $("#"+selProt+"_div").show();
	OPMClient.NCMDeviceTemplateController.hideAddedOperationList(selProt);
}

function isDuplicateOperation(operType,protocolId,operName){
	var isDuplicateOperation=false;
    var allOperations=OPMClient.NCMDeviceTemplateController.allOperationNames;
	if(operName=="Backup"){
		$.each($(protocolId).find(".backup-config .opmForm"), function() {
			var exisOper = $(this).attr("class").split("Backup_")[1].toLowerCase();
			if (operType == exisOper) {
				isDuplicateOperation=true;
			}
		});
	}else if(operName=="Upload"){//No I18N
		allOperations=["Running","Startup"];//No I18N
		$.each($(protocolId).find(".upload-config .opmForm"), function() {
			var exisOper = $(this).attr("class").split("Upload_")[1].toLowerCase();
			if (operType == exisOper) {
				isDuplicateOperation=true;
			}
		});
	}
	return isDuplicateOperation;
}
function isOperationAllowed(operType,operName){
	var isOperationAllowed=false;
    var allOperations=OPMClient.NCMDeviceTemplateController.allOperationNames;
    if(operName=="Upload"){
		allOperations=["Running","Startup"];  //No I18N
    }
    var operListInLowerCase=[];
    allOperations.forEach(function(oper){
        if(oper.toLowerCase()==operType){
        	isOperationAllowed=true;
        	return;
        }
    });
    return isOperationAllowed;
}
function saveNewConfiguration(mode,protocol,operName,operation){
    var dataMap={};
    var protocolId='#'+protocol+"_div";//No I18N
    var configDispName=$('#configDispName').val();
    var configType=$('#configType').val();
	dataMap["operType"] = configType;
	dataMap["groupName"] = configDispName;
	var optionMap={Edit:"viewConfig('newDT',this,'edit','"+operName+"')",Clone:"viewConfig('newDT',this,'clone','"+operName+"')",Delete:"cancelCommand(this,'newDT')"};//No I18N
    var iconMap={Edit:"icon-editIcon",Clone:"icon-copyIcon",Delete:"icon-deleteIcon"};//No I18N
    var firstProtocol=$("#protocolTabs").find(".cfg-icon").length==0;
	if (operation == "add" && (operName == "Backup" || operName == "Upload")) {
		var operType=configType.toLowerCase();
		if(isDuplicateOperation(operType,protocolId,operName)){
			validateFocus($("#configType"), null, null, null,Ember.I18n.t('ncm.devicetemplate.duplicateOperation')); // No I18N
			return;
		}
		if(!$('#configSelTab').hasClass("config-sel-req")){
			if(!OPMClient.NCMDeviceTemplateController.isMultiConfigTemplate){
				if(!isOperationAllowed(operType,operName)){
					validateFocus($("#configType"), null, null, null,Ember.I18n.t('ncm.devicetemplate.newOperation.info')); // No I18N
					return;
				}
			}
		}
	}
	var configName = operName;
	if(!validateConfigNames()){
		return;
	}
	if(!validateDTCommands($(".cmd-row").find("input"))) {
		return;
	}
    if(operName=="Backup" || operName=='Upload'){
    	configName=configName+"_"+configType;//No I18N
    }else{
    	delete optionMap.Clone;
    }
    dataMap["operation"]=configName;
    var configCount=$(protocolId).find(".backup-config .configuration-list-box").length;
	var initialConfig=(configCount==1);
    if(operName=="Backup"){
	    if(initialConfig){
	    	if(configType!="Running" && configType!="Startup"){
	    		var msgId=opm_infoMsgs("errorMsg", Ember.I18n.t('ncm.devicetemplate.other.runningOrStartup'));// no i18n
                setTimeout(function() {
                    $("#"+msgId).remove();
                },5000);
	    		return;
	    	}
        	delete optionMap.Delete;
	    }else if(configCount>6){
	    	var cfgCnt=0;
	    	$("#"+protocol+"_div").find(".backup-config .configuration-list-box").each(function(){
    			var operArr=$(this).attr('class').split("Backup_");
    			if(operArr.length==2){
    				var oper=operArr[1].toLowerCase();
    				if(oper!="startup" && oper!="running"){
    					cfgCnt++;
    				}
    			}
    		});
	    	if(configType!="Running" && configType!="Startup"){
		    	if(cfgCnt>=5  && !OPMClient.NCMDeviceTemplateController.isMultiConfigTemplate){
	            var msgId=opm_infoMsgs("infoMsg", Ember.I18n.t('ncm.devicetemplate.maximum.backupConfig'));//No I18N
	            setTimeout(function() {
                	$("#"+msgId).remove();
                },5000);
	            return;
	    	}
        }

        }
    }
    var $commandList=$("<ul></ul>");
    var index=0;
    var cmdArray=new Array();
    if(mode=='editDT'){
		OPMClient.SettingsNCMConfigController.dtDeletedCmdTemp.forEach(function(item){
			OPMClient.SettingsNCMConfigController.dtEditOperationDetails.push(item);
		});
		OPMClient.SettingsNCMConfigController.dtDeletedCmdTemp=[];
    }
    var cmdIdIterIndex=0;
    $('tr.cmd-row').each(function(){
    	var command={};
    	if(mode=='newDT'){
    		command=initCommands();
    	}else if(mode=='editDT'){//No I18N
    		var oldCmdDetails=$(this).attr("cmd-info");
        	if(oldCmdDetails!=null && oldCmdDetails!=undefined){
        		command=JSON.parse(oldCmdDetails);
        	}else{
        		command=initCommands();
        	}
    	}
        $(this).find('input').each(function(){
            if($(this).attr('name')=="prompt" && $(this).val()==''){
                command["prompt"]=$(this).attr('placeholder');
            }else if($(this).attr('name')=="timeout" && $(this).val()==''){
                command["timeout"]=$(this).attr('placeholder');
            }else if($(this).attr('name')=="taskhandling" && $(this).attr("type") == "radio"){//No I18N
            	command[$(this).attr('name')]= $(this).prop('checked').toString();
            }else{
                command[$(this).attr('name')]=$(this).val();
            }
        });
        var messageSuffix=$(this).find(".msgSuffix select").val();
        var promptActionId=$(this).find(".promptActionId select").val();
        command["messageSuffix"]=messageSuffix==null?"${LF}":messageSuffix;//No I18N
        command["promptActionId"]=promptActionId==null?"NA":promptActionId;//No I18N

        if(command["taskhandling"]=="true"){
            $commandList.append($("<li id='"+operName+cmdIdIterIndex+"' class='active'><i class='icon-database-1 fs20'></i></li>"));
        }else{
            $commandList.append($("<li id='"+operName+cmdIdIterIndex+"'></li>"));
        }
        $commandList.find("#"+operName+cmdIdIterIndex).prepend(escapeHTML(command["command"]));
        cmdIdIterIndex++;
        cmdArray.push(command);
    });
    dataMap["commands"]=cmdArray;
    var $dropDownDiv=$('<div class="actionDropDown menu-dots" style="z-index: 2;"><i class="icon-menu-dots"></i></div>');
    var $dropDownList=$('<div class="actionDropDown__list"></div>');
    var $dropDown=$('<ul></ul>');
    $.each(optionMap,function(key,val){
    	$dropDown.append($('<li class="nowrap" onclick="'+val+'"><i class="'+iconMap[key]+' mr-sm"></i>'+key+'</li>'));
    });
    $dropDownList.append($dropDown);
    $dropDownDiv.append($dropDownList);
    var $commandDiv=$('<div class="configuration-list-content"></div>');
    $commandDiv.append($commandList);
    if(operation=='add' && (operName=="Backup" || operName=="Upload")){
        var $configRow=$("<div class='opmForm configuration-list-box w-300 relative "+configName+"'></div>");
        $configRow.attr("data-map",JSON.stringify(dataMap));
        var $titleRow=$('<div class="configuration-list-title">'+
                '<svg class="svgIcon size18 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#file" /></svg><h4 class="configuration-title">'+configDispName+'<h4></div>');//No I18N
        $configRow.append($titleRow);
        $configRow.append($dropDownDiv);
        $configRow.append($commandDiv);
        if(operName=="Backup"){
        	if(initialConfig){
				var $cfgIcon=$('<svg class="svgIcon size16 mr-xs cfg-icon" style="fill:#45bd7f"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#checkmark-circle"/></svg>');
				$("#"+protocol).find(".protocol-name").prepend($cfgIcon);
				if(!firstProtocol){
                     var $delIcon=$('<i class="icon-cancel" onclick="removeProtocolTab(this)"></i>');
                     $("#"+protocol).find(".protocol-name")[0].insertBefore($delIcon[0],null);
				}
		        $(protocolId).find('.noDataContainer').hide();
		        $(protocolId).find('.configDetails').show();
		        $(protocolId).addClass("editedProtocol");
	        }
        	$configRow.insertBefore($(protocolId).find(".backup-config .add-configuration"));
        }else{
        	$configRow.insertBefore($(protocolId).find(".upload-config .add-configuration"));
        }
    }else {
    	var configDiv=$(protocolId).find("."+configName);
    	if(operation=='add'){
    	    configDiv.addClass("opmForm");
        	configDiv.append($dropDownDiv);
    	}else{
            var $titleRow=$('<div class="configuration-list-title">'+
                    '<svg class="svgIcon size18 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#file" /></svg><h4 class="configuration-title">'+configDispName+'</h4></div>');//No I18N
        	configDiv.find(".configuration-list-title").replaceWith($titleRow);
    	}
    	configDiv.attr("data-map",JSON.stringify(dataMap));//No I18N
    	configDiv.removeClass("add-configuration");
    	configDiv.find(".configuration-list-content").replaceWith($commandDiv);
    }
    clearConfigTab();
    $('body').removeClass('slideDivIn-11');
}
function populateDTConfigurations(protocol,execGroups){
    var protocolId='#'+protocol+"_div";//No I18N
	for(var j=0;j<execGroups.length;j++){
		var execGroup=execGroups[j];
		var operName=escapeHTML(execGroup.operationType);
		var configType=escapeHTML(execGroup.operationName);
		var configName=escapeHTML(execGroup.operations);
		var configDispName=escapeHTML(execGroup.groupName);
		var dataMap={};
		dataMap["executionGroupId"]=execGroup.executionGroupId;
	    dataMap["operType"]=configType;
	    dataMap["groupName"]=configDispName;
	    dataMap["operation"]=configName;
		var groupInfo=execGroup.execGroupInfoList;
	    var cmdArray=new Array();
	    var $dropDownDiv=$('<div class="actionDropDown menu-dots" style="z-index: 2;"><i class="icon-menu-dots"></i></div>');
	    var $dropDownList=$('<div class="actionDropDown__list"></div>');
	    var $dropDown=$('<ul></ul>');
	    var optionMap={Edit:"viewConfig('editDT',this,'edit','"+operName+"')",Clone:"viewConfig('editDT',this,'clone','"+operName+"')",Delete:"cancelCommand(this,'editDT')"};//No I18N
	    if(!OPMClient.NCMDeviceTemplateController.isEdit){
		   	optionMap.Edit="viewConfig('newDT',this,'edit','"+operName+"')";//No I18N
		   	optionMap.Delete="cancelCommand(this,'clone')";	 //No I18N
		}
	    if(operName=="Backup"){
	    	var initialConfig=$(protocolId).find(".backup-config .configuration-list-box").length==1;
		    if(initialConfig){
	        	delete optionMap.Delete;
		    }
	    }
	    if(operName!="Backup" && operName!="Upload"){
		    delete optionMap.Clone;
	    }
	    var iconMap={Edit:"icon-editIcon",Clone:"icon-copyIcon",Delete:"icon-deleteIcon"};//No I18N
	    var $commandList=$("<ul></ul>");
	    $.each(optionMap,function(key,val){
	    	$dropDown.append($('<li class="nowrap" onclick="'+val+'"><i class="'+iconMap[key]+' mr-sm"></i>'+key+'</li>'));
	    });
	    $dropDownList.append($dropDown);
	    $dropDownDiv.append($dropDownList);
	    var cmdIdIterIndex=0;
	    for(var k=0;k<groupInfo.length;k++){
	        var command=initCommands();
	        var cmdDetails=groupInfo[k];
	        var origVal=initCommands();
	        if(cmdDetails["messageSuffix"]==null){
	        	cmdDetails["messageSuffix"]="${LF}";//No I18N
	        }
	        if(cmdDetails["promptActionId"]==null){
	        	cmdDetails["promptActionId"]="NA";//No I18N
	        }
	        $.each(cmdDetails,function(key,val){
	        	command[key]=cmdDetails[key].toString();
	        	if(key in origVal){
		        	origVal[key]=cmdDetails[key].toString();
	        	}
	        })
	        if(OPMClient.NCMDeviceTemplateController.isEdit){
		        command["origValue"]=origVal;
	        }
	        if(command["taskhandling"]==true || command["taskhandling"]=="true"){
	            $commandList.append($("<li id='"+operName+cmdIdIterIndex+"' class='active'><i class='icon-database-1 fs20'></i></li>"));
	        }else{
	            $commandList.append($("<li id='"+operName+cmdIdIterIndex+"'></li>"));
	        }
            $commandList.find("#"+operName+cmdIdIterIndex).prepend(escapeHTML(command["command"]));
            cmdIdIterIndex++;
	        cmdArray.push(command);
		}
	    dataMap["commands"]=cmdArray;
	    var $commandDiv=$('<div class="configuration-list-content"></div>');
	    $commandDiv.append($commandList);
	    if(operName=="Backup" || operName=="Upload"){
	        var $configRow=$("<div class='opmForm configuration-list-box w-300 relative "+configName+"' oldGroupName='"+configDispName+"' data-executionGroupId='"+execGroup.executionGroupId+"'></div>");
	        $configRow.attr("data-map",JSON.stringify(dataMap));
	        var $titleRow=$('<div class="configuration-list-title">'+
	                '<svg class="svgIcon size18 mr-sm"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#file" /></svg><h4 class="configuration-title">'+configDispName+'</h4></div>');//No I18N
	        $configRow.append($titleRow);
	        $configRow.append($dropDownDiv);
	        $configRow.append($commandDiv);
	        if(operName=="Backup"){
		    	$configRow.insertBefore($(protocolId).find(".backup-config .add-configuration"));
		        if(initialConfig){
					var $cfgIcon=$('<svg class="svgIcon size16 mr-xs cfg-icon" style="fill:#45bd7f"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#checkmark-circle"/></svg>');
					$("#"+protocol).find(".protocol-name").prepend($cfgIcon);
		        }
	        }else{
	        	$configRow.insertBefore($(protocolId).find(".upload-config .add-configuration"));
	        	$(protocolId).find(".uploadConfDiv").show();
	        }
	    } else {
	    	var configDiv=$(protocolId).find("."+configName);
	    	if(operName=='Changedetection'){
	    		$(protocolId).find(".changeDtctDiv").show();
	    	} else if(operName=='HardwareProp'){//No I18N
	    		configDiv=$(protocolId).find(".Others_InterfaceDetails");
	    	}
	    	configDiv.addClass("opmForm");
	        configDiv.append($dropDownDiv);
	    	configDiv.attr("oldGroupName",configDispName);//No I18N
	    	configDiv.attr("data-map",JSON.stringify(dataMap));//No I18N
	    	configDiv.attr("data-executionGroupId",JSON.stringify(execGroup.executionGroupId));//No I18N
	    	configDiv.removeClass("add-configuration");
	    	configDiv.find(".configuration-list-content").replaceWith($commandDiv);
	    	configDiv.show();
	    }
	}
}

function appendConfig(configName){
    //check if backup configuration exist
	//close operation div (closeoperationdiv)
    var protocolId = $('#protocolTabs li.active').attr('id');

	var initialConfig=($("#"+protocolId+"_div").find(" .backup-config .opmForm").length<=0);
	if(initialConfig){
		var msgId=opm_infoMsgs("errorMsg", Ember.I18n.t('ncm.devicetemplate.other.runningOrStartup'));// no i18n
        setTimeout(function() {
            $("#"+msgId).remove();
        },5000);
		return;
	}
    $("#"+protocolId+"_div").find("."+configName).show();
    $("#operationActionList").find("#"+configName).hide();
    if(configName=='changeDtctDiv'){
    	$("#"+protocolId+"_div").find(".Changedetection_Enable").show();
    	$("#"+protocolId+"_div").find(".Changedetection_Disable").show();
    }
}

function devTemplateAddNext(step,direction){
    if(step=='second'){
    	if(direction=='fwd'){
    		if(validateDevTemAddSt2()){
    			$('#sysoIdStep3').show();
            }
    	}else if(direction=='bwd'){//No I18N
    		$('#configurationStep2').hide();
    		$('#deviceDetailsStep1').show();
         }
    }else{
        if(step=='first'){
        	validateDevTemAddSt1();
            //$('#deviceDetailsStep1').hide();
        }else if(step=='third'){//No I18N
             $('#sysoIdStep3').hide();
             $('#configurationStep2').show();
        }
    }
}

function validateDTFields() {
	/*
	 * Check if atleast any Running or startup configuration present
	 */
	 var validFields=false
    $('#protocolTabs li').each(function(){
    	if(validFields == true) {
    		return;
    	}
    	var tabs_id = $(this).attr('id');
    	var div_id = $("#"+tabs_id+"_div"); // No I18N
    	var initialConfig=(div_id.find(" .backup-config .opmForm").length<=0);
        if(!initialConfig){
        	validFields=true;
        }
    });
	return validFields;
}

function validateDevTemAddSt2() {

	var validFields = validateDTFields();
	if(validFields != true) {
		var msgId=opm_infoMsgs('errorMsg', Ember.I18n.t('ncm.devicetemplate.mandatory.runningOrStartup')); //No I18N
        setTimeout(function() {
        	$("#"+msgId).remove();
        },5000);
		return false;
	}
	if($('#addSysOid').find("tbody").children().length==1){
    	$('#firstSysRow').show();
    }else{
    	$('#firstSysRow').hide();
    }
	$("#configurationStep2").hide();
	return validFields;
}

function validateDevTemAddSt1() {

	if($("#deviceTemplateName").val() == '' || $("#deviceTemplateName").val().trim() == '') {
		validateFocus("#deviceTemplateName");// no i18n
		return;
	}

	if($("#deviceTemplateName").val().length>100) {
		validateFocus($("#deviceTemplateName"), "maxlen", Ember.I18n.t('jsp.commonstr.DeviceTemplateName'), 100);// no i18n
		return;
	}

	if($("#templateDesc").val().length>250) {
		validateFocus($("#templateDesc"), "maxlen", Ember.I18n.t('jsp.commonstr.Description'), 250);// no i18n
		return;
	}

	if($("#osType").val().length>50) {
		validateFocus($("#osType"), "maxlen", Ember.I18n.t('webclient.addServer.ostype'), 50);// no i18n
		return;
	}

	if($("#devVendorList").val()== 'Select') {
		validateFocus($("#devVendorList"));// no i18n
		return;
	}

	if($("#devBaseTemp").val()== 'Select') {
		validateFocus($("#devBaseTemp"));// no i18n
		return;
	}

	$("#deviceDetailsStep1").hide();
	$("#configurationStep2").show();
	var protocolId = $('#protocolTabs li.active').attr('id');
	OPMClient.NCMDeviceTemplateController.hideAddedOperationList(protocolId);
}

/*     ---- NCM DeviceTemplate Functions Ends ----      */

function cloneDevTemplateSlider(step, direction) {
	if(step == "first") {
		validateCloneStep1();
	} else if(step == "second") { // no i18n
		if(direction == "fwd") {
			validateCloneStep2();
		} else {
			$("#cloneStep2").hide();
			$("#secondstepheader").removeClass();
			$("#firststepheader").removeClass();
			$("#firststepheader").addClass("active");
			$("#currentDiv").text(Ember.I18n.t("webclient.dev.details", this));// no i18n
			$("#cloneStep1").show();
		}
	} else {
		$("#cloneStep3").hide();
		$("#thirdstepheader").removeClass();
		$("#secondstepheader").removeClass();
		if($("#deepclone").is(":checked")) {
			$("#secondstepheader").addClass("active");
			$("#currentDiv").text(Ember.I18n.t("webclient.ncm.devicetemplate.cli.configs", this));// no i18n
			$("#cloneStep2").show();
		} else {
			$("#firststepheader").removeClass();
			$("#firststepheader").addClass("active");
			$("#currentDiv").text(Ember.I18n.t("webclient.dev.details", this));// no i18n
			$("#cloneStep1").show();
		}
	}
}

function redirectToServerSettings() {
	location.href=window.OPM.apiclientUrl+"Settings/NcmConfig/NCMServer";//No I18N
}

function ncm_isPositiveInteger(str)
{
	var temp  = parseInt(str,10);
	if ( isNaN(temp) || temp.toString().length != str.length || temp > 2147483647)
	{
		return false;
	}
	var objRegExp = /(^\d\d*$)/;
	return objRegExp.test(temp);
}

function ncm_isInRange(str, min, max)
{
	var temp  = parseInt(str,10);
	if ( isNaN(temp) || temp < min || temp > max)
	{
		return false;
	}

	return true;
}

function validateCloneStep2() {
	var validFields = true;
	$("input.deviceTemplateCLIFields").each(function(){
	    var type = $(this).attr('data-type');
	    var origvalue = $(this).attr('data-origvalue');
	    var value = $(this).val();
	    if(origvalue != value) {
	    	if(type == 'clicommand') {
	    		if(value == '') {
	    			$("#PROTOCOL_LIST").val($(this).closest(".devTemplateProtocol").attr("id"));// no i18n
	    			$("#PROTOCOL_LIST").trigger("change");
	    			validateFocus($(this));
		    		validFields = false;
		    		return;
		    	}
	    	} else if(type == 'clispec') { //No I18N
	    		if(!ncm_isPositiveInteger(value)) {
	    			$("#PROTOCOL_LIST").val($(this).closest(".devTemplateProtocol").attr("id"));// no i18n
	    			$("#PROTOCOL_LIST").trigger("change");
	    			validateFocus($(this), 'positive');// no i18n
		    		validFields = false;
		    		return;
		    	}
	    	}
	    }
	});
	if(validFields != true) {
		return;
	}
	$("#cloneStep2").hide();
	$("#secondstepheader").removeClass();
	$("#secondstepheader").addClass("completed");
	$("#thirdstepheader").addClass("active");
	$("#currentDiv").text(Ember.I18n.t("webclient.SysObjectIDs", this));// no i18n
	$("#cloneStep3").show();
}

function validateFocus(element, type, field, length, dataError) {
	if((type == undefined && dataError == undefined) || type == 'empty') {
		$(element).addClass('validateField error');//No I18N
        $(element).attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty'));//No I18N
	} else if(type == 'duplicate') {// no i18n
		$(element).addClass('validateField error');//No I18N
        $(element).attr('data-error',Ember.I18n.t('webclient.this.field.cannotduplicate'));//No I18N
	} else if(type == 'positive') {// no i18n
		$(element).addClass('validateField error');//No I18N
        $(element).attr('data-error',Ember.I18n.t('webclient.vimonitor.threshold.update.positive.number'));//No I18N
	} else if(type == 'maxlen') {// no i18n
		$(element).addClass('validateField error');//No I18N
        $(element).attr('data-error',Ember.I18n.t('webclient.ncm.devicetemplate.exceededMaxValue', { param0: field, param1: length}, this));//No I18N
	} else if(type == 'nospecialchar') {//No I18N
		$(element).addClass('validateField error');//No I18N
        $(element).attr('data-error',Ember.I18n.t('webclient.ncm.devicetemplate.nospecialcharectarsSpace'));//No I18N
	} else if(type == 'regexpattern') {//No I18N
		$(element).addClass('validateField error');//No I18N
        $(element).attr('data-error',Ember.I18n.t('webclient.ncm.regex.patternerror'));//No I18N
	}else  {
		$(element).addClass('validateField error');//No I18N
		if(dataError != undefined) {
			$(element).attr('data-error',dataError);//No I18N
		}
	}
	$(element).focus();
	opmValidate($(element));
	$('.validateField').on('focusin',function(){
        opmValidate($(this));
    });
    $('.validateField').on('focusout',function(){
        $('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
    });
}

function validateCloneStep1() {
	if($("#templateName").val() == '' || $("#templateName").val().trim() == '') {
		validateFocus("#templateName");// no i18n
		return;
	}

	if($("#templateName").val().length>100) {
		validateFocus($("#templateName"), "maxlen", Ember.I18n.t('jsp.commonstr.DeviceTemplateName'), 100);// no i18n
		return;
	}

	if($("#templateDesc").val().length>250) {
		validateFocus($("#templateDesc"), "maxlen", Ember.I18n.t('jsp.commonstr.Description'), 250);// no i18n
		return;
	}

	if($("#templateOSType").val().length>50) {
		validateFocus($("#templateOSType"), "maxlen", Ember.I18n.t('webclient.addServer.ostype'), 50);// no i18n
		return;
	}

	if($("#newVendor").is(":checked")) {
		if($("#vendorName").val() == '' || $("#vendorName").val().trim() == '') {
			validateFocus("#vendorName");// no i18n
			return;
		}
		if($("#vendorName").val().length>50) {
			validateFocus($("#vendorName"), "maxlen", Ember.I18n.t('webclient.admin.devicetype.newTempl.vendorName'), 50);// no i18n
			return;
		}
	}

	if($("#newPersonality").is(":checked")) {
		if($("#personalityName").val() == '' || $("#personalityName").val().trim() == '') {
			validateFocus("#personalityName");// no i18n
			return;
		}

		var patt   = /^[a-z0-9]+$/i;
		if(!patt.test($("#personalityName").val())) {
			validateFocus($("#personalityName"), "nospecialchar");// no i18n
			return;
		}

		if($("#personalityName").val().length>50) {
			validateFocus($("#personalityName"), "maxlen", Ember.I18n.t('webclient.topo.objectdetails.type'), 50);// no i18n
			return;
		}
	}

	$("#cloneStep1").hide();
	$("#firststepheader").removeClass();
	$("#firststepheader").addClass("completed");
	if($("#deepclone").is(":checked")) {
		if($("#cloneStep2 .devTemplateProtocol .select2-selection").length == 0) {
			$("#cloneStep2 .devTemplateProtocol .select2").select2();
		}
		$("#secondstepheader").addClass("active");
		$("#cloneStep2").show();
		$("#currentDiv").text(Ember.I18n.t("webclient.ncm.devicetemplate.cli.configs", this));// no i18n
		$("input.deviceTemplateCLIFields").off('keyup').keyup(function() {
			var id =$(this).attr("id");
			$("input.deviceTemplateCLIFields[id='"+id+"']").val($(this).val());
		});
	} else {
		$("#secondstepheader").addClass("completed");
		$("#thirdstepheader").addClass("active");
		$("#currentDiv").text(Ember.I18n.t("webclient.SysObjectIDs", this));// no i18n
		$("#cloneStep3").show();
	}
}

function getConfirmation(setting){
    var confirmBody = null;
    var confirmCallBack = null;
    var cancelCallBack = null;
    if(setting == "configletOTP"){
        var newState = $('#configletOtpReq').prop('checked');
        confirmBody = Ember.I18n.t("webclient.ncm.configlet.OTP.disable",this); //No I18N
        if(newState) {
            confirmBody = "";
            confirmBody = Ember.I18n.t("webclient.ncm.configlet.OTP.enable",this); //No I18N
        }
        confirmCallBack = function() {
            $('#configletOtpReq').prop('checked', newState);
        }
        cancelCallBack = function() {
            $('#configletOtpReq').prop('checked', !newState);
        }
	}else if(setting == "allowConfiglet"){ //No I18N
	    var newState = $('#configletForWriteUser').prop('checked');
        confirmBody = Ember.I18n.t("webclient.ncm.writeuser.allow.configlet.disable",this); //No I18N
        if(newState) {
            confirmBody = Ember.I18n.t("webclient.ncm.writeuser.allow.configlet.enable",this); //No I18N
        }
        confirmCallBack = function() {
            $('#configletForWriteUser').prop('checked', newState);
        }
        cancelCallBack = function() {
            $('#configletForWriteUser').prop('checked', !newState);
        }
	}
	else if(setting == "allowSchedule"){
        var newState = $('#scheduleForWriteUser').prop('checked');
        confirmBody = Ember.I18n.t("webclient.ncm.writeuser.allow.schedule.disable",this); //No I18N
        if(newState) {
            confirmBody = Ember.I18n.t("webclient.ncm.writeuser.allow.schedule.enable",this); //No I18N
        }
        confirmCallBack = function() {
            $('#scheduleForWriteUser').prop('checked', newState);
        }
        cancelCallBack = function() {
            $('#scheduleForWriteUser').prop('checked', !newState);
        }
    }else if(setting == "allowExcludeCriteria"){ //No I18N
        var newState = $('#excludeCriteriaForWriteUser').prop('checked');
        confirmBody = Ember.I18n.t("webclient.ncm.writeuser.allow.excludecriteria.disable",this); //No I18N
        if(newState) {
            confirmBody = Ember.I18n.t("webclient.ncm.writeuser.allow.excludecriteria.enable",this); //No I18N
        }
        confirmCallBack = function() {
            $('#excludeCriteriaForWriteUser').prop('checked', newState);
        }
        cancelCallBack = function() {
            $('#excludeCriteriaForWriteUser').prop('checked', !newState);
        }
    }
	if(confirmBody != null && confirmCallBack != null && cancelCallBack != null) {
	    ncmConfirm(null, confirmBody, 400, confirmCallBack, null,cancelCallBack);
	}

}
function setCursorToEnd(element) {
	var range = document.createRange();
	var sel = window.getSelection();
	range.selectNodeContents(element);
	range.collapse(false);
	sel.removeAllRanges();
	sel.addRange(range);
}

function updateNCMTerminalEmulator (emulationData) {
    $("#autofocus_id").text(emulationData.emulatorContent);

	var virtualSessionEle = $("#virtualSession").get(0); // No I18N
	if(virtualSessionEle){
		var emulatorTermSec = $("#ncmEmulatorSection .terminal").get(0); // No I18N
		if(virtualSessionEle.scrollHeight == (emulatorTermSec.scrollHeight + 10)){
			$('#virtualSession').animate({scrollTop: emulatorTermSec.scrollHeight}, 0); // No I18N
		}
		var emulator = $("#autofocus_id").get(0); // No I18N
    	setCursorToEnd(emulator);
	}
}

function pushNCMGridInstantlyJS(notificationData) {
	if(notificationData != undefined && notificationData.gridId != null && $("#"+notificationData.gridId).length > 0) {
		var updateData = notificationData.data;
		if(updateData != null && updateData.length > 0) {
			for (var index = 0; index < updateData.length; index++) {
				var array_element = updateData[index];
				if(array_element.asList != undefined && array_element.asList == true) {
					for (var index1 = 0; index1 < array_element.columns.length; index1++) {
						var columnData = array_element.columns[index1];
						$("#"+notificationData.gridId).setCell(array_element.id,columnData.id,columnData.value);
					}
				} else {
					for (var col in array_element.columns) {
						$("#"+notificationData.gridId).setCell(array_element.id,col,array_element.columns[col]);
					}
				}
			}
		} else {
			$("#"+notificationData.gridId).trigger('reloadGrid');
		}
		if(notificationData.updateTabCount == true && window.OPM.currentView != null && window.OPM.currentView.name != null && window.OPM.currentView.name.indexOf('Inventory.List.ConfigMgmt.Sub') != -1) {
			try {
				var rowSelArray = $('#' + notificationData.gridId).jqGrid('getGridParam','selarrrow');
				if(updateData != null && updateData.length > 0) {
					if(rowSelArray != null && rowSelArray.length > 0) {
						$('#' + notificationData.gridId).jqGrid('resetSelection');
						DeviceListCommonOptions();
					}
					OPMClient.Inventory.updateConfigTabCount();
					if(rowSelArray != null && rowSelArray.length > 0) {
						for (i = 0; i < rowSelArray.length; i++) {
							$('#' + notificationData.gridId).jqGrid('setSelection', rowSelArray[i], false);
						}
						DeviceListCommonOptions();
					}
				} else {
					setTimeout(function(){
						if(rowSelArray != null && rowSelArray.length > 0) {
							$('#' + notificationData.gridId).jqGrid('resetSelection');
							DeviceListCommonOptions();
						}
						OPMClient.Inventory.updateConfigTabCount();
						if(rowSelArray != null && rowSelArray.length > 0) {
							for (i = 0; i < rowSelArray.length; i++) {
								$('#' + notificationData.gridId).jqGrid('setSelection', rowSelArray[i], false);
							}
							DeviceListCommonOptions();
						}
					},300);
				}
			} catch (e) {
				// TODO: handle exception
			}
		}
	}
}

function populateNCMConfigSearchResults(notificationData) {
	if(notificationData.searchDone == true) {
	    //Handle what to do when search is completed. Like showing message, loading complete result etc
		var cls = "successMsg"; //No I18N
		if(notificationData.offset >= notificationData.total) {
			opm_infoMsgs(cls,Ember.I18n.t("webclient.snapshot.config.search.completed", this)); //No I18N
		}
		OPMClient.NCMInventoryConfigSearchController.setProperties({isSearchInProgress:false,isSearchCompleted:true});
		OPMClient.NCMInventoryConfigSearchController.loadCompleteSearchResult();
	} else {

        OPMClient.NCMInventoryConfigSearchController.setProperties({processedCount:notificationData.offset,totalCount:notificationData.total,totalFindings:notificationData.totalMatchesFound});
		for (var index = 0; index < notificationData.versionData.length; index++) {
			var rowData = notificationData.versionData[index];
			OPMClient.NCMInventoryConfigSearchController.searchResultsData.push(rowData);
			if($("#config_srchList").getGridParam("reccount") < 25) {
				jQuery("#config_srchList").addRowData(rowData.VERSION_ID, rowData);//No I18N
			}
		}
	}
}

function NCMonChangeDeleteAudit() {
	if($("#delete_records").prop("checked") == true) {
		$("#AUDIT_HISTORY_SIZE").attr("disabled", false);//No I18N
	} else {
		$("#AUDIT_HISTORY_SIZE").attr("disabled", "disabled");//No I18N
	}
}

function showSparkAuditSettings() {
	if($("#accessSpark").prop("checked") == true) {
		$("#sparkAudit").show();	//No I18N
	} else {
		$("#sparkAudit").hide();	//No I18N
	}
}

function excludeAlarmCheckboxChange(){
    	if($("#excludeConfigChngAlarmAll").prop("checked") == true) {
    		$(".configChngAlarmExcludeUsrList").hide();	//No I18N
    		$(".changedByNAExcludeAlarm").hide();	 //No I18N
    	} else {
    		$(".configChngAlarmExcludeUsrList").show();	//No I18N
    		$(".changedByNAExcludeAlarm").show();	 //No I18N
    	}
}

function showAuthorizeUserList(){
	if($("#authorizeAllchanges").prop("checked") == true) {
		$("#configChantAuthUserList").hide();	//No I18N
	} else {
		$("#configChantAuthUserList").show();	//No I18N
	}
}

function ncmIndexOf(array, arrayEl) {
	for (var index = 0; index < array.length; index++) {
		if(array[index] == arrayEl) {
			return index;
		}
	}
	return -1;
}

function changeNCMSelectList(str,divId) {
    $("#"+divId+" option").each(function () {//No I18N
        if ($(this).text().toLowerCase().indexOf(str.toLowerCase()) != -1) {
            $(this).show();
        } else {
            $(this).hide()
        }
    });
}

function NCMonChangeDeleteVersion(clickedId) {
	if(clickedId == 'MLatest') {
		if($("#MLatest").prop("checked") == true){
		    $("#VERSION_HISTORY_SIZE").attr("disabled", false); //No I18N
		}else{
		    $("#VERSION_HISTORY_SIZE").attr("disabled", "disabled");
		}
	} else if(clickedId == 'MLatestDays'){ //No I18N
	    if($("#MLatestDays").prop("checked") == true){
		    $("#VERSION_HISTORY_SIZE_DAYS").attr("disabled", false); //No I18N
		}else{
            $("#VERSION_HISTORY_SIZE_DAYS").attr("disabled", "disabled"); //No I18N
		}
	} else if(clickedId == 'SYSOG_MSG_HISTORY_SIZE') { //No I18N
		if($('#SYSOG_MSG_HISTORY_SIZE_CHK').prop('checked') == true) {
			$("#"+clickedId).attr("disabled", false); //No I18N
		} else {
			$("#"+clickedId).attr("disabled", "disabled"); //No I18N
		}
	} else if(clickedId == 'FV_HISTORY_RETAIN_DAYS') { //No I18N
	    //No check box for this field, so always enable it
        $("#"+clickedId).attr("disabled", false); //No I18N
    }
}

function displayImportFileVarBox(varType)
{
	$("#sameForAllDiv").css('display','none');  //No I18N
	$("#useCsvImportDiv").css('display','none'); //No I18N

	if(varType.id === "sameForAll") //No I18N
	{
		$("#sameForAllDiv").css('display','block'); //No I18N
		$("#exec-devices-div").show(); //No I18N
	}
	else
	{
		$("#exec-devices-div").hide(); //No I18N
		$("#useCsvImportDiv").css('display','block'); //No I18N
	}
}

function checkNewNCMVendor(varType)
{
	$("#selectVendorDiv").hide();  //No I18N
	$("#newNCMVendorDiv").hide(); //No I18N

	if(varType.id === "selVendor") //No I18N
	{
		$("#selectVendorDiv").show(); //No I18N
	}
	else
	{
		$("#newNCMVendorDiv").show(); //No I18N
	}
}

function changeDeviceTypeToClone(CHANGE_DEV_TYPE) {
	$("#selNCMPersonalityDiv").hide();  //No I18N
	$("#newNCMPersonalityDiv").hide(); //No I18N

	if(CHANGE_DEV_TYPE.id === "selPersonality") //No I18N
	{
		$("#selNCMPersonalityDiv").show(); //No I18N
	}
	else
	{
		$("#newNCMPersonalityDiv").show(); //No I18N
	}
}

function ncm_validateMultipleEmail(paramVal)
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

function underlined(cellValue, options, rowdata, action)
{
	return escapeHTML(cellValue);
};





function enableNotification(status,gridTable,row,id,id1) {

	var selRowIds = [row];
    var confirmCallBack = function() {
		var data = {

		};
		data.RULE_ID = JSON.stringify(selRowIds);
		data.ACTION_TYPE = status; // No I18N

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmconfig/updateChangeRule',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var commonCallBack = function() {
    	$(gridTable).delay(4000).trigger('reloadGrid'); //No I18N
		setTimeout(function () {
        	$('#DENotifications').jqGrid('setGridWidth',$('#complianceContent').width()-5);//No I18N
    	},100);
	}

	var confirmBody = Ember.I18n.t("ncm.changemanagement.rule.status.change.confirm",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack, null, null, null, commonCallBack);
}



function enableSchedule(status,gridTable,row) {
	var selRowIds = [row];
	var data = {

	};
	data.SCHEDULE_ID = JSON.stringify(selRowIds);
	data.ACTION_TYPE = status; // No I18N


	var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmbackup/enableSceduleConfig',data)//No I18N
	var	cls = "errorMsg"; //No I18N
    if(response.isSuccess) {
    	cls = "successMsg"; //No I18N
    }
	opm_infoMsgs(cls,response.statusMsg); //No I18N
	$(gridTable).delay(4000).trigger('reloadGrid'); //No I18N

}
function accDevicesColumnRenderer(cellValue, options, rowdata, action) {
	return '<img align="center" class="inv_opr" src="/apiclient/fluidicv2/img/devices_ico.gif"></img>&nbsp;'+Ember.I18n.t("ncm.acd.Show_Devices",this); // No I18N
};
function showAlert(text)
{
	opm_infoMsgs("errorMsg", text);//No I18N
}

function getEmberSelectedRows(jqgridid,colName)
{
    if(colName !== undefined && colName !== ""){
	var arr = new Array();
	var grid = jQuery("#"+jqgridid);	//No I18N
            var selRowIds = grid.jqGrid('getGridParam','selarrrow');	//No I18N
            $.each(selRowIds, function(){
                var id = grid.jqGrid('getCell', this, colName); //No I18N
                arr.push(id);
            });
	if(arr.length > 0){
           return arr.toString();
        }
    }
    return "";
}


function changeConfigTimeFilter(type) {
	if(type == 'NEVER') { // No I18N
		$("#daily-recurrence-div").hide();
		$("#weekly-recurrence-div").hide();
		$("#monthly-recurrence-div").hide();
		$("#mailToIds-div").hide();
//		$("#device_GroupSelection-div").hide();
		$("#emailNotifOnly-div").hide();
		$("#isAllConfigSameFolder").hide();
		$("#never-recurrence-div").show();
	} else if(type == 'DAILY') { // No I18N
		$("#weekly-recurrence-div").hide();
		$("#monthly-recurrence-div").hide();
		$("#mailToIds-div").show();
//		$("#device_GroupSelection-div").show();
		$("#emailNotifOnly-div").show();
		$("#isAllConfigSameFolder").show();
		$("#never-recurrence-div").hide();
		$("#daily-recurrence-div").show();
	} else if(type == 'WEEKLY') { // No I18N
		$("#monthly-recurrence-div").hide();
		$("#mailToIds-div").show();
//		$("#device_GroupSelection-div").show();
		$("#emailNotifOnly-div").show();
		$("#isAllConfigSameFolder").show();
		$("#never-recurrence-div").hide();
		$("#daily-recurrence-div").hide();
		$("#weekly-recurrence-div").show();
	} else if(type == 'MONTHLY') { // No I18N
		$("#monthly-recurrence-div").show();
		$("#mailToIds-div").show();
//		$("#device_GroupSelection-div").show();
		$("#emailNotifOnly-div").show();
		$("#isAllConfigSameFolder").show();
		$("#never-recurrence-div").hide();
		$("#daily-recurrence-div").hide();
		$("#weekly-recurrence-div").hide();
	}
	changeComponentSelection(type);
}

function changeComponentSelection(type) {
	if(type == 'NEVER') {
		$("#device_GroupSelection-div").hide();
		$('#selectSpecDeviceDiv').hide();
		$('#componentSelection').hide();
	}
	else {
		$('#componentSelection').show();
		var componentSelection = $("input[name='devicesType']:checked").val();
		if(componentSelection == "SpecificDevice") {
			$("#device_GroupSelection-div").hide();
			$('#selectSpecDeviceDiv').show();
		}
		else {
			$("#device_GroupSelection-div").show();
			$('#selectSpecDeviceDiv').hide();
		}
	}
}
function markEOL(RESOURCEID, DISPLAYTYPE, MODEL, SERIES) {
	var data = {

	};
	data.RESOURCEID = RESOURCEID;
	data.DISPLAYTYPE = DISPLAYTYPE;
	data.MODEL = MODEL;
	data.SERIES = SERIES;

	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/markEOL'; //No I18N
	$.ajax({
		url: ajaxRequestUrl,
		dataType: 'json',//No I18N
		type: 'POST',//No I18N
		data: data,
		success: function(jsonData) {
			if(jsonData.isSuccess != null && jsonData.isSuccess == false) {
				opm_infoMsgs("errorMsg", jsonData.statusMsg); //No I18N
			} else {
				$('#DEEOLNAList').trigger('reloadGrid'); //No I18N
			}
		}
	});
}

function reviewPCIUpdate(data, refresh) {
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/reviewPCI'; //No I18N
	$.ajax({
		url: ajaxRequestUrl,
		type: 'POST',//No I18N
		dataType: 'json',//No I18N
		data: data,
		success: function(jsonData, status) {
			if(jsonData.isSuccess == false) {
				opm_infoMsgs("errorMsg", jsonData.statusMsg); //No I18N
			}
			if(refresh == true) {
				$("#DEMyPCIReviewDetails").trigger('reloadGrid'); //No I18N
			} else {
				window.history.back();
			}
		}
	});
}

function validityStatusFormatter(cellValue, options, rowdata, action)
{
	var format = '';//No I18N

	if(cellValue == "true" || cellValue == true) // No I18N
    {
		format = '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+rowdata[4]+'" class="opmThumbsUp">'//No I18N
    }
    else if(cellValue == "false" || cellValue == false) // No I18N
    {
    	format = '<img src="/apiclient/fluidicv2/img/transparent.png" title="'+rowdata[3]+'" class="opmThumbsDown">'//No I18N
    }
    else if(cellValue == "-") // No I18N
    {
    	format = '<i class="icon-status3" style="float:none !important"></i>'//No I18N
    }

	return format;


};

function updateReportforDGChange()
{
	var reportType=OPMClient.ReportsDetailsController.CUSTOMIZE_DATA_VIEWNAME;
	switch (reportType) {
    case 'OSVersionReport_RTab'://No I18N
        changeFirmwareDGroup();
        break;
    case 'ConflictReport_RTab'://No I18N
        changeConfigConflictDGroup();
        break;
    case 'ConfigChangesReport_RTab'://No I18N
        changeChangesDGroup();
        break;
    case 'DeviceManagementStatusReport_RTab'://No I18N
       	changeDevMgmtStatusDGroup();
        break;
    case 'ComplianceReport_RTab'://No I18N
        complianceChangeStatusDGroup();
        break;
    case 'DeviceStatusReport_RTab'://No I18N
        changeDevStatusDGroup();
        break;
    case 'DeviceModelReport_RTab'://No I18N
    	changeDevModelDGroup();
    break;
    case 'OperationAuditReport_RTab'://No I18N
		changeDevAuditStatusDGroup();
	break;
	case 'ConfigChangeTrendReport_RTab'://No I18N
		changeTrendDGroup();
	break;
	case 'ConfigAnalysis'://No I18N
		changeConfigAnalysisDGroup();
	break;
	case 'SecurityAudit'://No I18N
		changeSecAuditDGroup();
	break;
	case 'FirmVulVersionReport_RTab'://No I18N
		changeFirmVulnFirmwareReport();
		break;
    case 'FirmVulDeviceReport_RTab'://No I18N
        changeFirmVulnDeviceReport();
        break;
    case 'FirmVulCveReport_RTab'://No I18N
        changeFirmVulnCveReport();
        break;
    case 'AnnotationReport_RTab'://No I18N
    	changeAnnotationReportDG();
        break;
    case 'FvDeviceVulnHistoryReport_RTab'://NO I18N
        changeDeviceVulnHistoryDGroup();
        break;
    case 'OsVersionHistoryReport_RTab'://NO I18N
        changeOsVersionHistoryDGroup();
        break;
    case 'DeviceCredentialProfilesReport_RTab'://NO I18N
        changeDeviceCredentialProfilesDGroup();
        break;
    case 'DeviceCredentialsReport_RTab'://NO I18N
        changeDeviceCredentialsDGroup();
        break;
	}
}

function changeAnnotationReportDG() {
    var dGroup = $('#DEVICEGROUPS').val();//No I18N
    OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.getAnnotationReportForDG(dGroup);
}

function changeFirmVulnCveReport() {
    var dGroup = $('#DEVICEGROUPS').val();//No I18N
    OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.getFirmwareVulCveReportDetails(dGroup);
}

function changeFirmVulnDeviceReport() {
    var dGroup = $('#DEVICEGROUPS').val();//No I18N
    OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.getFirmwareVulDeviceReportDetails(dGroup);
}

function changeFirmVulnFirmwareReport() {
    var dGroup = $('#DEVICEGROUPS').val();//No I18N
    OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.getFirmwareVulVersionReportDetails(dGroup);
}

function changeConfigAnalysisDGroup() {
	var dGroup = $('#DEVICEGROUPS').val();
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getConfigAnalysisDetails(dGroup);
}

function changeSecAuditDGroup() {
	var dGroup = $('#DEVICEGROUPS').val();
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getSecurityAuditDetails(dGroup);
}

function parsePeriodForChangeTrend(period) {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.Report.getConfigurationChangeTrendDetails(dGroup, period);
}

function changeDevAuditStatusDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getDevAuditStatusDetails(dGroup);  //No I18N
}

function changeTrendDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
//	OPMClient.NCMReport.getConfigurationChangeTrendDetails(dGroup);  //No I18N
	getChangeTrendTimePeriod();
}

function changeFirmwareDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getOSVersionDetails(dGroup);  //No I18N
}

function changeConfigConflictDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	//OPMClient.Report.updateDeviceCount(dGroup);  //No I18N
	OPMClient.NCMReport.getStartupRunningConflictDetails(dGroup);  //No I18N
}

function changeChangesDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	var period = {};
	var timeCmp = $("input[name='custime']:checked").val();
	if(timeCmp == "time") {
		period.isDefault = true;
		period.selection = $("input[name='timeperiods']:checked").val();
	}  else {
		period.isDefault = false;
		period.fromTime = new Date($("#once_startat").val() + ' 00:00:00').getTime();
		period.toTime = new Date($("#once_endat").val() + ' 23:59:59').getTime();
	}
	//OPMClient.Report.updateDeviceCount(dGroup);  //No I18N
	OPMClient.NCMReport.getConfigurationChangesDetails(dGroup,period);
}

function changeDevMgmtStatusDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getDevMgmtStatusDetails(dGroup)  //No I18N
}


function complianceChangeStatusDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	//OPMClient.Report.updateDeviceCount(dGroup);  //No I18N
	OPMClient.NCMReport.getComplianceReportDetails(dGroup);  //No I18N
}
function changeDevStatusDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getHealthStatusDetails(dGroup);  //No I18N
}

function changeDevModelDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
	OPMClient.NCMReport.getDevInventoryDetails(dGroup);  //No I18N
}

function changeDeviceVulnHistoryDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.loadDeviceVulnHistoryData(OPMClient.ReportsDetailsController.DG_ID);
}

function changeOsVersionHistoryDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.loadOsVersionHistoryData(OPMClient.ReportsDetailsController.DG_ID);
}

function changeDeviceCredentialProfilesDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.loadDeviceCredentialProfilesData(OPMClient.ReportsDetailsController.DG_ID);
}

function changeDeviceCredentialsDGroup() {
	var dGroup = $('#DEVICEGROUPS').val(); //No I18N
	OPMClient.ReportsDetailsController.DG_ID=dGroup;
    OPMClient.NCMReport.loadDeviceCredentialsData(OPMClient.ReportsDetailsController.DG_ID);
}

function changeDGDevice(index) {
	if(index == '1') {
		$("#selectGroupDiv").css('display','block');
	} else {
		$("#selectGroupDiv").css('display','none');
	}
	if(index == '2') {
		$("#SpecificCriteria-div").css('display','block');
	} else {
		$("#SpecificCriteria-div").css('display','none');
	}
	if(index == '3') {
		$("#useCsvImportDiv").css('display','block');
	} else {
		$("#useCsvImportDiv").css('display','none');
	}
	if(index == '4') {
		$("#selectSubGroupDiv").css('display','block');
	} else {
		$("#selectSubGroupDiv").css('display','none');
	}
	if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected){
		displayDGNote();
	}
}


function getChangeTrendTimePeriod() {
	//var dgId = $("#DEVICEGROUPS1").val();
	var dgId = $("#DEVICEGROUPS").val();
//	var timecmp = $("input[name='custime']:checked").val();
//	var d = new Date();
//	var toTime = d.getTime();
//	var fromTime = toTime;
//	var midnight = new Date(); // To make it to midnight of today
//
//	midnight.setHours( 0 );
//	midnight.setMinutes( 0 );
//	midnight.setSeconds( 0 );
//	midnight.setMilliseconds( 0 );
//	var midnightTime = midnight.getTime();
//	var midnight = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
//	var todayMidnight = midnight.getTime();
//	if(timecmp == 'time') {
//		period.isDefault = true;
//		var selection = $("input[name='timeperiods']:checked").val();
//		period.selection = selection;
//	    if(selection == 'today') {
//	  		fromTime = midnightTime;
//		} else if(selection == 'yesterday') { //NO I18N
//			//toTime = midnightTime-1;
//			fromTime = midnightTime - (24*60*60*1000);
//			var endTime = new Date(fromTime); // To make it to midnight of today
//			endTime.setHours( 23 );
//			endTime.setMinutes( 59 );
//			endTime.setSeconds( 59 );
//			var endTimeTimestamp=(new Date(endTime)).getTime();
//			toTime =endTimeTimestamp;
//		} else if(selection == 'last_7_days') { //NO I18N
//			fromTime = midnightTime - (24*60*60*1000*6);
//		} else {
//			var midnight = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()-29));
//			fromTime = midnightTime - (24*60*60*1000*29);
//		}
//	    $('#timeFilterLabel').text($("input[name='timeperiods']:checked").siblings('label').text()); // No I18N
//	} else {
//		var onceStartId = 'once_startat';//NO I18N
//		var onceEndId = 'once_endat';//NO I18N
//		if(OPMClient.NCMFirmwareVulnerability.isDashboard === true || OPMClient.NCMFirmwareVulnerability.firmVulnInvPag === true){
//			onceStartId = onceStartId + '_fv';//NO I18N
//			onceEndId = onceEndId + '_fv';//NO I18N
//		}
//		if(!opm_validateFields({'empty':[onceStartId, onceEndId]})){
//			return;
//		}
//		fromTime = new Date($('#'+onceStartId).val() + ' 00:00:00').getTime();
//		toTime = new Date($('#'+onceEndId).val() + ' 23:59:59').getTime();
//
//		$('#timeFilterLabel').text(getYYYYMMDDDate(new Date($('#'+onceStartId).val())) + ' - ' + getYYYYMMDDDate(new Date($('#'+onceEndId).val())));
//	}
//	period.fromTime = fromTime;
//	period.toTime = toTime;
    var onceStartId = 'once_startat';//NO I18N
    var onceEndId = 'once_endat';//NO I18N
    if(OPMClient.NCMFirmwareVulnerability.isDashboard === true || OPMClient.NCMFirmwareVulnerability.firmVulnInvPag === true){
        onceStartId = onceStartId + '_fv';//NO I18N
        onceEndId = onceEndId + '_fv';//NO I18N
    }
	var period = getCustomTimeSelected(onceStartId,onceEndId);
	if(OPMClient.NCMFirmwareVulnerability.isDashboard === true){
	    var timeDuration = {};
	    if(period && period.isDefault){
	        timeDuration = period;
	    }
	    else{
	        timeDuration.period = period;
	    }
	    var TIME_DURATION = OPMClient.NCMFirmwareVulnerability.timeFilterClass(timeDuration);
        OPMClient.NCMFirmwareVulnerability.updateFirmVulDiscoverDashWidget(TIME_DURATION);
	}
	else {

		if(OPMClient.ReportsDetailsController.isNCMConfigChangeReport)
			{
				OPMClient.NCMReport.getConfigurationChangesDetails(dgId,period);
			}
		else
			{
				OPMClient.NCMReport.getConfigurationChangeTrendDetails(dgId,period);
			}
	}
	slideOut(1);
}

function getYYYYMMDDDate(date) {
	var dd = date.getDate();
	var mm = date.getMonth()+1; //January is 0!

	var yyyy = date.getFullYear();
	if(dd<10){
	    dd='0'+dd;
	}
	if(mm<10){
	    mm='0'+mm;
	}
	return yyyy + '/' + mm + '/' + dd;
}

function updateEOLReport() {
	  var url = window.OPM.apiUrlPattern + '/ncmreports/updateEOL'; //No I18N
	  $.ajax({
		  url: url,
		  dataType: 'json',//No I18N
		  type: 'POST',//No I18N
		  success: function(jsonData) {

		  	var	cls = "errorMsg"; //No I18N
	            	if(jsonData.isSuccess) {
	            		cls = "successMsg"; //No I18N
	            	}
	            	opm_infoMsgs(cls,jsonData.msg);


			  if(jsonData.isSuccess==true||jsonData.isSuccess=='true')
				  {
				    OPMClient.NCMReport.getEOLEOSReportDetails();
				  }
			  else
				  {
				  	opm_infoMsgs("errorMsg",jsonData.msg);//No I18N

				  }
		  }
	  });
}

function requestEOL() {
	var url = window.OPM.apiUrlPattern + '/ncmreports/requestToUpdateEOLEOSData'; //No I18N
	  $.ajax({
		  url: url,
		  dataType: 'json',//No I18N
		  type: 'POST',//No I18N
		  success: function(jsonData) {
			  if(jsonData.isSuccess==true||jsonData.isSuccess=='true') {
			  	opm_infoMsgs("successMsg", jsonData.msg);//No I18N
			  } else {
			  	opm_infoMsgs("errorMsg", jsonData.msg);//No I18N
			  }
		  }
	  });
	  closeEmailReport();
}

function uploadConfigletPreview(isSchPreview) {

	var filename = '';
	var configletId = '';

	if(isSchPreview)
		{
		configletId = $('#CONFIGLETS').val(); //No I18N
		}
	else
		{
			configletId=OPMClient.SettingsNCMConfigController.configletId;
		}
	filename = document.getElementById('importConfigletVar');
	var file=filename.files[0];
	var data = new FormData();
	data.append('file',file ); //No I18N

	if(file==undefined)
    {
        alert(Ember.I18n.t('jsp.common.csvTxtformatfile',this)); //No I18N
    }
    else
    {
        var fileName=file.name
        var fileExt=fileName.split(".");
        if(fileName.split(".") ===fileName)
        {
            alert(Ember.I18n.t('jsp.common.csvTxtformatfile',this)); //No I18N
        }
        else if((fileExt[1] !== 'csv')&&(fileExt[1] !== 'txt'))
        {
            alert(Ember.I18n.t('jsp.common.csvTxtformatfile',this)); //No I18N
        }
         else {
			//			document.getElementById('resDiv').style.display = 'block'; //No I18N
			//			document.getElementById('resDiv').style.backgroundColor = '#FFFFFF'; //No I18N
			//			document.getElementById('resDiv').innerHTML = Ember.I18n.t('webclient.discovery.discinprogress',this)+" "+Ember.I18n.t('webclient.credential.snmp.pleasewait',this); //No I18N

			var colNamesList = [ Ember.I18n.t("jsp.commonst.HostName", this),//No I18N
					Ember.I18n.t("jsp.commonstr.Value", this) ]; //No I18N
			var colModelList = [ {
				name : 'hostName',//No I18N
				index : 'hostName',//No I18N
				formatter : configlethostNameFormatter
			},
			{
				name : 'value',//No I18N
				index : 'value',//No I18N
				formatter : configletContentFormatter

			}
			];
			var defaultOptions = {
				searchOption : true,
				isNCM: true
			};
			var isUseFirstRow='';
			if($('#firstValue').is(":checked"))
				{
				isUseFirstRow=true;
				}
			else
				{
				isUseFirstRow=false;
				}
			var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/uploadConfigletPreView?TEMPLATE_ID=' + configletId+'&USE_FIRSTVALUE_FORALL='+isUseFirstRow; //No I18N
			$.ajax({
				type : "POST", //No I18N
				url : ajaxRequestUrl,
				data : data,
				cache : false,
				processData : false,
				contentType : false,
				success : function(jsonData) {
					if(jsonData.isSuccess== 'false' || jsonData.isSuccess== false)
					{
						opm_infoMsgs("errorMsg",jsonData.ERROR); //No I18N
					}
					if(isSchPreview)
					{
						$("#exec-variables-div").hide();
					}
					else
					{
						$("#addFieldDiv").hide();
					}
						$("#configletPreviewDiv").show();
						$('#DEUnavailable').jqGrid('GridUnload');//No I18N
						$('#DEAvailable').jqGrid('GridUnload');//No I18N
						if (jsonData.INVALID_VARVALUES_MAP.length > 0) {
							$("#DEUnavailableDiv").show();
							opm_loadJQgridWithData("#DEUnavailable", jsonData.INVALID_VARVALUES_MAP, colNamesList, colModelList, "", "", "", defaultOptions); //No I18N
						} else{
							$("#DEUnavailableDiv").hide();
						}
						if (jsonData.VALID_VARVALUES_MAP.length > 0) {
							$("#DEAvailableDiv").show();
							opm_loadJQgridWithData("#DEAvailable", jsonData.VALID_VARVALUES_MAP, colNamesList, colModelList, "", "", "", defaultOptions); //No I18N
						} else {
							$("#DEAvailableDiv").hide();
							$('#NoDeviceAvailable').css('display', 'block'); //No I18N
						}

				}
			});
		}
	}
}

function fileUploadSchConfiglet(url,datas,callback)
{
	if(datas.FILENAME != undefined && datas.FILENAME != '')
		{
			callback(url,datas);
		}
	else
		{
			var configletId = $('#CONFIGLETS').val(); //No I18N
			var useFirstValue = false;
			if($('#firstValue').is(":checked"))
				{
				useFirstValue=true;
				}

			var filename = document.getElementById('importConfigletVar');
			var file = filename.files[0];
			var data = new FormData();
			data.append('file', file); // No I18N
			if (file == undefined) {
				alert(Ember.I18n.t('jsp.common.csvTxtformatfile',	this)); // No I18N
			} else {
				var fileName = file.name
                var fileExt = fileName.split(".");

				if (fileName.split(".") === fileName) {
					alert(Ember.I18n.t('jsp.common.csvTxtformatfile', this)); // No I18N
                } else if ((fileExt[1] !== 'txt') && (fileExt[1] !== 'csv')) {// No I18N
					alert(Ember.I18n.t('jsp.common.csvTxtformatfile', this)); // No I18N
				} else {
					var urlStr='?TEMPLATE_ID='+configletId+'&USE_FIRSTVALUE_FORALL='+useFirstValue+'&SCHEDULE_ID='+OPMClient.SettingsNCMConfigController.scheduleId+'&IS_SCHEDULE=true'; //No I18N
					ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/uploadConfigletFile'+urlStr;//No I18N
					$.ajax({
								type : "POST", // No I18N
								url : ajaxRequestUrl,
								data : data,
								cache : false,
				                processData:false,
								contentType : false,
								success : function(jsondata) {
									if(jsondata.isSuccess== 'true' || jsondata.isSuccess== true) {
											datas.FILENAME=jsondata.FILENAME;
											callback(url,datas);
									}
									else if(jsondata.error !== undefined) {
										opm_infoMsgs("errorMsg",jsondata.error.message); //No I18N
									}
									else {
										opm_infoMsgs("errorMsg",jsondata.statusMsg); //No I18N
									}
								},
								dataType : 'json' // No I18N
							});
				}
			}
		}
}

function ncmAddSchedule(ajaxRequestUrl,data)
{
	var response = opm_ajaxPostRequest(ajaxRequestUrl,data)
	var	cls = "errorMsg"; //No I18N
	var message = "";
	if(response.isSuccess) {
		cls = "successMsg"; //No I18N
		message = response.statusMsg;
		window.history.back();
		try {
			$("#DEAllSchedulesList").trigger("reloadGrid");//No I18N
		} catch (e) {
		}
//      OPMClient.SettingsNCMConfigController.PCIschedule ? this.NCMListPCISchedules() :this.NCMListAllSchedules();
	}
	else if(response.error !== undefined){
		message = response.error.message;
	}
	else {
		message = response.statusMsg;
	}
	opm_infoMsgs(cls,message);
    OPMClient.SettingsNCMConfigController.fileName='';
}

function configletContentFormatter(cellValue, options,rowObject)
{
	return escapeHTML(cellValue).replace(/\n/g,'<br/>');//No I18N

}
function configlethostNameFormatter(cellValue, options,rowObject)
{
	return escapeHTML(cellValue);

}
function SwitchSchConfigletDiv(div1,div2)
{
	$("#"+div1).show();
	$("#"+div2).hide();
}

function onChangeSNMPVersion(snmp_version) {
	$("#snmpV3Div").css('display','none');
	$("#snmpV12Div").css('display','none');
	if(snmp_version == '0' || snmp_version == '1') {
		$("#snmpV12Div").css('display','block');
	} else {
		$("#snmpV3Div").css('display','block');
	}
}

function showHideCredentialComponents(selectedProtocolList,name) {
	$("#sshDiv").css('display','none'); //No I18N
	$("#telnetDiv").css('display','none'); //No I18N
	$("#snmpDiv").css('display','none'); //No I18N
	if(selectedProtocolList == 'SNMP - TFTP') //No I18N
    {
		$("#saveAndTestCredentialsId").css('display','none'); //No I18N
		$("#snmpDiv").css('display','block'); //No I18N
    }
    else if(selectedProtocolList == 'TELNET - TFTP' || selectedProtocolList == 'TELNET') //No I18N
    {
    	if(name=='mulcredTypeList')
    		{
    		$("#saveAndTestCredentialsId").css('display','none'); //No I18N
    		}
    	else
    		{
    		$("#saveAndTestCredentialsId").css('display','block'); //No I18N
    		}
		$("#telnetDiv").css('display','block'); //No I18N
    }
    else if(selectedProtocolList == 'SSH - TFTP' || selectedProtocolList == 'SSH' || selectedProtocolList == 'SSH - SCP') //No I18N
    {
    	if(name=='mulcredTypeList')
		{
		$("#saveAndTestCredentialsId").css('display','none'); //No I18N
		}
	else
		{
		$("#saveAndTestCredentialsId").css('display','block'); //No I18N
		}
    	$("#sshDiv").css('display','block'); //No I18N

    }
}

function deleteCredentials () {
	var grid = jQuery("#DECredProfList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg", Ember.I18n.t("jsp.commonstr.selatleastoneCredalert",this)); //No I18N
		return;
	}

	var confirmCallBack = function() {
		var data = {

		};
		data.PROFILEID = JSON.stringify(selRowIds);
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/deleteCredentials'; //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			type: 'POST',//No I18N
			dataType: 'json',//No I18N
			data: data,
			success: function(jsonData, status) {
				showResponse(jsonData);
				$('#DECredProfList').delay(4000).trigger('reloadGrid'); //No I18N
			}
		});
	}

	var confirmBody = Ember.I18n.t("jsp.commonstr.CredDeletealert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function validateChangeMgmtRule() {
	var emailAction = $('#email_notification').is(":checked");
	var data={};
	var isValid = true;
	var noNotifActionSelected = true;
	var nodifName = $('#nodifName').val();
	if(!isNotEmpty(nodifName)){
		isValid = false;
		showAlert(Ember.I18n.t("js.commonstr.RuleNameAlert",this)); //No I18N
		validateFocus('#nodifName', null, null, null, Ember.I18n.t("js.commonstr.RuleNameAlert",this))//No I18N
	}
	if(emailAction) {
		noNotifActionSelected = false;
		data.TO_ADDRESS = $('#emailTo').val();
		if(!opm_validateMultipleEmail(data.TO_ADDRESS)) {
			opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.notValidEmailAlert",this));//No I18N
			validateFocus('#emailTo', null, null, null, Ember.I18n.t("js.commonstr.notValidEmailAlert",this))//No I18N
			isValid = false;
			return;
		}
	}
	emailAction = $('#snmp_notification').is(":checked");
	if(emailAction) {
		noNotifActionSelected = false;
		data.HOST = $('#snmpHostIp').val();
        if(data.HOST == "") {
        	isValid = false;
            opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.validHostNameAlert",this)); //No I18N
            validateFocus('#snmpHostIp', null, null, null, Ember.I18n.t("jsp.commonstr.validHostNameAlert",this))//No I18N
        }

		data.PORT = $('#snmpPort').val();
		if(!validateNumberVal(data.PORT)) {
			isValid = false;
			opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.ValidPortNumberAlert",this));//No I18N
			validateFocus('#snmpPort', null, null, null, Ember.I18n.t("js.commonstr.ValidPortNumberAlert",this))//No I18N
		}
	}
	emailAction = $('#syslog_notification').is(":checked");
	if(emailAction) {
		noNotifActionSelected = false;
		data.SYSLOG_HOST = $('#syslogHostIp').val();
         if(data.SYSLOG_HOST == "") {
        	 isValid = false;
            opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.validHostNameAlert",this)); //No I18N
            validateFocus('#syslogHostIp', null, null, null, Ember.I18n.t("jsp.commonstr.validHostNameAlert",this))//No I18N
        }
		data.SYSLOG_PORT = $('#syslogPort').val();
		if(!validateNumberVal(data.SYSLOG_PORT)) {
			isValid = false;
			opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.ValidPortNumberAlert",this));//No I18N
			validateFocus('#syslogPort', null, null, null, Ember.I18n.t("js.commonstr.ValidPortNumberAlert",this))//No I18N
		}
	}
	emailAction = $('#trouble_notification').is(":checked");
	if(emailAction) {
		noNotifActionSelected = false;
		data.TICKET_TO_ADDRESS = $('#ticketTo').val();
		if(!opm_validateMultipleEmail(data.TICKET_TO_ADDRESS)) {
			isValid = false;
			opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.notValidEmailAlert",this));//No I18N
			validateFocus('#ticketTo', null, null, null, Ember.I18n.t("js.commonstr.notValidEmailAlert",this))//No I18N
		}
	}

	emailAction = $('#rollback_notification').is(":checked");
	if(emailAction) {
		if($('#prevversion').is(":checked") || $('#baseline').is(":checked")) {
			noNotifActionSelected = false;
		}
	}

	if(noNotifActionSelected){
		opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.ncm.changemgmt.validateRuleSettingsalert",this));//No I18N
		return;
	}

	if(isValid && !noNotifActionSelected) {
		goForwardOrBackward("1","2","fwd","");
	}
}

function ChangeRuleNameValidation()
{
	var nodifName = $('#nodifName').val();
	if(!opm_validateFields({'empty':['nodifName']})){
		return;
	}
	else
	{
		goForwardOrBackward("1","2","fwd","");
	}
}
function CompRGNameValidation(isAsscoiatePage)
{
	if(!isAsscoiatePage || $("#new_rg_notification").prop("checked")) {
		var nodifName = $('#ruleGroupName').val();
		if(!opm_validateFields({'empty':['ruleGroupName']})){
			return;
		}
		else
		{
			goForwardOrBackward("1","2","fwd","");
		}
	}else
	{
		goForwardOrBackward("1","2","fwd","");
	}
}

function CompPolicyNameValidation()
{
	var policyName = $('#policyName').val();
	if(!opm_validateFields({'empty':['policyName']})){
		return;
	}
	/** if($("#selectedListRG option").length == 0) {
		opm_infoMsgs("errorMsg", Ember.I18n.t("js.commonstr.seloneRGAlert",this)); //No I18N
        return;
	} **/
	goForwardOrBackward("1","2","fwd","");
}

//function addBlockCriteriashowHide()
//{
//		var additionComp=$('#BLOCK_CONDITION').val();
//		if(additionComp == "NONE")
//		{
//			$("#BLOCK_CONDITION_VALUE").attr("disabled", "disabled");
//		}
//		else
//		{
//			$("#BLOCK_CONDITION_VALUE").removeAttr("disabled");
//		}
//}

function additionalBlockCriteriaChange()
{
		var additionComp=$('#blockCondition').val();
		if(additionComp == "None")
		{
			$("#blockCondition_value").attr("disabled", "disabled");
		}
		else
		{
			$("#blockCondition_value").removeAttr("disabled");
		}
}


function deleteNCMCredentials (selRowId) {
	var selRowIds=[selRowId];
	var confirmCallBack = function() {
		var data = {

		};
		data.PROFILEID = JSON.stringify(selRowIds);
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/deleteCredentials'; //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			type: 'POST',//No I18N
			dataType: 'json',//No I18N
			data: data,
			success: function(jsonData, status) {
				var	cls = "errorMsg"; //No I18N
		    	if(jsonData.isSuccess) {
		    		cls = "successMsg"; //No I18N
		    	}
				opm_infoMsgs(cls,jsonData.statusMsg); //No I18N
				$('#DECredProfList').delay(4000).trigger('reloadGrid'); //No I18N
			}
		});
	}

	var confirmBody = Ember.I18n.t("jsp.commonstr.CredDeletealert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function alertGlobalGroup() {
	if ($("#GLOBAL_DEVICE_GROUP").prop("checked")) {
		opm_infoMsgs("infoMsg",Ember.I18n.t("jsp.commonstr.pubDGAlert",this));//No I18N
	}
}

function eolConfirmation(MainElement,element) {
	if(element[0] !== undefined && document.getElementById(element[0].id) !== null) {
		MainElement.removeClass('loading').addClass('success');
		var	content = '<div class="slideContHolder"><div class="opmFormHolder"><div class="opmForm"><div class="opmFormRow">'//No I18N
	  		+'<div class="opmFormCol fullCol"><div>'+Ember.I18n.t("webclient.ncm.reports.eoleos.request.confirmation",this)+'</div>'//No I18N
	    	+'</div></div>'//No I18N
	    	+'<div class="opmFormRow" style="margin-top: 17px; padding-right: 30px;"><div class="opmFormCol fullCol opmBtnHldr">'//No I18N
			+'<div class="opmBtn" onclick="requestEOL();">'+Ember.I18n.t("webclient.topo.objectdetails.managed.yes")+'</div>'//No I18N
	    	+'<div class="opmBtn btn-grey" onclick="closeEmailReport();">'+Ember.I18n.t("webclient.action.Cancel",this)+'</div></div></div></div></div></div></div>';//No I18N
		element.html(content);
	}
}

function closeEmailReport()
{
	$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
	$('.OpMToolTip').removeClass('clicked hovered');
}

function emailTheReport(MainElement,element) {

	var url = window.OPM.apiUrlPattern + '/ncmsettings/mailSettingsPreRender'; // No I18N
		$.ajax(
		{
			url: url,
			type: 'GET', //No I18N
			dataType:'json', //No I18n
		//	async:false,
			success: function(response)
			{
				MainElement.removeClass('loading').addClass('success');

				if(response.FROM_ADDRESS !== undefined)
				{
					var key = 'webclient.ncm.mail.configuration.notification'; //No I18N
					if(!window.OPM.isAuthorized || window.OPM.isNCMPowerUser) {
						key = 'webclient.ncm.mail.configuration.notification.oper'; //No I18N
					}
					content = '<div class="slideContHolder"><div class="opmFormHolder"><div class="opmForm"><div class="opmFormRow">'//No I18N
			              		+'<div class="opmFormCol"><label>'+Ember.I18n.t("webclient.From",this)+'</label>'//No I18N
			                	+'</div><div class="opmFormCol"><label>'+response.FROM_ADDRESS+'</label></div></div><div class="opmFormRow">'//No I18N
			             		+'<div class="opmFormCol"><label>'+Ember.I18n.t("webclient.admin.scheduledt.endsat")+'</label></div><div class="opmFormCol">'//No I18N
			                	+'<input type="text" id="TO_MAIL_ID" /></div></div>';//No I18N
			                	if(response.hasMailServerSettings == 'false' || response.hasMailServerSettings == false) {
			                		content += '<div class="opmFormRow" id="mailConfigurationNotificationDiv">'//No I18N
			                					+'<div class="opmFormCol fullCol userActionInfoMsg privacyInfoMsgUserDetails theme-blue ncmborderStyle">'//No I18N
			                					+    '<div>' + Ember.I18n.t(key) + '</div>'//No I18N
			                					+'</div>'//No I18N
			                					+'</div>'//No I18N
			                	}
			        content +=   '<div class="opmFormRow"><div class="opmFormCol fullCol opmBtnHldr">'//No I18N
			                	+'<div class="opmBtn" onclick="sendNCMReportMail();">'+Ember.I18n.t("webclient.login.send")+'</div>'//No I18N
			                	+'<div class="opmBtn btn-grey" onclick="closeEmailReport();">'+Ember.I18n.t("webclient.action.Cancel",this)+'</div></div></div></div></div></div></div>';//No I18N
				}
				else
				{
					MainElement.removeClass('loading').addClass('error');
					content = response.error.message;
				}

			//	$('body').append("<div class='OpMToolBar dummy' style='top:"+PosY+"px;left:0;opacity:0'><div class='title'>"+title+"</div><div class='content'>"+content+"</div></div>");
				//MaxHt=$('.OpMToolBar.dummy .content').outerHeight();
			//	$('.OpMToolBar.dummy').remove();

			//	$('.OpMToolBar .content').empty().css({'max-height':MaxHt});

				if(element[0] !== undefined && document.getElementById(element[0].id) !== null)
				{
					element.html(content);
                	$('.OpMToolBar .content').css({height:'auto'});
				}
				//$('.opmMask').remove();

			}
		});
}

function passwordPromptForReportExport(MainElement,element, timecomponent) {
	if(element[0] !== undefined && document.getElementById(element[0].id) !== null) {
		MainElement.removeClass('loading').addClass('success');
		var	content = '<div class="slideContHolder"><div class="opmFormHolder"><div class="opmForm"><div class="opmFormRow">'//No I18N
	  		+'<div class="opmFormCol"><label>'+Ember.I18n.t("webclient.ncm.reports.passwordPrompt",this)+'</label>'//No I18N
	  		+'<input type="password" id="password" />'//No I18N
	    	+'</div></div>'//No I18N
	    	+'<div class="opmFormRow"><div class="opmFormCol fullCol opmBtnHldr">'//No I18N
	    	+'<div class="opmBtn" onclick="exportNCMPDFReport(' + timecomponent + ', true);">'+Ember.I18n.t("opu.common.SUBMIT")+'</div>'//No I18N
	    	+'<div class="opmBtn btn-grey" onclick="exportNCMReport(' + timecomponent + ', false);">'+Ember.I18n.t("webclient.login.Skip",this)+'</div></div></div></div></div></div></div>';//No I18N
		element.html(content);
	}
}

function getExportConsent(MainElement,element, isCustom) {
	if(element[0] !== undefined && document.getElementById(element[0].id) !== null) {
		MainElement.removeClass('loading').addClass('success');
		var functionToCall = "exportNCMCSVReport"; // No I18N
		if (isCustom) {
			functionToCall = "exportCustomNCMCSVReport"; // No I18N
		}
		var	content = '<div class="slideContHolder"><div class="opmFormHolder"><div class="opmForm"><div class="opmFormRow">'//No I18N
	  		+'<div class="opmFormCol fullCol"><div>'+Ember.I18n.t("js.commonstr.GDPRConsent",this)+'</div>'//No I18N
	    	+'</div></div>'//No I18N
	    	+'<div class="opmFormRow" style="margin-top: 17px; padding-right: 50px;"><div class="opmFormCol fullCol opmBtnHldr">'//No I18N
			+'<div class="opmBtn" onclick="' + functionToCall + '();">'+Ember.I18n.t("webclient.topo.objectdetails.managed.yes")+'</div>'//No I18N
	    	+'<div class="opmBtn btn-grey" onclick="closeEmailReport();">'+Ember.I18n.t("webclient.action.Cancel",this)+'</div></div></div></div></div></div></div>';//No I18N
		element.html(content);
	}
}

function exportNCMPDFReport(timecomponent, passwordProtected) {
	var password = "";
	if(passwordProtected){
		password = $("#password").val();
		if(password == "") {
			opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.admin.mailserver.blankpassword",this));//No I18N
			return;
		}
	}
	generateNCMPDFReport(timecomponent , password);
	closeEmailReport();
}

function exportNCMCSVReport(timecomponent, passwordProtected) {
	generateNCMCSVReport();
	closeEmailReport();
}

function exportCustomNCMCSVReport() {
	generateNCMCustomCSVReport();
	closeEmailReport();
}

function populateDevResponse(id, COMMAND_RESPONSE, isPingResult)
{
	if(COMMAND_RESPONSE != null && COMMAND_RESPONSE.length > 0) {
		for (var i = 0; i < COMMAND_RESPONSE.length; i++) {
			var CMD_RSP = COMMAND_RESPONSE[i];
			var DEVICE_RESPOSE = CMD_RSP.DEVICE_RESPOSE;
			var $row = $('<row class="pipesymbol"></row>');
			$td = $('<td></td>');
			for (var j = 0; j < DEVICE_RESPOSE.length; j++) {
				if(j != 0) {
					$td.append('<br>'); //NO I18N
				}
                //$td.append('<span class="'+CMD_RSP.responseClassCode+'">'+DEVICE_RESPOSE[j]+'</span>&nbsp'); //No I18N
                $td.append('<span style="font-family:Courier New, Courier, mono; font-size: 12px;	color: #24FF00;">'+DEVICE_RESPOSE[j]+'</span>&nbsp'); //No I18N
			}
			//$td.append('<span class="'+CMD_RSP.commandClassCode+'">'+CMD_RSP.COMMAND+'</span>&nbsp'); //No I18N
			//$td.append('<span style="font-family:Courier New, Courier, mono; font-size: 12px;	color: #0A4687;">'+CMD_RSP.COMMAND+'</span>&nbsp'); //No I18N
			$td.append('<span style="font-family:Courier New, Courier, mono; font-size: 12px;	color: white;white-space: pre-line;">'+CMD_RSP.COMMAND+'</span>&nbsp'); //No I18N
			$row.append($td);
			$(id).append($row);
		}
	}

}

function NCMChangeConditionType(conditionType)
{
	if(conditionType == "Simple") { //No I18N
		$("#simple-criteria-div").css('display','block');
		$("#advanced-criteria-div").css('display','none');
		$("#custom-criteria-div").css('display','none');
		$("#criteriaforRule").css('display','none');
		$("#validateDiv").css('display','none');
	} else if(conditionType == "Advanced") {  //No I18N
		$("#advanced-criteria-div").css('display','block');
		$("#simple-criteria-div").css('display','none');
		$("#custom-criteria-div").css('display','none');
		$("#criteriaforRule").css('display','block');
		$("#validateDiv").css('display','block');
	} else if(conditionType == "AdvancedBlockCriteria") { //No I18N
		$("#advanced-criteria-div").css('display','block');
		$("#custom-criteria-div").css('display','block');
		$("#simple-criteria-div").css('display','none');
		$("#criteriaforRule").css('display','block');
		$("#validateDiv").css('display','block');
	}
};

function sendNCMReportMail() { //No I18N
  var data = {

  };

  data.CUSTOMIZE_DATA_VIEWNAME = OPMClient.ReportsDetailsController.CUSTOMIZE_DATA_VIEWNAME;
  data.PDF_HANDLER_VIEW = OPMClient.ReportsDetailsController.PDF_HANDLER_VIEW;
//  data.TITLE = OPMClient.ReportsDetailsController.TITLE;
  data.DEVICE_GROUP_ID = (OPMClient.ReportsDetailsController.DG_ID != '')?OPMClient.ReportsDetailsController.DG_ID: undefined;
  data.TO_ADDRESS = $("#TO_MAIL_ID").val();
  if(!opm_validateEmail(data.TO_ADDRESS)) {
	  opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.notValidEmailAlert",this));//No I18N
	  return;
  }

  var timecomponent = "false";
  if(OPMClient.ReportsDetailsController.isNCMConfigChangeReport || OPMClient.ReportsDetailsController.isNCMConfigChangeTrendReport)
	{
		timecomponent = "true";
	}
if(timecomponent == "true" || timecomponent == true)
	{
var timecmp = $("input[name='custime']:checked").val();
	selection = '&TIME_DURATION='; // No I18N
if(timecmp == 'time') {
	data.TIME_DURATION=$("input[name='timeperiods']:checked").val();
} else {
	fromTime = new Date($("#once_startat").val()).getTime();
	toTime = new Date($("#once_endat").val()).getTime();
	data.TIME_DURATION="custom";//No I18N
	data.START_TIME=fromTime;
	data.END_TIME=toTime;
	}
}

	var reportType = OPMClient.ReportsDetailsController.CUSTOMIZE_DATA_VIEWNAME;
  // Firmware Vulnerability Changes
      if(reportType != null && (reportType.indexOf('FirmVul') != -1 || reportType.indexOf('FirmwareVulnerabilityReport_RTab') != -1)) {
          var map = OPMClient.NCMFirmwareVulnerability.getSelectedCriteria('');
          data.vulReportType = OPMClient.NCMFirmwareVulnerability.subFilterType;
          data.EXPLOIT = map.exploit;
          data.SEVERITY = map.severity;
          data.DEVICE_GROUP_ID = map.deviceGrp;
          var timeDuration = OPMClient.NCMFirmwareVulnerability.getTimeFilterSelected();
          if(timeDuration && timeDuration.isDefault && timeDuration.selection !== 'selectTime') {
             data.TIME_DURATION = timeDuration.selection;
          } else if(timeDuration.period && timeDuration.period.fromTime && timeDuration.period.toTime ) {
             data.TIME_DURATION = "custom";//No I18N
             data.START_TIME = timeDuration.period.fromTime;
             data.END_TIME = timeDuration.period.toTime;
         }
    }
  //	if(reportType === 'FvFixTrendCveReport_RTab'){
  //        data.CVEID = OPMClient.NCMFirmwareVulnerability.cveIdForDetails;
  //	}
      if(reportType === 'FvFixTrendReport_RTab' || reportType === 'FvFixTrendCveReport_RTab'){
          var period = getCustomTimeSelected();
          if(period !== undefined && period.isDefault) {
              data.TIME_DURATION = period.selection;
          } else if(period !== undefined && period.fromTime !== undefined && period.toTime !== undefined) {
              data.TIME_DURATION = "custom";//No I18N
              data.START_TIME = period.fromTime;
              data.END_TIME = period.toTime;
          }
          if(reportType === 'FvFixTrendCveReport_RTab'){
              data.CVEID = OPMClient.NCMFirmwareVulnerability.cveIdForDetails;
          }
      }


      // Firmware Vulnerability Changes ends
    if(reportType != null && reportType == "BackupStatusReport_RTab") {
	    var map = OPMClient.NCMReport.getGridSelectedCriteria('');
    	if(OPMClient.NCMReportsController.isFilterChkbx){
    		data.FILTER_VALUE=map.chkBoxVal;
    	}
    }
	if(reportType != null && reportType == "AnnotationReport_RTab") {
		var jqGridID = "";
		if(reportType == "AnnotationReport_RTab") {
			jqGridID = "DEAllConfigs";	//No I18N
		}

		data.jqgridLoad = true;
		data.jqgrid_id = jqGridID;
		var gridPostData = OPMClient.ReportsDetailsController.gridPostData;
		for(var key in gridPostData) {
			if (gridPostData.hasOwnProperty(key)) {
			    var val = gridPostData[key];
			    data[key] = val;
			}
		}
	}
	if(reportType == 'FirmVulCveReport_RTab' || reportType == 'FirmwareVulnerabilityReport_RTab'){ //No I18N
        var map = OPMClient.NCMFirmwareVulnerability.getSelectedCriteria(''); //No I18N
        data.FV_SEARCH_KEY = map.searchkey;
    }

  //$( this ).dialog( "close" );
  var deviceListUrl = window.OPM.apiUrlPattern + '/ncmreports/sendReportMail'; //No I18N
  $.ajax({
	  url: deviceListUrl,
	  dataType: 'json',//No I18N
	  type: 'POST',//No I18N
	  data: data,
	  success: function(jsonData) {
	  					var	cls = "errorMsg"; //No I18N
		    	if(jsonData.isSuccess) {
		    		cls = "successMsg"; //No I18N
		    		closeEmailReport();
		    	}
				opm_infoMsgs(cls,jsonData.statusMsg); //No I18N
	  }
  });
}

function NCMPMPEnable()
{
	getPmpDetails();
}

function NCMPMPDisable()
{
	$("#pmpEnable").css("display","none");
}

function getPmpDetails()
{
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/getPasswordSyncDetails'; //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			type: 'GET',//No I18N
			dataType: 'json',//No I18N
			success: function(jsonData, status) {
				if(jsonData.isSuccess) {
					var pmpSyncEnable=jsonData.pmpSyncEnable;
//					if(pmpSyncEnable == 'true' || pmpSyncEnable == true)
//					{
						$('#serverName').text(jsonData.ServerName);//No I18N
		                $('#port').text(jsonData.ServerPort);//No I18N
//                        OPMClient.NCMSettings.PMPAuthToken = jsonData.AuthToken;
		                $('#pmp_authToken').text(jsonData.AuthToken);//No I18N
						$("#pmpEnable").css("display","block");
					//}
//					else
//					{
//						jQuery("#DISABLE").prop('checked', true);//No I18N
//						$("#pmpEnable").css("display","none");
//					}
				}
				else {
					opm_infoMsgs("errorMsg",jsonData.statusMsg); //No I18N
					return;
				}
			}
		});
}


function fetchTemplates(templateid) {
	var selctedVendor = $('#VENDOR_LIST').val(); //No I18N
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/deviceType?VENDOR_NAME='+selctedVendor; //No I18N
	$.ajax({
		url: ajaxRequestUrl,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		success: function(jsonData) {
			$('#DEV_TEMPLATE_LIST').empty(); //No I18N
			for(var i=0; i< jsonData.deviceTypes.length; i++) {
				var option = jsonData.deviceTypes[i];
				$('#DEV_TEMPLATE_LIST').append($("<option></option>").val(option).text(option));  //No I18N
			}
			if(templateid != undefined) {
				$('#DEV_TEMPLATE_LIST').val(templateid);
				var displaytext = $( "#DEV_TEMPLATE_LIST option:selected" ).text();
				$("#select2-DEV_TEMPLATE_LIST-container").attr("title", displaytext).text(displaytext); // No I18N
			}
		}
	});
}

function toggleDiv(divId, hide) {
	if(hide) {
		$("#"+divId).hide();
		OPMClient.SettingsNCMConfigController.set('isScheduleRequest', false);//No I18N
	} else {
		$("#"+divId).show();
		OPMClient.SettingsNCMConfigController.set('isScheduleRequest', true);//No I18N

	}
}

function toggleUploadOption() {
	var downloadType = $("input[name='DOWNLOAD_AS']:checked").val();
	var scheduleType = $("input[name='SCHEDULE_TYPE']:checked").val();

	var notes = ["immediate","notsupported","startupwarning","permission"];	//No I18N
	var noteMsg = [];
	var data = OPMClient.InventoryDeviceDetailsController.configUploadDetails;

	if(!data.isDownloadAllowed) {
		noteMsg.push("notsupported");
	}
	else {
		if(downloadType == "Startup") {
			noteMsg.push("startupwarning");
		}
		if(data.DOWNLOAD_NEEDS_APPROVAL == true) {
			noteMsg.push("permission");
		}
	}

	if(scheduleType == "Once Only") {
		$("#once").show();
	}
	else {
		$("#once").hide();
		noteMsg.push("immediate");
	}


	if(noteMsg.length > 0) {
		$("#noteMsg").show();

		if(!data.isDownloadAllowed) {
			$("#notsupported").show();
			var index = notes.indexOf("notsupported");
			if(index > -1) {
				notes.splice(index,1);
			}
		}
		else {
			for(var i = 0; i < noteMsg.length; i++) {
				$("#"+noteMsg[i]).show();

				var index = notes.indexOf(noteMsg[i]);
				if(index > -1) {
					notes.splice(index,1);
				}
			}
		}
	}
	else {
		$("#noteMsg").hide();
	}

	if(notes.length > 0) {
		for(var i = 0; i < notes.length; i++) {
			$("#"+notes[i]).hide();
		}
	}
}

function showBasedOnScheduleTaskType(){
	changeTaskType(true);
}

function changeTaskType(isTaskNotChanged) {
	var index = $('#TASK_TYPE').val(); //No I18N
	if(isTaskNotChanged && index == null){
		index = $('#editTaskVal').text();
	}
	if(index == 'Configuration Backup') {
		$("#schedule-backup-div").css('display','block');
	} else {
		$("#schedule-backup-div").css('display','none');
	}
	if(index == 'Compliance Check') {
		$("#schedule-compliance-div").css('display','block');
		$("#schedule-compliance-email-div").css('display','block');
		$("#compSchedDeviceFilterMsg").css('display','block');
	    changeSelectPolicyOption();
	} else {
		$("#schedule-compliance-email-div").css('display','none');
		$("#schedule-compliance-div").css('display','none');
		$("#compSchedDeviceFilterMsg").css('display','none');
	}
	if(index == 'Sync Configuration') {
		$("#schedule-synnc-config-div").css('display','block');
	} else {
		$("#schedule-synnc-config-div").css('display','none');
	}
	if(index == 'Report Generation') {
		$("#schedule-report-div").css('display','block');
		OPMClient.NCMReportsController.updateSchReportSelDiv(true);
	} else {
		$("#schedule-report-div").css('display','none');
	}
	if(index == 'Custom Template') {
		$("#txtBtn").css('display','block');
		$("#schedule-configlet-div").css('display','block');
		if($('#vendorName').val() != 'All'){
			$('#vendor_selectDevicesDiv').css('display','block');
		}
		if(!isTaskNotChanged){
			changeConfiglet();
		}
	} else {
		$("#txtBtn").css('display','none');
		$("#schedule-configlet-div").css('display','none');
		$("#vendor_selectDevicesDiv").css('display','none');
		if(!isTaskNotChanged){
			showScheduleConfigletParams(false);
		}
	}
	if(index == 'PCI Review') {
		$("#schedule-pci-div").css('display','block');
		if(!isTaskNotChanged){
		var jsonData = OPMClient.SettingsNCMConfigController.scheduleInfo;
		if(jsonData.REVIEWERS == null || jsonData.REVIEWERS.length <= 0) {
			var confirmCallBack = function() {
				location.href = window.apiclientUrl+"Settings/NcmConfig/PCI/Reviewers/Add";
			}

			var cancelCallBack = function() {
				if(OPMClient.SettingsNCMConfigController.PCIschedule == 'true' || OPMClient.SettingsNCMConfigController.PCIschedule == true) {
					window.history.back();
				} else {
					return false;
				}
			}

			var confirmBody = Ember.I18n.t("js.commonstr.SettingsModelAlert23",this); //No I18N
			ncmConfirm(null, confirmBody, 400, confirmCallBack, null, cancelCallBack); //No I18N
		}
		}
	} else {
		$("#schedule-pci-div").css('display','none');
	}
	if(index == 'Device Discovery') {
		$("#schedule-discovery-div").css('display','block');
		$("#schedule-devices-div").css('display','none');
		$("#ncmConfigletNotifType").hide();
		// Load once only - reloading would clear the ticks the edit flow just applied.
		if($("#discoveryCredList li:not('#selectAllListItem')").length == 0) {
			loadSNMPProfilesForDiscovery();
		}
	} else {
		$("#schedule-discovery-div").css('display','none');
		//$("#ncmConfigletNotifType").show();
		if(!isTaskNotChanged){
			OPMClient.NCMReportsController.updateSchReportSelDiv(index == 'Report Generation');// NO I18N
		}
	}
	changeConfigletNotifType($('#configlet_save_report').prop('checked'));
	if(ncmIsCentral()){
		var reportType = $('#REPORT_TYPE').val(); //No I18N
		if(index == 'Report Generation' && (!(reportType == "HardwareInventoryReport_RTab" || reportType == "SecurityAudit_Report" || reportType == "ConfigurationAanlysis_Report"))){
			$("#centralScheduleMsg").hide();
		}else{
			$("#centralScheduleMsg").show();
		}
	}
	if(!isTaskNotChanged){
		$('.sch_notification').hide();
		// Updating device selection which might be updated from Compliance Check task type selection / deselection
		waitForElement("#devicesTab", function(){//No I18N
			updateDevSelBasedOnCompCheckTask();
		});
	}
}

function changeConfigletNotifType(skipMail,editTaskName) {

	var editTaskName = $('#editTaskVal').text();
	taskType = (editTaskName !== "" && editTaskName != null) ? editTaskName : $('#TASK_TYPE').val() ;
	if(skipMail == 'false' || skipMail == false){
		$("#configlet_send_email").attr('checked', true);
		$("#scheduleMailDiv").show();
		$("#scheduleMailSubjectDiv").show();

		if(taskType == "Configuration Backup") {
			$("#schedule-backup-div").css('display','block');
		}
		else if(taskType == "Compliance Check") {
			$("#schedule-compliance-email-div").css('display','block');
		}
		else if(taskType == "Sync Configuration") {
			$("#schedule-synnc-config-div").css('display','block');
		}

		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/hasPrimaryMailSettings'; //No I18N
        var jsonData  = opm_ajaxGetResponse(ajaxRequestUrl);

		if(jsonData.hasMailServerSettings == 'false' || jsonData.hasMailServerSettings == false) { //No I18N
			$('#mailConfigurationNotificationDiv').show();
		}
		$("#scheduleGDPRMsg").show();
	}
	else {
		$("#scheduleGDPRMsg").hide();
		$("#configlet_save_report").attr('checked', true);
		$("#scheduleMailDiv").hide();
		$("#scheduleMailSubjectDiv").hide();
		$('#mailConfigurationNotificationDiv').hide();
		$("#schedule-backup-div").css('display','none');
		$("#schedule-compliance-email-div").css('display','none');
		$("#schedule-synnc-config-div").css('display','none');
	}
}

function updateReportSel(){
    showHideTimeReqDiv();
    OPMClient.NCMReportsController.updateSchReportSelDiv(true);
}

function showHideTimeReqDiv() {
	var reportType = $('#REPORT_TYPE').val(); //No I18N
	var scheduleInfo = OPMClient.SettingsNCMConfigController.scheduleInfo;
	var timeReqMap = scheduleInfo.timeReqMap;
	var showTime = false;
	if(timeReqMap != null ) {
		showTime = timeReqMap[reportType];
	}
	if(showTime == true || showTime == "true") {
		$("#sceduleTimeRed-div").css('display','block');
	} else {
		$("#sceduleTimeRed-div").css('display','none');
	}
	if(ncmIsCentral()){
		if(!(reportType == "HardwareInventoryReport_RTab" || reportType == "SecurityAudit_Report" || reportType == "ConfigurationAanlysis_Report")){
			$("#centralScheduleMsg").hide();
		}else{
			$("#centralScheduleMsg").show();
		}
	}
}

function changeDevicesOnFilter(filter){
    if(filter == 'vendor'){
            changeDevicesVendor();
        }
}

// Vendor pickers need configlet read; without it these would wipe the saved selections.
function ncmCanChangeScheduleVendor() {
	var p = window.OPM.userPermissions;
	return !!(p.ncmConfigAutomationConfigletsRead || p.ncmRestricted || p.operatorAccess);
}

function updateDevSelBasedOnCompCheckTask() {
	var isComplianceCheckTask = $('#TASK_TYPE').val() === 'Compliance Check' || $('#editTaskVal').text() === 'Compliance Check'; //No I18N
	var tempData = {};
	if (isComplianceCheckTask) {
		var customPolicySelection = $("input[name='policySelectionType']:checked").val() !== 'allPolicy';//No I18N
		var selectedPolicies = customPolicySelection ? OPMClient.NCMCompliancePolicyController.getSelectedPolicies() : null;
		/*var deviceSelection = $("#devicesTab").hasClass("active");*/
		var allowedDevices = [], allowedDgs = [];
		var policyResourceMap = OPMClient.NCMCompliancePolicyController.policyResourceMap;

		Object.keys(policyResourceMap).forEach(function (policyId) {
			var resourceMap = policyResourceMap[policyId];
			if (!customPolicySelection || (selectedPolicies && selectedPolicies.indexOf(policyId) !== -1)) {
				Object.keys(resourceMap).forEach(function (resourceType) {
					var idList = resourceMap[resourceType];
					if (resourceType === 'devices') {
						allowedDevices.push.apply(allowedDevices, idList);
					} /*else if (resourceType === 'deviceGroups') {// No I18N
						allowedDgs.push.apply(allowedDgs, idList);
					}*/
				});
			}
		});
		allowedDevices = allowedDevices.map(String);
		/*allowedDgs = allowedDgs.map(String);*/

		// Updating device group selection
		/*var filteredDGList = OPMClient.NCMCompliancePolicyController.schedDeviceSelectionBackup.allDG.filter(function (dgItem) {
			return allowedDgs.indexOf(String(dgItem.id)) !== -1;
		});
		var selectedDg = deviceSelection ? -1 : $('#select_DG').val();
		if (!deviceSelection && allowedDgs.indexOf(selectedDg) !== -1) {
			tempData.dg_id = selectedDg;
		} else {
			filteredDGList.unshift({'hostName': Ember.I18n.t('webclient.admin.schedulereports.devicegroupselect'),'id': -1}); // No I18N
			tempData.dg_id = selectedDg;
		}
		tempData.allDG = filteredDGList;*/

		// Updating device selection
		if (OPMClient.NCMCompliancePolicyController.schedDeviceSelectionBackup.selectedDevices) {
			var filteredSelectedDevices = OPMClient.NCMCompliancePolicyController.schedDeviceSelectionBackup.selectedDevices.filter(function (deviceItem) {
				return allowedDevices.indexOf(String(deviceItem.id)) !== -1;
			});
			tempData.selectedDevices = filteredSelectedDevices;
		}

		var filteredUnSelectedDevices = OPMClient.NCMCompliancePolicyController.schedDeviceSelectionBackup.unSelectedDevices.filter(function (deviceItem) {
			return allowedDevices.indexOf(String(deviceItem.id)) !== -1;
		});
		tempData.unSelectedDevices = filteredUnSelectedDevices;

		// Updating the data in the component
		if (OPMClient.NCMComponentController.deviceSelector) {
			OPMClient.NCMComponentController.deviceSelector.set('selectionType', 'Devices'); // No I18N
			OPMClient.NCMComponentController.deviceSelector.set('unSelected', tempData.unSelectedDevices); // No I18N
			OPMClient.NCMComponentController.deviceSelector.set('selected', tempData.selectedDevices); // No I18N
		}
		/*if (OPMClient.NCMComponentController.deviceGroupSelector) {
			OPMClient.NCMComponentController.deviceGroupSelector.set('selectionType', 'DG'); // No I18N
			OPMClient.NCMComponentController.deviceGroupSelector.set('allDetails', tempData.allDG); // No I18N
			OPMClient.NCMComponentController.deviceGroupSelector.set('selected', tempData.dg_id); // No I18N
		}*/
	} else {
		// Restoring the original data if not a Compliance Check task
		var backupMap = OPMClient.NCMCompliancePolicyController.schedDeviceSelectionBackup;
		if (backupMap) {
			/*tempData.dg_id = backupMap.dg_id;
			tempData.allDG = backupMap.allDG;*/
			if (backupMap.selectedDevices) {
				tempData.selectedDevices = backupMap.selectedDevices;
			}
			tempData.unSelectedDevices = backupMap.unSelectedDevices;

			if (OPMClient.NCMComponentController.deviceSelector) {
				OPMClient.NCMComponentController.deviceSelector.set('selectionType', 'Devices'); // No I18N
				OPMClient.NCMComponentController.deviceSelector.set('unSelected', tempData.unSelectedDevices); // No I18N
				OPMClient.NCMComponentController.deviceSelector.set('selected', tempData.selectedDevices); // No I18N
			}

			/*if (OPMClient.NCMComponentController.deviceGroupSelector) {
				OPMClient.NCMComponentController.deviceGroupSelector.set('selectionType', 'DG'); // No I18N
				OPMClient.NCMComponentController.deviceGroupSelector.set('allDetails', tempData.allDG); // No I18N
				OPMClient.NCMComponentController.deviceGroupSelector.set('selected', tempData.dg_id); // No I18N
			}*/
		}
	}
}

function changeDevicesVendor(){
	if(!ncmCanChangeScheduleVendor()) {
		return;
	}
	var val = $('#changeDevices_vendor').prop('checked');
	var vendor = $('#vendorName').val();
	if(val){
		vendor = 'All'; //No I18N
	}else {
		vendor = $('#vendorName').val();
	}
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/getDevicesforVendor?VENDOR_NAME='+vendor; //No I18N
	$.ajax({
		url : ajaxRequestUrl,
		dataType : 'json', //No I18N
		type : 'GET', //No I18N
	    success : function(jsonData) {
	    	$('#unSelected_Devices option').remove();
	    	var selRowsId = $.map($("#selected_Devices option"), function(a)
	    	{
	    		return a.value;
	    	});
	    	if(selRowsId != null){
	    		for (var index = 0; index < jsonData.vendorHostMap.length; index++) {
   					var flag = true;
   					var host_map = jsonData.vendorHostMap[index];
   					for(var index2 = 0; index2 < selRowsId.length; index2++){
   						if(selRowsId[index2] == host_map.id){
   							flag = false;
   		   					break;
   		   				}
   		   			}
   					if(flag == true){
   						$('#unSelected_Devices').append($("<option></option>").attr("value",host_map.id).text(host_map.hostName));  //No I18N
   					}
   				}
   			}else{
   				for (var index = 0; index < jsonData.vendorHostMap.length; index++) {
   					var host_map = jsonData.vendorHostMap[index];
   					$('#unSelected_Devices').append($("<option></option>").attr("value",host_map.id).text(host_map.hostName));  //No I18N
   		        }
   			}
	    }
	});
}

function changeVendor() {
	if(!ncmCanChangeScheduleVendor()) {
		return;
	}
	var vendor = $('#vendorName').val();
	if(vendor == "All") {
		$('#vendor_selectDevicesDiv').hide();
	}else {
		$('#vendor_selectDevicesDiv').show();
	}
	if(vendor.length > 16){
		$('#vendor_selectFilterbtnDiv').css('height', '45px');
	}else{
		$('#vendor_selectFilterbtnDiv').css('height', '35px');
	}
	$('#vendorforDevice').text(vendor+" "+Ember.I18n.t("webclient.general.Devices", this)); //No I18N
	OPMClient.NCMComponentController.ncmDeviceFilterValue = vendor+" "+Ember.I18n.t("webclient.general.Devices", this); //No I18N
	$('#CONFIGLETS option').remove();
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/getConfiglet?VENDOR_NAME='+vendor; //No I18N
	$.ajax({
		url : ajaxRequestUrl,
		dataType : 'json', //No I18N
		type : 'GET', //No I18N
		success : function(jsonData) {
			for (var key in jsonData.CONFIGLET) {
				$('#CONFIGLETS').append($("<option ></option>").attr("value",key).text(jsonData.CONFIGLET[key])); //No I18N
			}
			changeConfiglet();
		}
	});
}

function changeConfiglet(configletId) {
	if(configletId == null || configletId == undefined) {
		configletId = $('#CONFIGLETS').val(); //No I18N
		OPMClient.SettingsNCMConfigController.configletId=configletId;
	}
	if(configletId != null && configletId != undefined) {
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/configletSchedPreRenders?TEMPLATE_ID='+configletId;//No I18N
		$.ajax({
			url: ajaxRequestUrl,
			type: 'GET',//No I18N
			dataType: 'json',//No I18N
			success: function(jsonData, status) {
				OPMClient.SettingsNCMConfigController.execConfigletInfo = jsonData;
				var executionMode = jsonData.templateType;
				if(executionMode=="PROG_CONFIGLET_MODE"){
					OPMClient.SettingsNCMConfigController.isProConfiglet = true;
        		}else{
        			OPMClient.SettingsNCMConfigController.isProConfiglet = false;
        		}
				$("#sameForAllDiv").empty();
				var defaultParams = jsonData.defaultParams;
				$('#confContent').val(jsonData.TEMPLATE_CONTENTS);
				$('#confName').val(jsonData.templateName);
				$("#exec-variables-div").hide();
				$('#noconifgletparam').hide();
				//Configlets executed from Configlet Group
				if(OPMClient.SettingsNCMConfigController.executeConfigletGrp){
					$('#executeConfigletGrp_configletName').val(jsonData.templateName);
					$('#executeConfigletGrp_executionMode').val(jsonData.ConfigletTypes[jsonData.templateType]);
				}
				OPMClient.SettingsNCMConfigController.isNoConfigletParam=true;
				if(jsonData.TEMPLATE_VAR_LIST != undefined && jsonData.TEMPLATE_VAR_LIST.length > 0) { // cli configlets
					//$("#exec-variables-div").css('display','block');
					for (var i = 0; i < jsonData.TEMPLATE_VAR_LIST.length; i++) {
						var variable = ""+jsonData.TEMPLATE_VAR_LIST[i];
						var id = variable; //Changed for Dollar Variable
						var row = $( "#row" ).clone()
						$(row).attr("id","row"+i);
						$(row[0]).find("input").attr("id",'VALUE2014_'+id);
						$(row[0]).find("label").attr("id",id);
						var templateParam = variable; //Changed for Dollar Variable
						$(row[0]).find("label").text(templateParam);
						if(defaultParams != null && defaultParams[templateParam] != null) {
							$(row[0]).find("input").val(defaultParams[templateParam]);
						}
						$("#sameForAllDiv").append(row);
					}
					showScheduleConfigletParams(true);
			} else if(jsonData.variables != undefined && jsonData.variables.length > 0){ // programable configlets
				if(OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent != null){
					OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent.variables = jsonData.variables;
					OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent.set("refresh",true);//No I18N
					showScheduleConfigletParams(true);
				}else{
					showScheduleConfigletParams(false);
				}
			}else{
				// No variables for this configlet — clear any stale variables from a previously selected configlet
				if(OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent != null){
					OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent.variables = [];
					OPMClient.NCMComponentController.ncmConfigletExecutionParamComponent.set("refresh",true);//No I18N
				}
				showScheduleConfigletParams(false);
			}
				$('#executionMode').val(jsonData.ConfigletTypes[jsonData.templateType]);
				$("#selectGroupDiv").css('display','none');
			}
		});
	}
}

function showScheduleConfigletParams(isShow){
	OPMClient.SettingsNCMConfigController.isNoConfigletParam=!isShow;
	if(isShow){
		$('#configletparamli').show();
		$('#notificationli span.number').text(3);
	}else{
		if(OPMClient.SettingsNCMConfigController.isExecuteConfigletFromInventory){
		    $('#configletparamli').show();
			$('#noconifgletparam').siblings().hide();
			$('#noconifgletparam').show();
		}else{
			$("#exec-variables-div").css('display','none');
			$('#configletparamli').hide();
			$('#notificationli span.number').text(2);
		}
	}
}
function showParamWithConfigletType(isProConfiglet){
	if(!OPMClient.SettingsNCMConfigController.isNoConfigletParam){
		if(isProConfiglet){
			$("#proconfiglet_execution_param").show();
			$('#selectVariableDiv').hide();
		}else{
			$('#selectVariableDiv').show();
			$("#proconfiglet_execution_param").hide();
		}
	}else{
		$("#proconfiglet_execution_param").hide();
		$('#selectVariableDiv').hide();
	}
}

function hideScheduleControllersForConfiglets(){
	$("#ncmScheduleForm").hide();
	$("#scheduleDiv > div:nth-child(1)").hide();
	$("#taskTypeDiv").hide();
	$("#scheduleDiv .opmTabContentSignle").hide();
	$(".ncmscheduleSaveButton").hide();
	$("#scheduleMailDiv").hide();
	$("#ncmScheduleReportTypeDiv").hide();
	 	$("#scheduleMailSubjectDiv").hide();
		$("#mailConfigurationNotificationDiv").hide();
		$("#scheduleGDPRMsg").hide();
		$("#InventoryNCMAll").hide();
		$("#ncmConfigletNotifType").hide();
		$('#threadInfoRow').hide();
		$('#centralScheduleMsg').hide();
		$('#publicScheduleMsg').hide();
}

function viewConfigletInSchedule(){
	if($('#viewConfiglet').hasClass('active')){
		$('#viewConfiglet').removeClass('active');
		$('#ContentPreview').hide();
	}else{
		$('#viewConfiglet').addClass('active');
		$('#ContentPreview').show();
	}
}
function validateEmail(paramVal)
{
	if (paramVal !== "")
	{
		var objRegExp  = /^[a-z0-9]([a-z0-9_\-\.]*)@([a-z0-9_\-\.]*)(\.[a-z]{2,4}(\.[a-z]{2}){0,2})$/i;
	   	return objRegExp.test(paramVal);
	}
	else
	{
		return false;
	}
}


function NCMActions(actions)
{
	if(actions === "deleteCrRuleAudit") { // No I18N
		OPMClient.NCMConfigAutomationModel.deleteCredentialRuleAudit();
	}else if(actions === "deletePolicy"){ // No I18N
    	deletePolicies();
//    }else if(actions === "deleteRG"){//NO I18N
//        deleteRuleGroups();
    }else if(actions === "deleteRule"){//NO I18N
		deleteRules();
	}else if(actions === "deleteSchedule"){//NO I18N
		deleteSchedule("REMOVE",false);//NO I18N
	}else if(actions === "enableSchedule"){//NO I18N
		deleteSchedule("ENABLE",false);//NO I18N
	}else if(actions === "disableSchedule"){//NO I18N
		deleteSchedule("DISABLE",false);//NO I18N
	}else if(actions === "deleteScheduleAudit"){//NO I18N
		deleteScheduleAudit();
	}else if(actions === "deleteConfigletAudit"){//NO I18N
		deleteConfigletAudit();
	}else if(actions === "deleteTag"){//NO I18N
		deleteTag();
	}else if(actions === "deleteChangeRule"){//NO I18N
		deleteNotification();
	}else if(actions === "disableNotification"){//NO I18N
		disableNotification();
	}else if(actions === "enableNotification"){//NO I18N
		enableNotification();
	}else if(actions === "deleteLabels"){//NO I18N
		deleteLabels();
	}else if(actions === "deleteExcludeCriteria"){//NO I18N
		deleteExcludeCriteria();
	}else if(actions === "deleteSSHKeyProfile"){//NO I18N
		deleteSSHKeyProfile();
	}else if(actions === "deleteBlockExcludeCriteria"){//NO I18N
		deleteBlockExcludeCriteria();
	}else if(actions === "deleteShowCommands"){//NO I18N
		deleteShowCommands();
	}else if(actions === "disassociateConfigs"){//NO I18N
		disassociateConfigs();
	}else if(actions === "exportConfiglets"){//NO I18N
		exportConfiglets();
	}else if(actions === "deleteConfiglets"){//NO I18N
		deleteConfiglets();
	}else if(actions === "promoteConfiglets"){//NO I18N
		openPromoteConfiglet();
	}else if(actions === "groupConfiglets"){ //No I18N
		OPMClient.NCMConfigAutomationModel.groupConfiglets();
	}else if(actions === "deleteProConfiglets"){ //No I18N
		OPMClient.NCMConfigAutomationModel.deleteProConfiglets();
	}else if(actions === "deleteNCMRegex"){ //No I18N
		OPMClient.NCMConfigAutomationModel.deleteNCMRegex();
	}else if(actions === "promoteDeviceTemplate"){//NO I18N
		openPromoteDeviceTemp();
	}else if(actions === "addFlowConfiglet"){//NO I18N
		addFlowConfiglet();
	}else if(actions === "deleteNotificationRule"){//NO I18N
        OPMClient.NCMConfigAutomationModel.deleteChangeManagementRule();
	}else if(actions === "back"){//NO I18N
		backAction();
//	} else if(actions === "openadhocTestRulePage"){//NO I18N
//		openadhocTestPage(true);
//	} else if(actions === "openadhocTestPage"){//NO I18N
//		openadhocTestPage();
//	}  else if(actions === "clonerules"){//NO I18N
//		openclonerules();
//	}   else if(actions === "openassociateRuleGPage"){//NO I18N
//		openassociateRuleGPage();
//	} else if(actions === "openassociatePolicyPage"){//NO I18N
//		openassociatePolicyPage();
	} else if(actions === "updatePCIReviews"){//NO I18N
		updatePCIReviewStatus();
	} else if(actions === "deleteCustomReportAudit"){//NO I18N
		deleteCustomReport();
	} else if(actions === "assocLabelsDevices"){//NO I18N
		assocLabelsDevices();
	} else if(actions === "deleteCustomDevice") {//NO I18N
		deleteCustomDevice();
	}  else if(actions === "deleteSysLogBlockedHost"){//NO I18N
		deleteSysLogBlockedHost();
	} else if(actions === "runSchedule"){//NO I18N
		runSchedule();
	} else if(actions === "exportTerminalAuditHistory") {//NO I18N
		opm_generateCSV($("#DETerminalDevAudits"),Ember.I18n.t("webclient.ncm.settings.terminal.audit.report"), Ember.I18n.t("webclient.ncm.settings.terminal.audit.report")); //No I18N
	} else if(actions === "deleteAdvancedReportAudit"){//NO I18N
		deleteAdvancedReport();
	} else if(actions === "redirectToAddControllers" ) {//NO I18N
	    redirectToNCMAddEditController(-1);
	} else if(actions === "deleteController" ) {//NO I18N
	    deleteNCMController();
	} else if(actions === "shareHardwareData" ) {//NO I18N
	    shareHardwareData();
	} else if(actions === "exportHardwareCollectorData" ) {//NO I18N
	    exportHardwareCollectorData();
	} else if(actions === "populateHardwareCollectorData" ) {//NO I18N
	    populateHardwareCollectorData();
	} else if(actions === "uploadHardwareDeviceData" ) {//NO I18N
		openHardwareDbPatchUpload();
	} else if(actions === "deletePendingRequest" ) {//NO I18N
        OPMClient.NCMConfigAutomationModel.deletePendingRequest();
    } else if(actions === "deleteApprovedRequest" ) {//NO I18N
        OPMClient.NCMConfigAutomationModel.deleteApprovedRequest();
    }
}

function redirectToNCMAddEditController(controllerId) {
    location.href = window.OPM.apiclientUrl+"Settings/NcmConfig/Controllers/AddEdit/" + controllerId;//No I18N
}

function deleteNCMController (controllerId) {
    if(!controllerId) {
        var grid = jQuery("#NCMControllersList"); //No I18N
        var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
        if(selRowIds == undefined || selRowIds.length == 0) {
            opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.ncm.restapi.configlet.execute.objectSelection.list.invalid",this));  //No I18N
            return;
        }
        controllerId = selRowIds[0];
	}

    var confirmCallBack = function() {
        var data = {

        };
        data.controllerId = JSON.stringify(controllerId);

        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcontrollers/deleteController',data)//No I18N
        var	cls = "errorMsg"; //No I18N
        if(response.isSuccess) {
            cls = "successMsg"; //No I18N
            $('#NCMControllersList').trigger('reloadGrid');
        }
        opm_infoMsgs(cls,response.statusMsg);
    }

    var confirmBody = Ember.I18n.t("webclient.ncm.terminal.change.confirmDelete",this); //No I18N
    ncmConfirm(null, confirmBody, 400, confirmCallBack);
}
function shareHardwareData () {
    var confirmCallBack = function() {
        var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/shareHardwareCollectorData') //NO I18N
        var	cls = "errorMsg"; //NO I18N
        if(response.isSuccess) {
            cls = "successMsg"; //NO I18N
        }
        if(response.error !== undefined) {
            message = response.error.message;
            opm_infoMsgs(cls,message);
        }
        else {
            opm_infoMsgs(cls,response.statusMsg);
        }
    }
    var confirmBody = Ember.I18n.t('ncm.settings.hardware_info.share_ncm.confirm', this); //NO I18N
    ncmConfirm(null, confirmBody, 400, confirmCallBack);
}
function exportHardwareCollectorData () {
    opm_exportFilesPostMethod(window.OPM.apiUrlPattern + '/ncmsettings/exportHardwareCollectorData') //NO I18N
}
function populateHardwareCollectorData () {
    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/populateHardwareCollectorData') //NO I18N
    var	cls = "errorMsg"; //NO I18N
    if(response.isSuccess) {
        cls = "successMsg"; //NO I18N
    }
    if(response.error !== undefined) {
        message = response.error.message;
        opm_infoMsgs(cls,message);
    }
    else {
		if(response.msgClass){
			cls = response.msgClass;
		}
        opm_infoMsgs(cls,response.statusMsg);
    }
}

function openHardwareDbPatchUpload () {
    location.href = window.OPM.apiclientUrl + "Settings/NcmConfig/HardwareCollector/Upload"; //NO I18N
}

function uploadHardwareDeviceData () {
    var fileInput = document.getElementById('opmFileUpload'); //NO I18N
    if(!fileInput) {
        return;
    }
    var file = fileInput.files[0];
    if(!file) {
        opm_infoMsgs("errorMsg", Ember.I18n.t("ncm.settings.hardware_info.upload.invalid_format", this)); //NO I18N
        return;
    }
    var fileName = file.name.toLowerCase();
    if(fileName.indexOf('.zip') === -1 || fileName.substring(fileName.lastIndexOf('.') + 1) !== 'zip') {
        opm_infoMsgs("errorMsg", Ember.I18n.t("ncm.settings.hardware_info.upload.invalid_format", this)); //NO I18N
        return;
    }
    var data = new FormData();
    data.append('file', file); //NO I18N
    $.ajax({
        type : "POST", //NO I18N
        url : window.OPM.apiUrlPattern + '/ncmsettings/uploadHardwareDbPatch', //NO I18N
        data : data,
        cache : false,
        processData : false,
        contentType : false,
        success : function(response) {
            var cls = "errorMsg"; //NO I18N
            if(response.isSuccess) {
                cls = "successMsg"; //NO I18N
            }
            if(response.error !== undefined) {
                opm_infoMsgs(cls, response.error.message);
            }
            else {
                if(response.msgClass) {
                    cls = response.msgClass;
                }
                opm_infoMsgs(cls, response.statusMsg);
            }
            if(response.isSuccess) {
                window.history.back();
            }
        },
        error : function() {
            opm_infoMsgs("errorMsg", Ember.I18n.t("ncm.settings.hardware_info.upload.error", this)); //NO I18N
        }
    });
}

function refreshNCMController(controllerId) {
    var data = {
        'controllerId' : controllerId // NO I18N
    };
    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcontrollers/refreshControllerInventory',data)//No I18N
    var	cls = "errorMsg"; //No I18N
    if(response.isSuccess) {
        cls = "successMsg"; //No I18N
    }
    opm_infoMsgs(cls,response.statusMsg);
}

function deleteSSHKeyProfile () {
	var grid = jQuery("#DENCMSSHKeyList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneSSHKeyProfileAlert",this));  //No I18N
		return;
	}
		var data = {

		};
		data.sshKeys = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteSSHKey',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    		$('#DENCMSSHKeyList').trigger('reloadGrid');
    	}
		opm_infoMsgs(cls,response.statusMsg);
}

function runSchedule(scheduleId, status, nextRun) {
	var grid = jQuery("#DEAllSchedulesList"); //No I18N
	var selRowIds = [];
	if(scheduleId != null && scheduleId != undefined) {
		if(status == '4') {
			opm_infoMsgs("errorMsg",Ember.I18n.t("ncm.schedule.run.disabled",this)) //No I18N
			return;
		}
		if(nextRun == null || nextRun == 'null' || nextRun == "null" )
		{
			opm_infoMsgs("errorMsg",Ember.I18n.t("ncm.schedule.executed",this)) //No I18N
			return;
		 }
		selRowIds.push(scheduleId);
	} else {
		selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
		if(selRowIds == undefined || selRowIds.length == 0) {
			opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneRecord",this)) //No I18N
			return;
		}
	}
	var data = {
	};
	var scheduleIds = JSON.stringify(selRowIds);
	data.scheduleIds = scheduleIds;
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/runSchedule'; //No I18N
	var response = opm_ajaxPostRequest(ajaxRequestUrl,data);
	var cls = "errorMsg"; //No I18N
	if(response.isSuccess) {
		cls = "successMsg"; //No I18N
	}
	opm_infoMsgs(cls,response.statusMsg);
	$("#DEAllSchedulesList").trigger("reloadGrid");
}

function executeRequest(id) {
	var grid = jQuery("#DEApprovedRequestList"); //No I18N
	var data = {
	};
	data.approved_req_id = id;
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/executeApprovedRequest'; //No I18N
	var response = opm_ajaxPostRequest(ajaxRequestUrl,data);
	var cls = "errorMsg"; //No I18N
	if(response.isSuccess) {
		cls = "successMsg"; //No I18N
		if(OPMClient.ApplicationController.isNCM) {
			location.href = window.OPM.apiclientUrl+"NCMConfigAutomation/UploadRequests/ApprovedRequests";//No I18N
		}
		else {
			location.href = window.OPM.apiclientUrl+"Settings/NcmConfig/UploadRequests/Approved";//No I18N
		}
	}
	opm_infoMsgs(cls,response.statusMsg);
	$("#DEApprovedRequestList").trigger("reloadGrid");
}

function deleteSysLogBlockedHost() {
	var grid = jQuery("#DESysLogBlockedHostList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneRecord",this)) //No I18N
		return;
	}

	var confirmCallBack = function() {
		var data = {
		};
		var hostIds = JSON.stringify(selRowIds);
		data.HOSTID = hostIds;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/removeSysLogBlocedHosts'; //No I18N
		var response = opm_ajaxPostRequest(ajaxRequestUrl,data);
		var cls = "errorMsg"; //No I18N
		if(response.isSuccess) {
			cls = "successMsg"; //No I18N
		}
		opm_infoMsgs(cls,response.statusMsg);
		$("#DESysLogBlockedHostList").trigger("reloadGrid");
	}

	var confirmBody = Ember.I18n.t("jsp.commonstr.syslogblockedhostdeleteconfirm",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteCustomDevice() {
	var grid = jQuery("#DECustomDevicesList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.ncm.terminal.change.selectRow",this)); // No I18N
		return;
	}
	var confirmCallBack = function() {
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/deleteCustomTerminalDevice'; //No I18N
		var data = {};
		data.deviceIDs = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(ajaxRequestUrl,data);
		var cls = "errorMsg"; //No I18N
		var message = "";
		if(response.isSuccess) {
			cls = "successMsg"; //No I18N
			message = response.statusMsg;
			$("#DECustomDevicesList").trigger("reloadGrid");
		}
	else if(response.error !== undefined) {
    	message = response.error.message;
    }
    else {
    	message = response.statusMsg;
	}
	opm_infoMsgs(cls,message);
	}

	var confirmBody = Ember.I18n.t("webclient.ncm.terminal.change.confirmDelete",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function assocLabelsDevices() {
	var grid = jQuery("#DELabelsList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SettingsModelAlert21",this)); // No I18N
		return;
	}
	OPMClient.SettingsNCMConfigController.selLables=selRowIds;
	location.href = window.apiclientUrl+ "Settings/NcmConfig/DeviceMgmt/LabelManagement/LableConfig";
}

function deleteCustomReport() {

	var grid = jQuery("#DECustomReportList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneRowCustomReportRow",this)) //No I18N
		return;
	}
	for (var i = 0; i < selRowIds.length; i++) {
		var id = selRowIds[i];
		var selName = grid.jqGrid('getCell', id, 'NCMCustomReportDefinition__ReportName'); //No I18N
		if(checkDefaultCustomReport(selName)) {
			opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.defaultCustomReports",this)); // No I18N
			return;
		}
	}

	var confirmCallBack = function() {
		var data = {
		};
		var reportId = JSON.stringify(selRowIds);
		data.REPORTID = reportId;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmreports/deleteCustomReport'; //No I18N
		var response = opm_ajaxPostRequest(ajaxRequestUrl,data);
		var cls = "errorMsg"; //No I18N
		if(response.isSuccess) {
			cls = "successMsg"; //No I18N
		}
		opm_infoMsgs(cls,response.statusMsg);
		$("#DECustomReportList").trigger("reloadGrid");
	}

	var confirmBody = Ember.I18n.t("jsp.commonstr.customreportdeleteconfirm",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteAdvancedReport() {

	var grid = jQuery("#DEAdvancedReportList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneRowCustomReportRow",this)) //No I18N
		return;
	}
	var updatedSelRowIds = new Array();
    $.each(selRowIds, function()
    {
        var id = this;
        var isDefault = grid.jqGrid('getCell', id, 'IS_DEFAULT'); //No I18N
        if(isDefault == 'false'){
            updatedSelRowIds.push(id);
        }
    });
    if(updatedSelRowIds.length == 0){
        opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.defaultAdvancedReports",this)); // No I18N
        return;
    }
	var confirmCallBack = function() {
		var data = {
		};
		var reportId = JSON.stringify(updatedSelRowIds);
		data.report_id = reportId;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmreports/deleteAdvReport'; //No I18N
		var response = opm_ajaxPostRequest(ajaxRequestUrl,data);
		var cls = "errorMsg"; //No I18N
		if(response.isSuccess) {
			cls = "successMsg"; //No I18N
		}
		opm_infoMsgs(cls,response.statusMsg);
		$("#DEAdvancedReportList").trigger("reloadGrid");
	}

	var confirmBody = Ember.I18n.t("jsp.commonstr.advancedreportdeleteconfirm",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function updatePCIReviewStatus() {

	var grid = ''; //No I18N
	if(OPMClient.SettingsNCMConfigController.myReview == true || OPMClient.SettingsNCMConfigController.myReview == 'true')
	{
		grid = jQuery("#DEMyPCIReviewDetails"); //No I18N
	}
	else
	{
		grid = jQuery("#DEPCIReviewDetails"); //No I18N
	}
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneRowPCIRow",this)) //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {
		};
		var reviewId = OPMClient.SettingsNCMConfigController.reviewId;
		var deviceId = JSON.stringify(selRowIds);
		data.REVIEW_ID = reviewId;
		data.RESOURCEID = deviceId;
		var comments = "Reviewed";//No I18N
		data.REVIEW_COMMENTS = comments;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmcompliance/reviewPCI?ISMULTIPLE=true'; //No I18N
		var response = opm_ajaxPostRequest(ajaxRequestUrl,data)//No I18N
		var cls = "errorMsg"; //No I18N
		if(response.isSuccess) {
			cls = "successMsg"; //No I18N
		}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
		if(OPMClient.SettingsNCMConfigController.myReview == true || OPMClient.SettingsNCMConfigController.myReview == 'true')
		{
			$("#DEMyPCIReviewDetails").trigger("reloadGrid");
		}
		else
		{
			$("#DEPCIReviewDetails").trigger("reloadGrid");
		}

	}

	var confirmBody = Ember.I18n.t("js.commonstr.performBulkOperPermission",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

//function openassociatePolicyPage() {
//	var grid = jQuery("#DEAllGroupsList"); //No I18N
//	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
//	if(selRowIds == undefined || selRowIds.length == 0) {
//		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneRGAlert",this));  //No I18N
//		return;
//	}
//	location.href = window.apiclientUrl+ "Settings/NcmConfig/Compliance/RuleGroup/Associate";
//}

//function openassociateRuleGPage() {
//	var grid = jQuery("#DEAllRulesList"); //No I18N
//	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
//	if(selRowIds == undefined || selRowIds.length == 0) {
//		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.ComplianceModelAlert6",this));  //No I18N
//		return;
//	}
//	var cloneRules = new Array();
//	for (var i = 0; i < selRowIds.length; i++) {
//		var row = {
//
//		};
//		var id = selRowIds[i];
//		var selName = grid.jqGrid('getCell', id, 'NCMComplianceRule__COMPRULE_NAME_OLD');//NO I18N
//		row.id = id;
//		row.selName = selName;
//		cloneRules.push(row);
//	}
//	OPMClient.SettingsNCMConfigController.cloneRules = cloneRules;
//	location.href = window.apiclientUrl+ "Settings/NcmConfig/Compliance/Rule/Associate";
//}

//function openclonerules() {
//	var grid = jQuery("#DEAllRulesList"); //No I18N
//	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
//	if(selRowIds == undefined || selRowIds.length == 0) {
//		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.ComplianceModelAlert6",this));  //No I18N
//		return;
//	}
//	var cloneRules = new Array();
//	for (var i = 0; i < selRowIds.length; i++) {
//		var row = {
//
//		};
//		var id = selRowIds[i];
//		var selName = grid.jqGrid('getCell', id, 'NCMComplianceRule__COMPRULE_NAME_OLD');//NO I18N
//		row.id = id;
//		row.selName = selName;
//		cloneRules.push(row);
//	}
//	OPMClient.SettingsNCMConfigController.cloneRules = cloneRules;
//	location.href = window.apiclientUrl+ "Settings/NcmConfig/Compliance/Rule/Clone";
//}

function delColumnrenderer(cellValue, options, rowdata, action) {
	//return '<div align="center"><img class="inv_opr" src="'+cellValue+'"></img></div>'; // No I18N
	return "<i class='icon-trash delete OpMToolTip' style='margin-left:20px; font-size:16px; cursor:pointer;' data-title='Delete'></i>"; //No I18n

};


function backAction() {
	window.history.back();
}
function addFlowConfiglet() {


	var grid = jQuery("#DEDeviceTemplates"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N

	if(selRowIds.length == 1)
	{
			var arr = new Array();

		$.each(selRowIds, function()
		{
			var id = this;
			var name = grid.jqGrid('getCell', id, 'NCMDeviceTemplate__DISPLAYNAME') +""; //No I18N
			name = name.replace("<u>", "");
			name = name.replace("</u>", "");
			var object = {

			};
			object.id = id;
			object.name = name;
			arr.push(object);
		});
		window.tempToAddFlow = arr[0].name;
		OPMClient.SettingsNCMConfigController.templateId=arr[0].id;
		location.href = window.apiclientUrl+"Settings/NcmConfig/DeviceTemplates/AddFlowConfiglets"; //No I18N
	}
	else
	{
		opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneTemplatetoAddFlowConfiglet",this));  //No I18N
		return;
	}


}

function openPromoteConfiglet() {
	var grid = jQuery("#DEConfigletsList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneConfigletAlert",this));  //No I18N
		return;
	}
	var arr = new Array();
	$.each(selRowIds, function()
	{
		var id = this;
		var name = grid.jqGrid('getCell', id, 'NCMTemplate__TEMPLATE_NAME') +""; //No I18N
		name = name.replace("<u>", "");
		name = name.replace("</u>", "");
		var object = {

		};
		object.id = id;
		object.name = name;
		arr.push(object);
	});
	window.configletsToPromote = arr;
	if(window.OPM.isNCM && window.OPM.oldView) {
		location.href = window.apiclientUrl+"NCMConfigAutomation/Configlets/CustomTemplate/Promote"; //No I18N
	} else {
	location.href = window.apiclientUrl+"Settings/NcmConfig/Admin/CustomTemplate/Promote"; //No I18N
	}
}

function exportConfiglets () {
	var grid = jQuery("#DEConfigletsList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneConfigletAlert",this));  //No I18N
		return;
	}
	var url = appendCollectorDetailsString(window.OPM.apiUrlPattern + '/ncmsettings/exportConfigets?TEMPLATE_IDS='+JSON.stringify(selRowIds)); //No I18N
	url = appendMSPDetails(url);
	location.href = url;
}

function deleteRules() {
	var grid = jQuery("#DEAllRulesList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneRuleAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.COMPRULE_ID = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/deleteRule',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
        if(response.isPartialSuccess){
            cls = "infoMsg"; // NO I18N
        }
        if(response.error !== undefined) {
            opm_infoMsgs("errorMsg", response.error.message);//No I18N
        }
        else{
            opm_infoMsgs(cls,response.statusMsg); //No I18N
            $('#DEAllRulesList').delay(4000).trigger('reloadGrid'); //No I18N
        }
	}

	var confirmBody = Ember.I18n.t("js.commonstr.CompRuleDeleteAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

//function deleteRuleGroups() {
//	var grid = jQuery("#DEAllGroupsList"); //No I18N
//	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
//	if(selRowIds == undefined || selRowIds.length == 0) {
//		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneRGAlert",this));  //No I18N
//		return;
//	}
//	var confirmCallBack = function() {
//		var data = {
//
//		};
//		data.COMP_POLICYIDS = JSON.stringify(selRowIds);
//
//
//		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/deleteRuleGroup',data)//No I18N
//		        var	cls = "errorMsg"; //No I18N
//    	if(response.isSuccess) {
//    		cls = "successMsg"; //No I18N
//    	}
//		opm_infoMsgs(cls,response.statusMsg); //No I18N
//		$('#DEAllGroupsList').delay(4000).trigger('reloadGrid'); //No I18N
//	}
//
//	var confirmBody = Ember.I18n.t("js.commonstr.CompRGDeleteAlert",this); //No I18N
//	ncmConfirm(null, confirmBody, 400, confirmCallBack);
//}

function deletePolicies() {
	var grid = jQuery("#DECompliancesList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOnePolicyAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.COMP_POLICYIDS = JSON.stringify(selRowIds);
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmcompliance/deleteCompPolicy',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
        if(response.error !== undefined) {
            opm_infoMsgs("errorMsg", response.error.message);//No I18N
        }
        else{
            opm_infoMsgs(cls,response.statusMsg); //No I18N
            $('#DECompliancesList').delay(4000).trigger('reloadGrid'); //No I18N
        }
	}

	var confirmBody = Ember.I18n.t("js.commonstr.CompPolicyDeleteAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteSchedule(optype, backup) {
	var grid = jQuery("#DEAllSchedulesList"); //No I18N
	if(backup != null && backup == true) {
		grid = jQuery("#DEBackupSchedList"); //No I18N
	}

	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneScheduleAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.SCHEDULE_ID = JSON.stringify(selRowIds);
		data.ACTION_TYPE = optype; // No I18N


		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmbackup/enableSceduleConfig',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.ScheduleDeleteAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteScheduleAudit() {
	var grid = jQuery("#DEScheduleAudit"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneScheduleAuditAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.AUDIT_ID = JSON.stringify(selRowIds);
		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteScheduleAudit',data)//No I18N
        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteScheduleAuditAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}


function deleteConfigletAudit() {
	var grid = jQuery("#DEHistoryList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneConfigletAuditAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.EXECUTION_ID = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/DelCustTempAudit',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg);
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteConfigletExecHistoryAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteTag(selRowId) {
	var grid = jQuery("#DETagsList"); //No I18N
	var selRowIds = new Array();
	if(selRowId == undefined) {
		selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	} else {
		selRowIds.push(selRowId);
	}
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneTag",this));  //No I18N
		return;
	}
	var r = confirm(Ember.I18n.t("js.commonstr.DeleteTagAlert",this));  //No I18N
	if (r == true) {
		var data = {

		};
		data.TAG_ID = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmtags/deleteTag',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}
}

function deleteNotification () {
	var grid = jQuery("#DENotifications"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneChangeRuleAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.RULE_ID = JSON.stringify(selRowIds);
		data.ACTION_TYPE = "DELETE"; // No I18N

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmconfig/updateChangeRule',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteNotificationAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
	}

function deleteShowCommands () {
	var grid = jQuery("#DEShowCommandsList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneCommandAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.COMMAND_ID = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteShowCommand',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteShowCommandAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteSSHKey () {
	var grid = jQuery("#DENCMSSHKeyList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneSSHKeyProfileAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.sshKeys = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteSSHKey',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    		$('#DENCMSSHKeyList').trigger('reloadGrid');
    	}
		opm_infoMsgs(cls,response.statusMsg);
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteSSHKeyAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteExcludeCriteria () {
	var grid = jQuery("#DEExcludeCriteriaList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneExCriteriaAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.CRITERIA_ID = JSON.stringify(selRowIds);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteExcludeCriteria',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteExCriteriaAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function deleteBlockExcludeCriteria () {
	var grid = jQuery("#DEBlockExcludeCriteriaList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs('errorMsg',Ember.I18n.t("js.commonstr.SettingsModelAlert19",this));//No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
	data.CRITERIA_ID = JSON.stringify(selRowIds);
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/deleteBlockExcludeCriteria'; //No I18N
	var jsonData = opm_ajaxPostRequest(ajaxRequestUrl,data)//No I18N
            var	cls = "errorMsg"; //No I18N
	if(jsonData.isSuccess) {
		cls = "successMsg"; //No I18N
	}
	opm_infoMsgs(cls,jsonData.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.SettingsModelAlert20",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}


function deleteLabels () {
	var grid = jQuery("#DELabelsList"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneLabelAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var data = {

		};
		data.LABEL_ID = JSON.stringify(selRowIds);
		data.OPERATIONTYPE="DELETE"; // No I18N

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteLabel',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.DeleteLabelAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function disassociateConfigs () {
	var grid = jQuery("#DEAssocConfigs"); //No I18N
	var selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastConfigtoDisAssocAlert",this));  //No I18N
		return;
	}

	var confirmCallBack = function() {
		var data = {

		};
		data.LABEL_ID = OPMClient.SettingsNCMConfigController.labelId;
		data.FILE_ID = JSON.stringify(selRowIds);
		data.OPERATIONTYPE="DISASSOCIATE"; // No I18N

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteLabel',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
		$('#DEAssocConfigs').delay(4000).trigger('reloadGrid'); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.ConfigtoDisAssociateAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}


function deleteConfiglets (selRowId) {
	var grid = jQuery("#DEConfigletsList"); //No I18N
	var selRowIds = new Array();
	if(selRowId == undefined) {
		selRowIds = grid.jqGrid('getGridParam','selarrrow'); //No I18N
	} else {
		selRowIds.push(selRowId);
	}
	if(selRowIds == undefined || selRowIds.length == 0) {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.SelAtleastOneConfigletAlert",this));  //No I18N
		return;
	}
	var confirmCallBack = function() {
		var arr = new Array();
		var ips = '';
		$.each(selRowIds, function()
		{
			var id = this;
			var name = grid.jqGrid('getCell', id, 'NCMTemplate__TEMPLATE_NAME'); //No I18N
			var object = {

			};
			object.id = id;
			object.name = name;
			arr.push(object);
		});
		var data = {};
		data.CONFIGLETS = JSON.stringify(arr);

		var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ncmsettings/deleteTemplate',data)//No I18N
		        var	cls = "errorMsg"; //No I18N
    	if(response.isSuccess) {
    		cls = "successMsg"; //No I18N
    	}
    	if(response.cls){
    	    cls = response.cls;
    	}
		opm_infoMsgs(cls,response.statusMsg); //No I18N
	}

	var confirmBody = Ember.I18n.t("js.commonstr.ConfigletDeleteAlert",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function downloadTFTPFile (fileId) {
	var url = window.OPM.apiUrlPattern + '/ncmsettings/downloadTFTPFiles?fileId='+fileId; //No I18N
	url = appendCollectorDetailsString(url);
	location.href = appendEEProbeIdForUnifiedConsoleView(url);
}



function validateNumberVal(paramVal)
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

function deleteNotificationProfileAssociation(profileID)
{
	var confirmCallBack = function() {
    	if(OPMClient.InventoryDeviceDetailsController.inventorysnapType==="IPSLAVideo" || OPMClient.InventoryDeviceDetailsController.inventorysnapType==="IPSLAWAN" || OPMClient.InventoryDeviceDetailsController.inventorysnapType==="IPSLAVoIP"){
    		OPMClient.InventoryController.currSelSnapPage=OPMClient.InventoryDeviceDetailsController.inventorysnapType;
    	}
    	else{
    		OPMClient.InventoryController.currSelSnapPage="";
    	}
    	var response;
    	if(deviceBasicDetails.SOURCENAME != undefined && deviceBasicDetails.SOURCENAME != OPMClient.InventoryDeviceDetailsController.deviceName)
        {
        	response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/deleteNotificationProfile?ID="+profileID+"&oprPage="+OPMClient.InventoryController.currSelSnapPage+"&deviceName="+deviceBasicDetails.SOURCENAME,""); //No I18n
        }
        else
        {
        	response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/deleteNotificationProfile?ID="+profileID+"&oprPage="+OPMClient.InventoryController.currSelSnapPage+"&deviceName="+OPMClient.InventoryDeviceDetailsController.deviceName,""); //No I18n
        }
        //var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/deleteNotificationProfile?ID="+profileID+"&deviceName="+OPMClient.InventoryDeviceDetailsController.deviceName,""); //No I18n
        if (response.error !== undefined)
        {
            message = response.error.message;
            opm_infoMsgs('errorMsg', message); //No I18N
        }
        else if(response.message !== undefined )
        {
            message = response.message;
            opm_infoMsgs('successMsg', message); //No I18N
             if(!$.isEmptyObject(OPMClient.ReportsDetailsController.scheduleDefaultProps))
                        {
                             delete OPMClient.ReportsDetailsController.scheduleDefaultProps.profileList[profileID];
                        }
	        if(OPMClient.InventoryController.currSelSnapPage != "") {
	        	$(".inventoryWidgetIcons ").find("i[data-name='ipsla.voip.notifprofiles']").trigger("click")
	        } else {
	            if(deviceBasicDetails.SOURCENAME != undefined && deviceBasicDetails.SOURCENAME != OPMClient.InventoryDeviceDetailsController.deviceName)
	            {
	            	OPMClient.Inventory.getDeviceNotificationDetails(deviceBasicDetails.SOURCENAME);
	            }
	            else
	            {
	            	OPMClient.Inventory.getDeviceNotificationDetails(OPMClient.InventoryDeviceDetailsController.deviceName);
	            }
	            $('#opm_DevNotificationList').trigger('reloadGrid');
	        }
        }

    }

    var confirmBody = Ember.I18n.t("webclient.admin.notification.areusure",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function viewExecResultFormatter(cellValue, options, rowdata, action)
{
	return Ember.I18n.t("webclient.View",this);//No I18N
};
function hideData(gridId)
{
	if($('#'+gridId).jqGrid('getDataIDs').length<=0){
        $("#initial").show();
		$("#later").hide();
	}
	else
		{
        $("#initial").hide();
		$("#later").show();
		}
	if(($('#'+gridId).getDataIDs()[0])!= undefined)
	{
		$('#'+gridId).jqGrid('setCell',$('#'+gridId).getDataIDs()[0],'comparator', 'NA');//No I18N
	}
};

function selectTemplate(id){
	var personalityName = $("#"+id+" option:selected").text().trim();
	if(personalityName == null || personalityName == undefined){
		personalityName = $("#"+id+" option:first").text().trim();
	}
	loadExcludeCriteriaTemplates(personalityName);
};


function loadExcludeCriteriaTemplates(personalityName){

	var paramStr = "&deviceType="+personalityName;//No I18N
    $('#DEExcludeCriteriaTemplatesList').jqGrid('GridUnload');//No I18N
   // $('#DEExcludeCriteriaTemplatesList').trigger('reloadGrid');//No I18N
    var callBack = function () {
        $('#DEExcludeCriteriaTemplatesList_searchIndex').width('40px');//No I18N
     };
    var defaultOptions = {
        gridCallBack : callBack,
        searchOption:true
       // multiselect : true
    };
    //setTimeout(function () {
    	populateRemoteApiClientGrid("DEExcludeCriteriaTemplatesList",paramStr , "#DEExcludeCriteriaTemplatesPager", "DEExcludeCriteriaTemplatesList", defaultOptions); //No I18N
   // },300);
};

/*function loadExcludeCriteriaTemplates(personalityName){
    var colNamesList = [Ember.I18n.t("jsp.commonstr.TemplateName", this),''];//No I18N
    var colModelList = [

        {
            name : 'name',//No I18N
            index : 'name',//No I18N
        } ,
        {
            name : 'id',//No I18N
            index : 'id',//No I18N
            hidden : true,
        }
    ];
    if(personalityName == null || personalityName == undefined){
		personalityName = $("#DEV_TEMPLATE_LIST option:first").val();
	}
    var data = {'deviceType':personalityName};//No I18N
    $.ajax({
        url:window.OPM.apiUrlPattern + "/ncmsettings/listExcludeCriteriaGridTemplates", //No I18N
        data:data,
        type:'GET', //No I18N
        success:function(repList){
           // var resourceIDMap = new Map();
            var list = repList.rows;

           // OPMClient.NCMFirmwareVulnerability.ResourceIDMap = resourceIDMap;
            opm_loadJQgridWithData("#DEExcludeCriteriaTemplatesList", repList.rows,colNamesList,colModelList, "", "DEExcludeCriteriaTemplatesPager", "",{noPaginationShowAll:true,setWidth : true}); //No I18N
            jQuery("#DEExcludeCriteriaTemplatesList").trigger("reloadGrid");//No I18N
        }
    });
};*/

function toggleExCriteria()
{
    $("#senderMailDiv").toggle();
};

//Device Summary
function getNipperReport(selDevice,isConfigAnalysis,isSnapshot) {
	var ajaxRequestUrl = '';
	if(isConfigAnalysis == true || isConfigAnalysis == 'true')
		{
			ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/getDevReport?deviceId='+selDevice+'&reportType=DeviceConfigurationReport'; //No I18N
		}
	else
		{
			ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/getDevReport?deviceId='+selDevice+'&reportType=SecurityAuditReport'; //No I18N
		}
	$.ajax({
		url: ajaxRequestUrl,
		dataType: 'json',//No I18N
		type: 'POST',//No I18N
		success: function(jsonData) {
			//OPMClient.NCMInventoryDevConfigAnalysisController.isReport=jsonData.isSuccess;
			if((jsonData.isSuccess=='true')||(jsonData.isSuccess==true))				{
				//$('#success').css('display','block');//No I18N
					if((isSnapshot=='true')||(isSnapshot==true))
						{
							window.open(jsonData.clientUrl);
						}
					else
						{
							return jsonData.clientUrl;
						}
				//devConfigReport.setProperties(jsonData);
				}
			else if(jsonData.error !== undefined) {
				opm_infoMsgs('errorMsg', jsonData.error.message); //No I18N
		    }
			else
				{
				opm_infoMsgs('errorMsg',jsonData.statusMsg); //No I18N
				//$('#failure').css('display','block');//No I18N
				//devConfigReport.setProperties(jsonData);
				}
		}
	});
}
function changeInvReportPageNumber() {
	OPMClient.ReportsDetailsController.selHardwareInvdGroupIdp = $('#DEVICEGROUPS').val();
	OPMClient.ReportsDetailsController.selHardwareInvPageNumber = $('#PAGE_NUMBER').val();
	OPMClient.ReportsDetailsController.selHardwareInvpageSize = $('#PAGE_SIZE').val();
	OPMClient.NCMReport.getHardwareReport(OPMClient.ReportsDetailsController.selHardwareInvdGroupIdp,OPMClient.ReportsDetailsController.selHardwareInvPageNumber,OPMClient.ReportsDetailsController.selHardwareInvpageSize);
	//location.href = window.apiclientUrl+"Reports/NCM/HwInvReport";  //No I18N
}

function changePolicyRGRuleView(value) {
	if(value == 'policy') { // No I18N
		$("#policyListDiv").show();
		$("#rgListDiv").hide();
		$("#ruleListDiv").hide();
	} else if(value == 'ruleGroup') { // No I18N
		$("#policyListDiv").hide();
		$("#rgListDiv").show();
		$("#ruleListDiv").hide();
	} else if(value == 'rule') { // No I18N
		$("#policyListDiv").hide();
		$("#rgListDiv").hide();
		$("#ruleListDiv").show();
	}
}

function changeTemplateloadDevices(selectBox,isDG) {
	var value='';
	if(isDG == "true" || isDG == true)
		{
			//value=selectBox.name;
			value=$('option:selected', selectBox).attr('name');
		}
	else
		{
			value=selectBox.value;
		}
	loadTemplateDevices(value);
}
function loadTemplateDevices(value)
{
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmreports/getDevicesAndColumnsOfDevType?TYPEID='+value; //No I18N
	$.ajax({
		url: ajaxRequestUrl,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		success: function(jsonData) {
			$('#remainingListDT').empty();
			$('#selectedListDT').empty();
			$('#remainingColListDT').empty();
			$('#selectedColListDT').empty();
			var unSelectedDevices=jsonData.devices;
			if(unSelectedDevices!= undefined && unSelectedDevices!= '')
				{
					for (var i=0;i<unSelectedDevices.length;i++) {
						$('#remainingListDT').append($('<option></option>').attr('value',unSelectedDevices[i].resourceId).text(escapeHTML(unSelectedDevices[i].resourceName)));  //No I18N
			        }

				}

			var unSelectedCol=jsonData.columnNames;
			if(unSelectedCol!= undefined && unSelectedCol!= '')
				{
					for (var key in jsonData.columnNames) {
						var columnValue=key;
						var columnDisplay=unSelectedCol[key];
						$('#remainingColListDT').append($('<option value="'+ columnValue +'">'+ columnDisplay +'</option>'));
			        }
				}
		}
	});
}

function changeNCMCustomReportType(selectBox)
{
	if(selectBox.value == "network_report")
		{
	        $("#actPolicyorRGorRule").hide();
	        $("#policyListDiv").hide();
			$("#rgListDiv").hide();
			$("#ruleListDiv").hide();
			$("#compActionDevorDG").hide();
			$("#compSelectGroupDiv1").hide();
			$("#selectGroupDiv1").show();
			$("#actionDevorDG").show();
			$("#devTemplateDiv").show();
	        $("#reportcompliancediv").hide();
			$("#selectColDiv").show();
	        $("#compSelectDeviceDiv").hide();
			$("#selectDeviceDiv").hide();
		}
	else
		{

			$("#devTemplateDiv").hide();
	        $("#actPolicyorRGorRule").show();
	        $("#policyListDiv").show();
			$("#rgListDiv").hide();
			$("#ruleListDiv").hide();
			$("#selectColDiv").hide();
			$("#selectGroupDiv1").hide();
			$("#actionDevorDG").hide();
	        $("#reportcompliancediv").show();
			$("#compActionDevorDG").show();
			$("#compSelectGroupDiv1").show();
	        $("#compSelectDeviceDiv").hide();
			$("#selectDeviceDiv").hide();


		}
}

function ncmCustomChangeSelectDevice(source, destination,isCustom,isDevice) {
	 $("#"+source).slideUp();
	 $("#"+destination).slideDown();
	showCustomReportTemplate(isCustom,isDevice);
}
function showCustomReportTemplate(isCustom,isDevice)
{
	if(isCustom == true || isCustom == 'true')
	{
		if(isDevice == true || isDevice == 'true')
			{
				var value=$('#TEMPLATE').val();
				loadTemplateDevices(value);
				$("#devTemplateDiv").show();
			}
		else
			{
				$("#devTemplateDiv").hide();
			}
	}
}

function loadCriteriaResultTable(tableName,ruleResultList,colNames,colModels){
    var defaultOptions = {isNCM: true};
    opm_loadJQgridWithData("#"+tableName, ruleResultList, colNames, colModels, "", tableName+"Pager", "",defaultOptions); //No I18N
    $('#'+tableName).jqGrid('setGridWidth', $("#"+tableName).closest('.opmForm').width() - 20);
}
function loadBlockCriteriaResultTable(tableName,ruleResultList,colNames,colModels){
    var defaultOptions = {isNCM: true};
    $("#"+tableName).parent().closest('div').addClass("themeOne alterTheme no-strip");
    opm_loadJQgridWithData("#"+tableName, ruleResultList, colNames, colModels, "", tableName+"Pager", "",defaultOptions); //No I18N
    $('#'+tableName).jqGrid('setGridWidth', $("#"+tableName).closest('.opmForm').width());
    $("#blockCriteriaResultTable").parent().closest('div').addClass("themeOne alterTheme no-strip");
}
function criteriaRuleResultFormatter(cellValue, options, rowdata, action)
{
	var imgUrl = "icon-status5";//No I18N
	var resultStr=Ember.I18n.t("jsp.compliance.RuleSummaryView.Matches",this);//No I18N
	if(cellValue == "false" || cellValue == false)
		{
			resultStr=Ember.I18n.t("jsp.compliance.RuleSummaryView.DoesNotMatch",this);//No I18N
			imgUrl = "icon-status1";//No I18N
		}

	return '<i class="'+imgUrl+'"></i>&nbsp;&nbsp;' + escapeHTML(resultStr);//No I18N
}

//emailTheReport
function devResponseDialog(MainElement,element) {

	var url = window.OPM.apiUrlPattern + '/ncmreports/getDevResponse'; // No I18N
		$.ajax(
		{
			url: url,
			type: 'GET', //No I18N
			dataType:'json', //No I18n
		//	async:false,
			success: function(response)
			{
				MainElement.removeClass('loading').addClass('success');

				if(response.FROM_ADDRESS !== undefined)
				{
					content = '<div class="slideContHolder"><div class="opmFormHolder"><div class="opmForm"><div class="opmFormRow">'//No I18N
			              		+'<div class="opmFormCol"><label>'+Ember.I18n.t("webclient.From",this)+'</label>'//No I18N
			                	+'</div><div class="opmFormCol"><label>'+response.FROM_ADDRESS+'</label></div></div><div class="opmFormRow">'//No I18N
			             		+'<div class="opmFormCol"><label>'+Ember.I18n.t("webclient.admin.scheduledt.endsat")+'</label></div><div class="opmFormCol">'//No I18N
			                	+'<input type="text" id="TO_MAIL_ID" /></div></div><div class="opmFormRow"><div class="opmFormCol fullCol opmBtnHldr">'//No I18N
			                	+'<div class="opmBtn" onclick="sendNCMReportMail();">'+Ember.I18n.t("webclient.login.send")+'</div>'//No I18N
			                	+'<div class="opmBtn btn-grey" onclick="closeEmailReport();">'+Ember.I18n.t("webclient.action.Cancel",this)+'</div></div></div></div></div></div></div>';//No I18N
				}
				else
				{
					MainElement.removeClass('loading').addClass('error');
					content = response.error.message;
				}

			//	$('body').append("<div class='OpMToolBar dummy' style='top:"+PosY+"px;left:0;opacity:0'><div class='title'>"+title+"</div><div class='content'>"+content+"</div></div>");
				//MaxHt=$('.OpMToolBar.dummy .content').outerHeight();
			//	$('.OpMToolBar.dummy').remove();

			//	$('.OpMToolBar .content').empty().css({'max-height':MaxHt});

				if(element[0] !== undefined && document.getElementById(element[0].id) !== null)
				{
					element.html(content);
				}
				//$('.opmMask').remove();

			}
		});
}

function doRetrievePMPPasswords(device_id)
{
	var selRowIds = new Array();
	if(device_id===undefined || device_id==="") {
		var grid = jQuery("#opm_Devices");	//No I18N
		selRowIds = grid.jqGrid('getGridParam','selarrrow');	//No I18N
	} else {
		selRowIds.push(device_id);
	}
	if(selRowIds.length > 0) {
		//var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/doSyncPasswords?resourceID='+JSON.stringify(selRowIds); //No I18N
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/syncPassword?RESOURCEIDS='+JSON.stringify(selRowIds); //No I18N


		$.ajax({
			url: ajaxRequestUrl,
			dataType: 'json',//No I18N
			type: 'POST',//No I18N
			success: function(jsonData) {
				//showResponse(jsonData);
				var cls = "errorMsg"; //No I18N
				if(jsonData.msgCls !== undefined){
                    cls = jsonData.msgCls;
                }
                else if (jsonData.isSuccess)
				{
					cls = "successMsg"; //No I18N
				}
				var message = ncm_PMPSyncMsg(jsonData.statusMsg, false);
				opm_infoMsgs(cls, message);
				jQuery("#opm_Devices").trigger("reloadGrid");//No I18N
			}
		});
	} else {
		opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.InventoryModelAlert6",this));  //No I18N
		return;
	}
};

function ncmReportPiechart(divId,data,percentage,label,colors)
{
	var arraObj={
				 "placeholder":[],//No I18N
				"chartobj":[]//No I18N
	}
	var columns = [
	{
			"dataindex": 0, //No I18N
			"columnname": Ember.I18n.t("jsp.commonstr.Status",this), //No I18N
			"datatype": "ordinal" //No I18N
		},
	{
			"dataindex": 1, //No I18N
			"columnname": (percentage == true)?"Percentage":label,//No I18N
			"datatype": "numeric", //No I18N
                suffix:(percentage == true)?"%":""//No I18N
                }
	];

	var legendVal = {
		"colors":(colors != undefined)?colors:availColors,//NO I18N
		"enabled": false, //No I18N
			 "fontSize":16,//No I18N
			 "colorBox": {//No I18N
	            "shape": "circle",//No I18N
	            "strokeOpacity": 1//No I18N
	        }
	};

	var pltOptionsVal = {
		"pie": { //No I18N
			"gradients": { //No I18N
        },
			"datalabels": { //No I18N
				"show": false, //No I18N
				"innerLabel": { //No I18N
					"show": false, //No I18N
					"showAs": "{{val(1)}}", //No I18N
					"fontSize": 12, //No I18N
					fontColor:'#000000' //No I18N
				}
			}
    }
	};

	var chartObj = {
		id:divId,
		type:'pie', //dial, bar,area,line,pie //No I18N
		subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
		customClass:"opm_pie",//No I18N
		jsonData:data,
		height:300,
		columns:columns,
		"legend": legendVal, //No I18N
		"plotoptions": pltOptionsVal, //No I18N
		tooltip: percentage == "true" || percentage == true ? ["{{val(0)}} : {{val(1)}} ({{col(1)}})"] : ["{{val(0)}} : {{val(1)}}"]//No I18N

	};
	var mappingobj={};
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(divId);
	ncmZChart(arraObj);
	}


function ncmReportPieChartNew(divId,data,totalCount,label,colors,descriptionName) {
    var arraObj={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    };
    var columns = [
        {
            "dataindex": 0,//No I18N
            "columnname": Ember.I18n.t("jsp.commonstr.Status",this), //No I18N
            "datatype": "ordinal"//No I18N
        },
        {
            "dataindex": 1,//No I18N
            "columnname": label,//No I18N
            "datatype": "numeric"//No I18N
        }
    ];

    var legendVal = {
        "colors":(colors != undefined)?colors:availColors,//NO I18N
        "enabled": false, //No I18N
        "fontSize":16,//No I18N
        "colorBox": {//No I18N
            "shape": "circle",//No I18N
            "strokeOpacity": 1//No I18N
        },
        "vAlign":"bottom",//No I18N
        "hAlign":"center"//No I18N
    };

    var metadataVal = {
        "axes": {//No I18N
            "x": [//No I18N
                0
            ],
            "y": [//No I18N
                [
                    1
                ]
            ],
            "tooltip": [//No I18N
                "<div style='text-align:center;'><span style='font-size:14px;'>{{val(0)}}</span><br>{{col(1)}} : {{val(1)}}</div>"//No I18N
            ]
        },
        "columns": [//No I18N
            {
                "dataindex": 0,//No I18N
                "columnname": "Status",//No I18N
                "datatype": "ordinal"//No I18N
            },
            {
                "dataindex": 1,//No I18N
                "columnname": Ember.I18n.t("webclient.ncm.firmvuln.vulnCount",this),//No I18N
				"datatype": "numeric"//No I18N
            }
        ]
    };
    var notesVal = {
        "enabled": true,//No I18N
        "chartValues": [//No I18N
            {
                "x": "customAnnotationX",//No I18N
                "y": "customAnnotationY",//No I18N
                "type": "customNote",//No I18N
                "htmlEl": "customAnnotationHTML1",//No I18N
                "description": descriptionName,//No I18N
                "id": "chartxcustomAnnotationXycustomAnnotationYtypecustomNotehtmlElcustomAnnotationHTML1descriptionAllBugs"//No I18N
            }
        ]
    };

    var canvasVal= {
        "subtitle": {//No I18N
            "show": false//No I18N
        },
        "title": {//No I18N
            "show": true,//No I18N
            "hAlign": "center",//No I18N
            "vAlign": "bottom",//No I18N
            "text": label,//No I18N
            "fontSize": 14,//No I18N
            "marginTop":0,//No I18N
            "fontFamily":"LatoRegular"//No I18N
        },
        "border": {//No I18N
            "color": "rgba(51, 204, 255,0)"//No I18N
        },
        "shadow": {//No I18N
            "color": "rgba(51, 204, 255,0)"//No I18N
        },
        "background": {//No I18N
            "color": "#66CCCC",//No I18N
            "alpha": 0//No I18N
        }
    };

    var axesVal = {
        "x": [//No I18N
            0
        ],
        "y": [//No I18N
            [
                1
            ]
        ],
        "tooltip": [//No I18N
            "<div style='text-align:center;'>{{val(0)}} : {{val(1)}}</div>"//No I18N
        ]
    };
    var datalabelsVal = {
        "handleOverlapping": false,//No I18N
        "show": true,//No I18N
        "boundBox": {//No I18N
            "strokeColor": null,//No I18N
            "show": true,//No I18N
            "radius": 3,//No I18N
            "padding": 5,//No I18N
            "hook": {//No I18N
                "enabled": true//No I18N
            }
        }
    };
    var chartObj = {
        id:divId,
        type:'pie', //No I18N
        subType:"newPie",//No I18N
        customClass:"opm_pie",//No I18N
        jsonData:data,
        height:300,
        fontSize : 19,
        columns:columns,
        "notes":notesVal,//No I18N
        "legend": legendVal, //No I18N
        "metadata" : metadataVal,//No I18N
        "canvas" : canvasVal,//No I18N
        "axes" : axesVal,//No I18N
        "datalabels" : datalabelsVal,//No I18N
        "totalCount" : totalCount,//No I18N
        tooltip: ["{{val(0)}} : {{val(1)}}"]//No I18N

    };
    var mappingobj={};
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push(divId);
    ncmZChart(arraObj);
}

function ncmReportAreaChart(divId,label,jsonData) {
    var arraObj={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    };

    var columns = [
        {
            "dataindex": 0,//No I18N
            "columnname": Ember.I18n.t("webclient.devices.details.date"), //No I18N
            "datatype": "time",//No I18N
            "time":{//No I18N
                "format": {//NO I18N
                    "specifier": "dd - MM - YYYY"//No I18N
                },
            	"subfunction": "ABSDAY"//No I18N
             }
        },
        {
            "dataindex": 1,//No I18N
            "columnname": Ember.I18n.t("webclient.common.widgets.eventcount"),//No I18N
            "datatype": "numeric"//No I18N
        }
    ];

    var legendVal = {
        "layout": "vertical"//No I18N
    };

    var metadataVal = {
        "axes": {//No I18N
            "x": [//No I18N
                0
            ],
            "y": [//No I18N
                [
                    1
                ]
            ],
            "tooltip": [//No I18N
                0,
                1
            ]
        }
//        "columns" : [//NO I18N
//                {
//                    "dataindex": 0,//No I18N
//                    "columnname": Ember.I18n.t("webclient.devices.details.date"), //No I18N
//                    "datatype": "time",//No I18N
//                    "time":{//No I18N
//                        "format": {//NO I18N
//                            "specifier": "dd - MM - YYYY"//No I18N
//                        },
//                        "subfunction": "ABSDAY"//No I18N
//                     }
//                },
//                {
//                    "dataindex": 1,//No I18N
//                    "columnname": Ember.I18n.t("webclient.common.widgets.eventcount"),//No I18N
//                    "datatype": "numeric"//No I18N
//                }
//            ]
    };
    var canvasVal= {
        "theme": "flatui",//No I18N
        "title": {//No I18N
            "text": "Multi series area"//No I18N
        }
    };

    var axesVal = {
        "rotated": false,//No I18N
        "xaxis": {//No I18N
            "label": {//No I18N
                "text": (label !== undefined && label.xaxis !== undefined)?(label.xaxis):(Ember.I18n.t("webclient.common.widgets.eventcount"))//No I18N
            },
            "ticklabel": {//No I18N
                "alignMode": "rotate"//No I18N
            }
        },
        "yaxis": [//No I18N
            {
                "label": {//No I18N
                    "text": (label !== undefined && label.yaxis !== undefined)?(label.yaxis):(Ember.I18n.t("webclient.common.widgets.eventcount"))//No I18N
                }
            }
        ]
    };
    var datalabelsVal = {
        "handleOverlapping": false,//No I18N
        "show": true,//No I18N
        "boundBox": {//No I18N
            "strokeColor": null,//No I18N
            "show": true,//No I18N
            "radius": 3,//No I18N
            "padding": 5,//No I18N
            "hook": {//No I18N
                "enabled": true//No I18N
            }
        }
    };
    var plotoptions ={
        "area": {//No I18N
            "fillOpacity": 0.1,//No I18N
            "strokeWidth": 3,//No I18N
            "marker": {//No I18N
                "enabled": true,//No I18N
                "size": 2,//No I18N
                "innerStrokeWidth": 0,//No I18N
                "outerFillColor": "white",//No I18N
                "outerStrokeOpacity": 0.1//No I18N
            }
        }
    }
    var chartObj = {
        id:divId,
        type:'area', //No I18N
        subType:"multiLineArea",//No I18N
        "jsonData":jsonData,//No I18N
        height:300,
        width:1000,
        fontSize : 19,
        columns:columns,
        "legend": legendVal, //No I18N
        "metadata" : metadataVal,//No I18N
        "canvas" : canvasVal,//No I18N
        "axes" : axesVal,//No I18N
        "datalabels" : datalabelsVal,//No I18N
        "plotoptions":plotoptions,//No I18N
        "series":'multi'//No I18N

    };
    var mappingobj={};
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push(divId);
    ncmZChart(arraObj);
}

function ncmdashboardWidgetDrillDownEvent(event, data, chartObj,wName,widgetId, isReturn){
	if(data != undefined && data.data != undefined){
		var criteriaValue=(data.data[3].value != undefined ? data.data[3].value:"");
		var labelValue=(data.data[0].value != undefined ? data.data[0].value:"");

		 OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;
		var redirect=true;
		 var obj = {};
		 var label="";
    	if( wName == "widget.name.current.compliancestatus" )
    		{


    		if(criteriaValue != "NotAvailable")
			{
	    		OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMResourceCompStatus__COMPLIANCE_STATUS":[criteriaValue]};
	   		 	obj[criteriaValue]=labelValue;
	   		 	OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMResourceCompStatus__COMPLIANCE_STATUS":obj}; //No I18N
			}
		else
			{
				 OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=false;
				 redirect=false;
			}

    		}
    	else if( wName == "widget.name.backupcountstatus" )
    		{
	    		OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMBackupStateHolder__BACKUP_STATUS":[criteriaValue]};
	   		 	obj[criteriaValue]=labelValue;
	   		 	OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMBackupStateHolder__BACKUP_STATUS":obj}; //No I18N
    		}
    	else if( wName == "widget.name.current.confifConflictstatus" )
    		{
				var colName = "NCMResourcesConfConflict__ISCONFLICT"; //No I18N
				if(labelValue == "Baseline Running Conflict" || labelValue == "Baseline Running without Conflict") {
					colName = "NCMBaseRunningConflict__ISCONFLICT"; //No I18N
				}
    			if(criteriaValue != "NotAvailable")
    				{
    					var criteria=(criteriaValue == "Conflict")?true:false;
	    	    		OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {};
						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects[colName]=[criteria];
	    	   		 	obj[criteria]=labelValue;
	    	   		 	OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {};
						OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects[colName] = obj;
    				}
    			else
    				{
	    				 OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=false;
	    				 redirect=false;
    				}

    		}
    		if(redirect == true)
    			{
					if(isReturn) {
						return window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
					}
    				location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
    			}
	}
}


function settingCriteriaControllers()
{
	 ncm_listFilterReset();
	 OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects = OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects;
	 OPMClient.InventoryDeviceDetailsController.ncmSubFilterObjects = OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects;
	 OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects='';
	 OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects='';
	 initializeNCMTabData();
}

function checkDefaultCustomReport(name)
{
	if(name=='Cisco Router General Properties' || //No I18N
		name=='Cisco Router Chassis Details' || //No I18N
		name=='Cisco Switch General Properties' || //No I18N
		name=='Cisco Switch Chassis Details' || //No I18N
		name=='Cisco Switch Chassis Details' || //No I18N
		name=='NetScreen Firewall General Properties' || //No I18N
		name=='NetScreen Firewall Chassis Details' || //No I18N
		name=='CiscoIOSPolicy report for CiscoRouters' || //No I18N
		name=='CiscoIOSPolicy report for CiscoSwitch') //No I18N
		{return true;}
	else
		{return false;}
}
function ncm_showHide(showDiv, hideDiv) {
	$("#"+hideDiv).hide();
	$("#"+showDiv).show();
}
function redirectAddToNCM(snapType,ipAddress) {
	$('#OpM_AlertInfo .topbandMsgClose').click();//No I18N
	location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+snapType+"/"+ipAddress+"/AddToNCM";	//No I18N
}
function redirectToNCMCredential(snapType,ipAddress) {
	$('#OpM_AlertInfo .topbandMsgClose').click();//No I18N
	location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+snapType+"/"+ipAddress+"/NCMCredentials";	//No I18N
}
function redirectToNCMDeviceSnapshot(devName, page)
{
	if(page !== undefined && page !== "")
	{
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+devName+"/"+page;	//No I18N
	}
	else
	{
		//location.href = window.OPM.apiclientUrl+"Inventory/Device/"+devName+"/Summary";	//No I18N
		//BalajiG
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+devName;	//No I18N
	}
}
function redirectToNCMSnapshot(devName,page, isReturn)
{
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/isIPAvailable?IPADDRESS='+devName; //No I18N
    var jsonData = opm_ajaxGetResponse(ajaxRequestUrl)//No I18N
	var urlLocation = "";
	if(jsonData.isSuccess) {
		if(!setNCMEEProbeVars(jsonData.resourceId)) {
    		return;
    	}
		urlLocation = window.OPM.apiclientUrl+"Inventory/Snapshot/"+page+"/"+jsonData.resourceId;	//No I18N
	}
	if(isReturn) {
		return urlLocation;
	}
	location.href = urlLocation;
}
function redirectToNCMCredentials(devName, page) {
	if(page !== undefined && page !== "")
	{
		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "List") {
			location.href = window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices/NCMCredentials/"+page; //No I18N
		} else {
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/NCMCredentials/"+page;	//No I18N
		}
	}
	else
	{

		//location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+"/Summary";	//No I18N
		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "List") {
			location.href = window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices/NCMCredentials";	//No I18N
		} else {
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/NCMCredentials";	//No I18N
		}
	}
}
function ncmFilterDonutCatogory(severityArr){

	$.each(severityArr, function(idx,val)
	{
		ncm_InventoryDonutPieChart(val);
	});
}

function ncm_InventoryDonutPieChart(obj)
{
	var elm = obj.element;
	var colors = obj.color;
	var txt = obj.title;
	var val = obj.value;
	obj.selected = false;
	 var rp1 = radialProgress(document.getElementById(elm))
                .label(txt)
                .onClick(clickNCMRadialDialSeverity)
                .diameter(130)
                .value(obj.percentVal)
                .valueText(val)
                .id(elm)
                ._selected(false)
                .render();

       $("#"+elm+" .arc").css('fill',colors);
       $("#"+elm+" .arc").css('fill',colors);
       $("#"+elm).data().obj = obj;
       $("#"+elm).removeClass("active");
}

function clickNCMRadialDialSeverity(rp)
{
	var obj = $("#"+rp.id()).data().obj;
	if(obj.percentVal !== 0)
	{
		var _arr = OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects;
        _arr.splice( $.inArray(obj.status, _arr), 1 );
		if(!obj.selected)
		{
			obj.selected = true;
//			if(OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects[obj.queryKey] != undefined) {
				OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects[obj.queryKey] = [obj.status];
//			}
			$("#"+rp.id()).addClass("active");
		}
		else
		{
			obj.selected = false;
			OPMClient.InventoryDeviceDetailsController.ncmListFilterObjects[obj.queryKey] = [];
	        $("#"+rp.id()).removeClass("active");
		}
		refreshConfigMgmtList();
	}
}
//IgnoreI18N_Start
function populateInventoryApiClientGrid(gridTable, gridid, viewType, paramStr, gridPager, onSelectFunction, defaultOptions) {
	var columnURL = window.OPM.apiUrlPattern + '/ncmclient/getApiClientGrid?gridId='+gridid+"&gridTableId="+gridTable; //No I18N
	defaultOptions.ncmgridTableID=gridid;
	$.ajax({
		url: columnURL,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		success: function(jsonData) {
			var remote = jsonData.remote;
			var apiUrl = jsonData.apiUrl;
			var dataUrl = jsonData.dataUrl;
			defaultOptions.notifRegistered = jsonData.notifRegistered;
			defaultOptions.minRowsPerPage = (jsonData.gridPageSize != undefined)?jsonData.gridPageSize:50;
			var gridSorting = jsonData.gridSorting;
			if(gridSorting != null && gridSorting.index != null && gridSorting.sortOrder != null) {
                defaultOptions.sortName = gridSorting.index;
                defaultOptions.sortOrder = gridSorting.sortOrder;
			}
			defaultOptions.isv2Grid=jsonData.isv2Grid;
			defaultOptions.v2translateColNames=jsonData.v2translateColNames;
			if(jsonData.groupingView != undefined) {
				defaultOptions.groupingView = jsonData.groupingView;
			}
			if(remote == true) {
				var url = apiUrl + "?jqgridLoad=true"; // No I18N
				if(jsonData.timefilterParam != null) {
					url = url + '&TIME_FILTER_FIELD='+jsonData.timefilterParam; // No I18N
				}
				if(defaultOptions != null && defaultOptions != undefined) {
					if(defaultOptions.ignorePaging == true) {
						url = url + '&ignorePaging=true'; // No I18N
					}
				}
				if(paramStr != null && paramStr != "") {
					url = url + paramStr;
				}
				if(viewType == 'List' && jsonData.listcolModelList != null && jsonData.listcolModelList.length > 0 && jsonData.listcolNamesList != null && jsonData.listcolNamesList.length > 0) {
					jsonData.colModelList = jsonData.listcolModelList;
					jsonData.colNamesList = jsonData.listcolNamesList;
				}
				defaultOptions.groupsList = jsonData.groupsList;
				dropDowns = $('#DeviceList .AETIDFilDropDownList');
				dropDowns.empty();
				dropDowns.append("<li class='header'>"+Ember.I18n.t("sortby",this)+"<i class='icon-remove'></i></li>");

				for(var i = 0; i < jsonData.colModelList.length; i++) {
					var columnModel = jsonData.colModelList[i];
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
					else {
						var tmpFunc = new Function('return cellValueEscapeFormat');
						columnModel.formatter = tmpFunc();
					}
					if(columnModel.sortable != false && columnModel.sortable != "false" && columnModel.hidden != true && columnModel.hidden != "true" && jsonData.colNamesList[i] != "") {
						dropDowns.append("<li data-column='"+(i+2)+"'>"+jsonData.colNamesList[i]+"<i></i></li>");
					}
					if(columnModel.onlyInCentral != undefined && columnModel.onlyInCentral) {
						if(!window.OPM.isValidEEInstallation || (!window.OPM.isCentralServer && !window.OPM.isMSPCentral) || window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
					if(columnModel.hideInCentral != undefined && columnModel.hideInCentral) {
						if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
				}
				//device list sort
				$('#DeviceList .AETIDFilDropDownList li').click(function(){
					if(!$(this).hasClass('header')){
						$(this).parent().find('li').removeClass('active');
						$(this).addClass('active');
						Sort=$('#DeviceList .ui-jqgrid-htable');
						colCount=$(this).data('column');
						$(Sort).find('th:nth-child('+colCount+') div').click();
					}
				});
				if(defaultOptions.hideColumns!==undefined && defaultOptions.hideColumns.length>0){
					$.each(defaultOptions.hideColumns, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
							}
						});
					});
				}
				if(defaultOptions.setWidth !== undefined)
				{
					defaultOptions.setWidth =true;
				}
				defaultOptions.multiselectWidth=54;
				url=url+"&jqgrid_id="+gridid;
				loadJQgridWithRemote("#"+gridTable, url, jsonData.colNamesList, jsonData.colModelList, "", gridPager, onSelectFunction, defaultOptions); //No I18N
			}
		}
	});
}

function populateRemoteApiClientGrid(gridTable, paramStr, gridPager, onSelectFunction, defaultOptions) {
	if(defaultOptions == undefined) {
		defaultOptions = {};
	}
	var columnURL = window.OPM.apiUrlPattern + '/ncmclient/getApiClientGrid?gridId='+gridTable; //No I18N
	$.ajax({
		url: columnURL,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		success: function(jsonData) {
			var remote = jsonData.remote;
			var apiUrl = jsonData.apiUrl;
			var dataUrl = jsonData.dataUrl;
			var theme = jsonData.theme;
			if(jsonData.groupingView != undefined) {
				defaultOptions.groupingView = jsonData.groupingView;
			}
			var gridSorting = jsonData.gridSorting;
            if(gridSorting != null && gridSorting.index != null && gridSorting.sortOrder != null) {
                defaultOptions.sortName = gridSorting.index;
                defaultOptions.sortOrder = gridSorting.sortOrder;
            }
			defaultOptions.isv2Grid=jsonData.isv2Grid;
			defaultOptions.v2translateColNames=jsonData.v2translateColNames;
			if(theme === undefined){
				$("#"+gridTable).parent().closest('div').addClass("themeOne alterTheme no-strip");
			}
			defaultOptions.notifRegistered = jsonData.notifRegistered;
			if(defaultOptions.minRowsAlreadySet !== true) {
			    defaultOptions.minRowsPerPage = (jsonData.gridPageSize != undefined)?jsonData.gridPageSize:50;
			}
			if(remote == true) {
				var url = apiUrl + "?jqgridLoad=true"; // No I18N
				if(jsonData.timefilterParam != null) {
					url = url + '&TIME_FILTER_FIELD='+jsonData.timefilterParam; // No I18N
				}
				if(defaultOptions != null && defaultOptions != undefined) {
					if(defaultOptions.ignorePaging == true) {
						url = url + '&ignorePaging=true'; // No I18N
					}
				}
				if(paramStr != null && paramStr != "") {
					url = url + paramStr;
				}
				for(var i = 0; i < jsonData.colModelList.length; i++) {
					var columnModel = jsonData.colModelList[i];
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
					else {
						var tmpFunc = new Function('return cellValueEscapeFormat');
						columnModel.formatter = tmpFunc();
					}
					if(columnModel.onlyInCentral != undefined && columnModel.onlyInCentral) {
						if(!window.OPM.isValidEEInstallation || (!window.OPM.isCentralServer && !window.OPM.isMSPCentral) || window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
					if(columnModel.hideInCentral != undefined && columnModel.hideInCentral) {
						if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
				}
				defaultOptions.groupsList = jsonData.groupsList;
				if(defaultOptions.hideColumns!==undefined && defaultOptions.hideColumns.length>0){
					$.each(defaultOptions.hideColumns, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
							}
						});
					});
				}
				if(defaultOptions.hideColumnsLg!==undefined && defaultOptions.hideColumnsLg.length>0){
					$.each(defaultOptions.hideColumnsLg, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
								jsonData.colModelList[i2].hidedlg=true;
							}
						});
					});
				}
				if(defaultOptions.setWidth !== undefined)
				{
					defaultOptions.setWidth =true;
				}
				url=url+"&jqgrid_id="+gridTable;
				loadJQgridWithRemote("#"+gridTable, url, jsonData.colNamesList, jsonData.colModelList, "", gridPager, onSelectFunction, defaultOptions); //No I18N
				if(gridTable==="DEDevDrafts"){//No I18N
					Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
						$("#DEDevDrafts").jqGrid("setGridWidth", $("#ncmDeviceSummaryRightDiv").outerWidth()-2);//No I18N
		  			});
				}
			}
		}
	});
}

function ncm_loadJQgridWithData(gridTable, jsonData, colNamesList, colModelList, captionTitle, gridNavigator, onSelectFunction, defaultOptions, page) {
	for(var i = 0; i < colModelList.length; i++) {
		var columnModel = colModelList[i];
		if(columnModel.formatter != null && columnModel.formatter != "") {
			var tmpFunc = new Function('return '+columnModel.formatter);
			columnModel.formatter = tmpFunc();
		}
		else {
			var tmpFunc = new Function('return cellValueEscapeFormat');
			columnModel.formatter = tmpFunc();
		}
		if(columnModel.onlyInCentral != undefined && columnModel.onlyInCentral) {
			if(!window.OPM.isValidEEInstallation || (!window.OPM.isCentralServer && !window.OPM.isMSPCentral) || window.OPM.isProbeSelected) {
				columnModel.hidden = true;
				columnModel.hidedlg = true;
			}
		}
        if(columnModel.hideInCentral != undefined && columnModel.hideInCentral) {
            if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
                columnModel.hidden = true;
                columnModel.hidedlg = true;
            }
        }
	}
	opm_loadJQgridWithData(gridTable, jsonData, colNamesList, colModelList, captionTitle, gridNavigator, onSelectFunction, defaultOptions, page);
	$(gridTable).bind("jqGridAfterLoadComplete", function (e, data) {
		fixGridWidth($('#gbox_' + gridTable.substring(1)).closest('.opm_jqGridUI'), gridTable);
	});
	setTimeout(function() {
		fixGridWidth($('#gbox_' + gridTable.substring(1)).closest('.opm_jqGridUI'), gridTable);
	}, 500);
}


function populateRemoteGridDuplicateId(duplicateId, gridTable, paramStr, gridPager, onSelectFunction, defaultOptions) {
	if(defaultOptions == undefined) {
		defaultOptions = {};
	}
	defaultOptions.ncmgridTableID=gridTable;
	var columnURL = window.OPM.apiUrlPattern + '/ncmclient/getApiClientGrid?gridId='+gridTable+"&gridTableId="+duplicateId; //No I18N
	$.ajax({
		url: columnURL,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		success: function(jsonData) {
			var remote = jsonData.remote;
			var apiUrl = jsonData.apiUrl;
			var dataUrl = jsonData.dataUrl;
			var theme = jsonData.theme;
			defaultOptions.isv2Grid=jsonData.isv2Grid;
			defaultOptions.v2translateColNames=jsonData.v2translateColNames;
			if(jsonData.groupingView != undefined) {
				defaultOptions.groupingView = jsonData.groupingView;
			}
			var gridSorting = jsonData.gridSorting;
            if(gridSorting != null && gridSorting.index != null && gridSorting.sortOrder != null) {
                defaultOptions.sortName = gridSorting.index;
                defaultOptions.sortOrder = gridSorting.sortOrder;
            }
			if(theme === undefined){
				$("#"+duplicateId).parent().closest('div').addClass("themeOne alterTheme no-strip");
			}
			defaultOptions.notifRegistered = jsonData.notifRegistered;
			defaultOptions.minRowsPerPage = (jsonData.gridPageSize != undefined)?jsonData.gridPageSize:50;
			if(remote == true) {
				var url = apiUrl + "?jqgridLoad=true"; // No I18N
				if(jsonData.timefilterParam != null) {
					url = url + '&TIME_FILTER_FIELD='+jsonData.timefilterParam; // No I18N
				}
				if(defaultOptions != null && defaultOptions != undefined) {
					if(defaultOptions.ignorePaging == true) {
						url = url + '&ignorePaging=true'; // No I18N
					}
				}
				if(paramStr != null && paramStr != "") {
					url = url + paramStr;
				}
				for(var i = 0; i < jsonData.colModelList.length; i++) {
					var columnModel = jsonData.colModelList[i];
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
					else {
						var tmpFunc = new Function('return cellValueEscapeFormat');
						columnModel.formatter = tmpFunc();
					}
					if(columnModel.onlyInCentral != undefined && columnModel.onlyInCentral) {
						if(!window.OPM.isValidEEInstallation || (!window.OPM.isCentralServer && !window.OPM.isMSPCentral) || window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
					if(columnModel.hideInCentral != undefined && columnModel.hideInCentral) {
						if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
				}
				defaultOptions.groupsList = jsonData.groupsList;
				if(defaultOptions.hideColumns!==undefined && defaultOptions.hideColumns.length>0){
					$.each(defaultOptions.hideColumns, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
							}
						});
					});
				}
				if(defaultOptions.hideColumnsLg!==undefined && defaultOptions.hideColumnsLg.length>0){
					$.each(defaultOptions.hideColumnsLg, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
								jsonData.colModelList[i2].hidedlg=true;
							}
						});
					});
				}
				url=url+"&jqgrid_id="+gridTable;
				if(defaultOptions.setWidth !== undefined)
				{
					defaultOptions.setWidth =true;
				}
				loadJQgridWithRemote("#"+duplicateId, url, jsonData.colNamesList, jsonData.colModelList, "", gridPager, onSelectFunction, defaultOptions); //No I18N
			}
		}
	});
}

function populateNcmDynamicGrid(duplicateId, gridTable, paramStr, gridPager, onSelectFunction, defaultOptions, colModelUrl, colModelUrlParamStr) {
	if(!defaultOptions) {
		defaultOptions = {};
	}
	defaultOptions.ncmgridTableID=gridTable;
	var columnURL = window.OPM.apiUrlPattern + colModelUrl;
	if(colModelUrlParamStr){
	    columnURL = columnURL + colModelUrlParamStr;
	}
	$.ajax({
		url: columnURL,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		success: function(jsonData) {
			var remote = jsonData.remote;
			var apiUrl = jsonData.apiUrl;
			var dataUrl = jsonData.dataUrl;
			/*var theme = jsonData.theme;*/
			defaultOptions.isv2Grid = jsonData.isv2Grid;
			defaultOptions.v2translateColNames = jsonData.v2translateColNames;
			if(jsonData.groupingView != undefined) {
				defaultOptions.groupingView = jsonData.groupingView;
			}
			var gridSorting = jsonData.gridSorting;
            if(gridSorting != null && gridSorting.index != null && gridSorting.sortOrder != null) {
                defaultOptions.sortName = gridSorting.index;
                defaultOptions.sortOrder = gridSorting.sortOrder;
            }
			/*if(theme === undefined){
				$("#"+duplicateId).parent().closest('div').addClass("themeOne alterTheme no-strip");
			}*/
			defaultOptions.notifRegistered = jsonData.notifRegistered;
			defaultOptions.minRowsPerPage = (jsonData.gridPageSize != undefined) ? jsonData.gridPageSize : 50;
			if(remote == true) {
				var url = apiUrl + "?jqgridLoad=true"; // No I18N
				if(jsonData.timefilterParam != null) {
					url = url + '&TIME_FILTER_FIELD='+jsonData.timefilterParam; // No I18N
				}
				if(defaultOptions != null && defaultOptions != undefined) {
					if(defaultOptions.ignorePaging == true) {
						url = url + '&ignorePaging=true'; // No I18N
					}
				}
				if(paramStr) {
					url = url + paramStr;
				}
				for(var i = 0; i < jsonData.colModelList.length; i++) {
					var columnModel = jsonData.colModelList[i];
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
					else {
						var tmpFunc = new Function('return cellValueEscapeFormat');
						columnModel.formatter = tmpFunc();
					}
					if(columnModel.onlyInCentral != undefined && columnModel.onlyInCentral) {
						if(!window.OPM.isValidEEInstallation || (!window.OPM.isCentralServer && !window.OPM.isMSPCentral) || window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
					if(columnModel.hideInCentral != undefined && columnModel.hideInCentral) {
						if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
							columnModel.hidden = true;
							columnModel.hidedlg = true;
						}
					}
				}
				if (jsonData.grouping && jsonData.groupsList) {
				    defaultOptions.groupsList = jsonData.groupsList;
				}
                if (jsonData.scroll != undefined) {
                    defaultOptions.scroll = jsonData.scroll;
                }
                if (jsonData.shrinkToFit != undefined) {
                    defaultOptions.shrinkToFit = jsonData.shrinkToFit;
                } else {
                    defaultOptions.shrinkToFit = calculateShrinkToFit(jsonData.colModelList, jsonData.identifier);
                    // TODO :: Fixing width of certain cols with shrinkToFit true
                    /*if(defaultOptions.shrinkToFit) {
                        for (var i = 0; i < jsonData.colModelList.length; i++) {
                        var colModel = jsonData.colModelList[i];
                            if (!['id','Device Name','Total Rule Result'].includes(colModel.displayName)) {
                                colModel.width = "";
                            }
                        }
                    }*/
                }
				if(defaultOptions.hideColumns !== undefined && defaultOptions.hideColumns.length > 0){
					$.each(defaultOptions.hideColumns, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
							}
						});
					});
				}
				if(defaultOptions.hideColumnsLg !== undefined && defaultOptions.hideColumnsLg.length > 0){
					$.each(defaultOptions.hideColumnsLg, function(i,val){
						$.each(jsonData.colModelList, function(i2,val2){
							if(val===val2.name){
								jsonData.colModelList[i2].hidden=true;
								jsonData.colModelList[i2].hidedlg=true;
							}
						});
					});
				}
				if(defaultOptions.additionalParams) {
                    url = url + defaultOptions.additionalParams;
				}
				url=url + "&jqgrid_id=" + gridTable;
                if(defaultOptions.enableColCheckBox){
                    var updatedColNamesList = jsonData.colNamesList.map(function(colName, i) {
                        var colModel = jsonData.colModelList[i];
                        return (!colModel.hidedlg && colModel.name !== 'Device Name') // Its not display name
                            ? OPMClient.NCMComplianceUtilController.addCheckboxToHeader(colName)
                            : colName;
                    });
                    jsonData.colNamesList = updatedColNamesList;
                }
				loadJQgridWithRemote("#"+duplicateId, url, jsonData.colNamesList, jsonData.colModelList, "", gridPager, onSelectFunction, defaultOptions); //No I18N
//				if(defaultOptions.setWidth !== undefined)
//				{
//					defaultOptions.setWidth =true;
//				}
                /*if(defaultOptions.lazyLoading) {
				    var apiUrlTemp = url;
                    url = '';
                    loadJQgridWithRemote("#"+duplicateId, url, jsonData.colNamesList, jsonData.colModelList, "", gridPager, onSelectFunction, defaultOptions); //No I18N
				    var batchTimeoutId = null;
                    var loadGridData = function() {
                        // Cancel any previous batch
                        if (batchTimeoutId !== null) {
                            clearTimeout(batchTimeoutId);
                            batchTimeoutId = null;
                        }
                        var pageNo = defaultOptions.lazyLoadingParams.pageNo;
                        var recordsPerPage = defaultOptions.lazyLoadingParams.recordsPerPage;
                        var totalAdded = 0;
//                        var gridDataPage = jsonData.gridPageSize;
                        function processBatch() {
                            var tempUrl = apiUrlTemp + "&pageNo=" + pageNo + "&recordsPerPage=" + recordsPerPage; // No I18N
                            var jsonResult = opm_ajaxGetResponse(tempUrl);
                            var totalRows = jsonResult.totalRecords;
                            jQuery("#"+duplicateId).addRowData(undefined, jsonResult.rows); //No I18N
                            pageNo++;
                            totalAdded += jsonResult.rows.length;
//                            $("#"+duplicateId).jqGrid('setGridParam', {
//                                records: totalAdded,
//                                lastpage: Math.ceil(totalAdded / gridDataPage),
//                                page: 1
//                            });
//                            $("#"+duplicateId).jqGrid('setGridParam', { page: 1 });
//                            $("#"+duplicateId)[0].updatepager(true, true);
                            if (totalAdded < totalRows) {
                                batchTimeoutId = setTimeout(processBatch, 1000);
                            } else {
//                                $("#"+duplicateId).jqGrid('setGridParam', { page: 1 });
                                batchTimeoutId = null;
                            }
                        }
                        processBatch();
                    };
                    setTimeout(function() {
                        loadGridData();
                    }, 1);
                }
                else{
                    loadJQgridWithRemote("#"+duplicateId, url, jsonData.colNamesList, jsonData.colModelList, "", gridPager, onSelectFunction, defaultOptions); //No I18N
                }*/
			}
		}
	});
}

function loadJQgridWithRemote(gridTable, url, colNamesList, colModelList, captionTitle, gridNavigator, onSelectFunction, defaultOptions)
{
	if(onSelectFunction === "UnmanagedDevices" && !(OPMClient.ApplicationController.isAuthorized && window.OPM.userPermissions.ncmDevMgmtWrite)) {
		defaultOptions.multiselect = false;
	}
	if(onSelectFunction === "Devices" || onSelectFunction === "UnmanagedDevices") {
		window.devicereload = false;
		if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
			defaultOptions.multiselect = false;
		}
	}
	else if(onSelectFunction === "Changes"){
		if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
			defaultOptions.multiselect = false;
		}
	}
    if(onSelectFunction === "FirmwareVulnerability")
    {
        defaultOptions.multiselect = false;
        defaultOptions.searchOption = true;
        defaultOptions.showSearchIcon = false;
    }
	if(defaultOptions)
	{
		defaultOptions.setWidth != undefined ? '' : defaultOptions.setWidth =true;
	}
	else
	{
		defaultOptions = {};
		defaultOptions.setWidth =true;
	}

	if(defaultOptions.gridCallBack == undefined) {
		var callBack = function () {
	        $(gridTable+'_searchIndex').width('50px');//No I18N
	    };
	    defaultOptions.gridCallBack = callBack;
	}

	for(var i = 0; i < colModelList.length; i++) {
        var columnModel = colModelList[i];
        if(columnModel.formatter != null && columnModel.formatter != "") {
            var tmpFunc = new Function('return '+columnModel.formatter);
            columnModel.formatter = tmpFunc();
        } else {
            var tmpFunc = new Function('return cellValueEscapeFormat');
            columnModel.formatter = tmpFunc();
        }
    }

	var defaultSortName = ""; //No I18N
	var defaultSortOrder = "asc"; //No I18N
	var widthOfTable = "100"; //No I18N
	var multiselectVal = false; // No I18N
	var multiselectWidth = '25px'; // No I18N
	var apiUrl = "";// No I18N
	var urlParameter ="";// No I18N// No I18N
  	var deleteName = "";// No I18N
	var rowNumNeeded = false; //No I18N
	var addIcon = false;
	var delIcon = false;
	var selectedMonitorTab = "";
	var deviceName = "";// No I18N
	var deviceNameParameter = "";// No I18N
	var delMsg = Ember.I18n.t("js.common.DeleteAlert1",this);// No I18N
	var minRowsPerPage = 50;
	var rowList = defaultOptions && defaultOptions.rowList ? defaultOptions.rowList : [25,50,100,150,200,300,400,500];
	var searchOption = false;
	var afterSearch = false;
	var grouping = false;
	var subGrid = false;
	var hiddengrid=false;
	var hidegrid=false;
	var groupField=['rName'];
	var height = "auto"//No I18N
	var groupText='<b>  {0}  </b>';//NO I18N
	var groupCollapse=true;
	var disableRowSelect = false;
	var rowSelArray = [];
	var postData = {};
	var toggleSearch = false;
	var pagination = true;
	var groupingField = "";
	var plusicon = "ui-icon-circlesmall-plus";// No I18N
	var minusicon = "ui-icon-circlesmall-minus";// No I18N
	var groupingText = '<b>{0} </b>'; //No I18n
	if (defaultOptions !== undefined)
	{
		if (defaultOptions.toggleSearch !== undefined)
		{
			toggleSearch = defaultOptions.toggleSearch; //No I18N
		}
		if(defaultOptions.plusicon !== undefined)
		{
			plusicon = defaultOptions.plusicon;
		}
		if(defaultOptions.groupingField !== undefined)
		{
			groupingField = defaultOptions.groupingField.split(",");
		}
		if(defaultOptions.minusicon !== undefined)
		{
			minusicon = defaultOptions.minusicon;
		}
		if(defaultOptions.groupingText !== undefined)
		{
			groupingText = defaultOptions.groupingText;
		}
		if(defaultOptions.postData !== undefined)
		{
			postData = defaultOptions.postData; //No I18n
		}
		if(defaultOptions.groupText !== undefined)
		{
			groupText = defaultOptions.groupText; //No I18n
		}
		if(defaultOptions.subGrid !== undefined)
		{
			subGrid = defaultOptions.subGrid; //No I18n
		}
		if(defaultOptions.groupField !== undefined)
		{
			groupField = defaultOptions.groupField; //No I18n
		}
		if(defaultOptions.hiddengrid !== undefined)
		{
			hiddengrid = defaultOptions.hiddengrid; //No I18n
		}
		if (defaultOptions.searchOption !== undefined)
		{
			searchOption = defaultOptions.searchOption; //No I18N
            if(defaultOptions.showSearchIcon === undefined || defaultOptions.showSearchIcon === true)
            {
                colNamesList.push("");
                colModelList.push({index:"searchIndex",name:"searchIndex",width:40,search:false,sortable:false,hidedlg:true,hidden:true});//No I18N
            }
		}
		if (defaultOptions.sortName !== undefined)
		{
			defaultSortName = defaultOptions.sortName; //No I18N
		}
		if (defaultOptions.sortOrder !== undefined)
		{
			defaultSortOrder = defaultOptions.sortOrder; //No I18N
		}
		if (defaultOptions.widthOfTable !== undefined)
		{
			widthOfTable = defaultOptions.widthOfTable; //No I18N
		}
		if (defaultOptions.multiselect !== undefined)
		{
			multiselectVal = defaultOptions.multiselect; //No I18N
			if(defaultOptions.multiselect) {
				multiselectWidth = '54px'; // No I18N
			}
		}
		if (defaultOptions.multiselectWidth !== undefined)
		{
			multiselectWidth = defaultOptions.multiselectWidth;
		}
		if (defaultOptions.apiUrl !== undefined)
		{
			apiUrl = defaultOptions.apiUrl; //No I18N
		}
		if (defaultOptions.urlParameter !== undefined)
		{
			urlParameter = defaultOptions.urlParameter; //No I18N
		}
		if (defaultOptions.deleteName !== undefined)
		{
			deleteName = defaultOptions.deleteName; //No I18N
		}
		if (defaultOptions.rowNumNeeded !== undefined)
		{
			rowNumNeeded = defaultOptions.rowNumNeeded; //No I18N
		}
		if (defaultOptions.addIcon !== undefined)
		{
			addIcon = defaultOptions.addIcon; //No I18N
		}
		if (defaultOptions.delIcon !== undefined)
		{
			delIcon = defaultOptions.delIcon; //No I18N
		}
		if (defaultOptions.selectedMonitorTab !== undefined)
		{
			selectedMonitorTab = defaultOptions.selectedMonitorTab; //No I18N
		}
		if (defaultOptions.deviceName !== undefined)
		{
			deviceName = defaultOptions.deviceName; //No I18N
		}
		if (defaultOptions.deviceNameParameter !== undefined)
		{
			deviceNameParameter = defaultOptions.deviceNameParameter; //No I18N
		}
		if (defaultOptions.delConfirmMsg !== undefined)
		{
			delMsg = defaultOptions.delConfirmMsg; //No I18N
		}
		if (defaultOptions.minRowsPerPage !== undefined)
		{
			minRowsPerPage = defaultOptions.minRowsPerPage; //No I18N
		}
		if (defaultOptions.grouping !== undefined)
		{
			grouping = defaultOptions.grouping; //No I18N
		} else if (defaultOptions.groupingView  !== undefined)
		{
			grouping = true;
		}
		if (defaultOptions.height !== undefined)
		{
			height = defaultOptions.height; //No I18N
		}
		if (defaultOptions.groupCollapse !== undefined)
		{
			groupCollapse = defaultOptions.groupCollapse; //No I18N
		}
		if (defaultOptions.hidegrid !== undefined)
		{
			hidegrid = defaultOptions.hidegrid; //No I18N
		}
		if(defaultOptions.disableRowSelect != undefined) {
			disableRowSelect = defaultOptions.disableRowSelect;
		}
		if(defaultOptions.pagination != undefined) {
			pagination = defaultOptions.pagination;
		}
        if(defaultOptions.rowList != undefined){
            rowList = defaultOptions.rowList;
        }
        if(defaultOptions.afterSearch != undefined){
        	afterSearch = defaultOptions.afterSearch;
        }
		rowSelArray = defaultOptions.rowSelArray;
	}

	try {
		if(defaultOptions.isv2Grid && !defaultOptions.v2translateColNames) {
			for (var index = 0; index < colNamesList.length; index++) {
				var colmnName = colNamesList[index];
				if(colmnName != 'ID' && colmnName != '') {
					colNamesList[index] = Ember.I18n.t(colmnName);
				}
			}
		}
	} catch (e) {

	}

	if(!defaultOptions.isSnapshotGrid) {
		colNamesList.push("");
		colModelList.push({index:"colChooserIndex",name:"colChooserIndex",width:40,search:false,sortable:false,hidedlg:true,hidden:true});//No I18N
	}
	if(minRowsPerPage>1000)
	{
		rowList=[minRowsPerPage];
	}
	if(defaultOptions.noPaginationShowAll){
        minRowsPerPage = 5000;
	}
	var grid = $(gridTable);
	var gridDivId = "#gbox_"; //No I18N
	var gridTableIdAlone = gridTable.substring(1); //No I18N
	gridDivId = gridDivId+gridTableIdAlone; //No I18N
	var gridDiv = $(gridDivId); //No I18N
	if (gridDiv.length > 0)
	{
		grid.jqGrid('clearGridData'); //No I18N
//		grid.jqGrid('setGridParam', { datatype: "jsonstring", datastr: jsonData }); //No I18N
		grid.trigger('reloadGrid'); //No I18N
	}
	else
	{
		var gridviewVal = false;
		if (onSelectFunction === "alarmListColored") //No I18N
		{
			gridviewVal = true;
		}

        if(defaultOptions && defaultOptions.gridviewVal){
            gridviewVal = defaultOptions.gridviewVal;
        }
	grid.jqGrid({
		url: url,
		datatype: "json", //No I18N
		colNames: (defaultOptions && defaultOptions.skipEscapeColNameFormatter) ? colNamesList : escapeGridColumnNames(colNamesList),
		colModel: colModelList,
    		prmNames: {totalrows:null}, //No I18N
		pager: (pagination)?gridNavigator:"", //No I18N
		rowList: rowList,
		ajaxRowOptions: { async: true },
		//datatype: "jsonstring", //No I18N
		//datastr: jsonData,
		multiselect: multiselectVal,
		multiselectWidth: multiselectWidth,
		loadOnce: false,
		toppager: false,
		postData: postData,
		//jsonReader: { root: function (obj) { return obj; }, repeatitems: false },
		rownumbers: rowNumNeeded,
		rowNum: minRowsPerPage,
		viewrecords: true,
		grouping: grouping,
		autoencode:true,
		groupingView:(defaultOptions.groupingView != undefined) ? defaultOptions.groupingView :
		{
			plusicon: plusicon,
			minusicon: minusicon,
			groupField: groupingField,
			groupColumnShow: [false],
			groupCollapse:groupCollapse,
			groupText:[groupingText]
		},
		jsonReader: (defaultOptions.isv2Grid)?{
            root: function (jsonObj) {
                return jsonObj.rows;
            }, //No I18N
            page: "page",//No I18N
            total: "total",//No I18N
            records: "records",  //No I18N
            repeatitems: false,//No I18N
            data:"data"//No I18N
		}:undefined,
	    caption: escapeHTML(captionTitle),
		height: height, //No I18N
		autowidth: true,
		shrinkToFit: !defaultOptions.shrinkToFit ? defaultOptions.shrinkToFit : true,
		scroll: !defaultOptions.scroll ? defaultOptions.scroll : false,
		hidegrid: hidegrid,
		hiddengrid:false,
		ignoreCase: true,
		sortable: (defaultOptions.sortable === false) ? false : true,
		subGrid:subGrid,
		sortname: defaultSortName, //No I18N
		sortorder: defaultSortOrder, //No I18N
		gridview: gridviewVal, // If set to true, the event below doesn't fired
		subGridOptions:
		{
			"plusicon"  : "ui-icon-triangle-1-e",//No I18N
			"minusicon" : "ui-icon-triangle-1-s", //No I18N
			"openicon"  : "ui-icon-arrowreturn-1-e", //No I18N
			"reloadOnExpand" : false, //No I18N
			"selectOnExpand" : true //No I18N
		},
		loadBeforeSend: function(xhr,settings)
		{
			appendNCMProbeDetailsToURL(xhr, settings);
			appendCollectorDetails(xhr,settings)
			// if(onSelectFunction === 'bulkRemediationTable' && defaultOptions && defaultOptions.enableColCheckBox) {
			// 	defaultOptions._bulkRemediationSelectionSynced = false; // NO I18N
			// }
			// Call beforeSendCallback if provided to save selections before grid reload
			if(defaultOptions && defaultOptions.beforeSendCallback && typeof defaultOptions.beforeSendCallback === 'function') {
				defaultOptions.beforeSendCallback();
			}
		},
		onSortCol: function (index, columnIndex, sortOrder) {
            setTimeout(function() {
		      	var NCMGridTableId = (defaultOptions.ncmgridTableID != null)?defaultOptions.ncmgridTableID:gridTable.substring(1);
		      	var sort_data_obj = {};
		      	sort_data_obj.index = index;
		      	sort_data_obj.columnIndex = columnIndex;
		      	sort_data_obj.sortOrder = sortOrder;
		      	var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridColumnChooser';//No I18N
		 		$.ajax(
				{
					url: url,
					type: 'POST', //No I18N
					data : {'GRID_ID': NCMGridTableId ,'COLUMN_SORTING':JSON.stringify(sort_data_obj)},//No I18N
					success: function(response){}
				});
		      }, 0);
        },
		onPaging : function(pgButton){
		    if (pgButton == 'records'){
		      setTimeout(function() {
	    	    var rowSize = grid.jqGrid('getGridParam', 'rowNum');
		      	var NCMGridTableId = (defaultOptions.ncmgridTableID != null)?defaultOptions.ncmgridTableID:gridTable.substring(1);
		      	var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridRowsCount?GRID_ID='+NCMGridTableId + '&GRID_PAGE_SIZE='+rowSize;//No I18N
		 		$.ajax(
				{
					url: url,
					type: 'POST', //No I18N
					success: function(response){}
				});
		      }, 0);
		    }
		    if(OPMClient.InventoryDeviceDetailsController.fromDeviceGroupDetails && $('#DEDevAuditStatus').length > 0) {
				setTimeout(function() {
					$('#DEDevAuditStatus').setGridWidth($('#gbox_DEDevAuditStatus').parent().width());
				}, 100);
			}
//		    if(defaultOptions && defaultOptions.beforeSendCallback){
//                defaultOptions.beforeSendCallback();
//		    }

		},
		subGridRowExpanded: function(subgrid_id, row_id)
		{
			var subgrid_table_id = subgrid_id+"_t"; //No I18N

			var choice =defaultOptions.subGridFunction;
			$("#"+subgrid_id).addClass('opm_jqGridUI');
			var tableHtml ="<table id='"+subgrid_table_id+"'></table>";
			$("#"+subgrid_id).html(tableHtml);
			var defaultGridOpts = {isNCM: true,noPaginationShowAll:true};
			if(choice == "NCMuserAccessDevices")
			{

				var loginId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				var colNamesList = [Ember.I18n.t("ncm.acd.Hostname"),Ember.I18n.t("jsp.commonstr.IpAddress"),Ember.I18n.t("webclient.common.series"),Ember.I18n.t("webclient.snapshot.hardware.model")]; //No I18N
				var colModelList = [
                 {
                	 name : 'HostName',//No I18N
                	 index : 'HostName'//No I18N
                 } ,
                 {
                	 name : 'IpAddress',//No I18N
                	 index : 'IpAddress'//No I18N
                 } ,
                 {
                	 name : 'Series',//No I18N
                	 index : 'Series'//No I18N
                 } ,
                 {
                	 name : 'Model',//No I18N
                	 index : 'Model'//No I18N
                 }
                 ];

				$.ajax({
		            url:window.OPM.apiUrlPattern + "/ncmreports/getFirmwareInvInnerData?isUserAccessReport=true&userIdforDeviceList="+loginId, //No I18N
		            type:'GET', //No I18N
		            success:function(repList){
		    			opm_loadJQgridWithData("#"+subgrid_table_id, repList.rows,colNamesList,colModelList, "", "", "",defaultGridOpts); //No I18N
		            }
		         });

				return;
			}
            else if(choice == "NCMComplianceCRDetails") //No I18N
			{
				var resId = row_id;
				var reportId=defaultOptions.Data;
                                var subgrid_table_id = "DENCMComplianceCRStatus"+"_"+resId; //No I18N
				var defOpts = {
						multiselect: false,
						searchOption: false
				};
				var tempparams = "&REPORT_ID="+reportId+"&RESOURCE_ID="+resId;//No I18N
				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;'></table>");//No I18N
				populateRemoteGridDuplicateId(subgrid_table_id, "DENCMComplianceCRStatus", tempparams, "", "NCMResourceRuleStatus_CR", defOpts); //No I18N
				return;
			}
			else if(choice == "DEChangesReport")
			{
				var deviceId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				var subgrid_table_id = "DEDeviceChangeList"+"_"+deviceId; //No I18N
				var defOpts = {
						multiselect: false,
						searchOption: false,
						noPaginationShowAll:true
				};
				var tempparams = "";
				if(defaultOptions.timeDuration != null) {
					tempparams = "&TIME_DURATION="+defaultOptions.timeDuration;//No I18N
					subgrid_table_id = "DEDeviceChangeList_"+defaultOptions.timeDuration.replace(",","_")+"_"+deviceId; //No I18N
				}
				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
				populateRemoteGridDuplicateId(subgrid_table_id, "DEDeviceChangeList", tempparams+"&deviceId="+deviceId, "", "DEDeviceChangeList", defOpts); //No I18N
				return;
			}
			else if(choice == "Inventory_Devices_Sub")
            {
                var deviceId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
                var subgrid_table_id = "NCMDevChangeList"+"_"+deviceId; //No I18N
                var subgrid_pager_id = "NCMDevChangePager"+"_"+deviceId; //No I18N
                var defOpts = {
                    multiselect: false,
                    searchOption: true,
                    minRowsPerPage: 10,
                    rowList : [10,25]
                };
                var tempparams = "";
                $("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table><div id='"+subgrid_pager_id+"' class='relative'></div>");
                populateRemoteGridDuplicateId(subgrid_table_id, "NCMDevChange_RO_List", "&deviceId="+deviceId, "#"+subgrid_pager_id, "Snap_Changes", defOpts); //No I18N
                return;
            }
			else if(choice == "DEConfigletsResults")
			{
				var executionId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				OPMClient.SettingsNCMConfigController.executionId = executionId;
				var subgrid_table_id = "DEDetailedExecList"+"_" + executionId + "_" + deviceId; //No I18N
				var defOpts = {
						multiselect: false,
						searchOption: false,
						isSubgrid:true
				};
				
				if(!window.OPM.userPermissions.reportsRead) {
					defOpts.hideColumnsLg = ['action'];
				}
				var tempparams = "";
				if(defaultOptions.timeDuration != null) {
					tempparams = "&TIME_DURATION="+defaultOptions.timeDuration;//No I18N
					subgrid_table_id = "DEDetailedExecList_"+defaultOptions.timeDuration.replace(",","_")+"_"+deviceId; //No I18N
				}
				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
				populateRemoteGridDuplicateId(subgrid_table_id, "DEDetailedExecList", "&EXECUTION_ID="+executionId, "", "DEv2DetailedExecList", defOpts); //No I18N
				return;
			}
			else if(choice == "DEConfigletGroupSubGrid")
			{
				var groupId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				var subgrid_table_id = "DEConfigletGroupSubGridList"+"_" + groupId; //No I18N
				var defOpts = {
						multiselect: false,
						searchOption: false,
						isSubgrid:true
				};

				if(!window.OPM.userPermissions.reportsRead) {
					defOpts.hideColumnsLg = ['action'];
				}
				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
				populateRemoteGridDuplicateId(subgrid_table_id, "DEConfigletGroupSubGridList", "&group_id="+groupId, "", "", defOpts); //No I18N
				return;
			}
			else if(choice == "DECompCompliant" || choice == "DECompViolation")
			{
				var deviceId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				var subgrid_table_id = "DEResCompStatusTable"+"_"+deviceId; //No I18N
				var defOpts = {
						multiselect: false,
						searchOption: false,
						noPaginationShowAll:true
				};
				
				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
				populateRemoteGridDuplicateId(subgrid_table_id, "DEResCompStatusTable", "&resourceId="+deviceId, "", "DEResCompStatusTable", defOpts); //No I18N
				return;
			}
            else if(choice == "FirmVulnAllVulnSubGrid")//No I18N
            {

                var vulId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
                OPMClient.NCMFirmwareVulnerability.showExposedDeviceDetGrid(vulId,subgrid_table_id);
                return;

            }
                else if(choice === 'FirmVulExposedDevicesSubGrid' || choice === 'FirmVulDeviceSevSubGrid')//No I18N
                {
                    var map = OPMClient.NCMFirmwareVulnerability.getSelectedCriteria('');
                    var rsId = grid.jqGrid('getCell', row_id, 'rsId'); //No I18N
                    if(rsId === false)
                    {
                        rsId = grid.jqGrid('getCell', row_id, 'resourceId'); //No I18N
                    }
                    var customSortBasecore = function (cellValue) {
                        return (parseFloat(cellValue))
                    };
                    var customSortSeverity = function (cellValue, rowData) {
                        return (parseFloat(rowData.BASESCORE))
                    };
                    var colNamesList = [Ember.I18n.t('webclient.ncm.firmwarevulnerability.cveid'),Ember.I18n.t('webclient.ncm.firmwarevulnerability.base_score'),Ember.I18n.t('webclient.alarm.severity'),Ember.I18n.t('webclient.ncm.firmvuln.type'),Ember.I18n.t('webclient.ncm.firmvuln.Exploit'),Ember.I18n.t('webclient.ncm.firmvuln.patch')];//No I18N
                    var colModelList = [
                        {
                            name : 'CVEID',//No I18N
                            index : 'CVEID',//No I18N
                            formatter : firmVulnCveDetSlide
                        } ,
                        {
                            name : 'BASESCORE',//No I18N
                            index : 'BASESCORE',//No I18N
                            sorttype : customSortBasecore
                        },
                        {
                            name : 'SEVERITY',//No I18N
                            index : 'SEVERITY',//No I18N
                            formatter : firmwareVulnerabilitySeverityFormatter,
                            sorttype : customSortSeverity
                        },
                        {
                            name : 'VULTYPE',//No I18N
                            index : 'VULTYPE',//No I18N
                            formatter : firmVulnTypeFormatter
                        },
                        {
                            name : 'EXPLOIT',//No I18N
                            index : 'EXPLOIT',//No I18N
                            formatter : exploitStatusFomatter
                        },
                        {
                            name : 'PATCH',//No I18N
                            index : 'PATCH',//No I18N
                            formatter : cellValueEscapeFormat
                        }
                    ];
                    var data = {
                        'rsId':rsId,//No I18N
                        'SEVERITY':map.severity,//No I18N
                        'EXPLOIT':map.exploit,//No I18N
                        'DG_ID':map.deviceGrp//No I18N
                    };
                    var defaultGridOpts = {isNCM: true,noPaginationShowAll:true};
                    $.ajax({
                        url:window.OPM.apiUrlPattern + "/ncmcompliance/getFirmVulExposedDeviceVul", //No I18N
                        data:data,
                        type:'GET', //No I18N
                        success:function(repList){
                            opm_loadJQgridWithData("#"+subgrid_table_id, repList.rows,colNamesList,colModelList, "", "", "",defaultGridOpts); //No I18N
                        }
                    });
                    return;
                }
                else if(choice === 'FVDailyTrendCveDetails' || choice === 'FVDailyTrendCveDetails1'){
                    var showSubGrid = grid.jqGrid('getCell', row_id, 'showSubGrid'); //No I18N
                    if(showSubGrid === 'false'){
                        msgID = opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.ncm.firmvuln.msg.nodata',this)); //No I18N
                         setTimeout(function () {
                            $("#"+msgID).remove();//No I18N
                         },4000);
                        return;
                    }
                    var subgrid_table_id = choice+"_"+row_id; //No I18N
                    var widthOfTab = $('#gbox_FVDailyTrendCveReport').width()-80;//No I18N;
                    var defOpts = {
                            multiselect: false,
                            searchOption: false,
                            noPaginationShowAll:true,
                            widthOfTable : widthOfTab
                    };
                    $("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
                    populateRemoteGridDuplicateId(subgrid_table_id, "FVDailyTrendCveDetails", "&TREND_ID="+row_id, "", "FVDailyTrendCveDetails", defOpts); //No I18N
                    return;
                }
                else if(choice === 'FVDeviceCVEHistory'){
                    var subgrid_table_id = "FVDeviceCVEHistory"+"_"+row_id; //No I18N
                    var widthOfTab = $('#gbox_FVDeviceHistory').width()-80;//No I18N;
                    var defOpts = {
                            multiselect: false,
                            searchOption: false,
                            noPaginationShowAll:true,
                            widthOfTable : widthOfTab
                    };
                    $("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
                    populateRemoteGridDuplicateId(subgrid_table_id, "FVDeviceCVEHistory", "&resourceId="+row_id, "", "FVDeviceCVEHistory", defOpts); //No I18N
                    return;
                }
                else if(choice === 'OsVersionHistory'){
                    var subgrid_table_id = choice +"_"+row_id; //No I18N
                    var showSubGrid = grid.jqGrid('getCell', row_id, 'showSubGrid'); //No I18N
                    if(showSubGrid === 'false'){
                        $("#"+subgrid_id).html('<div style="text-align:center;">'+Ember.I18n.t('ncm.report.OsVersionHistory.notAvail',this)+'</div>');//No I18N
                        return;
                    }
                    var widthOfTab = $('#gbox_OsVersionHistory').width()-80;//No I18N;
                    var defOpts = {
                            multiselect: false,
                            searchOption: false,
                            noPaginationShowAll:true,
                            widthOfTable : widthOfTab
                    };
                    $("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");//No I18N
                    populateRemoteGridDuplicateId(subgrid_table_id, choice , "&resourceId="+row_id, "", choice , defOpts); //No I18N
                    return;
                }
                else if(choice === 'FirmVulnVersionSubGrid' || choice === 'FirmVulCveDeviceSevSubGrid')//No I18N
                {
                    var customSortBasecore = function (cellValue) {
                        return (parseFloat(cellValue))
                    };
                    var customSortSeverity = function (cellValue, rowData) {
                        return (parseFloat(rowData.BASESCORE))
                    };
                    var map = OPMClient.NCMFirmwareVulnerability.getSelectedCriteria('');
                    var colNamesList = [Ember.I18n.t("ncm.acd.Hostname", this),Ember.I18n.t("opstor.inventory.hp.raid.host.ipaddress", this),Ember.I18n.t('webclient.ncm.firmwarevulnerability.cveid'),Ember.I18n.t('webclient.ncm.firmwarevulnerability.base_score'),Ember.I18n.t('webclient.alarm.severity'),Ember.I18n.t('webclient.ncm.firmvuln.type'),Ember.I18n.t('webclient.common.series', this),Ember.I18n.t('webclient.snapshot.hardware.model', this),Ember.I18n.t('webclient.ncm.firmvuln.patch')];//No I18N
                    var colModelList = [
                        {
                            name : 'HOSTNAME',//No I18N
                            index : 'HOSTNAME',//No I18N
                            formatter : firmwareVulnerabilityDeviceToSnapshotFomatter
                        },
                        {
                            name : 'IPADDRESS',//No I18N
                            index : 'IPADDRESS',//No I18N
                            formatter : firmwareVulnerabilityDeviceToSnapshotFomatter
                        },
                        {
                            name : 'CVEID',//No I18N
                            index : 'CVEID',//No I18N
                            formatter : firmVulnCveDetSlide
                        },
                        {
                            name : 'BASESCORE',//No I18N
                            index : 'BASESCORE',//No I18N
                            sorttype : customSortBasecore
                        },
                        {
                            name : 'SEVERITY',//No I18N
                            index : 'SEVERITY',//No I18N
                            formatter : firmwareVulnerabilitySeverityFormatter,
                            sorttype : customSortSeverity
                        },
                        {
                            name : 'VULTYPE',//No I18N
                            index : 'VULTYPE',//No I18N
                            formatter : firmVulnTypeFormatter
                        },
                        {
                            name : 'SERIES',//No I18N
                            index : 'SERIES',//No I18N
                            formatter : cellValueEscapeFormat
                        },
                        {
                            name : 'MODEL',//No I18N
                            index : 'MODEL',//No I18N
                            formatter : cellValueEscapeFormat
                        },
                        {
                            name : 'PATCH',//No I18N
                            index : 'PATCH',//No I18N
                            formatter : cellValueEscapeFormat
                        }
                    ];
                    var data = {
                        'osVer':grid.jqGrid('getCell', row_id, 'NCMResource__OSVERSION'), //No I18N
                        'vendor':grid.jqGrid('getCell', row_id, 'NCMVendor__VENDORNAME'), //No I18N
                        'SEVERITY':map.severity,//No I18N
                        'EXPLOIT':map.exploit,//No I18N
                        'DG_ID':map.deviceGrp//No I18N
                    };

                    if(window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected){
                        colNamesList.push(Ember.I18n.t("webclient.admin.probes.probename", this)); //No I18N
                        colModelList.push(
                            {
                                name : 'PROBENAME',//No I18N
                                index : 'PROBENAME'//No I18N
                            }
                        );
                    }
					var defaultGridOpts = {isNCM: true,noPaginationShowAll:true};
                    $.ajax({
                        url:window.OPM.apiUrlPattern + "/ncmcompliance/getFirmVulVersionSubTable", //No I18N
                        data:data,
                        type:'GET', //No I18N
                        success:function(repList){
                            var resourceIDMap = new Map();
                            var list = repList.rows;
                            for(var i=0; i<list.length; i++)
                            {
                                resourceIDMap.set(list[i].HOSTNAME,list[i].ID)//No I18N
                            }
                            OPMClient.NCMFirmwareVulnerability.ResourceIDMap = resourceIDMap;
                            opm_loadJQgridWithData("#"+subgrid_table_id, repList.rows,colNamesList,colModelList, "", "", "",defaultGridOpts); //No I18N
                        }
                    });
                    return;
            }
            else if(choice === 'FirmVulnPatchesSubGrid'){
                var map = OPMClient.NCMFirmwareVulnerability.getSelectedCriteria('');//No I18N
                var rsId = grid.jqGrid('getCell', row_id, 'id'); //No I18N
                if(rsId === false)
                {
                    rsId = grid.jqGrid('getCell', row_id, 'resourceId'); //No I18N
                }
                var subgrid_table_id = "FirmVulnPatchesSubGrid"+"_"+row_id; //No I18N
                var widthOfTab = $('#gbox_FirmVulnPatchesSubGrid').width()-80;//No I18N;
                var defOpts = {
                    multiselect: false,
                    searchOption: false,
                    noPaginationShowAll:true,
                    widthOfTable : widthOfTab
                };
                var params = "&rsId="+rsId+"&SEVERITY="+map.severity+"&EXPLOIT="+map.exploit+"&DG_ID="+map.deviceGrp;//No I18N
                $("#"+subgrid_id).prop("innerHTML","<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
                populateRemoteGridDuplicateId(subgrid_table_id, "FirmVulnPatchesSubGrid", params, "", "FirmVulnPatchesSubGrid", defOpts); //No I18N
                return;
            }
			else if(choice == "CPSyncTasksSubGrid")
			{
				var task_id = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				var subgrid_table_id = "CPSyncAccounts"+"_" + task_id; //No I18N

				var defOpts = {
						multiselect: false,
						searchOption: false,
						isSubgrid:true
				};

				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
				populateRemoteGridDuplicateId(subgrid_table_id, "CPSyncAccounts", "&task_id="+task_id, "", "", defOpts); //No I18N
				return;
			}
			else if(choice == "CPSharedResourcesSubGrid")
			{
				var resource_id = grid.jqGrid('getCell', row_id, 'id'); //No I18N
				var subgrid_table_id = "CPSharedAccounts"+"_" + resource_id; //No I18N

				var defOpts = {
						multiselect: false,
						searchOption: false,
						isSubgrid:true
				};

				$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
				populateRemoteGridDuplicateId(subgrid_table_id, "CPSharedAccounts", "&resource_id="+resource_id, "", "", defOpts); //No I18N
				return;
			}
			var params = "";
			for (var indexA = 0; indexA < defaultOptions.api.params.length; indexA++) {
				var array_element = defaultOptions.api.params[indexA];
				params = params + "&"+array_element.name+"="+grid.jqGrid('getCell', row_id, array_element.reference);
			}
			params = params + defaultOptions.paramURL;
			if(params!==""){
				params = "?" + params.substr(1); // NO I18N
			}
			if(defaultOptions.remote) {
					var defaultGridOpts = {isNCM: true,noPaginationShowAll:true};
				loadJQgridWithRemote("#"+subgrid_table_id, defaultOptions.api.url+params, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "", defaultGridOpts)
			} else {
				var defaultGridOpts = {isNCM: true,noPaginationShowAll:true,searchOption:false};

				$.ajax({
					url: defaultOptions.api.url+params,
					type: 'GET',//No I18N
					dataType: 'json',//No I18N
					success: function(jsonData) {
						opm_loadJQgridWithData("#"+subgrid_table_id, jsonData.rows, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "", defaultGridOpts);
						if(defaultOptions != undefined && defaultOptions.isSnapshotGrid) {
							setTimeout(function(){snapshotRemotegridCallback(defaultOptions.snapId, jsonData.rows.length, gridTable, false, defaultOptions.reload, "", true);},200);
						}
					}
				});
			}
		},
		onSelectAll: function(rowIds, allChecked) {
			$("input.groupHeader").attr('checked', allChecked);
			if(onSelectFunction === 'bulkRemediationTable'){
				OPMClient.NCMComplianceUtilController.selectGridCol('', false, allChecked, true);
			}
			allChecked && defaultOptions.showActionDiv ? $(".opmActionsIcons").slideDown() : $(".opmActionsIcons").slideUp() ;
			defaultOptions.showActionDiv ? $(".opmForm").addClass("opmFormType5") : '';

			if(onSelectFunction === "SkipApprovalCLI" || onSelectFunction === "SkipApprovalREST"){//No I18N
				if (defaultOptions !== undefined){
					gridSelectedRows[gridTable]={};
				}
				var entityDataList = [];
				for(var idx = 0; idx < rowIds.length; idx++){
					var entityData = $(gridTable).jqGrid("getRowData", rowIds[idx]);//No I18N
					entityDataList.push(entityData);
					if(allChecked){
						gridSelectedRows[gridTable][rowIds[idx]] = entityData;
					}else{
						delete gridSelectedRows[gridTable][rowIds[idx]];
					}
				}
				if(allChecked){
					if(onSelectFunction === "SkipApprovalCLI"){//No I18N
						OPMClient.NCMSkipApprovalController.pushSelectedEntitiesBulk(entityDataList);
					}
					else if(onSelectFunction === "SkipApprovalREST"){//No I18N
						OPMClient.NCMSkipApprovalController.pushSelectedRESTEntitiesBulk(entityDataList);
					}
				}else{
					if(onSelectFunction === "SkipApprovalCLI"){//No I18N
						OPMClient.NCMSkipApprovalController.removeSelectedEntitiesBulk(entityDataList);
					}
					else if(onSelectFunction === "SkipApprovalREST"){//No I18N
						OPMClient.NCMSkipApprovalController.removeSelectedRESTEntitiesBulk(entityDataList);
					}
				}
			}
		},

		afterInsertRow: function(rowId, rowData, rowElem) {
			// rowElem[nnn] column number to compare with (remember Javascript starts indexes at 0, so rowElem[2] selects the 3rd column)
			// Adapt the if clause to other comparisions if needed
			if(onSelectFunction === "userList")
			{
				if (rowElem.USERNAME === "admin" || rowElem.USERNAME === window.OPM.userName) { //No I18N
					jQuery('tr#'+rowId+' td:last div:first div.ui-inline-del',jQuery(this)).hide();//No I18N
	  			}
   				return true;
			}
		},
		rowattr: function (rd) {

		},
		beforeSelectRow: function (rowid, e) {
		        i = $.jgrid.getCellIndex($(e.target).closest('td')[0]), //No I18N
		        cm = grid.jqGrid('getGridParam', 'colModel'); //No I18N
		        if(onSelectFunction == "ConfigsList" && cm[i].name == 'CompareActions') {
					var selVersion = grid.jqGrid('getCell', rowid, 'id'); //No I18N
					OPMClient.ChangesDetailsController.selVersion = selVersion;
				}
		    return (onSelectFunction != "DEDevices" || (cm[i].name != 'NCMOperationStateHolder__OPERATIONTYPE' && cm[i].name != 'NCMOperationStateHolder__OPERATIONSTATUS')) && //No I18N
            (onSelectFunction != "ConfigsList" || cm[i].name != 'CompareActions') && (onSelectFunction != 'DGroupGrid' || cm[i].name != 'Action')  && !disableRowSelect; //No I18N
		},
		onSelectRow: function(rowid,status,e) {

            rowSelArray = $(gridTable).jqGrid('getGridParam','selarrrow');

            if(onSelectFunction === "SkipApprovalCLI" || onSelectFunction === "SkipApprovalREST"){//No I18N

                if (defaultOptions !== undefined){
                  gridSelectedRows[gridTable]={};
                }

                if(status){
                    var isDataPushed = true;
                    var entityData = $(gridTable).jqGrid("getRowData",rowid);//No I18N
                    if(onSelectFunction === "SkipApprovalCLI"){//No I18N
                        isDataPushed = OPMClient.NCMSkipApprovalController.pushSelectedEntity(entityData);
                    }
                    else if(onSelectFunction === "SkipApprovalREST"){//No I18N
                        isDataPushed = OPMClient.NCMSkipApprovalController.pushSelectedRESTEntity(entityData);
                    }
                    if(isDataPushed){
                        gridSelectedRows[gridTable][rowid] = entityData;
                    }else{
                        $(gridTable).jqGrid('setSelection',rowid,false);//No I18N
                    }
                }else{
                    var entityData = $(gridTable).jqGrid("getRowData",rowid);//No I18N
                    if(onSelectFunction === "SkipApprovalCLI"){//No I18N
                        OPMClient.NCMSkipApprovalController.removeSelectedEntity(entityData);
                    }
                   else if(onSelectFunction === "SkipApprovalREST"){//No I18N
                     OPMClient.NCMSkipApprovalController.removeSelectedRESTEntity(entityData);
                      }
                    delete gridSelectedRows[gridTable][rowid];
                }

            }
			if(onSelectFunction === 'bulkRemediationTable'){
				OPMClient.NCMComplianceUtilController.selectGridCol(rowid, false, status);
			}
		},
		onCellSelect: function(id, col, content, event)
		{
			/*        FludicV2 NCM Changes Starts Here                                           */
			var colMod = jQuery(gridTable).jqGrid("getGridParam", "colModel");	//No I18N
			var rowMod = jQuery(gridTable).jqGrid("getGridParam", "data");	//No I18N
			switch(onSelectFunction)
			{
				case "DEConfigletsList"://No I18N
					OPMClient.SettingsNCMConfigController.configletId =grid.jqGrid('getCell', id, 'id');//No I18N
					var ownerName = grid.jqGrid('getCell', id, 'NCMTemplate__OWNER_NAME'); //No I18N
					var templateName = grid.jqGrid('getCell', id, 'NCMTemplate__TEMPLATE_NAME');//NO I18N
					// Cannot  execute flow Export configlet
					if(colMod[col].name ==='cb' || colMod[col].name ==='View' || (colMod[col].name == "action" && ownerName == 'system' && templateName.indexOf('FlowExport') != -1)) {
						return;
					}
					colMod[col].name == "action" ?'': location.href=location.href+'/Edit/'+OPMClient.SettingsNCMConfigController.configletId;
					break;
				case "DEHistoryList"://No I18N 
					if(colMod[col].name ==='cb') {
						return;
					} 
					else if(colMod[col].name == 'action')
					{
						return;
					}
					OPMClient.SettingsNCMConfigController.executionId = grid.jqGrid('getCell', id, 'id');//No I18N
					grid.expandSubGridRow(OPMClient.SettingsNCMConfigController.executionId); 
					break; 
				case "DETagsList":
					OPMClient.SettingsNCMConfigController.tagId=grid.jqGrid('getCell', id, 'id');
					if(colMod[col].name ==='cb' || colMod[col].name == 'action' || colMod[col].name == 'viewTag' || window.OPM.isNCMEE && (!window.OPM.isCentralServer || (window.OPM.isCentralServer && window.OPM.isProbeSelected))){
						return;
					}
					opm_transitionToTheRoute('Settings.NcmConfig.Tag.AllTags.Edit');
					break;
				case "DEDetailedExecList"://No I18N 
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					if(colMod[col].name == 'NCMBulkExecutionStatus__RESOURCENAME' || colMod[col].name == 'NCMOperationAudit__OPERATIONSTATUS' || colMod[col].name == 'NCMOperationAudit__MESSAGE' || colMod[col].name == 'NCMOperationAudit__EXECUTEDON' || colMod[col].name == 'NCMOperationAudit__DEVICE_RESPONSE') 
					{
						if(selId != null) { //No I18N
							var executionId = window.EXECUTION_ID;
							location.href=  window.apiclientUrl+"Settings/NcmConfig/ExecResult/"+executionId+"/ConfigletResult/"+executionId+"/"+selId;	//No I18N
						}
					}
					break;
				case "DEv2DetailedExecList"://No I18N 
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					if(colMod[col].name == 'action')
					{
						return;
					}
					var arr = gridTable.split('_');
					if(arr.length > 1) {
						OPMClient.SettingsNCMConfigController.executionId = arr[1];
					}
					if(selId != null) { //No I18N
						location.href = location.href + "/Details/"+OPMClient.SettingsNCMConfigController.executionId+"/"+selId; //No I18N
					}
					/*else */
					break; 	
				case "DEShowCommandsList"://No I18N
					OPMClient.SettingsNCMConfigController.commandId =grid.jqGrid('getCell', id, 'id');//No I18N
					 colMod[col].name == "NCMShowCommands__COMMAND_ALIAS" ? opm_transitionToTheRoute('Settings.NcmConfig.Admin.ShowCommands.Edit'):'';	//No I18N	
					 break;	
				case "DELabels"://No I18N
					OPMClient.SettingsNCMConfigController.labelId =grid.jqGrid('getCell', id, 'id');//No I18N
					 colMod[col].name == "NCMLabel__LABEL_NAME" ? opm_transitionToTheRoute('Settings.NcmConfig.DeviceMgmt.LabelManagement.Edit'):'';	//No I18N	
					 break;	
				case "DEReviewersList"://No I18N
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					 colMod[col].name == "Delete" ? OPMClient.Settings.NCMdeleteReview(selId):'';	//No I18N	
					 break;
				case "DECredProf"://No I18N
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					 colMod[col].name == "Actions" ? deleteNCMCredentials(selId):'';	//No I18N	
					 break;
				case "DECustomDevices": //No I18N
					if(colMod[col].name == "action") { //No I18N
						return;
					}
					break;
                case "FirmwareVulnerabilityDashBoard"://No I18N
                    setTimeout(function () {
                        OPMClient.NCMFirmwareVulnerability.redirectToCveDetails(grid.jqGrid('getCell', id, 'NCMFVVULNERABILITYDETAILS__CVEID'));//No I18N
                    },100);
                    break;
                case "FirmVulDeviceDashGrid"://No I18N
                    setTimeout(function () {
                        OPMClient.NCMFirmwareVulnerability.redirectToSnapshot(grid.jqGrid('getCell', id, 'id'));//No I18N
                    },100);
                    break;

                case "DEProConfigletsList"://No I18N
                	OPMClient.SettingsNCMConfigController.configletId =grid.jqGrid('getCell', id, 'id');//No I18N
                	if(colMod[col].name == "action" || colMod[col].name ==='cb') {
						return;
					}else{
                        if(window.OPM.isNCM && window.OPM.oldView) {
                            location.href = window.apiclientUrl+"NCMConfigAutomation/Configlets/ProConfigletsEdit"; //No I18N
                        } else {
							if(location.href.indexOf("NCMConfigAutomation") > -1){
	                            location.href = window.apiclientUrl+"NCMConfigAutomation/Configlets/ProConfigletsEdit"; //No I18N
							}else{
	                            location.href = window.OPM.apiclientUrl+ "Settings/NcmConfig/ProConfigletsEdit";
							}
                        }
					}
                	break;
                case "DENCMRegexList"://No I18N
                	if(colMod[col].name == "action" || colMod[col].name ==='cb') {
						return;
					}else{
						OPMClient.SettingsNCMConfigController.ncmregexId =grid.jqGrid('getCell', id, 'id');//No I18N
						location.href = location.href+"/Edit"; //No I18N
					}
					break;
                case "CommandTemplateList"://No I18N
                    if(colMod[col].name ==='cb' || colMod[col].name ==='Edit') {
                        return;
                    }
                    setTimeout(function () {
                        OPMClient.NCMComplianceTemplatesController.loadTemplateEdit(grid.jqGrid('getCell', id, 'id'));
                    },100);
                    break;
                case "ComplianceAdhocRuleResult"://No I18N
                    OPMClient.NCMComplianceListController.adhocResultDetails = {};
                    OPMClient.NCMComplianceListController.adhocResultDetails.ruleId = grid.jqGrid('getCell', id, 'id');
                    OPMClient.NCMComplianceListController.adhocResultDetails.resourceId = gridTable.replace('#ComplianceAdhocResultTable_','');
                    OPMClient.NCMComplianceListController.adhocResultDetails.resultId = defaultOptions.resultId;
                    location.href = location.href+"/Result"; //NO I18N
                    break;
			}
			if(colMod[col].name ==='cb'&& defaultOptions.showActionDiv)
			{
				var tableName = gridTable.replace("#",'');
				var chkId = "#jqg_"+tableName+"_"+id ;//No I18N 
				var isChecked = $(chkId).is(":checked");//No I18N 
				var anySelectedB4 = $(gridTable).jqGrid('getGridParam','selarrrow').length > 1; //No I18N 
				isChecked || anySelectedB4 ? $(".opmActionsIcons").slideDown(): $(".opmActionsIcons").slideUp() ;
				defaultOptions.showActionDiv ? $(".opmForm").addClass("opmFormType5") : '';
			}
			/*         FludicV2 NCM Changes Ends Here                           */
			
			
			
			//var colMod = grid.jqGrid("getGridParam", "colModel");	//No I18N

			var sortColumnName = grid.jqGrid('getGridParam','sortname'); //No I18N
//			alert(sortColumnName);
			var sortOrder = grid.jqGrid('getGridParam','sortorder'); //No I18N
			if(colMod[col].name == "cb") {
				return;
			}
//			alert(sortOrder);
			if (onSelectFunction === "DEDevices" )
			{
				if(colMod[col].name == 'NCMCredentialValidity__VALIDITY' && OPMClient.ApplicationController.isNCMOperator != true){
					var arr = new Array();
					var name = grid.jqGrid('getCell', id, 'id'); //No I18N
					arr.push(name);
					window.resourceIdsForCred = arr;
					location.href = window.apiclientUrl+"NCMSettings/AssociateCred"; //No I18N
				} else if(colMod[col].name == 'NCMOperationStateHolder__OPERATIONTYPE' || colMod[col].name == 'NCMOperationStateHolder__OPERATIONSTATUS'){
					return;
				} else if(colMod[col].name == 'NCMResourcesConfConflict__ISCONFLICT'){
					var selID = grid.jqGrid('getCell', id, 'id'); //No I18N
					var selConflict = grid.jqGrid('getCell', id, 'StartupRunningConflict'); //No I18N
					if(selConflict == true || selConflict == "true") {
						loadStartupRunningConflictPage(selID);
					}
				} else {
					var deviceIdList = grid.getCol('id',false,''); //No I18N
					
					// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table.
					var deviceIPList = grid.getCol('NCMResource__ADDRESS',false,''); //No I18N
					
					var selDevice = grid.jqGrid('getCell', id, 'id'); //No I18N
					
					// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table.
					var selIP = grid.jqGrid('getCell', id, 'NCMResource__ADDRESS');//NO I18N
					
					if ((deviceIdList !== null && deviceIdList !== "") && (deviceIPList !== null && deviceIPList !== ""))
					{
						window.DEDeviceListForNextPrev = deviceIdList; //No I18N
						window.DEDeviceIPListForNextPrev = deviceIPList; //No I18N
					}
					if (colMod[col].name == 'NCMResourceCompStatus__COMPLIANCE_STATUS')
					{
						location.href = window.apiclientUrl+"NCMInventory/DeviceDetails/"+selDevice+"/"+selIP+"/DevCompliances"; //No I18N
					} else if (colMod[col].name == 'Resources__RESOURCENAME')
					{
						goToDEDeviceSnapshotLink(selDevice,selIP);
					}
				}
            } else if(onSelectFunction === "DGroupGrid") { //No I18N
                var deviceAvailability = grid.jqGrid('getCell', id, 'ConflictStatus').toString().includes("</svg>");
                var selGroup = grid.jqGrid('getCell', id, 'id'); //No I18N
                var groupName = grid.jqGrid('getCell', id, 'NCMDeviceGroup__DEVICE_GROUP_NAME'); //No I18N
                if(deviceAvailability) {
                    switch(colMod[col].name) {
                        case "NCMDeviceGroup__DEVICE_GROUP_NAME": //No I18N
                        case "NCMDeviceGroup__DESCRIPTION": //No I18N
                        	OPMClient.InventoryDeviceDetailsController.selectedDeviceGroupPage = "Devices"; // No I18N
                            location.href= window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/DGroupGrid/DeviceGroupDetails/" + selGroup + "/" + encodeURIComponent(groupName) + "/Devices"; // No I18N
                        break;
                        case "ConflictStatus": //No I18N
                        	OPMClient.InventoryDeviceDetailsController.selectedDeviceGroupPage = "Report"; // No I18N
                        	OPMClient.NCMInventoryDGroupDetailsController.report="StartupRunning"; // No I18N
                            location.href= window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/DGroupGrid/DeviceGroupDetails/" + selGroup + "/" + encodeURIComponent(groupName) + "/Report/StartupRunning"; // No I18N
                        break;
                        case "ComplianceStatus": //No I18N
                        	OPMClient.InventoryDeviceDetailsController.selectedDeviceGroupPage = "Report"; // No I18N
                        	OPMClient.NCMInventoryDGroupDetailsController.report="Compliance"; // No I18N
                            location.href= window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/DGroupGrid/DeviceGroupDetails/" + selGroup + "/" + encodeURIComponent(groupName) + "/Report/Compliance"; // No I18N
                        break;
                        case "hiddenCol": //No I18N
                        	opm_infoMsgs('infoMsg', Ember.I18n.t('ncm.complianceiq.ee.restrict.msg1')); //No I18N
                        break;
                    }
                } else if(colMod[col].name != 'Action') {
                	opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.api.listdevices.notfound'));
                }
            }else if(onSelectFunction === "GroupDetailDevices") { //No I18N
				var ifNCMCentral = window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected;
                if(colMod[col].name === "NCMCredentialValidity__VALIDITY" && !ifNCMCentral) { //No I18N
                	if(window.OPM.isAuthorized) {
	                    OPMClient.InventoryDeviceDetailsController.RESOURCEID = [];
	                    OPMClient.InventoryDeviceDetailsController.RESOURCEID.push(grid.jqGrid('getCell', id, 'id')); //No I18N
	                    OPMClient.InventoryDeviceDetailsController.isGroup=false;
	                    location.href= window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/" + OPMClient.InventoryDeviceDetailsController.selectedView + "/DeviceGroupDetails/" + OPMClient.NCMInventoryDGroupDetailsController.dGroupId + "/" + encodeURIComponent(OPMClient.NCMInventoryDGroupDetailsController.dGroupName) + "/Devices/NCMCredentials"; // No I18N
                	} else {
                		OPMClient.InventoryDeviceDetailsController.RESOURCEID = grid.jqGrid('getCell', id, 'id'); //No I18N
                    	location.href= window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+OPMClient.InventoryDeviceDetailsController.RESOURCEID;
                	}
                } 
                else if(colMod[col].name != "Actions") {
        			OPMClient.InventoryDeviceDetailsController.RESOURCEID = grid.jqGrid('getCell', id, 'id'); //No I18N
        			location.href= window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+OPMClient.InventoryDeviceDetailsController.RESOURCEID;
        		} 
			} else if(onSelectFunction === "DECustomDevices") { //No I18N
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				openEditSliderForCustomDevice(selDevice);
			}else if ((onSelectFunction === "Drafts" || onSelectFunction === "Snap_Drafts") && colMod[col].name !== "cb") //No I18N
			{
				var deviceIdList = grid.getCol('id',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N

				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
//					devicesRowKeydown();
					$('#opm_Devices tr').removeClass('active');
					$("#"+id).addClass('active');
					var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
//					shortSummaryRowKeydownNew();opm_deviceShortSummaryView(selDevice);
					OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigDraft"; //No I18N
//					if(onSelectFunction === "Snap_Drafts") {
//						redirectToSnapshot("ConfigDraft",selDevice); //No I18N
//					}
//					else {
//						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
//						shortSummaryRowKeydownNew();
//						//opm_deviceShortSummaryView(selDevice, "ConfigDraft"); //No I18N
//						opmGlobalRoute.transitionTo('Inventory.List.ConfigMgmt.Sub.ShortSummary','Drafts',selDevice); //No I18N
//					}
					redirectToSnapshot("ConfigDraft",selDevice); //No I18N
				}
			} else if ((onSelectFunction === "Compliance" || onSelectFunction === "Snap_Compliance") && colMod[col].name !== "cb") //No I18N
			{
				var deviceIdList = grid.getCol('id',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N

				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
//					devicesRowKeydown();
					$('#opm_Devices tr').removeClass('active');
					$("#"+id).addClass('active');
					var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
//					shortSummaryRowKeydownNew();opm_deviceShortSummaryView(selDevice);
					OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigPolicy"; //No I18N
//					if(onSelectFunction === "Snap_Compliance") {
//						redirectToSnapshot("ConfigPolicy",selDevice); //No I18N
//					}
//					else {
//						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
//						shortSummaryRowKeydownNew();
//						//opm_deviceShortSummaryView(selDevice, "ConfigPolicy"); //No I18N
//						opmGlobalRoute.transitionTo('Inventory.List.ConfigMgmt.Sub.ShortSummary','Compliance',selDevice); //No I18N
//					}
					redirectToSnapshot("ConfigPolicy",selDevice); //No I18N
				}
			} else if ((onSelectFunction === "Changes" || onSelectFunction === "Snap_Changes") && colMod[col].name !== "cb" && colMod[col].name !== "EditAsDraft") //No I18N
			{
				var deviceIdList = grid.getCol('id',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N

				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
					$('#opm_Devices tr').removeClass('active');
					$("#"+id).addClass('active');
					OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigChange"; //No I18N
					setNCMEEProbeVars(selDevice);
					redirectToSnapshot("ConfigChange",selDevice); //No I18N
				}
			} else if ((onSelectFunction === "Configs" || onSelectFunction === "Snap_Configs") && colMod[col].name !== "cb" && colMod[col].name !== "EditAsDraft") //No I18N
			{
				var deviceIdList = grid.getCol('NCMConfigFile__FILE_ID',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'NCMConfigFile__FILE_ID'); //No I18N

				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
//					devicesRowKeydown();
					$('#opm_Devices tr').removeClass('active');
					$("#"+id).addClass('active');
//					var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
					OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigFile"; //No I18N
//					if(onSelectFunction === "Snap_Configs") {
//						redirectToSnapshot("ConfigFile",selDevice); //No I18N
//					}else {
//						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
//						shortSummaryRowKeydownNew();
//						//opm_deviceShortSummaryView(selDevice, "ConfigFile"); //No I18N
//						opmGlobalRoute.transitionTo('Inventory.List.ConfigMgmt.Sub.ShortSummary','Configs',selDevice); //No I18N
//					}
					redirectToSnapshot("ConfigFile",selDevice); //No I18N
				}
			} else if ((onSelectFunction === "DGroup") && colMod[col].name !== "cb") //No I18N
			{
				var deviceIdList = grid.getCol('id',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N

				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
//					devicesRowKeydown();
					$('#opm_Devices tr').removeClass('active');
					$("#"+id).addClass('active');
					var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
					OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigDGroup"; //No I18N
					redirectToSnapshot("ConfigDGroup",selDevice); //No I18N
				}
			} else if ((onSelectFunction === "Devices" || onSelectFunction === "Snap_Devices") && colMod[col].name !== "cb") //No I18N
			{
				var deviceIdList = grid.getCol('id',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
					var isNCMCentral = window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected;
					var isConflict = $(grid.jqGrid('getCell', id, 'STARTUP_CONFLICT')).attr('data-value');
					if(!isNCMCentral && colMod[col].name == 'CRED_VALIDITY' && OPMClient.ApplicationController.isNCMOperator != true){
						OPMClient.InventoryDeviceDetailsController.assoCredential = true;
						OPMClient.InventoryDeviceDetailsController.RESOURCEID = selDevice;
                        OPMClient.InventoryDeviceDetailsController.selDevice = selDevice;
                        if(onSelectFunction === "Snap_Devices") {
                        	redirectSnapShot('NCMCredentials');
                        } else {
						redirectList('ConfigMgmt', 'NCMCredentials'); //No I18N
                        }
						ncmusrsts1('credenital_icon');// No I18n
					} else if(!isNCMCentral && colMod[col].name == 'STARTUP_CONFLICT' && parseInt(isConflict) == 1){
						ncmusrsts1('inv_isconflict_diff_view');// No I18n
						OPMClient.InventoryDeviceDetailsController.RESOURCEID = selDevice;
						OPMClient.InventoryDeviceDetailsController.selDevice = selDevice;
						$.ajax({
							url: window.OPM.apiUrlPattern + '/ncmconfig/getStartupRunningVersion?RESOURCEID='+selDevice, //No I18N
							type: 'GET', //No I18N
							success: function(response) {
								if(response.isSuccess) {
									//OPMClient.InventoryNCMActionController.openDiffcompareToFromOPM(response.Startup, response.Running);
									OPMClient.InventoryNCMActionController.newConfigDiffLeftVersion = response.Startup;
									OPMClient.InventoryNCMActionController.newConfigDiffRightVersion = response.Running;
									OPMClient.InventoryNCMActionController.openConfigDiffNew();
								} else {
									opm_infoMsgs("errorMsg", response.statusMsg);  //No I18N
								}
							}
						});
					} else {
						$('#opm_Devices tr').removeClass('active');
						jQuery("#opm_Devices #"+id).addClass('active');//No I18N
						var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
//						shortSummaryRowKeydownNew();opm_deviceShortSummaryView(selDevice);
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigDevice"; //No I18N
//						if(onSelectFunction === "Snap_Devices") {
//							ncmusrsts1('snap_devices_to_snapshot');// No I18n
//							redirectToSnapshot("ConfigDevice",selDevice); //No I18N
//						}else {
//							ncmusrsts1('inv_device_shortsummary');// No I18n
//							window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
//							shortSummaryRowKeydownNew();
//							opmGlobalRoute.transitionTo('Inventory.List.ConfigMgmt.Sub.ShortSummary','Devices',selDevice); //No I18N
//							//opm_deviceShortSummaryView(selDevice, "ConfigDevice"); //No I18N
//						}
						
						if(!setNCMEEProbeVars(selDevice)){
							return;
						}
						redirectToSnapshot("ConfigDevice",selDevice); //No I18N
					}
				}
			}  
			else if(onSelectFunction === "UnmanagedDevices") {//No I18N
				var deviceIdList = grid.getCol('id',false,''); //No I18N
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				$('#opm_Devices tr').removeClass('active');
				jQuery("#opm_Devices #"+id).addClass('active');//No I18N
				OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigDevice"; //No I18N
				if(!setNCMEEProbeVars(selDevice)){
					return;
				}
				redirectToSnapshot("ConfigDevice",selDevice); //No I18N
			}
			else if ((onSelectFunction === "ResPolices") && colMod[col].name !== "cb") //No I18N
			{
				var deviceIdList = grid.getCol('id',false,''); //No I18N

				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N

				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				if (selDevice != null && selDevice != "")
				{
//					devicesRowKeydown();
					$('#opm_Devices tr').removeClass('active');
					$("#"+id).addClass('active');
					var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
                    try{
                        var countStr = grid.jqGrid('getCell', id, 'NCMResourcePolicyMap__CRITICAL_COUNT');
                        var sum = 0;
                        var matches = countStr.match(/>(\d+)/g);
                        if(matches) {
                            for(var i = 0; i < matches.length; i++) {
                                sum += Number(matches[i].slice(1));
                            }
                        }
                        if(sum > 0){
                            redirectToSnapshot("ConfigResCompliance",selDevice); //No I18N
                        }
                        else{
                            OPMClient.NCMComplianceUtilController.loadMsgAndClear('infoMsg',Ember.I18n.t('webclient.reports.view.nodata')); // NO I18N
                        }
                    }
                    catch(e){
                        redirectToSnapshot("ConfigResCompliance",selDevice); //No I18N
                    }
//					shortSummaryRowKeydownNew();opm_deviceShortSummaryView(selDevice);
					ncmusrsts1('config_res_compliance');

				}
			} else if(onSelectFunction === "DEAllGroups" ) {  //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name == 'Edit') {
					if (selId !== null && selId !== "" && selId != "1" && selId != 1)
					{
						openEditDeviceGroup(selId);
					}
				}
				else {
					if(colMod[col].name == 'ConflictStatus') {
						openConflictReportPage(selId);
					} else {
						var seldGroupName = grid.jqGrid('getCell', id, 'NCMDeviceGroup__DEVICE_GROUP_NAME'); //No I18N
						var selIdList = grid.getCol('id',false,''); //No I18N
						var selgroupNames = grid.getCol('NCMDeviceGroup__DEVICE_GROUP_NAME',false,''); //No I18N
						window.DEDGroupListForNextPrev = selIdList;
						window.DEDGroupNameListForNextPrev = selgroupNames;
						var compliance = false;
						if(colMod[col].name == 'ComplianceStatus') {
							compliance = true;
						}
						openDeviceGroupsnapshot(selId, seldGroupName, compliance);
					}
				}
			} else if(onSelectFunction === "DECompliances") {  //No I18N
				if(colMod[col].name == 'NCMCompliancePolicy__COMPPOLICY_NAME') {
					var selPolicy = grid.jqGrid('getCell', id, 'id'); //No I18N

					if (selPolicy !== null && selPolicy !== "")
					{
						OPMClient.InventoryDeviceDetailsController.selDevice=selPolicy;
						location.href = window.apiclientUrl+"Settings/NcmConfig/Compliance/Policy/Edit"; //No I18N
					}
				} else if(colMod[col].name == 'AssociateDevices') {
					var selPolicy = grid.jqGrid('getCell', id, 'id'); //No I18N
					if (selPolicy !== null && selPolicy !== "")
					{
						OPMClient.SettingsNCMConfigController.associatePolicyId=selPolicy;
						OPMClient.InventoryDeviceDetailsController.selDevice=selPolicy;
						OPMClient.SettingsNCMConfigController.flagNotifComp=false;
						location.href = window.apiclientUrl+"Settings/NcmConfig/Compliance/Policy/AssociateDevices"; //No I18N
					}
				} else {
					var policyIdList = grid.getCol('id',false,''); //No I18N
					var policyNameList = grid.getCol('NCMCompliancePolicy__COMPPOLICY_NAME',false,''); //No I18N
					var selPolicy = grid.jqGrid('getCell', id, 'id'); //No I18N
					var policyName = grid.jqGrid('getCell', id, 'NCMCompliancePolicy__COMPPOLICY_NAME');//NO I18N
					if ((policyIdList !== null && policyIdList !== "") && (policyNameList !== null && policyNameList !== ""))
					{
						window.DECompliancesForNextPrev = policyIdList; //No I18N
						window.DEpolicyNamesForNextPrev = policyNameList; //No I18N
					}
					if ((selPolicy !== null && selPolicy !== "") && (policyName !==null && policyName !==""))
					{
//						goToDEComplianceDetailsLink(selPolicy,policyName);
					}
				}
			} else if(onSelectFunction === "DEResourcePolicies") {  //No I18N
				var resourcePolicyList = grid.getCol('id',false,''); //No I18N
				var selResPolicyId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if (resourcePolicyList !== null && resourcePolicyList !== "")
				{
					window.DEResourcePolicyListForNextPrev = resourcePolicyList;
				}
				var severity = "All"; // No I18N
				if(colMod[col].name == "NCMResourcePolicyMap__CRITICAL_COUNT") {
					severity = "Critical"; // No I18N
				} else if(colMod[col].name == "NCMResourcePolicyMap__MAJOR_COUNT") {
					severity = "Major"; // No I18N
				} else if(colMod[col].name == "NCMResourcePolicyMap__WARNING_COUNT") {
					severity = "Warning"; // No I18N
				}

				if (selResPolicyId !== null && selResPolicyId !== "")
				{
					if(colMod[col].name == "NCMResourcePolicyMap__SUCCESS_COUNT") {
						goToCompliantRules(selResPolicyId);
					}  else {
						goToRuleCompliances(selResPolicyId, severity);
					}
				}
			} else if(onSelectFunction == "DEAllHistory") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(selId != null) { //No I18N
					openDetailedExecResult(selId);
				}
			} else if(onSelectFunction == "resourceViolations") { //No I18N
				if(colMod[col].name == "RemediationTemplate") {
					var templateId = grid.jqGrid('getCell', id, 'NCMComplianceRule__REMEDIATION_TEMPLATE_ID'); //No I18N
					var resId = grid.jqGrid('getCell', id, 'NCMResourcePolicyMap__RESOURCEID'); //No I18N
					var deviceArr = new Array();
					deviceArr.push(resId);
					OPMClient.SettingsNCMConfigController.configletId=templateId;
					OPMClient.SettingsNCMConfigController.promotedRemediationDeviceList = deviceArr;
					if(templateId != null && opm_validateNumberVal(templateId) && templateId > 0) {
						redirectSnapShot("ExecuteConfiglet"); //No I18N
					} else {
						var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
						OPMClient.InventoryDeviceDetailsController.compRuleId=selId;
						var resourceId = grid.jqGrid('getCell', id, 'NCMResourcePolicyMap__RESOURCEID'); //No I18N
						OPMClient.InventoryDeviceDetailsController.RESOURCEID=resourceId;
						OPMClient.InventoryDeviceDetailsController.isCompValidation=false;
						redirectSnapShot("NCMRuleSummarySlide"); //No I18N
					}
				} else {
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.InventoryDeviceDetailsController.compRuleId=selId;
					var resourceId = grid.jqGrid('getCell', id, 'NCMResourcePolicyMap__RESOURCEID'); //No I18N
					OPMClient.InventoryDeviceDetailsController.RESOURCEID=resourceId;
					OPMClient.InventoryDeviceDetailsController.isCompValidation=false;
					redirectSnapShot("NCMRuleSummarySlide"); //No I18N
				}
			} else if(onSelectFunction == "PolicyRules") { //No I18N
				var templateId = grid.jqGrid('getCell', id, 'templateId'); //No I18N
				var deviceArr = new Array();
				deviceArr.push(OPMClient.InventoryDeviceDetailsController.selDevice);
				OPMClient.SettingsNCMConfigController.configletId=templateId;
				OPMClient.SettingsNCMConfigController.promotedRemediationDeviceList = undefined;
				if(templateId != null && opm_validateNumberVal(templateId)) {
					redirectSnapShot("ExecuteConfiglet"); //No I18N
				}
			} else if(onSelectFunction === "ConfigsList") {  //No I18N
				var selVersion = grid.jqGrid('getCell', id, 'id'); //No I18N
				var fileType =  grid.jqGrid('getCell', id, 'NCMConfigFile__FILE_TYPE'); //No I18N
				var selHostName = grid.jqGrid('getCell', id, 'Resources__RESOURCENAME'); //No I18N
				var fileId =  grid.jqGrid('getCell', id, 'NCMConfigFile__FILE_ID'); //No I18N
				if(colMod[col].name == "CompareActions") {
					OPMClient.ChangesDetailsController.selVersion = selVersion;
				} else {
					populateCompareView(selVersion, fileType, selHostName, fileId);
				}
			}  else if(onSelectFunction === "DEDiscoveryStatus") {  //No I18N
				var selTaskId = grid.jqGrid('getCell', id, 'id'); //No I18N
				var taskIdList = grid.getCol('id',false,''); //No I18N
				if ((taskIdList !== null && taskIdList !== ""))
				{
					window.DEDiscoveryTasksForNextPrev = taskIdList; //No I18N
				}
				if(selTaskId != null) {
					location.href = window.apiclientUrl+"NCMSettings/Discovery/"+selTaskId; //No I18N
				}
			}	else if(onSelectFunction === "DEDiscoveryStat") {  //No I18N
				var selTaskId = grid.jqGrid('getCell', id, 'id'); //No I18N

				if(selTaskId != null) {
					OPMClient.SettingsTabController.profileId = selTaskId;
					location.href = window.apiclientUrl+"Settings/Discovery/NCMDiscovery/"+OPMClient.NCMDiscoverySettingsController.selectedTab+"/Progress/"+OPMClient.SettingsTabController.profileId; //No I18N
				}
			}	else if(onSelectFunction === "OverviewBackups") {  //No I18N
				var deviceIdList = grid.getCol('Resources__RESOURCEID',false,''); //No I18N
				var deviceIPList = grid.getCol('Resources__RESOURCENAME',false,''); //No I18N
				var selDevice = grid.jqGrid('getCell', id, 'Resources__RESOURCEID'); //No I18N
				var selIP = grid.jqGrid('getCell', id, 'Resources__RESOURCENAME');//NO I18N
				if ((deviceIdList !== null && deviceIdList !== "") && (deviceIPList !== null && deviceIPList !== ""))
				{
					window.DEDeviceListForNextPrev = removeDuplicates(deviceIdList); //No I18N
					window.DEDeviceIPListForNextPrev = removeDuplicates(deviceIPList); //No I18N
				}
				if ((selDevice !== null && selDevice !== "") && (selIP !==null && selIP !==""))
				{
					goToDEDeviceSnapshotLink(selDevice,selIP);
				}
			}  else if(onSelectFunction === "DEAllConfigFile") {  //No I18N
				var selVersion = grid.jqGrid('getCell', id, 'id'); //No I18N
				var selHostName = grid.jqGrid('getCell', id, 'Resources__RESOURCENAME'); //No I18N

				var versionList = grid.getCol('id',false,''); //No I18N
				var hostList = grid.getCol('Resources__RESOURCENAME', false, ''); //No I18N
				var versionNoList = grid.getCol('NCMVersion__VERSION_NO', false, ''); //No I18N
				var changedByList = grid.getCol('NCMVersion__CHANGED_BY', false, ''); //No I18N
				var fileTypeList = grid.getCol('NCMConfigFile__FILE_TYPE', false, ''); //No I18N

				if ((versionList !== null && versionList !== "") && (hostList !== null && hostList !== ""))
				{
					for (var i = 0; i < versionNoList.length; i++) {
						var version = versionNoList[i];
						if(version.indexOf("Version") != -1) {
							version = version.substring(version.indexOf("Version")); //No I18N
						}
						versionNoList[i] = version;
					}
					window.DEConfigFileListForNextPrev = versionList; //No I18N
					window.DEConfigFileHostListForNextPrev = hostList; //No I18N
					window.DEConfigFileversionNoListForNextPrev = versionNoList; //No I18N
					window.DEConfigFilechangedByListForNextPrev = changedByList; //No I18N
					window.DEConfigFilefileTypeListForNextPrev = fileTypeList; //No I18N
				}
				if ((selVersion !== null && selVersion !== "") && (selHostName !==null && selHostName !==""))
				{
					populateConfigFileView(selVersion, selHostName);
				}
			} else if(onSelectFunction === "DEAllRuleGroups") {  //No I18N
				var selGroupId = grid.jqGrid('getCell', id, 'id'); //No I18N
				
				if(selGroupId != null) {
					if(colMod[col].name ==  'NCMCompRuleGroup__COMPRULEGROUP_NAME') { //No I18N
					OPMClient.SettingsNCMConfigController.addGroupId=selGroupId;
					location.href = window.apiclientUrl+"Settings/NcmConfig/Compliance/RuleGroup/Add"; //No I18N
					} else if(colMod[col].name ==  'ASSOCIATE') {
						OPMClient.SettingsNCMConfigController.ruleGroupId = selGroupId;
						location.href = window.OPM.apiclientUrl+'Settings/NcmConfig/Compliance/RuleGroup/Association'; //No I18N
				}
				}
			}   else if(onSelectFunction == "DENCMSSHKeyList") { //No I18N
				var selSSHKeyId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name ==  'ReferredDevices') {
					OPMClient.SettingsNCMConfigController.sshKeyId = selSSHKeyId;
					if(!location.href.endsWith("/ReferredDevices")) {
						location.href = location.href + '/ReferredDevices';
					}
				}
			} 
			else if(onSelectFunction == "DECredProf") { //No I18N
				var selCredId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if((colMod[col].name ==  'Edit' ||colMod[col].name === 'NCMSharedProfile__PROFILENAME' || colMod[col].name === 'NCMSharedProfile__DESCRIPTION') && window.OPM.userPermissions.ncmConfigAutomationWrite) {
					OPMClient.SettingsAddEditController.ncmCredId = selCredId;
					if(!location.href.endsWith("/Edit")) {
						location.href = location.href + '/Edit';
					}
				} else if(colMod[col].name ==  'ReferredDevices') {
					OPMClient.SettingsTabController.ncmCredProfileId = selCredId;
					if(!location.href.endsWith("/ReferredDevices")) {
						location.href = location.href + '/ReferredDevices';
					}
				}
			} else if(onSelectFunction == "DEAllConfiglets") { //No I18N
				var selConfigletId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name ==  'NCMTemplate__TEMPLATE_NAME' || colMod[col].name ==  'action') {
//					var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/checkFlowConfiglet?TEMPLATE_ID='+selConfigletId; //No I18N
//					$.ajax({
//						url: ajaxRequestUrl,
//						type: 'GET',//No I18N
//						dataType: 'json',//No I18N
//						success: function(jsonData, status) {
//							if(jsonData.FLOW_CONFIGET != true && jsonData.FLOW_CONFIGET != 'true') {
								if(selConfigletId != null && colMod[col].name ==  'NCMTemplate__TEMPLATE_NAME') {
									openEditConfigletPage(selConfigletId);
								} else if(selConfigletId != null && colMod[col].name ==  'action'){
									openExecuteConfigletsPage(selConfigletId);
								}
//							} else {
//								opm_infoMsgs("errorMsg", Ember.I18n.t("jsp.common.ConfigletsAlertMsg1",this));// No I18N
//							}
//						}
//					});
				}
			}else if(onSelectFunction == "DEConfigletGroupList") { //No I18N
				var selConfigletId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name ==  'NCMConfigletGroup__CONFIGLETGROUP_NAME') {
					var selConfigletValue = grid.jqGrid('getCell', id,'NCMConfigletGroup__CONFIGLETGROUP_NAME'); //No I18N
					if(selConfigletId != null) {
						if(selConfigletValue != null && !selConfigletValue.endsWith('_noc')){
							OPMClient.NCMConfigAutomationModel.configletGroupId = selConfigletId;
							location.href = location.href+"/Edit";
						}else{
							opm_infoMsgs("infoMsg", Ember.I18n.t("ncm.configletgroup.edit.restrictInProbe",this));// No I18N
						}
					}
				}else if(colMod[col].name == 'CONFIGLET_COUNT'){
					var count = grid.jqGrid('getCell', id,'CONFIGLET_COUNT');
					var val = $(count).text();
					if(val > 0){
						grid.expandSubGridRow(id);
					}
				}
			}    else if(onSelectFunction == "DEShowCommands") { //No I18N
				
				var selcmdId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(selcmdId != null && colMod[col].name ==  'NCMShowCommands__COMMAND_ALIAS') { //No I18N
					OPMClient.SettingsNCMConfigController.commandId=selcmdId;
					location.href = window.apiclientUrl+"Settings/NcmConfig/DeviceMgmt/ShowCommands/Add"; //No I18N

					//openEditShowCommandsPage(selcmdId);
				}
			} else if(onSelectFunction == "DELabels") { //No I18N
				var selcmdId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name ==  'Edit') { //No I18N
					openEditLabelsPage(selcmdId);
				} else if(colMod[col].name ==  'AssociatedConfiguration') { //No I18N
					var labelsList = grid.getCol('id', false, ''); //No I18N
					if (labelsList !== null && labelsList !== "")
					{
						window.DEAssoConfigsLabelsList = labelsList; //No I18N
					}
					var labelsNameList = grid.getCol('NCMLabel__LABEL_NAME', false, ''); //No I18N
					if (labelsNameList !== null && labelsNameList !== "")
					{
						window.DEAssoConfigsLabelNamesList = labelsNameList; //No I18N
					}
					//openAssociatedConfigsPage(selcmdId);
					location.href = window.apiclientUrl+"Settings/NcmConfig/"+selcmdId+"/AssociatedConfigs"; //No I18N

				}
			} 
			else if(onSelectFunction == "DENotificationsv2") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name !=  'NCMClientStatusCMR__STATUS' && colMod[col].name != 'DISASSOCIATE' && colMod[col].name != 'ASSOCIATE') { //No I18N
					OPMClient.SettingsNCMConfigController.notifId=selId;
					if(window.OPM.currentView.name.indexOf("Inventory.Device") == -1) {
						if(window.OPM.isNCM) {
							location.href = window.apiclientUrl+"NCMConfigAutomation/NCMChangeManagement/Notification/Add"; //No I18N
						} else {
							location.href = window.apiclientUrl+"Settings/NcmConfig/Notification/Add"; //No I18N
						}
					} /*else {
						redirectSnapShot("NCMAddNotificationSlide"); //No I18N
					}*/
				} else if(colMod[col].name ==  'DISASSOCIATE') { //No I18N
					if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "ConfigDGroup") {
						disAssociateNotification(OPMClient.InventoryDeviceDetailsController.deviceName, selId, true);
					} else {
						disAssociateNotification(OPMClient.InventoryDeviceDetailsController.selDevice, selId, false);
					}
				}
			} else if(onSelectFunction == "DENotifications") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name !=  'NCMClientStatusCMR__STATUS' && colMod[col].name != 'DISASSOCIATE' && colMod[col].name != 'ASSOCIATE') { //No I18N
					//openEditNotficationsPage(selId);
					OPMClient.SettingsNCMConfigController.notifId=selId;
					if(OPMClient.ApplicationController.isNCM) {
						location.href = window.apiclientUrl+"NCMConfigAutomation/NCMChangeManagement/Notification/Add"; //No I18N
					} 
					else {
						location.href = window.apiclientUrl+"Settings/NcmConfig/Notification/Add"; //No I18N
					}
					
				} else if(colMod[col].name ==  'ASSOCIATE') { //No I18N
					OPMClient.SettingsNCMConfigController.flagNotifComp=true;
					//openNotifAssociateDeviceView(selId);
					OPMClient.SettingsNCMConfigController.notifId=selId;
					
					if(OPMClient.ApplicationController.isNCM) {
						location.href = window.apiclientUrl+"NCMConfigAutomation/NCMChangeManagement/Notification/Associate"; //No I18N
					} 
					else {
						location.href = window.apiclientUrl+"Settings/NcmConfig/Notification/Associate"; //No I18N
					}
					
				}  else if(colMod[col].name ==  'DISASSOCIATE') { //No I18N
					disAssociateNotification(OPMClient.NCMInventoryDeviceDetailsController.selDevice, selId, false);
				}
                    }
			  else if(onSelectFunction == "DEAllSchedules") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(selId != null && colMod[col].name ==  'Schedule__SCHEDULE_NAME') { //No I18N
					//openEditSchedulePage(selId);
					OPMClient.SettingsNCMConfigController.scheduleId=selId;
					if(window.OPM.currentView.name.indexOf('Settings.NcmConfig.PCI.PCISchedules.index')!= -1){
						location.href = location.href + "/Add"; //No I18N
					}else{
						location.href = location.href + "/Edit/"+selId; //No I18N
					}

				}
			}  else if(onSelectFunction == "DEBackupSched") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(selId != null && colMod[col].name ==  'Schedule__SCHEDULE_NAME') { //No I18N
					openEditSchedulePage(selId);
				}
			} else if(onSelectFunction == "DEAllRules") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(selId != null) {
					if(colMod[col].name ==  'NCMComplianceRule__COMPRULE_NAME') { //No I18N
					//openEditRulePage(selId);
					OPMClient.SettingsNCMConfigController.ruleId=selId;
					location.href = window.apiclientUrl+"Settings/NcmConfig/Compliance/Rule/Add"; //No I18N
					} else if(colMod[col].name ==  'ASSOCIATE') {
						OPMClient.SettingsNCMConfigController.ruleId = selId;
						location.href = window.OPM.apiclientUrl+'Settings/NcmConfig/Compliance/Rule/Association'; //No I18N
					}
				}
			} else if(onSelectFunction == "DEScheduleAudit") { //No I18N
				var taskType = grid.jqGrid('getCell', id, 'NCMSchedule__TASK_TYPE');//NO I18N
				if(taskType == "Device Discovery") { //NO I18N
					return;
				}
				if(window.OPM.isMSPCentral && window.OPM.isProbeSelected) {
					return;
				}
				var cellValue = grid.jqGrid('getCell', id, 'ExecutionResult');//NO I18N
				if(cellValue.indexOf("BULK_EXECUTION_ID") != -1) {
					// Same gate as the ExecResult route - without it the redirect lands on an unregistered route.
					if(!(window.OPM.userPermissions.ncmConfigAutomationConfigletsRead || window.OPM.userPermissions.operatorAccess)) {
						return;
					}
					location.href = window.apiclientUrl+"Settings/NcmConfig/ExecResult/"+cellValue.substring(cellValue.indexOf('=')+1); //No I18N
				} else if(cellValue.indexOf("BULK_REVIEW_ID") != -1) {
					location.href = window.apiclientUrl+"Settings/NcmConfig/PCIReview/"+cellValue.substring(cellValue.indexOf('=')+1); //No I18N
				} else if(cellValue.indexOf("NIPPER_EXECUTIONID") != -1) {
					location.href = location.href + '/SecurityAudits/'+cellValue.substring(cellValue.indexOf('=')+1); //No I18N
				} else {
					var runningStatus = grid.jqGrid('getCell', id, 'SCHEDULE_RUNNING_STATUS');//NO I18N
					if(runningStatus == 'COMPLETED') {
						window.open(cellValue);
					}
				}
			} else if(onSelectFunction == "SecurityAudits") { //No I18N
				var cellValue = grid.jqGrid('getCell', id, 'File_Url');//NO I18N
				var statusVal = grid.jqGrid('getCell', id, 'ExecutionStatus');//NO I18N
				if(statusVal == 'FAILURE') {
					opm_infoMsgs("errorMsg", cellValue); //No i18n
				} else {
					window.open(cellValue);
				}
			}
			else if(onSelectFunction == "DEExcludeCriteria") { //No I18N
				if(colMod[col].name !='cb') {
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					//editExcludeCriteria(selId);
					OPMClient.SettingsNCMConfigController.criteriaId=selId;
					if(window.OPM.isNCM || window.OPM.isNCMEE){
						location.href = window.apiclientUrl+"NCMConfigAutomation/ExcludeCriteria/Line/Add"; //No I18N
					}else{
						location.href = window.apiclientUrl+"Settings/NcmConfig/ExcludeCriteria/Line/Add"; //No I18N
					}
				}
			}
			else if(onSelectFunction == "DEBlockExcludeCriteria") { //No I18N
				if(colMod[col].name !='cb') {
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					//editExcludeCriteria(selId);
					OPMClient.SettingsNCMConfigController.criteriaId=selId;
					if(window.OPM.isNCM || window.OPM.isNCMEE){
						location.href = window.apiclientUrl+"NCMConfigAutomation/ExcludeCriteria/Block/Add"; //No I18N
					}else{
						location.href = window.apiclientUrl+"Settings/NcmConfig/ExcludeCriteria/Block/Add"; //No I18N
					}
				}
			} 
//			else if(onSelectFunction == "DEDetailedExecList") { //No I18N
//				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
//				var deviceIdList = grid.getCol('id', false, ''); //No I18N
//				if (deviceIdList !== null && deviceIdList !== "")
//				{
//					window.DEExecResultDeviceIds = deviceIdList; //No I18N
//				}
//				if(selId != null) { //No I18N
//					//showDetailedResultView(selId);
//					var executionId = window.EXECUTION_ID;
//					location.href = window.apiclientUrl+"Settings/NcmConfig/ExecResult/"+executionId+"/ConfigletResult/"+executionId+"/"+selId; //No I18N
//				}
//			}  
			else if(onSelectFunction == "DEReviewers") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				if(colMod[col].name ==  'Delete') {
					deleteReviewer(selId);
				}
			} else if(onSelectFunction == "DEAllPCIReviews") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				location.href = window.apiclientUrl+"Settings/NcmConfig/PCIReview/"+selId; //No I18N
			} else if(onSelectFunction == "DEPCIReviews") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				location.href = window.apiclientUrl+"Settings/NcmConfig/MyPCIReview/"+selId; //No I18N

			} else if(onSelectFunction == "DEMyPCIReviewDetails" || onSelectFunction == "DEPCIReviewDetails") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				var selHost = grid.jqGrid('getCell', id, 'NCMBulkPCIReviewStatus__RESOURCENAME'); //No I18N
				/*if(colMod[col].name ==  'NCMBulkPCIReviewStatus__RESOURCENAME') {

					location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+selId;//No I18N

					//location.href = window.apiclientUrl+"NCMInventory/DeviceDetails/"+selId+"/"+encodeURIComponent(selHost)+"/DevConfigFiles"; //No I18N
				} else */if(colMod[col].name ==  'ViewConfiguration') {
					//location.href = window.apiclientUrl+"NCMInventory/DeviceDetails/"+selId+"/"+encodeURIComponent(selHost)+"/DevConfigFiles"; //No I18N
					 location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+selId;//No I18N
				} else if(colMod[col].name ==  'Review') {
					var status = grid.jqGrid('getCell', id, 'NCMBulkPCIReviewStatus__STATUS')+""; //No I18N
					if(status.indexOf('PENDING') != -1) {
						var data = {

						};
						data.REVIEW_ID = OPMClient.SettingsNCMConfigController.reviewId;
						data.RESOURCEID = selId;
						data.REVIEW_COMMENTS = Ember.I18n.t("jsp.common.ReviewCompleted",this); // No I18N
						reviewPCIUpdate(data, true);
					}
				} else {
					//location.href = window.apiclientUrl+"Settings/NcmConfig/PCIReview/"+OPMClient.SettingsNCMConfigController.reviewId+"/ReviewPCI/"+OPMClient.SettingsNCMConfigController.reviewId+"/"+selId; //No I18N
					 if(onSelectFunction == "DEPCIReviewDetails")
						 {
						 location.href = window.apiclientUrl+"Settings/NcmConfig/PCIReview/"+OPMClient.SettingsNCMConfigController.reviewId+"/"+selId; //No I18N
						 }
					 else
						 {
						 location.href = window.apiclientUrl+"Settings/NcmConfig/MyPCIReview/"+OPMClient.SettingsNCMConfigController.reviewId+"/"+selId; //No I18N
						 }
				}
			} /*else if(onSelectFunction == "DEScheduleAudit") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				var scheduleId = grid.jqGrid('getCell', id, 'ScheduleId'); //No I18N
				if(colMod[col].name ==  'Schedule_Audit__SCHEDULE_NAME') {
					location.href = window.apiclientUrl+"NCMSettings/Schedule/"+scheduleId; //No I18N
				}
			}*/ else if(onSelectFunction == "DEEOLNAList") { //No I18N
				if(colMod[col].name == 'NCMDeviceNotEOL__EOLOPERATIONSTATUS') {
					var RESOURCEID = grid.jqGrid('getCell', id, 'id'); //No I18N
					var DISPLAYTYPE = grid.jqGrid('getCell', id, 'NCMPersonality__DISPLAYNAME'); //No I18N
					var MODEL = grid.jqGrid('getCell', id, 'NCMResource__MODEL'); //No I18N
					var SERIES = grid.jqGrid('getCell', id, 'NCMResource__SERIES'); //No I18N
					markEOL(RESOURCEID, DISPLAYTYPE, MODEL, SERIES);
				}
			} else if(onSelectFunction == "DEConfigletsPromote") { //No I18N
				if(colMod[col].name == 'action') {
					var templateId = grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.Settings.NCMDemoteConfiglets(OPMClient.SettingsNCMConfigController.CONFIGLET_ID, templateId);
				}
			} else if(onSelectFunction == "DEConfigletsFlowExport") { //No I18N
				if(colMod[col].name == 'action') {
					var templateId = grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.Settings.NCMRemoveFlowConfiglets(OPMClient.SettingsNCMConfigController.CONFIGLET_ID, templateId);
				}
			}  else if(onSelectFunction == "DEBackedUpList" || onSelectFunction == "DENotBackedUpList" || onSelectFunction == "DEPCIReviewed" || onSelectFunction == "DEPCIPending" || onSelectFunction == "DEPCINAList") { //No I18N
//				if(colMod[col].name == 'NCMCredentialValidity__VALIDITY'){
//					var arr = new Array();
//					var name = grid.jqGrid('getCell', id, 'id'); //No I18N
//					arr.push(name);
//					window.resourceIdsForCred = arr;
//					location.href = window.apiclientUrl+"NCMSettings/AssociateCred"; //No I18N
//				} else if(colMod[col].name != 'NCMClientOperationStatus__DISPLAYNAME'){
//					var deviceIdList = grid.getCol('id',false,''); //No I18N
//					var deviceIPList = grid.getCol('IPv4Address__ADDRESS',false,''); //No I18N
//					var selDevice = grid.jqGrid('getCell', id, 'id'); //No I18N
//					var selIP = grid.jqGrid('getCell', id, 'IPv4Address__ADDRESS');//NO I18N
//					if ((deviceIdList !== null && deviceIdList !== "") && (deviceIPList !== null && deviceIPList !== ""))
//					{
//						window.DEDeviceListForNextPrev = deviceIdList; //No I18N
//						window.DEDeviceIPListForNextPrev = deviceIPList; //No I18N
//					}
//					if ((selDevice !== null && selDevice !== "") && (selIP !==null && selIP !==""))
//					{
//						goToDEDeviceSnapshotLink(selDevice,selIP);
//					}
//				}
			}  else if(onSelectFunction == "DEConflict" || onSelectFunction == "DEConflictNA" || onSelectFunction == "DENoConflict") { //No I18N
				if(colMod[col].name == 'ShowConfilct'){
					var selID = grid.jqGrid('getCell', id, 'id'); //No I18N
					loadStartupRunningConflictPage(selID);
				} 
//				else if(colMod[col].name == 'NCMCredentialValidity__VALIDITY'){
//					var arr = new Array();
//					var name = grid.jqGrid('getCell', id, 'id'); //No I18N
//					arr.push(name);
//					window.resourceIdsForCred = arr;
//					location.href = window.apiclientUrl+"NCMSettings/AssociateCred"; //No I18N
//				} else if(colMod[col].name != 'NCMClientOperationStatus__DISPLAYNAME' && colMod[col].name != 'ShowConfilct'){
//					var deviceIdList = grid.getCol('id',false,''); //No I18N
//					var deviceIPList = grid.getCol('IPv4Address__ADDRESS',false,''); //No I18N
//					var selDevice = grid.jqGrid('getCell', id, 'id'); //No I18N
//					var selIP = grid.jqGrid('getCell', id, 'IPv4Address__ADDRESS');//NO I18N
//					if ((deviceIdList !== null && deviceIdList !== "") && (deviceIPList !== null && deviceIPList !== ""))
//					{
//						window.DEDeviceListForNextPrev = deviceIdList; //No I18N
//						window.DEDeviceIPListForNextPrev = deviceIPList; //No I18N
//					}
//					if ((selDevice !== null && selDevice !== "") && (selIP !==null && selIP !==""))
//					{
//						goToDEDeviceSnapshotLink(selDevice,selIP);
//					}
//				}
			} else if(onSelectFunction == "DECmpCompliant" || onSelectFunction == "DECmpNA" || onSelectFunction == "DECmpViolation") { //No I18N
//				if(colMod[col].name == 'Resources__RESOURCENAME'){
//					var deviceIdList = grid.getCol('id',false,''); //No I18N
//					var deviceIPList = grid.getCol('Resources__RESOURCENAME',false,''); //No I18N
//					var selDevice = grid.jqGrid('getCell', id, 'id'); //No I18N
//					var selIP = grid.jqGrid('getCell', id, 'Resources__RESOURCENAME');//NO I18N
//					if ((deviceIdList !== null && deviceIdList !== "") && (deviceIPList !== null && deviceIPList !== ""))
//					{
//						window.DEDeviceListForNextPrev = deviceIdList; //No I18N
//						window.DEDeviceIPListForNextPrev = deviceIPList; //No I18N
//					}
//					if ((selDevice !== null && selDevice !== "") && (selIP !==null && selIP !==""))
//					{
//						goToDEDeviceCompliance(selDevice,selIP);
//					}
//				}
			} else if(onSelectFunction == "DEPendingRequest") { //No I18N
			    if(colMod[col].name == 'delete'){
                			          return;
                }
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
				var annotation = grid.jqGrid('getCell', id, 'NCMApprovalRequest__ANNOTATION'); //No I18N
				var selIdList = grid.getCol('id',false,''); //No I18N
				OPMClient.SettingsNCMConfigController.reqId=selId;
				OPMClient.SettingsNCMConfigController.pendingRequestAnnotation=annotation;
				if(OPMClient.ApplicationController.isNCM) {
					location.href = window.apiclientUrl+"NCMConfigAutomation/UploadRequests/PendingRequests/"+selId; //No I18N
				}
				else {
				    location.href = window.apiclientUrl+"Settings/NcmConfig/UploadRequests/Pending/"+selId; //No I18N
				}
			} else if(onSelectFunction == "DEExecutableRequest") { //No I18N
			    if(colMod[col].name == 'delete'){
			          return;
			    }
				var selId = grid.jqGrid('getCell', id, 'request_id'); //No I18N
				var approvedId = grid.jqGrid('getCell', id, 'id'); //No I18N
				OPMClient.SettingsNCMConfigController.reqId=selId;
				OPMClient.SettingsNCMConfigController.approvedId=approvedId;
				if(OPMClient.ApplicationController.isNCM) {
					location.href = window.apiclientUrl+"NCMConfigAutomation/UploadRequests/ExecutableRequests/"+selId; //No I18N
				}
				else {
				location.href = window.apiclientUrl+"Settings/NcmConfig/UploadRequests/Executable/"+selId; //No I18N
				}
			} else if(onSelectFunction == "DEApprovedRequest" || onSelectFunction == "DERejectedRequest") { //No I18N
                var selId = grid.jqGrid('getCell', id, 'reqId'); //No I18N
                var annotation = grid.jqGrid('getCell', id, 'NCMApprovalRequestAudit__APPROVAL_ANNOTATION'); //No I18N

                var requestPage = (onSelectFunction == "DEApprovedRequest" ? "ApprovedRequests" : "RejectedRequests"); //No I18N
                if(!window.OPM.isNCM) {
                    requestPage = (onSelectFunction == "DEApprovedRequest" ? "Approved" : "Rejected"); //No I18N
                }
                OPMClient.SettingsNCMConfigController.reqId = selId;
                OPMClient.SettingsNCMConfigController.approvalRequestAnnotation = annotation;
                if(OPMClient.ApplicationController.isNCM) {
                    location.href = window.apiclientUrl+"NCMConfigAutomation/UploadRequests/" + requestPage + "/" + selId; //No I18N
                }
                else {
                    location.href = window.apiclientUrl+"Settings/NcmConfig/UploadRequests/" + requestPage + "/" + selId; //No I18N
                }
            }else if(onSelectFunction == "DEDeletedRequest") { //No I18N
                 var selId = grid.jqGrid('getCell', id, 'reqId'); //No I18N
                 var annotation = grid.jqGrid('getCell', id, 'approval_comments'); //No I18N
                 OPMClient.SettingsNCMConfigController.reqId=selId;
                 OPMClient.SettingsNCMConfigController.approvalRequestAnnotation = annotation;
                 if(OPMClient.ApplicationController.isNCM) {
                     location.href = window.apiclientUrl+"NCMConfigAutomation/UploadRequests/DeletedRequests/"+selId; //No I18N
                 }
                 else {
                       location.href = window.apiclientUrl+"Settings/NcmConfig/UploadRequests/Deleted/"+selId; //No I18N
                 }
            } else if(onSelectFunction == "DERuleViolantList") { //No I18N
				if(colMod[col].name == 'RemediationTemplate'){
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					var selTemplate = grid.jqGrid('getCell', id, 'NCMComplianceRule__REMEDIATION_TEMPLATE_ID');//NO I18N
					if(selTemplate != null && selTemplate != '' && selTemplate > 0) {
						var resourceID = grid.jqGrid('getCell', id, 'NCMResourcePolicyMap__RESOURCEID');//NO I18N
						var array = new Array();
						array.push(resourceID);
						window.fromPromotedRemediationAction = true;
						window.promotedRemediationDeviceList = array;
//						location.href = window.apiclientUrl+"NCMSettings/ExecuteConfiglet/"+selTemplate; //No I18N
						if(window.OPM.isNCM && window.OPM.oldView) {
							location.href = window.apiclientUrl+"NCMConfigAutomation/Configlets/CustomTemplate/Execute/"+selTemplate; //No I18N
						} else {
							location.href = window.apiclientUrl+"Settings/NcmConfig/Admin/CustomTemplate/Execute/"+selTemplate; //No I18N
						}
					}
				} 
			}  else if(onSelectFunction == "DECustomReportList") { //No I18N
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
					var selName = grid.jqGrid('getCell', id, 'NCMCustomReportDefinition__ReportName'); //No I18N
					if(selId != null && colMod[col].name ==  'Edit') { //No I18N
						if(checkDefaultCustomReport(selName)) {
							opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.defaultCustomReports",this)); // No I18N
						} else {
							OPMClient.ReportsDetailsController.ncmCustomReportId=selId;
							location.href = window.apiclientUrl+"Reports/NCM/CustomReport/Add"; //No I18N
						}
					}
					else
					{
						OPMClient.ReportsDetailsController.ncmCustomReportName=selName;	
						location.href = window.apiclientUrl+"Reports/NCM/CustomReportDetails/"+selId; //No I18N
					}
				}  else if(onSelectFunction == "DEAdvancedReportList") { //No I18N
					var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
//					if(selId != null) {
//						OPMClient.ReportsDetailsController.ncmAdvReportName = grid.jqGrid('getCell', id, 'NAME'); //No I18N
//						location.href = window.apiclientUrl+"Reports/NCM/AdvancedReport/Details/"+selId; //No I18N
//					}
					//var selName = grid.jqGrid('getCell', id, 'NCMAdvancedReports__NAME'); //No I18N
					if(selId != null && colMod[col].name ==  'Edit') { //No I18N
//						if(checkDefaultCustomReport(selName)) {
//							opm_infoMsgs("errorMsg",Ember.I18n.t("js.commonstr.defaultAdvancedReports",this)); // No I18N
//						} else {
//							OPMClient.ReportsDetailsController.ncmAdvancedReportId=selId;
//							location.href = window.apiclientUrl+"Reports/NCM/AdvancedReport/Add"; //No I18N
//						}
					}
					else
					{
//						OPMClient.ReportsDetailsController.ncmAdvancedReportName=selName;
						location.href = window.apiclientUrl+"Reports/NCM/AdvancedReport/Details/"+selId; //No I18N
					}
				} else if(onSelectFunction == "wlastBackup" || onSelectFunction == "wallBackup") { //No I18N
				var deviceIdList = grid.getCol('id',false,''); //No I18N
				
				// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table
				var resourceID = grid.jqGrid('getCell', id, 'NCMResource__RESOURCEID');//NO I18N
				
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+resourceID; //No I18N
			}
		 else if(onSelectFunction == "wnoConfigConflict" || onSelectFunction == "wConfigConflict") { //No I18N
				var deviceIdList = grid.getCol('id',false,''); //No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+resourceID; //No I18N
			}
		 else if(onSelectFunction == "wallConfigUnAuthChnage" || onSelectFunction == "wallConfigAuthChnage" || onSelectFunction == "wallConfigChnage") { //No I18N
				var deviceIdList = grid.getCol('id',false,''); //No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigChange/"+resourceID; //No I18N
			}
		 else if(onSelectFunction == "wcompStatDetails") { //No I18N
				var deviceIdList = grid.getCol('id',false,''); //No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigResCompliance/"+resourceID; //No I18N
			}
		 else if(onSelectFunction == "DEBackupsAllList") { //No I18N
	
				// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table
				var deviceIdList = grid.getCol('NCMResource__RESOURCEID',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'NCMResource__RESOURCEID');//NO I18N
				
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEBackupsLastList") { //No I18N
	
				// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table
				var deviceIdList = grid.getCol('NCMResource__RESOURCEID',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'NCMResource__RESOURCEID');//NO I18N
				
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEBackupScheduleList") { //No I18N
				var selId = grid.jqGrid('getCell', id, 'id');//NO I18N
				OPMClient.SettingsNCMConfigController.scheduleId=selId;
				if(window.OPM.isNCM) {
					location.href = window.apiclientUrl+"NCMConfigAutomation/Schedules/AllSchedules/Edit/"+selId; //No I18N
				} else {
					location.href = window.apiclientUrl+"Settings/NcmConfig/Schedules/AllSchedules/Edit/" +selId; //No I18N
				}
			}
		 else if(onSelectFunction == "DEConflictsList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEConflictsNAList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEConfigsChangeList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigChange/'+resourceID;
			}
		 else if(onSelectFunction == "DEConfigsChangeAuthList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigChange/'+resourceID;
			}
		 else if(onSelectFunction == "DEConfigsChangeUnAuthList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigChange/'+resourceID;
			}
		 else if(onSelectFunction == "DEResourcePoliciesStausTable") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigResCompliance/'+resourceID;
			}
		 else if(onSelectFunction == "NcmCompliancePolicyGroupResult") { //No I18N
             var policyId = grid.jqGrid('getCell', id, 'id');
             var isDisabled = grid.jqGrid('getCell', id, 'isDisabled');
             var isCompCheckRunning = grid.jqGrid('getCell', id, 'isCompCheckRunning');
             var resultsData = grid.jqGrid('getCell', id, 'Result');
             var containsButton = resultsData && (resultsData.indexOf('runComplianceCheck') !== -1 || resultsData.indexOf('loadPolicyDeviceAssociation') !== -1);
             if (colMod[col].name !== 'Actions' && isDisabled == 'false' && (colMod[col].name !== 'Result' || !containsButton) && location.href.endsWith('/Policies')) { // Actions column
                 defaultOptions.selectTreeNodeOnGridClick('policyGroup_ALL_policy_'+policyId);
             }
         }
         else if(onSelectFunction == "NcmCompliancePolicyResult") { //No I18N
            if (colMod[col].name === 'Device Name') {
                redirectToNCMSnapshot(grid.jqGrid('getCell', id, 'IpAddress'),'ConfigDevice');
            }
            if (colMod[col].name === 'Total Rule Result') {
                var resultsData = grid.jqGrid('getCell', id, 'Total Rule Result');
                var hideRuleResult = !resultsData || resultsData.includes('Policy disabled') || resultsData.includes('No Data Available') || resultsData.includes('loadPolicyDeviceAssociation') || resultsData.includes('runComplianceCheck');
                if(!hideRuleResult) {
                    var resourceId = grid.jqGrid('getCell', id, 'id');
                    OPMClient.NCMCompliancePolicyController.selDeviceId = resourceId;
                    var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
                    OPMClient.NCMCompliancePolicyController.selDeviceHostName = grid.jqGrid('getCell', id, 'Device Name');
                    location.href = OPMClient.NCMComplianceListController.baseUrl+'/Policies/PolicyDeviceResult/'+policyId+'/'+resourceId;
                }
            }
         }
         else if(onSelectFunction == "NcmComplianceRuleGroupResult") { //No I18N
            if (colMod[col].name === 'Device Name') {
                redirectToNCMSnapshot(grid.jqGrid('getCell', id, 'IpAddress'),'ConfigDevice');
            }
            if (colMod[col].name === 'Total Rule Result') {
                var resultsData = grid.jqGrid('getCell', id, 'Total Rule Result');
                var hideRuleResult = !resultsData || resultsData.includes('Policy disabled') || resultsData.includes('No Data Available') || resultsData.includes('loadPolicyDeviceAssociation') || resultsData.includes('runComplianceCheck');
                if(!hideRuleResult) {
                    var resourceId = grid.jqGrid('getCell', id, 'id');
                    OPMClient.NCMCompliancePolicyController.selDeviceId = resourceId;
                    var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
                    var rgId = OPMClient.NCMCompliancePolicyController.getRGId();
                    OPMClient.NCMCompliancePolicyController.selDeviceHostName = grid.jqGrid('getCell', id, 'Device Name');
                    location.href = OPMClient.NCMComplianceListController.baseUrl+'/Policies/RuleGroupDeviceResult/'+policyId+'/'+rgId+'/'+resourceId;
                }
            }
         }
         else if(onSelectFunction == "NcmComplianceRuleResult") { //No I18N
            if (colMod[col].name === 'RESOURCENAME') {
                redirectToNCMSnapshot(grid.jqGrid('getCell', id, 'ADDRESS'),'ConfigDevice');
            }
         }
         else if(onSelectFunction == "DeviceRuleResult"){ // No I18N
            var ruleId = grid.jqGrid('getCell', id, 'id');
            var policyId = OPMClient.NCMCompliancePolicyController.getPolicyId();
            var consolidateResult = grid.jqGrid('getCell', id, 'CONSOLIDATE_RESULT');
            if (consolidateResult.indexOf('Applicable') === -1) {
                OPMClient.NCMComplianceUtilController.retainDeviceRuleResultFilter = true;
                location.href = OPMClient.NCMComplianceListController.baseUrl+'/Policies/RuleResult/' + ruleId + '/' + policyId+'/'+OPMClient.NCMCompliancePolicyController.selDeviceId;
            } else {
                opm_infoMsgs("infoMsg", Ember.I18n.t("ncm.complianceiq.noResultsAvailable", this)); // No I18N
            }
         }
         else if(onSelectFunction == "ComplianceAllRuleGroupsV2List"){
             var rgId = grid.jqGrid('getCell', id, 'id');
             if (colMod[col].name !== 'ASSOCIATE') { // Associate action icon
                location.href = OPMClient.NCMComplianceListController.baseUrl+'/ListGroups/Edit/'+rgId;
             }
         }
         else if(onSelectFunction == "DECompliancePolicyList"){
            var policyId = grid.jqGrid('getCell', id, 'id');
            OPMClient.NCMCompliancePolicyController.policyEditFromPage = "DASHBOARD";// No I18N
            OPMClient.NCMCompliancePolicyController.loadPolicyEdit(policyId);
         }
		 else if(onSelectFunction == "DEcomplianceRGroupsList") { //No I18N
				var rgId = grid.jqGrid('getCell', id, 'id');
				OPMClient.NCMCompliancePolicyController.ruleGroupEditFromPage = "DASHBOARD";// No I18N
				OPMClient.NCMComplianceRuleGroupController.loadRuleGroupEdit(rgId);
			}
		 else if(onSelectFunction == "DEComplianceRulesList") { //No I18N
				var ruleId = grid.jqGrid('getCell', id, 'id');
				OPMClient.NCMComplianceRulesController.loadRuleEdit(ruleId, true);
			}
		 else if(onSelectFunction == "DEEOLDevicesList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				redirectToMSPSnapshot(resourceID);
//				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEEOLNADeviceList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				redirectToMSPSnapshot(resourceID);
//				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEBaseRunningConflictList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEBaseRunningConflictNAList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var resourceID = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.OPM.apiclientUrl+'Inventory/Snapshot/ConfigDevice/'+resourceID;
			}
		 else if(onSelectFunction == "DEPCIALLReviewsList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var selId = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.apiclientUrl+"Settings/NcmConfig/PCIReview/"+selId; //No I18N
			}
		 	else if(onSelectFunction == "DEPCIMyReviewsList") { //No I18N
				var deviceIdList = grid.getCol('id',false,'');//No I18N
				var selId = grid.jqGrid('getCell', id, 'id');//NO I18N
				if (deviceIdList != null && deviceIdList != "")
				{
					window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
				}
				location.href = window.apiclientUrl+"Settings/NcmConfig/PCIReview/"+selId; //No I18N
			} else if(onSelectFunction == "DECustomSysOId") { //No I18N
				OPMClient.SettingsNCMConfigController.sysObjectId = grid.jqGrid('getCell', id, 'id');//NO I18N
				OPMClient.SettingsNCMConfigController.MODEL = grid.jqGrid('getCell', id, 'CustDeviceSysOID__MODEL');//NO I18N
				OPMClient.SettingsNCMConfigController.SERIES = grid.jqGrid('getCell', id, 'CustDeviceSysOID__SERIES');//NO I18N
				OPMClient.SettingsNCMConfigController.TEMPLATENAME = grid.jqGrid('getCell', id, 'NCMDeviceTemplate__DISPLAYNAME');//NO I18N
				OPMClient.SettingsNCMConfigController.VENDORNAME = grid.jqGrid('getCell', id, 'NCMVendor__DISPLAYNAME');//NO I18N
				if(colMod[col].name !== "action") {
					location.href = location.href+"/Edit"; //No I18N
				}
			}
			else if(onSelectFunction == "DEDeviceChangeList")
			{
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(OPMClient.ApplicationController.currentRouteName == "Reports.NCM.ConfigurationChangeTrend" || OPMClient.ApplicationController.currentRouteName == "Reports.NCM.ConfigurationChanges") {
					if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.operatorAccess || window.OPM.userPermissions.ncmRestricted) {
						redirectToSnapshot("ConfigChange",selDevice); //No I18N
					}
				}
				else {
					redirectToSnapshot("ConfigChange",selDevice); //No I18N
				}
			}
			else if(onSelectFunction === "DEResCompStatusTable" )
			{
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(OPMClient.ApplicationController.currentRouteName == "Reports.NCM.ComplianceReport") {
					if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.operatorAccess || window.OPM.userPermissions.ncmRestricted) {
						redirectToSnapshot("ConfigResCompliance",selDevice); //No I18N
					}
				}
				else {
					redirectToSnapshot("ConfigResCompliance",selDevice); //No I18N
				}
			}
			else if(onSelectFunction === "DEApprovalAssocConfigs" )
			{
				if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.operatorAccess || window.OPM.userPermissions.ncmRestricted) {
					var selDevice =  grid.jqGrid('getCell', id, 'VersionID'); //No I18N
					redirectToSnapshot("ConfigChange",selDevice); //No I18N
				}
			} else if((onSelectFunction === "DEDeviceTemplates" || onSelectFunction === "multiConfigTemplates") && colMod[col].name !== "action")//No I18N
			{
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				var resCount =  grid.jqGrid('getCell', id, 'RESOURCE_COUNT'); //No I18N
				if(colMod[col].name == "RESOURCE_COUNT" && resCount != 0 && resCount != '0') {
					var device_behaviour =  grid.jqGrid('getCell', id, 'DISPLAYNAME'); //No I18N
					if(device_behaviour.indexOf("<div") != -1) {
						try {
							device_behaviour = $(device_behaviour).text().trim();
						} catch(e) {
							
						}
					}
					OPMClient.InventoryDeviceDetailsController.isFromDeviceTemplate=true;
					OPMClient.InventoryDeviceDetailsController.device_behaviour=device_behaviour;
					redirectToInventorySub('ConfigMgmt/Devices');//No I18N
				}/* else if(colMod[col].name == "share") {
					var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.SettingsNCMConfigController.DEV_TEMPLATEID = selDevice;
					location.href = location.href + "/" + "Share";
				}*/ else {
					var displayName =  grid.jqGrid('getCell', id, 'DISPLAYNAME'); //No I18N
					OPMClient.SettingsNCMConfigController.DEV_TEMPLATEID = selDevice;
					OPMClient.SettingsNCMConfigController.DEV_TEMPLATENAME = displayName;
					location.href = window.OPM.apiclientUrl + "Settings/NcmConfig/DeviceTemplatesEdit"; // No i18n
				}
			} else if(onSelectFunction === "SyslogStateRegex" && colMod[col].name !== "action")//No I18N
			{
				var regexID =  grid.jqGrid('getCell', id, 'id'); //No I18N
				var personalityId =  grid.jqGrid('getCell', id, 'PERSONALITYID'); //No I18N
				var personalityName =  grid.jqGrid('getCell', id, 'NCMPersonality_DISPLAYNAME'); //No I18N
				var regexPattern =  grid.jqGrid('getCell', id, 'REGEX'); //No I18N
				OPMClient.NCMConfigAutomationModel.syslogRegexPersonality = personalityId;
				OPMClient.NCMConfigAutomationModel.syslogStatePersonalityName = personalityName;
				OPMClient.NCMConfigAutomationModel.syslogRegexID = regexID;
				OPMClient.NCMConfigAutomationModel.syslogStateRegex = regexPattern;
				location.href = location.href+'/Edit'; //No I18N
			}  else if(onSelectFunction === "multiConfigTemplates" && colMod[col].name !== "action")//No I18N
            {
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				var displayName =  grid.jqGrid('getCell', id, 'DT_NAME'); //No I18N
				OPMClient.SettingsNCMConfigController.DEV_TEMPLATEID = selDevice;
				OPMClient.SettingsNCMConfigController.DEV_TEMPLATENAME = displayName;
				location.href = window.OPM.apiclientUrl + "Settings/NcmConfig/DeviceTemplatesEdit"; // No i18n
            } else if(onSelectFunction === "DEDevAuditStatus" )//No I18N
			{
				if(OPMClient.ApplicationController.isAuthorized) {
					var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
					var status =  grid.jqGrid('getCell', id, 'NCMOperationAudit__OPERATIONSTATUS'); //No I18N
					var opType =  grid.jqGrid('getCell', id, 'NCMOperationAudit__OPERATIONNAME'); //No I18N
					if((opType.indexOf('Backup') != -1 && status == 'FAILURE') || opType.indexOf('Script Execution') != -1 || opType.indexOf('ScriptExecution') != -1 || opType.indexOf('Command template execution') != -1) {
						OPMClient.ReportsDetailsController.NCMDevAuditID=selDevice;
						location.href=location.href+'/DevResponse';
					}
				}
			} 
			else if(onSelectFunction == "ConfigsForLabel") { //No I18N
				var selDevice =  grid.jqGrid('getCell', id, 'VersionID'); //No I18N
				OPMClient.InventoryNCMActionController.showConfigContent(selDevice);
			} 
			else if(onSelectFunction === "DETerminalDevAuditTable" )//No I18N
			{
				if(OPMClient.ApplicationController.isAuthorized && (window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.ncmRestricted)) {
					var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.SettingsNCMConfigController.NCMCustomDevAuditID=selDevice;
//					if(OPMClient.ApplicationController.currentPath == "Settings.Discovery.FWATerminal.Audit.index"){
//						window.location='index.jsp#/Settings/Discovery/FWATerminal/Audit/Details';
//					}else{
						window.location='index.jsp#/Settings/NcmConfig/Terminal/Audit/Details';
//					}
				}
			}
			else if(onSelectFunction == "DEDevTemplates_Promote") { //No I18N
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				OPMClient.SettingsNCMConfigController.configletId = selDevice;
				if(colMod[col].name !== "action") {
					location.href=location.href+"/Edit";
				} else {
					var templateId = grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.Settings.NCMDemoteConfiglets(templateId, OPMClient.SettingsNCMConfigController.DEV_TEMPLATEID, "DEFilteredConfigletsList");//No I18N
				}
			} else if(onSelectFunction == "DEDevTemplates_FlowExport") { //No I18N
				var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
				OPMClient.SettingsNCMConfigController.configletId = selDevice;
				if(colMod[col].name !== "action") {
					location.href=location.href+"/Edit";
				} else {
					var templateId = grid.jqGrid('getCell', id, 'id'); //No I18N
					OPMClient.Settings.NCMRemoveFlowConfiglets(templateId, OPMClient.SettingsNCMConfigController.DEV_TEMPLATEID, "DEFilteredConfigletsList");//No I18N
				}
			}

            else if(onSelectFunction == "NCMResourceRuleStatus_CR") { //No I18N
				var reportId=OPMClient.ReportsDetailsController.ncmCustomReportId;
				var selRuleId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				var selResourceId = grid.jqGrid('getCell', id, 'NCMResourceRuleStatus_RESOURCEID');//NO I18N
				OPMClient.InventoryDeviceDetailsController.compRuleId=selRuleId;
				OPMClient.InventoryDeviceDetailsController.RESOURCEID=selResourceId;
				OPMClient.InventoryDeviceDetailsController.isCompValidation=false;
				OPMClient.InventoryDeviceDetailsController.inventorysnapType="ConfigResCompliance";
				location.href = window.apiclientUrl+"Reports/NCM/CustomReportDetails/"+reportId+"/ResRuleStatus"; //No I18N
			} else if(onSelectFunction == "complainceStatus_compliant" || onSelectFunction == "complainceStatus_violation" || onSelectFunction == "complainceStatus_NA" ||  //No I18N
					onSelectFunction == "backupStatus_success" || onSelectFunction == "backupStatus_failure" || onSelectFunction == "backupStatus_not_backed_up" ||  //No I18N
					onSelectFunction == "startupStatus_insync" || onSelectFunction == "startupStatus_conflict" || onSelectFunction == "startupStatus_NA" ||  //No I18N
					onSelectFunction == "baselineStatus_insync" || onSelectFunction == "baselineStatus_conflict" || onSelectFunction == "baselineStatus_NA"  //No I18N
						) {
				var selResourceId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(!setNCMEEProbeVars(selResourceId)){
					return;
				}			
				location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+selResourceId; //No I18N
			} else if(onSelectFunction == "DeviceCompliance") {//NO I18N
				var selStatus = grid.jqGrid('getCell', id, 'COMPLIANCE_STATUS');//NO I18N
				var resId = grid.jqGrid('getCell', id, 'RESOURCEID');//NO I18N
				
				// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table
				var hostname = grid.jqGrid('getCell', id, 'NCMResource__RESOURCENAME');//NO I18N
				
				var selResourceId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if((selStatus == true || selStatus == false || selStatus == 'true' || selStatus == 'false') && selResourceId.indexOf('index') == -1) {
					OPMClient.InventoryDeviceDetailsController.RESOURCEID=resId;
					ncmcompliancedata.set("hostname", hostname);//NO I18N
					location.href = location.href+"/Details/"+selResourceId; //No I18N
				}
			}
//			else if(onSelectFunction == "RuleCompliance") {//NO I18N
//				var ruleId =  grid.jqGrid('getCell', id, 'id'); //No I18N
//				var rulename = grid.jqGrid('getCell', id, 'NCMComplianceRule__COMPRULE_NAME');//NO I18N
//				if(ruleId != null) {
//					ncmcompliancedata.set("rulename", rulename);//NO I18N
//					if(colMod[col].name !== "NCMTemplate__TEMPLATE_NAME") {
//						location.href = location.href+"/Details/"+ruleId; //No I18N
//					} else {
//						var configletId = grid.jqGrid('getCell', id, 'templateId'); //No I18N
//						var violC = parseInt($("#DERuleInPolicy tr[id="+ruleId+"] .severityStatusCount").attr("attr-violation"));
//						if(violC > 0) {
//							location.href = location.href+"/RemedConfiglets/"+ruleId+"/"+configletId; //No I18N
//						} else {
//							location.href = location.href+"/Details/"+ruleId; //No I18N
//						}
//					}
//				}
			else if(onSelectFunction == "PolicyDeviceRules") {//NO I18N
				var ruleId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(ruleId != null) {
					OPMClient.InventoryDeviceDetailsController.compRuleId=ruleId;
					ncmcompliancedata.set("rulename", rulename);//NO I18N
					if(colMod[col].name !== "RemediationTemplate") {
						location.href = location.href+"/RuleResult/"+ruleId; //No I18N
					} else {
						var configletId = grid.jqGrid('getCell', id, 'NCMComplianceRule__REMEDIATION_TEMPLATE_ID'); //No I18N
						var complianceStatus = grid.jqGrid('getCell', id, 'NCMResourceRuleMap__STATUS'); //No I18N
						if(complianceStatus == false || complianceStatus == "false") {
							if(configletId > 0) {
								location.href = location.href+"/RemedConfiglets/"+ruleId+"/"+configletId; //No I18N
							}
						} else {
							location.href = location.href+"/RuleResult/"+ruleId; //No I18N
						}
					}
				}
			} else if(onSelectFunction == "DECmpStatus_Compliant" || onSelectFunction == "DECmpStatus_Violation" || onSelectFunction == "DECmpStatus_notavailable") {//NO I18N
				var resId =  grid.jqGrid('getCell', id, 'RESOURCEID'); //No I18N
				
				// NMSNG DepnRem - NCMDevices depn. removed and hence NCMResource is the primary table
				var hostname = grid.jqGrid('getCell', id, 'NCMResource__RESOURCENAME');//NO I18N
				
				var selResourceId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(selResourceId != null) {
					OPMClient.InventoryDeviceDetailsController.RESOURCEID=resId;
					ncmcompliancedata.set("hostname", hostname);//NO I18N
					location.href = location.href+"/Details/"+ruleId; //No I18N
					if(window.OPM.isOPM || window.OPM.isNFA){
                        location.href = window.apiclientUrl+"Inventory/List/Ncm/Compliance/Policies/Details/"+OPMClient.NCMInventoryComplianceNewController.policyId+"/DeviceCompliance"; //No I18N
					}
					else{
					location.href = OPMClient.NCMComplianceListController.baseUrl+"/AllPolicies/Details/"+OPMClient.NCMInventoryComplianceNewController.policyId+"/DeviceCompliance"; //No I18N
				}
				}
			} else if(onSelectFunction == "AllCmpRuleGroups") {//NO I18N
				var ruleGId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(ruleGId != null) {
					if(colMod[col].name !== "ASSOCIATE") {
						location.href = location.href+"/Add/"+ruleGId; //No I18N
					} else {
						location.href = location.href+"/Associate/"+ruleGId; //No I18N
					}
				}
			} else if(onSelectFunction == "AllCmpRules") {//NO I18N
				var ruleGId =  grid.jqGrid('getCell', id, 'id'); //No I18N
				if(ruleGId != null) {
					if(colMod[col].name !== "ASSOCIATE") {
						location.href = location.href+"/Add/"+ruleGId; //No I18N
					} else {
						location.href = location.href+"/Associate/"+ruleGId; //No I18N
					}
				}
			} else if(onSelectFunction == "DEDiscoveryReport") {//NO I18N
				if(colMod[col].name == "NCMDiscoveryReport__STATUS") {
					if(window.OPM.userPermissions.ncmDevMgmtRead && window.OPM.userPermissions.discoveryWrite ){
                        var status =  grid.jqGrid('getCell', id, 'NCMDiscoveryReport__STATUS'); //No I18N
                        if(status.indexOf("FAILURE") != -1 || status.indexOf("INTERRUPTED") != -1 || status.indexOf("UNKNOWN") != -1 || status.indexOf("SysOID_NOT_FOUND") != -1) {
                            var ipAddress =  grid.jqGrid('getCell', id, 'NCMDiscoveryReport__IPADDRESS'); //No I18N
                            addUndiscoveredDevicesToInventory(ipAddress, true);
                        } else if (status.indexOf("YET_TO_ADD") != -1) {
                            var reportID =  grid.jqGrid('getCell', id, 'id'); //No I18N
                            var reportIds = [];
                            reportIds.push(reportID);
                            var data = {};
                            data.REPORTIDS = JSON.stringify(reportIds);
                            var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/addDiscoveredResources'; //No I18N
                            $.ajax({
                                url: ajaxRequestUrl,
                                type: 'POST',//No I18N
                                dataType: 'json',//No I18N
                                data: data,
                                success: function(jsonData, status) {
                                    var	cls = "errorMsg"; //No I18N
                                    var msg = jsonData.statusMsg ? jsonData.statusMsg : Ember.I18n.t("webclient.ncm.discovery.addToInventory.failure", this); //No I18N
                                    if(jsonData.isSuccess) {
                                        cls = "successMsg"; //No I18N
                                        msg = Ember.I18n.t("webclient.ncm.discovery.addToInventory.success.single", this);
                                    }
                                    else if (jsonData.error !== undefined && jsonData.error.message !== undefined) {
                                        msg = jsonData.error.message; //No I18N
                                    }
                                    opm_infoMsgs(cls,msg);
                                }
                            });
                        }
					} else{
					    opm_infoMsgs("errorMsg", Ember.I18n.t("ncm.AuthorizationRestriction", this)); //No I18N}
					}
				}
			}
            else if(onSelectFunction === "FirmwareVulnerability")//No I18N
            {
                if(defaultOptions.isSnapshotGrid)
                {
                    OPMClient.NCMFirmwareVulnerability.cveIdForDetails = grid.jqGrid('getCell', id, 'id');//No I18N
                    OPMClient.NCMFirmwareVulnerability.resourceId = grid.jqGrid('getCell', id, 'resourceId');//No I18N
                    redirectSnapShot("FirmwareVulnerabilityCveDetailsSlide"); //No I18N
                }
                else if(OPMClient.ApplicationController.isNCM === false)
                {
                    OPMClient.NCMFirmwareVulnerability.cveIdForDetails = grid.jqGrid('getCell', id, 'NCMFVVULNERABILITYDETAILS__CVEID');//No I18N
                    OPMClient.NCMFirmwareVulnerability.opmCveDetailsSlideIn();
                }
            }
            else if(onSelectFunction === "DEAllConfigs")
			{
            	var selDevice =  grid.jqGrid('getCell', id, 'id'); //No I18N
            	if(OPMClient.ApplicationController.currentRouteName == "Reports.NCM.AnnotationReport") {
					if(window.OPM.userPermissions.ncmDevMgmtRead || window.OPM.userPermissions.operatorAccess || window.OPM.userPermissions.ncmRestricted) {
						redirectToSnapshot("ConfigChange",selDevice); //No I18N
					}
				}
            	else {
            		redirectToSnapshot("ConfigChange",selDevice); //No I18N
            	}
			}
			else if(onSelectFunction === "DERESTDeviceTemplates" && colMod[col].name === "DT_COUNT")//No I18N
            {
                var selTemplateId = grid.jqGrid('getCell', id, 'id'); //No I18N
                OPMClient.NCMInventoryRestAPIController.restTemplateId = selTemplateId;
			    OPMClient.NCMInventoryRestAPIController.set('filterDataByRestTemplatesVendor',$(grid.jqGrid('getCell', id, 'DISPLAYNAME')).text().trim());
			    OPMClient.NCMInventoryRestAPIController.set('filterDataByRestTemplates',true);
                $('.DeviceTemplateFilter').css('display','block');
                if(window.OPM.isNCM){
                    location.href = window.OPM.apiclientUrl + "NCMConfigAutomation/DeviceTemplates/All"; // No i18n
                    $('.compliance .Device-Info .settingsContent .opmFormHolder #changeMgmtContent').css('padding-top','34px');
                    $('.compliance .Device-Info .settingsContent .opmFormHolder').css('overflow-x','hidden');
                }
                else{
                    location.href = window.OPM.apiclientUrl + "Settings/NcmConfig/DeviceTemplates/All"; // No i18n
                    $('.settingsCnt > section .settingsContent .adminMonitors .opmFormHolder').css('top','178px');
                }
		        setTimeout(function(){
		            $('.DeviceTemplateFilter .icon-remove').off('click').on('click',function(){
                       OPMClient.Settings.NCMRemoveFilterInDeviceTemplates(true);
                    })
                    $('.DeviceTemplateFilter .subFilter i').off('click').on('click',function(){
                       OPMClient.Settings.NCMRemoveFilterInDeviceTemplates(true);
                    });
                },200);


            }
			else if(onSelectFunction === 'DERESTDeviceTemplates'){
			    var selTemplateId =  grid.jqGrid('getCell', id, 'id'); //No I18N
			    OPMClient.NCMInventoryRestAPIController.restTemplateId = selTemplateId;
			    if(window.OPM.isNCM){
			        location.href = window.apiclientUrl+"NCMConfigAutomation/DeviceTemplates/REST/Details"; //No I18N
			    }
			    else{
			        location.href = window.apiclientUrl+"Settings/NcmConfig/DeviceTemplates/REST/Details"; //No I18N
			    }

			}
			else if(onSelectFunction === 'BackupStatusList'){
				var id = grid.jqGrid('getCell', id, 'id'); //No I18N
                //location.href= window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+id;
				redirectToMSPSnapshot(id);
				
			} else if(onSelectFunction === 'NCMControllers'){
                if(colMod[col].name == "action") {
                    return;
                }
                var id = grid.jqGrid('getCell', id, 'id'); //No I18N
                redirectToNCMAddEditController(id);
			}else if(onSelectFunction === 'NCMHardwareCollector'){
                var id = grid.jqGrid('getCell', id, 'id'); //No I18N
                location.href = window.OPM.apiclientUrl+"Settings/NcmConfig/HardwareCollector/Result/" + id; //NO I18N
			} else if(onSelectFunction === 'notificationActions') {
			    if(colMod[col].name == "Actions") {
                    return;
                }
			    var id = grid.jqGrid('getCell', id, 'id'); //No I18N
			    var type = grid.jqGrid('getCell', id, 'type'); //No I18N
			    OPMClient.NCMConfigAutomationModel.addEditChangeManagementAction(type, "Edit", id); //No I18n
			} else if(onSelectFunction === 'notificationRules') {
                if(colMod[col].name == "action" || colMod[col].name == "status") {
                      return;
                }
                var id = grid.jqGrid('getCell', id, 'id'); //No I18N
                OPMClient.NCMConfigAutomationModel.editChangeManagementRule(id);
			}
			else if(onSelectFunction === 'ComplianceAllRulesV2List'){
				var selId = grid.jqGrid('getCell', id, 'id'); //No I18N
                //location.href= window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+id;
                if (colMod[col].name !== 'ASSOCIATE') { // Associate icon
                    location.href = OPMClient.NCMComplianceListController.baseUrl+"/ListRules/Edit/"+selId; //No I18N
                }
			}
		},
		loadComplete: function (fulldata) {
			if(defaultOptions.gridCallBack!==undefined) {
			    if(fulldata.vulnNote){
			       if(!defaultOptions.gridCallBackParams){
			        defaultOptions.gridCallBackParams = {};
			       }
			       defaultOptions.gridCallBackParams.callBackNote = fulldata.vulnNote;
			    }
				defaultOptions.gridCallBack(gridTable,defaultOptions.gridCallBackParams);
			}
            if(defaultOptions.multiselect && !$('#gbox_'+ (gridTable.replace("#",''))).hasClass('opmCusGrid')) {
				$('#gbox_'+ (gridTable.replace("#",''))).addClass('opmCusGrid');
			}
            if(defaultOptions.search === false){
            	$('td#search_'+ (gridTable.replace("#",''))).hide();
            }

			var width1 = $(gridTable).closest('.opmFormHolder').width()-30 || null; 
			var width2 = $(gridTable).closest('.opmTabCont').width()-60 || null;
			if(onSelectFunction == 'DEAllRuleGroups' || onSelectFunction == 'DEAllRules' || 'DeviceCompliance') {
				if(width1 == undefined || width1 == null || width1 <= 100) {
                        width1 = $("#complianceContentDiv").width();
				}
			}
			if(onSelectFunction == 'DENotifications' || 'DEPendingRequest' ||'DEExecutableRequest' || 'DEApprovedRequest' || 'DERejectedRequest' || 'DEDeletedRequest') {
				if(width1 == undefined || width1 == null || width1 <= 100) {
                        width1 = $("#changeMgmtContent").width()-10;
				}
			}

			if( onSelectFunction === "SkipApprovalCLI" || onSelectFunction === "SkipApprovalREST" ){
			         if(fulldata.rows !== undefined){
                         countOfRows = opm_getCountOfJson(fulldata.rows);
                     }
                      var temp =[];
                     var selectedData = onSelectFunction === "SkipApprovalCLI"
                         ? OPMClient.NCMSkipApprovalController.get("selectedEntities")
                         : OPMClient.NCMSkipApprovalController.get("selectedRESTEntities");
                     var selectedIds = {};
                     for(var s = 0; s < selectedData.length; s++){
                         selectedIds[String(selectedData[s].id)] = true;
                     }
                     for(var i = 0; i < fulldata.rows.length; i++){
                         var rowdatum = fulldata.rows[i];
                         if(rowdatum.checked || selectedIds[String(rowdatum.id)]) {
                              temp.push(rowdatum.id);
                         }
                     }
                     rowSelArray = temp;
                     var sectionId = onSelectFunction === "SkipApprovalCLI" ? "#cli" : "#rest";//No I18N
                     $(sectionId + ' .availableBox .nodataMsg').hide();//No I18N
                     $(sectionId + ' .availableBox .opm_jqGridUI').show();//No I18N
            }
			var gridWidthSet = (width1>width2)?width1:width2;
			if(defaultOptions.isSubgrid) {
				gridWidthSet = gridWidthSet - 60;
			}
			if(defaultOptions.widthOfTable !== undefined){
                gridWidthSet = widthOfTable;
			}
			defaultOptions.setWidth ? $(gridTable).jqGrid('setGridWidth', gridWidthSet):'' ;//No I18N
			
			if(defaultOptions.groupsList != undefined && defaultOptions.groupsList.length > 0 && (defaultOptions.groupsAdded == undefined || defaultOptions.groupsAdded != true)) {
				defaultOptions.groupsAdded = true;
				var colgroupsList = defaultOptions.groupsList;
				$(gridTable).jqGrid('setGroupHeaders', {
					useColSpanStyle: true, 
					groupHeaders:colgroupsList
				});
			}
			var $this = $(this);
			$(this).removeClass('gridnodata');
			var checkboxes = $(this).find("input.cbox");
			checkboxes.after("<i></i>");
			if(onSelectFunction == "FVDeviceCVEHistory" || onSelectFunction == "DECredProf"){
			    var countOfRows = 0;
			    if(fulldata.rows !== undefined){
			        countOfRows = opm_getCountOfJson(fulldata.rows);
			    }
                if(countOfRows===0||countOfRows===1){
                    if($(gridTable).getGridParam("reccount")===0 && (defaultOptions === undefined || defaultOptions.disableNoDataText != true)){
                        if(defaultOptions != undefined && defaultOptions.noDataText!==undefined){
                            $(gridTable).show().text(defaultOptions.noDataText); //No I18n
                        }else{
                            $(gridTable).show().text(Ember.I18n.t('webclient.jqgrid.no.data.found')); //No I18n
                        }
                        $(gridTable).addClass("gridnodata");
                        $(gridTable).css('text-align','center');
                    }
                }
			}

            if(onSelectFunction === "Devices" || onSelectFunction === "Configs" || onSelectFunction === "Changes" || onSelectFunction === "Drafts" || onSelectFunction === "Compliance" || onSelectFunction === "DGroupGrid" || onSelectFunction === "NonInventoryDevices" || onSelectFunction === "UnmanagedDevices")
	     	{
				$(gridTable).jqGrid('setGridWidth',$('#opm_devListHolder').width()) ;//No I18N
				ncmInventoryInitHeader();
				if((onSelectFunction === "Devices" || onSelectFunction === "Changes") && window.OPM.isValidEEInstallation && (window.OPM.isCentralServer || window.OPM.isMSPCentral) && !window.OPM.isProbeSelected) {
					$('#opm_DeviceList tr > td:first-child input, #cb_opm_Devices').hide();
				}
//				if(window.devicereload != true && onSelectFunction === "Devices") {
//					if(fulldata.rows != null && fulldata.rows.length > 0) {
//						var loadPeriodic = false;
//						for (var i = 0; i < fulldata.rows.length; i++) {
//							var rowdatum = fulldata.rows[i];
//							if(rowdatum.cell[15] == "INPROGRESS") {
//								window.devicereload = true;
//								loadPeriodic = true;
//								break;
//							}
//						}
//						if(loadPeriodic) {
//							setTimeout(function(){
//								rowSelArray = $(gridTable).jqGrid('getGridParam','selarrrow');
//								$(gridTable).trigger('reloadGrid');
//								window.devicereload = false;
//							}, 3000);
//						}
//					}
//				}
	     	}
	     	 else if(defaultOptions != undefined && defaultOptions.isSnapshotGrid){
	     		$(gridTable).jqGrid('setGridWidth', $('[data-widget-id='+defaultOptions.snapId+']').width()) ;//No I18N
	     		var fullLen = 0;
     			if(fulldata.records != undefined && fulldata.records > 0) {
     				fullLen = parseInt(fulldata.records);
     			} else if(fulldata.rows != null) {
     				fullLen = fulldata.rows.length;
     			}
     			if(fullLen > 10) {
	    			$('[data-widget-id='+defaultOptions.snapId+'] .headerTitleSpan').after('<span class="widgetNoData">[ '+fullLen+' ]</span>');
     			}
	     	} else if(defaultOptions.expandedGrid) {
	     		$(gridTable).jqGrid('setGridWidth', $('#li_ExpandLi').width()) ;//No I18N
	     	} else if(defaultOptions.loadUntilOneRow == true){
	     		if(fulldata.rows != null && fulldata.rows.length == 0) {
					setTimeout(function(){
						$(gridTable).trigger('reloadGrid');
					}, 3000);
				}
	     	}
//	     	else if(onSelectFunction == 'bulkRemediationTable'){
//	     	    if(OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance){
//                    OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.setSelectionsInGrid();
//	     	    }
//	     	}
			if(defaultOptions != undefined &&  defaultOptions.isSnapshotGrid) {
				snapshotRemotegridCallback(defaultOptions.snapId, fulldata, gridTable, true, defaultOptions.reload, defaultOptions.reloadMsgId);
			}
//			if(fulldata.rows != null && fulldata.rows.length===0)
//			{
//				grid.addClass("gridnodata");
//                var gview = grid.parents("div.ui-jqgrid-view"); //No I18n
//                gview.children("div.ui-jqgrid-hdiv").hide(); //No I18n
//            } else {
//            	grid.removeClass("gridnodata");
//                var gview = grid.parents("div.ui-jqgrid-view"); //No I18n
//                gview.children("div.ui-jqgrid-hdiv").show(); //No I18n
//            }
			var $this = $(this);
			if(rowSelArray != null) {
				for (i = 0; i < rowSelArray.length; i++) {
					grid.jqGrid('setSelection', rowSelArray[i], false);
				}
				if( onSelectFunction === "SkipApprovalREST" ){
                     // Use the bulk push so the selected grid (and its
                     // getGridColumnChoosers ajax) is reloaded only once
                     // instead of once per saved/selected row.
                     var restEntityDataList = [];
                     for (i = 0; i < rowSelArray.length; i++) {
                       restEntityDataList.push($(gridTable).jqGrid("getRowData",rowSelArray[i]));//No I18N
                     }
                     if(restEntityDataList.length > 0){
                         OPMClient.NCMSkipApprovalController.pushSelectedRESTEntitiesBulk(restEntityDataList);
                     }
				}
				if( onSelectFunction === "SkipApprovalCLI" ){
                     // Use the bulk push so the selected grid (and its
                     // getGridColumnChoosers ajax) is reloaded only once
                     // instead of once per saved/selected row.
                     var cliEntityDataList = [];
                     for (i = 0; i < rowSelArray.length; i++) {
                       cliEntityDataList.push($(gridTable).jqGrid("getRowData",rowSelArray[i]));//No I18N
                     }
                     if(cliEntityDataList.length > 0){
                         OPMClient.NCMSkipApprovalController.pushSelectedEntitiesBulk(cliEntityDataList);
                     }
                }
			}
			if(onSelectFunction === 'bulkRemediationTable' && defaultOptions && defaultOptions.enableColCheckBox && !defaultOptions._bulkRemediationSelectionSynced) {
				var bulkInstance = OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance;
				if(bulkInstance && typeof bulkInstance.setSelectionsInGrid === 'function') {
					bulkInstance.setSelectionsInGrid();
					defaultOptions._bulkRemediationSelectionSynced = true; // NO I18N
				}
			}
			try {
				if(defaultOptions != undefined && defaultOptions.notifRegistered) {
					$("#gbox_" + gridTable.substring(1)).off("remove").on("remove", function () { //No I18N
						var url =window.OPM.apiUrlPattern + '/ncmclient/unregisterNotification?gridId='+gridTable.substring(1); //No I18N
						$.ajax({
				        	url: url,
				        	type: 'GET', //No I18N
				        	async:true,
				        	success: function(jsonData)
				        	{

				        	}
						});
					});
				}
			} catch (e) {
			
			}
			
			if(onSelectFunction === 'DEDiscoveryReport') {
				setTimeout(function() {
					var w = $('#gbox_DEDiscoveryReport').width();
					$('.ncmdiscoverysummary').css('width', w);
				}, 0);
			}
			$(gridTable).unbind("jqGridAfterLoadComplete").bind("jqGridAfterLoadComplete", function (e, data) {
				fixGridWidth($('#gbox_' + gridTable.substring(1)).closest('.opm_jqGridUI'), gridTable);
			});

			// TODO :: Fixing width of certain cols with shrinkToFit true
			/*try {
			    setTimeout(function () {
                    var colsWithFixedWidth = ['Device Name', 'Total Rule Result']; //No I18N
                    var gridColModel = grid.jqGrid("getGridParam", "colModel");
                    colsWithFixedWidth.forEach(function (colName) {
                        var colIndex = gridColModel.findIndex(c => c.name === colName);
                        console.log("colIndex for " + colName + " is " + colIndex);
                        if (colIndex !== -1) {
                            grid.jqGrid('setColProp', colName, { width: gridColModel[colIndex].width });
                            $(gridTable + 'th:eq(' + colIndex + ')').css("width", gridColModel[colIndex].width + "px");
                            $(gridTable + 'td:nth-child(' + colIndex + 1 + ')').css("width", gridColModel[colIndex].width + "px");
                        }
                    });
			    }, 2000);
			} catch(e) {}*/

			if (onSelectFunction === 'ComplianceReportGrid') {
                var resultId = fulldata.resultId;
                OPMClient.NCMComplianceListController.customReportDetails[OPMClient.ReportsDetailsController.ncmCustomReportId] = resultId;
            }

            // Disable row related handling
            if (defaultOptions && defaultOptions.isDisabledRow) {
                $("#"+onSelectFunction).find("tr.jqgrow").each(function () {
                    var tdElements = $(this).children("td");
                    var rowData = $('#'+onSelectFunction).jqGrid('getRowData', $(this)[0].getAttribute('id'));
                    var gridColModel = grid.jqGrid("getGridParam", "colModel");
                    if (rowData.isDisabled === 'true') {
                        for (var i = 0; i < tdElements.length; i++) {
                            var tdElement = $(tdElements[i]);
                            if (defaultOptions.skipDisableForColumns && defaultOptions.skipDisableForColumns.length > 0) {
                                var colName = gridColModel[i].name;
                                if (!defaultOptions.skipDisableForColumns.includes(colName)) {
                                    tdElement[0].classList = ['disabledBlock'];
                                }
                            } else {
                                tdElement[0].classList = ['disabledBlock'];
                            }
                        }
                    }
                });
            }
			
			// Updating filter selection in UI based on filter from API response
			if (['ComplianceAllRulesV2List', 'ComplianceAllRuleGroupsV2List'].includes(onSelectFunction)) {
				if (fulldata && fulldata.filter) {
					if (onSelectFunction === 'ComplianceAllRulesV2List') {
						OPMClient.NCMComplianceRulesController.set('selectedStandardFilter', fulldata.filter);
						OPMClient.NCMComplianceRulesController.set('isFilterValueSet', true);
					} else if (onSelectFunction === 'ComplianceAllRuleGroupsV2List') {
						OPMClient.NCMComplianceRuleGroupController.set('selectedStandardFilter', fulldata.filter);
						OPMClient.NCMComplianceRuleGroupController.set('isFilterValueSet', true);
					}
				}				
			}

            if(defaultOptions && defaultOptions.removeGridPagerActions) { // Remove only search and reload - ColChooser is not removed but hidden
                try {
                    $(gridNavigator + " .ui-pg-button[title='Find records']").remove();
                    $(gridNavigator + " .ui-pg-button[title='Reload Grid']").remove();
//                    $(gridNavigator + " .ui-pg-button[title='Choose columns']").remove();
                    $(gridNavigator + " .ui-pg-button[title='Choose columns']")[0].style.display = 'none'; // No I18N
                } catch (e) {}
            }

            // Footer fixed to bottom changes - setTimeout is used to ensure that the grid is fully rendered before applying height
            if(defaultOptions.fixFooterToBottom) {
                setTimeout(function() {
                    var mainTableBody = $('div.ui-jqgrid-bdiv').filter(function() {
                        return this.classList.length === 1;
                    });
                    if (mainTableBody.length) {
                        var topAvailHeight = $('.ui-jqgrid-hdiv')[0].getBoundingClientRect().bottom;
                        var pagerHeight = $('.ui-jqgrid-pager')[0].getBoundingClientRect().height + 16; // 16 is added for padding adjustments
                        var finalHeight = window.innerHeight - topAvailHeight - pagerHeight;
                        mainTableBody.css('height', finalHeight);
                    }
                }, 600);
            }
            if(gridTable.includes('DEAdvancedReportList') && fulldata.isEolConditionInvalid) {
                opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.eolSaleSupport.invalidCondition',this)); //No I18N
            }
            if(gridTable.includes('NCMHardwareCollectorList')) {
               OPMClient.NCMHardwareInfoController.isShareAcknowledge = fulldata.isShareAcknowledge;
               $('#hardwareCollectorAck').prop('checked', !!fulldata.isShareAcknowledge); //No I18N
            }
		}
	});
	jqgridHeaderHeight();
	var rightPixVal = '20px'; // No i18n
    var isInventoryGrids = onSelectFunction === "Devices" || onSelectFunction === "Configs" || onSelectFunction === "Changes" || onSelectFunction === "Drafts" || onSelectFunction === "Compliance" || onSelectFunction === "DGroupGrid" || onSelectFunction === "NonInventoryDevices" || onSelectFunction === "UnmanagedDevices"; //No I18N
    if(searchOption && !isInventoryGrids && defaultOptions.noHeaderSearchIcon != true){
		$(gridTable+"_searchIndex").show();
		$(gridTable+"_searchIndex").css({'width':'50px','position':'absolute','right':'0','top':'0','left':'auto','height':'36px'});
		if($(gridTable+"_searchIndex>div .jqSearchIcon").length===0 && !toggleSearch){
			$(gridTable+"_searchIndex>div ").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ncmToggleSearch(true,\''+(gridTable.replace("#", "#gview_"))+'\')" class="icon-search devsearchicon"></i></div>');
	        }
		else if($(gridTable+"_searchIndex>div .jqSearchIcon").length===0){
			$(gridTable+"_searchIndex>div ").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ncmToggleSearch(false,\''+(gridTable.replace("#", "#gview_"))+'\')" class="icon-search devsearchicon"></i></div>');
		}
	} else {
		rightPixVal = '0';
		}
	if(!defaultOptions.isSnapshotGrid) {
		$(gridTable+"_colChooserIndex").show();
		$(gridTable+"_colChooserIndex").css({'width':'40px','position':'absolute','right':rightPixVal,'top':'0','left':'auto','height':'36px'});
		$(gridTable+"_colChooserIndex>div ").append('<div><i id="colChooserIcon" onclick="openJQGridColChooser(\''+gridTable.replace("#","")+'\')" class="icon-table"></i></div>');
	}
	if(!defaultOptions.showColChooserIcon)
	{
		$(gridTable+"_colChooserIndex").hide();
		$(gridTable+"_colChooserIndex").css({'width':'40px','position':'absolute','right':rightPixVal,'top':'0','left':'auto','height':'36px'});
		$(gridTable+"_colChooserIndex>div ").append('<div><i id="colChooserIcon" onclick="openJQGridColChooser(\''+gridTable.replace("#","")+'\')" class="icon-table"></i></div>');
	}
	if (gridNavigator !== null || gridNavigator !== undefined || gridNavigator !== "")
		{
			//grid.jqGrid('navGrid', gridNavigator ,{ add: false, edit: false, del: false }); //No I18N
			grid.jqGrid('navGrid', gridNavigator ,{ add: addIcon, edit: false, del: delIcon , search: !defaultOptions.hidePagerSearchIcon,//No I18N
					addfunc: function(rowid)
					{

					 },
					 delfunc: function(rowid){
					  var rows = (""+rowid).split(',');

					  	var dataStr = new Array();
					  	var name = "";
					 	if (rows.length > 0 && apiUrl != "")
						{

	                        if(confirm(delMsg))
							{

		                        for(var r in rows)
		                        {
		                            var ret = grid.jqGrid('getRowData', rows[r]);
		                            if(ret[deleteName] !== undefined)
		                            {
												/*if(r != 0)
												dataStr += ","+ret[deleteName];
												else
												dataStr += ret[deleteName];*/
											dataStr.push(ret[deleteName]);
									}

	                        	}

	                        		 if(dataStr.length > 0)
	                        		 {
	                        		 	name = dataStr.toString();
	                        		 	var url = "";
	                        		 	if(deviceName === "" && deviceNameParameter === "") {
	                        		 		url = apiUrl+urlParameter+"="+name;//No I18N
	                        		 	}
	                        		 	else {
	                        		 		url = apiUrl+deviceNameParameter+"="+deviceName+"&"+urlParameter+"="+name;//No I18N
	                        		 	}

	                        		$.ajax({
											url: url, //No I18N
											type: 'POST', //No I18N
											success: function(response){
													var obj = response;
													var message = ""; //No I18N
													document.getElementById('resDiv').style.display = 'block'; //No I18N

													if (obj.error !== undefined)
													{
														document.getElementById('resDiv').style.backgroundColor = '#FF0000';
														message = obj.error.message;
													}
													if (obj.result !== undefined)
													{
														document.getElementById('resDiv').style.backgroundColor = '#00FF00';
														message = obj.result.message;
													}
													document.getElementById('resDiv').innerHTML = message;
													$("#resDiv").fadeOut(5000);

										              location.reload();
										        	  }

												});
	                        	}

                   	 }
                }

            }
               },
				{ /* edit options */ },{ /* add options */ },{ /* delete options */ },{ /* search options */
					sopt: ['eq', 'ne','bw','ew','cn', 'nc'] //No I18N
				}); //No I18N
		}
	}
//	if(searchOption)
//	{
//		$(gridTable).jqGrid('filterToolbar',{ stringResult: true, searchOnEnter: false, defaultSearch: 'cn'});
//		$(gridTable)[0].toggleToolbar();
//	}
	if(searchOption && toggleSearch)
	{
		$(gridTable).jqGrid('filterToolbar',
			{ stringResult: true, searchOnEnter: false, defaultSearch: 'cn', 
			afterSearch: function() {
				if(afterSearch) {
					OPMClient.ReportsDetailsController.gridPostData = $(gridTable).getGridParam("postData");
				}
			}
		});
		$(gridTable)[0].toggleToolbar();
		if(!isInventoryGrids) {
			$(".ui-search-toolbar").show();
		}
	}
	else if (searchOption && !toggleSearch)
	{
		$(gridTable).jqGrid('filterToolbar',
			{ stringResult: true, searchOnEnter: false, defaultSearch: 'cn', 
			afterSearch: function() {
				if(afterSearch) {
					OPMClient.ReportsDetailsController.gridPostData = $(gridTable).getGridParam("postData");
				}
			}
		});
		$(".ui-search-toolbar").hide();
	} else {
		$(".ui-search-toolbar").hide();
	}
	if(!defaultOptions.isSnapshotGrid && !defaultOptions.hideColChooser) {
		grid.jqGrid('navButtonAdd', gridNavigator, {   // No I18N
			caption: "",
			buttonicon: "ui-icon-calculator " + gridTable.replace("#","") + "_opmGridColChooser",   // No I18N
			title: Ember.I18n.t('webclient.grid.selectcolumn',this),   // No I18N
			jqModal : true,
			onClickButton: function (event)
			{
				var a = grid.width();
				grid.jqGrid('columnChooser',{    // No I18N
					dialog_opts: {
						modal: true,
						resizable: false,
						draggable: false,
						width: 250,
						position: {my: 'right top', at: 'right top', of: grid}// No I18N
					},
					done: function (perm) {
	                    if (perm) {
	                        this.jqGrid("setGridWidth", a);// No I18N
	                        var columnModelsT = this.jqGrid('getGridParam','colModel');// No I18N
	                        var colArray = new Array();
	                        for (var columnModelIndex = 0; columnModelIndex < columnModelsT.length; columnModelIndex++) {
	                            var columnModelT = columnModelsT[columnModelIndex];
	                            if (!columnModelT.hidden) {
	                            	colArray.push(columnModelT.name);
	                            }
	                        }
	                        if(colArray.length > 0) {
	                        	var NCMGridTableId = (defaultOptions.ncmgridTableID != null)?defaultOptions.ncmgridTableID:gridTable.substring(1);
	                        	var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridColumnChooser?GRID_ID='+NCMGridTableId + '&VISIBLE_COLUMNS='+JSON.stringify(colArray);//No I18N
		        		 		$.ajax(
								{
									url: url,
									type: 'POST', //No I18N
									async:false,
									success: function(response)
									{
										if(onSelectFunction === "Devices"  || onSelectFunction === "DEDevicesList") {
											$(gridTable).trigger('reloadGrid');
										}
										ncmInvJQGridHt();
									}
								});
	                        }
	                    } 
	                }
				});
				$('#colchooser_'+ gridTable.substring(1)+' > div').css('padding' , '0'); //No I18N
				$('#colchooser_'+ gridTable.substring(1) + ' option').mousedown(function(e) { // No I18N
				    e.preventDefault();
				    $(this).prop('selected', !$(this).prop('selected'));
				    return false;
				});
			}
		});
	}
}

function fixGridWidth(gridParent, grid) {
	if ($(gridParent).closest('.fixGridWidth').length > 0 && $(gridParent).closest('.ui-subgrid').length > 0) {
		$(grid).jqGrid("setGridWidth", $(gridParent).closest('.subgrid-data').width() - 2, true);
		grid = $(gridParent).attr('id');
		grid = "#" + grid.substring(0, grid.lastIndexOf('_'));
		gridParent = $(gridParent).closest('.fixGridWidth');
	}
	
	if($(gridParent).hasClass('fixGridWidth')) {
		$(grid).jqGrid("setGridWidth", $(gridParent).width() - 2, true);
	}
}

function ncmInvJQGridHt()
{
	var jqGridWidth = $(".ui-jqgrid-hbox").height();
	$("#opm_Devices").closest('.ui-jqgrid-bdiv').attr('style','top: '+jqGridWidth+'px !important');
	$("#opm_Devices").closest('.ui-jqgrid-bdiv').css('height','auto'); //No I18n
	
	}
//IgnoreI18N_End
function ncmToggleSearch(enable, gridTable)
{
	if(enable)
	{
		 $('.ui-jqgrid-view').addClass('gridSearchActive');
		$(gridTable+" .ui-search-toolbar").show();
		$(gridTable+" #searchIcon").attr("onclick","ncmToggleSearch(false,\""+gridTable+"\")");
	}
	else
	{
		 $('.ui-jqgrid-view').removeClass('gridSearchActive');
		$(gridTable+" .ui-search-toolbar").hide();
		$(gridTable+" #searchIcon").attr("onclick","ncmToggleSearch(true,\""+gridTable+"\")");
	}
	if(pageName && pageName=="NCMInventory_Devices" && gridTable.indexOf("NCMDevChangeList")>=0){
        $('#gview_opm_Devices').removeClass('gridSearchActive');
	}
}
function redirectToConfigGroupSnapshot(page) {
	if(page!==undefined && page!=="") {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDGroup/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/"+page; //No I18N
	} else {
		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/ConfigDGroup/"+OPMClient.InventoryDeviceDetailsController.selDevice; //No I18N
	}
}

//IgnoreI18N_Start
// ----------- NCM Zohho Starts starts here -------------- //
function ncmZChart(arrayObj)
{
    var dataarr=[];
    var elementIDarr=[];
    var chartID;
    var jsonDataValues = [];
    
    $.each(arrayObj.chartobj,function(ind,val)
    {
        chartID = val.id;
        var tempobj=ncm_customChartObject(val);
        dataarr.push(tempobj);
        var wid = (val.width !== undefined ? val.width : "95%");
        try{
            d3.select('#'+chartID).selectAll('rect').remove();
            d3.select('#'+chartID).select('svg').selectAll('*').remove();
            d3.select('#'+chartID).selectAll('*').remove();
        }
        catch(err){
            var errMsg = err;
        }
        $("#"+val.id).html('<div class="container" id="zcContain_'+val.id+'" style=" height: '+val.height+'px;width: '+wid+';"></div>'); // //create chart element 
        $("#zcContain_"+val.id).addClass((val.customClass !== undefined ? val.customClass:""));//   
        jsonDataValues.push(val.jsonData);
    });

    $.each(arrayObj.placeholder,function(ind,val)
    {
        elementIDarr.push(document.getElementById('zcContain_'+val));
    });
    var zobj=new $ZC.charts(elementIDarr, dataarr);
    $('.d3container .canvas-component .xychart .nodatahandler').closest('.graph-divs-small-blkgrad').addClass('zChartNoData');
    var test = setInterval(function(){
        if(zobj.chartRendered === true){
            clearInterval(test)
            window.canvasLoded = true;
        }
    }, 1000/60)
}

function ncm_customChartObject(chartObj)
{
	var data = {};
	data.canvas = {
		"title" : {},
		"subtitle" : {},
		"border" : {},
		"shadow" : {}
	};// 

	if (chartObj.noDataHandler !== undefined) {
		data.noDataHandler = chartObj.noDataHandler;
	} else if(chartObj.noDataText != undefined) {
		data.noDataHandler = {"text": chartObj.noDataText};
	} else {
		data.noDataHandler = {"text": "No Data"};
	}

	if (chartObj.canvas === undefined) {
		chartObj.canvas = {
			title : {}
		}
	}
	data.canvas.title.show = (chartObj.canvas.title.show !== undefined ? chartObj.canvas.title.show
			: false);
	data.canvas.title.text = (chartObj.canvas.title.text !== undefined ? chartObj.canvas.title.text
			: "");// 
	data.canvas.title.hAlign = (chartObj.canvas.title.hAlign !== undefined ? chartObj.canvas.title.hAlign
			: "left");// 
	data.canvas.title.vAlign = (chartObj.canvas.title.vAlign !== undefined ? chartObj.canvas.title.vAlign
			: "top");// 
	data.canvas.subtitle.show = false;
	data.canvas.subtitle.text = "";// 
	data.canvas.border.show = false;
	data.canvas.shadow.show = false;
	data.canvas.background = {
		"alpha" : 0
    };
    if(chartObj.canvas.background!= undefined && chartObj.canvas.background.color !== undefined){
        data.canvas.background.color = chartObj.canvas.background.color ;
    }
    if(chartObj.canvas.shadow != undefined && chartObj.canvas.shadow.color !== undefined){
        data.canvas.shadow.color = chartObj.canvas.shadow.color;
        data.canvas.shadow.show = true;
	}
    if(chartObj.canvas.border != undefined && chartObj.canvas.border.color !== undefined){
        data.canvas.border.color = chartObj.canvas.border.color ;
        data.canvas.border.show = true;
    }
    if(chartObj.canvas.theme !== undefined){
        data.canvas.theme = chartObj.canvas.theme;
    }
	data.seriesdata = {
		"type" : chartObj.type
	}

	if (chartObj.series !== undefined && chartObj.series === 'single') {
		data.seriesdata.chartdata = [ {
			"yaxiscolumnorder" : [// 
			0 ],
			"data" : [ chartObj.jsonData ]
		// dataindex in the metadata.columns refers this index of the array
		} ]
	} else if (chartObj.series !== undefined && chartObj.series === 'multi') {
		data.seriesdata.chartdata = chartObj.jsonData;
	} else {
		data.seriesdata.chartdata = [ {
			"yaxiscolumnorder" : [// 
			0 ],
			"data" : [ chartObj.jsonData ]
		// 
		} ]
	}
	
	if (chartObj.canvas === undefined) {
		chartObj.canvas = {
			title : {}
		}
	}

	var timeObj = {
		"subfunction" : "ABSHOUR",// 
		"specifier" : "HH"// 
	};// 
	if (chartObj.columns.timeFormat !== undefined) {
		var frmt = (timePeriodformat[chartObj.columns.timeFormat] !== undefined ? timePeriodformat[chartObj.columns.timeFormat]
				: 'hours');// 
		timeObj.subfunction = timeFormatObj[frmt].subfunction;
		timeObj.specifier = timeFormatObj[frmt].specifier;
	}

	var timePatrnStr = window.OPM.pattern;
	if (window.OPM.pattern.match(/d/g) !== null
			&& window.OPM.pattern.match(/d/g).length === 1) {
		timePatrnStr = (timePatrnStr).replace('d', 'dd');// 
	}

	if (window.OPM.pattern.match(/M/g) !== null
			&& window.OPM.pattern.match(/M/g).length === 1) {
		timePatrnStr = (timePatrnStr).replace('M', 'MM');// 
	}
	if (window.OPM.pattern.match(/h/g) !== null
			&& window.OPM.pattern.match(/h/g).length === 1) {
		timePatrnStr = (timePatrnStr).replace('h', 'hh');// 
	}

	timePatrnStr = timePatrnStr.replace(/yy/gi, "YY");// 

	var format = {
		"suffix" : (chartObj.columns.suffix !== undefined ? chartObj.columns.suffix: "")
	}

	if (chartObj.columns.format != null) {
		chartObj.columns.format = format;
	}
	
	
	

    if(chartObj.axes == undefined) {
		var axesD = {
            "x" : [ 0 ],//No I18N
            "y" : [ [ 1 ] ],//No I18N
            "clr" : [ chartObj.clr===undefined?2 : chartObj.clr ],//No I18N
            "tooltip" : (chartObj.tooltip !== undefined ? chartObj.tooltip : ["{{val(0)}} : {{val(1)}}"])//No I18N
		}
		chartObj.axes = axesD;
	}
	
	data.metadata = {
        "columns" : chartObj.columns,//No I18N
        "axes" : chartObj.charType==='heatMapChart' || chartObj.subType==='multiLineArea' ?chartObj.metadata.axes:chartObj.axes//No I18N
	}
//	if(chartObj.metadata){
//	    data.metadata = chartObj.metadata;
//	}
	data.tooltip={"backgroundColor": "#000000"};
	data.chart = ncm_chartPlotOptions(chartObj);
	data.chart.brush =  {
		"enabled":true,//No I18N
		"type":"xy", //NO I18N
		"resetButton":{//NO I18N
	      	"label":{//NO I18N
	          "text":"Reset Zoom",//NO I18N
	            "fontSize":11//NO I18N
	        },
	        "border":{//No I18N
	            "radius":6//NO I18N
	        },
	        "fillColor": "grey"//NO I18N
	    },
	    "selectionArea": {//NO I18N
            "fillColor": "grey",//NO I18N
            "strokeColor":"grey",//NO I18N
            "dashStyle":"shortdash"//NO I18N
        }
	}

	if (chartObj.legend == undefined) {
		var leg = {
			"colorBox" : {
				"shape" : "circle",
				"strokeOpacity" : 1
			},
			"fontFamily" : "'LatoRegular'",
			"colors" : fluidicv2,
			"fontSize" : 16
		}
		data.legend = leg;

	} else {
		if (chartObj.legend.colors === undefined) {
			chartObj.legend.colors = fluidicv2
		}
		data.legend = chartObj.legend;
	}
	data.legend.tooltip = "true";// 
    data.tooltip = chartObj.majortooltip!==undefined?chartObj.majortooltip:data.tooltip;
    if(chartObj.notes !== undefined){
        data.notes = chartObj.notes;
    }
	return data;
}

function ncmzChartForRealTime(obj)
{
    var tempobj=opm_customChartObject(obj);
    $("#"+obj.id).html('<div class="container" id="zcContain_'+obj.id+'" style=" height: '+obj.height+'px;width: 95%;"></div>'); // //create chart element 
    $("#zcContain_"+obj.id).addClass((obj.customClass !== undefined ? obj.customClass:""));//   
   var element = document.getElementById('zcContain_'+obj.id);
    tempobj.legend.hAlign = 'center'; 
    tempobj.legend.vAlign = 'bottom'; 
    tempobj.chart.plot.plotoptions.line.marker.enabled=false;
    tempobj.chart.plot.plotoptions.line.marker.size=1;
    var zobj = new $ZC.charts(element, tempobj);
    return zobj;
}

function ncm_chartPlotOptions(chartObj)
{
    var innerLabel = false;
    if(chartObj.pie !== undefined && chartObj.pie.innerLabel !== undefined)
    {
        innerLabel = chartObj.pie.innerLabel;
    }

    var stacked = true;
    if(chartObj.stacked !== undefined)
    {
        stacked = chartObj.stacked;
    }

    var levelMarker = false;
    if(chartObj.levelMarker !== undefined)
    {
        levelMarker = chartObj.levelMarker;
    }

    var marker = true;
    if(chartObj.marker !== undefined)
    {
        marker = chartObj.marker;
    }

    var axes = true;
    axes = (chartObj.axes !== undefined && chartObj.axes.show !== undefined ? chartObj.axes.show : true);

    

    var chart = {
	        "plot": {
	            "plotoptions": {}
	    }
	};
	var plotoptions = {};
	if(chartObj.plotoptions != undefined) {
		plotoptions = chartObj.plotoptions;
	} else {
		switch(chartObj.type)
		{
		    case "pie":
		                
		    	plotoptions = {pie:{}}
			    if(chartObj.subType === "simplePie")
			    {
			    	plotoptions = {
		    		   "pie": {
		    			   "gradients": {},
		    			   "outerPadding": "0",
		    			   "sliceOutHeight": "3"
		    		   }
			       }
			    }
			    else if(chartObj.subType === "simpleDonut")
			    {
			    	plotoptions =  {"pie": {"outerPadding": "10", "sliceOutHeight": "3"}};
			    	plotoptions.pie.innerRadius = ((chartObj.pie !== undefined && chartObj.pie.innerRadius !== undefined)?chartObj.pie.innerRadius:"65%");
			
			    }
			    else if(chartObj.subType === "semiDonut")
			    {
			    	plotoptions =  
			       {
		    		   "pie": { 
		    			   "innerRadius": "50%",
	                        "startAngle": -1.57,
	                        "endAngle": 1.57,
	                        "datalabels": {
	                            "show": true,
	                            "type": "circular"
	                        }
		                }
	                }
	    		}
			
			    plotoptions.pie.datalabels = {"innerLabel":{"show":innerLabel,"showAs": "y"}};
			    plotoptions.pie.maxRadius = ((chartObj.pie !== undefined && chartObj.pie.maxRadius !== undefined)?chartObj.pie.maxRadius:"250");
			    plotoptions.pie.strokeWidth = ((chartObj.pie !== undefined && chartObj.pie.strokeWidth !== undefined)?chartObj.pie.strokeWidth:"1");
			    plotoptions.pie.outerPadding = ((chartObj.pie !== undefined && chartObj.pie.outerPadding !== undefined)?chartObj.pie.outerPadding:"10");
                if(chartObj.subType === 'newPie'){
                    var animationVal = {//No I18N
                        "easingType": "back-out",//No I18N
                        "type": "inner"//No I18N
                    };
                    plotoptions = {
                        "pie": { //No I18N
                            "innerRadius": "50%",//No I18N
                            "strokeColor": "transparent",//No I18N
                            "datalabels": {//No I18N
                                "type": "doubleside",//No I18N
                                "showAs": "y",//No I18N
                                "line": {//No I18N
                                    "strokeColor": null,//No I18N
                                    "strokeWidth": null//No I18N
                                }
                            }
                        }
                    };
                    if(chartObj.totalCount !== 0)
                    {
                        plotoptions.pie.animation = animationVal;
                    }
                    chart.fontSize = chartObj.fontSize;
                }
			break;
		case "area":
			plotoptions = {
		        area:{}
		    };
		    if(chartObj.subType === "smootharea")
		    {
		    	plotoptions.area = {
		    		"mode": "cardinal",
		    		"animation": {
		    			"type": "pointTween"
		    		}
		    	}
		    }else if(chartObj.subType === "steparea")
		    {
		    	plotoptions.area = {
		    		"mode": "step-before",
		    		"animation": {
		    			
		    		},
		    		"stacked": {
		    	        "enabled": stacked
		    	    },
		    	    "marker": {
		    	        "enabled": marker,
		    	        "size": 1,
		    	        "innerStrokeWidth": 0,
		    	        "outerStrokeWidth": 1,
		    	        "outerFillColor": "white",
		    	        "outerStrokeOpacity": 0,
		    	        "innerFillColor": null
		    	    }
		    	}
		    }else if(chartObj.subType === "multiLineArea"){
		         plotoptions.area = {
                    "fillOpacity": 0.1,
                    "strokeWidth": 3,
                    "marker": {
                        "enabled": marker,
                        "size": 2,
                        "innerStrokeWidth": 0,
                        "outerFillColor": "white",
                        "outerStrokeOpacity": 0.1
                    }
                }
		    }
		    else {
		    	plotoptions.area = {
		                        "fillOpacity": 0.3,
		    		    "stacked": {
		    		        "enabled": stacked
		    		    },
		    		    "marker": {
		    		        "enabled": marker,
		    		        "size": 1,
		    		        "innerStrokeWidth": 0,
		    		        "outerStrokeWidth": 1,
		    		        "outerFillColor": "white",
		    		        "outerStrokeOpacity": 0,
		    		        "innerFillColor": null
		    		    }
		    		}
		    }
		    break;
		case "line":
			plotoptions = {
		        "line": {
		            "stacked": {
		                "enabled":stacked
		            },
		            "marker": {
		                "enabled": "true"
		            }
		        }
		    }
		    if(chartObj.subType === "step-after") {
		    	plotoptions.line.mode="step-after";
			}
		    break;
		case "bar":
			plotoptions = {
		        "bar": {
		            "levelMarker": {
		                "enabled": levelMarker
		            },
		            "stacked": {
		                "enabled": stacked
		            }
		        }
		    }
		    break;
		case "dial":
		    if(chartObj.subType === "simpleDial")
		    {
		    	plotoptions = {
		            "dial": {
		                "outerPadding": 50
		            }
		        }
		    }
		    else if(chartObj.subType === "gaugeDial")
		    {
		    	plotoptions = {
		            "dial": {
		                "startAngle": -3.14,
		                "endAngle": 3.14,
		                "innerRadius": "75%",
		                "maxRange": 100,
		                "needle": {
		                    "show": false,
		                    "width": 10,
		                    "padding": 5
		                },
		                "minmaxlabels": {
		                    "show": false
		                }
		            }
		        }
		    }
		    break;   
		case 'packedbubble':    plotoptions = {
		                            packedbubble: {
		                                mode: "flat",
		                                    interPadding: 1,
		                                    fillOpacity: 0.6
		                                }
		                            }
		                            break;
		    default: break;
		} 
	}
	
	if(chartObj.axes == undefined) {
		chart.axes = {
	        "xaxis": {
	        "label": {
	            "text": "",
	            "show": "false"
	        },
	         "ticklabel": {
	            "rotation": "auto"
	        },
	        "show":axes
	    },
	    "yaxis": [
	        {
	            "label": {
	                "text": "",
	                "show": "false"
	            },
	            "show": axes
	            }
	        ]
	    }
	
	} else {
		chart.axes = chartObj.axes;
	}
	
	if(chartObj.type === 'bar' && chartObj.bar !== undefined && chartObj.bar.rotated !== undefined)
	{   
	
	    chart.axes.rotated = chartObj.bar.rotated;
	}
	if(chartObj.type === 'pie' && chartObj.margin != undefined)
	{   
		chart.marginTop = chartObj.margin;
		chart.marginRight = chartObj.margin;
		chart.marginBottom = chartObj.margin;
		chart.marginLeft = chartObj.margin;
	}
	
	if(chartObj.chart !== undefined && chartObj.chart.marginLeft !== undefined)
	{   
	
	    chart.marginLeft = chartObj.chart.marginLeft;
	}
	
	chart.plot.plotoptions = plotoptions;
	
	if(chartObj.events != null) {
		chart.plot.events = chartObj.events;
	}
	
	if(chartObj.datalabels != undefined) {
		chart.plot.datalabels = chartObj.datalabels;
	}
	
	if(chartObj.plot !== undefined) {
	    if(chartObj.plot.events !== undefined) {
	        chart.plot.events = chartObj.plot.events;
	    }
	    if(chartObj.plot.animation !==undefined){
	        chart.plot.animation = chartObj.plot.animation;
	    }
	}
	
	return chart; 
}

function ncm_pingDevice(MainElement,element,deviceName)
{
		var data = {

		};
		
		data.IPADDRESS = deviceName;

		var url = window.OPM.apiUrlPattern + "/ncmsettings/pingCheck";//No I18N
		$.ajax(
		{
			url: url,
			type: 'POST', //No I18N
			dataType:'json', //No I18n
			data: data,
		//	async:false,
			success: function(response)
			{
				MainElement.removeClass('loading').addClass('success');
				
				if(response.PING_STATUS !== undefined && response.PING_STATUS != false)
				{
					content = (response.PING_RESULT).replace(/\n/g, '<br />'); //No I18N
				}
				else
				{
					MainElement.removeClass('loading').addClass('error');
					content = (response.error !== undefined) ? response.error.message : (response.statusMsg !== undefined ? response.statusMsg : response.PING_RESULT);
				}

				if(element[0] !== undefined && document.getElementById(element[0].id) !== null)
				{
					element.html(content);
				}
			}
		});

}
function redirectFromGettingStarted(redirecturl, stsstr) {
	ncmusrsts1(stsstr);
	location.href=redirecturl;
}

function ncmusrsts1(stsstr) {
	try {
		if(window.OPM.isEvalUser) {
			var data={};
			data.pageId = encodeURIComponent(stsstr);
			var url = window.OPM.apiUrlPattern + "/ncmclient/usrsts1";//No I18N
			$.ajax(
			{
				url: url,
				type: 'POST', //No I18N
				dataType:'json', //No I18n
				data: data,
				async:true,
				success: function(response)
				{}
			});
		}
	} catch (e) {
		// TODO: handle exception
	}
}

function getConfigletExecPDF(pdfURL)
{
	if(location.href.indexOf('RESTHistory') != -1){
    	pdfURL = pdfURL.replace('=CustomTemplateResultView','=RestApiCustomTemplateResultView');//No I18N
    }
	OPMClient.ReportsDetailsController.EXPORT_PDF_LINK=pdfURL;
	generateNCMConfigletExecPDFReport();
//	OPMClient.ReportsDetailsController.EXPORT_PDF_LINK='';
}

function editGroupColumnRenderer(cellValue, options, rowdata, action) {
    if(rowdata[1] == "All Devices Group" || (rowdata[13] == true || rowdata[13] == 'true')) {
        return "";
    } else {
        return "<i title='" + Ember.I18n.t("webclient.action.edit", this) + "' onclick='OPMClient.Inventory.editDeviceGroup(\"" + cellValueEscapeFormat(rowdata[0]) + "\", \"" + cellValueEscapeFormat(rowdata[1]) + "\")' class='icon-configedit'></i>" // No I18N
    }
};

function updateDiscoveryReportSummary(notificationData, flag) {
	var profileID = notificationData["PROFILEID"];
	if(window.location.href.indexOf("Settings/Discovery/NCMDiscovery/"+OPMClient.NCMDiscoverySettingsController.selectedTab+"/Progress/" + profileID) != -1) {
		ncm_getDiscoveryInfo(profileID);
	}
}

function attachZeroToSingleDigitWholeNumber(n) {
	if(isNaN(n)) {
		return n;
	}
	if(n >= 0 && n < 10) {
		n = '0' + n;
	}
	return n;
}
function cliNCMCredentialKeyUp(THISDOM, promptDom) {
	var componentID = $(THISDOM).attr("id");

	if(componentID != null) {
		componentID = componentID+"_div";
		enableOrDisableDiv(componentID, false);
	}
	if($("#"+promptDom).val().trim() == ''){
		if($(THISDOM).val() != '') {
			if('telnetPrompt' == promptDom) {
				$("#"+promptDom).val('>');
			} else if('telnetEnablePrompt' == promptDom) {
				$("#"+promptDom).val('#');
			} else {
				$("#"+promptDom).val('>|#');
			}
		}
	}
}

function generateNCMConfigletCSV(pdfURL)
{
    if(location.href.indexOf('RESTHistory') != -1){
        pdfURL = pdfURL.replace('=CustomTemplateResultView','=RestApiCustomTemplateResultView');//No I18N
    }
	var url =window.OPM.apiUrlPattern + '/ncmreports/NCMReportCSVGenerator?'+pdfURL.substr(1); //No I18N
	url = appendMSPDetails(url);
	url = appendEEProbeIdForUnifiedConsoleView(url);
	location.href = appendNCMProbeDetails(url);
}

function generateNCMConfigletXLS(pdfURL)
{
    if(location.href.indexOf('RESTHistory') != -1){
        pdfURL = pdfURL.replace('=CustomTemplateResultView','=RestApiCustomTemplateResultView');//No I18N
    }
	var url =window.OPM.apiUrlPattern + '/ncmreports/NCMReportXLSGenerator?'+pdfURL.substr(1); //No I18N
	url = appendMSPDetails(url);
	url = appendEEProbeIdForUnifiedConsoleView(url);
	location.href = appendNCMProbeDetails(url);
}

function generateNCMConfigletText(pdfURL)
{
    if(location.href.indexOf('RESTHistory') != -1){
        pdfURL = pdfURL.replace('=CustomTemplateResultView','=RestApiCustomTemplateResultView');//No I18N
    }
	var url =window.OPM.apiUrlPattern + '/ncmreports/NCMReportTextGenerator?'+pdfURL.substr(1); //No I18N
	url = appendMSPDetails(url);
	url = appendEEProbeIdForUnifiedConsoleView(url);
	location.href = appendNCMProbeDetails(url);
}

/* NCMEE related Methods Starts */

function appendNCMProbeDetailsToURL(xhr, settings) {
	settings.url = appendNCMProbeDetails(settings.url);
}

function ncmDEComboChanged() {
	var selectedProbe = $('.ncmDEColCombo').val();
	var moveAhead = 1;
	if(selectedProbe != -1) {
		if(!getProbeStatus(selectedProbe)){
			moveAhead = 0;
		}
	}
	if(moveAhead != 1) {
		if(moveAhead == 0) {
			opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncmee.probeSelector.probe.disabled.title", this)); //No I18N
		} else {
			opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncmee.probeSelector.probe.status.unknown", this)); //No I18N
		}
		loadNCMProbeList();
		return;
	}
	if(selectedProbe == ncmGetSelectedProbe()) {
		return;
	}
	ncmSetSelectedProbe(selectedProbe); //No I18N
	var isCustomAlarm = OPMClient.AlarmDetailsController.get("isCustomAlarm");//No I18N
	if(isCustomAlarm) {
		location.href = window.OPM.apiclientUrl + 'Alarms/Alarm/Active'; //No I18N
	}
	if(ncmGetSelectedProbe() == -1) {
		if(location.href.endsWith('dashboard.name.nwconfig')) {
			location.href = window.OPM.apiclientUrl + 'Home/Dashboard/NCM/dashboard.name.nwconfigee'; // No I18N
		}
	} else {
		if(location.href.endsWith('dashboard.name.nwconfigee')) {
			location.href = window.OPM.apiclientUrl + 'Home/Dashboard/NCM/dashboard.name.nwconfig'; // No I18N
		}
	}
	location.reload(false);
}

if(window.OPM.isValidEEInstallation && window.OPM.isCentralServer)
{
	$.ajaxSetup({
		beforeSend: function(xhr,settings) {
			appendNCMProbeDetailsToURL(xhr, settings);
		}
	});
}

function loadNCMProbeList()
{
	if(!window.OPM.isNCMEE || !window.OPM.isCentralServer) {
		return;
	}
	
	var selProbe = ncmGetSelectedProbe();
	 
	if(selProbe == undefined || selProbe == null) {
		selProbe = "-1"; 
		ncmSetSelectedProbe(selProbe);
	}
	
	$.ajax({
		url: window.OPM.apiUrlPattern + '/ncmsettings/ncmeeListProbes', //No I18N
		type: 'GET', //No I18N
		async:false,
		success: function(jsonResp)
   		{
   			var Options="<option value='-1'>"+Ember.I18n.t('webclient.ncmee.probeSelector.collectiveData.title')+"</option>";
   			OPMClient.NCMInventoryConfigSearchController.probeFilter.push({id: -1, name: Ember.I18n.t('webclient.ncmee.probeSelector.collectiveData.title')});
   			var map = jsonResp.probeList;
   			if(map != null && map != undefined) {
   				var prop = {Up: 0, Down: 0};
	   			for(var key in map) {
	   			    var displayName = map[key].displayName;
	   			    OPMClient.NCMInventoryConfigSearchController.probeFilter.push({id: key, name: displayName});
	   				if(map[key].status == "true" || map[key].status == true) {
	   					Options += "<option value='"+key+"'>"+displayName+"</option>"; //No I18n
	   					prop.Up++;
	   				} else {
	   					Options += "<option value='"+key+"' disabled title = '" + Ember.I18n.t("webclient.ncmee.probeSelector.probe.disabled.title") + "'>"+displayName+"</option>"; //No I18n
	   					prop.Down++;
	   				}
				}
				$(".ncmDEColCombo").html(Options);
				$('.ncmDEColCombo').val(selProbe).prop('selected',true); //No I18n
				$('.select2').select2()
   			} else {
   				opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncmee.probeSelector.probe.status.unknown", this)); //No I18N
   			}
		}
	});
}

function updateNCMEEProbeStatus(notificationData, flag) {
	loadNCMProbeList();
}

function ncmProbeDeleted(probeName) {
	if(ncmGetSelectedProbe() == probeName) {
		$('.ncmDEColCombo').val(-1);
		ncmDEComboChanged();
	}
}

function getProbeForDevice(selDevice){
	var selectedProbe = "";
	$.ajax({
        url: window.OPM.apiUrlPattern +'/ncmsettings/ncmeeGetProbeForDevice?DEVICE_ID=' + selDevice, //No I18N
        type: 'GET',//No I18N
        dataType: 'json',//No I18N
        async:false,
        success: function(jsonData) 
        {
        	selectedProbe = jsonData.ProbeName;
        }
    });
	return selectedProbe;
}

function getProbeStatus(probeName){
	var data={};
	var status = 0;
	data.selectedProbe = probeName;
	var url = window.OPM.apiUrlPattern + "/ncmsettings/ncmeeGetProbeStatus";//No I18N
	$.ajax(
	{
		url: url,
		type: 'GET', //No I18N
		dataType:'json', //No I18n
		data: data,
		async:false,
		success: function(response) {
			if(response.isSuccess) {
				if(response.SERVERSTATUS != true && response.SERVERSTATUS != 'true') {
					status = 0;
				}else{
					status = 1;
				}					
			} 
		}
	});
	if(status == 0){
		return false;
	}else{
		return true;
	}
}

function getProbeDetailsForDevice(selDevice) {
	var data={};
	var status = 0;
	data.DEVICE_ID = selDevice;
	var url = window.OPM.apiUrlPattern + "/ncmsettings/ncmeeGetProbeDetailsForDevice";//No I18N
	var probeDetails = null;
	$.ajax(
	{
		url: url,
		type: 'GET', //No I18N
		dataType:'json', //No I18n
		data: data,
		async:false,
		success: function(response) {
			if(response.isSuccess) {
				probeDetails = response;				
			} 
		}
	});
	return probeDetails;
}

function setNCMEEProbeVars(selDevice){
	if(window.OPM.isValidEEInstallation && ((window.OPM.isCentralServer && !window.OPM.isProbeSelected) || window.OPM.isMSPCentral)) {
		var probeDetails = getProbeDetailsForDevice(selDevice);
		var probeStatus = probeDetails != null && (probeDetails.SERVERSTATUS == true || probeDetails.SERVERSTATUS == 'true');
		if(probeStatus){
			if(window.OPM.isMSPCentral) {
				mspCustomerSetup(probeDetails.CUSTOMERID, probeDetails.PROBEID);
			} else {
				OPMClient.NCMEEController.forceAppendNCMProbeID = true;
				OPMClient.NCMEEController.deviceIDForProbeSelection = selDevice;
				OPMClient.NCMEEController.probeName = probeDetails.PROBENAME;
				OPMClient.NCMEEController.probeID = probeDetails.PROBEID;
			}
			return true;
		}
		var	cls = "errorMsg"; //No I18N
		var msg = Ember.I18n.t("webclient.ncmee.probeSelector.probe.disabled.title", this); //No I18N
		opm_infoMsgs(cls,msg);
		return false;
	}
	return true;
}

function displayDGNote(){
	var isDistribute = $('#DISTRIBUTE_TO_PROBES').prop("checked");
	var subGroupElement = document.getElementById('selectSubGroupDiv');
	if((isDistribute == true || isDistribute == "true") && (subGroupElement && subGroupElement.style.display == 'block')){
		$('#NCMEEDGNote').css('display','block');
	}else{
		$('#NCMEEDGNote').css('display','none');
	}
}

function ncmeeProbeSelection(selection){
	if(selection == 'allProbes'){
		$('#selectGroupDiv1').hide();
	}else if(selection == 'specificProbes'){
		$('#selectGroupDiv1').show();
	}
}
/* NCMEE related Methods Ends */

/* NCM Firmware Vulnerability Related Methods Starts */
function firmwareVulScheduleUpdateStaus(jsonData)
{
	if(jsonData.isSchedule != undefined && jsonData.isSchedule === true)
	{
        $('#syncVulnData').addClass('btn-disabled')//No I18N
        $('#importVulnData').addClass('btn-disabled')//No I18N
        $('#syncVulnData').attr("style", "pointer-events: none;");//No I18N
        $('#importVulnData').attr("style", "pointer-events: none;");//No I18N
        $('#spinUpdateFV').show();//No I18N
        $('#lastUpdateTime').text(Ember.I18n.t('webclient.ncm.tab.vulnerability_db_update_inprogress', this));//No I18N
        $('#lastUpdateStatus').text('--');//No I18N

	}
}

function updateFirmwareVulSyncStatus(jsonData, isUpdateDetails) {
    if(jsonData.status === 'CONNECTION_FAILURE')//No I18N
	{
        $('#lastUpdateStatus').html(FirmVulnupdateDbResultFormatter("FAILURE"));//No I18N
        OPMClient.NCMShowMessageController.set("showSyncFailureNote",true);
        if(jsonData.showMsg !== undefined && jsonData.showMsg === true)
        {
            opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.stratus.connection_failure", this)); //No I18N
        }
	}
    else
    {
        $('#lastUpdateStatus').html(FirmVulnupdateDbResultFormatter(jsonData.status));//No I18N
        if(jsonData.status === 'SUCCESS'){
        	OPMClient.NCMFirmwareVulnerability.lastDBUpdateTime = jsonData.lastUpdatedTime;//No I18N
        }
        if(!window.OPM.isNCM){
            OPMClient.Inventory.updateConfigTabCount();
        }
    }
    $('#lastUpdateTime').text(OPMClient.NCMFirmwareVulnerability.lastDBUpdateTime);//No I18N
    $('#spinUpdateFV').hide();//No I18N
    $('#syncVulnData').removeClass('btn-disabled');//No I18N
    $('#importVulnData').removeClass('btn-disabled');//No I18N
    $('#syncVulnData').removeAttr('style');//No I18N
    $('#importVulnData').removeAttr('style');//No I18N
    if(isUpdateDetails === undefined)
    {
    	setTimeout(function () {
            OPMClient.NCMFirmwareVulnerability.updateLastUpdateFVDetails();
        },3000);
    }
}

function updateCveSearchToolPage(jsonData) {
    $("#searchStatusText .totalCount").text(jsonData.totalCve);//No I18N
    if(jsonData.isProcessCompleted != undefined && jsonData.isProcessCompleted === true)
    {
        opm_infoMsgs("successMsg",Ember.I18n.t('webclient.snapshot.config.search.completed', this));//No I18N
        if(OPMClient.NCMFirmwareVulnerability.searchToolGridData.size === 0)
        {
            $('#cveDetailsList').html('<div style="margin-left: 670px;margin-top: 5%;">'+Ember.I18n.t('webclient.jqgrid.no.data.found',this)+'</div>');//No I18N
        }
        return;
    }
    var gridData  = jsonData.gridList;
    var keysList = jsonData.cveList;
    var len = keysList.length;
    for(var i=0; i<len ; i++)
    {
        var key = keysList[i];
        OPMClient.NCMFirmwareVulnerability.searchToolGridData.set(key,gridData[key]);
    }
    $("#searchStatusText .matchesFound").text(jsonData.processedCount);//No I18N
    $("#searchStatusText .progress").text(OPMClient.NCMFirmwareVulnerability.searchToolGridData.size);//No I18N
    var list = [];
    if(jsonData.isReloadGridNeeded != undefined && jsonData.isReloadGridNeeded === true)
    {
        OPMClient.NCMFirmwareVulnerability.searchToolGridData.forEach(function(value, key) {
          	var cveAffectedProductDetails = value;
            var map = {};
            map.CVEID = key;//No I18N
            map['AFFECTED PRODUCTS']=cveAffectedProductDetails;//No I18N
            list.push(map)
        });
        OPMClient.NCMFirmVulnAdvCveSearchController.loadAdvancedCveSearchPage(list);
    }

}

function updateImportVulDataProgress(jsonData) {
    $('#spinUpdateFV').hide();//No I18N
    $('#syncVulnData').removeClass('btn-disabled');//No I18N
    $('#importVulnData').removeClass('btn-disabled');//No I18N
    $('#syncVulnData').removeAttr('style');//No I18N
    $('#importVulnData').removeAttr('style');//No I18N
    if(jsonData.isSuccess === true){
        $('#lastUpdateTime').text(jsonData.updatedTime);//No I18N
        if(!window.OPM.isNCM){
            OPMClient.Inventory.updateConfigTabCount();
        }
    }
    else{
        $('#lastUpdateTime').text(OPMClient.NCMFirmwareVulnerability.lastDBUpdateTime);//No I18N
    }
    $('#lastUpdateStatus').html(FirmVulnupdateDbResultFormatter(jsonData.status));//No I18N
	if(jsonData.status === 'FAILURE' && jsonData.showMsg !== undefined && jsonData.showMsg === true){
        opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.ncm.firmvuln.invalidFileImported', this));//No I18N
	}
	OPMClient.NCMFirmwareVulnerability.lastDBSyncTime = OPMClient.NCMFirmwareVulnerability.lastDBUpdateTime;
}

function updateFirmVulnCountOPM() {
    if(window.OPM.currentView.name.indexOf('Inventory.List.ConfigMgmt.Sub') != -1){
        OPMClient.Inventory.updateConfigTabCount();
        if(OPMClient.NCMFirmwareVulnerability.subFilterType !== undefined && OPMClient.NCMFirmwareVulnerability.subFilterType !== '')
    	{
        	reloadConfigMgmtList('FirmwareVulnerability');//No I18N
        }
    }
}


/* NCM Firmware Vulnerability Related Methods Ends */

function redirectToNCMTerminal(isSnapshot, isCustomDevice, resourceID, protocol) {
	var terminalSettings = getNCMTerminalSettings();

	var isSGEnabled = isSparkGatewayEnabled(terminalSettings);
	if(isSnapshot) {
		OPMClient.InventoryDeviceDetailsController.selProtocol = protocol;
		resourceID = OPMClient.InventoryDeviceDetailsController.RESOURCEID;
	}
	
	var deviceType = isCustomDevice ? "Custom" : "Inventoried"; //No I18N
	
	OPMClient.SettingsTabController.terminalDeviceType = deviceType;
	var terminalViewRenderSettings = getTerminalViewRendererConfiguration(resourceID, protocol, deviceType);

	if(protocol == 'TELNET') { // For TELNET, only option is SparkGateway
		if(isSGEnabled) {
			window.open("/apiclient/ember/sshTerminal.jsp?protocol="+protocol+"&resourceID="+resourceID+"&deviceType="+deviceType+"&isNCMTerminal=true&width="+window.innerWidth+"&height="+window.innerHeight);
		} else {
			opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.sparkNotEnabled")); //No I18N
		}
	} else { // For SSH, there are two options Emulator and SparkGateway
		if(terminalSettings.accessEmulator) {
			if(terminalViewRenderSettings && !terminalViewRenderSettings.isSuccess) {
				// If autoSSH disabled or credentials not supplied, Open Credential Slide to get the credentials
				if(isSnapshot){
					opm_transitionToTheRoute("Inventory.Device.TerminalCredential");
				} else {
					OPMClient.SettingsUsersController.RESOURCEID = resourceID;
					OPMClient.SettingsUsersController.selProtocol = protocol;
					window.location='index.jsp#/Settings/NcmConfig/Terminal/'+OPMClient.SettingsTabController.terminalDeviceType+'/Terminal';
				}
			} else{
				// If autoSSH enabled and credentails supplied, Open Emulator directly
				if(isSnapshot)	{
					opm_transitionToTheRoute("Inventory.Device.Emulator");
				} else {
					OPMClient.SettingsUsersController.RESOURCEID = resourceID;
					OPMClient.SettingsUsersController.selProtocol = protocol;
					window.location='index.jsp#/Settings/NcmConfig/Terminal/'+OPMClient.SettingsTabController.terminalDeviceType+'/Terminal';
				}
			}
		} else if (isSGEnabled) {
			window.open("/apiclient/ember/sshTerminal.jsp?protocol="+protocol+"&resourceID="+resourceID+"&deviceType="+deviceType+"&isNCMTerminal=true&width="+window.innerWidth+"&height="+window.innerHeight);
		} else {
			opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.ncm.noTerminalsEnabled")); //No I18N
		}
	}
}

function isSparkGatewayEnabled(terminalSettings) {
	var isSGEnabled = true;

	if(OPMClient.ApplicationController.isNCM || OPMClient.ApplicationController.isFWA) {
		isSGEnabled = terminalSettings.isNCMSGEnabled;
	} 
	else if(OPMClient.ApplicationController.isOPM || OPMClient.ApplicationController.isOPMPLUS || OPMClient.ApplicationController.isNFA){
		var systemSettingsDetails = OPMClient.Settings.getSystemSettingsDetails();
		var showTerminal = systemSettingsDetails.systemSettings != undefined ? systemSettingsDetails.systemSettings.showRemoteDesktop : true;
		if(showTerminal == "false" || showTerminal == false) {
			isSGEnabled = false;
		}else{
			isSGEnabled = terminalSettings.isNCMSGEnabled;
		}
	}
	return isSGEnabled;
}

function getNCMTerminalSettings() {
	var terminalSettings = {};

	var isNCMSGEnabled = false;
	
	var jsonData = getClientServerConfiguration();
	if(jsonData["ncm.accessSpark"] != null && jsonData["ncm.accessSpark"] != undefined) {
		isNCMSGEnabled = jsonData["ncm.accessSpark"];
	}
	isNCMSGEnabled = (isNCMSGEnabled == "true" || isNCMSGEnabled == true) ? true : false;
	terminalSettings.isNCMSGEnabled = isNCMSGEnabled;

	var accessEmulator = true;
	if(jsonData["ncm.accessEmulator"] != null && jsonData["ncm.accessEmulator"] != undefined) {
		accessEmulator = jsonData["ncm.accessEmulator"];
	}
	accessEmulator = (accessEmulator == "true" || accessEmulator == true) ? true : false;
	terminalSettings.accessEmulator = accessEmulator;
	
	return terminalSettings;
}

function getClientServerConfiguration() {
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/getClientServerConfiguration'; //No I18N
	return opm_ajaxGetResponse(ajaxRequestUrl);
}

function getTerminalViewRendererConfiguration(resouceId, protocol, deviceType) {
	var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmdevice/getTerminalViewRenderer?RESOURCEID='+resouceId+'&PROTOCOL='+protocol+'&deviceType='+deviceType; //No I18N
	return opm_ajaxGetResponse(ajaxRequestUrl);
}

/**
 * This method uses jquery prepend. Make sure you have not passed any values stored from DB that has vulnerable payload.
 * @param confirmText
 * @param okCallBack
 * @param cancelCallBack
 * @param okButtonText
 * @param cancelButtonText
 * @param commonCallBack
 */
function ncmConfirmDialog(confirmText, okCallBack, cancelCallBack, okButtonText, cancelButtonText, commonCallBack) {
	if(okButtonText == undefined || okButtonText == null || okButtonText == "") {
		okButtonText = Ember.I18n.t('webclient.action.ok');
	}
	if(cancelButtonText == undefined || cancelButtonText == null || cancelButtonText == "") {
		cancelButtonText = Ember.I18n.t('webclient.action.cancel');
	}
	$('#itomConfirmDialog').remove();
	$('body').prepend('<div id="itomConfirmDialog"><div class="bgOverlay"></div><div class="popUpBox warning"><P>' 
			+ confirmText + 
			'</P><div class="opmBtn btn-grey alignCenter validatingButton" id="itomDialogCancel">'
			+cancelButtonText+
			'</div><div class="opmBtn alignCenter validatingButton" id="itomDialogOk">'
			+okButtonText+
			'</div></div></div>');

	$('#itomDialogOk').click(function() {
		try{
			if(okCallBack != undefined && okCallBack != null && okCallBack instanceof Function) {
				okCallBack();
			} else if(commonCallBack != undefined && commonCallBack != null && commonCallBack instanceof Function) {
				commonCallBack();
			}
			$('#itomConfirmDialog').remove();
		}
		catch (e) {}
	});
	$('#itomDialogCancel').click(function() {
		try{
			if(cancelCallBack != undefined && cancelCallBack != null && cancelCallBack instanceof Function) {
				cancelCallBack();
			} else if(commonCallBack != undefined && commonCallBack != null && commonCallBack instanceof Function) {
				commonCallBack();
			}
			$('#itomConfirmDialog').remove();
		}
		catch (e) {}
	});
}

function ncmConfirm(title, body, width, okCallBack, okButtonText, cancelCallBack, cancelButtonText, commonCallBack) {
	if(okButtonText == undefined || okButtonText == null || okButtonText == "") {
		okButtonText = Ember.I18n.t('webclient.topo.objectdetails.managed.yes');
	}
	if(cancelButtonText == undefined || cancelButtonText == null || cancelButtonText == "") {
		cancelButtonText = Ember.I18n.t('webclient.topo.objectdetails.managed.no');
	}
	ncmConfirmDialog(body, okCallBack, cancelCallBack, okButtonText, cancelButtonText, commonCallBack);
}

function enableNCMModule() {
	var resp=opm_ajaxPostRequest(window.OPM.apiUrlPattern+"/ncmsettings/updateNCMSettings?enableNCMModule=true"); //NO I18N
	if(resp.isSuccess) {
		var options = {
			callback_func:function() {
				window.location.reload();
			}
		};
		//Metrack block starts
		var key = (window.OPM.isOPM)?'snap_opm_ncm_enable':'snap_nfa_ncm_enable';// No I18n
		ncmusrsts1(key);// No I18n
		//Metrack block ends
		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.ncm.msg.enabledSuccessfully"),options); //NO I18N
	}else {
		opm_infoMsgs("errorMsg",resp.msgKey); //NO I18N
	}
}

function redirectAddToNCMSnapshot(){
	//Metrack block starts
	var key = (window.OPM.isOPM)?'snap_opm_ncm_adddevice':'snap_nfa_ncm_adddevice';// No I18n
	ncmusrsts1(key);// No I18n
	//Metrack block ends
    redirectAddToNCM(OPMClient.InventoryDeviceDetailsController.inventorysnapType,OPMClient.InventoryDeviceDetailsController.selDevice);
}
function manageNcmDeviceSnapshot() {
	if(OPMClient.Inventory.manageDevices() === 'successMsg')//No I18N
	{
		//Metrack block starts
		var key = (window.OPM.isOPM)?'snap_opm_ncm_managedevice':'snap_nfa_ncm_managedevice';// No I18n
		ncmusrsts1(key);// No I18n
		//Metrack block ends
		if((OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'MonitoringDevice' || OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'FlowDevice')){//No I18N
			setTimeout(function () {
				window.location.reload();
			},1000);
		}
	}
}
function ncmDeviceAddEndBlockForAddOn() {
    if((OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'MonitoringDevice' || OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'FlowDevice') && OPMClient.InventoryDeviceDetailsController.selectedTab === 'AddToNCM' && OPMClient.InventoryDeviceDetailsController.isNCMDeviceAdd === true){//No I18N
		OPMClient.InventoryDeviceDetailsController.isNCMDeviceAdd = false;
    	setTimeout(function () {
            window.location.reload();
        },1000);
    }
}


function tab1MoreTabs(tabs, showNTabs) {
	var n = $(tabs).children('ul').children('li:not(".moreTab")').length;
	if(n == 0 || isNaN(showNTabs) || showNTabs < 0 || n <= showNTabs) {
		$(tabs).children('ul').children('li.moreTab').remove();
		return;
	}
	if(n > showNTabs) {
		$(tabs).children('ul li.moreTab ul li').remove();
	}
	while(n > showNTabs) {
		var lastTab = $(tabs).children('ul').children('li:not(".moreTab")').last();
		$(tabs).find('.moreTab ul').prepend(lastTab);
		n--;
	}
	
	$(tabs).children('ul').find('li:not(".moreTab")').on('click', function() {
		if($(this).closest('.moreTab').length > 0) {
			var lastTab = $(tabs).children('ul').children('li.active');
			if($(lastTab).length == 0) {
				lastTab = $(tabs).children('ul').children('li:not(".moreTab")').last();
			}
			$(tabs).find('.moreTab ul').prepend(lastTab);
			$(this).insertBefore($(tabs).children('ul').children('li.moreTab'));
		}
		$(tabs).children('ul').find('li.active').removeClass('active');
		$(this).addClass('active');
	});
}

function refreshNcmNonInventoryDevice(){
    if(location.href.indexOf('/Inventory/List/ConfigMgmt/NonInventoryDevices') !== -1){
		OPMClient.Inventory.updateConfigTabCount();
		OPMClient.Inventory.updateNCMNonInventoryGrid();
	}
}


function changeSelectProbeOption(selectProbe) {
	if(selectProbe == true){
		$('#selectProbeDiv').css('display','block');
	} else { 
		$('#selectProbeDiv').css('display','none');
	}
}

function ncm_isAlphanumeric_basic(s){
    var regex = /^[a-zA-Z0-9\s-_]+$/;
	if(s == '' || s.length == 0)
    {
        return true;
    }
    if(regex.test(s)){ 
        return true;
    }else{ 
        return false;
    }
}

function ncm_getTicketSettingsModel(model,productName){
    if(productName === 'ServiceNow'){
        model.enableConnectionNotes = Ember.I18n.t("webclient.ncm.serviceNow.enable.connection.notes",this);
        model.uploadReqNotes = Ember.I18n.t("webclient.ncm.serviceNow.uploadReq.notes",this);
        model.syncDevicesNotes = Ember.I18n.t("webclient.ncm.serviceNow.syncDevices.notes",this);
        model.resolveNotes = Ember.I18n.t("ncm.servicenow.midserver.message",this);
    }
    model.backupAlert = Ember.I18n.t("webclient.ncm.servicenow.failure.alert",{"productName":productName}); //NO I18N
    model.uploadRequest = Ember.I18n.t("webclient.ncm.servicenow.uploadrequest",{"productName":productName}); //NO I18N
	model.fvAlert = Ember.I18n.t("webclient.ncm.serviceNow.fvAlert",{"productName":productName}); //NO I18N
    return model;
}

function changeEnablePasswordType(protocol,passwordType,isInventoryProfile) {
	var passwordDivId = "#"+protocol;
	if(isInventoryProfile){
		passwordDivId = passwordDivId+"EnablePassword";
		if(passwordType == "enablePassword"){
			$('#addCredentialDiv '+passwordDivId).prop('disabled',false);
		}else {
			$('#addCredentialDiv '+passwordDivId).prop('disabled',true);
		}
	}else{
		passwordDivId = passwordDivId+"EnablePasswordRow"; 
		if(passwordType == "enablePassword"){
			$(passwordDivId).show();
		}else {
			$(passwordDivId).hide();
		}
	}
}

function ncmResponseHandle(response,cls,message){
    var map = {};
    if(response.isSuccess){
        cls = "successMsg"; //No I18N
        message = response.statusMsg;
    }
    if(response.result !== undefined && response.result.message !== undefined ){
        cls = "successMsg"; //No I18N
        message = response.result.message;
    }
    else{
        message = response.statusMsg;
    }
    map.cls = cls;
    map.message = message;
    return map
}

function ncm_replaceAll(str, regex, replacement){
    var strArr = str.split(regex);
    var len = strArr.length;
    var newStr = strArr[0];
    for(var i=1; i<len; i++){
        newStr = newStr + replacement + strArr[i];
    }
    return newStr;
}

function deleteSyslogRegex(regexID) {
	var confirmCallBack = function() {
		var data = {};
		data.REGEXID = regexID;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmconfiglets/deleteSyslogStateRegex'; //No I18N
		$.ajax({
			url : ajaxRequestUrl,
			type : 'POST',// No I18N
			dataType : 'json',// No I18N
			data: data,
			async: true,
			success : function(jsonData) {
				var cls = 'errorMsg'; //No I18n
				var message = "";
            	if(jsonData.isSuccess) {
					cls = 'successMsg'; //No I18n
					$('#SyslogStateRegex').trigger("reloadGrid"); //No I18N
					message = jsonData.statusMsg;
				} else if(jsonData.error !== undefined) {
		    		message = jsonData.error.message;
		    	}
		    	else {
		    		message = jsonData.statusMsg;
		    	}
				opm_infoMsgs(cls, message);
			}
		});
	}
	var confirmBody = Ember.I18n.t("ncm.changeDetection.status.delete",this); //No I18N
	ncmConfirm(null, confirmBody, 400, confirmCallBack);
}

function isNCMSupportedCategory(category){
	if(category === undefined || category === null || category === ''){
        return false;
    }
    var ncmSupportedCategoryList = ["switch","router","firewall","wireless","loadbalancer","unknown"];
    ncmSupportedCategoryList.push("WirelessLANController".toLowerCase());
    ncmSupportedCategoryList.push("WirelessAccessPoint".toLowerCase());
    ncmSupportedCategoryList.push("T1 Remote Radio Unit Tornado".toLowerCase());
    ncmSupportedCategoryList.push("T2 Remote Radio Unit Pyxis".toLowerCase());
    ncmSupportedCategoryList.push("T1 Base Radio Unit Tornado".toLowerCase());
    ncmSupportedCategoryList.push("T2 Base Radio Unit Pyxis".toLowerCase());
    ncmSupportedCategoryList.push("T1 Base Radio Unit Pyxis".toLowerCase());
    category = category.toLowerCase();
    return ncmSupportedCategoryList.contains(category);
}
function ncm_PMPSyncMsg(connectionStatus, serverStatus) {
	if(connectionStatus == "ncm.ssl.certificate.validation.fail") {
		connectionStatus = serverStatus ? (Ember.I18n.t("ncm.ssl.certificate.validation.fail",this)) : (Ember.I18n.t("ncm.ssl.certificate.validation.fail",this) + " " + Ember.I18n.t("ncm.pmp.ssl.validationFail",this)); //No I18N
	}
	return connectionStatus;
}

function ncm_TopBandMsg(response) {
	var	cls = "errorMsg"; //No I18N
    var message = "";
	if(response != null) {
		if(response.isSuccess) {
	    	message = response.statusMsg;
			cls = "successMsg"; //No I18N
		}
	    else if(response.error !== undefined) {
	    	message = response.error.message;
	    }
	    else {
	    	message = response.statusMsg;
	    }
	    opm_infoMsgs(cls,message); //No I18N
    }
}
function getCustomTimeSelected(onceStartId,onceEndId){
	var period = {

	};
	var timecmp = $("input[name='custime']:checked").val();
	var d = new Date();
	var toTime = d.getTime();
	var fromTime = toTime;
	var midnight = new Date(); // To make it to midnight of today

	midnight.setHours( 0 );
	midnight.setMinutes( 0 );
	midnight.setSeconds( 0 );
	midnight.setMilliseconds( 0 );
	var midnightTime = midnight.getTime();
	var midnight = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
	var todayMidnight = midnight.getTime();
	if(timecmp == 'time') {
		period.isDefault = true;
		var selection = $("input[name='timeperiods']:checked").val();
        if(selection === undefined){
            selection = 'last_7_days';//No I18N
        }
		period.selection = selection;
	    if(selection == 'today') {
	  		fromTime = midnightTime;
		} else if(selection == 'yesterday') { //NO I18N
			//toTime = midnightTime-1;
			fromTime = midnightTime - (24*60*60*1000);
			var endTime = new Date(fromTime); // To make it to midnight of today
			endTime.setHours( 23 );
			endTime.setMinutes( 59 );
			endTime.setSeconds( 59 );
			var endTimeTimestamp=(new Date(endTime)).getTime();
			toTime =endTimeTimestamp;
		} else if(selection == 'last_7_days') { //NO I18N
			fromTime = midnightTime - (24*60*60*1000*6);
		} else {
			var midnight = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()-29));
			fromTime = midnightTime - (24*60*60*1000*29);
		}
		var selTime = $("input[name='timeperiods']:checked").siblings('label').text();
		if(selTime !== ''){
		    $('#timeFilterLabel').text(selTime); // No I18N
		}

	} else {
	    if(onceStartId === undefined){
	        onceStartId = 'once_startat';//NO I18N
	    }
	    if(onceEndId === undefined){
	        onceEndId = 'once_endat';//NO I18N
	    }
		if(!opm_validateFields({'empty':[onceStartId, onceEndId]})){
			return;
		}
		fromTime = new Date($('#'+onceStartId).val() + ' 00:00:00').getTime();
		toTime = new Date($('#'+onceEndId).val() + ' 23:59:59').getTime();
        var selTime = $("input[name='timeperiods']:checked").siblings('label').text();
		if(selTime !== ''){
		    $('#timeFilterLabel').text(selTime); // No I18N
		}
		$('#timeFilterLabel').text(getYYYYMMDDDate(new Date($('#'+onceStartId).val())) + ' - ' + getYYYYMMDDDate(new Date($('#'+onceEndId).val())));
	}
	period.fromTime = fromTime;
	period.toTime = toTime;
	return period;
}
function isFvReport(viewName){
    switch(viewName){
        case 'FirmVulCveReport_RTab':
        case 'FirmVulDeviceReport_RTab':
        case 'FirmVulVersionReport_RTab':
        case 'FvFixTrendReport_RTab':
        case 'FvFixTrendCveReport_RTab':
        case 'FvDeviceVulnHistoryReport_RTab':
        case 'FirmwareVulnerabilityReport_RTab':
        case 'FvVulnPatchesReport_RTab':
            return true;
    }
    return false;
}
function enableFvExportIcons(){
    $('#pdfIconTd').removeClass('btn-disabled');//No I18N
    $('#csvIconTd').removeClass('btn-disabled');//No I18N
    $('#xlsIconTd').removeClass('btn-disabled');//No I18N
    $('#pdfIconTd').attr("style", "pointer-events: visible;");//No I18N
    $('#csvIconTd').attr("style", "pointer-events: visible;");//No I18N
    $('#xlsIconTd').attr("style", "pointer-events: visible;");//No I18N
}
// ALl NCM Inventory tabs are under same Route so ncmBreadcrumbData is set for each tab using the below method
function setNCMInventoryBreadcrumbdata(){
	for(var i=0; i < OPMClient.InventoryDeviceDetailsController.ncmBreadcrumbData.length ; i++){
		if(OPMClient.InventoryDeviceDetailsController.ncmBreadcrumbData.get(i).displayName === Ember.I18n.t('webclient.customtab.inventory',this)){
			OPMClient.InventoryDeviceDetailsController.ncmBreadcrumbData.get(i).location = location.href ;
		}
	}
}
function enableComplianceBlockEnd(isSingleLineBlock){
    if(isSingleLineBlock){
        $('#compEndBlock').hide();
    }
    else{
        $('#compEndBlock').show();
    }
}
function enableIntegrationProxy()
{
    var proxyStatus = $("#proxyEnabled").prop('checked');//No I18N
    $("#integrationProxy .opmFormCol input").prop('disabled', !proxyStatus);//No I18N
    $("#integrationProxy .opmFormCol textarea").prop('disabled', !proxyStatus);//No I18N
    if(!proxyStatus){
        $("#proxyEnabled").prop('disabled',false);//No I18N
    }
}

function ncmComplianceHealthStatus(cellValue, options, rowdata, action)
{
	return "<div class='progress-range-line'><div class='critical' style='width: "+rowdata.ViolationPercentage+"%;' data-tooltip='Violation: "+rowdata.Violation+"'></div><div class='low' style='width: "+rowdata.CompliantPercentage+"%;' data-tooltip='Compliant: "+rowdata.Compliant+"'></div><div class='important' style='width: "+rowdata.DataNotAvailablePercentage+"%;' data-tooltip='Data Not Available: "+rowdata.DataNotAvailable+"'></div></div>";
}

function ncmConfigConflictHealthStatus(cellValue, options, rowdata, action)
{
	return "<div class='progress-range-line'><div class='low' style='width: "+rowdata.SyncPercentage+"%;' data-tooltip='Sync: "+rowdata.Sync+"' onclick=\"conflictChartOnClick('"+rowdata.Probe+"','"+rowdata.Type+"','false')\"></div><div class='critical' style='width: "+rowdata.ConflictPercentage+"%;' data-tooltip='Conflict: "+rowdata.Conflict+"' onclick=\"conflictChartOnClick('"+rowdata.Probe+"','"+rowdata.Type+"','true')\"></div><div class='important' style='width: "+rowdata.NotBackedUpPercentage+"%;' data-tooltip='Not Backedup: "+rowdata.NotBackedUp+"'  onclick=\"conflictChartOnClick('"+rowdata.Probe+"','NOT_BACKEDUP','true')\"></div></div>"
}

function conflictChartOnClick(probeName,type, filter)
{

	OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects={};
	OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {};

	var obj = {};
	var obj1 = {};

	var label="";
	obj1[probeName]=probeName;

	if(type == "STARTUP_RUNNING" || type == "BASELINE_RUNNING")
	{
		if(filter == true || filter == "true")
			{
				 	//obj["Conflict"]=true;
						obj["true"]="Conflict";
			}
			else
			{
						 //	obj["In Sync"]=false;
					obj["false"]="In Sync";
		
			}
			if( type == "STARTUP_RUNNING" )
			{
					OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMResourcesConfConflict__ISCONFLICT":[filter],"RegionalServerInfo__NAME":[probeName]};
					OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMResourcesConfConflict__ISCONFLICT":obj,"RegionalServerInfo__NAME":obj1}; //No I18N
		
			}
			if( type == "BASELINE_RUNNING" )
			{
				OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMBaseRunningConflict__ISCONFLICT":[filter],"RegionalServerInfo__NAME":[probeName]};
				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMBaseRunningConflict__ISCONFLICT":obj,"RegionalServerInfo__NAME":obj1}; //No I18N
				
			}
	}
	else if( type == "NOT_BACKEDUP" )
	{
		OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMBackupStateHolder__BACKUP_STATUS":["NOTSTARTED"],"RegionalServerInfo__NAME":[probeName]};
		obj["true"]="Not Backedup";
		OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMBaseRunningConflict__ISCONFLICT":obj,"RegionalServerInfo__NAME":obj1}; //No I18N
	}

	OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;

    if(OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget == true)
	{
		location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
	}
}
function backupsuccessstatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status5"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}
function backupfailurestatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status1"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}
function backupNAstatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status3"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}

function fvlowstatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status4"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}
function fvmodstatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status3"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}
function fvimpstatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status2"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}
function fvcristatusformatter(cellValue, options, rowdata, action)
{
	return '<i class="icon-status1"></i>&nbsp;&nbsp;' + escapeHTML(cellValue);//No I18N
}

function isNCMXLSSupportNew(viewName){
    var reportList = new Array();
    reportList.push('OSVersionReport_RTab','DeviceModelReport_RTab','DeviceStatusReport_RTab','DeviceManagementStatusReport_RTab','OperationAuditReport_RTab','ConflictReport_RTab','ConfigChangesReport_RTab','AnnotationReport_RTab','DeviceEOLReport_RTab','ComplianceReport_RTab','UserAccessReport_RTab','UserAuditReportView_RTab','PCIReviewReport_RTab')
    return reportList.contains(viewName);
}

function ncm_getAjaxResponseWithAsync(apiURL,formData,callBckFunc,callBckParams,message) {
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
			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
		},
		success: function(response) {
			if(message!==undefined) {
				$("#"+this.uniqueID).remove(); //NO I18N
			}
			callBckFunc(response,callBckParams);
		}
	});
}

function ncm_postAjaxResponseWithAsync(apiURL,formData,callBckFunc,callBckParams,message) {
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

function changePMPService(){
	var serviceName = $('#serviceName').val()
	if(serviceName == 'PAM360' || serviceName == 'PMP'){
		$('#pmpDiv').show();
		$('#cyberArkDiv').hide();
	}else if(serviceName == 'CYBERARK'){
		$('#pmpDiv').hide();
		$('#cyberArkDiv').show();
	}
}

function enablePAMButtons(enable) {
	if(enable) {
		$("#schedule_sync .accordion1__nav").addClass("active");
		$("#schedule_sync .accordion1__cont").show();
		$("#pam_integration .disableClass").removeClass("disabled");
	}
	else {
		$("#schedule_sync .accordion1__nav").removeClass("active");
		$("#schedule_sync .accordion1__cont").hide();
		$("#pam_integration .disableClass").addClass("disabled");
	}
}
function hideAllApproveButtons(){
	$('#rejectButton').hide(); //No I18N
	$('#approveButton').hide(); //No I18N
	$('#executeButton').hide(); //No I18N
}

function showHideClientServerProperties(parentElement, childElement){
    if($("#"+parentElement).prop("checked") == true) {
        $("#"+childElement).show();	//No I18N
    } else {
        $("#"+childElement).hide();	//No I18N
    }
}

function showConfirmDlgForConfigletHistoryView(){
	if($("#configletsHistoryVisibleToAll").prop("checked") == true) {
		var confirmBody = Ember.I18n.t('webclient.ncm.clientserver.config.configletsHistoryVisibleToAll.confirmation',this); //No I18N
		var okCallBack=function(){
        	$("#configletsHistoryVisibleToAll").prop("checked",true);
    	}
    	var cancelCallBack=function(){
        	$("#configletsHistoryVisibleToAll").prop("checked",false);
        }
    	ncmConfirmDialog(confirmBody,okCallBack,cancelCallBack);
	}

}
function ncmComplianceCheckLiveUpdate(jsonData){
    try{
        if(location.href.endsWith('Policies') || OPMClient.NCMComplianceUtilController.refreshLiveCompData) {
            var status = jsonData.status;
            /*var nodeData = OPMClient.NCMCompliancePolicyController.policyCompInstance.getNodeData(OPMClient.NCMCompliancePolicyController.selectedItemId);
            var isCompCheckNotDone = nodeData && nodeData.data.complianceState === 'COMP_CHECK_NOT_DONE';
            if isCompCheckNotDone true, try loadGrid inplace of refreshGrid*/
            if (status === 'INPROGRESS') {
                try {
                    OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                    if(OPMClient.NCMCompliancePolicyController.selectedItem === 'policy'){
                        OPMClient.NCMCompliancePolicyController.policyCompInstance.setMetadataContent();
                    }
                } catch (e) {}
            } else if(status === 'COMPLETE') {
                try {
					OPMClient.NcmCompliancePolicyComponent.complianceCheckComplete = true;
                    OPMClient.NCMCompliancePolicyController.gridCompInstance.refreshGrid();
                } catch (e) {}
                setTimeout(function(){
                    OPMClient.NCMCompliancePolicyController.policyCompInstance.setHeaderContent();
                }, 1000);
                OPMClient.NCMCompliancePolicyController.policyCompInstance.setMetadataContent();
                OPMClient.NCMCompliance.refreshPolicyTree(OPMClient.NCMCompliance.getCompTreeData());
            }
            var policyId = jsonData.policyId || jsonData.policyIds[0];
            var loadActualData = OPMClient.NCMCompliancePolicyController.selectedItemId.indexOf('policy_'+policyId) !== -1;
            if(loadActualData && OPMClient.NCMCompliancePolicyController.policyCompInstance.loadEmptyData){
                OPMClient.NCMCompliancePolicyController.policyCompInstance.set('loadEmptyData', false);
            }
            OPMClient.NCMComplianceUtilController.liveUpdateJson = null;
            OPMClient.NCMComplianceUtilController.refreshLiveCompData = false;
        } else { // Store json data in NCMComplianceUtilController and call this method again on landing to policies page
            OPMClient.NCMComplianceUtilController.liveUpdateJson = jsonData;
        }
    } catch(e) {}
}
function ncmComplianceBulkRemediationLiveUpdate(jsonData){
    try{
        if(location.href.endsWith('BulkRemediate')) {
            /*$('#bulkRemediationTable').delay(10).trigger('reloadGrid'); //NO I18N*/
            if(jsonData && OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance && OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.remediationInProgress) {
                if(jsonData.inProgress) {
                    if(jsonData.percentage){
                        OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.set('remediationInProgressPercentage', jsonData.percentage);
                    }
                }
                else{
                    OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.set('remediationInProgress', false);
					OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.loadBulkRemediationGrid();
					setTimeout(function (){
						OPMClient.NCMComplianceUtilController.bulkRemediationCompInstance.addDeviceSearch();
					}, 500);
                }
            }
        }
    } catch(e) {}
}
function calculateShrinkToFit(colModelList, identifier){
    var shrinkToFit = false;
    try {
        var availableWidth = $(identifier).width();
        var requiredWidth = 0;
        for (var i = 0; i < colModelList.length; i++) {
            requiredWidth += colModelList[i].width;
        }
        if (requiredWidth < availableWidth) {
            shrinkToFit = true;
        }
    } catch (e) {}
    return shrinkToFit;
}

function ncmSetupController(controller, model){
    for(var key in model) {
        if(controller[key] != undefined) {
            controller.set(key, model[key]);
        } else {
            controller[key] = model[key];
        }
    }
}

// Remove empty params before sending to server
function ncmReplaceParamsAndMakeApi(apiUrl, params) {
    var keysToCheck = ['ruleDescription', 'description', 'remediationProcedure','ruleGroupDescription', 'POLICY_DESCRIPTION'] // NO I18N
    for (var i = 0; i < keysToCheck.length; i++) {
        var key = keysToCheck[i];
        if (params.hasOwnProperty(key) && (!params[key] || params[key] === '[NA]' || params[key] === '' || params[key] === null)) {
            delete params[key];
        }
    }
    return opm_ajaxPostRequest(window.OPM.apiUrlPattern + apiUrl, params);
}

function ncmComplianceReqCommandTemplateUpdate(){
    slideInWithId('templateMailPreview');
    $('.flowCommandDetails').find('.slide-overlay').remove();
}

function validateNCMNotificationAction(model) {
	var fields = {selBoxEmptyCheck:["eventType"], selBoxEmptyCheckMsg: "webclient.common.widgets.selectacategory", empty:["templateName"]}; //NO I18N
	if(!opm_validateFields(fields)) {
		return false;
	}
	switch(model.type) {
		case "Email": 		//NO I18N
		case "EmailSMS": 	if(!isMailServerConfiguredPopUp(true)) { //NO I18N
								return false;
							}
							fields.empty = ["fromAddress","toAddress"]; //NO I18N
							fields.emailValidation = ["fromAddress","toAddress"]; //NO I18N
							if(model.ccAddress) {
								fields.emailValidation.push("ccAddress"); //NO I18N
							}
							break;
		case "SMS":	        if(model.selectedGateWay === undefined) { //NO I18N
								opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.sms.notification.gatewayselect")); //NO I18N
								return false;
							}else if(model.selectedGateWay === "Serial Modem" || model.selectedGateWay === "serialmodem") { //NO I18N
								opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.nTemplates.sms.serialModemExpiryMsg", {productName: window.OPM.productName})); //NO I18N
								return false;
							}
							fields.empty.push("toNumber"); //NO I18N
							break;
		case "Chat":		if(model.receiverType==="channel") { //NO I18N
								fields.empty.push("slackChannelList"); //NO I18N
							}else {
								fields.empty.push("slackUserList"); //NO I18N
							}
							break;
		case "LogTicket":	if(!model[model.serviceType+"Enabled"]) { //NO I18N
								opm_infoMsgs("infoMsg",Ember.I18n.t("opm.infoMsg.logTicket."+model.serviceType+".tooltip")); //NO I18N
								return;
							}
							if(model.serviceType == "serviceDeskJira"){
								if(!loadJiraDynamicFields(model)){
									return false;
								}
							}
							break;
		case "WebAlarm":	var selectedIDs = getSelectedDashUserIDs(); //NO I18N
							model.selectedUserIDs = selectedIDs[0];
							model.selectedRoleIDs = selectedIDs[1];
							if(model.selectedUserIDs.length===0 && model.selectedRoleIDs.length===0) {
								alert(Ember.I18n.t("webclient.dashboard.useralert")); //NO I18N
								return;
							}else {
								fields.empty.push("soundFiles"); //NO I18N
							}
							break;
		case "SysLog":		fields.empty = ["sysLogHost","sysLogPort","sysLogSeverity","sysLogFacility"]; //NO I18N
							fields.port = ["sysLogPort"]; //NO I18N
							break;
		case "Trap":		fields.empty = ["peerName","trapPort"]; //NO I18N
							if(model.snmpVersion==="V3") {
								fields.empty.push("snmpv3Credential");
							}else if(model.task!=="Edit" || model.oldSnmpVersion!==model.snmpVersion) { //NO I18N
								fields.empty.push("trapCommunity"); //NO I18N
							}
							fields.port = ["trapPort"]; //NO I18N
							break;
		case "Webhook":		fields.empty = ["webhookURL", "timeout"]; //NO I18N
							fields.validateProperUrl = ["webhookURL"]; //NO I18N
							fields.timeout = ["timeout"]; //NO I18N
							if(model.showDataType) {
								fields.empty.push("contentType"); //NO I18N
								if(model.dataType === "raw") {
									fields.empty.push("bodyContent"); //NO I18N
								}
							}
							break;
	}
	if(["Email","EmailSMS","Chat","LogTicket"].contains(model.type)) { //NO I18N
		fields.empty.push("subject"); //NO I18N
		fields.empty.push("message"); //NO I18N
	}
	if(["SMS","SysLog","Trap"].contains(model.type)) { //NO I18N
		fields.empty.push("message"); //NO I18N
	}
	return opm_validateFields(fields);
}

    function isNCMRoute(){
        return location.href.indexOf('NCMConfigAutomation/NCMChangeManagement') !== -1 ; //NO I18N
    }
function ncm_goToEOL() {
	location.href = "/apiclient/fluidicv3/index.jsp#/eol/dashboard"; // NO I18N
}

function confirmUpdate(property) {
	var confirmBody = null, confirmCallBack = null, cancelCallBack = null;
	if (property === 'allowModifyDeleteOfPublicItems') {
		var updatedState = $('#allowModifyDeleteOfPublicItems').prop('checked');
		confirmBody = Ember.I18n.t('ncm.complianceiq.clientprop.allowPowerCompWriteUsersToModifyDeletePublicItems.disable',this); //No I18N
		if (updatedState) {
			confirmBody = Ember.I18n.t('ncm.complianceiq.clientprop.allowPowerCompWriteUsersToModifyDeletePublicItems.enable',this); //No I18N
		}
		confirmCallBack = function() {
			$('#allowModifyDeleteOfPublicItems').prop('checked', updatedState);
		}
		cancelCallBack = function() {
			$('#allowModifyDeleteOfPublicItems').prop('checked', !updatedState);
		}
	}
	if (confirmBody && confirmCallBack && cancelCallBack) {
		ncmConfirm(null, confirmBody, 400, confirmCallBack, null, cancelCallBack);
	}
}

//IgnoreI18N_End
