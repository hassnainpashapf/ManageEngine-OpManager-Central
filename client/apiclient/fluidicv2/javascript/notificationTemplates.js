// NFA,FWA - Notification templates related components and methods

OPMClient.NotificationTemplateConfigComponent = Ember.Component.extend({
	templateName:"notification-template-config", //NO I18N
	didInsertElement:function() {
		if(this.get("model.isTemplateNameLocked")) { //NO I18N
			// readonly as well: disabledBlock only blocks the mouse
			this.$("#templateName").addClass("disabledBlock").prop("readonly", true); //NO I18N
		}
	},
	subjectVariableChanged:function() {
		var selectedVariable = this.get("model.selectedSubjectVariable"); //NO I18N
		if(selectedVariable===null || selectedVariable===undefined || selectedVariable==="" || selectedVariable==="default") { //NO I18N
			this.set("model.subjectVariable",nt_getDefaultSubjectVariables()); //NO I18N
		}else {
		    if(this.model.subjectVariable!==""){
			this.set("model.subjectVariable",this.model.subjectVariable+" "+selectedVariable); //NO I18N
			} else {
			    this.set("model.subjectVariable", selectedVariable); //NO I18N
			}
		}
	}.observes("model.selectedSubjectVariable"), //NO I18N
	messageVariableChanged:function() {
		var delimiter = (this.model.type==="RunProgram" || this.model.type==="Ansible")?" ":" \n"; //NO I18N
		var selectedVariable = this.get("model.selectedMessageVariable"); //NO I18N
		if(selectedVariable===null || selectedVariable===undefined || selectedVariable==="" || selectedVariable==="default") { //NO I18N
			this.set("model.messageVariable",nt_getDefaultMessageVariables()); //NO I18N
		}else {
		    if(this.model.messageVariable!==""){
			this.set("model.messageVariable",this.model.messageVariable+delimiter+selectedVariable); //NO I18N
			} else {
			    this.set("model.messageVariable", selectedVariable); //NO I18N
			}
		}
	}.observes("model.selectedMessageVariable"), //NO I18N
	ansiblPlayBookChanged:function() {
		var selectedVariable = this.get("model.selectedPlayBook"); //NO I18N
		if(selectedVariable===null || selectedVariable===undefined || selectedVariable===""){
			this.set('model.selectedPlayBook',$("#ansiblePlayBookList").val()); //No I18n
		} else {
			this.set('model.selectedPlayBook',selectedVariable); 
		}
	}.observes("model.selectedPlayBook"), //NO I18N
	actions:{
		showTemplateTypeList:function() {
			if($(".notifyProfileType1 .titleDropDown").hasClass("active")){//No I18N
				$(".notifyProfileType1 .titleDropDown").removeClass("active");//No I18N
			}else{
				$(".notifyProfileType1 .titleDropDown").addClass("active");//No I18N
			}
		},
		showTemplateTypes:function() {
			if(this.model.isAvailWritePermission) {
				nt_redirectToNotificationTemplateTypes();
			}
		},
		addTemplate:function(type) {
			if(type!==this.model.type) {
				nt_redirectToNotificationTemplateTask(type,"Add","New"); //NO I18N
			}
		},
		saveTemplate:function(isTesting) {
			var model = jQuery.extend(true,{},this.model); //NO I18N
			if(validateNotificationTemplate(model)) {
				// Confirmation dialog when SNOW template type changes (Incident <-> Event) during edit
				if(!isTesting && model.task === "Edit" && model.type === "LogTicket" && model.serviceType === "serviceNow" && model.serviceNowTicket && model.serviceNowTicket.snowTicketType !== undefined){//NO I18N
					var currentSnowTmplType = $('input[name="snowTemplateTicketType"]:checked').val() || 'incident';//NO I18N
					var originalSnowTmplType = model.serviceNowTicket.snowTicketType || 'incident';//NO I18N
					if(currentSnowTmplType !== originalSnowTmplType){
						opmConfirm("",Ember.I18n.t("webclient.servicenow.np.profiletype.change.confirm"),"",function(){//NO I18N
							saveNotificationTemplate(model,isTesting);
						},Ember.I18n.t('webclient.topo.objectdetails.managed.yes'),function(){//NO I18N
							$('input[name="snowTemplateTicketType"][value="'+originalSnowTmplType+'"]').prop('checked', true).trigger('change');//NO I18N
						},Ember.I18n.t('webclient.topo.objectdetails.managed.no'),"","dialogStyle2");//NO I18N
						return;
					}
				}
				saveNotificationTemplate(model,isTesting);
			}
		},
		cancelAction:function() {
			nt_redirectToNotificationTemplateList();
		},
		goBackAction:function() {
			window.history.back();
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.EmailTemplateConfigComponent = Ember.Component.extend({
	templateName:"email-template-config", //NO I18N
	initDefaults:function() {
		if(window.isserver) {
			OPMClient.SettingsAddEditController.set("isMailServerConfigured",false); //NO I18N
		}
		if(!OPMClient.SettingsAddEditController.isMailServerConfigured) {
			isMailServerConfigured("","",true); //NO I18N
		}
		if(!this.isEmailSMS) {
			this.set("mailFormatList",[ //NO I18N
				{name:Ember.I18n.t("webclient.admin.profiledetails.plainText"),	value:"PLAIN"}, //NO I18N
				{name:Ember.I18n.t("webclient.admin.profiledetails.html"),		value:"HTML"}, //NO I18N
				{name:Ember.I18n.t("webclient.admin.profiledetails.both"),		value:"BOTH"} //NO I18N
			]);
			if(this.model.mailFormat===undefined) {
				this.set("model.mailFormat",(this.model.mailFormat || "BOTH")); //NO I18N
			}else {
				this.getMailFormatList();
			}
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		if(OPMClient.SettingsAddEditController.isMailServerConfigured && this.model.task==="Add") { //NO I18N
			this.set("model.fromAddress",OPMClient.SettingsAddEditController.mailServerSettings.fromemailid); //NO I18N
			this.set("model.toAddress",OPMClient.SettingsAddEditController.mailServerSettings.emailid); //NO I18N
		}
		this.set("model.hideEmailCCLink",(this.model.ccAddress===undefined)); //NO I18N
	},
	getMailFormatList:function() {
		var mailFormatList = jQuery.extend(true,[],this.mailFormatList);
		for(var i=0;i<mailFormatList.length;i++){
			mailFormatList[i].checked = (this.model.mailFormat===mailFormatList[i].value)?"checked":""; //NO I18N
		}
		this.set("mailFormatList",mailFormatList); //NO I18N
	}.observes("model.mailFormat"), //NO I18N
	actions:{
		mailFormatChanged:function(value) {
			this.set("model.mailFormat",value); //NO I18N
		},
		configMailServer:function() {
			var callBckURL = nt_getTemplateTaskCallBackURL(this.model.type,this.model.task,this.model.templateID);
			var loadingMsg = Ember.I18n.t("webclient.admin.mailserver.message")+" "+Ember.I18n.t("opu.common.PLEASE_CONFIGURE"); //NO I18N
			isMailServerConfigured(callBckURL,loadingMsg,true);
		},
		showHideCCLink:function() {
			this.set("model.hideEmailCCLink",!this.model.hideEmailCCLink); //NO I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.SMSTemplateConfigComponent = Ember.Component.extend({
	templateName:"smsTemplateConfig", //NO I18N
	showSMSConfigMsg:false,
	showSerialModemExpiryMsg:false,
	initDefaults:function() {
		var selectedGateWay = "Clickatell"; //NO I18N
		var smsGatewaysVsID = {serialmodem:1,Custom:5,SMPP:6};
		if(this.model.smsGatewayConfig===undefined) {
			var smsObj = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getSMSGatewayConfiguration"); //NO I18N
			smsObj.SMPP=smsObj.smpp; delete smsObj.smpp;
			smsObj.Custom=smsObj.custom; delete smsObj.custom;
			for(key in smsObj) {
				if(smsObj[key]==="true") { //NO I18N
					selectedGateWay = key;
					break;
				}
			}
			this.set("model.smsGatewayConfig",smsObj); //NO I18N
		}

		if(this.model.smsGateways===undefined) {
			var smsGateways = [];
			if(smsObj.serialmodem==="true") { //NO I18N
				smsGateways.push({group:"",name:Ember.I18n.t("webclient.sms.type.serial.modem"),value:"serialmodem"}); //NO I18N
			}
			smsGateways.push({group:"",name:Ember.I18n.t("webclient.sms.smpp"),value:"SMPP"}); //NO I18N

			var inBuiltSMSGateways = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getInBuiltSMSGateways"); //NO I18N

			for(var i=0;i<inBuiltSMSGateways.length;i++) {
				smsGateways.push({group:Ember.I18n.t("webclient.sms.customsms"),name:inBuiltSMSGateways[i].gatewayName,value:inBuiltSMSGateways[i].gatewayName}); //NO I18N
				smsGatewaysVsID[inBuiltSMSGateways[i].gatewayName]=inBuiltSMSGateways[i].gatewayId;
			}
			smsGateways.push({group:Ember.I18n.t("webclient.sms.customsms"),name:Ember.I18n.t("nfa.common.custom"),value:"Custom"}); //NO I18N
			this.set("model.smsGateways",smsGateways); //NO I18N
		}
		if(this.model.selectedGateWay===undefined){
			this.set("model.selectedGateWay",selectedGateWay); //NO I18N
		}
		this.set("model.smsGatewaysVsID",smsGatewaysVsID); //NO I18N

		if(this.model.task==="Add") { //NO I18N
			this.set("model.messageVariable","$message"); //NO I18N
		}
		this.set("showSerialModemExpiryMsg", (this.model.selectedGateWay==="Serial Modem" || this.model.selectedGateWay==="serialmodem")); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
	},
	smsGatewayChanged:function() {
		if(this.model.smsGatewayConfig!==undefined) {
			this.set("showSMSConfigMsg",(this.model.smsGatewayConfig[this.model.selectedGateWay]==="false")); //NO I18N
		}
	}.observes("model.selectedGateWay"), //NO I18N
	actions:{
		configSMSServer:function(flag) {
			opmGlobalRoute.transitionTo("Settings.Basic.SMS"); //NO I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.ChatTemplateConfigComponent = Ember.Component.extend({
	templateName:"chat-template-config", //NO I18N
	channelPrompt:Ember.I18n.t("webclient.slack.channel.select"), //NO I18N
	memberPrompt:Ember.I18n.t("webclient.slack.member.select"), //NO I18N
	hideSlackConfigLink:false,
	userImageOptions:{
		templateResult:function(state) {
			if (!state.id) {return state.text;}
			var $state = $("<span class='slack-image'><img src='"+state.id.split("_#_")[1]+"'/><span>"+state.text+"</span></span>"); //NO I18N
			return $state;
		}
	},
	initDefaults:function() {
		this.set("receiverTypeList",[ //NO I18N
			{name:Ember.I18n.t("opstor.inventory.infortrend.raid.channel"),	value:"channel"}, //NO I18N
			{name:Ember.I18n.t("webclient.slack.member"),	value:"user"} //NO I18N
		]);
		if(this.model.receiverType===undefined) {
			this.set("model.receiverType","channel"); //NO I18N
		}else {
			this.getReceiverTypeList();
		}
		var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/checkForAddon?AddOn=Chat"); //NO I18N
		this.set("hideSlackConfigLink",jsonData.SLACK_ENABLED); //NO I18N
		this.getSlackDetails();
	}.on("init"), //NO I18N
	didInsertElement:function() {
	},
	getReceiverTypeList:function() {
		this.set("receiverTypeList",nfa_getCheckedList(jQuery.extend(true,[],this.receiverTypeList),"value",this.model.receiverType)); //NO I18N
	}.observes("model.receiverType"), //NO I18N
	getSlackChannels:function(profileDetails) {
		if(this.model.slackChannelList===undefined) {
			var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getSlackChannels"); //NO I18N
			if(jsonData.error!==undefined){
				showMessage(jsonData);
			}else{
				this.set("model.slackChannelList",jsonData); //NO I18N
			}
		}
	},
	getSlackUsers:function(profileDetails) {
		if(this.model.slackUserList===undefined) {
			var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getSlackUsers"); //NO I18N
			if(jsonData.error!==undefined){
				showMessage(jsonData);
			}else {
				var userIndex=0;
				for(var i=0;i<jsonData.length;i++) {
					if(jsonData[i].id===this.model.slackMemberID) {
						userIndex=i;
					}
					jsonData[i].id=jsonData[i].id+"_#_"+jsonData[i].image; //NO I18N
				}
				this.set("model.slackUserList",jsonData); //NO I18N
				this.set("model.slackUserID",jsonData[userIndex].id); //NO I18N
			}
		}
	},
	slackUserChanged:function() {
		if(this.model.slackUserID!==undefined && this.model.slackUserID!==null) {
			this.set("model.slackMemberID",this.model.slackUserID.split("_")[0]); //NO I18N
		}
	}.observes("model.slackUserID"), //NO I18N
	getSlackDetails:function() {
		if(this.hideSlackConfigLink) {
			if(this.model.receiverType==="channel") { //NO I18N
				this.getSlackChannels();
			}else {
				this.getSlackUsers();
			}
		}
	},
	actions:{
		slackSendToChange:function(receiverType) {
			if(this.model.receiverType!==receiverType) {
				this.set("model.receiverType",receiverType); //NO I18N
				this.getSlackDetails();
			}
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.ConfigletsTemplateConfigComponent = Ember.Component.extend({
        templateName:"configlets-template-config",//NO I18N
        listAllConfiglets : [],
        configletSelectedId : false,
        configletContent : false,
        init : function(){
            this._super.apply(this, arguments);
            if(!this.model) {
                this.set("model", {});// NO I18N
            } else {
                if(this.model.configletId){
                    this.set('configletSelectedId', this.model.configletId); // NO I18N
                }
            }
            if(!this.ncmConfigletVariables){
                this.set('ncmConfigletVariables', []); // NO I18N
            }
            this.loadConfiglets();
        },
        loadConfiglets : function(){
            if(!window.OPM.userPermissions.ncmConfigAutomationChangeNotificationsWrite || !window.OPM.userPermissions.ncmConfigAutomationConfigletsRead){
                return;
            }
            var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/listAllConfiglets?HIDE_PROG_CONFIGLET=false'; //No I18N
            var jsonData = opm_ajaxGetResponse(ajaxRequestUrl);
            var configlets = jsonData.rows;
            this.listAllConfiglets = [];
            this.listAllConfiglets.push({
                key : -1,
                value : 'none' // NO I18N
            });
            for(var i = 0; i < configlets.length; i++){
                this.listAllConfiglets.push(
                    {
                        key : configlets[i].id,
                        value : configlets[i].cell[1]
                    }
                );
            }

        },
        hideDropdown : function(e){
            for(var i = 0; i < this.ncmConfigletVariables.length; i++){
                $('#configletvalue_'+i+'_dropdown').hide();
            }
        },
        actions:{
            configletVariableSel : function(index){
                if(this.type == 'v1'){
                  return;
                }
                this.hideDropdown();
                $('#configletvalue_'+index+'_dropdown').show();
            },
            onActionAddConfiglet: function () {
                  OPMClient.NCMConfigAutomationModel.addActionConfiglets();
              }

        },
        configletSelected : function(){
            if(!window.OPM.userPermissions.ncmConfigAutomationChangeNotificationsWrite || !window.OPM.userPermissions.ncmConfigAutomationConfigletsRead){
                return;
            }
            if(this.configletSelectedId > 0){
                var configletData = OPMClient.NCMComplianceRulesController.getConfigletDetails(this.configletSelectedId);
                if(configletData){
                    var configletVariables = configletData.variables;
                    if(configletVariables && configletVariables.length > 0){
                        var localVariables = [];
                        var copyValues = jQuery.extend(true, [], this.ncmConfigletVariables || []);
                        for(var i = 0; i < configletVariables.length; i++){
                            var variableName = configletVariables[i].name;
                            var variableValue = '';

                            if(this.model.configletsVariables && this.model.configletsVariables[variableName]){
                                variableValue = this.model.configletsVariables[variableName];
                            }
                            var variableData = {
                                name : variableName,
                                value : variableValue
                            };
                            for(var j = 0; j < copyValues.length; j++){
                                if(copyValues[j].name == variableData.name){
                                    variableData.value = copyValues[j].value;
                                    break;
                                }
                            }
                            variableData.displayName = configletVariables[i].displayName ? configletVariables[i].displayName : configletVariables[i].name;
                            localVariables.push(variableData);
                        }
                        this.set('ncmConfigletVariables', localVariables); // NO I18N
                    } else {
                        this.set('ncmConfigletVariables', false); // NO I18N
                    }
                    if(configletData.templateContent){
                        this.set('configletContent', configletData.templateContent); // NO I18N
                    } else {
                        this.set('configletContent', false); // NO I18N
                    }
                }
                this.set("model.selectedConfiglet", this.configletSelectedId);//NO I18N
            }
        }.observes('configletSelectedId'), //NO I18N
        willDestroyElement: function(){
            document.removeEventListener('click', this.dropDownSelClassRemover);
            $('#'+this.elementId).find('*').remove();
        }
});

OPMClient.RunProgramTemplateConfigComponent = Ember.Component.extend({
	templateName:"run-program-template-config", //NO I18N
	initDefaults:function() {
		if(this.model.task==="Add") { //NO I18N
			this.set("model.messageVariable",""); //NO I18N
			this.set("model.errappend",false); //NO I18N
			this.set("model.append",false); //NO I18N
		}
		this.set("model.msgVariablePrompt",Ember.I18n.t("webclient.admin.profiledetails.ArgumentVariable")); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {	
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});


OPMClient.LogTicketTemplateConfigComponent = Ember.Component.extend({
	templateName:"log-ticket-template-config", //NO I18N
	initDefaults:function() {
		var self = this;
		var serviceList = [
			{name:Ember.I18n.t("webclient.home.servicedesk"),	value:"serviceDesk",className:"active", isCITInternal:false}, //NO I18N
			{name:Ember.I18n.t("webclient.servicenow.title"),	value:"serviceNow",	className:"", isCITInternal:false}, //NO I18N
			{name:Ember.I18n.t("webclient.jira.nppage"),	value:"serviceDeskJira",	className:"", isCITInternal:false}, //NO I18N
			{name:Ember.I18n.t("webclicent.ondemand.title"),	value:"serviceDeskOnDemand",	className:"", isCITInternal:false} //NO I18N
		];

		//getting integrations introduced over CITInternal framework;
		var citIntegrations = getAllCustomIntegrations(true, 'INCIDENT');//No I18N
		$.each(citIntegrations, function(key, value){
			serviceList.pushObject({name:value.displayName,	value:value.templateName, className:"", isCITInternal:true, templateObj : value});
		});

        if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
            var allowed = ["serviceDesk", "serviceNow", "serviceDeskOnDemand"]; //NO I18N
            serviceList = serviceList.filter(function(s){ return allowed.indexOf(s.value) !== -1; });
            if(serviceList.length > 0) {
                serviceList[0].className = "active"; //NO I18N
                for(var i = 1; i < serviceList.length; i++) {
                    serviceList[i].className = "";
                }
            }
        }

		this.set("serviceList",serviceList); //NO I18N
		this.set("model.serviceDeskLists",{}); //NO I18N
		if(this.model.serviceNowLists===undefined) {
			this.set("model.serviceNowLists",{}); //NO I18N
		}
		this.set("model.selectPrompt",{name:Ember.I18n.t("webclient.map.flash.chooseAValue"),value:((this.model.serviceType==="serviceDesk")?"none":"")}); //NO I18N
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/checkForAddon?AddOn=helpDesk"); //NO I18N
		this.set("model.serviceDeskEnabled",response.serviceDeskEnabled); //NO I18N
		this.set("model.serviceNowEnabled",response.serviceNowEnabled); //NO I18N
		this.set('model.serviceDeskOnDemandEnabled',response.serviceDeskOnDemandEnabled);//No I18n
		this.set('model.serviceDeskJiraEnabled',response.jiraEnabled);//No I18n
		this.send("serviceTypeChanged",(this.model.serviceType || "serviceDesk"),"",this.model.CITInternal); //NO I18N

		$.each(citIntegrations, function(key, value){
			self.set("model."+value.templateName+'',response[value.templateName] );//No I18N
		});

		for(var iter = 0; iter < self.get('serviceList').length ; iter++){
			if(self.get('serviceList')[iter].templateObj != undefined){
				self.get('serviceList')[iter].templateObj.isEnabled = self.get("model."+self.get('serviceList')[iter].templateObj.templateName);
			}
		}
		// $.each(serviceList, function(key, value){
		// 	self.get('customintegration')[iter].isEnabled = jsonData[self.get('customintegration')[iter].templateName];
		// 	if(value.templateObj != null){
		// 		value.templateObj.isEnabled = self.get("model."+value.templateObj.templateName);
		// 	}
		// });


	}.on("init"), //NO I18N
	didInsertElement:function() {
	},
	// getCITInternalNpFields:function(templateObj){
	// 	var self = this;
	// 	var npTemplateDetails = {};
	// 	npTemplateDetails.internalTemplateId = templateObj.templateId;
	// 	npTemplateDetails.internalTemplateName = templateObj.templateName;
	// 	npTemplateDetails.internalTemplateIsEnabled = templateObj.isEnabled;
	// 	npTemplateDetails.internalTemplateDisplayName = templateObj.displayName;
	// 	npTemplateDetails.internalTemplatetype = templateObj.templateType;
	// 	if(templateObj != null && templateObj != undefined && templateObj.templateName != null && templateObj.templateName != undefined && templateObj.templateId != null && templateObj.templateId != undefined)
	// 		{
	// 			var postData = {
	// 				templateId : templateObj.templateId,
	// 				productName : templateObj.templateName
	// 			};
	// 			$.ajax({	
	// 				url:window.OPM.apiUrlPattern+"/admin/getInternalCITemplateNPFields",//No I18N
	// 				method:'GET',//No I18N
	// 				async:false,
	// 				self:self,
	// 				data:postData,
	// 				msgID:"",
	// 				beforeSend: function(){
	// 					this.msgID = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.cit.internal.integration.waitmsg',{param0:templateObj.displayName}));//No I18N
	// 					$('#cit_clearfix').css({'display':'block'});
	// 				},
	// 				success:function(jsonData){
	// 					if(jsonData.error==undefined){
	// 						npTemplateDetails.internalTemplatenpFields = jsonData;
	// 						npTemplateDetails.isFieldsFetched = true;
	// 						Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
	
	// 						$("#"+this.msgID).remove();
	// 						$('#cit_clearfix').css({'display':'none'});
	// 					}
	// 				}
	// 			});
	// 		}else{
	// 			opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.projectnotselected',this));//No I18N
	// 		}
	// },
	actions:{
		serviceTypeChanged:function(type,className, isCITInternal, templateObj) {
			if(className!=="active") { //NO I18N
				this.set("model.serviceType",type); //NO I18N
				var list = jQuery.extend(true,[],this.serviceList);
				for(var i=0;i<list.length;i++) {
					list[i].className = (list[i].value===type)?"active":""; //NO I18N
				}
				this.set("serviceList",list); //NO I18N
				if(isCITInternal && templateObj!=undefined){
					getCITInternalNpFields(templateObj, this);
					this.set("model.CITInternal",true); //NO I18N
				}else{
					this.set("model.CITInternal",false); //NO I18N
				}
				if(isCITInternal){
					this.set("model.CITInternal",true); //NO I18N
				}
			}
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.SIEMTemplateComponent = Ember.Component.extend({
	templateName:"SIEM-Template", //NO I18N
	initDefaults:function() {
		var self = this;
		if(window.OPM.enableSplunk && OPMClient.SettingsNotificationsController.get('siemObject') == undefined || (OPMClient.SettingsNotificationsController.get('siemObject') != undefined && OPMClient.SettingsNotificationsController.get('siemObject.productName') == undefined)) { //NO I18N
			self.send("moveToSIEMProfile",""); //NO I18N
		}		
	}.on("init"), //NO I18N
	ncmVariableListChanged:function() {
		if((this.get('isProfile') == false || this.get('isProfile') == 'false') && OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) { //NO I18N
			var options = nt_getNCMDropdownOptions(this.get('model') || {});
			this.set("usesNCMVariables", true); //No I18n
			this.set("dropdownvalues", options); //No I18n
			OPMClient.SettingsConfigurationController.set('dropdownoptions', options); //No I18N
		}
	}.observes("model.variableList", "model.variableList.[]"), //NO I18N
	didInsertElement:function() {
		var self = this;
		if((self.get('isProfile') == false || self.get('isProfile') == 'false') && OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) { //NO I18N
			self.ncmVariableListChanged();
		} else if(self.get('isProfile') == false || self.get('isProfile') == 'false') { //NO I18N
			var maintabs = new Array();
            var inside=new Array();
            var jsonData =opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables",{isNotificationTemplate:true});//No I18N
				var dropdowndatatemplate = {}; 
				var insidetemplate=new Array();
				dropdowndatatemplate.key=Ember.I18n.t('webclient.admin.profiledetails.message.SelectValue',this);//NO I18N
				var insidedropdowndatatemplate = {};   
				insidedropdowndatatemplate.key=Ember.I18n.t('webclient.default',this);//NO I18N
                insidedropdowndatatemplate.value=Ember.I18n.t('webclient.mail.message.model',this);//NO I18N
				insidetemplate.push(insidedropdowndatatemplate);
				dropdowndatatemplate.value=insidetemplate;
				maintabs.push(dropdowndatatemplate);
                var dropdowndata = {};
                $.each(jsonData,function(key,values)
                {
                    var count=0;
                    dropdowndata = {};
                    dropdowndata.key=key;
                    inside=[];
                    var insidedropdowndata = {};
                    $.each(values,function(kee,val)
                    {
                        insidedropdowndata = {};
                        insidedropdowndata.key=val.key;
                        insidedropdowndata.value=val.value;
                        inside.push(insidedropdowndata);
                        count=count+1;
                    });
                    dropdowndata.value=inside;
                    maintabs.push(dropdowndata);
                });
			self.set("dropdownvalues", maintabs);//No I18n
            OPMClient.SettingsConfigurationController.set('dropdownoptions',maintabs);//No I18N
			setMailVariablesForNT();
		}
	},
	actions:{
		moveToSIEMProfile: function(productName,divId){
			
			var self=this;
			// self.siemGetDetails(productName);
			siemGetDetails(productName);
		},
		siemTypeChanged:function(type,className) {
			siemGetDetails(type);
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
		if(this.get("usesNCMVariables")) {
			// OPM templates reload their own variables when this is empty
			OPMClient.SettingsConfigurationController.set('dropdownoptions', []); //No I18N
		}
		OPMClient.SettingsNotificationsController.set('siemObject',{});//No I18N
		if($("#siemmenu").hasClass("active")){
			$("#siemmenu").removeClass("active");//No I18N
		}
		if($("#splunkmenu").hasClass("active")){
			$("#splunkmenu").removeClass("active");//No I18N
		}
	}
});

OPMClient.ServiceDeskTemplateConfigComponent = Ember.Component.extend({
	templateName:"service-desk-template-config", //NO I18N
	didInsertElement:function() {
		if(this.model.serviceDeskEnabled) {
			this.getDefaultTicketValues(false);
		}
	},
	getDefaultTicketValues:function(isRefresh) {
		if(this.lists.categoryList===undefined || isRefresh) {
			var apiURL = window.OPM.apiUrlPattern+"/admin/getDefaultLogaTicketValues"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("showErrorMsg",false); //NO I18N
					self.set("lists.categoryList",jsonData.categoryList); //NO I18N
					self.set("lists.priorityList",jsonData.priorityList); //NO I18N
					self.set("lists.groupList",jsonData.grpTechList); //NO I18N
					self.updateDefaultTicketValues();
				}else {
					self.set("showErrorMsg",true); //NO I18N
					nfa_infoMsgs(jsonData);
					delete self.lists.categoryList;
					delete self.lists.priorityList;
					delete self.lists.groupList;
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdp.getticketmsg")); //NO I18N
		}else {
			this.updateDefaultTicketValues();
		}
	},
	updateDefaultTicketValues:function() {
		if(!this.showErrorMsg) {
			this.set("categoryList",jQuery.extend(true,[],this.lists.categoryList)); //NO I18N
			this.set("priorityList",jQuery.extend(true,[],this.lists.priorityList)); //NO I18N
			this.set("groupList",jQuery.extend(true,[],this.lists.groupList)); //NO I18N
		}
	},
	getTicketSubcategory:function() {
		if(this.ticketCategoryID!==""){ //NO I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getLogaTicketSubcategory"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("subCategoryList",jsonData); //NO I18N
				}else {
					self.set("subCategoryList",[]); //NO I18N
					self.set("ticket.ticketSubCategory",""); //NO I18N
					self.set("ticketSubCategoryID",""); //NO I18N
					nfa_infoMsgs(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{categoryID:this.ticketCategoryID},callBckFunc,this,Ember.I18n.t("webclient.sdp.getSubCatmsg")); //NO I18N
		}
	}.observes("ticketCategoryID"), //NO I18N
	getTicketItems:function(subCategoryID) {
		if(this.ticketSubCategoryID!=="") { //NO I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getLogaTicketItems"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("ticketItemList",jsonData); //NO I18N
				}else {
					self.set("ticketItemList",[]); //NO I18N
					self.set("ticket.ticketItem",""); //NO I18N
					self.set("ticketItemID",""); //NO I18N
					nfa_infoMsgs(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{subCategoryID:this.ticketSubCategoryID},callBckFunc,this,Ember.I18n.t("webclient.sdp.getItemsmsg")); //NO I18N
		}
	}.observes("ticketSubCategoryID"), //NO I18N
	getTicketTechnicians:function(groupID) {
		if(this.ticketGroupID!=="") {
			var apiURL = window.OPM.apiUrlPattern+"/admin/getLogaTicketTechnicians"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("technicianList",jsonData); //NO I18N
				}else {
					self.set("technicianList",[]); //NO I18N
					self.set("ticket.ticketTechnician",""); //NO I18N
					self.set("ticketTechnicianID",""); //NO I18N
					nfa_infoMsgs(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{groupID:this.ticketGroupID},callBckFunc,this,Ember.I18n.t("webclient.sdp.getticketmsg")); //NO I18N
		}
	}.observes("ticketGroupID"), //NO I18N
	actions:{
		refreshServiceDesk:function() {
			var apiURL = window.OPM.apiUrlPattern+"/admin/refreshSDPTicketFields"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData!==undefined) {
					self.getDefaultTicketValues(true);
				}
			};
			nfa_postAjaxResponseWithAsync(apiURL, {}, callBckFunc, {}, Ember.I18n.t("webclient.sdp.refreshmsg",{param0:window.OPM.productName})); //NO I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.ServiceDeskCloudTemplateComponent = Ember.Component.extend({
	templateName:"service-desk-cloud-template", //NO I18N
	ticketPrompt:Ember.I18n.t("webclient.map.flash.chooseAValue"), //NO I18N
	didInsertElement:function(){
		this.getOnDemandDetails(); 
	},
	getOnDemandDetails: function(){
		var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandCategories"; //NO I18N
		var callBckFunc = function(jsonData,self){
			if(jsonData.error === undefined){
				self.set("sdpOdTicketDetails", jsonData); //No I18N
			}else{
				showMessage(jsonData);
			}
		};
		nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpondemand.getticketmsg", {productName: window.OPM.productName})); //NO I18N
	},
	getTicketSubcategory: function(){
		if(this.ticketCategoryID !== undefined){
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandSubCategories?categoryID="+this.ticketCategoryID; //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("sdpOdTicketDetails.subCategoryList",jsonData); //NO I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getsubcatmsg")); //NO I18N
		}else{
			this.set("sdpOdTicketDetails.subCategoryList",[]); //No I18N
			this.set("ticket.ticketSubCategory",""); //No I18N
			this.set("sdpOdTicketDetails.itemList",[]); //No I18N
			this.set("ticket.ticketItem",""); //No I18N
		}
	}.observes("ticketCategoryID"), //No I18N
	getTicketItems: function(){
		if(this.ticketCategoryID !== undefined && this.ticketSubCategoryID !== undefined){
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandItems?categoryID="+this.ticketCategoryID+"&subCatID="+this.ticketSubCategoryID; //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("sdpOdTicketDetails.itemList",jsonData); //NO I18N
				}else {
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getitemmsg")); //NO I18N
		}else{
			this.set("sdpOdTicketDetails.itemList",[]); //No I18N
			this.set("ticket.ticketItem",""); //No I18N
		}
	}.observes("ticketSubCategoryID"), //No I18N
	getTicketGroups: function(){
		if(this.ticketSiteID !== undefined){
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandGroups?siteID="+this.ticketSiteID; //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("sdpOdTicketDetails.groupDetails",jsonData); //NO I18N
					self.set("sdpOdTicketDetails.technicianDetails", []); //No I18N
					self.set("ticket.ticketTechnician",""); //No I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getgroupmsg")); //NO I18N
		}else{
			if(window.OPM.isMSPEdition){
				this.set("sdpOdTicketDetails.groupDetails",[]);//No I18N
				this.set("ticket.ticketGrpTech",""); //No I18N
			}else{
				var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandCategories"; //No I18N
				var callBckFunc = function(jsonData,self){
					if(jsonData.error === undefined){
						self.set("sdpOdTicketDetails.groupDetails", jsonData.groupDetails); //No I18N
						self.set("sdpOdTicketDetails.technicianDetails", jsonData.technicianDetails); //No I18N
					}else{
						showMessage(jsonData);
					}
				};
				nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpondemand.getticketmsg")); //NO I18N
			}
		}
	}.observes("ticketSiteID"),//No I18N
	getTicketTechnicians: function(){
		if(this.ticketGroupID !== undefined){
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandTechnicians?siteID="+(this.ticketSiteID === undefined ? 'noSelected' : this.ticketSiteID)+"&groupID="+this.ticketGroupID; //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("sdpOdTicketDetails.technicianDetails",jsonData.technicianDetails); //NO I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getTechmsg")); //NO I18N
		}
		else if(this.ticketGroupID === undefined && this.ticketSiteID === undefined){
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPOnDemandCategories"; //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("sdpOdTicketDetails.technicianDetails", jsonData.technicianDetails); //No I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpondemand.getticketmsg")); //NO I18N
		}
		else{
			this.set("sdpOdTicketDetails.technicianDetails",[]); //No I18N
		}
		this.set("ticket.ticketTechnician",""); //No I18N
	}.observes("ticketGroupID"), //No I18N
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.ServiceDeskMspCloudTemplateComponent = Ember.Component.extend({
	classNames: ['service-desk-msp-cloud-template'], //NO I18N
	templateName:"service-desk-msp-cloud-template", //NO I18N
	ticketPrompt:Ember.I18n.t("webclient.map.flash.chooseAValue"), //NO I18N
	isInitialLoad: true,
	mandatoryTemplateFields: [],
	savedMandatoryFieldValues: {},
	requesterList: [],
	isCategoryMandatory: false,
	isSubCategoryMandatory: false,
	isItemMandatory: false,
	isSiteMandatory: false,
	isGroupMandatory: false,
	isTechnicianMandatory: false,
	isPriorityMandatory: false,
	isUrgencyMandatory: false,
	isImpactMandatory: false,
	isDescriptionMandatory: false,
	initDefaults:function(){
		if(this.model.selectPrompt === undefined){
			this.set("model.selectPrompt",{name:Ember.I18n.t("webclient.map.flash.chooseAValue"),value:""}); //NO I18N
		}
		if(this.model.subjectVariable === undefined){
			this.set("model.subjectVariable",nt_getDefaultSubjectVariables()); //NO I18N
		}
		if(this.model.messageVariable === undefined){
			this.set("model.messageVariable",nt_getDefaultMessageVariables()); //NO I18N
		}
		if(this.model.variableList === undefined){
			this.set("model.variableList",nt_getNotificationTemplateVariables("LogTicket")); //NO I18N
		}
		if(this.model.subVariablePrompt === undefined){
			this.set("model.subVariablePrompt",Ember.I18n.t("webclient.admin.profiledetails.subject.SelectValue")); //NO I18N
		}
		if(this.model.msgVariablePrompt === undefined){
			this.set("model.msgVariablePrompt",Ember.I18n.t("webclient.admin.profiledetails.message.SelectValue")); //NO I18N
		}
		if(this.model.serviceDeskMSPCloudEnabled === undefined){
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/checkForAddon",{AddOn:"helpDesk"}); //NO I18N
			this.set("model.serviceDeskMSPCloudEnabled", response.serviceDeskMSPCloudEnabled || false); //NO I18N
		}
		if(this.model.savedMandatoryFieldValues !== undefined){
			this.set("savedMandatoryFieldValues", this.model.savedMandatoryFieldValues); //NO I18N
		}
	}.on("init"), //NO I18N
	subjectVariableChanged:function(){
		var selectedVariable = this.get("model.selectedSubjectVariable"); //NO I18N
		if(selectedVariable===null || selectedVariable===undefined || selectedVariable==="" || selectedVariable==="default"){ //NO I18N
			this.set("model.subjectVariable",nt_getDefaultSubjectVariables()); //NO I18N
		}else{
			this.set("model.subjectVariable",this.model.subjectVariable+" "+selectedVariable); //NO I18N
		}
	}.observes("model.selectedSubjectVariable"), //NO I18N
	messageVariableChanged:function(){
		var selectedVariable = this.get("model.selectedMessageVariable"); //NO I18N
		if(selectedVariable===null || selectedVariable===undefined || selectedVariable==="" || selectedVariable==="default"){ //NO I18N
			this.set("model.messageVariable",nt_getDefaultMessageVariables()); //NO I18N
		}else{
			this.set("model.messageVariable",this.model.messageVariable+" \n"+selectedVariable); //NO I18N
		}
	}.observes("model.selectedMessageVariable"), //NO I18N
	didInsertElement:function(){
		if(this.get("model.savedMandatoryFieldValues") && $.isEmptyObject(this.get("savedMandatoryFieldValues"))){
			this.set("savedMandatoryFieldValues", this.get("model.savedMandatoryFieldValues")); //No I18N
		}
		if(this.model.serviceDeskMSPCloudEnabled){
			this.getMSPCloudDetails();
		}
	},
	getMSPCloudDetails: function(){
		var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODFieldValues"; //NO I18N
		var callBckFunc = function(jsonData,self){
			if(jsonData.error === undefined){
				self.set("priorityDetails", jsonData.priorityDetails || []); //No I18N
				self.set("urgencyDetails", jsonData.urgencyDetails || []); //No I18N
				self.set("impactDetails", jsonData.impactDetails || []); //No I18N
				self.set("opmCustomerList", jsonData.OPMCustomerTagList || []); //No I18N
			}else{
				showMessage(jsonData);
			}
		};
		nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpmspcloud.getticketmsg", {productName: window.OPM.productName})); //NO I18N
	},
	customerChanged: function(){
		var customerId = this.get("ticketCustomerID"); //No I18N
		if(customerId && customerId !== ''){
			this.getCustomerFields(customerId);
			this.getIncidentTemplates(customerId);
			this.set("mandatoryTemplateFields", []); //No I18N
		}else{
			this.set("categoryDetails", []); //No I18N
			this.set("subCategoryList", []); //No I18N
			this.set("itemList", []); //No I18N
			this.set("siteDetails", []); //No I18N
			this.set("groupDetails", []); //No I18N
			this.set("technicianDetails", []); //No I18N
			this.set("incidentTemplateList", []); //No I18N
			this.set("requesterList", []); //No I18N
			this.set("mandatoryTemplateFields", []); //No I18N
		}
		this.set("isCategoryMandatory", false); //No I18N
		this.set("isSubCategoryMandatory", false); //No I18N
		this.set("isItemMandatory", false); //No I18N
		this.set("isSiteMandatory", false); //No I18N
		this.set("isGroupMandatory", false); //No I18N
		this.set("isTechnicianMandatory", false); //No I18N
		this.set("isPriorityMandatory", false); //No I18N
		this.set("isUrgencyMandatory", false); //No I18N
		this.set("isImpactMandatory", false); //No I18N
		this.set("isDescriptionMandatory", false); //No I18N
	}.observes("ticketCustomerID"), //No I18N
	getCustomerFields: function(customerId){
		var self = this;
		var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODFieldValues?customerId="+encodeURIComponent(customerId); //No I18N
		var isInitial = this.get("isInitialLoad"); //No I18N
		var callBckFunc = function(jsonData,self){
			if(jsonData.error === undefined){
				self.set("categoryDetails", jsonData.categoryDetails || []); //No I18N
				self.set("siteDetails", jsonData.siteDetails || []); //No I18N
				self.set("requesterList", jsonData.requesterList || []); //No I18N
				self.set("priorityDetails", jsonData.priorityDetails || []); //No I18N
				self.set("urgencyDetails", jsonData.urgencyDetails || []); //No I18N
				self.set("impactDetails", jsonData.impactDetails || []); //No I18N
				if(!isInitial){
					self.set("subCategoryList", []); //No I18N
					self.set("itemList", []); //No I18N
					self.set("groupDetails", []); //No I18N
					self.set("technicianDetails", []); //No I18N
					self.set("ticket.ticketCategory", ""); //No I18N
					self.set("ticket.ticketSubCategory", ""); //No I18N
					self.set("ticket.ticketItem", ""); //No I18N
					self.set("ticket.ticketSite", ""); //No I18N
					self.set("ticket.ticketGrpTech", ""); //No I18N
					self.set("ticket.ticketTechnician", ""); //No I18N
				}
				self.set("isInitialLoad", false); //No I18N
			}else{
				showMessage(jsonData);
			}
		};
		nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpmspcloud.getticketmsg", {productName: window.OPM.productName})); //NO I18N
	},
	getIncidentTemplates: function(customerId){
		var self = this;
		var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODIncidentTemplates?customerId="+encodeURIComponent(customerId); //No I18N
		var callBckFunc = function(jsonData,self){
			if(jsonData.error === undefined){
				self.set("incidentTemplateList", jsonData.incidentTemplateList || []); //No I18N
				// After loading templates in edit mode, trigger mandatory fields fetch if template is already selected
				var savedTemplateId = self.get("ticket.ticketTemplate") || self.get("ticketTemplateID"); //No I18N
				if(savedTemplateId && savedTemplateId !== ''){
					self.getTemplateMandatoryFields(savedTemplateId);
				}
			}else{
				showMessage(jsonData);
			}
		};
		nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpmspcloud.getticketmsg", {productName: window.OPM.productName})); //NO I18N
	},

	templateChanged: function(){
		var templateId = this.get("ticketTemplateID"); //No I18N
		if(templateId && templateId !== ''){
			this.getTemplateMandatoryFields(templateId);
		}else{
			this.set("mandatoryTemplateFields", []); //No I18N
			this.set("isCategoryMandatory", false); //No I18N
			this.set("isSubCategoryMandatory", false); //No I18N
			this.set("isItemMandatory", false); //No I18N
			this.set("isSiteMandatory", false); //No I18N
			this.set("isGroupMandatory", false); //No I18N
			this.set("isTechnicianMandatory", false); //No I18N
			this.set("isPriorityMandatory", false); //No I18N
			this.set("isUrgencyMandatory", false); //No I18N
			this.set("isImpactMandatory", false); //No I18N
			this.set("isDescriptionMandatory", false); //No I18N
		}
	}.observes("ticketTemplateID"), //No I18N
	getTemplateMandatoryFields: function(templateId){
		var self = this;
		var customerId = this.get("ticketCustomerID") || ''; //No I18N
		var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODTemplateFields?templateId="+encodeURIComponent(templateId)+"&customerId="+encodeURIComponent(customerId); //No I18N
		var callBckFunc = function(jsonData,self){
			if(jsonData.error === undefined){
				var fields = jsonData.mandatoryFields || [];
				var savedFields = self.get("savedMandatoryFieldValues") || {}; //No I18N
				if($.isEmptyObject(savedFields) && self.get("model.savedMandatoryFieldValues")){
					savedFields = self.get("model.savedMandatoryFieldValues"); //No I18N
					self.set("savedMandatoryFieldValues", savedFields); //No I18N
				}
				var defaultFields = ["requester","category","subcategory","item","site","technician","group","description","impact","priority","urgency","subject"]; //No I18N
				// Set dynamic mandatory flags for default fields
				var mandatoryDefaultSet = {};
				for(var m = 0; m < fields.length; m++){
					mandatoryDefaultSet[fields[m].name.toLowerCase()] = true;
				}
				self.set("isCategoryMandatory", !!mandatoryDefaultSet.category); //No I18N
				self.set("isSubCategoryMandatory", !!mandatoryDefaultSet.subcategory); //No I18N
				self.set("isItemMandatory", !!mandatoryDefaultSet.item); //No I18N
				self.set("isSiteMandatory", !!mandatoryDefaultSet.site); //No I18N
				self.set("isGroupMandatory", !!mandatoryDefaultSet.group); //No I18N
				self.set("isTechnicianMandatory", !!mandatoryDefaultSet.technician); //No I18N
				self.set("isPriorityMandatory", !!mandatoryDefaultSet.priority); //No I18N
				self.set("isUrgencyMandatory", !!mandatoryDefaultSet.urgency); //No I18N
				self.set("isImpactMandatory", !!mandatoryDefaultSet.impact); //No I18N
				self.set("isDescriptionMandatory", !!mandatoryDefaultSet.description); //No I18N
				var fieldArray = [];
				var fieldCount = 0;
				for(var i = 0; i < fields.length; i++){
					var fieldName = fields[i].name;
					var fieldNameLower = fieldName.toLowerCase();
					if(defaultFields.indexOf(fieldNameLower) !== -1){
						continue;
					}
					var fieldId = fields[i].id;
					var savedValue = savedFields[fieldName] || ''; //No I18N
					var displayLabel = fieldName;
					if(displayLabel.indexOf('udf_fields.') === 0){ displayLabel = displayLabel.substring('udf_fields.'.length); }//No I18N
					fieldCount++;
					fieldArray.push({
						name: fieldName,
						id: fieldId,
						label: displayLabel,
						inputId: "sdpmspod_mf_" + fieldName,//No I18N
						value: savedValue,
						newRow: (fieldCount % 2 === 0)
					});
				}
				self.set("mandatoryTemplateFields", fieldArray); //No I18N
			}else{
				showMessage(jsonData);
				self.set("mandatoryTemplateFields", []); //No I18N
			}
		};
		nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpmspcloud.getticketmsg", {productName: window.OPM.productName})); //NO I18N
	},
	getTicketSubcategory: function(){
		var categoryId = this.get("ticketCategoryID"); //No I18N
		if(categoryId && categoryId !== ''){
			var customerId = this.get("ticketCustomerID") || ''; //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODFieldValues?fieldName=subcategories&categoryID="+categoryId+"&customerId="+encodeURIComponent(customerId); //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("subCategoryList", jsonData.subCategoryList || []); //No I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getsubcatmsg")); //NO I18N
		}else{
			this.set("subCategoryList", []); //No I18N
			this.set("itemList", []); //No I18N
			this.set("ticket.ticketSubCategory", ""); //No I18N
			this.set("ticket.ticketItem", ""); //No I18N
		}
	}.observes("ticketCategoryID"), //No I18N
	getTicketItems: function(){
		var subCategoryId = this.get("ticketSubCategoryID"); //No I18N
		var categoryId = this.get("ticketCategoryID"); //No I18N
		if(categoryId && subCategoryId && subCategoryId !== ''){
			var customerId = this.get("ticketCustomerID") || ''; //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODFieldValues?fieldName=items&categoryID="+categoryId+"&subCategoryID="+subCategoryId+"&customerId="+encodeURIComponent(customerId); //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("itemList", jsonData.itemList || []); //No I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getitemmsg")); //NO I18N
		}else{
			this.set("itemList", []); //No I18N
			this.set("ticket.ticketItem", ""); //No I18N
		}
	}.observes("ticketSubCategoryID"), //No I18N
	getTicketGroups: function(){
		var siteId = this.get("ticketSiteID"); //No I18N
		if(siteId && siteId !== ''){
			var customerId = this.get("ticketCustomerID") || ''; //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODFieldValues?fieldName=groups&siteID="+siteId+"&customerId="+encodeURIComponent(customerId); //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("groupDetails", jsonData.groupDetails || []); //No I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getgroupmsg")); //NO I18N
		}else{
			this.set("groupDetails", []); //No I18N
		}
		if(!this.get("isInitialLoad") && this.get("groupDetails.length") > 0){
			this.set("ticket.ticketGrpTech", ""); //No I18N
			this.set("ticket.ticketTechnician", ""); //No I18N
			this.set("technicianDetails", []); //No I18N
		}
	}.observes("ticketSiteID"), //No I18N
	getTicketTechnicians: function(){
		var groupId = this.get("ticketGroupID"); //No I18N
		if(groupId && groupId !== ''){
			var customerId = this.get("ticketCustomerID") || ''; //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getSDPMSPODFieldValues?fieldName=technicians&groupID="+groupId+"&customerId="+encodeURIComponent(customerId); //No I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error === undefined){
					self.set("technicianDetails", jsonData.technicianDetails || []); //No I18N
				}else{
					showMessage(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.sdpod.getTechmsg")); //NO I18N
		}else{
			this.set("technicianDetails", []); //No I18N
		}
		if(!this.get("isInitialLoad") && this.get("technicianDetails.length") > 0){
			this.set("ticket.ticketTechnician", ""); //No I18N
		}
	}.observes("ticketGroupID"), //No I18N
	closeSDPMSPFieldDropdowns: function(){
		var sdpIcons = document.querySelectorAll('[id^="sdpmspodField_"]'); //No I18N
		for(var i = 0; i < sdpIcons.length; i++){
			sdpIcons[i].classList.remove('active'); //No I18N
		}
	},
	actions:{
		enableSDPMSPFieldDollarVar: function(inputId){
			var selectboxID = "sdpmspodField_" + inputId;//No I18N
			var iconElem = document.getElementById(selectboxID);
			if(!iconElem){
				return;
			}
			var isAlreadyOpen = iconElem.classList.contains('active'); //No I18N
			this.closeSDPMSPFieldDropdowns();
			if(isAlreadyOpen){
				return;
			}

			iconElem.classList.add('active'); //No I18N
		},
		setSDPMSPFieldDollarValue: function(inputId){
			var inputElem = document.getElementById(inputId);
			if(!inputElem){
				return;
			}
			var $inputElem = $(inputElem);
			var msgtxt = $inputElem.val();
			var varibletxt = OPMClient.SettingsConfigurationController.citInternal.value;
			$inputElem.val(msgtxt + varibletxt).trigger('change');//No I18N
			var self = this;
			var fields = self.get("mandatoryTemplateFields"); //No I18N
			if(fields){
				for(var i = 0; i < fields.length; i++){
					if(fields[i].inputId === inputId){
						Ember.set(fields[i], "value", $inputElem.val()); //No I18N
						break;
					}
				}
			}
			this.closeSDPMSPFieldDropdowns();
		}
	},
	willDestroyElement:function(){
		this.closeSDPMSPFieldDropdowns();
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.ServiceNowTemplateConfigComponent = Ember.Component.extend({
	templateName:"service-now-template-config", //NO I18N
	ticketPrompt:Ember.I18n.t("webclient.map.flash.chooseAValue"), //NO I18N
	initDefaults:function() {
	// 	this.set("itemOptions",{ //NO I18N
	// 		ajax: {
	// 			url:window.OPM.apiUrlPattern+"/admin/getServiceNowDefaultLogaTicketValues?fieldName=items", //NO I18N
	// 			dataType:"json", //NO I18N
	// 			delay: 250,
	// 			data:function(params) {
	// 				return {
	// 					searchTerm:params.term,
	// 					offset:params.offset
	// 				};
	// 			},
	// 			processResults:function(data,params) {
	// 				params.offset = data.offset || 50;
	// 				return {
	// 					results: data.results,
	// 					pagination: {
	// 						more:data.pagination.more
	// 					}
	// 				};
	// 			},
	// 			cache:true
	// 		},
	// 		minimumInputLength:1
	// 	});
	// 	if(this.model.itemName!==undefined) {
	// 		this.set("ticketItemList",[{name:this.model.itemName,sys_id:this.ticket.ticketItem}]); //NO I18N
	// 	}
		
		if(this.model.task==="Add") { //NO I18N
			this.set("ticket.ticketItem",""); //NO I18N
		}
		
	}.on("init"), //NO I18N
	ncmVariableListChanged:function() {
		if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
			this.set("usesNCMVariables", true); //No I18n
			OPMClient.SettingsConfigurationController.set('dropdownoptions', nt_getNCMDropdownOptions(this.get('model') || {})); //No I18N
		}
	}.observes("model.variableList", "model.variableList.[]"), //NO I18N
	didInsertElement:function() {
		// Populate dropdownoptions for per-field webhook variable icons in event section
		if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
			this.ncmVariableListChanged();
		} else if(!OPMClient.SettingsConfigurationController.get('dropdownoptions') || OPMClient.SettingsConfigurationController.get('dropdownoptions').length === 0){//NO I18N
			var maintabs = new Array();
			var inside = new Array();
			var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables",{isNotificationTemplate:true});//No I18N
			var dropdowndatatemplate = {};
			var insidetemplate = new Array();
			dropdowndatatemplate.key = Ember.I18n.t('webclient.admin.profiledetails.message.SelectValue',this);//NO I18N
			var insidedropdowndatatemplate = {};
			insidedropdowndatatemplate.key = Ember.I18n.t('webclient.default',this);//NO I18N
			insidedropdowndatatemplate.value = Ember.I18n.t('webclient.mail.message.model',this);//NO I18N
			insidetemplate.push(insidedropdowndatatemplate);
			dropdowndatatemplate.value = insidetemplate;
			maintabs.push(dropdowndatatemplate);
			var dropdowndata = {};
			$.each(jsonData,function(key,values){
				var count = 0;
				dropdowndata = {};
				dropdowndata.key = key;
				inside = [];
				var insidedropdowndata = {};
				$.each(values,function(kee,val){
					insidedropdowndata = {};
					insidedropdowndata.key = val.key;
					insidedropdowndata.value = val.value;
					inside.push(insidedropdowndata);
					count = count + 1;
				});
				dropdowndata.value = inside;
				maintabs.push(dropdowndata);
			});
			OPMClient.SettingsConfigurationController.set('dropdownoptions',maintabs);//No I18N
		}
		if(this.model.serviceNowEnabled) {
			// Pre-initialize with 'auto' option only. Remaining severity values fetched from SNOW via AJAX.
			if(!OPMClient.ApplicationController.get('snowEventSeverityOptions') || OPMClient.ApplicationController.get('snowEventSeverityOptions').length === 0){//NO I18N
				OPMClient.ApplicationController.set('snowEventSeverityOptions', [//NO I18N
					{value: 'auto', label: 'Auto (mapped from alarm severity)'}//NO I18N
				]);
			}
			this.getDefaultTicketValues();
		}
		// Per-profile event/incident radio toggle
		var self = this;
		$('input[name="snowTemplateTicketType"]').change(function(){
			if($(this).val() === 'event'){
				$('#snowTemplateIncidentFieldsDiv').hide();
				$('#snowTemplateEventFieldsDiv').show();
				OPMClient.prefillSnowEventDefaults('snow_tmpl_event');//No I18N
				self.set('model.snowTemplateEventSeverityValue', 'auto');//NO I18N
				$('#snow_tmpl_event_severity').val('auto');//NO I18N
			} else {
				$('#snowTemplateIncidentFieldsDiv').show();
				$('#snowTemplateEventFieldsDiv').hide();
				if(!self.get('model.subjectVariable')){//NO I18N
					self.set('model.subjectVariable', nt_getDefaultSubjectVariables());//NO I18N
				}
				if(!self.get('model.messageVariable')){//NO I18N
					self.set('model.messageVariable', nt_getDefaultMessageVariables());//NO I18N
				}
			}
		});
		// Keep Event type enabled by default; only Incident edit mode should block it.
		$('#snowTemplateTicketType_event').prop('disabled', false).parent().removeClass('jiraBlur');
		// Edit mode - populate event fields
		if(this.model.task !== "Add" && this.model.serviceNowTicket && this.model.serviceNowTicket.snowTicketType === 'event'){//NO I18N
			$('input[name="snowTemplateTicketType"][value="event"]').prop('checked', true);
			$('#snowTemplateIncidentFieldsDiv').hide();
			$('#snowTemplateEventFieldsDiv').show();
			var snEventFields = ['source','node','type','resource','metric_name','event_class','description','cmdb_ci','message_key','title'];//NO I18N
			for(var i=0; i<snEventFields.length; i++){
				var eKey = 'event_' + snEventFields[i];//NO I18N
				if(self.model.serviceNowTicket[eKey] !== undefined){
					$('#snow_tmpl_event_' + snEventFields[i]).val(self.model.serviceNowTicket[eKey]);
				}
			}
			self.set('model.snowTemplateEventSeverityValue', self.model.serviceNowTicket.event_severity || 'auto');//NO I18N
			// Set severity separately via afterRender so Ember select options are rendered
			Ember.run.scheduleOnce('afterRender', this, function(){ //NO I18N
				$('#snow_tmpl_event_severity').val(self.get('model.snowTemplateEventSeverityValue') || 'auto').trigger('change');//NO I18N
			});
		} else if(this.model.task !== "Add" && this.model.serviceNowTicket && this.model.serviceNowTicket.snowTicketType !== 'event'){//NO I18N
			// Editing an Incident template: disable Incident→Event switch (cascade delete issue on LogTicket FK)
			Ember.run.scheduleOnce('afterRender', this, function(){//NO I18N
				$('#snowTemplateTicketType_event').prop('disabled', true).parent().addClass('jiraBlur');
			});
		}
	},
	getDefaultTicketValues:function() {
		if(this.lists.categoryList===undefined) {
			var apiURL = window.OPM.apiUrlPattern+"/admin/getServiceNowDefaultLogaTicketValues"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("showErrorMsg",false); //NO I18N
					self.set("lists.categoryList",jsonData.result.categoryDetails); //NO I18N
					self.set("lists.priorityList",jsonData.result.priorityDetails); //NO I18N
					self.set("lists.groupList",jsonData.result.groupDetails); //NO I18N
					self.set("lists.impactList",jsonData.result.impactList); // NO I18N
					self.set("lists.urgencyList",jsonData.result.urgencyList); //NO I18N
					if (jsonData.result.eventSeverityOptions !== undefined) {
						OPMClient.ApplicationController.set('snowEventSeverityOptions', jsonData.result.eventSeverityOptions);//No I18N
						Ember.run.scheduleOnce('afterRender', self, function(){//NO I18N
							var savedSeverity = self.get('model.snowTemplateEventSeverityValue');//NO I18N
							if(savedSeverity){
								$('#snow_tmpl_event_severity').val(savedSeverity).trigger('change');//NO I18N
							} else if(!$('#snow_tmpl_event_severity').val()){
								$('#snow_tmpl_event_severity').val('auto');//NO I18N
							}
						});
					}
					self.updateDefaultTicketValues();
				}else {
					self.set("showErrorMsg",true); //NO I18N
					nfa_infoMsgs(jsonData);
					delete self.lists.categoryList;
					delete self.lists.priorityList;
					delete self.lists.groupList;
					delete self.lists.impactList;
					delete self.lists.urgencyList;
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,this,Ember.I18n.t("webclient.servicenow.getticketmsg")); //NO I18N
		}else {
			this.updateDefaultTicketValues();
		}
	},
	updateDefaultTicketValues:function() {
		if(!this.showErrorMsg) {
			this.set("categoryList",jQuery.extend(true,[],this.lists.categoryList)); //NO I18N
			this.set("priorityList",jQuery.extend(true,[],this.lists.priorityList)); //NO I18N
			this.set("groupList",jQuery.extend(true,[],this.lists.groupList)); //NO I18N
			this.set("impactList",jQuery.extend(true,[],this.lists.impactList)); //NO I18N
			this.set("urgencyList",jQuery.extend(true,[],this.lists.urgencyList)); //NO I18N
		}
	},
	getTicketSubcategory:function() {
		if(this.ticketCategoryID!==""){ //NO I18N
			var apiURL = window.OPM.apiUrlPattern+"/admin/getServiceNowLogaTicketSubcategory"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("subCategoryList",jsonData); //NO I18N
				}else {
					self.set("subCategoryList",[]); //NO I18N
					self.set("ticket.ticketSubCategory",""); //NO I18N
					self.set("ticketSubCategoryID",""); //NO I18N
					nfa_infoMsgs(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{categoryID:this.ticketCategoryID},callBckFunc,this,Ember.I18n.t("webclient.servicenow.getsubgrpmsg")); //NO I18N
		}
	}.observes("ticketCategoryID"), //NO I18N
	getTicketTechnicians:function(groupID) {
		if(this.ticketGroupID!=="") {
			var apiURL = window.OPM.apiUrlPattern+"/admin/getServiceNowLogaTicketTechnicians"; //NO I18N
			var callBckFunc = function(jsonData,self){
				if(jsonData.error===undefined){
					self.set("technicianList",jsonData); //NO I18N
				}else {
					self.set("technicianList",[]); //NO I18N
					self.set("ticket.ticketTechnician",""); //NO I18N
					self.set("ticketTechnicianID",""); //NO I18N
					nfa_infoMsgs(jsonData);
				}
			};
			nfa_getAjaxResponseWithAsync(apiURL,{groupID:this.ticketGroupID},callBckFunc,this,Ember.I18n.t("webclient.servicenow.gettechnicianmsg")); //NO I18N
		}
	}.observes("ticketGroupID"), //NO I18N
	eventTitleVariableChanged:function() {
		var selectedVariable = this.get("model.selectedEventTitleVariable"); //NO I18N
		if(selectedVariable !== undefined && selectedVariable !== null && selectedVariable !== '') {
			var currentVal = $('#snow_tmpl_event_title').val() || '';//NO I18N
			$('#snow_tmpl_event_title').val(currentVal + ' ' + selectedVariable);//NO I18N
		}
	}.observes("model.selectedEventTitleVariable"), //NO I18N
	eventDescVariableChanged:function() {
		var selectedVariable = this.get("model.selectedEventDescVariable"); //NO I18N
		if(selectedVariable !== undefined && selectedVariable !== null && selectedVariable !== '') {
			var currentVal = $('#snow_tmpl_event_description').val() || '';//NO I18N
			$('#snow_tmpl_event_description').val(currentVal + '\n' + selectedVariable);//NO I18N
		}
	}.observes("model.selectedEventDescVariable"), //NO I18N
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
		if(this.get("usesNCMVariables")) {
			OPMClient.SettingsConfigurationController.set('dropdownoptions', []); //No I18N
		}
	},
	actions:{
		enableWebhookIcon:function(requestValueID,selectboxID){
			$('.propertiesDropdown__icon[id!="'+selectboxID+'"]').removeClass('active');//No I18N
			if($("#"+selectboxID).hasClass("active")){
				$("#"+selectboxID).removeClass("active");//No I18N
			} else {
				$("#"+selectboxID).addClass("active");//No I18N
			}
		}
	}
});

OPMClient.WebAlarmTemplateConfigComponent = Ember.Component.extend({
	templateName:"web-alarm-template-config", //NO I18N
	showSoundUpload:false,
	selectAllInfoMsg:Ember.I18n.t("nfa.nTemplates.webAlarm.selectAllMsg"), //NO I18N
	isNotOfAdmin:!window.OPM.isAdministrator,
	initDefaults:function() {
		if(this.model.webAlarmUserList===undefined) {
			this.set("model.webAlarmUserList",this.getUserList()); //NO I18N
		}
		if(this.model.webAlarmSoundList===undefined) {
			var soundList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getWebAlarmSoundFiles"); //NO I18N
			this.set("model.webAlarmSoundList",soundList); //NO I18N
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		var self = this;
		Ember.run.schedule("afterRender",self,function() { //NO I18N
			if(self.isNotOfAdmin) {
				$(".userSelectionWrapper input:checkbox").prop("disabled",true); //NO I18N
			}
		});
	},
	getUserList:function() {
		var userList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/listWebAlarmUsers"); //NO I18N
		var users = [];
		$.each(userList, function(i,val){
			users.push({"roleList":i,"roleId":val.roleId,"roleName":val.roleName,"UserList":val.users,"totalUsers":val.users.length}); //NO I18N
		});
		userList = {};
		userList.associatedRoleIDs = [];
		userList.associatedUserIDs = [];

		var roles = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/v2/admin/listRoles"); //NO I18N
		if(this.isNotOfAdmin) {
			for(var i=0;i<roles.length;i++) {
				if(roles[i].roleName===window.OPM.role) {
					userList.associatedUserIDs.push(window.OPM.userId);
					roles = roles.splice(i,1);
					break;
				}
			}
		}
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

		if(this.model.task!=="Add") { //NO I18N
			userList.associatedRoleIDs = this.model.selectedRoleIDs;
			userList.associatedUserIDs = this.model.selectedUserIDs;
		}
		if(userList.associatedRoleIDs.length>0 || userList.associatedUserIDs.length>0) {
			userList.isEdit = true;
		}
		return userList;
	},
	actions:{
		showHideSoundUploadDiv:function(flag) {
			this.set("showSoundUpload",flag); //NO I18N
		},
		playSound:function() {
			var ping = new Audio(this.model.selectedAlarmSound);
			ping.play();
		},
		addNewSoundFile: function () {
			if(!opm_validateFields({"empty":["webAlarmSoundFile"]})) { //NO I18N
				return;
			}
			var fileObject = $("#webAlarmSoundFile")[0].files[0]; //NO I18N
			var fileParts = $("#webAlarmSoundFile").val().split("."); //NO I18N
			var fileExtension =fileParts[fileParts.length-1]; //NO I18N

			if(fileObject===undefined || fileExtension!=="mp3") { //NO I18N
				alert(Ember.I18n.t("webclient.np.webalarm.addSoundFile.extnAlert")); //NO I18N
			}else if(fileObject.name.length>50) {
				alert(Ember.I18n.t("webclient.np.webalarm.addSoundFile.lengthAlert")); //NO I18N
			}else if(fileObject.size>1024000) {
				alert(Ember.I18n.t("webclient.np.webalarm.addSoundFile.sizeAlert")); //NO I18N
			}else {
				var data = new FormData();
				data.append("soundFile",fileObject); //NO I18N
				var response = opm_ajaxMultiPostRequest(window.OPM.apiUrlPattern+"/admin/saveWebAlarmSoundFile",data,false); //NO I18N
				
				if(response!==undefined) {
					if(response.error!==undefined) {
						if (response.error.errorcode==="UNMATCHED_FILE_CONTENT_TYPE") { //NO I18N
							alert(Ember.I18n.t("webclient.np.webalarm.addSoundFile.unSupportAlert")); //NO I18N
						} else if (response.error.errorcode=="PATTERN_NOT_MATCHED") { //NO I18N
							alert(Ember.I18n.t("webclient.np.webalarm.addSoundFile.charAlert")); //NO I18N
						} else {
							opm_infoMsgs("errorMsg",response.error.message); //NO I18N
						}
					}else {
						var soundList = jQuery.extend(true,[],this.model.webAlarmSoundList);
						soundList.push(response);
						this.set("model.webAlarmSoundList",soundList); //NO I18N
						this.set("model.selectedAlarmSound",response.filePath); //NO I18N
						this.set("showSoundUpload",false); //NO I18N
					}
				}
			}
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.SyslogProfileTemplateConfigComponent = Ember.Component.extend({
	templateName:"syslog-profile-template-config", //NO I18N
	keyPress:function(e){
		if($(".unitValue").is(":focus")){return opm_isNumber(e);} //NO I18N
	},
	initDefaults:function() {
		if(this.model.task==="Add") { //NO I18N
			this.set("model.messageVariable","$message"); //NO I18N
		}
		if(this.model.syslogSeverityList===undefined) {
			this.set("model.syslogSeverityList",nt_getSyslogSeverityList()); //NO I18N
		}
		if(this.model.syslogFacilityList===undefined) {
			this.set("model.syslogFacilityList",nt_getSyslogFacilityList()); //NO I18N
		}
		if(this.model.sysLogSeverity===undefined) {
			this.set("model.sysLogSeverity","9"); //NO I18N
		}
		if(this.model.sysLogFacility===undefined) {
			this.set("model.sysLogFacility","0"); //NO I18N
		}
	}.on("init"), //NO I18N
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.TrapProfileTemplateConfigComponent = Ember.Component.extend({
	templateName:"trap-profile-template-config", //NO I18N
	keyPress:function(e){
		if($(".unitValue").is(":focus")){return opm_isNumber(e);} //NO I18N
	},
	initDefaults:function() {
		var snmpVersionList = [
			{name:"v1",value:"V1"},{name:"v2C",value:"V2C"},{name:"v3",value:"V3"} //NO I18N
		];
		this.set("snmpVersionList",snmpVersionList); //NO I18N

		if(this.model.snmpVersion===undefined) {
			this.set("model.snmpVersion","V1"); //NO I18N
		}

		if(this.model.snmpv3CredentialList===undefined) {
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/listCredentials?type=SNMP v3"); //NO I18N
			var v3List = (response!==undefined && response.snmpv3credential)?response.snmpv3credential:[];
			this.set("model.snmpv3CredentialList",v3List); //NO I18N
		}

		if(this.model.task==="Add") { //NO I18N
			this.set("model.messageVariable","$message"); //NO I18N
		}else if(this.model.task==="Edit" && this.model.snmpVersion!=="V3") { //NO I18N
			this.set("model.oldSnmpVersion",this.model.snmpVersion); //NO I18N
		}
		this.set("model.msgVariablePrompt",Ember.I18n.t("nfa.varbind.select.variables")); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.WebhookTemplateConfigComponent = Ember.Component.extend({
	templateName: "webhook-template-config", //NO I18N
	URLPlaceHolder: Ember.I18n.t("webclient.admin.url.enterurl"), //NO I18N
	webhookRequestTypesList: [
		{name: Ember.I18n.t("webclient.common.get"),		value: "GET"}, //NO I18N
		{name: Ember.I18n.t("webclient.common.post"),		value: "POST"}, //NO I18N
		{name: Ember.I18n.t("webclient.common.put"),		value: "PUT"}, //NO I18N
		{name: Ember.I18n.t("webclient.common.delete"),		value: "DELETE"}, //NO I18N
		{name: Ember.I18n.t("webclient.common.patch"),		value: "PATCH"}, //NO I18N
		{name: Ember.I18n.t("webclient.common.head"),		value: "HEAD"} //NO I18N
	],
	dataTypesList: [
		{name: Ember.I18n.t("webclient.admin.webhook.raw"),					value: "raw",				isChecked: true,	helpText: "webclient.admin.webhook.rawdesc"}, //NO I18N
		{name: Ember.I18n.t("webclient.admin.webhook.formDataUrlencoded"),	value: "form-urlencoded",	isChecked: false,	helpText: "webclient.admin.webhook.formDataUrlencodeddesc"}, //NO I18N
		{name: Ember.I18n.t("webclient.admin.webhook.formData"),			value: "form-data",			isChecked: false,	helpText: "webclient.admin.webhook.formDatadesc"} //NO I18N
	],
	payloadTypesList: [
		{name: Ember.I18n.t("jsp.changemgmt.ChangeMgmtAddRule.Text"),		value: "Text"}, //NO I18N
		{name: Ember.I18n.t("webclient.admin.webhook.xml"),					value: "XML"}, //NO I18N
		{name: Ember.I18n.t("webclient.admin.webhook.json"),				value: "JSON"}, //NO I18N
		{name: Ember.I18n.t("webclient.admin.webhook.javascript"),			value: "JavaScript"}, //NO I18N
		{name: Ember.I18n.t("webclient.map.flash.Html"),					value: "HTML"}, //NO I18N
		{name: Ember.I18n.t("webclient.map.others"),						value: "NONE"} //NO I18N
	],
	headerNamePlaceHolder: Ember.I18n.t("webclient.admin.webhook.headerName"), //NO I18N
	headerValuePlaceHolder: Ember.I18n.t("webclient.admin.webhook.headerValue"), //NO I18N
	customParamNamePlaceHolder: Ember.I18n.t("webclient.common.key"), //NO I18N
	customParamValuePlaceHolder: Ember.I18n.t("webclient.widget.value"), //NO I18N
	contentTypeClass: "disabledBlock", //NO I18N
	initDefaults: function() {
		this.set("model.webhookRequestType", ((this.model.webhookRequestType === undefined) ? "GET" : this.model.webhookRequestType)); //NO I18N
		if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
			this.updateWebhookVariableList();
		} else {
		this.set("webhookFormattedVariableList", nt_getWebhookFormattedVariableList()); //NO I18N
		}
		this.set("model.dataType", ((this.model.dataType === undefined) ? "raw" : this.model.dataType)); //NO I18N
		if(this.model.task === "Edit") {
			this.webhookRequestTypeChanged();
			this.dataTypeChanged();
			if(this.model.payloadType !== undefined && this.model.payloadType === "NONE") this.set("model.contentType", this.model.otherContentType); //NO I18N
		}
	}.on("init"), //NO I18N
	updateWebhookVariableList: function() {
		if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
			this.set("webhookFormattedVariableList", nt_getNCMWebhookFormattedVariableList(this.model)); //NO I18N
		}
	}.observes("model.variableList", "model.variableList.[]"), //NO I18N
	didInsertElement: function() {
		this.loadWebhookTableData((this.model.task === "Add" ? [] : this.model.requestHeaderData)); //NO I18N
		if(this.showCustomParameters) {
			this.loadWebhookTableData((this.model.task === "Add" ? [] : this.model.customParamsData), true); //NO I18N
		}
	},
	webhookRequestTypeChanged: function() {
		this.set("model.showDataType", (["POST", "PUT", "PATCH"].indexOf(this.model.webhookRequestType) > -1)); //NO I18N
		if(this.model.showDataType && ["form-urlencoded", "form-data"].indexOf(this.model.dataType) > -1) {
			$("#customParamDiv").removeClass("hide").addClass("show"); //NO I18N
		}else {
			$("#customParamDiv").removeClass("show").addClass("hide"); //NO I18N
		}
	}.observes("model.webhookRequestType"), //NO I18N
	dataTypeChanged: function() {
		var dataTypesList = $.extend(true, [], this.dataTypesList);
		for(var i=0, length=dataTypesList.length; i<length; i++) {
			dataTypesList[i].isChecked = (dataTypesList[i].value === this.model.dataType);
		}
		this.set("dataTypesList", dataTypesList); //NO I18N
		this.set("contentTypeClass", "disabledBlock"); //NO I18N

		var showCustomParameters = false;
		if(this.model.dataType === "raw") { //NO I18N
			if(this.model.payloadType === undefined) {
				this.set("model.payloadType", "Text"); //NO I18N
			}else {
				this.payloadTypeChanged();
			}
		}else if(this.model.dataType === "form-urlencoded") { //NO I18N
			this.set("model.contentType", "application/x-www-form-urlencoded"); //NO I18N
			showCustomParameters = true;
		}else if(this.model.dataType === "form-data") { //NO I18N
			this.set("model.contentType", "multipart/form-data"); //NO I18N
			showCustomParameters = true;
		}
		this.set("showCustomParameters", showCustomParameters); //NO I18N
		if(this.showCustomParameters) {
			this.loadWebhookTableData([], true);
		}else {
			$("#customParamDiv").removeClass("show").addClass("hide"); //NO I18N
		}
	}.observes("model.dataType"), //NO I18N
	payloadTypeChanged: function() {
		var contentType = ""; //NO I18N
		switch(this.model.payloadType) {
			case "Text"			: 	contentType = "text/plain"; break; //NO I18N
			case "XML"			: 	contentType = "application/xml"; break; //NO I18N
			case "JSON"			: 	contentType = "application/json"; break; //NO I18N
			case "JavaScript"	: 	contentType = "application/javascript"; break; //NO I18N
			case "HTML"			: 	contentType = "text/html"; break; //NO I18N
			case "NONE"			: 	contentType = ""; //NO I18N
									this.set("contentTypeClass", ""); //NO I18N
									break;
		}
		this.set("model.contentType", contentType); //NO I18N
	}.observes("model.payloadType"), //NO I18N
	loadWebhookTableData: function(tableData, isCustomParamsTable) {
		if(isCustomParamsTable) {
			$("#customParamDiv").removeClass("hide").addClass("show"); //NO I18N
			var tableID = "#customParamList"; //NO I18N
			var colNamesList =[Ember.I18n.t("webclient.common.key"), Ember.I18n.t("webclient.widget.value"), Ember.I18n.t("jsp.commonstr.Delete")]; //NO I18N
		}else {
			var tableID = "#webhookRequestHeaderList"; //NO I18N
			var colNamesList =[Ember.I18n.t("webclient.admin.webhook.headerName"), Ember.I18n.t("webclient.admin.webhook.headerValue"), Ember.I18n.t("jsp.commonstr.Delete")]; //NO I18N
		}
		var colModelsList =	[
			{name:"key", 			index:"key",			sortable:false, 	width:45}, //NO I18N
			{name:"value",			index:"value",			sortable:false, 	width:45}, //NO I18N
			{name:"delete", 		index:"delete",			sortable:false, 	width:10,	formatter:nfa_deleteAction} //NO I18N
		];
		$(tableID).jqGrid("GridUnload"); //NO I18N
		nfa_loadJQgridWithData(tableID, tableData, colNamesList, colModelsList, "", "", "", {}); //NO I18N
		// NCM screens: the slide can still be hidden here (0 width); size the grid once it is shown
		if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
			Ember.run.scheduleOnce("afterRender", this, function() { //NO I18N
				$(tableID).jqGrid("setGridWidth", $(tableID).closest(".opm_jqGridUI").width()); //NO I18N
			});
		}
	},
	actions: {
		showVariablesList: function(elementID) {
			elementID = "#"+elementID;
			$(elementID).hasClass("active") ? $(elementID).removeClass("active") : $(elementID).addClass("active"); //NO I18N
		},
		addVariableToURL: function(key, variable) {
			var inputValue = (this.model.webhookURL === undefined ? "" : this.model.webhookURL); //NO I18N
			if(variable.indexOf("=") === -1) {
				if(variable.indexOf(": ") > -1) {
					variable = variable.split(": ")[1]; //NO I18N
				}
				//variable = nt_getKeyForVariableValues(variable)+"="+variable;
				variable =variable.trim();
			}
			//var urlSeparator = (inputValue.indexOf("?") > -1 ? "&" : "?"); //NO I18N
			//this.set("model.webhookURL", inputValue+urlSeparator+variable); //NO I18N
			this.set("model.webhookURL", inputValue+variable); //NO I18N
		},
		addVariableToRequestHeader: function(key, variable) {
			if(variable.indexOf(": ") > -1) {
				variable = variable.split(": ")[1]; //NO I18N
			}
			this.set("headerName", nt_getKeyForVariableValues(variable)); //NO I18N
			this.set("headerValue", variable.trim()); //NO I18N
		},
		addRequestHeader: function() {
			if(!opm_validateFields({"empty": ["headerName", "headerValue"]})) { //NO I18N
				return;
			}
			var tableData = {"key": this.headerName, "value": this.headerValue}; //NO I18N
			var tableLength = $("#webhookRequestHeaderList").jqGrid("getGridParam", "records"); //NO I18N
			if(tableLength === 0){
				this.loadWebhookTableData([tableData]);
			}else {
				$("#webhookRequestHeaderList").jqGrid("addRowData", tableLength+1, tableData); //NO I18N
				$("#webhookRequestHeaderList").trigger("reloadGrid"); //NO I18N
			}
			this.set("headerName", ""); //NO I18N
			this.set("headerValue", ""); //NO I18N
		},
		dataTypeChanged: function(dataType) {
			this.set("model.dataType", dataType); //NO I18N
		},
		addVariableToBodyContent: function(key, variable) {
			if(variable.indexOf(": ") > -1) {
				variable = variable.split(": ")[1]; //NO I18N
			}
			if(this.model.bodyContent === undefined) this.model.bodyContent = ""; //NO I18N
			this.set("model.bodyContent", this.model.bodyContent+" "+variable); //NO I18N
		},
		addVariableToCustomParam: function(key, variable) {
			if(variable.indexOf(": ") > -1) {
				variable = variable.split(": ")[1]; //NO I18N
			}
			this.set("customParamName", nt_getKeyForVariableValues(variable)); //NO I18N
			this.set("customParamValue", variable); //NO I18N
		},
		addCustomParam: function() {
			if(!opm_validateFields({"empty": ["customParamName", "customParamValue"]})) { //NO I18N
				return;
			}
			var tableData = {"key": this.customParamName, "value": this.customParamValue}; //NO I18N
			var tableLength = $("#customParamList").jqGrid("getGridParam", "records"); //NO I18N
			if(tableLength === 0){
				this.loadWebhookTableData([tableData], true);
			}else {
				$("#customParamList").jqGrid("addRowData", tableLength+1, tableData); //NO I18N
				$("#customParamList").trigger("reloadGrid"); //NO I18N
			}
			this.set("customParamName", ""); //NO I18N
			this.set("customParamValue", ""); //NO I18N
		}
	},
	willDestroyElement: function() {
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NotificationTemplateBoxComponent = Ember.Component.extend({
	templateName:"notification-template-box", //NO I18N
	profileType:"-1", //NO I18N
	prompt:Ember.I18n.t("webclient.map.flash.chooseAValue"), //NO I18N
	initDefaults:function() {
		if(this.lists===undefined) {
			this.set("lists",{}); //NO I18N
		}
		if(this.lists.All===undefined) { //NO I18N
			var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/v2/admin/listNotificationTemplates"); //NO I18N
			var tList = (jsonData.error===undefined)?jsonData:[];
			this.set("lists.All",tList); //NO I18N
		}
		this.typeChanged();
	}.on("init"), //NO I18N
	typeChanged:function() {
		if(this.profileType!=="-1" && this.profileType!=="All" && this.lists[this.profileType]===undefined) { //NO I18N
			var tList = [];
			var allTemplates = jQuery.extend(true,[],this.lists.All);
			for(var i=0;i<allTemplates.length;i++) {
				if(allTemplates[i].profileTypeKey===this.profileType) {
					tList.push(allTemplates[i]);
				}
			}
			this.set("lists."+this.profileType,tList); //NO I18N
		}
		this.setTemplateList();
	}.observes("profileType"), //NO I18N
	setTemplateList:function(tList) {
		var tList = (this.profileType!=="-1")?jQuery.extend(true,[],this.lists[this.profileType]):[]; //NO I18N
		tList.unshift({profileName:Ember.I18n.t("jsp.commonstr.None"), templateID:"-1"}); //NO I18N
		this.set("templateList",tList); //NO I18N
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

function nt_listNotificationTemplates() {
	var type = $("#templateFilter").val(); //NO I18N
	var data = (type!=="All")?{profileType:type}:""; //NO I18N
	$.ajax({
		url: window.OPM.apiUrlPattern+"/v2/admin/listNotificationTemplates", //NO I18N
		data:data,
		dataType:"json", //No I18N
		type:"GET",//No I18N
		success: function(jsonData) {
			if(jsonData.error !== undefined) {
				opm_infoMsgs("errorMsg",jsonData.error.message); //NO I18N
				return;
			}
			var isAvailWritePermission = (window.isoperator || window.OPM.userPermissions.notificationProfileWrite);
			var actionFormatter = function(cellValue,options,rowdata) {
				var isRestricted = nt_isWebhookRestrictedForOperator(rowdata.profileTypeKey);
				var formatter = "";
				if(!isRestricted) {
					formatter += "<i class='pointer icon-configedit' tabindex='0' role='button' title='"+Ember.I18n.t('webclient.title.edit')+"' style='margin:0 7px 0 0 !important;display:inline-block' onclick='nt_getNotificationTemplateActions(\"Edit\",\""+htmlEncode(rowdata.templateID)+"\",\""+htmlEncode(rowdata.profileTypeKey)+"\",\""+htmlEncode(rowdata.profileName)+"\")'></i>"; //NO I18N
				}
				if(isAvailWritePermission) {
					if(!isRestricted) {
						formatter += "<i class='icon-paste OpMToolTip' tabindex='0' role='button' title='"+Ember.I18n.t("button.Copy")+"' style='margin:0 7px;cursor:Pointer;' onclick='nt_getNotificationTemplateActions(\"Copy\",\""+htmlEncode(rowdata.templateID)+"\",\""+htmlEncode(rowdata.profileTypeKey)+"\",\""+htmlEncode(rowdata.profileName)+"\")'></i>"; //NO I18N
					}
					formatter += "<i class='icon-trash delete OpMToolTip'  tabindex='0' role='button' style='margin:0 7px;font-size:16px; cursor:pointer;' title='"+Ember.I18n.t("webclient.title.delete")+"' onclick='nt_getNotificationTemplateActions(\"Delete\",\""+htmlEncode(rowdata.templateID)+"\")'></i>"; //NO I18N
				}
				return formatter;
			}
			var statusFormatter = function(cellValue,options,rowdata) {
				var statusBtnCls = (isAvailWritePermission)?"chkRoundBtn":"chkRoundBtn disabledBlock"; //NO I18N
				var checkedVal = (cellValue==="true")?"checked":""; //NO I18N
				var status = (cellValue==="true")?"disable":"enable"; //NO I18N
				return "<div class='"+statusBtnCls+"' tabindex='0' role='checkbox'><input type='checkbox' name='templateStatus' onclick='nt_changeNotificationTemplateStatus(\""+options.rowId+"\",\""+status+"\",this,\""+ opm_escapeHTML(rowdata.profileName) +"\")' "+checkedVal+"><label></label></div>"; //NO I18N
			}
			var colNamesList = ["",Ember.I18n.t("jsp.commonstr.TemplateName"),Ember.I18n.t("opu.views.TYPE"),Ember.I18n.t("jsp.commonstr.Status"),Ember.I18n.t("webclient.action.actions"),"",""]; //NO I18N
			var colModelList= [
				{ name: "templateID",	index:"templateID", hidden:true}, //NO I18N
				{ name: "profileName",	index:"profileName",width:40, classes:"pointer profile-name-info npTemplate",formatter:profileNameEditAction, sorttype:"text"}, //NO I18N
				{ name: "profileType",	index:"profileType",width:30}, //NO I18N
				{ name: "status",		index:"status",		width:25, formatter:statusFormatter,search:true,hidden:window.OPM.isMSPCentral,stype:"select",searchoptions: {value: alarmProfileStateSearch,defaultValue:""}}, //NO I18N
				{ name: "actions",		index:"actions",	width:25, formatter:actionFormatter,search:false,sortable:false,hidden:!isAvailWritePermission}, //NO I18N
				{ name: "profileTypeKey",index:"profileTypeKey", hidden:true}, //NO I18N
				{ name: "id",			index:"id",			hidden:true,sortable:false,search:false} //NO I18N
			];
			$("#nTemplateList").jqGrid("GridUnload"); //NO I18N
			var defaultOptions={sortName:"profileName",searchOption:true,toggleSearch:false,multiselect:isAvailWritePermission}; //NO I18N
			opm_loadJQgridWithData("#nTemplateList",jsonData,colNamesList,colModelList,"","nTemplatePager","NotificationTemplatesTbl",defaultOptions); //NO I18N
			$("#nTemplateList").jqGrid("setGridWidth",$(".settingsContent").width()-60); //NO I18N
			$('.ui-jqgrid-hdiv select').select2();
			$("#nTemplateList").setGridParam({sortname:"profileName",sortorder:"asc"}).trigger("reloadGrid"); //NO I18N
		}
	});
}

function nt_getNotificationTemplateActions(task,templateID,profileType,profileName) {
	if((task==="Edit" || task==="Copy") && nt_isWebhookRestrictedForOperator(profileType)) { //NO I18N
		return;
	}
	if(task==="Delete") { //NO I18N
		if(confirm(Ember.I18n.t("Field.Alert.Delete"))) { //NO I18N
			$.ajax({
				url:window.OPM.apiUrlPattern+"/v2/admin/deleteNotificationTemplate", //NO I18N
				type:"POST", //NO I18N
				data:{profileID:templateID},
				success: function(response) {
					if(response.error!==undefined){
						opm_infoMsgs("errorMsg",(response.error.message?response.error.message:response.error)); //NO I18N
					}else {
						opm_infoMsgs("successMsg",response.message); //NO I18N
						nt_listNotificationTemplates();
					}
				}
			});
		}
	}else {
		var type = nt_getNotificationTemplateTypeVsTypeValue(profileType);
		nt_redirectToNotificationTemplateTask(type,task,templateID);
	}
}

function nt_deleteBulkTemplates() {
	var templateIDs = nfa_getSelectedCheckBoxAsString("nTemplateList","templateID"); //NO I18N
	if(templateIDs==="") { //NO I18N
		alert(Ember.I18n.t("webclient.NotificationProfiles.selectAtleastOne")); //NO I18N
		return;
	}
	if(confirm(Ember.I18n.t("Field.Alert.Delete"))) { //NO I18N
		$.ajax({
			url:window.OPM.apiUrlPattern+"/v2/admin/deleteBulkNotificationTemplates", //NO I18N
			type:"POST", //NO I18N
			data:{profileIDs:templateIDs},
			success: function(response) {
				if(response.error!==undefined){
					opm_infoMsgs("errorMsg",(response.error.message)?response.error.message:response.error); //NO I18N
				}else {
					opm_infoMsgs("successMsg",response.message); //NO I18N
					nt_listNotificationTemplates();
				}
			}
		});
	}
}

function nt_changeNotificationTemplateStatus(rowID,status,self, profileName) {
	if(confirm(Ember.I18n.t("Field.Alert.Delete"))){ //NO I18N
		var callBackFunction=function(response){
			showMessage(response);
			nt_listNotificationTemplates();
		}
		var rowObject = $("#nTemplateList").jqGrid("getRowData",rowID); //NO I18N
		var formData = {
			profileName:profileName,
			profileId:rowObject.templateID,
			status:status,
			isTemplate:true
		};
		nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/admin/updateNotificationProfileStatus",formData,callBackFunction); //NO I18N
	}else{
		self.checked=!(self.checked);
	}
}

function nt_getNotificationTemplateVariables(type) {
	var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getMailVariables",{isNotificationTemplate:true}); //NO I18N
	var variableList = (type==="RunProgram" || type === "Ansible")?[]:[{group:"",name:Ember.I18n.t("webclient.admin.timeformat.default"),value:"default"}]; //NO I18N
	for(key in list) {
		for(var i=0;i<list[key].length;i++) {
			variableList.push({group:key,name:list[key][i].key,value:list[key][i].value});
		}
	}
	return variableList;
}

function nt_getCurrentTemplateDetails(model) {
	for(var i=0;i<model.templateTypes.length;i++) {
		if(model.templateTypes[i].value===model.type) {
			break;
		}
	}
	return model.templateTypes[i];
}

function removeArrayByValue(array,value) {
	var index=array.indexOf(value);
	if(index!=-1) {
		array.splice(index,1);
	}
	return array;
}

function nt_getNotificationTemplateTypes(removeHidedType,excludeList) {
	var tTypes = [
		{icon:"icon icon-email",		value:"Email",		typeValue:"Send Email",			displayName:Ember.I18n.t("fwa.compliance.Email"),									title:Ember.I18n.t("opm.infoMsg.notifyprofile.email.desc")}, //NO I18N
		{icon:"icon icon-emailsms",		value:"EmailSMS",	typeValue:"Send SMS",			displayName:Ember.I18n.t("webclient.admin.smsserver.alert.emailsms"),				title:Ember.I18n.t("opm.infoMsg.notifyprofile.emailbasedsms.desc")}, //NO I18N
		{icon:"icon icon-sms",			value:"ModemSMS",	typeValue:"Send Modem SMS",		displayName:Ember.I18n.t("opmanagerclient.CN.SendSMS"),								title:Ember.I18n.t("opm.infoMsg.notifyprofile.sms.desc")}, //NO I18N
		{icon:"icon icon-chat-circle",	value:"Chat",		typeValue:"Chat",				displayName:Ember.I18n.t("webclient.notificationprofile.chat.title"),				title:Ember.I18n.t("opm.infoMsg.notifyprofile.chat.desc"),		isHide:(window.OPM.isMSPEdition || OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction)}, //NO I18N
		{icon:"icon icon-runprogram",	value:"RunProgram",	typeValue:"Run Program",		displayName:Ember.I18n.t("webclient.admin.profiledetails.runprogram"),				title:Ember.I18n.t("opm.infoMsg.runProgramproperties.tooltip"),	isHide:(!window.OPM.isAdministrator || OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction)}, //NO I18N
		{icon:"icon icon-logticket",	value:"LogTicket",	typeValue:"Log a Ticket",		displayName:Ember.I18n.t("webclient.admin.profiledetails.LogaTicket"),				title:Ember.I18n.t("opm.infoMsg.logtkt.desc"),					isHide:window.OPM.isMSPEdition}, //NO I18N
		{icon:"icon icon-webalarm",		value:"WebAlarm",	typeValue:"Web Alarm",			displayName:Ember.I18n.t("webclient.admin.profiledetails.WebAlarm"),				title:Ember.I18n.t("opm.inforMsg.WebAlarmproperties.tooltip"),	isHide:((window.isserver && !window.isNFAInternalCollector) || (window.isNFAInternalCollector && !nfa_isInternalCollectorSelected()) || (window.OPM.isFWA && !window.OPM.isAdministrator) || OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction)}, //NO I18N
		{icon:"icon icon-syslog",		value:"SysLog",		typeValue:"Send SysLog",		displayName:Ember.I18n.t("webclient.admin.notification.clientutil.SysLogProfile"),	title:Ember.I18n.t("webclient.admin.profiledetails.syslog.tooltip")}, //NO I18N
		{icon:"icon icon-trap",			value:"Trap",		typeValue:"Send Trap",			displayName:Ember.I18n.t("webclient.admin.notification.clientutil.TrapProfile"),	title:Ember.I18n.t("webclient.admin.profiledetails.trap.tooltip")}, //NO I18N
		{svgIcon:"/apiclient/fluidicv2/img/sprite-opm.svg#file-checked",          value:"Configlets", typeValue:"Configlets",         displayName:Ember.I18n.t("jsp.commonstr.Configlets"),                               title:Ember.I18n.t("opm.infoMsg.notifyprofile.configlets.desc"), isHide:(!OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction || !(window.OPM.isAdministrator || window.OPM.userPermissions.ncmConfigAutomationConfigletsRead || window.OPM.userPermissions.ncmConfigAutomationConfigletsWrite || window.OPM.userPermissions.operatorAccess))},//NO I18N
		{icon:"icon icon-webhook",	    value:"Webhook",	typeValue:"Webhook",	        displayName:Ember.I18n.t("webclient.admin.notification.clientutil.InvokeAWebhook"),	title:Ember.I18n.t("webclient.admin.profiledetails.webhook.tooltip"), isHide:window.isoperator}, //NO I18N
		{svgIcon:"/apiclient/fluidicv2/img/sprite-opm.svg#Security",	        value:"SIEM",		typeValue:"SIEM",	        	displayName:Ember.I18n.t("webclient.opm.tpi.tagname.SIEM"),							title:Ember.I18n.t("webclient.siem.np.desc")}, //NO I18N
		{icon:"icon icon-webalarm",		value:"NCMAlarm",	typeValue:"NCMAlarm",			displayName:Ember.I18n.t("webclient.Alarm"),			title:Ember.I18n.t("webclient.ncm.notification.action.types.alarm.desc"), isHide:!(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction)}, //NO I18N
		{svgIcon:"/apiclient/fluidicv2/img/sprite-opm.svg#file-change",	        value:"NCMRollback",typeValue:"NCMRollback",        displayName:Ember.I18n.t("jsp.common.Rollback"),							        title:Ember.I18n.t("webclient.ncm.notification.action.types.rollback.desc"), isHide:!(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction)} //NO I18N
	];

	if(window.OPM.isOPM && window.OPM.userPermissions.tpiSettingsWrite && !(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction)){
		tTypes.push({icon:"icon icon-ansible",	    value:"Ansible",	typeValue:"Ansible",	        displayName:Ember.I18n.t("webclient.ansible.integ"),	title:Ember.I18n.t("webclient.notification.ansible.info"),ishide: (window.OPM.isMSPEdition || window.OPM.isCentralServer )})
	}
	
	if(excludeList!==undefined && excludeList.length!==0) {
		for(var i=0;i<tTypes.length;i++) {
			if(excludeList.indexOf(tTypes[i].value)!=-1) {
				tTypes.splice(i,1);
				i--;
			}
		}
	}
	if(removeHidedType) {
		for(var i=0;i<tTypes.length;i++) {
			if(tTypes[i].isHide){
				tTypes.splice(i,1);
				i--;
			}
		}
	}

	tTypes = nt_getTemplateLearnMoreLinks(tTypes);
	return tTypes;
}

function nt_getNotificationTemplateTypeVsTypeValue(valueToMatch) {
	var links = {
		Email:"Send Email",EmailSMS:"Send SMS",ModemSMS:"Send Modem SMS",Chat:"Chat",RunProgram:"Run Program", //NO I18N
		LogTicket:"Log a Ticket",WebAlarm:"Web Alarm",SysLog:"Send SysLog",Trap:"Send Trap",Ansible:"Ansible" ,Webhook: "Webhook",SIEM:"SIEM",Configlets:"Configlets",NCMRollback:"NCMRollback",NCMAlarm:"NCMAlarm" //NO I18N
	};
	var returnValue;
	for(var key in links) {
		if(links[key]===valueToMatch) {
			returnValue=key;
			break;
		}
	}
	return returnValue;
}

function nt_getSyslogSeverityList() {
	var severityList = [
		{name:"$severity",value:"9"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.debug"),		value:"7"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.information"),	value:"6"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.notice"),		value:"5"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.warning"),		value:"4"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.error"),		value:"3"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.critical"),		value:"2"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.alert"),		value:"1"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.emergency"),	value:"0"} //NO I18N
	];
	return severityList;
}

function nt_getSyslogFacilityList() {
	var facilityList = [
		{name:Ember.I18n.t("webclient.admin.syslogrules.kernel"),					value:"0"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.user"),						value:"1"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.mail"),						value:"2"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.daemon"),					value:"3"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.auth"),						value:"4"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.syslog"),					value:"5"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.lineprintersubsystem"),		value:"6"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.networknewssubsystem"),		value:"7"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.uucpsubsystem"),			value:"8"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.cron.one"),					value:"9"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.lineprintersubsystem"),		value:"6"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.networknewssubsystem"),		value:"7"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.uucpsubsystem"),			value:"8"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.cron.one"),					value:"9"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.authpriv"),					value:"10"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.ftpdaemon"),				value:"11"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.ntpsubsystem"),				value:"12"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.logaudit"),					value:"13"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.logalert"),					value:"14"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.cron.two"),					value:"15"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse"),					value:"16"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.one"),				value:"17"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.two"),				value:"18"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.three"),			value:"19"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.four"),			value:"20"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.five"),			value:"21"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.six"),				value:"22"}, //NO I18N
		{name:Ember.I18n.t("webclient.admin.syslogrules.localuse.seven"),			value:"23"} //NO I18N
	];
	return facilityList;
}

function nt_getLinksByProduct() {
	var links={};
	links.emailSubjectHelpTextKey="opm.infoMsg.mail.subject.tooltip"; //NO I18N
	links.emailSubjectHelpLink="webclient.admin.notifyprofile.varibles.learnmore"; //NO I18N

	links.emailMessageHelpTextKey="opm.infoMsg.mail.subject.tooltip"; //NO I18N
	links.emailMessageHelpLink="webclient.admin.notifyprofile.varibles.learnmore"; //NO I18N

	links.smsMessageHelpTextKey="webclient.admin.profiledetails.message.tooltip"; //NO I18N
	links.smsMessageHelpLink="webclient.admin.notifyprofile.varibles.learnmore"; //NO I18N

	links.runProTitleInfoMsg=Ember.I18n.t("nfa.nTemplates.runProgram.importantNote",{productName:window.OPM.productName}); //NO I18N
	links.runProTitleInfoLink="https://www.manageengine.com/network-monitoring/script-monitoring.html"; //NO I18N
	links.runProArgumentsHelpTextKey="webclient.admin.profiledetails.cmdArgument.tooltip"; //NO I18N
	links.runProArgumentsHelpLink="webclient.admin.notifyprofile.varibles.learnmore"; //NO I18N

	links.sysLogMessageHelpTextKey="webclient.admin.profile.msgvariable.tooltip"; //NO I18N
	links.sysLogMessageHelpLink="webclient.admin.notifyprofile.varibles.learnmore"; //NO I18N

	links.trapProMessageHelpTextKey="webclient.admin.profile.varbind.tooltip"; //NO I18N
	links.trapProMessageHelpLink="https://www.manageengine.com/network-monitoring/faq/what-is-varbind.html"; //NO I18N

	return links;
}

function nt_getTemplateLearnMoreLinks(tTypes) {
	var links = {
		Email:"",EmailSMS:"",ModemSMS:"",Chat:"",LogTicket:"", //NO I18N
		RunProgram:"https://www.manageengine.com/network-monitoring/help/run-program.html", //NO I18N
		WebAlarm:"https://www.manageengine.com/network-monitoring/help/configure-web-alarm-profile.html", //NO I18N
		SysLog:"https://www.manageengine.com/network-monitoring/help/syslog-profile.html", //NO I18N
		Trap:"https://www.manageengine.com/network-monitoring/help/trap-profile.html", //NO I18N
		Webhook:"https://www.manageengine.com/products/netflow/webhook-integration.html?utm_source=inproduct", //NO I18N
		Ansible:"https://www.manageengine.com/network-monitoring/ansible-integration.html?utm_source=inproduct#notificationProfile", //No I18n
		SIEM:"https://www.manageengine.com/network-monitoring/siem-integration.html?utm_source=inproduct"//No I18N
	}
	for(var i=0;i<tTypes.length;i++) {
		tTypes[i].learnMoreLink = links[tTypes[i].value];
	}
	return tTypes;
}

function validateNotificationTemplate(model) {
	var fields = {empty:["templateName"],custom:[{"identifier":"templateName","condition":!nfa_isValidName(model.templateName,"~!@#$%^&*+=()[]\/\\\';,{}|\":<>?`."),"message":Ember.I18n.t("webclient.admin.traps.specialchar")}]}; //NO I18N
	if(!opm_validateFields(fields)) {
		return false;
	}
	switch(model.type) {
		case "Email": 		//NO I18N
		case "EmailSMS": 	if(!isMailServerConfiguredPopUp(true)) { //NO I18N
								return false;
							}
							fields.empty = ["fromAddress","toAddress"]; //NO I18N
							if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
								// migrated change management templates send from the mail server's From
								fields.emailWithSplcharOrDefault = ["fromAddress"]; //NO I18N
							} else {
							fields.emailWithSplchar = ["fromAddress"]; //NO I18N
							}
							fields.mulitpleEmailWithSplchar = ["toAddress"]; //NO I18N
							if(!model.hideEmailCCLink) {
								fields.empty.push("ccAddress"); //NO I18N
								fields.mulitpleEmailWithSplchar.push("ccAddress"); //NO I18N
							}
							break;
		case "ModemSMS":	if(model.selectedGateWay === undefined) { //NO I18N
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
		case "RunProgram":	fields.empty.push("runProgramCommand"); //NO I18N
							break;
		case "LogTicket":	if(model.CITInternal){//NO I18N
								if(!model.serviceType){
									opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.cit.internal.integration.notconfigured',{param0:OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateDisplayName,param1:OPMClient.SettingsNotificationsController.InternalTemplateDetails.internalTemplateId},this)); //No I18N
									return;
								}
								if(!validateCITInternalInteg(true)){
									return false;
								}
							}
							else{
								if(!model[model.serviceType+"Enabled"]) { //NO I18N
								    if(window.OPM.isNCM){
								        opm_infoMsgs("infoMsg",Ember.I18n.t("ncm.infoMsg.logTicket."+model.serviceType+".tooltip")); //NO I18N
								    } else {
									opm_infoMsgs("infoMsg",Ember.I18n.t("opm.infoMsg.logTicket."+model.serviceType+".tooltip")); //NO I18N
								    }
									return;
								}
								if(model.serviceType == "serviceDeskJira"){
									if(!loadJiraDynamicFields(model)){
										return false;
									}
								}
								if(model.serviceType === "serviceNow"){//NO I18N
									var snowTmplType = $('input[name="snowTemplateTicketType"]:checked').val();//NO I18N
									if(snowTmplType === 'event'){//NO I18N
										fields.empty.push("snow_tmpl_event_title");//NO I18N
										fields.empty.push("snow_tmpl_event_description");//NO I18N
									}
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
		case "Ansible": 	 
							if($("#ansiblePlayBookList").val() === "" || $("#ansiblePlayBookList").val() === null){
								$("#ansiblePlayBookList").addClass('validateField error');//No I18N
				                $("#ansiblePlayBookList").attr('data-error',Ember.I18n.t('webcient.ansible.playbook.select.alert',this));//No I18N
				                $('#ansiblePlayBookList').focus();
								opmValidate($('#ansiblePlayBookList')); //No I18n
								return false;
							}
							 else if(opm_ansibleCommandInputVal($('#messageVariable').val())){
						        $("#messageVariable").addClass('validateField error');//No I18N
						        $("#messageVariable").attr('data-error',Ember.I18n.t('webclient.opm.testCredential.fieldError',this));//No I18N
						        $('#messageVariable').focus();
						        opmValidate($('#messageVariable')); //No I18n
						        return false;
						    }
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
		case "SIEM":      	return validateSIEMProfile(); //NO I18N
							break;
		case "Configlets"://NO I18N
		                    return validateConfiglet(model);
        		            break;
        case "NCMRollback"://NO I18N
                            return validateNCMRollback(model);
                            break;
	}
	if(["Email","EmailSMS","Chat"].contains(model.type) || (model.type === "LogTicket" && !model.CITInternal)) { //NO I18N
		var isSnowEvent = (model.type === "LogTicket" && model.serviceType === "serviceNow" && $('input[name="snowTemplateTicketType"]:checked').val() === 'event');//NO I18N
		if(!isSnowEvent){
			fields.empty.push("subjectVariable"); //NO I18N
			fields.empty.push("messageVariable"); //NO I18N
		}
	}
	if(["ModemSMS","SysLog","Trap"].contains(model.type)) { //NO I18N
		fields.empty.push("messageVariable"); //NO I18N
	}
	return opm_validateFields(fields);
}

function loadJiraDynamicFields(dataObject){
	var fields = dataObject.serviceDeskJiraTicket.dynamicFields;
	var emptyCheck = [];
	var spaceCheck = [];
	var dynamicFields = {};
	emptyCheck = ['JOP_key_projectkey','JOP_name_issuetype'];//No I18N
	for(var i=0;i<fields.length;i++){
		var typeValueObj = {};
		var field = fields[i];
		if(field.isRequired){
			emptyCheck.push(field.key);
		}
		if(field.key == 'JOP_NoKey_labels'){
			spaceCheck.push(field.key);
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
	var fieldsToValidate = {'empty':emptyCheck,'noSpaceCheck':spaceCheck};//No I18N
	var isValid = opm_validateFields(fieldsToValidate);
	if(isValid){
		dataObject.serviceDeskJiraTicket.dynamicFieldsStr=JSON.stringify(dynamicFields)
	}
	return isValid;
}


function saveNotificationTemplate(model,isTesting) {
	var formData={
		name:model.templateName,
		profileType:model.template.typeValue,
		templateType: OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction ? "NCM" : ((window.OPM.isNFA)?"NFA":(window.OPM.isFWA)?"FWA":"OPM") //NO I18N
	};
	switch(model.type) {
		case "Email": 		//NO I18N
		case "EmailSMS": 	formData.fromAddress=model.fromAddress; //NO I18N
							formData.toAddress=model.toAddress;
							formData.isDefaultFromAddress = (model.fromAddress === "$defaultFromAddress"); //NO I18N
							if(model.type==="Email") { //NO I18N
								if(!model.hideEmailCCLink) {
									formData.ccAddress=model.ccAddress;
								}
								formData.MAILFORMAT=model.mailFormat;
							}
							break;
		case "ModemSMS":	formData.gateway=model.smsGatewaysVsID[model.selectedGateWay]; //NO I18N
							formData.toNumber=model.toNumber;
							formData.clickatellSet=model.smsGatewayConfig.Clickatell;
							formData.serialmodemSet=model.smsGatewayConfig.serialmodem;
							formData.customSet=model.smsGatewayConfig.custom;
							formData.smppSet=model.smsGatewayConfig.SMPP;
							formData.appSMSSet=model.smsGatewayConfig.SMSEagle;
							formData.message=model.messageVariable;
							break;
		case "Chat":		formData.ischannel=(model.receiverType==="channel"); //NO I18N
							if(formData.ischannel) {
								formData.receiverid=model.slackChannelID;
							}else {
								formData.receiverid=model.slackMemberID;
							}
							formData.productName="SLACK"; //NO I18N
							break;
		case "RunProgram":	formData.sysprogram=model.runProgramCommand; //NO I18N
							formData.sysarguments=model.messageVariable;
							formData.errappend=model.errappend;
							formData.append=model.append;
							break;
		case "LogTicket":	if(model.CITInternal){//NO I18N
								if(OPMClient.SettingsNotificationsController.InternalTemplateDetails.nTemplateParam != undefined){
									formData.templateId = OPMClient.SettingsNotificationsController.InternalTemplateDetails.nTemplateParam.templateId;
									formData.templateName = OPMClient.SettingsNotificationsController.InternalTemplateDetails.nTemplateParam.templateName;
									formData.CITNPFieldsArray = OPMClient.SettingsNotificationsController.InternalTemplateDetails.nTemplateParam.CITNPFieldsArray;
									formData.profileType = 'CITInternal';//NO I18N
								}	
							}
							else{
								if(model.serviceType == "serviceDeskJira"){ //NO I18N
									formData.productName="JIRA";// No I18N
									formData.dynamicFields=model[model.serviceType+"Ticket"].dynamicFieldsStr;
								}else{
									formData=jQuery.extend(true,{},formData,model[model.serviceType+"Ticket"]); //NO I18N
									if(model.serviceType == "serviceDeskOnDemand"){
										formData.profileType = "SDPOnDemand"; //NO I18N
										formData.productName="OnDemand";// No I18N
									}else{
										formData.productName=model.serviceType.toUpperCase();
										if(model.serviceType === "serviceNow"){//NO I18N
											var snowTmplType = $('input[name="snowTemplateTicketType"]:checked').val();//NO I18N
											formData.snowTicketType = snowTmplType || 'incident';//NO I18N
											if(snowTmplType === 'event'){//NO I18N
												delete formData.ticketCategory;
												delete formData.ticketSubCategory;
												delete formData.ticketPriority;
												delete formData.ticketItem;
												delete formData.ticketGrpTech;
												delete formData.ticketTechnician;
												delete formData.ticketImpact;
												delete formData.ticketUrgency;
												var snEventFields = ['source','node','type','resource','metric_name','event_class','severity','cmdb_ci','message_key'];//NO I18N
												for(var i=0; i<snEventFields.length; i++){
													formData['event_' + snEventFields[i]] = $('#snow_tmpl_event_' + snEventFields[i]).val();//NO I18N
												}
												// If severity is empty (choose a value), default to 'auto'
												if(!formData.event_severity || formData.event_severity === ''){
													formData.event_severity = 'auto';//NO I18N
												}
												delete formData.event_title;
												delete formData.event_description;
											} else {
												// Incident mode: remove any leftover event fields from merged model
												var eventKeys = ['event_source','event_node','event_type','event_resource','event_metric_name','event_event_class','event_severity','event_cmdb_ci','event_message_key','event_title','event_description'];//NO I18N
												for(var i=0; i<eventKeys.length; i++){
													delete formData[eventKeys[i]];
												}
											}
										}
									}
								}
							}
							break;
		case "WebAlarm": 	formData.selectedUserIds=JSON.stringify(model.selectedUserIDs); //NO I18N
							formData.selectedRoleIds=JSON.stringify(model.selectedRoleIDs);
							formData.soundFile=model.selectedAlarmSound;
							break;
		case "SysLog":		formData.sysLogHost=model.sysLogHost; //NO I18N
							formData.sysLogPort=model.sysLogPort;
							formData.severity=model.sysLogSeverity;
							formData.facility=model.sysLogFacility;
							formData.variables=model.messageVariable;
							break;
		case "Trap":		formData.peername=model.trapProfilePeerName; //NO I18N
							formData.trap_port=model.trapProfilePort;
							formData.version=model.snmpVersion;
							if(model.snmpVersion==="V3") { //NO I18N
								formData.credentialId=model.snmpv3CredentialID;
								formData.community=""; //NO I18N
							}else if(model.task!=="Edit" || model.oldSnmpVersion!==model.snmpVersion) { //NO I18N
								formData.community=model.trapCommunity;
							}
							formData.varbind=model.messageVariable;
							break;

		case "Ansible":		formData.command="ansible-playbook "+model.selectedPlayBook+" "+model.messageVariable; //No I18n
							formData.playbookName = model.selectedPlayBook; 
							formData.sysarguments = model.messageVariable;
							break;				
							
		case "Webhook":		formData.Webhookmethodtype = model.webhookRequestType; //NO I18N
							formData.Webhookurl = model.webhookURL;
							formData.Webhookuseragent = model.userAgent;
							formData.Webhooktimeout = model.timeout;
							formData.Webhookheaders = nt_getWebhookTableData(model, "webhookRequestHeaderList"); //NO I18N
							formData.Webhookcustoms = nt_getWebhookTableData(model, "customParamList"); //NO I18N
							break;
		case "SIEM":		var siemObject = OPMClient.SettingsNotificationsController.get("siemObject");//No I18N
							formData.productName = siemObject.productName;
							formData.isStructured = siemObject.isStructured;
							if($('#rfc-3164').is(':checked')){
								formData.format = "3164"; //No I18N
								formData.isStructured = false;
							}else{
								formData.format = "5424"; //No I18N
							}
							var structuredData = [];
							if(formData.isStructured){
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
							formData.structuredData = JSON.stringify(structuredData);
							formData.severity = siemObject.severity;
							formData.facility = siemObject.facility;
							if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
							    formData.rawMessage = model.messageVariable;
							} else {
							formData.rawMessage = siemObject.message;
							}
							break;
        case "NCMRollback":  //No I18N
                            formData.rollbackPrevVersion = model.rollbackPrevVersion;
                            formData.rollbackBaseline = model.rollbackBaseline;
                            formData.rollbackMode = model.selectedRollbackMode;
                            break;
        case "Configlets":   //No I18N
                            var configletVariablesMap = {};
                            var ncmConfigletVariables = model.ncmConfigletVariables || [];
                            for(var i = 0; i < ncmConfigletVariables.length; i++){
                                var variableObj = ncmConfigletVariables[i];
                                if(variableObj && variableObj.name){
                                    configletVariablesMap[variableObj.name] = variableObj.value;
                                }
                            }
                            formData.configletId  = model.selectedConfiglet;
                            formData.configletsVariables = JSON.stringify(configletVariablesMap);
                            break;
        case "NCMAlarm":    //No I18N
                            formData.severity = model.ncmAlarmSeverity;
							break;
	}
	if(["Email","EmailSMS","Chat"].contains(model.type) || (model.type === "LogTicket" && !model.CITInternal)) { //NO I18N
		formData.subject=model.subjectVariable;
		formData.message=model.messageVariable;
		if(model.type === "LogTicket" && model.serviceType === "serviceNow" && formData.snowTicketType === "event"){//NO I18N
			formData.subject = $('#snow_tmpl_event_title').val();//NO I18N
			formData.message = $('#snow_tmpl_event_description').val();//NO I18N
		}
	}

	var callBackFunction = function(response) {
		if(response.error!==undefined) {
			opm_infoMsgs("errorMsg",(response.error.message)?response.error.message:response.error); //NO I18N
		}else {
			if(isTesting) {
				opm_infoMsgs("successMsg",response.result.message); //NO I18N
			}else {
				nt_redirectToNotificationTemplateList();
				$('#notificationActions').trigger('reloadGrid');//NO I18N
				opm_infoMsgs("successMsg",response.message); //NO I18N
			}
		}
	};

	if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction){
        formData.ncmSelectedEvent = model.ncmSelectedEvent;
         if(model.task !== "Add") { //NO I18N
            // send the stored name back unchanged (PPM-migrated names have no NCM_ prefix)
            formData.name = model.storedTemplateName;
        }
    }

	var apiURL;
	if(isTesting) {
		if(model.type==="WebAlarm") { //NO I18N
			playSoundForWebAlarm({"entity":"true","soundFile":formData.soundFile}); //NO I18N
		}else {
			apiURL = window.OPM.apiUrlPattern+"/v2/admin/testNotificationTemplate"; //NO I18N
			if(model.type === "RunProgram" || model.type === "Ansible"  || model.type === "Webhook") {
				if(model.task==="Edit") {
					formData.profileID = model.templateID;
				}
				nfa_postAjaxResponseWithAsync(apiURL,formData,function(response) {
					isOtpValidationRequired(response, "opm_ajaxPostMethod", apiURL, formData, {callback:callBackFunction,otpPageType:'slide'});//No I18n
				});
			} else {
				nfa_postAjaxResponseWithAsync(apiURL,formData,callBackFunction);
			}
		}
	}else {
		if(!nf_checkTemplateNameIsExist(model)) {
			if(model.task==="Edit") { //NO I18N
				formData.profileID=model.templateID;
				apiURL = window.OPM.apiUrlPattern+"/v2/admin/updateNotificationTemplate"; //NO I18N
			}else {
				apiURL = window.OPM.apiUrlPattern+"/v2/admin/addNotificationTemplate"; //NO I18N
			}
			if(model.type === "RunProgram" || model.type === "Ansible") { //No I18n
				nfa_postAjaxResponseWithAsync(apiURL,formData,function(response) {
					isOtpValidationRequired(response, "opm_ajaxPostMethod", apiURL, formData, {callback:callBackFunction,otpPageType:'slide'});//No I18n
				});
			} else {
				nfa_postAjaxResponseWithAsync(apiURL,formData,callBackFunction);
			}
		}
	}
}

function nf_checkTemplateNameIsExist(model) {
	var flag = false;
	if(model.templateName_old!==model.templateName) {
        if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
            model.templateName = "NCM_" + model.templateName; //NO I18N
        }
		var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/admin/checkNProfile",{name:model.templateName}); //NO I18N
		if(jsonData!==null && jsonData!==undefined && jsonData.error!==undefined) {
			opm_infoMsgs("errorMsg",jsonData.error.message); //NO I18N
			flag = true;
		}
	}
	return flag;
}

function nt_getNotificationTemplateModel(model) {
	model.pageName = "addPage"; //NO I18N
	model.templateTypes = nt_getNotificationTemplateTypes();
	model.template = nt_getCurrentTemplateDetails(model);
	if(!OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
	model.variableList = nt_getNotificationTemplateVariables(model.type);
	}
	model.subVariablePrompt = Ember.I18n.t("webclient.admin.profiledetails.subject.SelectValue"); //NO I18N
	model.msgVariablePrompt = Ember.I18n.t("webclient.admin.profiledetails.message.SelectValue"); //NO I18N
	model.serviceDeskTicket = {};
	model.serviceNowTicket = {};
	model.serviceDeskJiraTicket = {};
	model.serviceDeskOnDemandTicket = {};
	model.templateName = ""; //NO I18N
	// NCM change management template names are fixed once created
	model.isTemplateNameLocked = !!OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction && model.task !== "Add"; //NO I18N
	model.isAvailWritePermission = OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction ? window.OPM.hasNcmNotificationProfileWriteAccess : (window.isoperator || window.OPM.userPermissions.notificationProfileWrite);
    model.hideTestButton = (model.type === "NCMRollback" || model.type === "Configlets" || model.type === "NCMAlarm"); //No I18N

	if(model.task!=="Add") { //NO I18N
		var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/v2/admin/getNotificationTemplate",{profileID:model.templateID}); //NO I18N
		if(response.error!==undefined) {
		    if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
				if(OPMClient.NCMNotificationTemplateController.usesNCMConfigAutomationRoutes()) {
                    opmGlobalRoute.transitionTo("NCMConfigAutomation.NCMChangeManagement.Action"); //NO I18N
                } else {
                    opmGlobalRoute.transitionTo("Settings.NcmConfig.Notification.Action"); //NO I18N
                }
                opm_infoMsgs("errorMsg",response.error.message); //NO I18N
                return;
            }
			if(window.OPM.isNFA) {
				opmGlobalRoute.transitionTo("Settings.NetflowConfig.NotificationTemplates"); //NO I18N
			}else if(window.OPM.isFWA) {
				opmGlobalRoute.transitionTo("Settings.FirewallConfig.NotificationTemplates"); //NO I18N
			}
			opm_infoMsgs("errorMsg",response.error.message); //NO I18N
			return;
		}
		if(model.task==="Edit") { //NO I18N
			model.templateName = response.name;
			model.templateName_old = response.name;
		}
		if(response.type === 'CITInternal'){
			model.CITInternal = true;
		}else{
			model.CITInternal = false;
		}

        if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
            var ncmActionName = response.name;
            if(ncmActionName.startsWith("NCM_")){ //NO I18N
                ncmActionName = ncmActionName.substring(4);
            }
            model.templateName = ncmActionName;
            model.templateName_old = ncmActionName;
            model.storedTemplateName = response.name;
        }


		switch(model.type) {
			case "Email": 		//NO I18N
			case "EmailSMS": 	model.fromAddress = response.fromAddress; //NO I18N
								model.toAddress = response.toAddress;
								if(model.type==="Email") { //NO I18N
									model.ccAddress = response.ccAddress;
									model.mailFormat = response.MAILFORMAT;
								}
								break;
			case "ModemSMS":	model.selectedGateWay = response.gateway; //NO I18N
								model.toNumber = response.toNumber;
								model.messageVariable = response.message;
								break;
			case "Chat":		model.receiverType = response.receivertype; //NO I18N
								if(model.receiverType==="channel") { //NO I18N
									model.slackChannelID = response.receiverid;
								}else {
									model.slackUserID = response.receiverid;
									model.slackMemberID = response.receiverid;
								}
								model.productName=response.productName;
								break;
			case "RunProgram":	model.runProgramCommand = response.sysprogram; //NO I18N
								model.messageVariable = response.sysarguments;
								model.errappend = (response.errappend==="true"); //NO I18N
								model.append = (response.append==="true"); //NO I18N
								model.timeout = response.timeout;
								break;
			case "LogTicket":	if(model.CITInternal){//NO I18N
									model.serviceType=response.templateName;
									var npTemplateDetails = {};
									npTemplateDetails.internalTemplateId = response.templateId;
									npTemplateDetails.internalTemplateName = response.templateName;
									npTemplateDetails.internalTemplateIsEnabled = response.isEnabled;
									npTemplateDetails.internalTemplateDisplayName = response.displayName;
									npTemplateDetails.internalTemplatetype = response.templateType;
									if(response.citNPFields!=undefined){
										npTemplateDetails.internalTemplatenpFields = JSON.parse(response.citNPFields);
									}
									if(response.citNPFields==undefined && response.type==="CITInternal"){
										opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.cit.internal.npfetchfailed',{param0:response.displayName})+". "+Ember.I18n.t('webclient.cit.internal.connectionissue'));//No I18N
										return;
									}
									npTemplateDetails.isFieldsFetched = true;
									Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
									if(response.templateName === "TPI_PAGERDUTY"){
										var customDetailsField = JSON.parse(response.citNPFields);
                                         var customdetailsArray = [];
                                        for (var i = 0; i < customDetailsField.length; i++) {
                                            if (customDetailsField[i].key === "customdetailskey") {
                                            customdetailsArray = JSON.parse(customDetailsField[i].selectedValue);
                                              break;
                                            }
                                        }
                                        for (var index = 0; index < customdetailsArray.length; index++) {
											customdetailsArray[index].valueId="add_customdetailValueId"+(index+1);
											customdetailsArray[index].showDelete = false;
											customdetailsArray[index].keyId="add_customdetailkeyId"+(index+1);
											customdetailsArray[index].arrayIndex = index+1;
										   if (index !== customdetailsArray.length - 1) {
											 customdetailsArray[index].showDelete = true;
											}
										}
										Ember.set("OPMClient.SettingsNotificationsController.customdetailsArray", customdetailsArray);//No I18N
									}else if(response.templateName === "TPI_JIRACLOUD"){//No I18N
										if(response.profileID !=""){
											var customDetailsField="";
											if(response.citNPFields!=undefined){
												 customDetailsField = JSON.parse(response.citNPFields);
											}
											if(response.citNPFields==undefined && response.type==="CITInternal"){
												opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.cit.internal.connectionissue'));//No I18N
											 }
											var customdetailsArray = [];
											var projectID="";
											var dependentID="";
											var profileID="";
										   for (var i = 0; i < customDetailsField.length; i++) {
											var field = customDetailsField[i];
											   if (field.displayName === "Projects") {
												 projectID = field.selectedValue;
												 dependentID = field.dependentId;	
											   }
										   }
										   var postData = {
											templateId : response.templateId,
											productName : response.templateName,
											profileID : response.profileID,
											projectID:projectID,
											apiId:dependentID
										};
										var callBackFn = function(jsonData){
											if(jsonData.error==undefined){
												npTemplateDetails.internalTemplatenpFields = jsonData;
												npTemplateDetails.isFieldsFetched = true;
												Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
												$('#cit_clearfix').css({'display':'none'});
												var customDetailsField =jsonData;
												var issueID="";
												for (var i = 0; i < customDetailsField.length; i++) {
													var field = customDetailsField[i];
													   if (field.displayName === "Issues Types") {
														 issueID = field.selectedValue;
														 dependentID = field.dependentId;	
													   }
												   }
												var postData = {
													templateId : response.templateId,
													productName : response.templateName,
													profileID : response.profileID,
													issueID:issueID,
													apiId:dependentID,
													projectID:projectID
												};
												var callBackFn = function(jsonData){
													if(jsonData.error==undefined){
														npTemplateDetails.internalTemplatenpFields = jsonData;
														npTemplateDetails.isFieldsFetched = true;
														Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", undefined);//No I18N
														Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
														Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
														$('#cit_clearfix').css({'display':'none'});
														 });
														// Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
														 //$('#cit_clearfix').css({'display':'none'});
													}else{
														Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
														$('#cit_clearfix').css({'display':'none'});
													}
												};
												opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern+"/admin/getInternalCITemplateNPFields",postData,Ember.I18n.t('webclient.cit.internal.integration.waitmsg',{param0:"JiraCloud"}),callBackFn); //No I18n
											}else{
												Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
												$('#cit_clearfix').css({'display':'none'});
											}
										};
										opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern+"/admin/getInternalCITemplateNPFields",postData,Ember.I18n.t('webclient.cit.internal.integration.waitmsg'),callBackFn); //No I18n
										}
										
									}
								}else{
									if(response.productName==="JIRA") { //NO I18N
										model.serviceType="serviceDeskJira";//NO I18N
										model.serviceDeskJiraTicket=response;
									}else{
										var ticket = { 
												ticketCategory:response.ticketCategory,
												ticketGrpTech:response.ticketGrpTech,
												ticketItem:response.ticketItem,
												ticketPriority:response.ticketPriority,
												ticketSubCategory:response.ticketSubCategory,
												ticketTechnician:response.ticketTechnician
										}
										if(response.productName==="SERVICEDESK") { //NO I18N
											model.serviceType="serviceDesk"; //NO I18N
											model.serviceDeskTicket = ticket;
										}else if(response.productName==="OnDemand") { //NO I18N
											model.serviceType="serviceDeskOnDemand"; //NO I18N
											model.profileType = "SDPOnDemand"; //NO I18N
											ticket.ticketGrpTech=response.ticketGroup;
											ticket.ticketSite=response.ticketSite;
											ticket.ticketUrgency=response.ticketUrgency;
											ticket.ticketImpact=response.ticketImpact;
											model.serviceDeskOnDemandTicket = ticket;

											model.serviceType="serviceNow"; //NO I18N

											ticket.ticketImpact = response.ticketImpact;
											ticket.ticketUrgency = response.ticketUrgency;

											// Per-profile event fields
											if(response.snowTicketType !== undefined){
												ticket.snowTicketType = response.snowTicketType;
											}
											var snEventFields = ['source','node','type','resource','metric_name','event_class','severity','description','cmdb_ci','message_key','title'];//NO I18N
											for(var i=0; i<snEventFields.length; i++){
												var eKey = 'event_' + snEventFields[i];//NO I18N
												if(response[eKey] !== undefined){
													ticket[eKey] = response[eKey];
												}
											}

											model.serviceNowTicket = ticket;
										}
									}
								}
								break;
			case "WebAlarm": 	model.selectedUserIDs = response.selUserIds; //NO I18N
								model.selectedRoleIDs = response.selRoleIds;
								model.selectedAlarmSound = response.soundFile;
								break;
			case "SysLog":		model.sysLogHost = response.sysLogHost; //NO I18N
								model.sysLogPort = response.sysLogPort;
								model.sysLogSeverity = response.severity;
								model.sysLogFacility = response.facility;
								model.messageVariable = response.variables;
								break;
			case "Trap":		model.trapProfilePeerName = response.peername; //NO I18N
								model.trapProfilePort = response.trap_port;
								model.snmpVersion = response.version;
								if(model.snmpVersion==="V3") { //NO I18N
									model.snmpv3CredentialID = response.credentialId;
									model.trapCommunity = ""; //NO I18N
								}else {
									model.trapCommunity = response.community;
								}
								model.messageVariable = response.varbind;
								break;
			case "Ansible":     
								model.selectedPlayBook = response.playbookId; 
								model.messageVariable = response.sysarguments;
								model.templateName = response.name;
								break;

								
			case "Webhook":		model.webhookRequestType = response.Webhookmethodtype; //NO I18N
								model.webhookURL = response.Webhookurl;
								model.userAgent = response.Webhoookuseragent;
								model.timeout = response.Webhooktimeout;
								var requestHeaders = JSON.parse(response.Webhookheaders);
								for(var i=0; i<requestHeaders.length; i++) {
									if(requestHeaders[i].key === "Content-Type") {
										model.contentType = requestHeaders[i].value;
										requestHeaders.splice(i, 1);
										break;
									}
								}
								model.requestHeaderData = requestHeaders;
								var customParameters = JSON.parse(response.Webhookcustom);
								for(var j=0; j<customParameters.length; j++) {
									if(customParameters[j].key === "Body-content") {
										model.bodyContent = customParameters[j].value;
										customParameters.splice(i, 1);
										break;
									}
								}
								model.customParamsData = customParameters;
								if(["POST", "PUT", "PATCH"].indexOf(model.webhookRequestType) > -1) {
									model.showDataType = true;
									if(model.contentType === "application/x-www-form-urlencoded") {
										model.dataType = "form-urlencoded"; //NO I18N
									}else if(model.contentType === "multipart/form-data") { //NO I18N
										model.dataType = "form-data"; //NO I18N
									}else {
										model.dataType = "raw"; //NO I18N
										switch(model.contentType) {
											case "text/plain":				model.payloadType = "Text";			break; //NO I18N
											case "application/xml":			model.payloadType = "XML"; 			break; //NO I18N
											case "application/json":		model.payloadType = "JSON"; 		break; //NO I18N
											case "application/javascript":	model.payloadType = "JavaScript";	break; //NO I18N
											case "text/html":				model.payloadType = "HTML";			break; //NO I18N
											default:						model.payloadType = "NONE"; //NO I18N
																			model.otherContentType = model.contentType;
																			break;
										}
									}
								}
								break;
			case "SIEM":		siemGetDetails(response.productName,response);//No I18N
								model.messageVariable = response.rawMessage;
							break;
            case "NCMRollback":  //No I18N
                                if(response.rollbackPrevVersion === "true"){//No I18N
                                    model.rollbackPrevVersion = true;
                                }else{
                                    model.rollbackPrevVersion = false;
                                }
                                if(response.rollbackBaseline === "true"){//No I18N
                                    model.rollbackBaseline = true;
                                }
                                else{
                                    model.rollbackBaseline = false;
                                }
                                model.selectedRollbackMode = response.configType;
                                break;
            case "Configlets":  model.configletId = response.ConfigletsID; //NO I18N
                                model.configletName = response.name;
                                model.configletsVariables = JSON.parse(response.configletsVariables);
                                break;
            case "NCMAlarm":    model.ncmAlarmSeverity = response.alarmSeverity; //NO I18N
                                break;

		}
		if(["Email","EmailSMS","Chat"].contains(model.type) || (model.type === "LogTicket" && !model.CITInternal)) { //NO I18N
			model.subjectVariable = response.subject;
			model.messageVariable = response.message;
		}
	}else {
		model.subjectVariable = nt_getDefaultSubjectVariables();
		model.messageVariable = nt_getDefaultMessageVariables();
	}
	model.links = nt_getLinksByProduct();
	return model;
}

function nt_getDefaultSubjectVariables() {
	var subVariable;
	if(window.OPM.isOPM) {
		subVariable = Ember.I18n.t("webclient.mail.subject.model"); //NO I18N
	}else if(window.OPM.isNFA) {
		subVariable = Ember.I18n.t("nfa.nTemplates.defaultSubject.variable"); //NO I18N
	}else if(window.OPM.isFWA) {
		subVariable = Ember.I18n.t("webclient.fwa.notificationTemp.defaultSubject"); //NO I18N
	}
	return subVariable;
}

function nt_getDefaultMessageVariables() {
	var msgVariable;
	if(window.OPM.isOPM) {
		msgVariable = Ember.I18n.t("webclient.mail.message.model"); //NO I18N
	}else if(window.OPM.isNFA) {
		msgVariable = Ember.I18n.t("nfa.nTemplates.defaultMessage.variable"); //NO I18N
	}else if(window.OPM.isFWA) {
		msgVariable = Ember.I18n.t("webclient.fwa.notificationTemp.defaultMsg"); //NO I18N
	}
	return msgVariable;
}

function nt_redirectToNotificationTemplateTask(type,task,templateID) {
	var routeName;
	if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
        routeName = (OPMClient.NCMNotificationTemplateController.usesNCMConfigAutomationRoutes()) ? "NCMConfigAutomation.NCMChangeManagement.Action.AddEdit" : "Settings.NcmConfig.Notification.Action.AddEdit"; //NO I18N
    } else if(window.OPM.isOPM) {
		routeName = "Settings.Notification.TemplateTask"; //NO I18N
	}else if(window.OPM.isNFA) {
		routeName = "Settings.NetflowConfig.NotificationTemplateTask"; //NO I18N
	}else if(window.OPM.isFWA) {
		routeName = "Settings.FirewallConfig.NotificationTemplateTask"; //NO I18N
	}
	opmGlobalRoute.transitionTo(routeName,{type:type,task:task,templateID:templateID});
}

function nt_redirectToNotificationTemplateTypes() {
    if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
        if(OPMClient.NCMNotificationTemplateController.usesNCMConfigAutomationRoutes()) {
            opmGlobalRoute.transitionTo("NCMConfigAutomation.NCMChangeManagement.Action.Types"); //NO I18N
        } else {
            opmGlobalRoute.transitionTo("Settings.NcmConfig.Notification.Action.Types"); //NO I18N
        }
        return;
    }
	if(window.OPM.isOPM) {
		opmGlobalRoute.transitionTo("Settings.Notification.TemplateTypes"); //NO I18N
	}else if(window.OPM.isNFA) {
		opmGlobalRoute.transitionTo("Settings.NetflowConfig.NotificationTemplateTypes"); //NO I18N
	}else if(window.OPM.isFWA) {
		opmGlobalRoute.transitionTo("Settings.FirewallConfig.NotificationTemplateTypes"); //NO I18N
	}
}

function nt_redirectToNotificationTemplateList() {
    if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
        if(OPMClient.NCMNotificationTemplateController.usesNCMConfigAutomationRoutes()) {
            opmGlobalRoute.transitionTo("NCMConfigAutomation.NCMChangeManagement.Action"); //NO I18N
        } else {
            opmGlobalRoute.transitionTo("Settings.NcmConfig.Notification.Action"); //NO I18N
        }
        return;
    }
	if(window.OPM.isOPM) {
		opmGlobalRoute.transitionTo("Settings.Notification.TemplateList"); //NO I18N
	}else if(window.OPM.isNFA) {
		opmGlobalRoute.transitionTo("Settings.NetflowConfig.NotificationTemplateList"); //NO I18N
	}else if(window.OPM.isFWA) {
		opmGlobalRoute.transitionTo("Settings.FirewallConfig.NotificationTemplateList"); //NO I18N
	}
}

function nt_getTemplateTaskCallBackURL(type,task,templateID) {
    if(OPMClient.NCMNotificationTemplateController.isNCMChangeManagementAction) {
        // isNCM is false on OPM Plus, which has no Settings.NcmConfig.Notification route
        var isNCMTree = OPMClient.NCMNotificationTemplateController.usesNCMConfigAutomationRoutes();
        if(isNCMTree) {
            opmGlobalRoute.transitionTo("NCMConfigAutomation.NCMChangeManagement.Action"); //NO I18N
        } else {
            opmGlobalRoute.transitionTo("Settings.NcmConfig.Notification.Action"); //NO I18N
        }
        return isNCMTree ? ("/NCMConfigAutomation/NCMChangeManagement/Action/"+type+"/"+task+"/"+templateID) : ("/Settings/NcmConfig/Notification/Action/"+type+"/"+task+"/"+templateID); //NO I18N
    }
	if(window.OPM.isOPM) {
		return "/Settings/Notification/Templates/"+type+"/"+task+"/"+templateID; //NO I18N
	}else if(window.OPM.isNFA) {
		return "/Settings/NetflowConfig/NotificationTemplates/"+type+"/"+task+"/"+templateID; //NO I18N
	}else if(window.OPM.isFWA) {
		return "/Settings/FirewallConfig/NotificationTemplates/"+type+"/"+task+"/"+templateID; //NO I18N
	}
	return ""; //NO I18N
}

function nt_isWebhookRestrictedForOperator(profileTypeKey) {
	return (window.isoperator && profileTypeKey === "Webhook"); //NO I18N
}

function notiWriteAllowed(){
	if(window.OPM.isFWA){
		return (window.isoperator || window.OPM.userPermissions.notificationProfileWrite);
	}else{
		return window.OPM.userPermissions.notificationProfileWrite;
	}
}

function nt_getKeyForVariableValues(value) {
	var returnValue = ""; //NO I18N
	switch(value) {
		case "$NetFlowField(sourceType)":	returnValue = "NFASourceType"; break; //NO I18N
		case "$NetFlowField(sourceName)":	returnValue = "NFASourceName"; break; //NO I18N
		case "$NetFlowField(alertName)":	returnValue = "NFAAlertProfileName"; break; //NO I18N
		case "$NetFlowField(alertType)":	returnValue = "NFAAlertProfileType"; break; //NO I18N
		case "$NetFlowField(criteria)":		returnValue = "NFAAlertcriteria"; break; //NO I18N
		case "$alarmid":					returnValue = "AlarmID"; break; //NO I18N
		case "$message":					returnValue = "AlarmMessage"; break; //NO I18N
		case "$rcaLinkedToTheAlarm":		returnValue = "RCAProfileName"; break; //NO I18N
		case "$displayName":				returnValue = "AlarmSource"; break; //NO I18N
		case "$category":					returnValue = "AlarmCategory"; break; //NO I18N
		case "$stringseverity":				returnValue = "AlarmSeverity"; break; //NO I18N
		case "$strModTime":					returnValue = "AlarmGeneratedTime"; break; //NO I18N
		case "$eventType":					returnValue = "AlarmEventType"; break; //NO I18N
		case "$entity":						returnValue = "AlarmEntity"; break; //NO I18N
		case "$lastPolledValue":			returnValue = "LastPolledValue"; break; //NO I18N
		case "$FwaField(profileName)":		returnValue = "ProfileName"; break; //NO I18N
		case "$FwaField(criteria)":			returnValue = "Criteria"; break; //NO I18N
		case "$FwaField(alertMsg)":			returnValue = "AlertMessage"; break; //NO I18N
	}
	return returnValue;
}

function nt_getWebhookFormattedVariableList() {
	var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getMailVariables", {isNotificationTemplate:true}); //NO I18N
	var variableList = [];
	for(key in list) {
		variableList.push({group: key, variables: list[key]});
	}
	return variableList;
}

function nt_getNCMWebhookFormattedVariableList(model) {
	var webhookVariableList = [];
	var flatList = model.variableList || [];
	var groupMap = {};
	var groupOrder = [];
	flatList.forEach(function(item) {
		var g = item.group || ""; //NO I18N
		if(!groupMap[g]) {
			groupMap[g] = [];
			groupOrder.push(g);
		}
		groupMap[g].push({key: item.name, value: item.value});
	});
	webhookVariableList = groupOrder.map(function(g) {
		return {group: g, variables: groupMap[g]};
	});
	return webhookVariableList;
}

// NCM per-field variable icons use the selected event's variables, not /admin/getMailVariables
function nt_getNCMDropdownOptions(model) {
	return nt_getNCMWebhookFormattedVariableList(model).map(function(g) {
		return {key: g.group, value: g.variables};
	});
}

function nt_getWebhookTableData(model, tableName) {
	var tableData = $("#"+tableName).jqGrid("getGridParam", "data"); //NO I18N
	var returnArray = [];
	if(tableName === "webhookRequestHeaderList"){
		if(model.showDataType) {
			returnArray.push({"key": "Content-Type", "value": model.contentType});
		}
		for(var i=0, length=tableData.length; i<length; i++) {
			returnArray.push({"key": tableData[i].key, "value": tableData[i].value}); //NO I18N
		}
	}
	if(tableName === "customParamList" && model.showDataType) { //NO I18N
		if(model.dataType === "raw") {
			returnArray.push({"key": "Body-content", "value": model.bodyContent, "type": "raw"}); //NO I18N
		}
		if(tableData !== undefined) {
			for(var i=0, length=tableData.length; i<length; i++) {
				returnArray.push({"key": tableData[i].key, "value": tableData[i].value, "type": model.dataType}); //NO I18N
			}
		}
	}
	return JSON.stringify(returnArray);
}

OPMClient.ServiceDeskJiraTemplateConfigComponent = Ember.Component.extend({
	templateName:"service-desk-jira-template-config", //NO I18N
	ticketPrompt:Ember.I18n.t("webclient.map.flash.chooseAValue"), //NO I18N
	initDefaults:function() {
//		if(this.model.task==="Add") { //NO I18N
//			this.set("ticket.ticketItem",""); //NO I18N
//		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		if(this.model.serviceDeskJiraEnabled) {
			if(this.ticket.JOP_key_projectkey != undefined){
				this.jiraGetProjects(this.ticket);
			}else{
				this.jiraGetProjects();
			}			
		}
	},
	jiraGetFields:function(){
		var profileDetails=this.ticket
		$('#clearfix').css({'display':'block'});//No I18N
		var self = this;
		if(self.get('model.projectType') !== undefined && self.get('model.projectType') !== null && self.get('model.projectType') !== "" && self.get('model.projectType') !== "null" && self.get('model.issueType') !== undefined && self.get('model.issueType') !== null && self.get('model.issueType') !== "" && self.get('model.issueType') !== "null"){
			self.set('isEnabled',true);//No I18N
			$.ajax({
				url:window.OPM.apiUrlPattern+"/admin/getJiraIssueFields?issueType="+self.get('model.issueType')+"&projectType="+self.get('model.projectType'),//No I18N
				method:'GET',//No I18N
				async:false,
				beforeSend: function(XMLHttpRequest,settings){
					appendCollectorDetails(XMLHttpRequest,settings);
					this.msgID = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.getIssueFields',this));//No I18N
				},
				success: function(jsonData){
					$("#"+this.msgID).remove();
					if(jsonData.error!==undefined){
						showMessage(jsonData);
					}
					else{
						self.set('responseFields',jsonData);//No I18N
					}					
				}
			});
			var kv = [];
			for(var i=0;i<self.get('responseFields').length;i++){
						var field = self.get('responseFields')[i];
						var modifiedKey = "JOP_";//No I18N
						var type = field.type;
						var values = field.values;	
						var iFValues = [];				
						if(Array.isArray(values)  && type !== "string"){
							var flag = 0; 
							for(var j=0;j<values.length;j++){
								var tempObj = {};
								var innerField = values[j];
								if(( innerField.hasOwnProperty("id") || innerField.hasOwnProperty("key") ) && innerField.hasOwnProperty("name") && type === "array" ){
									if(flag == 0){
										modifiedKey = modifiedKey + "name_";//No I18N
										flag++;
									}
									tempObj.key = innerField.name;
									if(field.fieldId == "customfield_10002"){
										tempObj.key = innerField.id;
									}
									tempObj.name = innerField.name;
									tempObj.isSelected = false;
									if(profileDetails!=undefined && self.get('model.issueType')!==undefined){
										for(var key in profileDetails)
						 					{
						 						if(key.substring(key.indexOf("_",key.indexOf('_') + 1)+1) === field.fieldId && profileDetails[key]!=="null" && profileDetails[key]!=="" && profileDetails[key]!=="\"\"" && profileDetails[key]!=="[]")
						 							{
						 								var valueObj = JSON.parse(profileDetails[key]);
						 								var selectCheckJSONArray = valueObj.value;
						 								if(selectCheckJSONArray.indexOf("[") > -1 && selectCheckJSONArray.indexOf("]") > -1){
						 									var selTempJson=JSON.parse(selectCheckJSONArray);
						 									for(var k=0;k<selTempJson.length;k++){
						 										if(selTempJson[k] == tempObj.key){
						 											tempObj.isSelected = true;
								 									break;
						 										}
						 									}
						 								}else{
						 									if(selectCheckJSONArray == tempObj.key)
							 								{
							 									tempObj.isSelected = true;
							 									break;
							 								}
						 								}
						 							}
						 					}
									}
									iFValues.push(tempObj);
								}
								else if((innerField.hasOwnProperty("id") || innerField.hasOwnProperty("key") ) && innerField.hasOwnProperty("value") && type === "array"){
									if(flag == 0){
										modifiedKey = modifiedKey + "value_";//No I18N
										flag++;
									}
									tempObj.key = innerField.value;
									tempObj.name = innerField.value;
									tempObj.isSelected = false;
									if(profileDetails!=undefined && self.get('model.issueType')!==undefined){
										for(var key in profileDetails)
						 					{
						 						if(key.substring(key.indexOf("_",key.indexOf('_') + 1)+1) === field.fieldId && profileDetails[key]!=="null" && profileDetails[key]!=="" && profileDetails[key]!=="\"\"" && profileDetails[key]!=="[]")
						 							{
						 								var valueObj = JSON.parse(profileDetails[key]);
						 								var selectCheckJSONArray = valueObj.value;
						 								if(selectCheckJSONArray.indexOf("[") > -1 && selectCheckJSONArray.indexOf("]") > -1){
						 									var selTempJson=JSON.parse(selectCheckJSONArray);
						 									for(var k=0;k<selTempJson.length;k++){
						 										if(selTempJson[k] == tempObj.key){
						 											tempObj.isSelected = true;
								 									break;
						 										}
						 									}
						 								}else{
						 									if(selectCheckJSONArray == tempObj.key)
							 								{
							 									tempObj.isSelected = true;
							 									break;
							 								}
						 								}
						 							}
						 					}
									}
									iFValues.push(tempObj);
								}
								else if(( innerField.hasOwnProperty("id") || innerField.hasOwnProperty("key") ) && innerField.hasOwnProperty("name")){
									if(flag == 0){
										modifiedKey = modifiedKey + "name_";//No I18n
										flag++;
									}
									tempObj.key = innerField.name;
									tempObj.name = innerField.name;
									iFValues.push(tempObj);
								}
								else if(innerField.hasOwnProperty("id") && innerField.hasOwnProperty("key")){
									if(flag == 0){
										modifiedKey = modifiedKey + "key_";//No I18N
										flag++;
									}

									tempObj.key = innerField.id;
									tempObj.name = innerField.key;
									iFValues.push(tempObj);
								}
								else if(( innerField.hasOwnProperty("id") || innerField.hasOwnProperty("key") ) && innerField.hasOwnProperty("value")){
									if(flag == 0){
										modifiedKey = modifiedKey + "value_";//No I18N
										flag++;
									}
									tempObj.key = innerField.value;
									tempObj.name = innerField.value;
									tempObj.isChild = false;
									tempObj.isSelected = false;
									if(type === "option-with-child" && values[j].child!=undefined){
										tempObj.isChild = true;
										tempObj.child=[];
										var childValues = values[j].child;
										for(var k=0 ; k < childValues.length ; k++){
												if(childValues[k].hasOwnProperty("value") && childValues[k].hasOwnProperty("id")){
													var tempChildObj = {};
														tempChildObj.key = childValues[k].value;
														tempChildObj.name = childValues[k].value;
														tempChildObj.id = (childValues[k].value).replace(" ","");
														tempObj.child.push(tempChildObj);
												}

										}
										
									}									
									if(!tempObj.isChild){
										tempObj.prompt = Ember.I18n.t("webclient.jira.novalue",this);//No I18N
									}else{
										tempObj.prompt = Ember.I18n.t("webclient.jira.selectvalue",this);//No I18N
									}
									iFValues.push(tempObj);
								}
							}
							modifiedKey = modifiedKey + field.fieldId;
						}
						else{
							modifiedKey = modifiedKey + "NoKey_" + field.fieldId;//No I18N
						}
						tempField = {};
						tempField.key = modifiedKey;
						tempField.name = field.name;
						tempField.values = iFValues;
						tempField.type = type;
						if(type === "array" && ( tempField.key.substring(tempField.key.indexOf('_') + 1,tempField.key.indexOf("_",tempField.key.indexOf('_') + 1)) === "name" || tempField.key.substring(tempField.key.indexOf('_') + 1,tempField.key.indexOf("_",tempField.key.indexOf('_') + 1)) === "value")){
							tempField.arrayValue = [];

						}
						else if(type === "option-with-child" ){
							tempField.value = "";
							tempField.childValue = "";
						}
						else{
							tempField.value = "";
						}
						if(profileDetails!=undefined && self.get('model.issueType')!==undefined  && type === "array" && (tempField.key.substring(tempField.key.indexOf('_') + 1,tempField.key.indexOf("_",tempField.key.indexOf('_') + 1)) === "name" || tempField.key.substring(tempField.key.indexOf('_') + 1,tempField.key.indexOf("_",tempField.key.indexOf('_') + 1)) === "value"))
						{
								for(var key in profileDetails)
						 		{
						 			if(key === tempField.key && profileDetails[key]!=="null" && profileDetails[key]!=="" && profileDetails[key]!=="\"\"" && profileDetails[key]!=="[]")
						 			{
						 				var valueObj = JSON.parse(profileDetails[key]);
						 				tempField.arrayValue = valueObj.value;
						 				break;
						 			}
						 		}

						}
						else if(profileDetails!=undefined && self.get('model.issueType')!==undefined  && type === "option-with-child"){
								for(var key in profileDetails)
						 		{
						 			if(key === tempField.key && profileDetails[key]!=="null" && profileDetails[key]!=="" && profileDetails[key]!=="\"\"" && profileDetails[key]!=="{}")
						 			{
						 				var valueObj = JSON.parse(profileDetails[key]);
						 				var tempJSON = JSON.parse(valueObj.value);
						 				tempField.value = tempJSON.value;
						 				tempField.childValue = tempJSON.childValue;
						 				break;
						 			}
						 		}	
						}
						else if(profileDetails!=undefined  && self.get('model.issueType')!==undefined){
						 		for(var key in profileDetails)
						 		{
						 			if(key === tempField.key && profileDetails[key]!=="null" && profileDetails[key]!=="" && profileDetails[key]!=="\"\"" && profileDetails[key]!=="[]")
						 			{
						 				var valueObj = JSON.parse(profileDetails[key]);
						 				tempField.value = valueObj.value;
						 					
						 			}
						 		}

						 }
						tempField.flag = true;
						tempField.isRequired = field.required;
						if(iFValues.length > 0 && type === "array" && (tempField.key.substring(tempField.key.indexOf('_') + 1,tempField.key.indexOf("_",tempField.key.indexOf('_') + 1)) === "name" || tempField.key.substring(tempField.key.indexOf('_') + 1,tempField.key.indexOf("_",tempField.key.indexOf('_') + 1)) === "value")){
							tempField.isMultiSelect = true;
							tempField.key_Rem = tempField.key+"_Rem";//No I18N
							tempField.haveTooltip = false;
						}
						else if(iFValues.length > 0 && type === "option-with-child"){
							tempField.haveChild = true;
							// tempField.childFlag = false;
							tempField.haveTooltip = true;
							tempField.toolTip = "webclient.jira.childtooltip";//No I18N
						}
						else if(iFValues.length > 0){
							tempField.isDropdown = true;
							tempField.haveTooltip = false;
							if(type === "status"){
								tempField.haveTooltip = true;
								tempField.toolTip = "webclient.jira.statustooltip";//No I18N
							}
						}
						else if(type === "date"){
							tempField.isdueDate = true;
							tempField.haveTooltip = false;
						}
						else if(type === "datetime"){
							tempField.isDatetime = true;
							tempField.haveTooltip = true;
							tempField.toolTip = "webclient.jira.datetimetooltip";//No I18N
						}
						else{
							tempField.isDropdown = false;
							tempField.isMultiSelect = false;
							tempField.isDatetime = false;
							tempField.isdueDate = false;
							tempField.haveTooltip = false;
							if((tempField.key).includes("labels",6) || (type == "array" && field.items == "string"))
							{
								tempField.placeHolder = "eg. abc,def";//No I18N
								tempField.haveTooltip = true;
								tempField.toolTip = "webclient.jira.labelstooltip";//No I18N

							}
							else if((tempField.key).includes("10100",6))
							{
								tempField.placeHolder = "eg. TES-1";//No I18N
							}
							else if((tempField.key).includes("Estimate",6))
							{
								tempField.placeHolder = "eg. 3w 4d 5h";//No I18N
								tempField.haveTooltip = true;
								tempField.toolTip =  "webclient.jira.estimatetooltip";//No I18N
							}
							else
							{
								tempField.placeHolder = Ember.I18n.t('opu.common.PLEASE_ENTER_A_VALUE',this);//No I18N
							}
						}
						if(field.fieldId.localeCompare("attachment") !== 0 && field.fieldId.localeCompare("issuelinks") !== 0){
							kv.push(tempField);
						}

			}
			tempField = {};
			tempField.key = "JOP_name_issuetype";//No I18N
			tempField.name = "Issue Type";
			tempField.type = "others";
			tempField.values = self.get('issuetypes');
			tempField.isDropdown = true;
			tempField.value = self.get('model.issueType');
			tempField.flag = false;
			tempField.isRequired = true;
			kv.push(tempField);
			tempFieldProject = {};
			tempFieldProject.key = "JOP_key_projectkey";//No I18N
			tempFieldProject.name = "Issue Type";
			tempFieldProject.type = "others";
			tempFieldProject.values = self.get('projectTypes');
			tempFieldProject.isDropdown = true;
			tempFieldProject.value = self.get('model.projectType');
			tempFieldProject.flag = false;
			tempFieldProject.isRequired = true;	
			kv.push(tempFieldProject);
			self.set('ticket.dynamicFields',kv);//No I18N
			self.set('isEnabled',true);//No I18N
			}
			else{
				self.set('isEnabled',false);//No I18N
			}	
			$('#clearfix').css({'display':'none'});//No I18N	
	}.observes('model.issueType'),//No I18N
	jiraResetDetails:function(){
		var self = this;
		self.set('isProjectSelected',false);//No I18N
		self.set('model.issueType',undefined);//No I18N
		self.set('isEnabled',false);//No I18N
		self.set('issuetypes',undefined);//No I18N

	}.observes('model.projectType'),//No I18N
	jiraGetProjects:function(profileDetails,selfView){
		var self = this;
		$.ajax({
			url:window.OPM.apiUrlPattern+"/admin/getJiraProjects",//No I18N
			method:'GET',//No I18N
			async:true,
			self:self,
			msgID:"",
			selfView:selfView,
			profileDetails:profileDetails,
			beforeSend: function(XMLHttpRequest,settings){
				appendCollectorDetails(XMLHttpRequest,settings);
				this.msgID = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.getIssueFields',this));//No I18N
			},
			success:function(jsonData){
				$("#"+this.msgID).remove();
				if(jsonData.error!==undefined){
					showMessage(jsonData);
				}
				else{
					if(profileDetails!==undefined)
					{
						self.set('isProjectSelected',true);//No I18N
						self.set('projectTypes',jsonData);//No I18N
						var valueObj = JSON.parse(profileDetails.JOP_key_projectkey);
						self.set('model.projectType',valueObj.value);//No I18N
						self.send("jiraGetDetails",profileDetails,self);//No I18N
						var valueObj = JSON.parse(profileDetails.JOP_name_issuetype);
						self.set('model.issueType',valueObj.value);//No I18N
					}
					else{
					self.set('isProjectSelected',false);//No I18N
					self.set('model.projectType',undefined);//No I18N
					self.set('model.issueType',undefined);//No I18N
					self.set('isEnabled',false);//No I18N
					self.set('issuetypes',undefined);//No I18N
					self.set('projectTypes',jsonData);//No I18N
					}
				}
			}
		});
	},
	actions:{
		jiraGetDetails:function(profileDetails,selfView){
			var self = this;
			self.set('isProjectSelected',false);//No I18N
			self.set('model.issueType',undefined);//No I18N
			if(self.get('model.projectType') !== undefined && self.get('model.projectType') !== null && self.get('model.projectType') !== "" && self.get('model.projectType') !== "null")
			{
				var apiURL = window.OPM.apiUrlPattern+"/admin/getJiraIssueTypes"; //NO I18N
				var callBckFunc = function(jsonData,self){
					if(jsonData.error!==undefined){
						showMessage(jsonData);
					}
					else{
						self.set('issuetypes',jsonData);//No I18N
						self.set('isProjectSelected',true);//No I18N
					}
				};
				nfa_getAjaxResponseWithAsync(apiURL,{projectType:self.get('model.projectType')},callBckFunc,this,Ember.I18n.t("webclient.jira.getIssueFields")); //NO I18N
			}else{
				opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.projectnotselected',this));//No I18N
			}
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});
