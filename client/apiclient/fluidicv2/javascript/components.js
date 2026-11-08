// Maintained by Client Stability Team
var OpmSnapwidgetComponentArray = [];
var OpmSnapExpandWiget = null;
var mcustomScrollTimer = null;
var snapHeightCalculation = [0,18,40,62,84,106,128,150,172,194,216,238,260,282,304,326,348,370,392,414,436,458,480,502,524,546,568,590,612,634,656];
OPMClient.OpmSnapwidgetComponent = Ember.Component.extend({
	classNames:['overflowHidden'],//No I18N
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		if(currentWidgetData.name === 'ipam.port.summary' || currentWidgetData.name === 'ipam.ip.summary'){
			$('#'+this.elementId).removeClass('overflowHidden');
			this.set('widgetData.gridClassName','grid-stack-item overflow-visible'); //No I18N
		}
		if((currentWidgetData.name==="opu.ipam.dhcp.macfilter" || currentWidgetData.name==="opu.ipam.dhcp.policy" || currentWidgetData.name==="opu.ipam.dhcp.superscope") && !window.OPM.isOputilsDDIManagement ){
            $('#'+this.elementId).find('.inventoryWidget').hide();
            $('#'+this.elementId).closest('.grid-stack-item').removeClass("grid-stack-item");
        }
		if(currentWidgetData.snapChain!==undefined && currentWidgetData.snapChain===true){
			currentWidgetData.snapChain=false;
			currentWidgetData.reloadWidget=false;
		}
		this.set('widgetData.snapIndex',currentWidgetData.indexCount); //NO I18N
		this.set('widgetData.headerInfo',getWidgetHeaderDetails(currentWidgetData)); //NO I18N

		if(OPMClient.InventoryNFAController.isNFASnapshot || OPMClient.InventoryNFAController.isDPISnapshot || (this.snapshotObj.snapDetails!==undefined && this.snapshotObj.snapDetails.isNetFlowTabSelected)) {
			if(this.widgetData.apiData.startTime!==undefined) {
				$("#snapshottimeFrameTitle").text(nfa_getTimeFrameString(OPMClient.FWAGlobalDataController.timePeriod)); //NO I18N
				OPMClient.InventoryNFAController.pdfStartTime = (this.widgetData.apiData.stdStartTime === undefined ? this.widgetData.apiData.startTime : this.widgetData.apiData.stdStartTime);
                OPMClient.InventoryNFAController.pdfEndTime  = (this.widgetData.apiData.stdEndTime === undefined ? this.widgetData.apiData.endTime : this.widgetData.apiData.stdEndTime);
				$(".timeFilterList .timeFrameDateInfo").text(this.widgetData.apiData.startTime+" "+Ember.I18n.t("js.commonstr.to")+" "+this.widgetData.apiData.endTime).show(); //NO I18N
				$(".timeFilterList .timeFrameDateInfo").attr("title",(this.widgetData.apiData.startTime+" "+Ember.I18n.t("js.commonstr.to")+" "+this.widgetData.apiData.endTime)); //NO I18N
			}else if(this.snapshotObj.snapDetails.isNetFlowTabSelected) { //For NetFlow tab from OPM's device & interface snapshot
				$(".DI-Header .timeFilterList").removeClass("dateInfo"); //NO I18N
			}
		}
		if(!currentWidgetData.expandView)
		{
			this.set('widgetData.titleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
		}
		if(currentWidgetData.expandView){
			$(".timeFilterList").hide(); //No I18N
			$(".DI-Header").addClass("disabled"); //No I18N
			if(this.snapshotObj.snapType==="MonitoringInterface" && (this.get('widgetData.name')==="opm.interface.application" || this.get('widgetData.name')==="opm.interface.topsource" || this.get('widgetData.name')==="opm.interface.topdest" || this.get('widgetData.name')==="opm.interface.topqos" || this.get('widgetData.name')==="opm.interface.topconv" || this.get('widgetData.name')==="nfa.intf.cbqos" || this.get('widgetData.name')==="webclient.snapshot.name.nbar" || this.get('widgetData.name')==="NFA.asView" || this.get('widgetData.name')==="NFA.interface.MCasttraffic" || this.get('widgetData.name')==="NFA.interface.MNettraffic" || this.get('widgetData.name')==="NFA.interface.Nbar2App" || this.get('widgetData.name')==="NFA.interface.http" || this.get('widgetData.name')==="NFA.interface.QosStats" || this.get('widgetData.name')==="NFA.interface.Art")){ //NO I18N
                $("#opmCustomTimeChooser").hide(); //No I18N
            }
		}else if(!OPMClient.HomeDetailsController.isFromDashboardDrillDown) {
			if(!OPMClient.InventoryNFAController.tpAnalysis) {
				$(".timeFilterList").show(); //NO I18N
			}
			$(".DI-Header").removeClass("disabled"); //No I18N

            if(this.snapshotObj.snapType==="MonitoringInterface"){
            	$("#opmCustomTimeChooser").show(); //No I18N
            }
			if(this.snapshotObj.snapType==="FlowDevice") { //NO I18N
				if(this.widgetData.apiData===undefined || this.widgetData.apiData.startTime===undefined) {
					$(".DI-Header .timeFilterList.dateInfo").hide(); //NO I18N
				}
			}
		}

		if(OPMClient.ApplicationController.isNeedSnapShotTabSubMenus) {
			$("#snapLoadingTxt").hide();
		}

		if(OPMClient.HomeDetailsController.isFromDashboardDrillDown && OPMClient.HomeDetailsController.drillDownWidgetName===currentWidgetData.name){
			if(OPMClient.HomeDetailsController.nfaConvWidgetParams!==undefined && OPMClient.HomeDetailsController.nfaConvWidgetParams!==null){
				var params = OPMClient.HomeDetailsController.nfaConvWidgetParams;
				if(deviceBasicDetails.snapType != undefined && ["FlowAPMAC","FlowAccessPointGroup","FlowSSIDGroup"].contains(deviceBasicDetails.snapType)){
					OPMClient.Inventory.showWidgetToWlcConvTbl(params.type,params.entity,currentWidgetData.snapId,params.displayValue,params.inOutVal);
				}else if(OPMClient.HomeDetailsController.drillDownWidgetName === "NFA.interface.Nbar2App") { //NO I18N
					OPMClient.Inventory.showWidgetToAVCConvTbl("avcNbar2AppConDetails", currentWidgetData.snapId, params.displayValue, params.entity); //NO I18N
				}else{
					OPMClient.Inventory.showWidgetToConvTbl(params.type,params.entity,currentWidgetData.snapId,params.displayValue,params.inOutVal,params.isResolveDNS,"",(params.isResolveDNS?"DNS":"IP")); //NO I18N
				}
				$(".timeFilterList").hide(); //No I18N
				$(".DI-Header").addClass("disabled"); //No I18N
				OPMClient.HomeDetailsController.nfaConvWidgetParams=null;
				this.set('widgetData.expandView',false);//No I18N
				this.set('widgetData.gridClassName','grid-stack-item'); //No I18N
			}
		}

  	if(currentWidgetData.type!=="Grid" && currentWidgetData.type!=="AssociatedDials" && currentWidgetData.type!=="FWAReportList" && currentWidgetData.type!=="FWAReportListOnDemand" && currentWidgetData.type!=="Remotegrid" && currentWidgetData.type!=="RemoteSubGrid" && currentWidgetData.type!=="NFASubGrid" && currentWidgetData.type!=="NFAGraph" && currentWidgetData.type!=="NFAGraphTable" && currentWidgetData.type!=="StorageSummary" && currentWidgetData.type!=="StorageGrid" && currentWidgetData.type!=="StorageDial"){
  		if(currentWidgetData.reloadWidget!==undefined && currentWidgetData.reloadWidget===true){
  			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
	  		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
  		}else{
  			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
  		}
  	}else if(currentWidgetData.reloadWidget!==undefined && currentWidgetData.reloadWidget===true){
  		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
  	}
  	if(OPMClient['Opm'+currentWidgetData.type+'Component']!==undefined){
  		var childComponent = this.createChildView(OPMClient['Opm'+currentWidgetData.type+'Component'],{widgetData:currentWidgetData,snapIndex:this.snapIndex,snapshotObj:this.snapshotObj,additionalProps:this.additionalProps,action:"childActions",widgetsWithData:this.widgetsWithData,userPermissions:window.OPM.userPermissions}); //No I18N
  		childComponent.appendTo($('#content-'+currentWidgetData.indexCount));
  		OpmSnapwidgetComponentArray[currentWidgetData.indexCount]=childComponent;
  	}
  	if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "OPUBWInterface"){
  		$('#opuIfNameSelection').select2();
  	}
  	this.set('widgetData.isDevInterface',false); //No I18n
  	if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringDevice" && currentWidgetData.name === "opm.device.interfaces" && currentWidgetData.apiData.downCount !== undefined && currentWidgetData.apiData.interfaceCount !== "0")
  	{
  		this.set('widgetData.isDevInterface',true); //No I18n
  	}
  	if(currentWidgetData.type === "summaryInfo" && currentWidgetData.name === "webclient.opm.meraki.msinfo"){
  		OPMClient.InventoryDeviceDetailsController.set('isMerakiMSSnap',true);//No I18N
  	}
  	handleMessageFramework(this);
  	
  	//NCM code added for interface and vlan last update details
  	this.set('widgetData.ncmIntfLastUpdate','NA');	//No I18n
  	this.set('widgetData.ncmVlanLastUpdate','NA');	//No I18n
  	if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "ConfigDevice" && (currentWidgetData.name === "ncm.device.interfaces" || currentWidgetData.name === "ncm.device.vlanDetails")) {
  		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/ncmdevice/getIntfVlanLastChangeDetails?resourceId="+OPMClient.InventoryDeviceDetailsController.RESOURCEID);//No I18N
  		if(response.intfLastUpdate != undefined) {
  			this.set('widgetData.ncmIntfLastUpdate',response.intfLastUpdate);	//No I18n
  			this.set('widgetData.ncmVlanLastUpdate',response.vlanLastUpdate);	//No I18n
  		}
  	}
  },
  willClearRender: function(){
  	this.widgetData.reloadWidget=true;
  },
  apiDataObserver: function(){
  	this.apiChanged=true;
  	this.rerender();
  }.observes('widgetData.apiData'),
  reloadTriggerObserver: function(){
  	this.widgetData.reloadTrigger=false;
  	var self=this;
  	opm_reloadWidgetCall(self);
  }.observes('widgetData.reloadTrigger'),//No I18N
  actions:{
  	childActions: function(functionType, functionName){
  		var isVMWidget = (['opm.device.nutanix.vms','opm.device.vmwarevms'].includes(this.get('widgetData.name')));//No I18N
  		if(functionType==='reload'){
  			var self=this;
  			if(isVMWidget){
					OPMClient.InventoryDeviceDetailsController.setProperties({selectedVMType:'AllVMs',vmsDataCache:{}});//No I18N
				}
  			opm_reloadWidgetCall(self);
  		}
  		else if(functionType==='expand'){
  			if(OPMClient.HomeDetailsController.isFromDashboardDrillDown){
  				$(".timeFilterList").show();
				$(".DI-Header").removeClass("disabled");
  				OPMClient.HomeDetailsController.isFromDashboardDrillDown=false;
  				for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
					if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
						OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
					}
				}
				return;
  			}
  			var callBackFunc = function(jsonData){
  				self.set('widgetData.apiData',jsonData); //No I18N
  				$("#"+this.uniqueId).remove();
			  	//self.rerender();
			}
			var self=this;
			if(self.get('widgetData.expandView')===true){
				self.set('widgetData.expandView',false); //No I18N
				self.set('widgetData.gridClassName','grid-stack-item'); //No I18N
				self.set('widgetData.titleExpand',Ember.I18n.t('webclient.general.expand',this)); //No I18N
				OPMClient.InventoryDeviceDetailsController.expandSnapWidget = false;
				}else{
				self.set('widgetData.expandView',true); //No I18N
				self.set('widgetData.titleExpand',Ember.I18n.t('webclient.sdpmsp.sdpmsp.collapse',this)); //No I18N
				
				self.set('widgetData.gridClassName','grid-stack-item dashboardWidgetExpandView expandViewGraphTable'); //No I18N
				OPMClient.InventoryDeviceDetailsController.expandSnapWidget = true;
				if(self.get('widgetData.nfaCustomPagerDetails') != undefined && self.get('widgetData.nfaCustomPagerDetails')){
					self.set('widgetData.nfaCustomPagerDetails.pageCount', 1); //NO I18N
				}
			}

			if(self.get('widgetData.expandView')) {
				$(".timeFilterList").hide();
				$(".DI-Header").addClass("disabled");
			}else {
				if(ipslaSnapType.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType)>=0) {
					OPMClient.FWAGlobalDataController.timePeriod = "today"; //No I18N
					OPMClient.FWAGlobalDataController.expandtimePeriod = "today"; //No I18N
				}
				$(".timeFilterList").show();
				$(".DI-Header").removeClass("disabled");
			}
			self.set('widgetData.ondemandWidget',false); //No I18N
			self.set('widgetData.reloadWidget',true); //No I18N
  			opm_widgetSuccessCall(self.widgetData,self,'',callBackFunc,self.get('snapshotObj'),self.get('additionalProps'),0);
  			if(isVMWidget){
					OPMClient.InventoryDeviceDetailsController.setProperties({handleShowMore:!self.get('widgetData.expandView'),vmsDataCache:{}});//No I18N
				}
  		}else if(functionType === 'fn') { //No I18N
  			Ember.run(fn);
  		}
  	}
  },
  willDestroyElement: function(){
  	var snapIndex = this.widgetData.indexCount;
  	if(OpmSnapwidgetComponentArray[snapIndex]!==undefined){
  	OpmSnapwidgetComponentArray[snapIndex].destroy();
  	OpmSnapwidgetComponentArray[snapIndex]=null;
  	delete OpmSnapwidgetComponentArray[snapIndex];
  	}
  	$('#'+this.elementId).find('*').remove();
	if(OPMClient.ApplicationController.isNeedSnapShotTabSubMenus) {
		$("#snapLoadingTxt").show();
	}
  }
});
OPMClient.OpmSnapshotCommonHeaderComponent = Ember.Component.extend({
	classNames:['heightAuto','inventoryWidget'], //No I18N
	ondemandtimeheaderid: function() {
		return this.get('widgetData.id')+'_ondemandtimeheader';//No I18N
	}.property('widgetData.id'),//No I18N
	actions: {
		subChildActions: function(functionType, functionName) {
			this.sendAction('action',functionType,functionName);
		},
		showHideDropDown : function(){
			$('.exportul.AETIDFilDropDownList.exportSize').toggle();//No I18N
		},
		ExportData : function(type, deviceName, title) {
			exportData(type, deviceName, title);
		},
		openExpandWidgetTimeSelection:function(timeFrame) {
			$('#customTimeStatic').show();
			$('#CustomTimeDiv').hide();
			var isMonitoringInterface = OPMClient.InventoryDeviceDetailsController.inventorysnapType === "MonitoringInterface"; //No I18N
			if(isMonitoringInterface) {
				$('#timeFilterListId').hide();
				$('#timeFilterListForOPMSnap').show();
			} else {
				$('#timeFilterListForOPMSnap').hide();
				$('#timeFilterListId').show();
			}
			var timeSelector = isMonitoringInterface ? "#opmexpandtimefornfawidgets" : "#opmexpandtime"; //No I18N

			deviceSlideIn(3);
			OPMClient.InventoryDeviceDetailsController.selectedSmallSlide = true;
			$('#deviceSnapshotSmallHeader').text(Ember.I18n.t('webclient.reports.selecttime',this)); //No I18N

			$(".opmBtnHldr .snapShot").hide();
			$(".opmBtnHldr .perfGraph").hide();
			$(".opmBtnHldr .perfGraphNew").hide();
			$('.opmBtnHldr .outageHistory').hide();
			$(".opmBtnHldr .expandsnapShot").show();

			if(ipslaSnapType.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType)>=0) {
				$(timeSelector+" input[value="+OPMClient.FWAGlobalDataController.timePeriod+"]").prop("checked",true); //NO I18N
			}else {
				$(timeSelector+" input[value="+timeFrame+"]").prop("checked", true); //NO I18N
			}

			if(OPMClient.FWAGlobalDataController.expandtimePeriod === 'custom') {
				$('#CustomTimeDiv').show();
				showCustomTimePeriod(OPMClient.FWAGlobalDataController.expandstartTime, OPMClient.FWAGlobalDataController.expandendTime);
			}
		},
		changeSnapSubTab:function(snapId,param,dataVal,className) {
			if(className !== "active") {
				OPMClient.HomeDetailsController.set("isFromDashboardDrillDown",false); //No I18N
				var subTabDetails = $.extend(true,[],this.get("snapshotObj.subTabDetails")); //No I18N
				for(var i=0;i<subTabDetails.length;i++){
					subTabDetails[i].className = (subTabDetails[i].id === snapId && subTabDetails[i].param === param && subTabDetails[i].dataVal === dataVal)?"active":""; //No I18N
	  			}
				this.set('snapshotObj.subTabDetails',subTabDetails); //No I18N
				this.set('snapshotObj.isSubTabChanged',true); //No I18N
			}
		}
	}
});
OPMClient.OpmIntfSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-intf-summary",
	didInsertElement: function(){
		var self = this;
		if(self.snapshotObj !== undefined && self.snapshotObj.snapType === "MonitoringInterface")
		{
			self.set('widgetData.sizey',13);//No I18N
			if(window.OPM.isNewSnapshotPage){
				self.set('widgetData.sizey',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
                 self.set('adjustedHeight',(window.OPM.showCustomFieldsInSummaryWidget)?17:16);//No I18N
             }
             if(window.OPM.showCustomFieldsInSummaryWidget)
             {
                 var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/getInterfaceNotes',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
                 var data = {interfaceName:OPMClient.InventoryDeviceDetailsController.interfaceName};
                 var response = opm_ajaxGetResponse(url,data);
                 if(response!==undefined && response.length>0)
                 {
                     self.set("customFieldValues",response);//No I18N
                 }
             }
         }
		if(window.OPM.userPermissions.devGrouporBVRestricted) {
			Ember.run.schedule("afterRender", function() {//No I18N
				if($(".deviceMenuAccr .opmIntf_menu ul > li").length === 0)
				{
					$(".deviceMenuAccr .opmIntf_menu").hide();
				}
				else
				{
					$(".deviceMenuAccr .opmIntf_menu").show();
					$(".deviceMenuAccr .opmIntf_menu").css("height", "215px");
				}
			});		 
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
     actions:
     {
         loadAppendUrl:function(url){
             loadAppendUrl(url);
         },
         intfEditSummary: function(snapObj){
             redirectSnapShot('IntfEditSummary',snapObj.snapType,snapObj.deviceName);//No I18N
				}
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll.customFieldScroll > div').mCustomScrollbar('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.JqueryUiDialogComponent = Ember.Component.extend({
  classNames: ['jquery-ui-dialog'],//No I18N
  templateName: 'components/jquery-ui-dialog',//No I18N

  didInsertElement: function() {
  	var id = this.get('id') ;

	 $('body').addClass("ui-dialog-style2");//No I18N
    this.$().dialog({
    	id:id,
    	dialogClass: "no-close",//No I18N
      autoOpen: false,
      modal: true,
      title: this.get('title') || Ember.I18n.t('webclient.agent.confirm',this),//No I18N
      width: 400,
      open:function( event, ui ) {
	       	$(".no-close .ui-dialog-titlebar-close").hide();
	   }
    });
  },

  willDestroyElement: function() {
    this.$().dialog('destroy');
	 $('body').removeClass("ui-dialog-style2");//No I18N
  },

  actions: {
    openDialog: function(){
     this.$().dialog('open');
    },
    save:function()
    {
      var functionName  =this.get('ok');
      JqueryDialogsave(this,functionName);      
			this.$().dialog('close');
    },
    close:function(){
   	  var isclosefn  =this.get('isclosefn');
    	if (isclosefn) {
    	      var functionName  =this.get('JqueryDialogcancel');
			    	functionName();
    	}
        this.$().dialog('close');
    }
  }
});
function JqueryDialogsave(self,functionName,purefunction)
{
	self.get('parentView').send(functionName);  //No I18N 
}


OPMClient.OpmPrinterStatusComponent = Ember.Component.extend({
	templateName: "components/opm-printer-status",//No I18N
	statusNum:"",
	printerDetails:{},
	didInsertElement: function(){
		var widgetData = this.get("widgetData");//No I18N
		if(widgetData!==undefined && widgetData.apiData!==undefined && widgetData.apiData.opmdetails!==undefined)
		{
			this.set("printerDetails",widgetData.apiData.opmdetails);//No I18N
		}
		this.set('widgetData.sizey',13);//No I18N
		this.set('widgetData.hideExpand',true);//No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
OPMClient.OpmCartridgeInfoComponent = Ember.Component.extend({
	templateName: "components/opm-cartridge-info",//No I18N
	classNames:["minMaxWidget","ut"],//No I18N
	colorInfo:[],
	showData:false,
	didInsertElement: function(){
		var jsonData = this.get("widgetData.apiData");//No I18N
		if(jsonData.data!==undefined){
			var colorData = jsonData.data;
			var widgetHeight = 5;
			this.set("colorInfo",[]);//No I18N
			if(colorData.cyan!==undefined){
				this.get("colorInfo").pushObject({name:'cyan',displayName:Ember.I18n.t('webclient.snapshot.name.printer.colors.cyan',this),value:colorData.cyan+'%'});//No I18N
				widgetHeight += 2;
			}
			if(colorData.magenta!==undefined){
				this.get("colorInfo").pushObject({name:'magenta',displayName:Ember.I18n.t('webclient.snapshot.name.printer.colors.magenta',this),value:colorData.magenta+'%'});//No I18N
				widgetHeight += 2;
			}
			if(colorData.yellow!==undefined){
				this.get("colorInfo").pushObject({name:'yellow',displayName:Ember.I18n.t('webclient.snapshot.name.printer.colors.yellow',this),value:colorData.yellow+'%'});//No I18N
				widgetHeight += 2;
			}
			if(colorData.black!==undefined){
				this.get("colorInfo").pushObject({name:'black',displayName:Ember.I18n.t('webclient.snapshot.name.printer.colors.black',this),value:colorData.black+'%'});//No I18N
				widgetHeight += 2;
			}
			if(widgetHeight===5){
				this.set('widgetData.noData',true);//No I18N
				this.set('widgetData.sizey',2);//No I18N
				this.set('showData',false);//No I18N
			}else{
				this.set('widgetData.sizey',widgetHeight);//No I18N
				this.set('widgetData.noData',false);//No I18N
				this.set('showData',true);//No I18N
			}
		}else{
			this.set('widgetData.noData',true);//No I18N
			this.set('widgetData.sizey',2);//No I18N
			this.set('showData',false);//No I18N
		}
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //No I18N
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});


OPMClient.OpmIntfSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-intf-summary-details",//No I18N
	classNames:['com_IntfSummaryDetails'],
	didInsertElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IntfSummaryDetails .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
	},
	actions:{
		intfEditSummary: function(snapObj){
			redirectSnapShot('IntfEditSummary',snapObj.snapType,snapObj.deviceName);//No I18N
		}
	},
	scrollObserver:function(){
		var adjustedHeight = this.get('adjustedHeight');//No I18N
		if(adjustedHeight!==undefined){
			adjustedHeight = snapHeightCalculation[this.get('adjustedHeight')]-(window.OPM.showCustomFieldsInSummaryWidget?50:70);//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar('destroy');//No I18N
			$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
				axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:adjustedHeight,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
			});
		}
	}.observes('adjustedHeight'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmURLSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-url-summary", //No I18N
	apiDataArray:[],
	didInsertElement: function(){
		this.set('apiDataArray',[]); //No I18N
		var temp = {};
		var widgetData = this.get('widgetData');
		var snapshotObj = this.get('snapshotObj');
		var apiData = widgetData.apiData;
		var availDialClick = function(params){
			redirectSnapShot(params,snapshotObj.snapType,snapshotObj.deviceName);	
		};
		var dialValue = apiData.details.AvailabilityImagePath.Up;
		var dialDivName = "AvailabilityGaugeDiv"; //No I18N
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
		temp.dialType = 'meter'; //No I18N
		temp.snapHolderId = dialDivName;
		temp.iconTitle = Ember.I18n.t("webclient.devices.details.avail", this); //No I18N
		temp.dialClickEnabled = true;
		temp.dialClickFunc = availDialClick;
		temp.dialClickParams = "AvailabilityGraph"; //No I18N
		this.get('apiDataArray').pushObject(temp);
		if(apiData.details.responseTime === "No Response"){
			apiData.details.responseTime = "NA"; //No I18N
		}
		var self=this;
		var dialClickFunc = function(){
			//addDialClickEventURL('responseTimeDiv','urlResponseTime');//NO I18N
			var pdName = "urlResponseTime"; //No I18N
			openPerformanceMonEnhancedGraph(pdName,pdName,false,true,Ember.I18n.t('webclient.home.server.responsetime.column.time'));//No I18N
		}
		var dialEditFunc = function(){
			editResponseThreshold(apiData.details.name,"OpManagerUrlStatusPoll","stat","Url",true); //No I18N
		}
		temp={};
		temp.dialType='dial'; //No I18N
		temp.snapHolderId='responseTimeDiv'; //No I18N
		temp.dialEditEnabled=true;
		temp.dialEditFunc = dialEditFunc;
		temp.editTitle=Ember.I18n.t('webclient.admin.devicetype.newTempl.editThresh',this); //No I18N
		temp.unit=Ember.I18n.t("opu.common.ms", this); //No I18N
		temp.value=apiData.details.responseTime;
		temp.iconTitle=Ember.I18n.t('webclient.home.server.responsetime.column.time',this); //No I18N
		temp.dialClickEnabled=true;
		temp.dialClickFunc=dialClickFunc;
		this.get('apiDataArray').pushObject(temp);
		if(window.OPM.isNewSnapshotPage){
			self.set('widgetData.sizey',14);//No I18N
		}
		var errorMessage =sessionStorage.getItem("APMErrorMessage");//No I18N
		if(errorMessage != undefined && errorMessage != ""){
			errorMessage = errorMessage.replace(/"/g, '');//No I18N
			$('.DI-Options.actions .deviceslideActionBtn').click();//No I18N
			this.set("errorMessage",errorMessage);//No I18N
			this.set("showApmErrorMessage",true);//No I18N
			this.set('widgetData.sizey',15);//No I18N
			sessionStorage.removeItem("APMErrorMessage");//No I18N
		}
	},
	actions:{
		redirectToDeviceSnapshot: function(){
			redirectToDeviceSnapshot(this.widgetData.apiData.details.parentKey,'','MonitoringDevice');
		},
		redirectToAPMSSLMonitor: function(resourceID){
			redirectAPMSubMenu('Monitors');//No I18N 
			var url = "/showresource.do?resourceid="+resourceID+"&method=showResourceForResourceID";//No I18N
    		setAPMURLinFrame(url);

		},
		closeApmErrorMessage: function(){
			this.set("showApmErrorMessage",false);//No I18N
			this.set('widgetData.sizey',12);//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmUrlSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-url-summary-details", //No I18N
	tagName:'section', //No I18N
	attributeBindings:['style'],
	style:"min-height:auto;", //No I18N
	classNames:['DIG-List','DIGmCustomScroll'], //No I18N
	didInsertElement: function(){
		var snapshotObj = this.get("snapshotObj");
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',setHeight:200,scrollbarPosition:'outside',advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		OPMClient.InventoryDeviceDetailsController.set("isSuppressed",false); //No I18N
		OPMClient.InventoryDeviceDetailsController.set("suppressedMessage",""); //No I18N
		if(snapshotObj.details.deviceName!==undefined && snapshotObj.details.deviceName!==null && snapshotObj.details.deviceName!=="") {
			var urlParameter = "&monitorID="+snapshotObj.details.moID+"&monType=DEVICE_SPECIFIC_URL&type=Monitors&monitorName="+snapshotObj.details.urlName; //No I18N
			$.getJSON(window.OPM.apiUrlPattern + '/device/GetSuppressAlarmDetails?name='+snapshotObj.details.deviceName+urlParameter,function(jsonData){ //No I18N
				if(jsonData.suppressInterval!=="0") {
					OPMClient.InventoryDeviceDetailsController.set("isSuppressed",true); //No I18N
					OPMClient.InventoryDeviceDetailsController.set("suppressedMessage",jsonData.message); //No I18N
				}
			});
		}
		if(snapshotObj.details.SSLMonitorID){
			$('.DIGmCustomScroll').removeClass("DIGmCustomScroll"); //No I18N
		}
	},
	actions:{
		redirectToDeviceSnapshot: function(){
			redirectToDeviceSnapshot(this.snapshotObj.details.parentKey,'','MonitoringDevice');
		},
		redirectToAPMFrmAlarm:function(pollid){
            redirectToAPMFrmAlarm(pollid);
        }
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmSnapshotWidgetIconsComponent = Ember.Component.extend({
	templateName: "components/opm-snapshot-widgetIcons",
	classNames:['dashboardWidgetIcons','inventoryWidgetIcons','nfaAutoRefreshDiv'],//No I18N
	//True only for the four LB child snapshot grids that expose the shared bulk Suppress/Unsuppress Alarms action.
	showLBChildSuppress: function(){
		return ["webclient.opm.lb.pl.childlist","webclient.opm.lb.vs.childlist","webclient.opm.kemplb.rs.childlist","webclient.opm.kemplb.vs.childlist"].indexOf(this.get('widgetData.name')) > -1;//No I18N
	}.property('widgetData.name'),//No I18N
	markAsActionValue:'',
	markAsGroupValue:'',
	filterValue:'',
	groupValue:'',
	toggleValue:false,
	raiseEntityAlerts: false,
	didInsertElement: function(){
		var self = this;
		if(this.get('widgetData.name')==="ipam.switch.ports" ){//No I18N
			$(".inventoryWidgetIcons").addClass("opuLegendIcon");//No I18N
		}
		if(this.get('widgetData.name')==="opm.interface.application" || this.get('widgetData.name')==="opm.interface.topsource" || this.get('widgetData.name')==="opm.interface.topdest" || this.get('widgetData.name')==="opm.interface.topqos" || this.get('widgetData.name')==="opm.interface.topconv" || this.get('widgetData.name')==="nfa.intf.cbqos" || this.get('widgetData.name')==="webclient.snapshot.name.nbar" || this.get('widgetData.name')==="NFA.asView" || this.get('widgetData.name')==="NFA.interface.MCasttraffic" || this.get('widgetData.name')==="NFA.interface.MNettraffic" || this.get('widgetData.name')==="NFA.interface.Nbar2App" || this.get('widgetData.name')==="NFA.interface.http" || this.get('widgetData.name')==="NFA.interface.QosStats" || this.get('widgetData.name')==="NFA.interface.Art"){//No I18N
        	$(".inventoryWidgetIcons").addClass("interface_widget_expand_view");//No I18N
        }
		if(this.get('widgetData.name')==="opm.device.bgpmonitors" || this.get('widgetData.name')==="opm.sdwan.tunnels" || this.get('widgetData.name')==="opm.sdwan.sites" || this.get('widgetData.name')==="opm.merakimx.wanlink" || this.get('widgetData.name') === "opm.device.ipRoutingneighbour" || this.get('widgetData.name') === "webclient.opm.meraki.radios" || this.get('widgetData.name') === "webclient.opm.meraki.security" || this.get('widgetData.name')=== "webclient.opm.meraki.switches" || this.get('widgetData.name') === "webclient.opm.meraki.vision" || this.get('widgetData.name') === "webclient.opm.meraki.gateway" || this.get('widgetData.name') === "webclient.opm.meraki.sensor" || this.get('widgetData.name')==="opm.sdwan.wanlinks" || this.get('widgetData.name')==="opm.sdwan.underlayTunnels" || this.get('widgetData.name')==="webclient.opm.router.tunnelSummary" || this.get('widgetData.name')==="webclient.opm.wanlinkSummary" || this.get('widgetData.name')==="webclient.opm.lb.pl.childlist" || this.get('widgetData.name')==="webclient.opm.lb.vs.childlist" || this.get('widgetData.name')==="webclient.opm.kemplb.rs.childlist" || this.get('widgetData.name')==="webclient.opm.kemplb.vs.childlist" || this.get('widgetData.name')==="opm.ngfw.slas" || this.get('widgetData.name')==="opm.sdwan.switches" || this.get('widgetData.name')==="opm.sdwan.accesspoints" || this.get('widgetData.name')==="opm.sdwan.gateways" || this.get('widgetData.name')==="opm.sdwan.simlinks" || this.get('widgetData.name')==="opm.pon.ontDevices" || this.get('widgetData.name')==="opm.pon.oltDevices"){//No I18N
			$(".inventoryWidgetIcons").addClass("overflow-visible");//No I18N
		}
		if(this.get('widgetData.name') == "opm.device.virtualSnapshotDetails"){ //No I18N{
			this.element.classList.add('overflow-visible'); // No I18N
		}
		$('#'+this.elementId+' .select2').select2();
		var snapId = this.get('widgetData.id'); //No I18N
		if(this.get('widgetData.grapPlotType') !== undefined) { //No I18N
			$('#graphPlotOptions_'+snapId+' i').removeClass('active'); //No I18N
			$('#graphPlotOptions_'+snapId+' i.icon-'+this.get('widgetData.grapPlotType')).addClass('active'); //No I18N
		}
		this.set("widgetData.gridTableId","opm_DeviceSnapList"+this.get('widgetData.id'));//No I18N
		if(OPMClient.ApplicationController.isNeedSnapShotTabSubMenus) {
			$("#param_"+snapId+"_Type").parent().parent().hide(); //No I18N
			$("#param_"+snapId+"_ReportType").parent().parent().hide(); //No I18N
			$("#param_"+snapId+"_graphoption").parent().parent().hide(); //No I18N
			$("#param_"+snapId+"_TypeOFGraph").parent().parent().hide(); //No I18N
			$("#param_"+snapId+"_isLocation").parent().parent().hide(); //No I18N
			$("#param_"+snapId+"_isMacAddress").parent().parent().hide(); //No I18N

			$("#widgetElement_"+snapId+" .tablegridviewtype").hide(); //No I18N

			if(this.widgetData.name === "NFA.interface.MNettraffic") {
				$("#param_"+snapId+"_SortBy").parent().parent().hide(); //No I18N
			}else if(this.widgetData.name !== "NFA.interface.MCasttraffic") { //No I18N
				$("#param_"+snapId+"_ResolveDNS").parent().parent().hide(); //No I18N
				$("#param_"+snapId+"_isNetwork").parent().parent().hide(); //No I18N
			}
		}
		if(this.widgetData.name === "webclient.opm.meraki.security" || this.widgetData.name === "webclient.opm.meraki.switches" || this.widgetData.name === "webclient.opm.meraki.radios" || this.widgetData.name === "webclient.opm.meraki.vision" || this.widgetData.name === "webclient.opm.meraki.gateway" || this.widgetData.name === "webclient.opm.meraki.sensor"){
			OPMClient.InventoryDeviceDetailsController.set('isMerakiCtlrDevs',true);//No I18N
			
			var merakiDevModel = getMerakiDeviceModel(this.widgetData.name);

			var devArr = [{'key':"",'value':Ember.I18n.t('webclient.maps.allcategs')}];//No I18N
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/wireless/getMerakiNetworkList",{'callAction':'merakiDevices','deviceName':OPMClient.InventoryDeviceDetailsController.deviceName,'model':merakiDevModel}); //No I18N 
	    	$.each(response,function(k,v){
	    		devArr.push({'key':k,'value':v}); //No I18N
	    	});
			OPMClient.InventoryDeviceDetailsController.set('merakiDevNets',devArr);//No I18N
			$('#param_'+this.widgetData.id+'_mnetw').select2();//No I18N
		}else{
			OPMClient.InventoryDeviceDetailsController.set('isMerakiCtlrDevs',false);//No I18N
			OPMClient.InventoryDeviceDetailsController.set('merakiDevNets',[]);//No I18N

		}
		if(this.widgetData.name === "opm.wlc.accessPoints" || this.widgetData.name === "opm.wlc.SSID" || this.widgetData.name === "opm.wlc.rougeaps" || this.widgetData.name === "opm.wlc.clients"){ //No I18N
			// listWLCSites is only applicable for Ubiquiti UniFi WLC (sites are a Ubiquiti-specific
			// construct). Skip the API call for every other WLC vendor so we don't hit the server
			var wlcVendorName = (OPMClient.InventoryDeviceDetailsController.get('deviceSummaryObj') || {}).vendorName; //No I18N
			var isUbiquitiWLC = (wlcVendorName || '').toLowerCase() === "ubiquiti networks"; //No I18N
			OPMClient.InventoryDeviceDetailsController.set('showWlcSiteFilter',false); //No I18N
			if(isUbiquitiWLC){
				var currentMoID = OPMClient.InventoryDeviceDetailsController.get('moID'); //No I18N
				var fetchedMoID = OPMClient.InventoryDeviceDetailsController.get('wlcSitesFetchedMoID'); //No I18N
				if(fetchedMoID !== currentMoID){
					var siteArr = [];
					var siteResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/wireless/listWLCSites",{'moID':currentMoID}); //No I18N
					if(siteResponse !== undefined && siteResponse !== null && siteResponse.length > 0){
						for(var i = 0; i < siteResponse.length; i++){
							siteArr.push({'key':siteResponse[i].siteMoid,'value':siteResponse[i].siteName}); //No I18N
						}
					}
					OPMClient.InventoryDeviceDetailsController.set('wlcAPSites',siteArr); //No I18N
					OPMClient.InventoryDeviceDetailsController.set('wlcSitesFetchedMoID',currentMoID); //No I18N
				}
				var availableWLCSites = OPMClient.InventoryDeviceDetailsController.get('wlcAPSites') || []; //No I18N
				OPMClient.InventoryDeviceDetailsController.set('showWlcSiteFilter',availableWLCSites.length > 0); //No I18N
			}else{
				// Clear stale Ubiquiti site cache when opening non-Ubiquiti WLC widgets.
				OPMClient.InventoryDeviceDetailsController.set('wlcAPSites',[]); //No I18N
				OPMClient.InventoryDeviceDetailsController.set('wlcSitesFetchedMoID',null); //No I18N
				OPMClient.InventoryDeviceDetailsController.set('showWlcSiteFilter',false); //No I18N
			}
			var wlcSiteWidgetId = this.widgetData.id;
			var wlcSiteFilterVal = this.widgetData.selSiteFilter;
			Ember.run.scheduleOnce('afterRender', function(){ //No I18N
				$('#param_'+wlcSiteWidgetId+'_wlcSite').select2(); //No I18N
				if(wlcSiteFilterVal !== undefined && wlcSiteFilterVal !== 'All'){
					$('#param_'+wlcSiteWidgetId+'_wlcSite').val(wlcSiteFilterVal).select2(); //No I18N
				}
			});
		}
		if(deviceBasicDetails.snapType === "FlowInterface" && deviceBasicDetails.isCIDREnabled && ["opm.interface.topsource","opm.interface.topdest"].indexOf(this.widgetData.name) > -1 && $("#param_"+snapId+"_isNetwork").prop("checked")) { //NO I18N
			$("#widgetElement_"+snapId+" .inventoryWidgetIcons .nfaShowAllGraph").hide(); //NO I18N
		}
		if(window.OPM.isMSPCentral){
			$('#exportPDFIcon').hide()
			$('#exportCSVIcon').hide()
		}
		if(["opm.device.nutanix.vms", "opm.device.vmwarevms"].includes(this.widgetData.name)){
			if(OPMClient.InventoryDeviceDetailsController.selectedVMType !== 'AllVMs'){
				Ember.run.scheduleOnce('afterRender',function(){//No I18N
					$('#vmTypes').val(OPMClient.InventoryDeviceDetailsController.selectedVMType).select2();
				});
			}
		}
		if(['opm.interface.graphs','opm.device.routerGraphs','opm.url.response'].contains(this.widgetData.name)){//No I18N
			$('#'+this.elementId).addClass('tooltipOverflowVisible');
		}
		if(raiseEntityAlarm()) {
			self.set("raiseEntityAlerts", true);
		}
		if(!(window.OPM.isCentralServer || window.OPM.isFreeEdition || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition)) {
			if(this.get('widgetData.apiData').length) { // No I18N
				self.set("showVirtualSnapshotActions", true) // No I18N
			}
		}
		if(["opm.device.nutanix.vms", "opm.device.vmwarevms"].includes(self.get('widgetData.name'))){
			self.set("showVMActions", true) // No I18N
		}
	},

	tablegridviewtype:function(){
		return "tablegridviewtype_"+this.get('widgetData.id');//No I18N
	}.property('widgetData.id'),//No I18N
	actionsId: function() {
		return this.widgetData.widgetElementID + "-actions"; // No I18N
	}.property('actionsId'), // No I18N
	actions: {
		vmTypeChange:function(){
			var self = this;
			var vmsDataCache = OPMClient.InventoryDeviceDetailsController.vmsDataCache;
			var selectedVMType = OPMClient.InventoryDeviceDetailsController.selectedVMType;
			if(Object.keys(vmsDataCache).length){
				var gridData = OPMClient.InventoryDeviceDetailsController.vmsDataCache.gridData;
				//To avoid scroll getting blocked
				setTimeout(function(){
					$("#"+gridData.gridId).jqGrid('GridUnload');//No I18n
					opm_loadJQgridWithData("#"+gridData.gridId,vmsDataCache[selectedVMType],gridData.colNames,gridData.colModels,gridData.captionTitle,gridData.gridNavigator,gridData.onSelectFunction,gridData.defaultOptions,gridData.page);
				},100);
				if(!self.get('widgetData.expandView')){
					var vmShowMore = $('#'+gridData.gridId).closest('.opm_jqGridUI').find('.widgetListMore');//No I18N
					if(vmsDataCache[selectedVMType].length > 10){
						vmShowMore.show();
					}else{
						vmShowMore.hide();
					}
				}
			}
		},
		deleteVms:function(url,params)
		{
			var url = this.get("deleteVmUrl");
						var params = this.get("deleteVmparams");
			var response = opm_ajaxPostRequest(url,params)
			var options={};
			var self = this;
		    options.callback_func = self.sendAction('action','reload');//No I18N
			opm_infoMsgs('successMsg',response.result.message,options); //No I18N
		
		},
		vmActionsChange:function(){
			if(OPMClient.InventoryDeviceDetailsController.selectedVMAction == null)
			{
				return;
			}
			var self = this;
			var selectedAction = $('#vmAction').val();
			var gridData = OPMClient.InventoryDeviceDetailsController.vmsDataCache.gridData;
			var selRowIds = $("#"+gridData.gridId).jqGrid('getGridParam','selarrrow');//No I18N
			var url = window.OPM.apiUrlPattern;
			var params = {};
			var selectedDevices = [];
			var manage = selectedAction == "manage" ? true : false;//No I18N
			OPMClient.InventoryDeviceDetailsController.selectedVMAction = '';
			if(selRowIds == undefined)
			{
				setTimeout(function(){
				$('#vmAction').val('').select2();
				},1000);
				return;
			}
			if(selRowIds.length > 0)
			{
				$.each(selRowIds, function(key, val) {
				    var rowData = $("#"+gridData.gridId).jqGrid ('getRowData', val);			    
				    if(parseInt(rowData.MOID) > 0 || !rowData.MOID)
				    {
				    	selectedDevices.push(rowData.NAME)
				    }
				});
			}
			if(selectedDevices.length ==0)
			{
				setTimeout(function(){
				$('#vmAction').val('').select2();
				},1000);
				opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.topo.bulkedit.noselection.alert')); //No I18N
				return;
			}
			if(selectedAction == 'delete')
			{
				 url += '/discovery/deleteDevice';//No I18N
				 params.deviceName =  selectedDevices.join();
				 var probeID='';
				 if(window.OPM.isCentralServer)
		        {
		            probeID = ee_addManualProbeIDOnNeed(OPMClient.InventoryDeviceDetailsController.deviceName);
		        }
		        url = eeClientReqToProbe(url,probeID)

				 this.set("deleteVmUrl",url)//No I18N
				 this.set("deleteVmparams",params)//No I18N
				 $('#delete').dialog('open');
				 				setTimeout(function(){
				$('#vmAction').val('').select2();
				},1000);
				 					
				 return;
			}
			else
			{
				 url += '/device/setManaged?manage='+manage, //No I18N
				 params.name =  selectedDevices.join();
			}
			var probeID='';
			 if(window.OPM.isCentralServer)
	        {
	            probeID = ee_addManualProbeIDOnNeed(OPMClient.InventoryDeviceDetailsController.deviceName);
	        }
			url = eeClientReqToProbe(url,probeID)
		    callback = function (response){
		    				var options={};
		    options.callback_func = self.sendAction('action','reload');//No I18N

				opm_infoMsgs('successMsg',response.result.message,options); //No I18N
		    }
			var response = opm_ajaxPostRequestWithMsg(url,params,Ember.I18n.t('webclient.nfa.diskSpaceInfo.waitMsg',this),callback,self); //No I18N

			
		},
		subChildActions: function(functionType, functionName) {
			this.sendAction('action',functionType,functionName);
		},
		showNoDataAlert:function() {
			opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.reports.view.nodata')); //No I18N
		},
		doGraphFilter:function(graphFilterType,isGraphStyle){
			var self = this.get('widgetData.graphSettings');
			if(isGraphStyle){
				if(!self.get('disableStyleFilter')){
					self.setProperties({'graphFeatureSettings.graphStyle':graphFilterType});//No I18N
					setGraphFilterTypes(self,true,false);
					this.set('widgetData.apiData',cloneObject(this.get('widgetData.apiData'))); //No I18N
				}
			}else{
				if(self.get('showGraphFilters')){
					self.setProperties({'graphFeatureSettings.graphPlottingType':graphFilterType});//No I18N
					setGraphFilterTypes(self,false,true);
					this.sendAction('action','reload');//No I18N
				}
			}
		},
		doExpandGraph:function(){
			var self = this;
			var widgetData = self.get('widgetData');
			var widgetParams = self.get('widgetData.parameters');
			if(widgetData.name === "opm.nutanix.pc.clusterMetricsSummary") {
				redirectToSnapPerfGraphFromNutanixWidget(OPMClient.InventoryDeviceDetailsController.deviceName, widgetData.nxSelectedMonitor);
				return;
			}
			if('KempGraphs' === widgetData.type){
				var reqParams = getRequiredKempParams(widgetData,widgetParams);
				openPerformanceMonEnhancedGraph(reqParams.policyName,reqParams.index,'kemp',true,widgetData.translatedDesc,reqParams.period,reqParams.startDate,reqParams.endDate,reqParams);//No I18N
			}else{
				if(widgetParams !== undefined && widgetParams.length){
					var paramsArray = widgetParams.map(function(obj){return obj.param;});
					var graphParam = paramsArray.contains('policyName') ? 'policyName' : 'graphName';//No I18N
					var graphParamValue = widgetParams[paramsArray.indexOf(graphParam)].value;
					var graphPeriod = widgetParams[paramsArray.indexOf('period')].value;
					var startTime = '';
					var endTime = '';
					if('custom' === graphPeriod){
						var paramsObj = widgetParams[paramsArray.indexOf('period')];
						if(paramsObj.startTime !== undefined && paramsObj.endTime !== undefined){
							startTime = moment.tz(new Date(paramsObj.startTime),window.OPM.severTimeZone).format('DD/MM/YYYY HH:mm');//No I18N
							endTime = moment.tz(new Date(paramsObj.endTime),window.OPM.severTimeZone).format('DD/MM/YYYY HH:mm');//No I18N
						}
					}
					if(OPMClient.InventoryDeviceDetailsController.isWANIPInterfaceTab !== undefined && OPMClient.InventoryDeviceDetailsController.isWANIPInterfaceTab && self.snapshotObj !== undefined && self.snapshotObj.isWanLinkMonitoring !== undefined && self.snapshotObj.isWanLinkMonitoring){
						redirectToWanSnapShot("PerfGraph/"+graphParamValue+"/"+graphParamValue,'Link',self.snapshotObj.deviceName); // No I18N
					}else{
						openPerformanceMonEnhancedGraph(graphParamValue,graphParamValue,false,true,self.get('widgetData.translatedDesc'),graphPeriod,startTime,endTime,cloneObject(self.get('widgetData.graphSettings')));
					}
				}
			}
		},
		nfaChangeGrapPlotOption:function(type,snapId) {
			this.set('widgetData.grapPlotType',type); //No I18N
			this.set('widgetData.apiData',$.extend(true,{},this.get('widgetData.apiData'))); //No I18N
		},
		NFAOneClickSch:function(value,desc,id){
			NFAOneClickSch(value,desc,id);
		},
		NFAOneClickMail:function(url,id,index,desc) {
			this.get('widgetData.noData')?this.send('showNoDataAlert'):nfa_loadOneClickMailConfig(id,index,'snapWidget',Ember.I18n.t(desc),url,this.get('widgetData.grapPlotType')); //No I18N
		},
		nfa_inv_gen_pdf:function(url,id,index,desc){
			this.get('widgetData.noData')?this.send('showNoDataAlert'):nfa_inventoryExportPDF(id,index,'snapWidget',Ember.I18n.t(desc),url,this.get('widgetData.grapPlotType')); //No I18N
		},
		nfainventory_generateCSV:function(actionType,type,id,index,desc) {
			this.get('widgetData.noData')?this.send('showNoDataAlert'):nfa_inventoryExportCSV(actionType,id,index,Ember.I18n.t(desc),this.get('widgetData')); //No I18N
		},
		showMoreDetails: function() {
			opmGlobalRoute.transitionTo("Inventory.Device.DetailedWidget", {widgetID: this.widgetData.snapid}); //NO I18N
		},
		loadAppendUrl:function(url){
			loadAppendUrl(url);
		},
		showWidgetToCBQoSPolicyConf:function(id,snapshotObj){
			var interfaceID = (snapshotObj.snapType=="MonitoringInterface")?snapshotObj.NFA_ID:snapshotObj.deviceName; //NO I18N
			OPMClient.Inventory.showWidgetToCBQoSPolicyConf(id,interfaceID);
		},
		redirectToLink:function(value,paramsKey,paramsValue){
			redirectToLink(value,paramsKey,paramsValue);
		},
		fwaRuleMgmtRedirectionLink:function(params){
			OPMClient.FWAReportsDetailsController.fromInvPage=true;
			var widType="";
			$.each(params, function(i, item){
				if(item.param == "type"){
					widType=item.value;
				}
			});
			if(widType == "Overview"){
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'policyStat';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
			}else if(widType == "Optimization"){//No I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Optimization";//No I18N
			}else if(widType == "Risk"){//No I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					
					var deviceSummaryUrl = window.OPM.apiUrlPattern + '/fwainventory/getResourceDetails?rid='+OPMClient.InventoryDeviceDetailsController.deviceName; //No I18N
					$.ajax({
						url:deviceSummaryUrl, 
						dataType:'json', //No I18N
						async: false,
						success: function(jsonData){
							OPMClient.FWAComplianceRiskAnalysisController.invSelResName=jsonData.resDispName;
						}
					});
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARiskAnalysis";//No I18N
			}else if(widType == "Standards"){//No I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
					location.href=window.OPM.apiclientUrl+"FWACompliance/Standards";//No I18N
				}
			}else if(widType == "Security"){//No I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
					location.href=window.OPM.apiclientUrl+"FWACompliance/SecAudit/Report";//No I18N
				}
				
			}
		},
		reloadWidget: function(){
			this.sendAction('action','reload');
		},
		portActions: function(){
			OPMClient.InventoryOpUtilsController.set('portsWidgetId',"opm_DeviceSnapList"+this.widgetData.id);//No I18N
			OPMClient.InventoryOpUtilsController.set('portsSnapIndex',this.widgetData.snapIndex);//No I18N
			redrictToPortActions(($("#param_"+this.widgetData.id+"_portActions").val()),this.widgetData.id);	
		},
		expandWidget: function(){
			this.sendAction('action','expand');
		},
		exportPDFInvWidget:function(url,id){
			widData = this.widgetData;
			fwa_export_inventorySinglewidget(widData.url,widData.id,widData,Ember.I18n.t(widData.desc,this));
		},
		exportFWACsvInvWidget:function(tableId,headerName){
			widData = this.widgetData;
			var formElements=[];
			formElements.push({name:'exportFileType',value:"csv"}); //No I18N
			fwa_export_inventorySinglewidget(widData.url,widData.id,widData,Ember.I18n.t(widData.desc,this),false,formElements);
		},
		exportFWAXlsInvWidget:function(tableId,headerName){
			widData = this.widgetData;
			var formElements=[];
			formElements.push({name:'exportFileType',value:"xls"}); //No I18N
			fwa_export_inventorySinglewidget(widData.url,widData.id,widData,Ember.I18n.t(widData.desc,this),false,formElements);
		},
		FWAOneClickMail:function(url,id) {
			widData = this.widgetData;
			var parameters=widData.parameters;
			OPMClient.FWAReportsDetailsController.hideFileType=true;
			for(var i=0;i<parameters.length;i++){
				if(parameters[i].paramType == "widgetActions" && parameters[i].value == "csv"){
					OPMClient.FWAReportsDetailsController.hideFileType=false;
				}
			}
			this.get('widgetData.noData')?this.send('showNoDataAlert'):fwa_mail_inventorySinglewidget(widData.url,widData.id,widData,Ember.I18n.t(widData.desc,this));; //No I18N
		},
		addADMonitor:function(widgetData)
		{
			var parameters =widgetData.parameters;
			var monitorType='';
			if(parameters && parameters[0] && parameters[0].value != "AD")
			{
				monitorType = parameters[0].value;
			}	
			else if(parameters && parameters[1])
			{
				monitorType = parameters[1].value;
			}			
			var params = {"applicationName":"AD","monitorType":monitorType,name:widgetData.name};//No I18N
			params.displayName = widgetData.translatedDesc;
								params.WidgetInfo=this;

			opm_transitionToParentRoute("Inventory.Device.ADMonitors",params);//No I18N
		},
		addAddServices:function(widgetData)
		{
			var applicationName = widgetData.name == "webclient.notification.adservices" ? 'AD' : 'Exchange';
			var params = {"applicationName":applicationName,"type":applicationName,name:widgetData.name};//No I18N
			params.displayName = widgetData.translatedDesc
			opm_transitionToParentRoute("Inventory.Device.AddServices",params);//No I18N
		},
		nfaShowGraphAll:function(deviceID,snapID,snapWidgetName) {
			if(this.get('widgetData.noData')) {this.send('showNoDataAlert');return;}
			var widgetType;
			switch(snapWidgetName) {
				case 'nfa.cloudInterface.application'	: //NO I18N
				case 'opm.interface.application' 	:  //No I18N
				case 'opm.interface.topqos' 		: 	widgetType = $('#param_'+snapID+'_Type').val();break; //No I18N
				case 'nfa.cloudInterface.source'		: //NO I18N
				case 'opm.interface.topsource' 				: 	widgetType = $("#param_"+snapID+"_isNetwork").prop("checked")?"SrcNetwork":"Source";break; //NO I18N
				case 'nfa.cloudInterface.destination'	: //NO I18N
				case 'opm.interface.topdest' 				: 	widgetType = $("#param_"+snapID+"_isNetwork").prop("checked")?"DstNetwork":"Destination";break; //NO I18N
				case 'nfa.cloudInterface.conversation': //NO I18N
				case 'opm.interface.topconv' 				: 	widgetType = $("#param_"+snapID+"_isNetwork").prop("checked")?"ConvNetWork":"Conversation";break; //NO I18N
				case 'NFA.interface.Nbar2App' 		: 	widgetType = 'NBAR2Application';break; //No I18N
				case 'nfa.cloudInterface.appGroup'	: //NO I18N
				case 'nfa.AppGrp'					: 	widgetType = 'AppGrp';break; //No I18N
				case 'wlc.ssidsnap.clients'					: 								//NO I18N
				case 'nfa.wlcsnap.clients'					: 								//NO I18N
				case 'wlc.apmacsnap.clients'				: 	widgetType = ($("#param_"+snapID+"_ReportType").val() == "topIPHost") ? "ClientIP":"ClientMAC"; break; //NO I18N
				case 'wlc.clientsnap.ssid'					: 								//NO I18N
				case 'nfa.wlcsnap.ssid'						: 								//NO I18N 
				case 'wlc.apmacsnap.ssid'					: 	widgetType = "SSID"; break; //NO I18N
				case 'wlc.ssidgroup.accesspoint'			: 								//NO I18N 
				case 'ssid.client.apmac'					: 								//NO I18N
				case 'nfa.wlcsnap.apmac'					: 	widgetType = "accessPoint"; break; //NO I18N
				case 'ssid.client.apps'						: 								//NO I18N
				case 'nfa.wlcsnap.apps'						: 								//NO I18N 
				case 'wlc.apmacsnap.apps'					: 	widgetType = "Application"; break; //NO I18N
				case 'ssid.client.qos'						: 								//NO I18N
				case 'nfa.wlcsnap.qos'						: 								//NO I18N 
				case 'wlc.apmacsnap.qos'					: 	widgetType = "QoS"; break; //NO I18N
				case 'webclinet.inventory.wlc.clientmac'	: 	widgetType = "ClientMAC"; break; //NO I18N
				case 'NFAWidget.CliIP'						: 	widgetType = "ClientIP"; break; //NO I18N
			}
			OPMClient.InventoryDeviceDetailsController.convRowData = {};
			OPMClient.InventoryDeviceDetailsController.showGraphAll = true;
			OPMClient.InventoryDeviceDetailsController.resolveDNS = $("#param_"+snapID+"_ResolveDNS").prop("checked"); //NO I18N
			OPMClient.InventoryDeviceDetailsController.deviceName = deviceID;
			OPMClient.InventoryDeviceDetailsController.widgetType = widgetType;
			OPMClient.InventoryDeviceDetailsController.snapId = snapID;
			if(snapWidgetName === "opm.interface.topconv"){
				OPMClient.InventoryDeviceDetailsController.groupBy = $("#param_"+snapID+"_GroupBy").val(); //No I18N
			}
			if(wlcSnapType.contains(OPMClient.InventoryDeviceDetailsController.inventorysnapType) || deviceBasicDetails.parentCategory === "WirelessAccessPoint"){

				OPMClient.InventoryDeviceDetailsController.Data = $('input:radio[name=type_'+snapID+']:checked').val(); //No I18N
			}else if(this.snapshotObj.isNFG){
				OPMClient.InventoryDeviceDetailsController.Data = "IN"; //NO I18N
			}else{
				OPMClient.InventoryDeviceDetailsController.Data = $('input:radio[name=Data_'+snapID+']:checked').val(); //No I18N
			}
			redirectSnapShot('IndividualGraph'); //No I18N
		},
		searchDevInterface: function(gridID){
			searchDevInterface(gridID,this.get("widgetData"));
		},
		opm_MerakiAPMonitoringAction:function(wId,action,isMulti,device)
		{
			opm_MerakiAPMonitoringAction(wId,action,isMulti,device);
		},
		configChildElementAlertsThresholds:function(isMultiple,gridID,moId,instanceName){
				configChildElementAlertsThresholds(isMultiple,gridID,moId,instanceName);
		},
		configEdgeChildElementAlertsThresholds:function(isMultiple,gridID,moId,instanceName){
			configChildElementAlertsThresholds(isMultiple,gridID,moId,instanceName,false);
		},
	    opm_SDWANDeviceAdvancedMonState:function(wId,action,isMulti,device,elemType){
			opm_SDWANDeviceMonitoringAction(wId,action,isMulti,device,elemType);
		},
		doManageUnManageSDWanChilds:function(isMultiple,gridID,manage,elemType){
			doManageUnManageSDWanChilds(isMultiple,gridID,manage,elemType);
		},
		suppressChildElements:function(gridID,action,elemType){
			suppressChildElements(gridID,action,elemType);
		},
		deleteOpUtilsAlert: function(widgetid,widgetIndex){
			deleteOpUtilsAlerts(widgetid,widgetIndex)
		},
		deleteOpUtilsSubnets: function(widgetid,widgetIndex){
			deleteSubnets(widgetid,widgetIndex)
		},
		scanOpUtilsSubnets: function(widgetid,widgetIndex){
			scanSubnets(widgetid,widgetIndex)
		},
		deleteAllDiscoveredSubnets: function(){
			var cbmethod = function(response){
		        if(response.status === "Failure"){
		            opm_infoMsgs("errorMsg",response.message); //No I18N
		        }else{
		            reloadSnapshotPage();
		            OPMClient.Inventory.getIPAMSPMTreeView("IPAM");//NO I18N
		            opm_infoMsgs("successMsg",Ember.I18n.t('opu.ipam.SUBNET_DELETED',this)); //No I18N
		        }
		    }
		    if(confirm(Ember.I18n.t('opu.tree.ipam.DELETE_ALL_DISCOVERED_SUBNET_CONFORM',this))){
		        var url =window.OPM.apiUrlPattern + "/ipam/deleteSubnets";//NO I18N
		        opm_ajaxPostRequestWithMsg(url, {"groupId":"GROUP_1"}, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), cbmethod);//No I18N
		    }
		},
		approveSubnets: function(widgetid,widgetIndex){
			bulkApproveSubnets(widgetid,widgetIndex)
		},
		deleteOpUtilsDHCP: function(widgetid,widgetIndex){
			deleteDHCP(widgetid,widgetIndex)
		},
		deleteOpUtilsDNS: function(widgetid,widgetIndex){
			deleteDNS(widgetid,widgetIndex)
		},
		deleteOpUtilsSwitches: function(widgetid,widgetIndex){
			deleteSwitches(widgetid,widgetIndex)
		},
		editOpUtilsSwitches: function(widgetid,widgetIndex){
			editSwitches(widgetid,widgetIndex)
		},
		scanOpUtilsSwitches: function(widgetid,widgetIndex){
			scanSwitches(widgetid,widgetIndex)
			//unselected switches from list view.
			var tableid = "#opm_Devices";//NO I18N
			if(OPMClient.ApplicationController.currentPath !== "Inventory.List.OpUtils.Sub.index")
			{
				tableid = "#opm_DeviceSnapList"+this.get('widgetData.id');//NO I18N	
			}
			$(tableid).jqGrid("resetSelection");
		},
		exportIPAMStructure: function(){
			exportIPAMStructureReport();
		},
		exportIPAMReport: function(what,how,widgetDataId){
			exportIPAMReport(what,how,widgetDataId);
		},
		exportSPMReport: function(what,how,widgetid,widgetIndex){
			exportSPMReport(what,how,widgetid,widgetIndex);
		},
		scanOpUtilsDHCP: function(widgetid,widgetIndex){
			scanDHCP(widgetid,widgetIndex)
		},
		scanOpUtilsDNS: function(widgetid,widgetIndex){
			scanDNS(widgetid,widgetIndex)
		},
		deleteOpUtilsIPV6Subnet: function(widgetid,widgetIndex){
			deleteOpUtilsIPV6Subnet(widgetid,widgetIndex)
		},
		scanOpUtilsIPV6Subnet: function(widgetid,widgetIndex){
			scanOpUtilsIPV6Subnet(widgetid,widgetIndex)
		},
		discoverOpUtilsRogueDHCP: function(widgetid,widgetIndex){
			discoverRogueDHCP();
		},
		prevPage: function(){
			var i=j=0;
			for(j=0;j<this.widgetData.parameters.length;j++){
				if(this.widgetData.parameters[j].param==="page"){
					i=j;
					break;
				}
			}
			if(parseInt(this.widgetData.parameters[i].value)-1<=0){
				$(".oputilsSnapshot i.opubutton.icon-left-open.nextPrevBdrColor.OpMToolTip").addClass("disabled");
				return false;
			}
			$(".oputilsSnapshot i.opubutton.icon-left-open.nextPrevBdrColor.OpMToolTip").removeClass("disabled");
			this.widgetData.parameters[i].value=parseInt(this.widgetData.parameters[i].value)-1;
			this.sendAction('action','reload');
		},
		nextPage: function(){
			var i=j=0;
			for(j=0;j<this.widgetData.parameters.length;j++){
				if(this.widgetData.parameters[j].param==="page"){
					i=j;
					break;
				}
			}
			if(parseInt(this.widgetData.parameters[i].value)+1>this.widgetData.pageCount){
				$(".oputilsSnapshot i.opubutton.icon-right-open.nextPrevBdrColor.OpMToolTip").addClass("disabled");
				return false;
			}
			$(".oputilsSnapshot i.opubutton.icon-right-open.nextPrevBdrColor.OpMToolTip").removeClass("disabled");
			this.widgetData.parameters[i].value=parseInt(this.widgetData.parameters[i].value)+1;
			this.sendAction('action','reload');
		},
		togglesearchIPs: function(){
			this.toggleValue = !this.toggleValue
			ToggleSearch(this.toggleValue,this.widgetData.gridTableId);
		},
		redirectToAssociate:function(){
			if(this.snapshotObj.type === "Unknown"){
				opm_transitionToParentRoute("Inventory.Device.AssociateDT");//No I18N
			}else{
				opm_transitionToParentRoute("Inventory.Device.AssociateDials");//No I18N
			}
		},
		searchTenantApps: function(appName)
		{
			var elementId = $("#tenantSearch_"+appName);
			if(elementId.hasClass("displayNone")){
				elementId.removeClass("displayNone").addClass("displayBlock");	//No I18n
				elementId.focus();
			}else{
				elementId.removeClass("displayBlock").addClass("displayNone");	//No I18n	
			}
			elementId.keyup(function () {
				var searchString = $(this).val();
		    	searchTenantAppsList(searchString,appName);
			});
		},
		redirectToDT:function(){
			opm_transitionToParentRoute("Inventory.Device.AssociateDT");//No I18N
		},
		redirectToAssoDials:function(){
			opm_transitionToParentRoute("Inventory.Device.AssociateDials");//No I18N
		},
		rediscover_opmWLCAPs:function(deviceName)
		{
			var url = window.OPM.apiUrlPattern + '/v2/wireless/reDiscoverAPs';//NO I18N
			var callBackFunc = function(jsonData){
				showMessage(jsonData);
				setTimeout(function(){
					var $apIcon = $(".dashboardWidgetIcons").find("i[data-name='opm.wlc.accessPoints']");//No I18N
					if(!$apIcon.length){ $apIcon = $(".dashboardWidgetIcons").find("i[data-name='opm.ngfw.accessPoints']"); }//No I18N
					$apIcon.trigger("click");//No I18N
				},1000);
			}
			opm_ajaxPostRequestWithMsg(url,{'deviceName':deviceName},'',callBackFunc); //No I18N
		},
		rediscover_opmRougeSSIDs:function(deviceName)
		{
			var url = window.OPM.apiUrlPattern + '/v2/wireless/reDiscoverRogueSSIDs';//NO I18N
			var callBackFunc = function(jsonData){
				showMessage(jsonData);
				setTimeout(function(){
					var $rogueIcon = $(".dashboardWidgetIcons").find("i[data-name='opm.wlc.rougeaps']");//No I18N
					if(!$rogueIcon.length){ $rogueIcon = $(".dashboardWidgetIcons").find("i[data-name='opm.ngfw.rogueSSID']"); }//No I18N
					$rogueIcon.trigger("click");//No I18N
				},1000);
			}
			opm_ajaxPostRequestWithMsg(url,{'deviceName':deviceName},'',callBackFunc); //No I18N

		},
		rediscover_opmWAPClients:function(deviceName)
		{
			var url = window.OPM.apiUrlPattern + '/v2/wireless/reDiscoverClients';//NO I18N
			var callBackFunc = function(jsonData){
				showMessage(jsonData);
				setTimeout(function(){
					var $clientsIcon = $(".dashboardWidgetIcons").find("i[data-name='opm.wlc.clients']");//No I18N
					if(!$clientsIcon.length){ $clientsIcon = $(".dashboardWidgetIcons").find("i[data-name='opm.ngfw.clients']"); }//No I18N
					$clientsIcon.trigger("click");//No I18N
				},1000);
			}
			opm_ajaxPostRequestWithMsg(url,{'deviceName':deviceName},'',callBackFunc); //No I18N
		},
		rediscover_MerakiClients: function(deviceName,widgetIndex)
		{
			var url = window.OPM.apiUrlPattern + '/v2/wireless/rediscoverMRClients';//NO I18N
			var callBackFunc = function(jsonData){
				showMessage(jsonData);
				setTimeout(function(){
						reloadSnapWidgets(widgetIndex);
					//$(".dashboardWidgetIcons").find("i[data-name='webclient.opm.meraki.mrclients']").trigger("click");//No I18N
				},1000);
			}
			opm_ajaxPostRequestWithMsg(url,{'deviceName':deviceName},Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),callBackFunc); //No I18N
		},
		rediscover_MerakiSSID: function(deviceName,widgetIndex)
		{
			var url = window.OPM.apiUrlPattern + '/v2/wireless/rediscoverMRSSIDs';//NO I18N
			var callBackFunc = function(jsonData){
				showMessage(jsonData);
				setTimeout(function(){
					reloadSnapWidgets(widgetIndex);
					//$(".dashboardWidgetIcons").find("i[data-name='webclient.opm.meraki.mrssids']").trigger("click");//No I18N
				},1000);
			}
			opm_ajaxPostRequestWithMsg(url,{'deviceName':deviceName},Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),callBackFunc); //No I18N
		},
		discoverFWAVPN: function()
		{
			opm_transitionToParentRoute("Inventory.Device.DiscoverVPN"); //No I18N
		},
		reloadVPNSummary: function()
		{
			var discoverVPNCallBack = function()
			{
				var callBackFn = function(response){
                    showMessage(response);
                    deviceSlideOut(2);
                    opm_transitionToParentRoute("Inventory.Device");//No I18N
                    if(response.result !== undefined){
                        $('.dashboardWidgetIcons .widget_refresh[data-name="webclient.opm.reports.vpnSummary"]').click(); //No I18n
                    }
                }
                opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+'/v2/discovery/discoverPaloAltoVPNs',{'deviceName':OPMClient.InventoryDeviceDetailsController.deviceName,'credentialName':$('#vpn_RestApiCredentialDrp').val()},Ember.I18n.t('webclient.nfa.diskSpaceInfo.waitMsg',this),callBackFn); //No I18n
			}
			opmConfirm(Ember.I18n.t('fwa.rulemgmt.alert'),Ember.I18n.t('opm.fwadevice.rediscover.vpn.confirm',this),'',discoverVPNCallBack,Ember.I18n.t('webclient.restapi.copy.okBtnText'),'',Ember.I18n.t('webclient.topo.objectdetails.managed.no'),'','dialogStyle2',true,false,'',false,false);//No I18N
		},
		filterMerakiDevices:function()
		{
			self=this;
			var data = {"deviceName":OPMClient.InventoryDeviceDetailsController.deviceName}; //No I18N
			var selNetwork = $("#param_"+this.widgetData.id+"_mnetw").val();
			var mModel = getMerakiDeviceModel(this.widgetData.name);
			var url = window.OPM.apiUrlPattern + '/v2/wireless/get'+mModel+'Devices';//NO I18N
			var apFilter= $("#param_"+this.widgetData.id+"_MerakiAP").val();
			if(apFilter === undefined) {
				apFilter='Active';//NO I18N
			}
			if(selNetwork !== undefined && selNetwork !== ""){
				data.networkMOName = selNetwork;
			}
			data.filterBy=apFilter;
			var callBackFunc = function(jsonData){	
  				self.set('widgetData.apiData',jsonData); //No I18N

  				setTimeout(function(){
				$("#param_"+self.widgetData.id+"_mnetw").val(selNetwork).select2();
				$("#param_"+self.widgetData.id+"_MerakiAP").val(apFilter).select2();
			 	},500);
			}
			opm_ajaxGetResponseWithMsg(url,data,'',callBackFunc); //No I18N
		},
		nxClusterChanged:function(){
			var selectedCluster = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType === "Nutanix-PrismCentral" ? $("#param_"+this.widgetData.id+"_nxCluster").val() : OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.deviceName;//No I18N
			if(selectedCluster !== undefined && selectedCluster !== ""){
				var component = window.OPM.nxClusterGraphComponents && window.OPM.nxClusterGraphComponents[this.widgetData.id];
				if(component !== undefined){
					component.set('widgetData.nxSelectedCluster',selectedCluster);//No I18N
				}
				opm_loadNxClusterMonitors(selectedCluster,this.widgetData.id);
			}
		},
		nxClusterMonitorChanged:function(){
			var selectedMonitor = $("#param_"+this.widgetData.id+"_nxClusterMonitor").val();//No I18N
			var component = window.OPM.nxClusterGraphComponents && window.OPM.nxClusterGraphComponents[this.widgetData.id];
			if(component !== undefined && selectedMonitor !== undefined && selectedMonitor !== ""){
				component.set('widgetData.nxSelectedMonitor',selectedMonitor);//No I18N
			}
			opm_refreshNxClusterGraph(this.widgetData.id);
		},modifyDHCPFilter: function(widgetid,actionFrom){
			OPMClient.Inventory.oputilsBlockUnblockMACFromNetwork(widgetid,actionFrom);
		},
		removeDHCPFilter: function(widgetid,actionFrom){
			oputilsDHCPFilterActions(widgetid,actionFrom,"removeMAC"); //No I18N
		},
		syncDHCPFilterData: function(widgetid,actionFrom){
            		oputilsDHCPFilterActions(widgetid,actionFrom,"allFilters"); //No I18N
        	},
		rediscover_opmRoutingTable:function(moid,widgetIndex){
			opm_rediscoverRoutingTabledata(moid,widgetIndex);
		},
		syncDHCPPolicyData: function(widgetid,actionFrom){
            oputilsDHCPPolicyActions(widgetid,actionFrom,"allPolicies"); //No I18N
        },
        removeDHCPPolicyData: function(widgetid,actionFrom){
            oputilsDHCPPolicyActions(widgetid,actionFrom,"removePolicy"); //No I18N
        },
        syncDHCPSuperscopeData: function(widgetid,actionFrom){
            oputilsDHCPSuperscopeActions(widgetid,actionFrom,"allSuperscopes"); //No I18N
        },
		opm_supressRoutingAlarm:function(isSuppress,widgetIndex){
			var supressVal =  isSuppress === "true" ? true:false; //No I18N
			 var moId = OPMClient.InventoryDeviceDetailsController.moID;
			var url = window.OPM.apiUrlPattern + '/v2/device/suppressRoutingAlarm'; //No I18N
			var neighbourID = [];
			var gridID = ("opm_DeviceSnapList"+widgetIndex) //No I18N
			var selRowIds = $('#'+gridID).jqGrid('getGridParam','selarrrow'); //No I18N
			if(selRowIds.length > 0){
				if(selRowIds !== undefined){
					$.each(selRowIds, function(){
						var id = $('#'+gridID).jqGrid('getCell',this,'neighbourID'); //No I18N
						neighbourID.push(id);
					});
				}
				var response = opm_ajaxPostMethod(url,{'moid':moId,'suppressAlarm':supressVal,'neighbourID':JSON.stringify(neighbourID)}) //No I18N
				if(response.result !== undefined)
				{
					opm_infoMsgs('successMsg',response.result.message); //No I18N
					setTimeout(function(){
						reloadSnapWidgetsByWidgetName("opm.device.ipRoutingneighbour"); //No I18N
					},700);
				} else {
					opm_infoMsgs('errorMsg',escapeHTML(response.error.message)); //No I18N
				}

			}else{
				opmAlertPopUp("", Ember.I18n.t("jsp.commonstr.SelAtleastOneRecord", this),500); //NO I18N
			}
		},
		rediscover_opmRoutingNeighbours:function(deviceName,widgetIndex){
			var devName = OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryDeviceDetailsController.set("RoutingProtocolThreshods",true);//No I18N
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+'/ChildElementsAlertThresholds'; //No I18N
		},
		suppressMonitorAlarm: function(widgetData) {
			supressMonitorAlarm(widgetData, widgetData.gridTableId);
		},
		unSuppressMonitorAlarm: function(widgetData) {
			opmConfirm(Ember.I18n.t('webclient.opm.perf.snapshot.ipmi.unsuppress.alarms'),Ember.I18n.t('webclient.inventory.snapshot.unsuppress.confirm'),'',function() { // No I18N
				unSuppressMonitorAlarm(widgetData, widgetData.gridTableId)
			},Ember.I18n.t('webclient.agent.confirm'),"",Ember.I18n.t('webclient.action.cancel'),'','dialogStyle2',true,false,'hideCloseInUIDIalog',false,false) // No I18N
		},
		configureVmWareThresholds:function(deviceName,widgetIndex) {
			var devName = OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryDeviceDetailsController.set("configureVmWareThresholds",true);//No I18N
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+'/ChildElementsAlertThresholds'; //No I18N
		}
	},
	markAsObserver: function(){
		if(this.markAsActionValue != undefined){
			var gridID = ("opm_DeviceSnapList"+this.get('widgetData.id')) //No I18N
			var selDevice=getEmberSelectedRows(gridID,'resource-id'); //No I18N
			var data={};
			if(selDevice.length>=1){
		        if(this.markAsActionValue=="Trusted"){
		        	data.RESOURCEID=selDevice;
		        	var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/rogue/markAsTrusted' ,data);//No I18N
		        }else if(this.markAsActionValue=="Guest"){ //No I18N
		        	OPMClient.ApplicationController.set("gridIdData",{selDev: selDevice,gridData: this.widgetData}); //No I18N
					OPMClient.Inventory.oputilsRogueMoveGuest();
		        }else if(this.markAsActionValue=="Rogue"){ //No I18N
		        	data.RESOURCEID=selDevice;
		        	var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/rogue/markAsRogue' ,data);//No I18N
		        }else if(this.markAsActionValue==Ember.I18n.t("opu.views.USED",this) || this.markAsActionValue==Ember.I18n.t("opu.views.AVAILABLE",this) || this.markAsActionValue==Ember.I18n.t("opu.views.TRANSIENT",this)){//No I18N
					var result = confirm(Ember.I18n.t("opu.ipam.reservation.field.popup.msg",this));//No I18N
					if(result){
						rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ipam/updateIPState', {"markAs":this.markAsActionValue,"RESOURCEID":selDevice});//No I18N
					}
					else{
						return false;
					}
				}
		        else{
		        	rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/ipam/updateIPState', {"markAs":this.markAsActionValue,"RESOURCEID":selDevice});//No I18N
		        }
				if(rsp != null && rsp != undefined){
					if(rsp.status=="Success"){
						$("#"+gridID).jqGrid('resetSelection');
						var pagecount = $("#"+gridID).getGridParam('page');
						$("#"+gridID).trigger("reloadGrid", [{current:true, page:pagecount}]);
						opm_infoMsgs("successMsg",Ember.I18n.t('fwa.compliance.Update_Successful',this)); //No I18N
						// reloadSnapWidgets(this.widgetData.snapIndex)
					}else{
						opm_infoMsgs("errorMsg",rsp.message); //No I18N
					}
				}
		    }else{
		    	opm_infoMsgs("infoMsg",Ember.I18n.t('opu.view.AT_LEAST_ONE_IP',this)); //No I18N
		    	// reloadSnapWidgets(this.widgetData.snapIndex);
		    	// $('#markAsAction').prop('selectedIndex',0);
		    	// this.set('markAsActionValue',"--");//No I18N
		    	// $("#markAsAction").select2();
		    }
		    $('#markAsAction').select2('close');
		}
	}.observes('markAsGroupValue'), //No I18N
	filterValueObserver: function(){
		$('#filterByAction').select2('close');
		this.set('widgetData.reloadTrigger',true);//No I18N
	}.observes('widgetData.parameters.@each.value'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		$('#markAsAction').select2('close');
		$('#filterByAction').select2('close');
		OPMClient.InventoryDeviceDetailsController.set('isMerakiCtlrDevs',false);//No I18N
		OPMClient.InventoryDeviceDetailsController.set('merakiDevNets',[]);//No I18N
		OPMClient.InventoryDeviceDetailsController.set('showWlcSiteFilter',false);//No I18N
		// NOTE: wlcAPSites / wlcSelectedSite / wlcSitesFetchedMoID are intentionally
		// NOT reset here. They are device-scoped (keyed by moID) and must persist
		// across WLC tab switches (AP, SSID, Rogue, Clients). They get refreshed
		// automatically when the user opens a different device's snapshot.
	}
});
OPMClient.OpmCommonGraphComponent = Ember.Component.extend({
	templateName: "components/opm-common-graph",
	didInsertElement: function(){
		var graphParams = this.get('graphParams');
		if(graphParams != undefined)
		{
			if(graphParams.graphType == 'area')
			{
				opm_loadGraph(graphParams);
			}
			else if(graphParams.graphType == 'pie')
			{
				opm_loadPieGraph(graphParams);
			} else {
				opm_loadBarGraph(graphParams);
			}
		}
	},
	willDestroyElement: function(){
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
	}	
});

OPMClient.TimeFilterSelectComponent = Ember.Component.extend({
	templateName: "components/Time-Filter-Select",//No I18N
	didInsertElement: function(){
		var self = this;
		var filterBy = [
			{'value': 'twelvehours', 'label': Ember.I18n.t('webclient.reports.timeframe.last12hrs',this)}, //No I18N
			{'value': 'twfourhours', 'label': Ember.I18n.t('webclient.reports.timeframe.last24hrs',this)}, //No I18N
			{'value': 'Today', 'label': Ember.I18n.t('webclient.reports.timeframe.today',this)}, //No I18N
			{'value': 'Yesterday', 'label': Ember.I18n.t('webclient.reports.timeframe.yesterday',this)}, //No I18N
			{'value': 'Last_7_Days', 'label':  Ember.I18n.t('webclient.reports.timeframe.last7days',this)}, //No I18N
			{'value': 'Last_30_Days', 'label': Ember.I18n.t('webclient.reports.timeframe.last30days',this)}, //No I18N
			{'value': 'custom', 'label': Ember.I18n.t('webclient.reports.timeframe.custom',this)}//No I18N
		]
		self.set('controller.timeFrame', filterBy); //No I18N
		$('#'+self.get('selectId')).select2();
		if(self.get('selectedValue')) {
			self.set('controller.defaultValue', self.get('selectedValue')); //No I18N
		}
		$('#'+self.get('selectId')).on('select2:select', function() {
			if($(this).val() == "custom") {
				self.notifyPropertyChange('controller.defaultValue') //No I18N
			}
		});
		},
		actions: {
			saveCustomTime : function() {
				var self = this;
				var time = self.get('controller.defaultValue');
				var startDate = $('#startat').val();
				var endDate = $('#endat').val();
				var startHrs = $('#from_hrs_sel').val();
				var endHrs = $('#to_hrs_sel').val();
				var fieldsToValidate = {'empty':['startat', 'endat'],'dateCheck':['startat','endat'] ,'isDateTimeFuture':[{date:"startat", time: "from_hrs_sel"},{date:"endat", time: "to_hrs_sel"}]}//No I18N
				var isValid = opm_validateFields(fieldsToValidate);
				if(!isValid){
					return isValid;
				}
				var custom = {};
				custom.startTime = startDate;
				custom.endTime = endDate;
				custom.startHour = startHrs;
				custom.endHour = endHrs;
				custom.time = time;
				self.get('parentView').send(self.get('actionName'), custom);
				slideOutWithId(self.get("controller.customTimeDetails").id);
				setTimeout (function() {
					$('#'+self.get('selectId')).val(null); //Custom option should be reset for multiple select
					self.set("controller.customTimeDetails",undefined);//No I18N
				},500);
			},
			cancelCustomTimeSlide: function() {
				var self = this;
				$('#'+self.get('selectId')).val(self.get('selectedValue')).change();
				self.set('controller.defaultValue', self.get('selectedValue')); //No I18N
				setTimeout (function() {
					self.set("controller.customTimeDetails",undefined);//No I18N
				},500);
			}	
		},
		timePeriodObserver:function()
		{
			var self = this;
			var currentTime = self.get('controller.defaultValue');
			if(currentTime == "custom") { 
				var customTimeDetails = {};
				customTimeDetails.id = "report_apiaccess_customTime";
				customTimeDetails.componentName = "OPMClient.CustomTimeReportsComponent";//No I18N
				customTimeDetails.slideHeader = Ember.I18n.t("webclient.Custom.Time");//No I18N
				customTimeDetails.isSmall = true;
				customTimeDetails.actionName = "cancelCustomTimeSlide";//No I18N
				customTimeDetails.parentObj = self;
				self.set("controller.customTimeDetails",customTimeDetails);//No I18N
			} else {
				self.get('parentView').send(self.get('actionName'), self.get('controller.defaultValue'));
			}
		}.observes('controller.defaultValue') //No I18N
	});

//Need to be removed
OPMClient.OpmCommonHardwareGraphComponent = Ember.Component.extend({
	templateName: "components/opm-common-hardware-graph",//No I18N
	didInsertElement: function(){
		var sensorData = this.get('sensorData');
		setTimeout(function(){ 
		harwarewidgetData(sensorData.leftName,sensorData);
	}, sensorData.delayRender);


	},
	willDestroyElement: function(){
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
	}	
});





OPMClient.OpmCommonSemidonutComponent = Ember.Component.extend({
	classNames:['widthAuto'],
	didInsertElement: function(){
		var array_element = this.get('obj');
		nfa_drawSemiDonut(array_element.snapHolderId,array_element.chartDataValues)//No I18N
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmCommonMeterComponent = Ember.Component.extend({
	classNames:['widthAuto','commonMeter'], //No I18N
	didInsertElement: function(){
		var array_element = this.get('obj');
		if(this.get('obj.dialClickEnabled') == undefined && this.get('obj.dialEditEnabled') == undefined){
			$('#'+array_element.snapHolderId).removeClass("pointer");
		}
		if(array_element.dialType == "meter")
		{
			opm_drawDialChart(array_element.dialDivName,array_element.dialValue,array_element.dialColor);
		} 
	},
	actions:{
		dialClick: function(e){
			if(this.get('obj.dialClickEnabled')===true){
				var fn = this.get('obj.dialClickFunc');
				var params = this.get('obj.dialClickParams');
				if(params!==undefined){
					fn(params);
				}
				else{
					fn();
				}
			}
		},
		dialEdit: function(){
			if(this.get('obj.dialEditEnabled')===true){
				var fn = this.get('obj.dialEditFunc');
				var params = this.get('obj.dialEditParams');
				if(params!==undefined){
					fn(params);
				}
				else{
					fn();
				}
			}
		},
		startRealTimeMonitor: function(){
			generateRealTimeMonitorsforDials(this.get('obj.realTimeParams'));//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmSnapshotDialMeterComponent = Ember.Component.extend({
	classNames:['singleBlock'], //No I18N
	didInsertElement: function(){
		var array_element = this.get('obj');
		if(this.get('obj.dialClickEnabled') == undefined && this.get('obj.dialEditEnabled') == undefined){
			$('#'+array_element.snapHolderId).removeClass("pointer");
		}
		if(array_element.dialType == "meter")
		{
			opm_drawDialChart(array_element.dialDivName,array_element.dialValue,array_element.dialColor);
		} 	
	},
	actions:{
		dialClick: function(e){
			if(this.get('obj.dialClickEnabled')===true){
				var fn = this.get('obj.dialClickFunc');
				var params = this.get('obj.dialClickParams');
				if(params!==undefined){
					fn(params);
				}
				else{
					fn();
				}
			}
		},
		dialEdit: function(){
			if(this.get('obj.dialEditEnabled')===true){
				var fn = this.get('obj.dialEditFunc');
				var params = this.get('obj.dialEditParams');
				if(params!==undefined){
					fn(params);
				}
				else{
					fn();
				}
			}
		},
		startRealTimeMonitor: function(){
			var protocol = this.get('obj.protocol');
			protocol = protocol ? protocol.toLowerCase() : protocol;
			if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring && (protocol == 'wmi' || protocol == 'snmp'))
			{
				opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.agent.monitors.notsupported')); //No I18N 
			}
			else
			{
				generateRealTimeMonitorsforDials(this.get('obj.realTimeParams'));//No I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmGridComponent = Ember.Component.extend({
	templateName: "components/opm-grid",
	showGrid:false,
	gridData:{},
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		var gridCallBack = function(gridID,paramsObj){
			var gridH = $('#gbox_'+gridID).height()+30;
			if(isjqGridHeaderBodyHandledWidget(paramsObj.self.get('widgetData').name)){
				var dataCount = paramsObj.self.get('widgetData').apiData.length;
				var cellHeight = (['opm.device.vsan','opm.device.vxrail.chassis','opm.device.vxrail.hardware'].contains(paramsObj.self.get('widgetData').name)) ? 35 : 29;//No I18N
				var multipler = 4;
				if(dataCount > 10){
					dataCount = 11;
					if(cellHeight === 35){
						multipler = 3.5;
					}
				}
				gridH = (cellHeight*dataCount) + (60+(dataCount*multipler));
			}
			var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
			//var el = $('.grid-stack-item[data-widget-id="'+paramsObj.self.widgetData.id+'"]');
			if(cellCount===3){
				cellCount=4;
			}
			if(window.OPM.isNewSnapshotPage){
				cellCount = Math.ceil((gridH+42)/22);
			}
			
			if($(".icon-search").is(":visible") && cellCount > 2 )
			{
					cellCount = cellCount +1;
			}
			if(paramsObj.self.get('widgetData.name') === "opm.device.bgpmonitors" || paramsObj.self.get('widgetData.name') === "opm.merakimx.wanlink" ||paramsObj.self.get('widgetData.name') === "opm.device.ipRoutingneighbour") {
				cellCount = cellCount+2;
			}
			paramsObj.self.set('widgetData.sizey',cellCount);//No I18N

			if(paramsObj.self.get('widgetData.gridReload')){//No I18N
				
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
				paramsObj.self.set('widgetData.gridReload',false);//No I18N
			}
			//VM filter reloads the grid locally with a different row count, so re-layout the widgets below to avoid overlap.
			else if(['opm.device.vmwarevms', 'opm.device.nutanix.vms'].includes(paramsObj.self.get('widgetData.name'))){//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			}

			if(paramsObj.self.get('widgetData.name') === "opm.devicegrouping.Alarms" || paramsObj.self.get('widgetData.name') === "opm.grouping.problems")
			{
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			}
				
			//window.OPM.snapgridstack.pushWidget(el,null,cellCount);
			if(paramsObj.self.get('widgetData.name') === "opu.ipam.dhcpscope"){//No I18N
				opm_customTooltip();	
			}
		};
		var opugridCallBack = function(gridID,paramsObj){
			var gridH = $('#gbox_'+gridID).height()+30;
			var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+14));
			if(cellCount<=5){
				cellCount=6;
			}
			paramsObj.self.set('widgetData.sizey',cellCount+1); //No I18N
			if(paramsObj.self.get('widgetData.name') === "opu.ipam.dhcpscope"){
				opm_customTooltip();	
			}
			opUtilsIPToolTip();
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			
		};
		var jsonData = this.get('widgetData.apiData');
		var snapDetails = self.get('widgetData');
		// Validate this for NDM Snapshot page.
		if (jsonData.gridData && jsonData.rowData) {
			if (!snapDetails.snapshotData.colModelList || !snapDetails.snapshotData.colNamesList) {
				snapDetails.snapshotData.colNamesList = jsonData.gridData.colNamesList;
				snapDetails.snapshotData.colModelList = jsonData.gridData.colModelList;
				snapDetails.snapshotData.gridActions = jsonData.gridData.gridActions;
			}
		}
		
		if(!snapDetails.snapid) {
			snapDetails.snapid = currentWidgetData.widgetId;
		}

		self.set('widgetData.isIPSLATimeFrame',false);//No I18N
		self.set('showSNMPFailReason',false);//No I18N
		self.set('showAgentIntfFailureReason',false);//No I18N
		self.set('showSNMPNotConfigInfo',false);//No I18N
		self.set('showAPMPluginInstallAD',false);//No I18n
		self.set('widgetData.hideWidget',false);//No I18N
		if(jsonData!==null) {
			if(snapDetails.name!==undefined && snapDetails.name === "opm.device.bgpmonitors") {
				if(jsonData.error!==undefined) {
					self.set('widgetData.hideWidget',true);//No I18N
				}
			}
			//To hide widget if no data is availables
			if(snapDetails.name!==undefined && (snapDetails.name === "opm.device.ipRoutingtable" || snapDetails.name === "opm.device.ipRoutingneighbour" || snapDetails.name === "opm.device.ipaddressTable") && (jsonData.error!==undefined || jsonData.length <= 0)) {
				self.set('widgetData.hideWidget',true);//No I18N
			}
			var nfaExpandView = (currentWidgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
			var defaultOptions = {
				minRowsPerPage: (nfaExpandView)?50:10,
				isSnapshotGrid: true,
				snapId: currentWidgetData.id,
				snapIndex:this.snapIndex,
				reload: false,
				pagination: nfaExpandView
			};
			// Grid Default sort by col handled.
			if(snapDetails.snapshotData.sortCol!==undefined) {
				defaultOptions.sortName = snapDetails.snapshotData.sortCol;
				if(snapDetails.snapshotData.sortCol!==undefined) {
					defaultOptions.sortOrder = snapDetails.snapshotData.sortOrder;
				} else {
					defaultOptions.sortOrder = "asc"; //No I18N
				}
			}

			if(['FlowWLC','FlowAPMAC','FlowAccessPointGroup','FlowSSIDGroup'].contains(OPMClient.InventoryDeviceDetailsController.inventorysnapType) || (OPMClient.InventoryDeviceDetailsController.inventorysnapType==="MonitoringDevice" && deviceBasicDetails.parentCategory==="WirelessAccessPoint")) {
				defaultOptions.reportType=jsonData.reportType;
			}
			if(snapDetails.apiurl.indexOf("/api/json/v2/device/getApplicationAlarmData") >= 0 )
			{
				var wname = currentWidgetData.parameters[0].value;
				var alarmText = wname == 'AD' ? Ember.I18n.t("webclient.reports.createreport.ad",this) : Ember.I18n.t("webclient.tab.exchange",this); //No I18n
				alarmText += "  " +  Ember.I18n.t("webclient.devices.dashboard.applicationMonitorHasProblems",this); //No I18n
				alarmText += "  " + (jsonData.length || 0) + " " + Ember.I18n.t("webclient.devices.mssqldashboard.appMonHasProblems1",this); //No I18n
				self.set('widgetData.AlarmText','[ '+alarmText+' ]');//No I18N
			}
			if(snapDetails.apiurl.indexOf("/api/json/v2/device/getADWidgetDetails") >= 0 )
			{
				jsonData=jsonData[0] || [];
			}
			if(snapDetails.name === "opm.device.interfaces"){//No I18N
				defaultOptions.minRowsPerPage = 50;
				defaultOptions.pagination = true;
				snapDetails.snapshotData.colModelList[1].searchoptions = {value:"0:ALL;5:Clear;3:Attention;2:Trouble;1:Critical;7:Unmanage"}; //No I18n
				if(window.OPM.isAuthorized && !window.OPM.isCentralServer)
				{
					defaultOptions.multiselect = true;
				}
				if(window.OPM.isCentralServer) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['gridAction'],true); //No I18n
				}
				if(window.OPM.isMSPCentral) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['inTraffic'],true); //No I18n
					setHiddenColumn(snapDetails.snapshotData.colModelList,['outTraffic'],true); //No I18n
					setHiddenColumn(snapDetails.snapshotData.colModelList,['inUtil'],true); //No I18n
					setHiddenColumn(snapDetails.snapshotData.colModelList,['outUtil'],true); //No I18n
					setHiddenColumn(snapDetails.snapshotData.colModelList,['gridAction'],true); //No I18n
				}
				if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['pollingStatus'],true); //No I18n
				}
			}
			if(snapDetails.name === "webclient.opm.meraki.mrssids"){//No I18N
				snapDetails.snapshotData.colModelList[3].searchoptions = {value:"0:"+Ember.I18n.t('webclient.maps.allcategs',this)+";"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+":"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+";"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+":"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+""}; //No I18n
				$("#gs_enabled").select2(); //No I18n
			}
			if(snapDetails.name === "webclient.opm.meraki.mrclients" && !window.OPM.isCentralServer && !OPMClient.ApplicationController.isMSPCentralSelected){
				//This api will fetch SNR values alone.
				var refreshIco ="<i class=\"icon-ccw widget_refresh\" title=\""+Ember.I18n.t('webclient.general.reload',this)+"\"onclick=\"updateSNR_MerakiClients('"+snapDetails.snapid+"')\" style=\"color:#8a8e91;cursor:pointer;font-size:14px;\"></i>";
				snapDetails.snapshotData.colNamesList[5] = Ember.I18n.t('webclient.snapshot.wap.signal',this)+" "+refreshIco; //No I18n
				defaultOptions.skipNameEscapeCheck = true;
				if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails.snapshotName==="OPMMerakiMS")
				{
					setHiddenColumn(snapDetails.snapshotData.colModelList,['snr','ssid'],true); //No I18n					
				}
			}
			if(snapDetails.name === "opm.device.bgpmonitors"){//No I18N
				//defaultOptions.minRowsPerPage = 10;
				defaultOptions.pagination = false;
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=true;
				if(window.OPM.isAuthorized && !window.OPM.isCentralServer)
				{
					defaultOptions.multiselect = true;
				}
			}
			if(snapDetails.name === "opm.sdwan.tunnels")
			{
				snapDetails.snapshotData.colNamesList[2] = Ember.I18n.t("weblient.inventory.snapshot.Health")+" <a class='hasHelpCard hasHelpCard4 hasHelpCardHover' style='cursor:pointer;' title='"+Ember.I18n.t('weblient.inventory.snapshot.sdwan.tunnelhealth')+"'></a>"; //NO I18N
			}
			if(snapDetails.name === "opm.ngfw.slas"){//No I18N
				var tunnelStateSearch = ":"+Ember.I18n.t('webclient.maps.allcategs',this)+";UP:"+Ember.I18n.t('webclient.devices.intftypes.up')+";DOWN:"+Ember.I18n.t('webclient.map.down')+";Unknown:"+Ember.I18n.t('webclient.common.unknown'); //No I18N
				snapDetails.snapshotData.colModelList[3].searchoptions = {value:tunnelStateSearch,defaultValue:""}; //No I18N

				/* Keep NGFW SLAs top-tab count in sync with the polled data; records is the total, rows the payload. */
				var ngfwSlaRows = $.isArray(jsonData) ? jsonData : ((jsonData && $.isArray(jsonData.rows)) ? jsonData.rows : null);
				opm_updateNgfwTabCount('slasCount', (jsonData && jsonData.records !== undefined) ? jsonData.records : (ngfwSlaRows ? ngfwSlaRows.length : 0));//No I18N

				defaultOptions.multiselect = true;
				defaultOptions.minRowsPerPage = 50;
				defaultOptions.pagination = true;
				$("#gs_tunnelState").select2();
			}
                        if(snapDetails.name === "opm.sdwan.tunnels" || snapDetails.name==="opm.sdwan.underlayTunnels" || snapDetails.name==="opm.sdwan.wanlinks" || snapDetails.name==="opm.sdwan.simlinks"){//No I18N
				defaultOptions.minRowsPerPage = 100;
				defaultOptions.pagination = true;
				defaultOptions.hideCSV = false;
				defaultOptions.hideExcel = false;
				defaultOptions.sortName ="displayName";//No I18N
				defaultOptions.skipNameEscapeCheck = true;
				defaultOptions.showAll = false;
				if(window.OPM.isAuthorized && !window.OPM.isCentralServer)
				{
					defaultOptions.multiselect = true;
				}
				if(window.OPM.isOPMLiteEdition){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['actions'],true);//No I18N
				}
				self.set('widgetData.sizey',200);//No I18N
			}
			if(snapDetails.name === "opm.sdwan.edges.devices" || snapDetails.name==="opm.sdwan.edgesDevices" || snapDetails.name === "opm.sdwan.controllersummary" || snapDetails.name ==="opm.sdwan.summary" || snapDetails.name==="opm.sdwan.switches" || snapDetails.name==="opm.sdwan.accesspoints" || snapDetails.name==="opm.sdwan.gateways" || snapDetails.name==="opm.pon.oltDevices" || snapDetails.name==="opm.pon.ontDevices"){//No I18N
				defaultOptions.minRowsPerPage = 10;
				defaultOptions.pagination = true;
				defaultOptions.multiselect = false;
				if(snapDetails.name==="opm.sdwan.accesspoints" || snapDetails.name==="opm.pon.oltDevices" || snapDetails.name==="opm.pon.ontDevices")
				{
					defaultOptions.multiselect = true;
				}
				defaultOptions.hideCSV=false;
				defaultOptions.hideExcel=false;
				defaultOptions.sortName ="hostName";//No I18N
			}
			if(snapDetails.name === "opm.sdwan.sites" ||  snapDetails.name === "opm.sdwan.sitesSummary"){
				defaultOptions.minRowsPerPage = 100;
				defaultOptions.pagination = true;
				defaultOptions.multiselect = false;
				defaultOptions.hideCSV=false;
				defaultOptions.hideExcel=false;
				defaultOptions.hideExcel=false;
				defaultOptions.sortName = "siteDisplayName";//No I18N
				defaultOptions.showAll = false;
				defaultOptions.skipNameEscapeCheck = true;
				if(window.OPM.isAuthorized && !window.OPM.isCentralServer)
				{
					defaultOptions.multiselect = true;
				}

				if(window.OPM.isOPMLiteEdition){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['actions'],true);//No I18N
				}
			}
			if(typeof jsonData == 'string')//No I18N
			{
				jsonData = JSON.parse(jsonData);
			}
			var gridData = jsonData;
			if(jsonData.rowData) {
				gridData = jsonData.rowData;
				jsonData = gridData;
			}
			if(jsonData.fanDetails != null) {
				gridData = jsonData.fanDetails;
			}else if(jsonData.showTimeSubTitle) {
				gridData = jsonData.WidgetData;
				self.set('widgetData.isIPSLATimeFrame',true);//No I18N
				self.set('widgetData.timeframe',jsonData.timeframeDisp);//No I18N
			}else if(jsonData.portDetails != null) {
				gridData = jsonData.portDetails;
			} else if(jsonData.psuDetails != null) {
				gridData = jsonData.psuDetails;
			} else if(jsonData.chassisProps != null && jsonData.chassisProps.fanDetails != null) {
				gridData = jsonData.chassisProps.fanDetails;
			} else if(jsonData.chassisProps != null && jsonData.chassisProps.psuDetails != null) {
				gridData = jsonData.chassisProps.psuDetails;
			} else if(jsonData.chassisProps != null && jsonData.chassisProps.serverDetails != null) {
				gridData = jsonData.chassisProps.serverDetails;
			} else if(jsonData.gridData != null) {
				gridData = jsonData.gridData;
			} else if(jsonData.topConv != null) {
				gridData = jsonData.topConv;
			} else if(jsonData.TrafficData != null) {
				gridData = jsonData.TrafficData;
			} else if(jsonData.Data != null) {
				gridData = jsonData.Data; 
			} else if(snapDetails.name == "ipsla.voip.notifprofiles" && jsonData.notificationProfiles != null) {
				gridData = jsonData.notificationProfiles; 
			} else if(jsonData.thresholdVariables != null) {
				gridData = jsonData.thresholdVariables; 
			} else if(jsonData.result != null) {
				gridData = jsonData.result; 
			}else if(jsonData.tableData != null) {
				gridData = jsonData.tableData; 
			}else if(jsonData.Offenders != null) {
				gridData = jsonData.Offenders; 
			}else if(jsonData.Targets != null) {
				gridData = jsonData.Targets; 
			}else if(jsonData.RouterField != null) {
				gridData = jsonData.RouterField; 
			}else if(jsonData.ConnList != null) {
				gridData = jsonData.ConnList; 
			}else if(jsonData.eData != null) {
				gridData = jsonData.eData; 
			}else if(jsonData.data != null) {
				gridData = jsonData.data; 
			}else if(jsonData.resultdata != null) {
				gridData = jsonData.resultdata; 
			}else if(jsonData.resultVector != null) {
				gridData = jsonData.resultVector; 
			}else if(jsonData.MCastRows != null) {
				gridData = jsonData.MCastRows; 
			}else if(jsonData.resultData != null) {
				gridData = jsonData.resultData; 
			}else if(jsonData.rows != null) {
				gridData = jsonData.rows; 
			}else if(snapDetails.name == "ipsla.voip.thresholdDetails"){
				gridData = jsonData.thresholdDetails;
			}
			else if(snapDetails.name == "webclient.opmstack.switchdetails.summary" && jsonData.stackDetails !== undefined){
				gridData = jsonData.stackDetails;
			}
			else if(snapDetails.name === "opm.VLAN.Interfaces")
			{
				gridData = jsonData.vLanInfo.intfDetails;
			}
			if(snapDetails.name === "opm.device.oldvmwarevms"){//No I18N
				gridData = jsonData.vmDetails;
			}
			if(snapDetails.name === "opm.device.oldvmwareDataStores"){//No I18N
				gridData = jsonData.dataStoreDetails;
			}
			if(snapDetails.name === "opm.device.oldvmwarenetworkadapters"){//No I18N
				gridData = jsonData.netAdapterDetails;
			}
			if(snapDetails.name === "opm.device.oldvmwarestorageadapters"){//No I18N
				gridData = jsonData.storageAdapterDetails;
			}
			if(snapDetails.name === "opm.device.oldresourceallocation"){//No I18N
				gridData = jsonData.resourceAllocDetails;
			}
			if(snapDetails.name === "opm.device.oldvnicdetails"){//No I18N
				gridData = jsonData.vmNWADetails;
			}
			if(snapDetails.name === "opm.device.oldvmdatastore"){//No I18N
				gridData = jsonData.vmDSDetails;
			} 
			if(snapDetails.name === "opm.wan.site.AllLinks"){//No I18N
				gridData = jsonData.wanLinkDetails;
			}
			if(snapDetails.name === "webclient.opm.wan.link.downtime"){//No I18N
				gridData = jsonData.stateHistoryProps[0].histData;
			} 
			if(snapDetails.name === "ipam.subnet.alarms" ||  snapDetails.name === "ipam.switch.alarms" || snapDetails.name === "ipam.group.ips" || snapDetails.name === "ipam.subnet.ips"  || snapDetails.name === "ipam.switch.ports" || snapDetails.name === "ipam.ipalerts" || snapDetails.name==="ipam.subnetlist1"){//No I18N
				defaultOptions.multiselect = true;
			}
			if(snapDetails.name === "opm.device.activeProcesses"){//No I18N
				defaultOptions.hideExcel=true;
				defaultOptions.hideCSV=true;
				defaultOptions.captionName = Ember.I18n.t('webclient.snapshot.name.Active.Processes');//No I18N
			} 
			if(snapDetails.name === "opm.device.installedSoftwares"){//No I18N
				defaultOptions.hideExcel=true;
				defaultOptions.hideCSV=true;
				defaultOptions.captionName = Ember.I18n.t('webclient.action.perf.installedsoftwares');//No I18N
			}
			if(snapDetails.name == "webclient.snmp.tableoid.monitor") {
				if(jsonData.needToRefresh) {
					emberRouteRefresh('Inventory'); // No I18N
					return ;
				}
				var jqGridFormat = getTableOIDJqgridFormat(jsonData.result, self.element);
				snapDetails.snapshotData.colModelList = jqGridFormat.colModels.map(function(item, index) {
					item.name = index.toString();
					item.index = index.toString(); 
					return item;
				});
				snapDetails.snapshotData.colNamesList = jqGridFormat.colNames;
				defaultOptions.shrinkToFit = jqGridFormat.defaultOptions.shrinkToFit
				defaultOptions.autoWidth = jqGridFormat.defaultOptions.autoWidth

				Ember.run.schedule("afterRender", function() { //NO I18N
					var jqGridBodyElement = self.element ? self.element.querySelector(".ui-jqgrid-bdiv") : null // No I18N
					if(jqGridBodyElement) {
						jqGridBodyElement.style.overflowX = 'auto'; //NO I18N
					}
				})
			}
			if(["opm.device.nutanix.vms", "opm.device.vmwarevms"].includes(snapDetails.name))
			{
				if(!window.OPM.userPermissions.discoveryWrite)
				{
					$("#vmAction option[value='delete']").attr('disabled','disabled');
				}
				if(!window.OPM.userPermissions.monitoringWrite)
				{
					$("#vmAction option[value='manage']").attr('disabled','disabled');
					$("#vmAction option[value='unmanage']").attr('disabled','disabled');
				}
				if($("#vmAction option").length == 1)
				{
					defaultOptions.multiselect = false;
					$("#vmActionhide").hide()
				}
				else
				{
					defaultOptions.multiselect = true;
				}
				if( window.OPM.selectedEEProbe == '-1')
				{
					defaultOptions.multiselect = false;
					$("#vmActionhide").hide()
				}
				$("#vmAction").select2();
			}
			if(snapDetails.name==="ipam.port.alarms"|| snapDetails.name==="ipam.port.history" || snapDetails.name==="ipam.ip.history" || snapDetails.name==="ipam.ip.alarms"){
				self.set('widgetData.hideExpand',true);//No I18N
			}
			if(snapDetails.name === "opm.device.oldvCenterDetails"){//No I18N
				var newJson = [];
				$.each(jsonData.hostInfo,function(key,value)
				{
					$.each(jsonData.vmInfo,function(kk,val)
					{
						if(val.VHOST_NAME == value.VHOST_NAME)
						{
							val.VHOSTDISPLAYNAME = value.DISPLAYNAME;
							newJson.push(val);
						}
					});
				});
				gridData = newJson;
			
				defaultOptions.grouping = true;
				defaultOptions.groupingField = "VHOSTDISPLAYNAME"; //No I18N
			}
			if(snapDetails.name === "opm.apmplugin.apps"){
				gridData = new Array();
				if(window.OPM.apmInstalled === "true" && !currentWidgetData.ondemandWidget){
					if(jsonData.response !== undefined && jsonData.response.result !== undefined){
						if(jsonData.response.result[0] !== undefined  && jsonData.response.result[0].Service !== undefined){
							gridData = jsonData.response.result[0].Service;
						}
					}
				}
			}
			if(snapDetails.name == "webclient.tab.ipmi.summary.hardware.info"){
				if(!$.isEmptyObject(jsonData.hardwareData)){
					gridData = getHardwareInfo(jsonData.hardwareData);
				}
			}
			if(snapDetails.name === "webclient.opm.meraki.security" || snapDetails.name === "webclient.opm.meraki.switches" || snapDetails.name === "webclient.opm.meraki.radios" || snapDetails.name === "webclient.opm.meraki.vision" || snapDetails.name === "webclient.opm.meraki.gateway" || snapDetails.name === "webclient.opm.meraki.sensor") {
				var apFilter = "Active"; //No I18N
				var network_filter=snapDetails.selNetFilter;
				if(snapDetails.selAPFilter !== undefined && snapDetails.selAPFilter !== "Active") {
					apFilter = snapDetails.selAPFilter;
				}
				if(!OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isRestAPIAvailability)
				{
					snapDetails.snapshotData.colModelList[2].hidden=true;
				}
				else
				{
					snapDetails.snapshotData.colModelList[2].hidden=false;
					snapDetails.snapshotData.colModelList[2].searchoptions= {value: merakiStatusSearch,defaultvalue:"0",style:"width:100%"}; //No I18n
					if(gridData.length<2)
					{
						$('.icon-search').hide();
					}
				}

				setTimeout(function(){
					$("#param_"+snapDetails.id+"_MerakiAP").val(apFilter).select2();
					$("#param_"+snapDetails.id+"_mnetw").val(network_filter).select2();
				},100);
				if(gridData.length>0)
				{
					$(".headerTitleSpan.merakiDevicesCnt").text("("+gridData.length+")");
				}
			}

			if(snapDetails.name === "webclient.opm.meraki.networks") {
				var netfilt = "Active"; //No I18N
				if(snapDetails.selNetFilter !== undefined) {
					netfilt = snapDetails.selNetFilter;
				}
				// $(".merakiAllDevicesIcon.merakiDevices.active b").text(jsonData.length);//NO I18N
				setTimeout(function(){
					$("#param_"+snapDetails.id+"_MerakiNetW").val(netfilt).select2();
				},100);

				if(gridData.length>0)
				{
					$(".headerTitleSpan.merakiNetworksCnt").text("("+gridData.length+")");
				}
			}
			if(snapDetails.name == "opm.wlc.accessPoints" || snapDetails.name == "opm.ngfw.accessPoints") { //No I18n
				if(snapDetails.selAPFilter !== undefined && snapDetails.selAPFilter !== "Active") {
					$("#param_"+snapDetails.id+"_wlcAP").val(snapDetails.selAPFilter).select2();
				} else {
					$("#param_"+snapDetails.id+"_wlcAP").val('Active').select2();
				}
				var siteFilterVal = snapDetails.selSiteFilter;
				var siteSelId = "#param_"+snapDetails.id+"_wlcSite"; //No I18N
				Ember.run.scheduleOnce('afterRender', function(){ //No I18N
					if(siteFilterVal !== undefined && siteFilterVal !== 'All') {
						$(siteSelId).val(siteFilterVal).select2(); 
					} else {
						$(siteSelId).val('All').select2(); //No I18N
					}
				});
				$(".wlcTabIconAccessPoints b").text(jsonData.length);//NO I18N
				/* Keep NGFW Wireless top-tab AP count in sync with polled grid rows */
				if(snapDetails.name == "opm.ngfw.accessPoints"){//No I18N
					opm_updateNgfwTabCount('accessPointsCount', jsonData.length);//No I18N
				}
			}
			if(snapDetails.name == "webclient.tab.ipmi.summary.managing.servers"){
				if(gridData.length > 0 && gridData[0].uniqueType != undefined){
					snapDetails.snapshotData.colNamesList[4] = opm_escapeHTML(gridData[0].uniqueType);
				}
			}
			if(gridData.message != null || gridData.error != null) {
				gridData = new Array();
			}
			if(snapDetails.name === 'opm.device.activeProcesses' || snapDetails.name === 'opm.device.installedSoftwares'){
				var protocol = (jsonData && jsonData[0]) ? jsonData[0].protocol : false;
				if(protocol)
				{
					if(this.get('snapshotObj.isAgentMonitoring') !== undefined && (this.get('snapshotObj.isAgentMonitoring') === true || this.get('snapshotObj.isAgentMonitoring').trim() === "true"))
					{
						opm_infoMsgs("successMsg",Ember.I18n.t('webclient.details.fetched.success', {param0:Ember.I18n.t('webclient.map.filemonitor.filesearch.warning.agent.small',this)},this));//No I18N
					}
					else
					{
						opm_infoMsgs("successMsg",Ember.I18n.t('webclient.details.fetched.success', {param0:protocol},this));//No I18N
					}
				}
				if(jsonData.message != null) {
					opm_infoMsgs('errorMsg', jsonData.message);//No I18N	
				}else if(jsonData.error !== undefined){
					opm_infoMsgs("errorMsg",jsonData.error.message);//No I18N
				}
			}
			if(snapDetails.name === "webclient.snmp.tableoid.monitor") {
				if(snapDetails.apiData.result) {
					gridData = snapDetails.apiData.result.slice(1);
				}
			}
			if(isjqGridHeaderBodyHandledWidget(snapDetails.name)){
				Ember.run.scheduleOnce('afterRender',function(){//No I18N
					$('#gbox_opm_DeviceSnapList'+snapDetails.id).parent('.opm_jqGridUI').addClass('VxRailComponent');//No I18N
					//setting tooltip to the header
					$.each($('.VxRailComponent.opm_jqGridUI #gbox_opm_DeviceSnapList'+snapDetails.id+'.ui-jqgrid .ui-jqgrid-view .ui-jqgrid-hdiv .ui-jqgrid-htable thead tr th div'),function(index,thisDiv){
						//Check for the overflow case, it tooks little more time than non check case...
						// if(thisthisDiv.scrollWidth > thisthisDiv.offsetWidth){
							$(thisDiv).prop('title',$(thisDiv).text());//No I18N
						// }
					});
				});
			}
			if((window.OPM.isCentralServer || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition || !window.OPM.isOpmPlug || !window.OPM.userPermissions.monitoringWrite) && snapDetails.name === 'opm.device.vsan'){
				setHiddenColumn(snapDetails.snapshotData.colModelList,['action'],true);//No I18N
			}
			if(gridData.length==undefined){gridData = [];}
			validateGridColumnDetails(snapDetails.snapshotData.colModelList,snapDetails.snapshotData.colNamesList);
			if((!window.OPM.isOpmPlug || window.OPM.isCentralServer) && (snapDetails.name==="opm.device.vmwarevms" || snapDetails.name==="opm.device.hypervvms" || snapDetails.name==="opm.device.xenvms" ||  snapDetails.name==="opm.device.hosts" ||  snapDetails.name==="opm.device.vmwareDataStores" || snapDetails.name==="opm.device.nutanix.orphanedvms" || snapDetails.name==="opm.device.nutanix.vms" || snapDetails.name==="opm.device.nutanixhosts" || snapDetails.name==="webclient.tab.ipmi.summary.managing.servers")){
				delete snapDetails.snapshotData.colModelList[snapDetails.snapshotData.colModelList.length-1];
				delete snapDetails.snapshotData.colNamesList[snapDetails.snapshotData.colNamesList.length-1];
			}
			if(snapDetails.name == 'opm.device.nutanix.vms') { //NO I18N
				if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.entityType === 'Nutanix-PrismCentral' || OPMClient.InventoryDeviceDetailsController.prismCentralName) { //NO I18N
					var index = snapDetails.snapshotData.colModelList.findIndex(function(col, index) {
						return col && col.index === 'NUMNETWORKADAPTERS'; // No I18N
					})
					if(index > -1) {
						snapDetails.snapshotData.colNamesList.splice(index, 1);
						snapDetails.snapshotData.colModelList.splice(index, 1);
					}
				}
			}
			if((!window.OPM.isOpmPlug || window.OPM.isCentralServer) && snapDetails.snapshotData.colModelList.some(function(col) { return col.name === 'discovery_selection'; })) {
				setHiddenColumn(snapDetails.snapshotData.colModelList,['VM_Monitor'],true);//No I18N
			}
			
			if(snapDetails.name==="opm.device.activeProcesses")
			{
				if(gridData[0] && (gridData[0].protocol ==="WMI" || gridData[0].protocol ==="CLI")) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['type'],true);
				}

				if(gridData[0] && (gridData[0].protocol ==="SNMP")) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['cpu'],true);

					if(!window.OPM.isMemoryEnabledInActiveProcess) {
						setHiddenColumn(snapDetails.snapshotData.colModelList,['mem'],true);
					}
				}else if(gridData[0] && (gridData[0].protocol === 'CLI') && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['cpu','mem'],true);//No I18N
				}

				defaultOptions.searchOption = false;
			}
			if(snapDetails.name==="opm.device.installedSoftwares" && gridData[0] && (gridData[0].protocol =="SNMP"))//No I18N
				{
					setHiddenColumn(snapDetails.snapshotData.colModelList,['Version'],true);//No I18N
				}

			if(snapDetails.name==="opm.interface.topconv" || snapDetails.name==="nfa.meraki.conv") //No I18N
			{
				if($("#param_"+snapDetails.id+"_ResolveDNS").is(':checked')) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['indvTrafficGraph'],true);
				}else {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['indvTrafficGraph'],false);
				}
				var isNFAMACAddressView = snapDetails.name === "opm.interface.topconv" && $("#param_"+snapDetails.id+"_isMacAddress").prop("checked"); //NO I18N
				if (isNFAMACAddressView) {
					//Hiding IP type select box
					$("#param_"+snapDetails.id+"_IPType").closest(".selBox").hide(); //NO I18N
					//Hiding One click schedule option
					$("#widgetElement_"+snapDetails.id+" .inventoryWidgetIcons .icon-stopwatch").attr("style", "display: none !important"); //NO I18N
					//Hiding Individual graph in table data
					setHiddenColumn(snapDetails.snapshotData.colModelList, ["indvTrafficGraph"], true);
				}
				if(snapDetails.apiData.fromRaw) {
					snapDetails.snapshotData.colNamesList[3] = Ember.I18n.t("pdf.SrcPort"); //NO I18N
					setHiddenColumn(snapDetails.snapshotData.colModelList,["dstport","AvgSpd"],false); //NO I18N
				}else{
					snapDetails.snapshotData.colNamesList[3] = Ember.I18n.t("opu.views.PORT"); //NO I18N
					setHiddenColumn(snapDetails.snapshotData.colModelList,["dstport","AvgSpd"],true); //NO I18N
				}
				if(!["FlowInterface", "FlowInterfaceGroup","FlowIPGroup"].contains(OPMClient.InventoryDeviceDetailsController.inventorysnapType)){ //NO I18N
					setHiddenColumn(snapDetails.snapshotData.colModelList, ["srcASName", "dstASName", "srcAS", "dstAS"], true); //NO I18N
				}
			}
			if(snapDetails.name === "opm.device.interfaces")
			{
				//Hide "Connected Device column" if not enable OpUtils
				if(window.OPM.isOPUPlug && !window.OPM.isMSPCentral && !window.OPM.isCentralServer && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.category ==="Switch"){
					setHiddenColumn(snapDetails.snapshotData.colModelList,["connected-device"],false); //NO I18N
				}else{
					setHiddenColumn(snapDetails.snapshotData.colModelList,["connected-device"],true); //NO I18N
				}
				gridData = jsonData.interfaces;
				if(jsonData.downCount !== undefined)
				{
					defaultOptions.interfaceDownCount = jsonData.downCount;
				}
				defaultOptions.WidgetName = snapDetails.name;
				if(!jsonData.showPollingStatusColumn){
					removeColModelandName(snapDetails.snapshotData.colModelList,snapDetails.snapshotData.colNamesList,'pollingStatus');//NO I18N
				}
				defaultOptions.Search = false;
			}
			if(snapDetails.name === "opm.sdn.spine.list")
			{
				gridData = jsonData.spine;
				defaultOptions.WidgetName = snapDetails.name;
			}
			if(snapDetails.name === "opm.sdn.superspine.list")
			{
				gridData = jsonData.superspine;
				defaultOptions.WidgetName = snapDetails.name;
			}
			if(snapDetails.name === "opm.sdn.leaflist")
			{
				gridData = jsonData.leaf;
				defaultOptions.WidgetName = snapDetails.name;
			}
			if(snapDetails.name==="opm.wlc.accessPoints" || snapDetails.name==="opm.ngfw.accessPoints" || snapDetails.name==="webclient.opm.meraki.security" || snapDetails.name==="webclient.opm.meraki.switches" || snapDetails.name==="webclient.opm.meraki.radios" || snapDetails.name==="webclient.opm.meraki.vision" || snapDetails.name==="webclient.opm.meraki.gateway" || snapDetails.name === "webclient.opm.meraki.sensor")
			{
				defaultOptions.multiselect = true;
				defaultOptions.sortOrder = "asc";//No I18N
				defaultOptions.sortName = "advanceMonitoringEnabled";//No I18N
				defaultOptions.minRowsPerPage = 500;
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=true;
				defaultOptions.pagination = true;
				if(snapDetails.name==="opm.ngfw.accessPoints"){//No I18N
					snapDetails.snapshotData.colModelList[0].searchoptions = {value:deviceStatusSearch,defaultvalue:"0"}; //No I18N
				}
				if(!window.OPM.userPermissions.discoveryWrite && !window.OPM.isCentralServer) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['advanceMonitoringEnabled'],true); //No I18n
					defaultOptions.multiselect = false;
				}
				if(window.OPM.isCentralServer)
				{
					setHiddenColumn(snapDetails.snapshotData.colModelList,['advanceMonitoringEnabled'],true); //No I18n
				}
			}
			if(snapDetails.name==="opm.merakimx.wanlink"){
				defaultOptions.multiselect = true;
				if(!window.OPM.userPermissions.monitoringWrite || window.OPM.isCentralServer || OPMClient.ApplicationController.isMSPCentralSelected) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['action'],true); //No I18n
					defaultOptions.multiselect = false;				
}
			}
			if(snapDetails.name === "opm.wlc.rougeaps" || snapDetails.name === "opm.ngfw.rogueSSID"){//No I18N
				gridData = jsonData.rogueAPList || [];
				if(!jsonData.showAPName){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['apName'],true); //No I18n
				}
				if(!jsonData.showClassType){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['classType'],true); //No I18n
				}
				else{
					   var classTypes = {};
					   $.each(gridData,function(i,row){ var ct = row.classType; if(ct && ct !== 'null' && ct !== ''){ classTypes[ct] = true; } }); //No I18n
					   var searchValue = ":All"; //No I18N
					   $.each(Object.keys(classTypes).sort(), function (i, key) {
    						searchValue += ";" + key + ":" + escapeHTML(key);
						});	
					   var classTypeCol = $.grep(snapDetails.snapshotData.colModelList, function(col){ return col.name === 'classType'; })[0]; //No I18N
					   if(classTypeCol){ classTypeCol.searchoptions = {value:searchValue,defaultValue:""}; } //No I18N
			    }
				if(!jsonData.showRssi){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['rssi'],true); //No I18n
				}
				if(!jsonData.showFirstSeenTime){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['firstSeenTime'],true); //No I18n
				}
			}
			if(snapDetails.name==="opm.wlc.SSID" || snapDetails.name==="opm.wlc.rougeaps" || snapDetails.name==="opm.wlc.clients"){ //No I18N
				var siteFilterVal = snapDetails.selSiteFilter;
				var siteSelId = "#param_"+snapDetails.id+"_wlcSite"; //No I18N
				Ember.run.scheduleOnce('afterRender', function(){ //No I18N
					if(siteFilterVal !== undefined && siteFilterVal !== 'All') {
						$(siteSelId).val(siteFilterVal).select2(); 
					} else {
						$(siteSelId).val('All').select2(); //No I18N
					}
				});
			}
			if(snapDetails.name==="opm.wlc.SSID" && (OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.midLevelWLC !== undefined && OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.midLevelWLC)){
				setHiddenColumn(snapDetails.snapshotData.colModelList,['TotalBytes'],true); //No I18n
			}
			if(snapDetails.name === "webclient.SSIDs")
			{
				gridData = jsonData.ssidData;
				if(jsonData.midLevelWLC){
					setHiddenColumn(snapDetails.snapshotData.colModelList,['TotalBytes'],true); //No I18n
				}
				defaultOptions.sortOrder = "desc";//No I18N
				defaultOptions.sortName = "ClientCount";//No I18N
			}
			if((snapDetails.name==="webclient.opm.wan.link.downtime" || snapDetails.name === "opm.wan.Link.Downtime")  && (!window.OPM.userPermissions.monitoringWrite && !window.OPM.userPermissions.operatorAccess)){
				setHiddenColumn(snapDetails.snapshotData.colModelList,['action'],true); //No I18n
			}
				
			if(snapDetails.name === "nfa.cloudUser.Conversation"){ //NO I18N
				var displayName;
				if(self.snapshotObj.snapType === "FlowCloudService"){ //NO I18N
					displayName = ($("input[name='Data_"+snapDetails.snapid+"']:checked").val() === "IN" ? Ember.I18n.t("NFAWidget.Dst") : Ember.I18n.t("NFAWidget.Src")); //NO I18N
				}else if(self.snapshotObj.snapType === "FlowUser"){ //NO I18N
					displayName = ($("input[name='Data_"+snapDetails.snapid+"']:checked").val() === "IN" ? Ember.I18n.t("NFAWidget.Src") : Ember.I18n.t("NFAWidget.Dst")); //NO I18N
				}
				snapDetails.snapshotData.colNamesList[0] = displayName;
				$("#param_"+snapDetails.snapid+"_GroupBy option[value='IPName']").text(displayName); //NO I18N
				$("#param_"+snapDetails.snapid+"_GroupBy").select2(); //NO I18N
			}
			if (snapDetails.name === "webclient.dpi.dhcp.topclients.byerrorvolume") { //NO I18N
				snapDetails.snapshotData.colNamesList[2] = Ember.I18n.t("webclient.nak.count"); //NO I18N
			} else if (snapDetails.name === "webclient.dpi.dhcp.topclients.byresponsetime") { //NO I18N
				snapDetails.snapshotData.colNamesList[2] = Ember.I18n.t("nfa.dpi.responsetime"); //NO I18N
			}

			var hidecsvExcelWidgets = ["opm.device.vmwareDataStores","opm.device.vmwarevnic","opm.virtualds.vms","opm.device.vmwareDataStores","opm.device.vmwarenetworkadapters","opm.device.vmwarestorageadapters","opm.device.vmwareDataCenter","opm.device.cluster","opm.virtualds.hosts","opm.virtualds.vms","opm.device.vmwareDataStores","opm.virtualds.hosts","opm.device.vmwarevms","opm.device.hypervvms","opm.device.hypervresAllocation","opm.device.hypervpnicDetails","opm.device.hypervHostDisks","opm.device.hypervHostDisks","opm.device.hypervvnic","opm.xenpool.hosts","opm.xenpool.vms","opm.xenpool.storage","opm.device.xenvirtualdisk","opm.device.xenvmvnics","opm.device.xenvms","opm.device.xenpnicDetails","opm.device.XenSRDetails","ucs.device.chassis","ucs.device.chassis.server","ucs.device.rackmounts","ucs.device.fabric.interconnects","ucs.device.serverprofiles","ucs.device.fanmodules","opm.device.hypervVMDiskShare","opm.device.vsan","opm.device.vxrail.installedcomponents","opm.device.vxrail.chassis","opm.device.vxrail.hardware","opm.device.vrail.summary"];//No I18N
			var nutanixWidgets = ["opm.device.nutanixhosts","opm.device.nutanix.vms","opm.device.nutanix.orphanedvms","dashboard.opstor.total.disks.header","opm.nutanix.storagecontainers","webclient.nutanix.volumegrps","opm.nutanix.storagepools"];//No I18N
			hidecsvExcelWidgets.push.apply(hidecsvExcelWidgets, nutanixWidgets);
			
			if(hidecsvExcelWidgets.indexOf(snapDetails.name) >=0)
			{
				defaultOptions.hideCSV = true;
				defaultOptions.hideExcel = true;
			}
			if(OPMClient.InventoryDeviceDetailsController.opuNewSnapshot){
				self.set('widgetData.hideExpand',true);//No I18N
			}
			if(currentWidgetData.name==="webclient.opm.kemplb.rs.childlist"){//No I18n
				if(snapDetails.snapshotData.colModelList!==undefined && snapDetails.snapshotData.colModelList[10]!==undefined)
				{
					snapDetails.snapshotData.colModelList[10].hidden = !(OPMClient.ApplicationController.showSuppressAlarm);
				}
			}
			var sendObj = {};
			if(snapDetails.snapshotData && snapDetails.snapshotData.gridActions) {
				defaultOptions.minRowsPerPage = snapDetails.snapshotData.gridActions.pageSize;
				defaultOptions.hideCSV = !snapDetails.snapshotData.gridActions.allowExport;
				defaultOptions.hideExcel = !snapDetails.snapshotData.gridActions.allowExport;
				defaultOptions.pagination = snapDetails.snapshotData.gridActions.allowPagination || !defaultOptions.hideCSV || !defaultOptions.hideExcel;
				defaultOptions.Search = false;
				sendObj.isNdmFwSnapshotPage = true;
			}
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			sendObj.gridId = "opm_DeviceSnapList"+snapDetails.snapid;
			sendObj.pagerId = "opm_DeviceSnapPager"+snapDetails.snapid;
			sendObj.snapid = snapDetails.snapid;
			sendObj.data = gridData;
			sendObj.defaultOptions = defaultOptions;
			sendObj.colModels = snapDetails.snapshotData.colModelList;
			sendObj.colNames = snapDetails.snapshotData.colNamesList;
			sendObj.captionTitle = "";
			sendObj.gridNavigator = "";
			sendObj.onSelectFunction = snapDetails.snapshotData.onselectfunction !== undefined ? snapDetails.snapshotData.onselectfunction : "";//No I18N
			sendObj.EE_PROBE_REQ = snapDetails.snapshotData.EE_PROBE_REQ !== undefined ? snapDetails.snapshotData.EE_PROBE_REQ : false;
			sendObj.nfaCustomPagerDetails = (snapDetails.nfaCustomPagerDetails !== undefined)?getNFACustomPagerDetails(currentWidgetData):false;
			if(sendObj.onSelectFunction === "SDWANTunnelsListSelFn"){
				/* NGFW SLAs render client-side, where opm_loadJQgridWithData builds its own pager.
				   snapDetails is widgetData itself, so keeping it here would make
				   widgetData.gridDataArray.snapDetails point back to widgetData. jQuery deep-extends
				   the $.ajax options of the reload/expand request and overflows the stack on that cycle,
				   which is why the SD-WAN grids go through reloadWithoutCallStackError instead. */
				if(snapDetails.name !== "opm.ngfw.slas"){//No I18N
					sendObj.gridNavigator = "opm_DeviceSnapPager"+snapDetails.snapid;//No I18N
					sendObj.snapDetails=snapDetails;
				}else{
					sendObj.snapName = snapDetails.name;
				}
			}
			var tableView = ['getADWidgetDetails','getApplicationAlarmData','getADServicesDetails','getExchangeServicesDetails'];//No I18N

			if(nfaSnapType.contains(this.snapshotObj.snapType)) {
				sendObj.className = "opm_jqGridUI opmReportsGridview nfa"; //NO I18N
			}

			if(gridData.length>10 && snapDetails.name !== "opm.device.interfaces" && snapDetails.name !== "opm.ngfw.slas" && !sendObj.isNdmFwSnapshotPage) {
				sendObj.showAll = true;
			}
			if(!currentWidgetData.expandView && snapDetails.name == "opm.device.activeProcesses" ||  snapDetails.name == "opm.device.installedSoftwares")
			{
				sendObj.showAll = false;
				defaultOptions.pagination = true;
				defaultOptions.minRowsPerPage = 50;
			}
			
			if(snapDetails && snapDetails.snapshotData && snapDetails.snapshotData.onselectfunction === "proxmox_snap" && currentWidgetData.name === "opstor.inventory.emc.isilon.node.displayname") {
				sendObj.className = "opm_jqGridUI rowOverflowVisible"; //NO I18N
				Ember.run.schedule("afterRender", function() { //NO I18N
					$("#" + self.elementId).closest(".content.singleInvWidget").addClass('overflowHidden'); //NO I18N
				})
			}
			if(currentWidgetData.name==="webclient.opm.kemplb.rs.childlist" || currentWidgetData.name==="webclient.opm.lb.vs.childlist" || currentWidgetData.name==="webclient.opm.lb.pl.childlist"){//No I18N
				if(currentWidgetData.name==="webclient.opm.lb.vs.childlist" || currentWidgetData.name==="webclient.opm.lb.pl.childlist"){
					sendObj.className = "opm_jqGridUI rowOverflowVisible kempChildList";//NO I18N
				}
				if(currentWidgetData.name==="webclient.opm.lb.pl.childlist" || currentWidgetData.name==="webclient.opm.lb.vs.childlist")//No I18N
				{
					for(var i=0;i<sendObj.colModels.length;i++)
					{
						if(sendObj.colModels[i].name==="enabled")//No I18N
						{
							sendObj.colModels[i].hidden = !(OPMClient.ApplicationController.showSuppressAlarm);
						}
					}
				}
				//Enable row checkboxes + select-all on the LB child grids (F5 Pool Members / F5 Virtual Servers / KEMP Real Servers) for bulk alarm suppression.
				if(window.OPM.showSuppressAlarm){
					defaultOptions.multiselect = true;
					defaultOptions.retainSelection = true;
				}
			sendObj.showAll = false;
				defaultOptions.noPaginationShowAll = true;
				defaultOptions.sortable = false;
		}
			//For the VMware Virtual Machines tab filter, maintained filtered data locally.
			if(['opm.device.vmwarevms', 'opm.device.nutanix.vms'].includes(snapDetails.name)){
				var vmsDataCache = OPMClient.InventoryDeviceDetailsController.vmsDataCache;
				if(!Object.keys(vmsDataCache).length){
					vmsDataCache = {AllVMs:gridData,PoweredOn:[],PoweredOff:[],Orphaned:[],NotMonitored:[],gridData:sendObj};
					$.each(gridData,function(dataIndex,dataObject){
						if(dataObject.VM_POWERSTATE === 'On' || dataObject.VMSTATE === 'Powered On'){
							vmsDataCache.PoweredOn.push(dataObject);
						}
						if(dataObject.VM_POWERSTATE === 'Off' || dataObject.VMSTATE === 'Powered Off'){
							vmsDataCache.PoweredOff.push(dataObject);
						}
						if(dataObject.IS_ORPHANED === 'true' || dataObject.MARKFORDELETE){
							vmsDataCache.Orphaned.push(dataObject);
						}
						if(dataObject.IPADDRESS === undefined){
							vmsDataCache.NotMonitored.push(dataObject);
						}
					});
					OPMClient.InventoryDeviceDetailsController.setProperties({vmsDataCache:vmsDataCache});
				}
				sendObj.data = vmsDataCache[OPMClient.InventoryDeviceDetailsController.selectedVMType];
				OPMClient.InventoryDeviceDetailsController.setProperties({isVMwarevmsTab:true});
			}

			if((gridData.length > 10 && (snapDetails.name === "opm.grouping.Alarms" || snapDetails.name ==="opm.grouping.elements" || snapDetails.name ==="opm.intfgrouping.Alarms" || snapDetails.name ==="opm.grouping.interfaces" || snapDetails.name ==="opm.devicegrouping.Alarms" || snapDetails.name ==="opm.grouping.devices" || snapDetails.name === "opm.apmgrouping.elements" || snapDetails.name === "opm.grouping.problems")))
			{
				sendObj.showAll = true;
				//defaultOptions.minRowsPerPage = 10;
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=true;
				defaultOptions.pagination = false;
			}
			if(currentWidgetData.expandView && (snapDetails.name === "opm.grouping.Alarms" || snapDetails.name ==="opm.grouping.elements" || snapDetails.name ==="opm.intfgrouping.Alarms" || snapDetails.name ==="opm.grouping.interfaces" || snapDetails.name ==="opm.devicegrouping.Alarms" || snapDetails.name ==="opm.grouping.devices" || snapDetails.name === "opm.apmgrouping.elements" || snapDetails.name === "opm.grouping.problems"))
			{
				sendObj.showAll = false;
				defaultOptions.pagination = true;
				defaultOptions.minRowsPerPage = 50;
			}
			if(window.OPM.isNewStatusPropagation && (snapDetails.name ==="opm.grouping.devices" || snapDetails.name ==="opm.grouping.elements")){
				sendObj.colModels.push({name:"state",index:"state",hidden:true});
				sendObj.colNames.push("state");
			}
			if(snapDetails.name === "ipam.switch.alarms" || snapDetails.name === "ipam.switch.history" || snapDetails.name==="ipam.switchgroup.alarms" || snapDetails.name==="ipam.switchgroup.history"){
				defaultOptions.minRowsPerPage = 10;
				sendObj.showAll = false;
				self.set('widgetData.hideExpand',true);//No I18N
				defaultOptions.pagination = true;
				if(snapDetails.name === "ipam.switch.history"){
					defaultOptions.multiselect = false;
				}
			}
			if(snapDetails.name==="ipam.ipv6.ips" || snapDetails.name==="ipam.ipv6.history" || snapDetails.name==="opu.ipam.dhcpscope" || snapDetails.name==="opu.ipam.dhcpipaddress" || snapDetails.name==="opu.ipam.dhcp.macfilter"||snapDetails.name==="opu.ipam.dhcp.policy"|| snapDetails.name==="opu.ipam.dhcp.superscope"){
				sendObj.showAll = false;
				defaultOptions.minRowsPerPage = 50;
				self.set('widgetData.hideExpand',true);//No I18N
				defaultOptions.gridCallBack=opugridCallBack;
				defaultOptions.pagination = true;
				if(snapDetails.name==="opu.ipam.dhcp.macfilter"||snapDetails.name==="opu.ipam.dhcp.policy"|| snapDetails.name==="opu.ipam.dhcp.superscope"){
                    defaultOptions.autoWidth=true;
					if(snapDetails.name !== "opu.ipam.dhcp.superscope") {
						defaultOptions.enableColChooser = true;
						defaultOptions.enableTopColChooser = true;
					}
                    if(snapDetails.name==="opu.ipam.dhcp.policy"|| snapDetails.name==="opu.ipam.dhcp.superscope"){
                        defaultOptions.multiselect = false;
                    }
                    if((snapDetails.name==="opu.ipam.dhcp.policy" || snapDetails.name==="opu.ipam.dhcp.superscope") && !window.OPM.userPermissions.ipamWrite){
                        setHiddenColumn(snapDetails.snapshotData.colModelList,['actions'],true); //No I18n
                    }
                }
			}
			if(snapDetails.name==="opu.ipam.dhcpscope"){
                defaultOptions.hideCSV=true;
                defaultOptions.hideExcel=true;
                defaultOptions.Search = false;
                defaultOptions.savePagination = true;
                defaultOptions.gridTableId = "OpUtils_DHCPScope";//No I18N
                var oputilsScopeState = ":"+Ember.I18n.t('opu.common.ALL', this)+";"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+":"+Ember.I18n.t('webclient.admin.scheduledt.enabled',this)+";"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this)+":"+Ember.I18n.t('webclient.admin.scheduledt.disabled',this);//NO I18N
                snapDetails.snapshotData.colModelList[6].searchoptions={value:oputilsScopeState,defaultValue: ""}; //No I18n
                if(OPMClient.InventoryOpUtilsController.dhcpServerTypeInt == null || OPMClient.InventoryOpUtilsController.dhcpServerTypeInt == undefined || OPMClient.InventoryOpUtilsController.dhcpServerTypeInt !== '1' || !window.OPM.userPermissions.ipamWrite){
                    setHiddenColumn(snapDetails.snapshotData.colModelList,['actions'],true); //No I18n
                }
            }
			if(snapDetails.name === "webclient.opm.meraki.msportsDetails"){
				sendObj.showAll = false;
				defaultOptions.minRowsPerPage = 100;
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=true;
				defaultOptions.pagination = true;
				self.set('widgetData.hideExpand',true);//No I18N
			}
			if(snapDetails.name === "opm.sdwan.tunnels" || snapDetails.name === "opm.sdwan.controllersummary" || snapDetails.name === "opm.sdwan.edgesDevices" || snapDetails.name==="opm.sdwan.edges.devices" || snapDetails.name === "opm.sdwan.summary" || snapDetails.name==="opm.sdwan.underlayTunnels" || snapDetails.name==="opm.sdwan.wanlinks" || snapDetails.name==="opm.sdwan.switches" || snapDetails.name==="opm.sdwan.accesspoints" || snapDetails.name==="opm.sdwan.gateways" || snapDetails.name==="opm.sdwan.simlinks" || snapDetails.name==="opm.pon.oltDevices" || snapDetails.name==="opm.pon.ontDevices"){
				sendObj.showAll = false;	
				defaultOptions.minRowsPerPage = 100;	
				defaultOptions.pagination=true;		
			} else if(snapDetails.name == "opm.wan.site.AllLinks"){
				sendObj.showAll = false;
				defaultOptions.pagination = true;
				defaultOptions.minRowsPerPage = 100;
				if(window.OPM.isCentralServer || !window.OPM.userPermissions.discoveryWrite || window.OPM.isMSPCentralSelected) {
					setHiddenColumn(snapDetails.snapshotData.colModelList,['actions'],true); //No I18n
				}
			}
			if(snapDetails.name !==undefined && snapDetails.name === "opm.device.ipRoutingneighbour") {	
				defaultOptions.minRowsPerPage = 10;
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=true;
				defaultOptions.Search = false;
				defaultOptions.sortOrder = "desc";//No I18N
				defaultOptions.sortName = "flapCount";//No I18N
				defaultOptions.sorttype= "int";//No I18N
				if(window.OPM.isAuthorized && !window.OPM.isCentralServer)
				{
					defaultOptions.multiselect = true;
				}
			}
			if(snapDetails.name !==undefined && snapDetails.name === "opm.device.ipRoutingtable") {	
				defaultOptions.hideCSV=true;
				defaultOptions.hideExcel=true;
				defaultOptions.Search = false;
				defaultOptions.sortOrder = "desc";//No I18N
				defaultOptions.sortName = "flapCount";//No I18N
				defaultOptions.sorttype= "int";//No I18N
			}

			if(snapDetails.name === "opm.device.vmwarenetworkadapters" || snapDetails.name === "opm.device.vmwarestorageadapters"){ // No I18N
				if(raiseEntityAlarm()) {
					defaultOptions.multiselect = true; //No I18N
				} else {
					defaultOptions.multiselect = false; //No I18N
					sendObj.colModels = sendObj.colModels.filter(function(m) {
						return m.name !== "ACTIONS"; // No I18N
					});
					sendObj.colNames = sendObj.colNames.filter(function(name) {
						return name !== Ember.I18n.t('webclient.action.actions');//No I18N
					});
				}
			}
			if(snapDetails.name === "opm.device.virtualSnapshotDetails" || snapDetails.name === "opm.device.parentVirtualSnapshotDetails") {
				if(OPMClient.ApplicationController.showSuppressAlarm) {
					if(!(window.OPM.isCentralServer || window.OPM.isFreeEdition || window.OPM.isOPMLiteEdition || window.OPM.isOPMStandardEdition)) {
						defaultOptions.multiselect = (snapDetails.name === "opm.device.virtualSnapshotDetails");

						sendObj.colModels = sendObj.colModels.map(function(obj) {
							if(obj.name === "ACTIONS") { // No I18N
								obj.hidden = false;
							}
							return obj;
						})
					}
				}
			}

			// Enable Disable Actions button based on row selection
			if(["opm.device.vmwarenetworkadapters", "opm.device.vmwarestorageadapters", "opm.device.virtualSnapshotDetails"].includes(snapDetails.name)) { // No I18N
				Ember.run.schedule("afterRender", function() { //NO I18N
					function updateActionButtonState() {
						var selectedRows = $("#" + snapDetails.gridTableId).jqGrid("getGridParam", "selarrrow"); // No I18N
						
						// Enable action button if at least one row is selected
						if (selectedRows.length > 0) {
							$("#" + snapDetails.widgetElementID + '-actions').removeClass("disabledBlock"); // No I18N
						} else {
							$("#" + snapDetails.widgetElementID + '-actions').addClass("disabledBlock"); // No I18N
						}
					}
					if($("#" + snapDetails.gridTableId).length) {
						$("#" + snapDetails.gridTableId).bind("jqGridSelectRow", updateActionButtonState); // No I18N
						$("#" + snapDetails.gridTableId).bind("jqGridSelectAll", updateActionButtonState); // No I18N
						updateActionButtonState();
					}
				})
			}

			sendObj.page = "";
			if(snapDetails.name === "opm.sdwan.tunnels" || snapDetails.name==="opm.sdwan.underlayTunnels"){//No I18N
                sendObj.apiUrl = snapDetails.apiurl;
                sendObj.apiParams=snapDetails.parameters;
                sendObj.data = {};
            }
			if(self!==undefined && self!==null && !currentWidgetData.ondemandWidget && gridData.length!=0) {
				self.set('showGrid',true);//No I18N
				self.set('widgetData.noData',false);//No I18N
				self.set('widgetData.gridReload',true);//No I18N
				self.set('widgetData.gridDataArray',sendObj);//No I18N
			}
			else if(self!==undefined && self!==null && !currentWidgetData.ondemandWidget && noFirstApiCallwidgetsByName.indexOf(snapDetails.name)!==-1)
            {
                self.set('showGrid',true);//No I18N
                self.set('widgetData.noData',false);//No I18N
                self.set('widgetData.gridReload',true);//No I18N
                self.set('widgetData.gridDataArray',sendObj);//No I18N
            }
			else {
				self.set('showGrid',false);//No I18N
				if(self.get('widgetData.ondemandWidget')){//No I18N
					self.set('widgetData.noData',false);//No I18N
				}else{
					self.set('widgetData.noData',true);//No I18N
				}
				self.set('widgetData.sizey',2);//No I18N
			//	self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//NO I18N

				if(snapDetails.name === "opm.device.interfaces"){//No I18N
					if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring){
						self.setProperties({showAgentIntfFailureReason:true});
					}else{
						self.set('showSNMPFailReason',true);//No I18N
						if(jsonData.isSNMP !== undefined && !jsonData.isSNMP || jsonData.isSNMP === "false")
						{
							self.set('showSNMPFailReason',false);//No I18N
							self.set('showSNMPNotConfigInfo',true);//No I18N
						}
					}
					self.set('widgetData.noData',true);//No I18N
					self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?13:10);//No I18N
				}
				if(!currentWidgetData.ondemandWidget)
				{
					if(snapDetails.name === "opm.device.activeProcesses"){//No I18N
					self.set('showactiveProcessFailReason',true);//No I18N
					self.set('widgetData.noData',true);//No I18N
					self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?13:20);//No I18N
					}
					if(snapDetails.name === "opm.device.installedSoftwares"){//No I18N
					self.set('showinstallSoftwareFailReason',true);//No I18N
					self.set('widgetData.noData',true);//No I18N
					self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?13:20);//No I18N
					}
					if(OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.isAgentMonitoring){
						self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?10:16);//No I18N
					}
				}
				if(snapDetails.name === "opm.apmplugin.apps"){
					self.set('apmObject',{});//No I18N
					if(window.OPM.apmInstalled !== 'true' || (jsonData.error !== undefined && jsonData.error.code === 5000)){
						self.setProperties({'apmObject.showAPMPluginInstallAD':true,'apmObject.apmInstalled':false,'widgetData.noData':true,'widgetData.sizey':(window.OPM.isNewSnapshotPage?28:24)});//No I18N
					}
				}
				if(snapDetails.name === "opm.device.notes" || snapDetails.name==="opm.interface.notes" || currentWidgetData && currentWidgetData.widgetIdentifierStr === "widget-customFields"){
					self.set('showAssociationCFields',true);//No I18N
					var isintfNotes =false;
					if(snapDetails.name==="opm.interface.notes"){
						isintfNotes = true;
					}
					self.set('isIntfCustField',isintfNotes);//No I18N
					self.set('widgetData.noData',false);//No I18N
					self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?13:8);//No I18N
				}
				
				if(snapDetails.name === "opu.ipam.dhcpscope"){
					var dhcpServerData = self.get('snapshotObj.rows')[0];
					if((dhcpServerData != undefined && dhcpServerData['server-type-int'] == 1) && dhcpServerData['scan-status-int'] !== '5'){//No I18N
						self.set('showScopeNoDataAlert',true); //No I18N
						self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?13:9);//No I18N
						$('#exportCSVIcon').parent().hide();			
					}else if((dhcpServerData != undefined && dhcpServerData['scan-status-int'] === '5')){//No I18N
						self.set('showAppliedCredentialsKB',true);//No I18N
						self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?13:9);//No I18N
        					$('#exportCSVIcon').parent().hide();
					}			
				}
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//NO I18N
			}


		}else {
			if(self!==undefined && self!==null){
			    self.set('showGrid',false);
			    if(self.get('widgetData.ondemandWidget')){
					self.set('widgetData.noData',false);//No I18N
				}else{
					self.set('widgetData.noData',true);//No I18N
				}
			    self.set('widgetData.sizey',2);//No I18N
			    self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//NO I18N
		    }
		}
		
		//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
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

OPMClient.OpmSettingsCommonGridComponent = Ember.Component.extend({
	className:'opm_jqGridUI opm_jqGridUIHdr', //No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .select2').select2();
		var gridData = this.get('gridData');
		if(gridData!==undefined){
			if(gridData.className!==undefined){
				this.set('className',gridData.className); //No I18N
			}
			$('.select2').select2();
			if(gridData.data !== undefined && gridData.data) {
				gridData.defaultOptions.pagination = false;
				gridData.defaultOptions.minRowsPerPage = (gridData.data !== undefined)?gridData.data.length:50;
			}
			opm_loadJQgridWithData("#"+gridData.gridId, gridData.data, gridData.colNames, gridData.colModels, gridData.captionTitle, gridData.gridNavigator, gridData.onSelectFunction, gridData.defaultOptions, gridData.page);
		}
	},
	loadModuleViewerTable:function(){
		var dataObj={};
		if(this.gridData.data!==undefined){
			$("#"+this.gridData.gridId).jqGrid("clearGridData", false).trigger("reloadGrid"); 
			for ( var i = 0; i < this.gridData.data.length; i++) {  
				var dataObj={};
				for(var j=0;j<this.gridData.data[i].length;j++){
					dataObj[j]=this.gridData.data[i][j];
				}
				$("#"+this.gridData.gridId).jqGrid('addRowData', i + 1, dataObj);    
			}
		} 
	}.observes('gridData.data') //No I18N
});

OPMClient.OpmCommonGridComponent = Ember.Component.extend({
	className:'opm_jqGridUI', //No I18N
	didInsertElement: function(){
		$('#'+this.elementId+' .select2').select2();
		var gridData = this.get('gridData');
		if(gridData!==undefined){
			if(gridData.className!==undefined){
				this.set('className',gridData.className); //No I18N
			}
			if((gridData.defaultOptions !== undefined && gridData.defaultOptions.multiselect !== undefined) && gridData.defaultOptions.multiselect == true){
				$(gridData.id).closest(".opm_jqGridUI").addClass('opm_jqGridCustomCheckBox'); //No I18N
			}
			$('.select2').select2();

			if(gridData.nfaCustomPagerDetails!==undefined && gridData.nfaCustomPagerDetails) {
				gridData.defaultOptions.pagination = false;
				gridData.defaultOptions.minRowsPerPage = (gridData.data!==undefined)?gridData.data.length:0;
				this.set("gridData.nfaCustomPagerDetails.viewInfo",nfa_getCustomPagerViewInfo(this.gridData.nfaCustomPagerDetails.rows,this.gridData.nfaCustomPagerDetails.pageCount,this.gridData.defaultOptions.minRowsPerPage)); //NO I18N
				$("#"+this.elementId+" .nfaCustomerPagination .rowCount").val(this.gridData.nfaCustomPagerDetails.rows);
			}

			if(this.get('isOputilsGrid')){
				gridData.isOputilsGrid=true;
				if(!gridData.defaultOptions){
					gridData.defaultOptions = {}
				}
				gridData.defaultOptions.savePagination = true;
				opm_loadJqGridBasedOnCount(gridData);
			}else if(gridData.onSelectFunction!== undefined && gridData.onSelectFunction === "storageSelectGrid"){//No I18N
				opm_loadJqGridBasedOnCount(gridData);
			}
			/* NGFW SLAs share SDWANTunnelsListSelFn but are served in full, so they take the
			   client-side path below instead of the SD-WAN server-side grid. */
			else if(gridData.onSelectFunction === "SDWANTunnelsListSelFn" && gridData.snapName !== "opm.ngfw.slas"){//No I18N
				gridData.id = "#"+gridData.gridId;
				gridData.colNamesList = gridData.colNames;
				gridData.colModelList = gridData.colModels;
				gridData.sortName = "displayName";//No I18N
				gridData.data ={};  // ← Add this line
				gridData.searchOption=true;
				gridData.toggleSearch=true;
				gridData.page = (gridData.page !== undefined && gridData.page > 0) ? gridData.page : 1;
				if(!gridData.defaultOptions){
					gridData.defaultOptions = {}
				}
				if(gridData.snapDetails!==undefined && gridData.snapDetails.name==="opm.sdwan.underlayTunnels"){
    			    gridData.data.tunnelType="underlay";//NO I18N
				}
				gridData.defaultOptions.search=true;
				gridData.pagerId="#"+gridData.pagerId;
				gridData.defaultOptions.pagerId=gridData.pagerId;
				opm_loadJqGridBasedOnCount(gridData);
			}
			else{
				opm_loadJQgridWithData("#"+gridData.gridId, gridData.data, gridData.colNames, gridData.colModels, gridData.captionTitle, gridData.isNdmFwSnapshotPage ? ("#"+ gridData.pagerId) : gridData.gridNavigator, gridData.onSelectFunction, gridData.defaultOptions, gridData.page);
				// Default sort by col handled
				if(gridData.defaultOptions!==undefined && gridData.defaultOptions.sortName!==undefined) {
					var sortOrder = "asc"; //No I18N
					if(gridData.defaultOptions.sortOrder!==undefined) {
						sortOrder = gridData.defaultOptions.sortOrder;
					}
					$("#"+gridData.gridId).jqGrid('sortGrid',gridData.defaultOptions.sortName, true, sortOrder);//No I18N
				}
			}
			$('#'+gridData.gridId).addClass('ut ut-Grid');
			if($("#gs_classType").length){ //No I18N
				$("#gs_classType").select2(); //No I18N
				var rogueBadge = $(".wlcTabIconRouge b"); //No I18N
				var totalRogue = $("#"+gridData.gridId).jqGrid('getGridParam','records'); //No I18N
				if(rogueBadge.length){
					rogueBadge.data('original', totalRogue); //No I18N
					rogueBadge.text(totalRogue);
				}
				$("#gs_classType").val('').trigger('change.select2'); //No I18N
				$("#gs_classType").off('change.rogueBadge').on('change.rogueBadge', function(){ //No I18N
					var sel = $(this).val();
					var badge = $(".wlcTabIconRouge b"); //No I18N
					if(!badge.length) {
					    return;
					}
					setTimeout(function(){
						if(!sel || sel === ''){
							badge.text(badge.data('original')); //No I18N
						} else {
							badge.text($("#"+gridData.gridId).jqGrid('getGridParam','reccount')); //No I18N
						}
					}, 100);
				});
			}
			if(OPMClient.InventoryDeviceDetailsController.selectedTab === "Workflow") {
				$('.Workflow .opm_jqGridUI').addClass('opmReportsGridview'); //No I18N
			}
			if(OPMClient.InventoryDeviceDetailsController.opuNewSnapshot){
				if(gridData.onSelectFunction === 'ipam_switchportList' || gridData.onSelectFunction === 'ipam_ipsList'){
					$(gridData.id).closest(".opm_jqGridUI").addClass('rowOverflowVisible');
				}
				if(gridData.onSelectFunction === "ipam_DHCP_Scopes" || gridData.onSelectFunction === "ipam_DNS_zones" || gridData.onSelectFunction === "ipam_dnsList"){
                    $('#'+gridData.gridId).closest(".opm_jqGridUI").addClass('widgetJqGridFlow');
                    $('#'+gridData.gridId).closest(".opm_jqGridUI").addClass('opmReportsGridview');
                    $("#gs_dhcp-scope-state").select2();
                }
                if(gridData.onSelectFunction === "ipam_DHCP_ips" || gridData.onSelectFunction === "ipam_dhcpList" ){
                    $(gridData.id).closest(".opm_jqGridUI").addClass("colChooserlastcellHide");
                }
				$(gridData.id).closest(".opm_jqGridUI").addClass('widgetJqGridFlow');
				$(gridData.id).closest(".opm_jqGridUI").addClass('opmReportsGridview');
				$("#macAddressTable").closest(".opm_jqGridUI").removeClass("opm_jqGridCustomCheckBox");//No I18N
				$("#macAddressTable").closest(".opm_jqGridUI").removeClass("widgetJqGridFlow");//No I18N
			}
			if(OPMClient.InventoryDeviceDetailsController.handleShowMore && Object.keys(OPMClient.InventoryDeviceDetailsController.vmsDataCache).length){
				if(OPMClient.InventoryDeviceDetailsController.vmsDataCache[OPMClient.InventoryDeviceDetailsController.selectedVMType].length > 10){
					$('#'+this.elementId+' .widgetListMore').show();
				}else{
					$('#'+this.elementId+' .widgetListMore').hide();
				}
			}
		}
	},
	nfaCustomPreviousPageClass:function() {
		return "previous "+this.get('gridData.nfaCustomPagerDetails.previousPage');//No I18N
	}.property('gridData.nfaCustomPagerDetails.previousPage'),//No I18N
	nfaCustomNextPageClass:function() {
		return "next "+this.get('gridData.nfaCustomPagerDetails.nextPage');//No I18N
	}.property('gridData.nfaCustomPagerDetails.nextPage'),//No I18N
	actions: {
		expandWidget: function(){
			this.sendAction('action','expand');
		},
		nfaCustomPagerNext: function(action) {
			if(action === 'iconDisabled') {return;}
			this.set("gridData.nfaCustomPagerDetails.nextPage","iconDisabled"); //NO I18N
			this.gridData.nfaCustomPagerDetails.pageCount = this.gridData.nfaCustomPagerDetails.pageCount +1;
			this.sendAction('action','reload');
		},
		nfaCustomPagerPrevious: function(action) {
			if(action === 'iconDisabled') {return;}
			this.set("gridData.nfaCustomPagerDetails.previousPage","iconDisabled"); //NO I18N
			this.gridData.nfaCustomPagerDetails.pageCount = this.gridData.nfaCustomPagerDetails.pageCount -1;
			this.sendAction('action','reload');
		},
		nfaCustomPagerRowCountChanged:function() {
			this.gridData.nfaCustomPagerDetails.rows = $("#"+this.elementId+" .nfaCustomerPagination .rowCount").val(); //NO I18N
			this.gridData.nfaCustomPagerDetails.pageCount=1;
			this.sendAction('action','reload');
		},
		nfaCustomPagerExportCSV:function() {
			opm_generateCSV($("#"+this.gridData.gridId)); //NO I18N
		},
		nfaCustomPagerExportXLS:function() {
			opm_generateXLSFromServer($("#"+this.gridData.gridId)); //NO I18N
		}
	},
	willDestroyElement: function(){
		$('.oputilsSnapshot .ipam').removeClass('ipamGrid');
		var grids = $("#"+this.elementId).find('.ui-jqgrid-btable');
		$.each(grids, function(index, grid){
			var gridId = $(grid).attr('id');
			if(gridId!==undefined && gridId!==null && gridId!==""){
				$("#"+gridId).jqGrid('destroyFilterToolbar');
				$("#"+gridId).jqGrid('GridUnload');
				$("#"+gridId).jqGrid('GridDestroy');
				$("#"+gridId).unbind();
				$("#"+gridId).remove();
			}
		});
		grids=null;
		$('#'+this.elementId).find('*').remove();
	}
});


OPMClient.OpmCommonZgraphComponent = Ember.Component.extend({
	classNames:['heightAuto'],
	zClassName:"zohoGraph",
	didInsertElement: function(){
		var chartObj = this.get('chartObj');
		var consolidatedValues = this.get('consolidatedValues');
		var graphSeries = this.get('graphSeries');
		if(chartObj!==undefined){
			if(chartObj.classNames!==undefined && chartObj.classNames.length>0){
				this.set('zClassName',chartObj.classNames.join(' '));
			}
			var arraObj={
		        "placeholder":[],//No I18N
		        "chartobj":[]//No I18N
		    }
		    if(consolidatedValues!==undefined && consolidatedValues!==null){
		    	arraObj.consolidatedValues=consolidatedValues;
		    }
		    if(graphSeries !==undefined && graphSeries !==null){
		    	arraObj.graphSeries=graphSeries;
		    }

		    if(!OPMClient.HomeDetailsController.unlessNocView && window.OPM.currentView.name === "EmbedGraph.Index")
		    {	
		    	var prntWid = $("#opm_graphContainter").width();
            	$("#perfGraph").css("width",(prntWid-100)+"px");//No I18N
            }

		    arraObj.chartobj.push(chartObj);
		    arraObj.placeholder.push(chartObj.id); //No I18N
		    zChart(arraObj);
		}
	},
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

OPMClient.OpmRemotegridComponent = Ember.Component.extend({
	templateName: "components/opm-remotegrid",
	jsonData:{},
	showGrid:false,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var snapshotData = currentWidgetData.snapshotData;
		var self = this;
		if(!self.get('widgetData.ondemandWidget')){
			var apiURL = opm_getSnapApiURL(currentWidgetData,this.snapshotObj,this.additionalProps);
			var url = apiURL + "&jqgridLoad=true"; // No I18N
			var reload = false;
			var pageReload =false;
			var expandWidget = currentWidgetData.expandView;
			if(snapshotData.colNamesListI18N===undefined){
				snapshotData.colNamesListI18N = [];
			}

			if(snapshotData.colNamesListI18N.length===0) {
				for(var i = 0; i < snapshotData.colModelList.length; i++) {
					var columnModel = snapshotData.colModelList[i];
					if("" != snapshotData.colNamesList[i] && Ember.I18n.t(snapshotData.colNamesList[i],this).indexOf("Missing translation") === -1){
						snapshotData.colNamesListI18N[i] = Ember.I18n.t(snapshotData.colNamesList[i],this);
						}
					else{
						snapshotData.colNamesListI18N[i] = snapshotData.colNamesList[i];
					}
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
				}
			}
			var defaultOptions = {
				multiselect: false,
				searchOption: true,
				toggleSearch: false,
				minRowsPerPage: (expandWidget)?50:10,
				isSnapshotGrid: true,
				snapId: currentWidgetData.id,
				reload: reload,
				reloadMsgId: "",
				pagination: (expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?true:false,
				expandedGrid: expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget
			};
			var gridCallBack = function(gridID,paramsObj){
				var gridTotal = $(gridID).jqGrid('getRowData').length;
				if(gridTotal!==undefined && gridTotal!==null && gridTotal>0){
					var gridH = $('#gbox_'+gridID.replace('#','')).height()+30;
					var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
					if(cellCount===3){
						cellCount=4;
					}
					if(window.OPM.isNewSnapshotPage){
						cellCount = Math.ceil((gridH+42)/22);
					}
					paramsObj.self.set('widgetData.noData',false); //No I18N
				}
				else{
					var cellCount = 2;
					setTimeout(function(){
						$(gridID).jqGrid('destroyFilterToolbar');
						$(gridID).jqGrid('GridUnload');
						$(gridID).jqGrid('GridDestroy');
						$(gridID).unbind();
						$(gridID).find('*').remove();
					},50);
					if(paramsObj.callBackNote){
                        paramsObj.self.set('widgetData.noData',false); //No I18N
                        paramsObj.self.set('widgetData.callBackNote',paramsObj.callBackNote); //No I18N
					}
					else {
				    	paramsObj.self.set('widgetData.noData',true); //No I18N
					}

				}
				paramsObj.self.set('widgetData.sizey',cellCount);
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);
			}
			
			//Check added to enable pagination and row size for interface and vlan widgets 
			if(currentWidgetData.name == "ncm.device.interfaces" || currentWidgetData.name == "ncm.device.vlanDetails") {
				defaultOptions.minRowsPerPage = 50;
				defaultOptions.pagination = true;
			}
			defaultOptions.gridCallBack = gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			var remotegridObj ={};
			remotegridObj.gridId = "opm_DeviceSnapList_"+currentWidgetData.id;
			remotegridObj.pagerId = "opm_DeviceSnapPager"+currentWidgetData.id;
			remotegridObj.defaultOptions = defaultOptions;
			remotegridObj.isNCMRemoteGrid=true;
			remotegridObj.gridUrl = url;
			remotegridObj.colModel = snapshotData.colModelList;
			remotegridObj.colName = snapshotData.colNamesListI18N;
			remotegridObj.captionTitle="";
			remotegridObj.gridNavigator="opm_DeviceSnapPager_"+currentWidgetData.id;
			remotegridObj.onSelectFunction=snapshotData.onselectfunction;
			self.setProperties({showGrid:true,gridData:remotegridObj});
		}
		else{
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmCommonRemotegridComponent = Ember.Component.extend({
	didInsertElement: function(){
		var gridData = this.get('gridData');
		loadJQgridWithRemote("#"+gridData.gridId, gridData.gridUrl, gridData.colName, gridData.colModel, gridData.captionTitle, "#"+gridData.gridNavigator, gridData.onSelectFunction, gridData.defaultOptions, gridData.gridCallBack);
	},
	willDestroyElement: function(){
		var grids = $("#"+this.elementId).find('.ui-jqgrid-btable');
		$.each(grids, function(index, grid){
			var gridId = $(grid).attr('id');
			if(gridId!==undefined && gridId!==null && gridId!==""){
				$("#"+gridId).jqGrid('destroyFilterToolbar');
				$("#"+gridId).jqGrid('GridUnload');
				$("#"+gridId).jqGrid('GridDestroy');
				$("#"+gridId).unbind();
				$("#"+gridId).remove();
			}
		});
		grids=null;
		$('#'+this.elementId).find('*').remove();
	}
});

//Inventory Components
OPMClient.OpmCommonSnapgridArrayComponent = Ember.Component.extend({
	classNames:['grid-stack','widgetLoading'], //No I18N
	templateName:"components/opm-common-snapgrid-array", //No I18N
	didInsertElement: function(){
		var snapType = this.get("snapshotObj.snapType"); //NO I18N
		if(snapType==='IPAMPort' || snapType==='IPAMIP'){
			$('#'+this.elementId+' .grid-stack-item-content').addClass("overflow-visible");
		}
		var isFullView = this.get("snapshotObj.snapDetails.fullView"); //NO I18N
		OPMClient.ApplicationController.set("isNeedSnapShotTabSubMenus",(nfaSnapType.contains(snapType) && !isFullView && window.OPM.isNeedSnapShotTabSubMenus)); //NO I18N
		if(OPMClient.ApplicationController.isNeedSnapShotTabSubMenus) {
			$("body").addClass("nfaTabSubMenuWidget"); //No I18N
		}
	},

	// Apply inline top positioning for widgets whose rowNum exceeds the CSS range (max 300 for snapRevamp1).
    // Without this, widgets render at top:0 and overlap until snapGridReloadObserver fires.
    widgetsPositionObserver: function(){
        if(!window.OPM.isNewSnapshotPage){ return; }
        var self = this;
        Ember.run.scheduleOnce('afterRender', function(){ //No I18N
            var cellHeight = 22;
            $('#'+self.elementId).children('.grid-stack-item').each(function(){
                var gsY = parseInt($(this).attr('data-gs-y'));
                if(gsY > 300){
                    $(this).css('top', ((gsY - 1) * cellHeight) + 'px');//NO I18N
                }
            });
        });
    }.observes('widgetsWithData.length'), //No I18N

	additionalPropsObserver: function(){
		this.classNames=this.additionalProps.gridClassName;
	}.observes('this.additionalProps').on('init'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		if($("body").hasClass("nfaTabSubMenuWidget")) { //No I18N
			$("body").removeClass("nfaTabSubMenuWidget"); //No I18N
		}
	}
});
OPMClient.OpmCommonSnapgridComponent = Ember.Component.extend({
	templateName:"components/opm-common-snapgrid", //No I18N
	didInsertElement: function(){
		var snapshotName=this.get('snapshotName');
		var snapType = this.get('snapType');
		var deviceName = this.get('deviceName');
		var snapshotData = this.get('snapshotData');
		var self = this;
		if(snapType!=undefined){
		// opm_loadWidgetComponents(snapType,snapshotName,self);

		//OPMClient.InventoryDeviceDetailsController.expandSnapWidget = false;
		//OPMClient.InventoryDeviceDetailsController.isShortsummary = false;

		if(snapType.indexOf("Flow")===0) { //NO I18N
			OPMClient.InventoryNFAController.set("isNFASnapshot", true); //NO I18N
			$('#snapshotTimeFrameList li[data-value="15Minute"],[data-value="30Minute"],[data-value="6Hour"],[data-value="yesterday"]').show();
			$('.DI-Header .timeFilterList').addClass('dateInfo');
			$('.timeFilterList .timeFrameDateInfo').show();
		}
		if(snapType.indexOf("DPI")===0) { //NO I18N
			OPMClient.InventoryNFAController.set("isDPISnapshot", true); //NO I18N
			$('.DI-Header .timeFilterList').addClass('dateInfo');
			$('.timeFilterList .timeFrameDateInfo').show();
			$('#snapshotTimeFrameList li:not(".header")').hide();
			$('#snapshotTimeFrameList li[data-value="LastHour"],[data-value="2Hour"],[data-value="4Hour"],[data-value="6Hour"],[data-value="custom"]').show();
		}

		if((fwaSnapShotWithCategoryNSeries.indexOf(snapType) > -1) || (fwaSnapShotWithCategory.indexOf(snapType) > -1) || OPMClient.InventoryDeviceDetailsController.inventorysnapType=="FirewallService" || OPMClient.InventoryDeviceDetailsController.inventorysnapType=="FirewallRules" || OPMClient.InventoryDeviceDetailsController.inventorysnapType=="FirewallUsers" || OPMClient.InventoryDeviceDetailsController.inventorysnapType=="FirewallDevice" || OPMClient.InventoryDeviceDetailsController.inventorysnapType=="FirewallInterface"){
			if(OPMClient.FWAGlobalDataController.timePeriod != undefined){
				var timePeriod=OPMClient.InventoryDateTimeFWAController.get(OPMClient.FWAGlobalDataController.timePeriod);
				OPMClient.FWAGlobalDataController.timePeriod = (timePeriod !== undefined)?timePeriod:'today'; //No I18N
			}else{
				OPMClient.FWAGlobalDataController.timePeriod="today";//No I18N
			}
			setfwaCustomTimeFromTimeFrame();
			
		}else if(OPMClient.InventoryNFAController.isNFASnapshot || OPMClient.InventoryNFAController.isDPISnapshot) {
			OPMClient.FWAGlobalDataController.timePeriod = nfa_getSnapshotTimeFrame();
		}else {
			OPMClient.FWAGlobalDataController.timePeriod = "today"; //NO I18N
		}

		$('.DI-Header .timeFilterList ul li').removeClass("active");
		$('.DI-Header .timeFilterList ul li[data-value="'+OPMClient.FWAGlobalDataController.timePeriod+'"]').addClass("active");
		$('#snapshottimeFrameTitle').text($('.DI-Header .timeFilterList ul li.active').data('title')); //NO I18N

		if(snapType == "FirewallService" || snapType == "FirewallUsers" || snapType == "FirewallRules" || (fwaSnapShotWithCategoryNSeries.indexOf(snapType) > -1) || (fwaSnapShotWithCategory.indexOf(snapType) > -1)){//No I18N
			if(OPMClient.ApplicationController.isAuthorized == true){
				fwa_listFirewallDevicesInSelect('fwachangeDevice','',function(){//No I18N
					if($("#fwachangeDevice option[value='"+OPMClient.InventoryFWAController.selDeviceID+"']").length === 0){
						OPMClient.InventoryFWAController.selDeviceID="all";//No I18N
					}
					$('#fwachangeDevice').val(OPMClient.InventoryFWAController.selDeviceID);
				});
			}
			else{
				fwa_DevSelectionReportInOper('fwachangeDevice','',function(){//No I18N
					if($("#fwachangeDevice option[value='"+OPMClient.InventoryFWAController.selDeviceID+"']").length != 0){
						$('#fwachangeDevice').val(OPMClient.InventoryFWAController.selDeviceID);
					}
					OPMClient.InventoryFWAController.selDeviceID=$('#fwachangeDevice').val();
				});//No I18N
			}
			$('#fwachangeDevice').select2();
			$('#fwaDeviceSelection').show();
		}

		reloadNeededWidgets = new Array();
		deviceSlideOut(1);
		deviceSlideOut(2);
		deviceSlideOut(3);
		loadInvSnapShotListTimeFrame();
		moreActions();
		browseActions();
		terminalActions();
		//confActions();
		//deviceMenuAccr();
		//opmMoreList();
		opm_tooltip();
		//setCustomTimeFilter();
		// $('.DI-Options.actions').off();

		// $('.DI-Options.actions').on('click','.icon-left-open',function(){
  //   		OPMClient.DeviceActionController.prev(snapType, OPMClient.InventoryDeviceDetailsController.selDevice);
		// });
		// $('.DI-Options.actions').on('click','.icon-right-open',function(){
		// 	OPMClient.DeviceActionController.next(snapType,  OPMClient.InventoryDeviceDetailsController.selDevice);
		// });
		
		// var snapshotDataObj = snapshotData;
		// snapshotChartObj = {
		//     "placeholder":[],//No I18N
		//     "chartobj":[]//No I18N
		// }
		// if(snapshotDataObj.timeSelectionNeeded != undefined && !snapshotDataObj.timeSelectionNeeded) {
		// 	$(".timeFilterList").hide();
		// }
		// // done to exclude users and rule snapshot for fwareportlist
		// if(snapType == "FirewallUsers" || snapType == "FirewallRules"){
		// 	$(".timeFilterList").show();
		// }
		// if(snapType==="MonitoringDevice") {
		// 	if(OPMClient.ApplicationController.isGraphDataSelected == true) {
		// 		OPMClient.ApplicationController.isGraphDataSelected = false;
		// 		openSnapshotGraph();
		// 	} else if(OPMClient.ApplicationController.isMonitorDataSelected == true) {
		// 		OPMClient.ApplicationController.isMonitorDataSelected = false;
		// 		openSnapshotMonitor();
		// 	}	
		// }
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});





OPMClient.OpmRemoteSubGridComponent = Ember.Component.extend({
	templateName: "components/opm-remotegrid",
	showGrid:false,
	didInsertElement:function() {
		var currentWidgetData = this.widgetData;
		var snapshotData = currentWidgetData.snapshotData;
		var self = this;
		var apiURL = opm_getSnapApiURL(currentWidgetData,this.snapshotObj,this.additionalProps);
		var url = apiURL + "&jqgridLoad=true"; // No I18N
		var reload = false;
		var pageReload =false;
		var expandWidget = currentWidgetData.expandView;
		// if(!currentWidgetData.reloadWidget) {
		// 	for(var i = 0; i < snapshotData.colModelList.length; i++) {
		// 		var columnModel = snapshotData.colModelList[i];
		// 		if("" != snapshotData.colNamesList[i]) {
		// 			snapshotData.colNamesList[i] = Ember.I18n.t(snapshotData.colNamesList[i],this);
		// 		}
		// 		if(columnModel.formatter != null && columnModel.formatter != "") {
		// 			var tmpFunc = new Function('return '+columnModel.formatter);
		// 			columnModel.formatter = tmpFunc();
		// 		}
		// 	}
		// 	if(snapshotData.subgrid != null) {
		// 		for(var i = 0; i < snapshotData.subgrid.colModelList.length; i++) {
		// 			var columnModel = snapshotData.subgrid.colModelList[i];
		// 			if("" != snapshotData.subgrid.colNamesList[i]) {
		// 				snapshotData.subgrid.colNamesList[i] = Ember.I18n.t(snapshotData.subgrid.colNamesList[i],this);
		// 			}
		// 			if(columnModel.formatter != null && columnModel.formatter != "") {
		// 				var tmpFunc = new Function('return '+columnModel.formatter);
		// 				columnModel.formatter = tmpFunc();
		// 			}
		// 		}
		// 	}
		// }
		if(snapshotData.colNamesListI18N===undefined){
			snapshotData.colNamesListI18N = [];
		}
		if(snapshotData.subgrid!==undefined && snapshotData.subgrid != null) {
			if(snapshotData.subgrid.isLoad === undefined){
				snapshotData.subgrid.isLoad=true;
				for(var i = 0; i < snapshotData.subgrid.colModelList.length; i++) {
					var columnModel = snapshotData.subgrid.colModelList[i];
					if("" != snapshotData.subgrid.colNamesList[i] && Ember.I18n.t(snapshotData.subgrid.colNamesList[i],this).indexOf("Missing translation") === -1){
						snapshotData.subgrid.colNamesList[i] = Ember.I18n.t(snapshotData.subgrid.colNamesList[i],this);
					}
					else{
						snapshotData.subgrid.colNamesList[i] = snapshotData.subgrid.colNamesList[i];
					}
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
				}
			}
		}
		if(snapshotData.colNamesListI18N.length===0) {
			for(var i = 0; i < snapshotData.colModelList.length; i++) {
				var columnModel = snapshotData.colModelList[i];
				if("" != snapshotData.colNamesList[i] && Ember.I18n.t(snapshotData.colNamesList[i],this).indexOf("Missing translation") === -1){
					snapshotData.colNamesListI18N[i] = Ember.I18n.t(snapshotData.colNamesList[i],this);
				}
				else{
					snapshotData.colNamesListI18N[i] = snapshotData.colNamesList[i];
				}
					if(columnModel.formatter != null && columnModel.formatter != "") {
						var tmpFunc = new Function('return '+columnModel.formatter);
						columnModel.formatter = tmpFunc();
					}
				}
			}
		var defaultOptions = snapshotData.subgrid;
		defaultOptions.multiselect= false,
		defaultOptions.searchOption= true,
		defaultOptions.toggleSearch= false,
		defaultOptions.paramURL=currentWidgetData.paramURL;
		defaultOptions.minRowsPerPage= (expandWidget)?50:10,
		defaultOptions.subGrid= true,
		defaultOptions.setWidth=false,
		defaultOptions.isSnapshotGrid=true,
		defaultOptions.snapId= currentWidgetData.id,
		defaultOptions.reload= reload,
		defaultOptions.reloadMsgId= "",
		defaultOptions.pagination= (expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget)?true:false,
		defaultOptions.expandedGrid= expandWidget || OPMClient.InventoryDeviceDetailsController.expandSnapWidget
		var gridCallBack = function(gridID,paramsObj){
			var gridH = $('#gbox_'+gridID.replace('#','')).height()+30;
			var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
			if(cellCount===3){
				cellCount=4;
			}
			if(window.OPM.isNewSnapshotPage){
				cellCount = Math.ceil((gridH+42)/22);
			}
			paramsObj.self.set('widgetData.sizey',cellCount);
			paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);
		}
		var remotegridObj ={};

		defaultOptions.gridCallBack = gridCallBack;
		defaultOptions.gridCallBackParams={self:self};

		remotegridObj.gridId = "opm_DeviceSnapList_"+currentWidgetData.id;
		remotegridObj.defaultOptions = defaultOptions;
		remotegridObj.isNCMRemoteGrid=true;
		remotegridObj.gridUrl = url;
		remotegridObj.colModel = snapshotData.colModelList;
		remotegridObj.colName = snapshotData.colNamesListI18N;
		remotegridObj.captionTitle="";
		remotegridObj.gridNavigator="opm_DeviceSnapPager_"+currentWidgetData.id;
		remotegridObj.onSelectFunction=snapshotData.onselectfunction;
		self.setProperties({showGrid:true,gridData:remotegridObj});
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});






//IPSLA




OPMClient.OpmPieChartComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",
	showGrid:false,
	didInsertElement:function() {
		var self = this;
		var jsonData = this.get('widgetData').apiData;
		var pushData = null;
		if(jsonData.avilability!==undefined && jsonData.avilability != null) {
			pushData = jsonData.avilability[0];
		} else {
			pushData = jsonData;
		}
		
		var colNames1 = [
			'',
			'Availability', //No I18N	
			'',
			''
		];
		
		var colModel1 =	[
			{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},//NO I18N
			{ name: 'APP', index:'APP',sortable: false}, //No I18N
			{ name: 'CHART', index:'CHART', width:400, formatter: appPercentageFormatter}, //No I18N
			{ name: 'PERCENTAGE', index:'PERCENTAGE', hidden: true, width:50} //No I18N
		];
		
		var multiData = new Array();
		var gridData1 = new Array();
		if (pushData != null) {
			for (var indexx = 0; indexx < Object.keys(pushData).length; indexx++) {
				var obj = {
						
				};
				var array_element = pushData[Object.keys(pushData)[indexx]];
				
				obj.APP=Object.keys(pushData)[indexx];
				obj.CHART=array_element;
				obj.PERCENTAGE=array_element+" %";
				gridData1.push(obj);
				var arr = new Array();
				arr.push(Object.keys(pushData)[indexx]+" : "+array_element);
				arr.push(array_element);
				multiData.push(arr);
			}
		}

		var sendObj = {};
		sendObj.gridId = 'opm_App_Legend'+this.get('widgetData').id;//No I18N
		sendObj.data = gridData1;
		sendObj.defaultOptions = {sortName: 'PERCENTAGE',sortOrder: 'desc',pagination:false,minRowsPerPage:11};//No I18N
		sendObj.colModels = colModel1;
		sendObj.colNames = colNames1;
		sendObj.onSelectFunction = 'opm_App_Legend';//No I18N
		self.setProperties({'showGrid':true,'gridData':sendObj});

		var type = 'pie';
		var graphParams = {};
		graphParams.id = 'perfGraph1'+this.get('widgetData').id;//No I18N
		graphParams.data = multiData;
		graphParams.type = type; // application or protocol
		graphParams.graphType = 'pie';//No I18N
		self.set('graphParams',graphParams);
			if(graphParams.data.length<=0){
				self.set('widgetData.sizey',2); //No I18N
				self.set('widgetData.noData',true); //No I18N
		}else{
			self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?16:13);//No I18N
			self.set('widgetData.noData',false); //No I18N
			}
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		$(".expandTimeselcom .timeFrameDateInfo").hide();
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmModuleTableComponent = Ember.Component.extend({
	templateName: "components/opm-module-table", //No I18N
	showGrid:false,
	didInsertElement:function() { 
	},
	reloadTable: function(){
		var self = this;
		var jsonData = this;
		var colNames=[
			Ember.I18n.t('opu.snmp.SNO',this), //No I18N
			Ember.I18n.t('opu.snmp.TABLE',this), //No I18N
			Ember.I18n.t('opu.snmp.TABLE_ENTRY',this), //No I18N
			Ember.I18n.t('opu.snmp.TABLE_INDEX',this), //No I18N
			Ember.I18n.t('opu.snmp.TABLE_COLUMN',this) //No I18N
		];
		var colModels=[
			{ name: '0', index: '0',width:'15'}, //No I18N
			{ name: '1', index: '1',width:'40',formatter:tableVectorFormatter}, //No I18N
			{ name: '2', index: '2',width:'50',formatter:tableVectorFormatter}, //No I18N
			{ name: '3', index: '3',width:'50',formatter:tableVectorFormatter}, //No I18N
			{ name: '4', index: '4',width:'50',formatter:tableVectorFormatter}  //No I18N
		];
		var sendObj = {};
		sendObj.gridId = "tableNodesList"//No I18N
		sendObj.data = this.tableData;
		sendObj.colModels = colModels;
		sendObj.colNames = colNames;
		sendObj.captionTitle = Ember.I18n.t('opu.snmp.TABLE_NODES',this);//No I18N
		sendObj.defaultOptions = {};
		sendObj.gridNavigator = "";
		sendObj.onSelectFunction = "";
		self.setProperties({'showGrid':false});//No I18N
		self.setProperties({'showGrid':true,'gridData':sendObj});//No I18N
  		}.observes('tableData').on('init'),//No I18N
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmClientsettingsSnaprecordComponent = Ember.Component.extend({
	templateName: "components/opm-clientsettings-snaprecord",
	tagName:'li',
	didInsertElement:function() {
		$('#'+this.elementId+' .select2').select2();
		$('#'+this.elementId).addClass(this.get('snapRecord.className'));
		if(this.get('snapRecord.group')!=undefined)
		{
			$('#'+this.elementId).addClass('snapshotConfigAccr');
			$('#'+this.elementId).attr('id','groupSelect'+this.get('snapRecord.snapName'));
			//id='groupSelect{{unbound snapRecord.snapName}}'
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmDeviceSnapshotMenuComponent = Ember.Component.extend({
	templateName: "components/opm-device-snapshot-menu", //NO I18N
	classNames:['deviceMenuSlide'],
	didInsertElement:function() {
		var model = this.get('content');
		if(model.snapType !=='Site' && model.snapType !=='Link'){ 
			deviceMenuAccr();
		}
		if($('.deviceMenuAccr header')[0]!==undefined && model.snapType !== "MonitoringInterface"){
			$('.deviceMenuAccr header')[0].click();
		}
		if(window.OPM.isMSPCentral && window.OPM.isProbeSelected) {
			setTimeout(function(){
				$(".hideInProbeSelectedMSPCentral").remove();
			}, 300);
		}
		this.set("isAvailabilityNode",model.isAvailabilityNode); //No I18n
	},
	actions:{
		opm_ipslaEnableDisable:function(action) {
			var self = this;
			if(action==="disable") {
				self.set('additionalProps.isIPSLAEnabled',false); //No I18N
			} else {
				self.set('additionalProps.isIPSLAEnabled',true); //No I18N
			}
			opm_ipslaEnableDisable(action);
		},
		opm_ipslaEdit:function()
		{
			var content = this.get('content');
			redirectSnapShot('IPSLAEdit',content.snapType,content.deviceName);//No I18N
		},
		updateStatus: function(){
			var model = this.get('content');
			var self = this;
			var url = "";
			var data = {};
			if(model.snapType === 'MonitoringDevice')
			{
				url =  window.OPM.apiUrlPattern + "/device/updateDeviceStatus"; //No I18N
				data.name = encodeURIComponent(model.deviceName);
			}
			else
			{
				url = window.OPM.apiUrlPattern + "/device/updateDeviceStatus"; //No I18N
				data.name = encodeURIComponent(model.deviceName);
				data.type = "URL";//No I18N
			}
			opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.devices.status.updatemsg',this)+" "+Ember.I18n.t('webclient.credential.snmp.pleasewait',this));//No I18N
			$.ajax({
				type: 'POST', //No I18N
				url: url, //No I18N
				data: data,
				self: self,
				success: function(response)
				{
					$(".infoMsg").fadeOut();
					var obj = response;
					var message = ""; //No I18N
					if (obj.error != undefined)
					{
						message = obj.error.message;
						cls = 'errorMsg'; //No I18N
						opm_infoMsgs(cls,message); //No I18N
					}
					if (obj.result != undefined)
					{
						message = obj.result.message;
						cls = 'successMsg'; //No I18N						 
						var apiResponse = opm_loadSnapshotModel(model.deviceName,model.snapType,true);
						apiResponse.done(function(jsonData){
							for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
									if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
										OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
									}
								}
							$('body').removeClass('deviceMenuSlideIn');
							if (model.totalSnapData && model.totalSnapData.isVirtualTopBand) {
				              $('.wlcTabUl.NutanixSnapshot li')[0].click();
				         }
				          if (model.isopmMeraki) {
				              $('.wlcTabUl.MerakiSnapshot li')[0].click();
				         }
						if (model.isSDWANController) {
							$('.wlcTabUl.sdwanSnapshot li')[0].click();
						}
				         if(model.isKempLoadBalancer || model.isInDepthLoadBalancer){
				            enableFirstSnapTabActive();
				         }
						});
						opm_infoMsgs(cls,message); //No I18N

					}

				}
			});
		},
		manageUnManage: function(manage,type){
			var model = this.get('content');
			var devName = model.deviceName;
			var self = this;
			var msg = "";//No I18N
			if(type !== undefined && type !== "" && type === "INTERFACE"){//No I18N
				msg = manage === "true" ? Ember.I18n.t('webclient.intf.manage',this) : Ember.I18n.t('webclient.intf.unmanage',this);//No I18N
			}else if(type !== undefined && type !== "" && type === "URL"){
				msg = manage === "true" ? Ember.I18n.t('webclient.opm.settings.monitoring.urlmonitor.manage.confirm',this) : Ember.I18n.t('webclient.opm.settings.monitoring.urlmonitor.unmanage.confirm',this);//No I18N
			}else{
				msg = manage === "true" ? Ember.I18n.t('webclient.settings.licensemanagement.manage',this) : Ember.I18n.t('webclient.settings.licensemanagement',this);//No I18N
				}
			if(model.entityType == 'Nutanix-Cluster' || model.entityType == 'HyperV-Host' || model.isXenMaster || model.enableVIEvents )
			{
				var InfoMsg = model.enableVIEvents ? Ember.I18n.t('webclient.virtual.device.unmanage.confirm.msg',this) : Ember.I18n.t('webclient.virtual.general.device.unmanage.confirm.msg',this);//No I18N
				msg = manage === "true" ? msg : InfoMsg;//No I18N
			}
			
			
			if(confirm(msg)){
				var fromList = false;
				if(devName===undefined || devName==="") {
					fromList = true;
					var grid = jQuery("#opm_Devices");	//No I18N
					var selRowIds = grid.jqGrid('getGridParam','selarrrow');	//No I18N
					var entityArr = [];
					if(selRowIds != undefined){
						$.each(selRowIds, function(){
							var id = this;
							var entity = grid.jqGrid('getCell', id, 'deviceName'); //No I18N
							entityArr.push(entity);
						});
					}
					devName = entityArr.toString();
				}
				if(fromList === true && devName === ""){//No I18N
					devName = OPMClient.InventoryDeviceDetailsController.deviceName;
				}

				var data = {'name':devName};//No I18N
				if(type !== undefined && type !== "" && type === "INTERFACE")
				{
					data.type = type;
					data.isInterface = true;
				}else if(type !== undefined && type !== "" && type === "URL")
				{
					data.isUrl = true;
				}
					
					
				$.ajax({
					url: window.OPM.apiUrlPattern + '/device/setManaged?manage='+manage, //No I18N
					type: 'POST', //No I18N
					data: data,
					self:self,
					success: function(response){
						if(response.error === undefined)
						{
							if(type !== undefined && type !== "" && type === "INTERFACE")
							{
								for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
									if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
										OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
									}
								}
								$('body').removeClass('deviceMenuSlideIn');
								//OPMClient.Inventory.getDeviceSnapDetails(OPMClient.InventoryDeviceDetailsController.interfaceName, 'MonitoringInterface', false);//No I18N
							}
							else if(type !== undefined && type !== "" && type === "URL"){
								for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
									if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
										OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
									}
								}
								$('body').removeClass('deviceMenuSlideIn');
								//OPMClient.Inventory.getDeviceSnapDetails(OPMClient.InventoryDeviceDetailsController.deviceName, 'MonitoringURL', false);//No I18N
							}
							else
							{
								if(fromList) {
									if(OPMClient.InventoryDeviceDetailsController.invenSubTabType === "all" || OPMClient.InventoryDeviceDetailsController.invenSubTabType === "VMware" || OPMClient.InventoryDeviceDetailsController.invenSubTabType === "HyperV" || OPMClient.InventoryDeviceDetailsController.invenSubTabType === "Xen"){//No I18N
										opm_deviceListFilterReset();
										if(OPMClient.InventoryDeviceDetailsController.invenSubTabType === "all" ){//No I18N
											OPMClient.InventoryDeviceDetailsController.deviceFilterObj.subFilter = 'selectedVTypes';//No I18N
											$.getJSON(window.OPM.apiUrlPattern + '/tab/getTabViewDetails?tabName=virtualInventory',function(jsonData)  //No I18N
											{ 
											 	opm_setPolarchartValues('#inventoryVBarChart', jsonData.bySeverity,undefined,{showLabelCount:true});//No I18N
											 	opm_deviceBarchartValues(jsonData.byVirtualType,'#BarHolderInvent',"Virtual");//No I18N
											 	tabDetailsObj = jsonData;
											});
										}else{
											opm_listVirtualFilters(OPMClient.InventoryDeviceDetailsController.invenSubTabType);
										}
										loadDevicesListIntoGrid("Virtual",OPMClient.InventoryDeviceDetailsController.invenSubTabType);//NO I18N
									}
									else{
									loadDevicesListIntoGrid();
									}
									
									$('.opmInventoryHolder .Options i.close').click();
								} else {
									//reloadSnapWidgets(0);
									for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
										if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
											OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
										}
										else if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.List.WAN.Overview.Snapshot"){
											OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
											$('body').removeClass('wan-slider');//No I18n
										}
									}
									$('body').removeClass('deviceMenuSlideIn');
									//OPMClient.Inventory.getDeviceSnapDetails(OPMClient.InventoryDeviceDetailsController.deviceName, 'MonitoringDevice', false);//No I18N
								}
							}
							opm_infoMsgs('successMsg',response.result.message); //No I18N
						} else {
							opm_infoMsgs('errorMsg',response.error.message); //No I18N
						}
						if (model.totalSnapData && model.totalSnapData.isVirtualTopBand) {
				              $('.wlcTabUl.NutanixSnapshot li')[0].click();
				         }
				          if (model.isopmMeraki) {
				              $('.wlcTabUl.MerakiSnapshot li')[0].click();
				         }
				         if (model.isKempLoadBalancer || model.isInDepthLoadBalancer) {
				              enableFirstSnapTabActive();
				         }
						 if (model.isSDWANController) {
							$('.wlcTabUl.sdwanSnapshot li')[0].click();
						}
					}
				});	
			}
		},
		monitoringInterval: function(){
			var content = this.get('content');
			redirectSnapShot('MonitoringIntervals',content.snapType,content.deviceName); //No I18N
		},
		reDiscoverDevice: function(){
			var content = this.get('content');
			content.isAgentMonitoring !== undefined && content.isAgentMonitoring==true ? rediscoverDevice(content.deviceName) : redirectSnapShot('ReDiscoverDevice',content.snapType,content.deviceName); //No I18N
		},
		summaryEdit: function(){
			var content = this.get('content');
			redirectSnapShot('SummaryEdit',content.snapType,content.deviceName);//No I18N
		},
		deleteDevice: function(){
			OPMClient.Inventory.deleteDevice();
		},
		deleteDeviceVirtualEntity: function(){
			deleteVirtualEntity();
		},
		addVMwareDevice: function(){
			var content = this.get('content');
			addVMwareDevice(true,content.entityType);
		},
		suppressAlarms: function(){
			var content = this.get('content');
			redirectSnapShot('SuppressAlarms',content.snapType,content.deviceName);//No I18N
		},
		suppressHWThreshAlarms: function(status){
            var hwConfirmMsg = status === "true" ? Ember.I18n.t('webclient.hwThresh.suppress.confirm',this) : Ember.I18n.t('webclient.hwThresh.unsuppress.confirm',this);//No I18N
            var content = this.get('content');

            opmConfirm("", hwConfirmMsg, '500', function() {
                var url = eeClientReqToProbe(window.OPM.apiUrlPattern + '/device/ConfigureSuppressAlarm',OPMClient.InventoryDeviceDetailsController.eeProbeID); //No I18N
                var data = {};
                data.name = OPMClient.InventoryDeviceDetailsController.deviceName;
                data.type = 'Monitors'; //No I18N
                data.monType = 'HWTHRESHOLD'; //No I18N
                data.suppressInterval = status === "true" ? -1 : 0;
                var response = opm_ajaxPostMethod(url, data);
				if(response.result !== undefined && response.result.message !== undefined){
					opm_infoMsgs('successMsg',response.result.message); //No I18N

					var apiResponse = opm_loadSnapshotModel(content.deviceName,content.snapType,true);
					apiResponse.done(function(jsonData){
						for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
								if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
									OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
								}
							}
						$('body').removeClass('deviceMenuSlideIn');
					});
				}
				else if(response.error !== undefined && response.error.message !== undefined){
					$('body').removeClass('deviceMenuSlideIn');
					opm_infoMsgs('errorMsg',response.error.message);//No I18N
				}
			}, Ember.I18n.t('webclient.topo.objectdetails.managed.yes'), '', Ember.I18n.t('webclient.topo.objectdetails.managed.no'), '', 'dialogStyle2', true, false, '', true, true);//No I18N
		},
        enableDisableHWAlarms: function(status){
            var hwConfirmMsg = status === "true" ? Ember.I18n.t('webclient.hwrule.associate',this) : Ember.I18n.t('webclient.hwrule.disassociate',this);//No I18N
			var content = this.get('content');

			opmConfirm("", hwConfirmMsg, '500', function() {
				var data = {"moid":content.moID,"isEnabled":status};//No I18N
				var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/alarm/handleHWAlarmForDevice", data); //No I18N
				if(response.result !== undefined && response.result.message !== undefined){
					opm_infoMsgs('successMsg',response.result.message); //No I18N

					var apiResponse = opm_loadSnapshotModel(content.deviceName,content.snapType,true);
					apiResponse.done(function(jsonData){
						for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
								if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
									OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
								}
							}
						$('body').removeClass('deviceMenuSlideIn');
					});
				}
				else if(response.error !== undefined && response.error.message !== undefined){
					$('body').removeClass('deviceMenuSlideIn');
					opm_infoMsgs('errorMsg',response.error.message);//No I18N
				}
			}, Ember.I18n.t('webclient.topo.objectdetails.managed.yes'), '', Ember.I18n.t('webclient.topo.objectdetails.managed.no'), '', 'dialogStyle2', true, false, '', true, true);//No I18N
        },
		faultSettings: function(){
			var content = this.get('content');
			redirectSnapShot('FaultSettings',content.snapType,content.deviceName); //No I18N
		},
		addToNCM: function(){
			var content = this.get('content');
			var data = {};
			data.ISMANUALADDITION=false;
			data.IPADDRESS=OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ipAddress;
			var ajaxRequestUrl = window.OPM.apiUrlPattern + '/ncmsettings/addDevice'; //No I18N
			var jsonData = opm_ajaxPostRequest(ajaxRequestUrl,data);

			if(jsonData.SysOIDNotAvailableDevices!== undefined){
				var notAddedCount = (jsonData.SysOIDNotAvailableDevices).length;
				if(notAddedCount == 1){
					redirectSnapShot('AddToNCM',content.snapType,content.deviceName);//No I18N
				} else {
					opm_infoMsgs("successMsg", Ember.I18n.t('webclient.inventory.nfa.addtoncmsuccessmsg', this)); //No I18N
				}
			}
		
		},
		configureIPMI: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'ConfigureIPMI',content.snapType);//No I18N
		},
		addVxRail: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'AddVxRail',content.snapType);//No I18N
		},
		configureHA: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'ConfigureHA',content.snapType);//No I18N
		},
		rediscoverDeviceIntf: function(){
			OPMClient.Inventory.opm_rediscoverDeviceIntf();
		},
		configIntf: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'ConfigIntf',content.snapType);//No I18N
		},
		STPPortDetails: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'STPPortDetails',content.snapType);//No I18N
		},
		addDevicetoGMap: function(){
			var content = this.get('content');
			addDevicetoGMap(content.deviceName,'Add');//No I18N
		},
		customLinks: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'CustomLinks',content.snapType);//No I18N
		},
		/*opmLaunchApp: function(){
			
		}, RDP FEATURE*/
		gotoVlans: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'Vlans',content.snapType);//No I18N
		},
		gotoGroups: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'Groups',content.snapType);//No I18N
		},
		goToAssociateToGroup: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'SnapAssociateToGroup',content.snapType);//No I18N
		},
		goToAssociateToIntfGroup: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'SnapAssociateToGroup',content.snapType);//No I18N
		},
		gotoMaps: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'Map',content.snapType);//No I18N	
		},
		configServicePolicy:function(){
			var content = this.get('content');
			OPMClient.Inventory.configServicePolicy(content.ipAddress, content.deviceName);
		},
		configACL: function(){
			var content = this.get('content');
			OPMClient.Inventory.configACL(content.ipAddress, content.deviceName);
		},
		vmWareEvents: function(){
			var content = this.get('content');
			redirectSnapShot('VMWareEvents',content.snapType,content.deviceName);//No I18N
		},
		adPage: function(){
			var content = this.get('content');
			redirectSnapShot('AD',content.snapType,content.deviceName);//No I18N
		},
		exchangePage: function(){
			var content = this.get('content');
			redirectSnapShot('Exchange',content.snapType,content.deviceName);//No I18N
		},
		mssqlPage: function(){
			var content = this.get('content');
			redirectSnapShot('MSSQL',content.snapType,content.deviceName);//No I18N
		},
		showDeviceHistory: function(){
			var content = this.get('content');
			opm_showDeviceHistory(content.moID);
		},
		openProxmoxChangePrimaryMode: function() {
			var self = this;
			var content = this.get('content');
			var obj = {};
			obj.id = "proxmox_change_primary_node";
			obj.componentName = "OPMClient.ProxmoxChangePrimaryNodeComponent"; //No I18N
			obj.slideHeader = Ember.I18n.t("snapshot.desc.proxmoxNode.changeprimary"); //No I18N
			obj.data = {
				moID: content.moID,
				moName: content.deviceName
			}
			self.get('parentView').set("controller.slideDetails", obj); //No I18N
		},
		changeAutoVmDiscovery : function(enable) {
			var content = this.get('content');//No I18N
            var data = {
				moID: content.moID,
                autoDiscovery: enable
            };
            var url = window.OPM.apiUrlPattern + "/v2/device/updateVirtualDiscoveryProps"; //No I18N
            var resp = opm_ajaxPostRequest(url, data);
            showMessage(resp);
            this.set("content.ProxmoxDetails.isAutoDiscoveryEnabled", enable); //No I18n
		},
		deviceDownSettings: function(){			
			var content = this.get('content');			
			redirectToDeviceSnapshot(content.deviceName,'DevAvailSettings',content.snapType);//No I18N					
		},
		executeVMTask: function(taskID){
			var content = this.get('content');
			executeVMTask(taskID,content.deviceName,content.moID);
		},
		intfEditSummary: function(){
			var content = this.get('content');
			redirectSnapShot('IntfEditSummary',content.snapType,content.deviceName);//No I18N
		},
		suppressAlarms: function(){
			var content = this.get('content');
			redirectSnapShot('SuppressAlarms',content.snapType,content.deviceName);//No I18N
		},
		intfConfigure: function(){
			var content = this.get('content');
			redirectSnapShot('IntfConfigure',content.snapType,content.deviceName);//No I18N
		},
		intfEnableDisable: function(status){
			var content = this.get('content');
			OPMClient.Inventory.intfEnableDisable(status,content.name,content.instance);
		},
		deleteInterface: function(){
			var content = this.get('content');
			OPMClient.Inventory.deleteInterface(content.deviceName);
		},
		intfAtaGlanceReport: function(){
			var content = this.get('content');
			redirectSnapShot('AtaGlanceReport',content.snapType,content.deviceName);//No I18N
		},
		installedSoftwares: function(){
			var content = this.get('content');
			redirectSnapShot('InstalledSoftwares',content.snapType,content.deviceName);//No I18N
		},
		activeprocess: function(){
			var content = this.get('content');
			redirectSnapShot('Activeprocess',content.snapType,content.deviceName);//No I18N
		},
		intfBandwidthUtilReport: function(){
			var content = this.get('content');
			redirectSnapShot('BandwidthUtilReport',content.snapType,content.deviceName);//No I18N
		},
		editUrlMonitorFrmSnapshot: function(){
			var content = this.get('content');
			editUrlMonitorFrmSnapshot(content.details.name,content.details.urlName);
		},
		testUrlMonitorFrmSnapshot: function(){
			var content = this.get('content');
			testUrlMonitorFrmSnapshot(content.details.name,content.details.urlName);
		},
		editResponseThreshold: function(){
			var content = this.get('content');
			editResponseThreshold(content.details.name,'OpManagerUrlStatusPoll','stat','Url','true');//No I18N
		},
		deleteUrlMonitor: function(){
			var content = this.get('content');
			deleteUrlMonitor(content.details.name,'snapshot');//No I18N
		},
		nfaDeviceEdit: function(snapType,deviceName){
			redirectToSnapshot(snapType,deviceName,"NFADeviceEdit"); //NO I18N
		},
		nfaASViewEdit: function(snapType,deviceName){
			redirectToSnapshot(snapType,deviceName,"ASViewEdit"); //NO I18N
		},
		flowDeviceAddToNCM: function(){
			var content = this.get('content');
			redirectToSnapshot('FlowDevice',content.deviceName,'AddToNCM');//No I18N
		},
		flowDeviceNBARConfig: function(){
			var content = this.get('content');
			redirectToSnapshot('FlowDevice',content.deviceName,'NBARConfig');//No I18N
		},
		flowDeviceCBQoSConfig: function(){
			var content = this.get('content');
			redirectToSnapshot('FlowDevice',content.deviceName,'CBQoSConfig');//No I18N
		},
		flowDeviceSetSNMP: function(){
			opmGlobalRoute.transitionTo("Inventory.Device.SetSNMP"); //NO I18N
		},
		changeDevicePasswordDetails: function(){
			var content = this.get('content');
			changeDevicePasswordDetails(content.deviceName);
		},
		flowDeviceManageUnmanageDevices: function(status) {
			var content = this.get('content');
			OPMClient.Inventory.unManageDevices(status,String(content.nfaID),false,'Devices');//No I18N
		},
		nfaManageUnmanageDevices: function(status,isWlc,filterType) {
			var content = this.get('content');
			OPMClient.Inventory.unManageDevices(status,content.deviceName,isWlc,filterType);
		},
		manageNbaDevices: function(status,filterType){
			var content = this.get('content');
			var deviceList = (filterType == 'Devices')?String(content.nfaID):content.deviceName; //No I18N
			OPMClient.Inventory.manageNbaDevices(status,deviceList,filterType);
		},
		flowInterfaceNFASummaryEdit:function() {
			redirectToSnapshot(this.content.snapType, this.content.deviceName, "NFASummaryEdit"); //NO I18N
		},
		nfaSuppressAlarm:function() {
			redirectToSnapshot(this.content.snapType, this.content.deviceName, "NFASuppressAlarm"); //NO I18N
		},
		nfaInvRepFillingDetails: function(type,routerID){
			var content = this.get('content');
			var deviceName = (content.snapType === 'FlowQOS')?nfa_spliteQosNameAndID(content.deviceName).name:content.deviceName; //No I18N
			nfaInvRepFillingDetails(type,content.snapType,content.startTime,content.endTime,routerID,deviceName,content.collectorID);
		},
		attacksManageDevices:function(statusNum){
			var content = this.get('content');
			OPMClient.Inventory.attacksManageDevices(content.deviceName,statusNum);
		},
		dpi_inventoryToReportLink: function(){
			dpi_inventoryToForensics(true);
		},
		ncmBackupConfig: function(){
			var content = this.get('content');
			OPMClient.Inventory.ncmBackupConfig(content.ncmDeviceID);
		},
		ncmBackupDGroupConfig: function(){
			var content = this.get('content');
			OPMClient.Inventory.ncmBackupConfig(content.dGroupId, true);
		},
		ncmSyncConfig: function(){
			var content = this.get('content');
			OPMClient.Inventory.ncmSyncConfig(content.ncmDeviceID);
		},
		ncmSyncDGroupConfig: function(){
			var content = this.get('content');
			OPMClient.Inventory.ncmSyncConfig(content.dGroupId, true);
		},
		ncmUpdateIpAddress: function(){
			var content = this.get('content');
			OPMClient.Inventory.ncmUpdateIpAddress(content.ncmDeviceID);
		},
		ncmStopOperation: function(){
			var content = this.get('content');
			OPMClient.Inventory.ncmStopOperation(content.ncmDeviceID);
		},
		ncmShowDeviceHistory: function(){
			var content = this.get('content');
			opm_showDeviceHistory(content.ncmDeviceMoID);
		},
		doRetrievePMPPasswords: function(){
			var content = this.get('content');
			doRetrievePMPPasswords(content.ncmDeviceID);
		},
		openConfigeltAction: function(id,name){
			openConfigeltAction(id,name);
		},
		openRESTObjectsAction: function(id){
			openRESTObjectsAction(id);
		},
		generateNCMDeviceSpecificPDFReport: function(){
			var content = this.get('content');
			generateNCMDeviceSpecificPDFReport(content.ncmDeviceID, content.EXPORT_CONFIG_CHANGE_PDF);
		},
		generateNCMDeviceSpecificCCTPDFReport: function(){
			var content = this.get('content');
			generateNCMDeviceSpecificPDFReport(content.ncmDeviceID, content.EXPORT_CONFIG_CHANGE_TERND_PDF_LINK);
		},
		generateNCMDeviceSpecificCompPDFReport: function(){
			var content = this.get('content');
			generateNCMDeviceSpecificPDFReport(content.ncmDeviceID, content.EXPORT_CONFIG_CHANGE_COMPL_PDF_LINK);
		},
		generateNCMDeviceSpecificDevAuditPDFReport: function(){
			var content = this.get('content');
			generateNCMDeviceSpecificPDFReport(content.ncmDeviceID, content.EXPORT_CONFIG_CHANGE_DEV_AUDIT_PDF_LINK);
		},
		generateNCMDeviceSpecificAnnotation: function(){
			var content = this.get('content');
			generateNCMDeviceSpecificPDFReport(content.ncmDeviceID, content.EXPORT_ANNOTATION_PDF_LINK);
		},
		getNipperReport: function(status){
			var content = this.get('content');
			getNipperReport(content.ncmDeviceID,status,'true'); //No I18N
		},
		flowAPMACNFAApMacEdit: function(){
			var content = this.get('content');
			redirectToSnapshot('FlowAPMAC',content.deviceName,'NFAApMacEdit');//No I18N
		},
		oputilsSPMScanSwitch: function(){
			var content = this.get('content');
			var calb = function(response){
				if(response.status !== undefined && response.status!=="Failure"){
					opm_infoMsgs("successMsg",response.result); //No I18N
					// $('body').removeClass('deviceMenuSlideIn');//No I18n
				}
				else if(response.status !== undefined && response.status==="Failure"){
					opm_infoMsgs("errorMsg",response.message); //No I18N	
				}
				else
				{
					if(response.error !== undefined){
						opm_infoMsgs("errorMsg",response.error.message); //No I18N		
					}
					if(response.result !== undefined){
						opm_infoMsgs("successMsg",response.result.message); //No I18N		
					}
				}
			};
	     	opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + '/spm/scanSwitches', {"switchName":content.ipAddress,"wsId":sessionStorage.getItem("wsId")},"",calb);//No I18N
		},
		oputilsConnectedIPReport: function(){
			var content = this.get('content');
		    	var moid = content.moID
		    	downloadConnectedIPDetailsReport("moid="+moid);//NO I18N
	   	},addCiscoMerakiInOpURouter: function(){
		    	var content = this.get('content');
		    	var addRouterURL = window.OPM.apiUrlPattern + "/rogue/addRouter?addType=manual";//No I18N
		    	var data = {};
				data.enabledSNMP = false;
				data.enabledCLI = false;
				data.enabledMeraki = true;
				data.DeviceName = content.deviceName;
				var addRouterClbk = function (response) {
				if(response.status=="Success"){
					var successMsg = Ember.I18n.t("opu.views.discover_subnets_initiated", this);//NO I18N
					showOpUtilsResponse(response, "getRouterData", "Router", "Settings.OpUtils.Discovery.Router", successMsg);//No I18N
				}else{
					if(response.message !== undefined && response.message !== ""){
                    	opm_infoMsgs("errorMsg",response.message); //No I18N
	                }
				}
			}
			opm_ajaxPostRequestWithMsg(addRouterURL, data, Ember.I18n.t('opu.common.PROCESSING_PL_WAIT', this), addRouterClbk);//No I18N
	   	},
		showAssetDetails: function(){
			var content = this.get('content');
			window.open(content.assetURL,'_blank');
			},
		editFWADeviceRuleSnapshot: function(){
			var content = this.get('content');
			OPMClient.InventoryFWAController.editDeviceID=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryFWAController.editDeviceDDID=content.DDID;
			OPMClient.InventoryFWAController.selDeviceName=content.resName;
			OPMClient.InventoryFWAController.selDeviceDispName=content.deviceDispName; 
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWADeviceRule"; //No I18N
		},
		editFWASnmpSettSnapshot: function(){
			var content = this.get('content');
			OPMClient.InventoryFWAController.editDeviceID=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.SettingsFWConfigController.rid=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryFWAController.snmpSettAvail=content.snmpSettings;
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAEditSnmp"; //No I18N
		},
		editFWAIntranetSettSnapshot:function(){
			var content = this.get('content');
			OPMClient.InventoryFWAController.editDeviceID=[];
			OPMClient.InventoryFWAController.fwaresType=[];
			OPMClient.InventoryFWAController.editDeviceID.push(OPMClient.InventoryDeviceDetailsController.deviceName);
			OPMClient.InventoryFWAController.fwaresType.push(content.type);
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAIntranetConfigure"; //No I18N
		},
		editFWAExcludeSettSnapshot:function(){
			var content = this.get('content');
			OPMClient.InventoryFWAController.editDeviceID=[];
			OPMClient.InventoryFWAController.fwaresType=[];
			OPMClient.InventoryFWAController.editDeviceID.push(OPMClient.InventoryDeviceDetailsController.deviceName);
			OPMClient.InventoryFWAController.fwaresType.push(content.type);
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAExcludeHostConfigure"; //No I18N
		},
		editFWAAvailAlertSnapshot:function(){
			var content = this.get('content');
			OPMClient.InventoryFWAController.editDeviceID=[];
			OPMClient.InventoryFWAController.fwaresType=[];
			OPMClient.InventoryFWAController.editDeviceID.push(OPMClient.InventoryDeviceDetailsController.deviceName);
			OPMClient.InventoryFWAController.fwaresType.push(content.type);
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAAvailabilityAlert"; //No I18N
		},
		redirectFirewallReports:function(snapshotName,repid,repType){
			var rid = OPMClient.InventoryDeviceDetailsController.deviceName;
			var timePeriod = OPMClient.FWAGlobalDataController.timePeriod || 'today'; //No I18N
			OPMClient.FWAReportsDetailsController.rid=rid;
			OPMClient.FWAReportsDetailsController.selRepid=repid;
			OPMClient.FWAReportsDetailsController.fromInvPage=true;
			var queryParams = '?rid=' + encodeURIComponent(rid) + '&selRepid=' + encodeURIComponent(repid) + '&timePeriod=' + encodeURIComponent(timePeriod); //No I18N
			if(snapshotName == 'FWAFirewall'){
				if(repType == "vpn"){
					location.href = window.OPM.isFWADE ? "#/Reports/Reports.FWAReports/VpnReports" : window.OPM.v3ClientURL + "reports/firewall-analysis/syslog-report/vpn" + queryParams;//No I18N
				}else if(repType == "country"){ //No I18N
					location.href = window.OPM.isFWADE ? "#/Reports/Reports.FWAReports/CountryReports" : window.OPM.v3ClientURL + "reports/firewall-analysis/syslog-report/country" + queryParams;//No I18N
				}else{
					location.href = window.OPM.isFWADE ? "#/Reports/Reports.FWAReports/FireReports" : window.OPM.v3ClientURL + "reports/firewall-analysis/syslog-report/firewall" + queryParams;//No I18N
				}
			}else if(snapshotName == 'FWAProxy'){//No I18N
				location.href = window.OPM.isFWADE ? "#/Reports/Reports.FWAReports/ProxyReports" : window.OPM.v3ClientURL + "reports/firewall-analysis/syslog-report/proxy" + queryParams;//No I18N
			}
		},
		opm_handleIpSlaPathEcho:function(action) {
			var self = this;
			if(action==="disable") {
				self.set('additionalProps.pathEchoEnabled',false); //No I18N
			} else {
				self.set('additionalProps.pathEchoEnabled',true); //No I18N
			}
			opm_handleIpSlaPathEcho(action);
		},
		showDeviceBusinessViews: function(){
			var content = this.get('content');
			opm_showBusinessViews(content.deviceName);
		},sdwanEvents: function(){
			var content = this.get('content');
			redirectSnapShot('SDWANEvents',content.snapType,content.deviceName);//No I18N
		},
		opm_supressWANIPAlarms:function(isSuppress){
			var model = this.get('content');
			var devName = model.deviceName;
			var supressVal =  isSuppress === "true" ? -1:0; //No I18N
			var url = window.OPM.apiUrlPattern + '/device/ConfigureSuppressAlarm'; //No I18N
			var grid = jQuery("#opm_Devices");	//No I18N

			$.ajax({
				url: url,
				type: 'POST', //No I18N
				async:false,
				data: {'suppressInterval':supressVal,'type':'WANIPs','name':devName},//No I18N
				success: function(response){
					if(response.error === undefined)
					{
						opm_infoMsgs('successMsg',response.result.message); //No I18N
						for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
							if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.List.WAN.Overview.Snapshot"){
								OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
								$('body').removeClass('wan-slider');//No I18n
							}
						}
						$('body').removeClass('deviceMenuSlideIn');
					} else {
						opm_infoMsgs('errorMsg',escapeHTML(response.error.message)); //No I18N

					}
				}
			});
		},
		
	manageUnManageWANIP: function(manage,type){
			var model = this.get('content');
			var devName = model.moid;
			var self = this;
			var msg = "";//No I18N
			if(model.snapType === "Site"){
				msg = manage === "true" ? Ember.I18n.t('webclient.opm.wanlink.wanipsite.manage',this) : Ember.I18n.t('webclient.opm.wanlink.wanipsite.unmanage',this);//No I18N
			}else{
				msg = manage === "true" ? Ember.I18n.t('webclient.opm.wanlink.wanips.manage',this) : Ember.I18n.t('webclient.opm.wanlink.wanips.unmanage',this);//No I18N

			}
			if(confirm(msg)){
				if(devName === ""){//No I18N
					devName = OPMClient.InventoryDeviceDetailsController.moID;
				}
				var data = {'moIDs':JSON.stringify([devName])};//No I18N
				var url = window.OPM.apiUrlPattern + '/admin/manageWANLinkMonitor?manage='+manage; //No I18N
				if(model.snapType === "Site")
				{
					var url = window.OPM.apiUrlPattern + '/admin/manageWANLinkSite?manage='+manage; //No I18N
				}
				$.ajax({
					url: url,
					type: 'POST', //No I18N
					data: data,
					self:self,
					success: function(response){
						if(response.error === undefined)
						{
								for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
									if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
										OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
									}
									else if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.List.WAN.Overview.Snapshot"){
										OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
										$('body').removeClass('wan-slider');//No I18n
									}
								}
								$('body').removeClass('deviceMenuSlideIn');
							
							opm_infoMsgs('successMsg',response.result.message); //No I18N
						} else {
							opm_infoMsgs('errorMsg',response.error.message); //No I18N
						}
					}
				});	
			}
		},
		opm_discIPRoutingTable: function(){
			var content = this.get('content');
			opm_rediscoverRoutingTabledata(content.moID);
		},	
		showConnectedNeighbourDevices:function(){
			var content = this.get('content');
            OPMClient.GroupingController.set("groupDetails",{groupID:content.moID,groupName:content.displayName,groupType:"device"});//No I18N 
            var parentView = this.get('parentView');
			parentView.send('showGroupsMapView');//No I18N		
		},
		configureVMSnapShotThreshold: function(){
			var devName = OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryDeviceDetailsController.set("configureVmWareThresholds",true);//No I18N
			location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+devName+'/ChildElementsAlertThresholds'; //No I18N
		}
	},
    willDestroyElement:function(){
        $('body').removeClass('deviceMenuSlideIn');
        $('#'+this.elementId).find('*').remove();
        deviceSlideOut(12);

    }
});
function rdpDesktop(dnsName,deviceName){
			
	if(deviceName===undefined&&dnsName===undefined){
		window.open("/apiclient/ember/rdpdirect.jsp?server="+deviceBasicDetails.dnsName+"&moName="+deviceBasicDetails.deviceName+"&width="+window.innerWidth+"&height="+window.innerHeight);
	} else{
		window.open("/apiclient/ember/rdpdirect.jsp?server="+dnsName+"&moName="+deviceName+"&width="+window.innerWidth+"&height="+window.innerHeight);
	}
}

function showTerminal(){
	window.open("/apiclient/ember/sshTerminal.jsp?server="+deviceBasicDetails.dnsName+"&moName="+deviceBasicDetails.deviceName+"&width="+window.innerWidth+"&height="+window.innerHeight);
}

OPMClient.SummaryDetailsComponent = Ember.Component.extend({
	didInsertElement:function() {
		var self = this;
		var summaryList = self.get('pageContent');
		self.set('pageContent',[]);//No I18N
		$.each($('.settings-summary-menu'), function(key, val) {
			summaryList[key].menuLength = $(val).find('li').length + 2;
		});
		Ember.run.schedule('afterRender', function() {//No I18N
			self.set('pageContent', summaryList);//No I18N
		});
		if(OPMClient.ApplicationController.isCentralServer){
			$('#SummaryPage').addClass('opmCentralSummary');//No I18N
		}
		setTimeout(function() {
			$('.settingsCnt').css('top','0px');
		},10);
	},
	actions:{
		closeNewTag: function(pageName,msgId,messageName )
		{
			if(pageName!=undefined && pageName=="SETTINGS_OPM" && messageName!=undefined && messageName=="NEW_MSTEAMS"){
				return;
			}
			opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/closeMsgForUser',{pageName:pageName,msgId:msgId}); //No I18n
			if(window.OPM.isAuthorized && !window.OPM.isCustomer)
			{
				getNewFeatureList();
			}
		}
	},
	willDestroyElement:function(){
		if(OPMClient.ApplicationController.isCentralServer){
			$('#SummaryPage').removeClass('opmCentralSummary');//No I18N
		}	
        $('#'+this.elementId).find('*').remove();
    }
});

OPMClient.OpmPrivacySettingsListComponent = Ember.Component.extend({
	showUpdatePage:false,
	updateValue:"",
	actions:{
		piiSelect: function(moduleName,moduleDispName,handlerId){
			this.sendAction('action',moduleName,moduleDispName,handlerId);
		},
		updateAction: function(){
			if(this.showUpdatePage){
				this.set('showUpdatePage',false);//No I18N
				$(this.element).find('privacyActionsToggle').removeClass('active');//No I18N
				$(this.element).find('.privacyActionsHolder').css({display:'none',opacity:'0',top:'0'}); //No I18N
			}
			else{
				this.set('showUpdatePage',true); //No I18N
				$(this.element).find('privacyActionsToggle').addClass('active');//No I18N
				$(this.element).find('.privacyActionsHolder').css({display:'block'}).animate({opacity:'1',top:'50px'},300); //No I18N
			}
		},
		doUpdate: function(){
			this.doUpdateAction();
		},
		updateValueInput: function(){
			if(event.code==="Enter"){
				this.doUpdateAction();
			}
		}
	},
	doUpdateAction: function(){
		var fieldsToValidate = {'empty':['pii_updateValue']};//No I18N
		if(this.piiSelectedValue==="phoneNo"){
			fieldsToValidate.positive=['pii_updateValue'];//No I18N
		}
		if(opm_validateFields(fieldsToValidate)){
			var moduleList = [];
			this.piiDetails.piiData.forEach(function(item,index){
				moduleList.push(item.moduleName);
			});
			var data = {
				piiType:this.piiSelectedValue,
				searchPIIText:this.searchTerm,
				replacePIIText:this.updateValue,
				moduleList:JSON.stringify(moduleList)
			};
			var self=this;
			var eventElement = this.element;
			$.ajax({
				url:window.OPM.apiUrlPattern + '/privacy/updatePIIValues',//No I18N
				data:data,
				method:'POST',//No I18N
				async:true,
				self:self,
				eventElement:eventElement,
				success: function(jsonData){
					self.set('updateValue','');//No I18N
					self.set('showUpdatePage',false);//No I18N
					$(eventElement).find('.privacyActionsToggle').removeClass('active');
					$(eventElement).find('.privacyActionsHolder').css({display:'none',opacity:'0',top:'0'}); //No I18N
					var addClasses = "";
					var message = "";
					if(jsonData.result !== undefined){
						addClasses = "successMsg";//No I18N
						message = jsonData.result.message;
					}else if(jsonData.error !== undefined){
						addClasses = "errorMsg";//No I18N
						message = jsonData.error.message;
					}
					opm_infoMsgs(addClasses,message);
					self.set('getPIIDetailsTrigger',!self.get('getPIIDetailsTrigger'));//No I18N
				}
			});
		}
	},
	closeAction: function(){
		this.set('showUpdatePage',false); //No I18N
		$(this.element).find('.privacyActions').find('.privacyActionsToggle').removeClass('active');
		$(this.element).find('.privacyActions').find('.privacyActionsHolder').css({display:'none',opacity:'0',top:'0'}); //No I18N
	}.observes('escapeTrigger') //No I18N
});
OPMClient.OpmPrivacyArticleComponent = Ember.Component.extend({
	slideShown: false,
	computedObj: function(){
		var obj = this.get('obj');
		var searchTerm = this.get('searchTerm');
		var colList = obj.columnList;
		var newColList = [];
		$.each(colList, function(i,v){
			var tempV = v;
			var val = v.colVal;
			tempV.resultSet = [];
			var escapeRegex = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); 
			var splitRegex = new RegExp("("+escapeRegex+")","gi");
			var splitArr = val.split(splitRegex);
			if(splitArr.length===1){
				tempV.resultSet[0]={val:splitArr[0],isBold:false};
			}
			else{
				for(i=0;i<splitArr.length;i++){
					if(splitArr[i].toLowerCase()===searchTerm.toLowerCase()){
						tempV.resultSet.push({val:splitArr[i],isBold:true});
					}
					else if(splitArr[i]!==null && splitArr[i]!==""){
						tempV.resultSet.push({val:splitArr[i],isBold:false});
					}
				}
			}
			newColList.push(tempV);
		});
		obj.newColList = newColList;
		return obj;
	}.property('obj'),//No I18N
	actions:{
		showSubContent: function(){
			if(this.slideShown){
				this.set('slideShown',false);//No I18N
				var articleDiv = $("#"+this.elementId).find('article');
				articleDiv.removeClass('active');
				articleDiv.find('section').slideUp(400);
			}
			else{
				this.set('slideShown',true);//No I18N
				var articleDiv = $("#"+this.elementId).find('article');
				articleDiv.addClass('active');
				articleDiv.find('section').slideDown(400);
			}
		}
	}
});
OPMClient.OpmPrivacyArticleListComponent = Ember.Component.extend({
	tagName:'article',//No I18N
	showUpdatePage:false,
	updateValue:"",
	inputID: function(){
		return "pii_updateValueArticle_"+this.obj.moduleName; //No I18N
	}.property('obj.moduleName'), //No I18N
	actions:{
		updateAction: function(){
			if(this.showUpdatePage){
				this.set('showUpdatePage',false);//No I18N
				$("#"+this.elementId).find('privacyActionsToggle').removeClass('active');//No I18N
				$("#"+this.elementId).find('.privacyActionsHolder').css({display:'none',opacity:'0',top:'0'}); //No I18N
			}
			else{
				this.set('showUpdatePage',true);//No I18N
				$("#"+this.elementId).find('privacyActionsToggle').addClass('active')
				$("#"+this.elementId).find('.privacyActionsHolder').css({display:'block'}).animate({opacity:'1',top:'50px'},300); //No I18N
			}
		},
		doUpdate: function(){
			this.doUpdateAction();
		},
		updateValueInput: function(){
			if(event.code==="Enter"){
				this.doUpdateAction();
			}
		}
	},
	doUpdateAction: function(){
		var fieldsToValidate = {'empty':['pii_updateValueArticle_'+this.obj.moduleName]};//No I18N
		if(this.piiSelectedValue==="phoneNo"){
			fieldsToValidate.positive=['pii_updateValueArticle_'+this.obj.moduleName];//No I18N
		}
		if(opm_validateFields(fieldsToValidate)){
			var moduleList = [];
			moduleList.push(this.obj.moduleName);
			var data = {
				piiType:this.piiSelectedValue,
				searchPIIText:this.searchTerm,
				replacePIIText:this.updateValue,
				moduleList:JSON.stringify(moduleList)
			};
			var self=this;
			var eventElement = this.element;
			$.ajax({
				url:window.OPM.apiUrlPattern + '/privacy/updatePIIValues', //No I18N
				data:data,
				method:'POST',//No I18N
				async:true,
				self:self,
				eventElement:eventElement,
				success: function(jsonData){
					self.set('updateValue','');//No I18N
					self.set('showUpdatePage',false);//No I18N
					$(eventElement).find('.privacyActionsToggle').removeClass('active');
					$(eventElement).find('.privacyActionsHolder').css({display:'none',opacity:'0',top:'0'}); //No I18N
					var addClasses = "";
					var message = "";
					if(jsonData.result !== undefined){
						addClasses = "successMsg";//No I18N
						message = jsonData.result.message;
					}else if(jsonData.error !== undefined){
						addClasses = "errorMsg";//No I18N
						message = jsonData.error.message;
					}
					opm_infoMsgs(addClasses,message);
					self.set('getPIIDetailsTrigger',!self.get('getPIIDetailsTrigger')); //No I18N
				}
			});
		}
	},
	closeAction: function(){
		this.set('showUpdatePage',false);//No I18N
		$(this.element).find('.privacyActions').find('.privacyActionsToggle').removeClass('active');
		$(this.element).find('.privacyActions').find('.privacyActionsHolder').css({display:'none',opacity:'0',top:'0'}); //No I18N
	}.observes('escapeTrigger')//No I18N
});

/**************** GenAI Button Component ****************/
OPMClient.OpmGenAiButtonComponent = Ember.Component.extend({
	templateName: "components/opm-gen-ai-button",//No I18N
	classNames: ['gen-ai-button-wrapper'], // No I18N
	labelKey: 'webclient.genai.summary',//No I18N
	buttonLabel: function () {
		return Ember.I18n.t(this.get('labelKey'));//No I18N
	}.property('labelKey'), // No I18N
	actions: {
		genAiButtonClicked: function () {
			if (OPMClient.ApplicationController.isGenAiEnabled) {
				if(this.action) {
					this.sendAction('action');//No I18N
				}
			} else if(window.isserver && !isAllCollectorSelected()){
				opm_infoMsgs("infoMsg", Ember.I18n.t('webclient.genai.nfaenableGenAiInfoMessage'));//No I18N
			} else {
				opm_infoMsgs("infoMsg", Ember.I18n.t('webclient.genai.enableGenAiInfoMessage', {link: '/apiclient/ember/index.jsp#/Settings/Basic/AddOnProductSummary'}));//No I18N
			}
		}
	}
});

/**************** Help Icon Component ****************/
OPMClient.OpmHelpIconComponent = Ember.Component.extend({
	templateName: "components/opm-help-icon",//No I18N
	tagName: 'a', //No I18N
	classNames: ['hasHelpCard'],
	classNameBindings: ['closeToLabel:hasHelpCard4'], //No I18N
	attributeBindings: ['tabindex', 'style'], //No I18N
	tabindex: '0',
	helpText: function () {
		if (typeof this.helpTextKey === 'string') {
			var hText = [];
			var param = "";
			if (this.additionalParam) {
			    param = this.additionalParam;
			}
			var i18nKey = Ember.I18n.t(this.helpTextKey, { productName: window.OPM.productName, param0 : param }, this);
			if(this.helpTextKey2!==undefined)
			{
				i18nKey += " "+Ember.I18n.t(this.helpTextKey2, { productName: window.OPM.productName }, this);
			}
			var helpObject = { 'title': '', 'description': i18nKey }; //No I18N
			var learnMoreLink = (this.learnMoreLink !== undefined && this.learnMoreLink !== "" && opm_isValidUrl(this.learnMoreLink) !== true) ? Ember.I18n.t(this.learnMoreLink, this) : this.learnMoreLink;
			if (learnMoreLink) {
				var campaign = getCampaign();
				if (learnMoreLink.indexOf('utm_source=inproduct') <= -1) {
					learnMoreLink += learnMoreLink.indexOf('?') <= -1 ? '?utm_source=inproduct&utm_campaign='+campaign : '&utm_source=inproduct&utm_campaign='+campaign;
				}
				helpObject.learnMoreLink = learnMoreLink;
			} 
			if(this.deviceTemplates) {
				helpObject.deviceTemplates = this.deviceTemplates;
			}
			if(this.reportDataProtection) {
				helpObject.reportDataProtection =this.reportDataProtection;
			}
			if(this.notes){
				helpObject.notes = Ember.I18n.t(this.notes,this);//No I18N
			}
			hText.push(helpObject);
			return hText;
		} else if (typeof this.helpTextKey === 'object') { //No I18N
			return this.helpTextKey;
		}
	}.property('helpTextKey'), //No I18N
	helpCardClass: function () {
		return this.get('position') !== undefined ? "helpCard " + this.get('position') : "helpCard"; //No I18N
	}.property('position') //No I18N
});

OPMClient.OpmHelpLinkComponent = Ember.Component.extend({
	templateName: "components/opm-help-link",//No I18N
	tabindex: '-1',
	tagName:"a", //No I18N
	classNames: ['helpLinkSpaceFix'], //No I18N
	didInsertElement: function () {
		if (this.linkText !== undefined) {
			if ((Ember.I18n.t(this.linkText, this).indexOf("Missing translation")) < 0){
				this.set('linkText',Ember.I18n.t(this.linkText, this)); //No I18N
			} else{
				this.set('linkText',this.linkText); //No I18N
			}
		}
		if(this.target !== undefined){
			this.set('linktarget',this.target); //No I18N
		}
		var opmLink = (this.opmLink !== undefined && this.opmLink !== "" && opm_isValidUrl(this.opmLink) !== true) ? Ember.I18n.t(this.opmLink, this) : this.opmLink;
		if (opmLink && opmLink.indexOf("Missing translation") < 0) {
			var campaign = getCampaign();
			if (opmLink.indexOf('utm_source=inproduct') <= -1) {
				opmLink += opmLink.indexOf('?') <= -1 ? '?utm_source=inproduct&utm_campaign=' + campaign : '&utm_source=inproduct&utm_campaign=' + campaign;
			}
			this.set('opmLink', opmLink); //No I18N
		}
	}
});

 function toggleInterval()
{
	$("[name=HWInterval]").toggle();
	$("[name=hwareText]").toggle();
}
function HwChangeStatus(isIPMI){
	if(window.OPM.userPermissions.monitoringWrite){
		var linkId = 'Hwstatus';//No I18N
		var iconId = 'hardwarestatusIcon';//No I18N
		if(isIPMI){
			linkId += 'IPMI';//No I18N
			iconId += 'IPMI';//No I18N
		}
		var val = $('#'+linkId).prop('value');
		if(val === undefined){
			val = $('#'+linkId).attr('value');	
		}
		var isMonitoring = (val === 'Enable');//No I18N
	    var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/device/enableOrDisableHardwareMonitor',{deviceName:OPMClient.InventoryDeviceDetailsController.deviceName,monitoring:isMonitoring});//No I18N
	    if(response.message !== undefined){
	        opm_infoMsgs('successMsg',response.message); //No I18N
	        if(isMonitoring){
				$('#'+iconId).attr('class','');
				$('#'+iconId).attr('class','icon-status5');
				$('#'+linkId).text(Ember.I18n.t('webclient.fwa.snmp.disable.now',this));//No I18N
			}else{
				$('#'+iconId).attr('class','icon-status1');
				$('#'+linkId).text(Ember.I18n.t('ncm.device.summary.enablenow',this));//No I18N
			}
	       $('#'+linkId).attr('value',(isMonitoring ? 'Disable' : 'Enable'));//No I18N
	       for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
	      		if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name === 'Inventory.Device'){
						OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
				}
			}
	    }else if(response.result !== undefined && response.result.message !== undefined){
	    	opm_infoMsgs('successMsg',response.result.message); //No I18N
	    }else if(response.error !== undefined && response.error.message !== undefined){
			opm_infoMsgs('errorMsg',response.error.message);//No I18N
		}
	}
}


function hwInterval()
{
	if(window.OPM.userPermissions.monitoringWrite)
	{
	var val =$("#HWInterval").val();//No I18N
	var pollintervalValidate = {'empty':['HWInterval'],'positive':['HWInterval'],'rangeCheck':{'HWInterval':1440*60},'minrangeCheck':{'HWInterval':60}};//No I18N
    if(!opm_validateFields(pollintervalValidate)){
    	toggleInterval();
        return false;
    }
    else
    {
    	var data = {"deviceName":OPMClient.InventoryDeviceDetailsController.deviceName,"interval":val};//No I18N
	    var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/device/changeHardwareInterval", data); //No I18N
	    if(response.message != undefined){
	        opm_infoMsgs('successMsg',response.message); //No I18N
	        $("#hwareText").text(val);
	       $("#intervalbutton").hide();
	    }
	    else if(response.result !== undefined && response.result.message !== undefined)
	    {
	    	opm_infoMsgs('successMsg',response.result.message); //No I18N
	    }
	    else if(response.error !== undefined && response.error.message !== undefined){
		opm_infoMsgs('errorMsg',response.error.message);//No I18N
		}
    }
 	}
}

/**************** Help Card Components ***************/
var OpmHelpCardDetails = [];
OPMClient.OpmHelpCardComponent = Ember.Component.extend({
	templateName: "components/opm-help-card",//No I18N
	attributeBindings:['style'],//No I18N
	style:"height:auto;", //No I18N
	didInsertElement: function(){
		if(OPMClient.ApplicationController.showHelpCard)
		{
			helpCardEvents();
			var pageName = this.get('pageName');//No I18N
			if(pageName!==undefined && pageName != '' && !window.OPM.userPermissions.intfGroupRestricted)
			{
				OPMClient.ApplicationController.helpCardPageName = pageName;
				if(OpmHelpCardDetails[pageName]===undefined)
				{
					OpmHelpCardDetails = [];
					var groupName = [];
                    if(pageName==="AddVoIPMonitor"){//No I18N
						groupName.push("AddVoIPMonitor");
						groupName.push("AddWANMonitor");
						groupName.push("AddVideoMonitor");
					}else if(pageName==="performanceMonitors"){//No I18N
						for (var key in OPMClient.InventoryDeviceDetailsController.monitorsObj) {
							var monitorName = OPMClient.InventoryDeviceDetailsController.monitorsObj[key].monitorName;
							if(monitorName !== undefined){
								groupName.push(monitorName);
							}
						}
					}else if(pageName==="OpUtilsSPM"||pageName==="OpUtilsIPAM"||OPMClient.ApplicationController.isOPUtils){//No I18N
						this.set('showRoadMap',true);//No I18N
						groupName.push(pageName);
					}else if(pageName==="IPSLA_VoIP"){//No I18N
						groupName.push("IPSLA_VoIP");
						groupName.push("IPSLA_WANRTT");
						groupName.push("IPSLA_Video");
					}
					else{
						groupName.push(pageName);
					}
					var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getQuickLinksContents?PageName="+JSON.stringify(groupName));//No I18N
					OpmHelpCardDetails = response;
				}
				
				this.set('tabSwitch',false);//No I18N
				if(OpmHelpCardDetails[pageName]!==undefined)
				{
				 	this.set("response",OpmHelpCardDetails[pageName].PageData);	
					if(OpmHelpCardDetails[pageName].PageStatus){
					showHelpCardEvents();
					}
					if(OpmHelpCardDetails[pageName].PageData.length===0){
					$('#'+this.elementId).hide();
					}
				}
				else
				{
					$('#'+this.elementId).hide();
				}
			}
			else
			{
				$('#'+this.elementId).hide();
			}
		}
		else
		{
			$('#'+this.elementId).hide();
		}
	},
	actions:{
		openHelpMorePage:function(linkName,showRoadMap){
			var linkToRedrect="";
			if(showRoadMap!==undefined && showRoadMap){
				if(linkName==="RoadMap"){//No I18N
					linkToRedrect="https://www.manageengine.com/products/oputils/roadmap.html?utm_source=inproduct&utm_campaign="+getCampaign();//No I18N
				}else if(linkName==="MoreFeatures"){//No I18N
					linkToRedrect="https://www.manageengine.com/products/oputils/roadmap.html?share-new-idea&utm_source=inproduct&utm_campaign="+getCampaign();//No I18N
				}
				if(linkToRedrect!==""){//No I18N
					window.open(linkToRedrect,"_blank");//No I18N
				}
			}else{
				if(linkName==="RoadMap"){//No I18N
					linkToRedrect="https://www.manageengine.com/network-monitoring/roadmap.html?utm_source=inproduct&utm_campaign="+getCampaign();//No I18N
				}else if(linkName==="MoreFeatures"){//No I18N
					linkToRedrect="https://www.manageengine.com/network-monitoring/roadmap.html?share-new-idea&utm_source=inproduct&utm_campaign="+getCampaign();//No I18N
				}
				if(linkToRedrect!==""){//No I18N
					window.open(linkToRedrect,"_blank");//No I18N
				}
			}
		}
	},
  	reloadObserver: function(){
  		this.set('tabSwitch',true);//No I18N
  		this.rerender();
  	}.observes('pageName'),//No I18N
	willDestroyElement: function(){
		if(!this.get('tabSwitch')){OpmHelpCardDetails = [];}
		$('.settingsPageHelpContent').off('click','li');
		$('.settingsPageHelpBtn').off('click');
		$('.opmTabCont').off('click','.opmSettingsAccr > h4');
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmHelpCardBoxComponent = Ember.Component.extend({
	templateName: "components/opm-help-card-box",//No I18N
	didInsertElement: function() {
		var helpcardDetails = this.get('helpcardDetails');//No I18N
		var param = this.get('param');//No I18N
		if(helpcardDetails!==undefined) {
			var i18nmsg = helpcardDetails ? param ? Ember.I18n.t(helpcardDetails,{param : param}) : Ember.I18n.t(helpcardDetails,this) : '';
			if(i18nmsg.indexOf("Missing translation")<0){
				this.set('helpcardDetails',i18nmsg); //No I18N
			}
		}
	}
});

OPMClient.OpmHelpCardHowtoComponent = Ember.Component.extend({
	templateName: "components/opm-help-card-howto",//No I18N
	attributeBindings:['dataid','style'],//No I18N
	//dataid:"HOWTO",//No I18N
	style:"display:block",//No I18N
	classNames:["pageHelpContent"],//No I18N
	didInsertElement: function(){
		$('#'+this.elementId).attr('dataid',this.get('data.type'));
	},
	actions:{
		openHelpMorePage:function(){
			window.open(this.data.moreLink,"_blank");
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmHelpCardFaqComponent = Ember.Component.extend({
	templateName: "components/opm-help-card-faq",//No I18N
	attributeBindings:['dataid','style'],//No I18N
	dataid:"FAQ",//No I18N
	style:"display:none",//No I18N
	classNames:["pageHelpContent"],//No I18N
	actions:{
		openHelpMorePage:function(){
			window.open(this.data.moreLink,"_blank");
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmHelpCardVideosComponent = Ember.Component.extend({
	templateName: "components/opm-help-card-videos",//No I18N
	attributeBindings:['dataid','style'],//No I18N
	dataid:"VIDEO",//No I18N
	style:"display:none",//No I18N
	classNames:["pageHelpContent","videos"],//No I18N
	actions:{
		openHelpMorePage:function(){
			window.open(this.data.moreLink,"_blank");
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
/*****************************************************/

OPMClient.OpmMenuHoverComponent = Ember.Component.extend({
	templateName: "components/opm-menu-hover",//No I18N
	tagName:"ul",//No I18N
	didInsertElement: function() {
		$('#MainNav .NavUl li ul.subMenuIconLev2').each(function(){ //No I18N
			if($(this).find('li').length == 0) { //No I18N
				$(this).parent().find('a').removeClass('subMenuIcon'); //No I18N
			}
		});
		var totalHt = $('#'+this.elementId).outerHeight()+185;
		if(wHt===undefined){
			wHt = $(window).height();
		}
		if(totalHt > wHt){
			$('#'+this.elementId).addClass("subMenuIconLev2");//No I18N
			$('#'+this.elementId).mCustomScrollbar();
		}
	},
	reloadObserver: function(){
  		this.rerender();
  	}.observes('menuLinks'), //No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmMapsComponent = Ember.Component.extend({
	templateName: "components/opm-maps",//No I18N
	deviceName:"",
	didInsertElement: function()
	{
		$("body").addClass("expandScreenPage settingsPage");
		$("#editGMapSettingsMenu").hide();
		window.OPM.currentView = OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];

		OPMClient.MapsGMapController.set("deviceName",this.get("deviceName"));//No I18N
		if(this.get("deviceName") === "GoogleMap") {//No I18N
			OPMClient.MapsGMapController.deviceName = "";	
		}

		Ember.run.next(function() {
			$("body").addClass("expandScreenPage settingsPage");
			$("#editGMapSettingsMenu").hide();

			if(OPMClient.BVMapDetailsController.isDefaultMap){
				mapActiveInactive('zmap');//No I18N
			}else if(isRegionMap){
				mapActiveInactive('regionmap');//No I18N
				OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"AMAP_PAGE"});//No I18N
			}else{
				mapActiveInactive('gmap');//No I18N
				OPMClient.ApplicationController.set("msgInfoDetails",{"pageName":"GMAP_PAGE"});//No I18N
			}
		});

		if(window.OPM.isNFA) {
			$("#map_holder_new #map,.map_configure").hide(); //No I18N
			if(this.isDefaultMap) {
				nfa_loadZohoMaps();
			}else {
				nfa_loadGoogleMaps();
			}
		}else {

			if(OPMClient.BVMapDetailsController.isDefaultMap && !OPMClient.ApplicationController.isOfflineMapEnabled)
			{
				loadZohoVectorMap('map',false,true);//No I18N
				if(!window.OPM.userPermissions.mapsWrite || window.OPM.userPermissions.devGrouporBVRestricted)
				{
					$('.maps_actionsBtn').show();
				}
			}
			else
			{
				if(isRegionMap){
					loadRegionMap();//No I18N
				}else{
					loadGmap('map',false);//No I18N
				}
				if(!window.OPM.userPermissions.mapsWrite || window.OPM.userPermissions.devGrouporBVRestricted)
				{
					$('.maps_actionsBtn').hide();
				}
			}
			gmap_filter = {"type":[],"severity":[]};//No I18N
			var Url = window.OPM.apiUrlPattern + '/maps/getMapDeviceTypes';//No I18N
			var selectBox = $("#gmap_deviceTypes");
			$.getJSON(Url,function(jsonData)
			{
				var arr  = [];
				arr.push({label:Ember.I18n.t("webclient.maps.allcategs",this),value:"All",group:Ember.I18n.t("webclient.gmap.filter.type",this),selected:"All"});//No I18N
				$.each(jsonData,function(key,o)
				{
					arr.push({label:o.Name,value:o.Name});
				});
				OPMClient.BVMapDetailsController.set("devTypeList",arr);//No I18N
				
				$("#gmap_deviceTypes").on('change', function()
				{
					gmap_filter.type = [];
					gmap_filter.severity = [];
					var selType = $(this).val();
					gmap_filter.type.push(selType);
					
					if(OPMClient.BVMapDetailsController.isDefaultMap)
					{
						if(OPMClient.ApplicationController.isOfflineMapEnabled)
						{
							loadZmap('map',false,false);//No I18N
						}
						else
						{
							loadZohoVectorMap('map',false,false);//No I18N
						}
					}else if(isRegionMap){
						loadRegionMap() ;//No I18N
					}else{
						loadGmap('map',false);//No I18N
					}
				});
			});
			$('.maps_actionsBtn').off('click').click(function(e){
				if(!$(this).hasClass('active')){
					$(this).addClass('active').find('ul').css({display:'block'}).animate({opacity:'1',top:'50px'},300);//No I18N
				}else{
					$(this).removeClass('active').find('ul').css({display:'none',opacity:'0',top:'0'});//No I18N
				}
			});
		}
	
	},
	actions:{
		closeSlide: function(){
			slideOut(4);
			$("#map_importSlide").hide();
			$("#map_importResultDiv").hide();
			if(!isRegionMap){
				if(typeof closeCurrenInfoWindow === 'function')
				{
          			closeCurrenInfoWindow();
          		}
			}
			$('.opmMapPage').removeClass('importSlidetopFix');
			$("#SeverityLogViewSlide .header_txt").text(Ember.I18n.t('webclient.opm.maps.entities.list',this));//No I18N
		},
		importMapLinks: function(){
			var formData = new FormData();
			var file = $("#map_LinkFile")[0].files[0];//No I18N
			formData.append('file',file);//No I18N
			var fieldsToValidate = {'empty':['map_LinkFile']};//No I18N
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var url = window.OPM.apiUrlPattern + '/maps/importDevicesToMap?type=links';  //No I18N
				var response = opm_ajaxMultiPostRequest(url,formData);
				OPMClient.BVMapDetailsController.set('mapsImportResultObj',[]); //No I18N
				if(response.error === undefined && response.result === undefined)
				{
					$("#map_LinkFile").val("");
					$.each(response,function(k,obj) {
						var nObj = {};
						if(k === "linkError" && obj.length > 0){
							nObj.title = Ember.I18n.t('webclient.devices.intftypes.errors',this)+' (' + obj.length + ')'; //No I18N
							nObj.list = obj;
						}
						else if(k === "deviceNotFound" && obj.length > 0){
							nObj.title = Ember.I18n.t('webclient.zmap.import.devicenotfound',this)+' (' + obj.length + ')'; //No I18N
							nObj.list = obj;
						}
						else if(k === "markerAdded" && obj.length > 0){
							nObj.title = Ember.I18n.t('webclient.zmap.import.markersadded',this)+' (' + obj.length + ')'; //No I18N
							nObj.list = obj;
						}
						else if(k === "linkSuccess" && obj.length > 0){
							nObj.title = Ember.I18n.t('webclient.zmap.import.linksadded',this)+' (' + obj.length + ')'; //No I18N
							nObj.list = obj;
						}
						if(!$.isEmptyObject(nObj)){
							OPMClient.BVMapDetailsController.mapsImportResultObj.pushObject(nObj);
						}
					});
					$("#map_importLinksSlide").hide();
					$("#map_importResultDiv").show();
				}
				else{
					showMessage(response);
					slideOut(4);
					$("#map_LinkFile").val("");
					$("#SeverityLogViewSlide .header_txt").text(Ember.I18n.t('widget.name.firewalldevList',this));//No I18N
					$("#map_importLinksSlide").hide();
				}
				if(OPMClient.BVMapDetailsController.isDefaultMap)
				{
					if(OPMClient.ApplicationController.isOfflineMapEnabled)
					{
						loadZmap('map',false,false);//No I18N
					}
					else
					{
						loadZohoVectorMap('map',false,false);//No I18N
					}
				}
			}
		},
		importMapDevices: function(){
			
			var formData = new FormData();
			var file = $("#map_DevFile")[0].files[0];//No I18N
			formData.append('file',file);//No I18N
			var fieldsToValidate = {'empty':['map_DevFile']};//No I18N
	    	var isValid = opm_validateFields(fieldsToValidate);
			if(isValid)
			{
				var url = window.OPM.apiUrlPattern + '/maps/importDevicesToMap';  //No I18N
	          	var response = opm_ajaxMultiPostRequest(url,formData);
				OPMClient.BVMapDetailsController.set('mapsImportResultObj',[]); //No I18N
	          	if(response.error === undefined && response.result === undefined)
	          	{
	          		$("#map_DevFile").val("");
					$.each(response,function(k,obj) {
						var nObj = {};
						if((k === "updateError" || k === "deviceError") && obj.length >0){
							nObj.title = Ember.I18n.t('webclient.map.import.csv.foundentrywitherrors',this)+' ('+obj.length+')'; //No I18N
							nObj.list=obj;
						}
						else if(k === "deviceNotFound" && obj.length >0){
							nObj.title = Ember.I18n.t('webclient.devices.devprop.csv.nomatchfordevice',this)+' ('+obj.length+')'; //No I18N
							nObj.list=obj;
						}
						else if(k === "latError" && obj.length >0){
							nObj.title = Ember.I18n.t('webclient.devices.devprop.csv.coordinates.wrong',this)+' ('+obj.length+')'; //No I18N
							nObj.list=obj;
						}
						if(!$.isEmptyObject(nObj)){
							OPMClient.BVMapDetailsController.mapsImportResultObj.pushObject(nObj);
						}
					});
					$("#map_importSlide").hide();
					$("#map_importResultDiv").show();
	          	}
				else{
					showMessage(response);
					slideOut(4);
					$("#map_DevFile").val("");
	          		$("#SeverityLogViewSlide .header_txt").text(Ember.I18n.t('webclient.opm.maps.entities.list',this));//No I18N
	          		$("#map_importSlide").hide();
	          		if(typeof closeCurrenInfoWindow === 'function')
	          		{
	          			closeCurrenInfoWindow();
	          		}
				}
				if(OPMClient.BVMapDetailsController.isDefaultMap)
				{
					if(OPMClient.ApplicationController.isOfflineMapEnabled)
					{ 
						loadZmap('map',false,false);//No I18N
					}
					else
					{
						loadZohoVectorMap('map',false,false);//No I18N
					}
				}else if(isRegionMap){
					loadRegionMap();//No I18N
				}else{
					loadGmap('map',false);//No I18N
				}
			}			
		},
		restAPIMaskToggle: function () {
			if ($('#apiMaskEye,#rec_apiMaskEye').hasClass('icon-eye-slash')) {
				$('#apiMaskEye,#rec_apiMaskEye').removeClass('icon-eye-slash');
				$('#apiMaskEye,#rec_apiMaskEye').addClass('icon-eye');
				$('#mapApiVal,#rec_mapApiVal').attr('type', 'password'); //No I18n
			} else {
				$('#apiMaskEye,#rec_apiMaskEye').addClass('icon-eye-slash');
				$('#apiMaskEye,#rec_apiMaskEye').removeClass('icon-eye');
				$('#mapApiVal,#rec_mapApiVal').attr('type', 'text'); //No I18n
			}
		},
		changeZmapUnit: function(action)
		{
			var ajaxData = {"selectedView":"Zoho_Map.netmap","ZMap_Unit":action}; //NO I18n
			var callbackFn = function(response)
			{
				if(response !== undefined){
					var options = {};
					options.callback_func = function(){
						//location.reload(true);
						updateZohoMapUnit(action);
						setZohoMapUnit(action);	
					}
					if(response.result !== undefined){
						opm_infoMsgs("successMsg",response.result.message,options);//No I18N
					}else if(response.error !== undefined){
						opm_infoMsgs('errorMsg',response.error.message);//No I18N
					}
				}
			}
			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+'/maps/updateMapProperties',ajaxData,Ember.I18n.t('webclient.credential.snmp.pleasewait',this),callbackFn); //No I18n
		},
		editGMapSettings: function()
		{
			$("body").addClass("slideTopPosition");
			$('#rec_mapFile').val('');
			$('#rec_mapApiVal').val('');
			$(".fileUploadTxt").text('');
			$('#rec_gMapAcess').prop("checked",false);//No I18N
			$(".googleMapTermsServiceError").hide();
			slideIn(2);		
		},
		closeAction: function()
		{
			if(window.OPM.currentView !== undefined && window.OPM.currentView.params.deviceName !== "GoogleMap" && !isRegionMap)
			{
				redirectToDeviceSnapshot(window.OPM.currentView.params.deviceName);
			}
			else
			{	
				opmGlobalRoute.transitionTo('Maps.BusinessView'); //No I18N
			}
		},
		showAllEntities: function(){
			loadGoogleOrZohoMap();
		}
	},
	rerenderMsgDialog: function(){
		this.rerender();
	}.observes('deviceName'),//No I18N
	willDestroyElement: function(){
		if(typeof newMap !== 'undefined' && newMap)
		{
			newMap.clearMap();
		}
		$('.opmMapPage').removeClass('importSlidetopFix');
		$('#'+this.elementId).find('*').remove();
		$("body").removeClass("expandScreenPage slideTopPosition");
		$(".googleMapTermsServiceError").hide();
		OPMClient.MapsGMapController.deviceName = "";
		slideOut(4);
		slideOut(2);
		gmap_filter.type = [];
		gmap_filter.severity = [];
		OPMClient.BVMapDetailsController.set('mapsImportResultObj',[]);//No I18N
	}
});
/********* Association Div Component *******************/

// OPMClient.OpmAssociationComponent = Ember.Component.extend({
// 	templateName: "components/opm-association",//No I18N
// 	classNames:['assoComponent'],//No I18N
// 	didInsertElement:function(){
// 		var assoDetails = this.assoDetails;
// 		if(assoDetails!==undefined){
// 			calculateMultiSelBoxHolderHeight(this.elementId,assoDetails.availHeight);
// 			var elementId = this.elementId;
// 			var prev = -1;
// 			$("#"+this.elementId+" .multiSelBoxSelectable").selectable({//No I18N
// 			  selected: function(event,ui) {
// 			  	var parentId = $(ui.selected).parent().attr("id");//No I18N
// 			  	highlightArrowButton(elementId,parentId)
// 				},
// 				selecting: function(e, ui) {
// 					var curr = $(ui.selecting.tagName, e.target).index(ui.selecting);
// 					if(e.shiftKey && prev > -1) {
// 						$(ui.selecting.tagName, e.target).slice(Math.min(prev, curr), 1 + Math.max(prev, curr)).addClass('ui-selected');
// 						prev = -1;
// 					} else {
// 						prev = curr;
// 					}
// 			  }
// 			});
// 			$('#'+this.elementId+' .multiSelBoxCustomScroll .ProductCustomScroll').mCustomScrollbar();//No I18N
// 		}
// 	},
// 	actions:{
// 		showHideSearchDiv:function()
// 		{
// 			if($("#"+this.elementId+" .multiSelBoxHolder").hasClass('srchOption')){//No I18N
// 				$("#"+this.elementId+" .multiSelBoxHolder").removeClass('srchOption');//No I18N
// 			}else{
// 				$("#"+this.elementId+" .multiSelBoxHolder").addClass('srchOption');//No I18N
// 			}
// 			$("#leftSearch").focus();//No I18N
// 		},
// 		opm_leftToRight:function()
// 		{
// 			opm_leftToRight("availDevList","selectDevList",true);//No I18N
// 			$("#"+this.elementId+" .btnRight,.btnLeft").removeClass("active");//No I18N
// 			$("#"+this.elementId+" #selectDevList li").removeClass("ui-selected");//No I18N
// 		},
// 		opm_rightToLeft:function()
// 		{
// 			opm_rightToLeft("availDevList","selectDevList",true);//No I18N
// 			$("#"+this.elementId+" .btnRight,.btnLeft").removeClass("active");//No I18N
// 			$("#"+this.elementId+" #availDevList li").removeClass("ui-selected");//No I18N
// 		}
// 	},
// 	reloadAssoObserver: function(){
//   		this.rerender();
//   	}.observes('assoDetails'),//No I18N
//   	willDestroyElement:function()
//   	{	
//   		OPMClient.ApplicationController.assoDetails = {};
//   		$("#"+this.elementId+" .multiSelBoxSelectable").selectable("destroy");//No I18N
//   		$('#'+this.elementId+' .multiSelBoxCustomScroll .ProductCustomScroll').mCustomScrollbar("destroy");//No I18N
//         $('#'+this.elementId).find('*').remove();
//     }
// });
OPMClient.OpmAdaptivethresholdComponent = Ember.Component.extend({
	templateName: "components/opm-adaptivethreshold",//No I18N
	thresholdTypes:[],
	graphValues:[],
	rearmTypes:[],
	MonitorDetails:{},
	didInsertElement:function(){
                $('body').addClass('ui-dialog-style2');
	},
	actions:{
		revertAT:function()
        {
            var self = this;
            var MonitorDetails = $.extend(true, {}, this.get('controller.MonitorDetails'));
            var is_at_enabled = MonitorDetails.isAtEnabled;
            MonitorDetails.isAtEnabled = ! is_at_enabled;
            this.set('controller.MonitorDetails',MonitorDetails);//No I18N

            if (is_at_enabled) 
            {      
              	if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Configurations.DeviceTemplate.Add.SingleMonitor") >= 0)
							   {
							   			$("#snmpWarnMsg").val(MonitorDetails.warningMessage);
							        	$("#snmpTroubleMsg").val(MonitorDetails.troubleMessage);
							        	$("#snmpErrorMsg").val(MonitorDetails.criticalMessage);
							        	$("#snmpRearmMsg").val(MonitorDetails.clrmessage);
		              		return;
							   }        
              $( "#dialog-confirm" ).dialog({
						      resizable: false,
				          classes: {
										"ui-dialog": "no-close"//No I18N
									},
						      height: "auto",//No I18N
						      width: 400,
						      modal: true,
                  title: Ember.I18n.t('webclient.monitor.atsettings.disable',this),//No I18N
						      open: function() {
            						$('.ui-dialog-buttonpane').find('button:contains("Cancel")').addClass('btn-grey opmBtn ');
            						$('.ui-dialog-buttonpane').find('button:contains("Ok")').addClass('opmBtn ');
       					 },
       					 close: function() {
										reverseAtThreshold(self);
			    			},
						      buttons: {
						        "Ok": function() {//No I18N
						        			var data = {};
													if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Monitors.SubMonitors.EditPerfMonitor") >= 0)
													{
														   data.fromPage="graphLevel";//No I18N
														   data.graphID=OPMClient.SettingsConfigurationController.PerfGraphID;
													}
													else if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Configurations.DeviceTemplate.Edit.SingleMonitor") >= 0)
													{
														   data.fromPage="templateLevel";//No I18N
														   data.graphID=MonitorDetails.GRAPHID;
														   data.deviceTypeID=OPMClient.SettingsDeviceTemplateController.typeId
													}
													var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/revertAdaptiveThresholds",data);//No I18N
													if(rsp.error)
													{
						                    	if(rsp.error.code == 13000)
						                    	{
																		reverseAtThreshold(self);
						                    		$( this ).dialog( "close" );
						                    	}
						                    	else
						                    	{
													    			opm_infoMsgs("errorMsg",rsp.error.message);//No I18N
						                    	}
													}
													else
													{	
														reverseAtThreshold(self);
														$("#at_snmpWarnValue").val('');
														$("#at_snmpTroubleValue").val('');
														$("#at_snmpErrorValue").val('');
														if(jQuery.isEmptyObject(rsp))
														{
															var snmpErrorMsg = $("#snmpErrorMsg").val() 
															var snmpRearmMsg = $("#snmpRearmMsg").val() 
															if(snmpErrorMsg == '' && snmpRearmMsg != '')
															{
													        	$("#snmpWarnMsg").val(snmpRearmMsg);
													        	$("#snmpTroubleMsg").val(snmpRearmMsg);
													        	$("#snmpErrorMsg").val(snmpRearmMsg);
															}
															return;
														}
														rsp.AttentionType ? $("#snmpWarnType").val(rsp.AttentionType).select2().change() : '';
													    $("#snmpWarnValue").val(rsp.AttentionVal || '');
													    $("#snmpWarnMsg").val(rsp.AttentionMessage || '');
														rsp.TroubleType ? $("#snmpTroubleType").val(rsp.TroubleType).select2().change() : '';
													    $("#snmpTroubleValue").val(rsp.TroubleVal || '');
													    $("#snmpTroubleMsg").val(rsp.TroubleMessage || '');
														rsp.CriticalType ? $("#snmpErrorType").val(rsp.CriticalType).select2().change() : '';
													    $("#snmpErrorValue").val(rsp.CriticalVal || '');
													    $("#snmpErrorMsg").val(rsp.CriticalMessage || '');
														rsp.rearmType ? $("#snmpRearmType").val(rsp.rearmType).select2().change() : '';
													    $("#snmpRearmValue").val(rsp.rearmVal || '');
													    $("#snmpRearmMsg").val(rsp.rearmMessage || '');
													}
													if(rsp.result)
													{
														opm_infoMsgs("successMsg",rsp.result.message); //No I18N
													}
						        			$( this ).dialog( "close" );
						        			checkThresholdEnabledOrNot('settings');//No I18N
						        },
						        Cancel: function() {
						         	$( this ).dialog( "close" );
						        }
						      }
						    });               
            }
            else
            {
            	if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Configurations.DeviceTemplate.Edit.SingleMonitor") >= 0)
              {
              	 if($("input[name='smmpAlertOrGraph']:checked").val() == "false")
              	 {
              	 	  alert(Ember.I18n.t('webclient.perf.adaptive.threshold.enable.alertMsg',this));//No I18N
              	 	  reverseAtThreshold(this)
              	 }
              }
            }
		}
	},
	willDestroyElement:function()
  	{	
      $('body').removeClass('ui-dialog-style2');
    }
});

function reverseAtThreshold(self,resp)
{
	 var MonitorDetails = $.extend(true, {}, self.get('controller.MonitorDetails'));
   var is_at_enabled = MonitorDetails.isAtEnabled;
   MonitorDetails.isAtEnabled = ! is_at_enabled;
   self.set('controller.MonitorDetails',MonitorDetails);//No I18N
   if(resp)
   {
   	   var graphIds = OPMClient.SettingsDeviceTemplateController.graphIds;
   		 $.each(graphIds, function(i,val){
				if(MonitorDetails.GRAPHID == val.GRAPHID)
				{
					OPMClient.SettingsDeviceTemplateController.graphIds[i].dataArray.warningMsg = resp.AttentionMessage
					OPMClient.SettingsDeviceTemplateController.graphIds[i].dataArray.troubleMsg = resp.TroubleMessage
					OPMClient.SettingsDeviceTemplateController.graphIds[i].dataArray.criticalMsg = resp.CriticalMessage
					OPMClient.SettingsDeviceTemplateController.graphIds[i].dataArray.warningMessage = resp.AttentionMessage
					OPMClient.SettingsDeviceTemplateController.graphIds[i].dataArray.troubleMessage = resp.TroubleMessage
					OPMClient.SettingsDeviceTemplateController.graphIds[i].dataArray.criticalMessage = resp.CriticalMessage
					return false; // breaks
				}
			});
		}

}
OPMClient.OpmAssociationComponent = Ember.Component.extend({
	templateName: "components/opm-association",//No I18N
	classNames:["multiSelectBox4 type1"],//No I18N
	availableListName:"availableListName",//No I18N
	selectedListName:"selectedListName",//No I18N
	customHeightClass:"height300",//No I18N
	availableHeaderText:'webclient.Available',//No I18N
	selectedHeaderText:'webclient.Selected',//No I18N
	onScrollDataLoad:false,
	onScrollDataLoadSelected:false,
	customHeightInPixel:'',
	loadingDataCount:100,
	itemsPushed:0,
	itemsPushedSelected:0,
	totalItems:0,
	totalItemsSelected:0,
	availableList:[],
	selectedList:[],
	allItemsLoaded:false,
	allItemsLoadedSelected:false,
	height:0,
	heightSelected:0,
	searchModifiedListSelected:[],
	searchTimeoutSelected: null,
	searchTimeoutAvailable: null,
	didInsertElement:function(){
		var self = this;
		$('#'+self.elementId).addClass(self.customHeightClass);//No I18N
		if(self.availableHeaderText!==undefined){
			self.set("availableHeaderText",getI18nValue(self.availableHeaderText));//No I18N
		}
		if(self.selectedHeaderText!==undefined){
			self.set("selectedHeaderText",getI18nValue(self.selectedHeaderText));//No I18N
		}
	},
	resetAvailableProperties:function(){
		var self = this;
		self.set('itemsPushed',0);//No I18N
		self.set('totalItems',0);//No I18N
		self.set('allItemsLoaded',false);//No I18N
		$('#'+self.availableListName).scrollTop(0);
	},
	availListObserver: function(){
		var self = this;
		self.resetAvailableProperties();
		if(self.onScrollDataLoad && self.availableList!==undefined){
			if(!self.isSearchDone) {
				self.set('customAvailableList',self.availableList.slice(0,self.loadingDataCount));//No I18N
			} else {
				self.isSearchDone = false;
			}
			self.set('totalItems',self.availableList.length);//No I18N
			self.set('itemsPushed',self.loadingDataCount);//No I18N
			self.set("availableListToSplice", self.availableList.slice(self.loadingDataCount));//No I18N
			$('#'+self.availableListName).off('scroll.lazyAvailable').on('scroll.lazyAvailable', function(){//No I18N
		        if((Math.ceil($(this).scrollTop()) + Math.ceil($(this).innerHeight())) >= Math.ceil($(this)[0].scrollHeight)){
					if(self.$("input[name='assoAvailableSearch']").val()) {
						if(!self.searchModifiedListAvailable || self.searchModifiedListAvailable.length === 0) {
							return;
						}
						self.set('heightAvailable',$(this).scrollTop());//No I18N
			            if(!self.allItemsLoadedAvailable){
							self.customAvailableList.pushObjects(self.searchModifiedListAvailable.splice(0,self.loadingDataCount));
			            }
			            Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
							$(this).scrollTop(self.heightAvailable);
						});
						return;
					}
		        	if(!self.allItemsLoaded) {
		        		self.set('heightAvailable',$(this).scrollTop());//No I18N
						self.customAvailableList.pushObjects(self.availableListToSplice.splice(0,self.loadingDataCount));
						if(self.availableListToSplice.length === 0) {
							self.set('allItemsLoaded',true);//No I18N
						}
						Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
							$(this).scrollTop(self.heightAvailable);
						});
					}
			  }
			});
		}else{
			self.set('customAvailableList',self.availableList ? self.availableList.slice() : []);//No I18N
			self.set('allItemsLoaded',true);//No I18N
		}
  	}.observes('availableList'),//No I18N
	resetAvailablePropertiesSelected: function() {
		var self = this;
		self.set('itemsPushedSelected',0);//No I18N
		self.set('totalItemsSelected',0);//No I18N
		self.set('allItemsLoadedSelected',false);//No I18N
		$('#'+self.selectedListName).scrollTop(0);
	},
  	selectListObserver: function(){
		var self = this;
		self.resetAvailablePropertiesSelected();
		if(self.onScrollDataLoadSelected && self.selectedList!==undefined){
			if(OPMClient.ApplicationController.assoDetails) {
				OPMClient.ApplicationController.assoDetails.onScrollDataLoadSelected = true;
			}
			if(self.isSearchDoneSelected) {
				self.set("isSearchDoneSelected", false);//No I18n
			} else {
				self.set('customSelectedList',self.selectedList.slice(0,self.loadingDataCount));//No I18N
			}
			self.set("selectedListToSplice", self.selectedList.slice(self.loadingDataCount));//No I18N
			self.set('totalItemsSelected', self.selectedList.length);//No I18N
			self.set('itemsPushedSelected',self.loadingDataCount);//No I18N
			$('#'+self.selectedListName).off('scroll.lazySelect').on('scroll.lazySelect', function() {//No I18N
				if((Math.ceil($(this).scrollTop()) + Math.ceil($(this).innerHeight())) >= Math.ceil($(this)[0].scrollHeight)){
					if(self.$("input[name='assoSelectSearch']").val()) {
						if(!self.searchModifiedListSelected || self.searchModifiedListSelected.length === 0) {
							return;
						}
						self.set('heightSelected',$(this).scrollTop());//No I18N
			            if(!self.allItemsLoadedSelected){
							self.customSelectedList.pushObjects(self.searchModifiedListSelected.splice(0,self.loadingDataCount));
			            }
			            Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
							$(this).scrollTop(self.heightSelected);
						});
						return;
					}
		        	if(!self.allItemsLoadedSelected){
						self.set('heightSelected',$(this).scrollTop());//No I18N
						self.customSelectedList.pushObjects(self.selectedListToSplice.splice(0,self.loadingDataCount));
						if(self.selectedListToSplice.length === 0) {
							self.set('allItemsLoadedSelected',true);//No I18N
						}
						Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
							$(this).scrollTop(self.heightSelected);
						});
					}
			  }
			});
		}else{
			self.set('customSelectedList', self.selectedList ? self.selectedList.slice() : []);//No I18N
			self.set('allItemsLoadedSelected',true);//No I18N
		}
  	}.observes('selectedList'),//No I18N
  	heightObserver:function(){
  		var self = this;
		if(self.customHeightInPixel!=='' && self.customHeightInPixel>300){
			self.set('customHeightStyle','height:'+self.customHeightInPixel+'px');//No I18N
		}
  	}.observes('customHeightInPixel'),//No I18N
  	availableHeaderTextObserver:function(){
		if(this.availableHeaderText) {
			this.set("availableHeaderText",getI18nValue(this.availableHeaderText));//No I18N
		}
  	}.observes('availableHeaderText'),//No I18N
  	selectedHeaderTextObserver:function(){
		if(this.selectedHeaderText) {
			this.set("selectedHeaderText",getI18nValue(this.selectedHeaderText));//No I18N
		}
  	}.observes('selectedHeaderText'),//No I18N
	actions:{
		opm_leftToRight:function()
		{
			var self = this;
			var movedItems = [];		
			$.each($("#"+self.availableListName+" option:selected"), function(){//No I18N
				var movedItem = {'displayName':$(this).text(),"value":$(this).attr("value")};//No I18N
				movedItems.push(movedItem);
				self.customSelectedList.pushObject(movedItem);
				if(self.selectedList!==undefined){
					self.selectedList.pushObject(movedItem); //To Update original selected list.
				}
				var availableListLocation = self.customAvailableList.findBy('value', $(this).attr("value")); //No I18N
				if(availableListLocation!=undefined){
					self.customAvailableList.removeObject(availableListLocation); 
				}
				var availableListLocationOriginal = self.availableList.findBy('value', $(this).attr("value")); //No I18N
				if(availableListLocationOriginal != undefined){
					self.availableList.removeObject(availableListLocationOriginal); 
				}
				
				// TO UPDATE THE SPLICING LIST AS WELL
				if(self.availableListToSplice && self.availableListToSplice.length > 0) {
					var availableListLocationSpliced=self.availableListToSplice.findBy('value', $(this).attr("value")); //No I18N
					if(availableListLocationSpliced!=undefined){
						self.availableListToSplice.removeObject(availableListLocationSpliced); //To Update original selected list.
					}
				}
				if(self.selectedListToSplice && self.selectedListToSplice.length > 0) {
					var selectedListLocationSpliced=self.selectedListToSplice.findBy('value', $(this).attr("value")); //No I18N
					if(selectedListLocationSpliced!=undefined){
						self.selectedListToSplice.removeObject(selectedListLocationSpliced); //To Update original selected list.
					}
				}
			});		
			if (this.get('notifyOnMove')) {
				var parentView = this.get('parentView');
				if (parentView) {
					parentView.send('notifyOnMove', movedItems, true);//No I18N
				}
			}

		},
		opm_rightToLeft:function()
		{
			var self = this;
			var movedItems = [];		
			$.each($("#"+self.selectedListName+" option:selected"), function(){//No I18N
				var movedItem = {'displayName':$(this).text(),"value":$(this).attr("value")};//No I18N
				movedItems.push(movedItem);
				self.customAvailableList.pushObject(movedItem);
				self.availableList.pushObject(movedItem); //To Update original selected list.
				var selectedListLocation=self.customSelectedList.findBy('value', $(this).attr("value")); //No I18N
				if(selectedListLocation!=undefined){
					self.customSelectedList.removeObject(selectedListLocation); 
				}
				if(self.selectedList!==undefined){
					var selectedListLocationOriginal=self.selectedList.findBy('value', $(this).attr("value")); //No I18N
					if(selectedListLocationOriginal!=undefined){
						self.selectedList.removeObject(selectedListLocationOriginal); //To Update original selected list.
					}
				}
				// TO UPDATE THE SPLICING LIST AS WELL
				if(self.selectedListToSplice && self.selectedListToSplice.length > 0) {
					var selectedListLocationSpliced=self.selectedListToSplice.findBy('value', $(this).attr("value")); //No I18N
					if(selectedListLocationSpliced!=undefined){
						self.selectedListToSplice.removeObject(selectedListLocationSpliced); 
					}
				}
				if(self.availableListToSplice && self.availableListToSplice.length > 0) {
					var availableListLocationSpliced=self.availableListToSplice.findBy('value', $(this).attr("value")); //No I18N
					if(availableListLocationSpliced!=undefined){
						self.availableListToSplice.removeObject(availableListLocationSpliced);
					}
				}
			});		
			if (this.get('notifyOnMove')) {
				var parentView = this.get('parentView');
				if (parentView) {
					parentView.send('notifyOnMove', movedItems, false);//No I18N
				}
			}
		},
		showSearch:function(srchBoxDiv){
			var ele = $('#'+this.elementId+" div[name='"+srchBoxDiv+"']");//No I18N
			if(ele.hasClass('searchOpen')){//No I18N
				ele.removeClass('searchOpen');//No I18N
			}else{
				ele.addClass('searchOpen');//No I18N
			}
		}
	},
	keyUp:function(evt){
		var self = this;
		var listName = (evt.target.name==="assoAvailableSearch")?this.availableListName:this.selectedListName;//No I18N
		var searchStr = $('#'+this.elementId+" input[name='"+evt.target.name+"']").val();
		if(self.onScrollDataLoadSelected) {
			if(evt.target.name==="assoSelectSearch") {
				if(self.searchTimeoutSelected != null) {
					clearTimeout(self.searchTimeoutSelected);
				}
				self.searchTimeoutSelected = setTimeout(function() {
					self.set('searchModifiedListSelected', []); //No I18n
					self.set('customSelectedList', []); //No I18n
					if(searchStr) {
						self.searchModifiedListSelected = self.selectedList.filter(function(obj) {
							return obj.displayName.toLowerCase().indexOf(searchStr.toLowerCase()) > -1
						})
						self.set('customSelectedList', self.searchModifiedListSelected.splice(0, self.loadingDataCount)); //No I18n
						self.set("isSearchDoneSelected", true);//No I18n
					} else {
						self.set("isSearchDoneSelected", false);//No I18n
					}
					self.notifyPropertyChange('selectedList'); //No I18n
					clearTimeout(self.searchTimeoutSelected);
				}, 500);
			} else if(evt.target.name==="assoAvailableSearch") {
				if(self.searchTimeoutAvailable != null) {
					clearTimeout(self.searchTimeoutAvailable);
				}
				self.searchTimeoutAvailable = setTimeout(function() {
					self.set('searchModifiedListAvailable', []); //No I18n
					self.set('customAvailableList', []); //No I18n
					if(searchStr) {
							self.searchModifiedListAvailable = self.availableList.filter(function(obj) {
							return obj.displayName.toLowerCase().indexOf(searchStr.toLowerCase()) > -1
						})
						self.set('customAvailableList', self.searchModifiedListAvailable.splice(0, self.loadingDataCount)); //No I18n
						self.set("isSearchDone", true);//No I18n
					} else {
						self.set("isSearchDone", false);//No I18n
					}
					self.notifyPropertyChange('availableList'); //No I18n
					clearTimeout(self.searchTimeoutAvailable);
				}, 500)
			}
			return;
		}
		if(evt.target.name==="assoAvailableSearch" && !self.allItemsLoaded)//No I18N
		{
			for(var i=self.itemsPushed;i<self.availableList.length;i++){
        		self.customAvailableList.pushObject(self.availableList[i]);
        	}
        	self.set('allItemsLoaded',true);//No I18N
		}
		if(evt.target.name==="assoAvailableSearch" || evt.target.name==="assoSelectSearch"){//No I18N
			$("#"+this.elementId+" #"+listName+" option").each(function(index,ele) {//No I18N
			    var escapeRegex = searchStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); 
			    if($(ele).text().search(new RegExp(escapeRegex,"i")) >= 0) {//No I18N
		            $(ele).removeAttr('disabled').show();//No I18N
		        }else{
		            $(ele).attr('disabled','disabled').hide();//No I18N
		        }
		    });
		}
	},
  	willDestroyElement:function()
  	{	
        $('#'+this.elementId).find('*').remove();//No I18N
		if(OPMClient.ApplicationController.assoDetails) {
			OPMClient.ApplicationController.assoDetails.onScrollDataLoadSelected = undefined;
		}
	}
});
/********************* OPM Message Card Starts ****************************/
var OpmMsgCardDetails = [];
OPMClient.OpmMessageCardComponent = Ember.Component.extend({
	templateName: "components/opm-message-card",//No I18N
	classNames:["alarmNotificationInfo"],//No I18N
	pageName:"",
	didInsertElement: function(){
		messageCardEvents();
		var pageDetails = this.get('pageDetails');//No I18N
		if(Object.keys(pageDetails).length>0 && (!window.OPM.isNCMEE || !window.OPM.isCentralServer || window.OPM.isProbeSelected))
		{
			pageName = pageDetails.pageName;
			if(pageName!==undefined)
			{
				OPMClient.ApplicationController.msgCardPageName = pageName;
				if(OpmMsgCardDetails[pageName]===undefined)
				{
					var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMessagesForPage?",pageDetails);//No I18N
					if(response[pageName]!==undefined && response[pageName].messages!==undefined && Object.keys(response[pageName].messages).length>0){
						OpmMsgCardDetails = response;
					}
				}
				if(OpmMsgCardDetails[pageName]!==undefined){
					var msgContent = OpmMsgCardDetails[pageName].messages;
				 	this.set("response",msgContent);//No I18N
				$('body').addClass("alarmNotificationInfoActive");//No I18N
				 	this.set("infoStyle",(msgContent.ALERT===undefined)?'display:block':'display:none');//No I18N
				 	$('#'+this.elementId+' .ProductCustomScroll').mCustomScrollbar();//No I18N
				}else{
					$('#'+this.elementId).hide();//No I18N
				}
			}else{
				$('#'+this.elementId).hide();//No I18N
			}
		}else{
			$('#'+this.elementId).hide();//No I18N
		}
	},
	actions:{
		closeMessage:function(msgId)
		{
			opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/closeMsgForUser?',{pageName:pageName,msgId:msgId});//No I18N
			var tabid = $('.alarmNotificationInfo div[data-id="'+msgId+'"]').parent().attr('id');//No I18N
			$('.alarmNotificationInfo div[data-id="'+msgId+'"]').remove();//No I18N
			var childCount = $(".alarmNotificationInfo #"+tabid+" > div").length;//No I18N
			if(childCount<1)
			{
				$(".alarmNotificationInfo #"+tabid+",li[data-href='"+tabid+"']").remove();//No I18N
				var nextLi = $(".alarmNotifyTab > li:first-child");//No I18N
				if(nextLi.length<1)
				{
					OpmMsgCardDetails=[];
					$('body').removeClass("alarmNotificationInfoActive");//No I18N
					$('#'+this.elementId).find('*').remove();//No I18N
					$('#'+this.elementId).remove();//No I18N
				}
				else
				{
					nextLi.addClass("active");//No I18N
					var alarmNotifyTab='#' + $(nextLi).data('href');//No I18N
					$(this).closest('.alarmNotificationInfo').find('section > div').hide();//No I18N
					$(alarmNotifyTab).show();
				}
			}else{
				$(".alarmNotificationInfo li[data-href='"+tabid+"'] > span").text(childCount);//No I18N
			}
		}
	},
	rerenderMsgDialog: function(){
  		this.rerender();
  	}.observes('pageDetails'),//No I18N
	willDestroyElement: function(){
		OpmMsgCardDetails=[];
		OPMClient.ApplicationController.msgCardDetails={};
		$('.alarmNotifyTab').off('click','li');//No I18N
		$('#'+this.elementId+' .ProductCustomScroll').mCustomScrollbar("destroy");//No I18N
		$('body').removeClass("alarmNotificationInfoActive");//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});
function messageCardEvents()
{
	$('.alarmNotifyTab').on('click','li',function(){//No I18N
		if(!$(this).hasClass('active')){//No I18N
			$('.alarmNotifyTab > li').removeClass('active');//No I18N
			$(this).addClass('active');//No I18N
			var alarmNotifyTab='#' + $(this).data('href');//No I18N
			$(this).closest('.alarmNotificationInfo').find('section .content').hide();//No I18N
			$(alarmNotifyTab).show();
		}
	});
}

OPMClient.OpmNotesComponent = Ember.Component.extend({
	templateName: "components/opm-notes",//No I18N
	didInsertElement: function(){
		if(this.get('highlight')===true){
			$('#'+this.elementId+' #noteMsg').effect( "highlight", {color:"#fff8d1"}, 5000 );
		}
	},
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();
	}
});

/********************* OPM Message Card Ends****************************/

/*************** Tab Customization starts ************************/
OPMClient.OpmTabInfoDialogComponent = Ember.Component.extend({
	templateName: "components/opm-tab-info-dialog",//No I18N
	tabInfo:{},
	classNames:["hrMenuAddNewHolder"],//No I18N
	didInsertElement:function(){
		var self = this;
		tabInfo = self.get("tabInfo");//No I18N
		if(tabInfo!==undefined && Object.keys(tabInfo).length>0){
			if(tabInfo.isNewTab!==undefined && tabInfo.isNewTab)
			{
				self.set("tabHeader",Ember.I18n.t("webclient.tab.New",this));//No I18N
				self.set("isNewTab",true);//No I18N
				$("#newTabType").show();
				$("#tabUrlDiv").show();
				$("#tabValue").val("");
				$("#tabUrl").val("");
			}
			else
			{
				self.set("tabHeader",Ember.I18n.t("webclient.tab.rename",this));//No I18N
				self.set("tabIdentifier",tabInfo.tabIdentifier);//No I18N
				if(tabInfo.isVisible) {
					$('input[value="showMenu"]').prop("checked", true);
				} else {
					$('input[value="hideMenu"]').prop("checked", true);
				}
				self.set("isNewTab",false);//No I18N
				if(tabInfo.primaryTab)
				{
					var currTab = OPMClient.MenuController.mainTabDetails[tabInfo.tabIdentifier];
					self.set("tabValue",currTab.displayName);//No I18N
					if(currTab.isCustom){//No I18N
						self.set("isNewTab",true);//No I18N
						$("#newTabType").show();
						$("input[name='tabType'][value='"+currTab.linktype+"']").click();
						if(currTab.linktype==="url"){//No I18N
							$("#tabUrlDiv").show();
							$("#tabUrl").val(currTab.tab_link);//No I18N
						}else{
							$("#tabEmbedDiv").show();
							$("#tabEmbedLink").val(currTab.tab_link);//No I18N
						}
						self.set("tabHeader",Ember.I18n.t("webclient.tab.configure",this));//No I18N
					}
				}
				else if(tabInfo.secondaryTab)
				{
					var currTab = OPMClient.MenuController[tabInfo.secLinkName];
					if(currTab != undefined) {
						var tempTab = getSelectedSubTab(currTab,tabInfo.tabIdentifier);
						self.set("tabValue",tempTab.displayName);//No I18N
						if(tempTab.isCustom){
							self.set("isNewTab",true);//No I18N
							$("#newTabType").show();
							$("input[name='tabType'][value='"+tempTab.linktype+"']").click();//No I18N
							if(tempTab.linktype==="url"){//No I18N
								$("#tabUrlDiv").show();
								$("#tabUrl").val(tempTab.tab_link);//No I18N
							}else{
								$("#tabEmbedDiv").show();
								$("#tabEmbedLink").val(tempTab.tab_link);//No I18N
							}
							if(tempTab.isVisible) {
								$('input[value="showMenu"]').prop("checked", true);
							} else {
								$('input[value="hideMenu"]').prop("checked", true);
							}
							self.set("tabHeader",Ember.I18n.t("webclient.tab.configure",this));//No I18N
						}
					}
				}
			}
			$("#hrMenuEditView .hrMenuAddNew").addClass("active");//No I18N
			$("html").addClass("hrMenuEditPopUpActive");//No I18N
		}
		$("#tabEmbedDiv #editwidget_framesrc_note").hide();
		if(window.OPM.frameSrcUrls) {
			$("#tabEmbedDiv #editwidget_framesrc_note").show();
			$("#tabEmbedDiv #editwidget_framesrc").off("click.editwidget_framesrc").on("click.editwidget_framesrc", function() {
				var recID = "frameSrcUrls"; //No I18n
				OPMClient.ApplicationController.set("secRecActionTrigger", {recID: recID, isFromComponent: "tabDialog"}); //No I18n
				if(OPMClient.ApplicationController.isOPMEEUnifiedConsoleView) {
					window.OPM.EETempProbeIdExcludeForApi = true;
				}
				if(OPMClient.ApplicationController.currentPath.indexOf("Settings.Basic.SSLSettings.SecurityRecommendations") >= 0) {
					OPMClient.__container__.lookup("controller:SettingsBasicSSLSettingsSecurityRecommendations").send("recAction", recID); //No I18n
				} else {
					opm_transitionToParentRoute('Settings.Basic.SSLSettings.SecurityRecommendations'); //No I18n
				}
				self.send("closeTabDialog"); //No I18n
				OPMClient.ApplicationController.send("saveTabDetails", "no"); //No I18n
			});
		}
	},
	tabDialogRerender: function(){
  		this.rerender();
  	}.observes('tabInfo'),//No I18N
	actions:{
		saveTabDetails:function(){
			var newTabInfo = {};
			OPMClient.ApplicationController.set('originalTabDetails', JSON.parse(JSON.stringify(OPMClient.ApplicationController.tabDetails)));//No I18N
			newTabInfo.displayName = $("#tabValue").val();//No I18N
			newTabInfo.isVisible = $("input[value='showMenu']").is(':checked');
			var parentEle = $("#mainNavSortList div[data-identifier='"+tabInfo.tabIdentifier+"']");
			var childEle =$("#subNavSortList div[data-identifier='"+tabInfo.tabIdentifier+"']");
			if(newTabInfo.isVisible){
				if(tabInfo.primaryTab) {
					$(parentEle).removeClass("disabled");//No I18N
				} else if(tabInfo.secondaryTab) {
					$(childEle).removeClass("disabled");//No I18N
				}	
			}else{
				if(tabInfo.primaryTab) {
					$(parentEle).addClass("disabled");//No I18N
				} else if(tabInfo.secondaryTab) {
					$(childEle).addClass("disabled");//No I18N
				}
			}
			var isInvalidName = !nfa_isValidName(newTabInfo.displayName, "~!@#$%^*()+=-[]\\\';,./{}|\":<>?`");
			if(!opm_validateFields({'empty':['tabValue'],'custom':[{'identifier':'tabValue','condition':isInvalidName,'message':Ember.I18n.t('webclient.admin.traps.specialchar')}],'maxCharacters':{'tabValue': 50}})){
				return false;
			}
			newTabInfo.linktype = $("input[name='tabType']:checked").val();//No I18N
			if(newTabInfo.linktype==="url"){//No I18N
				newTabInfo.tab_link = $("#tabUrl").val();//No I18N
				if($("#tabUrl").is(":visible") && (!opm_validateFields({'empty':['tabUrl'],'maxCharacters':{'tabUrl':250}}) || !checkValidTabURL('#tabUrl'))){
					return false;
				}
			}else if(newTabInfo.linktype==="embed"){//No I18N
				newTabInfo.tab_link = $("#tabEmbedLink").val();//No I18N
				if($("#tabEmbedLink").is(":visible") && (!opm_validateFields({'empty':['tabEmbedLink'],'maxCharacters':{'tabEmbedLink':250}}) || !checkValidTabURL('#tabEmbedLink'))){
					return false;
				}
			}
			if(newTabInfo.tab_link.indexOf("http")===-1){
				newTabInfo.tab_link = "http://"+newTabInfo.tab_link;//No I18N
			}
            if(newTabInfo.tab_link.indexOf("/Alarms/Alarm/Custom") !==-1){//No I18N
                var identifier = 'tabUrl';//No I18N
                if(newTabInfo.linktype==="embed"){//No I18N
                    identifier ='tabEmbedLink';//No I18N
                }
                var crit = newTabInfo.tab_link.substring(newTabInfo.tab_link.indexOf("Custom/") +7);
                crit = crit.substring(0, crit.indexOf("_"));
                var isCritSupported = ["category","alarmCode","eventType","deviceType","severity"].contains(crit);//No I18N

                if(!opm_validateFields({'custom':[{'identifier':identifier,'condition':!isCritSupported,'message':'Invalid filter criteria. Only severity, category, and deviceType are supported.'}]})){//No I18N
                    return false;
                }
            }
			if(tabInfo.isNewTab)
			{
				newTabInfo.isNewTab = newTabInfo.isCustom = newTabInfo.isVisible = true;
				newTabInfo.tabIdentifier = setTabIdentifier(newTabInfo.displayName);
				if(tabInfo.tabLevel==="primary")//No I18N
				{
					var maxPos = 0;
					OPMClient.ApplicationController.tabDetails.forEach(function(t) { if(t.tab_position > maxPos) { maxPos = t.tab_position; } });
					newTabInfo.tab_position = maxPos + 1;
					newTabInfo.primaryTab = true;
					newTabInfo.secLinkName = newTabInfo.tabIdentifier;
					OPMClient.MenuController[newTabInfo.secLinkName]=[];
					newTabInfo.subtabs = OPMClient.MenuController[newTabInfo.secLinkName];
					OPMClient.MenuController.mainTabDetails[newTabInfo.tabIdentifier] = newTabInfo;
					OPMClient.ApplicationController.tabDetails.pushObject(newTabInfo);
					initializeMainMenuScroll();
					$('div[data-identifier="'+newTabInfo.tabIdentifier+'"]').click();//No I18N
					$("#mainNavSort").mCustomScrollbar('scrollTo','last');//No I18N
				}
				else if(tabInfo.tabLevel==="secondary")
				{
					var maxSubPos = 0;
					var parentSubs = OPMClient.MenuController.mainTabDetails[$("#mainNavSortList > td.active > div").data("identifier")]; //No I18N
					if(parentSubs && parentSubs.subtabs) { parentSubs.subtabs.forEach(function(t) { if(t.tab_position > maxSubPos) { maxSubPos = t.tab_position; } }); }
					newTabInfo.tab_position = maxSubPos + 1;
					newTabInfo.secondaryTab = true;
					newTabInfo.parentIdentifier = $("#mainNavSortList > td.active > div").data("identifier");//No I18N
					newTabInfo.secLinkName = $("#mainNavSortList > td.active > div").data("name");//No I18N
					if(OPMClient.MenuController.customizeSecondaryMenus===undefined){
						OPMClient.MenuController.set("customizeSecondaryMenus",[]);//No I18N
					}
					OPMClient.MenuController[newTabInfo.secLinkName].pushObject(newTabInfo);
					if(!$("#mainNavSortList > td.active > div").data("custom")){//No I18N
						OPMClient.MenuController.mainTabDetails[newTabInfo.parentIdentifier].subtabs.pushObject(newTabInfo);
					}
					initializeSubMenuScroll();
				}
			}
			else
			{
				if(tabInfo.primaryTab)
				{
					OPMClient.MenuController.mainTabDetails[tabInfo.tabIdentifier].displayName = newTabInfo.displayName;
					OPMClient.MenuController.mainTabDetails[tabInfo.tabIdentifier].isVisible = newTabInfo.isVisible;
					if(OPMClient.MenuController.mainTabDetails[tabInfo.tabIdentifier].isCustom)//No I18N
					{
						OPMClient.MenuController.mainTabDetails[tabInfo.tabIdentifier].linktype = newTabInfo.linktype;
						OPMClient.MenuController.mainTabDetails[tabInfo.tabIdentifier].tab_link = newTabInfo.tab_link;
					}
					$("#mainNavSortList div[data-identifier='"+tabInfo.tabIdentifier+"'] > span").text(newTabInfo.displayName);//No I18N
					initializeMainMenuScroll();
					$("#mainNavSort").mCustomScrollbar('scrollTo','last');//No I18N
				}
				else if(tabInfo.secondaryTab)
				{
					var currTab = OPMClient.MenuController[tabInfo.secLinkName];
					var tempTab = getSelectedSubTab(currTab,tabInfo.tabIdentifier);
					tempTab.displayName = newTabInfo.displayName;
					tempTab.isVisible = newTabInfo.isVisible;
					if(tempTab.isCustom)//No I18N
					{
						tempTab.linktype = newTabInfo.linktype;
						tempTab.tab_link = newTabInfo.tab_link;
					}
					$("#subNavSortList div[data-identifier='"+tabInfo.tabIdentifier+"'] > span").text(newTabInfo.displayName);//No I18N
					initializeSubMenuScroll();
					$("#subNavSort").mCustomScrollbar('scrollTo','last');//No I18N
				}
			}
			$("#hrMenuEditView .hrMenuAddNew").removeClass("active");//No I18N
			$("html").removeClass("hrMenuEditPopUpActive");//No I18N
		},
		closeTabDialog:function(){
			$("#hrMenuEditView .hrMenuAddNew").removeClass("active");//No I18N
			$("html").removeClass("hrMenuEditPopUpActive");//No I18N
		},
		tabTypeChange:function(tabTypeValue){
			$('#'+this.elementId+" .tabTypeDiv").hide();//No I18N
			if(tabTypeValue === "url"){
				$('#'+this.elementId+" #tabUrlDiv.tabTypeDiv").show();//No I18N
			}else{
				$('#'+this.elementId+" #tabEmbedDiv.tabTypeDiv").show();//No I18N
			}
		}
	},
  	willDestroyElement:function()
  	{	
  		$("#hrMenuEditView .hrMenuAddNew").removeClass("active");//No I18N
  		$("html").removeClass("hrMenuEditPopUpActive");//No I18N
        $('#'+this.elementId).find('*').remove();//No I18N
    }
});
OPMClient.OpmSubMenuComponent = Ember.Component.extend({
	didInsertElement:function(){
		this.set('subMenuLinks',sortTabDetails(this.get('subMenuLinks')));//No I18N
	},
    willDestroyElement:function(){	
        $('#'+this.elementId).find('*').remove();//No I18N
    },
    actions:{
    	reportsFWASubHeaderPathAction:function(route,path,dispName,title)
    	{
    		$("#ReportSubTabs aside .pageTitle h4").text(dispName);//No I18N
    		setSubHeaderActive(title);
    		location.href = window.OPM.apiclientUrl+route+"/"+path.reportName; //No I18N
    	}
    }
});
OPMClient.OpmCustomTabComponent = Ember.Component.extend({
	classNames:["embedPopUp top-0"],//No I18N
	embedLink:"",
	didInsertElement:function(){
		var embedTabDetails = this.get('embedTabDetails');//No I18N
		if(!isEmptyObject(embedTabDetails)){
			$('html').addClass('embedPopUpActive');//No I18N
			this.set("embedLink",embedTabDetails.tab_link);//No I18N
			//OPMClient.ApplicationController.embedTabDetails.elementId = this.elementId;
			// if(embedTabDetails.parentIdentifier!==undefined && !OPMClient.MenuController.mainTabDetails[embedTabDetails.parentIdentifier].isCustom){
			// 	$('#'+this.elementId).addClass("level-2");//No I18N
			// }
		}
	},
	embedTabDetailsObserver:function(){
		this.rerender();
	}.observes('embedTabDetails'),//No I18N
    willDestroyElement:function(){	
        clearCustomTabElements();
    }
});
function clearCustomTabElements()
{
	$('html').removeClass('embedPopUpActive');//No I18N
    OPMClient.ApplicationController.embedTabDetails={};
    var iframes = $('.embedPopUp').find('iframe');
    for (var i = 0; i < iframes.length; i++) {
	    iframes[i].parentNode.removeChild(iframes[i]);
	}
    $('.embedPopUp').find('*').remove();//No I18N
}
/*************** Tab Customization ends ************************/


OPMClient.OpmInfoMessageComponent = Ember.Component.extend({
	templateName: "components/opm-info-message",//No I18N
	classNames:["opmInfoMessage"],//No I18N
	didInsertElement: function(){
		var infoMsg = this.get('infoMessage');
		if(infoMsg!==undefined) {
			var infoMsgParam = this.get('infoMessageParam');
			var i18nmsg = infoMsg ?  Ember.I18n.t(infoMsg,{param0:infoMsgParam !== undefined ? infoMsgParam : ''}) : '';
			if(i18nmsg.indexOf("Missing translation")<0){
				this.set('infoMessage',i18nmsg); //No I18N
			}
		}

		var linkText = this.get('linkText');
		if(linkText!==undefined){
			linkText = Ember.I18n.t(this.get('linkText'),this);
			if(linkText.indexOf("Missing translation")<0){
				this.set('linkText',linkText); //No I18N
			}
		}

		var learnMoreLink = (this.learnMoreLink !== undefined && this.learnMoreLink !== "" && opm_isValidUrl(this.learnMoreLink) !== true) ? Ember.I18n.t(this.learnMoreLink, this) : this.learnMoreLink;
		if (learnMoreLink) {
			var campaign = getCampaign();
			if (learnMoreLink.indexOf('utm_source=inproduct') <= -1) {
				learnMoreLink += learnMoreLink.indexOf('?') <= -1 ? '?utm_source=inproduct&utm_campaign='+campaign : '&utm_source=inproduct&utm_campaign='+campaign;
			}
			this.set('learnMoreLink',learnMoreLink); //No I18N
		} 
	},
	infoMessageRender: function(){
		this.rerender();
	}.observes('infoMessage'),//No I18N
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();
	}
});
function _opmApplyMessageBand(component, pageName) {
	component.set('isMsgInfoLoading', false); //No I18N
	if(OpmMsgInfoDetails[pageName]!==undefined){
		if(_isAlarmMsgInfoPage(pageName)) {
			$("#opmInventorySideBarContent").addClass("MsgInfoSidebarFix");
		}

		if(pageName == 'DEVICESNAPSHOT_IPMI_PAGE'){
			var parentMoName = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ipmiDetails.moName;
			var parentDispName = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.ipmiDetails.displayName;
			var content = OpmMsgInfoDetails[pageName].messages.INFO[0];
			content.msg_content = content.msg_content+' <a onclick=redirectToDeviceSnapshot(\''+parentMoName+'\')>'+parentDispName+'</a>';//No I18N
		}
		if(pageName === 'CONFIGURATION_GROUP'){
			var content = OpmMsgInfoDetails[pageName].messages.INFO[0];
			if(content.msg_content.indexOf("~_~") != -1)//No I18N
			{
				var grpContentArr = content.msg_content.split(/~_~(.*)/g);
				content.msg_content = grpContentArr[1];
				content.msg_contentActions = grpContentArr[0];
			}
		}

		msgContent = OpmMsgInfoDetails[pageName].messages;
	 	$("html").addClass("MessageViewBoxOpen secondLevelNavActive");//No I18N
	 	$('#'+component.elementId).show();//No I18N
	 	if(OPMClient.InventoryDeviceDetailsController.opuNewSnapshot){
			$(".oputilsSnapshot").addClass("IPAMmsgShow");//No I18N
		}
		component.set("alertMsg",[]);//No I18N
		component.set("infoMsg",[]);//No I18N
	 	if(msgContent.ALERT!==undefined && msgContent.ALERT.length>0){
	 		component.set("alertMsg",msgContent.ALERT);//No I18N
	 		if(msgContent.ALERT.length===1){
	 			$('#'+component.elementId+' .nxtprev').hide();
	 		}
	 	}else if(msgContent.INFO!==undefined && msgContent.INFO.length>0){
	 		component.set("infoMsg",msgContent.INFO);//No I18N
	 		if(msgContent.INFO.length===1){
	 			$('#'+component.elementId+' .nxtprev').hide();
	 		}
	 	}else{
	 		_opmHideMessageBand(component, pageName);
	 	}
	 	if(pageName == 'MAPS_PAGE' && OPMClient.BVMapDetailsController.availRegionMap){
	 		var content = OpmMsgInfoDetails[pageName];
	 		if(content.messages){
	 			$.each(content.messages.INFO, function(){
	 				if(this.msg_name == 'ADD_GMAP_ZMAP' && this.msg_title == 'Google/Zoho Map'){
	 					this.msg_title = Ember.I18n.t("webclient.opm.map.regionmap.GmapZMapRegionMap",this);//No I18N
	 				}
	 			});
	 		}
	 	}
	 	messageInfoEvents(component,pageName);
		Ember.run.schedule('afterRender', function() {//No I18N
			$('.innerCont .sliderBox').find('a').attr('tabIndex','-1');
		});
	}else{
		_opmHideMessageBand(component, pageName);
	}
}
function _isAlarmMsgInfoPage(pageName) {
	var alarmPages = ["ACTIVE_ALARMS", "ALL_ALARMS", "EVENTLOG_ALARMS", "TRAP_ALARMS", "NFA_ALARMS", "WEB_ALARMS", "STORAGE_ALARMS"]; //No I18N
	return alarmPages.indexOf(pageName) !== -1;
}
function _opmHideMessageBand(component, pageName) {
	component.set('isMsgInfoLoading', false); //No I18N
	component.set("alertMsg",[]);//No I18N
	component.set("infoMsg",[]);//No I18N
	$("html").removeClass("MessageViewBoxOpen secondLevelNavActive");//No I18N
	if(_isAlarmMsgInfoPage(pageName)) {
		$("#opmInventorySideBarContent").removeClass("MsgInfoSidebarFix");
	}
	$('#'+component.elementId).hide();//No I18N
	closeMessageInfoDetailsOPUSnapshot();
}
function _opmGetMessageBandRequestSignature(pageName, pageDetails) {
	var serializedDetails = "";
	try {
		serializedDetails = JSON.stringify(pageDetails || {});
	} catch (ex) {
		serializedDetails = "";
	}
	return pageName + "|" + serializedDetails; //No I18N
}
var OpmMsgInfoDetails = [];
OPMClient.OpmMessageInfoComponent = Ember.Component.extend({
	templateName: "components/opm-message-info",//No I18N
	pageName:"",
	isMsgInfoLoading: false,
	msgContent:{},
	classNames:["topNews"],//No I18N
	didInsertElement: function(){
		var msgWidth = ($(".topNews").width()-400)+'px';//No I18N
		this.set('msgWidth','width:'+msgWidth);//No I18N
		var pageDetails = this.get('pageDetails');//No I18N
		if(window.OPM.showHelpBand!==undefined&&window.OPM.showHelpBand&&Object.keys(pageDetails).length>0 && (!window.OPM.isNCMEE || !window.OPM.isCentralServer || window.OPM.isProbeSelected) && !window.OPM.userPermissions.intfGroupRestricted)
		{
			var pageName = pageDetails.pageName;
			if(pageName!==undefined && pageName!=="")
			{
				this.set('pageName',pageName);//No I18N
				OPMClient.ApplicationController.msgCardPageName = pageName;
				if(OpmMsgInfoDetails[pageName]===undefined)
				{
					var self = this;
					var messageBandRequestToken = (self.get('_opmMessageBandRequestToken') || 0) + 1;
					var messageBandRequestSignature = _opmGetMessageBandRequestSignature(pageName, pageDetails);
							self.set('_opmMessageBandRequestToken', messageBandRequestToken); //No I18N
							self.set('_opmMessageBandRequestSignature', messageBandRequestSignature); //No I18N
					opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern + "/admin/getMessagesForPage?", pageDetails, '', function(response) { //No I18N
						if(self.get('isDestroying') || self.get('isDestroyed') || self.get('_opmMessageBandRequestToken') !== messageBandRequestToken || self.get('_opmMessageBandRequestSignature') !== messageBandRequestSignature) {
							return;
						}
						if(response && response[pageName]!==undefined && response[pageName].messages!==undefined && Object.keys(response[pageName].messages).length>0){
							OpmMsgInfoDetails = response;
						}
						if(self.get('isDestroying') || self.get('isDestroyed') || self.get('_opmMessageBandRequestToken') !== messageBandRequestToken || self.get('_opmMessageBandRequestSignature') !== messageBandRequestSignature) {
							return;
						}
						_opmApplyMessageBand(self, pageName);
					}, undefined, function() {
						if(self.get('isDestroying') || self.get('isDestroyed') || self.get('_opmMessageBandRequestToken') !== messageBandRequestToken || self.get('_opmMessageBandRequestSignature') !== messageBandRequestSignature) {
							return;
						}
						_opmHideMessageBand(self, pageName);
					});
				}
				else
				{
					_opmApplyMessageBand(this, pageName);
				}
			}else{
				_opmHideMessageBand(this, pageName);
			}
		}else{
			_opmHideMessageBand(this, this.get('pageName'));
		}
	},
	actions:{
		closeMessage:function(msgId,msgDiv)
		{
			var pageName = this.get('pageName'); //No I18N
			opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/closeMsgForUser?',{pageName:pageName,msgId:msgId});//No I18N
			$('.topNews ul > li[data-id="'+msgId+'"]').remove();
			if(msgDiv==="alertCloseMsg"){
				if($('.topNews ul > li').length===0){
					if(msgContent.INFO!==undefined && msgContent.INFO.length>0){
						this.set("infoMsg",msgContent.INFO);//No I18N
						if(msgContent.INFO.length===1){
				 			$('#'+this.elementId+' .nxtprev').hide();
				 		}
						messageInfoEvents(this,pageName);
					}else{
						_opmHideMessageBand(this, pageName);
					}
				}
			}
			else if(msgDiv==="infoCloseMsg"){
				if($('.topNews ul > li').length===0){
					_opmHideMessageBand(this, pageName);
				}
			}
		}
	},
	rerenderMsgDialog: function(){
		if(this.get('pageDetails.pageName')!==undefined){
			this.rerender();
		}
  	}.observes('pageDetails'),//No I18N
	willDestroyElement: function(){
					this.set('_opmMessageBandRequestToken', (this.get('_opmMessageBandRequestToken') || 0) + 1); //No I18N
					this.set('_opmMessageBandRequestSignature', ''); //No I18N
		_opmHideMessageBand(this, this.get('pageName'));
		closeMessageInfoDetails();
		$('#'+this.elementId).find('*').remove();//No I18N	
	}
});
function closeMessageInfoDetails()
{
	OpmMsgInfoDetails=[];
	OPMClient.ApplicationController.set("msgInfoDetails",{});//No I18N
	if($("html").hasClass("MessageViewBoxOpen")){
		$("html").removeClass("MessageViewBoxOpen secondLevelNavActive");//No I18N
	}
}
function closeMessageInfoDetailsOPUSnapshot(){
	if(OPMClient.InventoryDeviceDetailsController.opuNewSnapshot){
		$(".oputilsSnapshot ").removeClass("IPAMmsgShow");//No I18N
	}
}
function messageInfoEvents(self,pageName)
{
	$(".topNews .sliderArea .sliderBox").scrollLeft(0);
	setTimeout(function(){
		var totlMsLength = $(".topNews .sliderArea ul li").length;
		var msgWidth = ($(".topNews").width()-320);//No I18N
		var totalWidth = (totlMsLength * msgWidth)+'px';//No I18N
		self.set('msgWidth','width:'+msgWidth+'px');//No I18N
		$(".topNews .sliderArea ul").css('width',totalWidth);
		$(".nextBtn").on("click",function(){
			var liWidth = $(".topNews .sliderArea li").outerWidth();
			$(".topNews .sliderArea .sliderBox").animate({scrollLeft:'+='+liWidth},1000,function(){
				var scrollPosition = $(".sliderBox").scrollLeft();
				var liLength = $(".topNews .sliderArea li").length - 1;
				if(scrollPosition > 0){
					$(".prevBtn").removeClass("disable")
				}
				if(Math.round(scrollPosition) == Math.round(liLength*liWidth)){
					$(".nextBtn").addClass("disable")
				}
			});
		});
		$(".prevBtn").on("click",function(){
			var liWidth = $(".topNews .sliderArea li").outerWidth();
			$(".topNews .sliderArea .sliderBox").animate({scrollLeft:'-='+liWidth},1000,function(){
				var scrollPosition = $(".sliderBox").scrollLeft();
				var liLength = $(".topNews .sliderArea li").length - 1;
				if(scrollPosition == 0){
					$(".prevBtn").addClass("disable");
				}
				if(scrollPosition < (liLength*liWidth)){
					$(".nextBtn").removeClass("disable");
				};
			});
		});
		$(".topNews .sliderArea li .cont").each(function(){
			var moreInfoHeight = $(this).height();
			if(moreInfoHeight > 37){
			  	$(this).addClass("moreInfo"); 
				$(".moreInfo").each(function(){
					var lightHeight = $(this).height();
					if(pageName != 'FWA_ADDDEV' && pageName != 'FWA_OVERVIEW_SEARCH'){
					if(lightHeight > 37){
					   $(this).addClass("lineHeight");
					}	
					}
				});
			}
		});
	},100);
}

OPMClient.OpmNoteMessageComponent = Ember.Component.extend({
	templateName: "components/opm-note-message",//No I18N
	classNames:["noteMsg"],//No I18N
	didInsertElement: function(){
		var self = this;
		if(window.OPM.isMSPCentral) {
			var pageName = self.get('pageName');
			pageName ? this.send('getAllocation'): '';//No I18n
		}

		var learnMoreLink = (this.learnMoreLink !== undefined && this.learnMoreLink !== "" && opm_isValidUrl(this.learnMoreLink) !== true) ? Ember.I18n.t(this.learnMoreLink, this) : this.learnMoreLink;
		if (learnMoreLink) {
			var campaign = getCampaign();
			if (learnMoreLink.indexOf('utm_source=inproduct') <= -1) {
				learnMoreLink += learnMoreLink.indexOf('?') <= -1 ? '?utm_source=inproduct&utm_campaign='+campaign : '&utm_source=inproduct&utm_campaign='+campaign;
			}
			this.set('learnMoreLink',learnMoreLink); //No I18N
		} 
	},
	actions: {
		getAllocation : function() {
			var self = this;
			var pageName = self.get('pageName');
			self.set('controller.danger',undefined);//No I18N
			self.set('controller.default',undefined);//No I18N
			self.set('controller.displayName',undefined);//No I18N
			OPMClient.ApplicationController.set('isMspAllocationEnabled',undefined);//No I18N
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getElementAllocation?customerID='+window.OPM.selCustomerID+'&element='+pageName);//No I18N
			if(response) {
				var details = []
				$.each(response, function(key , val){
					if(key !== "isAllocationEnabled") {
						details.push(val);
					}
				});	
				if(pageName == "WLC" || pageName == "Storage") {
					details.reverse();
				}
				(details.length && details[0].addedCount > details[0].allocatedCount) ? (self.set('controller.danger',true),self.set('controller.displayName',details[0].displayName)) : self.set('controller.default',true);	//No I18N	
				OPMClient.ApplicationController.set('isMspAllocationEnabled',response.isAllocationEnabled);//No I18N
				this.set('model',details);//No I18N
				Ember.run.schedule('afterRender',function() {//No I18n
					$('#editAllocationSlide').click(function() {
						editMspCustomerAllocation(self,"getAllocation");
					});
				});
			}
		}
	},
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmHollowPieComponent = Ember.Component.extend({
	templateName: "components/opm-dash-hollowpie", //NO I18N
	didInsertElement: function()
	{
		var widgetParams = this.widgetParams;
		var jsonData = widgetParams.apiData;
		$("#widget"+widgetParams.id).css('z-index','9');//No I18N
		var lastCnt = 0;
		var chartArr = [];
		$.each(jsonData.WidgetData,function(i,value)
		{
			lastCnt = (fluidicv2[lastCnt]!==undefined)?lastCnt:0;
			value.style = 'background:'+fluidicv2[lastCnt];//No I18N
			lastCnt++;
			chartArr.pushObject(value);
		});
		var chartParams = {};
		chartParams.id = 'MainSeverityChart-widget_'+widgetParams.id;//No I18N
		chartParams.data = jsonData.WidgetData;
		chartParams.chartArr = chartArr;
		this.set('chartParams',chartParams);//No I18N
	},
	willDestroyElement: function(){
 		$('#'+this.elementId).find('*').remove();
 	}
});
OPMClient.OpmQuickLinksComponent = Ember.Component.extend({
	templateName: "components/opm-help-card",//No I18N
	didInsertElement: function(){
		$("#quicklinks").remove();
		var self = this;
		helpCardEvents();
		var pageName = this.widgetData.quickLinksPageName;
		if(pageName==null){
			if(OPMClient.InventoryDeviceDetailsController.pageName=="SPM"){
				pageName="OpUtilsSPM";//No I18N
			}else if(OPMClient.InventoryDeviceDetailsController.pageName=="IPAM"){//No I18N
				pageName="OpUtilsIPAM";//No I18N
			}
		}
		if(pageName==="OpUtilsSPM"||pageName==="OpUtilsIPAM"||OPMClient.ApplicationController.isOPUtils){//No I18N
			this.set('showRoadMap',true);//No I18N
		}
		OPMClient.ApplicationController.helpCardPageName=pageName;
		$("#quicklinks").hide();
		OpmHelpCardDetails = (this.get('widgetData.apiData'));//NO I18N
		if(OpmHelpCardDetails[pageName]!==undefined)
		{
		 	this.set("response",OpmHelpCardDetails[pageName].PageData);	
			if(OpmHelpCardDetails[pageName].PageStatus){
				showHelpCardEvents();
			}
			if(OpmHelpCardDetails[pageName].PageData.length===0){
				$('#'+this.elementId).hide();
			}
		}
		else
		{
			$('#'+this.elementId).hide();
		}
		this.set('widgetData.sizey',9);//NO I18N
		if(OPMClient.InventoryDeviceDetailsController.subFilterType==="Switches"){
			this.set('widgetData.sizey',15);//NO I18N
		}
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//NO I18N
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//NO I18N	
	},
	actions:{
		openHelpMorePage:function(linkName,showRoadMap){
			var linkToRedrect="";
			if(showRoadMap!==undefined && showRoadMap){
				if(linkName==="RoadMap"){//No I18N
					linkToRedrect="https://www.manageengine.com/products/oputils/roadmap.html?utm_source=inproduct&utm_campaign="+getCampaign();//No I18N
				}else if(linkName==="MoreFeatures"){//No I18N
					linkToRedrect="https://www.manageengine.com/products/oputils/roadmap.html?share-new-idea&utm_source=inproduct&utm_campaign="+getCampaign();//No I18N
				}
				if(linkToRedrect!==""){//No I18N
					window.open(linkToRedrect,"_blank");//No I18N
				}
			}
		}
	},
	willDestroyElement: function(){
		if(!this.get('tabSwitch')){OpmHelpCardDetails = [];}
		$('.settingsPageHelpContent').off('click','li');
		$('.settingsPageHelpBtn').off('click');
		$('.opmTabCont').off('click','.opmSettingsAccr > h4');
		$('#'+this.elementId).find('*').remove();
		this.widgetData.quickLinksPageName=null;
		$("#quicklinks").show();
		OPMClient.ApplicationController.helpCardPageName='';
	}
});
OPMClient.CustomGridComponent = Ember.Component.extend({
	attributeBindings:['style'],//No I18N
	style:"height:auto;", //No I18N
	didInsertElement: function(){
		var gridParams = this.get('gridParams');
		if(Object.keys(gridParams).length === 0){
			$('#'+this.elementId).hide();
		}else{
			$('#'+this.elementId+' .staticTable').addClass("staticTable--col"+gridParams.colNamesList.length);//No I18N
		}
	},
	gridParamsObserver:function(){
		this.rerender();
	}.observes('gridParams'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.CommunityDisscussionsComponent = Ember.Component.extend({
	templateName: "components/community-disscussions",//No I18N
	didInsertElement : function(){
		var self = this;
		self.set('internetStatus',true); //No I18n
		$('.spinner-loader').show();
		$.getJSON(window.OPM.apiUrlPattern+"/admin/getRecentUserCommunityDiscussions",function(communityPosts){
			if(window.OPM.currentView.name == "SupportRevamp.index") {
				$('.spinner-loader').hide();					
				self.set('internetStatus',communityPosts.status); //No I18n
				self.set('communityPosts',communityPosts.status !== false ? communityPosts.userDiscussions : ''); //No I18N
			}
		}); //No I18N		
	},
	willDestroyElement:function(){
		this.set('internetStatus',true); //No I18n
		this.set('communityPosts',''); //No I18N
	}
});

OPMClient.UpgradeDetailsComponent = Ember.Component.extend({
	templateName: "components/upgrade-details",//No I18N
	didInsertElement : function(){
		var upgradeDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getInstalledPatchDetails"); //No I18n
		if(upgradeDetails!==undefined){
            var colNames =
            [
                Ember.I18n.t('webclient.about.BuildNumber',this), //No I18N
                Ember.I18n.t('webclient.devices.details.date',this), //No I18N
                ""
            ];            

            var colModel =
            [
                { name: 'BuildNumber', index:'BuildNumber' ,width: 40}, //No I18N
                { name: 'AppliedDate', index:'AppliedDate'}, //No I18N
                { name: 'id', index: 'id',sortable:false,hidden:true} //No I18N
            ];
            var defaultOptions = {"multiselect":false,"rowNumNeeded":false, "sortName":"uName","sortOrder":"asc"}; //No I18N
            opm_loadJQgridWithData("#upgradeDetailsList", upgradeDetails, colNames, colModel, "", "#upgradeDetailsPager", "upgradeDetailsList", defaultOptions); //No I18N
            $('#upgradeDetailsList').jqGrid('setGridWidth', $("#upgradeContent").width());
        }
		this.set('upgradeDetails',upgradeDetails) // No I18n
		this.set('noDetails',upgradeDetails.length === 0); //No I18n
	}
});

OPMClient.FwaPacketCountDetailsComponent = Ember.Component.extend({
	templateName: "components/Fwa-Packet-Count-Details",//No I18N
	didInsertElement : function(){
		OPMClient.Settings.FWLoadPacketCount();
		$("#packetCountContent").addClass("dataStatus");
	}
});

OPMClient.DeviceMonitorsTestComponent = Ember.Component.extend({
	templateName: "components/Device-Monitors-Test", // No I18N
	didInsertElement: function () {
		var self = this;
		var obj = this.get('monitorObj');
		$('#deviceTestMonHeader').text(obj.monitorName);
		setTimeout(function () {
			var url = window.OPM.apiUrlPattern + '/device/TestMonitor';//No I18N
			var data = { 'name': decodeURIComponent(obj.deviceIP), 'policyName': decodeURIComponent(obj.policyName), 'graphName': decodeURIComponent(obj.policyName) }; //No I18n
			if (OPMClient.InventoryDeviceDetailsController.monitorsName === "mssqlMonitors") {
				url = window.OPM.apiUrlPattern + '/device/TestMonitor';//No I18N
				data = { 'name': decodeURIComponent(obj.deviceIP), 'policyName': decodeURIComponent(obj.policyName), 'graphName': decodeURIComponent(obj.policyName), 'instanceName': $('#instanceList').val() } //No I18n
			}
			if (obj.instanceName != undefined && obj.instanceName != "") {
				url += '&instanceName=' + obj.instanceName; //No I18n
			}
			var response = opm_ajaxPostMethod(url, data);
			var dataStr = []; //No I18N
			if (response.data !== undefined) {
				$.each(response.data, function (i, val) {
					if (typeof val === "object" && Object.keys(val).length > 0) {
						$.each(val, function (instance, value) {
							dataStr.push({ 'instance': instance, 'value': value }); //No I18N
						});
					} else {
						dataStr.push({ 'instance': response.displayName, 'value': val }); //No I18N
					}
				});
			}
			$('#testMonitorStatusText').hide(); //No I18N
			$('#insGrid').show();//No I18N

			var colName = [Ember.I18n.t('webclient.devices.details.instance', this), Ember.I18n.t('webclient.widget.value', this)];//No I18N
			var colModel = [
				{ name: 'instance', index: 'instance' }, //No I18N
				{ name: 'value', index: 'value' } //No I18N
			]; //No I18N

			opm_loadJQgridWithData("#insGrid", dataStr, colName, colModel, "", "", "", ""); //No I18N

			if (response.reasons != undefined && response.reasons.length !== 0) {
				$("#insGrid").text(response.errormsg).css('color', 'red'); //No I18n
				$("#TestMonitorFailReason").show();
				self.set('failureReasons', response.reasons); //No I18N
			}
			else {
				$("#TestMonitorFailReason").empty();
				$("#TestMonitorFailReason").hide();
			}
		}, 300);
	}
});

OPMClient.DevicePingComponent = Ember.Component.extend({
	templateName: "components/Device-Ping", // No I18N
	didInsertElement: function () {
		var self = this;
		var deviceName = this.get('deviceName');
		var url = window.OPM.apiUrlPattern + '/device/getPingResponse?'; //No I18n
		$.ajax({
			url: url,
			data:{deviceName:deviceName},
			type: 'POST', //No I18N
			dataType:'json', //No I18n
			async: true,
			beforeSend: function(){
				self.set("pingStatusText", false); //No I18n
			},
			success: function(data) {
				if(data.PingResponse) {
					content = (escapeHTML(data.PingResponse.Details)).replace(/\n/g, '<br />'); //No I18N
				}
				self.set("pingStatusText", content); //No I18n
			}
		});
	}
});
OPMClient.TwoFactorAuthenticationComponent = Ember.Component.extend({
	templateName: "components/two-factor-authentication", // No I18N
	didInsertElement: function () {
		var self = this;
		var response = OPMClient.SettingsAddEditController.TFADetails;
		if(response == undefined) {
			response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getTFAConfig'); // No I18N
			OPMClient.SettingsAddEditController.set('TFADetails',response);//No I18n
			if(!response.enabled) {
				response.cookieValidity = 0;
			}
		}
		self.set('controller.showEmailInfo', false); //No I18n	
		self.set('controller.showAuthInfo',true);// No I18N
		self.set('controller.configureEmail',false);// No I18N
		self.set('controller.model',response);//No I18n
		$('input[name="tfaType"]').off().on('change', function() {
			var val = $('input[name="tfaType"]:checked').val();
			self.set('controller.disableSave', true); //No I18n
			self.set('controller.enterotp',false); // No I18N
			self.set('otpErrorMessage','');//No I18n
			self.set('lockedTimeout','');//No I18n
			self.set('resendOtpTimer','');//No I18n
			self.set('controller.sendotp',false); // No I18N
			self.set('controller.incorrectemail',false); // No I18N
			self.set('controller.showAuthInfo',false);// No I18N
			OPMClient.SettingsAddEditController.set('TFADetails.showMailNotConfigured',false);// No I18N
			self.set('controller.hideSendOtp',false); // No I18N
			if(val === 'EMAIL') {
				self.set('controller.showEmailInfo', true); //No I18n
					var mailconfigured = isMailServerConfigured();
					OPMClient.SettingsAddEditController.set('TFADetails.showMailNotConfigured',!mailconfigured);// No I18N
					self.set('controller.showEmailInfo',mailconfigured); //No I18n	
				if(response.tfaType == "EMAIL"){
					self.set('controller.hideSendOtp',true); // No I18N
					self.set('controller.showCookieValidity',true);//No I18N
					self.set('controller.disableSave', false); //No I18n
				}
				if(!self.get('controller.successOtp')) {
					!response.isEmailIdConfigured ? self.set('controller.configureEmail',true) : self.set('controller.sendotp',true);// No I18N
				} else {
					self.set('controller.disableSave', false); //No I18n
				}
			}
			else {
				self.set('controller.noteMsg', Ember.I18n.t('twofactorauth.apps.notemsg')); //No I18n
				self.set('controller.showEmailInfo', false); //No I18n
				self.set('controller.disableSave', false); //No I18n
				self.set('controller.showAuthInfo',true);// No I18N
				if(response.tfaType == "EMAIL"){
					self.set('controller.successOtp',false);//No I18N
					self.set('controller.sendotp',true);//No I18N
					self.set('controller.showCookieValidity',false);//No I18N
				}
			}
		});
	},
	actions: {
		redirectMail: function() {
			var self = this;
			opm_transitionToTheRoute("Settings.Basic.Mail");//No I18N	
		},
		sendOTP: function(isEmailConfigure) {
			var self = this;
			var data = {}
			if(isEmailConfigure) {
				var fieldsToValidate = {'empty':['emailId'],'emailValidation':['emailId']}; // No I18N
				var isValid = opm_validateFields(fieldsToValidate);
				if(isValid) {	
					data.emailId = $('#emailId').val(); // No I18N
					self.set('controller.emailid',data.emailId);// No I18N
				} else {
					return;
				}
			}
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/tfaEmailValidation?operation=sendOTP',data); // No I18N
			if(response.error != undefined) {
				if(response.error.lockedTimeout) {
					var lockedTimeout = response.error.lockedTimeout;
					self.set("resendOtpTimer", ""); //No I18n
					self.set('lockedTimeout',true);//No I18n
					var timeOut = setInterval(function() {
						if(!OPMClient.SettingsAddEditController.TFADetails || !(self.get('controller.sendotp') || self.get('controller.configureEmail'))) {
							clearInterval(timeOut);
							return;
						}
						self.set('otpErrorMessage', Ember.I18n.t('webclient.usermgmt.tfa.otp.invalid.multipletries',{param0: --lockedTimeout})); //No I18n
						if(lockedTimeout < 1) {
							clearInterval(timeOut);
							self.set('otpErrorMessage','');//No I18n
							self.set('lockedTimeout',false);//No I18n
						}
					}, 1000);
				} else {
					opm_infoMsgs("errorMsg",response.error.message,'',true,3);// No I18N
				}
			} else if(response.isOTPSent) {
				self.set('controller.maskedEmail',response.maskedEmail); // No I18N
				self.set('controller.enterotp',true); // No I18N
				self.set('controller.sendotp',false); // No I18N
				self.set('controller.configureEmail',false);// No I18N
			} else {
				opm_infoMsgs("infoMsg", Ember.I18n.t('twofactorauth.email.error')+" "+'<a id="redirectMail">'+Ember.I18n.t('twofactorauth.redirectMail')+'</a>'); //No I18N
				$('#redirectMail').click(function() {
					self.send('redirectMail');// No I18N
				});
			}
			Ember.run.schedule('afterRender', function() { //No I18n
			//OTP INPUT BOX EVENT HANDLERS
			$("#otpVal").prop("maxLength","6");
				$('#otpVal').on('keypress', function(e){
						var regex = new RegExp("^[0-9]+$");
						var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
						if (!regex.test(key)) {
							e.preventDefault();
							return false;
						}
				});
			});
		},
		resendOTP: function() {
				var data = {}
				var self = this;
				data.emailId = self.get('controller.emailid'); // No I18N
				var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/tfaEmailValidation?operation=sendOTP', data); // No I18N
				if(response.error == undefined) {
					$('#otpVal').val('');
					self.set('otpErrorMessage','');//No I18n
					//Next RESEND OTP only After 1 min
					var timer = 60;
					var timeOut = setInterval(function() {
						if(!OPMClient.SettingsAddEditController.TFADetails || !self.get('controller.enterotp') || self.get('lockedTimeout')) {
							clearInterval(timeOut);
							return;
						}
						self.set("resendOtpTimer", "00:" + (('0' + (--timer)).slice(-2))); //No I18n
						if(timer < 1) {
							self.set("resendOtpTimer", ""); //No I18n
							clearInterval(timeOut);
						}
					}, 1000);
				} else {
					opm_infoMsgs("errorMsg",response.error.message,'',true,3);// No I18N
				}
		},
		submitOTP: function() {
			var fieldsToValidate = {'empty':['otpVal']};  // No I18N
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid) {
				var data = {};
				data.TFAPassword = $('#otpVal').val();
				var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/tfaEmailValidation?operation=validateOTP',data); // No I18N
				if(response.error == undefined) {
					if(!response.isOTPValidated) {
						this.set('otpErrorMessage', Ember.I18n.t('twofactorauth.invalidOtp')); //No I18n
					} else {
						this.set('controller.successOtp',true); // No I18N
						this.set('controller.showCookieValidity',true);//No I18N
						this.set('controller.enterotp',false); // No I18N
						this.set('controller.disableSave', false); //No I18n
					}
				} else {
					//Multiple OTP Account Lockout Case
					if(response.error.lockedTimeout) {
						var self = this;
						var lockedTimeout = response.error.lockedTimeout;
						self.set("resendOtpTimer", ""); //No I18n
						self.set('lockedTimeout',true);//No I18n
						var timeOut = setInterval(function() {
							if(!OPMClient.SettingsAddEditController.TFADetails || !self.get('controller.enterotp')) {
								clearInterval(timeOut);
								return;
							}
							self.set('otpErrorMessage', Ember.I18n.t('webclient.usermgmt.tfa.otp.invalid.multipletries',{param0: --lockedTimeout})); //No I18n
							if(lockedTimeout < 1) {
								clearInterval(timeOut);
								self.set('otpErrorMessage','');//No I18n
								self.set('lockedTimeout',false);//No I18n
							}
						}, 1000);
					} else {
						this.set('otpErrorMessage', Ember.I18n.t('twofactorauth.invalidOtp')); //No I18n
					}
				}
			}
		},
		configureTFA: function() {
			var model = this.get('model');
			var response;
			if(!model.enabled) {
				response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/disableTFA'); //No I18n
				OPMClient.SettingsAddEditController.set("TFADetails.tfaType", undefined);//No I18n
				OPMClient.SettingsAddEditController.set("TFADetails.cookieValidity", undefined);//No I18n
				OPMClient.ApplicationController.set('isTFAEnabled',false);//No I18n
				showMessage(response);
				if(OPMClient.ApplicationController.fromSecRecPage){
					opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
				} else {
					setSecurityScore();
				}
				return;
			}
			var fieldsToValidate = {'empty':['cookieValidity'], 'rangeCheck':{'cookieValidity': 30},'minRangeCheck':{'cookieValidity': 0}};//No I18N
			if(!opm_validateFields(fieldsToValidate)) {
				return;
			}
			var data = {
				cookieValidity: $('#cookieValidity').val(),
				tfaType: $('input[name="tfaType"]:checked').val()
			}
			response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/configureTFA', data); //No I18n
			if(response.error === undefined) {
				OPMClient.SettingsAddEditController.set("TFADetails.tfaType", data.tfaType);//No I18n
				OPMClient.SettingsAddEditController.set("TFADetails.cookieValidity", data.cookieValidity);//No I18n
				OPMClient.ApplicationController.set('isTFAEnabled',true);//No I18n
				opm_infoMsgs("successMsg",response.result.message);// No I18N
				if(OPMClient.ApplicationController.fromSecRecPage){
					opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
				} else {
					setSecurityScore();
				}
			} else {
				opm_infoMsgs("errorMsg",response.error.message);// No I18N
			}
			if(window.OPM.isNCM) {
				setNCMSubHeaderHeight();
			}
			if(OPMClient.ApplicationController.currentPath === 'Settings.Basic.LicenseMgmt') {
				var currentUrl = window.location.hash;
				opmGlobalRoute.transitionTo('Loading'); //No I18N
				setTimeout(function() {
					location.href = currentUrl;
				}, 100)
			}
		}
 	},
 	willDestroyElement: function(){
		OPMClient.SettingsAddEditController.set("TFADetails", null); //No I18n
		OPMClient.ApplicationController.set("fromSecRecPage", undefined); //No I18N
	}
});

OPMClient.MandateSettingsComponent = Ember.Component.extend({
	templateName: "components/Mandate-Settings", // No I18N
	didInsertElement: function () {
		var productName = getProductNameForVisitorInfo();
		productName = !window.OPM.isOPMPLUS && window.OPM.isOPM ? "OpManager" : productName; //No I18n
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/GetMailServerSettings'); //No I18n
		OPMClient.SettingsAddEditController.set('isMailServerConfigured', response.primary ? true : false); //No I18n
		var self = this;
		self.set('content', response);//No I18N
		var steps = [
			{id: "mandate_changepassword", title:Ember.I18n.t('webclient.common.preferences.changepassword',this), description:Ember.I18n.t("webclient.password.change",{"productName":window.OPM.rebrandObj.productName}), iconBox: 'changePWDIcon',statusClass:OPMClient.ApplicationController.defaultPasswordChange?'securityStatus__configured':'securityStatus__notConfigured', configStatus :OPMClient.ApplicationController.defaultPasswordChange?Ember.I18n.t('webclient.map.interfaces.changed',this):Ember.I18n.t('webclient.changepassword.not.change',this),configSuccessStatus:Ember.I18n.t('webclient.map.interfaces.changed',this),isActive:!OPMClient.ApplicationController.defaultPasswordChange?true:false,isClickable : true, isHide:OPMClient.ApplicationController.defaultPasswordChange} //No I18n
		]
		steps.forEach(function(item,index) {
			if(steps.isHide) {
				steps.splice(index,1);
			}
		});
		getSetPwdPolicyDetails();
		self.set('controller.ConfigurationSteps', steps); //No I18n		
		self.set('controller.param',this);//No I18N
		OPMClient.ApplicationController.set("EvalUser",window.OPM.isEvalUser);//No I18N
		$('html.horizontalView #header,html.horizontalView #nav,html #opmAlertInfoSec .opmziabot').addClass('noPointerEvents');// No I18N
		$("html.horizontalView #header .licensePopup,html.horizontalView #header .opmAdvancedSettingsContainer").addClass('allPointerEvents');// No I18N
		$('#mailNewPass').focus(function () {
			$('#mandate_changepasswordContent .passwordHelpInfo').addClass('active');
		});
		$('#mailNewPass').keypress(function () {
			$('#mandate_changepasswordContent .passwordHelpInfo').addClass('active');
		});
		var userDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getUserDetails?userId='+window.OPM.userId); //No I18N
		this.set('controller.adminEmailId',userDetails.contactDetailsProps.eId);//No I18N	
		Ember.run.schedule('afterRender', function() { //No I18n
			$('.changePwdStepsMain').on('click','.verifiedTab',function() {
				var previousid = $(this).prev().length == 0 ? '' : $(this).prev()[0].id;
				if($(this).hasClass('clickable') && !$(this).hasClass('current')) {
					self.send('mandatoryStepChange',previousid,this.id);// No I18N
				}
			});
			steps.forEach(function(item,index){
				if(item.isActive && index != 0) {
					self.send('mandatoryStepChange',steps[index-1].id,item.id);// No I18N
				}
			});
		});
	},
	actions:{
		mailConfigUpdatePassword:function()
		{
			var userName = window.OPM.userName;
			var fieldsToValidate = {'empty':['mailNewPass','mailConfirmPass','mailEmail'],'emailValidation':['mailEmail'],'matchPassword':{'mailNewPass':'mailConfirmPass'},'lengthCheck':{ "mailNewPass": 4}, 'isValidPwdCheck': {'newPassword':'mailNewPass', 'userName': userName, pwdMinLen: OPMClient.SettingsUsersController.minLength , pwdMaxLen: OPMClient.SettingsUsersController.maxLength, complexPwd: true}};//No I18N
            if(window.OPM.showCurrentPasswordField) {
				fieldsToValidate.empty.push('mailCurrentPass');
			}
			var isValid = opm_validateFields(fieldsToValidate);
            $(".OpMAlertMsg").remove();
            if(isValid){
			    var oldPassword = $("#mailCurrentPass").val();//No I18N
			    var newPassword = $("#mailNewPass").val();//No I18N
			    var emailID=$("#mailEmail").val();//NO I18N
            	var formData = {"userName":userName,"emailId":emailID}; //No I18N
			    var response=opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/admin/updateContactDetails",formData);//No I18N
	            if(response !== undefined){
	                if(response.result !== undefined){
						var pwdData = {};
						pwdData.oldPassword = window.OPM.showCurrentPasswordField ?  oldPassword : "admin" ;// No I18N
						pwdData.newPassword = newPassword;
						var responseForUpdate = opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/admin/changePassword?userName="+encodeURIComponent(userName),pwdData); //No I18N	                    
	                    if(responseForUpdate.result !== undefined){
	                    	OPMClient.ApplicationController.set("defaultPasswordChange",true);// No I18N
	                    	if(OPMClient.ApplicationController.isTFAEnabled) {
	                    		this.send('mailConfigpasswordUpdateSuccess');// No I18N
							} else {
								var config = this.get('controller.ConfigurationSteps');
								config = config.map(function(obj) {
									return obj.id == "mandate_changepassword" ? ($.extend({}, obj, {nonEditable:true,isClickable:false})) : obj;
								});
								this.set('controller.ConfigurationSteps',config);// No I18N
								this.send('moveToNextStep');// No I18N
	                    	}
				}else if(responseForUpdate.error !== undefined){
					 opm_infoMsgs("errorMsg",responseForUpdate.error.message);//No I18N
				     }
	                  
	                }else if(response.error !== undefined){
	                    opm_infoMsgs("errorMsg",response.error.message);//No I18N
	                }
	           }


            	
		    }		      
		},
		mailConfigpasswordUpdateSuccess:function(value){
			OPMClient.ApplicationController.set("defaultPasswordChange",true);// No I18N
			this.send('moveToNextStep',true);// No I18N
			if(window.OPM.isNCM) {
				setNCMSubHeaderHeight();
			}
			if(OPMClient.ApplicationController.currentPath === 'Settings.Basic.LicenseMgmt') {
				var currentUrl = window.location.hash;
				opmGlobalRoute.transitionTo('Loading'); //No I18N
				setTimeout(function() {
					location.href = currentUrl;
				}, 100)
			}
		},
		moveToNextStep : function (skipped) {
			var self = this;
			var config = self.get('controller.ConfigurationSteps');
			var stepEnd = true;
			config.forEach(function(item,index){
				if(item.isActive) {
					for(var i=index+1;i<config.length;i++) {
						if(!config[i].nonEditable && !config[i].isHide) {
							self.send('mandatoryStepChange',item.id,config[i].id,skipped);
							stepEnd = false;
							break;
						}
					}
				}
			});
			if(stepEnd) {
				OPMClient.ApplicationController.set('hideMandatoryDetails', true);//No I18n
				if(OPMClient.ApplicationController.showGettingStartedAfterPassword) {
					showGettingStarted();
				}
				if(window.OPM.isNCM) {
					setNCMSubHeaderHeight();
				}
				if(OPMClient.ApplicationController.showNFAProbeKeyAfterPassword) {
					var collDetails = updateCollector();
					if(collDetails.length===0 && window.OPM.userPermissions.generalSettingsWrite) {
						nfa_showCollectorKeyInfo();
					}
					CheckCollectorAvailable();
					setCombo("");
					OPMClient.ApplicationController.set("showNFAProbeKeyAfterPassword", false); //No I18N
				}
				showCustomDialogPopup(JSON.parse(JSON.stringify(customDialogList)));
			} 
		},
		mandatoryStepChange : function(prevStep,nextStep,skipped) {
			var config = this.get('controller.ConfigurationSteps');
			$('.mandateSteps').hide();
			config = config.map(function(obj) {
			   obj.isActive = false;
			   return obj.id == (prevStep) && !skipped ? ( delete obj.statusClass , $.extend({}, obj, {statusClass:'securityStatus__configured',configStatus:obj.configSuccessStatus})) : obj.id == (nextStep) && !obj.nonEditable ? skipped ? $.extend({}, obj, {isActive:true}) : $.extend({}, obj, {isActive:true,isClickable:true}) : obj;
			});
		   	$('#'+nextStep+'Content').show();
		    this.set('controller.ConfigurationSteps',config);// No I18N
		}
	},
	keyUp: function (e) {
		if ($('#mailNewPass').is(':focus')) {
			var password = $("#mailNewPass").val();
		    var userName = window.OPM.userName;
			var result = isValidPwd(password, userName,OPMClient.SettingsUsersController.minLength,OPMClient.SettingsUsersController.maxLength,true);
			if(password === userName ||  password===""){
			 		result.usrPwdEql=true;
			 }
			passwordCheck('#mandate_changepasswordContent', result); //No I18N
			if(result.emptyCheck===true && result.usrPwdEql===false && result.minLen==true && result.specialChar==true && result.upperChar==true && result.lowerChar==true){

			$('#mandate_changepasswordContent .passwordHelpInfo').removeClass('active');
		
			}
			
		} 
	},
	willDestroyElement: function(){
		//Added classes removed to prevent impact on other css.
		$("html.horizontalView #header,html.horizontalView #nav,html #opmAlertInfoSec .opmziabot").removeClass('noPointerEvents');// No I18N
		$("html.horizontalView #header .licensePopup,html.horizontalView #header .opmAdvancedSettingsContainer").removeClass('allPointerEvents');// No I18N
	}
});

OPMClient.ProductPromotionsComponent = Ember.Component.extend({
	templateName:"components/product-promotions",//No I18N
	classNames:['menuDropDown'],//No I18N
	didInsertElement: function() {
		var self = this;
		Ember.run.schedule("afterRender", function() {//No I18N
			$('.card-container').hover(function() {
				$(this).addClass('shadow');
			},
			function() {
				$(this).removeClass('shadow');
			});
		});
		var topRecommend = [
			{icon:"/apiclient/fluidicv2/img/products_logo/NetworkConfigurationManager.svg", alt:"ncm" ,title : "Network Configuration Manager", desc : Ember.I18n.t("webclient.productpromotions.NetworkConfigurationManager",this), redirectLink:"https://www.manageengine.com/network-configuration-manager/", isHide:window.OPM.isNCM || window.OPM.isOPMPLUS},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/NetflowAnalyzer.svg", alt:"nfa" ,title : "NetFlow Analyzer", desc : Ember.I18n.t("webclient.productpromotions.NetFlowAnalyzer",this), redirectLink:"https://www.manageengine.com/products/netflow/", isHide:window.OPM.isNFA || window.OPM.isOPMPLUS},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/FirewallAnalyzer.svg", alt:"fwa" ,title : "Firewall Analyzer", desc : Ember.I18n.t("webclient.productpromotions.FirewallAnalyzer",this), redirectLink:"https://www.manageengine.com/products/firewall/", isHide:window.OPM.isFWA || window.OPM.isOPMPLUS},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/Oputils.svg", alt:"oputils" ,title : "OpUtils", desc : Ember.I18n.t("webclient.productpromotions.OpUtils", this), redirectLink:"https://www.manageengine.com/products/oputils/", isHide:window.OPM.isOPUtils || window.OPM.isOPMPLUS},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/ApplicationManager.svg", alt:"apm" ,title : "Applications Manager", desc : Ember.I18n.t("webclient.productpromotions.ApplicationsManager", this), redirectLink:"https://www.manageengine.com/products/applications_manager/", isHide:window.OPM.isOPMPLUS}//No I18N
		]
		var relatedOfferings = {
			title: Ember.I18n.t("webclient.productpromotions.relatedOfferings"),//No I18N
			list : [
			{icon:"/apiclient/fluidicv2/img/products_logo/ec.png", alt:"ec" ,title : "EndPoint Central", desc : Ember.I18n.t("webclient.productpromotions.EndpointCentral", this), redirectLink:"https://www.manageengine.com/products/desktop-central/", isHide:false},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/Vulnerability-Manager-Plus-Icon.png", alt:"vmp" ,title : "Vulnerablity Manager Plus", desc : Ember.I18n.t("webclient.productpromotions.VulnerabilityManagerPlus", this), redirectLink:"https://www.manageengine.com/vulnerability-management/", isHide:false},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/NetworkConfigurationManager.svg", alt:"ncm" ,title : "Network Configuration Manager", desc : Ember.I18n.t("webclient.productpromotions.NetworkConfigurationManager", this), redirectLink:"https://www.manageengine.com/network-configuration-manager/", isHide: !window.OPM.isMSPEdition},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/NetflowAnalyzer.svg", alt:"nfa" ,title : "NetFlow Analyzer", desc : Ember.I18n.t("webclient.productpromotions.NetFlowAnalyzer", this), redirectLink:"https://www.manageengine.com/products/netflow/", isHide: !window.OPM.isMSPEdition},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/FirewallAnalyzer.svg", alt:"fwa" ,title : "Firewall Analyzer", desc : Ember.I18n.t("webclient.productpromotions.FirewallAnalyzer", this), redirectLink:"https://www.manageengine.com/products/firewall/", isHide: !window.OPM.isMSPEdition},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/Oputils.svg", alt:"oputils" ,title : "OpUtils", desc : Ember.I18n.t("webclient.productpromotions.OpUtils", this), redirectLink:"https://www.manageengine.com/products/oputils/", isHide: !window.OPM.isMSPEdition},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/ApplicationManager.svg", alt:"apm" ,title : "Applications Manager", desc : Ember.I18n.t("webclient.productpromotions.ApplicationsManager", this), redirectLink:"https://www.manageengine.com/products/applications_manager/", isHide: !window.OPM.isMSPEdition} //No I18N
		]}
		var MSPProducts = {
			title: Ember.I18n.t("webclient.productpromotions.MSPProducts"),//No I18N
			list: [
			{icon:"/apiclient/fluidicv2/img/products_logo/Opmanager.svg", alt:"msp" ,title : "OpManager MSP", desc : Ember.I18n.t("webclient.productpromotions.OpManagerMSP", this), redirectLink:"https://www.manageengine.com/network-monitoring-msp/", isHide:window.OPM.isMSPEdition && !window.OPM.isRMMEdition},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/ec.png", alt:"ec" ,title : "EndPoint Central MSP", desc : Ember.I18n.t("webclient.productpromotions.EndpointCentralMSP", this), redirectLink:"https://www.manageengine.com/desktop-management-msp/", isHide:false},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/mdm.png", alt:"mdm" ,title : "Mobile Device Manager Plus MSP", desc : Ember.I18n.t("webclient.productpromotions.MobileDeviceManagerPlusMSP", this), redirectLink:"https://www.manageengine.com/mobile-device-management-msp/", isHide:false},//No I18N
			{icon:"/apiclient/fluidicv2/img/products_logo/rmm.svg", alt:"rmm" ,title : "RMM Central", desc : Ember.I18n.t("webclient.productpromotions.RMMCentral", this), redirectLink:"https://www.manageengine.com/remote-monitoring-management/", isHide:window.OPM.isRMMEdition} //No I18N
		]}
		var productArray = {};
		var subProductArray = [];
		if(window.OPM.isMSPEdition) {
			subProductArray.push(MSPProducts);
			subProductArray.push(relatedOfferings);
		} else {
			productArray.topRecommend = topRecommend;	
			subProductArray.push(relatedOfferings);
			subProductArray.push(MSPProducts);
		}
		productArray.subList = subProductArray;
		var bestValue = [];
		var isNotOPMPLUSEE = !(window.OPM.isOPMPlusCentral || window.OPM.isOPMPlusProbe);
		self.set("isNotOPMPLUSEE", isNotOPMPLUSEE);//No I18N
		if(isNotOPMPLUSEE) {
			bestValue = [
				{title : "OpManager Nexus", desc : Ember.I18n.t("webclient.prodprom.opmplus.msg", this),redirectLink:"https://www.manageengine.com/it-operations-management/", isHide:window.OPM.isCentralServer || window.OPM.isProbe|| window.isNFADE || window.OPM.isMSPEdition || window.OPM.isOPMPLUS || window.OPM.isFWADE},//No I18N
				{title : "OpManager Nexus Enterprise Edition", desc : Ember.I18n.t("webclient.productpromotions.opmplusee.desc", this), redirectLink:window.OPM.isOPMPLUS ? "https://www.manageengine.com/it-operations-management/opmanager-plus-enterprise.html" : "https://www.manageengine.com/it-operations-management/", isHide:!(window.OPM.isCentralServer || window.OPM.isProbe|| window.isNFADE || window.OPM.isMSPEdition || window.OPM.isOPMPLUS || window.OPM.isFWADE)}//No I18N
			]
		}
		self.set("productArray", productArray);//No I18N
		self.set("bestValue", bestValue);//No I18N
	},
	actions:{
		showHideMenuDiv:function(){
			if($("#productRecSlide").hasClass('active')){//No I18N
				$("#productRecSlide").removeClass('active');
			}else{
				$("#productRecSlide").addClass('active');
			}
		},
		redirectToProductHomePage:function(url){
			url += "?utm_source=in-product-promo&utm_campaign="+getCampaign();//No I18N
			window.open(url,'_blank');//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.InfoTooltipComponent = Ember.Component.extend({
	templateName: "components/Info-Tooltip",//No I18N
	didInsertElement : function(){
		$(".infoTooltip").css('top', '').css('left', '');
		if(this.url!="" && this.url!=undefined && !($(".jstree-contextmenu").is(':visible')) &&$(".jstree-anchor").hasClass('jstree-hovered') && OPMClient.InventoryOpUtilsController.operation!=="move_node"){
			var url= this.url;
			var details = opm_ajaxGetResponse(url);
			if(details.status==="Success"){
				$(".infoTooltip").css({'left':OPMClient.InventoryOpUtilsController.pageX,'top':OPMClient.InventoryOpUtilsController.pageY});
				var summaryDetails={};
				summaryDetails=details;
				summaryDetails.className="grid-col-6";//No I18N
				summaryDetails.more=false;//No I18N
				if(summaryDetails.info.length==1){
					$(".infoTooltip").removeClass('infoTooltip-lg');//No I18N
					summaryDetails.className="grid-col-12";//No I18N
				}
				if(summaryDetails.info.length==2){
					summaryDetails.className="grid-col-6";//No I18N
				}	
				this.set("summaryDetails",summaryDetails);//No I18N
				$(".infoTooltip").on( "mouseleave", function( event ) {
	                $(".infoTooltip").css({'display':'none'});
	            });
			}else{
				this.set("summaryDetails",[]);//No I18N
				$(".infoTooltip").css({'display':'none'});
			}
		}else{
			$(".infoTooltip").css({'display':'none'});
			this.set("summaryDetails",[]);//No I18N
			OPMClient.ApplicationController.set('infoToolTipUrl',"");//No I18N
		}
		if($(".jstree-contextmenu").is(':visible')){
			$(".infoTooltip").css({'display':'none'});
		}
		if(OPMClient.InventoryOpUtilsController.operation==="move_node"){
			$(".infoTooltip").css({'display':'none'});
			this.set("summaryDetails",[]);//No I18N
		}
		if(OPMClient.InventoryOpUtilsController.operation==="move_node"){
			$(".infoTooltip").css({'display':'none'});
			this.set("summaryDetails",[]);//No I18N
		}
	},
	helpLinkRender: function () {
		if(this.url!=""){
			this.rerender();
		}
	}.observes('url')//No I18N
});
OPMClient.UserDomainScopeComponent = Ember.Component.extend({
	templateName: "components/user-domain-scope",//No I18N
	loadNFAScopeDetails: function() {
		nfa_getModelForUserManagement(this);
	}.observes("OPMClient.SettingsNFAUserMgmtController.groupDetails"), //NO I18N
	didInsertElement: function(){
		//Accordion Event Handler
		var isUserManagement = OPMClient.ApplicationController.currentPath.indexOf('Settings.Basic.Authentication.Domain') < 0;
		if(isUserManagement){
			this.set('isAllMonitor',false);//No I18N
			this.set('isSelectedMonitor',true);//No I18N
		}else{
			$("#apmMonitors").addClass('disabledBlock');
			this.set('isAllMonitor',true);//No I18N
			this.set('isSelectedMonitor',false);//No I18N
		}

		this.set('isUserManagement',isUserManagement);//No I18n
		
		$('#moduleList').off('click.accordionToggle').on('click.accordionToggle', '.accordion1__nav', function(e) { //No I18N
			var isChecked = $(this).find('input[name="chkPlugin"]').is(':checked'); //No I18N
			var isCheckboxClick = $(e.target).is('input[name="chkPlugin"]') || $(e.target).closest('.opmCheckBox').length; //No I18N
			if($(this).hasClass('active') && !isChecked) {
				$(this).removeClass('active');
				$(this).siblings('.accordion1__cont').hide();
			}
			else if($(this).hasClass('active') && isChecked && !isCheckboxClick) {
				$(this).removeClass('active');
				$(this).siblings('.accordion1__cont').hide();
			}
			else if(isChecked){
				$(this).addClass('active');
				$(this).siblings('.accordion1__cont').show();
			}
		});
	},
	actions:
	{
		toggletree:function(isAllMonitor)
		{
			isAllMonitor = !isAllMonitor;
			isAllMonitor ? this.set('isAllMonitor',true) : this.set('isAllMonitor',false);//No I18N
		},
		nfaGroupTabChanged: function(groupType) {
			if (window.OPM.isCentralServer) {
				var selectedIDs = getMultiSelectedDevices(true);
				switch(this.lists.selectedGroupType) {
					case "deviceGroup": this.set("lists.selectedDeviceGroupIDs", selectedIDs); break; //NO I18N
					case "ipGroup": 	this.set("lists.selectedIPGroupIDs", selectedIDs); break; //NO I18N
					case "intfGroup": 	this.set("lists.selectedInterfaceGroupIDs", selectedIDs); break; //NO I18N
					case "apGroup": 	this.set("lists.selectedAPGroupIDs", selectedIDs); break; //NO I18N
				}
			}
			var tabs = jQuery.extend(true, [], this.nfaGroupTypesList);
			this.set("nfaGroupTypesList", nfa_getActiveList(tabs, "value", groupType)); //NO I18N
			this.set("lists.selectedGroupType", groupType); //NO I18N
		},
		nfaScopeTypeChanged: function(scopeType) {
			var scopes = jQuery.extend(true, [], this.nfaScopeTypeList);
			this.set("nfaScopeTypeList", nfa_getCheckedList(scopes, "value", scopeType)); //NO I18N
			this.set("lists.nfaScopeType", scopeType); //NO I18N
		}
	},
	willDestroyElement: function() {
		$('#moduleList').off('click.accordionToggle'); //No I18N
		OPMClient.SettingsNFAUserMgmtController.lists = {};
	}
});
OPMClient.AllocatedLicenseModelComponent = Ember.Component.extend({
	templateName: "components/allocated-license-model",//No I18N
	buyNowLink: getUTMConstructedLink(Ember.I18n.t("webclient.msp.purchaselink")),//No I18N
	didInsertElement: function(){
		//Accordion Event Handler
		var self = this;
		$('#toggleAllocated').off().on('click', function(e) {
			if($(this).hasClass('active') && !$(this).find('input[type="checkbox"]').is(':checked')) {
				if($('.allocationSave').hasClass('disabledBlock')) {
					self.set('redFields',$('#allocationGrid .text-red'));	//No I18N				
					$('.allocationSave').removeClass('disabledBlock')
				}
				self.set('enableAllocated',false);//No I18N
				$(this).removeClass('active');
			}
			else if($(this).find('input[type="checkbox"]').is(':checked')){
				self.set('enableAllocated',true);//No I18N
				if(self.get('redFields') || self.get('disableSave')) {
					Ember.run.schedule('afterRender',function () {//No I18N	
						$.each(self.get('redFields'), function(key, val) {
							$('#'+$(val).attr('id')).addClass('text-red error validateField');
						});
						self.set('redFields',undefined);//No I18n
					});
					$('.allocationSave').addClass('disabledBlock');
				}
				$(this).addClass('active');
			}
		});
		Ember.run.schedule('afterRender',function () {//No I18N			
			var editValues = self.get('model') ? self.get('model') : {};//No I18N
				$('#enableAllocated').prop('checked',editValues.isAllocationEnabled);
				Ember.run.schedule('afterRender',function() {//No I18N
					$('#toggleAllocated').trigger('click');
					Ember.run.schedule('afterRender',function() {//No I18N
						$('#notificationToggle').prop('checked',editValues.isNotificationEnabled);
						if(editValues.isNotificationEnabled) {
							if(editValues.sendMail) {
								if(editValues.notificationMessage) {
									var notificationMailData = {
										'mailSubject' : editValues.notificationMessage.mailSubject,//No I18N
										'mailMessage' : editValues.notificationMessage.mailMessage//No I18N
									}
								}
							}
							self.send('notificationToggle',editValues,notificationMailData);//No I18N
						}
					});
				});			
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getOverallDeviceCount');//No I18N
			$.each(response, function(key,val) {
				if(editValues) {
					if($.isEmptyObject(editValues[val.displayName])) {
						editValues[val.displayName] = {"allocatedCount" : editValues[val.displayName]};
						editValues[val.displayName].allocatedCount = 0;
					} else {
						if(!editValues.isAllocationEnabled) {
							editValues[val.displayName].allocatedCount = 0;
						}
						val.managedCount -= (editValues[val.displayName].allocatedCount > editValues[val.displayName].addedCount) ? editValues[val.displayName].allocatedCount : editValues[val.displayName].addedCount ;
					}
				}
				var disableField = val.purchasedCount - val.managedCount;
				if(disableField == 0) {
					val.disable = "disabledBlock";//No I18N
				}
				self.set('controller.helpCard'+key,val);//No I18N
				self.set("disableSave",true);//No I18N
				if(val.purchasedCount != val.managedCount) {
					self.set("disableSave",false);//No I18N
				}
			});
			self.set('model',editValues);//No I18N
			$(document).on("click",'.isInteger',function(e) {
				$(this).keyup();
				var helpcard = $(this).attr('name');
				$('.'+helpcard).addClass('active showHelpCard');
			});
			$('html').bind('click.allocationHelpCard',function(e){
				if(!$(e.target).closest('.isInteger').length && !$(e.target).closest('.hasHelpCard').length){
					$('.allocationCalculation').removeClass('active showHelpCard');
				}
			});
			var subSteps = [];
			subSteps = [
				{id:'OPMDeviceCount', name:'devices', disable:self.get('controller.helpCard0').disable, valueBinding:editValues[self.get('controller.helpCard0').displayName], helpcardDetails:self.get('controller.helpCard0'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'LiteDeviceCount', name:'liteDevices', disable:self.get('controller.helpCard1').disable, valueBinding:editValues[self.get('controller.helpCard1').displayName], helpcardDetails:self.get('controller.helpCard1'), showHelpCard: true,helpCardContent: Ember.I18n.t("webclient.msp.litedevice.helpcard", this), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'NCMDeviceCount', name:'ncmdevice', disable:self.get('controller.helpCard2').disable, valueBinding:editValues[self.get('controller.helpCard2').displayName], helpcardDetails:self.get('controller.helpCard2'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'StorageDeviceCount', name:'disks', disable:self.get('controller.helpCard3').disable, valueBinding:editValues[self.get('controller.helpCard3').displayName], helpcardDetails:self.get('controller.helpCard3'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'IPSLADeviceCount', name:'ipsla', disable:self.get('controller.helpCard4').disable, valueBinding:editValues[self.get('controller.helpCard4').displayName], helpcardDetails:self.get('controller.helpCard4'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				// {id:'WLCDeviceCount', name:'accesspoints', disable:self.get('controller.helpCard4').disable, valueBinding:editValues[self.get('controller.helpCard4').displayName], helpcardDetails:self.get('controller.helpCard4'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				// {id:'URLMonitorCount', name:'urlmonitors', disable:self.get('controller.helpCard5').disable, valueBinding:editValues[self.get('controller.helpCard5').displayName], helpcardDetails:self.get('controller.helpCard5'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'NoOfIPs', name:'ipam', disable:self.get('controller.helpCard5').disable, valueBinding:editValues[self.get('controller.helpCard5').displayName], helpcardDetails:self.get('controller.helpCard5'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'NoOfPorts', name:'spm', disable:self.get('controller.helpCard6').disable, valueBinding:editValues[self.get('controller.helpCard6').displayName], helpcardDetails:self.get('controller.helpCard6'), isHide: false, spanClass: editValues.isAllocationEnabled? 'flex': 'display-none'},//No I18N
				{id:'NetFlowCount', name:'netflow', disable:self.get('controller.helpCard7').disable, valueBinding:editValues[self.get('controller.helpCard7').displayName], helpcardDetails:self.get('controller.helpCard7'), isHide: false, spanClass: editValues.isAllocationEnabled ? 'flex': 'display-none'} //NO I18N
			];
			self.set('controller.subSteps',subSteps);//No I18N
		})
	},
	actions: {
		notificationToggle: function(editValues,notificationMailData) {
			$('#emailNotify').click(function() {
				if($('#sendMailBox').is(':checked')) {
					$('#notifyEmailAddress').removeClass('disabledBlock');
					$('.opm_link').removeClass('disabledBlock');
				} else {
					$('#notifyEmailAddress').addClass('disabledBlock');
					$('.opm_link').addClass('disabledBlock');
				}
			});
			if($('#notificationToggle').is(':checked')) {
				$('#resolveNotify').removeClass('disabledBlock');
				if(editValues) {
					$('#notificationToggle').prop('checked',editValues.isNotificationEnabled);
					$('#resolveLimit').prop('checked',editValues.isThresholdEnabled);
					$('#sendMailBox').prop('checked',editValues.sendMail);
					$('#emailNotify').trigger('click');
					$('#notifyThresholdVal').val(editValues.thresholdValue);
				} else {
					$('#resolveNotify').find('input').prop('checked',true);
				}
				if(!OPMClient.ApplicationController.isMailServerNotConfigured) {
					getNotificationMailContent(notificationMailData);
					$('#emailNotify').removeClass('disabledBlock');
					$('#mailServerConfigured').addClass('disabledBlock');
				} else {
					$('#mailServerConfigured').removeClass('disabledBlock');
				}
			} else {
				OPMClient.ApplicationController.set('editedMailContent',undefined);//No I18N
				$('input[name="triggerAck"]').prop('checked',false);
				$('#notifyEmailAddress').val('');
				$('#resolveNotify').addClass('disabledBlock');
				$('#emailNotify').addClass('disabledBlock');
				$('#mailServerConfigured').addClass('disabledBlock');
			}
		},
		openEmailSlide: function() {
			getNotificationMailContent(OPMClient.ApplicationController.editedMailContent);
			slideIn(5);
		},
		saveAllocationDetails: function() {
			var model = this.get('model');
			var data = new FormData();
			data.set('customerID',model.id ? model.id : window.OPM.selCustomerID);//No I18N
			var success = verifyAllocationDetails(data);
			if(!success) {
				return false;
			} 
			var response = opm_ajaxMultiPostRequest(window.OPM.apiUrlPattern+'/admin/updateElementAllocation', data); //No I18N
			if(!response.error) {
				$('.licenceDetails.exceeding').removeClass('slideOpened'); //No I18n
				OPMClient.ApplicationController.set('allocatedDetails',undefined); //No I18n
				if(model.actionName) {
					var actionComponent = model.actionContext;
					actionComponent.send(model.actionName);
				}	
			}
			showMessage(response);
		},
		cancelAllocation: function() {
			var model = this.get('model');
			removeAllocationSlide();
			if(model.cancelActionName) {
				var actionComponent = model.actionContext;
				actionComponent.send(model.cancelActionName);
			}
		}
	},
	keyPress: function(e){
		if($('.isInteger').is(":focus")){//No I18N
			return opm_isNumber(e);
		}
	},
	keyUp: function (e) {
		$('.allocationCalculation').removeClass('active showHelpCard');
		var helpcard = $(e.target).attr('name');
		var inputField = $('#'+e.target.id).val();
		if($('.countCheckBox').is(':focus')) {
			$('.'+helpcard).addClass('active');
			$('.'+helpcard).addClass('showHelpCard');
			var subtractedValue =  $('#purchased'+helpcard).text() - (inputField - $('#managed'+helpcard).text());
			if(subtractedValue < 0 && inputField != 0) {
				$('#'+e.target.id).addClass('validateField error');
				$('.allocationSave').addClass('disabledBlock')
				$(e.target).addClass('text-red');
				$('#subtract'+helpcard).addClass('red');
			} 
			else {
				$('#'+e.target.id).removeClass('validateField error');
				$(e.target).removeClass('text-red');
				if(subtractedValue > 0) {
					$('#subtract'+helpcard).removeClass('red');
				}
			}
			if(!$('.countCheckBox').hasClass('text-red')) {
				$('.allocationSave').removeClass('disabledBlock');
			}
			$('#input'+helpcard).text(-inputField);//No I18N
			$('#subtract'+helpcard).text(subtractedValue);//No I18N
		} else if($('#notifyThresholdVal').is(':focus')) {
			inputField > 100 ? ($('.allocationSave').addClass('disabledBlock'),$('#'+e.target.id).addClass('validateField error'),$(e.target).addClass('text-red')) : ($('.allocationSave').removeClass('disabledBlock'),$('#'+e.target.id).removeClass('validateField error'),$(e.target).removeClass('text-red'));
		}
	},
	willDestroyElement:  function() {
		OPMClient.ApplicationController.set('editedMailContent',undefined);//No I18N
		$('html').unbind('click.allocationHelpCard');//No I18N
	}
});
OPMClient.HelpCardMspLicenseCalComponent = Ember.Component.extend({
	templateName: "components/helpCard-msp-licenseCal",//No I18N
	tagName : 'a'//No I18N
});
OPMClient.ShowAllManagedDetailsComponent = Ember.Component.extend({
	templateName: "components/showAll-managed-details",//No I18N
	classNames: ['flex-left widthAuto'],//No I18N
	didInsertElement: function() {
		var res =  opm_getJSONData(window.OPM.apiUrlPattern + "/admin/licenseDetails?isFluidic=true");//No I18N
		var licenseDetails = [];
		if(res !== undefined && res.jsonData !== undefined) {
			var opmDeviceCount = res.jsonData.deviceCount +' / '+ res.jsonData.deviceMaxLimit;
			var liteDeviceCount = res.jsonData.managedLiteDevice +' / '+ res.jsonData.licensedLiteDevices;
			var netflowCount = res.jsonData.NetFlow.totalLicManaged+ ' / ' +res.jsonData.NetFlow.totalLicense; //No I18N
			this.set('controller.OPMdeviceCount',opmDeviceCount);//No I18N
			if(res.jsonData.ModulePropertiesMap !== undefined) {
				licenseDetails = [
					{'key' : Ember.I18n.t('webclient.admin.probes.Devices',this), 'val': opmDeviceCount},//No I18N
					{'key' : Ember.I18n.t('webclient.collector.noofncmdevices',this),'val': res.jsonData.ModulePropertiesMap['NCM'].managedNCMDeviceCount+' / '+ res.jsonData.ModulePropertiesMap['NCM'].NumberOfDevices}, //No I18N
					{'key' : Ember.I18n.t('webclient.general.liteDevices.tab',this),'val': liteDeviceCount},//No I18N
					{'key' : Ember.I18n.t('webclient.IPSLA', this),'val': res.jsonData.ModulePropertiesMap['IPSLA'].activeIPSLAMonitorsCount+' / '+res.jsonData.ModulePropertiesMap['IPSLA'].NumberOfMonitors},//No I18N
					{'key' : Ember.I18n.t('webclient.Storage',this)+ '('+Ember.I18n.t('webclient.general.Disks',this)+')','val': res.jsonData.ModulePropertiesMap.managedDiskCount+' / '+ res.jsonData.ModulePropertiesMap.licensedDiskCount},//No I18N
					{'key' : Ember.I18n.t('webclient.IPAM', this),'val': res.jsonData.ipamCount+' / '+res.jsonData.ModulePropertiesMap['IPAddressManager'].NumberOfIPs},//No I18N
					{'key' : Ember.I18n.t('webclient.SPM', this),'val': res.jsonData.spmCount+' / '+res.jsonData.ModulePropertiesMap['SwitchPortMapper'].NumberOfPorts},//No I18N
					{'key' : Ember.I18n.t('nfa.interfaces.displayName'),'val': netflowCount}//No I18N
				]
			}
		}
		this.set('controller.licenseDetails',licenseDetails);//No I18N
	}
});
OPMClient.EmailNotificationContentComponent = Ember.View.extend({
	templateName: 'components/email-notification-content', //No I18N
	didInsertElement: function() {
		var mailVariables = [{displayValue:'$CustomerName',displayName:Ember.I18n.t('webclient.msp.mail.customerName',this)},{displayValue:'$ManagedDevices',displayName:Ember.I18n.t('webclient.msp.mail.deviceManaged',this)},{displayValue:'$ManagedAccessPoints',displayName:Ember.I18n.t('webclient.msp.mail.accessPointsManaged',this)},{displayValue:'$ManagedNetFlowInterfaces',displayName:Ember.I18n.t('webclient.msp.mail.nfaInterfacesManaged')},{displayValue:'$ManagedNCMDevices',displayName:Ember.I18n.t('webclient.msp.mail.ncmDevicesManaged',this)},{displayValue:'$ManagedStorageDisks',displayName:Ember.I18n.t('webclient.msp.mail.storageDisksManaged',this)},{displayValue:'$ManagedIPSLA',displayName:Ember.I18n.t('webclient.msp.mail.ipslaManaged',this)},{displayValue:'$ManagedURLMonitors',displayName:Ember.I18n.t('webclient.msp.mail.urlMonitorsManaged',this)},{displayValue:'$AllocatedDeviceLimit',displayName:Ember.I18n.t('webclient.msp.mail.devicesAllocated',this)},{displayValue:'$AllocatedAccessPointsLimit',displayName:Ember.I18n.t('webclient.msp.mail.accessPointsAllocated',this)},{displayValue:'$AllocatedNetFlowInterfacesLimit',displayName:Ember.I18n.t('webclient.msp.mail.nfaInterfacesAllocated')},{displayValue:'$AllocatedNCMDeviceLimit',displayName:Ember.I18n.t('webclient.msp.mail.ncmDevicesAllocated',this)},{displayValue:'$AllocatedStorageDiskLimit',displayName:Ember.I18n.t('webclient.msp.mail.storageDisksAllocated',this)},{displayValue:'$AllocatedIPSLALimit',displayName:Ember.I18n.t('webclient.msp.mail.ipslaAllocated',this)},{displayValue:'$AllocatedURLMonitorsLimit',displayName:Ember.I18n.t('webclient.msp.mail.urlMonitorsAllocated',this)}]//No I18N
		this.set('controller.mailVariables',mailVariables);//No I18N
		$(".select2").select2();
	},
	actions: {
		saveMailContent: function() {
			if(getNotificationMailContent()){
				slideOut(5);
			}
		}
	} 
});
OPMClient.AssociateUserRolesComponent = Ember.Component.extend({
	templateName:"components/associate-user-roles", //No I18N
	hideSelectAll:window.isoperator,
	didInsertElement: function(){
        var self = this;
        var userList = self.get('userList');
        var dashUserList = this.get('controller.userList');
        self.set("controller.roles", userList.users); //No I18N
		Ember.run.schedule('afterRender', function() { //No I18n
        	if(dashUserList.isEdit){
				for(var i=0;i<dashUserList.associatedRoleIDs.length;i++){
					// $('.associateUserRoleList').find('input[value="' +dashUserList.associatedRoleIDs[i] +'"]').prop('checked',true).trigger('change'); //No I18N
					$('#AssociateUserList .opmCheckAll').find("input[value='"+ dashUserList.associatedRoleIDs[i] +"']").prop('checked',true).trigger('change'); //No I18N
				}
				for(var i=0;i<dashUserList.associatedUserIDs.length;i++){
					$('.treeList').find('input[value="' +dashUserList.associatedUserIDs[i] +'"]').prop('checked',true).trigger('change'); //No I18N
					// var name = $('.treeList').find('input[value="' +dashUserList.associatedUserIDs[i] +'"]').attr('name');
					// $('.associateUserRoleList').find('input[value="' +name+'"]').prop('checked',true).trigger('change'); //No I18N
				}
			}
			var roles = self.get('roles');
			for (var i = 0; i < roles.length; i++) {
				roles[i].totalUsers === undefined ? roles[i].totalUsers = 0 : roles[i].totalUsers;
				roles[i].selectedUser === undefined ? roles[i].selectedUser = 0 : roles[i].selectedUser = $("input[name='" + roles[i].roleId + "']:checked").length;
				$('.listChild').find('#' + roles[i].roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);
			}
		});
		$('#closeSearch').on("click", function() {
			self.set("usersSearchText", '').send("searchUsersList");//No I18n
		});
	},
	actions: {
		searchUsersList : function() {
			var self = this;
			var listToCheck = "AssociateUserList";//No I18n
			if (this.debounceSearch !== null) {
				clearTimeout(self.debounceSearch);
			}
			this.debounceSearch = setTimeout(function () {
				var searchString = self.get("usersSearchText");
				if (searchString == "") {
					$('#showSearch').show();$('#closeSearch').hide();
					$('.noSearchData').hide();
					$("#"+listToCheck+" .listChild").show();
					$("#"+listToCheck+" .treeList .opmCheckBox").show().removeClass("checked");
				}
				else {
					$('#showSearch').hide();$('#closeSearch').show();
					$("#"+listToCheck+" .treeList .opmCheckBox").each(function () {//No I18N
						if ($(this).text().search(new RegExp(searchString, "i")) <= 0) {//No I18N
							$(this).removeClass("checked");
							$(this).hide();
						} else {
							$(this).addClass("checked");
							$(this).show();
						}
					});
					$('#AssociateUserList .listChild').each(function() {
						if($(this).find('.checked').length == 0){ 
							$(this).closest('.listChild').hide();
						} else {
							$(this).closest('.listChild').show();
						}
					});
					if($('#AssociateUserList .listChild').is(":visible")) {
						$('.noSearchData').hide();
					} else {
						$('.noSearchData').show();
					}
				}				
				clearTimeout(self.debounceSearch);
			}, 200)
		},
        selectAllUsers: function() {
        	var self = this;
            var roles = self.get('roles');
            if($('.selectAllUsers').is(":checked")) {
            	$("#AssociateUserList .chkSelectAll").not('.ignoreRole').prop('checked', true);
            	$('#AssociateUserList .dashUser').not('.ignoreUser').prop('checked', true).addClass('ignoreAll');
                for (var i = 0; i < roles.length; i++) {
	                roles[i].totalUsers === undefined ? roles[i].totalUsers = 0 : roles[i].totalUsers;
	                roles[i].selectedUser === undefined ? roles[i].selectedUser = 0 : roles[i].selectedUser = $("input[name='" + roles[i].roleId + "']:checked").length;
	                $('.listChild').find('#' + roles[i].roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);
	            }
	             $('.selectAlert').show();
            } else {
            	$("#AssociateUserList .chkSelectAll").prop('checked', false);
            	$('#AssociateUserList .dashUser').not(':disabled').prop('checked', false);
            	$('#AssociateUserList .dashUser').removeClass('ignoreAll');
                for (var i = 0; i < roles.length; i++) {
	                roles[i].totalUsers === undefined ? roles[i].totalUsers = 0 : roles[i].totalUsers;
	                roles[i].selectedUser === undefined ? roles[i].selectedUser = 0 : roles[i].selectedUser = $("input[name='" + roles[i].roleId + "']:checked").length;
	                $('.listChild').find('#' + roles[i].roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);
	            }
	             $('.selectAlert').hide();
            }
            if ($(".chkSelectAll").not('.ignoreRole').is(":checked")) {
                $('.selectAlert').show();
            } else {
                $('.selectAlert').hide();
            }
        },
        selectSpecUsers: function(id) {
            var roles = this.get('roles');
            for (var i = 0; i < roles.length; i++) {
                if (roles[i].roleId == id) {
                    if ($("#AssociateUserList .opmCheckAll").find("input[value='" + id + "']").is(":checked")) {
                        $('#AssociateUserList .treeList').find("input[name='" + id + "']").prop('checked', true).addClass('ignoreAll');
                        roles[i].selectedUser = $("input[name='" + id + "']:checked").length;
                        $('.listChild').find('#' + id).text(roles[i].totalUsers + '/' + roles[i].totalUsers);
                    } else {
                        $("#AssociateUserList .treeList input[name='" + id + "']").not(':disabled').prop("checked", false);
                        $("#AssociateUserList .treeList input[name='" + id + "']").removeClass('ignoreAll');
                        roles[i].selectedUser = $("input[name='" + id + "']:checked").length;
                        $('.listChild').find('#' + id).text(roles[i].selectedUser + '/' + roles[i].totalUsers);
                        $('.selectAllUsers').is(":checked") ? $('.selectAllUsers').prop('checked', false) : '';
                    }
                }
            }
			if(window.OPM.isMultipleRoleConfigEnabled) {
				var userList = $('.listChild').find("input[name='" + id + "']");
				for(var i = 0; i < userList.length; i++) {
					if($(userList[i]).is(':checked')) {
						$(".treeList").find("input[value='" + userList[i].value + "']").prop('checked', true);
					} else {
						$(".treeList").find("input[value='" + userList[i].value + "']").prop('checked', false);
					}
				}
				
				for(var i = 0;i < roles.length; i++) {
					roles[i].selectedUser = $("input[name='" + roles[i].roleId + "']:checked").length;
					$('.listChild').find('#' + roles[i].roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);	
				}
			}
            this.set("controller.roles", roles); //No I18N
            if ($(".chkSelectAll").not('.ignoreRole').is(":checked")) {
                $('.selectAlert').show();
            } else {
                $('.selectAlert').hide();
            }
        },
        userSelection: function(roleId, userId) {
            var roles = this.get('roles');
            for (var i = 0; i < roles.length; i++) {
                if (roles[i].roleId == roleId) {
                    if ($(".treeList").find("input[value='" + userId + "']").is(':checked')) {
                        roles[i].selectedUser = $("input[name='" + roleId + "']:checked").length;
                        $('.listChild').find('#' + roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);
                    } else {
                        roles[i].selectedUser = $("input[name='" + roleId + "']:checked").length;
                        $('.opmCheckAll').find('input[value="' + roleId + '"]').prop('checked', false);
                        $('.listChild').find("input[name='" + roleId + "']").removeClass('ignoreAll');
                        $('.listChild').find('#' + roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);
                    }
                }
            }
			if(window.OPM.isMultipleRoleConfigEnabled) {
				if($('.listChild').find("input[value='" + userId + "'][name='" + roleId + "']").is(":checked")) {
					$(".treeList").find("input[value='" + userId + "']").prop('checked', true);
				} else {
					$(".treeList").find("input[value='" + userId + "']").prop('checked', false);
				}
				for(var i = 0;i < roles.length; i++) {
						roles[i].selectedUser = $("input[name='" + roles[i].roleId + "']:checked").length;
						$('.listChild').find('#' + roles[i].roleId).text(roles[i].selectedUser + '/' + roles[i].totalUsers);	
						
				}
			}
            this.set('controller.roles', roles); //No I18N
        }
	},
	willDestroyElement:function(){
		OPMClient.SettingsAddEditController.set('webAlarmUserList',undefined); //No I18N
	}
});
OPMClient.RegisterLicensePopupComponent = Ember.Component.extend({
	templateName: "components/register-license-popup", //No I18N
	classNames:["licensePopup no-form dragndrop"], //No I18N
	attributeBindings: ["id"], //No I18N
	id:"registerPopup",//No I18N
	showFileErrorMsg:false,
	uploadFileClass:'upload',//NO I18N
	regFileName:'',
	regFileSize:'',
	showLicenseFileInfo:false,
	licenseErrorMsg:'',
	didInsertElement:function(){
		var self = this;
		$('.upload')[0].addEventListener('dragover', function(e) {//NO I18N
			$('.upload').addClass('is-dragover');//NO I18N
			e.preventDefault();
			e.stopPropagation();
		});
		$('.upload')[0].addEventListener('dragleave', function(e) {//NO I18N
			$('.upload').removeClass('is-dragover');//NO I18N
			e.preventDefault();
			e.stopPropagation();
		});
		$('.upload')[0].addEventListener('drop', function(e) {//NO I18N
			e.preventDefault();
		  	e.stopPropagation();
		  	$('.upload').removeClass('is-dragover');//NO I18N
		  	if(e.dataTransfer!==undefined && e.dataTransfer.files!==undefined && e.dataTransfer.files.length>0){
		  		var filesList = e.dataTransfer.files[0];
		  		self.set('regFileName',filesList.name);//No I18N
		        self.set('regFileSize',(filesList.size/1024).toFixed(2)+' KB');//No I18N
		        self.set('uploadFileClass','upload upload-file');//No I18N
				self.set('showLicenseFileInfo',true);//No I18N
			 	if(filesList.name === "" || (!((/\.(xml)$/i).test(filesList.name))))
			    {
			        self.set('showFileErrorMsg',true);//No I18N
			        self.set('licenseErrorMsg',Ember.I18n.t('webclient.admin.license.properfile'));//No I18N
			    }
			    else
			    {
			    	self.set("uploadFile",e.dataTransfer.files[0]);//No I18N
			        setTimeout(function(self){
						self.registerLicense(false);
					},1000,self);
			    }
		  	}
		});
	},
	registerLicense:function(proceedWithoutFos,msgId){
		var self = this;
        var data = new FormData();
        data.append("licenseFile",this.get("uploadFile"));//No I18N
		if (proceedWithoutFos) {
			data.append("proceedWithoutFos", true);//No I18N
		}
		var registerLicenseCallBack =  function(success) {
			OPMClient.ApplicationController.set("showLoadingLine", undefined);//No I18N
			if(success.error !== undefined && success.error !== undefined )
			{
				$('#registerPopup').show();
				var rspStr = (typeof success.error === 'string')? success.error : success.error.message; //No I18N
				self.set('showFileErrorMsg',true);//No I18N
				self.set('licenseErrorMsg',rspStr);//No I18N
			}else if (success.showFosConsent !== undefined) {
				if(confirm(Ember.I18n.t('webclient.settings.fos.eval.fos.disable.consent',self))){//No I18N
					self.registerLicense(true);
				}
				return;
			}
			else{
				var infoId = opm_infoMsgs("successMsg",success.message); //No I18N
				if(success.apm_error) {
					sessionStorage.setItem("apm_error",success.apm_error); //No I18N
				}
				setTimeout(function(){
					$('#'+infoId).remove();
					location.reload();
				},3000);
			}
		}
		opm_ajaxPostRequestWithClbk(window.OPM.apiUrlPattern + "/admin/registerLicense",data,'',registerLicenseCallBack); //No I18N
		$('#registerPopup').hide();
		OPMClient.ApplicationController.set("showLoadingLine", Ember.I18n.t('webclient.license.register.loadMsg', this));//No I18N
	},
	actions:{
		closeLicensePopup:function(){
			OPMClient.ApplicationController.set('showRegisterLicensePopup',false);//No I18N
		},
		fileUpload:function(){
		 	var fileName = $("#regLicenseFile").val();//No I18N
		 	var fileNameArr = fileName.split('\\');
	        this.set('regFileName',fileNameArr[fileNameArr.length-1]);//No I18N
	        var fileSize = $('#regLicenseFile')[0].files[0].size/1024;//No I18N
	        this.set('regFileSize',fileSize.toFixed(2)+' KB');//No I18N
	        this.set('uploadFileClass','upload upload-file');//No I18N
			this.set('showLicenseFileInfo',true);//No I18N
		 	if(fileName === "" || (!((/\.(xml)$/i).test(fileName))))
		    {
		        this.set('showFileErrorMsg',true);//No I18N
		        this.set('licenseErrorMsg',Ember.I18n.t('webclient.admin.license.properfile',this));//No I18N
		    }
		    else
		    {
		    	var licenseFile = document.getElementById('regLicenseFile');//No I18N
		    	this.set("uploadFile",licenseFile.files[0]);//No I18N
		        setTimeout(function(self){
					self.registerLicense(false);
				},1000,this);
		    }
		},
		retryLicense:function(){
			this.set('uploadFileClass','upload');//No I18N
			this.set('showLicenseFileInfo',false);//No I18N
			this.set('showFileErrorMsg',false);//No I18N
			$("#regLicenseFile").val('');
		}
	},
	willDestroyElement:function(){
		OPMClient.ApplicationController.set('showRegisterLicensePopup',false);//No I18N
		$('#'+this.elementId).remove();//No I18N
	}
});
OPMClient.LoadingSpinnerComponent = Ember.Component.extend({
	templateName: "components/loading-spinner", //No I18N
	classNames:["spinner-loader"], //No I18N
	attributeBindings: ['style','id'], //No I18N
	style:"",
	didInsertElement:function() {
		var customStyle = this.get('customStyle');
		if(customStyle) {
			this.set('style', customStyle); //No I18n
		}
		var id = this.get('id');
		if(id) {
			this.set('id', id); //No I18N
		} 
	},
	willDestroyElement:function(){
		$('#'+this.elementId).remove();
	}
});

OPMClient.LoadingLineComponent = Ember.Component.extend({
	templateName: "components/loading-line", //No I18N
	didInsertElement: function(){
		if ((Ember.I18n.t(this.content, this).indexOf("Missing translation")) < 0) {
			this.set('content', Ember.I18n.t(this.content, this));//No I18N
		} else {
			this.set('content', this.content);//No I18N
		}
	}
});

function hideSearchBar(){
	$('#apmSearchBox').toggle(); //No I18N
}

OPMClient.ApmMonitorTreeComponent = Ember.Component.extend({
	noData:false,
	groupBy:"vendor",//No I18N
	actions:{
		expandAll:function()
		{
			var isExpandAll = this.get('isExpandAll');
			if(isExpandAll)
			{
				$('#'+this.elementId+' .jstree').jstree("close_all");
			}
			else
			{
				$('#'+this.elementId+' .jstree').jstree("open_all");
			}
			this.set('isExpandAll',!isExpandAll)//No I18n
		}
	},
	didInsertElement: function(){
		var self = this;
		Ember.run.schedule('afterRender', function() { //No I18n
		var parentView = self.get('parentView').get('parentView');
		var controller = parentView.get('controller')
		var apmDetails = controller.get('apmDetails');
		self.set('apmDetails',apmDetails);//No I18n
		
		if(apmDetails)
	      {
	     	 	var apmPrivilege  = apmDetails.apmPrivilege
				var apmPermission = apmDetails.apmPermission
				var monGroupIds = apmDetails.selectedMonitorList || [];
		      	$('#' + apmPrivilege).prop('checked',true);
		      	$('#' + apmPermission).prop('checked',true);
		      	if(apmPermission == 'All')
		      	{
		      		$('#' + apmPermission).trigger('change');
		      	}
	      }
		});

		// User management - APM monitor groups search
		$(".apmSearch").keyup(function () {
			var responseData = self.get('response');//No I18N			
			var searchTerm = $("#apmSearchBox").val().toLowerCase() || "";//No I18N
			self.set('searchTerm',searchTerm);//No I18N
			var filteredData = [];
			if (responseData) {
				filteredData = responseData.filter(function (item) {
					return item.a_attr.displayName.toLowerCase().includes(searchTerm);
				});
			} 
			self.set('filteredData',filteredData);//No I18N
		});

		var callBkFn = function(response){
			if (!response.allowSelectAPMRole || response.APMPlugin == 'Down' || $('#pAPM').prop('disabled')) {
				self.get('parentView').set('disableAPMCheckbox',true)//No I18N
			}
			if(response.APMPlugin == 'Down')
			{				
				self.get('parentView').set('showAPMDown',true)//No I18N
			}
			response = response.result 
			if(response!==undefined && response.length>0){
			self.set('response',response);//No I18N
				self.set('noData',false);//No I18N
			}else{
				self.set('noData',true);//No I18N
			}			
		}
		data = {};
		if(window.OPM.isOpmPlug) {  //Api should be called if there is opm plugin permission 
			var url = window.OPM.apiUrlPattern + '/admin/getAPMRolesAndMonitorGroups';//No I18N
			getDeviceTreeCall(url,data,callBkFn,self);
		}
	},

	updateTreeRender: function() {
		var self = this;
		var responseData = self.get('filteredData');//No I18N
		var treeNodes = self.get('response');//No I18N
		var toshow = [];
		var result=[];

		if($('#apmSearchBox').val()==""){ //No I18N
			treeNodes.forEach(function(node){
				$('#'+node.id+"_anchor").show().removeClass("apmSearchHG"); //No I18N
				$('#'+node.id).show(); 
			});
			if($(".collapse").text() ==="Expand"){ //No I18N
				$('#' + this.elementId + ' .jstree').jstree("close_all"); //No I18N
			}else{
				$('#' + this.elementId + ' .jstree').jstree("open_all"); //No I18N
			}
		}else{
			function getRootParent(nodeId) {
				toshow.push(nodeId);
				var parent = $('.jstree').jstree().get_parent(nodeId); //No I18N
				if (parent === '#') {
					return;
				} else {
					toshow.push(parent);
					getRootParent(parent);
				}
			}
			
			$('#' + self.elementId + ' .jstree > ul > li').show(); //No I18N
			$('#' + this.elementId + ' .jstree').jstree("open_all"); //No I18N
			
			treeNodes.forEach(function(node) {
				var nodeId = node.id;
				$('#'+node.id+'_anchor').removeClass("apmSearchHG"); //No I18N
		
				var isInResponseData = responseData.some(function(item) {
					return item.id === nodeId;
				});
		
				if (isInResponseData) {
					result.push(nodeId);
					getRootParent(nodeId);
				}
			});

			treeNodes.forEach(function(node){
				if(!toshow.includes(node.id)){
					$('#'+node.id).hide();
				}
				else{
					$('#'+node.id).show();
				}
			});

			result.forEach(function(elementID){
				$('#'+elementID+'_anchor').addClass("apmSearchHG").show(); //No I18N
			});
		}
	}.observes('filteredData'),//No I18N
	
	treeRenderObserver:function(){
		var self = this;
		$('#'+self.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+self.elementId+' .jstree').jstree({//No I18N
			"checkbox" : {//No I18N
	      			 "tie_selection" : false, //No I18N
	      			   "three_state": false,//No I18N
  							"cascade": "down"//No I18N
				    },
		    "plugins":["sort","search","contextmenu","checkbox"],//No I18N
		    "core": {//NO I18N
                'data': self.get('response') //NO I18N
            }
        }).on('loaded.jstree',function(e,data){//No I18N
        	$('#'+self.elementId+' .jstree').jstree("open_node",[$('#'+self.elementId+' .jstree > ul > li:first-child').attr("id")]);//No I18N
        	var rootNode = '#'+self.elementId+' .jstree > ul > li:first-child';
        	var selector = rootNode;
        	for (var i = 6; i >= 0; i--) {
        		selector = selector + '> ul > li:first-child';//No I18N
        		var childEle = $(selector);
        		if(childEle!==undefined && childEle.length === 1){
        			$('#'+self.elementId+' .jstree').jstree("open_node",[$(childEle).attr("id")]);//No I18N
        		}
        	}
        	var monGroupIds = self.get('apmDetails') ? self.get('apmDetails').selectedMonitorList : false;
        	if (monGroupIds) {
        	$('#'+self.elementId+' .jstree').jstree("check_node",monGroupIds);	
        	}

        }).on('open_node.jstree',function(e,data){//No I18N
        	
		}).on('close_node.jstree',function(e,data){//No I18N       	
			
		}).on('select_node.jstree',function(e,data){//No I18N
			
		});
	}.observes('response'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId+' .jsTreeType1').addClass('dashBoardTreeView');//No I18N
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});


OPMClient.ApmMonitorsTreeviewComponent = Ember.Component.extend({
	templateName: "components/apm-monitors-treeview", //No I18n
	groupBy:"category",//No I18N
	noData:false,
	didInsertElement: function(){
		var self = this;
		var callBkFn = function(response){
			if(response!==undefined && response.data!==undefined && response.data.length>0){
				self.set('response',response.data);//No I18N
				self.set('noData',false);//No I18N
			}else{
				self.set('noData',true);//No I18N
			}			
		}
		var url = window.OPM.apiUrlPattern + '/device/listAPMMonitorsInTreeView';//No I18N
		var data={groupBy:this.get("groupBy")};//No I18N
		if(window.OPM.apmInstalled==='true' || window.OPM.apmInstalled===true){//No I18N
			getDeviceTreeCall(url,data,callBkFn,self);
		}
	},
	groupByObserver:function(){
		this.rerender();
	}.observes('groupBy'),//No I18N
	treeRenderObserver:function(){
		var self = this;
		$('#'+self.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+self.elementId+' .jstree').jstree({//No I18N
		    "core": {//NO I18N
                'data': self.get('response') //NO I18N
            }
        }).on('select_node.jstree',function(e,data){//No I18N
				var isSelected = false;
				if (selectedNodeId === data.node.id) {
					selectedNodeId = "";
			        data.instance.deselect_node(data.node);
			    }else{
			        selectedNodeId = data.node.id;
			        $('#'+self.elementId+' .jstree').jstree("open_node",data.selected);//No I18N
			        isSelected = true;
			    }
			if(data.node.a_attr.type==="APMCategory" || data.node.a_attr.type==="APMMonitorType")//No I18N
		     {
			    	var filterObj = JSON.parse(localStorage.getItem('ApplicationsfilterObj')); //No I18N
			    	if(filterObj===null){
			    		filterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.deviceFilterObj);
			    	}
				filterObj.category = filterObj.vendor = filterObj.type = filterObj.bv = filterObj.probe = filterObj.group = [];
				var selectedData = subFilter = "";
				switch(data.node.a_attr.type)
				{
					case "APMCategory"://No I18N
						selectedData = data.node.a_attr.uniqueName;
						subFilter = "category";//No I18N
						break;
					case "APMMonitorType"://No I18N
						selectedData = data.node.a_attr.uniqueName;
						subFilter = "type";//No I18N
						break;
				}
				if(isSelected){
					filterObj[subFilter] = [selectedData];
					filterObj.subFilter = subFilter;
				}
		    		localStorage.setItem('ApplicationsfilterObj',JSON.stringify(filterObj));//No I18N
				opm_loadDevicesBarChartData('Applications',true,true);//No I18N
				loadAPMMonitorsListIntoGrid();
		    	}else if(data.node.a_attr.type==="APMMonitor"){//No I18N
				redirectToAPMMonitor(data.node.a_attr.uniqueName);
			}
		});
	}.observes('response'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});

OPMClient.OpmSnapTreeViewComponent=Ember.Component.extend({
	templateName:"components/opm-snap-tree",//No I18N
	groupBy:'group',//No I18N
	didInsertElement:function(){
		var self=this;
		var groupBy=this.get('groupBy');
		var url = window.OPM.apiUrlPattern + '/device/getDeviceTree';//No I18N
		var treeParams = {"group":"groupName","probe":"probeID"};//No I18N
		var data={};
		data.groupBy = this.get("groupBy");//No I18N

		url = url+"?groupBy="+this.get("groupBy")+"&pageName=groups";//No I18N
		$('#snaptree').jstree('destroy');
		$('#snaptree').jstree({//No I18N
		    "plugins":["json_data","contextmenu","sort"],//No I18N
		    "contextmenu":{//No I18N
		    	"select_node":true,//No I18N
		    	"items":function(node){//No I18N
		    		if(node.original.type === "group"){//No I18N
		    			return{
		    				"JumpTo":{//No I18N
		    					"label":Ember.I18n.t("webclient.opm.jumpto.snapshot",this),//No I18N
		    					"icon":"popoutImg",//No I18N
		    					"action":function(obj){//No I18N
		    						redirectotGroupsSnapshot(node.original.groupName,node.original.groupType);
		    					}
		    				}
		    			}
		    		}
		    	}
		    },
			"core": {//NO I18N
		            'data' : {//No I18N
					   	'url' : function (node) {//No I18N
						return url;
					},
					'data' : function (node) {//No I18N
					   	if(node.id !== "#")
					   	{
							var param = (node.id).split(/~_~(.*)/g);
							node.parentId = node.id;
							var pobj = {"limit":1000};//No I18N
							pobj[treeParams[groupBy]]=node.id;
							if(node.original.type == "group")
							{
								pobj[treeParams[groupBy]]=node.original.groupName;
							}
							return pobj;
						}
						else{
							var pobj = {"groupID":self.snapshotObj.GroupDetails.groupID};//No I18N
							return pobj;
						}
				    }
				},
				'force_text': true //No I18n
            }
		}).on('loaded.jstree',function(e,data){//No I18N
		      	if(data.instance._cnt === 0){
					$('#'+self.widgetId).text(Ember.I18n.t("webclient.reports.view.nodata",this)); //No I18n
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
		}).on('after_open.jstree', function () {
			var widgetElement=document.getElementById(self.widgetData.widgetElementID);
			var child=widgetElement.querySelector('#snaptree');//No I18N
			widgetElement.style.height=(child.scrollHeight+100)+ 'px';
		})
		.on('after_close.jstree', function (e, data) {
	        var widgetElement=document.getElementById(self.widgetData.widgetElementID);
			var child=widgetElement.querySelector('#snaptree');//No I18N
			widgetElement.style.height=(child.scrollHeight+100)+ 'px';
			
			var tree = $('#snaptree').jstree(true);
			if((data.node.original.loaded !== undefined && data.node.original.loaded === false) || (data.node.original.loaded === undefined))
	        {        
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
			}
		}).on('select_node.jstree',function(e,data){//No I18N
			var isSelected = false;
			if (selectedNodeId === data.node.id) {
				selectedNodeId = "";
		    	data.instance.deselect_node(data.node);
			}else{
		    	selectedNodeId = data.node.id;
		    	$('#snaptree').jstree("open_node",data.selected);//No I18N
		    	isSelected = true;
			}
			if(data.node.original.type==="device"){//No I18N
					if(window.OPM.isDeviceTreeExpanded !== undefined && window.OPM.isDeviceTreeExpanded && data.node.original.grpByNameID !== undefined && (self.get('groupBy') === "group" || self.get('groupBy') === "bv"))
		    		{		    		
		    			location.href = getDevSnapshotUrl(data.node.original.grpByNameID);
		    		}
		    		else
		    		{
		    			location.href = getDevSnapshotUrl(data.node.original.id);
		    		}
			}else if(data.node.original.type==="group"){//No I18N
				redirectotGroupsSnapshot(data.node.original.groupName,data.node.original.groupType);
			}else if(data.node.original.type==="interface"){//No I18N
				OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringInterface"; //No I18N
				if(window.OPM.isDeviceTreeExpanded !== undefined && window.OPM.isDeviceTreeExpanded && data.node.original.grpByNameID !== undefined)
		    	{
		    		redirectToDeviceSnapshot(data.node.original.grpByNameID,'','MonitoringInterface'); //No I18N
		    	}
		    	else
		    	{
		    		redirectToDeviceSnapshot(data.node.original.id,'','MonitoringInterface'); //No I18N
		    	}
			}
		});
	},
	willDestroyElement: function(){
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});

var selectedNodeId="";
OPMClient.OpmDeviceTreeComponent = Ember.Component.extend({
	groupBy:"vendor",//No I18N
	noData:false,
	didInsertElement: function(){
		var self = this;
		/*var callBkFn = function(response){
			if(response!==undefined && response.length>0){//No I18N
				self.set('response',response);//No I18N
				self.set('noData',false);//No I18N
			}else{
				self.set('noData',true);//No I18N
			}			
		}*/
		var url = window.OPM.apiUrlPattern + '/device/getDeviceTree';//No I18N
		var treeParams = {"group":"groupName","bv":"bvName","probe":"probeID","poller":"pollerID"};//No I18N
		var data={};
		data.groupBy = this.get("groupBy");//No I18N
		url = url+"?groupBy="+this.get("groupBy");//No I18N
		if(OPMClient.ApplicationController.selectedMenu == "Monitoring") {
			url += "&classification=Network"; //No I18N
		}
		if(OPMClient.InventoryDeviceDetailsController.subFilterType === "GROUP")
		{
			data.pageName = "groups"; //No I18N
			url = url+"&pageName=groups"; //No I18N
		}else if(OPMClient.InventoryDeviceDetailsController.subFilterType==="Applications"){//No I18N
			url = window.OPM.apiUrlPattern + '/device/listAPMMonitorsInTreeView';//No I18N
		}
		if(this.get("isDashboardView")){
			if(this.get("groupBy") == "group")
			{
				url = url+"&pageName=widget"; //No I18N
			}
			url = url+"&widgetID="+self.widgetId; //No I18N
			$('#'+self.elementId+' .jsTreeType1').addClass('dashBoardTreeView');//No I18N
		//	self.set('response',this.get("WidgetData"));//No I18N
			self.set('noData',false);//No I18N
		}/*else{*/
		// In the session-less embed/print context (dashboard PDF export, embedded widget) the raw REST path
		// (apiUrlPattern + /device/getDeviceTree) is NOT authenticated, so the server returns Login.jsp and
		// jsTree renders the login page markup as a garbage node. Route the call through /embedWidget so
		// EmbedViewFilter injects the embed user's apiKey (scoped to this widget via isWidgetInDashboard);
		// getDeviceTree is already permitted in EmbedAPIServlet's methodCalls allowlist.
		if(window.OPM.isEmbed && window.OPM.authKey){
			var embQ = url.indexOf("?");
			var embParams = (embQ>=0) ? url.substring(embQ+1) : ""; //No I18N
			var embMethod = url.substring(0, (embQ>=0)?embQ:url.length).split("/").pop(); //No I18N
			url = "/embedWidget?type="+(window.OPM.Embedtype||"dashboard")+"&authKey="+window.OPM.authKey+"&methodCall="+embMethod+(embParams?("&"+embParams):""); //No I18N
		}
		if(data.groupBy!==undefined && data.groupBy!==null && data.groupBy!==""){
				//getDeviceTreeCall(url,data,callBkFn,self);
		$('#'+self.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+self.elementId+' .jstree').jstree({//No I18N
		    "plugins":["json_data","contextmenu","sort"],//No I18N
		    "contextmenu":{//No I18N
		    	"select_node":false,//No I18N
		    	"items":function(node){//No I18N
		    		if(node.original.type === "group"){//No I18N
		    			return{
		    				"JumpTo":{//No I18N
		    					"label":Ember.I18n.t("webclient.opm.jumpto.snapshot",this),//No I18N
		    					"icon":"popoutImg",//No I18N
		    					"action":function(obj){//No I18N
		    						redirectotGroupsSnapshot(node.original.groupName,node.original.groupType);
		    					}
		    				}
		    			}
		    		}
		    	}
		    },
		    "core": {//NO I18N
                'data' : {//No I18N
				    'url' : function (node) {//No I18N
				    			
				    	 return url;
				    },
				    'data' : function (node) {//No I18N
				    	if(node.id !== "#" && self.get('groupBy') !== 'virtualType' && self.get('groupBy') !== 'virtualHierarchy')
				      	{
							var param = (node.id).split(/~_~(.*)/g);
							if(node.original.type == "vendor" || node.original.type == "category" || node.original.type == "apps")
							{
								var pobj = {};
								pobj[data.groupBy] = param[1];
								return pobj;
							}
							else if(node.original.type == "type")
							{
								var pobj = {"deviceType":param[1],"limit":1000};//No I18N
								node.parentId = node.id;
								pobj[data.groupBy]=param[0];
								return pobj;
							}
							else if(node.original.type == "group" || node.original.type == "bv" || node.original.type == "probe" || node.original.type == "poller")
							{
								node.parentId = node.id;
								var pobj = {"limit":1000};//No I18N
								pobj[treeParams[data.groupBy]]=node.id;
								if(node.original.type == "group")
								{
									pobj[treeParams[data.groupBy]]=node.original.groupName;
								}
								if(node.original.type == "bv")
								{
									pobj[treeParams[data.groupBy]]=node.original.id;
								}
								
								return pobj;
							}
							else if(node.original.type == "count" && (data.groupBy == "group" || data.groupBy == "bv" || data.groupBy == "probe" || data.groupBy == "poller"))
							{
								var paramVal = (node.parent).split(/~_~(.*)/g);
								var pobj = {"limit":1000,"offset":(node.id).split("~_~")[0]};//No I18N
								pobj[treeParams[data.groupBy]]=paramVal[0];
								if(data.groupBy == "group")
								{
									pobj[treeParams[data.groupBy]]=(paramVal[1] !== undefined && paramVal[1] !== "" ? paramVal[1] : paramVal[0]);
								}
								else if(data.groupBy == "bv")
								{
									pobj[treeParams[data.groupBy]]=node.parent;
								}
								
								return pobj;
							}
							else if(node.original.type == "count")
							{
								var type = (node.parent).split(/~_~(.*)/g);
								var pobj = {"deviceType":type[1],"limit":1000,"offset":(node.id).split("~_~")[0]};//No I18N
								pobj[data.groupBy]=type[0];
								return pobj;
							}
							else{
								node.parentId = node.id;
								var pobj = {};
								pobj[data.groupBy] =node.id;
								return pobj;

							}
						}
				    },
				    'dataFilter': function(rawData) {//No I18N
				    	if (window.OPM.isNewStatusPropagation) {
				    		try {
				    			var nodes = JSON.parse(rawData);
				    			(function transformIcons(arr) {
				    				if (!Array.isArray(arr)) {
				    				    return;
				    				}
				    				for (var i = 0; i < arr.length; i++) {
				    					var nd = arr[i];
				    					var ndState = (nd.state !== undefined && nd.state !== null && typeof nd.state !== 'object') ? nd.state : (nd.a_attr && nd.a_attr.state !== undefined ? nd.a_attr.state : undefined); // No I18N
				    					if (ndState !== undefined && typeof ndState !== 'object') { delete nd.state; }
				    					var ndType = nd.type || (nd.a_attr && nd.a_attr.type);
				    					if (nd.parent === '#' || (ndType !== 'device' && ndType !== 'interface')) { if (nd.children && Array.isArray(nd.children)) { transformIcons(nd.children); } continue; }
				    					if (ndState !== undefined && ndState !== null && nd.icon) {
				    						var sev = nd.status !== undefined ? nd.status : undefined;
				    						if (sev === undefined && nd.icon) {
												var _m = nd.icon.match(/status(\d+)/); if (_m) { sev = _m[1]; }
											}
				    						nd.icon = '--fault-severity icon-status --dual-status status-' + sev + ' ' + opm_getStateCls(ndState);//No I18N
				    					}
				    					if (nd.children && Array.isArray(nd.children)) {
				    						transformIcons(nd.children);
				    					}
				    				}
				    			})(nodes);
				    			return JSON.stringify(nodes);
				    		} catch(e) { return rawData; }
				    	}
				    	return rawData;
				    }
				},
				'force_text': true //No I18n
 
            },
            sort:function (a, b) {
            	var selNodeA = this.get_node(a);
            	var selNodeB = this.get_node(b);
            	var sortNodeA = (selNodeA!==undefined && selNodeA.original.type !== undefined && (selNodeA.original.type==="device" || selNodeA.original.type==="count"))?false:true;//No I18N
            	var sortNodeB = (selNodeB!==undefined && selNodeA.original.type !== undefined && (selNodeA.original.type==="device" || selNodeA.original.type==="count"))?false:true;//No I18N
                //To sort BV name by it text this check included
				if(selNodeA.original.type === "bv"){
					var a1=this.get_node(a).text.toLowerCase();
                    var b1=this.get_node(b).text.toLowerCase();
                    return a1>b1?1:-1;
				}
				else if(sortNodeA && sortNodeB && (this.get_node(a).id!=undefined) && (this.get_node(b).id)!=undefined){
                    var a1=this.get_node(a).id.toLowerCase();
                    var b1=this.get_node(b).id.toLowerCase();
                    return a1>b1?1:-1;
                }
            }
        }).on('loaded.jstree',function(e,data){//No I18N
        /*	$('#'+self.elementId+' .jstree').jstree("open_node",[$('#'+self.elementId+' .jstree > ul > li:first-child').attr("id")]);//No I18N
        	var childEle = $('#'+self.elementId+' .jstree > ul > li:first-child > ul > li:first-child');//No I18N
        	if(childEle!==undefined && childEle.length === 1){
        		$('#'+self.elementId+' .jstree').jstree("open_node",[$(childEle).attr("id")]);//No I18N
        	}*/
        	if(data.instance._cnt === 0){
        		if(self.get("isDashboardView")){ //No I18n
        			self.set('noData',true);//No I18N
        		}
        	} else{
        		self.set('noData',false);//No I18N
        	}

        	if(self.widgetId!==undefined){
        		setTimeout(function(){
        			dashcallbackNew(self.widgetId);
        		},100);
        	}
        }).on('open_node.jstree',function(e,data){//No I18N
        	if(self.widgetId!==undefined){
        		setTimeout(function(){
        			dashcallbackNew(self.widgetId);
        		},100);
        	}
		}).on('close_node.jstree',function(e,data){//No I18N    
			if(self.widgetId!==undefined){
        		setTimeout(function(){
        			dashcallbackNew(self.widgetId);
        		},100);
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

	        if(self.get('groupBy') !== 'virtualType' && self.get('groupBy') !== 'virtualHierarchy' && ((data.node.original.loaded !== undefined && data.node.original.loaded === false) || (data.node.original.loaded === undefined)))
	        {
		        
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
	  		}

		}).on('select_node.jstree',function(e,data){//No I18N
			var isSelected = false;
			if (selectedNodeId === data.node.id) {
				selectedNodeId = "";
		        data.instance.deselect_node(data.node);
		}else{
		        selectedNodeId = data.node.id;
		        if(data.node.original.groupType!==undefined && (data.node.original.groupType === "Apmservers" || data.node.original.groupType === "Apmmonitors")){
					return;
				}
		        $('#'+self.elementId+' .jstree').jstree("open_node",data.selected);//No I18N
		        isSelected = true;
		    }
		    if(data.node.original.type==="category" || (data.node.a_attr.type !== undefined && data.node.a_attr.type==="VirtualType") || data.node.original.type==="vendor" || data.node.original.type==="type" || data.node.original.type==="bv" ||  data.node.original.type==="probe" || data.node.original.type==="protocol" ||  data.node.original.type==="apps" || data.node.original.type==="poller" || data.node.original.type==="severity" ||  (data.node.original.type==="group" && data.node.original.groupType !== "interface" && data.node.original.groupType !== "Interface" && data.node.original.groupType !== "Ipsla")){//No I18N
		    	var deviceFilterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
		    	var VMFilterObj = JSON.parse(localStorage.getItem('VirtualfilterObj')); //No I18N
		    	if(deviceFilterObj===null){
		    		deviceFilterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.deviceFilterObj);
		    	}
		    	if(VMFilterObj===null){
		    		VMFilterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.VirtualfilterObj);
		    	}
				deviceFilterObj.category = deviceFilterObj.vendor = deviceFilterObj.type = deviceFilterObj.bv = deviceFilterObj.probe = deviceFilterObj.poller = deviceFilterObj.group = deviceFilterObj.protocol = deviceFilterObj.severity = deviceFilterObj.apps = [];
				var selectedData = subFilter = "";
				switch(data.node.original.type || data.node.a_attr.type)
				{
					case "category"://No I18N
						var cName = (data.node.original.id).split(/~_~(.*)/g);
						selectedData = cName[1];
						break;	
					case "vendor"://No I18N
						var vendorName = (data.node.original.id).split(/~_~(.*)/g);
						selectedData = vendorName[1];
						break;
					case "probe"://No I18N
						selectedData = data.node.original.probeName;
						subFilter = data.node.original.type;
						break;
					case "poller"://No I18N
						selectedData = data.node.original.pollerName;
						subFilter = data.node.original.type;
						break;	
					case "type"://No I18N
						var typeName = (data.node.original.id).split(/~_~(.*)/g);
						selectedData = typeName[1];
						subFilter = data.node.original.type;
						var parentCategory =  data.node.parent.split("~_~");//No I18N
						deviceFilterObj[parentCategory[0]] = [parentCategory[1]];
						break;
					case "VirtualType"://No I18N
						selectedData = data.node.a_attr.uniqueName;
						var parentCategory =  data.node.parent.split("~_~");//No I18N
						VMFilterObj['selectedVTypes'] = [selectedData];
						localStorage.setItem('VirtualfilterObj',JSON.stringify(VMFilterObj));//No I18N
						break;
					case "bv"://No I18N
						var bvName = data.node.original.id;
						if(data.node.original.bvName !== undefined)
						{
							bvName = data.node.original.bvName;
						}
						selectedData = (bvName).split("_bv")[0];//No I18N
						subFilter = "BV";//No I18N
						break;
					case "group"://No I18N
						selectedData = (data.node.original.groupName);
						subFilter = "Group";//No I18N
						break;
					case "protocol"://No I18N
						var cName = (data.node.original.id);
						selectedData = cName;
						break;
					case "apps"://No I18N
						var cName = (data.node.original.id).split(/~_~(.*)/g);
						selectedData = cName[1];
						subFilter = "apps";//No I18N
						break;
					case "severity"://No I18N
						selectedData = (data.node.original.id);
						break;
				}
				if(isSelected || self.isDashboardView){
					deviceFilterObj[data.node.original.type] = [selectedData];
					deviceFilterObj.subFilter = subFilter;
				}
		    	localStorage.setItem('filterObj',JSON.stringify(deviceFilterObj));//No I18N
		    	if(self.isDashboardView){
		    		if(self.get('groupBy')==='category' || self.get('groupBy')==='virtualType' || self.get('groupBy')==='vendor' || self.get('groupBy')==='bv' || self.get('groupBy')==='probe' || self.get('groupBy')==='poller' || self.get('groupBy')==='group'){//No I18N
		    			updateLocalStorageValue("opmSummary_Devices","selectedTreeFilter",self.get('groupBy'));//No I18N
		    		}
		    		redirectToInventorySub('Summary/Devices');//No I18N
		    	}
		    	if(subFilter!=="BV"){//No I18N
		    		opm_loadDevicesBarChartData('inventory',true,true);//No I18N
		    	}
		    	if(!self.isDashboardView){

					if (self.get('groupBy')==='virtualType') {
						loadDevicesListIntoGrid('Virtual','all');//No I18N
					}
					else if(!isSelected && OPMClient.InventoryDeviceDetailsController.invenSubTabType === "GROUP")
					{
						opm_listAllGroups(true);
					}
					else 
					{
						loadDevicesListIntoGrid();
					}
		    	}
		    }else if(data.node.original.type==="device"){//No I18N		    	
		    	if(window.OPM.isDeviceTreeExpanded !== undefined && window.OPM.isDeviceTreeExpanded && data.node.original.grpByNameID !== undefined && (self.get('groupBy') === "group" || self.get('groupBy') === "bv"))
		    	{		    		
		    		location.href = getDevSnapshotUrl(data.node.original.grpByNameID);
		    	}
		    	else
		    	{
		    		location.href = getDevSnapshotUrl(data.node.original.id);
		    	}		   
			}else if(data.node.original.type==="interface"){//No I18N
				OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringInterface"; //No I18N
				// window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(data.node.original.InterfaceName);

					if(window.OPM.isDeviceTreeExpanded !== undefined && window.OPM.isDeviceTreeExpanded && data.node.original.grpByNameID !== undefined)
		    	{		    		
		    		redirectToDeviceSnapshot(data.node.original.grpByNameID,'','MonitoringInterface'); //No I18N
		    	}
		    	else
		    	{
		    		redirectToDeviceSnapshot(data.node.original.id,'','MonitoringInterface'); //No I18N
		    	}				
			}else if(data.node.a_attr.type !== undefined && data.node.a_attr.type==="device"){//No I18N
				location.href = getDevSnapshotUrl(data.node.a_attr.deviceName);
			}else if(data.node.original.type !== undefined && data.node.original.type==="ipsla"){//No I18N
				var monType = data.node.original.monitorType;
				var devName = data.node.original.probeId;
				if(monType ==="voip"){
					monType = "IPSLAVoIP"; //No I18N
				}
				else if(monType ==="video"){
					monType = "IPSLAVideo"; //No I18N
				}else{
					monType = "IPSLAWAN"; //No I18N
				}
				location.href =  window.OPM.apiclientUrl+"Inventory/Snapshot/"+monType+"/"+devName; //No I18N
			}
			else if(data.node.original.type === "apmservers" || data.node.original.type === "apmmonitors"){
				var resourceId = (data.node.original.id).split("APM_")[1];    
		        if(window.OPM.isCentralServer || window.OPM.isProbe)
		        {
		            resourceId = (resourceId).split(".")[0];    
		        }
		        if(resourceId !== undefined)
		        {
		            redirectToAPMMonitor(resourceId);
		        }else{return;}

			}
		});

		}
	//	}
	},
	groupByObserver:function(){
		this.rerender();
	}.observes('groupBy'),//No I18N
	treeRenderObserver:function(){
		var self = this;
		/*$('#'+self.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+self.elementId+' .jstree').jstree({//No I18N
		    "plugins":["sort","search","contextmenu"],//No I18N
		    "contextmenu":{//No I18N
		    	"select_node":false,//No I18N
		    	"items":function(node){//No I18N
		    		if(node.a_attr.type === "group"){//No I18N
		    			return{
		    				"JumpTo":{//No I18N
		    					"label":Ember.I18n.t("webclient.opm.jumpto.snapshot",this),//No I18N
		    					"icon":"popoutImg",//No I18N
		    					"action":function(obj){//No I18N
		    						redirectotGroupsSnapshot(node.a_attr.groupName,node.a_attr.groupType);
		    					}
		    				}
		    			}
		    		}
		    	}
		    },
		    "core": {//NO I18N
                'data': self.get('response') //NO I18N
            }, 
            sort:function (a, b) {//NO I18N
            	var selNodeA = this.get_node(a);
            	var selNodeB = this.get_node(b);
            	var sortNodeA = (selNodeA!==undefined && selNodeA.a_attr!==undefined && selNodeA.a_attr.type==="device")?false:true;//No I18N
            	var sortNodeB = (selNodeB!==undefined && selNodeB.a_attr!==undefined && selNodeB.a_attr.type==="device")?false:true;//No I18N
                if(sortNodeA && sortNodeB && (this.get_node(a).id!=undefined) && (this.get_node(b).id)!=undefined){
                    var a1=this.get_node(a).id.toLowerCase();//NO I18N
                    var b1=this.get_node(b).id.toLowerCase();//NO I18N
                    return a1>b1?1:-1;
                }
            }
        }).on('loaded.jstree',function(e,data){//No I18N
        	$('#'+self.elementId+' .jstree').jstree("open_node",[$('#'+self.elementId+' .jstree > ul > li:first-child').attr("id")]);//No I18N
        	var childEle = $('#'+self.elementId+' .jstree > ul > li:first-child > ul > li:first-child');//No I18N
        	if(childEle!==undefined && childEle.length === 1){
        		$('#'+self.elementId+' .jstree').jstree("open_node",[$(childEle).attr("id")]);//No I18N
        	}
        	if(self.widgetId!==undefined){
        		setTimeout(function(){
        			dashcallbackNew(self.widgetId);
        		},100);
        	}
        }).on('open_node.jstree',function(e,data){//No I18N
        	if(self.widgetId!==undefined){
        		setTimeout(function(){
        			dashcallbackNew(self.widgetId);
        		},100);
        	}
		}).on('close_node.jstree',function(e,data){//No I18N       	
			if(self.widgetId!==undefined){
        		setTimeout(function(){
        			dashcallbackNew(self.widgetId);
        		},100);
        	}
		}).on('select_node.jstree',function(e,data){//No I18N
			var isSelected = false;
			if (selectedNodeId === data.node.id) {
				selectedNodeId = "";
		        data.instance.deselect_node(data.node);
		    }else{
		        selectedNodeId = data.node.id;
		        $('#'+self.elementId+' .jstree').jstree("open_node",data.selected);//No I18N
		        isSelected = true;
		    }

		    if(data.node.a_attr.type==="category" || data.node.a_attr.type==="VirtualType" || data.node.a_attr.type==="vendor" || data.node.a_attr.type==="type" || data.node.a_attr.type==="bv" ||  data.node.a_attr.type==="probe" ||  (data.node.a_attr.type==="group" && data.node.a_attr.groupType !== "interface" && data.node.a_attr.groupType !== "Interface" && (data.node.a_attr.isDevicePresent === undefined || data.node.a_attr.isDevicePresent !== "false"))){//No I18N
		    	var deviceFilterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
		    	var VMFilterObj = JSON.parse(localStorage.getItem('VirtualfilterObj')); //No I18N
		    	if(deviceFilterObj===null){
		    		deviceFilterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.deviceFilterObj);
		    	}
		    	if(VMFilterObj===null){
		    		VMFilterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.VirtualfilterObj);
		    	}
				deviceFilterObj.category = deviceFilterObj.vendor = deviceFilterObj.type = deviceFilterObj.bv = deviceFilterObj.probe = deviceFilterObj.group = [];

				var selectedData = subFilter = "";
				switch(data.node.a_attr.type)
				{
					case "category"://No I18N
					case "vendor"://No I18N
					case "probe"://No I18N
						selectedData = data.node.a_attr.uniqueName;
						subFilter = data.node.a_attr.type;
						break;
					case "type"://No I18N
						selectedData = data.node.a_attr.uniqueName;
						subFilter = data.node.a_attr.type;
						var parentCategory =  data.node.parent.split("_");//No I18N
						deviceFilterObj[parentCategory[0]] = [parentCategory[1]];
						break;
					case "VirtualType"://No I18N
						selectedData = data.node.a_attr.uniqueName;
						var parentCategory =  data.node.parent.split("_");//No I18N
						VMFilterObj['selectedVTypes'] = [selectedData];
								    	localStorage.setItem('VirtualfilterObj',JSON.stringify(VMFilterObj));//No I18N

						break;
					case "bv"://No I18N
						selectedData = (data.node.a_attr.bvName).split("_bv")[0];//No I18N
						subFilter = "BV";//No I18N
						break;
					case "group"://No I18N
						selectedData = (data.node.a_attr.groupName);
						subFilter = "Group";//No I18N
						break;
				}
				if(isSelected || self.isDashboardView){
					deviceFilterObj[data.node.a_attr.type] = [selectedData];
					deviceFilterObj.subFilter = subFilter;
				}
		    	localStorage.setItem('filterObj',JSON.stringify(deviceFilterObj));//No I18N
		    	if(self.isDashboardView){
		    		if(self.get('groupBy')==='category' || self.get('groupBy')==='virtualType' || self.get('groupBy')==='vendor' || self.get('groupBy')==='bv' || self.get('groupBy')==='probe' || self.get('groupBy')==='group'){//No I18N
		    			updateLocalStorageValue("opmSummary_Devices","selectedTreeFilter",self.get('groupBy'));//No I18N
		    		}
		    		redirectToInventorySub('Summary/Devices');//No I18N
		    	}
		    	if(subFilter!=="BV"){//No I18N
		    		opm_loadDevicesBarChartData('inventory',true,true);//No I18N
		    	}
		    	if(!self.isDashboardView){

					if (self.get('groupBy')==='virtualType') {
						loadDevicesListIntoGrid('Virtual','all');//No I18N
					}
					else if(!isSelected && OPMClient.InventoryDeviceDetailsController.invenSubTabType === "GROUP")
					{
						opm_listAllGroups(true);
					}
					else 
					{
						loadDevicesListIntoGrid();
					}
		    	}
		    }else if(data.node.a_attr.type==="device"){//No I18N
				location.href = getDevSnapshotUrl(data.node.a_attr.deviceName);
			}else if(data.node.a_attr.type==="Interface"){//No I18N
				OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringInterface"; //No I18N
				// window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(data.node.a_attr.InterfaceName);
				redirectToDeviceSnapshot(data.node.a_attr.InterfaceName,'','MonitoringInterface'); //No I18N
			}
		});*/
	}.observes('response'),//No I18N
	willDestroyElement: function(){
		$('#'+this.elementId+' .jsTreeType1').addClass('dashBoardTreeView');//No I18N
		$('#'+this.elementId+' .jstree').jstree('destroy');//No I18N
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});

OPMClient.SslCertificateImportComponent = Ember.Component.extend({
	templateName: "components/Ssl-Certificate-Import", //No I18n
	isURL:true,
	showServerKey:false,
	storePass:'',
	fetchMode:true,
	urlAddress:'',
	urlData:{},
	urlInputDisable:false,
	intermediateCertificate:[{inputName:'IntermediateCertificateID1',noRemoveIcon:true}], //No I18N
	showInterCert: false,
	fileCount:1,
	sslKadavuchol:'',
	keystoreFetchMode:true,
	blockImportCert: false,
	aliasList:[],
	aliasSelectState:false,
	showCertTypeSelection: true,

	clearCertificateSelections: function(){
		this.set('showServerKey',false);//No I18N
        this.set('showInterCert',false);//No I18N
        this.set('sslKadavuchol','');//No I18N
        this.set('isAliasAll',true);//No I18N
        this.set('aliasName','');//No I18N
        this.set('keystoreFetchMode',true);//No I18N
        this.set('aliasList',[]);//No I18N
        this.set('blockImportCert',false);//No I18N
        this.set('storePass','');//No I18N
        this.set('intermediateCertificate',[{inputName:'IntermediateCertificateID1',noRemoveIcon:true}]);//No I18N
        this.set('aliasSelectState',false);//No I18N
        $('#importCertificate').val('');
        $('#importCertificate').closest('.fileUpload').find('.fileUploadTxt').text('');
	},
	clearUrlSelections: function(){
		this.set('fetchMode',true);//No I18N
		this.set('urlInputDisable',false);//No I18N
		this.set('urlData',{});//No I18N
		this.set('urlAddress','');//No I18N
		this.set('isURL',true);//No I18N
	},
	resetSelections: function(){
		this.clearCertificateSelections();
		this.clearUrlSelections();
	},
	actions:{
		fetchFromType: function(){
     		this.set('isURL',!this.get('isURL'));//No I18N
     	},
     	uploadCertificate:function(inputId){
     		$('#'+inputId).closest('.fileUpload').find('.fileUploadTxt').text('');
		    var filename = $("#"+inputId).val();
		    if(filename!=""){
			    var theSplit = filename.split('\\');
		        var fileExt = getFileExt(theSplit[theSplit.length-1]);
		        var fileSize = document.getElementById(inputId).files[0].size;
		        var fieldsToValidate = {'custom':[{'condition':!opmFileExtensionCheckSSL(inputId), 'identifier':inputId, 'message':Ember.I18n.t('webclient.common.invalidFormat',this)},{'condition':((fileSize/1024)>10240), 'identifier':inputId, 'message':Ember.I18n.t('webclient.settings.security.filesize10mb',this)}]}; //No I18N
	    		var isValid = opm_validateFields(fieldsToValidate);
	    		if(!isValid){
		            $("#"+inputId).val('');
		        }
		        else{
		        	$("#"+inputId).closest('.fileUpload').find('.fileUploadTxt').text(theSplit[theSplit.length-1]);
		            if(fileExt === 'keystore' || fileExt === 'truststore' || fileExt === 'pfx' || fileExt === 'jks'){
		                this.set('showServerKey',true);//No I18N
		                this.set('showInterCert',false);//No I18N
		                this.set('sslKadavuchol','');//No I18N
		                this.set('isAliasAll',true);//No I18N
		                this.set('aliasName','');//No I18N
		            }else{
		            	this.set('showServerKey',false); //No I18N
		            	this.set('showInterCert',true);//No I18N
		            	this.set('fileCount',1);//No I18N
		            	this.set('intermediateCertificate',[{inputName:'IntermediateCertificateID1',noRemoveIcon:true}]);//No I18N
		            }
		        }   
		    } 
		},
		submitCert: function(){
			var importCertURL = window.OPM.apiUrlPattern + '/admin/importTrustedCertificates';//No I18N
			var certFile = $("#importCertificate").val();
			var fileType = getFileType(certFile);
			if(fileType==="one"){
				var fieldsToValidate = {'empty':['importCertificate','sslKadavuchol']};//No I18N
	    		var isValid = opm_validateFields(fieldsToValidate);
				if(isValid){
					importCertURL += '?uploadType=keystore'; //No I18N
					var response = opm_ajaxMultiPostRequest(importCertURL,getOutboundCertData(fileType,this.intermediateCertificate,this));
					if(response.isCertImported){
						this.clearCertificateSelections();
						if (OPMClient.InventoryOpUtilsController.getBacktoSnapshotPage) {
                            backToAddDHCP();
                        } else if(OPMClient.InventoryOpUtilsController.getBacktoAssociateDHCPPage){
                            backToAddDHCP('AssociateDHCP');//No I18N
                        }
						showMessage({'result':{'message':Ember.I18n.t('webclient.settings.ImportCertificate.certimportsuccess',this)}}); //No I18N
						if(this.get('importSuccessAction')) {
							this.get('parentView').send(this.get('importSuccessAction'));
						}
					}else{
						opm_infoMsgs("errorMsg",response.error.message);//No I18N
					}
				}
			}else if(fileType==="two"){//No I18N
        		var fieldsToValidate = {'empty':['importCertificate']};//No I18N
	    		var isValid = opm_validateFields(fieldsToValidate);
	    		if(isValid){
					importCertURL += '?uploadType=certificate'; //No I18N
					var response = opm_ajaxMultiPostRequest(importCertURL,getOutboundCertData(fileType,this.intermediateCertificate,this));
					if(response.isCertImported){
						this.clearCertificateSelections();
						if (OPMClient.InventoryOpUtilsController.getBacktoSnapshotPage) {
                            backToAddDHCP();
                        } else if(OPMClient.InventoryOpUtilsController.getBacktoAssociateDHCPPage){
                            backToAddDHCP('AssociateDHCP');//No I18N
                        } else if (OPMClient.InventoryOpUtilsController.getBacktoDNSSnapshotPage) {
                            backToAddDNS();
                        } else if (OPMClient.InventoryOpUtilsController.getBacktoAssociateDNSPage) {
                            backToAddDNS('AssociateDNS');//No I18N
                        }
						showMessage({'result':{'message':Ember.I18n.t('webclient.settings.ImportCertificate.certimportsuccess',this)}}); //No I18N
						if(this.get('importSuccessAction')) {
							this.get('parentView').send(this.get('importSuccessAction'));
						}
					}else{
						opm_infoMsgs("errorMsg",response.error.message); //No I18N
					}
				}
			}
		},
		addOneMoreInput: function(){
			if(this.intermediateCertificate.length===1){
				var firstInput = this.get('intermediateCertificate').get('firstObject');
				Ember.set(firstInput, "noRemoveIcon", false); //No I18N
			}
			this.set('fileCount',this.get('fileCount')+1); //No I18N
			this.intermediateCertificate.pushObject({'inputName':'IntermediateCertificateID'+this.fileCount});//No I18N
		},
		removeFile: function(id){
			var nameToRemove = this.intermediateCertificate.findBy('inputName', id);//No I18N
			this.intermediateCertificate.removeObject(nameToRemove);
			if(this.intermediateCertificate.length===1){
				var firstInput = this.get('intermediateCertificate').get('firstObject');
				Ember.set(firstInput, "noRemoveIcon", true);//No I18N
			}
		},
		fetchFromURL: function(){
			var fieldsToValidate = {'empty':['urlAddress'],'custom':[{'condition':!opm_httpsURLCHeck(this.urlAddress),'identifier':'urlAddress','message':Ember.I18n.t('webclient.settings.ImportCertificate.urlstart',this)}]}; //No I18N
	    	var isValid = opm_validateFields(fieldsToValidate);
	    	var self =this;
	    	if(isValid && this.urlAddress!==''){
	    		$.ajax({
	     			url:window.OPM.apiUrlPattern + '/admin/importCertificateForURL',//No I18N
	     			method:'POST',//No I18N
	     			async:true,
	     			self:self,
	     			data:{trustURL:this.urlAddress,importCert:false},
	     			success: function(jsonData){
	     				if(jsonData.certificateDetails!==undefined && jsonData.certificateDetails.message!==undefined){
	     					opm_infoMsgs('errorMsg',jsonData.certificateDetails.message);//No I18N
	     				}
	     				else if(jsonData.error===undefined){
	     					self.set('fetchMode',false);//No I18N
	     					self.set('urlInputDisable',true);//No I18N
	     					self.set('urlData',jsonData);//No I18N
	     					opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.settings.ImportCertificate.furtheraction')); //No I18N
	     				}
	     				else{
	     					if (OPMClient.InventoryOpUtilsController.getBacktoSnapshotPage) {
                                backToAddDHCP();
                            } else if(OPMClient.InventoryOpUtilsController.getBacktoAssociateDHCPPage){
                                backToAddDHCP('AssociateDHCP');//No I18N
                            } else if (OPMClient.InventoryOpUtilsController.getBacktoDNSSnapshotPage) {
                                backToAddDNS();
                            } else if (OPMClient.InventoryOpUtilsController.getBacktoAssociateDNSPage) {
                                backToAddDNS('AssociateDNS');//No I18N
                            }
	     					showMessage(jsonData);
	     				}
	     			}
	     		});
	    	}
		},
		importCert: function(){
			var self =this;
			$.ajax({
     			url:window.OPM.apiUrlPattern + '/admin/importCertificateForURL',//No I18N
     			method:'POST',//No I18N
     			async:true,
     			self:self,
     			data:{trustURL:this.urlAddress,importCert:true},
     			success: function(jsonData){
     				self.set('fetchMode',true);//No I18N
     				self.set('urlInputDisable',false);//No I18N
     				self.set('urlData',{});//No I18N
     				self.set('urlAddress','');//No I18N
     				if(jsonData.isCertImported){
     					opm_infoMsgs('successMsg',Ember.I18n.t('webclient.settings.ImportCertificate.urlsuccesscert',this));//No I18N
     				}
     				else{
     					opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.settings.ImportCertificate.urlfailcert',this));//No I18N
     				}
     			}
     		});
		},
		uploadCertificateManually : function(inputId){
			$("#"+inputId).closest('.fileUpload').find('.fileUploadTxt').text('');
			$("#"+inputId).removeClass('validateField error');
			var filename = $("#"+inputId).val();
			if(filename!==""){
				var theSplit = filename.split('\\');
				var fileSize = document.getElementById(inputId).files[0].size;
		        var fieldsToValidate = {'custom':[{'condition':!opmFileExtensionCheckSSL(inputId), 'identifier':inputId, 'message':Ember.I18n.t('webclient.common.invalidFormat',this)},{'condition':((fileSize/1024)>10240), 'identifier':inputId, 'message':Ember.I18n.t('webclient.settings.security.filesize10mb',this)}]}; //No I18N
	    		var isValid = opm_validateFields(fieldsToValidate);
	    		if(!isValid){
		            $("#"+inputId).val('');
		            $("#"+inputId).closest('.fileUpload').find('.fileUploadTxt').text('');
		        }
			    else{
		            $("#"+inputId).closest('.fileUpload').find('.fileUploadTxt').text(theSplit[theSplit.length-1]);
			    }  
			} 
     	},
     	aliasChange: function(){
     		this.set('isAliasAll',!this.get('isAliasAll'));//No I18N
     	},
     	clearUrl: function(){
     		this.clearUrlSelections();
     	},
     	fetchCert: function(){
     		var response = opm_ajaxMultiPostRequest(window.OPM.apiUrlPattern + '/admin/getAliasesFromKeystore',getOutboundCertData('one',this.intermediateCertificate,this)); //No I18N
     		if(response.error!==undefined){
     			showMessage(response);
     			this.set('aliasList',[]);//No I18N
     		}
     		else{
     			this.set('keystoreFetchMode',false);//No I18N
     			this.set('blockImportCert',true);//No I18N
     			this.set('aliasList',response);//No I18N
     			opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.settings.ImportCertificate.selectalias',this));//No I18N
     		}
     	},
     	resetFetchCert: function(){
     		this.clearCertificateSelections();
     	},
     	aliasSelectAll: function(){
     		if(this.aliasSelectState){
     			$('input[name="outAliasSelect"]').prop('checked',false);//No I18N
     			this.toggleProperty('aliasSelectState'); //No I18N
     		}
     		else{
     			$('input[name="outAliasSelect"]').prop('checked',true);//No I18N
     			this.toggleProperty('aliasSelectState'); //No I18N
     		}
     	}
	},
	willDestroyElement: function() {
		OPMClient.InventoryOpUtilsController.set('getBacktoSnapshotPage', false);//No I18N
        OPMClient.InventoryOpUtilsController.set('getBacktoAssociateDHCPPage', false);//No I18N
	}
});

OPMClient.AccordionGridGraphComponent = Ember.Component.extend({
	templateName: 'components/Accordion-Grid-Graph', //No I18n
	didInsertElement: function() {
		var model = this.get('model');
		if(model.tabs && model.tabs.length > 0) {
			this.send('accordionToggle', model.tabs[0].id); //No I18N		
		}
	},
	actions: {
		accordionToggle: function (id,displayName) {
			var self = this;
			supportAnalysisInstance.set('systemInfoController', this); //No I18N
			var model = this.get('model'); //No I18n
			for (var i = 0; i < model.tabs.length; i++) {
				var tab = model.tabs[i];
                if (id === tab.id) {
                    tab.isActive = !tab.isActive;
                    if (!tab.isActive) {
                        if (displayName !== undefined) {
                            if (supportAnalysisInstance.get('dispName') === undefined || supportAnalysisInstance.get('dispName') !== displayName) {
                                supportAnalysisInstance.set('dispName', displayName); //No I18n
                                tab.isActive = true;
                                break;
                            } else {
                                supportAnalysisInstance.set('dispName', undefined); //No I18n
                                $('#' + tab.id).removeClass('active');
                                $('#' + tab.id).siblings('.accordion1__cont').hide();
                                return;
                            }
                        } else {
                        	supportAnalysisInstance.set('dispName', undefined); //No I18n
                            $('#' + tab.id).removeClass('active')
                            $('#' + tab.id).siblings('.accordion1__cont').hide();
                            return;
                        }
                    } else {
                        if (displayName !== undefined) {
                            if (supportAnalysisInstance.get('dispName') === undefined || supportAnalysisInstance.get('dispName') !== displayName) {
                                supportAnalysisInstance.set('dispName', displayName); //No I18n
                                $('#' + tab.id).addClass('active')
                                $('#' + tab.id).siblings('.accordion1__cont').show();
                              
                                break;
                            } else{
                            	supportAnalysisInstance.set('dispName', undefined); //No I18n
	                            tab.isActive = false;
	                            return;
                        	}
                        } else {
                        	supportAnalysisInstance.set('dispName', undefined); //No I18n
                            $('#' + tab.id).addClass('active')
                            $('#' + tab.id).siblings('.accordion1__cont').show();
                            break;
                        }
                    }
				}
			}
			Ember.run.schedule('afterRender', function () { //No I18n        
				self.send('dataRender', id); //No I18n
			})
		},
		dataRender: function (id) {
			var self = this;
			var tabs = self.get('model.tabs'); //No I18n
			var ucvCentralCase = self.get("nonUCVCentral") && self.get("selectedProbe") && self.get("selectedProbe") !== "-1";
			$.each(tabs, function (key, value) {
				if (value.id === id) {
					if (value.id === 'systemOverview' && !value.serverResponseTime) {
						$.ajax({
							url: window.OPM.apiUrlPattern + '/diagnostics/getCurrentBuildNumber' + (ucvCentralCase ? ("?eeProbeID=" + self.get("selectedProbe")): ""), //No I18n
							method: 'GET', //No I18n
							async: false,
							startTime: new Date().getTime(),
							complete: function (response) {
								if(response.error) {
									showMessage(response);
									return;
								}
								value.serverResponseTime = new Date().getTime() - this.startTime + ' ' + Ember.I18n.t('opu.common.ms'); //No I18n
							}
						});
					}
					//TEMP PROBE ID HANDLING FOR NON UCV OPM CENTRAL
					if(ucvCentralCase) {
						var url = value.api
						var hasQueryParams = url.indexOf('?') > -1;
						var parameter = url.indexOf("eeProbeID=") > -1 ? false : 'eeProbeID=' + self.get("selectedProbe");
						if (hasQueryParams) {
							var urlWithoutParams = url.split('?')[0];
							var queryParams = url.split('?')[1];
							url = urlWithoutParams + '?' + (parameter ? parameter + '&' : '') + queryParams;
						} else {
							url = url +  (parameter ? '?' +parameter : '');
						}
						value.api = url;
					}
					//...//
					if(value.id !== "topMonitorsByInstance") {
						if (value.customFilter) {
							if(value.id==="EEDataTransferedStats") {
								var probeName = "All"; //No I18N
								value.data = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/diagnostics/' + value.api + value.customFilter.currentFilter+"&probeName="+probeName); //No I18n
							}
							else if (value.id==="EEIncomingStats"){
							    var type = "incomingRequests"; //No I18N
							    var probeName = "All"; //No I18N
                                value.data = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/diagnostics/' + value.api + value.customFilter.currentFilter+"&type="+type+"&probeName="+probeName); //No I18n
							}else {
								value.data = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/diagnostics/' + value.api + value.customFilter.currentFilter); //No I18n
							}
							if(value.data.error && value.data.error.message) {
								showMessage(value.data);
							}
							Array.isArray(value.data) ? value.data.shift() : value.data
							$('#' + value.customFilter.id).val(value.customFilter.currentFilter);
							$('#' + value.customFilter.id).select2();
							$('#' + value.customFilter.id).on('select2:open', function (e) {
								$('#' + value.customFilter.id).closest('.opmFormHolder').off("scroll.select2");
							});
							$('#' + value.customFilter.id).off('change').on('change', function () {
								value.customFilter.currentFilter = $('#' + value.customFilter.id).val();
								self.send('dataRender', value.id); //No I18n
							});
						}
						else if (!value.data) {
							value.data = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/diagnostics/' + value.api); //No I18n
							if(value.data.error && value.data.error.message) {
								showMessage(value.data);
							}
							if (!(value.id === 'systemOverview' || value.id === 'hardwareInfo' || value.id === 'hProfFiles' || value.id === 'mssqlInfo' || value.id === 'topMonitorsByInstance')) {
								Array.isArray(value.data) ? value.data.shift() : value.data
							}
							if (value.id === 'systemOverview') {
								value.data.push({ 'displayName': Ember.I18n.t('webclient.analyzer.serverResponseTime'), 'value': value.serverResponseTime, 'key': 'serverResponseTime' })
							}
						}
					}
					var colNames, colModel, chartObj;
					var defaultOptions = {
						searchOption: true,
						minRowsPerPage: 50
					}					
					switch (value.id) { // Switch case for individual table's col data.
						case 'systemOverview': { //No I18n
							colNames = [Ember.I18n.t('jsp.commonstr.Name'), Ember.I18n.t('jsp.commonstr.Value'), '', '']; //No I18n
							colModel = [
								{ name: 'displayName', index: 'displayName', formatter: cpuMemoryRedirectFormatter }, //No I18n
								{ name: 'value', index: 'value' }, //No I18n
								{ name: 'key', index: 'key', search: false, sortable: false, hidden: true }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
							defaultOptions.hideExcel = true;
							defaultOptions.hideCSV = true;
							colModel[1].formatter = systemInfoStatusFormatter;
						}; break;
						case 'hardwareInfo': {//No I18n                            
							colNames = [Ember.I18n.t('jsp.commonstr.Name'), Ember.I18n.t('jsp.commonstr.Value'), '', '']; //No I18n
							colModel = [
								{ name: 'displayName', index: 'displayName' }, //No I18n
								{ name: 'value', index: 'value' }, //No I18n
								{ name: 'key', index: 'key', search: false, sortable: false, hidden: true }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
							if (value.statusInfo) {
								colModel[1].formatoptions = value.statusInfo;
								colModel[1].formatter = systemInfoStatusFormatter;
							}
						} break;
						case 'mssqlInfo': { //No I18n
							colNames = [Ember.I18n.t('jsp.commonstr.Name'), Ember.I18n.t('jsp.commonstr.Value'), '', '']; //No I18n
							colModel = [
								{ name: 'displayName', index: 'displayName', formatter: cpuMemoryRedirectFormatter }, //No I18n
								{ name: 'value', index: 'value' }, //No I18n
								{ name: 'key', index: 'key', search: false, sortable: false, hidden: true }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
						}; break;
						case 'nfaFlowRateStats': //No I18n
						case 'fwaFlowRateStats': //No I18n
						case 'mssqlCpuUtil': //No I18n
						case 'mssqlMemoryUtil': //No I18n
						case 'systemCpuUtil': //No I18n
						case 'dbQueryStats': //No I18N
						case 'systemMemoryUtil': { //No I18n
							var y_axis_title = value.id === 'nfaFlowRateStats' ? Ember.I18n.t('nfa.flowCount') : value.id === 'fwaFlowRateStats' ? Ember.I18n.t('weblcient.analyzer.incomingRate') : value.id === "dbQueryStats" ? Ember.I18n.t('webclient.common.widgets.eventcount') : Ember.I18n.t('nfa.perc');
							chartObj = {
								id: value.graphID,
								type: 'area', //No I18n
								jsonData: value.id === 'nfaFlowRateStats' ? [value.data.chartData] : value.data.chartData,
								series: "multi", //No I18N
								height: 350,
								columns: {
									datatype_1: 'time', //No I18N
									datatype_2: 'numeric', //No I18N
									columnname_1: Ember.I18n.t('jsp.commonstr.Time'), //No I18N
									columnname_2: y_axis_title, //No I18N
									timeFormat: value.customFilter.currentFilter
								},
								axes: { //No I18N
									"rotated": false, //No I18N
									"xaxis": { //No I18N
										"label": { //No I18N
											"text": Ember.I18n.t('jsp.commonstr.Time') //No I18N
										},
										"ticklabel": {//No I18N
											"rotation": 'auto'//No I18N
										},
										"show": true//No I18N

									},
									"yaxis": [ //No I18N    
										{
											"label": { //No I18N    
												"text": y_axis_title //No I18n
											},
											"show": true//No I18N
										}
									]
								},
								chart: {
									stacked: false
								},
								area: { marker: true },
								bar: {
									rotated: false,
									levelMarker: true
								}
							}
						}; break;						
						case 'longQueries': { //No I18n
							colNames = [Ember.I18n.t('opu.general.QUERY'), Ember.I18n.t('webclient.reports.rightlist.StartTime'), Ember.I18n.t('opstor.inventory.job.timetakes') + ' (' + Ember.I18n.t('opu.common.ms') + ')', '']; //No I18n
							colModel = [
								{ name: '2', index: '2' }, //No I18n
								{ name: '0', index: '0' }, //No I18n
								{ name: '1', index: '1' }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
						}; break;
						case 'widPerDash': { //No I18n
							colNames = [Ember.I18n.t('webclient.tab.dashboard') + " " + Ember.I18n.t('jsp.commonstr.Name'), Ember.I18n.t('snap.clientsettings.widgets') + " " + Ember.I18n.t('webclient.common.widgets.eventcount'), '']; //No I18n
							colModel = [
								{ name: '0', index: '0' }, //No I18n
								{ name: '1', index: '1', sorttype: 'int' }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
							defaultOptions.minRowsPerPage = 25;
						}; break;
						case 'polledData': { //No I18n
							colNames = [Ember.I18n.t('protocol'), Ember.I18n.t('webclient.auditreport.period') + '(' + Ember.I18n.t('webclient.devices.intftypes.seconds') + ')', Ember.I18n.t('webclient.common.widgets.eventcount'), '']; //No I18n
							colModel = [
								{ name: '0', index: '0' }, //No I18n
								{ name: '1', index: '1', sorttype: 'int' }, //No I18n
								{ name: '2', index: '2', sorttype: 'int' }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
						}; break;
						case 'realTimeGraph': { //No I18n
							colNames = [Ember.I18n.t('protocol'), Ember.I18n.t('webclient.admin.url.edit.poll') + '(' + Ember.I18n.t('webclient.devices.intftypes.seconds') + ')', Ember.I18n.t('webclient.common.widgets.eventcount'), '']; //No I18n
							colModel = [
								{ name: '0', index: '0' }, //No I18n
								{ name: '2', index: '2', sorttype: 'int' }, //No I18n
								{ name: '1', index: '1', sorttype: 'int' }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
						}; break;
						case 'topMonitorsByInstance': { //No I18n
							colNames = [Ember.I18n.t('Device'), Ember.I18n.t('webclient.common.widgets.monitors') , Ember.I18n.t('webclient.Instance.Count'), '']; //No I18n
							colModel = [
								{ name: 'device', index: 'device', search: true}, //No I18n
								{ name: 'monitor', index: 'monitor', search: true}, //No I18n
								{ name: 'instanceCount', index: 'instanceCount', sorttype: 'int'}, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
							var grid = $('#' + value.contentID);
							if(grid[0].grid) {
								grid.jqGrid('setGridParam', { //No I18n
									datatype:'json'  //No I18n
								}).trigger("reloadGrid"); //No I18n
								return;
							}

							//Handled separately for Remote loading of data with pagination.
							grid.jqGrid({
								url: window.OPM.apiUrlPattern + '/diagnostics/getTopMonitorsByInstanceCount', //No I18n
								mtype:'GET', //No I18N
								datatype:"json", //No I18N
								colNames: escapeGridColumnNames(colNames), 
								colModel: colModel,
								pager: '#' + value.pagerID, //No I18N
								rowList: [10,50,100], //No I18N
								rowNum: 10,
								prmNames: {page: 'page', rows: 'rows',totalrows:null}, //No I18n
								viewrecords: true,
								gridview: true,
								autowidth: true,
								height: "auto", //No I18N
								autoencode: true,
								pagination: true,
								hidegrid: false,
								ignoreCase: true,
								shrinkToFit: true,
								search: true,
								jsonReader : {
									page: "page",//No I18N
									total: "total",//No I18N
									records: "records",  //No I18N
									repeatitems: false,//No I18N
									data:"data"//No I18N
							   	},  
								beforeRequest: function () {
									var postData = $('#' + value.contentID).jqGrid('getGridParam', 'postData');
									["sidx", "nd", "_search", "sord"].map(function(val){ //No I18n
										delete postData[val];
									});
								},
								onPaging: function() { //server side paging
									grid.jqGrid('setGridParam',{datatype: 'json'}); //No I18n
								},
								loadComplete: function (data) { //for handling client side sorting
									var $this = $(this);
									if ($this.jqGrid('getGridParam', 'datatype') === 'json') {
										$this.jqGrid('setGridParam', { //No I18n
											datatype: 'local', //No I18n
											data: data.rows,
											pageServer: data.page,
											recordsServer: data.records,
											lastpageServer: data.total
										});
										this.refreshIndex();								
										if ($this.jqGrid('getGridParam', 'sortname') !== '') {
											$this.trigger('reloadGrid'); //No I18n
										}
									} else {
										$this.jqGrid('setGridParam', { //No I18n
											page: $this.jqGrid('getGridParam', 'pageServer'), //No I18n
											records: $this.jqGrid('getGridParam', 'recordsServer'), //No I18n
											lastpage: $this.jqGrid('getGridParam', 'lastpageServer') //No I18n
										});
										this.updatepager(false, true);
									}
								}
							});
							grid.jqGrid('filterToolbar',{ stringResult: true, searchOnEnter: false}); //No I18n
							$("#topMonitorsByInstanceContent_id").show()
							$("#topMonitorsByInstanceContent_id").css({'position':'relative','left':'-50px'});
							$("#topMonitorsByInstanceContent_id>div").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ToggleSearch(true,\'#topMonitorsByInstanceContent\')" class="icon-search devsearchicon"></i></div>');
							ToggleSearch(false,'#topMonitorsByInstanceContent'); //No I18n
							return;
						};
						case 'top10devicemonitor': { //No I18n
							colNames = [Ember.I18n.t('Device'), Ember.I18n.t('webclient.common.widgets.monitors') + " " + Ember.I18n.t('webclient.common.widgets.eventcount'), '']; //No I18n
							colModel = [
								{ name: '0', index: '0', formatter: top10DevicesRedirect }, //No I18n
								{ name: '1', index: '1', sorttype: 'int' }, //No I18n
								{ name: 'id', index: 'id', search: false, sortable: false, hidden: true } //No I18n
							]
						}; break;
						case 'hProfFiles': { //No I18n
							colNames = [Ember.I18n.t('webclient.map.flash.Delete_fileName'), Ember.I18n.t('widget.mytickets.CreatedTime'), '']; //No I18n
							colModel = [
								{ 'name': 'FileName', 'index': 'FileName', search: true }, //No I18N
								{ 'name': 'CreatedTime', 'index': 'CreatedTime', search: false, sorttype: 'int' }, //No I18N			
								{ 'name': 'id', 'index': 'id', hidden: true, search: false } //No I18N
							]
						}; break;
						case 'mostExecutedQueries': { //No I18n
							colNames = [Ember.I18n.t('opu.general.QUERY'), Ember.I18n.t('webclient.common.widgets.eventcount'), '']; //No I18n
							colModel = [
								{ 'name': '1', 'index': '1', 'width': 70, search: true }, //No I18N
								{ 'name': '0', 'index': '0', 'width': 30, search: false, sorttype: 'int' }, //No I18N			
								{ 'name': 'id', 'index': 'id', hidden: true, search: false } //No I18N
							]
							defaultOptions.minRowsPerPage = 25;
							defaultOptions.pagination = true;
						}; break;
						case 'EEDataTransferedStats' : { //No I18N
							colNames = [Ember.I18n.t("webclient.admin.probes.probename",this), "",Ember.I18n.t("webclient.analyzer.ee.noofreqs",this),Ember.I18n.t("webclient.analyzer.ee.rtt",this)]; //No I18n
							colModel = [
								{'name':'0', 'index':'0', formatter:EEDataTransferedStatsLink}, //No I18N
								{'name':'1', 'index':'1', hidden:true}, //No I18N
								{'name':'2', 'index':'2', sorttype:'int'}, //No I18N
								{'name':'3', 'index':'3', sorttype:'int'} //No I18N
							]
							defaultOptions.minRowsPerPage = 25;
							defaultOptions.pagination = true;
						}; break;
						case 'EEIncomingStats' : { //No I18N
                            colNames = [ "",Ember.I18n.t("webclient.admin.probes.probename",this),Ember.I18n.t("webclient.analyzer.ee.noofreqs",this),Ember.I18n.t("webclient.analyzer.ee.totalsize",this),Ember.I18n.t("webclient.analyzer.ee.maxsize",this)]; //No I18n
                            colModel = [
                                {'name':'0', 'index':'0', hidden:true}, //No I18N
                                {'name':'1', 'index':'1'}, //No I18N
                                {'name':'2', 'index':'2', sorttype:'int'}, //No I18N
                                {'name':'3', 'index':'3'}, //No I18N
                                {'name':'4', 'index':'4'} //No I18N
                            ]
                            defaultOptions.minRowsPerPage = 25;
                            defaultOptions.pagination = true;
                        }; break;
					} //End Switch Case

					self.set('model.tabs', tabs); //No I18n
					if (value.graphID) {
						zChart({ 'placeholder': [value.graphID], 'chartobj': [chartObj] });
					}
					else {
						if(value.id==="EEDataTransferedStats") {
							$("#"+value.contentID).jqGrid('GridUnload');//no i18n
							self.set('fileMetrics',value.data.fileMetrics); //No I18N
							self.set('TimeInterval',value.data.TimeInterval); //No I18N
							opm_loadJQgridWithData('#' + value.contentID, value.data.data, colNames, colModel, '', '#' + value.pagerID, '', defaultOptions);
						}
						else if(value.id==="EEIncomingStats") {
                            $("#"+value.contentID).jqGrid('GridUnload');//no i18n
                            self.set('pendingFiles',value.data.pendingFiles); //No I18N
                            self.set('TimeInterval',value.data.TimeInterval); //No I18N
                            opm_loadJQgridWithData('#' + value.contentID, value.data.data, colNames, colModel, '', '#' + value.pagerID, '', defaultOptions);
                        }else {
							$("#"+value.contentID).jqGrid('GridUnload');//no i18n
							Ember.run.schedule("afterRender", function() { //No I18N
								opm_loadJQgridWithData('#' + value.contentID, value.data, colNames, colModel, '', '#' + value.pagerID, '', defaultOptions);
							});
						}
					}
					return false;
				}
			});
		}
	},
	refreshChildFun: function() {
		supportAnalysisInstance.set('systemInfoController',undefined); //No I18n
		this.rerender();
	}.observes("refreshChild") //No I18n
})

OPMClient.ContextPopOverComponent = Ember.Component.extend({
	templateName: "components/context-pop-over", //No I18n
	attribChange: function() {
		var title = OPMClient.ApplicationController.popOverAttributes.title;
		var list = OPMClient.ApplicationController.popOverAttributes.list;
		var emptyMessage = OPMClient.ApplicationController.popOverAttributes.emptyMessage;
		this.set('title', title); //No I18n
		this.set('list', list);//No I18n
		this.set('emptyMessage', emptyMessage);//No I18n
	}.observes('popOverAttributes') //No I18n
});

OPMClient.AddEditCustomerComponent = Ember.Component.extend({
	templateName: 'components/add-edit-customer', //No I18N
	customerID: '',
	didInsertElement: function() {
		var mailconfigured = isMailServerConfigured();
		OPMClient.ApplicationController.set('isMailServerNotConfigured',!mailconfigured);//No I18N
		this.set('repImgForUpload', '/apiclient/fluidicv2/img/opmanager_logo_report.gif?_='+Date.now()); //No I18N
		if(this.get('customerID')) {
			this.propertyDidChange('customerID'); //No I18N
		}
	},
	customerEdit: function () {
		var self = this;
		var customerID = this.get('customerID'); //No I18N
		if(!customerID) {
			this.set('content', {}); //No I18N
			return;
		}
		var cusDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getCustomerInfo', { CustomerID: this.get('customerID') }); //No I18N
		this.set('content', cusDetails); //No I18N
		if(cusDetails.repImgForUpload) {
			this.set('repImgForUpload', cusDetails.repImgForUpload); //No I18N
		}
	}.observes('customerID'), //No I18N
	actions: {		
		addCustomer: function () {
			var gettingStarted = this.get('gettingStarted');			
			var customerID = addOrUpdateCustomer(this.get('customerID'), gettingStarted);
			if(gettingStarted && customerID) {
				OPMClient.ApplicationController.set('customerNameList', getCustomerNameList()); //No I18N
				this.get('parentView').send(this.get('action'), {stepNo:'2a', customerID: customerID, customerName: $('#customerName').val()});//No I18N
				return;
			}
		},
		cancelCustomer: function () {
			opm_transitionToTheRoute('Settings.Configurations.Customer.Index'); //No I18N
		}
	},
	keyPress: function(e){
		if($('.numberCheck').is(":focus")){//No I18N
			return opm_isNumber(e);
		}
	}
});

OPMClient.AddEditProbeComponent = Ember.Component.extend({
	templateName: 'components/add-edit-probe', //No I18N
	didInsertElement: function() {
		this.set('content', {proxyEnabled: false}); //No I18N
		if(this.get('probeName')) {
			this.propertyDidChange('probeName'); //No I18N
		}
		else if(this.get('customerID')) {
			this.propertyDidChange('customerID'); //No I18N
		}
	},
	probeNameEdit: function() {
		var probeName = this.get('probeName');
		var customerID = this.get('customerID');
		var gettingStarted = this.get('gettingStarted');
		if(probeName || customerID) {
			var probeDetails = probeName ? opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/enterprise/getProbeDetails',{ probeName: probeName }) : opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getProbeInfo', {CustomerID: customerID}); //No I18N
			if(probeDetails && !$.isEmptyObject(probeDetails)) {
				this.set('editProbe', true); //No I18N
				probeDetails.probeName = probeName ? probeName : probeDetails.ProbeName;			
				probeDetails.disableFields = probeName ? probeName : probeDetails.ProbeName;		
				if(probeDetails.proxyHost) {
					probeDetails.proxyEnabled = true;
				}
				this.set('content', probeDetails); //No I18N
				customerID = probeDetails.CustomerID; //No I18N
			} 
		}
		else {			
			this.set('content', {proxyEnabled: false}); //No I18N
		}
		Ember.run.schedule('afterRender', function() { //No I18N
			$('#addProbeCustomerSelect').val(customerID); //No I18N
			$('#addProbeCustomerSelect').select2(); //No I18N
			if(gettingStarted) {
				$('#addProbeCustomerSelect').attr('disabled', true); //No I18N
			}
		});
	}.observes('probeName', 'customerID'), //No I18N
	actions: {
		addEditProbe: function () {
			var probeDetails = this.get('content');
			var validateFields = {'empty':['addProbeName'], 'spclCharProbeName': ['addProbeName'], 'maxCheck': {'addProbeName': 15}}; //No I18N			
			if (probeDetails.proxyEnabled) {
				validateFields.empty.push('addProbeHost', 'addProbePort');
				validateFields.port = ['addProbePort'];
			}
			if (!opm_validateFields(validateFields)) {
				return false;
			}
			var data = {
				"probeName": probeDetails.probeName, //No I18N
				"CustomerID": $('#addProbeCustomerSelect').val(), //No I18N
				"proxyEnabled": probeDetails.proxyEnabled //No I18N
			}
			if (data.proxyEnabled) {
				data.proxyHost = probeDetails.proxyHost;
				data.proxyPort = probeDetails.proxyPort;
				data.proxyUserName = probeDetails.proxyUserName;
				data.proxyPassword = probeDetails.proxyPassword;
				data.noproxyhostlist = probeDetails.noproxyhostlist;
			}
			var url = window.OPM.apiUrlPattern;
			if(this.get('editProbe')) {
				url+= '/enterprise/updateProbeDetails'; //No I18n
				delete data.CustomerID;
				data.displayName=probeDetails.displayName;
			}
			else {
				data.probeName=probeDetails.displayName;
				url+= '/admin/addProbe'; //No I18n
			}
			var response = opm_ajaxPostRequest(url, data); //No I18N
			if (response !== undefined && response.result !== undefined) {
				if(this.get('gettingStarted')) {
					var probeName = response.result.probeName;
					var probeDisplayName = response.result.probeDisplayName;
					if(probeDetails.lastContact == undefined) {
						var probedetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/enterprise/getProbeDetails',{ probeName: probeName }); //No I18N
						probeDetails.lastContact = probedetails.lastContact;
					}
					this.get('parentView').send(this.get('action'), {stepNo:'2b', probeName: probeName, probeDisplayName: probeDisplayName, lastContact: probeDetails.lastContact});//No I18N
					return;
				}
				opm_infoMsgs("successMsg", response.result.message);//No I18N
				opm_transitionToTheRoute('Settings.Configurations.Customer.Index');//No I18N
				getCustomerNameList();
				Ember.run.schedule("afterRender", function() {//No I18N
					OPMClient.__container__.lookup("router:main")._activeViews['Settings.Configurations.Customer.Index'][0].send("toggleTabs",'Probe');//No I18N
				});
			} else if (response !== undefined && response.error !== undefined) {
				opm_infoMsgs("errorMsg", response.error.message);//No I18N
			}
		},
		goToProbeDetails: function () { //No I18N
			opmGlobalRoute.transitionTo('Settings.Configurations.Customer.Index'); //No I18N
			if(this.get('editProbe')) {
				Ember.run.schedule("afterRender", function() {//No I18N
					OPMClient.__container__.lookup("router:main")._activeViews['Settings.Configurations.Customer.Index'][0].send("toggleTabs",'Probe');//No I18N
				});
			}
		},
		gettingStartedBack: function() {
			this.get('parentView').send(this.get('action'), {stepNo:'1'}); //No I18N
		}
	}
}); 

OPMClient.ContextPopOverComponent = Ember.Component.extend({
	templateName: "components/context-pop-over", //No I18n
	attribChange: function() {
		var popObj = OPMClient.ApplicationController.popOverAttributes; 
		this.set('title', popObj.title); //No I18N
		this.set('list', popObj.list); //No I18N
		this.set('paragraph', popObj.paragraph); //No I18N
	}.observes('popOverAttributes') //No I18N
});

OPMClient.OpmAlarmsSummaryDetailsComponent = Ember.Component.extend({
	templateName: "components/opm-alarms-summary-details",//No I18N
	classNames:['heightAuto'],
	didInsertElement : function(){
		var self = this;
		var rowData = this.get('rowData');
		var ncmEvent = false;
		if(rowData!==undefined) {
			var displayTechnician = rowData.who;
			if(rowData.eventtype.startsWith("NCM")){
				ncmEvent = true;
			}
			if(rowData.who !== "Unacknowledge")
			{
				$('.unacknowledge').show();
			} else {
				displayTechnician = Ember.I18n.t('webclient.alarm.unackalarms',this);//No I18N
				$('.acknowledge').show();
			}
			self.set("displayTechnician",displayTechnician);//No I18N
			self.set("ncmEvent",ncmEvent);//No I18N
			opm_tooltip();
			if(rowData.category==="MailServer") {
				Ember.run.schedule("afterRender", function() { //No I18n
					$('i.ping,i.traceRoute').hide();
					$('#TabHolder li.Traffic').hide();//No I18N	
					$('#TabHolder li.WorkFlow').hide();//No I18N
					var alarmTitleElement = $("#alarmShortSummary .CatTechSev").children().first(".cursorPointer");
					if(rowData.category == "MailServer" && window.OPM.isAllModulesFullAccessAdmin) {
						alarmTitleElement.attr("onclick", 'opm_transitionToTheRoute(\"Settings.Basic.Mail\");'); //NO I18n
					} else {
						alarmTitleElement.removeAttr("onclick").removeClass("cursorPointer"); //NO I18n
					}
				})
			}
		}
	},summaryDataObserver: function(){
		this.rerender();
	}.observes('rowData'), //No I18N
	actions:{
		showDeviceDownInfo: function()
		{
			opm_pingDevice($('.OpMToolBar'),$('.OpMToolBar .content .mCSB_container'),OPMClient.AlarmDetailsController.alarmDetails.source,'AlarmSnapshotForInfo'); //No I18n 
		}
	}
});

OPMClient.OpmStackTopoMapComponent = Ember.Component.extend({
	templateName: "components/opm-stack-topomap",//No I18N
	didInsertElement : function(){
		var self = this;
		self.set('internetStatus',true); //No I18n
		$('.spinner-loader').show();
		var networkId=this.get('widgetData').id;//No I18N
		var currentWidgetData = this.widgetData;
		var container = document.getElementById("topoMapWidget");
		var jsonData = currentWidgetData.apiData;

		if(jsonData.Devices != undefined && jsonData.Devices.length >0 ){
			this.set('widgetData.sizey',17);//No I18N
			var mapOptions = {
				physics: false,
				autoResize:false,
				nodes: {
				  shape: "dot",//No I18N
				  size: 20,
				  font: {
					size:13,
					face: "LatoRegular"//No I18N
				  },
				  borderWidth:0.3
				},
				edges: {
				  width: 2,
				  color:"#afafaf",//No I18N
				  length: 5
				},
				interaction:{
					dragNodes:false,
				  dragView:false,
					zoomView:false
				}
			  };

			if((jsonData.isDualLinkMap !==undefined && jsonData.isDualLinkMap === 'true') || jsonData.Devices.length >10){
				//For dual link connect or more than 10 nodes with single connection, map handled dynamically 
				mapOptions.edges.arrows = 'to'; //No I18N
				var nodes = [];
				var nodeX = 10;
				var nodeY = -50;
				var nodeXInc = jsonData.Devices.length > 6? 100:200; 
				$.each(jsonData.Devices,function(key,dobj){
					var nodeLabel = opm_escapeHTML(dobj.label);
					var label = nodeLabel.length > parseInt(10)?(nodeLabel.substring(0,parseInt(10))+"..."):nodeLabel;
					var nodeTitle =opm_parseElmTitleTxt("<b>"+Ember.I18n.t('jsp.commonstr.Name',this)+" : </b>"+nodeLabel+"</br><b>"+Ember.I18n.t('webclient.devices.details.mac',this)+" : </b>"+dobj.macaddress+"</br><b>"+Ember.I18n.t('opu.views.ROLE',this)+" : </b>"+dobj.role+"</br><b>"+Ember.I18n.t('opstor.inventory.state',this)+" : </b>"+dobj.state); //No I18N
					nodes.push({'id':dobj.objName,'name':dobj.objName,'color':dobj.color,'label':label,'title':nodeTitle,'x':nodeX,'y':nodeY});//No I18N
					nodeX = nodeX+nodeXInc;
				});
				var edges = [];
				$.each(jsonData.linkDetails,function(key,lobj){
					var statusStr = lobj.linkStatus === 0?Ember.I18n.t('webclient.devices.intftypes.down',this):Ember.I18n.t('webclient.devices.intftypes.up',this);//No I18N
					var edgeTitle =opm_parseElmTitleTxt("<b> "+Ember.I18n.t('webclient.map.linkstatus',this)+" : </b>"+statusStr+"<br/><b>"+Ember.I18n.t('webclient.fault.event.displayName',this)+" : </b>"+lobj.source+"</br><b>"+Ember.I18n.t('webclient.ipsla.rttDashboard.Destination',this)+" : </b>"+lobj.dest); //No I18N
					edges.push({'from':lobj.source,'to':lobj.dest,smooth:{'type':"curvedCW",'roundness':0.3},'title':edgeTitle}); //No I18N
				});
				$.each(jsonData.linkDetails,function(k,Obj){
					var isdahsedEdge = false;
					if(Obj.linkStatus === 0){
						isdahsedEdge = true;
					}
					edges[k].dashes = isdahsedEdge;
				})
			}else{ 
				mapOptions.edges.arrows = ({'to':{'enabled':false}}); //No I18N
				var nodes = [
					{ id: 0,x:-400,y:-50,hidden:true,labelPosition:String(4)},
					{ id: 1,x:-300,y:-120,hidden:true,labelPosition:String(2)},
					{ id: 2,x:-200,y:-120,hidden:true,labelPosition:String(2)},
					{ id: 3,x:-100,y:-120,hidden:true,labelPosition:String(2)},
					{ id: 4,x:0,y:-120,hidden:true,labelPosition:String(2)},
					{ id: 5,x:100,y:-50,hidden:true,labelPosition:String(2)},
					{ id: 6,x:0,y:20,hidden:true,labelPosition:String(7)},
					{ id: 7,x:-100,y:20,hidden:true,labelPosition:String(7)},
					{ id: 8,x:-200,y:20,hidden:true,labelPosition:String(7)},
					{ id: 9,x:-300,y:20,hidden:true,labelPosition:String(7)},
					{ id: 10,x:-300,y:20,hidden:true,labelPosition:String(7)}
				  ]; 
	  
				  var edges = [
					{ from: 0, to: 1 ,smooth:{type:"curvedCW",roundness:0.2}},//No I18N
					{ from: 1, to: 2},
					{ from: 2, to: 3},
					{ from: 3, to: 4},
					{ from: 4, to: 5,smooth:{type:"curvedCW",roundness:0.2}},//No I18N
					{ from: 5, to: 6,smooth:{type:"curvedCW",roundness:0.2}},//No I18N
					{ from: 6, to: 7},
					{ from: 7, to: 8},
					{ from: 8, to: 9 },
					{ from: 9, to: 10, smooth:{type:"curvedCW",roundness:0.001}},//No I18N
					{ from: 10, to: 0 ,smooth:{type:"curvedCW",roundness:0.2}}//No I18N
				  ];
	  
				  $.each(jsonData.Devices,function(key,dobj){
					  var index = key;
					  var nodeLabel = opm_escapeHTML(dobj.label);
					  if(jsonData.Devices.length <= 5 &&  jsonData.Devices.length === (key+1)){
						  index = 5;
					  }
					  nodes[index].name = dobj.objName;
					  nodes[index].color = dobj.color;
					  nodes[index].label = nodeLabel.length > parseInt(10)?(nodeLabel.substring(0,parseInt(10))+"..."):nodeLabel;
					  nodes[index].hidden = false;
					  nodes[index].title = opm_parseElmTitleTxt("<b>"+Ember.I18n.t('jsp.commonstr.Name',this)+" : </b>"+nodeLabel+"</br><b>"+Ember.I18n.t('webclient.devices.details.mac',this)+" : </b>"+dobj.macaddress+"</br><b>"+Ember.I18n.t('opu.views.ROLE',this)+" : </b>"+dobj.role+"</br><b>"+Ember.I18n.t('opstor.inventory.state',this)+" : </b>"+dobj.state); //No I18N
				  });
	  
				  var isdahsedEdge = false;
				  var lastEdgeIndex = jsonData.linkDetails.length <= 8 ? 8:jsonData.linkDetails.length;
				  $.each(nodes,function(k,v){
					  
					  if(!nodes[k].hidden && jsonData.linkDetails[k] !==undefined && jsonData.linkDetails[k].linkStatus === 0){
						  isdahsedEdge = true;
					  }
					  if(!nodes[k].hidden && jsonData.linkDetails[k] !== undefined && jsonData.linkDetails[k].linkStatus === 1){
						  isdahsedEdge = false;
					  }
					  if(k === lastEdgeIndex && jsonData.linkDetails[jsonData.linkDetails.length-1].linkStatus === 1){
						  isdahsedEdge = false;
					  }
					 if(nodes[k].hidden){
						  nodes[k].hidden = false;
						  nodes[k].size = "dot";
					  }
	  
					  edges[k].dashes = isdahsedEdge;
				  });
			}

			// create a network
			var container = document.getElementById("topoMapWidget");
				var data = {
				  nodes: nodes,
				  edges: edges
				};
				setTimeout(function(){
					network = new vis.Network(container, data, mapOptions);
					network.fit();
				},100);

			//Bandwidth API DEtails grid loading
			/*var colNames =[Ember.I18n.t('webclient.opm.stackdetails',this),""];//No I18N
			var colModels =
			[
				{ name: 'key', index: 'key','sortable':false}, //No I18N
	            { name: 'value', index: 'value',formatter:'escapeHtmlTags','sortable':false} //No I18N
			];
			opm_loadJQgridWithData("#stackBandwidth", jsonData.stackDetails, colNames, colModels, "", "", "",{'sortable':false}); //No I18N 
			$('#stackBandwidth').jqGrid('setGridWidth', $("#opmstackBandDetails").width()); */
		}else{
			this.set('widgetData.noData',true);//No I18N
			this.set('widgetData.sizey',2);//No I18N
		}
	},
	willDestroyElement:function(){
		$('#'+this.elementId).find('*').remove();//No I18N
	}
})

OPMClient.AccordionGridLicenseMgmtExceedComponent = Ember.Component.extend({
	templateName: "components/accordion-grid-licenseMgmtExceed",//No I18N
	didInsertElement: function() {
		var self = this;
		self.set('showAllocationMessage', false); //No I18n
        var elements = this.get('model') == undefined ? this.set("model", {}) : this.get('model'); //No I18n
		self.set('showAccordion', true); //No I18n
		self.set('isCentral', window.OPM.isOPMPlusCentral || window.OPM.isMSPCentral || window.OPM.isCentralServer); //No I18n
		var	subElements = setAccordionForLiteDevices(this.get('isActivation') || this.get('isExceed'), this.get('probeID'), this.get('selCustomerID'));	//No I18n
		self.set('model.subElements', subElements);//No I18n
		if(window.OPM.isMSPCentral) {
			if(!self.get("showAccordionClass")) {
				$('#licenseMgmt_AccordionGrid').hide();
			}
			$('.probe-selector--table').off('click').on('click', 'input[type="radio"][name="licenseExceed_liteSelectorRadio"]', function(e) {
				self.send('toggleLiteFilter');//NO I18N
				$('#licenseMgmt_AccordionGrid').show();
				$('#licenseMgmt_AccordionGrid').find("li").hide();
				$('#licenseMgmt_AccordionGrid').find("#" + e.target.id + "-accordion").show();
				self.get('parentView') ? self.get('parentView').set("selectedLiteDevice", e.target.value) : ''; //No I18n
				self.send('accordionToggle', e.target.id); //No I18n
			});
		} else if(window.OPM.isOPMPLUS && this.get('isExceed')) {
			self.set('currentObj.showButtons', false); //No I18n
		}
		Ember.run.schedule("afterRender", function() {//No I18n
			if(subElements && subElements.length > 0 && self.get("showAccordionClass")) {
				self.send('accordionToggle', subElements[0].id); //No I18n
			}
			if(OPMClient.ApplicationController.isEmptyLiteDevice) {	
				self.set('showAllocationMessage', true); //No I18n
			}
		});
	},
	actions : {
		accordionToggle: function(id) {
			var self = this;
			Ember.run.schedule('afterRender', function() { //No I18n
				$('#' + id +'-accordion .accordion1__cont').toggle();
				if($('#' + id +'-accordion .accordion1__nav').hasClass('active')) {
					$('#' + id +'-accordion .accordion1__nav').removeClass('active');
					return;
				}
				$('#' + id +'-accordion .accordion1__nav').addClass('active');
				var model = self.get('model'); //No I18n 
				var currentSubModule = model.subElements.filter(function(element){return element.id === id})[0];
				if(!currentSubModule.noData) {
					self.send('loadElementGrid', id, false); //No I18n	
				}
			})
		},
		loadElementGrid: function(module, isFilter) {
			var isExceed = this.get('isExceed'); //No I18n 
			if((window.OPM.isOPMCentral || window.OPM.isMSPCentral) && (this.get("selectedProbeID") || this.get('probeID'))) {
				module += "_" +  (this.get('probeID') != undefined ? this.get('probeID') : this.get("selectedProbeID"));
			}
			if(this.get('isActivation')) {
				loadActivationGrid(this, module, "licenseExceed", isFilter); //No I18n 
			} else {
				loadLicenseGrid(this, this.get('probeID') != undefined ? module + "_" + this.get('probeID') : module, isFilter, isExceed ? 'licenseExceed': 'mgmt' , true, this.get('selCustomerID'));
				if(!isFilter) {
					window.OPM.isOPMPlusCentral ? $('#license_resetGrid').addClass("disabledBlock") : $('#' + module + '-accordion ' + '.filter-block .plain-btn-link').addClass('disabledBlock');
				}
			}
		},
		redirectElementAllocation: function(page) {
			if(page==="Devices"){//No I18n
				location.href="#/Settings/Discovery/AddNewDevice";//No I18N
			}else if(page==="NetworkPath"){//No I18n
				location.href="#/Settings/Monitors/NetworkPathAnalysis/List/Add";//No I18N
			}else if(page==="URL"){//No I18n
				location.href="#/Settings/Monitors/UrlMonitors/monitor/AddEdit";//No I18N
			}else if(page==="AccessPoints"){//No I18n
				location.href="#/Settings/Discovery/AddWireless";//No I18N
			}else if(page==="WANIPs"){//No I18n
				location.href="#/Settings/Discovery/AddWanLink";//No I18N
			}
		},
		toggleActions: function() {
			
			var gridID = this.get("currentGridID");
			enableDisableLicenseActions(gridID);
		},
		toggleFilter: function(id) {
			if(window.OPM.isMSPCentral && !this.get("showAccordionClass")) {
				$('#' + id + '-accordion .filter-block').toggle();
			} else {
				$('#' + id + '-accordion .accordion1__cont .filter-block').toggle();
			}
		},
		toggleLiteFilter: function() {
			$('#mspLiteDeviceSelector').toggleClass('active');
		},
		resetFilterAndGrid: function(module) {
			if(window.OPM.isOPMPLUS) {
				$('.filter-block select').prop('selectedIndex',0).trigger('change');
				$('.filter-block input').val('');
			} else {
				$('#' + module + '-accordion ' + '.filter-block select').prop('selectedIndex',0).trigger('change')
				$('#' + module + '-accordion ' + '.filter-block input').val('');
			}
			this.send('loadElementGrid', module); //No I18n
		},
		setManaged: function(manage, module, event) {
			var isExceed = this.get('isExceed'); //No I18n 
			this.set('model.currentModule', this.get('model.subElements').filter(function(element){return element.id === module})[0]);
			manageElementsForLicense(isExceed ? 'licenseExceed': 'mgmt', this, manage, event); //No I18n
		},
		deleteElements: function(module) {
			var isExceed = this.get('isExceed'); //No I18n 
			this.set('model.currentModule', this.get('model.subElements').filter(function(element){return element.id === module})[0]);
			deleteElementsForLicense(isExceed ? 'licenseExceed' : 'mgmt', this); //No I18n
		},
		toggleResolveDisable: function() {
			$(".license_manage__content").toggleClass("disabledBlock"); //No I18n
		},
		closeSubModuleGrid: function() {
			OPMClient.__container__.lookup('controller:SettingsBasicLicenseMgmt').send('closeSubModuleGrid'); //No I18N
		},
		showCompleteActionAccordion :  function() {
			setAccordionForLiteDevices(this.get('isActivation') || this.get('isExceed'), this.get('probeID'), this.get('selCustomerID'));
		}
	}
});

OPMClient.CountBubbleComponent = Ember.Component.extend({
	didInsertElement: function () {
		var currentObj = this.get('currentObj');
		var model = this.get('model'); //No I18n
		var isOPMPlusCentralExceeded = window.OPM.isOPMPlusCentral && this.isExceedPage;
		if(model.page === 'sam' && window.OPM.apmInstalled !== 'true') {
			currentObj.set("showAPMDownloadPage", true);//No I18N
		 	return;
		}
		var elements = [];
		var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getLicenseInfoDetails" + (model.apiParam ? ("?type="+model.apiParam) : "")); //No I18n
		if(model.page === 'sam' && !response.isAPMStarted) {
			currentObj.set("showAPMDownloadPage", {}); //No I18n
			currentObj.set("showAPMDownloadPage.notStart", true);//No I18N
			return;
		}
		var isSAMV2LicenseModel = model.page === 'sam' && response.isSAMv2LicenseModel;//NO I18N
		currentObj.set("isSAMV2LicenseModel", isSAMV2LicenseModel); //No I18n
		currentObj.set("showAPMDownloadPage",false);//No I18N
		currentObj.set("licenseExceeded", false);//No I18N
    	currentObj.set("showCalculation",false);//No I18N
		currentObj.set("showAllocateBundle",false);//No I18N
		currentObj.set("showDeviceDetails",false);//No I18N
		currentObj.set("apmNotAuthorized",false);//No I18N
		currentObj.set("model.primary", {}); //No I18N
		/*******************************USAGE INFO PARAMETERS*************************************/
		if(model.page === 'usageInfo') {
			currentObj.set('model.infoMessage', Ember.I18n.t('webclient.licensemgmt.usageinfomessage', {param0: response.licensedElementsCount})); //No I18n
			elements = [
				{'id': "usedElements", first:{text: response.UsedElementsCount, 'class': "value flex-left"}, second: {text: Ember.I18n.t('webclient.licensemgmt.usedelements'), 'class': "usage-title flex-right"}, usageBoxClass: "secondary cursorDefault"}, //No I18n
				{'id':"network", first:{text: response.NetworkBundleCount, 'class': "value flex-left flex-left"}, second: {text: Ember.I18n.t('webclient.vmware.map.nwusg'), 'class': "usage-title flex-right "}, toolTip: response.NetworkBundleCount === '0' ? Ember.I18n.t("webclient.licensemgmt.allocateelements") : ""}, //No I18n
				{'id': "sam", first:{text: response.ServerBundleCount, 'class': "value flex-left flex-left"}, second: {text: 'SAM', 'class': "usage-title flex-right"}, toolTip: window.OPM.apmInstalled === 'false' ? ((Ember.I18n.t("webclient.licensemgmt.tooltip.installapm") + '<a onclick="openAPMDownloadLink()" class="green-link"><b>'+Ember.I18n.t('webclient.billing.download')+'</b></a>')) : ((response.ServerBundleCount === '0' ? Ember.I18n.t("webclient.licensemgmt.allocateelements") : ""))}, //No I18n
				{'id': "storage", first:{text: response.StorageBundleCount, 'class': "value flex-left flex-left"}, second: {text: Ember.I18n.t('webclient.Storage'), 'class': "usage-title flex-right"}, toolTip: response.StorageBundleCount === '0' ? Ember.I18n.t("webclient.licensemgmt.allocateelements") : ""}, //No I18n
				{'id': "licenseType", first:{text: Ember.I18n.t('webclient.about.Licensedtype'), 'class': "name"}, second: {text: opm_escapeHTML(response.LicenseType), 'class': "type"}, usageBoxClass: "usageBox only-text"}, //No I18n
				{'id': "expiry", first:{text: response.amsExpiry ? Ember.I18n.t('webclient.about.amsexpireson') : Ember.I18n.t('webclient.about.productexpireson'), 'class': "name"}, second: {text: response.amsExpiry ? opm_escapeHTML(response.amsExpiry) : (response.expiryDate ? opm_escapeHTML(response.expiryDate) : ""), 'class': "type success"}, usageBoxClass: "usageBox only-text"} //No I18n
			]
			if(window.OPM.isEvalUser) {
				elements.unshift({'id': "elementsPurchased", first:{'class': "value", icon: 'unlimited-icon', iconPath: '/apiclient/fluidicv2/img/sprite-opm.svg#cube'}, second: {text: opm_escapeHTML(response.licensedElementsCount) + '<br>' + Ember.I18n.t('webclient.general.Devices'), 'class': "usage-title"}, usageBoxClass: 'unlimited active', addonList: response.AdditionalModules}); //No I18n
			}
			else {
				elements.unshift({'id': "elementsPurchased", first:{text: response.licensedElementsCount, 'class': "value flex-left"}, second: {text: Ember.I18n.t("webclient.licensemgmt.elementspurchased"), 'class': "usage-title flex-right"}, addonList: response.AdditionalModules, usageBoxClass: 'active'}); //No I18n
			}
			if(window.OPM.isOPM && !(window.OPM.isOPMPLUS && window.OPM.isElementBasedLicense)) {
				elements = elements.filter(function(obj){return obj.id!=="sam" && obj.id!=="storage" && obj.id!=="network"});//No I18n
			}
			if(response.ExceededElementsCount > 0) {
				var redirectToStore = ""
				if(window.OPM.isOPMPLUS) {
					redirectToStore = OPMClient.ApplicationController.productSpecificStoreLink;
				} else if(window.OPM.isMSPCentral) {
					redirectToStore = getUTMConstructedLink(Ember.I18n.t("webclient.msp.purchaselink")); //No I18n
				} else {
					redirectToStore = getProductSpecificStoreLink();
				}
				currentObj.set('model.exceededMsg', Ember.I18n.t('webclient.licensemgmt.exceeded', {param0: response.ExceededElementsCount})); //No I18n
				currentObj.set('model.exceededMsg2', Ember.I18n.t('webclient.licensemgmt.allowed', {param0: opm_escapeHTML(response.licensedElementsCount), param1 : redirectToStore})); //No I18n
				elements = elements.map(function(obj){return obj.id==='usedElements' ? $.extend({},obj,{usageBoxClass: 'danger'}): obj});
				currentObj.set("licenseExceeded", true); //No I18n
			}
			if(!window.OPM.isStoragePlug)
			{
				elements= elements.filter(function(data){ 
			        return data.id!=="storage";//No I18N
			    });
			}
			if(window.OPM.isARM || window.OPM.isKingbaseDB)
			{
				elements= elements.filter(function(data){ 
			        return data.id!=="sam";//No I18N
			    });
			}
		}
		/*******************************NETWORK PARAMETERS*************************************/
		else{
			var modules = response.BundleDetails;
			currentObj.set("model.bundleDetails",modules);//No I18N
			var showModuleNames = Object.keys(modules);
			if(model.page === 'network') {
				elements = [
					{ 'id': "Monitoring", second: { text: window.OPM.isOPMPLUS ? Ember.I18n.t("webclient.action.monitoring") : Ember.I18n.t("webclient.general.Devices"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.general.Devices'), gridApi: "/v2/device/listDevices?excludeStorage=true&excludeAP=true&isLicenseView=true", actionName: 'manage', serverPagination: true }, //No I18n
					{ 'id': "Flow", second: { text: Ember.I18n.t("Flow"), 'class': "usage-title" }, elementName: Ember.I18n.t('interfaces'), gridApi: "/device/listDevices", gridApi: "/nfaadmin/listDevicesForLicenseDetails?state="+encodeURIComponent("[0,1,2]"), actionName: 'manage', isDeleteAction: true}, //No I18n
					{ 'id': "AccessPoints", second: { text: Ember.I18n.t("webclient.general.accesspoints.tab"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.snapshot.name.APs'), gridApi: "/v2/wireless/getWLCDevices?isAPLicenseView=true", actionName: 'manage'}, //No I18n
					{ 'id': "URL",displayName: Ember.I18n.t('webclient.devices.snapshot.urlmonitorName'), elementName: Ember.I18n.t('webclient.admin.url.monitors'), gridApi: "/admin/listLiteDevices?category=URL", actionNames: ['manage','unmanage'] , serverPagination: true, noFilter: true  }, //No I18n
					{ 'id': "LiteDevices", second: { text: Ember.I18n.t("webclient.general.liteDevices.tab"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.general.Devices'), gridApi: "/v2/device/listDevices?excludeStorage=true&excludeAP=true&isLicenseView=true", actionName: 'manage',  serverPagination: true }, //No I18n
					{ 'id': "SPM", second: { text: Ember.I18n.t("webclient.SPM"), 'class': "usage-title" }, elementName: Ember.I18n.t('opu.spm.Ports'), gridApi: "/spm/getAllSwitchesSummary", actionName: 'delete', serverPagination: true, isDeleteAction: true}, //No I18n
					{ 'id': "IPAM", second: { text: Ember.I18n.t("webclient.IPAM"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.snapshot.name.IPs'), gridApi: "/ipam/getAllSubnetSummary", actionName: 'delete', deleteApi: '/spm/deleteSwitches', serverPagination: true, isDeleteAction: true}, //No I18n
					{ 'id': "Firewall", second: { text: Ember.I18n.t("webclient.admin.alarmesc.firewall"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.license.firewalls'), gridApi: "/fwainventory/getFWAInventoryDeviceList", actionName: 'manage',isHide: isOPMPlusCentralExceeded, isDeleteAction: true} //No I18n
				];
			}
			/*******************************SAM PARAMETERS************************************ */
			else if(model.page === 'sam') {
				if(window.OPM.apmInstalled === "true"){
					elements = [
					{ 'id': "Server", second: { text: Ember.I18n.t('webclient.admin.alarmesc.servers'), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.general.Devices'), gridApi: "/admin/getSAMBundleMonitorDetails?samCategory=servers", actionName: 'manage'}, //No I18n
					{ 'id': "Applications", second: { text: Ember.I18n.t('webclient.common.appmanager.servertab.title'), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.appmanager.applications'), gridApi: "/admin/getSAMBundleMonitorDetails?samCategory=applications", actionName: 'manage'}, //No I18n
					{ 'id': "InternetServices", second: { text: Ember.I18n.t('webclient.licensemgmt.internetservices'), 'class': "usage-title" }, third: { text: '\u00f7 3'}, elementName: Ember.I18n.t('nfa.apm.services'), gridApi: "/admin/getSAMBundleMonitorDetails?samCategory=internetServices", actionName: 'manage', isLast: (isSAMV2LicenseModel === true)} //No I18n
					];
				}else{
					currentObj.set("showAPMDownloadPage",true);//No I18N
				}
			}
			/*******************************Storage PARAMETERS************************************ */
			else if(model.page === 'storage') {
				elements = [
					{'id': "Storage", second: { text: Ember.I18n.t("webclient.Storage"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.general.Disks'), gridApi: "/v2/device/listDevices?isStorage=true&isLicenseView=true&category=RAID,FCSwitch,TapeLibrary", actionName: 'manage', serverPagination: true} //No I18n
				]
			}
			if(window.OPM.isOPM && !(window.OPM.isOPMPLUS && window.OPM.isElementBasedLicense)) {
				elements.push({ 'id': "NCM", second: { text: Ember.I18n.t('webclient.tab.ncm'), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.tab.ncm'), gridApi: "/device/getNCMDeviceDetails", actionName: 'manage', noFilter: true, responseID: 'NCM' , serverPagination: true});
				elements.push({'id': "Storage", second: { text: Ember.I18n.t("webclient.Storage"), 'class': "usage-title" }, elementName: Ember.I18n.t('webclient.general.Disks'), gridApi: "/v2/device/listDevices?isStorage=true&isLicenseView=true&category=RAID,FCSwitch,TapeLibrary", actionName: 'manage', serverPagination: true}); //No I18n
			}
			elements = elements.filter(function(obj){ return showModuleNames.includes(obj.id)});
			if(isSAMV2LicenseModel){
				//Add another element for total count of devices
				elements.push({
					'id': "TotalDevices",//NO I18N
					first: { text: response.CurrentConsumedCount, 'class': "value" },//NO I18N
					second: { text: Ember.I18n.t('webclient.map.totaldevices'), 'class': "usage-title" },//NO I18N
					elementName: Ember.I18n.t('webclient.general.Devices'),//NO I18N
					usageBoxClass: "usageBox only-text",//NO I18N
					isTotalElement: true,
					totalCount: response.CurrentConsumedCount
				});
			}
			var primaryIndex;
			for(var i = 0; i < elements.length; i ++) {
				if(!modules || modules[elements[i].id] === undefined) {
					continue;
				}
				elements[i].first = {
					text: modules[elements[i].id].usedElementsCount,
					'class': 'value' //No I18n
				}
				if(modules[elements[i].id].allowedElementsCount !== '0' && !isSAMV2LicenseModel) {
					elements[i].third = {
						text: Ember.I18n.t('jsp.commonstr.OutOf') + " " + modules[elements[i].id].allowedElementsCount
					}				
				}
				elements[i].totalCount = modules[elements[i].id].allowedElementsCount;
				elements[i].stats = {
					manageTitle: Ember.I18n.t('webclient.map.view.managed', this) + " " + elements[i].elementName,
					manageCount: parseInt(modules[elements[i].id].totalManagedCount),
					relativeWidth: 'width: 100%' //No I18n
				}
				if(modules[elements[i].id].totalUnManagedCount && ['IPAM','SPM'].indexOf(elements[i].id) < 0) {
					elements[i].stats.unManageTitle = Ember.I18n.t('webclient.map.view.unmanaged', this) + " " + elements[i].elementName;
					elements[i].stats.unManageCount = parseInt(modules[elements[i].id].totalUnManagedCount);
					elements[i].stats.relativeWidth = 'width:' + ((elements[i].stats.manageCount / (elements[i].stats.manageCount + elements[i].stats.unManageCount)) * 100) + '%';
				}
				// PRIMARY BADGE ASSIGNMENT
				if(elements[i].id === response.PrimaryModule) {
					currentObj.set('model.primary', {'id':elements[i].id, 'name': elements[i].second.text, 'count': response.PrimaryModuleCount}); //No I18n
				    if(!isSAMV2LicenseModel) {
					elements[i].third = {
						text : elements[i].elementName
					}	
					elements[i].usageBoxClass = "primary";
					elements[i].badges = [{
						title: Ember.I18n.t('webclient.licensemgmt.primarycount'), //No I18n
						badgeInfo: {
							type: 'primary', //No I18n
							primaryText: model.page === 'network' ? Ember.I18n.t('webclient.licensemgmt.primary.act', {param0: elements[i].second.text, param1: elements[i].elementName}) : Ember.I18n.t('webclient.licensemgmt.primary.act.sam', {param0: elements[i].second.text, param1: elements[i].elementName})
						},
						tooltipClass: 'addon-icon', //No I18n
						iconClass: 'primary', //No I18n
						icon: '/apiclient/fluidicv2/img/sprite-opm.svg#star' //No I18n
					}];
				}
				}
				// ADDITIONAL BADGE ASSIGNMENT
				if(modules[elements[i].id].additionalLicenseAllowed) {
					if(!elements[i].badges) {
						elements[i].badges = []
					}
					elements[i].badges.push({
						title: Ember.I18n.t("webclient.licensemgmt.addpurchase"), //No I18n
						badgeInfo: {
							type: 'additional', //No I18n
							additionalTitle: elements[i].elementName,
							additionalCount: modules[elements[i].id].usedAdditionalLicenseCount,
							additionalSub: Ember.I18n.t('jsp.commonstr.OutOf') + " " + modules[elements[i].id].allowedAdditionalLicenseCount
						},
						tooltipClass: 'addon-icon', //No I18n
						iconClass: 'addon', //No I18n
						icon: '/apiclient/fluidicv2/img/sprite-opm.svg#cube-filled' //No I18n
					})
					elements[i].totalCount = modules[elements[i].id].totalAllowedCount;
				}
				elements[i].usageBoxClass = elements[i].usageBoxClass? elements[i].usageBoxClass + " style2" : "style2";
				elements[i].additionalCount = modules[elements[i].id].allowedAdditionalLicenseCount;
				if(elements[i].id === response.PrimaryModule) {
					elements[i].isPrimary = true;
					primaryIndex = i;
				}
			}
			if(primaryIndex && this.isExceedPage) {
				elements.unshift(elements[primaryIndex]);
				elements.splice(primaryIndex + 1, 1);
			}
		}
		this.set('model.elements', elements); //No I18n
		if(!(window.OPM.isOPMPLUS && this.isExceedPage) && elements.length>0){
			if(this.get('model.currentModule') && this.get('model.currentModule').id) {
				if(model.page === 'sam' )
				{
					if(window.OPM.isAPMFullAdmin)
					{

						this.send('bubbleAction', this.get('model.currentModule').id);//NO I18N
					}
					else
					{
						this.set('showModuleInfo', false); //No I18n
						this.set('showAddons', false); //No I18n
						this.set("apmNotAuthorized", true);//No I18n
					}
				}
				else
				{
					this.send('bubbleAction', this.get('model.currentModule').id);//NO I18N
				}
			}
			else {
				if(model.page === 'sam')
				{
					if(window.OPM.isAPMFullAdmin)
					{
						this.send('bubbleAction', elements[0].id);//NO I18N
					}
					else
					{
						currentObj.set('showAddons', false); //No I18n
						currentObj.set('showModuleInfo', false); //No I18n
						currentObj.set("apmNotAuthorized", true);//No I18n
					}
				}
				else
				{
					this.send('bubbleAction', elements[0].id);//NO I18N
				}
			}
		} else {
			this.send('bubbleAction', elements[0].id);//NO I18N
		}
	}.observes('model'), //No I18n
	actions: {
		bubbleAction: function(module) {
			var self = this;
			var currentObj = this.get('currentObj');
			var page = this.get('model').page; //No I18n
			var isOPMPlusCentralExceeded = this.get('isOPMPlusCentral') && self.isExceedPage;
			currentObj.set("gridSwap", false); //No I18N
			if(['network','sam','storage'].indexOf(page) > -1) {
				var isCentral = window.OPM.isOPMPlusCentral || window.OPM.isMSPCentral || window.OPM.isCentralServer;
				if(page === "sam" && module === "TotalDevices"){
					if(isCentral){
						currentObj.set("gridSwap", true); //No I18N
					}
					return;
				}
				var isDisabledAction = false;
				var isSAMV2LicenseModel = currentObj.get("isSAMV2LicenseModel"); //No I18n
				var elements = this.get('model.elements').map(function(element) {//No I18n
					if(isSAMV2LicenseModel){
						return element.id === module ? $.extend({}, element, {isActive: true}) : $.extend({}, element, {isActive: false});
					}
					return element.id === module ? ((isDisabledAction = element.isDisabled),$.extend({}, element, {isActive: true})) : $.extend({}, element, {isDisabled: self.isExceedPage? true : false, isActive: false});
				});
				if(isDisabledAction || (!window.OPM.isAPMFullAdmin && page === "sam")) {
					return;
				}
				if(isSAMV2LicenseModel && module === 'InternetServices'){
					currentObj.set('showNoteforIS', true);//NO I18N
				}
				else{
					currentObj.set('showNoteforIS', false);//NO I18N
				}
				this.set('model.elements', elements); //No I18n
				!this.isExceedPage ? currentObj.send('setFilters', module) : getFilterArray(currentObj, module, 'licenseExceed'); //No I18n
				currentObj.set('showModuleInfo', true); //No I18n
				currentObj.set('showAddons', false); //No I18n
				currentObj.set("showAllocateBundle", false);//No I18n
				currentObj.set("showDeviceDetails",false);//No I18N
				var bundleDetails = this.get('model.bundleDetails') ? this.get('model.bundleDetails')[module] : undefined;//No I18N
				var gridModule = module;
				currentObj.set('accordionGrid', false); //No I18n
				currentObj.set('isCentral', isCentral); //No I18n
				if(module == "LiteDevices") {
					currentObj.set("gridSwap", true); //No I18N
					if(isCentral) {
						gridModule = "Probes_" + module; //No I18N
					} 
					if(bundleDetails.totalManagedCount==="0" && bundleDetails.totalUnManagedCount==="0" && !isCentral){
						currentObj.set("accordionGrid",true);//No I18n
						currentObj.set("allocateBundleElement","Lite");//No I18n
						currentObj.set("showModuleInfo",false);//No I18N
						currentObj.set("showCalculation",true);//No I18N
					} else if(isCentral) {
						if(bundleDetails.totalManagedCount==="0" && bundleDetails.totalUnManagedCount==="0") {
							currentObj.set("showAllocateBundle",true);//No I18n
							currentObj.set("allocateBundleElement","Lite");//No I18n
							currentObj.set("showModuleInfo",false);//No I18N
							currentObj.set("showCalculation",true);//No I18N
						} else {
							currentObj.set("showDeviceDetails",true);//No I18N
							currentObj.send('loadGrid', gridModule); //No I18n
						}
					} else {
						currentObj.set("showDeviceDetails",false);//No I18N
						currentObj.set('accordionGrid', true); //No I18n
						currentObj.set('showModuleInfo', false); //No I18n
					}
				}
				else if(!isOPMPlusCentralExceeded) {
					if(isCentral) {
						gridModule = "Probes_" + module; //No I18N
						currentObj.set("gridSwap", true); //No I18N
					}
					if(bundleDetails!==undefined && ((bundleDetails.totalManagedCount==="0" && bundleDetails.totalUnManagedCount==="0") || bundleDetails.allowedElementsCount==="0")){//No I18N
						if(bundleDetails.totalManagedCount==="0" && bundleDetails.totalUnManagedCount==="0"){
							currentObj.set("showAllocateBundle",true);//No I18n
							currentObj.set("allocateBundleElement",module);//No I18n
							currentObj.set("showModuleInfo",false);//No I18N
							currentObj.set("showCalculation",true);//No I18N
						}
						else {
							currentObj.set("showDeviceDetails", true);//No I18N
							currentObj.send('loadGrid', gridModule); //No I18n
						}
						if(bundleDetails.allowedElementsCount==="0"){
							currentObj.set("showCalculation",false);//No I18N
						}
					}else{
						currentObj.set("showAllocateBundle",false);//No I18n
						currentObj.set("showModuleInfo",true);//No I18N
						currentObj.set("showDeviceDetails",true);//No I18N
						currentObj.send('loadGrid', gridModule); //No I18n
					}
				} else if(currentObj.get('selectedProbeID')){
					currentObj.send('loadElementGrid',module);//No I18n
				}
				this.send('elementCalculation', module); //No I18n
			}
			else {
				currentObj.set('showCalculation', false); //No I18n
				currentObj.set('showAddons', true); //No I18n
				currentObj.set('showModuleInfo', false); //No I18n
				currentObj.set("showAllocateBundle",false);//No I18n
				if(page ==="usageInfo") { //No I18n
					if(['network','sam','storage'].indexOf(module) > -1) { //No I18n
						var pageRedirect = {
							"network": "Network", //No I18n
							"sam": "SAM", //No I18n
							"storage": "Storage" //No I18n
						}
						location.href = "#/Settings/Basic/LicenseMgmt/" + pageRedirect[module];
					}
				}
				if(module === 'elementsPurchased') {
					currentObj.set("showDeviceDetails",true);//No I18N
					currentObj.send('loadGrid', module); //No I18n
				}
			}
			var modelName = window.OPM.isOPMPLUS && this.isExceedPage ? 'model.licenseElements' : 'model.elements';//No I18n
			this.set('model.currentModule', currentObj.get(modelName).filter(function(element){return element.id === module})[0]); //No I18n
		},
		elementCalculation: function(module) {
			var currentObj = this.get('currentObj');
			var isSAMV2LicenseModel = currentObj.get("isSAMV2LicenseModel"); //No I18n
			if(!this.get('model').primary) {
				currentObj.set('showCalculation', false); //No I18n
				return;
			}
			var calculation = isSAMV2LicenseModel ? {} : getElementCalculationForLicense(this, module);
			if(isSAMV2LicenseModel){
				var expression = getSAMV2CalculationForLicense(this);
				calculation.expression = expression;
			}
			else if(!calculation || calculation.length < 1) {
				currentObj.set('showCalculation', false); //No I18n
				return;
			}
			currentObj.set('model.calculation', calculation); //No I18n
			currentObj.set('showCalculation', true); //No I18n
			if(this.get('model').page === 'network') {
				currentObj.set('model.calculation.info', [ //No I18n
					'1. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elem1'), //No I18n
					'2. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elem2'), //No I18n
					'3. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elem3'), //No I18n
					'4. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elem4') //No I18n
				]); 
			}
			else if(isSAMV2LicenseModel){
				currentObj.set('model.calculation.info', [ //No I18n
					'1. ' + Ember.I18n.t('webclient.opmplus.sam.v2.tooltip.1'), //No I18n
					'2. ' + Ember.I18n.t('webclient.opmplus.sam.v2.tooltip.2'), //No I18n
					'3. ' + Ember.I18n.t('webclient.opmplus.sam.v2.tooltip.3') //No I18n
					]); 
			}
			else if(this.get('model').page === 'sam') {
				currentObj.set('model.calculation.info', [ //No I18n
					'1. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elemsam1'), //No I18n
					'2. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elem1'), //No I18n
					'3. ' + Ember.I18n.t('webclient.licensemgmt.tooltip.elemsam3') //No I18n
				]);
			}
		}
	},
	willDestroyElement: function(){
		var currentObj = this.get('currentObj');
		currentObj.set('accordionGrid', false); //No I18n
	}
})

OPMClient.OtpPromptComponent = Ember.Component.extend({
	CONFIG_QR: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABRmlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8bAzCDAwMnAzaCQmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsisrpqkP/6Hcw0u866+FB08gwlTPQrgSkktTgbSf4A4PbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOB1TE4tUgg2MjLwCMTiP8pASWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGREQMDKMwhqj/fAIcloxgHQixuJQODQSwDA7MwQixfh4Hh0FYGBh5GhJgmUCfPOwaGI5IFiUWJcAcwfmMpTjM2grC5tzMwsE77//9zOAMDuyYDw9/r////3v7//99lQPNvMTAc+AYA/H5euYo5oCgAAAA4ZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAKgAgAEAAAAAQAAAGSgAwAEAAAAAQAAAGQAAAAADHP8ewAAA3tJREFUeAHtm8FOZUEIRL2T+f9fnjEuz1tUCPSlTY47BAq6SsBn4vPv++vLr2sY+HNNJzbyw4CCXPaDoCAKchkDl7XjhCjIZQxc1o4Tcpkgf1M/z/OkkFE/PxaxPv0s3o0n3rSd+ndCphlv4ilIk8DpdAWZZrSJF28I8dMOZHyyufOr8eyHdsKjv5tPvOr7nBAyuGwryLIALK8gZGTZLt8Q9lvdkd0dnfLZT4rne2gTj37a3XpOCBldthVkWQCWVxAysmy3b8jp/tNOru740/128Z2QLoPD+QoyTGgXTkG6DA7nX39DeCN4U2gznjbjh/lswzkhbQpnARRkls82moK0KZwFaN+Q0zu5il+NT3RO46V6Tkhi6GW/grxMeCqnIImhl/3lG8Lf60/3y3rc6V0/+yce/adtJ+Q0w0V8BSkSdjpcQU4zXMR/vnfyr/ofw7Tjf9lzPuRyQj4o2f2Gguzy/1FdQT4o2f1G/BzCnZ12NOPffh7rs9/kZ78pnn7m02Y/9DshZGTZVpBlAVheQcjIsh1vCPvr7kzmp52a6jOf+LRTPOulePqZX7WdkCpjh+MV5DDBVXgFqTJ2OP7437K4w9N7qju5i8/8an2+h3j0J3wnhIwt2wqyLADLKwgZWbbj5xDuxLQD03uq+al+wmM+bebTz/ekePqZn2wnJDH0sl9BXiY8lVOQxNDL/nhD0k7kzk3xfB/z6Sce45M/4dFPm/hVP+OT7YQkhl72K8jLhKdyCpIYetl//G9Z3fekm5HwmZ/ieTOYn/zEZzz9tJ0QMrJsK8iyACyvIGRk2Y6fQ7hDT/db3bnsh/0mPMYTL9kJP+XT74SQkWVbQZYFYHkFISPLdrwh7G96Z3Z3eLW/br1qfpUvJ4SKLtsKsiwAyysIGVm2yzeE/Z7eqaxHm/WrO5vxCS/52V/VdkKqjB2OV5DDBFfhFaTK2OH49g053F+ETzcgAiCAeHB/0T99U5wQMr5sK8iyACyvIGRk2b7+hnBnd/kiHm9Awmc+4xNeyndCyOiyrSDLArC8gpCRZbt9Q9JOnH4fd/Tp+sRn/en3OSHTjDbxFKRJ4HS6gkwz2sQr35DTO5TvYb3qTu/Gsx/i0d+1nZAug8P5CjJMaBdOQboMDudf//8hw++9Hs4JuUwiBVGQyxi4rB0nREEuY+CydpwQBbmMgcva+Q9LSg2/VfhwlAAAAABJRU5ErkJggg==", //No I18n
	didInsertElement: function() {
		var otpDetails = this.get("otpDetails");
		var otpPageType = otpDetails.otpPageType;
		if(otpPageType === "slide") {
			this.set("isSlideType", true); //No I18n
			slideIn(99);
		}
		if(otpDetails.totpAndNotConfig) { //IF TOTP NOT CONIFGURED
			this.send("setTotpPage"); //No I18n
		}
		else {
			this.send("setOtpPromptPage"); //No I18n
		}
	},
	actions: {
		setTotpPage: function() { //IF TOTP NEEDS TO BE SHOWN
			this.set("otpDetails.totpAndNotConfig", true); //No I18n
			var otpPageType = this.get("otpDetails.otpPageType");
			this.set("showBackForTotp", true); //No I18n
			this.set("revealQr", false); //No I18n
			var self = this;
			if(!this.get("totpDetails")) {
				var totpDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getTOTPInfo"); //No I18n
				this.set("totpDetails", totpDetails); //No I18n
				this.set("CONFIG_QR", totpDetails.CONFIG_QR); //No I18n
			}
			Ember.run.schedule("afterRender", function() { //No I18n
				if(otpPageType === "dialog"){
					$('body').addClass('ui-dialog-style2');
					$("#otpDialog").dialog({
						modal: true,
						resizable: false,
						width: 650,
						title: Ember.I18n.t("webclient.admin.syslogrules.alert"), //No I18n
						closeOnEscape: false,
						close: function() {
							self.send("closeOtpPage"); //No I18n
						}
					});
				}
			})
		},
		setOtpPromptPage: function() {
			this.set("otpDetails.totpAndNotConfig", false); //No I18n
			var self = this;
			var otpPageType = this.get("otpDetails.otpPageType");
			this.set("tfaMode", this.get("otpDetails.tfaMode")); //No I18n
			this.set("otpCustomMessage", this.get("otpDetails.otpCustomMessage")); //No I18n
			this.set('otpmessage', this.get("otpDetails.tfaMode") === "EMAIL" ? (Ember.I18n.t("twofactorauth.mail.enterotp") + " "  + this.get("otpDetails.maskedEmail") ): Ember.I18n.t("twofactorauth.totp.enterotp")); //No I18n
			Ember.run.schedule("afterRender", function() { //No I18n
				if(otpPageType === "dialog"){
					$('body').addClass('ui-dialog-style2');
					$("#otpDialog").dialog({
						modal: true,
						resizable: false,
						width: 550,
						title: Ember.I18n.t("twofactorauth.otp.verification"), //No I18n
						closeOnEscape: false,
						close: function() {
							self.send("closeOtpPage"); //No I18n
						}
					});
				}
				//OTP INPUT BOX EVENT HANDLERS
				$('.OTPinput input').off('keypress.otpprompt').on('keypress.otpprompt', function(e){
					if(e.keyCode == 13 && !self.get("lockedTimeout")) { //Enter Key
						self.send('submitOtp'); //No I18n
					}
					else if(e.keyCode == 8) {
						if(!$(this).val()) {
							$(this).prev('input').focus(); //No I18n
						}
					}
					else {
						var regex = new RegExp("^[0-9]+$");
						var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
						if (!regex.test(key)) {
							e.preventDefault();
							return false;
						}
						$(this).on('keyup', function() {
							if(self.get('otpError') && !self.get("lockedTimeout")) {
								self.set('otpError', false); //No I18n
							}
							$(this).next('input').focus(); //No I18n
							$(this).off('keyup'); //No I18n
						})
					}
				});
				$('.OTPinput input').off('keydown.otpprompt').on('keydown.otpprompt', function(e){
					if(e.keyCode == 8) { //Backspace
						if(!$(this).val()) {
							$(this).prev('input').focus(); //No I18n
						}
					}
				});

				setTimeout( function() {
					$("#otpSelect_1").focus();
				}, 200);				
				$('.OTPinput input').each(function (k,v) {
					$('.OTPinput input')[k].addEventListener('paste', handleOTPPaste);	
				});
			})
		},
		submitOtp: function() {
			var fieldsToValidate = {'empty':['otpSelect_1','otpSelect_2','otpSelect_3','otpSelect_4','otpSelect_5','otpSelect_6']};//No I18N
			if(!opm_validateFields(fieldsToValidate)) {
				return;
			}
			var self = this;
			this.set('otpError', false); //No I18n
			var otp = $('.OTPinput input').map(function(){return $(this).val()}).get().join("");
			var otpDetails = $.extend(true, {}, this.get("otpDetails"));
			if(otpDetails.resubmitFunctionName && otpDetails.postUrl) {
				otpDetails.postData ? otpDetails.postData : {};
				if(otpDetails.postData instanceof FormData) {
					if(isIEBrowser()) {
						otpDetails.postData.append('TFAPassword', otp); //No I18n
					}
					else {
						otpDetails.postData.set('TFAPassword', otp); //No I18n
					}
				}
				else if(typeof otpDetails.postData === 'string') {
					otpDetails.postData += '&TFAPassword=' + otp; //No I18n
				}
				else {
					otpDetails.postData.TFAPassword = otp;
				}
				var callback = function(response) {
					if(response && response.error) {
						$('.OTPinput input').val("");
						$('.OTPinput input').first().focus();
						if(response.error.message) {
							if(response.error.code === 15001) {
								self.set('otpError', true); //No I18n
								self.set('otpErrorMessage', response.error.message); //No I18n
							}
							else {
								showMessage(response);
								self.send("closeOtpPage"); //No I18n
							}
						}
						//Multiple OTP Account Lockout Case
						if(response.error.lockedTimeout) {
							self.set("lockedTimeout", true); //No I18n
							self.set('otpError', true); //No I18n
							var lockedTimeout = response.error.lockedTimeout;
							var timeOut = setInterval(function() {
								if(!OPMClient.ApplicationController.otpDetails || !self.get("lockedTimeout")) {
									clearInterval(timeOut);
									return;
								}
								self.set('otpErrorMessage', Ember.I18n.t('webclient.usermgmt.tfa.otp.invalid.multipletries',{param0: --lockedTimeout})); //No I18n
								if(lockedTimeout < 1) {
									self.set('otpError', false); //No I18n
									clearInterval(timeOut);
									self.set("lockedTimeout", false); //No I18n
								}
							}, 1000);
						}
					}
					else if(response && (response.result || response.message || response.isSuccess !== undefined || response.status === "Success")) {
						if(otpDetails.callback) {
							otpDetails.callback(response);
						}
						self.send('closeOtpPage'); //No I18n
					}
				}
				if(otpDetails.msg) {
					window[otpDetails.resubmitFunctionName](otpDetails.postUrl, otpDetails.postData,otpDetails.msg, callback); //Resubmit Ajax Function with OTP
				} else {
					var response = window[otpDetails.resubmitFunctionName](otpDetails.postUrl, otpDetails.postData); //Resubmit Ajax Function with OTP
					if(response != undefined) {
						callback(response);
					}
				}
			}
		},
		resendOtp: function() {
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/tfaEmailValidation?operation=sendOTP"); //No I18n
			if(response.isOTPSent) {
				opm_infoMsgs("successMsg", Ember.I18n.t('twofactorauth.mail.otpMsg') + " " + response.maskedEmail); //No I18n
				this.set("otpError", false); //No I18n
				$('.OTPinput input').val("");
				$('.OTPinput input').first().focus();
				var self = this;
				//Next RESEND OTP only After 1 min
				var timer = 60;
				var timeOut = setInterval(function() {
					if(!OPMClient.ApplicationController.otpDetails) {
						clearInterval(timeOut);
						return;
					}
					self.set("resendOtpTimer", "00:" + (('0' + (--timer)).slice(-2))); //No I18n
					if(timer < 1) {
						self.set("resendOtpTimer", ""); //No I18n
						clearInterval(timeOut);
					}
				}, 1000)
			}
			else {
				opm_infoMsgs("errorMsg", response.error && response.error.message ? response.error.message : Ember.I18nt.t('twofactorauth.email.error')); //No I18n
			}
		},
		closeOtpPage: function(fromBack) {
			var otpDetails = this.get("otpDetails");
			var otpPageType = otpDetails.otpPageType;
			if(this.get('showBackForTotp') && fromBack) {
				this.send('setTotpPage'); //No I18n
				return;
			}
			otpPageType === 'slide' ? slideOut(99) : $("#otpDialog").dialog('destroy'); //No I18n
			OPMClient.ApplicationController.set("otpDetails", null); //No I18n
			if(fromBack && otpDetails && otpDetails.cancelCallBack) {
				otpDetails.cancelCallBack();
			}
		},
		revealQrCode: function() {
			this.set("revealQr", true); //No I18n
		},
		qrKeyToggle: function() {
			this.set("totpManual", !this.get("totpManual")); //No I18n
		}
	},
	totpManualChange: function() {
		this.get("totpManual") ? $("#totpConfig_wizard").addClass("manual") : $("#totpConfig_wizard").removeClass("manual");
		this.propertyDidChange('revealQr'); //No I18N
	}.observes("totpManual"), //No I18n
	revealQrChange: function() {
		var self = this;
		Ember.run.schedule("afterRender", function() { //No I18n
			self.get("revealQr") ? $("#otpPrompt_qrsvg").addClass("active") : $("#otpPrompt_qrsvg").removeClass("active");
		})
	}.observes("revealQr"), //No I18n
	otpErrorChange: function() {
		if(this.get('otpError')) {
			$('.OTPinput').addClass("error");
		}
		else {
			$('.OTPinput').removeClass("error");
		}
	}.observes('otpError'), //No I18n
	resendChange: function() {
		if(this.get('resendOtpTimer')) {
			$('#otpComp_resendIcon').addClass("disabledBlock");
			$('#otpComp_resend').addClass("disabledBlock");
		}
		else {
			$('#otpComp_resendIcon').removeClass("disabledBlock");
			$('#otpComp_resend').removeClass("disabledBlock");
		}
	}.observes('resendOtpTimer'), //No I18n
	lockoutChange: function() {
		if(this.get('lockedTimeout')) {
			$('#otpComp_submit').addClass("disabledBlock");
		}
		else {
			$('#otpComp_submit').removeClass("disabledBlock");
		}
	}.observes('lockedTimeout'), //No I18n
	willDestroyElement: function(){
		slideOut(99);
        $('body').removeClass('ui-dialog-style2');
		OPMClient.ApplicationController.set("otpDetails", null); //No I18n
	}
})

OPMClient.ItomdialogCustomViewComponent = Ember.Component.extend({
	templateName: "components/itomdialog-custom-view",//No I18N
	didInsertElement: function() {
		var self = this;
		var viewContent = self.get('viewContent');
		$("body").addClass("ui-dialog-style2");
		if(viewContent.alertIcon) {
			$("body").addClass("ui-dialog-alert-icon");
		}
		$("#itomDialogCustomView").dialog({
			modal: true,
			resizable: false,
			width: viewContent.width ? viewContent.width : 550,
			title: viewContent.dialogTitle,
			dialogClass: "opmPopupPosiCenter "+viewContent.dialogClassName,//No I18N
			closeOnEscape: viewContent.closeOnEscape == undefined ? true : viewContent.closeOnEscape,
			close: function() {
				self.send('closeItomDialog');//No I18N
			}
		});
		if(viewContent.closeOnEscape != undefined && !viewContent.closeOnEscape) {
			$('.ui-dialog-titlebar-close').remove();
		}
	},
	actions: {
		closeItomDialog: function() {
			OPMClient.ApplicationController.set('itomDialogDetails',undefined); //No I18n
			$('body').removeClass('ui-dialog-style2 ui-dialog-alert-icon');
			$('body #itomDialogCustomView').remove();
			var viewContent = this.get("viewContent");
			if(viewContent.closeFunctionCallBack && viewContent.closeFunctionCallBack instanceof Function) {
				viewContent.closeFunctionCallBack();
			}
		}
	}
})

function closeItomCustomDialog() {
	$("#itomDialogCustomView").dialog("close");
}

OPMClient.ListPopupComponent = Ember.Component.extend({
	actions: {
		closeListPopup: function() {
			OPMClient.ApplicationController.set('popupAttributes', undefined); //No I18n
		}
	}
})

var probeTimeout = "";
OPMClient.OpmProbeKeyComponent = Ember.Component.extend({
    classNames:['probe_timer'], //No I18n
    templateName: "components/opm-probe-key", //No I18n
    didInsertElement: function () {
        clearInterval(probeTimeout);
        var self = this;
        var restartTimer = self.get("probeKeyTimer");
        if(restartTimer!==undefined && restartTimer!==null && restartTimer!=="") {
            var restartTime = restartTimer.split(":");

            self.set("restartMinutes",restartTime[1]); //No I18n
            self.set("restartSeconds",restartTime[2]); //No I18n

            if(restartTime[1] == 0 && restartTime[2] <= 59) {
                $(".probe_timer ul").addClass("low_time");
            } else {
                $(".probe_timer ul").removeClass("low_time");
            }

            var countDownDate = new Date(window.OPM.jyear, window.OPM.jmon, window.OPM.jday, window.OPM.jhour, window.OPM.jmin, window.OPM.jsec).getTime();
            probeTimeout = setInterval(function() {
                if(restartTimer!==undefined && restartTimer!==null && restartTimer!=="") {
                    var restartTime = restartTimer.split(":");

                    var duration = parseInt(restartTime[1]) * 60 *1000 + parseInt(restartTime[2]*1000);
                    var now = new Date(window.OPM.jyear, window.OPM.jmon, window.OPM.jday, window.OPM.jhour, window.OPM.jmin, window.OPM.jsec).getTime();
                    var distance = (countDownDate + duration) - now;
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    if(minutes <= 0 && seconds <= 59) {
                        $(".probe_timer ul").addClass("low_time");
                    } else {
                        $(".probe_timer ul").removeClass("low_time");
                    }

                    if(minutes<0 || seconds<0) {
                        self.set("restartMinutes","00"); //No I18n
                        self.set("restartSeconds","00"); //No I18n
                    } else {
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        self.set("restartMinutes",minutes); //No I18n
                        self.set("restartSeconds",seconds); //No I18n
                    }

                    if (distance < 0) {
                        clearInterval(probeTimeout);
                    }
                }
            }, 1000);
        }
    },
    installKeyObserver: function(){
        Ember.run.schedule('afterRender', this, function() {//No I18N
			if (this.isDestroyed || this.isDestroying) {return;}
			clearInterval(probeTimeout);
            this.rerender();
        });
    }.observes('OPMClient.ApplicationController.installationKey').on('init'), //No I18n
    willDestroyElement: function(){
        clearInterval(probeTimeout);
    }
})

OPMClient.MailServerComponent = Ember.Component.extend({
	flag:false,
	message:"",//No I18N
	addClasses:"",//No I18N
	addOauthTitle: Ember.I18n.t("webclient.devices.add") + " " + Ember.I18n.t("webclient.oauthprovider.title"), //No I18n
	didInsertElement: function(){
		if($('.OpMToolBar,.OpMToolBarStyle,.opmMask').length > 0) {
			closeEmailReport();
		}
		if(window.OPM.isNCMEE && window.OPM.isCentralServer){
			$('.ifCentral').hide();
		}
		var self = this;
		self.set("showMailReports",true); //No I18n
		if(getHideMailServerAuditReport()) {
			self.set("showMailReports",false); //No I18n
		}
		$("#mail_oauthProfile").select2({placeholder:Ember.I18n.t("webclient.action.select")});
		$("input[type=radio][name='mailAuthType']").click(function() {
			self.set("isOauth", this.value === 'OAuth'); //No I18n
		})
		this.send("toggleMailType", "primary"); //No I18n
	},
	mailAuthChange: function() {
		var mailAuthType = this.get("mailObj.authType");
		if(!mailAuthType) {
			mailAuthType = "Basic"; //NO I18n
		}
		Ember.run.schedule('afterRender', function() { //No I18n
			$("input[type=radio][name='mailAuthType'][value='"+mailAuthType+"']").trigger("click");
			$("#mail_oauthProvider").trigger("change");
		})
	}.observes("mailObj"), //No I18n
	keyPress:function(e)
		{
			if($("#mailServerPort").is(":focus") || $("#timeOut").is(":focus") || $("#secMailServerPort").is(":focus") || $("#secTimeOut").is(":focus"))//No I18N
			{
				return opm_isNumber(e);
			}

		},
	keyDown:function(e){
		if($("*:focus").hasClass('error')){//No I18N
			$(':focus').removeClass('error');//No I18N
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();//No I18N
		}
	},
	actions:{
		goToMailServerAudit: function() {
			OPMClient.ReportsDetailsController.set("fromMailServer", true); //No I18n
			redirectToV3Client('Reports/AuditLogs/MailServerAudit','reports/'+window.OPM.v3AuditRoute+'/mail-server-audit'); //NO I18n
		},
		deleteSecondaryServer: function() {
			var self = this;
			var moduleName = "MailServerSettings"; //No I18N
			var confirmHdr = Ember.I18n.t("webclient.delete.confirmation"); //No I18N
			var confirmMsg = Ember.I18n.t("webclient.delete.confirmation"); //No I18N
			if(window.OPM.isCentralServer && window.OPM.syncBasicSettings!==undefined && window.OPM.syncBasicSettings==='true') {
				confirmHdr = "";
				var moduleDispName = window.OPM.centralizedConfigSettingsDispName[moduleName];
				if(window.OPM.settingsDelCentralOnlyEnabled) {
					var confirmNoteMsg = Ember.I18n.t("webclient.opm.cc.central.delsettings.centralonly.msg",this); //No I18N
				} else if(window.OPM.centralizedConfigSettings!==undefined && window.OPM.centralizedConfigSettings[moduleName]!==undefined) {
					var confirmNoteMsg = Ember.I18n.t("webclient.opm.cc.deleteprobe.confirm.txt.noprop.note",this); //No I18N
				}
				confirmMsg = '<div class="regular"><div class="custom-title"><div class="bold">'+Ember.I18n.t("webclient.opm.cc.deleteprobe.confirm.txt.noprop",{param0: moduleDispName},this)+'</div></div><div class="infoMssg danger style2"><div class="textWithIcon"><em class="svgIcon size20 failed-color ml-none mr-md"><svg><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#warning-round"/></svg></em><p><b class="bold">'+Ember.I18n.t('webclient.common.note')+' </b>'+ confirmNoteMsg +'</p></div></div><div><p>'+Ember.I18n.t('webclient.common.proceed.message')+'</p></div></div>'; //No I18N
			}
			opmConfirm(confirmHdr, confirmMsg, '550', function(){ //No I18n
				var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/deleteSecondaryMailServer"); //No I18n
				showMessage(response);
				if(response.result) {
					self.set("model.secondary", undefined); //No I18n
					self.send("toggleMailType", "primary"); //No I18n
				}
				//Model 1
				initProbeAssociation("SETTINGS",moduleName,undefined,undefined,true);//No I18N
			}, Ember.I18n.t("webclient.oauthprovider.yesdelete"),"", Ember.I18n.t("webclient.restapi.disable.cancelBtnText"), "", "dialogStyle2", true, "", "", true);//No I18n
		},
		oauthProfileSelect: function(refresh) {
			var mailObj = this.get("mailObj")
			if(!this.get("groupedProfilesArray") || refresh) {
				var response =  opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/listOAuthProvider?module=mailServer"); //No I18n
				var groupedProfiles = {};
				for(var i=0; i < response.length; i++) {
					if(!groupedProfiles[response[i].authProvider]){
						groupedProfiles[response[i].authProvider] = []
					}
					groupedProfiles[response[i].authProvider].push(response[i]);
				}
				var groupedProfilesArray = [];
				$.each(groupedProfiles, function(key, arr) {
					groupedProfilesArray.push({authProvider: key, profiles: arr});
				})
				if(response && response.length > 0) {
					this.set("groupedProfilesArray", groupedProfilesArray); //No I18n
				}
			}
			Ember.run.schedule("afterRender", function() { //No I18n
				$("#mail_oauthProfile").val(mailObj.oauthID).change();
			});
		},
		testMail: function()
		{
			var self = this;
			var frmData = new FormData();
			var postData = getMailServerData();
			if(postData === false){
				return false;
			}
			frmData = getMailServerFrmData(postData, this.get("isSecondary"));
			frmData.append("securemode", postData.secureMode);//No I18N
			frmData.append("tlsMode", postData.tlsMode);//No I18N
			frmData.append("authType", postData.authType);//No I18N
			var testMailURL = window.OPM.apiUrlPattern + '/v2/admin/testMail';//No I18N
			var secureMode = "off"; //No I18N
			var tlsMode = "off"; //No I18N
			secureMode = frmData.secureMode;
			tlsMode = frmData.tlsMode;
			var callback_func = function(response) {
				var mode = tlsMode === "on" ? "TLS" :  secureMode === "on" ? "SSL" : "secure";//No I18N
				if(response !== undefined && !$.isEmptyObject(response)){
					if(response.result !== undefined){
						opm_infoMsgs('successMsg',response.result.message);//No I18N
					}else if(response.error !== undefined){
						var errorMsg = response.error.message;
						if(response.error.code != 5000){
							errorMsg +=" <a href=\"https://www.manageengine.com/network-monitoring/kb/Mail-Server-troubleshooting.html#"+getMailServerErrorTag(response.error.code)+"\" target=\"_blank\">"+Ember.I18n.t("webclient.readmore",this)+"<a>";
						}
						opm_infoMsgs('errorMsg',errorMsg);//No I18N
						if(response.error.code ==5453 && confirm(Ember.I18n.t('webclient.mailserver.autoinsecuremode.consent',{ param0: mode},this))){
							frmData = getMailServerFrmData(postData, self.get("isSecondary"));	
							frmData.append("securemode", "off");//No I18N
							frmData.append("tlsMode", "off");//No I18N
							frmData.append("authType", postData.authType);//No I18N
							response = opm_ajaxMultiPostRequestWithMsg(testMailURL,frmData,Ember.I18n.t('webclient.credential.snmp.pleasewait',this));//No I18N
	
							if(response !== undefined && !$.isEmptyObject(response)){
								if(response.result !== undefined){
									opm_infoMsgs('infoMsg',response.result.message+"<br>"+Ember.I18n.t('webclient.mailserver.noneConnectionRequired',this));//No I18N
								}else if(response.error !== undefined){
									var errorMsg = response.error.message;
									if(response.error.code != 5000){
										errorMsg +=" <a href=\"https://www.manageengine.com/network-monitoring/kb/Mail-Server-troubleshooting.html#"+getMailServerErrorTag(response.error.code)+"\" target=\"_blank\">"+Ember.I18n.t("webclient.readmore",this)+"<a>";
									}
									opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.mailserver.autoinsecuremode.info',this)+"<br>"+errorMsg);//No I18N
								}
							}
						}
					}
				}
			}
			opm_ajaxMultiPostAsyncRequestWithMsg(testMailURL,frmData,Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),'',callback_func);//No I18N
			
		},
		submitMailServerSettings: function()
		{
			var self = this;
			var callBackFunc = function(){
			var postData = getMailServerData();
			if(postData === false){
				return false;
			}
			var formData = new FormData();
			formData.append("mailservername", postData.serverName);//No I18N
			formData.append("mailserverport", postData.mailServerPort);//No I18N
			formData.append("timeout", postData.timeOut);//No I18N
			formData.append("fromemailid", postData.fromMailID);//No I18N
			formData.append("emailid", postData.toMailID);//No I18N
			formData.append("requiresauth", postData.authenticationRequired);//No I18N
			formData.append("mailusername", postData.authUserName);//No I18N
			formData.append("securemode", postData.secureMode);//No I18N
			formData.append("tlsMode", postData.tlsMode);//No I18N
			formData.append("authType", postData.authType);//No I18N
			formData.append("isSecondary", self.get("isSecondary"));//No I18N
			/* checking is user changed the password or not*/
			if(postData.authPassword==="" && postData.authType === "Basic") {//No I18N
				formData.append('checkPassword', true);//No I18N
			} else {
				formData.append('checkPassword', false);//No I18N
			}
			if(postData.authType === "OAuth") {
				formData.append('oauthID', postData.oauthID); //No I18n
				self.mailObj.oauthID = postData.oauthID;
			}
			formData.append("mailpassword",postData.authPassword); //NO I18N
			var mailUrl = window.OPM.apiUrlPattern + "/v2/admin/ConfigureMailServerSettings";//No I18N
			var isSecondary = self.get("isSecondary"); //No I18n
			self.mailObj.authType = postData.authType;
			self.mailObj.tlsMode = postData.tlsMode;
			self.mailObj.securemode = postData.secureMode;
			OPMClient.SettingsAddEditController.set("isSecondary",isSecondary);//No I18N
			if(!isSecondary){
				var response = opm_ajaxMultiPostRequestWithMsg(mailUrl,formData,Ember.I18n.t('webclient.support.upload.wait',this));//No I18N
				if(response !== undefined && !$.isEmptyObject(response)){
					if(response.result !== undefined){
						self.set("model.primary", self.mailObj); //No I18n
						addClasses = "successMsg";//No I18N
						message = Ember.I18n.t("webclient.audit.mailsettings.primary",this)+" "+response.result.message;//No I18N
						if(window.OPM.showAdminMailIDUpdatePopup){
							window.OPM.showAdminMailIDUpdatePopup = false;
							OPMClient.ApplicationController.set("showAdminMailIDUpdatePopup",false);//No I18N
						}
						window.OPM.isMailServerSettingsConfigured = true;
						OPMClient.ApplicationController.set("isMailServerSettingsConfigured",true);//No I18N
						if(OPMClient.ApplicationController.fromSecRecPage){
							opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
						} else {
							setSecurityScore();
						}
					}else if(response.error !== undefined){
						addClasses = "errorMsg";//No I18N
						message = Ember.I18n.t("webclient.audit.mailsettings.primary",this)+" "+response.error.message;//No I18N
					}
					opm_infoMsgs(addClasses,message);
					//Model 1
					var callBackFn = function(){
						openAssociateToProbes("MailServerSettings",true, undefined,false);//No I18N
					}
					initProbeAssociation("SETTINGS","MailServerSettings",undefined,callBackFn);//No I18N
				}
			}else{
				var secondaryResponse = opm_ajaxMultiPostRequest(mailUrl,formData);
				if(secondaryResponse !== undefined && !$.isEmptyObject(secondaryResponse))
				{
					if(secondaryResponse.result !== undefined)
					{
						self.set("model.secondary", self.mailObj); //No I18n
						addClasses = "successMsg";//No I18N
						message = Ember.I18n.t("webclient.audit.mailsettings.secondary",this)+" "+secondaryResponse.result.message;//No I18N
						 if(OPMClient.ApplicationController.fromSecRecPage){
							opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
						} else {
							setSecurityScore();
						}
					}
					else if(secondaryResponse.error !== undefined)
					{
						addClasses = "errorMsg";//No I18N
						message = Ember.I18n.t("webclient.audit.mailsettings.secondary",this)+" "+secondaryResponse.error.message;//No I18N
					}
					opm_infoMsgs(addClasses,message);
					//Model 1
					var callBackFn = function(){
						openAssociateToProbes("MailServerSettings",true, undefined,false);//No I18N
					}
					initProbeAssociation("SETTINGS","MailServerSettings",undefined,callBackFn);//No I18N
				}
			}
			if(OPMClient.ApplicationController.showEmergencyRoute && OPMClient.ApplicationController.showEmergencyRoute.indexOf("Settings.Basic.UpgradeInfo") !== -1) { //No I18N
				OPMClient.ApplicationController.set('showEmergencyPatch', true);	 //No I18N
				opm_transitionToTheRoute(OPMClient.ApplicationController.showEmergencyRoute);
			} else if(OPMClient.SettingsAddEditController.parentRoute !== "")
			{
				if(OPMClient.SettingsAddEditController.parentRoute.indexOf("Inventory.Device.Notification") !== -1){
					location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/Notification"; //No I18N
				} else if(OPMClient.SettingsAddEditController.parentRoute.indexOf("#/") !== -1) {
					location.href = OPMClient.SettingsAddEditController.parentRoute;
				}else{
					opm_transitionToTheRoute(OPMClient.SettingsAddEditController.parentRoute);
					if(OPMClient.SettingsAddEditController.parentRoute.indexOf("Settings.Notification.Add") !== -1){//No I18N
						setTimeout(function(){$('.NotifyProfile > li[data-value="Send Email"]').click();},1000);//No I18N
					}
				}
			}
			}
			checkIsCentralizedConfigSettingsProbeModified(callBackFunc,"MailServerSettings");//No I18N
		},
		cancelMail: function()
		{
			if(OPMClient.ApplicationController.fromSecRecPage){
				opm_transitionToParentRoute("Settings.Basic.SSLSettings.SecurityRecommendations"); //NO I18n
				return;
			}
			redirectToSettingsSummary();
		},
		toggleMailType: function(mailType) {
			var self = this;
			var primary = $.extend({}, this.get("model.primary"));
			var secondary = $.extend({}, this.get("model.secondary"));
			var model = {};
			if(mailType === "secondary" && (!primary || $.isEmptyObject(primary))) {
				opmAlertPopUp(Ember.I18n.t('webclient.map.flash.DeleteConfirmDialog'),Ember.I18n.t("webclient.mailserver.primary.empty"),500,"","","","",true); //NO I18N
				return;
			}
			this.set("currentMailType", mailType); //No I18n
			if(mailType === "primary") {
				this.set("isPrimary", true); //No I18n
				this.set("isSecondary", false); //No I18n
				this.set("mailObj", primary); //No I18n
				model = primary;
			}
			else if(mailType === "secondary") {
				this.set("isSecondary", true); //No I18n
				this.set("isPrimary", false); //No I18n
				this.set("mailObj", secondary); //No I18n
				model = secondary;
			}
			if(model) {
				Ember.run.schedule("afterRender", function() { //No I18n
					if(model.securemode === "on" || model.securemode === "true" || model.securemode === true) { //No I18N
						$("input[name=sslEnabled][value=ssl]").prop("checked",true); //No I18N
					} else if(model.tlsMode === "on" || model.tlsMode === "true" || model.tlsMode === true) { //No I18N
						$("input[name=sslEnabled][value=tls]").prop("checked",true); //No I18N
					} else {
						$("input[name=sslEnabled][value=none]").prop("checked", true); //No I18N
					}
					self.send("oauthProfileSelect"); //No I18n
				})
			}
		},
		addOauthProvider: function(type) {
			slideIn(10);
			this.set("controller.editOauthID", undefined); //No I18n
			this.set("controller.isAddEditOauth", true); //No I18n
		},
		closeSlide: function(success) {
			this.set("controller.isAddEditOauth", false); //No I18n
			slideOut(10);
			if(success) {
				this.send("oauthProfileSelect", true); //No I18n
			}
		}
	},
	/*keyDown: function(event) {
		enterKeyPress(event);
	},*/
	willDestroyElement: function()
	{
		OPMClient.ApplicationController.set("fromSecRecPage", undefined); //No I18N
		OPMClient.ApplicationController.set("showEmergencyRoute", undefined); //No I18N
		flag = false;
		OPMClient.SettingsAddEditController.parentRoute = "";
	}
})

OPMClient.AddOauthProviderComponent = Ember.Component.extend({
	redirectURI: window.OPM.oauthRedirectURI,
	clientIDInputType: "password", //No I18n
	clientSecretInputType: "password", //No I18n
	clientIDInputTypePwd: true,
	clientSecretInputTypePwd: true,
	secondaryEnable: true,
	oAuthProviders: (window.OPM.oauthProviders || []).map(function(item) {
        return { label: item.label, value: item.value };
    }),
    oAuthPreFills: (window.OPM.oauthProviders || []).reduce(function(acc, item) {
        acc[item.value] = { authURI: item.authURI, tokenURI: item.tokenURI };
        return acc;
    }, {}),
	grantTypeOptions: function() {
		return [
			{ label: Ember.I18n.t("webclient.oauth.grantType.authorizationCode"), value: "authorization_code" }, //No I18n
			{ label: Ember.I18n.t("webclient.oauth.grantType.clientCredentials"), value: "client_credentials" }, //No I18n
			{ label: Ember.I18n.t("webclient.oauth.grantType.password"), value: "password" } //No I18n
		];
	}.property(),
	isPasswordGrant: function() {
		return this.get("oauthObj.authProvider") === "ServiceNow"; //No I18n
	}.property("oauthObj.authProvider"), //No I18n
	showAuthURI: function() {
		return this.get("oauthObj.grantType") === "authorization_code"; //No I18n
	}.property("oauthObj.grantType"), //No I18n
	showRedirectURI: function() {
		return this.get("oauthObj.grantType") === "authorization_code"; //No I18n
	}.property("oauthObj.grantType"), //No I18n
	showResourceOwnerCreds: function() {
		return this.get("oauthObj.grantType") === "password"; //No I18n
	}.property("oauthObj.grantType"), //No I18n
	isGrantTypeLocked: function() {
		return !!this.get("editObj") || !!this.get("fromMailServer"); //No I18n
	}.property("editObj", "fromMailServer"), //No I18n
	init: function() {
	    this._super();
		this.set("oauthObj", {canEdit: true, grantType: "authorization_code"}); //No I18n
		this.set("boundAuthSuccess", this.get("authSuccess").bind(this)); //No I18n
		window.addEventListener("message", this.get("boundAuthSuccess"));
	},
	didInsertElement: function() {
		var editOauthID = this.get("editOauthID"); //No I18n
		if(editOauthID) {
			var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/getOAuthProvider?oauthID="+editOauthID); //No I18n
			response.canEdit = response.canEdit === 'true';
			if(!response.grantType) {
				response.grantType = "authorization_code"; //No I18n
			}
			this.set("editObj", response); //No I18n
			this.set("oauthObj", $.extend({},response)); //No I18n
			if(OPMClient.ApplicationController.addOAuthfromMSTeams) {
				$("#oauth_oauthProvider").parent().addClass("disabledBlock");
				$("#oauth_scope").addClass("disabledBlock");
			}
		}
		else {
			this.set("oauthObj", {authProvider: "Google", canEdit: true, grantType: "authorization_code"}); //No I18n
			if(OPMClient.ApplicationController.addOAuthfromMSTeams) {
				this.set("oauthObj", {authProvider: "Microsoft", canEdit: true, grantType: "authorization_code"}); //No I18n
				$("#oauth_oauthProvider").parent().addClass("disabledBlock");
				$("#oauth_scope").val("Channel.ReadBasic.All ChannelMessage.Send Team.ReadBasic.All offline_access");
				$("#oauth_scope").addClass("disabledBlock");
			}
		}
		Ember.run.schedule("afterRender", function() { //No I18n
			$("#oauth_grantType").select2();
		});
	},
	authSuccess: function(params) {
		var formData = this.get("oauthSubmitFormData"); //No I18n
		if(params.origin === window.origin && params.data && params.data.name === "oauth-verification") {
			if(params.data.errorMessage || !params.data.message) {
				opm_infoMsgs("errorMsg", opm_escapeHTML(params.data.errorMessage) + ": " + opm_escapeHTML(decodeURI(params.data.error_description))); // No I18n
				return;
			}
			formData.authCode = params.data.message;
			if(this.get("editObj")) {
				this.send("updateOauthProfile", formData); //No I18n
			}
			else {
				this.send("addOauthProfile", formData); //No I18n
			}
			this.set("oauthSubmitFormData", undefined); //NO I18n
		}
	},
	actions: {
		copyRedirectURI: function() {
			opm_CopyToClipBoard("#oauth_redirectURI"); //No I18n
			var self = this;
			self.set("copySuccess", true); //No I18n
			Ember.run.schedule("afterRender", function() { //No I18n
				setTimeout(function() {
					self.set("copySuccess", false); //No I18n
				}, 3000);
			})
		},
		revealCode: function(type) {
			if(type === "clientSecret") {
				this.set("clientSecretInputTypePwd", this.get("clientSecretInputTypePwd")? false : true); //No I18n
				this.set("clientSecretInputType", this.get("clientSecretInputType") === "password"? "text" : "password"); //No I18n
			}
			else {
				this.set("clientIDInputTypePwd", this.get("clientIDInputTypePwd")? false : true); //No I18n
				this.set("clientIDInputType", this.get("clientIDInputType") === "password"? "text" : "password"); //No I18n
			}
		},
		oauthSubmit: function(formData) {
			this.set("oauthSubmitFormData", formData); //No I18n
			var clientID = this.get("oauthObj.clientID");
			var scope = formData.scope;
			var authURI = this.get("oauthObj.authURI");
			var tokenURI = this.get("oauthObj.tokenURI");
			var redirectURI = this.get("redirectURI") + "&state=" + window.origin + "/html/OpmOAuthAuthorization.html?actionName=oauth-verification"; //No I18n
			window.open(authURI + "?scope=" + scope + "&client_id=" + clientID + "&tokenURI=" + tokenURI + "&redirect_uri="+redirectURI + "&response_type=code&prompt=consent&access_type=offline");
		},
		addOrEditOauthProvider: function() {
			var editObj = this.get("editObj"); //No I18n
			var profileName = $("#oauth_profileName").val();
			var description = $("#oauth_description").val();
			var clientID = $("#oauth_clientID").val();
			var clientSecret = $("#oauth_clientSecret").val();
			var scope = $("#oauth_scope").val();
			var grantType = $("#oauth_grantType").val() || "authorization_code"; //No I18n
			var authURI = $("#oauth_authURI").val();
			var tokenURI = $("#oauth_tokenURI").val();
			var redirectURI = $("#oauth_redirectURI").val();
			var timeout =  $("#oauth_timeout").val();
			var authProvider =  $("#oauth_oauthProvider").val();
			var resourceUsername = $("#oauth_resourceUsername").val();
			var resourcePassword = $("#oauth_resourcePassword").val();
			var emptyFields = ["oauth_profileName","oauth_timeout","oauth_grantType","oauth_oauthProvider","oauth_clientID","oauth_scope","oauth_tokenURI"]; //No I18n
			if(grantType === "authorization_code") { //No I18n
				emptyFields.push("oauth_authURI"); //No I18n
				emptyFields.push("oauth_redirectURI"); //No I18n
			}
			else if(grantType === "password") { //No I18n
				if(!editObj || resourceUsername || (editObj && editObj.resourceUsername !== resourceUsername)) {
					emptyFields.push("oauth_resourceUsername"); //No I18n
				}
				if(!editObj || resourcePassword) {
					emptyFields.push("oauth_resourcePassword"); //No I18n
				}
			}
			var maxCheck = {'oauth_profileName': '100','oauth_clientID': '150','oauth_scope': '150','oauth_tokenURI': '150','oauth_description': '255'}; //No I18n
			if(grantType === "authorization_code") { //No I18n
				maxCheck.oauth_authURI = '150'; //No I18n
				maxCheck.oauth_redirectURI = '150'; //No I18n
			}
			else if(grantType === "password") { //No I18n
				maxCheck.oauth_resourceUsername = '150'; //No I18n
				maxCheck.oauth_resourcePassword = '150'; //No I18n
			}
			var invalidEntries = {
				'empty': emptyFields, //No I18n
				'rangeCheck':{'oauth_timeout':300},'minRangeCheck':{'oauth_timeout':10}, //No I18n
				'maxCheck': maxCheck //No I18n
			};
			if(description !== "") {
				invalidEntries.descriptionMultiByte = ["oauth_description"];
			}
			var needsClientSecret = grantType !== "password" //No I18n
				&& (!editObj || !!clientSecret || editObj.clientID !== clientID);
			if(needsClientSecret) {
				invalidEntries.empty.push("oauth_clientSecret"); //No I18n
				invalidEntries.maxCheck.oauth_clientSecret = 1000;
			}
			if (checkCrossOriginPolicy('openerPolicy')) {
				return;
			}
			if(!opm_validateFields(invalidEntries)) {
				return;
			}
            //Microsoft scope exception case to append offline_access if not provided in input.
			if(authProvider === "Microsoft" && scope.toLowerCase().indexOf("offline_access") === -1) { //No I18n
				scope += " offline_access"; //No I18n
			}
			if(OPMClient.ApplicationController.addOAuthfromMSTeams){
				if(scope.toLowerCase().indexOf("offline_access") === -1 || scope.indexOf("Channel.ReadBasic.All") === -1 || scope.indexOf("ChannelMessage.Send") === -1 || scope.indexOf("Team.ReadBasic.All") === -1){

					$(".validateField").removeClass("error");//No I18N
					var emptyAlert = "webclient.this.field.containscopes";//No I18N
					var firstElement = "#oauth_scope"; //No I18N
					$("#oauth_scope").addClass('validateField error');//No I18N
					//$("#oauth_scope").attr('data-error',Ember.I18n.t(emptyAlert,this));//No I18N
					$(firstElement).focus();
					opmValidate($(firstElement));
					$('.validateField').on('focusin',function(){
						opmValidate($(this));
					});
					$('.validateField').on('focusout',function(){
						$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
					});

					opm_infoMsgs("errorMsg",Ember.I18n.t("webclient.this.field.containscopes",this));//No I18N
					return;
				}

			}
			var formData = {};
			formData.profileName = profileName;
			formData.clientID = clientID;
			formData.clientSecret = clientSecret;
			formData.scope = scope || "useraccount"; //No I18n
			formData.tokenURI = tokenURI;
			formData.description = description;
			formData.timeout = timeout;
			formData.authProvider = authProvider;
			formData.grantType = grantType;
			if(grantType === "authorization_code") { //No I18n
				// - default for ServiceNow
				formData.authURI = authURI || tokenURI; // - ServiceNow has no separate authURI
				formData.redirectURI = redirectURI;
			}
			else if(grantType === "password") { //No I18n
				if(resourceUsername) {
					formData.resourceUsername = resourceUsername;
				}
				if(resourcePassword) {
					formData.resourcePassword = resourcePassword;
				}
			}
			//AUTHENTICATE AGAIN CONDITION
			if(grantType === "authorization_code") { //No I18n
				if(!editObj || editObj.clientID !== clientID || editObj.tokenURI !== tokenURI || editObj.scope !== scope || clientSecret) {
					if(editObj) {
						formData.oauthID = editObj.oauthID;
						formData.authenticate = true;
					}
					this.send("oauthSubmit", formData);//No I18N
				} else {
					formData.oauthID = editObj.oauthID;
					formData.authenticate = false;
					this.send("updateOauthProfile", formData);//No I18N
				}
			}
			else {
				// client_credentials and password: no auth-code popup; submit directly
				var credsChanged = !editObj
					|| editObj.clientID !== clientID
					|| editObj.tokenURI !== tokenURI
					|| editObj.scope !== scope
					|| editObj.grantType !== grantType
					|| !!clientSecret
					|| (grantType === "password" && (editObj.resourceUsername !== resourceUsername || !!resourcePassword)); //No I18n
				if(editObj) {
					formData.oauthID = editObj.oauthID;
					formData.authenticate = !!credsChanged;
					this.send("updateOauthProfile", formData); //No I18n
				}
				else {
					this.send("addOauthProfile", formData); //No I18n
				}
			}
		},
		addOauthProfile: function(formData) {
			var self = this;
			var callBackFunc = function() {
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/v2/admin/addOAuthProvider", formData); //No I18n
			if(response.error) {
			    showMessage(response);
			} else {
          opm_infoMsgs("successMsg",response.message); //No I18n
          if(response.status === "success") {
          	if(response!=undefined && response.oauthID!=undefined){
			OPMClient.SettingsConfigurationController.set("OauthID",response.oauthID);//No I18n
							self.send('setOauthID',response); //No I18n
						}
            self.send('closeSlide', true); //No I18n

			//Model 1
			var callBackFn = function(){
				openAssociateToProbes("OAuthProvider",true, undefined,false);//No I18n
			}
			initProbeAssociation("SETTINGS","OAuthProvider",undefined,callBackFn);//No I18n
          }
            self.send('closeSlide', true); //No I18n

			//Model 1
			var callBackFn = function(){
				openAssociateToProbes("OAuthProvider",true, undefined,false);//No I18n
			}
			initProbeAssociation("SETTINGS","OAuthProvider",undefined,callBackFn);//No I18n
			}
			}
			checkIsCentralizedConfigSettingsProbeModified(callBackFunc,"OAuthProvider");//No I18N
		},
		updateOauthProfile: function(formData) {
			var self = this;
			var callBackFunc = function() {
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/v2/admin/updateOAuthProvider", formData); //No I18n
			showMessage(response);

			if(response!=undefined && response.oauthID!=undefined){
				OPMClient.SettingsConfigurationController.set("OauthID",response.oauthID);//No I18n
				self.send('setOauthID',response); //No I18n
				self.send('closeSlide', true); //No I18n
			} else {
				OPMClient.SettingsConfigurationController.set("OauthID",formData.oauthID);//No I18n
			}
			if(response.result) {
				self.send('closeSlide', true); //No I18n

			}

			//Model 1
			var callBackFn = function(){
				openAssociateToProbes("OAuthProvider",true, undefined,false);//No I18n
			}
			if( window.OPM.currentView.name!==undefined && window.OPM.currentView.name.indexOf("MSTeams") == -1) {
			//Model 1
			var callBackFn = function(){
				openAssociateToProbes("OAuthProvider",true, undefined,false);//No I18n
			}
			initProbeAssociation("SETTINGS","OAuthProvider",undefined,callBackFn);//No I18n
			}
			}
			checkIsCentralizedConfigSettingsProbeModified(callBackFunc,"OAuthProvider");//No I18N
		},
		closeSlide: function(success) {
			this.get('parentView').send('closeSlide', success); //No I18n
		},
		setOauthID:function(response){
			if(OPMClient.ApplicationController.addOAuthfromMSTeams){
				if(response!=undefined && response.oauthID!=undefined){
					OPMClient.ApplicationController.set("OauthID",response.oauthID); //No I18n
				}
			}
		}
	},
	willDestroyElement: function() {
	    this._super();
	    slideOut(10);
		window.removeEventListener("message", this.get("boundAuthSuccess")); //No I18n
	},
	oauthProviderChange: function() {
		var oauthObj = this.get("oauthObj");
		var editObj = this.get("editObj");
		var currentAuthProvider = oauthObj.authProvider;
		if(!currentAuthProvider) {
			return;
		}
		if(editObj && editObj.oauthID && currentAuthProvider === editObj.authProvider) {
			this.set("oauthObj.scope", editObj.scope); //No I18n
			this.set("oauthObj.authURI", editObj.authURI); //No I18n
			this.set("oauthObj.tokenURI", editObj.tokenURI); //No I18n
		} 
		else {
			this.set("oauthObj.authURI", this.oAuthPreFills[currentAuthProvider].authURI); //No I18n
			this.set("oauthObj.tokenURI", this.oAuthPreFills[currentAuthProvider].tokenURI); //No I18n
		}
		Ember.run.schedule("afterRender", function() { //No I18n
			$("#oauth_oauthProvider").change();
		})
	}.observes("oauthObj.authProvider"), //No I18n
	grantTypeChange: function() {
		var oauthObj = this.get("oauthObj");
		var editObj = this.get("editObj");
		if(!oauthObj || !oauthObj.grantType) {
			return;
		}
		var grantType = oauthObj.grantType;
		var isEditPreserve = editObj && editObj.grantType === grantType;
		if(grantType !== "authorization_code") { //No I18n
			if(!isEditPreserve) {
				this.set("oauthObj.authURI", ""); //No I18n
			}
		} else {
			if(!isEditPreserve) {
				var currentAuthProvider = oauthObj.authProvider;
				if(currentAuthProvider && this.oAuthPreFills && this.oAuthPreFills[currentAuthProvider]) {
					this.set("oauthObj.authURI", this.oAuthPreFills[currentAuthProvider].authURI); //No I18n
				}
			} else if(editObj && editObj.grantType === "authorization_code") { //No I18n
				this.set("oauthObj.authURI", editObj.authURI); //No I18n
			}
		}
		if(grantType !== "password") { //No I18n
			if(!isEditPreserve) {
				this.set("oauthObj.resourceUsername", ""); //No I18n
				this.set("oauthObj.resourcePassword", ""); //No I18n
			}
		}
	}.observes("oauthObj.grantType") //No I18n
})


OPMClient.LicenseExceedFrameComponent = Ember.Component.extend({
	licenseMessageDetails: {
		title: Ember.I18n.t("webclient.licensemgmt.exceeded.info"), //No I18n
		desc: Ember.I18n.t("webclient.licensemgmt.exceeded.option") + ' <a href="https://store.manageengine.com/opmanager/opmanager-plus-get-quote.html?utm_source=inproduct" class="opm_link" target="_blank">'+Ember.I18n.t("webclient.licensemgmt.exceeded.procure")+'</a>'
	},
	didInsertElement: function() {
		var self = this;
		if(window.OPM.showLicenseApplyPage) {
			self.set('showLicenseResolve', false); //No I18n
			self.set("addPadding", false);//No I18n
			var unauthorizedMessage = Ember.I18n.t("webclient.freeLicense.contactAdminAll");//No I18n
			if(window.OPM.isProbe || window.iscollector || window.OPM.isFWACollector || !window.OPM.isAllModulesFullAccessAdmin || (OPMClient.AppsApmDetailsController.apmInstalled && !window.OPM.isAPMFullAdmin)|| isNotMspAdmin()) {
				if(window.OPM.isMSPCentral) {
					unauthorizedMessage = Ember.I18n.t("webclient.freeLicense.contactMSPAdmin") //No I18n
				} else if(window.OPM.isProbe || window.iscollector || window.OPM.isFWACollector) {
					unauthorizedMessage = Ember.I18n.t("webclient.freeLicense.contactCentral", {param0: OPMClient.ApplicationController.centralUrl}); //No I18n
				} 
			} else {
				self.set("addPadding", true);//No I18n
				unauthorizedMessage = Ember.I18n.t("webclient.freeLicense.License.expiry");//No I18n
			}
			this.set("unauthorizedTitle",Ember.I18n.t("webclient.freeLicense.expiry.message")); //No I18n
			this.set("unauthorizedMessage", unauthorizedMessage); //No I18n
			return;
		}
		if(window.OPM.isProbe || !window.OPM.isAllModulesFullAccessAdmin || (OPMClient.AppsApmDetailsController.apmInstalled && !window.OPM.isAPMFullAdmin) || isNotMspAdmin()) {
			this.set('showLicenseResolve', false); //No I18n
			var unauthorizedMessage = Ember.I18n.t("webclient.settings.contactAdminAll"); //No I18n
			if(window.OPM.isMSPCentral) {
				unauthorizedMessage = Ember.I18n.t("webclient.settings.contactMSPAdmin"); //No I18n
			} else if(window.OPM.isProbe && window.OPM.isAllModulesFullAccessAdmin) {
				unauthorizedMessage = Ember.I18n.t("webclient.license.probe.message", {param0: Ember.I18n.t("webclient.license.devices"), param1 :OPMClient.ApplicationController.centralUrl}); //No I18n
			} else if(window.OPM.apmInstalled === "true" && window.OPM.isAllModulesFullAccessAdmin) {
				unauthorizedMessage = Ember.I18n.t("webclient.settings.APM.contactAdminAll"); //No I18n
			}
			this.set("unauthorizedTitle", Ember.I18n.t("webclient.licensemgmt.exceeded.info", this)); //No I18n
			this.set("unauthorizedMessage", unauthorizedMessage); //No I18n
			return;
		}
		this.set('showLicenseResolve', true); //No I18n
		var exceedDetails;
		if(window.OPM.isOPMPLUS) {
			var licenseInfo = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getLicenseInfoDetails?isLicenseExceededView=true'); //No I18n
			exceedDetails = licenseInfo.ExceededModuleDetails;
			this.send('setExceedDetails', exceedDetails); //No I18n
		} else if(window.OPM.isMSPCentral) {
			var licenseTabs = [];
			var model = this.get("model");
			var isAllocatePage = model && model.isAllocatePage;
			if(window.OPM.isMSPComponentExceeded || isAllocatePage) {
				licenseTabs.push({id: "devices", title: Ember.I18n.t('webclient.general.Devices'), pageType: "gridDisplay", exceedCheckAPI: isAllocatePage ? "/admin/isAnyDeviceCountExceeded": "/admin/isLicenseLimitExceeded"});//No I18n
			}
			if(window.OPM.isUserCountExceeded && !isAllocatePage) {
				licenseTabs.push({id: "users", title: Ember.I18n.t('webclient.Users'), pageType: "nonGridDisplay", exceedCheckAPI: "/admin/licenseDetails"});//No I18n
			}
			if(licenseTabs.length < 2) {
				this.set("hideLicenseTabs", true); //No I18n
			}
			this.set("licenseTabs", licenseTabs); //No I18n
			Ember.run.schedule("afterRender", function(){ //No I18n
				self.send("switchElementType", licenseTabs[0].id); //No I18n
			})
		}
	},
	actions: {
		applyLicense:function(){
			OPMClient.ApplicationController.set('showRegisterLicensePopup',true);//No I18N
		},
		goToStore: function() {
			if(window.OPM.isOPMPLUS) {
				window.open(OPMClient.ApplicationController.productSpecificStoreLink, "_blank"); //No I18n
			} else if(window.OPM.isMSPCentral) {
				window.open(getUTMConstructedLink(Ember.I18n.t("webclient.msp.purchaselink")), "_blank"); //No I18n
			} else {
				window.open(getProductSpecificStoreLink());
			}
		},
		mspLicenseInit: function() {
			var exceedDetails;
			this.set("selectProbeMessage", false);//No I18n
			var model = this.get("model"); //No I18n
			var currentTab = this.get("currentTab"); //No I18n
			this.set('showSearchCustomer', false); //No I18n
			this.set('showManagedDetails', false); //No I18n
			switch(currentTab) {
				case "devices": { //No I18n
					this.set('showManagedDetails', true); //No I18n
					this.set('showSearchCustomer', true); //No I18n
					$("#gridDisplay").show();
					$("#nonGridDisplay").hide();
					exceedDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getLicenseAllocationDetails?exceededComponents='+!model.isAllocatePage); //No I18n
					this.send('setExceedDetails', exceedDetails); //No I18n
				};break;
				case "users": { //No I18n
					this.set("licenseMessageDetails", {//No I18n
						title: Ember.I18n.t("webclient.licensemgmt.exceeded.info"),//No I18n
						desc: Ember.I18n.t("webclient.msp.allocated.licenseexceeed.users", {storeLink: getUTMConstructedLink(Ember.I18n.t("webclient.msp.purchaselink"))})//No I18n
					});
					$("#nonGridDisplay").show();
					$("#gridDisplay").hide();
					var licenseInfo = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/licenseDetails'); //No I18n
					var usersCount = licenseInfo.usersCount, usersMaxLimit = licenseInfo.usersMaxLimit;
					if(+usersCount > +usersMaxLimit) {
						this.set('model.exceededModuleDetails', [{ID: "Users", DisplayName: Ember.I18n.t('webclient.Users'),allowedCount: usersMaxLimit,usedCount: usersCount, isExceeded: true}]); //No I18n
					}
				};break;
			}
		},
		switchElementType: function(tabName) {
			var currentTabs = this.get("licenseTabs"); //No I18n
			this.set("currentTab", tabName); //No I18n
			var modifiedTabs = currentTabs.map(function(obj) {
				if(obj.id === tabName) {
					return $.extend({}, obj, {isActive: true});
				} else {
					return $.extend({}, obj, {isActive: false});
				}
			});
			this.set("licenseTabs", modifiedTabs); //No I18n
			this.send("mspLicenseInit"); //No I18n
		},
		currentTabResolved: function(tabName) {
			var licenseTabs = this.get("licenseTabs"); //No I18n
			var modifiedTabs = licenseTabs.filter(function(obj){
				return obj.id !== tabName;
			});
			this.set("licenseTabs", modifiedTabs); //No I18n
			if(modifiedTabs.length === 0) {
				if(this.get("model.isAllocatePage")) {
					this.send('closeCustomerResolve'); //No I18n
				} else {
					location.reload();
				}
				return;
			}
			else if(modifiedTabs.length < 2) {
				this.set("hideLicenseTabs", true); //No I18n
			}
			this.send("switchElementType", modifiedTabs[0].id); //No I18n
		},
		resolveModule: function(moduleID, fromButtonClick) {
			this.set('model.currentResolve', moduleID); //No I18n
			this.set('showFWAUnmanage', false); //No I18n
			this.set('showUserDelete', false); //No I18n
			this.set('showIPSLADelete', false); //No I18n
			this.set("showDPIUnmanageButton", false); //NO I18N
			if(fromButtonClick) {
				this.set("selectedProbeID", undefined); //NO I18N
			}
			if(moduleID === 'Elements') { //No I18n
				this.set('elementResolve', true); //No I18n
				this.set('hdrText',Ember.I18n.t('webclient.general.Devices',this));//No I18n
				var elementDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getLicenseInfoDetails'); //No I18n
				var elementModules = [
					{id:'Network',name:'network', displayName: Ember.I18n.t('opstor.inventory.network'), allowedCount: elementDetails.NetworkBundleCount, isHide: elementDetails.NetworkBundleCount < 1}, //No I18n
					{id: 'Server',name: 'sam', displayName: 'SAM', allowedCount: elementDetails.ServerBundleCount, isHide: elementDetails.ServerBundleCount < 1}, //No I18n
					{id: 'Storage',name: 'storage', displayName: Ember.I18n.t('webclient.Storage'), allowedCount: elementDetails.StorageBundleCount, isHide: elementDetails.StorageBundleCount < 1} //No I18n
				];
				var showElementIndex = 0;
				for(var i = 0; i < elementModules.length; i ++ ) {
					if(!elementModules[i].isHide) {
						showElementIndex = i;
						break;
					}
				}
				this.set('model.elementTabs', elementModules); //No I18n
				this.send('changeElementTab', elementModules[showElementIndex].id); //No I18n
			}
			else if(moduleID === 'Firewall'){
				this.set('elementResolve', false); //No I18n
				this.set('model.elementTabs',[]); //No I18n
				this.set('hdrText',Ember.I18n.t('webclient.admin.alarmesc.firewall',this));//No I18n
				this.set('model.elementInfo', undefined);//No I18n
				this.set('showFWAUnmanage',true);//No I18n
				if(window.OPM.isOPMPlusCentral && !this.get("selectedProbeID")) {
					this.set("selectedProbeMessage", Ember.I18n.t("webclient.home.servicedeskmsp.selectprobe")); //No I18n
					this.send('loadElementGrid', "Probes_"+moduleID, false);//NO I18N
					$("#nonElementTable").jqGrid("GridUnload");
				} else {
					var fwaDeviceUrl = window.OPM.apiUrlPattern + "/fwasettings/getFwaDevices"; //No I18N
					if(window.OPM.isOPMPlusCentral) {
						fwaDeviceUrl += "?selProbeId=" +this.get("selectedProbeID"); //No I18n
					}
					var rsp = opm_ajaxGetResponse(fwaDeviceUrl);
					if(rsp!==undefined){
						var colNames = ['',Ember.I18n.t('fwa.firewallListView.name',this),Ember.I18n.t('webclient.devices.details.vendor',this),Ember.I18n.t('webclient.devices.details.ipaddress',this), '']; //No I18N
						var colModel = [{ name: 'rid', index: 'rid',hidden:true}, //No I18N
							{ name: 'dispName', index: 'dispName'}, //No I18N
							{ name: 'vendor', index: 'vendor'}, //No I18N
							{ name: 'ip', index: 'ip'},//No I18N
							{ name: 'id', index: 'id',sortable:false,hidden:true} //No I18N
						];
						var defaultOptions = {multiselect:true,searchOption: true,minRowsPerPage: 50};
						$("#nonElementTable").jqGrid("GridUnload");
						Ember.run.schedule('afterRender', function() { //No I18n
							opm_loadJQgridWithData("#nonElementTable", rsp, colNames, colModel, "", "#nonElementPager", "", defaultOptions); //No I18N
							$('#nonElementTable').jqGrid('setGridWidth', $("#nonElementTable").closest('.opm_jqGridUI').width()-30);//No I18N
							if(isIEBrowser()) {
								$('#nonElementTable').closest('.opm_jqGridUI').addClass('IEsearchIconFix');
							}
						});
					}
				}
		    }else if(moduleID === 'IPSLA') {//No I18n
		    	this.set('elementResolve', false); //No I18n
				this.set('model.elementTabs',[]); //No I18n
				this.set('hdrText',Ember.I18n.t('webclient.IPSLA',this));//No I18n
				this.set('model.elementInfo', undefined);//No I18n
				if(window.OPM.isOPMPlusCentral && !this.get("selectedProbeID")) {
					this.set("selectedProbeMessage", Ember.I18n.t("webclient.home.servicedeskmsp.selectprobe")); //No I18n
					this.send('loadElementGrid', "Probes_"+moduleID, false);//NO I18N
					$("#nonElementTable").jqGrid("GridUnload");
				} else {
					this.set('showIPSLADelete',true);//No I18n
					var monitorURL = window.OPM.apiUrlPattern + "/admin/getActiveIpslaMonitorDetails"; //No I18N
					if(window.OPM.isOPMPlusCentral) {
						monitorURL += "?selProbeId=" +this.get("selectedProbeID"); //No I18n
					}
					var rsp = opm_ajaxGetResponse(monitorURL);
					if(rsp!==undefined){
						var colNames =
						[
							Ember.I18n.t('webclient.fault.addnotes.device_name',this), //No I18N
							Ember.I18n.t('webclient.devices.snapshot.addprocessmonitor.path',this), //No I18N
							Ember.I18n.t('webclient.map.type',this), //No I18N
							"",
							""
						];
						var colModel =
						[
							{ name: 'DeviceName', index:'DeviceName'}, //No I18N
							{ name: 'Path', index:'Path',formatter:displayMonitorPath}, //No I18N
							{ name: 'Type', index:'Type'}, //No I18N
							{ name: 'probeId', index:'probeId',hidden:true},//No I18N
							{ name: 'id', index: 'id',sortable:false,hidden:true} //No I18N
						];
						var defaultOptions = {multiselect:true,searchOption: true,minRowsPerPage: 50};
						$("#nonElementTable").jqGrid("GridUnload");
						Ember.run.schedule('afterRender', function() { //No I18n
							opm_loadJQgridWithData("#nonElementTable", rsp, colNames, colModel, "", "#nonElementPager", "", defaultOptions); //No I18N
							$('#nonElementTable').jqGrid('setGridWidth', $("#nonElementTable").closest('.opm_jqGridUI').width()-30);//No I18N
							if(isIEBrowser()) {
								$('#nonElementTable').closest('.opm_jqGridUI').addClass('IEsearchIconFix');
							}
						});
					}
				}
			} else if(moduleID === 'Users') {//No I18n
				this.set('elementResolve', false); //No I18n
				this.set('model.elementTabs',[]); //No I18n
				this.set('hdrText',Ember.I18n.t('webclient.Users',this));//No I18n
				this.set('model.elementInfo', undefined);//No I18n
				this.set('showUserDelete',true);//No I18n
				var usersURL = window.OPM.apiUrlPattern + "/nfausers/getAllUsers"; //No I18N
			    var rsp = opm_ajaxGetResponse(usersURL);
			    if(rsp!==undefined){
		            var colNames =
		            [
		                Ember.I18n.t('webclient.topo.name',this), //No I18N
		                Ember.I18n.t('webclient.admin.proxy.serverauth',this), //No I18N
		                Ember.I18n.t('webclient.socialit.groups.access',this), //No I18N
		                Ember.I18n.t('webclient.common.preferences.changepassword'), //No I18N
		                Ember.I18n.t('edituser.currentlogin',this), //No I18N
		                Ember.I18n.t('edituser.Previouslogin',this), //No I18N
		                "", //No I18N
		                Ember.I18n.t('webclient.fault.alarm.actions',this), //No I18N
		                "",
		                "",
		                "",
		                "",
                		""
		            ];
		            var colModel =
		            [
		                { name: 'uName', index:'uName',classes:"pointer", formatter: showNotSupportedUsers }, //No I18N
		                { name: 'authentication', index:'authentication',classes:"pointer"}, //No I18N
		                { name: 'uDesc', index:'uDesc',classes:"pointer"}, //No I18N
		                { name: 'assignPass', index:'assignPass',formatter:setAssignPwd,hidden:true}, //No I18N
		                { name: 'currentLogin', index:'currentLogin',classes:"pointer",hidden:true}, //No I18N
		                { name: 'prevLogin', index:'prevLogin',classes:"pointer",hidden:true}, //No I18N
		                { name: 'uID', index:'uID',hidden:true}, //No I18N
		                { name: 'actions', index:'actions',formatter:formatUserList,search:false,hidden:true}, //No I18N
		                { name: 'uAuth', index: 'uAuth',hidden:true}, //No I18N
		                { name: 'isLoginAllowed', index: 'isLoginAllowed',sortable:false,hidden:true}, //No I18N
		                { name: 'isCentralUser', index: 'isCentralUser',sortable:false,hidden:true}, //No I18N
		                { name: 'id', index: 'id',sortable:false,hidden:true}, //No I18N
		                { name: 'superadmin', index: 'superadmin',sortable:false,hidden:true} //No I18N
		            ];
		            var defaultOptions = {multiselect:true,searchOption: true,minRowsPerPage: 50};
					$("#nonElementTable").jqGrid("GridUnload");
		            Ember.run.schedule('afterRender', function() { //No I18n
						opm_loadJQgridWithData("#nonElementTable", rsp, colNames, colModel, "", "#nonElementPager", "userTable", defaultOptions); //No I18N
		            	$('#nonElementTable').jqGrid('setGridWidth', $("#nonElementTable").closest('.opm_jqGridUI').width()-30);//No I18N
						if(isIEBrowser()) {
							$('#nonElementTable').closest('.opm_jqGridUI').addClass('IEsearchIconFix');
						}
		            });
		        }
			}  else if(moduleID === "DPI"){ //NO I18N
				this.set("elementResolve", false); //NO I18N
				this.set("model.elementTabs", []); //NO I18N
				this.set("hdrText", Ember.I18n.t("dpi.engine.list")); //NO I18N
				this.set("model.elementInfo", {message: "", learnMoreLink: "https://www.manageengine.com/it-operations-management/opmanager-plus-licensing.html"}); //NO I18N
				this.set("showDPIUnmanageButton", true); //NO I18N
				if(window.OPM.isOPMPlusCentral && !this.get("selectedProbeID")) {
					this.set("selectedProbeMessage", Ember.I18n.t("webclient.home.servicedeskmsp.selectprobe")); //No I18n
					this.send('loadElementGrid', "Probes_"+moduleID, false);//NO I18N
					$("#nonElementTable").jqGrid("GridUnload");
				} else {
					var dpiUrl = window.OPM.apiUrlPattern+"/dpi/listDPIEngines"; //No I18n
					if(window.OPM.isOPMPlusCentral) {
						dpiUrl += "?selProbeId=" +this.get("selectedProbeID"); //No I18n
					}
					var response = nfa_getAjaxResponse(dpiUrl);
					var colNamesList = [Ember.I18n.t("dpi.engine.name"), Ember.I18n.t("jsp.commonstr.IpAddress"), ""]; //NO I18N
					var colModelList = [
						{name: "name",		index: "name"}, //NO I18N
						{name: "ip",		index: "ip"}, //NO I18N
						{name: "id",		index: "id",	hidden: true,	sortable: false} //NO I18N
					];
					var defaultOptions = {multiselect: true, searchOption: true, minRowsPerPage: 50};
					$("#nonElementTable").jqGrid("GridUnload");
					Ember.run.schedule("afterRender", function() { //NO I18N
						opm_loadJQgridWithData("#nonElementTable", response, colNamesList, colModelList, "", "#nonElementPager", "", defaultOptions); //NO I18N
						$("#nonElementTable").jqGrid("setGridWidth", $("#nonElementTable").closest(".opm_jqGridUI").width()-30); //NO I18N
						if(isIEBrowser()){
							$("#nonElementTable").closest(".opm_jqGridUI").addClass("IEsearchIconFix");
						}
					});
				}
			}
			else {
				this.set('elementResolve', false); //No I18n
			}
			var exceededModuleDetails = this.get('model.exceededModuleDetails').map(function(obj) {
				return obj.ID === moduleID ? $.extend({}, obj, {isActive: true}) : $.extend({}, obj, {isActive: false});
			});
			this.set('model.exceededModuleDetails', exceededModuleDetails); //No I18n
			$('.licenceDetails.exceeding').addClass('slideOpened'); //No I18n
		},
		unmanageFWADevice:function(){
			var selRowIds = $('#nonElementTable').jqGrid('getGridParam','selarrrow');//No I18N
	        if(!selRowIds || selRowIds.length===0){
	        	opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.select.onedevice",this));//No I18N
	        }else{
	        	var devList="";
	        	for(var i=0;i<selRowIds.length;i++)
				{
					devList = devList + $('#nonElementTable').jqGrid('getCell', selRowIds[i], 'rid')+',';//No I18N
				}
				devList = devList.slice(0,-1);
				var url = window.OPM.apiUrlPattern + '/fwasettings/manageFirewall?action=false&devIdList='+devList;//No I18N
				if(window.OPM.isOPMCentral && this.get("selectedProbeID")) {
					url = appendProbeIDForExternal(url, this.get("selectedProbeID"));
				}
				var response = opm_ajaxPostRequest(url); 
		        if(response !== undefined && !$.isEmptyObject(response))
		        {
		            if(response.isSuccess){
		                addClasses = "successMsg";//No I18N
		                message =response.message;
		            }else{
		                addClasses = "errorMsg";//No I18N
		                message = response.message;
		            }
		            opm_infoMsgs(addClasses,Ember.I18n.t(message,this));
		           	this.send("resolveModule","Firewall");//No I18N
		           	this.send("actionComplete");//No I18N
		        }
	        }
		},
		deleteIPSLADevice:function(){
			var selRowIds = $('#nonElementTable').jqGrid('getGridParam','selarrrow');//No I18N
	        if(!selRowIds || selRowIds.length===0){
	        	opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.select.onedevice",this));//No I18N
	        }else{
	        	var devList="";
	        	for(var i=0;i<selRowIds.length;i++)
				{
					devList = devList + $('#nonElementTable').jqGrid('getCell', selRowIds[i], 'probeId')+',';//No I18N
				}
				devList = devList.slice(0,-1);
				var self = this;
				var callBk = function(response){
					if(response !== undefined && !$.isEmptyObject(response))
			        {
			            if(response.result !== undefined){
			               opm_infoMsgs("successMsg",response.result.message);//No I18N
			               self.send("resolveModule","IPSLA");//No I18N
			               self.send("actionComplete");//No I18N
			            }else if(response.error !== undefined){
							opm_infoMsgs("errorMsg",response.error.message);//No I18N
						}
			        }
				}
				var url = window.OPM.apiUrlPattern + '/admin/deleteIpslaMonitor';//No I18N
				if(window.OPM.isOPMCentral && self.get("selectedProbeID")) {
					url = appendProbeIDForExternal(url, self.get("selectedProbeID"));
				}
				opm_ajaxPostRequestWithMsg(url,{probeId:devList},Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT',this),callBk); //No I18N
	        }
		},
		deleteUser:function(){
			var addClasses = "";//No I18N
	        var message = "";// No I18N
	        var selRowIds = $('#nonElementTable').jqGrid('getGridParam','selarrrow');//No I18N
	        if(!selRowIds || selRowIds.length===0){
	        	opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.admin.license.selectuser",this));//No I18N
	        }else{
	        	var userList = "";
	        	$.each(selRowIds, function(){
	        		var rowData = $('#nonElementTable').jqGrid("getRowData",this);//No I18N
	        		var userN = rowData.uName;
	        		if (userN.indexOf('</span>') !== -1 && $(userN).length !== 0) {
                        userN = $(userN).text();
                    }
	        		if(userN !== OPMClient.ApplicationController.superadminuser && (parseInt(rowData.uID) !== parseInt(window.OPM.userId)))
				    {
				    	userList += rowData.uID+',';
				    }
				});
				userList = userList.slice(0,-1);
				if(userList===""){
					opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.admin.license.selectuser",this));//No I18N
				}else{
					var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/admin/deleteUsers?userId='+userList); //No I18N
			        if(response !== undefined && !$.isEmptyObject(response))
			        {
			            if(response.result !== undefined)
			            {
			                addClasses = "successMsg";//No I18N
			                message =response.result.message;
			            }
			            else if(response.error !== undefined)
			            {
			                addClasses = "errorMsg";//No I18N
			                message = response.error.message;
			            }
			            opm_infoMsgs(addClasses,message);
						if(window.OPM.isOPMPLUS) {
							this.send("resolveModule","Users");//No I18N
						}
			           	this.send("actionComplete");//No I18N
			        }
				}
	        }
		},
		unmanageDPIEngine: function(){
			var selectedRowIDs = $("#nonElementTable").jqGrid("getGridParam", "selarrrow"); //NO I18N
			if(!selectedRowIDs || selectedRowIDs.length === 0){
				opm_infoMsgs("infoMsg", Ember.I18n.t("dpi.engine.selectMessage")); //NO I18N
			}else{
				var devicelist = nfa_getSelectedCheckBoxAsArray("nonElementTable", "id"); //NO I18N
				var callBackFunction = function(response, self){
					showMessage(response);
					if(response.error === undefined){
						self.send("resolveModule", "DPI"); //NO I18N
						self.send("actionComplete"); //NO I18N
					}
				};
				var url = window.OPM.apiUrlPattern+"/dpi/updateDPIState"; //No I18n
				if(window.OPM.isOPMCentral && this.get("selectedProbeID")) {
					url = appendProbeIDForExternal(url, this.get("selectedProbeID"));
				}
				nfa_postAjaxResponseWithAsync(url, {task: "unmanage", devicelist: JSON.stringify(devicelist)}, callBackFunction, this, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
			}
		},
		changeElementTab: function(elementModule) {
			$('.licenceDetails.exceeding').addClass('slideOpened'); //No I18n
			var elements = [];
			var elementInfo = {
				message: '',
				learnMoreLink: ''
			}
			var self = this;
			self.set('countBubble',false);//No I18n
			Ember.run.schedule('afterRender',function () {//No I18n
				self.set('countBubble',true);//No I18n
			})
			var monitoringObj =	{ 'id': "Monitoring", displayName: Ember.I18n.t('webclient.action.monitoring'), elementName: Ember.I18n.t('webclient.general.Devices'), gridApi: "/v2/device/listDevices?excludeStorage=true&excludeAP=true&isLicenseView=true&isManaged=true", actionNames: ['delete', 'manage'], serverPagination: true, responseID: 'OPM'};//No I18n
			var storageObj = {'id': "Storage", displayName: Ember.I18n.t("webclient.Storage"), elementName: Ember.I18n.t('webclient.general.Disks'), gridApi: "/storage/getStorageManagedDevicesForLicense?isOpmPlusLicenseView=true", actionNames: ['delete','manage'], responseID: 'Storage'}; //No I18n
			var apObj = { 'id': "AccessPoints", displayName: Ember.I18n.t('webclient.general.accesspoints.tab'), elementName: Ember.I18n.t('webclient.snapshot.name.APs'), gridApi: "/v2/wireless/getWLCDevices?isAPCountExceedView=true", actionNames: ['delete','manage'], responseID: 'WLC'}; //No I18n
			var liteDeviceObj = { 'id': "LiteDevices", displayName: Ember.I18n.t("webclient.general.liteDevices.tab"), elementName: Ember.I18n.t('webclient.general.Devices'), gridApi: "/v2/device/listDevices?excludeStorage=true&excludeAP=true&isLicenseView=true&isManaged=true", actionNames: ['delete', 'manage'], responseID: 'Lite'}; //No I18n
			var spmObj = { 'id': "SPM", displayName: Ember.I18n.t('webclient.SPM'), elementName: Ember.I18n.t('opu.spm.Ports'), gridApi: "/spm/getAllSwitchesSummary", actionNames: ['delete'], serverPagination: true, isDeleteAction: true, responseID: 'SPM'}; //No I18n
			var ipamObj = { 'id': "IPAM", displayName: Ember.I18n.t('webclient.IPAM'), elementName: Ember.I18n.t('webclient.snapshot.name.IPs'), gridApi: "/ipam/getAllSubnetSummary", actionNames: ['delete'], serverPagination: true, isDeleteAction: true, responseID: 'IPAM'};//No I18n
			if(elementModule === 'Network')	{
				elements = [
					monitoringObj,
					{ 'id': "Flow", displayName: Ember.I18n.t('Flow'), elementName: Ember.I18n.t('interfaces'), gridApi: "/device/listDevices", gridApi: "/nfaadmin/listDevicesForLicenseDetails?state="+encodeURIComponent("[0]"), actionNames: ['delete','manage']}, //No I18n
					liteDeviceObj,
					ipamObj,
					spmObj
					]
				elementInfo.message = Ember.I18n.t('webclient.licensemgmt.networkmessage'); //No I18n
				elementInfo.learnMoreLink = 'https://www.manageengine.com/it-operations-management/opmanager-plus-licensing.html'; //No I18n
			}
			else if(elementModule === 'Server') {
				elements = [
					{ 'id': "Server", displayName: Ember.I18n.t('webclient.admin.alarmesc.servers'), elementName: Ember.I18n.t('webclient.general.Devices'), gridApi: "/admin/getSAMBundleMonitorDetails?samCategory=servers&managed=true", actionNames: ['manage']}, //No I18n
					{ 'id': "Applications", displayName: Ember.I18n.t('webclient.common.appmanager.servertab.title'), elementName: Ember.I18n.t('webclient.appmanager.applications'), gridApi: "/admin/getSAMBundleMonitorDetails?samCategory=applications&managed=true", actionNames: ['manage']}, //No I18n
					{ 'id': "InternetServices", displayName: Ember.I18n.t('webclient.licensemgmt.internetservices'), elementName: Ember.I18n.t('nfa.apm.services'), gridApi: "/admin/getSAMBundleMonitorDetails?samCategory=internetServices&managed=true", actionNames: ['manage']} //No I18n
				]
				elementInfo.message = Ember.I18n.t('webclient.licensemgmt.sammessage'); //No I18n
				elementInfo.learnMoreLink = 'https://www.manageengine.com/it-operations-management/opmanager-plus-licensing.html'; //No I18n
			}
			else if(elementModule === 'Storage') {
				elements = [
					storageObj
				]
				elementInfo.message = Ember.I18n.t('webclient.licensemgmt.storagemessage'); //No I18n
				elementInfo.learnMoreLink = 'https://www.manageengine.com/it-operations-management/opmanager-plus-licensing.html'; //No I18n
			}
			else if(elementModule === 'Customers')	{
				elements = [
					monitoringObj,
					liteDeviceObj,
					{ 'id': "NCM", displayName: Ember.I18n.t('webclient.license.ncmDevices'), elementName: Ember.I18n.t('webclient.license.ncmDevices'), gridApi: "/device/getNCMDeviceDetails", actionNames: ['delete','manage'], noFilter: true, responseID: 'NCM'}, //No I18n
					apObj,
					{ 'id': "IPSLA", displayName: Ember.I18n.t('webclient.IPSLA'), elementName: Ember.I18n.t('webclient.IPSLA'), gridApi: "/admin/getActiveIpslaMonitorDetails", actionNames: ['delete','manage'], serverPagination: false, noFilter: true, isDeleteAction: true, responseID: 'IPSLA'}, //No I18n
					storageObj,
					{ 'id': "URLMonitors", displayName: Ember.I18n.t('webclient.devices.snapshot.urlmonitorName'), elementName: Ember.I18n.t('webclient.admin.url.monitors'), gridApi: "/admin/listAllURLs", actionNames: ['delete','manage'],  noFilter: true, responseID: 'URL'}, //No I18n
					ipamObj,
					spmObj,
					{ 'id': "Flow", displayName: Ember.I18n.t('Flow'),elementName: Ember.I18n.t('interfaces'), gridApi: "/device/listDevices", gridApi: "/nfaadmin/listDevicesForLicenseDetails?state="+encodeURIComponent("[0]"), actionNames: ['delete','manage'],  noFilter: true, responseID: 'NFA'} //No I18n
				]
			}
			if(window.OPM.isOPMPLUS) {
				var pageName;
				var elementTabs = this.get('model.elementTabs');
				elementTabs = elementTabs ? this.get('model.elementTabs').map(function(obj) {
					return obj.id === elementModule ? (pageName=obj.name,$.extend({}, obj, {isActive: true})) : $.extend({}, obj, {isActive: false});
				}) : [];
				this.set('model.elementTabs', elementTabs); //No I18n
				this.set('model.elementInfo', elementInfo); //No I18n
				this.set('model.apiParam', elementModule); //No I18n
				this.set('model.page', pageName); //No I18n
				var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getLicenseInfoDetails?type="+ elementModule); //No I18n
				var primaryObj = elements.filter(function(obj){return response.PrimaryModule === obj.id})[0];
				if(primaryObj) {
					this.set('model.primary', {'id': primaryObj.id, 'name': primaryObj.displayName, 'count': response.PrimaryModuleCount}); //No I18n
				}
			} else if(window.OPM.isMSPCentral) {
				var currentCustomer = this.get("currentCustomer"); //No I18n
				self.set("selectedLiteDevice", undefined); //No I18n
			}
			var fetchCurrentProbeSelectedElement = function (selectedProbeDetails, id) {
				return selectedProbeDetails.deviceDetails.filter(function(obj) {
					return obj.elementType === id;
				});
			}
			if(!window.OPM.isOPMPLUS) {
				var primaryIndex;
				for(var i = 0; i < elements.length; i ++ ) {
					elements[i].tableID = elements[i].id + '-table';
					elements[i].pagerID = elements[i].id + '-pager';
					elements[i].accordionID = elements[i].id + '-accordion';
					elements[i].filterArray = getFilterArray(this, elements[i].id, 'licenseExceed');
					if(window.OPM.isMSPCentral) {
						var currentElement = currentCustomer.elementDetails.filter(function(obj) {
							return obj.elementType === elements[i].responseID;
						});
						var selectedProbeDetails = this.get("selectedProbeDetails"); //No I18n
						var currentProbeSelectedElement = fetchCurrentProbeSelectedElement(selectedProbeDetails, elements[i].responseID);
						if(currentElement.length > 0) {
							if(this.get("model.isAllocatePage")) {
								elements[i].totalCount = currentElement[0].allocatedCount;
							} else {
								elements[i].totalCount = currentElement[0].purchasedCount;
							}
							elements[i].usedElementsCount = currentProbeSelectedElement[0].addedCount ? currentProbeSelectedElement[0].addedCount : currentElement[0].usedCount;
							if(elements[i].usedElementsCount < 1) {
								elements[i].isDisabled = true
							}
						} else {
							elements[i].isHide = true;
						}
					}
				}
				if(window.OPM.isMSPCentral) {
					elements.sort(function(obj1, obj2){return obj2.usedElementsCount - obj1.usedElementsCount})
				}
				//NOTE: SWAPPING TO SHOW PRIMARY FIRST
				if(primaryIndex) {
					elements.unshift(elements[primaryIndex]);
					elements.splice(primaryIndex + 1, 1);
				}
			}
			this.set('model.elements', elements); //No I18n
			if(window.OPM.isOPMPLUS) {
				if(window.OPM.isOPMPlusCentral) {
					this.set("selectedProbeMessage", Ember.I18n.t("webclient.home.servicedeskmsp.selectprobe")); //No I18n
					this.set('showButtons', false); //No I18n
				} else {
					this.set('showButtons', true); //No I18n
				}
				$('#licenseExceedTable').jqGrid('GridUnload');
				this.set('model.licenseElements',elements); //No I18n
			}else {
				this.send('accordionToggle', elements[0].id); //No I18n
			}
		},
		accordionToggle: function(id) {
			var self = this;
			Ember.run.schedule('afterRender', function() { //No I18n
				$('#' + id +'-accordion .accordion1__cont').toggle();
				if($('#' + id +'-accordion .accordion1__nav').hasClass('active')) {
					$('#' + id +'-accordion .accordion1__nav').removeClass('active');
					if(id === 'LiteDevices') {
						self.set('showAccordionGrid', false); //No I18n
					}
					return;
				}
				$('#' + id +'-accordion .accordion1__nav').addClass('active');
				self.send('loadElementGrid', id, false); //No I18n
			})
		},
		toggleFilter: function(id) {
			if(window.OPM.isOPMPLUS) {
				this.get('controller.filters.showFilter') ? this.set('controller.filters.showFilter',false) : this.set('controller.filters.showFilter',true); //No I18n
			} else {
 				$('#' + id + '-accordion .accordion1__cont .filter-block').toggle();
			}
		},
		toggleLiteFilter: function() {
			$('#mspLiteDeviceSelector').toggleClass('active');
		},
		toggleProbe: function() {
			$('#licenseProbeSelector').toggleClass('active');
		},
		setUnmanaged: function(module) {
			var modelName = window.OPM.isOPMPLUS ? 'model.licenseElements' : 'model.elements';//No I18n
			this.set('model.currentModule', this.get(modelName).filter(function(element){return element.id === module})[0])
			manageElementsForLicense('licenseExceed', this, false); //No I18n
		},
		deleteElements: function(module) {
			var modelName = window.OPM.isOPMPLUS ? 'model.licenseElements' : 'model.elements';//No I18n
			this.set('model.currentModule', this.get(modelName).filter(function(element){return element.id === module})[0])
			deleteElementsForLicense('licenseExceed', this); //No I18n
		},
		closeResolveSlide: function() {
			$('.licenceDetails.exceeding').removeClass('slideOpened'); //No I18n
			var currentTab = this.get("currentTab"); //No I18n
			if(window.OPM.isOPMPlusCentral) {
				this.set('selectedProbeID', undefined); //No I18n
			}
			if(window.OPM.isMSPCentral && currentTab === "devices") {
				updateCustomerRegionAjaxOnly(-1,-1)
				this.send("slideCloseGridToggle"); //No I18n
			}
			else if(window.OPM.isOPMPLUS || currentTab === "users") {
				var exceededModuleDetails = this.get('model.exceededModuleDetails').map(function(obj) {
					return $.extend({}, obj, {isActive: false});
				});
				this.set('model.exceededModuleDetails', exceededModuleDetails); //No I18n
			}
		},
		loadElementGrid: function(module, isFilter) {
			if(window.OPM.isOPMPlusCentral && this.get("selectedProbeID")) {
				module += "_" + this.get("selectedProbeID");
			}
			loadLicenseGrid(this, module, isFilter, 'licenseExceed'); //No I18n
			if(!isFilter) {
				window.OPM.isOPMPlusCentral ? $('#license_resetGrid').addClass("disabledBlock") : $('#' + module + '-accordion ' + '.filter-block .plain-btn-link').addClass('disabledBlock');
			}
		},
		loadGrid : function(module, isFilter) {
			this.send('loadElementGrid',module,isFilter); //No I18n
		},
		resetFilterAndGrid: function(module) {
			if(window.OPM.isOPMPLUS) {
				$('.filter-block select').prop('selectedIndex',0).trigger('change');
				$('.filter-block input').val('');
			} else {
				$('#' + module + '-accordion ' + '.filter-block select').prop('selectedIndex',0).trigger('change')
				$('#' + module + '-accordion ' + '.filter-block input').val('');
			}
			this.send('loadElementGrid', module); //No I18n
		},
		actionComplete: function() {
			if(window.OPM.isOPMPLUS) {
				var oldExceededModuleDetails = this.get('model.exceededModuleDetails'); //No I18n
				var newExceededModuleDetails = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getLicenseInfoDetails?isLicenseExceededView=true').ExceededModuleDetails; //No I18n
				var resolvedBundle;
				for(var i = 0; i < oldExceededModuleDetails.length; i ++) {
					var isResolved = true;
					for(var j = 0; j < newExceededModuleDetails.length; j ++) {
						if(oldExceededModuleDetails[i].ID === newExceededModuleDetails[j].ID) {
							isResolved = false;
							break;
						}
					}
					if(isResolved) {
						resolvedBundle = oldExceededModuleDetails[i];
						break;
					}
				}
				if(resolvedBundle) {
					//Perform animation
					$('.licenceDetails.exceeding').removeClass('slideOpened'); //No I18n
					$('#' + resolvedBundle.ID + ' .opmBtn').addClass('success')
					$('#' + resolvedBundle.ID).slideUp(1000);
					var self = this;
					if(window.OPM.isOPMPlusCentral) {
						self.set("selectedProbeID", undefined); //No I18n
					}
					setTimeout(function() {
						self.send('setExceedDetails', newExceededModuleDetails); //No I18n
						if(newExceededModuleDetails.length === 0) {
							location.reload();
						}
					}, 1000);
				}
				else {
					var currentResolve = this.get('model.currentResolve');
					this.send('setExceedDetails', newExceededModuleDetails); //No I18n
					this.send('resolveModule', currentResolve); //No I18n
				}
			}
			else if(window.OPM.isMSPCentral) {
				var currentTab = this.get("currentTab");
				var currentTabObj = this.get("licenseTabs").filter(function(obj){
					return currentTab === obj.id;
				})[0];
				var exceedAPIResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + currentTabObj.exceedCheckAPI);
				var resolved = false;
				switch(currentTab) {
					case "devices": { //No I18n
						var self = this;
						Ember.View.views['licenseExceedShowAllManagedDetailsComp'].rerender();
						var model = this.get("model");
						if(model.isAllocatePage) {
							resolved = exceedAPIResponse.isCountExceed === false;
						} else {
							resolved = exceedAPIResponse.isLicenseExceed === false;
						}
					};break;
					case "users": { //No I18n
						var usersCount = exceedAPIResponse.usersCount, usersMaxLimit = exceedAPIResponse.usersMaxLimit;
						if(usersCount <= usersMaxLimit) {
							resolved = true;
						}
					};break;
				}
				this.send("closeResolveSlide"); //NO I18n
				if(resolved) {
					this.send('currentTabResolved', currentTab); //No I18n
				} else {
					this.send("switchElementType", currentTab); //No I18n
				}
			}
		},
		slideCloseGridToggle: function() {
			var currentGridProperties = this.get("currentGridProperties"); //No I18n
			if(currentGridProperties.colModel && currentGridProperties.defaultHiddenColumns) {
				var toShowColumns = currentGridProperties.colModel.filter(function(obj) {
					return currentGridProperties.defaultHiddenColumns.indexOf(obj.name) === -1;
				}).map(function(obj){return obj.name});
				$("#licenseResolveTable").jqGrid('hideCol', currentGridProperties.defaultHiddenColumns);
				$("#licenseResolveTable").jqGrid('showCol', toShowColumns);
				$("#licenseResolveTable").jqGrid('setGridWidth', 1200);
			}
			$('.customerResolve').removeClass("active"); //No I18n
			$('.customerEditAllocation').removeClass("active"); //No I18n
			this.set("currentAction", "exceedingCustomers"); //No I18n
			this.send("setBreadcrumbHeaders", "licenseLimit"); //NO I18n
		},
		setBreadcrumbHeaders: function(currentPageName) {
			var headers = [
				{id: "customers", pageName: Ember.I18n.t("webclient.settings.customers")}, //No I18n
				{id: "licenseLimit", pageName: Ember.I18n.t("webclient.msp.allocated.licenselimit")}, //No I18n
				{id: "resolve", pageName: Ember.I18n.t("opu.common.RESOLVE")} //No I18n
			]
			var displayHeaders = [];
			for(var i=0; i < headers.length; i ++) {
				displayHeaders.push(headers[i]);
				if(headers[i].id === currentPageName) {
					break;
				}
			}
			displayHeaders[displayHeaders.length - 1].lastPage = true;
			this.set("breadCrumbHeaders", displayHeaders); //No I18n
		},
		setExceedDetails: function(exceedDetails) {
			if(!exceedDetails) {
				return;
			}
			if(window.OPM.isOPMPLUS) {
				exceedDetails = exceedDetails.map(function(obj) {
					return parseInt(obj.usedCount) > parseInt(obj.allowedCount) ? $.extend({}, obj, {isExceeded: true}) : obj;
				})
				this.set('model.exceededModuleDetails', exceedDetails); //No I18n
			}
			if(window.OPM.isMSPCentral) {
				var isAllocatePage = this.get("model").isAllocatePage;
				var defaultOptions = {};
				this.set("currentAction", "exceedingCustomers"); //No I18n
				var licenseResolveTable = "#licenseResolveTable"; //No I18n
				var colModel = [], colNames = [],finalGridData = [],resolveHideColumns = [],resolveShowColumns = [],defaultHiddenColumns = [];
				var actionObj = { name: 'actions', index:'actions',formatter: function(cellValue, options, rowdata, action) {//No I18n
					return (rowdata.isProbeInstalled ? ("<div class='opmBtn customerResolve' title='"+Ember.I18n.t("opu.common.RESOLVE")+"' data-customerid='"+escapeHTML(rowdata.customerID)+"' data-customername='"+escapeHTML(rowdata.customerName)+"'>" + Ember.I18n.t("opu.common.RESOLVE") + "</div>") : "") + (isAllocatePage ?("&nbsp;&nbsp;<div class='opmBtn customerEditAllocation'  title='"+Ember.I18n.t("webclient.msp.edit.allocation")+"' data-customerid='"+escapeHTML(rowdata.customerID)+"' data-customername='"+escapeHTML(rowdata.customerName)+"'>" + Ember.I18n.t("webclient.msp.edit.allocation") + "</div>"): "");
				},search:false,cellattr: cellMergeRows, width: 25, sortable: false, search: false};

				if(isAllocatePage) {
					this.send("setBreadcrumbHeaders", "licenseLimit"); //No I18n
					colNames = [Ember.I18n.t("webclient.settings.customer.name"),Ember.I18n.t("Dashboard.resources"),Ember.I18n.t("webclient.msp.customer.allocated"),Ember.I18n.t("opstor.inventory.lightning.cache.used"),"", Ember.I18n.t("webclient.map.filemonitor.templates.actions"), '', '', '', ''];//No I18n
					colModel = [
						{name: "customerName", index: "customerName", cellattr: cellMergeRows, width:20},//No I18n
						{name: "displayName", index: "displayName", width: 20,sortable:false, search: false},//No I18n
						{name: "allocatedCount", index: "allocatedCount", width: 20,sortable:false, search: false},//No I18n
						{name: "usedCount", index: "usedCount",width:20,sortable:false, search: false, formatter: function(cellValue, options, rowdata, action) {//No I18n
							return rowdata.isLimitExceed ? "<span class='bold text-red'>"+escapeHTML(rowdata.usedCount)+"</span>" : escapeHTML(rowdata.usedCount);
						}},
						{name: "customerID", index: "customerID", hidden: true},//No I18n
						actionObj,
						{name:'isLimitExceedForCus', index:'isLimitExceedForCus', hidden:true},//No I18n
						{name:'isLimitExceed', index:'isLimitExceed', hidden:true},//No I18n
						{name:'isProbeInstalled', index:'isProbeInstalled', hidden:true},//No I18n
						{name:'attr', index:'attr', hidden: true}//No I18n
					];
					resolveShowColumns = ["customerName", "displayName","actions"];//No I18n
					defaultHiddenColumns = ["customerID","id","attr", "isLimitExceed", "isLimitExceedForCus", "isProbeInstalled"];//No I18n
					var totalRowCount = 0;
					for(var i=0; i< exceedDetails.length; i++) {
						exceedDetails[i].elementDetails = exceedDetails[i].elementDetails.sort(function(ob1, ob2){
							return ob2.isLimitExceed - ob1.isLimitExceed;
						})
						var isLimitExceedForCus = false;
						for(var j=0; j < exceedDetails[i].elementDetails.length; j++) {
							if(j === 0 && exceedDetails[i].elementDetails[j].isLimitExceed) {
								isLimitExceedForCus = true;
							}
							finalGridData.push($.extend({isLimitExceedForCus: isLimitExceedForCus}, exceedDetails[i], exceedDetails[i].elementDetails[j], j === 0 ? {attr: {customerName:{rowspan: exceedDetails[i].elementDetails.length}, actions:{rowspan: exceedDetails[i].elementDetails.length}}} : {attr: {customerName:{display: "none"}, actions:{display: "none"}}}));
							totalRowCount++;
						}
					}
					defaultOptions.rowList = [];
					var numberOfCustPerPage = 8;
					var numberOfElemPerPage = 6;//Need to change if new elements added
					defaultOptions.minRowsPerPage = numberOfElemPerPage * numberOfCustPerPage; 
					this.set("licenseMessageDetails", {//No I18n
						title: Ember.I18n.t("webclient.msp.allocated.validation.alert"),//No I18n
						desc: Ember.I18n.t("webclient.msp.allocated.exceeded.desc")//No I18n
					});
				} else {
					colNames = [Ember.I18n.t("webclient.settings.customer.name"), Ember.I18n.t("webclient.msp.allocated.allocationtype") ,"",Ember.I18n.t("Dashboard.resources") , Ember.I18n.t("webclient.msp.allocated.resourcesused") , '',"", Ember.I18n.t("webclient.map.filemonitor.templates.actions")];//No I18n
					colModel = [
						{name: "customerName", index: "customerName", width:25},//No I18n
						{name: "allocationType", index: "allocationType", width:25},//No I18n
						{name: "customerID", index: "customerID", hidden: true},//No I18n
						{name: "resources", index: "resources", formatter: function(cellValue, options, rowdata, action){return rowdata.resources;}, hidden: true, width:25, sortable: false},//No I18n
						{name: "resourcesUsed", index: "resourcesUsed", formatter: function(cellValue, options, rowdata, action) {return rowdata.resourcesUsed;}, hidden: true, width:25, sortable: false},//No I18n
						{name:'isProbeInstalled', index:'isProbeInstalled', hidden:true},//No I18n
						{name: 'attr', index:'attr', hidden: true},//No I18n	
						actionObj
					];
					var dynamicColNames = [], dynamicColModels = [];
					var uniqueElements = {}, exceeedDisplayNames = "";
					for(var i=0; i< exceedDetails.length; i++) {
						var currentElement = {};
						var resources = "", resourcesUsed = "";
						for(var j=0; j < exceedDetails[i].elementDetails.length; j++) {
							currentElement[exceedDetails[i].elementDetails[j].elementType] = $.extend({},exceedDetails[i].elementDetails[j]);
							uniqueElements[exceedDetails[i].elementDetails[j].elementType] = $.extend({},exceedDetails[i].elementDetails[j]);
							resources += escapeHTML(exceedDetails[i].elementDetails[j].displayName) + (j === exceedDetails[i].elementDetails.length -1 ? "" : "<br/>");
							resourcesUsed += escapeHTML(exceedDetails[i].elementDetails[j].usedCount) + (j === exceedDetails[i].elementDetails.length -1 ? "" : "<br/>");
						}
						finalGridData.push($.extend({resources: resources, resourcesUsed: resourcesUsed}, exceedDetails[i], currentElement));
					}
					$.each(uniqueElements, function(key, obj) {
						dynamicColNames.push(obj.displayName);
						dynamicColModels.push({name: key, index: key, width: 30, formatter: function(cellValue, options, rowdata, action) {
							if(rowdata[key] && rowdata[key].usedCount !== undefined) {
								return "<span title='"+Ember.I18n.t("webclient.msp.customer.allocated")+": " + rowdata[key].allocatedCount + "'>"+escapeHTML(rowdata[key].usedCount)+"</span>";
							}
							return "-";
						}, sorttype: function(cell,obj){return obj[key] && obj[key].usedCount ? obj[key].usedCount : 0}});
						exceeedDisplayNames += obj.displayName + ", ";
					});
					exceeedDisplayNames = exceeedDisplayNames.replace(/\,\s$/, ''); //No I18n
					resolveShowColumns = ["customerName", "resources","resourcesUsed","actions"];//No I18n
					defaultHiddenColumns = ["customerID", "resources", "resourcesUsed","id", "isProbeInstalled", "attr"];//No I18n
					colNames.splice.apply(colNames, [colNames.length-3, 0].concat(dynamicColNames));
					colModel.splice.apply(colModel, [colModel.length-3, 0].concat(dynamicColModels));
					this.set("licenseMessageDetails.desc", Ember.I18n.t("webclient.msp.allocated.licenseexceeed.components", {exceededComponents: exceeedDisplayNames, storeLink: getUTMConstructedLink(Ember.I18n.t("webclient.msp.purchaselink"))}));//No I18n
				}
				this.set("currentGridProperties", {colModel: colModel, defaultHiddenColumns: defaultHiddenColumns}); //No I18N
				var resolveHideColumns = colModel.filter(function(obj) {
					return resolveShowColumns.indexOf(obj.name) === -1;
				}).map(function(obj){return obj.name});

				var self = this;
				Ember.run.schedule("afterRender", function() {//No I18n
					$(licenseResolveTable).jqGrid("GridUnload"); //No I18N
					opm_loadJQgridWithData(licenseResolveTable, finalGridData, colNames, colModel, "", "#licenseResolvePager", "", defaultOptions);
					$(licenseResolveTable).jqGrid('setGridWidth', 1200);

					//Search Customer
					$("#liceneExceed_searchCus").keyup(function() {
						if(isAllocatePage) {
							$('#licenseExceed_showAllCust').trigger('change'); //No I18n
						}
						else {
							$("#gs_customerName").val($("#liceneExceed_searchCus").val()).keydown();
						}
					});
					//Toggle Show All Customers Checkbox
					if(isAllocatePage) {
						$('#licenseExceed_showAllCust').change(function() {
							if(!this.checked) {
								var filter = {
									"groupOp": "AND", //No I18n
									"rules"://No I18n
									[
										{ "field": "isLimitExceedForCus", "op": "eq", "data":  true},//No I18n
										{ "field": "customerName", "op": "cn", "data": $("#liceneExceed_searchCus").val()} //No I18n
									]
								};
								$(licenseResolveTable).jqGrid('setGridParam', { search: true, postData: { filters: filter } });//No I18n
								$(licenseResolveTable).trigger("reloadGrid");//No I18n
							} else {
								var filter = {
									"groupOp": "cn", //No I18n
									"rules"://No I18n
									[
										{ "field": "customerName", "op": "cn", "data": $("#liceneExceed_searchCus").val()} //No I18n
									]
								};
								$(licenseResolveTable).jqGrid('setGridParam', { search: true, postData: { "filters": filter} }).trigger("reloadGrid");//No I18n
							}
						}).trigger("change");//No I18n
					}
					//Resolve Button handling
					$(licenseResolveTable).off("click",".customerResolve").on("click", ".customerResolve", function(e) {
						$("#customerAllocateDiv").hide();
						$("#elementResolveDiv").show();
						self.set("selectedProbeMessage", Ember.I18n.t("webclient.home.servicedeskmsp.selectprobe")); //No I18n
						var customerID = e.target.getAttribute("data-customerid"), customerName = e.target.getAttribute("data-customername");
						$("#licenseExceed_probeSelector").off('click').on('click', function () {
							$(this).toggleClass('active');
						})
						//Probe Selector Init based on selected customer
						$('.customerEditAllocation').removeClass("active"); //No I18n
						self.set("selectedCustomerID",customerID); //No I18n
						var probeData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getProbeElementDetailsOfCustomer',{customerID: customerID}); //No I18n
						var probeColName = ["", Ember.I18n.t("webclient.admin.probes.probename"), "", ""];//No I18n
						var probeColModel = [
							{name: "selectProbe", index: "selectProbe", sortable: false, formatter: function(cellValue, options, rowdata, action) {//No I18n
								return '<div class="opmRadioBtn">' +//No I18n
								'<div>' +//No I18n
									'<input type="radio" name="licenseExceed_probeSelectorRadio" value='+escapeHTML(rowdata.probeID)+'>' +//No I18n
									' <label></label>' +//No I18n
								'</div>' +//No I18n
							'</div>' //No I18n
							}, width: 40},
							{name: "probeDisplayName", index: "probeDisplayName"},//No I18n
							{name: "probeID", index: "probeID",hidden: true},//No I18n
							{name: "isProbeUp", index: "isProbeUp",hidden: true}//No I18n
						];

						var dynamicProbeColNames = [], dynamicProbeColModels = [],uniqueProbeElements = {}, finalProbeGridData,finalProbeGridData = [];
						for(var i=0; i< probeData.length; i++) {
							var currentProbe = {};
							for(var j=0; j < probeData[i].deviceDetails.length; j++) {
								currentProbe[probeData[i].deviceDetails[j].elementType] = $.extend({},probeData[i].deviceDetails[j]);
								if(!uniqueProbeElements[probeData[i].deviceDetails[j].elementType] || probeData[i].deviceDetails[j].addedCount > 0) {
									uniqueProbeElements[probeData[i].deviceDetails[j].elementType] = $.extend({},probeData[i].deviceDetails[j]);
								}
							}
							finalProbeGridData.push($.extend({}, probeData[i], currentProbe));
						}
						$.each(uniqueProbeElements, function(key, obj) {
							if(obj.addedCount > 0) {
								dynamicProbeColNames.push(obj.displayName);
								dynamicProbeColModels.push({name: key, index: key, formatter: function(cellValue, options, rowdata, action) {
									return rowdata[key].addedCount;
								}});
							}
						});
						probeColName= probeColName.concat(dynamicProbeColNames);
						probeColModel = probeColModel.concat(dynamicProbeColModels);
						var probeSelectTable = "#licenseExceed_probeSelectorTable"; //No I18n
						$(probeSelectTable).jqGrid("GridUnload"); //No I18N
						opm_loadJQgridWithData(probeSelectTable, finalProbeGridData, probeColName, probeColModel, "", "#licenseExceed_probeSelectorPager", "license_exceed_probeSelect_function", {});//No I18n
						self.set('elementResolve', true); //No I18n
						//Show Probe Select by default
						$("#licenseExceed_accordions").hide();
						$("#licenseExceed_probeSelector").addClass("active"); //No I18n
						self.set("selectProbeMessage", true);//No I18n
						$('.licenceDetails.exceeding').addClass('slideOpened'); //No I18n

						$('.customerResolve').removeClass("active"); //No I18n
						$(e.target).addClass("active");
						$(licenseResolveTable).jqGrid('hideCol', resolveHideColumns);
						$(licenseResolveTable).jqGrid('showCol', resolveShowColumns);
						self.set('hdrText', Ember.I18n.t("opu.common.RESOLVE") + ": " + customerName);//No I18n
						self.set("currentCustomer", finalGridData.filter(function(obj){//No I18n
							return obj.customerID === customerID;
						})[0]);
						$(probeSelectTable).off("click", "input[name='licenseExceed_probeSelectorRadio']").on("click", "input[name='licenseExceed_probeSelectorRadio']", function(e) {
							var regionID = e.target.value;
							updateCustomerRegionAjaxOnly(customerID, regionID);
							$("#licenseExceed_probeSelector").removeClass("active"); //No I18n
							var selectedProbeDetails = probeData.filter(function(obj) {return obj.probeID == regionID})[0]
							self.set("selectedProbeDetails", selectedProbeDetails); //No I18n
							self.set("selectedProbeMessage", selectedProbeDetails.probeDisplayName); //No I18n
							self.send("changeElementTab", "Customers"); //No I18n
							$("#licenseExceed_accordions").show();
							self.set("selectedProbeID", regionID); //No I18n
							self.set("selectedCustomerID", customerID); //No I18n
							self.set("selectProbeMessage", false);//No I18n
						});
						self.set("currentAction", "resolve"); //No I18n
						self.send("setBreadcrumbHeaders", "resolve"); //NO I18n
						$(probeSelectTable).jqGrid('setGridWidth', $(".license_manage").width() - 40);
						$(licenseResolveTable).jqGrid('setGridWidth', 700);
					})
					$(licenseResolveTable).off("click",".customerEditAllocation").on("click", ".customerEditAllocation", function(e) {
						var customerID = e.target.getAttribute("data-customerid"), customerName = e.target.getAttribute("data-customername");
						self.set("hdrText", "License Allocation: " + customerName);//No I18n
						self.set("selectProbeMessage", false);//No I18n
						self.send("closeResolveSlide"); //No I18n
						OPMClient.ApplicationController.set('allocatedDetails', undefined);//No I18N
						Ember.run.schedule("afterRender", function() { //No I18n
							editMspCustomerAllocation(self, 'actionComplete', customerID, "closeResolveSlide");
						})
						$(licenseResolveTable).jqGrid('hideCol', resolveHideColumns);
						$(licenseResolveTable).jqGrid('showCol', resolveShowColumns);
						$("#customerAllocateDiv").show();
						$("#elementResolveDiv").hide();
						$('.customerEditAllocation').removeClass("active"); //No I18n
						$('.customerResolve').removeClass("active"); //No I18n
						$(this).addClass("active");
					});
				});
			}
		},
		toggleElementCalculation: function(event) {
			$(event.target).toggleClass('active');
		},
		closeCustomerResolve: function() {
			this.get("parentView").set("controller.customerResolveModel", undefined); //No I18n
			if(this.get("model.isAllocatePage")) {
				emberRouteRefresh(OPMClient.ApplicationController.currentPath);
				opm_emberViewRerender(OPMClient.ApplicationController.currentPath);
			}
		},
		toggleResolveDisable: function() {
			$(".license_manage__content").toggleClass("disabledBlock"); //No I18n
		}
	}
});

OPMClient.OpmCommonSlideHandlerComponent = Ember.Component.extend({
	templateName: "components/opm-common-slide-handler",//No I18N
	didInsertElement: function() {
		var slideDetails = this.get('slideDetails');
		if(slideDetails !=undefined){
		    if(slideDetails.id!= undefined){
		        slideInWithId(slideDetails.id);
		    }
            if(slideDetails.isFull!=undefined && slideDetails.isFull) {
                $('.slide-overlay').removeClass('block');
            }
			//When multiple slides are present, show only the current slide.
			$('.slide-overlay').removeClass('block');
			$('.slide-overlay.'+slideDetails.id).addClass('block');
		}
	},
	actions : {
		goToChildAction: function() {
			Ember.View.views[this.get('slideDetails').id].send(this.get('slideDetails').childActionName, true);
		},
		closeAction: function() {
			var self = this;
			slideOutWithId(self.get('slideDetails').id);
			if(this.get('slideDetails').actionName) {
				this.get('slideDetails').parentObj.send(this.get('slideDetails').actionName);
			} else {
				setTimeout (function() {
					
					//Associate Probes Slide.
					if(self.get('slideDetails')!==undefined && self.get('slideDetails.id')!==undefined && self.get('slideDetails.id')==="AssociateProbes"){//No I18N
						OPMClient.SettingsConfigurationController.set("associateProbesSlideDetails", undefined);//No I18N
						return;
					}
					else if(self.get('slideDetails.id')==="groups_map"){//No I18N
						OPMClient.GroupingController.set("mapSlideDetails",undefined);//No I18N
					}
					else if(self.get('slideDetails.id')==="Inventory_CreateGraphicalReports" && OPMClient.GroupingController.graphicalReportSlideDetails!==undefined){//No I18N
						OPMClient.GroupingController.set("graphicalReportSlideDetails",undefined);//No I18N
					}
					else if(self.get('slideDetails.id')==="pingResponse" || self.get('slideDetails.id')==="mapInterface"){//No I18N
		       		     OPMClient.InventoryOpmDeviceListController.set("pingRespSlideDetails",undefined);//No I18N
		         	}
		         	else if(self.get('slideDetails.id')==="opm_listProfiles"){//No I18N
		            	OPMClient.HomeDetailsController.set("slideDetails",undefined);//No I18N
		         	}
		         	else{
			         	self.get('parentView').set("controller.slideDetails",undefined);//No I18N
					}
			/*---------------------------------------------
				Custom View Slide handling
			---------------------------------------------*/
			if(self.get('slideDetails.id')==="customView"){//No I18N
				OPMClient.AlarmFilterArrayController.set("customViewSlideDetails",undefined);//No I18N
			}
                    if(self.get('slideDetails.id')==="disable_trap_for_devices"){//No I18N
                        closeTrapSlide();
                    }
					if(self.get('slideDetails').callBackFunc!==undefined){//No I18N
						self.get('slideDetails').callBackFunc();//No I18N
					}
				},500);
			}
			Ember.run.schedule("afterRender", function() {//No I18n
				if($('.slide-overlay').length > 0) {
					$('.slide-overlay').first().addClass('block');
				}
			});
		}
	}
});

OPMClient.LoadingBubbleComponent = Ember.Component.extend({
	templateName: "components/loading-bubble",//No I18N
	didInsertElement: function() {
		var infoMsg = this.get('msg');
		var header = this.get('header');
		if(infoMsg!==undefined) {
			var i18nmsg1 = infoMsg ?  Ember.I18n.t(infoMsg,this) : '';
			if(i18nmsg1.indexOf("Missing translation")<0){
				this.set('msg',i18nmsg1); //No I18N
			}
		}
		if(header!==undefined) {
			var i18nmsg2 = header ?  Ember.I18n.t(header,this) : '';
			if(i18nmsg2.indexOf("Missing translation")<0){
				this.set('header',i18nmsg2); //No I18N
			}
		}
	}
});

OPMClient.DisableTrapForDevicesComponent = Ember.Component.extend({
	templateName: "components/disable_trap_for_devices",//No I18N
	didInsertElement: function() {
		checkAndShowTrapDisableDropDown([], true);
	},
	actions: {
		configureDisableTrapForDevices:function(){
			var data={};
			var devList = $("#disableTrapForDevices .chkChild");//No I18n
			var devListArr = [];
			$.each(devList, function(key, val)
			{
				if($(val).is(":checked") === true){
					devListArr.push(($(val).val()));
				}
			});

			if(devListArr.length > 0){
				data.disabledDevices = devListArr.toString();
			}
			else{
				data.disabledDevices = "-1";
			}
			data.parserID = OPMClient.SettingsAddEditController.selParserID;
			result = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/admin/disableTrapParserForDevice",data);//No I18n
			slideSuccessHandler(result,"opm_SettingsGlobalMonitorsGridLoad",OPMClient.SettingsTabController.monitorName); //No I18N
			closeTrapSlide();
		},
		cancelOperation:function()
		{
			closeTrapSlide();
		}
	},
	willDestroyElement: function(){
		closeTrapSlide();
	}
});

OPMClient.CustomTimeReportsComponent = Ember.Component.extend({
	templateName: "components/custom-time-reports",//No I18N
	didInsertElement: function() {
		var date = setScheduleTime();
		this.set('controller.date',date);//No I18N
		$("#startat").datepicker({ dateFormat: 'yy-mm-dd', maxDate: new Date()}); 
		$("#endat").datepicker({ dateFormat: 'yy-mm-dd', maxDate: new Date()}); 
	},
	actions: {
		saveCustomTime : function() {
			var self = this;
			self.get('slideDetails').parentObj.send('saveCustomTime');//No I18N
		},
		cancelCustomTime : function() {
			//Send Action to Common Slider close to avoid repeated code
			this.get('parentView').send('closeAction');//No I18N 
		}
	}
});

OPMClient.BulkModifyAlarmRulesComponent = Ember.Component.extend({
	templateName: "components/bulk_modify_alarm_rules",//No I18N
	didInsertElement: function() {
		$('.select2').select2();
	},
	actions: {
		bulkModifyAlarmRules:function(){
			var selRowIds = $("#defaultAlarmRuleTable").jqGrid('getGridParam','selarrrow');//No I18N
			var selProfileIds = [];
			$.each(selRowIds, function(){
				selProfileIds.push($("#defaultAlarmRuleTable").jqGrid('getCell', this, 'profileID'));//No I18N
			});
			var data = {};
			data.profileID = selProfileIds.toString();
			data.severity = $("#severitySelect").val();
			data.manage = $("#alarmRuleStatus").prop('checked');
			showMessage(opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/alarm/manageAlarmRules", data)); //No I18n
			slideOutWithId('bulk_modify_alarm_rules'); //No I18N
			reloadDefAlarmRules();
		},
		cancelOperation:function()
		{
			OPMClient.SettingsAddEditController.set("bulkModifyAlarmRulesSlide",undefined);//No I18N
			slideOutWithId('bulk_modify_alarm_rules'); //No I18N
		}
	},
	willDestroyElement: function(){
			OPMClient.SettingsAddEditController.set("bulkModifyAlarmRulesSlide",undefined);//No I18N
			slideOutWithId('bulk_modify_alarm_rules'); //No I18N
	}
});

//IgnoreI18n_Start
OPMClient.ViewReportLogsComponent = Ember.Component.extend({
	templateName: "components/viewReportLogs",//No I18N
	didInsertElement: function() {
		var	reportId = OPMClient.ReportsDetailsController.reportId;
		$("#AdvancedReportsLogs").jqGrid('GridUnload');
		var reportType = 'DefaultReport';//No I18N
		var name = Ember.I18n.t('webclient.reports.ReportName',this);
		if(OPMClient.ApplicationController.currentPath.indexOf('Advanced') > -1) {
			reportType = 'AdvancedReport';//No I18N
		}else if(OPMClient.ApplicationController.currentPath === "Home.Dashboard.index"){
			name = Ember.I18n.t('webclient.Widget.Name',this);
			reportType = 'CustomWidget';//No I18N
		}
		var url = window.OPM.apiUrlPattern + '/reports/viewReportLogs?reportId='+reportId+'&type='+reportType;//No I18N
		var jsonData = opm_ajaxGetResponse(url); //No I18N
		if(jsonData.error!==undefined && jsonData.error.message!==undefined) {
			opm_infoMsgs('errorMsg',jsonData.error.message);//No I18N
			this.send('closeSlide');
		}
		if(jsonData.STATUS!==undefined && jsonData.STATUS === 'FAILED') {
			opm_infoMsgs('errorMsg',jsonData.MESSAGE);//No I18N
			this.send('closeSlide');
		}
		colNames = [name,Ember.I18n.t('webclient.map.sort.severity',this),Ember.I18n.t('webclient.map.message',this),'logTime',Ember.I18n.t('webclient.vimonitor.Time',this)];//NO I18N
		colModel =[
			{name:'reportName', index:'reportName'},//NO I18N
			{name:'logType', index:'logType'},//NO I18N
			{name:'message',index:'message'},//NO I18N
			{name:'logTime',index:'logTime',hidden:true},//NO I18N
			{name:'readableTime',index:'readableTime'}//NO I18N
		];
		var defaultOptions = {minRowsPerPage:10,Search:false,searchOption:true,toggleSearch:false,hideCSV:true,hideExcel:true};
		Ember.run.schedule("afterRender", function() {//NO I18N
			// var tableWidth=$('.slideContentContainer').width()-20;
			// $("#AdvancedReportsLogs").jqGrid('setGridWidth', tableWidth-50);
			opm_loadJQgridWithData("#AdvancedReportsLogs",jsonData.DATA,colNames,colModel,"","","",defaultOptions); //No I18N
			$("#AdvancedReportsLogs").jqGrid('sortGrid','logTime', true, 'desc');//No I18N
		})
	},
	actions: {
		closeSlide : function() {
			//Send Action to Common Slider close to avoid repeated code
			this.get('parentView').send('closeAction');//No I18N
		}
	}
});
//IgnoreI18n_End

OPMClient.CITemplateAccordianComponent = Ember.Component.extend({
		templateName: "components/CITemplate-Accordian",//No I18N
		httpMethods:[{"name":"GET", "value":"GET"},{"name":"POST", "value":"POST"},{"name":"PUT", "value":"PUT"},{"name":"DELETE", "value":"DELETE"},{"name":"PATCH", "value":"PATCH"},{"name":"HEAD", "value":"HEAD"}],//No I18N
		payloadTypes:[{"name":"Text", "value":"Text"},{"name":"XML", "value":"XML"},{"name":"JSON", "value":"JSON"},{"name":"JavaScript", "value":"JavaScript"},{"name":"HTML", "value":"HTML"},{"name":"NONE", "value":"NONE"}],//No I18N
		postOperation : true,
		didInsertElement: function() {
			var self = this;
			if(self.get("accordionDetails.webhookheaders") != "" && self.get("accordionDetails.webhookheaders") !=undefined ){
                var headerArray = self.get('accordionDetails.webhookheaders');
                for(var j=0;j<headerArray.length;j++){
                    if(j< (headerArray.length-1)){
                        headerArray[j].showDelete=true;
                    }
                }
                self.set("accordionDetails.webhookheaders", headerArray);//No I18n
            }
            if(self.get("accordionDetails.Webhookcustom") != "" && self.get("accordionDetails.Webhookcustom") !=undefined ){
                var webhookCustom = self.get("accordionDetails.Webhookcustom");
                for(var j=0;j<webhookCustom.length;j++){
                    if(j< (webhookCustom.length-1)){
                        webhookCustom[j].showDelete=true;
                    }
                }
                 self.set("accordionDetails.Webhookcustom", webhookCustom);//No I18n
            }
			Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
			    if(self.get("accordionDetails.operation") == "add"){
		            $("#"+ self.get("accordionDetails.ID")).addClass('active');
                    $("#"+ self.get("accordionDetails.ID")).next('.accordion1__cont').slideDown(); //No I18n
                }

                if(self.get("accordionDetails.Webhookcustom") != "" && self.get("accordionDetails.Webhookcustom") !=undefined ){
                    var webhookCustom = self.get("accordionDetails.Webhookcustom");
                    if(webhookCustom.length > 0 && webhookCustom[0].key == "Body-content"){
                        self.set("accordionDetails.bodyContent",webhookCustom[0].value);
                        var customArray=[];
                        var newIndex=0;
                        customArray.pushObject({arrayIndex : (newIndex), keyId:self.get('accordionDetails.operation')+"_customkeyId"+(newIndex), key : "", value : "", valueId:self.get('accordionDetails.operation')+"_customValueId"+(newIndex), showDelete : false});//No I18n
                        self.set("accordionDetails.Webhookcustom", customArray);//No I18n
                    }
                }

			});

            var maintabs = new Array();
            var inside=new Array();
            var jsonData;
            if(dropDownOptions === "")
            {

                var mailVariablesForNP = OPMClient.SettingsNotificationsController.get('mailVariables');
                jsonData = mailVariablesForNP ? mailVariablesForNP : opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables"); //No I18n
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
            }

            self.set("dropdownvalues", maintabs);//No I18n
            OPMClient.SettingsConfigurationController.set('dropdownoptions',maintabs);//No I18N
			Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
				$("input[name="+this.get("accordionDetails.operation")+"_dataType][value='"+this.get("accordionDetails.dataType")+"']").prop("checked", true);//No I18n
				$("input[name=authentication][value='"+this.get("accordionDetails.authType")+"']").prop("checked", true);
				// this.set("accordionDetails.payLoad", this.get("accordionDetails.payLoad"));//No I18n
				var httpMethod = this.get("accordionDetails.method");
				//Need to modify the below change.
				this.set("accordionDetails.method", undefined);//No I18n
				this.set("accordionDetails.method", httpMethod);//No I18n

				var payload = this.get("accordionDetails.payLoad");
				//Need to modify the below change.
				this.set("accordionDetails.payLoad", undefined);//No I18n
				this.set("accordionDetails.payLoad", payload);//No I18n
				$(".select2").select2();
			});

		},payloadObserver : function(){
			var self = this;
			var isUpdated = false;
			var headerArray = self.get('accordionDetails.webhookheaders');
			var headerValue = "";
			if(self.get("accordionDetails.dataType") != undefined && self.get("accordionDetails.dataType") == 'raw' && ($("input[name="+self.get("accordionDetails.operation")+"_dataType][value='raw']").prop("checked")== undefined || ($("input[name="+self.get("accordionDetails.operation")+"_dataType][value='raw']").prop("checked")!= undefined && $("input[name="+self.get("accordionDetails.operation")+"_dataType][value='raw']").prop("checked"))) && (this.get('accordionDetails.method') === 'POST' || this.get('accordionDetails.method') === 'PATCH' || this.get('accordionDetails.method') === 'PUT')){
				if(self.get("accordionDetails.payLoad") == "Text"){
					headerValue = "text/plain";//No I18n
				}
				else if(self.get("accordionDetails.payLoad") == "XML"){
					headerValue = "application/xml";//No I18n
				}
				else if(self.get("accordionDetails.payLoad") == "JSON"){
					headerValue = "application/json";//No I18n
				}
				else if(self.get("accordionDetails.payLoad") == "JavaScript"){
					headerValue = "application/javascript";//No I18n
				}
				else if(self.get("accordionDetails.payLoad") == "HTML"){
					headerValue = "text/html";//No I18n
				}	

                this.send("deleteContentType"); //No I18n
				var index=-1;
                if(headerArray.length > 0){
                    $("#"+headerArray[headerArray.length - 1].valueId+"_Btn").removeClass("btnPlus");
                    $("#"+headerArray[headerArray.length - 1].valueId+"_Btn").addClass("deleteBtn");
                    index= headerArray[headerArray.length -1].arrayIndex;
                    if(headerArray[headerArray.length - 1].key=="" && headerArray[headerArray.length - 1].value==""){
                        headerArray.removeAt(headerArray.length - 1);
                    }

               }
               headerArray.pushObject({arrayIndex : index+1, keyId:self.get("accordionDetails.operation")+"_headerkeyId"+(index+1), key : "Content-Type", value : headerValue, valueId:self.get("accordionDetails.operation")+"_headerValueId"+(index+1), showDelete : false});//No I18n

				self.set("accordionDetails.webhookheaders", headerArray);//No I18n
			}
		}.observes('accordionDetails.payLoad'),//No I18n
		methodObserver : function(){
		if(this.get('accordionDetails.method')!==undefined){
			if((this.get('accordionDetails.method') === 'POST' || this.get('accordionDetails.method') === 'PATCH' || this.get('accordionDetails.method') === 'PUT')){
				// $("#postOperationsDiv").show();
				this.set("postOperation", true);//No I18n
				this.send("dataTypeChange",this.get("accordionDetails.dataType"));//No I18n
				var payload = this.get("accordionDetails.payLoad");
				//Need to modify the below change.
				this.set("accordionDetails.payLoad", undefined);//No I18n
				this.set("accordionDetails.payLoad", payload);//No I18n
			}else{
				var self = this;
				Ember.run.schedule("afterRender", function() {//No I18N
					// $("#postOperationsDiv").hide();
					self.set("postOperation", false);//No I18n
				});
				self.send("deleteContentType"); //No I18n
			}
		}
		}.observes('accordionDetails.method'),//No I18n
		actions : {
		    deleteContentType:function() {
            			var header = this.get('accordionDetails.webhookheaders');
            			 for(var j=0;j<header.length;j++){
            					if(header[j].key ==="Content-Type"){
            						header.removeAt(j);
            					}
            			}
            			var index=-1;
            			if(header.length ==0){
            			    header.pushObject({arrayIndex : index+1, keyId:this.get("accordionDetails.operation")+"_headerkeyId"+(index+1), key : "", value : "", valueId:this.get("accordionDetails.operation")+"_headerValueId"+(index+1), showDelete : false});//No I18n
            			}
            			this.set("accordionDetails.webhookheaders", header);//No I18n

            },
		    activeDeactiveArrow: function(id){
                if ($("#"+ id).hasClass('active')){
		            $("#"+ id).removeClass('active');
	                $("#"+ id).next('.accordion1__cont').slideUp();

		        }
		        else{
		            $(".accordion1__nav").removeClass('active');
		            $(".accordion1__nav").next('.accordion1__cont').slideUp();
		            $("#" + id).addClass('active');
                    $("#" + id).next('.accordion1__cont').slideDown();
		        }

		    },
		    advancedconfigSettings: function(){
		        if ($(".show-more").hasClass('active')){
                    $(".show-more").removeClass('active');
                     $('.advanceconfig').slideUp();

		        }else{
		            $(".show-more").addClass('active');
		             $('.advanceconfig').slideDown();
		        }
		    },
			dataTypeChange : function(dType){
				var self = this;
				self.set("accordionDetails.dataType", dType);//No I18n
				var self = this;
				var isUpdated = false;
				var headerArray = self.get('accordionDetails.webhookheaders');
				for(var j=0;j<headerArray.length;j++){
                    if(j< (headerArray.length-1)){
                        headerArray[j].showDelete=true;
                    }
                }
				var headerValue = "";
				if(!$("input[name="+self.get("accordionDetails.operation")+"_dataType][value='raw']").prop("checked")){
					if(dType == "form-urlencoded"){
						headerValue = "application/x-www-form-urlencoded";//No I18n
					}
					else{
						headerValue = "multipart/form-data";//No I18n
					}	
				}else{
					if(self.get("accordionDetails.payLoad") == "Text"){
						headerValue = "text/plain";//No I18n
					}
					else if(self.get("accordionDetails.payLoad") == "XML"){
						headerValue = "application/xml";//No I18n
					}
					else if(self.get("accordionDetails.payLoad") == "JSON"){
						headerValue = "application/json";//No I18n
					}
					else if(self.get("accordionDetails.payLoad") == "JavaScript"){
						headerValue = "application/javascript";//No I18n
					}
					else if(self.get("accordionDetails.payLoad") == "HTML"){
						headerValue = "text/html";//No I18n
					}
				}
					this.send("deleteContentType"); //No I18n
					var index=-1;
					if(headerArray.length > 0){
						$("#"+headerArray[headerArray.length - 1].valueId+"_Btn").removeClass("btnPlus");
                        $("#"+headerArray[headerArray.length - 1].valueId+"_Btn").addClass("deleteBtn");
                        headerArray[headerArray.length - 1].showDelete =true;
                        index= headerArray[headerArray.length -1].arrayIndex;
                        if(headerArray[headerArray.length - 1].key=="" && headerArray[headerArray.length - 1].value==""){
                            headerArray.removeAt(headerArray.length - 1);
                        }
					}

					headerArray.pushObject({arrayIndex : index +1, keyId:self.get("accordionDetails.operation")+"_headerkeyId"+(index+1), key : "Content-Type", value : headerValue, valueId:self.get("accordionDetails.operation")+"_headerValueId"+(index+1), showDelete : false});//No I18n

					self.set("accordionDetails.webhookheaders", headerArray);//No I18n

                    index=-1;
					var customArray=self.get('accordionDetails.Webhookcustom');
                    for(var j=0;j<customArray.length;j++){
                            if(j< (customArray.length-1)){
                                customArray[j].showDelete=true;
                            }
                    }
					if(customArray.length > 0){
                        customArray[customArray.length - 1].showDelete =true;
                        index= customArray[customArray.length -1].arrayIndex;
                        if(customArray[customArray.length - 1].key=="" && customArray[customArray.length - 1].value==""){
                            customArray.removeAt(customArray.length - 1);
                        }
                    }
                    customArray.pushObject({arrayIndex :  index +1, keyId:self.get('accordionDetails.operation')+"_customkeyId"+(index+1), key : "", value : "", valueId:self.get('accordionDetails.operation')+"_customValueId"+(index+1), showDelete : false});//No I18n
                    self.set("accordionDetails.Webhookcustom", customArray);//No I18n
			},
			authTypeChange : function(aType){
				var self = this;
				self.set("accordionDetails.authType", aType);//No I18n
			},
			disableWebhookIcon : function(dropdownvalue){
               var value;
               var msgtxt = $("#"+dropdownvalue).val();
               var varibletxt=OPMClient.SettingsConfigurationController.dropvalue.value;
               if((dropdownvalue.indexOf("url"))>-1){
                    if(varibletxt!==undefined){
                   /*     if(!varibletxt.includes("=")){
                           // varibletxt=OPMClient.SettingsConfigurationController.dropvalue.key+"="+varibletxt.trim();
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
			varibletxt=varibletxt.trim();
                    }
               }

               if((dropdownvalue.indexOf("headerValue"))>-1){
                    var headerArray = this.get('accordionDetails.webhookheaders');
                    for(var j=0;j<headerArray.length;j++){
                        if(headerArray[j].valueId == dropdownvalue){
                            if(msgtxt==""){
                                $("#"+dropdownvalue).val(varibletxt);
                                headerArray[j].value = varibletxt;
                            }
                            else{
                             $("#"+dropdownvalue).val(msgtxt+" "+varibletxt);
                             headerArray[j].value = msgtxt+" "+varibletxt;
                            }

                        }
                    }
                    this.set("accordionDetails.webhookheaders", headerArray);//No I18n
               }
               else if((dropdownvalue.indexOf("customValueId"))>-1){
                     var customArray = this.get('accordionDetails.Webhookcustom');
                     for(var j=0;j<customArray.length;j++){
                         if(customArray[j].valueId == dropdownvalue){
                             if(msgtxt==""){
                                 $("#"+dropdownvalue).val(varibletxt);
                                 customArray[j].value = varibletxt;
                             }
                             else{
                              $("#"+dropdownvalue).val(msgtxt+" "+varibletxt);
                              customArray[j].value = msgtxt+" "+varibletxt;
                             }

                         }
                     }
                     this.set("accordionDetails.Webhookcustom", customArray);//No I18n
               }
               else if((dropdownvalue.indexOf("bodyContent"))>-1){
                    if(msgtxt==""){
                         $("#"+dropdownvalue).val(varibletxt);
                     }
                     else{
                        $("#"+dropdownvalue).val(msgtxt+"\n"+varibletxt);
                    }
               }
               else{
                    if(msgtxt==""){
                        $("#"+dropdownvalue).val(varibletxt);
                    }
                    else{
                     $("#"+dropdownvalue).val(msgtxt+varibletxt);
                    }
               }
            },
			addCustomObj : function(arrayIndex){
				var self = this;
				var index;
				var customArray=self.get('accordionDetails.Webhookcustom');
				for(var j=0;j<customArray.length;j++){
                    if(customArray[j].arrayIndex === arrayIndex){
                		index=j;
                	}
                }
                if ($("#"+customArray[index].valueId+"_Btn").hasClass("btnPlus")){
                    var fieldsToValidate = {'empty':[self.get('accordionDetails.operation')+"_customkeyId"+arrayIndex,self.get('accordionDetails.operation')+"_customValueId"+arrayIndex]};//No I18n
                    var isValid = opm_validateFields(fieldsToValidate);
                    if(isValid){
                        $("#"+customArray[index].valueId+"_Btn").removeClass("btnPlus");
                        $("#"+customArray[index].valueId+"_Btn").addClass("deleteBtn");
                        var newIndex = arrayIndex+1;
                        customArray.pushObject({arrayIndex : (newIndex), keyId:self.get('accordionDetails.operation')+"_customkeyId"+(newIndex), key : "", value : "", valueId:self.get('accordionDetails.operation')+"_customValueId"+(newIndex), showDelete : false});//No I18n
                        self.set("accordionDetails.Webhookcustom", customArray);//No I18n
                    }
                }
                else{
                    this.send('removeCustomObj',index);// No I18N
                }

			},
			removeCustomObj : function(index){
				var self = this;
				var customArray = self.get('accordionDetails.Webhookcustom');
				customArray.removeAt(index);
				var arrayLength = customArray.length;
                $("#"+customArray[arrayLength-1].valueId+"_Btn").removeClass("deleteBtn");
                $("#"+customArray[arrayLength-1].valueId+"_Btn").addClass("btnPlus");
				self.set("accordionDetails.Webhookcustom", customArray);//No I18n
			},
			addHeaderObj : function(arrayIndex){
			    var self = this;
			    var index;
			    var headerArray = self.get('accordionDetails.webhookheaders');
			    for(var j=0;j<headerArray.length;j++){
			        if(headerArray[j].arrayIndex === arrayIndex){
			                    index=j;
			        }
			    }
			    if ($("#"+headerArray[index].valueId+"_Btn").hasClass("btnPlus")){
                    var fieldsToValidate = {'empty':[self.get('accordionDetails.operation')+"_headerkeyId"+arrayIndex,self.get('accordionDetails.operation')+"_headerValueId"+arrayIndex]};//No I18n
                    var isValid = opm_validateFields(fieldsToValidate);
				    if(isValid){
                        $("#"+headerArray[index].valueId+"_Btn").removeClass("btnPlus");
                        $("#"+headerArray[index].valueId+"_Btn").addClass("deleteBtn");

                        var newIndex = arrayIndex+1;
                        headerArray.pushObject({arrayIndex : (newIndex), keyId:self.get('accordionDetails.operation')+"_headerkeyId"+(newIndex), key : "", value : "", valueId:self.get('accordionDetails.operation')+"_headerValueId"+(newIndex), showDelete : false});//No I18n
                        this.set("accordionDetails.webhookheaders", headerArray);//No I18n
                    }
			    }
                else{
                    this.send('removeHeaderObj',index);// No I18N
                }

			},
			removeHeaderObj : function(index){
				var self = this;
				var headerArray = self.get('accordionDetails.webhookheaders');
				headerArray.removeAt(index);
				var arrayLength = headerArray.length;
				$("#"+headerArray[arrayLength-1].valueId+"_Btn").removeClass("deleteBtn");
                $("#"+headerArray[arrayLength-1].valueId+"_Btn").addClass("btnPlus");
				this.set("accordionDetails.webhookheaders", headerArray);//No I18n
			},
			reopenChange : function(){
                if($('#reopen_reopenIncident').is(':checked')){
                    this.set("accordionDetails.reopenEnabled",true);//No I18n
                }
                else{
                    this.set("accordionDetails.reopenEnabled",false);//No I18n
                }

			},
			enableWebhookIcon:function(selectboxID){
			            selectboxID=selectboxID+"_helpbox"; //No I18n
            			$('.propertiesDropdown__icon[id!="'+selectboxID+'"]').removeClass('active');//No I18N
            		 	if($("#"+selectboxID).hasClass("active")){
            					$("#"+selectboxID).removeClass("active");//No I18N
            			}
            			else{
            			$("#"+selectboxID).addClass("active");//No I18N
            		   }
            }
		},
		keyPress: function(e){
			if($('#incident_reopenDays').is(":focus")){//No I18N
				return opm_isNumber(e);
			}
		},
		willDestroy: function(){
        		this.set("accordionDetails",{}); //No I18n

        }
	});

	OPMClient.CITInternalIntegrationComponent = Ember.Component.extend({
		templateName: "CITInternal-Integration",//No I18N
		protocolValuesAttention:[{"name":"info"},{"name":"critical"},{"name":"warning"},{"name":"error"}],//No I18N
		protocolValuesTrouble:[{"name":"warning"},{"name":"critical"},{"name":"error"},{"name":"info"}],//No I18N
		protocolValuesCritical:[{"name":"critical"},{"name":"warning"},{"name":"error"},{"name":"info"}],//No I18N
		protocolValuesServiceDown:[{"name":"error"},{"name":"critical"},{"name":"warning"},{"name":"info"}],//No I18N
		//JiraCloudAuthType: "basic",//No I18N
      //  accordionDetails:opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/admin/listOAuthProvider"), //No I18n
		didInsertElement: function() {
		},keyPress: function(e){
			if($('#issue_reopenDays').is(":focus")){
				return opm_isNumber(e);
			}
		},actions:{
			backToAddonPage: function(){
				opmGlobalRoute.transitionTo("Settings.Basic.AddOnProduct"); //No I18N
			},
			editCredentials: function(){
				this.set('model.isConfigured',false);//No I18N
			},
			checkIntegrationconnection: function(){
				var self = this;
				var fields = {'empty':['server_url','apiKey'],'validateProperUrlTPI':['server_url'],'emailValidation':['userName']};//No I18N
				if(this.get('model.PRODUCTNAME')==="TPI_JIRACLOUD"){
                 fields.empty.push('userName');
				}
				if(this.get('model.PRODUCTNAME')==="TPI_TOPDESK"){
					fields.emailValidation = [];
					fields.empty.push('userName');
				}
				//if($('input[name="authentication"]:checked').val()==="basic"){
					//fields.empty.push('userName');
			//	}
				var isValid = opm_validateFields(fields);
				var postData = {};
				if(isValid){
					postData = {
						productName:this.get('model.PRODUCTNAME'),
						serverURL:this.get('model.SERVERURL'),
						authenticationKey:this.get('model.APIKEY')
					};
					opm_infoMsgs("infoMsg",Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'));//No I18N
					if(postData.productName=='TPI_PAGERDUTY'){
						  $("#validateConnection").dialog({
							modal: true,
							resizable: false,
							width: 540,
							title: Ember.I18n.t('webclient.are.you.sure.you.want.to.proceed'),//No I18N
							closeOnEscape: false,
							buttons: [
								{
									text:Ember.I18n.t('webclient.yes', this),//No I18N
									click: function() {
										$( this ).dialog( "close" );
										$('body').removeClass("ui-dialog-style2");
										opm_infoMsgs("infoMsg",Ember.I18n.t('opu.common.request.PROCESSING_PL_WAIT'));//No I18N
										$.ajax({
											url: window.OPM.apiUrlPattern+"/admin/validateCITURLConnection",//No I18N
											method:'POST',//No I18N
											async:true,
											data:postData,
											self:self,
											
											success: function(jsonData){
												showMessage(jsonData);
												self.set('model.isConfigured',jsonData.isConnected);//No I18N
												self.set('connectCheck',true);//No I18N
												if(jsonData.isConnected){
													opm_infoMsgs("successMsg",Ember.I18n.t('webclient.fwa.validation.success'));//No I18N
													self.set('isCredValidorNot',true);//No I18N
												}	
												else{
													self.set('model.isConfigured',false);//No I18N
													self.set('isCredValidorNot',false);//No I18N
												}
											}
										});
									}
								},
								{
									text:Ember.I18n.t('webclient.no', this),//No I18N
									click: function() {
										$( this ).dialog( "close" );
										$('body').removeClass("ui-dialog-style2");
									}
								}
							]
						  });
						  $('body').addClass("ui-dialog-style2");
					    }
					else{
							if(postData.productName=='TPI_JIRACLOUD'){
							postData.userName=this.get('model.userName');
						}else if(postData.productName=='TPI_TOPDESK'){//No I18N
								postData.integrationUserName=this.get('model.userName');
						}
					$.ajax({
					url: window.OPM.apiUrlPattern+"/admin/validateCITURLConnection",//No I18N
					method:'POST',//No I18N
					data:postData,
					async:true,
					self:self,
					success: function(jsonData){
						showMessage(jsonData);
						self.set('model.isConfigured',jsonData.isConnected);//No I18N
						self.set('connectCheck',true);//No I18N
						if(jsonData.isConnected){
							opm_infoMsgs("successMsg",Ember.I18n.t('webclient.fwa.validation.success'));//No I18N
							self.set('isCredValidorNot',true);//No I18N
						}
						else{
							opm_infoMsgs("errorMsg",Ember.I18n.t('webclient.fwa.validation.failure'));//No I18N
							self.set('model.isConfigured',false);//No I18N
							self.set('isCredValidorNot',false);//No I18N
						}
					}
				  });
			      }
			    }			
			},deleteCITIntegration: function(){
				var productName=this.get('model.PRODUCTNAME');
				var displayName=this.get('model.displayName');
				var self = this;
				  $('#'+displayName).dialog({
					modal: true,
					resizable: false,
					width: 540,
					title: Ember.I18n.t('webclient.cit.deleteconfirmation',{param0:displayName},this),//No I18N
					closeOnEscape: false,
					buttons: [
						{
							text:Ember.I18n.t('webclient.yes', this),//No I18N
							click: function() {
								$( this ).dialog( "close" );
								$('body').removeClass("ui-dialog-style2");
								postData = {
									productName:productName
								};
								$.ajax({
									url: window.OPM.apiUrlPattern+"/admin/deleteCITInternalIntegration",//No I18N
									method:'POST',//No I18N
									async:true,
									data:postData,
									self:self,
									success: function(jsonData){
										showMessage(jsonData);
										self.set('model.isConfigured',false);//No I18N
										self.set('model.CONSENTSTATUS',false);//No I18N
										self.set('model.reopenDays',"");
										self.set('model.SERVERURL',"");
										self.set('model.APIKEY',"");
			                            self.set('model.userName',"");
									}
								});
							}
						},
						{
							text:Ember.I18n.t('webclient.no', this),//No I18N
							click: function() {
								$( this ).dialog( "close" );
								$('body').removeClass("ui-dialog-style2");
							}
						}
					]
				  });
				  $('body').addClass("ui-dialog-style2");
			},addCITIntegration: function(){ 
				var self = this;
				var reopenIssue = null;
				var reopenDays = null;
				if($('input[name="ticket"]:checked').val()===true || $('input[name="ticket"]:checked').val()==="true"){
					reopenIssue=true;
					reopenDays = this.get('model.reopenDays');
				}
				else{
					reopenIssue=false;
				}
				// self.set('isNull',false);//No I18N
				var fields = {'empty':['server_url'],"custom": [{ 'condition': !this.get('model.CONSENTSTATUS'), 'identifier': 'consentCheck', 'message': Ember.I18n.t('webclient.consent.confirmation', this) }]};//No I18N
				if(reopenIssue){
					fields.empty.push('issue_reopenDays');
					fields.minRangeCheck={'issue_reopenDays':1};//No I18N
				}
				var isValid = opm_validateFields(fields);
				if(isValid){
					postData = {
						productName:this.get('model.PRODUCTNAME'),
						serverURL:this.get('model.SERVERURL'),
						authenticationKey:this.get('model.APIKEY'),
						integrationId:this.get('model.integrationId')
					};
					if(reopenDays != null){
						postData.reopenDays=reopenDays;
					}
				  //PagerDuty Handling
				   if(this.get('model.PRODUCTNAME')==='TPI_PAGERDUTY'){
						postData.Attention=$("#attention").val();
                        postData.Trouble=$("#trouble").val();
                        postData.Critical=$("#critical").val();
						postData.ServiceDown=$("#servicedown").val();
				    }
					if(postData.productName=='TPI_JIRACLOUD'){
						postData.userName=this.get('model.userName');
					}else if(postData.productName=='TPI_TOPDESK'){//No I18N
						postData.integrationUserName=this.get('model.userName');
					}
					$.ajax({
						url: window.OPM.apiUrlPattern+"/admin/addUpdateCITInternalIntegration",//No I18N
						method:'POST',//No I18N
						async:true,
						data:postData,
						self:self,
						success: function(jsonData){
							if(!jsonData.isIntegrationAddedSuccessfully || jsonData.error){
								self.set('connectCheck',true);//No I18N
								self.set('model.isConfigured',false);//No I18N
								self.set('isCredValidorNot',false);//No I18N
								if(jsonData.error){
								opm_infoMsgs("errorMsg",jsonData.error.message); //No I18N
								}else{
								opm_infoMsgs("errorMsg",jsonData.message); //No I18N
								}
							}else{
							showMessage(jsonData);
							}
							
						}
					});
				}
			},authTypeChange : function(aType){
				var self = this;
				self.set("JiraCloudAuthType", aType);//No I18n
			}
		},willDestroy: function(){
		}
	});

	OPMClient.CITInternalNPFieldsComponent = Ember.Component.extend({
		templateName: "CITInternal-NP-Fields",//No I18N
		dropdownPrompt : Ember.I18n.t('webclient.jira.selectvalue',this),//No I18N
		textPrompt : Ember.I18n.t('webclient.opm.update.customfield.newvalue',this),//No I18N
		didInsertElement: function() {
			var self = this;
			$("input[name=dateFormat]").datepicker({ dateFormat: 'yy-mm-dd'});
		    $("input[name=dateTimeFormat]").datetimepicker({
					dateFormat: 'yy-mm-dd',//No I18N
					timeFormat: 'hh:mm:ss.sz',//No I18N
					separator: 'T',//No I18N
					showTimezone: true
				});	
			// var dateIndex = this.get('dynamicFields').map(function (params) {
   			//  	return params.isDate;
			// }).indexOf(true);

			//dollar variables
			var maintabs = new Array();
            var inside=new Array();
            var jsonData;
            if(dropDownOptions === "")
            {

                var mailVariablesForNP = OPMClient.SettingsNotificationsController.get('mailVariables');
				if(self.get('isNtemplate') !=  undefined && self.get('isNtemplate')){
				jsonData =opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables",{isNotificationTemplate:true});//No I18N
				var dropdowndatatemplate = {}; 
				var insidetemplate=new Array();
				dropdowndatatemplate.key=Ember.I18n.t('webclient.admin.profiledetails.message.SelectValue',this);//NO I18N
				var insidedropdowndatatemplate = {};   
				insidedropdowndatatemplate.key=Ember.I18n.t('webclient.default',this);//NO I18N
                insidedropdowndatatemplate.value=Ember.I18n.t('webclient.mail.message.model',this);//NO I18N
				insidetemplate.push(insidedropdowndatatemplate);
				dropdowndatatemplate.value=insidetemplate;
				maintabs.push(dropdowndatatemplate);
				}else{
                jsonData = mailVariablesForNP ? mailVariablesForNP : opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getMailVariables");//No I18N
				}
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
            }
			self.set("dropdownvalues", maintabs);//No I18n
            OPMClient.SettingsConfigurationController.set('dropdownoptions',maintabs);//No I18N
		},
		reRendering:function() {
			this.rerender();
		}.observes('this.dynamicFields'),//No I18N
		keyPress: function(e){
			if($('input[name=numberField]').is(":focus")){
				return opm_isNumber(e);
			}if($('input[name=decimalField]').is(":focus")){
				return opm_isFloatNumber(e);
			}if($('input[name=dateFormat]').is(":focus")){
				return !opm_isNumber(e);
			}if($('input[name=dateTimeFormat]').is(":focus")){
				return !opm_isNumber(e);
			}
		},
		actions: {
			refreshCITInternalIntegrationFields:function(){
				var refreshSupportedIntegrations = ["TPI_TOPDESK"];//No I18N
				var npTemplateDetails = OPMClient.SettingsNotificationsController.InternalTemplateDetails;
				if(npTemplateDetails == undefined || npTemplateDetails.internalTemplateId == undefined){
					npTemplateDetails = OPMClient.SettingsNotificationsController.InternalNotificationTemplateDetails;
				}

				if(npTemplateDetails == undefined || npTemplateDetails.internalTemplateId == undefined || npTemplateDetails.internalTemplateName == undefined){
					opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.cit.internal.connectionissue'));//No I18N
					return;
				}

				if(!refreshSupportedIntegrations.contains(npTemplateDetails.internalTemplateName)){
					opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.cit.internal.refreshnotsupported')); //No I18N
					return;
				}

				var postData = {
					templateId : npTemplateDetails.internalTemplateId,
					productName : npTemplateDetails.internalTemplateName
				};

				if(npTemplateDetails.internalProfileId != undefined && npTemplateDetails.internalProfileId != ""){
					postData.profileID = npTemplateDetails.internalProfileId;
				}else if(OPMClient.SettingsAddEditController.pageObj != undefined && OPMClient.SettingsAddEditController.pageObj.profileDetails != undefined && OPMClient.SettingsAddEditController.pageObj.profileDetails.profileID != undefined){
					postData.profileID = OPMClient.SettingsAddEditController.pageObj.profileDetails.profileID;
				}

				var callBackFn = function(jsonData){
					if(jsonData.error == undefined){
						npTemplateDetails.internalTemplatenpFields = jsonData;
						npTemplateDetails.isFieldsFetched = true;
						Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
						Ember.set("OPMClient.SettingsNotificationsController.InternalNotificationTemplateDetails", npTemplateDetails);//No I18N
						opm_infoMsgs("successMsg", Ember.I18n.t('webclient.vimonitor.credential.success'));//No I18N
					}else{
						showMessage(jsonData);
					}
				};

				opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern+"/admin/refreshCITInternalIntegrationFields",postData,Ember.I18n.t('webclient.cit.internal.integration.waitmsg',{param0:npTemplateDetails.internalTemplateDisplayName}),callBackFn); //No I18N
			},
			enableDisableDollarVariables:function(staticID, dynamicId){
				var selectboxID = staticID+dynamicId;
				$('.propertiesDropdown__icon helpbox__webhook[id!="'+selectboxID+'"]').removeClass('active');//No I18N
				 if($("#"+selectboxID).hasClass("active")){
						$("#"+selectboxID).removeClass("active");//No I18N

				}
				else{
				$("#"+selectboxID).addClass("active");//No I18N

			   }
			},
			setDollarValue:function(selectboxID){
				var self=this;
				var msgtxt = $("#"+selectboxID).val();
			   	var varibletxt=OPMClient.SettingsConfigurationController.citInternal.value;
				$("#"+selectboxID).val(msgtxt+varibletxt).keyup();
			},addCustomfield : function(arrayIndex){
				var customdetailsArray=OPMClient.SettingsNotificationsController.customdetailsArray;
			    for(var j=0;j<customdetailsArray.length;j++){
			        if(customdetailsArray[j].arrayIndex === arrayIndex){
			                    index=j;
			        }
			    }
			    if ($("#"+customdetailsArray[index].valueId+"_Btn").hasClass("btnPlus")){
                   var fieldsToValidate = {'empty':["add_customdetailkeyId"+arrayIndex,"add_customdetailValueId"+arrayIndex]};//No I18n
                   var isValid = opm_validateFields(fieldsToValidate);
				    if(isValid){
						$("#"+customdetailsArray[index].valueId+"_Btn").removeClass("btnPlus");
                        $("#"+customdetailsArray[index].valueId+"_Btn").addClass("deleteBtn");
                        var newIndex = arrayIndex+1;
                        customdetailsArray.pushObject({arrayIndex : (newIndex), keyId:"add_customdetailkeyId"+(newIndex), key : "", value : "", valueId:"add_customdetailValueId"+(newIndex), showDelete : false});//No I18n
						Ember.set("OPMClient.SettingsNotificationsController.customdetailsArray", customdetailsArray);//No I18N
			    }
			  }
              else{
                   this.send('removeCustomfield',index);// No I18N
               }
			},removeCustomfield : function(index){
				var self = this;
				var customdetailsArray = OPMClient.SettingsNotificationsController.customdetailsArray;
				customdetailsArray.removeAt(index);
				var arrayLength = customdetailsArray.length;
				$("#"+customdetailsArray[arrayLength-1].valueId+"_Btn").removeClass("deleteBtn");
                $("#"+customdetailsArray[arrayLength-1].valueId+"_Btn").addClass("btnPlus");
				Ember.set("OPMClient.SettingsNotificationsController.customdetailsArray", customdetailsArray);//No I18N
			 },getIssues:function(selectedValue,dependentID){
				var self = this;
				var npTemplateDetails = {};
				var npFields=OPMClient.SettingsNotificationsController.InternalNotificationTemplateDetails;
				if(npFields==undefined){
					npFields=OPMClient.SettingsNotificationsController.InternalTemplateDetails;
				}
				var templateId = npFields.internalTemplateId;
				var productName =npFields.internalTemplateName;
				//self.set('jiraObject.isProjectSelected',false);//No I18N
				//self.set('jiraObject.issueType',undefined);//No I18N
				if(selectedValue != undefined && selectedValue != null)
				{
					/*$.ajax({	
						url:window.OPM.apiUrlPattern+"/admin/getJiraIssueTypes?projectType="+self.get('jiraObject.projectType'),//No I18N
						method:'GET',//No I18N
						async:true,
						self:self,
						msgID:"",
						selfView:selfView,
						profileDetails:profileDetails,
						beforeSend: function(){
							this.msgID = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.getIssueFields',this));//No I18N
						},
						success:function(jsonData){
							$("#"+this.msgID).remove();
							if(jsonData.error!==undefined){
								showMessage(jsonData);
							}
							else{
								self.set('jiraObject.issuetypes',jsonData);//No I18N
								self.set('jiraObject.isProjectSelected',true);//No I18N
							}
	
						}
					});
					*/
					var postData = {
						templateId : templateId,
						productName : productName,
						projectID:selectedValue,
						apiId:dependentID
					};
					var callBackFn = function(jsonData){
						if(jsonData.error==undefined){
							npTemplateDetails.internalTemplateId=templateId;
							npTemplateDetails.internalTemplateName=productName;
							npTemplateDetails.internalTemplatenpFields = jsonData;
				            npTemplateDetails.isFieldsFetched = true;
							npTemplateDetails.internalTemplateIsEnabled =true;
				            Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
							$('#cit_clearfix').css({'display':'none'});
						}else{
							Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
				            $('#cit_clearfix').css({'display':'none'});
						}
					};
					opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern+"/admin/getInternalCITemplateNPFields",postData,Ember.I18n.t('webclient.cit.internal.integration.waitmsg'),callBackFn); //No I18n
				}else{
					opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.projectnotselected',this));//No I18N
				}
			},getAllFields:function(selectedValue,dependentID){
				var self = this;
				var npTemplateDetails = {};
				var projectID="";
				var npFields=OPMClient.SettingsNotificationsController.InternalNotificationTemplateDetails;
				if(npFields==undefined){
					npFields=OPMClient.SettingsNotificationsController.InternalTemplateDetails;
				}
				var templateId = npFields.internalTemplateId;
				var productName =npFields.internalTemplateName;
				/*
				for(var iter = 0 ; iter < npFields.internalTemplatenpFields.length ; iter++){
					if(npFields.internalTemplatenpFields[iter].displayName ==="Projects"){
						projectID=npFields.internalTemplatenpFields[iter].selectedValue;
						break;
				}
			   }
				*/
			   projectID= $('#projectID').attr('projectID');
				//self.set('jiraObject.isProjectSelected',false);//No I18N
				//self.set('jiraObject.issueType',undefined);//No I18N
				if(selectedValue != undefined && selectedValue != null && projectID !=undefined && projectID !=null)
				{
					/*$.ajax({	
						url:window.OPM.apiUrlPattern+"/admin/getJiraIssueTypes?projectType="+self.get('jiraObject.projectType'),//No I18N
						method:'GET',//No I18N
						async:true,
						self:self,
						msgID:"",
						selfView:selfView,
						profileDetails:profileDetails,
						beforeSend: function(){
							this.msgID = opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jira.getIssueFields',this));//No I18N
						},
						success:function(jsonData){
							$("#"+this.msgID).remove();
							if(jsonData.error!==undefined){
								showMessage(jsonData);
							}
							else{
								self.set('jiraObject.issuetypes',jsonData);//No I18N
								self.set('jiraObject.isProjectSelected',true);//No I18N
							}
	
						}
					});
					*/
					var postData = {
						templateId : templateId,
						productName : productName,
						issueID:selectedValue,
						apiId:dependentID,
						projectID:projectID
					};
					var callBackFn = function(jsonData){
						if(jsonData.error==undefined){
							npTemplateDetails.internalTemplateId=templateId;
							npTemplateDetails.internalTemplateName=productName;
							npTemplateDetails.internalTemplatenpFields = jsonData;
				            npTemplateDetails.isFieldsFetched = true;
							npTemplateDetails.internalTemplateIsEnabled =true;
				            Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
							$('#cit_clearfix').css({'display':'none'});
						}else{
							Ember.set("OPMClient.SettingsNotificationsController.InternalTemplateDetails", npTemplateDetails);//No I18N
				            $('#cit_clearfix').css({'display':'none'});
						}
					};
					opm_ajaxGetResponseWithMsg(window.OPM.apiUrlPattern+"/admin/getInternalCITemplateNPFields",postData,Ember.I18n.t('webclient.cit.internal.integration.waitmsg',{param0:"JiraCloud"}),callBackFn); //No I18n
				}else{
					opm_infoMsgs("infoMsg",Ember.I18n.t('webclient.jiracloud.projectorissuetypenotselected',this));//No I18N
				}
			},leftToRight: function(leftId,rightId,isAssoComponent){
				opm_leftToRight(leftId,rightId,isAssoComponent);
			},rightToLeft: function(leftId,rightId,isAssoComponent){
				opm_rightToLeft(leftId,rightId,isAssoComponent);
			},multiValue: function(id){
				var multiValue = [];
				multiValue = opm_getMultiSelectValue(id,'value', true);//No I18N
				var myJSON = this.dynamicFields;
				for(var iter=0;iter < myJSON.length; iter++)
				{
						if(myJSON[iter]!= undefined && myJSON[iter].key === id)
						{
							myJSON[iter].selectedValue = multiValue;
							break;
						}
				}
			}
		},
		willDestroy: function(){
			if(this.get('isNtemplate')){
				OPMClient.SettingsNotificationsController.set("InternalTemplateDetails", {});//No I18N
			}
		}
	});

OPMClient.SIEMMultiSelectComponent = Ember.Component.extend({
		templateName: "SIEM-MultiSelect",//No I18N
		allCriteria:[],
		refresh:true,
		didInsertElement: function() {
			var self = this;
			$('.opmChckList .chk').off("click"); //No I18n
			$('.opmChckList').on("click",".chk",function(){
				//opmAccListChk();
			if(!$(this).hasClass('chkParent')){
			var moduleId = $(this).attr('id');
			var allAuditCriteria = self.get('model.auditModules');
			var isSelected = this.checked;
			allAuditCriteria.forEach(function(group) {
				group.module.forEach(function(module) {
					if (module.moduleId == moduleId) {
						module.isChecked = isSelected;
					}
				});
			});
			self.set('model.auditModules', allAuditCriteria);//No I18N
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
			self.set("model.selectedCount",$("#auditList .chkChild[type=checkbox]:checked").length);//No I18N
		});

		$('.opmChckList .chkParent').off("click"); //No I18n
		$('.opmChckList').on("click",'.chkParent',function(){
			var groupId = $(this).attr('id');
			var allAuditCriteria = self.get('model.auditModules');
			var isSelected = this.checked;
			allAuditCriteria.forEach(function(group) {
				if (group.groupId == groupId) {
				group.module.forEach(function(module) {
					module.isChecked = isSelected;
				});
				}
			});
			self.set('model.auditModules', allAuditCriteria);//No I18N
			that=$(this).parent().parent().parent().find('ul .chk');
			if(this.checked){allAuditCriteria
				that.prop('checked',true); //No I18N
			}else{
				that.prop('checked',false); //No I18N
			}
			self.set("model.selectedCount",$("#auditList .chkChild[type=checkbox]:checked").length);//No I18N
		});

		$("#auditSearch").keyup(function () {
			var searchString = $(this).val();
			listSearch(searchString,"auditList");//No I18N
		});

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
		}
	});


OPMClient.SIEMProfileComponent = Ember.Component.extend({
	templateName: "components/SIEM-Profile", //No I18N
	showChild:false,
	sevValues:[
		{ name: "$severity", value: "9" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.debug", this), value: "7" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.information", this), value: "6" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.notice", this), value: "5" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.warning", this), value: "4" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.error", this), value: "3" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.critical", this), value: "2" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.alert", this), value: "1" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.emergency", this), value: "0" }//No I18N
	],
	facility:[
		{ name: Ember.I18n.t("webclient.admin.syslogrules.kernel", this), value: "0" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.user", this), value: "1" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.mail", this), value: "2" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.daemon", this), value: "3" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.auth", this), value: "4" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.syslog", this), value: "5" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.lineprintersubsystem", this), value: "6" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.networknewssubsystem", this), value: "7" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.uucpsubsystem", this), value: "8" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.cron.one", this), value: "9" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.authpriv", this), value: "10" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.ftpdaemon", this), value: "11" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.ntpsubsystem", this), value: "12" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.logaudit", this), value: "13" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.logalert", this), value: "14" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.cron.two", this), value: "15" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse", this), value: "16" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.one", this), value: "17" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.two", this), value: "18" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.three", this), value: "19" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.four", this), value: "20" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.five", this), value: "21" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.six", this), value: "22" },//No I18N
		{ name: Ember.I18n.t("webclient.admin.syslogrules.localuse.seven", this), value: "23" }//No I18N
	],
	promptValue:Ember.I18n.t("webclient.jira.selectvalue",this),//No I18N
	noValue:Ember.I18n.t("webclient.jira.novalue",this),//No I18N
	rfc5424: true,
	didInsertElement:function() {
		var self = this;
		Ember.run.schedule("afterRender", function() {//No I18n
			$("#sev_Values").select2();
			$("#fac_Values").select2();
			$("#siemDescription").select2();
			if(self.get("siemObject.rfc5424") != undefined && self.get("siemObject.rfc5424") != null && self.get("siemObject.rfc5424") != true){
				self.set("rfc5424", self.get("siemObject.rfc5424"));//No I18n
			}
		});	
	},
	siemMessageObserver: function(){
		if(this.get('siemObject.ticketDescriptionSelect')!==undefined && this.get('siemObject.ticketDescriptionSelect')!==null){
			var msgtxt = $('#siem_description').val();
    		var varibletxt = $('#siemDescription option:selected').val(); 
			if(varibletxt.trim() !== ""){
				var finalText = msgtxt + " " + varibletxt;
				$("#siem_description").val(finalText);
				OPMClient.SettingsNotificationsController.set("siemObject.message",finalText);//No I18N
			}
		}
	}.observes('siemObject.ticketDescriptionSelect'),//No I18N
	modelMessageObserver: function(){
		if(this.get('model.selectedMessageVariable')!==undefined && this.get('model.selectedMessageVariable')!==null){
			var msgtxt = $('#siem_description').val();
    		var varibletxt = this.get('model.selectedMessageVariable');
		    if(varibletxt && varibletxt.trim() !== ""){
				var finalText = msgtxt + " " + varibletxt;
				$("#siem_description").val(finalText);
				OPMClient.SettingsNotificationsController.set("siemObject.message",finalText);//No I18N
				this.set('model.selectedMessageVariable', null); //No I18N
			}
		}
	}.observes('model.selectedMessageVariable'),//No I18N
	actions:{
		onButtonClick:function(index)
		{
			var self = this;
			var customList = OPMClient.SettingsNotificationsController.get("siemObject.structuredData");
			for(var j=0;j<customList.length;j++){
				if(customList[j].value === index){
					var key=$("#"+ customList[j].customkey).val();
                    var value=$("#"+customList[j].customval).val();
                     if((key== '' || value=='') && ($("#"+customList[j].addButton).hasClass("btnPlus"))){	
                      		var fieldsToValidate = {'empty':[customList[j].customkey,customList[j].customval]};
                            isValid = opm_validateFields(fieldsToValidate);
                            if(!isValid) {
                            	return isValid;
                        	}  
                     }
					if ($("#"+customList[j].addButton).hasClass("btnClose")){//No I18n
						customList.removeAt(j);
						if(customList.length > 0) {
                            Ember.set(customList[customList.length-1], 'customIconvalue', true);//No I18n
                        }
						OPMClient.SettingsNotificationsController.set("siemObject.structuredData",customList);//No I18n
					}
					else{
					var structuredDataCount=0;
                        for(var k=0;k<customList.length;k++){
                            if(customList[k].value >= structuredDataCount){
                                structuredDataCount = customList[k].value + 1;
                            }
                        }
					if(customList.length > 0) {
					    $("#"+customList[customList.length-1].addButton).removeClass("btnPlus");
                        $("#"+customList[customList.length-1].addButton).addClass("btnClose");//No I18N
                        // OPMClient.SettingsNotificationsController.get("siemObject.structuredData")[customList.length-1].customIconvalue = false;//No I18n
						Ember.set(customList[customList.length-1], 'customIconvalue', false);//No I18n
					}
					OPMClient.SettingsNotificationsController.get("siemObject.structuredData").pushObject({
						value:structuredDataCount,
						keyvalue:"keyvalue"+structuredDataCount,//No I18n
						customkey: "customkey"+structuredDataCount,//No I18n
						customval: "customval"+structuredDataCount,//No I18n
						addButton:"addButton"+structuredDataCount,//No I18n
						customvalue1:"",
						customvalue2:"",
						customIconvalue:true,
						dropdownlist:"dropdownlist"+structuredDataCount,//No I18n
						webhookCustomValue:"webhookCustomValue"+structuredDataCount,//No I18n
						customSelectBox:"customSelectBox"+structuredDataCount//No I18n
					});
						// OPMClient.SettingsNotificationsController.set('siemObject.structuredDataCount',structuredDataCount);//No I18n
					}

				}

			}
		},
		enableWebhookIcon:function(requestValueID,selectboxID){
			$('.propertiesDropdown__icon[id!="'+selectboxID+'"]').removeClass('active');//No I18N
		 	if($("#"+selectboxID).hasClass("active")){
					$("#"+selectboxID).removeClass("active");//No I18N
			}
			else{
			$("#"+selectboxID).addClass("active");//No I18N
		   }
		},
		disableWebhookIcon : function(dropdownvalue){
               var value;
               var msgtxt = $("#"+dropdownvalue).val();
               var varibletxt=OPMClient.SettingsConfigurationController.dropvalue.value;

               if((dropdownvalue.indexOf("customval"))>-1){
                     var customArray = OPMClient.SettingsNotificationsController.get("siemObject.structuredData");
                     for(var j=0;j<customArray.length;j++){
                         if(customArray[j].customval == dropdownvalue){
                             if(msgtxt==""){
                                 $("#"+dropdownvalue).val(varibletxt);
                                 customArray[j].customvalue2 = varibletxt;
                             }
                             else{
                              $("#"+dropdownvalue).val(msgtxt+" "+varibletxt);
                              customArray[j].customvalue2 = msgtxt+" "+varibletxt;
                             }

                         }
                     }
					 OPMClient.SettingsNotificationsController.set("siemObject.structuredData", customArray);//No I18N
               }
            },
		formatChange:function(format){
			var self=this;
			if(format == "5424"){
				self.set("rfc5424", true);//No I18n
			}else if(format == "3164"){
				self.set("rfc5424", false);//No I18n
			}
		}
		
	}
});
	
OPMClient.EmbedWidgetLinkComponent = Ember.Component.extend({
	templateName: "components/embed-widget-link", //No I18n
	didInsertElement: function() {
		var timeList = [];
		$("#embed_expiry_date").datepicker({ dateFormat: 'yy-mm-dd', minDate: 0});
		for(var i = 0; i < 24; i++) {
			var tenths = (i < 10 ? ("0" + i) : i) + ":00";
			var obj = {
				dispName: tenths,
				value: tenths
			}
			timeList.push(obj);
		}
		this.set("timeList", timeList); //No I18n
		if(this.embedDetails && this.embedDetails.isExpiryEnabled) {
			if(this.embedDetails.expiryTime) {
				var expirySplit = this.embedDetails.expiryTime.split(" ");
				this.set("embedDetails.expiryDate", expirySplit[0]);
				this.set("embedDetails.expiryTime", expirySplit[1]);
			}
		} else {
			this.set("embedDetails.expiryTime", "00:00"); //No I18n
			this.set("embedDetails.isExpiryEnabled", false); //No I18n
		}
		$("#embedwidget_ancestsrc_note").hide();
		if(window.OPM.frameAncestorUrls) {
			$("#embedwidget_ancestsrc_note").show();
			$("#embedwidget_ancestsrc").off("click.embedwidget_ancestsrc").on("click.embedwidget_ancestsrc", function() {
				OPMClient.ApplicationController.set("secRecActionTrigger", {recID: "frameAncestorUrls"}); //No I18n
				opm_transitionToParentRoute('Settings.Basic.SSLSettings.SecurityRecommendations'); //No I18n
			});
		}
	},
	_saving: false,
	willDestroyElement: function() {
		if(!this.get("_saving")) { //No I18n
			dashboardSlideOut(3);
		}
	},
	actions: {
		copyEmbedLink: function() {
			opm_cctvLinkCopy();
		},
		saveOrRegenEmbedWidget: function(regen) {
			this.set("_saving", true); //No I18n
			var saveDetails = {
				isExpiryEnabled: this.embedDetails.isExpiryEnabled
			}
			if(saveDetails.isExpiryEnabled) {
				saveDetails.expiresAt = this.embedDetails.expiryDate + " " + this.embedDetails.expiryTime;
				var validateFields = {'empty':['embed_expiry_date','embed_expiry_time'],'dateCheck':['embed_expiry_date'],'isDateTimePast':{date:"embed_expiry_date", time: "embed_expiry_time"}}; //No I18N
				if(!opm_validateFields(validateFields)) {
					return;
				}
			}
			if(this.embedDetails.isEmbedCctv) {
				this.get("parentView").send("getCCTVSharableLink", regen, this.embedDetails.cctvID, this.embedDetails.cctvName, saveDetails); //No I18n
			} else {
				getEmbedResponse(this.embedDetails.embedID, regen, saveDetails); //No I18n
			}
		},
		goBack: function() {
			this.get('parentView').set("controller.cctvEmbedLink", undefined); //No I18n
		}
	}
})

OPMClient.UpgradeFetchPpmComponent = Ember.Component.extend({
	templateName: "components/upgrade-fetch-ppm", //No I18n
	elementId: "getPPMSlide",//No I18n
	didInsertElement: function() {
		var self = this;
		if(this.slideDetails.productPpmIntegFailed) {
			this.send("handleErrorCases", this.slideDetails.productPpmIntegFailed); //No I18n
		}
		var servicePacksLink = "";
		switch(getProductType()) {
			case "OPM"://No I18n
				servicePacksLink = Ember.I18n.t('webclient.opm.upgrade.servicepack.link');//No I18n
			break;
			case "NFA"://No I18n
				servicePacksLink = Ember.I18n.t('webclient.nfa.upgrade.servicepack.link');//No I18n
			break;
			case "NCM"://No I18n
				servicePacksLink = Ember.I18n.t('webclient.ncm.upgrade.servicepack.link');//No I18n
			break;
			case "FWA"://No I18n
				servicePacksLink = Ember.I18n.t('webclient.fwa.upgrade.servicepack.link');//No I18n
			break;
			case "OPU"://No I18n
				servicePacksLink = Ember.I18n.t('webclient.opu.upgrade.servicepack.link');//No I18n
			break;
		} 
		this.set("servicePacksLink", getUTMConstructedLink(servicePacksLink)); //No I18n
		this.set('APMservicePacksLink', (window.OPM.installedLanguage === "ja" || window.OPM.language === "ja_JP") ? getUTMConstructedLink("https://www.manageengine.jp/support/kb/Applications_Manager/?p=2403") : getUTMConstructedLink("https://www.manageengine.com/network-monitoring/apm-plugin-service-packs.html")); //No I18n
		$('#upgrade_ppmbrowse').change(function() { //Reset APM mandatory error case
			self.set("apmMandatory", false); //No I18n
		});
	},
	actions: {
		integFailed: function(message, type) {
			this.set("productPpmIntegFailed", true); //NO I18n
			this.set("showOpmCertificateUpload", type.opm_ppm_integrity_failed); //No I18n
			this.set("showApmCertificateUpload", type.apm_ppm_integrity_failed); //No I18n
			this.set("integErrorMessage", message ? message : Ember.I18n.t("webclient.smartupgrade.fileintegrity.fail")); //No I18n
		},
		showHideCloseButtonForUpgrade: function(hideClose) {
			if(hideClose) {
				$("#" + this.slideDetails.id + " .icon-remove").hide();  //No I18n
			} else {
				$("#" + this.slideDetails.id + " .icon-remove").show();  //No I18n
			}
		},
		closeSlide: function(manualCancel) {
			if((this.productPpmIntegFailed || this.opmUploadSuccess || this.apmUploadSuccess) && manualCancel) {
				this.slideDetails.parentInstance.send("cancelUpgradeProcess"); //No I18n
			} else {
				this.slideDetails.parentInstance.set("slideDetails", undefined); //No I18n
			}
		},
		proceedPpmUpload: function() {
			var self = this;
			var fieldsToValidate = {'empty':[]};//No I18N
			if(this.productPpmIntegFailed) {
				if(this.showOpmCertificateUpload) {
					fieldsToValidate.empty = ['upgrade_certbrowse'];//No I18N
				}
				if(this.slideDetails.isAPMPluginUpgrade && this.showApmCertificateUpload) {
					fieldsToValidate.empty.push('upgrade_apmcertbrowse');//No I18N
				}
			} else {
				if(this.apmMandatory) {
					fieldsToValidate.empty.push('upgrade_apmppmbrowse');//No I18N
				}
			}
			if(!opm_validateFields(fieldsToValidate)){
				return;
			}

			var formdata = new FormData();
			var url = "/admin/UploadPPM"; //No I18n
			var maxFileSizeInKb = 2048000;
			var maxFileSize = maxFileSizeInKb * 1024;
			var maxFileSizeInKb = maxFileSizeInKb / 1000 + " " + Ember.I18n.t("webclient.map.filefoldermonitor.units.megabyte");
			var loadingMessage = Ember.I18n.t("webclient.smartupgrade.uploading"); //No I18n
			if(this.productPpmIntegFailed) {
				loadingMessage = Ember.I18n.t("webclient.fwa.impoting.msg"); //No I18n
				var fileObject = "";
				var fileParts = "";
				var fileExtension = "";

				var fileObjectApm = "";
				var filePartsApm = "";
				var fileExtensionApm = "";
				
				if($("#upgrade_certbrowse")[0] && $("#upgrade_certbrowse")[0].files[0]) {
					fileObject = $("#upgrade_certbrowse")[0].files[0]; //No I18N
					fileParts = $("#upgrade_certbrowse").val().split("."); //No I18N
					fileExtension = fileParts[fileParts.length-1];
					if(fileObject.size > maxFileSize) {
						opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.smartupgrade.filesize.error",{fileSize: maxFileSizeInKb})); //No I18n
						return;
					}
				}

				if($("#upgrade_apmcertbrowse")[0] && $("#upgrade_apmcertbrowse")[0].files[0]) {
					fileObjectApm = $("#upgrade_apmcertbrowse")[0].files[0]; //No I18N
					filePartsApm = $("#upgrade_apmcertbrowse").val().split("."); //No I18N
					fileExtensionApm = filePartsApm[filePartsApm.length-1];
					if(fileObjectApm.size > maxFileSize) {
						opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.smartupgrade.filesize.error",{fileSize: maxFileSizeInKb})); //No I18n
						return;
					}
				}

				if((this.showOpmCertificateUpload && (!fileObject || !(fileExtension === "crt" || fileExtension === "cer"))) || (this.slideDetails.isAPMPluginUpgrade && fileObjectApm && !(fileExtensionApm === "crt" || fileExtensionApm === "cer"))) {
					opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.smartupgrade.validcertificatefile",this)); //No I18N
					return;
				}

				url = "/admin/importPPMSignerCertificate"; //No I18n
				if(this.showOpmCertificateUpload) {
					formdata.append("ppmSignerCertificate", $("#upgrade_certbrowse")[0].files[0]);//No I18N
				}
				if(this.showApmCertificateUpload && fileObjectApm) {
					formdata.append("apmPPMSignerCertificate", $("#upgrade_apmcertbrowse")[0].files[0]);//No I18N
				}
			} else {
				var fileObject = "";
				var fileParts = "";
				var fileExtension = "";

				var fileObjectApm = "";
				var filePartsApm = "";
				var fileExtensionApm = "";

				if($("#upgrade_ppmbrowse")[0] && $("#upgrade_ppmbrowse")[0].files[0]) {
					fileObject = $("#upgrade_ppmbrowse")[0].files[0]; //No I18N
					fileParts = $("#upgrade_ppmbrowse").val().split("."); //No I18N
					fileExtension = fileParts[fileParts.length-1]; //No I18N
					if(fileObject.size > maxFileSize) {
						opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.smartupgrade.filesize.error",{fileSize: maxFileSizeInKb})); //No I18n
						return;
					}
				}
				
				if($("#upgrade_apmppmbrowse")[0] && $("#upgrade_apmppmbrowse")[0].files[0]) {
					fileObjectApm = $("#upgrade_apmppmbrowse")[0].files[0]; //No I18N
					filePartsApm = $("#upgrade_apmppmbrowse").val().split("."); //No I18N
					fileExtensionApm = filePartsApm[filePartsApm.length-1]; //No I18N
					if(fileObjectApm.size > maxFileSize) {
						opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.smartupgrade.filesize.error",{fileSize: maxFileSizeInKb})); //No I18n
						return;
					}
				}

				if((!self.opmUploadSuccess && fileObject && fileExtension !== "ppm") || (this.slideDetails.isAPMPluginUpgrade && fileObjectApm && fileExtensionApm !== "ppm")) {
					opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.upgrade.manager.servicepack.format.invalid",this)); //No I18N
					return;
				}
				if(!this.opmUploadSuccess && fileObject) {
					formdata.append("uploadPPMFile", $("#upgrade_ppmbrowse")[0].files[0]);//No I18N
				}
				if(this.slideDetails.isAPMPluginUpgrade && fileObjectApm) {
					formdata.append("uploadAPMPluginPPMFile", $("#upgrade_apmppmbrowse")[0].files[0]);//No I18N
				}
			}
			this.set("ppmUploading", loadingMessage); //No I18n
			this.send("showHideCloseButtonForUpgrade", true);  //No I18n

			// Define a generous timeout for upload + backend integrity checks (30 minutes)
			var timeoutMs = 30 * 60 * 1000;
			opu_multipartAjaxPostRequestWithClbk(window.OPM.apiUrlPattern + url, formdata, "", function(response) {
				if(self && self.slideDetails) {
					self.set("showOpmCertificateUpload", false);
					self.set("showApmCertificateUpload", false);
					self.set("apmMandatory", false);
					self.set("opmUploadSuccess", false);
					self.set("apmUploadSuccess", false); //No I18n
					self.set("infoMessage", undefined);

					response = JSON.parse(response);
					self.set("ppmUploading", false); //No I18n
					if(response.opmBuildNumber || response.apmBuildNumber || response.result) {
						opm_infoMsgs("successMsg", response.message); //No I18n
						self.send("closeSlide"); //No I18n
						if(self.slideDetails.parentInstance) {
							if(response.opmBuildNumber) {
								self.slideDetails.parentInstance.set("ppmBuildNumber", response.opmBuildNumber); //No I18n
								self.slideDetails.parentInstance.set("apmPpmBuildNumber", response.apmBuildNumber); //No I18n
								self.slideDetails.parentInstance.set("patchType", response.patchType); //No I18n
							}
							self.slideDetails.parentInstance.send("loadServerDetailsPage"); //No I18n
						}
					} else if(response.error) {
						self.send("handleErrorCases", response.error);
					}
				}
			}, timeoutMs , function(textStatus, errorThrown) {
				if (self && !self.get('isDestroyed') && !self.get('isDestroying')) {
					self.set("ppmUploading", false); //No I18n
					self.send("showHideCloseButtonForUpgrade", false); //No I18n
					
					var errorMsg = Ember.I18n.t("webclient.upgrade.ppm.upload.timeout",this); //No I18n
					if (textStatus && textStatus !== "timeout") {
						errorMsg = Ember.I18n.t("webclient.upgrade.manager.api.error.in.upload",this); //No I18n
					}
					
					self.send("handleErrorCases", { //No I18n
						code: 17018,
						message: errorMsg
					});
					
					try {
						$("#upgrade_ppmbrowse").val("");
						$(".fileUploadTxt").text(""); // Clears custom display file name
						$("#upgrade_apmppmbrowse").val("");
						$("#upgrade_certbrowse").val("");
						$("#upgrade_apmcertbrowse").val("");
					} catch(e) {
						// Ignored if elements are not present in DOM
					}
				}
			})
		},
		handleErrorCases: function(error) {
			var self = this;
			self.send("showHideCloseButtonForUpgrade");  //No I18n
			if(error.code === 15000) {
				var ppmIntegFailedDetails = {
					opm_ppm_integrity_failed: error.opm_ppm_integrity_failed,
					apm_ppm_integrity_failed: error.apm_ppm_integrity_failed
				}
				self.send("integFailed", error.message, ppmIntegFailedDetails); //No I18n
			}
			else {
				self.set("productPpmIntegFailed", false); //NO I18n
				self.set("upgradeGeneralError", false); //NO I18n
				if(error.code === 17017) {
					self.set("infoMessage", error.message);
					self.set("apmMandatory", true);
					return;
				} else if(error.code === 17018) {
					this.set("upgradeGeneralError", true);//No I18n
					this.set("integErrorMessage", error.message); //No I18n
					return;
				} else {
					opm_infoMsgs('errorMsg',error.message);//No I18N
				}
			}
		}
	}

})


OPMClient.CommonTimeDetailsComponent = Ember.Component.extend({
	templateName: 'CommonTimeDetails', //No I18N
	selectedRecurrence: 'Once', //No I18N
	monthlyType: 'monthlyDay', //No I18N
	isOnce: Ember.computed.equal('selectedRecurrence', 'Once'), //No I18N
	isDaily: Ember.computed.equal('selectedRecurrence', 'Daily'), //No I18N
	isWeekly: Ember.computed.equal('selectedRecurrence', 'Weekly'), //No I18N
	isMonthly: Ember.computed.equal('selectedRecurrence', 'Monthly'), //No I18N
	isMonthlyDate: Ember.computed.equal('monthlyType', 'monthlyDate'), //No I18N
	isMonthlyDay: Ember.computed.equal('monthlyType', 'monthlyDay'), //No I18N
	init: function() {
		this._super();
		var today = new Date();
		var timeOptions = setScheduleTime();
		var createDayOption = function(dayOption) {
			return {
				key: String(dayOption.key),
				value: dayOption.value,
				weeklyInputId: 'weeklyDay' + dayOption.key, //No I18N
				monthlyInputId: 'monthlyDay' + dayOption.key, //No I18N
				weeklySelected: false,
				monthlySelected: false
			};
		};
		this.setProperties({
			hourOptions: timeOptions.hours,
			minuteOptions: timeOptions.minutes,
			monthlyDateOptions: timeOptions.monthlyDate,
			dayOptions: timeOptions.weeklyDay.map(createDayOption),
			monthlyWeekOptions: [
				{value: '1', label: Ember.I18n.t('webclient.general.first')},
				{value: '2', label: Ember.I18n.t('webclient.general.second')},
				{value: '3', label: Ember.I18n.t('webclient.general.third')},
				{value: '4', label: Ember.I18n.t('webclient.general.fourth')},
				{value: '5', label: Ember.I18n.t('webclient.general.last')}
			],
			minimumScheduleDate: this.formatDateInputValue(today),
			onceDate: this.formatDateInputValue(today),
			dailyStartDate: this.formatDateInputValue(today),
			onceHour: ('0' + today.getHours()).slice(-2),
			onceMinute: ('0' + today.getMinutes()).slice(-2),
			dailyHour: '00',
			dailyMinute: '00',
			weeklyHour: '00',
			weeklyMinute: '00',
			monthlyHour: '00',
			monthlyMinute: '00',
			monthlyDate: 1,
			monthlyWeekNumber: '1'
		});
	},
	didInsertElement: function() {
		Ember.run.schedule('afterRender', this, function() {  //No I18N
			if(!this.get('isDestroying') && !this.get('isDestroyed')) {
				this.get('parentView').set('commonTimeDetailsComponent', this); //No I18N
			}
		});
		this.populateRecurrenceDetails(this.get('scheduleData'));
	},
	willDestroyElement: function() {
		if(this.get('parentView.commonTimeDetailsComponent') === this) { //No I18N
			this.get('parentView').set('commonTimeDetailsComponent', undefined);  //No I18N
		}
	},
	formatDateInputValue: function(dateValue) {
		if(dateValue instanceof Date) {
			var year = dateValue.getFullYear();
			var month = String(dateValue.getMonth() + 1);
			var day = String(dateValue.getDate());
			return year + '-' + (month.length === 1 ? '0' + month : month) + '-' + (day.length === 1 ? '0' + day : day);
		}
		var dateText = dateValue == null ? '' : String(dateValue);
		var dateMatch = dateText.match(/^(\d{4}-\d{2}-\d{2})/);
		return dateMatch ? dateMatch[1] : '';
	},
	updateSelectedRecurrenceType: function(recurrenceType) {
		this.set('selectedRecurrence', recurrenceType);  //No I18N
	},
	updateMonthlyRecurrenceType: function(monthlyType) {
		this.set('monthlyType', monthlyType); //No I18N
	},
	getSelectedRecurrenceDays: function(selectedProperty) {
		var dayOptions = this.get('dayOptions');
		return dayOptions.filter(function(dayOption) {
			return Ember.get(dayOption, selectedProperty);
		}).map(function(dayOption) {
			return dayOption.key;
		});
	},
	validateRecurrenceDetails: function() {
		var recurrenceType = this.get('selectedRecurrence');
		var validationMessages = {
			startDateRequired: 'webclient.dashboard.scheduleDashboard.onceErrorMsg',  //No I18N
			futureDateRequired: 'webclient.dashboard.scheduleDashboard.DateFutureErrorMsg', //No I18N
			weeklyDayRequired: 'webclient.dashboard.scheduleDashboard.weeklyErrorMsg', //No I18N
			monthlyDateRequired: 'webclient.dashboard.scheduleDashboard.monthlyErrorMsg', //No I18N
			monthlyDayRequired: 'webclient.general.selectatleastoneday' //No I18N
		};
		var validationError;

		if(recurrenceType === 'Once') {
			var onceDate = this.get('onceDate');
			if(!onceDate) {
				validationError = 'startDateRequired';  //No I18N
			} else {
				var currentTime = new Date(window.OPM.jyear, window.OPM.jmon, window.OPM.jday, window.OPM.jhour, window.OPM.jmin, window.OPM.jsec);
				var selectedDate = getDate(onceDate, this.get('onceHour'), this.get('onceMinute'));
				if(!selectedDate || isNaN(selectedDate.getTime()) || selectedDate.getTime() <= currentTime.getTime()) {
					validationError = 'futureDateRequired';//No I18N
				}
			}
		} else if(recurrenceType === 'Daily' && !this.get('dailyStartDate')) {  //No I18N
			validationError = 'startDateRequired';  //No I18N
		} else if(recurrenceType === 'Weekly' && this.getSelectedRecurrenceDays('weeklySelected').length === 0) { //No I18N
			validationError = 'weeklyDayRequired';  //No I18N
		} else if(recurrenceType === 'Monthly') { //No I18N
			if(this.get('monthlyType') === 'monthlyDate' && !this.get('monthlyDate')) {
				validationError = 'monthlyDateRequired';   //No I18N
			} else if(this.get('monthlyType') === 'monthlyDay' && this.getSelectedRecurrenceDays('monthlySelected').length === 0) {  //No I18N
				validationError = 'monthlyDayRequired';   //No I18N
			}
		}

		if(validationError) {
			opm_infoMsgs('errorMsg', Ember.I18n.t(validationMessages[validationError])); //No I18N
			return false;
		}
		return true;
	},
	buildRecurrenceSchedulePayload: function() {
		var recurrenceType = this.get('selectedRecurrence');
		var payload = {schFreq: recurrenceType};
		if(recurrenceType === 'Once' || recurrenceType === 'Daily') {
			var prefix = recurrenceType === 'Once' ? 'once' : 'daily'; //No I18N
			payload.startDate = this.get(recurrenceType === 'Once' ? 'onceDate' : 'dailyStartDate');
			payload.hours = this.get(prefix + 'Hour');
			payload.minutes = this.get(prefix + 'Minute');
		} else if(recurrenceType === 'Weekly') {//No I18N
			payload.daysSelected = this.getSelectedRecurrenceDays('weeklySelected').join(',');  //No I18N
			payload.hours = this.get('weeklyHour');
			payload.minutes = this.get('weeklyMinute');
		} else {
			payload.monthlyType = this.get('monthlyType');
			if(payload.monthlyType === 'monthlyDate') {
				payload.dayOfMonth = this.get('monthlyDate');
			} else {
				payload.daysSelected = this.getSelectedRecurrenceDays('monthlySelected').join(',');  //No I18N
				payload.weekOfMonth = this.get('monthlyWeekNumber');
			}
			payload.hours = this.get('monthlyHour');
			payload.minutes = this.get('monthlyMinute');
		}
		return payload;
	},
	updateRecurrenceTime: function(prefix, scheduleHour, scheduleMinute) {
		this.set(prefix + 'Hour', scheduleHour);  //No I18N
		this.set(prefix + 'Minute', scheduleMinute);  //No I18N
		Ember.run.scheduleOnce('afterRender', this, function() { //No I18N
			if(this.get('isDestroying') || this.get('isDestroyed')) { return; }
			this.$('#' + prefix + 'Hour').val(scheduleHour).trigger('change');
			this.$('#' + prefix + 'Minute').val(scheduleMinute).trigger('change');
		});
	},
	populateRecurrenceDetails: function(scheduleData) {
		if(!scheduleData || typeof scheduleData !== 'object') { return; }
		var recurrenceType = scheduleData.frequency || 'Daily'; //No I18N
		var timeParts = (scheduleData.timeToSchedule || '').split(':');
		var formatTimePart = function(value) {
			var numericValue = parseInt(value, 10);
			return isNaN(numericValue) ? '00' : ('0' + numericValue).slice(-2);
		};
		var scheduleHour = formatTimePart(scheduleData.hours != null ? scheduleData.hours : timeParts[0]);
		var scheduleMinute = formatTimePart(scheduleData.minutes != null ? scheduleData.minutes : timeParts[1]);
		this.updateSelectedRecurrenceType(recurrenceType);
		if(recurrenceType === 'Once' || recurrenceType === 'Daily') {
			var prefix = recurrenceType === 'Once' ? 'once' : 'daily'; //No I18N
			var dateProperty = recurrenceType === 'Once' ? 'onceDate' : 'dailyStartDate'; //No I18N
			this.set(dateProperty, this.formatDateInputValue(scheduleData.startDate));
			this.updateRecurrenceTime(prefix, scheduleHour, scheduleMinute);
		} else if(recurrenceType === 'Weekly') {//No I18N
			this.setSelectedRecurrenceDays('weeklySelected', scheduleData.daysSelected);  //No I18N
			this.updateRecurrenceTime('weekly', scheduleHour, scheduleMinute); //No I18N
		} else {
			var monthlyType = String(scheduleData.monthlyType || (scheduleData.monthlyDay ? 'monthlyDay' : 'monthlyDate')); //No I18N
			this.updateMonthlyRecurrenceType(monthlyType);
			if(monthlyType === 'monthlyDate') {
				var monthlyDate = Number(scheduleData.dayOfMonth) || 1;
				this.set('monthlyDate', monthlyDate); //No I18N
				Ember.run.scheduleOnce('afterRender', this, function() { //No I18N
					if(this.get('isDestroying') || this.get('isDestroyed')) { return; }
					this.$('#monthlyDate').val(monthlyDate).trigger('change'); //No I18N
				});
			} else {
				this.setSelectedRecurrenceDays('monthlySelected', scheduleData.daysSelected);//No I18N
				this.set('monthlyWeekNumber', scheduleData.weekOfMonth || '1');  //No I18N
				this.$('#monthlyWeekNum').val(scheduleData.weekOfMonth).trigger('change');
			}
			this.updateRecurrenceTime('monthly', scheduleHour, scheduleMinute); //No I18N
		}
	},
	setSelectedRecurrenceDays: function(selectedProperty, selectedDays) {
		var selected = (selectedDays || '').toString().split(',');
		this.get('dayOptions').forEach(function(dayOption) {
			Ember.set(dayOption, selectedProperty, selected.indexOf(dayOption.key) !== -1);
		});
	},
	actions: {
		selectRecurrenceType: function(recurrenceType) {
			this.updateSelectedRecurrenceType(recurrenceType);
		},
		selectMonthlyRecurrenceType: function(monthlyType) {
			this.updateMonthlyRecurrenceType(monthlyType);
		}
	}
});

OPMClient.ScheduleDashboardComponent = Ember.Component.extend({
	templateName: 'ScheduleDashboard', //No I18N
	showMailNotConfigured: false,
	scheduleExportName: '',
	scheduleExportEmailAddress: '',
	scheduleExportMailSubject: '$scheduleName - $dashboardName', //No I18N
	scheduleExportMailMessage: '',
	didInsertElement: function() {
		var scheduleData = this.get('slideDetails.scheduleData');
		var dashName = this.get('slideDetails.dashName');
		var translatedName = Ember.I18n.t(dashName, this);
		if(translatedName.indexOf('Missing translation') < 0) { dashName = translatedName; }
		if(window.OPM.isMSPCentral) {
			dashName = OPMClient.ApplicationController.selCustomerName + ' : ' + dashName;
		}
		if(scheduleData && typeof scheduleData === 'object') {
			dashName = this.getScheduleDashboardName(scheduleData);
		}
		this.setProperties({
			scheduleDashboardName: dashName,
			scheduleExportMailMessage: Ember.I18n.t('webclient.admin.schedulerep.mailmes5', this) + Ember.I18n.t('webclient.dashboard.scheduleDashboard.message', this), //No I18N
			showMailNotConfigured: window.OPM.isMailServerSettingsConfigured === false,
			isGeneralSettingsWrite: window.OPM.userPermissions.generalSettingsWrite
		});
		this.populateScheduleDashboardForm(scheduleData);
	},
	getScheduleDashboardName: function(scheduleData) {
		var dashboardName = scheduleData.dashboardDisplayName || scheduleData.dashName || '';
		if(!window.OPM.isMSPCentral) { return dashboardName; }
		var customerList = Array.isArray(window.OPM.mspCustomerNameList) ? window.OPM.mspCustomerNameList : [];
		var selectedCustomer = customerList.find(function(customer) {
			return customer.CustomerID == scheduleData.selCustomerId;
		});
		return (selectedCustomer ? selectedCustomer.CustomerName : '') + ' : ' + dashboardName;
	},
	populateScheduleDashboardForm: function(scheduleData) {
		if(!scheduleData || typeof scheduleData !== 'object') { return; }
		this.setProperties({
			scheduleExportName: scheduleData.scheduleName || '',
			scheduleExportEmailAddress: scheduleData.emailIds || '',
			scheduleExportMailSubject: scheduleData.mailSubject || '',
			scheduleExportMailMessage: scheduleData.mailMessage || ''
		});
	},
	validateScheduleDashboardFields: function() {
		var fieldsToValidate = {
			empty: ['scheduleExportName', 'scheduleExportEmailId', 'scheduleExportMessage', 'scheduleExportSubject'], //No I18N
			mulitpleEmailWithSplchar: ['scheduleExportEmailId'] //No I18N
		};
		if(!opm_validateFields(fieldsToValidate)) {
			return false;
		}
		return true;
	},
	actions: {
		cancelDashboardExportSchedule: function() {
			this.get('slideDetails.parentObj').send(this.get('slideDetails.actionName'));
		},
		createDashboardExportSchedule: function() {
			if(this.get('showMailNotConfigured')) { return; }
			var commonTimeDetailsComponent = this.get('commonTimeDetailsComponent');
			if(!commonTimeDetailsComponent || !this.validateScheduleDashboardFields() || !commonTimeDetailsComponent.validateRecurrenceDetails()) { return; }
			var scheduleData = this.get('slideDetails.scheduleData');
			var isEditMode = this.get('slideDetails.editMode');
			if(isEditMode && (!scheduleData || typeof scheduleData !== 'object')) { return; }
			var scheduleId = isEditMode ? scheduleData.scheduleId : undefined;
			var dashboardId = isEditMode ? scheduleData.dashboardId : this.get('slideDetails.dashboardID');
			var postData = commonTimeDetailsComponent.buildRecurrenceSchedulePayload();
			postData.scheduleName = this.get('scheduleExportName');
			postData.dashboardId = dashboardId;
			postData.emailTo = this.get('scheduleExportEmailAddress');
			postData.mailSubject = this.get('scheduleExportMailSubject');
			postData.mailMsg = this.get('scheduleExportMailMessage');
			if(scheduleId !== undefined && scheduleId !== null) { postData.scheduleId = scheduleId; }
			var postUrl = window.OPM.apiUrlPattern + '/dashboard/' + (isEditMode ? 'updateDashboardExportSchedule' : 'createDashboardExportSchedule'); //No I18N
			var response = opm_ajaxPostRequest(postUrl, postData);
			showMessage(response);
			if(!response || response.error !== undefined) { return; }
			if(isEditMode) {
				OPMClient.HomeDetailsController.set('editSlideDetails', undefined); //No I18N
				opm_getDashboardExportScheduleList();
			} else {
				location.href = window.OPM.apiclientUrl + 'Home/Dashboard/' + encodeURIComponent(this.get('slideDetails.dashboardType') || '') + '/' + opm_escapeChars(this.get('slideDetails.dashName') || '');
			}
		}
	}
});

OPMClient.DashboardScheduleListComponent = Ember.Component.extend({
	templateName: 'EditScheduleDashboard', //No I18N
	init: function() {
		this._super();
		this.updateShowAllSchedulesLabel();
	},
	didInsertElement: function() {
		/* Reset retained selections each time the list component mounts */
		if(typeof gridSelectedRows !== 'undefined') {
			gridSelectedRows['#dashboardScheduleList'] = {}; //No I18N
		}
		opm_getDashboardExportScheduleList();
	},
	updateShowAllSchedulesLabel: function() {
		this.set('showAllSchedulesLabel', window.__showAllDashboardSchedules ? Ember.I18n.t('webclient.dashboard.scheduleDashboard.hideSchedules') : Ember.I18n.t('webclient.dashboard.scheduleDashboard.showSchedules')); //No I18N
	},
	findClosestElementWithClass: function(element, className) {
		while(element && element !== this.element) {
			if(element.classList && element.classList.contains(className)) { return element; }
			element = element.parentNode;
		}
		return null;
	},
	change: function(event) {
		var statusToggle = this.findClosestElementWithClass(event.target, 'dashboardScheduleStatusToggle'); //No I18N
		if(!statusToggle) { return; }
		var enable = statusToggle.checked;
		opm_enableDisableDashboardExportSchedule([statusToggle.getAttribute('data-schedule-id')], enable, undefined, function() { //No I18N
			statusToggle.checked = !enable;
		});
	},
	click: function(event) {
		var editAction = this.findClosestElementWithClass(event.target, 'dashboardScheduleEdit'); //No I18N
		if(editAction && !editAction.classList.contains('disabledBlock')) {
			this.openDashboardScheduleEditSlide(editAction.getAttribute('data-schedule-id')); //No I18N
			return;
		}
		var deleteAction = this.findClosestElementWithClass(event.target, 'dashboardScheduleDelete'); //No I18N
		if(deleteAction) {
			opm_deleteDashboardExportSchedule([deleteAction.getAttribute('data-schedule-id')]); //No I18N
		}
	},
	openDashboardScheduleEditSlide: function(scheduleId) {
		var cache = window.__dashboardScheduleListCache || [];
		var scheduleData = cache.find(function(cachedSchedule) {
			return cachedSchedule && typeof cachedSchedule === 'object' && String(cachedSchedule.scheduleId) === String(scheduleId); //No I18N
		});
		if(!scheduleData) { return; }
		OPMClient.HomeDetailsController.set('editSlideDetails', {  //No I18N
			id: 'dashboard_edit_schedule', //No I18N
			componentName: 'OPMClient.ScheduleDashboardComponent', //No I18N
			slideHeader: Ember.I18n.t('webclient.title.edit') + ' ' + Ember.I18n.t('webclient.dashboard.scheduleDashboard.scheduleExport'), //No I18N
			isMedium: true,
			editMode: true,
			scheduleData: scheduleData,
			scheduleId: scheduleId,
			dashName: this.get('slideDetails.dashName'),
			dashboardType: this.get('slideDetails.dashboardType'),
			actionName: 'closeEditScheduleSlide', //No I18N
			sectionClass: 'pr-none', //No I18N
			parentObj: this
		});
	},
	isBulkScheduleActionDisabled: function(buttonId) {
		var actionButton = $("#"+buttonId);
		return !actionButton || actionButton.hasClass('disabledBlock'); //No I18N
	},
	getSelectedDashboardScheduleIds: function() {
		return opm_getSelectedDashboardScheduleIds();
	},
	actions: {
		enableDisableScheduleStatus : function(enable) {
			var buttonId = enable ? 'dashScheduleEnableBtn' : 'dashScheduleDisableBtn'; //No I18N
			if(this.isBulkScheduleActionDisabled(buttonId)) { return; }
			var scheduleIds = this.getSelectedDashboardScheduleIds();
			if(scheduleIds.length === 0) { return; }
			opm_enableDisableDashboardExportSchedule(scheduleIds, enable, function() {
				opm_getDashboardExportScheduleList();
			});
		},
		deleteSelectedDashboardSchedules: function() {
			if(this.isBulkScheduleActionDisabled('dashScheduleDeleteBtn')) { return; } //No I18N
			var scheduleIds = this.getSelectedDashboardScheduleIds();
			if(scheduleIds.length > 0) { opm_deleteDashboardExportSchedule(scheduleIds); }
		},
		showAllSchedules: function() {
			window.__showAllDashboardSchedules = !window.__showAllDashboardSchedules;
			this.updateShowAllSchedulesLabel();
			opm_getDashboardExportScheduleList();
		},
		closeScheduleList: function() {
			this.get('slideDetails.parentObj').send(this.get('slideDetails.actionName'));
		},
		closeEditScheduleSlide: function() {
			OPMClient.HomeDetailsController.set('editSlideDetails', undefined); //No I18N
		}
	}
});

OPMClient.DashboardListAccordionComponent = Ember.Component.extend({
	templateName: "DashboardListAccordion", //No I18n
	dashboardArray: [],
	openIndex: 0,
	didInsertElement: function() {
		var self = this;
		var dashboardArray = [];
		var nonCatDashboards = [];
		var dashboardListResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/dashboard/getDashboardList");//No I18n
		var allDash = dashboardListResponse;
		var allDashDetails = {}
		if(allDash.length) {
			allDash.forEach(function(dash) {
				allDashDetails[dash.Name] = dash;
			});
		}
		this.set("allDashDetails", allDashDetails); //No I18n
		if(!window.OPM.userPermissions.devGroupRestricted) {
			getDashboardList(undefined, true);
		}
		OPMClient.MenuController.dashboardMenuLinks.forEach(function(cat) {
			if(cat.isHide) {
				return;
			}
			if(cat.subMenu) {
				dashboardArray.push(cat);
			} else {
				nonCatDashboards.push(cat);
			}
		});
		if(nonCatDashboards.length > 0) {
			dashboardArray.push({displayName: Ember.I18n.t("webclient.dashboard.builtindashboards"), subMenu: nonCatDashboards, dataDName: "Dashboards_Default"});
		}
		var customDashIndex;
		var i = -1;
		var containsDefaultDashIndex = 0;
		dashboardArray = dashboardArray.map(function(cat) {
			i++;
			var dashNo; //To determine if last dashboard of category to remove bottom separator line
			return $.extend({}, cat, {isCustomDash: cat.tabIdentifier === "Dashboard_Custom" || cat.dataDName === "CstmDashBrd" ? (customDashIndex = i, true) : false, subMenu: cat.subMenu ?(dashNo=0,cat.subMenu.map(function(dash){//No I18n
				dashNo++;
				if(dash.menuLink && !(dash.customClass && dash.customClass.includes("subAddIcon"))) {
					var urlParts = dash.menuLink.split("/");
					var dashServerName = urlParts[urlParts.length - 1];
					var dashType = urlParts[urlParts.length - 2];
					var dashObj = { //Common properties same condition
						lastItem: dashNo === cat.subMenu.length,
						hideFavt: dashServerName === "dashboard.name.apm" || window.OPM.isEEProbeSelected || OPMClient.ApplicationController.isFWAServer || !window.OPM.userPermissions.dashboardRead || (window.isserver && !OPMClient.ApplicationController.isAllCollector) //No I18n
					}
						return $.extend({}, dash, dashObj, { isAddWidget: allDashDetails[dashServerName] ? (allDashDetails[dashServerName].isAddWidgetInDefaultDashboard === "true" && window.OPM.userPermissions.dashboardWrite && window.OPM.isAuthorized && window.OPM.isWidgetActions && !window.OPM.isFWAServer) : false, isEdit: false, dashType: dashType, isFavt: window.OPM.defaultDashboard === dashServerName ? (containsDefaultDashIndex = i, true) : false, dashServerName: dashServerName, isActive: OPMClient.HomeDetailsController.dashboardName === dashServerName});
				} else { //Custom Dash does not have menuLink
						if(window.OPM.userPermissions.devGrouporBVRestricted && allDashDetails[dash.displayName] && !allDashDetails[dash.displayName].isDashboardOwner) {
							return $.extend(dash,{isAddAction: false, isFavt: window.OPM.defaultDashboard === dash.displayName, dashType: "Custom", dashServerName: dash.displayName, isActive: OPMClient.HomeDetailsController.dashboardName === dash.displayName});//No I18N
						}
						return allDashDetails[dash.displayName] ? $.extend({}, dash, dashObj, {isAddWidget: window.OPM.userPermissions.dashboardWrite && allDashDetails[dash.displayName].editDashboard  && !window.OPM.isFWAServer,hideFavt: window.OPM.isEEProbeSelected || OPMClient.ApplicationController.isFWAServer, customDashboardId: allDashDetails[dash.displayName].Id, desc:  allDashDetails[dash.displayName].Desc, isEdit: window.OPM.userPermissions.dashboardWrite && allDashDetails[dash.displayName].editDashboard  && !window.OPM.isFWAServer, isFavt: window.OPM.defaultDashboard === dash.displayName ? (containsDefaultDashIndex = i, true) : false, dashType: "Custom", dashServerName: dash.displayName, isActive: OPMClient.HomeDetailsController.dashboardName === dash.displayName}) : $.extend(dash,{isAddAction: true}) 
				}
			})) : []});
		});
		if(!(window.isserver && !isAllCollectorSelected())) {
			dashboardArray[containsDefaultDashIndex] = Object.assign(dashboardArray[containsDefaultDashIndex], {containsDefaultDash: true}); // Set default dash badge.
		}
		if(customDashIndex) {
			if(nonCatDashboards.length > 0) {
				var defaultDashIndex = dashboardArray.length - 1;
				var tempObj = dashboardArray[defaultDashIndex];
				dashboardArray[defaultDashIndex] = dashboardArray[customDashIndex]
				dashboardArray[customDashIndex] = tempObj; // To move the custom dashboard to last index
				var tempVar = customDashIndex
				customDashIndex = defaultDashIndex; 
				defaultDashIndex = tempVar;//Since index has changed now
			}
			if(dashboardArray[customDashIndex].subMenu.length < 1 || (dashboardArray[customDashIndex].subMenu.length < 2 && dashboardArray[customDashIndex].subMenu[0].isAddAction)) { //check if no custom dashboards present.
				dashboardArray.splice(customDashIndex, 1);
			}
		}
		self.set("dashboardArray", dashboardArray);//No I18n
		Ember.run.schedule("afterRender", function() {//No I18n
			var defaultDashCategory = dashboardArray.filter(function(obj){return obj.containsDefaultDash})[0];
			self.send("toggleDashboardAccordion", defaultDashCategory ? defaultDashCategory.dataDName : "");
		})
	},
	actions: {
		toggleDashboardAccordion: function(dataDName) {
			this.set('dashboardArray', this.dashboardArray.map(function(cat){//No I18n
				return $.extend({}, cat, {isOpen: dataDName === cat.dataDName ? !cat.isOpen : cat.isOpen});
			}));
		},
		setAsFavtDash: function(dashType, dashServerName) {
			makeAsDefaultDashboard(dashType, dashServerName);
			var i = -1;
			var containsDefaultDashIndex = 0;
			var dashboardArray = this.dashboardArray.map(function(cat){
				i++;
				return $.extend({}, cat, {containsDefaultDash: false, subMenu: cat.subMenu.map(function(dash) {
					return $.extend({}, dash, {isFavt: dash.dashServerName === dashServerName ? ( containsDefaultDashIndex = i,true) : false});
				})});
			});
			dashboardArray[containsDefaultDashIndex] = Object.assign(dashboardArray[containsDefaultDashIndex], {containsDefaultDash: true}); // Set default dash badge.
			this.set('dashboardArray', dashboardArray); //No I18n

		},
		addWidgets: function(dashType, dashServerName) {
			OPMClient.HomeDetailsController.set('addWidgetOperation',true); //No I18N
			redirectToAddDashboard(dashType, dashServerName,"Add");//No I18N
		},
		editDashboard: function(dashType, dashServerName) {
			var editDashDetails = {};
			var allDashDetails = this.get("allDashDetails");
			var toEditDash = allDashDetails[dashServerName];
			editDashDetails.id = toEditDash.Id;
			editDashDetails.name = toEditDash.Name;
			editDashDetails.desc = toEditDash.Desc;
			OPMClient.HomeDetailsController.set('editDashboardDetails', editDashDetails); //No I18N
			redirectToAddDashboard(dashType, dashServerName, "Edit");//No I18N
		},
		deleteDashboard: function(customDashboardId, dashServerName) {
			var self = this;
			opmConfirm("", Ember.I18n.t('webclient.dashboards.alert.deletedash'), "", function() {
				var dashBoardName = dashServerName;
				var dashboardID = customDashboardId;
				var url = window.OPM.apiUrlPattern + '/dashboard/deleteDashboard'; //No I18N
				var data = { 'dashboardName': dashBoardName }; //No I18N
				if (dashboardID !== undefined) {
					data.dashboardId = dashboardID;
				}
				var rsp = opm_ajaxPostRequest(url, data);
				showMessage(rsp);
				if (rsp.error === undefined) {
					opm_stopRealTimeWidget();
					// dashboardSlideOut(1);
					switchToOtherDashboard(dashBoardName,true);
					Ember.run.schedule('afterRender', function() { //No I18N
						if(window.OPM.oldView) {
							if(window.OPM.isNCM) {
								loadNCMDashboards();
							}else if(window.OPM.isFWA) {
								loadFWACustomDashList();
							}else if(window.OPM.isNFA) {
								nfa_getSubDashBoardMenuLinks();
							}else {
								getDashboardList();
							}
						}
						self.rerender();
					});
					if((window.OPM.userPermissions.intfGroupRestricted || window.OPM.userPermissions.devGroupRestricted)&& OPMClient.MenuController.customDashboards.length <=2) {
						$("#MainNav li[data-title='Dashboard'] > a").attr("href","#/Home/Dashboard/Custom/Add__New__Dash");//No I18N
						//close the accordion slide when no custom dashboards
						self.get('parentView').send("closeAction");//No I18N
					}
				}
			}, "", "", "", "", "dialogStyle2");
		},
		redirectToDashboard: function(dashName) {
			var selectedDash;
			(this.dashboardArray || []).some(function(category) {
				if(!category.subMenu || !category.subMenu.length) {
					return false;
				}
				selectedDash = category.subMenu.find(function(dash) {
					return dash.dashServerName === dashName || dash.displayName === dashName;
				});
				return !!selectedDash;
			});
			if(!selectedDash) {
				return;
			}
			var dashType = selectedDash.dashType || "Custom";
			var targetHash = selectedDash.menuLink || ("#/Home/Dashboard/" + dashType + "/" + encodeURIComponent(selectedDash.dashServerName));
			window.location.hash = targetHash.startsWith("#") ? targetHash : ("#" + targetHash);

			var dashboardArray = this.get('dashboardArray');
			if(dashboardArray) {
				this.set('dashboardArray', dashboardArray.map(function(cat) { //No I18n
					return $.extend({}, cat, {subMenu: cat.subMenu ? cat.subMenu.map(function(dash) {
						return $.extend({}, dash, {isActive: dashName === dash.dashServerName});
					}) : []});
				}));
			}
		}
	}
});

OPMClient.ScalablityProblematicReportsComponent = Ember.Component.extend({
	templateName: "components/scalablity-problematic-reports", //No I18N
	didInsertElement: function() {
		var self = this;
		var model = {}
		var hideTabViews = false;
		if(self.get("slideDetails.metrics") == "MSSQLServerDBDisconnection" || self.get("slideDetails.metrics") == "MonitorsInstanceCount") {
			hideTabViews = true;
		}
		self.set("hideTabViews", hideTabViews);//No I18n
		model.tabs = [
			{'displayName': Ember.I18n.t("graphview"), 'id': 'graphView','graphID':"graphReports", 'isActive': false, isChecked : true}, //No I18n
			{'displayName': Ember.I18n.t("tableview"), 'id': 'tableView','contentID':'tableReports', 'pagerID':"tablePager", 'isActive': false} //No I18n
		]
		self.set("model", model); //No I18n
		$('#scalablityReportsTime').on('change', function() {
			var obj = this;
			if(obj.value == "custom") { 
				var customTimeDetails = {};
				customTimeDetails.id = "scalablity_reports_customTime";
				customTimeDetails.componentName = "OPMClient.CustomTimeReportsComponent";//No I18N
				customTimeDetails.slideHeader = Ember.I18n.t("webclient.Custom.Time");//No I18N
				customTimeDetails.isSmall = true;
				customTimeDetails.actionName = "cancelCustomTimeSlide";//No I18N
				customTimeDetails.parentObj = self;
				self.set("controller.customTimeDetails",customTimeDetails);//No I18N
			} else {
				self.send("changeReportsTime");//No I18n
			}
		});
		$('.scalablityReportsTime_Select').select2();
		Ember.run.schedule("afterRender", function() { //No I18n
			self.send("toggleTabsView", hideTabViews ? "tableView" : "");//No I18n
			//Since Monitor instance count doesnt show based on time
			if(self.get("slideDetails.metrics") == "MonitorsInstanceCount") {
				$('#scalablityProblematicReportsTime').hide();
			}
		});
	},
	scalablityReportsObserver :  function() {
		this.send("reportsView");//No I18n
	}.observes('scalablityGraphData','scalabilityTableData'),//No I18n
	actions :{
		toggleTabsView :  function(val) {
			$('input[value="'+ val +'"]').prop("checked", true);
			if(val == "tableView") {
				this.set("currentView", "tableView");//No I18n
				$('#matric_tableReports').show();
				$("#graphReports").hide();
				if(!this.get("scalabilityTableData")) {
					this.send("changeReportsTime");//No I18N
				} else {
					this.send("reportsView");//No I18N
				}
			} else {
				this.set("currentView", "graphView");//No I18n
				$('#matric_tableReports').hide();
				$("#graphReports").show();
				if(!this.get("scalablityGraphData")) {
					this.send("changeReportsTime");//No I18N
				} else {
					this.send("reportsView");//No I18N
				}
			}
		},
		changeReportsTime : function(time) {
			var selectedTime = $("#scalablityReportsTime").val();
			if(!selectedTime) {
				selectedTime = "Today"; //No I18n
			}
			var data = {};
			var slideDetails = this.get('slideDetails');
			if(selectedTime == "custom") {
				time = time ? time : this.get('controller.customTime');//No I18N
				data = time;
			}
			this.scalabilityTableData = undefined;
			this.scalablityGraphData = undefined;
			
			if(slideDetails.probeID && slideDetails.probeID != -1) {
				if(window.OPM.isNCMEE && !window.OPM.isProbeSelected) {
					data.ncmProbeId = slideDetails.probeID;
				} else if (window.OPM.isFWADE && !window.OPM.isFWACollector) {
					data.selColId = slideDetails.probeID;
				} else if(window.isNFADE && !window.iscollector){
					data.collOpt = slideDetails.probeID; 
				} else if(window.OPM.isMSPCentral && slideDetails.custId!=undefined) {
					data.selCustomerID = slideDetails.custId;
					data.regionID = slideDetails.probeID;
				} else {
					data.eeProbeID = slideDetails.probeID;
				}
			}
			var viewAs = this.get("currentView"); //No I18n
			var url = window.OPM.apiUrlPattern + '/diagnostics/getProblematicPAReport?viewAs='+viewAs+'&time='+ selectedTime + '&metricName='+slideDetails.metrics;//No I18N
			var graphData = {};
			if((window.isNFADE && !window.iscollector && data.collOpt !== undefined) || (window.OPM.isFWADE && !window.OPM.isFWACollector && slideDetails.probeID == -1)) {
				$.ajax(
					{
						url: url,
						data: data, 
						type: 'GET', //No I18N
						dataType: 'json', //No I18n
						async:false,
						beforeSend: function(XMLHttpRequest,settings)
						  {
							  opm_progressBarInit();
						  },
						success: function(jsonData)
						{
							opm_progressBarComplete();
							graphData = jsonData;
						}
					});
			} else {
				graphData = opm_ajaxGetResponse(url, data); 
			}
			if(graphData !== undefined && graphData.error === undefined && Object.keys(graphData).length > 0) {
				this.set('scalablityData', graphData);//No I18N
				if(viewAs === "graphView") {
					this.set("scalablityGraphData", graphData);//No I18N	
				} else {
					this.set("scalabilityTableData", graphData);//No I18N
				}
			}
		},
		reportsView : function() {
			var self = this;
			var currentView = this.get("currentView"); //No I18n
			var graphData =  this.get("scalablityGraphData");//No I18N
			var tableData = this.get("scalabilityTableData"); //No I18N

			var metricName = this.get("slideDetails") ? this.get("slideDetails").metrics : "";
			if(currentView == "graphView" && graphData && Object.keys(graphData).length > 0) {
				var arraObj={
					"placeholder":[],//No I18N
					"chartobj":[]//No I18N
				}
				$('#matric_tableReports').hide();
				$("#graphReports").show();
				var timeFormat = $('#scalablityReportsTime').val();
				var graphParams = {};
				graphParams.x_axes = graphData.graphHeaders[0];
				graphParams.y_axes = graphData.graphHeaders[1];
				graphParams.id = "graphReports";
				graphParams.graphData = graphData.graphDetails;
				graphParams.height = (graphParams.height!=undefined)?graphParams.height:300;
				graphParams.stacked = (graphParams.stacked!=undefined)?graphParams.stacked:false;
				graphParams.timeFormat = timeFormat;
				graphParams.tooltip = (graphParams.tooltip!=undefined)?graphParams.tooltip:[0,1];
			
				var arraObj={"placeholder":[],"chartobj":[]};//No I18N
				var chartObj = {
					id:graphParams.id,
					type:'area',//No I18N
					series:"multi",//No I18N
					jsonData:graphParams.graphData,
					height:graphParams.height,
					columns:{
						datatype_1:'time',//No I18N
						datatype_2:'numeric',//No I18N
						columnname_1:graphParams.x_axes,
						columnname_2:graphParams.y_axes,
						columnname_3:'Label',//No I18N
						timeFormat:graphParams.timeFormat
					},
					canvas:{
						title:{
							show:false,
							text:""
						}
					},
					chart:{stacked:graphParams.stacked},
					area:{marker:true},
					legend:{
						"enabled":true//No I18N
					},
					bar:{
						rotated:false,
						levelMarker:true
					},
					axes:{
						"xaxis": {//No I18N
								"label": {//No I18N
									"text":Ember.I18n.t("webclient.admin.schedulereports.time"),//No I18N
									"marginBottom":10//No I18N
								},
								"ticklabel": {//No I18N
								"rotation": "auto"//No I18N
								},
								"show":true//No I18N
							},
							"yaxis": [//No I18N
							{"label": {//No I18N
									"text": graphParams.y_axes//No I18N
								},
								"show": true,//No I18N
								"minRange":(graphParams.minRange!==undefined)?graphParams.minRange:null,//No I18N
								"maxRange":(graphParams.maxRange!==undefined)?graphParams.maxRange:null//No I18N
							}
						]
					},
					"plot": {//No I18N
						"plotoptions": {//No I18N
							"area": {//No I18N
								"events": {//No I18N
									"click": function (e, d) {//No I18N
										var top3Info = d.data[2] ? d.data[2].value : undefined;
										var timeInstance = d.data[0] ? d.data[0].value : undefined
										var currentZone = (window.OPM.severTimeZone !== undefined ? window.OPM.severTimeZone : moment.tz.guess());
										var tz_time = moment.tz(timeInstance,currentZone);
										timeInstance = tz_time.format(mtz_pattern);
										self.set("top3Info", top3Info);//No I18N
										self.set("top3AtInstance", self.get("top3Header") + " - " + timeInstance);//No I18N
									}
								}
							}
						}
					},
					tooltip:graphParams.tooltip 
				}
			
				if(graphParams.suffix !== undefined && graphParams.suffix !== ""){
					chartObj.columns.suffix = graphParams.suffix;
				}
				arraObj.chartobj.push(chartObj);
				arraObj.placeholder.push(graphParams.id);
				zChart(arraObj); 
			} else {
					var colModel = [];
					for(var i=0;i<tableData.tableHeaders.length;i++) {
						var obj = {'name':tableData.tableHeaders[i],'index':tableData.tableHeaders[i], width:'30', search: true ,sorttype:"number", querykey:"graphheader" };//No I18N
						if(i == 0) {
							obj.width = '20';
						}
						if(i == 1) {
							obj.searchoptions = { sopt: ['eq', 'lt', 'gt'] }; //No I18N
							obj.logicalSearchOptions = true;
							obj.width = '20';
							if(metricName === "MonitoringLoad") {
								obj.formatter = expandFormatter;
							}
						}
						if(i == 2) {
							obj.formatter = expandFormatter;
							obj.width = '80';
						}
						colModel.push(obj);
					}
					var defaultOptions = {
						multiselect: false,
						minRowsPerPage: 50,
						searchOption : true,
						hideExcel:true,
						hideCSV: true,
						Search : false,
						logicalSearchOptions: true,
						expandFormatter: true
					}
					if(tableData.length > 50) {
						defaultOptions.pagination = true;
					}
					var headers = tableData.tableHeaders.slice();
					headers.push("");
					colModel.push({name: "id", index: "id", hidden: true, search: false, sortable: false}); //No I18N
					$('#tableReports').jqGrid('GridUnload');
					Ember.run.schedule('afterRender', function () { //No I18n
						opm_loadJQgridWithData('#tableReports', tableData.tableData, headers, colModel, '', '#tablePager', '', defaultOptions); //No I18N
						$('#tableReports').setGridWidth($('#matric_tableReports').width());
					})
				}
		},
		saveCustomTime: function() {
			var self = this;
			var startDate = $('#startat').val();
			var endDate = $('#endat').val();
			var startHrs = $('#from_hrs_sel').val();
			var endHrs = $('#to_hrs_sel').val();
			var fieldsToValidate = {'empty':['startat', 'endat']}//No I18N
			var isValid = opm_validateFields(fieldsToValidate);
			if(!isValid){
				return isValid;
			}
			var custom = {};
			custom.startTime = startDate;
			custom.endTime = endDate;
			custom.startHour = startHrs;
			custom.endHour = endHrs;
			self.set('controller.customTime', custom);//No I18N
			self.send('changeReportsTime', custom);//No I18N
			slideOutWithId(self.get("controller.customTimeDetails").id);
			setTimeout(function() {
				self.set("controller.customTimeDetails",undefined);//No I18N
			},500);
		},
		cancelCustomTimeSlide: function() {
			$('#scalablityReportsTime').val('twelvehours').change();
			var self = this;
			self.set('controller.customTime', undefined);//No I18N
			setTimeout(function() {
				self.set("controller.customTimeDetails",undefined);//No I18N
			},500);
		}
	}
});

OPMClient.OpmOverUtilizRuleComponent = Ember.Component.extend({
	templateName: "components/add-overutilized-Rule",//No I18N
	didInsertElement: function() {
		var self = this;
		var dropdownContainer = $('#overUtilizedRule .multiselect-dropdown-container');
		var selResponse = [];
		var defPerfGroupNames = ['CPU Utilization', 'Disk Utilization', 'Memory Utilization'];//No I18N
		var defCpRuleProps = new Map([
			["webclient.reports.cpr.overutilized.name",{"thresholdValue":70, "thresholdCondition":1}],//No I18N
			["webclient.reports.cpr.underutilized.name",{"thresholdValue":30, "thresholdCondition":2}],//No I18N
			["webclient.reports.cpr.idle.name",{"thresholdValue":10, "thresholdCondition":2}]//No I18N
			]);

		var pgToRuleMap = new Map();
	    if(OPMClient.ReportsDetailsController.cpType === "Device"){
			var defPerfGroups = getDefaultPerfgroups(OPMClient.ReportsDetailsController.availablePerfGroups);
			$.each(defPerfGroups, function(index, obj){
				if(defPerfGroupNames.includes(obj.PERFGROUPNAME)){
					pgToRuleMap.set(obj.PERFGROUPID, defCpRuleProps);
				}
			});
        }else if(OPMClient.ReportsDetailsController.cpType === "Interface"){//No I18N
        	var interfacemonitors= JSON.stringify(OPMClient.ReportsDetailsController.interfaceMonitorListForCPR);
        	OPMClient.ReportsDetailsController.set("availablePerfGroups",JSON.parse(interfacemonitors));//No I18N
        }
		var isAndOr = "AND";//No I18N
		if(this.get('slideDetails').isEdit !== undefined){
			var editRule = this.get('slideDetails').editObj.ruleId;
			var ruleDetails = opm_ajaxGetRequest(window.OPM.apiUrlPattern + '/reports/getCpRuleProps',{'ruleId':editRule});//No I18N
			selResponse = this.setRuleDetails(ruleDetails.data.cpRule);
		}

		this.set("cpType",OPMClient.ReportsDetailsController.cpType);//No I18N
		this.set("pgList",OPMClient.ReportsDetailsController.availablePerfGroups);//No I18N
		this.set("selectedData",selResponse); //No I18N
		this.set('isAndOr', 'AND');//No I18N
		this.set('relationalOperators',getRelationalOperators());//No I18N
		this.set('pgToRuleMap', pgToRuleMap);//No I18N
		if(selResponse.length !== 0){
			$('.badge-group').show();
		}
		$('#overUtilizedRule').click(function(e){
		    var searchInput = $(".multiselect-dropdown-container .multiselDrpSearch");
		    if (!dropdownContainer.hasClass('active') && $(e.target).closest('.multiselect-dropdown-container').length > 0) {
		        dropdownContainer.addClass('active');
		        searchInput.focus();
		    } else if (dropdownContainer.hasClass('active') && !dropdownContainer.is(e.target) && dropdownContainer.has(e.target).length === 0) { //No I18n
		        dropdownContainer.removeClass('active');
		    }
		});
		$(".multiselect-dropdown-container .multiselDrpSearch").keyup(function () { //No I18n
		    listSearch($(this).val(),"multiselect-dropdown-list"); //No I18N
		});
		 Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
			$(".reportCriteria .select2").select2();
			$("#criteriaRow .select2").select2();
		});
	},
	setRuleDetails:function(ruleObj)
	{
		var selResponse = [];
		var perfObj = ruleObj.metrics;
		var perfGroup = new Map();
		var pgIdx = new Map();
		$.each(OPMClient.ReportsDetailsController.availablePerfGroups,function(index,obj){
			perfGroup.set(obj.PERFGROUPID, obj.PERFGROUPNAME);
			pgIdx.set(obj.PERFGROUPID, index);
		});

		$('#ruleName').val(ruleObj.displayName);
		$('#ruleName').prop('disabled',true);
		$('#ruleDisc').val(ruleObj.description);
		$('#overUtilCond').select2().val(ruleObj.timeCondition);
		$('#overUtilVal').val(ruleObj.timeThreshold);
		$.each(ruleObj.staticMetrics,function(index,metricRowObj){
			$('#criteriaVal').val(metricRowObj.thresholdValue);
			$('#criteriaCond').select2().val(parseInt(metricRowObj.thresholdCondition));
			Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
				$('#criteriaName').select2().val(metricRowObj.monitorName);
				$('#criteriaUnit').select2().val(metricRowObj.unit);
			});
		});
		$.each(perfObj,function(index,metricRowObj){
				var pgId = metricRowObj.perfgroupId;
				var oldIsAndOr = ruleObj.criteriaPattern.indexOf(metricRowObj.thresholdId+'AND') !== -1 ? 'AND':'OR';//No I18N
				var oldShowAndOr = true;
				if(index === (perfObj.length-1)){
					oldShowAndOr = false;
				}
				var selectedObj = {"PERFGROUPID": pgId, //No I18N
					"PERFGROUPNAME": perfGroup.get(pgId),//No I18N
					"selected": true, //No I18N
					"rowNum": index+1, //No I18N
					"thresholdId": metricRowObj.thresholdId, //No I18N
					"thresholdCondn": parseInt(metricRowObj.thresholdCondition), //No I18N
					"thresholdVal": metricRowObj.thresholdValue, //No I18N
					"metrics":metricRowObj,//No I18N
					"isAndOr": oldIsAndOr, //No I18N
					"utilCond": "utilCond_"+pgId, //No I18N
					"showAndOr": oldShowAndOr}//No I18N
				if(OPMClient.ReportsDetailsController.cpType === "Interface"){
					var perfIndex = OPMClient.ReportsDetailsController.interfaceMonitorListForCPR.map(function(e){return e.PERFGROUPID;}).indexOf(metricRowObj.perfgroupId);
					var availableUnits=OPMClient.ReportsDetailsController.interfaceMonitorListForCPR[perfIndex].availableUnits;
					selectedObj.utilUnit="utilUnit_"+pgId;//No I18N
					selectedObj.selectedUnit=metricRowObj.unit;
					selectedObj.availableUnits=availableUnits;
				}
				selResponse.pushObject(selectedObj);
				OPMClient.ReportsDetailsController.availablePerfGroups[pgIdx.get(pgId)].selected=true;

		});
		return selResponse;
	},
	actions: {
		addRule:function()
		{
			var self = this;
			var ruleName = $('#ruleName').val();
			var ruleDesc = $('#ruleDisc').val();
			var overUtilCondi = $('#overUtilCond option:selected').val();
			var overUtilVal = $('#overUtilVal').val();
			var criConditon = '';
			var ruleRegex = /[\\\/:*?"`<>|&;%#,]/;//No I18N
			var fieldsToValidate = {'empty':['ruleName','overUtilVal'],'custom':[{'condition':(ruleRegex.test(ruleName)),'identifier':'ruleName','message':Ember.I18n.t('webclient.maps.label.specialChar',this)}],'positiveorempty':['overUtilVal'],'rangeCheck':{'overUtilVal': 100},'minRangeCheck':{'overUtilVal': 1}};//No I18N
            if(ruleDesc !== ""){
                fieldsToValidate.custom.push({'condition':(ruleRegex.test(ruleDesc)),'identifier':'ruleDisc','message':Ember.I18n.t('webclient.maps.label.specialChar',this)}); //No I18N
            }
			var data = {};
			data.ruleName = ruleName;
			data.description=ruleDesc;
			data.timeThreshold = overUtilVal;
			data.timeCondition = overUtilCondi;
			var allMetrics = [];
			var oldPerfGroupId;
			var perfObj = this.get('selectedData');
			var ruleExists = false;
            if(this.get('slideDetails').isEdit === undefined){
                $.each(OPMClient.ReportsDetailsController.overUtilzRulesList,function(index, obj){
                    if(ruleName === obj.ruleName){
                        ruleExists = true;
                        return false;
                    }
                });
			}
			$.each(perfObj,function(index,obj){
				var rowVal = $('#utilVal_'+obj.PERFGROUPID).val();
				var rowCond = $('#utilCond_'+obj.PERFGROUPID+' option:selected').val();
				fieldsToValidate.empty.push('utilVal_'+obj.PERFGROUPID);//No I18N
				var metricObj = {'thresholdValue':rowVal,'thresholdCondition':rowCond};//No I18N
				switch (OPMClient.ReportsDetailsController.cpType) {
					case "Device"://No I18N
						metricObj.perfgroupId=obj.PERFGROUPID;
						break;
					case "Interface"://No I18N
						var index = OPMClient.ReportsDetailsController.interfaceMonitorListForCPR.map(function(e){return e.PERFGROUPID;}).indexOf(obj.PERFGROUPID);
						metricObj.monitorName=OPMClient.ReportsDetailsController.interfaceMonitorListForCPR[index].MONITORNAME;
						var unit = $('#utilUnit_'+obj.PERFGROUPID).val();
						unit = (unit===undefined || unit === '' )?$('#utilUnit_'+obj.PERFGROUPID).attr('value'):unit;
						metricObj.unit=unit;
						break;
				}
				allMetrics.push(metricObj);
				//to skip lastRow Criteria check to append //No I18N
				if(index <= OPMClient.ReportsDetailsController.availablePerfGroups.length-1 && index !== 0 && oldPerfGroupId !== undefined){
					var nOrVal = $('input:radio[name=andOrCri_'+oldPerfGroupId+']:checked').val();//No I18N
					criConditon =criConditon+nOrVal+obj.PERFGROUPID;
				}else{
					criConditon=criConditon+obj.PERFGROUPID;
				}
				oldPerfGroupId = obj.PERFGROUPID;
			});
			var criteriaVal = $('#criteriaVal').val();
			if(criteriaVal!==undefined && criteriaVal!==""){
				var criteriaObj = {'thresholdValue':criteriaVal,'thresholdCondition':$('#criteriaCond option:selected').val(),'monitorName':$('#criteriaName option:selected').val(),'unit':$('#criteriaUnit option:selected').val()};//No I18N
				allMetrics.push(criteriaObj);
			}

			data.criteriaPattern = criConditon;
			data.metrics = JSON.stringify(allMetrics);

			if(this.get('slideDetails').isEdit !== undefined){
				data.isEdit = true;
				data.ruleId = this.slideDetails.editObj.ruleId;
			}else{
				data.isEdit = false;
			}
			data.type=OPMClient.ReportsDetailsController.cpType;
			if(perfObj.length > 4){
                if(OPMClient.ReportsDetailsController.cpType==='Interface') {
                    opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.reportbuilder.maximum',{param0:'4', param1:Ember.I18n.t('webclient.admin.url.monitors',this)},this),this,true,10);//No I18N
                }else {
                    opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.reports.cpr.maxperfgroups',{param0:'4', param1:Ember.I18n.t('webclient.perf.monitor.at.perfgroups',this)},this),this,true,10);//No I18N
                }
                return false;
            }
            if(perfObj.length===0){
                if(OPMClient.ReportsDetailsController.cpType==='Interface') {
                    opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.reports.interface.cpr.nomonitor',{param0:Ember.I18n.t('webclient.widget.monitor',this)},this),this,true,10);//No I18N
                } else {
                    opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.reports.interface.cpr.nomonitor',{param0:Ember.I18n.t('opmanager.perfgroup.name',this)},this),this,true,10);//No I18N
                }
                return false;
            }
			var isValid = opm_validateFields(fieldsToValidate);
			if(isValid && !ruleExists){
				var url = window.OPM.apiUrlPattern+'/reports/addEditCpRule'; //No I18N
				var  response = opm_ajaxPostRequest(url,data);
				if(response.error === undefined){
					opm_infoMsgs('successMsg',response.message);//No I18N
					if(this.get('slideDetails').isEdit === undefined){
						var newRule = {'ruleId':response.ruleId,'ruleName':response.ruleName,'isEdit':true};//No I18N
						OPMClient.ReportsDetailsController.overUtilzRulesList.pushObject(newRule);
					}
					slideOutWithId(this.get('slideDetails').id);
					this.set('slideDetails',undefined);//NO I18N
				}else{
					opm_infoMsgs('errorMsg',response.error.message);//No I18N
				}
			}else if(ruleExists){
                opm_infoMsgs('errorMsg',Ember.I18n.t('webclient.admin.syslogrules.rulenameexists',this));//NO I18N
            }
			else{
				return;
			}

		},
	    closeRulePg: function() {
	    	slideOutWithId(this.get('slideDetails').id);
			this.set('slideDetails',undefined);//NO I18N
        },
        deSelect: function(currentIndex) {
			var index = -1;
			var totalSelList = jQuery.extend(true,[],this.get("selectedData"));//No I18N
			for(var i = 0; i < totalSelList.length; i++) {
				if(totalSelList[i].PERFGROUPNAME === currentIndex.PERFGROUPNAME) {
					index = i;
					this.$('input[type="checkbox"][value="'+ currentIndex.PERFGROUPID +'"]').prop("checked", false); //No I18N
					this.send("update", currentIndex); //No I18N
					break;
				}
			}
//Bellow change already done in update method so commented here.
//			if (index !== -1) {
//				totalSelList.removeAt(index);
//			}
//			if(totalSelList.length !== 0){
//				totalSelList.slice(-1)[0].showAndOr = false;
//			}
//			this.set('selectedData', totalSelList); //No I18N
//			this.send("updateRowNums");//NO I18N
			if(this.get('selectedData').length !== 0){
				$('.badge-group').show();
			} else {
				$('.badge-group').hide();
			}
		},
		update: function(currentIndex) {
		    var self = this;
            if(self.selectedData.length !== 0){
                for(var i = 0; i < self.selectedData.length; i++){
                    this.get('selectedData')[i].thresholdVal = $('#utilVal_'+self.selectedData[i].PERFGROUPID).val();//No I18N
                    var andOrVal = $('input:radio[name=andOrCri_'+self.selectedData[i].PERFGROUPID+']:checked').val();//No I18N
                    if(andOrVal!==undefined){
                        this.get('selectedData')[i].isAndOr = andOrVal;
                    }
                }
            }
			var newSelectedData = jQuery.extend(true,[],this.get("selectedData"));
			if(newSelectedData !== undefined && newSelectedData.length > 0){
				newSelectedData[newSelectedData.length-1].showAndOr = true;
			}
			if (this.$('input[type="checkbox"][value="' + currentIndex.PERFGROUPID + '"]').prop("checked")) { //No I18N
				var cpReportType = OPMClient.ReportsDetailsController.cpReportName;
				var defaultRuleValues =this.get("pgToRuleMap");
				if(defaultRuleValues!==undefined && defaultRuleValues.get('1')!==undefined && defaultRuleValues.get('1').get(cpReportType) === undefined){
					cpReportType = "webclient.reports.cpr.overutilized.name";//No I18N
				}
				var ruleProps = defaultRuleValues!==undefined ? defaultRuleValues.get(currentIndex.PERFGROUPID):undefined;
				var defThresholdVal = '';
				var defThresholdCondn = 1;
				if(ruleProps!== undefined){
					defThresholdVal = ruleProps.get(cpReportType).thresholdValue;
					defThresholdCondn = ruleProps.get(cpReportType).thresholdCondition;
				}
				var rowNum = this.get("selectedData").length + 1;
				var conditionId = "utilCond_"+currentIndex.PERFGROUPID;//No I18N
				var selectedData ={"PERFGROUPID": currentIndex.PERFGROUPID, //No I18N
					"PERFGROUPNAME": currentIndex.PERFGROUPNAME, //No I18N
					"selected": true, //No I18N
					"rowNum": rowNum, //No I18N
					"thresholdVal": defThresholdVal, //No I18N
					"thresholdCondn": defThresholdCondn, //No I18N
					"isAndOr": this.get("isAndOr"), //No I18N
					"utilCond": conditionId, //No I18N
					"showAndOr": false//No I18N
					};
					if(OPMClient.ReportsDetailsController.cpType==="Interface"){
						selectedData.utilUnit="utilUnit_"+currentIndex.PERFGROUPID; //No I18N
						selectedData.availableUnits=currentIndex.availableUnits;
					}
				newSelectedData.pushObject(selectedData);
			} else {
				var index = -1;
				for(var i = 0; i < newSelectedData.length; i++) {
					if(newSelectedData[i].PERFGROUPID === currentIndex.PERFGROUPID) {
						index = i;
						break;
					}
				}
				if (index !== -1) {
					newSelectedData.removeAt(index);
				}
				if(newSelectedData.length !== 0){
					newSelectedData.slice(-1)[0].showAndOr = false;
				}
			}
			this.set('selectedData', newSelectedData); //No I18N
			this.send("updateRowNums");//No I18N
			if(this.get('selectedData').length !== 0){
				$('.badge-group').show();
			} else {
				$('.badge-group').hide();
			}
		},
		updateRowNums: function(){
			var selData = this.get('selectedData'); //No I18N
			for(var i = 0; i < selData.length; i++) {
				var perfObj = selData[i];
				perfObj.rowNum = i+1;
				this.get('selectedData')[i] = perfObj;
				var crit = "#critRowNum_"+perfObj.PERFGROUPID;//No I18N
				if(crit.length!==0){
					$("#critRowNum_"+perfObj.PERFGROUPID).text(i+1);
				}
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
		if(this.get('slideDetails') !== undefined){
			slideOutWithId(this.get('slideDetails').id);
			this.set('slideDetails',undefined);//NO I18N
			OPMClient.ReportsDetailsController.availablePerfGroups = [];
		}
	}
});

/* -------------------------------------------------------------------
		Alarm Filters Related Components Starts
------------------------------------------------------------------- */
OPMClient.OpmCustomViewComponent = Ember.Component.extend({
	templateName: "components/opm-custom-view", //No I18N
	didInsertElement: function () {
		OPMClient.AlarmDetailsController.set("isCustomViewEdited",false);//No I18N
		$("body").addClass("commonSliderActive");//No I18N

		// OPMClient.AlarmFilterArrayController.set('list',list);//NO I18N
		$('#filterCriteriaSection .select2').select2();
	},
	actions: {
		saveCustomAlarmsView: function () {
			var postData = {};
			var viewName = $("#viewName").val();
			var viewNameRegex =  /[\\\/:*?"`,<>|&;#()+^.{}=!'@$\[\]]/;//No I18N
			var message = Ember.I18n.t('webclient.opm.advancedreport.specchar',{param0:'\\\/:*?"`<>|&;#,()+^.{}=!\'@$[]'},this);
			var toValidate = { 'empty': ['viewName'], 'custom':[{'condition':(viewNameRegex.test(viewName)),'identifier':'viewName','message':message}],'maxCheck':{'viewName': 100}};//No I18n
			var afFilterData = getSelectedAFFiltersData();
			postData.viewName = viewName;
			// postData.description = "Description";//No I18n

			if (opm_validateFields(toValidate)) {
				if (afFilterData !== undefined && afFilterData) {
					postData.filters = JSON.stringify(afFilterData);
				} else {
					return false;
				}

				if ($("#criteriaPatternAF").val() !== undefined) {
					saveCriteriaPatternAF();
					if ($("#criteriaPatternAF").hasClass('error')) {
						return;
					}
				}

				var apiOperation = "addCustomView";//No I18n
				var isEditCustomView = OPMClient.AlarmFilterArrayController.get("isEditCustomView");//NO I18N
				if (isEditCustomView) {
					var viewId = OPMClient.AlarmFilterArrayController.get('viewId');
					apiOperation = "updateCustomView";//No I18n
					postData.viewId = viewId;
				} else {
					var moduleName = OPMClient.AlarmFilterArrayController.get("moduleName");
					postData.moduleName = moduleName;
				}
				var responseData = opm_ajaxPostMethod(window.OPM.apiUrlPattern + '/admin/' + apiOperation, postData);//No I18N
				if (responseData.result && responseData.result.message) {
					opm_infoMsgs("successMsg", responseData.result.message);//No I18N
					listCustomViews('ALARMS');//No I18N
					this.send('cancelCustomAlarmsView');//No I18n
					var viewID = responseData.result.viewId
					Ember.run.schedule("afterRender", function () {//NO I18N
						if(isEditCustomView) {
							OPMClient.AlarmDetailsController.set("isCustomViewEdited",true);//NO I18N
						}
						redirectToAlarmList(viewID);
					});
				}
				else if (responseData !== undefined && responseData.error !== undefined) {
					opm_infoMsgs("errorMsg", responseData.error.message);//No I18N
				}
			}
		},
		cancelCustomAlarmsView: function () {
			slideOutWithId(OPMClient.AlarmFilterArrayController.get('customViewSlideDetails').id);
			OPMClient.AlarmFilterArrayController.set('customViewSlideDetails', undefined); //No I18N

			/*Temp Fix to show Yellow Msg Band*/
			$('.topNews').css("z-index",3); //No I18n
		}
	},
	willDestroyElement: function () {
		OPMClient.AlarmFilterArrayController.set('customViewSlideDetails', undefined); //No I18N
		OPMClient.AlarmFilterArrayController.set("moduleName", undefined); //No I18N
		$("body").removeClass("commonSliderActive");//No I18N
		$(".opmGroupInventory,.topNews").removeClass("zIndex1");//No I18N
		$('#' + this.elementId).find('*').remove();
	}
});

OPMClient.ApplyAfCriteriaComponent = Ember.Component.extend({
	templateName: "components/apply-af-criteria", //No I18N
	didInsertElement: function () {
		OPMClient.AlarmFilterArrayController.set('criteriaList', []);//NO I18N

		var isEditCustomView = OPMClient.AlarmFilterArrayController.get("isEditCustomView");//NO I18N
		if (isEditCustomView) {
			var editResponseData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getCustomViewConfig?viewId=' + OPMClient.AlarmDetailsController.customPath);//NO I18N
			if(editResponseData.result!==undefined && editResponseData.result.viewName!==undefined) {
				$("#viewName").val(editResponseData.result.viewName);
				OPMClient.AlarmFilterArrayController.set('viewId', editResponseData.result.viewId);//NO I18N
				var selectedFilters = editResponseData.result.selectedFilters ? JSON.parse(editResponseData.result.selectedFilters) : undefined;
				if (selectedFilters) {
					OPMClient.AlarmFilterArrayController.set('criteriaPattern', selectedFilters.filtersPattern);//No I18N
					OPMClient.AlarmFilterArrayController.set('criteriaData', selectedFilters);//No I18N
					OPMClient.AlarmFilterArrayController.set('filterData', editResponseData.result.Filters);//NO I18N
					OPMClient.AlarmFilterArrayController.set('selectedColumnsList',editResponseData.result.idVsData);//No I18N
					OPMClient.AlarmFilterArrayController.set('columnsToSelect',editResponseData.result.columnsToSelect);//No I18N
					formAFCriteriaData(OPMClient.AlarmFilterArrayController.filterData);
				}
			} else {
				if(editResponseData.result!==undefined && editResponseData.result.message!==undefined) {
					opm_infoMsgs("errorMsg", editResponseData.result.message);//No I18N
				}
			}
			this.constructCriteria();
		} else {
			var moduleName = OPMClient.AlarmFilterArrayController.get("moduleName")//NO I18N
			var responseData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/admin/getCustomViewFilters?moduleName='+moduleName);//NO I18N
			OPMClient.AlarmFilterArrayController.set('filterData', responseData.Filters);//NO I18N
			OPMClient.AlarmFilterArrayController.set('selectedColumnsList',responseData.idVsData);//No I18N
			OPMClient.AlarmFilterArrayController.set('columnsToSelect',responseData.columnsToSelect);//No I18N
			formAFCriteriaData(OPMClient.AlarmFilterArrayController.filterData);
			this.set("criteria", []); //No I18N
			this.addNewCriteriaObj();
		}
		this.set('textOperators', getTextOperators());//No I18N
		this.set('numericOperators', getNumericOperators());//No I18N
	},
	getCriteriaList: function () {
		return jQuery.extend(true, [], this.get("criteria")); //No I18N
	},
	addNewCriteriaObj: function () {
		var criteriaList = this.getCriteriaList();
		if (criteriaList.length > 0) {
			criteriaList[criteriaList.length - 1].showAddButton = false;
			criteriaList[criteriaList.length - 1].showAndOr = true;
			this.set('showCriteriaPattern', true);//No I18N
		}
		criteriaList.pushObject({
			index: criteriaList.length,
			rowNumber: criteriaList.length + 1,
			showAddButton: true,
			showDeleteButton: true,
			showAndOr: false,
			filter: 0,
			filterType: "",
			filterTypeValue: "=",
			filterList: "",
			filterTextValue: "",
			andOr: "AND"//No I18N
		});

		if (criteriaList.length > 0) {
			if (criteriaList[criteriaList.length - 1].index > 0) {
				criteriaList[criteriaList.length - 1].showDeleteButton = true;
			} else {
				criteriaList[criteriaList.length - 1].showDeleteButton = false;
			}
		}
		this.set("criteria", criteriaList); //No I18N
		OPMClient.AlarmFilterArrayController.set('criteriaList', criteriaList);//No I18N
		if (criteriaList.length > 1) {
			loadCriteriaPatternAF(OPMClient.AlarmFilterArrayController.criteriaList, "add", criteriaList.length - 1);//No I18N
		} else {
			this.set('showCriteriaPattern', false);//No I18N
			$("#criteriaPatternAF").val("");//No I18N
		}
	},
	constructCriteria: function () {
		var criteriaData = OPMClient.AlarmFilterArrayController.get('criteriaData');
		if (criteriaData && criteriaData.filters) {
			var filterCount = (criteriaData.filterCount)
			var data = criteriaData.filters;
			var pattern = OPMClient.AlarmFilterArrayController.criteriaPattern;
			var list = OPMClient.AlarmFilterArrayController.list;
			var criteriaList = this.getCriteriaList();
			if (criteriaList.length > 0) {
				criteriaList[criteriaList.length - 1].showAddButton = false;
				criteriaList[criteriaList.length - 1].showAndOr = true;
				this.set('showCriteriaPattern', true);//No I18N
			}
			$.each(data, function (key, criteria) {
				$.each(criteria, function (k, crit) {
					var filterIndex = (list).map(function (e) { return e.columnId; }).indexOf(crit.columnId);
					criteriaList[crit.filterId - 1] = ({
						index: crit.filterId - 1,
						rowNumber: crit.filterId,
						showAddButton: (crit.filterId == filterCount) ? true : false,
						showDeleteButton: true,
						showAndOr: (crit.filterId == filterCount) ? false : true,
						filter: filterIndex,
						filterType: list[filterIndex].columnType,
						filterTypeValue: crit.operator,
						filterList: list[filterIndex].filterValues,
						filterValue: list[filterIndex].filterValues != undefined ? crit.value : "",
						filterTextValue: list[filterIndex].filterValues == undefined ? crit.value : "",
						filterValuesPopulator: list[filterIndex].filterValuesPopulator,
						populateFilterValues: list[filterIndex].filterValuesPopulator === undefined ? false : true,
						andOr: "AND",//No I18N
						numericOperators: list[filterIndex].isEmptyFilter ? getNumericOperators().concat(getEmptyOperators()) : getNumericOperators(),
						textOperators: list[filterIndex].isEmptyFilter ? getTextOperators().concat(getEmptyOperators()) : getTextOperators(),
						disable: (crit.operator == "empty" || crit.operator == "notempty") ? true : false//No I18N
					});
					if (list[filterIndex].filterValuesPopulator === 'timePicker') {
						//convert seconds to readable format ..
						var criteriaObject = criteriaList[crit.filterId - 1];
						var durationFieldValues = {
							days: 0,
							hours: 0,
							minutes: 0
						};
						var totalMinutes = crit.value / (60);
						if (totalMinutes > 59) {
							var exactMinsComponent = (totalMinutes % (60))
							var totalHours = parseInt(totalMinutes / 60);
							if (totalHours > 23) {
								var exactHoursComponent = (totalHours % (24));
								var totalDays = parseInt(totalHours / (24));
								durationFieldValues.minutes = exactMinsComponent;
								durationFieldValues.hours = exactHoursComponent;
								durationFieldValues.days = totalDays;
							} else {
								durationFieldValues.minutes = exactMinsComponent;
								durationFieldValues.hours = totalHours;
							}
						} else {
							durationFieldValues.minutes = totalMinutes;
						}
						criteriaObject.timePicker = durationFieldValues;
					}

					if (criteriaList.length > 0) {
						if (criteriaList[criteriaList.length - 1].index > 0) {
							criteriaList[criteriaList.length - 1].showDeleteButton = true;
						} else {
							criteriaList[criteriaList.length - 1].showDeleteButton = false;
						}
					}
				})
			});

			this.set("criteria", criteriaList);//No I18N
			OPMClient.AlarmFilterArrayController.set('criteriaList', criteriaList);//No I18N
			if (criteriaList.length > 1) {
				this.set('showCriteriaPattern', true);//No I18N
			} else {
				this.set('showCriteriaPattern', false);//No I18N
			}
			setTimeout(function () {
				$(".matchFilterRow .select2").select2();
				$("#criteriaPatternAF").val(pattern);//No I18N
			});
			if (OPMClient.AlarmFilterArrayController.criteriaPattern) {
				this.reConstructPattern(this);
			}
		} else {
			this.set("criteria", []); //No I18N
			this.addNewCriteriaObj();
		}
	},
	reConstructPattern: function (self) {
		var cNum = OPMClient.AlarmFilterArrayController.criteriaPattern.match(/\d+/g);
		var andOr = OPMClient.AlarmFilterArrayController.criteriaPattern.match(/[a-zA-Z]+/g);
		var criteria = self.get("criteria");//No I18N
		if (andOr) {
			for (i = 0; i < andOr.length; i++) {
				$("#andOr" + criteria[i].index).text(andOr[i]);
				criteria[i].andOr = andOr[i];
			}
			self.set("criteria", criteria);//No I18N
			OPMClient.AlarmFilterArrayController.set('criteriaList', criteria);//No I18N
		}
	},
	actions: {
		childActions: function (functionName, param1, param2) {
			this.send(functionName, param1);
		},
		addCriteria: function () {
			var criteriaList = this.getCriteriaList();
			if ($("#criteria" + criteriaList[criteriaList.length - 1].index + " .filterTextValue")) {
				this.set('criteria.filterTextValue', $("#criteria" + criteriaList[criteriaList.length - 1].index + " .filterTextValue").val());//No I18n
			}
			var flag = false;
			for (i = 0; i < criteriaList.length; i++) {
				flag = validateAFCriteria(criteriaList[i]);
				if (!flag) { return; }
			}
			this.addNewCriteriaObj();
		},
		deleteCriteria: function (index) {
			var criteriaList = this.getCriteriaList();
			if (index == criteriaList.length - 1 && criteriaList.length !== 1) {
				criteriaList[index - 1].showAndOr = false;
				if ((index - 1) == 0) {
					criteriaList[index - 1].showAddButton = true;
				} else {
					criteriaList[index - 1].showDeleteButton = true;
					criteriaList[index - 1].showAddButton = true;
				}
			}
			OPMClient.AlarmFilterArrayController.set("isPatternMatched", false);//No I18N
			if (criteriaList.length > 1) {
				deleteCriteriaPatternAF(criteriaList, index + 1);
				//this.reConstructPattern();
			}
			if (criteriaList.length == 1) {
				criteriaList[index].filter = 0;
				criteriaList[index].filterType = "";
				criteriaList[index].filterTypeValue = "=";
				criteriaList[index].filterList = "";
				criteriaList[index].filterTextValue = "";
				criteriaList[index].andOr = "AND";
				criteriaList[index].filterValuesPopulator = undefined;
				criteriaList[index].populateFilterValues = false;
			} else {
				if (index !== 0 && OPMClient.AlarmFilterArrayController.isPatternMatched) {
					criteriaList[index - 1].andOr = criteriaList[index].andOr;
				}
				criteriaList.removeAt(index);
			}
			var showFilterBy = false;
			for (var i = index; i < criteriaList.length; i++) {
				criteriaList[i].index = i;
				criteriaList[i].rowNumber = i + 1;
			}
			this.set("criteria", criteriaList); //No I18N
			setTimeout(function () {
				$("#filterCriteriaSection .select2").select2();
			});
			if (criteriaList.length < 2) {
				this.set('showCriteriaPattern', false);//No I18N
				$("#criteriaPatternAF").val("");//No I18N
			}
			OPMClient.AlarmFilterArrayController.set('criteriaList', criteriaList);//No I18N
		},
		andOr: function (index) {
			var criteriaList = this.getCriteriaList();
			var andOr = criteriaList[index].andOr;
			if (andOr === "AND") {
				andOr = "OR"; //No I18N
			} else {
				andOr = "AND"; //No I18N
			}
			criteriaList[index].andOr = andOr;
			this.set("criteria", criteriaList); //No I18N
			OPMClient.AlarmFilterArrayController.set('criteriaList', criteriaList);//No I18N
			loadCriteriaPatternAF(criteriaList, "update", index + 1);//No I18N
		}
	}
});

OPMClient.AfCriteriaComponent = Ember.Component.extend({
	templateName: "components/af-criteria", //No I18N
	didInsertElement: function () {
	},
	filterType: function () {
		var filterList = OPMClient.AlarmFilterArrayController.list;
		var filter = this.get('criteria.filter');//No I18N
		var criteriaList = OPMClient.AlarmFilterArrayController.criteriaList;
		var filterValues = OPMClient.AlarmFilterArrayController.list[filter];

		if (filterList[filter].isEmptyFilter) {
			if (filterList[filter].columnType == "NUMERIC") {
				var operators = getNumericOperators();
				operators = operators.concat(getEmptyOperators());
				this.set('criteria.numericOperators', operators);//No I18N
			} else {
				var operators = getTextOperators();
				operators = operators.concat(getEmptyOperators());
				this.set('criteria.textOperators', operators);//No I18N
			}
		} else {
			if (filterList[filter].columnType == "NUMERIC") {
				this.set('criteria.numericOperators', getNumericOperators());//No I18N
			} else {
				this.set('criteria.textOperators', getTextOperators());//No I18N
			}
		}
		this.set('criteria.filterType', filterList[filter].columnType);//No I18N

		if (filterList[filter].columnType == "NUMERIC") {
			this.set('criteria.filterTypeValue', this.get('criteria.numericOperators')[0].value);//No I18N
		} else {
			this.set('criteria.filterTypeValue', this.get('criteria.textOperators')[0].value);//No I18N
		}

		var filterTypeValue = this.get('criteria.filterTypeValue');//No I18N
		if (filterTypeValue === "empty" || filterTypeValue === "notempty") {
			this.set('criteria.filterList', undefined); //No I18N
			this.set('criteria.filterTextValue', '');//No I18N
			this.set('criteria.disable', true); //No I18N
		} else {
			this.set('criteria.disable', false);//No I18N
			if (filterList[filter].filterValues) {
				this.set('criteria.filterList', filterList[filter].filterValues);//No I18N
				this.set('criteria.filterValue', filterList[filter].filterValues[0].value);//No I18N
				this.set('criteria.filterTextValue', '');//No I18N
			} else {
				this.set('criteria.filterList', undefined);//No I18N
				this.set('criteria.filterTextValue', '');//No I18N
			}
			if (filterList[filter].filterValuesPopulator !== undefined) {
				this.set('criteria.populateFilterValues', true);//No I18N
				this.set('criteria.filterValuesPopulator', filterList[filter].filterValuesPopulator);
				if (filterList[filter].filterValuesPopulator === "timePicker") {
					var timePickerDefaultValues = {
						'days': 0,//NO I18N
						'hours': 0,//NO I18N
						'minutes': 0//NO I18N
					}
					this.set('criteria.timePicker', timePickerDefaultValues);//NO I18N
					this.set('criteria.filterTextValue', '0');//NO I18N
				}
			} else {
				this.set('criteria.populateFilterValues', false);//No I18N
			}
		}
	}.observes('criteria.filter'), //No I18N
	filterTypeValue: function () {
		var filterTypeValue = this.get('criteria.filterTypeValue');//No I18N
		if (filterTypeValue === "empty" || filterTypeValue === "notempty") {
			this.set('criteria.filterList', undefined);//No I18N
			this.set('criteria.filterTextValue', '');//No I18N
			this.set('criteria.disable', true);//No I18N
		} else {
			this.set('criteria.disable', false);//No I18N
			var filterList = OPMClient.AlarmFilterArrayController.list;
			var filter = this.get('criteria.filter');//No I18N
			if (filterList[filter].filterValues) {
				this.set('criteria.filterList', filterList[filter].filterValues);
				// this.set('criteria.filterValue', filterList[filter].filterValues[0].value);//No I18N
				this.set('criteria.filterTextValue', '');//No I18N
			} else {
				this.set('criteria.filterList', undefined);//No I18N
				this.set('criteria.filterTextValue', '');//No I18N
			}
			if (filterList[filter].filterValuesPopulator !== undefined) {
				this.set('criteria.populateFilterValues', true);//No I18N
				this.set('criteria.filterValuesPopulator', filterList[filter].filterValuesPopulator);
				if (filterList[filter].filterValuesPopulator === "timePicker") {
					var timePickerDefaultValues = {
						'days': 0,//NO I18N
						'hours': 0,//NO I18N
						'minutes': 0//NO I18N
					}
					this.set('criteria.timePicker', timePickerDefaultValues);//NO I18N
					this.set('criteria.filterTextValue', '0');//NO I18N
				}
			} else {
				this.set('criteria.populateFilterValues', false);//No I18N
			}
		}

	}.observes('criteria.filterTypeValue'), //No I18N
	actions: {
		subChildActions: function (functionName, param1, param2) {
			this.sendAction('action', functionName, param1); //No I18N
		}
	}
});

OPMClient.DownloadSystemInfoComponent = Ember.Component.extend({
	templateName: "DownloadSystemInfo", //No I18n	
	elementId:"downloadSystemInfoComponent",//No I18N
	uniqueId:'',
	didInsertElement: function() {
		if(supportAnalysisInstance.get("showDownloadStatus")) {
			supportAnalysisInstance.set("showDownloadStatus", undefined);//No I18N
		}
		else if(supportAnalysisInstance.get("currentSystemInfoDownloadStatus") && supportAnalysisInstance.get("downloadOperationDone")) {
			supportAnalysisInstance.set("currentSystemInfoDownloadStatus", undefined);//No I18N
		}
		
		this.send('setProbeDetails'); // No I18n
		
		//Already download in progress check
		if(supportAnalysisInstance.get("currentSystemInfoDownloadStatus")) {
			this.send("showProbeStatus"); //No I18n
		}
	},
	actions: {
		setProbeDetails : function() {
			var probeSelectorList = [];

			var downIcon = {
				svgPath: "/apiclient/fluidicv2/img/sprite-opm.svg#arrow-down", // No I18n	
				svgFill: "#fa5b5f" // No I18n
			}

			if(window.OPM.isMSPCentral) {
				probeSelectorList = getCustomerNameList().reduce(function (acc, obj) {
					if (obj.ProbeInfo) {
						var processedProbes = obj.ProbeInfo.map(function (probe) {
							return {
								displayName: probe.ProbeDisplayName + " (" + obj.CustomerName + ")",
								value: probe.RegionID,
								status: probe.ProbeStatus,
								hoverMessage: probe.ProbeStatus ? "" : Ember.I18n.t("webclient.probe.down"), // No I18n
								imageOptions: !probe.ProbeStatus ? downIcon : null
							};
						});
						return acc.concat(processedProbes);
					}
					return acc;
				}, []);
			} else if(window.OPM.isOPMCentral || window.OPM.isNCMEE && window.OPM.isCentralServer) {
				probeSelectorList = loadProbeDetails().map(function(obj) {
					return {displayName: obj.DISPLAYNAME, value: obj.PROBEID, status: obj.STATUS , hoverMessage: obj.STATUS ? "" : Ember.I18n.t("webclient.probe.down"), imageOptions: !obj.STATUS ? downIcon : null}//No I18n
				})
			} else if(window.isserver) {
				probeSelectorList = updateCollector().map(function(obj) {
					return {displayName: obj.name, value: obj.id, status: obj.collStatus === "Up" , hoverMessage: obj.collStatus === "Up" ? "" : Ember.I18n.t("webclient.nfade.collectorDown1"),imageOptions: obj.collStatus !== "Up" ? downIcon : null}//No I18n
				})
			} else if(window.OPM.isFWAServer) {
				var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/fwaenterprise/getCollectorDetails'); //No I18n
				if(response && response.colList) {
					probeSelectorList = response.colList.map(function(obj) {
						return {displayName: obj.NAME, value: obj.CID, status: obj.STATUS , hoverMessage: obj.STATUS ? "" : Ember.I18n.t("webclient.nfade.collectorDown1"), imageOptions: !obj.STATUS ? downIcon : null}//No I18n
					})
				}
			}
			probeSelectorList.unshift({displayName: Ember.I18n.t("webclient.common.centrallink"), value: -1, status: true, hoverMessage: ""}); //No I18n
			this.set("probeSelectorList", probeSelectorList);//No I18n
		},
		downloadSystemInfo: function() {
			var selectedProbeList = [];
			var self = this;
			$('.multi_select_parentCheckBox .chkParent:checked').each(function () {
				selectedProbeList.push($(this).attr("data-customvalue"));
			});
			if(selectedProbeList.length == 0) {
				opmAlertPopUp("", Ember.I18n.t("jsp.commonstr.SelAtleastOneRecord", this),300); //NO I18N
				return;
			}
			var selectedServicesCsv = selectedProbeList.join(","); // Convert to CSV
			var probeSelectorList = this.get("probeSelectorList");//No I18n
			if(!probeSelectorList) {
				return;
			}
			var selectedProbeDetails = probeSelectorList.filter(function(probe) {
				return selectedProbeList.indexOf(probe.value.toString()) !== -1;
			}).map(function(probe) {
				return { serviceName: probe.displayName, serviceID: probe.value, statusCode: 100, status:Ember.I18n.t("opu.common.IN_PROGRESS"), percent: 0 }; // Extract displayName and value //No I18n
			});
			var url = window.OPM.apiUrlPattern + "/diagnostics/downloadSupportAnalysisData"; //No I18N
			var data = {};
			data.serviceID = selectedServicesCsv;
			data.checkDownload = true;
			var callback_func = function(response) {
				if(response && response.error) {
					showMessage(response);
					return;
				}
				else if(response.isReadyToDownload) {
					opm_ajaxDownloadFileWithMsg(url, {serviceID: selectedServicesCsv});
					self.set("selectedProbeDetails", selectedProbeDetails);//No I18n
					self.send("showProbeStatus"); //No I18n
				}
			}
			opm_ajaxPostRequestWithMsg(url, data, Ember.I18n.t("webclient.analyzer.downloadingFile"), callback_func);//No I18n

		},
		showProbeStatus: function() {
			var self = this;
			this.set("fileDownloading", true); //No I18n
			Ember.run.schedule("afterRender", function() { //No I18n
				var gridData = supportAnalysisInstance.get("currentSystemInfoDownloadStatus") //No I18n
				if(!gridData) {
					gridData = self.get("selectedProbeDetails"); //No I18n
					supportAnalysisInstance.set("currentSystemInfoDownloadStatus", gridData); //No I18n
				}
				var colNames = [Ember.I18n.t("opstor.inventory.name"), Ember.I18n.t("opstor.inventory.status"), "", "", "", ""]; //No I18n
				var colModel = [
					{ name: "serviceName", index: "serviceName"}, //No I18n
					{ 
						name: "status", //No I18n
						index: "status", //No I18n
						formatter: systemInfoServiceStatusFormatter, 
						sorttype: function(cellValue, rowData) {
							return rowData.statusCode; // Sort based on statusCode
						}
					},
					{ name: "serviceID", index: "serviceID", hidden: true}, //No I18n
					{ name: "percent", index: "percent", hidden: true}, //No I18n
					{ name: "statusCode", index: "statusCode", hidden: true}, //No I18n
					{ name: "id", index: "id", hidden: true} //No I18n
				]
				opm_loadJQgridWithData("#systemInfoDownload_table", gridData, colNames, colModel, "", "#systemInfoDownload_pager"); //No I18n
				self.send("processOverallStatus"); //No I18n
			});
		},
		processOverallStatus: function() {
			var rowData = $("#systemInfoDownload_table").jqGrid("getGridParam", "data");
			var hasInProgress = rowData.some(function(row) {
				return row.statusCode === 100;
			});
			var hasPartialDownload = rowData.some(function(row) {
				return row.statusCode === 300;
			});
			var allSuccess = rowData.every(function(row) {
				return row.statusCode === 200;
			});
			var allFailed = rowData.every(function(row) {
				return row.statusCode === 300;
			});

			if (hasInProgress) {
				this.set("fileStatus", "downloadInProgress"); //No I18n
			} else if (allFailed) {
				this.set("fileStatus", "failedDownload"); //No I18n
				$("#"+uniqueId).remove();
			} else if (hasPartialDownload) {
				this.set("fileStatus", "partialDownload"); //No I18n
				this.set("showNewDownload", true); //No I18n
				$("#"+uniqueId).remove();
			} else if (allSuccess) {
				this.set("fileStatus", "successDownload"); //No I18n
				this.set("showNewDownload", true); //No I18n
				$("#"+uniqueId).remove();
			}
		},
		showNewDownload: function() {
			this.set("fileDownloading", false); //No I18n
			this.set("showNewDownload", false); //No I18n
			this.send('setProbeDetails'); // No I18n
			supportAnalysisInstance.set("currentSystemInfoDownloadStatus", undefined); //No I18n
		},
		updateDownloadStatus: function(statusData) {
			var rowData = $("#systemInfoDownload_table").jqGrid("getGridParam", "data");
			var rowIndex = rowData.findIndex(function(row) {
				return row.serviceID == statusData.serviceID;
			});
			if (rowIndex !== -1) {
				var updatedData = Object.assign({}, rowData[rowIndex], {
					status: statusData.status,
					percent: statusData.percent,
					statusCode: statusData.statusCode
				});
				$("#systemInfoDownload_table").jqGrid("setRowData", rowData[rowIndex]._id_, updatedData);
			}
			this.send("processOverallStatus"); //No I18n
		},
		cancel: function() {
			this.get('parentView').send('closeAction');//No I18N
		}
	},
	willDestroyElement: function() {
		if (["successDownload", "partialDownload"].includes(this.get("fileStatus"))) {
			supportAnalysisInstance.set("currentSystemInfoDownloadStatus", undefined); //No I18n
		}
	}
})

OPMClient.MultiSelectorDropdownComponent = Ember.Component.extend({
	didInsertElement: function () {
		var $component = this.$(); // Cache the component's root element for better performance
		// Handle parent checkbox change
		$component.on('change', '.multi_select_parentCheckBox .chkParent', function () { // No I18n
			var isChecked = $(this).is(':checked');
			$(this)
				.closest('li') // No I18n
				.find('.multi_select_childCheckBox div:not(.disabledBlock) .chkChild')
				.prop('checked', isChecked); // No I18n
		});

		// Handle child checkbox change
		$component.on('change', '.multi_select_childCheckBox .chkChild', function () { // No I18n
			var $parentLi = $(this).closest('ul').closest('li');
			var $parentCheckbox = $parentLi.find('.multi_select_parentCheckBox .chkParent');
			var allChecked =
				$parentLi.find('.chkChild').length ===
				$parentLi.find('.chkChild:checked').length;
			$parentCheckbox.prop('checked', allChecked); // No I18n
		});

		// Handle search functionality
		$component.on('input', '.multi_select_search', function () { // No I18n
			var searchTerm = $(this).val().toLowerCase();
			$component.find('.checkBoxAccr > li').each(function () {
				var $li = $(this);
				var parentLabel = $li
					.find('.multi_select_parentCheckBox label')
					.text()
					.toLowerCase();
				var childLabels = $li
					.find('.multi_select_childCheckBox label')
					.map(function () {
						return $(this).text().toLowerCase();
					})
					.get();

				// Show or hide the list item based on the search term
				if (
					parentLabel.includes(searchTerm) ||
					childLabels.some(function(label) {return label.includes(searchTerm)})
				) {
					$li.show();
				} else {
					$li.hide();
				}
			});
		});
	},
	willDestroyElement: function () {
		// Clean up event listeners to prevent memory leaks
		this.$().off();
	}
})

OPMClient.SecurityRecommendationsSlideContentComponent = Ember.Component.extend({
	templateName: "components/security-recommendations-slide-content",//No I18n
	didInsertElement: function() {
		var secRecDetails = this.slideDetails.secRecDetails;
		$("input[name='secRecAllowType']").on("change", function() {
			var secRecAllowType = $("input[name='secRecAllowType']:checked").val();
			if(secRecAllowType === "selected") {
				$("#secrec_allowedparams").show();
			} else{
				$("#secrec_allowedparams").hide();
			}
		});
		if(secRecDetails.isEnabled) {
			$("input[name='secRecAllowType'][value='selected']").prop("checked", true).trigger("change");
		} else {
			$("input[name='secRecAllowType'][value='all']").prop("checked", true).trigger("change");
		}
	},
	willDestroyElement: function() {
		if(OPMClient.ApplicationController.isOPMEEUnifiedConsoleView) {
			window.OPM.EETempProbeIdExcludeForApi = undefined;
		}
		OPMClient.ApplicationController.set("mainTabSlideDetails", undefined); //No I18n
	},
	actions: {
		submitSecRecCategory: function() {
			var data = {};
			var secRecDetails = this.slideDetails.secRecDetails;
			var secRecAllowType = $("input[name='secRecAllowType']:checked").val();
			if(secRecAllowType === "selected") {
				var fieldsToValidate = {};
				if($("#secrec_allowedparams_text").val() !== "") {
					fieldsToValidate.validateMultipleUrlCsv = ["secrec_allowedparams_text"];//No I18n
				}
				if(!opm_validateFields(fieldsToValidate)){
					return;
				}
				var selectedValue = $("#secrec_allowedparams_text").val();
				data[secRecDetails.selectedParamValue] = selectedValue;
				data[secRecDetails.ifEnabledParamName] = true;
			} else {
				data[secRecDetails.ifEnabledParamName] = false;
			}
			data.settingName = secRecDetails.paramID;
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/v2/admin/setSecurityRecommendations", data); //No I18n
			showMessage(response);
			if(response.result) {
				window.OPM[secRecDetails.paramID] = data[secRecDetails.ifEnabledParamName];
				this.send("closeAction", true); //No I18n
				location.reload();
			}
		},
		closeAction: function(isSuccess) {
			slideOutWithId(this.get('slideDetails').id);
			if(this.slideDetails.callBackFunc) {
				this.slideDetails.callBackFunc();
			}
			if(this.get('slideDetails').parentObj){
				this.get('slideDetails').parentObj.send(this.get('slideDetails').actionName, isSuccess); //No I18n
			}
		}
	}
})
OPMClient.OpmZiaBotComponent = Ember.Component.extend({
	allMessages:[],
	firstTimeRendering:false,
	showNewConversation:false,
	//isMinimized:true,
	chatID:"",
	didInsertElement: function()
	{
		this.set("chatID",Date.now());//No I18N
		if(!this.get("firstTimeRendering"))//No I18N
		{
			this.set("allMessages",[]);//No I18N
			this.loadInitialTranscripts();
			this.set("firstTimeRendering",true);//No I18N
		}
    },
    loadInitialTranscripts:function()
    {
    	var response = opm_ajaxPostMethod(window.OPM.apiUrlPattern + "/zia/getInitialTranscripts",{chatID:this.get("chatID")});//No I18N
    	this.loadMessages(response);
    },
    getTheNextTranscript:function(actionId,msgid,formDetails)
    {
    	var self = this;
    	var callBkFn = function(response){
    		$("#"+self.elementId).find(".msgLoading").hide();//No I18N
    		self.loadMessages(response,actionId,msgid);
    	};
    	var transObj = {};
    	if(actionId!==undefined){
    		transObj.option_id = actionId;
    	}
    	if(formDetails!==undefined){
    		transObj.formDetails = formDetails;
    	}
    	$("#"+this.elementId).find(".msgLoading").show();//No I18N
    	var formData = new FormData();
    	formData.set("transcript",JSON.stringify(transObj));//No I18N
	formData.set("chatID",self.get("chatID"));//No I18N
    	opm_ajaxMultiPostAsyncRequestWithMsg(window.OPM.apiUrlPattern+"/zia/getTheNextTranscript",formData,'','',callBkFn);//No I18N
    },
    loadMessages:function(response,actionId,msgid)
    {
    	if(response!==undefined && response.transcript!==undefined && response.transcript.data!==undefined && response.transcript.data.data!==undefined && response.transcript.data.data.messages!==undefined && response.transcript.data.data.messages.length>0)
    	{
			function zia_objToArr(message_details)
			{
				var msg_details = [];
				$.each(message_details,function(k,v){
		    		msg_details.push({'key':k,'value':v}); //No I18N
		    	});
				return msg_details;
			}
			var inputFormError = false;
    		for(var i=0;i<response.transcript.data.data.messages.length;i++)
    		{
    			if(response.transcript.data.data.messages[i].message_type==="formattedText" && response.transcript.data.data.messages[i].message_details!==undefined && response.transcript.data.data.messages[i].message_details.text!==undefined)
    			{
    				response.transcript.data.data.messages[i].message_details.text = response.transcript.data.data.messages[i].message_details.text.replace(/\n/g, '<br />');//No I18N
    				response.transcript.data.data.messages[i].message_type = "text";//No I18N
    			}
    			else if(response.transcript.data.data.messages[i].message_type==="summary" && response.transcript.data.data.messages[i].message_details!==undefined)
    			{
					var message_details = zia_objToArr(response.transcript.data.data.messages[i].message_details);
			    	response.transcript.data.data.messages[i].message_details = message_details;
    			}
    			else if(response.transcript.data.data.messages[i].message_type==="DropDown" && response.transcript.data.data.messages[i].message_details!==undefined)
    			{
    				this.set('drpDownValue',undefined);//No I18N
    				response.transcript.data.data.messages[i].message_type = "Dropdown";//No I18N
					response.transcript.data.data.messages[i].message_details.fieldID = "ziaField_"+response.transcript.id;//No i18N
    			}
    			else if(response.transcript.data.data.messages[i].message_type==="link" && response.transcript.data.data.messages[i].message_details!==undefined)
    			{
    				var message_details = response.transcript.data.data.messages[i].message_details;
	   				if(message_details.module==="Reports")
    				{
    					response.transcript.data.data.messages[i].message_details.text = Ember.I18n.t("webclient.ziabot.link.exportreport",this);//No I18N
    					}
    				if(message_details.module==="Reports" && message_details.submodule!=="AdvancedReports")//No I18N
    					{
    					var urlParams = $.extend(true,{},message_details.params);
    					urlParams.viewAs = "json";//No I18N
    					var repData = opm_ajaxGetResponse(window.OPM.apiUrlPattern+message_details.url,urlParams);	
    					if(repData!==undefined && repData.length>0 && repData[0].graphDetails!==undefined && repData[0].graphDetails.length===0)
    					{
    						response.transcript.data.data.messages[i].message_details.text = Ember.I18n.t("webclient.dials.nodata",this);//No I18N
    						response.transcript.data.data.messages[i].message_type = "text";//No I18N
	
   					}
   	 				}
   	 				if(message_details.module==="Alarms" && window.OPM.isCentralServer)//No I18N
   	 				{
   	 					opm_ajaxPostRequest(window.OPM.apiUrlPattern+message_details.url,message_details.params);
   	 					response.transcript.data.data.messages[i].message_type = "text";//No I18N
   	 					response.transcript.data.data.messages[i].message_details.text = response.transcript.data.data.messages[i].text;
   	 			}
    			}
    			else if(response.transcript.data.data.messages[i].message_type==="text" && response.transcript.data.data.messages[i].message_details!==undefined)
    			{
    				var message_details = response.transcript.data.data.messages[i].message_details;
	   				if(response.transcript.data.data.messages[i].redirectPage==="Dashboard")
    				{
    					response.transcript.data.data.messages[i].message_details.text = message_details.text.split("-")[1];//No I18N
    					response.transcript.data.data.messages[i].message_type = "link";//No I18N
    				}
    			}
    			else if(response.transcript.data.data.messages[i].message_type==="inputForm" && response.transcript.data.data.messages[i].message_details!==undefined)
    			{
    				var message_details = response.transcript.data.data.messages[i].message_details;
    				if(message_details.formFields!==undefined && message_details.formFields.length>0)
    				{
    					for(var j=0;j<message_details.formFields.length;j++)
    					{
    						message_details.formFields[j].fieldID = "ziaField_"+response.transcript.id+"_"+j;//No i18N
    						if(message_details.formFields[j].fieldType==="DropDown")//No I18N
							{
								message_details.formFields[j].fieldType = "Dropdown";//No I18N
							}
    						if(message_details.formFields[j].fieldType==="MultiSelectDropdown" || message_details.formFields[j].fieldType==="Dropdown" || message_details.formFields[j].fieldType==="Radio")//No I18N
    						{
    							message_details.formFields[j].options = zia_objToArr(message_details.formFields[j].options);
    							if(message_details.formFields[j].options.length===0)
    							{
    								message_details.formFields[j].isHide = true;
    						}
    							if(message_details.formFields[j].fieldType==="Radio" && message_details.formFields[j].options.length>0)
    							{
    								message_details.formFields[j].options[0].checked = true;
    					}	
    				}
    			}
    		}
    			}
    			else if(response.transcript.data.data.messages[i].message_type==="inputForm_error" && response.transcript.data.data.messages[i].message_details!==undefined)
    			{
    				var message_details = response.transcript.data.data.messages[i].message_details;
		            if(message_details.errorFields!==undefined && message_details.errorFields.length>0)
    				{
    					for(var j=0;j<message_details.errorFields.length;j++)
    					{
    						var divId = $("#"+msgid+".bot-message").find("[name='"+message_details.errorFields[i].fieldName+"']").attr('id');//No I18N
    						$("#"+divId).addClass('validateField error'); //No I18N
				            $("#"+divId).attr('data-error',message_details.errorFields[i].errorMessage);//No I18N
				            $("#"+divId).focus();
				            opmValidate($("#"+divId)); //No I18N
				            inputFormError = true;
    						break;
    					}	
    				}    
    			}
    		}
    		if(inputFormError){
    			return;
    		}
    		var currentMessage = {msgid:response.transcript.id,messages:response.transcript.data.data.messages};
    		this.set("currentMessage",currentMessage);//No I18N
    		this.get("allMessages").pushObject(currentMessage);//No I18N
    		Ember.run.scheduleOnce('afterRender', this, function() {//No I18N	
    			var message = this.get('allMessages').findBy('msgid',msgid);//No I18N
			    if(message){
			      Ember.set(message,'disableMessage',true);//No I18N
			    }
			    for(var i=0;i<response.transcript.data.data.messages.length;i++)
	    			{
	    			if(response.transcript.data.data.messages[i].message_type==="list_Grid" && response.transcript.data.data.messages[i].message_details!==undefined)
	    			{
	    				var gridData = response.transcript.data.data.messages[i].message_details;
	    				for(var j=0;j<gridData.colModelList.length;j++)
	    				{
	    					if(gridData.colModelList[j].hidden==="true")//No I18N
	    					{
	    						gridData.colModelList[j].hidden =true;
	    					}
	    					if(gridData.colModelList[j].hidden==="true")//No I18N
	    					{
	    						gridData.colModelList[j].hidden =true;
	    					}
	    				}
	    				validateGridColumnDetails(gridData.colModelList, gridData.colList);
	    				opm_loadJQgridWithData('#zia_Grid_'+response.transcript.id,gridData.options,gridData.colList,gridData.colModelList,'','#zia_GridPager_'+response.transcript.id,'',{minRowsPerPage:10,Search:false,searchOption:true,toggleSearch:false,hideCSV:true,hideExcel:true});//No I18N
	    				$('#zia_Grid_'+response.transcript.id).jqGrid('setGridWidth', 280);//No I18N
	    			}
			    }
			    this.scrollToBottom();
    		});
    	}else{
    		if(response!==undefined && response.error!==undefined && response.error.message!==undefined){
    			opm_infoMsgs("errorMsg",response.error.message);//No I18N
    		}
    	}
    },
    scrollToBottom:function()
    {
    	Ember.run.scheduleOnce('afterRender', this, function() {//No I18N	
    		var chatBox = document.getElementById(this.elementId).querySelector('.chat-window');//No I18N
    		chatBox.scrollTop = chatBox.scrollHeight;
    	});
    },
	drpDownObserver:function(){
		var selectedValue = this.get('drpDownValue');
		if(selectedValue!==null && selectedValue!==undefined)
		{
			var currentMessage = this.get('currentMessage');
			this.send('userAction',selectedValue,currentMessage.msgid,$("#ziaField_"+currentMessage.msgid+" option:selected").text());//No I18N
		}
	}.observes('drpDownValue'),//No I18N
    actions:
    {
    	userAction:function(actionId,msgid,msgText)
    	{
    		var message = this.get('allMessages').findBy('msgid',msgid);//No I18N
		    if(message){
		      Ember.set(message,'disableMessage',true);//No I18N
		    }
    		this.get("allMessages").pushObject({"msgid":"userMessage_"+msgid,"isUserMessage":true,"disableMessage":true,"messages":[{"message_details":{"text":msgText},"message_type":"userMessage"}]});//No I18N
    		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N	
	    		this.scrollToBottom();
	    	});
	    	if(ziaBotActions.indexOf(actionId)!==-1){
	    	opmUserStats("ziaactions_"+actionId);//No I18N
	    	}
    		this.getTheNextTranscript(actionId,msgid);
    		if(!this.get("showNewConversation"))//No I18N
		    {
		    	this.set("showNewConversation",true);//No I18N
		    }
    	},
    	executeFormAction:function(message_details,msgid)
    	{
    		var formObj = {};
    		var inputFormError = false;
    		if(message_details!==undefined)
    		{
    			for(var i=0;i<message_details.formFields.length>0;i++)
    			{
    				if(message_details.formFields[i].fieldType==="TextBox")//No I18N
    				{
    					var selValue = $("#"+message_details.formFields[i].fieldID).val();//No I18N
    					if(selValue!=="")
    					{
    						formObj[message_details.formFields[i].fieldName] = selValue;
    						if((message_details.formName==="CreateDashboardForm" || message_details.formName==="CopyDashboardForm") && !opm_validateFields({'empty':[message_details.formFields[i].fieldID], 'profName':[message_details.formFields[i].fieldID]}))//No I18N
							{
								inputFormError = true;
								break;	
    				}
	    				}
	    				else
	    				{
							if(!opm_validateFields({'empty':[message_details.formFields[i].fieldID]}))//No I18N
							{
								inputFormError = true;
								break;	
							}	
	    				}
    				}
    				else if(!message_details.formFields[i].isHide && (message_details.formFields[i].fieldType==="MultiSelectDropdown" || message_details.formFields[i].fieldType==="Dropdown"))//No I18N
    				{
    					var selValue = $("#"+message_details.formFields[i].fieldID).val();//No I18N
    					if(message_details.formFields[i].fieldType==="MultiSelectDropdown")//No I18N
    					{
    						if(selValue.toString()!=="")
	    					{
	    						formObj[message_details.formFields[i].fieldName] = selValue.toString();
    						}else{
								if(message_details.formFields[i].isMandatory==="TRUE" && !opm_validateFields({'multidropdown':[message_details.formFields[i].fieldID]}))//No I18N
								{
									inputFormError = true;
									break;	
								}	
    						}
    					}
    					if(message_details.formFields[i].fieldType==="Dropdown")//No I18N
    					{
    						if(selValue!==null && selValue!=="")
	    					{
	    						formObj[message_details.formFields[i].fieldName] = selValue;
		    				}else{
		    					var checkInputError = false;
		    					if(message_details.formName==="SuppressAlarmsForm" && message_details.formFields[i].fieldName==="suppressInterval")
		    					{
		    						checkInputError = (formObj.isEnabled==="true");//No I18N
		    					}else{
		    						checkInputError = (message_details.formFields[i].isMandatory==="TRUE");//No I18N
		    					}
								if(checkInputError && !opm_validateFields({'dropdown':[message_details.formFields[i].fieldID]})){//No I18N
									inputFormError = true;
									break;	
								}	
		    				}
    					}
    			}
    				else if(message_details.formFields[i].fieldType==="Radio")//No I18N
    				{
    					formObj[message_details.formFields[i].fieldName] = $("input[name='"+message_details.formFields[i].fieldID+"']:checked").val();//No I18N
    				}
    			}
    		}
    		if(inputFormError)
    		{
				return;
		    }
    		// var message = this.get('allMessages').findBy('msgid',msgid);//No I18N
		    // if(message){
		    //   Ember.set(message,'disableMessage',true);//No I18N
		    // }
		    // var userMessage = message_details.formName;
		    // if(userMessage==="CreateDashboardForm")//No I18N
		    // {
		    // 	userMessage = "Create Dashboard";//No I18N
		    // }
		    // else if(userMessage==="CopyDashboardForm")//No I18N
		    // {
		    // 	userMessage = "Copy Dashboard";//No I18N
		    // }
		    // else if(userMessage==="SuppressAlarmsForm")//No I18N
		    // {
		    // 	userMessage = "Alarm Suppression";//No I18N
		    // }
    		//this.get("allMessages").pushObject({"msgid":"userMessage_"+msgid,"isUserMessage":true,"disableMessage":true,"messages":[{"message_details":{"text":userMessage},"message_type":"userMessage"}]});//No I18N
    		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N	
	    		this.scrollToBottom();
	    	});
	    	this.getTheNextTranscript(message_details.formName,msgid,formObj);
    		if(!this.get("showNewConversation"))//No I18N
		    {
		    	this.set("showNewConversation",true);//No I18N
		    }
    	},
    	startNewConversation:function()
    	{
    		this.set("allMessages",[]);//No I18N
			this.set("showNewConversation",false);//No I18N
			this.set("firstTimeRendering",false);//No I18N
    		this.rerender();
    	},
    	closeZiaChat:function()
    	{
    		// if(this.get("isMinimized"))//No I18N
    		// {
    		// 	this.set("isMinimized",false);//No I18N
    		// 	if(!this.get("firstTimeRendering"))//No I18N
    		// 	{
    		// 		this.set("firstTimeRendering",true);//No I18N
    		// 		this.rerender();
    		// 	}
    		// }else{
    		// 	this.set("isMinimized",true);//No I18N
    		// }
    		$('body').removeClass('ziBotActive');//No I18N
    		$('.chat-container').addClass('minimized').removeClass('active');//No I18N
    	},
    	ziaLinkRedirect:function(msgDetails)
    	{
    		if(msgDetails!==undefined)
    		{
    			if(msgDetails.method==="POST")//No I18N
    			{
    				this.send("linkPostRequest",msgDetails);//No I18N
    			}
    			else
    			{
    				this.send("linkRedirect",msgDetails);//No I18N
    			}
    		}
    	},
    	linkPostRequest:function(message_details)
    	{
    		if(message_details.submodule==="AdvancedReports"){//No I18N
    			message_details.params.wsId=sessionStorage.getItem("wsId");//No I18N
    		}
			opm_ajaxPostMethod(window.OPM.apiUrlPattern+message_details.url,message_details.params);
    	},
    	linkRedirect:function(message_details)
    	{
    		var url = window.OPM.apiUrlPattern+message_details.url;
    		$.each(message_details.params,function(key,value)
    		{
    			url += ((url.indexOf("?")===-1)?"?":"&")+key+"="+value;//No I18N
	    	});
	    	downloadURL(url);
    	},
    	redirectPage:function(redirectPage,redirectParam)
    	{
    		var redirectURL;
    		if(redirectPage==="DeviceSnapShot")//No I18N
    		{
    			redirectURL = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+redirectParam;//No I18N

    		}
    		else if(redirectPage==="Dashboard")//No I18N
    		{
    			redirectURL = window.OPM.apiclientUrl+"Home/Dashboard/Custom/"+redirectParam;//No I18N
    		}
    		else if(redirectPage==="GroupSnapShot")//No I18N
    		{
    		    redirectURL = window.OPM.apiclientUrl+"Inventory/Snapshot/"+redirectParam;//No I18N
    		}
    		else if (redirectPage === "InterfaceSnapShot")//No I18N
    		{
    		    redirectURL = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringInterface/"+redirectParam;//No I18N
    		}
    		if(redirectURL!==undefined)
    		{
    			location.href = redirectURL;
    		}
    	}
    },
	willDestroyElement: function()
	{
		$('#'+this.elementId).find('*').remove();//No I18N
	}
});

OPMClient.SecurityRecommendationsSlideContentComponent = Ember.Component.extend({
	templateName: "components/security-recommendations-slide-content",//No I18n
	didInsertElement: function() {
		var secRecDetails = this.slideDetails.secRecDetails;
		$("input[name='secRecAllowType']").on("change", function() {
			var secRecAllowType = $("input[name='secRecAllowType']:checked").val();
			if(secRecAllowType === "selected") {
				$("#secrec_allowedparams").show();
			} else{
				$("#secrec_allowedparams").hide();
			}
		});
		if(secRecDetails.isEnabled) {
			$("input[name='secRecAllowType'][value='selected']").prop("checked", true).trigger("change");
		} else {
			$("input[name='secRecAllowType'][value='all']").prop("checked", true).trigger("change");
		}
	},
	willDestroyElement: function() {
		if(OPMClient.ApplicationController.isOPMEEUnifiedConsoleView) {
			window.OPM.EETempProbeIdExcludeForApi = undefined;
		}
		OPMClient.ApplicationController.set("mainTabSlideDetails", undefined); //No I18n
	},
	actions: {
		submitSecRecCategory: function() {
			var data = {};
			var secRecDetails = this.slideDetails.secRecDetails;
			var secRecAllowType = $("input[name='secRecAllowType']:checked").val();
			if(secRecAllowType === "selected") {
				var fieldsToValidate = {};
				if($("#secrec_allowedparams_text").val() !== "") {
					fieldsToValidate.validateframeworkMultipleUrlCsv = ["secrec_allowedparams_text"];//No I18n
				}
				if(!opm_validateFields(fieldsToValidate)){
					return;
				}
				var selectedValue = $("#secrec_allowedparams_text").val();
				data[secRecDetails.selectedParamValue] = selectedValue;
				data[secRecDetails.ifEnabledParamName] = true;
			} else {
				data[secRecDetails.ifEnabledParamName] = false;
			}
			data.settingName = secRecDetails.paramID;
			var response = opm_ajaxPostRequest(window.OPM.apiUrlPattern + "/v2/admin/setSecurityRecommendations", data); //No I18n
			showMessage(response);
			if(response.result) {
				window.OPM[secRecDetails.paramID] = data[secRecDetails.ifEnabledParamName];
				this.send("closeAction", true); //No I18n
				location.reload();
			}
		},
		closeAction: function(isSuccess) {
			slideOutWithId(this.get('slideDetails').id);
			if(this.slideDetails.callBackFunc) {
				this.slideDetails.callBackFunc();
			}
			if(this.get('slideDetails').parentObj){
				this.get('slideDetails').parentObj.send(this.get('slideDetails').actionName, isSuccess); //No I18n
			}
		}
	}
})

OPMClient.ZiaInsightsComponent = Ember.Component.extend({
	templateName: "components/zia-insights-component",//No I18n
	toggleDataTypeText: Ember.I18n.t("webclient.zia.insights.show.multipleinstance"),//No I18n
	isToggleActionActive: false,
	didInsertElement: function() {
		this.send("generateInsightsForGraph"); //No I18n
	},
	actions: {
		generateInsightsForGraph: function(showInstanceSpecific) {
			var self = this;
			var ziaInsightsRequestData = this.slideDetails.ziaInsightsRequestData;
			ziaInsightsRequestData.showInstanceSpecific = showInstanceSpecific;
			this.set("showLoading", true); //No I18n
			opm_ajaxGetResponseWithMsg(eeClientReqToProbe(window.OPM.apiUrlPattern + '/zia/getZiaInsights', OPMClient.InventoryDeviceDetailsController.eeProbeID),ziaInsightsRequestData,"",function(ziaInsightsResponseData) {
				self.set("showLoading", false); //No I18n
				var ziaInsightsGroups = [];
				var colourMappings = {
					"POSITIVE_NUMBER": "color: #A02428",//No I18n
					"NEGATIVE_NUMBER": "color: #25732D"//No I18n
				}
				var classMappings ={
					"NUMBER": "bold",//No I18n
					"POSITIVE_NUMBER": "bold",//No I18n
					"NEGATIVE_NUMBER": "bold",//No I18n
					"KEY_TEXT_VALUE": "bold"//No I18n
				}
				
				if(ziaInsightsResponseData.showInstanceSpecificInsights) {
					self.set("showToggleActionButton", true); //No I18n
					self.set("customInfoMsg", Ember.I18n.t("webclient.zia.insights.multiinstance.avgdesc")); // No I18N
				} else {
					self.set("showToggleActionButton", false); //No I18n
				}
				if(showInstanceSpecific) {
					self.set("customInfoMsg", undefined); // No I18N
				}
				if(ziaInsightsResponseData.Insights && ziaInsightsResponseData.Insights.Insights) {
					ziaInsightsGroups = ziaInsightsResponseData.Insights.Insights.map(function(insightGroup) {
						return Object.assign(insightGroup, {InsightValues: insightGroup.InsightValues.map(function(insight) {
							return Object.assign(insight, {insightval: insight.insightval.map(function(word) {
								var altTokenObj = word["alt-token"] ? JSON.parse(word["alt-token"]) : undefined; //No I18n
								return Object.assign(word, {customized: colourMappings[word["token-type"]] || classMappings[word["token-type"]], "token-class": classMappings[word["token-type"]], "token-style": colourMappings[word["token-type"]], //No I18n
								"toolTipContent": altTokenObj && altTokenObj.ALT_TOKEN_VALUES && altTokenObj.ALT_TOKEN_TYPE !== undefined && altTokenObj.ALT_TOKEN_TYPE === 'DATA_ALT_TOKEN' ? altTokenObj.ALT_TOKEN_VALUES.map(function(altTokenVal) { // No I18N
									return altTokenVal;
								}): []
								});
							})})
						})});
					});
					self.set("ziaInsightsGroups", ziaInsightsGroups);//No I18n
				} else {
					if(ziaInsightsResponseData.error && ziaInsightsResponseData.error.message){
						self.set("errorMsg", ziaInsightsResponseData.error.message);//No I18n
						self.set("ziaInsightsGroups", undefined);//No I18n
					}
				}
			});
		},
		toggleDataTypeAction: function() {
			var currentToggleActive = !this.get("isToggleActionActive"); //No I18n
			if(currentToggleActive) {
				this.set("toggleDataTypeText", Ember.I18n.t("webclient.zia.insights.hide.singleinstance"));//No I18n
			} else {
				this.set("toggleDataTypeText", Ember.I18n.t("webclient.zia.insights.show.multipleinstance"));//No I18n
			}
			this.set("isToggleActionActive", currentToggleActive);//No I18n
			this.send("generateInsightsForGraph", currentToggleActive); //No I18n
		}
	}
})

OPMClient.CommonTooltipComponent = Ember.Component.extend({
	templateName: "components/common-tooltip",//No I18n
	tagName:'span', //No I18N
	didInsertElement: function() {
		var parentSelector= this.get("parentSelector"); //No I18n
		if(parentSelector) {
			$(".common-tooltip").on('mouseenter', function(e) {
				var parent = document.querySelector(parentSelector);
				addClassBasedOnPosition($(this).children(".common-tooltip__info")[0], parent);
			});
		}

		var addClassBasedOnPosition = function(child, parent) {
			var parentRect = parent.getBoundingClientRect();
			var childRect = child.getBoundingClientRect();
	  
			var childCenterX = childRect.left + childRect.width / 2;
			var childCenterY = childRect.top + childRect.height / 2;
	  
			var parentCenterX = parentRect.left + parentRect.width / 2;
			var parentCenterY = parentRect.top + parentRect.height / 2;
	  
			child.classList.remove('top', 'bottom', 'left', 'right'); // No I18N
	  
			if (childCenterX < parentCenterX) {
			  child.classList.add('left'); // No I18N
			} else if (childCenterX > parentCenterX ) {
			  child.classList.add('right'); // No I18N
			}
			if(childCenterY >= parentCenterY) {
				child.classList.add("top"); // No I18N
			}
		}
	  
		  
	}
})

OPMClient.OpmAiSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ai-summary-component",//No I18n
	aiSummaryData: undefined,
	didInsertElement: function() {
		var self = this;

		var aiSummaryParams = this.get('slideDetails').aiSummaryParams;
		if(!aiSummaryParams) {
			return
		}
		self.set("showLoading", true); //No I18n
		var url = window.OPM.apiUrlPattern + aiSummaryParams.url;
		if(OPMClient.InventoryDeviceDetailsController.eeProbeID && window.OPM.isProbe) {
			url = eeClientReqToProbe(window.OPM.apiUrlPattern + aiSummaryParams.url, OPMClient.InventoryDeviceDetailsController.eeProbeID);
		}
        var processResponse = function (response) {
            self.set("showLoading", false); //No I18n

            if (response && response.error && response.error.message) {
                opm_infoMsgs("errorMsg", response.error.message); //No I18n
                return;
            }

            if (response) {
                if (OPMClient.ApplicationController.genAI.vendors.length > 1) {
                    self.set("vendor", response.vendor); // No I18N
                }
                if (response && response.stopReason && response.stopReason.length > 0) {
                    self.set("stopReason", response.stopReason); // No I18N
                }
                var res = '';
                var type = '';
                if (response && response.groupSummary && response.groupSummary.message) {
                    res = response.groupSummary.message;
                    type = "group";  // No I18N
                } else if (response && response.summary && response.summary.message) {
                    res = response.summary.message;
                    type = "alarm"; // No I18N
                } else if (response && response.summary && !response.summary.message) {
                    res = response.summary;
                    type = "alarm-detail"; // No I18N
                } else if (response && response.alertSummary && response.alertSummary.message) {
                    res = response.alertSummary.message;
                    type = "alert"; // No I18N
                } else if (response && response.deviceSummary && response.deviceSummary.message) {
                    res = response.deviceSummary.message;
                    type = "device"; // No I18N
                } else if (response && response.summaryData && response.summaryData.message) {
                    res = response.summaryData.message;
                    type = "nfa-fwa"; // No I18N
                } else if (response && response.prompt && response.data && !response.data.message) {
                    res = response.data;
                    type = response.prompt;
                } else {
                    res = Ember.I18n.t("webclient.reports.view.nodata");//No I18n
                }

                if (type == "alarm-detail") { // No I18N
                    var resHTML = "";

                    if (res.alarmSummary) {
                        resHTML += opm_markdownToHtml(res.alarmSummary);
                    }

                    if (res.rootCause) {
                        resHTML += '<h4>' + Ember.I18n.t("webclient.genai.rootCause") + '</h4><div id="root-cause-alarm">\n' + opm_markdownToHtml(res.rootCause) + '</div>'; // No I18N
                        resHTML += '<div class="opmBtn pull-none m-none rounded h-33 noMinWd" onclick="addAlarmNotesFromGenAI(\'root-cause-alarm\', this)">' + Ember.I18n.t("webclient.genai.addAlarmNotes") + '</div>'; // No I18N
                    }

                    if (res.remediationSteps) {
                        resHTML += '<div class="mb-lg mt-lg"><h4> ' + Ember.I18n.t("webclient.genai.technicalRemediation") + '</h4><div id="technical-remediation">' + opm_markdownToHtml(res.remediationSteps) + '</div>'; // No I18N
                        resHTML += '<div class="opmBtn pull-none m-none rounded h-33 noMinWd" onclick="addAlarmNotesFromGenAI(\'technical-remediation\', this)">' + Ember.I18n.t("webclient.genai.addAlarmNotes") + '</div>'; // No I18N
                    }

                    if (res.workflows) {
                        resHTML += '<div class="infoBoxBlue multiline mt-lg mb-sm pull-none"><h4>' + Ember.I18n.t("webclient.genai.workflowsAutomation") + '</h4>' + opm_markdownToHtml(res.workflows) + '</div>'; // No I18N
                    }

                    res = resHTML;

                    self.set("aiSummary", res);  //No I18n
                    return;
                }

                if (type == "PROBLEM_RCA_SUMMARY") { // No I18N
                    var resHTML = "";
                    if (res.problemSummary) {
                        resHTML += '<h4>' + Ember.I18n.t("webclient.storage.summary") + '</h4><div id="problem-summary-alarm">\n' + opm_markdownToHtml(res.problemSummary) + '</div>'; // No I18N
                    }
                    if (res.rootCause) {
                        resHTML += '<h4>' + Ember.I18n.t("webclient.genai.rootCause") + '</h4><div id="root-cause-alarm">\n' + opm_markdownToHtml(res.rootCause) + '</div>'; // No I18N
                    }
                    if (res.propagation) {
                        resHTML += '<h4>' + Ember.I18n.t("webclient.genai.propagation") + '</h4><div id="propagation-alarm">\n' + opm_markdownToHtml(res.propagation) + '</div>'; // No I18N
                    }
                    if (res.recommendedActions) {
                        resHTML += '<div class="mb-lg mt-lg"><h4> ' + Ember.I18n.t("webclient.genai.recommendedActions") + '</h4><div id="recommended-actions">' + opm_markdownToHtml(res.recommendedActions) + '</div>'; // No I18N
                    }
                    res = resHTML;
                    self.set("aiSummary", res);  //No I18n
                    return;
                }

                if (type == "alert") { // No I18N
                    if (response.totalAlarmsAnalyzed) {
                        self.set("aiSummary", '<div class="infoBoxBlue multiline mb-sm"><span class="bold">' + Ember.I18n.t("webclient.fault.addnotes.notes") + ' : </span>' + Ember.I18n.t("webclient.genai.alarmsSummaryNotes", {totalAlarmsAnalyzed: response.totalAlarmsAnalyzed}) + '</div>\n' + opm_markdownToHtml(res)); //No I18n
                        return;
                    }
                }

                self.set("aiSummary", opm_markdownToHtml(res)); //No I18n
            }
        }
        
        if (aiSummaryParams.url == "/zia/aiPromptExecutor") {
            opm_ajaxPostRequestWithMsg(url,aiSummaryParams.data,"",processResponse)
        } else {
            opm_ajaxGetResponseWithMsg(url,aiSummaryParams.data,"",processResponse)
        }
	},
	willDestroyElement: function() {
		this.get('parentView').set("controller.alarmAiSummary", undefined);  //No I18N 
		this.get('parentView').set("controller.devSnapCommSlideDetails", undefined);  //No I18N 
	}
})

OPMClient.RuleEngineMonitorThresholdComponent = Ember.Component.extend({
	templateName: "components/rule-engine-monitor-threshold-component",//No I18n
	didInsertElement: function() {
		OPMClient.SettingsDeviceTemplateController.set("isCheckNumeric", true); // NO I18N
		var self = this;
		var monitorDetails = this.get('slideDetails.monitorDetails') || [];
		self._setActiveMonitor();
		var thresholdConfig = self.get('activeMonitor').thresholdValues || {};
		var oldAction = JSON.parse(OPMClient.SettingsAddEditController.oldActions || "{}"); // No I18N 
		self.set('oldAction', oldAction.actions); // No I18N
		
		// Populate threshold fields - only DOM manipulation here
		Ember.run.scheduleOnce('afterRender', function() { //No I18N
			self._setThresholdFieldValues(thresholdConfig, self.get('activeMonitor'));
		});
	},
	_setActiveMonitor:function(name) {
		var self = this;
		var activeMonitor = {};
		var monitorDetails = this.get('slideDetails.monitorDetails') || [];
		var perfGroupList = [];
		var monitorsList = [];
		monitorDetails = monitorDetails.map(function(monitor, index) { 
			monitor.active = false;
			if(name && monitor.entityName == name) { 
				activeMonitor = monitor;
				monitor.active = true;
			}

			if(monitor.filterEntityType === "PERFGROUP") { // No I18N
				perfGroupList.push(monitor);
			} else if(monitor.filterEntityType === "MONITOR") { // No I18N
				monitorsList.push(monitor);
			}
			return monitor;
		});

		if(!name) {
			if(perfGroupList.length) {
				activeMonitor = perfGroupList[0];
				perfGroupList[0].active = true;
			} else if(monitorsList.length) {
				activeMonitor = monitorsList[0];
				monitorsList[0].active = true;
			}
		}

		self.set('slideDetails.monitorDetails', monitorDetails); // No I18N
		self.set('activeMonitor', activeMonitor); // No I18N

		self.set('listGroup', { // No I18N
			"perfGroupList": perfGroupList, // No I18N
			"monitorsList": monitorsList // No I18N
		})
	},
	_setThresholdFieldValues: function(thresholdConfig, monitorObj) {
		var self = this;

		var DEFAULT_ERROR_MSG = Ember.I18n.t('webclient.alarmmessage.atthreshold.utilalarmmsg'); //No I18N
		var DEFAULT_REARM_MSG = Ember.I18n.t('webclient.dt.alarmmessage.clear'); //No I18N
		var UPPER_LIMIT_MSG = Ember.I18n.t('webclient.opm.at.maxlimit.msg'); // NO I18N

		var isATEnabled = thresholdConfig.isAdaptiveThresholdsEnabled === "true" || thresholdConfig.isAdaptiveThresholdsEnabled === true;

		if(isATEnabled) {
			DEFAULT_ERROR_MSG = Ember.I18n.t('webclient.alarmmessage.atthreshold.utilalarmmsg.at'); //No I18N
		}

		// Set Adaptive Threshold checkbox and deviation type
		$('#enableAT').prop('checked', isATEnabled).trigger("change"); //No I18N

		// Note: Field IDs don't have thresholdSlider_ prefix as they come from opm-adaptivethreshold component
		$("#interval").val(monitorObj.interval || ''); //No I18N
		$('input[name="storeDataType"][value="' + (monitorObj.numericType || "1") + '"]').prop('checked', true); //No I18N

		$('#snmpWarnType').val(thresholdConfig.warningThresholdType || 'max'); //No I18N
		$('#snmpWarnValue').val(thresholdConfig.warningThresholdValue || ''); //No I18N
		$('#snmpWarnMsg').val(thresholdConfig.warningMessage || DEFAULT_ERROR_MSG); //No I18N
		$('#snmpTroubleType').val(thresholdConfig.troubleThresholdType || 'max'); //No I18N
		$('#snmpTroubleValue').val(thresholdConfig.troubleThresholdValue || ''); //No I18N
		$('#snmpTroubleMsg').val(thresholdConfig.troubleMessage || DEFAULT_ERROR_MSG); //No I18N
		$('#snmpErrorType').val(thresholdConfig.criticalThresholdType || 'max'); //No I18N
		$('#snmpErrorValue').val(thresholdConfig.criticalThresholdValue || ''); //No I18N
		$('#snmpErrorMsg').val(thresholdConfig.criticalMessage || DEFAULT_ERROR_MSG); //No I18N
		$('#snmpRearmType').val(thresholdConfig.clearThresholdType || 'minEqual'); //No I18N
		$('#snmpRearmValue').val(thresholdConfig.rearmValue || ''); //No I18N
		$('#snmpRearmMsg').val(thresholdConfig.clrMessage || DEFAULT_REARM_MSG); //No I18N
		$('#snmpConTime').val(monitorObj.failureThreshold || '1'); //No I18N

		if(thresholdConfig.warningThresholdType) {
			$('#snmpWarnType').select2().trigger('change')
		} else if(thresholdConfig.troubleThresholdType) {
			$('#snmpTroubleType').select2().trigger('change')
		} else if(thresholdConfig.criticalThresholdType) {
			$('#snmpErrorType').select2().trigger('change')
		} else {
			$('#snmpWarnType, #snmpTroubleType, #snmpErrorType').select2().trigger('change')
		}


		
		$('input[name="perfGrpDataType"][value="' + (thresholdConfig.deviationType || '2') + '"]').prop('checked', true); //No I18N
		$('#lowerLimitType').val(thresholdConfig.lowerlimitThresholdType || 'min').trigger('change'); //No I18N
		$('#lowerLimitValue').val(thresholdConfig.lowerlimitThresholdValue || ''); //No I18N
		$('#upperLimitType').val(thresholdConfig.upperlimitThresholdType || 'max').trigger('change'); //No I18N
		$('#upperLimitValue').val(thresholdConfig.upperlimitThresholdValue || ''); //No I18N
		$('#upperLimitMsg').val(thresholdConfig.upperlimitMessage || UPPER_LIMIT_MSG); //No I18N

		// Initialize select2 for threshold type fields
		document.querySelector("#" + self.get('slideDetails.id')).querySelectorAll(".select2").forEach(function(selectElem) {
			$(selectElem).select2(); 
		});

		observeThresholdChanges("settings"); // No I18N
	},
	/**
	 * Validates and persists the current active monitor's threshold data.
	 * Returns true if successful, false if validation failed.
	 */
	_saveActiveMonitorThreshold: function() {
		var self = this;
		var monitorDetails = this.get('slideDetails.monitorDetails') || [];
		var currentActiveMonitor = this.get('activeMonitor')
		if(currentActiveMonitor) {
			
			var interval = "";
			if(currentActiveMonitor.protocol === "DATA_INGESTION") { // No I18N
				interval = "5"; // No I18N
			} else {
				interval = $("#interval").val() ? parseInt($("#interval").val()) : ""; //No I18N
				if(interval != "") {
					var intervalValidate = {'nonnegativeorempty':['interval'],'positive':['interval'],'rangeCheck':{'interval':1440},'minRangeCheck':{'interval':1}}; //No I18N
					if(!opm_validateFields(intervalValidate)) {
						return false;
					}
				}
			}

			var numericType = $("#rule-engine-monitor-threshold-container [name='storeDataType']:checked").val(); //No I18N
			if(currentActiveMonitor.interval != interval || currentActiveMonitor.numericType != numericType) {
				currentActiveMonitor.interval = interval;
				currentActiveMonitor.numericType = numericType;
				currentActiveMonitor.modified = true;
			}

			var currentThresholdData = validateRuleEngineThresholdFields("", numericType);
			if(!currentThresholdData) {
				return false;
			}

			if(currentThresholdData.criticalThresholdValue != "" || currentThresholdData.troubleThresholdValue != "" || currentThresholdData.warningThresholdValue != "" || currentThresholdData.rearmValue != "") { //No I18N
				currentActiveMonitor.thresholdValues = currentThresholdData;
				currentActiveMonitor.failureThreshold = currentThresholdData.failureThreshold;
				delete currentThresholdData.failureThreshold;
				currentActiveMonitor.checkNumeric = "true"; //No I18N
				// currentActiveMonitor.numericType = ; //No I18N
				
				// Compare with old values and Check Is updated Value
				var oldAction = self.get('oldAction'); // No I18N
				var oldmonitors = oldAction && oldAction.ASSOCIATEPERFMONITOR && oldAction.ASSOCIATEPERFMONITOR[0] && oldAction.ASSOCIATEPERFMONITOR[0].monitors ? oldAction.ASSOCIATEPERFMONITOR[0].monitors : []
				var oldThreshold = {};
				oldmonitors.find(function(m) {
					if(m.entityName == currentActiveMonitor.entityName && m.filterEntityType == currentActiveMonitor.filterEntityType) {
						oldThreshold = m.thresholdValues;
						return true;
					}
				})

				if(!oldThreshold) {
					currentActiveMonitor.modified = true;
				} else {
					Object.keys(currentActiveMonitor.thresholdValues).forEach(function(key) {
						var isUpdated = currentActiveMonitor.thresholdValues[key] == (oldThreshold[key] ? oldThreshold[key] : ""); //No I18N
						if(isUpdated) {
							currentActiveMonitor.modified = true;
						}
					})
				}	

			} else {
				delete currentActiveMonitor.thresholdValues;
			}
		}
		return true;
	},
	actions: {
		saveThreshold: function() {
			var self = this;
			var monitorDetails = self.get('slideDetails.monitorDetails') || [];

			if(!self._saveActiveMonitorThreshold()) {
				return;
			}

			// Close the threshold editor
			OPMClient.SettingsAddEditController.set('monitorThresholdSlideDetails', null); // No I18N
		},
		closeEditThreshold: function() {
			if(this.get('slideDetails.callBackFunc')) {
				this.get('slideDetails.callBackFunc')();
			}
		},

		addSelectedMonitors: function() {
			var self = this;
			var monitorDetails = self.get('slideDetails.monitorDetails') || [];
			var ruleEngineMonitors = OPMClient.SettingsAddEditController.get('ruleEngineMonitors') || [];
			var existingPolicyNames = monitorDetails.map(function(m) { return m.policyName; });
			var addedMonitors = [];

			// Collect selected monitors from the multiselect component
			ruleEngineMonitors.forEach(function(category) {
				if(category.monitorList) {
					category.monitorList.forEach(function(monitor) {
						if(monitor.selected && existingPolicyNames.indexOf(monitor.policyName) === -1) {
							addedMonitors.push({
								policyName: monitor.policyName,
								displayName: monitor.displayName,
								Protocol: monitor.Protocol || monitor.protocol || '',
								type: monitor.type || '',
								active: false,
								thresholdValues: {}
							});
						}
					});
				}
			});

			if(addedMonitors.length === 0) {
				opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.admin.select.monitor')); //No I18N
				return;
			}

			// If no active monitor exists, set first added as active
			var hasActive = monitorDetails.some(function(m) { return m.active; });
			if(!hasActive && addedMonitors.length > 0) {
				addedMonitors[0].active = true;
			}

			var updatedMonitors = monitorDetails.concat(addedMonitors);
			self.set('slideDetails.monitorDetails', updatedMonitors); // No I18N

			// Update pageObj.actions
			var actions = OPMClient.SettingsAddEditController.pageObj.actions;
			if(actions && actions.ASSOCIATEPERFMONITOR && actions.ASSOCIATEPERFMONITOR[0]) { 
				actions.ASSOCIATEPERFMONITOR[0].monitors = updatedMonitors; 
			}

			// Deselect monitors in the multiselect dropdown
			ruleEngineMonitors.forEach(function(category) {
				if(category.monitorList) {
					category.monitorList.forEach(function(monitor) {
						Ember.set(monitor, 'selected', false); //No I18N
					});
				}
			});
		},

		deleteMonitor: function(policyName) {
			var self = this;
			var monitorDetails = self.get('slideDetails.monitorDetails') || [];

			if(monitorDetails.length <= 1) {
				opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.admin.atleast.one.monitor')); //No I18N
				return;
			}

			var deletedMonitor = monitorDetails.find(function(m) { return m.policyName === policyName; });
			var wasActive = deletedMonitor && deletedMonitor.active;

			// Remove the monitor from the list
			var updatedMonitors = monitorDetails.filter(function(m) { return m.policyName !== policyName; });

			// If the deleted monitor was active, set the first remaining one as active
			if(wasActive && updatedMonitors.length > 0) {
				updatedMonitors[0].active = true;
			}

			// Update slideDetails
			self.set('slideDetails.monitorDetails', updatedMonitors); // No I18N

			// Update pageObj.actions
			var actions = OPMClient.SettingsAddEditController.pageObj.actions;
			if(actions && actions.ASSOCIATEPERFMONITOR && actions.ASSOCIATEPERFMONITOR[0]) { 
				actions.ASSOCIATEPERFMONITOR[0].monitors = updatedMonitors; 
			}

			// If deleted monitor was active, load the new active monitor's threshold
			if(wasActive && updatedMonitors.length > 0) {
				Ember.run.scheduleOnce('afterRender', self, function() { //No I18N
					var activeMonitor = updatedMonitors[0];
					var thresholdConfig = activeMonitor.thresholdValues || {};

					self._setThresholdFieldValues(thresholdConfig, activeMonitor);
				});
			}
		},

		onMonitorChange: function(name) {
			var self = this;
			var monitorDetails = self.get('slideDetails.monitorDetails') || [];

			// Save current active monitor's threshold data before switching
			if(!self._saveActiveMonitorThreshold()) {
				return;
			}

			self._setActiveMonitor(name)

			Ember.run.scheduleOnce('afterRender', self, function() { //No I18N
				var thresholdConfig = self.get('activeMonitor').thresholdValues || {};
				self._setThresholdFieldValues(thresholdConfig, self.get('activeMonitor'));
			});
		}
	},
	keyPress: function(e) {
		if ($("*:focus").hasClass('numberCheck')) { //No I18N
			return opm_isNumber(e);
		}
		if ($("*:focus").hasClass('floatCheck')) { //No I18N
			return opm_validateFloat(e);
		}
	},
	willDestroyElement: function() {
		// Cleanup select2
		try {
			$('#thresholdSlider_snmpWarnType, #thresholdSlider_snmpTroubleType, #thresholdSlider_snmpErrorType, #thresholdSlider_snmpRearmType').select2('destroy'); //No I18N
			OPMClient.SettingsDeviceTemplateController.set("isCheckNumeric", false); // NO I18N
			OPMClient.SettingsAddEditController.pageObj.actions.ASSOCIATEPERFMONITOR[0].monitors = OPMClient.SettingsAddEditController.pageObj.actions.ASSOCIATEPERFMONITOR[0].monitors.map(function(m) { 
				delete m.active
				return m; 
			}); 
		} catch(e) {
			// Ignore errors during cleanup
		}
	}
});


OPMClient.OpenAIUsageStatsComponent = Ember.Component.extend({
	templateName: "components/open-ai-usage-stats-component",//No I18n
	didInsertElement: function() {
        var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/zia/getGENAIUsageStats");//No I18N
        var colNames =[
			Ember.I18n.t("webclient.admin.users.username"), // No I18N
			// Ember.I18n.t("webclient.genai.model"), // No I18N
			Ember.I18n.t("webclient.genai.operation"), // No I18N
			Ember.I18n.t("webclient.genai.aiVendor"), // No I18N
			// Ember.I18n.t("webclient.genai.promptTokens"), // No I18N
			// Ember.I18n.t("webclient.genai.completionTokens"), // No I18N
			Ember.I18n.t("webclient.genai.totalTokens"), // No I18N
			Ember.I18n.t("webclient.reports.time"), // No I18N 
			""]; //No I18N
        var colModels = [
            { name: 'USERNAME',index: 'USERNAME'}, //No I18N
            // { name: 'AI_MODEL',index: 'AI_MODEL'}, //No I18N
            { name: 'OPERATION',index: 'OPERATION'}, //No I18N
            { name: 'AI_VENDOR',index: 'AI_VENDOR'}, //No I18N
            // { name: 'PROMPTTOKENS',index: 'PROMPTTOKENS'}, //No I18N
            // { name: 'COMPLETIONTOKENS',index: 'COMPLETIONTOKENS'}, //No I18N
            { name: 'TOTALTOKENS',index: 'TOTALTOKENS'}, //No I18N
            { name: 'GENERATEDTIME',index: 'GENERATEDTIME', classes:'nowrap', width:200}, //No I18N
            { name: 'id', index: 'id',sortable:false,hidden:true}//No I18N
        ];
        var defaultOptions = {minRowsPerPage:10};
        $('#open-ai-summary').jqGrid('GridUnload');//No I18n
        opm_loadJQgridWithData('#open-ai-summary', jsonData, colNames, colModels,'','open-ai-summary-pager','',defaultOptions); //No I18N
	}, 
	willDestroyElement: function() {
		OPMClient.SettingsTabController.set("slideDetails", null); // No I18N
	}
});

OPMClient.OpmGenerateAiPromptComponent = Ember.Component.extend({
	templateName: "components/opm-generate-ai-prompt-component", //No I18n
	userQuery: "", //No I18n
	showLoading: false,
	isPerfMonitor: false,
	didInsertElement: function() {
		if(this.get('slideDetails') && this.get('slideDetails').mode === 'perfMonitor') { //No I18N
			this.set('isPerfMonitor', true); //No I18N
            $('#genAIPromptContainer').removeClass('pl-lg pr-lg h-100p absolute top-0');
		}
	},

	actions: {
		submitPrompt: function() {
			var self = this;

			if (!opm_validateFields({ 'empty': ['gen-ai-script-generation-prompt'] })) { //No I18n
				return;
			}
			var userQuery = this.get("userQuery"); //No I18n
			this.set("showLoading", true); //No I18n
			var requestData = { userQuery: userQuery };
			var apiEndpoint = self.get('apiEndpoint') || (self.get('slideDetails') && self.get('slideDetails').apiEndpoint) || '/zia/generateScriptTemplate'; //No I18N
			if(self.get('slideDetails') && self.get('slideDetails').moID) {
				requestData.moID = self.get('slideDetails').moID; //No I18N
			} else if(window.OPM.currentView.name.indexOf("Inventory.Device.Monitors") !== -1)
			{
				requestData.moID = OPMClient.InventoryDeviceDetailsController.moID;
			}
			opm_ajaxPostRequestWithMsg(window.OPM.apiUrlPattern + apiEndpoint, requestData, "", function(response) {//No I18n
				self.set("showLoading", false); //No I18n
				if (response && response.oid && response.oid !== "null") {
					self.set("generatedOutput", {//No I18n
						oid: response.oid,
						mib: response.mib,
						description: response.description
					});
					if(response.vendor) {
						self.set("vendor", response.vendor); // No I18N
					}
				} else if (self.get('isPerfMonitor') && response && !response.error && (!response.oid || response.oid === "null")) { //No I18n
					self.set("generatedOutput", {//No I18n
						nullOid: true,
						description: response.description
					});
					if(response.vendor) {
						self.set("vendor", response.vendor); // No I18N
					}
                    opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.script.empty.response')); //No I18n
				} else if (response && response.CommandLine && response.ScriptBody) {
					self.set("generatedOutput", {//No I18n
						CommandLine: response.CommandLine,
						ScriptBody: response.ScriptBody
					});
					if(OPMClient.ApplicationController.genAI.vendors.length > 1) {
						self.set("vendor",response.vendor); // No I18N
					}
				} else if (response.error && response.error.message) {
					self.set("generatedOutput", undefined); // No I18N
					opm_infoMsgs("errorMsg", response.error.message); //No I18n
				} else if(response.CommandLine == "" || response.ScriptBody == "") {
					self.set("generatedOutput", undefined); // No I18N
					opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.script.empty.response')); //No I18n
				}

				
			});
		},
		useTemplate: function() {
			if(this.get('slideDetails') && this.get('slideDetails').parentObj) {
				this.get('slideDetails').parentObj.send("copyFromPrompt", this.get("generatedOutput")); //No I18N
				return;
			}
			this.get('parentView').send("copyFromPrompt", this.get("generatedOutput"));  //No I18N 
			this.get('parentView').set("controller.isGeneratingAi", false); //No I18n
			if(OPMClient.SettingsAddEditController.pageAction == "Edit") { //No I18n
				OPMClient.SettingsAddEditController.set('slidePageHeader',Ember.I18n.t('webclient.action.edit',this)+ " - "+ $($.parseHTML(OPMClient.SettingsAddEditController.pageObj.graphName)).text()); //No I18N
			} else if(OPMClient.SettingsAddEditController.pageAction == "Add") { //No I18n
				OPMClient.SettingsAddEditController.set("slidePageHeader", Ember.I18n.t('webclient.Addscripttemplate')) //No I18n
			} else if(OPMClient.SettingsAddEditController.pageAction == "CopyAs") { //No I18n
				OPMClient.SettingsAddEditController.set('slidePageHeader',Ember.I18n.t('webclient.script.form.titlecopy')); //No I18N
			}
		},
		cancel: function() {
			if(this.get('slideDetails') && this.get('slideDetails').parentObj) {
				this.get('slideDetails').parentObj.send(this.get('slideDetails').actionName); //No I18N
				return;
			}
			this.get('parentView').set("controller.isGeneratingAi", false); //No I18n
			if(OPMClient.SettingsAddEditController.pageAction == "Edit") { //No I18n
				OPMClient.SettingsAddEditController.set('slidePageHeader',Ember.I18n.t('webclient.action.edit',this)+ " - "+ $($.parseHTML(OPMClient.SettingsAddEditController.pageObj.graphName)).text()); //No I18N
			} else if(OPMClient.SettingsAddEditController.pageAction == "Add") { //No I18n
				OPMClient.SettingsAddEditController.set("slidePageHeader", Ember.I18n.t('webclient.Addscripttemplate')) //No I18n
			} else if(OPMClient.SettingsAddEditController.pageAction == "CopyAs") { //No I18n
				OPMClient.SettingsAddEditController.set('slidePageHeader',Ember.I18n.t('webclient.script.form.titlecopy')); //No I18N
			}
		}
	},
	willDestroyElement: function() {
		var $el = $('#genAIPromptContainer');
		var classes = ['pl-lg', 'pr-lg', 'h-100p', 'absolute', 'top-0']; //No I18N
		for (var i = 0; i < classes.length; i++) {
			if (!$el.hasClass(classes[i])) {
				$el.addClass(classes[i]);
			}
		}
		this.get('parentView').set("controller.isGeneratingAi", undefined);  //No I18N 
	}
});

/*-----------------------------------------
	Associate To Probes Components.
-----------------------------------------*/
OPMClient.OpmAssociateProbesComponent = Ember.Component.extend({
	templateName: "components/opm-associate-probes", //No I18N
	didInsertElement: function () {
		loadAssociateProbeDrpDwnList();
		var probeList = [];
		$.each(OPMClient.ApplicationController.probeList, function (key, value) {
			probeList.push({ 'displayName': value.DISPLAYNAME, 'value': value.NAME });//No I18N
		});
		triggerAssociationComponent(probeList, []);
		OPMClient.SettingsTabController.set("currentAssociationOptions.leftHeader", Ember.I18n.t('webclient.admin.devicetype.applyTempl.availableProbes', this));//No I18N
		OPMClient.SettingsTabController.set("currentAssociationOptions.rightHeader", Ember.I18n.t('webclient.admin.devicetype.applyTempl.selectedProbes', this));//No I18N
		var associateProbesSlideDetails = OPMClient.SettingsConfigurationController.get('associateProbesSlideDetails');
		var moduleType = associateProbesSlideDetails.moduleType;
		getConfigMapping(moduleType);
	}, actions: {
		associateToProbes: function (isDelete) {
			var selectedObj = [];
			$.each($("#selectedListName option"), function (k, v) {
				selectedObj.push($(v).val());
			});
			var data = { "probes": selectedObj.toString() };//No I18N
			var confData = saveConfigurationValues(data);
			if(confData!==undefined && !confData) {
				return false;
			}
			if (selectedObj.length === 0) {
				alert(Ember.I18n.t('js.commonstr.selectAtleastOneProbe', this));//No I18N
				return false;
			}
			var associateProbesSlideDetails = OPMClient.SettingsConfigurationController.get('associateProbesSlideDetails');
			var moduleType = associateProbesSlideDetails.moduleType;
			if(isDelete && moduleType!=="Rebranding") {
				data.operationType = "delete"; //No I18N
			} else {
				var isUpdate = OPMClient.SettingsConfigurationController.get('isUpdate');
				if (isUpdate!==undefined && isUpdate) {
					data.operationType = "update"; //No I18N
				} else {
					data.operationType = "add"; //No I18N
				}
			}

			var rsp = opm_ajaxPostRequest(window.OPM.apiUrlPattern + '/enterprise/pushCentralConfig', data);//No I18N
			if (rsp.result !== undefined && rsp.result.message !== undefined) {
				opm_infoMsgs('successMsg', rsp.result.message); //No I18N
				this.send('cancelAssociateToProbes');//No I18n
			} else {
				opm_infoMsgs('errorMsg', rsp.error.message); //No I18N
			}
		}, cancelAssociateToProbes: function () {
			if(OPMClient.SettingsConfigurationController.get('associateProbesSlideDetails')!==undefined && OPMClient.SettingsConfigurationController.get('associateProbesSlideDetails').id!==undefined) {
				slideOutWithId(OPMClient.SettingsConfigurationController.get('associateProbesSlideDetails').id);
			}
			OPMClient.SettingsConfigurationController.set('associateProbesSlideDetails', undefined); //No I18N
			OPMClient.SettingsConfigurationController.set("isUpdate",undefined); //No I18N
			OPMClient.SettingsConfigurationController.set("assoPrbDrpDwnName",undefined); //No I18N
		}
	},willDestroyElement:function() {
		this.send('cancelAssociateToProbes');//No I18n
		OPMClient.SettingsConfigurationController.set("isUpdate",undefined); //No I18N
	}
});

OPMClient.OpmDeviceSnapshotCentralMenuComponent = Ember.Component.extend({
	templateName: "components/opm-device-snapshot-central-menu", //NO I18N
	classNames:['deviceMenuSlide'],
	didInsertElement:function() {
		var model = this.get('content');
		if(model.snapType !=='Site' && model.snapType !=='Link'){ 
			deviceMenuAccr();
		}
		if(window.OPM.isMSPCentral && window.OPM.isProbeSelected) {
			setTimeout(function(){
				$(".hideInProbeSelectedMSPCentral").remove();
			}, 300);
		}
	},
	actions:{
		gotoGroups: function(){
			var content = this.get('content');
			redirectToDeviceSnapshot(content.deviceName,'Groups',content.snapType);//No I18N
		},
		showConnectedNeighbourDevices:function(){
			var content = this.get('content');
            OPMClient.GroupingController.set("groupDetails",{groupID:content.moID,groupName:content.displayName,groupType:"device"});//No I18N 
            var parentView = this.get('parentView');
			parentView.send('showGroupsMapView');//No I18N		
		}

	},
    willDestroyElement:function(){
        $('body').removeClass('deviceMenuSlideIn');
        $('#'+this.elementId).find('*').remove();
        deviceSlideOut(12);

    }
});

OPMClient.SupportAnalysisApiQueryDetailsComponent = Ember.Component.extend({
    templateName: "components/api-query-details", // No I18N

    didInsertElement: function () {
        var ctrl = OPMClient.__container__.lookup("controller:SupportAnalysis.ApiPerformanceAnalyzer.ApiHitDetails"); // No I18N
        var payload = {
            apiName: ctrl.get("apiName"), // No I18N
			threadName: ctrl.get("thread"), // No I18N
            time: ctrl.get("timestamp"), // No I18N
            duration: ctrl.get("duration") // No I18N
        };
		this.set("disableMessage", Ember.I18n.t("webclient.systemPerformance.apiPerformance.queryDetails.status.dbLoggerDisabled")); // No I18N
		Ember.$(document).on('click', '#redirectToSysPerfSettings', function () {
			opmGlobalRoute.transitionTo('SupportAnalysis.PerformanceSettings'); // No I18N
		});
        this.loadAndRenderData(payload);
    },

    loadAndRenderData: function (payload) {
        var ctrl = OPMClient.__container__.lookup("controller:SupportAnalysis.ApiPerformanceAnalyzer.ApiHitDetails"); // No I18N
        var url = window.OPM.apiUrlPattern + "/diagnostics/getApiQueryDetails"; // No I18N
		var self = this;
        opm_ajaxGetResponseWithMsg(url, payload, '', function(jsonData) {
			ctrl.setProperties({
				jsonData: jsonData,
				isEnabled: true
			});
			self.setProperties({
				showDisableMessage : jsonData.showDisableMessage,
				apiName: payload.apiName,
				timestamp: payload.time,
				thread: payload.threadName,
				ApiQueryLoaded: true
			});
			$("#isEnable").prop("checked", true); // No I18N
			self.applyQueryFormatter(jsonData.colModel);
			self.renderGrid(jsonData, true);
		});
    },

    applyQueryFormatter: function (colModel) {
        colModel.forEach(function (col) {
            if (col.name === "query") { // No I18N
                col.formatter = expandFormatter;
            }
        });
    },

    renderGrid: function (jsonData, filterMatched) {
        var data = filterMatched ? jsonData.data.filter(function (record) { return record.match; }) : jsonData.data;
        var defaultOptions = {searchOption: true, pagination: true, minRowsPerPage: 50, expandFormatter: true};
        Ember.run.scheduleOnce('afterRender', this, function() { //No I18N
			$("#apiQueryDetailsGrid").jqGrid("GridUnload"); // No I18N
			opm_loadJQgridWithData("#apiQueryDetailsGrid", data, jsonData.colNames, jsonData.colModel, "", "", "", defaultOptions); // No I18N
		});
    },

    actions: {
        checkboxChanged: function () {
            var ctrl = OPMClient.__container__.lookup("controller:SupportAnalysis.ApiPerformanceAnalyzer.ApiHitDetails"); // No I18N
            var isEnable = $("#isEnable").is(":checked"); // No I18N
            var jsonData = ctrl.get("jsonData"); // No I18N
            this.renderGrid(jsonData, isEnable);
        }
    }
});


OPMClient.SupportAnalysisHistogramApiDetailsComponent = Ember.Component.extend({
    templateName : "components/histogram-api-details", 																					//No I18N
    didInsertElement: function() {
        var ctrl = OPMClient.__container__.lookup("controller:SupportAnalysis.ApiPerformanceAnalyzer");   								//No I18N
		var range = ctrl.get("range");																									//No I18N
        var url = window.OPM.apiUrlPattern + "/diagnostics/getHistogramApiDetails?range=" + encodeURIComponent(range); 					//No I18N
        var jsonData = opm_ajaxGetRequest(url).data;
		if(!jsonData) {
			return;
		}
		var defaultOptions = { searchOption: true, pagination: true, minRowsPerPage: 50};
		$("#histogramApiDetailsGrid").jqGrid("GridUnload"); 																					// No I18N
        opm_loadJQgridWithData("#histogramApiDetailsGrid", jsonData.data, jsonData.colNames, jsonData.colModel, '', '', '', defaultOptions); 	//No I18N
    }
});

/*-----------------------------------------
	Probes Deployment Component.
-----------------------------------------*/
OPMClient.OpmProbeDeploymentComponent = Ember.Component.extend({
	templateName: "components/opm-probe-deployment", //No I18N
	didInsertElement: function () {
		var self = this;
		var activeText = Ember.I18n.t("webclient.fwa.rule.admin.show.details",this); //No I18N
		if(self.get('controller.activeText')!==undefined && self.get('controller.activeText')!==null && self.get('controller.activeText')!=="") {
			activeText = self.get('controller.activeText'); //No I18N
		}
		self.set('controller.activeText',activeText); //No I18N

		var widthPercent = 0;
		var statusMapList = OPMClient.SettingsRemoteDeployController.get("probeDeploymentStatusData"); //No I18N
		if(statusMapList!==undefined && statusMapList!==null && statusMapList!=="") {
			if(statusMapList.status!==undefined) {
				if(statusMapList.status==5 || statusMapList.status==-1 || statusMapList.status==-2) {
					OPMClient.Settings.initDefaultProbeInstallValues();
					OPMClient.Settings.defaultProbeInstallValues();
					if($("#deploymentForm").hasClass("alarmProfileDisabled")) {
						$("#deploymentForm").removeClass("alarmProfileDisabled");
					}

					if(statusMapList.status==5) {
						if($(".progress-details-btn").hasClass("active")) {
							activeClassName = "";
							activeText = Ember.I18n.t("webclient.fwa.rule.admin.show.details",this); //No I18N
							$(".progress-details-btn").removeClass("active"); //No I18N
						}
						self.set('controller.activeClassName',activeClassName); //No I18N
						self.set('controller.activeText',activeText); //No I18N

						var openClassName = "";
						if($(".progress-details-container").hasClass("open")) {
							openClassName = "";
							$(".progress-details-container").removeClass("open");
						}
						self.set('controller.openClassName',openClassName); //No I18N
					}
				} else {
					if(!$("#deploymentForm").hasClass("alarmProfileDisabled")) {
						$("#deploymentForm").addClass("alarmProfileDisabled");
					}
				}
				widthPercent = (statusMapList.status/statusMapList.totalSteps)*100;
				// $('.progress-bar-fill').width(widthPercent+'%');
				self.set('controller.widthPercent',"width:"+widthPercent+'%'); //No I18N
			}
			self.set("statusMapList",statusMapList); //No I18N
		}
	},
	probeDeploymentStatusDataObserver: function(){
	    this.rerender();
	}.observes('OPMClient.SettingsRemoteDeployController.probeDeploymentStatusData'), //No I18N
	actions: {
		toggleDeploymentStatus:function() {
			var self = this;
			var activeClassName = "";
			var activeText = Ember.I18n.t("webclient.fwa.rule.admin.show.details",this); //No I18N
			if($(".progress-details-btn").hasClass("active")) {
				activeClassName = "";
				activeText = Ember.I18n.t("webclient.fwa.rule.admin.show.details",this); //No I18N
				$(".progress-details-btn").removeClass("active"); //No I18N
			} else {
				activeClassName = "active"; //No I18N
				activeText = Ember.I18n.t("webclient.opm.silentprobe.hidedetails",this); //No I18N
				$(".progress-details-btn").addClass("active"); //No I18N
			}
			self.set('controller.activeClassName',activeClassName); //No I18N
			self.set('controller.activeText',activeText); //No I18N

			var openClassName = "";
			var statusMapList = self.get("statusMapList"); //No I18N
			if($(".progress-details-container").hasClass("open")) {
				openClassName = "";
				$(".progress-details-container").removeClass("open");
			} else {
				openClassName = "open"; //No I18N
				$(".progress-details-container").addClass("open");
			}
			self.set('controller.openClassName',openClassName); //No I18N
		}, uploadInstaller:function() {
			var formdata = new FormData();
			var fieldsToValidate = {'empty':[]};//No I18N
			fieldsToValidate.empty.push('probeInstallerFile');//No I18N
			if(!opm_validateFields(fieldsToValidate)){
				return;
			}
			var url = window.OPM.apiUrlPattern +"/enterprise/uploadInstaller"; //No I18n
			formdata.append("uploadInstallerFile", $("#probeInstallerFile")[0].files[0]);//No I18N

			if(!$("#uploadButton").hasClass("alarmProfileDisabled")) {
				$("#uploadButton").addClass("alarmProfileDisabled"); //No I18N
				$("#uploadButton").text(Ember.I18n.t("webclient.smartupgrade.uploading",this)); //No I18N
			}
			opu_multipartAjaxPostRequestWithClbk(url, formdata, "", function(response) {
				var jsonDataResponse = JSON.parse(response);
				if(jsonDataResponse.error!==undefined) {
					if($("#uploadButton").hasClass("alarmProfileDisabled")) {
						$("#uploadButton").removeClass("alarmProfileDisabled"); //No I18N
						$("#uploadButton").text(Ember.I18n.t("webclient.skin.upload",this)); //No I18N
					}
					opm_infoMsgs('errorMsg',jsonDataResponse.error.message); //No I18N
				} else {
					$("#uploadButton").hide();
					$("#deployButton").show();
					if($("#uploadButton").hasClass("alarmProfileDisabled")) {
						$("#uploadButton").removeClass("alarmProfileDisabled"); //No I18N
						$("#uploadButton").text(Ember.I18n.t("webclient.skin.upload",this)); //No I18N
					}
					opm_infoMsgs('successMsg',jsonDataResponse.message); //No I18N
				}
			});
		}, deployProbe: function() {
			var parentView = this.get('parentView');//No I18N
			parentView.send('deployProbe');//No I18N
		}
	}
});

OPMClient.OpmProbeDeploymentStepsComponent = Ember.Component.extend({
	templateName: "components/opm-probe-deployment-steps", //No I18N
	didInsertElement: function () {
		var steps = this.get("steps");
		if(steps!==undefined && steps!==null && steps!=="") {
			$.each(steps,function(k,v){
				// Ember.run.scheduleOnce('afterRender', this, function () {//No I18N
				if(v.status!==undefined){
					if(v.status==-1) {
						$("#step"+v.stepNumber).addClass("failed");//No I18N
						$(".progress-box-container").addClass("failed");//No I18N
						if($("#deploymentForm").hasClass("alarmProfileDisabled")) {
							$("#deploymentForm").removeClass("alarmProfileDisabled");
						}
					}
					if(v.status==100 || v.status==-2) {
						$("#step"+v.stepNumber).addClass("completed");//No I18N
					}
					if(v.status>=0 && v.status<=99) {
						var currentDegree = (v.status / 100) * 360;
						$("#step"+v.stepNumber).addClass("progress");//No I18N
						$("#step"+v.stepNumber).css('background','conic-gradient(from 0deg, #27AB67 0deg ' + currentDegree + 'deg, #dcdcdc ' + currentDegree + 'deg 360deg)');//No I18N
					}
				}
				// });
			});
		}
		this.set("steps",steps); //No I18N
	},
	probeDeploymentStatusStepsObserver: function(){
	    this.rerender();
	}.observes('steps') //No I18N
});
OPMClient.OpmMorrisDonutChartComponent = Ember.Component.extend({
	templateName: "components/opm-morrisDonut-table",//No I18N
	showGrid:false,
	didInsertElement:function(){
		var jsonData = this.get('widgetData').apiData;
		var powerStats = [];
		var order = {
			"Consumed Power": 1,//No I18N
			"Maximum Power": 2,//No I18N
			"Available Power": 3//No I18N
		};

        $.each(jsonData.result, function(i,obj)
        {
            var label = obj[0];
    		var value = obj[1] + "<em class='bold fs16'>"+Ember.I18n.t('opu.views.watts',this)+"</em>";
    		var status = obj[2];
            powerStats.push({title:label,value:value,status:status});
        });

        powerStats.sort(function(a, b) {
			return order[a.title] - order[b.title];
		});
		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
	        OpUtilsDialGraph(powerStats,ipamSeverityColors,Ember.I18n.t('opu.views.CONSUMED_POWER',this),'MainSeverityChart-6');//No I18N
	        opm_setLabels('MainSeverityChart-6',OPMClient.InventoryOpUtilsController.consumedSwitchPower,Ember.I18n.t('opu.views.CONSUMED_POWER',this));//No I18N
		});
	}
});

OPMClient.OpmUPSBatterySummaryComponent = Ember.Component.extend({
	templateName: "components/opm-ups-battery-summary",//No I18n
	didInsertElement: function() {
		var self = this;
		var widgetData = this.get('widgetData');
		var apiData = widgetData.apiData;
		var batterySummary = {};
		$.each(apiData, function(key, value) {
			switch(key) {
			// Battery Health :
			case "batteryHealth": //No I18n
				batterySummary.batteryHealth = { value: value };
				batterySummary.batteryHealth.unit = ""; //No I18n
				if(value === "NA" || value === "Unknown") {
					batterySummaryClass = "na"; //No I18n
				} else if(value === "Good") { //No I18n
					batterySummaryClass = "green"; //No I18n
				} else {
					batterySummaryClass = "red"; //No I18n
				}
				batterySummary.batteryHealth["class"] = batterySummaryClass; //No I18n
				break;
			// Battery Status :
			case "batteryStatus": //No I18n
				batterySummary.batteryStatus = { value: value };
				batterySummary.batteryStatus.unit = ""; //No I18n
				//Need to finalize the possible values for battery status from API and the corresponding color coding
				if(value === "NA" || value === "Unknown") {
					batterySummaryClass = "na"; //No I18n
				} else if(value === "Normal" || value === "Battery OK" || value === "BatteryCharging") { //No I18n
					batterySummaryClass = "green"; //No I18n
				} else {
					batterySummaryClass = "red"; //No I18n
				}
				batterySummary.batteryStatus["class"] = batterySummaryClass; //No I18n
				break;
			// Input Power :
			case "inputPower": //No I18n
				batterySummary.inputPower = { value: value };
				batterySummary.inputPower.unit = ""; //No I18n
				if(value === "NA") {
					batterySummaryClass = "na"; //No I18n
				} else {
					batterySummaryClass = "green"; //No I18n
				}
				batterySummary.inputPower["class"] = batterySummaryClass; //No I18n
				break;
			// Output Power :
			case "outputPower": //No I18n
				batterySummary.outputPower = { value: value };
				batterySummary.outputPower.unit = ""; //No I18n
				if(value === "NA") {
					batterySummaryClass = "na"; //No I18n
				} else {
					batterySummaryClass = "green"; //No I18n
				}
				batterySummary.outputPower["class"] = batterySummaryClass; //No I18n
				break;
			// Packet Loss :
			case "packetLoss": //No I18n
				batterySummary.packetLoss = { value: value };
				if(value!==undefined && value !== null && value !=="") {
					batterySummary.packetLoss.unit = "%"; //No I18n
					if(value === "NA") {
						batterySummary.packetLoss.unit = ""; //No I18n
						batterySummaryClass = "na"; //No I18n
					} else if(value === "100") {
						batterySummaryClass = "red"; //No I18n
					} else {
						batterySummaryClass = "green"; //No I18n
					}
				} else {
					value = "NA"; //No I18n
					batterySummary.packetLoss = { value: value };
					batterySummary.packetLoss.unit = ""; //No I18n
					batterySummaryClass = "na"; //No I18n
				}
				batterySummary.packetLoss["class"] = batterySummaryClass; //No I18n
				break;
			// Response Time :
			case "responseTime": //No I18n
				batterySummary.responseTime = { value: value };
				batterySummary.responseTime.unit = "ms"; //No I18n
				if(value === "NA") {
					batterySummary.responseTime.unit = ""; //No I18n
					batterySummaryClass = "na"; //No I18n
				} else {
					batterySummaryClass = "green"; //No I18n
				}
				batterySummary.responseTime["class"] = batterySummaryClass; //No I18n
				break;
			// UPS Efficiency (%) :
			case "upsEfficiency": //No I18n
				batterySummary.upsEfficiency = { value: value };
				batterySummary.upsEfficiency.unit = "%"; //No I18n
				if(value === "NA") {
					batterySummary.upsEfficiency.unit = ""; //No I18n
					batterySummaryClass = "na"; //No I18n
				} else if(parseInt(value) < 80) {
					batterySummaryClass = "red"; //No I18n
				} else {
					batterySummaryClass = "green"; //No I18n
				}
				batterySummary.upsEfficiency["class"] = batterySummaryClass; //No I18n
				break;
			// Power Loss :
			case "powerLoss": //No I18n
				batterySummary.powerLoss = { value: value };
				batterySummary.powerLoss.unit = "%"; //No I18n
				if(value === "NA") {
					batterySummary.powerLoss.unit = ""; //No I18n
					batterySummaryClass = "na"; //No I18n
				} else if(value === "100") {
					batterySummaryClass = "red"; //No I18n
				} else {
					batterySummaryClass = "green"; //No I18n
				}
				batterySummary.powerLoss["class"] = batterySummaryClass; //No I18n
				break;
			}
		});
		self.set("batterySummary", batterySummary); //No I18n
		self.set('widgetData.sizey',22); //No I18N
	}
});

OPMClient.OpmUPSSustainabilityComponent = Ember.Component.extend({
	templateName: "components/opm-sustainability",//No I18n
	didInsertElement: function() {
		var self = this;
		var widgetData = this.get('widgetData');
		var apiData = widgetData.apiData;
		$.each(apiData, function(key, value) {
			switch(key) {
			// UPS Efficiency (%) :
			case "upsEfficiency": //No I18n
				apiData.upsEfficiency = { value: value };
				if(value === "NA") {
					apiData.upsEfficiency.unit = ""; //No I18n
				} else {
					apiData.upsEfficiency.unit = "%"; //No I18n
				}
				break;
			// Power Loss :
			case "powerLoss": //No I18n
				apiData.powerLoss = { value: value };
				if(value === "NA") {
					apiData.powerLoss.unit = ""; //No I18n
				} else {
					apiData.powerLoss.unit = "%"; //No I18n
				}
				break;
			// Total Power :
			case "totalPower": //No I18n
				apiData.totalPower = { value: value };
				apiData.totalPower.unit = ""; //No I18n
				break;
			}
		});
		self.set("sustainabilityData", apiData); //No I18n
		self.set('widgetData.sizey',10); //No I18N
	}
});


// Shared form for the Threat Intelligence integrations (AlienVault, VirusTotal, RDAP), embedded via {{ThreatIntel-Form model=model}}
OPMClient.ThreatIntelFormComponent = Ember.Component.extend({
	templateName: "ThreatIntel-Form",//No I18N
	apiKeyPlaceHolder: Ember.I18n.t('webclicent.settings.addmeraki.apikey.header', this),//No I18N
	needsApiKey: function(){
		var productName = this.get('model.productName');//No I18N
		return productName === "ALIENVAULT" || productName === "VIRUSTOTAL";//No I18N
	}.property('model.productName'),//No I18N
	actions:{
		saveConfig: function(){
			var self = this;
			var fields = {'empty':['threatIntel_authtoken'],"custom": [{ 'condition': !this.get('model.consentStatus'), 'identifier': 'threatIntelConsentcheck', 'message': Ember.I18n.t('webclient.consent.confirmation', this) }]};//No I18N
			if(self.model.productName=="RDAP"){
				delete fields.empty;
			}
			var isValid = opm_validateFields(fields);
			if(isValid){
				var msgId = opm_infoMsgs("infoMsg", Ember.I18n.t('webclient.credential.snmp.pleasewait',this));//No I18N
				var postData = {
					productName:self.get("model.productName"),//No I18N
					consentStatus: self.get("model.consentStatus")//No I18N
				};
				if(self.get('needsApiKey')){
					postData.authKey = ("*".repeat(164) == self.model.authCode) ? "configured" : self.model.authCode;//No I18N
				}
				$.ajax({
					url: window.OPM.apiUrlPattern+"/admin/addUpdateThreatIntelConfig",//No I18N
					method:'POST',//No I18N
					data:postData,
					async:true,
					self:self,
					success: function(jsonData){
						$("#"+msgId).remove();
						showMessage(jsonData);
						if(jsonData.error === undefined) {
							self.set("model.hideResetBtn", true);//No I18N
						}
					}
				});
			}
		},
		resetConfig: function(){
			var self = this;
			var okCallBack = function() {
				var msgId = opm_infoMsgs("infoMsg", Ember.I18n.t('webclient.credential.snmp.pleasewait',this));//No I18N
				var postData = {
					productName:self.get("model.productName")//No I18N
				};
				$.ajax({
					url: window.OPM.apiUrlPattern+"/admin/resetThreatIntelConfig",//No I18N
					method:'POST',//No I18N
					data:postData,
					async:true,
					self:self,
					success: function(jsonData){
						$("#"+msgId).remove();
						showMessage(jsonData);
						if(jsonData.error === undefined) {
							self.set("model.authCode", "");//No I18N
							self.set("model.consentStatus", false);//No I18N
							self.set("model.hideResetBtn", false);//No I18N
						}
					}
				});
			};
			opmConfirm("", Ember.I18n.t("webclient.siem.reset.msg",{param0:self.get("model.productLabel")},this), "", okCallBack, "", "", "", "", "dialogStyle2"); //NO I18N
		},
		backToAddonPage: function(){
			opmGlobalRoute.transitionTo("Settings.Basic.AddOnProduct"); //No I18N
		}
	}
});
