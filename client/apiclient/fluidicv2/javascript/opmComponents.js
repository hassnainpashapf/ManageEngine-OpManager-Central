OPMClient.OpmSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-summary",
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmNutanixClusterDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-nutanix-cluster-details", //No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		if((widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true) || window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(!window.OPM.isCentralServer && this.snapshotObj.statusPollEnabled !== undefined && !this.snapshotObj.statusPollEnabled)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
		OPMClient.InventoryDeviceDetailsController.set('prismCentralName', this.get('widgetData.apiData.prismCentralName')); //No I18N
	},
	actions: {
		redirectToPrismCentral: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.prismCentralMoName,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmNutanixHostDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-nutanix-host-details", //No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		if((widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true) || window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?15:14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(!window.OPM.isCentralServer && this.snapshotObj.statusPollEnabled !== undefined && !this.snapshotObj.statusPollEnabled)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
		OPMClient.InventoryDeviceDetailsController.set('prismCentralName', this.get('widgetData.apiData.prismCentralName')); //No I18N
	},
	actions:{
		redirectToPrismCentral: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.prismCentralMoName,'','MonitoringDevice');
		},
		redirectToCluster: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.clusterMoName,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmNutanixVMDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-nutanix-vm-details", //No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		if((widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true) || window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?20:14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(!window.OPM.isCentralServer && this.snapshotObj.statusPollEnabled !== undefined && !this.snapshotObj.statusPollEnabled)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
		OPMClient.InventoryDeviceDetailsController.set('prismCentralName', this.get('widgetData.apiData.prismCentralName')); //No I18N
	},
	actions:{
		redirectToPrismCentral: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.prismCentralMoName,'','MonitoringDevice');
		},
		redirectToCluster: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.clusterMoName,'','MonitoringDevice');
		},
		redirectToHost: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.hostMoName,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmSwitchSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-switch-summary",
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmUCSSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ucs-summary", //NO I18N
	classNames:['com_UCSSummary'],
	didInsertElement: function(){
		var self = this;
		if(window.OPM.isNewSnapshotPage)
		{
			self.set('widgetData.sizey',16);//No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
			var adjustedHeight = snapHeightCalculation[20]-70;//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}
		else{
			if(self.snapshotObj !== undefined && self.snapshotObj.snapType === "MonitoringDevice")
			{
				self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?16:12);//No I18N
				this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
				this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
			}
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_UCSSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}
		if(!window.OPM.isCentralServer && this.snapshotObj.statusPollEnabled !== undefined && !this.snapshotObj.statusPollEnabled)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
	},
	actions:{
		changeDevicePasswordDetails: function(){
			changeDevicePasswordDetails();
			opmUserStats('snapshot_changeCredential');//No I18N
		},
		summaryEdit: function(snapObj){
			redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
		},
		redirectSnapshot: function(deviceName){
			redirectSnapShot('',"MonitoringDevice",deviceName);//No I18N
		},
		editCustomTypeName: function() {
			$('#showDevType').hide();
			$('#editDevType').show();
			$('#editDevType').addClass('flex');//No I18N
			$('#devTypeValue').val($('#devTypeName').text());
			$('#devTypeValue').focus();
		},
		saveCustomTypeName: function(snapObj){
			var self = this;
			var dtName = $('#devTypeValue').val();
			if(dtName===undefined || dtName===null || dtName==="" || dtName===" " || dtName==="null"){
				$('#devTypeValue').addClass('validateField error');//No I18N
				$('#devTypeValue').attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
				$('#devTypeValue').focus();
				opmValidate($('#devTypeValue'));
			}else if(!opm_isValidDTName(dtName)){
				$('#devTypeValue').addClass('validateField error');//No I18N
				$('#devTypeValue').attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
				$('#devTypeValue').focus();
				opmValidate($('#devTypeValue'));
			}
			else{
				var callBackFn = function()
				{
					var data= {'deviceType':dtName,'deviceTypeID':snapObj.deviceTypeID};//No I18N
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/updateCustomDeviceTemplateName",data)//No I18N
					showMessage(response);
					if(response.error === undefined){
						$('#deviceTypeTile').text(dtName);
						opm_transitionToParentRoute("Inventory.Device",snapObj.deviceName);//No I18N
						for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
							if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
								OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
							}
						}
					}
				};
				var cancelCallBackFn = function() {
					self.send('cancelCustomTypeName'); //No I18n
				}
				opmConfirm(Ember.I18n.t('webclient.agent.confirm'),Ember.I18n.t('opm.devsnap.type.edit.confirm'),'',callBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.yes'),cancelCallBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'hideCloseInUIDIalog',false,false);//No I18N
			}
		},
		cancelCustomTypeName: function() { 
			$('#showDevType').show();
			$('#editDevType').hide();
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			$('#editDevType').removeClass('flex');//No I18N
			$('#devTypeName').text($('#deviceTypeTile').text());
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmApmPluginSilentInstallationComponent = Ember.Component.extend({
	templateName: "components/opm-apm-plugin-silent-installation",//NO I18N
	showInstall:false,
	showContexual:false,
	parentModel:{},
	showLoading:true,
	isDevSpec:false,
	didInsertElement:function(){
		var self = this;
		var isDevSpecificPage = ('Inventory.Device' === self.get('tabName'));//No I18N
		var apmDetails = self.get('parentModel');
		if(apmDetails.apmInstalled === undefined){
			apmDetails = OPMClient.Home.getApmTabDetails();
		}

		if(window.OPM.isEEProbeSelected && !window.OPM.isAPMInstalledInProbe){
			var response =  opm_ajaxGetResponse(window.OPM.apiUrlPattern+'/v2/admin/getAPMPluginInstallationStatus'); //No I18N
			if(response.isApmInstalled !== undefined && response.isApmInstalled === "true"){ //No I18N
				window.OPM.isAPMInstalledInProbe = true;
			}else{
				apmDetails = response;
			}
		}

		self.setProperties({isAPMInstalled:self.get('isAPMInstalled') || apmDetails.apmInstalled || window.OPM.isAPMInstalledInProbe,isAPMRunning:self.get('isAPMRunning') || apmDetails.isAPMRunning,'parentModel.loadAPMPage':false,showContexual:true,changeBackground:!['Inventory.Device','Settings.Basic.AddOnProduct.ApplicationsManager'].contains(self.get('tabName')),apmSyncStatusRequestInProgress:self.get('apmSyncStatusRequestInProgress') || apmDetails.syncNotNeeded,installationHeader:Ember.I18n.t(isDevSpecificPage ? 'webclient.opm.apm.plugin.not.installed.device.header' : 'webclient.APM.Plugin.notinstalled.heading'), isDevSpecificPage:isDevSpecificPage});//No I18N
		updateAPMPluginSyncStatus(self);
		if(self.get('isAPMRunning') || !self.get('isRerender') || ('Inventory.List.Summary.Sub' === self.get('tabName'))){
			doLoadAPMPage(self);
		}
	},
	actions:{
		getSilentInstallationStatus:function(){
			var self = this;
			var disableSilentInstallation = window.OPM.language === 'ja_JP' || window.OPM.installedLanguage === 'ja' || window.OPM.rebrandObj.disableAPMSilentInstallation || self.get('ifAPMMigrating');
			//Resetting properties for consecutive status update for probe.
			self.setProperties({showInstall:false,showProfInstallButton:false,showEnterpriseInstallButton:false,showLearnMoreLink:false,infoMessage:undefined,disableButtons:(window.OPM.isProbe || window.isoperator),showCompareEditionLink:false,hideCopy:true,appsCount:500});
			var reqTime = OPMClient.AppsApmDetailsController.installationStatusRequestedTime;
			if(window.isoperator || (reqTime !== undefined && ((Number(Date.now()) - reqTime) < 30000))){
				return;
			}
			var getInstallationStatusCallback = function(resp){
				if(resp !== undefined && resp.error === undefined && resp.STATUS_ID !== undefined){
					if(resp.STATUS_ID === 1){
						self.setProperties({showInstall:!disableSilentInstallation,showProfInstallButton:!window.OPM.isOPMPlusCentral});
					}
					if(resp.APM_DOWNLOAD_LINK !== undefined){
						OPMClient.AppsApmDetailsController.set('apmPluginDownloadArchivesLink',resp.APM_DOWNLOAD_LINK);//No I18N
					}
					if(self.msgID !== undefined && self.msgID !== ''){
						$('#'+self.msgID).remove();
						self.msgID = '';
					}
					if(resp.ERROR_MESSAGE !== undefined){
						self.set('msgID',opm_infoMsgs('infoMsg',resp.ERROR_MESSAGE));//No I18N
						localStorage.removeItem('isFreshAPMInstallation');//No I18N
					}
					handleSilentInstallationForEE(self,resp);
					resp.PROGRESS+='%';
					self.setProperties({resp:resp,status:resp.STATUS_ID,progressWidth:'width:'+resp.PROGRESS+''});//No I18N
					if(self.schedulerId !== undefined){
						clearTimeout(self.schedulerId);
					}
					if([2,3,4].contains(resp.STATUS_ID) || (window.OPM.isProbe && resp.STATUS_ID === 1)){
						self.set('schedulerId',setTimeout(function(){//No I18N
							self.send('getSilentInstallationStatus');//No I18N
						},(resp.STATUS_ID === 1) ? 180000 : 30000));
						//for avoiding multiple calls.
						if(resp.STATUS_ID !== 1){
							OPMClient.AppsApmDetailsController.set('installationStatusRequestedTime',Number(Date.now()));//No I18N
							localStorage.setItem('isFreshAPMInstallation',true);//No I18n
						}
					}
				}
				self.setProperties({hideCopy:(self.disableButtons || self.showInstall || disableSilentInstallation)});
			}
			opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + '/v2/admin/getAPMPluginInstallationStatus',{},Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'),getInstallationStatusCallback);//No I18N
		},
		copyToClipboard:function(){
			var copyDiv = document.getElementById('ApmOfflineLink');
		    copyDiv.style.display = 'block';
		    copyDiv.focus();
		    document.execCommand('SelectAll');//No I18N
		    document.execCommand("Copy", false, null);//No I18N
		    copyDiv.style.display = 'none';
		    opm_infoMsgs('successMsg',Ember.I18n.t('webclient.common.text.copyclip',{param0: Ember.I18n.t('webclient.opm.apm.copy.Download.link')})); //No I18N
		},
		installAPM:function(edition){
			var self = this;
			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/v2/admin/installAPMPlugin',{edition: (edition === 'prof') ? 'PROFESSIONAL' : window.OPM.isCentralServer ? 'CENTRAL' : 'PROBE'},Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'),function(response){//No I18n
				if(response !== undefined){
		            showMessage(response);
		        }
				self.send('getSilentInstallationStatus');//No I18N
			});
		},
		rerenderAPMPage:function(timeout){
			var self = this;
			setTimeout(function(){//Waiting for Logged in to APM
				self.setProperties({'parentModel.apmInstalled':true,'parentModel.isAPMRunning':true});//No I18N
				if('Inventory.Device' === self.get('tabName') || OPMClient.InventoryDeviceDetailsController.subFilterType === "Applications"){ //No I18N
					self.rerender();
				}else{
					opm_emberViewRerender(self.get('tabName'));
				}
				//Getting an autologin issue, if trying to load iframe under 5sec from authentication.
			},timeout);
		},
		/*Should be removed once APM becomes FIPS compliant*/
		closeAPMFIPsMessage:function(){
			showHideAPMFIPsMessage(false,true);/*Should be removed once APM becomes FIPS compliant*/
		}
		/*---*/
	},
	installationStatusObservor:function(){
		var self = this;
		var status = self.get('status');
		var resp = self.get('resp');
		if(status === 1 || status === ''){
			return;
		}
		if(status === 5){
			self.setProperties({'parentModel.apmInstalled':true,isAPMInstalled:true});//No I18N
		  	updateAPMPluginProperties(self);
		  	if(!(self.get('apmSyncStatusRequestInProgress') || OPMClient.AppsApmDetailsController.showLoading)){
		  		//Instead of showing initial sync screen, shown loading screen.
		  		if(OPMClient.AppsApmDetailsController.hideInitSync){
			  		self.set('showLoading',true);//No I18N
		  			OPMClient.AppsApmDetailsController.setProperties({hideInitSync:false,loadAutoLoginIframe:true,showLoading:true,loggedInDate:Number(Date.now())});
		  		}
			  	//Due to getting empty response for getAPMSyncStatus API, delay has been set
			  	setTimeout(function(){
			  		self.setProperties({isInstallationCompleted:true,status:'',isRerender:true});
			  	},1500);
			}
		}
		self.setProperties({preCheckError:status === 22,showTimeLine:[2,3,4,22,23].contains(status),showTimeLineError:(status === 22 || status === 23),timeLineErrorMsg:resp.ERROR_MESSAGE,steps:getAPMInstallationSteps(resp),status:''});
	}.observes('status'),//No I18N
	installationCompletionObserver:function(){
		var self = this;
		if(self.get('isInstallationCompleted')){
			self.set('isInstallationCompleted',undefined);//No I18N
			self.rerender();
		}
	}.observes('isInstallationCompleted'),//No I18N
	syncStatusOberver:function(){
		var self = this;
		var jsonData = self.get('responseData');
		if(jsonData !== undefined && jsonData.apmSyncStatus !== undefined){
			if(jsonData.apmSyncStatus === 'MASTER_KEY_SYNC_FAILED'){
				self.setProperties({ifAPMMigrating:true,isAPMRunning:false,pgMigObj:{pgMigStatusMsg:jsonData.startupErrorMessage,textClass:'danger'}});//No I18N
				return;
			}
			if(jsonData.apmSyncStatus !== 'YET_TO_START' && !(sessionStorage.getItem('isAPMRunning') === 'true')){
				self.setProperties({isInitSyncFailed:(jsonData.apmSyncStatus === 'INIT_SYNC_FAILURE'),isAPMRunning:false});//No I18n
				if(self.get('isInitSyncFailed')){
					if(jsonData.startupErrorMessage !== undefined){
						var errorMessage = jsonData.startupErrorMessage.split('\n').filter(Boolean);
						self.set('startupErrorMessage', errorMessage);//No I18N
					}else{
						self.set('defaultErrorMessage',Ember.I18n.t('webclient.apm.plugin.init.sync.failed.restart.infoMsg'));//No I18N
					}
					sessionStorage.setItem('isInitSyncFailed',self.get('isInitSyncFailed'));//No I18n
				}else{
					doAutoLoginAPM(self,(jsonData.apmRunningState && jsonData.apmSyncStatus === 'INIT_SYNC_SUCCESS'));//No I18N
				}
			}
		}
	}.observes('responseData.apmSyncStatus'),//No I18N
	userSyncObserver:function(){
		var self = this;
		var jsonData = self.get('responseData');
		if(jsonData !== undefined && jsonData.apmSyncStatus !== undefined) {
			if(jsonData.apmRunningState && jsonData.apmSyncStatus === 'INIT_SYNC_SUCCESS') { //No I18N
				if(jsonData.apmUserSyncStatus === 'YET_TO_START'){
					opm_infoMsgs('infoMsg', Ember.I18n.t('webclient.apm.plugin.user.sync.in.progress.infoMsg')); //No I18N
				}else if(jsonData.apmUserSyncStatus === 'USER_SYNC_FAILURE') { //No I18N
					opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.apm.plugin.user.sync.failed.infoMsg')); //No I18N
				}else{
					self.set('showLoading',true);//No I18N
				}
			}

		}
		else if(jsonData.isAPMCompatible == "false")
		{
			self.set("showAPMCompatibleMsg",true)//No I18N
		}

	}.observes('responseData.apmUserSyncStatus'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		var self = this;
		if('Inventory.List.Summary.Sub' === self.get('tabName')){
			$('#PageContent').removeClass('apmMontiorsListPage');//No I18N
	        $('body').removeClass('apmDownloadPage');//No I18N
	        resetScrollEvent();
		}
		if(window.OPM.currentView.name.indexOf('Inventory.List.Server') > -1){ //No I18N
        	$('.AETIDHeader').show(); //No I18N
        	$('.AETIDContent').removeClass('mt-none'); //No I18N
        }
		if(self.get('schedulerId') !== undefined){
			clearTimeout(self.get('schedulerId'));
		}
	}
});
OPMClient.OpmApmContexualComponent = Ember.Component.extend({
	templateName: "components/opm-apm-contexual",//NO I18N
	actions:{
		viewDetails:function(){
			var self = this;
			$("body").addClass("ui-dialog-style2");
			 $("#dialog").dialog({
		        modal: true,
		        resizable: false,
        		draggable: false,
		        width: 650,
		        maxHeight: 500,
		        close: function() {
					$("body").removeClass("ui-dialog-style2");
				},
		        title: self.get('InfoDetails')
		    });
		},
		copyToClipboard:function()
		{
			var copyDiv = document.getElementById('ApmOfflineLink');
		    copyDiv.style.display = 'block';
		    copyDiv.focus();
		    document.execCommand('SelectAll');//No I18N
		    document.execCommand("Copy", false, null);//No I18N
		    copyDiv.style.display = 'none';
		    opm_infoMsgs('successMsg',Ember.I18n.t('webclient.common.text.copyclip',{param0: Ember.I18n.t('webclient.opm.apm.copy.Download.link',this)})); //No I18N
		},
		installAPM:function(edition){
			this.get('targetObject').send('installAPM',edition);  //No I18N
		}
	},
	didInsertElement: function(){
		this.set('showContexual',false);//No I18N
		var fromSnapshot = this.get('fromSnapshot')
		if(!window.OPM.isCentralServer && !fromSnapshot && !window.OPM.isCustomer){
			var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
			var url = window.OPM.apiUrlPattern + '/device/getAPMApplicationsDetails';//No I18N
			if(deviceName.length > 0 && 'Inventory.Device' === this.get('parentView').get('tabName')){
					url = url += '?deviceName=' + deviceName; //No I18N
			}
			var Apps = opm_ajaxGetResponse(url);
			if(Apps && Apps.ApplicationList && Apps.ApplicationList.length > 0)
			{
				var AppList = Apps.ApplicationList;
				function compare( a, b ) {
				  if ( a.Appname < b.Appname ){
				    return -1;
				  }
				  if ( a.Appname > b.Appname ){
				    return 1;
				  }
				  return 0;
				}
				AppList.sort( compare );
				this.set('showContexual',true);//No I18N
				this.set('AppList',AppList);//No I18N
				this.set('ApplicationDeviceMap',Apps.ApplicationDeviceMap);//No I18N
				this.set('InfoDetails',Apps.InfoDetails);//No I18N
				if(fromSnapshot)
				{
					this.get('parentView').set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?28:26)//No I18N
				}
			}else if(Apps.error !== undefined){
				showMessage(Apps);
			}
		}
		this.get('targetObject').set('showContexual',this.get('showContexual'));//No I18N
		this.set('hideCopy',(window.OPM.language === 'ja_JP' || window.OPM.installedLanguage === 'ja' || window.OPM.currentView.handler.controller.hideCopy || window.OPM.rebrandObj.disableAPMSilentInstallation));//No I18N
	},
	willDestroyElement:function() {
	}
});
OPMClient.OpmHardwareGraphComponent = Ember.Component.extend({
	templateName: "components/opm-hardware-graph",//NO I18N
	refreshContent: function(){
		var self =this;
		tempurl = window.OPM.apiUrlPattern + "/device/getGraphData?isHardwareGraph=true&name="+OPMClient.InventoryDeviceDetailsController.deviceName+"&parameterName="+this.get('params.selected')+"&period=Today"; // No I18N
		$.ajax({
		//url: window.OPM.apiUrlPattern + "/device/getGraphData?isHardwareGraph=true&name="+OPMClient.InventoryDeviceDetailsController.deviceName+"&parameterName="+this.get('params.selected')+"&period=Today", // No I18N
		url: eeClientReqToProbe(tempurl, OPMClient.InventoryDeviceDetailsController.eeProbeID),
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		async: true,
		self:self,
		success: function(jsonData) {
		var multiData = new Array();
		var grapData = jsonData.hardwareData.hardwareChartData;
		var legendData = (jsonData.hardwareData.hardwareLegendSummary && jsonData.hardwareData.hardwareLegendSummary[0])  !==undefined ? jsonData.hardwareData.hardwareLegendSummary[0] : {} ;
		var unitText = '';
		if(grapData !== undefined)
		{
		for (var indexx = 0; indexx < Object.keys(grapData).length; indexx++) {
			var array_element = grapData[Object.keys(grapData)[indexx]];
			var arr = new Array();
			for (var index2 = 0; index2 < array_element.length; index2++) {
				var array_element2 = array_element[index2];
				var xandy = new Array();
				xandy.push(array_element2.x*1000);
				xandy.push(array_element2.y);
				arr.push(xandy);
			}
			var singleData = {
				"yaxiscolumnorder" : [ 0 ],
				"seriesname" : Object.keys(grapData)[indexx],
				"data" : arr //No I18N
			}
			multiData.push(singleData);
		}
		}
		if(legendData.queryUnits !== undefined && legendData.queryUnits !== ''){
    		unitText = '<i style="font-family:LatoRegular">&nbsp;('+legendData.queryUnits+')</i>';//No I18N
    	}
		var graphParams = getZChartObject('hardwareGraph'+self.get('params.name').replace(/ /g,"_"),'',Ember.I18n.t('webclient.admin.schedulereports.time'),legendData.queryUnits || Ember.I18n.t('webclient.report.hardware.value'),null,null,'','',{graphData:multiData},self,'snapWidgetHalf');//No I18N
		self.set('showDropdown',multiData.length > 0);//No I18N
		self.set('graphParams',graphParams);//NO I18N
				var delayRenders = [0,8,8,9,9,10,11,12];
				var j = self.get('params.index');
				if(j==0)
				{
					graphParams.delayRenders =  delayRenders[j];
				}
				else if(j<7)
				{
					graphParams.delayRenders = delayRenders[j];
				}
				else
				{
					graphParams.delayRenders = 12;
				}
		var colNames = [
	   				Ember.I18n.t('webclient.cusreports.sensorname'),//No I18N
					Ember.I18n.t('webclient.reports.tags.min')+unitText,//No I18N
					Ember.I18n.t('webclient.reports.tags.max')+unitText,//No I18N
				 	Ember.I18n.t('webclient.reports.tags.avg')+unitText,//No I18N
				 	"",""
	   			];

	   			var	colModel= [
					{name:'sensorname',index:'sensorname',width:25}, //No I18N
					{name:'min',index:'min',width:22}, //No I18N
					{name:'max',index:'max',width:22}, //No I18N
					{name:'avg',index:'avg',width:22}, //No I18N
					{name:'queryUnits',index:'queryUnits',hidden:true}, //No I18N
					{name:'id',index:'id',sortable:false,fixed:true,hidden:true} //No I18N
	   			];
	   			var gridCallBack = function(gridID,paramsObj){
					var gridH = $('#gbox_'+gridID.replace('#','')).height()+300 +$(".hwareList").height() + 1500;
					var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
					paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//NO I18N
				}

	   			var defaultOptions = {"sortName":"sensorname","sortOrder":"asc","hidegrid":true,"toggleSearch":false,"searchOption":true,skipNameEscapeCheck:true}; //No I18N
				defaultOptions.minRowsPerPage =10;
				var sendObj = {className:'opm_jqGridUI opmReportsGridview mBottom20'};//No I18N
		sendObj.gridId = 'hardwareGrid'+self.get('params.name').replace(/ /g,"_");;//No I18N
		sendObj.pagerId = 'hardwarePager'+self.get('params.name').replace(/ /g,"_");;//No I18N
		sendObj.data = jsonData.hardwareData.hardwareLegendSummary;
		sendObj.defaultOptions = defaultOptions;
		sendObj.colModels = colModel;
		sendObj.colNames = colNames;
		sendObj.onSelectFunction="Onselect"+self.get('params.name').replace(/ /g,"_");//No I18N
		sendObj.defaultOptions.hideExcel=true;
					sendObj.defaultOptions.hideCSV=true;
					sendObj.defaultOptions.Search=false;
		//sendObj.nfaCustomPagerDetails={}
		sendObj.defaultOptions.gridCallBack = gridCallBack;
		sendObj.defaultOptions.gridCallBackParams={self:self};
		//sendObj.delayRender = self.get('params.index')*50;//No I18N

		setTimeout(function(){
			self.setProperties({'showGrid':true,'gridData':sendObj});//NO I18N
			self.set('graphParams',graphParams);//NO I18N
		},graphParams.delayRenders);

		}
		});
	},
	actions:{
			refreshHardwarewidget:function() {
				this.set('graphParams',false);//NO I18N
				this.set('refreshWidget',true);//NO I18N
				this.refreshContent();
			},
			expandCollapse: function(widgetname){
				var params = this.get('params');
				openPerformanceMonEnhancedGraph(params.selected,params.name,'hardware',true,params.displayName,'','','',{paramsList:params.selectedList,selectedParam:params.selected});//No I18N
			}
		},
		paramsselectedObserver: function(){
				this.set('graphParams',false);//NO I18N
				this.refreshContent();
		}.observes('params.selected'),//NO I18N
		paramsObserver: function(){
				this.set('params.titleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
			this.set('graphParams',false);//NO I18N
			this.set('params.expandClassName','gridStack-innerFullCol');//NO I18N
		this.set('params.isExpand',false);//NO I18N
			this.refreshContent();
		}.observes('params').on('init'),//NO I18N
	didInsertElement: function(){


	},
	willDestroyElement:function() {
							$( "body" ).removeClass( "inventoryHardwareWidgetExpand" );
					this.set('params.expandClassName','gridStack-innerFullCol');//NO I18N

		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmxenPoolSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-xenpool-summary",//NO I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true){
			this.set('widgetData.sizey',8); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',13); //No I18N
		}
	},
	actions:{
		redirectToDeviceSnapshot: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.masterMo,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmSnapshotSummarycolComponent = Ember.Component.extend({
	templateName: "components/opm-snapshot-summarycol",//NO I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		var apiData = widgetData.apiData;

		// Define the desired order of keys manually
		var orderedKeys = [
			"container_name",//No I18n
			"vm_name",//No I18n
			"host_name",//No I18n
			"cluster_name",//No I18n
			"parent_display_name",//No I18n
			"state",//No I18n
			"status",//No I18n
			"type",//No I18n
			"os_type",//No I18n
			"version",//No I18n
			"kversion",//No I18n
			"bootMode",//No I18n
			"cpu",//No I18n
			"cpu_model",//No I18n
			"cpu_socket",//No I18n
			"cpu_cores",//No I18n
			"cpu_count",//No I18n
			"cpu_speed",//No I18n
			"max_memory",//No I18n
			"max_disk",//No I18n
			"tools_installed",//No I18n
			"balloonMemory",//No I18n
			"swapTotal",//No I18n
			"running-machine",//No I18n
			"corosyncVersion",//No I18n
			"unique_id", //No I18n
			"last_updated_time" //No I18n
		];

		// Map display names for each key
		var displayNameMap = {
			"host_name": Ember.I18n.t("opstor.inventory.ibmtssvc.node.name"),//No I18n
			"parent_display_name": Ember.I18n.t("webclient.vmware.clustername"),//No I18n
			"status": Ember.I18n.t("webclient.common.operationstatus"),//No I18n
			"state": Ember.I18n.t("webclient.support.thread.state"),//No I18n
			"type": Ember.I18n.t("webclient.devices.details.type"),//No I18n
			"version": Ember.I18n.t("webclient.topo.version"),//No I18n
			"kversion": Ember.I18n.t("opstor.inventory.kernel.version"),//No I18n
			"bootMode": Ember.I18n.t("webclient.opm.device.proxmox.bootMode"),//No I18n
			"cpu_model": Ember.I18n.t("webclient.hyperv.cpumodel"),//No I18n
			"cpu_socket": Ember.I18n.t("webclient.opm.device.proxmox.cpusocket"),//No I18n
			"cpu_cores": Ember.I18n.t("webclient.vimonitor.snapshot.details.cpucores"),//No I18n
			"cpu_count": Ember.I18n.t("webclient.devices.ucs.cpucount"),//No I18n
			"cpu_speed": Ember.I18n.t("webclient.vmware.cpuspeed"),//No I18n
			"max_memory": Ember.I18n.t("webclient.opm.device.proxmox.maxmemmb"),//No I18n
			"max_disk": Ember.I18n.t("webclient.opm.device.proxmox.maxdiskmb"),//No I18n
			"swapTotal": Ember.I18n.t("webclient.opm.device.proxmox.swaptotalmb"),//No I18n
			"container_name": Ember.I18n.t("webclient.opm.device.proxmox.containername"),//No I18n
			"os_type": Ember.I18n.t("webclient.addServer.ostype"),//No I18n
			"balloonMemory": Ember.I18n.t("webclient.opm.device.proxmox.balloonmem"),//No I18n
			"running-machine": Ember.I18n.t("webclient.admin.probes.machineName"),//No I18n
			"vm_name": Ember.I18n.t("webclient.nutanix.vmname"),//No I18n
			"cluster_name": Ember.I18n.t("webclient.vmware.clustername"),//No I18n
			"corosyncVersion": Ember.I18n.t("webclient.opm.device.proxmox.corosyncVersion"),//No I18n
			"tools_installed": Ember.I18n.t("webclient.opm.device.proxmox.qemuguestagent"), //No I18n
			"cpu": Ember.I18n.t("webclient.vimonitor.devices.snapshot.cpu"),//No I18n
			"unique_id": Ember.I18n.t("webclient.reports.datacollection.pollid"),//No I18n
			"last_updated_time": Ember.I18n.t("webclient.fwa.devgroup.updated.time")//No I18n
		};

		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType === "Proxmox-VM") {
			displayNameMap.unique_id = Ember.I18n.t("webclient.opm.device.proxmox.vmid");//No I18N
		}

		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType === "Proxmox-Node") {
			delete apiData.unique_id;
		}

		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType === "Proxmox-Container") {
			displayNameMap.unique_id = Ember.I18n.t("webclient.opm.device.proxmox.containerid");//No I18N
			displayNameMap.max_disk = Ember.I18n.t("webclient.opm.device.proxmox.containerrootsize");//No I18N
		}

		// Redirecting link property for entries
		var linkMap = {
			host_name: apiData.host_mo_name,
			cluster_name: apiData.cluster_name,
			parent_display_name: apiData.parent_mo_name
		};

		//To Check if its a Proxmox Cluster
		if(apiData.unique_id && apiData.corosyncVersion) {
			delete apiData.unique_id;
			delete linkMap.cluster_name;
		}

		var colData = [];
		orderedKeys.forEach(function(key) {
			if(apiData.hasOwnProperty(key + "_str")) {
				colData.push({
					displayName: displayNameMap[key] || key,
					value: apiData[key],
					capsule: "capsule-status gridCapsule capsule-" + apiData[key + "_str"] //NO I18n
				});
			} else if (apiData.hasOwnProperty(key)) {
				colData.push({
					displayName: displayNameMap[key] || key,
					value: apiData[key],
					linkMap: linkMap[key] || false
				});
			}
		});

		this.set('widgetData.sizey', colData.length + 8); //No I18N
		this.set("objPairs", colData);//No I18n
	},
	actions:{
		redirectToDeviceSnapshot: function(redirectValue){
			redirectToDeviceSnapshot(redirectValue);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmChildSummaryComponent = Ember.Component.extend({
	templateName: "components/child-summary",//NO I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		var apiData = widgetData.apiData;
		this.set('childSummary', apiData); //No I18N
	}
})

OPMClient.OpmTimeLineComponent = Ember.Component.extend({
	templateName: "components/opm-time-line",//No I18N
	didInsertElement: function(){
		var self =this;
		var id = "widgetTimeline_innerDiv" + this.widgetData.indexCount;//No I18N
		var jsonData = this.get('widgetData.apiData');//No I18N
		var currentWidgetData = this.widgetData;
		$('#widgetTimeline_innerDiv').attr("id", id);
		this.set('widgetData.noData',false);//No I18N
		this.set('widgetData.isIPSLATimeFrame',false);//No I18N
		this.set('widgetData.sizey',2);//No I18N
		var callBackFunc = function(){
  			id = '#content-'+self.widgetData.indexCount + " .opmTimeLine";//No I18N
  			var height = $(id).height()+30;
  			var cellCount = Math.ceil((height+10)/(self.snapshotObj.snapDetails.yScale+10));
  			if(window.OPM.isNewSnapshotPage){
  				cellCount = Math.ceil((height+42)/22);
  			}
  			self.set('widgetData.sizey',cellCount); //No I18N
  			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
		}
		if(!currentWidgetData.ondemandWidget )
		{
			if(jsonData.showTimeSubTitle) {
				this.set('widgetData.isIPSLATimeFrame',true);//No I18N
				this.set('widgetData.timeframe',jsonData.timeframeDisp);//No I18N
			}
			if(jsonData.callPerfDetails)
			{
				opm_loadVoipPerformanceByLocation(jsonData,id,callBackFunc);
			}
			else if(!currentWidgetData.ondemandWidget)
			{
				this.set('widgetData.noData',true);//No I18N
				this.set('widgetData.sizey',2);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
			}
		}

	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmGridSLAComponent = Ember.Component.extend({
	templateName: "components/opm-grid-s-l-a",//No I18N
	didInsertElement: function(){
		var self =this;
		var currentWidgetData = this.widgetData;
		var id = "widgetgridsla_innerDiv" + this.widgetData.indexCount;//No I18N
		$('#widgetgridsla_innerDiv').attr("id", id);
		this.set('widgetData.noData',false);//No I18N
		var widgetData = this.get('widgetData.apiData');
		this.set('widgetData.isIPSLATimeFrame',false);//No I18N
		this.set('widgetData.sizey',2);//No I18N
		var callBackFunc = function(){
			var id = "#widgetgridsla_innerDiv" + self.widgetData.indexCount;//No I18N
  			var height = $(id).height()+30;
  			var cellCount = Math.ceil((height+10)/(self.snapshotObj.snapDetails.yScale+10));
  			if(window.OPM.isNewSnapshotPage){
  				cellCount = Math.ceil((height+42)/22);
  			}
  			self.set('widgetData.sizey',cellCount); //No I18N
  			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
		}
		if(!currentWidgetData.ondemandWidget )
		{
			if(widgetData.showTimeSubTitle) {
				this.set('widgetData.isIPSLATimeFrame',true);//No I18N
				this.set('widgetData.timeframe',widgetData.timeframeDisp);//No I18N
			}
			if(widgetData)
			{
			   GridSLASnapshot(id,widgetData,callBackFunc);
			}
			else
			{
				this.set('widgetData.noData',true);//No I18N
				this.set('widgetData.sizey',2);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmxenPoolDialsComponent = Ember.Component.extend({
	templateName: "components/opm-xenpool-dials",//NO I18N
	dataArray:[],
	snapIDDiv:'',
	showPage:false,
	didInsertElement: function(){
		var widgetData = this.widgetData;
		this.dataArray=[];
		for(var i=0; i<Object.keys(widgetData.apiData).length;i++){
			this.dataArray.push({key:Object.keys(widgetData.apiData)[i],value:widgetData.apiData[Object.keys(widgetData.apiData)[i]],divID:'opm_'+widgetData.snapid+i});
		}
		this.setProperties({'showPage':true});//NO I18N
		var widgetData = this.get('widgetData');
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true && !window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',8); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',(this.get("snapshotObj.snapDetails.snapshotName")==="virtualDatastore")?16:13); //No I18N
		}

	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDatastoreSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-datastore-summary",//NO I18N
	didInsertElement: function(){
		if(this.widgetData.reloadWidget!==undefined && this.widgetData.reloadWidget===true && !window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',8); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		var adjustedHeight = $('.com_SummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-70;//No I18N
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',16); //No I18N
			adjustedHeight = snapHeightCalculation[16]-70;//No I18N
		}
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',setHeight:adjustedHeight,scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	actions:{
		redirectToDeviceSnapshot: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.VCENTERNAME,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDialComponent = Ember.Component.extend({
templateName: "components/opm-dial", //NO I18N
	didInsertElement:function() {
		this.set('dialData.unit','%');//NO I18N
		var jsonData = this.get('widgetData.apiData');//NO I18N
		var isTenantSnap = false;
		if(jsonData && !(Object.keys(jsonData).length === 0))
		{
			var value =  jsonData.DatabaseUsedSpacePercen ? jsonData.DatabaseUsedSpacePercen : 0;
			if(jsonData.tenantInfo !== undefined && jsonData.tenantInfo.healthScore !== undefined)
			{
				value = jsonData.tenantInfo.healthScore ? jsonData.tenantInfo.healthScore : 0;
				isTenantSnap = true;
			}
			value = parseInt(value);
			this.set('dialData.value',value);//NO I18N
			this.set('widgetData.subHeader',true);//No I18N
			if(jsonData.filePath)
			{
				this.set('widgetData.infoText','[ '+jsonData.filePath+' ]');//No I18N
			}
			opm_drawDialChart('adStoreDial',value,'#76d284');//No I18N
			this.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?12:6);//NO I18N
			if(isTenantSnap)
			{
				this.set('widgetData.sizey',13);//No I18N
			}
			this.set('dialData.isTenantSnap',isTenantSnap);//NO I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
		  	this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		else
		{
			this.set('widgetData.noData',true);	 //No I18N
		}
	},
	Initialize: function(){
		var dialData = {"id":"adStoreDial"}; //No I18n
		this.set('dialData',dialData);//NO I18N
		if(this.widgetData !== undefined && this.widgetData.name === "widget.header.healthscore")
		{
			this.set('dialData.isTenantSnap',true);//NO I18N
		}
	}.on('init')//NO I18N
});
OPMClient.OpmExchangeSnapshotMonitorWidgetComponent = Ember.Component.extend({
	templateName: "components/opm-exchange-snapshot-monitor-widget", //NO I18N
	didInsertElement:function() {
	},
	actions:{
		refreshWidget: function(){
			var self =this;
			self.setProperties({'showGrid':false});//NO I18N
			//self.setProperties({'refreshWidget':true});//NO I18N
			this.refreshContent();
		},
		expandCollapse: function(){
			var parentId = '#widgetElement_'+this.get('widgetData').id;//NO I18N
				if(this.get('params').isExpand)
				{
									this.set('params.titleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
					this.set('params.expandClassName','gridStack-innerFullCol');//NO I18N
					this.set('params.isExpand',false);//NO I18N
					$( "body" ).removeClass( "inventoryHardwareWidgetExpand" );
					this.set('showGrid',false);//NO I18N
					$(parentId).removeClass('inventoryHardwareWidgetParentExpand');//NO I18N
					this.refreshContent();
				}
				else
				{
														this.set('params.titleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N

					this.set('params.expandClassName','gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable exchangeExpand');//NO I18N
					this.set('params.isExpand',true);//NO I18N
					$( "body" ).addClass( "inventoryHardwareWidgetExpand" );
					this.set('showGrid',false);//NO I18N
					$(parentId).addClass('inventoryHardwareWidgetParentExpand');//NO I18N
					this.refreshContent();
				}

			},
			addMonitor: function(){
					var params = {"applicationName":"Exchange","monitorType":this.get('params').monitorName};//NO I18N
					params.displayName=this.get('params').displayName;
					params.name=this.get('params').monitorName;
					params.WidgetInfo=this;
					opm_transitionToParentRoute("Inventory.Device.ADMonitors",params);//NO I18N
			}

	},
	refreshContent:function()
	{
		var self =this;
		var params = self.get('params');
		var ajaxRequestUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + '/v2/device/getExchangeWidgetDetails?monitorType='+params.monitorName+'&deviceName='+OPMClient.InventoryDeviceDetailsController.deviceName,OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			dataType: 'json',//No I18N
			type: 'GET',//No I18N
			async: true,
			self:self,
			success: function(response) {
				var gridCallBack = function(gridID,paramsObj){
					var gridH = $('#gbox_'+gridID.replace('#','')).height()+300 + 1500;
					var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
					if(window.OPM.isNewSnapshotPage){
						setTimeout(function(){
							gridH = $('#'+paramsObj.self.widgetData.widgetElementID+' > div > div')[0].scrollHeight;//No I18N
							cellCount = Math.ceil(gridH/22);
							paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
						},0);
					}
					paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//NO I18N
				}
				var pageWidth = $('.content.singleInvWidget').width()/2;
				var colNames = [
					Ember.I18n.t('opmanagerclient.menu.framemenu.Name',this),//No I18N
					Ember.I18n.t('webclient.snapshot.testlinks.oid',this),//No I18N
					Ember.I18n.t('webclient.inventory.policyname',this),//No I18N
					Ember.I18n.t('webclient.map.gmap.status',this),//No I18N
					Ember.I18n.t('webclient.report.hardware.value',this),//No I18N
					""//No I18N
				 ];
				var	colModels= [
					{name:'displayName',index:'displayName',classes: "pointer"}, //No I18N
					{name:'oid',index:'oid', hidden:true,classes: "pointer"}, //No I18N
					{name:'policyName',index:'policyName', hidden:true,classes: "pointer"}, //No I18N
					{name:'thresholdStatus',index:'thresholdStatus',formatter:setThresholdColor,classes: "pointer"}, //No I18N
					{name:'value',index:'value',classes: "pointer"}, //No I18N
					{name:'statusStr',index:'statusStr', hidden:true,classes: "pointer"} //No I18N
	   			];
				var defaultOptions = {"sortName":"displayName","sortOrder":"asc"};//No I18N
				var returndata = {};
				returndata.colNames= colNames;
				returndata.onSelectFunction= "AdExMssqlMonitors";//No I18N
				returndata.colModels= colModels;
				returndata.defaultOptions= defaultOptions;
				returndata.defaultOptions.gridCallBack = gridCallBack;
				returndata.defaultOptions.gridCallBackParams={self:self};
				returndata.gridId= params.monitorName.replace(/\./g, "_").replace(/&/g, "_");//NO I18N
				returndata.data = [];
				if(response.length > 0)
				{
					returndata.data= response[0] ? response[0] : [];
				}
				//returndata.delayRender = params.delayRender > 2 ? params.delayRender: undefined;
				// if(self.get('refreshWidget') == true)
				// {
				// 	returndata.delayRender = undefined;
				// 	self.setProperties({'refreshWidget':false});//NO I18Nss

				// }
				returndata.className ="opm_jqGridUI";
				params.gridData ={};
				params.gridData =returndata;
				params.showGrid=true;
				if(params.delayRenders)
				{
					setTimeout(function(){self.setProperties({'showGrid':true,'gridData':returndata});},params.delayRenders);
				}
				else
				{
					self.setProperties({'showGrid':true,'gridData':returndata});//NO I18N
				}
			}
		});

	},
	GridInitialize: function(){
		this.set('params.expandClassName','gridStack-innerFullCol');//NO I18N
									this.set('params.titleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
		this.refreshContent();
		}.on('init'),//NO I18N
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmADTopBandComponent = Ember.Component.extend({
	templateName: "components/opm-a-d-top-band", //NO I18N
	didInsertElement:function() {
		var jsonData = this.get('widgetData.apiData');//NO I18N
		var currentWidgetData = this.widgetData;
		var snapId = currentWidgetData.id;
		this.set('widgetData.sizey',0);//NO I18N
		var widgetElement=$('div[data-widget-id="' + snapId + '"]');//NO I18N
		$("#content-"+currentWidgetData.indexCount).siblings().first().remove();	//NO I18N
		$("#content-"+currentWidgetData.indexCount).removeClass("content");
	},
	Initialize: function(){
		var data = this.get('widgetData.apiData');//NO I18N
		var summary = {};
		summary.promblems = data.ADStatus.numberOfAlarms;
		var obj =data.ADProps;
		var versNum = (obj.versionNumber !== "NA" ? "("+obj.versionNumber+")": "");//No I18N
		var InfoTxt = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.type+" "+(obj.servicePack !== "NA" ? ", "+obj.servicePack : "")+versNum;//No I18N
		summary.InfoTxt = InfoTxt;
		summary.applicationName = data.ADStatus.applicationName;
		var masters = ["ridMaster","schemaMaster","pdcEmulator","infrastructureMaster","domainNamingMaster"];//No I18N
		$.each(masters,function(key,value)
		{
			var Statusclass = value + "Class";//No I18N
			var spanValue = value + "spanValue";//No I18N
			summary[Statusclass] = '';
			var val =obj[value];
			if(val === "YES")
			{
				summary[Statusclass] = "icon-status5";//No I18N
			}
			else if(val === "NA")
			{
				summary[Statusclass] = '';	//No I18N
				summary[spanValue]= val;
			}
			else
			{
				summary[Statusclass] = "icon-status1";//No I18N
			}
		});
				this.setProperties({'summary':summary});//NO I18N

	}.on('init'),//NO I18N
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmExchangeSnapshotComponent = Ember.Component.extend({
	templateName: "components/opm-exchange-widgets", //NO I18N
	classNames:["grid-stack-exchange"],//No I18N
	showGrid: false,
	didInsertElement:function() {
		var reload = true;
		var shortSummary = false;
		var self = this;
		var jsonData = this.get('widgetData.apiData');//NO I18N
		var currentWidgetData = this.widgetData;
		var snapId = currentWidgetData.id;
		var widgetElement=$('div[data-widget-id="' + snapId + '"]');//NO I18N
		widgetElement.addClass("dashboardWidget fullCol");
		$("#content-"+currentWidgetData.indexCount).siblings().first().remove();	//NO I18N
		$("#content-"+currentWidgetData.indexCount).removeClass("content");
	},
	GridInitialize: function(){
				var self = this;
		var ExchangeMonitors = {};
		ExchangeMonitors.left = [];
		ExchangeMonitors.right = [];
		var response = self.get('widgetData.apiData');//NO I18N
		OPMClient.InventoryDeviceDetailsController.PublicStoreLocations=response.PublicStoreLocations;
		OPMClient.InventoryDeviceDetailsController.MailboxStoreLocations=response.MailboxStoreLocations;
		var delayRenders = [10,10,18,19,19,20,21,32];
		$.each(response.ExchangeMonitorNames,function(i,value)
		{
			if( i < (response.ExchangeMonitorNames.length/2))
			{
				var j = ExchangeMonitors.left.length;
				if(j==0)
				{
					value.delayRenders =  delayRenders[j];
				}
				else if(j<7)
				{
					value.delayRenders = delayRenders[j];
				}
				else
				{
					value.delayRenders = 32;
				}
				ExchangeMonitors.left.push(value);
			}
			else
			{
				var j = ExchangeMonitors.left.length;
				if(j==0)
				{
					value.delayRenders =  delayRenders[j];
				}
				else if(j<7)
				{
					value.delayRenders = delayRenders[j];
				}
				else
				{
					value.delayRenders = 32;
				}
				ExchangeMonitors.right.push(value);
			}
		});
		self.setProperties({'ExchangeMonitors':ExchangeMonitors});//NO I18N
		}.on('init'),//NO I18N
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmRouterSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-router-summary",//NO I18N
	showRouterPage:false,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(jsonData!==null && self!==undefined && self!==null){
			if(jsonData.dataset!=undefined)
			{
				for (var index = 0; index < jsonData.dataset.length; index++) {
					var array_element = jsonData.dataset[index];
					if(array_element.seriesname.indexOf(".") != -1) {
						array_element.seriesname=Ember.I18n.t(array_element.seriesname, this);
					}
				}
			}
			var chartObj = {
				id : "perfGraph1"+currentWidgetData.snapid, //No I18N
				type : 'area', //No I18N
				jsonData : jsonData.nfadetails.devTraffic,
				series : "multi", //No I18N
				height : 250,
				columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Traffic", timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)}, //No I18N
				legend : {
					"colorBox": { //No I18N
			            "shape": "circle", //No I18N
			            "strokeOpacity": 1 //No I18N
			        },
			        "fontFamily": "'LatoRegular'", //No I18N
			        "fontSize": 16, //No I18N
					"hAlign": "right", //No I18N
					"vAlign": "top" //No I18N
				},
				"axes": { //No I18N
					"rotated": false, //No I18N
					"xaxis": { //No I18N
						"label": { //No I18N
							"text": "" //No I18N
						}
					},
					"yaxis": [ //No I18N
						{
							"label": { //No I18N
								"text": jsonData.YAxis //No I18N
							}
						}
					]
				},
				chart : {
					stacked : true
				}
			}
			jsonData.chartObj = chartObj;
			self.setProperties({showRouterPage:true,jsonData:jsonData});
		}
		else{
			if(self!==undefined && self!==null){
				self.set('showRouterPage',false); //NO I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmSummaryDetailsComponent = Ember.Component.extend({
	classNames:['com_SummaryDetails'],
	dualStatusIcon: function(){
		var statusNum = this.get('jsonData.statusNum') !== undefined ? this.get('jsonData.statusNum') : this.get('snapshotObj.statusNum');
		var state = this.get('jsonData.state') !== undefined ? this.get('jsonData.state') : this.get('snapshotObj.state');
		if(window.OPM.isNewStatusPropagation && state !== undefined) {
			var availClass = opm_getStateCls(state);
			return '--fault-severity icon-status --dual-status status-' + statusNum + ' ' + availClass;//No I18N
		}
		return '--fault-severity icon-status';//No I18N
	}.property('jsonData.statusNum', 'jsonData.state', 'snapshotObj.statusNum', 'snapshotObj.state'), //No I18N
	didInsertElement: function(){
		var hardwareDetails = this.get("snapshotObj");

		if(hardwareDetails)
		{
			var status;
			if(hardwareDetails.ISHWMONITORED)
			{
				$("#hardwarestatusIcon").attr("class","");
				$("#hardwarestatusIcon").attr("class","icon-status5");
				status = "Disable";//No I18N
				$("#Hwstatus").text(Ember.I18n.t('webclient.fwa.snmp.disable.now',this));//No I18N
			}
			else
			{
				$("#hardwarestatusIcon").attr("class","icon-status1");
				status = "Enable";//No I18N
				$("#Hwstatus").text(Ember.I18n.t('ncm.device.summary.enablenow',this));//No I18N
			}
			$("#Hwstatus").val(status);
		}
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_SummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
    //Copying permissions from FWA Device summary component
		if(this.jsonData && this.jsonData.fwadetails && this.jsonData.fwadetails.type) {
			var deviceRuleReadPermission=(window.isoperator || window.OPM.userPermissions.ruleManagementRead ||  window.OPM.userPermissions.fwaComplianceRead)
			var deviceRuleWritePermission=(window.isoperator || window.OPM.userPermissions.ruleManagementWrite ||  window.OPM.userPermissions.fwaComplianceWrite)
			var centralEdition = (window.OPM.isFWAServer || window.OPM.isCentralServer);
			this.set('controller.userPermissions.centralEdition',centralEdition);//No I18N
			this.set('controller.userPermissions.deviceRuleReadPermission',deviceRuleReadPermission);//No I18N
			this.set('controller.userPermissions.deviceRuleWritePermission',deviceRuleWritePermission);//No I18N
		}
		//Set openFw device flag
		OPMClient.InventoryDeviceDetailsController.set("isOpenFWDevice", this.jsonData ? this.jsonData.opmdetails ? this.jsonData.opmdetails.isOpenFWDevice : false : false); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("isConfFWDevice", this.jsonData ? this.jsonData.opmdetails ? this.jsonData.opmdetails.isConfFWDevice : false : false); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("isCelona", this.jsonData ? this.jsonData.opmdetails ? this.jsonData.opmdetails.isCelona : true : false); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("isSDWANDevice", this.jsonData ? this.jsonData.opmdetails ? this.jsonData.opmdetails.isSDWANDevice==="true" : true : false); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("parentSdwanMoid",this.jsonData.opmdetails.sdwanMOID); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("isArubaCentral", this.jsonData ? this.jsonData.type === "HPE Aruba Central SD-WAN" : false); //No I18N
		if(this.jsonData.type==="HPE Aruba Central SD-WAN" || this.jsonData.type==="Cambium cnMaestro" || this.jsonData.type==="Prisma SD-WAN" || this.jsonData.type==="Versa Networks"){
			OPMClient.InventoryDeviceDetailsController.set("isOAuthSDWAN", true); //No I18N
		}else{
			OPMClient.InventoryDeviceDetailsController.set("isOAuthSDWAN", false); //No I18N
		}
		if(hardwareDetails.isPoEEnabled){
			OPMClient.InventoryOpUtilsController.set('isPoESwitch',true);//No I18N 
		}
	},
	scrollObserver:function(){
		var adjustedHeight = this.get('adjustedHeight');//No I18N
		if(adjustedHeight!==undefined){
			adjustedHeight = snapHeightCalculation[this.get('adjustedHeight')]-(window.OPM.showCustomFieldsInSummaryWidget?50:70);//No I18N
			$(this.element).find('.DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({//No I18N
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}
	}.observes('adjustedHeight'),//No I18N
	willDestroyElement: function(){
		OPMClient.InventoryDeviceDetailsController.set("isOpenFWDevice",false); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("isConfFWDevice",false); //No I18N
		$(this.element).find('.DIGmCustomScroll > div').mCustomScrollbar('destroy');
		$('#'+this.elementId).find('*').remove();
	},
	actions:{
		changeDevicePasswordDetails: function(){
			if(!OPMClient.InventoryDeviceDetailsController.isOpm_MerakiSnapshot && !OPMClient.InventoryDeviceDetailsController.isCelona && !OPMClient.InventoryDeviceDetailsController.isArubaCentral && !OPMClient.InventoryDeviceDetailsController.isOAuthSDWAN){
				changeDevicePasswordDetails();
				opmUserStats('snapshot_changeCredential');//No I18N
			}else if(OPMClient.InventoryDeviceDetailsController.isArubaCentral || OPMClient.InventoryDeviceDetailsController.isOAuthSDWAN){
				opm_transitionToParentRoute('Inventory.Device.ArubaCentralOAuth'); //No I18N
			}else{
				opm_transitionToParentRoute('Inventory.Device.TestAPIkey'); //No I18N
			}

		},
		redirectToParentDevice: function(deviceName)
		{
		    location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+deviceName; //No I18N
		},
		redirectToParentController: function(snapObj)
		{
			redirectToDeviceSnapshot(this.jsonData.opmdetails.controllerName,'','MonitoringDevice');
		},
		redirectToSDWANParentController: function(snapObj)
		{
			redirectToDeviceSnapshot(this.jsonData.opmdetails.sdwanControllerMoName,'','MonitoringDevice');
		},
		syncAndRediscoverDevice: function(snapObj){
			OPMClient.InventoryDeviceDetailsController.set('isSyncRediscovery',true); //No I18N
			redirectSnapShot('ReDiscoverDevice',snapObj.snapType,snapObj.deviceName); //No I18N
		},
		summaryEdit: function(snapObj){
			redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
		},
		redirectToParentOrg: function(snapObj)
		{
			redirectToDeviceSnapshot(this.jsonData.opmdetails.organisationMOName,'','MonitoringDevice');
		},
		editCustomTypeName: function() {
			$('#showDevType').hide();
			$('#editDevType').show();
			$('#editDevType').addClass('flex');//No I18N
			$('#devTypeValue').val($('#devTypeName').text());
			$('#devTypeValue').focus();
		},
		saveCustomTypeName: function(snapObj){
			var self = this;
			var dtName = $('#devTypeValue').val();
			if(dtName===undefined || dtName===null || dtName==="" || dtName===" " || dtName==="null"){
				$('#devTypeValue').addClass('validateField error');//No I18N
				$('#devTypeValue').attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
				$('#devTypeValue').focus();
				opmValidate($('#devTypeValue'));
			}else if(!opm_isValidDTName(dtName)){
				$('#devTypeValue').addClass('validateField error');//No I18N
				$('#devTypeValue').attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
				$('#devTypeValue').focus();
				opmValidate($('#devTypeValue'));
			}
			else{
				var callBackFn = function()
				{
					var data= {'deviceType':dtName,'deviceTypeID':snapObj.deviceTypeID};//No I18N
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/updateCustomDeviceTemplateName",data)//No I18N
					showMessage(response);
					if(response.error === undefined){
						$('#deviceTypeTile').text(dtName);
						opm_transitionToParentRoute("Inventory.Device",snapObj.deviceName);//No I18N
						for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
							if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
								OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
							}
						}
					}
				};
				var cancelCallBackFn = function() {
					self.send('cancelCustomTypeName'); //No I18n
				}
				opmConfirm(Ember.I18n.t('webclient.agent.confirm'),Ember.I18n.t('opm.devsnap.type.edit.confirm'),'',callBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.yes'),cancelCallBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'hideCloseInUIDIalog',false,false);//No I18N
			}
		},
		cancelCustomTypeName: function() { 
			$('#showDevType').show();
			$('#editDevType').hide();
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			$('#editDevType').removeClass('flex');//No I18N
			$('#devTypeName').text($('#deviceTypeTile').text());
		},
		redirectToDependencyDevice: function()
		{
			var entity = this.jsonData.opmdetails.UpLinkDependency;
			if(entity.indexOf("wanlinkmonitor") > -1){
				redirectWanLinkSnapshot(entity);
			}else if(entity.indexOf("wanlinksite") > -1){
				redirectWanSiteSnapshot(entity);
			}	
			else{
				redirectToDeviceSnapshot(entity,'','MonitoringDevice');//No I18N
			}	
		},
		redirectSnapshot: function(deviceName){
			redirectSnapShot('',"MonitoringDevice",deviceName);//No I18N
		},
		redirectToSnapshot:function(type, devName) {
			redirectToSnapshot(type, devName);
		},
		openDiffcompareTo:function(leftVersion, rightversion, isBaselineRunning, header)
		{
			OPMClient.InventoryNCMActionController.openConfigDiffNewWithParameters(leftVersion, rightversion);
		},
		editFWADeviceRuleSnapshot: function(resName){
			var content = this.get('snapshotObj');
			OPMClient.InventoryFWAController.editDeviceID=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryFWAController.editDeviceDDID=content.DDID;
			OPMClient.InventoryFWAController.selDeviceName=resName ? resName : content.resName;
			OPMClient.InventoryFWAController.selDeviceDispName=content.deviceDispName; 
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWADeviceRule"; //No I18N
		},
		ncmBackupConfig: function(ncmDeviceID) {
			OPMClient.Inventory.ncmBackupConfig(ncmDeviceID);
		}
	}
});
OPMClient.OpmAvailabilityTimelineComponent = Ember.Component.extend({
	didInsertElement: function(){
		var availData = this.get('availabilityData');
		var timeZone = this.get('timeZone');
		var timeFormat = this.get('timeFormat');
		var defaultOptions={colorScale:colorScale, onSelectEnabled:true,timeZone:timeZone,timFormat:timeFormat};
		if(availData!==undefined){
			opm_drawAvailabilityTimeLine("#statusInfo",availData,defaultOptions);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('.DIGG-Time').remove();
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmAssociatedDialsComponent = Ember.Component.extend({
	templateName: "components/opm-associated-dials",
	classNames:['customDials'],
	holderId:'',
	jsonData:{},
	showPage:true,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		self.set('holderId','snapHolder_'+currentWidgetData.snapid);
		self.set('widgetData.apiDataArray',[]);
		var jsonData = this.get('widgetData.apiData');
		var cellCount = Math.ceil(Math.ceil(jsonData.length/2)*6.5);
		if(cellCount<=2 || cellCount.toString()==="NaN"){
			cellCount=2;
		}
		if(cellCount===2 && self.get('widgetData.ondemandWidget')!==true){
			self.set('widgetData.noData',true);	 //No I18N
		}
		else{
			self.set('widgetData.noData',false);		//No I18N
			if(window.OPM.isNewSnapshotPage){
				cellCount = (Math.ceil(jsonData.length/2)*10)+3
			}
		}
		self.set('widgetData.sizey',cellCount); //No I18n
		self.set('isAvailabilityNode',self.snapshotObj.isAvailabilityNode); //No I18n
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);
		if(jsonData!==null && jsonData.length>0 && self!==undefined && self!==null){
			var dialClickFunc = function(params){
				//addDialClickEvent(params.dialDivName,params.pdName,params.pollKey);
				var index = params.pollKey;
				var pdName = decodeURIComponent(params.pdName);
				openPerformanceMonEnhancedGraph(((index !== undefined) ? index : pdName),pdName,false,true,params.displayName);
			};
			var dialEditFunc = function(params){
				getProcessStatistics(params);
			};
			var availDialClick = function(params){
				redirectSnapShot(params,self.snapshotObj.snapType,self.snapshotObj.deviceName);
			};
			var packetLossDialEditFunc = function(params){
				editResponseThreshold(params,'OpManagerDesktopObjectStatusPoll','stat','Packet_Loss',true); //No I18n
			};

			var responseDialEditFunc = function(params){
				editResponseThreshold(params,'OpManagerDesktopObjectStatusPoll','stat','Device',true); //No I18n
			};
			for(var i=0;i<jsonData.length;i++)
			{
				var dialEditParams = jsonData[i].DiagnosticName;
				jsonData[i].snapHolderId = "opm_"+currentWidgetData.snapid+"_"+jsonData[i].pollId+"_"+i;
				jsonData[i].dialEditEnabled = jsonData[i].diagnosticsEnabled;
				jsonData[i].dialEditFunc = dialEditFunc;
				jsonData[i].dialEditParams = dialEditParams;

				
				if(jsonData[i].dataType !== undefined && jsonData[i].dataType === "2")
				{
					jsonData[i].isStringMonitor = true;
					jsonData[i].unit = (jsonData[i].unit !== undefined && jsonData[i].unit === "U" ? "" : jsonData[i].unit);//No I18N
				}
				else{
					jsonData[i].isStringMonitor = false;	
				}


				if(jsonData[i].pdName === "availability" || jsonData[i].pdName === "responseTime" || jsonData[i].pdName === "packetLoss"){ //No I18n
					jsonData[i].iconTitle = jsonData[i].displayName;
				}else{
					jsonData[i].iconTitle = jsonData[i].displayName+" ("+jsonData[i].protocol+")";
				}
				jsonData[i].wIndex = i;
				jsonData[i].realTimeEnabled = false;
				var dialDivName = "opm_"+currentWidgetData.snapid+"_"+jsonData[i].pollId+"_"+jsonData[i].wIndex;//No I18N
				var dialValue = jsonData[i].value;
				if(Number(dialValue) < 0)
				{
					dialValue = 0;
				}
				else if(Number(dialValue) > 100)
				{
					dialValue = 100;
				}
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				$("#"+dialDivName).attr("value",jsonData[i].pollKey);
				var dialColor = statusColors[4];
				/*if(Math.round(dialValue) > 80)
				{
					dialColor = "#f37273"; //No I18N
				}
				else if(Math.round(dialValue) <=80 && Math.round(dialValue) > 60)
				{
					dialColor = "#f5c673"; //No I18N
				}
				else
				{
					dialColor = "#76d284"; //No I18N
				}*/
				if(jsonData[i].thresholdEnabled !== undefined && jsonData[i].thresholdEnabled === "true" && jsonData[i].dialType !== undefined && jsonData[i].dialType === "meter" )
				{
					var severity = jsonData[i].severity;
					if(severity !== undefined && severity == 1)
					{
						dialColor = statusColors[0];
					}
					else if(severity !== undefined && severity == 2)
					{
						dialColor = statusColors[1];
					}
					else if(severity !== undefined && severity == 3)
					{
						dialColor = statusColors[2];
					}
				}
				if(jsonData[i].pdName === "availability")
				{
					if(Math.round(dialValue) === 100)
					{
						dialColor = "#76d284"; //No I18N
					}	else if(Math.round(dialValue) > 80)
					{
						dialColor = "#f5c673"; //No I18N
					}
					else
					{
						dialColor = "#f37273"; //No I18N
					}
				}
				if(jsonData[i].pdName != "availability")
				{
					var graphPDName = jsonData[i].pdName;
					if(graphPDName.indexOf('\\') !== -1)
					{
						graphPDName=encodeURIComponent(graphPDName);
					}
					var dialClickParams = {dialDivName:dialDivName,pdName:graphPDName,pollKey:jsonData[i].pollKey,displayName:jsonData[i].iconTitle};
					jsonData[i].dialClickEnabled = true;
					jsonData[i].dialClickFunc = dialClickFunc;
					jsonData[i].dialClickParams=dialClickParams;
					//For Realtime Graphs for Dials
					var realTimeParams = {policyName:encodeURIComponent(jsonData[i].pollKey),pdName:encodeURIComponent(jsonData[i].pdName),monDisplayName:encodeURIComponent(jsonData[i].displayName),yaxis:jsonData[i].unit};
					if (self.snapshotObj.isAgentMonitoring == true || (self.snapshotObj.isTelemetry !== undefined && self.snapshotObj.isTelemetry) || jsonData[i].protocol === "DATA_INGESTION"){ 
						jsonData[i].realTimeEnabled = false;
					} else {
						jsonData[i].realTimeEnabled = true;
					}
					jsonData[i].realTimeParams = realTimeParams;
				}
				else{
					jsonData[i].dialClickEnabled = true;
					jsonData[i].dialClickFunc = availDialClick;
					jsonData[i].dialClickParams = "AvailabilityGraph";//No I18N
				}
				if(jsonData[i].pdName === "responseTime")
				{
					jsonData[i].dialEditEnabled = true;
					jsonData[i].dialEditFunc = responseDialEditFunc;
					jsonData[i].dialEditParams = this.get('snapshotObj.deviceName');
				}
				else if(jsonData[i].pdName === "packetLoss")
				{
					jsonData[i].dialEditEnabled = true;
					jsonData[i].dialEditFunc = packetLossDialEditFunc;
					jsonData[i].dialEditParams = this.get('snapshotObj.deviceName');
				}
				jsonData[i].dialDivName = dialDivName;
				jsonData[i].dialValue = dialValue;
				jsonData[i].dialColor = dialColor;
				jsonData[i].editTitle = (jsonData[i].diagnosticsEnabled)?Ember.I18n.t('webclient.snapshot.tooltip.procdiagnostics',this):'';
				self.get('widgetData.apiDataArray').pushObject(jsonData[i]);
			}
			//self.set('widgetData.apiDataArray',jsonData);
		}
		else{
			if(self!==undefined && self!==null){
				self.set('showPage',false);//No I18N
				if(currentWidgetData.ondemandWidget || window.isoperator){
					self.set('widgetData.sizey',2);//No I18N
				}else if(self.snapshotObj.statusNum === 7){
					self.setProperties({isDeviceNotReachable:true,'widgetData.sizey':(window.OPM.isNewSnapshotPage)?6:4,'widgetData.noData':false});//No I18N
				}else if(self.snapshotObj.type === "Unknown"){//No I18N
					self.setProperties({showAssoDTMsg:true,'widgetData.sizey':(window.OPM.isNewSnapshotPage)?5:3,'widgetData.noData':false});//No I18N
				}
				else{
					self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?14:8);//No I18N
				}
			}
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1);//No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);//No I18N
		}
		if(self.snapshotObj.isAvailabilityNode) {
			self.set('widgetData.sizey',13); //No I18n
		}
		//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
	},
	actions:{
		redirectToAssociate:function(){
			if(this.snapshotObj.type === "Unknown"){//No I18N
				opm_transitionToParentRoute("Inventory.Device.AssociateDT");//No I18N
			}else{
				opm_transitionToParentRoute("Inventory.Device.AssociateDials");//No I18N
			}
		},
		redirectToMonitors:function(){
			this.set('widgetData.expandView',false); //No I18N
			this.set('widgetData.gridClassName','grid-stack-item'); //No I18N
			OPMClient.InventoryDeviceDetailsController.expandSnapWidget = false;
			opm_transitionToParentRoute("Inventory.Device.Monitors");//No I18N
		},
		redirectToChangeCredential:function(){
			opm_transitionToParentRoute("Inventory.Device.ChangePassword");//No I18N
		},
		redirectToRediscoverDevice:function(){
			opm_transitionToParentRoute('Inventory.Device.ReDiscoverDevice');//No I18N	
		},
		convertToMonitoringDevice: function()
	    {
			convertLiteDeviceToMonitoringDevice();
	    }
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmIntfSummaryDialsComponent = Ember.Component.extend({
	templateName: "components/opm-summary-dials",
	classNames:['width100'],
	holderId:'',
	showPage:true,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = currentWidgetData.apiData;
		if(currentWidgetData.snapid!==undefined){
			self.set('holderId','snapHolder_'+currentWidgetData.snapid);
			self.set('widgetData.apiDataArray',[]);
			if(jsonData!==null && self!==undefined && self!==null){
				var jsonArr = [];
				var temp = {};
				jsonData.availability.Up = Math.ceil(jsonData.availability.Up);
				jsonData.txUtil = (jsonData.txUtil==="NA") ? "NA":Math.round(jsonData.txUtil); //No I18n
				jsonData.rxUtil = (jsonData.rxUtil==="NA") ? "NA":Math.round(jsonData.rxUtil); //No I18n

				if(jsonData.availability.Up == undefined || !opm_validateNumberVal(jsonData.availability.Up) || jsonData.availability.Up <0) {
					jsonData.availability.Up = 0;
				}
				else if(jsonData.availability.Up >100)
				{
					jsonData.availability.Up = 100;
				}

				if(jsonData.rxUtil == undefined || !opm_validateNumberVal(jsonData.rxUtil) || jsonData.rxUtil <0) {
					jsonData.rxUtil = 0;
				}
				else if(jsonData.rxUtil >100)
				{
					 jsonData.rxUtil =100
				}

				if(jsonData.txUtil == undefined || !opm_validateNumberVal(jsonData.txUtil) || jsonData.txUtil <0) {
					jsonData.txUtil = 0;
				}
				else if(jsonData.txUtil > 100)
				{
					jsonData.txUtil = 100;
				}
				//Availability Dial
				var availDialClick = function(params){
					redirectSnapShot(params,jsonData.snapType,jsonData.deviceName);
				};
				var dialValue = jsonData.availability.Up;
				var dialDivName = "opm_availabilityDial"; //No I18N
				var pollId = "availability"; //No I18N
				var dialColor = "#f37273";	//No I18N
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				$("#"+dialDivName).attr("value",dialValue);
				if(Math.round(dialValue) > 0)
				{
					dialColor = "#76d284"; //No I18N
				}
				temp.dialDivName = dialDivName;
				temp.dialValue = dialValue;
				temp.value = dialValue;
				temp.dialColor = dialColor;
				temp.dialType = 'meter';
				temp.snapHolderId = dialDivName;
				temp.iconTitle = Ember.I18n.t("webclient.devices.details.avail", this);
				temp.dialClickEnabled = true;
				temp.dialClickFunc = availDialClick;
				temp.dialClickParams = "AvailabilityGraph";// No I18N
				self.get('widgetData.apiDataArray').pushObject(temp);
				//RxUtil dial

				var rxDialClick = function(params){
					if(OPMClient.InventoryDeviceDetailsController.isWANIPInterfaceTab !== undefined && OPMClient.InventoryDeviceDetailsController.isWANIPInterfaceTab && self.snapshotObj !== undefined && self.snapshotObj.isWanLinkMonitoring !== undefined && self.snapshotObj.isWanLinkMonitoring){
						redirectToWanSnapShot("PerfGraph/"+'rxutilization'+"/"+'rxutilization','Link',self.snapshotObj.deviceName); // No I18N
					}else{
						openPerformanceMonEnhancedGraph('rxutilization','rxutilization',false,true,temp.iconTitle);// No I18N
					}

				};
				temp = {};
				var dialDivName = "opm_rxUtilDial"; //No I18N
				var pollId = "packetLoss"; //No I18N
				var dialValue = jsonData.rxUtil;
				var dialColor = "#76d284";	 //No I18N
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				if(Math.round(dialValue) > 80)
				{
					dialColor = "#f37273"; //No I18N
				}
				else if(Math.round(dialValue) <=80 && Math.round(dialValue) > 60)
				{
					dialColor = "#f5c673"; //No I18N
				}
				else
				{
					dialColor = "#76d284"; //No I18N
				}
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				$("#"+dialDivName).attr("value",dialValue);
				temp.dialDivName = dialDivName;
				temp.dialValue = dialValue;
				temp.value = dialValue;
				temp.dialColor = dialColor;
				temp.dialType = 'meter';
				temp.snapHolderId = dialDivName;
				temp.iconTitle = Ember.I18n.t("webclient.devices.details.rx", this);
				temp.dialClickEnabled = true;
				temp.dialClickFunc = rxDialClick;
				self.get('widgetData.apiDataArray').pushObject(temp);

				//TxUtil
				var txDialClick = function(params){
					if(OPMClient.InventoryDeviceDetailsController.isWANIPInterfaceTab !== undefined && OPMClient.InventoryDeviceDetailsController.isWANIPInterfaceTab && self.snapshotObj !== undefined && self.snapshotObj.isWanLinkMonitoring !== undefined && self.snapshotObj.isWanLinkMonitoring){
						redirectToWanSnapShot("PerfGraph/"+'txutilization'+"/"+'txutilization','Link',self.snapshotObj.deviceName); // No I18N
					}else{
						openPerformanceMonEnhancedGraph('txutilization','txutilization',false,true,temp.iconTitle);// No I18N
					}
				};
				temp = {};
				var dialDivName = "opm_txUtilDial"; //No I18N
				var pollId = "packetLoss"; //No I18N
				var dialValue = jsonData.txUtil;
				var dialColor = "#76d284";	 //No I18N
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				if(Math.round(dialValue) > 80)
				{
					dialColor = "#f37273"; //No I18N
				}
				else if(Math.round(dialValue) <=80 && Math.round(dialValue) > 60)
				{
					dialColor = "#f5c673"; //No I18N
				}
				else
				{
					dialColor = "#76d284"; //No I18N
				}
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				$("#"+dialDivName).attr("value",dialValue);
				temp.dialDivName = dialDivName;
				temp.dialValue = dialValue;
				temp.value = dialValue;
				temp.dialColor = dialColor;
				temp.dialType = 'meter';
				temp.snapHolderId = dialDivName;
				temp.iconTitle = Ember.I18n.t("webclient.devices.details.tx", this);
				temp.dialClickEnabled = true;
				temp.dialClickFunc = txDialClick;
				self.get('widgetData.apiDataArray').pushObject(temp);


				//self.set('widgetData.apiDataArray',jsonArr);
				$(".Summary .DIAC-block .DIACB").each(function(e){
		   	  	if($(this).find(".SpeedoMeter").length === 0)
		   	  	{
		   	  		$(this).parent().hide();
		   	  	}
		   	  	else
		   	  	{
		   	  		$(this).parent().show();
		   	  	}
				});
			}
			else{
				if(self!==undefined && self!==null){
					self.set('showPage',false);
				}
			}
			//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmSummaryDialsComponent = Ember.Component.extend({
	templateName: "components/opm-summary-dials",
	classNames:['width100'],
	holderId:'',
	showPage:true,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = null;
		if(currentWidgetData.type==="StorageSummary" || currentWidgetData.type==="StorageGrid") {
			jsonData = this.get('widgetData.apiData.summaryData');
		}else if(currentWidgetData.type === "wanDistribution"){
			jsonData = this.get('widgetData.apiData.AvailDails');
		}
		else {
			jsonData = this.get('widgetData.apiData');
		}
		if(!currentWidgetData.snapid) { //For NDM Devices, no snap ID so using date for unique ID
			currentWidgetData.snapid = Date.now();
		}
		if(currentWidgetData.snapid!==undefined){
			self.set('holderId','snapHolder_'+currentWidgetData.snapid);
			self.set('widgetData.apiDataArray',[]);
			var isWANIPMonitoring = this.snapshotObj.isWanLinkMonitoring;
			if(jsonData!==null && self!==undefined && self!==null){
				var jsonArr = [];
				var temp = {};
				var dialValue = 0;
				var packetLoss = 0;
				var isDevicePingable = true;
				var respTimeUnit ='ms'; //No I18N
				if(jsonData.availdata.Up != undefined && Math.ceil(jsonData.availdata.Up) >= 0) {
					dialValue = Math.ceil(jsonData.availdata.Up);
				}
				if(jsonData.packetLoss != undefined && Math.ceil(jsonData.packetLoss) >= 0) {
					packetLoss = Math.ceil(jsonData.packetLoss);
				}
				else if(this.snapshotObj.isRestAPIAvailability){
					packetLoss = "NA"; //No I18n
				}
				if(jsonData.responseTime !== "NA") {
					respTimeUnit = (jsonData.responseTime).match(/[a-zA-Z]+/g);
                    jsonData.responseTime = (jsonData.responseTime).split(respTimeUnit)[0];
				}
				if(this.snapshotObj.isDevicePingable !== undefined && this.snapshotObj.isDevicePingable == "false")
				{
					isDevicePingable = false;
					dialValue = "NA"; //No I18N
					packetLoss = "NA"; //No I18N
					jsonData.responseTime = "NA"; //No I18N
					var notMoniArr = ["Not Monitored"];
					if(jsonData.todayTimeAvail !== undefined && jsonData.todayTimeAvail.todayStartTime !== undefined && jsonData.todayTimeAvail.endTimeVal)
					{
						notMoniArr = ["Not Monitored,"+jsonData.todayTimeAvail.todayStartTime+","+jsonData.todayTimeAvail.endTimeVal];
					}
					jsonData.availability = notMoniArr;
				}
				if(dialValue !== "NA")
				{
					if(dialValue < 0)
					{
						dialValue = 0; //No I18N
					}
					else if(dialValue >100)
					{
						dialValue = 100; //No I18N
					}
				}
				else
				{
					dialValue = 0;
				}
				if(packetLoss !== "NA")
				{
					if(packetLoss < 0)
					{
						packetLoss = 0; //No I18N
					}
					else if(packetLoss >100)
					{
						packetLoss = 100; //No I18N
					}
				}
				else if(this.snapshotObj.isRestAPIAvailability)
				{
					packetLoss = "NA"; //No I18n
				}
				else
				{
					packetLoss = 0;
				}
				var dialDivName = "opm_availabilityDial"; //No I18N
				var pollId = "availability"; //No I18N
				var dialColor = "#f37273";	//No I18N
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				$("#"+dialDivName).attr("value",dialValue);
				if(Math.round(dialValue) > 0)
				{
					dialColor = "#76d284"; //No I18N
				}
				if(!isDevicePingable)
				{
					dialColor = "#7f7f7f"; //No I18N
				}
				temp.dialDivName = dialDivName;
				temp.dialValue = dialValue;
				temp.value = dialValue;
				temp.dialColor = dialColor;
				temp.dialType = 'meter';
				temp.snapHolderId = dialDivName;
				temp.iconTitle = Ember.I18n.t('webclient.map.availability',this);
				if(isDevicePingable)
				{
					var dialClickFunc = function(){
						redirectSnapShot('AvailabilityGraph',self.snapshotObj.snapType,self.snapshotObj.deviceName); //No I18N
						//$('#opm_availabilityDial').css('cursor','pointer');
						//$('#opm_availabilityDial').click(function(e){
						//		addDialClickEvent
						//});
					};
					temp.dialClickEnabled = true;
					temp.dialClickFunc = dialClickFunc;
				}
				self.get('widgetData.apiDataArray').pushObject(temp);

				temp = {};
				if((jsonData.opmdetails !== undefined && jsonData.opmdetails.Category !== undefined && jsonData.opmdetails.Category === "UPS") || (this.snapshotObj.parentCategory !== undefined && this.snapshotObj.parentCategory === "UPS")) {
					//UPS Battery Charge Dial
					var upsStatus = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.upsStatus;
					temp.dialType = 'batteryCharge'; //No I18N
					temp.iconTitle = Ember.I18n.t("opm.device.ups.battery.upscharge",this); //No I18N
					temp.unit = "";
					if(upsStatus!==undefined) {
						//Need to change the color based on value
						var value = upsStatus.batteryCharge;
						if(value !==undefined && value!==null && value !=="" && value!=="NA") {
							var color = value > 50 ? '#6dce8a' : value > 20 ? '#f6c142' : '#F37273'; //No I18N
							temp.value = value;
							temp.width = "width:"+value+"%;background-color:"+color; //No I18N
							temp.unit = "%";
							temp.dialEditEnabled = true;
							var responseDialEditFunc = function(params){
								var upsChargeMonitorName = "";
								if(upsStatus.upsChargeMonitorName!==undefined && upsStatus.upsChargeMonitorName!==null && upsStatus.upsChargeMonitorName!=="") {
									upsChargeMonitorName = upsStatus.upsChargeMonitorName;
								}
								editResponseThreshold(params,upsChargeMonitorName,upsChargeMonitorName,null,true);
							}
							temp.dialEditFunc = responseDialEditFunc;
							temp.dialEditParams = this.get('snapshotObj.deviceName');//No I18N
						} else {
							var color = '#d0d0d0'; //No I18N
							temp.value = "NA"; //No I18N
							temp.width = "width:100%;background-color:"+color; //No I18N
							temp.unit = "";
							Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
								$(".battery-wrap").addClass("na");
							});
						}
					} else {
						var color = '#d0d0d0'; //No I18N
						temp.value = "NA"; //No I18N
						temp.width = "width:100%;background-color:"+color; //No I18N
						temp.unit = "";
						Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
							$(".battery-wrap").addClass("na");
						});
					}
				} else {
				var dialDivName = "opm_packetLossDial"; //No I18N
				var pollId = "packetLoss"; //No I18N
				var dialValue = packetLoss;
				var dialColor = "#76d284";	 //No I18N
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				if(Math.round(dialValue) > 80)
				{
					dialColor = "#f37273"; //No I18N
				}
				else if(Math.round(dialValue) <=80 && Math.round(dialValue) > 60)
				{
					dialColor = "#f5c673"; //No I18N
				}
				else
				{
					dialColor = "#76d284"; //No I18N
				}
				if(!isDevicePingable)
				{
					dialColor = "#7f7f7f"; //No I18N
				}
				$("#"+dialDivName).attr("data-dialValue",dialValue);
				$("#"+dialDivName).attr("value",dialValue);
				temp.dialDivName = dialDivName;
				temp.dialValue = dialValue;
				temp.value = dialValue;
				temp.dialColor = dialColor;
				if(!this.snapshotObj.isRestAPIAvailability)
				{
					temp.dialType = 'meter'; //No I18n
				}
				temp.snapHolderId = dialDivName;
				var packetLossDialEditFunc = function(params){
					editResponseThreshold(params,'OpManagerDesktopObjectStatusPoll','stat','Packet_Loss',true);//No I18n
				};
				var wanIP_responseDialEditFunc = function(params){
					editResponseThresholdforWAN_IP(params,'WANLinkMonitor','WANLinkMonitor','Packet_Loss',true);  //No I18n
				};
				temp.dialEditEnabled = true;
				if(isWANIPMonitoring){
					temp.dialEditFunc = wanIP_responseDialEditFunc;
				}else{
					temp.dialEditFunc = packetLossDialEditFunc;
				}
				temp.dialEditParams = this.get('snapshotObj.deviceName');
				temp.iconTitle = Ember.I18n.t('opu.common.PACKET_LOSS',this);
				var packetLossDialFunc = function(){
					//addDialClickEvent('opm_packetLossDial', 'packetLoss');
				
					if(isWANIPMonitoring){
						redirectToWanSnapShot("PerfGraph/"+encodeURIComponent('WANLinkMonitor')+"/"+encodeURIComponent('WANLINK_PACKETLOSS'),'Link',self.snapshotObj.deviceName); // No I18N
					}else{
						var pdName = "packetLoss"; //No I18N
						openPerformanceMonEnhancedGraph(pdName,pdName,false,true,Ember.I18n.t('opu.common.PACKET_LOSS'));//No I18N

					}
				};
				if(isDevicePingable)
				{
					temp.dialClickEnabled = true;
					temp.dialClickFunc = packetLossDialFunc;
				}
				}
				if(!self.snapshotObj.isAgentMonitoring)
				{
					self.get('widgetData.apiDataArray').pushObject(temp);
				}
				$("#"+dialDivName).attr("data-dialValue",jsonData.responseTime);
				$("#"+dialDivName).attr("value",jsonData.responseTime);
				temp = {};
				if((jsonData.opmdetails !== undefined && jsonData.opmdetails.Category !== undefined && jsonData.opmdetails.Category === "UPS") || (this.snapshotObj.parentCategory !== undefined && this.snapshotObj.parentCategory === "UPS")) {
					//UPS Reaming Time Dial
					var upsStatus = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.upsStatus;
					temp.iconTitle = Ember.I18n.t('webclient.devicedetails.ups.runtime', this); //No I18N
					temp.dialType = 'runTimeRemaining'; //No I18N
					if(upsStatus!==undefined) {
						//Need change color & Dail fill based on remaining time
						if(upsStatus.runTimeRemaining!==undefined && upsStatus.runTimeRemaining!==null && upsStatus.runTimeRemaining !=="" && upsStatus.runTimeRemaining !=="NA") {
							var runTimeRemaining = upsStatus.runTimeRemaining;

							var value = formatMinutesUPSRemainingTime(runTimeRemaining);
							var runtimeInSeconds = minutesToSecondsUPSRemainingTime(runTimeRemaining);
							if(runtimeInSeconds !==undefined && runtimeInSeconds!==null && runtimeInSeconds !=="") {
								if (isNaN(runtimeInSeconds) || runtimeInSeconds < 0) {
									runtimeInSeconds = 0;
								}
								temp.value = value;
								Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
									updateRuntime(parseInt(runtimeInSeconds));
								});
							}
							if(upsStatus.batteryCapacityMonitorName!==undefined && upsStatus.batteryCapacityMonitorName!==null && upsStatus.batteryCapacityMonitorName!=="NA") {
								temp.dialEditEnabled = true;
							} else {
								temp.dialEditEnabled = false;
							}
							var responseDialEditFunc = function(params){
								var batteryCapacityMonitorName = "";
								if(upsStatus.batteryCapacityMonitorName!==undefined && upsStatus.batteryCapacityMonitorName!==null && upsStatus.batteryCapacityMonitorName!=="") {
									batteryCapacityMonitorName = upsStatus.batteryCapacityMonitorName;
								}
								editResponseThreshold(params,batteryCapacityMonitorName,batteryCapacityMonitorName,null,true);
							}
							temp.dialEditFunc = responseDialEditFunc;
							temp.dialEditParams = this.get('snapshotObj.deviceName');//No I18N
						} else {
							temp.value = "NA"; //No I18N
							Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
								updateRuntime("NA"); //No I18N
							});
						}
					} else {
						temp.value = "NA"; //No I18N
						Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
							updateRuntime("NA"); //No I18N
						});
					}
				} else {
				temp.dialDivName = "opm_responseTimeDial";
				temp.dialValue = jsonData.responseTime;
				temp.value = jsonData.responseTime;
				temp.unit = respTimeUnit;
				var responseDialEditFunc = function(params){
					editResponseThreshold(params,'OpManagerDesktopObjectStatusPoll','stat','Device',true);//No I18N
				}
				var wanIP_responseDialEditFunc = function(params){
					editResponseThresholdforWAN_IP(params,'WANLinkMonitor','WANLinkMonitor','Device',true);//No I18N
				}
				temp.dialEditEnabled = true;
				if(isWANIPMonitoring){
					temp.dialEditFunc = wanIP_responseDialEditFunc;
				}else{
					temp.dialEditFunc = responseDialEditFunc;
				}
				temp.dialEditParams = this.get('snapshotObj.deviceName');
				temp.snapHolderId = "opm_responseTimeDial";
				temp.iconTitle = Ember.I18n.t('opu.views.RESPONSE_TIME',this);
				var responseTimeDialFunc = function(){
					//addDialClickEvent('opm_responseTimeDial', 'responseTime');
					
					if(isWANIPMonitoring){
						var pdName = "WANLINK_AVGRTT"; //No I18N
						redirectToWanSnapShot("PerfGraph/"+encodeURIComponent('WANLinkMonitor')+"/"+encodeURIComponent(pdName),'Link',self.snapshotObj.deviceName); // No I18N
					}else{
						var pdName = "responseTime"; //No I18N
						openPerformanceMonEnhancedGraph(pdName,pdName,false,true,Ember.I18n.t('opu.views.RESPONSE_TIME'));//No I18N

					}
				};
				if(isDevicePingable)
				{
					temp.dialClickEnabled = true;
					temp.dialClickFunc = responseTimeDialFunc;
				}
				}
				if(!self.snapshotObj.isAgentMonitoring)
				{
					self.get('widgetData.apiDataArray').pushObject(temp);
				}
				if(self.snapshotObj.isAgentMonitoring)
				{
					var agentCPUDialName = 'WMI-CPUUtilization';//No I18N
					var agentMemoryDialName = 'WMI-MemoryUtilization';//No I18N
					if(jsonData.agentDials.isLinux){
						agentCPUDialName = 'Telnet-CPUUtilization';//No I18N
						agentMemoryDialName = 'Telnet-MemoryUtilization';//No I18N
					}

					if(isDevicePingable)
						{
							temp.dialClickEnabled = true;
							temp.dialClickFunc = responseTimeDialFunc;
						}
						var severity = jsonData.agentDials[agentCPUDialName].severity;
						if(severity !== undefined && severity == 1)
						{
							dialColor = statusColors[0];
						}
						else if(severity !== undefined && severity == 2)
						{
							dialColor = statusColors[1];
						}
						else if(severity !== undefined && severity == 3)
						{
							dialColor = statusColors[2];
						}
						else
						{
							dialColor = statusColors[4];
						}
						var agentCPU = {
							"dialDivName":"opm_Agent_CPU_Dial",//No I18N
							"dialValue":jsonData.agentDials[agentCPUDialName].value,//No I18N
							"value":jsonData.agentDials[agentCPUDialName].value,//No I18N
							"dialColor":dialColor,//No I18N
							"dialType":jsonData.agentDials[agentCPUDialName].dialType,//No I18N
							"snapHolderId":"opm_Agent_CPU_Dial",//No I18N
							"iconTitle":jsonData.agentDials[agentCPUDialName].displayName,//No I18N
							"dialClickEnabled":true//No I18N
						}
						var cpuUtilDialFunc = function(){
							var pdName = agentCPUDialName;
							openPerformanceMonEnhancedGraph(pdName,pdName,false,true,agentCPU.iconTitle);
						};
						if(isDevicePingable)
						{
							agentCPU.dialClickEnabled = true;
							agentCPU.dialClickFunc = cpuUtilDialFunc;
						}
						if(self.snapshotObj.isAgentMonitoring && agentCPU.value !== "NODATA")
						{
							self.get('widgetData.apiDataArray').pushObject(agentCPU);
						}
						else
						{
							agentCPU.value = "N/A";	//No I18N
							agentCPU.dialColor ="#929493"; //No I18N
							agentCPU.removeUnit = true;	//No I18N
							self.get('widgetData.apiDataArray').pushObject(agentCPU);
						}

						var severity = jsonData.agentDials[agentMemoryDialName].severity;
						if(severity !== undefined && severity == 1)
						{
							dialColor = statusColors[0];
						}
						else if(severity !== undefined && severity == 2)
						{
							dialColor = statusColors[1];
						}
						else if(severity !== undefined && severity == 3)
						{
							dialColor = statusColors[2];
						}
						else
						{
							dialColor = statusColors[4];
						}

						var agentMemory = {
							"dialDivName":"opm_Agent_Memory_Dial"//No I18N
							,"dialValue":jsonData.agentDials[agentMemoryDialName].value,//No I18N
							"value":jsonData.agentDials[agentMemoryDialName].value,//No I18N
							"dialColor":dialColor,//No I18N
							"dialType":jsonData.agentDials[agentMemoryDialName].dialType,//No I18N
							"snapHolderId":"opm_Agent_Memory_Dial",//No I18N
							"iconTitle":jsonData.agentDials[agentMemoryDialName].displayName,//No I18N
							"dialClickEnabled":true//No I18N
						}
						var MemoryUtilDialFunc = function(){
							var pdName = agentMemoryDialName;
							openPerformanceMonEnhancedGraph(pdName,pdName,false,true,agentMemory.iconTitle);
						};
						if(isDevicePingable)
						{
							agentMemory.dialClickEnabled = true;
							agentMemory.dialClickFunc = MemoryUtilDialFunc;
						}
						if(self.snapshotObj.isAgentMonitoring && agentMemory.value !== "NODATA")
						{
							self.get('widgetData.apiDataArray').pushObject(agentMemory);
						}
						else
						{
							agentMemory.value = "N/A";//No I18N
							agentMemory.removeUnit = true;	//No I18N
							agentMemory.dialColor ="#929493"; //No I18N
							self.get('widgetData.apiDataArray').pushObject(agentMemory);
						}
				}

				// var agentDisk = {
				// 	"dialDivName":"opm_Agent_Disk_Dial"
				// 	,"dialValue":jsonData.agentDials["WMI-DiskUtilization"].value,
				// 	"value":jsonData.agentDials["WMI-DiskUtilization"].value,
				// 	"dialColor":dialColor,
				// 	"dialType":"meter",
				// 	"snapHolderId":"opm_Agent_Disk_Dial",
				// 	"iconTitle":jsonData.agentDials["WMI-DiskUtilization"].displayName,
				// 	"dialClickEnabled":true
				// }
				// var diskUtilDialFunc = function(){
				// 	var pdName = "WMI-DiskUtilization"; //No I18N
				// 	redirectSnapShot("PerfGraph/"+encodeURIComponent(pdName)+"/"+encodeURIComponent(pdName),'MonitoringDevice',self.snapshotObj.deviceName); // No I18N
				// };
				// if(isDevicePingable)
				// {
				// 	agentDisk.dialClickEnabled = true;
				// 	agentDisk.dialClickFunc = diskUtilDialFunc;
				// }
				// if(self.snapshotObj.isAgentMonitoring)
				// {
				// 	self.get('widgetData.apiDataArray').pushObject(agentDisk);
				// }

				//self.set('widgetData.apiDataArray',jsonArr);
				$(".Summary .DIAC-block .DIACB").each(function(e){
		   	  	if($(this).find(".SpeedoMeter").length === 0)
		   	  	{
		   	  		$(this).parent().hide();
		   	  	}
		   	  	else
		   	  	{
		   	  		$(this).parent().show();
		   	  	}
				});
			}
			else{
				if(self!==undefined && self!==null){
					self.set('showPage',false);
				}
			}
			//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmHostDetailsComponent = Ember.Component.extend({
	templateName:"components/opm-host-details",
	summaryDetails:{},
	didInsertElement: function(){

		var self = this;
		var isWidgetPosReload = false;
		if(self.snapshotObj !== undefined && self.snapshotObj.snapType === "MonitoringDevice")
		{
			self.set('widgetData.sizey',12);//No I18N
			isWidgetPosReload = true;
		}
		OPMClient.InventoryDeviceDetailsController.set("isUnknownDevice",false); //No I18n
		if(!window.OPM.isCentralServer && OPMClient.ApplicationController.isEvaluation && self.snapshotObj.type === "Unknown" && self.snapshotObj.vendorName === "Unknown" && self.snapshotObj.isDevicePingable === "true")
		{

				OPMClient.InventoryDeviceDetailsController.set("isUnknownDevice",true); //No I18n
				if(window.OPM.isNewSnapshotPage){
					self.set('widgetData.sizey',23);//No I18N
				}
		}
		if(isWidgetPosReload)
		{
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
	},
	customFieldValuesObserver:function(){
         Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
             var adjustedHeight = 17;
             if(adjustedHeight!==undefined){
                 adjustedHeight = snapHeightCalculation[17]-50;
                 $('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
                 $('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar({//No I18N
                     axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
                 });
             }
         });
     }.observes('customFieldValues'),//No I18N
     actions:{
         summaryEdit: function(snapObj){
             redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
         },
         loadAppendUrl:function(url){
             loadAppendUrl(url);
         }
     },
	summaryDetailsObserver: function(){
		var model = this.get('widgetData.apiData');
		var snapshotObj = this.get('snapshotObj');
		var state = (model.state !== undefined) ? model.state : (snapshotObj && snapshotObj.state);
		if(window.OPM.isNewStatusPropagation && state !== undefined) {
			var availClass = opm_getStateCls(state);
			this.set('summaryDetails.statusIcon',"--fault-severity icon-status --dual-status status-" + model.statusNum + " " + availClass);//No I18N
		} else {
			this.set('summaryDetails.statusIcon',"--fault-severity icon-status"+model.statusNum);//No I18N
		}
	}.observes('widgetData').on('init'),
	didInsertElement: function(){
		var hardwareDetails = this.get("snapshotObj");
		if(hardwareDetails)
		{
			var status;
			if(hardwareDetails.ISHWMONITORED)
			{
				$("#hardwarestatusIcon").attr("class","");
				$("#hardwarestatusIcon").attr("class","icon-status5");
				status = "Disable";//No I18N
				$("#Hwstatus").text(Ember.I18n.t('webclient.fwa.snmp.disable.now',this));//No I18N
			}
			else
			{
				$("#hardwarestatusIcon").attr("class","icon-status1");
				status = "Enable";//No I18N
				$("#Hwstatus").text(Ember.I18n.t('ncm.device.summary.enablenow',this));//No I18N
			}
			$("#Hwstatus").val(status);
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
             this.set('adjustedHeight',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
         }
         if(window.OPM.showCustomFieldsInSummaryWidget)
         {
             var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getDeviceNotes',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
             var data = {name:OPMClient.InventoryDeviceDetailsController.deviceName};
             var response = opm_ajaxGetResponse(url,data);
             if(response!==undefined && response.length>0)
             {
                 this.set("customFieldValues",response);//No I18N
             }
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");//No I18N
		$('#'+this.elementId).find('*').remove();
		OPMClient.InventoryDeviceDetailsController.set("isUnknownDevice",false); //No I18n
	}
});
OPMClient.OpmHostDetailsPageComponent = Ember.Component.extend({
	classNames:['com_HostDetailsPage'],
	didInsertElement: function(){
		if(this.snapshotObj.entityType === "HyperV-VM" || this.snapshotObj.entityType === "VMware-VM" || this.snapshotObj.entityType === "Xen-VM"){
			this.set("snapshotObj.isVM","true"); //No I18N
		}
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_HostDetailsPage .DIGmCustomScroll').closest('.grid-stack-item').height()-70, advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		if(!window.OPM.isCentralServer && this.snapshotObj.statusPollEnabled !== undefined && !this.snapshotObj.statusPollEnabled)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
	},
	actions:{
		changeDevicePassword: function(){
			changeDevicePasswordDetails(this.obj.opmdetails.DNSName);
			opmUserStats('snapshot_changeCredential');//No I18N
		},
		summaryEdit: function(snapObj){
			redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
		},
		editCustomTypeName: function() {
			$('#showDevType').hide();
			$('#editDevType').show();
			$('#editDevType').addClass('flex');//No I18N
			$('#devTypeValue').val($('#devTypeName').text());
			$('#devTypeValue').focus();
		},
		saveCustomTypeName: function(snapObj){
			var self = this;
			var dtName = $('#devTypeValue').val();
			if(dtName===undefined || dtName===null || dtName==="" || dtName===" " || dtName==="null"){
				$('#devTypeValue').addClass('validateField error');//No I18N
				$('#devTypeValue').attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
				$('#devTypeValue').focus();
				opmValidate($('#devTypeValue'));
			}else if(!opm_isValidDTName(dtName)){
				$('#devTypeValue').addClass('validateField error');//No I18N
				$('#devTypeValue').attr('data-error',Ember.I18n.t('webclient.devices.devprop.status.spechar',this));//No I18N
				$('#devTypeValue').focus();
				opmValidate($('#devTypeValue'));
			}
			else{
				var callBackFn = function()
				{
					var data= {'deviceType':dtName,'deviceTypeID':snapObj.deviceTypeID};//No I18N
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/updateCustomDeviceTemplateName",data)//No I18N
					showMessage(response);
					if(response.error === undefined){
						$('#deviceTypeTile').text(dtName);
						opm_transitionToParentRoute("Inventory.Device",snapObj.deviceName);//No I18N
						for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
							if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
								OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
							}
						}
					}
				};
				var cancelCallBackFn = function() {
					self.send('cancelCustomTypeName'); //No I18n
				}
				opmConfirm(Ember.I18n.t('webclient.agent.confirm'),Ember.I18n.t('opm.devsnap.type.edit.confirm'),'',callBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.yes'),cancelCallBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'hideCloseInUIDIalog',false,false);//No I18N
			}
		},
		cancelCustomTypeName: function() { 
			$('#showDevType').show();
			$('#editDevType').hide();
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			$('#editDevType').removeClass('flex');//No I18N
			$('#devTypeName').text($('#deviceTypeTile').text());
		}
	},
	scrollObserver:function(){
		var adjustedHeight = this.get('adjustedHeight');//No I18N
		if(adjustedHeight!==undefined){
			adjustedHeight = snapHeightCalculation[this.get('adjustedHeight')]-70;//No I18N
			$(this.element).find('.DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}
	}.observes('adjustedHeight'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmXenVMDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-xen-vmdetails", //No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var widgetData = this.get('widgetData');
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true){
			this.set('widgetData.sizey',14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',18); //No I18N
		}
	},
	actions:{
		redirectToHost: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.HOSTNAME,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmESXDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-esx-details",
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		OPMClient.InventoryDeviceDetailsController.set('vmDetails', {  //No I18N
			PARENT_MO: widgetData.apiData.PARENT_MO,
			RAISE_ENTITY_ALERTS: widgetData.apiData.RAISE_ENTITY_ALERTS
		});
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true && !window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',20); //No I18N
			var adjustedHeight = snapHeightCalculation[20]-70;//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}
	},
	actions:{
		redirectToVcenter: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.VCENTERNAME,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmoldESXDetailsComponent = Ember.Component.extend({
	templateName: "components/opmold-esx-details",//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmXenDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-xen-details",//No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var widgetData = this.get('widgetData');
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true){
			this.set('widgetData.sizey',14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',15); //No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmHyperVVMDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-hyperv-vmdetails",//No I18N
	didInsertElement: function(){
		var adjustedHeight = $('#'+this.elementId+' .DIGmCustomScroll').closest('.grid-stack-item').height()-140;//No I18N
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',20); //No I18N
			adjustedHeight = snapHeightCalculation[20]-70;//No I18N
		}
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',setHeight:adjustedHeight,scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var widgetData = this.get('widgetData');
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true && !window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
	},
	actions:{
		redirectToHost: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.HOSTNAME,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmHyperVDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-hyperv-details", //No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		if(widgetData.reloadWidget!==undefined && widgetData.reloadWidget===true && !window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',14); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmoldVMInfoComponent = Ember.Component.extend({
	templateName: "components/opmold-vm-info",
	actions:{
		redirectToHost: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.DEVProps.HOSTMONAME,'','MonitoringDevice');
		},
		redirectToVcenter: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.DEVProps.VCENTERNAME,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmVMCredentialsComponent = Ember.Component.extend({
	templateName: 'components/opm-vm-credentials',//No I18N
	didInsertElement: function() {
		var parentview = this.get('slideDetails.parentview');
		var credentialNames = parentview.get('controller.credentialNames').split(',');
		var gridData = parentview.get('controller.credentialGridData');
		OPMClient.VMwareDiscoveryController.setProperties({IsUserSelectedCredetials:true,userSelectedCredetials:credentialNames});
		opm_loadJQgridWithData('#DECredProfList',gridData.gridData,gridData.colNames,gridData.colModel,'','#DECredProfPager','credentialsList',gridData.defaultOptions);//No I18N
		$('#DECredProfList').trigger('reloadGrid');
		$('#DECredProfList').jqGrid('setGridWidth', $("#DECredProfList").closest(".opmFormHolder").width()-30);
	},
	getSelectedCredentials:function(){
		var selectedCredentials = $('#DECredProfList').jqGrid('getGridParam','selarrrow') || [];
		if(selectedCredentials.length && selectedCredentials[0] === ''){
			selectedCredentials.splice(0,1);
		}
        return selectedCredentials;
	},
	actions: {
		saveOperation:function(){
			var self = this;
			var parentview = self.get('slideDetails.parentview');
			var selectedCredentials = self.getSelectedCredentials();
			var confirmCallback = function(){
				parentview.set('controller.credentialNames',selectedCredentials.toString());//No I18N
				self.send('cancelOperation');//No I18N
			}
			if(selectedCredentials.length > 5){
				opmConfirm(Ember.I18n.t('webclient.exportflow.entercred'),Ember.I18n.t('webclient.discovery.vmware.credential.maxLimitMsg'),'',confirmCallback,'','','','','dialogStyle2','','','',true,true);//No I18N
			}else{
				confirmCallback();	
			}
		},
		cancelOperation:function(){
			this.get('parentView').send('closeAction');//No I18N
		}
	},
	willDestroyElement:function(){
		removeMultipleKeysfromObject(['userSelectedCredetials','IsUserSelectedCredetials'],OPMClient.VMwareDiscoveryController);//No I18N
	}
});
OPMClient.OpmVMDiscoverySettingsComponent = Ember.Component.extend({
	templateName: 'components/opm-vm-discovery-settings',//No I18N
	didInsertElement:function(){
		var self = this;
		var parentDetails = self.get('slideDetails.parentview').get('controller'); // No I18N
		self.setProperties({intervalArray:parentDetails.get('intervalArray'),selectedInterval:parentDetails.get('updateInterval'),checkboxArray:$.extend(true,[],parentDetails.get('discoverySettingsOptions')),intervalLabel:parentDetails.get('intervalLabel'),parentDetails:parentDetails});
	},
	actions: {
		saveOperation:function(){
			var self = this;
			
			var parentDetails = this.get('slideDetails.parentview').get('controller');
			parentDetails.setProperties({updateInterval:self.get('selectedInterval'),discoverySettingsOptions:self.get('checkboxArray')});
			self.send('cancelOperation');//No I18N
		},
		cancelOperation:function(){
			this.get('parentView').send('closeAction');//No I18N
		}

	}
});
//VM Info widget (VxRail, VMware vms)
OPMClient.OpmVMWareVMDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-vmware-vmdetails",//No I18N
	didInsertElement: function(){
		this.set('widgetData.hideExpand',true);//No I18N
		
		this.set('widgetData.sizey',19) // No I18N
		var adjustedHeight = snapHeightCalculation[15];
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	actions:{
		redirectToHost: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.moName,'','MonitoringDevice');
		},
		redirectToVcenter: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.VCENTERNAME,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
//vCenter Info widget
OPMClient.OpmVirtualDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-virtual-details",//No I18N
	snapID:"",
	snapIDObserver: function(){
		this.snapID = "snapHolder_"+this.widgetData.id;//No I18N
	}.observes('widgetData').on('init'), //No I18N
	didInsertElement: function(){
		this.set('widgetData.hideExpand',true);//No I18N
		this.set('widgetData.sizey',14) // No I18N
		var adjustedHeight = snapHeightCalculation[10];
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmVxRailInfoComponent = Ember.Component.extend({
	templateName: "components/opm-vxrail-info",//No I18N
	snapID:"",
	snapIDObserver: function(){
		this.snapID = "snapHolder_"+this.widgetData.id;//No I18N
	}.observes('widgetData').on('init'), //No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = this.get('widgetData');
		self.setProperties({clusterHealthClass:'capsule-'+validateHealthStatusString(widgetData.apiData.CLUSTER_HEALTH_STATUSSTR),opStatusClass:'capsule-'+validateHealthStatusString(widgetData.apiData.CLUSTER_OPER_STATUS_STR),connStatusClass:'icon-status'+(widgetData.apiData.NETWORK_CONNECT_STATUS==='true'?'5':'1'),'widgetData.hideExpand':true});//No I18N
	},
	actions:{
		redirectToVcenter: function(vCenterName){
			redirectToDeviceSnapshot(vCenterName,'','MonitoringDevice');//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
//vCenter/VxRail VMSummary widget
OPMClient.OpmVMwareVMSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-vmware-vmsummary",//No I18N
	didInsertElement: function(){
		this.set('widgetData.hideExpand',true);//No I18N
	},
	actions:{
		redirectToVirtualMachines:function(vmType){
			var inventoryTabs = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails.tabs.tabs;
			if(inventoryTabs !== undefined && inventoryTabs.length){
				if(!OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isNutanixParent) {
					OPMClient.InventoryDeviceDetailsController.setProperties({selectedVMType:vmType,handleShowMore:true});
				}
				var vmWidgetIndex = inventoryTabs.findIndex(function(obj) {
					if(['webclient.vmware.map.vmachines', 'opm.device.nutanix.vms'].includes(obj.name)){//No I18N
						return true;
					}
				})
				this.get('parentView').get('parentView').get('parentView').get('parentView').send('changeSnapTab',inventoryTabs[vmWidgetIndex].tabid);//No I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmvSANInfoComponent = Ember.Component.extend({
	templateName: "components/opm-vsan-info",//No I18N
	snapID:"",
	snapIDObserver: function(){
		this.snapID = "snapHolder_"+this.widgetData.id;//No I18N
	}.observes('widgetData').on('init'), //No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = self.get('widgetData');
		self.setProperties({isDataAvailable:(Object.keys(widgetData.apiData).length > 0),'widgetData.hideExpand':true});//No I18N
		if(self.get('isDataAvailable')){
			self.set('healthClass','capsule-'+validateHealthStatusString(widgetData.apiData.HEALTH_STATUS_STR));//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmvSANCapacityInfoComponent = Ember.Component.extend({
	templateName: "components/opm-vsan-capacity-info",//No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = self.get('widgetData');
		self.set('widgetData.hideExpand',true);//No I18N
		var apiData = widgetData.apiData;
		var graphData = [];
		var metaData = {};
		if(apiData.length){
			var valueArray = apiData.map(function(valueObj){return valueObj.value});
			metaData = {totalValue:(valueArray.reduce(function(current,previous){return (Number(current)+Number(previous));})),unit:''};
			$.each(apiData,function(index,dataObject){
				var currentValue = dataObject.value || 0;
				graphData.push([Ember.I18n.t('webclient.opm.snapshot.vsan.capacity.info.'+dataObject.label),currentValue,((currentValue/(metaData.totalValue))*100).toFixed(2)]);
				if(metaData.unit === ''){
					metaData.unit = dataObject.unit;
				}
			});
		}
		OPMClient.InventoryDeviceDetailsController.set('dialFilterObject',metaData);//No I18N
		createDialGraph(widgetData,graphData,metaData,this);
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmEnhancedGraphComponent = Ember.Component.extend({
	classNames:['heightAuto'],
	zClassName:'zohoGraph',//No I18N
	templateName: 'components/opm-enhanced-graph',//No I18N
	loadZChart:function(chartObj,parentModel){
		var self = this;
		var arrayObj = {placeholder:[chartObj.id],chartobj:[chartObj]};
		if(chartObj.classNames !== undefined && chartObj.classNames.length > 0){
			self.setProperties({zClassName:chartObj.classNames.join(' ')});
		}
	    if(chartObj.consolidatedValues !== undefined && chartObj.consolidatedValues !== null){
	    	arrayObj.consolidatedValues = chartObj.consolidatedValues;
	    }
	    if(chartObj.graphSeries !== undefined && chartObj.graphSeries !== null){
	    	arrayObj.graphSeries = chartObj.graphSeries;
	    }
	    zChart(arrayObj);
	    if(!self.get('isSummaryGraph')){
	    	parentModel.setProperties({graphDataForExportXLSX:chartObj.jsonData});
	    	parentModel.notifyPropertyChange('chartObj');//No I18N
	    }
	},
	didInsertElement: function(){
		var self = this;
		var parentModel = self.get('parentView').get('controller');
		var parentModelRef = self.get('parentModelRef');
		if(parentModelRef.graphFeatureSettings !== undefined && parentModel.get('graphFeatureSettings') === undefined){
			parentModel.setProperties({graphFeatureSettings:parentModelRef.graphFeatureSettings});
		}else if(parentModel.get('graphFeatureSettings') === undefined){
			OPMClient.graphSettingsController.getData(parentModel);
		}
		var chartObj = opm_loadSingleEnhancedGraphData(parentModel,self.get('isSummaryGraph'));
		if(!self.get('isSummaryGraph')){
			//To avoid observing immediately to the table view, assigned the prop instead of set.
			parentModel.model.chartObj = chartObj;
		}else{
			self.loadZChart(chartObj,parentModel);
		}
	},
	graphLoadingObserver:function(){
		var self = this;
		var parentModel = self.get('parentView').get('controller');
		if(parentModel.get('graphLoading') !== undefined){
			if(!parentModel.get('graphLoading')){
				Ember.run.scheduleOnce('afterRender',function(){//No I18N
				    self.loadZChart(parentModel.get('chartObj'),parentModel);
				});
			}
		}
	}.observes('parentModelRef.graphLoading'),//No I18N
	willDestroyElement: function(){
		//Remove d3 Elements
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
		this.chartobj=null;
	}
});
OPMClient.OpmSummaryGraphComponent = Ember.Component.extend({
	showGraph:false,
	isNFABGPTrafficErroHandling:false,
	templateName: "components/opm-summary-graph",//No I18N
	didInsertElement: function(){
		var self = this;
		var graphObj = self.get('graphObj');
		var currentModel = self.get('currentModel');
		var parentModel = currentModel.parentModel;
		var graphName = graphObj.policyName;
		var indexName = graphObj.name;
		var graphIndex = self.get('graphIndex');
		var graphDataUrl = '';
		var parentObject = self.get('parentObject');
		self.setProperties({isSummaryPage:true,isForecastGraph:false,isBGPGraph:currentModel.isBGPGraph,isSDWANGraph:currentModel.isSDWANGraph});
		if(parentModel.snapType === 'MonitoringInterface'){//No I18N
			graphDataUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getInterfaceGraphs?isFluidic=true',OPMClient.InventoryDeviceDetailsController.eeProbeID)+'&interfaceName='+parentModel.deviceName+'&graphName='+encodeURIComponent(graphName);//No I18N
			self.setProperties({isMonitoringInterface:true});
		}else{
			if(currentModel.isBGPGraph){
				graphDataUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + '/v2/device/getBGPGraphData?deviceName='+parentModel.deviceName+'&peerMoid='+encodeURIComponent(currentModel.policyName)+'&peerIndex='+encodeURIComponent(currentModel.indexName)+'&peerASNumber='+encodeURIComponent(OPMClient.InventoryDeviceDetailsController.peerASNumber)+'&graphType='+encodeURIComponent(graphObj.key)+'&period=Today',OPMClient.InventoryDeviceDetailsController.eeProbeID);// No I18N
			}
			else if(currentModel.isSDWANGraph){
				var elementType='Tunnel';//No I18N
				if(OPMClient.InventoryOpmDeviceListController.sdwanWanIntfGraphs!==undefined && OPMClient.InventoryOpmDeviceListController.sdwanWanIntfGraphs==='true'){
					elementType='wanlink';//No I18N
				}
				else if(OPMClient.InventoryOpmDeviceListController.sdwanSimGraphs!==undefined && OPMClient.InventoryOpmDeviceListController.sdwanSimGraphs==='true')
				{
					elementType="simlink";//No I18N
				}
				var isSDWANDevice = OPMClient.InventoryDeviceDetailsController.get("isSDWANDevice");
				var sdwanID=OPMClient.InventoryDeviceDetailsController.moID;
				if(isSDWANDevice !== undefined && isSDWANDevice === true){
					sdwanID = OPMClient.InventoryDeviceDetailsController.parentSdwanMoid;
				}
				
				
				graphDataUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + "/v2/device/getSDWANMonitorGraphData?sdwanID="+sdwanID+'&elementID='+currentModel.policyName+'&graphType='+encodeURIComponent(graphObj.key)+"&elementType="+elementType+"&period=Today",OPMClient.InventoryDeviceDetailsController.eeProbeID);// No I18N
				if(graphObj.key === "Availability"){
					graphDataUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + "/v2/device/getSDWANAvailabiltyGraphData?sdwanID="+sdwanID+'&elementID='+currentModel.policyName+"&elementType="+elementType+"&period=Today",OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N				
				}
				
			}else{
				if(parentModel.isDatastore){
					OPMClient.InventoryDeviceDetailsController.eeProbeID = ee_addManualProbeIDOnNeed(parentModel.deviceName);
				}
				graphDataUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + '/v2/device/getGraphData?name='+parentModel.deviceName+'&policyName='+encodeURIComponent(graphName)+'&index='+encodeURIComponent(indexName)+'&withMMA=true', OPMClient.InventoryDeviceDetailsController.eeProbeID);// No I18N
			}
		}

		if(graphObj.params) {
			Object.entries(graphObj.params).forEach(function(param){
				if(!param[0] || !param[1]) {
					return;
				}
				graphDataUrl = graphDataUrl + '&' + param[0] + '=' + encodeURIComponent(param[1]);//No I18N
			});
		}

		opm_ajaxGetResponseWithMsg(graphDataUrl,{},Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'),function(jsonData){//No I18N
			var numberOfInstances = (jsonData.graphData && jsonData.graphData.length) || 0;
			graphObj.pollId = graphObj.pollId || graphName || graphObj.key;
			parentObject.get('graphResponse')[graphObj.pollId] = jsonData;//.consolidatedValues;
			parentObject.get('graphParams')[graphObj.pollId] = {deviceName:parentModel.deviceName,policyName:graphName,indexName:indexName,pollId:graphObj.pollId};

			Ember.set(graphObj,'disableAction',(numberOfInstances === 0) || (graphObj.key === 'Availability') || (graphObj.key === 'BGP_NFA_TRAFFIC'));//No I18N
			Ember.set(graphObj,'isMultipleInstanceGraph',(numberOfInstances > 1));//No I18N
			Ember.set(graphObj,'graphUID','graph_mini_'+graphIndex);//No I18N
			Ember.set(graphObj,'headerUnit',getUnitFortheGraph(jsonData,true));//No I18N
			
			if(currentModel.isBGPGraph) {
				if(jsonData.displayName !== undefined){
					Ember.set(graphObj,'value',jsonData.displayName);//No I18N
				}
				if(graphObj.key === "BGP_NFA_TRAFFIC") {
					
					if(jsonData.message === "DEVICE_NOT_ADDED"){
						self.set("isNFABGPTrafficErroHandling", true);//NO I18N
						OPMClient.InventoryDeviceDetailsController.set('DeviceNotAddedInNFA' , true);//NO I18N
					}else{
						OPMClient.InventoryDeviceDetailsController.set('DeviceNotAddedInNFA' , false);//NO I18N
					}
					if(jsonData.message === "AS_NOT_ENABLED"){
						self.set("isNFABGPTrafficErroHandling", true);//NO I18N
						OPMClient.InventoryDeviceDetailsController.set('ASNotEnabledInNFA' , true);//NO I18N
					}else{
						OPMClient.InventoryDeviceDetailsController.set('ASNotEnabledInNFA' , false);//NO I18N
					}
				}
				parentObject.get('graphResponse')[graphObj.key] = jsonData;
				parentObject.get('graphParams')[graphObj.key] = {deviceName:parentModel.deviceName,policyName:currentModel.policyName,indexName:currentModel.indexName,graphType:graphObj.key};
			}
			if(currentModel.isSDWANGraph){
				if(jsonData.displayName !== undefined){
					Ember.set(graphObj,'value',jsonData.displayName);//No I18N
				}
				parentObject.get('graphResponse')[graphObj.key] = jsonData;
				parentObject.get('graphParams')[graphObj.key] = {deviceName:parentModel.deviceName,policyName:currentModel.policyName,indexName:currentModel.indexName,graphType:graphObj.key};
			}
			jsonData.policyName = graphName;
			if(graphObj.graphColor) {
				jsonData.graphColor = graphObj.graphColor;
			}
			if(graphObj.graphHeight) {
				jsonData.graphHeight = graphObj.graphHeight;
			}
			var graphSettings = self.get('parentView').get('controller').get('graphFeatureSettings');
			self.setProperties({responseData:jsonData,graphId:'graph_mini_'+graphIndex,graphSettings:Ember.ArrayController.create({'graphFeatureSettings':graphSettings}),showGraph:true,isDataAvailable:(numberOfInstances > 0)});//No I18N
		});
	},
	actions:{
		exportFlow:function() {
			nfa_changeColOpt(deviceBasicDetails.collectorID);
			opmGlobalRoute.transitionTo("Settings.Discovery.ExportFlow"); //NO I18N
		},
		enableNFAAS:function() {
			nfa_changeColOpt(deviceBasicDetails.collectorID);
			opmGlobalRoute.transitionTo("Settings.NetflowConfig.NFAStorage.Category", {Category: "Autonomous"}); //NO I18N
			//opmGlobalRoute.transitionTo("Settings.NetflowConfig.NFAStorage.Autonomous"); //NO I18N
		}
	},	
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmCustomTimeChooserComponent = Ember.Component.extend({
	templateName: "components/opm-custom-time-chooser",//NO I18N
	listOpenCloseEvent:function(e){
		var self = this;
        var container = $('.opm-custom-time-chooser'); //NO I18N
        if(!container.is(e.target) && container.has(e.target).length === 0 && !($(e.target).hasClass('select2-results__option'))){
            container.removeClass('drop-down-active show-custom-list'); //NO I18N
            $(document).unbind('mouseup.opm-custom-time-chooser',self.listOpenCloseEvent); //NO I18N
        }
    },
    makeSelectedPeriodActive:function(selectedPeriod){
    	var self = this;
    	$('#'+self.elementId+' .opm-custom-time-chooser__default-list li a').removeClass('active');//No I18N
        $('#'+self.elementId+' .opm-custom-time-chooser__default-list li a[rel="'+selectedPeriod+'"]').addClass('active');//No I18N
    },
	didInsertElement: function(){
		var self = this;
		var parentModel = self.get('parentView').get('controller');
		var isGraphPeriodsAvailable = !!parentModel.get('graphPeriods');
		var isPeriodRangeAvailable = !!parentModel.get('periodRange');
		var graphPeriods = this.graphPeriods ? this.graphPeriods : cloneObject(opmEnhancedGraphPeriods);
		var selectedPeriod = (parentModel.get('selectedPeriod') || 'Today');//NO I18N
		var customTime = (parentModel.get('periodTitle') || 'Today');//NO I18N
		var arrIndex = graphPeriods.map(function(obj){return obj.period}).indexOf(selectedPeriod);
		var isInstantWidget = self.get('isInstantWidget')
		 if(isInstantWidget)
		{
            $('.opm-custom-time-chooser').addClass('opm-custom-time-chooser-selct2 relative');
			$(".opm-custom-time-chooser__view").removeClass("type1");
		}
		if(arrIndex >=0)
		{
			var periodTitle = graphPeriods[arrIndex].title;
		}
		if(isInstantWidget)
		{
			if(location.href.indexOf('/Home/Dashboard') > -1)
			{
				graphPeriods.pop();
			}
			if(selectedPeriod == 'custom')
			{
				this.selectedPeriod = selectedPeriod;
				var regex = /\[(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}) - (\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2})\]/;
				var matches = customTime.match(regex);

				var startDate = matches[1]; // Start date (e.g., "10/01/2025")
				var startHour = matches[2]; // Start time (e.g., "00:00")
				var endDate = matches[3]; // End date (e.g., "16/01/2025")
				var endHour = matches[4]; // End time (e.g., "00:00")

				// Convert date format from dd/mm/yyyy to yyyy-mm-dd
				var startDate = startDate.split('/').reverse().join('-');
				var endDate = endDate.split('/').reverse().join('-');

				// Extract hours and minutes from startHour and endHour
				this.set('fromHours', startHour.split(':')[0]); //NO I18N
				this.set('endHour', endHour.split(':')[0]); //NO I18N
				this.set('fromMinutes', startHour.split(':')[1]); //NO I18N
				this.set('toMinutes', endHour.split(':')[1]); //NO I18N

				// Set the date values in the input fields
				$('#' + self.elementId + ' #from-date').prop('value', startDate);
				$('#' + self.elementId + ' #to-date').prop('value', endDate);
                $('#'+self.elementId+' #from-date').datepicker({dateFormat:'yy-mm-dd',minDate:''});
                $('#'+self.elementId+' #to-date').datepicker({dateFormat:'yy-mm-dd',minDate:''});

				// Extract start and end time
				if (matches) {
					var startTime = matches[2]; // Start time (e.g., "00:00")
					var endTime = matches[4]; // End time (e.g., "00:00")
				}

				this.startTime = startTime;
				this.endTime = endTime;
				this.set('periodTitle', 'custom'); //NO I18N
				this.set('periodRange', customTime); //NO I18N
				this.set('dateAndTimeData', customTime); //NO I18N
				var parentModel = this.get('parentView').get('controller');
				parentModel.setProperties({
					startTime: startTime,
					endTime: endTime,
					dateAndTimeData: {
						startDate: startDate,
						endDate: endDate,
						startHour: this.get('fromHours'),
						endHour: this.get('endHour'),
						startMinute: this.get('fromMinutes'),
						endMinute: this.get('toMinutes')
					}
				});
				
				this.get('parentView').send('changeTimePeriod', 'custom', self.get('periodTitle'), { //NO I18N
					startDate: startDate,
					endDate: endDate,
					startHour: this.get('fromHours'),
					endHour: this.get('endHour'),
					startMinute: this.get('fromMinutes'),
					endMinute: this.get('toMinutes')
				}); 
			}
			
		}
		self.setProperties({graphPeriods:(isGraphPeriodsAvailable ? parentModel.get('graphPeriods') : graphPeriods),selectedPeriod:selectedPeriod,periodTitle:periodTitle, isTimePeriodTextHidden: ('reportBuilder' === self.get('pageName') || parentModel.get('isApiPerformanceAnalyzerPage')) , isReportBuilder:('reportBuilder' === self.get('pageName')),isBusinessView:('BusinessView' === self.get('pageName'))});//No I18N
		$('#'+self.elementId).removeClass('ember-view');
		if(isPeriodRangeAvailable && !self.get('isReportBuilder') && !self.get('isBusinessView')){
			 self.setProperties({periodRange:parentModel.get('periodRange'),selectedPeriod:'custom',endTime:parentModel.get('startTime'),endTime:parentModel.get('endTime')});//NO I18N
		}
	},
	actions:{
		expandTimeSelection:function(){
            var self = this;
            $('#'+self.elementId+' .opm-custom-time-chooser').toggleClass('drop-down-active');
            self.makeSelectedPeriodActive(self.get('selectedPeriod'));
            $(document).unbind('mouseup.opm-custom-time-chooser',self.listOpenCloseEvent).bind('mouseup.opm-custom-time-chooser',self.listOpenCloseEvent);//NO I18N
        },
        changeTimePeriod:function(selVal,periodTitle){
            var self = this;
            var prevValue = self.get('selectedPeriod');
            self.makeSelectedPeriodActive(selVal);
            if(selVal === 'custom'){
                $('#'+self.elementId+' .opm-custom-time-chooser').addClass('show-custom-list');
                if(!self.get('startTime')){
                    var timeObject = getCurrentTimeFrame();
                    self.setProperties({startTime:timeObject.startTime,endTime:timeObject.endTime});
                }
                $('#'+self.elementId+' #from-date').datepicker({dateFormat:'yy-mm-dd',minDate:''});
                $('#'+self.elementId+' #to-date').datepicker({dateFormat:'yy-mm-dd',minDate:''});
            }else{
                $('#'+self.elementId+' .opm-custom-time-chooser').removeClass('drop-down-active show-custom-list');
                if(selVal !== prevValue){
                    self.setProperties({periodTitle:periodTitle,selectedPeriod:selVal});
                    self.get('parentView').send('changeTimePeriod',selVal,periodTitle);//No I18N
                }
            }
        },
        showHideCustomTime:function(isClose){
            var self = this;
            $('#'+self.get('errorMsgId')).remove();
            if(isClose){
                $('#'+self.elementId+' .opm-custom-time-chooser').removeClass('drop-down-active show-custom-list');
                self.makeSelectedPeriodActive(self.get('selectedPeriod'));
            }else{
                $('#'+self.elementId+' .opm-custom-time-chooser').addClass('show-custom-list');//No I18N
            }
        },
        updateCustomTime:function(){
            var self = this;
            var parentModel = (self.get('parentView').get('controller'));
            var fromDate = $('#'+self.elementId+' #from-date').prop('value');
            var toDate = $('#'+self.elementId+' #to-date').prop('value');
            var tempStartTime = fromDate+" "+self.get('fromHours')+":"+self.get('fromMinutes');//NO I18N
            var tempEndTime = toDate+" "+self.get('toHours')+":"+self.get('toMinutes');//NO I18N
            $('#'+self.get('errorMsgId')).remove();
			if(parentModel.model && parentModel.model.isForecastGraph) {
				self.isForecastGraph = true;
			}
            if(opmValidateCustomTime(tempStartTime,tempEndTime,self)){
				var startTime = moment(new Date(tempStartTime)).format('DD/MM/YYYY HH:mm');//No I18N
				var endTime = moment(new Date(tempEndTime)).format('DD/MM/YYYY HH:mm');//No I18N
                var periodRange = '['+startTime+' - '+endTime+']';
                $('#'+self.elementId+' .opm-custom-time-chooser').removeClass('drop-down-active show-custom-list');//No I18N
                $('#'+self.elementId+' .opm-custom-time-chooser__default-list li a[rel=custom]').addClass('active');//No I18N
                self.setProperties({selectedPeriod:'custom',periodTitle:Ember.I18n.t('webclient.reports.timeframe.custom'),periodRange:periodRange,startTime:startTime,endTime:endTime});//No I18N
		if(!(parentModel.get('isMonitorsPage') || parentModel.get('isSummaryPage') || self.get('isReportBuilder') || self.get('isInstantWidget') || parentModel.get('isAtaGlanceReport') || parentModel.get('isBwUtilReport') || parentModel.get('isAnomaliesPage')|| self.get('isBusinessView') || parentModel.get('isApiPerformanceAnalyzerPage') || parentModel.get('isGpuDashboard'))){
	                OPMClient.FWAGlobalDataController.startTime = tempStartTime;
	                OPMClient.FWAGlobalDataController.endTime = tempEndTime;
	                var snapDetails = $.extend(true,{},self.get('parentView').get('controller.model.snapDetails'));
					self.setProperties({'parentView.controller.model.snapDetails':changeWidgetsTimeFrame(snapDetails,'custom')});//No I18N
            	}else{
            		parentModel.setProperties({startTime:startTime,endTime:endTime,periodRange:periodRange,dateAndTimeData:{startDate:fromDate,endDate:toDate,startHour:self.get('fromHours'),endHour:self.get('toHours'),startMinute:self.get('fromMinutes'),endMinute:self.get('toMinutes')}});
                    self.get('parentView').send('changeTimePeriod','custom',self.get('periodTitle'), { //NO I18N
						startDate: fromDate,
						endDate: toDate,
						startHour: this.get('fromHours'),
						endHour: this.get('toHours'),
						startMinute: this.get('fromMinutes'),
						endMinute: this.get('toMinutes')
					});
            	}
            }
        }
	},
	splitStartTimeObserver:function(){
        var self = this;
        if(self.get('startTime')){
            var tm = self.get('startTime').split(' '); //NO I18N
            var hm = tm[1].split(':'); //NO I18N
            self.setProperties({fromDate:tm[0],fromHours:hm[0],fromMinutes:hm[1]});
        }
    }.observes('startTime'), //NO I18N
    splitEndTimeObserver:function(){
        var self = this;
        if(self.get('endTime')){
            var tm = self.get('endTime').split(' '); //NO I18N
            var hm = tm[1].split(':'); //NO I18N
            self.setProperties({toDate:tm[0],toHours:hm[0],toMinutes:((self.get('isReportBuilder')) ? '00' : hm[1])});
        }
    }.observes('endTime'), //NO I18N
    willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		$(document).unbind('mouseup.opm-custom-time-chooser',this.listOpenCloseEvent); //NO I18N
	}
});
OPMClient.OpmMonitorsTableViewComponent = Ember.Component.extend({
	templateName: "components/opm-monitors-table-view",//NO I18N
	classNames:['grid-col']//No I18N
});
OPMClient.OpmhardwareWidgetsComponent = Ember.Component.extend({
	templateName: "components/opm-hardware-widgets", //NO I18N
	showGrid: false,
	actions:{
		summaryExpandCollapse: function(){
			this.set('widgetData.apiData.summaryData', false);//NO I18N
			var parentId = '#widgetElement_'+this.get('widgetData').id;//NO I18N

			if(this.get('widgetData.apiData.summaryClass')=='gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable')
			{
				this.set('widgetData.apiData.summaryClass','gridStack-innerFullCol');//NO I18N
				this.refreshSummaryWidget();
				$("body").removeClass("inventoryHardwareWidgetExpand");//NO I18N
				$(parentId).removeClass('inventoryHardwareWidgetParentExpand');//NO I18N
					this.set('widgetData.apiData.summarytitleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N

			}
			else
			{
				this.set('widgetData.apiData.summaryClass','gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable');//NO I18N
				this.refreshSummaryWidget();
				$("body").addClass("inventoryHardwareWidgetExpand");//NO I18N
				$(parentId).addClass('inventoryHardwareWidgetParentExpand');//NO I18N
									this.set('widgetData.apiData.summarytitleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N

			}
		},
		RecentAlarmsExpandCollapse: function(){
			var parentId = '#widgetElement_'+this.get('widgetData').id;//NO I18N
			this.set('widgetData.apiData.alarmdata', false);//NO I18N
			if(this.get('widgetData.apiData.alarmClass')=='gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable')
			{
				this.set('widgetData.apiData.alarmClass','gridStack-innerFullCol');//NO I18N
				this.refreshRecentAlarmsWidget();
				$("body").removeClass("inventoryHardwareWidgetExpand");//NO I18N
				$(parentId).removeClass('inventoryHardwareWidgetParentExpand');//NO I18N
					this.set('widgetData.apiData.titleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N
			}
			else
			{
				this.set('widgetData.apiData.alarmClass','gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable');//NO I18N
				this.refreshRecentAlarmsWidget();
				$("body").addClass("inventoryHardwareWidgetExpand");//NO I18N
				$(parentId).addClass('inventoryHardwareWidgetParentExpand');//NO I18N
									this.set('widgetData.apiData.alarmtitleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N

			}
		},
		SensorExpandCollapse: function(){
			var parentId = '#widgetElement_'+this.get('widgetData').id;//NO I18N
			this.set('widgetData.apiData.sensordata', false);//NO I18N
			if(this.get('widgetData.apiData.sensorClass')=='gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable')
			{
				this.set('widgetData.apiData.sensorClass','gridStack-innerFullCol');//NO I18N
				this.refreshSensorDataWidget();
				$("body").removeClass("inventoryHardwareWidgetExpand");//NO I18N
				$(parentId).removeClass('inventoryHardwareWidgetParentExpand');//NO I18N
					this.set('widgetData.apiData.sensortitleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N

			}
			else
			{
				this.set('widgetData.apiData.sensorClass','gridStack-innerFullCol dashboardWidgetExpandView expandViewGraphTable');//NO I18N
				this.refreshSensorDataWidget();
				$("body").addClass("inventoryHardwareWidgetExpand");//NO I18N
				$(parentId).addClass('inventoryHardwareWidgetParentExpand');//NO I18N
									this.set('widgetData.apiData.sensortitleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N

			}
		},
		refreshTableWidget:function(name){
			switch (name)
		    {

		        case "summary"://NO I18N
		        	this.set('widgetData.apiData.summaryData', false);//NO I18N
					this.refreshSummaryWidget();
		            break;
		        case "alarm"://NO I18N
		        	this.set('widgetData.apiData.alarmdata', false);//NO I18N
					this.refreshRecentAlarmsWidget();
		            break;
		        case "sensor"://NO I18N
		        	this.set('widgetData.apiData.sensordata', false);//NO I18N
					this.refreshSensorDataWidget();
		            break;
			}
		},
		setManageUnmanage:function(isManage){
			var self = this;
			var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/enableOrDisableIPMISensors',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
			var selData = $('#gridsensorList').jqGrid('getGridParam','selarrrow');//No I18N
			var sensorIDs = [];
			for(var i=0;i<selData.length;i++)
			{
				sensorIDs.push($('#gridsensorList').jqGrid("getRowData",selData[i]).sensorid);//No I18N
		}
			if(sensorIDs.length===0)
			{
				opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneRecord",this));//No I18N
				return;
			}	
			var data = {flag:isManage,sensorIDs:sensorIDs.toString()};
			var manageCallBck = function(response){
				showMessage(response);
				if(response.error == undefined){
					self.send('refreshTableWidget','sensor'); //No I18N
					$('.actionDropDown').addClass('disabledBlock');//No I18N
				}
			}
			opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),manageCallBck);//No I18N
		},
		suppressUnsuppressAlarm:function(suppress){
			var self = this;
			var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/ConfigureSuppressAlarm',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
			var selData = $('#gridsensorList').jqGrid('getGridParam','selarrrow');//No I18N
			var sensorIDs = [];
			for(var i=0;i<selData.length;i++)
			{
				sensorIDs.push($('#gridsensorList').jqGrid("getRowData",selData[i]).sensorid);//No I18N
			}
			if(sensorIDs.length===0)
			{
				opm_infoMsgs("errorMsg",Ember.I18n.t("jsp.commonstr.SelAtleastOneRecord",this));//No I18N
				return;
			}
			var data = {};
			data.name = OPMClient.InventoryDeviceDetailsController.deviceName;
			data.type = 'Monitors'; //No I18N
			data.monType = 'SENSOR'; //No I18N
			data.monitorID = sensorIDs.toString();
			data.suppressInterval = (suppress) ? -1 : 0;
			var suppressCallBck = function(response){
				showMessage(response);
				if(response.error == undefined){
					self.send('refreshTableWidget','sensor'); //No I18N
					$('.actionDropDown').addClass('disabledBlock');//No I18N
				}
			}
			opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),suppressCallBck);//No I18N
		},
		configureBulkSensorThreshold:function(deviceName,widgetIndex) {
			OPMClient.SettingsConfigurationController.set("preSelectMonitorType","hardwareMonitors");//No I18N
			location.href = window.OPM.apiclientUrl+"Settings/Configurations/QuickConfig/EditThresholds"; //No I18N
		}
	},
	GridInitialize: function(){
		var showPromotion = !this.get('widgetData.apiData.hardwareData');
		if(showPromotion)
		{
		 	this.set('showPromotion',showPromotion);//NO I18N
		 				this.set('widgetData.sizey',10); //No I18N

			return;
		}
		var sensorDetails = this.get('widgetData.apiData.hardwareData.sensorDetails');
		$.each(sensorDetails, function(key,val){
			sensorDetails[key].index = key;
		});
		 this.set('widgetData.apiData.hardwareData.sensorDetails',sensorDetails);//NO I18N
		this.set('widgetData.apiData.summarytitleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
		this.set('widgetData.apiData.alarmtitleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
		this.set('widgetData.apiData.sensortitleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
		this.refreshSummaryWidget();
		this.refreshRecentAlarmsWidget();
		this.refreshSensorDataWidget();
		}.observes("widgetData.apiData.hardwareData").on('init'),//NO I18N
	didInsertElement:function() {
		if(window.OPM.isNewSnapshotPage && showPromotion ==  false){
			$('.grid-stack').addClass('grid-stack-hardware');//No I18N
		}
		var reload = true;
		var shortSummary = false;
		var self = this;
		var jsonData = this.get('widgetData.apiData');//NO I18N
		var currentWidgetData = this.widgetData;
		var snapId = currentWidgetData.id;
		var widgetElement=$('div[data-widget-id="' + snapId + '"]');//NO I18N
		//$(".inventoryWidget").remove();
		var showPromotion = this.get('showPromotion');//NO I18N
		if(showPromotion)
		{
			$('div[data-widget-id="' + snapId + '"] .headerTitleSpan').text(Ember.I18n.t('webclient.hardware.info.Prerequisites.hardwareMonitoringPrerequisites',this));//NO I18N
		}
		else
		{
			widgetElement.addClass("dashboardWidget fullCol");
			$("#content-"+currentWidgetData.indexCount).siblings().first().remove();	//NO I18N
			$("#content-"+currentWidgetData.indexCount).removeClass("content");

		}
		this.set('widgetData.apiData.summaryClass','gridStack-innerFullCol');//No I18N
		this.set('widgetData.apiData.alarmClass','gridStack-innerFullCol');//No I18N
		this.set('widgetData.apiData.sensorClass','gridStack-innerFullCol');//No I18N

		if(jsonData.ipmiDetails && !jsonData.hardwareData.hardwareMonitoring){
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_IPMI_PAGE"});//No I18N
		}

	},
	refreshSensorDataWidget:function()
	{
		$('.actionDropDown').addClass('disabledBlock');//No I18N
		var self =this;
		self.get('parentView').set('snapshotObj.sensorDetails',self.get('widgetData.apiData.hardwareData.sensorDetails'));//No I18N
		var ajaxRequestUrl = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getSensorData?deviceName='+OPMClient.InventoryDeviceDetailsController.deviceName,OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
		$.ajax({
			url: ajaxRequestUrl,
			dataType: 'json',//No I18N
			type: 'GET',//No I18N
			async: true,
			self:self,
			success: function(response) {
				var gridCallBack = function(gridID,paramsObj){
					var gridH = $('#gbox_'+gridID.replace('#','')).height()+300 +$(".hwareList").height() + 1500;
					var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
					paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//NO I18N
				}
				var pageWidth = $('.content.singleInvWidget').width()/2;
				var colNames = [
						'',
						Ember.I18n.t('webclient.report.hardware.sensor',this),//No I18N
						Ember.I18n.t('webclient.report.hardware.value',this),//No I18N
						Ember.I18n.t('webclient.snapshot.testlinks.units',this),//No I18N
					 	'',//No I18N
						'',//No I18N
						Ember.I18n.t('webclient.action.actions',this),//No I18N
						'',//No I18N
						'',//No I18N
						'',
						'',''
					 ];
				var colModel= [
								{name:'id',index:'id',width:'10',hidden:true}, //No I18N
								{name:'sensorname',index:'sensorname',width:(pageWidth*(60/100)),formatter:showHardwareSensorStatus,classes:'cursorPointer'}, //No I18N
								{name:'value',width:(pageWidth*(15/100)),index:'value'}, //No I18N
								{name:'unitName',width:(pageWidth*(15/100)),index:'unitName'}, //No I18N
								{name:'sensorType',width:(pageWidth*(100/100)),index:'sensorType'}, //No I18N
								{name:'sensorstatus',index:'sensorstatus',hidden:true}, //No I18N
								{name:'actions',index:'actions',formatter:hardwareSensorsAction,width:(pageWidth*(20/100)),search:false,sortable:false,hidden:(window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition || window.OPM.isCentralServer || window.isoperator || !window.OPM.userPermissions.monitoringWrite)}, //No I18N
								{name:'isenabled',index:'isenabled',hidden:true}, //No I18N
								{name:'issuppressed',index:'issuppressed',hidden:true}, //No I18N
								{name:'sensorid',index:'sensorid',hidden:true}, //No I18N
								{name:'parameterUnitName',index:'parameterUnitName',hidden:true},//No I18N
								{name:'sensorNameCopy',index:'sensorNameCopy',formatter:function(cellvalue, options, rowdata){return opm_escapeHTML(rowdata.sensorname);},hidden:true}//No I18N
								];
				var defaultOptions = {"sortName":"sensorNameCopy","sortOrder":"asc","grouping":true,"groupingField":"sensorType","groupCollapse":true,"plusicon":"ui-icon ui-icon-triangle-1-e","minusicon":"ui-icon ui-icon-triangle-1-s"}; //No I18N
				var returndata = {};
				returndata.data= response.hardwareData.hardwareTableProps;
				returndata.colNames= colNames;
				returndata.colModels= colModel;
				returndata.delayRender=2;
				returndata.defaultOptions= defaultOptions;
				returndata.gridId= "gridsensorList";//NO I18N
				returndata.pagerId= "PagersensorList";//NO I18N
				returndata.onSelectFunction="OnselectsensorList";//No I18N
				returndata.defaultOptions.gridCallBack = gridCallBack;
				returndata.defaultOptions.gridCallBackParams={self:self};
				returndata.defaultOptions.hideExcel=true;
				returndata.defaultOptions.hideCSV=true;
				returndata.defaultOptions.searchOption=false;
				if(window.OPM.isOPMStandardEdition || window.OPM.isOPMLiteEdition || window.OPM.isCentralServer){
					defaultOptions.groupingText ="<b style='text-transform: capitalize;font-weight: 900;font-size: 105%; !important'>{0} ({1}) </b>"; //No I18N
				}else{
					returndata.defaultOptions.multiselect=true;
					defaultOptions.groupingText ="<input type='checkbox' class='mr-sm' name='sensorGroup' value='sensor_{0}' onchange='selectSpecificCategorySensors(\"sensor_{0}\",this.checked)'></input><b style='text-transform: capitalize;font-weight: 900;font-size: 105%; !important'>{0} ({1}) </b>"; //No I18N
				}
				self.set('widgetData.apiData.sensordata',returndata);//No I18N
				Ember.run.scheduleOnce('afterRender',this,function(){//No I18N
                    $(".actionDropDown__list ul li.alarmSuppressClass").removeClass("disabledBlock");//No I18N
/*					if($("#HwSuppressAlarm").attr("value")==="Disable")//No I18N
					{
						$(".actionDropDown__list ul li.alarmSuppressClass").addClass("disabledBlock");//No I18N
					}else{
						$(".actionDropDown__list ul li.alarmSuppressClass").removeClass("disabledBlock");//No I18N
					}*/
				});
				var sensorComponents = [];
				var sensorInfo = [];
				$.each(self.get('widgetData.apiData.hardwareData.sensorDetails'),function(k,v){
					var availableSensors = [];
					$.each(response.hardwareData.hardwareTableProps,function(){
						if(this.sensorType === v.name && this.unitName !== undefined){
							availableSensors.push({sensorName:this.sensorname});
						}
					});
					if(v.selected !== undefined){
						sensorComponents.push({parameterName:v.selected,availableSensors:availableSensors});
						sensorInfo.push({dispName:v.displayName,ascSort:true});
					}
				});
				self.get('parentView').setProperties({'snapshotObj.sensorComponents':sensorComponents,'snapshotObj.sensorInfo':sensorInfo});//No I18N
			}
		});
	},
	refreshRecentAlarmsWidget:function()
	{
		var self =this;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + "/alarm/listAlarms?deviceName="+OPMClient.InventoryDeviceDetailsController.deviceName+"&showHWAlarms=true";      //No I18N
		$.ajax({
			url: window.OPM.isOPMEEUnifiedConsoleView?eeClientReqToProbe(ajaxRequestUrl,OPMClient.InventoryDeviceDetailsController.eeProbeID):ajaxRequestUrl,
			dataType: 'json',//No I18N
			type: 'GET',//No I18N
			async: true,
			self:self,
			success: function(response) {
				var gridCallBack = function(gridID,paramsObj){
					var gridH = $('#gbox_'+gridID.replace('#','')).height()+300 +$(".hwareList").height() + 1500;
					var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
					paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//NO I18N
				}
				var pageWidth = $('.content.singleInvWidget').width()/2;
				var colNamesList = [Ember.I18n.t('webclient.fault.event.text',this),Ember.I18n.t('webclient.fault.alarm.operator',this),Ember.I18n.t('webclient.fault.details.properties.severity',this),Ember.I18n.t('webclient.fault.details.properties.modttime',this),Ember.I18n.t('webclient.api.ui.event.entity',this),'','','']; //No I18N
				var colModelList = [
					{ name: 'message', width:(pageWidth*(35/100)),index: 'message',classes:'cursorPointer',formatter:escapeHtmlTags}, //No I18N
					{ name: 'who', index: 'who',width:(pageWidth*(20/100)),classes:'cursorPointer'}, //No I18N
					{ name: 'statusStr', index: 'statusStr',width:(pageWidth*(25/100)),classes:'cursorPointer',formatter:severityColorIcon,sorttype: function(cellval,rowData){return rowData.statusNum}}, //No I18N
					{ name: 'modTime', index: 'modTime',width:(pageWidth*(20/100)),classes:'cursorPointer', sorttype: function(cellval,rowData){return rowData.modTimeLong}}, //No I18N
					{ name: 'entity', index: 'entity', hidden:true, width:"0",classes:"GridColHidden", formatter: escapeHtmlTags}, //No I18N
					{ name: 'statusNum', index: 'statusNum', hidden:true,width:"0",classes:"GridColHidden"}, //No I18N
					{ name: 'modTimeLong', index: 'modTimeLong', hidden:true,width:"0",classes:"GridColHidden"}, //No I18N
					{ name: 'id', index: 'id',sortable:false,hidden:true} //No I18N
				];
				var defaultOptions = {"toggleSearch":false,"searchOption":true,"sortName":"modTime","sortOrder":"desc"};//No I18N
				defaultOptions.minRowsPerPage=25;
                var returndata = {};
				returndata.data= response;
				returndata.delayRender=1;
				returndata.colNames= colNamesList;
				returndata.colModels= colModelList;
				returndata.defaultOptions= defaultOptions;
				returndata.onSelectFunction= "opm_DeviceAlarmsList";//NO I18N
				returndata.gridId= "gridRecentAlarms";//NO I18N
				returndata.pagerId= "PagerRecentAlarms";//NO I18N
				returndata.onSelectFunction="OnselectRecentAlarms";//No I18N
				returndata.defaultOptions.hideExcel=true;
				returndata.defaultOptions.hideCSV=true;
				returndata.defaultOptions.Search=false;
				returndata.defaultOptions.gridCallBack = gridCallBack;
				returndata.defaultOptions.gridCallBackParams={self:self};
				self.set('widgetData.apiData.alarmdata',returndata);//No I18N
			}
		});
	},
	refreshSummaryWidget:function()
	{
					$('.grid-stack').addClass('grid-stack-hardware');//No I18N

		var self =this;
		var ajaxRequestUrl = window.OPM.apiUrlPattern + '/device/getHardwareDetails?deviceName='+OPMClient.InventoryDeviceDetailsController.deviceName; //No I18N
		$.ajax({
		url: ajaxRequestUrl,
		dataType: 'json',//No I18N
		type: 'GET',//No I18N
		async: true,
		self:self,
		success: function(jsonData) {
			        var colNames = [
						Ember.I18n.t('webclient.firewall.snap.vpntunnelname',this),//No I18N
						Ember.I18n.t('jsp.commonstr.Value',this)//No I18N
					 ];
					var colModelList = [
						{ name: 'name', index: 'name'}, //No I18N
						{ name: 'value', index: 'value',formatter:setIPMIHWInfoValue} //No I18N
					];
					var returndata = {};
					returndata.data = getHardwareInfo(jsonData.hardwareData);
					returndata.colNames= colNames;
					returndata.colModels= colModelList;
					returndata.gridId= "gridSummaryList";//NO I18N
					var gridCallBack = function(gridID,paramsObj){
						var gridH = $('#gbox_'+gridID.replace('#','')).height()+300 +$(".hwareList").height() + 1500;
						var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
						paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
						paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
						paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//NO I18N
					}
					returndata.defaultOptions={};
					returndata.pagerId= "Pagersummary";//NO I18N
					returndata.onSelectFunction="Onselectsummary";//No I18N
					returndata.defaultOptions.gridCallBack = gridCallBack;
					returndata.defaultOptions.gridCallBackParams={self:self};
					returndata.defaultOptions.hideExcel=true;
					returndata.defaultOptions.hideCSV=true;
					returndata.defaultOptions.Search=false;
					returndata.defaultOptions.autoencode = false;
					self.set('widgetData.apiData.summaryData',returndata);//No I18N
			}
	});
	},
	willDestroyElement:function() {
		if(window.OPM.isNewSnapshotPage){
			$('.grid-stack').removeClass('grid-stack-hardware');//No I18N
		}
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmCommonSunburstComponent = Ember.Component.extend({
	didInsertElement: function(){
		if(Object.keys(this.graphData).length>0){
			sunburst('sunburstGraph',this.graphData); //No I18N
		}
	},
	willDestroyElement: function(){
		//Removing events
		$('#'+this.elementId).find('*').off();
		$('#'+this.elementId).find('*').unbind();
		//Remove d3 Elements
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
		this.graphData=null;
	}
});
OPMClient.OpmUCSRelationshipComponent = Ember.Component.extend({
	templateName: "components/opm-ucs-relationship",//No I18N
	showGraph:true,
	didInsertElement: function(){
		if(this.widgetData.apiData!==undefined && this.widgetData.apiData!==null && Object.keys(this.widgetData.apiData).length>0 && this.widgetData.ondemandWidget!==true){
			this.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?35:21); //No I18N
			this.set('widgetData.noData',false); //No I18N
		}else if(this.widgetData.ondemandWidget!==true){
			this.set('widgetData.sizey',2); //No I18N
			this.set('widgetData.noData',true); //No I18N
		}
		else if(this.widgetData.ondemandWidget===true){
			this.set('widgetData.sizey',2); //No I18N
			this.set('widgetData.noData',false); //No I18N
		}
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
	},
	willClearRender: function(){
		this.set('showGraph',false); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmUCSOverviewComponent = Ember.Component.extend({
	templateName: "components/opm-graph",//No I18N
	showGraph: false,
	didInsertElement: function(){
		var self = this;
		var jsonData = this.get('widgetData').apiData;
		var multiData = new Array();
		if (jsonData.serviceProfileDetails != null) {
			var arr = new Array();
			arr.push(Ember.I18n.t('webclient.devices.customfields.associated',this)); //No I18N
			arr.push(jsonData.serviceProfileDetails.ProfileAssoicatedServer);
			multiData.push(arr);
			arr = new Array();
			arr.push(Ember.I18n.t('webclient.snapshot.unassociated',this)); //No I18N
			arr.push(jsonData.serviceProfileDetails.totalServer - jsonData.serviceProfileDetails.ProfileAssoicatedServer);
			multiData.push(arr);
		}
		var height = 400;
		var chartObj = {
			id:"perfGraph1"+jsonData.id,//No I18N
			type:'pie', //dial, bar,area,line,pie //No I18N
			subType:"simplePie",//simplePie , semiDount, simpleDount,gaugeDial,simpleDial//No I18N
			customClass:"opm_pie",//No I18N
			jsonData:multiData,
			height:height,
			columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Profiles",columnname_2:"Value",timeFormat:'hours'},//No I18N
			legend : {
				"colorBox": { //No I18N
		            "shape": "circle", //No I18N
		            "strokeOpacity": 1 //No I18N
		        },
		        "fontFamily": "'LatoRegular'", //No I18N
		        "fontSize": 16, //No I18N
				"hAlign": "center", //No I18N
				"vAlign": "bottom" //No I18N
			}
		}
		if(multiData != undefined && multiData!==null && Object.keys(multiData).length > 0 && self.get('widgetData.ondemandWidget')!==true){
			self.set('chartObj',chartObj);//No I18N
			self.set('showGraph',true);//No I18N
			self.set('widgetData.noData',false); //No I18N
			self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?21:13); //No I18N
			if(self.get('widgetData.reloadWidget')){
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
			}
		}
		else if(self.get('widgetData.ondemandWidget')!==true){
			self.set('showGraph',false); //No I18N
			self.set('widgetData.noData',true); //No I18N
			self.set('widgetData.sizey',2); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
		}
		else if(self.get('widgetData.ondemandWidget')===true){
			self.set('widgetData.noData',false); //No I18N
			self.set('showGraph',false); //No I18N
			self.set('widgetData.sizey',2); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
		}
	},
	willDestroyElement:function() {
		//Remove d3 Elements
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
		this.chartobj=null;
	}
});
OPMClient.OpmGraphComponent = Ember.Component.extend({
	templateName: "components/opm-graph", // No I18N
	showGraph: false,
	didInsertElement:function() {
		opm_buildGraphChart(this);
	},
	willDestroyElement:function() {
		//Remove d3 Elements
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
		this.chartobj=null;
	}
});
OPMClient.OpmVOIPSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-voip-summary", //No I18N
	didInsertElement:function(){
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',15);//No I18N
			this.set('sectionStyle','margin-top:120px;');//No I18N
			var adjustedHeight = $('#'+this.elementId+' .DIGmCustomScroll').closest('.grid-stack-item').height();//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({//No I18N
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}else{
			this.set('sectionStyle','margin-top:50px;');//No I18N
		}
	},
	willDestroyElement:function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmVoipSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-voip-details-summary", //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmVoipDialsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-voip-dials-summary",
	didInsertElement:function() {
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(jsonData.dials != null && jsonData.dials[0] != undefined && jsonData.dials.length == 3) {
			var jsonObj = {"latencySD":jsonData.digitalMeters[0].Latency,"PktLossSD":jsonData.digitalMeters[1].PacketLoss,"avgJitterSD":jsonData.dials[0].avgJitterSD,"avgJitterDS":jsonData.dials[1].avgJitterDS,"avgRTT":jsonData.dials[2].avgRTT}; //No I18N
		} else {
			var jsonObj = {"latencySD":jsonData.digitalMeters[0].Latency,"PktLossSD":jsonData.digitalMeters[1].PacketLoss,"avgJitterSD":0,"avgJitterDS":0,"avgRTT":0}; //No I18N
		}
		self.setProperties({'dialData':jsonObj});
	}
});

OPMClient.OpmIPSLAGraphsComponent = Ember.Component.extend({
	templateName: "components/opm-ipsla-graphs",
	showGraph: false,
	didInsertElement:function() {
		var self = this;
		var graphParams = {};
		var apiResponse = this.get('widgetData').apiData;
		var noData=true;
		if(apiResponse.graphData!==undefined && apiResponse.graphData.length>0){
			for(var i=0;i<apiResponse.graphData.length;i++){
				if(apiResponse.graphData[i].data!==undefined && apiResponse.graphData[i].data.length>0){
					noData=false;
				}
			}
		}
		if(!noData) {
			graphParams.id = 'PerfGraph'+this.get('widgetData').id;
			graphParams.data = apiResponse.graphData;
			graphParams.xAxis = apiResponse.xyTitles[0];
			graphParams.yAxis = apiResponse.xyTitles[1];
			graphParams.graphType = 'area';//No I18N
			self.setProperties({'showGraph':true,'graphParams':graphParams});
			self.set('widgetData.noData',false); //No I18N
			self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?21:14); //No I18N
		}
		else{
			self.set('widgetData.noData',true); //No I18N
			self.set('widgetData.sizey',2); //No I18N
		}
		$(".expandTimeselcom .timeFrameDateInfo").hide();
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmWANSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-wan-summary",
	didInsertElement:function() {

		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',15);//No I18N
			this.set('sectionStyle','margin-top:120px;');//No I18N
			var adjustedHeight = $('#'+this.elementId+' .DIGmCustomScroll').closest('.grid-stack-item').height();//No I18N
			
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_SummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false}//No I18N 
			});
		}else{
			this.set('sectionStyle','margin-top:50px;');//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmWanSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-wan-details-summary",
	didInsertElement:function() {

		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmWanDialsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-wan-dials-summary",
	didInsertElement:function() {
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(jsonData.dials != null && jsonData.dials[0] != undefined && Object.keys(jsonData.dials[0]).length > 0) {
			var jsonObj = {
				"minRTT":jsonData.dials[0].minRTT, //No I18N
				"maxRTT":jsonData.dials[0].maxRTT, //No I18N
				"avgRTT":jsonData.dials[0].avgRTT,//No I18N
				"icmpEcho":jsonData.digitalMeters[0].ThresholdViolation,
				"icmpErrors":jsonData.digitalMeters[1].Errors
			}
		} else {
			var jsonObj = {
				"minRTT":0, //No I18N
				"maxRTT":0, //No I18N
				"avgRTT":0, //No I18N
				"icmpEcho":jsonData.digitalMeters[0].ThresholdViolation,
				"icmpErrors":jsonData.digitalMeters[1].Errors
			}
		}
		self.setProperties({'dialData':jsonObj});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmVideoSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-video-summary",
	didInsertElement:function() {

		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',20);//No I18N
			this.set('sectionStyle','margin-top:100px;');//No I18N
		}else{
			this.set('sectionStyle','margin-top:50px;');//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmVideoSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-video-details-summary",
	didInsertElement:function() {

		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmVideoDialsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-video-dials-summary",
	didInsertElement:function() {
		var currentWidgetData = this.widgetData;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		if(jsonData.dials != null && jsonData.dials[0] != undefined && jsonData.dials.length == 3) {
			var jsonObj = {"VideoJitterSD":jsonData.dials[0].VideoJitterSD,"VideoAvgIAJitterSrc":jsonData.dials[1].VideoAvgIAJitterSrc,"VideoAvgIAJitterDst":jsonData.dials[2].VideoAvgIAJitterDst,"LatencySD":jsonData.digitalMeters[0].LatencySD,"AvgPosNegJitter":jsonData.digitalMeters[1].AvgPosNegJitter}; //No I18N
		} else if(jsonData.dials != null && jsonData.dials[0] != undefined){
			var jsonObj = {"VideoJitterSD":jsonData.dials[0].VideoJitterSD,"VideoAvgIAJitterSrc":jsonData.dials[1].VideoAvgIAJitterSrc,"VideoAvgIAJitterDst":0,"LatencySD":0,"AvgPosNegJitter":0}; //No I18N
		}
		else{
			var jsonObj = {"VideoJitterSD":0,"VideoAvgIAJitterSrc":0,"VideoAvgIAJitterDst":0,"LatencySD":0,"AvgPosNegJitter":0}; //No I18N
		}
		self.setProperties({'dialData':jsonObj});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmUCSChassisSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ucs-chassis-summary", //No I18N
	didInsertElement:function(){
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',13);//No I18N
		}
	},
	actions:{
		redirectSnapshot: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.deviceName);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmUCSFabricSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ucs-fabric-summary",//No I18N
	didInsertElement:function(){
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',11);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmUCSChassisCountComponent = Ember.Component.extend({
	templateName: "components/opm-associated-dials",//No I18N
	classNames:['customDials'],
	showPage: true,
	holderId:'',
	didInsertElement:function() {
		var currentWidgetData = this.widgetData;
		this.set('holderId','snapHolder_'+currentWidgetData.snapid);//No I18N
		this.set('widgetData.apiDataArray',[]);//No I18N
		var jsonData = currentWidgetData.apiData;
		var cellCount = Math.ceil(Math.ceil(11/4)*6.5); //Using static length for dials
		// if(cellCount<=2 || cellCount.toString()==="NaN"){
		// 	cellCount=2;
		// }
		if(jsonData!==undefined && jsonData.ucsComponentsCount!==undefined && Object.keys(jsonData.ucsComponentsCount).length>0 && this.get('widgetData.ondemandWidget')!==true){
			this.set('widgetData.noData',false);	 //No I18N
			if(window.OPM.isNewSnapshotPage){
				cellCount = (Math.ceil(Object.keys(jsonData.ucsComponentsCount).length/2)*10)+3
			}
			this.set('widgetData.sizey',cellCount);//No I18N
		}
		else if(this.get('widgetData.ondemandWidget')!==true){
			this.set('widgetData.sizey',2); //No I18N
			this.set('widgetData.noData',true);		//No I18N
		}
		else if(this.get('widgetData.ondemandWidget')===true){
			this.set('widgetData.sizey',2); //No I18N
			this.set('widgetData.noData',false); //No I18N
		}
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);//No I18N
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1);//No I18N

		var ucsComponentsCountTitles = {
			chassisCount: Ember.I18n.t('webclient.devices.ucs.chassis',this),//No I18N
			chassisServerCount: Ember.I18n.t('webclient.devices.ucs.chassisservers',this),//No I18N
			rackServerCount: Ember.I18n.t('webclient.devices.ucs.rackmountserver',this),//No I18N
			fabricInterConnectCount: Ember.I18n.t('webclient.devices.ucs.fabricinterconnects',this),//No I18N
			fanModuleCount: Ember.I18n.t('webclient.devices.ucs.fanmodules',this),//No I18N
			serviceProfileCount: Ember.I18n.t('webclient.ucs.serviceprofile',this),//No I18N
			portCount: Ember.I18n.t('webclient.ucs.ethernetports',this),//No I18N
			iomCount: Ember.I18n.t('webclient.ucs.iomodule',this),//No I18N
			fexCount: Ember.I18n.t('webclient.ucs.fex',this),//No I18N
			adaptorCount: Ember.I18n.t('webclient.ucs.adaptorunit',this),//No I18N
			processorCount: Ember.I18n.t('webclient.ucs.processunit',this)//No I18N
		}
		var self =this;
		$.each(jsonData.ucsComponentsCount, function(key,val){
			self.get('widgetData.apiDataArray').push({snapHolderId:'ucsComponentsCount_'+key,value:val,iconTitle:ucsComponentsCountTitles[key]});
		});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmReportBuilderGraphComponent = Ember.Component.extend({
	templateName: "components/opm-report-builder-graph", //No I18n
	showData: false,
	tagName:'',
	didInsertElement: function(){
		var self = this;
		var graphDetails = self.get('graphDetails');
		if(graphDetails !== undefined && graphDetails !== null){
			if(graphDetails.interfaceName || (graphDetails.graphs !== undefined && graphDetails.graphs.length > 0 && graphDetails.graphs[0].intfName)){
				self.set('isInterfacesTab',true); //NO I18N
			}
		}
		if(!self.get('isTableView')){
			var graphDetails = self.get('graphDetails');
			var graphSettings = {noDataHandler:{htmlEl:getNoDataHandler('no-schedule',Ember.I18n.t('webclient.opm.snapshot.monitor.graph.nodata.message'),Ember.I18n.t('webclient.opm.snapshot.monitor.graph.nodata.message2'),'',self.get('isInstantWidget'))}};//No I18N
var isDataAvailable = (
    graphDetails &&
    Array.isArray(graphDetails.graphs) &&
    graphDetails.graphs.length > 0 &&
    Array.isArray(graphDetails.graphs[0].data) &&
    graphDetails.graphs[0].data.length > 0 &&
    Array.isArray(graphDetails.graphs[0].data[0]) &&
    graphDetails.graphs[0].data[0].length > 0
);
            var isInterfacesTab = self.get('isInterfacesTab');
			if(self.graphStyle !== undefined){
				graphSettings.graphStyle = self.graphStyle;
			}
			if(isInterfacesTab){
				graphSettings.format = {type:'SIprefix'};//NO I18N
			}
			OPMClient.graphSettingsController.getData(self,false,graphSettings);
			self.setProperties({loadGraphFilters:true,hideMinMaxAvgFilter:true,isLegendRight:('right' === self.get('graphFeatureSettings.legendPlacement')),showAddWidget:(self.get('showAddWidgetOption') && isDataAvailable),hideGraphStyleFilter:!isDataAvailable,chartId:self.get('isInstantWidget') ? 'perfGraph_IW'+graphDetails.graphIndex : 'perfGraph_'+graphDetails.graphIndex});//NO I18N
			
			setGraphFilterTypes(self,true);
		}
		self.send('loadGraph');//No I18N
	},
	actions:{
		doGraphFilter:function(graphFilterType,isGraphStyle){
            var self = this;
            var doApplyGraphFilter = function(){
                self.setProperties({showData:false});
                Ember.run.scheduleOnce('afterRender',function(){//No I18N
                    self.send('loadGraph',true);//No I18N
                });
            }
            if(isGraphStyle){
                if(self.get('graphFeatureSettings.graphStyle') !== graphFilterType){
                    self.setProperties({'graphFeatureSettings.graphStyle':graphFilterType});//No I18N
                    setGraphFilterTypes(self,true);
                    doApplyGraphFilter();
                }
            }
        },
        loadGraph:function(isStyleChange){
        	var self = this;
        	var graphDetails = cloneObject(self.get('graphDetails'));
			var monitorTitle = graphDetails.monitorName;
			if(self.get('isTableView')){
				var tableViewGridProps = self.get('tableViewGridProps');
				var gridUID = 'reportGrid_'+graphDetails.gridIndex;//No I18N
				var colNames = cloneObject(tableViewGridProps.colNames);
				var colModel = cloneObject(tableViewGridProps.colModel);
				var tableData = graphDetails.tableData;
				if(monitorTitle !== undefined && OPMClient.ReportsDetailsController.hwMonitorsList !== undefined && OPMClient.ReportsDetailsController.hwMonitorsList.indexOf(monitorTitle.trim()) > -1) {
					colNames.splice(2,2);
					colModel.splice(2,2);
				}
				if(graphDetails.yAxisText){
					monitorTitle += ' - '+graphDetails.yAxisText;
				}else if(monitorTitle === undefined || !(OPMClient.ReportsDetailsController.hwMonitorsList !== undefined && OPMClient.ReportsDetailsController.hwMonitorsList.indexOf(monitorTitle.trim()) > -1)) {
					monitorTitle = Ember.I18n.t('webclient.tableview');//No I18N
				}
				if(isInterfacesTab){
					if(graphDetails.monitorName.indexOf('Interfaces Availability') > -1){
						colNames = [Ember.I18n.t('webclient.topo.interfaceName'),Ember.I18n.t('webclient.reports.tags.DeviceName'),Ember.I18n.t('widget.name.intfavail')+" (%)"];//No I18N
						colModel = [{name: 'interfaceDisplayName',index: 'interfaceDisplayName',sorttype:'text'},//No I18N
									{name: 'deviceDiplayName',index: 'deviceDiplayName',sorttype:'text'},//No I18N
        							{name: 'Availability',index: 'Availability',sorttype:'int'}//No I18N
        							];
					}else{
						if('monitors' === graphDetails.viewType || ('table' === graphDetails.viewType)){//No I18N
							colNames.splice(0,0,Ember.I18n.t('webclient.topo.interfaceName'));//No I18N
							monitorTitle = graphDetails.monitorName;
						}else{
							colNames.splice(0,0,Ember.I18n.t('webclient.devices.addmssql.monitorname'));//No I18N
							monitorTitle = tableData[0].intfDisplayName;
						}
						colModel.splice(0,0,{name:'instance',index:'instance',search:false});//No I18N
					}
				}else{
					if('monitor' === graphDetails.viewType){
						var instanceIndex = colModel.map(function(obj){return obj.index}).indexOf('instance');
						if(instanceIndex > -1){
							colNames.splice(instanceIndex,1);
							colModel.splice(instanceIndex,1);
						}
					}else if('deviceName' === graphDetails.viewType){//NO I18N
						graphDetails.headers.splice(0,0,Ember.I18n.t('webclient.Device.Name'));//No I18N
						colNames = graphDetails.headers;
						colModel = [];
						$.each(colNames,function(index,colName){
							if(index === 0){
								colModel.push({name:'deviceDiplayName',index:'deviceDiplayName',search:false});
							}else{
								colModel.push({name:colName,index:colName,search:false});
							}
						});
						tableData = graphDetails.result;
					}
				}
				self.setProperties({gridUID:gridUID,showData:true,monitorTitle:monitorTitle});
				Ember.run.scheduleOnce('afterRender',function(){//NO I18N
					opm_loadJQgridWithData('#'+gridUID,tableData,colNames,colModel,'','','reportBuilderGrid',tableViewGridProps.defaultOptions);//No I18N
				});
			}else{
				graphDetails.graphData = graphDetails.graphs;
				if(graphDetails.deviceName){
					monitorTitle = graphDetails.deviceName +' - '+monitorTitle;
				}
				if(graphDetails.interfaceName){
					monitorTitle = graphDetails.interfaceName;
					if(graphDetails.monitorName !== undefined){
						monitorTitle += ' - '+graphDetails.monitorName;	
					}
					monitorTitle += ' ('+graphDetails.deviceName+')';
				}
				if(graphDetails.isMultiGroup === true && graphDetails.graphReportType === 'Individual') { //No I18N
					monitorTitle += ' - '+graphDetails.groupName; //No I18N
				}
		        self.setProperties({consolidatedValues:graphDetails.consolidatedValues,monitorTitle:monitorTitle,showData:true});
				if(isStyleChange || self.get('isInstantWidget') ||  self.get('isDashboardWidget')){
		        	var maxRange = null;
					var minRange = null;
					var xAxis = '';
					var yAxis = '';
					var needExactMinMaxInGraph = false;
					var consolidatedValues = graphDetails.consolidatedValues || {};
					$.each(consolidatedValues,function(index,eachConsolidatedObject){
						if(eachConsolidatedObject.exactMinVal !== undefined && eachConsolidatedObject.exactMaxVal !== undefined){
							needExactMinMaxInGraph = true;
							if(maxRange < eachConsolidatedObject.exactMaxVal) {
								maxRange = eachConsolidatedObject.exactMaxVal;
							}
						}
					});
		        	if(graphDetails.xyTitles === undefined){
						graphDetails.xyTitles = [(graphDetails.xAxis ||Ember.I18n.t('webclient.vimonitor.Time')),(graphDetails.yAxisText || '')];//No I18N
					}
					xAxis = graphDetails.xyTitles[0];
			    	yAxis = graphDetails.xyTitles[1];
					if(graphDetails.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || graphDetails.xyTitles[1].toLowerCase().indexOf("percentage") !== -1 || graphDetails.xyTitles[1].indexOf("%") !== -1){//No I18N
						maxRange = 105;
						minRange = 0;
					}
					if(self.get('isInterfacesTab')){
						minRange = 0;//interface monitors will always be positive values, hence minrange will always be 0
					}
					var chartObj = getZChartObject(self.get('chartId'),'',xAxis,yAxis,minRange,(graphDetails.exactMaxRange !== undefined && graphDetails.exactMaxRange !== '' ? graphDetails.exactMaxRange : maxRange),self.get('selectedPeriod'),'',graphDetails,self,'');//No I18n
					chartObj.columns.timeFormat = self.get('selectedPeriod');
					chartObj.marginBottom =undefined;
					chartObj.marginTop =undefined;
					chartObj.isSummaryReport = (
						graphDetails &&
						graphDetails.widgetData &&
						graphDetails.widgetData.WidgetAdditionalData &&
						graphDetails.widgetData.WidgetAdditionalData.graphReportType === 'Summary'//No I18N
					);

					if (self.get('isInstantWidget')) {
						chartObj.isInstantWidget = true;
						chartObj.height = 180;
						var chartType = $('.add-instant-widget__chart-types div.active').attr("type");
						var graphReportType = $("#graphReportType").val();
						if (graphReportType == 'Summary') {
							chartObj.columns.datatype_1 = 'ordinal';//No I18N
						}
						if ((chartType === 'topn' || chartType === 'bottomn') && $("#graphReportType").val() === 'Normal') {
							chartObj.type = 'line';
						} else if ((chartType === 'topn' || chartType === 'bottomn') && $("#graphReportType").val() !== 'Normal') {//No I18N
							chartObj.type = 'bar';
						} else {
							chartObj.type = chartType;
						}
					}
					else if (self.get('isDashboardWidget')) {
						chartObj.isDashboardWidget = true;
						chartObj.axes.xaxis.label.text = xAxis
						chartObj.type = this.get('chartType');
						if (chartObj.isSummaryReport || this.get('graphReportType') == 'Summary') {
							chartObj.columns.datatype_1 = 'ordinal';//No I18N
							chartObj.isSummaryReport = true;	
						}
						
						if (
							graphDetails &&
							graphDetails.widgetData &&
							graphDetails.widgetData.WidgetAdditionalData &&
							graphDetails.widgetData.WidgetAdditionalData.graphReportType === 'Summary'//No I18N
						) {
							chartObj.tooltip[1] = '{{val(1)}}';
						}
					}
					else
					{
						if(needExactMinMaxInGraph){
							hideBlinkIcon = [];
							showBlinkIcon = [];
							chartObj.notes = opm_setCustomNotesChart(consolidatedValues,undefined,chartObj.seriesNameVsColorCodeArray);
							chartObj.legend.events = {
								click:function(ele,d,i,chartObj){
									opmCustomNoteBlinkUpdate(ele,d,i,chartObj);
								}
							}
						}
						chartObj.isReportBuilderGraph = true;

					}
				    if(yAxis || yAxis == 'Bits per Second'){
                        chartObj.columns.format = {"type":"SIprefix"};//NO I18N
                        chartObj.columns.suffix = '';
                        chartObj.dataTypeObj = chartObj.dataTypeObj || {};
                        chartObj.dataTypeObj[1] = chartObj.dataTypeObj[1] || {};
                        chartObj.dataTypeObj[1].numeric = {
                            format:{"type":"SIprefix"},//NO I18N
                            tooltipformat:{"type":"SIprefix","suffix":" "+yAxis}//NO I18N
                        };
                    }
		        	Ember.run.scheduleOnce('afterRender',function(){//No I18N
		        		zChart({placeholder:[chartObj.id],chartobj:[chartObj]});
		        	});
		        }
			}
        },
        addAsWidget:function(){
        	var self = this;
        	var moIds = self.get('graphDetails.entityMoid') || self.get('graphDetails.moIds');
        	var isMultiGroup = (self.get('graphDetails.isMultiGroup') === true && self.get('graphDetails.graphReportType') === 'Individual');//No I18N
        	var groupMoid = self.get('graphDetails.groupMoid');
        	self.get('parentView').send('addAsWidget',self.get('graphFeatureSettings.graphStyle'),self.get('graphDetails.policyName'),moIds,isMultiGroup,groupMoid);//No I18N
        }
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		clearTimeout(this.get('timeoutConst'));
	}
});
OPMClient.OpmEntitySelectionComponent = Ember.Component.extend({
	templateName: "components/opm-entity-selection", //No I18n
	didInsertElement: function(){
		OPMClient.entitySelectionController.setProperties({selectedEntities:this.selectedEntities,isInterfacesTab:this.isInterfacesTab})
		OPMClient.entitySelectionController.initEditDeviceProps();
	},
	actions:{
		populateDeviceList:function(){
			OPMClient.entitySelectionController.populateDeviceList();
		},
		applyDeviceFilter:function(){
        	OPMClient.entitySelectionController.listEntities();
        },
        gotoEditNext:function(){
			OPMClient.entitySelectionController.setProperties({isDeviceSelection:false});
		},
		changeOption:function(objectName,selectedKey,selectedValue){
			this.get('parentView').send('changeOption',objectName,selectedKey,selectedValue);//No I18N
		},
		selectMonitors:function(policyName){
			this.get('parentView').send('selectMonitors',policyName);//No I18N
		},
		doUpdateDevice:function(){
			this.get('parentView').send('doUpdateDevice',OPMClient.entitySelectionController.selectedEntities);//No I18N
		},
		cancelOperation:function(){
			this.get('parentView').send('openEditDevice',false);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		OPMClient.entitySelectionController.resetProps();
	}
});
OPMClient.OpmIntfGraphsComponent = Ember.Component.extend({
	templateName: "components/opm-Intf-graph", //No I18n
	classNames:['width100','heightAuto'], //No I18n
	showGraph: false,
	didInsertElement: function(){
		var self = this;
		var apiResponse = cloneObject(this.get('widgetData').apiData);
		var graphData = [];
		var consolidatedValues = [];
		var graphHeight = (window.OPM.isNewSnapshotPage)?18:12;
		var instLen = 0;
		var isDataAvailable = false;
		if(apiResponse.error && apiResponse.error == 8314){
            self.set('uniqueId',opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.opm.snapshot.monitor.graph.time.extended.message',this)));//No I18N
        }
		if (Object.keys(apiResponse).length !== 0)
		{
			if(apiResponse.graphData != null && apiResponse.graphData && Object.keys(apiResponse.graphData).length > 0) {
				graphData = apiResponse.graphData;
				isDataAvailable = true;
			}
			if(apiResponse.consolidatedValues !== undefined && Object.keys(apiResponse.consolidatedValues).length > 0){
				instLen = Number(Object.keys(apiResponse.consolidatedValues).length);
				if(instLen >= 2)
				{
					graphHeight = 12+Math.round(instLen * 0.9);
					if(window.OPM.isNewSnapshotPage){
						graphHeight = 26+Math.round(instLen * 1.5);
					}
				}
				else
				{
					graphHeight = 12+Math.round(instLen * 0.5);
					if(window.OPM.isNewSnapshotPage){
						graphHeight = 28;
					}
				}
				consolidatedValues = apiResponse.consolidatedValues;
			}
		}
		var suffix = apiResponse.suffix !== undefined ? apiResponse.suffix : ""; //No I18N
		var x_axes = apiResponse.xyTitles !== undefined ? apiResponse.xyTitles[0] : "";//No I18N
		var y_axes = apiResponse.xyTitles !== undefined ? apiResponse.xyTitles[1] : "";//No I18N

		if(OPMClient.FWAGlobalDataController.timePeriod===undefined && OPMClient.FWAGlobalDataController.timePeriod === ""){
			OPMClient.FWAGlobalDataController.timePeriod = "today"; //No I18N
		}
		var maxRange = null;
		var minRange = null;
		if(apiResponse.xyTitles!==undefined && apiResponse.xyTitles[1]!==undefined && (apiResponse.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || apiResponse.xyTitles[1].toLowerCase().indexOf("percentage")!=-1 || apiResponse.xyTitles[1].indexOf("%")!=-1)){//No I18N
			maxRange = 100;
			minRange = 0;
		}

		var graphSettingsObject = self.get('widgetData.graphSettings');
		if(graphSettingsObject === undefined){
			graphSettingsObject = Ember.ArrayController.create(cloneObject(self.get('controller').get('snapshotObj.graphSettingsObject')));
		}
		//To enable/disable or show/hide Min/Max/Avg filters
		graphSettingsObject.setProperties({showGraphFilters:(!!apiResponse.showGraphFilters && isDataAvailable),hideMinMaxAvgFilter:(apiResponse.showGraphFilters === undefined),disableStyleFilter:!isDataAvailable});
		var widgetParams = self.get('widgetData.parameters');
		var graphPeriod = '';
		var policyName = '';
		if(widgetParams !== undefined && widgetParams.length){
			var paramsArray = widgetParams.map(function(obj){return obj.param;});
			graphPeriod = widgetParams[paramsArray.indexOf('period')].value;
			policyName = widgetParams[paramsArray.indexOf('graphName')].value;
		}
		var jsonData = {graphData:graphData,consolidatedValues:consolidatedValues,thresholds:apiResponse.thresholds,suffix:suffix,xyTitles:apiResponse.xyTitles};
		var tooltip = ['{{val(0)}}','<div style="margin-right:0.35em;display:inline-block;vertical-align:middle;padding:0.35em;background:{{clr}}"></div>{{val(2)}}: {{val(1)}}'];//No I18n
		var chartObj = getZChartObject('perfGraph_'+self.get('widgetData.id'),'consolidatedData_'+self.get('widgetData.id'),x_axes,y_axes,minRange,(apiResponse.exactMaxRange !== undefined && apiResponse.exactMaxRange !== "" ? apiResponse.exactMaxRange :maxRange),graphPeriod,tooltip,jsonData,graphSettingsObject,'interfaceGraph');//No I18n
		chartObj.policyName = policyName;

		this.set('IntfGraph',false); //No I18n
		if(apiResponse.consolidatedValues !== undefined)
		{
			if(apiResponse.exactMaxRange !== undefined && apiResponse.exactMaxRange !== "")
			{
        		this.set('IntfGraph',true);	//No I18n
				chartObj.notes = opm_setCustomNotesChart(apiResponse.consolidatedValues,apiResponse.seriesNames);
				chartObj.legend.events = {
					"click":function (ele, d, i, chartObj) { //No I18n
						opmCustomNoteBlinkUpdate(ele, d, i, chartObj);
		        	}
		        }
		    }
		}
		if(isDataAvailable){
			self.setProperties({chartObj:chartObj,consolidatedValues:jsonData.consolidatedValues,graphSeries:(apiResponse.seriesNames !== undefined ? apiResponse.seriesNames : []),showGraph:true,'widgetData.noData':false,'widgetData.sizey':graphHeight}); //No I18n
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N

		}else{
			self.set('showGraph',false); //No I18N
			if(self.get('widgetData.ondemandWidget')===true){
				self.set('widgetData.noData',false); //No I18N
			}
			else{
				self.set('widgetData.noData',true); //No I18N
			}
			self.set('widgetData.showEnhancedGraphOptions',false); //No I18N
			self.set('widgetData.sizey',3); //No I18N
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
		}
		self.setProperties({'widgetData.hideExpand':true,'widgetData.graphSettings':graphSettingsObject});//No I18N
	},
	reRendering:function() {
		if(this.get('IntfGraph') && OPMClient.InventoryDeviceDetailsController.isIntfGraphTab){
			this.rerender();
		}
  	}.observes('OPMClient.InventoryDeviceDetailsController.isIntfGraphTab'),//No I18N
	willDestroyElement: function(){
		$('#'+this.uniqueId).remove();
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmGraphNodataComponent = Ember.Component.extend({
	templateName: "components/opm-graph-nodata", //No I18n
	didInsertElement: function(){
		if(this.isServiceGraph){
			$('.graphNoData').addClass('fullHeight');
		}
		if(this.isMiniGraph){
			$('.graphNoData').removeClass('graph-divs-small-blkgrad');
		}
	},
	actions: {
	    gotoDCErrorLogs:function() {
     		 this.get('parentView').send('gotoDCErrorLogs') //No I18N
	    }
	 },
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmGeneratecsrInputsComponent = Ember.Component.extend({
	classNames:['opmForm'],
	cName:'',
	stateL:'',
	country:'',
	organization:'',
	orgunit:'',
	san:'',
	location:'',
	isoCountries:isoCountries,
	countryPrompt: Ember.I18n.t('webclient.fwa.select.country',this), //No I18N
	impSelectTriggerErrorMsg: Ember.I18n.t('webclient.settings.ImportCertificate.slectcountyprompt',this),//No I18N
	impSelectTriggerError:false,
	didInsertElement: function() {
		this.set("actionLink", window.OPM.apiUrlPattern + '/admin/createCSR'+(window.OPM.isMSPCentral?"?selCustomerID="+window.OPM.selCustomerID+"&regionID="+window.OPM.selRegionID:"") + (window.OPM.isOPMCentral && window.OPM.selectedEEProbe !== undefined && window.OPM.selectedEEProbe !== "-1" ? ("?eeProbeID=" + window.OPM.selectedEEProbe) : "")); //No I18n
	},
	resetSelection: function(){
		this.set('cName',''); //No I18N
		this.set('stateL',''); //No I18N
		this.set('country',''); //No I18N
		this.set('organization',''); //No I18N
		this.set('orgunit',''); //No I18N
		this.set('san',''); //No I18N
		this.set('location',''); //No I18N
	},
	actions:{
		generateCSR: function(){
			var fieldsToValidate = {'empty':['impCommonName','impOrgUnit','impOrg','impState','impLocation']};//No I18N
	    	var isValid = opm_validateFields(fieldsToValidate);
	    	if(this.country===undefined || this.country===null || this.country===""){
	    		this.set('impSelectTriggerError',false);//No I18N
	    		this.set('impSelectTriggerError',true);//No I18N
	    	}
	    	else if(isValid){
          		$('input[name=opmcsrftoken]').val(readCsrfToken('opmcsrfcookie'));
			var subjectAlternateNames = $('input[name=SubjectAlternateNames]').val().split(',');
			$('input[name=SubjectAlternateNames]').val(JSON.stringify(subjectAlternateNames));
	    		$('#csrForm').submit();
	    		this.resetSelection();
	    	}
		},
		resetOperation: function(){
			this.resetSelection();
		},
		cancelOperation: function(){
			this.sendAction('action','cancel'); //No I18N
		}
	}
});
OPMClient.OpmSslCertDetailsComponent = Ember.Component.extend({
	actions:{
		importServerCertificate: function(){
			this.sendAction("action","importServerCertificate");//No I18N
		},
		disableWeakTLS:function(){
			var self = this;
 			var state = ($("input[name='disableweaktls']").is(":checked"))?"enable":"disable";//No I18N
			var confirmMsg = (state==="enable")?Ember.I18n.t("webclient.settings.ImportCertificate.disable.weaktls.confirmmsg",this):Ember.I18n.t("webclient.settings.ImportCertificate.enable.weaktls.confirmmsg",this);//No I18N

			opmConfirm("", confirmMsg, '', function(){
				var jsonResponse = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/updateWeakTLSVersion',{state:state});//No I18N
	     		showMessage(jsonResponse);
	     		if(jsonResponse!==undefined && jsonResponse.result!==undefined && jsonResponse.result.message!==undefined){
					self.sendAction("action","showRestartMessage");//No I18N
	     		}
				if(OPMClient.ApplicationController.fromSecRecPage === "disableOldTLS"){
					opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
				} else {
					setSecurityScore();
				}
			},"", function(){
				$("input[name='disableweaktls']").prop("checked",!$("input[name='disableweaktls']").is(":checked"));
			}, "", "", "dialogStyle2","", "", "", "", "", true);
 		},
 		disableWeakCiphers:function(){
      var self = this;
 			var state = ($("input[name='disableweakciphers']").is(":checked"))?"enable":"disable";//No I18N
			var confirmMsg = (state==="enable")?Ember.I18n.t("webclient.settings.ImportCertificate.disable.weakciphers.confirmmsg",this):Ember.I18n.t("webclient.settings.ImportCertificate.enable.weakciphers.confirmmsg",this);//No I18N

			opmConfirm("", confirmMsg, '', function(){
				var jsonResponse = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/updateWeakCiphers',{state:state});//No I18N
	     		showMessage(jsonResponse);
	     		if(jsonResponse!==undefined && jsonResponse.result!==undefined && jsonResponse.result.message!==undefined){
	     			self.sendAction("action","showRestartMessage");//No I18N
	     		}
				 if(OPMClient.ApplicationController.fromSecRecPage === "disableWeakCiphers"){
					opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
				} else {
					setSecurityScore();
				}
			},"", function(){
				$("input[name='disableweakciphers']").prop("checked",!$("input[name='disableweakciphers']").is(":checked"));
			}, "", "", "dialogStyle2","", "", "", "", "", true);
 		}
	}
});

OPMClient.OpmRouterGraphsComponent = Ember.Component.extend({
	templateName: "components/opm-device-traffic", //No I18N
	classNames:['width100','heightAuto'], //No I18N
	didInsertElement: function(){
		var self = this;
		var apiResponse = cloneObject(this.get('widgetData').apiData);
		var graphSettingsObject = self.get('widgetData.graphSettings');
		if(graphSettingsObject === undefined){
			graphSettingsObject = Ember.ArrayController.create(cloneObject(self.get('controller').get('snapshotObj.graphSettingsObject')));
		}
		graphSettingsObject.setProperties({showGraphFilters:true,hideMinMaxAvgFilter:true,disableStyleFilter:true});
		if(apiResponse.graphData!==undefined && apiResponse.graphData.length!=0){
			var maxRange = null;
			var minRange = null;
			if(apiResponse.xyTitles!==undefined && apiResponse.xyTitles[1]!==undefined && (apiResponse.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || apiResponse.xyTitles[1].toLowerCase().indexOf("percentage")!=-1 || apiResponse.xyTitles[1].indexOf("%")!=-1)){//No I18N
				maxRange = 100;
				minRange = 0;
			}
			var graphData = apiResponse.graphData;
			graphSettingsObject.setProperties({disableStyleFilter:false});
			var widgetParams = self.get('widgetData.parameters');
			var graphPeriod = '';
			if(widgetParams !== undefined && widgetParams.length){
				var paramsArray = widgetParams.map(function(obj){return obj.param;});
				graphPeriod = widgetParams[paramsArray.indexOf('period')].value;
			}
			var jsonData = {graphData:graphData,consolidatedValues:[]/*,suffix:apiResponse.yAxis*/};
			var tooltip = ['{{val(0)}}','<div style="margin-right:0.35em;display:inline-block;vertical-align:middle;padding:0.35em;background:{{clr}}"></div>{{val(2)}}: {{val(1)}}'];//No I18n
			var chartObj = getZChartObject('PerfGraph'+self.get('widgetData.id'),'consolidatedData_'+self.get('widgetData.id'),'',apiResponse.yAxis,minRange,(apiResponse.exactMaxRange !== undefined && apiResponse.exactMaxRange !== "" ? apiResponse.exactMaxRange :maxRange),graphPeriod,tooltip,jsonData,graphSettingsObject,'interfaceGraph');//No I18n
			self.setProperties({chartObj:chartObj,showGraph:true,consolidatedValues:[],graphSeries:[],'widgetData.noData':false,'widgetData.sizey':((window.OPM.isNewSnapshotPage)?23:18)});//No I18N
		}else{
			self.setProperties({showGraph:false,'widgetData.sizey':14,'widgetData.showEnhancedGraphOptions':false});//No I18N
		}
		self.setProperties({'widgetData.hideExpand':true,'widgetData.graphSettings':graphSettingsObject});//No I18N
		self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
		self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		if(self.get('widgetData.reloadWidget')){
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		if(apiResponse.error && apiResponse.error.code && apiResponse.error.code == 8314){
			this.set('isTimePeriodExtended',true);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNxChildEntitiesBarGraphComponent = Ember.Component.extend({
	templateName: "components/opm-device-traffic", //No I18N
	classNames:['width100','heightAuto'], //No I18N
	didInsertElement: function(){
		var self = this;
		self.set('widgetData.showEnhancedGraphOptions', false); // No I18N
		self.set('widgetData.showGrphExpandOption', false); // No I18N
		var apiResponse = cloneObject(this.get('widgetData').apiData);
		if(!apiResponse) {
			return;
		}
		var hostSeries = { seriesname: Ember.I18n.t("webclient.nutanix.hostcount"), data: [] };//No I18N
		var vmSeries = { seriesname: Ember.I18n.t("webclient.nutanix.vmcount"), data: [] };//No I18N
		$.each(apiResponse,function(clusterName,counts){
			hostSeries.data.push([clusterName, counts.hostCount]);
			vmSeries.data.push([clusterName, counts.VMCount]);
		});
        var graphData = [hostSeries, vmSeries];


        var chartObj = {
			id:'PerfGraph'+self.get('widgetData.id'),//No I18N
			type:'bar',//No I18N
			jsonData:graphData,
			series:"multi",//No I18N
			height:300,
			columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:Ember.I18n.t("webclient.snapshot.name.Cluster"),columnname_2:Ember.I18n.t("webclient.common.widgets.eventcount")}, // No I18N
			chart:{stacked:false},
			legend:{
				"colorBox":{"shape":"circle","strokeOpacity":1},//No I18N
				"fontFamily":"'LatoRegular'","fontSize":16,"hAlign":"center","vAlign":"bottom"//No I18N
			}
		};

        self.setProperties({chartObj:chartObj,showGraph:true,'widgetData.noData':false,'widgetData.sizey':(window.OPM.isNewSnapshotPage?23:18)});//No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmIpmiSensorComponent = Ember.Component.extend({
	templateName: "components/opm-ipmi-sensor", //No I18N
	didInsertElement: function(){
		initJSTreeforSensorInfo(this);
	},
	actions:{
		showGraph:function(data,isSingle){
			var self = window.OPM.currentView.handler.controller;
			var newData = {};
			if(!isSingle){
				newData = {parameterName:data.paramName,sensorName:data.compData[0].sensorName};
				if(!data.showGraph){
					return;
				}
			}else{
				if(data.disableClass){
					return;
				}
				newData = data;
			}
			self.set("model.sensorData",$.extend(true,{},newData)); //No I18N
			if(OPMClient.FWAGlobalDataController.startTime != undefined && OPMClient.FWAGlobalDataController.endTime != undefined){
				self.setProperties({'model.customStartTime':OPMClient.FWAGlobalDataController.startTime,'model.customEndTime':OPMClient.FWAGlobalDataController.endTime});//No I18N
			}
			resetCustomTimeFilter();
			//SHOW_IPMI_OLD_GRAPH
			// if(window.OPM.showIPMIOldGraph){
			// 	redirectSnapShot('IPMISensorGraph');//No I18N
			// }else{
				var paramsList = self.get('sensorComponents').map(function(obj){return obj.parameterName});
				var sensorCompDispName = (data.sensorComponent || data.dispName);
				openPerformanceMonEnhancedGraph(newData.parameterName,newData.sensorName,'hardware',true,sensorCompDispName,'','','',{paramsList:paramsList,selectedParam:newData.parameterName,IPMIData:{sensorComponents:self.get('sensorComponents'),sensorInfo:self.get('sensorInfo'),selectedSensor:data.sensorName}});//No I18N
			// }
		},
		editThreshold:function(data){
			var self = window.OPM.currentView.handler.controller;
			self.set("model.sensorData",data); //No I18N
			redirectSnapShot('IPMIEditThreshold'); //No I18N
		},
		setManageUnmanage:function(isManage){
			var self = this;
			var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/enableOrDisableIPMISensors',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
			var data = {flag:isManage,sensorIDs:self.get('widgetData.selectedSensors')}; //No I18N
			var manageCallBck = function(response){
				showMessage(response);
				if(response.error == undefined){
					self.set('widgetData.selectedSensors',undefined);//No I18N
					self.send('refreshSensorWidget'); //No I18N
				}
			}
			opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),manageCallBck);//No I18N
		},
		suppressUnsuppressAlarm:function(param,isMultiple){
			var self = this;
			var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/ConfigureSuppressAlarm',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
			var sensorIds = '';
			var suppress = false;
			if(isMultiple){
				sensorIds = self.get('widgetData.selectedSensors'); //No I18N
				suppress = param;
			}else{
				sensorIds = param.sensorId;
				suppress = !param.isSuppressed;
			}
			var data = {};
			data.name = OPMClient.InventoryDeviceDetailsController.deviceName;
			data.type = 'Monitors'; //No I18N
			data.monType = 'SENSOR'; //No I18N
			data.monitorID = sensorIds.toString();
			data.suppressInterval = (suppress) ? -1 : 0;
			var suppressCallBck = function(response){
				showMessage(response);
				if(response.error == undefined){
					if(isMultiple){
						self.set('widgetData.selectedSensors',undefined);//No I18N
					}
					self.send('refreshSensorWidget'); //No I18N
				}
			}
			opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),suppressCallBck);//No I18N
		},
		sortBySensorName:function(compName){
			var self = this;
			var sensorInfo = self.get('widgetData.sensorInfo');
			var arrIndex = sensorInfo.map(function(obj){
		        return obj.name;
		    }).indexOf(compName);
		    var selectedData = sensorInfo[arrIndex];
		    var descSort = self.get('widgetData.sortedComponents');

		    if(!selectedData.ascSort){
				selectedData.compData.sort(objCompareAsc);
				if(descSort.indexOf(compName) > -1){
					descSort.splice(descSort.indexOf(compName),1);
				}
				selectedData.classBinding = 'sortIcon ifValue ifValueSensor asc';//No I18N
			}else{
				selectedData.compData.sort(objCompareDes);
				descSort.push(compName);
				selectedData.classBinding = 'sortIcon ifValue ifValueSensor desc';//No I18N
			}

			selectedData.ascSort = !selectedData.ascSort;
			self.rerender();
		},
		refreshSensorWidget:function(isClearSelection){
			var self = this;
			var hardwareData = self.get('widgetData.apiData.hardwareData');
			var parentModel = window.OPM.currentView.handler.controller;
			var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getSensorData',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
			var data = {deviceName:OPMClient.InventoryDeviceDetailsController.deviceName};
			var response = opm_ajaxGetResponse(url,data);
			var newData = new Array();
			var sensorComponents = new Array();
			var openedNodes = ['sensorInfo'];
			var descSort = self.get('widgetData.sortedComponents');
			if(isClearSelection){
				self.set('widgetData.openedNodes',openedNodes);//No I18N
				self.set('widgetData.selectedSensors',undefined);//No I18N
				descSort.splice(0,descSort.length);
			}
			if(response != undefined && hardwareData != undefined){
				var sensorDetails = hardwareData.sensorDetails;
				$.each(sensorDetails,function(k,v){
					var data = [];
					var availableSensors = [];
					var ascSort = true;
					if(descSort.indexOf(v.name) > -1){
						ascSort = false;
					}
					var parent = {dispName:v.displayName,name:v.name,id:'sensor'+v.name.replace(/\s/g,''),paramName:v.selected?v.selected:undefined,//No I18N
									ascSort:ascSort,classBinding:ascSort?'sortIcon ifValue ifValueSensor asc':'sortIcon ifValue ifValueSensor desc'}; //No I18N
					var showGraph = false;
					$.each(response.hardwareData.hardwareTableProps,function(){
						if(this.sensorType == v.name){
							var sensor = {sensorId:this.sensorid,sensorStatus:this.sensorstatus,sensorName:this.sensorname,statusString:this.statusstr,
											sensorUnits:this.unitName?this.unitName:'-',sensorValue:this.value != undefined?this.value:'-',
											disableClass:this.value != undefined?'':'disabledBlock',iconClass:'--fault-severity icon-status'+this.sensorstatus, //No I18N
											alarmIcon:this.issuppressed?'iconAlarmActive':'iconAlarm',alarmid:'alarmIcon'+this.sensorid, //No I18N
											alarmTitle:this.issuppressed ? Ember.I18n.t('webclient.opm.perf.snapshot.ipmi.unsuppress.alarms',this) : //No I18N
											Ember.I18n.t('webclient.inventory.suppressalarms',this),//No I18N
											isSuppressed:this.issuppressed,parameterName:this.parameterUnitName,sensorComponent:v.displayName};
							if(!this.isenabled){
								sensor.iconClass = '--fault-severity icon-status7';//No I18N
							}
							data.push(sensor);
							availableSensors.push({sensorName:this.sensorname});
							if(showGraph == false && this.value != undefined){
								showGraph = true;
							}
						}
					});
					if(ascSort){
						data.sort(objCompareAsc);
					}else{
						data.sort(objCompareDes);
					}
					parent.compData = data;
					parent.showGraph = showGraph;
					newData.push(parent);
					if(v.selected !== undefined){
						sensorComponents.push({parameterName:v.selected,availableSensors:availableSensors});
					}
				});
				self.set('widgetData.editThreshold',Ember.I18n.t('webclient.admin.devicetype.newTempl.editThresh',this)); //No I18N
				self.set('widgetData.alarmSuppressClass',''); //No I18N
/*				if(hardwareData.hardwareInfo != undefined && hardwareData.hardwareInfo.HW_ALARM_ENABLED == 'true'){
					self.set('widgetData.alarmSuppressClass','disabledBlock'); //No I18N
				}*/
				if(response.hardwareData != undefined){
					newData.hardwareLastPolledTime = response.hardwareData.hardwareLastPolledTime;
				}
			}
			self.set('widgetData.sensorInfo',newData); //No I18N
			if(newData.length > 0){
				openedNodes.push(newData[0].id);
			}
			parentModel.setProperties({'model.sensorComponents':sensorComponents,'model.sensorInfo':newData}); //No I18N
			if(!self.get('widgetData.openedNodes')){
				self.set('widgetData.openedNodes',openedNodes); //No I18N
			}
			self.rerender();
		}
	},
	initializeSensorWidget:function(){
		this.set('ipmiSensorClass','gridStack-innerFullCol');//No I18N
		this.set('widgetData.sortedComponents',[]);//No I18N
		this.send('refreshSensorWidget'); //No I18N
	}.observes('widgetData.apiData.hardwareData').on('init'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmIPMIHardwareComponent = Ember.Component.extend({
	templateName: "components/opm-ipmi-hardware", //No I18N
	didInsertElement: function(){
		var self = this;
		var currentWidgetData = this.widgetData;
		var selectedList = new Array();

		if(window.OPM.isNewSnapshotPage){
			$('.grid-stack').addClass('grid-stack-hardware');//No I18N
		}

		$('div[data-widget-id="' + currentWidgetData.id + '"]').addClass("dashboardWidget fullCol");//No I18N
		$("#content-"+currentWidgetData.indexCount).siblings().first().remove();//No I18N
		$("#content-"+currentWidgetData.indexCount).removeClass("content");
		$('#select2-sensorComponentSelect-container').css('width','150px');//No I18N

		if(!$.isEmptyObject(currentWidgetData.apiData.hardwareData)){
			$.each(currentWidgetData.apiData.hardwareData.sensorDetails,function(){
				if(this.selected){
					selectedList.push(this.selected);
				}
			});
			if(!selectedList.length){
				selectedList.push(currentWidgetData.apiData.hardwareData.selectedParamterName);
			}
		}

		self.set('sensorParams',{selectedList:selectedList,selected:selectedList[0],graphPeriods:getIPMIGraphPeriods(),period:'twelvehours'});//No I18N
	},
	sizeChangeObserver:function(){
		var self = this;
		Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
			var height = $('#ipmiSensorInfo').height()+$('#ipmiHWGraph').height();//No I18N
			var cellCount = Math.ceil((height)/(self.snapshotObj.snapDetails.yScale));
			if(window.OPM.isNewSnapshotPage){
				cellCount = Math.ceil((height+25)/22);
			}
			self.set('widgetData.sizey',cellCount);//No I18N
			$('#hardwareGraphList_id').css('left','0px');
			if(window.OPM.isCentralServer || !window.OPM.isAuthorized){
				$('.jsTreeType1.checkBox ul li a').css('padding-left','0px');
				$('.jsTreeType1.interfaceDiscoveryTable ul li ul li.jstree-open a div.tableHeading').css('padding-left','20px');
			}
		});
	}.observes('widgetData.changeHeight').on('init'),//No I18N
	willDestroyElement: function(){
		if(window.OPM.isNewSnapshotPage){
			$('.grid-stack').removeClass('grid-stack-hardware');//No I18N
		}
		$('#'+this.elementId).find('*').remove();
		resetCustomTimeFilter();
	}
});

OPMClient.OpmIpmiHardwareGraphComponent = Ember.Component.extend({
	templateName: "components/opm-ipmi-hardware-graph",//NO I18N
	didInsertElement: function(){
    	widgetPopupAction(['widgetTimeFilterLabel','widgetExportLabel'],['widgetPopupMenuTime','widgetPopupMenuExport']);

    	this.set('periodTitle',Ember.I18n.t('webclient.reports.timeframe.last12hrs',this));//No I18N
	},
	actions:{
		reloadWidget: function(){
			var self =this;
			var responseCallBackIPMIHardware = function(jsonData){
				self.set('graphParams',false);//NO I18N
				var graphData = new Array();
				var legendSummary = new Array();
				var queryUnits = '';
				var unitText = '';
				if(jsonData.hardwareData != undefined){
					var hardwareData = jsonData.hardwareData.hardwareChartData;
					$.each(hardwareData,function(key,value){
						var xyData = new Array();
						$.each(value,function(){
							xyData.push([this.x*1000,this.y]);
						});
						graphData.push({yaxiscolumnorder:[0],seriesname:key,data:xyData});
					});
					if(jsonData.hardwareData.hardwareLegendSummary.length){
						legendSummary = jsonData.hardwareData.hardwareLegendSummary;
						queryUnits = legendSummary[0].queryUnits;
					}
				}
				self.set('noGraphData',!(graphData.length > 0));//No I18N
				if(queryUnits !== undefined && queryUnits !== ''){
	        		unitText = '<i style="font-family:LatoRegular">&nbsp;('+queryUnits+')</i>';//No I18N
	        	}

				var colNames = [
			   				Ember.I18n.t('webclient.cusreports.sensorname'),//No I18N
							Ember.I18n.t('opu.common.MINIMUM')+unitText,//No I18N
							Ember.I18n.t('webclient.reports.max')+unitText,//No I18N
						 	Ember.I18n.t('webclient.availability.datatype.average')+unitText,//No I18N
						 	"",""];
			   	var	colModel= [
							{name:'sensorname',index:'sensorname'}, //No I18N
							{name:'min',index:'min'}, //No I18N
							{name:'max',index:'max'}, //No I18N
							{name:'avg',index:'avg'}, //No I18N
							{name:'queryUnits',index:'queryUnits',hidden:true}, //No I18N
							{name:'id',index:'id',sortable:false,fixed:true,search:false}]; //No I18N
				var defaultOptions = {minRowsPerPage:10,skipNameEscapeCheck:true};

				Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
					self.setProperties({graphParams:getZChartObject('ipmiHardwareGraph','',Ember.I18n.t('webclient.admin.schedulereports.time'),queryUnits,null,null,self.get('sensorParams.period'),'',{graphData:graphData},self,'IPMI')});//NO I18N
					$('#hardwareGraphList').jqGrid('GridUnload');//No I18N
					$('.DI-Content').addClass('opm-graph-revamp');
					opm_loadJQgridWithData("#hardwareGraphList",legendSummary,colNames,colModel,"","hardwareGraph_gridPager","ipmiHwGraphList",defaultOptions); //No I18N
					self.set('widgetData.changeHeight',!self.get('widgetData.changeHeight'));//No I18N
					if(self.get('scrollToGraph')){
						$('.DIA-Content').scrollTop($('#ipmiSensorInfo').height());//No I18N
					}
					self.set('scrollToGraph',true);//No I18N
				});
			}
			var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getGraphData',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
			var data = {isHardwareGraph:true,name:OPMClient.InventoryDeviceDetailsController.deviceName,
						parameterName:this.get('sensorParams.selected'),period:this.get('sensorParams.period')};
			if(self.get('customDate')){
				data.period = 'custom';//No I18N
				data.startDate = self.get('customDate.startDate');
				data.endDate = self.get('customDate.endDate');
				self.set('periodTitle',Ember.I18n.t('webclient.admin.timeformat.custom',this));//No I18N
				self.set('sensorParams.period','custom');//No I18N
			}
			opm_ajaxGetResponseWithMsg(url,data,'',responseCallBackIPMIHardware);
			OPMClient.ApplicationController.set('ipmiHWGraphData',self);//No I18N
		},
		changeGraphPeriod:function(data){
			this.setProperties({periodTitle:data.title,customDate:undefined,'sensorParams.period':data.period});//NO I18N
			this.send('reloadWidget');//No I18N
		},
		reportExport:function(type){
			var self = this;
            if(type == 'xlsx'){
                var xlsObject = cloneObject(self.graphParams);
                xlsObject.graphData = xlsObject.jsonData;
                delete xlsObject.jsonData;
                xlsObject.displayName = self.get('sensorParams.selected');
                window.pdfheader = undefined;
                createXL(xlsObject,{'webclient.widget.devicename': OPMClient.InventoryDeviceDetailsController.deviceName});//No I18N
            }else{
            	var url = window.OPM.apiUrlPattern + '/reports/getExportDataForJson';//No I18N
                var data = {devicename:OPMClient.InventoryDeviceDetailsController.deviceName,ishardware:true,
                    parametername:self.sensorParams.selected,timeKey:self.sensorParams.period,isfluidic:true,
                	inventorysnapType:'MonitoringDevice'};//No I18N
                if(self.sensorParams.period == 'custom'){
                    data.starttime = self.get('customDate.startDate');
                    data.endtime = self.get('customDate.endDate');
                }
                exportFile(url,data,'POST');//No I18N
            }

		}
	},
	changeSensorComponent:function(){
		this.send('reloadWidget');//No I18N
	}.observes('sensorParams.selected'),//NO I18N
	initializeSensorWidget:function(){
		this.setProperties({graphParams:false,ipmiHardwareClass:'gridStack-innerFullCol',isExpand:false});//NO I18N
	}.observes('sensorParams').on('init'),//NO I18N
	willDestroyElement:function() {
		$( "body" ).removeClass( "inventoryHardwareWidgetExpand");
		$('.DI-Content').removeClass('opm-graph-revamp');
		delete OPMClient.ApplicationController.ipmiHWGraphData;
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmMonitorsAssociationComponent = Ember.Component.extend({
	templateName: 'components/opm-monitors-association',//No I18N
	didInsertElement: function(){
		if($('.multiSelectBox4').length){
			$('.multiSelectBox4').addClass('ApplicationServicesDeviceSelectionFixedHeight');
			$(".ApplicationServicesDeviceSelectionFixedHeight").css({'--ApplicationServicesDeviceSelectionFixedHeightY':($('.ApplicationServicesDeviceSelectionFixedHeight').offset().top)+'px'});//No I18N
		}
		this.setProperties({filterList:getNeededFilterCategories(false,false,false,true,true,false)});
	},
	actions:{
		associateToDevices:function(isDissociate){
			this.get('slideDetails.parentObj').send('associateToDevices');//No I18N
		},
		cancelOperation:function(){
			this.get('slideDetails.parentObj').send('closeSlide');//No I18N
		}
	},
	selectedFilterObserver:function(){
		var self = this;
		var selectedFilter = self.get('selectedFilter');
		var availableDevicesList = [];
		var selectedListMoNames = (self.get('slideDetails.parentObj.selectedDevicesList') || []).map(function(obj){return obj.value;});
		if(selectedFilter !== null && selectedFilter !== undefined){
			var apiURL = '/device/getDeviceListForFilter';//No I18N
			var data = {filterID:selectedFilter,excludeStorage:true,excludeIPMI:true,type:'DeviceTemplate'};//No I18N
			var isVirtualCategory = selectedFilter.includes('virtual_');//No I18N
			if(isVirtualCategory){
				apiURL = '/device/listDevices';//No I18N
				data = {selectedVTypes:selectedFilter.split('virtual_')[1]};
			}
			opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + apiURL,data,'',function(response){
				if(response !== undefined){
					var defaultListMoNames = (self.get('slideDetails.parentObj.defaultDevicesList') || []).map(function(obj){return obj.value;});
					if(!isVirtualCategory){
						if(response.remainingDevices !== undefined){
					    	$.each(response.remainingDevices, function(devMoName,devDisplayName){
							    if(defaultListMoNames.contains(devMoName) && !selectedListMoNames.contains(devMoName)){
					    			availableDevicesList.push({value:devMoName,displayName:devDisplayName});
							    }
					    	});
					    }
				    }else{
				    	$.each(response,function(listDevIndex,listDevObject){
				    		if(defaultListMoNames.contains(listDevObject.deviceName) && !selectedListMoNames.contains(listDevObject.deviceName)){
								availableDevicesList.push({value:listDevObject.deviceName,displayName:listDevObject.displayName});
							}
						});
				    }
			    	self.set('slideDetails.parentObj.availableDevicesList',availableDevicesList);//No I18N
			    }
			});
		}else{
			$.each(self.get('slideDetails.parentObj.defaultDevicesList') || [],function(){
			    if(!selectedListMoNames.contains(this.value)){
	    		availableDevicesList.push(this);
			    }
	    	});
			self.set('slideDetails.parentObj.availableDevicesList',availableDevicesList);//No I18N	
		}
	}.observes('selectedFilter'),//No I18N
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();
	}
});
/**
 * OpmDeviceFilterAssociationComponent - A reusable component for:
 * 1. Category filter dropdown
 * 2. Device type sub-filter dropdown
 * Updates OPMClient.ApplicationController.assoDetails via triggerAssociationComponent
 * so that the opm-association component on the page reflects the filtered device list.
 *
 * Usage:
 *   {{opm-device-filter-association
 *       selectedDevicesList=model.selDevicesList
 *       filterApiParams=filterApiParams
 *       isStorageDevNeeded=false
 *   }}
 * 
 * filterApiParams: optional object with extra params for the device list API call
 *   e.g. {excludeStorage:true, excludeIPMI:true, type:'urlTemplate', excludeOpenFWDevice:true}
 */
OPMClient.OpmDeviceFilterAssociationComponent = Ember.Component.extend({
	templateName: 'components/opm-device-filter-association',//No I18N
	filterSelectId: 'opm-device-filter-association-devCategory',//No I18N
	subFilterSelectId: 'opm-device-filter-association-devType',//No I18N
	selectedFilter: '',//No I18N
	filterList: null,
	categoryList: null,
	availableCategories: null,
	unavailableType: '',//No I18N
	isStorageDevNeeded: false,

	didInsertElement: function(){
		var self = this;
		var filterCategories = getFilterCategories(self.get('isStorageDevNeeded'), ["General", "virtualServers"]); // No I18N
		self.setProperties({
			filterList: filterCategories.filter,
			selectedFilter: filterCategories.filter[0].k,
			availableCategories: filterCategories.category
		});
		self.set("selectedFilter", filterCategories.filter[0].k) // No I18N
		self._loadDeviceList();
	},

	selectedFilterObserver: function(){
		var self = this;
		var categoryList = [];
		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
			var availableCategories = self.get('availableCategories');
			var selectedFilter = self.get('selectedFilter');
			if(availableCategories !== undefined && availableCategories !== null){
				if(selectedFilter === 'Infrastructure View'){
					categoryList.push({k:4,v:Ember.I18n.t('webclient.discovery.AllDevices',this)});
				}
				var selectedCategories = availableCategories[selectedFilter];
				if(selectedCategories !== undefined){
					$.each(selectedCategories,function(k,v){
						categoryList.push({k:k,v:v});
					});
				}
				if(categoryList[0] !== undefined){
					self.set('selectedDevType',categoryList[0].k);//No I18N
				}else{
					self.set('selectedDevType','');//No I18N
					var noFilterText = Ember.I18n.t('webclient.opm.settings.monitoring.urltemplate.associate.no.bvorgroups',{param0:selectedFilter},this);//No I18N
					self.set('unavailableType',noFilterText);//No I18N
				}
			}
			self.set('categoryList',categoryList);//No I18N
		});
	}.observes('selectedFilter'),//No I18N

	_loadDeviceList: function(filterId){
		var self = this;
		if(self.onFilterChange) {
			self.sendAction('onFilterChange',filterId);//No I18N
		}
	},

	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmEditThresholdsComponent = Ember.Component.extend({
	templateName: "components/opm-edit-thresholds", //No I18N
	didInsertElement: function(){
		var self = this;
		var numericType = Number(self.get('thresholdData.numericType'));
		self.set('numericType',numericType);//No I18N

		if(numericType === 2){
			thresholdTypes = [{v:'Contains',k:Ember.I18n.t('webclient.threshold.condition.contains',this)}, //No I18N
									{v:'Not Contains',k:Ember.I18n.t('webclient.admin.traps.notcontains',this)}, //No I18N
									{v:'Equals',k:Ember.I18n.t('webclient.threshold.condition.equals',this)}, //No I18N
									{v:'Not Equals',k:Ember.I18n.t('webclient.admin.traps.notequals',this)}, //No I18N
									{v:'Regex',k:Ember.I18n.t('webclient.threshold.matchRegex',this)}]; //No I18N
			self.setProperties({thresholdTypes:thresholdTypes,warningType:self.get('thresholdData.warningType'),
								troubleType:self.get('thresholdData.troubleType'),criticalType:self.get('thresholdData.criticalType'),
								rearmType:self.get('thresholdData.rearmType')}); //No I18N
		}else if(window.OPM.currentView.name.indexOf('Inventory.Device.IPMIEditThreshold') > -1){ //No I18N
			var thresholdType = self.get('thresholdData.thresholdType');
			var rearmType = getRearmValue(thresholdType);
			thresholdTypes = [{v:"max",k:">"},{"v":"maxEqual","k":">="},{"v":"min","k":"<"},{"v":"minEqual","k":"<="},{"v":"equal","k":"="},{"v":"notEqual","k":"!="}]; //No I18N
			rearmTypes = [{v:"minEqual","k":"<="},{"v":"min","k":"<"},{"v":"maxEqual","k":">="},{"v":"max","k":">"},{"v":"equal","k":"="},{"v":"notEqual","k":"!="}]; //No I18N
			
			self.setProperties({thresholdTypes:thresholdTypes,
				rearmTypes:rearmTypes,
				warningType:thresholdType,troubleType:thresholdType,criticalType:thresholdType,
				rearmType:rearmType,'thresholdData.rearmType':rearmType});//No I18N
			if(thresholdType === 'notEqual'){
				self.set('thresholdData.rearmDisabled',true); //No I18N
			}
		}
		else{
			var thresholdType = self.get('thresholdData.thresholdType');
			var rearmType = getRearmType(thresholdType);
			self.setProperties({thresholdTypes:[{v:'min',k:'<'},{v:'max',k:'>'},{v:'equal',k:'='},{v:'notEqual',k:'!='}],//No I18N
								rearmTypes:[{v:'min',k:'<='},{v:'max',k:'>='},{v:'equal',k:'='},{v:'notEqual',k:'!='}],//No I18N
								warningType:thresholdType,troubleType:thresholdType,criticalType:thresholdType,
								rearmType:rearmType,'thresholdData.rearmType':rearmType});//No I18N
			if(thresholdType === 'notEqual'){
				self.set('thresholdData.rearmDisabled',true); //No I18N
			}
		}

		var placeHolderI18nkey = ['','webclient.opm.dt.edit.integer.value','webclient.opm.dt.edit.string.value','webclient.opm.dt.edit.decimal.value'];//No I18N
		self.set('placeHolderMsg',Ember.I18n.t(placeHolderI18nkey[numericType],this));//No I18N
		Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
			self.setProperties({consecutiveTimeDisabled:!checkThresholdEnabledOrNot(self.get('pageId') || 'monitors')});//No I18N
		});
	},
	actions:{
		changeValue: function(){
			var self = this;
			if(self.get('numericType') === 2){
				self.setProperties({'thresholdData.warningType':self.get('warningType'),//No I18N
									'thresholdData.troubleType':self.get('troubleType'),//No I18N
									'thresholdData.criticalType':self.get('criticalType'),//No I18N
									'thresholdData.rearmType':self.get('rearmType')});//No I18N
				return;
			}
			var thresholdType = getThresholdType(self.get('warningType'),self.get('troubleType'),self.get('criticalType'));
			self.set('thresholdData.rearmDisabled',false); //No I18N

			$.each(['warningType','troubleType','criticalType'],function(index,thresholdLevel){//No I18N
				if(self.get(thresholdLevel) !== thresholdType){
					self.set(thresholdLevel,thresholdType);
					Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
						if(thresholdLevel === 'warningType'){
							thresholdLevel = 'attentionType';//No I18N
						}
						$('#'+thresholdLevel).trigger('change');
					});
				}
			});

			var rearmType = getRearmValue(thresholdType);
			self.setProperties({rearmType:rearmType,'thresholdData.thresholdType':thresholdType,'thresholdData.rearmType':rearmType});//No I18N
			Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
				$("#rearmType").trigger('change');
				if(thresholdType === 'notEqual'){
					self.setProperties({'thresholdData.rearmValue':'','thresholdData.rearmDisabled':true}); //No I18N
				}
				checkThresholdEnabledOrNot('monitors');//No I18N
			});
		}
	},
	thresholdChangeObserver:function(){
		checkThresholdEnabledOrNot('monitors');//No I18N
	}.observes('thresholdData.warningValue','thresholdData.troubleValue','thresholdData.criticalValue','thresholdData.rearmValue'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmAddCliCommandComponent = Ember.Component.extend({
	templateName: "components/opm-add-cli-command", //No I18N
	didInsertElement:function(){
		var self = this;
		self.setBreadcrumbHeaders(self);
		self.clearFormData(self);
		if(!self.get('MonitorDetails.policyName') && self.get('MonitorDetails.name')){
        	self.set('MonitorDetails.policyName',self.get('MonitorDetails.name'));//No I18N
        }
        self.viewCommands();
        self.setProperties({cliCommandSaveMsg:Ember.I18n.t('opm.perf.monitors.cli.command.change.info.dt'),showAddCommand:(window.OPM.userPermissions.adminAccess && !window.OPM.userPermissions.devGrouporBVRestricted)});//No I18N
        if(self.get('cliDetails.isMonitorPage')){
        	self.setProperties({selectedDevice:self.get('cliDetails.selectedDevice'),cliCommandSaveMsg:Ember.I18n.t('opm.perf.monitors.cli.command.change.info.device')});//No I18N
        }
	},
    resetTest:function(){
        var self = this;
        self.setProperties({isTestPassed:false,disableTest:!(self.get('formData.command'))});
    },
    validateForm:function(isSave){
    	var self = this;
    	var fieldsToValidate = {empty:['cliCommand','cliCommandName'],maxCheck:{cliCommandName:150,cliCommand:2000,cliDescription:500}};//No I18N
    	fieldsToValidate.custom = [{condition:perfTextBasicSymbols(self.get('formData.commandName')),identifier:'cliCommandName',message:Ember.I18n.t('webclient.admin.traps.specialchar')},{condition:/[<>]+/.test(self.get('formData.description')),identifier:'cliDescription',message:Ember.I18n.t('webclient.opm.advancedreport.specchar',{param0:'<>'})}];//No I18N
        return opm_validateFields(fieldsToValidate);
    },
	setBreadcrumbHeaders:function(self){
        var currentNavigation = 'editPage';//No I18N
        var headerArray = [];
        var closeTitle = '';
        headerArray = [{id:'viewCommands',name:Ember.I18n.t('opm.perf.monitors.cli.view.commands'),navigation:'viewCommands',show:true},//No I18N
        {id:'addCommand',name:Ember.I18n.t('opm.perf.monitors.cli.new.commands'),navigation:'newCommands',show:self.get('isNewCommandPage')}];//No I18N
        $.each(headerArray,function(index,object){
            if((index > 0) && object.show){
                currentNavigation = headerArray[index-1].navigation;
                closeTitle = Ember.I18n.t('webclient.msg.go.to')+' '+headerArray[index-1].name;//No I18N
                return false;
            }
        });
        if(!closeTitle){
            closeTitle = Ember.I18n.t('webclient.msg.go.to')+' '+Ember.I18n.t('webclient.action.editgraph');//No I18N
        }
        self.setProperties({breadcrumbHeaders:headerArray,currentNavigation:currentNavigation,closeTitle:closeTitle});
    },
    clearFormData:function(self){
        self.setProperties({formData:{commandName:'',command:'',description:''}});
    },
    viewCommands:function(isNewCommand,commandName,isSaveForPolling){
        var self = this;
        var apiRequestParams = {vendorName:self.get('cliDetails.vendorName'),graphName:self.get('MonitorDetails.policyName')};//No I18N
        if(self.get('cliDetails.isMonitorPage')){
        	apiRequestParams.pollId = self.get('MonitorDetails.Id');
        }
        opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + '/device/getCliCommands',apiRequestParams,'',function(response){//No I18N
        	if(response.error === undefined){
	            var commandList = [];
	            var selectedCommand = '';
	            if(Object.keys(response).length){
	                $.each(response,function(key,object){
	                    commandList.push({key:key,value:(object.DISPLAYNAME +' ('+ Ember.I18n.t(('true' === object.ISDEFAULT) ? 'webclient.admin.timeformat.default' : 'webclient.admin.timeformat.custom')+')')});//No I18n
	                    if(!selectedCommand && isNewCommand && (commandName === object.DISPLAYNAME)){
	                        selectedCommand = key;
	                    }
	                });
	                if(!selectedCommand){
	                    selectedCommand = self.get('MonitorDetails.oid') || commandList[0].key;
	                }
	            }
	            self.setProperties({commandList:commandList,responseData:response,selectedCommand:selectedCommand});
	            self.setBreadcrumbHeaders(self);
	            if(isSaveForPolling){
	                self.send('saveForPolling');//No I18N
	            }
	        }else{
	        	showMessage(response);
	        }
        });
        self.setProperties({disableEdit:true});
    },
    resetProps:function(self){
        self.setProperties({isTestPassed:false,isCLICommandPage:false,isNewCommandPage:false,disableEdit:true,selectedCommand:null});
        self.clearFormData(self);
    },
    resetTest:function(){
        var self = this;
        self.setProperties({isTestPassed:false,disableTest:!(self.get('selectedDevice') && self.get('formData.command'))});
    },
    getDeviceList:function(self){
		var apiRequestParams = {protocol:'CLI',type:self.get('cliDetails.deviceType')};//No I18n
		var deviceList = [];
		var selectedDevice = '';
		self.setProperties({selectedDevice:null});
		opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + '/device/listDevices',apiRequestParams,'',function(response){//No I18n
			if(response !== undefined && response.length){
				selectedDevice = response[0].deviceName;
				deviceList = response;
			}
			self.setProperties({deviceList:deviceList,selectedDevice:selectedDevice});
		});
	},
    selectedCommandObserver:function(){
        var self = this;
        var selectedCommand = self.get('selectedCommand');
        var responseData = self.get('responseData');
        if(selectedCommand && responseData[selectedCommand]){
            self.setProperties({enableSave:true,'formData.command':responseData[selectedCommand].CLICOMMAND,'formData.description':responseData[selectedCommand].INFO,disableEdit:true,isDefaultCommand:true/*(responseData[selectedCommand].ISDEFAULT === 'true')*/});
        }else{
            self.clearFormData(self);
            self.setProperties({enableSave:false});
        }

    }.observes('selectedCommand'),//No I18N
    deviceChangeObserver:function(){
		this.resetTest();
	}.observes('selectedDevice'),//No I18N
    commandChangeObserver:function(){
        this.resetTest();
    }.observes('formData.command'),//No I18N
    actions:{
    	addNewCommands:function(){
            var self = this;
            self.setProperties({isNewCommandPage:true,disableEdit:false,disableTest:true,previousData:{command:self.get('formData.command'),description:self.get('formData.description')}});
            self.clearFormData(self);
            if(!self.get('cliDetails.isMonitorPage')){
                self.getDeviceList(self);
                Ember.run.scheduleOnce('afterRender',function(){//No I18N
                    $('#deviceList').select2({minimumResultsForSearch:2}).on('select2:open',function(e){//No I18N
                        $(e.target).closest('.overflowYScroll').off('scroll.select2');
                    });
                });
            }
            self.setBreadcrumbHeaders(self);
        },
        testCommands:function(){
            var self = this;
            if(self.validateForm(false)){
                var apiRequestParams = {deviceName:self.get('selectedDevice'),isPerfMonitor:true,numericType:self.get('MonitorDetails.numericType'),command:self.get('formData.command'),graphName:self.get('MonitorDetails.policyName'),deviceType:self.get('cliDetails.deviceType'),commandName:self.get('formData.commandName')};
                self.setProperties({testMessage:''});
                var testInprogressMsg = '';
                if(window.OPM.isTFAEnabled){
                	testInprogressMsg = Ember.I18n.t('jsp.commonstr.TestingInProgress');//No I18N
                }else{
                	self.setProperties({disableTest:true,showTestInProgress:true});	
                }
                opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + "/device/testCliCommand",apiRequestParams,testInprogressMsg,{callback:function(response){//No I18N
                    if(response.error === undefined){
                        if(response.result !== undefined){
                            if(response.result[0].errorMsg !== undefined){
                                self.setProperties({testMessage:response.result[0].errorMsg});
                            }else{
                                self.setProperties({isTestPassed:true,cliCmdTestId:response.testId});
                                self.setBreadcrumbHeaders(self);
                                Ember.run.scheduleOnce('afterRender',function(){//No I18N
                                    $('#testResult').jqGrid('GridUnload');//No I18n
                                    var defaultOptions = {sortName:'instance',sortOrder:'asc',minRowsPerPage:5,Search:false,hideCSV:true,hideExcel:true};//No I18N
                                    opm_loadJQgridWithData('#testResult',response.result,[Ember.I18n.t('webclient.devices.details.instance'),Ember.I18n.t('webclient.widget.value')],[{name:'instance',index:'instance'},{name:'value',index:'value'}],'','','',defaultOptions); //No I18N
                                    $('.overflowYScroll').animate({scrollTop:500},'slow');//No I18N
                                });
                            }
                        }
                    }else{
                    	self.setProperties({testMessage:response.error.message});
                    }
                    self.setProperties({disableTest:false,showTestInProgress:false});
                },otpPageType:'dialog'});//No I18N
            }
        },
        saveNewCommand:function(isSaveForPolling){
	        var self = this;
	        var formData = self.get('formData');
	        if(self.validateForm(true)){
	            var apiRequestParams = {testId:self.get('cliCmdTestId'),commandName:self.get('formData.commandName'),description:self.get('formData.description'),vendorName:self.get('cliDetails.vendorName')};
	            opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/addCliCommand',apiRequestParams,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'),function(response){//No I18N
	                if(response.error === undefined){
	                    self.setProperties({isCLICommandPage:!isSaveForPolling,isNewCommandPage:false});
	                    self.viewCommands(true,formData.commandName,isSaveForPolling);
	                }
	                showMessage(response);
	            });
	        }
	    },
	    saveForPolling:function(){
	        var self = this;
	        var currentSelection = self.get('responseData')[self.get('selectedCommand')];
	        self.get('parentView').send('saveForPolling',self.get('selectedCommand'),currentSelection.DISPLAYNAME,self);//No I18N
	    },
        redirectPage:function(navigation){
            var self = this;
            if('viewCommands' === navigation){
                self.setProperties({isNewCommandPage:false,isTestPassed:false,showTestInProgress:false,testMessage:'',disableEdit:self.get('isDefaultCommand')});//No I18N
                if(self.get('previousData') !== undefined){
                    $.each(self.get('previousData'),function(key,value){
                        Ember.set(self.get('formData'),key,value);
                    });
                }
            }else if('editPage' === navigation){//No I18N
                self.get('parentView').send('showOrHideCLICommands',false);//No I18N
            }
            self.setBreadcrumbHeaders(self);
        }
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmVendorMonitorsComponent = Ember.Component.extend({
	templateName: "components/opm-vendor-monitors", //No I18N
	maxBulkTestMonitorsCount:window.OPM.maxBulkTestMonitorsCount,
	didInsertElement: function(){
		var self = this;
		if(!self.get('referenceData.requestInProgress')){
			var isTestMonitorAvailable = (!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite && !(self.get('referenceData.isMonitorPage') && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring));
			var colNames = [Ember.I18n.t('webclient.map.name'),//No I18N
					Ember.I18n.t('webclient.map.filemonitor.templates.protocol'),//No I18N
					Ember.I18n.t('webclient.admin.devicetype.search.oid'),//No I18N
					Ember.I18n.t('webclient.map.filemonitor.templates.description'),//No I18N
					Ember.I18n.t('webclient.opm.device.ipmi.hardware.info.interval'),//No I18N
					'','','','','','','']; //No I18N
	    	var colModel = [
					{name:'DISPLAYNAME',index:'DISPLAYNAME',width:20,search:true,formatter:partitionmultinodeFormatter,title:false},//No I18N
					{name:'Protocol',index:'Protocol',width:10,search:true}, //No I18N
					{name:'oid',index:'oid',width:20,search:true}, //No I18N
					{name:'Description',index:'Description',width:40}, //No I18N
					{name:'interval',index:'interval',sorttype:'int',width:15,search:true}, //No I18N
					{name:'testStatusStr',index:'testStatusStr',search:false,hidden:true},//No I18N
					{name:'isSelected',index:'isSelected',sorttype:'text',search:false,hidden:true},//No I18N
					{name:'GRAPHID',index:'GRAPHID',search:false,hidden:true}, //No I18N
					{name:'name',index:'name',search:false,hidden:true},//No I18N
					{name:'type',index:'type',search:false,hidden:true},//No I18N
					{name:'showAddPartitionOption',index:'showAddPartitionOption',search:false,hidden:true},//No I18N
					{name:'DISPLAYNAMECOPY',index:'DISPLAYNAMECOPY',hidden:true}]//No I18N
			var defaultOptions = {sortName:'isSelected',sortOrder:'desc',multiselect:true,sortable:false,minRowsPerPage:10,Search:false,searchOption:true,//No I18N
						noDataText:Ember.I18n.t('webclient.jqgrid.no.data.found',this),hideCSV:true,hideExcel:true};//No I18N
			
			if(isTestMonitorAvailable){
				colNames.push(Ember.I18n.t('webclient.snapshot.testlinks.testmonitor'));//No I18N
				colModel.push({name:'testStatus',index:'testStatus',width:15,search:false,sortable:false,formatter:testMonitorStatus,title:false});//No I18N
			}
			self.setProperties({isTestMonitorAvailable:isTestMonitorAvailable,colNames:colNames,colModel:colModel,defaultOptions:defaultOptions,selectedCategories:[],refreshGridList:[],'referenceData.prevSelectedIds':(self.disableUncheck && self.get('referenceData.selectedMonitors').length) ? self.get('referenceData.selectedMonitors').toString().split(',') : [],marginTopFixNeeded:(!isTestMonitorAvailable || (self.get('referenceData.isMonitorPage'))),'referenceData.currentTimestamp':Date.now()});//No I18N

			if(isTestMonitorAvailable && !(self.get('referenceData.isMonitorPage'))){
				var filterList = self.get('referenceData.filterList') || [];
				if(!filterList.length){
					var filterCategories = getFilterCategories(self.get('referenceData.isDeviceTemplate') && OPMClient.SettingsDeviceTemplateController.isStorageTemplate);
					$.each(filterCategories.category,function(category,categoryFilters){
						var filterGroup = filterCategories.filter[filterCategories.filter.map(function(object){return object.k}).indexOf(category)];
						var filterPrefix = '';
						if(category === 'virtualServers'){
							filterPrefix = 'virtual_';//No I18N
							if(Object.keys(categoryFilters).length === 1){
								return true;
							}
						}
						$.each(categoryFilters,function(subFilterId,subFilterName){
							filterList.push({k:filterPrefix+''+subFilterId,v:subFilterName,group:filterGroup.v});
						});
					});
					self.setProperties({'referenceData.filterList':filterList,'referenceData.selectedDevFilter':null});//No I18N
				}
				self.setProperties({isBulkTestAvailable:true,filterPrompt:self.get((self.get('referenceData.isDeviceTemplate') ? 'referenceData.templateType' : 'referenceData.selectedVendor'))+' '+Ember.I18n.t('webclient.admin.probes.Devices')});//No I18N
				if(!self.get('referenceData.isBackAction') && self.get('referenceData.loadingCompleted')){
					self.notifyPropertyChange('referenceData.selectedDevFilter');
				}
			}
			self.send('loadVendorMonitors');//No I18N
		}else if(!self.get('referenceData.isMonitorPage')){
			self.send('adjustAccordionHeight');//No I18N
		}
	},
	actions:{
		loadVendorMonitors:function(isReloadAccordion){
			var self = this;
			var selectedIds = self.get('referenceData.selectedMonitors');
			var perfMonitors = [];
			var perfGridIndex = 0;
			var activeMonitor = self.get('referenceData.activeMonitor');
			var searchString = self.get('referenceData.searchValue');
			var isSearch = false;
			var totalMonitorsCount = 0;
			var enableActions = false;
			if(searchString !== undefined && searchString !== ''){
				searchString = searchString.trim().toLowerCase();
				isSearch = true;
			}
			$.each(self.get('referenceData.vendorResponse'),function(monitorType,monitorContent){
				var selIds = [];
				var currentCategory = [];
				var currentCategoryLength = 0;
				$.each(monitorContent,function(){
					var graphId = this.GRAPHID;
					if((isSearch && ((this.DISPLAYNAME.toLowerCase()).indexOf(searchString) > -1) || ((this.Protocol.toLowerCase()).indexOf(searchString) > -1) || (((monitorType.toLowerCase()).indexOf(searchString) > -1))) || (isSearch && searchString.length ===0) || !isSearch){
						currentCategory.push(this);
						if(selectedIds.indexOf(graphId) > -1){
							selIds.push(graphId);
						}
					}
					if(!enableActions && (selectedIds.indexOf(graphId) > -1)){
						enableActions = true;
					}
					if(!(isSearch || self.get('referenceData.isPartitionsAvailable')) && this.showAddPartitionOption === 'true'){
						self.set('referenceData.isPartitionsAvailable', true);//No I18N
					}
				});
				currentCategoryLength = currentCategory.length;
				if(currentCategoryLength){
					perfMonitors.push({content:currentCategory,title:monitorType,selectedIds:selIds,selectedCount:selIds.length,totalCount:monitorContent.length,currentTotalCount:currentCategoryLength});//No I18N
					totalMonitorsCount += currentCategoryLength;
				}
			});
			
			sortDescByObjKey(perfMonitors,'selectedCount');//No I18n
			var isFound = false;
			$.each(perfMonitors,function(perfGridIndex,monitorData){
				monitorData.titleId = 'title_'+perfGridIndex;//No I18N
				monitorData.contentId = 'content_'+perfGridIndex;//No I18N
				monitorData.divId = 'vendorDiv_'+perfGridIndex;//No I18N
				monitorData.gridListId = 'VendorMonitor_'+perfGridIndex;//No I18N
				monitorData.gridIndex = perfGridIndex.toString();
				if(self.referenceData.isBackAction && !isFound){
					if((monitorData.content.map(function(obj){return obj.GRAPHID;})).indexOf(self.get('referenceData.lastOpenedId')) > -1){
						activeMonitor = monitorData.gridIndex;
						isFound = true;
					}	
				}
			});
			if(!self.referenceData.isBackAction){
				activeMonitor = 0;
			}
			self.setProperties({'referenceData.performanceData':perfMonitors,triggerGrid:!self.get('triggerGrid'),'referenceData.activeMonitor':activeMonitor,reloadGrid:false,currentMonitorType:'performance','referenceData.searchResultsCount':totalMonitorsCount,'referenceData.isSearch':isSearch,hideAccordian:(isSearch && totalMonitorsCount === 0),enableBulkTest:enableActions && (self.get('referenceData.selectedDevice') !== null)});//No I18N
			self.setProperties({placeHolder:((self.get('referenceData.templateType') === 'VMwareVirtualMachine') || (self.get('referenceData.isMonitorPage') && deviceBasicDetails.isDatastore)) ? Ember.I18n.t('webclient.opm.settings.monitoring.perf.associate.search.desc',{param2:totalMonitorsCount}) : Ember.I18n.t('webclient.opm.settings.monitoring.perf.associate.search.desc',{param0:'/'+Ember.I18n.t('webclient.credential.protocol'),param1:'/'+Ember.I18n.t('webclient.apm.plugin.monitor.group'),param2:totalMonitorsCount})});//No I18N
			Ember.run.scheduleOnce('afterRender',function(){
				if(perfMonitors.length){
					if(!isReloadAccordion){
						self.send('expandVendorMonitor',activeMonitor,perfMonitors[activeMonitor].content);//No I18N
					}else{
						accordionScrollTop('AddVendorMonitorsGridHolder',activeMonitor);//No I18N
					}
					self.setProperties({showSelectedCount:true,'referenceData.loadingCompleted':true});//No I18N
					if(self.get('referenceData.isMonitorPage')){
						self.set('referenceData.enableAddAction',enableActions);//No I18N
					}
				}
			});
		},
		expandVendorMonitor:function(gridIndex,content){
			var self = this;
			var gridListId = 'VendorMonitor_'+gridIndex;//No I18N
			var previousMonitor = self.get('referenceData.activeMonitor');
			var reloadGrid = self.get('reloadGrid');
			var isUnique = (self.get('referenceData.lastOpenedId') !== Number(content[0].GRAPHID)) || self.get('referenceData.isBackAction');
			gridIndex = Number(gridIndex);

			if(previousMonitor !== undefined && previousMonitor !== gridIndex){
				$('#title_'+previousMonitor).removeClass('active');
				$('#content_'+previousMonitor).removeClass('vmdisplayBlock');
			}

			if(self.get('expandAccordion')){
				$('#title_'+gridIndex).addClass('active');
				$('#content_'+gridIndex).addClass('vmdisplayBlock');
				self.set('expandAccordion',false);//No I18N
				reloadGrid = true;
			}else{
				$('#title_'+gridIndex).toggleClass('active');
				$('#content_'+gridIndex).toggleClass('vmdisplayBlock');
			}

			if(self.get('refreshGridList') !== undefined && self.get('refreshGridList').contains(gridIndex)){
				reloadGrid = true;
				self.get('refreshGridList').splice($.inArray(gridIndex,self.get('refreshGridList')),1);
			}
			self.setProperties({'referenceData.activeMonitor':gridIndex,'referenceData.lastOpenedId':Number(content[0].GRAPHID),'referenceData.isBackAction':false});//No I18N
			if(!$('#'+gridListId).hasClass('ui-jqgrid-btable') || reloadGrid){
				var monitorsList = self.get('monitorsList');
				$.each(content,function(){
					if(monitorsList !== undefined && monitorsList.length > 0){
						this.isSelected = (monitorsList[0].selectedIds).indexOf((this.GRAPHID).toString()) > -1;
					}
				});
				Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
					$("#"+gridListId).jqGrid('GridUnload');//No I18n
					opm_loadJQgridWithData('#'+gridListId,content,self.get('colNames'),self.get('colModel'),'','',gridListId,self.get('defaultOptions')); //No I18N
					if($('.AddVendorMonitorsGridHolder.opmFormHolder-FixedBtnBottom').length){
						self.send('adjustAccordionHeight');//No I18N
					}
					$("#"+gridListId).trigger("reloadGrid");//No I18N
				});
			}
			if(isUnique){
				accordionScrollTop('AddVendorMonitorsGridHolder',gridIndex);//No I18N
			}
		},
		doSingleTest:function(gridId,rowId){
			testPerformanceMonitor(gridId,rowId);
		},
		doBulkTest:function(){
			var self = this;
			var isRefreshed = false;
			var parentView = self.get('parentView').get('controller');
			var currentTimestamp = self.get('referenceData.currentTimestamp');
			if(parentView.get('errorMsgId') !== undefined){
				$('#'+parentView.get('errorMsgId')).remove();//No I18N
				parentView.set('errorMsgId',undefined);//No I18N
			}
			var doOkCallback = function(){
				self.send('loadVendorMonitors',true);//No I18N
				Ember.run.scheduleOnce('afterRender',function(){
					var selectedMonitors = self.getCurrentlySelectedMonitors();
					var deviceName = self.get('referenceData.selectedDevice');
					var currentIndex = 0;
					var totalMonitorsSelected = selectedMonitors.length;
					var doRefreshGrid = function(gridIndex){
						Ember.run.scheduleOnce('afterRender',function(){
							if(gridIndex !== undefined){
								if(gridIndex !== self.get('referenceData.activeMonitor')){
									if(!self.get('refreshGridList').contains(gridIndex)){
										self.get('refreshGridList').push(gridIndex);
									}
								}else if(!isRefreshed){
									self.set('expandAccordion',true);//No I18N
									self.send('expandVendorMonitor',gridIndex,self.get('referenceData.performanceData')[gridIndex].content);//No I18N
									isRefreshed = true;
								}
							}
						});	
					}
					var doTestMonitor = function(graphId,name,gridIndex){
						var testFormData = {name:deviceName,policyName:name,graphName:name,isPreTest:true};
						if(graphId !== undefined){
							var prevTestResponse = self.get('referenceData.perfTestMonitorFailureReasons')[graphId];
							if(prevTestResponse !== undefined && prevTestResponse.pollId !== undefined){
								testFormData.preTestPollId = prevTestResponse.pollId;
							}
						}
						self.set('enableBulkTest',false);//No I18N
						doRefreshGrid(gridIndex);
						opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/TestMonitor',testFormData,'',function(response){//No I18N
							if(response !== undefined){
								if(response.deviceName === self.get('referenceData.selectedDevice') || response.error !== undefined){
									if(changeTestPerformanceMonitorStatus(currentTimestamp,response,graphId)){
										isRefreshed = false;
										doRefreshGrid(gridIndex);
										if(currentIndex < (totalMonitorsSelected-1)){
											currentIndex++;
										}else{
											self.set('enableBulkTest',true);//No I18N
										}
									}
								}else if(response.deviceName !== undefined){
									self.setProperties({'referenceData.perfTestMonitorFailureReasons':{}});//No I18N
								}
							}
						});
					}
					if(deviceName !== null){
						var firstLoadGrid = undefined;
						var activeMonitor = self.get('referenceData.activeMonitor');
						$.each(selectedMonitors,function(index,graphId){
							var gridIndex = undefined;
							$.each(self.get('referenceData.performanceData'),function(catIndex,monitorsContent){
								if(monitorsContent.selectedIds.contains(graphId)){
									gridIndex = Number(monitorsContent.gridIndex);
									return false;
								}
							});
							$.each(self.get('referenceData.vendorResponse'),function(category,monitors){
								var arrIndex = monitors.map(function(object){return object.GRAPHID}).indexOf(graphId);
								if(arrIndex > -1){
									monitors[arrIndex].testStatusStr = 'inProgress';//Expected string //No I18N
									doTestMonitor(selectedMonitors[index],monitors[arrIndex].name,gridIndex);
									return false;
								}
							});
							if(firstLoadGrid === undefined){
								firstLoadGrid = gridIndex;
							}
						});
						if(firstLoadGrid !== activeMonitor){
							$('#title_'+activeMonitor).removeClass('active');
							$('#content_'+activeMonitor).removeClass('vmdisplayBlock');
							self.set('referenceData.activeMonitor',firstLoadGrid);//No I18N
						}
					}
				});
			}
			if(self.get('referenceData.selectedMonitors').length > self.get('maxBulkTestMonitorsCount')){
				opmConfirm(Ember.I18n.t('webclient.opm.dt.add.perf.monitor.test.monitors'),Ember.I18n.t('webclient.opm.dt.add.perf.monitor.test.bulk.info',{param0:self.get('maxBulkTestMonitorsCount')}),450,doOkCallback,Ember.I18n.t('webclient.action.ok'),'','','','dialogStyle2',true,true,'',true,true);//No I18n
			}else{
				doOkCallback();
			}
		},
		adjustAccordionHeight:function(){
			if(this.get('referenceData.isPartitionsAvailable') && $("#vendorMonitorsContainer").closest(".deviceContent").length) {
				$('.AddVendorMonitorsGridHolder.opmFormHolder-FixedBtnBottom').css({'--AddVendorMonitorsGridHolderContentFixedHeightY':$("#vendorMonitorsContainer").closest(".deviceContent").next().height() + 10 +'px'});//No I18N
			} else {
				var adjustmentHeight = this.get('referenceData.isMonitorPage') ? 16 : this.get('referenceData.showInfoMsg') ? 71 : 11;
				$('.AddVendorMonitorsGridHolder.opmFormHolder-FixedBtnBottom').css({'--AddVendorMonitorsGridHolderContentFixedHeightY':($('.AddVendorMonitorsGridHolder.opmFormHolder-FixedBtnBottom').offset().top + adjustmentHeight)+'px'});//No I18N
			}
		},
		hideViewReasons:function(){
        	this.set('referenceData.showViewReasons',false);
        },
        doSelect2SearchFix:function(){
			setTimeout(function(){
	    		$('#filterCategories, #availableDevices, #vendorSelection').select2({minimumResultsForSearch:2}).on('select2:open',function(e){//No I18N
					$(e.target).closest('.opmFormHolder').off('scroll.select2');//to avoid scroll getting blocked.
				});
			},500);
		}
	},
	getCurrentlySelectedMonitors:function(){
		var self = this;
		var sortedCurrentIds = [];
		var sortedPrevIds = [];
		var currentlySelectedMonitors = self.get('referenceData.selectedMonitors').slice(self.get('referenceData.prevSelectedIds').length);
		var currentMonitorsSelected = 0;
		var previousMonitorsSelected = 0;
		$.each(self.get('referenceData.performanceData'),function(catIndex,monitorsContent){
			if(monitorsContent.selectedCount > 0){
				$.each(monitorsContent.selectedIds,function(arrIndex,monitorId){
					if(currentlySelectedMonitors.contains(monitorId)){
						if((currentMonitorsSelected++) < self.get('maxBulkTestMonitorsCount')){
							sortedCurrentIds.push(monitorId);
						}else{
							return false;
						}
					}else{
						if(((previousMonitorsSelected++) + currentMonitorsSelected) < self.get('maxBulkTestMonitorsCount')){
							sortedPrevIds.push(monitorId);
						}
					}
					return (currentMonitorsSelected < self.get('maxBulkTestMonitorsCount'));
				});
			}
			return (monitorsContent.selectedCount !== 0 && currentMonitorsSelected < self.get('maxBulkTestMonitorsCount'));
		});
		return (sortedCurrentIds.concat(sortedPrevIds)).slice(0,self.get('maxBulkTestMonitorsCount'));
	},
	reRenderObserver:function(){
		if(!this.get('referenceData.requestInProgress')){
			this.rerender();
		}
	}.observes('referenceData.requestInProgress'),//No I18N
	searchValueObserver:function(){
		var self = this;
		clearTimeout(self.get('searchSchedulerId'));
		self.setProperties({searchSchedulerId:setTimeout(function(){
			if(self.get('referenceData.searchValue') !== undefined){
				self.send('loadVendorMonitors');//No I18N
			}
		},300),'referenceData.isSearch':false});//No I18N
	}.observes('referenceData.searchValue'),//No I18N
	filterChangeObserver:function(){
		var self = this;
		var selectedFilter = self.get('referenceData.selectedDevFilter');
		var deviceList = [];
		self.setProperties({'referenceData.deviceList':[],'referenceData.selectedDevice':null});//No I18N
		if(self.get('isTestMonitorAvailable')){
			if(selectedFilter === null){
				if(self.get('referenceData.isDeviceTemplate')){
					opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/admin/associateTemplateDevicesList',{typeName:self.get('referenceData.templateType')},'',function(response){//No I18N
						if(response.error !== undefined){
							showMessage(response);
						}else{
							$.each(response.selectedDevices,function(key,devData){
								deviceList.push({k:devData.name,v:devData.displayName});
							});
						}
						self.setProperties({'referenceData.deviceList':deviceList,'referenceData.selectedDevice':deviceList.length ? deviceList[0].k : null});
					});
				}else if(self.get('referenceData.isSettingsAddPerfMonitor')){
					opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + '/admin/getFilteredDeviceList',{filter:'vendor',value:self.get('referenceData.selectedVendor')},'',function(response){//No I18N
						if(response.error !== undefined){
							showMessage(response);
						}else{
							$.each(response.deviceList,function(key,devData){
								deviceList.push({k:devData.value,v:devData.displayName});
							});
						}
						self.setProperties({'referenceData.deviceList':deviceList,'referenceData.selectedDevice':deviceList.length ? deviceList[0].k : null});
					});
				}
			}else{
				var isVirtualCategory = selectedFilter.indexOf('virtual_') > -1;
				var apiURL = '/device/getDeviceListForFilter';//No I18N
				var data = {filterID:selectedFilter,type:'DeviceTemplate',excludeStorage:!(self.get('referenceData.isDeviceTemplate') && OPMClient.SettingsDeviceTemplateController.isStorageTemplate),excludeIPMI:true};//No I18N
				if(isVirtualCategory){
					apiURL = '/device/listDevices';//No I18N
					data = {selectedVTypes:selectedFilter.split('virtual_')[1]};
				}
				opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + apiURL,data,'',function(response){//No I18n
					if(response.error !== undefined){
						showMessage(response);
					}else{
						if(!isVirtualCategory){
							$.each(response.remainingDevices,function(moName,displayName){
								deviceList.push({k:moName,v:displayName});
							});
						}else{
							$.each(response,function(listDevIndex,listDevObject){
								deviceList.push({k:listDevObject.deviceName,v:listDevObject.displayName});	
							});	
						}
						self.setProperties({'referenceData.deviceList':deviceList,'referenceData.selectedDevice':deviceList.length ? deviceList[0].k : null});
					}
				});
			}
			self.send('doSelect2SearchFix');//No I18N
		}
	}.observes('referenceData.selectedDevFilter'),//No I18n
	deviceChangeObserver:function(){
		var self = this;
		var selectedDevice = self.get('referenceData.selectedDevice');
		if(selectedDevice !== null){
			self.setProperties({refreshGrid:true,'referenceData.perfTestMonitorFailureReasons':{},'referenceData.currentTimestamp':Date.now()});//No I18N
			Ember.run.schedule('afterRender',function(){//No I18N
				$.each(self.get('referenceData.vendorResponse'),function(category,monitors){
					$.each(monitors,function(){
						delete this.testStatusStr;
					});
				});
				self.setProperties({refreshGrid:false,enableBulkTest:(self.get('referenceData.selectedMonitors').length > 0)});
				Ember.run.schedule('afterRender',function(){//No I18N
					var activeMonitor = Number(self.get('referenceData.activeMonitor'));
					if(!isNaN(activeMonitor)){
						self.send('expandVendorMonitor',activeMonitor,self.get('referenceData.performanceData')[activeMonitor].content);//No I18N
					}
				});
			});
		}else{
			self.setProperties({enableBulkTest:false});
		}
		$('#availableDevices').removeClass('validateField error');//No I18N
	}.observes('referenceData.selectedDevice'),//No I18n
	showInfoMsgObserver:function(){
		if(!this.get('referenceData.requestInProgress')){
			this.send('adjustAccordionHeight',true);//No I18N
		}
	}.observes('referenceData.showInfoMsg'),//No I18N
	viewReasonsObserver:function(){
		var self = this;
		if(self.get('referenceData.showViewReasons')){
			$('body').on('keydown.viewReasonsPopup',function(event){
				if(event.keyCode === $.ui.keyCode.ESCAPE){
					self.setProperties({'referenceData.showViewReasons':false});//No I18N
				}
			});
			Ember.run.scheduleOnce('afterRender',function(){
				$('body').on('click.viewReasonsPopup',function(event){
					if($(event.target).closest('#viewReasonsPopup').length === 0){
						var excludeClass = ($(event.target)[0].className);
						if(!(excludeClass !== undefined && excludeClass.includes('viewDetails'))){
							self.setProperties({'referenceData.showViewReasons':false});//No I18N
						}
					}
				});
				$('.AddVendorMonitorsGridHolder').on('scroll.viewReasonsPopup',function(event){
					self.setProperties({'referenceData.showViewReasons':false});//No I18N
				});
			});
		}else{
			$('body').off('keydown.viewReasonsPopup');
			$('body').off('click.viewReasonsPopup');
			$('.AddVendorMonitorsGridHolder').off('scroll.viewReasonsPopup');
		}
	}.observes('referenceData.showViewReasons'),//No I18N
	monitorSelectionObserver:function(){
		var self = this;
		self.set('referenceData.showSelectedCount',false);
		if(self.get('referenceData.selectedMonitors') !== undefined){
			var enableActions = (self.get('referenceData.selectedMonitors').length > 0);
			self.setProperties({enableBulkTest:enableActions,'referenceData.enableAddAction':enableActions});
			if(self.get('referenceData.showInfoMsg') !== undefined){
				self.setProperties({'referenceData.showInfoMsg':!enableActions});//No I18N
			}
		}
		Ember.run.scheduleOnce('afterRender',function(){//No I18N
			self.set('referenceData.showSelectedCount',true);//No I18N
		});
	}.observes('referenceData.selectedMonitors.@each'),//No I18n
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		$('body').off('keydown.viewReasonsPopup');
		$('body').off('click.viewReasonsPopup');
	}
});
OPMClient.OpmMonitorQueryInfoComponent = Ember.Component.extend({
	templateName: "components/opm-monitor-query-info",//No I18N
	didInsertElement: function(){
		var self = this;
		$.each(self.get('queryData'),function(key,value){
			Ember.set(self,key,value);
		});
		if(self.get('expandNote')){
			self.set('showInfo',true);//No I18N
		}	
	},/*keyup: function(event) {
		enterKeyPress(event);
	},*/
	actions:{
		togglerawOutput:function(){
			this.set('rawOutput',false);//No I18N
		},
		showDeviceInfo:function(){
			this.set('showInfo',!this.get('showInfo'));//No I18N
		},
		executeQuery:function(){
			var self = this;
			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + "/device/getRawValue",{pollId:self.get('pollId')},Ember.I18n.t('webclient.proce.fetchdata.wait'),function(response){//No I18n
				var rawOutput;
				if(response.Result !== undefined && response.Result.indexOf("\n") !== -1){
					rawOutput = response.Result.replace(/\n/g, "\n");
				}else{
					rawOutput = JSON.stringify(response, null, 4);// 4 spaces for formatting
				}
				Ember.run.scheduleOnce('afterRender',function(){//No I18N
					self.setProperties({rawOutput:true,rawoutputValue:rawOutput});
					localStorage.setItem('testMonitorObj',JSON.stringify({deviceName:self.get('deviceName')}));//No I18N
				});
			});
		},
		copyRawOutput:function(){
			opm_CopyToClipBoard('#rawoutput');//No I18N
			opm_infoMsgs('successMsg',Ember.I18n.t('webclient.common.text.copyclip',{param0:Ember.I18n.t('webclient.script.test.rawoutput')}));//No I18N
		},
		copyQuery:function(){
			opm_CopyToClipBoard('#execQuery');//No I18N
			opm_infoMsgs('successMsg',Ember.I18n.t('webclient.common.text.copyclip',{param0:this.get('copyLabel')}));//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		localStorage.removeItem('testMonitorObj');//No I18N
	}
});
OPMClient.OpmLookupTableComponent = Ember.Component.extend({
	templateName: "components/opm-lookup-table",//No I18N
	listMaxCount:10,
	didInsertElement:function(){
		var self = this;
		if(self.get('isEditMonitor')){
			if(self.get('isLookupEnabled')){
				var lookupArray = [];
				var lookupDefaultValues = [];
				$.each(self.get('lookupArray'),function(key,value){
					if(!self.get('isNumericMonitorType') && 'others' === value.value){
						lookupDefaultValues.push({stringDefaultKey:value.key.toString(),stringDefaultKeyId:'lookupkeyString'+self.get('pageId'),stringDefaultValueId:'lookupvalueString'+self.get('pageId'),stringDefaultValue:value.value});//No I18N
						self.set('listMaxCount',self.get('listMaxCount')-1);//No I18N
					}else{
						lookupArray.push({arrayIndex:key,key:self.get('isNumericMonitorType') ? value.key.toString() : value.value,keyId:self.get('pageId')+'lookupkey'+key+'',value:self.get('isNumericMonitorType') ? value.value : value.key.toString(),valueId:self.get('pageId')+'lookupvalue'+key+'',showDelete:true,showAdd:false});//No I18N
					}
				});
				if(lookupArray.length === 1){
					lookupArray[0].showDelete = false;
				}
				lookupArray[lookupArray.length-1].showAdd = (lookupArray.length < self.get('listMaxCount'));
				self.setProperties({lookupArray:lookupArray,lookupDefaultValues:lookupDefaultValues});
				self.notifyPropertyChange('isLookupEnabled');//No I18N
			}
			Ember.run.scheduleOnce('afterRender',function(){//No I18N
				self.setProperties({deconfigRestricted:(self.get('isEditMonitor') && !self.get('isNumericMonitorType'))});
			});
		}
	},
	keyPress: function(e){
		if('Enter' === e.originalEvent.key){
			var self = this;
			var nextElement = $('#'+e.target.id).parent('div').next('div');
			var gotoNextLine = function(){
				var inputElement = $('#'+e.target.id).parent('div').parent('div').next('div').find('input')[0];//No I18N
				if(inputElement){
					inputElement.focus();
				}
			}
			if(nextElement.find('input').length){//adjacent text box
				nextElement.find('input').focus();//No I18N
			}else{
				if(validateLookupArray(self,false) && nextElement.find('.btnPlus').length){//Add case
					self.send('addLookup',(self.get('lookupArray').length)-1,true);//No I18N
					Ember.run.scheduleOnce('afterRender',function(){//No I18N
						gotoNextLine();
					});
				}else if(nextElement.length === 1){//next line
					gotoNextLine();	
				}
			}
		}
	},
	actions:{
		addLookup:function(arrayIndex,validationNotNeeded){
			var self = this;
			if(validationNotNeeded || validateLookupArray(self,false)){
				var lookupArray = $.extend(true,[],self.get('lookupArray'));
				lookupArray[arrayIndex].showDelete = true;
				lookupArray[arrayIndex].showAdd = false;
				arrayIndex+=1;
				lookupArray.pushObject({arrayIndex:arrayIndex,key:'',keyId:self.get('pageId')+'lookupkey'+(arrayIndex),value:'',valueId:self.get('pageId')+'lookupvalue'+(arrayIndex),showDelete:true,showAdd:((arrayIndex+1) < self.get('listMaxCount'))});//No I18N
				self.setProperties({lookupArray:lookupArray});
			}
		},
		removeLookup:function(arrayIndex){
			var self = this;
			var lookupArray = $.extend(true,[],self.get('lookupArray'));
			lookupArray.splice(arrayIndex,1);
			var arrayLength = lookupArray.length;
			for(var arrIndex = arrayIndex; arrIndex < arrayLength; arrIndex++){
				lookupArray[arrIndex].arrayIndex -= 1;
				lookupArray[arrIndex].valueId = self.get('pageId')+'lookupvalue'+lookupArray[arrIndex].arrayIndex;
				lookupArray[arrIndex].keyId = self.get('pageId')+'lookupkey'+lookupArray[arrIndex].arrayIndex;
			}
			if(arrayLength === 1){
				lookupArray[0].showDelete = false;
				lookupArray[0].showAdd = true;
			}else{
				lookupArray[arrayLength-1].showAdd = ((arrayLength-1) < self.get('listMaxCount'));
			}
			self.setProperties({lookupArray:lookupArray});
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
		}
	},
	lookupChangeObserver:function(){
		var self = this;
		var lookupObject = {arrayIndex:0,key:'',keyId:self.get('pageId')+'lookupkey0',value:'',valueId:self.get('pageId')+'lookupvalue0',showDelete:false,showAdd:true};//No I18N
		var isLookupEnabled = self.get('isLookupEnabled');
		if(isLookupEnabled){
			if(self.get('lookupArray').length === 0){
				self.setProperties({lookupArray:[lookupObject]});
				if(!self.get('isNumericMonitorType')){
					self.setProperties({lookupDefaultValues:[{stringDefaultKey:'',stringDefaultKeyId:'lookupkeyString'+self.get('pageId'),stringDefaultValueId:'lookupvalueString'+self.get('pageId'),stringDefaultValue:'others'}],listMaxCount:self.get('listMaxCount')-1});//No I18N
				}
			}
			self.setProperties({keyPlaceholder:Ember.I18n.t(self.get('isNumericMonitorType')?'webclient.opm.dt.edit.integer.value':'webclient.opm.dt.edit.string.value'),valuePlaceholder:Ember.I18n.t(self.get('isNumericMonitorType')?'webclient.opm.dt.edit.string.value':'webclient.opm.dt.edit.integer.value')});//No I18N
		} else {
			self.setProperties({lookupArray:[]});
		}
		Ember.run.scheduleOnce('afterRender',function(){//No I18N
			if(self.get('isAccordionType')){
				if(isLookupEnabled){
					$('.accordion1__nav').addClass('active');
					$('.accordion1__cont').stop().slideDown();
				}else{
					$('.accordion1__nav').removeClass('active');
					$('.accordion1__cont').stop().slideUp();
				}
			}
		});
	}.observes('isLookupEnabled'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmThresholdConfigComponent = OPMClient.OpmEditThresholdsComponent.extend({
	templateName: "components/opm-threshold-config",//No I18N
	validateThresholds:function(self){
		var numericType = Number(self.get('numericType'));
		var pageId = self.get('pageId');
		var thresholdData = self.get('thresholdData');
		if($('#'+self.get('warningTypeId')).val() !== undefined && $('#'+self.get('warningTypeId')).val() === 'equal' && ($('#'+self.get('warningValId')).val().indexOf('|') > -1 || $('#'+self.get('troubleValId')).val().indexOf('|') > -1 || $('#'+self.get('criticalValId')).val().indexOf('|') > -1 || $('#'+self.get('rearmValId')).val().indexOf('|') > -1)){
			thresholdData.isMultipleThreshold = true;
			if(numericType === 3){
				if(!opm_validateMultiThreshold_Float_Equal(self.get('warningValId'),self.get('troubleValId'),self.get('criticalValId'),self.get('rearmValId'))){
					return false;
				}
			}else{
				if(!opm_validateMultiThreshold_Equal(self.get('warningValId'),self.get('troubleValId'),self.get('criticalValId'),self.get('rearmValId'))){
					return false;
				}
			}
			return true;
		}else{
			thresholdData.isMultipleThreshold = false;
			if(numericType === 3){
				if(!opm_doesThresholdConfigured(self.get('warningValId'),self.get('troubleValId'),self.get('criticalValId'),self.get('rearmValId')) || !opm_validateMonitorThreshold_Float(self.get('warningValId'),self.get('troubleValId'),self.get('criticalValId'),self.get('rearmValId'),self.get('warningTypeId'))){
					return false;
				}
			}else{
				if(!opm_doesThresholdConfigured(self.get('warningValId'),self.get('troubleValId'),self.get('criticalValId'),self.get('rearmValId')) || !opm_validateMonitorThreshold(self.get('warningValId'),self.get('troubleValId'),self.get('criticalValId'),self.get('rearmValId'),self.get('warningTypeId'))){
					return false;
				}
			}
			return true;
		}
	},
	didInsertElement:function(){
		var self = this;
		var pageId = self.get('pageId');
		var thresholdMsgPlaceholder = '$MONITOR is $CURRENTVALUE $UNITS, threshold value for this monitor is $THRESHOLDVALUE $UNITS';//No I18N
		if(!(self.get('thresholdData') && Object.keys(self.get('thresholdData')).length)){
			var thresholdData = {warningValue:'',troubleValue:'',criticalValue:'',rearmValue:'',warningMessage:'',troubleMessage:'',criticalMessage:'',rearmMessage:'',numericType:self.get('numericType'),consecutiveTimes:1,thresholdType:'max',thresholdMsgPlaceholder:thresholdMsgPlaceholder,rearmMsgPlaceholder:thresholdMsgPlaceholder};
			thresholdData.validateThresholdsRef = function(){
				return self.validateThresholds(self);
			}
			self.setProperties({thresholdData:thresholdData});
		}
		self.setProperties({warningTypeId:'warningType_'+pageId,troubleTypeId:'troubleType_'+pageId,criticalTypeId:'criticalType_'+pageId,rearmTypeId:'rearmType_'+pageId,warningValId:'warningVal_'+pageId,troubleValId:'troubleVal_'+pageId,criticalValId:'criticalVal_'+pageId,rearmValId:'rearmVal_'+pageId,warningMsgId:'warningMsg_'+pageId,troubleMsgId:'troubleMsg_'+pageId,criticalMsgId:'criticalMsg_'+pageId,rearmMsgId:'rearmMsg_'+pageId,failureThresholdId:'failureThreshold_'+pageId,atDeviationRadioName:'atDeviationType_'+pageId,thresholdMsgPlaceholder:thresholdMsgPlaceholder});//No I18N
		
		Ember.set(OPMClient.SettingsAddEditController.thresholdIdsForEachPage,pageId,{valueIds:'#'+self.get('warningValId')+',#'+self.get('troubleValId')+',#'+self.get('criticalValId')+',#'+self.get('rearmValId'),typeId:'#'+self.get('troubleTypeId')});//No I18N
		
		self._super();
	},
	actions:{
		changeValue: function(){
			var self = this;
			if(self.get('numericType') === 2){
				self.setProperties({'thresholdData.warningType':self.get('warningType'),//No I18N
									'thresholdData.troubleType':self.get('troubleType'),//No I18N
									'thresholdData.criticalType':self.get('criticalType'),//No I18N
									'thresholdData.rearmType':self.get('rearmType')});//No I18N
				return;
			}
			var thresholdType = getThresholdType(self.get('warningType'),self.get('troubleType'),self.get('criticalType'));
			self.set('thresholdData.rearmDisabled',false); //No I18N

			var pageId = self.get('pageId');
			$.each(['warningType','troubleType','criticalType'],function(index,thresholdLevel){//No I18N
				if(self.get(thresholdLevel) !== thresholdType){
					self.set(thresholdLevel,thresholdType);
					Ember.run.scheduleOnce('afterRender',function(){//No I18N
						$('#'+thresholdLevel+'_'+pageId).trigger('change');
					});
				}
			});

			var rearmType = getRearmType(thresholdType);
			self.setProperties({rearmType:rearmType,'thresholdData.thresholdType':thresholdType,'thresholdData.rearmType':rearmType});//No I18N
			Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
				$('#rearmType_'+pageId).trigger('change');
				if(thresholdType === 'notEqual'){
					self.setProperties({'thresholdData.rearmValue':'','thresholdData.rearmDisabled':true}); //No I18N
				}
				self.setProperties({consecutiveTimeDisabled:!checkThresholdEnabledOrNot(pageId)});
			});
		}
	},
	numericTypeChangeObserver:function(){
		var self = this;
		var placeHolderI18nkey = ['','webclient.opm.dt.edit.integer.value','webclient.opm.dt.edit.string.value','webclient.opm.dt.edit.decimal.value'];//No I18N
		self.set('placeHolderMsg',Ember.I18n.t(placeHolderI18nkey[self.get('numericType')]));//No I18N
	}.observes('numericType'),//No I18N
	isATEnabledOberver:function(){
		var self = this;
		if(self.get('isATEnabled')){
			self.setProperties({thresholdTypes:[{v:'min',k:'<'},{v:'max',k:'>'}],rearmTypes:[{v:'min',k:'<='},{v:'max',k:'>='}],'thresholdData.thresholdMsgPlaceholder':Ember.I18n.t('webclient.alarmmessage.atthreshold.utilalarmmsg'),'thresholdData.rearmMsgPlaceholder':Ember.I18n.t('webclient.dt.alarmmessage.clear')});//No I18N
		}else{
			self.setProperties({thresholdTypes:[{v:'min',k:'<'},{v:'max',k:'>'},{v:'equal',k:'='},{v:'notEqual',k:'!='}],rearmTypes:[{v:'min',k:'<='},{v:'max',k:'>='},{v:'equal',k:'='},{v:'notEqual',k:'!='}],'thresholdData.thresholdMsgPlaceholder':self.get('thresholdMsgPlaceholder'),'thresholdData.rearmMsgPlaceholder':self.get('thresholdMsgPlaceholder')});//No I18N	
		}
		setTimeout(function(){
			var elementId = OPMClient.SettingsAddEditController.thresholdIdsForEachPage[self.get('pageId')].typeId;
			$(elementId).val('min').trigger('change');//No I18N
			$(elementId).val('max').trigger('change');//No I18N
		},0);
	}.observes('isATEnabled'),//No I18N
	thresholdChangeObserver:function(){
		var self = this;
		var pageId = self.get('pageId');
		if(OPMClient.SettingsAddEditController.thresholdIdsForEachPage[pageId] !== undefined){
			self.setProperties({consecutiveTimeDisabled:!checkThresholdEnabledOrNot(pageId)});
		}
	}.observes('thresholdData.warningValue','thresholdData.troubleValue','thresholdData.criticalValue','thresholdData.rearmValue'),//No I18N
	thresholdEnableDisableObserver:function(){
		var self = this;
	}.observes('isThresholdEnabled'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmConfirmMessageComponent = Ember.Component.extend({
	templateName: "components/opm-confirm-message", //No I18N
	actions:{
		executeCallback:function(param){
			if(param === '1'){
				this.okCallback();
			}else{
				this.cancelCallback();
			}
		}
	},
	didInsertElement:function(){
		var self = this;
		$('.confirmPopupDiv').focus();
		$('.confirmPopupDiv').on('keydown',function(event){
			if(self.get('popupType') === 'info'){
				if (event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER || event.keyCode === $.ui.keyCode.ESCAPE){
					self.okCallback();
				}
			}else{
				if (event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER){
					self.okCallback();
				}else if(event.keyCode === $.ui.keyCode.ESCAPE){
					self.cancelCallback();
				}
			}
		});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmPrivacyModuleContentComponent = Ember.Component.extend({
	tagName: 'article',//No I18N
	actions:{
		expandCollapse: function(){
			this.set('obj.isExpand',!this.get('obj.isExpand'));//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmRecentAlarmsComponent = Ember.Component.extend({
	templateName: "components/opm-recentalarms", //No I18N
	customHdrStyle:"recentAlarmsInvSnapShot",//No I18N
	didInsertElement:function() {
		self=this;
		OPMClient.InventoryDeviceDetailsController.set("isOPMInterfaceNFA", (self.snapshotObj && self.snapshotObj.snapDetails && self.snapshotObj.snapDetails.snapshotName === "OPMInterface_NFA")); //No I18N
		var jsonData = this.get('widgetData.apiData');//No I18N
		var recentAlarms = [];
		if(jsonData.message!==undefined) {
			this.set("noDataPage",true); //No I18N
			this.set('widgetData.sizey',4);//No I18N
		} else {
			$.each(jsonData, function(key,val){		
				if(val.message.length > 180){
					val.displayMessage=val.message.substring(0, 180)+" ...";//NO I18N
				} else {
					val.displayMessage=val.message;
				}
				if(!(window.OPM.isCentralServer || OPMClient.ApplicationController.isMSPCentralSelected) && (val.eventType === "ONE POLL" || val.eventType === "THREE POLL" || val.eventType === "Device Down"))
				{
					val.showViewMore = true;
				}
				else
				{
					val.showViewMore=false;
				}

				if(val.category === "SDWAN" || (OPMClient.InventoryDeviceDetailsController.isSDWANChildDevice !== undefined && OPMClient.InventoryDeviceDetailsController.isSDWANChildDevice))
				{
					val.showViewMore=false;
				}
				
				recentAlarms.push(val);
				return key<1;
			});
			this.set("noDataPage",false); //No I18N
		}
		if(!(window.OPM.isMSPCentral || window.OPM.isCentralServer)){
			getDiagnosticsAlerts(self);
		}
		if(window.OPM.isNewSnapshotPage)
		{
			if(this.get("noDataPage") && self.diagFailedCount == 1){//No I18N
				this.set('widgetData.sizey',6);//No I18N
			}else{
				if(jsonData.length===1 && (self.diagFailedCount > 0 && self.diagFailedCount < 3)){
					this.set('widgetData.sizey',7);//No I18N
				}else{
					this.set('widgetData.sizey',8);//No I18N
				}
			}
		}
		
		this.set('merakiOrgDown',false); //No I18n
		this.set("dependentUnavail",false); //No I18n
		if(self.snapshotObj.state === "3")
		{
			var isDependentUnavailable = self.snapshotObj.isDependencyUnAvailable;
			var isMerakiUnavailable = self.snapshotObj.isControllerUnAvailable;
			this.set("noDataPage",false); //No I18N
			if(isDependentUnavailable !== undefined && isDependentUnavailable === true)
			{
				this.set("dependentUnAvailable",true); //No I18n
				this.set("parentDevice",self.snapshotObj.dependency); //No I18n
				this.set("parentdisplayName",self.snapshotObj.dependencyDispName); //No I18n
				this.set('widgetData.sizey',6);//No I18N
				var parentMo = self.snapshotObj.dependency;
				var dependentDeviceType = parentMo !== undefined ? (parentMo.indexOf("wanlinkmonitor") > -1 ? Ember.I18n.t('webclient.opm.wanlinks.ip',this) : (parentMo.indexOf("wanlinksite") > -1 ? (Ember.I18n.t('webclient.opm.wanlinks.ip',this)+" "+Ember.I18n.t('webclient.common.widgets.sitelist',this)) : Ember.I18n.t('Device',this))) : Ember.I18n.t('Device',this); //No I18N
				this.set('dependentDeviceType',Ember.I18n.t('webclient.reports.dependent')+' '+dependentDeviceType);//No I18N
				if(jsonData.length >= 1)
				{
					this.set('widgetData.sizey',7);//No I18N
				}
			}
			if(isMerakiUnavailable !== undefined && isMerakiUnavailable === true)
			{
				this.set('merakiOrgDown',true); //No I18n
				this.set("organisationMOName",self.snapshotObj.organisationMOName); //No I18n
				this.set("organisation",self.snapshotObj.organisation); //No I18n
				this.set('widgetData.sizey',6);//No I18N
				if(jsonData.length >= 1)
				{
					this.set('widgetData.sizey',7);//No I18N
				}	
			}
		}
		/*if(self.snapshotObj.snapDetails.snapshotName==="RAID" || self.snapshotObj.snapDetails.snapshotName==="FCSWITCH" || self.snapshotObj.snapDetails.snapshotName==="TAPELIBRARY") {
			var gridH = $('.recentAlarmsInvSnapShot').height()+30;
			var cellCount = Math.ceil((gridH)/(self.snapshotObj.snapDetails.yScale+2));
			self.set('widgetData.sizey',cellCount); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); // NO i18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		}*/
		this.set("recentAlarms",recentAlarms); //No I18N

		this.set('learnMoreLink',Ember.I18n.t('opm.perf.watchdog.ui.diagnostic.help.message.learnmore',this));//No I18N
		$('#alarmsTab').show(); //No I18N
		$(".tab1 ul .tabHead").on('click', function() //No I18N
		{
			$(".tab1 ul .tabHead").removeClass("active"); //No I18N
			$(this).addClass("active"); //No I18N
			$('.tab1Content').hide(); //No I18N
			$("#"+$(this).attr('data-attr-div')).show(); //No I18N
			$(this).attr('data-attr-div') == "diagnosticsTab" ? getDiagnosticsAlerts(self) : ''; //No I18N
		});
	},
	actions: {
		redirectSnapShot: function(page,snapType,deviceName){
			redirectSnapShot(page,snapType,deviceName);
		},
		redirectToAlarm: function(selEntity) {
			redirectToAlarm(selEntity);
		},
		enableDiagnostics: function() {
			self=this;
			enableDiagnostics(true,self,"snapshot"); //No I18N
		},
		viewDeviceDownHistory: function()
		{
			var slideDetails = {};
            slideDetails.id = "dsp_availDiagnostic"; //No I18n
	        slideDetails.componentName = "OPMClient.OpmDeviceDownDiagnosticsComponent"; //No I18n
	        slideDetails.slideHeader = Ember.I18n.t('opm.dsp.avail.diag');//No I18N
	        slideDetails.parentObj = self;
	        self.set("controller.slideDetails",slideDetails);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmDeviceDownDiagnosticsComponent = Ember.Component.extend({
	templateName: "components/opm-DeviceDownDiagnostics", //No I18N
	didInsertElement:function(){
        var self = this.get('controller');
        this.send('loadDiagnosticsData','basic');//No I18N
    },
    actions:{
        loadDiagnosticsData:function(loadType)
        {
        	var modTimeLong='';
	    	$.each(self.slideDetails.parentObj.recentAlarms, function(index, value) {
	    		if(value.showViewMore)
	    		{
	    			modTimeLong = value.modTimeLong;
	    		}
	    	});
        	var reqData = {devName:self.snapshotObj.deviceName,needAdvancedInfo:true,deviceDownDiagonstic:true,dataRequired:loadType,alarmTime:modTimeLong};
        	var diagnosticData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/device/getDeviceDiagnosticsInfo",reqData); //No I18n
    		$('#availDiagnostics').jqGrid('GridUnload');//No I18n 
			opm_loadJQgridWithData('#availDiagnostics',diagnosticData.deviceDownHistory,[Ember.I18n.t('webclient.general.dateandtime'),Ember.I18n.t('webclient.map.description')],[{name:'timeStamp',index:'timeStamp',width:30},{name:'failureReason',index:'failureReason',width:50,formatter:deviceDownDescFormatter}],"","#availDiagnosticsPager","",{noDataText:Ember.I18n.t('webclient.jqgrid.no.data.found'),rowList:[10,15,20,50,100,500],minRowsPerPage:15,hideCSV:true,hideExcel:true,Search:false}); //No I18N
          	$("#availDiagnostics").trigger("reloadGrid");//No I18N
          	this.set('showMoreButton',false); //No I18n
          	if(diagnosticData.hasMoreData !== undefined && (diagnosticData.hasMoreData || diagnosticData.hasMoreData === "true"))
          	{
          		this.set('showMoreButton',true); //No I18n
          	}
          	if(diagnosticData.lastFailureDetectedON !== undefined)
          	{
          		this.set('lastFailureDetectedON',diagnosticData.lastFailureDetectedON); //No I18n
          	}
          	if(diagnosticData.lastFailureReason !== undefined)
          	{
          		//this.set('lastFailureReason',(diagnosticData.lastFailureReason).replace(/\n/g, '<br />')); //No I18n
          		this.set('lastFailureReason',(diagnosticData.lastFailureReason).replace(/^\s+/, '')); //No I18n
          	}
          	if(diagnosticData.failureReason !== undefined)
          	{
          		this.set('lastFailureReason',(diagnosticData.failureReason).replace(/\n/g, '<br />')); //No I18n
          	}
        },
        cancelOperation:function(){
           slideOutWithId(this.get('slideDetails').id);
           opmGlobalRoute.transitionTo('Inventory.Device'); //NO I18N
           this.set('slideDetails',undefined); //No I18n
        }
    },
    willDestroyElement:function(){
        $('#'+this.elementId).find('*').remove();
        this.set('slideDetails',undefined); //No I18n
    }
});

OPMClient.OpmWarningComponent = Ember.Component.extend({
	templateName: "components/opm-warning", //No I18N
	didInsertElement:function() {
		var deviceName = this.get('deviceName');//No I18N
		if(window.OPM.isCentralServer){
		var eeProbeID = deviceName.substring(deviceName.lastIndexOf('.')+1,deviceName.length);
			var response = opm_ajaxGetResponse(eeClientReqToProbe(window.OPM.apiUrlPattern + "/alarm/isDeviceInSuppressionState?deviceName="+deviceName,eeProbeID));//No I18N
		}else{
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/alarm/isDeviceInSuppressionState?deviceName="+deviceName);//No I18N
		}

		this.set('response',response); //No I18N
	},
	actions:{
		redirectSnapShot: function(page,snapType,deviceName){
			redirectSnapShot(page,snapType,deviceName);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.JiraServiceDeskComponent = Ember.Component.extend({
	templateName: "components/Jira-Service-Desk", //No I18N
	showChild:false,
	promptValue:Ember.I18n.t("webclient.jira.selectvalue",this),//No I18N
	noValue:Ember.I18n.t("webclient.jira.novalue",this),//No I18N
	didInsertElement:function() {
		var self = this;
		$("input[name=dateFormat]").datepicker({ dateFormat: 'yy-mm-dd'});
		$("input[name=dateTimeFormat]").datetimepicker({
					dateFormat: 'yy-mm-dd',//No I18N
					timeFormat: 'hh:mm:ss.sz',//No I18N
					separator: 'T',//No I18N
					showTimezone: true
				});
	},
	reRendering:function() {
		this.rerender();
  	}.observes('this.dynamicFields'),//No I18N
	actions:{
		multiValue: function(id){
			var multiValue = [];
			multiValue = opm_getMultiSelectValue(id,'value', true);//No I18N
			var myJSON = this.dynamicFields;
			for(var iter=0;iter < myJSON.length; iter++)
			{
					if(myJSON[iter]!= undefined && myJSON[iter].key === id)
					{
						myJSON[iter].arrayValue = multiValue;
						break;
					}
			}
		},
		leftToRight: function(leftId,rightId,isAssoComponent){
			opm_leftToRight(leftId,rightId,isAssoComponent);
		},
		rightToLeft: function(leftId,rightId,isAssoComponent)
		{
			opm_rightToLeft(leftId,rightId,isAssoComponent);
		}
		// },
		// dateFormatPicker: function(){
		// 	$("input[name=dateFormat]").datepicker({ dateFormat: 'yy-mm-dd'});
		// },
		// dateTimeFormatPicker: function(){
		// 	$("input[name=dateTimeFormat]").datetimepicker(
		// 	{
		// 			dateFormat: 'yy-mm-dd',
		// 			timeFormat: 'hh:mm:ss.sz',
		// 			separator: 'T',
		// 			showTimezone: true
		// 		});
		// 	this.rerender();
		// }
	},
	willDestroyElement: function(){
	}
});

OPMClient.JiraWorkflowServiceDeskComponent = Ember.Component.extend({
	templateName: "components/Jira-Workflow-Service-Desk", //No I18N
	showChild:false,
	promptValue:Ember.I18n.t("webclient.jira.selectvalue",this),//No I18N
	noValue:Ember.I18n.t("webclient.jira.novalue",this),//No I18N
	didInsertElement:function() {
		var self = this;
		$("input[name=dateFormat]").datepicker({ dateFormat: 'yy-mm-dd'});
		$("input[name=dateTimeFormat]").datetimepicker({
					dateFormat: 'yy-mm-dd',//No I18N
					timeFormat: 'hh:mm:ss.sz',//No I18N
					separator: 'T',//No I18N
					showTimezone: true
				});
	},
	reRendering:function() {
		this.rerender();
  	}.observes('this.dynamicFields'),//No I18N
	actions:{
		multiValue: function(id){
			var multiValue = [];
			multiValue = opm_getMultiSelectValue(id,'value', true);//No I18N
			var myJSON = this.dynamicFields;
			for(var iter=0;iter < myJSON.length; iter++)
			{
					if(myJSON[iter]!= undefined && myJSON[iter].key === id)
					{
						myJSON[iter].arrayValue = multiValue;
						break;
					}
			}
		},
		leftToRight: function(leftId,rightId,isAssoComponent){
			opm_leftToRight(leftId,rightId,isAssoComponent);
		},
		rightToLeft: function(leftId,rightId,isAssoComponent)
		{
			opm_rightToLeft(leftId,rightId,isAssoComponent);
		}
	},
	willDestroyElement: function(){
	}
});
OPMClient.CITemplateResponseDetailsComponent = Ember.Component.extend({
	templateName: "components/CITemplate-Response-Details", //No I18N
	configurationItems:[],
	didInsertElement:function() {
	    var self = this;
	    self.set("configurationItems",self.slideDetails.configurationItems);   //No I18N
		if(self.get('slideDetails').parentObj.get("model.expression") != undefined){
			Ember.run.schedule('afterRender', this, function() {//No I18N
				$("input[name=compact-radio1][value='"+self.get('slideDetails').parentObj.get("model.expression")+"']").prop("checked", true);
			});
		}
	},
	actions:{
	    selectObject:function(){
	        var self= this;
	        self.get('slideDetails').parentObj.set("selectObject", $('input[name="compact-radio1"]:checked').val()); //No I18N
	        self.get('slideDetails').parentObj.set("showResponseID",false); //No I18N
          	self.get('slideDetails').parentObj.set("selectedObjectName",$('input[name="compact-radio1"]:checked').data('title'));  //No I18N
        },
  		closeSlider:function(){
  			this.get('parentView').send('closeAction');//No I18N
  		}
	},
	willDestroyElement: function(){
	}
});

OPMClient.AddOnProductAdvancedSettingsComponent = Ember.Component.extend({
	templateName: "components/AddOnProduct-Advanced-Settings", //No I18N
	didInsertElement:function() {
		var self = this;
		if(self.slideDetails.integrationName === "SDPRESTAPI"){
			self.set("productName", self.slideDetails.integrationName);//No I18N
			self.set("selectedCategories", self.slideDetails.parentObj.get("controller.selectedCategories"));//No I18n
			self.set("excludedCategories", self.slideDetails.parentObj.get("controller.excludedCategories"));//No I18n
			self.set("excludedCategoriesKeyValue", self.slideDetails.parentObj.get("controller.excludedCategoriesKeyValue"));//No I18N
			self.set("SDPOPRequestTemplate", self.slideDetails.parentObj.get("controller.SDPOPRequestTemplate"));//No I18n
			self.set("SDPOPCommentsEnabled", self.slideDetails.parentObj.get("controller.SDPOPCommentsEnabled"));//No I18n
			self.set("SDPOPStatusChangeComment", self.slideDetails.parentObj.get("controller.SDPOPStatusChangeComment"));//No I18n
			self.set("SDPOPClosureComment", self.slideDetails.parentObj.get("controller.SDPOPClosureComment"));//No I18n
			self.set("SDPOPResolutionNotes", self.slideDetails.parentObj.get("controller.SDPOPResolutionNotes"));//No I18n
			self.set("requestTemplates", self.slideDetails.parentObj.get("controller.requestTemplates"));//No I18n
			self.set("isSyncEnabled", self.slideDetails.parentObj.get("controller.syncEnabled"));//No I18N
		}else if(self.slideDetails.integrationName === "SDPMSPOD"){//No I18N
			self.set("productName", self.slideDetails.integrationName);//No I18N
			self.set("selectedCategories", self.slideDetails.parentObj.get("controller.model.selectedCategories"));//No I18n
			self.set("excludedCategories", self.slideDetails.parentObj.get("controller.model.excludedCategories"));//No I18n
			self.set("excludedCategoriesKeyValue", self.slideDetails.parentObj.get("controller.model.excludedCategoriesKeyValue"));//No I18N
			self.set("isSyncEnabled", self.slideDetails.parentObj.get("controller.model.autoSync"));//No I18N
			$('#tpiTicketSettings').hide();
		}else if(self.slideDetails.integrationName === "ASSETEXPLORER"){//No I18N
			self.set("productName", self.slideDetails.integrationName);//No I18N
			self.set("selectedCategories", self.slideDetails.parentObj.get("controller.selectedCategories"));//No I18N
			self.set("excludedCategories", self.slideDetails.parentObj.get("controller.excludedCategories"));//No I18N
			self.set("excludedCategoriesKeyValue", self.slideDetails.parentObj.get("controller.excludedCategoriesKeyValue"));//No I18N
			self.set("isSyncEnabled", self.slideDetails.parentObj.get("controller.syncEnabled"));//No I18N
			$('#tpiTicketSettings').hide();
		}
	},
	actions:{
  		setTPIAdvancedSettingsValues:function(integrationName) {
  			var self = this;
  			if(integrationName === "SDPRESTAPI"){
				var fields = {'empty':['SDPOPRequestTemplate']};//No I18N
				if(self.get("SDPOPCommentsEnabled") === true){
					fields = {'empty':['SDPOPRequestTemplate', 'SDPOPStatusChangeComment', 'SDPOPClosureComment', 'SDPOPResolutionNotes']};//No I18N
				}
				var isValid = opm_validateFields(fields);
				if(isValid){
					var excludedCategoryValues = opm_getMultiSelectValue('excludedCategories','value', true);//No I18N
					if(excludedCategoryValues === ""){
						self.get('slideDetails').parentObj.set("controller.excludedCategories","[]");//No I18N
						self.get('slideDetails').parentObj.set("controller.excludedCategoriesKeyValue",[]);//No I18N
						var rightSelectedList = [];
									$.each($("#selectedCategories option"),function(k,v){
											rightSelectedList.push({"name":v.text, "value":v.value});
									});
						self.get('slideDetails').parentObj.set("controller.selectedCategories",rightSelectedList);//No I18N
					}else{
						self.get('slideDetails').parentObj.set("controller.excludedCategories",excludedCategoryValues);//No I18N
						var excludedCategory = self.slideDetails.parentObj.get("controller.excludedCategories");
						var excludedCategoryKeyValue = self.slideDetails.parentObj.get("controller.excludedCategoriesKeyValue");
						var isAssoComponent = undefined;
						var leftSelectedList = [];
						$.each($("#excludedCategories option"),function(k,v){
               				leftSelectedList.push({"name":v.text, "value":v.value});
            			});
						var rightSelectedList = [];
            			$.each($("#selectedCategories option"),function(k,v){
              				rightSelectedList.push({"name":v.text, "value":v.value});
            			});
						self.get('slideDetails').parentObj.set("controller.excludedCategoriesKeyValue",leftSelectedList);//No I18N
						self.get('slideDetails').parentObj.set("controller.selectedCategories",rightSelectedList);//No I18N
					}
					self.get('slideDetails').parentObj.set("controller.SDPOPRequestTemplate",self.get("SDPOPRequestTemplate")); //No I18N
					self.get('slideDetails').parentObj.set("controller.SDPOPCommentsEnabled",self.get("SDPOPCommentsEnabled")); //No I18N
					self.get('slideDetails').parentObj.set("controller.SDPOPStatusChangeComment",self.get("SDPOPStatusChangeComment")); //No I18N
					self.get('slideDetails').parentObj.set("controller.SDPOPClosureComment",self.get("SDPOPClosureComment")); //No I18N
					self.get('slideDetails').parentObj.set("controller.SDPOPResolutionNotes",self.get("SDPOPResolutionNotes")); //No I18N
					// self.get('slideDetails').parentObj.send("submitSDPAddOnSettings");
					self.send("closeSlider");//No I18N
				}
			}else if(integrationName === "SDPMSPOD"){//No I18N
				var excludedCategoryValues = opm_getMultiSelectValue('excludedCategories','value', true);//No I18N
					if(excludedCategoryValues === ""){
						self.get('slideDetails').parentObj.set("controller.model.excludedCategories","[]");//No I18N
						self.get('slideDetails').parentObj.set("controller.model.excludedCategoriesKeyValue",[]);//No I18N
						var rightSelectedList = [];
									$.each($("#selectedCategories option"),function(k,v){
											rightSelectedList.push({"name":v.text, "value":v.value});
									});
						self.get('slideDetails').parentObj.set("controller.model.selectedCategories",rightSelectedList);//No I18N
					}else{
						self.get('slideDetails').parentObj.set("controller.model.excludedCategories",excludedCategoryValues);//No I18N
						var excludedCategory = self.slideDetails.parentObj.get("controller.model.excludedCategories");
						var excludedCategoryKeyValue = self.slideDetails.parentObj.get("controller.model.excludedCategoriesKeyValue");
						var isAssoComponent = undefined;
						var leftSelectedList = [];
						$.each($("#excludedCategories option"),function(k,v){
               				leftSelectedList.push({"name":v.text, "value":v.value});
            			});
						var rightSelectedList = [];
            			$.each($("#selectedCategories option"),function(k,v){
              				rightSelectedList.push({"name":v.text, "value":v.value});
            			});
						self.get('slideDetails').parentObj.set("controller.model.excludedCategoriesKeyValue",leftSelectedList);//No I18N
						self.get('slideDetails').parentObj.set("controller.model.selectedCategories",rightSelectedList);//No I18N
					}
					// self.get('slideDetails').parentObj.send("submitSDPAddOnSettings");
					self.send("closeSlider");//No I18N
			}else if(integrationName === "ASSETEXPLORER"){//No I18N
				var excludedCategoryValues = opm_getMultiSelectValue('excludedCategories','value', true);//No I18N
				if(excludedCategoryValues === ""){
					self.get('slideDetails').parentObj.set("controller.excludedCategories","[]");//No I18N
					self.get('slideDetails').parentObj.set("controller.excludedCategoriesKeyValue",[]);//No I18N
					var rightSelectedList = [];
					$.each($("#selectedCategories option"),function(k,v){
						rightSelectedList.push({"name":v.text, "value":v.value});
					});
					self.get('slideDetails').parentObj.set("controller.selectedCategories",rightSelectedList);//No I18N
				}else{
					self.get('slideDetails').parentObj.set("controller.excludedCategories",excludedCategoryValues);//No I18N
					var leftSelectedList = [];
					$.each($("#excludedCategories option"),function(k,v){
						leftSelectedList.push({"name":v.text, "value":v.value});
					});
					var rightSelectedList = [];
					$.each($("#selectedCategories option"),function(k,v){
						rightSelectedList.push({"name":v.text, "value":v.value});
					});
					self.get('slideDetails').parentObj.set("controller.excludedCategoriesKeyValue",leftSelectedList);//No I18N
					self.get('slideDetails').parentObj.set("controller.selectedCategories",rightSelectedList);//No I18N
				}
				self.send("closeSlider");//No I18N
			}
  		},
  		closeSlider:function(){
  			this.get('parentView').send('closeAction');//No I18N
  		},
		

		enableSdpIcon:function(selectboxID){
        			$('.propertiesDropdown__icon[id!="'+selectboxID+'"]').removeClass('active');//No I18N
        		 	if($("#"+selectboxID).hasClass("active")){
        					$("#"+selectboxID).removeClass("active");//No I18N

        			}
        			else{
        			$("#"+selectboxID).addClass("active");//No I18N

        		   }
        		},

        		disableSdpIcon:function(dropdownvalue){
        			var self=this;
        			 var msgtxt = $("#"+dropdownvalue).val();
        		   var varibletxt=OPMClient.SettingsConfigurationController.sdpDropValue.value;
        		    if(dropdownvalue ==="SDPOPStatusChangeComment"){
        					 $("#"+dropdownvalue).val(msgtxt+varibletxt);
        					self.set("SDPOPStatusChangeComment",$("#"+dropdownvalue).val()) //No I18n
	}
        			else if(dropdownvalue ==="SDPOPClosureComment"){
        				$("#"+dropdownvalue).val(msgtxt+varibletxt);
        			   self.set("SDPOPClosureComment",$("#"+dropdownvalue).val()) //No I18n
  }
          			else if(dropdownvalue ==="SDPOPResolutionNotes"){
          				$("#"+dropdownvalue).val(msgtxt+varibletxt);
          			   self.set("SDPOPResolutionNotes",$("#"+dropdownvalue).val()) //No I18n
    }
        		}


	},
	willDestroyElement: function(){
	}
});

OPMClient.AddCustomSnmpMonitorComponent = Ember.Component.extend({
	templateName: "components/add-custom-snmp-monitor",//No I18N
	didInsertElement: function(){
		 Ember.run.scheduleOnce('afterRender', function() { //No I18n
            var w = $("#customsnmpform").width()
            w = w+ 100;
            $("#customsnmpform ~ .helpbox").css("left",w);
			$("#customsnmpform ~ .helpbox").show();

			// If disabled by table oid selected enable it once the field is cleared.
			$("#formula").keyup(function(e){ // No I18N
				if(e.target.value == "") { // No I18N
					$("#csnmp_operators").prop("disabled", false) // No I18N
					$("#csnmp_functionalExpression").prop("disabled", false) // No I18N
				}
			})
        });
		this.set('isAdminOperation',this.get('pageName') === "deviceTemplate" || this.get('pageName') === "vendorMonitor" || this.get('pageName') === 'monitorProfile' ? true : false);//No I18N
		this.set("selectedfunctionalExpObj", {isDefault: "true", expression: ''}); //No I18N

		if(this.get('pageName') === "deviceTemplate"){
			if(OPMClient.SettingsDeviceTemplateController.isAdd){
				this.set('baseRoute','Settings.Configurations.DeviceTemplate.Add.AddMonitor');//No I18N
			}else{
				this.set('baseRoute','Settings.Configurations.DeviceTemplate.Edit.AddMonitor');//No I18N
			}
		}else if(this.get('pageName') === "vendorMonitor"){//No I18N
			this.set('baseRoute','Settings.Monitors.SubMonitors.AddPerfMonitor');//No I18N
		}else if(this.get('pageName') === "deviceSnapshot"){//No I18N
			this.set('baseRoute','Inventory.Device.Monitors.AddSNMPMonitor.AddSNMP');//No I18N
		}else if(this.get('pageName') === "monitorProfile"){//No I18N
			this.set('baseRoute','Settings.Configurations.MonitorProfile.AddPerfMonitor');//No I18N
		}

		//initializing Functional Expression
		this.send('initializeFunctionalExp');//No I18N

		var operatorlist = [{"symbol":"","displaySymbol":Ember.I18n.t('webclient.Operator',this)},//No I18N
						   {"symbol":"+","displaySymbol":"+"},//No I18N
						   {"symbol":"-","displaySymbol":"-"},//No I18N
						   {"symbol":"*","displaySymbol":"*"},//No I18N
						   {"symbol":"/","displaySymbol":"/"},//No I18N
						   {"symbol":"(","displaySymbol":"("},//No I18N
						   {"symbol":")","displaySymbol":")"}];//No I18N
		this.set('operatorlist',operatorlist);//No I18N

		//initializing DeviceList
		if(this.get('isAdminOperation')){
			$("#viewLogs").addClass('fromSettings');
			$("body").addClass('settingsCustomSNMP');

			if(window.OPM.isCentralServer || window.OPM.isMSPCentral){
				var deviceList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+ "/device/listSNMPDevicesForCentral");//No I18N
				this.set("deviceListDetails",deviceList);//No I18N
			}else{
				var deviceList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+ "/v2/device/listDevices?protocol=SNMP&excludeIPMI=true&excludeOpenFWDevice=true");//No I18N
				this.set("deviceListDetails",deviceList.rows);//No I18N
			}
		}

		//initializing Vendor List
		if(this.get('pageName') === "vendorMonitor"){
			var vendorList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/device/getVendorList");//No I18N
			if(vendorList !== undefined && vendorList[0] !== undefined){
				this.set("snmpVendorList",vendorList);//No I18N
				OPMClient.SettingsAddEditController.set('vendorList',vendorList);//No I18N
				$('#addSNMP_vendorList_cs').select2({data:vendorList});
			}
		}
		/*$("#formula").on("click", function(){//No I18N
        	if($(this).val().trim() === ""){
        		self.send("gotoMIBBrowser");//No I18N
        	}
        });*/
        this.set("interval",15);//No I18N
        this.set("consecutiveTimes",1);//No I18N
        observeThresholdChanges('monitors');//No I18N
        this.send('resetLookup');//No I18N
        
        var isProbeMSP = ((window.OPM.isProbeSelected)||(window.OPM.isMSPProbe));
		this.set('isProbeMSP',isProbeMSP);//NO I18N

		loadMonInstCntSettings();
	},
keyUp: function(e)
	{
		if($("#snmp_CF_Search").is(':focus')) 
		{
			var searchString = $("#snmp_CF_Search").val();
			listSearch(searchString,"customField_UL");//No I18N
		}
	},
	keyPress: function(e){
		if($('.numberCheck').is(":focus")){//No I18N
			return opm_isNumber(e);
		}
	},
	actions:{
		initializeFunctionalExp:function(){
			this.set('functionalExp',getFunctionalExpressionList());//No I18N
		},
		addSnMPMonitorGenAI: function() {
			var self = this;
			var moID = ""; //No I18N
			if(self.deviceListDetails) {
				var selectedDevice = self.deviceListDetails.findBy('ipaddress', self.selectedDeviceName); //No I18N
				if(selectedDevice) {
					moID = selectedDevice.moid;
				}
			} else if(typeof deviceBasicDetails !== 'undefined') { //No I18N
				moID = deviceBasicDetails.moID;
			}
			var slideDetails = {
				"id": "genAiSlide", //No I18N
				"slideHeader": Ember.I18n.t('webclient.genai.getperfOID',this), //No I18N
				"componentName": "OPMClient.OpmGenerateAiPromptComponent", //No I18N
				"isMedium": true, //No I18N
				"parentObj": self, //No I18N
				"actionName": "closeGenAiSlide", //No I18N
				"apiEndpoint": "/zia/generatePerformanceMonitor", //No I18N
				"moID": moID, //No I18N
				"mode": "perfMonitor", //No I18N
				"headerClass": "gen-ai-slide-header" //No I18N
			};
			this.set("genAiSlideDetails", slideDetails); //No I18N
		},
		closeGenAiSlide: function() {
			this.set("genAiSlideDetails", undefined); //No I18N
		},
		copyFromPrompt: function(generatedOutput) {
			if(generatedOutput.oid) {
				var sanitizedOID = (generatedOutput.oid + "").replace(/\s+/g, ""); // No I18N
				$("#formula").val(sanitizedOID); // No I18N
				// Remember the OID fetched from GenAI so the save flow can flag the monitor as fromOIDFinder
				this.set("aiGeneratedOID", sanitizedOID); // No I18N
				if(generatedOutput.mib) {
					customSNMPMIBTreeView(generatedOutput.mib);
				}
			} else {
				$("#formula").val(generatedOutput.CommandLine); // No I18N
			}
			this.set("genAiSlideDetails", undefined); //No I18N
		},
		resetLookup:function(){
			this.setProperties({isLookupEnabled:false,lookupArray:[],pageId:'commonSNMP',lookupDefaultValues:[]});//No I18N
		},
		goToPreviousArticle:function(articleNo)
		{
			articleNo == 1 ? $("#customsnmpform ~ .helpbox").show() : $("#customsnmpform ~ .helpbox").hide();
			if(this.get('isLookupEnabled')){
				//deconfigured due to showing graph as evaluateCustomSNMPOID having different response.
				if(this.get('isTypeChangedMonitor')){
					this.send('resetLookup');//No I18N
				}else{
					this.set('prevOID',$('#formula').val());//No I18N
				}
			}
			$("#summaryDetails").hide();
			$($('#viewLogs article')[articleNo-1]).removeClass("completed");//No I18N
			$('#viewLogs article').removeClass("active");//No I18N
			$('#viewLogs article section').css({'display':''});//No I18N
			$($('#viewLogs article')[articleNo-1]).addClass("active");//No I18N
			$($('#viewLogs article section')[articleNo-1]).css({'display':'block'});//No I18N
			$('#viewLogs article').css({'display':'none'});//No I18N
			$($('#viewLogs article')[articleNo-1]).css({'display':'block'});//No I18N
			if(articleNo === 2){
				this.send("loadCustomGraph",this.get('result'));//No I18N
				$("#summaryDetails").show();//No I18N
			}
		},
		closeQueryDevice:function()
		{
			OPMClient.SettingsConfigurationController.set("addPerfMonitorPage",false); //No I18n
			opm_transitionToParentRoute('Settings.Monitors.SubMonitors'); //No I18N
		},
		closeSNMP:function()
		{
			
			var pageName = this.get('pageName');

			var baseRoute = this.get("baseRoute");
			if(pageName === 'deviceSnapshot'){//No I18N
    			opm_transitionToParentRoute('Inventory.Device.Monitors'); //No I18N
    			OPMClient.Inventory.getDeviceMonitorsDetails(OPMClient.InventoryDeviceDetailsController.deviceName);
				OPMClient.Inventory.getSelectedMonitors(OPMClient.InventoryDeviceDetailsController.monitorsName);
				return;
			}
			else if(baseRoute)
			{
				parentRoute = baseRoute.slice(0, baseRoute.lastIndexOf('.'));

				opm_transitionToParentRoute(parentRoute);
			}
			else {
				window.history.go(-1); 
			}
		},
		goToNextArticle:function(articleNo){
			$("#summaryDetails").hide();//No I18N
			var self = this;
			var goToNext = true;
			if(articleNo === 0)
			{
				var fieldsToValidate_1 = {'empty':['formula']};//No I18N
				if(window.OPM.currentView.name.indexOf('Settings.Monitors.SubMonitors') > -1){//No I18N
					fieldsToValidate_1.empty.push("csnmp_deviceName");//No I18N
					if($("#newVendorRow").is(":visible")){
						fieldsToValidate_1.empty.push("vendorNewName");//No I18N
						fieldsToValidate_1.custom = [{condition:!opm_isValidVendorName($('#vendorNewName').val()),identifier:'vendorNewName',message:Ember.I18n.t('webclient.devices.devprop.status.spechar')}];//No I18N
					}else{
						fieldsToValidate_1.empty.push("addSNMP_vendorList_cs");//No I18N
						fieldsToValidate_1.custom = [{condition:!opm_isValidVendorName($('#addSNMP_vendorList_cs').val()),identifier:'addSNMP_vendorList_cs',message:Ember.I18n.t('webclient.devices.devprop.status.spechar')}];//No I18N
					}
				}
				if(!opm_validateFields(fieldsToValidate_1)){
					goToNext = false;
				}else if($("#newVendorRow").is(":visible") && $("#vendorNewName").val().trim() !== ""){
					this.set("errorMsgID",opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.vendorselect.validation',this)));//No I18N
					goToNext = false;
				}else if($("#vendorComboRow").is(":visible") && $("#addSNMP_vendorList_cs").val() === Ember.I18n.t('webclient.admin.devices.None')){//No I18N
					$("#addSNMP_vendorList_cs").addClass('validateField error');//No I18N
			        $("#addSNMP_vendorList_cs").attr('data-error',Ember.I18n.t('webclient.vendorselect.validation',this));//No I18N
			        $("#addSNMP_vendorList_cs").focus();
					opmValidate($("#addSNMP_vendorList_cs"));
					goToNext = false;
				}else{
					this.send("queryDevice");//No I18N
					if(this.get("error")){//No I18N
						goToNext = false;
					}
				}
			//	OPMClient.InventoryDeviceMonitorsAddSNMPMonitorAddSNMPController.summaryList=[];
				var snmpOID = $("#formula").val();//No I18N
				var fnExp = $("#csnmp_functionalExpression option:selected").text();//No I18N
				this.set("summaryList",[]);//No I18N
				this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.admin.graphs.snmpoid',this),"value":snmpOID});//No I18N
				this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.customsnmp.functionalexpression',this),"value":fnExp});//No I18N
			}
			if(articleNo === 1)
			{
				this.send('resetValues',true);//No I18N
				if(this.get('error')){
					this.set("errorMsgID",opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.customoid.index.display.error",this)));//No I18N
			        goToNext = false;
				}else if((this.get('monitorType') === "multiple" ) && ($('input:radio[name=csnmp_graphType]:checked').val()==="node" || $("#multiplenode").is(":checked"))){//No I18N
                    if($('input:radio[name=csnmp_graphType]:checked').val()==="node"){//No I18N
				 		var checkList = [];
				 		$("#csnmp_queryresult ul:first li").each(function(key,val){//No I18N
		                    var currentLi = $(this).find("input");//No I18N
		                    if(currentLi.is(":checked")){//No I18N
		                    	var currentOID = currentLi.val();
		                        checkList.push(currentLi.val());
		                    }
			            });
						if(checkList.length === 0){
			            	this.set("errorMsgID",opm_infoMsgs("errorMsg","Please select atleast one instance to save"));//No I18N
			            	goToNext = false;
			            }else{
			            	this.set('instanceList',checkList);//No I18N
			            	this.get('error',false);
			            	goToNext = true;
			            }
					}
				}
				var snmpOID = $("#formula").val();//No I18N
				//var deviceName = $("#csnmp_deviceName option:selected").text();
				var fnExp = $("#csnmp_functionalExpression option:selected").text();//No I18N
				this.set("summaryList",[]);//No I18N
				this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.admin.graphs.snmpoid',this),"value":snmpOID});//No I18N
				//this.get("summaryList").pushObject({"header":"Device Name","value":deviceName});
				this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.customsnmp.functionalexpression',this),"value":fnExp});//No I18N
				if($("#multiplenode").is(":checked") || $('input:radio[name=csnmp_graphType]:checked').val() === "node"){//No I18N
					var indexColumn = $("#indexColumn option:selected").text();//No I18N
				 	var displayColumn = $("#displayColumn option:selected").text();//No I18N
				 	this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.customsnmp.seriesindex',this),"value":indexColumn});//No I18N
				 	this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.customsnmp.seriesname',this),"value":displayColumn});//No I18N
				 }
				if(this.get("monitorType") !== "node"){//No I18N
					if($('input:radio[name=csnmp_graphType]:checked').val() === "node")//No I18N
				 	{
					 	var selectedInstancesArr = [];
					 	$("#csnmp_queryresult ul li input:checked").each(function(key,val){//No I18N
		                    selectedInstancesArr.push($(this).val());
			            });
			            this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.customsnmp.selectedinstances',this),"value":selectedInstancesArr,"customDiv":true});//No I18N
			        }
			        else if($('input:radio[name=csnmp_graphType]:checked').val() === "multiple" && this.selectedfunctionalExpObj.isDefault === "true"){//No I18N
			        	this.get("summaryList").pushObject({"header":Ember.I18n.t('webclient.common.widgets.instances',this),"value":Ember.I18n.t('opu.common.ALL',this)});//No I18N
			        }
				}
				if(this.get('isLookupEnabled') && (this.get('prevOID') !== snmpOID)){
					this.send('resetLookup');//No I18N
				}

				if(self.result.addnlParams) {
					Object.entries(self.result.addnlParams).forEach(function(val) {
						self.get("summaryList").pushObject({"header":val[0],"value":val[1]}); //No I18N
					})
				}

			}
			if(goToNext && articleNo !== 0){
				this.send('articleStyle',articleNo);//No I18N
			}
		},
		articleStyle: function(articleNo){
			$($('#viewLogs article')[articleNo]).addClass("completed");//No I18N
			$('#viewLogs article').removeClass("active");//No I18N
			$('#viewLogs article section').css({'display':''});//No I18N
			$($('#viewLogs article')[articleNo+1]).addClass("active");//No I18N
			$($('#viewLogs article')[articleNo+1]).css({'display':'block'});//No I18N
			$($('#viewLogs article section')[articleNo+1]).css({'display':'block'});//No I18N
			if(this.get("isNumeric")){//No I18N
				this.send("loadCustomGraph",this.get("result"));//No I18N
			}
			this.send("thresholdEnable");//No I18N
			$('#viewLogs article').css({'display':'none'});//No I18N
			$($('#viewLogs article')[articleNo+1]).css({'display':'block'});//No I18N
			$("#summaryDetails").show();//No I18N
			if(this.get("errorMsgID") !== ""){//No I18N
				$("#"+this.get("errorMsgID")).remove();//No I18N
			}
		},
		thresholdEnable:function(){
			if($("#showSaveAbsolutesRow").is(":visible")){//No I18N
				$('#saveAbsoluteInteger').select2();//No I18N
				$('#saveAbsoluteCounter').select2();//No I18N
			}
			if($("#thresholdEnable").is(":checked"))//No I18N
			{
				$('.thresholdDetails').show();//No I18N
				if(this.get("isNumeric")){//No I18N
					$(".numericThreshDiv").show();//No I18N
					$(".stringThreshDiv").hide();//No I18N
					$(".snmp_select").select2();//No I18N
					this.get('thresholdFlag') ? setThesholdValues("max","addCustomPerf") : '';//No I18N
					this.set('thresholdFlag',false);//No I18N
					if(this.get('isAdaptiveThresholdsEnabled')!==undefined){$("#enableATDiv").show();}//No I18N
				}else{
					$(".stringThreshDiv").show();//No I18N
					$(".snmp_select_str").select2();//No I18N
					$(".numericThreshDiv").hide();//No I18N
				}
				checkThresholdEnabledOrNot('monitors');//No I18N
			}
			else
			{
				$('.thresholdDetails').hide();//No I18N
				$("#enableATDiv").hide();//No I18N
				$("#deviationDiv").hide();//No I18N
			}
		},
		customFieldEnable: function()
		{
			if($('#customFieldEnable').is(':checked'))
			{
				var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listAdditionalFields?type=CustFieldToGraph"); //No I18N
				this.set('customFieldslist',list); //No I18n
				$('#Perf_customFieldSelbox').show();
				this.set("interval",24);//No I18N
				$('#snmpMon_interval').text(Ember.I18n.t('webclient.map.filemonitor.fileage.hours',this)); //No I18n
			} else {
				$('#Perf_customFieldSelbox').hide();
				this.set("interval",15);//No I18N
				$('#snmpMon_interval').text(Ember.I18n.t('webclient.general.mins',this)); //No I18n
			}
		},
		queryDevice: function(action){
			var checkList = [];
			if(action === undefined){
				this.set('instanceList',[]);//No I18N
				$(".seriesDisplay").hide();
			}else if($('input:radio[name=csnmp_graphType]:checked').val() === "node"){//No I18N
				$("#csnmp_queryresult ul:first li").each(function(key,val){
                    var currentLi = $(this).find("input");//No I18N
                    if(currentLi.is(":checked")){//No I18N
                    	var currentOID = currentLi.val();
                        checkList.push(currentLi.val());
                    }
	            });
				this.set('instanceList',checkList);//No I18N
			}
			var objectId=$("#formula").val().replace(/\s/,'');//No I18N
	        var functionExp = $("#csnmp_functionalExpression").val();//No I18N
	        var host = deviceBasicDetails.ipAddress;
	        var url = window.OPM.apiUrlPattern+'/mibbrowser/evaluateCustomSNMPOID';  //No I18N
	        if(this.get('isAdminOperation')){//No I18N
	        	host = $('#csnmp_deviceName').val();//No I18N
	        }
    		var data = {"host":host,"port":OPMClient.DeviceMonitorsActionController.customSNMPMonitor.port,"expOID":objectId,"snmpversion":OPMClient.DeviceMonitorsActionController.customSNMPMonitor.snmpversion,"credentialNames":OPMClient.DeviceMonitorsActionController.customSNMPMonitor.credName}; //No I18N

    		if(functionExp !== ""){
    			data.functionExp = functionExp;
    		}

			if(this.selectedfunctionalExpObj && this.selectedfunctionalExpObj.fields) {
				var validations = {empty: [], validInteger: [], minRangeCheck: {}}
				this.selectedfunctionalExpObj.fields.forEach(function(field, id) {
					if(!field.allowEmpty) {
						validations.empty.push(field.id)
					}
					if(field.isNumeric === "true") { // No I18N
						validations.validInteger.push(field.id)
						if(field.minRange) {
							validations.minRangeCheck[field.id] = parseInt(field.minRange)
						}
					}
					
					data['addnlParam' + (id + 1)] = field.value; // No I18N
				})

				if(!opm_validateFields(validations)) {
					return false
				}
			}

    		if(action !== undefined && ($("#multiplenode").is(":checked") /*|| $('input:radio[name=csnmp_graphType]:checked').val() === "node"*/)){
    			data.isMultipleNode = "true";//No I18N
    		}

    		if(action !== undefined && $("#displayColumn").val() !== null && $("#displayColumn").val() !== ""){//No I18N
    			data.DisplayColumn = $("#displayColumn").val();//No I18N

				if($("#indexColumn").val() !== null && $("#indexColumn").val() !== "") {
					data.Index = $("#indexColumn").val();//No I18N
				}
    		}


    		var self=this;
	        $.ajax(
            {
                url: url,
                data: data,
                type: 'POST', //No I18N
                async:true,
                self:self,
                datatype:'json',//No I18N
                infoMsgID: '',
                beforeSend: function(XMLHttpRequest){
                	this.infoMsgID = opm_infoMsgs("infoMsg",Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this));//No I18N
                },
                success: function(response)
                {
                	$("#"+this.infoMsgID).remove();
                	var displayUnit = {"AverageOfColumnValues":Ember.I18n.t('webclient.availability.datatype.average',this),"BytesToKB":Ember.I18n.t("webclient.map.flash.kb_22",this),"BytesToMB":Ember.I18n.t("webclient.map.filefoldermonitor.units.megabyte",this),"BytesToGB":Ember.I18n.t("webclient.map.flash.gb_31",this),"BytesToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"CelciusToFahrenheit":Ember.I18n.t("webclient.customsnmp.Fahrenheit",this),"FahrenheitToCelcius":Ember.I18n.t("webclient.customsnmp.Celcius",this),"ColumnMin":Ember.I18n.t('webclient.devices.intftypes.min',this),"ColumnMax":Ember.I18n.t("webclient.devices.intftypes.max",this),"KiloByteToMB":Ember.I18n.t("webclient.map.filefoldermonitor.units.megabyte",this),"KiloByteToGB":Ember.I18n.t("webclient.map.flash.gb_31",this),"KiloByteToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"MegaByteToGB":Ember.I18n.t("webclient.map.flash.gb_31",this),"MegaByteToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"GigabyteToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"SumOfColumnValues":Ember.I18n.t("webclient.customsnmp.sum",this),"RowCount":Ember.I18n.t("webclient.settings.devicegrp.count",this)};//No I18N
                    self.set("result",response);//No I18N
					if(self.result.addnlParams) {
						Object.entries(self.result.addnlParams).forEach(function(val) {
							self.get("summaryList").pushObject({"header":val[0],"value":val[1]}); //No I18N
						})
					}
					$("#tableoidFormContainer").hide(); // No I18N
					$("#graphDetailsFormContainer").show(); // No I18N
                    if(response.error !== undefined || response.errorMsg !== undefined){
                    	self.set("errorMsgID",opm_infoMsgs("errorMsg",response.error ? response.error.message : response.errorMsg));//No I18N
                    	self.set('error',true);//No I18N
                    	self.send('clearResult');//No I18N
                    }else if(response.result !== undefined && !$.isEmptyObject(response.result)){
						$("#customsnmpform ~ .helpbox").hide();//No I18N
                    	$("#csnmp_queryresult").show();//No I18N
                    	if(self.get("errorMsgID") !== ""){//No I18N
							$("#"+self.get("errorMsgID")).remove();//No I18N
						}
						if(response.type != "tabulardata") { // No I18N
							self.set("isNumeric",response.isNumeric !== undefined ? response.isNumeric : true);//No I18N
						}
						if(response.isAdaptiveThresholdsEnabled!==undefined){
							self.set('isAdaptiveThresholdsEnabled',response.isAdaptiveThresholdsEnabled);//No I18N
						}
						self.set('isNumericMonitorType',self.get('isNumeric'));//No I18N
                    	$("#showSaveAbsolutesRow").hide();//No I18N
                    	if(response.showSaveAbsolutes !== undefined && response.showSaveAbsolutes === true){
                    		$("#showSaveAbsolutesRow").show();//No I18N
                    		if(response.saveAbsolutesType !== undefined){
                    			if(response.saveAbsolutesType === "INTEGER"){//No I18n
                    				$("#saveAbsoluteCounterRow").hide();
                    				$("#saveAbsoluteIntegerRow").show();
                    				$('#saveAbsoluteInteger').val("false").trigger('change');//No I18n
                    			}else if(response.saveAbsolutesType === "COUNTER"){//No I18n
                    				$("#saveAbsoluteCounterRow").show();
                    				$("#saveAbsoluteIntegerRow").hide();
                    				$('#saveAbsoluteCounter').val("false").trigger('change');//No I18n
                    			}
                    		}
                    	}
                   		self.set("parentOIDList",response.parentOID !== undefined ? response.parentOID : []);//No I18N

                    	if(response.type !== undefined){
                    		self.set('error',false);//No I18N
                    		self.set('monitorType',response.type);//No I18N
                    		self.send('articleStyle',0);//No I18N
                    		if((response.type === "multiple" && functionExp !== "SumOfColumnValues" && functionExp !== "RowCount" && functionExp !== "AverageOfColumnValues" && functionExp !== "ColumnMin" && functionExp !== "ColumnMax") || response.type === "multiplenode"){
	                    		if($("input:radio[name=csnmp_graphType]:checked").val() === "multiple" && self.selectedfunctionalExpObj.isDefault === "true"){//No I18N
	                    			$("#multipleNodeRow").show();//No I18N
	                    		}else{
	                    			$("#multipleNodeRow").hide();//No I18N
	                    		}
	                    		self.send("loadCustomGraph",response);//No I18N

	                    		if(!self.get('isAdminOperation') && self.selectedfunctionalExpObj.isDefault === "true"){
	                    			$("#graphTypeRow").show();//No I18N
	                    		}else{
	                    			$("#graphTypeRow").hide();//No I18N
	                    		}

								if(self.selectedfunctionalExpObj.isDefault === "true") {
									$("#graphDescRow").show();//No I18N
									$("#functionExpInfoBox").hide();//No I18N
									if(action === undefined){
										self.send("toggleGraphOIDColumns");//No I18N
									} 
								} else {
									$("#functionExpInfoBox").show();//No I18N
									$("#graphDescRow").hide() // No I18N
									if(action === undefined){
										$("#multiplenode").prop("checked",false);//No I18N
										self.send("toggleGraphOIDColumns",false);//No I18N
										self.set("showCheckBox",false);//No I18N
										$("input:radio[name=csnmp_graphType][value=multiple]").prop('checked',true) // No I18N
									} 
								}
	                    	} else if(response.type == "tabulardata") {
								$("#graphTypeRow").hide();//No I18N
	                    		$("#multipleNodeRow").hide();//No I18N
	                    		$("#graphDescRow").hide();//No I18N
								$("#tableoidFormContainer").show(); // No I18N
								$("#graphDetailsFormContainer").hide(); // No I18N
								self.set("isNumeric",false);//No I18N

								var jqGridFormat = getTableOIDJqgridFormat(response.result, "#tableoidFormContainer"); // No I18N
								var defaultOptions = jqGridFormat.defaultOptions;
								var colNames = jqGridFormat.colNames;
								var colModels = jqGridFormat.colModels;
								var colData = jqGridFormat.colData;
								self.set('tabularData', colData); // No I18N
								self.set('primaryColumns', colNames.map(function(val) { // No I18N
									// var isUniqueue = true;
									// var isContainsEmpty = false;
									// colData.forEach(function(row) {
									// 	if(row[val] == "") {
									// 		isContainsEmpty = true;
									// 	} else {
									// 		var matchedCols = colData.filter(function(r) {
									// 			return r[val] == row[val];
									// 		});
									// 		if(matchedCols.length > 1) {
									// 			isUniqueue = false;
									// 		}
									// 	}

									// })
									return { name: val, value: val};
								}));
								self.set('selectedPrimaryColumns', []); // No I18N
								Ember.run.scheduleOnce('afterRender',function(){//No I18N
									$("#columnsToMonitorTable").jqGrid("GridUnload");
									opm_loadJQgridWithData('#columnsToMonitorTable',colData, colNames, colModels,'','columnsToMonitorTablePager','',defaultOptions); // No I18N
									var cm = $("#columnsToMonitorTable").jqGrid("getGridParam", "colModel");
									for (var i = 0; i < cm.length; i++) {
										var label = cm[i].label || cm[i].name;
										$("#columnsToMonitorTable").jqGrid("setLabel", cm[i].name,'<div class="opmCheckBox small"><div><input type="checkbox" name="col-header-chk" class="col-header-chk" value="' + cm[i].name + '" />\<label class="bold">'+ cm[i].name +'</label></div>\</div>'); // No I18N
									}
									$('#columnsToMonitorTable').setGridWidth($("#columnsToMonitorTableContainer").width());//No I18N	
								});

							} else {
	                    		$("#graphTypeRow").hide();//No I18N
	                    		$("#multipleNodeRow").hide();//No I18N
	                    		$("#graphDescRow").hide();//No I18N
	                    		if(!self.get('isNumeric')){
	                    			$("#sampleGraph").hide();//No I18N
	                    		}

	                    	}
	                    	var displayTitle = functionExp !== "" ? $("#csnmp_functionalExpression :selected").text()+"[ "+$("#formula").val().replace(/\s/,'')+" ]" : $("#formula").val().replace(/\s/,'');//No I18N
	                    	self.set('displayOID',displayTitle);//No I18N
	                    	var unitToDisp = functionExp !== "" && displayUnit[functionExp] ? "("+displayUnit[functionExp]+")" : "";//No I18N
	                    	self.set("unitToDisplay",unitToDisp);//No I18N
	                    	if(response.type === "node"){//No I18N
	                    		var resultToDisp = (response.result.scalar !== undefined && response.result.scalar !== "") ? response.result.scalar : Ember.I18n.t('webclient.reports.healthreport.nodata',this);//No I18N
	                    		response.dataToLoadScalar = resultToDisp;
	                    	}else if(response.type === "multiplenode" || response.type === "multiple"){//No I18N
                    			var selectedCheck = self.get('instanceList');//No I18N
	                    		if(response.formatedResult !== undefined && response.formatedResult === true){
	                    			var formatedResult = [];
		                    		$.each(response.result,function(key,val){
		                    			if($.inArray(val.index,selectedCheck) > -1){
		                    				val.checked = true;
		                    			}else{
		                    				val.checked = false;
		                    			}
		                    			formatedResult.push(val);
			                    	});
		                    		response.dataToLoad = formatedResult;
	                    		}else{
	                    			var formatedResult = [];
		                    		$.each(response.result,function(key,val){
		                    			formatedResult.push({"index":key,"value":val});//No I18N
			                    	});
			                    	response.dataToLoad = formatedResult;
	                    		}
	                    		self.set("result",response);//No I18N
	                    		if($("input:radio[name=csnmp_graphType]:checked").val() === "node"){//No I18N
	                    			$(".snmpResultCheckbox").show();//No I18N
	                    		}else{
	                    			$(".snmpResultCheckbox").hide();//No I18N
	                    		}
	                    		self.send("loadCustomGraph",response);//No I18N
	                    	}

							if(response.type == "multiple") {
								self.set("ShowMonInstanceCntLimit", true);//No I18N
							} else {
								self.set("ShowMonInstanceCntLimit", false);//No I18N
							}

                    	}
                    }else{
                    	self.set("errorMsgID",opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.customoid.exp.err",this)));//No I18N
                    	self.set('error',true);//No I18N
                    	self.send('clearResult');//No I18N
                    }
                }
            });
		},
		loadCustomGraph: function(response){
			if(this.get("isNumeric")){//No I18N
				$("#sampleGraph").show();//No I18N
				var unit = this.get('csnmp_unit') !== undefined && this.get('csnmp_unit') !== "" ? this.get('csnmp_unit') : Ember.I18n.t('webclient.devices.details.processthresunit',this);//No I18N
				var jsonDataGraph = {"xyTitles":[Ember.I18n.t('jsp.commonstr.Time',this),unit],"graphData":[]};//No I18N
				if(response.result !== undefined){
					var graphDataObj = [];
					var selectedCheck = this.get('instanceList');//No I18N
				    var d = new Date();
				    var millisec = d.getTime();
					$.each(response.result, function(key,val){
						var temp = {};
						if(val.display !== undefined){
							temp.seriesname = val.display;
							temp.data = [[parseInt(millisec)-300000,parseFloat(val.value)],[parseInt(millisec),parseFloat(val.value)]];
						}else{
							temp.seriesname = key;
							if(response.type === "node"){//No I18N
								temp.seriesname =  $('#csnmp_monitorName').val().trim() !== "" ? $('#csnmp_monitorName').val() : Ember.I18n.t('webclient.devices.details.instance',this);//No I18N
							}
							temp.data = [[parseInt(millisec)-300000,parseFloat(val)],[parseInt(millisec),parseFloat(val)]];
						}
						graphDataObj.push(temp);
					});
					jsonDataGraph.graphData = graphDataObj;
				}

				var x_axes = jsonDataGraph.xyTitles !== undefined ? jsonDataGraph.xyTitles[0] : "";//No I18N
				var y_axes = jsonDataGraph.xyTitles !== undefined ? jsonDataGraph.xyTitles[1] : "";//No I18N

				var graphName = "sampleGraph";//No I18N
				var perfChartObj = {
					id : graphName,
					type : 'area', //No I18N
					jsonData : jsonDataGraph.graphData,
					series : "multi", //No I18N
					height : 250,
					columns:{
						datatype_1:'time',datatype_2:'numeric',columnname_1:x_axes,columnname_2:y_axes, timeFormat:'hours' //No I18N
					},
					tooltip: [0,Ember.I18n.t('webclient.devices.intftypes.value',this)+" : {{val(1)}} ({{col(1)}})"],//No I18N
					canvas:{
						title:{
							show:true,
							text: $('#csnmp_monitorName').val().trim() !== "" ? $('#csnmp_monitorName').val() : Ember.I18n.t("webclient.customsnmp.samplegraph",this)//No I18N
						}
					},
					legend: {
						"enabled": true //No I18N
					},
					"axes": { //No I18N
						"rotated": false, //No I18N
						"xaxis": { //No I18N
							"label": { //No I18N
								"text": x_axes //No I18N
							}
						},
						"yaxis": [ //No I18N
							{
								"label": { //No I18N
									"text": y_axes //No I18N
								}
							}
						]
					},
					chart : {
						stacked : false
					}
				}
				var arraObj={
					"placeholder":[],//No I18N
					"chartobj":[]//No I18N
				}
				var mappingobj={};
				arraObj.chartobj.push(perfChartObj);
				arraObj.placeholder.push(graphName);
				zChart(arraObj);
			}else{
				$("#sampleGraph").hide();
			}

		},
		changeGraphType: function(){
			var type = $('input:radio[name=csnmp_graphType]:checked').val();//No I18N
			if(type === "multiple"){//No I18N
				$("#multipleNodeRow").show();//No I18N
				$(".snmpResultCheckbox").hide();//No I18N
				$("#multiplenode").prop("checked",false);//No I18N
				$("#graphDescRow").show();//No I18N
				this.send("toggleGraphOIDColumns",true);//No I18N
				this.set("showCheckBox",false);//No I18N
				$('.seriesDisplay').hide();
			}else{
				$("#multipleNodeRow").hide();//No I18N
				$(".snmpResultCheckbox").show();//No I18N
				$("#graphDescRow").show();//No I18N
				this.send("toggleGraphOIDColumns",true);//No I18N
				this.set("showCheckBox",true);//No I18N
				$('.seriesDisplay').show();
			}
		},
		toggleGraphOIDColumns: function(refreshResult){
			var parentOID = this.get("parentOIDList")[0];//No I18N
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/mibbrowser/getSiblingsOfANode",{"oid":parentOID});//No I18N
			this.set("siblingsOID",!response.error ? response : []);//No I18N
			$("#indexColumn").select2({tags: true,minimumResultsForSearch:1});//No I18N
			$("#displayColumn").select2({tags: true,minimumResultsForSearch:1});//No I18N
			if(refreshResult !== undefined && (refreshResult === "true" || refreshResult === true)){//No I18N
				this.send("queryDevice");//No I18N
			}
		},
		primaryColumnsChanged: function() {
			var self = this;
			$("#columnsToMonitorTableContainer .col-header-chk[disabled]").prop("checked", false); // No I18N
			$("#columnsToMonitorTableContainer .col-header-chk").prop("disabled", false); // No I18N

			var primaryData = [];
			var isUniqueue = true;
			if(self.selectedPrimaryColumns.length > 0) {
				self.tabularData.forEach(function(row) {
					var primaryDataString = '';
					self.selectedPrimaryColumns.forEach(function(col) {
						$("#columnsToMonitorTableContainer .col-header-chk[value='" + col.name + "']").prop("checked", true); // No I18N
						$("#columnsToMonitorTableContainer .col-header-chk[value='" + col.name + "']").prop("disabled", true); // No I18N
						primaryDataString += row[col.name]
					});
					
					if(primaryData.indexOf(primaryDataString) == -1) {
						primaryData.push(primaryDataString);
					} else {
						isUniqueue = false;
					}
				});
				if(!isUniqueue) {
					opmAlertPopUp("", Ember.I18n.t('webclient.snmp.tableoid.monitor.primary.columns.error.duplicate', {
						columns: self.selectedPrimaryColumns.map(function(col) { return col.name; }).join(", ")
					}),500); //NO I18N
				}
			}
		},
		makeRefreshMandatory: function(){
			if($("#displayColumn").val() !== ''){//No I18N
				this.send("queryDevice","refresh");//No I18N
			}
		},
		addCustomMonitor: function(){
			var flag = true;
			var oidList = {};
			var isMultipleThreshold = false;
			var pageName = this.get('pageName');
			var customOid = $("#formula").val().replace(/\s/,'');//No I18N
			var self = this;
			var isCFEnabled = $('#customFieldEnable').is(':checked'); //No I18n
			if($('input:radio[name=csnmp_graphType]:checked').val() === "node"){//No I18N
				$("#csnmp_queryresult ul:first li").each(function(key,val){//No I18N
                    var currentLi = $(this).find("input");//No I18N
                    if(currentLi.is(":checked")){//No I18N
                    	var currentOID = currentLi.val();
                        oidList[currentOID] = currentLi.attr("data-display");//No I18N
                    }
	            });

			}else{
				oidList[customOid] = $("#csnmp_monitorName").val();//No I18N
			}

			var fieldsToValidate = {'empty':['formula','csnmp_monitorName','csnmp_interval'],'profName':['csnmp_monitorName'],'rangeCheck':{'csnmp_interval':1440},'positive':['csnmp_interval'],'nonnegativeorempty':[],'nonnegativeFloatOrEmpty':[]};//No I18N
			if($("#thresholdEnable").is(":checked")){
				fieldsToValidate.empty.push('failureThreshold');
				fieldsToValidate.positive.push('failureThreshold');
				fieldsToValidate.maxCheck = {'attentionMsg':250,'troubleMsg':250,'criticalMsg':250,'rearmMsg':250};//No I18N
			}
			if(this.get("isNumeric") === true){//No I18N
				fieldsToValidate.empty.push('csnmp_units');//No I18N
			}
			var numericType = $("input:radio[name='storeDataType']:checked").val();

			if(this.get("isNumeric") === false)
			{
				numericType = 2;
			}
			if($('#Perf_customFieldSelbox').is(':visible') && $('#customFieldValue').attr('data-customFieldId') == "0"){
				$("#customField_drpdwn").addClass('validateField error');//No I18N
				$("#customField_drpdwn").attr('data-error',Ember.I18n.t('webclient.opm.update.customfield.selectfield.error',this));//No I18N
				opmValidate($("#customField_drpdwn"));//No I18N
				return false;
			}
			if(isCFEnabled)
			{
				fieldsToValidate.empty.push('csnmp_interval');
				fieldsToValidate.positive.push('csnmp_interval');
				var monInterval = $("#csnmp_interval").val();
				if(monInterval<3)
				{
					$("#csnmp_interval").addClass('validateField error');//No I18N
					$("#csnmp_interval").attr('data-error',Ember.I18n.t('opm.custmon.interval.minlimit',this));//No I18N
					$("#csnmp_interval").focus();
					opmValidate($("#csnmp_interval"));//No I18N
					return false;	
				}
				else if(monInterval>24)
				{
					$("#csnmp_interval").addClass('validateField error');//No I18N
					$("#csnmp_interval").attr('data-error',Ember.I18n.t('opm.custmon.interval.maxlimit',this));//No I18N
					$("#csnmp_interval").focus();
					opmValidate($("#csnmp_interval"));//No I18N
					return false;		
				}
			}

			// Validation Table OID before adding the monitor
			if(this.get("monitorType") == "tabulardata") { // No I18N
				fieldsToValidate.empty = ['csnmp_tablemonitorName','csnmp_tableinterval']; // No I18N
				fieldsToValidate.minRangeCheck = {'csnmp_tableinterval':5}; // No I18N
				fieldsToValidate.rangeCheck = {'csnmp_tableinterval':1440}; // No I18N
			}

			if(!opm_validateFields(fieldsToValidate)){
				flag = false;
			}

			if(flag && this.get("monitorType") == "tabulardata") { // No I18N
				if(self.selectedPrimaryColumns.length == 0) {
					$('#AddMonitorsFour')[0].scrollTo(0,0)
					$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
					opm_validateFields({'empty':['primaryColumnsDD']})
					return false
				}
				if($("input[name='col-header-chk']:checked").length == 0) {
					opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.snmp.tableoid.monitor.select.columns",self));//No I18N
					return false;
				}
			}

			if(flag && self.get('isLookupEnabled')){
				flag = validateLookupArray(self,true);
			}
			/*if($("#thresholdEnable").is(":checked") && this.get("isNumeric") === true){//No I18N
				if(opm_validateFields({'positiveorempty':['attentionVal','troubleVal','criticalVal','rearmVal']})){//No I18N
					if(!validatePerfThresholds()){
						flag = false;
						$.each(updatePerfMonErrorObj,function(field,msg)
						{
		                    $("#"+field).addClass('validateField error');//No I18N
		                    $("#"+field).attr('data-error',msg);//No I18N
		                    opmValidateTooltipDefine();
		                    opmValidate($("#"+field));//No I18N
						});
					}
				}else{
					flag = false;
				}
			}*/
			if(flag && $("#thresholdEnable").is(":checked")){//No I18N
				OPMClient.SettingsDeviceTemplateController.set("isCheckNumeric",false); //No I18n
				if(numericType != undefined && (numericType ===1 || numericType ===3 ))
				{
					OPMClient.SettingsDeviceTemplateController.isCheckNumeric = true; //No I18N
				}
				updatePerfMonErrorObj = {};
				if((pageName !== 'monitorProfile') && $("#attentionType").val() !== undefined && $("#attentionType").val() === "equal" && ($("#attentionVal").val().indexOf("|") > -1 || $("#troubleVal").val().indexOf("|") > -1 || $("#criticalVal").val().indexOf("|") > -1 || $("#rearmVal").val().indexOf("|") > -1))
                {
                    if(!validatePerfMultipleThresholds_Equal(numericType)){
                    	flag = false;
						showThresholdValidationMsg(updatePerfMonErrorObj);
                    }
                    isMultipleThreshold = true;
                }
                else{
                	if(!validatePerfThresholds(numericType)){
						flag = false;
						$.each(updatePerfMonErrorObj,function(field,msg)
						{
		                    $("#"+field).addClass('validateField error');//No I18N
		                    $("#"+field).attr('data-error',msg);//No I18N
		                    opmValidateTooltipDefine();
		                    opmValidate($("#"+field));//No I18N
						});
					}
                }
                if($("#enableATDiv").is(':visible') && $("#enableAT").is(":checked"))//No I18N
				{					
			        if($("#attentionVal").val()!==""){if(!opm_validateFields({'validInteger':['attentionVal']})){flag = false;return false;}}//No I18N
			        if($("#troubleVal").val()!==""){if(!opm_validateFields({'validInteger':['troubleVal']})){flag = false;return false;}}//No I18N
			        if($("#criticalVal").val()!==""){if(!opm_validateFields({'validInteger':['criticalVal']})){flag = false;return false;}}//No I18N
			        if(!opm_validateFields({'validInteger':['rearmVal']})){flag = false;return false;}//No I18N
				    if($("#attentionVal").val() ==="" && $("#troubleVal").val()==="" && $("#criticalVal").val()===""){//No I18N
				        opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.devices.snapshot.editprocessmonitor.enterthres",this));//No I18N
						flag = false;
				        return false;
					}
					if(!checkATLimitValues(numericType==="3" || numericType===3) || !checkATLimitRangeValues()){
						flag = false;
						return false;
					}
				}
			}
			if(flag){
				var url = window.OPM.apiUrlPattern+'/admin/addCustomSNMPMonitor';//No I18N

				var parentOID = $("#csnmp_parentoid").val();//No I18N
				var data = {};
				if(window.OPM.currentView.name.indexOf("Settings.Monitors.SubMonitors") > -1){//No I18N
					data = {'vendor':$("#addSNMP_vendorList_cs").val(),"addMetricAs":'template'};//No I18N
				}else if(pageName === 'monitorProfile'){//No I18N
					data = {'vendor':$("#vendorSelection").val(),"addMetricAs":'template'};//No I18N
				}else{
					data = {'deviceName':deviceBasicDetails.deviceName,'vendor':deviceBasicDetails.vendorName,"addMetricAs":'monitor'};//No I18N
				}
				if(OPMClient.InventoryDeviceDetailsController.isStorageDevice) {
            		data.isStorage=true;
                }
			
				var processObj = false;
				var type = this.get('monitorType');//No I18N
				if(type !== "node"){//No I18N
					if($('input:radio[name=csnmp_graphType]:checked').val() === "node"){//No I18N
						type = "node";//No I18N
			            processObj = true;
					}else if($('input:radio[name=csnmp_graphType]:checked').val() === "multiple" && $("#multiplenode").is(":checked")){//No I18N
						type = "multiplenode";//No I18N
					}else if(type != "tabulardata"){
						type = "multiple";//No I18N
					}
				}

				var customMonArr = [];
				var isNumeric = this.get("isNumeric");//No I18N
				var parentOIDList = this.get("parentOIDList");//No I18N
				var queriedMonitorType = this.get("monitorType");//No I18N
				// Flag the monitor only when the OID being saved is exactly the one fetched via GenAI (Get OID Details)
				var aiGeneratedOID = self.get("aiGeneratedOID");//No I18N
				var isOIDFromAI = (aiGeneratedOID !== undefined && aiGeneratedOID !== null && aiGeneratedOID !== "" && $("#formula").val().replace(/\s+/g,'') === aiGeneratedOID);//No I18N

				$.each(oidList, function(key,val){
					var monitorName = ($("#csnmp_monitorName").val()).trim();//No I18N
					if(queriedMonitorType == "tabulardata") {
						monitorName = $("#csnmp_tablemonitorName").val().trim();
					}
					var oid = $("#formula").val().replace(/\s/,'');//No I18N
					if(processObj){
						var specialsindex = escape(val).indexOf("%uFFFD");
						if(specialsindex != -1){
							val = val.substring(0,val.length-1);
						}
						monitorName += " - "+val;//No I18N
						var temp =  oid;
						$.each(parentOIDList, function(i,j){
							temp = temp.replace(j,j+key);
						});
						//oid = temp.replace(parentOID,key);
						oid = temp;
					}
					var policyName = monitorName.replace(/\s/gi,'');//No I18N
					var checkNumeric = (isNumeric === true) ? "true" : "false";//No I18N
					//var functionalExpression = isNumeric ? $("#csnmp_functionalExpression").val() : "StringToNumeric";//No I18N
					var functionalExpression = $("#csnmp_functionalExpression").val();//No I18N
					var units = isNumeric ? $("#csnmp_units").val() : "";//No I18N
					var attnMsg = $("#attentionMsg").val();//No I18N
					var trubMsg = $("#troubleMsg").val();//No I18N
					var criMsg = $("#criticalMsg").val();//No I18N
					var customMonObj = {"graphName":policyName,//No I18N
										"displayName":monitorName,//No I18N
										"DISPNAME":monitorName,//No I18N
										"oid":oid,//No I18N
										"type":type,//No I18N
										"graphDescription":monitorName,//No I18N
										"Description":monitorName,//No I18N
										"units":units,//No I18N
										"functionalExp":functionalExpression,//No I18N
										"protocol":"SNMP",//No I18N
										"Protocol":"SNMP",//No I18N
										"checkNumeric":checkNumeric,//No I18N
										"isNumeric":isNumeric,//No I18N
										"numericType":isNumeric ? numericType : "2",//No I18N
										"interval":parseInt($("#csnmp_interval").val())*60,//No I18N
										"intervalMins":$("#csnmp_interval").val(),//No I18N
										"isEnabled":$("#thresholdEnable").is(":checked") ? "Enabled" : "Not Enabled",//No I18N
										"id":"custGraph_"+policyName,//No I18N
										"GRAPHID":"custGraph_"+policyName,//No I18N
										"warningType":isNumeric ? $("#attentionType").val() : $("#attentionStrType").val(),//No I18N
										"warningVal":$("#attentionVal").val(),//No I18N
										//"warningMsg":$("#attentionMsg").val(),//No I18N
										"troubleType":isNumeric ? $("#troubleType").val() : $("#troubleStrType").val(),//No I18N
										"troubleVal":$("#troubleVal").val(),//No I18N
										//"troubleMsg":$("#troubleMsg").val(),//No I18N
										"criticalType":isNumeric ? $("#criticalType").val() : $("#criticalStrType").val(),//No I18N
										"criticalVal":$("#criticalVal").val(),//No I18N
										//"criticalMsg":$("#criticalMsg").val(),//No I18N
										"rearmType":isNumeric ? $("#rearmType").val() : $("#rearmStrType").val(),//No I18N
										"rearmVal":$("#rearmVal").val(),//No I18N
										"rearmMsg":$("#rearmMsg").val(),//No I18N
										"timeout":"1",//No I18N
										"sSave":"true",//No I18N
										"isCustomGraph":true,//No I18N
										"moninterval":parseInt($("#csnmp_interval").val())*60,//No I18N
										"failureThreshold":$("#failureThreshold").val()//No I18N

									}

									if(isOIDFromAI)
									{
										customMonObj.fromOIDFinder = true;
									}

									if($("#enableATDiv").is(':visible'))//No I18n
									{
										customMonObj.isAdaptiveThresholdsEnabled = $("#enableAT").is(":checked");//No I18n
										customMonObj.deviationType = (customMonObj.isAdaptiveThresholdsEnabled)?$("input[name='perfGrpDataType']:checked").val():"2";//No I18n
										if(customMonObj.isAdaptiveThresholdsEnabled)
										{
											customMonObj.lowerlimitType=$("#lowerLimitType").val();//No I18n
											customMonObj.lowerlimitVal=$("#lowerLimitValue").val();//No I18n
											customMonObj.upperlimitType=$("#upperLimitType").val();//No I18n
											customMonObj.upperlimitVal=$("#upperLimitValue").val();//No I18n
											customMonObj.upperlimitMsg=$("#upperLimitMsg").val();//No I18n
											customMonObj.upperlimitSeverity = window.OPM.atUpperLimitSeverity;
										}
									}
									if(attnMsg !== undefined && attnMsg !=="")
									{
										customMonObj.warningMsg = attnMsg;
									}
									if(trubMsg !== undefined && trubMsg !=="")
									{
										customMonObj.troubleMsg = trubMsg;
									}
									if(criMsg !== undefined && criMsg !=="")
									{
										customMonObj.criticalMsg = criMsg;
									}
									if(pageName !== 'monitorProfile'){
										customMonObj.isMultipleThreshold=isMultipleThreshold;
									}
									if($('#customFieldEnable').is(':checked')) {
										customMonObj.customFieldId = parseInt($('#customFieldValue').attr('data-customFieldId'));
									}

					/*if(type === "multiplenode"){
						customMonObj.DisplayColumn = $("#displayColumn").val();
						customMonObj.Index = $("#indexColumn").val();
					}*/
					if((queriedMonitorType === "multiple" || queriedMonitorType === "multiplenode") && ($("#displayColumn").val() !== null && $("#displayColumn").val() !== "")){//No I18N
						customMonObj.DisplayColumn = $("#displayColumn").val();//No I18N
						if($("#indexColumn").val() !== null && $("#indexColumn").val() !== "") { // no i18n
							customMonObj.Index = $("#indexColumn").val();//No I18N
						}
		    		}

					if($("#showSaveAbsolutesRow").is(":visible")){//No I18N
						if(($("#saveAbsoluteCounter").is(":visible") && $("#saveAbsoluteCounter").val() === "true") || ($("#saveAbsoluteInteger").is(":visible") && $("#saveAbsoluteInteger").val() === "true")){//No I18N
							customMonObj.SaveAbsolutes = true;
						}
					}
					if(queriedMonitorType == "tabulardata") {//No I18N
						customMonObj.numericType = "4";//No I18N
						customMonObj.PrimaryColumns = self.selectedPrimaryColumns.map(function(val) {
							return val.value
						});
						customMonObj.SelectedColumns = [];
						$("input[name='col-header-chk']:checked").each(function(_, elem) { //No I18N
							customMonObj.SelectedColumns.push(elem.value);
						});
						customMonObj.interval = parseInt($("#csnmp_tableinterval").val()) * 60;
						customMonObj.intervalMins = $("#csnmp_tableinterval").val();//No I18N
						customMonObj.moninterval = parseInt($("#csnmp_tableinterval").val()) * 60;//No I18N
					}
					addPerfGroupToParamsObject(customMonObj,'addSnmp','0');//NO I18N
					addLookupData(customMonObj,self,false);
					customMonArr.push(customMonObj);
				});
				
				customMonArr.forEach(function(_, index) {
					if(self.selectedfunctionalExpObj && self.selectedfunctionalExpObj.fields) {
						self.selectedfunctionalExpObj.fields.forEach(function(field, id) {
							customMonArr[index]['addnlParam' + (id + 1)] = field.value; // No I18N
						})
					}
				}) 

				if(this.get("pageName") === "deviceTemplate"){
					var isMonitorNameExists = false;
					if(customMonArr[0].graphName!==undefined){
		                var isMonitor=opm_ajaxGetRequest(window.OPM.apiUrlPattern+'/admin/checkGraphName?graphName='+customMonArr[0].graphName); //No I18N
		                if(isMonitor!==undefined && isMonitor.data!==undefined && isMonitor.data.message!==undefined && isMonitor.data.message!=="false" && isMonitor.data.message!==false){
		                    isMonitorNameExists=true;
		                }
		            }
		            $.each(OPMClient.SettingsDeviceTemplateController.graphIds, function(i3,val3){
		                if(val3.dataArray.graphName===customMonArr[0].graphName){
		                    isMonitorNameExists=true;
		                }
		            });
		            if(isMonitorNameExists){
		                $('#csnmp_monitorName').addClass('validateField error');//No I18N
		                $('#csnmp_monitorName').attr('data-error',Ember.I18n.t("webclient.dt.monitor.alreadyexists",this));//No I18N
		                $('#csnmp_monitorName').focus();
		                opmValidate($('#csnmp_monitorName'));
		            }else{
		            	this.send("frameDataForDeviceTemplate",customMonArr);//No I18N
		            }
				}
				else{
					var dataArrayObj = {'dataArray':customMonArr};//No I18N
					data.graphObj = JSON.stringify(dataArrayObj);
		    		var self = this;
			        $.ajax(
		            {
		                url: url,
		                data: data,
		                type: 'POST', //No I18N
		                async:false,
		                self:self,
		                success: function(response)
		                {
		                    if(response!== undefined){
		                    	if(response.result !== undefined){
		                    		var options={};
		                    		options.callback_func = function(){
		                    			if(self.get('pageName') === "vendorMonitor"){//No I18N
											opm_transitionToParentRoute("Settings.Monitors.SubMonitors");//No I18N
											$("#perfMonitors_type").select2().val("customMonitors").trigger("change");//No I18N
										}else if(pageName === 'monitorProfile'){//No I18N
											var currController = window.OPM.currentView.handler.controller;
											getVendorMonitors(currController,false);
											opm_transitionToParentRoute('Settings.Configurations.MonitorProfile');//No I18N
										}else{
			                    			opm_transitionToParentRoute('Inventory.Device.Monitors'); //No I18N
			                    			OPMClient.Inventory.getDeviceMonitorsDetails(OPMClient.InventoryDeviceDetailsController.deviceName);
											OPMClient.Inventory.getSelectedMonitors(OPMClient.InventoryDeviceDetailsController.monitorsName);
										}
		                    		}
		                    		opm_infoMsgs("successMsg",response.result.message,options);//No I18N
		                    	}else if(response.error !== undefined){
		                    		self.set("errorMsgID",opm_infoMsgs("errorMsg",opm_escapeHTML(response.error.message)));//No I18N
		                    	}
		                    }
		                }
		            });
				}
			}
		},
		enableCustomFieldDrpDown:function() {
			if($("#customField_drpdwn").hasClass('active') && !$('#snmp_CF_Search').is(':focus')) {
				$("#customField_drpdwn").removeClass('active');
			} else {
				$("#customField_drpdwn").addClass('active');
				$('#customField_DropDownBox').show();
				if($("#customField_drpdwn").attr('data-error') !== undefined)
				{
					$("#customField_drpdwn").removeAttr('data-error');
					$('.OpMToolBar').hide();
				}
			}
		},
		selectCustomField: function(field)
		{
			$('#customFieldValue').text(field.customFieldNameDisp);
			$('#customFieldValue').attr('data-customFieldId',field.customFieldId);//NO I18N
			//$('#customField_UL'+' #'+field.customFieldId).attr('selected',true);//NO I18N
		},
		addNewCustomField: function()
		{
			var self = this;
			var slideDetails = {};
		    slideDetails.id = "CustomMonitor_CustomField";
		    slideDetails.componentName = "OPMClient.OpmCustomMonitorCustomFieldComponent"; //No I18n
		    slideDetails.slideHeader = Ember.I18n.t('webclient.add.fielld');//No I18N
		    slideDetails.isSmall = true;
		    slideDetails.actionName = "customField_cancelAction";//No I18N
		    slideDetails.parentObj = self;
		   	self.set("slideDetails",slideDetails);//No I18N
		   	slideInWithId('CustomMonitor_CustomField'); //No I18n
		},
		addCustomField: function() 
		{
			var customFieldAdded = opm_additionalFields("Device","fromCustomMonitor"); //No I18N
			if(customFieldAdded) 
			{
				var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listAdditionalFields?type=CustFieldToGraph"); //No I18N
				this.set('customFieldslist',list); //No I18n
				this.send('customField_cancelAction'); //No I18n
				this.send('selectCustomField',list[list.length-1]); //No I18n
			}
		},
		customField_cancelAction: function() {
			slideOutWithId('CustomMonitor_CustomField'); //No I18n
			this.set("slideDetails",undefined);//No I18N
		},
		frameDataForDeviceTemplate: function(customMonArr){
			$.each(customMonArr, function(i,customMonObj){
				var showDial=false;
				if(!customMonObj.isNumeric){
					showDial = "hide";//No I18N
				}
				OPMClient.SettingsDeviceTemplateController.customGraphCnt = OPMClient.SettingsDeviceTemplateController.customGraphCnt + 1;
				if(customMonObj.type == "tabulardata") {
					customMonObj.DISPLAYNAME = customMonObj.displayName;
					showDial = false;
				}
				var newRowData = {'displayName':customMonObj.displayName,'DISPLAYNAME':customMonObj.displayName,'Protocol':'SNMP','protocol':'SNMP','moninterval':customMonObj.moninterval,'intervalMins':customMonObj.intervalMins,'showDial':showDial,'THRESHOLDENABLED':$("#thresholdEnable").is(":checked") ? Ember.I18n.t('webclient.devices.intftypes.enabled',this) : Ember.I18n.t('webclient.devices.details.notenabled',this),'id':customMonObj.id, dataArray: customMonObj,'isEdited':true,failureThreshold:customMonObj.failureThreshold,numericType:customMonObj.numericType,type:customMonObj.type}; //No I18N
				OPMClient.SettingsDeviceTemplateController.graphIds.push(newRowData);
			});
			opm_deviceTemplateMonitorGridLoad(OPMClient.SettingsDeviceTemplateController.graphIds);
			if(OPMClient.SettingsDeviceTemplateController.isAdd){
				opm_transitionToParentRoute("Settings.Configurations.DeviceTemplate.Add");//No I18N
			}else{
				opm_transitionToParentRoute("Settings.Configurations.DeviceTemplate.Edit");//No I18N
			}
		},
		clearResult: function(){
			$("#sampleGraph").hide();//No I18N
			$('#csnmp_queryresult').hide();	//No I18N
		},
		/*addOperatorToExp: function(){
			if($("#csnmp_operators").val() !== "("){
				if(opm_validateFields({'empty':['formula']})){//No I18N
					$("#formula").val($("#formula").val()+$("#csnmp_operators").val());//No I18N
				}
			}else{
				$("#formula").val($("#formula").val()+$("#csnmp_operators").val());//No I18N
			}
		},*/
		gotoMIBBrowser: function(){
			opm_transitionToParentRoute(this.get("baseRoute")+".SNMPMIBBrowser");//No I18N
		},
		toggleNewVendorDiv: function(state){
			if(state){
				$("#newVendorRow").show();//No I18N
				$("#vendorNewName").val('');//No I18n
				$("#vendorComboRow").hide();//No I18N
			}else{
				$("#newVendorRow").hide();//No I18N
				$("#vendorComboRow").show();//No I18N
			}
		},
		addNewVendor: function(){
			var vendorName = $("#vendorNewName").val();
			if(opm_validateFields({empty:['vendorNewName'],custom:[{condition:!opm_isValidVendorName(vendorName),identifier:'vendorNewName',message:Ember.I18n.t('webclient.devices.devprop.status.spechar')}]})){
			this.get('snmpVendorList').pushObject(vendorName);
			this.set("selectedVendor",vendorName);//No I18N
			$('#addSNMP_vendorList_cs').select2({data:this.get('snmpVendorList')});
			$('#addSNMP_vendorList_cs').val(vendorName).select2(); //No I18N
			this.send("toggleNewVendorDiv",false);//No I18N
			}
		},
		resetValues: function(isCFReset){
			$('#radioInteger').prop('checked',true);//No I18N
			this.set('thresholdFlag',true);//No I18N
			$('#attentionVal, #troubleVal, #criticalVal, #rearmVal').val("");//No I18N
			$('#thresholdEnable').prop('checked',false);//No I18N
			$('#failureThreshold').val("1");//No I18N
			if(isCFReset){
				$("#customFieldEnable").prop('checked',false); //No I18n        
				$("#Perf_customFieldSelbox").hide();
			}
		},

		showCustomFunctionExpressionSlide: function() {
			var self = this;
			var moid = ""  // No I18N
			if(self.deviceListDetails) {
				var selectedDevice = self.deviceListDetails.findBy('ipaddress', self.selectedDeviceName); // No I18N
				moid = selectedDevice.moid
			} else if(deviceBasicDetails) {
				moid = deviceBasicDetails.moID
			}

			var data = {
				moid: moid,
				expOID: $("#formula").val().replace(/\s/, ''), // No I18N
				protocol:'SNMP', // No I18N
				functionExp: self.selectedfunctionalExp,
				timeout:'2', // No I18N
				isView: false
			}
	

			var slideDetails = { 
				"id" : "custom-function", //No I18N
				"slideHeader" : Ember.I18n.t("webclient.settings.addCustomFunction"), //No I18N
				"componentName" : "OPMClient.CustomFunctionExpression", //No I18N
				"isFull": true, //No I18N
				"data": data, // No I18N 
				"callBackFunc": function(value) { //No I18N
					self.set("customFunctionExpression", undefined); // No I18N
					self.send("initializeFunctionalExp"); // No I18N
					$("#csnmp_functionalExpression").val(value ? value : self.functionalExp[0].expression).select2(); // No I18N
					self.set("selectedfunctionalExp", value ? value : self.functionalExp[0].expression); // No I18N
				}
			}

			if(self.selectedfunctionalExp != "CUSTOM" && self.controller.selectedfunctionalExpObj.isDefault === "false") { // No I18N
				slideDetails.slideHeader = Ember.I18n.t("webclient.settings.viewCustomFunction"); // No I18N
				var funcExpRes = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/viewCustomFunctionalExpression", {expressionId: self.controller.selectedfunctionalExpObj.expressionId}); // No I18N
				if(funcExpRes) {
					if(funcExpRes.error && funcExpRes.error.message) {
						return opm_infoMsgs("errorMsg", opm_escapeHTML(funcExpRes.error.message)); // No I18N
					}
					data.id = funcExpRes.EXPRESSIONID; 
					data.name = funcExpRes.EXPRESSIONNAME; 
					data.description = funcExpRes.DESCRIPTION;
					data.command = funcExpRes.COMMANDLINE; 
					data.script = funcExpRes.SCRIPTBODY; 
					data.timeout = funcExpRes.TIMEOUT; 
					data.isView = true;
				}

				slideDetails.data = data;
				slideDetails.callBackFunc = function() {
					self.set("customFunctionExpression", undefined); // No I18N
				}
			}

			this.set("customFunctionExpression", slideDetails) // No I18N
		}
	},
	deviceObserver: function(){
		var self = this;
		if(this.get('selectedDeviceName') !== undefined){
			var deviceName = this.get('selectedDeviceName');//No I18N
			var deviceList = this.get("deviceListDetails");//No I18N

        	$.each(deviceList, function(key,val){
        		if(deviceName === val.ipaddress){
        			deviceName = val.deviceName;
        			if(val.vendorName !== undefined && val.vendorName !== '' && val.vendorName !== null){
	        			$('#addSNMP_vendorList_cs').val(val.vendorName).select2();//No I18N
	        		}
        		}
        	});
        	var crdList = {};
        	if(window.OPM.isCentralServer){
        		var eeProbeID = deviceName.substring(deviceName.lastIndexOf('.')+1,deviceName.length);
        		crdList = opm_ajaxGetResponse(eeClientReqToProbe(window.OPM.apiUrlPattern+"/device/GetCredentialsForDevice?name="+deviceName,eeProbeID));//No I18N
        	}else{
        		crdList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/device/GetCredentialsForDevice?name="+deviceName);//No I18N
        	}
        	setTimeout(function(){
        		$('#csnmp_deviceName').select2({minimumResultsForSearch: 1 }); //No I8N
			},100);
			if(crdList !== undefined && crdList.snmp !== undefined){
				$.each(crdList.snmp,function(k,v){
					if(v.checked == "checked"){//No I18N
						OPMClient.DeviceMonitorsActionController.customSNMPMonitor.credName = v.credentialName;
						OPMClient.DeviceMonitorsActionController.customSNMPMonitor.snmpversion = (v.type === "SNMP v1/v2") ? "snmp1" : "snmp3";//No I18N
						$.ajax({
							url: window.OPM.apiUrlPattern+ "/admin/getCredentialDetails?credentialName="+encodeURIComponent(v.credentialName)+'&type='+v.type,//No I18N
							type: 'GET', //No I18N
							async:false,
							success: function(jsonData){
								if(jsonData !== undefined && jsonData.port !== undefined){
									OPMClient.DeviceMonitorsActionController.customSNMPMonitor.port = jsonData.port;
								}
							}
						});
					}
				});
			}
		}
	}.observes('selectedDeviceName').on('init'),//No I18N
	fillUnitsField: function(){
		var displayUnit = {"AverageOfColumnValues":Ember.I18n.t('webclient.availability.datatype.average',this),"BytesToKB":Ember.I18n.t("webclient.map.flash.kb_22",this),"BytesToMB":Ember.I18n.t("webclient.map.filefoldermonitor.units.megabyte",this),"BytesToGB":Ember.I18n.t("webclient.map.flash.gb_31",this),"BytesToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"CelciusToFahrenheit":Ember.I18n.t("webclient.customsnmp.Fahrenheit",this),"FahrenheitToCelcius":Ember.I18n.t("webclient.customsnmp.Celcius",this),"ColumnMin":Ember.I18n.t('webclient.devices.intftypes.min',this),"ColumnMax":Ember.I18n.t("webclient.devices.intftypes.max",this),"KiloByteToMB":Ember.I18n.t("webclient.map.filefoldermonitor.units.megabyte",this),"KiloByteToGB":Ember.I18n.t("webclient.map.flash.gb_31",this),"KiloByteToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"MegaByteToGB":Ember.I18n.t("webclient.map.flash.gb_31",this),"MegaByteToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"GigabyteToTB":Ember.I18n.t("webclient.customsnmp.tb",this),"SumOfColumnValues":Ember.I18n.t("webclient.customsnmp.sum",this),"RowCount":Ember.I18n.t("webclient.settings.devicegrp.count",this)};//No I18N
		this.set('csnmp_unit',displayUnit[this.selectedfunctionalExp] !== undefined ? displayUnit[this.selectedfunctionalExp] : "");//No I18N
		if(this.selectedfunctionalExp === 'CUSTOM') { //No I18N
			if(opm_validateFields({'empty':['formula']})) { // No I18N
				this.set('selectedfunctionalExpObj', {}) //No I18N
				this.send("showCustomFunctionExpressionSlide"); // No I18N
			} else {
				this.set('selectedfunctionalExp', this.functionalExp[0].expression); // No I18N
				$("#csnmp_functionalExpression").val(this.functionalExp[0].expression).trigger('change'); // No I18N
				setTimeout(function() {
					$("#formula").focus(); // No I18N
				})
			}
		} else {
			var selectedExpObj = this.functionalExp.findBy('expression', this.selectedfunctionalExp); //No I18N
			
			if(selectedExpObj) {
				if(selectedExpObj.example) { 
					selectedExpObj.exampleObj = selectedExpObj.example.map(function(ex) {
						return Object.entries(JSON.parse(ex));
					});
				}

				if(selectedExpObj.requiredInput) {
					selectedExpObj.fields = [];
					for(var i = 0; i < parseInt(selectedExpObj.requiredInput); i++) {
						var fieldObj = selectedExpObj.additionalParamInputs["param" + (i + 1)]
						fieldObj.value = ""; // No I18N
						fieldObj.id = "param" + (i + 1); // No I18N
						selectedExpObj.fields.push(fieldObj);
					}
					this.set('selectedfunctionalExpObj', selectedExpObj); // No I18N
				} else {
					delete selectedExpObj.fields;
					this.set('selectedfunctionalExpObj', selectedExpObj) // No I18N
				}
			}
		}
	}.observes('selectedfunctionalExp'),//No I18N
	addOperatorToExp: function(){
        var self = this;
        if(this.get('selectedOperator') !== undefined){
            if(this.get('selectedOperator') !== "("){
                if(opm_validateFields({'empty':['formula']})){//No I18N
                    $("#formula").val($("#formula").val()+this.get('selectedOperator'));//No I18N
                }
            }else{
                $("#formula").val($("#formula").val()+this.get('selectedOperator'));//No I18N
            }
            // Reset the selected operator so the control behaves normally after selection
            Ember.run.scheduleOnce('afterRender', function(){//No I18N
                self.set('selectedOperator','');//No I18N
            });
        }
    }.observes('selectedOperator'),//No I18N
	lookupChangeObserver:function(){
		var self = this;
		var resetOtherProps = function(){
			Ember.run.scheduleOnce('afterRender',function(){//No I18N
				self.send('resetValues');//No I18N
				self.send('thresholdEnable');//No I18N
			});
		}
		if(self.get('isLookupEnabled')){
			if(!(self.get('isNumeric'))){
				self.setProperties({isNumeric:true,isTypeChangedMonitor:true});
				resetOtherProps();
			}
		}else{
			if(self.get('isTypeChangedMonitor')){
				self.setProperties({isNumeric:false,isTypeChangedMonitor:false});
				resetOtherProps();
			}
		}
	}.observes('isLookupEnabled'),//No I18N
	willDestroyElement: function(){
		$('#viewLogs article').removeClass("completed");//No I18N
		$('#viewLogs article').removeClass("active");//No I18N
		$('#viewLogs article section').css({'display':''});//No I18N
		$($('#viewLogs article')[0]).addClass("active");//No I18N
		$($('#viewLogs article section')[0]).css({'display':'block'});//No I18N
		$('#viewLogs article').css({'display':'none'});//No I18N
		$($('#viewLogs article')[0]).css({'display':'block'});//No I18N
		$("#formula").val("");//No I18N
		this.set("aiGeneratedOID", undefined);//No I18N
		$(".cs_clear").val("");//No I18N
		$('#multiplenode,#thresholdEnable').prop('checked', false);//No I18N
		$('#csnmp_functionalExpression').select2().val("").trigger('change');//No I18N
		$("#summaryDetails").hide();//No I18N
		$("#csnmp_interval").val("15");//No I18N
		$("#failureThreshold").val("1");//No I18N
		//$('#saveAbsolute').select2().val("false").trigger('change');//No I18N
		$("input:radio[name=csnmp_graphType][value=multiple]").prop('checked',true);//No I18N
		$("#viewLogs").removeClass('fromSettings');
		$("body").removeClass('settingsCustomSNMP');
		this.set("slideDetails",undefined);//No I18N
		delete OPMClient.SettingsAddEditController.vendorList;
		slideOutWithId('CustomMonitor_CustomField'); //No I18n
		$("#customFieldEnable").prop('checked',false); //No I18n
	}
});


OPMClient.CustomFunctionExpression = Ember.Component.extend({
	templateName: "components/custom-function-expression", //No I18N
	helpCardContent: [{
		label: Ember.I18n.t("webclient.opm.addCustomFunction.helpcard.how.it.works",this), //No I18N
		description: Ember.I18n.t("webclient.opm.addCustomFunction.helpcard.how.it.works.desc",this) // No I18N
	}, {
		label: Ember.I18n.t("webclient.settings.customFunction.expressionname",this), //No I18N
		description: Ember.I18n.t("webclient.settings.customFunction.expressionname.desc",this) // No I18N
	}, {
		label: Ember.I18n.t("webclient.script.form.cmd",this), //No I18N
		description: Ember.String.htmlSafe(Ember.I18n.t("webclient.opm.addCustomFunction.helpcard.commandLine",this)) //No I18N
	}, {
		label: Ember.I18n.t("webclient.script.form.body",this), //No I18N
		description: Ember.String.htmlSafe(Ember.I18n.t("webclient.opm.addCustomFunction.helpcard.scriptbody.desc",this) + '<br><br>' + Ember.I18n.t("webclient.opm.addCustomFunction.helpcard.scriptbody.autogen",this)) //No I18N
	}, {
		label: Ember.I18n.t("webclient.script.output.format",this), //No I18N
		description: Ember.String.htmlSafe(Ember.I18n.t("webclient.script.helpcard.format",this) + '<br><br><p class="m-none">' + Ember.I18n.t("webclient.opm.addCustomFunction.helpcard.outputformat",this) + '</p>') //No I18N
	}, {
		label: Ember.I18n.t("webclient.admin.Services.Timeout",this), //No I18N
		description: Ember.I18n.t("webclient.settings.customFunction.timeout.desc",this) // No I18N
	}],
	didInsertElement: function() {
		this.set("customFunc", this.slideDetails.data) // No I18N
		this.set('defaultScript', {	 // No I18N
			'vbs': '\' This is a sample VBScript that demonstrates parsing JSON input and printing it.\n\' Users can also write their own script bodies and provide output in the expected format.\n\'\n\' Expected format for a single direct value:\n\' Data:\n\' -1=Value1\n\'\n\' Expected format for instance-value pairs:\n\' Data:\n\' Instance1=Value1\n\' Instance2=Value2\n\nDim objArgs, jsonInput, objJSON, key, value\n\n\' Check if exactly one command line argument is provided\nSet objArgs = WScript.Arguments\nIf objArgs.Count = 0 Then\n\tWScript.Echo "Error: No JSON input provided"\n\tWScript.Echo "Usage: cscript parseJSON.vbs <JSONString>"\n\tWScript.Quit 1\nElseIf objArgs.Count > 1 Then\n\tWScript.Echo "Error: Too many arguments provided. Expected exactly one JSON string argument"\n\tWScript.Echo "Usage: cscript parseJSON.vbs <JSONString>"\n\tWScript.Quit 1\nEnd If\n\n\' Get the JSON input from command line argument\njsonInput = objArgs(0)\n\n\' Decode from Base64\nDim xmlDoc, node\nSet xmlDoc = CreateObject("MSXML2.DOMDocument")\nSet node = xmlDoc.createElement("b64")\nnode.dataType = "bin.base64"\nnode.text = jsonInput\njsonInput = BytesToStr(node.nodeTypedValue)\n\n\' Function to convert byte array to string\nFunction BytesToStr(bytes)\n\tDim objStream\n\tSet objStream = CreateObject("ADODB.Stream")\n\tobjStream.Type = 1 \' adTypeBinary\n\tobjStream.Open\n\tobjStream.Write bytes\n\tobjStream.Position = 0\n\tobjStream.Type = 2 \' adTypeText\n\tobjStream.Charset = "utf-8"\n\tBytesToStr = objStream.ReadText\n\tobjStream.Close\n\tSet objStream = Nothing\nEnd Function\n\nOn Error Resume Next\n\n\' Create JSON parser object\nSet objJSON = CreateObject("Scripting.Dictionary")\n\n\' Simple JSON parser for basic key-value pairs\nCall ParseSimpleJSON(jsonInput, objJSON)\n\nIf Err.Number <> 0 Then\n\tWScript.Echo "Error parsing JSON: " & Err.Description\n\tWScript.Quit 1\nEnd If\n\nOn Error GoTo 0\n\n\' Print "Data:" header\nWScript.Echo "Data:"\n\n\' Output each instance-value pair\nFor Each key In objJSON.Keys\n\tWScript.Echo key & "=" & objJSON(key)\nNext\n\n\' Simple JSON parser subroutine\nSub ParseSimpleJSON(jsonStr, dictObj)\n\tDim cleanJson, pairs, i, pair, keyValue, keyPart, valuePart\n\t\n\t\' Remove outer single quotes if present (for CMD compatibility)\n\tcleanJson = Trim(jsonStr)\n\tIf Left(cleanJson, 1) = "\'" And Right(cleanJson, 1) = "\'" Then\n\t\tcleanJson = Mid(cleanJson, 2, Len(cleanJson) - 2)\n\tEnd If\n\t\n\t\' Remove outer braces and whitespace\n\tcleanJson = Trim(cleanJson)\n\tIf Left(cleanJson, 1) = "{" And Right(cleanJson, 1) = "}" Then\n\t\tcleanJson = Mid(cleanJson, 2, Len(cleanJson) - 2)\n\tEnd If\n\t\n\t\' Split by commas\n\tpairs = Split(cleanJson, ",")\n\t\n\tFor i = 0 To UBound(pairs)\n\t\tpair = Trim(pairs(i))\n\t\tIf InStr(pair, ":") > 0 Then\n\t\t\tkeyValue = Split(pair, ":", 2)\n\t\t\tIf UBound(keyValue) >= 1 Then\n\t\t\t\tkeyPart = Trim(keyValue(0))\n\t\t\t\tvaluePart = Trim(keyValue(1))\n\t\t\t\t\n\t\t\t\t\' Remove quotes\n\t\t\t\tkeyPart = Replace(keyPart, """", "")\n\t\t\t\tvaluePart = Replace(valuePart, """", "")\n\t\t\t\t\n\t\t\t\tdictObj.Add keyPart, valuePart\n\t\t\tEnd If\n\t\tEnd If\n\tNext\nEnd Sub\n', // No I18N
			'ps1': '# This is a sample PowerShell script that demonstrates parsing JSON input and printing it.\n# Users can also write their own script bodies and provide output in the expected format.\n#\n# Expected format for a single direct value:\n# Data:\n# -1=Value1\n#\n# Expected format for instance-value pairs:\n# Data:\n# Instance1=Value1\n# Instance2=Value2\n\nparam(\n\t[Parameter(Mandatory=$false)]\n\t[string]$JsonInput\n)\n\n# Simple JSON parser for basic key-value pairs\nfunction Parse-SimpleJSON {\n\tparam(\n\t\t[string]$JsonStr\n\t)\n\t\n\t$objJSON = @{}\n\t\n\t# Remove outer braces and whitespace\n\t$cleanJson = $JsonStr.Trim()\n\tif ($cleanJson.StartsWith(\'{\') -and $cleanJson.EndsWith(\'}\')) {\n\t\t$cleanJson = $cleanJson.Substring(1, $cleanJson.Length - 2)\n\t}\n\t\n\t# Split by commas\n\t$pairs = $cleanJson.Split(\',\')\n\t\n\tforeach ($pair in $pairs) {\n\t\t$pair = $pair.Trim()\n\t\tif ($pair.Contains(\':\')) {\n\t\t\t$keyValue = $pair.Split(\':\', 2)\n\t\t\tif ($keyValue.Length -ge 2) {\n\t\t\t\t$keyPart = $keyValue[0].Trim()\n\t\t\t\t$valuePart = $keyValue[1].Trim()\n\t\t\t\t\n\t\t\t\t# Remove quotes\n\t\t\t\t$keyPart = $keyPart.Replace(\'"\', \'\')\n\t\t\t\t$valuePart = $valuePart.Replace(\'"\', \'\')\n\t\t\t\t\n\t\t\t\t$objJSON[$keyPart] = $valuePart\n\t\t\t}\n\t\t}\n\t}\n\t\n\treturn $objJSON\n}\n\n# Check if exactly one command line argument is provided\nif ([string]::IsNullOrEmpty($JsonInput) -and $args.Count -eq 0) {\n\tWrite-Host "Error: No JSON input provided" -ForegroundColor Red\n\tWrite-Host "Usage: powershell -File parseJSON.ps1 <JSONString>" -ForegroundColor Red\n\texit 1\n} elseif ($args.Count -gt 1 -or (-not [string]::IsNullOrEmpty($JsonInput) -and $args.Count -gt 0)) {\n\tWrite-Host "Error: Too many arguments provided. Expected exactly one JSON string argument" -ForegroundColor Red\n\tWrite-Host "Usage: powershell -File parseJSON.ps1 <JSONString>" -ForegroundColor Red\n\texit 1\n}\n\n# Get the JSON input from command line argument\nif ([string]::IsNullOrEmpty($JsonInput)) {\n\t$JsonInput = $args[0]\n}\n\n# Decode from Base64\ntry {\n\t$decodedBytes = [System.Convert]::FromBase64String($JsonInput)\n\t$JsonInput = [System.Text.Encoding]::UTF8.GetString($decodedBytes)\n} catch {\n\tWrite-Host "Error decoding Base64 input: $($_.Exception.Message)" -ForegroundColor Red\n\texit 1\n}\n\ntry {\n\t# Simple JSON parser for basic key-value pairs\n\t$objJSON = Parse-SimpleJSON -JsonStr $JsonInput\n\t\n\t# Print "Data:" header\n\tWrite-Host "Data:"\n\t\n\t# Output each instance-value pair\n\tforeach ($key in $objJSON.Keys) {\n\t\tWrite-Host "$key=$($objJSON[$key])"\n\t}\n\t\n} catch {\n\tWrite-Host "Error parsing JSON: $($_.Exception.Message)" -ForegroundColor Red\n\texit 1\n}', // No I18N
			'py': '#!/usr/bin/env python3\n"""\nThis is a sample Python script that demonstrates parsing JSON input and printing it.\nUsers can also write their own script bodies and provide output in the expected format.\n\nExpected format for a single direct value:\nData:\n-1=Value1\n\nExpected format for instance-value pairs:\nData:\nInstance1=Value1\nInstance2=Value2\n"""\n\nimport sys\nimport json\nimport base64\n\ndef parse_simple_json(json_str):\n\t"""Simple JSON parser for basic key-value pairs"""\n\tdata = {}\n\t\n\t# Remove outer braces and whitespace\n\tclean_json = json_str.strip()\n\tif clean_json.startswith(\'{\') and clean_json.endswith(\'}\'):\n\t\tclean_json = clean_json[1:-1]\n\t\n\t# Split by commas\n\tpairs = clean_json.split(\',\')\n\t\n\tfor pair in pairs:\n\t\tpair = pair.strip()\n\t\tif \':\' in pair:\n\t\t\tkey_value = pair.split(\':\', 1)\n\t\t\tif len(key_value) >= 2:\n\t\t\t\tkey_part = key_value[0].strip()\n\t\t\t\tvalue_part = key_value[1].strip()\n\t\t\t\t\n\t\t\t\t# Remove quotes\n\t\t\t\tkey_part = key_part.replace(\'"\', \'\')\n\t\t\t\tvalue_part = value_part.replace(\'"\', \'\')\n\t\t\t\t\n\t\t\t\tdata[key_part] = value_part\n\t\n\treturn data\n\ndef main():\n\t# Check if exactly one command line argument is provided\n\tif len(sys.argv) == 1:\n\t\tprint("Error: No JSON input provided", file=sys.stderr)\n\t\tprint("Usage: python parseJSON.py <JSONString>", file=sys.stderr)\n\t\tsys.exit(1)\n\telif len(sys.argv) > 2:\n\t\tprint("Error: Too many arguments provided. Expected exactly one JSON string argument", file=sys.stderr)\n\t\tprint("Usage: python parseJSON.py <JSONString>", file=sys.stderr)\n\t\tsys.exit(1)\n\t\n\t# Get the JSON input from command line argument\n\tjson_input = sys.argv[1]\n\t\n\t# Decode from Base64\n\ttry:\n\t\tdecoded_bytes = base64.b64decode(json_input)\n\t\tjson_input = decoded_bytes.decode(\'utf-8\')\n\texcept Exception as e:\n\t\tprint(f"Error decoding Base64 input: {e}", file=sys.stderr)\n\t\tsys.exit(1)\n\t\n\ttry:\n\t\t# Simple JSON parser for basic key-value pairs\n\t\tobj_json = parse_simple_json(json_input)\n\t\t\n\t\t# Print "Data:" header\n\t\tprint("Data:")\n\t\t\n\t\t# Output each instance-value pair\n\t\tfor key in obj_json:\n\t\t\tprint(f"{key}={obj_json[key]}")\n\t\t\t\n\texcept Exception as e:\n\t\tprint(f"Error parsing JSON: {e}", file=sys.stderr)\n\t\tsys.exit(1)\n\nif __name__ == "__main__":\n\tmain()',  // No I18N
			'pl': '#!/usr/bin/env perl\n# This is a sample Perl script that demonstrates parsing JSON input and printing it.\n# Users can also write their own script bodies and provide output in the expected format.\n#\n# Expected format for a single direct value:\n# Data:\n# -1=Value1\n#\n# Expected format for instance-value pairs:\n# Data:\n# Instance1=Value1\n# Instance2=Value2\n\nuse strict;\nuse warnings;\nuse MIME::Base64;\nuse Encode qw(decode);\n\n# Simple JSON parser for basic key-value pairs\nsub parse_simple_json {\n\tmy ($json_str) = @_;\n\tmy %obj_json = ();\n\t\n\t# Remove outer braces and whitespace\n\tmy $clean_json = $json_str;\n\t$clean_json =~ s/^\\s+|\\s+$//g;  # trim whitespace\n\tif ($clean_json =~ /^\\{.*\\}$/) {\n\t\t$clean_json = substr($clean_json, 1, -1);\n\t}\n\t\n\t# Split by commas\n\tmy @pairs = split(\',\', $clean_json);\n\t\n\tforeach my $pair (@pairs) {\n\t\t$pair =~ s/^\\s+|\\s+$//g;  # trim whitespace\n\t\tif (index($pair, \':\') != -1) {\n\t\t\tmy @key_value = split(\':\', $pair, 2);\n\t\t\tif (@key_value >= 2) {\n\t\t\t\tmy $key_part = $key_value[0];\n\t\t\t\tmy $value_part = $key_value[1];\n\t\t\t\t\n\t\t\t\t# Remove whitespace\n\t\t\t\t$key_part =~ s/^\\s+|\\s+$//g;\n\t\t\t\t$value_part =~ s/^\\s+|\\s+$//g;\n\t\t\t\t\n\t\t\t\t# Remove quotes\n\t\t\t\t$key_part =~ s/"//g;\n\t\t\t\t$value_part =~ s/"//g;\n\t\t\t\t\n\t\t\t\t$obj_json{$key_part} = $value_part;\n\t\t\t}\n\t\t}\n\t}\n\t\n\treturn %obj_json;\n}\n\n# Check if exactly one command line argument is provided\nif (@ARGV == 0) {\n\tprint STDERR "Error: No JSON input provided\\n";\n\tprint STDERR "Usage: perl parseJSON.pl <JSONString>\\n";\n\texit 1;\n} elsif (@ARGV > 1) {\n\tprint STDERR "Error: Too many arguments provided. Expected exactly one JSON string argument\\n";\n\tprint STDERR "Usage: perl parseJSON.pl <JSONString>\\n";\n\texit 1;\n}\n\n# Get the JSON input from command line argument\nmy $json_input = $ARGV[0];\n\n# Decode from Base64 and UTF-8\neval {\n\t$json_input = decode_base64($json_input);\n\t$json_input = decode(\'UTF-8\', $json_input);\n};\n\nif ($@) {\n\tprint STDERR "Error decoding Base64/UTF-8 input: $@\\n";\n\texit 1;\n}\n\neval {\n\t# Simple JSON parser for basic key-value pairs\n\tmy %obj_json = parse_simple_json($json_input);\n\t\n\t# Print "Data:" header\n\tprint "Data:\\n";\n\t\n\t# Output each instance-value pair\n\tfor my $key (sort keys %obj_json) {\n\t\tprint "$key=$obj_json{$key}\\n";\n\t}\n};\n\nif ($@) {\n\tprint STDERR "Error parsing JSON: $@\\n";\n\texit 1;\n}', // No I18N
			'sh': '#!/bin/bash\n# This is a sample Bash script that demonstrates parsing JSON input and printing it.\n# Users can also write their own script bodies and provide output in the expected format.\n#\n# Expected format for a single direct value:\n# Data:\n# -1=Value1\n#\n# Expected format for instance-value pairs:\n# Data:\n# Instance1=Value1\n# Instance2=Value2\n\n# Simple JSON parser for basic key-value pairs\nparse_simple_json() {\n\tlocal json_str="$1"\n\tlocal clean_json\n\t\n\t# Remove outer braces and whitespace\n\tclean_json=$(echo "$json_str" | sed \'s/^[[:space:]]*{//; s/}[[:space:]]*$//\')\n\t\n\t# Print "Data:" header\n\techo "Data:"\n\t\n\t# Split by commas and process each pair\n\tIFS=\',\' read -ra pairs <<< "$clean_json"\n\tfor pair in "${pairs[@]}"; do\n\t\t# Trim whitespace\n\t\tpair=$(echo "$pair" | sed \'s/^[[:space:]]*//; s/[[:space:]]*$//\')\n\t\t\n\t\tif [[ "$pair" == *":"* ]]; then\n\t\t\t# Split by colon\n\t\t\tkey_part=$(echo "$pair" | cut -d\':\' -f1 | sed \'s/^[[:space:]]*//; s/[[:space:]]*$//\' | sed \'s/"//g\')\n\t\t\tvalue_part=$(echo "$pair" | cut -d\':\' -f2- | sed \'s/^[[:space:]]*//; s/[[:space:]]*$//\' | sed \'s/"//g\')\n\t\t\t\n\t\t\techo "$key_part=$value_part"\n\t\tfi\n\tdone\n}\n\n# Check if exactly one command line argument is provided\nif [ $# -eq 0 ]; then\n\techo "Error: No JSON input provided" >&2\n\techo "Usage: bash parseJSON.sh <JSONString>" >&2\n\texit 1\nelif [ $# -gt 1 ]; then\n\techo "Error: Too many arguments provided. Expected exactly one JSON string argument" >&2\n\techo "Usage: bash parseJSON.sh <JSONString>" >&2\n\texit 1\nfi\n\n# Get the JSON input from command line argument\nJSON_INPUT="$1"\n\n# Decode from Base64 and ensure UTF-8 encoding\nJSON_INPUT=$(echo "$JSON_INPUT" | base64 -d 2>/dev/null | iconv -f UTF-8 -t UTF-8 2>/dev/null)\nif [ $? -ne 0 ]; then\n\techo "Error: Failed to decode Base64/UTF-8 input" >&2\n\texit 1\nfi\n\n# Simple JSON parser for basic key-value pairs\nparse_simple_json "$JSON_INPUT"' // No I18N
		})
	},
	actions: {
		testCustomFunc: function() {
			var self = this;
			$("#funcTestOutputContainer").addClass('displayNone'); // No I18N

			var validateField = {
				empty:['customFuncName','customFuncCmd','customFuncScript', 'customFuncTimeout'], // No I18N
				alphaNumeric:['customFuncName'], // No I18N
				minRangeCheck:{'customFuncTimeout':1}, // No I18N
				rangeCheck:{'customFuncTimeout':5}, // No I18N
				maxCharacters:{'customFuncName':30} //No I18N
			};

			if(self.customFunc.description) {
				validateField.alphaNumericWithBasicSpecialChars = ['customFuncDesc']; // No I18N
			}

			if(self.customFunc.command) {
				self.customFunc.command = self.customFunc.command.trim();
				validateField.custom = [
					{identifier:'customFuncCmd',condition:(!(/^(?:.*?\s)?\$\{FileName\}\.([A-Za-z0-9]+)\s+\$\{JSONInput\}$/g).test(self.customFunc.command)),message:Ember.I18n.t('webclient.opm.addCustomFunction.commandLine.validationMessage',this)}, //No I18n
					{identifier:'customFuncCmd',condition:(self.customFunc.command.includes('${JSONInput}') ? false : true),message:Ember.I18n.t('webclient.opm.addCustomFunction.commandline.nothavingjsoninput',this)}, // No I18N
					{identifier:'customFuncCmd',condition:(self.customFunc.command.includes('${FileName}') ? false : true),message:Ember.I18n.t('webclient.script.commandline.nothavingfilename',this)} // No I18N
				]; 
			}

			if(!opm_validateFields(validateField)) {
				return false;
			}
			
			var data = self.controller.slideDetails.data;
			var funcExpData = {
				moId:data.moid,
				expOID:data.expOID, 
				functionExpParams: JSON.stringify({
					commandLine:self.customFunc.command, 
					scriptBody:self.customFunc.script, 
					timeout:self.customFunc.timeout
				}),
				protocol:data.protocol,
				functionExp:self.customFunc.name.trim()
			}
			
			var testInprogressMsg = '';
			if(window.OPM.isTFAEnabled){
				testInprogressMsg = Ember.I18n.t('jsp.commonstr.TestingInProgress');//No I18N
			}

			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + "/device/testFunctionalExpression", funcExpData, testInprogressMsg, { // No I18N
				callback:function(response){//No I18N
					$("#funcExpRawOutputDiv").addClass('displayNone'); // No I18N
					if(response.error && response.error.message) {
						return opm_infoMsgs("errorMsg", response.error.message); //No I18n
					}

					if(response.errorMsg) {
						if(response.rawoutput) {
							$("#funcExpRawOutput pre").text(response.rawoutput) // No I18N
							$("#funcExpRawOutputDiv").removeClass('displayNone'); // No I18N
						}
						return opm_infoMsgs("errorMsg", response.errorMsg); //No I18n
					}

					self.set("validationSuccess", response.funcExprTestId ? true : false); // No I18N
					self.set("funcExprTestId", response.funcExprTestId); // No I18N
					$("#funcTestOutputContainer").removeClass('displayNone'); // No I18N
					var colName = [Ember.I18n.t('webclient.devices.details.instance', this), Ember.I18n.t('webclient.widget.value', this)];//No I18N
					var colModel = [
						{ name: 'instance', index: 'instance' }, //No I18N
						{ name: 'value', index: 'value' } //No I18N
					];

					$("#funcTestOutput").jqGrid('GridUnload');//No I18N

					opm_loadJQgridWithData("#funcTestOutput", response.result, colName, colModel, "", "#funcTestOutputPager", "", {minRowsPerPage:10,rowNum:10,sortable:false,hideCSV:true,hideExcel:true,searchOption:false,Search:false}); //No I18N
				},
				otpPageType:'dialog' // No I18N
			}) 
		},
		saveCustomFunc: function() {
			var self = this;

			var validateField = {
				empty:['customFuncName'], // No I18N
				alphaNumeric:['customFuncName'] // No I18N
			};

			if(self.customFunc.description) {
				validateField.alphaNumericWithBasicSpecialChars = ['customFuncDesc']; // No I18N
			}

			if(!opm_validateFields(validateField)) {
				return false;
			}
			

			if(!this.get('validationSuccess')) { // No I18N
				return opm_infoMsgs("errorMsg", Ember.I18n.t("webclient.settings.testBeforeSave")); //No I18N
			}

			var data = {
				name:this.customFunc.name.trim(),
				description:this.customFunc.description,
				testId:this.funcExprTestId
			}
			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + "/device/addFunctionalExpression", data, '', // No I18N
				function (response) {
					if(response.error && response.error.message) {
						return opm_infoMsgs("errorMsg", response.error.message); //No I18n
					}

					self.get('slideDetails').callBackFunc(response.expressionName); // No I18N
					opm_infoMsgs("successMsg", response.message); // No I18N
				}
			);
		}, 
		cancelCustomFunc: function() {
			this.get('slideDetails').callBackFunc(); //No I18N
		},
		handleBlur: function() {
			var self = this;
			var matchResult = this.customFunc.command.match(/\$\{FileName\}\.(\w+)/);
			var ext = matchResult ? matchResult[1].toLowerCase() : '';
			if(ext && this.defaultScript[ext]) {
				if(this.customFunc.script) {
					Object.values(this.defaultScript).forEach(function(script) { 
						if(script === self.customFunc.script) {
							self.set("customFunc.script", self.defaultScript[ext]); // No I18N
						}
					})
				} else {
					self.set("customFunc.script", self.defaultScript[ext]); // No I18N
				}
			}
		}
	},
	customFuncObserver:function(){
		this.set("validationSuccess", false); //No I18N
	}.observes('customFunc.command','customFunc.script', 'customFunc.timeout') //No I18N
})

OPMClient.OpmCustomMonitorCustomFieldComponent = Ember.Component.extend({
	templateName: "components/opm-Custom-Monitor-Custom-Field",//No I18N
	didInsertElement: function() {
		$('#fieldType').select2();
	},
	actions: {
		addField: function() {
			this.get('slideDetails').parentObj.send('addCustomField'); //No I18N
		},
		cancel: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	}
});

OPMClient.AddCustomWmiMonitorComponent = Ember.Component.extend({
	templateName: "components/add-custom-wmi-monitor",//No I18N
	didInsertElement: function(){
		var self = this;
		var baseRoute = OPMClient.ApplicationController.currentRouteName.split('.index')[0];
		var baseRouteArray = baseRoute.split('.');

		self.setProperties({deviceDetails:[],wmiCredentials:[],isWmiCredPage:true,starredpwd:'*****',//No I18n
							changeContent:true,baseRoute:baseRoute,parentRoute:baseRouteArray.splice(0,baseRouteArray.length-1).join('.')});//No I18n

		var deviceResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/device/listDevices',{vendor:'Microsoft',category:self.category, excludeOpenFWDevice: true});//No I18n
		if(deviceResponse !== undefined && deviceResponse.length > 0){
			self.set('deviceDetails',deviceResponse);//No I18n
		}

		var credResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/listCredentials');//No I18n
		if(credResponse !== undefined && credResponse.windowscredential !== undefined && credResponse.windowscredential.length > 0){
			self.set('wmiCredentials',credResponse.windowscredential.map(function(wmicred) { //No I18n
				wmicred.credentialLabel = wmicred.credentialLabel || wmicred.credentialName;
				return wmicred;
			}));
		}
		var isProbeMSP = ((window.OPM.isProbeSelected)||(window.OPM.isMSPProbe));
		this.set('isProbeMSP',isProbeMSP); //NO I18N
		self.setProperties({perfGrpData:{PERFGROUPNAME:Ember.I18n.t('webclient.admin.devices.None'),PERFGROUPID:'0'},lookupArray:[],isLookupEnabled:false,isNumericMonitor:true,isNumericMonitorType:true,pageId:'settingsWMI'});// No I18n
	},
	actions:{
		configureWmi:function(){
			var devName = this.get('selectedDevice');
			var toValidate = {custom:[{identifier:'wmiDeviceSelection',condition:(devName === null || devName === undefined || devName === ''),message:Ember.I18n.t('webclient.dt.select.device',this)}]};// No I18n

			if(opm_validateFields(toValidate)){
				window.OPM.currentView.handler.controller.set('currModel.addWmiHandler',this);//No I18n
				opm_transitionToTheRoute(this.get('baseRoute')+('.ConfigureWMI'));//No I18n
			}
		},
		toggleWmiPages:function(){
			var self = this;
			$('#'+self.msgID).remove();
			var isWmiCredPage = self.get('isWmiCredPage');
			if(isWmiCredPage){
				var devName = self.get('selectedDevice');
				var customValidation = [{identifier:'wmiDeviceSelection',condition:(devName === null || devName === undefined || devName === ''),message:Ember.I18n.t('webclient.dt.select.device',this)}];//No I18n
				var toValidate = {empty:['wmiInterval'],rangeCheck:{wmiInterval:1440},positive:['wmiInterval'],custom:customValidation};// No I18n
				if(this.get('showCustomField') && $("#wmiInterval").val()<3)
				{
					$("#wmiInterval").addClass('validateField error');//No I18N
					$("#wmiInterval").attr('data-error',Ember.I18n.t('opm.custmon.interval.minlimit',this));//No I18N
					$("#wmiInterval").focus();
					opmValidate($("#wmiInterval"));//No I18N
					return false;
				}
				else if(this.get('showCustomField') && $("#wmiInterval").val()>24)
				{
					$("#wmiInterval").addClass('validateField error');//No I18N
					$("#wmiInterval").attr('data-error',Ember.I18n.t('opm.custmon.interval.maxlimit',this));//No I18N
					$("#wmiInterval").focus();
					opmValidate($("#wmiInterval"));//No I18N
					return false;
				}

				if(opm_validateFields(toValidate)){
					var wmiClassResp = self.get('wmiClassResp');
					var data = {name:self.get('selectedDevice')}
					var selCred = self.get('selectedCredential');
					var selUser = self.get('userName');
					var userPwd = self.get('password');
					var isLocalhost = self.get('isLocalhost');

					if(self.get('isWinRMEnabled')) { // No I18N
						data.isWinRMEnabled = self.get('isWinRMEnabled'); // No I18N
						data.winrmProtocol = self.get('winrmProtocol'); // No I18N
						data.winrmPort = self.get('winrmPort'); // No I18N
						data.winrmTimeout = self.get('winrmTimeout'); // No I18N
					}

					if(selCred !== null && selCred !== undefined && selCred !== '' && !isLocalhost){
						data.credential = selCred;
					}else if(userPwd !== null && userPwd !== undefined && userPwd !== ''){
						data.username = selUser;
						data.password = userPwd;
					}else if(selUser !== null && selUser !== undefined && selUser !== ''){
						data.username = selUser;
					}else if(isLocalhost){
						data.localhost = true;
					}else{
						self.msgID = opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.nfa.noCredSelected',this));//No I18N
						return;
					}
					self.set('selectedCFValue',$('#WMI_customFieldValue').attr('data-customFieldId')); //No I18n
					if(wmiClassResp.length < 1){
						var wmiClassCallback = function(response){
							$('.disableButton').removeClass('disabledBlock');
							self.send('clearGrid',Ember.I18n.t('webclient.admin.wmimonitor.noattributes'),Ember.I18n.t('webclient.admin.wmimonitor.noinstances'));//No I18N
							if(response !== undefined){
								showMessage(response);
								if(response.error === undefined){
									self.setProperties({wmiClassResp:response,isWmiCredPage:!isWmiCredPage});
								}
							}
						}
						$('.disableButton').addClass('disabledBlock');
						opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/admin/getDTWMIClass',data,Ember.I18n.t('webclient.dt.fetching.classes',this),wmiClassCallback); //No I18N
					}else{
						self.set('isWmiCredPage',!isWmiCredPage);//No I18n
						self.send('clearGrid',Ember.I18n.t('webclient.admin.wmimonitor.noattributes'),Ember.I18n.t('webclient.admin.wmimonitor.noinstances'));//No I18N
					}
				}
				var perfGroupData = {};
				addPerfGroupToParamsObject(perfGroupData,'perfMonitorsAddWMI','0');//No I18N
				if(perfGroupData.perfGroupId !== undefined){
					self.set('perfGrpData',{PERFGROUPNAME:$('#perfGroupValue_perfMonitorsAddWMI').text(),PERFGROUPID:perfGroupData.perfGroupId});// No I18n
				}else{
					self.set('perfGrpData',{PERFGROUPNAME:Ember.I18n.t('webclient.admin.devices.None'),PERFGROUPID:'0'});// No I18n	
				}
				self.setProperties({perfGroupId:perfGroupData.perfGroupId});
			}else{
				self.setProperties({selectedWMIClass:undefined,isWmiCredPage:!isWmiCredPage});
			}
		},
		saveWMIMonitor:function(){
			var self = this;
			if(self.get('isLookupEnabled') && !validateLookupArray(self,true)){
				return false;
			}

			var selRowIds = $('#wmiMonitorsList').jqGrid('getGridParam','selarrrow'); //No I18N
			var entityArray = [];
			var instanceArray = selectMultiple('wmiInstanceList','instance');//No I18N
			var isCFEnabled = $('#wmi_customFieldEnable').is(':checked'); //No I18n
			var selectedCF = $("#WMI_customField_drpdwn").val();
			if(selRowIds !== undefined){
				$.each(selRowIds, function(){
					var entity = $('#wmiMonitorsList').jqGrid('getCell',this,'className'); //No I18N
					entityArray.push(entity);
				});
			}

			if(entityArray.length < 1){
				self.msgID = opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.admin.wmimonitor.selectattribute',this));//No I18N
			}else if($('#wmiInstanceList').jqGrid('getRowData').length > 0 && instanceArray === ''){//No I18N
				self.msgID = opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.admin.wmimonitor.selectinstance',this));//No I18N
			}else{
				$('#'+self.msgID).remove();
				var data = {name:self.get('selectedDevice'),wmiClass:self.get('selectedWMIClass'),wmiClassDisplayName:$('#wmiClassSelection').find('option:selected').text(),//No I18N
							attribute:JSON.stringify(entityArray),instance:instanceArray,fromDevice:false,fromSettings:(self.get('pageName') !== 'deviceTemplate'),interval:self.get('wmiInterval'),perfGroupId:self.get('perfGroupId')};//No I18N
				if(this.get('showCustomField'))
				{
					data.customFieldId = this.get('selectedCFValue'); //No I18n
					data.interval = self.get('wmiInterval')*60;
				}

				addLookupData(data,self,true);
				var saveCallback = function(response){
					if(response !== undefined){
						showMessage(response);
						if(response.error === undefined){
							if(self.get('pageName') === 'deviceTemplate'){
								frameWmiMonitorToAdd(response);
							}
							self.send('cancelOperation',true);//No I18N
						}
					}
				}
				opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+'/admin/addWMIMonitor',data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),saveCallback); //No I18N
			}
		},
		clearGrid:function(attributeNodataText,instanceNodataText){//To avoiding the current container scroll getting blocked
			setTimeout(function(){
				$('#wmiMonitorsList,#wmiInstanceList').jqGrid('GridUnload');//No I18n
				$('.wmiMonitorsListDiv,.wmiInstanceListDiv').css({'pointer-events':'auto'});//No I18N
				opm_loadJQgridWithData('#wmiMonitorsList',[],[Ember.I18n.t('webclient.dt.performance.counters')],[{name:'0',index:'0'}],'','','',{noDataText:attributeNodataText}); //No I18N
				opm_loadJQgridWithData('#wmiInstanceList',[],[Ember.I18n.t('webclient.admin.wmimonitor.instances')],[{name:'0',index:'0'}],'','','',{noDataText:instanceNodataText ? instanceNodataText : attributeNodataText}); //No I18N
			},50);	
		},
		cancelOperation:function(doAction){
			var self = window.OPM.currentView.handler.controller;
			delete self.model.currModel;
			if(doAction){
				if(this.get('pageName') === 'monitorProfile'){
					getVendorMonitors(self,false);
				}else if(this.get('pageName') === 'vendorMonitor'){//No I18N
					$('#perfMonitors_type').select2().val('customMonitors').trigger('change');//No I18N
				}
			}

			slideOut(7);
			opm_transitionToParentRoute(this.get('parentRoute'));//No I18N
		},
		customFieldEnable: function()
		{
			if($('#wmi_customFieldEnable').is(':checked'))
			{
				this.set('showCustomField', true); //No I18n
				var resp = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listAdditionalFields?type=CustFieldToGraph"); //No I18N
				this.set('WMI_CustomFieldList',resp); //No I18n
			}
			else
			{	
				this.set('showCustomField', false); //No I18n
			}
		},
		enableCustomFieldDrpDown:function() {
			if($("#WMI_customField_drpdwn").hasClass('active') && !$('#WMI_CF_Search').is(':focus')) {
				$("#WMI_customField_drpdwn").removeClass('active');
			} else {
				$("#WMI_customField_drpdwn").addClass('active');
				$('#customField_DropDownBox').show();
				if($("#WMI_customField_drpdwn").attr('data-error') !== undefined)
				{
					$("#WMI_customField_drpdwn").removeAttr('data-error');
					$('.OpMToolBar').hide();
				}
			}
		},
		selectCustomField: function(field)
		{
			$('#WMI_customFieldValue').text(field.customFieldNameDisp);
			$('#WMI_customFieldValue').attr('data-customFieldId',field.customFieldId);//NO I18N
			//$('#customField_UL'+' #'+field.customFieldId).attr('selected',true);//NO I18N
		},
		addNewCustomField: function()
		{
			var self = this;
			var slideDetails = {};
		    slideDetails.id = "WMI_CustomMonitor_CustomField";
		    slideDetails.componentName = "OPMClient.OpmCustomMonitorCustomFieldComponent"; //No I18n
		    slideDetails.slideHeader = Ember.I18n.t('webclient.add.fielld');//No I18N
		    slideDetails.isSmall = true;
		    slideDetails.actionName = "customField_cancelAction";//No I18N
		    slideDetails.parentObj = self;
		    OPMClient.SettingsConfigurationController.set("slideDetails",undefined);//No I18N
		   	OPMClient.SettingsConfigurationController.set("slideDetails",slideDetails);//No I18N
		   	slideInWithId('CustomMonitor_CustomField'); //No I18n
		},
		addCustomField: function() 
		{
			var customFieldAdded = opm_additionalFields("Device","fromCustomMonitor"); //No I18N
			if(customFieldAdded) 
			{
				var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listAdditionalFields?type=CustFieldToGraph"); //No I18N
				OPMClient.SettingsConfigurationController.set("WMI_CustomFieldList",[]); //No I18n
				OPMClient.SettingsConfigurationController.set("WMI_CustomFieldList",list); //No I18n
				slideOutWithId('WMI_CustomMonitor_CustomField'); //No I18n
				OPMClient.SettingsConfigurationController.set("slideDetails",undefined);//No I18N
				this.send('selectCustomField',list[list.length-1]); //No I18n

			}
		},
		customField_cancelAction: function() {
			slideOutWithId('WMI_CustomMonitor_CustomField'); //No I18n
			OPMClient.SettingsConfigurationController.set("slideDetails",undefined);//No I18N
		}
	},selectedDeviceObserver:function(){
		var self = this;
		self.set('changeContent',undefined);//No I18N
		self.setProperties({isWinRMEnabled:false,winrmProtocol:'',winrmPort:'',winrmTimeout:''}); // No I18N
		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
			self.setProperties({wmiClassResp:[],userName:undefined,disableClass:'',password:'',starredpwd:'*****'});//No I18N
			var devName = self.get('selectedDevice');
			var selCred = self.get('selectedCredential');
			var wmiCred = self.get('wmiCredentials');

			if(devName !== undefined && devName !== null && devName !== ''){
				var respCallback = function(response){
					if(response !== undefined){
						showMessage(response);
						self.set('changeContent',true);//No I18N
						if(response.error === undefined){
							self.setProperties({userNameCpy:response.username,userName:response.username,isLocalhost:false,selectedCredential:response.selectedCredential});
							if(selCred !== null && selCred !== undefined && selCred !== ''){
								self.set('userName',undefined);//No I18N
							}
							if(response.localhost){
								wmiCred.push({credentialName:Ember.I18n.t('highperf.localhost',this),credId:'local'});//No I18N
								self.setProperties({isLocalhost:true,selectedCredential:Ember.I18n.t('highperf.localhost',this),disableClass:'disabledBlock'});//No I18N
							}else{
								var arrIndex = wmiCred.map(function(obj){return obj.credId;}).indexOf('local');//No I18N
								if(arrIndex > -1){
									wmiCred.splice(arrIndex,1);
								}
							}
						}else{
							if(response.error.code === 5192){
								window.OPM.currentView.handler.controller.set('currModel.addWmiHandler',self);//No I18n
								opm_transitionToTheRoute(self.get('baseRoute')+('.ConfigureWMI'));//No I18n
							}
							self.set('selectedCredential',undefined);//No I18n
						}
					}
				}
				opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern+'/admin/getWMICredential',{name:devName},Ember.I18n.t('webclient.dt.fetching.classes',this),respCallback); //No I18N
			}else{
				self.setProperties({userNameCpy:undefined,userName:undefined,isLocalhost:false,changeContent:true,selectedCredential:undefined});
				var arrIndex = wmiCred.map(function(obj){return obj.credId;}).indexOf('local');//No I18N
				if(arrIndex > -1){
					wmiCred.splice(arrIndex,1);
				}
			}
		});
	}.observes('selectedDevice'),//No I18N
	selectedCredentialObserver:function(){
		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
			var selCred = this.get('selectedCredential');
			this.set('wmiClassResp',[]);//No I18N
			if(selCred !== null && selCred !== undefined && selCred !== ''){
				this.set('userName',undefined);//No I18N
			}else{
				this.set('userName',this.get('userNameCpy'));//No I18N
			}
		});
	}.observes('selectedCredential'),//No I18N
	selectedWMIClassObserver:function(){
		var self = this;
		var className = self.get('selectedWMIClass');

		if(className !== undefined && className !== null){
			var data = {name:self.get('selectedDevice'),wmiClass:className};
			var selCred = self.get('selectedCredential');
			var selUser = self.get('userName');
			var userPwd = self.get('password');
			var isLocalhost = self.get('isLocalhost');

			if(selCred !== null && selCred !== undefined && selCred !== '' && !isLocalhost){
				data.credential = selCred;
			}else if(userPwd !== null && userPwd !== undefined && userPwd !== ''){
				data.username = selUser;
				data.password = userPwd;
			}else if(selUser !== null && selUser !== undefined && selUser !== ''){
				data.username = selUser;
			}else if(isLocalhost){
				data.localhost = true;
			}

			self.send('clearGrid',Ember.I18n.t('webclient.data.fetching'));//No I18N
			var respCallback = function(response){
				var classArr = new Array();
		        var insArr = new Array();
		        if(response !== undefined){
		        	showMessage(response);
		        	if(response.attributes !== undefined){
						$.each(response.attributes.displayName,function(k,v){
			                classArr.push({className:response.attributes.name[k],classDispName:v,collectedValues:response.attributes.collectedValues[k],
			                				description:response.attributes.description[k]});
			            });
					}
					if(response.instances !== undefined){
			            $.each(response.instances,function(k,v){
			                insArr.push({instance:v});
			            });
			        }
		        }

	            $('#wmiMonitorsList,#wmiInstanceList').jqGrid('GridUnload');//No I18n
	           	$('.disableButton').removeClass('disabledBlock');

	            var colNames = [Ember.I18n.t('webclient.dt.performance.counters'),'','',''];//No I18N
				var colModel = [{name:'classDispName',index:'classDispName', formatter:opm_dtWMImonitorFormatter},//No I18N
								{name:'className',index:'className',hidden:true},//No I18N
								{name:'collectedValues',index:'collectedValues',hidden:true},//No I18N
								{name:'description',index:'description',hidden:true}];//No I18N
				var defaultOptions = {multiselect:true,noDataText:Ember.I18n.t('webclient.admin.wmimonitor.noattributes'),minRowsPerPage:1000,Search:false,searchOption:true,hideCSV:true,hideExcel:true};//No I18N
				opm_loadJQgridWithData('#wmiMonitorsList',classArr,colNames,colModel,'','','',defaultOptions); //No I18N

				colNames = [Ember.I18n.t('webclient.admin.wmimonitor.instances')];//No I18N
				colModel = [{name:'instance',index: 'instance'}];//No I18N
				defaultOptions = {align:'top','padding-top':-8,multiselect:true,noDataText:Ember.I18n.t('webclient.admin.wmimonitor.noinstances'),minRowsPerPage:1000,Search:false,searchOption:true,hideCSV:true,hideExcel:true};//No I18N
				opm_loadJQgridWithData('#wmiInstanceList',insArr,colNames,colModel,'','','',defaultOptions); //No I18N
			}
			Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
				$('.disableButton').addClass('disabledBlock');
			});
			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+'/admin/getDTWMIMonitor',data,Ember.I18n.t('webclient.dt.fetching.monitors',this),respCallback); //No I18N
		}else{
			self.send('clearGrid',Ember.I18n.t('webclient.admin.wmimonitor.noattributes'),Ember.I18n.t('webclient.admin.wmimonitor.noinstances'));//No I18N
		}
	}.observes('selectedWMIClass'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.AddCustomCliMonitorComponent = Ember.Component.extend({
	templateName: "components/add-custom-cli-monitor",//No I18N
	allowedCountForInstanceMonitors:50,
	cliDirectValueCommand:"vmstat 1 3 | awk '{for (i=0;i<=NF;i++) if ($i == \"id\") cmd=i;} {print 100-$cmd}'|tail -1",//No I18N
	cliDirectValueResult:25,
	cliInstanceValuePairCommand:"/bin/df -Pm | awk 'NR>1 {gsub(/%/,\"\",$5); print $6, $5}'",//No I18N
	cliInstanceValuePairResult:"<br/> /boot/efi 1.0 <br/> /snap/snap-store/1113 100.0 <br/> /snap/core18/2846 100.0",//No I18N
	didInsertElement: function(){
		var self = this;
		var baseRoute = OPMClient.ApplicationController.currentRouteName.split('.index')[0];
		var baseRouteArray = baseRoute.split('.');
		var deviceList = [];
		var selectedDevice = null;
		var isDeviceLevelAdd = ('snapshot' === self.get('pageName'));//No I18N
		var selectedVendor = 'net-snmp';//No I18N

		if(!isDeviceLevelAdd){
			opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + '/device/listDevices',{protocol:'CLI',excludeAgent:true,excludeOpenFWDevice: true},'',function(response){//No I18n
				if(response !== undefined && response.length){
					selectedDevice = response[0].deviceName;
					deviceList = response;
				}
				self.setProperties({deviceList:deviceList,selectedDevice:selectedDevice});
			});
		}else{
			selectedDevice = deviceBasicDetails.deviceName;
			selectedVendor = deviceBasicDetails.vendorName;
		}
		self.setProperties({baseRoute:baseRoute,parentRoute:baseRouteArray.splice(0,baseRouteArray.length-1).join('.'),selectedDevice:selectedDevice,functionalExp:getFunctionalExpressions(),displayUnit:getDisplayUnit(),selectedFunctionalExp:'',stepNumber:1,isIntegerMonitor:true,intervalUnit:Ember.I18n.t('webclient.general.mins'),cliMonitorInterval:15,showAddCustomField:(window.OPM.userPermissions.monitoringWrite && !(window.OPM.isProbeSelected || window.OPM.isMSPProbe || isDeviceLevelAdd)),numericType:1,isNumericMonitorType:true,isDeviceLevelAdd:isDeviceLevelAdd,selectedVendor:selectedVendor});
		self.resetLookup(self);
		self.handleVisibility(self);

		loadMonInstCntSettings();
		Ember.run.scheduleOnce('afterRender', function(){//No I18N
			var vendorList = OPMClient.SettingsAddEditController.get('vendorList');
			if(vendorList !== undefined && vendorList.length){
				self.setProperties({vendorList:cloneObject(vendorList)});
				self.loadVendorList(self);
			}
			$('.cliHelpCard').css({left:$('.cliForm').width()+120});
			$('.cliFormHolder').css({'padding-top':'20px'});
		});
	},
	loadVendorList:function(self){
		$('#cliVendorList').select2({data:self.get('vendorList')});
		$('#cliVendorList').val(self.get('selectedVendor')).select2();
	},
	handleVisibility:function(self){
		self.setProperties({
			showDeviceSelection:!self.get('isDeviceLevelAdd'),
			showFunctionalExp:false
		});
	},
	keyUp: function(e){
		if($('#cli_CF_Search').is(':focus')){
			var searchString = $('#cli_CF_Search').val();
			listSearch(searchString,'cliMonitorCustomField_UL');//No I18N
		}
	},
	keyPress: function(e){
		if($('.numberCheck').is(':focus')){//No I18N
			return opm_isNumber(e);
		}
	},
	validateForm:function(isSave){
		var self = this;
		var graphName = self.get('cliMonitorName');
		var fieldsToValidate = {};
		if(isSave){
			var isMonitorNameExists = false;
			var interval = self.get('cliMonitorInterval');
			if(graphName !== undefined){
                var checkGraphResponse = opm_ajaxGetRequest(window.OPM.apiUrlPattern+'/admin/checkGraphName',{graphName:graphName}); //No I18N
                isMonitorNameExists = (checkGraphResponse && checkGraphResponse.data && checkGraphResponse.data.message !== 'false');//No I18N
            }
            if(!isMonitorNameExists && ('deviceTemplate' === self.get('pageName'))){
	            $.each(OPMClient.SettingsDeviceTemplateController.graphIds, function(key,value){
	                isMonitorNameExists = (value.dataArray.graphName === graphName);
	                return !isMonitorNameExists;
	            });
		    }
			fieldsToValidate = {empty:['cliMonitorName','cliMonitorInterval','cliMonitorUnit'],profName:['cliMonitorName'],rangeCheck:{cliMonitorInterval:1440},positive:['cliMonitorInterval'],custom:[{condition:isMonitorNameExists,identifier:'cliMonitorName',message:Ember.I18n.t('webclient.dt.monitor.alreadyexists')}]};//No I18N
			if(self.get('isThresholdEnabled')){
				updatePerfMonErrorObj = {};
				var isValidThreshold = self.get('thresholdData').validateThresholdsRef();
				if(!isValidThreshold){
					$.each(updatePerfMonErrorObj,function(field,msg){
						$("#"+field).addClass('validateField error');//No I18N
						$("#"+field).attr('data-error',msg);//No I18N
						opmValidateTooltipDefine();
						opmValidate($("#"+field));//No I18N
					});
					return;
				}		
			}
			if(self.get('isCustomFieldEnabled')){
				fieldsToValidate.custom.push({condition:((interval < 3) || (interval > 24)),identifier:'cliMonitorInterval',message:Ember.I18n.t((interval < 3) ? 'opm.custmon.interval.minlimit' : 'opm.custmon.interval.maxlimit')},{condition:($('#cliMonitorCustomFieldValue').attr('data-customFieldId') === '0'),identifier:'cliMonitorCustomField_drpdwn',message:Ember.I18n.t('webclient.opm.update.customfield.selectfield.error')});//No I18N
			}
		}else{
			fieldsToValidate = {empty:['cliCommand'],maxCheck:{cliCommand:2000}};
			if(self.get('showDeviceSelection')){
				fieldsToValidate.empty.push('cliDeviceName');//No I18N
			}
		}
        return opm_validateFields(fieldsToValidate);
    },
    loadTestGrid:function(){
    	var self = this;
    	Ember.run.scheduleOnce('afterRender',function(){//No I18N
            $('#testResult').jqGrid('GridUnload');//No I18n
            var defaultOptions = {sortName:'instance',sortOrder:'asc',minRowsPerPage:10,Search:false,hideCSV:true,hideExcel:true};//No I18N
            opm_loadJQgridWithData('#testResult',self.get('testResult'),[Ember.I18n.t('webclient.devices.details.instance'),Ember.I18n.t('webclient.widget.value')],[{name:'instance',index:'instance'},{name:'value',index:'value'}],'','','',defaultOptions); //No I18N
        });
    },
    getCustomFieldsList:function(){
		return opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/listAdditionalFields',{type:'CustFieldToGraph'});//No I18N
	},
    resetLookup:function(self){
    	var pageName = self.get('pageName');
    	var pageId = (('vendorMonitor' === pageName) || ('deviceTemplate'=== pageName)) ? 'performanceMonitors' : 'snapshot';//No I18N
		self.setProperties({isLookupEnabled:false,lookupArray:[],pageId:pageId,lookupDefaultValues:[]});
	},
	actions:{
		addNewVendor:function(isSave,isAddOrClose){
			var self = this;
			if(isSave){
				var newVendor = $('#cliNewVendor').val();
				if(opm_validateFields({empty:['cliNewVendor'],custom:[{condition:!opm_isValidVendorName(newVendor),identifier:'cliNewVendor',message:Ember.I18n.t('webclient.devices.devprop.status.spechar')}]})){
					var vendorList = self.get('vendorList');
					vendorList.pushObject(newVendor);
					self.setProperties({selectedVendor:newVendor,showAddNewVendor:false});
					self.loadVendorList(self);
				}
			}else{
				self.setProperties({showAddNewVendor:isAddOrClose});
				$('#cliNewVendor').val('');//No I18n
			}
		},
		gotoStep:function(stepNumber){
			var self = this;
			self.setProperties({stepNumber:stepNumber});
		},
		testCLICommand:function(){
			var self = this;
			if(self.validateForm(false)){
                var apiRequestParams = {deviceName:self.get('selectedDevice'),isPerfMonitor:true,numericType:1,command:self.get('cliCommand'),isCustomMonitor:true};//No I18N
                self.setProperties({testMessage:''});
                if(!self.get('isDeviceLevelAdd')){
                	self.setProperties({selectedVendor:$('#cliVendorList').val()});
                }
                var testInprogressMsg = '';
                if(window.OPM.isTFAEnabled){
                	testInprogressMsg = Ember.I18n.t('opm.perf.monitors.cli.add.cli.query.inprogress');//No I18N
                }else{
                	self.setProperties({disableTest:true,showTestInProgress:true});	
                }
                opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/testCliCommand',apiRequestParams,testInprogressMsg,{callback:function(response){//No I18N
                    if(response.error === undefined){
                        if(response.result !== undefined){
                            if(response.result[0].errorMsg !== undefined){
                                self.setProperties({testMessage:response.result[0].errorMsg});
                            }else{
                            	var resultCount = response.result.length;
                                self.setProperties({cliCmdTestId:response.testId,isTestPassed:true,parseAll:response.parseAll,testResult:response.result,testResultCount:resultCount,isMultiple:false/*(resultCount > 1)*/});
                           		self.send('gotoStep',2);//No I18N
                            }
                        }
                    }else{
                    	showMessage(response);
                    }
                    self.setProperties({disableTest:false,showTestInProgress:false});
                },otpPageType:'dialog'});//No I18N
            }
		},
		setNumericType:function(numericType){
			var self = this;
			self.setProperties({numericType:numericType});
		},
		addMonitor:function(){
			var self = this;
			var pageName = self.get('pageName');
			var graphObj = {
	                	graphName:self.get('cliMonitorName'),displayName:self.get('cliMonitorName'),//No I18N
	                	type:((self.get('isMultipleNode')) ? 'multiplenode' : 'multiple'),units:self.get('cliMonitorUnit'),//No I18N
	                	protocol:'CLI',isNumeric:true,numericType:self.get('numericType'),interval:self.get('cliMonitorInterval')*60,//No I18N
	                	id:'custGraph_'+self.get('cliMonitorName'),GRAPHID:'custGraph_'+self.get('cliMonitorName'),//No I18N
	                	cliCmdTestId:self.get('cliCmdTestId'),Description:self.get('cliMonitorName') //No I18N
	                };
			if(self.validateForm(true)){
				var thresholdData = self.get('thresholdData');
            	graphObj.warningType = thresholdData.thresholdType;
            	graphObj.troubleType = thresholdData.thresholdType;
            	graphObj.criticalType = thresholdData.thresholdType;
            	graphObj.rearmType = thresholdData.rearmType;
                if(self.get('isThresholdEnabled')){
                	graphObj.warningVal = thresholdData.warningValue;
                	graphObj.troubleVal = thresholdData.troubleValue;
                	graphObj.criticalVal = thresholdData.criticalValue;
                	graphObj.rearmVal = thresholdData.rearmValue;
                	graphObj.warningMsg = thresholdData.warningMessage;
                	graphObj.troubleMsg = thresholdData.troubleMessage;
                	graphObj.criticalMsg = thresholdData.criticalMessage;
                	graphObj.rearmMsg = thresholdData.rearmMessage;
                	graphObj.failureThreshold = thresholdData.consecutiveTimes;
                	graphObj.isMultipleThreshold = thresholdData.isMultipleThreshold;
                }
                if(self.get('isLookupEnabled')){
                	if(validateLookupArray(self,true)){
                		addLookupData(graphObj,self,false);
                	}else{
                		return;
                	}
                }
                if(self.get('isCustomFieldEnabled')){
                	graphObj.custFieldId = parseInt($('#cliMonitorCustomFieldValue').attr('data-customFieldId'));
                }
                if(self.get('isATEnabled')){
                	graphObj.isAdaptiveThresholdsEnabled = true;
					graphObj.deviationType = $("input[name='"+self.get('atDeviationRadioName')+"']:checked").val();//No I18n
                }
                if(self.get('showFunctionalExp') && self.get('selectedFunctionalExp')){
                	graphObj.functionalExp = self.get('selectedFunctionalExp');
                }
                addPerfGroupToParamsObject(graphObj,'addCLI','0');//NO I18N

                if('deviceTemplate' === pageName){
                	graphObj.timeout = 1;
                	graphObj.sSave = true;
                	graphObj.isCustomGraph = true;

					OPMClient.SettingsDeviceTemplateController.graphIds.push({displayName:graphObj.displayName,DISPLAYNAME:graphObj.displayName,Protocol:'CLI',protocol:'CLI',moninterval:graphObj.interval,intervalMins:self.get('cliMonitorInterval'),showDial:false,THRESHOLDENABLED:(self.get('isThresholdEnabled')) ? Ember.I18n.t('webclient.devices.intftypes.enabled') : Ember.I18n.t('webclient.devices.details.notenabled'),id:graphObj.id,dataArray:graphObj,isEdited:true,failureThreshold:graphObj.failureThreshold,numericType:graphObj.numericType});//No I18N
					OPMClient.SettingsDeviceTemplateController.customGraphCnt += 1;
					opm_deviceTemplateMonitorGridLoad(OPMClient.SettingsDeviceTemplateController.graphIds);
					opm_transitionToParentRoute('Settings.Configurations.DeviceTemplate.'+((OPMClient.SettingsDeviceTemplateController.isAdd) ? 'Add' : 'Edit'));//No I18N
				}else{
					var apiRequestParams = {
	                	deviceName:self.get('selectedDevice'),fromPage:self.get('pageId'),vendor:self.get('selectedVendor'),graphObj:JSON.stringify({dataArray:[graphObj]})
	                };
	                opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/admin/addCLIMonitor',apiRequestParams,'',function(response){//No I18N
	                	if(response.result !== undefined){
	                		var callback_func = function(){
		                		if('vendorMonitor' === pageName){
		                			$('#perfMonitors_type').select2().val('customMonitors').trigger('change');//No I18N
		                		}else{
		                			OPMClient.Inventory.getDeviceMonitorsDetails(OPMClient.InventoryDeviceDetailsController.deviceName);
									OPMClient.Inventory.getSelectedMonitors(OPMClient.InventoryDeviceDetailsController.monitorsName);
		                		}
		                		self.send('cancelOperation');//No I18N
		                	};
		                	opm_infoMsgs('successMsg',response.result.message,{callback_func:callback_func});//No I18N
	                	}else{
	                		showMessage(response);	
	                	}
	                });
	            }
            }
		},
		cancelOperation:function(){
			slideOut(7);
			opm_transitionToParentRoute(this.get('parentRoute'));//No I18N
		},
		enableCustomFieldDrpDown:function(){
			if($("#cliMonitorCustomField_drpdwn").hasClass('active') && !$('#cli_CF_Search').is(':focus')) {
				$("#cliMonitorCustomField_drpdwn").removeClass('active');
			}else{
				$("#cliMonitorCustomField_drpdwn").addClass('active');
				$('#cliMonitorCustomField_DropDownBox').show();
				if($("#cliMonitorCustomField_drpdwn").attr('data-error') !== undefined)
				{
					$("#cliMonitorCustomField_drpdwn").removeAttr('data-error');
					$('.OpMToolBar').hide();
				}
			}
		},
		selectCustomField: function(field){
			$('#cliMonitorCustomFieldValue').text(field.customFieldNameDisp);
			$('#cliMonitorCustomFieldValue').attr('data-customFieldId',field.customFieldId);//NO I18N
		},
		addNewCustomField: function(){
			var self = this;
		   	self.setProperties({slideDetails:{id:'cliMonitorCustomMonitor_CustomField',componentName:'OPMClient.OpmCustomMonitorCustomFieldComponent',slideHeader:Ember.I18n.t('webclient.add.fielld'),isSmall:true,actionName:'customFieldCancelAction',parentObj:self}});//No I18N
		   	slideInWithId('cliMonitorCustomMonitor_CustomField'); //No I18n
		},
		addCustomField: function(){
			var self = this;
			var customFieldAdded = opm_additionalFields('Device','fromCustomMonitor'); //No I18N
			if(customFieldAdded){
				var customFieldslist = self.getCustomFieldsList();
				self.setProperties({customFieldslist:customFieldslist});
				self.send('customFieldCancelAction'); //No I18n
				self.send('selectCustomField',customFieldslist[customFieldslist.length-1]); //No I18n
			}
		},
		customFieldCancelAction:function(){
			var self = this;
			slideOutWithId('cliMonitorCustomMonitor_CustomField'); //No I18n
			self.setProperties({slideDetails:undefined});
		}
	},
	stepNumberObserver:function(){
		var self = this;
		var stepNumber = self.get('stepNumber');
		var resetLookupTable = ((stepNumber === 3) && self.get('isLookupEnabled'));
		self.setProperties({isStepOne:(stepNumber === 1),isStepTwo:(stepNumber === 2),isStepThree:(stepNumber === 3)});
		if(resetLookupTable){
			self.setProperties({isLookupEnabled:false});
		}
		Ember.run.scheduleOnce('afterRender',function(){//No I18N
			switch(stepNumber){
				case 1:
					self.setProperties({showMonitorSummary:false});
				break;
				case 2:
					var summaryList = [];
					self.loadTestGrid();
					summaryList.pushObject({id:'cliCommand',header:Ember.I18n.t('webclient.opm.settings.perfmonitor.edit.cli.command'),value:self.get('cliCommand')});//No I18n
					if(self.get('showFunctionalExp')){
						self.setProperties({cliMonitorUnit:self.get('displayUnit')[self.get('selectedFunctionalExp')]});//No I18N
						summaryList.pushObject({id:'cliFunctionalExp',header:Ember.I18n.t('webclient.customsnmp.functionalexpression'),value:$('#cliFunctionalExp option:selected').text()});//No I18N
					}
					summaryList.pushObject({id:'cliMonitorAddType',header:'Monitor Type',value:Ember.I18n.t((self.get('isMultipleNode'))?'opm.perf.monitors.cli.monitor.type.instance.based':'fwa.report.single')});//No I18N
					self.setProperties({showMonitorSummary:true,summaryList:summaryList});
				break;
				case 3:
					if(resetLookupTable){
						self.setProperties({isLookupEnabled:true});
					}
				break;
			}
		});
	}.observes('stepNumber'),//No I18N
	multipleNodeObserver:function(){
		var self = this;
		var isMultipleNode = self.get('isMultipleNode');
		if(isMultipleNode !== undefined){
			var summaryList = self.get('summaryList');
			Ember.set(summaryList[summaryList.length-1],'value',Ember.I18n.t(isMultipleNode?'opm.perf.monitors.cli.monitor.type.instance.based':'fwa.report.single'));//No I18n
			if(isMultipleNode){
				var allowedCountForInstanceMonitors = self.get('allowedCountForInstanceMonitors');
				if(self.get('testResultCount') > allowedCountForInstanceMonitors){
					opmConfirm(Ember.I18n.t('webclient.opm.settings.qcw.monitor.type.instance'),Ember.I18n.t('opm.perf.monitors.cli.add.instance.monitor.confirm.msg',{param0:allowedCountForInstanceMonitors}),'','',Ember.I18n.t('webclient.action.ok'),'','','','dialogStyle2',true,true,'',true);//No I18n
				}
			}
		}
	}.observes('isMultipleNode'),//No I18n
	customFiledEnabledObserver:function(){
		var self = this;
		var customFieldslist = self.get('customFieldslist');
		if(self.get('isCustomFieldEnabled')){
			if(!customFieldslist){
				self.setProperties({customFieldslist:self.getCustomFieldsList()});
			}
			self.setProperties({cliMonitorInterval:24,intervalUnit:Ember.I18n.t('webclient.map.filemonitor.fileage.hours')}); //No I18n
		}else{
			self.setProperties({cliMonitorInterval:15,intervalUnit:Ember.I18n.t('webclient.general.mins')}); //No I18n
		}
	}.observes('isCustomFieldEnabled'),//No I18N
	thresholdEnableDisableObserver:function(){
		var self = this;
	}.observes('isThresholdEnabled'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmGroupSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-group-summary", //No I18N
	didInsertElement: function(){
		this.set('chartDataObj',[]); //No I18N
		//var temp = {};
		var currentWidgetData = this.widgetData;
			var colr = bv_availColors;
        	var chartDataObj = {
				 "placeholder":[],//No I18N
				"chartobj":[]//No I18N
				}
        	var timeFormat = 'hours';//No I18N
			//var id1="groupGraph";
			var id1='perfGraph' + this.get('widgetData').id;//No I18N
			if(currentWidgetData.apiData.GroupDetails.groupType ==="Ipsla"){
				var availColors = ['#77d283','#f47272'];//No I18N
				var upMemberCnt = (currentWidgetData.apiData.GroupDetails.count - currentWidgetData.apiData.GroupDetails.statusChangeCount);
				var downMemCnt = currentWidgetData.apiData.GroupDetails.statusChangeCount;
				var graphData = [["Up",upMemberCnt ],["Down", downMemCnt]];

				chartObj = {
					id:id1,
					type:'pie',//No I18N
					subType:"simpleDonut",//No I18N
					customClass:"opm_pie",//No I18N
					jsonData:graphData,
					height:250,
					columns:{
						datatype_1:'ordinal',//No I18N
						datatype_2:'numeric',//No I18N
						columnname_1:Ember.I18n.t('jsp.commonstr.Status',this),//No I18N
						columnname_2:Ember.I18n.t('webclient.opm.grouping.elementcount',this),//No I18N
						columnname_3:'',
						timeFormat:(timeFormat !== undefined? timeFormat : 'hours')//No I18N
						//suffix:' %'//No I18N
					},
					canvas:{
						title:{
							show:true,
							text:""
						}
					},
					legend:{
						"enabled":true,//No I18N
						"layout": "vertical"//No I18N
					},
					plotoptions: {
						pie: {
								innerRadius: "75%",
								datalabels: {
									handleOverlapping: true,
									type: 'doubleside',//No I18N
									showAs: 'y',//No I18N
									line: {
										strokeColor: 'gray',//No I18N
										strokeWidth: 1,
										padding:5
									}
							}
						}
					},
					datalabels: {
						handleOverlapping: true,
						show: true,
						boundBox: {
							strokeColor: null,
							show: false,
							radius: 3,
							padding: 4,
							hook: {
								enabled: true,
								width: 0.5
							}
						}
					}
				}
				chartObj.legend.colors = availColors;
			}else{

					var chartObj = {
						id:id1,
						type:'bar',//No I18N
						jsonData:currentWidgetData.apiData.DashBoardDetails.Distribution.data.chartData,
						series:"multi",//No I18N
						height:250,
						columns:{
							datatype_1:"time",//No I18N
							datatype_2:'numeric',//No I18N
							columnname_1:currentWidgetData.apiData.DashBoardDetails.Distribution.data.xyTitles[0],
							columnname_2:currentWidgetData.apiData.DashBoardDetails.Distribution.data.xyTitles[1],
							columnname_3:'Label',//No I18N
							timeFormat:(timeFormat !== undefined? timeFormat : 'hours')//$("#selectedTime option:selected").data('time')//No I18N
							},
						canvas:{
							title:{
								show:false,
								text:""
							}
						},
					chart:{stacked:true},
					area:{marker:true},
					legend:{
						"enabled":true//No I18N
					},
					bar:{
						rotated:false,
						levelMarker:true
				},
				pie:{innerLabel:false},
				tooltip:[0,1,2]

				}
		    	chartObj.legend.colors = colr;
			}

		   this.set("chartDataObj",chartObj);//No I18N
		var adjustedHeight = $('#'+this.elementId+' .DIGmCustomScroll').closest('.grid-stack-item').height()-140;//No I18N
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',15);//No I18N
			adjustedHeight = 210;
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	actions:{
		redirectToDeviceSnapshot: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.details.parentKey,'','MonitoringDevice');
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmGroupSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-group-summary-details", //No I18N
	groupAssociatedRCA:[],
	didInsertElement: function(){
		if(this.summary.groupType!=="Group" && this.summary.groupType!=="Ipsla" && window.OPM.isAdministrator && !window.OPM.isFreeEdition && !window.OPM.isOPMStandardEdition && !window.OPM.isOPMLiteEdition && !window.OPM.isMSPEdition && !window.OPM.isCentralServer)//NO I18N
		{
			var jsonResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/alarm/getGroupAssociatedRCA',{groupId:this.summary.groupID}); //No I18N
			if(jsonResponse!==undefined && jsonResponse.error===undefined)
			{
			    $("#rcaGroups").show();//No I18N
			    if(jsonResponse.length > 0) {
			        this.set("groupAssociatedRCA",jsonResponse);//NO I18N
			    }
			   	this.set('isMultiRCAProfile',false); //No I18n
			    if(jsonResponse.length > 1){
			    	this.set('isMultiRCAProfile',true); //No I18n
			    	$.each(jsonResponse,function(index,value){
				    	if(index === jsonResponse.length -1) {
				    		value.islastEntry = true;
				    	}
				    });
			    }
			}
		}

		var groupDetails = this.get('summary'); //No I18n
		if(groupDetails !== undefined && groupDetails.groupDisplayName !== undefined)
		{
			$(window).off('click').on('click',function(e) {
				var targetClassName = (e.target.className !== undefined) ? String(e.target.className) : '';
			    if(targetClassName.indexOf('groupNameEditer') !== -1 || targetClassName.indexOf('groupNameValue') !== -1 )
			    {
			    	if(!$('.groupNameSection').hasClass('active'))
					{
						$('.groupNameSection').addClass('active');
						$('#groupNameVal').focus();
						$('#groupNameVal').val($('.groupName').text());
						$("#groupNameVal").removeClass('validateField error');//No I18N
						updateGroupName(groupDetails.groupName,groupDetails.groupID);
					}
			    }
			    else
			    {
			    	$('.groupNameSection').removeClass('active'); //No I18n
			    	$('.groupName').text($('#nameOnly').text());
			    	$("#groupNameVal").removeClass('validateField error');//No I18N
			    }
			});
		}
		if(groupDetails!==undefined && groupDetails.count!==undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj!==undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails!==undefined) {
			OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.memberCount=groupDetails.count;
		}
		var apDetails = this.apDetails;
		if(apDetails !== undefined) {
			this.set('APCount',apDetails.length); //No I18n
			this.set('isAPEmpty',true);//No I18n
			if(apDetails.length>0) {
				this.set('isAPEmpty',false);//No I18n
			}
		}
	},
	actions:{
		viewRCAProfile:function(rcaID)
		{
			OPMClient.SettingsAddEditController.parentRoute = 'Settings.Configurations.ElementsGroup.Index';//No I18N
			opmGlobalRoute.transitionTo('Alarms.Alarm.RCA.ViewReport',rcaID);//No I18N
			window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
		},
		createNewRCA:function(groupName)
		{
		    createGroupAssociatedRCA(groupName);
		    window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
		},
		createNewAP:function(groupName)
		{
			opm_transitionToParentRoute('Settings.Configurations.AddAlarmProfile'); //No I18N
		},
		editAp:function(groupName)
		{
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+groupName+"/AlarmProfiles";	//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//NO I18N
	}
});
OPMClient.OpmPerfGroupAddEditDeleteComponent = Ember.Component.extend({
	templateName: "components/opm-perfGroupAddEditDelete", //No I18N
	didInsertElement:function() {
		//create unique Ids to be rendered in HTML - Need dynamic Ids as same component is rendered in same template (Add Performance Monitors in settings)
		var uniqueIds = {
			"PerfGrpTitleLabel":"PerfGrpTitleLabel_"+this.pageType,//NO I18N
			"perfGroupDiv":"perfGroupDiv_"+this.pageType,//NO I18N
			"perfGrpSelectBox":"perfGrpSelectBox_"+this.pageType,//NO I18N
			"perfGroupValue":"perfGroupValue_"+this.pageType,//NO I18N
			"perfGrpSearchBox":"perfGrpSearchBox_"+this.pageType,//NO I18N
			"perfGrpDropDownBox":"perfGrpDropDownBox_"+this.pageType,//NO I18N
			"perfGrpDropDownList":"perfGrpDropDownList_"+this.pageType,//NO I18N
			"perfGrpTextBoxDiv":"perfGrpTextBoxDiv_"+this.pageType,//NO I18N
			"perfGrpInputBox":"perfGrpInputBox_"+this.pageType,//NO I18N
			"emptyValidation":"emptyValidation_"+this.pageType,//NO I18N
			"dialog":"dialog_"+this.pageType,//NO I18N
			"deleteMessage":"deleteMessage_"+this.pageType,//NO I18N
			"perfGrpMinLen":"perfGrpMinLen_"+this.pageType,//NO I18N
			"perfGrpMaxLen":"perfGrpMaxLen_"+this.pageType,//NO I18N
			"perfGrpSpSymb":"perfGrpSpSymb_"+this.pageType};//NO I18N
		if(window.OPM.userPermissions.monitoringRead && !(OPMClient.ApplicationController.isProbe&&this.pageType==='settingsPerfEdit')) {
			var jsonData = OPMClient.SettingsAddEditController.get('perfGroupsList');
			if(jsonData === undefined){
				var urlParams = {};
				var skipPerfGrpCall = false;
				if(this.pageType==="settingsPerfEdit" && OPMClient.SettingsConfigurationController.PerfGraphID!==""){//No I18N
					urlParams.graphID = OPMClient.SettingsConfigurationController.PerfGraphID;
					if(OPMClient.SettingsConfigurationController.isCustomGraph===false && OPMClient.SettingsDeviceTemplateController.graphIds!==undefined && OPMClient.SettingsDeviceTemplateController.graphIds.PERFGROUPTYPE==="1")//No I18N
					{
						$('#'+this.elementId+' .credentialBox').addClass("disabledBlock");//No I18N
						skipPerfGrpCall = true;
					}
				}
				if(!skipPerfGrpCall){
					jsonData = opm_ajaxGetRequest(window.OPM.apiUrlPattern + '/device/listPerfGroups',urlParams);//No I18N
				}
			}
			if(jsonData!==undefined && jsonData.data.STATUS==="SUCCESS") {
				OPMClient.SettingsGlobalMonitors.performanceMonitors.availablePerfGroups=jsonData.data.perfGroups;
				OPMClient.SettingsGlobalMonitors.performanceMonitors.availablePerfGroupsForSNMP=$.extend([],jsonData.data.perfGroups);
				if(OPMClient.SettingsAddEditController.get('perfGroupsList') === undefined){
					OPMClient.SettingsAddEditController.set('perfGroupsList',jsonData);//No I18N
				}
			}
		}
		if(this.pageType==='addSnmp') {
			uniqueIds.isSNMPPageType = true;
			this.set('availablePerfGroupsForSNMP',OPMClient.SettingsGlobalMonitors.performanceMonitors.availablePerfGroupsForSNMP);//NO I18N
		} else {
		    this.set('availablePerfGroups',OPMClient.SettingsGlobalMonitors.performanceMonitors.availablePerfGroups);//NO I18N
		}
		this.set('templateIds',uniqueIds);//NO I18N
		//will be true if it is Probe UI or if Probe Dropdown is chosen in MSP Central
		var isProbeMSP = ((window.OPM.isProbeSelected)||(window.OPM.isMSPProbe));
		this.set('isProbeMSP',isProbeMSP);//NO I18N
		Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
			if(this.pageType==='perfMonitorsAddWMI' ||this.pageType==='deviceSnapPerfEdit' || this.pageType==='deviceSnapAddWmi' || this.pageType==='deviceTemplateAddWMI' || this.pageType === "perfMonitors_ScriptDT") {
				$('#'+this.get('templateIds.PerfGrpTitleLabel')).show();
			} else {
				$('#'+this.get('templateIds.PerfGrpTitleLabel')).hide();
			}
			var selectedPerfGroup = this.perfGrpData;
			if(!$.isEmptyObject(selectedPerfGroup)) {
				$('#'+this.get('templateIds.perfGroupValue')).text(selectedPerfGroup.PERFGROUPNAME);
				$('#'+this.get('templateIds.perfGroupValue')).attr('data-perfGroupId',selectedPerfGroup.PERFGROUPID);//NO I18N
				this.set('selectedPerfGroup',selectedPerfGroup);//NO I18N
			} else {
				var pefGrpName = $('#'+this.get('templateIds.perfGroupValue')).text();
				var perfGrpId = $('#'+this.get('templateIds.perfGroupValue')).attr('data-perfGroupId');//NO I18N
				if(perfGrpId === undefined) {
					perfGrpId = '0';
				}
				selectedPerfGroup = {"PERFGROUPNAME":pefGrpName,"PERFGROUPID":perfGrpId};//NO I18N
				this.set('selectedPerfGroup',selectedPerfGroup);//NO I18N
			}
			if(this.pageType==='settingsPerfEdit' && (window.OPM.isProbe||this.get('isProbeMSP'))){
				//blur the select box
				$('#'+this.get('templateIds.perfGroupDiv')).addClass('disabledBlock');
			}
		});
	},
	actions:{
		filterPerfGroupSearchResult:function()
		{
			listSearch($('#'+this.get('templateIds.perfGrpSearchBox')).val(), this.get('templateIds.perfGrpDropDownList'));//No I18N
		},
		enablePerfGroupDropDown:function() {
			if($('#'+this.get('templateIds.perfGrpTextBoxDiv')).is(":visible")) {
				return;
			}
			$('#'+this.get('templateIds.perfGrpSearchBox')).val("");//No I18N
			listSearch("", this.get('templateIds.perfGrpDropDownList'));//No I18N
			if($('#'+this.get('templateIds.perfGroupDiv')).hasClass('active')) {
				$('#'+this.get('templateIds.perfGroupDiv')).removeClass('active');
				$('#'+this.get('templateIds.perfGrpDropDownList')+" #"+selectedPerfGrp).attr('selected',false);//NO I18N
			} else {
				$('#'+this.get('templateIds.perfGroupDiv')).addClass('active');
				$('#'+this.get('templateIds.perfGrpDropDownBox')).show();
				var selectedPerfGrp = this.get('selectedPerfGroup');
				$('#'+this.get('templateIds.perfGrpDropDownList')+' #'+escapePerfGrpName(selectedPerfGrp.PERFGROUPNAME)).attr('selected',true);//NO I18N
			}
		},
		addPerfGroup:function() {
			$('#'+this.get('templateIds.perfGrpSelectBox')).hide();
			$('#'+this.get('templateIds.perfGrpDropDownBox')).hide();
			$('#'+this.get('templateIds.perfGrpTextBoxDiv')).show();
			var self = this;
			self.set('isEditPerfGrp',false);//NO I18N
		},
		editPerfGrp:function(perfGroup){
			$('#'+this.get('templateIds.perfGrpSelectBox')).hide();
			$('#'+this.get('templateIds.perfGrpDropDownBox')).hide();
			$('#'+this.get('templateIds.perfGrpTextBoxDiv')).show();
			$('#'+this.get('templateIds.perfGrpInputBox')).val(perfGroup.PERFGROUPNAME);
			$('#'+this.get('templateIds.perfGrpInputBox')).attr('data-perfGrpId',perfGroup.PERFGROUPID);//NO I18N
			var self = this;
			self.set('isEditPerfGrp',true);//NO I18N
		},
		selectPerfGroup:function(perfGroup){
			$('#'+this.get('templateIds.perfGrpDropDownBox')).hide();
			$('#'+this.get('templateIds.perfGrpTextBoxDiv')).hide();
			$('#'+this.get('templateIds.perfGrpSelectBox')).show();
			var self = this;
			var olderPerfGrp = self.get('selectedPerfGroup');
			$('#'+this.get('templateIds.perfGrpDropDownList')+' #'+escapePerfGrpName(olderPerfGrp.PERFGROUPNAME)).attr('selected',false);//NO I18N
			if(perfGroup==='None') {
				$('#'+this.get('templateIds.perfGroupValue')).text(Ember.I18n.t('webclient.admin.devices.None'));//NO I18N
				$('#'+this.get('templateIds.perfGroupValue')).attr('data-perfGroupId','0');//NO I18N
				self.set('selectedPerfGroup',{});//NO I18N
			} else {
				$('#'+this.get('templateIds.perfGroupValue')).text(perfGroup.PERFGROUPNAME);
				$('#'+this.get('templateIds.perfGroupValue')).attr('data-perfGroupId',perfGroup.PERFGROUPID);//NO I18N
				var newPerfGroup = {"PERFGROUPNAME":perfGroup.PERFGROUPNAME,"PERFGROUPID":perfGroup.PERFGROUPID};//NO I18N
				self.set('selectedPerfGroup',newPerfGroup);//NO I18N
				$('#'+this.get('templateIds.perfGrpDropDownList')+' #'+escapePerfGrpName(newPerfGroup.PERFGROUPNAME)).attr('selected',true);//NO I18N
			}
		},
		createNewPerfGrp:function() {
			var self = this;
			var olderPerfGrp = self.get('selectedPerfGroup');
			var perfGroupName = $('#'+this.get('templateIds.perfGrpInputBox')).val();
			if(perfGroupName===''){
				$('#emptyValidation').show();
			}
			if(!validatePerfGrpNameAndShowChanges(perfGroupName,this.get('templateIds.perfGrpTextBoxDiv'),this.get('templateIds.perfGrpMinLen'),this.get('templateIds.perfGrpMaxLen'),this.get('templateIds.perfGrpSpSymb'))) {
				if(!$('#'+this.get('templateIds.perfGrpInputBox')).hasClass('validateField error')) {
					$('#'+this.get('templateIds.perfGrpInputBox')).addClass('validateField error');
				}
				return;
			}
			if($('#'+this.get('templateIds.perfGrpInputBox')).hasClass('validateField error')) {
				$('#'+this.get('templateIds.perfGrpInputBox')).removeClass('validateField error');
			}
			var monitorUrl = window.OPM.apiUrlPattern + "/device/createPerfGroup";//No I18N
			var perfGrpId=-1;
			isEdit = false;
			if(self.get('isEditPerfGrp')) {
				isEdit = true;
				perfGrpId = $('#'+this.get('templateIds.perfGrpInputBox')).attr('data-perfGrpId');//NO I18N
			}
			var postParams={'perfGroupName':perfGroupName};//NO I18N
			if(isEdit) {
				postParams.isEdit = true;
				postParams.perfGroupId=perfGrpId;
			}
			var jsonResponse = opm_ajaxPostRequest(monitorUrl,postParams);
			if(jsonResponse!==undefined){
				if(jsonResponse.result!==undefined) {
					var perfGroupId = jsonResponse.result.perfGroupId;
					var perfGroupName = jsonResponse.result.perfGroupName;
					var newPerfGroup = {'PERFGROUPID':perfGroupId+'','PERFGROUPNAME':perfGroupName};//NO I18N
					var self = this;
					if(isEdit) {
						if(this.get('availablePerfGroups')!==undefined) {
							removePerfGrpFromDropDownAndCache(newPerfGroup,this.get('availablePerfGroups'));
						} else if(this.get('availablePerfGroupsForSNMP')!==undefined) {
							removePerfGrpFromDropDownAndCache(newPerfGroup,this.get('availablePerfGroupsForSNMP'));
						}
					}
					if(this.get('availablePerfGroupsForSNMP')!==undefined) {
						this.get('availablePerfGroupsForSNMP').pushObject(newPerfGroup);
					} else if(this.get('availablePerfGroups')!==undefined) {
						this.get('availablePerfGroups').pushObject(newPerfGroup);
					}
					$('#'+this.get('templateIds.perfGrpInputBox')).val('');//NO I18N
					this.send('selectPerfGroup',newPerfGroup);//NO I18N
				} else if(jsonResponse.error!==undefined) {
					opm_infoMsgs("errorMsg",jsonResponse.error.message);//No I18N
				}
			}
		},
		cancelPerfGrp:function() {
			$('#'+this.get('templateIds.emptyValidation')).hide();
			if($('#'+this.get('templateIds.perfGrpInputBox')).hasClass('validateField error')) {
				$('#'+this.get('templateIds.perfGrpInputBox')).removeClass('validateField error');
			}
			$('#'+this.get('templateIds.perfGrpTextBoxDiv')).hide();
			$('#'+this.get('templateIds.perfGrpInputBox')).val('');//NO I18N
			$('#'+this.get('templateIds.perfGrpSelectBox')).show();
			$('#'+this.get('templateIds.perfGrpDropDownBox')).show();
			var self = this;
			if(self.selectedPerfGroup!==undefined && !$.isEmptyObject(self.selectedPerfGroup)) {
				$('#'+this.get('templateIds.perfGroupValue')).text(self.selectedPerfGroup.PERFGROUPNAME);
				$('#'+this.get('templateIds.perfGroupValue')).attr('data-perfGroupId',self.selectedPerfGroup.PERFGROUPID);//NO I18N
			} else {
				$('#'+this.get('templateIds.perfGroupValue')).text(Ember.I18n.t('webclient.admin.devices.None'));//NO I18N
				$('#'+this.get('templateIds.perfGroupValue')).attr('data-perfGroupId','0');//NO I18N
			}
			var self = this;
			self.set('isEditPerfGrp',false);//NO I18N
		},
		enableDeletePerfGrpDialog:function(perfGroup) {
			$("#v2BodyHolder").addClass("ui-dialog-style2");
			var self = this;
			self.set('perfGrpToDelete',perfGroup);//NO I18N
			$('#'+this.get('templateIds.deleteMessage')).text(Ember.I18n.t('webclient.perfGrp.deleteConfirm',{param0:perfGroup.PERFGROUPNAME}));//NO I18N
			$('#'+this.get('templateIds.dialog')).show();
			var dialogId = $('#'+this.get('templateIds.dialog'));
			dialogId.dialog({
				modal: true,
				resizable: false,
				width: 400,
				title: Ember.I18n.t('webclient.admin.deletecredential'),//NO I18N
				closeOnEscape: false,
				close: function() {
					$("#v2BodyHolder").removeClass("ui-dialog-style2");
					dialogId.dialog('destroy');//NO I18N
					dialogId.hide();
				}
			});
		},
		deletePerfGroup:function() {
			var self = this;
			var perfGrpToDelete = self.get('perfGrpToDelete');
			var monitorUrl = window.OPM.apiUrlPattern + "/device/deletePerfGroup";//No I18N
			var postParams={'perfGroupId':perfGrpToDelete.PERFGROUPID};//NO I18N
			var jsonResponse = opm_ajaxPostRequest(monitorUrl,postParams);
			if(jsonResponse!==undefined){
				if(jsonResponse.result!==undefined &&jsonResponse.result.message!==undefined) {
					opm_infoMsgs("successMsg",jsonResponse.result.message);//No I18N
					if(self.selectedPerfGroup.PERFGROUPID === perfGrpToDelete.PERFGROUPID) {
						this.send('selectPerfGroup','None');//NO I18N
					}
					if(this.get('availablePerfGroups')!==undefined) {
						removePerfGrpFromDropDownAndCache(perfGrpToDelete,this.get('availablePerfGroups'));
					} else if(this.get('availablePerfGroupsForSNMP')!==undefined) {
						removePerfGrpFromDropDownAndCache(perfGrpToDelete,this.get('availablePerfGroupsForSNMP'));
					}
				} else if(jsonResponse.error!==undefined) {
					opm_infoMsgs("errorMsg",jsonResponse.error.message);//No I18N
				}
				this.send('cancelDeletePerfGrp');//NO I18N
			}
		},
		cancelDeletePerfGrp:function() {
			var self = this;
			self.set('perfGrpToDelete',{});//NO I18N
			$('#'+this.get('templateIds.dialog')).dialog('destroy');//NO I18N
			$('#'+this.get('templateIds.dialog')).hide();
		}
	},
	keyUp: function (e) {
		if($('#'+this.get('templateIds.perfGrpInputBox')).is(':focus')) {
			var perfGroupName = $('#'+this.get('templateIds.perfGrpInputBox')).val();
			if(perfGroupName===''){
				$('#'+this.get('templateIds.emptyValidation')).show();
			} else {
				$('#'+this.get('templateIds.emptyValidation')).hide();
			}
			validatePerfGrpNameAndShowChanges(perfGroupName,this.get('templateIds.perfGrpTextBoxDiv'),this.get('templateIds.perfGrpMinLen'),this.get('templateIds.perfGrpMaxLen'),this.get('templateIds.perfGrpSpSymb'));
		}
		if($('#'+this.get('templateIds.perfGrpSearchBox')).is(':focus')) {
			listSearch($('#'+this.get('templateIds.perfGrpSearchBox')).val(), this.get('templateIds.perfGrpDropDownList'));//No I18N
		}
		if($('#'+this.get('templateIds.perfGrpSearchBox')).is(':focus')) {
			listSearch($('#'+this.get('templateIds.perfGrpSearchBox')).val(), this.get('templateIds.perfGrpDropDownList'));//No I18N
		}
	},
	willDestroyElement:function(){
		delete OPMClient.SettingsAddEditController.perfGroupsList;
	}
});
OPMClient.OpmopmSubGridComponent = Ember.Component.extend({
	templateName: "components/opm-grid",//NO I18N
	//classNames:["snapSubGrid"],//No I18N
	showGrid:false,
	gridData:{},
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var gridCallBack = function(gridID,paramsObj){
			if(paramsObj.self.get('widgetData.name')==="webclient.opm.kemplb.vs.childlist" || paramsObj.self.get('widgetData.name') ==="opm.sdwan.sites")//No I18N
			{
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+42)/22);
				paramsObj.self.set('widgetData.sizey',cellCount);//NO I18N
			}else{
			paramsObj.self.set('widgetData.sizey',25);//NO I18N
			}
			if(paramsObj.self.get('widgetData.name')==="webclient.opm.kemplb.vs.childlist"){//NO I18N
				opm_injectKempVsSelectAll(gridID);
			}
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//NO I18N
		};
		var jsonData = this.get('widgetData.apiData');
		if(jsonData!==null){
			var snapDetails = self.get('widgetData');
			var snapshotData = snapDetails.snapshotData;
			var colNamesList=snapshotData.colNamesList;
			var colModelList=snapshotData.colModelList;
			var onselectfunction=snapshotData.subGridFunction;//NO I18N
			var isColModelList1=false;
			var subGrid=true;
			validateGridColumnDetails(colModelList,colNamesList);
			validateGridColumnDetails(snapshotData.subgrid.colModelList,snapshotData.subgrid.colNamesList)

			var gridData = {};
			gridData = jsonData;
			if(snapDetails !== undefined && (snapDetails.name === "opm.wlc.clients" || snapDetails.name === "opm.ngfw.clients")){ //No I18N
				gridData = jsonData.clientData;
				$(".wlcTabIconClients b").text(jsonData.clientCount); //No I18N
				/* Keep NGFW Wireless top-tab client count in sync with polled data */
				if(snapDetails.name === "opm.ngfw.clients"){//No I18N
					opm_updateNgfwTabCount('clientsCount', (jsonData.clientCount !== undefined) ? jsonData.clientCount : 0);//No I18N
				}
			}
			if(snapDetails.name==="opm.wlc.clients" &&(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.midLevelWLC !== undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.midLevelWLC)){
				setHiddenColumn(snapshotData.subgrid.colModelList,['TotalBytes'],true); //No I18n
			}
			if(currentWidgetData.name==="webclient.opm.kemplb.vs.childlist"){//No I18N
				$("#widgetElement_"+this.get('widgetData.id')+" .content > div").removeClass("snapSubGrid");//No I18N
				if(colModelList!==undefined){
					for(var kvci=0;kvci<colModelList.length;kvci++){
						if(colModelList[kvci].name==="enabled"){
							colModelList[kvci].hidden = !(OPMClient.ApplicationController.showSuppressAlarm);
						}
						else if(colModelList[kvci].name==="state"){
							colModelList[kvci].width = 60;
							colModelList[kvci].fixed = true;
						}
						else if(colModelList[kvci].name==="kempVsSel"){
							colModelList[kvci].hidden = !(OPMClient.ApplicationController.showSuppressAlarm);
						}
					}
				}
			}
			var defaultOptions = {};
			defaultOptions.colNamesList1 = snapshotData.subgrid.colNamesList;
			defaultOptions.colModelList1 = snapshotData.subgrid.colModelList;
			defaultOptions.subGridFunction= snapshotData.subgrid.subGridFunction;
			defaultOptions.onselectfunction= snapshotData.subgrid.onselectfunction;
			defaultOptions.Data = (jsonData.apList !== undefined)?jsonData.apList:(jsonData.result!== undefined)?jsonData.result :gridData;
			defaultOptions.subGrid=subGrid;
			defaultOptions.minRowsPerPage=100;
			defaultOptions.pagination=true;
			defaultOptions.isSnapshotGrid=true;
			defaultOptions.snapId=snapDetails.snapid;
			defaultOptions.reload=false;
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};


			var sendObj = {};
			sendObj.gridId = "opm_DeviceSnapList"+snapDetails.snapid;//NO I18N
			sendObj.pagerId = "opm_DeviceSnapPager"+snapDetails.snapid;//NO I18N
			sendObj.data = gridData;
			sendObj.showAll = false;
			sendObj.defaultOptions = defaultOptions;
			sendObj.colModels = colModelList;
			sendObj.colNames = colNamesList;
			sendObj.captionTitle = "";
			sendObj.gridNavigator = "";
			sendObj.onSelectFunction = onselectfunction;
			sendObj.page = "";
			if(currentWidgetData.name==="webclient.opm.kemplb.vs.childlist"){//NO I18N
				sendObj.className = "opm_jqGridUI rowOverflowVisible kempChildList";//NO I18N
				sendObj.showAll = false;
				defaultOptions.noPaginationShowAll = true;
				defaultOptions.sortable = false;
				sendObj.onSelectFunction = snapshotData.onselectfunction;
			}
			if(currentWidgetData.name==="opm.sdwan.sites"){//NO I18N
				//sendObj.className = "opm_jqGridUI rowOverflowVisible kempChildList";//NO I18N
				defaultOptions.pagination = true;
				defaultOptions.sortable = false;
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=false;
				defaultOptions.minRowsPerPage = 100;
				sendObj.onSelectFunction = snapshotData.onselectfunction;
				if(window.OPM.isAuthorized && !window.OPM.isCentralServer)
				{
					defaultOptions.multiselect = true;
				}
			}
			if(self!==undefined && self!==null && !currentWidgetData.ondemandWidget && gridData.length!=0){
				self.set('showGrid',true);//NO I18N
				self.set('widgetData.noData',false);//NO I18N
				self.set('widgetData.gridDataArray',sendObj);//NO I18N
				self.set('tblStyle','overflow-y:auto;height:inherit !important;overflow-x:hidden;');//NO I18N
			}
			else{
				self.set('showGrid',false);//NO I18N
				self.set('widgetData.noData',true);//NO I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//NO I18N
			}
		}
		else{
			if(self!==undefined && self!==null){
			    self.set('showGrid',false);//NO I18N
		    }
		}
	},
	actions:
	{
	  	subChildActions: function(functionType, functionName)
	  	{
	  		this.sendAction('action',functionType,functionName);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmWirelessSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-wireless-summary",//No I18N
	didInsertElement:function()
	{
		var self = this;
		var isWidgetPosReload = false;
		if(self.snapshotObj !== undefined)
		{
			if(window.OPM.isNewSnapshotPage){
				self.set('widgetData.sizey',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
				//self.set('adjustedHeight',16);//No I18N
			}else{
			self.set('widgetData.sizey',12);//No I18N
			}
			isWidgetPosReload = true;
			if(window.OPM.showCustomFieldsInSummaryWidget)
             {
                 var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getDeviceNotes',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
                 var data = {name:OPMClient.InventoryDeviceDetailsController.deviceName};
                 var response = opm_ajaxGetResponse(url,data);
                 if(response!==undefined && response.length>0)
                 {
                     this.set("customFieldValues",response);//No I18N
                 }
             }
         }
     },
     customFieldValuesObserver:function(){
         Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
             var adjustedHeight = 17;
             if(adjustedHeight!==undefined){
                 adjustedHeight = snapHeightCalculation[17]-50;
                 $('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
                 $('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar({//No I18N
                     axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
                 });
             }
         });
     }.observes('customFieldValues'),//No I18N
     actions:{
         summaryEdit: function(snapObj){
             redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
         },
         loadAppendUrl:function(url){
             loadAppendUrl(url);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmWirelessSummaryDetailsComponent = Ember.Component.extend({
	classNames:['com_SummaryDetails'],//No I18N
	dualStatusIcon: function(){
		var statusNum = this.get('jsonData.statusNum') !== undefined ? this.get('jsonData.statusNum') : this.get('snapshotObj.statusNum');
		var state = this.get('jsonData.state') !== undefined ? this.get('jsonData.state') : this.get('snapshotObj.state');
		if(window.OPM.isNewStatusPropagation && state !== undefined && statusNum !== undefined) {
			var availClass = opm_getStateCls(state);
			return '--fault-severity icon-status --dual-status status-' + statusNum + ' ' + availClass;//No I18N
		}
		return '--fault-severity icon-status';//No I18N
	}.property('jsonData.statusNum', 'jsonData.state', 'snapshotObj.statusNum', 'snapshotObj.state'), //No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:280,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		if(!window.OPM.isCentralServer && this.snapshotObj.statusPollEnabled !== undefined && !this.snapshotObj.statusPollEnabled)
		{
			OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"DEVICESNAPSHOT_STATUSPOLLING_DISABLED"});//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');
		$('#'+this.elementId).find('*').remove();
	},
	actions:{
		changeDevicePasswordDetails: function(){
			changeDevicePasswordDetails();
			opmUserStats('snapshot_changeCredential');//No I18N
		},
		summaryEdit: function(snapObj){
			redirectSnapShot('SummaryEdit',snapObj.snapType,snapObj.deviceName);//No I18N
		},
		redirectSnapshot: function(deviceName){
			redirectSnapShot('',"MonitoringDevice",deviceName);//No I18N
		}
	}
});

OPMClient.OpmTenantSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-tenant-summary",//No I18N
	didInsertElement:function()
	{
		var widgetData = this.get('widgetData'); //No I18n
		this.set('controller.jsonData',widgetData.apiData.tenantInfo); //No I18n
		if(window.OPM.isNewSnapshotPage){
			this.set('widgetData.sizey',13);//No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		}
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy'); //No I18n
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:200,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	actions:{
		redirectACISnapShot: function (deviceName)
		{
			redirectSnapShot('',"MonitoringDevice",deviceName);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmDiscoverInterfacesComponent = Ember.Component.extend({
	templateName: "components/opm-discover-interfaces",//No I18N
	didInsertElement:function(){
		var self=this;
		$('.intfDiscFormHolder .accordion1.oneView .accordion1__nav').off('click');
		$('.intfDiscFormHolder .accordion1.oneView .accordion1__nav').on('click',function(){
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			$(this).next('.accordion1__cont').slideUp();
		}else{
			$('.accordion1__nav').removeClass('active');
			$('.accordion1__cont').slideUp();
			$(this).addClass('active');
			$(this).next('.accordion1__cont').slideDown();
			}
		});
		self.set('controller.isSearchEnabled',false); //No I18n
		$(".importIntfBtn").prop("disabled", true); //No I18n
		$('.importIntfBtn').css('opacity', '0.6'); //No I18n
		this.set('searchDiscData',[]); //No I18n
	},
	searchInterfaces: function(isNumeric)
	{
		var searchData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/discovery/searchInterfacesDuringShallow',{"searchTerm":trimAll($("#IntfDiscSearch").val()),"isNumeric":isNumeric,"profileID":OPMClient.InterfaceDiscoveryController.profileId}); //No I18n
		if(searchData.length > 0)
		{
			$("#ndGridParent li").hide();
			if($('.errorMsg').is(":visible"))
			{
				$('.errorMsg').hide();
			}
			$("#DiscoveredInterfacesList").jqGrid("GridUnload");//No I18n
			var srchData = [];
			$.each(searchData,function(index,obj)
			{
				opm_loadDiscInterfaces("DiscoveredInterfacesList",obj.data); //No I18n
				$.each(obj.data, function(index, details) 
				{
					srchData.push(details.name);
				});
			});
			this.set('searchDiscData',srchData); //No I18n
		}
		else
		{
			$("#ndGridParent li").hide();
			opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.jqgrid.no.data.found',this)); //No I18n
		}
	},
	intf_searchData: function()
	{
		var grid = $('#DiscoveredInterfacesList');
		var allData = grid.jqGrid('getGridParam', 'data'); //No I18n
		var searchFilter = grid.jqGrid('getGridParam', 'postData').filters; //No I18n
		if (searchFilter) {
		    var parsedFilter = JSON.parse(searchFilter);
		    var searchData = allData.filter(function(item) {
		        return item.someField === parsedFilter.someField;
		    });
		    return searchData;
		}
	},
	isSearchDataAvail: function()
	{
		if($("#gs_ifIndex").val() === "" && $("#gs_ifName").val() === "" && $("#gs_deviceDisplayName").val() === "" && $("#gs_ifDescr").val() === "" && $("#gs_ipAddress").val() === "" && $("#gs_ifSpeed").val() === "") {
			return false;
		} else {
			return true;
		}
	},
	actions:{
		InterfaceDiscovery: function()
		{
			var devName=[];
			var parentNode=[];
			var data = {};
			var grid = $("#DiscoveredInterfacesList.intfDiscAccTab");	//No I18N
			var isSelectAll = $("#cb_DiscoveredInterfacesList").is(':checked'); //No I18n
			var isSrchSelectAll = this.isSearchDataAvail();
			var data = {"interfaceNames":devName.toString(),"profileID":OPMClient.InterfaceDiscoveryController.profileId}; //No I18n

			var selRowIds = gridSelectedRows["#DiscoveredInterfacesList"]; //No I18n
			if(Object.keys(selRowIds).length > 0)
			{
				$.each(selRowIds, function(index,details){
					devName.push(details.name);
				});
			}
			data.interfaceNames = devName.toString();

			/*if(isSelectAll && !isSrchSelectAll)
			{
				this.addAlltheInterfaces();
				return false;
			}*/			
			if(devName.length === 0)
			{
				opmAlertPopUp('',Ember.I18n.t('opm.discoveredintf.addingalert',this),'','','','','','');//No I18N
				return false;
			}
			else
			{
				var importInterfaces = function(response)
				{
					if(response !== undefined && !$.isEmptyObject(response)){
						
						if(response.result !== undefined)
						{
							opm_infoMsgs("successMsg",response.result.message);//No I18N
							//$('#intfdisc_infoMsg').text(Ember.I18n.t('opm.intfdiscovery.infomsg.afteradd',this)); //No I18n
							var grid = $("#DiscoveredInterfacesList.intfDiscAccTab");	//No I18N
							var selRowIds = gridSelectedRows["#DiscoveredInterfacesList"]; //No I18n

							if(Object.keys(selRowIds).length > 0 /*&& data.interfaceNames !== "All"*/)
							{
								var totalPages = parseInt(grid.getGridParam('lastpage')); //No I18n
								var selectedRowsId = Object.keys(gridSelectedRows["#DiscoveredInterfacesList"]); //No I18n
								for (var page = 1; page <= totalPages; page++) {
									grid.setGridParam({ page: 1 }).trigger('reloadGrid'); //No I18n
									for (var i = 0; i <= selectedRowsId.length; i++) {
										grid.jqGrid('delRowData', selectedRowsId[i]); //No I18n
								    }
								}
								grid.jqGrid('setGridParam', { page: 1 }).trigger('reloadGrid'); //No I18n
								var totalLen = grid.jqGrid('getGridParam', 'data'); //No I18n
				                if(totalLen.length === 0)
				                {	
				                	$("#DiscoveredInterfacesList").jqGrid("GridUnload"); //No I18n
				                	opm_loadloadInterfacesList("DiscoveredInterfacesList",[]); //No I18n
				                }
				                OPMClient.InterfaceDiscoveryController.set('isIntfAdded', true); //No I18n
				                Ember.run.schedule("afterRender", function() { //No I18N
									$('.interface-discovery-status .infoMssg').addClass('success'); //No I18n
	        						$('.interface-discovery-status .infoMssg').removeClass('danger'); //No I18n	
								});
							}
							else
							{
								$("#DiscoveredInterfacesList").jqGrid("GridUnload"); //No I18n
								opm_loadloadInterfacesList("DiscoveredInterfacesList",[],true); //No I18n
							}
							gridSelectedRows["#DiscoveredInterfacesList"] = {}; //No I18n
						}
						if(response.error !== undefined)
						{
							opm_infoMsgs("errorMsg",response.error.message);//No I18N
						}
					}
				}
				OPMClient.InterfaceDiscoveryController.set('isAnyInterfaceSelected',true);//No I18N
				opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+"/discovery/importInterfaces",data,Ember.I18n.t('webclient.credential.snmp.pleasewait',this),importInterfaces); //No I18N
			}
		},
		search: function()
		{
			var self=this;
			$('.discoveryTableTopInfo > .nav').toggleClass('active'); //No I18n
			$("#IntfDiscSearch").focus();
			$("#IntfDiscSearch").keypress(function (e)
			{
				$(".deviceSearchBox .searchBoxClose").show();
	            var key = e.keyCode || e.charCode || 0;
	            if (key === $.ui.keyCode.ENTER)
	            {
	            	var isNumeric = !isNaN($("#IntfDiscSearch").val());
	            	if($("#IntfDiscSearch").val() === "")
	            	{
	            		isNumeric = false;
	            	}
					self.searchInterfaces(isNumeric);
	            }
       	 	});
    		$(".deviceSearchBox .searchBoxClose").off("click");
			$(".deviceSearchBox .searchBoxClose").on("click",function(e){
				$("#IntfDiscSearch").val("");
				self.searchInterfaces(false);
			});
		},
		goTosettingsPage: function()
		{
			if(OPMClient.InterfaceDiscoveryController.interfaceDiscoveryData.length > 0 /*&& !OPMClient.InterfaceDiscoveryController.isAnyInterfaceSelected*/){

				var okCallBack = function() {
					settingsGlobalRoute.transitionTo("Settings.Discovery.InterfaceDiscovery.Index"); //No I18N
				}
				opmAlertPopUp('',Ember.I18n.t('window.opm.exitIntfdiscovery.confirm',this),'',okCallBack,'','','','');//No I18N

			}else{
				settingsGlobalRoute.transitionTo("Settings.Discovery.InterfaceDiscovery.Index"); //No I18N
			}
		},
		backToDiscoveryPage: function()
		{
			if(!window.OPM.isMSPCentral)
			{
				stopInterfaceDiscovery();
				settingsGlobalRoute.transitionTo("Settings.Discovery.InterfaceDiscovery.Index"); //No I18N
			}
		}
	},
	willDestroyElement:function()
	{
		OPMClient.InterfaceDiscoveryController.set('isAnyInterfaceSelected',false);//No I18N
		OPMClient.InterfaceDiscoveryController.set('isIntfAdded', false); //No I18n
		OPMClient.InterfaceDiscoveryController.set('isIntfDiscDone', false); //No I18n
	}
});
OPMClient.OpmRerenderInterfaceDiscoveryComponent = Ember.Component.extend({
	didInsertElement:function(){

		$("#InterfaceDiscoveryForm .select2").select2();
		$("#InterfaceDiscoveryForm .deviceCriteria").select2({placeholder:Ember.I18n.t('webclient.admin.re.selcriteria',this)}); //No I18n

		$("#InterfaceDiscoveryForm .deviceCond").select2({placeholder:Ember.I18n.t('opm.selectcondition',this)}); //No I18n
		$("#InterfaceDiscoveryForm .intfCriteria").select2({placeholder:Ember.I18n.t('webclient.admin.re.selcriteria',this)}); //No I18n
		$("#InterfaceDiscoveryForm .intfCond").select2({placeholder:Ember.I18n.t('opm.selectcondition',this)}); //No I18n

		//retain selected logic operation.
		$('input[name=dev_logicalForm][value="'+devLogicOper+'"]').prop('checked',true); //No I18n
		$('input[name=intf_logicalForm][value="'+intfLogicOper+'"]').prop('checked',true); //No I18n

		//Rerendering device & interface criteria grid.
		if(intfDisc_DevCriteria.length > 0)
		{
			loadIntfCriteriaTable("#DevCriteriaList","#DevCriteriaPager",intfDisc_DevCriteria); //No I18n
		}
		if(intfDisc_IntfCriteria.length > 0)
		{
			loadIntfCriteriaTable("#IntfCriteriaList","#IntfCriteriaPager",intfDisc_IntfCriteria); //No I18n
		}

	}
});
OPMClient.OpmImportInterfacesComponent = Ember.Component.extend({
	templateName: "components/opm-import-interfaces",//No I18N
	didInsertElement:function(){
		$('.OpMToolBar').hide();
		//opm_loadloadInterfacesList("DiscoveredInterfacesList",[]); //No I18n
		OPMClient.InterfaceDiscoveryController.set('isIntfDiscDone', false); //No I18n
	},
	willDestroyElement:function()
	{
		OPMClient.InterfaceDiscoveryController.set('isAnyInterfaceSelected',false);//No I18N
		OPMClient.InterfaceDiscoveryController.set('isIntfAdded', false); //No I18n
		OPMClient.InterfaceDiscoveryController.set('isIntfDiscDone', false); //No I18n
	}
});

/********* Association Device Component *******************/

OPMClient.OpmDeviceAssociationComponent = Ember.Component.extend({
	templateName: "components/opm-device-association",//No I18N
	classNames:['assoComponent'],//No I18N
	didInsertElement:function(){
		var assoDetails = this.assoDetails;
		if(assoDetails!==undefined){
			//calculateMultiSelBoxHolderHeight(this.elementId,assoDetails.availHeight);
			var elementId = this.elementId;
			var prev = -1;
		}
	},
	actions:{
		opm_leftToRight:function()
		{
			var self = this;
			$.each($("#opm_availDevList option:selected"), function(){
            	self.assoDetails.selectedDevList.pushObject({'displayName':$(this).text(),"value":$(this).attr("data-value")});//No I18N
            	$(this).remove();
        	});


		},
		opm_rightToLeft:function()
		{
			var self = this;
			$.each($("#opm_selectDevList option:selected"), function(){
            	self.assoDetails.availableDevList.pushObject({'displayName':$(this).text(),"value":$(this).attr("data-value")});//No I18N
            	$(this).remove();
        	});
		}
	},
	reloadAssoObserver: function(){
  		this.rerender();
  	}.observes('assoDetails'),//No I18N
  	willDestroyElement:function()
  	{
  		OPMClient.ApplicationController.assoDetails = {};
        $('#'+this.elementId).find('*').remove();
    }
});



OPMClient.OpmDiscoverDevicesComponent = Ember.Component.extend({
	templateName: "components/opm-discover-devices",//No I18N
	didInsertElement:function(){
		var ndSelf = this;
		this.set("profileId",OPMClient.NetworkDiscoveryController.profileId);//No I18N
		var remotePollerName = OPMClient.NetworkDiscoveryController.discPollerName;
		if(remotePollerName !== undefined && remotePollerName !== ""){
    		var headTxt = (Ember.I18n.t('webclient.discovery.dev.discovered',this)+' '+Ember.I18n.t('webclient.fault.toolbar.from',this)+' '+remotePollerName); //No I18N
			var dispTxt = (headTxt.length > 50) ? headTxt.substring(0,45)+"...":headTxt; //No I18N
			$('.discoveryTableTopInfo .leftTitle').text(dispTxt);//No I18N
			$('.discoveryTableTopInfo .leftTitle').attr('title', headTxt);//No I18N
		}

//		$(this).next('.accordion1__cont').slideDown();
		$('.accordion1.oneView .accordion1__nav').off('click');
		$('.accordion1.oneView .accordion1__nav').on('click',function(){
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			$(this).next('.accordion1__cont').slideUp();
		}else{
			$('.accordion1__nav').removeClass('active');
			$('.accordion1__cont').slideUp();
			$(this).addClass('active');
			$(this).next('.accordion1__cont').slideDown();
			}
		});
		OPMClient.NetworkDiscoveryController.set("ignoreCount",0);//No I18N
		OPMClient.NetworkDiscoveryController.set("approveCount",0);//No I18N

        $("#nd_search").keyup(function(e) {
        	var key = e.keyCode || e.charCode || 0;
        	 var searchTxt = this.value;
        	 $(".deviceSearchBox .searchBoxClose").show();
            if(key === $.ui.keyCode.ENTER && trimAll(searchTxt) !== "")
            {
            	ndSelf.set("searchFlag",true);//No I18N
            	searchNDiscDevices(searchTxt);
            	opm_gridCustomSearchExDev(searchTxt);
            }
            else if(this.value === "" && ndSelf.get("searchFlag"))
			{
				ndSelf.set("searchFlag",false);//No I18N
				searchNDiscDevices(searchTxt);
				opm_gridCustomSearchExDev(searchTxt);

			}

			$(".deviceSearchBox .searchBoxClose").off("click");
			$(".deviceSearchBox .searchBoxClose").on("click",function(e){
				$("#nd_search").val("");
				ndSelf.set("searchFlag",false);//No I18N
				searchNDiscDevices('');
				$(".deviceSearchBox .searchBoxClose").hide();
				opm_gridCustomSearchExDev('');

			});

		});

	},
	actions:{
		ndApproveDevices:function(type)
		{
			var devList = [];
			var profileId = "";
		    var selRwCnt = 0;
			var tableDetails = [];
			$("#ndGridParent li").each(function(id,elm){
				var gd_id = "#ndGrid_"+$(elm).attr("data-vendorid");//No I18N
				var selRws = $(gd_id).jqGrid('getGridParam','selarrrow');    //No I18N
				if(selRws !== "" && selRws !== undefined){
					selRwCnt = (selRwCnt+selRws.length);
		            $.each(selRws, function(index,rowId){
		                var name =  $(gd_id).jqGrid('getCell', rowId, 'name'); //No I18N
		                profileId = $(gd_id).jqGrid('getCell', rowId, 'profileId'); //No I18N
		                devList.push(name);
						tableDetails.push({rowId: rowId, gridId: gd_id});
		            });
		        }
			});

			var ndData = {};
			ndData.deviceList = devList.toString();
			ndData.profileId = profileId;
			opm_ndImportDevActions(ndData,type,selRwCnt,tableDetails);
		},
		stopDiscovery:function()
		{
			/*var devList = [];
			$("#ndGridParent li").each(function(id,elm){
				var gd_id = "#ndGrid_"+$(elm).attr("data-vendorid");//No I18N
				var rws = $(gd_id).getGridParam('data');
				if(rws !== "" && rws !== undefined){
		            $.each(rws, function(){
		                devList.push(this.name);
		            });
		        }
			});

			var data = {profileId:OPMClient.NetworkDiscoveryController.profileId,deviceList:devList.toString()};
			var discoveryUrl = window.OPM.apiUrlPattern + '/v2/discovery/stopDeviceDiscovery'; //No I18N
			opm_ajaxPostRequestWithMsg(discoveryUrl,data,'','');//No I18N*/
			//opm_transitionToParentRoute("Settings.Network.Discovery","Profile");//No I18N
		},
		search: function()
		{
			$('.discoveryTableTopInfo > .nav').toggleClass('active'); //No I18n
			if($('.discoveryTableTopInfo > .nav').hasClass('active'))
			{
				$("#nd_search").focus();

			}
		}
	},
	willDestroyElement:function()
	{
		if(!window.OPM.isMSPCentral && !window.OPM.isMSPProbe)
		{
			if(this.get("profileId") !== "")
			{
				var data = {profileId:this.get("profileId")};//No I18N
			}
			else
			{
				var data = {profileId:nd_profileId};//No I18N
			}
			var discoveryUrl = window.OPM.apiUrlPattern + '/v2/discovery/stopDeviceDiscovery'; //No I18N
			opm_ajaxPostRequestWithOutAsync(discoveryUrl,data);//No I18N
		}
		OPMClient.NetworkDiscoveryController.set("gridList",[]);//No I18N
		OPMClient.NetworkDiscoveryController.set("enableImportDevices",false);//No I18N
		OPMClient.NetworkDiscoveryController.set("profileId","");//No I18N
		OPMClient.NetworkDiscoveryController.set("ignoreCount",0);//No I18N
		OPMClient.NetworkDiscoveryController.set("approveCount",0);//No I18N
		OPMClient.NetworkDiscoveryController.set("discPollerName","");//No I18N
	}
});

OPMClient.OpmImportDevicesComponent = Ember.Component.extend({
	templateName: "components/opm-import-devices",//No I18N
	didInsertElement:function(){
		var self = this;
		var gridObj = self.get("grid");
		var rowlen = $("#"+gridObj.gridId).jqGrid('getRowData').length;
		 if((rowlen === 0 || rowlen == undefined || rowlen == 'undefined'))
        {
            opmLoadDiscoveredDevices(gridObj.gridId,[gridObj.list]);
            $(".accordion1 ul li[data-vendorid='"+gridObj.vendorId+"'] .deviceCount").text(1);
        }

		$('.accordion1.oneView .accordion1__nav').off('click');
		$('.accordion1.oneView .accordion1__nav').on('click',function(){
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			$(this).next('.accordion1__cont').slideUp();
		}else{
			$('.accordion1__nav').removeClass('active');
			$('.accordion1__cont').slideUp();
			$(this).addClass('active');
			$(this).next('.accordion1__cont').slideDown();
			}
		});
	},
	reloadDisGridObserver: function(){
  	//	this.rerender();
  	}.observes('grid'),//No I18N
	actions:{
		},
	willDestroyElement:function()
	{
		//OPMClient.NetworkDiscoveryController.set("gridList",[]);
		//OPMClient.NetworkDiscoveryController.set("enableImportDevices",false);
	}
});

OPMClient.ApplyCriteriaComponent = Ember.Component.extend({
	templateName: "components/apply-criteria", //No I18N
	didInsertElement: function(){
		var isEdit = false;
		if(this.existingCriteriaData!==undefined || !$.isEmptyObject(this.existingCriteriaData) || OPMClient.ReportsDetailsController.isEditAdvanceReport){
			isEdit = true;
		}
		if(isEdit){
			this.constructCriteria();
		}else{
			this.set("criteria",[]); //No I18N
			this.addNewCriteriaObj();
		}
		var filtersToRender = this.get('filterArray');
		if(this.pageId!==undefined && this.pageId==="AdvRep"){
			filtersToRender = OPMClient.ReportsArrayController.filterArray;
		}
		this.set('filtersToRender',filtersToRender);//NO I18N
		this.set('textOperators',getTextOperators());//No I18N
		this.set('numericOperators',getNumericOperators());//No I18N
		this.set('filterDataEnabled',true);//NO I18N
	},
	getCriteriaList:function() {
		return jQuery.extend(true,[],this.get("criteria")); //No I18N
	},
	filterDataObserver: function(){
		this.rerender();
	}.observes('filterArray'),//No I18N
	filtersToRenderObserver: function(){
		this.set('filtersToRender',OPMClient.ReportsArrayController.filterArray);//NO I18N
		var criteria  = this.get("criteria");
		if(criteria === undefined || criteria.length<1){
			this.addNewCriteriaObj();
		}
	}.observes('OPMClient.ReportsArrayController.filterArray'),//No I18N
	addNewCriteriaObj:function() {
		var criteriaList = this.getCriteriaList();
		if(criteriaList.length > 0) {
			criteriaList[criteriaList.length-1].showAddButton = false;
			criteriaList[criteriaList.length-1].showDeleteButton = true;
			criteriaList[criteriaList.length-1].showAndOr = true;
			this.set('showCriteriaPattern',true);//No I18N
		}
		var pageId = this.get("pageId");
		criteriaList.pushObject({
			index:criteriaList.length,
			rowNumber:criteriaList.length+1, //No I18N
			showAddButton:true,
			showDeleteButton:true,
			showAndOr:false,
			filter:0,
			filterType:"",
			filterTypeValue:"=",
			filterList:"",
			filterTextValue:"",
			andOr:"AND",//No I18N
			valueTypeNeeded:false,
			columnIdFromList:"--",
			pageId:pageId
		});
		this.set("criteria",criteriaList); //No I18N
		if(OPMClient.ReportsArrayController.criteriaList=== undefined){
			OPMClient.ReportsArrayController.criteriaList={};
		}
		OPMClient.ReportsArrayController.criteriaList[pageId] = criteriaList;
		Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
			$(".matchFilterRow .select2").select2();
		});
		if(criteriaList.length > 1){
			loadCriteriaPattern(criteriaList,"add",criteriaList.length-1);//No I18N
		}else{
			this.set('showCriteriaPattern',false);//No I18N
			$("#criteriaPattern_"+pageId).val("");//No I18N
		}
	},
	constructCriteria:function() {
		var criteriaData = this.get("existingCriteriaData");
		if(criteriaData===undefined || $.isEmptyObject(criteriaData)){
			criteriaData = OPMClient.ReportsArrayController.criteriaData;
			this.set("existingCriteriaData",criteriaData);//NO I18N
		}
		if(criteriaData&&criteriaData.filters){
			var filterCount=(criteriaData.filterCount)
			var data=criteriaData.filters;
			var pattern=criteriaData.filtersPattern;
			if(pattern===undefined){
				pattern=OPMClient.ReportsArrayController.criteriaPattern;
			}
			var list = this.get('filterData');
			if(this.pageId!==undefined && this.pageId==="AdvRep"){
				list = OPMClient.ReportsArrayController.list;
			}
			var criteriaList = this.getCriteriaList();
			var pageId = this.get("pageId");
			var operators = ['>', '<', '>=', '<='];
			var textOperators = ['contains', 'notcontains', 'startswith', 'endswith'];//NO I18N
			$.each(data,function(key,criteria){
				$.each(criteria,function(k,crit){
					var filterIndex=(list).map(function(e){return e.columnId;}).indexOf(crit.columnId);
					if(filterIndex<0){
						return;
					}
					if(crit.isPercentile) {
                        crit.valueType=OPMClient.ReportsArrayController.selectedPercentileValue;
                    }
					criteriaList[crit.filterId-1]=({
						index:crit.filterId-1,
						rowNumber:crit.filterId, //No I18N
						showAddButton:(crit.filterId==filterCount)?true:false,
						showDeleteButton:true,
						showAndOr:(crit.filterId==filterCount)?false:true,
						filter:filterIndex,
						selectedColumnId:crit.columnId,
						filterType:list[filterIndex].columnType,
						filterTypeValue:crit.operator,
						showInput:operators.indexOf(crit.operator) !== -1,
						filterList:list[filterIndex].filterValues,
						filterValue: list[filterIndex].filterValues != undefined ? crit.value : "",
						filterTextValue: list[filterIndex].filterValues == undefined ? (operators.indexOf(crit.operator) !== -1) ? crit.value[0] : crit.value : crit.value,
						filterValuesPopulator:list[filterIndex].filterValuesPopulator,
						populateFilterValues:list[filterIndex].filterValuesPopulator===undefined?false:true,
						valueTypeNeeded:list[filterIndex].valueTypeNeeded===undefined?false:list[filterIndex].valueTypeNeeded,
						andOr:"AND",//No I18N
						numericOperators:list[filterIndex].isEmptyFilter?getNumericOperators().concat(getEmptyOperators()):getNumericOperators(),
						textOperators:list[filterIndex].isEmptyFilter?getTextOperators().concat(getEmptyOperators()):getTextOperators(),
						disable:(crit.operator=="empty"||crit.operator=="notempty")?true:false,//No I18N
						selectedValueType:crit.valueType,
						columnIdFromList:crit.columnId,
						pageId:pageId,
						showAdditionalOperators:list[filterIndex].showAdditionalOperators===undefined?true:list[filterIndex].showAdditionalOperators
					});
					var operatorsMap =  getRequiredOperators(list,filterIndex,pageId);
					if(operatorsMap !== undefined){
						if(operatorsMap.numericOperators!==undefined){
							criteriaList[crit.filterId-1].numericOperators=operatorsMap.numericOperators;
						}
						else if(operatorsMap.textOperators!==undefined){
							criteriaList[crit.filterId-1].textOperators=operatorsMap.textOperators;
						}
					}
					//multi input box or single input box instead of dropdown box as the opertor choosen is different
					if(list[filterIndex].showAdditionalOperators===true && list[filterIndex].filterValues) {
						if( textOperators.indexOf(crit.operator) !== -1){
							criteriaList[crit.filterId-1].showMultiInput = true;
						} else {
							criteriaList[crit.filterId-1].showMultiInput = false;
						}
					}
					if(list[filterIndex].filterValuesPopulator==='timePicker') {
						//convert seconds to readable format ..
						var criteriaObject = criteriaList[crit.filterId-1];
						var durationFieldValues={
							days:0,
							hours:0,
							minutes:0
						};
						var totalMinutes = crit.value/(60);
						if(totalMinutes>59) {
							var exactMinsComponent = (totalMinutes%(60))
							var totalHours = parseInt(totalMinutes/60);
							if(totalHours>23){
								var exactHoursComponent = (totalHours%(24));
								var totalDays = parseInt(totalHours/(24));
								durationFieldValues.minutes = exactMinsComponent;
								durationFieldValues.hours = exactHoursComponent;
								durationFieldValues.days = totalDays;
							} else {
								durationFieldValues.minutes = exactMinsComponent;
								durationFieldValues.hours = totalHours;
							}
						} else {
							durationFieldValues.minutes=totalMinutes;
						}
						criteriaObject.timePicker=durationFieldValues;
					}
				})
			});

			if(criteriaList.length<1)
			{
				this.set("criteria",[]); //No I18N
				this.addNewCriteriaObj();
			}
			else{
				this.set("criteria",criteriaList);//No I18N
					if(OPMClient.ReportsArrayController.criteriaList=== undefined){
					OPMClient.ReportsArrayController.criteriaList={};
				}
				OPMClient.ReportsArrayController.criteriaList[pageId] = criteriaList;
				if(criteriaList.length > 1){
					this.set('showCriteriaPattern',true);//No I18N
				}else{
					this.set('showCriteriaPattern',false);//No I18N
				}
				var pageId = this.get("pageId");
				Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
					$(".matchFilterRow .select2").select2();
					$("#criteriaPattern_"+pageId).val(pattern);//No I18N
				});
				if(pattern){
					this.reConstructPattern(this,pattern);
				}
			}
		}else{
			this.set("criteria",[]); //No I18N
			this.addNewCriteriaObj();
		}
	},
	reConstructPattern:function(self,criteriaPattern){
		setTimeout(function(){
			var cNum = criteriaPattern.match(/\d+/g);
			var andOr=  criteriaPattern.match(/[a-zA-Z]+/g);
			var criteria = self.get("criteria");//No I18N
			var pageId = self.get("pageId");
			if(andOr){
			    for(i=0;i<andOr.length;i++){
			        $("input[name=andOr"+(cNum[i]-1)+"_"+pageId+"]").removeAttr("checked");
	        		$("input[name='andOr"+(cNum[i]-1)+"_"+pageId+"'][id='"+andOr[i]+(cNum[i]-1)+"_"+pageId+"']").prop("checked",true);   //No I18N
	        	    criteria[i].andOr=andOr[i];
			    }
			   self.set("criteria",criteria);//No I18N
				if(OPMClient.ReportsArrayController.criteriaList=== undefined){
					OPMClient.ReportsArrayController.criteriaList={};
				}
				OPMClient.ReportsArrayController.criteriaList[pageId] = criteria;
			}
		});
	},
	actions:{
		hideEditCriteria:function() {
			var pageId = this.get("pageId");
			$(".deleteBtn").prop('disabled',true);
			$(".btnPlus").prop('disabled',true);
			$("#criteriaPattern_"+pageId).attr('readonly', false);
			$("#criteriaPattern_"+pageId).focus();
			$("#criteriaPattern_"+pageId).css('cursor', 'text');//NO I18N
			$("#editPattern_"+pageId).hide();
			$("#savePattern_"+pageId).show();
			$("#resetPattern_"+pageId).show();
			this.set('criteriaPattern',$("#criteriaPattern_"+pageId).val());//NO I18N
		},
		showEditCriteria:function() {
			var pageId = this.get("pageId");
			$("#criteriaPattern_"+pageId).attr('readonly', true);
			$("#criteriaPattern_"+pageId).css('cursor', 'default');
			$("#editPattern_"+pageId).show();
			$("#savePattern_"+pageId).hide();
			$("#resetPattern_"+pageId).hide();
			$(".deleteBtn").prop('disabled',false);
			$(".btnPlus").prop('disabled',false);
		},
		saveCriteriaPattern:function() {
			var pageId = this.get("pageId");
			var criteriaList = this.getCriteriaList();
			var criteriaPattern = $("#criteriaPattern_"+pageId).val().toUpperCase();
			var arr = criteriaPattern.split(/(\(|\)|\d+)/g),operArr = [], prevNum = 0 ,brackets = [],noOfRows = (criteriaList).length,bracketCount = 0 ;
			for(var i = 0; i<arr.length;i++){
				if(arr[i].length == 0){
					continue;
				}else if(arr[i] === ''){
					continue;
				}else if(arr[i] === '('){
					brackets.push('(');
					bracketCount++;
				} else if(arr[i] === ')'){
					var last = brackets.pop();
					if(last === undefined ){
						addFieldCriteriaValidation(pageId);
						return;
					}
				} else if(arr[i] === 'AND' ||arr[i] === 'OR'){
					operArr.push(arr[i]);
				} else if(isNumber(arr[i])){
					if(Number(arr[i]) === (prevNum+1)){
						prevNum++;
					}
					else{
						addFieldCriteriaValidation(pageId);
						return;
					}
				} else{
					addFieldCriteriaValidation(pageId);
					return;
				}
			}
			if(prevNum !==  noOfRows || (prevNum -1) !== operArr.length || brackets.length >0 ){
				addFieldCriteriaValidation(pageId);
				return;
			}
			var check = criteriaPattern.match(/\)\(/g);
			if(check !== null && check !== undefined && check.length>0){
				addFieldCriteriaValidation(pageId);
				return;
			}
			var cNum=criteriaPattern.match(/\d+/g);
			var andOr=criteriaPattern.match(/[a-zA-Z]+/g);
			for(i=0;i<andOr.length;i++){
				$("input[name=andOr"+(cNum[i]-1)+"_"+pageId+"]").removeAttr("checked");
				$("input[name='andOr"+(cNum[i]-1)+"_"+pageId+"'][id='"+andOr[i]+(cNum[i]-1)+"_"+pageId+"']").prop("checked",true);   //No I18N
				criteriaList[i].andOr = andOr[i];
			}
			if(OPMClient.ReportsArrayController.criteriaList=== undefined){
				OPMClient.ReportsArrayController.criteriaList={};
			}
			OPMClient.ReportsArrayController.criteriaList[pageId] = criteriaList;
			this.set('criteria',criteriaList);//No I18N
			$(".deleteBtn").prop('disabled',false);
			$(".btnPlus").prop('disabled',false);
			this.send('resetCriteriaPattern');//NO I18N
		},
		resetCriteriaPattern:function(isReset) {
			var pageId = this.get("pageId");
			var criteriaList = this.getCriteriaList();
			if(isReset){
				loadCriteriaPattern(criteriaList,"reset");//No I18N
				$("#criteria_"+pageId).val(criteriaList);
			}
		   this.send('showEditCriteria');//NO I18N
		   if($("#criteriaPattern_"+pageId).hasClass('validateField') || $("#criteriaPattern_"+pageId).hasClass('error')){
			   $("#criteriaPattern_"+pageId).removeClass('validateField');
			   $("#criteriaPattern_"+pageId).removeClass('error');
		   }
		   	Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
				$('.reportCriteria .filter').select2();
			});
		},
		childActions:function(functionName,param1){
			this.send(functionName,param1);
		},
		addCriteria:function() {
			var pageId = this.get("pageId");
			var criteriaList = this.getCriteriaList();
			if($("#criteria"+criteriaList[criteriaList.length - 1].index+"_"+pageId+" .filterTextValue")){
				this.set('criteria.filterTextValue',$("#criteria"+criteriaList[criteriaList.length - 1].index+"_"+pageId+" .filterTextValue").val());//NO I18N
			}
			var flag = false;
			for(i=0;i<criteriaList.length;i++){
				flag =validateCriteria(criteriaList[i]);
				if(!flag) {return;}
			}
			this.addNewCriteriaObj();
			Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
				$("#selectedColumnName"+criteriaList.length+"_"+pageId).focus();
			});
		},
		deleteCriteriaPattern:function(criteriaList,index) {
			var pageId = this.get("pageId");
			var	tempPattern = $("#criteriaPattern_"+pageId).val();
			index = (index<2)?2:index;
			var matches = new RegExp("(("+index+criteriaList[index-2].andOr+")|("+criteriaList[index-2].andOr+index+"))","g");
			var self = this;
			pattern = tempPattern.replace(matches, function(match) {
				self.set("isPatternMatched",true);//No I18N
				return '';
			});
			var isMatched = false;
			if(!this.isPatternMatched){
				matches = new RegExp("(("+index+criteriaList[index-1].andOr+")|("+criteriaList[index-1].andOr+index+"))","g");
				pattern = tempPattern.replace(matches, function(match) {
					isMatched = true;
					return '';

				});
			}
			tempPattern=pattern;
			if(!isMatched){
				matches = new RegExp("(("+"[\)\(]+"+index+"[\)\(]+"+criteriaList[index-2].andOr+")|("+criteriaList[index-2].andOr+"[\)\(]+"+index+"[\)\(]+"+"))","g");
				pattern = tempPattern.replace(matches, function(match) {
					self.set("isPatternMatched",true);//No I18N
					var value = '';
					for( var i=0 ; i<match.length; i++){
						if(match[i]==='(' || match[i]===')'){
							value+=match[i];
						}
					}
					return value;
				});
			}
			tempPattern=pattern;
			matches = new RegExp(/(\d+)/,"g");
			pattern = tempPattern.replace(matches, function(match) {
				if (match > index) {
					return match-1;
				}else{
					return match;
				}
			});
			tempPattern=pattern;
			matches = new RegExp(/([\(]+(\d)[\)]+)|([\(]+[\)]+)|([\(]+(AND|OR)\d[\)]+)|([\(]+\d(AND|OR)[\)]+)/,"g");
			pattern = tempPattern.replace(matches, function(match) {
				var value = match;
				while(value.indexOf('(')!==-1){
					if(value.indexOf(')')!==-1){
						value=value.replace('(','');
						value=value.replace(')','');
					}else{
						return value;
					}
				}
					return value;
			});
			if(!pattern.endsWith(')')){
				pattern ="("+pattern+")";
			}
			$('#criteriaPattern_'+pageId).val(pattern);
			this.set("criteriaPattern",pattern);//NO I18N
		},
		deleteCriteria:function(index) {
			var filterList = OPMClient.ReportsArrayController.list;
			if(OPMClient.ReportsArrayController.list===undefined || OPMClient.ReportsArrayController.list.length===0 ) {
				filterList = this.get('filterData');
			}
			var criteriaList = this.getCriteriaList();
			if(index==criteriaList.length-1 && criteriaList.length!==1){
				criteriaList[index-1].showAndOr=false;
				if((index-1)==0){
					criteriaList[index-1].showAddButton=true;
					// criteriaList[index-1].showDeleteButton=false;
				}else{
					criteriaList[index-1].showAddButton=true;
				}
			}
			this.set("isPatternMatched",false);//No I18N
			if(criteriaList.length > 1){
				this.send("deleteCriteriaPattern",this.get('criteria'),index+1);//NO I18N
			}
			var pageId = this.get("pageId");
			if(criteriaList.length==1){
				criteriaList[index].filter=0;
				criteriaList[index].filterType="";
				criteriaList[index].filterTypeValue="=";
				criteriaList[index].filterList="";
				criteriaList[index].filterTextValue="";
				criteriaList[index].andOr="AND";
				criteriaList[index].filterValuesPopulator=undefined;
				criteriaList[index].populateFilterValues=false;
				criteriaList[index].valueTypeNeeded=false;
				criteriaList[index].columnIdFromList="--";
				criteriaList[index].pageId=pageId;
				criteriaList[index].showAdditionalOperators=true;
				criteriaList[index].selectedColumnId=-1;
			}else{
			     if(index!==0 && this.get("isPatternMatched")){
                    criteriaList[index-1].andOr=criteriaList[index].andOr;
      	         }
				criteriaList.removeAt(index);
			}
			var showFilterBy=false;
			for(var i=index;i<criteriaList.length;i++) {
				criteriaList[i].index = i;
				criteriaList[i].rowNumber = i+1;
			}
			for(var i=0;i<criteriaList.length;i++) {
				for(var j=0;j<filterList.length;j++) {
					if(filterList[j].index===criteriaList[i].filter && filterList[j].columnId==="Availability" && filterList[j].columnName==="Availability") {
						showFilterBy=true;
						break;
					}
				}
			}
			OPMClient.ReportsArrayController.set('availabilityCriteriaSelected',showFilterBy);//No I18N
			for(var i=0;i<OPMClient.ReportsArrayController.selectedColumnsList.length;i++){
                var tableId=OPMClient.ReportsArrayController.selectedColumnsList[i].tableId;
                if(tableId >= OPMClient.ReportsArrayController.perfTableId){
                    showFilterBy=true;
                    break;
                }
            }
			OPMClient.ReportsArrayController.set('showFilterBy',showFilterBy);//No I18N
			checkForOnlyLpvSelect();
			this.set("criteria",criteriaList); //No I18N
			setTimeout(function(){
				$(".matchFilterRow .select2").select2();
			});
			if(criteriaList.length < 2){
				this.set('showCriteriaPattern',false);//No I18N
				$("#criteriaPattern_"+pageId).val("");//No I18N
			}
			if(OPMClient.ReportsArrayController.criteriaList=== undefined){
				OPMClient.ReportsArrayController.criteriaList={};
			}
			OPMClient.ReportsArrayController.criteriaList[pageId] = criteriaList;
			Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
				$("#selectedColumnName"+(index-1)+"_"+pageId).focus();
				$(".matchFilterRow .select2").select2();
			});
		}
	},
	willDestroyElement: function(){
	}
});

OPMClient.ReportCriteriaComponent = Ember.Component.extend({
	templateName: "components/report-criteria", //No I18N
	didInsertElement: function() {
		var pageId = this.get("pageId");
		var criteria = this.get('criteria');
		Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
			if(criteria.valueTypeNeeded!==undefined && (criteria.valueTypeNeeded || criteria.valueTypeNeeded==="true")) {
				$("#filterValueId"+criteria.index+"_"+pageId).show();
				$("#columnNameSelectDiv"+criteria.index+"_"+pageId).removeClass('width40p');
				$("#columnNameSelectDiv"+criteria.index+"_"+pageId).addClass('w-170px');
				$("#selectedValueType"+criteria.index).val(String(criteria.selectedValueType));
			} else {
				$("#filterValueId"+criteria.index+"_"+pageId).hide();
				$("#columnNameSelectDiv"+criteria.index+"_"+pageId).removeClass('w-170px');
				if(!$("#columnNameSelectDiv"+criteria.index+"_"+pageId).hasClass('width40p')) {
					$("#columnNameSelectDiv"+criteria.index+"_"+pageId).addClass('width40p');
				}
			}
		});
	},
	filterTypeValue:function() {
		var filterList = OPMClient.ReportsArrayController.list;
		if(OPMClient.ReportsArrayController.list===undefined || OPMClient.ReportsArrayController.list.length===0 ) {
			filterList = this.get('list');
		}
		var filterTypeValue = this.get('criteria.filterTypeValue');//No I18N
		var operators = ['>', '<', '>=', '<='];
		var textOperators = ['contains','notcontains','startswith','endswith'];//No I18N
		var filter = this.get('criteria.filter');//No I18N
		this.set('criteria.showInput', operators.indexOf(filterTypeValue) !== -1);//No I18N
		//multi input box or single input box instead of dropdown box as the opertor choosen is different
		if(filterList[filter].showAdditionalOperators===true && filterList[filter].filterValues){
			if(textOperators.indexOf(filterTypeValue)!==-1) {
				this.set('criteria.filterTextValue','');//No I18N
				this.set('criteria.showMultiInput',true);//No I18N
			} else {
				this.set('criteria.filterTextValue','');//No I18N
				this.set('criteria.showMultiInput',false);//No I18N
			}
		}
		if(filterTypeValue==="empty" || filterTypeValue==="notempty"){
			this.set('criteria.filterList',undefined);//No I18N
			this.set('criteria.filterTextValue','');//No I18N
			this.set('criteria.disable',true);//No I18N
		}else{
			this.set('criteria.disable',false);//No I18N
			if(filterList[filter].filterValues){
				this.set('criteria.filterList',filterList[filter].filterValues);
				this.set('criteria.filterValue',filterList[filter].filterValues[0].value);//No I18N
				this.set('criteria.filterTextValue','');//No I18N
			}else{
				this.set('criteria.filterList',undefined);//No I18N
				this.set('criteria.filterTextValue','');//No I18N
			}
			if(filterList[filter].filterValuesPopulator!==undefined) {
				this.set('criteria.populateFilterValues',undefined);//No I18N
				this.set('criteria.filterValuesPopulator',undefined);//No I18N
				if(filterList[filter].filterValuesPopulator==="timePicker") {
					var timePickerDefaultValues = {
						'days':0,//NO I18N
						'hours':0,//NO I18N
						'minutes':0//NO I18N
					}
					this.set('criteria.timePicker',timePickerDefaultValues);//NO I18N
					this.set('criteria.filterTextValue','0');//NO I18N
				}
				Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
					this.set('criteria.populateFilterValues',true);//No I18N
					this.set('criteria.filterValuesPopulator',filterList[filter].filterValuesPopulator);
				});
			} else {
				this.set('criteria.populateFilterValues',false);//No I18N
			}
		}
	}.observes('criteria.filterTypeValue'), //No I18N
	actions:{
		subChildActions:function(functionName,param1) {
			this.sendAction('action',functionName,param1); //No I18N
		},
		updateFilter:function(filterId){
			var pageId = this.get("pageId");
			var filterList = OPMClient.ReportsArrayController.list;
			if(OPMClient.ReportsArrayController.list===undefined || OPMClient.ReportsArrayController.list.length===0 ) {
				filterList = this.get('list');
			}

	        var index = this.get('criteria.index');
			var pageId = this.get('pageId');
    		var selectedColumnId = $('#selectedColumnName'+index+"_"+pageId).val();
    		var rowIndex = filterList.map(function(e){return e.columnId;}).indexOf(selectedColumnId);
    		OPMClient.ReportsArrayController.criteriaList[pageId][index].filter=rowIndex;
    		this.set('criteria.filter',rowIndex);//No I18N
			this.set('criteria.selectedColumnId',selectedColumnId);//No I18N

			var filter=this.get('criteria.filter');//No I18N
			if(filterList[filter].columnId==="Availability" && filterList[filter].columnName==="Availability") {
				OPMClient.ReportsArrayController.set('showFilterBy',true);//No I18N
				OPMClient.ReportsArrayController.set('availabilityCriteriaSelected',true);//No I18N
			}
			else {
				var showFilterBy=false;
				var criteriaList=OPMClient.ReportsArrayController.criteriaList[pageId];
				for(var i=0;i<criteriaList.length;i++) {
					for(var j=0;j<filterList.length;j++) {
						if(filterList[j].index===criteriaList[i].filter && filterList[j].columnId==="Availability" && filterList[j].columnName==="Availability") {
							showFilterBy=true;
							break;
						}
					}
				}
				OPMClient.ReportsArrayController.set('availabilityCriteriaSelected',showFilterBy);//No I18N
				for(var i=0;i<OPMClient.ReportsArrayController.selectedColumnsList.length;i++){
					var tableId=OPMClient.ReportsArrayController.selectedColumnsList[i].tableId;
					if(tableId >= OPMClient.ReportsArrayController.perfTableId && tableId != OPMClient.ReportsArrayController.strMonitorId){
						showFilterBy=true;
						break;
					}
				}
				OPMClient.ReportsArrayController.set('showFilterBy',showFilterBy);//No I18N
				checkForOnlyLpvSelect();

			}
			var operatorsMap =  getRequiredOperators(filterList,filter,pageId);
			if(operatorsMap !== undefined){
				if(operatorsMap.numericOperators!==undefined){
					this.set('criteria.numericOperators',operatorsMap.numericOperators);//No I18N
				}
				else if(operatorsMap.textOperators!==undefined){
				this.set('criteria.textOperators',operatorsMap.textOperators);//No I18N
				}
			}
			this.set('criteria.filterType',filterList[filter].columnType);//No I18N
			if(filterList[filter].columnType=="NUMERIC"){
				this.set('criteria.filterTypeValue',this.get('criteria.numericOperators')[0].value);//No I18N
			}else{
				this.set('criteria.filterTypeValue',this.get('criteria.textOperators')[0].value);//No I18N
			}
			var filterTypeValue = this.get('criteria.filterTypeValue');//No I18N
			if(filterTypeValue==="empty" || filterTypeValue==="notempty"){
				this.set('criteria.filterList',undefined); //No I18N
				this.set('criteria.filterTextValue','');//No I18N
				this.set('criteria.disable',true); //No I18N
			}else{
					this.set('criteria.disable',false);//No I18N
			    if(filterList[filter].filterValues){
				    this.set('criteria.filterList',filterList[filter].filterValues);//No I18N
						this.set('criteria.filterValue',filterList[filter].filterValues[0].value);//No I18N
						this.set('criteria.filterTextValue','');//No I18N
			    }else{
				    this.set('criteria.filterList',undefined);//No I18N
				    this.set('criteria.filterTextValue','');//No I18N
			    }
				if(filterList[filter].filterValuesPopulator!==undefined) {
					this.set('criteria.populateFilterValues',true);//No I18N
					this.set('criteria.filterValuesPopulator',filterList[filter].filterValuesPopulator);
					if(filterList[filter].filterValuesPopulator==="timePicker") {
						var timePickerDefaultValues = {
							'days':0,//NO I18N
							'hours':0,//NO I18N
							'minutes':0//NO I18N
						}
						this.set('criteria.timePicker',timePickerDefaultValues);//NO I18N
						this.set('criteria.filterTextValue','0');//NO I18N
					}
				} else {
					this.set('criteria.populateFilterValues',false);//No I18N
				}
				var index = this.get('criteria.index');
				var pageId = this.get('pageId');
				var operators = ['>', '<', '>=', '<='];
				var filterTypeValue = this.get('criteria.filterTypeValue');//No I18N
				this.set('criteria.showInput', operators.indexOf(filterTypeValue) !== -1);//No I18N

				if(filterList[filter].valueTypeNeeded!==undefined && (filterList[filter].valueTypeNeeded || filterList[filter].valueTypeNeeded==="true")) {
					$("#filterValueId"+index+"_"+pageId).show();
					$("#columnNameSelectDiv"+index+"_"+pageId).removeClass('width40p');
					$("#columnNameSelectDiv"+index+"_"+pageId).addClass('w-170px');
					this.set('criteria.valueTypeNeeded',true);//No I18N
					var selectedValueType = $('#selectedValueType'+index+"_"+pageId).val();
					this.set('criteria.selectedValueType',selectedValueType);//No I18N
				} else {
					$("#filterValueId"+index+"_"+pageId).hide();
					$("#columnNameSelectDiv"+index+"_"+pageId).removeClass('w-170px');
					if(!$("#columnNameSelectDiv"+index+"_"+pageId).hasClass('width40p')) {
						$("#columnNameSelectDiv"+index+"_"+pageId).addClass('width40p');
					}
					this.set('criteria.valueTypeNeeded',false);//No I18N
				}
				//set columnIdFromList
				this.set('criteria.columnIdFromList',filterList[filter].columnId);
			}
		},
		andOr:function(index){
			var pageId = this.get('pageId');
			this.set('criteria.andOr',$('input[name="andOr'+index+"_"+pageId+'"]:checked').val());//NO I18N
			loadCriteriaPattern(OPMClient.ReportsArrayController.criteriaList[pageId],"update",index+1,pageId);//No I18N
		},
		enableDisableTimePicker:function(criteriaIndex){
			// var allowDuration = this.get('allowDurationField');
			// if(allowDuration!==undefined && !allowDuration) {
			// 	return;
			// }
			if(this.get("criteria.filterValuesPopulator") !==  "timePicker"){
				return;
			}
			var timePicker = $('#timePicker' + criteriaIndex + "_" + this.get('pageId'));
			if(timePicker.is(":visible")) {
				timePicker.hide();
			} else {
				timePicker.show();
			}
		},
		renderDurationField:function(criteriaIndex) {
			var pageId = this.get('pageId');
			var daysField=$('#advRepDays'+criteriaIndex+"_"+pageId);
			var days = daysField.val();
			var hoursField=$('#advRepHours'+criteriaIndex+"_"+pageId);
			var hours = hoursField.val();
			var minutesField=$('#advRepMinutes'+criteriaIndex+"_"+pageId);
			var minutes = minutesField.val();
			var allowDuration=true;
 			if(days<0 || days.indexOf('.')!=-1 || days.indexOf('-')!=-1 || days==='' || !$.isNumeric(days)) {
				allowDuration = false;
				this.send('modifyErrorMessages','add','#advRepDays'+criteriaIndex+"_"+pageId,'#daysErrorMessage'+criteriaIndex+"_"+pageId,Ember.I18n.t('webclient.generic.GreaterThan',{'param0':'0'}));//NO I18N
			} else if($('#daysErrorMessage'+criteriaIndex+"_"+pageId).is(':visible')) {
				this.send('modifyErrorMessages','remove','#advRepHours'+criteriaIndex+"_"+pageId,'#daysErrorMessage'+criteriaIndex+"_"+pageId,Ember.I18n.t('webclient.generic.GreaterThan',{'param0':'0'}));//NO I18N
			}
			if(hours<0 || hours>23 || hours.indexOf('.')!=-1 || hours.indexOf('-')!=-1 || hours==='' || !$.isNumeric(hours)) {
				allowDuration = false;
				this.send('modifyErrorMessages','add','#advRepHours'+criteriaIndex+"_"+pageId,'#hoursErrorMessage'+criteriaIndex+"_"+pageId,Ember.I18n.t('webclient.generic.Between',{'param0':'0','param1':'23'}));//NO I18N
			} else if($('#hoursErrorMessage'+criteriaIndex+"_"+pageId).is(':visible')) {
				this.send('modifyErrorMessages','remove','#advRepHours'+criteriaIndex+"_"+pageId,'#hoursErrorMessage'+criteriaIndex+"_"+pageId,Ember.I18n.t('webclient.generic.Between',{'param0':'0','param1':'23'}));//NO I18N
			}
			if(minutes<0 || minutes>59 || minutes.indexOf('.')!=-1 || minutes.indexOf('-')!=-1 || minutes==='' || !$.isNumeric(minutes)) {
				allowDuration = false;
				this.send('modifyErrorMessages','add','#advRepMinutes'+criteriaIndex+"_"+pageId,'#minutesErrorMessage'+criteriaIndex+"_"+pageId,Ember.I18n.t('webclient.generic.Between',{'param0':'0','param1':'59'}));//NO I18N
			} else if($('#minutesErrorMessage'+criteriaIndex+"_"+pageId).is(':visible')) {
				this.send('modifyErrorMessages','remove','#advRepMinutes'+criteriaIndex+"_"+pageId,'#minutesErrorMessage'+criteriaIndex+"_"+pageId,Ember.I18n.t('webclient.generic.Between',{'param0':'0','param1':'59'}));//NO I18N
			}
			this.set('allowDurationField',allowDuration);//NO I18N
			if(allowDuration) {
				var durationField = $('#durationField'+criteriaIndex+"_"+pageId);
				var duration = days +" " +Ember.I18n.t('webclient.map.flash.Days_25')+ " " +hours+ " " + Ember.I18n.t('webclient.admin.schedulereports.hours')+ " " +minutes+" "+Ember.I18n.t('webclient.general.minutes');
				durationField.text(duration);
				var durationInSeconds = (days*24*60*60)+(hours*60*60)+(minutes*60)+'';
				this.set('criteria.filterTextValue',durationInSeconds);//will be sent in API Params//NO I18N
				var timePickerChoosenValues = {
					'days':days,//NO I18N
					'hours':hours,//NO I18N
					'minutes':minutes//NO I18N
				}
				this.set('criteria.timePicker',timePickerChoosenValues);//NO I18N
			}
		},
		modifyErrorMessages:function(operation,boxId,textMessageId,messageString){
			if(operation==='add') {//NO I18N
				//when any error is there, save and preview should be restricted
				if(!$('#createAdvRepButton').hasClass('disabledBlock')) {
					$('#createAdvRepButton').addClass('disabledBlock');
				}
				if(!$('#previewAdvRepButton').hasClass('disabledBlock')) {
					$('#previewAdvRepButton').addClass('disabledBlock');
				}
				//add error Message and add red color to the div
				$(boxId).addClass('validateField error');
				$(textMessageId).show();
				$(textMessageId).text(messageString);
			} else if(operation==='remove') {//NO I18N
				$(boxId).removeClass('validateField error');
				$(textMessageId).hide();
				if($('#createAdvRepButton').hasClass('disabledBlock')) {
					$('#createAdvRepButton').removeClass('disabledBlock');
				}
				if($('#previewAdvRepButton').hasClass('disabledBlock')) {
					$('#previewAdvRepButton').removeClass('disabledBlock');
				}
			}
		},
		setValueType:function(criteria){
			var pageId = this.get('pageId');
			var selectedValueType = $('#selectedValueType'+criteria.index+"_"+pageId).val();
			criteria.selectedValueType = selectedValueType;
		}
	},
	willDestroyElement: function(){
	}
});

OPMClient.OpmDevDependencyTreeComponent = Ember.Component.extend({
	templateName: "components/opm-DevDependency-Tree", //No I18N
	didInsertElement: function(){

		var schName = "";//No I18N
		var isEditoperation = false;
		var isProceed = true;
		var data = {};
		if(OPMClient.SettingsAddEditController.isEdit){
			schName = OPMClient.SettingsAddEditController.pageObj.name;
			data.scheduleName = schName;
			isEditoperation = true;
		}else{
			schName  = $('#scheduleName').val();
		}

		var selectDevicesMethod = $('input:radio[name=selectDevicesMethod]:checked').val();//No I18N
		data.filterType = selectDevicesMethod;
		if(selectDevicesMethod === "Device" || selectDevicesMethod === "URL"){
			var selectedObj = [];
	        $.each($("#selectedListName option"),function(k,v)
	        {
	            selectedObj.push($(v).val());//No I18N
	        });
			if(selectDevicesMethod === "Device"){
				if(selectedObj.length === 0 ){
					alert(Ember.I18n.t('webclient.general.selectdevices',this));//No I18N
					isProceed =false;
				}
			}
			else{
				if(selectedObj.length === 0){
					alert(Ember.I18n.t('webclient.common.widgets.selectaurl',this));//No I18N
					isProceed = false;
				}
			}
			data.members = selectedObj.toString();
		}
		else if(selectDevicesMethod === "BV")
		{
			var selectedBV = $("#selectedBV").val();
			if(selectedBV === null || selectedBV === "" || selectedBV === undefined){
				alert(Ember.I18n.t('webclient.notif.selbv',this));//No I18N
				isProceed =  false;
			}
			data.members = selectedBV;
		}
		else if(selectDevicesMethod === "Category")
		{
			var selectedCateg = $("#selectedCateg").val();
			if(selectedCateg === null || selectedCateg === "" || selectedCateg === undefined){
				alert(Ember.I18n.t('webclient.search.settings.minwarn',this));//No I18N
				isProceed = false;
			}
			data.members = selectedCateg;
		}
		else if(selectDevicesMethod === "GROUP")
		{
			var selectedObj = [];
	        $.each($("#selectedListName option"),function(k,v)
	        {
	            selectedObj.push($(v).val());//No I18N
	        });
			if(selectedObj.length === 0){
				alert(Ember.I18n.t('webclient.optm.dropdown.group.notselected',this));//No I18N
				isProceed = false;
			}
			data.members = selectedObj.toString();
		}
		if(!isProceed && isEditoperation){
			opm_transitionToTheRoute('Settings.Configurations.DowntimeSchedule.Edit'); //No I18N
			return false;
		}else if(!isProceed && !isEditoperation){
			opm_transitionToTheRoute('Settings.Configurations.DowntimeSchedule.Add'); //No I18N
			return false;
		}

		var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getDevicesInTreeView',data); //No I18N
		this.set('treeData',jsonData);//No I18N
		this.set('schName',schName);//No I18N
		if(jsonData.result !== undefined || jsonData.error !== undefined){
			showMessage(jsonData);
			if(isEditoperation){
				opm_transitionToTheRoute('Settings.Configurations.DowntimeSchedule.Edit'); //No I18N
			}else{
				opm_transitionToTheRoute('Settings.Configurations.DowntimeSchedule.Add'); //No I18N
			}
			return false;
		}else{
			$('#DependencyDetailsTree').jstree('destroy');//No I18N
			$('#DependencyDetailsTree').on('select_node.jstree',function(e,data){//No I18N
				if(data.node.original.name !== undefined && data.node.original.name !== "_" && data.node.original.id !== "_parent"){
					redirectToDeviceSnapshot(data.node.original.name,'','MonitoringDevice'); //No I18N
				}
			}).on('ready.jstree', function(e, data){
            	data.instance.open_all();
			}).jstree({
				"plugins": ["search"],//No I18N
				"search": {//No I18N
	                    "case_sensitive": false,//No I18N
	                    "show_only_matches": true//No I18N
	                },
			    "core": {//NO I18N
	                'data': jsonData, //NO I18N
	                'force_text':true //NO I18n
	            }
		    });
		}
	},
	actions:{
		searchDevTreeNode: function(){
			var searchString = $("#treeSrcSource").val();
		    $('#DependencyDetailsTree').jstree('search', searchString);//No I18N
		},
		exportToPDF: function(){
			var posturlParams="JSONdata="+JSON.stringify(this.get('treeData'));//No I18N
			if(this.get('schName') !== undefined && this.get('schName') !== ""){
				posturlParams +="&scheduleName="+this.get('schName');//No I18N
			}
			if(window.OPM.isMSPCentral){
				posturlParams += "&selCustomerID="+window.OPM.selCustomerID; //No I18n
				posturlParams += "&regionID="+window.OPM.selRegionID; //No I18n
			}

				if(window.OPM.isEEProbeSelected) {
					//Adding eeProbeID to api request based on the type of request
					posturlParams += "&eeProbeID="+window.OPM.selectedEEProbe; //No I18n
				}

			var form=document.createElement("form");//No I18N
			form.action=window.OPM.apiUrlPattern+"/reports/exportDeviceDependencyTreePDF?";//No I18N
			var paramsList = posturlParams.split("&");//No I18N
			for(var i=0;i<paramsList.length;i++){
				var sinParam=paramsList[i].split("=");//No I18N
				var element1=document.createElement("input");//No I18N
				element1.setAttribute("type","text");//No I18N
				element1.setAttribute("name",sinParam[0]);//No I18N
				element1.setAttribute('value',sinParam[1]);//No I18N
				form.appendChild(element1);
			}
			var csrfelement=document.createElement("input");//No I18N
			csrfelement.setAttribute("type","hidden");//No I18N
			csrfelement.setAttribute("name","opmcsrftoken");//No I18N
			csrfelement.setAttribute("value",readCsrfToken("opmcsrfcookie"));//No I18N
			form.appendChild(csrfelement);
    		form.setAttribute("method","post");//No I18N
    		document.body.appendChild(form);
    		form.submit();
		}
	}
});

OPMClient.OpmsummaryInfoComponent = Ember.Component.extend({
	templateName: "components/opm-summary-info",//No I18N
	didInsertElement: function(){
		var self = this;
		var isWidgetPosReload = false;
		var adjustedHeight = $('.com_SummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-180;//No I18N
		if(self.snapshotObj !== undefined)
		{
			self.set('widgetData.sizey',13);//No I18N
			isWidgetPosReload = true;
		}
		if(window.OPM.isNewSnapshotPage){
			self.set('widgetData.sizey',13);//No I18N
			self.set('adjustedHeight',10);//No I18N
			adjustedHeight = 10;
		}

		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		OPMClient.InventoryDeviceDetailsController.set('isMerakiMSSnap',false);//No I18N
	}
});
OPMClient.OpmSummaryInfoDetailsComponent = Ember.Component.extend({
	classNames:['com_SummaryDetails'],//No I18N
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_SummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-50,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	willDestroyElement: function(){
		$(this.element).find('.DIGmCustomScroll > div').mCustomScrollbar('destroy');
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmTenantAppsComponent = Ember.Component.extend({
	templateName: "components/opm-Tenant-Apps", //No I18N
	didInsertElement: function ()
	{
		var widgetData = this.get('widgetData'); //No I18n
		var jsonData = this.get('widgetData.apiData'); //No I18n
		var appName;

		if(widgetData.name === "opm.sdn.tenant.applicationprofile")
		{
			jsonData = jsonData.AP;
			appName = "AP"; //No I18n
		}
		if(widgetData.name === "opm.sdn.tenant.endpointsgroup")
		{
			jsonData = jsonData.EPG;
			appName = "EPG"; //No I18n
		}
		if(widgetData.name === "opm.sdn.tenant.bridedomain")
		{
			jsonData = jsonData.BD;
			appName = "BD"; //No I18n
		}
		if(widgetData.name === "opm.sdn.tenant.vrf")
		{
			jsonData = jsonData.VRF;
			appName = "VRF"; //No I18n
		}
		this.set('controller.appData',jsonData); //No I18n
		this.set('controller.id',appName); //No I18n
		if(jsonData.length > 0 )
		{
			this.set('widgetData.sizey',10); //No I18N
			this.set('widgetData.noData',false);//No I18N
		}
		else
		{
			this.set('widgetData.noData',true);//No I18N
			this.set('widgetData.sizey',2);//No I18N
		}
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		var widParentId = '#widgetElement_'+this.get('widgetData').id;//No I18N
		$(widParentId+' .content.singleInvWidget').css("overflow-y","auto"); //No I18n
	},
	willDestroyElement: function()
	{
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmVPNSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-VPN-Summary",//No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = this.get('widgetData'); //No I18n
		var jsonData = this.get('widgetData.apiData'); //No I18n
		self.set('widgetData.hideExpand',true);//No I18N
		if((window.OPM.userPermissions.discoveryWrite || window.OPM.restrictedPermissions.bvRestricted.discoveryWrite) && !(window.OPM.isCentralServer || OPMClient.ApplicationController.isMSPCentralSelected)) {
			this.set('showDiscoverVPN',true); //No I18n
		}
		else {
			this.set('showDiscoverVPN',false); //No I18n
		}
		$('.icon-ccw.widget_refresh').show();
		if($('.discoverVPNLink').is(':visible')){
			$('.icon-ccw.widget_refresh').hide();
		}
		if(jsonData.vpnSummary!== undefined && jsonData.vpnSummary.length > 0){
			this.set('showVPNFailDiscoverReason',false); //No I18n
			$('.discoverVPNLink').show();
			$('.discoverVPNReload').show();
			this.set('widgetData.noData',false);//No I18N
			if(jsonData.vpnSummary[0].totalINBandwidth !== undefined && jsonData.vpnSummary[0].totalOutBandwidth !== undefined) {
			    var inVal = jsonData.vpnSummary[0].totalINBandwidth.split(" ");
                var outVal = jsonData.vpnSummary[0].totalOutBandwidth.split(" ");
                jsonData.vpnSummary[0].inBanVal = inVal[0];
                jsonData.vpnSummary[0].inBanUnit = inVal[1];
                jsonData.vpnSummary[0].outBanVal = outVal[0];
                jsonData.vpnSummary[0].outBanUnit = outVal[1];
			}


			this.set('controller.summaryData',jsonData.vpnSummary[0]); //No I18n
			var colNames = [Ember.I18n.t('webclient.common.intro.Hostname',this),Ember.I18n.t('webclient.devices.details.instance',this),Ember.I18n.t('webclient.common.operationstatus',this),Ember.I18n.t('webclient.snmpv3.Encryption',this),Ember.I18n.t('webclient.opm.report.hashing',this),Ember.I18n.t('webclient.map.view.rxtraffic',this),Ember.I18n.t('webclient.map.view.txtraffic',this),Ember.I18n.t('webclient.opm.report.since',this),Ember.I18n.t('ipsla.Action',this),'']; //No I18N
			var	colModel= [
				{name:'hostName',index:'hostName'}, //No I18N
				{name:'instance',index:'instance'}, //No I18N
				{name:'status',index:'status',formatter:statusColorIcon}, //No I18N
				{name:'encryptionProtocol',index:'encryptionProtocol'}, //No I18N
				{name:'hashingProtocol',index:'hashingProtocol'}, //No I18N
				{name:'rxBytes',index:'rxBytes'}, //No I18N
				{name: 'txBytes', index: 'txBytes'}, //No I18N
				{name: 'upTime', index: 'upTime'}, //No I18N
				{name: 'statusPoll', index: 'statusPoll',formatter:vpnHostPollStatus,search:false,width:80,sortable:false}, //No I18N
				{name: 'statusStr', index: 'statusStr',hidden:true} //No I18N
			];

			if(window.OPM.isCentralServer || !window.OPM.userPermissions.monitoringWrite){
				colModel[7].hidden = true;
			}
		   	if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName === "Fortinet"){
		   		colModel[3].hidden = true;
		   		colModel[4].hidden = true;
		   	}
		   	if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName === "CheckPoint"){
		   		colModel[3].hidden = true;
		   		colModel[4].hidden = true;
		   		colModel[5].hidden = true;
                colModel[6].hidden = true;
		   		colModel[7].hidden = true;
		   	}
			var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_vpnDetailsTable').height()+180;
				var cellCount = Math.ceil((gridH)/(21));
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1); //No I18N
			};
			var gridData = jsonData.vpnDetails;
			validateGridColumnDetails(colModel,colNames);
			var defaultOptions = {
					isSnapshotGrid: true,
					reload: true,
					searchOption:false,
					hideCSV:true,
					hideExcel:true,
					minRowsPerPage:50,
					pagination:true,
					multiselect:true,
					gridCallBack:gridCallBack,
					gridCallBackParams:{self:self}
				};
			this.set('controller.vpnDetails',jsonData.vpnDetails);//No I18n
			opm_updateNgfwTabCount('vpnTunnelsCount', (gridData !== undefined && gridData.length !== undefined) ? gridData.length : 0);//No I18N
			opm_loadJQgridWithData("#vpnDetailsTable",gridData, colNames, colModel, Ember.I18n.t('weblcient.dashboard.overviewdashboard',this), "#vpnDetailsPager", "VPNSummaryWidget",defaultOptions);//No I18n
		}else{
			this.set('widgetData.noData',true);//No I18N
			if(jsonData.showMessage !== undefined){
				this.set('showVPNFailDiscoverReason',true); //No I18n
				$('.discoverVPNLink').hide();
				$('.discoverVPNReload').hide();
			}
		}
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',widgetData.snapIndex);//No I18N
	},
	actions: {
		expandWidget: function(){
			this.sendAction('action','expand');
		},
		enableDisableHostPolling:function(status){
			var self = this;
			var widgetData = this.get('widgetData'); //No I18n
			var grid = jQuery("#vpnDetailsTable");	//No I18N
			var selRowIds = grid.jqGrid('getGridParam','selarrrow');//No I18N
			if(selRowIds.length<1)
			{
				alert(Ember.I18n.t('js.commonstr.SelAtleastOneRowPCIRow',this)); //No I18N
				return;
			}
			var entityArr = [];
			var instanceArr = [];
			$.each(selRowIds, function(key,val){
				var entity = grid.jqGrid('getCell', val, 'hostName');//No I18N
				var inst = grid.jqGrid('getCell', val, 'instance');//No I18N
				entityArr.push(entity);
				instanceArr.push(inst);
			});
			vpnHostStuspollAction(status,entityArr,OPMClient.InventoryDeviceDetailsController.deviceName,instanceArr)
		},
		discoverFWAVPN: function()
		{
			opmGlobalRoute.transitionTo("Inventory.Device.DiscoverVPN");//No I18N
		}
	},
	willDestroyElement: function(){
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',''); //No I18N
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmVPNDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-VPN-Details",//No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData'); //No I18n
		var jsonData = this.get('widgetData.apiData'); //No I18n
		if(jsonData[0] !==undefined){
            if(jsonData[0].totalINBandwidth !== undefined && jsonData[0].totalOutBandwidth !== undefined) {
                var inVal = jsonData[0].totalINBandwidth.split(" ");
                var outVal = jsonData[0].totalOutBandwidth.split(" ");
                jsonData[0].inBanVal = inVal[0];
                jsonData[0].inBanUnit = inVal[1];
                jsonData[0].outBanVal = outVal[0];
                jsonData[0].outBanUnit = outVal[1];
            }

		}
		var self = this;
		var isWidgetPosReload = false;
		if(self.snapshotObj !== undefined)
		{
			self.set('widgetData.sizey',20);//No I18N
			isWidgetPosReload = true;
		}
		if(window.OPM.isNewSnapshotPage){
			self.set('widgetData.sizey',15);//No I18N
			self.set('adjustedHeight',20);//No I18N
		}
		this.set('controller.summaryData',jsonData[0]); //No I18n

	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmRouterTunnelComponent = Ember.Component.extend({
	templateName: "components/opm-Router-Tunnel-Summary",//No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = this.get('widgetData'); //No I18n
		var jsonData = this.get('widgetData.apiData'); //No I18n
		self.set('widgetData.hideExpand',true);//No I18N
		$('.icon-ccw.widget_refresh').show();
		if(jsonData.rows!== undefined && jsonData.rows.length > 0){
			this.set('showVPNFailDiscoverReason',false); //No I18n
			this.set('widgetData.noData',false);//No I18N
			jsonData.SummaryData.totalHost=jsonData.records;
			this.set('controller.summaryData',jsonData.SummaryData); //No I18n
			var colNames = [Ember.I18n.t('widget.header.sdwan.tunnels.name',this),Ember.I18n.t('opstor.inventory.state',this),Ember.I18n.t('fwa.DiagnoseConn.LocalIP',this),Ember.I18n.t('widget.header.sdwan.tunnels.remoteIp',this),Ember.I18n.t('webclient.map.jitter',this),Ember.I18n.t('webclient.map.latency',this),Ember.I18n.t('webclient.map.packetloss',this),'','','','','','',Ember.I18n.t('webclient.action.actions',this)]; //No I18N
			var	colModel= [
				{name:'displayName',index:'displayName',formatter:opm_SDWANTunnelsStatus}, //No I18N
				{name:'tunnelState', index: 'tunnelState'}, //No I18N
				{name:'localIP',index:'localIP'}, //No I18N
				{name:'remoteIP',index:'remoteIP'}, //No I18N
				{name:'jitter',index:'jitter'}, //No I18N
				{name:'latency', index: 'latency'}, //No I18N
				{name:'packetloss',index:'packetloss'}, //No I18N
				{name:'tunnelMOID', index:'tunnelMOID', hidden:true}, //No I18N
				{name:'instance', index:'instance', hidden:true}, //No I18N
				{name:'isManaged', index:'isManaged', hidden:true}, //No I18N
				{name:'isSuppressed', index:'isSuppressed', hidden:true}, //No I18N
				{name:'deviceMOName', index:'deviceMOName', hidden:true}, //No I18N
				{name:'status',index:'status',hidden:true,formatter:routerTunnelstatusColorIcon}, //No I18N
				{name:'actions', index:'actions', search:'false', sortable:'false', formatter:sdwanTunnelActions} //No I18N	
			];

			if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName === "Arista Networks"){
				colModel[2].hidden = true;
				colModel[3].hidden = true;
			}
			if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName === "Fortinet"){
				colModel[2].hidden = true;
				colModel[3].hidden = true;
			}
			if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName === "Extreme Networks"){
				colModel[4].hidden = true;
				colModel[5].hidden = true;
				colModel[6].hidden = true;
			}

			var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_vpnDetailsTable').height()+180;
				var cellCount = Math.ceil((gridH)/(21));
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1); //No I18N
			};
			var gridData = jsonData.rows;
			validateGridColumnDetails(colModel,colNames);
			var defaultOptions = {
					isSnapshotGrid: true,
					reload: true,
					searchOption:false,
					hideCSV:true,
					hideExcel:true,
					minRowsPerPage:50,
					pagination:true,
					multiselect:true,
					gridCallBack:gridCallBack,
					gridCallBackParams:{self:self}
				};
			this.set('controller.vpnDetails',jsonData.rows);//No I18n
			opm_loadJQgridWithData("#vpnDetailsTable",gridData, colNames, colModel,"", "#vpnDetailsPager", "VPNSummaryWidget",defaultOptions);//No I18n
		}else{
			this.set('widgetData.noData',true);//No I18N
			if(jsonData.showMessage !== undefined){
				this.set('showVPNFailDiscoverReason',true); //No I18n
			}
		}
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',widgetData.snapIndex);//No I18N
	},
	actions: {
		expandWidget: function(){
			this.sendAction('action','expand');
		},
		doManageUnManageSDWanChilds:function(isMultiple,gridID,manage,elemType){
			doManageUnManageSDWanChilds(isMultiple,gridID,manage,elemType);
		},
		suppressChildElements:function(gridID,action,elemType){
			suppressChildElements(gridID,action,elemType);
		}
	},
	willDestroyElement: function(){
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',''); //No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmRouterWanLinkComponent = Ember.Component.extend({
	templateName: "components/opm-Router-WanLink-Summary",//No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = this.get('widgetData'); //No I18n
		var jsonData = this.get('widgetData.apiData'); //No I18n
		self.set('widgetData.hideExpand',true);//No I18N
		$('.icon-ccw.widget_refresh').show();
		if(jsonData.rows!== undefined && jsonData.rows.length > 0){
			this.set('showVPNFailDiscoverReason',false); //No I18n
			this.set('widgetData.noData',false);//No I18N
			this.set('controller.summaryData',jsonData.SummaryData); //No I18n
			jsonData.SummaryData.totalHost=jsonData.rows.length;
			var colNames = [Ember.I18n.t('webclient.admin.customfields.interface',this),Ember.I18n.t('opstor.inventory.speed.inmbps',this),Ember.I18n.t('opstor.inventory.state',this),Ember.I18n.t('webclient.IP',this),Ember.I18n.t('webclient.devices.details.mac',this),Ember.I18n.t('webclient.map.view.rxtraffic',this),Ember.I18n.t('webclient.map.view.txtraffic',this),'','','','','','','',Ember.I18n.t('webclient.action.actions',this)]; //No I18N
			var	colModel= [
				{name:'displayName',index:'displayName',formatter:opm_SDWANTunnelsStatus}, //No I18N
				{name:'speed',index:'speed'}, //No I18N
				{name:'state',index:'state'}, //No I18N
				{name:'ipAddress',index:'ipAddress'}, //No I18N
				{name:'macAddress',index:'macAddress'}, //No I18N
				{name:'rxTraffic',index:'rxTraffic'}, //No I18N
				{name:'txTraffic',index:'txTraffic'}, //No I18N
				{name:'intfMoid', index:'intfMoid', hidden:true}, //No I18N
				{name:'intfMoName', index:'intfMoName', hidden:true}, //No I18N
				{name:'deviceID', index:'deviceID', hidden:true}, //No I18N
				{name:'isManaged', index:'isManaged', hidden:true}, //No I18N
				{name:'isSuppressed', index:'isSuppressed', hidden:true}, //No I18N
				{name:'deviceMOName', index:'deviceMOName', hidden:true}, //No I18N
				{name:'status',index:'status',hidden:true,formatter:routerTunnelstatusColorIcon}, //No I18N
				{name:'actions', index:'actions', search:'false', sortable:'false', formatter:sdwanWanLinkActions} //No I18N	
			];

			var vendorName=OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.vendorName;
			var type=OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.type;
			if(vendorName === "Arista Networks"){
				colModel[1].hidden = true;
				colModel[4].hidden = true;
			}
			if(type==="Aruba Edge Devices")
			{
				colModel[1].hidden = true;
				colModel[4].hidden = true;
				colModel[5].hidden = true;
				colModel[6].hidden = true;
			}
			if(vendorName === "Extreme Networks"){
				colModel[1].hidden = true;
				colModel[3].hidden = true;
				colModel[4].hidden = true;
				colModel[5].hidden = true;
				colModel[6].hidden = true;
			}
			if(vendorName === "Fortinet"){
				colModel[5].hidden = true;
				colModel[6].hidden = true;
			}
			var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_vpnDetailsTable').height()+180;
				var cellCount = Math.ceil((gridH)/(21));
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1); //No I18N
			};
			var gridData = jsonData.rows;
			validateGridColumnDetails(colModel,colNames);
			var defaultOptions = {
					isSnapshotGrid: true,
					reload: true,
					searchOption:false,
					hideCSV:true,
					hideExcel:true,
					minRowsPerPage:50,
					pagination:true,
					multiselect:true,
					gridCallBack:gridCallBack,
					gridCallBackParams:{self:self}
				};
			this.set('controller.vpnDetails',jsonData.rows);//No I18n
			opm_loadJQgridWithData("#vpnDetailsTable",gridData, colNames, colModel,"", "#vpnDetailsPager", "VPNSummaryWidget",defaultOptions);//No I18n
		}else{
			this.set('widgetData.noData',true);//No I18N
			if(jsonData.showMessage !== undefined){
				this.set('showVPNFailDiscoverReason',true); //No I18n
			}
		}
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',widgetData.snapIndex);//No I18N
	},
	actions: {
		expandWidget: function(){
			this.sendAction('action','expand');
		},
		doManageUnManageSDWanChilds:function(isMultiple,gridID,manage,elemType){
			doManageUnManageSDWanChilds(isMultiple,gridID,manage,elemType);
		},
		suppressChildElements:function(gridID,action,elemType){
			suppressChildElements(gridID,action,elemType);
		}
	},
	willDestroyElement: function(){
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',''); //No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmRouterSimLinkComponent = Ember.Component.extend({
	templateName: "components/opm-Router-SimLink-Summary",//No I18N
	didInsertElement: function(){
		var self = this;
		var widgetData = this.get('widgetData'); //No I18n
		var jsonData = this.get('widgetData.apiData'); //No I18n
		self.set('widgetData.hideExpand',true);//No I18N
		$('.icon-ccw.widget_refresh').show();
		if(jsonData.rows!== undefined && jsonData.rows.length > 0){
			this.set('showVPNFailDiscoverReason',false); //No I18n
			this.set('widgetData.noData',false);//No I18N
			this.set('controller.summaryData',jsonData.SummaryData); //No I18n
			jsonData.SummaryData.totalHost=jsonData.rows.length;
			// this.set('controller.summaryData',jsonData.SummaryData); //No I18n
			var colNames = [Ember.I18n.t('webclient.admin.customfields.interface',this),Ember.I18n.t('webclient.devices.details.sdwan.appliance',this),Ember.I18n.t('webclient.nutanix.disk.serialnumber',this),Ember.I18n.t('webclient.sdwan.sim.imei',this),Ember.I18n.t('webclient.sdwan.sim.slot',this),Ember.I18n.t('webclient.sdwan.sim.state',this),Ember.I18n.t('webclient.sdwan.sim.operator',this),Ember.I18n.t('webclient.sdwan.sim.connectiontype',this),Ember.I18n.t('webclient.sdwan.sim.connectionstate',this),Ember.I18n.t('webclient.map.view.rxtraffic',this),Ember.I18n.t('webclient.map.view.txtraffic',this),Ember.I18n.t('webclient.fwa.total.traffic',this),Ember.I18n.t('webclient.sdwan.sim.networkstate',this),Ember.I18n.t('webclient.IP',this),'','','','','','','','','','','','','','',Ember.I18n.t('webclient.action.actions',this)]; //No I18N
			var	colModel= [
				{name:'displayName',index:'displayName',width:200,formatter:opm_SDWANTunnelsStatus}, //No I18N
				{name:'parentDisplayName',index:'parentDisplayName',formatter:setSDWANEdgeDevices,classes:'pointer',hidden:true}, //No I18N
				{name:'parentSerialNumber',index:'parentSerialNumber',hidden:true}, //No I18N
				{name:'imei',index:'imei'}, //No I18N
				{name:'simSlot',index:'simSlot',width:80,hidden:true}, //No I18N
				{name:'simState',index:'simState',width:100,hidden:true}, //No I18N
				{name:'operator',index:'operator'}, //No I18N
				{name:'connectionType',index:'connectionType'}, //No I18N
				{name:'connectionState',index:'connectionState',width:120}, //No I18N
				{name:'rxTraffic',index:'rxTraffic',width:80}, //No I18N
				{name:'txTraffic',index:'txTraffic',width:80}, //No I18N
				{name:'tlTraffic',index:'tlTraffic',width:80}, //No I18N
				{name:'networkState',index:'networkState',width:120,hidden:true}, //No I18N
				{name:'ipAddress',index:'ipAddress'}, //No I18N
				{name:'cellId',index:'cellId',hidden:true}, //No I18N
				{name:'pinState',index:'pinState',hidden:true}, //No I18N
				{name:'connectionUptime',index:'connectionUptime',hidden:true}, //No I18N
				{name:'modemModel',index:'modemModel',hidden:true}, //No I18N
				{name:'modemFirmware',index:'modemFirmware',hidden:true}, //No I18N
				{name:'esim',index:'esim',hidden:true}, //No I18N
				{name:'status',index:'status',hidden:true}, //No I18N
				{name:'simMoid',index:'simMoid',hidden:true}, //No I18N
				{name:'simMoName',index:'simMoName',hidden:true}, //No I18N
				{name:'isSuppressed',index:'isSuppressed',hidden:true}, //No I18N
				{name:'isManaged',index:'isManaged',hidden:true}, //No I18N
				{name:'deviceMOName',index:'deviceMOName',hidden:true}, //No I18N
				{name:'deviceID',index:'deviceID',hidden:true}, //No I18N
				{name:'type',index:'tunnelType',hidden:true}, //No I18N
				{name:'actions',index:'actions',search:'false',sortable:'false',width:120,formatter:sdwanSimLinkActions} //No I18N
			];


			var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_vpnDetailsTable').height()+180;
				var cellCount = Math.ceil((gridH)/(21));
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1); //No I18N
			};
			var gridData = jsonData.rows;
			validateGridColumnDetails(colModel,colNames);
			var defaultOptions = {
					isSnapshotGrid: true,
					reload: true,
					searchOption:false,
					hideCSV:true,
					hideExcel:true,
					minRowsPerPage:50,
					pagination:true,
					multiselect:true,
					gridCallBack:gridCallBack,
					gridCallBackParams:{self:self}
				};
			this.set('controller.vpnDetails',jsonData.rows);//No I18n
			opm_loadJQgridWithData("#vpnDetailsTable",gridData, colNames, colModel,"", "#vpnDetailsPager", "VPNSummaryWidget",defaultOptions);//No I18n
		}else{
			this.set('widgetData.noData',true);//No I18N
			if(jsonData.showMessage !== undefined){
				this.set('showVPNFailDiscoverReason',true); //No I18n
			}
		}
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',widgetData.snapIndex);//No I18N
	},
	actions: {
		expandWidget: function(){
			this.sendAction('action','expand');
		},
		doManageUnManageSDWanChilds:function(isMultiple,gridID,manage,elemType){
			doManageUnManageSDWanChilds(isMultiple,gridID,manage,elemType);
		},
		suppressChildElements:function(gridID,action,elemType){
			suppressChildElements(gridID,action,elemType);
		}
	},
	willDestroyElement: function(){
		OPMClient.InventoryDeviceDetailsController.set('vpnWidgetIndex',''); //No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmCreateGraphicalReports = Ember.Component.extend({
	templateName: "components/opm-create-graphical-reports",//No I18N
	didInsertElement: function(){
		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj!==undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails!==undefined && OPMClient.InventoryDeviceDetailsController.inventorysnapType==="LogicalIntfGroup") {
			var isMultiGroupFromListPage = OPMClient.GroupingController.graphicalReportSlideDetails!==undefined;
			if(!isMultiGroupFromListPage && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.memberCount > window.OPM.groupReportMaxCount) {
				//close slide with error message
				opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.graphicalReport.maxSize',{param0:window.OPM.groupReportMaxCount})); //No I18N
				this.send('closeAction');//NO I18N
				return;
			}
		}
		// if(!isMailServerConfigured())
		// {
		// 	opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.reports.nomailserver.notauth.click',this)); //No I18N
		// 	return;
		// }
		$("#once_startat_GraphRep").datepicker({ dateFormat: 'yy-mm-dd'});
		$("#once_endat_GraphRep").datepicker({ dateFormat: 'yy-mm-dd'});
		$('#once_startat_GraphRep').datepicker('setDate','today');//No I18N
		$('#once_endat_GraphRep').datepicker('setDate','today');//No I18N
		var graphReportTypes = [{"value":"Individual","displayName":Ember.I18n.t('webclient.reports.individualGraph'),"selected":true}];//NO I18N
		var seriesTypes = [{"value":"MIN","displayName":Ember.I18n.t('opu.common.MINIMUM',this)},{"value":"MAX","displayName":Ember.I18n.t('webclient.reports.max',this)},{"value":"AVG","displayName":Ember.I18n.t('webclient.availability.datatype.average',this),"selected":true}];//NO I18N
		var graphModels = [{"value":"line","displayName":Ember.I18n.t('webclient.reports.graph.output.format.line',this),"selected":true},{"value":"area","displayName":Ember.I18n.t('webclient.reports.graph.output.format.area',this)},{"value":"bar","displayName":Ember.I18n.t('webclient.reports.graph.output.format.bar',this)}];//NO I18N
		this.set("graphTypes",seriesTypes);//No I18N
		this.set("graphModels",graphModels);//No I18N
		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType==="LogicalDeviceGroup") {
			var isListGroupsPage = OPMClient.GroupingController.graphicalReportSlideDetails!==undefined;
			if(isListGroupsPage && window.OPM.enableMonitorsForRBGroups !== true) {
				this.set("isFixedDeviceAvailability",true);//No I18N
				Ember.run.scheduleOnce('afterRender',function(){//No I18N
					$("#seriesType").val('AVG').select2().trigger('change');//No I18N
					$("#seriesType").prop("disabled",true);
				});
			} else {
				if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj!==undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails!==undefined) {
					var url = window.OPM.apiUrlPattern + "/v2/device/fetchMonitorsList";//NO I18N
					var postData = {"groupMOID":OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.groupID};//NO I18N
					if(isListGroupsPage) {
						postData.isGroupsPage = true;
					}
					var response = opm_ajaxPostRequest(url,postData);
					var monitorList = [];
					if(response.error!==undefined) {
						opm_infoMsgs('errorMsg', response.error.message); //No I18N
						this.send("closeAction");//NO I18N
						return;
					} else {
						monitorList=response;
						OPMClient.ReportsDetailsController.hwMonitorsList=[];
						$.each(response, function (index, monitor) {
							monitor.monitorList.map(function(item) {
								if(monitor.name === "hw") {
								OPMClient.ReportsDetailsController.hwMonitorsList.push(item.policyName);
								}
							});
						});
					}
				}
				this.set("monitorsList",monitorList);//No I18N
			}
			if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj!==undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails!==undefined) {
				var groupCount = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.groupID.split(',').length;//No I18N
				if(groupCount > window.OPM.groupReportMaxCount) {
					//remove Individual Graph Report Type if group count exceeds the limit
					graphReportTypes=[];
				}
			}
			graphReportTypes.push({"value":"Average","displayName":Ember.I18n.t('webclient.availability.datatype.average', this)+" "+Ember.I18n.t('Graph', this)});
			Ember.run.scheduleOnce('afterRender',function(){//No I18N
				$('.opmChckList .checkBoxAccr').on('click', '.opmCheckBoxAccrBtn', function (e) {
                    if(!$(e.target).closest('.checkBoxAccr .opmCheckBoxAccrBtn input').length){
                        if (!$(this).hasClass('active')) {
                            $(this).addClass('active').parent().find('ul').slideDown();
                            $(this).removeClass('icon-down-dir').addClass('icon-up-dir');
                        } else {
                            $(this).removeClass('active').parent().find('ul').slideUp();
                            $(this).removeClass('icon-up-dir').addClass('icon-down-dir');
                        }
                    }
                });
			$("#seriesType").val('AVG').select2().trigger('change');//No I18N
			$("#seriesType").prop("disabled",true);
		});


		} else {
			var isListGroupsPage = OPMClient.GroupingController.graphicalReportSlideDetails!==undefined;
			if(isListGroupsPage) {
				this.set("isMultiGroupInterface",true);//No I18N
				Ember.run.scheduleOnce('afterRender',function(){//No I18N
					$("#seriesType").val('AVG').select2().trigger('change');//No I18N
					$("#seriesType").prop("disabled",true);
				});
			} else {
				var intfmonitorList=[
					{"displayName":Ember.I18n.t("widget.name.intfavail"),"monitorName":"InterfacesAvailability"},//No I18N
					{"displayName":Ember.I18n.t('opmanagerclient.list.switchgraphsmenu.InterfaceRxTraffic'),"monitorName":"Interface Rx Traffic"},//No I18N
					{"displayName":Ember.I18n.t('opmanagerclient.list.switchgraphsmenu.InterfaceTxTraffic'),"monitorName":"Interface Tx Traffic"},//No I18N
					{"displayName":Ember.I18n.t("opmanagerclient.list.switchgraphsmenu.InterfaceRxErrors"),"monitorName":"Interface Rx Errors"},//No I18N
					{"displayName":Ember.I18n.t("opmanagerclient.list.switchgraphsmenu.InterfaceTxErrors"),"monitorName":"Interface Tx Errors"},//No I18N
					{"displayName":Ember.I18n.t("opmanagerclient.list.switchgraphsmenu.InterfaceRxDiscards"),"monitorName":"Interface Rx Discards"},//No I18N
					{"displayName":Ember.I18n.t("opmanagerclient.list.switchgraphsmenu.InterfaceTxDiscards"),"monitorName":"Interface Tx Discards"},//No I18N
					{"displayName":Ember.I18n.t("opmanagerclient.list.switchgraphsmenu.InterfaceRxUtilization"),"monitorName":"Interface Rx Utilization"},//No I18N
					{"displayName":Ember.I18n.t("opmanagerclient.list.switchgraphsmenu.InterfaceTxUtilization"),"monitorName":"Interface Tx Utilization"}//No I18N
				];
				this.set("intferacemonitorList",intfmonitorList);//No I18N
				this.set("isInterfaceGroup",true);//NO I18N
				this.send('enableChooseMonitors',true);//NO I18N
			}
		}
		this.set("graphReportTypes",graphReportTypes);//No I18N
		var timeWindowsRepDisplay = {"Full 24 hours":Ember.I18n.t('webclient.reports.timewindow.full24hours',this),"8:00 AM - 8:00 PM":Ember.I18n.t('webclient.800.AM.to.800.PM',this)}; //No I18N
		if(OPMClient.ReportsDetailsController.scheduleDefaultProps!==undefined) {
			if($.isEmptyObject(OPMClient.ReportsDetailsController.scheduleDefaultProps)) {
				jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/reports/scheduleReportDefaultProps'); //No I18N
				OPMClient.ReportsDetailsController.scheduleDefaultProps = jsonData;
			} else {
				jsonData = OPMClient.ReportsDetailsController.scheduleDefaultProps;
			}
			var timeWindowList =[];
			$.each(OPMClient.ReportsDetailsController.scheduleDefaultProps.timeWindows, function(i, item){
				if(timeWindowsRepDisplay[jsonData.timeWindowsDisplay[i]]!==undefined)
				{
					var timeWindow = {"displayName":escapeHTML(timeWindowsRepDisplay[jsonData.timeWindowsDisplay[i]]),"optionValue":item};//No I18N
					timeWindowList.push(timeWindow);
				}
				else{
					var timeWindow = {"displayName":escapeHTML(OPMClient.ReportsDetailsController.scheduleDefaultProps.timeWindowsDisplay[i]),"optionValue":item};//No I18N
					timeWindowList.push(timeWindow);
				}
			});
			var bhRules =[];
			$.each(OPMClient.ReportsDetailsController.scheduleDefaultProps.BusinessRuleNames, function(i, item){
				var bhRule = {"displayName":escapeHTML(item),"optionValue":i};//No I18N
				bhRules.push(bhRule);
			});
			var timePeriodList = [];
			$.each(OPMClient.ReportsDetailsController.scheduleDefaultProps.TimePeriodList, function(i, item){
				var eachTimePeriod = {"displayName":escapeHTML(OPMClient.ReportsDetailsController.scheduleDefaultProps.TimePeriodDispList[i]),"optionValue":item,"selected":false};//No I18N
				if(item==='twelvehours') {
				    eachTimePeriod.selected=true;
				}
				timePeriodList.push(eachTimePeriod);
			});
			this.set("bhRules",bhRules);//No I18N
			this.set('timeWindowList',timeWindowList);//No I18N
			this.set('timePeriodList',timePeriodList);//No I18N
			Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
				$('.select2').select2();
				// $().select2();
			},100);
		}
	},
	actions:{
		enableChooseMonitors:function(enable){
			var self = this;
			if(enable) {
				self.set("monitorsList",self.get("intferacemonitorList"));//NO I18N
				this.set('showAllTrafficOptions', false); //NO I18N
			} else {
				self.set("monitorsList",undefined);//NO I18N
				//if all traffic is choosen, blur value type div
				var selectedMonitors = getSelectedMetricsForOpMRepors("selectedMonitorsList_GraphRep","monitorRadio");//No I18N
				if(selectedMonitors.indexOf('All Traffic')!==-1) {
            		this.set('showAllTrafficOptions', true); //NO I18N
                    Ember.run.scheduleOnce('afterRender',function(){//No I18N
                       if(OPMClient.ReportsDetailsController.allTrafficCustomization === undefined || OPMClient.ReportsDetailsController.allTrafficCustomization.length == 0) {
                          $("#allTrafficCustomizationGrp").find("input[type='checkbox']").prop("checked", true); // No I18N
                       } else {
                          $("#allTrafficCustomizationGrp").find("input[type='checkbox']").prop("checked", false); // No I18N
                          if(OPMClient.ReportsDetailsController.allTrafficCustomization.length > 0) {
                            $("#allTrafficCustomizationGrp input[type='checkbox']").each(function() {
                              if(OPMClient.ReportsDetailsController.allTrafficCustomization.indexOf($(this).val()) > -1) {
                                $(this).prop("checked", true);
                              }
                            });
                          }
                        }
                      });
                      if(OPMClient.ReportsDetailsController.allTrafficCustomization === undefined || ReportsDetailsController.allTrafficCustomization.length == 0 || OPMClient.ReportsDetailsController.allTrafficCustomization.indexOf('AllTraffic') > -1) {
                        if(!$("#seriesType").prop("disabled")) {
                            $("#seriesType").val('AVG').select2().trigger('change'); //No I18N
                            $("#seriesType").prop("disabled", true);
                        }
                      } else if ($("#seriesType").prop("disabled")) {
                        $("#seriesType").prop("disabled", false);
                    }
				} else {
				    if ($("#seriesType").prop("disabled")) {
                        $("#seriesType").prop("disabled", false);
                    }
                    this.set('showAllTrafficOptions', false); //NO I18N
                }
			}
		},
		customizeAllTraffic:function() {
            var customMonitorList = [];
            $('#allTrafficCustomizationGrp input[type="checkbox"]').each(function(){
                if($(this).is(':checked')){
                    customMonitorList.push($(this).val());
                }
            });
            if(customMonitorList.indexOf('AllTraffic') > -1) {
				if(!$("#seriesType").prop("disabled")) {
					$("#seriesType").val('AVG').select2().trigger('change'); //No I18N
                	$("#seriesType").prop("disabled", true);
				}
            } else if ($("#seriesType").prop("disabled")) {
                $("#seriesType").prop("disabled", false);
            }
        },
		searchMonitorsList:function() {
			var searchString = $("#monitorSearch").val();
			listSearch(searchString,"selectedMonitorsList_GraphRep");//No I18N
		},
		enableDisableCustomReportDiv:function() {
			if($('#timePeriodGraphRep').val()==='custom'){
				$('#customPeriodGraphRepDiv').show();
			} else {
				$('#customPeriodGraphRepDiv').hide();
			}
		},
		reportTypeAction: function() {
			var isMultiGroupFromListPage = OPMClient.GroupingController.graphicalReportSlideDetails!==undefined;
			if($('#reportType').val() === "Average" || isMultiGroupFromListPage) {
				$("#seriesType").prop("disabled",true);
			} else {
				if(!this.get("hasHardwareMonitors")) {
                    $("#seriesType").prop("disabled",false);
                }
			}
		},
		seriesTypeAction: function() {
			if($("#seriesType").val()==="MIN" || $("#seriesType").val() === "MAX") {
				$('#deviceMonitorList input[name="monitorNames"]').each(function() {
					var policyName=$(this).attr('data-checkid');
					if(OPMClient.ReportsDetailsController.hwMonitorsList.contains(policyName)) {
						 $(this).prop('disabled', true);
						 $(this).prop("checked",false);
						 $(this).parent('div').css('opacity','0.5');
					}
				});
			} else {
				$('#deviceMonitorList input[name="monitorNames"]').prop('disabled', false);
				$('#deviceMonitorList input[name="monitorNames"]').parent('div').css('opacity','');
			}
		},
		toggleMonitorSelection: function(monitor) {
			var monitors = this.get('monitorsList');
			var hasHardwareMonitors = false;
			var selectedMonitors = this.get("selectedMonitor");
			if(selectedMonitors === undefined) {
				if(OPMClient.ReportsDetailsController.hwMonitorsList !==undefined && OPMClient.ReportsDetailsController.hwMonitorsList.indexOf(monitor.policyName) !== -1) {
					hasHardwareMonitors = true;
				}
				var selectedMonitors=[];
				selectedMonitors.push(monitor.policyName)
				this.set("selectedMonitor",selectedMonitors);//No I18N
			} else {
				if(selectedMonitors.indexOf(monitor.policyName) !== -1) {
					selectedMonitors = selectedMonitors.filter(function(val) {
						return val !== monitor.policyName;
					});
				} else {
					selectedMonitors.push(monitor.policyName);
				}
				this.set("selectedMonitor",selectedMonitors);//No I18N
				selectedMonitors.forEach(function(item, index) {
					if(OPMClient.ReportsDetailsController.hwMonitorsList !== undefined && OPMClient.ReportsDetailsController.hwMonitorsList.indexOf(item) !== -1) {
						hasHardwareMonitors = true;
					}
					});
			}
			this.set("hasHardwareMonitors",hasHardwareMonitors); // No I18N
			var isMultiGroupFromListPage = OPMClient.GroupingController.graphicalReportSlideDetails!==undefined;
			if(hasHardwareMonitors) {
				if(!$("#seriesType").prop("disabled")) {
					$("sereisType").val("AVG").change().select2();
					$("#seriesType").prop("disabled",true);
				}
			} else {
				if($("#seriesType").prop("disabled") && $('#reportType').val()!== 'Average' && !isMultiGroupFromListPage) {
					$("#seriesType").prop("disabled",false);
				}
			}
		},
		closeAction:function() {
			var self = this;
			slideOutWithId('Inventory_CreateGraphicalReports');//No I18N
			setTimeout (function() {
				self.get('parentView').set("controller.slideDetails",undefined);//No I18N
			},500);
		},
		createReportAndSchedule:function() {
			var selectedMonitors;
			if(this.get("isMultiGroupInterface")) {
				selectedMonitors = ["InterfacesAvailability"];//No I18N
			} else if(this.get("isFixedDeviceAvailability")) {
				selectedMonitors = ["DevicesAvailability"];//No I18N
			} else {
				selectedMonitors = getSelectedMetricsForOpMRepors("selectedMonitorsList_GraphRep","monitorRadio");//No I18N
			}
			if(selectedMonitors.length<=0) {
				opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.admin.qcw.monitors.selectamonitor'));//No I18N
				return;
			}
			if((selectedMonitors.indexOf("All Traffic") !== -1 && selectedMonitors.length >= 2))
			{
				opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.monitor.restricted',{param0:Ember.I18n.t('webclient.intfmonitor.alltraffic')}));//No I18N
				return;
			}else if ((selectedMonitors.indexOf("All Traffic") !== -1 && viewval === "table")) {//No I18n
				opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.monitor.table.restricted',{param0:Ember.I18n.t('webclient.intfmonitor.alltraffic')}));//No I18N
				return;
			}
			if((selectedMonitors.indexOf("Traffic Utilization") !== -1 && selectedMonitors.length >= 2))
			{
				opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.monitor.restricted',{param0:Ember.I18n.t('webclient.snapshot.name.Interface.Utilization')}));//No I18N
				return;
			} else if ((selectedMonitors.indexOf("Traffic Utilization") !== -1 && viewval === "table")) {//No I18n
				opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.monitor.table.restricted',{param0:Ember.I18n.t('webclient.snapshot.name.Interface.Utilization')}));//No I18N
				return;
			}
			var graphReportType = $('#reportType').val();
			var totalGraphs = selectedMonitors.length;
			if(graphReportType === 'Individual') {
				var groupCount = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.groupID.split(',').length;//No I18N
				totalGraphs = groupCount*totalGraphs;
			}
			if(totalGraphs>window.OPM.groupReportMaxCount) {
				opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.graphicalReport.maxSize',{param0:window.OPM.groupReportMaxCount})); //No I18N
				return;
			}
			// Multi-group Average: validate group/monitor limits
			// 0-25 groups -> max 50 monitors, 26-1000 groups -> max 4 monitors, >1000 groups -> Not allowed
			if(graphReportType === 'Average') {
				var isListGroupsPage = OPMClient.GroupingController.graphicalReportSlideDetails !== undefined;
				if(isListGroupsPage) {
					var totalGroups = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.groupID.split(',').length;
					var totalMonitors = selectedMonitors.length;
					if(totalGroups > 1000) {
						opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.reportbuilder.maximum',{param0:1000,param1:Ember.I18n.t('webclient.opm.groups')})); //No I18N
						return;
					} else if(totalGroups > 25) {
						if(totalMonitors > 4) {
							opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.reportbuilder.countexceeds',{param0:Ember.I18n.t('webclient.opm.groups'),param1:25,param2:4})); //No I18N
							return;
						}
					} else {
						if(totalMonitors > 50) {
							opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.reportbuilder.maximum',{param0:50,param1:Ember.I18n.t('webclient.admin.url.monitors')})); //No I18N
							return;
						}
					}
				}
			}
			var selectedTime =$('#timePeriodGraphRep').val();
			if(selectedTime!==undefined&&selectedTime==="custom")
			{
				selectedTime="custom";//No I18N
			}
			var graphType=$('#graphModel').val();
			var reportName=$("#reportName").val();
			var schRegex =  /[\\\/:*?"`,<>|&;%#()+^.{}=!'@$\[\]]/;//No I18N
			var message = Ember.I18n.t('webclient.opm.advancedreport.specchar',{param0:'\\\/:*?"`<>|&;%#,()+^.{}=!\'@$[]'},this);
			if(!opm_validateFields({"empty":["reportName"],'custom':[{'condition':(schRegex.test($('#reportName').val())),'identifier':'reportName','message':message},{'condition':(schRegex.test($('#repDesc').val())),'identifier':'repDesc','message':message}]})){//No I18N
				return false;
			}
			var reportdesc=$("#repDesc").val();
			var viewval='graph';//No I18N
			var tWindow = $('#graphRepTimeWindowSelBox').val();
			var reportCategory = 'customInterface';//NO I18N
			if(OPMClient.InventoryDeviceDetailsController.inventorysnapType==="LogicalDeviceGroup") {
				var reportCategory = 'Device';//NO I18N
			}
			var postdata={
				"monitorList":selectedMonitors.join(","),//No I18N
				"timePeriod":selectedTime,//No I18N
				"view":viewval,//No I18N
				"reportCategory":reportCategory,//No I18N
				"startDate":$("#once_startat_GraphRep").val(),//No I18N
				"startHour":$("#onceonly_from_hrs_sel_gr").val(),//No I18N
				"endDate":$("#once_endat_GraphRep").val(),//No I18N
				"endHour":$("#onceonly_to_hrs_sel_gr").val(),//No I18N
				"description":reportdesc,//No I18N
				"repName":reportName,//No I18N
				"graphType":graphType //No I18N
			};
			postdata.graphReportType=graphReportType;
			postdata.seriesType=$('#seriesType').val();
			postdata.isEntityBased=true;
			var entityGroupID = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.GroupDetails.groupID;
			var isListGroupsPage = OPMClient.GroupingController.graphicalReportSlideDetails != undefined;
			if(isListGroupsPage) {
				postdata.entityMOIDs=entityGroupID;
			} else {
				postdata.entityMOID=entityGroupID;
			}
			postdata.entityType=OPMClient.InventoryDeviceDetailsController.inventorysnapType;
			var selectedWindOptGrp = $('#graphRepTimeWindowSelBox :selected').parent().attr('label');//No I18N
			var timeWindowValue = $('#graphRepTimeWindowSelBox :selected').val();
			var isBusinessHour = false;
			if(selectedWindOptGrp!==undefined && selectedWindOptGrp!==null && selectedWindOptGrp === Ember.I18n.t('webclient.reports.businesshourrule')) {
				isBusinessHour = true;
			}
			if(isBusinessHour) {
				postdata.isBusinessHour=true;
				postdata.bhRuleId=timeWindowValue;
			} else {
				postdata.timeWindow=timeWindowValue;
			}
			var list=[];
			if($("input[name='includeAllTraffic']:checked").length > 0) {
				list.push($("input[name='includeAllTraffic']:checked").val());
			}
			if($("input[name='include95th']:checked").length > 0) {
				list.push($("input[name='include95th']:checked").val());
			}
			postdata.allTrafficCustomization = list.length > 0 ? list.join(",") : 'None';
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/reports/createCustomReport",postdata);//No I18N
			if (response.error !== undefined)
			{
				message = response.error.message;
				opm_infoMsgs('errorMsg', message); //No I18N
			}
			else if (response.result !== undefined && response.result.message !== undefined)
			{
				this.send("closeAction");//No I18N
                handleCustomReportResponse(response);
			}
		}
	},
	willDestroyElement: function(){
	    OPMClient.ReportsDetailsController.allTrafficCustomization = undefined;
	    $('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmMultiSelectDropdownComponent = Ember.Component.extend({
	templateName: "components/opm-MultiSelect-Dropdown",//No I18N
	elementId: 'multiselect-dropdown-id', // No I18n
	noDataMessage: Ember.I18n.t('webclient.dials.nodata'), // No I18n
	searchPlaceHolder: Ember.I18n.t('opu.common.SEARCH'), // No I18n
	isReadOnly: false,
	maxBadgeHeight: null,
	badge: true,
	hideSearchOnSelection: false,
	badgeListStyle: function() {
		var maxH = this.get('maxBadgeHeight'); //No I18N
		if(maxH) {
			return 'max-height:' + maxH + ';overflow-y:auto;'; //No I18N
		}
		return ''; //No I18N
	}.property('maxBadgeHeight'), //No I18N
	didInsertElement: function()
	{
		var response = [];
		if(this.get('data') !== undefined && this.get('data').length > 0){ //No I18N
			response = this.get('data'); //No I18N
		}
		this.set("totalRecords",response); //No I18N

		//Updating the selected components.
		var selResponse = [];
		$.each(response,function(key,value){
			if(response[key].selected == true){
				selResponse.push(response[key]);
			}
		});
		this.set("selectedData",selResponse); //No I18N
		this.set('isbadged',false); //No I18n
		this.set('showSelectAll',false); //No I18n
		if(selResponse.length !== 0){
			this.set('isbadged',true); //No I18n
		}
		if(!this.get('isReadOnly')) {
			this.send('openDropDown',this.get('divID')); //No I18n
		}

		if(this.get('fullWidth')) {
            $('.m0').addClass('fullCol'); //No I18n
            $('.multiselect-dropdown-container').addClass('width100'); //NO I18n
        }

		if(this.get("totalRecords").length !== this.get("selectedData").length) {
			this.set('showSelectAll',true); //No I18n
		} else {
			this.set('showSelectAll',false); //No I18n
		}
		//Search handling.
		if(!this.get('isReadOnly')) {
			$(".multiselect-dropdown-container .multiselDrpSearch").keyup(function () { //No I18n
			    listSearch($(this).val(),"multiselect-dropdown-list"); //No I18N
			});
		}

		this.set("hideSearchBox", this.get("hideSearchOnSelection") && this.get("selectedData").length > 0); //No I18N
	},
	actions:{
		openDropDown: function(id)
		{
			var self = this;
			$('#'+id).click(function(e){
			    var dropdownContainer = $('.multiselect-dropdown-container');
			    var searchInput = $(".multiselect-dropdown-container .multiselDrpSearch");
			    if (!dropdownContainer.hasClass('active') && $(e.target).closest('.multiselect-dropdown-container').length > 0) {
			        dropdownContainer.addClass('active');
			        self.set("hideSearchBox", false); //No I18N
			        searchInput.focus();
			    } else if (dropdownContainer.hasClass('active') && !dropdownContainer.is(e.target) && dropdownContainer.has(e.target).length === 0) { //No I18n
			        dropdownContainer.removeClass('active');
			        self.set("hideSearchBox", self.get("hideSearchOnSelection") && self.get("selectedData").length > 0); //No I18N
			    }
			});
		},
		selectAll: function() {
		    this.set('selectedData', []); //No I18N
		    $('#multiselect-dropdown-list input[type="checkbox"]').prop("checked", true).trigger('change'); //No I18N
		    this.set('showSelectAll',false); //No I18n
		    if(this.get('selectedData').length !== 0){
				this.set('isbadged',true); //No I18n
			} else {
				this.set('isbadged',false); //No I18n
			}
		},
		deSelectAll: function()
		{
			this.set('selectedData', []); //No I18N
		    $('#multiselect-dropdown-list input[type="checkbox"]').prop("checked", false).trigger('change'); //No I18N
		    this.set('showSelectAll',true); //No I18n
		    if(this.get('selectedData').length !== 0){
				this.set('isbadged',true); //No I18n
			} else {
				this.set('isbadged',false); //No I18n
			}
		},
		deSelect: function(currentIndex) {
			var index = -1;
			var totalSelList = this.get('selectedData'); //No I18N
			for(var i = 0; i < totalSelList.length; i++) {
				if(totalSelList[i].name === currentIndex.name) {
					index = i;
					this.$('input[type="checkbox"][value="'+ currentIndex.name +'"]').prop("checked", false); //No I18N
					this.send("update", currentIndex.selected); //No I18N
					break;
				}
			}
			if (index !== -1) {
				this.get("selectedData").removeAt(index); //No I18N
			}
			if(this.get('selectedData').length !== 0){
				this.set('isbadged',true); //No I18n
			} else {
				this.set('isbadged',false); //No I18n
			}
		},
		update: function(currentIndex) {
			if (this.$('input[type="checkbox"][value="' + currentIndex.name + '"]').prop("checked")) { //No I18N
				this.get("selectedData").pushObject({"id": currentIndex.id, "name": currentIndex.name,"displayName": currentIndex.displayName,"selected": true}); //No I18N
			} else {
				var index = -1;
				var totalSelList = this.get('selectedData'); //No I18N
				for(var i = 0; i < totalSelList.length; i++) {
					if(totalSelList[i].name === currentIndex.name) {
						index = i;
						break;
					}
				}
				if (index !== -1) {
					this.get("selectedData").removeAt(index); //No I18N
				}
			}
			if(this.get("totalRecords").length !== this.get("selectedData").length) {
				this.set('showSelectAll',true); //No I18n
			} else {
				this.set('showSelectAll',false); //No I18n
			}
			if(this.get('selectedData').length !== 0){
				this.set('isbadged',true); //No I18n
			} else {
				this.set('isbadged',false); //No I18n
			}
		}
	},
	listUpdateObserver: function() {
		var updateBatchList = this.get('updateBatchList'); //No I18N
		if(updateBatchList && updateBatchList.data)
		{
			var self = this;
			if(updateBatchList.isAdd)
			{
				$.each(updateBatchList.data,function(key,value){
					if (!self.get('totalRecords').isAny('name', value.name)) { //No I18N
						self.get('totalRecords').pushObject(value); //No I18N
					}
				});
			}
			else
			{
				var itemsToRemove = updateBatchList.data.map(function(item){ return item.name; });
				self.get('totalRecords').removeObjects(self.get('totalRecords').filter(function(item){
					var isSelected = self.get('selectedData').someProperty('name', item.name);//No I18N
					return itemsToRemove.indexOf(item.name) !== -1 && !isSelected;
				}));
			}
		}
	}.observes('updateBatchList'), //NO I18N
	showListObserver: function(){
		$('.badge-group').hide();
		if(this.get('isbadged')) {
			$('.badge-group').show();
		}
	}.observes('isbadged'), //NO I18N
	showSelectAllObserver: function(){
		if(this.get('showSelectAll')){
			$('.multiselect-dropdown .selectAllComponent').show();
		    $('.multiselect-dropdown .deselectAllComponent').hide();
		} else {
			$('.multiselect-dropdown .selectAllComponent').hide();
		    $('.multiselect-dropdown .deselectAllComponent').show();
		}
	}.observes('showSelectAll'), //NO I18N
	dataObserver: function(){
		this.rerender();
	}.observes('data'), //NO I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmPerfGroupEntityComponent = Ember.Component.extend({
	templateName: "components/opm-perf-group-entity",//No I18N
	didInsertElement: function()
	{
		var self = this;
		var perfGroupDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/getPerfgroupAssociatedEntities",{"perfgroupName":this.get("slideDetails.perfgroupName"),"entity":this.get("slideDetails.entity")});//No I18N
		var colNames = [],colModel = [];
		if(this.get("slideDetails.entity")==="performanceMonitor"){//No I18N
			var protocolDrpVal = {"0":Ember.I18n.t("webclient.maps.allcategs",this)};//No I18N
			if(perfGroupDetails!==undefined && perfGroupDetails.length>0)
			{
				for(var i=0;i<perfGroupDetails.length;i++)
				{
					protocolDrpVal[perfGroupDetails[i]["protocol"]] = perfGroupDetails[i]["protocol"];//No I18N
				}
			}
			colNames=[Ember.I18n.t("webclient.snapshot.testlinks.monitorname",this),Ember.I18n.t("webclient.ipsla.voipDashboard.Description",this),Ember.I18n.t("webclient.map.filemonitor.templates.protocol",this),Ember.I18n.t("jsp.commonstr.Vendor",this),Ember.I18n.t("webclient.admin.devicetype.search.oid",this),"","","",""];//No I18N
			colModel = [
				{name:'displayName',index:'displayName',width:35,formatter:redirectToPerfMonitorFromPerfGroup},//No I18N
				{name:'description',index:'description',width:40},//No I18N
				{name:'protocol',index:'protocol',width:20,stype:"select",searchoptions:{value:protocolDrpVal,defaultvalue:"0"}},//No I18N
				{name:'vendor',index:'vendor',width:25},//No I18N
				{name:'oid',index:'oid',width:35},//No I18N
				{name:'graphName',index:'graphName',hidden:true},//No I18N
				{name:'graphId',index:'graphId',hidden:true},//No I18N
				{name:'customGraph',index:'customGraph',hidden:true},//No I18N
				{name:'id',index:'id',hidden:true,sortable:false}//No I18N
			];
		}else if(this.get("slideDetails.entity")==="deviceAssociatedMonitors"){//No I18N
			colNames=[Ember.I18n.t("webclient.admin.nt.devicename",this),"",""];//No I18N
			colModel = [
				{name:'displayName',index:'displayName',formatter:redirectToSnapshotFromPerfGroup},//No I18N
				{name:'moName',index:'moName',hidden:true},//No I18N
				{name:'id',index:'id',hidden:true,sortable:false}//No I18N
			];
		}else if(this.get("slideDetails.entity")==="deviceTemplateAssociatedMonitors"){//No I18N
			colNames=[Ember.I18n.t("jsp.commonstr.DeviceTemplateName",this),""];//No I18N
			colModel = [
				{name:"name",index:"name",formatter:PerfAssoDTFormatter},//No I18N
				{name:'id',index:'id',hidden:true,sortable:false}//No I18N
			];
		}
		Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
			opm_loadJQgridWithData("#perfGroupEntityList",perfGroupDetails,colNames,colModel,"","perfGroupEntityPager","",{sortable:false}); //No I18N
			if(this.get("slideDetails.entity")==="performanceMonitor"){
				$("#PerfGroup_Enitity").addClass("width1000");//No I18N
				$('#perfGroupEntityList').jqGrid('setGridWidth',925);//No I18N
				$("#gs_protocol").select2();//No I18N
			}else{
				$("#PerfGroup_Enitity").removeClass("width1000");//No I18N
			$('#perfGroupEntityList').jqGrid('setGridWidth', $("#perfGroupEntityList").width()-30);//No I18N
			}
		});
	},
	actions: {
		cancelPerfGroup: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmEditPerfGroupComponent = Ember.Component.extend({
	templateName: "components/opm-edit-perf-group",//No I18N
	didInsertElement: function()
	{
		var self = this;
		var perfGroupDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/getThresholdSettingsForPerfGroup",{"perfgroupName":this.get("slideDetails.perfgroupName")});//No I18N
		if(perfGroupDetails!==undefined && !perfGroupDetails.isAdaptiveThresholdsEnabled)
		{
			perfGroupDetails.Attention = {message:perfGroupDetails.defaultMessage_AT};
			perfGroupDetails.Critical = {message:perfGroupDetails.defaultMessage_AT};
			perfGroupDetails.Trouble = {message:perfGroupDetails.defaultMessage_AT}; 
			perfGroupDetails.rearm = {message:perfGroupDetails.clearMessage_AT}; 
			$("input[name='perfGrpDataType'][value='2']").prop("checked",true).change();//No I18N
		}else{
			$("input[name='perfGrpDataType'][value='"+(perfGroupDetails.isAdaptiveThresholdsEnabled?perfGroupDetails.deviationType:2)+"']").prop("checked",true).change();//No I18N
			$("#attentionType").val(perfGroupDetails.ThresholdType).select2().change();//No I18N
			if(perfGroupDetails.Attention===undefined){
				perfGroupDetails.Attention = {message:perfGroupDetails.defaultMessage_AT};
			}
			if(perfGroupDetails.Critical===undefined){
				perfGroupDetails.Critical = {message:perfGroupDetails.defaultMessage_AT};
			}
			if(perfGroupDetails.Trouble===undefined){
				perfGroupDetails.Trouble = {message:perfGroupDetails.defaultMessage_AT};
			}
			if(perfGroupDetails.rearm===undefined){
				perfGroupDetails.rearm = {message:perfGroupDetails.clearMessage_AT};
			}
			if(perfGroupDetails.isAdaptiveThresholdsEnabled)
			{
				Ember.run.schedule("afterRender", function() { //No I18N
					showHideATAdvConfig(true);
					if(perfGroupDetails.lowerlimit!==undefined){
						$("#lowerLimitValue").val(perfGroupDetails.lowerlimit.value);//No I18n
						$("#lowerLimitType").val(perfGroupDetails.ThresholdType==="min"?"max":"min").select2().trigger("change");//No I18n
						$("#upperLimitType").val(perfGroupDetails.ThresholdType).select2().trigger("change");//No I18n
					}
					if(perfGroupDetails.upperlimit!==undefined){
						$("#upperLimitValue").val(perfGroupDetails.upperlimit.value);//No I18n
						$("#upperLimitMsg").val(perfGroupDetails.upperlimit.message);//No I18n
						$("#lowerLimitType").val(perfGroupDetails.ThresholdType==="min"?"max":"min").select2().trigger("change");//No I18n
						$("#upperLimitType").val(perfGroupDetails.ThresholdType).select2().trigger("change");//No I18n	
					}
				});
			}
		}
		self.set("perfGroupDetails",perfGroupDetails);//No I18N
		$('#'+this.elementId+" .select2").select2();//No I18N
	},
	enableDisableAT:function(){
		if(this.get('perfGroupDetails.isAdaptiveThresholdsEnabled')){//No I18N
			showHideATAdvConfig(true);
		}else{
			showHideATAdvConfig(false);
		}
	}.observes('perfGroupDetails.isAdaptiveThresholdsEnabled'),//No I18N
	actions: {
		thresholdConditionType:function(selDiv)
		{
			var selValue = $("#"+selDiv).val();//No I18N
			$(".perfthresholdType:not(#"+selDiv+")").val(selValue).select2();//No I18N

			switch(selValue) {
				case "min": // No I18N
					$('.perfRearmType').val("maxEqual").select2();//No I18N
					break;
				case "max": // No I18N
					$('.perfRearmType').val("minEqual").select2();//No I18N
					break;
				case "minEqual": // No I18N
					$('.perfRearmType').val("max").select2();//No I18N
					break;
				case "maxEqual": // No I18N
					$('.perfRearmType').val("min").select2();//No I18N
					break;
			}
			var lowerLimit = selValue==="min" || selValue==="minEqual"?"max":"min";//No I18N
			var upperlimit = lowerLimit == "min" ? "max" : "min"; // No I18N
			$("#lowerLimitType").val(lowerLimit).select2().trigger("change");//No I18n
			$("#upperLimitType").val(upperlimit).select2().trigger("change");//No I18n
		},
		savePerfGroup: function() {
			var self = this;
			var data = {};
			data.perfgroupName = this.get("perfGroupDetails.perfgroupName");//No I18N
			data.perfgroupID = this.get("perfGroupDetails.perfgroupID");//No I18N
			if(!this.get("slideDetails.isDefaultPerfGroup"))
			{
				if(!opm_validateFields({minCheck:{graphName:3},maxCheck:{graphName:20},perfNameCheck:['graphName']})){
					return;
				}
			}
			data.thresholdDetails = {};
			var thresholdParams = {};
			thresholdParams.isAdaptiveThresholdsEnabled = this.get('perfGroupDetails.isAdaptiveThresholdsEnabled');//No I18N
			if(thresholdParams.isAdaptiveThresholdsEnabled){
				thresholdParams.deviationType = $("input[name='perfGrpDataType']:checked").val();//No I18N
				thresholdParams.consecutiveTimes = $("#failureThreshold").val();//No I18N
				thresholdParams.thresholdType = $("#attentionType").val();//No I18N
				thresholdParams.attentionValue = $("#attentionVal").val();//No I18N
				thresholdParams.troubleValue = $("#troubleVal").val();//No I18N
				thresholdParams.criticalValue = $("#criticalVal").val();//No I18N
				thresholdParams.rearmValue = $("#rearmVal").val();//No I18N
				thresholdParams.attentionMessage = $("#attentionMsg").val();//No I18N
				thresholdParams.troubleMessage = $("#troubleMsg").val();//No I18N
				thresholdParams.criticalMessage = $("#criticalMsg").val();//No I18N
				thresholdParams.rearmMessage = $("#rearmMsg").val();//No I18N
				var fieldsToValidate = {'validInteger':['rearmVal'],'empty':['failureThreshold'],'positive':['failureThreshold']};//No I18N
				if(!opm_validateFields(fieldsToValidate)){
					return false;
				}
				if(thresholdParams.attentionValue!=="")
				{
					if(!opm_validateFields({'validInteger':['attentionVal']})){//No I18N
						return false;
					}
				}
				if(thresholdParams.troubleValue!=="")
				{
					if(!opm_validateFields({'validInteger':['troubleVal']})){//No I18N
						return false;
					}
				}
				if(thresholdParams.criticalValue!=="")
				{
					if(!opm_validateFields({'validInteger':['criticalVal']})){//No I18N
						return false;
					}
				}
				if(thresholdParams.attentionValue ==="" && thresholdParams.troubleValue==="" && thresholdParams.criticalValue==="")//No I18N
				{
					opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.devices.snapshot.editprocessmonitor.enterthres",this));//No I18N
					return false;
				}
				var isValidationSuccess = atThresholdValueValidation(thresholdParams.thresholdType,thresholdParams.attentionValue,thresholdParams.troubleValue,thresholdParams.criticalValue,thresholdParams.rearmValue);
            	if(!isValidationSuccess){
            		return false;
            	}
            	$(".OpMAlertMsg").remove();//No I18Ns
            	if(thresholdParams.attentionValue===""){delete thresholdParams["attentionValue"]};//No I18N
            	if(thresholdParams.troubleValue===""){delete thresholdParams["troubleValue"]};//No I18N
            	if(thresholdParams.criticalValue===""){delete thresholdParams["criticalValue"]};//No I18N
				if(!checkATLimitValues()){
					return false;
				}
				if(!checkATLimitRangeValues()){
					return false;
				}
				if($("#lowerLimitValue").val()!==""){//No I18n
					thresholdParams.lowerlimitType=$("#lowerLimitType").val();//No I18n
					thresholdParams.lowerlimitValue=$("#lowerLimitValue").val();//No I18n
				}
				if($("#upperLimitValue").val()!=="")//No I18n
				{
					thresholdParams.upperlimitType=$("#upperLimitType").val();//No I18n
					thresholdParams.upperlimitValue=$("#upperLimitValue").val();//No I18n
					thresholdParams.upperlimitMessage=$("#upperLimitMsg").val();//No I18n
					thresholdParams.upperlimitSeverity = window.OPM.atUpperLimitSeverity;
				}
			}
			data.thresholdDetails = JSON.stringify(thresholdParams);
			var callBackFn = function(){
			var jsonResponse = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/v2/admin/applyThresholdsForPerfgroup',data);//No I18N
	     	showMessage(jsonResponse);
	     		if(window.OPM.currentView.name==="Settings.Monitors.AdaptiveThreshold"){//No I18N
					loadPerfGroupsAndMonitors("perfGroups");//No I18N
				}else{
					loadPerformanceMonitorByType("perfGroup");//No I18N
				}
				self.get('parentView').send('closeAction');//No I18N
			};
			var countText = "";
			if(self.get("perfGroupDetails.count")!==undefined)
			{
				var entityCountDetails = self.get("perfGroupDetails.count");//No I18N
				if(entityCountDetails.length>0)
				{
					if(entityCountDetails[0].performanceMonitor!==undefined && entityCountDetails[0].performanceMonitor!==0){
						countText = entityCountDetails[0].performanceMonitor+" "+Ember.I18n.t("webclient.common.widgets.monitors",this);//No I18N
					}
					if(entityCountDetails[0].deviceCount!==undefined && entityCountDetails[0].deviceCount!==0){
						if(countText!==""){
							countText += ", ";
						}
						countText += entityCountDetails[0].deviceCount+" "+Ember.I18n.t("webclient.reports.category.devices",this);//No I18N
					}
					if(entityCountDetails[0].deviceTemplateCount!==undefined && entityCountDetails[0].deviceTemplateCount!==0){
						if(countText!==""){
							countText += ", ";
						}
						countText += entityCountDetails[0].deviceTemplateCount+" "+Ember.I18n.t("webclient.DeviceTemplate",this);//No I18N
					}
					if(countText!==""){
						countText = "</br></br>"+Ember.I18n.t("webclient.opm.perfgrp.exist.thresholdsettings",this)+" "+countText+".";//No I18N
					}
				}
			}
			opmConfirm(Ember.I18n.t("webclient.button.save",this)+" "+Ember.I18n.t("opmanager.perfgroup.name",this),Ember.I18n.t("webclient.opm.perfgrp.updateperfgrp.popuptxt",this)+countText+"</br></br><div class='opmInfoMsg style2 pl-none'><p style='font-size:14px !important;'><i>"+Ember.I18n.t("webclient.common.note",this)+" </i>"+Ember.I18n.t("webclient.opm.perfgrp.savenote.txt",this)+"</p></div></br></br>"+Ember.I18n.t("webclient.are.you.sure.you.want.to.proceed",this),'500',callBackFn,Ember.I18n.t('webclient.topo.objectdetails.managed.yes'),'',Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'',false,true);//No I18N
		},
		cancelPerfGroup: function() {
			this.get('parentView').send('closeAction');//No I18N
		},
		changePerfGrpDataType:function(type){
			if(type===2)
			{	
				$("#attentionVal").attr("placeholder","Value").parent().addClass("hideSuffix");//No I18N
				$("#troubleVal").attr("placeholder","Value").parent().addClass("hideSuffix");//No I18N
				$("#criticalVal").attr("placeholder","Value").parent().addClass("hideSuffix");//No I18N
				$("#rearmVal").attr("placeholder","Value").parent().addClass("hideSuffix");//No I18N
			}else{
				$("#attentionVal").attr("placeholder","Percentage").parent().removeClass("hideSuffix");//No I18N
				$("#troubleVal").attr("placeholder","Percentage").parent().removeClass("hideSuffix");//No I18N
				$("#criticalVal").attr("placeholder","Percentage").parent().removeClass("hideSuffix");//No I18N
				$("#rearmVal").attr("placeholder","Percentage").parent().removeClass("hideSuffix");//No I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmDiscoverIgnoreDevicesComponent = Ember.Component.extend({
	templateName: "components/opm-Discover-Ignore-Devices",//No I18N
	actions: {
		save: function() {
			this.get('slideDetails').parentObj.send('discoverIgnoreDevices'); //No I18N
		},
		cancel: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	}
});
/**
 * Utility to get the AlarmProfileModuleID from the moduleSelect dropdown value. Corresponding to AlarmProfileConstants.
 *   "devices"    -> '1'
 *   "groups"     -> '2'
 *   "interfaces" -> '3'
 *   "ipsla" -> '4'
 * @returns {string} moduleTypeID
 */
function getAlarmProfileModuleID() {
    var moduleValue = $("#moduleSelect").val(); //No I18N
    if (moduleValue === "groups") { //No I18N
        return '2'; //No I18N
    } else if (moduleValue === "interfaces") { //No I18N
        return '3'; //No I18N
    } else if (moduleValue === "ipsla"){ // No I18N
        return '4'; //No I18N
    } else if (moduleValue === "apmmonitors"){ //No I18N
        return '5'; //No I18N
    } else {
        return '1'; // default: devices //No I18N
    }
}

function getAlarmProfileModuleType(moduleTypeID) {
    if (moduleTypeID == 2) {
        return "groups"; //No I18N
    } else if (moduleTypeID == 3) {
        return "interfaces"; //No I18N
    } else if (moduleTypeID == 4) {
        return "ipsla"; //No I18N
    } else if (moduleTypeID == 5) {
        return "apmmonitors"; //No I18N
    } else {
        return "devices"; // default: devices //No I18N
    }
}

OPMClient.ApapplyCriteriaComponent = Ember.Component.extend({
	templateName: "components/apapply-criteria", //No I18N
	didInsertElement: function () {
		this.set("criteria", []); //No I18N
		var apCriteriaList = this.get("apCriteriaList");
		var showCriteriaCondition = this.get("showCriteriaCondition");
		var isTriggerAlarm = this.get("isTriggerAlarm");
		this.set("triggerId", ""); //No I18N
		if (isTriggerAlarm) {
			this.set("triggerId", "triggerId"); //No I18N
		}
		var isEditAP = OPMClient.APController.get("isEditAP");
		var isCopyAP = OPMClient.APController.get("isCopyAP");
		if (isEditAP) {
			var dataParams = {};
		if(!OPMClient.APController.isDefaultAlarmRule) {
			//EE
			if(window.OPM.isOPM && window.OPM.isCentralServer)
			{
				if(OPMClient.APController.get("regionID")!==undefined) {
					$("#grpByProbe").select2().val(OPMClient.APController.get("regionID")).trigger("change"); //No I18N
					$("#grpByProbe").attr("disabled", true);
				}
				var probe = $("#grpByProbe").val();
                if(probe!==null && probe!==undefined){
                    if(probe === "-1") {
                        $(".PropagateDevice").hide();
                        $(".workflowSelect").hide();
                    } else {
                        dataParams.eeProbeID = probe;
                    }
                }
			}

			//MSP
			if(window.OPM.isMSPCentral) {
				if(OPMClient.APController.get("customerID")!==undefined) {
					$("#grpByCustomerID").select2().val(OPMClient.APController.get("customerID")).trigger("change"); //No I18N
					$("#grpByCustomerID").attr("disabled", true);
				}
				if(OPMClient.APController.get("regionID")!==undefined) {
					$("#grpByProbe").select2().val(OPMClient.APController.get("regionID")).trigger("change"); //No I18N
					$("#grpByProbe").attr("disabled", true);
				}

				var customer = $("#grpByCustomerID").val();
				var probe = $("#grpByProbe").val();
                if(probe!==null && probe!==undefined){
				    dataParams.selCustomerID = customer;
				    dataParams.regionID = probe;
				}
			}
		}
			// Alarm Profiel ID
			var profileID = OPMClient.APController.get("profileID");
			dataParams.profileID = profileID;

			//Trigger / Rearm
			var triggerId = this.get("triggerId");
			//Criteria
			if (triggerId === "triggerId") {
				//Rearm Criteria
				if (OPMClient.APController.editRearmCriteria !== undefined && !$.isEmptyObject(OPMClient.APController.editRearmCriteria)) {
					this.editAPCriteria(triggerId);
				} else {
					this.addNewAPCriteriaObj();
				}
			} else {
				var jsonResponse = opm_ajaxGetRequest(window.OPM.apiUrlPattern + "/alarm/getAlarmProfile", dataParams);//No I18N
				if (jsonResponse !== undefined && jsonResponse.data !== undefined) {
					// Alarm Profile Name & Desc
					if (isEditAP && !isCopyAP) {
						var newProfileName = $("#apName").val();
						var oldProfileName = jsonResponse.data.profileName;
						if(newProfileName === oldProfileName || newProfileName==="") {
							$("#apName").val(jsonResponse.data.profileName);
						}
					}
					if (isEditAP && isCopyAP) {
						var newProfileName = $("#apName").val();
						var oldProfileName = jsonResponse.data.profileName;
						if(newProfileName === oldProfileName || newProfileName==="") {
							$("#apName").val(jsonResponse.data.profileName + "_Copy");
						}
					}
					$("#apDesc").val(jsonResponse.data.description);

					// Adding APM Group type only if the APM is installed and its build supports Alarm Correlation Rules
                    if((window.OPM.apmInstalled ==="true" || window.OPM.apmInstalled === true) && window.OPM.apmBuildNumber !== undefined && window.OPM.apmBuildNumber !== null && window.OPM.apmBuildNumber !== "null" && parseInt(window.OPM.apmBuildNumber, 10) >= 181800) {
                        var groupSelect = document.getElementById("group");
                        var apmGroup = document.createElement("option");
                        apmGroup.value = "apmmonitors"; // No I18N
                        apmGroup.textContent = Ember.I18n.t('webclient.app.grps', this); // No I18N
                        groupSelect.appendChild(apmGroup);
                    }

					//Rule Type
					if (jsonResponse.data.ruleType === 2) {
                        $("#realTimeAlarmsCheck").prop("checked", true);
                        OPMClient.APController.set("isRealTimeAP", true); //No I18N

                        // Adding options to the group select dropdown if it is a real-time AP
                        var groupSelect = document.getElementById("group");
                        if (!groupSelect.querySelector('option[value="group"]')) {
                            var optionGroup = document.createElement("option");
                            optionGroup.value = "group"; // No I18N
                            optionGroup.textContent = Ember.I18n.t('webclient.opm.groups', this); // No I18N
                            groupSelect.appendChild(optionGroup);
                        }
                        if (!groupSelect.querySelector('option[value="ipsla"]')) {
                            var optionIPSLA = document.createElement("option");
                            optionIPSLA.value = "ipsla"; // No I18N
                            optionIPSLA.textContent = Ember.I18n.t('webclient.IPSLA', this); // No I18N
                            groupSelect.appendChild(optionIPSLA);
                        }
                    } else if (jsonResponse.data.ruleType === 3) {
						$("#realTimeAlarmsCheck").prop("checked", false);
						OPMClient.APController.set("isRealTimeAP", false); //No I18N
						OPMClient.APController.set("isDefaultAlarmRule", true); //No I18N
						OPMClient.APController.set("selectedModule", jsonResponse.data.entityType); //No I18N
						OPMClient.APController.set("ruleSpecificCategory", jsonResponse.data.ruleSpecificCategory); //No I18N
						OPMClient.APController.set("ruleSubType", jsonResponse.data.ruleSubType); //No I18N
						OPMClient.APController.set("ruleIdentifier", jsonResponse.data.ruleIdentifier); //No I18N
						OPMClient.APController.set("ruleCriteria", JSON.stringify(jsonResponse.data.triggerCriteria)); //No I18N
						OPMClient.APController.set("nameKey", jsonResponse.data.nameKey); //No I18N
						OPMClient.APController.set("descriptionKey", jsonResponse.data.descriptionKey); //No I18N
                    } else {
                        OPMClient.APController.set("isRealTimeAP", false); //No I18N
                    }
                    var realTimeAPCheck = document.getElementById("realTimeAlarmsCheck"); //No I18N
                    if(realTimeAPCheck) {
                        realTimeAPCheck.disabled = isEditAP && !isCopyAP;
                    }

                    var moduleTypeID = 1; // default to devices
                    if (jsonResponse.data.moduleType !== undefined){
                        moduleTypeID = jsonResponse.data.moduleType;
                    }
                    var selectedModule = getAlarmProfileModuleType(moduleTypeID);
                    OPMClient.APController.set("selectedModule", selectedModule); // No I18N

					// Set default entity labels (overridden below for specific module types)
					OPMClient.APController.set("AllEntitiesLabel", Ember.I18n.t('webclient.discovery.AllDevices')); //No I18N
					OPMClient.APController.set("SelEntitiesLabel", Ember.I18n.t('webclient.tab.TrapSelectedDevices')); //No I18N

					//Module Type
					if (moduleTypeID == 2) {
						OPMClient.APController.set("selectedEntity", "groups"); //No I18N
                        OPMClient.APController.set("AllEntitiesLabel", Ember.I18n.t('widget.name.alllogicalgroup')); //No I18N
                        OPMClient.APController.set("SelEntitiesLabel", Ember.I18n.t('webclient.discovery.selectGroups')); //No I18N
					} else if(moduleTypeID == 3) {
						$("input[name='module'][value='interfaces']").prop("checked", true);
                        OPMClient.APController.set("AllEntitiesLabel", Ember.I18n.t('webclient.All.Interfaces')); //No I18N
                        OPMClient.APController.set("SelEntitiesLabel", Ember.I18n.t('nfa.select.interfaces')); //No I18N
                    } else if(moduleTypeID == 4) {
                        OPMClient.APController.set("AllEntitiesLabel", Ember.I18n.t('webclient.IPSLA.AllIPSLA')); //No I18N
                        OPMClient.APController.set("SelEntitiesLabel", Ember.I18n.t('webclient.IPSLA.SelectIPSLA')); //No I18N

                        var moduleSelect = document.getElementById('moduleSelect');
                        var ipslaOpt = document.createElement('option');
                        ipslaOpt.value = 'ipsla'; //No I18N
                        ipslaOpt.text = Ember.I18n.t('webclient.license.ipslamonitors'); //No I18N
                        moduleSelect.appendChild(ipslaOpt);
                    } else if(moduleTypeID == 5) {
                        OPMClient.APController.set("AllEntitiesLabel", Ember.I18n.t('webclient.admin.qcw.monitor.app')); //No I18N
                        OPMClient.APController.set("SelEntitiesLabel", Ember.I18n.t('webclient.tab.TrapSelectedDevices')); //No I18N
                    }

                    // Seed alarm scope from the saved value only once per edit session (didInsertElement re-runs on criteria rerender and would clobber an unsaved mode change).
                    var savedAlarmSource = jsonResponse.data.alarmSource;
                    if (!OPMClient.APController.get("apScopeInitialized")) { //No I18N
                        OPMClient.APController.set("originalAlarmSource", savedAlarmSource); //No I18N
                        if (moduleTypeID == 2) {
                            if (savedAlarmSource === -2) {
                                OPMClient.APController.set("groupAlarmScope", "per_group"); //No I18N
                            } else if (savedAlarmSource === -3) {
                                OPMClient.APController.set("groupAlarmScope", "per_member"); //No I18N
                                OPMClient.APController.set("showCriteriaCondition", false); //No I18N
                            }
                        } else {
                            if (savedAlarmSource === -2) {
                                OPMClient.APController.set("deviceAlarmScope", "per_entity"); //No I18N
                            }
                        }
                        OPMClient.APController.set("apScopeInitialized", true); //No I18N
                    }

                    $("#moduleSelect").val(selectedModule).select2();
                $("#moduleSelect").attr("disabled", true);

                    // Show/hide alarm scope controls based on module type
                    if (moduleTypeID == 2) {
                        $(".groupAlarmScopeDiv").show();
                        $(".deviceAlarmScopeDiv").hide();
                        $(".PropagateDevice").hide(); //No I18N -- not applicable to Groups
                        var groupScope = OPMClient.APController.get("groupAlarmScope") || "consolidated"; //No I18N
                        if ($("#groupAlarmScope").data('select2')) { $("#groupAlarmScope").select2('destroy'); } //No I18N
                        $("#groupAlarmScope").select2({width: '100%', minimumResultsForSearch: -1}).val(groupScope); //No I18N
                        // Defer trigger("change") to avoid re-entering Ember's render mid-insert on edit-load.
                        Ember.run.scheduleOnce('afterRender', function () { $("#groupAlarmScope").trigger("change"); }); //No I18N
                    } else {
                        $(".groupAlarmScopeDiv").hide();
                        $(".deviceAlarmScopeDiv").show();
                        var deviceScope = OPMClient.APController.get("deviceAlarmScope") || "consolidated"; //No I18N
                        if ($("#deviceAlarmScope").data('select2')) { $("#deviceAlarmScope").select2('destroy'); } //No I18N
                        $("#deviceAlarmScope").select2({width: '100%', minimumResultsForSearch: -1}).val(deviceScope); //No I18N
                        Ember.run.scheduleOnce('afterRender', function () { $("#deviceAlarmScope").trigger("change"); }); //No I18N
                    }

					//Selected Devices
					if (jsonResponse.data.selectedItems !== undefined && !$.isEmptyObject(jsonResponse.data.selectedItems)) {
						var selectedItems = jsonResponse.data.selectedItems;
						if (jsonResponse.data.moduleType !== undefined && jsonResponse.data.moduleType == 2) {
							if(selectedItems[0] !== undefined && selectedItems[0].type !== undefined) {
								if(selectedItems[0].type === "Interface Group") {
									$("#group").select2().val("interface").trigger("change");//No I18N
								} else if(selectedItems[0].type === "Groups") {
                                    $("#group").select2().val("group").trigger("change");//No I18N
								} else if(selectedItems[0].type === "IPSLA") {
                                    $("#group").select2().val("ipsla").trigger("change");//No I18N
                                }else if(selectedItems[0].type === "Application Group") {
                                    $("#group").select2().val("apmmonitors").trigger("change");//No I18N
                                } else {
									$("#group").select2().val("device").trigger("change");//No I18N
								}
							}
							if(OPMClient.APController.isRealTimeAP === false && OPMClient.APController.isDefaultAlarmRule === false) {
							    $("#group").attr("disabled",true);
							}
						}
						// Build the APM grid only on the first edit-load - the criteria rerender re-runs this while Configure Scope is hidden, sizing the grid to zero.
						var loadAPMEntities = jsonResponse.data.moduleType !== undefined && jsonResponse.data.moduleType == 5 && !OPMClient.APController.get("apmEntityGridLoaded"); //No I18N
						if (loadAPMEntities) {
							// APM: Ensure filter divs are visible and entity grid is loaded before restoring selections
							$(".devices,.groups,.interfaces").hide(); //No I18N
							$(".apmmonitors").show(); //No I18N
							$(".groupAlarmScopeDiv").hide(); //No I18N
							$(".PropagateDevice").hide(); //No I18N
							var apmDataParams = {};
							eeMSPHadlingsForAP(apmDataParams);
							var supportedAPMCategory = OPMClient.APController.get("supportedAPMCategory"); //No I18N
							if(supportedAPMCategory) {
								apmDataParams.category = supportedAPMCategory;
							}
							var apmListResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/listAPMMonitors", apmDataParams); //No I18N
							if (apmListResponse !== undefined && apmListResponse.data !== undefined) {
								$('.availableBox .nodataMsg').hide(); //No I18N
								$('.availableBox .opm_jqGridUI').show(); //No I18N
								var apmRows = apmListResponse.data;
								$.each(apmRows, function(i, item) { item.moid = item.resourceId; });
								var colNamesList = [Ember.I18n.t('webclient.devices.properties.DisplayName'), Ember.I18n.t('webclient.nfa.widget.resource.category'), '', '']; //No I18N
								var colModelList = [
									{ name: 'displayName', index: 'displayName', formatter: escapeHtmlTags }, //No I18N
									{ name: 'type', index: 'type', formatter: escapeHtmlTags }, //No I18N
									{ name: 'moid', index: 'moid', hidden: true, sortable: false }, //No I18N
									// Placeholder column every other entity grid carries - the shared search icon is injected into its <th>.
									{ name: 'id', index: 'id', hidden: true, sortable: false, search: false } //No I18N
								];
								$("#entityList").jqGrid('GridUnload'); //No I18N
								// Same options as the Apply Filter path so the grid behaves identically on edit-load and after a filter.
								var defaultOptions = { minRowsPerPage: 10, multiselect: true, Search: false, searchOption: true, toggleSearch: false, hideCSV: true, hideExcel: true, rowList: [10, 50, 100, 200, 500], loadCompleteFunction: restoreAPMEntitySelections };
								opm_loadJQgridWithData("#entityList", apmRows, colNamesList, colModelList, "", "#entityPager", "apEntityList", defaultOptions); //No I18N
								$("#entityList").jqGrid("setGridParam", { //No I18N
									onSelectRow: function(id, status) {
										var entityData = $("#entityList").jqGrid("getRowData", id); //No I18N
										if (status) {
											OPMClient.APController.pushSelectedEntity(entityData);
										} else {
											OPMClient.APController.removeSelectedEntity(entityData);
										}
									},
									onSelectAll: function(rowIds, status) {
										var rows = $("#entityList").jqGrid("getRowData"); //No I18N
										$.each(rows, function(i, entityData) {
											if (status) {
												OPMClient.APController.pushSelectedEntity(entityData);
											} else {
												OPMClient.APController.removeSelectedEntity(entityData);
											}
										});
									}
								});
								$("#cb_" + $("#entityList")[0].id).hide(); //No I18N
								OPMClient.APController.set("apmEntityGridLoaded", true); //No I18N
							}
						}
						if(OPMClient.APController.selectedEntities===undefined || OPMClient.APController.selectedEntities ===null ||OPMClient.APController.selectedEntities.length == 0) {
							$.each(selectedItems, function (key, val) {
								// For APM: resolve displayName from grid data since AM_ManagedObject.DISPLAYNAME may be empty
								if(jsonResponse.data.moduleType == 5 && typeof apmRows !== "undefined" && apmRows) { //No I18N
									for(var ai = 0; ai < apmRows.length; ai++) {
										if(apmRows[ai].moid == val.moid || apmRows[ai].resourceId == val.resourceId) {
											OPMClient.APController.pushSelectedEntity(apmRows[ai]);
											return true;
										}
									}
								}
								OPMClient.APController.pushSelectedEntity(val);
							});
						}
						// selectedEntities is populated after the grid was built, so reload once to let restoreAPMEntitySelections check the saved rows.
						if (loadAPMEntities) {
							Ember.run.schedule("afterRender", function() { //No I18N
								$("#entityList").trigger('reloadGrid'); //No I18N
								// The grid was built mid-render, before the entity boxes had their final width - size it once the layout exists.
								resizeAPEntityGrid("#entityList"); //No I18N
								resizeAPEntityGrid("#selectedEntityList"); //No I18N
							});
						}
					}

					//Time Window
					$("#period").val(jsonResponse.data.timeInterval);
					$("#periodType").select2().val(jsonResponse.data.timeUnit).trigger("change"); //No I18N
					if (jsonResponse.data.consecutiveTimes != -1) {
						$("#consecutiveTimes").val(jsonResponse.data.consecutiveTimes);
					}
					if (jsonResponse.data.timeWindow !== undefined) {
						if (jsonResponse.data.timeWindow != -1) {
							$("#businessHourRuleDiv").removeClass("alarmProfileDisabled");
							$("input[name=timeWindow][value='bussinessHours']").prop("checked", true);
							OPMClient.APController.set("bhRuleID",jsonResponse.data.timeWindow); //No I18N
						} else {
							$("#businessHourRuleDiv").addClass("alarmProfileDisabled");
							$("input[name=timeWindow][value='24hours']").prop("checked", true);
						}
					}
					//Trigger Alarm
					$("#triggerSeverity").select2().val(jsonResponse.data.triggerSeverity).trigger("change"); //No I18N
					$("#triggerMessage").val(jsonResponse.data.triggerMessage);
					$("#rearmMessage").val(jsonResponse.data.rearmMessage);
					$('#resetTrigger').prop('checked', jsonResponse.data.resetTrigger);
					if (jsonResponse.data.alarmSource !== undefined) {
                        // Scope dropdown values are already set during init above - just persist to controller
						OPMClient.APController.set("alarmSource", jsonResponse.data.alarmSource); //No I18N
					}
					if (jsonResponse.data.rearmWorkflow !== undefined) {
						OPMClient.APController.set("rearmWorkflow", jsonResponse.data.rearmWorkflow); //No I18N
					}
					if (jsonResponse.data.triggerWorkflow !== undefined) {
						OPMClient.APController.set("triggerWorkflow", jsonResponse.data.triggerWorkflow); //No I18N
					}

					//Notifiacation Profile
					if (jsonResponse.data.rearmNotification !== undefined) {
						OPMClient.APController.set("rearmNotification", jsonResponse.data.rearmNotification); //No I18N
					}
					if (jsonResponse.data.triggerNotification !== undefined) {
						OPMClient.APController.set("triggerNotification", jsonResponse.data.triggerNotification); //No I18N
					}

					//Trigger Criteria
					if (jsonResponse.data.triggerCriteria !== undefined && !$.isEmptyObject(jsonResponse.data.triggerCriteria)) {
						OPMClient.APController.set("editTriggerCriteria", jsonResponse.data.triggerCriteria); //No I18N
						OPMClient.APController.set("triggerMatchCondition", jsonResponse.data.triggerMatchCondition); //No I18N
						this.editAPCriteria(triggerId);
					}
					if (jsonResponse.data.rearmCriteria !== undefined && !$.isEmptyObject(jsonResponse.data.rearmCriteria)) {
						OPMClient.APController.set("editRearmCriteria", jsonResponse.data.rearmCriteria); //No I18N
						OPMClient.APController.set("rearmMatchCondition", jsonResponse.data.rearmMatchCondition); //No I18N
					}
				} else {
					opmGlobalRoute.transitionTo("Settings.Configurations.AlarmRules.Custom");//No I18N
					return false;
				}
			}
		} else {
            OPMClient.APController.set("isDefaultAlarmRule", false); //No I18N
			this.addNewAPCriteriaObj();
		}
	},
	getCriteriaList: function () {
		return jQuery.extend(true, [], this.get("criteria")); //No I18N
	}, paramsselectedObserver: function () {
		this.rerender();
	}.observes('apCriteriaList'),//NO I18N
	addNewAPCriteriaObj: function (isEditAP) {
		var criteriaList = this.getCriteriaList();
		var triggerId = this.get("triggerId");
		if (!isEditAP) {
			if (criteriaList.length > 0) {
				criteriaList[criteriaList.length - 1].showAndOr = true;
			}
			var obj = {
				index: criteriaList.length,
				rowNumber: criteriaList.length + 1,
				andOr: "AND",//No I18N
				showAndOr: false,
				showDelete: true,

				criteriaID: -1,
				criteriaName: "",
				criteriaDisplayName: Ember.I18n.t("webclient.attacks.criteria.selectmsg",this), //No I18N
				conditionDisplayName: Ember.I18n.t("webclient.ap.add.criteria.conditionapply",this), //No I18N
				criteriaValueType: "NUMERIC", //No I18N
				criteriaCondition: "=",
				criteriaValue: "",
				criteriaInstanceName: "value", //No I18N
				criteriaScopeType: -1,
				criteriaScopeValue: -1,
				defaultValues: false,
				valueTypes: false
			};
			if(triggerId !== "triggerId") {
				obj.id = "CriteriaSel" + obj.index;
			}
			criteriaList.pushObject(obj);

			if (criteriaList.length > 0) {
				if(criteriaList[criteriaList.length-1].index > 0) {
					criteriaList[criteriaList.length - 1].showDelete = true;
				} else {
					criteriaList[criteriaList.length - 1].showDelete = false;
				}
			}
		}
		if (criteriaList.length > 1) {
			this.set('showCriteriaPattern', true);//No I18N
		} else {
			this.set('showCriteriaPattern', false);//No I18N
		}
		this.set("criteria", criteriaList); //No I18N
		if (triggerId === "triggerId") {
			OPMClient.APController.rearmCriteriaList = criteriaList;
		} else {
			OPMClient.APController.criteriaList = criteriaList;
		}

		/* if (isEditAP && criteriaList.length > 1) {
			loadAPCriteriaPattern(this.get('criteria'), triggerId);
			saveAPCriteriaPattern(triggerId);
		} */
		initAlarmProfileActions(triggerId);
	},
	editAPCriteria: function(triggerId) {
		var self = this;
		var apCriteriaList = this.get("apCriteriaList");
		var criteriaList = this.getCriteriaList();

		var isEditAP = OPMClient.APController.get("isEditAP");
		var isCopyAP = OPMClient.APController.get("isCopyAP");
		if(triggerId === "triggerId") {
			$('#AdvancedReamCriteria').prop('checked', true);
			toggleRearmCriteria();
			var editCriteria = OPMClient.APController.editRearmCriteria;
			var editMatchCondition = OPMClient.APController.get("rearmMatchCondition");
		} else {
			var editCriteria = OPMClient.APController.editTriggerCriteria;
			var editMatchCondition = OPMClient.APController.get("triggerMatchCondition");
		}
		$.each(editCriteria, function (key, val) {
			var disable = false;
			if(val.condition!==undefined && val.condition!==undefined && val.condition.includes("Empty")) {
				disable = true;
			}
			if (criteriaList.length > 0) {
				criteriaList[criteriaList.length - 1].showAndOr = true;
			}

			//Settings Condition Display names
			var conditionDisplayName = Ember.I18n.t("webclient.ap.add.criteria.conditionapply",this); //No I18N
			var selectedItemsSelDev = -1;
			var apCriteriaListEdit = apCriteriaList;
			if(triggerId !== "triggerId") {
				if (val.scopeType !== undefined && val.scopeValue !== undefined) {
					if (val.scopeType == 1) {
						if (val.selectedItems !== undefined && !$.isEmptyObject(val.selectedItems)) {
							selectedItemsSelDev = val.selectedItems;
						}
						var criteriaScopeValueCount = val.scopeValue.split(',').length;
						conditionDisplayName = criteriaScopeValueCount + " "+Ember.I18n.t("webclient.common.elements",this) + " " + Ember.I18n.t("webclient.Selected",this); //No I18N
						Ember.run.schedule("afterRender", function() { //No I18N
							self.send("enableCondition",parseInt(key-1),"selectDevices"); //No I18N
							$("#condition" + parseInt(key-1) + " input:radio[value=selectDevices]").prop("checked",true); //No I18N
						});
                        var moduleType = getAlarmProfileModuleID();
						var selectedEntities = val.scopeValue;
                        if(OPMClient.APController.isRealTimeAP === true) {
                            selectedEntities = val.scopeValue[0];  // For real-time profiles, only the Alarm Properties criteria will be displayed, irrespective of the selected entities
                        }
						var dataParams={"selectedItems":selectedEntities, "moduleID":moduleType} //No I18N
						if(OPMClient.APController.isRealTimeAP===true) {
                            dataParams.ruleType = '2'; //No I18N
                        } else if (OPMClient.APController.isDefaultAlarmRule === true) {
                            dataParams.ruleType = '3'; //No I18N
                        }
						eeMSPHadlingsForAP(dataParams);
						var apCriteriaListDevices = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/alarm/getAlarmProfileCriteria",dataParams);//No I18N
						if(apCriteriaListDevices.error !== undefined) {
							opm_infoMsgs('errorMsg', apCriteriaListDevices.error.message);//No I18N
						} else if(apCriteriaListDevices.criteriaDetails!==undefined && apCriteriaListDevices.criteriaDetails.length>0) {
							apCriteriaListEdit = apCriteriaListDevices.criteriaDetails; //No I18N
						}
					} if (val.scopeType == -1) {
						conditionDisplayName = Ember.I18n.t("any",this) + " " + Ember.I18n.t("webclient.common.elements",this); //No I18N
						Ember.run.schedule("afterRender", function() { //No I18N
							$("#condition" + parseInt(key-1) + " input:radio[value=alldevices]").prop("checked",true); //No I18N
						});
					} if (val.scopeType == 2) {
						conditionDisplayName = val.scopeValue + "% "+Ember.I18n.t("webclient.common.elements",this); //No I18N
						Ember.run.schedule("afterRender", function() { //No I18N
							$("#condition" + parseInt(key-1) + " input:radio[value=definedScope]").prop("checked",true); //No I18N
							$("#condition" + parseInt(key-1) + " .scopeVal").val(val.scopeValue); //No I18N
							$("#condition" + parseInt(key-1) + " .scopeValType ").select2().val("percentage").trigger("change"); //No I18N
							self.send("enableCondition",parseInt(key-1),"definedScope"); //No I18N
						});
					} if (val.scopeType == 3) {
						conditionDisplayName = Ember.I18n.t("any",this)+" " + val.scopeValue + " "+Ember.I18n.t("webclient.common.elements",this); //No I18N
						Ember.run.schedule("afterRender", function() { //No I18N
							$("#condition" + parseInt(key-1) + " input:radio[value=definedScope]").prop("checked",true); //No I18N
							self.send("enableCondition",parseInt(key-1),"definedScope"); //No I18N
							$("#condition" + parseInt(key-1) + " .scopeVal").val(val.scopeValue); //No I18N
							$("#condition" + parseInt(key-1) + " .scopeValType ").select2().val("value").trigger("change"); //No I18N
						});
					}
				}
			}

			var defaultValues = false;
			var valueTypes = false;
			var unit = false;
			var criteriaDisplayName = Ember.I18n.t("webclient.attacks.criteria.selectmsg",this); //No I18N
			var criteriaName = "";
			var displayUnit = "";
			$.each(apCriteriaListEdit, function (key1, val1) {
				if (val1.criteriaID == val.id) {
					$.each(val1.criteriaList, function (key2, val2) {
						if (val.name === val2.columnName) {
							criteriaName = val.name;
							if (val2.defaultValues !== undefined && val2.defaultValues.length > 0) {
								defaultValues = val2.defaultValues;
							}
							criteriaDisplayName = val2.displayName;
							if(val2.unit!==undefined) {
								unit = val2.unit;
								displayUnit = unit;
								if(unit.length > 7){
									displayUnit=unit.substring(0, 7)+" ...";//NO I18N
								}
							}

							if (val1.valueTypes !== undefined && val1.valueTypes.length > 0) {
								$.each(val1.valueTypes, function (key3, val3) {
									var i18str = Ember.I18n.t(val3.displayName, this);
									val3.displayName = (i18str.indexOf("Missing translation") != -1) ? val3.displayName : i18str;
									// Check if valueTypes name matches additionalCondition and set defaultValues and unit
									if (val3.columnName !== undefined && val3.columnName === val.additionalCondition) {
										if (val3.defaultValues !== undefined) {
											defaultValues = val3.defaultValues;
										}
										if (val3.unit !== undefined) {
											unit = val3.unit;
											displayUnit = unit;
											if(unit.length > 7){
												displayUnit=unit.substring(0, 7)+" ...";//NO I18N
											}
										}
									}
								});
								valueTypes = val1.valueTypes;
							}
						}
					});
				}
			});
			if(val.name!==undefined && val.name!==null && val.name==="PERIOD") {
				val.value = parseInt(val.value) / 60;
			}

			var obj = {
				index: criteriaList.length,
				rowNumber: criteriaList.length + 1,
				andOr: "AND",//No I18N
				showAndOr: false,
				showDelete: true,

				criteriaID: val.id,
				criteriaName: criteriaName,
				criteriaDisplayName: criteriaDisplayName,
				conditionDisplayName: conditionDisplayName,
				criteriaValueType: val.valueType,
				criteriaCondition: val.condition,
				criteriaValue: val.value,
				criteriaInstanceName: val.additionalCondition,
				criteriaScopeType: val.scopeType,
				criteriaScopeValue: val.scopeValue,
				defaultValues: defaultValues,
				valueTypes: valueTypes,
				unit: unit,
				displayUnit: displayUnit,
				disable: disable,
				selectedItemsSelDev:selectedItemsSelDev,
				apCriteriaList:apCriteriaList
			};
			if(triggerId !== "triggerId") {
				obj.id = "CriteriaSel" + obj.index;
			}
			criteriaList.pushObject(obj);

			if (criteriaList.length > 0) {
				if(criteriaList[criteriaList.length-1].index > 0) {
					criteriaList[criteriaList.length - 1].showDelete = true;
				} else {
					criteriaList[criteriaList.length - 1].showDelete = false;
				}
			}
		});
		this.set("criteria", criteriaList); //No I18N
		this.addNewAPCriteriaObj(isEditAP);

		if (editMatchCondition !== undefined && editMatchCondition !== "1" && editMatchCondition !== "-1") {
			$("#APCriteriaPattern"+triggerId).val(editMatchCondition);
			Ember.run.schedule("afterRender", function() { //No I18N
				saveAPCriteriaPattern(triggerId,editMatchCondition);
			});
		}
	},
	retainGroupConditionVal:function(editCriteria) {
		var self = this;
		$.each(editCriteria, function (key, val) {
			if (val.criteriaScopeType !== undefined && val.criteriaScopeValue !== undefined) {
				if (val.criteriaScopeType == 1) {
					if(val.criteriaScopeValue!==-1 && val.criteriaScopeValue!=="-1") {
						var criteriaScopeValueCount = val.criteriaScopeValue.split(',').length;
						conditionDisplayName = criteriaScopeValueCount + " "+Ember.I18n.t("webclient.common.elements",this) +" " + Ember.I18n.t("webclient.Selected",this); //No I18N
						Ember.run.schedule("afterRender", function() { //No I18N
							self.send("enableCondition",parseInt(val.index),"selectDevices"); //No I18N
							$("#condition" + parseInt(val.index) + " input:radio[value=selectDevices]").prop("checked",true); //No I18N
						});
					}
				} if (val.criteriaScopeType == -1) {
					conditionDisplayName = Ember.I18n.t("any",this) +" " + Ember.I18n.t("webclient.common.elements",this); //No I18N
					Ember.run.schedule("afterRender", function() { //No I18N
						$("#condition" + parseInt(val.index) + " input:radio[value=alldevices]").prop("checked",true); //No I18N
					});
				} if (val.criteriaScopeType == 2) {
					conditionDisplayName = val.criteriaScopeValue + "% "+Ember.I18n.t("webclient.common.elements",this); //No I18N
					Ember.run.schedule("afterRender", function() { //No I18N
						$("#condition" + parseInt(val.index) + " input:radio[value=definedScope]").prop("checked",true); //No I18N
						$("#condition" + parseInt(val.index) + " .scopeVal").val(val.criteriaScopeValue); //No I18N
						$("#condition" + parseInt(val.index) + " .scopeValType ").select2().val("percentage").trigger("change"); //No I18N
						self.send("enableCondition",parseInt(val.index),"definedScope"); //No I18N
					});
				} if (val.criteriaScopeType == 3) {
					conditionDisplayName = Ember.I18n.t("any",this)+" " + val.criteriaScopeValue + " "+Ember.I18n.t("webclient.common.elements",this); //No I18N
					Ember.run.schedule("afterRender", function() { //No I18N
						$("#condition" + parseInt(val.index) + " input:radio[value=definedScope]").prop("checked",true); //No I18N
						self.send("enableCondition",parseInt(val.index),"definedScope"); //No I18N
						$("#condition" + parseInt(val.index) + " .scopeVal").val(val.criteriaScopeValue); //No I18N
						$("#condition" + parseInt(val.index) + " .scopeValType ").select2().val("value").trigger("change"); //No I18N
					});
				}
			}
		});
	},
	actions: {
		childActions: function (functionName, param1, param2, param3, param4) {
			this.send(functionName, param1, param2, param3, param4);
		},
		addAPCriteria: function () {
			var criteriaList = this.getCriteriaList();
			var triggerId = this.get("triggerId");
			var maxCriteriaCount = 10;
			if(triggerId!==undefined && triggerId!==null && triggerId==="triggerId") {
				maxCriteriaCount = 5;
			}
			if(criteriaList!==undefined && criteriaList.length < maxCriteriaCount) {
				var flag = false;
				for (i = 0; i < criteriaList.length; i++) {
					flag = validateAPCriteria(criteriaList[i], triggerId);
					if (!flag) { return; }
				}
				this.addNewAPCriteriaObj();
				if (triggerId === "triggerId") {
					OPMClient.APController.rearmCriteriaList = criteriaList;
				} else {
					OPMClient.APController.criteriaList = criteriaList;
					this.retainGroupConditionVal(criteriaList);
				}
				loadAPCriteriaPattern(this.get('criteria'), triggerId);
			} else {
				alert(Ember.I18n.t("webclient.ap.criteria.allowed.max", {maxCriteriaCount: maxCriteriaCount})); //No I18N
				return false;
			}
		},
		deleteAPCriteria: function (index) {
			var criteriaList = this.getCriteriaList();
			if (index == criteriaList.length - 1 && criteriaList.length !== 1) {
				criteriaList[index - 1].showAndOr = false;
			}
			criteriaList.removeAt(index);
			for (var i = index; i < criteriaList.length; i++) {
				criteriaList[i].index = i;
				criteriaList[i].rowNumber = i + 1;
			}
			var triggerId = this.get("triggerId");
			if (criteriaList.length > 1) {
				this.set('showCriteriaPattern', true);//No I18N
				loadAPCriteriaPattern(criteriaList, triggerId);
			} else {
				this.set('showCriteriaPattern', false);//No I18N
			}
			if (triggerId === "triggerId") {
				OPMClient.APController.rearmCriteriaList = criteriaList;
			} else {
				OPMClient.APController.criteriaList = criteriaList;
				this.retainGroupConditionVal(criteriaList);
			}
			this.set("criteria", criteriaList); //No I18N
			initAlarmProfileActions(triggerId);
		},
		selectCriteria: function (index, criteriaID, selCriteria) {
			var criteriaList = this.getCriteriaList();
			var apCriteriaList = this.get("apCriteriaList");

			var conditionDisplayName = $("#condition" + index + " .credSelected").text();
			var valueTypes = false;
			$.each(apCriteriaList, function (key, val) {
				if (criteriaID == val.criteriaID) {
					if(!$.isEmptyObject(val.valueTypes)){
						$.each(val.valueTypes, function (key1, val1) {
							var i18str = Ember.I18n.t(val1.displayName, this);
							val1.displayName = (i18str.indexOf("Missing translation") != -1) ? val1.displayName : i18str;
						});
						valueTypes = val.valueTypes;
					}
				}
			});

			var displayUnit = selCriteria.unit;
			if(selCriteria.unit!=undefined && selCriteria.unit.length > 7){
				displayUnit=selCriteria.unit.substring(0, 7)+"...";//NO I18N
			}
			criteriaList[index].conditionDisplayName = conditionDisplayName;
			criteriaList[index].criteriaDisplayName = selCriteria.displayName;
			criteriaList[index].criteriaID = criteriaID;
			criteriaList[index].criteriaName = selCriteria.columnName;
			criteriaList[index].criteriaValueType = selCriteria.columnType;
			criteriaList[index].criteriaValue =  "";
			criteriaList[index].defaultValues = selCriteria.defaultValues;
			criteriaList[index].valueTypes = valueTypes;
			criteriaList[index].unit = selCriteria.unit;
			criteriaList[index].displayUnit = displayUnit;
			criteriaList[index].criteriaInstanceName = selCriteria.criteriaInstanceName;
			this.set("criteria", criteriaList); //No I18N
			var triggerId = this.get("triggerId");
			if (triggerId === "triggerId") {
				OPMClient.APController.rearmCriteriaList = criteriaList;
			} else {
				OPMClient.APController.criteriaList = criteriaList;
				this.retainGroupConditionVal(criteriaList);
			}
			initAlarmProfileActions(triggerId);
		},
		andOr: function (index, andOr) {
			var criteriaList = this.getCriteriaList();
			if (andOr === "AND") {
				var andOr = "OR"; //No I18N
			} else {
				var andOr = "AND"; //No I18N
			}
			criteriaList[index].andOr = andOr;
			this.set("criteria", criteriaList); //No I18N
			var triggerId = this.get("triggerId");
			if (triggerId === "triggerId") {
				OPMClient.APController.rearmCriteriaList = criteriaList;
			} else {
				OPMClient.APController.criteriaList = criteriaList;
				this.retainGroupConditionVal(criteriaList);
			}
			loadAPCriteriaPattern(this.get('criteria'), triggerId);
			initAlarmProfileActions(triggerId);
		},
		selectDevicesAP: function (index) {
			var criteriaList = this.getCriteriaList();
			OPMClient.APController.set("selectDevicesAPIndex", index); //No I18N
			if(criteriaList[index].selectedItemsSelDev!==undefined && criteriaList[index].selectedItemsSelDev!==-1) {
				OPMClient.APController.set("selectDevicesAPselectedItems", criteriaList[index].selectedItemsSelDev);
			}
			opmGlobalRoute.transitionTo("Settings.Configurations.AddAlarmProfile.SelectDevices");//No I18N
		},
		cancelDevicesAP: function () {
			opm_transitionToParentRoute('Settings.Configurations.AddAlarmProfile'); //No I18N
		},
		selectCondition: function (index, conditionVal) {
			var criteriaList = this.getCriteriaList();
			var apCriteriaList = this.get("apCriteriaList");
			if (conditionVal !== undefined && conditionVal === "alldevices") {
				criteriaList[index].conditionDisplayName = Ember.I18n.t("any",this)+" "+Ember.I18n.t("webclient.common.elements",this); //No I18N
				criteriaList[index].criteriaScopeType = -1;
				criteriaList[index].criteriaScopeValue = -1;
				this.set("criteria", criteriaList); //No I18N
				var triggerId = this.get("triggerId");
				if (triggerId === "triggerId") {
					OPMClient.APController.rearmCriteriaList = criteriaList;
				} else {
					criteriaList[index].apCriteriaList = apCriteriaList;
					OPMClient.APController.set("criteriaList", criteriaList);
					this.retainGroupConditionVal(criteriaList);
				}
				initAlarmProfileActions(triggerId);
			}
			else if (conditionVal !== undefined && conditionVal === "selectedscope") {
				var scopeVal = $("#condition" + index + " .scopeVal").val(); //No I18N
				var scopeValType = $("#condition" + index + " .scopeValType").val(); //No I18N
				var scopeValId = "condition" + index + " .scopeVal"; //NO I18N
				var toValidate = { "empty": [scopeValId], 'nonnegativeFloatOrEmpty':[scopeValId], 'nonZero':[scopeValId], 'rangeCheck':{} }; //NO I18N
				toValidate.rangeCheck[scopeValId] = 100;
				if(opm_validateFields(toValidate)) {
					if (scopeValType !== undefined && scopeValType === "percentage") {
						criteriaList[index].conditionDisplayName = scopeVal + "% "+Ember.I18n.t("webclient.common.elements",this); //No I18N
						criteriaList[index].criteriaScopeType = 2;
						criteriaList[index].criteriaScopeValue = scopeVal;
					} else {
						criteriaList[index].conditionDisplayName = Ember.I18n.t("any",this)+" " + scopeVal + " "+Ember.I18n.t("webclient.common.elements",this); //No I18N
						criteriaList[index].criteriaScopeType = 3;
						criteriaList[index].criteriaScopeValue = scopeVal;
					}
					this.set("criteria", criteriaList); //No I18N
					var triggerId = this.get("triggerId");
					if (triggerId === "triggerId") {
						OPMClient.APController.rearmCriteriaList = criteriaList;
					} else {
						criteriaList[index].apCriteriaList = apCriteriaList;
						OPMClient.APController.set("criteriaList", criteriaList);
						this.retainGroupConditionVal(criteriaList);
					}
					initAlarmProfileActions(triggerId);
				}
			} else {
				var moduleType = getAlarmProfileModuleID();
				var selDevList = OPMClient.APController.get("selDevList");
				var selDevListStr = selDevList.toString();
				if(selDevListStr !==undefined && selDevListStr !==null && selDevListStr !=="") {
					if(OPMClient.APController.isRealTimeAP === true) {
                        selDevListStr = selDevList[0];  // For real-time profiles, only the Alarm Properties criteria will be displayed, irrespective of the selected entities
                    }
					var dataParams={"selectedItems":selDevListStr, "moduleID":moduleType} //No I18N
					if(OPMClient.APController.isRealTimeAP===true) {
					    dataParams.ruleType = '2'; //No I18N
                    } else if (OPMClient.APController.isDefaultAlarmRule === true) {
                        dataParams.ruleType = '3'; //No I18N
					}
					eeMSPHadlingsForAP(dataParams);
					var criteriaDetails = [];
					var apCriteriaList = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/alarm/getAlarmProfileCriteria",dataParams);//No I18N
					if(apCriteriaList.error !== undefined) {
						opm_infoMsgs('errorMsg', apCriteriaList.error.message);//No I18N
					} else if(apCriteriaList.criteriaDetails!==undefined && apCriteriaList.criteriaDetails.length>0) {
						criteriaDetails = apCriteriaList.criteriaDetails; //No I18N
					}
				}
				var criteriaScopeValueCount = selDevList.length;
				criteriaList[index].conditionDisplayName = criteriaScopeValueCount + " "+Ember.I18n.t("webclient.common.elements",this) + " "+Ember.I18n.t("webclient.Selected",this);; //No I18N
				criteriaList[index].criteriaScopeType = 1;
				criteriaList[index].criteriaScopeValue = selDevListStr;
				this.set("criteria", criteriaList); //No I18N
				var triggerId = this.get("triggerId");
				if (triggerId === "triggerId") {
					OPMClient.APController.rearmCriteriaList = criteriaList;
				} else {
					criteriaList[index].apCriteriaList = criteriaDetails;
					OPMClient.APController.set("criteriaList", criteriaList);
					this.retainGroupConditionVal(criteriaList);
				}
				initAlarmProfileActions(triggerId);
			}
		},
		enableCondition: function (index, conditionVal) {
			if (conditionVal !== undefined && conditionVal === "definedScope") {
				if($("#condition" + index + " #definedScope").hasClass("alarmProfileDisabled")) {
					$("#condition" + index + " #definedScope").removeClass("alarmProfileDisabled"); //No I18N
				}

				if(!$("#condition" + index + " #selectDevices").hasClass("alarmProfileDisabled")) {
					$("#condition" + index + " #selectDevices").addClass("alarmProfileDisabled"); //No I18N
				}
			}
			if (conditionVal !== undefined && conditionVal === "selectDevices") {
				if($("#condition" + index + " #selectDevices").hasClass("alarmProfileDisabled")) {
					$("#condition" + index + " #selectDevices").removeClass("alarmProfileDisabled"); //No I18N
				}
				
				if(!$("#condition" + index + " #definedScope").hasClass("alarmProfileDisabled")) {
					$("#condition" + index + " #definedScope").addClass("alarmProfileDisabled"); //No I18N
				}
			}
		}
	}
});

OPMClient.ApCriteriaComponent = Ember.Component.extend({
	templateName: "components/ap-criteria", //No I18N
	selEntityPrompt: Ember.I18n.t('webclient.action.select',this)+" "+Ember.I18n.t("webclient.api.ui.event.entity",this), //No I18N
	didInsertElement: function () {
		var triggerId = this.get("triggerId"); //No I18N
		if(triggerId!==undefined && triggerId!==null) {
			var criteria = this.get("criteria");
			var index = criteria.index;
			//Accordion Heading
			$("#criteriaList" + triggerId+ index).off('click.apAccordion').on('click.apAccordion', '.accordion-heading', function () {
				$(this).parent().toggleClass('active');
			});
			//Credential search
			$("#criteriaSearch" + triggerId+index).keyup(function () {
			var searchString = $(this).val();
				listSearch(searchString,"criteriaList" + triggerId+index);//No I18N
			});
			//Validate numeric criteria value on blur
			$("#criteriaList" + triggerId+index).off('blur.criteriaNumeric').on('blur.criteriaNumeric', '.criteriaValue', function () {
				if (criteria && criteria.criteriaValueType === "NUMERIC") { //No I18N
					validateAPCriteria(criteria, triggerId);
				}
			});
		}

		Ember.run.scheduleOnce("afterRender", function() { //No I18N
			$('#criteria'+triggerId+criteria.index+' .selectBox').on('click', function () {
				if(!$(this).parents(".credentialBox  .selectBox").hasClass('active')){
					$('.credentialBox .selectBox').parent().removeClass("active");
				}
				$(this).parents("#criteria"+triggerId+criteria.index).toggleClass('active');
			});

			$('#condition'+triggerId+criteria.index+ ' .selectBox').on('click', function () {
				if(!$(this).parents(".credentialBox  .selectBox").hasClass('active')){
					$('.credentialBox .selectBox').parent().removeClass("active");
				}
				$(this).parents('#condition'+triggerId+criteria.index).toggleClass('active');
			});
		});

	},
	criteriaConditionObserver: function () {
		var triggerId = this.get("triggerId"); //No I18N
		if(triggerId!==undefined && triggerId!==null) {
			var criteria = this.get("criteria");
			if(criteria.criteriaCondition!==undefined && criteria.criteriaCondition!==null && criteria.criteriaCondition.includes("Empty")) {
				$("#criteriaList"+triggerId+criteria.index+" .criteriaValue").prop("disabled", true); //No I18n
				$("#criteriaList"+triggerId+criteria.index+" .criteriaValue").val(""); //No I18n
				criteria.disable = true;
				criteria.criteriaValue = "";
			} else {
				$("#criteriaList"+triggerId+criteria.index+" .criteriaValue").prop("disabled", false); //No I18n
				criteria.disable=false;
			}
			this.set("criteria",criteria); //No I18N
		}
	}.observes('criteria.criteriaCondition'),//NO I18N
	criteriaValTypeObserver: function () {
        var triggerId = this.get("triggerId");
        if (triggerId === undefined || triggerId === null) { return; }

        var criteria = this.get("criteria") || {};
        var selInstanceName = criteria.criteriaInstanceName;
        var criteriaID = criteria.criteriaID;

        // source of definitions: prefer criteria.apCriteriaList, fallback to controller list
        var apCriteriaList = (criteria.apCriteriaList && Array.isArray(criteria.apCriteriaList)) ? criteria.apCriteriaList : (OPMClient.APController && OPMClient.APController.apCriteriaList) ? OPMClient.APController.apCriteriaList : [];

        // defaults if not present
        criteria.unit = criteria.unit || "";
        criteria.displayUnit = criteria.displayUnit || "";
        criteria.defaultValues = criteria.defaultValues || undefined;
    	criteria.criteriaValue = "";

        // find matching criteria definition and instance
        for (var i = 0; i < apCriteriaList.length; i++) {
            var apDef = apCriteriaList[i];
            if (apDef && (apDef.criteriaID == criteriaID || criteriaID === undefined)) {
                var list = apDef.valueTypes || [];
                for (var j = 0; j < list.length; j++) {
                    var inst = list[j];
                    // match by columnName or displayName (adjust if your data uses a different key)
                    if (!selInstanceName) { continue; }
                    if (inst && inst.columnName === selInstanceName) {
                        // copy details
                        if (inst.unit !== undefined) {
                            criteria.unit = inst.unit;
                            criteria.displayUnit = inst.unit;
                        } else {
    						criteria.displayUnit = "";
    						criteria.unit = "";
    					}
                        if (inst.displayName !== undefined) {
                            criteria.criteriaInstanceDisplayName = inst.displayName;
                        } else {
    						criteria.criteriaInstanceDisplayName = "";
    					}
                        if (inst.defaultValues !== undefined) {
                            criteria.defaultValues = inst.defaultValues;
                        } else {
    						criteria.defaultValues = [];
    					}
                        // if the instance provides nested valueTypes, expose them for template usage
                        if (inst.valueTypes !== undefined) {
                            criteria.valueTypes = inst.valueTypes;
                        }
                        // stop searching
                        break;
                    }
                }
                break;
            }
        }

        // persist changes and rerender the component row so template updates (unit, displayUnit, defaultValues etc.)
        this.set("criteria", criteria); //No I18N

        // schedule a rerender after bindings settle
        Ember.run.scheduleOnce('afterRender', this, function () { //No I18N
            try {
                this.rerender();
            } catch (e) {
                // fallback: nothing to do
            }
        });
    }.observes('criteria.criteriaInstanceName'), //No I18N
	criteriaScopeValueObserver: function () {
		var triggerId = this.get("triggerId"); //No I18N
		if(triggerId!==undefined && triggerId!==null && triggerId==="triggerId") {
			var criteria = this.get("criteria");
			var moduleType = getAlarmProfileModuleID();
			this.set("criteria.apCriteriaList", []); //No I18N
			if(criteria.criteriaScopeValue !==undefined && criteria.criteriaScopeValue !==null && criteria.criteriaScopeValue !=="") {
				var selectedEntities = criteria.criteriaScopeValue;
				if(OPMClient.APController.isRealTimeAP === true) {
                    selectedEntities = criteria.criteriaScopeValue[0];  // For real-time profiles, only the Alarm Properties criteria will be displayed, irrespective of the selected entities
                }
				var dataParams={"selectedItems":selectedEntities, "moduleID":moduleType} //No I18N
				if(OPMClient.APController.isRealTimeAP===true) {
                    dataParams.ruleType = '2'; //No I18N
                } else if (OPMClient.APController.isDefaultAlarmRule === true) {
                    dataParams.ruleType = '3'; //No I18N
                }
				eeMSPHadlingsForAP(dataParams);
				var apCriteriaList = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/alarm/getAlarmProfileCriteria",dataParams);//No I18N
				if(apCriteriaList.error !== undefined) {
					opm_infoMsgs('errorMsg', apCriteriaList.error.message);//No I18N
				} else if(apCriteriaList.criteriaDetails!==undefined && apCriteriaList.criteriaDetails.length>0) {
					this.set("criteria.apCriteriaList", apCriteriaList.criteriaDetails); //No I18N
				}
			}
			Ember.run.schedule("afterRender", function() { //No I18N
				this.rerender();
			});
		}
	}.observes('criteria.criteriaScopeValue'),//NO I18N
	actions: {
		subChildActions: function (functionName, param1, param2, param3, param4) {
			this.sendAction('action', functionName, param1, param2, param3, param4); //No I18N
		},
		criteriListObserverAction: function(selDevList) {
			var triggerId = this.get("triggerId"); //No I18N
			if(triggerId!==undefined && triggerId!==null && triggerId==="") {
				var criteria = this.get("criteria");
				OPMClient.APController.set("selDevList",selDevList); //No I18N
				this.get('parentView').send('selectCondition',criteria.index); //No I18N
			}
		}
	}
});

OPMClient.ApProfileComponent = Ember.Component.extend({
	templateName: "components/ap-profile", //No I18N
	didInsertElement: function () {
		var isEditAP = OPMClient.APController.get("isEditAP");
		var selectedNotifications = OPMClient.APController.get("selectedNotifications");
		var profileList = this.getProfileList();
		this.set("profile", []); //No I18N

		if(isEditAP) {
			if(selectedNotifications!==undefined && selectedNotifications.length>0) {
				$.each(selectedNotifications, function (key, val) {
					profileList.pushObject({
						index: profileList.length
					});
				});
				this.set("profile", profileList); //No I18N
				this.addNewProfileObj(isEditAP);
			} else {
				this.addNewProfileObj();
			}
		} else {
			this.addNewProfileObj();
		}

		var profileType = getNotificationProfileTypes();
		OPMClient.APController.set("selectedNProfileType", ''); //No I18N
		OPMClient.APController.set("npProfileType", profileType); //No I18N
		if(isEditAP) {
			var dataParams = {};
			eeMSPHadlingsForAP(dataParams);
			setTimeout(function () {
				// MSP uses the templates API directly; other editions use the profiles API and remap to the template shape.
				var notificationList = [];
				if(window.OPM.isMSPCentral || window.OPM.isMSPProbe) {
					var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/listNotificationTemplates",dataParams);//No I18N
					if(response !== undefined && response.error === undefined && Array.isArray(response)) {
						notificationList = response;
					}
				} else {
					dataParams.isTemplateIncluded = true;
					var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listNotificationProfiles",dataParams);//No I18N
					if(response !== undefined && response.error === undefined && Array.isArray(response)) {
						$.each(response, function(idx, item) {
							notificationList.push({templateID: item.profileID, profileName: item.profileName, profileType: item.profileLabel});
						});
					}
				}
				$.each(selectedNotifications, function (key, val) {
					$.each(notificationList, function (key1, val1) {
						if(val1.templateID == val) {
							$(".npProfileTypeList"+key).select2().val(val1.profileType).trigger("change");//No I18N
							$(".npProfileList"+key).select2().val(val1.templateID).trigger("change");//No I18N
						}
					});
				});
			});
		}
	},

	getProfileList: function () {
		return jQuery.extend(true, [], this.get("profile")); //No I18N
	},
	addNewProfileObj: function (isEditAP) {
		var profileList = this.getProfileList();
		if (!isEditAP) {
			var newProfObj = {
				index: profileList.length
			}
			this.get("profile").pushObject(newProfObj); //No I18N
		}
		OPMClient.APController.set("profileList", profileList); //No I18N
		initAlarmNPProfileActions();
	},

	actions: {
		addAPProfile: function () {
			var profileList = this.getProfileList();

			var flag = false;
			for (i = 0; i < profileList.length; i++) {
				flag = validateAPNotificationProfile(profileList[i]);
				if (!flag) { return; }
			}

			if(profileList!==undefined && profileList.length < 2) {
				this.addNewProfileObj();
				OPMClient.APController.profileList = profileList;
			} else {
				alert(Ember.I18n.t("webclient.ap.np.maxlimit",this)); //No I18N
				return false;
			}
		},
		deleteAPProfile: function (index) {
			if(index>0) {
				var profileList = this.getProfileList();
				if (profileList.length > 1) {
					this.get("profile").removeObject(this.get("profile")[index]); //No I18N
				}
				OPMClient.APController.set("profileList", profileList); //No I18N
				initAlarmNPProfileActions();
			}
		},
		changeProfileType: function (index) {
			var profType = $(".npProfileTypeList" + index).val();
			if (profType != undefined && profType != null && profType != '') {
				var data = { 'profileType': profType };//No I18N
				eeMSPHadlingsForAP(data);
				var npProfileList = [{ 'text': Ember.I18n.t("webclient.action.select",this), 'id': -1 }]; //No I18N
				// MSP uses the templates API (id = templateID); other editions use the profiles API (id = profileID).
				if(window.OPM.isMSPCentral || window.OPM.isMSPProbe) {
					var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/listNotificationTemplates", data);//No I18N
					if (response !== undefined && response.error === undefined && Array.isArray(response)) {
						$.each(response, function (key, val) {
							npProfileList.push({ 'text': escapeHTML(val.profileName), 'id': val.templateID });
						});
					}
				} else {
					data.isTemplateIncluded = true;
					var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listNotificationProfiles", data);//No I18N
					if (response !== undefined && response.error === undefined && Array.isArray(response)) {
						$.each(response, function (key, val) {
							npProfileList.push({ 'text': escapeHTML(val.profileName), 'id': val.profileID });
						});
					}
				}
				$(".npProfileList" + index).empty().select2({ data: npProfileList });//No I18N
			}
		}
	}
});
OPMClient.OpmKempMasterInfoComponent = Ember.Component.extend({
	templateName: "components/opm-kemp-master-info", //No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		this.set('widgetData.sizey',9); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmKempChildStatusComponent = Ember.Component.extend({
	templateName: "components/opm-kemp-child-status", //No I18N
	didInsertElement: function(){
		this.set('widgetData.sizey',9); //No I18N
		var widgetID = this.get('widgetData.id'); //No I18N
		$("#widgetElement_"+widgetID).addClass("kempChildStatusWidget");//No I18N
		$("#widgetElement_"+widgetID+" .grid-stack-item-content > div").removeClass("overflowHidden");//No I18N
		var apiData = this.get('widgetData.apiData');//No I18n
		this.set("connectionPercent",("width:"+((apiData.activeConnection/apiData.totalConnection)*100).toFixed(2))+"%");//No I18n
		this.set("packetsPercent",("width:"+((apiData.inPackets/(apiData.inPackets+apiData.outPackets))*100).toFixed(2))+"%");//No I18n
		this.set("trafficPercent",("width:"+((apiData.inBytes/(apiData.inBytes+apiData.outBytes))*100).toFixed(2))+"%");//No I18n
	},
	actions:{
		goToListPage:function(){
			if(OPMClient.InventoryDeviceDetailsController.kempLBDetails.type!==undefined){
				$('.kempLBSnapshot ul li[name="'+OPMClient.InventoryDeviceDetailsController.kempLBDetails.type+'"]').click();//No I18N
				OPMClient.InventoryDeviceDetailsController.kempLBDetails = {}
			}
		},
		showTimePeriod:function(){
			if($("#"+this.elementId+" .ddType1__view").hasClass("active")){
				$("#"+this.elementId+" .ddType1__view").removeClass("active"); //NO I18N
			}else{
				$("#"+this.elementId+" .ddType1__view").addClass("active"); //NO I18N
			}
		},
		changeTimePeriod:function(selVal){
			var prevValue = $("#"+this.elementId+" .ddType1__list ul li.active").attr("value");//NO I18N
			if(selVal!==prevValue || selVal==="custom"){//No I18N
				if(selVal==="custom")//No I18N
				{
					$('#customTimeStatic').show();
					$('#CustomTimeDiv').show();
					OPMClient.InventoryDeviceDetailsController.selectedSmallSlide = true;
					$('#deviceSnapshotSmallHeader').text(Ember.I18n.t('webclient.Custom.Time',this));//No I18N
					deviceSlideIn(3);
					if($('#onceonly_from_hrs_sel option').length == 0 && $('#onceonly_to_hrs_sel option').length == 0 && $('#onceonly_from_mins_sel option').length == 0 && $('#onceonly_to_mins_sel option').length == 0){
						setCustomTimeFilter();
					}
					showCustomTimePeriod(OPMClient.FWAGlobalDataController.startTime,OPMClient.FWAGlobalDataController.endTime);
				}
				else{
				$("#"+this.elementId+" .ddType1__list ul li").removeClass("active");//No I18N
				$("#"+this.elementId+" .ddType1__list ul li[value='"+selVal+"']").addClass("active");//No I18N
				$("#"+this.elementId+" .ddType1__view").removeClass("active"); //NO I18N
				$("#"+this.elementId+" .ddType1__view span").text($("#"+this.elementId+" .ddType1__list ul li.active").text());//No I18N
				for(var i=0;i<OpmSnapwidgetComponentArray.length;i++)
				{
                    if(OpmSnapwidgetComponentArray[i]!==undefined && OpmSnapwidgetComponentArray[i].widgetData!==undefined && (OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.kemplb.child.graphdata.traffic" || OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.kemplb.child.graphdata.packets" || OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.kemplb.child.graphdata.totalconnections" || OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.kemplb.child.graphdata.activeconnections"))
                    {
                        Ember.set(OpmSnapwidgetComponentArray[i].widgetData,'reloadTrigger',true);//No I18N
	                    }
                    }
                }
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmKempChildSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-kemp-child-summary", //No I18N
	didInsertElement: function(){
		var widgetID = this.get('widgetData.id'); //No I18N
		$("#widgetElement_"+widgetID).addClass("kempChildSummaryWidget");//No I18N
		this.set('widgetData.translatedDesc',(OPMClient.InventoryDeviceDetailsController.kempLBDetails.type==="virtualService")?Ember.I18n.t("webclient.opm.kemplb.child.summary",this):Ember.I18n.t("webclient.opm.kemplb.child.rs.summary",this));//No I18N
		this.set('widgetData.sizey',(OPMClient.InventoryDeviceDetailsController.kempLBDetails.type==="virtualService")?12:7); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmKempTreeViewComponent = Ember.Component.extend({
	templateName: "components/opm-kemp-tree-view", //No I18N
	firstAPICall:true,
	noData:false,
	didInsertElement: function(){
		var self = this;
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId+' .jstree').jstree({//No I18N
		    "plugins":["json_data","sort"],//No I18N
		    "core": {//NO I18N
                'data' : {//No I18N
				    'url':function (node) {//No I18N
				    	return window.OPM.apiUrlPattern + '/v2/device/getKempTreeViewDetails';//No I18N
				    },
				    'data':function(node){//No I18N

				    	if(node!==undefined && node.original!==undefined && (node.original.type == "VirtualService" || node.original.type == "SubVirtualService"))
						{
							var pobj = {};
							pobj.moId = node.id;
							pobj.type = node.original.type;
							pobj.deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
							if(window.OPM.isCentralServer){
								pobj.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
							}
							return pobj;
						}else{
							var pobj = {};
							if(OPMClient.InventoryDeviceDetailsController.kempLBDetails.type!==undefined){
								pobj.moId = OPMClient.InventoryDeviceDetailsController.kempLBDetails.moId;
								pobj.type = "VirtualService";//No I18N
							}else{
							pobj.moId = self.get("snapshotObj.moID");//No I18N
							pobj.type = "LoadBalancer";//No I18N
							}
							pobj.deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
							if(window.OPM.isCentralServer){
								pobj.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
							}
							return pobj;
						}
				    },
				    'dataFilter':function(data){//No I18N
				    	if(data!==undefined && data!=="" && self.get("firstAPICall"))//No I18N
				    	{
				    		self.set("firstAPICall",false);//No I18N
				    		var filteredData = JSON.parse(data);
				    		if(filteredData.length===0)
				    		{
				    			self.set("noData",true);//No I18N
				    }
				    		else if(OPMClient.InventoryDeviceDetailsController.kempLBDetails.type==="virtualService")//No I18N
					    	{
					    		filteredData = [{
					    			"a_attr": {//No I18N
								        "title": OPMClient.InventoryDeviceDetailsController.kempLBDetails.name//No I18N
								    },
								    "children": true,//No I18N
								    "icon": "status"+OPMClient.InventoryDeviceDetailsController.kempLBDetails.status,//No I18N
								    "parent":"#",//No I18N
								    "id": OPMClient.InventoryDeviceDetailsController.kempLBDetails.moId+"",//No I18N
								    "text": OPMClient.InventoryDeviceDetailsController.kempLBDetails.name,//No I18N
								    "type": "VirtualService"//No I18N
					    		}];
								return JSON.stringify(filteredData);
					    	}
				    	}
				    	return data;
				    }
				},
				'force_text': true //No I18n
            }
		}).on('after_open.jstree',function(e,data){//No I18N
	        var modHt = Math.ceil(($('.jsTreeType1').innerHeight()+53)/22)+1;//No I18N
	        self.set('widgetData.sizey',modHt); //No I18N
	        self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	  		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		}).on('loaded.jstree',function(e,data){//No I18N
			if(self.get("noData"))
			{
				self.set('widgetData.noData',true);//No I18N
				self.set('widgetData.sizey',2);//No I18N
			}else{
	        		var modHt = Math.ceil(($('.jsTreeType1').innerHeight()+53)/22)+1;//No I18N
	        		self.set('widgetData.sizey',modHt); //No I18N
			}
	        	self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	  		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		}).on('after_close.jstree',function(e,data){//No I18N
	        var modHt = Math.ceil(($('.jsTreeType1').innerHeight()+53)/22)+1;//No I18N
	        self.set('widgetData.sizey',modHt); //No I18N
	        self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	  		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		});
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmKempGraphsComponent = Ember.Component.extend({
	templateName: "components/opm-kemp-graphs", //No I18N
	showGraph:false,
	didInsertElement: function(){
		$("#widgetElement_"+this.get('widgetData.id')).addClass("kempChildGraphWidget");//No I18N
		var self = this;
		var graphParams = {};
		var currentWidgetData = this.get('widgetData');//No I18N
		var apiResponse = this.get('widgetData.apiData');//No I18N
		var graphData = [];
		var legendEnabled = true;
		var InTableData = [],OutTableData = [], consolidatedValues = [];
		if(currentWidgetData.name==="webclient.opm.kemplb.child.graphdata.packets")//No I18N
		{
			if(apiResponse.inPackets!==undefined && apiResponse.inPackets.graphData!==undefined)
			{
				if(apiResponse.inPackets.graphData.length>0 && apiResponse.inPackets.graphData[0].seriesname)
				{
					apiResponse.inPackets.graphData[0].seriesname = Ember.I18n.t("NFAWidget.IN",this);//No I18N
					if(apiResponse.inPackets.graphData[0].data!==undefined && apiResponse.inPackets.graphData[0].data.length>0)
					{
						InTableData = apiResponse.inPackets.graphData[0].data;
					}
				}
				graphData = apiResponse.inPackets.graphData;
			}
			// if(apiResponse.inPackets.consolidatedValues!==undefined){
			// 	var inConsolidatedValues = apiResponse.inPackets.consolidatedValues;
			// 	if(inConsolidatedValues!==undefined && inConsolidatedValues.length>0)
			// 	{
			// 		inConsolidatedValues[0].seriesName = Ember.I18n.t("NFAWidget.IN",this);//No I18N
			// 		inConsolidatedValues[0]["95thpercentileValue"] = inConsolidatedValues[0]["95thperc"];//No I18N
			// 		consolidatedValues = inConsolidatedValues;
			// 	}
			// }
			if(apiResponse.outPackets!==undefined && apiResponse.outPackets.graphData!==undefined)
			{
				if(apiResponse.outPackets.graphData.length>0 && apiResponse.outPackets.graphData[0].seriesname)
				{
					apiResponse.outPackets.graphData[0].seriesname = Ember.I18n.t("NFAWidget.OUT",this);//No I18N
					if(apiResponse.outPackets.graphData[0].data!==undefined && apiResponse.outPackets.graphData[0].data.length>0)
					{
						OutTableData = apiResponse.outPackets.graphData[0].data;
					}
				}
				graphData = graphData.concat(apiResponse.outPackets.graphData);
			}
			// if(apiResponse.outPackets.consolidatedValues!==undefined){
			// 	var outConsolidatedValues = apiResponse.outPackets.consolidatedValues;
			// 	if(outConsolidatedValues!==undefined && outConsolidatedValues.length>0)
			// 	{
			// 		outConsolidatedValues[0].seriesName = Ember.I18n.t("NFAWidget.OUT",this);//No I18N
			// 		outConsolidatedValues[0]["95thpercentileValue"] = outConsolidatedValues[0]["95thperc"];//No I18N
			// 		consolidatedValues = consolidatedValues.concat(outConsolidatedValues);
			// 	}
			// }
		}else if(currentWidgetData.name==="webclient.opm.kemplb.child.graphdata.traffic")//No I18N
		{
			if(apiResponse.inTraffic!==undefined && apiResponse.inTraffic.graphData!==undefined)
			{
				if(apiResponse.inTraffic.graphData.length>0 && apiResponse.inTraffic.graphData[0].seriesname)
				{
					apiResponse.inTraffic.graphData[0].seriesname = Ember.I18n.t("NFAWidget.IN",this);//No I18N
					if(apiResponse.inTraffic.graphData[0].data!==undefined && apiResponse.inTraffic.graphData[0].data.length>0)
					{
						InTableData = apiResponse.inTraffic.graphData[0].data;
					}
				}
				graphData = apiResponse.inTraffic.graphData;
			}
			// if(apiResponse.inTraffic.consolidatedValues!==undefined){
			// 	var inConsolidatedValues = apiResponse.inTraffic.consolidatedValues;
			// 	if(inConsolidatedValues!==undefined && inConsolidatedValues.length>0)
			// 	{
			// 		inConsolidatedValues[0].seriesName = Ember.I18n.t("NFAWidget.IN",this);//No I18N
			// 		inConsolidatedValues[0]["95thpercentileValue"] = inConsolidatedValues[0]["95thperc"];//No I18N
			// 		consolidatedValues = inConsolidatedValues;
			// 	}
			// }
			if(apiResponse.outTraffic!==undefined && apiResponse.outTraffic.graphData!==undefined)
			{
				if(apiResponse.outTraffic.graphData.length>0 && apiResponse.outTraffic.graphData[0].seriesname)
				{
					apiResponse.outTraffic.graphData[0].seriesname = Ember.I18n.t("NFAWidget.OUT",this);//No I18N
					if(apiResponse.outTraffic.graphData[0].data!==undefined && apiResponse.outTraffic.graphData[0].data.length>0)
					{
						OutTableData = apiResponse.outTraffic.graphData[0].data;
					}
				}
				graphData = graphData.concat(apiResponse.outTraffic.graphData);
			}
			// if(apiResponse.outTraffic.consolidatedValues!==undefined){
			// 	var outConsolidatedValues = apiResponse.outTraffic.consolidatedValues;
			// 	if(outConsolidatedValues!==undefined && outConsolidatedValues.length>0)
			// 	{
			// 		outConsolidatedValues[0].seriesName = Ember.I18n.t("NFAWidget.OUT",this);//No I18N
			// 		outConsolidatedValues[0]["95thpercentileValue"] = outConsolidatedValues[0]["95thperc"];//No I18N
			// 		consolidatedValues = consolidatedValues.concat(outConsolidatedValues);
			// 	}
			// }
		}else
		{
			graphData = apiResponse.graphData;
			legendEnabled = false;
			if(apiResponse.graphData.length>0 && apiResponse.graphData[0].data!==undefined && apiResponse.graphData[0].data.length>0)
			{
				InTableData = apiResponse.graphData[0].data;
			}
			// if(apiResponse.consolidatedValues!==undefined && apiResponse.consolidatedValues.length>0){
			// 	var consolValues = apiResponse.consolidatedValues;
			// 	consolValues[0].seriesName = Ember.I18n.t(self.get("widgetData.desc"),this);//No I18N
			// 	consolValues[0]["95thpercentileValue"] = consolValues[0]["95thperc"];//No I18N
			// 	consolidatedValues = consolValues;
			// }
		}
		if(graphData!==undefined && graphData.length>0)
		{
			graphParams = getZChartObject('PerfGraph'+self.get('widgetData').id,'','','',null,null,'','',{graphData:graphData},self,'snapWidgetHalf');//No I18N
			self.set('widgetData.sizey',24); //No I18N
			// if(consolidatedValues!==undefined && consolidatedValues.length>0)
			// {
			// 	graphParams.consolidatedValues = consolidatedValues;
			// 	self.set('widgetData.sizey',(consolidatedValues.length===1)?18:19); //No I18N
			// }else{
			// 	self.set('widgetData.sizey',15); //No I18N
			// }
		self.setProperties({showGraph:true,graphParams:graphParams});
		self.set('widgetData.noData',false); //No I18N
		}else{
			this.set('widgetData.noData',true);//No I18N
			this.set('widgetData.sizey',2);//No I18N
		}

		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
	  	this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
	  	self.setProperties({'widgetData.hideExpand':true,'widgetData.showGrphExpandOption':true});//No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmIpmiTestConnectionComponent = Ember.Component.extend({
	templateName: "components/opm-ipmi-test-connection",//No I18N
	didInsertElement: function(){
		var colNames = [Ember.I18n.t("opm.storagecredentials.credentialname",this),Ember.I18n.t("opm.perf.watchdog.report.credential.type",this),Ember.I18n.t("webclient.credential.result",this),"",""]; //No I18n
		var colModel = [
			{name: 'credName', index: 'credName'}, //No I18n
			{name: 'credType', index: 'credType'}, //No I18n
			{name: 'result', index: 'result',formatter:severityIntfGrpIcon}, //No I18n
			{name: 'statusNum', index: 'statusNum', hidden: true}, //No I18n
			{name: 'id', index: 'id', hidden: true,sortable:false} //No I18n
		];
		var defaultOptions = {minRowsPerPage:10,Search:false,searchOption:true,toggleSearch:false,hideCSV:true,hideExcel:true,sortable:false};
		opm_loadJQgridWithData('#credResultList',this.get('slideDetails.formattedData'),colNames,colModel,'','#credResultPager','',defaultOptions); //No I18n
		$('#credResultList').setGridWidth($('#ipmi_testConnection .slideContentContainer').width()-100);//No I18N
	},
	actions: {
		closeAction: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	}
});
OPMClient.OpmMapsColorCodeSettingComponent = Ember.Component.extend({
templateName: "MapSettings",//No I18N
didInsertElement: function() {
		this.set('controller',window.userPermissions);//No I18N
		getBvTrafficColors();
		setColorOnTrafficLoadTable();
		$('.trafficLoad li').click(function(){
			$('.trafficLoad li').removeClass('active');
			$(this).addClass('active');
		});
		for(var i=0; i<=8; i++) {
			$('#trafficLoadColor_'+i).ColorPicker({
				flat: true,
				color: getColorCode($("#trafficLoadColor_"+i+" .colorBox").css("backgroundColor")),
				onSubmit: function(hsb, hex, rgb, el) {
					$(el).val(hex);
					if(isBVLegendColorDuplicate(hex,el)) {
						$(el).ColorPickerHide();
						$('li.active').find('.colorBox').css('background','#'+hex);
					}
				}
			});
		}
		$('.trafficLoad li .colorPickerHead .closeBtn,.trafficLoad li .colorpicker_submit').click(function(){
			if($(this).parents('li').hasClass('active')){
				$(this).parents('li').removeClass('active');
				return false
			}
		});
		$('.trafficLoad li .colorPickerHead .closeBtn,.trafficLoad li .colorpicker_submit').attr('save',Ember.I18n.t('webclient.button.save',this)); //No I18N

	},
	actions:{
		saveBVTrafficLegendColors: function() {
			var self = this;
			var trafficLoadColors = [];
			var trafficLoadColorsProp = {};
			var trafficLoadColorsKey = {"0":"00-00%","1":"00-1%","2":"1-10%","3":"10-25%","4":"25-40%","5":"40-55%","6":"55-70%","7":"70-85%","8":"85-100%"};//No I18n	
			for(var i=0;i<=8;i++) {
				var colors = getColorCode($("#trafficLoadColor_"+i+" .colorBox").css("backgroundColor")); //No I18n	
				//trafficLoadColors.push(colors);
				trafficLoadColorsProp[trafficLoadColorsKey[String(i)]] = colors;
			}
			var url = window.OPM.apiUrlPattern + '/businessview/saveLegendColors'; //No I18N
			var data = {"legendColors": JSON.stringify(trafficLoadColorsProp)}; //No I18n
			var callBackFn = function(response) {
				if(response.result !== undefined)
				{
			    	var message = response.result.message;
			    	opm_infoMsgs("successMsg",message); //No I18N
				self.send('closeColorCodeSlide');//No I18N
			    }
			    else if(response.error !== undefined)
			    {
			    	opm_infoMsgs("errorMsg",response.error.message); //No I18N
			    }
			}
			opm_ajaxPostRequestWithMsg(url,data,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),callBackFn);//No I18N	
		},
		closeColorCodeSlide: function() {
			this.get('parentView').set("controller.slideDetails",undefined);//No I18N
        }
	}
});

OPMClient.OpmBgpMiniGraphComponent = Ember.Component.extend({
	classNames:['graph-divs-small-blkgrad'],//No I18N
	chartobj:{},
	showGraph:false,
	templateName: "components/opm-bgp-mini-graph",//No I18N
	didInsertElement: function(){
		var graphObj = this.get('graphObj');
		var parentModel = this.get('parentModel');
		var graphIndex = this.get('graphIndex');
		var self = this;
		var graphType = graphObj.key;
		var bgpMoId = this.get('bgpMoId');
		var peerIndex = this.get('peerIndex');
		var period = "Today"; //No I18N
	
		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.type === "Cisco Catalyst SD-WAN")
		{
				var paramsData = 'sdwanID=' + OPMClient.InventoryDeviceDetailsController.moID+ '&elementID=' + peerIndex +'&graphType=' + graphType + '&elementType=Tunnel&period='+period; //No I18N
			var graphDataUrl = window.OPM.apiUrlPattern + '/v2/device/getSDWANMonitorGraphData'; // No I18N
		}
		else{
				var paramsData = 'deviceName=' + parentModel.deviceName + '&peerMoid=' + bgpMoId + '&graphType=' + graphType + '&period='+period + '&peerIndex='+peerIndex; //No I18N
			var graphDataUrl = window.OPM.apiUrlPattern + '/v2/device/getBGPGraphData'; // No I18N
		}
		var urlSign = opm_checkIndexOf(graphDataUrl, "?") ? "&" : "?";
		graphDataUrl = graphDataUrl + urlSign + paramsData;
		graphDataUrl = eeClientReqToProbe(graphDataUrl, OPMClient.InventoryDeviceDetailsController.eeProbeID);
		$.ajax({
			type: 'GET', //No I18N
			url: graphDataUrl,
			dataType: "json",  //No I18N
			async: false,
			graphIndex: graphIndex,
			self: self,
			success: function (jsonDataGraph) {
				var dispName = Ember.I18n.t("webclient.devices.details.avail",this);//No I18N
				if(jsonDataGraph.displayName!==undefined) {
					dispName = jsonDataGraph.displayName;
				}
				var x_axes = jsonDataGraph.xyTitles !== undefined ? jsonDataGraph.xyTitles[0] : Ember.I18n.t("webclient.vimonitor.Time",this);//No I18N
				var y_axes = jsonDataGraph.xyTitles !== undefined ? jsonDataGraph.xyTitles[1] : Ember.I18n.t("webclient.devices.details.avail",this);//No I18N
				var maxRange = null;
				var minRange = null;
				if (jsonDataGraph.xyTitles !== undefined && jsonDataGraph.xyTitles[1] !== undefined && (jsonDataGraph.xyTitles[1].toLowerCase().indexOf("utilization") != -1 || jsonDataGraph.xyTitles[1].toLowerCase().indexOf("percentage") != -1 || jsonDataGraph.xyTitles[1].indexOf("%") != -1)) {//No I18N
					maxRange = 100;
					minRange = 0;
				}
				var perfChartObj = {
					id: 'graph_mini_' + graphIndex, //No I18N
					type: 'area', //No I18N
					jsonData: jsonDataGraph.graphData,
					series: "multi", //No I18N
					height: 250,
					columns: {
						datatype_1: 'time', datatype_2: 'numeric', columnname_1: x_axes, columnname_2: y_axes, timeFormat: 'hours' //No I18N
					},
					tooltip: [0, Ember.I18n.t('webclient.devices.intftypes.value', this) + " : {{val(1)}} ({{col(1)}})"],//No I18N
					canvas: {
						title: {
							show: true,
							text: dispName
						}
					},
					legend: {
						"enabled": false //No I18N
					},
					"axes": { //No I18N
						"rotated": false, //No I18N
						"xaxis": { //No I18N
							"label": { //No I18N
								"text": x_axes //No I18N
							}
						},
						"yaxis": [ //No I18N
							{
								"label": { //No I18N
									"text": y_axes //No I18N
								},
								"minRange": minRange,//No I18N
								"maxRange": maxRange//No I18N
							}
						]
					},
					chart: {
						stacked: false
					}
				}
				if (graphType !== undefined && graphType === "Availability") {
					perfChartObj.type = 'line';//No I18N
					perfChartObj.columns.format = { customFormat: function (value) { return opm_AvailValueToString(value); } };
				}
				if ('MonitoringDevice' === parentModel.snapType) {
					addInstanceNameToGraphTooltip(perfChartObj);
				}
				self.set('chartObj', perfChartObj);//No I18N
				self.set('showGraph', true);//No I18N
				self.set('graphType', graphType);//No I18N
			}
		});
	},
	actions: {
		openSingleBGPGraph: function(){
			var parentModel = this.get('parentModel');
			var graphObj = this.get('graphObj');
			OPMClient.DeviceMonitorsActionController.set('pollID',graphObj.key);//No I18N
			var bgpMoId = this.get('bgpMoId');
			var peerIndex = this.get('peerIndex');
			openSingleBGPGraph(bgpMoId,graphObj.key,parentModel,peerIndex);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmAnsibleIntegrationComponent = Ember.Component.extend({
	templateName: "components/opm-ansible-integration", //No I18n
	didInsertElement: function() {
		var self = this;
		$("#ansiblePlayBookList").select2();
		$("#ansible_runargumenttext").select2();
		setTimeout(function(){
    		$('#ansiblePlayBookList').select2({minimumResultsForSearch: 1 }); //No I8N
		},500);
		$('.testActionNp').text(Ember.I18n.t('opm.ansible.verifyconnection',this)); //No I18n
	},
	initDefaults:function() {
		var self = this;
		self.set('selectedAnsiPlayBook',""); //No I18n
		this.set('playBookPrompt',Ember.I18n.t('webcient.ansible.playbook.select',this)); //No I18n
		var apiURL = window.OPM.apiUrlPattern + "/admin/getAnsiblePlaybookList"; //No I18n
		var callBackFn = function(response){
			if(response.error === undefined){
				var playBookList = [];
				$.each(response, function(key, value){
					playBookList.push({name:key,value:value});
				});
				self.set('playBookList',playBookList); //No I18n
				Ember.run.scheduleOnce('afterRender',this,function(){//No I18N
					$("#ansiblePlayBookList").val(self.get('selectedAnsiPlayBook')).select2(); //No I18n
				});
			}
			else {
				opm_infoMsgs("errorMsg",response.error.message); //No I18N
			}
		}
		opm_ajaxGetResponseWithMsg(apiURL,{},Ember.I18n.t('opm.np.ansible.fetch.waitmsg',this),callBackFn);//No I18N
		if(this.isTemplate && this.model !== undefined) {
			if(this.model.task==="Add") { //NO I18N
				this.set("model.messageVariable",""); //NO I18N
			} else if(this.model.task === "Edit" || this.model.task === "Copy"){ //No I18n
				if(this.model.selectedPlayBook !== "-1"){ //No I18n
					self.set('selectedAnsiPlayBook',this.model.selectedPlayBook); //No I18n
				}
			} 
			this.set("model.msgVariablePrompt",Ember.I18n.t("webclient.admin.profiledetails.ArgumentVariable")); //NO I18N
		} else if(!this.isTemplate){
			var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/admin/getMailVariables"); //NO I18N
			var variableList = [];
			for(key in list) {
				for(var i=0;i<list[key].length;i++) {
					variableList.push({group:key,name:list[key][i].key,value:list[key][i].value});
				}
			}
			this.set('variableList',variableList); //No I18n
			this.set('msgVariablePrompt',Ember.I18n.t("webclient.admin.profiledetails.ArgumentVariable")); //No I18n
			if(this.model !== undefined && this.model.command !== undefined){
				var selPlayBook = this.model.playbookId;
				var selVariables = this.model.sysarguments;
				if(selPlayBook !== "-1") { //No I18n
					self.set('selectedAnsiPlayBook',selPlayBook); //No I18n
				}
				self.set('messageVariable',selVariables); //No I18n
			}
		}
	}.on("init"), //NO I18N
	messageVariableChanged:function() {
		setProfileMsgtext('ansible_runargumenttext','ansible_runarguments'); //No I18n
	}.observes("selectedMessageVariable"), //NO I18N
	ansiblPlayBookChanged:function() {
		this.set('selectedPlayBook',$("#ansiblePlayBookList").val()); //No I18n
	}.observes("selectedPlayBook"), //NO I18N
	actions: {
		refreshPlayBookList: function()
		{
			var self = this;
			this.set('playBookPrompt',Ember.I18n.t('webcient.ansible.playbook.select',this)); //No I18n
			setTimeout(function(){
	    		$('#ansiblePlayBookList').select2({minimumResultsForSearch: 1 }); //No I8N
			},500);
			var apiURL = window.OPM.apiUrlPattern + "/admin/getAnsiblePlaybookList"; //No I18n
			var callBackFn = function(response){
				if(response.error === undefined){
					var playBookList = [];
					$.each(response, function(key, value){
						playBookList.push({name:key,value:value});
					});
					self.set('playBookList',playBookList); //No I18n
					Ember.run.scheduleOnce('afterRender',this,function(){//No I18N
						if(self.get('selectedAnsiPlayBook') !==  "-1") { //No I18n
							$("#ansiblePlayBookList").val(self.get('selectedAnsiPlayBook')).select2(); //No I18n
						} else {
							$("#ansiblePlayBookList").val("").select2(); //No I18n
						}
					});
				}
				else {
					opm_infoMsgs("errorMsg",response.error.message); //No I18N
				}
			}
			opm_ajaxGetResponseWithMsg(apiURL,{"needRefresh":true},Ember.I18n.t('opm.np.ansible.fetch.waitmsg',this),callBackFn);//No I18N
		}
	},
	willDestroyElement: function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});
OPMClient.OpmPingResponseComponent = Ember.Component.extend({
     templateName: "components/opm-ping-response", //No I18N
     didInsertElement:function() {
     	$("body").addClass("commonSliderActive");//No I18N
         var self = this;
         var colNames = [
             Ember.I18n.t('webclient.devices.details.devicename',this),//No I18N
             Ember.I18n.t('jsp.commonstr.Result',this)//No I18N
         ];
         var colModel= [
                 {name:'deviceName',index:'deviceName',width:40,sortable:false}, //No I18N
                 {name:'pingResponse',index:'pingResponse',width:60,formatter:showPingResponse,sortable:false} //No I18N
         ];
         var jsonResponse = [];
         var deviceNameList = self.get("slideDetails.deviceNameList");//No I18N
         var devArr = deviceNameList.split(",");//No I18N
		 var postData = {};
		 postData.deviceName = removeDuplicatesInArray(devArr.slice(0,5)).toString();
		 postData.isBulk = true;
		 if(self.get("slideDetails.isFromWANLinks") !== undefined){
			postData.fromWANLink = true;
		 }
         jsonResponse = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/device/getPingResponse',postData);//No I18N
         //$("#OpM_AlertInfo").empty();//No I18N
         if(jsonResponse!==undefined && jsonResponse.error!==undefined && jsonResponse.error.message!==undefined)
         {
             opm_infoMsgs("errorMsg",jsonResponse.error.message);//No I18N
             jsonResponse = [];
         }else if(devArr.length<=5)
         {
         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
         }
         if(devArr.length>5)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(5,10));
                 var cbmethod = function(lazyResp){
                 	if(lazyResp!==undefined && lazyResp.error!==undefined && lazyResp.error.message!==undefined)
                     {
                         opm_infoMsgs("errorMsg",lazyResp.error.message);//No I18N
                     }
                     if(devList.length===1 && lazyResp!==undefined && lazyResp.PingResponse!==undefined && lazyResp.PingResponse.Details!==undefined)
                     {
                         var rowData = {deviceName:devList.toString(),pingResponse:lazyResp.PingResponse.Details};
                         $("#pingResponseList").jqGrid('addRowData',6,rowData,"last");//No I18N
                     }
                     else
                     {
	                     if(lazyResp!==undefined && lazyResp.length>0)
	                     {
	                         for(var i=0;i<lazyResp.length;i++)
	                         {
	                             $("#pingResponseList").jqGrid('addRowData',(5+1+i),lazyResp[i],"last");//No I18N
	                         }
	                     }
	                }
	                if(devArr.length<=10)
		         {
		         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
                 }
                 }
				 var data = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					data.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',data,"",cbmethod);//No I18N   
             },500);
         }
         if(devArr.length>10)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(10,20));
                 var cbmethod = function(lazyResp){
                 	if(lazyResp!==undefined && lazyResp.error!==undefined && lazyResp.error.message!==undefined)
                     {
                         opm_infoMsgs("errorMsg",lazyResp.error.message);//No I18N
                     }
                     if(devList.length===1 && lazyResp!==undefined && lazyResp.PingResponse!==undefined && lazyResp.PingResponse.Details!==undefined)
                     {
                         var rowData = {deviceName:devList.toString(),pingResponse:lazyResp.PingResponse.Details};
                         $("#pingResponseList").jqGrid('addRowData',11,rowData,"last");//No I18N
                     }
                     else
                     {
                     if(lazyResp!==undefined && lazyResp.length>0)
                     {
                         for(var i=0;i<lazyResp.length;i++)
                         {
                             $("#pingResponseList").jqGrid('addRowData',(10+1+i),lazyResp[i],"last");//No I18N
                         }
                     }
                 }
                  if(devArr.length<=20)
		         {
		         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
                 }
                 }
				 var data = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					data.fromWANLink = true;
				 }
                  opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',data,"",cbmethod);//No I18N       
             },1000);
         }
         if(devArr.length>20)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(20,30));
                 var cbmethod = function(lazyResp){
                 	if(lazyResp!==undefined && lazyResp.error!==undefined && lazyResp.error.message!==undefined)
                     {
                         opm_infoMsgs("errorMsg",lazyResp.error.message);//No I18N
                     }
                     if(devList.length===1 && lazyResp!==undefined && lazyResp.PingResponse!==undefined && lazyResp.PingResponse.Details!==undefined)
                     {
                         var rowData = {deviceName:devList.toString(),pingResponse:lazyResp.PingResponse.Details};
                         $("#pingResponseList").jqGrid('addRowData',21,rowData,"last");//No I18N
                     }
                     else
                     {
                     if(lazyResp!==undefined && lazyResp.length>0)
                     {
                         for(var i=0;i<lazyResp.length;i++)
                         {
                             $("#pingResponseList").jqGrid('addRowData',(20+1+i),lazyResp[i],"last");//No I18N
                         }
                     }
                 }
                 if(devArr.length<=30)
		         {
		         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
                 }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },2000);
         }
         if(devArr.length>30)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(30,40));
                 var cbmethod = function(lazyResp){
                 	if(lazyResp!==undefined && lazyResp.error!==undefined && lazyResp.error.message!==undefined)
                     {
                         opm_infoMsgs("errorMsg",lazyResp.error.message);//No I18N
                     }
                     if(devList.length===1 && lazyResp!==undefined && lazyResp.PingResponse!==undefined && lazyResp.PingResponse.Details!==undefined)
                     {
                         var rowData = {deviceName:devList.toString(),pingResponse:lazyResp.PingResponse.Details};
                         $("#pingResponseList").jqGrid('addRowData',31,rowData,"last");//No I18N
                     }
                     else
                     {
                     if(lazyResp!==undefined && lazyResp.length>0)
                     {
                         for(var i=0;i<lazyResp.length;i++)
                         {
                             $("#pingResponseList").jqGrid('addRowData',(30+1+i),lazyResp[i],"last");//No I18N
                         }
                     }
                 }
                 if(devArr.length<=40)
		         {
		         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
                 }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },3000);
         }
         if(devArr.length>40)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(40,50));
                 var cbmethod = function(lazyResp){
                 	if(lazyResp!==undefined && lazyResp.error!==undefined && lazyResp.error.message!==undefined)
                     {
                         opm_infoMsgs("errorMsg",lazyResp.error.message);//No I18N
                     }
                     if(devList.length===1 && lazyResp!==undefined && lazyResp.PingResponse!==undefined && lazyResp.PingResponse.Details!==undefined)
                     {
                         var rowData = {deviceName:devList.toString(),pingResponse:lazyResp.PingResponse.Details};
                         $("#pingResponseList").jqGrid('addRowData',41,rowData,"last");//No I18N
                     }
                     else
                     {
                     if(lazyResp!==undefined && lazyResp.length>0)
                     {
                         for(var i=0;i<lazyResp.length;i++)
                         {
                             $("#pingResponseList").jqGrid('addRowData',(40+1+i),lazyResp[i],"last");//No I18N
                         }
                     }
                 }
                 if(devArr.length<=50)
		         {
		         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
                 }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },4000);
         }
         if(devArr.length>50)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(50,60));
                 var cbmethod = function(lazyResp){
	                     if(lazyResp!==undefined && lazyResp.length>0)
	                     {
	                         for(var i=0;i<lazyResp.length;i++)
	                         {
	                             $("#pingResponseList").jqGrid('addRowData',(50+1+i),lazyResp[i],"last");//No I18N
	                         }
	                     }
	                 if(devArr.length<=60)
			         {
			         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
			         }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },5000);
         }
         if(devArr.length>60)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(60,70));
                 var cbmethod = function(lazyResp){
	                     if(lazyResp!==undefined && lazyResp.length>0)
	                     {
	                         for(var i=0;i<lazyResp.length;i++)
	                         {
	                             $("#pingResponseList").jqGrid('addRowData',(60+1+i),lazyResp[i],"last");//No I18N
	                         }
	                     }
	                 if(devArr.length<=70)
			         {
			         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
			         }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },6000);
         }
         if(devArr.length>70)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(70,80));
                 var cbmethod = function(lazyResp){
	                     if(lazyResp!==undefined && lazyResp.length>0)
	                     {
	                         for(var i=0;i<lazyResp.length;i++)
	                         {
	                             $("#pingResponseList").jqGrid('addRowData',(70+1+i),lazyResp[i],"last");//No I18N
	                         }
	                     }
	                 if(devArr.length<=80)
			         {
			         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
			         }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },7000);
         }
         if(devArr.length>80)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(80,90));
                 var cbmethod = function(lazyResp){
	                     if(lazyResp!==undefined && lazyResp.length>0)
	                     {
	                         for(var i=0;i<lazyResp.length;i++)
	                         {
	                             $("#pingResponseList").jqGrid('addRowData',(80+1+i),lazyResp[i],"last");//No I18N
	                         }
	                     }
	                 if(devArr.length<=90)
			         {
			         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N
			         }
                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },8000);
         }
         if(devArr.length>90)
         {
             setTimeout(function(){
             	var devList = removeDuplicatesInArray(devArr.slice(90,100));
                 var cbmethod = function(lazyResp){
	                     if(lazyResp!==undefined && lazyResp.length>0)
	                     {
	                         for(var i=0;i<lazyResp.length;i++)
	                         {
	                             $("#pingResponseList").jqGrid('addRowData',(90+1+i),lazyResp[i],"last");//No I18N
	                         }
	                     }
	                 
			         		opm_infoMsgs("successMsg",Ember.I18n.t("webclient.opm.list.multiping.action.successmsg",this));//No I18N

                 }
				 var postData = {isBulk:true,deviceName:devList.toString()};
				 if(self.get("slideDetails.isFromWANLinks") !== undefined){
					postData.fromWANLink = true;
				 }
                 opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/device/getPingResponse',postData,"",cbmethod);//No I18N
             },9000);
         }
         var defaultOptions = {noPaginationShowAll:true,sortable:false};
         Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
             $('#pingResponseList').jqGrid('GridUnload');//No I18N
             opm_loadJQgridWithData("#pingResponseList",jsonResponse,colNames,colModel,"","pingResponsePager","",defaultOptions); //No I18N
         });
         $(".opmGroupInventory,.topNews").addClass("zIndex1");//No I18N
     },
     actions:{
         closeSlider:function(){
             this.get('parentView').send('closeAction');//No I18N
         }
     },
     willDestroyElement: function(){
     	$("body").removeClass("commonSliderActive");//No I18N
         $(".opmGroupInventory,.topNews").removeClass("zIndex1");//No I18N
         $('#'+this.elementId).find('*').remove();
     }
 });
OPMClient.OpmListProfilesComponent = Ember.Component.extend({
     templateName: "components/opm-list-profiles", //No I18N
     didInsertElement:function() {
     	$("body").addClass("commonSliderActive");//No I18N
		var self = this;
		if(self.slideDetails.profileType==="Workflow")
		{
			var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/workflow/getWorkflowList'); //No I18N
			var colNames = [Ember.I18n.t('webclient.topo.name', this),Ember.I18n.t('webclient.map.description',this),'', Ember.I18n.t('webclient.admin.traps.action', this), '','','']; //No I18N
			var colModel = [
			  	{name: 'name', index: 'name', width: '50'}, //No I18N 
				{name: 'description', index: 'description', width: '100'}, //No I18N 
				{name: 'rbID', index: 'rbID', hidden: true}, //No I18N 
				{name: 'action', width: '35', formatter: excuteWFfromList,formatoptions:{alarmid:self.slideDetails.data},search:false,sortable:false}, //No I18n
				{name: 'reportID', index: 'reportID', hidden: true}, //No I18N 
				{name: 'triggerType', index: 'triggerType', hidden: true}, //No I18N 
				{ name: "id",index:"id",hidden:true,sortable:false,search:false} //NO I18N
			];
			var defaultOptions = {"sortName": "name", "sortOrder": "asc",minRowsPerPage:25,hideCSV:true,hideExcel:true,Search:false};//No I18N
			opm_loadJQgridWithData("#opmProfileList", jsonData, colNames, colModel, "", "#opmProfilePager", "AlarmWFList", defaultOptions); //No I18N
		}
		else if(self.slideDetails.profileType==="LogATicket" || self.slideDetails.profileType==="runPlayBook")
		{
			var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/v2/admin/listNotificationTemplates',{profileType: self.slideDetails.profileType==="LogATicket" ? 'Log a Ticket' : "Ansible"}); //No I18N
			var colNames = ["",Ember.I18n.t("jsp.commonstr.TemplateName"),Ember.I18n.t("opu.views.TYPE"),"","","",Ember.I18n.t('webclient.admin.traps.action', this),""]; //NO I18N
			var colModel= [
				{ name: "templateID",	index:"templateID", hidden:true}, //NO I18N
				{ name: "profileName",	index:"profileName",width:50, classes:"pointer",sorttype:"text"}, //NO I18N
				{ name: "profileType",	index:"profileType",width:30}, //NO I18N
				{ name: "status",		index:"status",		width:25,search:false,hidden:true}, //NO I18N
				{ name: "actions",		index:"actions",	width:25,search:false,hidden:true}, //NO I18N
				{ name: "profileTypeKey",index:"profileTypeKey", hidden:true}, //NO I18N
				{name: 'action', width: '30', formatter: self.slideDetails.profileType==="LogATicket" ? excuteLogaTicketfromAlarm : function(cellValue, options, rowdata, action) { //No I18n
					var alarmId = options.colModel.formatoptions.alarmid;
    				return "<span style='float:left;margin-left:10px;' title='"+Ember.I18n.t('webclient.zia.widget.forecastalarms.runplaybook', this)+"' onclick='triggerNotificationTemplate(\"" +opm_escapeHTML(alarmId)+ "\",\"" +opm_escapeHTML(rowdata.templateID) + "\");' class='ui-icon ui-icon-arrowthickstop-1-e pointer' ></span>"; //No I18N
					}, formatoptions:{alarmid:self.slideDetails.data},search:false,sortable:false},
				{ name: "id",			index:"id",			hidden:true,sortable:false,search:false} //NO I18N
			];
			var defaultOptions = {"sortName": "profileName", "sortOrder": "asc",minRowsPerPage:25,hideCSV:true,hideExcel:true,Search:false};//No I18N
			opm_loadJQgridWithData("#opmProfileList", jsonData, colNames, colModel, "", "#opmProfilePager", "AlarmWFList", defaultOptions); //No I18N
		}
		else if(self.slideDetails.profileType==="listData")
		{
			var colNames = [self.slideDetails.slideHeader,""]; //NO I18N
			var colModel= [
				{ name:"displayName",index:"displayName"}, //NO I18N
				{ name: "id",index:"id",hidden:true,sortable:false,search:false} //NO I18N
			];
			var defaultOptions = {"sortName": "displayName", "sortOrder": "asc",minRowsPerPage:25,hideCSV:true,hideExcel:true,Search:false,rowList:[10,25,50,100]};//No I18N
			var jsonData = [];
			for(var i=0;i<self.slideDetails.data.data.length;i++)
			{
				jsonData.push({'displayName':self.slideDetails.data.data[i]});
			}
			opm_loadJQgridWithData("#opmProfileList",jsonData, colNames, colModel, "", "#opmProfilePager", "ziaDataList", defaultOptions); //No I18N
		}
     },
     actions:{
         closeSlider:function(){
             this.get('parentView').send('closeAction');//No I18N
         }
     },
     willDestroyElement: function(){
     	$("body").removeClass("commonSliderActive");//No I18N
         $(".opmGroupInventory,.topNews").removeClass("zIndex1");//No I18N
         $('#'+this.elementId).find('*').remove();
     }
 });

OPMClient.OpmDeviceDetailsTooltipComponent = Ember.Component.extend({
	templateName: "components/opm-device-details-tooltip", //No I18N
	didInsertElement: function()
	{
		var response = this.get('data'); //No I18n
		var moreDetails = [];
		this.set('isDevDetailsNotAvail',false); //No I18n
		this.set('devDetailsMessage',""); //No I18n

		var transformedDbDetails = [];
		if (response.dbDetails !== undefined) {
			$.each(response.dbDetails, function(deviceName, properties) {
				var dbDetail = [];
				properties.forEach(function(item) {  
					for (var key in item) {
						var propName = key;
						if (key === "Device Name") {  // No I18n
							propName = Ember.I18n.t('webclient.devices.details.devicename'); // No I18n
						} else if(key =="Monitor Name"){ // No I18n
							propName = Ember.I18n.t('webclient.common.appmanager.monitorname.text'); // No I18n
						} else if (key === "Type") {  // No I18n
							propName = Ember.I18n.t('webclient.topo.type'); // No I18n
						}
						if (key === "name" || key === "ipAddress" || key === "Resource Id" || key === "status") {  // No I18n
							continue;
						}
						dbDetail.push({ propName: propName, propVal: item[key] });
					}
				});
			transformedDbDetails.push({deviceName: deviceName, dbDetail: dbDetail});
			});
		}

		var groupNames = [];
		if(response.groupDetails !== undefined){
			if(response.groupDetails.groupNames !== undefined){
				groupNames.push({propName: Ember.I18n.t('webclient.Group.Names'), propVal: response.groupDetails.groupNames});//No I18N
			}
		}

		if(response.moreDetails !== undefined) 
		{
			var self = this
			if(response.moreDetails.Message !== undefined && self.get('page') !== 'Rack'){
				this.set('isDevDetailsNotAvail',true); //No I18n
				this.set('devDetailsMessage',response.moreDetails.Message); //No I18n
			}
			else {
				this.set('isDevDetailsNotAvail',false); //No I18n
				if(self.get('page') === 'Rack' && response.moreDetails.Message !== undefined){
					delete response.moreDetails.Message;
					delete response.moreDetails.Availability;
				}
				$.each(response.moreDetails, function(propName, propVal)
				{
					if(propVal !== "NA" && propName !== "description")
					{
						if(propName === "Availability") { 
							propVal = getAvailabilityStateString(propVal);
							propName = Ember.I18n.t('webclient.admin.url.avail',this); //No I18n
						} else if(propName === "PacketLoss") { //No I18n
							propName = Ember.I18n.t('opu.common.PACKET_LOSS',this); //No I18n
							propVal = propVal+"%"; //No I18n
						} else if(propName === "ResponseTime") { //No I18n
							propName = Ember.I18n.t('opmanagerclient.menu.framemenu.ResponseTime',this); //No I18n
						} else if(propName === "CPUValue") { //No I18n
							propName = Ember.I18n.t('webclient.map.server.CPU',this); //No I18n
							propVal = propVal+"%"; //No I18n
						} else if(propName === "MemoryValue") { //No I18n
							propName = Ember.I18n.t('webclient.map.server.Memory',this); //No I18n
							propVal = propVal+"%"; //No I18n
						} else if(propName === "DiskValue"){ //No I18n
							propName = Ember.I18n.t('webclient.storage.disk', this); //No I18N
						} 
						else if(propName === "probeName" || propName === "probeDisplayName"){ //No I18n
							propName = Ember.I18n.t('webclient.admin.probes.probename',this); //No I18n
						} else if(propName === "ErrorDeviceCount"){ //No I18n
							propName = Ember.I18n.t('webclient.wodget.catlist.devices',this); //No I18n 
						} else if(propName === "AlertCount"){ //No I18n
							propName = Ember.I18n.t('webclient.audit.alarms',this); //No I18n 
						} else if(propName === "TotalDeviceCount"){ //No I18n
							propName = Ember.I18n.t('webclient.map.totaldevices',this); //No I18n 
						} else if(propName === "lastUpdateTime"){ //No I18n
							propName = Ember.I18n.t('webclient.ACL.LastUpdatedTime',this); //No I18n 
						} else if(propName === "CustomerDisplayName"){ //No I18n
							propName = Ember.I18n.t('webclient.settings.customer.name',this); //No I18n 
						}  else if(propName === "groupType"){ //No I18n
							propName = Ember.I18n.t('webclient.opm.grouptype',this); //No I18n 
						} else if(propName === "alertCount"){ //No I18n
							propName = Ember.I18n.t('webclient.devices.details.alarm',this); //No I18n 
						}else if(propName === "count"){ //No I18n
							propName = Ember.I18n.t('webclient.opm.grouping.elementcount',this); //No I18n 
						}
						moreDetails.push({propName:propName,propVal:propVal});
					}
				});
			}
		}
		this.set('isGroup',false); //No I18n
		this.set('groupType',""); //No I18n
		this.set('devMoreDetails',[]); //No I18n
		this.set('devMoreDetails',moreDetails); //No I18n
		this.set('dbDetails',transformedDbDetails); //No I18n
		this.set('groupNames', groupNames); //No I18n
		this.set('alarmMsg',""); //No I18n
		this.set('alarmNotes',""); //No I18n
		this.set('deviceType',response.basicDetails.type); //No I18n
		this.set("showViewMoreAlarms",false); //No I18n
		this.set('isDeviceHasAlarm',false); //No I18n
		if(response.basicDetails.groupId !== undefined){
			this.set('isGroup',true); //No I18n
		}
		if(response.moreDetails.groupType !== undefined){
			this.set('groupType',response.moreDetails.groupType); //No I18n
		}
		if(response.moreDetails.description !== undefined && response.basicDetails.groupId !== undefined && response.moreDetails.description !== "NA") {
			this.set('showDescription',true); //No I18n
			this.set('groupDescription',opm_escapeHTML(response.moreDetails.description)); //No I18n
		}
		if(response.basicDetails.alarm !== undefined && response.basicDetails.alarm !== "NA" && response.basicDetails.status !== "5") 
		{
			var alarmMsg = response.basicDetails.alarm.Message;
			this.set('isDeviceHasAlarm',true); //No I18n
			if(alarmMsg.length > 80){
				alarmMsg = alarmMsg.substring(0,70)+"..."; //No I18n
				this.set("showViewMoreAlarms",true); //No I18n
			}
			this.set('alarmMsg',alarmMsg); //No I18n
			if(response.basicDetails.alarm.Notes !== undefined && response.basicDetails.alarm.Notes !== "NA") {
				var alarmNotes = response.basicDetails.alarm.Notes;
				if(alarmNotes.length > 100){
					alarmNotes = alarmNotes.substring(0,100)+"..."; //No I18n
				}
				this.set('alarmNotes',alarmNotes); //No I18n
			}
		}
		if(response.basicDetails.type !== undefined && response.basicDetails.type.length > 23) 
		{
			var devType = response.basicDetails.type.substring(0,23)+"..."; //No I18n
			this.set('deviceType',devType); //No I18n
		}
		if(window.OPM.isNewStatusPropagation && response.basicDetails && response.basicDetails.state){
			var _sevNum = response.basicDetails.status || '';
			var _stCls = opm_getStateCls(response.basicDetails.state);
			var self = this;
			Ember.run.scheduleOnce('afterRender', this, function(){ // No I18N
				self.$('.device-details-popover-tooltip-title .icon-status').removeAttr('data-icon').removeClass('--fault-severity').addClass('--dual-status status-' + _sevNum + ' ' + _stCls);
			});
		}
	}.observes('OPMClient.BVMapDetailsController.deviceMoreDetails').on('init'), //No I18n
	actions: 
	{
		navToDSPPage: function(devName)
		{
			var url;
			if(this.get('isGroup')) {
				url = redirectotGroupsSnapshot(devName,this.get('groupType'), true);
			} else if(devName && devName.toLowerCase().indexOf('wanlinksite') !== -1) { //No I18N
				url = redirectWanSiteSnapshot(devName, true);
			} else if(devName && devName.toLowerCase().indexOf('wanlinkmonitor') !== -1) { //No I18N
				url = redirectWanLinkSnapshot(devName, undefined, true);
			} else {
				url = redirectToDeviceSnapshot(devName, undefined, undefined, undefined, true);
			}
			window.open(url,"_blank"); //No I18n
			opm_clearDevTooltipDetails();
		},
		listRecentAlarms: function(deviceName,deviceDispName,isWidget,isEmbed)
		{
			if((isWidget || isEmbed || this.get('page') === 'OrganizationalMap' || this.get('page') === 'NetworkPathAnalysis') && !this.get('isGroup')){
				if(deviceName && deviceName.toLowerCase().indexOf('wanlinksite') !== -1) { //No I18N
					OPMClient.InventoryDeviceDetailsController.wanIPOpenAlarmsTab = true;
					location.href = redirectWanSiteSnapshot(deviceName, true);
				} else if(deviceName && deviceName.toLowerCase().indexOf('wanlinkmonitor') !== -1) { //No I18N
					OPMClient.InventoryDeviceDetailsController.wanIPOpenAlarmsTab = true;
					location.href = redirectWanLinkSnapshot(deviceName, undefined, true);
				} else {
					location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+deviceName+"/Alerts"; //No I18n
				}
			} else if(this.get('isGroup')){
				redirectotGroupsSnapshot(deviceName,this.get('groupType')); //No I18n
			} else if(deviceName.indexOf("APM_") == 0){ //NO I18N
				var resourceId = (deviceName).split("APM_")[1]; //NO I18N
				if(window.OPM.isCentralServer || window.OPM.isProbe)
				{
					resourceId = (resourceId).split(".")[0]; //NO I18N
				}
				redirectToAPMMonitor(resourceId);
			} else {
				opm_OpenDeviceAlarms(deviceName,deviceDispName,this.get('page')); //No I18n
			}


			// if(!isWidget){
			// 	if(this.get('page') === 'Rack' || this.get('page') === 'OrganizationalMap'){
			// 		location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+deviceName+"/Alerts"; //No I18n
			// 	}
			// 	else{
			// 		opm_OpenDeviceAlarms(deviceName,deviceDispName,this.get('page')); //No I18n
			// 	}
			// }  else if(isEmbed){
			// 	window.open(window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+deviceName+"/Alerts", '_blank'); //No I18n
			// } else {
			// 	if(this.get('isGroup')){
			// 		redirectotGroupsSnapshot(deviceName,this.get('groupType')); //No I18n
			// 	} else {
			// 		 location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+deviceName+"/Alerts"; //No I18n
			// 	}
			// }
			opm_clearDevTooltipDetails();
		},
		listAllGroupNames: function(){
			if($("#groupNames").hasClass("truncate")){
				$("#groupNames").removeClass("truncate");
			}else{
				$("#groupNames").addClass("truncate");
			}
		},
		addLayer2Device: function(deviceName)
		{
			addL2Devices(deviceName,"MapView"); //No I18n
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		this.set('devMoreDetails',[]); //No I18n
		this.set('devDetailsMessage',""); //No I18n
	}
});

OPMClient.OpmLBMasterInfoComponent = Ember.Component.extend({
	templateName: "components/opm-lb-master-info", //No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		this.set('widgetData.sizey',10); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmLBTreeViewComponent = Ember.Component.extend({
	templateName: "components/opm-lb-tree-view", //No I18N
	firstAPICall:true,
	noData:false,
	didInsertElement: function(){
		var self = this;
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId+' .jstree').jstree({//No I18N
		    "plugins":["json_data","sort"],//No I18N
		    "core": {//NO I18N
                'data' : {//No I18N
				    'url':function (node) {//No I18N
				    	return window.OPM.apiUrlPattern + '/v2/device/getLBTreeViewDetails';//No I18N
				    },
				    'data':function(node){//No I18N

				    	if(node!==undefined && node.original!==undefined && (node.original.type == "VirtualServer" || node.original.type == "LBPool"))
						{
							var pobj = {};
							pobj.moId = node.id;
							pobj.type = node.original.type;
							pobj.deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
							if(window.OPM.isCentralServer){
								pobj.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
							}
							return pobj;
						}else{
							var pobj = {};
							if(OPMClient.InventoryDeviceDetailsController.LBDetails.type!==undefined && !self.get("firstAPICall")){//No I18N
								pobj.moId = OPMClient.InventoryDeviceDetailsController.LBDetails.moId;
								pobj.type = "VirtualServer";//No I18N
							}else{
								pobj.moId = self.get("snapshotObj.moID");//No I18N
								pobj.type = "LoadBalancer";//No I18N
							}
							pobj.deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
							if(window.OPM.isCentralServer){
								pobj.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
							}
							return pobj;
						}
				    },
				    'dataFilter':function(data){//No I18N
					    	if(data!==undefined && data!=="" && self.get("firstAPICall"))//No I18N
					    	{
					    		self.set("firstAPICall",false);//No I18N
					    		var filteredData = JSON.parse(data);
					    		if(filteredData.length===0)
					    		{
					    			self.set("noData",true);//No I18N
					   		 }
					    		else if(OPMClient.InventoryDeviceDetailsController.LBDetails.type==="virtualServer")//No I18N
						    	{
						    		var vsStatus = "status"+OPMClient.InventoryDeviceDetailsController.LBDetails.status//No I18N
						    		for(var i=0;i<filteredData.length;i++)
						    		{
						    			if(OPMClient.InventoryDeviceDetailsController.LBDetails.moId===Number(filteredData[i].id))
						    			{
						    				vsStatus = filteredData[i].icon;
						    				break;
						    			}
						    		}
						    		filteredData = [{
						    			"a_attr": {//No I18N
									        "title": OPMClient.InventoryDeviceDetailsController.LBDetails.name//No I18N
									    },
									    "children": true,//No I18N
									    "icon": vsStatus,//No I18N
									    "parent":"#",//No I18N
									    "id": OPMClient.InventoryDeviceDetailsController.LBDetails.moId+"",//No I18N
									    "text": OPMClient.InventoryDeviceDetailsController.LBDetails.name,//No I18N
									    "type": "virtualServer"//No I18N
						    		}];
									return JSON.stringify(filteredData);
						    	}
					    	}
					    	return data;
				    }
				},
				'force_text': true //No I18n
            }
		}).on('after_open.jstree',function(e,data){//No I18N
	        var modHt = Math.ceil(($('.jsTreeType1').innerHeight()+53)/22)+1;//No I18N
	        self.set('widgetData.sizey',(OPMClient.InventoryDeviceDetailsController.LBDetails.type===undefined)?modHt:16); //No I18N
	        self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	  		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		}).on('loaded.jstree',function(e,data){//No I18N
			if(self.get("noData"))
			{
				self.set('widgetData.noData',true);//No I18N
				self.set('widgetData.sizey',2);//No I18N
			}else{
	        		var modHt = Math.ceil(($('.jsTreeType1').innerHeight()+53)/22)+1;//No I18N
	        		self.set('widgetData.sizey',(OPMClient.InventoryDeviceDetailsController.LBDetails.type===undefined)?modHt:16); //No I18N
			}
	        	self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	  		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
	  		if(OPMClient.InventoryDeviceDetailsController.LBDetails.type!==undefined)
	  		{
	  		setTimeout(function(){
		  		$('#'+self.elementId+' .jstree').jstree("open_node",[$('#'+self.elementId+' .jstree > ul > li:first-child').attr("id")]);//No I18N
		        	setTimeout(function(){var childEle = $('#'+self.elementId+' .jstree > ul > li:first-child > ul > li:first-child');//No I18N
			        	if(childEle!==undefined && childEle.length === 1){
			        		$('#'+self.elementId+' .jstree').jstree("open_node",[$(childEle).attr("id")]);//No I18N
				        	}},2000);
		        	},500);
		     }
		}).on('after_close.jstree',function(e,data){//No I18N
	        var modHt = Math.ceil(($('.jsTreeType1').innerHeight()+53)/22)+1;//No I18N
	        self.set('widgetData.sizey',(OPMClient.InventoryDeviceDetailsController.LBDetails.type===undefined)?modHt:16); //No I18N
	        self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
	  		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		});
		if(OPMClient.InventoryDeviceDetailsController.LBDetails!==undefined && OPMClient.InventoryDeviceDetailsController.LBDetails.type==="virtualServer"){//No I18N
			var widgetID = this.get('widgetData.id'); //No I18N
			$("#widgetElement_"+widgetID).addClass("lbTreeFixedHt");//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmLBChildSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-lb-child-summary", //No I18N
	didInsertElement: function(){
		var widgetID = this.get('widgetData.id'); //No I18N
		$("#widgetElement_"+widgetID).addClass("kempChildSummaryWidget");//No I18N
		this.set('widgetData.translatedDesc',(OPMClient.InventoryDeviceDetailsController.LBDetails.type==="virtualServer")?Ember.I18n.t("webclient.opm.lb.child.summary",this):Ember.I18n.t("webclient.opm.lb.child.pool.summary",this));//No I18N
		this.set('widgetData.sizey',(OPMClient.InventoryDeviceDetailsController.LBDetails.type==="virtualServer")?16:9); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmLBChildStatusComponent = Ember.Component.extend({
	templateName: "components/opm-lb-child-status", //No I18N
	didInsertElement: function(){
		this.set('widgetData.sizey',9); //No I18N
		var widgetID = this.get('widgetData.id'); //No I18N
		$("#widgetElement_"+widgetID).addClass("kempChildStatusWidget");//No I18N
		$("#widgetElement_"+widgetID+" .grid-stack-item-content > div").removeClass("overflowHidden");//No I18N
		var apiData = this.get('widgetData.apiData');//No I18n
		this.set("connectionPercent",("width:"+((apiData.activeConnection/apiData.totalConnection)*100).toFixed(2))+"%");//No I18n
		this.set("packetsPercent",("width:"+((apiData.inPackets/(apiData.inPackets+apiData.outPackets))*100).toFixed(2))+"%");//No I18n
		this.set("trafficPercent",("width:"+((apiData.inBytes/(apiData.inBytes+apiData.outBytes))*100).toFixed(2))+"%");//No I18n
	},
	actions:{
		goToListPage:function(){
			if(OPMClient.InventoryDeviceDetailsController.LBDetails.type!==undefined){
				$('.LBSnapshot ul li[name="'+OPMClient.InventoryDeviceDetailsController.LBDetails.type+'"]').click();//No I18N
				OPMClient.InventoryDeviceDetailsController.LBDetails = {}
			}
		},
		showTimePeriod:function(){
			if($("#"+this.elementId+" .ddType1__view").hasClass("active")){
				$("#"+this.elementId+" .ddType1__view").removeClass("active"); //NO I18N
			}else{
				$("#"+this.elementId+" .ddType1__view").addClass("active"); //NO I18N
			}
		},
		changeTimePeriod:function(selVal){
			var prevValue = $("#"+this.elementId+" .ddType1__list ul li.active").attr("value");//NO I18N
			if(selVal!==prevValue || selVal==="custom"){//No I18N
				if(selVal==="custom")//No I18N
				{
					$('#customTimeStatic').show();
					$('#CustomTimeDiv').show();
					OPMClient.InventoryDeviceDetailsController.selectedSmallSlide = true;
					$('#deviceSnapshotSmallHeader').text(Ember.I18n.t('webclient.Custom.Time',this));//No I18N
					deviceSlideIn(3);
					if($('#onceonly_from_hrs_sel option').length == 0 && $('#onceonly_to_hrs_sel option').length == 0 && $('#onceonly_from_mins_sel option').length == 0 && $('#onceonly_to_mins_sel option').length == 0){
						setCustomTimeFilter();
					}
					showCustomTimePeriod(OPMClient.FWAGlobalDataController.startTime,OPMClient.FWAGlobalDataController.endTime);
				}
				else{
					$("#"+this.elementId+" .ddType1__list ul li").removeClass("active");//No I18N
					$("#"+this.elementId+" .ddType1__list ul li[value='"+selVal+"']").addClass("active");//No I18N
					$("#"+this.elementId+" .ddType1__view").removeClass("active"); //NO I18N
					$("#"+this.elementId+" .ddType1__view span").text($("#"+this.elementId+" .ddType1__list ul li.active").text());//No I18N
					for(var i=0;i<OpmSnapwidgetComponentArray.length;i++)
					{
	                    if(OpmSnapwidgetComponentArray[i]!==undefined && OpmSnapwidgetComponentArray[i].widgetData!==undefined && (OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.lb.child.graphdata.traffic" || OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.lb.child.graphdata.packets" || OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.lb.child.graphdata.totalconnections" || OpmSnapwidgetComponentArray[i].widgetData.name==="webclient.opm.lb.child.graphdata.activeconnections"))
	                    {
	                        Ember.set(OpmSnapwidgetComponentArray[i].widgetData,'reloadTrigger',true);//No I18N
		                    }
	                    }
	                }
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmLBGraphsComponent = Ember.Component.extend({
	templateName: "components/opm-lb-graphs", //No I18N
	showGraph:false,
	didInsertElement: function(){
		$("#widgetElement_"+this.get('widgetData.id')).addClass("kempChildGraphWidget");//No I18N
		var self = this;
		var graphParams = {};
		var currentWidgetData = this.get('widgetData');//No I18N
		var apiResponse = this.get('widgetData.apiData');//No I18N
		var graphData = [];
		var legendEnabled = true;
		var InTableData = [],OutTableData = [], consolidatedValues = [];
		if(currentWidgetData.name==="webclient.opm.lb.child.graphdata.packets")//No I18N
		{
			if(apiResponse.inPackets!==undefined && apiResponse.inPackets.graphData!==undefined)
			{
				if(apiResponse.inPackets.graphData.length>0 && apiResponse.inPackets.graphData[0].seriesname)
				{
					apiResponse.inPackets.graphData[0].seriesname = Ember.I18n.t("NFAWidget.IN",this);//No I18N
					if(apiResponse.inPackets.graphData[0].data!==undefined && apiResponse.inPackets.graphData[0].data.length>0)
					{
						InTableData = apiResponse.inPackets.graphData[0].data;
					}
				}
				graphData = apiResponse.inPackets.graphData;
			}
			if(apiResponse.outPackets!==undefined && apiResponse.outPackets.graphData!==undefined)
			{
				if(apiResponse.outPackets.graphData.length>0 && apiResponse.outPackets.graphData[0].seriesname)
				{
					apiResponse.outPackets.graphData[0].seriesname = Ember.I18n.t("NFAWidget.OUT",this);//No I18N
					if(apiResponse.outPackets.graphData[0].data!==undefined && apiResponse.outPackets.graphData[0].data.length>0)
					{
						OutTableData = apiResponse.outPackets.graphData[0].data;
					}
				}
				graphData = graphData.concat(apiResponse.outPackets.graphData);
			}
		}else if(currentWidgetData.name==="webclient.opm.lb.child.graphdata.traffic")//No I18N
		{
			if(apiResponse.inTraffic!==undefined && apiResponse.inTraffic.graphData!==undefined)
			{
				if(apiResponse.inTraffic.graphData.length>0 && apiResponse.inTraffic.graphData[0].seriesname)
				{
					apiResponse.inTraffic.graphData[0].seriesname = Ember.I18n.t("NFAWidget.IN",this);//No I18N
					if(apiResponse.inTraffic.graphData[0].data!==undefined && apiResponse.inTraffic.graphData[0].data.length>0)
					{
						InTableData = apiResponse.inTraffic.graphData[0].data;
					}
				}
				graphData = apiResponse.inTraffic.graphData;
			}
			if(apiResponse.outTraffic!==undefined && apiResponse.outTraffic.graphData!==undefined)
			{
				if(apiResponse.outTraffic.graphData.length>0 && apiResponse.outTraffic.graphData[0].seriesname)
				{
					apiResponse.outTraffic.graphData[0].seriesname = Ember.I18n.t("NFAWidget.OUT",this);//No I18N
					if(apiResponse.outTraffic.graphData[0].data!==undefined && apiResponse.outTraffic.graphData[0].data.length>0)
					{
						OutTableData = apiResponse.outTraffic.graphData[0].data;
					}
				}
				graphData = graphData.concat(apiResponse.outTraffic.graphData);
			}
		}else
		{
			graphData = apiResponse.graphData;
			legendEnabled = false;
			if(apiResponse.graphData.length>0 && apiResponse.graphData[0].data!==undefined && apiResponse.graphData[0].data.length>0)
			{
				InTableData = apiResponse.graphData[0].data;
			}
		}
		if(graphData!==undefined && graphData.length>0)
		{
			graphParams.id = 'PerfGraph'+this.get('widgetData').id;//No I18N
			graphParams.data = graphData;
			graphParams.xAxis = "";//No I18N
			graphParams.yAxis = "";
			graphParams.height = 250;
			graphParams.hAlign = "center";//No I18n
			graphParams.vAlign = "bottom";//No I18n
			graphParams.legendLayout = "horizontal";//No I18n
			graphParams.legendEnabled = legendEnabled;
			graphParams.graphType = 'area';//No I18N
			self.set('widgetData.sizey',15); //No I18N
			self.setProperties({'showGraph':true,'graphParams':graphParams});//No I18N
			self.set('widgetData.noData',false); //No I18N
			if(self.get('widgetData.expandView'))//NO I18N
			{
				if(InTableData!==undefined && InTableData.length>0)
				{
					var sendObj = {};
					sendObj.gridId = 'PerfGraphInTableView'+self.get('widgetData').id;//No I18N
					sendObj.pagerId = 'PerfGraphInTablePager'+self.get('widgetData').id;//No I18N
					sendObj.data = InTableData;
					sendObj.defaultOptions = {"toggleSearch":false,"searchOption":false};
					sendObj.colModels = [
						{ name: '0', index: '0', width:250, formatter:convertDateAndTime},
						{ name: '1', index: '1', width:150, sorttype:'number'} //No I18N
					];
					sendObj.colNames = [Ember.I18n.t('webclient.auditreport.dateandtime',this),Ember.I18n.t('webclient.widget.value',this)]; //No I18N
					sendObj.onSelectFunction="kempGraphTable";//No I18N
					if(currentWidgetData.name==="webclient.opm.lb.child.graphdata.packets"){
						sendObj.captionTitle = Ember.I18n.t("NFAWidget.IN",this)+" "+Ember.I18n.t("opu.views.PACKETS",this);//No I18N
					}else if(currentWidgetData.name==="webclient.opm.lb.child.graphdata.traffic"){
						sendObj.captionTitle = Ember.I18n.t("NFAWidget.IN",this)+" "+Ember.I18n.t("webclient.reports.createreport.traffic",this);//No I18N
					}
					sendObj.defaultOptions.hideExcel=true;
					sendObj.defaultOptions.hideCSV=true;
					sendObj.defaultOptions.Search=false;
					sendObj.defaultOptions.noPaginationShowAll = true;
					self.setProperties({'showGrid':true,'showInGrid':true,'inGridData':sendObj});//NO I18N
					setTimeout(function(){$("#"+sendObj.gridId).setGridParam({sortname:'0',sortorder:'desc'}).trigger("reloadGrid");},100);
				}

				if(OutTableData!==undefined && OutTableData.length>0)
				{
					var sendObj1 = {};
					sendObj1.gridId = 'PerfGraphOutTableView'+self.get('widgetData').id;//No I18N
					sendObj1.pagerId = 'PerfGraphOutTablePager'+self.get('widgetData').id;//No I18N
					sendObj1.data = OutTableData;
					sendObj1.defaultOptions = {"toggleSearch":false,"searchOption":false};
					sendObj1.colModels = [
						{ name: '0', index: '0', width:250, formatter:convertDateAndTime},
						{ name: '1', index: '1', width:150, sorttype:'number'} //No I18N
					];
					sendObj1.colNames = [Ember.I18n.t('webclient.auditreport.dateandtime',this),Ember.I18n.t('webclient.widget.value',this)]; //No I18N
					sendObj1.onSelectFunction="kempGraphTable";//No I18N
					sendObj1.defaultOptions.hideExcel=true;
					sendObj1.defaultOptions.hideCSV=true;
					sendObj1.defaultOptions.Search=false;
					sendObj1.defaultOptions.noPaginationShowAll = true;
					if(currentWidgetData.name==="webclient.opm.lb.child.graphdata.packets"){
						sendObj1.captionTitle = Ember.I18n.t("NFAWidget.OUT",this)+" "+Ember.I18n.t("opu.views.PACKETS",this);//No I18N
					}else if(currentWidgetData.name==="webclient.opm.lb.child.graphdata.traffic"){
						sendObj1.captionTitle = Ember.I18n.t("NFAWidget.OUT",this)+" "+Ember.I18n.t("webclient.reports.createreport.traffic",this);//No I18N
					}
					self.setProperties({'showGrid':true,'showOutGrid':true,'outGridData':sendObj1});//NO I18N
					setTimeout(function(){$("#"+sendObj1.gridId).setGridParam({sortname:'0',sortorder: 'desc'}).trigger("reloadGrid");},100);
				}
			}
		}else{
			this.set('widgetData.noData',true);//No I18N
			this.set('widgetData.sizey',2);//No I18N
		}

		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
	  	this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmRangeInputComponent = Ember.Component.extend({
	templateName: "components/opm-range-input", //No I18N
	minVal:1,
	maxVal:30,
	didInsertElement: function(){
		$("#"+this.get('inputId')).val(this.get('value')); //No I18N
	},
	keyPress: function(e){
		return opm_isNumber(e);
	},
	actions: {
		upAndDownValue: function(action) {
			
			var currentValue = Number($("#"+this.get('inputId')).val());
			if (isNaN(currentValue)) {
				currentValue = 0;
			}
			if (action === "minus") {
				
				$("#"+this.get('inputId')).val(Math.max(Number(this.get('minVal')), currentValue - 1)); //No I18N
			} else if (action === "plus") { //No I18n
				$("#"+this.get('inputId')).val(Math.min(Number(this.get('maxVal')), currentValue + 1)); //No I18N
			}
			
		}
    }
});
OPMClient.OpmGrouptoggleInputComponent = Ember.Component.extend({
    classNames: ['opm-grouptoggle-input'], //No I18n
    templateName: "components/opm-grouptoggle-input", // No I18N
    didInsertElement: function () {
        var element = $(this.element);
        element.find('.' + this.get('firstClassName')).text(Ember.I18n.t(this.get('firstChoiceLabel'), this)); // No I18N
        element.find('.' + this.get('secondClassName')).text(Ember.I18n.t(this.get('secondChoiceLabel'), this)); // No I18N
        element.find('.' + this.get('firstClassName')).addClass('active'); // No I18N
    },
    actions: {
        selectOptions: function (value) {
			var self = this;
            var element = $(this.element);
            element.find('div').removeClass('active'); // No I18N
            element.find('.' + value).addClass('active'); // No I18N
			
			var actionFn = self.get('onchange'); //No I18n
			if(actionFn !== undefined) {
				window[actionFn](value);
			}
		}
    }
});
OPMClient.NetworkOrgMapComponent = Ember.Component.extend({
	templateName: "components/network-org-map",//No I18N
	didInsertElement: function()
	{
		this.send('onLoadObservabilityMap');//No I18N
		$("#networkObrMap_filter").select2();
		var mapTheme = localStorage.getItem('observabilityMap-Theme');//No I18n
		if(mapTheme !== undefined && mapTheme === "darkMode")//No I18n
		{
			$('body').addClass('Observ-flowMap-dark-mode');	//No I18n
			$('.observ-viewMode').attr('title',Ember.I18n.t('webclient.opm.obserMap.lightMode',this));//No I18n
			$(".observ-viewMode svg use").attr("href","../../apiclient/fluidicv2/img/sprite-opm.svg#sun");//No I18n
		}
		else{
			$('body').removeClass('Observ-flowMap-dark-mode');	//No I18n
			$('.observ-viewMode').attr('title',Ember.I18n.t('webclient.opm.obserMap.darkMode',this));//No I18n
			$(".observ-viewMode svg use").attr("href","../../apiclient/fluidicv2/img/sprite-opm.svg#moon");//No I18n
		}
		/*
		var _self = this;
		_self.resizeTimeout = null;
		window.addEventListener('resize', function() {
			  clearTimeout(_self.resizeTimeout);
			 _self.resizeTimeout = setTimeout(function() {
		    	 _self.send('onLoadObservabilityMap');//No I18N 
		  }, 250); 
		});*/
	},  
	actions:{
		showConnectDeviceView:function(clickFrom){

			if(clickFrom === "contextMenu")
			{
				$('.ObservMap-SumView').removeClass("sidebar-active");
			}
			var mapComponentObj = this.get('mapComponentObj');//No I18N
			if(mapComponentObj.currentView === "INSPECT")
			{
				mapComponentObj.goToMainMapView();
				$("#viewInspectedMapBtn").text(Ember.I18n.t('webclient.opm.obserMap.viewConnections',this));//No I18N
			}else{
				mapComponentObj.clearSearch(true);
				mapComponentObj.goToInspectView();
				$("#viewInspectedMapBtn").text(Ember.I18n.t('webclient.action.back',this));//No I18N
			}
		},
		showMainMapView:function(){
			var mapComponentObj = this.get('mapComponentObj');//No I18N
			mapComponentObj.goToMainMapView();
			$("#viewInspectedMapBtn").text(Ember.I18n.t('webclient.opm.obserMap.viewConnections',this));//No I18N
		},
		redirectFromRightClick:function(type){
			var mapComponentObj = this.get('mapComponentObj');//No I18N
			if(type === "snapshot" && mapComponentObj.rightClickedComponent.data.MoName !== undefined)//No I18N
			{
				var devName = mapComponentObj.rightClickedComponent.data.MoName;
				this.send("orgMapGotoSnapshot",devName);//No I18N
			}
			else if(type === "summary" && mapComponentObj.rightClickedComponent)//No I18N
			{
				mapComponentObj.goToDeviceSummaryDetails(mapComponentObj.rightClickedComponent);
			}
		},
		mapRedirectSnapshot: function(deviceName,type){
			if(type !== undefined && type === "APM")
			{
				if(window.OPM.apmInstalled==="true" && window.OPM.isApmPlug)		
				{
					OPMClient.APMListController.url = window.OPM.apmBaseUrl+"/showresource.do?resourceid="+deviceName+"&method=showResourceForResourceID&opm_user="+window.OPM.apmUserName;//No I18N
					location.href="#/APM/List";//No I18N
				}

			}else if(type !== undefined && type === "SPM")//No I18N
			{
				if(window.OPM.isOPUPlug)		
				{

					if(deviceName.lastIndexOf(" ") !== -1)
					{
						redirectToSnapshot("IPAMPort", deviceName); //No I18N
					}
					else{
						redirectToSnapshot("IPAMSwitch", deviceName); //No I18N
					}
				}
			}
			else{
				redirectSnapShot('',"MonitoringDevice",deviceName);//No I18N
			}
		},closeDevSummaryView: function(){
			 var mapComponentObj = this.get('mapComponentObj');//No I18N
			  mapComponentObj.showSummaryView=false;
              mapComponentObj.opm_MapToggleSummaryView(false);
		},goToSeverityView: function(severity){
			var mapComponentObj = this.get('mapComponentObj');//No I18N
			mapComponentObj.contextMenu
                .classed("visible", false)//No I18N
                .style("display", "none");//No I18N

			if($(".observSeverity.gmapSevCircle.status"+severity).hasClass("active"))
			{
				$(".observSeverity.gmapSevCircle.status"+severity).removeClass("active");
				mapComponentObj.clearSearch(true);
			}else{
				$(".observSeverity.gmapSevCircle").removeClass("active");
				mapComponentObj.clearSearch(true);
				$(".observSeverity.gmapSevCircle.status"+severity).addClass("active");
				mapComponentObj.selectedSeverity = severity;
				mapComponentObj.filterNodeBySeverity();
			}
		},showConnectedListView: function(view){
			obserMapToggleView(view);
			//var mapComponentObj = this.get('mapComponentObj');//No I18N
			/*if(view === "list")//No I18N
			{
				mapComponentObj.loadConnectedDevicesList();
			}*/
		},
		changeObserMapView: function(){
			$('.ObservMap-SumView').removeClass("sidebar-active");
			this.send('onLoadObservabilityMap');//No I18N 
		},
		onLoadObservabilityMap: function()
		{
			var _self = this;
			var callBackFnTemp = function(jsonData) 
			{
				var mapComponentObj = _self.get('mapComponentObj');//No I18N
				if(mapComponentObj)
				{
					mapComponentObj.clearSearch(true);
				}
				if(jsonData !== undefined && jsonData.nodes !== undefined && jsonData.nodes.length > 0)
				{
					_self.set("isNoDataInfo",false);//No I18N
					if(mapComponentObj)
					{

						mapComponentObj.destroyForcedDirected();
						if(mapComponentObj.currentView === "INSPECT")
						{
							mapComponentObj.goToMainMapView();
							$("#viewInspectedMapBtn").text(Ember.I18n.t('webclient.opm.obserMap.viewConnections',this));//No I18N
						}
					}
	                Ember.run.scheduleOnce('afterRender', this, function() {//No I18N     
	                	$("#network_org_map,#network_org_map-inspect").empty();
						var mapComponentObj = new ObservabilityMapComponent();
						mapComponentObj.setSelfProps(function (propName,obj, event) {
							_self.set(propName,obj);
						})
						mapComponentObj.getMapData(jsonData);
						_self.set('mapComponentObj',mapComponentObj);//No I18N
						mapComponentObj.getDeviceSummaryData(function (node, event) {
							obserMapToggleView("summary");//No I18N
							if(node.MoName !== undefined && node.MoName !== "")
							{
								
								if(node.MoName.indexOf("APM_") === 0)
								{
									var nameContainsAPM = (node.MoName).split("APM_")[1];	//No I18N
									if(window.OPM.isCentralServer || window.OPM.isProbe)
					    			{
					    				nameContainsAPM = nameContainsAPM.split(".")[0];	
					    			}
									var basicData = {
									    "basicDetails": {//No I18n	
									        "displayName": node.displayname,//No I18n	
									        "statusText": node.statusString,//No I18n	
									        "name": nameContainsAPM,//No I18n	
									        "ipAddress": node.ipAddress,//No I18n	
									        "status": node.status,//No I18n	
									        "type": node.category,//No I18n	
									        "entityType":"APM"//No I18n	
									    }
									}
									_self.set("devSumData",basicData);//No I18n	
								}
								else if(node.MoName.indexOf("SPM_") === 0)
								{
									var nameContainsSPM = (node.MoName).split("SPM_")[1];	//No I18N
									var basicData = {
									    "basicDetails": {//No I18n	
									        "displayName": node.displayname,//No I18n	
									        "statusText": node.statusString,//No I18n	
									        "name": nameContainsSPM,//No I18n	
									        "ipAddress": node.ipAddress,//No I18n	
									        "status": node.status,//No I18n	
									        "entityType":"SPM"//No I18n	
									    }
									}
									_self.set("devSumData",basicData);//No I18n	
								}
								else{
									var data = {};	
									data.name=node.MoName;
									var url = window.OPM.apiUrlPattern + "/maps/getMOMarkerInfo";//No I18N						
									data.iconType = "Device"; //No I18n
									Ember.$.getJSON(url,data,function(jsonData){
										if(jsonData.moreDetails !== undefined && jsonData.moreDetails.Availability !== undefined)
										{
											jsonData.moreDetails.Availability = getAvailabilityStateString(jsonData.moreDetails.Availability);
										}
										_self.set("devSumData",jsonData);//No I18n				
									});
								}
							}
							else{
								var basicData = {
									    "basicDetails": {//No I18n	
									        "displayName": node.displayname,//No I18n	
									        "statusText": node.statusString,//No I18n	
									        "ipAddress": node.ipAddress,//No I18n	
									        "status": node.status//No I18n	
									    }
									}
									_self.set("devSumData",basicData);//No I18n	
							}
							mapComponentObj.loadConnectedDevicesList();
						})
					});
				}
				else{
					
					if(mapComponentObj)
					{
						mapComponentObj.destroyForcedDirected();
						mapComponentObj.goToMainMapView();
						mapComponentObj.getMapData({});
					}
					$("#network_org_map,#network_org_map-inspect").empty();
					_self.set("isNoDataInfo",true);//No I18N	
					_self.set("nodeSeverityList",[]);//No I18N
					var filterType = $("#networkObrMap_filter").val();
					if(filterType === undefined || filterType === "all")
					{
						_self.set("noDataInfoMessage",Ember.I18n.t('webclient.opm.obserMap.help.text',this));//No I18N	
					}
					else{
						_self.set("noDataInfoMessage",Ember.I18n.t('webclient.opm.obserMap.noData.info',{param0:$("#networkObrMap_filter :selected").text()}));//No I18N	
					}
					if(jsonData.error !== undefined)
					{
						showMessage(jsonData);
					}
				}
			}
			var relationshipType = $("#networkObrMap_filter").val();
			if(relationshipType === undefined)
			{
				relationshipType = 'all';//No I18N						
			}
			var ajaxURL = window.OPM.apiUrlPattern + "/admin/getAllRDBRelationships?filterType="+relationshipType; //No I18n
			opm_ajaxGetResponseWithMsg(ajaxURL,"",Ember.I18n.t('webclient.map.draw.msg',this)+" "+Ember.I18n.t('webclient.credential.snmp.pleasewait',this),callBackFnTemp); //No I18n
		},
		changeDarkMode: function()
		{
			var mapTheme = localStorage.getItem('observabilityMap-Theme');//No I18n
			if(mapTheme !== undefined && mapTheme === "darkMode")//No I18n
			{
				$('body').removeClass('Observ-flowMap-dark-mode');	//No I18n
				$('.observ-viewMode').attr('title',Ember.I18n.t('webclient.opm.obserMap.darkMode',this));//No I18n
				$(".observ-viewMode svg use").attr("href","../../apiclient/fluidicv2/img/sprite-opm.svg#moon");//No I18n
				localStorage.setItem('observabilityMap-Theme',"lightMode");//No I18n
			}
			else{
				$('body').addClass('Observ-flowMap-dark-mode');	//No I18n
				$('.observ-viewMode').attr('title',Ember.I18n.t('webclient.opm.obserMap.lightMode',this));//No I18n
				$(".observ-viewMode svg use").attr("href","../../apiclient/fluidicv2/img/sprite-opm.svg#sun");//No I18n
				localStorage.setItem('observabilityMap-Theme',"darkMode");//No I18n
			}
			$('.ObservMap-SumView').removeClass("sidebar-active");
			var mapComponentObj = this.get('mapComponentObj');//No I18N
			if(mapComponentObj)
			{
				mapComponentObj.clearSearch(true);
				mapComponentObj.goToMainMapView();
				mapComponentObj.destroyForcedDirected();
	        	$("#network_org_map,#network_org_map-inspect").empty();
	        	//$("#networkObrMap_filter").val("all").select2();
				mapComponentObj.drawObservabilityMap();
			}
		},
		reDiscoverObservMap: function()
		{
			var callBackUpdateMap = function(resp) 
			{
				if(resp.error !== undefined)
				{
					showMessage(resp);
				}
			}
			var ajaxURL = window.OPM.apiUrlPattern + "/admin/updateRelationshipMap"; //No I18n
			opm_ajaxPostRequestWithMsg(ajaxURL,"","",callBackUpdateMap); //No I18n
			opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.opm.obserMap.update.pleasewait',this)); //No I18N

			
		},
		fitToScreenObservMap: function()
		{
			var mapComponentObj = this.get('mapComponentObj');//No I18N
			if(mapComponentObj)
			{
				mapComponentObj.focusNodeBySeverity(false);
			}
		},
		orgMapGotoSnapshot:function(devName)
		{
			if(devName.indexOf("APM_") === 0){
    			var resourceId = (devName).split("APM_")[1];	//No I18N
    			if(window.OPM.isCentralServer || window.OPM.isProbe)
    			{
    				resourceId = (resourceId).split(".")[0];	
    			}
    			if(resourceId !== undefined && window.OPM.apmInstalled==="true" && window.OPM.isApmPlug)		
    			{
    				OPMClient.APMListController.url = window.OPM.apmBaseUrl+"/showresource.do?resourceid="+resourceId+"&method=showResourceForResourceID&opm_user="+window.OPM.apmUserName;//No I18N
					location.href="#/APM/List";//No I18N
    			}
    			else{return;}
    		}
    		else if(devName.indexOf("SPM_") === 0){
    			if(window.OPM.isOPUPlug)	
	    		{
	    			var deviceName = (devName).split("SPM_")[1];	//No I18N
	    			if(deviceName.lastIndexOf(" ") !== -1)
					{
						redirectToSnapshot("IPAMPort", deviceName); //No I18N
					}
					else{
						redirectToSnapshot("IPAMSwitch", deviceName); //No I18N
					}
				}
    		}
    		else{
				redirectSnapShot('',"MonitoringDevice",devName);//No I18N
			}
		}

	},
	willDestroyElement: function(){
		if(this.get('mapComponentObj'))
		{
			this.get('mapComponentObj').destroyForcedDirected();
			var mapComponentObj = this.get('mapComponentObj');//No I18n	
			mapComponentObj.defaultConfig=null;
			mapComponentObj.graphData=null;
			mapComponentObj.hoveredNodeData=null;
			mapComponentObj.rightClickedComponent=null;
			mapComponentObj.statusConstants=null;
			mapComponentObj.searchResults = [];
			this.set('mapComponentObj',null);//No I18n	
		}
		$('body').removeClass('Observ-flowMap-dark-mode');//No I18n	
		$('#'+this.elementId).find('*').off();//No I18n	
		$('#'+this.elementId).find('*').unbind();//No I18n	
		d3.select('#flowmap-canvas').remove();//No I18n	
		d3.select('#flowmap-canvas_inspect').remove();//No I18n	
		$('#'+this.elementId).find('*').remove();
	}
});

var selWANNodeId="";
OPMClient.OpmWANLinkTreeComponent = Ember.Component.extend({
	noData:false,
	didInsertElement: function(){
        var self = this;
        self.set('noData',false);//No I18N
		var url = window.OPM.apiUrlPattern+'/device/getDeviceTree?groupBy=wanLinks';//No I18N
		$('#'+self.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+self.elementId+' .jstree').jstree({//No I18N
			"plugins":["json_data","search","sort"],//No I18N
			'search': {'case_insensitive': true, 'show_only_matches': true},//No I18N
		    "core": {//NO I18N
				'data':{//NO I18N
					'url':function (node) {//No I18N
						return url;
					},
                	'data' :function (node) {//No I18N

						if(node.id !== undefined && node.id !== "#"){
							if(node.original.type === "WANLinkSite"){
								var pobj = {};
								pobj.wanSiteName = node.id;
								return pobj;
							}
						}
					}
				},
				'force_text': true //No I18n
			},
            sort:function (a, b) {
				if(this.get_node(a).original.text !== undefined && this.get_node(b).original.text !==undefined){
					var a1=this.get_node(a).original.text.toLowerCase();
					var b1=this.get_node(b).original.text.toLowerCase();
					return a1>b1?1:-1;
				}
            }
		}).on('before_open.jstree', function (e, data) {	
			var obj =  data.instance.get_node(data.node, true);
			if(obj) {
			   obj.siblings('.jstree-open').each(function () {//No I18N
					   if(window.OPM.isDeviceTreeExpanded !== undefined && window.OPM.isDeviceTreeExpanded){
						   data.instance.open_node(this,0);
					   } else{
						   data.instance.close_node(this, 0); 
					   }
				});
			}
	  }).on('after_close.jstree', function (e, data) {
			var tree = $('#'+self.elementId+' .jstree').jstree(true);
			if(data.node.children)
			{
					tree.delete_node(data.node.children);
					tree._model.data[data.node.id].state.loaded = false; 
					data.node.children = [];
			}
			if(data.node.children_d)
			{
				data.node.children_d=[];
			}
			if(tree._model.data[data.node.id].children)
			{
				tree._model.data[data.node.id].children = [];
			}
			if(tree._model.data[data.node.id].children_d)
			{
				tree._model.data[data.node.id].children_d=[];
			}
		}).on('select_node.jstree',function(e,data){
			if(data.node.original.type !== undefined && data.node.original.type==="WANLinkSite"){//No I18N
				var siteId = data.node.original.siteName;
				redirectWanSiteSnapshot(siteId);
			}else if(data.node.original.type !== undefined && data.node.original.type==="WANLinkMonitor"){
				var wanLinkId = data.node.original.siteName;
				redirectWanLinkSnapshot(wanLinkId);
			}else{
				if(OPMClient.ApplicationController.currentRouteName !== "Inventory.List.WAN.Overview.Links"){
					opmGlobalRoute.transitionTo('Inventory.List.WAN.Overview.Links');//No I18N
				}else{
					loadIPLinksGrid();
				}
			}    	
		});

		$('#wanLinksTreeSrch').on('keyup', function(){
				var srchStr = $(this).val();
				$('#'+self.elementId+' .jstree').jstree('search', srchStr);//No I18N
		});
		  
	},
	actions:{
		searchTreeNode: function(){
			var srchStr = $("#wanLinksTreeSrch").val();
			$('#'+this.elementId+' .jstree').jstree('search', srchStr);//No I18N
		},
		 reloadTreeView: function(){
		 	 this.rerender();
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});

OPMClient.OpmAddWanLinkSlidesComponent = Ember.Component.extend({
	templateName: "components/add-wanlinks-slides",//No I18N
	rowId:null,
	didInsertElement: function() {
		var slideData = this.get('slideDetails.formattedData');
		if(slideData.rowNumber !== undefined){
			this.set('rowId',slideData.rowNumber);//No I18N
		}
		var showSlide = slideData.showPage;
		$('.wanLinkDiscSlidePages').hide();
		$('#'+showSlide).show();

		if(slideData.isEditAction){
			var editObj = slideData.editObj;
			if(showSlide === "addSlide"){
				var respObj = editObj.summaryMap;
				$('#siteName').val(respObj.siteName);
				$('#siteDesc').val(respObj.description);
				$('#regionName').val(respObj.Region);
				$('#location').val(respObj.Location);
				$('#locationType').val(respObj.LocationType);
			}else if(showSlide === "linkAddPropSlide"){ //No I18N
				$('.editPropExtraParam').show();
				var respObj = editObj.summaryMap;
				$('#linkVendor').val(respObj.ISPVendor);
				$('#linkBandwid').val(respObj.Bandwidth);
				$('#linkType').val(respObj.LinkType);
				$('#linkMode').val(respObj.LinkMode);
				$('#linkSla').val(respObj.SLA);
				$('#circuitId').val(respObj.CircuitID);
				$('#linkContact').val(respObj.Contactnumber);
				$('#linkComment').val(respObj.Comments);
				$('#linkName').val(respObj.monDispName);
				$('#linkIp').val(respObj.ipAddress);
				$('#linkPollInt').val(respObj.pollinterval);
			}else if(showSlide === "settingsSlide"){ //No I18N

				var siteThres = editObj.siteAvailThreshold;
				var siteSet = editObj.wlmSiteSettings[siteThres];
				$("input:radio[name='siteSeverity'][value='"+siteThres+"']").prop("checked",true);
				$('#allLinkDownSev').val(editObj.wlmSiteSettings.ALL_WANLINK_DOWN.severity).select2();
				$('#anyLinkDownSev').val(editObj.wlmSiteSettings.ANY_WANLINK_DOWN.severity).select2();
				$('#ipDownSev').val(editObj.wlmMonSettings.WANLINK_DOWN_CRITICAL.severity).select2(); //To do
				$('#siteAlrmMsgCnt').val(siteSet.alertmsg);
				$('#linkAlrmMsgCnt').val(editObj.wlmMonSettings.WANLINK_DOWN_CRITICAL.alertmsg);
				$('#pollingInt').val(editObj.pollInterval);
				$('#wanPollThresh').val(editObj.wlmMonSettings.WANLINK_DOWN_CRITICAL.thrldValue);
				$('#notifyWhnClr').prop("checked", editObj.notifyOnClearAlarm === "true" ? true : false); //No I18N
			}
		}
		if(!slideData.isEditAction && showSlide === "linkAddPropSlide"){
			var rowIndex = OPMClient.SettingsWanLinksController.wanLinkAddProperties.map(function(e){return e.rowNumber;}).indexOf(slideData.rowNumber);
			if(rowIndex >= 0 ){
				var rowProps = OPMClient.SettingsWanLinksController.wanLinkAddProperties[rowIndex].addProps;
				$('#linkVendor').val(rowProps.WANLPROP4);
				$('#linkBandwid').val(rowProps.WANLPROP9);
				$('#linkType').val(rowProps.WANLPROP5);
				$('#linkMode').val(rowProps.WANLPROP6);
				$('#linkSla').val(rowProps.WANLPROP7);
				$('#circuitId').val(rowProps.WANLPROP10);
				$('#linkContact').val(rowProps.WANLPROP8);
				$('#linkComment').val(rowProps.WANLPROP11);
				$('#linkPollInt').val(rowProps.pollinterval);
			}
		}
		$('.select2').select2();//No I18N
	},
	actions:{
		enableAlarmMsgIcon:function(selectboxID){
			$('.propertiesDropdown__icon[id!="'+selectboxID+'"]').removeClass('active');//No I18N
		 	if($("#"+selectboxID).hasClass("active")){
					$("#"+selectboxID).removeClass("active");//No I18N
			}
			else{
			$("#"+selectboxID).addClass("active");//No I18N
		   }
		},
		addSiteAlarmMsg:function(key,value){
			var msgtxt = $('#siteAlrmMsgCnt').val();
			if (msgtxt.indexOf(value.trim()) !== -1)
				{
					//alert(Ember.I18n.t("webclient.admin.profile.varexists",this)); //No I18n
					opmAlertPopUp("", Ember.I18n.t("webclient.admin.profile.varexists", this)); //NO I18N
					return false;
				}
				else
				{
					$('#siteAlrmMsgCnt').val(msgtxt+"\n"+value); //No I18N
					return true;
				}
		},
		addLinkAlarmMsg:function(key,value)
		{
			var msgtxt = $('#linkAlrmMsgCnt').val();
			if (msgtxt.indexOf(value.trim()) !== -1)
				{
					//alert(Ember.I18n.t("webclient.admin.profile.varexists",this)); //No I18n
					opmAlertPopUp("", Ember.I18n.t("webclient.admin.profile.varexists", this)); //NO I18N

					return false;
				}
				else
				{
					$('#linkAlrmMsgCnt').val(msgtxt+"\n"+value); //No I18N
					return true;
				}
		},
		saveSettings:function(){

			var siteThres = $("input:radio[name='siteSeverity']:checked").val();
			var allLinkDownSev = $('#allLinkDownSev option:selected').val(); //No I!8N
			var anyLinkDownSev = $('#anyLinkDownSev option:selected').val(); //No I18N
			var siteAlarmMsg = $('#siteAlrmMsgCnt').val();
			var linkAlarmMsg = $('#linkAlrmMsgCnt').val();
			var ipDownSev = $('#ipDownSev option:selected').val();
			var interval = $('#pollingInt').val();
			var failThresh = $('#wanPollThresh').val();
			var applyAll = $('#applyForAll').prop("checked");
			var clrnotfy = $('#notifyWhnClr').prop("checked");
			var fieldsToValidate = {'empty':['siteAlrmMsgCnt,linkAlrmMsgCnt,pollingInt,wanPollThresh'],'maxCharacters':{'siteAlrmMsgCnt':255,'linkAlrmMsgCnt':255},'rangeCheck':{'pollingInt':1440,'wanPollThresh':10},'minRangeCheck':{'pollingInt':1,'wanPollThresh':1}};//No I18N
			if(!opm_validateFields(fieldsToValidate)){
				return;
			}else{
				var dataObj = {};
				dataObj.POLLINTERVAL = interval;
				dataObj.SEV_ALL_WANLINK_DOWN = allLinkDownSev;
				dataObj.SEV_ANY_WANLINK_DOWN = anyLinkDownSev;
				dataObj.MSG_ALL_WANLINK_DOWN = siteAlarmMsg;
				dataObj.MSG_ANY_WANLINK_DOWN = siteAlarmMsg;
				dataObj.MSG_WANLINK_DOWN_CRITICAL = linkAlarmMsg;
				dataObj.WLM_SITE_AVAIL_THRESHOLD = siteThres;
				dataObj.SEV_WANLINK_DOWN_CRITICAL = ipDownSev;
				dataObj.THRLD_WANLINK_DOWN_CRITICAL = failThresh;
				dataObj.applyPollInterval = applyAll;
				dataObj.NOTIFY_ON_CLEAR = clrnotfy;
				var url = window.OPM.apiUrlPattern + '/admin/updateWANLinkSettings'; //No I18n
				var response = opm_ajaxPostRequest(url,{"wanLinkSettings":JSON.stringify(dataObj)});//No I18N
				if(response.error !== undefined){
					showMessage(response);
				}else{
					showMessage(response);
					this.get('parentView').send('closeAction');//No I18N
					OPMClient.SettingsWanLinksController.set('wanLinkSettingsCnt',{});//No I18N
				}
			}
		},
		saveWanSite:function(){
			var slideData = this.get('slideDetails.formattedData');
			var isEditAct = slideData.isEditAction;
			var siteName = $('#siteName').val();
			var siteDesc = $('#siteDesc').val();
			var siteRegion = $('#regionName').val();
			var siteLocation = $('#location').val();
			var siteLocationType = $('#locationType').val();
			var fieldsToValidate = {'empty':['siteName'],'opm_isValidVendorName':['siteName','siteDesc'],'maxCharacters':{'siteName':200,'siteDesc':200,'regionName':500,'location':500,'locationType':500}};//No I18N
			var siteIndex = OPMClient.SettingsWanLinksController.wanLinkAddProperties.map(function(e){return e.wanLinkSiteName;}).indexOf(siteName);
			if(siteIndex > -1){
				$('#siteName').val();
				$('#siteName').addClass('validateField error');
				$('#siteName').attr('data-error',Ember.I18n.t('webclient.Site.Name',this)+" "+siteName+" "+Ember.I18n.t('webclient.admin.qcw.graph.fail',this)); //No I18N
				opmValidate($('#linkIp_'+val.rowNumber));
				return false;
			}
			if(!opm_validateFields(fieldsToValidate)){
				return false;
			}else{
				var dataObj = {};
				var addProbs = {};
				dataObj.wanLinkSiteName = siteName;
				dataObj.description = siteDesc;
				addProbs.WANLPROP1 = siteRegion;
				addProbs.WANLPROP2 = siteLocation;
				addProbs.WANLPROP3 = siteLocationType;
				dataObj.wanLinkCustomProps = addProbs;
				if(isEditAct || (slideData.isFromSnapshot !== undefined && slideData.isFromSnapshot)){
					dataObj.name = slideData.moName;
					var url = window.OPM.apiUrlPattern + '/admin/updateWANLinkSite'; //No I18n
				}else{
					var url = window.OPM.apiUrlPattern + '/admin/addWANLinkSite'; //No I18n
				}
				var response = opm_ajaxPostRequest(url,{"wanlinkSiteObj":JSON.stringify(dataObj)});//No I18N
				if(response.error !== undefined){
					showMessage(response);
				}else{

					if(slideData.isFromSnapshot !== undefined && slideData.isFromSnapshot){
						showMessage(response);
						OPMClient.InventoryDeviceDetailsController.set('wanIPSiteDispName',siteName);//No I18N
						this.sendAction('action','reload');
						this.get('parentView').send('closeAction');//No I18N
						setTimeout(function(){
						reloadSnapWidgets(0);
						$("#wanLink_treeviewBtn").click();
						},1000);
					}else{
						if(slideData.isEditAction !== undefined && slideData.isEditAction){
							var siteMoid = slideData.editObj.summaryMap.wanlinkSiteMoID;
							var siteMoName = slideData.editObj.summaryMap.wlSiteMOName;
							dataObj.wanlinkSiteMoID = siteMoid;
							dataObj.wanSiteDispName = siteName;
							dataObj.wanLinkSiteName = siteMoName;
							var siteIndex = OPMClient.SettingsWanLinksController.wanSiteProperties.map(function(e){return e.wanlinkSiteMoID;}).indexOf(siteMoid);
							OPMClient.SettingsWanLinksController.wanSiteProperties[siteIndex].wanSiteDispName = siteName;
						
						}else{
							var siteMoid = response.wanLinkSiteMoID;
							var siteMoName = siteName;
							dataObj.wanlinkSiteMoID = siteMoid;
							dataObj.wanSiteDispName = siteName;
							dataObj.wanLinkSiteName = siteMoName;
							OPMClient.SettingsWanLinksController.wanSiteProperties.pushObject(dataObj);
						}
						OPMClient.SettingsWanLinksController.set('selectedSite',{'wanlinkSiteMoID':siteMoid,'wanLinkSiteName':siteMoName,'wanSiteDispName':siteName});//No I18N
						$('#sitzFilterDiv').removeClass('active');
						$('#sitzDropDownList #'+siteMoid).attr('selected',false);//NO I18N
						this.get('parentView').send('closeAction');//No I18N
					}
				}
			}
		},
		saveLinkAddProperties:function(){
			var slideData = this.get('slideDetails.formattedData');
			var isEditAct = slideData.isEditAction;
			var fromsnap = slideData.isFromSnapshot !== undefined ?true:false;

			var linkId = this.get('rowId');
			var vendorName = $('#linkVendor').val();
			var bandwidth = $('#linkBandwid').val();
			var linktype = $('#linkType').val();
			var linkmode = $('#linkMode').val();
			var linkSLa = $('#linkSla').val();
			var circuitid = $('#circuitId').val();
			var contact = $('#linkContact').val();
			var comments = $('#linkComment').val();
			var pollInt = $('#linkPollInt').val();

			var fieldsToValidate = {'empty':['linkPollInt'],'rangeCheck':{'linkPollInt':1440},'minRangeCheck':{'linkPollInt':1},'maxCharacters':{'linkName':250,'linkVendor':255,'linkType':255,'linkMode':255,'circuitId':50,'linkContact':50,'linkComment':500}};//No I18N

			if(fromsnap){
				var snapResp = slideData.editObj.summaryMap;
				var linkName = $('#linkName').val();
				var linkIpAddress = $('#linkIp').val();
				fieldsToValidate.empty = ['linkName','linkIp']; //No I18N
				fieldsToValidate.ipCheck = ['linkIp']; //No I18N
				fieldsToValidate.rangeCheck = {'linkPollInt':1440}; //No I18N
				fieldsToValidate.minRangeCheck = {'linkPollInt':1}; //No I18N
			}
			if(bandwidth !== "" && bandwidth !== undefined){
				fieldsToValidate.minRangeCheck = {'linkBandwid':0};//No I18N
				fieldsToValidate.positive = ['linkBandwid'];
				fieldsToValidate = {custom:[{condition:!opm_isIntfSpeedWithinLimit(bandwidth),identifier:'linkBandwid',message:(Ember.I18n.t('webclient.devices.intftypes.maxValAlwd',this)+" 1 Terabit/sec")}]};//No I18N
			}
			if(linkSLa !== "" && linkSLa !== undefined){
				fieldsToValidate.validIntegerorDecimal = ['linkSla'];
				fieldsToValidate.rangeCheck = {'linkSla':100};//No I18N
				fieldsToValidate.minRangeCheck = {'linkSla':0};//No I18N
			}
			if(!opm_validateFields(fieldsToValidate)){
				return false;
			}else{

				var linkProperties = {};
				if(vendorName !== ""){
					linkProperties.WANLPROP4 = vendorName;
				}
				if(bandwidth !== ""){
					linkProperties.WANLPROP9 = bandwidth;
				}
				if(linktype !== ""){
					linkProperties.WANLPROP5 = linktype;
				}
				if(linkmode !== ""){
					linkProperties.WANLPROP6 = linkmode;
				}
				if(linkSLa !== "" && linkSLa ){
					linkProperties.WANLPROP7 = linkSLa;
				}
				if(circuitid !== ""){
					linkProperties.WANLPROP10 = circuitid;
				}
				if(contact !== ""){
					linkProperties.WANLPROP8 = contact;
				}
				if(comments !== ""){
					linkProperties.WANLPROP11 = comments;
				}
				if(fromsnap){
					var dataObj = {};
					dataObj.wanlinkSiteMoID = snapResp.wanlinkSiteMoID;
					dataObj.name = snapResp.moName;
					var objArr = {};
					var dataArr = [];
					objArr.displayName = linkName;
					objArr.targetIP = linkIpAddress;
					objArr.pollinterval=pollInt;
					objArr.rttOprType = 1;
					objArr.wanLinkCustomProps = linkProperties;
					dataArr.pushObject(objArr);
					dataObj.dataArray = dataArr;
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/updateWANLinkMonitor",{"wanLinkMonObj":JSON.stringify(dataObj)}); //No I18N
					showMessage(response);
					if(response.error === undefined){
						OPMClient.InventoryDeviceDetailsController.set('wanIPDispName',linkName);//No I18N
					}
					this.get('parentView').send('closeAction');//No I18N
					OPMClient.InventoryDeviceDetailsController.set('wanName',linkName);//No I18N
					setTimeout(function(){
						reloadSnapWidgetsByWidgetID(OPMClient.InventoryDeviceDetailsController.opmWANLinkSummaryWidId);
						reloadSnapWidgets(0);
					},1000);
				}else{
					if(pollInt !== ""){
						linkProperties.pollinterval = pollInt;
					}
					var upIndex = OPMClient.SettingsWanLinksController.wanLinkAddProperties.map(function(e){return e.rowNumber;}).indexOf(linkId);
					OPMClient.SettingsWanLinksController.wanLinkAddProperties[upIndex].addProps = linkProperties;
					var rowId = slideData.rowNumber;
					$('#addProtxt_'+rowId).text(Ember.I18n.t('webclient.title.edit',this)+" "+Ember.I18n.t('webclient.Properties',this)); //No I18N
					this.get('parentView').send('closeAction');//No I18N
				}
			}
		},
		closeAction:function() {
			this.get('parentView').send('closeAction');//No I18N
			OPMClient.SettingsWanLinksController.set('wanLinkSettingsCnt',{});//No I18N
		}
	},
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();
		OPMClient.SettingsWanLinksController.set('wanLinkSettingsCnt',{});//No I18N
		if(this.get('slideDetails') !== undefined){
			slideOutWithId(this.get('slideDetails').id);
			this.set('slideDetails',undefined);//NO I18N
			//OPMClient.SettingsWanLinksController.set("wanLinksSettings",{});//No I18N
		}
	}
});
OPMClient.OpmwanLinkSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-wanlink-summary", //No I18N
	didInsertElement: function(){
		var self = this;
		var adjustedHeight = $('.com_SummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-70;//No I18N
		if(window.OPM.isNewSnapshotPage){
			if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "Site"){
				this.set('widgetData.sizey',15);//No I18N
				adjustedHeight = snapHeightCalculation[16]-70;
			}else{
				this.set('widgetData.sizey',20);//No I18N
				adjustedHeight = snapHeightCalculation[20]-70;

				$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
					axis:'y',scrollButtons:{enable:true},theme:'light-thick',setHeight:adjustedHeight,scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
				});
			}
		}
		opm_tooltip();

	},
	willDestroyElement: function(){
		$(this.element).find('.DIGmCustomScroll > div').mCustomScrollbar('destroy');
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmWanlinkDetailsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-wanlink-details-summary", //No I18N
	didInsertElement: function(){
		var self = this;
		this.set('widgetData.hideExpand',true);//No I18N
	/*	if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "Site"){
			this.set('widgetData.sizey',15);//No I18N
		}else{
			this.set('widgetData.sizey',20);//No I18N
		}*/
		
		var widgetData = this.widgetData;
		OPMClient.InventoryDeviceDetailsController.set('opmWANLinkSummaryWidId',widgetData.id);//No I18N
		if(widgetData.snapType === "WANLink" || widgetData.snapType === "Link"){
			OPMClient.InventoryDeviceDetailsController.set('wanDisplayName',widgetData.siteName); //No I18N
				OPMClient.InventoryDeviceDetailsController.set('opmWANLinkSiteMo',widgetData.summaryMap.siteMOName);//No I18N
				OPMClient.InventoryDeviceDetailsController.set('wanName',widgetData.monDispName);//No I18N
		}else{
			OPMClient.InventoryDeviceDetailsController.set('opmWANLinkSiteMo',widgetData.moid);//No I18N
			OPMClient.InventoryDeviceDetailsController.set('wanDisplayName',widgetData.siteName); //No I18N
		}
	},
	actions:{
		mapInterface_frmSnapSummay:function()
		{
			var self = this;
			var slideDetails = {};
			var data = {'showPage':'wan_ConfigInterface','editObj':{},'isEditAction':true};//NO I18N
			var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
			var url = window.OPM.apiUrlPattern + '/device/getCategoryList?excludeStorage=true';//No I18N
			var respObj = opm_ajaxGetResponse(url);
			var catArr = [];
			$.each(respObj,function(key,value)
			{
				value = escapeHTML(value);
				catArr.push({'key':key,'value':value});
			});
			OPMClient.InventoryDeviceDetailsController.set('opmwanLinkActionCategory',catArr);//No I18N
			data.moName =deviceName; 
			slideDetails.isSmall = true;
			slideDetails.id = "mapInterface";
			slideDetails.slideHeader = Ember.I18n.t('webclient.opm.mapintf',this);//No I18N
            slideDetails.componentName = "OPMClient.OpmWanlinksSnapshotConfigsComponent";//No I18N
			slideDetails.formattedData=data;
            slideDetails.parentObj = this;
			OPMClient.InventoryOpmDeviceListController.set("pingRespSlideDetails",undefined);//No I18N
            OPMClient.InventoryOpmDeviceListController.set("pingRespSlideDetails",slideDetails);//No I18N
		}
		
	},willDestroyElement: function(){
		OPMClient.InventoryOpmDeviceListController.set("pingRespSlideDetails",undefined);//No I18N
	}
});
OPMClient.OpmwanDistributionComponent = Ember.Component.extend({
	templateName: "components/opm-wanlink-distribuition", //No I18N
	didInsertElement: function(){
		this.set('widgetData.hideExpand',true);//No I18N
		var self = this;
		var snapObj = self.snapshotObj;
		if(snapObj.snapType !== "Link"){
			self.set('chartDataObj',[]); //No I18N
			var currentWidgetData = self.widgetData;
			var colr = bv_availColors;
        	var chartDataObj = {
				 "placeholder":[],//No I18N
				"chartobj":[]//No I18N
				}
				var period_key = $('#param_'+currentWidgetData.id+'_period option:selected').val();
				var timeFormat = zGraphTimePeriodList[period_key];
			var id1='perfGraph' + self.get('widgetData').id;//No I18N
		        var chartObj = {
		            id:id1,
		            type:'bar',//No I18N
		            jsonData:currentWidgetData.apiData.dashBoardDetails.Distribution.data.chartData,
		            series:"multi",//No I18N
		            height:250,
		            columns:{
		                datatype_1:"time",//No I18N
		                datatype_2:'numeric',//No I18N
		                columnname_1:currentWidgetData.apiData.dashBoardDetails.Distribution.data.xyTitles[0],
		                columnname_2:currentWidgetData.apiData.dashBoardDetails.Distribution.data.xyTitles[1],
		                columnname_3:'Label',//No I18N
		                timeFormat:(timeFormat !== undefined? timeFormat : 'hours')//$("#selectedTime option:selected").data('time')//No I18N
		                },
		            canvas:{
		                title:{
		                    show:false,
		                    text:""
		                }
		            },
		        chart:{stacked:true},
		        area:{marker:true},
		        legend:{
		            "enabled":true,//No I18N
					"colorBox": { //No I18N
                        "shape": "circle", //No I18N
                        "strokeOpacity": 1 //No I18N
                    },
					"layout":"horizontal",//No I18N
					"hAlign": "center", //No I18N
                    "vAlign": "bottom" //No I18N
		        },
		        bar:{
		            rotated:false,
		            levelMarker:true
		       },
		       pie:{innerLabel:false},
		       tooltip:[0,1,2]

		    }
		    chartObj.legend.colors = colr;
			self.set("chartDataObj",chartObj);//No I18N
			this.set('widgetData.sizey',15);//No I18N
		}else{
			this.set('widgetData.sizey',20);//No I18N
		}
	},willDestroyElement: function(){
	}
});

OPMClient.OpmWanlinksSnapshotConfigsComponent = Ember.Component.extend({
	templateName: "components/wanlinks-snapshot-configs", //No I18N
	didInsertElement: function(){
		var self = this;
		var slideData = self.get('slideDetails.formattedData');
		$('.WAN_SnapActionDiv').hide(); 
		if(slideData.showPage === "wan_ConfigInterface"){
			$('#wan_ConfigInterface').show();
			//this.send('getDevicesbasedonCategory'); //No I18N
			$('.select2').select2();
		}else if(slideData.showPage === "wan_associateNotif"){ //No I18N
			$('#wan_associateNotif').show();
			if(slideData.isBulkAssociation !== undefined && slideData.isBulkAssociation){
				$('#wanAssociatedProfiles').hide();
				$('#globalProfileList_WAN').show();
				this.send('AssociateNPTemplate'); //No I18N
			}else{
				$('#wanAssociatedProfiles').show();
				$('#globalProfileList_WAN').hide();
				opm_deviceSnapshotloadNotifTemplateGrid(slideData.moName);
			}
		}
	},
	actions:{
		getDevicesbasedonCategory:function()
		{
			var name = ($("#category option:selected").val() === "none") ? "" : $("#category option:selected").val();//No I18n
			var url = window.OPM.apiUrlPattern + "/device/fetchDevicesList?"; //No I18N
			if(name !== "" && name !== null)
			{
				url = url+"category="+name; //No I18N
			}else{
				//alert(Ember.I18n.t('webclient.common.widgets.selectacategory',this));//No I18N
				opmAlertPopUp("", Ember.I18n.t("webclient.common.widgets.selectacategory", this)); //NO I18N
				return;
			}
			var jsonResponse = opm_ajaxGetResponse(url);
			var devArr = [];
				devArr.push({'id':'','text':Ember.I18n.t('webclient.Select',this)});//No I18N
			$.each(jsonResponse,function(key,val){
				devArr.push({'id':val.name,'text':escapeHtmlTags(val.displayName)});//No I18N
			});
			$("#devices").empty().select2({data:devArr}); //No I18N
			$("#interfacesToMap").empty();//No I18N
		},
		fetchInterfaces:function(){
			var deviceName = $('#devices option:selected').val();//No I18N
			
			if(deviceName !== ""){
				var url = window.OPM.apiUrlPattern + '/device/getInterfaces?name='+deviceName;//No I18N
				var respObj = opm_ajaxGetResponse(url);
				var intfArr = [];
				intfArr.push({'id':'','text':Ember.I18n.t('webclient.Select',this)});//No I18N
				$.each(respObj.interfaces,function(index,obj)
				{
					intfArr.push({'id':obj.name,'text':escapeHtmlTags(obj.displayName),'dispName':escapeHtmlTags(obj.displayName)});//No I18N
				});
				$("#interfacesToMap").select2({data:intfArr}); //No I18N
			}else{
				opmAlertPopUp("", Ember.I18n.t("webclient.common.widgets.selectadevice", this)); //NO I18N
				return;
			}
		},
		mapEntityToLink:function(){
			var entity = $('#interfacesToMap option:selected').val();
			if(entity !== undefined ||  entity !== ""){
				var linkMo = OPMClient.InventoryDeviceDetailsController.deviceName;
				var url = window.OPM.apiUrlPattern + "/admin/associateWANLinkToEntity";//No I18N
				var postParams={'name':linkMo,'entityType':'Interface','entityName':entity};//NO I18N
				var jsonResponse = opm_ajaxPostRequest(url,postParams);
				if(jsonResponse.error!==undefined) {
					opm_infoMsgs("errorMsg",jsonResponse.error.message);//No I18N
				}else{
					OPMClient.InventoryDeviceDetailsController.set('opmWanLinkInfConfig',true);//No I18N
					OPMClient.InventoryDeviceDetailsController.set('opmWanLinkIntfMo',entity);//No I18N
					this.get('parentView').send('closeAction');//No I18N
					//setTimeout(function(){
						reloadSnapWidgets(0);
						showMessage(jsonResponse);
						$('.intfSubTabs li').removeClass('active');	
						$('.intfSubTabs li')[0].click();	

					//},150);
				}
			}else{
				$("#interfacesToMap").addClass('validateField error');//No I18N
                $("#interfacesToMap").attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
			}
		},
		AssociateNPTemplate:function()
		{
			$('#wanAssociatedProfiles').hide();
			$('#globalProfileList_WAN').show();
			var hasAssociated = false;
			var slideData = this.get('slideDetails.formattedData');
			if(slideData.isBulkAssociation !== undefined && slideData.isBulkAssociation){
           		var deviceNotificationUrl = window.OPM.apiUrlPattern + "/admin/listNotificationTemplateProfiles?";//No I18N
			}else{
           		var deviceNotificationUrl = window.OPM.apiUrlPattern + "/admin/listNotificationTemplateProfiles?entityName="+slideData.moName;//No I18N
			}
			 var jsonResponse = opm_ajaxGetResponse(deviceNotificationUrl);
            var notifyProfileListData = [];
            if (jsonResponse !== null && jsonResponse.error === undefined && jsonResponse.message === undefined) {
               $.each(jsonResponse, function (key, value) {
                    hasAssociated = (value.hasAssociated !== undefined && value.hasAssociated) ? true : false;
                    notifyProfileListData.push({ "profileName": value.profileName, "profileType": value.profileType, "templateID": value.templateID, "hasSelected": hasAssociated, "status": value.status });//No I18N
                });
				var colNames = [Ember.I18n.t('jsp.commonstr.TemplateName', this), Ember.I18n.t('webclient.admin.notifprofiles.profiletype', this), '',Ember.I18n.t('webclient.topo.actions.deviceinfo.status', this),""]; //No I18N 
				var colModel = [
					{ name: 'profileName', index: 'profileName', width: 30, formatter: jqGridHTMLEncode }, //No I18N
					{ name: 'profileType', index: 'profileType', width: 30 }, //No I18N
					{ name: 'templateID', index: 'templateID', hidden: true, width: "0", classes: "GridColHidden" }, //No I18N
					{ name: 'status', index: 'status', width: 30, formatter: ShowNotifProfileEnableDisable }, //No I18N
					{ name: 'id', index: 'id',hidden:true} //No I18N
				];
                var defaultOptions = { "sortName":"profileName","sortOrder":"asc","multiselect":true };//No I18N
                opm_loadJQgridWithData("#opm_DevNGlobalProfileTempList", notifyProfileListData, colNames, colModel, "", "#opm_DevNGlobalProfilePager", "opm_DevNGlobalProfileTempList", defaultOptions); //No I18N
				if(slideData.isBulkAssociation === undefined || !slideData.isBulkAssociation){
					var rowCount = 1;
					$.each(notifyProfileListData, function (k, notifyProfile) {
						if (notifyProfile.hasSelected === true) {
							$("#jqg_opm_DevNGlobalProfileTempList_" + rowCount).attr('checked', true);
							$("#jqg_opm_DevNGlobalProfileTempList_" + rowCount).attr('disabled', true);
							$("#jqg_opm_DevNGlobalProfileTempList_" + rowCount).closest('tr').click(function () {
								return false;
							});
						}
						rowCount++;
					});
					var count = $('#opm_DevNGlobalProfileTempList').find('.cbox:checked').length;
					if(count == rowCount-1) {
						$('#cb_opm_DevNGlobalProfileTempList').attr('checked', true);
						$('#cb_opm_DevNGlobalProfileTempList').attr('disabled', true);
					}
				}
			}
		},
		addSelectedProfile:function()
		{
			var ids = getJqGridSelectedRows('opm_DevNGlobalProfileTempList','templateID');//No I18N
			if(ids === "") {
				opmAlertPopUp("", Ember.I18n.t("webclient.dtprofile.associate", this)); //NO I18N
                return;
            }
			var sType = "WANLinkMonitor"; //No I18N
			if(OPMClient.InventoryDeviceDetailsController.isWANIPMonitoringSnap && !OPMClient.InventoryDeviceDetailsController.isWANIPLinkSnapshot){
				sType = "WANLinkSite"; //No I18N
			}
			var slideData = this.get('slideDetails.formattedData');
			var moNames = (slideData.moName).split(',');
			if(slideData.isBulkAssociation !== undefined && slideData.isBulkAssociation){
				
				var  resp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/associateNotificationTemplate?module=WANIPs&type='+sType+'&entityNames='+JSON.stringify(moNames)+'&profileIds='+JSON.stringify(ids));//No I18N
			}else{
           		var  resp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/associateNotificationTemplate?module=WANIPs&type='+sType+'&entityNames='+JSON.stringify(moNames)+'&profileIds='+JSON.stringify(ids));//No I18N
			}
			if(resp.error !== undefined) {
                showMessage(resp);
            }else{
				showMessage(resp,'','');
				if(slideData.isBulkAssociation !== undefined && slideData.isBulkAssociation){
					this.get('parentView').send('closeAction');//No I18N
				}else{
					$('#wanAssociatedProfiles').show();//No I18N
					$('#globalProfileList_WAN').hide();//No I18N
					$('#opm_DevNotificationTempList').jqGrid("GridUnload");//No I18N
					opm_deviceSnapshotloadNotifTemplateGrid(slideData.moName);
				}
			}
		},
		deleteNProfile:function()
		{
			var ids = getJqGridSelectedRows('opm_DevNotificationTempList','profileId'); //No I18N
			var sType = "WANLinkMonitor"; //No I18N
			if(OPMClient.InventoryDeviceDetailsController.isWANIPMonitoringSnap && !OPMClient.InventoryDeviceDetailsController.isWANIPLinkSnapshot){
				sType = "WANLinkSite"; //No I18N
			}
            if(ids !== undefined && ids !== "")
            {
                opmConfirm(Ember.I18n.t('webclient.agent.confirm'),Ember.I18n.t('webclient.admin.credential.delete',this)+" "+Ember.I18n.t('opm.client.resetthis',this)+" "+Ember.I18n.t('webclient.commonstr.template',this), '', function(){ 
                    var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/dissociateNotificationTemplate?module=WANIPs&type="+sType+"&profileIds="+JSON.stringify(ids)+"&entityNames="+OPMClient.InventoryDeviceDetailsController.deviceName); //No I18n
                    if (response.error !== undefined)
                    {
                        message = response.error.message;
                        opm_infoMsgs('errorMsg', message); //No I18N
                    }
                    else if (response.message !== undefined && response.message !== "")
                    {
                        opm_infoMsgs('successMsg', response.message); //No I18N
						opm_deviceSnapshotloadNotifTemplateGrid(OPMClient.InventoryDeviceDetailsController.deviceName);
                    }
                },Ember.I18n.t('webclient.action.ok'), '', Ember.I18n.t('webclient.action.cancel'), '', 'dialogStyle2', true); //No I18n
            }else{
				opmAlertPopUp("", Ember.I18n.t("webclient.snp.profiles.selecttodelete", this),500); //NO I18N
                return false;
            }
		},
		backtoNProfiles:function()
		{
			var slideData = this.get('slideDetails.formattedData');
			if(slideData.isBulkAssociation !== undefined && slideData.isBulkAssociation){
				this.get('parentView').send('closeAction');//No I18N
			}else{
				$('#wanAssociatedProfiles').show();
				$('#opm_DevNGlobalProfileTempList').jqGrid("GridUnload");//No I18N
				$('#globalProfileList_WAN').hide();
			}
		},
		closeAction: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	}
});

OPMClient.OpmSDWANTopoMapComponent = Ember.Component.extend({
	templateName: "components/opm-sdwan-topomap",//No I18N
	didInsertElement : function(){
		var self = this;
		self.set('internetStatus',true); //No I18n
		$('.spinner-loader').show();
		var networkId=this.get('widgetData').id;//No I18N
		var currentWidgetData = this.widgetData.apiData;
		
		if(currentWidgetData.nodeDetails !== undefined && Object.keys(currentWidgetData.nodeDetails).length > 0)
		{
			var setwidget_ht = Math.round((screen.height - 300) / 21.8);
			this.set('widgetData.sizey',setwidget_ht);//No I18N		
			opm_SDWAN_TopologyMap(currentWidgetData,"sdwan_topoMap"); //No I18n
		}else{
			this.set('widgetData.noData',true);//No I18N
			this.set('widgetData.sizey',2);//No I18N
		}
	},
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmAdaptiveThresholdLimitComponent = Ember.Component.extend({
	templateName: "components/opm-adaptive-threshold-limit",//No I18N
	classNames:['displayNone'],//No I18N
	attributeBindings: ['id'],//No I18N
	id: 'atAdvConfig', //No I18N
	lowerLimitTypeId:'lowerLimitType',//No I18N
	lowerLimitValueId:'lowerLimitValue',//No I18N
	upperLimitTypeId:'upperLimitType',//No I18N
	upperLimitValueId:'upperLimitValue',//No I18N
	upperLimitMsgId:'upperLimitMsg',//No I18N
	actions:{
		suppressLimitConditionChange:function(){
			var selLowerLimitVal = $("#"+this.lowerLimitTypeId).val();//No I18N
			if(selLowerLimitVal==="min"){//No I18N
				$("#lowerLimitType").closest(".opmFormRow").find('.helpCard p').text(Ember.I18n.t("webclient.opm.at.suppress.min",this));//No I18N
				$("#upperLimitType").closest(".opmFormRow").find('.helpCard p').text(Ember.I18n.t("webclient.opm.at.static.max",this));//No I18N
			}else{
				$("#lowerLimitType").closest(".opmFormRow").find('.helpCard p').text(Ember.I18n.t("webclient.opm.at.suppress.max",this));//No I18N
				$("#upperLimitType").closest(".opmFormRow").find('.helpCard p').text(Ember.I18n.t("webclient.opm.at.static.min",this));//No I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmGroupsMapComponent = Ember.Component.extend({
	templateName: "components/opm-groups-map", //No I18N
	didInsertElement: function(){
		var self = this;
		
		/*$(".grpMap_filterOrphan").show();
		if(OPMClient.InventoryDeviceDetailsController.inventorysnapType !== undefined && OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice" || OPMClient.GroupingController.groupDetails.groupType !== undefined && OPMClient.GroupingController.groupDetails.groupType === "Group")
		{
			$(".grpMap_filterOrphan").hide();
		}*/
		OPMClient.GroupingController.set("breadcrumpList",[]);//No I18N
		OPMClient.GroupingController.breadcrumpList.pushObject(OPMClient.GroupingController.groupDetails);
		getGroupsMapData(true);
		$("#grpMapsView_FitToScreen").hide();
		$(".group-map-view-legends").addClass("groupsMap-legendsTop");
		if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapType !== "MonitoringDevice")
		{
			$("#grpMapsView_FitToScreen").show();
			$(".group-map-view-legends").removeClass("groupsMap-legendsTop");
		}

		 $("#bvDev_search").keyup(function(e) {
		        	var key = e.keyCode || e.charCode || 0;
		        	 var searchTxt = this.value;
		        	$(".bvDeviceSearchBox .searchBoxClose").show();
		            if(key === $.ui.keyCode.ENTER) 
		            {
		            	opm_highlightGroupElement(searchTxt);
		            }
		           	else if((key === $.ui.keyCode.BACKSPACE || key === $.ui.keyCode.DELETE) && trimAll(searchTxt) == "") 
		            {
		            	opm_highlightGroupElement(searchTxt);
		            	$(".bvDeviceSearchBox .searchBoxClose").hide();
		            }
		           
					
					$(".bvDeviceSearchBox .searchBoxClose").off("click");
					$(".bvDeviceSearchBox .searchBoxClose").on("click",function(e){
						$("#bvDev_search").val("");
						opm_highlightGroupElement(""); //No I18N
						$(".bvDeviceSearchBox .searchBoxClose").hide();
						
					});
		            
				});
			 
				

	},
	closeAlertInfo: function() {
			$('#v2BodyHolder').removeClass('layer2AlertInfoActive'); //No I18n
		},
	actions:{
		closeGroupsMapSlide: function() {
			//this.get('parentView').send('closeAction');//No I18N
			OPMClient.GroupingController.set("mapSlideDetails",undefined);//No I18N
		},
		saveMap: function() {
			saveGroupsElementCoordinates("groups_mapContainer",OPMClient.GroupingController.groupDetails.groupID,false);//No I18N
		},
		resetMap: function(){
			this.closeAlertInfo();
			this.didInsertElement();
		},
		closeSaveBand: function()
		{
			this.closeAlertInfo();
		},
		showPrevMap: function(obj){
			$("#grpMap-breadcrumb #"+obj.groupID).nextAll().remove();//No I18N
			if($("#grpMap-breadcrumb ul li").length === 1)
			{
				$("#grpMap-breadcrumb").hide();
				$(".grpMap_filterOrphan").hide();
			}
			var groupDetails = {groupID:obj.groupID,groupName:obj.groupName,groupType:obj.groupType};
			OPMClient.GroupingController.set("groupDetails",groupDetails);//No I18N
    		getGroupsMapData(true);
		},closeDeviceAlarmSlide: function()
		{
			slideOut(9);
			OPMClient.BVMapDetailsController.set("isShowToolTip",false);//No I18N
			hideL2Tooltip = true;
			$("#deviceInfoToolTip").hide();
		}
	},
	willDestroyElement: function(){
		OPMClient.GroupingController.set("breadcrumpList",[]);//No I18N
		OPMClient.GroupingController.set("groupDetails","");//No I18N
		OPMClient.GroupingController.set("mapSlideDetails",undefined);//No I18N
		OPMClient.Layer2MapDetailsController.set("Zoom",false); //No I18n
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.DeviceFilterCategoryComponent = Ember.Component.extend({
	didInsertElement: function(){
		var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/device/getDeviceCategories"); //No I18N
		var categoryOptions = this.categoryOptions;
		var optionsHeader = {
			'Business View': Ember.I18n.t('webclient.reports.rightlist.businessview', this),//No I18N
			'Infrastructure View': Ember.I18n.t('webclient.common.widgets.category', this),//No I18N
			'General': Ember.I18n.t('webclient.devices.details.general', this),//No I18N
			'Groups': Ember.I18n.t('webclient.opm.groups', this)//No I18N
		};
		if (jsonData.message === undefined && Object.keys(jsonData).length > 0) {
			var dropDownOptions = [
				{ value: '4', label: Ember.I18n.t("webclient.discovery.AllDevices", this) } //No I18N
			];

			Object.keys(jsonData).forEach(function(key) {
				var value = jsonData[key];
				if (!$.isEmptyObject(value)) {
					
					var displayName = optionsHeader[key] || key;
					var group = {
						label: opm_escapeHTML(displayName),
						options: Object.keys(value).map(function(entryKey) {
							return {
								value: opm_escapeHTML(entryKey),
								label: opm_escapeHTML(value[entryKey]),
								isActive: false
							};
						})
					};
					if(categoryOptions.includes(key)) {
						dropDownOptions.push(group);
					}
				}
			});
			this.set('controller.deviceFilterOptions', dropDownOptions);//No I18N
			Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
				$("#component_device_filter_category").select2(); //No I18N
				this.send("deviceCategoryFilterChange");//No I18N
			});
		}
	},
	actions: {
		deviceCategoryFilterChange: function() {
			var selectedValue = $('#component_device_filter_category').val(); //No I18N
			var instanceObj = this.get('instanceObj');//No I18N
			var triggerAction = this.get('triggerAction');//No I18N
			instanceObj.send(triggerAction, selectedValue);
		}
	}
})

OPMClient.DevicesListWithCategoryFilterComponent = Ember.Component.extend({
	categoryID: null,
	devicesList: [],
	filteredList: [],
	displayedList: [],
	searchQuery: '',
	sortAscending: true,
	itemsPerPage: 200,
	currentPage: 1,

	didInsertElement: function () {
		this.fetchDevices();
		this.setupScrollListener();
	},

	fetchDevices: function () {
		var categoryID = this.selectedCategory;
		if (!categoryID) {
			return;
		}
		var data = {}
		if(this.timePeriodObj) {
			data.period = this.timePeriodObj.timePeriod;
			if(this.timePeriodObj.timePeriod === "custom" &&  this.timePeriodObj.customTime) { //No I18N
				if (this.timePeriodObj.customTime.startDate) {
					data.startDate = this.timePeriodObj.customTime.startDate;
				}
				if (this.timePeriodObj.customTime.endDate) {
					data.endDate = this.timePeriodObj.customTime.endDate;
				}
			}
		}
		var url = window.OPM.apiUrlPattern + "/zia/listGroupsWithAnomaly"; //No I18N
		if(!this.isGroup) {
			data.filterID = categoryID;
			var url = window.OPM.apiUrlPattern + "/zia/listDevicesWithAnomaly"; //No I18N
		}
		var response = opm_ajaxGetResponse(url, data);
		if(response.error) {
			showMessage(response);
			this.send("setActiveAndSendAction", "");//No I18N
			return;
		}
		var selectFromParent = "";
		var itemIndex = -1;
		if (response) {
			this.set('devicesList', response);//No I18N
			this.set('filteredList', response);//No I18N
			if(this.selectFromParent) {
				var param = this.selectFromParent;
				var filteredList = this.get('filteredList');
				var itemIndex = filteredList.findIndex(function(device) {
					return device.id === param;
				});
				if (itemIndex !== -1) {
					var item = filteredList[itemIndex];
					filteredList.splice(itemIndex, 1);
					filteredList.unshift(item);
					this.set('filteredList', filteredList); //No I18n
					this.set('currentPage', 1); //No I18n
					this.updateDisplayedList();
					selectFromParent = filteredList[0].id
				}
			} 
			if(itemIndex === -1) {
				this.updateDisplayedList();
			}
			this.send("setActiveAndSendAction", selectFromParent && itemIndex !== -1 ?  selectFromParent : (response[0] ? response[0].id : ""));//No I18N
			if(this.selectFromParent) {
				this.selectFromParent = null;
				selectFromParent = null;
			}
		}
	}.observes('selectedCategory', 'isGroup', 'timePeriodObj'),//No I18N
	setupScrollListener: function () {
		var container = $(this.containerElement);
		container.on('scroll', function() {//No I18N
			if (container.scrollTop() + container.innerHeight() >= container[0].scrollHeight - 5) {
				this.loadMoreItems();
			}
		});
	},

	updateDisplayedList: function () {
		var start = 0;
		var end = this.get('currentPage') * this.get('itemsPerPage');//No I18N
		this.set('displayedList', this.get('filteredList').slice(start, end));//No I18N
	},

	loadMoreItems: function () {
		this.incrementProperty('currentPage');//No I18N
		this.updateDisplayedList();
	},
	actions: {
		searchDevices: function (val) {
			var query = $("#deviceWithCat_Search_input").val();//No I18N
			if (!query) {
				this.set('filteredList', this.get('devicesList'));//No I18N
			} else {
				var devicesList = this.get('devicesList');//No I18N
				var filteredList = devicesList.filter(function(device) {
					return device.displayname.toLowerCase().indexOf(query.toLowerCase()) !== -1;
				});
				// Preserve the isActive state
				var activeDevice = this.get('devicesList').findBy('isActive', true);//No I18N
				if (activeDevice) {
					filteredList = filteredList.map(function(device) {
						return Object.assign({}, device, {
							isActive: device.id === activeDevice.id
						});
					});
				}
				this.set('filteredList', filteredList);//No I18N
			}
			this.set('currentPage', 1);//No I18N
			this.updateDisplayedList();
		},

		sortDevices: function () {
			var sortAscending = this.get('sortAscending');//No I18N
			var filteredList = this.get('filteredList').sort(function(a, b) {//No I18N
				if (a.displayname < b.displayname) {
					return sortAscending ? -1 : 1;
				}
				if (a.displayname > b.displayname) {
					return sortAscending ? 1 : -1;
				}
				return 0;
			});
			this.set('filteredList', filteredList);//No I18N
			this.set('currentPage', 1);//No I18N
			this.updateDisplayedList();
			this.toggleProperty('sortAscending');//No I18N
		},
		setActiveAndSendAction: function(id) {
			var instanceObj = this.get('instanceObj');//No I18N
			var triggerAction = this.get('triggerAction');//No I18N
			if(id){
				this.set('displayedList', this.get('displayedList').map(function(device) {//No I18N
					return Object.assign({}, device, {
						isActive: device.id === id
					});
				}));
				this.set('devicesList', this.get('devicesList').map(function(device) {//No I18N
					return Object.assign({}, device, {
						isActive: device.id === id
					});
				}));
				if(this.isGroup) {
					var activeGroup = this.get('displayedList').findBy('id', id);//No I18N
					if (activeGroup) {
						id = activeGroup.name;
					}
				}
			}
			instanceObj.send(triggerAction, id);
		},
		exportAnomalyData: function(type) {
			opm_exportFilesPostMethod(window.OPM.apiUrlPattern + "/zia/exportAnomalyData", {//No I18N
				"exportType": type//No I18N
			})
		}
	}
});
OPMClient.InputTagTextField = Ember.TextField.extend({
	classNameBindings: ['hideInput:displayNone'], //NO I18N
	hideInput: function () {
		return this.get('tags.length') > 0 && this.get('currentlyInfield') == false; //NO I18N
	}.property('tags.length') //NO I18N
});
OPMClient.OpmTagInputComponent = Ember.Component.extend({
	templateName: "components/opm-tag-input",//No I18N
	inputText: '',
	currentlyInfield: false,
	customId: null,
	attributeBindings: ['elementId'], // You MUST bind 'elementId' //NO I18N
	tags: [],
	visibleTags: [],
	moretags: [],
	isRestrictedOpen: false,
	tagName: 'div', // No I18N
	classNameBindings: ['isMouseActive:zindex9999 positionRelative','isFullWidth:tagInputFullWidth'], //NO I18N

	classNames: ['opmFormCol width30p inputTags'], // No I18N
	keyPress: function (event) {
		var self = this;
		var keyCode = event.which;
		if (keyCode === 13) {
			self.set('isMouseActive', true); //NO I18N
			var text = this.get('inputText').trim();
			if (text) {
				this.send('addTag', event); //NO I18N
				this.set('inputText', ''); //NO I18N
				var customId = this.get('elementId');
				this.set('currentlyInfield', true); //NO I18N
			}
		}
	},
	style: Ember.computed('isRestrictedOpen', function () { //NO I18N
		return this.get('isRestrictedOpen') ? '' : 'display:none';
	}).property('isRestrictedOpen'), //NO I18N
	tagstyle: Ember.computed('visibleTags', function () { //NO I18N
		return this.get('visibleTags').length >= 1 ? '' : 'display:none';
	}),
	inputid: function () {
		var criteria = this.get('criteria') || {};
		return "filterValue" + (criteria.pageId || '') + (criteria.rowNumber || ''); //NO I18N
	}.property('criteria.pageId', 'criteria.rowNumber'),	 //NO I18N
	searchPlaceholderText: function () {
		var key = this.get('searchPlaceholder');
		return key ? Ember.I18n.t(key, this) : Ember.I18n.t('opu.common.SEARCH', this); // NO I18N
	}.property('searchPlaceholder'), //NO I18N
	initialTags: function () {
		var criteria = this.get('criteria') || {};

		if (criteria.filterTextValue !== "" && !Ember.isArray(criteria.filterTextValue)) {
			var filterTextValue = JSON.parse(criteria.filterTextValue);
		}
		return filterTextValue;
	}.property('criteria.filterTextValue'), //NO I18N
	tags: Ember.computed(function () {
		return Ember.A(); // Return a new array for each instance
	}),
	visibleTags: Ember.computed(function () {
		return Ember.A(); // Return a new array for each instance
	}),
	moreTags: Ember.computed(function () {
		return Ember.A(); // Return a new array for each instance
	}),
	tagValues: Ember.computed(function () {
		return Ember.A(); // Return a new array for each instance
	}),
	selectedData: Ember.computed(function () {
		return Ember.A(); // Return a new array for each instance
	}),
	filterTextValueObeservor: function () {
		var criteria = this.get('criteria') || {};
		if ((criteria.filterTextValue == "" && $("#" + this.elementId + " .multiValue_badge").length > 0) || this.get('isdisabled') == true) {
			this.rerender();
		}
}.observes('criteria.filterTextValue'), //NO I18N
	tagsDidChange: function () {
		if (this.get('enableTagProcessing') && this._state === 'inDOM') {
			var hasTags = this.get('tags.length') > 0;
			this.set('currentlyInfield', hasTags); //NO I18N
			this.set('isRestrictedOpen', false); //NO I18N
			Ember.run.scheduleOnce('afterRender', this, this.calculateTagVisibility); //NO I18N
		}
	}.observes('tags.[]'), //NO I18N
	didInsertElement: function () {
		this.set('inputText', ''); //NO I18N
		this._super();
		if (this.dropDownList !== undefined) {
			//set tags and tagValues from criteria list
			var tagValues = this.get('tagValues');
			this.set('tags', Ember.A()); //NO I18N
			this.set('selectedData', Ember.A()); //NO I18N
			if (!Ember.isArray(tagValues)) {

				tagValues = Ember.A(); // initialize if missing
				this.set('tagValues', tagValues);//NO I18N
			}
			//form selected data and tags from tagValues
			var selectedData = this.get('selectedData');
			var tags = this.get('tags');
			//iterate dropDownlist
			var dropDownList = this.dropDownList;
			for (var i = 0; i < dropDownList.length; i++) {
				var tagValue = dropDownList[i].value;
				var tagName = dropDownList[i].displayName;
				//check if tagValue is in tagValues
				if (tagValues.indexOf(tagValue) != -1) {
					//if yes, push tagValue and tagName to selectedData and tags
					selectedData.push(dropDownList[i]);
					this.set('selectedData', selectedData);//NO I18N
					this.get('tags').pushObject(tagName);
					//set checked in DOM for the checkbox
					var checkboxId = 'checkbox_' + tagValue + '_' + this.criteria.index + '_' + this.criteria.pageId;//NO I18N
					$('[id="' + checkboxId + '"]').attr("checked", "checked");
				}
				if (this.get('tags').length > 0) {
					this.set('currentlyInfield', true); //NO I18N
					this.set('isRestrictedOpen', false); //NO I18N
					$('#search_' + this.criteria.index + '_' + this.criteria.pageId).hide();
				}
			}
		} else {
			var tags = this.get('tags');
			if (!Ember.isArray(tags)) {
				tags = Ember.A(); // initialize if missing
				this.set('tags', tags);//NO I18N
			}

			var initialTags = this.get('initialTags') || Ember.A();


			var self = this;
			initialTags.forEach(function (tag) {
				self.get('tags').pushObject(tag);
			});
			//hide the input field if there are tags
			if (this.get('tags').length > 0) {
				this.set('currentlyInfield', true); //NO I18N
				this.set('isRestrictedOpen', false); //NO I18N
				$('#filterValue' + this.criteria.pageId + this.criteria.rowNumber).hide(); //NO I18N
			}
		}
		if (this.get('criteria.columnIdFromList') == '--') {
			this.set('isdisabled', true); //NO I18N
		}
		else {
			this.set('isdisabled', false); //NO I18N
		}
		Ember.run.scheduleOnce('afterRender', this, this.calculateTagVisibility);	 //NO I18N
	},

	willDestroyElement: function () {
		this._super();
		$(window).off('resize.opmTagResize');
	},

	actions: {
		performSearch: function () {
			var searchText = $('#search_' + this.criteria.index + '_' + this.criteria.pageId).val();
			listSearch(searchText, "multiselect-dropdown-list-advRep_" + this.criteria.index + '_' + this.criteria.pageId); //No I18N
			this.updateSelectAllState();
		},
		addTag: function (event) {
			if (event.keyCode === 13) {
				var text = this.get('inputText').trim();
				if (text) {

					if (this.get('tags').length == 0) {
						this.set('tags', Ember.A()); //NO I18N
					}

					var customId = this.get('elementId');
					var inputId = $("#" + customId).find('input')[0].id;

					var isDuplicate;
					if (this.get('caseInsensitiveDuplicates')) {
						if (/[\/\[\]\\:;|=,+*?<>"]/.test(text)) {
							opm_showErrorInField(inputId, Ember.I18n.t('webclient.opm.advancedreport.specchar', { param0: '/[]:;|\\=,+*?<>"' })); //NO I18N
							return;
						}
						var textLower = text.toLowerCase();
						isDuplicate = this.get('tags').any(function(tag) { return tag.toLowerCase() === textLower; });
					} else {
						isDuplicate = this.get('tags').indexOf(text) != -1;
					}
					if (isDuplicate) {
						opm_showErrorInField(inputId, Ember.I18n.t('webclient.input.criteria.invalidinput', { param0: text }));//NO I18N
						return;
					}
					var maxTags = this.get('maxTags'); //NO I18N
					if (maxTags === undefined || maxTags === null) {
						maxTags = 20;
					}
					if (this.get('tags').length > maxTags) {
						var maxTagsEntityKey = this.get('maxTagsEntityKey'); //NO I18N
						var errMsg;
						if (maxTagsEntityKey) {
							var entity = Ember.I18n.t(maxTagsEntityKey);
							errMsg = Ember.I18n.t('webclient.opm.tagInput.maxLimit', { param0: maxTags, param1: entity });//NO I18N
						} else {
							errMsg = Ember.I18n.t('webclient.error.rangeCheck', this) + ":" + maxTags;//NO I18N
						}
						opm_showErrorInField(inputId, errMsg);
						return;
					}
					this.get('tags').pushObject(text);
					this.set('inputText', ''); //NO I18N
					Ember.run.next(this, this.calculateTagVisibility);
				}
			}
		},

		removeTag: function (tagToRemove) {
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			//if this is dropdown list uncheck the checkbox in dropdown
			if (this.dropDownList !== undefined) {
				//iterate selectedData to get value and displayName of the tag
				var index = -1;
				var selectedData = this.get('selectedData');
				for (var i = 0; i < selectedData.length; i++) {
					if (selectedData[i].displayName === tagToRemove) {
						var tagValue = selectedData[i].value;
						index = i;
						this.get('tagValues').removeObject(tagValue);
						var checkboxId = 'checkbox_' + tagValue + '_' + this.criteria.index + '_' + this.criteria.pageId;//NO I18N
						$('[id="' + checkboxId + '"]').removeAttr('checked');
						break;
					}
				}
				selectedData.removeAt(index);
			}
			this.get('tags').removeObject(tagToRemove);
			this.get('visibleTags').removeObject(tagToRemove);
			this.get('moretags').removeObject(tagToRemove);

			this.updateSelectAllState();
			Ember.run.next(this, this.calculateTagVisibility);
		},

		addOrRemoveTagFromDropDown: function (item) {
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			if (this.$('input[type="checkbox"][value="' + item.value + '"]').prop("checked")) { //No I18N
				//if all values are selected, restrict tag addition and show error message
				if (this.get('tags').length == 0) {
					this.set('tags', Ember.A()); //NO I18N
				}
				if (!this.get('allowSelectAll') && this.get('tags').length + 1 >= this.dropDownList.length && this.dropDownList.length!=1) {
					opm_showErrorInField('search_' + this.criteria.index + '_' + this.criteria.pageId, Ember.I18n.t('webclient.filters.alloptionsrestricted', this));//NO I18N
					//uncheck the checkbox
					var checkboxId = 'checkbox_' + item.value + '_' + this.criteria.index + '_' + this.criteria.pageId;//NO I18N
					$('[id="' + checkboxId + '"]').removeAttr('checked');
					return;
				}
				if(!this.get('allowSelectAll') && this.get('tags').length + 1>20) {
					opm_showErrorInField('search_' + this.criteria.index + '_' + this.criteria.pageId, Ember.I18n.t('webclient.error.rangeCheck', this) + ":20");//NO I18N
					//uncheck the checkbox
					var checkboxId = 'checkbox_' + item.value + '_' + this.criteria.index + '_' + this.criteria.pageId;//NO I18N
					$('[id="' + checkboxId + '"]').removeAttr('checked');
					return;
				}
				if (this.get('tagValues').length == 0) {
					this.set('tagValues', Ember.A()); //NO I18N
				}
				this.get('tags').pushObject(item.displayName);
				this.get('tagValues').pushObject(item.value);
				if (this.get('selectedData') === undefined) {
					this.set('selectedData', Ember.A());//NO I18N
				}
				this.get('selectedData').push(item);
			} else {
				var index = -1;
				var totalSelList = this.get('selectedData'); //No I18N
				for (var i = 0; i < totalSelList.length; i++) {
					if (totalSelList[i].value === item.value) {
						index = i;
						break;
					}
				}
				if (index !== -1) {
					this.get("selectedData").removeAt(index); //No I18N
				}
				this.get('tags').removeObject(item.displayName);
				this.get('tagValues').removeObject(item.value);
				this.get('moretags').removeObject(item.displayName);
			}
			this.updateSelectAllState();
			Ember.run.next(this, this.calculateTagVisibility);
		},

		toggleRestrictedTags: function () {
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			this.toggleProperty('isRestrictedOpen'); //NO I18N
			if (this.get('isRestrictedOpen')) {
				this.set('style', ''); //NO I18N
			} else {
				this.set('style', 'display:none'); //NO I18N
			}

		},

		hideRestrictedTags: function () {
			this.set('isRestrictedOpen', false); //NO I18N
			this.set('style', 'display:none'); //NO I18N
		},

		//Only reachable when the opt-in selectAllCheckbox is rendered. Checks/unchecks every row currently matching the
		//in-box search (rows the search hid keep display:none), reusing each row's own change handler.
		toggleSelectAllChildren: function () {
			var allChecked = this.$('#selectAllChk_' + this.criteria.index + '_' + this.criteria.pageId).prop('checked');
			this.$("#multiselect-dropdown-list-advRep_" + this.criteria.index + '_' + this.criteria.pageId + " li").each(function () {
				var li = $(this);
				if (li.css('display') === 'none') {
					return;
				}
				var cb = li.find("input[type='checkbox']");
				if (!cb.length) {
					return;
				}
				var cbId = cb.attr('id') || ''; // No I18N
				if (cbId.indexOf('selectAllChk_') === 0) { 
					return; 
				}
				if (cb.prop('checked') !== allChecked) {
					cb.prop('checked', allChecked).trigger('change'); //No I18N
				}
			});
			this.updateSelectAllState();
		}
	},

	//Syncs the opt-in Select-All checkbox: checked only when every currently-visible row is checked.
	//No-op unless selectAllCheckbox is enabled, so other callers of this component are unaffected.
	updateSelectAllState: function () {
		if (!this.get('selectAllCheckbox')) { 
			return; 
		}
		var total = 0, checkedCount = 0;
		this.$("#multiselect-dropdown-list-advRep_" + this.criteria.index + '_' + this.criteria.pageId + " li").each(function () {
			var li = $(this);
			if (li.css('display') === 'none') { 
				return; 
			}
			var cb = li.find("input[type='checkbox']");
			if (cb.length) { 
				total++; 
				if (cb.prop('checked')) { 
					checkedCount++; 
				} 
			}
		});
		this.$('#selectAllChk_' + this.criteria.index + '_' + this.criteria.pageId).prop('checked', total > 0 && checkedCount === total);
	},

	calculateTagVisibility: function () {
		var self = this;
		var customId = this.get('elementId');
		var tags = this.get('visibleTags');
		// Show input when clicking inside the component
		$('#' + customId).on('mousedown', { self: self }, function (e) {
			e.stopPropagation();
			$('.multi_value_input_container').each(function () {
				var $container = $(this);
				if ($container.find('.multiValue_badge').length > 0) {
					$container.find('input').hide();
				}
			});
			$('.inputTags').removeClass('zindex9999');
			$('.inputTags').removeClass('positionRelative');
			$('#' + customId).addClass('zindex9999');
			$('#' + customId).addClass('positionRelative');
			//
			$('#' + customId).find('input').show();
			setTimeout(function () {
				//toggle dropdown if available
				if (self.dropDownList !== undefined) {
					var searchElement = $('#' + self.criteria.index + '_' + self.criteria.pageId); //No I18N
					if (!searchElement.hasClass('block')) {
						searchElement.addClass('block');
					}
				} else {
					$('#' + customId).find('input').focus();
				}
				self.set('currentlyInfield', true); //NO I18N

			}, 100); // Delay in milliseconds
		});

		// Hide input when clicking outside THIS component
		$(document).on('mousedown.opmTagInputComponent_' + customId, { self: self }, function (e) {
			var $clickedElement = $(e.target);
			var $thisComponent = $('#' + customId);
			// If the clicked element is NOT inside this specific component
			if (!$clickedElement.closest($thisComponent).length) {
				// Hide input of this component only
				$("#" + customId + ' .multi_value_input_container').each(function () {
					self.set('currentlyInfield', false); //NO I18N
					var $container = $(this);
					if ($container.find('.multiValue_badge').length > 0) {
						$container.find('input').hide();
						self.set('isRestrictedOpen', false); //NO I18N
						self.set('style', 'display:none'); //NO I18N
					}
					if (self.dropDownList !== undefined) {
						var searchElement = $('#' + self.criteria.index + '_' + self.criteria.pageId); //No I18N
						if (searchElement.hasClass('block')) {
							searchElement.removeClass('block');
						}
					} else {
					if ($container.find('input').val() != '') {
						var e = jQuery.Event('keydown', { keyCode: 13, which: 13 }); //NO I18N
						self.send('addTag', e); //NO I18N
						$container.find('input').hide();
						self.set('isRestrictedOpen', false); //NO I18N
						self.set('style', 'display:none'); //NO I18N
					}
					}
					$('.validateField').trigger('focusout');
					//remove validateField error class
					$('.validateField').removeAttr('data-error'); //No I18N
					$('.validateField').removeClass('validateField error'); //No I18N
					$('#' + customId).addClass('zindex9999');
					$('#' + customId).addClass('positionRelative');
					$('.inputTags').removeClass('zindex9999');
					$('.inputTags').removeClass('positionRelative');
				});

			}
		});


		var containerEl = this.$('.show_multi_value');
		if (containerEl && containerEl.length > 0) {
			var container = containerEl[0];
			// Now safe to use container
		}
		if (!container) { return; }

		var tags = this.get('tags').slice() || []; // Copy the array
		var visibleTags = [];
		var moretags = [];

		var currentWidth = container.clientWidth;
		var totalWidth = 0;

		this.$('.multiValue_badge').remove();

		// Ensure last tag (most recent) is processed first
		var tagsArray = Array.isArray(tags) ? tags.slice() : []; // shallow copy if valid array, else empty

		tagsArray.reverse().forEach(function (tag, index) {
			var tagEl = $('<div class="multiValue_badge" style="position:absolute;visibility:hidden;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
				'<div class="badge_text">' + escapeHTML(tag) + '</div>' +
				'<div class="badge_close"></div>' +
				'</div>');

			$(container).append(tagEl);
			var tagWidth = tagEl[0].offsetWidth;
			tagEl.remove();

			var allowPush = (totalWidth + tagWidth <= currentWidth - 50) || visibleTags.length === 0;

			if (allowPush) {
				visibleTags.push(tag);
				totalWidth += tagWidth + 4;
			} else {
				moretags.unshift(tag);
			}
		});

		// Restore original order
		this.set('visibleTags', visibleTags.reverse()); //NO I18N
		this.set('moretags', moretags); //NO I18N
	},

	willDestroyElement: function () {
		var customId = this.get('customId');
		$('#' + customId).off('mousedown');
		$(document).off('mousedown.' + customId);
	}
});
OPMClient.ProxmoxChangePrimaryNodeComponent = Ember.Component.extend({
	templateName: "components/proxmox-change-primary-node", //No I18N
	nodes: [],
	credentials: [],
	selectedNode: null,
	selectedCredential: null,
	testCredDone: false,
	didInsertElement: function() {
		var self = this;
		var data = this.get("slideDetails").data;
		var selectedCredential;

		// Fetch nodes
		if (!self.get('nodes') || self.get('nodes').length === 0) {
			var url = window.OPM.apiUrlPattern + "/v2/device/getVirtualEndPointEntities?virtualizationType=Proxmox&parentMOID=" + data.moID; //No I18N
			var resp = opm_ajaxGetResponse(url);
			if (resp && resp.length > 0) {
				self.set('nodes', resp);//No I18N
				var selected = resp.find(function(node) {
					return node.currentlySelected;
				});
				// Set selected node and get selected node's associated credential.
				if (selected) {
					self.set('selectedNode', selected.entityMOName);//No I18N
					var selectedCredential = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/device/getAssociatedCredentials?name='+selected.entityMOName); //No I18N
					if (selectedCredential && selectedCredential.RestAPICredentialName) {
						self.set('selectedCredential', selectedCredential.RestAPICredentialName);//No I18N
					}
				}
				if (selectedCredential && selectedCredential.RestAPICredentialList && selectedCredential.RestAPICredentialList.length > 0) {
					self.set('credentials', selectedCredential.RestAPICredentialList);//No I18N
					if(!selectedCredential.RestAPICredentialList || !selectedCredential.RestAPICredentialList.length){
						$("#proxmox-primary-credential-select").select2({//No I18N
							placeholder: Ember.I18n.t('webclient.inventory.noCredentialAvailable'),//No I18N
							allowClear: true
						});
					}
				}
			}
		}
	},
	actions: {
		savePrimaryNode: function() {
			this.set("testCredDone", false);//No I18N
			var self = this;
			var data = this.get("slideDetails").data;
			var entityMOName = self.get('selectedNode');
			var credentialName = self.get('selectedCredential');
			var fieldsToValidate = {'empty':['proxmox-primary-node-select', 'proxmox-primary-credential-select']}; //No I18N
	    	if(!opm_validateFields(fieldsToValidate)) {
				return;
			}
			var url = window.OPM.apiUrlPattern + "/device/updateDevicePassword";//No I18N
			opm_ajaxPostRequestWithMsg(url, { name: entityMOName, restAPICredName: credentialName, updatedFromProxmoxCluster: true}, Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this), function(resp) { //No I18n
				if(!resp.error) {
					self.send("closePrimaryPage");//No I18N
					if(resp[0] && resp[0][1]) {
						opm_infoMsgs("successMsg", resp[0][1]);//No I18N
					}
				} else {
					showMessage(resp);
				}
			});
		},
		testCredential: function() {
			this.set("testCredDone", false);//No I18N
			var self = this;
			var data = this.get("slideDetails").data;
			var entityMOName = self.get('selectedNode');
			var credentialName = self.get('selectedCredential');
			var fieldsToValidate = {'empty':['proxmox-primary-node-select', 'proxmox-primary-credential-select']}; //No I18N
	    	if(!opm_validateFields(fieldsToValidate)) {
				return;
			}
			var url = window.OPM.apiUrlPattern + "/device/testCredential";//No I18N
			var callBack = function(resp) {
				self.set("inProgress", false);//No I18N
				self.set("testCredDone", true);//No I18N
				Ember.run.schedule("afterRender", function() {//No I18N
					testResponseFunc(resp);
				})
			}
			opm_ajaxPostRequestWithMsg(url, {restAPICredName: credentialName, operation: "snmpCredential", deviceName:  entityMOName, SnmpCredName: "None"}, Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT', this), callBack);//No I18N
			this.set("inProgress", true);//No I18N
		},
		closePrimaryPage: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	}
});

OPMClient.OpmAccessibilityControlsComponent = Ember.Component.extend({
	templateName: "components/opm-accessibility-controls",//No I18N
	didInsertElement: function() {
	},
	actions:{
		updateAC:function(){
			var focusRing = ($("input[id='focusRing']").is(":checked"))?true:false;//No I18N
			var underlineLinks = ($("input[id='underLineLinks']").is(":checked"))?true:false;//No I18N
			var magnifyText = ($("input[id='magnifyText']").is(":checked"))?true:false;//No I18N
			var pageNavigator = ($("input[id='pageNavigator']").is(":checked"))?true:false;//No I18N
			var data = {
				"focusRing":focusRing,//No I18N
				"underlineLinks":underlineLinks,//No I18N
				"magnifyText":magnifyText,//No I18N
				"pageNavigator":pageNavigator//No I18N
			};
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/updateAccessibilityControls?",data);//No I18N
			location.reload();
		}
	}
});

/* ======================== Permission Accordion Component ======================== */
OPMClient.OpmPermissionAccordionComponent = Ember.Component.extend({
	templateName: 'components/opm-Permission-Accordion', //No I18N
	products: null,
	tableHeadings: function() {
		return [
			Ember.I18n.t('webclient.auditreport.modules'), //No I18N
			Ember.I18n.t('webclient.usermgmt.roles.readwrite'), //No I18N
			Ember.I18n.t('webclient.usermgmt.roles.read'), //No I18N
			Ember.I18n.t('webclient.usermgmt.roles.noaccess') //No I18N
		];
	}.property(),
	subTableHeadings: function() {
		return [
			Ember.I18n.t('webclient.usermgmt.roles.subModules'), //No I18N
			Ember.I18n.t('webclient.usermgmt.roles.readwrite'), //No I18N
			Ember.I18n.t('webclient.usermgmt.roles.read'), //No I18N
			Ember.I18n.t('webclient.usermgmt.roles.noaccess') //No I18N
		];
	}.property(),
	didInsertElement: function() {
		var self = this;
		// Only a fully read-only accordion is "locked"; rows the cascade disabled must stay re-enableable.
		var opmCaptureLockedDisabled = function() {
			var $all = self.$('.accessRow :checkbox, .subAccessRow :checkbox'); //No I18N
			if(!$all.length || $all.not(':disabled').length) { //No I18N
				return;
			}
			$all.each(function() {
				if(!$(this).data('opmDynamicDisabled')) { //No I18N
					$(this).data('opmLockedDisabled', true); //No I18N
				}
			});
		};
		var opmSetDisabled = function($checkBoxes, disabled) {
			$checkBoxes.each(function() {
				var $checkBox = $(this);
				if(disabled) {
					if(!$checkBox.data('opmLockedDisabled')) { //No I18N
						$checkBox.data('opmDynamicDisabled', true); //No I18N
					}
					$checkBox.prop("disabled", true); //No I18N
				} else if(!$checkBox.data('opmLockedDisabled')) { //No I18N
					$checkBox.prop("disabled", false).removeData('opmDynamicDisabled'); //No I18N
				}
			});
		};
		opmCaptureLockedDisabled();
		// Accordion Event Handler
		this.$('.accordion1__nav').on('click', function() { //No I18N
			if($(this).hasClass('active')) { //No I18N
				$(this).removeClass('active'); //No I18N
				$(this).siblings('.accordion1__cont').hide(); //No I18N
			} else {
				$(this).addClass('active'); //No I18N
				$(this).siblings('.accordion1__cont').show(); //No I18N
			}
		});
		// Checkbox cascade logic
		this.$('.accessRow :checkbox').on('click', function(e) { //No I18N
			var checkBoxes = $(this).closest('.accessRow').find(':checkbox'); //No I18N
			var subCheckBoxes = $(this).closest('.accessRow').next().find('.subAccessRow').find(':checkbox'); //No I18N
			// type=2 children have no Read tier, so parent Read skips them; Write/No Access cascade as usual.
			var readWriteSubCheckBoxes = subCheckBoxes.filter(function() {
				return $(this).closest('.subAccessRow').find('[name="fullAccess"]').length === 0; //No I18N
			});
			if(subCheckBoxes.length) {
				$(this).closest('.accessRow').hasClass('active') ? '' : $(this).closest('.accessRow').addClass('active'); //No I18N
			}
			if($(this).attr('name') === 'read') { //No I18N
				if(!this.checked) {
					// the noAccess click below cascades every child row to No Access
					checkBoxes.filter('[name="write"]:checked').trigger('click'); //No I18N
					checkBoxes.filter('[name="noAccess"]:not(:checked)').trigger('click'); //No I18N
				} else {
					checkBoxes.filter('[name="noAccess"]:checked').trigger('click'); //No I18N
					readWriteSubCheckBoxes.not('[name="read"]').prop("checked", false).trigger('change'); //No I18N
					readWriteSubCheckBoxes.filter('[name="read"]').prop("checked", true).trigger('change'); //No I18N
				}
			} else if($(this).attr('name') === 'write') { //No I18N
				if(this.checked) {
					checkBoxes.filter('[name="read"]:not(:checked)').trigger('click'); //No I18N
					subCheckBoxes.not('[name="noAccess"]').prop("checked", true).trigger('change'); //No I18N
					subCheckBoxes.filter('[name="noAccess"]').prop("checked", false).trigger('change'); //No I18N
				} else {
					var writeLevelSubCheckBoxes = subCheckBoxes.filter('[name="write"], [name="fullAccess"]').filter(":checked"); //No I18N
					writeLevelSubCheckBoxes.prop("checked", false).trigger('change'); //No I18N
					subCheckBoxes.filter('[name="fullAccess"]').closest('.subAccessRow').each(function() { //No I18N
						$(this).find('[name="noAccess"]').prop("checked", true).trigger('change'); //No I18N
					});
				}
			} else if($(this).attr('name') == 'noAccess') { //No I18N
				if(this.checked) {
					checkBoxes.not('[name="noAccess"]').filter(':checked').trigger('click'); //No I18N
					subCheckBoxes.not('[name="noAccess"]').prop("checked", false).trigger('change'); //No I18N
					subCheckBoxes.filter('[name="noAccess"]').prop("checked", true).trigger('change'); //No I18N
				} else {
					// the read click below cascades type=1 children to Read
					checkBoxes.filter('[name="read"]:not(:checked)').trigger('click'); //No I18N
				}
			}
			// Re-derive the row-level Read locks after every parent click, whichever branch ran.
			opmNormalizeReadLock();
		});
		// Parent reflects its children: Write if any child is Write, else Read if any is Read, else No Access.
		var opmSyncParentFromChildren = function($childTableRow) {
			var parentCheckBoxes = $childTableRow.prev('.accessRow').find(':checkbox'); //No I18N
			var $subCheckBoxes = $childTableRow.find('.subAccessRow').find(':checkbox'); //No I18N
			// type=2 sub modules cover the WHOLE module, so the parent is derived from them - Full Access
			// promotes the parent to Read/Write (D29). Unchanged.
			var hasFullAccessChild = $subCheckBoxes.filter('[name="fullAccess"]').length > 0; //No I18N
			if(hasFullAccessChild) {
				var anyWrite = $subCheckBoxes.filter('[name="fullAccess"]').is(':checked'); //No I18N
				var anyRead = anyWrite || $subCheckBoxes.filter('[name="read"]').is(':checked'); //No I18N
				parentCheckBoxes.filter('[name="write"]').prop("checked", anyWrite).trigger('change'); //No I18N
				parentCheckBoxes.filter('[name="read"]').prop("checked", anyRead).trigger('change'); //No I18N
				parentCheckBoxes.filter('[name="noAccess"]').prop("checked", !anyRead).trigger('change'); //No I18N
			} else {
				// type=1: any selected sub module implies parent Read, and a sub module Write never forces
				// parent Write. Parent Read is only set here, never cleared - the parent covers more than
				// these children (credentials, device templates, exclude criteria).
				var anySubSelected = $subCheckBoxes.filter('[name="read"], [name="write"]').is(':checked'); //No I18N
				if(anySubSelected) {
					parentCheckBoxes.filter('[name="noAccess"]').prop("checked", false).trigger('change'); //No I18N
					parentCheckBoxes.filter('[name="read"]').prop("checked", true).trigger('change'); //No I18N
				}
			}
			opmNormalizeReadLock();
		};
		// Sub module Read/Write/No Access are mutually exclusive within their own row; the trailing sync re-derives the Write-implies-Read lock.
		this.$('.subAccessRow :checkbox').on('click', function(e) { //No I18N
			var rowCheckBoxes = $(this).closest('.subAccessRow').find(':checkbox'); //No I18N
			var name = $(this).attr('name'); //No I18N
			var isFullAccessType = rowCheckBoxes.filter('[name="fullAccess"]').length > 0; //No I18N
			if(name === 'read') { //No I18N
				if(this.checked) {
					rowCheckBoxes.filter('[name="noAccess"]').prop("checked", false).trigger('change'); //NO I18N
				} else if(!rowCheckBoxes.filter('[name="write"]').is(':checked')) { //NO I18N
					rowCheckBoxes.filter('[name="noAccess"]').prop("checked", true).trigger('change'); //NO I18N
				}
			} else if(name === 'write' || name === 'fullAccess') { //No I18N
				if(this.checked) {
					rowCheckBoxes.filter('[name="noAccess"]').prop("checked", false).trigger('change'); //NO I18N
				} else {
					if(isFullAccessType) {
						// clear before the parent sync below reads the row's checked state
						rowCheckBoxes.filter('[name="read"]').prop("checked", false).trigger('change'); //No I18N
					}
					if(!rowCheckBoxes.filter('[name="read"]').is(':checked')) { //NO I18N
						rowCheckBoxes.filter('[name="noAccess"]').prop("checked", true).trigger('change'); //No I18N
					}
				}
			} else if(name === 'noAccess') { //No I18N
				if(this.checked) {
					rowCheckBoxes.not('[name="noAccess"]').prop("checked", false).trigger('change'); //No I18N
				} else if(isFullAccessType) {
					rowCheckBoxes.filter('[name="fullAccess"]').prop("checked", true).trigger('change'); //No I18N
				} else if(!isFullAccessType) {
					rowCheckBoxes.filter('[name="read"]').prop("checked", true).trigger('change'); //No I18N
				}
			}
			opmSyncParentFromChildren($(this).closest('.child-table')); //No I18N
		});
		// Saved-role data bypasses the click handlers: re-apply Write implies Read when the data lands. type=2 rows have no Read tier, so Read stays disabled and mirrors Full Access.
		var opmNormalizeReadLock = function() {
			self.$('.accessRow, .subAccessRow').each(function() { //No I18N
				var rowCheckBoxes = $(this).find(':checkbox'); //No I18N
				var isWriteLevel = rowCheckBoxes.filter('[name="write"], [name="fullAccess"]').is(':checked'); //No I18N
				var isFullAccessType = rowCheckBoxes.filter('[name="fullAccess"]').length > 0; //No I18N
				var parentRead = true; // parent rows are not gated by anything above them
				if($(this).hasClass('subAccessRow')) { //No I18N
					// Parent Read is the minimum for a sub module to be selectable. For type=1 that gates the
					// WHOLE row (Read included); type=2 keeps the original Full-Access-cell-only gate.
					parentRead = $(this).closest('.child-table').prev('.accessRow').find('[name="read"]').is(':checked'); //No I18N
					var $selectableCells = isFullAccessType ? rowCheckBoxes.filter('[name="fullAccess"]') : rowCheckBoxes.filter('[name="read"], [name="write"]'); //No I18N
					opmSetDisabled(isFullAccessType ? $selectableCells : rowCheckBoxes, !parentRead);
					if(!parentRead && $selectableCells.is(':checked')) { //No I18N
						$selectableCells.prop("checked", false).trigger('change'); //No I18N
						rowCheckBoxes.filter('[name="noAccess"]').prop("checked", true).trigger('change'); //No I18N
						isWriteLevel = false;
					}
				}
				opmSetDisabled(rowCheckBoxes.filter('[name="read"]'), isFullAccessType || isWriteLevel || !parentRead); //No I18N
				if(isWriteLevel) {
					rowCheckBoxes.filter('[name="read"]').prop("checked", true).trigger('change'); //No I18N
				} else if(isFullAccessType) {
					rowCheckBoxes.filter('[name="read"]').prop("checked", false).trigger('change'); //No I18N
				}
			});
		};
		this._opmCaptureLockedDisabled = opmCaptureLockedDisabled;
		this._opmNormalizeReadLock = opmNormalizeReadLock;
		opmNormalizeReadLock();
	},
	productsChanged: function() {
		var self = this;
		Ember.run.scheduleOnce('afterRender', this, function() { //No I18N
			if(self._opmCaptureLockedDisabled) {
				self._opmCaptureLockedDisabled();
			}
			if(self._opmNormalizeReadLock) {
				self._opmNormalizeReadLock();
			}
		});
	}.observes('products'), //No I18N
	actions: {
		toggleSubModule: function(module) {
			var $row = this.$('#' + module.moduleRowId); //No I18N
			$row.toggleClass('active'); //No I18N
			if($row.hasClass('active')) { //No I18N
				this._opmNormalizeReadLock();
			}
		}
	},
	willDestroyElement: function() {
		this.$('.accordion1__nav').off('click'); //No I18N
		this.$('.accessRow :checkbox').off('click'); //No I18N
		this.$('.subAccessRow :checkbox').off('click'); //No I18N
	}
});

OPMClient.SelectWithCheckBoxComponent = Ember.Component.extend({
	templateName: "components/select-with-check-box", //No I18N
	isDropdownOpen: false,
	closeDropdownOnClickOutside: function(e) {
		if(!e.target.closest('.credentialBox.select-with-check-box') && this.isDropdownOpen) { //No I18N
			this.send('toggleDropdown'); //NO I18N
		}
	},
	actions: {
		toggleDropdown: function() {
			if(this.element) {
				$(this.element).find('.select-with-check-box').removeClass('validateField');
				$(this.element).find('.select-with-check-box').removeClass('error');
				$(this.element).find('.select-with-check-box').removeAttr('data-error');
				$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
	
				this.toggleProperty('isDropdownOpen'); //NO I18N
				if(this.isDropdownOpen) {
					$(document).on('click.select-with-checkbox', this.closeDropdownOnClickOutside.bind(this));
				} else {
					$(document).off('click.select-with-checkbox');
				}
			} else {
				$(document).off('click.select-with-checkbox');
			}
		},
		change: function(option) {
			var hasSelected = this.selected.find(function(item) { 
				return item.value === option.value; 
			});
			if (hasSelected) {
				this.selected.removeObject(hasSelected);
			} else {
				this.selected.pushObject(option);
			}

			if(this.onChange) {
				this.sendAction('onChange') // No I18N
			}
		}
	},
	selectedObserver:function(){
		var self = this;
		
		Ember.run.schedule("afterRender", function() {//No I18N
			if(self.selected) {
				self.selected.forEach(function(item) {
					self.element.querySelector('input[value="' + item.value + '"]').checked = true; //NO I18N
				});
			}
		})
	}.observes('selected') //No I18N
});

OPMClient.AddDataIngestionMonitorComponent = Ember.Component.extend({
	templateName: "components/add-data-ingestion-monitor",//No I18N
	pageId: 'dataIngestionMonitor',//No I18N
	numericTypes: [{value: '1', label: Ember.I18n.t('webclient.opm.monitortype.integer')}, {value: '3', label: Ember.I18n.t('webclient.opm.monitortype.decimal')}],//No I18N
	didInsertElement: function(){
		var self = this;
		var pageName = this.get('pageName');//No I18N
		self.setProperties({
			monitorName: '',//No I18N
			monitorDescription: '',//No I18N
			instanceDataEnabled:false,
			monitorUnits: '',//No I18N
			isNumericMonitor: true,
			numericType: '1',// No I18N
			perfGrpData: {PERFGROUPNAME: Ember.I18n.t('webclient.admin.devices.None'), PERFGROUPID: '0'},//No I18N

			// Accordion Vaiable
			isCustomFieldsEnabled:false,
			customFieldValue: null,
			isLookupEnabled: false,
			lookupArray: [],
			lookupDefaultValues: [],
			isNumericMonitorType: true,

			// Threshold related properties
			isThresholdEnabled: false,
			graphValues: Ember.Object.create({isAtEnabled: false}),
			consecutiveTimeDisabled: false
		});

		//Initialize threshold and rearm types
		self.setProperties({
			thresholdTypes: OPMClient.SettingsDeviceTemplateController.defaults.thresholdTypes,
			rearmTypes: OPMClient.SettingsDeviceTemplateController.defaults.rearmTypes
		});

		//initializing Vendor List
		var vendorList = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/device/getVendorList");//No I18N
		if(vendorList !== undefined && vendorList[0] !== undefined){
			this.set("snmpVendorList",vendorList);//No I18N
			$('#addDataIngestion_vendorList').select2({data:vendorList});
		}

		var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listAdditionalFields?type=CustFieldToGraph"); //No I18N
		this.set('customFieldslist',list) // No I18N

		this.setThresholdMessages();
	},
	setThresholdMessages: function() {
		var DEFAULT_ERROR_MSG = Ember.I18n.t('webclient.dt.alarmmessage.node'); //No I18N
		var DEFAULT_REARM_MSG = Ember.I18n.t('webclient.dt.alarmmessage.clear'); //No I18N
		var UPPER_LIMIT_MSG = Ember.I18n.t('webclient.opm.at.maxlimit.msg'); // NO I18N

		var isMultipleInstance = $("#data-ingestion-is-instance-data").is(":checked");//No I18N
		if(isMultipleInstance) {
			DEFAULT_ERROR_MSG = Ember.I18n.t('webclient.opm.perfgroup.threshold.defaultMultiNodeMsg'); //No I18N
			DEFAULT_REARM_MSG = Ember.I18n.t('webclient.opm.perfgroup.threshold.defaultMultiNodeClrMsg'); //No I18N
		}

		var isATEnabled = $("#dataIngestionEnableAT").is(":checked");//No I18N

		if(isATEnabled) {
			DEFAULT_ERROR_MSG = Ember.I18n.t('webclient.alarmmessage.atthreshold.utilalarmmsg.at'); //No I18N
		}

		if(isATEnabled && isMultipleInstance) {
			DEFAULT_ERROR_MSG = Ember.I18n.t('webclient.alarmmessage.atthreshold.instance.utilalarmmsg'); //No I18N
		}

		$("#dataIngestionMonitorTab #snmpWarnMsg, #dataIngestionMonitorTab #snmpTroubleMsg, #dataIngestionMonitorTab #snmpErrorMsg").val(DEFAULT_ERROR_MSG);//No I18N
		$("#dataIngestionMonitorTab #snmpRearmMsg").val(DEFAULT_REARM_MSG);//No I18N

		return {
			DEFAULT_ERROR_MSG: DEFAULT_ERROR_MSG,
			DEFAULT_REARM_MSG: DEFAULT_REARM_MSG,
			UPPER_LIMIT_MSG: UPPER_LIMIT_MSG
		}
	},
	actions: {
		setThresholdMessages: function() {
			this.setThresholdMessages();
		},
		onDataTypeChange: function(){
			var self = this;
			var dataType = $("input[name='data-ingestion-data-type']:checked").val();//No I18N
			var isNumeric = (dataType === "numeric");//No I18N
			this.setProperties({isNumericMonitor: isNumeric, isNumericMonitorType:isNumeric, isLookupEnabled:false});
			
			if(isNumeric){
				self.setProperties({
					thresholdTypes: OPMClient.SettingsDeviceTemplateController.defaults.thresholdTypes,
					rearmTypes: OPMClient.SettingsDeviceTemplateController.defaults.rearmTypes
				});
				$("#dataIngestionMonitorTab .opmFormHrLine.nonATTag").show(); // No I18N
				$("#dataIngestionEnableAT").closest(".opmFormRow").show();//No I18N
				$("#dataIngestionMonitorTab #snmpRearmType").prop("disabled", true);//No I18N
				
			} else {
				self.setProperties({
					thresholdTypes: OPMClient.SettingsDeviceTemplateController.defaults.thresholdTextualTypes,
					rearmTypes: OPMClient.SettingsDeviceTemplateController.defaults.rearmTextualTypes
				});
				$("#dataIngestionMonitorTab .opmFormHrLine.nonATTag").hide(); // No I18N
				$("#dataIngestionEnableAT").closest(".opmFormRow").hide();//No I18N
				$("#dataIngestionMonitorTab #snmpRearmType").prop("disabled", false);//No I18N
				$("#dataIngestionEnableAT").prop("checked", false);//No I18N
				$("#dataIngestionMonitorDeviationDiv").hide();//No I18N
			}
			this.setThresholdMessages()

			Ember.run.scheduleOnce('afterRender', function(){//No I18N
				if(isNumeric) {
					$('#data-ingestion-numeric-type').select2();//No I18N
				}
			});
		},
		enableCustomFieldDrpDown: function(){
			if($("#dataIngestionCustomField_drpdwn").hasClass('active') && !$('#dataIngestion_CF_Search').is(':focus')){//No I18N
				$("#dataIngestionCustomField_drpdwn").removeClass('active');//No I18N
			} else {
				$("#dataIngestionCustomField_drpdwn").addClass('active');//No I18N
				$('#dataIngestionCustomField_DropDownBox').show();//No I18N
				if($("#dataIngestionCustomField_drpdwn").attr('data-error') !== undefined){
					$("#dataIngestionCustomField_drpdwn").removeAttr('data-error');//No I18N
					$('.OpMToolBar').hide();//No I18N
				}
			}
		},
		selectCustomField: function(field){
			this.set("customFieldValue", field);//No I18N
		},
		toggleNewVendorDiv: function(state){
			if(state){
				$("#dataIngestion_newVendorRow").show();//No I18N
				$("#dataIngestion_vendorNewName").val('');//No I18n
				$("#dataIngestion_vendorComboRow").hide();//No I18N
			}else{
				$("#dataIngestion_newVendorRow").hide();//No I18N
				$("#dataIngestion_vendorComboRow").show();//No I18N
			}
		},
		addNewVendor: function(){
			var vendorName = $("#dataIngestion_vendorNewName").val();
			if(opm_validateFields({empty:['dataIngestion_vendorNewName'],custom:[{condition:!opm_isValidVendorName(vendorName),identifier:'dataIngestion_vendorNewName',message:Ember.I18n.t('webclient.devices.devprop.status.spechar')}]})){
				this.get('snmpVendorList').pushObject(vendorName);
				this.set("selectedVendor",vendorName);//No I18N
				$('#addDataIngestion_vendorList').select2({data:this.get('snmpVendorList')});
				$('#addDataIngestion_vendorList').val(vendorName).select2(); //No I18N
				this.send("toggleNewVendorDiv",false);//No I18N
			}
		},
		addNewCustomField: function(){
			var self = this;
			var slideDetails = {};
			slideDetails.id = "DataIngestionMonitor_CustomField";//No I18N
			slideDetails.componentName = "OPMClient.OpmCustomMonitorCustomFieldComponent";//No I18N
			slideDetails.slideHeader = Ember.I18n.t('webclient.add.fielld');//No I18N
			slideDetails.isSmall = true;
			slideDetails.actionName = "customField_cancelAction";//No I18N
			slideDetails.parentObj = self;
			self.set("slideDetails", slideDetails);//No I18N
			slideInWithId('DataIngestionMonitor_CustomField');//No I18N
		},
		addCustomField: function() 
		{
			// console.log("add custom field");
			var customFieldAdded = opm_additionalFields("Device","fromCustomMonitor"); //No I18N
			if(customFieldAdded) 
			{
				var list = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/listAdditionalFields?type=CustFieldToGraph"); //No I18N
				this.set('customFieldslist',list); //No I18n
				this.send('customField_cancelAction'); //No I18n
				this.send('selectCustomField',list[list.length-1]); //No I18n
			}
		},
		customField_cancelAction: function() {
			var self = this;
			slideOutWithId('DataIngestionMonitor_CustomField'); //No I18n
			self.set("slideDetails",undefined);//No I18N
		},
		cancelAddDataIngestion: function(){
			opm_transitionToParentRoute("Settings.Monitors.SubMonitors");//No I18N
		},
		saveDataIngestionMonitor: function(){
			var self = this;
			var monitorName = this.get('monitorName').trim();//No I18N
			var monitorDescription = this.get('monitorDescription');//No I18N
			var dataType = $("input[name='data-ingestion-data-type']:checked").val();//No I18N
			var isNumeric = (dataType === "numeric");//No I18N
			var isStringDataType = (dataType === "string");//No I18N
			var vendorName = $("#addDataIngestion_vendorList").val();//No I18N
			var units = self.get('monitorUnits');//No I18N
			var isInstanceData = self.get('instanceDataEnabled');//No I18N
			var type = isInstanceData ? 'multiple' : 'node';//No I18N
			var numericType = self.get('numericType');//No I18N

			var graphID = 'custGraph_' + monitorName;//No I18N
			// Custom Fields
			var isCustomFieldsEnabled = self.get("isCustomFieldsEnabled");//No I18N
			var customFieldValue = self.get("customFieldValue");//No I18N

			// Device Mapping Fields
			var isLookupEnabled = self.get("isLookupEnabled");//No I18N

			// threshold Fields
			var isThresholdEnabled = self.get('isThresholdEnabled');
			var is_at_enabled = $("#dataIngestionEnableAT").is(":checked");//No I18N

			// Threshold Fields
			var thresholdPrefix = "dataIngestionMonitorTab "; // No I18N
			
			// Validation
			var fieldsToValidate = {empty: ['data-ingestion-monitor-name'], 'profName': ['data-ingestion-monitor-name'], maxCheck:{}};//No I18N

			if(isThresholdEnabled) {
				fieldsToValidate.maxCheck[thresholdPrefix + '#snmpWarnMsg'] = 250; //No I18N
				fieldsToValidate.maxCheck[thresholdPrefix + '#snmpTroubleMsg'] = 250; //No I18N
				fieldsToValidate.maxCheck[thresholdPrefix + '#snmpErrorMsg'] = 250; //No I18N
				fieldsToValidate.maxCheck[thresholdPrefix + '#snmpRearmMsg'] = 250; //No I18N
			}

			if(isNumeric){
				fieldsToValidate.empty.push('data-ingestion-units');//No I18N
				fieldsToValidate.empty.push('data-ingestion-numeric-type');//No I18N
			}
			
			if(!opm_validateFields(fieldsToValidate)){
				return;
			}

			OPMClient.SettingsDeviceTemplateController.set('isCheckNumeric', isNumeric); //No I18N 

			var warningType=$("#" + thresholdPrefix + "#snmpWarnType").val();
            var troubleType=$("#" + thresholdPrefix + "#snmpTroubleType").val();
            var criticalType=$("#" + thresholdPrefix + "#snmpErrorType").val();
            var warningVal=$("#" + thresholdPrefix + "#snmpWarnValue").val();
            var troubleVal= $("#" + thresholdPrefix + "#snmpTroubleValue").val();
            var criticalVal=$("#" + thresholdPrefix + "#snmpErrorValue").val();
            var warningMsg= $("#" + thresholdPrefix + "#snmpWarnMsg").val();
            var troubleMsg=$("#" + thresholdPrefix + "#snmpTroubleMsg").val();
            var criticalMsg=$("#" + thresholdPrefix + "#snmpErrorMsg").val();
            var rearmType=$("#" + thresholdPrefix + "#snmpRearmType").val();
            var rearmVal=$("#" + thresholdPrefix + "#snmpRearmValue").val();
            var rearmMsg=$("#" + thresholdPrefix + "#snmpRearmMsg").val();
            var failureThreshold = $("#" + thresholdPrefix + "#snmpConTime").val();
			var isMultipleThreshold = false;

			// Validate Threshold Configuration
			if(isThresholdEnabled){
				// Validate consecutive times field
				if(isNumeric)
				{
						updatePerfMonErrorObj = {};
						if (numericType !== undefined && numericType === "3") {
							if(warningType !== undefined && warningType === "equal" && (warningVal.indexOf("|") > -1 || troubleVal.indexOf("|") > -1 || criticalVal.indexOf("|") > -1 || rearmVal.indexOf("|") > -1))
							{
								if(!opm_validateMultiThreshold_Float_Equal(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue')){
									return showThresholdValidationMsg(updatePerfMonErrorObj);
								}
								isMultipleThreshold = true;
							}else{
								if (!opm_doesThresholdConfigured(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue') || !opm_validateMonitorThreshold_Float(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue', thresholdPrefix + '#snmpWarnType')) {
									$.each(updatePerfMonErrorObj, function (field, msg) {
										$("#" + field).addClass('validateField error');//No I18N
										$("#" + field).attr('data-error', msg);//No I18N
										opmValidateTooltipDefine();
										opmValidate($("#" + field));//No I18N
									});
									return;
								}
							}
						}
						else {
							if(warningType !== undefined && warningType === "equal" && (warningVal.indexOf("|") > -1 || troubleVal.indexOf("|") > -1 || criticalVal.indexOf("|") > -1 || rearmVal.indexOf("|") > -1))
							{
								if(!opm_validateMultiThreshold_Equal(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue')){
									return showThresholdValidationMsg(updatePerfMonErrorObj);
								}
								isMultipleThreshold = true;
							}else{
								if (!opm_doesThresholdConfigured(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue') || !opm_validateMonitorThreshold(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue', thresholdPrefix + '#snmpWarnType')) {
									$.each(updatePerfMonErrorObj, function (field, msg) {
										$("#" + field).addClass('validateField error');//No I18N
										$("#" + field).attr('data-error', msg);//No I18N
										opmValidateTooltipDefine();
										opmValidate($("#" + field));//No I18N
									});
									return;
								}
							}
						}
					if(is_at_enabled) {
						if(numericType==="3" || numericType===3)
						{
							if($("#" + thresholdPrefix + '#snmpWarnValue').val()!==""){if(!opm_validateFields({'validIntegerorDecimal':[thresholdPrefix + '#snmpWarnValue']})){return false;}}//No I18N
							if($("#" + thresholdPrefix + '#snmpTroubleValue').val()!==""){if(!opm_validateFields({'validIntegerorDecimal':[thresholdPrefix + '#snmpTroubleValue']})){return false;}}//No I18N
							if($("#" + thresholdPrefix + '#snmpErrorValue').val()!==""){if(!opm_validateFields({'validIntegerorDecimal':[thresholdPrefix + '#snmpErrorValue']})){return false;}}//No I18N
							if(!opm_validateFields({'validIntegerorDecimal':[thresholdPrefix + '#snmpRearmValue']})){return false;}//No I18N
						}else{
							if($("#" + thresholdPrefix + '#snmpWarnValue').val()!==""){if(!opm_validateFields({'validInteger':[thresholdPrefix + '#snmpWarnValue']})){return false;}}//No I18N
							if($("#" + thresholdPrefix + '#snmpTroubleValue').val()!==""){if(!opm_validateFields({'validInteger':[thresholdPrefix + '#snmpTroubleValue']})){return false;}}//No I18N
							if($("#" + thresholdPrefix + '#snmpErrorValue').val()!==""){if(!opm_validateFields({'validInteger':[thresholdPrefix + '#snmpErrorValue']})){return false;}}//No I18N
							if(!opm_validateFields({'validInteger':[thresholdPrefix + '#snmpRearmValue']})){return false;}//No I18N
								}
						if($("#" + thresholdPrefix + '#snmpWarnValue').val() ==="" && $("#" + thresholdPrefix + '#snmpTroubleValue').val()==="" && $("#" + thresholdPrefix + '#snmpErrorValue').val()===""){//No I18N

							$("#" + thresholdPrefix + "#snmpWarnValue").addClass('validateField error');//No I18N
							$("#" + thresholdPrefix + "#snmpWarnValue").attr('data-error',Ember.I18n.t("webclient.devices.snapshot.editprocessmonitor.enterthres",this));//No I18N
							$("#" + thresholdPrefix + "#snmpWarnValue").focus();
							opmValidate($("#" + thresholdPrefix + "#snmpWarnValue"));
							return false;
						}
						if(!checkATLimitValuesWithPrefix(numericType==="3" || numericType===3, thresholdPrefix)){
								return false;
							}
						if(!checkATLimitRangeValuesWithPrefix(thresholdPrefix)){
								return false;
						}
					} 
				}
				else
				{
					if (!is_at_enabled) {
						updatePerfMonErrorObj={};
						// OPMClient.SettingsDeviceTemplateController.isCheckNumeric = false;
						if(!opm_doesThresholdConfigured(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue') || !opm_validateMonitorThreshold(thresholdPrefix + '#snmpWarnValue', thresholdPrefix + '#snmpTroubleValue', thresholdPrefix + '#snmpErrorValue', thresholdPrefix + '#snmpRearmValue', thresholdPrefix + '#snmpWarnType'))
							{
								$.each(updatePerfMonErrorObj,function(field,msg)
								{
									$("#"+field).addClass('validateField error');//No I18N
									$("#"+field).attr('data-error',msg);//No I18N
										opmValidateTooltipDefine();
										opmValidate($("#"+field));//No I18N
								});
								return
							}
					}
					
				}
			}

 			if(failureThreshold === undefined || failureThreshold === "")
			{
				$("#" + thresholdPrefix + "#snmpConTime").addClass('validateField error');//No I18N
		        $("#" + thresholdPrefix + "#snmpConTime").attr('data-error',Ember.I18n.t('webclient.this.field.cannotempty',this));//No I18N
		        $("#" + thresholdPrefix + "#snmpConTime").focus();
		        opmValidate($("#" + thresholdPrefix + "#snmpConTime"));
		        return false;
			}
			else if(self.get('isLookupEnabled') && !validateLookupArray(self,true)){
				return false;
			}

			// Check duplicate monitor name
			var isMonitorNameExists = false;
			var isMonitor = opm_ajaxGetRequest(window.OPM.apiUrlPattern + '/admin/checkGraphName?graphName=' + encodeURIComponent(monitorName));//No I18N
			if(isMonitor !== undefined && isMonitor.data !== undefined && isMonitor.data.message !== undefined && isMonitor.data.message !== "false" && isMonitor.data.message !== false){//No I18N
				isMonitorNameExists = true;
			}
			if(isMonitorNameExists){
				$('#data-ingestion-monitor-name').addClass('validateField error');//No I18N
				$('#data-ingestion-monitor-name').attr('data-error', Ember.I18n.t("webclient.dt.monitor.alreadyexists"));//No I18N
				$('#data-ingestion-monitor-name').focus();//No I18N
				opmValidate($('#data-ingestion-monitor-name'));//No I18N
				return;
			}

			// Submit
			// Build data object
			var dataObject = {};
			dataObject.graphName = monitorName;
			dataObject.type = type;
			dataObject.graphDescription = monitorDescription;
			dataObject.isNumeric = isNumeric;
			if(isNumeric){
				dataObject.units = units;
				dataObject.numericType = numericType;
			} else {
				dataObject.numericType = '2';
			}
			dataObject.id = graphID;
			dataObject.GRAPHID = graphID;

			if(isThresholdEnabled){
				// Read threshold values from DOM elements (set by opm-adaptivethreshold component)
				dataObject.warningType = warningType;
				dataObject.troubleType = troubleType;
				dataObject.criticalType = criticalType;
				dataObject.rearmType = rearmType;
				dataObject.warningVal = warningVal;
				dataObject.troubleVal = troubleVal;
				dataObject.criticalVal = criticalVal;
				dataObject.rearmVal = rearmVal;
				dataObject.warningMsg = warningMsg;
				dataObject.troubleMsg = troubleMsg;
				dataObject.criticalMsg = criticalMsg;
				dataObject.rearmMsg = rearmMsg;
				dataObject.failureThreshold = failureThreshold;
				dataObject.isMultipleThreshold = isMultipleThreshold || false;
				if(is_at_enabled){
					dataObject.isAdaptiveThresholdsEnabled = is_at_enabled;
					dataObject.deviationType = $("#" + thresholdPrefix + "input[name='perfGrpDataType']:checked").val() || "2";//No I18N
					dataObject.lowerlimitType = $("#" + thresholdPrefix + '#lowerLimitType').val();//No I18N
					dataObject.lowerlimitVal = $("#" + thresholdPrefix + '#lowerLimitValue').val();//No I18N
					dataObject.upperlimitType = $("#" + thresholdPrefix + '#upperLimitType').val();//No I18N
					dataObject.upperlimitVal = $("#" + thresholdPrefix + '#upperLimitValue').val();//No I18N
					dataObject.upperlimitMsg = $("#" + thresholdPrefix + '#upperLimitMsg').val();//No I18N
					dataObject.upperlimitSeverity = window.OPM.atUpperLimitSeverity;
				}
			}

			var data = {};

			// Add vendorName information if vendorMonitor page
			if(vendorName){
				data.vendorName = vendorName;
			}

			// Add Lookup Data
			if(isLookupEnabled){
				addLookupData(dataObject, self, false);
			}

			// Add Custom Field ID
			if(isCustomFieldsEnabled && customFieldValue){
				dataObject.custFieldId = customFieldValue.customFieldId;
			}
			addPerfGroupToParamsObject(dataObject, 'addDataIngestion', '0');//No I18N

			data.graphObj = JSON.stringify({dataArray: [dataObject]});

			var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/admin/addDataIngestionMonitor', data);//No I18N
			showMessage(response);
			if(response !== undefined && response.result !== undefined && response.result.message !== undefined){
				slideOut(7);
				opm_transitionToParentRoute('Settings.Monitors.SubMonitors', OPMClient.SettingsTabController.monitorName);//No I18N
				$('#perfMonitors_type').select2().val('customMonitors').trigger('change');//No I18N
			}
		}
	}
});
