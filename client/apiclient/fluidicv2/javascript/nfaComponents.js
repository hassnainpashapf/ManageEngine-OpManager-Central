OPMClient.OpmNFAIntfSummaryComponent = Ember.Component.extend({
	templateName:"components/opm-nfaintf-summary",
	classNames:["com_NFAIntfSummary"],
	initDefaults:function(){
		this.set("showInterfaceEditLink", window.OPM.userPermissions.netflowSettingsWrite && !window.OPM.isCentralServer && !window.OPM.isMSPAllCustomerOrAllProbeSelected); //NO I18N
		var jsonData = this.get("widgetData.apiData"); //NO I18N
		if($.isEmptyObject(jsonData)) {
			this.set("widgetData.noData",true); //NO I18N
			this.set("widgetData.sizey",2); //NO I18N
			return;
		}
		this.set("isAvailPortInfo",(jsonData.spmInfo!==undefined)); //NO I18N
		var sizeyVal=12;
		var summaryArr = {};
		summaryArr.flowStatusCls = "icon-status"+jsonData.traffic[0].clrCode; //NO I18N
		summaryArr.flowStatusTxt = Ember.I18n.t(jsonData.traffic[0].StatusTxt);
		summaryArr.bandwidthIN	= nfa_dataRateConverter(jsonData.iSpeed,false);
		summaryArr.bandwidthOUT	= nfa_dataRateConverter(jsonData.oSpeed,false);
		summaryArr.iType 		= jsonData.iType;
		summaryArr.nfaIntfID 	= jsonData.traffic[0].ID;
		summaryArr.samplingRate = jsonData.samplingRate;
		summaryArr.isNBAR 		= jsonData.isNBAR;
		summaryArr.isCBQos 		= jsonData.isCBQos;
		summaryArr.speedIN 		= jsonData.traffic[0].IN;
		summaryArr.speedOUT 	= jsonData.traffic[0].OUT;
		summaryArr.utilINProps 	= nfa_getUtilProps(jsonData.traffic[0].UtilIN,200);
		summaryArr.utilOUTProps = nfa_getUtilProps(jsonData.traffic[0].UtilOUT,200);
		summaryArr.alerts 		= jsonData.traffic[0].alert;
		summaryArr.attacks 		= jsonData.attack;
		summaryArr.nfaIfIndex	= jsonData.traffic[0].ifindex;

		if(this.isAvailPortInfo){
			summaryArr.resourceID	= jsonData.spmInfo["resource-id"]; //NO I18N
			summaryArr.ifSpeed 		= jsonData.spmInfo["connected-port-speed"]; //NO I18N
			summaryArr.ifIndex 		= jsonData.spmInfo["connected-port-ifindex"]; //NO I18N
			summaryArr.ifName 		= jsonData.spmInfo["connected-port-ifname"]; //NO I18N
			summaryArr.ifAlias 		= jsonData.spmInfo["connected-port-ifalias"]; //NO I18N
			summaryArr.ifDesc 		= jsonData.spmInfo["connected-port-ifdesc"]; //NO I18N
			summaryArr.ifType 		= jsonData.spmInfo["connected-port-iftype"]; //NO I18N
			summaryArr.ifMtu		= jsonData.spmInfo["connected-port-ifmtu"]; //NO I18N
			summaryArr.portNumber	= jsonData.spmInfo["connected-switch-port"]; //NO I18N

			summaryArr.oprStatusCls = (jsonData.spmInfo["operational-status-int"]==1)?"icon-status5":"icon-status1"; //NO I18N
			summaryArr.oprStatusTxt	= jsonData.spmInfo["operational-status"]; //NO I18N

			summaryArr.adminStatusCls = (jsonData.spmInfo["admin-status-int"]==1)?"icon-status5":((jsonData.spmInfo["operational-status-int"]==1)?"icon-status2":"icon-status1"); //NO I18N
			summaryArr.adminStatusTxt = jsonData.spmInfo["admin-status"]; //NO I18N

			summaryArr.connectedMAC	= nfa_getDotedString(jsonData.spmInfo["connected-mac"]); //NO I18N
			summaryArr.showMoreMAC	= (summaryArr.connectedMAC.indexOf("...")!=-1); //NO I18N

			summaryArr.connectedIP	= nfa_getDotedString(jsonData.spmInfo["connected-ip"]); //NO I18N
			summaryArr.showMoreIP	= (summaryArr.connectedIP.indexOf("...")!=-1); //NO I18N

			summaryArr.connectedDNS	= nfa_getDotedString(jsonData.spmInfo["connected-dns"]); //NO I18N
			summaryArr.showMoreDNS	= (summaryArr.connectedDNS.indexOf("...")!=-1); //NO I18N

			summaryArr.deviceType	= jsonData.spmInfo["device-type"]; //NO I18N
			summaryArr.scanStatus	= jsonData.spmInfo["scan-status"]; //NO I18N
			summaryArr.vlanID		= jsonData.spmInfo.vlan;
			summaryArr.vlanName		= jsonData.spmInfo["vlan-name"]; //NO I18N
			summaryArr.portLocation = (jsonData.spmInfo["port-location"])?jsonData.spmInfo["port-location"]:""; //NO I18N
			sizeyVal=20;
		}
		this.set("summary",summaryArr); //NO I18N

		var recentAlarms=[];
		if(jsonData.alert.length==0){
			this.set("showNoAlarmMsg",true); //NO I18N
		}else {
			$.each(jsonData.alert,function(key,val) {
				val.displayMessage = (val.message.length<=180)?val.message:(val.message.substring(0,180)+" ..."); //NO I18N
				recentAlarms.push(val);
				return key<2;
			});
		}
		this.set("recentAlarms",recentAlarms); //NO I18N
		this.set("disableAlarmsRedirection", (window.OPM.isCentralServer || window.OPM.isMSPAllCustomerOrAllProbeSelected)); //NO I18N
		this.set("widgetData.sizey",sizeyVal); //NO I18N
		this.set("widgetData.noData",false); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function(){
		$("#inventoryGridStyle").addClass("fullWidth"); //NO I18N
	},
	actions:{
		showPage:function(page) {
			redirectToSnapshot("FlowInterface",this.snapshotObj.deviceName,page); //NO I18N
		},
		showMoreInfo:function(resourceID,ifIndex) {
			loadMacAddressDetailsTable({"resource-id":resourceID,"connected-port-ifindex":ifIndex}); //NO I18N
		},
		redirectToAlarm:function(selEntity) {
			if(this.disableAlarmsRedirection) return;
			redirectToAlarm(selEntity);
		}
	},
	willDestroyElement:function(){
		$("#inventoryGridStyle").removeClass("fullWidth"); //NO I18N
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.OpmNFADeviceSummaryComponent = Ember.Component.extend({
	templateName:"components/nfa-device-summary", //NO I18N
	classNames:["com_IPAMSwitchSummary"], //NO I18N
	isSPMWrite:window.OPM.userPermissions.spmWrite && !window.isNFAStandardEdition,
	isOPUEnabled:window.OPM.isOPUEnabled,
	loadInitialValues:function() {
		this.set("showAssociateSNMPButton", window.OPM.userPermissions.discoveryWrite && !window.OPM.isCentralServer && !window.OPM.isMSPAllCustomerOrAllProbeSelected && !isAllCollectorSelected()); //NO I18N
		$("#inventoryGridStyle").addClass("fullWidth"); //NO I18N
		var jsonData = this.get("widgetData.apiData"); //NO I18N
		if($.isEmptyObject(jsonData) || jsonData.error!==undefined) {
			opm_infoMsgs("infoMsg", jsonData.error.message); //NO I18N
			this.set("widgetData.noData",true); //NO I18N
			this.set("widgetData.sizey",8); //NO I18N
			return;
		}
		this.set("isSPMTab", (this.widgetData.name==="nfa.widget.spm")); //NO I18N
		this.set("hideIPAMSampleData",(!window.OPM.isEvalUser && !window.OPM.isOPUPlug)); //NO I18N

		if(jsonData.result.isSwitch && jsonData.result.isSnmpDevice) {
			if(!jsonData.result.isOpUtilsAddOnEnabled) {
				this.set("isSampledescValueAvailable",false); //NO I18N
				this.set("sampledesc",Ember.I18n.t("opu.msgbd.IPAM_NFA_ADDON_NOT_ENABLED")); //NO I18N
			}else {
				if(window.OPM.userPermissions.spmWrite){
					this.set("isSampledescValueAvailable",true); //NO I18N
					this.set("sampledesc","opu.spm.port.nfa.sample_data_desc1"); //NO I18N
					this.set("sampledescValue",jsonData.result["ip-address"]); //NO I18N
				}
			}
			jsonData.portInfo = widgetSampleData.OpUtils_NFA_Port_Details;
			this.set("loadSampleData",true); //NO I18N
		}
		else if(jsonData.portInfo && jsonData.portInfo.isShowAllInterface!=undefined && jsonData.portInfo.isShowAllInterface=="false"){
			this.set("isSampledescValueAvailable",true); //NO I18N
			this.set("sampledesc","opu.readkb.EnableAllInterfaces"); //NO I18N
			this.set("sampledescValue",this.widgetData.id); //NO I18N
			jsonData.portInfo = widgetSampleData.OpUtils_NFA_Port_Details;
			this.set("loadSampleData",true); //NO I18N
		}
		else {
			this.set("loadSampleData",false); //NO I18N
			if(jsonData.result.isSnmpDevice!==undefined && jsonData.result.isSnmpDevice===false) {
				this.set("widgetData.noData",true); //NO I18N
				this.set("widgetData.sizey",8); //NO I18N
				return;
			}
		}
		this.set("widgetData.noData",false); //NO I18N
		this.set("summary",{deviceInfo:nfa_getDeviceSummaryArray(jsonData.result)}); //NO I18N

		if(this.isSPMTab) {
			if(jsonData.portInfo!==undefined && jsonData.portInfo.result.length!==0) {
				this.set("portDetails",nfa_getPortView(jsonData.portInfo)); //NO I18N
				this.set("gridClassName",(this.snapshotObj.snapDetails.fullView)?"opm_jqGridUI themeOne fixedHeight":"opm_jqGridUI themeOne"); //NO I18N
				var sendObj = {};
				sendObj.gridId = "portInfo_"+this.widgetData.id; //NO I18N
				sendObj.data = jsonData.portInfo.result;
				sendObj.colModels = this.widgetData.snapshotData.colModelList;
				sendObj.colNames = this.widgetData.snapshotData.colNamesList;
				sendObj.defaultOptions = {hideCSV:true,hideExcel:true,Search:false,minRowsPerPage:10};
				sendObj.onSelectFunction = this.widgetData.snapshotData.onselectfunction;
				sendObj.defaultOptions.gridCallBack = function(gridID){
					$("#"+gridID).jqGrid("setGridWidth",$(".nfaDeviceSection").width()-2); //NO I18N
				}
				validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
				this.set("portsGridData",sendObj); //NO I18N

				var sendObj = {};
				sendObj.gridId = "devInfo"+this.widgetData.id; //NO I18N
				sendObj.data = jsonData.portInfo.result;
				sendObj.colModels = this.widgetData.snapshotData.colModelList1;
				sendObj.colNames = this.widgetData.snapshotData.colNamesList1;
				sendObj.defaultOptions = {hideCSV:true,hideExcel:true,Search:false,minRowsPerPage:10};
				sendObj.onSelectFunction = this.widgetData.snapshotData.onselectfunction;
				sendObj.defaultOptions.gridCallBack = function(gridID){
					$("#"+gridID).jqGrid("setGridWidth",$(".nfaDeviceSection").width()-10); //NO I18N
				}
				validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
				this.set("conDeviceData",sendObj); //NO I18N

				if(jsonData.portInfo.result.length>10) {
					this.set("widgetData.sizey",43); //NO I18N
				}else {
					this.set("widgetData.sizey",(22+(jsonData.portInfo.result.length*2))); //NO I18N
				}
			}
		}else {
			this.set("widgetData.sizey", 35); //NO I18N
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		$(".DI-Header .timeFilterList.dateInfo").hide(); //NO I18N
		if(this.isSPMTab) { //Yet to change
			return;
		}
	},
	actions:{
		showPage:function(page) {
			redirectToSnapshot("FlowDevice",this.snapshotObj.deviceName,page); //NO I18N
		},
		enableIPAMModule:function() {
			enableIPAMModule();
		}
	},
	willDestroyElement:function() {
		$(".OpMAlertMsg").remove(); //NO I18N
		$("#inventoryGridStyle").removeClass("fullWidth"); //NO I18N
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaNetworkViewComponent = Ember.Component.extend({
	templateName:"components/nfa-network-view", //NO I18N
	classNames:["interface-canvas-container"], //NO I18N
	showFailedInfo:false,
	isFlowIntfOnly:false,
	isFitMapToScreen:false,
	xlinkIcon:"/apiclient/fluidicv2/img/sprite-opm.svg#router", //NO I18N
	fitToMapIconTitle:Ember.I18n.t("webclient.rackview.fittoscreen"), //NO I18N
	widgetsLink:[
		{name:Ember.I18n.t("NFAWidget.trfc"),	value:"opm.interface.traffic"}, //NO I18N
		{name:Ember.I18n.t("NFAWidget.App"),	value:"opm.interface.application"}, //NO I18N
		{name:Ember.I18n.t("NFAWidget.Src"),	value:"opm.interface.topsource"}, //NO I18N
		{name:Ember.I18n.t("NFAWidget.Dst"),	value:"opm.interface.topdest"}, //NO I18N
		{name:Ember.I18n.t("nfa.reports.qos"),	value:"opm.interface.topqos"}, //NO I18N
		{name:Ember.I18n.t("webclient.snapshot.name.Conversation"),	value:"opm.interface.topconv"} //NO I18N
	],
	didInsertElement:function() {
		this.getNetworkMap();
	},
	getNetworkMap:function() {
		var callBckFunc = function(response, self) {
			if(response!==undefined) {
				self.set("showLoading", false); //NO I18N
				if(response.error || response.showEnableARPOption || response.showErrorMessage) {
					self.set("showFailedInfo", true); //NO I18N
				}else {
					if(OPMClient.InventoryNFAController.selectedNode && response.mapID!=OPMClient.InventoryNFAController.selectedNode.mapID) {
						OPMClient.InventoryNFAController.set("selectedNode", false); //NO I18N
					}
					self.set("apiData", response); //NO I18N
					self.set("showFailedInfo", false); //NO I18N
				}
				if(!self.showFailedInfo) {
					Ember.run.schedule("afterRender", this, function(){ //NO I18N
						nfa_loadNetworkMap(self);
					});
				}
			}
		}
		this.set("showLoading", true); //NO I18N
		nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfadevice/getNetworkMapData", {"RouterIP":this.ipAddress,"isFlowIntfOnly":this.isFlowIntfOnly}, callBckFunc, this); //NO I18N
	}.observes("isFlowIntfOnly"), //NO I18N
	getAdditionalNodeInfo:function(selectedNode) {
		var callBckFunc = function(response, self) {
			var nodeInfo = {};
			if(response!==undefined) {
				if(response.error) {
					showMessage(response);
				}else {
					nodeInfo = response;
				}
			}
			nodeInfo.mapID = self.apiData.mapID;
			self.set("selectedNode", $.extend(nodeInfo, selectedNode)); //NO I18N
		}
		var formData, apiURL;
		if(selectedNode.isInterface) {
			var formData = {"DeviceID":deviceBasicDetails.deviceName,"nfaInterfaceIndex":selectedNode.intfIndex}; //NO I18N
			apiURL = "/nfadevice/getInterfaceBasicInfoForNetworkMap"; //NO I18N
		}else {
			var formData = {"seedDeviceIP":deviceBasicDetails.ipAddress, "RouterIP":selectedNode.ip}; //NO I18N
			apiURL = "/nfadevice/getDeviceBasicInfoForNetworkMap"; //NO I18N
		}
		nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+apiURL, formData, callBckFunc, this); //NO I18N
	},
	selectedNodeChanged:function() {
		OPMClient.InventoryNFAController.set("selectedNode", this.selectedNode); //NO I18N
	}.observes("selectedNode"), //NO I18N
	storeNetworkMapValues:function() {
		this.set("mapPositions", this.nfaNetworkMap.getPositions()); //NO I18N
		this.set("viewPosition", this.nfaNetworkMap.getViewPosition()); //NO I18N
		this.set("zoomScale", this.nfaNetworkMap.getScale()); //NO I18N
	},
	updateNetworkMapValues:function() {
		if(this.mapPositions && this.viewPosition && this.zoomScale) {
			var callBckFunc = function(response) {
				if(response.error) {
					showMessage(response);
				}
			}
			var coordinates = [];
			$.each(this.mapPositions, function(key, value) {
				coordinates.push({"xVal":value.x, "yVal":value.y, "deviceName":key}); //NO I18N
			});
			coordinates.push({"xVal":this.viewPosition.x, "yVal":this.viewPosition.y, "deviceName":"viewPosition"}); //NO I18N

			var apiURL = window.OPM.apiUrlPattern+"/maps/updateLayer2Coordinates"; //NO I18N
			var formData = {"mapId":this.apiData.mapID, "layout":"NFATree", "zoomValue":this.zoomScale, "coordinates":JSON.stringify(coordinates), "showNFAEnabledInterface":this.isFlowIntfOnly,"RouterID":this.apiData.routerID}; //NO I18N
			nfa_postAjaxResponseWithAsync(apiURL, formData, callBckFunc, this); //NO I18N
		}
	},
	actions:{
		goToSnapshot:function(widgetName) {
			OPMClient.HomeDetailsController.isNFANetworkMapDrillDown = true;
			OPMClient.HomeDetailsController.isFromDashboardDrillDown = true;
			OPMClient.InventoryDeviceDetailsController.expandSnapWidget = false;
			if(widgetName==="opm.interface.traffic" && !this.selectedNode.isInterface) { //NO I18N
				widgetName = "opm.device.traffic"; //NO I18N
			}
			OPMClient.HomeDetailsController.drillDownWidgetName = widgetName;
			var snapshotName = (this.selectedNode.isInterface)?"FlowInterface":"FlowDevice"; //NO I18N
			opmGlobalRoute.transitionTo("Inventory.Device", snapshotName, this.selectedNode.nfaID); //NO I18N
			OPMClient.InventoryNFAController.set("snapshotBckBtn", true); //NO I18N
		},
		exportFlow:function() {
			nfa_changeColOpt(deviceBasicDetails.collectorID);
			OPMClient.SettingsNFAConfigController.flowExportIP = this.selectedNode.ip;
			opmGlobalRoute.transitionTo("Settings.Discovery.ExportFlow"); //NO I18N
		},
		addToNCM:function() {
			OPMClient.InventoryNFAController.set("isFromNetworkMap", true); //NO I18N
			opmGlobalRoute.transitionTo("Inventory.Device.AddToNCM", "FlowDevice", deviceBasicDetails.deviceName); //NO I18N
		},
		addToSPM:function() {
			addSwitchfromSPM(this.selectedNode.ip);
		},
		rediscoverMap:function(enableARP) {
			var callBckFunc = function(response, self) {
				if(response.error) {
					showMessage(response);
				}
				self.getNetworkMap();
			}
			this.set("showLoading", true); //NO I18N
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfadevice/addL2MapForNFADevice", {"RouterIP":this.ipAddress,"rediscoverMap":true,"enableARP":enableARP}, callBckFunc, this); //NO I18N
		},
		fitMapToScreen:function(flag) {
			if(!flag) {
				this.set("isFitMapToScreen", !this.isFitMapToScreen); //NO I18N
			}
			if(this.isFitMapToScreen || flag) {
				this.nfaNetworkMap.fit({
					nodes:[], // Fit all nodes
					animation: {
						duration:1000,
						easingFunction:"easeInOutQuad" //NO I18N
					}
				});
				this.set("fitToMapIconTitle", Ember.I18n.t("webclient.tab.reset")); //NO I18N
			}else {
				this.nfaNetworkMap.moveTo({scale:1, position:{x:0,y:0}, offset:{x:0,y:0}});
				this.set("fitToMapIconTitle", Ember.I18n.t("webclient.rackview.fittoscreen")); //NO I18N
			}
		},
		zoomMap:function(value) {
			this.nfaNetworkMap.moveTo({scale:this.nfaNetworkMap.getScale()+value});
			this.storeNetworkMapValues();
		},
		mapZoomIn:function() {
			this.send("zoomMap", 0.1); //NO I18N
		},
		mapZoomOut:function() {
			this.send("zoomMap", -0.1); //NO I18N
		}
	},
	willDestroyElement:function() {
		this.updateNetworkMapValues();
		delete OPMClient.SettingsNFAConfigController.flowExportIP;
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaPortViewComponent = Ember.Component.extend({
	templateName:"components/nfa-port-view", //NO I18N
	classNames:["DIGG-Charts","DIGG-Time"], //NO I18N
	showCount:3,
	didInsertElement: function() {
		this.set("hideShowMoreLink",(this.portDetails.length<=this.showCount)); //NO I18N
		this.set("showMoreLink",true); //NO I18N
		nfa_customTooltip("#nfaPortView",".opmToolTipDesc"); //NO I18N
	},
	getPorts:function() {
		var portsArray = jQuery.extend([],this.portDetails);
		if(this.showMoreLink) {
			portsArray = portsArray.splice(0,this.showCount);
		}
		this.set("portsArray",portsArray); //NO I18N
	}.observes("showMoreLink"), //NO I18N
	actions:{
		showMore:function(value) {
			this.set("showMoreLink",value); //NO I18N
		}
	},
	willDestroyElement:function(){
		$(".opmToolTipDescBar").remove(); //NO I18N
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.OpmNfaAttacksSummaryComponent = Ember.Component.extend({
	templateName: "components/nfa-attacks-summary",
	classNames:['AttacksSummary'],
	didInsertElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar({
			axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.AttacksSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		});
		var jsonData = this.get('widgetData.apiData');//NO I18N
		$('#nameOnly').attr('title',jsonData.eSummary.EventMsg).text(jsonData.eSummary.EventMsg); //NO I18N
		var self = this;
		self.set('summaryArr',{});
		self.set('donutArr',[]);//NO I18N
		self.set('dialArr',[]);//NO I18N
		self.set('status',{});//No I18N

		//Constructing Attack Details
		var resultArr = convertArraytoObject(jsonData.esumList);
		self.set('summaryArr',resultArr);
		var status={};
		status.title = jsonData.eSummary.Severity;
		var tempSeverityObj={"Info":5,"Warning":2,"Major":3,"Critical":1} //No I18N
		status.severity = 'icon-status'+tempSeverityObj[jsonData.eSummary.Severity];
		self.set('status',status);

		//Constructing Occupancy
		var srcOccupency=(jsonData.SepCount/jsonData.SepTot) *100;
		var desOccupency=(jsonData.DepCount/jsonData.DepTot) *100;
		var temp = {};
		var dialDetails = getFormattedDialDetails(srcOccupency);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'srcOccupency_div';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'srcOccupency_div';//NO I18N
		temp.dialColor = dialDetails.dialColor;	//No I18N
		temp.iconTitle = Ember.I18n.t('webclient.nba.attacks.srcoccupancy',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		var dialDetails = getFormattedDialDetails(desOccupency);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'dstOccupency_div';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'dstOccupency_div';//NO I18N
		temp.dialColor = dialDetails.dialColor;	//No I18N
		temp.iconTitle = Ember.I18n.t('webclient.nba.attacks.dstoccupancy',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N

		//Constructing Donut for IP and Port
		temp = {};
		temp.snapHolderId = 'sourceSpan_div';//No I18N
		temp.chartDataValues = [[Ember.I18n.t('pdf.SrcIP',this),jsonData.SipCount],[Ember.I18n.t('pdf.SrcPort',this),jsonData.SportCount]];
		self.get('donutArr').pushObject(temp);//NO I18N
		temp = {};
		temp.snapHolderId = 'dstSpan_div';//No I18N
		temp.chartDataValues = [[Ember.I18n.t('pdf.DstnIP',this),jsonData.DipCount],[Ember.I18n.t('pdf.DstPort',this),jsonData.DportCount]];
		self.get('donutArr').pushObject(temp);//NO I18N
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmIPGroupSummaryComponent = Ember.Component.extend({
	templateName: "components/nfa-ipgroup-summary",
	classNames:['com_IPGroupSummary'],
	didInsertElement: function(){
		// $('.DIGmCustomScroll > div').mCustomScrollbar({
		// 	axis:'y',scrollButtons:{enable:true},theme:'light-thick',scrollbarPosition:'outside',setHeight:$('.com_IPGroupSummary .DIGmCustomScroll').closest('.grid-stack-item').height()-70,advanced:{updateOnContentResize: false,updateOnImageLoad: false} // No I18N
		// });
		var jsonData = this.get('widgetData.apiData');//NO I18N
		var self = this;
		self.set('summaryArr',{});
		self.set('speedArr',[]);//NO I18N
		self.set('dialArr',[]);//NO I18N

		//Constructing NFA IpGroup Summary
		var summaryArr = {};
		summaryArr.Name = jsonData.traffic[0].Name;
		summaryArr.speed = jsonData.traffic[0].speed;
		if(jsonData.traffic[0].desc != undefined)
		{
			summaryArr.isIpGrp =true;
			summaryArr.desc = jsonData.traffic[0].desc;
			summaryArr.bandwidth = jsonData.traffic[0].bandwidth;
		}
		self.set('summaryArr',summaryArr);

		//Constructing Speed Dials
		var temp = {};
		temp.value = jsonData.traffic[0].IN;
		temp.snapHolderId = 'responseTimeDiv';//NO I18N
		temp.iconTitle = Ember.I18n.t('NFAWidget.speedin',this);//NO I18N
		self.get('speedArr').pushObject(temp);
		temp = {};
		temp.value = jsonData.traffic[0].OUT;
		temp.snapHolderId = 'responseTimeDiv';//NO I18N
		temp.iconTitle = Ember.I18n.t('NFAWidget.spdout',this);//NO I18N
		self.get('speedArr').pushObject(temp);//NO I18N

		//Constructing Utilization and alerts Dial
		temp = {};
		var dialDetails = getFormattedDialDetails(jsonData.traffic[0].UtilIN);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'util_in_div';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'util_in_div';//NO I18N
		temp.dialColor = dialDetails.dialColor;	//No I18N
		temp.iconTitle = Ember.I18n.t('NFAWidget.utilin',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		dialDetails = getFormattedDialDetails(jsonData.traffic[0].UtilOUT);
		temp.value = dialDetails.dialValue;
		temp.dialValue = dialDetails.dialValue;
		temp.dialDivName = 'util_out_div';
		temp.dialType = 'meter';//NO I18N
		temp.snapHolderId = 'util_out_div';//NO I18N
		temp.dialColor = dialDetails.dialColor;	//No I18N
		temp.iconTitle = Ember.I18n.t('NFAWidget.utilout',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
		temp = {};
		temp.value = jsonData.traffic[0].alert;
		temp.snapHolderId = 'responseTimeDiv';//NO I18N
		temp.iconTitle = Ember.I18n.t('webclient.devices.details.alarm',this);//NO I18N
		self.get('dialArr').pushObject(temp);//NO I18N
	},
	willDestroyElement: function(){
		$('.DIGmCustomScroll > div').mCustomScrollbar("destroy");
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmDeviceTrafficComponent = Ember.Component.extend({
	templateName: "components/nfa-cbqos-graph", //NO I18N
	classNames:['width100','heightAuto'],
	didInsertElement: function(){
		var self = this;
		var currentWidgetData = this.get('widgetData');
		var apiResponse = currentWidgetData.apiData;
		var graphTableData = currentWidgetData.snapshotData.graphTableData;
		var isNoData = !currentWidgetData.ondemandWidget;
		var sizeyVal = 2;

		var graphData = (apiResponse.devTraffic !== undefined) ? apiResponse.devTraffic : apiResponse.graphData;

		if(graphData !== undefined && graphData.length !== 0) {
			var graphParams = {};
			graphParams.id = 'PerfGraph'+currentWidgetData.id;
			graphParams.data = graphData;
			graphParams.xAxis = Ember.I18n.t('NFAWidget.Time'); //No I18N
			graphParams.graphType = 'area';//No I18N
			graphParams.grapPlotType = (currentWidgetData.grapPlotType == undefined)?'area':currentWidgetData.grapPlotType; //No I18N
			graphParams.isNFATimeSeriesGraph = true;
			graphParams.hAlign = "right"; //NO I18N
			graphParams.vAlign = "top"; //NO I18N
			if(currentWidgetData.name === "nfa.widget.flowDetails"){ //NO I18N
				graphParams.yAxis = apiResponse.YAxis;
				graphParams.graphTitle = apiResponse.flowGranularity;
			}else{
				graphParams.yAxis = nfa_getYAxisString(apiResponse.YAxis);
				graphParams.graphTitle = apiResponse.granularity;
			}
			if(!this.snapshotObj.shortSummary && currentWidgetData.snapshotData!==undefined && currentWidgetData.snapshotData.isTrafficZoomEnabledGraph!==undefined) {
				nfa_getZoomGraphEvents(graphParams, self);
			}
			self.set('graphParams',graphParams);

			var tempArr=[];
			if(currentWidgetData.name === "nfa.widget.flowDetails"){ //NO I18N
				var tableDataArr;
				if(apiResponse.averageReceivedFlow !== undefined){
					tableDataArr = [apiResponse.averageReceivedFlow, apiResponse.lastReceivedFlow];
					graphTableData.colNamesList = ["nfa.average.receivedFlow", "nfa.last.receivedFlow"]; //NO I18N
				}else{
					tableDataArr = [apiResponse.averageDroppedFlow, apiResponse.lastDroppedFlow];
					graphTableData.colNamesList = ["nfa.average.droppedFlow", "nfa.last.droppedFlow"]; //NO I18N
				}
				tempArr.push(tableDataArr);
			}else{
				tempArr.push([apiResponse.max,apiResponse.avgSpeed,apiResponse.volume]);
			}
			var sendObj = {};
			sendObj.gridId = 'opm_grapTbl'+currentWidgetData.id; //No I18N
			sendObj.data = tempArr;
			sendObj.defaultOptions = {};
			sendObj.colModels = graphTableData.colModelList;
			sendObj.colNames = graphTableData.colNamesList;
			sendObj.onSelectFunction = 'opm_grapTblTest';
			validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
			self.set('detailedData',sendObj); //No I18N
			isNoData = false;
			sizeyVal = (window.OPM.isNewSnapshotPage)?21:16;
		}
		self.set("widgetData.noData",isNoData); //NO I18N
		self.set("widgetData.sizey",sizeyVal); //NO I18N
		if(currentWidgetData.reloadWidget) {
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
		}
	},
	willDestroyElement:function() {
		nfa_resetZoomGraphValues();
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmInterfaceTrafficComponent = Ember.Component.extend({
	templateName: "components/nfa-cbqos-graph", //No I18N
	classNames:['width100','heightAuto'],
	didInsertElement: function(){
		var self = this;
		var widgetData = this.get("widgetData"); //NO I18N
		var nfaExpandView = (widgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
		var isNoData = !widgetData.ondemandWidget;
		var sizeyVal = 2;

		if(widgetData.apiData.dataset != undefined) {
			if(widgetData.apiData.dataset.length!=0) {
				self.set("graphParams",{ //NO I18N
					id : "PerfGraph"+widgetData.id, //NO I18N
					data : widgetData.apiData.dataset,
					xAxis : Ember.I18n.t("NFAWidget.Time"), //NO I18N
					yAxis : nfa_getYAxisString(widgetData.apiData.yaxis),
					graphType : "area", //NO I18N
					grapPlotType : (widgetData.grapPlotType==undefined)?"area":widgetData.grapPlotType, //NO I18N
					isNFATimeSeriesGraph : true,
					hAlign:"right", //NO I18N
					vAlign:"top", //NO I18N
					graphTitle: widgetData.apiData.granularity
				});
				isNoData = false;
				sizeyVal = (window.OPM.isNewSnapshotPage)?21:14;
			}
		}

		if(widgetData.apiData.resultdata != undefined) {
			if(widgetData.apiData.resultdata.length!=0) {
				var sendObj = {
					gridId : "opm_grapTbl"+widgetData.id, //NO I18N
					data : widgetData.apiData.resultdata,
					colModels : widgetData.snapshotData.colModelList,
					colNames : widgetData.snapshotData.colNamesList,
					onSelectFunction : widgetData.snapshotData.onselectfunction,
					defaultOptions : {
						minRowsPerPage : (nfaExpandView)?50:10
					},
					showAll : (widgetData.apiData.resultdata.length>10 && !nfaExpandView)
				};
				if(self.snapshotObj.isNFGDevice){
					sendObj.colModels[2].hidden = true;
				}
				validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
				self.set('detailedData',sendObj); //No I18N
				$('#widgetElement_'+widgetData.id+' .multipleJqGrid').addClass('nfaIntfTrafficWidget');
				isNoData = false;
				var noOfRecords = widgetData.apiData.resultdata.length;
				sizeyVal = (nfaExpandView)?(sizeyVal+widgetData.apiData.resultdata.length):(window.OPM.isNewSnapshotPage)?21:14;
			}
		}
		self.set("widgetData.noData",isNoData); //NO I18N
		self.set("widgetData.sizey",sizeyVal); //NO I18N
		if(widgetData.reloadWidget) {
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1);
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);
		}
	},
	actions: {
		subChildActions: function(functionType, functionName) {
			this.sendAction('action',functionType,functionName);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNFAGraphTableComponent = Ember.Component.extend({
	templateName: "components/nfa-cbqos-graph",
	classNames:['width100','heightAuto'],
	didInsertElement: function(){
		var widgetData = this.get("widgetData");
		var type = $("input[name='tablegridviewtype_"+widgetData.id+"']:checked").val();
		var typeOFGraph = $('#param_'+widgetData.id+'_TypeOFGraph').val();
		var nfaExpandView = (widgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
		var isNoData = !widgetData.ondemandWidget;
		var sizeyVal = 2;

		type = (type!=undefined)?type:"Chart"; //NO I18N

		if(widgetData.apiData.qosStatus) {
			if(type == 'Chart' || nfaExpandView) {
				var graphParams = {};
				graphParams.graphType = 'area'; //No I18N
				graphParams.xAxis = Ember.I18n.t('NFAWidget.Time'); //No I18N
				graphParams.isNFATimeSeriesGraph = true;
				graphParams.hAlign = "right"; //NO I18N
				graphParams.vAlign = "top"; //NO I18N
				graphParams.grapPlotType = (widgetData.grapPlotType==undefined)?"area":widgetData.grapPlotType; //No I18N

				if(typeOFGraph === "queue") {
					this.set('graphParams',[]); //No I18N
					if(widgetData.apiData.GraphData.length!=0) {
						graphParams.id = 'PerfGraph1'+widgetData.id;
						graphParams.data = widgetData.apiData.GraphData;
						graphParams.yAxis = nfa_getYAxisString(widgetData.apiData.yAxis);
						this.set('graphParams',graphParams); //No I18N
						sizeyVal = (window.OPM.isNewSnapshotPage)?21:14;
						isNoData = false;
					}
				}else {
					this.set('graphArray',[]); //NO I18N
					if(widgetData.apiData.preDS!=undefined && widgetData.apiData.preDS.length!=0) {
						graphParams.id = 'PerfGraph1'+widgetData.id+'_pre'; //NO I18N
						graphParams.data = widgetData.apiData.preDS;
						graphParams.yAxis = nfa_getYAxisString(widgetData.apiData.preyAxis);
						graphParams.graphTitle = Ember.I18n.t('webclient.nfa.cbqos.prepolicy'); //NO I18N
						graphParams.graphStyle = 'graphWidget cbqosTriGraph'; //NO I18N
						this.get('graphArray').pushObject(jQuery.extend({},graphParams));

						graphParams.id = 'PerfGraph1'+widgetData.id+'_post'; //NO I18N
						graphParams.data = widgetData.apiData.postDS;
						graphParams.yAxis = nfa_getYAxisString(widgetData.apiData.postyAxis);
						graphParams.graphTitle = Ember.I18n.t('webclient.nfa.cbqos.postpolicy'); //NO I18N
						this.get('graphArray').pushObject(jQuery.extend({},graphParams));

						graphParams.id = 'PerfGraph1'+widgetData.id+'_drop'; //NO I18N
						graphParams.data = widgetData.apiData.dropDS;
						graphParams.yAxis = nfa_getYAxisString(widgetData.apiData.dropyAxis);
						graphParams.graphTitle = Ember.I18n.t('webclient.nfa.cbqos.dropped'); //NO I18N
						graphParams.graphStyle = 'graphWidget cbqosTriCenterGraph';//NO I18N
						this.get('graphArray').pushObject(graphParams);
						isNoData = false;
						sizeyVal = (window.OPM.isNewSnapshotPage)?42:24;
					}
				}
			}

			if(type == 'NFASubGrid' || nfaExpandView) {
				var colNamesList=widgetData.snapshotData.colNamesList;
				var colModelList=widgetData.snapshotData.colModelList;
				var onselectfunction=widgetData.snapshotData.onselectfunction;
				var isColModelList1=false;
				var subGrid=true;

				isColModelList1 = (typeOFGraph === "queue"); //NO I18N
				subGrid=!isColModelList1;

				if(isColModelList1) {
					colNamesList=widgetData.snapshotData.colNamesList1;
					colModelList=widgetData.snapshotData.colModelList1;
					onselectfunction='';
				}
				validateGridColumnDetails(colModelList,colNamesList);
				validateGridColumnDetails(widgetData.snapshotData.subgrid.colModelList,widgetData.snapshotData.subgrid.colNamesList)

				var tableData=[];
				if(widgetData.apiData.tableData!=undefined){
					tableData = widgetData.apiData.tableData;
				}
				if(tableData.length!=0) {
					var sendObj = {
						gridId : "opm_DeviceSnapList"+widgetData.id, //NO I18N
						data : tableData,
						showAll : (tableData.length>10 && !nfaExpandView),
						colModels : colModelList,
						colNames : colNamesList,
						onSelectFunction : onselectfunction,
						defaultOptions : {
							minRowsPerPage: nfaExpandView?50:10,
							isSnapshotGrid: true,
							snapId: widgetData.id,
							reload: false,
							pagination: nfaExpandView,
							colNamesList1:widgetData.snapshotData.subgrid.colNamesList,
							colModelList1:widgetData.snapshotData.subgrid.colModelList,
							subGridFunction:widgetData.snapshotData.subgrid.subGridFunction,
							onselectfunction:widgetData.snapshotData.subgrid.onselectfunction,
							Data:(widgetData.apiData.loc !== undefined)?widgetData.apiData.loc.location:(widgetData.apiData.result!== undefined)?widgetData.apiData.result:tableData,
							subGrid:subGrid
						}
					};
					sizeyVal = (nfaExpandView)?(sizeyVal+12):(window.OPM.isNewSnapshotPage)?20:12;
					isNoData = false;
					this.set('showDetailedGrid',true); //NO I18N
					this.set('detailedData',sendObj); //NO I18N
				}
			}
		}
		this.set('widgetData.sizey',sizeyVal); //NO I18N
		this.set('widgetData.noData', isNoData); //NO I18N
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //NO I18N
	},
	actions: {
	  	subChildActions: function(functionType, functionName) {
	  		this.sendAction('action',functionType,functionName);
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

OPMClient.OpmApplicationComponent = Ember.Component.extend({
	templateName:"components/opm-pie-table", //NO I18N
	classNames:["width100", "heightAuto"], //NO I18N
	didInsertElement:function() {
		var isAppReport = ($("#param_"+this.widgetData.id+"_ReportType").val()==="topApp"); //NO I18N
		var colI18nKey, chartData=[];
		if(this.widgetData.apiData!==undefined) {
			if(isAppReport) {
				chartData = this.widgetData.apiData.topApp;
				colI18nKey = "NFAWidget.App"; //NO I18N
			}else {
				chartData = this.widgetData.apiData.topProt;
				colI18nKey = "NFAWidget.proto"; //NO I18N
			}
		}
		if(chartData && chartData.length!==0) {
			var colNamesList = ["", Ember.I18n.t(colI18nKey), "", "", Ember.I18n.t("NFAWidget.trfc")]; //NO I18N
			var colModelList = [
				{ name:"colorBar",	index:"colorBar",	width:5,	sortable:false, formatter:nfaDeviceRepFormatter}, //NO I18N
				{ name:"name",		index:"name",		width:50,	sortable:false}, //NO I18N
				{ name:"chart",		index:"chart",		formatter:appPercentageFormatter}, //NO I18N
				{ name:"percentage",index:"percentage",	hidden:true}, //NO I18N
				{ name:"traffic",	index:"traffic",	width:30,	sortable:false} //NO I18N
			];
			//this.set("widgetData.sizey", (window.OPM.isNewSnapshotPage)?25:23); //NO I18N
			this.set("widgetData.sizey", (window.OPM.isNewSnapshotPage) ? Math.max((chartData.length > 6) ? 23 : 20, 5 + Math.ceil(chartData.length * 1.5)) : 23); //NO I18N
			this.set("widgetData.noData", false); //NO I18N

			var multiData = [];
			var pieTableData = [];
			for(var i=0; i<chartData.length; i++) {
				var obj = {
					"name": chartData[i][0], //NO I18N
					"chart": chartData[i][2], //NO I18N
					"percentage": chartData[i][2]+" %", //NO I18N
					"traffic": chartData[i][1] //NO I18N
				};
				pieTableData.push(obj);
				var arr = [
					chartData[i][0]+" : "+chartData[i][1], //NO I18N
					chartData[i][2]
				];
				multiData.push(arr);
			}
			var pieParams = {
				"id":"perfGraph1"+this.widgetData.id, //NO I18N
				"data":multiData, //NO I18N
				"graphType":"pie" //NO I18N
			};
			this.set("graphParams", pieParams); //NO I18N

			var tableParams = {};
			tableParams.className = "opm_jqGridUI opmReportsGridview nfa"; //NO I18N
			tableParams.gridId = "opm_App_Legend"+this.widgetData.id; //NO I18N
			tableParams.data = pieTableData;
			tableParams.defaultOptions = {pagination:false,hideCSV:true,hideExcel:true,Search:false,minRowsPerPage:11};
			tableParams.colNames = colNamesList;
			tableParams.colModels = colModelList;
			this.set("gridData", tableParams); //NO I18N
		}else {
			if(this.widgetData.ondemandWidget) {
				this.set("widgetData.noData", false); //NO I18N
			}else {
				this.set("widgetData.noData", true); //NO I18N
			}
			this.set("widgetData.sizey", 2); //NO I18N
		}
		if(this.widgetData.reloadWidget) {
			this.set("snapshotObj.currentCount", this.snapshotObj.currentCount-1); //NO I18N
			this.set("snapshotObj.currentCount", this.snapshotObj.currentCount+1); //NO I18N
		}
	},
	willDestroyElement:function() {
		$("#"+this.elementId).find("*").remove();
	}
});

OPMClient.OpmConversationComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",//No I18N
	classNames:['width100','heightAuto'],//No I18N
	didInsertElement: function(){
		var self = this;
		this.set('showDetailedGraph',false);

		var widgetData = this.get('widgetData');
		var type = $("input[name='tablegridviewtype_"+widgetData.id+"']:checked").val();
		if(!type){type='chart'}
		widgetData.isNFAGeoLocation = false;

		var isNFAMACAddressView = ['opm.interface.topsource', 'opm.interface.topdest'].indexOf(widgetData.name) > -1 && $("#param_"+widgetData.id+"_isMacAddress").prop("checked"); //NO I18N

		if(['opm.interface.topsource','opm.interface.topdest','nfa.meraki.src','nfa.meraki.dst'].contains(widgetData.name)) { //No I18N
			widgetData.isNFAGeoLocation = $("#param_"+widgetData.id+"_isLocation").is(':checked');
			setHiddenColumn(widgetData.snapshotData.colModelList,["modifyDNS"], (!window.OPM.isAdministrator || $("#param_"+widgetData.id+"_isNetwork").prop("checked") || $("#param_"+widgetData.id+"_ResolveDNS").prop("checked") || isNFAMACAddressView || window.OPM.isCentralServer || window.OPM.isMSPAllCustomerOrAllProbeSelected)); //NO I18N
		}

		if (isNFAMACAddressView) {
			//Hiding IP type select box
			$("#param_"+widgetData.id+"_IPType").closest(".selBox").hide(); //NO I18N
			//Hiding One click schedule option
			$("#widgetElement_"+widgetData.id+" .inventoryWidgetIcons .icon-stopwatch").attr("style", "display: none !important"); //NO I18N
		}

	  	var nfaExpandView = (widgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
	  	var isDSCPAppView = (nfaExpandView && widgetData.name === "opm.interface.topqos" && $("#param_"+widgetData.id+"_showapp").is(':checked')); //NO I18N

	  	if(widgetData.name === "opm.interface.topqos" && !nfaExpandView) { //NO I18N
	  		$("#param_"+widgetData.id+"_showapp").parent().parent().hide(); //NO I18N
	  	}

	  	var reportType = ""; //NO I18N
		if(widgetData.apiData.reportType != undefined){
			reportType = widgetData.apiData.reportType;
		}else if(widgetData.apiData.devDetails != undefined && widgetData.apiData.devDetails.Type != undefined){
			reportType = widgetData.apiData.devDetails.Type;
		}

	  	if(isDSCPAppView){
	  		this.set("widgetData.expandView",true); //NO I18N
	  		this.set('showNFASubGrid',true); //NO I18N
	  	}else if((widgetData.isNFAGeoLocation && nfaExpandView) || (widgetData.isNFAGeoLocation && type == 'Grid')) { //NO I18N
	  		this.set('showNFASubGrid',widgetData.isNFAGeoLocation);//NO I18N
	  	}
	  	else if(type == 'Chart' && !OPMClient.ApplicationController.isNeedSnapShotTabSubMenus)
		{
			var onSelectFunction=(widgetData.snapshotData.onselectfunction!==undefined)?widgetData.snapshotData.onselectfunction:'opm_App_Legend';//No I18N
			var resultData;
			if(widgetData.snapshotData.additionaldata.data != undefined){
				resultData=widgetData.apiData[widgetData.snapshotData.additionaldata.data];
			}else{
				resultData=widgetData.apiData.result;
			}
			var rowClasses='pointer'; //No I18N

			if(widgetData.isNFAGeoLocation && widgetData.apiData.loc !== undefined) {
				resultData=widgetData.apiData.loc.result;
				rowClasses=onSelectFunction=''; //No I18N
			}

			if(resultData!=undefined && resultData.length!=0)
			{
				var colNames = ['',Ember.I18n.t(widgetData.snapshotData.additionaldata.keyName,this),'','',Ember.I18n.t('NFAWidget.trfc',this)];//No I18N
				var colModel =	[
					{ name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter},
					{ name: 'Name', index:'Name', classes:rowClasses, width:50, sortable: false}, //No I18N
					{ name: 'trafficVal', index:'trafficVal', classes:rowClasses, formatter: appPercentageFormatter}, //No I18N
					{ name: 'traffic', index:'traffic', hidden: true}, //No I18N
					{ name: 'volume', index: 'volume', classes:rowClasses, width:30, sortable: false}// No I18N
				];

				if(widgetData.apiData.reportType != undefined){
					if(widgetData.apiData.reportType == "topHost"){
						colNames[1] = Ember.I18n.t("webclinet.inventory.wlc.clientmac"); //NO I18N
					}else if(widgetData.apiData.reportType == "topIPHost"){ //NO I18N
						colNames[1] = Ember.I18n.t("NFAWidget.CliIP"); //NO I18N
					}
					if(["topApp", "topDSCP"].contains(widgetData.apiData.reportType)){
						colNames.push(""); //NO I18N
						colModel.push({name: 'valueID', index:'valueID', hidden: true}); //NO I18N
					}
				}

				for(var i = 0; i < widgetData.snapshotData.colModelList.length; i++) {
					if(widgetData.snapshotData.colModelList[i].hidden == true || widgetData.snapshotData.colModelList[i].hidden == 'true') { //No I18N
						colNames.push(''); // No I18N
						colModel.push(widgetData.snapshotData.colModelList[i]);
					}
				}

				var multiData = new Array();
				var gridData = new Array();
				if (resultData != null) {
					for (var indexx = 0; indexx < resultData.length; indexx++) {
						var array_element = resultData[indexx];
						var arr = new Array();
						if(array_element[0] != undefined && array_element[1] != undefined && array_element[2] != undefined){
							var obj = {};
							obj.Name=array_element[0];
							obj.trafficVal=array_element[2];
							obj.traffic=array_element[2]+" %";
							obj.volume=array_element[1];
							if(array_element[3] != undefined){
								obj.valueID = array_element[3];
							}
							gridData.push(obj);

							arr.push(array_element[0]+" : "+array_element[1]);
							arr.push(array_element[2]);
						}else{
							array_element.trafficVal = Number(array_element.traffic.split(" ")[0]);
							arr.push(array_element.Name+" : "+array_element.volume);
							arr.push(array_element.trafficVal);
						}
						multiData.push(arr);
					}
				}

				var graphParams = {};
				graphParams.id = 'perfGraph1'+widgetData.id;
				graphParams.data = multiData;
				graphParams.graphType = 'pie';//No I18N
				this.set('graphParams',graphParams);

				var sendObj = {};
				sendObj.gridId = 'opm_App_Legend'+widgetData.id;
				sendObj.data = (gridData.length == 0) ? resultData : gridData;
				sendObj.defaultOptions = {sortName:'PERCENTAGE',sortOrder:'desc',snapId:widgetData.id,pagination:false,hideCSV:true,hideExcel:true,Search:false,minRowsPerPage:11,reportType:reportType}; //NO I18N
				//sendObj.defaultOptions = {sortName: 'PERCENTAGE',sortOrder: 'desc',snapId:widgetData.id,pagination:false,minRowsPerPage:11, reportType:reportType}; //NO I18N
				sendObj.colModels = colModel;
				sendObj.colNames = colNames;
				sendObj.onSelectFunction = onSelectFunction;
				this.set('gridData',sendObj);
				self.set('widgetData.noData',false);
				//self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?21:14);//No I18N
				var pieSizey = (sendObj.data.length > 6) ? 20 : 17;
				var tableSizey = 5 + Math.ceil(sendObj.data.length * 1.5);
				self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage) ? Math.max(pieSizey, tableSizey) : 14);//No I18N
			}
			else {
				self.set('widgetData.noData',!self.get('widgetData.ondemandWidget')); //NO I18N
				self.set('widgetData.sizey',2);
			}
		}

		if((type == 'Grid' || nfaExpandView) && !isDSCPAppView)
		{
			var tableData=[];
			if(widgetData.snapshotData.additionaldata.data != undefined && widgetData.apiData[widgetData.snapshotData.additionaldata.data] != undefined){
				tableData = widgetData.apiData[widgetData.snapshotData.additionaldata.data];
			}else if(widgetData.apiData.result != undefined){
				tableData = widgetData.apiData.result;
			}
			var gridData = new Array();
			if(tableData.length!=0)
			{
				if(deviceBasicDetails.snapType === "FlowInterface" && ["opm.interface.topsource","opm.interface.topdest"].indexOf(widgetData.name) > -1) { //NO I18N
					//CIDR column is added/removed based on isNetwork and first column data
					if($("#param_"+widgetData.id+"_isNetwork").prop("checked") && window.OPM.isAdministrator && tableData[0].Name !== undefined && (tableData[0].Name === "0.0.0.0/0" || tableData[0].Name === "::/0") && widgetData.snapshotData.colModelList[1].name !== "cidr") { //NO I18N
						widgetData.snapshotData.colModelList.splice(1, 0, {name: "cidr", index: "cidr", classes: "pointer", sortable: false, search: false, formatter: function(cellvalue, options, rowObject) {return (rowObject.Name === "0.0.0.0/0" || rowObject.Name === "::/0")? "<i class='opm_link underlineLink' onclick='nfa_enableAutoCIDR(true,true)'>"+Ember.I18n.t("nfa.autocidr.enable")+"</i>" : ""}}); //NO I18N
						widgetData.snapshotData.colNamesList.splice(1, 0, ""); //NO I18N
					}else if(widgetData.snapshotData.colModelList[1].name === "cidr") { //NO I18N
						widgetData.snapshotData.colModelList.splice(1, 1);
						widgetData.snapshotData.colNamesList.splice(1, 1);
					}
					//Pointer class is removed/added when CIDR is enabled/disabled
					for(var j=0,colModelLength=widgetData.snapshotData.colModelList.length; j<colModelLength; j++) {
						if(["Name","volume","traffic"].indexOf(widgetData.snapshotData.colModelList[j].name) > -1) { //NO I18N
							widgetData.snapshotData.colModelList[j].classes = (deviceBasicDetails.isCIDREnabled && $("#param_"+widgetData.id+"_isNetwork").prop("checked")) ? "" : "pointer"; //NO I18N
						}
					}
				}

				for (var indexx = 0; indexx < tableData.length; indexx++) {
					var array_element = tableData[indexx];
					if(array_element[0] != undefined && array_element[1] != undefined && array_element[2] != undefined){
						var obj = {};
						obj.Name=array_element[0];
						obj.trafficVal=array_element[2];
						obj.traffic=array_element[2]+" %";
						obj.volume=array_element[1];
						if(["wlc.ssidgroup.accesspoint", "nfa.wlcsnap.apmac"].contains(widgetData.name)){ //NO I18N
							obj.apMac = array_element[3];
						}else if(array_element[3] != undefined){
							obj.valueID = array_element[3];
						}
						gridData.push(obj);
					}
				}

				var sendObj = {};
				sendObj.className = "opm_jqGridUI opmReportsGridview nfa"; //NO I18N
				sendObj.gridId = 'opm_DeviceSnapList'+widgetData.id; //No I18N
				sendObj.data = (gridData.length == 0) ? tableData : gridData;
				sendObj.defaultOptions = {};
				sendObj.defaultOptions = {
					minRowsPerPage: (nfaExpandView)?50:10,
					isSnapshotGrid: true,
					snapId: widgetData.id,
					snapIndex:widgetData.snapIndex,
					reload: false,
					pagination:widgetData.expandView,
					reportType:reportType
				};
				sendObj.showAll = (tableData.length>10 && !nfaExpandView);
				sendObj.colModels = widgetData.snapshotData.colModelList;
				sendObj.colNames = widgetData.snapshotData.colNamesList;
				sendObj.onSelectFunction = (widgetData.snapshotData.onselectfunction!=undefined)?widgetData.snapshotData.onselectfunction:'';
				sendObj.nfaCustomPagerDetails = (widgetData.nfaCustomPagerDetails !== undefined)?getNFACustomPagerDetails(widgetData):false;
				validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
				this.set('showDetailedGraph',true);
				this.set('detailedData',sendObj);
				self.set('widgetData.noData',false);
				//self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?21:14);//No I18N
				self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage) ? Math.max(10, 5 + Math.ceil(sendObj.data.length * 1.5)) : 14);//No I18N
			}
			else
			{
				self.set('widgetData.noData',true);
				self.set('widgetData.sizey',2);
			}
		}
		if(self.get('widgetData.reloadWidget'))
		{
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1);
			self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);
		}
	},
	actions: {
	  	subChildActions: function(functionType, functionName) {
	  		this.sendAction('action',functionType,functionName);
	  	}
	},
	willDestroyElement: function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNFADevReportComponent = Ember.Component.extend({
	templateName: "components/opm-pie-table",//No I18N
	classNames:['width100','heightAuto'],//No I18N
	didInsertElement: function(){
		var widgetData = this.get("widgetData"); //NO I18N
		var jsonData = widgetData.apiData;

		if(['opm.routers.topsource','opm.routers.topdest'].contains(widgetData.name)) { //NO I18N
			widgetData.isNFAGeoLocation = $("#param_"+widgetData.id+"_isLocation").is(':checked'); //NO I18N
			widgetData.isNFAGeoLocation ? $("#param_"+widgetData.id+"_IPType").closest(".selBox").hide() : $("#param_"+widgetData.id+"_IPType").closest(".selBox").show(); //NO I18N
		}

		var nfaExpandView = (widgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
		var isNoData = !widgetData.ondemandWidget;
		var sizeyVal = 2;

		if(jsonData !== undefined && Object.keys(jsonData).length != 0) {
			if(widgetData.isNFAGeoLocation && nfaExpandView) {
				this.set("showNFASubGrid",widgetData.isNFAGeoLocation); //NO I18N
			}else {
				var colNames = ["", Ember.I18n.t(widgetData.snapshotData.additionaldata.keyName), "", "", Ember.I18n.t("NFAWidget.trfc")]; //NO I18N
				var colModel = [
					{name:"colorBar",	index:"colorBar",	width:"3", sortable:false, formatter:nfaDeviceRepFormatter}, //NO I18N
					{name:"APP",		index:"APP",		width:"25",sortable:false}, //NO I18N
					{name:"CHART",		index:"CHART",		width:"90",sortable:false, formatter:appPercentageFormatter}, //NO I18N
					{name:"PERCENTAGE",	index:"PERCENTAGE", width:"0", sortable:false, hidden:true}, //NO I18N
					{name:"TRAFFIC",	index:"TRAFFIC",	width:"20",sortable:false} //NO I18N
				];

				var multiData=[],gridData=[];
				var isCloudUserWidget = (widgetData.name === "nfa.device.topCloud" || widgetData.name === "nfa.device.topUser"); //NO I18N

				if(widgetData.isNFAGeoLocation) {
					for(var i=0; i<jsonData.loc.result.length; i++) {
						var dataObj = jsonData.loc.result[i];
						var tPercent = Number(dataObj.traffic.split(" ")[0]); //NO I18N
						gridData.push({"APP":dataObj.Name,"CHART":tPercent,"PERCENTAGE":tPercent,"TRAFFIC":dataObj.volume}); //NO I18N
						multiData.push([dataObj.Name+" : "+dataObj.volume,tPercent]); //NO I18N
					}
				}else if(isCloudUserWidget){
					var dataKey = widgetData.snapshotData.additionaldata.data+($("input[name='Data_"+widgetData.id+"']:checked").val() === "IN" ? "Received" : "Sent"); //NO I18N
					var dataArr;
					if(widgetData.name === "nfa.device.topCloud"){ //NO I18N
						colNames.splice(2, 0, Ember.I18n.t("webclient.common.widgets.category")); //NO I18N
						colModel.splice(2, 0, {name:"CATEGORY", index:"CATEGORY", width:"20", sortable:false}); //NO I18N

						for(var i=0; i<jsonData[dataKey].length; i++){
							dataArr = jsonData[dataKey][i];
							gridData.push({"APP":dataArr[0],"CATEGORY":dataArr[1],"CHART":dataArr[3],"PERCENTAGE":dataArr[3]+" %","TRAFFIC":dataArr[2]}); //NO I18N
							multiData.push([dataArr[0]+" : "+dataArr[2],dataArr[3]]); //NO I18N
						}
					}else{
						for(var i=0; i<jsonData[dataKey].length; i++){
							dataArr = jsonData[dataKey][i];
							gridData.push({"APP":dataArr[0],"CHART":dataArr[2],"PERCENTAGE":dataArr[2]+" %","TRAFFIC":dataArr[1]}); //NO I18N
							multiData.push([dataArr[0]+" : "+dataArr[1],dataArr[2]]); //NO I18N
						}
					}
				}else {
					for(var i=0; i<jsonData[widgetData.snapshotData.additionaldata.data].length; i++) {
						var dataArr = jsonData[widgetData.snapshotData.additionaldata.data][i];
						gridData.push({"APP":dataArr[0],"CHART":dataArr[2],"PERCENTAGE":dataArr[2]+" %","TRAFFIC":dataArr[1]}); //NO I18N
						multiData.push([dataArr[0]+" : "+dataArr[1],dataArr[2]]); //NO I18N
					}
				}

				var graphParams = {};
				graphParams.id = 'perfGraph1'+widgetData.id;
				graphParams.data = multiData;
				graphParams.graphType = 'pie';//No I18N
				this.set('graphParams',graphParams); //NO I18N

				var sendObj = {};
				sendObj.className = "opm_jqGridUI opmReportsGridview nfa"; //NO I18N
				sendObj.gridId = 'opm_App_Legend'+widgetData.id; //NO I18N
				sendObj.data = gridData;
				sendObj.defaultOptions = {sortName:'PERCENTAGE',sortOrder:'desc',pagination:false,hideCSV:true,hideExcel:true,Search:false,minRowsPerPage:11}; //NO I18N
				sendObj.colModels = colModel;
				sendObj.colNames = colNames;
				sendObj.onSelectFunction = 'opm_App_Legend'; //No I18N
				this.set('gridData',sendObj); //NO I18N

				isNoData = false;
				sizeyVal = (window.OPM.isNewSnapshotPage)?25:23;
			}
		}

		this.set('widgetData.noData',isNoData); //NO I18N
		this.set('widgetData.sizey',sizeyVal); //NO I18N

		if(this.get('widgetData.reloadWidget')) {
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')-1); //NO I18N
			this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //NO I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNFASubGridComponent = Ember.Component.extend({
	templateName: "components/opm-grid",
	showGrid:false,
	didInsertElement: function() {
		var self = this;
		var widgetData = self.get("widgetData");
		var nfaExpandView = (widgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
		var jsonData = widgetData.apiData;

		if(jsonData) {
			var snapDetails = self.get('widgetData');
			var snapshotData = widgetData.snapshotData;
			var colNamesList=snapshotData.colNamesList;
			var colModelList=snapshotData.colModelList;
			var onselectfunction=snapshotData.onselectfunction;
			var isColModelList1=false;
			var subGrid=true;

			if(widgetData.name==='nfa.intf.cbqos') { //NO I18N
				isColModelList1=($('#param_'+widgetData.id+'_TypeOFGraph').val() === "queue"); //NO I18N
				subGrid=!isColModelList1;
			}
			if(widgetData.isNFAGeoLocation || isColModelList1) {
				colNamesList=snapshotData.colNamesList1;
				colModelList=snapshotData.colModelList1;
				onselectfunction=""; //NO I18N
			}
			validateGridColumnDetails(colModelList,colNamesList);
			validateGridColumnDetails(snapshotData.subgrid.colModelList,snapshotData.subgrid.colNamesList);

			var gridData = {};
			if(jsonData.resultData !== undefined) {
				gridData = jsonData.resultData;
			}else if(jsonData.loc !== undefined) {
				gridData = jsonData.loc.result;
			}else if(jsonData.tableData !== undefined) {
				gridData = jsonData.tableData;
			}else if(jsonData.result !== undefined){
				gridData = jsonData.result;
			}else if(jsonData.gridData !== undefined){
				gridData = jsonData.gridData;
			}

			var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_'+gridID).height()+30;
				// var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
				// if(cellCount===3){cellCount=4;}
				// if(window.OPM.isNewSnapshotPage){
				// 	cellCount = Math.ceil((gridH+42)/22);
				// }
				paramsObj.self.set("widgetData.sizey", 10); //NO I18N
				if(paramsObj.self.widgetData.isNFAGeoLocation!==undefined && paramsObj.self.widgetData.isNFAGeoLocation) {
					paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.snapshotObj.currentCount-1); //NO I18N
				}
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.snapshotObj.currentCount+1); //NO I18N
			};

			var defaultOptions = {};
			defaultOptions.colNamesList1 = snapshotData.subgrid.colNamesList;
			defaultOptions.colModelList1 = snapshotData.subgrid.colModelList;
			defaultOptions.subGridFunction= snapshotData.subgrid.subGridFunction;
			defaultOptions.onselectfunction= snapshotData.subgrid.onselectfunction;
			defaultOptions.Data = (jsonData.loc !== undefined)?jsonData.loc.location:(jsonData.result!== undefined)?jsonData.result :gridData;
			defaultOptions.subGrid=subGrid;
			defaultOptions.minRowsPerPage=(nfaExpandView)?50:10;
			defaultOptions.pagination=nfaExpandView;
			defaultOptions.isSnapshotGrid=true;
			defaultOptions.snapId=widgetData.id;
			defaultOptions.reloadOnExpand=true;
			defaultOptions.gridCallBack = gridCallBack;
			defaultOptions.gridCallBackParams={self:self};

			var sendObj = {};
			sendObj.className = "opm_jqGridUI opmReportsGridview nfa"; //NO I18N
			sendObj.gridId = "opm_DeviceSnapList"+widgetData.id; //NO I18N
			sendObj.pagerId = "opm_DeviceSnapPager"+widgetData.id; //NO I18N
			sendObj.data = gridData;
			sendObj.showAll = (gridData.length>10 && !nfaExpandView);
			sendObj.defaultOptions = defaultOptions;
			sendObj.colModels = colModelList;
			sendObj.colNames = colNamesList;
			sendObj.captionTitle = "";
			sendObj.gridNavigator = "";
			sendObj.onSelectFunction = onselectfunction;
			sendObj.page = "";

			if(self!==undefined && self!==null && !widgetData.ondemandWidget){
				self.set('showGrid',true);
				self.set('widgetData.noData',false);//NO I18N
				self.set('widgetData.gridDataArray',sendObj);
				self.set('tblStyle','overflow-y:auto;height:inherit !important;overflow-x:hidden;');
			}
			else{
				self.set('showGrid',false);
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//NO I18N
			}
		}else{
			if(self!==undefined && self!==null){
			    self.set('showGrid',false);//NO I18N
		    }
		}
	},
	actions: {
	  	subChildActions: function(functionType, functionName) {
	  		this.sendAction('action',functionType,functionName);
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmNFAGraphComponent = Ember.Component.extend({
	templateName: "components/opm-nfa-graph",
	showGraph: false,
	classNames:['width100','heightAuto'],
	didInsertElement:function()
	{
		var self = this;
		self.set('showDetailedGraph',false);
		self.set('showGraphTable',false);
		var currentWidgetData = this.get('widgetData');
		var apiResponse = currentWidgetData.apiData;

		var nfaExpandView = (currentWidgetData.expandView || OPMClient.ApplicationController.isNeedSnapShotTabSubMenus);
		var isNoData = !currentWidgetData.ondemandWidget;
		var sizeyVal = 2;
		var showGraphTypes = !this.get("snapshotObj.shortSummary"); //NO I18N
		var isDSCPAppView = false;
		if(currentWidgetData.name === "opm.interface.topqos") { //NO I18N
			if(!nfaExpandView) {
				$("#param_"+currentWidgetData.id+"_showapp").parent().parent().hide(); //NO I18N
			} else if($("#param_"+currentWidgetData.id+"_Type").val() === "DSCP") { //NO I18N
				isDSCPAppView = $("#param_"+currentWidgetData.id+"_showapp").is(':checked'); //NO I18N
			}else {
				$("#param_"+currentWidgetData.id+"_showapp").parent().parent().hide(); //NO I18N
			}
		}else if(currentWidgetData.name === "ssid.client.traffic") { //NO I18N
			delete apiResponse.resultdata;
		}
		if(isDSCPAppView){
			this.set('showNFASubGrid',true); //NO I18N
			return;
	  	}else if(apiResponse!=undefined && Object.keys(apiResponse).length!=0) {
			var snapshotData = currentWidgetData.snapshotData;
			var type = ($("input[name='tablegridviewtype_"+currentWidgetData.id+"']:checked").val() !=undefined)?$("input[name='tablegridviewtype_"+currentWidgetData.id+"']:checked").val():'Chart'; //No I18N
			type = (currentWidgetData.name === "opm.interface.topqos") ? "Grid" : type; //NO I18N
			var graphParams = {};
			graphParams.grapPlotType = (currentWidgetData.grapPlotType == undefined)?'area':currentWidgetData.grapPlotType; //No I18N
			graphParams.snapWidgetName = currentWidgetData.name;
			graphParams.snapId = currentWidgetData.id;
			graphParams.isNFATimeSeriesGraph = true;
			graphParams.hAlign = "right"; //NO I18N
			graphParams.vAlign = "top"; //NO I18N
			graphParams.graphTitle = (apiResponse.granularity !== undefined)?apiResponse.granularity:""; //NO I18N

			var isNFGInterfaceTraffic = false;
			if(graphParams.snapWidgetName == 'opm.interface.traffic') {
				var nfaBVTimeObj = {}
				nfaBVTimeObj.className = (this.get('snapshotObj.shortSummary'))?'timeGraphWidget notimeWidget':'timeGraphWidget';
				nfaBVTimeObj.startTime = getBVFormattedTimeFrame(OPMClient.InventoryNFAController.nfaBVStartTime).timeStr;
				nfaBVTimeObj.endTime = getBVFormattedTimeFrame(OPMClient.InventoryNFAController.nfaBVEndTime).timeStr
				self.set('nfaBVTime',nfaBVTimeObj);
				isNFGInterfaceTraffic = self.snapshotObj.isNFG;
				graphParams.showTPAnalysisBtn = (this.snapshotObj.snapType==="FlowInterface" && !this.snapshotObj.shortSummary && !window.isNFAStandardEdition); //NO I18N
			}

			if(type == 'Chart' || nfaExpandView)
			{
				var graphData = [];
				if(apiResponse.GraphData!==undefined) {
					graphData = apiResponse.GraphData;
				}else if(apiResponse.graphData!==undefined) {
					graphData = apiResponse.graphData;
				}
				if(graphData.length!=0)
				{
					//self.set('widgetData.noData',false);
					if(graphData!==undefined) {
						//self.set('widgetData.sizey',14);
						sizeyVal = (window.OPM.isNewSnapshotPage)?23:14;
						graphParams.id = 'PerfGraph'+currentWidgetData.id;
						graphParams.data = graphData;
						graphParams.xAxis = Ember.I18n.t('NFAWidget.Time'); //No I18N
						graphParams.yAxis = nfa_getYAxisString((apiResponse.yAxis==undefined?(apiResponse.YAxis==undefined?apiResponse.yaxis:apiResponse.YAxis):apiResponse.yAxis));
						graphParams.graphType = 'area';//No I18N
						if(!self.snapshotObj.shortSummary && snapshotData!==undefined && snapshotData.isTrafficZoomEnabledGraph!==undefined) {
							nfa_getZoomGraphEvents(graphParams, self);
						}
						if(["opm.interface.traffic", "nfa.cloudInterface.traffic","wlc.apmacsnap.traffic"].indexOf(currentWidgetData.name) !== -1 && apiResponse.Data.trafficdata !== undefined) {
							graphParams.showThresholdLine = true;
							graphParams.yAxisThresholdArray = nfa_getTrafficThreshold(apiResponse);
							graphParams.yAxisThresholdText=apiResponse.thresholdText;
						}
						if (["webclient.dpi.dns.topdomains", "webclient.dpi.dns.querytypes", "webclient.dpi.dns.topclients", "webclient.dpi.dns.responsecodes"].indexOf(currentWidgetData.name) !== -1) { //NO I18N
							showGraphTypes = false;
							graphParams.graphType = "pie"; //NO I18N
							graphParams.subType = "simpleDonut"; //NO I18N
							graphParams.columns = {datatype_1: "ordinal", datatype_2: "numeric", columnname_1: Ember.I18n.t("webclient.map.flash.label"), columnname_2: Ember.I18n.t("jsp.commonstr.Value")}; //NO I18N
							graphParams.notes = {enabled: true, chartValues: [{x: "customAnnotationX", y: "customAnnotationY", type: "customNote", htmlEl: "customAnnotationHTML1"}]};//NO I18N
							graphParams.legendEnabled = true;
							graphParams.hAlign = "right"; //NO I18N
							graphParams.vAlign = "center"; //NO I18N
						}
						if (["webclient.dpi.dns.responsetime", "webclient.dpi.dhcp.responsetime"].indexOf(currentWidgetData.name) !== -1) { //NO I18N
							showGraphTypes = false;
							graphParams.yAxis = graphData[0].seriesname+" ( "+apiResponse.yAxis+" )"; //NO I18N
							graphParams.legendEnabled = false;
							graphParams.showThresholdLine = true;
							graphParams.yAxisThresholdArray = apiResponse.thresholdLine !== undefined ? apiResponse.thresholdLine : [];
							graphParams.yAxisThresholdText = apiResponse.thresholdText !== undefined ? apiResponse.thresholdText : [];
						}
						if(isNFGInterfaceTraffic){
							graphParams.data = [graphParams.data[0]];
						}
						self.setProperties({'showGraph':true,'graphParams':graphParams,'showGraphTypes':showGraphTypes});//NO I18N
					}

					if(apiResponse.spdString) {
						self.set('snapMsg',apiResponse.spdString);
					}

					if(apiResponse.Data !== undefined && apiResponse.Data.showGranularity !== undefined && !apiResponse.Data.showGranularity) {
						$('#param_'+currentWidgetData.id+'_granularity').parent().parent().hide(); //No I18N
					}

					if(snapshotData != undefined)
					{
						var defaultOptions = {};
						//if((snapshotData.graphTableData != undefined && apiResponse.Data.trafficdata!=undefined) || (graphParams.snapWidgetName == "opu.bwm.traffic.inandOut" && apiResponse.Data !== undefined)) {
						if((snapshotData.graphTableData!=undefined) || (graphParams.snapWidgetName==="opu.bwm.traffic.inandOut" && apiResponse.Data!==undefined)) {
							var sendObj = {};
							if(apiResponse.trafficSummaryData!==undefined) {
								sendObj.data = apiResponse.trafficSummaryData;
							}else if(apiResponse.Data.trafficdata!==undefined) {
								sendObj.data = isNFGInterfaceTraffic ? [apiResponse.Data.trafficdata[0]] : apiResponse.Data.trafficdata;
							}
							if(["opm.interface.traffic","nfa.cloudInterface.traffic"].indexOf(currentWidgetData.name)!==-1) { //NO I18N
								var gridObj = nfa_getDevTrafficTblDetails(snapshotData.graphTableData.colNamesList,snapshotData.graphTableData.colModelList,(apiResponse.Data.showGranularity===undefined || apiResponse.Data.showGranularity),apiResponse.Data.granularity);
								snapshotData.graphTableData.colNamesList[8]= window.OPM.percentileInformation ? Ember.I18n.t("nfa.report.nthPercentail",{n:window.OPM.nfaPercentile}) : ""; //NO I18N
								snapshotData.graphTableData.colModelList[8].hidden = window.OPM.percentileInformation ? false : true;
								defaultOptions.gridCallBack = gridObj.gridCallBackFunc;
							}
							sizeyVal = (window.OPM.isNewSnapshotPage)?29:18;

							sendObj.gridId = 'opm_grapTbl'+currentWidgetData.id; //NO I18N
							sendObj.defaultOptions = defaultOptions;
							sendObj.colModels = snapshotData.graphTableData.colModelList;
							sendObj.colNames = snapshotData.graphTableData.colNamesList;
							sendObj.onSelectFunction = 'opm_grapTblTest';
							validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
							self.set('showGraphTable',true);
							self.set('gridData',sendObj);
						}else if(apiResponse.data != undefined && currentWidgetData.name != 'NFA.AppsIntf') { //NO I18N
							//self.set('widgetData.sizey',16);
							sizeyVal = (window.OPM.isNewSnapshotPage)?26:16;
							var sendObj = {};
							sendObj.gridId = 'opm_grapTbl'+currentWidgetData.id; //No I18N
							sendObj.data = apiResponse.data;
							sendObj.defaultOptions = defaultOptions;
							sendObj.colModels = snapshotData.colModelList;
							sendObj.colNames = snapshotData.colNamesList;
							sendObj.onSelectFunction = (snapshotData.onselectfunction!=undefined)?snapshotData.onselectfunction:'';
							validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
							self.set('gridData',sendObj);
						}
					}
					isNoData = false;
				}
			}

			if((type=="Grid" || nfaExpandView || currentWidgetData.name=="opu.bwm.traffic.inandOut") && !this.snapshotObj.shortSummary)
			{
				var snapDetails = currentWidgetData;
				self.set('showDetailedGraph',true);
				var tableData=[];
				if(apiResponse.TrafficData!=undefined){
					tableData = apiResponse.TrafficData;
				}else if(apiResponse.result!=undefined){
					tableData = apiResponse.result;
				}else if(apiResponse.resultVector!=undefined){
					tableData = apiResponse.resultVector;
				}else if(apiResponse.data!=undefined){
					tableData = apiResponse.data;
				}else if(apiResponse.resultdata!=undefined){
					tableData = apiResponse.resultdata;
				}else if(apiResponse.tableData!=undefined){
					tableData = apiResponse.tableData;
				}else if(apiResponse.resultData!=undefined){
					tableData = apiResponse.resultData;
				}else{
					self.set('showDetailedGraph',false);//No I18N
				}

				if(tableData.length!=0)
				{
					var sendObj = {};
					sendObj.gridId = 'opm_DeviceSnapList'+currentWidgetData.id; //No I18N
					sendObj.data = tableData;
					sendObj.defaultOptions = {
						minRowsPerPage: nfaExpandView?50:10,
						isSnapshotGrid: true,
						snapId: currentWidgetData.id,
						reload: false,
						pagination: nfaExpandView
					};
					if(currentWidgetData.apiData.devDetails != undefined && currentWidgetData.apiData.devDetails.Type != undefined){
						sendObj.defaultOptions.reportType = currentWidgetData.apiData.devDetails.Type;
					}
					if(["opm.interface.traffic","wlc.apmacsnap.traffic","nfa.asview.traffic","nfa.cloudInterface.traffic"].contains(currentWidgetData.name)) { //NO I18N
						sendObj.defaultOptions.sortName = "Time"; //NO I18N
						sendObj.defaultOptions.sortOrder = "desc"; //NO I18N
					}
					sendObj.showAll = (tableData.length>10 && !nfaExpandView);

					if(snapshotData!==undefined) {
						sendObj.colModels = snapshotData.colModelList;
						sendObj.colNames = snapshotData.colNamesList;
						sendObj.onSelectFunction = (snapshotData.onselectfunction!=undefined)?snapshotData.onselectfunction:'';
					} else {
						sendObj.colModels = snapDetails.colModelList;
						sendObj.colNames = snapDetails.colNamesList;
						sendObj.onSelectFunction = (snapDetails.onselectfunction!=undefined)?snapDetails.onselectfunction:'';
					}
					sendObj.nfaCustomPagerDetails = (currentWidgetData.nfaCustomPagerDetails !== undefined)?getNFACustomPagerDetails(currentWidgetData):false;

					if(snapDetails.name === 'opm.interface.application') {
						if(this.get('snapshotObj.snapDetails.snapshotName') !== 'FlowIPGroup') {
							OPMClient.InventoryDeviceDetailsController.isRawEnabled = apiResponse.isRawEnable;
						}
					}

					if(isNFGInterfaceTraffic){
						sendObj.colModels[2].hidden = true;
					}
					if(snapDetails.name == 'NFA.interface.Art' && $('#param_'+currentWidgetData.id+'_GraphType').val() != "") {
						sendObj.colModels = snapshotData.colModelList1;
						sendObj.colNames = snapshotData.colNamesList1;
					}
					if(snapDetails.name == "opu.bwm.traffic.inandOut" && $('#param_'+currentWidgetData.id+'_category option:selected').val() == "packet")
					{
						sendObj.colNames = [Ember.I18n.t('webclient.auditreport.dateandtime'),Ember.I18n.t('opu.bwm.unicostin'),Ember.I18n.t('opu.bwm.unicostout'),Ember.I18n.t('opu.bwm.nonUnicostin'),Ember.I18n.t('opu.bwm.nonUnicostout')];//No I18N
						sendObj.colModels =[
							{ name: 'collectedtime', index: 'collectedtime'},//No I18N
							{ name: 'inunicast', index:'inunicast',sorttype:'opu_packetColSorting'}, //No I18N
							{ name: 'outunicast', index:'outunicast',sorttype:'opu_packetColSorting'}, //No I18N
							{ name: 'inbroadcast', index: 'inbroadcast',sorttype:'opu_packetColSorting'},//No I18N
							{ name: 'outbroadcast', index:'outbroadcast',sorttype:'opu_packetColSorting'} //No I18N
						];
					}

					sendObj.gridClassName = "opm_jqGridUI"; //No I18N
					if(nfaSnapType.contains(this.snapshotObj.snapType) && graphParams.data!=undefined) {
						sendObj.gridClassName += " opmReportsGridview nfa"; //No I18N
					}

					if(snapDetails.name === "NFA.interface.Nbar2App" && this.snapshotObj.snapType === "FlowIPGroup"){ //NO I18N
						for(var i=1; i<sendObj.colModels.length-1; i++){
							sendObj.colModels[i].classes = "";
						}
					}

					if(snapDetails.name == "NFA.interface.MNettraffic") { //No I18N
						var groupBy = $("#param_"+currentWidgetData.id+"_GroupBy").val(); //No I18N
						var sortBy = $("#param_"+currentWidgetData.id+"_SortBy").val(); //No I18N
						var gridDetailObj=nfa_getMedianetGridDetails(groupBy,sortBy);
						sendObj.colNames = gridDetailObj.colNamesList;
						sendObj.colModels = gridDetailObj.colModelList;
						if(sortBy === "all") {
							sendObj.defaultOptions.gridCallBack = function() {
								$("#opm_DeviceSnapList"+currentWidgetData.id).jqGrid('setGroupHeaders',gridDetailObj.groupHeaders);
								$('#gview_opm_DeviceSnapList'+currentWidgetData.id+' > div.ui-state-default > div > table > thead > tr.jqg-first-row-header').remove();
							}
							sendObj.gridClassName = "opm_jqGridUI opmReportsGridview nfa groupHeading"; //No I18N
						}
					}else {
						validateGridColumnDetails(sendObj.colModels,sendObj.colNames);
					}
					if(snapDetails.name === "wlc.apmacsnap.apps" || snapDetails.name === "nfa.wlcsnap.apps"){
						sendObj.defaultOptions.reportType = currentWidgetData.apiData.reportType;
					}
					self.set('detailedData',sendObj);
					sizeyVal = (nfaExpandView)?(sizeyVal+14):((graphParams.snapWidgetName=="opu.bwm.traffic.inandOut")?40:(window.OPM.isNewSnapshotPage)?Math.max(10, 5 + Math.ceil(sendObj.data.length * 1.5)):14); //NO I18N
					isNoData = false;
				}
				else if(!nfaExpandView)
				{
					isNoData = true;
				}
			}
		}
		self.set("widgetData.sizey",sizeyVal); //NO I18N
		self.set("widgetData.noData",isNoData);  //NO I18N
		self.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1);
	},
	actions:
	{
	  	subChildActions: function(functionType, functionName) {
	  		this.sendAction('action',functionType,functionName);
	  	},
	  	nfaBVTimeSelection: function() {
	  		$('#customTimeStatic').show();
			$('#timeFilterListId').hide();
			$('#CustomTimeDiv').hide();
			$('#nfaBVTimeFilterDiv').show();
			OPMClient.InventoryDeviceDetailsController.selectedSmallSlide = true;
			$('#deviceSnapshotSmallHeader').text(Ember.I18n.t('webclient.inventory.businesshour',this)); //No I18N
			deviceSlideIn(3);
			setNFABVTimeFrameFilter();
		},
		changeGrapPlotOption:function(type) {
			var snapId = this.get('widgetData.id'); //No I18N
			$("#widgetElement_"+snapId+" .chartTypeIcons li.active").removeClass("active"); //No I18N
			this.set('widgetData.grapPlotType',type); //No I18N
			this.set('widgetData.apiData',$.extend(true,{},this.get('widgetData.apiData'))); //No I18N
			$("#widgetElement_"+snapId+" .chartTypeIcons li."+type).addClass("active"); //No I18N
		},
		showTPAnalysis:function() {
			OPMClient.InventoryNFAController.set("tpAnalysis", true); //NO I18N
			opm_transitionToTheRoute("Inventory.Device.TrafficPattern"); //NO I18N
		}
	},
	willDestroyElement:function() {
		nfa_resetZoomGraphValues();
		//Remove d3 Elements
		d3.select('#'+this.elementId).selectAll('rect').remove();
		d3.select('#'+this.elementId).select('svg').selectAll('*').remove();
		d3.select('#'+this.elementId).select('.container').remove();
		d3.select('#'+this.elementId).selectAll('*').remove();
		$('#'+this.elementId).find('*').remove();
		this.chartobj=null;
	}
});

OPMClient.NfaAutoRefreshComponent = Ember.Component.extend({
	templateName: "components/nfa-auto-refresh", //No I18N
	attributeBindings: ['title'], //No I18N
	title: Ember.I18n.t('webcient.inventory.autoRefresh'), //No I18N
	classNames: ['nfaAutoRefresh'], //No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData'); //No I18N
		var elementId = this.get('elementId'); //No I18N
		var snapId = widgetData.id;

		widgetData.autoRefreshTime = (widgetData.autoRefreshTime!==undefined) ? widgetData.autoRefreshTime : (widgetData.snapshotData.autoRefreshDefaultTime)? widgetData.snapshotData.autoRefreshDefaultTime : 0;

		//For by default 1 min refresh - Avoid unwanted autorefresh for higher timeperiods.
		if(OPMClient.InventoryNFAController.isNFASnapshot && ["7Days","30Days","LastQuarter","custom"].indexOf(nfa_getInvTimeFrameValue())>=0) {
			widgetData.autoRefreshTime = 0;
		}

		OPMClient.InventoryDeviceDetailsController.set('autoRefreshTimer','0:00'); //No I18N
		clearInterval(widgetData.autoRefreshSubTimerID);
		var timerFuction = function(milliSec) {
			var timerId = setInterval(function() {
				milliSec -= 1000;
				OPMClient.InventoryDeviceDetailsController.set('autoRefreshTimer',nfa_convertMillisToMinutes(milliSec)); //No I18N
				if (milliSec <= 0) {
					clearInterval(timerId);
				}
			},1000);
			return timerId;
		}

		var milliSeconds = (widgetData.autoRefreshTime*60*1000);
		clearInterval(widgetData.autoRefreshTimerID);

		if(milliSeconds>0) {
			widgetData.autoRefreshSubTimerID =  timerFuction(milliSeconds);
			widgetData.autoRefreshTimerID = setInterval(function(){
				widgetData.autoRefreshSubTimerID = timerFuction(milliSeconds);
				$('#autoRefresh_'+snapId).click();  //No I18N
			},milliSeconds);
		}

		$('#autoRefreshTimeList_'+snapId+' li').removeClass('active'); //No I18N
		$('#autoRefreshTimeList_'+snapId+' li[data-mins="'+widgetData.autoRefreshTime+'"]').addClass('active');  //No I18N
		$('#autoRefreshTimeList_'+snapId).hide();  //No I18N

		$('#'+elementId+' .timerTag').off().click(function(){ //NO I18N
			if($("#autoRefreshTimeList_"+snapId).is(":visible")){ //NO I18N
				$("#autoRefreshTimeList_"+snapId).hide(); //NO I18N
			}else {
				$("#autoRefreshTimeList_"+snapId).show(); //NO I18N
			}
		});

		$('body').click(function(e) {  //No I18N
			if($('#autoRefreshTimeList_'+snapId).is(':visible')){  //No I18N
				if(!$(e.target).closest('.nfaAutoRefresh').length){  //No I18N
					$("#autoRefreshTimeList_"+snapId).hide(); //NO I18N
				}
			}
		});
	}.observes('widgetData.autoRefreshTime'), //No I18N
	actions:{
		nfaSetAutoRefresh: function(mins){
			this.set('widgetData.autoRefreshTime',mins); //No I18N
		},
		closeOptionList: function(snapId){
			$('#autoRefreshTimeList_'+snapId).hide();  //No I18N
		},
		reloadWidget: function(){
			this.sendAction('action','reload'); //No I18N
		}
	},
	willDestroyElement: function(){
		clearInterval(this.get('widgetData.autoRefreshTimerID')); //No I18N
		clearInterval(this.get('widgetData.autoRefreshSubTimerID')); //No I18N
	}
});

OPMClient.NfaAddonMarketingComponent = Ember.Component.extend({
	templateName: "components/nfa-addon-marketing", //No I18N
	didInsertElement: function(){
		OPMClient.NFAInventoryAddOnMarketingController.getNFAAddOnMarketing(this.get("pageName")); //No I18N
		this.set("content", OPMClient.NFAInventoryAddOnMarketingController.addOnMarketingContent); //No I18N
	},
	willDestroyElement: function(){
		OPMClient.NFAInventoryAddOnMarketingController.set("addOnMarketingContent",""); //No I18N
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.NfaHourMinuteViewComponent = Ember.Component.extend({
	templateName: "components/nfa-hour-minute-view", //No I18N
	didInsertElement: function(){
		$("#"+this.get("elementId")+" .labelNameDiv").text(Ember.I18n.t(this.get("labelName")));
	}
});

OPMClient.NfaSchedulerTimeSelectionComponent = Ember.Component.extend({
	templateName: "components/nfa-scheduler-time-selection", //No I18N
	didInsertElement: function(){
		var endTime = getEndTimeWithTimeZone();

		$("#onceDate").datepicker({dateFormat:"yy-mm-dd",minDate:endTime}); //NO I18N
		$("#onceDate").val(opm_formatDate(endTime)); //NO I18N

		$("#nfaSchedulerDiv .hoursView").val(opm_formatTime(endTime,"hrs")).select2(); //NO I18N
		$("#nfaSchedulerDiv .minutesView").val(opm_formatTime(endTime,"mins")).select2(); //NO I18N

		$('#nfaSchedulerDiv .verticalAcc .verticalAccHdr > div').off().click(function(){ //NO I18
			if(!$(this).hasClass('active')){ //NO I18N
				$('#nfaSchedulerDiv .verticalAcc .verticalAccHdr > div').removeClass(); //NO I18N
				if($(this).index() !== 0){
					$('#nfaSchedulerDiv .verticalAcc .verticalAccHdr > div:first-child').addClass('noActive'); //NO I18N
				}
				$(this).addClass('active'); //NO I18N
				$("#nfaSchedulerDiv .verticalAccSignle").removeClass('active').hide(); //NO I18N
				$("#"+$(this).attr("value")+"Div").show(); //NO I18N
			}
		});
	}
});

OPMClient.NfaDiskspaceInfoComponent = Ember.Component.extend({
	templateName:"components/nfa-diskspace-info", //NO I18N
	isExpand: true,
	didInsertElement: function() {
		this.inputBoxObserver();
	},
	inputBoxObserver: function() {
		Ember.run.scheduleOnce("afterRender", function() { //NO I18N
			$("#freeSpaceUnit").select2();
		});
	}.observes("OPMClient.SettingsNFADiskSpaceInfo.showInputBox"), //NO I18N
	actions:{
		accordionAction: function() {
			if($(event.target).hasClass("rawInfoRefresh")) {
				return; //accordion action will not be triggered if the clicked element is refresh button
			}
			//  this.set("isExpand", !this.isExpand); //NO I18N
		},
		getUpdatedInfo: function(){
			OPMClient.Settings.getDiskSpaceInfo(1);
		},
		getAvailableSpaceInfo: function(){
			if(opm_validateFields({'empty':['freeDiskSpace'], 'unSignedFloatOrEmpty':['freeDiskSpace']})){ //No I18N
				var data = {
					DiskSpaceNeededFor1Hr: OPMClient.SettingsNFADiskSpaceInfo.response.PreSize.PredicSize.DiskSpaceNeededFor1Hr,
					freediskspace: $("#freeDiskSpace").val(), //No I18N
					unit: $("#freeSpaceUnit").val() //No I18N
				};
				$.ajax({
					url: window.OPM.apiUrlPattern+"/nfatablesize/getSpaceAvailFor", //No I18N
					type: "GET", //No I18N
					data: data,
					dataType: "json", //No I18N
					async: false,
					beforeSend: function(XMLHttpRequest, settings){
						appendCollectorDetails(XMLHttpRequest, settings);
					},
					success: function(response){
						if(response.error == undefined){
							OPMClient.SettingsNFADiskSpaceInfo.set('response.PreSize.PredicSize.DiskSpaceAvailableFor', response.DiskSapceAvailableFor); //No I18N
							OPMClient.SettingsNFADiskSpaceInfo.set('response.PreSize.PredicSize.DiskSpaceAvailableForinHr', response.DiskSapceAvailableForinHr); //No I18N
							OPMClient.SettingsNFADiskSpaceInfo.set('showInputBox', false); //No I18N
							nfa_checkSpaceAvailability();
						}else{
							opm_infoMsgs("errorMsg", response.error.message); //NO I18N
						}
					}
				});
			}
		},
		getListOfTables: function(){
			opmGlobalRoute.transitionTo("Settings.NetflowConfig.NFAStorage.Category.DataTable"); //No I18N
		}
	}
});

OPMClient.NfaAlertConfigComponent = Ember.Component.extend({
	templateName:"components/nfa-alert-config", //NO I18N
	titlePrompt:Ember.I18n.t("webclient.admin.profiledetails.subject.SelectValue"), //NO I18N
	keyPress:function(e){
		if($(".unitValue").is(":focus")){return opm_isNumber(e);} //NO I18N
		if($(".floatValCheck").is(":focus")){ return opm_isFloatNumber(e);} //NO I18N
	},
	loadInitialValues:function() {
		this.getThresholdTypeList();
	}.on("init"), //NO I18N
	didInsertElement:function(){
		if(this.configObj.tZone == undefined) {
			this.set("configObj.tZone",window.OPM.userTimeZone); //NO I18N
		}
		if(this.task==="Add") { //NO I18N
			this.addNewThresoldObj();
		}
		$("input[name=trafficType][value="+this.configObj.trafficType+"]").prop("checked",true); //NO I18N
	},
	getThresholdTypeList:function() {
		var tTypeList = this.lists.thresholdTypeList;
		for(var i=0;i<tTypeList.length;i++){
			tTypeList[i].checked = (this.configObj.trafficParameter === tTypeList[i].value)?"checked":""; //NO I18N
		}
		this.set("lists.thresholdTypeList",tTypeList); //NO I18N
	},
	getThresholdList:function() {
		return jQuery.extend(true,[],this.get("configObj.thresholdList")); //NO I18N
	},
	addNewThresoldObj:function() {
		var type = this.configObj.trafficParameter;
		var thresholdList = this.getThresholdList();
		if(thresholdList.length > 0) {
			thresholdList[thresholdList.length-1].showAddButton = false;
			thresholdList[thresholdList.length-1].showAddButtonOnly = false;
		}
		thresholdList.push({
			index:thresholdList.length,
			thresholdCondition:"greater", //NO I18N
			thresholdUnit:(type==="utilization")?"percentage":((type==="volume")?"MB":((type==="speed")?"Mbps":"packets")), //NO I18N
			severity:"Trouble", //NO I18N
			thresholdAction:"-1", //NO I18N
			notificationTemplateID:"-1" //NO I18N
		});
		thresholdList[thresholdList.length-1].showAddButton = true;
		thresholdList[thresholdList.length-1].showAddButtonOnly = (thresholdList.length===1);
		this.set("configObj.thresholdList",thresholdList); //NO I18N
	},
	modifyThresholdList:function(list,key,newValue) {
		for(var i=0;i<list.length;i++) {
			list[i][key] = newValue;
		}
		return list;
	},
	actions:{
		trafficTypeChanged:function(type){
			this.set("configObj.trafficType",type); //NO I18N
		},
		criteriaTypeChanged:function(type){
			this.set("configObj.trafficParameter",type); //NO I18N
			this.set("configObj.thresholdList",[]); //NO I18N
			this.addNewThresoldObj();
		},
		childActions:function(functionName,param1){
			this.send(functionName,param1);
		},
		addAlertThresold:function() {
			if(nfaValidateAlertThreshold(this.configObj.thresholdList[this.configObj.thresholdList.length-1])) {
				this.addNewThresoldObj();
			}
		},
		showHideMailReport:function() {
			var showMailReport = false;
			for(var i=0;i<this.configObj.thresholdList.length;i++) {
				if(this.lists.mailTypeTemplateIDs.contains(this.configObj.thresholdList[i].notificationTemplateID)) {
					showMailReport = true; break;
				}
			}
			this.set("configObj.showMailReport",showMailReport); //NO I18N
		},
		deleteAlertThresold:function(index) {
			var thresholdList = this.getThresholdList();
			if(thresholdList.length > 1) {
				thresholdList.removeAt(index);
				for(var i=index;i<thresholdList.length;i++) {
					thresholdList[i].index = i;
				}
			}
			thresholdList[thresholdList.length-1].showAddButton = true;
			thresholdList[thresholdList.length-1].showAddButtonOnly = (thresholdList.length===1);
			this.set("configObj.thresholdList",thresholdList); //NO I18N
			this.send("showHideMailReport"); //NO I18N
		},
		saveAlertProfile:function() {
			if(nfa_validateAlertConfig(this)) {
				nfa_SaveRealTimeAlertProfile(this);
			}
		},
		addNTemplate:function() {
			nt_redirectToNotificationTemplateTypes();
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaAlertSourceComponent = Ember.Component.extend({
	templateName:"components/nfa-alert-source", //NO I18N
	didInsertElement:function() {
		this.set("lists.thresholdTypeList",nfa_getThreholdTypeList(this.deviceType,this,true)); //NO I18N
	},
	loadDefaultValues:function() {
		this.getAllDeviceLabel();
		this.getSourceList();
	}.on('init'), //No I18N
	getSourceList:function() {
		var sourceList = this.lists.sourceList;
		for(var i=0;i<sourceList.length;i++){
			sourceList[i].checked = (this.deviceType === sourceList[i].value)?"checked":""; //NO I18N
		}
		this.set("lists.sourceList",sourceList); //NO I18N
	},
	getAllDeviceLabel:function() {
		var msg = ""; //NO I18N
		switch(this.deviceType){
			case "Interface"		: msg = "nfa.alarm.allintf"; break; //NO I18N
			case "IPGroup"			: msg = "nfa.alarm.allipgrp"; break; //NO I18N
			case "InterfaceGroup"	: msg = "nfa.alarm.allintfgrp"; break; //NO I18N
			case "AccessPoint"		: msg = "webclient.all.accessPoints.selected"; break; //NO I18N
			case "SSIDGroup"		: msg = "webclient.nfa.schedule.SSIDGroup.selectmsg"; break; //NO I18N
		}
		this.set("allDevicelMsgStr",Ember.I18n.t(msg)); //NO I18N
	},
	allDeviceSelectionChanged:function() {
		this.send("sourceTypeChanged",this.deviceType,true); //NO I18N
	}.observes("isAllDeviceSelected"), //NO I18N
	actions:{
		sourceTypeChanged:function(source,isAllDeviceSelectionChanged) {
			if(!isAllDeviceSelectionChanged) {
				this.set("deviceType",source); //NO I18N
				this.getAllDeviceLabel();
				this.sendAction("action","trafficTypeChanged","IN"); //NO I18N
				$('input[name="trafficType"][value="IN"]').prop("checked",true); //NO I18N
				this.set("lists.thresholdTypeList",nfa_getThreholdTypeList(source,this)); //NO I18N
				this.sendAction("action","criteriaTypeChanged",["SSIDGroup","AccessPoint"].contains(source)?"volume":"utilization"); //NO I18N
			}
			if(!this.isAllDeviceSelected) {
				this.set("deviceList",[]); //NO I18N
				nfa_getSourceList(this,this.deviceType);
			}
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaAlertCriteriaConfigComponent = Ember.Component.extend({
	templateName:"components/nfa-alert-criteria-config", //NO I18N
	classNames:["horizontalAcc"], //NO I18N
	elementId:"criteriaTypes", //NO I18N
	ipPlaceHolder:Ember.I18n.t("webclient.discovery.netip"), //NO I18N
	startIPPlaceHolder:Ember.I18n.t("webclient.discovery.startip"), //NO I18N
	endIPPlaceHolder:Ember.I18n.t("webclient.discovery.endip"), //NO I18N
	netMaskPlaceHolder:Ember.I18n.t("webclient.topo.addnode.netmask"), //NO I18N
	portPlaceHolder:Ember.I18n.t("webclient.admin.proxy.port"), //NO I18N
	criteriaList: [
		{name:Ember.I18n.t("webclient.Include"),value:"Include"}, //NO I18N
		{name:Ember.I18n.t("webclient.Exclude"),value:"Exclude"} //NO I18N
	],
	didInsertElement:function() {
		this.loadIPTypeList();
		this.set("showIPChkClass",(this.lists.showIPChk)?"active":""); //NO I18N
		this.set("showPortChkClass",(this.lists.showPortChk)?"active":""); //NO I18N
		this.set("showDSCPChkClass",(this.lists.showDSCPChk)?"active":""); //NO I18N
		this.set("showAppChkClass",(this.lists.showAppChk)?"active":""); //NO I18N
	},
	loadIPTypeList:function() {
		var ipTypeList = [
			{name:Ember.I18n.t("jsp.commonstr.IpAddress"),value:"IPAddress",selected:true}, //NO I18N
			{name:Ember.I18n.t("webclient.IP.Network"),value:"IP_Network",selected:false}, //NO I18N
			{name:Ember.I18n.t("webclient.layer.discovery.iprange"),value:"IP_Range",selected:false} //NO I18N
		];
		this.set("ipTypeList",ipTypeList); //NO I18N
	},
	showIPChkChanged:function(){
		this.set("showIPChkClass",(this.lists.showIPChk)?"active":""); //NO I18N
	}.observes("lists.showIPChk"), //NO I18N
	showPortChkChanged:function(){
		this.set("showPortChkClass",(this.lists.showPortChk)?"active":""); //NO I18N
	}.observes("lists.showPortChk"), //NO I18N
	showDSCPChkChanged:function(){
		this.set("showDSCPChkClass",(this.lists.showDSCPChk)?"active":""); //NO I18N
	}.observes("lists.showDSCPChk"), //NO I18N
	showAppChkChanged:function(){
		this.set("showAppChkClass",(this.lists.showAppChk)?"active":""); //NO I18N
	}.observes("lists.showAppChk") //NO I18N
});

OPMClient.NfaAlertThresholdConfigComponent = Ember.Component.extend({
	templateName:"components/nfa-alert-threshold-config", //NO I18N
	didInsertElement:function() {
	},
	changeThresholdListValues:function(thresholdObj,listName,selectedValue) {
		var list = thresholdObj[listName];
		for(var i=0;i<list.length;i++) {
			list[i].selected = (list[i].value === selectedValue)?"selected":""; //NO I18N
		}
		thresholdObj[listName] = list;
		return thresholdObj;
	},
	notificationTypeChanged:function() {
		this.set("threshold.notificationTemplateID","-1"); //NO I18N
	}.observes("threshold.thresholdAction"), //NO I18N
	notificationTemplateChanged:function() {
		this.sendAction("action","showHideMailReport"); //NO I18N
	}.observes("threshold.notificationTemplateID"), //NO I18N
	actions:{
		subChildActions:function(functionName,param1) {
			this.sendAction("action",functionName,param1); //NO I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaMultiSelectionViewComponent = Ember.Component.extend({
	templateName:"components/nfa-multi-selection-view", //NO I18N
	classNames:["nfaMultiSelection"], //NO I18N
	searchPlaceholder:Ember.I18n.t("opu.common.SEARCH"), //NO I18N
	isCustomModel:false,
	keyUp:function(e){
		if($(".parentSearch").is(":focus")){ //NO I18N
			searchFromMultiSelecDeviceList(this.parentSearchVal);
		}
		if($(".childSearch").is(":focus")){ //NO I18N
			searchFromMultiSelecIntfList(this.childSearchVal);
		}
	},
	didInsertElement:function() {
		if(this.selInterfaceList===undefined) {
			this.set("selInterfaceList",[]); //NO I18N
		}
		if(this.availInterfaceList===undefined) {
			if(!this.isCustomModel && (this.deviceList===undefined || this.deviceList.length===0)) {
				var apiURL = window.OPM.apiUrlPattern+(this.isWLC?"/nfadevice/listApMacForMutiSel":"/nfadevice/listDevForMultiSel"); //NO I18N
				var callBckFunc = function(jsonData,self) {
					if(jsonData!==null && jsonData!==undefined){
						self.set("deviceList",jsonData); //NO I18N
						nfa_getModelForIntfMultiSelect(self);
					}
				};
				nfa_getAjaxResponseWithAsync(apiURL,"",callBckFunc,this); //NO I18N
			}else {
				nfa_getModelForIntfMultiSelect(this);
			}
		}
	},
	changeInputCheckedVal:function(routerObj,checkedVal) {
		routerObj.allIntfSelected = checkedVal;
		routerObj.selectedIntfCount = (checkedVal === "checked")?routerObj.intfList.length:0; //No I18N

		for(var i=0;i<routerObj.intfList.length;i++){
			routerObj.intfList[i][2] = checkedVal;
		}
		return routerObj;
	},
	getAvailInterfaceList:function() {
		return jQuery.extend(true,[],this.get("availInterfaceList")); //No I18N
	},
	setAllRouterSelectedVal:function() {
		this.set("isAllRouterSelected",(this.get("totalSelIntfCount") == this.get("totalAvailIntfCount"))?"checked":""); //No I18N
	},
	actions:{
		allRouterSelectedChanged:function(){
			var routerLst = this.getAvailInterfaceList();
			this.set("isAllRouterSelected",(this.get("isAllRouterSelected")==="checked")?"":"checked"); //No I18N
			var totalSelIntfCount = 0;
			for(var i=0;i<routerLst.length;i++) {
				routerLst[i] = this.changeInputCheckedVal(routerLst[i],this.get("isAllRouterSelected")); //No I18N
				totalSelIntfCount += routerLst[i].selectedIntfCount;
			}
			this.set("totalSelIntfCount",totalSelIntfCount); //No I18N
			this.set("availInterfaceList",routerLst); //No I18N
		},
		allIntfSelectedChanged:function(intfLstId){
			var index = intfLstId.split("_")[1]; //No I18N
			var routerLst = this.getAvailInterfaceList();
			var totalSelIntfCount = routerLst[index].selectedIntfCount;

			routerLst[index].allIntfSelected = (routerLst[index].allIntfSelected==="")?"checked":""; //No I18N
			routerLst[index] = this.changeInputCheckedVal(routerLst[index],routerLst[index].allIntfSelected);

			if(routerLst[index].allIntfSelected==="checked") { //No I18N
				totalSelIntfCount = (this.get("totalSelIntfCount") - totalSelIntfCount) + routerLst[index].intfList.length; //No I18N
			}else {
				totalSelIntfCount = this.get("totalSelIntfCount") - totalSelIntfCount; //No I18N
			}

			this.set("totalSelIntfCount",totalSelIntfCount); //No I18N
			this.setAllRouterSelectedVal();
			this.set("availInterfaceList",routerLst); //No I18N
		},
		childIntfSelectionChanged:function(intfLstId,interfaceID) {
			var index = intfLstId.split("_")[1]; //No I18N
			var routerLst = this.getAvailInterfaceList();
			var routerObj = routerLst[index];

			for(var i=0;i<routerObj.intfList.length;i++) {
				if(routerObj.intfList[i][0] === interfaceID){
					break;
				}
			}
			if(routerObj.intfList[i][2]==="checked") { //No I18N
				routerObj.intfList[i][2] = ""; //No I18N
				routerObj.selectedIntfCount -= 1;
				this.set("totalSelIntfCount",this.get("totalSelIntfCount")-1); //No I18N
			}else {
				routerObj.intfList[i][2] = "checked"; //No I18N
				routerObj.selectedIntfCount += 1;
				this.set("totalSelIntfCount",this.get("totalSelIntfCount")+1); //No I18N
			}
			routerObj.allIntfSelected = (routerObj.selectedIntfCount == routerObj.intfList.length)?"checked":""; //No I18N
			routerLst[index] = routerObj;
			this.setAllRouterSelectedVal();
			this.set("availInterfaceList",routerLst); //No I18N
		},
		mainListViewChanged:function(routerId) {
			var index = routerId.split("_")[1]; //No I18N
			var routerLst = this.getAvailInterfaceList();
			for(var i=0;i<routerLst.length;i++){
				routerLst[i].className = "chkParentChild"; //No I18N
			}
			routerLst[index].className += " active"; //No I18N
			if(index != 0) {
				routerLst[0].className += " noActive"; //No I18N
			}
			this.set("availInterfaceList",routerLst); //No I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaTimeZoneListComponent = Ember.Component.extend({
	templateName: "components/nfa-time-zone-list", //No I18N
	mouseEnter: function(e){
		this.listTimeZones();
	},
	didInsertElement:function() {
		if(this.get("timeZoneList") == undefined){ //No I18N
			this.set("timeZoneList",[this.get("selectedTimeZone")]); //No I18N
		}
	},
	listTimeZones: function(){
		if(this.get("timeZoneList").length <= 1){ //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/nfaadmin/getCurrentTimeZone"; //No I18N
			var tZoneCallFunc = function(jsonData,paramsObj){
				if(paramsObj.self.get("selectedTimeZone") === undefined) { //No I18N
					paramsObj.self.set("selectedTimeZone",jsonData.tZone); //No I18N
				}
				paramsObj.self.set("timeZoneList",jsonData.tzList); //No I18N
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},tZoneCallFunc,{self:this});
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaApplicationListComponent = Ember.Component.extend({
	templateName: "components/nfa-application-list", //No I18N
	mouseEnter: function(e){
		this.getAppList();
	},
	didInsertElement:function() {
		$("#nfaUniqueAppList").select2(); //No I18N
		if(this.get("appList") == undefined){ //No I18N
			if(this.get("selectedApplication") !== undefined) { //No I18N
				this.set("appList",[this.get("selectedApplication")]); //No I18N
			}else {
				this.getAppList();
			}
		}else{
			this.loadSelect2Data();
		}
	},
	loadSelect2Data: function() {
		var list = this.get("appList"); //No I18N
		var data = [];
		if(this.addAllAppsOption){
			data.push({id: "Any", text: Ember.I18n.t("opu.common.ALL")}); //NO I18N
		}
		for(var i=0;i<list.length;i++) {
			data.push({id:list[i],text:list[i]});
		}
		$("#nfaUniqueAppList").select2({data:data}); //No I18N
	}.observes('appList'), //No I18N
	getAppList: function(type){
		if(this.get("appList") == undefined || this.get("appList").length <= 1){ //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/nfaadmin/getUniqueAppList"; //No I18N
			var callBckFunc = function(jsonData,paramsObj){
				if(paramsObj.self.get("selectedApplication") == undefined) { //No I18N
					paramsObj.self.set("selectedApplication",jsonData[0]); //No I18N
				}
				paramsObj.self.set("appList",jsonData); //No I18N
			};
			nfa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,{self:this});
		}
	},
	actions:{
		listChanged: function(){
			this.set("selectedApplication",$("#nfaUniqueAppList").val()); //No I18N
		}
	}
});

OPMClient.NfaProtocolDscpListComponent = Ember.Component.extend({
	templateName: "components/nfa-protocol-dscp-list", //No I18N
	mouseEnter: function(e){
		this.getList();
	},
	didInsertElement:function() {
		if(this.get("list") == undefined){ //No I18N
			if(this.get("selectedValue") !== undefined) {
				this.set("list",[{value:this.selectedValue,name:this.selectedValue,selected:"selected"}]); //No I18N
			}else {
				this.getList();
			}
		}
		$("#"+this.elementId+" .select2").select2(); //No I18N
	},
	getList: function(){
		if(this.get("list") == undefined || this.get("list").length <= 1){ //No I18N
			var apiURL = window.OPM.apiUrlPattern+"/nfaadmin"; //No I18N
			apiURL += (this.type === "protocol")?"/listProtocol":"/listDscpMap"; //No I18N
			var callBckFunc = function(jsonData,paramsObj){
				var list = [];
				if(jsonData.error == undefined) {
					if(paramsObj.self.get("selectedValue") == undefined) { //No I18N
						paramsObj.self.set("selectedValue",jsonData[0]); //No I18N
					}
					for(var i=0;i<jsonData.length;i++){
						if(paramsObj.self.selectedValue == jsonData[i]) {
							list.push({name:jsonData[i],value:jsonData[i],selected:"selected"}); //No I18N
						}else {
							list.push({name:jsonData[i],value:jsonData[i],selected:""}); //No I18N
						}
					}
				}
				paramsObj.self.set("list",list); //No I18N
			};
			nfa_getAjaxResponseWithAsync(apiURL,{listAll:true,onlyName:true},callBckFunc,{self:this});
		}
	},
	actions:{
		listChanged: function(){
			this.set("selectedValue",$("#"+this.elementId+" .protocolDscpList").val()); //No I18N
		}
	}
});

OPMClient.NfaListNumbersComponent = Ember.Component.extend({
	templateName: "components/nfa-list-numbers", //NO I18N
	prefix:"00",
	initDefaults:function() {
		this.getNumberList();
	}.on("init"), //NO I18N
	getNumberList: function(){
		var startVal = this.get("startVal"); //NO I18N
		var endVal = this.get("endVal"); //NO I18N
		var incrementBy = this.get("incrementBy"); //NO I18N
		var list = [];
		var selectedVal = (this.selectedVal!==undefined)?this.selectedVal:(this.prefix!=''?((this.prefix+startVal).slice(-2)):startVal);
		while(startVal <= endVal) {
			var startValStr = (this.prefix!=''?(this.prefix+startVal).slice(-2):startVal); //NO I18N
			list.push({name:startValStr,value:startValStr,selected:(this.selectedVal==startVal)?"selected":""}); //NO I18N
			startVal += incrementBy;
		}
		this.set("numberList",list); //NO I18N
		this.set("selectedVal",selectedVal); //NO I18N
	},
	didInsertElement:function() {
		$("#"+this.elementId+" .select2").select2(); //NO I18N
	},
	selectedValChanged:function() {
		var list = jQuery.extend(true,[],this.numberList);
		for(var i=0;i<list.length;i++) {
			list[i].selected = (this.selectedVal==list[i].value)?"selected":""; //NO I18N
		}
		this.set("numberList",list); //NO I18N
	}.observes("selectedVal"), //NO I18N
	incrementValueChanged: function(){
		this.getNumberList();
	}.observes("incrementBy"), //NO I18N
	actions:{
		listChanged: function(){
			this.set("selectedVal",$("#"+this.elementId+" .numberList").val()); //NO I18N
		}
	}
});

OPMClient.NfaGraphTypesComponent = Ember.Component.extend({
	templateName: "components/nfa-graph-types", //No I18N
	classNames: ['chartTypeBox'], //No I18N
	didInsertElement:function() {
		var elementId = this.get("elementId"); //No I18N
		var graphType = this.get("widgetData.grapPlotType")?this.get("widgetData.grapPlotType"):"area"; //No I18N
		$("#"+elementId+" .chartTypeIcons li.active").removeClass("active"); //No I18N
		$("#"+elementId+" .chartTypeIcons li."+graphType).addClass("active"); //No I18N
	},
	actions:{
		changeGraphType:function(graphType) {
			this.set("widgetData.grapPlotType",graphType); //No I18N
			this.set("widgetData.apiData",$.extend(true,{},this.get('widgetData.apiData'))); //No I18N
		}
	}
});

OPMClient.NfaCbqosConfiglistComponent = Ember.Component.extend({
	templateName: "components/nfa-cbqos-configlist", //NO I18N
	didInsertElement: function(){
		OPMClient.SettingsNFAConfigController.set("qosNbarEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentDisabledInterfaces", []); //NO I18N
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			nfa_getCBQoSData(this.get("isFrom"), this.get('controller.model'));
		});
	},
	actions: {
		updatePollingStatus: function(isFrom){
			OPMClient.SettingsNFAConfigController.set("clearCbqosNbarTimer", true); //NO I18N
			OPMClient.SettingsNFAConfigController.set("qosNbarLoadingDevices", []); //NO I18N
			var url = window.OPM.apiUrlPattern+"/nfaqosnbar/enableDisableCBQoS"; //NO I18N
			var data = {};
			if(OPMClient.SettingsNFAConfigController.qosNbarRecentEnabledInterfaces.length != 0 || OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces.length != 0){
				data.enInfLst = JSON.stringify(OPMClient.SettingsNFAConfigController.qosNbarRecentEnabledInterfaces);
				data.disInfLst = JSON.stringify(OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces);
			}
			if(isFrom == "settings"){
				data.pollInterval = $("#pollint").val();
				data.timeout = $("#timeout").val();
			}
			var response = opm_ajaxPostRequest(url, data);
			showMessage(response);
			if(isFrom == "inventory" && response.error == undefined){
				this.send("slideCloseAction"); //NO I18N
			}else if(isFrom == "settings"){ //NO I18N
				if(response.error == undefined){
					OPMClient.SettingsNFAConfigController.set("qosNbarRecentEnabledInterfaces", []); //NO I18N
					OPMClient.SettingsNFAConfigController.set("qosNbarRecentDisabledInterfaces", []); //NO I18N
				}
			}
		},
		settingsQoSFetchPolicy: function(){
			var selectedIPs = initializeQosNbarTable("nfaCBQoSList"); //NO I18N
			if(selectedIPs){
				nfa_fetchQoSPolicyForDevices(selectedIPs); //NO I18N
			}
		},
		slideCloseAction: function(){
			if(!OPMClient.SettingsNFAConfigController.clearCbqosNbarTimer){
				OPMClient.SettingsNFAConfigController.set("clearCbqosNbarTimer",true); //NO I18N
			}
			opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub"); //NO I18N
		}
	},
	willDestroyElement: function(){
		OPMClient.SettingsNFAConfigController.set("qosNbarEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentDisabledInterfaces", []); //NO I18N
	}
});

OPMClient.NfaNbarConfiglistComponent = Ember.Component.extend({
	templateName: "components/nfa-nbar-configlist", //NO I18N
	didInsertElement: function(){
		OPMClient.SettingsNFAConfigController.set("qosNbarEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentDisabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarSelectedIPs", []); //NO I18N
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			nfa_getNBARData(this.get("isFrom"), this.get('controller.model'));
		});
	},
	actions: {
		checkNBARStatus: function(){
			var selectedIPs = initializeQosNbarTable("nfaNBARList"); //NO I18N
			if(selectedIPs){
				nfa_checkNBARStatusForDevices(selectedIPs);
			}
		},
		enableDisableNBAR: function(action){
			var selectedIPs = initializeQosNbarTable("nfaNBARList"); //NO I18N
			if(selectedIPs){
				nfa_enableDisableNBAR(selectedIPs, action);
			}
		},
		updatePollingStatus: function(isFrom){
			OPMClient.SettingsNFAConfigController.set("clearCbqosNbarTimer", true); //NO I18N
			OPMClient.SettingsNFAConfigController.set("qosNbarLoadingDevices", []); //NO I18N
			var url = window.OPM.apiUrlPattern+"/nfaqosnbar/enablePoll"; //NO I18N
			var data = {};
			if(OPMClient.SettingsNFAConfigController.qosNbarRecentEnabledInterfaces.length != 0 || OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces.length != 0){
				data.enInfLst = JSON.stringify(OPMClient.SettingsNFAConfigController.qosNbarRecentEnabledInterfaces);
				data.disInfLst = JSON.stringify(OPMClient.SettingsNFAConfigController.qosNbarRecentDisabledInterfaces);
				data.RouterIP = JSON.stringify(OPMClient.SettingsNFAConfigController.qosNbarSelectedIPs);
			}
			if(isFrom == "settings"){
				data.pollInterval = $("#pollint").val();
				data.timeout = $("#timeout").val();
			}
			var response = opm_ajaxPostRequest(url, data);
			showMessage(response);
			if(isFrom == "inventory" && response.error == undefined){
				this.send("slideCloseAction"); //NO I18N
			}else if(isFrom == "settings"){ //NO I18N
				if(response.error == undefined){
					OPMClient.SettingsNFAConfigController.set("qosNbarRecentEnabledInterfaces", []); //NO I18N
					OPMClient.SettingsNFAConfigController.set("qosNbarRecentDisabledInterfaces", []); //NO I18N
					OPMClient.SettingsNFAConfigController.set("qosNbarSelectedIPs", []); //NO I18N
				}
			}
		},
		slideCloseAction: function(){
			if(!OPMClient.SettingsNFAConfigController.clearCbqosNbarTimer){
				OPMClient.SettingsNFAConfigController.set("clearCbqosNbarTimer",true); //NO I18N
			}
			opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub"); //NO I18N
		}
	},
	willDestroyElement: function(){
		OPMClient.SettingsNFAConfigController.set("qosNbarEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentEnabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarRecentDisabledInterfaces", []); //NO I18N
		OPMClient.SettingsNFAConfigController.set("qosNbarSelectedIPs", []); //NO I18N
	}
});

OPMClient.NfaAssociateSnmpComponent = Ember.Component.extend({
	templateName: "components/nfa-associate-snmp", //NO I18N
	showCustomInterfaceNameDiv: false,
	ifNameFormatValue: "$ifDesc", //NO I18N
	initDefaults: function(){
		var snmpMsg = nfa_getSNMPCredentials(this.isFrom);
		this.set("showSNMPMsg", (snmpMsg != false)); //NO I18N
		this.set("snmpMsg", snmpMsg); //NO I18N
		this.set("isAllCollSelected", isAllCollectorSelected());//NO I18N
	}.on("init"), //NO I18N
	didInsertElement: function(){
		$("#associateSNMPHolder .select2").select2(); //NO I18N
		OPMClient.Inventory.getPageForSetSNMP(this.get('controller.model'), this); //NO I18N
	},
	credentialObserver: function(){
		if(this.selectedSNMP == undefined){
			if(OPMClient.SettingsNFAConfigController.associatedSNMP != undefined){
				this.set("selectedSNMP", OPMClient.SettingsNFAConfigController.associatedSNMP); //NO I18N
			}else if(OPMClient.SettingsNFAConfigController.nfaSNMPCredentials.length != 0){
				this.set("selectedSNMP", OPMClient.SettingsNFAConfigController.nfaSNMPCredentials[0].value); //NO I18N
			}
		}else if(OPMClient.SettingsNFAConfigController.newSNMPCredential != ""){ //NO I18N
			this.set("selectedSNMP", OPMClient.SettingsNFAConfigController.newSNMPCredential); //NO I18N
		}
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			$("#snmpCredential").val(this.selectedSNMP).select2(); //NO I18N
		});
	}.observes("OPMClient.SettingsNFAConfigController.nfaSNMPCredentials"), //NO I18N
	snmpMsgObserver: function(){
		if(this.showSNMPMsg){
			var self = this;
			var checkPending = function(){
				(self.showSNMPMsg) ? self.checkPendingSNMP() : clearInterval(timer);
			}
			var timer = setInterval(checkPending, 2000);
		}
	}.observes("showSNMPMsg"), //NO I18N
	checkPendingSNMP: function(){
		var self = this;
		var callBackFunction = function(response){
			if(response.error === undefined){
				self.set("showSNMPMsg", (response.hasOwnProperty("snmpWarningMessage"))); //NO I18N
				self.set("snmpMsg", (response.hasOwnProperty("snmpWarningMessage") ? response.snmpWarningMessage : false)); //NO I18N
			}else{
				showMessage(response); //NO I18N
			}
		};
		nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/snmp/associateCredential", {isRefresh: true}, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
	},
	actions: {
		associateNow: function(){
			OPMClient.Inventory.setSNMPForMultipleDevices(this.get("isFrom"), this); //No I18N
		},
		gotoParentRoute: function(){
			this.send("clearTimer"); //NO I18N
			var parentRoute;
			switch(this.get("isFrom")){
				case "snapshot"	: 	parentRoute = "Inventory.Device"; break; //NO I18N
				case "inventory": 	parentRoute = "Inventory.List."+nfa_getInvListName()+".Sub"; break; //NO I18N
				case "NBAR"		: 	parentRoute = "Settings.NetflowConfig.NBAR"; break; //NO I18N
				case "CBQoS"	: 	parentRoute = "Settings.NetflowConfig.CBQoS"; break; //NO I18N
			}
			opmGlobalRoute.transitionTo(parentRoute);
		},
		addNewSNMPCredential: function(){
			location.href += "/AddSNMPCredential"; //NO I18N
		},
		setSNMP: function(){
			this.send("clearTimer"); //NO I18N
			if(OPMClient.Inventory.setSnmpForPassedDevices(this.isFrom)) {
				this.send("gotoParentRoute"); //NO I18N
			}
		},
		setSNMPBackAction: function(){
			this.send("clearTimer"); //NO I18N
			$("#associateDiv").show(); //NO I18N
			$("#AssociateCredResult").hide(); //NO I18N
		},
		clearTimer: function(){
			this.set("showSNMPMsg", false); //NO I18N
			if(!OPMClient.InventoryNFAController.clearTimer){
				OPMClient.InventoryNFAController.set("clearTimer", true); //NO I18N
			}
		},
		clearSNMPQueue: function() {
			var self = this;
			var callBackFunction = function(response) {
				if(response.error === undefined) {
					self.set("showSNMPMsg", false); //NO I18N
					self.set("snmpMsg", false); //NO I18N
				}
				showMessage(response);
			};
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/snmp/associateCredential", {clearSNMPQueue: true}, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
		},
		interfaceNameTypeChanged: function(type) {
			if(type === "custom") {
				this.set("showCustomInterfaceNameDiv", true); //NO I18N
				this.set("ifNameFormatValue", ""); //NO I18N
			}else {
				this.set("showCustomInterfaceNameDiv", false); //NO I18N
				this.set("ifNameFormatValue", type); //NO I18N
			}
		},
		showOptionsList: function() {
			$("#ifNameOptionsIcon").hasClass("active") ? $("#ifNameOptionsIcon").removeClass("active") : $("#ifNameOptionsIcon").addClass("active"); //NO I18N
		},
		addInterfaceNameOption: function(value) {
			this.set("ifNameFormatValue", (this.ifNameFormatValue === "" ? value : this.ifNameFormatValue+" "+value)); //NO I18N
		}
	},
	willDestroyElement: function(){
		this.set("showSNMPMsg", false); //NO I18N
		OPMClient.InventoryNFAController.set("clearTimer", true); //No I18N
		OPMClient.CredentialsAddEditController.showOnlySNMP = false;
		OPMClient.CredentialsAddEditController.set("parentRoute",""); //No I18N
	}
});

OPMClient.NfaMultiValueSelectBoxComponent = Ember.Component.extend({
	templateName:"components/nfa-multi-value-select-box", //NO I18N
	customOptions:{"minimumResultsForSearch":10}, //NO I18N
	initDefaults:function() {
		var list = jQuery.extend(true,[],this.contentList);
		var formattedList=[],indexVal=0,flag=false;
		for(var i=0;i<list.length;i++) {
			formattedList.push({name:list[i][this.labelPath],value:list[i][this.valuePath],value1:list[i][this.valuePath1]});
			if((this.value!==undefined && this.value==formattedList[i].value) || (this.value1!==undefined && this.value1==formattedList[i].value1)) {
				formattedList[i].selected="selected"; //NO I18N
				flag = true;
				indexVal = i;
			}
		}
		if(this.prompt!==undefined) {
			formattedList.unshift(jQuery.extend(true,{},this.prompt));
			indexVal++;
		}
		if(formattedList[indexVal]!==undefined && flag) {
			this.setValues(formattedList,indexVal);
		}else if(formattedList[0]!==undefined && this.value===undefined && this.value1===undefined) {
			this.setValues(formattedList,0);
		}
		this.set("optionList",formattedList); //NO I18N
		this.set("className",(this.className)?"select2 "+this.className:"select2"); //NO I18N
	}.on("init").observes("contentList"), //NO I18N
	didInsertElement:function() {
		$("#"+this.elementId+" .select2").select2(this.customOptions); //NO I18N
		$("#"+this.elementId).off().on("select2:open", function() { //NO I18N
			document.querySelector(".select2-search__field").focus(); //NO I18N
		});
	},
	setValues:function(list,index) {
		this.set("value",list[index].value); //NO I18N
		this.set("value1",list[index].value1); //NO I18N
		this.set("labelName",list[index].name); //NO I18N
	},
	actions:{
		listChanged:function() {
			this.set("value",$("#"+this.elementId+" .select2").val()); //NO I18N
			this.set("value1",$("#"+this.elementId+" .select2 option:selected").attr("value1")); //NO I18N
			this.set("labelName",$("#"+this.elementId+" .select2 option:selected").text()); //NO I18N
		}
	}
});

OPMClient.NfaReportsSourceComponent = Ember.Component.extend({
	templateName: "components/nfa-reports-source", //NO I18N
	sourceList : [
		{name:Ember.I18n.t("webclient.Select.source"),			value:"-1"}, //NO I18N
		{name:Ember.I18n.t("widget.typename.nfainterface"),		value:"1"}, //NO I18N
		{name:Ember.I18n.t("alertProfile.ipGroup"),				value:"3"}, //NO I18N
		{name:Ember.I18n.t("alertProfile.interfaceGroup"),		value:"2"}, //NO I18N
		{name:Ember.I18n.t("webclient.nfa.accessPoint"),		value:"4"}, //NO I18N
		{name:Ember.I18n.t("webclient.nfa.accessPoint.group"),	value:"5"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.SSID"),			value:"7"}, //NO I18N
		{name:Ember.I18n.t("webclient.nfa.ssidGrp"),			value:"6"}, //NO I18N
		{name:Ember.I18n.t("nfa.cloud.interface"),				value:"8"} //NO I18N
	],
	selectedSource : "-1", //NO I18N
	showSourceList : false,
	showRouterList : true,
	sourceflag:false,
	initDefaults:function() {
		if(this.selectedSourceID!==undefined) {
			this.set("sourceflag",true); //NO I18N
		}
		var sList = nfa_getSelect2List(jQuery.extend(true,[],this.sourceList),"value",this.selectedSource); //NO I18N
		if(this.excludeList!=undefined) {
			for(var i=0;i<sList.length;i++){
				sList[i].isHide = this.excludeList.contains(sList[i].value);
			}
		}
		this.set("sourceList",sList); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
		this.sourceTypeChanged();
		if(this.sourceflag) {
			this.set("sourceflag",false); //NO I18N
		}
		$("#"+this.elementId+" .select2").select2(); //NO I18N
	},
	getDeviceList: function(isWLC,key) {
		if(this.list[key]==undefined || this.list[key].length==0){
			this.set("list."+key,((this.selectedSource === "8") ? nfa_getCloudRegionsList() : nfa_getDeviceList(isWLC))); //NO I18N
		}
		this.set("deviceList",jQuery.extend(true,[],this.list[key])); //NO I18N
		if(!this.sourceflag){
			this.set("selectedRouterID",""); //NO I18N
			this.set("selectedRouterID",(this.deviceList.length!=0)?this.deviceList[0].routerID:""); //NO I18N
		}else {
			this.getInterfaceList();
		}
	},
	getInterfaceList:function() {
		if(this.selectedRouterID!=="" && this.selectedRouterID!==undefined) { //NO I18N
			if(this.list[this.selectedRouterID]==undefined) {
				this.set("list."+this.selectedRouterID,((this.selectedSource === "8") ? nfa_getCloudInterfacesList(this.selectedRouterID) : nfa_getInterfaceList(this.selectedRouterID,(this.selectedSource==="4")))); //NO I18N
			}
			this.updateSource(this.selectedRouterID);
		}else{
			this.set("interfaceList", []); //NO I18N
		}
	}.observes("selectedRouterID"), //NO I18N
	getInterfaceGroupList:function() {
		if(this.list.interfaceGroupList==undefined || this.list.interfaceGroupList.length==0){
			var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/listIntfGroup",{showDetails:false}); //NO I18N
			this.set("list.interfaceGroupList",jsonData.Group_List); //NO I18N
		}
		this.updateSource("interfaceGroupList"); //NO I18N
	},
	getIpGroupList:function() {
		if(this.list.ipGroupList==undefined || this.list.ipGroupList.length==0){
			var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaipgroup/listIPGroup",{showDetails:false}); //NO I18N
			this.set("list.ipGroupList",jsonData.IPGroup_List); //NO I18N
		}
		this.updateSource("ipGroupList"); //NO I18N
	},
	getApMacGroupList:function() {
		if(this.list.apMacGroupList==undefined || this.list.apMacGroupList.length==0){
			this.set("list.apMacGroupList",nfa_getWlcGroupsList(true)); //NO I18N
		}
		this.updateSource("apMacGroupList"); //NO I18N
	},
	getSSIDGroupList:function() {
		if(this.list.ssidGroupList==undefined || this.list.ssidGroupList.length==0){
			this.set("list.ssidGroupList",nfa_getWlcGroupsList(false)); //NO I18N
		}
		this.updateSource("ssidGroupList"); //NO I18N
	},
	getSSIDList:function() {
		if(this.list.ssidList==undefined || this.list.ssidList.length==0){
			this.set("list.ssidList",nfa_getSSIDList()); //NO I18N
		}
		this.updateSource("ssidList"); //NO I18N
	},
	updateSource:function(key) {
		this.set("interfaceList",jQuery.extend(true,[],this.list[key])); //NO I18N
		if(!this.sourceflag){
			this.set("selectedSourceID",(this.interfaceList.length!=0)?this.interfaceList[0].ID:""); //NO I18N
		}
	},
	sourceTypeChanged:function() {
		this.set("showSourceList",(this.selectedSource != "-1")); //NO I18N
		this.set("showRouterList",(this.selectedSource === "1" || this.selectedSource === "4" || this.selectedSource === "8")); //NO I18N
		if(this.selectedSource != "-1") { //NO I18N
			switch(this.selectedSource) {
				case "1" 	: 	this.set("listTitle1",Ember.I18n.t("webclient.cusreports.selDevice")); //NO I18N
								this.set("listTitle2",Ember.I18n.t("webclient.fwa.select.interface")); //NO I18N
								this.getDeviceList(false,"routerList"); break; //NO I18N
				case "4" 	: 	this.set("listTitle1",Ember.I18n.t("nfa.reports.selectcontroller")); //NO I18N
								this.set("listTitle2",Ember.I18n.t("nfa.reports.selectaccesspoint")); //NO I18N
								this.getDeviceList(true,"wlcDeviceList"); break; //NO I18N
				case "2" 	: 	this.set("listTitle2",Ember.I18n.t("webclient.Select.Intf.Group")); //NO I18N
								this.getInterfaceGroupList(); break;
				case "3" 	: 	this.set("listTitle2",Ember.I18n.t("webclient.Select.IP.Group")); //NO I18N
								this.getIpGroupList(); break;
				case "5" 	: 	this.set("listTitle2",Ember.I18n.t("nfa.select.apmacGroup")); //NO I18N
								this.getApMacGroupList(); break;
				case "6" 	: 	this.set("listTitle2",Ember.I18n.t("nfa.select.ssidGroup")); //NO I18N
								this.getSSIDGroupList(); break;
				case "7" 	: 	this.set("listTitle2",Ember.I18n.t("nfa.select.ssid")); //NO I18N
								this.getSSIDList(); break;
				case "8" 	: 	this.set("listTitle1",Ember.I18n.t("nfa.select.region")); //NO I18N
								this.set("listTitle2",Ember.I18n.t("nfa.select.cloudInterface")); //NO I18N
								this.getDeviceList(false,"cloudRegionsList"); break; //NO I18N
			}
		}
	}.observes("selectedSource"), //NO I18N
	actions:{
		sourceTypeChanged: function() {
			this.set("selectedSource",$("#"+this.elementId+" .sourceList").val()); //NO I18N
		}
	},
	willDestroyElement: function(){
	}
});

OPMClient.NfaListBoxComponent = Ember.Component.extend({
	templateName:"components/nfa-list-box", //NO I18N
	classNames:["ddType1"], //NO I18N
	attributeBindings:["title"], //NO I18N
	title:"", //NO I18N
	iconName:"schedule", //NO I18N
	listOpenCloseEvent:function(e) {
		var container = $(".ddType1__view"); //NO I18N
		if(!container.is(e.target) && container.has(e.target).length===0) {
			container.removeClass("active"); //NO I18N
		}
	},
	initDefaults:function() {
		if(this.selectedValue===undefined) {
			this.set("selectedName",this.contentList[0].name); //NO I18N
			this.set("selectedValue",this.contentList[0].value); //NO I18N
		}else {
			this.contentListChanged();
		}
		this.set("title",getI18nValue(this.title)); //NO I18N
		this.set("xlinkIcon","/apiclient/fluidicv2/img/sprite-opm.svg#"+this.iconName); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
		$(document).bind("mouseup",this.listOpenCloseEvent); //NO I18N
	},
	contentListChanged:function() {
		var selectedName="", list = jQuery.extend(true,[],this.contentList); //NO I18N
		for(var i=0;i<list.length;i++) {
			if(list[i].value==this.selectedValue) {
				list[i].className = "active"; //NO I18N
				selectedName = list[i].name;
			}else {
				list[i].className = ""; //NO I18N
			}
		}
		this.set("selectedName",selectedName); //NO I18N
		this.set("contentList",list); //NO I18N
	}.observes("selectedValue"), //NO I18N
	actions:{
		listChanged:function(value) {
			if(value===this.whenValue && this.openSlide!==undefined) {
				slideIn(this.openSlide);
			}else if(this.selectedValue!==value) {
				this.set("selectedValue",value); //NO I18N
			}
		},
		toggleTheList:function() {
			var isOpen = $("#"+this.elementId+" .ddType1__view").hasClass("active"); //NO I18N
			if($(".ddType1__view").hasClass("active")) { //NO I18N
				$(".ddType1__view").removeClass("active"); //NO I18N
			}
			if(!isOpen) {
				$("#"+this.elementId+" .ddType1__view").addClass("active"); //NO I18N
			}
		}
	},
	willDestroyElement:function() {
		$(document).unbind("mouseup",this.listOpenCloseEvent); //NO I18N
		$("#"+this.elementId).remove(); //NO I18N
	}
});

OPMClient.NfaCustomTimeComponent = Ember.Component.extend({
	templateName: "components/nfa-custom-time", //NO I18N
	classNames:["settingsContent"], //NO I18N
	timeFrameDiff:"hourly", //NO I18N
	startTime:"", //NO I18N
	endTime:"", //NO I18N
	minDate:"", //NO I18N
	isCompact:true,
	restrictMinDate:false,
	initDefaults:function() {
		this.set("fromDateLabel",Ember.I18n.t((this.fromDateLabel || "webclient.devices.details.avail.from"))); //NO I18N
		this.set("toDateLabel",Ember.I18n.t((this.toDateLabel || "webclient.devices.details.avail.to"))); //NO I18N
		if(this.startTime==undefined || this.startTime=="") { //NO I18N
			var self = this;
			callBckFunc = function(jsonData,self) {
				self.set("startTime",jsonData.startTime); //NO I18N
				self.set("endTime",jsonData.endTime); //NO I18N
			};
			var apiURL = window.OPM.apiUrlPattern+"/nfaadmin/getCurrentTime"; //NO I18N
			nfa_getAjaxResponseWithAsync(apiURL,{TimeFrame:this.timeFrameDiff},callBckFunc,self);
		}else {
			this.splitStartTime();
			this.splitEndTime();
		}
		if(this.restrictMinDate) {
			this.set("minDate", this.startTime); //NO I18N
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		$("#"+this.elementId+" .customTimeDate").datepicker({dateFormat:"yy-mm-dd", minDate:this.minDate}); //NO I18N
	},
	splitStartTime:function() {
    		var tm = this.startTime.split(" "); //NO I18N
    		var hm = tm[1].split(":"); //NO I18N
    		this.set("fromDate",tm[0]); //NO I18N
    		this.set("fromHours",hm[0]); //NO I18N
    		this.set("fromMinutes",hm[1]); //NO I18N
    	}.observes("startTime"), //NO I18N
    	splitEndTime:function() {
    		var tm = this.endTime.split(" "); //NO I18N
    		var hm = tm[1].split(":"); //NO I18N
    		this.set("toDate",tm[0]); //NO I18N
    		this.set("toHours",hm[0]); //NO I18N
    		this.set("toMinutes",hm[1]); //NO I18N
    	}.observes("endTime"), //NO I18N
	setStartTime:function() {
		this.set("startTime",this.fromDate+" "+this.fromHours+":"+this.fromMinutes); //NO I18N
	}.observes("fromDate","fromHours","fromMinutes"), //NO I18N
	setEndTime:function() {
		this.set("endTime",this.toDate+" "+this.toHours+":"+this.toMinutes); //NO I18N
	}.observes("toDate","toHours","toMinutes") //NO I18N
});

OPMClient.NfaCommonGraphComponent = Ember.Component.extend({
	templateName: "components/nfa-common-graph", //NO I18N
	graphType:"area", //NO I18N
	arraObj:{},
	didInsertElement:function() {
		var graphParams = this.get("graphParams"); //NO I18N
		if(graphParams!==undefined) {
			$("#"+this.elementId+" .chartTypeIcons li.active").removeClass("active"); //NO I18N
			$("#"+this.elementId+" .chartTypeIcons li."+this.graphType).addClass("active"); //NO I18N
			nfa_loadGraph(graphParams);
		}
	},
	reloadObserver:function() {
		this.rerender();
	}.observes("graphParams"), //NO I18N
	actions:{
		changeGraphType:function(graphType) {
			var graphParams = jQuery.extend(false,{},this.graphParams);
			graphParams.graphPlotType = graphType;
			this.set("graphType",graphType); //NO I18N
			this.set("graphParams",graphParams); //NO I18N
		}
	}
});

OPMClient.NfaProtocolReportComponent = Ember.Component.extend({
	templateName: "components/nfa-protocol-report", //NO I18N
	timeFrameList:nfa_getReportsTimeFrames(true),
	trafficTypeList:[
		{name: Ember.I18n.t("webclient.widget.disk.volume"),value:"volume"}, //NO I18N
		{name: Ember.I18n.t("webclient.map.flash.speed"),value:"speed"}, //NO I18N
		{name: Ember.I18n.t("webclient.devices.intftypes.utilization"),value:"percentage"} //NO I18N
	],
	flowTypeList:[
		{name: Ember.I18n.t("NFAWidget.IN"),value:"IN",checked:"checked"}, //NO I18N
		{name: Ember.I18n.t("NFAWidget.OUT"),value:"OUT",checked:""} //NO I18N
	],
	pageTitle : Ember.I18n.t("webclient.protocoldistribution"), //NO I18N
	selectedSource : "-1", //NO I18N
	flowType : "IN", //NO I18N
	trafficType : "speed", //NO I18N
	timeFrame : "hourly", //NO I18N
	graphPlotType: "area", //NO I18N
	showInputForm:true,
	genReport:false,
	initDefaults : function() {
		this.set("list",{}); //NO I18N
		this.flowTypeChanged();
		this.trafficTypeChanged();
		this.timePeriodChanged();
	}.on("init"), //NO I18N
	didInsertElement:function() {
		if(this.genReport) {
			this.send("generateReport"); //NO I18N
			this.set("genReport",false); //NO I18N
		}
		$("#"+this.elementId+" .select2").select2(); //NO I18N
		$("body").addClass("nfaForecastReport"); //NO I18N
	},
	flowTypeChanged:function() {
		this.set("flowTypeList",nfa_getCheckedList(jQuery.extend(true,[],this.flowTypeList),"value",this.flowType)); //NO I18N
	}.observes("flowType"), //NO I18N
	trafficTypeChanged:function() {
		this.set("trafficTypeList",nfa_getActiveList(jQuery.extend(true,[],this.trafficTypeList),"value",this.trafficType)); //NO I18N
	}.observes("trafficType"), //NO I18N
	timePeriodChanged:function() {
		if(!this.showInputForm) {
			this.send("generateReport"); //NO I18N
		}
	}.observes("timeFrame"), //NO I18N
	getPDFInputs:function() {
		var headerDetails = jQuery.extend(false,{},this.formData);
		headerDetails.timeFrameString = this.timeFrameString;
		headerDetails.grapPlotType = this.graphPlotType;
		nfa_getReportPDFInputs(headerDetails,this);
		return headerDetails;
	},
	actions: {
		childActions:function(functionName,param1,param2) {
			this.send(functionName,param1,param2);
		},
		updateValues:function(key,value) {
			this.set(key,value);
		},
		generateReport: function() {
			var formData = {DeviceID:this.selectedSourceID,Type:this.trafficType,TimeFrame:this.timeFrame,Data:this.flowType,chartType:"line"}; //NO I18N
			if(this.timeFrame==="custom") { //NO I18N
				if(!nfa_validateCustomTime(this.startTime,this.endTime)){
					return;
				}
				formData.StartTime = this.startTime;
				formData.EndTime = this.endTime;
			}
			if(this.selectedSource==="-1" || this.selectedSourceID===undefined || this.selectedSourceID==="") { //NO I18N
				nfa_showNoDeviceAlert(this.selectedSource);
				return;
			}
			formData.BussView = (this.selectedSource==="2"); //NO I18N
			formData.IPGroup = (this.selectedSource==="3"); //NO I18N

			this.set("apiURL",window.OPM.apiUrlPattern+"/v2/nfadevice/getProtocolData"); //NO I18N
			this.set("formData",formData); //NO I18N
			var self = this;
			$.ajax({
				url:self.apiURL,
				type:"GET", //NO I18N
				data:self.formData,
				self:self,
				async:true,
				beforeSend: function(jqXHR,settings) {
					uniqueId = opm_infoMsgs("infoMsg",Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
					appendCollectorDetails(jqXHR,settings);
				},
				success: function(jsonData) {
					if(jsonData.error !== undefined) {
						opm_infoMsgs("errorMsg",jsonData.error.message); //NO I18N
						return;
					}else if(jsonData.message !== undefined) {
						opm_infoMsgs("infoMsg",jsonData.message); //NO I18N
					}
					this.self.set("apiData",jsonData); //NO I18N
					this.self.set("showInputForm",false); //NO I18N
					$("#"+uniqueId).remove(); //NO I18N
				}
			});
		},
		flowTypeChanged:function(type) {
			this.set("flowType",type); //NO I18N
		},
		trafficTypeChanged: function(type) {
			this.set("trafficType",type); //NO I18N
		},
		exportToMail:function() {
			OPMClient.NFAReportsPDFCurrentApiurl = this.apiURL;
			OPMClient.NFAReportsController.formData = this.getPDFInputs();
			OPMClient.NFAReportsController.set("formData.reportTitle",this.pageTitle); //NO I18N
			loadMailDataInOneClickForm("webclient.protocoldistribution"); //NO I18N
		},
		exportToPDF:function() {
			var headerDetails = this.getPDFInputs();
			var formElements = [];
			for (var key in headerDetails) {
			  formElements.push({name:key,value:headerDetails[key]});
			}
			nfa_exportPDFReport(this.apiURL,"ProtocolDistribution",this.pageTitle,formElements); //NO I18N
		},
		exportToCSV:function() {
			var headerDetails = this.getPDFInputs();
			headerDetails.tablediv = "trafficList"; //NO I18N
			headerDetails.StartTime = this.apiData.startTime;
			headerDetails.EndTime = this.apiData.endTime;
			nfa_ReportsToCSV(this.pageTitle,headerDetails);
		}
	},
	willDestroyElement: function(){
		delete OPMClient.NFAReportsController.formData;
		$("body").removeClass("nfaForecastReport"); //NO I18N
	}
});

OPMClient.NfaReportPageComponent = Ember.Component.extend({
	templateName: "components/nfa-report-page", //NO I18N
	initflag:false,
	showEditReport:false,
	graphPlotType:"area", //NO I18N
	initDefaults:function() {
		if(this.isForecastReport) {
			this.set("isBussAlert1",this.isBussAlert); //NO I18N
			this.set("bussStartTime1",this.bussStartTime); //NO I18N
			this.set("bussEndTime1",this.bussEndTime); //NO I18N
			this.set("isExWeekend1",this.isExWeekend); //NO I18N
		}
		if(this.showRouterList) {
			this.set("routerID",this.selectedRouterID); //NO I18N
			this.set("routerIP",this.selectedRouterIP); //NO I18N
			this.set("routerName",this.selectedRouterName); //NO I18N
		}
		this.set("interfaceID",this.selectedSourceID); //NO I18N
		this.set("interfaceName",this.selectedSourceName); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
		$("#"+this.elementId+" .select2").select2(); //NO I18N
		this.loadReport();
	},
	getInterfaceList:function() {
		if(!this.initflag){this.set("initflag",true);return;}
		this.set("interfaceList",nfa_getInterfaceList(this.routerID,(this.selectedSource==="4"))); //NO I18N
		if(this.interfaceList.length!=0) {
			this.set("interfaceID",this.interfaceList[0].ID); //NO I18N
		}
	}.observes("routerID"), //NO I18N
	loadReport: function() {
		var apiData = this.apiData;
		var formData = this.formData;
		var gparams = {}
		gparams.id = "reportGraph"; //NO I18N
		gparams.data = apiData.GraphData;
		gparams.graphPlotType = this.graphPlotType;
		gparams.yAxis = apiData.yAxis;
		gparams.title = (apiData.granularity)?apiData.granularity:""; //NO I18N

		var gridDetails;
		if(this.isForecastReport) {
			gparams.TimeFrame = "yearly"; //NO I18N
			gparams.legend =  nfa_getForecastGraphLegend();
			gridDetails = OPMClient.InventoryPDFParams.get("nfaTShootTraffTbl"); //NO I18N
			gridDetails.data = apiData.TrafficData;
		}else {
			gparams.TimeFrame = formData.TimeFrame;
			gparams.hAlign = "right"; //NO I18N
			gparams.vAlign = "top"; //NO I18N
			gridDetails = OPMClient.InventoryPDFParams.get("ProtocolDistribution"); //NO I18N
			gridDetails.data = apiData.result;
		}
		this.set("graphParams",gparams); //NO I18N

		validateGridColumnDetails(gridDetails.colModelList,gridDetails.colNamesList);
		$("#trafficList").jqGrid("GridUnload"); //NO I18N
		opm_loadJQgridWithData("#trafficList",gridDetails.data,gridDetails.colNamesList,gridDetails.colModelList,"","#trafficListPager","",""); //NO I18N
		$('#trafficList').jqGrid('setGridWidth',$("#trafficList").closest(".opmFormHolder").width()-30); //NO I18N
		$("#trafficList").addClass("ut ut-Grid"); //NO I18N
		slideOut(5);
	}.observes("apiData"), //NO I18N
	actions: {
		subChildActions:function(functionName,param1) {
			this.sendAction("action",functionName,param1); //NO I18N
			this.sendAction("action","generateReport"); //NO I18N
		},
		exportActions:function(functionName) {
			this.sendAction("action",functionName); //NO I18N
		},
		updateReport:function() {
			if(this.isForecastReport) {
				this.sendAction("action","updateValues","isBussAlert",this.isBussAlert1); //NO I18N
				this.sendAction("action","updateValues","bussStartTime",this.bussStartTime1); //NO I18N
				this.sendAction("action","updateValues","bussEndTime",this.bussEndTime1); //NO I18N
				this.sendAction("action","updateValues","isExWeekend",this.isExWeekend1); //NO I18N
			}
			if(this.showRouterList) {
				this.sendAction("action","updateValues","selectedRouterID",this.routerID); //NO I18N
				this.sendAction("action","updateValues","selectedRouterIP",this.routerIP); //NO I18N
				this.sendAction("action","updateValues","selectedRouterName",this.routerName); //NO I18N
			}
			this.sendAction("action","updateValues","selectedSourceID",this.interfaceID); //NO I18N
			this.sendAction("action","updateValues","selectedSourceName",this.interfaceName); //NO I18N

			OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: false}); //NO I18N

			this.sendAction("action","generateReport"); //NO I18N
			this.set("showEditReport",false); //NO I18N
		},
		customTimeChanged:function() {
			if(nfa_validateCustomTime(this.startTime, this.endTime)){
				if(this.timeFrame==="custom"){ //NO I18N
					this.sendAction("action","generateReport"); //NO I18N
				}else{
					this.set("timeFrame","custom"); //NO I18N
				}
				slideOut(6);
			}
		},
		closeCustomTime: function() {
			slideOut(6);
		},
		openEditReport: function() {
			slideIn(5);
			this.set("showEditReport",true); //NO I18N
		},
		closeEditReport: function() {
			slideOut(5);
			this.set("showEditReport",false); //NO I18N
		},
		closeReport: function() {
			OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: false}); //NO I18N
			this.set("showInputForm",true); //NO I18N
		},
		openOneClickSchedule: function(){
			slideIn(5);
			var inputData = {
				task: "Add", //NO I18N
				goBackRoute: "5", //NO I18N
				selectedSource: this.selectedSource,
				oneClickDeviceID: JSON.stringify([this.selectedSourceID]),
				selectedReportType: "protocol" //NO I18N
			};
			this.set("scheduleInputData", inputData); //NO I18N
			this.set("showScheduleForm", true); //NO I18N
		},
		closeOneClickSchedule: function(){
			slideOut(5);
			this.set("showScheduleForm", false); //NO I18N
		},
		openFavoriteSlide: function() {
			this.set("selectedTimePeriod", this.timeFrame); //NO I18N
			this.set("parentModel", this); //NO I18N
			this.set("showFavoriteReportSlide", true); //NO I18N
		}
	}
});

OPMClient.NfaCustomPagerComponent = Ember.Component.extend({
	templateName:"components/nfa-custom-pager", //NO I18N
	classNames:["opm_jqGridCustomPager"], //NO I18N
	prevPageClass:"previous iconDisabled", //NO I18N
	nextPageClass:"next", //NO I18N
	callBckFuncName:"reload", //NO I18N
	rowsList:[10,50,100,500,1000,2000,5000],
	pageCount:1,
	rows:50,
	didInsertElement:function() {
		$("#"+this.elementId+" .nfaCustomerPagination .rowCount").val(this.rows); //NO I18N
	},
	nextPageObserver:function() {
		this.set("nextPageClass",(this.nextPage)?"next":"next iconDisabled"); //NO I18N
	}.observes("nextPage"), //NO I18N
	actions:{
		goToPrevPage:function(){
			if(this.pageCount > 1) {
				this.set("pageCount",(this.pageCount-1)); //NO I18N
				this.set("prevPageClass",(this.pageCount==1)?"previous iconDisabled":"previous"); //NO I18N
				if(this.action != undefined) {
					this.sendAction("action",this.callBckFuncName,this.pageCount,this.rows); //NO I18N
				}
			}
		},
		goToNextPage:function(){
			if(this.nextPage) {
				this.set("pageCount",(this.pageCount+1)); //NO I18N
				this.set("prevPageClass","previous"); //NO I18N
				if(this.action != undefined) {
					this.sendAction("action",this.callBckFuncName,this.pageCount,this.rows); //NO I18N
				}
			}
		},
		rowCountChanged:function() {
			this.set("pageCount",1); //NO I18N
			this.set("rows",$("#"+this.elementId+" .nfaCustomerPagination .rowCount").val()); //NO I18N
			if(this.action != undefined) {
				this.sendAction("action",this.callBckFuncName,this.pageCount,this.rows); //NO I18N
			}
		},
		exportCSV:function() {
			opm_generateCSV($(this.gridID));
		},
		exportXLS:function() {
			opm_generateXLSFromServer($(this.gridID));
		}
	}
});

OPMClient.NfaSpinnerLoaderComponent = Ember.Component.extend({
	templateName: "components/nfa-spinner-loader", //No I18N
	classNames:["spinner-loader"], //No I18N
	attributeBindings: ['style'],
	style:"",
	didInsertElement:function() {
	},
	willDestroyElement:function(){
		$('#'+this.elementId).remove();
	}
});

OPMClient.NfaReportsSourceMultiselectComponent = Ember.Component.extend({
	templateName: "components/nfa-reports-source-multiselect", //NO I18N
	showAllSelectDiv:true,
	showSourceList:true,
	initDefaults: function(){
		if(this.sourceList === undefined){
			var sList = [
				{name: Ember.I18n.t("webclient.Select.source"), value: "-1", isSelected: true}, //NO I18N
				{name: Ember.I18n.t("widget.typename.nfainterface"), value: "1", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("alertProfile.ipGroup"), value: "3", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("alertProfile.interfaceGroup"), value: "2", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("webclient.nfa.accessPoint"), value: "4", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("webclient.nfa.accessPoint.group"), value: "5", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("webclient.reports.SSID"), value: "7", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("webclient.nfa.ssidGrp"), value: "6", isSelected: false}, //NO I18N
				{name: Ember.I18n.t("NFA.asView"), value: "14", isSelected: false} //NO I18N
			];
			if(window.OPM.isAdministrator){
				sList.push({name: Ember.I18n.t("NFADB.L4Apps"), value: "11", isSelected: false}, {name: Ember.I18n.t("NFADB.L7Apps"), value: "12", isSelected: false}); //NO I18N
			}
			this.set("sourceList", sList); //NO I18N
		}
		if(this.selectedSource !== undefined){
			for(var i=0; i<this.sourceList.length; i++){
				this.sourceList[i].isSelected = (this.sourceList[i].value == this.selectedSource);
			}
		}else {
			this.set("selectedSource", "-1"); //NO I18N
		}

		if(this.excludeList != undefined){
			for(var i=0; i<this.sourceList.length; i++){
				this.sourceList[i].isHide = this.excludeList.contains(this.sourceList[i].value);
			}
		}
		if(this.isAllDeviceSelected == undefined){this.set("isAllDeviceSelected", true);} //NO I18N
		if(this.lists == undefined){this.set("lists", {});} //NO I18N
		this.selectAllDivName();
		this.send("sourceTypeChanged"); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement: function(){
		$("#"+this.elementId+" .sourceList.select2").select2(); //NO I18N
		if(!this.hideSourceSelection) {
			this.set("selectedSourceName",$("#"+this.elementId+" .sourceList option:selected").text()); //NO I18N
		}
	},
	selectAllDivName:function() {
		if(this.selectedSource!=="-1") { //NO I18N
			var text = ""; //NO I18N
			switch(this.selectedSource){
				case "1"	: text = "nfa.all.interfaces"; break; //NO I18N
				case "2"	: text = "nfa.all.intfGroups"; break; //NO I18N
				case "3"	: text = "nfa.all.ipGroups"; break; //NO I18N
				case "4"	: text = "nfa.all.accessPoints"; break; //NO I18N
				case "5"	: text = "nfa.all.apGroups"; break; //NO I18N
				case "6"	: text = "nfa.all.ssidGroups"; break; //NO I18N
				case "7"	: text = "nfa.all.ssids"; break; //NO I18N
			}
			this.set("selectAllDivText",Ember.I18n.t(text)); //NO I18N
			this.allDeviceSelectionChanged();
		}
		$("#selectedList option").remove(); //NO I18N
		$("#remainingList option").remove(); //NO I18N
	}.observes("selectedSource"), //NO I18N
	getIntfIPGroupsList: function(isIPGroup){
		var apiURL = window.OPM.apiUrlPattern+((isIPGroup) ? "/nfaipgroup/listIPGroup" : "/nfaadmin/listIntfGroup"); //NO I18N
		var jsonData = nfa_getAjaxResponse(apiURL, {showDetails: false});
		var groupsList = (isIPGroup) ? jsonData.IPGroup_List : jsonData.Group_List;
		(isIPGroup) ? this.set("lists.availableIPGroups", groupsList) : this.set("lists.availableInterfaceGroups", groupsList); //NO I18N
	},
	getWlcGroupsList: function(apiURL, isSSIDGroup){
		var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+apiURL);
		var list = [];
		for(var i=0; i<jsonData.Group_List.length; i++) {
			list.push({name: jsonData.Group_List[i].Name, ID: jsonData.Group_List[i].ID});
		}
		(isSSIDGroup) ? this.set("lists.availableSSIDGroups", list) : this.set("lists.availableAPGroups", list); //NO I18N
	},
	getSSIDList: function(){
		var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfadevice/listSSIDForMultiSel"); //NO I18N
		var list = [];
		for(var i=0; i<jsonData.length; i++) {
			list.push({Name: jsonData[i][1], ID: jsonData[i][0]});
		}
		this.set("lists.availableSSIDs", list); //NO I18N
	},
	allDeviceSelectionChanged: function(){
		this.send("sourceTypeChanged"); //NO I18N
	}.observes("isAllDeviceSelected"), //NO I18N
	actions: {
		sourceTypeChanged:function(){
			if(!this.hideSourceSelection) {
				this.set("selectedSource", ($("#"+this.elementId+" .sourceList").val() != undefined) ? $("#"+this.elementId+" .sourceList").val() : ((this.selectedSource != undefined) ? this.selectedSource : "-1")); //NO I18N
				this.set("selectedSourceName",$("#"+this.elementId+" .sourceList option:selected").text()); //NO I18N
			}
			if(this.selectedSource != "-1" && !this.isAllDeviceSelected){ //NO I18N
				switch(this.selectedSource) {
					case "2" 	: 	if(this.lists.availableInterfaceGroups == undefined){
										this.getIntfIPGroupsList(false);
									}
									this.set("lists.availableList", this.lists.availableInterfaceGroups);//NO I18N
									this.set("lists.selectedList", this.lists.selectedInterfaceGroups);//NO I18N
									break;
					case "3" 	: 	if(this.lists.availableIPGroups == undefined){
										this.getIntfIPGroupsList(true);
									}
									this.set("lists.availableList", this.lists.availableIPGroups);//NO I18N
									this.set("lists.selectedList", this.lists.selectedIPGroups);//NO I18N
									break;
					case "5" 	:	if(this.lists.availableAPGroups == undefined){
										this.getWlcGroupsList("/nfaadmin/listAPGroup", false); //NO I18N
									}
									this.set("lists.availableList", this.lists.availableAPGroups);//NO I18N
									this.set("lists.selectedList", this.lists.selectedAPGroups);//NO I18N
									break;
					case "6" 	:	if(this.lists.availableSSIDGroups == undefined){
										this.getWlcGroupsList("/nfaadmin/listSSIDGroup", true); //NO I18N
									}
									this.set("lists.availableList", this.lists.availableSSIDGroups);//NO I18N
									this.set("lists.selectedList", this.lists.selectedSSIDGroups);//NO I18N
									break;
					case "7"	: 	if(this.lists.availableSSIDs == undefined){
										this.getSSIDList();
									}
									this.set("lists.availableList", this.lists.availableSSIDs);//NO I18N
									this.set("lists.selectedList", this.lists.selectedSSIDs);//NO I18N
									break;
				}
			}
			this.set("showMultiAssociationDiv", ((!(this.selectedSource == "1" || this.selectedSource == "4")) && this.selectedSource != "-1")); //NO I18N
		}
	},
	willDestroyElement: function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaInventoryReportConfigComponent = Ember.Component.extend({
	templateName:"components/nfa-inventory-report-config", //NO I18N
	inPercentileLabel: Ember.I18n.t("nfa.report.in.nthPercentail",{n:window.OPM.nfaPercentile}), //NO I18N
	outPercentileLabel: Ember.I18n.t("nfa.report.out.nthPercentail",{n:window.OPM.nfaPercentile}), //NO I18N
	showFormSource: true,
	showFormTime: true,
	conditionList: [
		{name: ">", value: "greater"}, //NO I18N
		{name: "<", value: "lesser"} //NO I18N
	],
	showOnly95thPerc: false,
	initDefaults: function(){
		this.set("showPercentile",window.OPM.percentileInformation);//NO I18N
		this.set("isBussAlert",window.isNFADefaultBusinessHour);//NO I18N
		this.set("bussStartTime",window.NFABussHourStartTime);//NO I18N
		this.set("bussEndTime",window.NFABussHourEndTime);//NO I18N
		this.set("isExWeekend",window.isNFADefaultWeekend);//NO I18N
		this.set("excludeList", (window.isNFAStandardEdition ? ["2", "3", "7", "8"] : ["7", "8"])); //NO I18N
		this.set("speedUnitsList", nfa_getSpeedUnits()); //NO I18N
		this.set("volumeUnitsList", nfa_getVolumeUnits()); //NO I18N
		this.set("defaultSpeedUnit", ((window.OPM.isNFAVolumeCalcWith1024) ? "Mibps":"Mbps")); //NO I18N
		this.set("defaultVolumeUnit", ((window.OPM.isNFAVolumeCalcWith1024) ? "MiB":"MB")); //NO I18N
		this.set("lists", {}); //NO I18N
		this.set("timePeriodList", [ //NO I18N
			{name:Ember.I18n.t("nfa.timeframe.lasthour"),					value:"hourly"}, //NO I18N
			{name:Ember.I18n.t("webclient.reports.timeframe.last6hours"),	value:"6Hour"}, //NO I18N
			{name:Ember.I18n.t("webclient.reports.timeframe.today"),		value:"today"}, //NO I18N
			{name:Ember.I18n.t("webclient.reports.timeframe.yesterday"),	value:"yesterday"}, //NO I18N
			{name:Ember.I18n.t("webclient.reports.timeframe.last7days"),	value:"Weekly"}, //NO I18N
			{name:Ember.I18n.t("webclient.reports.timeframe.last30days"),	value:"Monthly"}, //NO I18N
			{name:Ember.I18n.t("webclient.reports.timeframe.custom"),		value:"custom"} //NO I18N
		]);

		if(OPMClient.NFAReportsController.favoriteReportParams.isFromFavorite) {
			var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfareports/getFavoriteReport", {FavoriteID: OPMClient.NFAReportsController.favoriteReportParams.reportID}); //NO I18N
			if(response.devices.length === 0 && response.params.isAllDeviceSelected === "false") {
				opm_infoMsgs("errorMsg", Ember.I18n.t("nfa.favoriteReport.errorMsg")); //NO I18N
				OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: false}); //NO I18N
			}else {
				this.set("selectedSource", response.params.sourceType); //NO I18N
				this.set("isAllDeviceSelected", response.params.isAllDeviceSelected === "true"); //NO I18N
				if(!this.isAllDeviceSelected) {
					switch(this.selectedSource) {
						case "1"	: 	this.set("lists.selectedIntfList", response.devices); break; //NO I18N
						case "4"	: 	this.set("lists.selectedAPList", response.devices); break; //NO I18N
						case "2"	: 	nfa_getSourceList(this, "interfacegroup", response.devices); break; //NO I18N
						case "3"	: 	nfa_getSourceList(this, "ipgroup", response.devices); break; //NO I18N
						case "5"	: 	nfa_getSourceList(this, "accesspointgroup", response.devices); break; //NO I18N
						case "6"	: 	nfa_getSourceList(this, "ssidgroup", response.devices); break; //NO I18N
					}
				}
				OPMClient.NFAReportsController.favoriteReportParams.devices = response.devices;
				this.set("selectedTrafficType", response.params.trafficType); //NO I18N
				var isConvertUnit = (response.params.isUnitCalculationWith1024 !== window.OPM.isNFAVolumeCalcWith1024.toString()); //Checking if data unit type (SI / IEC) is changed
				var criLength = parseInt(response.params.numberOfCriteria), criteria;
				for(var i=0; i<criLength; i++) {
					criteria = response.params["criteria"+i].split(","); //NO I18N
					switch(criteria[0]) {
						case "IN": 			this.set("inConditionValue", criteria[1]); //NO I18N
											this.set("inCriteriaValue3", criteria[2]); //NO I18N
											if(this.selectedTrafficType === "speed") {
												this.set("inSpeedThresholdUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}else if(this.selectedTrafficType === "volume") { //NO I18N
												this.set("inVolumeThresholdUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}
											break;
						case "OUT": 		this.set("outConditionValue", criteria[1]); //NO I18N
											this.set("outCriteriaValue3", criteria[2]); //NO I18N
											if(this.selectedTrafficType === "speed") {
												this.set("outSpeedThresholdUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}else if(this.selectedTrafficType === "volume") { //NO I18N
												this.set("outVolumeThresholdUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}
											break;
						case "95thIN": 		this.set("percINCriteriaVal1", criteria[1]); //NO I18N
											this.set("percINCriteriaVal2", criteria[2]); //NO I18N
											if(this.selectedTrafficType === "speed") {
												this.set("percINSpeedUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}else if(this.selectedTrafficType === "volume") { //NO I18N
												this.set("percINVolumeUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}
											break;
						case "95thOUT": 	this.set("percOUTCriteriaVal1", criteria[1]); //NO I18N
											this.set("percOUTCriteriaVal2", criteria[2]); //NO I18N
											if(this.selectedTrafficType === "speed") {
												this.set("percOUTSpeedUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}else if(this.selectedTrafficType === "volume") { //NO I18N
												this.set("percOUTVolumeUnit", nfa_getConvertedDataUnits(criteria[3], isConvertUnit)); //NO I18N
											}
											break;
					}
				}
				this.set("selectedTimePeriod", response.params.TimeFrame); //NO I18N
				this.set("isBussAlert", (response.params.bussFilter === "true")); //NO I18N
				if(this.isBussAlert) {
					this.set("bussStartTime", response.params.filterStTime); //NO I18N
					this.set("bussEndTime", response.params.filterEdTime); //NO I18N
				}
				this.set("isExWeekend", (response.params.isExWeekend === "true")); //NO I18N
				this.set("showOnly95thPerc", (response.params.showOnly95thPerc === "true")); //NO I18N
			}
		}
	}.on("init"), //NO I18N
	didInsertElement: function(){
		if(OPMClient.NFAReportsController.favoriteReportParams.isFromFavorite) {
			this.send("generateInventoryReport"); //NO I18N
		}
	},
	updateTrafficTypeList:function() {
		if(["11","12","14"].contains(this.selectedSource)) {
			this.set("showAllSelectDiv",false); //NO I18N
			this.set("showSourceList",false); //NO I18N
		}else {
			this.set("showAllSelectDiv",true); //NO I18N
			this.set("showSourceList",true); //NO I18N
		}

		var trafficType = [
			{name: Ember.I18n.t("webclient.widget.disk.volume"),value:"volume"}, //NO I18N
			{name: Ember.I18n.t("webclient.map.flash.speed"),value:"speed"}, //NO I18N
			{name: Ember.I18n.t("webclient.devices.intftypes.utilization"),value:"percentage"} //NO I18N
		];
		this.set("isAppReport",(this.selectedSource=="11"||this.selectedSource=="12"||this.selectedSource=="14")); //NO I18N
		if(this.isAppReport) {
			trafficType=trafficType.splice(0,1);
		}
		if(["4", "5", "6", "7"].contains(this.selectedSource)){ //NO I18N
			trafficType.pop();
		}
		this.set("trafficTypeList",trafficType); //NO I18N
		this.set("selectedTrafficType","volume"); //NO I18N
	}.observes("selectedSource"), //NO I18N
	trafficTypeChanged: function(){
		$("#inCriteria2").val("greater").select2(); this.set("inConditionValue", "greater"); //NO I18N
		$("#outCriteria2").val("greater").select2(); this.set("outConditionValue", "greater"); //NO I18N
		$("#inCriteria3").val(""); this.set("inCriteriaValue3", ""); //NO I18N
		$("#outCriteria3").val(""); this.set("outCriteriaValue3", ""); //NO I18N

		$("#percINCriteriaDiv1").val("greater").select2(); this.set("percINCriteriaVal1", "greater"); //NO I18N
		$("#percOUTCriteriaDiv1").val("greater").select2(); this.set("percOUTCriteriaVal1", "greater"); //NO I18N
		$("#percINCriteriaDiv2").val(""); this.set("percINCriteriaVal2", ""); //NO I18N
		$("#percOUTCriteriaDiv2").val(""); this.set("percOUTCriteriaVal2", ""); //NO I18N

		switch(this.selectedTrafficType){
			case "speed"	: 	$("select[name='inUnitList']").val(this.defaultSpeedUnit).select2(); this.set("inSpeedThresholdUnit", this.defaultSpeedUnit); //NO I18N
								$("select[name='outUnitList']").val(this.defaultSpeedUnit).select2(); this.set("outSpeedThresholdUnit", this.defaultSpeedUnit); //NO I18N
								$("select[name='percINUnitList']").val(this.defaultSpeedUnit).select2(); this.set("percINSpeedUnit", this.defaultSpeedUnit); //NO I18N
								$("select[name='percOUTUnitList']").val(this.defaultSpeedUnit).select2(); this.set("percOUTSpeedUnit", this.defaultSpeedUnit); //NO I18N
								break;
			case "volume"	: 	$("select[name='inUnitList']").val(this.defaultVolumeUnit).select2(); this.set("inVolumeThresholdUnit", this.defaultVolumeUnit); //NO I18N
								$("select[name='outUnitList']").val(this.defaultVolumeUnit).select2(); this.set("outVolumeThresholdUnit", this.defaultVolumeUnit); //NO I18N
								$("select[name='percINUnitList']").val(this.defaultVolumeUnit).select2(); this.set("percINVolumeUnit", this.defaultVolumeUnit); //NO I18N
								$("select[name='percOUTUnitList']").val(this.defaultVolumeUnit).select2(); this.set("percOUTVolumeUnit", this.defaultVolumeUnit); //NO I18N
								break;
		}
		this.set("inCriteriaLabel", Ember.I18n.t("nfa.units.in."+this.selectedTrafficType)); //NO I18N
		this.set("outCriteriaLabel", Ember.I18n.t("nfa.units.out."+this.selectedTrafficType)); //NO I18N
	}.observes("selectedTrafficType"), //NO I18N
	timePeriodChanged: function(){
		this.set("showExWeekEnd", (this.selectedTimePeriod == "Weekly" || this.selectedTimePeriod == "Monthly" || this.selectedTimePeriod == "custom")); //NO I18N
	}.observes("selectedTimePeriod"), //NO I18N
	actions: {
		generateInventoryReport: function(){
			$(".OpMAlertMsg").remove(); //NO I18N
			if(this.selectedSource==="-1"){
				opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.Select.anyone.source")); //NO I18N
				return;
			}
			var formData = {
				TimeFrame: this.selectedTimePeriod,
				Type: this.selectedTrafficType,
				DeviceID: (this.isAllDeviceSelected || ["11","12","14"].contains(this.selectedSource)) ? JSON.stringify(["-1"]) : JSON.stringify(nfa_getSelectedSourceValues(this).split(",")) //NO I18N
			};

			if(OPMClient.NFAReportsController.favoriteReportParams.isFromFavorite && formData.DeviceID === "[\"\"]") {
				formData.DeviceID = JSON.stringify(OPMClient.NFAReportsController.favoriteReportParams.devices);
			}

			if(formData.DeviceID===undefined || formData.DeviceID==="" || formData.DeviceID === "[\"\"]"){ //NO I18N
				nfa_showNoDeviceAlert(this.selectedSource);
				return;
			}
			if(this.showExWeekEnd){
				formData.isExWeekend = this.isExWeekend;
			}
			if(this.selectedTimePeriod == "custom"){ //NO I18N
				formData.StartTime = this.startTime;
				formData.EndTime = this.endTime;
			}
			var criteriaList = nfa_getInventoryReportCriteria(this.selectedTrafficType, this.isAppReport);
			if(criteriaList.length > 0){
				var fieldsToValidate = (this.isAppReport || !window.OPM.percentileInformation ) ? ["inCriteria3", "outCriteria3"] :  ["inCriteria3", "outCriteria3", "percINCriteriaDiv2", "percOUTCriteriaDiv2"]; //NO I18N
				if(!opm_validateFields({"unSignedFloatOrEmpty":fieldsToValidate})){
					return;
				}
				formData.Criteria = JSON.stringify(criteriaList);
			}
			if(this.isBussAlert){
				formData.filterStTime = this.bussStartTime;
				formData.filterEdTime = this.bussEndTime;
			}
			switch(this.selectedSource){
				case "2"	: 	formData.BussView = true; break; //NO I18N
				case "3"	: 	formData.IPGroup = true; break; //NO I18N
				case "4"	: 	formData.isAp = true; break; //NO I18N
				case "5"	: 	formData.isApGrp = true; break; //NO I18N
				case "6"	: 	formData.isSSIDGrp = true; break; //NO I18N
				case "11"	: 	formData.isLayer4 = true; break; //NO I18N
				case "12"	: 	formData.isLayer7 = true; break; //NO I18N
				case "14"	: 	formData.isAS = true; break; //NO I18N
			}
			if(!this.isAppReport){
				formData.showOnly95thPerc = this.showOnly95thPerc;
			}
			this.set("formData", formData); //NO I18N
			this.set("isUpdate", false); //NO I18N
			this.set("generateReport", true); //NO I18N
		}
	},
	willDestroyElement: function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
		OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: false}); //NO I18N
	}
});

OPMClient.NfaInventoryReportComponent = Ember.Component.extend({
	templateName: "components/nfa-inventory-report", //NO I18N
	pageTitle : Ember.I18n.t("report.overall"), //NO I18N
	initDefaults: function(){
		this.getSelectedSourceName();
		var timeList = jQuery.extend(true, [], this.timePeriodList); //NO I18N
		this.set("timePeriodList1", timeList); //NO I18N
		this.set("showPercentile",(window.OPM.percentileInformation));//NO I18N
	}.on("init"), //NO I18N
	getSelectedSourceName: function(){
		var name = ""; //NO I18N
		switch(this.selectedSource){
			case "1"	: 	name = Ember.I18n.t("interfaces", this); break; //NO I18N
			case "2"	: 	name = Ember.I18n.t("webclient.settings.intf.grp.list", this); break; //NO I18N
			case "3"	: 	name = Ember.I18n.t("webclient.settings.ip.grps.list", this); break; //NO I18N
			case "4"	: 	name = Ember.I18n.t("webclient.snapshot.name.Access.Points", this); break; //NO I18N
			case "5"	: 	name = Ember.I18n.t("webclient.nfa.accessPointGrp", this); break; //NO I18N
			case "6"	: 	name = Ember.I18n.t("webclient.nfa.ssidGrps", this); break; //NO I18N
			case "7"	: 	name = Ember.I18n.t("webclient.SSIDs", this); break; //NO I18N
			case "11"	: 	name = Ember.I18n.t("NFADB.L4Apps"); break; //NO I18N
			case "12"	: 	name = Ember.I18n.t("NFADB.L7Apps"); break; //NO I18N
			case "14"	: 	name = Ember.I18n.t("NFA.asView"); break; //NO I18N
		}
		this.set("selectedSourceName", name); //NO I18N
		this.getSelectedTrafficType();
	}.observes("selectedSource"), //NO I18N
	getSelectedTrafficType: function(){
		var list = jQuery.extend(true, [], this.trafficTypeList);
		for(var i=0; i<list.length; i++) {
			list[i].className = (list[i].value == this.selectedTrafficType) ? "active" : ""; //NO I18N
		}
		this.set("reportTrafficTypeList", list); //NO I18N
	}.observes("selectedTrafficType"), //NO I18N
	loadReportTableData: function(){
		if(!this.generateReport){return;}
		var responseCallBackFunction = function(jsonData){
			if(jsonData.error != undefined){
				opm_infoMsgs("errorMsg", jsonData.error.message); //NO I18N
				if(!self.isUpdate){self.set("generateReport", false);} //NO I18N
				return;
			}
			if(self.isUpdate){
				slideOut("5"); //NO I18N
				self.set("showReportSource", false); //NO I18N
			}
			self.set("showFormSource", false); //NO I18N
			self.set("showFormTime", false); //NO I18N

			var gridCallBackFunction = function(){
				$("#inventoryReportList").jqGrid("setGroupHeaders", { //NO I18N
					useColSpanStyle: true,
					groupHeaders: jsonData.GridGroups
				});
				$("#gview_inventoryReportList > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //NO I18N
				$("#inventoryReportList").jqGrid("setGridWidth", $("#inventoryReportList").closest(".opmFormHolder").width()-30); //NO I18N
			}

			var colModelList = [];
			for(var i=0; i<jsonData.TableHeadings.length; i++){
				colModelList.push({name: i, index: i, align: "center", sorttype: jsonData.GridSortTypes[i]});
			}
			colModelList[0].hidden = !(self.formData.isAS); //NO I18N
			if(!self.isAppReport && self.formData.Criteria !== undefined && self.formData.Criteria !== '[""]'){ //NO I18N
				colModelList.push({name: "advDetails", index: "advDetails", align: "center", search: false, sortable: false, formatter: nfa_invReportDetailIcon}); //NO I18N
				jsonData.TableHeadings.push(""); //NO I18N
				jsonData.CSVTableHeadings.push(""); //NO I18N
			}

			self.set("csvColumnNames", jsonData.CSVTableHeadings); //NO I18N
			self.set("reponseStartTime", jsonData.startTime); //NO I18N
			self.set("responseEndTime", jsonData.endTime); //NO I18N
			self.set("criteriaString", jsonData.criteriaString); //NO I18N

			$("#inputForm").hide(); $("#inventoryReportDiv").show(); //NO I18N
			$("#inventoryReportList").jqGrid("GridUnload"); //NO I18N
			var defaultOptions = {
				gridCallBack: gridCallBackFunction,
				Search: false
			}
			validateGridColumnDetails(colModelList,jsonData.TableHeadings);
			opm_loadJQgridWithData("#inventoryReportList", jsonData.Data, jsonData.TableHeadings, colModelList, "", "#inventoryReportListPager", "nfa_invReportDetails", defaultOptions, ""); //NO I18N
		}
		this.set("apiURL", window.OPM.apiUrlPattern+"/v2/nfareports/inventoryReport"); //NO I18N
		var formData1 = jQuery.extend(true, {}, this.formData);
		OPMClient.NFAReportsController.set("invReportFormData", formData1); //NO I18N
		var self = this;
		$.ajax({
			url: self.apiURL,
			type: "GET", //NO I18N
			data: self.formData,
			beforeSend: function(jqXHR, settings){
				uniqueId = opm_infoMsgs("infoMsg",Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
				appendCollectorDetails(jqXHR,settings);
			},
			success: function(jsonData){
				$("#"+uniqueId).remove(); //NO I18N
				if(jsonData != undefined){
					responseCallBackFunction(jsonData);
				}
			}
		});
	}.observes("generateReport"), //NO I18N
	timePeriodChanged: function(){
		if(this.generateReport){
			this.set("showExWeekEnd", (this.selectedTimePeriod == "Weekly" || this.selectedTimePeriod == "Monthly" || this.selectedTimePeriod == "custom")); //NO I18N
			this.formData.TimeFrame = this.selectedTimePeriod;
			if(this.selectedTimePeriod == "custom"){ //NO I18N
				this.formData.StartTime = this.startTime;
				this.formData.EndTime = this.endTime;
			}else{
				delete this.formData.StartTime;
				delete this.formData.EndTime;
			}
			if(this.showExWeekEnd){
				this.formData.isExWeekend = this.isExWeekend;
			}else{
				delete this.formData.isExWeekend;
			}
			this.set("isUpdate", true); //NO I18N
			this.loadReportTableData(true);
		}
	}.observes("selectedTimePeriod"), //NO I18N
	getPDFInputs: function(){
		var headerDetails = jQuery.extend(true, {}, this.formData);
		headerDetails.timeFrameString = this.timeFrameString;
		headerDetails.reportSubTitle = this.selectedSourceName;
		return headerDetails;
	},
	getSlidePDFInputs: function(){
		var headerDetails = jQuery.extend(true, {}, OPMClient.NFAReportsController.invReportFormData);
		headerDetails.timeFrameString = this.timeFrameString;
		headerDetails.reportSubTitle = this.selectedSourceName;
		switch(this.selectedSource){
			case "1"	: headerDetails.title1 = "NFAWidget.Devname"; headerDetails.title2 = "webclient.map.interfaceName"; break; //NO I18N
			case "2"	: headerDetails.title1 = "NFAWidget.ifgName"; break; //NO I18N
			case "3"	: headerDetails.title1 = "webclient.settings.ip.grp.name"; break; //NO I18N
			case "4"	: headerDetails.title1 = "webclinet.inventory.wlc.controllername"; headerDetails.title2 = "webclinet.inventory.wlc.apmacname"; break; //NO I18N
			case "5"	: headerDetails.title1 = "webclient.nfa.accessPointGrpName"; break; //NO I18N
			case "6"	: headerDetails.title1 = "webclient.nfa.ssidGrp.name"; break; //NO I18N
		}
		headerDetails.value1 = OPMClient.InventoryDeviceDetailsController.convRowData["1"]; //NO I18N
		if(headerDetails.title2 != undefined){
			headerDetails.value2 = OPMClient.InventoryDeviceDetailsController.convRowData["2"]; //NO I18N
		}
		return headerDetails;
	},
	formatCriteriaString: function(criteria){
		var crit = JSON.parse(criteria), critLbl="", critStr=""; //NO I18N
		for(var i=0; i<crit.length; i++){
			if(crit[i].type === "95thIN") { //NO I18N
				critLbl = Ember.I18n.t("nfa.report.in.nthPercentail",{n:"95"}); //NO I18N
			}else if(crit[i].type === "95thOUT") { //NO I18N
				critLbl = Ember.I18n.t("nfa.report.out.nthPercentail",{n:"95"}); //NO I18N
			}else {
				critLbl = Ember.I18n.t("nfa.units."+crit[i].type.toLowerCase()+"."+this.selectedTrafficType); //NO I18N
			}
			critStr += ((i==0)?"":(" ("+Ember.I18n.t("webclient.nfa.geoLocation.or")+") "))+critLbl+" "+((crit[i].comp == "greater") ? ">" : "<")+" "+crit[i].value+" "+crit[i].unit; //NO I18N
		}
		return critStr;
	},
	actions: {
		closeAction: function(){
			this.set("generateReport", false); //NO I18N
			this.set("showFormSource", true); //NO I18N
			this.set("showFormTime", true); //NO I18N
			$("#inputForm").show(); $("#inventoryReportDiv").hide(); //NO I18N
			OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: false}); //NO I18N
		},
		reportTrafficTypeChanged: function(type) {
			if(this.isAppReport){return;}
			this.set("selectedTrafficType", type); //NO I18N
			$("#trafficType").val(type).select2(); //NO I18N
			this.formData.Type = this.selectedTrafficType;
			delete this.formData.Criteria;
			this.set("isUpdate", true); //NO I18N
			this.loadReportTableData(true);
		},
		editReport: function(){
			this.set("isAllDeviceSelected1", (this.isAllDeviceSelected ? true : false)); //NO I18N
			var lists1 = jQuery.extend(true, {}, this.lists); //NO I18N
			this.set("lists1", lists1); //NO I18N
			this.set("isBussAlert1", (this.isBussAlert ? true : false)); //NO I18N
			this.set("bussStartTime1", (this.bussStartTime ? this.bussStartTime : "0")); //NO I18N
			this.set("bussEndTime1", (this.bussEndTime ? this.bussEndTime : "0")); //NO I18N
			this.set("isExWeekend1", (this.isExWeekend ? true : false)); //NO I18N
			this.set("showOnly95thPerc1", (this.showOnly95thPerc ? true : false)); //NO I18N
			this.set("showReportSource", true); //NO I18N
			slideIn("5"); //NO I18N
		},
		slideCloseAction: function(slideNumber){
			slideOut(slideNumber); //NO I18N
			if(slideNumber == "5"){
				this.set("showReportSource", false); //NO I18N
			}
		},
		updateInventoryReport: function(){
			this.set("isAllDeviceSelected", (this.isAllDeviceSelected1 ? true : false)); //NO I18N
			var lists = jQuery.extend(true, {}, this.lists1); //NO I18N
			this.set("lists", lists); //NO I18N
			this.set("isBussAlert", (this.isBussAlert1 ? true : false)); //NO I18N
			this.set("bussStartTime", (this.bussStartTime1 ? this.bussStartTime1 : "0")); //NO I18N
			this.set("bussEndTime", (this.bussEndTime1 ? this.bussEndTime1 : "0")); //NO I18N
			this.set("isExWeekend", (this.isExWeekend1 ? true : false)); //NO I18N
			this.set("showOnly95thPerc", (this.showOnly95thPerc1 ? true : false)); //NO I18N
			this.formData.DeviceID = (this.isAllDeviceSelected) ? JSON.stringify(["-1"]) : JSON.stringify(nfa_getSelectedSourceValues(this).split(","));
			if(this.isBussAlert){
				this.formData.filterStTime = this.bussStartTime;
				this.formData.filterEdTime = this.bussEndTime;
			}else{
				delete this.formData.filterStTime;
				delete this.formData.filterEdTime;
			}
			if(this.showExWeekEnd){
				this.formData.isExWeekend = this.isExWeekend;
			}else{
				delete this.formData.isExWeekend;
			}
			if(!this.isAppReport){
				this.formData.showOnly95thPerc = this.showOnly95thPerc;
			}else{
				delete this.formData.showOnly95thPerc;
			}
			OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: false}); //NO I18N
			this.set("isUpdate", true); //NO I18N
			this.loadReportTableData(true);
		},
		closeCustomTime: function() {
			slideOut(6);
		},
		customTimeChanged:function() {
			if(this.selectedTimePeriod == "custom"){ //NO I18N
				this.formData.StartTime = this.startTime;
				this.formData.EndTime = this.endTime;
				this.set("isUpdate", true); //NO I18N
				this.loadReportTableData(true);
			}else{
				this.set("selectedTimePeriod", "custom"); //NO I18N
			}
			slideOut(6);
		},
		exportToMail: function(){
			OPMClient.NFAReportsPDFCurrentApiurl = this.apiURL;
			OPMClient.NFAReportsController.formData = this.getPDFInputs();
			OPMClient.NFAReportsController.set("formData.reportTitle", this.pageTitle); //NO I18N
			loadMailDataInOneClickForm("report.overall"); //NO I18N
		},
		exportToPDF: function(){
			var headerDetails = this.getPDFInputs();
			var formElements = [];
			for(var key in headerDetails){
				formElements.push({name: key, value: headerDetails[key]});
			}
			nfa_exportPDFReport(this.apiURL, "InventoryReport", this.pageTitle, formElements); //NO I18N
		},
		exportToCSV: function(){
			var csvData = '"'+Ember.I18n.t("webclient.reports.ReportName")+': '+Ember.I18n.t("report.overall")+' - '+this.selectedSourceName+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("webclient.Traffic.Type")+': '+$("#graphTypeList li.active").text()+'"\r\n'; //NO I18N
			if(this.formData.Criteria != undefined){
				csvData += '"'+Ember.I18n.t("webclient.admin.re.criteria")+': '+this.formatCriteriaString(this.formData.Criteria)+'"\r\n'; //NO I18N
			}
			csvData += '"'+Ember.I18n.t("timeperiod")+': '+this.timeFrameString+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("webclient.devices.details.starttime")+': '+this.reponseStartTime+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("webclient.devices.details.endtime")+': '+this.responseEndTime+'"\r\n'; //NO I18N
			if(this.isBussAlert) {
				var businesshour = this.bussStartTime+".00 - "+this.bussEndTime+".00"; //NO I18N
				csvData += '"'+Ember.I18n.t("webclient.inventory.businesshour")+' : '+businesshour+'"\r\n'; //NO I18N
			}
			if(this.formData.isExWeekend) {
				csvData += '"'+Ember.I18n.t("webclient.Exclude.weekends")+' : '+Ember.I18n.t("jsp.commonstr.Enabled")+'"\r\n'; //NO I18N
			}
			csvData += '"'+Ember.I18n.t("webclient.reports.timezone")+': '+window.OPM.userTimeZone+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("jsp.commonstr.GeneratedOn")+': '+$("#opm_currentTime").text()+'"\r\n'; //NO I18N

			if(nfa_addAuditForCSVDownload()){
				opm_generateCSV($("#inventoryReportList"), csvData, nfa_getFileNameForCSV(Ember.I18n.t("report.overall")), false, this.csvColumnNames); //NO I18N
			}
		},
		sendSlideMail: function(){
			OPMClient.NFAReportsPDFCurrentApiurl = this.apiURL;
			OPMClient.NFAReportsController.formData = this.getSlidePDFInputs();
			OPMClient.NFAReportsController.formData.pdfReqFrom = "ViolationReport"; //NO I18N
			OPMClient.NFAReportsController.set("formData.reportTitle", Ember.I18n.t("nfa.violation.report")); //NO I18N
			loadMailDataInOneClickForm("nfa.violation.report"); //NO I18N
		},
		openOneClickSchedule: function(){
			slideIn(5);
			var inputData = {
				task: "Add", //NO I18N
				goBackRoute: "5", //NO I18N
				oneClickDeviceID: this.formData.DeviceID
			};
			switch(this.selectedSource){
				case "11"	: 	inputData.selectedSource = "otherReports"; inputData.selectedReportType = "Layer4"; break; //NO I18N
				case "12"	: 	inputData.selectedSource = "otherReports"; inputData.selectedReportType = "Layer7"; break; //NO I18N
				case "14"	: 	inputData.selectedSource = "otherReports"; inputData.selectedReportType = "ASView"; break; //NO I18N
				default		: 	inputData.selectedSource = this.selectedSource; inputData.selectedReportType = "overall"; break; //NO I18N
			}
			this.set("scheduleInputData", inputData); //NO I18N
			this.set("showScheduleForm", true); //NO I18N
		},
		closeOneClickSchedule: function(){
			slideOut(5);
			this.set("showScheduleForm", false); //NO I18N
		},
		generateSlidePDF: function(){
			var headerDetails = this.getSlidePDFInputs();
			var formElements = [];
			for(var key in headerDetails){
				formElements.push({name: key, value: headerDetails[key]});
			}
			nfa_exportPDFReport(this.apiURL, "ViolationReport", Ember.I18n.t("nfa.violation.report"), formElements); //NO I18N
		},
		generateSlideCSV: function(){
			var csvData = '"'+Ember.I18n.t("webclient.Report.Type")+': '+Ember.I18n.t("nfa.violation.report")+' - '+this.selectedSourceName+'"\r\n'; //NO I18N

			switch(this.selectedSource){
				case "1"	: 	csvData += '"'+Ember.I18n.t("NFAWidget.Devname")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["1"]+'"\r\n'; //NO I18N
								csvData += '"'+Ember.I18n.t("webclient.map.interfaceName")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["2"]+'"\r\n'; //NO I18N
								break;
				case "4"	: 	csvData += '"'+Ember.I18n.t("webclinet.inventory.wlc.controllername")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["1"]+'"\r\n'; //NO I18N
								csvData += '"'+Ember.I18n.t("webclinet.inventory.wlc.apmacname")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["2"]+'"\r\n'; //NO I18N
								break;
				case "2"	: 	csvData += '"'+Ember.I18n.t("NFAWidget.ifgName")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["1"]+'"\r\n'; break; //NO I18N
				case "3"	: 	csvData += '"'+Ember.I18n.t("webclient.settings.ip.grp.name")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["1"]+'"\r\n'; break; //NO I18N
				case "5"	: 	csvData += '"'+Ember.I18n.t("webclient.nfa.accessPointGrpName")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["1"]+'"\r\n'; break; //NO I18N
				case "6"	: 	csvData += '"'+Ember.I18n.t("webclient.nfa.ssidGrp.name")+': '+OPMClient.InventoryDeviceDetailsController.convRowData["1"]+'"\r\n'; break; //NO I18N
			}

			csvData += '"'+Ember.I18n.t("webclient.Traffic.Type")+': '+$("#trafficType option:selected").text()+'"\r\n'; //NO I18N
			if(this.formData.Criteria != undefined){
				csvData += '"'+Ember.I18n.t("webclient.admin.re.criteria")+': '+this.formatCriteriaString(this.formData.Criteria)+'"\r\n'; //NO I18N
			}
			csvData += '"'+Ember.I18n.t("timeperiod")+': '+this.timeFrameString+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("webclient.devices.details.starttime")+': '+this.reponseStartTime+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("webclient.devices.details.endtime")+': '+this.responseEndTime+'"\r\n'; //NO I18N
			if(this.isBussAlert) {
				var businesshour = this.bussStartTime+".00 - "+this.bussEndTime+".00"; //NO I18N
				csvData += '"'+Ember.I18n.t("webclient.inventory.businesshour")+' : '+businesshour+'"\r\n'; //NO I18N
			}
			if(this.formData.isExWeekend) {
				csvData += '"'+Ember.I18n.t("webclient.Exclude.weekends")+' : '+Ember.I18n.t("jsp.commonstr.Enabled")+'"\r\n'; //NO I18N
			}
			csvData += '"'+Ember.I18n.t("webclient.reports.timezone")+': '+window.OPM.userTimeZone+'"\r\n'; //NO I18N
			csvData += '"'+Ember.I18n.t("jsp.commonstr.GeneratedOn")+': '+$("#opm_currentTime").text()+'"\r\n'; //NO I18N

			if(nfa_addAuditForCSVDownload()){
				opm_generateCSV($("#inventoryReportSlide"), csvData, nfa_getFileNameForCSV(Ember.I18n.t("nfa.violation.report")), false); //NO I18N
			}
		},
		openFavoriteSlide: function() {
			this.set("parentModel", this); //NO I18N
			this.set("showFavoriteReportSlide", true); //NO I18N
		}
	},
	willDestroyElement: function(){
		delete OPMClient.NFAReportsController.formData;
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaForecastReportComponent = Ember.Component.extend({
	templateName: "components/nfa-forecast-report", //NO I18N
	excludeList: ["7", "8"], //NO I18N
	timeFrameList:[
		{name: Ember.I18n.t("webclient.7.Days"),	value:"7"}, //NO I18N
		{name: Ember.I18n.t("webclient.15.Days"),	value:"15"}, //NO I18N
		{name: Ember.I18n.t("webclient.1.Month"),	value:"30"}, //NO I18N
		{name: Ember.I18n.t("webclient.3.Months"),	value:"90"}, //NO I18N
		{name: Ember.I18n.t("webclient.6.Months"),	value:"180"}, //NO I18N
		{name: Ember.I18n.t("webclient.1.Year"),	value:"365"} //NO I18N
	],
	pageTitle : Ember.I18n.t("nfa.reports.forecast"), //NO I18N
	selectedSource : "-1", //NO I18N
	graphPlotType:"line", //NO I18N
	timeFrame : "7", //NO I18N
	showInputForm:true,
	showHistory:false,
	genReport:false,
	initDefaults : function() {
		this.set("list", { //NO I18N
			trafficTypeList : [
				{name: Ember.I18n.t("webclient.widget.disk.volume"),value:"volume"}, //NO I18N
				{name: Ember.I18n.t("webclient.map.flash.speed"),value:"speed"}, //NO I18N
				{name: Ember.I18n.t("webclient.devices.intftypes.utilization"),value:"percentage"} //NO I18N
			]
		});
		this.sourceChanged();
		this.timePeriodChanged();
		this.set("isExWeekend",window.isNFADefaultWeekend);//NO I18N
		this.set("isBussAlert",window.isNFADefaultBusinessHour);//NO I18N
		this.set("bussStartTime",window.NFABussHourStartTime);//NO I18N
		this.set("bussEndTime",window.NFABussHourEndTime);//NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
		if(this.genReport) {
			this.send("generateReport"); //NO I18N
			this.set("genReport",false); //NO I18N
		}
		$("#"+this.elementId+" .select2").select2(); //NO I18N
		$("body").addClass("nfaForecastReport"); //NO I18N
	},
	sourceChanged:function() {
		this.set("trafficType","speed"); //NO I18N
	}.observes("selectedSource"), //NO I18N
	trafficTypeChanged:function() {
		var trafficTypeList = jQuery.extend(true,[],this.list.trafficTypeList);
		if(["4","5","6","7"].contains(this.selectedSource)) { //NO I18N
			trafficTypeList.pop();
		}
		this.set("trafficTypeList",nfa_getActiveList(trafficTypeList,"value",this.trafficType)); //NO I18N
	}.observes("trafficType"), //NO I18N
	timePeriodChanged:function() {
		this.set("hideExWeekend",(this.timeFrame=="365")); //NO I18N
		this.set("hideBussAlert",(["90","180","365"].contains(this.timeFrame))); //NO I18N
		if(!this.showInputForm) {
			this.send("generateReport"); //NO I18N
		}
	}.observes("timeFrame"), //NO I18N
	getPDFInputs:function() {
		var headerDetails = jQuery.extend(false,{},this.formData);
		headerDetails.timeFrameString = this.timeFrameString;
		nfa_getReportPDFInputs(headerDetails,this);
		return headerDetails;
	},
	showHistoryChanged:function() {
		this.send("generateReport"); //NO I18N
	}.observes("showHistory"), //NO I18N
	actions: {
		forecastTypeChanged: function(value){
			nfa_getActiveList(this.forecastTypes, "value", value); //NO I18N
			this.set("selectedForecastType", value); //NO I18N
		},
		childActions:function(functionName,param1,param2) {
			this.send(functionName,param1,param2);
		},
		updateValues:function(key,value) {
			this.set(key,value);
		},
		generateReport: function() {
			var formData = {DeviceID:this.selectedSourceID,Type:this.trafficType,ForecastPeriod:this.timeFrame,showHistory:this.showHistory};
			formData.isExWeekend = (this.hideExWeekend)?false:this.isExWeekend;
			if(!this.hideBussAlert && this.isBussAlert) {
				formData.filterStTime = this.bussStartTime;
				formData.filterEdTime = this.bussEndTime;
			}
			if(this.selectedSource==="-1" || this.selectedSourceID===undefined || this.selectedSourceID==="") { //NO I18N
				nfa_showNoDeviceAlert(this.selectedSource);
				return;
			}
			switch(this.selectedSource) {
				case "2"	: 	formData.BussView=true;break; //NO I18N
				case "3"	: 	formData.IPGroup=true;break; //NO I18N
				case "4"	: 	formData.isAp=true;break; //NO I18N
				case "5"	: 	formData.isApGrp=true;break; //NO I18N
				case "6"	: 	formData.isSSIDGrp=true;break; //NO I18N
				case "7"	: 	formData.isSSID=true;break; //NO I18N
			}

			this.set("apiURL",window.OPM.apiUrlPattern+"/v2/nfaforecast/getTrafficForecastData"); //NO I18N
			this.set("formData",formData); //NO I18N
			var self = this;
			$.ajax({
				url:self.apiURL,
				type:"GET", //NO I18N
				data:self.formData,
				self:self,
				async:true,
				beforeSend: function(jqXHR,settings) {
					uniqueId = opm_infoMsgs("infoMsg",Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
					appendCollectorDetails(jqXHR,settings);
				},
				success: function(jsonData) {
					this.self.set("showInputForm",false); //NO I18N
					if(jsonData.error !== undefined) {
						opm_infoMsgs("errorMsg",jsonData.error.message); //NO I18N
						this.self.set("apiData",{}); //NO I18N
						return;
					}
					this.self.set("apiData",jsonData); //NO I18N
					$("#"+uniqueId).remove(); //NO I18N
				}
			});
		},
		trafficTypeChanged: function(type) {
			this.set("trafficType",type); //NO I18N
		},
		exportToMail:function() {
			OPMClient.NFAReportsPDFCurrentApiurl = this.apiURL;
			OPMClient.NFAReportsController.formData = this.getPDFInputs();
			OPMClient.NFAReportsController.set("formData.reportTitle",this.pageTitle); //NO I18N
			loadMailDataInOneClickForm("nfa.reports.forecast"); //NO I18N
		},
		exportToPDF:function() {
			var headerDetails = this.getPDFInputs();
			var formElements = [];
			for (var key in headerDetails) {
				formElements.push({name:key,value:headerDetails[key]});
			}
			nfa_exportPDFReport(this.apiURL,"Forecast",this.pageTitle,formElements); //NO I18N
		},
		exportToCSV:function() {
			var headerDetails = this.getPDFInputs();
			headerDetails.tablediv = "trafficList"; //NO I18N
			headerDetails.StartTime = this.apiData.startTime;
			headerDetails.EndTime = this.apiData.endTime;
			nfa_ReportsToCSV(this.pageTitle,headerDetails);
		}
	},
	willDestroyElement: function(){
		delete OPMClient.NFAReportsController.formData;
		$("body").removeClass("nfaForecastReport"); //NO I18N
	}
});

OPMClient.NfaAddSnmpDeviceComponent = Ember.Component.extend({
	templateName: "components/nfa-add-snmp-device", //NO I18N
	slideTitle: Ember.I18n.t("jsp.commonstr.AddDevice"), //NO I18N
	interfaceNameType: [
		{name: Ember.I18n.t("webclient.inventory.nfa.IfDesc"), value: "IfDesc"}, //NO I18N
		{name: Ember.I18n.t("webclient.devices.details.ifname"), value: "IfName"}, //NO I18N
		{name: Ember.I18n.t("webclient.devices.details.ifalias"), value: "IfAlias"} //NO I18N
	],
	initDefaults: function(){
		nfa_getSNMPCredentials();
	}.on("init"), //NO I18N
	didInsertElement: function(){
		slideIn("5"); //NO I18N
	},
	credentialObserver: function(){
		if(this.selectedSNMP == undefined && OPMClient.SettingsNFAConfigController.nfaSNMPCredentials.length != 0){
			this.set("selectedSNMP", OPMClient.SettingsNFAConfigController.nfaSNMPCredentials[0].value); //NO I18N
		}else if(OPMClient.SettingsNFAConfigController.newSNMPCredential != ""){ //NO I18N
			this.set("selectedSNMP", OPMClient.SettingsNFAConfigController.newSNMPCredential); //NO I18N
		}
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			$("#snmpCredential").val(this.selectedSNMP).select2(); //NO I18N
		});
	}.observes("OPMClient.SettingsNFAConfigController.nfaSNMPCredentials"), //NO I18N
	actions:{
		slideCloseAction: function(){
			opmGlobalRoute.transitionTo(this.parentRoute+".index"); //NO I18N
		},
		addNewSNMPCredential: function(){
			opmGlobalRoute.transitionTo(this.parentRoute+".AddDevice.AddSNMP"); //NO I18N
		},
		scanDevices: function(){
			if(!opm_validateFields({empty: ["routerIPName"]})){ //NO I18N
				return false;
			}
			var data = {
				credentialName: this.selectedSNMP,
				getAllInterface: false,
				routerName: this.routerIPName,
				oid: this.selectedIntfNameType,
				isFlowExport: false
			};
			var self = this;
			var callBackFunction = function(jsonData){
				if(jsonData.error != undefined){
					opm_infoMsgs("errorMsg", jsonData.error.message); //NO I18N
				}else{
					var gridData = [];
					for(var key in jsonData){
						gridData.push({intfName: jsonData[key]});
					}
					self.set("slideTitle", Ember.I18n.t("nfa.select.interfaces")); //NO I18N
					$("#addDeviceLevel1").hide(); //NO I18N
					$("#addDeviceLevel2").show(); //NO I18N
					var defaultOptions = {multiselect: true, sortName: "intfName", sortOrder:"asc"}; //NO I18N
					opm_loadJQgridWithData("#interfaceListTable", gridData, [Ember.I18n.t("opu.common.ALL")], [{name: "intfName", index: "intfName", sortable: false}], "", "interfaceListPager", "", defaultOptions); //NO I18N
				}
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/addCiscoDevice", data, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
		},
		goBack: function(){
			this.set("slideTitle", Ember.I18n.t("jsp.commonstr.AddDevice")); //NO I18N
			$("#addDeviceLevel1").show(); //NO I18N
			$("#addDeviceLevel2").hide(); //NO I18N
		},
		addDevice:function() {
			var selectedRows = $("#interfaceListTable").jqGrid("getGridParam", "selarrrow"); //NO I18N
			if(selectedRows.length) {
				var selectedIntfList = [];
				for(var i=0; i<selectedRows.length; i++){
					selectedIntfList.push($("#interfaceListTable").jqGrid("getCell", selectedRows[i], "intfName")); //NO I18N
				}
				var data = {
					credentialName: this.selectedSNMP,
					routerName: this.routerIPName,
					oid: this.selectedIntfNameType,
					interfaceId:JSON.stringify(selectedIntfList)
				}
				var self = this;
				var callBackFunction = function(jsonData){
					if(jsonData.error != undefined){
						opm_infoMsgs("errorMsg", jsonData.error.message); //NO I18N
					}else if(jsonData.message != undefined){
						opm_infoMsgs("successMsg", jsonData.message); //NO I18N
						opmGlobalRoute.transitionTo(self.parentRoute+".index"); //NO I18N
						(self.parentRoute.indexOf("CBQoS") != -1) ? nfa_getCBQoSData("settings", {}) : nfa_getNBARData("settings", {}); //NO I18N
					}
				}
				nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/addCiscoInterface", data, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
			}else{
				opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.inventory.interface.multiselectalert")); //NO I18N
			}
		}
	},
	willDestroyElement: function(){
		slideOut("5"); //NO I18N
	}
});

OPMClient.NfaScheduleReportComponent = Ember.Component.extend({
	templateName: "components/nfa-schedule-report", //NO I18N
	initDefaults: function(){
		nfa_getModelForScheduleProfile(this);
		this.set("selectOptions",{"minimumResultsForSearch":10}); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement: function(){
		this.set("sourceList", nfa_getActiveList(jQuery.extend(true, [], this.sourceList), "value", this.selectedSource)); //NO I18N
		this.reportTypeChanged();
		this.showHideBussFilter();
		if(this.task == "modify"){
			this.loadWithResponseData();
		}else{
			this.timeZoneChanged();
		}
		this.enableClickEvents();
		this.setSchConsOptions();
	},
	loadWithResponseData: function(){
		if($("#reportType").val() == null){
			switch(this.responseObj.repType){
				case "capla": 	opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.addon.capla.check")); break; //NO I18N
				case "nbar": 	//NO I18N
				case "cbqos": 	opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.addon.cbqos.check")); break; //NO I18N
			}
			this.set("selectedReportType", "-1"); //NO I18N
			$("#reportType").val("-1").select2(); //NO I18N
		}
		if(this.selectedSource == "reportProfile"){
			this.updateReportProfilesList();
			this.set("selectedReportProfile", parseInt(this.responseObj.repProID)); //NO I18N
			$("#repProfType").val(parseInt(this.responseObj.repProID)).select2(); //NO I18N
		}
		switch(this.selectedReportType){
			case "cust"		: 	$("input[name=customMatch][value="+this.responseObj.logicOper+"]").prop("checked", true); //NO I18N
								break;
			case "geo"		: 	$("input[name=flowtype][value="+this.responseObj.dataDirection+"]").prop("checked", true); //NO I18N
								$("input[name=geoType][value="+this.responseObj.geoBasedOn+"]").prop("checked", true); //NO I18N
								break;
		}

		this.set("selectedReportPeriod", this.responseObj.TimeFrame_code); //NO I18N
		if(this.selectedReportPeriod == "11"){
			this.set("customStartTime", this.responseObj.stTime); //NO I18N
			this.set("customEndTime", this.responseObj.edTime); //NO I18N
		}
		$("#schReportPeriod").val(this.selectedReportPeriod).select2(); //NO I18N
		this.set("selectedOnceDate", this.responseObj.ReportDate); //NO I18N
		var schTime = this.responseObj.SchTime.split(" "); //NO I18N
		var schHourMin = schTime[1].split(":"); //NO I18N
		this.set("repGenHour", schHourMin[0]); //NO I18N
		this.set("repGenMinute", schHourMin[1]); //NO I18N
		if(this.selectedReportType == "comp" && this.selectedCompareReport == "singleDevice"){
			this.set("selectedCompareSingleDevRepPeriod", this.respCompSingleDevRepPeriod); //NO I18N
			$("#compSingleDevType").val(this.selectedCompareSingleDevRepPeriod).select2(); //NO I18N
			this.set("selectedCompareSingleDevRepPeriodOption", this.responseObj.TimeFrame_code); //NO I18N
			$("#compSingleDevTypeOptions").val(this.selectedCompareSingleDevRepPeriodOption).select2(); //NO I18N
		}
	},
	setSchConsOptions: function()
	{
		if(this.selectedReportType === "cons" && this.model.reportTypeList !== undefined){
			this.set("consSelectOption",nfa_getConsolidatedReportTypes(this.selectedSource,this.model.reportTypeList));//NO I18N
		}
	},
	updateReportProfilesList: function(){
		this.set("hideReportPeriod", true); //NO I18N
		this.set("showBussFilter", false); //NO I18N
		this.set("showExWeekEnd", false); //NO I18N
		this.updateSchSettingsOptions();
		if(this.reportProfilesList.length == 0){
			var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfareportProfile/listProfiles"); //NO I18N
			if(jsonData != undefined && jsonData.error == undefined && jsonData.length != 0){
				this.set("reportProfilesList", jsonData); //NO I18N
			}else{
				this.set("reportProfilesList", []); //NO I18N
			}
		}
		(this.reportProfilesList.length == 0) ? opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.reports.profiles.msg")) : this.set("selectedReportProfile", this.reportProfilesList[0].id); //NO I18N
	},
	reportTypeChanged: function(){
		if(this.selectedReportType == undefined){
			return;
		}
		var repFormats = jQuery.extend(true, [], this.defaultReportFormats);
		for(var i=0; i<this.filteredReportTypes.length; i++){
			if(this.filteredReportTypes[i].value == this.selectedReportType){
				repFormats[1].isDisabled = !this.filteredReportTypes[i].isCSV;
				break;
			}
		}
		this.set("reportFormats", repFormats); //NO I18N
		this.set("showRawNoteMsg", (["forensics", "multicast", "media", "avc-nbar2", "avc-http", "avc-qosstats", "avc-qosdrops", "avc-art", "avc-artclient", "avc-artserver"].contains(this.selectedReportType))); //NO I18N
		this.set("showDataLoadTimeWarning",(this.selectedReportType === "trend"));//NO I18N
		if(this.selectedReportType==="forensics"){
			this.set("criteriaSource", "Forensics_"+this.selectedSource);//NO I18N
		}
		if(this.selectedReportType === "cons"){
			this.set("consSelectOption",nfa_getConsolidatedReportTypes(this.selectedSource,this.schRepOptions)); //NO I18N
		}
		this.initializeTimePeriodDiv();
		this.updateSchSettingsOptions();
	}.observes("selectedReportType"), //NO I18N
	initializeTimePeriodDiv: function(){
		this.showHideMultiSourceSelection();
		this.set("hideReportPeriod", (this.selectedReportType == "comp" && this.selectedCompareReport == "singleDevice") || (this.selectedSource == "reportProfile")); //NO I18N
		this.set("showCompSingleDevRepOption", (this.selectedReportType == "comp" && this.selectedCompareReport == "singleDevice")); //NO I18N
		this.send("scheduleFreqChanged", this.selectedScheduleFrequency); //NO I18N
	}.observes("selectedCompareReport"), //NO I18N
	showHideMultiSourceSelection: function(){
		this.set("showMultipleSourceSelection", this.showMultipleSourceSelectionOption()); //NO I18N
	}.observes("selectedCompReportRecord"), //NO I18N
	timeZoneChanged: function(){
		this.set("currentTimeObj", getEndTimeWithTimeZone({isSch: true, schTZone: this.timeZone})); //NO I18N
		this.set("selectedOnceDate", opm_formatDate(this.currentTimeObj)); //NO I18N
		this.set("repGenHour", ((this.selectedScheduleFrequency == "once") ? ("00"+this.currentTimeObj.getHours()).slice(-2) : "00")); //NO I18N
		this.set("repGenMinute", ((this.selectedScheduleFrequency == "once") ? ("00"+this.currentTimeObj.getMinutes()).slice(-2) : "00")); //NO I18N
		var startDate = new Date(this.currentTimeObj - (1*60*60*1000));
		this.set("customStartTime", opm_formatDate(startDate)+" "+("00"+startDate.getHours()).slice(-2)+":"+("00"+startDate.getMinutes()).slice(-2)); //NO I18N
		this.set("customEndTime", opm_formatDate(this.currentTimeObj)+" "+("00"+this.currentTimeObj.getHours()).slice(-2)+":"+("00"+this.currentTimeObj.getMinutes()).slice(-2)); //NO I18N
	}.observes("timeZone"), //NO I18N
	showHideBussFilter: function(){
		this.set("showBussFilter", this.showBussFilterOption()); //NO I18N
	}.observes("selectedReportPeriod"), //NO I18N
	compareSingleDevRepPeriodChanged: function(){
		this.set("compareSingleDevRepPeriodsOptions", nfa_getCompareSingleDevPeriodOptions(this.selectedCompareSingleDevRepPeriod)); //NO I18N
		this.set("selectedCompareSingleDevRepPeriodOption", this.compareSingleDevRepPeriodsOptions[0].value); //NO I18N
	}.observes("selectedCompareSingleDevRepPeriod"), //NO I18N
	enableClickEvents: function(){
		var self = this;
		$("#nfa_schedule").off().on("click", ".nfa_showMoreLink label", function(){
			self.set("schSettingsLabel", $("#nfa_scheduleSettings").is(":checked") ? Ember.I18n.t("webclient.common.showMore") : Ember.I18n.t("webclient.common.showLess")); //NO I18N
		});

		$(".NFA_scheduleReports").off().on("click", ".icon-filter", function(){
			if(!$(this).parent().hasClass("active")){
				$(this).parent().addClass("active").find("div").css({display: "block"}).animate({opacity: "1", top: "30px"}, 300); //NO I18N
			}else{
				$(this).parent().removeClass("active").find("div").css({display: "none", opacity: "0", top: "0"}); //NO I18N
			}
		});

		$(document).mouseup(function (e){
			if($(".opmDropDownType2").hasClass("active") && !$(e.target).closest(".icon-filter").length && !$(e.target).closest(".opmDropDownType2List").length){
				$(".opmDropDownType2").removeClass("active"); //NO I18N
				$(".opmDropDownType2List").css({display: "none", opacity: "0", top: "0"}); //NO I18N
			}
		});
	},
	showMultipleSourceSelectionOption:function(){
		if(this.selectedReportType==="-1" || ["reportProfile","otherReports","forensics"].contains(this.selectedSource)) { //NO I18N
			return false;
		}
		if(this.selectedReportType==="comp"){
			return (this.selectedCompareReport==="multiDevice" && this.selectedCompReportRecord==="-1"); //NO I18N
		}
		if(this.selectedScheduleFrequency==="hourly") { //NO I18N
			return true;
		}
		return true;
	},
	showBussFilterOption: function(){
		if(this.selectedSource == "reportProfile" || ["avc-http", "avc-qosstats", "avc-qosdrops", "avc-art", "avc-artclient", "avc-artserver"].contains(this.selectedReportType)){
			return false;
		}else if(this.selectedReportType == "comp" && this.selectedCompareReport == "singleDevice"){ //NO I18N
			return true;
		}
		return (["1", "6", "7", "8", "9", "10"].contains(this.selectedReportPeriod) || (this.selectedReportPeriod==="5" && this.selectedScheduleFrequency==="hourly")); //NO I18N
	},
	showExcludeWeekendOption: function(){
		if(this.selectedSource == "reportProfile" || ["avc-http", "avc-qosstats", "avc-qosdrops", "avc-art", "avc-artclient", "avc-artserver"].contains(this.selectedReportType)){
			return false;
		}
		return (this.selectedScheduleFrequency != "once"); //NO I18N
	},
	updateSchSettingsOptions: function(){
		this.set("showDNSOption", (this.dnsAvailableFor.contains(this.selectedSource+this.selectedReportType)) || (this.selectedSource == "reportProfile")); //NO I18N
		this.set("showGraphOption", this.graphAvailableFor.contains(this.selectedSource+this.selectedReportType)); //NO I18N
		this.set("showTOSOption", this.qosAvailableFor.contains(this.selectedSource+this.selectedReportType)); //NO I18N
		this.set("showRowCountOption", this.rowCountAvailableFor.contains(this.selectedSource+this.selectedReportType)); //NO I18N
		this.set("showIPTypeOption", this.ipTypeAvailableFor.contains(this.selectedSource+this.selectedReportType)); //NO I18N
		this.set("showGraphChartTypes", this.graphChartTypesAvailableFor.contains(this.selectedReportType) && !((this.selectedReportType === "cust") && ["4","5","6"].contains(this.selectedSource))); //NO I18N
		this.set("showScheduleSettings", (this.showDNSOption || this.showGraphOption || this.showTOSOption || this.showRowCountOption || this.showIPTypeOption || this.showGraphChartTypes)); //NO I18N
		if(!this.showScheduleSettings){
			this.set("schSettingsLabel", Ember.I18n.t("webclient.common.showMore")); //NO I18N
		}

		if(this.schSettingsObj != undefined){
			var schObj = jQuery.extend(true, {}, this.schSettingsObj);
			if(this.showDNSOption){
				var resolveDNSOptions = jQuery.extend(true, [], this.dnsOptions);
				resolveDNSOptions[0].isChecked = (schObj.dns == "1"); //NO I18N
				resolveDNSOptions[1].isChecked = (schObj.dns == "0"); //NO I18N
				this.set("dnsOptions", resolveDNSOptions); //NO I18N
			}

			if(this.showGraphOption){
				var graphTypeOptions = [
					{name: Ember.I18n.t("webclient.widget.disk.volume"), value: "2", isChecked: (schObj.graphType == "2")} //NO I18N
				];
				if(!["4", "5", "6"].contains(this.selectedSource)){
					graphTypeOptions.push({name: Ember.I18n.t("webclient.map.flash.speed"), value: "1", isChecked: (schObj.graphType == "1")}); //NO I18N
					if(!(this.selectedReportType == "cbqos")){
						graphTypeOptions.push({name: Ember.I18n.t("webclient.devices.intftypes.utilization"), value: "0", isChecked: (schObj.graphType == "0")}); //NO I18N
					}
				}
				if(["1", "2", "3"].contains(this.selectedSource) && ["traf","capla","multicast"].contains(this.selectedReportType)) {
					graphTypeOptions.push({name: Ember.I18n.t("opu.views.PACKETS"), value: "3", isChecked: (schObj.graphType == "3")}); //NO I18N
				}
				if(graphTypeOptions.filter(function(element){return element.isChecked}).length < 1){
					graphTypeOptions[0].isChecked = true;
				}
				this.set("graphOptions", graphTypeOptions); //NO I18N
			}

			if(this.showTOSOption){
				var qosTypeOptions = jQuery.extend(true, [], this.qosOptions);
				qosTypeOptions[0].isChecked = (schObj.isTos == "0"); //NO I18N
				qosTypeOptions[1].isChecked = (schObj.isTos == "1"); //NO I18N
				this.set("qosOptions", qosTypeOptions); //NO I18N
			}

			if(this.showRowCountOption){
				var rowCounts = jQuery.extend(true, [], this.rowCountOptions);
				if(this.showDNSOption && this.dnsOptions[0].isChecked){
					rowCounts[0].isChecked = true; rowCounts[0].isDisabled = true;
					for(var i=1; i<rowCounts.length; i++){
						rowCounts[i].isChecked = false; rowCounts[i].isDisabled = true;
					}
				}else{
					rowCounts[0].isChecked = (schObj.RowCount === "1000"); rowCounts[0].isDisabled = false; //NO I18N
					rowCounts[1].isChecked = (schObj.RowCount === "2000"); rowCounts[1].isDisabled = false; //NO I18N
					rowCounts[2].isChecked = (schObj.RowCount === "3000"); rowCounts[2].isDisabled = false; //NO I18N
					rowCounts[3].isChecked = (schObj.RowCount === "4000"); rowCounts[3].isDisabled = false; //NO I18N
					rowCounts[4].isChecked = (schObj.RowCount === "5000"); rowCounts[4].isDisabled = false; //NO I18N
				}
				this.set("rowCountOptions", rowCounts); //NO I18N
			}

			if(this.showIPTypeOption){
				var ipTypes = jQuery.extend(true, [], this.IPTypeOptions);
				ipTypes[0].isChecked = (schObj.IPType == "ALL"); //NO I18N
				ipTypes[1].isChecked = (schObj.IPType == "V4"); //NO I18N
				ipTypes[2].isChecked = (schObj.IPType == "V6"); //NO I18N
				this.set("IPTypeOptions", ipTypes); //NO I18N
			}
			if(this.showGraphChartTypes){
				var graphChartTypes = jQuery.extend(true, [], this.graphChartTypes);
				graphChartTypes[0].isChecked = (schObj.graphChartType == 1);
				graphChartTypes[1].isChecked = (schObj.graphChartType == 2);
				graphChartTypes[2].isChecked = (schObj.graphChartType == 3);
				this.set("graphChartTypes", graphChartTypes); //NO I18N
			}
		}
	},
	getSelectedConsReportTypes:function() {
		var types=[];
		for(var i=0;i<this.consSelectOption.length;i++) {
			if(this.consSelectOption[i].checked) {
				types.push(this.consSelectOption[i].value);
			}
		}
	return JSON.stringify(types);
	},
	actions: {
		sourceTypeChanged: function(source){
			this.set("selectedSource", source); //NO I18N
			this.set("sourceList", nfa_getActiveList(jQuery.extend(true, [], this.sourceList), "value", source)); //NO I18N

			this.set("filteredReportTypes", this.defaultReportTypesList.filter(nfa_getFilteredReportTypes, this)); //NO I18N
			(this.selectedReportType == "-1") ? this.reportTypeChanged() : this.set("selectedReportType", "-1"); //NO I18N

			if(this.selectedSource == "reportProfile"){
				this.updateReportProfilesList();
			}
		},
		scheduleFreqChanged:function(freq) {
			var sFrequencyList = jQuery.extend(true,[],this.defaultScheduleFrequencyList);
			var timeperiodList = this.defaultReportPeriodsList;
			if(this.selectedReportType==="comp" && this.selectedCompareReport == "singleDevice"){//NO I18N
				if(freq==="hourly") { //NO I18N
					freq = "once"; //NO I18N
				}
				sFrequencyList = sFrequencyList.filter(function(element){
					return ["once","daily","weekly","monthly"].contains(element.value); //NO I18N
				},this);
			}
			if(this.selectedReportType==="forensics") { //NO I18N
				if(!["once","hourly","daily"].contains(freq)) { //NO I18N
					freq = "once"; //NO I18N
				}
				sFrequencyList = sFrequencyList.filter(function(element){
					return ["once","hourly","daily"].contains(element.value); //NO I18N
				},this);
				timeperiodList = timeperiodList.filter(function(element){
					return ["1","2","3","4","5"].contains(element.value); //NO I18N
				},this);
			}

			this.set("selectedScheduleFrequency",freq); //NO I18N
			this.set("scheduleFrequencyList",nfa_getActiveList(sFrequencyList,"value",freq)); //NO I18N

			if(!this.showCompSingleDevRepOption){
				this.set("filteredReportPeriodsList", timeperiodList.filter(nfa_getFilteredReportPeriods,this)); //NO I18N
				this.set("selectedReportPeriod", this.filteredReportPeriodsList[0].value); //NO I18N
			}else{
				this.set("compareSingleDevRepPeriods", this.defaultCompareSingleDevRepPeriods.filter(nfa_getFilteredCompareSingleDevRepPeriods, this)); //NO I18N
				this.set("selectedCompareSingleDevRepPeriod", (this.isEdit && (this.selectedScheduleFrequency == this.responseObj.scheduleType)) ? this.respCompSingleDevRepPeriod : this.compareSingleDevRepPeriods[0].value); //NO I18N
			}

			this.set("repGenHour", ((this.selectedScheduleFrequency == "once") ? ("00"+this.currentTimeObj.getHours()).slice(-2) : "00")); //NO I18N
			this.set("repGenMinute", ((this.selectedScheduleFrequency == "once") ? ("00"+this.currentTimeObj.getMinutes()).slice(-2) : "00")); //NO I18N
			this.set("minutesDiff", ((this.selectedScheduleFrequency == "once")?1:5)); //NO I18N

			this.set("showReportDate", (this.selectedScheduleFrequency == "once")); //NO I18N
			this.set("showReportWeeklyDay", (this.selectedScheduleFrequency == "weekly")); //NO I18N
			this.set("showReportMonthlyDay", (this.selectedScheduleFrequency == "monthly")); //NO I18N

			this.set("showBussFilter", this.showBussFilterOption()); //NO I18N
			this.set("showExWeekEnd", this.showExcludeWeekendOption()); //NO I18N
			if(freq==="hourly" && this.showExWeekEnd) { //NO I18N
				this.set("isExWeekend",true); //NO I18N
				this.set("disableExcludeWeekend",true); //NO I18N
			}else{
				this.set("isExWeekend",this.exWeekend); //NO I18N
				this.set("disableExcludeWeekend",false); //NO I18N
			}

		},
		addMailVariable: function(type, value){
			(type == "mailSub") ? this.set("mailSubject", this.mailSubject+" ${"+value+"}") : this.set("mailMessage", this.mailMessage+"${"+value+"}\n"); //NO I18N
		},
		resolveDNSChanged: function(){
			if(this.showRowCountOption){
				if($("input[name=resolveDNS]:checked").val() === "1"){ //NO I18N
					$("input[name=rowCount][value=1000]").prop("checked", true); //NO I18N
					$("input[name=rowCount]").prop("disabled", true); //NO I18N
				}else{
					$("input[name=rowCount]").prop("disabled", false); //NO I18N
				}
			}
		},
		saveSchedule: function(){
			var data = {
				task: this.task,
				SchName: this.scheduleName,
				SchDesc: this.scheduleDesc
			};

			if(this.task == "modify"){
				data.schID = this.model.scheduleID;
			}else{
				if(!opm_validateFields({empty: ["scheduleName"]})){
					return;
				}
				if(!nfa_isValidName(data.SchName)){
					opm_infoMsgs("errorMsg",Ember.I18n.t("Schedule.Msg4",this));//NO I18N
					return;
				}
			}

			data.SchRepGenType = $("input[name=reportFormat]:checked").val(); //NO I18N
			data.timezone = this.timeZone;

			if(this.selectedSource == "reportProfile"){ //NO I18N
				data.DevType = "interface"; //NO I18N
				data.ReportType = "prof"; //NO I18N
			}else if(this.selectedSource === "otherReports"){ //NO I18N
				if(this.selectedReportType === "-1"){ //NO I18N
					opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.select.reporttype")); //NO I18N
					return;
				}
				if(this.selectedReportType==="speedtest") { //NO I18N
					data.DevType = "sensor";//NO I18N
					data.ReportType = this.selectedReportType;
				}else{
					data.DevType = this.selectedReportType;
					data.ReportType = "overall"; //NO I18N
				}

			}else{
				var selectedSrc = ""; //NO I18N
				switch(this.selectedSource){
					case "1": 	selectedSrc = "interface"; 	break; //NO I18N
					case "2": 	selectedSrc = "intfgroup"; 	break; //NO I18N
					case "3": 	selectedSrc = "ipgroup"; 	break; //NO I18N
					case "4": 	selectedSrc = "WlcDevices"; break; //NO I18N
					case "5": 	selectedSrc = "APGroup"; 	break; //NO I18N
					case "6": 	selectedSrc = "SSIDGroup"; 	break; //NO I18N
				}
				data.DevType = selectedSrc;
				if(this.selectedReportType == "-1"){
					opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.select.reporttype")); //NO I18N
					return;
				}
				data.ReportType = this.selectedReportType;
			}

			if(this.selectedSource == "reportProfile"){ //NO I18N
				if(this.oneClick){
					this.selectedReportProfile = this.model.selectedReportProfile;
				}
				if(this.selectedReportProfile == undefined){
					opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.reports.profiles.msg")); //NO I18N
					return;
				}
				data.RepProfileID = this.selectedReportProfile;
			}else if(this.oneClick){
				data.DeviceID = (this.isFrom === "reportsPage") ? this.model.oneClickDeviceID : JSON.stringify([nfa_getInterfaceID()]); //NO I18N
			}else if(this.selectedReportType==="forensics" || (this.selectedReportType==="comp" && this.selectedCompareReport==="singleDevice")){ //NO I18N
				data.DeviceID = JSON.stringify([this.lists.selectedSourceID]);
			}else if(this.showMultipleSourceSelection){
				data.DeviceID = (this.isAllDeviceSelected) ? JSON.stringify(["-1"]) : JSON.stringify(nfa_getSelectedSourceIDs(this.selectedSource).split(",")); //NO I18N
			}else{
				data.DeviceID = JSON.stringify(["-1"]); //NO I18N
			}
			if((this.selectedSource !== "reportProfile") && (data.DeviceID === "[]" || data.DeviceID === "[\"\"]" || data.DeviceID === "[null]")){
				var alertMessage = ""; //NO I18N
				switch(this.selectedSource){
					case "1"	: 	alertMessage = "webclient.select.atleastone.interface"; break; //NO I18N
					case "4"	: 	alertMessage = "webclient.license.apselectmsg"; break; //NO I18N
					case "2"	: 	//NO I18N
					case "3"	: 	//NO I18N
					case "5"	: 	//NO I18N
					case "6"	: 	alertMessage = "nfa.infoMsg.selectOneGroup"; break; //NO I18N
				}
				opm_infoMsgs("infoMsg", Ember.I18n.t(alertMessage, this)); //NO I18N
				return;
			}

			switch(this.selectedReportType){
				case "comp"		: 	data.subRepType = this.selectedCompareReport; //NO I18N
									if(this.selectedCompareReport == "multiDevice"){
										data.topCount = this.selectedCompReportRecord;
									}
									break;
				case "cust"		: 	data.logicOper = $("input[name='customMatch']:checked").val(); //NO I18N
									var gridIDs = $("#reportCriteriaList").getDataIDs(); //NO I18N
									if(gridIDs.length == 0){
										opm_infoMsgs("infoMsg", Ember.I18n.t("scheduleconfig.msg1")); //NO I18N
										return;
									}
									data.criteria = nfa_getSearchCriteriaList();
									break;
				case "geo"		: 	if(this.oneClick){ //NO I18N
										data.geoBasedOn = this.model.oneClickGeoBasedOn;
										data.dataDirection = this.model.oneClickGeoFlowType;
									}else{
										data.geoBasedOn = $("input[name='geoType']:checked").val(); //NO I18N
										data.dataDirection = $("input[name='flowtype']:checked").val(); //NO I18N
									}
									break;
				case "forensics":   data.logicOper = $("input[name='customMatch']:checked").val(); //NO I18N
									var gridIDs = $("#reportCriteriaList").getDataIDs(); //NO I18N
									data.criteria = nfa_getSearchCriteriaList();
									break;
			}
			if(this.selectedReportType == "cons"){
				if(this.selectedSource == "1" || this.selectedSource == "2" || this.selectedSource == "3"){
					data.consReportType = this.getSelectedConsReportTypes();
				}
				else{
					data.wlcConsReportType = this.getSelectedConsReportTypes();
				}
			}
			data.SchType = this.selectedScheduleFrequency;
			data.TimeFrame = this.selectedReportPeriod;

			data.isBussHour = (this.showBussFilter && this.isBussAlert);
			if(data.isBussHour){
				if(this.bussStartTime == this.bussEndTime){
					opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.businesshour.alertMsg")); //NO I18N
					return;
				}
				data.bussStTime = this.bussStartTime;
				data.bussEndTime = this.bussEndTime;
			}
			data.ExWeekEnd = (this.showExWeekEnd && this.isExWeekend);

			if(this.selectedScheduleFrequency == "once"){ //NO I18N
				data.ReportGenTime = $("#inputDatePicker").val()+" "+this.repGenHour+":"+this.repGenMinute; //NO I18N
				if(data.TimeFrame === "11") { //NO I18N
					if(!nfa_validateCustomTime(this.customStartTime, this.customEndTime)){
						return;
					}
					data.isBussHour = true;
					data.bussStTime = this.customStartTime;
					data.bussEndTime = this.customEndTime;
				}
			}else{
				data.minute = this.repGenMinute;
				data.hour = this.repGenHour;
				switch(this.selectedScheduleFrequency){
					case "weekly": 	data.day = this.selectedReportWeeklyDay; break; //NO I18N
					case "monthly": data.date = this.selectedReportMonthlyDay; break; //NO I18N
				}
			}
			if(this.selectedReportType == "comp" && this.selectedCompareReport == "singleDevice"){
				data.TimeFrame = this.selectedCompareSingleDevRepPeriodOption;
			}

			if(this.isMailEnabled){
				if(!opm_validateFields({"empty": ["mailAddress", "mailSubject"], "emailValidation": ["mailAddress"]})){
					return;
				}
				data.Email = JSON.stringify(this.toMailAddress.split(","));
				data.EmailSubject = this.mailSubject;
				data.EmailMessage = this.mailMessage;
				data.attachType = $("input[name=mailAttachment]:checked").val(); //NO I18N
				if(data.attachType == "1"){
					data.pdfCount = this.selectedPDFCount;
				}
			}

			if(this.schSettingsObj != undefined){
				if(this.showDNSOption){
					data.resolveDns = $("#nfa_schedule input[name=resolveDNS]:checked").val(); //NO I18N
				}
				if(this.showGraphOption){
					data.GraphOption = $("#nfa_schedule input[name=GraphOption]:checked").val(); //NO I18N
				}
				if(this.showTOSOption){
					data.isTOS = $("#nfa_schedule input[name=isTOS]:checked").val(); //NO I18N
				}
				if(this.showRowCountOption){
					data.RowCount = $("#nfa_schedule input[name=rowCount]:checked").val(); //NO I18N
				}
				if(this.showIPTypeOption){
					data.IPType = $("#nfa_schedule input[name=IPType]:checked").val(); //NO I18N
				}
				if(this.showGraphChartTypes){
					data.graphChartType =  $("#nfa_schedule input[name=GraphTypes]:checked").val(); //NO I18N
				}
			}

			var self = this;
			var callBackFunction = function(response){
				if(response.error != undefined){
					opm_infoMsgs("errorMsg", response.error.message); //NO I18N
				}else if(response.status != undefined){
					if(response.status == "Failure"){
						opm_infoMsgs("errorMsg", response.message); //NO I18N
					}else{
						opm_infoMsgs("successMsg", response.message); //NO I18N
						self.send("goBack"); //NO I18N
					}
				}
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfasch/scheduleConfig", data, callBackFunction, {}); //NO I18N
		},
		goBack: function(){
			if(this.oneClick){
				if(this.model.goBackRoute === "5"){ //NO I18N
					slideOut(this.model.goBackRoute);
					this.set("showScheduleForm", false); //NO I18N
				}else{
					opmGlobalRoute.transitionTo(this.model.goBackRoute);
				}
			}else{
				opmGlobalRoute.transitionTo("Reports.Netflow.Schedule.index"); //NO I18N
			}
		}
	},
	willDestroyElement: function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaReportCriteriaComponent = Ember.Component.extend({
	templateName: "components/nfa-report-criteria", //NO I18N
	ToSIPPrecedenceList: [
		{name: Ember.I18n.t("webclient.SelectIP-Precedence"),		value: ""}, //NO I18N
		{name: Ember.I18n.t("webclient.0-Routine"),					value: "0"}, //NO I18N
		{name: Ember.I18n.t("webclient.1-Priority"),				value: "1"}, //NO I18N
		{name: Ember.I18n.t("webclient.2-Immediate"),				value: "2"}, //NO I18N
		{name: Ember.I18n.t("webclient.3-Flash"),					value: "3"}, //NO I18N
		{name: Ember.I18n.t("webclient.4-FlashOverride"),			value: "4"}, //NO I18N
		{name: Ember.I18n.t("webclient.5-CRITIC.EP"),				value: "5"}, //NO I18N
		{name: Ember.I18n.t("webclient.6-InternetworkControl"),		value: "6"}, //NO I18N
		{name: Ember.I18n.t("webclient.7-NetworkControl"),			value: "7"} //NO I18N
	],
	ToSDelayList: [
		{name: Ember.I18n.t("webclient.SelectDelay"),		value: ""}, //NO I18N
		{name: Ember.I18n.t("webclient.Normal"),			value: "N"}, //NO I18N
		{name: Ember.I18n.t("webclient.Low"),				value: "L"} //NO I18N
	],
	ToSThroughputList: [
		{name: Ember.I18n.t("webclient.SelectThroughput"),		value: ""}, //NO I18N
		{name: Ember.I18n.t("webclient.Normal"),				value: "N"}, //NO I18N
		{name: Ember.I18n.t("webclient.High"),					value: "H"} //NO I18N
	],
	ToSReliabilityList: [
		{name: Ember.I18n.t("webclient.SelectReliability"),		value: ""}, //NO I18N
		{name: Ember.I18n.t("webclient.Normal"),				value: "N"}, //NO I18N
		{name: Ember.I18n.t("webclient.High"),					value: "H"} //NO I18N
	],
	ToSCostList: [
		{name: Ember.I18n.t("webclient.SelectCost"),			value: ""}, //NO I18N
		{name: Ember.I18n.t("webclient.Normal"),				value: "N"}, //NO I18N
		{name: Ember.I18n.t("webclient.Low"),					value: "L"} //NO I18N
	],
	initDefaults: function(){
		switch(this.sourceType){
			case "1"			: 	//NO I18N
			case "2"			: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.Source.Address"), 			value: "SrcAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Network"), 			value: "SrcEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nodes"), 				value: "SrcSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Address"), 		value: "DstAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destinatin.Network"), 		value: "DstEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destinaion.Nodes"), 			value: "DstSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Application"), 				value: "Application"}, //NO I18N
										{name: Ember.I18n.t("webclient.admin.appmanager.port"), 	value: "Port"}, //NO I18N
										{name: Ember.I18n.t("opu.ipam.PORT_RANGE"), 				value: "PortRange"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.dscp"), 						value: "DSCP"}, //NO I18N
										{name: Ember.I18n.t("nfa.asview.srcas"), 					value: "SrcAS"}, //NO I18N
										{name: Ember.I18n.t("nfa.asview.dstas"), 					value: "DstAS"} //NO I18N
									]);
									break;
			case "3"			: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.Source.Address"), 			value: "SrcAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Network"), 			value: "SrcEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nodes"), 				value: "SrcSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Address"), 		value: "DstAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destinatin.Network"), 		value: "DstEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destinaion.Nodes"), 			value: "DstSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Application"), 				value: "Application"}, //NO I18N
										{name: Ember.I18n.t("webclient.admin.appmanager.port"), 	value: "Port"}, //NO I18N
										{name: Ember.I18n.t("opu.ipam.PORT_RANGE"), 				value: "PortRange"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.dscp"), 						value: "DSCP"} //NO I18N
									]);
									break;
			case "4"			: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.reports.SSID"), 				value: "SSID"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.NBARApplication"),	value: "NBARApplication"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.CliIP"), 					value: "IPHost"}, //NO I18N
										{name: Ember.I18n.t("webclinet.inventory.wlc.clientmac"), 	value: "Host"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.PreDSCP"), 			value: "DSCPIn"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.PostDSCP"), 			value: "DSCPOut"}, //NO I18N
										{name: Ember.I18n.t("webclient.iphost.network"), 			value: "IPHostNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.iphost.nodes"), 				value: "IPHostNodes"} //NO I18N
									]);
									break;
			case "5"			: 	//NO I18N
			case "6"			: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.reports.SSID"), 				value: "SSID"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.CliIP"), 					value: "IPHost"}, //NO I18N
										{name: Ember.I18n.t("webclinet.inventory.wlc.clientmac"), 	value: "Host"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.PreDSCP"), 			value: "DSCPIn"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.PostDSCP"), 			value: "DSCPOut"}, //NO I18N
										{name: Ember.I18n.t("webclient.iphost.network"), 			value: "IPHostNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.iphost.nodes"), 				value: "IPHostNodes"} //NO I18N
									]);
									break;
			case "DPI_UDP"		: 	 //NO I18N
			case "DPI_TCP"		: 	var tempCriteriaList = [ //NO I18N
										{name: Ember.I18n.t("webclient.Source.Address"),					value: "SrcAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nework"),						value: "SrcEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nodes"),						value: "SrcSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Address"),				value: "DstAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Network"),				value: "DstEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Nodes"),					value: "DstSetNodes"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.App"),								value: "InputApplication"}, //NO I18N
										{name: Ember.I18n.t("fwa.report.url"),								value: "urlHost"}, //NO I18N
										{name: Ember.I18n.t("showPorts.SourcePort"),						value: "SPort"}, //NO I18N
										{name: Ember.I18n.t("webclient.admin.forward.destinationport"),		value: "DPort"}, //NO I18N
										{name: Ember.I18n.t("nfa.dpi.srcportrange"),						value: "SPortRange"}, //NO I18N
										{name: Ember.I18n.t("nfa.dpi.dstportrange"),						value: "DPortRange"} //NO I18N
									];
									if(this.sourceType === "DPI_UDP"){
										tempCriteriaList.splice(7, 1);
									}
									this.set("criteriaList", tempCriteriaList); //NO I18N
									break;
			case "Forensics_1"	: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.Source.Address"),			value: "SrcAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nework"),				value: "SrcEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nodes"),				value: "SrcSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Address"),		value: "DstAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Network"),		value: "DstEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Nodes"),			value: "DstSetNodes"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.App"),						value: "InputApplication"}, //NO I18N
										{name: Ember.I18n.t("webclient.admin.appmanager.port"),		value: "Port"}, //NO I18N
										{name: Ember.I18n.t("opu.ipam.PORT_RANGE"),					value: "PortRange"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.dscp"),						value: "DSCP"}, //NO I18N
										{name: Ember.I18n.t("nfa.asview.srcas"),					value: "SrcAS"}, //NO I18N
										{name: Ember.I18n.t("nfa.asview.dstas"),					value: "DstAS"}, //NO I18N
										{name: Ember.I18n.t("opu.common.PROTOCOL"),					value: "Protocol"}, //NO I18N
										{name: Ember.I18n.t("sch.tos"),								value: "TOS"}, //NO I18N
										{name: Ember.I18n.t("webclient.TCP_FLAGS"),					value: "TCP_FLAGS"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.NBARApplication"),	value: "NBARApplication"}, //NO I18N
										{name: Ember.I18n.t("webclient.forensics.nexthop"),			value: "NextHop"}, //NO I18N
										{name: Ember.I18n.t("webclient.nfa.srcnat"),				value: "TranslatedSRCIP"}, //NO I18N
										{name: Ember.I18n.t("webclient.nfa.dstnat"),				value: "TranslatedDSTIP"} //NO I18N
									]);
									break;
			case "Forensics_4"	: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.reports.SSID"),				value: "SSID"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.NBARApplication"),	value: "NBARApplication"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.CliIP"),						value: "IPHost"}, //NO I18N
										{name: Ember.I18n.t("webclinet.inventory.wlc.clientmac"),	value: "Host"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.PreDSCP"),			value: "DSCPIn"}, //NO I18N
										{name: Ember.I18n.t("webclient.reports.PostDSCP"),			value: "DSCPOut"}, //NO I18N
										{name: Ember.I18n.t("webclient.iphost.network"),			value: "IPHostNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.iphost.nodes"),				value: "IPHostNodes"} //NO I18N
									]);
									break;
			case "Forensics_8"	: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.Source.Address"),			value: "SrcAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nework"),				value: "SrcEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nodes"),				value: "SrcSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Address"),		value: "DstAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Network"),		value: "DstEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Nodes"),			value: "DstSetNodes"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.App"),						value: "InputApplication"}, //NO I18N
										{name: Ember.I18n.t("webclient.admin.appmanager.port"),		value: "Port"}, //NO I18N
										{name: Ember.I18n.t("opu.ipam.PORT_RANGE"),					value: "PortRange"}, //NO I18N
										{name: Ember.I18n.t("opu.common.PROTOCOL"),					value: "Protocol"}, //NO I18N
										{name: Ember.I18n.t("webclient.TCP_FLAGS"),					value: "TCP_FLAGS"} //NO I18N
									]);
									break;
			case "widget_Conv"	: 	this.set("criteriaList", [ //NO I18N
										{name: Ember.I18n.t("webclient.Source.Address"),			value: "SrcAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Network"), 			value: "SrcEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Source.Nodes"), 				value: "SrcSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destination.Address"),		value: "DstAddr"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destinatin.Network"), 		value: "DstEntNet"}, //NO I18N
										{name: Ember.I18n.t("webclient.Destinaion.Nodes"), 			value: "DstSetNodes"}, //NO I18N
										{name: Ember.I18n.t("webclient.Application"), 				value: "Application"}, //NO I18N
										{name: Ember.I18n.t("NFAWidget.dscp"), 						value: "DSCP"} //NO I18N
									]);
									break;
		}
		this.set("selectedCriteria", this.criteriaList[0].value); //NO I18N
		this.set("criteriaTypeList",[{name:Ember.I18n.t("webclient.Include"),value:"true"},{name:Ember.I18n.t("webclient.Exclude"),value:"false"}]); //NO I18N
	}.on("init"), //NO I18N
	sourceTypeChanged: function(){
		if(this.updateCriteriaOnSourceChange){
			this.initDefaults();
			this.loadCriteriaTable([]);
		}
	}.observes("sourceType"), //NO I18N
	criteriaTypeChanged: function(){
		$(".OpMAlertMsg").remove();
		this.set("showSingleInput" , ["SrcAddr", "DstAddr", "SSID", "IPHost", "Host", "DSCPIn", "DSCPOut", "InputApplication", "urlHost", "SPort", "DPort", "Port", "DSCP", "Protocol", "NBARApplication", "NextHop", "TranslatedSRCIP", "TranslatedDSTIP"].contains(this.selectedCriteria)); //NO I18N
		this.set("showDoubleInput" , ["SrcEntNet", "DstEntNet", "IPHostNet", "SPortRange", "DPortRange", "PortRange"].contains(this.selectedCriteria)); //NO I18N
		this.set("showTripleInput" , ["SrcSetNodes", "DstSetNodes", "IPHostNodes"].contains(this.selectedCriteria)); //NO I18N
		this.set("showAppInput" , ["Application"].contains(this.selectedCriteria)); //NO I18N
		this.set("showASInput", (["SrcAS", "DstAS"].indexOf(this.selectedCriteria) > -1)); //NO I18N
		this.set("showToSInput", (this.selectedCriteria === "TOS")); //NO I18N
		this.set("showTCPFlagsInput", (this.selectedCriteria === "TCP_FLAGS")); //NO I18N
		this.set("hideFirstLineAddButton", (this.showToSInput || this.showTCPFlagsInput)); //NO I18N

		this.set("placeholderText1", ((["SrcAddr", "DstAddr", "IPHost"].indexOf(this.selectedCriteria) > -1) ? Ember.I18n.t("jsp.commonstr.IpAddress") : "")); //NO I18N

		this.set("placeholderText2", ((["SPortRange", "DPortRange", "PortRange"].indexOf(this.selectedCriteria) > -1) ? Ember.I18n.t("from") : Ember.I18n.t("webclient.discovery.netip"))); //NO I18N
		this.set("placeholderText3", ((["SPortRange", "DPortRange", "PortRange"].indexOf(this.selectedCriteria) > -1) ? Ember.I18n.t("to") : Ember.I18n.t("webclient.discovery.netmask"))); //NO I18N

		this.set("placeholderText4", ((["SrcSetNodes", "DstSetNodes", "IPHostNodes"].indexOf(this.selectedCriteria) > -1) ? Ember.I18n.t("webclient.discovery.netmask") : "")); //NO I18N
		this.set("placeholderText5", ((["SrcSetNodes", "DstSetNodes", "IPHostNodes"].indexOf(this.selectedCriteria) > -1) ? Ember.I18n.t("webclient.discovery.startip") : "")); //NO I18N
		this.set("placeholderText6", ((["SrcSetNodes", "DstSetNodes", "IPHostNodes"].indexOf(this.selectedCriteria) > -1) ? Ember.I18n.t("webclient.discovery.endip") : "")); //NO I18N

		this.set("singleValue1", ""); //NO I18N
		this.set("doubleValue1", ""); //NO I18N
		this.set("doubleValue2", ""); //NO I18N
		this.set("tripleValue1", ""); //NO I18N
		this.set("tripleValue2", ""); //NO I18N
		this.set("tripleValue3", ""); //NO I18N
		this.set("selectedToSIPPrec", ""); //NO I18N
		this.set("selectedToSDelay", ""); //NO I18N
		this.set("selectedToSThroughput", ""); //NO I18N
		this.set("selectedToSReliability", ""); //NO I18N
		this.set("selectedToSCost", ""); //NO I18N
	}.observes("selectedCriteria"), //NO I18N
	loadCriteriaTable:function(tempData){
		var colNames =[Ember.I18n.t("criteria"),Ember.I18n.t("opu.views.TYPE"),Ember.I18n.t("jsp.commonstr.Value"),Ember.I18n.t("jsp.commonstr.Delete"),'crivalue','critType']; //No I18N
		var colModels =	[
			{name:"criteria", 	index:"criteria",	sortable:false, 	width:30}, //NO I18N
			{name:"criType",	index:"criType",	sortable:false, 	width:15}, //NO I18N
			{name:"value",		index:"value",		sortable:false, 	width:55}, //NO I18N
			{name:"delete", 	index:"delete",		sortable:false, 	width:15,	formatter:nfa_deleteAction}, //NO I18N
			{name:"crivalue", 	index:"crivalue", 	hidden:true}, //NO I18N
			{name:"criTypeVal",	index:"crivalue", 	hidden:true} //NO I18N
		];
		var defaultOptions = {sortName:"criteria", sortOrder:"asc"}; //NO I18N
		$("#reportCriteriaList").jqGrid("GridUnload"); //NO I18N
		nfa_loadJQgridWithData("#reportCriteriaList", tempData, colNames, colModels, "", "", "", defaultOptions); //NO I18N
	},
	didInsertElement:function(){
		if(this.sourceType.indexOf("DPI") > -1){ //NO I18N
			$("#criTypeDiv").hide(); //NO I18N
		}
		var data = (this.list !== undefined && this.list.criteria !== undefined) ? this.getResponseCriteria(this.list.criteria) : [];
		this.loadCriteriaTable(data);
	},
	loadASValues: function(){
		this.set("asPrompt",Ember.I18n.t("nfa.asview.search"));//NO I18N
		this.set("asUrl",window.OPM.apiUrlPattern+"/nfaadmin/customSearchAS");//NO I18N
	}.observes("showASInput"), //NO I18N
	getResponseCriteria: function(response){
		if(this.list.isDPIForensics || this.list.isForensicsInventory){
			return this.list.criteria;
		}

		if(this.list.isForensicsFavorite){
			$("input[name='customMatch'][value='"+this.list.criteria.criteriaOper+"']").prop("checked", true); //NO I18N
			return nfa_setReportCriteria(this);
		}

		var criteriaList = [];
		var critType = {"true":Ember.I18n.t("webclient.Include"),"false":Ember.I18n.t("webclient.Exclude")}; //NO I18N

		if(response.ipList!==undefined && response.ipList.length>0){
			for(var i=0; i<response.ipList.length; i++){
				var ipcrit = response.ipList[i];
				var criteria="",value="",crivalue=""; //NO I18N
				switch(ipcrit[0]){
					case "IPAddress"		:	criteria = (ipcrit[1] === "true") ? Ember.I18n.t("webclient.Source.Address") : Ember.I18n.t("webclient.Destination.Address"); //NO I18N
												value = ipcrit[2];
												crivalue = (ipcrit[1] === "true") ? "SrcAddr" : "DstAddr"; //NO I18N
												break;
					case "IPNetwork"		:	criteria = (ipcrit[1] === "true") ? Ember.I18n.t("webclient.Source.Network") : Ember.I18n.t("webclient.Destinatin.Network"); //NO I18N
												value = "Network: "+ipcrit[2]+", Netmask: "+ipcrit[3]; //NO I18N
												crivalue = (ipcrit[1] === "true") ? "SrcEntNet" : "DstEntNet"; //NO I18N
												break;
					case "IPHost"			:	criteria = Ember.I18n.t("NFAWidget.CliIP"); //NO I18N
												value = ipcrit[2];
												crivalue = "IPHost"; //NO I18N
												break;
					case "IPHostNet"		:	criteria = Ember.I18n.t("webclient.iphost.network"); //NO I18N
												value = "Network: "+ipcrit[2]+", Netmask: "+ipcrit[3]; //NO I18N
												crivalue = "IPHostNet"; //NO I18N
												break;
					case "IPHostNodes"		:	criteria = Ember.I18n.t("webclient.iphost.nodes"); //NO I18N
												value = "Netmask: "+ipcrit[4]+", Start IP: "+ipcrit[2]+", End IP: "+ipcrit[3]; //NO I18N
												crivalue = "IPHostNodes"; //NO I18N
												break;
					case "Port"				:	criteria = Ember.I18n.t("webclient.admin.appmanager.port"); //NO I18N
												value = ipcrit[2];
												crivalue = "Port"; //NO I18N
												break;
					case "PortRange"		:	criteria = Ember.I18n.t("opu.ipam.PORT_RANGE"); //NO I18N
												value = Ember.I18n.t("webclient.devices.details.avail.from")+": "+ipcrit[2]+", "+Ember.I18n.t("webclient.devices.details.avail.to")+": "+ipcrit[3]; //NO I18N
												crivalue = "PortRange"; //NO I18N
												break;
					case "DSCP"				:	criteria = Ember.I18n.t("NFAWidget.dscp"); //NO I18N
												value = ipcrit[2];
												crivalue = "DSCP"; //NO I18N
												break;
					case "SrcAS"			:	criteria = Ember.I18n.t("nfa.asview.srcas"); //NO I18N
												var arry=ipcrit[2];
												value = arry.get(0)+"["+arry.get(1)+"]";
												crivalue = "SrcAS"; //NO I18N
												break;
					case "DstAS"			:	criteria = Ember.I18n.t("nfa.asview.dstas"); //NO I18N
												var arry=ipcrit[2];
												value = arry.get(0)+"["+arry.get(1)+"]";
												crivalue = "DstAS"; //NO I18N
												break;
					case "TOS"				:	criteria = Ember.I18n.t("sch.tos"); //NO I18N
												value = ipcrit[2];
												crivalue ="TOS";//NO I18N
												break;
					case "TCP_FLAGS"		:	criteria = Ember.I18n.t("webclient.TCP_FLAGS"); //NO I18N
												value = ipcrit[2];
												crivalue ="TCP_FLAGS";//NO I18N
												break;
					case "Protocol"			:	criteria = Ember.I18n.t("opu.common.PROTOCOL"); //NO I18N
												value = ipcrit[2];
												crivalue ="Protocol";//NO I18N
												break;
					case "NextHop"			:	criteria = Ember.I18n.t("webclient.forensics.nexthop"); //NO I18N
												value = ipcrit[2];
												crivalue ="NextHop";//NO I18N
												break;
					case "TranslatedSRCIP"	:	criteria = Ember.I18n.t("webclient.nfa.srcnat"); //NO I18N
												value = ipcrit[2];
												crivalue ="TranslatedSRCIP";//NO I18N
												break;
					case "TranslatedDSTIP"	:	criteria = Ember.I18n.t("webclient.nfa.dstnat"); //NO I18N
												value = ipcrit[2];
												crivalue ="TranslatedDSTIP";//NO I18N
												break;
					default					:	criteria = (ipcrit[1] === "true") ? Ember.I18n.t("webclient.Source.Nodes") : Ember.I18n.t("webclient.Destinaion.Nodes"); //NO I18N
												value = "Netmask: "+ipcrit[4]+", Start IP: "+ipcrit[2]+", End IP: "+ipcrit[3]; //NO I18N
												crivalue = (ipcrit[1] === "true") ? "SrcSetNodes" : "DstSetNodes"; //NO I18N
												break;
				}
				criteriaList.push({"criteria":criteria,"criType":critType[ipcrit[5]],"value":value,"crivalue":crivalue,"criTypeVal":ipcrit[5]}); //NO I18N
			}
		}
		if(response.appList!==undefined && response.appList.length>0){
			for(var i=0;i<response.appList.length;i++){
				if(response.appList[i].indexOf("NBARApplication")>=0){
					criteriaList.push({"criteria":Ember.I18n.t("webclient.reports.NBARApplication"),"criType":critType[response.appList[i][1]],"value":response.appList[i][0],"crivalue":"NBARApplication","criTypeVal":response.appList[i][1]}); //NO I18N
				}
				else{
					criteriaList.push({"criteria":Ember.I18n.t("NFAWidget.App"),"criType":critType[response.appList[i][1]],"value":response.appList[i][0],"crivalue":"Application","criTypeVal":response.appList[i][1]}); //NO I18N
				}
			}
		}
		if(response.ssidList!==undefined && response.ssidList.length>0){
			for(var i=0; i<response.ssidList.length; i++){
				criteriaList.push({"criteria":Ember.I18n.t("webclient.reports.SSID"),"criType":critType[response.ssidList[i][5]],"value":response.ssidList[i][2],"crivalue":"SSID","criTypeVal":response.ssidList[i][5]}); //NO I18N
			}
		}
		if(response.macList!==undefined && response.macList.length>0){
			for(var i=0; i<response.macList.length; i++){
				criteriaList.push({"criteria":Ember.I18n.t("webclinet.inventory.wlc.clientmac"),"criType":critType[response.macList[i][5]],"value":response.macList[i][2],"crivalue":"Host","criTypeVal":response.macList[i][5]}); //NO I18N
			}
		}
		if(response.dscpList!==undefined && response.dscpList.length>0){
			for(var i=0; i<response.dscpList.length; i++){
				criteriaList.push({"criteria":((response.dscpList[i][0]==="DSCPIn")?Ember.I18n.t("webclient.reports.PreDSCP"):Ember.I18n.t("webclient.reports.PostDSCP")),"criType":critType[response.dscpList[i][3]],"value":response.dscpList[i][2],"crivalue":response.dscpList[i][0],"criTypeVal":response.dscpList[i][3]}); //NO I18N
			}
		}
		return criteriaList;
	},
	actions:{
		addScheduleCriteria: function(){
			var criteria = $("#"+this.elementId+" .sourceCri option:selected").text(); //NO I18N
			var criType = $("#"+this.elementId+" .criType option:selected").text(); //NO I18N
			var value = ""; //NO I18N
			var crivalue = this.selectedCriteria;
			var fieldsToValidate = {empty: [], ipCheck: [], alphaNumeric: [],alphaNumericWithBasic: [],custom: [], macCheck: [], netmask: [], ipv4Validation: [], ipv6Validation: [], ipv6MaskValidation: []};

			switch(this.selectedCriteria){
				case "SrcAddr"			: 	 //NO I18N
				case "DstAddr"			: 	 //NO I18N
				case "NextHop"			: 	 //NO I18N
				case "TranslatedSRCIP"	: 	 //NO I18N
				case "TranslatedDSTIP"	: 	 //NO I18N
				case "IPHost"			: 	fieldsToValidate.ipCheck.push("addressInput"); //NO I18N
											value = this.singleValue1;
											break;
				case "Host"				: 	 //NO I18N
				case "APMac"			: 	fieldsToValidate.empty.push("addressInput"); //NO I18N
											fieldsToValidate.macCheck.push("addressInput"); //NO I18N
											value = this.singleValue1;
											break;
				case "SSID"				:	value = this.singleValue1;//NO I18N
											fieldsToValidate.empty.push("addressInput"); //NO I18N
											fieldsToValidate.custom.push({identifier: "addressInput", condition: !nfa_isValidName(value, "\"?$\[\]\\+"), message: Ember.I18n.t("webclient.devices.devprop.status.spechar")});//NO I18N
											break;
				case "DSCP"				: 	 //NO I18N
				case "DSCPIn"			: 	 //NO I18N
				case "DSCPOut"			: 	fieldsToValidate.empty.push("addressInput"); //NO I18N
											fieldsToValidate.alphaNumeric.push("addressInput"); //NO I18N
											value = this.singleValue1;
											break;
				case "SrcEntNet"		: 	 //NO I18N
				case "DstEntNet"		: 	 //NO I18N
				case "IPHostNet"		: 	fieldsToValidate.ipCheck.push("networkInput"); //NO I18N
											fieldsToValidate.netmask.push({addressField: "networkInput", netmaskField: "netmaskInput"});
											value = "Network: "+this.doubleValue1+", Netmask: "+this.doubleValue2; //NO I18N
											break;
				case "SrcSetNodes"		: 	 //NO I18N
				case "DstSetNodes"		: 	 //NO I18N
				case "IPHostNodes"		: 	fieldsToValidate.ipCheck.push("strIPInput"); //NO I18N
											if(opm_isIpV4Address(this.tripleValue2)){
												fieldsToValidate.ipv4Validation.push("netmaskInput");
												fieldsToValidate.ipv4Validation.push("EndIPInput");
											}
											else{
												fieldsToValidate.ipv6Validation.push("EndIPInput");
												fieldsToValidate.ipv6MaskValidation.push("netmaskInput");
											}
											value = "Netmask: "+this.tripleValue1+", Start IP: "+this.tripleValue2+", End IP: "+this.tripleValue3; //NO I18N
											break;
				case "Application"		: 	value = $("#nfaUniqueAppList").val(); //NO I18N
											break;
				case "urlHost"			: 	 //NO I18N
				case "Protocol"			: 	 //NO I18N
				case "NBARApplication"	: 	 //NO I18N
				case "InputApplication"	: 	fieldsToValidate.appNameCheck = ["addressInput"]; //NO I18N
											value = this.singleValue1;
											if(this.selectedCriteria === "InputApplication"){crivalue = "Application"}; //NO I18N
											break;
				case "Port"				: 	 //NO I18N
				case "SPort"			: 	 //NO I18N
				case "DPort"			: 	fieldsToValidate.port = ["addressInput"]; //NO I18N
											value = this.singleValue1;
											break;
				case "PortRange"		: 	 //NO I18N
				case "SPortRange"		: 	 //NO I18N
				case "DPortRange"		: 	fieldsToValidate.port = ["networkInput", "netmaskInput"]; //NO I18N
											fieldsToValidate.custom = [{identifier: "netmaskInput", condition: (parseInt(this.doubleValue1) >= parseInt(this.doubleValue2)), message: Ember.I18n.t("webclient.invalidportrange")}]; //NO I18N
											value = Ember.I18n.t("webclient.devices.details.avail.from")+": "+this.doubleValue1+", "+Ember.I18n.t("webclient.devices.details.avail.to")+": "+this.doubleValue2; //NO I18N
											break;
				case "SrcAS"			: 	 //NO I18N
				case "DstAS"			: 	fieldsToValidate.empty.push("asSearch"); //NO I18N
											value = $("#asSearch :selected").text();
											break;
				case "TOS"				: 	fieldsToValidate.empty = ["ToSIPPrec", "ToSDelay", "ToSThroughput", "ToSReliability", "ToSCost"]; //NO I18N
											value = this.selectedToSIPPrec+" "+this.selectedToSDelay+" "+this.selectedToSThroughput+" "+this.selectedToSReliability+" "+this.selectedToSCost; //NO I18N
											break;
				case "TCP_FLAGS"		: 	var flags = $("input[name='tcpFlag']:checked"); //NO I18N
											var selectedFlags = flags.length;
											if(selectedFlags === 0){
												opm_infoMsgs("infoMsg", Ember.I18n.t("fwa.setting.select.one.checkbox")); //NO I18N
												return;
											}else{
												var flagValues = [];
												for(var i=0; i<selectedFlags; i++){
													flagValues.push($(flags[i]).val());
												}
												value = flagValues.join(", "); //NO I18N
											}
											break;
			}
			if(!opm_validateFields(fieldsToValidate)){
				return;
			}
			var tempData = {"criteria":criteria,"criType":criType,"value":value,"crivalue":crivalue,"criTypeVal":this.selectedCriteriaType}; //NO I18N
			var tableLength = $("#reportCriteriaList").jqGrid("getDataIDs").length; //NO I18N
			if(tableLength == 0){ //NO I18N
				this.loadCriteriaTable([tempData]);
			}
			else{
				$("#reportCriteriaList").jqGrid("addRowData", tableLength+1, tempData); //NO I18N
				$("#reportCriteriaList").trigger("reloadGrid"); //NO I18N
			}
			if(this.selectedCriteria == this.criteriaList[0].value){
				this.set("singleValue1", ""); //NO I18N
			}else{
				this.set("selectedCriteria", this.criteriaList[0].value); //NO I18N
				$("#"+this.elementId+" .sourceCri").val(this.criteriaList[0].value).select2(); //NO I18N
			}
		}
	},
	willDestroyElement: function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaDatePickerComponent = Ember.Component.extend({
	templateName: "components/nfa-date-picker", //NO I18N
	didInsertElement: function(){
		this.set("labelName", Ember.I18n.t(this.label)); //NO I18N
		this.setDate();
	},
	setDate: function(){
		if(this.inputDate == undefined){
			this.inputDate = opm_formatDate(new Date());
		}
		$("#inputDatePicker").val(this.inputDate); //NO I18N
		$("#inputDatePicker").datepicker({dateFormat: "yy-mm-dd", minDate: this.inputDate}); //NO I18N
	}.observes("inputDate"), //NO I18N
	willDestroyElement: function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaTimezoneSettingsComponent = Ember.Component.extend({
	templateName: "components/nfa-timezone-settings", //NO I18N
	initDefaults: function(){
		this.set("showPage", (window.isserver ? isAllCollectorSelected() : (window.OPM.isNFA || (window.OPM.isOPM && window.OPM.isNfaPlug)))); //NO I18N
		var timeZones = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getCurrentTimeZone"); //NO I18N
		this.set("timeZoneList", timeZones.tzList); //NO I18N
		this.set("selectedTimeZone", timeZones.tZone); //NO I18N
	}.on("init"), //NO I18N
	timeZoneChanged: function(){
		if(this.selectedTimeZone != undefined){
			this.updateTimeInfo(this.selectedTimeZone);
		}
	}.observes("selectedTimeZone"), //NO I18N
	updateTimeInfo: function(timeZone){
		var timeZoneInfo = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getTZInfo", {TimeZoneID: timeZone}); //NO I18N
		this.set("currentTimeValue", timeZoneInfo.currentTime); //NO I18N
		this.set("timeZoneAbbrValue", timeZoneInfo.abbre); //NO I18N
		this.set("standardTimeValue", timeZoneInfo.standardTime); //NO I18N
		if(timeZoneInfo.dayLight != undefined){
			this.set("showDayLightInfo", true); //NO I18N
			this.set("dayLightValue", timeZoneInfo.dayLight); //NO I18N
			this.set("timeZoneOffsetValue", timeZoneInfo.currentTZOffset); //NO I18N
		}else{
			this.set("showDayLightInfo", false); //NO I18N
		}
		OPMClient.Settings.setTime(timeZoneInfo.currentDefaultTime);
		if(!OPMClient.Settings.timeoutStarted) {
			OPMClient.Settings.timeoutStarted = true;
			OPMClient.Settings.incrementTime();
		}
	},
	actions: {
		saveTimeValues: function(){
			var callBackFunction = function(response, self){
				if(response.error === undefined){
					window.OPM.userTimeZone = self.selectedTimeZone;
				}
				showMessage(response);
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/updateTZone", {TimeZoneID: this.selectedTimeZone}, callBackFunction, this); //NO I18N
		}
	}
});

OPMClient.NfaDnsSettingsComponent = Ember.Component.extend({
	templateName: "components/nfa-dns-settings", //NO I18N
	timeoutList: [100, 200, 300, 500, 1000, 2000, 3000, 5000],
	retryList: [1, 2, 3, 4, 5],
	initDefaults: function(){
		if(isAllCollectorSelected()){
			nfa_changeColOpt();
		}
	}.on("init"), //NO I18N
	didInsertElement: function(){
		var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getDNSSettings"); //NO I18N
		if(response != undefined){
			$("input[name='DNSCount'][value='"+response.count+"']").prop("checked", true); //NO I18N
			this.set("selectedTimeout", response.timeOut); //NO I18N
			$("#DNSTimeout").val(response.timeOut).select2(); //NO I18N
			this.set("selectedRetry", response.retry); //NO I18N
			$("#DNSRetry").val(response.retry).select2(); //NO I18N
			$("input[name='DNSMethod'][value='"+response.DNSMethod+"']").prop("checked", true); //NO I18N
			this.send("showDNSInput", response.DNSMethod); //NO I18N
			var customDNSData = [];
			if(response.customIP != undefined){
				var tempArr = response.customIP.split(","); //NO I18N
				for(var i=0; i<tempArr.length; i++){
					customDNSData.push({IP: tempArr[i]});
				}
			}
			this.loadCustomDNSTable(customDNSData);
		}
	},
	loadCustomDNSTable: function(tableData){
		var colNames = [Ember.I18n.t("jsp.commonstr.IpAddress"), Ember.I18n.t("webclient.action.delete")]; //NO I18N
		var colModel = [
			{name: "IP", index: "IP", sorttype: nfa_IPV4Sorting, formatter: jqGridHTMLEncode}, //NO I18N
			{name: "delete", index: "delete", formatter: nfa_deleteAction, width: 55, sortable: false, search: false} //NO I18N
		];
		var gridCallBackFunction = function(){
			$("#customDNSTable").jqGrid("setGridWidth", $("#nfaDNSSettings").find(".opmFormRow").width()-350); //NO I18N
		}
		$("#customDNSTable").jqGrid("GridUnload"); //NO I18N
		opm_loadJQgridWithData("#customDNSTable", tableData, colNames, colModel, "", "", "", {gridCallBack: gridCallBackFunction}); //NO I18N
	},
	actions: {
		showDNSInput: function(value){
			(value == "custom") ? $("#DNSInput").show() : $("#DNSInput").hide(); //NO I18N
		},
		addCustomIP: function(){
			var tableCount = $("#customDNSTable").getDataIDs().length;
			if(tableCount == 3){
				opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.customDNS.alertMsg1")); //NO I18N
				return;
			}
			if(opm_validateFields({empty: ["customDNSIP"], ipv4Validation: ["customDNSIP"]})){ //NO I18N
				if(tableCount == 0){
					this.loadCustomDNSTable([{IP: this.customDNSIPValue}]);
				}else{
					$("#customDNSTable").addRowData(tableCount+1, {IP: this.customDNSIPValue}); //NO I18N
				}
				this.set("customDNSIPValue", ""); //NO I18N
			}
		},
		saveDNSValues: function(clearCache){
			var data = {clearCache: clearCache};
			if(!clearCache){
				data.count = $("input[name='DNSCount']:checked").val(); //NO I18N
				data.timeOut = this.selectedTimeout;
				data.retry = this.selectedRetry;
				switch($("input[name='DNSMethod']:checked").val()){
					case "secondary": 	data.secDNSServer = true; //NO I18N
										break;
					case "custom": 		var colData = $("#customDNSTable").getCol("IP"); //NO I18N
										if(colData.length == 0){
											opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.customDNS.alertMsg2")); //NO I18N
											return;
										}
										data.custDNSServer = JSON.stringify(colData);
										break;
				}
			}
			var callBackFunction = function(response){
				showMessage(response);
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/updateDNSSettings", data, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
		}
	}
});

OPMClient.NfaUserdefinedDnsComponent = Ember.Component.extend({
	templateName: "components/nfa-userdefined-dns", //NO I18N
	initDefaults:function(){
		if(isAllCollectorSelected()){
			nfa_changeColOpt();
		}
	}.on("init"), //NO I18N
	didInsertElement:function(){
		if(window.OPM.isAuthorized && !isAllCollectorSelected()){
			$("#userDNSButtons").show(); //NO I18N
			nfa_loadUserDefinedDNSTable();
		}
	},
	willDestroyElement:function(){
		$("#userDNSButtons").hide(); //NO I18N
	}
});
OPMClient.NfaReportsSettingsComponent = Ember.Component.extend({
	templateName:"components/nfa-reports-settings",//NO I18N
	filters:[
		{name: Ember.I18n.t("nfa.on.demand"),				value:"OnDemand",	isChecked:true},//NO I18N
		{name: Ember.I18n.t("nfa.resolveIP.byDefault"),		value:"Default",	isChecked:false}//NO I18N
	],
	days:[
		{name:Ember.I18n.t("webclient.general.sunday"),		value:"Sunday",		className:""},//NO I18N
		{name:Ember.I18n.t("webclient.general.monday"),		value:"Monday",		className:""},//NO I18N
		{name:Ember.I18n.t("webclient.general.tuesday"),	value:"Tuesday",	className:""},//NO I18N
		{name:Ember.I18n.t("webclient.general.wednesday"),	value:"Wednesday",	className:""},//NO I18N
		{name:Ember.I18n.t("webclient.general.thursday"),	value:"Thursday",	className:""},//NO I18N
		{name:Ember.I18n.t("webclient.general.friday"),		value:"Friday",		className:""},//NO I18N
		{name:Ember.I18n.t("webclient.general.saturday"),	value:"Saturday",	className:""}//NO I18N
	],
	thresholdLine :[
		{name: Ember.I18n.t("webclient.admin.devices.None"),				value:"none"},//NO I18N
		{name: Ember.I18n.t("nfa.report.nthPercentail",{n:"90"}),			value:"90"},//NO I18N
		{name: Ember.I18n.t("nfa.report.nthPercentail",{n:"95"}),			value:"95"},//NO I18N
		{name: Ember.I18n.t("nfa.report.nthPercentail",{n:"99"}),			value:"99"},//NO I18N
		{name: Ember.I18n.t("webclinet.inventory.nfa.bandwidthcapacity"),	value:"speed"}//NO I18N
	],
	percentileFilter:[
		{name: Ember.I18n.t("webclient.action.enable"),	value:"Enable",isChecked:true},//NO I18N
		{name: Ember.I18n.t("webclient.action.disable"),value:"Disable",isChecked:false}//NO I18N
	],
	initDefaults:function(){
		this.set("bussStartTime",window.NFABussHourStartTime);//NO I18N
		this.set("bussEndTime",window.NFABussHourEndTime);//NO I18N
		this.set("disableConfigure", !(window.OPM.isAuthorized && (!window.isNFADE || isAllCollectorSelected()))); //NO I18N
	}.on("init"),//NO I18N
	didInsertElement:function(){
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			var resp = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getReportSettings");//NO I18N
			this.set("days",this.nfa_addActiveList(jQuery.extend(true, [], this.days), "value",resp.excWeekEnd.split(","))); //NO I18N
			this.set("thresholdLineType",resp.graph); //NO I18N
			this.set("defaultWeekEnd",this.setRadioBtnValues(resp.defaultWeekEnd,jQuery.extend(true,[],this.filters)));//NO I18N
			this.set("defaultBusinessHour",this.setRadioBtnValues(resp.businessDefault,jQuery.extend(true,[],this.filters)));//NO I18N
			$("input[name='dataType'][value='"+resp.divValue+"']").prop("checked", true); //NO I18N
			$("input[name='dataType']").trigger("change"); //NO I18N
			$("input[name='speedType'][value='"+resp.unitForSpeed+"']").prop("checked", true); //NO I18N
			$("input[name='volumeType'][value='"+resp.unitForVolume+"']").prop("checked", true); //NO I18N
			$("input[name='decimalCount'][value='"+resp.decimalCount+"']").prop("checked", true); //NO I18N
			this.set("thresholdLineList",nfa_getActiveList((resp.percentileInformation=="true") ?  this.thresholdLine : this.filterThresholdLine(),"value",this.thresholdLineType));//NO I18N
			$("input[name='percentileFilter'][value='"+((resp.percentileInformation==="true") ? "Enable" : "Disable")+"']").prop("checked", true);//NO I18N
			$("input[name='percentileFilter']").trigger("change");
		});
	}.observes("pageName"),//NO I18N
	setRadioBtnValues:function(param,array){
		array[0].isChecked = (param==="OnDemand");//NO I18N
		array[1].isChecked = (param==="Default");//NO I18N
		return array;
	},
	getSelectedExcludeWeekEnd:function(){
		var weekEnd=[];
		for(var i=0;i<this.days.length;i++){
			if(this.days[i].className==="active"){
				weekEnd.push(this.days[i]["value"]);
			}
		}
		return JSON.stringify(weekEnd);
	},
	nfa_addActiveList:function(list,valueKey,value){
		for(var i=0;i<list.length;i++){
			list[i].className =value.indexOf(list[i][valueKey])!=-1?"active":"";// NO I18N
		}
		return list;
	},
	nfaSetDividedSpeed:function(){
		var kilo = window.OPM.isNFAVolumeCalcWith1024?1024:1000;
		var mega = kilo*kilo;
		var giga = mega*mega;
		var speedUnitsMap = {"kilo":kilo,"mega":mega,"giga":giga,"default":1}; //NO I18N
		window.OPM.nfaDivValueForSpeed = speedUnitsMap[window.NFASpeedUnit];
	},
	filterThresholdLine:function(){
		var filteredThresholdLine = [];
		for (var i = 0; i < this.thresholdLine.length; i++) {
			if (i == 0 || i == 4) {
				filteredThresholdLine.push(this.thresholdLine[i]);
			}
		}
		return filteredThresholdLine;
	},
	actions:{
		changeUnits: function(){
			if($("input[name='dataType']:checked").val()==="true"){
				$("#speedKilo").text("Kibps"); //NO I18N
				$("#speedMega").text("Mibps"); //NO I18N
				$("#speedGiga").text("Gibps"); //NO I18N
				$("#volumeKilo").text("KiB"); //NO I18N
				$("#volumeMega").text("MiB"); //NO I18N
				$("#volumeGiga").text("GiB"); //NO I18N
			}else{
				$("#speedKilo").text("Kbps"); //NO I18N
				$("#speedMega").text("Mbps"); //NO I18N
				$("#speedGiga").text("Gbps"); //NO I18N
				$("#volumeKilo").text("KB"); //NO I18N
				$("#volumeMega").text("MB"); //NO I18N
				$("#volumeGiga").text("GB"); //NO I18N
			}
		},
		updateExcludeWeekEnd:function(weekEnd){
			var list = jQuery.extend(true, [], this.days);
			var flag=0;
			for(var i=0;i<list.length;i++){
				if(list[i]["value"]===weekEnd){
					list[i].className = (list[i].className==="")?"active":""; //NO I18N
				}
				if(list[i].className === "active"){
					flag++
				}
			}
			if(flag<=3 && flag>0){
				this.set("days",list); //NO I18N
			}else{
				opm_infoMsgs("infoMsg",flag>3 ? Ember.I18n.t("nfa.weekend.max.violation"):Ember.I18n.t("nfa.weekend.min.violation"));//NO I18N
			}
		},
		updateThresholdLineOptions:function(){
			var isDisable = ($("input[name='percentileFilter']:checked").val()==="Disable"); //NO I18N
			this.set("thresholdLineList",nfa_getActiveList(isDisable ? this.filterThresholdLine() : this.thresholdLine,"value",this.thresholdLineType));//NO I18N
			if(isDisable && ((this.thresholdLineType==="90" || this.thresholdLineType==="95"|| this.thresholdLineType==="99"))){//NO I18N
				this.set("thresholdLineType",this.thresholdLine[0].value);//NO I18N
			}
		},
		updateReportSettings:function(){
			var callBackFunction = function(response,self) {
				showMessage(response);
				if(response.error===undefined) {
					if(self.data.page==="Filter"){
						window.isNFADefaultWeekend = self.data.defaultWeekEnd;
						window.isNFADefaultBusinessHour = self.data.businessDefault;
						window.NFABussHourStartTime = self.data.bussStartTime;
						window.NFABussHourEndTime = self.data.bussEndTime;
					}else{
						if(self.data.graph==="90" || self.data.graph==="95"|| self.data.graph==="99"){
							window.OPM.nfaPercentile = self.data.graph;
						}else{
							window.OPM.nfaPercentile = "95";
						}
						window.OPM.isNFAVolumeCalcWith1024 = (self.data.divValue==="true");
						window.OPM.nfaDecimalCount = self.data.decimalCount;
						window.NFASpeedUnit = self.data.unitForSpeed;
						self.nfaSetDividedSpeed();
						window.OPM.percentileInformation = (self.data.percentileInformation==="true") ? true : false;
					}
				}
			}
			var data={};
			if(this.pageName==="Filter"){
				data.page = "Filter";//NO I18N
				data.businessDefault = ($("input[name='businessHour']:checked").val()==="Default");//NO I18N
				data.defaultWeekEnd = ($("input[name='defaultWeekEnd']:checked").val()==="Default");//NO I18N
				data.bussStartTime = this.bussStartTime;
				data.bussEndTime = this.bussEndTime;
				data.weekEnd = this.getSelectedExcludeWeekEnd();
			}
			else{
				data.page = "DataUnit";//NO I18N
				data.divValue = $("input[name='dataType']:checked").val(); //NO I18N
				data.unitForSpeed = $("input[name='speedType']:checked").val(); //NO I18N
				data.unitForVolume = $("input[name='volumeType']:checked").val(); //NO I18N
				data.decimalCount = $("input[name='decimalCount']:checked").val(); //NO I18N
				data.graph = this.thresholdLineType;
				data.percentileInformation = (($("input[name='percentileFilter']:checked").val())==="Enable") ? "true" : "false" ; //NO I18N
			}
			this.set("data",data); //NO I18N
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/reportSettings",data,callBackFunction,this,Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT"));//NO I18N
		}
	}
});
OPMClient.NfaDateAndTimeComponent = Ember.Component.extend({
	templateName:"components/nfa-date-and-time", //NO I18N
	classNames:["opmFormRow"], //NO I18N
	dateLabel:"fwa.compliance.date", //NO I18N
	dateTime:"", //NO I18N
	minDate:"", //NO I18N
	minutesStart:0,
	minutesEnd:59,
	minutesIncrement:1,
	isCompact:true,
	restrictMinDate:true,
	initDefaults:function() {
		this.set("dateLabel",Ember.I18n.t(this.dateLabel)); //NO I18N
		if(this.dateTime===undefined || this.dateTime==="") { //NO I18N
			this.set("dateValue",opm_formatDate(new Date())); //NO I18N
			this.set("hoursValue","00"); //NO I18N
			this.set("minutesValue",(("00"+this.minutesStart).slice(-2) || "00")); //NO I18N
		}else {
			this.splitDateTime();
		}
		if(this.restrictMinDate) {
			this.set("minDate",this.dateValue); //NO I18N
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		$("#"+this.elementId+" .customTimeDate").datepicker({dateFormat:"yy-mm-dd",minDate:this.minDate}); //NO I18N
	},
	splitDateTime:function() {
		var tm = this.dateTime.split(" "); //NO I18N
		if(!this.checkDateTimeFormat(tm[0])){
			tm = opm_formatDate(new Date()).split(" ");
			this.set("dateValue",tm[0]); //NO I18N
			this.set("hoursValue","00"); //NO I18N
			this.set("minutesValue","00"); //NO I18N
		}else{
			var hm = tm[1].split(":"); //NO I18N
			this.set("dateValue",tm[0]); //NO I18N
			this.set("hoursValue",hm[0]); //NO I18N
			this.set("minutesValue",hm[1]); //NO I18N
		}
	}.observes("dateTime"), //NO I18N
	setDateTime:function() {
		this.set("dateTime",this.dateValue+" "+this.hoursValue+":"+this.minutesValue); //NO I18N
	}.observes("dateValue","hoursValue","minutesValue"), //NO I18N
	checkDateTimeFormat:function(time)
	{
		return /^\d{4}-\d{2}-\d{2}$/.test(time);
	},
	willDestroyElement:function() {
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaAssociationBoxComponent = Ember.Component.extend({
	templateName:"components/nfa-association-box", //NO I18N
	classNames:["multiSelectBox4"], //NO I18N
	availableList:[],
	searchLeft:'',
	searchRight:'',
	selectedList:[],
	totalSelected:0,
	searchPlaceholder:Ember.I18n.t("opu.common.SEARCH"), //NO I18N
	leftListLabel: Ember.I18n.t("webclient.Available"), //NO I18N
	rightListLabel: Ember.I18n.t("webclient.Selected"), //NO I18N
	initDefaults:function(){
		this.set("availableList",this.sortList(this.availableList)); //NO I18N
		this.set("selectedList",this.sortList(this.selectedList)); //NO I18N
		this.set("selectedIDs",this.getSelectedIDs()); //NO I18N
		this.set("totalSelected",this.selectedList.length); //NO I18N
		this.set("searchLeft",this.elementId+"_leftSrch"); //NO I18N
		this.set("searchRight",this.elementId+"_rightSrch"); //NO I18N
	}.on("init"), //NO I18N
	keyUp:function(e){
		if($(".availSearch").is(":focus")){ //NO I18N
		    if(this.plainSearch){
		        changeNCMSelectList(this.availSearchVal,this.elementId+" .availableList"); //NO I18N
		    }else{
			    changeSelectList(this.availSearchVal,this.elementId+" .availableList"); //NO I18N
			}
		}
		if($(".selectSearch").is(":focus")){ //NO I18N
		    if(this.plainSearch){
		        changeNCMSelectList(this.selectSearchVal,this.elementId+" .selectedList"); //NO I18N
		    }else{
			    changeSelectList(this.selectSearchVal,this.elementId+" .selectedList"); //NO I18N
		    }
		}
	},
	sortList:function(list) {
		if(list===undefined){return [];}
		return list.sort(function(a,b) {
			var nameA = a.name.toLowerCase();
			var nameB = b.name.toLowerCase();
			if (nameA < nameA) {return -1;}
			if (nameA > nameB) {return 1;}
			return 0;
		});
	},
	getSelectedIDs:function(){
		var selectedIDs=[];
		for(var i=0;i<this.selectedList.length;i++){
			selectedIDs.push(this.selectedList[i].ID);
		}
		return selectedIDs;
	},
	moveLists:function(fromListName,toListName) {
		var sValues = ($("#"+this.elementId+" ."+fromListName).val() || []); //NO I18N
		var fromList = jQuery.extend(true,[],this.get(fromListName));
		var toList = jQuery.extend(true,[],this.get(toListName));
		var newFromList = [];
		var newToList = [];
		var counter=0;

		for(var i=0;(i<fromList.length && counter<sValues.length);i++) {
			if(sValues.contains(String(fromList[i].ID))) {
				newToList.push(fromList[i]);
				fromList.splice(0,i+1);
				counter++;
				i=-1;
			}else {
				newFromList.push(fromList[i]);
			}
		}
		newToList = newToList.concat(toList);
		newFromList = newFromList.concat(fromList);
		this.set(fromListName,newFromList);
		this.set(toListName,newToList);
		this.set("totalSelected",this.selectedList.length); //NO I18N
		this.set("selectedIDs",this.getSelectedIDs()) //NO I18N

		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			changeSelectList(this.availSearchVal,this.elementId+" .availableList"); //NO I18N
			changeSelectList(this.selectSearchVal,this.elementId+" .selectedList"); //NO I18N
		});
	},
	actions:{
		moveRight:function() {
			this.moveLists("availableList","selectedList"); //NO I18N
		},
		moveLeft:function() {
			this.moveLists("selectedList","availableList"); //NO I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaAggregatedAlertComponent = Ember.Component.extend({
	templateName:"components/nfa-aggregated-alert", //NO I18N
	nfa_getModel:function(){
		nfa_getAggregatedAlertModel(this);
		if(this.task=="Add") { //NO I18N
			nfa_getSourceList(this,this.selectedSource);
			this.addAlertCriteria();
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
	},
	addAlertCriteria:function() {
		var criteriaList = jQuery.extend(true,[],this.get("criteriaList")); //NO I18N
		if(criteriaList.length > 0) {
			criteriaList[criteriaList.length-1].showAddButton = false;
			criteriaList[criteriaList.length-1].showAddButtonOnly = false;
		}
		criteriaList.push({
			index:criteriaList.length,
			flowType:40,
			trafficType:32,
			conditionVal:70,
			criteriaValue:"", //NO I18N
			unitVal:90
		});
		criteriaList[criteriaList.length-1].showAddButton = true;
		criteriaList[criteriaList.length-1].showAddButtonOnly = (criteriaList.length===1);
		this.set("criteriaList",criteriaList); //NO I18N
	}.observes("trafficType"), //NO I18N
	validateCriteria:function(criteria) {
		var fields;
		if(criteria.trafficType===32) {
			fields = {unSignedFloat:["criteria"+criteria.index+" .criValue"]}; //NO I18N
		}else {
			fields = {positive:["criteria"+criteria.index+" .criValue"]}; //NO I18N
		}
		return opm_validateFields(fields);
	},
	timeZoneChanged:function() {
		var callBckFunc = function(jsonData,self){
			var minutes = (jsonData.MINUTE>50)?60:((Math.floor(jsonData.MINUTE/10)+1)*10);
			self.set("alertStartTime",nfa_getFormattedTime(jsonData.YEAR,jsonData.MONTH,jsonData.DAY_OF_MONTH,jsonData.HOUR_OF_DAY,minutes)); //NO I18N
			self.set("alertEndTime",nfa_getFormattedTime(jsonData.YEAR,jsonData.MONTH,jsonData.DAY_OF_MONTH,jsonData.HOUR_OF_DAY,(minutes+10))); //NO I18N
		}
		nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/getCurrentTime",{isSch:true,schTZone:this.timeZone},callBckFunc,this); //NO I18N
	}.observes("timeZone"), //NO I18N
	validateProfile:function() {
		var self=this;
		var fields={empty:["profileName"],nfaNameCheck:["profileName"]}; //NO I18N
		if(!opm_validateFields(fields)) {
			return false;
		}
		nfa_getAggregatedAlertSources(this);

		if(self.selectedInterfaceIDs!==undefined && self.selectedInterfaceIDs.length>0) {
			self.deviceDetails.Interface=self.selectedInterfaceIDs;
		}
		if(self.selectedIPGroupIDs!==undefined && self.selectedIPGroupIDs.length>0) {
			self.deviceDetails.IPGroup=self.selectedIPGroupIDs;
		}
		if(self.selectedInterfaceGroupIDs!==undefined && self.selectedInterfaceGroupIDs.length>0) {
			self.deviceDetails.InterfaceGroup=self.selectedInterfaceGroupIDs;
		}
		if(self.selectedAccessPointIDS!==undefined && self.selectedAccessPointIDS.length>0) {
			self.deviceDetails.AccessPoint=self.selectedAccessPointIDS;
		}
		if(self.selectedAPGroupIDs!==undefined && self.selectedAPGroupIDs.length>0) {
			self.deviceDetails.AccessPointGroup=self.selectedAPGroupIDs;
		}
		if(self.selectedSSIDGroupIDs!==undefined && self.selectedSSIDGroupIDs.length>0) {
			self.deviceDetails.SSIDGroup=self.selectedSSIDGroupIDs;
		}
		if($.isEmptyObject(self.deviceDetails)) {
			opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.fwa.impact.analysis.select.source")); //NO I18N
			return false;
		}

		fields = {dateCheck:["startTime .customTimeDate"]}; //NO I18N
		if(self.alertFrequency==="custom") { //NO I18N
			fields.dateCheck.push("endTime .customTimeDate"); //NO I18N
		}
		if(!opm_validateFields(fields)) {
			return false;
		}

		var isValid = false;
		for(var i=0;i<this.criteriaList.length;i++) {
			isValid = this.validateCriteria(this.criteriaList[i]);
			if(!isValid){break;}
		}
		return isValid;
	},
	updateAlertFrequencyList:function() {
		this.set("alertFrequencyList",nfa_getActiveList(jQuery.extend(true,[],this.alertFrequencyList),"value",this.alertFrequency)); //NO I18N
	}.observes("alertFrequency"), //NO I18N
	actions:{
		childActions:function(functionName,param1) {
			this.send(functionName,param1);
		},
		sourceTypeChanged:function(source) {
			nfa_getAggregatedAlertSources(this);
			this.set("selectedSource",source); //NO I18N
			this.set("sourceList",nfa_getActiveList(jQuery.extend(true,[],this.sourceList),"value",this.selectedSource)); //NO I18N
			nfa_getSourceList(this,this.selectedSource);
		},
		alertFrequencyChanged:function(frequency) {
			this.set("alertFrequency",frequency); //NO I18N
		},
		addCriteria:function() {
			if(this.validateCriteria(this.criteriaList[this.criteriaList.length-1])) {
				this.addAlertCriteria();
			}
		},
		deleteCriteria:function(index) {
			var criteriaList = jQuery.extend(true,[],this.get("criteriaList")); //NO I18N
			if(criteriaList.length>1) {
				criteriaList.removeAt(index);
				for(var i=index;i<criteriaList.length;i++) {
					criteriaList[i].index = i;
				}
			}
			criteriaList[criteriaList.length-1].showAddButton = true;
			criteriaList[criteriaList.length-1].showAddButtonOnly = (criteriaList.length===1);
			this.set("criteriaList",criteriaList); //NO I18N
		},
		critConditionChanged:function(value) {
			this.set("criteriaCondition",value); //NO I18N
		},
		saveAlertProfile:function() {
			if(this.validateProfile()) {
				nfa_SaveAggregatedAlertProfile(this);
			}
		},
		addNTemplate:function() {
			nt_redirectToNotificationTemplateTypes();
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaAggregatedAlertCriteriaComponent = Ember.Component.extend({
	templateName:"components/nfa-aggregated-alert-criteria", //NO I18N
	classNames:["opmFormRow"], //NO I18N
	flowTypeList:[
		{name:Ember.I18n.t("NFAWidget.IN"),							value:40}, //NO I18N
		{name:Ember.I18n.t("NFAWidget.OUT"),						value:41}, //NO I18N
		{name:Ember.I18n.t("webclient.rackbuilder.maps.combined"),	value:42} //NO I18N
	],
	trafficTypeList:[
		{name:Ember.I18n.t("webclient.reports.volume"),value:32},{name:Ember.I18n.t("opu.views.PACKETS"),value:33} //NO I18N
	],
	conditionList:[
		{name:">",value:70},{name:"<",value:71} //NO I18N
	],
	unitList:[
		{name:"Bytes",value:90},{name:"KB",value:91},{name:"MB",value:92},{name:"GB",value:93},{name:"TB",value:94} //NO I18N
	],
	unitList1:[
		{name:Ember.I18n.t("opu.views.PACKETS"),value:95} //NO I18N
	],
	keyPress:function(e){
		if($(".unitValue").is(":focus")){return opm_isNumber(e);} //NO I18N
		if($(".floatValCheck").is(":focus")){ return opm_isFloatNumber(e);} //NO I18N
	},
	didInsertElement:function(){
	},
	trafficTypeChanged:function() {
		if(this.criteria.trafficType===33) { //Checking volume or packets
			this.set("criteria.unitVal",95); //NO I18N
		}else if(this.criteria.unitVal===95) {
			this.set("criteria.unitVal",90); //NO I18N
		}
	}.observes("criteria.trafficType"), //NO I18N
	actions: {
		subChildActions:function(functionName,param1) {
			this.sendAction("action",functionName,param1); //NO I18N
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaAlertProfilesComponent = Ember.Component.extend({
	templateName:"components/nfa-alert-profiles", //NO I18N
	alertProfileType:"RealTime", //NO I18N
	showNBAConfigMsg:false,
	showNDRConfigMsg:false,
	initDefaults:function() {
		var alertTypeList = [];
		if(window.OPM.userPermissions.alarmsRead) {
			alertTypeList.push({name:Ember.I18n.t("nfa.alert.realtime"),			value:"RealTime"}); //NO I18N
			alertTypeList.push({name:Ember.I18n.t("nfa.alert.aggregated"),			value:"Aggregated"}); //NO I18N
			if(!window.isNFAStandardEdition) {
				alertTypeList.push({name:Ember.I18n.t("nfa.trafficPatternAlert.title"),	value:"TrafficPattern"}); //NO I18N
			}
		}
		if(window.OPM.userPermissions.attacksRead && !window.isNFAStandardEdition) {
			if (window.isNBAAddOn) {
				alertTypeList.push({name:Ember.I18n.t("dashboard.name.firewallsecurity"), value:"Security"}); //NO I18N
			}
			if (window.isNDRAddon) {
				alertTypeList.push({name:Ember.I18n.t("dashboard.name.firewallsecurity"), value:"NDR"}); //NO I18N
			}
		}
		this.set("alertTypeList",alertTypeList); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
		this.listProfiles();
	},
	listProfiles:function() {
		this.set("alertTypeList",nfa_getActiveList(jQuery.extend(true,[],this.get("alertTypeList")),"value",this.alertProfileType)); //NO I18N
		if(!this.showNBAConfigMsg && !this.showNDRConfigMsg) {
			OPMClient.Settings.NFAListAlertProfiles(this.alertProfileType);
		}
		if(this.alertProfileType==="RealTime") { //NO I18N
			this.set("alertDescription",Ember.I18n.t("webclient.nfa.alertProfiles.helpMessage")); //NO I18N
			this.set("helpPageName","NFAAlertProfile"); //NO I18N
		}else if(this.alertProfileType==="Aggregated") { //NO I18N
			this.set("alertDescription",Ember.I18n.t("nfa.aggregatedAlert.description")); //NO I18N
			this.set("helpPageName","NFAAggregateAlertProfile"); //NO I18N
		}else if(this.alertProfileType==="TrafficPattern") { //NO I18N
			this.set("alertDescription",Ember.I18n.t("nfa.trafficPatternAlert.description")); //NO I18N
			this.set("helpPageName","NFATrafficPatternAlertProfile"); //NO I18N
		}else if(this.alertProfileType==="Security") { //NO I18N
			this.set("alertDescription",Ember.I18n.t("nfa.security.alert.description")); //NO I18N
			this.set("helpPageName","NFAAttacks"); //NO I18N
		}else if(this.alertProfileType==="NDR") { //NO I18N
			this.set("alertDescription",Ember.I18n.t("nfa.ndr.alert.description")); //NO I18N
			this.set("helpPageName","NFANDRAlertProfile"); //NO I18N
		}
	},
	actions:{
		getSuppressedAlarmSources:function() {
			var callBackFunction = function(response) {
				if(response.error===undefined) {
					slideIn(6);
					Ember.run.schedule("afterRender", this, function() { //NO I18N
						var typeSearchOpts = {multiseparator:';',"dataInit":function(e){$(e).addClass("select2 border").select2();}, "multiple":false, "value":":"+Ember.I18n.t("opu.common.ALL")+";Interface:"+Ember.I18n.t("widget.typename.nfainterface")+";IPGroup:"+Ember.I18n.t("snapname.nfaipgrp")+";InterfaceGroup:"+Ember.I18n.t("snapname.nfaintfgrp")+";AccessPoint:"+Ember.I18n.t("webclient.nfa.accessPoint")+";SSIDGroup:"+Ember.I18n.t("webclient.nfa.ssidGrp"), defaultValue:""}; //NO I18N
						var colNamesList = [Ember.I18n.t("jsp.commonstr.Name"),Ember.I18n.t("opu.views.TYPE"),Ember.I18n.t("webclient.devices.details.starttime"),Ember.I18n.t("webclient.devices.details.endtime"),Ember.I18n.t("webclient.fault.addnotes.user"),"","","",""]; //NO I18N
						var colModelList = [
							{name:"DeviceName",		index:"DeviceName",		width:35, sorttype:"string",formatter:jqGridHTMLEncode}, //NO I18N
							{name:"Type",			index:"DeviceType",		width:15, sorttype:"string",stype:"select", searchoptions:typeSearchOpts, formatter:function(val,opts,rObj){return rObj.DeviceTypeName;}}, //NO I18N
							{name:"StartTime",		index:"StartTime",		width:15, sorttype:"date",	datefmt:"Y-m-d H:i"}, //NO I18N
							{name:"EndTime",		index:"EndTime",		width:15, sorttype:"date",	datefmt:"Y-m-d H:i"}, //NO I18N
							{name:"UserName",		index:"UserName",		width:20, sorttype:"string"}, //NO I18N
							{name:"DeviceType",		index:"DeviceType",		width:0,  sortable:false,	search:false, hidden:true}, //NO I18N
							{name:"DeviceTypeName",	index:"DeviceTypeName",	width:0,  sortable:false,	search:false, hidden:true}, //NO I18N
							{name:"DeviceID",		index:"DeviceID",		width:0,  sortable:false,	search:false, hidden:true}, //NO I18N
							{name:"id",				index:"id",				width:0,  sortable:false,	search:false, hidden:true} //NO I18N
						];
						$("#nfaAlarmSuppressionList").jqGrid("GridUnload"); //NO I18N
						var defaultOptions = {minRowsPerPage:25,multiselect:true,searchOption:true,toggleSearch:true,grouping:false,groupingView:{groupField:["DeviceTypeName"],groupColumnShow:[false],"plusicon":"ui-icon ui-icon-triangle-1-e","minusicon":"ui-icon ui-icon-triangle-1-s"}}; //NO I18N
						nfa_loadJQgridWithData("#nfaAlarmSuppressionList",response,colNamesList,colModelList,"","nfaAlarmSuppressionListPager","",defaultOptions); //NO I18N
						$("#nfaAlarmSuppressionList").jqGrid("setGridWidth", $("#nfaAlarmSuppressionList").closest(".opmFormHolder").width()-42); //NO I18N
						$("#v2HtmlHolder").addClass("slideInTopFix"); //NO I18N
					});
				}else {
					showMessage(response);
				}
			}
			nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaalert/listAlertSuppressedNFADevice", "", callBackFunction); //NO I18N
		},
		deleteSuppressedAlarmSources:function() {
			var selectedRows = $("#nfaAlarmSuppressionList").jqGrid("getGridParam", "selarrrow"); //NO I18N
			var length = selectedRows.length;
			if(length===0) {
				opm_infoMsgs("infoMsg", Ember.I18n.t("opuclient.SELECT_ONE_ROW_DELETE")); //NO I18N
				return;
			}
			var self = this;
			var okCallBack = function() {
				var deviceDetails = {};
				for (var i=length-1; i>=0; i--) {
					var rowData = $("#nfaAlarmSuppressionList").jqGrid("getRowData", selectedRows[i]); //NO I18N
					if(deviceDetails[rowData.DeviceType]===undefined) {
						deviceDetails[rowData.DeviceType] = [];
					}
					(deviceDetails[rowData.DeviceType]).push(rowData.DeviceID);
				}
				var formData = {TimePeriod:"0",DeviceDetails:JSON.stringify(deviceDetails)}; //NO I18N
				var callBackFunction = function(response,self) {
					if(response.error!==undefined) {
						opm_infoMsgs("errorMsg",response.error.message); //NO I18N
					}else {
						opm_infoMsgs("successMsg",response.message); //NO I18N
						self.send("getSuppressedAlarmSources"); //NO I18N
					}
				};
				nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaalert/suppressAlertForNFADevice",formData,callBackFunction,self); //NO I18N
			};
			$("body").addClass("ui-dialog-hide-close"); //NO I18N
			opmConfirm("",Ember.I18n.t("nfa.operation.confirmMsg"),"",okCallBack,"","","","","dialogStyle2"); //NO I18N
		},
		closeSlide:function() {
			slideOut(6);
		},
		alertProfileAdd:function() {
			opmGlobalRoute.transitionTo("Settings.NetflowConfig."+this.alertProfileType+"Alert.Action",{task:"Add",alertID:"New"}); //NO I18N
		},
		alertTypeChanged:function(type,className) {
			if(className!=="active") { //NO I18N
				this.set("alertProfileType",type); //NO I18N
				opmGlobalRoute.transitionTo("Settings.NetflowConfig.AlertProfiles."+type); //NO I18N
			}
		},
		nbaFlowConfig:function(task) {
			var callBackFunction = function(response, self) {
				if(response.error===undefined) {
					opm_infoMsgs("successMsg", Ember.I18n.t("UpdatedSuccessFully")); //NO I18N
					OPMClient.SettingsNFAConfigController.set("isNBAFlowEnabled", true); //NO I18N
					self.set("showNBAConfigMsg", false); //NO I18N
					self.listProfiles();
				}else {
					showMessage(response);
				}
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nbaConfig/updateNBASetting", {"task":task}, callBackFunction, this); //NO I18N
		},
		configureNDR: function() {
			opmGlobalRoute.transitionTo("Settings.SecurityAnalytics.Basic"); //NO I18N
		}
	},
	willDestroyElement:function() {
		slideOut(6);
		$("#v2HtmlHolder").removeClass("slideInTopFix"); //NO I18N
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaGeolocationReportComponent = Ember.Component.extend({
	templateName: "components/nfa-geolocation-report", //NO I18N
	flowType: "IN", //NO I18N
	geoType: "source", //NO I18N
	isGeoInfoPopulated: true,
	initDefaults: function(){
		this.set("showInputForm", true); //NO I18N
		this.set("showEditReport", false); //NO I18N
		this.set("pageTitle", Ember.I18n.t("nfa.geoLocation.report")); //NO I18N
		this.set("sourceList", [ //NO I18N
			{name: Ember.I18n.t("webclient.Select.source"),			value: "-1",isSelected: true,	isHide: false}, //NO I18N
			{name: Ember.I18n.t("widget.typename.nfainterface"),	value: "1",	isSelected: false,	isHide: false}, //NO I18N
			{name: Ember.I18n.t("alertProfile.ipGroup"),			value: "3",	isSelected: false,	isHide: window.isNFAStandardEdition}, //NO I18N
			{name: Ember.I18n.t("alertProfile.interfaceGroup"),		value: "2",	isSelected: false,	isHide: window.isNFAStandardEdition} //NO I18N
		]);
		this.set("selectedSource", "-1"); //NO I18N
		this.set("flowTypeList", [ //NO I18N
			{name: Ember.I18n.t("NFAWidget.IN"),	value: "IN",	checked: "checked"}, //NO I18N
			{name: Ember.I18n.t("NFAWidget.OUT"),	value: "OUT",	checked: ""} //NO I18N
		]);
		this.set("geoTypeList", [ //NO I18N
			{name: Ember.I18n.t("NFAWidget.Src"),	value: "source",		checked: "checked",	className: "active"}, //NO I18N
			{name: Ember.I18n.t("NFAWidget.Dst"),	value: "destination",	checked: "",		className: ""} //NO I18N
		]);
		this.set("recordsList", ["500", "1000", "2000", "3000", "4000", "5000"]); //NO I18N
		this.set("timeFrameList", [ //NO I18N
			{name: Ember.I18n.t("nfa.timeframe.lasthour"),					value: "hourly"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.last6hours"),	value: "6Hour"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.last24hrs"),	value: "daily"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.today"),		value: "today"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.yesterday"),	value: "yesterday"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.last7days"),	value: "Weekly"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.last30days"),	value: "Monthly"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.last90days"),	value: "Quarterly"}, //NO I18N
			{name: Ember.I18n.t("webclient.reports.timeframe.custom"),		value: "custom"} //NO I18N
		]);
		this.set("showExWeekEnd", false); //NO I18N
		this.set("isBussAlert",window.isNFADefaultBusinessHour); //NO I18N
		this.set("isExWeekend",window.isNFADefaultWeekend); //NO I18N
		this.set("bussStartTime",window.NFABussHourStartTime); //NO I18N
		this.set("bussEndTime",window.NFABussHourEndTime); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement: function(){
		var self = this;
		var callBackFunction = function(response){
			if(response.isPopulated !== undefined){
				self.set("isGeoInfoPopulated", response.isPopulated); //NO I18N
			}
		};
		nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/isGeoLocationUptoDate", {}, callBackFunction, {}); //NO I18N
	},
	flowTypeChanged: function(){
		this.set("flowTypeList", nfa_getCheckedList(jQuery.extend(true, [], this.flowTypeList), "value", this.flowType)); //NO I18N
	}.observes("flowType"), //NO I18N
	geoTypeChanged: function(){
		var geoList = jQuery.extend(true, [], this.geoTypeList);
		for(var i=0; i<geoList.length; i++){
			geoList[i].className = (geoList[i].value === this.geoType) ? "active" : ""; //NO I18N
			geoList[i].checked = (geoList[i].value === this.geoType) ? "checked" : ""; //NO I18N
		}
		this.set("geoTypeList", geoList); //NO I18N
	}.observes("geoType"), //NO I18N
	timePeriodChanged: function(){
		this.set("showExWeekEnd", (["Weekly", "Monthly", "Quarterly", "custom"].contains(this.selectedTimeFrame))); //NO I18N
		// this.set("isExWeekend", (this.showExWeekEnd) ? this.isExWeekend : false); //NO I18N
		if(!this.showInputForm) {
			this.send("generateReport"); //NO I18N
		}
	}.observes("selectedTimeFrame"), //NO I18N
	getPDFInputs: function(){
		var headerDetails = jQuery.extend(true, {}, this.formData);
		headerDetails.timeFrameString = this.timeFrameString;
		headerDetails.reportSubTitle = this.selectedSourceName;
		return headerDetails;
	},
	actions: {
		redirectToSettings: function(){
			opmGlobalRoute.transitionTo("Settings.NetflowConfig.Basic.Geolocation"); //NO I18N
		},
		childActions: function(functionName, param1, param2){
			this.send(functionName, param1, param2);
		},
		updateValues:function(key, value){
			this.set(key, value);
		},
		flowTypeChanged: function(type){
			this.set("flowType", type); //NO I18N
		},
		geoTypeChanged: function(type){
			this.set("geoType", type); //NO I18N
		},
		generateReport: function(){
			$(".OpMAlertMsg").remove(); //NO I18N
			if(this.selectedSource === "-1"){ //NO I18N
				opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.Select.anyone.source")); //NO I18N
				return;
			}
			var formData = {};
			if(this.showInputForm || this.showEditReport){
				formData.DeviceID = (this.isAllDeviceSelected) ? JSON.stringify(["-1"]) : JSON.stringify(nfa_getSelectedSourceValues(this).split(",")); //NO I18N
			}else if(this.formData.DeviceID){
				formData.DeviceID = this.formData.DeviceID;
			}
			if(formData.DeviceID === undefined || formData.DeviceID === '[""]'){ //NO I18N
				nfa_showNoDeviceAlert(this.selectedSource);
				return;
			}
			formData.Data = this.flowType;
			formData.GeoBasedOn = this.geoType;
			formData.TimeFrame = this.selectedTimeFrame;
			if(this.selectedTimeFrame == "custom"){ //NO I18N
				if(!nfa_validateCustomTime(this.startTime,this.endTime)){
					return;
				}
				formData.StartTime = this.startTime;
				formData.EndTime = this.endTime;
			}
			formData.rows = this.selectedRecord;
			formData.pageCount = 1;
			if(this.isBussAlert){
				formData.filterStTime = this.bussStartTime;
				formData.filterEdTime = this.bussEndTime;
			}
			if(this.showExWeekEnd){
				formData.isExWeekend = this.isExWeekend;
			}
			formData.BussView = (this.selectedSource === "2"); //NO I18N
			formData.IPGroup = (this.selectedSource === "3"); //NO I18N

			this.set("apiURL", window.OPM.apiUrlPattern+"/nfareports/getGeoReportData"); //NO I18N
			this.set("formData", formData); //NO I18N

			var callBackFunction = function(response, self){
				showMessage(response);
				if(response.error === undefined){
					self.set("apiData", response); //NO I18N
					self.set("showInputForm", false); //NO I18N
					if(self.showEditReport){
						slideOut(5);
						self.set("showEditReport", false); //NO I18N
					}
				}
			};
			nfa_getAjaxResponseWithAsync(this.apiURL, this.formData, callBackFunction, this, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
		},
		exportToMail: function(){
			OPMClient.NFAReportsPDFCurrentApiurl = this.apiURL;
			OPMClient.NFAReportsController.formData = this.getPDFInputs();
			OPMClient.NFAReportsController.set("formData.reportTitle", this.pageTitle); //NO I18N
			loadMailDataInOneClickForm("nfa.geoLocation.report"); //NO I18N
		},
		exportToPDF: function(){
			var headerDetails = this.getPDFInputs();
			var formElements = [];
			for(var key in headerDetails){
				formElements.push({name: key, value: headerDetails[key]});
			}
			nfa_exportPDFReport(this.apiURL, "GeolocationReport", this.pageTitle, formElements); //NO I18N
		},
		exportToCSV: function(){
			var headerData = '"'+Ember.I18n.t("webclient.reports.ReportName")+': '+this.pageTitle+' - '+this.selectedSourceName+'"\r\n'; //NO I18N
			headerData += '"'+Ember.I18n.t("webclient.nfa.widget.flowtype")+' : '+$("input[name='flowtype']:checked").next().text()+'"\r\n'; //NO I18N
			headerData += '"'+Ember.I18n.t("nfa.geoLocation.basedOn")+' : '+$("#graphTypeList li.active").text()+'"\r\n'; //NO I18N
			headerData += '"'+Ember.I18n.t("timeperiod")+' : '+this.timeFrameString+'"\r\n'; //NO I18N
			headerData += '"'+Ember.I18n.t("webclient.devices.details.starttime")+' : '+this.apiData.startTime+'"\r\n'; //NO I18N
			headerData += '"'+Ember.I18n.t("webclient.devices.details.endtime")+' : '+this.apiData.endTime+'"\r\n'; //NO I18N
			if(this.isBussAlert) {
				var businesshour = this.bussStartTime+".00 - "+this.bussEndTime+".00"; //NO I18N
				headerData += '"'+Ember.I18n.t("webclient.inventory.businesshour")+' : '+businesshour+'"\r\n'; //NO I18N
			}
			if(this.formData.isExWeekend) {
				headerData += '"'+Ember.I18n.t("webclient.Exclude.weekends")+' : '+Ember.I18n.t("jsp.commonstr.Enabled")+'"\r\n'; //NO I18N
			}
			headerData += '"'+Ember.I18n.t("webclient.reports.timezone")+' : '+window.OPM.userTimeZone+'"\r\n'; //NO I18N
			headerData += '"'+Ember.I18n.t("jsp.commonstr.GeneratedOn")+' : '+$("#opm_currentTime").text()+'"\r\n'; //NO I18N
			nfa_inventoryGeoLocationExportCSV(this.apiData.loc, headerData, nfa_getFileNameForCSV(this.pageTitle), true);
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaGeolocationReportPageComponent = Ember.Component.extend({
	templateName: "components/nfa-geolocation-report-page", //NO I18N
	initDefaults: function(){
		var name;
		switch(this.selectedSource){
			case "1"	: 	name = Ember.I18n.t("interfaces"); break; //NO I18N
			case "2"	: 	name = Ember.I18n.t("webclient.settings.intf.grp.list"); break; //NO I18N
			case "3"	: 	name = Ember.I18n.t("webclient.settings.ip.grps.list"); break; //NO I18N
		}
		this.set("selectedSourceName", name); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement: function(){
		this.loadReportData();
	},
	loadReportData: function(){
		var apiData = this.apiData;
		var columnDetails = nfa_getColumnNameModelDetails("geolocation"); //NO I18N
		var subGridColumnDetails = nfa_getColumnNameModelDetails("geolocationSubGrid"); //NO I18N
		var gridDetails = {
			colNamesList: columnDetails.colNamesList,
			colModelList: columnDetails.colModelList
		};
		gridDetails.data = apiData.loc;
		gridDetails.defaultOptions = {
			subGrid: true,
			subGridFunction: "nfaGeolocationReportSub", //NO I18N
			Data: apiData.loc.location,
			colNamesList1: subGridColumnDetails.colNamesList,
			colModelList1: subGridColumnDetails.colModelList,
			gridCallBack: function(){
				$("#reportTableList").jqGrid("expandSubGridRow", "1"); //NO I18N
			}
		};
		$("#reportTableList").jqGrid("GridUnload"); //NO I18N
		opm_loadJQgridWithData("#reportTableList", gridDetails.data.result, gridDetails.colNamesList, gridDetails.colModelList, "", "#reportTablePager", "", gridDetails.defaultOptions); //NO I18N
		$("#reportTableList").jqGrid("setGridWidth", $("#reportTableList").closest(".opmFormHolder").width()-30); //NO I18N
		$("#reportTableList").addClass("ut ut-Grid"); //NO I18N
	}.observes("apiData"), //NO I18N
	actions: {
		subChildActions: function(functionName, param1){
			this.sendAction("action", functionName, param1); //NO I18N
			this.sendAction("action", "generateReport"); //NO I18N
		},
		exportActions: function(functionName){
			this.sendAction("action", "updateValues", "selectedSourceName", this.selectedSourceName); //NO I18N
			this.sendAction("action", functionName); //NO I18N
		},
		updateReport:function() {
			this.sendAction("action", "updateValues", "isAllDeviceSelected", this.isAllDeviceSelected1); //NO I18N
			this.sendAction("action", "updateValues", "lists", this.lists1); //NO I18N
			this.sendAction("action", "updateValues", "selectedRecord", this.selectedRecord1); //NO I18N
			this.sendAction("action", "updateValues", "isBussAlert", this.isBussAlert1); //NO I18N
			this.sendAction("action", "updateValues", "bussStartTime", this.bussStartTime1); //NO I18N
			this.sendAction("action", "updateValues", "bussEndTime", this.bussEndTime1); //NO I18N
			this.sendAction("action", "updateValues", "isExWeekend", this.isExWeekend1); //NO I18N
			this.sendAction("action", "generateReport"); //NO I18N
		},
		closeReport: function(){
			this.set("showInputForm", true); //NO I18N
		},
		customTimeChanged:function(){
			if(nfa_validateCustomTime(this.startTime,this.endTime)){
				(this.timeFrame === "custom") ? this.sendAction("action", "generateReport") : this.set("timeFrame", "custom"); //NO I18N
				slideOut(6);
			}
		},
		closeCustomTime: function() {
			slideOut(6);
		},
		openEditReport: function() {
			this.set("isAllDeviceSelected1", (this.isAllDeviceSelected ? true : false)); //NO I18N
			this.set("lists1", jQuery.extend(true, {}, this.lists)); //NO I18N
			this.set("selectedRecord1", (this.selectedRecord ? this.selectedRecord : "500")); //NO I18N
			this.set("isBussAlert1", (this.isBussAlert ? true : false)); //NO I18N
			this.set("bussStartTime1", (this.bussStartTime ? this.bussStartTime : "0")); //NO I18N
			this.set("bussEndTime1", (this.bussEndTime ? this.bussEndTime : "0")); //NO I18N
			this.set("isExWeekend1", (this.isExWeekend ? true : false)); //NO I18N
			slideIn(5);
			this.set("showEditReport", true); //NO I18N
		},
		closeEditReport: function() {
			slideOut(5);
			this.set("showEditReport", false); //NO I18N
		},
		openOneClickSchedule: function(){
			slideIn(5);
			var inputData = {
				task: "Add", //NO I18N
				goBackRoute: "5", //NO I18N
				selectedSource: this.selectedSource,
				oneClickDeviceID: this.formData.DeviceID,
				selectedReportType: "geo", //NO I18N
				oneClickGeoBasedOn: (this.formData.GeoBasedOn === "destination" ? "DESTINATION" : "SOURCE"), //NO I18N
				oneClickGeoFlowType: this.formData.Data //NO I18N
			};
			this.set("scheduleInputData", inputData); //NO I18N
			this.set("showScheduleForm", true); //NO I18N
		},
		closeOneClickSchedule: function(){
			slideOut(5);
			this.set("showScheduleForm", false); //NO I18N
		}
	}
});

OPMClient.NfaForecastAppReportComponent = Ember.Component.extend({
	templateName: "components/nfa-forecast-app-report", //NO I18N
	pageTitle : Ember.I18n.t("nfa.forecastreport.app"), //NO I18N
	showInputForm: true,
	showEditReport: false,
	appTypesList: [
		{name: Ember.I18n.t("NFADB.L4Apps"),	value: "l4",	checked: "checked"}, //NO I18N
		{name: Ember.I18n.t("NFADB.L7Apps"),	value: "l7",	checked: ""} //NO I18N
	],
	appType: "l4", //NO I18N
	sourceList: [
		{name: Ember.I18n.t("webclient.Select.source"),			value: "-1"}, //NO I18N
		{name: Ember.I18n.t("widget.typename.nfainterface"),	value: "1"}, //NO I18N
		{name: Ember.I18n.t("alertProfile.ipGroup"),			value: "3"}, //NO I18N
		{name: Ember.I18n.t("alertProfile.interfaceGroup"),		value: "2"} //NO I18N
	],
	selectedSource: "-1", //NO I18N
	showSourceList : false,
	isAllDeviceSelected: true,
	showRouterList : false,
	appSelectionTypesList: [
		{name: Ember.I18n.t("nfa.top5.app"),		value: "top",		checked: "checked"}, //NO I18N
		{name: Ember.I18n.t("nfa.single.app"),		value: "single",	checked: ""}, //NO I18N
		{name: Ember.I18n.t("nfa.custom.app"),		value: "custom",	checked: ""} //NO I18N
	],
	appSelectionType: "top", //NO I18N
	appList: [],
	showSingleAppSelection: false,
	showCustomAppSelection: false,
	showFlowTypeSelection: true,
	flowTypeList: [
		{name: Ember.I18n.t("NFAWidget.IN"),	value: "IN",	checked: "checked",	className: "active"}, //NO I18N
		{name: Ember.I18n.t("NFAWidget.OUT"),	value: "OUT",	checked: "",		className: ""} //NO I18N
	],
	flowType: "IN", //NO I18N
	timeFrameList:[
		{name: Ember.I18n.t("webclient.7.Days"),	value:"7"}, //NO I18N
		{name: Ember.I18n.t("webclient.15.Days"),	value:"15"}, //NO I18N
		{name: Ember.I18n.t("webclient.1.Month"),	value:"30"}, //NO I18N
		{name: Ember.I18n.t("webclient.3.Months"),	value:"90"}, //NO I18N
		{name: Ember.I18n.t("webclient.6.Months"),	value:"180"}, //NO I18N
		{name: Ember.I18n.t("webclient.1.Year"),	value:"365"} //NO I18N
	],
	timeFrame : "7", //NO I18N
	hideBussAlert: false,
	hideExWeekend: false,
	showHistory: false,
	initDefaults: function(){
		this.set("isBussAlert",window.isNFADefaultBusinessHour);//NO I18N
		this.set("bussStartTime",window.NFABussHourStartTime);//NO I18N
		this.set("bussEndTime",window.NFABussHourEndTime);//NO I18N
		this.set("isExWeekend",window.isNFADefaultWeekend);//NO I18N
		this.set("list", {}); //NO I18N
	}.on("init"), //NO I18N
	appTypeObserver: function(){
		this.set("appTypesList", nfa_getCheckedList($.extend(true, [], this.appTypesList), "value", this.appType)); //NO I18N
		var sList = $.extend(true, [], this.sourceList);
		(this.appType === "l7") ? sList.splice(2, 1) : sList.splice(2, 0, {name: Ember.I18n.t("alertProfile.ipGroup"), value: "3"}); //NO I18N
		this.set("sourceList", sList); //NO I18N
		this.set("selectedSourceID", ""); //NO I18N
		this.set("appSelectionType", "top"); //NO I18N
	}.observes("appType"), //NO I18N
	sourceListChanged: function(){
		this.set("selectedSource", "-1"); //NO I18N
	}.observes("sourceList"), //NO I18N
	sourceTypeChanged:function() {
		this.set("showSourceList", (this.selectedSource !== "-1")); //NO I18N
		this.set("showRouterList", (this.selectedSource === "1" && !this.isAllDeviceSelected)); //NO I18N
		if(this.selectedSource !== "-1"){ //NO I18N
			var text;
			switch(this.selectedSource){
				case "1"	: text = "nfa.all.interfaces"; break; //NO I18N
				case "2"	: text = "nfa.all.intfGroups"; break; //NO I18N
				case "3"	: text = "nfa.all.ipGroups"; break; //NO I18N
			}
			this.set("selectAllDivText", Ember.I18n.t(text)); //NO I18N
			this.allDeviceSelectionChanged();
		}else{
			this.set("showSingleAppSelection", false); //NO I18N
			this.set("showCustomAppSelection", false); //NO I18N
		}
	}.observes("selectedSource"), //NO I18N
	allDeviceSelectionChanged: function(){
		if(!this.isAllDeviceSelected){
			switch(this.selectedSource){
				case "1"	: 	this.set("listTitle1", Ember.I18n.t("webclient.cusreports.selDevice")); //NO I18N
								this.set("listTitle2", Ember.I18n.t("webclient.fwa.select.interface")); //NO I18N
								this.getDeviceList("routerList"); //NO I18N
								break;
				case "2"	: 	this.set("listTitle2", Ember.I18n.t("webclient.Select.Intf.Group")); //NO I18N
								this.getInterfaceGroupList();
								break;
				case "3"	: 	this.set("listTitle2", Ember.I18n.t("webclient.Select.IP.Group")); //NO I18N
								this.getIpGroupList();
								break;
			}
		}
		this.set("showRouterList", (this.selectedSource === "1" && !this.isAllDeviceSelected)); //NO I18N
		this.getAppList();
	}.observes("isAllDeviceSelected"), //NO I18N
	getDeviceList: function(key){
		if(this.list[key] === undefined || this.list[key].length === 0){
			this.set("list."+key, nfa_getDeviceList(false)); //NO I18N
		}
		this.set("deviceList", jQuery.extend(true, [], this.list[key])); //NO I18N
		this.set("selectedRouterID", ""); //NO I18N
		this.set("selectedRouterID", (this.deviceList.length !== 0) ? this.deviceList[0].routerID : ""); //NO I18N
	},
	getInterfaceList: function(){
		if(this.selectedRouterID !== "" && this.selectedRouterID !== undefined){ //NO I18N
			if(this.list[this.selectedRouterID] === undefined){
				this.set("list."+this.selectedRouterID, nfa_getInterfaceList(this.selectedRouterID, false)); //NO I18N
			}
			this.updateSource(this.selectedRouterID);
		}
	}.observes("selectedRouterID"), //NO I18N
	getInterfaceGroupList: function(){
		if(this.list.interfaceGroupList === undefined || this.list.interfaceGroupList.length === 0){
			var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/listIntfGroup", {showDetails:false}); //NO I18N
			this.set("list.interfaceGroupList", jsonData.Group_List); //NO I18N
		}
		this.updateSource("interfaceGroupList"); //NO I18N
	},
	getIpGroupList: function(){
		if(this.list.ipGroupList === undefined || this.list.ipGroupList.length === 0){
			var jsonData = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaipgroup/listIPGroup", {showDetails:false}); //NO I18N
			this.set("list.ipGroupList", jsonData.IPGroup_List); //NO I18N
		}
		this.updateSource("ipGroupList"); //NO I18N
	},
	updateSource: function(key){
		this.set("interfaceList", jQuery.extend(true, [], this.list[key])); //NO I18N
		this.set("selectedSourceID", (this.interfaceList.length !== 0) ? this.interfaceList[0].ID : ""); //NO I18N
	},
	selectedSourceIDChanged: function(){
		this.getAppList();
	}.observes("selectedSourceID"), //NO I18N
	appSelectionTypeObserver: function(){
		this.set("appSelectionTypesList", nfa_getCheckedList($.extend(true, [], this.appSelectionTypesList), "value", this.appSelectionType)); //NO I18N
		this.set("showFlowTypeSelection", (this.appSelectionType === "top" || this.appSelectionType === "custom")); //NO I18N
		this.getAppList();
	}.observes("appSelectionType"), //NO I18N
	flowTypeObserver: function(){
		var flowList = jQuery.extend(true, [], this.flowTypeList);
		for(var i=0; i<flowList.length; i++){
			flowList[i].className = (flowList[i].value === this.flowType) ? "active" : ""; //NO I18N
			flowList[i].checked = (flowList[i].value === this.flowType) ? "checked" : ""; //NO I18N
		}
		this.set("flowTypeList", flowList); //NO I18N
	}.observes("flowType"), //NO I18N
	timePeriodChanged: function(){
		this.set("hideExWeekend", (this.timeFrame === "365")); //NO I18N
		this.set("hideBussAlert", (["90","180","365"].contains(this.timeFrame))); //NO I18N
		if(!this.showInputForm){
			this.send("generateReport"); //NO I18N
		}
	}.observes("timeFrame"), //NO I18N
	showHistoryChanged: function(){
		this.send("generateReport"); //NO I18N
	}.observes("showHistory"), //NO I18N
	didInsertElement: function(){

	},
	getAppList: function(flag){
		$(".OpMAlertMsg").remove(); //NO I18N
		this.set("showSingleAppSelection", (this.selectedSource !== "-1" && this.appSelectionType === "single")); //NO I18N
		this.set("showCustomAppSelection", (this.selectedSource !== "-1" && this.appSelectionType === "custom")); //NO I18N
		if(this.appSelectionType !== "top" || flag){ //NO I18N
			if(this.selectedSource === "-1"){ //NO I18N
				nfa_addValidationError("#sourceList", Ember.I18n.t("webclient.Select.anyone.source")); //NO I18N
				return;
			}
			if(!this.isAllDeviceSelected && this.selectedSourceID === ""){ //NO I18N
				return;
			}
			if(this.isAllDeviceSelected && this.list[this.appType+this.selectedSource] && this.list[this.appType+this.selectedSource].length){
				this.setAppList(this.appType+this.selectedSource);
				return;
			}
			if(!this.isAllDeviceSelected && this.list[this.appType+this.selectedSourceID] && this.list[this.appType+this.selectedSourceID].length){
				this.setAppList(this.appType+this.selectedSourceID); //NO I18N
				return;
			}
			var self = this;
			var keyName;
			var uniqueID = opm_infoMsgs("infoMsg", Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
			var callBackFunction = function(response){
				$("#"+uniqueID).remove(); //NO I18N
				if(response.data !== undefined && response.data.length === 0){
					opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.forecastreport.noAppMsg")); //NO I18N
				}
				self.set("list."+keyName, (response.data !== undefined ? response.data : [])); //NO I18N
				self.setAppList(keyName);
			};
			var formData = {islayer7: (this.appType === "l7"), TimeFrame: "weekly"}; //NO I18N
			if(this.isAllDeviceSelected){
				formData.DeviceID = "-1"; //NO I18N
				keyName = this.appType+this.selectedSource;
			}else{
				formData.DeviceID = this.selectedSourceID;
				keyName = this.appType+this.selectedSourceID;
			}
			switch(this.selectedSource){
				case "2"	: 	formData.BussView = true; break; //NO I18N
				case "3"	: 	formData.IPGroup = true; break; //NO I18N
			}
			nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaapps/listAppsForForecast", formData, callBackFunction, {}); //NO I18N
		}
	},
	setAppList: function(key){
		this.set("appList", this.list[key]); //NO I18N
		this.set("selectedSingleApp", (this.appList.length === 0 ? "" : this.appList[0].ID)); //NO I18N
		this.set("availableAppList", $.extend(true, [], this.appList)); //NO I18N
		this.set("selectedAppList", []); //NO I18N
		this.set("numberOfSelectedApps", 0); //NO I18N
		this.set("selectedAppIDs", []); //NO I18N
	},
	getPDFInputs:function() {
		var headerDetails = $.extend(true, {}, this.formData);
		headerDetails.timeFrameString = this.timeFrameString;
		if(this.isAllDeviceSelected){
			headerDetails.title1 = "nfa.source.name"; //NO I18N
			switch(this.selectedSource){
				case "1"	: 	headerDetails.value1 = Ember.I18n.t("nfa.alarm.allintf"); break; //NO I18N
				case "2"	: 	headerDetails.value1 = Ember.I18n.t("nfa.alarm.allintfgrp"); break; //NO I18N
				case "3"	: 	headerDetails.value1 = Ember.I18n.t("nfa.alarm.allipgrp"); break; //NO I18N
			}
		}else{
			nfa_getReportPDFInputs(headerDetails, this);
		}
		return headerDetails;
	},
	actions: {
		forecastTypeChanged: function(value){
			nfa_getActiveList(this.forecastTypes, "value", value); //NO I18N
			this.set("selectedForecastType", value); //NO I18N
		},
		childActions: function(functionName, param1, param2){
			this.send(functionName, param1, param2);
		},
		updateValues: function(key, value){
			this.set(key, value);
		},
		appTypeChanged: function(value){
			this.set("appType", value); //NO I18N
		},
		appSelectionTypeChanged: function(value){
			this.set("appSelectionType", value); //NO I18N
		},
		flowTypeChanged: function(type){
			this.set("flowType", type); //NO I18N
		},
		generateReport: function(){
			$(".OpMAlertMsg").remove(); //NO I18N
			if(this.selectedSource === "-1"){ //NO I18N
				nfa_addValidationError("#sourceList", Ember.I18n.t("webclient.Select.anyone.source")); //NO I18N
				return;
			}
			if(!this.isAllDeviceSelected && (this.selectedSourceID === undefined || this.selectedSourceID === "")){ //NO I18N
				nfa_addValidationError(".interfaceList", (this.selectedSource === "1" ? Ember.I18n.t("nfa.interface.selectionMsg") : Ember.I18n.t("nfa.group.selectionMsg"))); //NO I18N
				return;
			}
			var formData;
			switch(this.appSelectionType){
				case "top"		: 	formData = {appID: -1, Data: this.flowType, topApp: true}; //NO I18N
									break;
				case "single"	: 	if(this.selectedSingleApp === undefined || this.selectedSingleApp === ""){ //NO I18N
										nfa_addValidationError("#singleApp", Ember.I18n.t("nfa.app.selectionMsg")); //NO I18N
										return;
									}
									if($("#singleApp option:selected").text() !== ""){
										this.set("selectedSingleAppName", $("#singleApp option:selected").text()); //NO I18N
									}
									formData = {appID: this.selectedSingleApp, Data: "both"}; //NO I18N
									break;
				case "custom"	: 	if(this.numberOfSelectedApps > 5){ //NO I18N
										opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.app.multiSelectMsg")); //NO I18N
										return;
									}else if(this.numberOfSelectedApps === 0){
										opm_infoMsgs("infoMsg", Ember.I18n.t("nfa.app.selectionMsg")); //NO I18N
										return;
									}
									formData = {appID: this.selectedAppIDs.join(","), Data: this.flowType}; //NO I18N
									break;
			}
			switch(this.selectedSource){
				case "2"	: 	formData.BussView = true; break; //NO I18N
				case "3"	: 	formData.IPGroup = true; break; //NO I18N
			}
			formData.islayer7 = (this.appType === "l7"); //NO I18N
			formData.DeviceID = this.isAllDeviceSelected ? "-1" : this.selectedSourceID; //NO I18N
			formData.ForecastPeriod = this.timeFrame;
			formData.isExWeekend = (this.hideExWeekend) ? false : this.isExWeekend;
			if(!this.hideBussAlert && this.isBussAlert){
				formData.filterStTime = this.bussStartTime;
				formData.filterEdTime = this.bussEndTime;
			}
			formData.showHistory = this.showHistory;

			this.set("apiURL", window.OPM.apiUrlPattern+"/v2/nfaforecast/getAppForecastData"); //NO I18N
			this.set("formData", formData); //NO I18N

			var self = this;
			var callBackFunction = function(response){
				if(response.error !== undefined){
					showMessage(response);
					return;
				}
				if(self.appSelectionType === "top"){ //NO I18N
					var getAppsFlag = false;
					if(self.isAllDeviceSelected){
						if(!(self.list[self.appType+self.selectedSource] && self.list[self.appType+self.selectedSource].length)){
							getAppsFlag = true;
						}
					}else if(!(self.list[self.appType+self.selectedSourceID] && self.list[self.appType+self.selectedSourceID].length)){
						getAppsFlag = true;
					}
					if(getAppsFlag){self.getAppList(true);}
				}
				if(self.showEditReport){
					slideOut(5);
					self.set("showEditReport", false); //NO I18N
				}
				self.set("showInputForm", false); //NO I18N
				self.set("apiData", response); //NO I18N
			};
			nfa_getAjaxResponseWithAsync(this.apiURL, this.formData, callBackFunction, {}, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
		},
		exportToMail: function(){
			OPMClient.NFAReportsPDFCurrentApiurl = this.apiURL;
			OPMClient.NFAReportsController.formData = this.getPDFInputs();
			OPMClient.NFAReportsController.set("formData.reportTitle", this.pageTitle); //NO I18N
			loadMailDataInOneClickForm("nfa.forecastreport.app"); //NO I18N
		},
		exportToPDF: function(){
			var headerDetails = this.getPDFInputs();
			var formElements = [];
			for(var key in headerDetails){
				formElements.push({name: key, value: headerDetails[key]});
			}
			nfa_exportPDFReport(this.apiURL, "appForecast", this.pageTitle, formElements); //NO I18N
		},
		exportToCSV: function(){
			var headerDetails = this.getPDFInputs();
			headerDetails.tablediv = "trafficList"; //NO I18N
			headerDetails.StartTime = this.apiData.startTime;
			headerDetails.EndTime = this.apiData.endTime;
			var otherInfo = [
				{name: Ember.I18n.t("webclient.nfa.selectedappln"), value: this.apiData.appNames}, //NO I18N
				{name: Ember.I18n.t("webclient.nfa.widget.flowtype"), value: this.formData.Data} //NO I18N
			];
			nfa_ReportsToCSV(this.pageTitle, headerDetails, otherInfo);
		}
	},
	willDestroyElement:function(){
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaForecastAppReportPageComponent = Ember.Component.extend({
	templateName: "components/nfa-forecast-app-report-page", //NO I18N
	graphPlotType: "line", //NO I18N
	showEditReport: false,
	initDefaults: function(){
		if(this.isAllDeviceSelected){
			var name;
			switch(this.selectedSource){
				case "1"	: 	name = Ember.I18n.t("interfaces"); break; //NO I18N
				case "2"	: 	name = Ember.I18n.t("webclient.settings.intf.grp.list"); break; //NO I18N
				case "3"	: 	name = Ember.I18n.t("webclient.settings.ip.grps.list"); break; //NO I18N
			}
			this.set("selectedAllSourceName", name); //NO I18N
		}
	}.on("init"), //NO I18N
	didInsertElement:function() {
		this.loadReport();
	},
	appSelectionTypeObserver: function(){
		this.set("appSelectionTypesList1", nfa_getCheckedList($.extend(true, [], this.appSelectionTypesList1), "value", this.appSelectionType1)); //NO I18N
		this.set("showSingleAppSelection1", (this.appSelectionType1 === "single")); //NO I18N
		this.set("showCustomAppSelection1", (this.appSelectionType1 === "custom")); //NO I18N
	}.observes("appSelectionType1"), //NO I18N
	loadReport: function() {
		var apiData = this.apiData;
		var formData = this.formData;

		var gparams = {
			id: "reportGraph", //NO I18N
			data: apiData.GraphData,
			graphPlotType: this.graphPlotType,
			yAxis: apiData.yAxis,
			TimeFrame: "yearly", //NO I18N
			legend:  nfa_getForecastGraphLegend()
		}
		this.set("graphParams",gparams); //NO I18N

		var gridDetails = {
			colNamesList: apiData.tableheader,
			colModelList: []
		};
		for(var i=0; i<apiData.tableheader.length; i++){
			gridDetails.colModelList.push({name: apiData.tableheader[i], index: apiData.tableheader[i]});
		}
		gridDetails.data = apiData.TrafficData;
		$("#trafficList").jqGrid("GridUnload"); //NO I18N
		opm_loadJQgridWithData("#trafficList", gridDetails.data, gridDetails.colNamesList, gridDetails.colModelList, "", "#trafficListPager", "", ""); //NO I18N
		$("#trafficList").jqGrid("setGridWidth", $("#trafficList").closest(".opmFormHolder").width()-30); //NO I18N
		$("#trafficList").addClass("ut ut-Grid"); //NO I18N
	}.observes("apiData"), //NO I18N
	actions:{
		subChildActions: function(functionName,param1){
			this.sendAction("action", functionName, param1); //NO I18N
			this.sendAction("action", "generateReport"); //NO I18N
		},
		exportActions: function(functionName){
			this.sendAction("action", functionName); //NO I18N
		},
		updateReport: function(){
			this.sendAction("action", "updateValues", "appSelectionTypesList", this.appSelectionTypesList1); //NO I18N
			this.sendAction("action", "updateValues", "appSelectionType", this.appSelectionType1); //NO I18N
			this.sendAction("action", "updateValues", "showSingleAppSelection", this.showSingleAppSelection1); //NO I18N
			this.sendAction("action", "updateValues", "appList", this.appList1); //NO I18N
			this.sendAction("action", "updateValues", "selectedSingleApp", this.selectedSingleApp1); //NO I18N
			this.sendAction("action", "updateValues", "showCustomAppSelection", this.showCustomAppSelection1); //NO I18N
			this.sendAction("action", "updateValues", "availableAppList", this.availableAppList1); //NO I18N
			this.sendAction("action", "updateValues", "selectedAppList", this.selectedAppList1); //NO I18N
			this.sendAction("action", "updateValues", "numberOfSelectedApps", this.numberOfSelectedApps1); //NO I18N
			this.sendAction("action", "updateValues", "selectedAppIDs", this.selectedAppIDs1); //NO I18N
			this.sendAction("action", "updateValues", "isBussAlert", this.isBussAlert1); //NO I18N
			this.sendAction("action", "updateValues", "bussStartTime", this.bussStartTime1); //NO I18N
			this.sendAction("action", "updateValues", "bussEndTime", this.bussEndTime1); //NO I18N
			this.sendAction("action", "updateValues", "isExWeekend", this.isExWeekend1); //NO I18N
			this.sendAction("action", "generateReport"); //NO I18N
		},
		appSelectionTypeChanged: function(value){
			this.set("appSelectionType1", value); //NO I18N
		},
		openEditReport: function(){
			this.set("appSelectionTypesList1", $.extend(true, [], this.appSelectionTypesList)); //NO I18N
			this.set("appSelectionType1", (this.appSelectionType ? this.appSelectionType : "top")); //NO I18N
			this.set("showSingleAppSelection1", (this.showSingleAppSelection ? true : false)); //NO I18N
			this.set("appList1", $.extend(true, [], this.appList)); //NO I18N
			this.set("selectedSingleApp1", (this.selectedSingleApp ? this.selectedSingleApp : "")); //NO I18N
			this.set("showCustomAppSelection1", (this.showCustomAppSelection ? true :false)); //NO I18N
			this.set("availableAppList1", $.extend(true, [], this.availableAppList)); //NO I18N
			this.set("selectedAppList1", $.extend(true, [], this.selectedAppList)); //NO I18N
			this.set("numberOfSelectedApps1", (this.numberOfSelectedApps ? this.numberOfSelectedApps : 0)); //NO I18N
			this.set("selectedAppIDs1", (this.selectedAppIDs ? this.selectedAppIDs : [])); //NO I18N
			this.set("isBussAlert1", (this.isBussAlert ? true : false)); //NO I18N
			this.set("bussStartTime1", (this.bussStartTime ? this.bussStartTime : "0")); //NO I18N
			this.set("bussEndTime1", (this.bussEndTime ? this.bussEndTime : "0")); //NO I18N
			this.set("isExWeekend1", (this.isExWeekend ? true :false)); //NO I18N
			slideIn(5);
			this.set("showEditReport", true); //NO I18N
		},
		closeEditReport: function(){
			slideOut(5);
			this.set("showEditReport", false); //NO I18N
		},
		closeReport: function(){
			this.set("showInputForm", true); //NO I18N
		}
	}
});

OPMClient.NfaFavoriteReportConfigComponent = Ember.Component.extend({
	templateName: "components/nfa-favorite-report-config", //NO I18N
	initDefaults: function(){
		this.set("timeFrameList", nfa_getFilteredTimeFrames(this.reportType)); //NO I18N
		this.set("selectedTimeFrame", (this.parentModel.selectedTimePeriod === "custom") ? "none" : this.parentModel.selectedTimePeriod); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement: function(){
		slideIn(5);
	},
	actions: {
		saveFavoriteReport: function(){
			if(opm_validateFields({empty: ["favoriteNameID"], nfaNameCheck: ["favoriteNameID"]})){ //NO I18N
				if(this.selectedTimeFrame === "none"){ //NO I18N
					nfa_addValidationError(".favoriteTimeFrameID", Ember.I18n.t("webclient.ncm.firmvuln.selectTimePeriod")); //NO I18N
					return;
				}
				var formData = {Task: "add", FavoriteName: this.favoriteName, FavoriteDesc: this.favoriteDesc, FavoriteType: this.reportType}; //NO I18N
				switch(this.parentModel.selectedSource) {
					case "1"	:
					case "8"	: 	formData.DeviceType = "10"; break; //NO I18N
					case "2"	: 	formData.DeviceType = "12"; break; //NO I18N
					case "3"	: 	formData.DeviceType = "11"; break; //NO I18N
					case "4"	: 	formData.DeviceType = "13"; break; //NO I18N
					case "5"	: 	formData.DeviceType = "15"; break; //NO I18N
					case "6"	: 	formData.DeviceType = "14"; break; //NO I18N
					case "11"	: 	formData.DeviceType = "22"; break; //NO I18N
					case "12"	: 	formData.DeviceType = "23"; break; //NO I18N
					case "14"	: 	formData.DeviceType = "24"; break; //NO I18N
				}
				switch(this.reportType){
					case "Forensics"	: 	formData.DeviceID = JSON.stringify([this.parentModel.selectedSourceID]); //NO I18N
											var otherParams = {
												sourceType: 	this.parentModel.selectedSource,
												deviceID: 		this.parentModel.selectedRouterID,
												criteriaOper: 	this.parentModel.formData.Oper,
												TimeFrame: 		this.selectedTimeFrame,
												bussFilter: 	this.parentModel.isBussFilter,
												isExWeekend: 	this.parentModel.isExWeekend
											};
											if(otherParams.bussFilter){
												otherParams.filterStTime = this.parentModel.bussStartTime;
												otherParams.filterEdTime = this.parentModel.bussEndTime;
											}
											var criteriaList = JSON.parse(this.parentModel.formData.Criteria);
											otherParams.numberOfCriteria = nfa_formatCriteriaForFavReport(criteriaList,otherParams);
											break;
					case "consolidated"	: 	formData.DeviceID = JSON.stringify([this.parentModel.selectedSourceID]); //NO I18N
											var otherParams = {
												sourceType: 	this.parentModel.selectedSource,
												deviceID: 		this.parentModel.selectedRouterID,
												trafficType: 	this.parentModel.formData.Type,
												topCount: 		this.parentModel.topCount,
												TimeFrame: 		this.selectedTimeFrame,
												bussFilter: 	this.parentModel.isBussAlert,
												isExWeekend: 	this.parentModel.isExWeekend
											};
											var reportTypes = JSON.parse(this.parentModel.formData.reportType);
											for(var i=0, length=reportTypes.length; i<length; i++) {
												otherParams["reportTypes"+i] = reportTypes[i];
											}
											otherParams.numberOfReportTypes = length;
											if(otherParams.bussFilter) {
												otherParams.filterStTime = this.parentModel.bussStartTime;
												otherParams.filterEdTime = this.parentModel.bussEndTime;
											}
											break;
					case "capacityPlanning":	formData.DeviceID = JSON.stringify([this.parentModel.selectedSourceID]); //NO I18N
											var otherParams = {
												sourceType: 	this.parentModel.selectedSource,
												deviceID: 		this.parentModel.selectedRouterID,
												trafficType: 	this.parentModel.trafficType,
												TimeFrame: 		this.selectedTimeFrame,
												bussFilter: 	this.parentModel.isBussAlert,
												isExWeekend: 	this.parentModel.isExWeekend
											};
											if(otherParams.bussFilter) {
												otherParams.filterStTime = this.parentModel.bussStartTime;
												otherParams.filterEdTime = this.parentModel.bussEndTime;
											}
											break;
					case "protocol"		: 	formData.DeviceID = JSON.stringify([this.parentModel.selectedSourceID]); //NO I18N
											var otherParams = {
												sourceType: 	this.parentModel.selectedSource,
												deviceID: 		this.parentModel.selectedRouterID,
												trafficType: 	this.parentModel.formData.Type,
												Data: 			this.parentModel.formData.Data,
												TimeFrame: 		this.selectedTimeFrame
											};
											break;
					case "overall"		: 	formData.DeviceID = this.parentModel.formData.DeviceID; //NO I18N
											var otherParams = {
												sourceType: 			this.parentModel.selectedSource,
												isAllDeviceSelected: 	(JSON.parse(this.parentModel.formData.DeviceID)[0] === "-1"), //NO I18N
												trafficType: 			this.parentModel.selectedTrafficType,
												TimeFrame: 				this.selectedTimeFrame,
												bussFilter: 			this.parentModel.isBussAlert,
												isExWeekend: 			this.parentModel.isExWeekend,
												showOnly95thPerc: 		this.parentModel.showOnly95thPerc
											};
											if(otherParams.bussFilter) {
												otherParams.filterStTime = this.parentModel.bussStartTime;
												otherParams.filterEdTime = this.parentModel.bussEndTime;
											}
											var criteria = this.parentModel.formData.Criteria ? JSON.parse(this.parentModel.formData.Criteria) : [];
											for(var i=0, length=criteria.length; i<length; i++) {
												otherParams["criteria"+i] = criteria[i].type+","+criteria[i].comp+","+criteria[i].value+","+criteria[i].unit; //NO I18N
											}
											otherParams.numberOfCriteria = length;
											otherParams.isUnitCalculationWith1024 = window.OPM.isNFAVolumeCalcWith1024;
											break;
				}
				if(["1","4","8"].indexOf(this.parentModel.selectedSource) === -1) {
					delete otherParams.deviceID;
				}
				formData.FavoriteParams = JSON.stringify(otherParams);
				var callBackFunction = function(response, self){
					showMessage(response);
					if(response.error === undefined){
						OPMClient.NFAReportsController.set("favoriteReportParams", {isFromFavorite: true}); //NO I18N
						self.send("closeAction"); //NO I18N
					}
				};
				nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfareports/favoriteReport", formData, callBackFunction, this, Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT")); //NO I18N
			}
		},
		closeAction: function(){
			switch(this.reportType){
				case "Forensics"		: 	opmGlobalRoute.transitionTo("Reports.Netflow.Forensics"); break; //NO I18N
				case "consolidated"		: 	//NO I18N
				case "capacityPlanning"	: 	//NO I18N
				case "protocol"			: 	//NO I18N
				case "overall"			: 	this.set("parentModel.showFavoriteReportSlide", false); break; //NO I18N
			}
		}
	},
	willDestroyElement: function(){
		slideOut(5);
	}
});

OPMClient.NfaSuppressAlarmComponent = Ember.Component.extend({
	templateName:"nfa-suppress-alarm", //NO I18N
	selectedTimePeriod:"",
	suppressTimeList:[
		{name:Ember.I18n.t("jsp.tools.DisasterRecoverySchedule.Never"),	value:"0"}, //NO I18N
		{name:Ember.I18n.t("webclient.workflow.suppressalarm.1hour"),	value:"1"}, //NO I18N
		{name:Ember.I18n.t("webclient.workflow.suppressalarm.2hour"),	value:"2"}, //NO I18N
		{name:Ember.I18n.t("webclient.workflow.suppressalarm.8hour"),	value:"8"}, //NO I18N
		{name:Ember.I18n.t("webclient.workflow.suppressalarm.12hour"),	value:"12"}, //NO I18N
		{name:Ember.I18n.t("webclient.workflow.suppressalarm.1day"),	value:"24"}, //NO I18N
		{name:Ember.I18n.t("webclient.workflow.suppressalarm.1week"),	value:"168"}, //NO I18N
		{name:Ember.I18n.t("webclient.Forever"),						value:"-1"}, //NO I18N
		{name:Ember.I18n.t("webclient.reports.timeframe.custom"),		value:"custom"} //NO I18N
	],
	didInsertElement:function() {
	},
	timeChanged:function() {
		if(this.selectedTimePeriod!==undefined) {
			this.set("suppressTimeList", nfa_getCheckedList(jQuery.extend(true,[], this.suppressTimeList), "value", this.selectedTimePeriod)); //NO I18N
		}
	}.observes("selectedTimePeriod"), //NO I18N
	actions: {
		timeChanged:function(time) {
			if(time==="custom" && (this.startTime===undefined || this.endTime===undefined)) { //NO I18N
				var start = getEndTimeWithTimeZone();
				var end = new Date((start.getTime()+(1*60*60*1000)));
				this.set("startTime", nfa_getFormattedDate(start)); //NO I18N
				this.set("endTime", nfa_getFormattedDate(end)); //NO I18N
			}
			this.set("selectedTimePeriod", time); //NO I18N
		},
		save:function() {
			var self = this;
			var okCallBack = function() {
				var formData = {TimePeriod:self.selectedTimePeriod};
				if(self.selectedTimePeriod===undefined || self.selectedTimePeriod==="") { //NO I18N
					opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.admin.archive.timeerr")); //NO I18N
					return;
				}
				if(self.selectedTimePeriod==="custom") { //NO I18N
					if(!nfa_validateCustomTime(self.startTime,self.endTime)) {
						return;
					}
					formData.StartTime = self.startTime;
					formData.EndTime = self.endTime;
				}
				var deviceList,deviceType;
				if(window.OPM.currentView.name.indexOf("Inventory.List.")!==-1) { //NO I18N
					var subFilterKey = nfa_getInvSubFilterKey();
					if(subFilterKey==="APMAC" || subFilterKey==="APMAC_ID") { //NO I18N
						deviceType = "AccessPoint"; //NO I18N
					}else {
						deviceType = subFilterKey.slice(0,-1); //removing last char
					}
					deviceList = getNfaMultiselectRowIds("ID").split(","); //NO I18N
				}else if(window.OPM.currentView.name.indexOf("Inventory.Device.NFASuppressAlarm")!==-1) { //NO I18N
					deviceType = (self.snapType==="FlowAPMAC") ? "AccessPoint" : self.snapType.split("Flow")[1]; //NO I18N
					deviceList = [self.deviceID];
				}
				var deviceDetails = {};
				deviceDetails[deviceType] = deviceList;
				formData.DeviceDetails = JSON.stringify(deviceDetails);

				var callBackFunction = function(response) {
					if(response.error!==undefined) {
						opm_infoMsgs("errorMsg",response.error.message); //NO I18N
					}else {
						opm_infoMsgs("successMsg",response.message); //NO I18N
						if(window.OPM.currentView.name.indexOf("Inventory.List.")!==-1) { //NO I18N
							nfa_redirectInvList();
							$("#DeviceList .icon-remove.close").click(); //NO I18N
							OPMClient.Inventory.getNFAFilters(OPMClient.InventoryDeviceDetailsController.subFilterType);
						}
					}
				};
				nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaalert/suppressAlertForNFADevice",formData,callBackFunction); //NO I18N
			};
			$("body").addClass("ui-dialog-hide-close"); //NO I18N
			opmConfirm("",Ember.I18n.t("nfa.operation.confirmMsg"),"",okCallBack,"","","","","dialogStyle2"); //NO I18N
		},
		cancel:function() {
			if(window.OPM.currentView.name.indexOf("Inventory.List.")!==-1) { //NO I18N
				nfa_redirectInvList();
			}else if(window.OPM.currentView.name.indexOf("Inventory.Device.")!==-1) { //NO I18N
				opmGlobalRoute.transitionTo("Inventory.Device"); //NO I18N
			}
		}
	},
	willDestroyElement:function() {
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaPasswordFieldComponent = Ember.Component.extend({
	templateName:"components/nfa-password-field", //NO I18N
	classNames:["passwordShowHide"], //NO I18N
	isShowPassword:false,
	actions:{
		showPassword:function() {
			this.set("isShowPassword", !this.isShowPassword); //NO I18N
		}
	},
	willDestroyElement:function() {
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

OPMClient.NfaFlowExportComponent = Ember.Component.extend({
	templateName:"components/nfa-flow-export", //NO I18N
	step_number:1,
	step1_next:false,
	step2_next:false,
	step2_loading:false,
	step3_next:true,
	is_invalid_domain:true,
	show_ping_test:true,
	show_snmp_test:false,
	is_test_running:false,
	is_flow_export_success:false,
	ip_address:"", //NO I18N
	ip_address_bck:"", //NO I18N
	user_name:"", //NO I18N
	password:"", //NO I18N
	enable_password:"", //NO I18N
	connection_port:"22", //NO I18N
	connection_timeout:"10", //NO I18N
	user_prompt:">,$,#", //NO I18N
	enable_prompt:">,$,#", //NO I18N
	login_prompt:":", //NO I18N
	password_prompt:":", //NO I18N
	enable_user_name_prompt:":", //NO I18N
	enable_password_prompt:":", //NO I18N
	selected_protocol:"SSH", //NO I18N
	iconURL:"/apiclient/fluidicv2/img/sprite-opm.svg#", //NO I18N
	select_prompt:Ember.I18n.t("webclient.action.select"), //NO I18N
	interface_list:[],
	bread_crumb_list:[
		{name:Ember.I18n.t("opstor.inventory.rhs.deviceinfo"),	value:1, isActive:true}, //NO I18N
		{name:Ember.I18n.t("nfa.flowExport.login.credentials"),	value:2, isActive:false}, //NO I18N
		{name:Ember.I18n.t("nfa.flowExport.config.template"),	value:3, isActive:false}, //NO I18N
		{name:Ember.I18n.t("nfa.interface.flowStatus"),			value:4, isActive:false} //NO I18N
	],
	initDefaults:function() {
		this.ipAddressChanged();
		this.getSNMPCredentials();
		this.set("vendor_model_list", {}); //NO I18N
	}.on("init"), //NO I18N
	didInsertElement:function() {
		$("#"+this.elementId).off().on("select2:open", function() { //NO I18N
			document.querySelector(".select2-search__field").focus(); //NO I18N
		});
	},
	ipAddressChanged:function() {
		if(this.ip_address_bck!==this.ip_address) {
			this.set("show_ping_test", true); //NO I18N
			this.set("is_ping_success", false); //NO I18N
			this.set("show_ping_result", false); //NO I18N
			this.set("show_snmp_test", false); //NO I18N
			this.set("is_snmp_success", false); //NO I18N
			this.set("show_snmp_result", false); //NO I18N
			this.set("show_vendor_details", false); //NO I18N
			this.set("step1_next", false); //NO I18N
			this.set("selected_vendor", undefined); //NO I18N
			this.set("selected_model", undefined); //NO I18N
			this.set("selected_interface", ""); //NO I18N
			this.set("loopBackInterface", false); //NO I18N
		}
		this.set("is_invalid_domain", (this.ip_address==="")); //NO I18N
	}.observes("ip_address"), //NO I18N
	credentialChanged:function() {
		if(this.is_ping_success) {
			this.set("show_snmp_result", false); //NO I18N
			this.set("show_snmp_loader", false); //NO I18N
			this.set("is_snmp_success", false); //NO I18N
			this.set("selected_vendor", undefined); //NO I18N
			this.set("selected_model", undefined); //NO I18N
			if(this.selected_credential) {
				this.set("show_snmp_test", true); //NO I18N
				this.set("show_vendor_details", false); //NO I18N
				this.set("step1_next", false); //NO I18N
			}else {
				this.set("show_snmp_test", false); //NO I18N
				this.getAllVendors();
				this.set("show_vendor_details", true); //NO I18N
				this.set("step1_next", true); //NO I18N
				this.checkStep1Next();
			}
		}
	}.observes("selected_credential"), //NO I18N
	getSNMPCredentials:function(new_credential) {
		var credential_list = [];
		var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/admin/listCredentials"); //NO I18N
		if(response.snmpcredential!==undefined) {
			credential_list = credential_list.concat(response.snmpcredential);
		}
		if(response.snmpv3credential!==undefined) {
			credential_list = credential_list.concat(response.snmpv3credential);
		}
		this.set("selected_credential", new_credential); //NO I18N
		this.set("credential_list", credential_list); //NO I18N
	},
	newCredentialAdded:function() {
		if(OPMClient.SettingsNFAConfigController.newSNMPCredential!=="") { //NO I18N
			this.getSNMPCredentials(OPMClient.SettingsNFAConfigController.newSNMPCredential);
			OPMClient.SettingsNFAConfigController.set("newSNMPCredential", ""); //NO I18N
		}
	}.observes("OPMClient.SettingsNFAConfigController.newSNMPCredential"), //NO I18N
	getAllVendors:function() {
		var call_bck_function = function(response, self) {
			if(response!==undefined) {
				self.set("vendor_list", response.Vendor); //NO I18N
				if(response.selectedVendor) {
					self.set("selected_vendor", response.selectedVendor.Name); //NO I18N
				}
			}
		};
		var data=(this.selected_credential!==null && this.selected_credential!==undefined)?{hostname:this.ip_address,credentialName:this.selected_credential}:""; //NO I18N
		nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/getVendorList", data, call_bck_function, this); //NO I18N
	},
	getVendorModel:function() {
		this.set("show_vendor_help", false); //NO I18N
		if(this.selected_vendor) {
			if(this.vendor_model_list[this.selected_vendor]===undefined) {
				var response = nfa_getAjaxResponse(window.OPM.apiUrlPattern+"/nfaadmin/getModelsList", {VENDOR_NAME:this.selected_vendor}); //NO I18N
				this.set("vendor_model_list."+this.selected_vendor, (response===undefined||response.deviceTypes===undefined)?[]:response.deviceTypes); //NO I18N
			}
			this.set("model_list", this.vendor_model_list[this.selected_vendor]); //NO I18N
		}else {
			this.set("model_list", []); //NO I18N
			this.set("selected_model", undefined); //NO I18N
		}
	}.observes("selected_vendor"), //NO I18N
	checkStep1Next:function() {
		this.set("show_vendor_help", false); //NO I18N
		if(this.selected_model) {
			this.send("getConfiglets", true); //NO I18N
		}
		this.set("step1_next", (!this.show_vendor_help && this.selected_model!==null && this.selected_model!==undefined && this.is_ping_success)); //NO I18N
	}.observes("selected_model"), //NO I18N
	checkStep2Next:function() {
		this.set("step2_next", (!this.step2_loading && (this.user_name && this.password && ((this.showAddParams)?(this.user_prompt && this.connection_port):true)))); //NO I18N
	}.observes("user_name","password","user_prompt","connection_port","showAddParams"), //NO I18N
	stepNumberChanged:function() {
		var bread_crumb_list = $.extend(true,[],this.bread_crumb_list);
		for(var i=bread_crumb_list.length-1; i>=0; i--) {
			bread_crumb_list[i].isActive = (bread_crumb_list[i].value==this.step_number);
		}
		this.set("bread_crumb_list", bread_crumb_list); //NO I18N
	}.observes("step_number"), //NO I18N
	interfaceChanged:function() {
		if(this.selected_interface && this.selected_interface!=="") { //NO I18N
			this.send("getConfiglets", false, this.selected_interface); //NO I18N
		}
	}.observes("selected_interface"), //NO I18N
	configletsTemplateChanged:function() {
		var configlets = $.extend(true,[],this.configlets);
		for(var i=configlets.length-1; i>=0; i--) {
			if(configlets[i].Id==this.selected_configlet_id) {
				configlets[i].isActive = true;
				this.set("selected_configlet", configlets[i]); //NO I18N
			}else {
				configlets[i].isActive = false;
			}
		}
		this.set("configlets", configlets); //NO I18N
	}.observes("selected_configlet_id"), //NO I18N
	actions: {
		addSNMPCredential:function() {
			opmGlobalRoute.transitionTo("Settings.Discovery.ExportFlow.AddSNMPCredential"); //NO I18N
			OPMClient.SettingsNFAConfigController.set("isFlowExport", true); //NO I18N
			OPMClient.SettingsNFAConfigController.set("updateSNMP", true); //NO I18N
		},
		doPingTest:function() {
			var fields = {empty:["ip_address"],hostName:["ip_address"]}; //NO I18N
			if(!opm_validateFields(fields)) {
				return;
			}
			this.set("is_test_running", true); //NO I18N
			this.set("show_ping_test", true); //NO I18N
			this.set("show_ping_loader", true); //NO I18N
			this.set("show_ping_result", false); //NO I18N
			this.set("ip_address_bck", this.ip_address); //NO I18N
			var data = {ipOrHost:this.ip_address,actionFrom:"scanButton",doAction:"Ping"}; //NO I18N
			var call_bck_function = function(response, self) {
				self.set("is_test_running", false); //NO I18N
				if(response!==undefined) {
					if(response.error!==undefined) {
						showMessage(response);
						self.set("show_ping_loader", false); //NO I18N
						self.set("show_ping_result", false); //NO I18N
					}else if(response.result!==undefined) {
						self.set("ping_status", response.result.pingStatus); //NO I18N
						self.set("is_ping_success", (response.result.status==="Success")); //NO I18N

						if(self.is_ping_success) {
							self.set("xlinkIcon", self.iconURL+"verified"); //NO I18N
							self.set("ping_test_msg", Ember.I18n.t("nfa.flowExport.test.successMsg",{operation:Ember.I18n.t("webclient.action.ping")})); //NO I18N
							if(self.selected_credential!==null && self.selected_credential!==undefined) {
								self.send("doSNMPTest"); //NO I18N
							}else {
								self.getAllVendors();
								self.set("show_vendor_details", true); //NO I18N
							}
						}else {
							self.set("xlinkIcon", self.iconURL+"warning-round"); //NO I18N
							self.set("ping_test_msg", Ember.I18n.t("nfa.flowExport.test.failureMsg",{operation:Ember.I18n.t("webclient.action.ping")})); //NO I18N
						}
						self.set("show_ping_test", false); //NO I18N
						self.set("show_ping_loader", false); //NO I18N
						self.set("show_ping_result", true); //NO I18N
					}
				}
			};
			nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/tools/getPing", data, call_bck_function, this); //NO I18N
		},
		doSNMPTest:function() {
			this.set("is_test_running", true); //NO I18N
			this.set("show_snmp_test", true); //NO I18N
			this.set("show_snmp_loader", true); //NO I18N
			this.set("show_snmp_result", false); //NO I18N
			var data = {routerName:this.ip_address,credentialName:this.selected_credential,oid:"IfDesc",getAllInterface:true,isFlowExport:true}; //NO I18N
			var call_bck_function = function(response, self) {
				self.set("is_test_running", false); //NO I18N
				if(response!==undefined) {
					self.set("snmp_status", (response.error!==undefined)?response.error.message:response.message); //NO I18N
					self.set("is_snmp_success", (response.error===undefined)); //NO I18N

					if(self.is_snmp_success) {
						self.set("interface_list", Object.values(response)); //NO I18N
						self.set("xlinkIcon", self.iconURL+"verified"); //NO I18N
						self.set("snmp_test_msg", Ember.I18n.t("nfa.flowExport.test.successMsg",{operation:Ember.I18n.t("webclient.topo.details.tabs.snmp")})); //NO I18N
					}else {
						self.set("selected_interface", ""); //NO I18N
						self.set("interface_list", []); //NO I18N
						self.set("step1_next", false); //NO I18N
						self.set("xlinkIcon", self.iconURL+"warning-round"); //NO I18N
						self.set("snmp_test_msg", Ember.I18n.t("nfa.flowExport.test.failureMsg",{operation:Ember.I18n.t("webclient.topo.details.tabs.snmp")})); //NO I18N
					}
					self.set("show_snmp_test", false); //NO I18N
					self.set("show_snmp_result", true); //NO I18N
					self.getAllVendors();
					self.set("show_vendor_details", true); //NO I18N
				}
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/addCiscoDevice", data, call_bck_function, this); //NO I18N
		},
		addVendorModel:function() {
			var okCallBack, alertMsg, window_width;
			if(OPMClient.ApplicationController.isLiveChatEnabled) {
				okCallBack = function() {
					showLiveChat();
					$zoho.salesiq.visitor.question(Ember.I18n.t("nfa.flowExport.chatbox.msg")); //NO I18N
				};
				alertMsg = Ember.I18n.t("nfa.flowExport.vendor.missing") //NO I18N
				btn_lable = Ember.I18n.t("nfa.flowExport.chatbox.open"); //NO I18N
				window_width = 600;
			}else {
				okCallBack = function() {
					opm_transitionToParentRoute("Settings.Basic.System"); //NO I18N
					Ember.run.schedule("afterRender",this,function() { //NO I18N
						OPMClient.Settings.showHideSystemSettings("Client"); //NO I18N
					});
				};
				alertMsg = Ember.I18n.t("nfa.flowExport.chatbox.disabled.alert"); //NO I18N
				btn_lable = Ember.I18n.t("webclient.rmm.noprobe.settings"); //NO I18N
				window_width = 450;
			}
			opmAlertPopUp("", alertMsg, window_width, okCallBack, btn_lable, "", "", ""); //NO I18N
		},
		getConfiglet:function(id) {
			this.set("selected_configlet_id", id); //NO I18N
		},
		protocolChanged:function(protocol) {
			this.set("selected_protocol", protocol); //NO I18N
			this.set("connection_port", (protocol==="SSH")?"22":"23"); //NO I18N
		},
		validateLogging:function() {
			var fields = {empty:["user_name", "password"]}; //NO I18N
			if(this.showAddParams) {
				fields.empty.push("user_prompt"); //NO I18N
				fields.empty.push("connection_port"); //NO I18N
				fields.portRange = ["connection_port"]; //NO I18N
				if(this.connection_timeout) {
					fields.timeout = ["connection_timeout"]; //NO I18N
				}
			}
			if(!opm_validateFields(fields)) {
				return;
			}
			var data = {Type:this.selected_protocol,HostName:this.ip_address,UserName:this.user_name,Password:this.password,isCheck:true};
			data.Prompt 				= this.user_prompt;
			data.EnableCommand 			= this.enable_command;
			data.EnableUserName 		= this.enable_user_name;
			data.EnablePassword 		= this.enable_password;
			data.EnablePrompt 			= this.enable_prompt;
			if(this.showAddParams) {
				data.Prompt 				= this.user_prompt;
				data.EnableCommand 			= this.enable_command;
				data.EnableUserName 		= this.enable_user_name;
				data.EnablePassword 		= this.enable_password;
				data.EnablePrompt 			= this.enable_prompt;
				data.TelnetSSHPort 			= this.connection_port;
				data.CLITimeout 			= this.connection_timeout;
				data.LoginPrompt 			= this.login_prompt;
				data.PasswordPrompt 		= this.password_prompt;
				data.LoginPrefixPrompt 		= this.login_prefix_prompt;
				data.LoginPrefix 			= this.login_prefix;
				data.EnableUserPrompt 		= this.enable_user_name_prompt;
				data.EnablePasswordPrompt 	= this.enable_password_prompt;
			}
			this.set("flow_export_form_data", data); //NO I18N
			this.set("step2_next", false); //NO I18N
			this.set("step2_loading", true); //NO I18N

			var call_bck_function = function(response, self) {
				if(response!==undefined) {
					self.set("step2_next", true); //NO I18N
					self.set("step2_loading", false); //NO I18N
					showMessage(response);
					if(response.error===undefined) {
						self.send("goToNextPage", 3); //NO I18N
					}
				}
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/ncmdevice/directFlowExport", data, call_bck_function, this); //NO I18N
		},
		getConfiglets:function(is_vendor_model_changed, interface_name) {
			var data = {hostname:this.ip_address, deviceType:this.selected_model, flowExportType:"DirectFlowExport"}; //NO I18N
			if(this.is_snmp_success) {
				data.credentialName		= this.selected_credential;
				data.interfaceNames		= this.interface_list.join(","); //NO I18N
				data.loopBackInterface	= (is_vendor_model_changed && this.selected_interface)?this.selected_interface:(interface_name)?interface_name:this.interface_list.join(","); //NO I18N
			}
			var call_bck_function = function(response, self) {
				if(response!==undefined) {
					self.set("configlets", []); //NO I18N
					if(response.error!==undefined) {
						showMessage(response);
					}else {
						if(response.configlets && response.configlets.length>0) {
							self.set("configlets", response.configlets); //NO I18N
							self.set("selected_configlet_id", response.configlets[0].Id); //NO I18N
							if(self.selected_configlet_id===response.configlets[0].Id) {
								self.configletsTemplateChanged();
							}
						}
						if(!self.loopBackInterface) {
							self.set("loopBackInterface", true); //NO I18N
							self.set("selected_interface", (response.selectedInterface || "$LOOPBACK_IFNAME")); //NO I18N
						}
					}
					if(is_vendor_model_changed) {
						self.set("show_commands_unavailable_msg", (self.configlets===undefined || self.configlets.length===0)); //NO I18N
						self.set("vendor_help_link", response.helpLink); //NO I18N
						self.set("show_vendor_help", (response.helpLink!==undefined || self.show_commands_unavailable_msg)); //NO I18N
						self.set("step1_next", !self.show_vendor_help); //NO I18N
					}
				}
			}
			nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/ncmdevice/getNFADeviceAndConfiglet", data, call_bck_function, this); //NO I18N
		},
		getExportResult:function() {
			this.set("step3_next", false); //NO I18N
			var data = this.flow_export_form_data;
			data.isCheck = false;
			data.ConfigletsType = "Automatic"; //NO I18N
			if(window.OPM.prevView.name.indexOf("Alarms.Alarm.Details.index") !== -1){
            	data.fromAlert = true;
            }
			data.CommandToExecute = JSON.stringify(this.selected_configlet.TemplateContents.split("\n")); //NO I18N

			var call_bck_function = function(response, self) {
				self.set("step3_next", true); //NO I18N
				if(response!==undefined) {
					if(response.error!==undefined) {
						showMessage(response);
					}
					if(response.showNext) {
						var result_content = ""; //NO I18N
						for(i=0; i<response.result.length; i++) {
							result_content += response.command[i]+" : "+"\n\t\t"+response.result[i].replace(/\n/g,"\n\t\t")+"\n"; //NO I18N
						}
						self.set("result_content", result_content); //NO I18N
						self.set("xlinkIcon", self.iconURL+"warning-round"); //NO I18N

						if(response.isSuccess) {
							self.set("flow_export_status_icon", "verify-configurations-container warning"); //NO I18N
							self.set("flow_export_status_msg", Ember.I18n.t("webclient.exportflow.flowexportstatuspending")); //NO I18N

							var apiURL = window.OPM.apiUrlPattern+"/nfaadmin/devicePresent"; //NO I18N
							if(window.OPM.isEEProbeSelected) {
								apiURL = appendProbeIDForExternal(apiURL, window.OPM.selectedEEProbe);
							}
							self.set("flow_check_timer", null); //NO I18N
							self.set("flow_check_count", 0); //NO I18N
							function checkIsFlowReceived() {
								self.set("flow_check_count", (self.flow_check_count+1)); //NO I18N
								var jsonData = nfa_getAjaxResponse(apiURL, {IPADDRESS:self.ip_address});
								var isValid = (jsonData!==undefined && jsonData.Status===false);
								if(isValid) {
									self.set("is_flow_export_success", true); //NO I18N
									self.set("xlinkIcon", self.iconURL+"verified"); //NO I18N
									self.set("flow_export_status_icon", "verify-configurations-container success"); //NO I18N
									self.set("flow_export_status_msg", Ember.I18n.t("webclient.exportflow.flowexportstatussucc")); //NO I18N
								}
								if(isValid || self.flow_check_count===6) {
									Ember.run.cancel(self.flow_check_timer);
								}else {
									self.set("flow_check_timer", Ember.run.later(this, checkIsFlowReceived, 5000)); //NO I18N
								}
							}
							self.set("flow_check_timer", Ember.run.later(this, checkIsFlowReceived, 0)); //NO I18N
						}else {
							self.set("flow_export_status_icon", "verify-configurations-container error"); //NO I18N
							self.set("flow_export_status_msg", Ember.I18n.t("webclient.exportflow.flowexportstatuserror")); //NO I18N
						}
						self.send("goToNextPage", 4); //NO I18N
					}
				}
			}
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/ncmdevice/directFlowExport", data, call_bck_function, this); //NO I18N
		},
		closeExportFlow:function() {
			opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub", "Devices"); //NO I18N
		},
		goToNextPage:function(step_number) {
			this.set("step_number", step_number); //NO I18N
		}
	},
	willDestroyElement:function() {
		Ember.run.cancel(this.flow_check_timer);
		OPMClient.SettingsNFAConfigController.set("isFlowExport", false); //NO I18N
		OPMClient.SettingsNFAConfigController.set("updateSNMP", false); //NO I18N
		$("#"+this.elementId).find("*").remove(); //NO I18N
	}
});

function nfa_loadNetworkMap(self) {
	var container = document.getElementById("nfaNetworkMap"); //NO I18N
	var options = {
		layout: {
			hierarchical: {
				enabled:true,
				levelSeparation:200, // Vertical separation between levels
				nodeSpacing:100, // Horizontal spacing between nodes on the same level
				treeSpacing:200, // Spacing between different trees in the hierarchy
				blockShifting: true,
				edgeMinimization: true,
				parentCentralization: true,
				direction:"UD", // UD-Upward, DU-Downward, LR-Leftward, RL-Rightward //NO I18N
				sortMethod:"directed", // directed, hubsize //NO I18N
				shakeTowards:"roots"  // roots, leaves //NO I18N
			}
		},
		edges: {
			dashes:[3,3], //Dotted lines for edges
			color: {
				color:"#757575", //NO I18N
				highlight:"#5CC2EE", //NO I18N
				hover:"#5CC2EE", //NO I18N
				inherit:"to", //NO I18N
				opacity:1.0
			},
			font: {
				align:"top", //NO I18N
				size:10,
				vadjust:0
			}
		},
		nodes: {
			color: {
				border:"#757575", //NO I18N
				background:"#FAFAFA", //NO I18N
				highlight: {
					border:"#5CC2EE", //NO I18N
					background:"#EEF6FB" //NO I18N
				},
				hover: {
					border:"#5CC2EE", //NO I18N
					background:"#EEF6FB" //NO I18N
				}
			},
			font:{
				size:10
			},
			opacity:1
		},
		physics:true,
		interaction: {
			dragNodes:true,
			zoomView:true,
			dragView:true,
			hover:true
		}
	};
	var mapNodes = self.apiData.nodes.concat(self.apiData.interface_nodes);
	var nodes = new vis.DataSet(mapNodes);
	var edges = new vis.DataSet(self.apiData.edges);
	var network = new vis.Network(container, {nodes:nodes, edges:edges}, options);
	self.set("nfaNetworkMap", network); //NO I18N

	if(self.apiData.node_positions!==undefined) {
		for(var key in self.apiData.node_positions) {
			network.moveNode(key, self.apiData.node_positions[key].x, self.apiData.node_positions[key].y);
		}
		setTimeout(function(){
			network.moveTo({"scale":self.apiData.zoom_value, "position":{"x":self.apiData.view_position.x, "y":self.apiData.view_position.y}}); //NO I18N
		});
	}else {
		// Get the canvas context
		// var canvasContext = network.canvas.frame.canvas.getContext("2d"); //NO I18N

		// Get the canvas size
		// var canvasWidth = canvasContext.canvas.width;
		// var canvasHeight = canvasContext.canvas.height;

		// Calculate coordinates for the four corners and center
		var topLeft = network.DOMtoCanvas({x:0, y:0});
		// var topRight = network.DOMtoCanvas({x:canvasWidth, y:0});
		// var bottomLeft = network.DOMtoCanvas({x:0, y:canvasHeight});
		// var bottomRight = network.DOMtoCanvas({x:canvasWidth, y:canvasHeight});
		// var center = network.DOMtoCanvas({x:canvasWidth/2, y:canvasHeight/2});

		var root_y = topLeft.y+70; //-195;
		var interfaceCount = self.apiData.interface_nodes.length;
		var start_x=0, middle=Math.floor(interfaceCount/2);
		if(interfaceCount%2===0) {
			middle--;
			start_x = -10;
		}
		var tmpX=start_x, tmpY=root_y+44, node_dist=20;

		network.moveNode("root", 0, root_y); //NO I18N

		//To position the middle node.
		network.moveNode(self.apiData.interface_nodes[middle].id, tmpX, tmpY);

		//To arrange the nodes to the left of the middle node.
		for(var i=middle-1; i>=0; i--) {
			network.moveNode(self.apiData.interface_nodes[i].id, (tmpX-=node_dist), tmpY);
		}

		//To arrange the nodes to the right of the middle node.
		tmpX=start_x;
		for(var i=middle+1; i<interfaceCount; i++) {
			network.moveNode(self.apiData.interface_nodes[i].id, (tmpX+=node_dist), tmpY);
		}
		self.send("fitMapToScreen", true); //NO I18N
	}

	if(OPMClient.InventoryNFAController.selectedNode) {
		self.set("selectedNode", OPMClient.InventoryNFAController.selectedNode); //NO I18N
		network.setSelection({nodes:[self.selectedNode.id]});
	}

	var container = document.getElementById("nfaNetworkMap").getElementsByTagName("canvas")[0]; //NO I18N

	network.on("hoverNode", function(params) { //NO I18N
		container.style.cursor = "pointer"; //NO I18N
	});
	network.on("hoverEdge", function(params) { //NO I18N
		container.style.cursor = "pointer"; //NO I18N
	});
	network.on("selectNode", function(params) { //NO I18N
		container.style.cursor = "pointer"; //NO I18N
		if(params.nodes.length > 0) {
			var nodeId = params.nodes[0];
			var node = nodes.get(nodeId);
			node.label = (node.label)?node.label:node.name;
			node.isInterface = (nodeId.indexOf("interface_")!==-1); //NO I18N
			node.isAddedInNFA = (node.nfaID!=="-1" && node.nfaID!=="-2"); //NO I18N
			node.xlinkIcon = "/apiclient/fluidicv2/img/sprite-opm.svg#"+node.iconName; //NO I18N
			if(!node.isInterface && !node.isIP) {
				node.deviceModel = Ember.I18n.t("webclient.common.unknown"); //NO I18N
				self.set("selectedNode", node); //NO I18N
			}else {
				self.getAdditionalNodeInfo(node);
			}
		}
	});
	network.on("deselectNode", function(params) { //NO I18N
		self.set("selectedNode", false); //NO I18N
	});
	network.on("hold", function(params) { //NO I18N
		container.style.cursor = (params.nodes.length>0) ? "grabbing" : "all-scroll"; //NO I18N
	});
	network.on("dragStart", function(params) { //NO I18N
		container.style.cursor = (params.nodes.length>0) ? "grabbing" : "all-scroll"; //NO I18N
	});
	network.on("blurNode", function(params) { //NO I18N
		container.style.cursor = "auto"; //NO I18N
	});
	network.on("blurEdge", function(params) { //NO I18N
		container.style.cursor = "auto"; //NO I18N
	});
	network.on("release", function(params) { //NO I18N
		container.style.cursor = "auto"; //NO I18N
	});
	network.on("dragEnd", function(params) { //NO I18N
		container.style.cursor = "auto"; //NO I18N
		self.storeNetworkMapValues();
	});
	network.on("zoom", function(params) { //NO I18N
		self.storeNetworkMapValues();
	});
	network.on("doubleClick", function (params) { //NO I18N
		if (params.nodes.length > 0) {
			var nodeId = params.nodes[0];
			var node = nodes.get(nodeId);
			if(node.nfaID!=-1) {
				if(node.id.indexOf("interface_")!==-1) { //NO I18N
					opmGlobalRoute.transitionTo("Inventory.Device", "FlowInterface", node.nfaID); //NO I18N
				}else if(node.isNFADevice && node.isIP) {
					opmGlobalRoute.transitionTo("Inventory.Device", "FlowDevice", node.nfaID); //NO I18N
				}
			}
		}
	});
	// zoom with ctrl + scroll
	var interactionHandler = network.interactionHandler;
	if(interactionHandler) {
		interactionHandler.body.eventListeners.onMouseWheel = function(event) {
			if(!event.ctrlKey) {
				return;
			}
			interactionHandler.onMouseWheel(event);
		};
	}
}
OPMClient.NfaAjaxDropDownComponent = Ember.Component.extend({
	templateName:"components/nfa-ajax-drop-down", //NO I18N
	searchPrompt:Ember.I18n.t("webclient.search"), //NO I18N
	classNames:"selBox",
	didInsertElement: function(){
		var self = this;
		Ember.run.schedule("afterRender", this, function(){ //NO I18N
			$("#"+this.dropDownID).select2({
				ajax: {
					url: this.url,
					dataType: "json",
					delay: 250,
					data: function(params) {
						if (self.formData !== undefined) {
							return $.extend({}, self.formData, {AssetName: params.term});
						}
						return {keyWord: params.term};
					},
					processResults: function (data) {
						return {results: data.results};
					},
					cache: true
				},
				placeholder: this.searchPrompt,
				minimumInputLength: 1,
				language: {
					inputTooShort: function () {
						return Ember.I18n.t("nfa.as.search");//NO I18N
					}
				}
			});
		});
	 }
});

OPMClient.OpmOverviewCardComponent = Ember.Component.extend({
	templateName: "components/overview-card", //NO I18N
	didInsertElement: function(){
		var widgetData = this.get("widgetData"); //NO I18N

		$("#widgetElement_"+widgetData.snapid).addClass("overview-card"); //NO I18N

		var cardData = [];
		if (widgetData && widgetData.apiData) {
			if(widgetData.name === "webclient.dpi.dns.summary") {
				cardData = [
					{title: Ember.I18n.t("webclient.total.dns.queries"), value: widgetData.apiData.total_requests}, //NO I18N
					{title: Ember.I18n.t("webclient.unique.domains.queries"), value: widgetData.apiData.unique_domains}, //NO I18N
					{title: Ember.I18n.t("webclient.total.errors"), value: widgetData.apiData.total_errors}, //NO I18N
					{title: Ember.I18n.t("webclient.avg.responsetime"), value: widgetData.apiData.avg_response_time}, //NO I18N
					{title: Ember.I18n.t("webclient.top.dns.querytype"), value: widgetData.apiData.most_used_query_type} //NO I18N
				];
			} else if (widgetData.name === "webclient.dpi.dhcp.summary") {
				cardData = [
					{title: Ember.I18n.t("webclient.total.dhcp.requests"), value: widgetData.apiData.total_requests}, //NO I18N
					{title: Ember.I18n.t("webclient.unique.clients"), value: widgetData.apiData.unique_clients}, //NO I18N
					{title: Ember.I18n.t("webclient.failure.rate"), value: widgetData.apiData.error_percentage}, //NO I18N
					{title: Ember.I18n.t("webclient.avg.responsetime"), value: widgetData.apiData.avg_response_time} //NO I18N
				];
			}
		}
		this.set("cardData", cardData); //NO I18N
	}
});

OPMClient.OpmPromotionComponent = Ember.Component.extend({
	templateName: "components/promotion", //NO I18N
	initialize: function() {
		var widgetData = this.get("widgetData"); //NO I18N
		this.set("widgetData", widgetData); //NO I18N
		if (this.widgetData.name === "webclient.promotion.widget.dns") {
			this.set("isDNSInsights", true); //NO I18N
			this.set("title", Ember.I18n.t("webclient.dns.visibility")); //NO I18N
			this.set("description", "webclient.dns.visibility.desc"); //NO I18N
			this.set("features", [ //NO I18N
				{text: Ember.I18n.t("webclient.dns.visibility.step1")}, //NO I18N
				{text: Ember.I18n.t("webclient.dns.visibility.step2")}, //NO I18N
				{text: Ember.I18n.t("webclient.dns.visibility.step3")}, //NO I18N
				{text: Ember.I18n.t("webclient.dns.visibility.step4")} //NO I18N
			]);
			this.set("buttonLabel", Ember.I18n.t("webclient.setup.remote.collector")); //NO I18N
			this.set("imageLabel", Ember.I18n.t("webclient.data.collection.architecture")); //NO I18N
			this.set("imageLink", "/apiclient/fluidicv2/img/dns-architecture.png"); //NO I18N
		} else if (this.widgetData.name === "webclient.promotion.widget.dhcp") {
			this.set("isDHCPInsights", true); //NO I18N
			this.set("title", Ember.I18n.t("webclient.dhcp.visibility")); //NO I18N
			this.set("description", "webclient.dhcp.visibility.desc"); //NO I18N
			this.set("features", [ //NO I18N
				{text: Ember.I18n.t("webclient.dhcp.visibility.step1")}, //NO I18N
				{text: Ember.I18n.t("webclient.dhcp.visibility.step2")}, //NO I18N
				{text: Ember.I18n.t("webclient.dhcp.visibility.step3")}, //NO I18N
				{text: Ember.I18n.t("webclient.dhcp.visibility.step4")} //NO I18N
			]);
			this.set("buttonLabel", Ember.I18n.t("webclient.setup.remote.collector")); //NO I18N
			this.set("imageLabel", Ember.I18n.t("webclient.data.collection.architecture")); //NO I18N
			this.set("imageLink", "/apiclient/fluidicv2/img/dhcp-architecture.png"); //NO I18N
		}
	}.on("init"), //NO I18N
	didInsertElement: function() {},
	actions: {
		configureButton: function() {
			if (this.isDNSInsights || this.isDHCPInsights) {
				opmGlobalRoute.transitionTo("Settings.Agents.NPS"); //NO I18N
			}
		}
	}
});

OPMClient.NfaDiscoverySettingsComponent = Ember.Component.extend({
	templateName:"components/nfa-discovery-settings",//NO I18N
	addInterfaceAs:"Manage",//NO I18N
	interfaceIndex:"",//NO I18N
	interfaceNameContains:"",//NO I18N
	portCriteriaType:"Include",//NO I18N
	startsWithType:"contains",//NO I18N
	discoveryMode:"basic",//NO I18N
	operationType:"AND",//NO I18N
	isAdvancedMode:false,
	initDefaults:function(){
		this.set("disableConfigure", !window.OPM.isAuthorized); //NO I18N
	}.on("init"),//NO I18N
	onAdvancedModeToggle:function(){
		if(this.get("isAdvancedMode")){//NO I18N
			Ember.run.next(this, function(){
				this.$("#portCriteriaType").select2().val(this.get("portCriteriaType")).trigger("change");//NO I18N
				this.$("#interfaceNameType").select2().val(this.get("startsWithType")).trigger("change");//NO I18N
				$("input[name='operationType'][value='"+this.get("operationType")+"']").prop("checked", true);//NO I18N
			});
		}
	}.observes("isAdvancedMode"),//NO I18N
	didInsertElement:function(){
		this.loadSettingsFromServer();
	},
	loadSettingsFromServer:function(){
		var self = this;
		var callBckFunc = function(resp){
			if(resp && resp["-1"]) {
				var data = resp["-1"];
				if(data.interfaceState) {
					self.set("addInterfaceAs", data.interfaceState); //NO I18N
				}
				if(data.portRange) {
					self.set("interfaceIndex", data.portRange); //NO I18N
				}
				if(data.portRangeType) {
					self.set("portCriteriaType", data.portRangeType); //NO I18N
				}
			if(data.interfacenameType) {
				self.set("startsWithType", data.interfacenameType); //NO I18N
			}
				if(data.interfacename !== undefined) {
					self.set("interfaceNameContains", data.interfacename); //NO I18N
				}
				if(data.operationType) {
					self.set("operationType", data.operationType); //NO I18N
				}
				var hasAdvancedData = (data.portRange && $.trim(data.portRange) !== "") || (data.interfacename !== undefined && $.trim(data.interfacename) !== ""); //NO I18N
				var mode = hasAdvancedData ? "advanced" : "basic"; //NO I18N
				if(data.discoveryMode) {
					mode = data.discoveryMode;
				}
				self.set("discoveryMode", mode); //NO I18N
				self.set("isAdvancedMode", mode === "advanced"); //NO I18N
			}
			$("input[name='addInterfaceAs'][value='"+self.addInterfaceAs+"']").prop("checked", true); //NO I18N
			$("input[name='discoveryMode'][value='"+self.get("discoveryMode")+"']").prop("checked", true); //NO I18N
		};
		nfa_getAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/getNFADiscoverySettings", {}, callBckFunc, this); //NO I18N
	},
	loadSettings:function(){
		if(!this.get("refreshTrigger")) { return; } //NO I18N
		this.loadSettingsFromServer();
	}.observes("refreshTrigger"),//NO I18N
	actions:{
		setDiscoveryMode:function(mode){
			this.set("discoveryMode", mode);//NO I18N
			this.set("isAdvancedMode", mode === "advanced");//NO I18N
		},
		setOperationType:function(type){
			this.set("operationType", type);//NO I18N
		},
		saveDiscoverySettings:function(){
			var isAdvanced = this.get("isAdvancedMode"); //NO I18N
			var indexCriteria = isAdvanced ? this.$("#portCriteriaType").val() : ""; //NO I18N
			var nameCriteria = isAdvanced ? this.$("#interfaceNameType").val() : ""; //NO I18N
			var applyNow = isAdvanced ? $("input[name='applyalldeviceselchkbox']").is(":checked") : false; //NO I18N
			var data = {
				interfaceState: $("input[name='addInterfaceAs']:checked").val(), //NO I18N
				portRange: isAdvanced ? $.trim(this.interfaceIndex) : "",
				portRangeType: indexCriteria,
				interfaceName: isAdvanced ? $.trim(this.interfaceNameContains) : "",
                interfaceNameType: nameCriteria,
				operationType: isAdvanced ? this.get("operationType") : "", //NO I18N
				DeviceIP:"-1",
				applynow: applyNow
			};
            var self = this;
            var callBackFunction = function(response) {
                if(!response.error) {
                    self.set("addInterfaceAs", data.interfaceState); //NO I18N
                    self.set("interfaceIndex", data.portRange); //NO I18N
                    if(data.portRangeType) {
                        self.set("portCriteriaType", data.portRangeType); //NO I18N
                    }
                    self.set("interfaceNameContains", data.interfaceName); //NO I18N
                    if(data.interfaceNameType) {
                        self.set("interfaceNameType", data.interfaceNameType); //NO I18N
                    }
                    self.set("operationType", data.operationType); //NO I18N
                }
                showMessage(response);
            };
			nfa_postAjaxResponseWithAsync(window.OPM.apiUrlPattern+"/nfaadmin/updateNFADiscoverySettings",data,callBackFunction,this,Ember.I18n.t("opu.common.request.PROCESSING_PL_WAIT"));//NO I18N
		}
	}
});

OPMClient.NfaSettingsImportComponent = Ember.Component.extend({
	templateName: "components/nfa-settings-import", //NO I18N
	initialize: function() {
		var isASView = (this.get("importType") === "ASView"); //NO I18N
		this.set("isASView", isASView); //NO I18N
		this.set("titleText",    Ember.I18n.t(isASView ? "webclient.nfa.asview.import.title"    : "webclient.nfa.lanipsettings.import.title"));   //NO I18N
		this.set("noteMsg",      Ember.I18n.t(isASView ? "webclient.nfa.asview.import.noteMsg"  : "webclient.nfa.lanipsettings.import.noteMsg")); //NO I18N
		this.set("fileInputId",  isASView ? "importASViewXML" : "importLANIPXML");            //NO I18N
		this.set("apiUrl",       window.OPM.apiUrlPattern + (isASView ? "/nfaadmin/bulkASLoad" : "/nfaadmin/bulkLanIPLoad")); //NO I18N
		this.set("successRoute", isASView ? "Settings.NetflowConfig.Map.AsView" : "Settings.NetflowConfig.LANIPSettings");   //NO I18N
	}.on("init"), //NO I18N

	didInsertElement: function() {
		slideIn(1);
	},

	actions: {
		importFile: function() {
			if(window.OPM.isDemoUser) {
				opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.api.demoopmanager.notauthmsg")); //NO I18N
				return;
			}
			var fileInputId = this.get("fileInputId");
			if($("#" + fileInputId).val() == undefined || trim($("#" + fileInputId).val()) === "") { //NO I18N
				opm_infoMsgs("infoMsg", Ember.I18n.t("webclient.nfa.bulkLoad.alertInfo1")); //NO I18N
				return;
			}
			var self = this;
			var data = new FormData();
			data.append("bulkLoadFile", document.getElementById(fileInputId).files[0]); //NO I18N
			$.ajax({
				url: self.get("apiUrl"),
				data: data,
				type: "POST", //NO I18N
				dataType: "json", //NO I18N
				contentType: false,
				processData: false,
				beforeSend: function(XMLHttpRequest, settings) {
					appendCollectorDetails(XMLHttpRequest, settings);
				},
				success: function(response) {
					showMessage(response);
					if(response.error == undefined) {
						opmGlobalRoute.transitionTo(self.get("successRoute")); //NO I18N
						if(self.get("isASView")) {
							OPMClient.Settings.getAsViewList();
						} else {
							nfa_listConfiguredLANIPs();
						}
					} else {
						$("#" + fileInputId).val(""); //NO I18N
						opmFileUpload($("#" + fileInputId)[0]);
					}
				}
			});
		},
		goBack: function() {
			opmGlobalRoute.transitionTo(this.get("parentRoute")); //NO I18N
		}
	},

	willDestroyElement: function() {
		slideOut(1);
	}
});
