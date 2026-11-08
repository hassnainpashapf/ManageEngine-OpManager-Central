

OPMClient.OpmAddCredentialsComponent = Ember.Component.extend({
	templateName: "components/opm-add-credentials", //No I18N
	didInsertElement: function(){
		var self = this;		
		var enableCred = self.get('enableCredential');
		var selectedCred = self.get('selectedCred');		
		if(enableCred){
			if(OPMClient.SettingsCredentialController.showCredList[0] == "All")
			{
				var tempArr = [];
				$.each(OPMClient.SettingsCredentialController.credentials, function(key,val){
					if(window.OPM.isCentralServer){
						if(val.type !== "gNMI"){
							tempArr.push(val);
						}
					}else{
						tempArr.push(val);
					}
					
				});
				self.set("credentials",tempArr);//No I18N	
			}
			else if(OPMClient.SettingsCredentialController.showCredList.length > 0)
			{
				var tempArr = [];
				for (var i = 0; i < OPMClient.SettingsCredentialController.showCredList.length; i++) {
					var c_obj = OPMClient.SettingsCredentialController.credentials[OPMClient.SettingsCredentialController.showCredList[i]];
					if(c_obj !== undefined)
					{
						if(window.OPM.isCentralServer){
							if(c_obj.type !== "gNMI"){
								tempArr.push(c_obj);
							}
						}else{
							tempArr.push(c_obj);
						}
					}
				}
				self.set("credentials",tempArr);//No I18N
			}
			var isEditCredObj = self.get('isEditCredObj');
			var credType;
			if(isEditCredObj){
				OPMClient.SettingsTabController.isEdit = true;
				var credName = $(isEditCredObj).text();
				credType = $(isEditCredObj).attr("data-credType");
				$('#opmCrendentialTypes').attr('disabled',true).val();
				$('#snmpName').attr('disabled',true).val(credName);	
				self.set('credDetails',opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/admin/getCredentialDetails?credentialName='+encodeURIComponent(credName)+'&type='+encodeURIComponent(credType))); //No I18n
			}
			// Will execute only after render is complete
			Ember.run.scheduleOnce('afterRender', function() { //No I18n
				Ember.run(function() {
					if(isEditCredObj) {
						$('#opmCrendentialTypes').val(credType);
						self.send('showAddCredentialView'); //No I18n
						$('#'+self.elementId+' .select2').select2();
						return;
					}
					$('#opmCrendentialTypes').val(selectedCred !== undefined && selectedCred !== ''?selectedCred:'SNMP v1/v2'); // By default selecting snmp1
					self.send('showAddCredentialView'); //No I18n					
					$('#'+self.elementId+' .select2').select2();
				});
			});
			$('#'+self.elementId+' .select2').select2();
			$('#opmCrendentialTypes').on('select2:open', function (e) {
				$('#opmCrendentialTypes').closest('section').off("scroll.select2");
			});
			slideIn(11);			
		}
		else
		{
			slideOut(11);
		}

	},
	enableCred: function(){
		if(this.get("enableCredential")){
			this.rerender();			
		}		
	}.observes('enableCredential'),//No I18N
	actions:{
		showAddCredentialView:function()
		{
			$('#opm_credentialContent').empty();
			var credModel = this.get('controller.credDetails'); //No I18n
			var selectedCred = $("#opmCrendentialTypes").val();
			var selectedComp = $('#opmCrendentialTypes option:selected').attr('data-compType');
			if(selectedCred === "SNMP v3") {
				this.set('controller.credentialHeader','webclient.credential.snmpv3.infomsg'); //No I18n
				this.set('controller.credentialLearnMore','https://www.manageengine.com/network-monitoring/help/snmpv3.html'); //No I18n
			}
			else if(selectedCred === "Linux") {
				this.set('controller.credentialHeader','opm.info.discovery.credential.telnetssh'); //No I18n
				this.set('controller.credentialLearnMore',''); //No I18n
			}
			else if(selectedCred === "GCP") {
				this.set('controller.credentialHeader','webclient.credential.gcp.infomsg'); //No I18n
				this.set('controller.credentialLearnMore','https://www.manageengine.com/network-monitoring/help/add-credentials.html?utm_source=inproduct&utm_campaign=OPM#gcp'); //No I18n
			}
			else {
				this.set('controller.credentialHeader','webclient.credential.header.infomsg'); //No I18n
				this.set('controller.credentialLearnMore','https://www.manageengine.com/network-monitoring/help/add-credentials.html'); //No I18n
			}
			var compnet1 = "OpmAdd"+selectedComp+"CredentialComponent";//No I18N
			Ember.set(OPMClient.SettingsTabController,"selectedComponent",compnet1);//No I18N
			var self = this;
			var childComponent = self.createChildView(OPMClient['OpmAdd'+selectedComp+'CredentialComponent'],{actions:"addCredential",userPermissions:window.OPM.userPermissions}); //No I18N
	  		childComponent.appendTo($('#opm_credentialContent'));
	  		childComponent = null;
		},
		closeCredentialSlide:function()
		{
			closeCredentialSlide();
		}
	},
	willDestroyElement:function()
	{
		OPMClient.SettingsTabController.isEdit = false;
		this.set('credDetails',null); //No I18n
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmAddSnmpv1CredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-snmpv1-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		$('#'+this.elementId+' .select2').select2();
		var self = this;
		//self.set("username","");		
		var snmpEditObj = self.get('parentView.credDetails');
		$('#snmpPort,#snmpTimeout,#snmpRet').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});

		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('snmpPort');
		var timeOutId = document.getElementById('snmpTimeout');
		var resetId = document.getElementById('snmpRet');
		document.getElementById('advCredInfo').addEventListener('wheel', function(event) {
			if (event.target === portId || event.target === timeOutId || event.target === resetId) {
				event.preventDefault();
				   return false;
			   }
		  });

		if(snmpEditObj) {
			self.set('operation','update'); //No I18n
			$('#snmpDesc').val(snmpEditObj.desc);
			$('#snmpPort').val(snmpEditObj.port);
			$('#snmpTimeout').val(snmpEditObj.timeout);
			$('#snmpRet').val(snmpEditObj.retries);
			$("#setSNMPV1CredentialDefault").prop("checked", snmpEditObj.isDefault);
		}
	},
	actions:{
			addCredential:function(isAssociate)
			{
				var self = this;
					var callBackFunc = function() {
					var credentialType = OPMClient.SettingsAddEditController.selectedCredential; //No I18N
					var data = {};//No I18N
					var update = self.get('operation') === "update" ? true : false; //No I18n
					var credeName = "";
					var credeType = "";
					var page = "AddDevice";//No I18N					
					var snmpName = trimAll($("#snmpName").val()); //No I18N
					var snmpDesc = trimAll($("#snmpDesc").val()); //No I18N
					var snmpRead = trimAll($("#snmpRead").val());//No I18N
					var snmpWrite = trimAll($("#snmpWrite").val());//No I18N
					var snmpPort = trimAll($("#snmpPort").val());//No I18N
					var snmpTimeout = trimAll($("#snmpTimeout").val());//No I18N
					var snmpRet = trimAll($("#snmpRet").val());//No I18N
					var checkReadPassword = false;
					var checkWritePassword = false;
					var setDefault = false;
					if((window.OPM.isNFA || (window.OPM.isOPM && window.OPM.isNfaPlug)) && document.getElementById("setSNMPV1CredentialDefault") !== null){
						var setDefault = document.getElementById("setSNMPV1CredentialDefault").checked; //No I18n
					}
					/*checking is user changed the password or not*/
					if(snmpRead==="") {
						checkReadPassword = true;
					}
					if(update && snmpWrite === "")
					{
						checkWritePassword = true;
					}
					if(update && snmpWrite === "" && snmpRead !== "")
					{
						checkWritePassword = false;
					}


					var url = window.OPM.apiUrlPattern + '/admin/addSNMPV1Credential'; //No I18n
					data = {'update':update,'credentialName':snmpName,'readCommunity':snmpRead,'writeCommunity':snmpWrite,'description':snmpDesc,'port':snmpPort,'timeout':snmpTimeout,'retries':snmpRet,'checkReadPassword':checkReadPassword,'checkWritePassword':checkWritePassword,'setDefault':setDefault}; //No I18N
					var fieldsToValidate = {'empty':['snmpName','snmpRead','snmpPort','snmpTimeout','snmpRet'],'port':['snmpPort'],'timeout':['snmpTimeout'],'retries':['snmpRet'],'limitCheck':['snmpRead','snmpWrite'],'rangeCheck':{'snmpPort':65535,'snmpTimeout':300,'snmpRet':10},'positive':['snmpPort','snmpTimeout']};//No I18N
					if(update) {
						fieldsToValidate.empty.splice(1,2);
					}

					credeName = snmpName;
					credeType = "SNMP v1/v2";//No I18N

					var isValid = opm_validateFields(fieldsToValidate);

					if(isValid){
					
					var response = opm_ajaxPostRequest(url,data);
					if(response !== undefined && !$.isEmptyObject(response))
					{
						if(response.result !== undefined)
						{
							if(self.fromSnapshotRediscoverPage!==undefined){
								rediscoverUnknownDevice({snmpArr:snmpName});
							}else{
							opm_infoMsgs("successMsg",response.result.message);//No I18N
							if(OPMClient.SettingsConfigurationController.pageName === "Storage") {
								opstor_getCredentialList();
							}
							else {
								opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
							}
							closeCredentialSlide();

							//Model 1
							var callBackFn = function(){
								openAssociateToProbes("CREDENTIALS",true, credeName,update);//No I18N
							}
							initProbeAssociation("CREDENTIALS","CREDENTIALS",credeName,callBackFn);

							//Model 2
							// if(isAssociate) {
							// 	openAssociateToProbes(isAssociate, credeName);
							// }
						}
						}
						else if(response.error !== undefined)
						{
							opm_infoMsgs("errorMsg",response.error.message);//No I18N
						}
						
					}
				}
				}
				checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS");//No I18N
			}
	}

});
OPMClient.OpmAddSnmpv3CredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-snmpv3-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var snmp3EditObj = this.get('parentView.credDetails');
		$('#v3Port,#v3Timeout,#v3Ret').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('v3Port');
		var timeOutId = document.getElementById('v3Timeout');
		var resetId = document.getElementById('v3Ret');
		document.getElementById('advCredv3Info').addEventListener('wheel', function(event) {
		if (event.target === portId || event.target === timeOutId || event.target === resetId) {
			event.preventDefault();
				return false;
			}
		});

		if(snmp3EditObj) {
			this.set('operation','update'); //No I18n
			$('#snmpDesc').val(snmp3EditObj.desc);
			$('#v3UserName').val(snmp3EditObj.userName);  //No I18N
			$('#v3ContextName').val(snmp3EditObj.contextName);  //No I18N
			$('#v3Port').val(snmp3EditObj.port);  //No I18N
			$("#setSNMPV3CredentialDefault").prop("checked", snmp3EditObj.isDefault);
			$('#authprotocol option[value='+snmp3EditObj.authProtocol+']').prop('selected',true); //No I18N
			if(snmp3EditObj.authPwd !== undefined)
			{
				$('#authpwd').val(snmp3EditObj.authPwd);  //No I18N
			}
			$('#privprotocol option[value='+snmp3EditObj.privProtocol+']').prop('selected',true); //No I18N
			if(snmp3EditObj.privPwd !== undefined)
			{
				$('#privpwd').val(snmp3EditObj.privPwd); //No I18N
			}
			$('#v3Timeout').val(snmp3EditObj.timeout); //No I18N
			$('#v3Ret').val(snmp3EditObj.retries); //No I18N
			changeAuthProto();
			changeEncProto();			
		}
		else{
			if(window.OPM.isFIPSEnabled)
			{
				changeAuthProto();
				changeEncProto();
			}
			else{
				$('#authprotocol,#privprotocol').val('None'); //No I18N
			}
		}

		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var update = self.get('operation') === 'update' ? true : false; //No I18n
			var v3Name = trimAll($("#snmpName").val()); //No I18N
		    var v3Desc = trimAll($("#snmpDesc").val()); //No I18N
		    var v3UserName = trimAll($("#v3UserName").val()); //No I18N
		    var v3ContextName = trimAll($("#v3ContextName").val()); //No I18N
		    var v3Port = trimAll($("#v3Port").val()); //No I18N
		    var authprotocol = trimAll($('#authprotocol').val());//No I18N
		    var authpwd = trimAll($('#authpwd').val()); //No I18N
		    var authpwdRe = trimAll($('#authpwdRe').val()); //No I18N
		    var privprotocol = trimAll($('#privprotocol').val()); //No I18N
		    var privpwd = trimAll($('#privpwd').val()); //No I18N
		    var v3Timeout = $('#v3Timeout').val(); //No I18N
		    var v3Ret = $('#v3Ret').val();//No I18N
			credeName = v3Name;
			credeType = "SNMP v3";//No I18N
			var setDefault = false;
			if((window.OPM.isNFA || (window.OPM.isOPM && window.OPM.isNfaPlug)) && document.getElementById("setSNMPV3CredentialDefault") !== null){
				var setDefault = document.getElementById("setSNMPV3CredentialDefault").checked; //No I18n
			}


			var url = window.OPM.apiUrlPattern + '/admin/addSNMPV3Credential'; //No I18n
			var data = {'credentialName':v3Name,'desc':v3Desc,'username':v3UserName,'contextname':v3ContextName,'port':v3Port,'authProtocol':authprotocol,'authPwd':authpwd,'privProtocol':privprotocol,'privPwd':privpwd,'timeout':v3Timeout,'retries':v3Ret,'update':update,'setDefault':setDefault}; //No I18N
			var fieldsToValidate = {'empty':['snmpName','v3UserName','v3Port','v3Timeout','v3Ret'],'port':['v3Port'],'timeout':['v3Timeout'],'retries':['v3Ret'],'matchPassword':{"authpwd":"authpwdRe","privpwd":"privpwdRe"},'rangeCheck':{'v3Port':65535,'v3Timeout':300,'v3Ret':10},'positive':['v3Port','v3Timeout']};//No I18N
			isValid = opm_validateFields(fieldsToValidate);
			var toFocus = [];
			if(isValid && !update){
				if (authprotocol !== 'None' && authpwd === ''){
			    	toFocus.push("authpwd");//No I18N
			    	$("#authpwd").addClass('error');
	                $("#authpwd").attr('data-error',Ember.I18n.t('webclient.admin.devicequery.authpasswordrequired',this));//No I18N
			    }
			    if (privprotocol !== 'None' && privpwd === ''){
			    	toFocus.push("privpwd");//No I18N
			    	$("#privpwd").addClass('error');
	                $("#privpwd").attr('data-error',Ember.I18n.t('webclient.discovery.enterprivpwd',this));//No I18N
			    }
			}
			if(toFocus.length > 0){
				isValid = false;
				$("#"+toFocus[0]).focus();
			}

			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({snmpArr:v3Name});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						if(OPMClient.SettingsConfigurationController.pageName === "Storage") {
							opstor_getCredentialList();
						}
						else {
							opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						}
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, credeName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",credeName,callBackFn);
					}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
					
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
		
	}
});

OPMClient.OpmAddTelnetCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-telnet-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var telnetEditObj = this.get('parentView.credDetails');
		$('#linPort,#linTimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('linPort');
		var timeOutId = document.getElementById('linTimeout');
		document.getElementById('advCredLinInfo').addEventListener('wheel', function(event) {
		if (event.target === portId || event.target === timeOutId) {
			event.preventDefault();
				return false;
			}
		});
		if(telnetEditObj) {
			this.set('operation','update'); //No I18n	
			$('#snmpDesc').val(telnetEditObj.desc);
			$('#linProtocol').val(telnetEditObj.protocol);
			$('#linUserName').val(telnetEditObj.userName);
			$('#linCmdPrompt').val(telnetEditObj.prompt);
			$('#linPort').val(telnetEditObj.portNumber);
			$('#linTimeout').val(telnetEditObj.cliTimeout);
			$('#linLoginPrompt').val(telnetEditObj.loginprompt !== "null" ? telnetEditObj.loginprompt : ":"); //No I18N
			$('#linPwdPrompt').val(telnetEditObj.passwordprompt !== "null" ? telnetEditObj.passwordprompt : ":"); //No I18N
			if(telnetEditObj.protocol === 'ssh') //sshkey only//No I18N
			{
				$('#sshkeyDisplay').show();
				if(telnetEditObj.fileName !== undefined) {
					$('#linSSHKey').prop("checked",true);
					$('#fileInput').text('sshkey.txt');//No I18N
					showKey(true);
					$('#fileInfo').show();
					$('#sshKey').hide();
					$('#sshkeyfile').val('');
				}
			}
			else
			{
				if(telnetEditObj.password !== undefined)
				{
					$('#linPwd').val(telnetEditObj.password);//No I18N
				}
				else
				{
					$('#linPwd').val('');//No I18N
				}
				$('#fileInfo').hide();
				$('#linSSHKey').prop("checked",false);
				if(telnetEditObj.protocol === 'telnet')
				{
					$('#sshkeyDisplay').hide();
				}
				showKey(false);
			}
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var update = self.get('operation') === "update" ? true : false; //No I18n
			var linName = trimAll($('#snmpName').val()); //No I18N
			var linProtocol = $('#linProtocol').val();//No I18N
			var linUserName = trimAll($('#linUserName').val());//No I18N
			var linPwd = trimAll($('#linPwd').val());//No I18N
			var linPwdRe = trimAll($('#linPwdRe').val());//No I18N
			var linCmdPrompt = trimAll($('#linCmdPrompt').val());//No I18N
			var linLoginPrompt = trimAll($('#linLoginPrompt').val());//No I18N
			var linPwdPrompt = trimAll($('#linPwdPrompt').val());//No I18N
			var linPort = trimAll($('#linPort').val());//No I18N
			var linTimeout = trimAll($('#linTimeout').val());//No I18N
			var credeName = linName;			
			update = (update === undefined) ? false:update; //fix for temporary
			var url = window.OPM.apiUrlPattern + '/admin/addLinuxCredential'; //No I18N
			var data = {'credentialName':linName,'username':linUserName,'cmdpmt':linCmdPrompt,'portno':linPort,'cliTimeout':linTimeout,'protocol':linProtocol,'update':update}; //No I18N			
			var success = false;
			var sshkey = false;
			var multiPost = false;
			if(linProtocol === "ssh"){
				sshkey = $('#linSSHKey').prop("checked");//No I18N
				if(sshkey)
				{
					multiPost = true;
					var frmData = new FormData();
					frmData.append('credentialName',linName); //No I18N
					frmData.append('username',linUserName); //No I18N
					frmData.append('cmdpmt',linCmdPrompt); //No I18N
					frmData.append('portno',linPort); //No I18N
					frmData.append('cliTimeout',linTimeout); //No I18N
					frmData.append('protocol',linProtocol); //No I18N
					frmData.append('update',update); //No I18N
					var curTimeMs = Date.now();
					var fileval = $('#sshkeyfile')[0].files[0];
					if(fileval!==undefined){
						frmData.append('sshkeyfile',fileval); //No I18N
					}
					frmData.append('fileId',curTimeMs); //No I18N
					url = url + '?sshkey='+sshkey; //No I18N			
				}else{
					data.logpmt = linLoginPrompt;
					data.pwpmt = linPwdPrompt;
					data.password = linPwd;
				}
			}else{
	            data.logpmt = linLoginPrompt;
	            data.pwpmt = linPwdPrompt;
	            data.password = linPwd;
			}
			var fieldsToValidate = {'empty':['snmpName','linPort','linTimeout','linUserName','linCmdPrompt','linPwd','linPwdRe','linPwdPrompt','linLoginPrompt'],'port':['linPort'],'timeout':['linTimeout'],'matchPassword':{'linPwd':'linPwdRe'},'checkPromptSpecialChars':['linCmdPrompt','linLoginPrompt','linPwdPrompt'],'rangeCheck':{'linPort':65535,'linTimeout':300},'positive':['linPort','linTimeout']};//No I18N
			if(sshkey){
				delete fieldsToValidate.matchPassword;
				fieldsToValidate.empty.splice(5,3);
				fieldsToValidate.checkPromptSpecialChars.splice(1,2);
				if(!update) {
					fieldsToValidate.ssh = ['sshkeyfile'];
				}
			}
			if(!sshkey && update){
				fieldsToValidate.empty.splice(5,2);
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				if(multiPost)
				{
					var response = opm_ajaxMultiPostRequest(url,frmData);
				}
				else
				{	
					var response = opm_ajaxPostRequest(url,data);
				}
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({cliArr:linName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						if(OPMClient.SettingsOpUtilConfigController.isCliQueryToolCrd){
							OPMClient.SettingsOpUtilConfigController.set("newToolsCrd",linName);//No I18N
						}
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, credeName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",credeName,callBackFn);
					}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
					
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
		
	}
});

OPMClient.OpmAddWmiCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-wmi-credential", //No I18N
	operation:'add', //No I18n
	isWinRMEnabled: false,
	didInsertElement: function(){
		var wmiEditObj = this.get('parentView.credDetails');
		if(wmiEditObj) {
			this.set('operation','update'); //No I18n	
			$('#snmpDesc').val(wmiEditObj.desc);
			$('#wmiUserName').val(wmiEditObj.userName);
			if(wmiEditObj.isWinRMEnabled) {
				this.setProperties({
					isWinRMEnabled: true,
					winrmProtocol: wmiEditObj.winrmProtocol || 'http', // No I18N
					winrmPort: wmiEditObj.winrmPort || '',
					winrmTimeout: wmiEditObj.winrmTimeout || ''
				});
			}
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var wmiName = trimAll($("#snmpName").val()); //No I18N
			var wmiDesc = trimAll($("#snmpDesc").val());//No I18N
			var wmiUserName = trimAll($("#wmiUserName").val());//No I18N
			var wmiPassword = trimAll($("#wmiPassword").val());//No I18N
			var wmiPasswordRe = trimAll($("#wmiPasswordRe").val());//No I18N
			var isWinRMEnabled = $('#isWinRMEnabled').prop('checked'); //No I18N
			var credeName = wmiName;
			var update = self.get('operation') === "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addWindowsCredential'; //No I18N
			var data = {'credentialName':wmiName,'description':wmiDesc,'username':wmiUserName,'password':wmiPassword,'update':update}; //No I18N
			var fieldsToValidate = {'empty':['snmpName','wmiUserName','wmiPassword'],'matchPassword':{'wmiPassword':'wmiPasswordRe'}};//No I18N
			if(isWinRMEnabled) {
				var winRMValues = getWinRMValues(self.element.id);
				if(!winRMValues) {
					return;
				}
				data.isWinRMEnabled = winRMValues.isWinRMEnabled;
				data.winrmProtocol = winRMValues.winrmProtocol;
				data.winrmPort = winRMValues.winrmPort;
				data.winrmTimeout = winRMValues.winrmTimeout;
			}
			if(update && wmiPassword === "")
			{
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({wmiArr:wmiName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						if(OPMClient.SettingsOpUtilConfigController.isWmiQueryToolCrd){
							OPMClient.SettingsOpUtilConfigController.set("newToolsCrd",wmiName);//No I18N
						}
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, credeName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",credeName,callBackFn);
					}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
					
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
		
	}
});

OPMClient.OpmAddVirtualDevCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-virtual-dev-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var viEditObj = this.get('parentView.credDetails');
		$('#vmPort,#vmTimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('vmPort');
		var timeOutId = document.getElementById('vmTimeout');
		document.getElementById('advCredVMInfo').addEventListener('wheel', function(event) {
		if (event.target === portId || event.target === timeOutId) {
			event.preventDefault();
				return false;
			}
		});

		if(viEditObj) {
			this.set('operation','update'); //No I18n
			$('#vmUserName').val(viEditObj.userName);
			$('#vmPort').val(viEditObj.port);			
			$('#vmTimeout').val(viEditObj.timeout);						
			$('#vmAutoDisc').prop('checked',viEditObj.vmdiscovery==="true"?true:false);	
			
		}
	},
	actions:{
		addCredential:function()
		{					
			var self = this;
			var callBackFunc = function() {
			var vmName = trimAll($('#snmpName').val());
			var vmUserName = trimAll($('#vmUserName').val()); //No I18N
			var vmPwd = trimAll($('#vmPwd').val());
			var vmPort = trimAll($("#vmPort").val());//No I18N
			var vmTimeout = trimAll($("#vmTimeout").val());//No I18N
			var vmAutoDisc = $("#vmAutoDisc").prop('checked');//No I18N
			var update = self.get('operation') === "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addVMWareCredential'; //No I18N
			var data = {'update':update,'credentialName':vmName,'autovmdiscovery':vmAutoDisc,'timeout':vmTimeout,'username':vmUserName,'password':vmPwd,'port':vmPort}; //No I18N
			var fieldsToValidate = {'empty':['snmpName','vmUserName','vmPwd','vmTimeout','vmPort'],'matchPassword':{'vmPwd':'vmPwdRe'},'port':['vmPort'],'timeout':['vmTimeout'],'rangeCheck':{'vmPort':65535,'vmTimeout':300},'positive':['vmPort','vmTimeout']};//No I18N
			if(update && vmPwd === "")
			{
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({vmArr:vmName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, vmName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",vmName,callBackFn);
					}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}					
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}		
	}
});

OPMClient.OpmAddCitrixDevCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-citrix-dev-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var citrixEditObj = this.get('parentView.credDetails');
		$('#citrixPort,#citrixTimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('citrixPort');
		var timeOutId = document.getElementById('citrixTimeout');
		document.getElementById('advCredCirixInfo').addEventListener('wheel', function(event) {
		if (event.target === portId || event.target === timeOutId) {
			event.preventDefault();
				return false;
			}
		});
		if(citrixEditObj) {
			this.set('operation','update'); //No I18n
			$('#citrixUserName').val(citrixEditObj.userName);
			$('#citrixPort').val(citrixEditObj.port);			
			$('#citrixTimeout').val(citrixEditObj.timeout);						
			$('#vmAutoDisc').prop('checked',citrixEditObj.vmdiscovery==="true"?true:false);			
		}
	},
	actions:{
		addCredential:function()
		{					
			var self = this;
			var callBackFunc = function() {
			var citrixName = trimAll($('#snmpName').val());
			var citrixUserName = trimAll($('#citrixUserName').val()); //No I18N
			var citrixPwd = trimAll($('#citrixPwd').val());
			var citrixPort = trimAll($("#citrixPort").val());//No I18N
			var citrixTimeout = trimAll($("#citrixTimeout").val());//No I18N
			var vmAutoDisc = $("#vmAutoDisc").prop('checked');//No I18N
			var update = self.get('operation') === "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addCitrixCredential'; //No I18N
			var data = {'update':update,'credentialName':citrixName,'autovmdiscovery':vmAutoDisc,'timeout':citrixTimeout,'username':citrixUserName,'password':citrixPwd,'port':citrixPort}; //No I18N
			var fieldsToValidate = {'empty':['snmpName','citrixUserName','citrixPwd','citrixTimeout','citrixPort'],'matchPassword':{'citrixPwd':'citrixPwdRe'},'rangeCheck':{'citrixPort': 65535,'citrixTimeout': 300}, 'positive':['citrixTimeout','citrixPort']};//No I18N
			if(update && citrixPwd === "")
			{
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({xenArr:citrixName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, citrixName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",citrixName,callBackFn);
					}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}					
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}		
	}
});

OPMClient.OpmAddUcsCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-ucs-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var ucsEditObj = this.get('parentView.credDetails');
		$('#ucsPort,#ucsTimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('ucsPort');
		var timeOutId = document.getElementById('ucsTimeout');
		document.getElementById('advCredUcsInfo').addEventListener('wheel', function(event) {
		if (event.target === portId || event.target === timeOutId) {
			event.preventDefault();
				return false;
			}
		});
		if(ucsEditObj) {
			this.set('operation','update'); //No I18n
			$('#ucsUserName').val(ucsEditObj.userName);
			$('#ucsPort').val(ucsEditObj.portNumber);			
			$('#ucsTimeout').val(ucsEditObj.timeOut);						
			$('#ucsProtocol').val(ucsEditObj.protocol);			
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{					
			var self = this;
			var callBackFunc = function() {
			var ucsName = trimAll($('#snmpName').val());
			var ucsUserName = trimAll($('#ucsUserName').val()); //No I18N
			var ucsPwd = trimAll($('#ucsPwd').val());
			var ucsPort = trimAll($("#ucsPort").val());//No I18N
			var ucsTimeout = trimAll($("#ucsTimeout").val());//No I18N
			var ucsProtocol = $("#ucsProtocol").val();//No I18N
			var update = self.get('operation') === "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addUCSCredential'; //No I18N
			var data = {'update':update,'credentialName':ucsName,'protocol':ucsProtocol,'timeout':ucsTimeout,'username':ucsUserName,'password':ucsPwd,'port':ucsPort}; //No I18N
			var fieldsToValidate = {'empty':['snmpName','ucsUserName','ucsPwd','ucsTimeout','ucsPort'],'matchPassword':{'ucsPwd':'ucsPwdRe'}, 'port':['ucsPort'], 'timeout':['ucsTimeout'],'rangeCheck':{'ucsPort': 65535,'ucsTimeout': 300}, 'positive':['ucsPort','ucsTimeout']};//No I18N
			if(update && ucsPwd === "")
			{
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, ucsName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",ucsName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

//OPMClient.OpmAddRESTAPICredentialComponent;
OPMClient.OpmAddIPMICredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-restapi-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var restAPIEditObj = this.get('parentView.credDetails');
		var self = this;
		$('#restAPIPort,#restAPITimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		self.set('sslEnabled',true);//No I18N
		self.set('formData',{restAPIUserName:'',restAPIDesc:'',restAPIPwd:'',restAPIPwdRe:'',restAPIDesc:'',restAPITimeout:'10',restAPIPort:'443'});//No I18N
		if(restAPIEditObj) {
			self.set('operation','update'); //No I18n
			self.set('formData',{restAPIUserName:restAPIEditObj.userName,restAPIDesc:restAPIEditObj.desc ? restAPIEditObj.desc : '',restAPIPwd:'',restAPIPwdRe:'',restAPITimeout:restAPIEditObj.timeOut,restAPIPort:restAPIEditObj.portNumber});//No I18N
			if(restAPIEditObj.protocol == 'https'){
				self.set('sslEnabled',true);//No I18N
			}else{
				self.set('sslDisabled',true);//No I18N
			}
						
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{					
			var self = this;
			var callBackFunc = function() {
			var formData = self.get('formData');
			var update = self.get('operation') == "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addRESTAPICredential'; //No I18N
			var ipmiName = trimAll($('#snmpName').val());//No I18N
			var data = {credentialName:ipmiName,
					desc:trimAll(formData.restAPIDesc),
					userName:trimAll(formData.restAPIUserName),
					password:trimAll(formData.restAPIPwd),
					timeout:formData.restAPITimeout,
					port:formData.restAPIPort,
					update:update,
					model:'IPMI',//No I18N
					authType:'RESTAPIUserAuth',//No I18N
					protocol:$('input:radio[name="ssl"]:checked').val() == 'enabled' ? 'https' : 'http'};//No I18N
			fieldsToValidate = {'empty':['snmpName','restAPIUserName','restAPIPwd','restAPIPort','restAPITimeout'],'port':['restAPIPort'],'timeout':['restAPITimeout'],'matchPassword':{'restAPIPwd':'restAPIPwdRe'},'rangeCheck':{'restAPIPort': 65535,'restAPITimeout': 300}, 'positive':['restAPIPort','restAPITimeout']};//No I18N
			if(update && formData.restAPIPwd == ""){
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({ipmiArr:ipmiName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, ipmiName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",ipmiName,callBackFn);
					}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		},
		setSSLDefaultPort:function(isSSLEnabled){
			this.set('formData.restAPIPort',isSSLEnabled ? '443' : '80');//No I18N
		}
	}
});

OPMClient.OpmAddNutanixCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-nutanix-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var nutanixEditObj = this.get('parentView.credDetails');
		$('#vmPort,#nutanixTimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		if(nutanixEditObj) {
			this.set('operation','update'); //No I18n
			if(nutanixEditObj.password !== undefined)
			{
				$('#vmPwd').val(nutanixEditObj.password);//No I18N
			}
			$("#nutanixdescription").val(nutanixEditObj.desc);
			$('#vmUserName').val(nutanixEditObj.userName); //No I18N
			$('#vmPort').val(nutanixEditObj.port);//No I18N
			$('#vmTimeout').val(nutanixEditObj.timeout);//No I18N
			$('#nutanixProtocol').val(nutanixEditObj.protocol);//No I18N
			$('#nutanixPort').val(nutanixEditObj.port);//No I18N
			$('#nutanixTimeout').val(nutanixEditObj.timeout);//No I18N
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{	
			var self = this;
			var callBackFunc = function() {
			var nutanixName = trimAll($('#snmpName').val());	
			var vmUserName = trimAll($('#vmUserName').val());//No I18N
			var vmPwd = trimAll($('#vmPwd').val()); //No I18N
			var nutanixPort = trimAll($('#nutanixPort').val());//No I18N
			var nutanixTimeout =  trimAll($('#nutanixTimeout').val());//No I18N
			var nutanixProtocol =$('#nutanixProtocol').val();//No I18N
			var nutanixDesc =$('#nutanixdescription').val();//No I18N	
			var update = self.get('operation') === "update" ? true : false; //No I18n		
			var data = {'update':update,'timeout':nutanixTimeout,'password':vmPwd,'username':vmUserName,'credentialName':nutanixName,'port':nutanixPort,'desc':nutanixDesc};//No I18N			
			url = window.OPM.apiUrlPattern + '/admin/addNutanixCredential'; //No I18N
			fieldsToValidate = {'empty':['snmpName','vmUserName','vmPwd','vmPwdRe','nutanixPort','nutanixTimeout'],'port':['nutanixPort'],'timeout':['nutanixTimeout'],'matchPassword':{"vmPwd":"vmPwdRe"},'protocol':nutanixProtocol,'rangeCheck':{'nutanixPort': 65535,'nutanixTimeout': 300}, 'positive':['nutanixPort','nutanixTimeout']};//No I18N
			data.timeout=nutanixTimeout;
			data.port=nutanixPort;
			data.protocol=nutanixProtocol;
			if(update && vmPwd === "")
			{
				delete fieldsToValidate.empty.splice(2,2);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, nutanixName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",nutanixName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddCliCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-cli-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var sancliEditObj = this.get('parentView.credDetails');
		$('#sanclitimeoutField').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		if(sancliEditObj) {
			this.set('operation','update'); //No I18n
			$('#sancliusernameField').val(sancliEditObj.userName);
			$('#sanclipromptField').val(sancliEditObj.prompt);			
			$('#sanclitimeoutField').val(sancliEditObj.timeOut);						
			$('#sanclidescriptionField').val(sancliEditObj.desc);			
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var sancliName = trimAll($('#snmpName').val());
			var sancliusernameField = trimAll($('#sancliusernameField').val()); //No I18N
			var sanclipasswordField = trimAll($('#sanclipasswordField').val());
			var sanclipromptField = trimAll($("#sanclipromptField").val());//No I18N
			var sanclitimeoutField = trimAll($("#sanclitimeoutField").val());//No I18N
			var sanclidescriptionField = $("#sanclidescriptionField").val();//No I18N
			var update = self.get('operation') === "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/storage/addOpStorCLICredentials'; //No I18N
			var data = {'update':update,'credentialName':sancliName,'description':sanclidescriptionField,'timeout':sanclitimeoutField,'userName':sancliusernameField,'password':sanclipasswordField,'prompt':sanclipromptField}; //No I18N
			var fieldsToValidate = {'empty':['snmpName','sancliusernameField','sanclipasswordField','sanclitimeoutField','sanclipromptField'],'timeout':['sanclitimeoutField']};//No I18N
			if(update && sanclipasswordField === "")
			{
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opstor_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, sancliName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",sancliName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddSmiCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-smi-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var sansmiEditObj = this.get('parentView.credDetails');
		$('#sansmiportField,#sansmitimeoutField').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		if(sansmiEditObj) {
			this.set('operation','update'); //No I18n
			$("#sansmicrednameField").val(sansmiEditObj.credentialName); //No I18N
			$("#sansmicrednameField").prop("disabled",true); //No I18N
			$("#sansmidescriptionField").val(sansmiEditObj.desc); //No I18N
			var smiServerIPArr = sansmiEditObj.smiServerIP.split(".");
			for(var i=1;i<=smiServerIPArr.length;i++) {
				$("#smiServerIP"+i).val(smiServerIPArr[i-1]);
			}
			$("#sansmiusernameField").val(sansmiEditObj.userName); //No I18N
			$("#sansmiportField").val(sansmiEditObj.portNumber); //No I18N
			if(sansmiEditObj.ssl === "Enabled") {
				$("input[name=sansmisslField][value=Enabled]").prop("checked",true); //No I18N
			} else {
				$("input[name=sansmisslField][value=Disabled]").prop("checked",true); //No I18N
			}
			$("#sansminamespaceField").val(sansmiEditObj.nameSpace); //No I18N
			$("#sansmitimeoutField").val(sansmiEditObj.timeOut); //No I18N		
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var update = self.get('operation') === 'update'? true : false; //No I18N
			var smiName = trimAll($("#snmpName").val()); //No I18N
			var smiDescription = trimAll($("#sansmidescriptionField").val()); //No I18N
			var smiUser = trimAll($("#sansmiusernameField").val());//No I18N
			var smiPassword = trimAll($("#sansmipasswordField").val());//No I18N
			var smiPort = trimAll($("#sansmiportField").val());//No I18N			
			var count = 0;
			var firstElement = "";//No I18N
			for(var i=1;i<=4;i++){
				if(trimAll($('#smiServerIP'+i).val()) === undefined || trimAll($('#smiServerIP'+i).val()) === null || trimAll($('#smiServerIP'+i).val()) === "" || trimAll($('#smiServerIP'+i).val()) > 255){//No I18N
					if(count === 0){ firstElement = "#smiServerIP"+i; }//No I18N 
					$("#smiServerIP"+i).addClass('validateField error');//No I18N
					$("#smiServerIP"+i).attr('data-error',Ember.I18n.t('webclient.discovery.validip',this));
					count++;
				}
			}
			$('.validateField').on('focusin',function(){
				opmValidate($(self));
			});
			$('.validateField').on('focusout',function(){
				$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			});
			$(firstElement).focus();
			if(count > 0){
				return false;    
			}
			var smiServerIP = $('#smiServerIP1').val()+"."+$('#smiServerIP2').val()+"."+$('#smiServerIP3').val()+"."+$('#smiServerIP4').val();//No I18N
			var smiSSL = $("input[name=sansmisslField]:checked").val();
			var smiNamespace = trimAll($("#sansminamespaceField").val());//No I18N
			var smiTimeout = trimAll($("#sansmitimeoutField").val());//No I18N
			url = window.OPM.apiUrlPattern + '/storage/addOpStorSMICredentials'; //No I18n
			data = {'update':update,'credentialName':smiName,'description':smiDescription,'smiServerIP':smiServerIP,'userName':smiUser,'password':smiPassword,'port':smiPort,'ssl':smiSSL,'namespace':smiNamespace,'timeout':smiTimeout}; //No I18N
			fieldsToValidate = {'empty':['snmpName','sansmiusernameField','sansmiportField','sansminamespaceField','sansmitimeoutField'],'alphaNumeric':['snmpName'],'timeout':['sansmitimeoutField'],'port':['sansmiportField']};//No I18N
			if(!update) {
				fieldsToValidate.empty.push('sansmipasswordField');//No I18N
			}			
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opstor_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, smiName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",smiName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddNetAppCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-net-app-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var sanNetappEditObj = this.get('parentView.credDetails');
		$('#sannetappapiportField,#sannetappapitimeoutField').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		if(sanNetappEditObj) {
			this.set('operation','update'); //No I18n
			$("#sannetappapicrednameField").val(sanNetappEditObj.credentialName); //No I18N
			$("#sannetappapicrednameField").prop("disabled",true); //No I18N
			$("#sannetappapidescriptionField").val(sanNetappEditObj.desc); //No I18N
			$("#sannetappapiusernameField").val(sanNetappEditObj.userName); //No I18N
			$("#sannetappapiportField").val(sanNetappEditObj.portNumber); //No I18N
			$("#sannetappapitimeoutField").val(sanNetappEditObj.timeOut); //No I18N
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var update = self.get('operation') === 'update'? true : false; //No I18N
			var apiName = trimAll($("#snmpName").val()); //No I18N
			var apiDescription = trimAll($("#sannetappapidescriptionField").val()); //No I18N
			var apiUser = trimAll($("#sannetappapiusernameField").val());//No I18N
			var apiPassword = trimAll($("#sannetappapipasswordField").val());//No I18N
			var apiPort = trimAll($("#sannetappapiportField").val());//No I18N
			var apiTimeout = trimAll($("#sannetappapitimeoutField").val());//No I18N
			url = window.OPM.apiUrlPattern + '/storage/addOpStorNetAppAPICredentials'; //No I18n
			data = {'update':update,'credentialName':apiName,'description':apiDescription,'userName':apiUser,'password':apiPassword,'port':apiPort,'timeout':apiTimeout}; //No I18N
			fieldsToValidate = {'empty':['snmpName','sannetappapiusernameField','sannetappapiportField','sannetappapitimeoutField'],'alphaNumeric':['snmpName'],'timeout':['sannetappapitimeoutField'],'port':['sannetappapiportField']};//No I18N
			if(!update) {
				fieldsToValidate.empty.push('sannetappapipasswordField');//No I18N
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opstor_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, apiName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",apiName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddStorageApiCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-storage-api-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var sanStorageApiEditObj = this.get('parentView.credDetails');
		$('#sanstorageapiportField,#sanstorageapitimeoutField').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		if(sanStorageApiEditObj) {
			this.set('operation','update'); //No I18n
			$("#sanstorageapicrednameField").prop("disabled",true); //No I18N
			$("#sanstorageapidescriptionField").val(sanStorageApiEditObj.desc); //No I18N
			$("#sanstorageapiusernameField").val(sanStorageApiEditObj.userName); //No I18N
			$("#sanstorageapiportField").val(sanStorageApiEditObj.portNumber); //No I18N
			$("#sanstorageapitimeoutField").val(sanStorageApiEditObj.timeOut); //No I18N
			if(sanStorageApiEditObj.ssl.toLowerCase() === "enabled") {
				$("input[name=sanapisslField][value=Enabled]").prop("checked",true); //No I18N
			} else {
				$("input[name=sanapisslField][value=Disabled]").prop("checked",true); //No I18N
			}
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var update = self.get('operation') === 'update'? true : false; //No I18N
			var apiName = trimAll($("#snmpName").val()); //No I18N
			var apiDescription = trimAll($("#sanstorageapidescriptionField").val()); //No I18N
			var apiUser = trimAll($("#sanstorageapiusernameField").val());//No I18N
			var apiPassword = trimAll($("#sanstorageapipasswordField").val());//No I18N
			var apiPort = trimAll($("#sanstorageapiportField").val());//No I18N
			var apiTimeout = trimAll($("#sanstorageapitimeoutField").val());//No I18N
			var apiSSL = $("input[name=sanapisslField]:checked").val();
			url = window.OPM.apiUrlPattern + '/storage/addOpStorStorageAPICredentials'; //No I18n
			data = {'update':update,'credentialName':apiName,'description':apiDescription,'userName':apiUser,'password':apiPassword,'port':apiPort,'timeout':apiTimeout,'ssl':apiSSL}; //No I18N
			fieldsToValidate = {'empty':['snmpName','sanstorageapiusernameField','sanstorageapiportField','sanstorageapitimeoutField'],'timeout':['sanstorageapitimeoutField'],'port':['sanstorageapiportField']};//No I18N
			if(!update) {
				fieldsToValidate.empty.push('sanstorageapipasswordField');//No I18N
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opstor_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, apiName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",apiName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddStorageTokenCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-storage-token-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		$('#sanstoragetokenportField,#sanstoragetokentimeoutField').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		var sanStorageTokenEditObj = this.get('parentView.credDetails');
		if(sanStorageTokenEditObj) {
			this.set('operation','update'); //No I18n
			$("#sanstoragetokencrednameField").prop("disabled",true); //No I18N
			$("#sanstoragetokendescriptionField").val(sanStorageTokenEditObj.desc); //No I18N
			$("#sanstoragetokenportField").val(sanStorageTokenEditObj.portNumber); //No I18N
			$("#sanstoragetokentimeoutField").val(sanStorageTokenEditObj.timeOut); //No I18N
			if(sanStorageTokenEditObj.ssl.toLowerCase() === "enabled") {
				$("input[name=santokensslField][value=Enabled]").prop("checked",true); //No I18N
			} else {
				$("input[name=santokensslField][value=Disabled]").prop("checked",true); //No I18N
			}
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{
			var self = this;
			var callBackFunc = function() {
			var update = self.get('operation') === 'update'? true : false; //No I18N
			var apiName = trimAll($("#snmpName").val()); //No I18N
			var apiDescription = trimAll($("#sanstoragetokendescriptionField").val()); //No I18N
			var apiToken = trimAll($("#sanstoragetokenpasswordField").val());//No I18N
			var apiPort = trimAll($("#sanstoragetokenportField").val());//No I18N
			var apiTimeout = trimAll($("#sanstoragetokentimeoutField").val());//No I18N
			var apiSSL = $("input[name=santokensslField]:checked").val();
			url = window.OPM.apiUrlPattern + '/storage/addOpStorStorageTokenCredentials'; //No I18n
			data = {'update':update,'credentialName':apiName,'description':apiDescription,'apiToken':apiToken,'port':apiPort,'timeout':apiTimeout,'ssl':apiSSL}; //No I18N
			fieldsToValidate = {'empty':['snmpName','sanstoragetokenportField','sanstoragetokentimeoutField'],'timeout':['sanstoragetokentimeoutField'],'port':['sanstoragetokenportField']};//No I18N
			if(!update) {
				fieldsToValidate.empty.push('sanstoragetokenpasswordField');//No I18N
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opstor_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, apiName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",apiName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddACICredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-ACI-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var ciscoACIEditObj = this.get('parentView.credDetails'); //No I18n
		var self = this;
		$('#ciscoACIPort,#ciscoACITimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('ciscoACIPort');
		var timeOutId = document.getElementById('ciscoACITimeout');
		document.getElementById('advCredAciInfo').addEventListener('wheel', function(event) {
		if (event.target === portId || event.target === timeOutId) {
			event.preventDefault();
				return false;
			}
		});
		if(ciscoACIEditObj) {
			this.set('operation','update'); //No I18n
			$('#ciscoACIUserName').val(ciscoACIEditObj.userName);
			$('#ciscoACIPort').val(ciscoACIEditObj.portNumber);	
			$("#ciscoACIDesc").val(ciscoACIEditObj.desc);		
			$('#ciscoACITimeout').val(ciscoACIEditObj.timeOut);						
			$('#ciscoACIProtocol').val(ciscoACIEditObj.protocol).select2();			
		}
		$('#'+this.elementId+' .select2').select2();
	},
	actions:{
		addCredential:function()
		{	
			var self = this;
			var callBackFunc = function() {
			var formData = self.get('formData');
			var update = self.get('operation') == "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addRESTAPICredential'; //No I18N
			var aciName = trimAll($('#snmpName').val());//No I18N
			var data = {
				credentialName:aciName,
				desc:trimAll($("#ciscoACIDesc").val()),
				userName:trimAll($("#ciscoACIUserName").val()),
				password:trimAll($("#ciscoACIPwd").val()),
				model:"ACI", //No I18n
				timeout:trimAll($("#ciscoACITimeout").val()),
				port:trimAll($("#ciscoACIPort").val()),
				update:update,
				protocol:$("#ciscoACIProtocol").val(),
				authType:"RESTAPIUserAuth" //No I18n
			};//No I18N
			fieldsToValidate = {'empty':['snmpName','ciscoACIUserName','ciscoACIPwd','ciscoACIPort','ciscoACITimeout'],'port':['ciscoACIPort'],'timeout':['ciscoACITimeout'],'matchPassword':{'ciscoACIPwd':'ciscoACIPwdRe'},'rangeCheck':{'ciscoACIPort': 65535,'ciscoACITimeout': 300}, 'positive':['ciscoACIPort','ciscoACITimeout']};//No I18N
			if(update && $("#ciscoACIPwd").val() == ""){
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({ACIArr:aciName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, aciName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",aciName,callBackFn);
						}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		}
	}
});

OPMClient.OpmAddRestapiFrmkCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-restapi-fmwk-credential", //No I18N
	operation:'add', //No I18n
	restapiCredentialType: 'RESTAPIBasicAuthorization', //No I18n
	authTypes: [
		{name: Ember.I18n.t('webclient.settings.credential.basicauth'), value: 'RESTAPIBasicAuthorization'}, //No I18n
		{name: Ember.I18n.t('webclient.api.ui.apikey'), value: 'RESTAPIkeyAuthorization'} //No I18n
	],
	didInsertElement: function(){
		var restAPIEditObj = this.get('parentView.credDetails');
		var self = this;
		self.set('sslEnabled',true);//No I18N
		var data = {restAPIDesc:'',restAPITimeout:'',restAPIPort:''};
		var basicAuthData = {
			restAPIUserName: '',
			restAPIPwd: '',
			restAPIPwdRe: ''
		}
		var apiKeyData = {
			restApiKey: '',
			restApiValue: ''
		}
		Object.assign(data, basicAuthData, apiKeyData);
		self.set('formData', data);//No I18N
		if(restAPIEditObj) {
			this.set("isEditCred", true); //No I18n
			$("#restApiAuthSelector").val(restAPIEditObj.authType);
			this.set("restapiCredentialType", restAPIEditObj.authType); //No I18n
			self.set('operation','update'); //No I18n
			self.set('formData',{ //No I18n
				restAPIUserName:restAPIEditObj.userName,
				restAPIDesc:restAPIEditObj.desc ? restAPIEditObj.desc : '',
				restAPIPwd:'',
				restAPIPwdRe:'',
				restAPITimeout:restAPIEditObj.timeOut,
				restAPIPort: restAPIEditObj.portNumber,
				restApiKey: restAPIEditObj.apiKey
			});
			if(restAPIEditObj.protocol == 'https'){
				self.set('sslEnabled',true);//No I18N
			}else{
				self.set('sslDisabled',true);//No I18N
			}
		}
		$("#restApiAuthSelector").select2();
	},
	actions:{
		addCredential:function() {	
			var self = this;
			var callBackFunc = function() {
			var formData = self.get('formData');
			var restAPIEditObj = self.get('parentView.credDetails');
			var authType = self.get("restapiCredentialType"); //No I18n
			var update = self.get('operation') == "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addRESTAPICredential'; //No I18N
			var data = {
				model: authType,
				credentialName:trimAll($('#snmpName').val()),
				desc:trimAll(formData.restAPIDesc),
				timeout:formData.restAPITimeout,
				port:formData.restAPIPort,
				update:update,
				authType: authType,
				protocol:$('input:radio[name="ssl"]:checked').val() == 'enabled' ? 'https' : 'http'//No I18N
			};
			var fieldsToValidate = {'empty':['snmpName','restAPIPort','restAPITimeout'],'port':['restAPIPort'],'timeout':['restAPITimeout']};//No I18N
			if(update && formData.restAPIPwd == ""){
				delete fieldsToValidate.empty.splice(2,1);
				delete data.password;
			}
			if(authType === "RESTAPIBasicAuthorization") {
				fieldsToValidate.empty.push("restAPIUserName");
				if(!update || formData.restAPIPwd != ""){
					fieldsToValidate.empty.push("restAPIPwd")
				}
				fieldsToValidate.matchPassword = {'restAPIPwd':'restAPIPwdRe'};//No I18N
				data.userName = trimAll(formData.restAPIUserName);
				if(formData.restAPIPwd) {
					data.password = trimAll(formData.restAPIPwd);
				}
			} else if(authType === "RESTAPIkeyAuthorization") {//No I18N
				fieldsToValidate.empty.push("restAPIFrmwkKey");
				if(!update || formData.restApiKey != restAPIEditObj.apiKey){
					fieldsToValidate.empty.push("restAPIFrmwkValue");
				}
				data.restApiKey = formData.restApiKey;
				data.restApiValue = formData.restApiValue
			}
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid) {
				var response = opm_ajaxPostRequest(url,data);
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						if(self.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({restApiArr:data.credentialName});
						}else{
						opm_infoMsgs("successMsg",response.result.message);//No I18N
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("CREDENTIALS",true, data.credentialName,update);//No I18N
						}
						initProbeAssociation("CREDENTIALS","CREDENTIALS",data.credentialName,callBackFn);
						}
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc,"CREDENTIALS"); //No I18N
		},
		toggleRestApiAuthType: function() {
			this.set("restapiCredentialType", $("#restApiAuthSelector").val()); //No I18n
		}
	}
});

OPMClient.OpmWinrmConfigComponent = Ember.Component.extend({
	templateName: "components/opm-winrm-config", //No I18N
	isWinRMEnabled: false,
	protocols: [{label:'http', value:'http'}, {label:'https', value:'https'}], // No I18N
	winrmProtocol: 'http', //No I18N
	winrmPort: '', //No I18N
	winrmTimeout: '', //No I18N
	winrmIsEditMode:true,
	showWinRmInfoMsg: true,
	didInsertElement: function(){
		$('#'+this.elementId+' .select2').select2();
		Ember.run.scheduleOnce('afterRender', this, function() { // No I18N
			$('#'+this.elementId+' .select2').trigger("change"); // No I18N
			if(!this.winrmPort) {
				this.set('winrmIsEditMode', false); //No I18n
			}
		});
	},
	winrmProtocolObserver: function() {
		if(!this.winrmIsEditMode || this.winrmPort == "") { //No I18N
			// If once it passes the above condition, then set winrmIsEditMode to false so that further changes to protocol will not override the port value set by user.
			this.set('winrmIsEditMode', false); //No I18n
			if(this.winrmProtocol === 'https' && (this.winrmPort == 5985 || !this.winrmPort)) { //No I18N
				this.set('winrmPort', 5986);  //No I18N
			} else if(this.winrmPort == 5986 || !this.winrmPort) {
				this.set('winrmPort', 5985);  //No I18N
			}
		}
		if(!this.winrmTimeout) {
			this.set('winrmTimeout', 20);  //No I18N
		}

		if(OPMClient.ApplicationController.currentRouteName === "Workflows.InfoTabs") {
			$("#winrmConfigProcessWkfw #winrmPort").val(this.winrmPort); //No I18N
			$("#winrmConfigProcessWkfw #winrmTimeout").val(this.winrmTimeout); //No I18N
		}
	}.observes('winrmProtocol'),  //No I18N
	isWinRMEnabledObserver: function() {
		if(this.isWinRMEnabled) {
			if(!this.winrmProtocol) {
				this.set('winrmIsEditMode', false); //No I18n
				this.set('winrmProtocol', 'http'); //No I18N
			}

			Ember.run.scheduleOnce('afterRender', this, function() { // No I18N
				if(OPMClient.ApplicationController.currentRouteName === "Workflows.InfoTabs") {
					$("#winrmConfigProcessWkfw #winrmPort").val(5985); //No I18N
					$("#winrmConfigProcessWkfw #winrmTimeout").val(20); //No I18N
				}
			});
		}
	}.observes('isWinRMEnabled') //No I18N
});

OPMClient.OpmAddGcpCredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-gcp-credential", //No I18N
	didInsertElement: function () {
		var gcpEditObj = this.get('parentView.credDetails'); //No I18N
		if (gcpEditObj) {
			$("#gcpdescription").val(gcpEditObj.desc); //No I18N
		}
	},
	actions: {
		addCredential: function () {
			var self = this;
			var callBackFunc = function () {
				var isEdit         = Ember.get(OPMClient.SettingsTabController, "isEditCredObj"); //No I18N
				var credentialName = trimAll($("#snmpName").val()); //No I18N
				var gcpDesc        = trimAll($("#gcpdescription").val()); //No I18N
				var serviceAccountJson = trimAll($("#gcpServiceAccountJson").val()); //No I18N

				// credentialName is always required
				var fieldsToValidate = { 'empty': ['snmpName'] }; //No I18N
				// On add, JSON must be provided; on update it is optional (keep existing)
				if (!isEdit) {
					fieldsToValidate.empty.push('gcpServiceAccountJson'); //No I18N
				}
				var isValid = opm_validateFields(fieldsToValidate);
				if (!isValid) {
					return;
				}

				var data = {
					credentialName: credentialName,
					update: isEdit ? "true" : "false", //No I18N
					desc: gcpDesc
				};
				if (serviceAccountJson) {
					data.credentialJson = serviceAccountJson;
				}
				var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/addGcpCredential", data); //No I18N
				if (response !== undefined && !$.isEmptyObject(response)) {
					if (response.result !== undefined) {
						opm_infoMsgs("successMsg", response.result.message); //No I18N
						if (OPMClient.InventoryOpUtilsController.getBacktoDNSSnapshotPage) {
							OPMClient.InventoryOpUtilsController.set("GCPCredentialAdded", credentialName); //No I18N
						}
						else if (OPMClient.InventoryOpUtilsController.getBacktoAssociateDNSPage) {
							OPMClient.InventoryOpUtilsController.set("GCPCredentialAdded", credentialName); //No I18N
						}
						closeCredentialSlide();
						if (OPMClient.InventoryOpUtilsController.getBacktoDNSSnapshotPage) {
							backToAddDNS();
							return;
						}
						if (OPMClient.InventoryOpUtilsController.getBacktoAssociateDNSPage) {
							backToAddDNS('AssociateDNS'); //No I18N
							return;
						}
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
					}
					else if (response.error !== undefined) {
						opm_infoMsgs("errorMsg", response.error.message); //No I18N
					}
				}
			};
			checkIsCentralizedConfigConfigurationsProbeModified(callBackFunc, "CREDENTIALS"); //No I18N
		}
	}
});

function openCredentialSlide(isEditObj) {	
	if(isEditObj) {
		OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.editcredential',this));//No I18N	
	}
	else {
		OPMClient.SettingsTabController.set('addCredHeader',Ember.I18n.t('webclient.discovery.addcredential',this));//No I18N
	}
	Ember.set(OPMClient.SettingsTabController,"isEditCredObj",isEditObj);//No I18N
	setCredentialsList();
	Ember.set(OPMClient.SettingsTabController,"isCredNeeded",true);//No I18N
	slideIn(11);
}

function closeCredentialSlide()
{
	Ember.set(OPMClient.SettingsTabController,"isCredNeeded",false);//No I18N
	Ember.set(OPMClient.SettingsTabController,"isEditCredObj",null);//No I18N
	slideOut(11);
	if(OPMClient.InventoryDeviceDetailsController.showUnknownCredentialPage){
		redirectSnapShot();
	}
	if(OPMClient.SettingsOpUtilConfigController.isCliQueryToolCrd){
		OPMClient.SettingsOpUtilConfigController.set("isCliQueryToolCrd",false); //No I18n
		opm_transitionToParentRoute('Settings.Tools.CliQueryTool');//No I18N
	}
	else if(OPMClient.SettingsOpUtilConfigController.isWmiQueryToolCrd){
		OPMClient.SettingsOpUtilConfigController.set("isWmiQueryToolCrd",false); //No I18n
		opm_transitionToParentRoute('Settings.Tools.WmiQueryTool');//No I18N
	}
}

function setCredentialsList() {
	var showCredList = ["snmpv1","snmpv3","restapi-frmwk"] // No I18n
	if(window.OPM.isOPM && window.OPM.isOpmPlug && !window.OPM.isOPMLiteEdition) {
		showCredList = ["snmpv1","snmpv3","telnet"]; //No I18n
		if(!window.OPM.isOPMStandardEdition) {
			showCredList = ["snmpv1","snmpv3","telnet","virtualDev","citrixDev","ucs","nutanix","restapi","ACI","telemetry","restapi-frmwk"]; //No I18n
		}
		if(window.OPM.isWindows || window.OPM.isCentralServer) {
			showCredList.splice(2,0,"wmi"); //No I18n
		}
		if(!window.OPM.isCentralServer && $.inArray("gcp", showCredList) === -1) {
			showCredList.push("gcp"); //No I18N
		}
		if(OPMClient.SettingsConfigurationController.pageName === "Storage") {
			showCredList = ["snmpv1","snmpv3","cli","smi","netapp","storageApi","storageToken"] // No I18n
		}
	}
	OPMClient.SettingsCredentialController.set('showCredList',showCredList);//No I18N	
}


OPMClient.OpmAddgNMICredentialComponent = Ember.Component.extend({
	templateName: "components/opm-add-gnmi-dev-credential", //No I18N
	operation:'add', //No I18n
	didInsertElement: function(){
		var self=this;
		var telemetryEditObj = this.get('parentView.credDetails');
		$('#telemetryPort,#telemRetry,#telemTimeout').keydown(function(e) {
			if (!opm_isNumber(e)) {
			  e.preventDefault();
			}
		});
		//To prevent incresing digits for numeric field during scroll
		var portId = document.getElementById('telemetryPort');
		document.getElementById('telemetryPort').addEventListener('wheel', function(event) {
		if (event.target === portId) {
			event.preventDefault();
				return false;
			}
		});
		var teleMetryHeaders=[];
		var obj = Ember.Object.create({
			id: 0,
			value: '',
			showplusIcon: true,
			showDeleteIcon:false
		  });
		this.set("controller.teleMetryHeaderCount", 0);//NO I18N
		teleMetryHeaders.pushObject(obj);
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+ '/admin/ismTLSExternalCAAvailable'); //No I18n
		this.set('controller.isExternalCAAvailable',response.isExternalCAAvailable); //No I18n
		this.set('controller.teleMetryHeaders',teleMetryHeaders); //NO I18N
		$('.telemetryCredInputs').hide();$('.teleInputtls').show();
		if(telemetryEditObj) {
			$('.telemetryCredInputs').hide();
			this.set('operation','update'); //No I18n
			$('#telemetryDesc').val(telemetryEditObj.desc);
			$('#telemetryPort').val(telemetryEditObj.port);
			$('#telemTimeout').val(telemetryEditObj.timeout);
			$('#telemRetry').val(telemetryEditObj.retries);
			var teleProtocol = telemetryEditObj.authentication;
			$('.teleCrdTypes').removeClass('active');
			$('.teleCrdTypes[data-actiontype="' + teleProtocol + '"]').addClass('active'); //No I18N
			$("input[name='teleProtocol'][value='" + teleProtocol + "']").prop('checked', true); //No I18N
			$('#telemetryAuthOverride').val(telemetryEditObj.authOverride);
			var autoFetchServerCert = telemetryEditObj.autofetchServerCert;
			if(teleProtocol === 'MTLS'){ //No I18N
				$('.teleInputmTls').show();
				var selfSign = telemetryEditObj.selfSignedClient? 'selfSigned':'externalCA';//No I18N
				$("input[name='mtlsSignMode'][value='" + selfSign + "']").prop('checked', true);
				telemetryEditObj.selfSignedClient ? toggleMtlsCertSection('selfMtlsCertSection'):toggleMtlsCertSection('externalMtlsCertSection');//No I18N
				if(telemetryEditObj.selfSignedClient){
					$('#mtlsSelfSignAutoFetch').prop('checked',autoFetchServerCert);
					toggleAutoFetchCert('mtlsSelfSignAutoFetch','mtlsSelfSignServer');//No I18N
				}else{
					$('#mtlsExtSignAutoFetch').prop('checked',autoFetchServerCert);
					toggleAutoFetchCert('mtlsExtSignAutoFetch','mtlsExternalServer');//No I18N
				}
			}
			else if(teleProtocol === 'TLS'){ //No I18N
				$('.teleInputtls').show();
				$('#tlsHostNameOverride').val(telemetryEditObj.overrideAuthority);
				$('#tlsAutoFetchSCrt').prop('checked',autoFetchServerCert); //No I18N
				if(!autoFetchServerCert){
					$('#tlsServerValidationRow').show();
				}
			}else{
				$('.teleInputplaintext').show();
			}
		}
		$('#mtlsAlias').select2();
		$('#v2HtmlHolder').addClass('slideInTopFix');
	},
	actions:{
		addCredential:function()
		{	
			var telemetryEditObj = this.get('parentView.credDetails');
			var isExternalCaConfigured = this.get('controller.isExternalCAAvailable');
			var frmData = new FormData();
			var isMultiPart = false;				
			var telemetryName = trimAll($('#snmpName').val());
			var telemetrydesc = trimAll($('#telemetryDesc').val());
			var telemetryPort = trimAll($("#telemetryPort").val());//No I18N
			var telemetryTimeout = trimAll($("#telemTimeout").val());//No I18N
			var telemetryRetry = trimAll($("#telemRetry").val());//No I18N
			var fieldsToValidate = {'empty':['snmpName','telemetryPort','telemTimeout','telemRetry'],'rangeCheck':{'telemetryPort': 65535,'telemTimeout':300,'telemRetry':10},'minRangeCheck':{'telemetryPort': 1,'telemTimeout':1,'telemRetry':0},'positive':['telemetryPort','telemTimeout'],'fileCheck':[]};//No I18N
			var update = this.get('operation') === "update" ? true : false; //No I18n
			var url = window.OPM.apiUrlPattern + '/admin/addTelemetryCredential?'; //No I18N
			var callAction = $('#teleCredCallAction li.active ').attr('data-actiontype');//No I18N
			var data = {'update':update,'credentialName':telemetryName,'desc':telemetrydesc,'port':telemetryPort,'timeout':telemetryTimeout,'retries':telemetryRetry};//No I18N
			var teleEditAutoFetch = true;
			if(update) {
				fieldsToValidate.empty.splice(1,2);
				var editObj = telemetryEditObj = this.get('parentView.credDetails');
				teleEditAutoFetch = editObj.autofetchServerCert;
				var isCallActionChanged = telemetryEditObj && callAction !== telemetryEditObj.authentication;
			}
			frmData.set('update',update);//No I18N
			frmData.set('credentialName',telemetryName);//No I18N
			frmData.set('desc',telemetrydesc);//No I18N
			frmData.set('port',telemetryPort);//No I18N
			frmData.set('timeout',telemetryTimeout);//No I18N
			frmData.set('retries',telemetryRetry);//No I18N
			
			if(callAction === 'TLS'){
				var autoFetchServerCert = $('#tlsAutoFetchSCrt').is(':checked');//No I18N
				data.autofetchServerCert = autoFetchServerCert;
				var serverCert = $("#teleTlsServerCert")[0].files[0];//No I18N
				var hostOverride = trimAll($('#tlsHostNameOverride').val()); //NO I18N
				frmData.set('autofetchServerCert',autoFetchServerCert);//No I18N
				if(!autoFetchServerCert){
					isMultiPart = true;

					if(!update || (update && isCallActionChanged && !autoFetchServerCert)){
						fieldsToValidate.fileCheck.push('teleTlsServerCert');//No I18N
					}
					if(serverCert !== undefined){
						frmData.set('serverRootCert', serverCert);//No I18N
					}
					if(hostOverride !== ""){
						frmData.set('overrideAuthority', hostOverride);//No I18N
						fieldsToValidate.hostName = ['tlsHostNameOverride'];//No I18N
					}
				}				
			}else if(callAction === 'MTLS'){//No I18N
				var mtlsSignInMode =  $('input[name="mtlsSignMode"]:checked').val();//No I18N
					frmData.set('confirmImport', true);//No I18N
					data.confirmImport = true;
				if(mtlsSignInMode === "externalCA"){
					var mtlsClientCert = $('#mtlsClientCert')[0].files[0];//No I18N
					var leafFilename = $('#mtlsClientCert').val();//No I18N
					var fileSplit = leafFilename.split('\\');
					var fileExt = getFileExt(fileSplit[fileSplit.length-1]);
            		if(mtlsClientCert !== undefined){
						isMultiPart = true;
						frmData.set('serverCert', mtlsClientCert);//No I18N
					}
					if(!isExternalCaConfigured){
						fieldsToValidate.fileCheck.push('mtlsClientCert');//No I18N
					}
					//keyPassword
					var isClientPassPhraseRow = $('#mtlsCliPhraseDiv').is(':visible');
					var isClientRootCerticate = $('#mtlsCliRootCrtDiv').is(':visible');

					if(fileExt === 'keystore' || fileExt === 'truststore' || fileExt === 'pfx' || fileExt === 'jks'){
						var passWord = trimAll($("#mtlsKadvuChol").val());//No I18N
						var publicKey = localStorage.getItem('encodePKey');//No I18N
						passWord = changePasswordValue(passWord, publicKey);
						var mtlsAlias =  $('#mtlsAliasNames').val();//No I18N
						if(mtlsClientCert !== undefined){
							fieldsToValidate.empty.push('mtlsKadvuChol');//No I18N
						}
						frmData.set('filePassword', passWord);//No I18N
						frmData.set('keyAlias', mtlsAlias);//No I18N
					}else{
						var mtlsClientKey = $('#mtlsClientKey')[0].files[0];//No I18N
						var mtlsClientRoot = $('#telemetryCliRootCrt')[0].files[0];//No I18N
						if(mtlsClientCert !== undefined){
							fieldsToValidate.fileCheck.push('mtlsClientKey');//No I18N
						}
						if(mtlsClientKey !== undefined && mtlsClientKey !== ''){
							frmData.set('certKeyFile', mtlsClientKey);//No I18N
						}
						var mtlsCliRootCrt = undefined;
						if(isClientPassPhraseRow){
							var keyPassword = trimAll($("#mtlsKeyPassword").val());//No I18N
							fieldsToValidate.fileCheck.push('mtlsKeyPassword');//No I18N
							fieldsToValidate.fileCheck.push('mtlsRootCrt');//No I18N
							frmData.set('keyPassword', keyPassword);//No I18N
						 	mtlsCliRootCrt = $('#mtlsRootCrt')[0].files[0];//No I18N
						}
						if(isClientRootCerticate) {
							mtlsCliRootCrt = $('#telemetryCliRootCrt')[0].files[0];//No I18N
							fieldsToValidate.fileCheck.push('telemetryCliRootCrt');//No I18N
						}
						
						if(mtlsClientRoot !== undefined){
							var rootCert = $('#telemetryCliRootCrt')[0].files;//No I18N
							if(rootCert && rootCert.length >= 1){
								for(var i = 0; i < rootCert.length; i++){
            						frmData.append('intermediateCertificates',rootCert[i]);
								}
							}
							frmData.set('intermediateFetchAuto', false);//No I18N
						}
					}
					//Server Certificate Part
					var mtlsAutoFetchServerCert = $('#mtlsExtSignAutoFetch').is(':checked');//No I18N
					data.autofetchServerCert = mtlsAutoFetchServerCert;
					frmData.set('autofetchServerCert', mtlsAutoFetchServerCert);//No I18N
					if(!mtlsAutoFetchServerCert){
						isMultiPart = true;
						var serverRootCert = $("#mtlsExtServerCert")[0].files[0];//No I18N
						var mtlsHostName = $("#mTLSExtHostname").val();//No I18N
						if(serverRootCert !== undefined){
							frmData.set('serverRootCert', serverRootCert);//No I18N
						}
						if(mtlsHostName !== ""){
							frmData.set('overrideAuthority', mtlsHostName);//No I18N
							fieldsToValidate.hostName = ['mTLSExtHostname'];//No I18N
						}
						if(!update || (update && isCallActionChanged && !mtlsAutoFetchServerCert)){
							fieldsToValidate.fileCheck.push('mtlsExtServerCert');//No I18N
						}
					}
					frmData.set('selfSignedClient', false);//No I18N
					data.selfSignedClient = false;
				}else if(mtlsSignInMode === "selfSigned"){//No I18N
					frmData.set('selfSignedClient', true);//No I18N
					data.selfSignedClient = true;
					var autoFetch = $('#mtlsSelfSignAutoFetch').is(':checked');//No I18N
					frmData.set('autofetchServerCert',autoFetch);//No I18N
					data.autofetchServerCert = autoFetch;
					
					if(!autoFetch){
						isMultiPart = true;
						var mtlsSelfServerCert = $("#mtlsSelfServerCert")[0].files[0];//No I18N
						var mtlsSelfHostName = $("#mtlsSelfHostname").val();//No I18N
						if(!update || (update && isCallActionChanged && !autoFetch)){	
							fieldsToValidate.fileCheck.push('mtlsSelfServerCert');//No I18N
						}
						if(mtlsSelfServerCert !== undefined){
							frmData.set('serverRootCert', mtlsSelfServerCert);//No I18N
						}
						if(mtlsSelfHostName !== ""){
							frmData.set('overrideAuthority', mtlsSelfHostName);//No I18N
							fieldsToValidate.hostName = ['mtlsSelfHostname'];//No I18N
						}
					}
				}
			}

			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var teleMetryHeaders = this.get('controller.teleMetryHeaders');
				var headerObj = [];
				var duplicateFound = false;
				var publicKey = "";
				if(teleMetryHeaders.length){
					publicKey = localStorage.getItem('encodePKey');//No I18N
				}

				for (var i = 0; i < teleMetryHeaders.length; i++) {
					var headerKey = trimAll($("#teleHeaderKey_" + teleMetryHeaders[i].id).val());
					var headerValue = trimAll($("#teleHeaderValue_" + teleMetryHeaders[i].id).val());
					
					if (headerKey && headerValue) {
						if (headerObj[headerKey]) {
							duplicateFound = true;
							opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.telemetry.cred.header.key.duplicatealert'));//No I18N
							return false;
						}
						if(publicKey !== ""){
							 headerValue = changePasswordValue(headerValue, publicKey);
						}
						headerObj.push({
							key: headerKey,
							value: headerValue
						});		
					}
				}
				if(Object.keys(headerObj).length > 0){
					frmData.set('headers', JSON.stringify(headerObj));//No I18N
					data.headers = JSON.stringify(headerObj);
				}
				if(isMultiPart){
					var response = opm_ajaxMultiPostRequest(url+'callAction='+callAction,frmData);//No I18N
				}else{
					var response = opm_ajaxPostRequest(url+'callAction='+callAction,data);//No I18N

				}
				if(response !== undefined && !$.isEmptyObject(response))
				{
					if(response.result !== undefined)
					{
						/*if(this.fromSnapshotRediscoverPage!==undefined){
							rediscoverUnknownDevice({telementryArr:telemetryName});
						}else{ */
						opm_infoMsgs("successMsg",response.result.message);//No I18N
					//	opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay);
						opm_getCredentialList(OPMClient.SettingsAddDeviceController.credToDisplay,undefined,undefined,undefined,'credentialsList'); //No I18N
						closeCredentialSlide();
						//Model 1
						var callBackFn = function(){
							openAssociateToProbes("credentials",true, telemetryName,update);//No I18N
						}
						initProbeAssociation("credential",telemetryName,callBackFn);
					}
					else if(response.error !== undefined)
					{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}					
				}
			}
		},
		removeTeleHeader:function(id){
			var teleMetryHeaders = this.get('controller.teleMetryHeaders');
			for (var i = 0; i < teleMetryHeaders.length; i++) {
				if (teleMetryHeaders[i].id == id) {
				  teleMetryHeaders.removeAt(i);
				  break;
				}
			}
			for (var j = 0; j < teleMetryHeaders.length; j++) {
			  var isLast = (j === teleMetryHeaders.length - 1);
			  Ember.set(teleMetryHeaders[j], 'showplusIcon', isLast);
			  Ember.set(teleMetryHeaders[j], 'showDeleteIcon', teleMetryHeaders.length > 1);
			}
		},
		addTeleHeader:function(CurRowId,curVal){
			var lastRowKeyId = "teleHeaderKey_"+CurRowId;//No I18N
			var lastValRowId = "teleHeaderValue_"+CurRowId;//No I18N

			var lastRowKey = trimAll($("#"+lastRowKeyId).val());
			var lastRowVal = trimAll($("#"+lastValRowId).val());
			var teleMetryHeaders = this.get('controller.teleMetryHeaders');
			var isDuplicate = false;
			if(teleMetryHeaders.length >1){
				for (var i = 0; i < teleMetryHeaders.length; i++) {
					var rowId = "teleHeaderValue_"+teleMetryHeaders[i].id;
					var rowValue = trimAll($("#"+rowId).val());
					if(CurRowId !== teleMetryHeaders[i].id && lastRowVal === rowValue) {
						isDuplicate = true;
						$("#"+lastValRowId).addClass('validateField error');//No I18N
						$("#"+lastValRowId).attr('data-error',Ember.i18n.t('webclient.this.field.cannotduplicate',this));
						opmValidate($("#"+lastValRowId));
						return false;

					}
				}
			}
			var fieldsToValidate = {'empty':[lastRowKeyId,lastValRowId]};//No I18N
			var isValid = opm_validateFields(fieldsToValidate);
			if(!isValid){
				return false;
			}

			var teleMetryHeaders = this.get('controller.teleMetryHeaders');

			var teleMetryHeaderCount = this.get("controller.teleMetryHeaderCount") ||  0;
			var newRowId = parseInt(teleMetryHeaderCount) + 1;
			var obj = Ember.Object.create({
			  id: newRowId,
			  value: '',
			  showplusIcon: true
			});
			teleMetryHeaders.pushObject(obj);
			this.set("controller.teleMetryHeaderCount", newRowId);//NO I18N
			for (var i = 0; i < teleMetryHeaders.length; i++) {
				var isLast = (i === teleMetryHeaders.length - 1 && teleMetryHeaders.length < 5);
				Ember.set(teleMetryHeaders[i], 'showplusIcon', isLast);
				Ember.set(teleMetryHeaders[i], 'showDeleteIcon', teleMetryHeaders.length > 1);

			}
		}
	},
	willDestroyElement:function()
	{
		this.set('controller.isExternalCAAvailable',response.isExternalCAAvailable); //No I18n
		this.set('controller.teleMetryHeaders',teleMetryHeaders); //NO I18N
		this.set('controller.teleMetryHeaderCount',0); //NO I18N
		$('#v2HtmlHolder').removeClass('slideInTopFix');
	}
});
