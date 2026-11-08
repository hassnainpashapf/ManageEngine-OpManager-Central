/*---------------------------------------------------------------
				FWA Snapshot Starts here
---------------------------------------------------------------*/
OPMClient.OpmFWADeviceSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-device-summary",
	initDefaults: function() {
		var self = this;
		var deviceRuleReadPermission=(window.isoperator || window.OPM.userPermissions.ruleManagementRead ||  window.OPM.userPermissions.fwaComplianceRead)
		var deviceRuleWritePermission=(window.isoperator || window.OPM.userPermissions.ruleManagementWrite ||  window.OPM.userPermissions.fwaComplianceWrite)
		var centralEdition = (window.OPM.isFWAServer || window.OPM.isCentralServer);
		self.set('controller.userPermissions.centralEdition',centralEdition);//No I18N
		self.set('controller.userPermissions.deviceRuleReadPermission',deviceRuleReadPermission);//No I18N
		self.set('controller.userPermissions.deviceRuleWritePermission',deviceRuleWritePermission);//No I18N
	}.on("init"), //NO I18N 
	didInsertElement:function() {
		$("#inventoryGridStyle").attr('class', 'gridStackCustomInnerWidget');
		var self = this;
		var graphParams = {};
		var apiResponse = this.get('widgetData').apiData;
		self.set('widgetData.sizey',15);//No I18N
		self.set('speedArr',[]);//NO I18N
		self.set('dialArr',[]);//NO I18N
		var grType=this.get('widgetData').apiData.speedType
		var tableData=this.get('widgetData').apiData.tableData;
	
		if(tableData != undefined){
			var inVal=0;
			var outVal=0;
			var percinVal=0;
			var percOutVal=0;
			var alrtCount=this.get('widgetData').apiData.alrtCount;
			var inText='';
			var OutText='';
			var suffixtext="";
			if(grType == 'Average'){
				inVal=tableData.data[0][4];
				outVal=tableData.data[0][10];
				percinVal=tableData.data[0][5];
				percOutVal=tableData.data[0][11];
				suffixtext=Ember.I18n.t('webclient.reports.tags.avg',this);//NO I18N
			}else if(grType == 'Maximum'){//NO I18N
				inVal=tableData.data[0][0];
				percinVal=tableData.data[0][1];
				outVal=tableData.data[0][6];
				percOutVal=tableData.data[0][7];
				suffixtext=Ember.I18n.t('webclient.reports.tags.max',this);//NO I18N
			}else{
				inVal=tableData.data[0][2];
				percinVal=tableData.data[0][3];
				outVal=tableData.data[0][8];
				percOutVal=tableData.data[0][9];
				suffixtext=Ember.I18n.t('webclient.reports.tags.min',this);//NO I18N
			}
			inVal = (inVal == "") ? 0:inVal;
			outVal = (outVal == "") ? 0:outVal;
			percinVal = (percinVal == "") ? 0:percinVal;
			percOutVal = (percOutVal == "") ? 0:percOutVal;
			inText=Ember.I18n.t('NFAWidget.IN',this)+" ("+suffixtext+")";
			OutText=Ember.I18n.t('NFAWidget.OUT',this)+" ("+suffixtext+")";
			
			//Constructing Utilization and alerts Dial		
			temp = {};
			var dialDetails = getFormattedDialDetails(percinVal);
			temp.value = dialDetails.dialValue;
			temp.dialValue = dialDetails.dialValue;
			temp.dialDivName = 'util_in_div';//NO I18N
			temp.dialType = 'meter';//NO I18N
			temp.snapHolderId = 'util_in_div';//NO I18N
			temp.dialColor = dialDetails.dialColor;	
			temp.iconTitle = Ember.I18n.t('webclient.reports.TrafficIN',this)+" ("+suffixtext+")";
			self.get('dialArr').pushObject(temp);//NO I18N
			
			
			
			
			temp = {};
			dialDetails = getFormattedDialDetails(percOutVal);
			temp.value = dialDetails.dialValue;
			temp.dialValue = dialDetails.dialValue;
			temp.dialDivName = 'util_out_div';//NO I18N
			temp.dialType = 'meter';//NO I18N
			temp.snapHolderId = 'util_out_div';//NO I18N
			temp.dialColor = dialDetails.dialColor;	
			temp.iconTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this)+" ("+suffixtext+")";
			self.get('dialArr').pushObject(temp);//NO I18N
			
			temp = {};
			var obj1=changefwaSpeedSuffix(inVal)
			temp.speedvalue = obj1.val;
			temp.unit = obj1.unit;
			temp.iconspeedTitle = inText;
			self.get('speedArr').pushObject(temp);//NO I18N
			
			temp = {};
			var obj1=changefwaSpeedSuffix(outVal);
			temp.speedvalue = obj1.val;
			temp.unit = obj1.unit;
			temp.iconspeedTitle = OutText;
			self.get('speedArr').pushObject(temp);//NO I18N
			
			
//			temp = {};
//			temp.speedvalue = alrtCount;
//			temp.speedHolderId = 'responseTimeDiv';//NO I18N
//			temp.iconspeedTitle = Ember.I18n.t('webclinet.inventory.nfa.alerts',this);//NO I18N
//			self.get('dialArr').pushObject(temp);//NO I18N
		}
		
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
	},
	actions:
	{

		editFWADeviceRuleSnapshot: function(){
			var content = this.get('snapshotObj');
			OPMClient.InventoryFWAController.editDeviceID=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryFWAController.editDeviceDDID=content.DDID;
			OPMClient.InventoryFWAController.selDeviceName=content.resName; 
			OPMClient.InventoryFWAController.selDeviceDispName=content.deviceDispName; 
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWADeviceRule"; //No I18N
		},
		editFWASnmpSettSnapshot: function(){
			var content = this.get('snapshotObj');
			OPMClient.InventoryFWAController.editDeviceID=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.SettingsFWConfigController.rid=OPMClient.InventoryDeviceDetailsController.deviceName;
			OPMClient.InventoryFWAController.snmpSettAvail=content.snmpSettings;
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAEditSnmp"; //No I18N
		},
		editFWAIntranetSettSnapshot:function(){
			var content = this.get('snapshotObj');
			OPMClient.InventoryFWAController.editDeviceID=[];
			OPMClient.InventoryFWAController.fwaresType=[];
			OPMClient.InventoryFWAController.editDeviceID.push(OPMClient.InventoryDeviceDetailsController.deviceName);
			OPMClient.InventoryFWAController.fwaresType.push(content.type);
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAIntranetConfigure"; //No I18N
		},
		editFWAExcludeSettSnapshot:function(){
			var content = this.get('snapshotObj');
			OPMClient.InventoryFWAController.editDeviceID=[];
			OPMClient.InventoryFWAController.fwaresType=[];
			OPMClient.InventoryFWAController.editDeviceID.push(OPMClient.InventoryDeviceDetailsController.deviceName);
			OPMClient.InventoryFWAController.fwaresType.push(content.type);
			location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.deviceName+"/FWAConfigure/FWAExcludeHostConfigure"; //No I18N
		},
		editFWASnmpSettingStatus:function(status){
			$.ajax({
	    		url:window.OPM.apiUrlPattern + '/v2/livetraffic/updateSnmpStatus?rid='+OPMClient.InventoryDeviceDetailsController.deviceName+'&status='+status, //No I18N
	    		type: 'POST', //No I18N
	    		success: function(jsonData){
	    			var	cls = "errorMsg"; //No I18N
	            	if(jsonData.isSuccess) {
	            		cls = "successMsg"; //No I18N
	            	}
	            	opm_infoMsgs(cls,jsonData.statusMsg);
	            	for(var i=0; i<OPMClient.Router.router.currentHandlerInfos.length;i++){
						if(OPMClient.Router.router.currentHandlerInfos[i].name!==undefined && OPMClient.Router.router.currentHandlerInfos[i].name==="Inventory.Device"){
							OPMClient.Router.router.currentHandlerInfos[i].handler.refresh();
						}
					}
	    		}
	    	});	
		}
	
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmFwaDeviceDetailsSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-device-details-summary",//No I18N
	didInsertElement:function() {
		
	},
	actions:
	{
		
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});


OPMClient.OpmFWAReportDataComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-report-data",
	showGrid: false,
	didInsertElement:function() {

		var currentWidgetData = this.widgetData;
		var snapshotData = currentWidgetData.snapshotData;
		var self = this;
		var inventorysnapType = self.snapshotObj.snapType;
		var response = this.get('widgetData').apiData;
		self.set('widgetData.tblRecCount',"");
		if(!self.get('widgetData.ondemandWidget')){
			var apiURL = opm_getSnapApiURL(currentWidgetData,this.snapshotObj,this.additionalProps);
			if(response != undefined && response.error == undefined && response.widgetAdditionalData != undefined){
				if(response.fwaresolveDNSOpt == "0"){
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').addClass('disabledDiv');
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','disabled');//No I18N
				}else if(response.fwaresolveDNSOpt == "2"){
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').removeClass('disabledDiv');
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','');//No I18N
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('checked',true);//No I18N
				}else{
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').removeClass('disabledDiv');
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','');//No I18N
				}
				if(response.data != undefined && response.data.length != 0){
					if(response.widgetAdditionalData.chartType == "pie"){
						var jsonData = response.data;
						var addDetails = JSON.parse(JSON.stringify(response.widgetAdditionalData));
						var colDetail=getInvFWAPieColDetails(addDetails);
						var colNames = colDetail.colNameList;
						var colModel = colDetail.colModelList;							
						self.set('widgetData.noData',false);//No I18N
						var multiData = new Array();
						if(response.data != undefined){
							for (var indexx = 0; indexx < response.data.length; indexx++) {
								var array_element = response.data[indexx];
								var arr = new Array();
								if(response.widgetAdditionalData.keyIndex != undefined && response.widgetAdditionalData.valueIndex != undefined ){
									arr.push(array_element[response.widgetAdditionalData.keyIndex]);
									arr.push(array_element[response.widgetAdditionalData.valueIndex]);
								}else{
									arr.push(array_element[0]);
									arr.push(array_element[1]);
								}
								multiData.push(arr);
							}
						}

						var graphParams = {};
						graphParams.id = 'perfGraph1'+currentWidgetData.id;//No I18N
						graphParams.data = multiData;
						graphParams.graphType = 'pie';//No I18N
						self.set('widgetData.tblRecCount',response.records);//No I18N
						self.set('graphParams',graphParams);//No I18N
						self.set('showWidget',true);//No I18N
						self.set('showGraph',true);//No I18N
						self.set('chartType','pie');//No I18N
						
						var gridCallBack = function(gridID,paramsObj){
							var gridH = $('#gbox_'+gridID).height()+30;
							var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
							if(cellCount <= 10){
								cellCount=10;
							}
							paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
							paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
							paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
						};
						var defaultOptions = {
								minRowsPerPage:10,
								isSnapshotGrid: true,
								snapId: currentWidgetData.id,
								snapIndex:currentWidgetData.snapIndex,
								reload: false,
								pagination: false,
								selColIndex:[0]
						};
						var gridData = response.data;
						var sendObj = {};
						defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
						defaultOptions.criteria=response.widgetAdditionalData.criteria;
						
						if(inventorysnapType != "FirewallUsers" && inventorysnapType != "FirewallRules" && (fwaSnapShotWithCategory.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1) && (fwaSnapShotWithCategoryNSeries.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1)){
							if(response.linkingRBBG != undefined ){
								defaultOptions.rbbtext="RBBG";//No I18N
								defaultOptions.rbbid=response.linkingRBBG;
								sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
								if(colModel != undefined && colModel[0] !=undefined){
									colModel[0].formatter =  function(cellvalue, options) {
//										return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
										return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span style="cursor:pointer">'+cellvalue+'</span>';
									}
									colModel[0].unformat =  function(cellvalue, options, cell) {
										return cellvalue;
									}
								}
							}else if(response.linkingRBB != undefined){
								defaultOptions.rbbtext="RBB";//No I18N
								defaultOptions.rbbid=response.linkingRBB;
								sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
								if(colModel != undefined && colModel[0] !=undefined){
									colModel[0].formatter =  function(cellvalue, options) {
//										return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
										return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span style="cursor:pointer">'+cellvalue+'</span>';
									}
									colModel[0].unformat =  function(cellvalue, options, cell) {
										return cellvalue;
									}
								}
							}else{
								if(colModel != undefined && colModel[0] !=undefined){
									colModel[0].formatter =  function(cellvalue, options) {
//										return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
										return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span>'+cellvalue+'</span>';
									}
									colModel[0].unformat =  function(cellvalue, options, cell) {
										return cellvalue;
									}
								}
							}
						}else{
							if(colModel != undefined && colModel[0] !=undefined){
								colModel[0].formatter =  function(cellvalue, options) {
//									return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
									return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span>'+cellvalue+'</span>';
								}
								colModel[0].unformat =  function(cellvalue, options, cell) {
									return cellvalue;
								}
							}
						}
						defaultOptions.gridCallBack=gridCallBack;
						defaultOptions.gridCallBackParams={self:self};
						sendObj.gridId = 'opm_App_Legend'+currentWidgetData.id;//No I18N
						sendObj.data = response.data;
						sendObj.colModels = colModel;
						sendObj.colNames = colNames;
						sendObj.defaultOptions = defaultOptions;
						self.set('gridData',sendObj);//No I18N
					}else if(response.widgetAdditionalData.chartType == "timeseries"){//No I18N
						if(response.GraphData != undefined && response.GraphData.chartData != undefined)
						{	
							var graphParams = {};
							graphParams.id = 'PerfGraph'+currentWidgetData.id;
							graphParams.data = response.GraphData.chartData;
							graphParams.yAxis = response.GraphData.xyTitles[1];
//							graphParams.customToolTip = nfa_getCustomTooltipFormat();
							graphParams.graphType = 'area';//No I18N
							self.set('showWidget',true);//No I18N
							self.set('showGraph',true);//No I18N
							self.set('chartType','timeseries');//No I18N
							self.set('graphParams',graphParams);//No I18N
							self.set('widgetData.noData',false);//No I18N
							self.set('widgetData.sizey',11);//No I18N
							self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
							self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
						}else{
							self.set('showWidget',false);//No I18N
							self.set('widgetData.noData',true);//No I18N
							self.set('widgetData.sizey',2);//No I18N
							self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
							self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
						}
					}else if(response.widgetAdditionalData.isTableData == "true" || response.widgetAdditionalData.chartType == "bar"){//No I18N
						var gridCallBack = function(gridID,paramsObj){
							var gridH = $('#gbox_'+gridID).height()+30;
							var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
							if(cellCount<4){
								cellCount=5;
							}
							paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
							paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
							paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
						};
						var defaultOptions = {
								minRowsPerPage:10,
								isSnapshotGrid: true,
								snapId: currentWidgetData.id,
								snapIndex:currentWidgetData.snapIndex,
								reload: false,
								pagination: false,
								selColIndex:[0]
						};
						var gridData = response.data;
						var sendObj = {};
						defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
						defaultOptions.criteria=response.widgetAdditionalData.criteria;
						defaultOptions.gridCallBack=gridCallBack;
						defaultOptions.gridCallBackParams={self:self};
						sendObj.gridId = "opm_fwa_bar_table"+currentWidgetData.id;//No I18N
						sendObj.snapid = currentWidgetData.id;
						sendObj.data = gridData;
						sendObj.defaultOptions = defaultOptions;
						if(response.widgetAdditionalData.chartType == "bar"){
							var colDetail=getFWABarColDetails(response);
							sendObj.colNames = colDetail.colNameList;
							sendObj.colModels = colDetail.colModelList;
						}else{
							sendObj.colNames = response.widgetAdditionalData.colList;
							sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length,response.widgetAdditionalData);
							
						}
						if(inventorysnapType != "FirewallUsers" && inventorysnapType != "FirewallRules" && (fwaSnapShotWithCategory.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1) && (fwaSnapShotWithCategoryNSeries.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1)){
							if(response.linkingRBBG != undefined ){
								defaultOptions.rbbtext="RBBG";//No I18N
								defaultOptions.rbbid=response.linkingRBBG;
								sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
								if(sendObj.colModels != undefined && sendObj.colModels[0] !=undefined){
									sendObj.colModels[0].classes="pointer";//No I18N
								}
							}else if(response.linkingRBB != undefined){
								defaultOptions.rbbtext="RBB";//No I18N
								defaultOptions.rbbid=response.linkingRBB;
								sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
								if(sendObj.colModels != undefined && sendObj.colModels[0] !=undefined){
									sendObj.colModels[0].classes="pointer";//No I18N
								}
							}
						}
						sendObj.captionTitle = "";
						sendObj.gridNavigator = "";
//						sendObj.onSelectFunction = snapDetails.snapshotData.onselectfunction !== undefined ? snapDetails.snapshotData.onselectfunction : "";//No I18N
						self.set('widgetData.tblRecCount',response.records);//No I18N
						sendObj.page = "";
						self.set('showWidget',true);//No I18N
						self.set('showGrid',true);//No I18N
						self.set('widgetData.noData',false);//No I18N
						self.set('widgetData.gridDataArray',sendObj);//No I18N
					}
				}else{
					self.set('showWidget',false);//No I18N
					self.set('widgetData.noData',true);//No I18N
					self.set('widgetData.sizey',2);//No I18N
					self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
					self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
				}
			}else{
				self.set('showWidget',false);//No I18N
				self.set('widgetData.noData',true);//No I18N
				self.set('widgetData.sizey',2);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);// NO i18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
			}
		}else{
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);// NO i18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
		}
	
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});
OPMClient.OpmFWAReportListComponent = Ember.Component.extend({
	showGrid: false,
	didInsertElement:function() {
		if(OPMClient.FWAGlobalDataController.timePeriod==undefined) {
			OPMClient.FWAGlobalDataController.timePeriod ='today';//No I18N
		}

		var reload = true;
		var shortSummary = false;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		var currentWidgetData = this.widgetData;
		var snapId = currentWidgetData.id;
		var widgetElement=$('div[data-widget-id="' + snapId + '"]');
		widgetElement.addClass("dashboardWidget fullCol");
		widgetElement.find('*').remove();
		OPMClient.InventoryDeviceDetailsController.snapshotData = self.snapshotObj.snapDetails;
		var $graphs = $("<div id='snapHolder_"+snapId+"' style='width:100%;display:table;'></div>");
		self.set('widgetData.widgetLoaded',0);//No I18N
		self.set('widgetData.sizey',0);//No I18N
		var resolveDNSOpt="1";
		if(this.get('widgetData.apiData') != undefined && this.get('widgetData.apiData.fwaresolveDNSOpt') != undefined){
			resolveDNSOpt=this.get('widgetData.apiData.fwaresolveDNSOpt');
		}
		if(jsonData.reportList.length > 0) {
			self.set('widgetData.widgetCount',jsonData.reportList.length);//No I18N
			if(self.snapshotObj.shortSummary) {
				shortSummary = true;
			}
			widgetElement.append($graphs);
			var pieWidgetArr=[];
			var otherWidContent=[];
			var gridWidget=[];
			var graphWidget=[];
			for (var indexi = 0; indexi < jsonData.reportList.length; indexi++) {
				var array_elementi = jsonData.reportList[indexi];
				array_elementi.widId="FWAReportGraphs_"+snapId+"_"+indexi;//No I18N
				if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.chartType == "pie"){
					pieWidgetArr.push(array_elementi);
				}else if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.chartType == "bar"){//No I18N
					otherWidContent.push(array_elementi);
				}else if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.chartType == "timeseries"){//No I18N
					graphWidget.push(array_elementi);
				}else if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.isTableData == "true"){//No I18N
					gridWidget.push(array_elementi);
				}else{
					gridWidget.push(array_elementi);
				}
			}			
			for(var gwid=0;gwid < graphWidget.length;gwid++){
				var widElement=graphWidget[gwid];
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i class=\"icon-mail widget_edit\" title='"+Ember.I18n.t('webclient.availability.icontext.email',this)+"' id='mailpdf_"+widElement.widId+"'></i><i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerFullCol; ' id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');//NO I18N
				// }
				$graphs.append($graph);
				loadClickEventForRefreshButton(widElement,self);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,"",self,jsonData.reportList.length);
				if(shortSummary) {
					$('#snapHolder_'+snapId).find('.dashboardWidgetIcons').remove();
					return;    
				}
			}
			
			for(var pwid=0;pwid < pieWidgetArr.length;pwid++){
				var widElement=pieWidgetArr[pwid];
				var resolveStatus=false;
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				if(resolveDNSOpt == "0"){
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn disabledDiv"><input type="checkbox" disabled="disabled" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}else if(resolveDNSOpt == "2"){
					resolveStatus=true;
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input checked="true" type="checkbox" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-mail widget_edit\" title='"+Ember.I18n.t('webclient.availability.icontext.email',this)+"' id='mailpdf_"+widElement.widId+"'></i><i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				// }
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement,self);
				loadClickEventForRefreshButton(widElement,self);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,resolveStatus,self,jsonData.reportList.length);
			}
			
			for(var cwid=0;cwid < otherWidContent.length;cwid++){
				var widElement=otherWidContent[cwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				var resolveStatus=false;
				if(resolveDNSOpt == "0"){
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn disabledDiv"><input type="checkbox" disabled="disabled" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}else if(resolveDNSOpt == "2"){
					resolveStatus=true;
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input checked="true" type="checkbox" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerHalfCol'  id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-mail widget_edit\" title='"+Ember.I18n.t('webclient.availability.icontext.email',this)+"' id='mailpdf_"+widElement.widId+"'></i><i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerHalfCol'  id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				// }
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement,self);
				loadClickEventForRefreshButton(widElement,self);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,resolveStatus,self,jsonData.reportList.length);
			}
			
			for(var gwid=0;gwid < gridWidget.length;gwid++){
				var widElement=gridWidget[gwid];
				var widgetId=widElement.widId.replace("FWAReportGraphs","opm_App_Legend");
				var fileHeader=widElement.rbbTitle; 
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				var resolveStatus=false;
				if(resolveDNSOpt == "0"){
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn disabledDiv"><input type="checkbox" disabled="disabled" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}else if(resolveDNSOpt == "2"){
					resolveStatus=true;
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input checked="true" type="checkbox" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerFullCol'  id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div class='smallIcon'><div>"+resolveBut+"<i class=\"icon-mail widget_edit\" title='"+Ember.I18n.t('webclient.availability.icontext.email',this)+"' id='mailpdf_"+widElement.widId+"'></i><i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i class=\"opmIconDownloadFile opmIconcsv\" tabId='"+widgetId+"' dispName='"+fileHeader+"' title='"+Ember.I18n.t('jsp.commonstr.ExportTocsv',this)+"'  id='gencsv_"+widElement.widId+"'></i><i class=\"opmIconDownloadFile opmIconExcel\" tabId='"+widgetId+"' dispName='"+fileHeader+"'   id='genxls_"+widElement.widId+"' title='"+Ember.I18n.t('webclient.reports.header.xlview',this)+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerFullCol'  id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				// }
				OPMClient.FWAReportsDetailsController.reportList.push(fileHeader);
				OPMClient.FWAReportWidgetLoadingController.singWidTabId.push(widgetId);
				if($(".intfSubTabs li.active").attr("data-tabname")!=undefined){
					OPMClient.FWAReportsDetailsController.repTitle=Ember.I18n.t($(".intfSubTabs li.active").attr("data-tabname"));
				}
				else if($("#nameOnly").text()!=undefined){
					OPMClient.FWAReportsDetailsController.repTitle=$("#nameOnly").text();
				}
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement,self);
				loadClickEventForRefreshButton(widElement,self);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,resolveStatus,self,jsonData.reportList.length);
			}
		} else {
			self.set('widgetData.widgetCount',0);//No I18N
			self.set('widgetData.sizey',2);
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);
		}
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
		OPMClient.FWAReportWidgetLoadingController.singWidTabId=[];
		OPMClient.FWAReportsDetailsController.reportList=[];
		OPMClient.FWAReportsDetailsController.repTitle=[];
		
	}
});

OPMClient.OpmFWAReportListOnDemandComponent = Ember.Component.extend({
	showGrid: false,
	didInsertElement:function() {
		if(OPMClient.FWAGlobalDataController.timePeriod==undefined) {
			OPMClient.FWAGlobalDataController.timePeriod ='today';//No I18N
		}
		var reload = true;
		var shortSummary = false;
		var self = this;
		var jsonData = this.get('widgetData.apiData');
		var currentWidgetData = this.widgetData;
		var snapId = currentWidgetData.id;
		OPMClient.InventoryDeviceDetailsController.snapshotData = self.snapshotObj.snapDetails;
		var $graphs = $("<div id='snapHolder_"+snapId+"' style='width:100%;display:table;'></div>");
		self.set('widgetData.widgetLoaded',0);//No I18N
		self.set('widgetData.sizey',0);//No I18N
		var resolveDNSOpt="1";
		if(this.get('widgetData.apiData') != undefined && this.get('widgetData.apiData.fwaresolveDNSOpt') != undefined){
			resolveDNSOpt=this.get('widgetData.apiData.fwaresolveDNSOpt');
		}
		if(jsonData.reportList!==undefined && jsonData.reportList.length > 0) {
			self.set('widgetData.widgetCount',jsonData.reportList.length);//No I18N
			var widgetElement=$('div[data-widget-id="' + snapId + '"]');
			widgetElement.addClass("dashboardWidget fullCol");
			widgetElement.find('*').remove();
			widgetElement.append($graphs);
			var pieWidgetArr=[];
			var otherWidContent=[];
			var gridWidget=[];
			var graphWidget=[];
			for (var indexi = 0; indexi < jsonData.reportList.length; indexi++) {
				var array_elementi = jsonData.reportList[indexi];
				array_elementi.widId="FWAReportGraphs_"+snapId+"_"+indexi;//No I18N
				if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.chartType == "pie"){
					pieWidgetArr.push(array_elementi);
				}else if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.chartType == "bar"){//No I18N
					otherWidContent.push(array_elementi);
				}else if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.chartType == "timeseries"){//No I18N
					graphWidget.push(array_elementi);
				}else if(array_elementi.widgetAdditionalData != undefined && array_elementi.widgetAdditionalData.isTableData == "true"){//No I18N
					gridWidget.push(array_elementi);
				}else{
					gridWidget.push(array_elementi);
				}
			}			
			for(var gwid=0;gwid < graphWidget.length;gwid++){
				var widElement=graphWidget[gwid];
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\"  id='refresh_Button"+widElement.widId+"' ></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');//NO I18N
				// }
				$graphs.append($graph);
				loadClickEventForRefreshButton(widElement,self);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,"",self,jsonData.reportList.length);
				if(shortSummary) {
					return;    
				}
			}
			
			for(var pwid=0;pwid < pieWidgetArr.length;pwid++){
				var widElement=pieWidgetArr[pwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				var resolveStatus=false;
				if(resolveDNSOpt == "0"){
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn disabledDiv"><input type="checkbox" disabled="disabled" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}else if(resolveDNSOpt == "2"){
					resolveStatus=true;
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input checked="true" type="checkbox" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerFullCol' id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				// }
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement,self);
				loadClickEventForRefreshButton(widElement,self);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,resolveStatus,self,jsonData.reportList.length);
				if(shortSummary) {
					return;    
				}
			}
			
			for(var cwid=0;cwid < otherWidContent.length;cwid++){
				var widElement=otherWidContent[cwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				var resolveStatus=false;
				if(resolveDNSOpt == "0"){
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn disabledDiv"><input type="checkbox" disabled="disabled" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}else if(resolveDNSOpt == "2"){
					resolveStatus=true;
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input checked="true" type="checkbox" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerHalfCol'  id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerHalfCol'  id='fwa_inventory_widget_"+widElement.widId+"' ><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				// }
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement,self);
				loadClickEventForRefreshButton(widElement,self);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,resolveStatus,self,jsonData.reportList.length);
				if(shortSummary) {
					return;    
				}
			}
			
			for(var gwid=0;gwid < gridWidget.length;gwid++){
				var widElement=gridWidget[gwid];
				var resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input type="checkbox"  id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				var resolveStatus=false;
				if(resolveDNSOpt == "0"){
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn disabledDiv"><input type="checkbox" disabled="disabled" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}else if(resolveDNSOpt == "2"){
					resolveStatus=true;
					resolveBut = '<div class="widgetchkRoundBtn"><div class="chkRoundBtn"><input checked="true" type="checkbox" id="resolveDNS_'+widElement.widId+'" name="ResolveDNS" ><label>'+Ember.I18n.t("opu.common.RESOLVE_DNS",this)+'</label></div></div>';//No I18N
				}
				// if($('body').hasClass('chrome')){
					var $graph = $("<div class='gridStack-innerFullCol'  id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i class=\"icon-file-pdf widget_edit \" title='"+Ember.I18n.t('jsp.commonstr.ExportToPdf',this)+"' id='genpdf_"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');	
				// }else{
				// 	var $graph = $("<div class='gridStack-innerFullCol'  id='fwa_inventory_widget_"+widElement.widId+"'><div class='opm_widget_title'>"+widElement.rbbTitle+"<div class='dashboardWidgetIcons'><div><div>"+resolveBut+"<i title='"+Ember.I18n.t('webclient.general.reload',this)+"' class=\"icon-ccw widget_refresh\" id='refresh_Button"+widElement.widId+"'></i><i title='"+Ember.I18n.t('webclient.general.expand',this)+"' class=\"icon-down-dir widget_expand\"  id='exp_Button"+widElement.widId+"' ></i></div></div></div></div>" + '<div class="content" id="'+widElement.widId+'" class="fwainvWdiget"></div></div>');
				// }
				$graphs.append($graph);
				loadClickEventForResolveDNS(widElement,self);
				loadClickEventForRefreshButton(widElement,self);
//				loadClickEventForExpButton(widElement);
				loadFWAReportGraph(widElement, widElement.widId, widElement.rbbTitle,resolveStatus,self,jsonData.reportList.length);
				if(shortSummary) {
					return;    
				}
			}
		} else {
			self.set('widgetData.widgetCount',0);//No I18N
			self.set('widgetData.sizey',2);
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);

		}
	},
	willDestroyElement:function() {
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmFwaRemotegridComponent = Ember.Component.extend({
	templateName: "components/opm-common-remotegrid",//No I18N
	didInsertElement: function(){
		var gridData = this.get('gridData');
		OPMClient.Inventory.loadInvExpandTableWidget(gridData);
		$("#srchInv").keyup(function(e) {
			if(e.which == 13) {
				OPMClient.Inventory.loadInvExpandTableWidget(gridData);
			}
		});
	},
	willDestroyElement: function(){
		
	},
	actions :{
		reloadRemoteGrid: function(){
			$("#srchInv").val("");
			var gridData = this.get('gridData');
			OPMClient.Inventory.loadInvExpandTableWidget(gridData);
		}
	}
});

OPMClient.OpmFwaGraphTableComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-graph-table",//No I18N
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
		
	}
});

OPMClient.OpmFWARuleMgmtDeviceScoreComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-rule-mgmt-device-score",//No I18N
	jsonData:{},
	activeRating: 'security',//No I18N
	activeTab: 'dimension',//No I18N
	securityDimensions: [],
	baselineDimensions: [],
	regulatoryDimensions: [],
	isSecurityActive: function(){ return this.get('activeRating') === 'security'; }.property('activeRating'),//No I18N
	isBaselineActive: function(){ return this.get('activeRating') === 'baseline'; }.property('activeRating'),//No I18N
	isRegulatoryActive: function(){ return this.get('activeRating') === 'regulatory'; }.property('activeRating'),//No I18N
	isDimensionTabActive: function(){return this.get('activeTab') === 'dimension'; }.property('activeTab'),//No I18N
	isCalculationTabActive: function(){return this.get('activeTab') === 'calculation'; }.property('activeTab'),//No I18N
	getStatus: function(score){
		if(score == null){ return { color: 'red', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.risky',this) }; }//No I18N
		if(score < 50){ return { color: 'red', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.risky',this) }; }//No I18N
		if(score < 80){ return { color: 'orange', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.needsReview',this) }; }//No I18N
		return { color: 'green', text: Ember.I18n.t('webclient.fwa.rulemgmt.device.score.healthy',this) };//No I18N
	},
	buildDimensions: function(rating){
		var dims = (rating && rating.dimensions) || [];
		var rows = [];
		var firstActiveIdx = -1;
		for(var ai = 0; ai < dims.length; ai++){
			var aDim = dims[ai] || {};
			if(aDim.isReportGenerated === undefined || aDim.isReportGenerated === true){
				firstActiveIdx = ai;
				break;
			}
		}
		for(var i = 0; i < dims.length; i++){
			var dim = dims[i];
			var weight = (dim.weight != null) ? dim.weight : 0;
			var weightedScore = (dim.weightedScore != null) ? dim.weightedScore : 0;
			var pct = weight > 0 ? (weightedScore / weight) * 100 : 0;
			var status = this.getStatus(pct);
			var calc = dim.calculationLogic || {};
			var lines = [];
			if(calc.formula != null){ lines.push("Formula = "+String(calc.formula)); }//No I18N
			var steps = calc.steps;
			if(steps && typeof steps === 'object'){
				for(var k in steps){
					if(steps.hasOwnProperty(k) && k !== 'result'){//No I18N
						lines.push(k + ' = ' + steps[k]);//No I18N
					}
				}
				if(steps.hasOwnProperty('result')){//No I18N
					lines.push('result = ' + steps.result);//No I18N
				}
			}
			var formula = lines.join('\n');//No I18N
			var tableRows = [];
			var raw = dim.rawInputCounts;
			var rawLabels = dim.rawInputCountLabels || {};
			var rawOrder = dim.orderByColumns;
			if(raw && typeof raw === 'object'){
				if(rawOrder && Array.isArray(rawOrder)){
					for(var ri = 0; ri < rawOrder.length; ri++){
						var rk = rawOrder[ri];
						if(raw.hasOwnProperty(rk)){
							var lbl = (rawLabels && rawLabels.hasOwnProperty(rk) && rawLabels[rk] != null) ? rawLabels[rk] : rk;
							tableRows.push({ label: lbl, value: raw[rk] });
						}
					}
				}else{
					for(var rk in raw){
						if(raw.hasOwnProperty(rk)){
							var lbl = (rawLabels && rawLabels.hasOwnProperty(rk) && rawLabels[rk] != null) ? rawLabels[rk] : rk;
							tableRows.push({ label: lbl, value: raw[rk] });
						}
					}
				}
			}
			var rawScore = (dim.rawScore != null) ? dim.rawScore : 0;
			rows.push({
				title: dim.name || '',
				key: dim.key || '',
				weightLabel: weight + '% weight',//No I18N
				scoreLabel: weightedScore + '/' + weight,
				scoreClass: 'fwa-score-details-score fwa-score-details-score--' + status.color,//No I18N
				dotClass: 'fwa-score-legend__dot fwa-score-legend__dot--' + status.color,//No I18N
				barClass: 'fwa-score-details-bar__fill fwa-score-details-bar__fill--' + status.color,//No I18N
				barStyle: 'width:' + pct + '%',//No I18N
				isActive: false,
				formula: formula,
				tableRows: tableRows,
				rawScoreLabel: rawScore + '/100',
				isReportGenerated: (dim.isReportGenerated === undefined) ? true : dim.isReportGenerated,
				reportNotGeneratedMsg: (dim.isReportGenerated === undefined) ? '' : dim.reportNotGeneratedMsg || ''
			});
		}
		return rows;
	},
	recalcWidgetSize: function(){
		var self = this;
		var currentWidgetData = this.widgetData;
		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
			setTimeout(function(){
				var widgetEl = document.getElementById(currentWidgetData.widgetElementID);
				var summaryEl = widgetEl ? widgetEl.querySelector('.fwa-score-section') : null;//No I18N
				var summaryHeight = summaryEl ? summaryEl.offsetHeight : $('.fwa-score-section').height();
				var cellCount = Math.floor((summaryHeight+10)/(self.snapshotObj.snapDetails.yScale+10));
				if(cellCount < 10 ){ cellCount = 10; }
				self.set('widgetData.sizey',cellCount); // No i18n
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
			}, 300);
		});
	},
	didInsertElement: function(){
		var self = this;
		var currentWidgetData = this.widgetData;
		$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').hide();
		$('#'+currentWidgetData.widgetElementID+' .singleInvWidget').css("padding-top", "10px");

		// Populate rating percentages from apiData.ratings (treat null as 0)
		var ratings = (currentWidgetData.apiData && currentWidgetData.apiData.ratings) || {};
		var securityScore = (ratings.security && ratings.security.score != null) ? ratings.security.score : 0;
		var baselineScore = (ratings.baseline && ratings.baseline.score != null) ? ratings.baseline.score : 0;
		var regulatoryScore = (ratings.regulatory && ratings.regulatory.score != null) ? ratings.regulatory.score : 0;

		// Bind dimension arrays to component (template renders via {{#each}})
		self.set('securityDimensions', self.buildDimensions(ratings.security));//No I18N
		self.set('baselineDimensions', self.buildDimensions(ratings.baseline));//No I18N
		self.set('regulatoryDimensions', self.buildDimensions(ratings.regulatory));//No I18N

		var widgetEl = document.getElementById(currentWidgetData.widgetElementID);
		if(widgetEl){
			var setScore = function(percentId, circleId, badgeId, cardId, score){
				var status = self.getStatus(score);
				var percentEl = widgetEl.querySelector('#' + percentId);
				if(percentEl){
					percentEl.textContent = score + '%';
					percentEl.className = 'fwa-score-percent fwa-score-percent--' + status.color;
				}
				var circleEl = widgetEl.querySelector('#' + circleId);
				if(circleEl){ circleEl.setAttribute('stroke-dashoffset', 282.74 * (1 - score / 100)); }
				var badgeEl = widgetEl.querySelector('#' + badgeId);
				if(badgeEl){
					badgeEl.textContent = status.text;
					badgeEl.className = 'fwa-score-badge fwa-score-badge--' + status.color;
				}
				var cardEl = widgetEl.querySelector('#' + cardId);
				if(cardEl){
					var modMap = { red: 'fwa-score-card--risky', orange: 'fwa-score-card--review', green: 'fwa-score-card--compliant' };//No I18N
					cardEl.classList.remove('fwa-score-card--risky', 'fwa-score-card--review', 'fwa-score-card--compliant');//No I18N
					if(modMap[status.color]){ cardEl.classList.add(modMap[status.color]); }
				}
			};
			setScore('SecurityRatingPercent', 'SecurityRating', 'SecurityRatingBadge', 'SecurityRatingCard', securityScore);//No I18N
			setScore('BaselineRatingPercent', 'BaselineRating', 'BaselineRatingBadge', 'BaselineRatingCard', baselineScore);//No I18N
			setScore('RegulatoryRatingPercent', 'RegulatoryRating', 'RegulatoryRatingBadge', 'RegulatoryRatingCard', regulatoryScore);//No I18N
		}

		Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
			var widgetEl = document.getElementById(currentWidgetData.widgetElementID);
			var summaryEl = widgetEl ? widgetEl.querySelector('.fwa-score-section') : null;//No I18N
			var summaryHeight = summaryEl ? summaryEl.offsetHeight : $('.fwa-score-section').height();
			var cellCount = Math.floor((summaryHeight+10)/(self.snapshotObj.snapDetails.yScale+10));
			self.set('widgetData.sizey',cellCount); // No i18n
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
		});
	},
	actions:{
		redirectReppage:function(key,isReportGenerated){
			var standardWid = ["NERC_CIP", "GSMA", "PCI_DSS", "ISO", "GLBA", "NIS_2", "SOC_2_TYPE_II", "CIS_CONTROLS_V8", "CJIS", "BASEL_II", "SANS", "HIPAA", "NIST", "SOX", "GDPR"];//NO I18N
			
			var standardUrlMap = {
				"NERC_CIP": "NERC-CIP",//No I18N
				"GSMA": "GSMA",//No I18N
				"PCI_DSS": "PCI DSS",//No I18N
				"ISO": "ISO",//No I18N
				"GLBA": "GLBA",//No I18N
				"NIS_2": "NIS 2",//No I18N
				"SOC_2_TYPE_II": "SOC 2 Type II",//No I18N
				"CIS_CONTROLS_V8": "CIS Controls v8",//No I18N
				"CJIS": "CJIS",//No I18N
				"BASEL_II": "BASEL-II",//No I18N
				"SANS": "SANS",//No I18N
				"HIPAA": "HIPAA",//No I18N
				"NIST": "NIST",//No I18N
				"SOX": "SOX",//No I18N
				"GDPR": "GDPR"//No I18N
			}
			OPMClient.FWAReportsDetailsController.fromInvPage=true;
			if(key == "LOGGING"){
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'policyStat';//NO I18N
				OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
			}else if(key == "RISKY_RULES"){//No I18N
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
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARiskAnalysis";//No I18N
			}else if(key == "EXPIRED_RULES"){//NO I18N
				OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARuleExpiry";//No I18N
			}else if(key == "ANOMALIES"){//NO I18N
				OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Optimization";//No I18N
			}else if(key == "SEC_AUDIT"){//NO I18N
				OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				location.href=window.OPM.apiclientUrl+"FWACompliance/SecAudit/Report";//No I18N
			}else if (standardWid.indexOf(key) > -1) {
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				location.href=window.OPM.apiclientUrl+"FWACompliance/Standards";//No I18N
			}
		},
		selectRating: function(ratingKey){
			this.set('activeRating', ratingKey);//No I18N
			this.recalcWidgetSize();
		},
		redirectToSettings:function(){
			location.href=window.OPM.apiclientUrl+"Settings/FirewallConfig/FWA/DeviceScore";//No I18N
		},
		selectTab: function(tabKey){
			this.set('activeTab', tabKey);//No I18N
			this.recalcWidgetSize();
		},
		toggleCalcRow: function(row){
			var key = this.get('activeRating');//No I18N
			var arr = this.get(key + 'Dimensions');//No I18N
			if(!arr){ return; }
			var wasActive = row && row.isActive;
			for(var i = 0; i < arr.length; i++){
				Ember.set(arr[i], 'isActive', !wasActive && arr[i] === row);//No I18N
			}
			this.recalcWidgetSize();
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmFWARuleMgmtSummaryComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-rule-mgmt-summary",//No I18N
	jsonData:{},
	showWidget:false,
	showGraph:false,
	showGrid:false,
	isDeviceSummary:true,
	initDefaults: function() {
		var self = this;
		if(self.snapshotObj.snapType == "FWADeviceRuleMgmt"){
			self.set('isDeviceSummary',true);//No I18N
		}else{
			self.set('isDeviceSummary',false);//No I18N
		}
	}.on("init"), //NO I18N 
	didInsertElement: function(){
		var self = this;
		var currentWidgetData = this.widgetData;
		$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').hide();
		$('#'+currentWidgetData.widgetElementID+' .singleInvWidget').css("padding-top", "10px");

		var stats = (currentWidgetData.apiData && currentWidgetData.apiData.SUMMARY_STATS) || {};
		var buildChange = function(src, addedKey, modifiedKey, deletedKey){
			var added = (src && src[addedKey] != null) ? Number(src[addedKey]) || 0 : 0;
			var modified = (src && src[modifiedKey] != null) ? Number(src[modifiedKey]) || 0 : 0;
			var deleted = (src && src[deletedKey] != null) ? Number(src[deletedKey]) || 0 : 0;
			var total = added + modified + deleted;
			var pct = function(n){ return total > 0 ? (n * 100 / total) : 0; };
			return {
				added: added,
				modified: modified,
				deleted: deleted,
				total: total,
				totalLabel: total + ' '+Ember.I18n.t('webclient.fwa.rulemgmt.total.change',this),//No I18N
				addedStyle: 'width:' + pct(added) + '%',//No I18N
				modifiedStyle: 'width:' + pct(modified) + '%',//No I18N
				deletedStyle: 'width:' + pct(deleted) + '%',//No I18N
				showEmptyBar: total === 0
			};
		};
		self.set('configChange', buildChange(stats.CONFIG_CHANGE_STATS, 'cm_added', 'cm_modified', 'cm_deleted'));//No I18N
		self.set('ruleChange', buildChange(stats.RULE_CHANGE_STATS, 'added', 'modified', 'deleted'));//No I18N

		var unassignedStats = stats.UNASSIGNED_STATS || {};
		var interfaceCount = (unassignedStats.InterfaceDetails != null) ? Number(unassignedStats.InterfaceDetails) || 0 : 0;
		var firewallObjCount = (unassignedStats.FirewallObjects != null) ? Number(unassignedStats.FirewallObjects) || 0 : 0;
		self.set('totalUnassigned', interfaceCount + firewallObjCount);//No I18N

		self.set('widgetData.sizey',5);//No I18N
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
		self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
	},
	actions:{
		redirectRuleManagementTab: function(widType){

			OPMClient.FWAReportsDetailsController.fromInvPage=true;
			if(widType == "Overview"){
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'allPolicy';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
			}else if(widType == "ObjectDetail"){//No I18N
				OPMClient.FWARuleMgmtObjectDetailController.selVal = "Network";//NO I18N
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'objDetails';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
			}else if(widType == "NetworkObjectDetail"){//No I18N
				OPMClient.FWARuleMgmtObjectDetailController.selVal = "Network";//NO I18N
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'objDetails';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
			}else if(widType == "ServiceObjectDetail"){//No I18N
				OPMClient.FWARuleMgmtObjectDetailController.selVal = "Service";//NO I18N
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'objDetails';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
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
			}else if(widType == "Expiry"){//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARuleExpiry";//No I18N
			}else if(widType == "ChangeMgmt"){//NO I18N
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				location.href=window.OPM.apiclientUrl+"FWACompliance/ChangeManagement";//No I18N
			}else if(widType == "Unassinged Interface"){//NO I18N
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'Unassinged Interface';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Unused";//No I18N
			}else if(widType == "Unassinged Objects"){//NO I18N
				OPMClient.FWAReportsDetailsController.ruleMgmtSubTab = 'Unassinged Objects';//NO I18N
				if(OPMClient.InventoryDeviceDetailsController.inventorysnapType == "FWADeviceRuleMgmt"){
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=false;
					OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				}else{
					OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected=true;
					OPMClient.FWARuleMgmtDeviceSelectionController.devGrpId=parseInt(OPMClient.InventoryDeviceDetailsController.deviceName);
				}
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Unused";//No I18N
			}else if(widType == "Configchange"){//NO I18N
				OPMClient.FWAReportConfigBackupAuditController.selDevId=OPMClient.InventoryDeviceDetailsController.deviceName;
				OPMClient.FWAGlobalDataController.timePeriod = '24Hour';//No I18N
				location.href=window.OPM.apiclientUrl+"FWACompliance/ConfigBackup/BackupAudit";//No I18N
			}else if(widType == "Rulechange"){//NO I18N
				OPMClient.FWAComplianceDetailsController.selrid=OPMClient.InventoryDeviceDetailsController.deviceName;
				OPMClient.FWAGlobalDataController.timePeriod = '24Hour';//No I18N
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARuleTracking/Dashboard";//No I18N
			}
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmFWARuleMgmtGridComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-rule-mgmt-grid",//No I18N
	jsonData:{},
	showGraph:false,
	showRiskGrid:false,
	widType:"",
	initDefaults: function() {
		
		var self = this;
		var currentWidgetData = this.widgetData;
		var widParams=currentWidgetData.parameters;
		var widType="";
		$.each(widParams, function(i, item){
			if(item.param == "type"){
				widType=item.value;
			}
		});
		self.set('widType',widType);//No I18N
		if(widType == "Standards"){
			self.set('showGraph',false);//No I18N
			self.set('showRiskGrid',true);//No I18N
		}else if(widType == "Risk"){//No I18N
			self.set('showGraph',true);//No I18N
			self.set('showRiskGrid',true);//No I18N
		}else{
			self.set('showGraph',true);//No I18N
			self.set('showRiskGrid',false);//No I18N
		}
	}.on("init"), //NO I18N 
	didInsertElement: function(){
		var self = this;
		var apiResponse = this.get('widgetData').apiData;
		var currentWidgetData = this.widgetData;
		var widParams=currentWidgetData.parameters;
		var widType="";
		$.each(widParams, function(i, item){
			if(item.param == "type"){
				widType=item.value;
			}
		});
		var detMap={};
		var gridData=[];
		var chartData=[];
		var colNameList=[];
		var colModelList=[];
		if(widType == "Overview"){
			detMap={};
			detMap.Total_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.total.rules',this);//No I18N
			detMap.Allowed_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.allowed.rules',this);//No I18N
			detMap.Denied_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.denied.rules',this);//No I18N
			detMap.Inbound_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.inbound.rules',this);//No I18N
			detMap.Outbound_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.outbound.rules',this);//No I18N
			detMap.Disabled_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.inactive.rules',this);//No I18N
			detMap.Logging_Disabled_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.logging.rules',this);//No I18N
			detMap.Any_To_Any_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.anytoany.rules',this);//No I18N
			detMap.Any_Services_Rules_Count=Ember.I18n.t('webclient.fwa.rulemgmt.anyservices.rules',this);//No I18N
	        detMap.Bidirectional_Rules_Count= Ember.I18n.t('webclient.fwa.rulemgmt.bidirectional.rules',this);//No I18N
	       
	        var ruleStats= (apiResponse.response != undefined && apiResponse.response.RULES_STATS!= undefined) ? apiResponse.response.RULES_STATS : {};
	        $.each(detMap, function(idx, val)
			{
	        	var i18nStr=val;
	        	if(ruleStats[idx] != undefined){
	        		var value=ruleStats[idx];
		        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
		        	gridData.push({"stat":i18nStr,"value":value});
	        	}
			});
	        colNameList=[Ember.I18n.t('fwa.compliance.Stat',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
	        colModelList=[
	                      {"name":"stat","index":"stat"},//No I18N
	                      {"name":"value","index":"value"}//No I18N
	                      ];
	        
	        var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
				if(cellCount <= 10){
					cellCount=10;
				}
				if(window.OPM.isNewSnapshotPage){
					cellCount = Math.ceil((gridH+42)/22);
				}
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			};
			var defaultOptions = {
					isSnapshotGrid: true,
					snapId: currentWidgetData.id,
					snapIndex:currentWidgetData.snapIndex,
					reload: false,
					pagination: false
			};
			var sendObj={};
			
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			sendObj.gridId = 'opm_App_Legend'+currentWidgetData.id;//No I18N
			sendObj.data = gridData;
			sendObj.colModels = colModelList;
			sendObj.colNames = colNameList;
			sendObj.defaultOptions = defaultOptions;
			self.set('gridData',sendObj);//No I18N
			
			
		}else if(widType == "Risk"){//No I18N
			detMap={};
			detMap.critical= Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this);//No I18N
			detMap.high= Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this);//No I18N
			detMap.medium= Ember.I18n.t('webclient.Medium',this);//No I18N
			detMap.low= Ember.I18n.t('webclient.ncm.tab.Low',this);//No I18N
			detMap.attention= Ember.I18n.t('webclient.admin.traps.attention',this);//No I18N
	       
	        var ruleStats= (apiResponse.response != undefined && apiResponse.response.RISK_STATS!= undefined) ? apiResponse.response.RISK_STATS : {};
	        $.each(detMap, function(idx, val)
			{
	        	var i18nStr=val;
	        	if(ruleStats[idx] != undefined){
	        		var value=ruleStats[idx];
		        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
		        	gridData.push({"stat":i18nStr,"value":value});
	        	}
			});
	        colNameList=[Ember.I18n.t('webclient.fault.alarm.category',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
	        colModelList=[
	                      {"name":"stat","index":"stat"},//No I18N
	                      {"name":"value","index":"value"}//No I18N
	                      ];
	        
	        var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
				if(cellCount <= 13){
					cellCount=13;
				}
				if(window.OPM.isNewSnapshotPage){
					cellCount = Math.ceil((gridH+42)/22);
				}
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			};
			var defaultOptions = {
					isSnapshotGrid: true,
					snapId: currentWidgetData.id,
					snapIndex:currentWidgetData.snapIndex,
					reload: false,
					pagination: false
			};
			var sendObj={};
			
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			sendObj.gridId = 'opm_App_Legend'+currentWidgetData.id;//No I18N
			sendObj.data = gridData;
			sendObj.colModels = colModelList;
			sendObj.colNames = colNameList;
			sendObj.defaultOptions = defaultOptions;
			self.set('gridData',sendObj);//No I18N
			
			
		}else if(widType == "Security"){//No I18N
			detMap={};
			detMap.CRITICAL_COUNT= Ember.I18n.t('webclient.ncm.clientserver.config.severity.Critical',this);//No I18N
			detMap.HIGH_COUNT= Ember.I18n.t('webclient.fwa.rule.approval.high.priority',this);//No I18N
			detMap.MEDIUM_COUNT= Ember.I18n.t('webclient.Medium',this);//No I18N
			detMap.LOW_COUNT= Ember.I18n.t('webclient.ncm.tab.Low',this);//No I18N
			detMap.INFORMATIONAL_COUNT= Ember.I18n.t('webclient.fwa.rulemgmt.informational',this);//No I18N
	        
	        var ruleStats= (apiResponse.response != undefined && apiResponse.response.AUDIT_STATS!= undefined) ? apiResponse.response.AUDIT_STATS : {};
		       
	        $.each(detMap, function(idx, val)
			{
	        	var i18nStr=val;
	        	if(ruleStats[idx] != undefined){
	        		var value=ruleStats[idx];
		        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
		        	gridData.push({"stat":i18nStr,"value":value});
	        	}
			});
	        colNameList=[Ember.I18n.t('webclient.fault.alarm.category',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
	        colModelList=[
	                      {"name":"stat","index":"stat"},//No I18N
	                      {"name":"value","index":"value"}//No I18N
	                      ];
	        
	        var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
				if(cellCount <= 13){
					cellCount=13;
				}
				if(window.OPM.isNewSnapshotPage){
					cellCount = Math.ceil((gridH+42)/22);
				}
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			};
			var defaultOptions = {
					isSnapshotGrid: true,
					snapId: currentWidgetData.id,
					snapIndex:currentWidgetData.snapIndex,
					reload: false,
					pagination: false
			};
			var sendObj={};
			
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			sendObj.gridId = 'opm_App_Legend'+currentWidgetData.id;//No I18N
			sendObj.data = gridData;
			sendObj.colModels = colModelList;
			sendObj.colNames = colNameList;
			sendObj.defaultOptions = defaultOptions;
			self.set('gridData',sendObj);//No I18N
			
		}else if(widType == "Optimization"){//No I18N
			detMap={};
			detMap.Redundancy= Ember.I18n.t('webclient.fwa.Redundancy',this);//No I18N
			detMap.Generalization= Ember.I18n.t('webclient.fwa.Generalization',this);//No I18N
			detMap.Correlation= Ember.I18n.t('webclient.fwa.Correlation',this);//No I18N
			detMap.Shadow= Ember.I18n.t('webclient.fwa.Shadow',this);//No I18N
			detMap.Grouping= Ember.I18n.t('webclient.fwa.Grouping',this);//No I18N
	        
	        var anomalytats= (apiResponse.response != undefined && apiResponse.response.ANOMALY_STATS!= undefined) ? apiResponse.response.ANOMALY_STATS : {};
		    
	        $.each(detMap, function(idx, val)
			{
	        	var i18nStr=val;
	        	if(anomalytats[idx] != undefined){
	        		var value=anomalytats[idx];
		        	chartData.push({"data":[[i18nStr,value]],"seriesname":i18nStr,"yaxiscolumnorder":[0]});
		        	gridData.push({"stat":i18nStr,"value":value});
	        	}
			});
	        colNameList=[Ember.I18n.t('webclient.fault.alarm.category',this),Ember.I18n.t('webclient.common.widgets.eventcount',this)];//No I18N
	        colModelList=[
	                      {"name":"stat","index":"stat"},//No I18N
	                      {"name":"value","index":"value"}//No I18N
	                      ];
	        
	        var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
				if(cellCount <= 13){
					cellCount=13;
				}
				if(window.OPM.isNewSnapshotPage){
					cellCount = Math.ceil((gridH+42)/22);
				}
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			};
			var defaultOptions = {
					isSnapshotGrid: true,
					snapId: currentWidgetData.id,
					snapIndex:currentWidgetData.snapIndex,
					reload: false,
					pagination: false
			};
			var sendObj={};
			
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			sendObj.gridId = 'opm_App_Legend'+currentWidgetData.id;//No I18N
			sendObj.data = gridData;
			sendObj.colModels = colModelList;
			sendObj.colNames = colNameList;
			sendObj.defaultOptions = defaultOptions;
			self.set('gridData',sendObj);//No I18N
			
		}else if(widType == "Standards"){//No I18N
			detMap=["PCI DSS","SANS","NIST","ISO","NERC-CIP","SOX","HIPAA","GDPR","GLBA","BASEL-II","SOC 2 Type II","CIS Controls v8", "CJIS","GSMA","NIS 2"];//No I18N
	        
	        var standardstats= (apiResponse.response != undefined && apiResponse.response.Standard_STATS!= undefined) ? apiResponse.response.Standard_STATS : {};
		    
	        for(var ij=0;ij<detMap.length;ij++){
	        	var i18nStr=detMap[ij];
	        	if(standardstats[i18nStr] != undefined){
	        		var value=standardstats[i18nStr];
		        	gridData.push({"stat":i18nStr,"value":value});
	        	}
	        }
	        colNameList=[Ember.I18n.t('fwa.rulemgmt.standard.name',this),Ember.I18n.t('fwa.rulemgmt.standard.compliant.percent',this)];//No I18N
	        colModelList=[
	                      {"name":"stat","index":"stat"},//No I18N
	                      {"name":"value","index":"value",formatter:function fwaruleMgmtFormatter(cellValue, options, rowdata, action){//No I18N
	                    	  var datStatus=6-(Math.ceil(cellValue/20));
	                    	  return '<div class="right dataStatus" style="max-height:15px"><div class="ut-row dataStatus-'+datStatus+'" data-value="'+cellValue+'" style="width:'+cellValue+'%;"><span>'+cellValue+'%</span></div></div>';
						  }}
	                      ];
	        
	        var gridCallBack = function(gridID,paramsObj){
				var gridH = $('#gbox_'+gridID).height()+30;
				var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
				if(cellCount <= 13){
					cellCount=13;
				}
				if(window.OPM.isNewSnapshotPage){
					cellCount = Math.ceil((gridH+42)/22);
				}
				paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
			};
			var defaultOptions = {
					isSnapshotGrid: true,
					snapId: currentWidgetData.id,
					snapIndex:currentWidgetData.snapIndex,
					reload: false,
					pagination: false
			};
			var gridObj={};
			
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			gridObj.gridId = 'opm_App_Legend'+currentWidgetData.id+"risk";//No I18N
			gridObj.data = gridData;
			gridObj.colModels = colModelList;
			gridObj.colNames = colNameList;
			gridObj.defaultOptions = defaultOptions;
			self.set('widgetData.noData',false);//No I18N
			self.set('gridData',gridObj);//No I18N
			
		}
		if(widType != "Standards"){
			self.set('widgetData.noData',false);//No I18N
			var multiData = new Array();
			var graphParams = {};
			graphParams.id = 'perfGraph1'+currentWidgetData.id;//No I18N
			graphParams.data = chartData;
			graphParams.enableLegend = false;
			graphParams.datatype_1 = "ordinal";//No I18N
			graphParams.columnname_1 = Ember.I18n.t("webclient.fault.alarm.category",this);//No I18N
			graphParams.columnname_2 = Ember.I18n.t("webclient.report.hardware.value",this);//No I18N
			graphParams.graphType = 'bar';//No I18N
			graphParams.axes = { 
					"rotated": false, //No I18N	
					"xaxis": { //No I18N	
						"label": { //No I18N	
							"text": "" //No I18N	
						},
						"ticklabel": {//No I18N
							"rotation": 45,//No I18N
							"maxWidth": 75,//No I18N
							"marginLeft":0,//No I18N
							"marginRight":0//No I18N
						}
					},
					"yaxis": [ //No I18N	
					           {
					        	   "label": { //No I18N	
					        		   "text": Ember.I18n.t("webclient.common.widgets.eventcount",this) //No I18N	
					        	   }
					           }
					           ]
			}
			self.set('graphParams',graphParams);//No I18N
			self.set('chartType','bar');//No I18N
		}
	},
	willDestroyElement: function(){
		$('#'+this.elementId).find('*').remove();
	}
});

OPMClient.OpmFWACompleteDataComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-complete-data",//No I18N
	jsonData:{},
	showWidget:false,
	showGraph:false,
	showGrid:false,
	showRemoteGrid:false,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		if(!window.OPM.showFWACompliance && currentWidgetData != undefined && (currentWidgetData.name == "fwa.device.unused.rules" || currentWidgetData.name == "fwa.rule.description")){
			$("#widgetElement_"+currentWidgetData.snapid+'').hide();
		}
		var parameters= this.widgetData.parameters;
		if(currentWidgetData.snapshotData == undefined){
			currentWidgetData.snapshotData={};
		}
		var snapshotData = currentWidgetData.snapshotData;
		var self = this;
		var inventorysnapType = self.snapshotObj.snapType;
		if(!self.get('widgetData.ondemandWidget')){
			var apiURL = opm_getSnapApiURL(currentWidgetData,this.snapshotObj,this.additionalProps);
			if(!currentWidgetData.expandView){
				$.ajax({
					url: apiURL,
					type: 'GET', //No I18N
					success: function(response)
					{
						self.set('widgetData.tblRecCount',"");
						if(response != undefined && response.error == undefined && response.widgetAdditionalData != undefined){
							if(snapshotData.colNamesListI18N===undefined){
								snapshotData.colNamesListI18N = [];
							}
							snapshotData.linkingRBBG=response.linkingRBBG;
							snapshotData.linkingRBB=response.linkingRBB;
							snapshotData.colNamesListI18N=response.widgetAdditionalData.colList;
							snapshotData.selColIndex=response.widgetAdditionalData.selColIndex;
							snapshotData.fwaresolveDNSOpt=response.fwaresolveDNSOpt;
							if(response.fwaresolveDNSOpt == "0"){
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').addClass('disabledDiv');
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','disabled');//No I18N
							}else if(response.fwaresolveDNSOpt == "2"){
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').removeClass('disabledDiv');
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','');//No I18N
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('checked','checked');//No I18N
							}else{
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').removeClass('disabledDiv');
								$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','');//No I18N
							}
							self.set('widgetData.fwaresolveDNSOpt',response.fwaresolveDNSOpt);//No I18N
							if(response.data != undefined && response.data.length != 0){
								if(response.widgetAdditionalData.chartType == "pie"){
									var jsonData = response.data;
									var addDetails = JSON.parse(JSON.stringify(response.widgetAdditionalData));
									var colDetail=getInvFWAPieColDetails(addDetails);
									var colNames = colDetail.colNameList;
									var colModel = colDetail.colModelList;							
									self.set('widgetData.noData',false);//No I18N
									var multiData = new Array();
									if(response.data != undefined){
										for (var indexx = 0; indexx < response.data.length; indexx++) {
											var array_element = response.data[indexx];
											var arr = new Array();
											if(response.widgetAdditionalData.keyIndex != undefined && response.widgetAdditionalData.valueIndex != undefined ){
												arr.push(array_element[response.widgetAdditionalData.keyIndex]);
												arr.push(array_element[response.widgetAdditionalData.valueIndex]);
											}else{
												arr.push(array_element[0]);
												arr.push(array_element[1]);
											}
											multiData.push(arr);
										}
									}

									var graphParams = {};
									graphParams.id = 'perfGraph1'+currentWidgetData.id;//No I18N
									graphParams.data = multiData;
									graphParams.graphType = 'pie';//No I18N
									self.set('widgetData.tblRecCount',response.records);//No I18N
									self.set('graphParams',graphParams);//No I18N
									self.set('showWidget',true);//No I18N
									self.set('showGraph',true);//No I18N
									self.set('chartType','pie');//No I18N
									
									var gridCallBack = function(gridID,paramsObj){
										var gridH = $('#gbox_'+gridID).height()+30;
										var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
										if(cellCount <= 10){
											cellCount=10;
										}
										if(window.OPM.isNewSnapshotPage){
											cellCount = Math.ceil((gridH+42)/22);
										}
										paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
										paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
										paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
									};
									var defaultOptions = {
											minRowsPerPage:10,
											isSnapshotGrid: true,
											snapId: currentWidgetData.id,
											snapIndex:currentWidgetData.snapIndex,
											reload: false,
											pagination: false,
											selColIndex:[0]
									};
									var gridData = response.data;
									var sendObj = {};
									defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
									defaultOptions.criteria=response.widgetAdditionalData.criteria;
									
									if(inventorysnapType != "FirewallUsers" && inventorysnapType != "FirewallRules" && (fwaSnapShotWithCategory.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1) && (fwaSnapShotWithCategoryNSeries.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1)){
										if(response.linkingRBBG != undefined ){
											defaultOptions.rbbtext="RBBG";//No I18N
											defaultOptions.rbbid=response.linkingRBBG;
											sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
											if(colModel != undefined && colModel[0] !=undefined){
												colModel[0].formatter =  function(cellvalue, options) {
//													return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
													return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span style="color:blue;cursor:pointer">'+cellvalue+'</span>';
												}
												colModel[0].unformat =  function(cellvalue, options, cell) {
													return cellvalue;
												}
											}
										}else if(response.linkingRBB != undefined){
											defaultOptions.rbbtext="RBB";//No I18N
											defaultOptions.rbbid=response.linkingRBB;
											sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
											if(colModel != undefined && colModel[0] !=undefined){
												colModel[0].formatter =  function(cellvalue, options) {
//													return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
													return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span style="color:blue;cursor:pointer">'+cellvalue+'</span>';
												}
												colModel[0].unformat =  function(cellvalue, options, cell) {
													return cellvalue;
												}
											}
										}else{
											if(colModel != undefined && colModel[0] !=undefined){
												colModel[0].formatter =  function(cellvalue, options) {
//													return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
													return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span>'+cellvalue+'</span>';
												}
												colModel[0].unformat =  function(cellvalue, options, cell) {
													return cellvalue;
												}
											}
										}
									}else{
										if(colModel != undefined && colModel[0] !=undefined){
											colModel[0].formatter =  function(cellvalue, options) {
//												return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
												return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+';float:left;display:inline-block;margin-right:5px"></div><span>'+cellvalue+'</span>';
											}
											colModel[0].unformat =  function(cellvalue, options, cell) {
												return cellvalue;
											}
										}
									}
									defaultOptions.gridCallBack=gridCallBack;
									defaultOptions.gridCallBackParams={self:self};
									sendObj.gridId = 'opm_App_Legend'+currentWidgetData.id;//No I18N
									sendObj.data = response.data;
									sendObj.colModels = colModel;
									sendObj.colNames = colNames;
									sendObj.defaultOptions = defaultOptions;
									self.set('gridData',sendObj);//No I18N
									self.set('widgetData.gridDataArray',sendObj);//No I18N
									OPMClient.FWAReportsDetailsController.reportList.push(currentWidgetData.translatedDesc);
									OPMClient.FWAReportWidgetLoadingController.singWidTabId.push(sendObj.gridId);
									if($(".intfSubTabs li.active").attr("data-tabname")!=undefined){
										OPMClient.FWAReportsDetailsController.repTitle=Ember.I18n.t($(".intfSubTabs li.active").attr("data-tabname"));
									}
									else if($("#nameOnly").text()!=undefined){
										OPMClient.FWAReportsDetailsController.repTitle=$("#nameOnly").text();
									}
								}else if(response.widgetAdditionalData.chartType == "timeseries"){//No I18N
									if(response.GraphData != undefined && response.GraphData.chartData != undefined)
									{	
										var graphParams = {};
										graphParams.id = 'PerfGraph'+currentWidgetData.id;
										graphParams.data = response.GraphData.chartData;
										graphParams.yAxis = response.GraphData.xyTitles[1];
//										graphParams.customToolTip = nfa_getCustomTooltipFormat();
										graphParams.graphType = 'area';//No I18N
										self.set('showWidget',true);//No I18N
										self.set('showGraph',true);//No I18N
										self.set('chartType','timeseries');//No I18N
										self.set('graphParams',graphParams);//No I18N
										self.set('widgetData.noData',false);//No I18N
										self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?14:11);//No I18N
										self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
										self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
									}else{
										self.set('showWidget',false);//No I18N
										self.set('widgetData.noData',true);//No I18N
										self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?5:2);//No I18N
										self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
										self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
									}
								}else if(response.widgetAdditionalData.isTableData == "true" || response.widgetAdditionalData.chartType == "bar"){//No I18N
									var gridCallBack = function(gridID,paramsObj){
										var gridH = $('#gbox_'+gridID).height()+30;
										var cellCount = Math.ceil((gridH+10)/(paramsObj.self.snapshotObj.snapDetails.yScale+10));
										if(cellCount<=4){
											cellCount=5;
										}
										if(window.OPM.isNewSnapshotPage){
											cellCount = Math.ceil((gridH+42)/22);
										}
										paramsObj.self.set('widgetData.sizey',cellCount);//No I18N
										paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')-1);//No I18N
										paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No I18N
									};
									var defaultOptions = {
											minRowsPerPage:10,
											isSnapshotGrid: true,
											snapId: currentWidgetData.id,
											snapIndex:currentWidgetData.snapIndex,
											reload: false,
											pagination: false,
											selColIndex:[0]
									};
									var gridData = response.data;
									var sendObj = {};
									defaultOptions.selColIndex=response.widgetAdditionalData.selColIndex;
									defaultOptions.criteria=response.widgetAdditionalData.criteria;
									defaultOptions.gridCallBack=gridCallBack;
									defaultOptions.gridCallBackParams={self:self};
									sendObj.gridId = "opm_fwa_bar_table"+currentWidgetData.id;//No I18N
									OPMClient.FWAReportsDetailsController.reportList.push(currentWidgetData.translatedDesc);
									OPMClient.FWAReportWidgetLoadingController.singWidTabId.push(sendObj.gridId);
									if($(".intfSubTabs li.active").attr("data-tabname")!=undefined){
										OPMClient.FWAReportsDetailsController.repTitle=Ember.I18n.t($(".intfSubTabs li.active").attr("data-tabname"));
									}
									else if($("#nameOnly").text()!=undefined){
										OPMClient.FWAReportsDetailsController.repTitle=$("#nameOnly").text();
									}
									sendObj.snapid = currentWidgetData.id;
									sendObj.data = gridData;
									sendObj.defaultOptions = defaultOptions;
									if(response.widgetAdditionalData.chartType == "bar"){
										var colDetail=getFWABarColDetails(response);
										sendObj.colNames = colDetail.colNameList;
										sendObj.colModels = colDetail.colModelList;
									}else{
										sendObj.colNames = response.widgetAdditionalData.colList;
										sendObj.colModels = getFWAColModels(response.widgetAdditionalData.colList.length,response.widgetAdditionalData);
										
									}
									if(inventorysnapType != "FirewallUsers" && inventorysnapType != "FirewallRules" && (fwaSnapShotWithCategory.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1) && (fwaSnapShotWithCategoryNSeries.indexOf(OPMClient.InventoryDeviceDetailsController.inventorysnapType) <= -1)){
										if(response.linkingRBBG != undefined ){
											defaultOptions.rbbtext="RBBG";//No I18N
											defaultOptions.rbbid=response.linkingRBBG;
											sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
											if(sendObj.colModels != undefined && sendObj.colModels[0] !=undefined){
												sendObj.colModels[0].formatter =  function(cellvalue, options) {
													return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
												}
												sendObj.colModels[0].unformat =  function(cellvalue, options, cell) {
													return cellvalue;
												}
											
											}
										}else if(response.linkingRBB != undefined){
											defaultOptions.rbbtext="RBB";//No I18N
											defaultOptions.rbbid=response.linkingRBB;
											sendObj.onSelectFunction="fwaReportDrillDown";//No I18N
											if(sendObj.colModels != undefined && sendObj.colModels[0] !=undefined){
												sendObj.colModels[0].formatter =  function(cellvalue, options) {
													return '<span style="color:blue;cursor:pointer">'+cellvalue+'</span>';//No I18N
												}
												sendObj.colModels[0].unformat =  function(cellvalue, options, cell) {
													return cellvalue;
												}
											
											}
										}
									}
									sendObj.captionTitle = "";
									sendObj.gridNavigator = "";
//									sendObj.onSelectFunction = snapDetails.snapshotData.onselectfunction !== undefined ? snapDetails.snapshotData.onselectfunction : "";//No I18N
									self.set('widgetData.tblRecCount',response.records);//No I18N
									sendObj.page = "";
									self.set('showWidget',true);//No I18N
									self.set('showGrid',true);//No I18N
									self.set('widgetData.noData',false);//No I18N
									self.set('widgetData.gridDataArray',sendObj);//No I18N
									if(response.widgetAdditionalData.chartType != "bar"){
										self.set('widgetData.isTableWid',true); //No I18N
									}
								}
							}else{
								self.set('showWidget',false);//No I18N
								self.set('widgetData.noData',true);//No I18N
								self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?5:2);//No I18N
								self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
								self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
								self.set('widgetData.isTableWid',false);//No I18N
							}
						}else{
							self.set('showWidget',false);//No I18N
							self.set('widgetData.noData',true);//No I18N
							self.set('widgetData.sizey',(window.OPM.isNewSnapshotPage)?5:2);//No I18N
							self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);// NO i18N
							self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
						}
					}
				});
			}else{
				var sendObj = {};
				if(snapshotData.fwaresolveDNSOpt == "0"){
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').addClass('disabledDiv');
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','disabled');//No I18N
				}else if(snapshotData.fwaresolveDNSOpt == "2"){
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').removeClass('disabledDiv');
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','');//No I18N
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('checked','checked');//No I18N
				}else{
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').removeClass('disabledDiv');
					$('#'+currentWidgetData.widgetElementID+' .opm_widget_title').find('.chkRoundBtn').find('input[type="checkbox"]').prop('disabled','');//No I18N
				}
				sendObj.translatedDesc = currentWidgetData.translatedDesc;
				sendObj.gridId = "opm_fwa_bar_table"+currentWidgetData.id;//No I18N
				sendObj.gridNavigator = "opm_fwa_bar_pager"+currentWidgetData.id;//No I18N
				sendObj.colNamesListI18N=snapshotData.colNamesListI18N;
				sendObj.apiUrl=apiURL;
				sendObj.linkingRBBG=snapshotData.linkingRBBG;
				sendObj.linkingRBB=snapshotData.linkingRBB;
				sendObj.selColIndex=snapshotData.selColIndex;
				sendObj.isFWARemoteGrid=true;
				self.set('widgetData.tblRecCount',"");
				self.set('gridData',sendObj);//No I18N
				self.set('showWidget',true);//No I18N
				self.set('showRemoteGrid',true);//No I18N
				self.set('widgetData.noData',false);//No I18N
				self.set('widgetData.gridDataArray',sendObj);//No I18N
			}
			
			
		}else{
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);// NO i18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
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
		OPMClient.FWAReportWidgetLoadingController.singWidTabId=[];
		OPMClient.FWAReportsDetailsController.reportList=[];
		OPMClient.FWAReportsDetailsController.repTitle=[];
	}
});


OPMClient.OpmFWAGraphComponent = Ember.Component.extend({
	templateName: "components/opm-fwa-complete-data",//No I18N
	jsonData:{},
	showWidget:false,
	showGraph:false,
	showGrid:false,
	showRemoteGrid:false,
	showTrafficInOutTable:false,
	didInsertElement: function(){
		var self = this;
		var graphParams = {};
		var currentWidgetData = this.get('widgetData');
		var apiResponse = currentWidgetData.apiData;
		if(apiResponse!=undefined && Object.keys(apiResponse).length!=0){
			if(apiResponse.GraphData != undefined){	
				var graphParams = {};
				graphParams.id = 'PerfGraph'+currentWidgetData.id;

				if(currentWidgetData.name == 'fwa.device.bandwidth' || currentWidgetData.name == 'fwa.interface.bandwidth'){
					var widParams=currentWidgetData.parameters;
					OPMClient.InventoryFWAController.snapshotDeviceWidget={"loaded":true,"graphUnit":"Kbps"};//No I18N
					$.each(widParams, function(i, item){
						if(item.param == "graphUnit"){
							OPMClient.InventoryFWAController.snapshotDeviceWidget.graphUnit=item.value;
						}
					});
					$.each(apiResponse.GraphData, function(i, item){
						if(item != undefined && item.seriesname == 'In'){
							item.seriesname=Ember.I18n.t('NFAWidget.IN',this);//No I18N
						}else if(item != undefined && item.seriesname == 'Out'){//No I18N
							item.seriesname=Ember.I18n.t('NFAWidget.OUT',this);//No I18N
						}
					});
				}
				graphParams.data = apiResponse.GraphData;
				graphParams.yAxis = apiResponse.yAxis;
//				graphParams.customToolTip = nfa_getCustomTooltipFormat();
				graphParams.graphType = 'area';//No I18N
				graphParams.grapPlotType = (this.get('widgetData.grapPlotType') == undefined)?'area':this.get('widgetData.grapPlotType'); //No I18N
				if(currentWidgetData.name == 'fwa.interface.bandwidth' || currentWidgetData.name == 'fwa.device.bandwidth'){
					var tableParams = {};
					var trafficIn = {};
					if(apiResponse.yAxis != undefined){
						trafficIn.captionTitle = Ember.I18n.t('webclient.reports.TrafficIN',this)+" ("+apiResponse.yAxis+")";
					}else{
						trafficIn.captionTitle = Ember.I18n.t('webclient.reports.TrafficIN',this);//NO I18N
					}
					
					trafficIn.defaultOptions = {};
					var widgetID=currentWidgetData.id;
					trafficIn.defaultOptions.loadCompleteFunction=function(){
						$('#widgetElement_'+widgetID+' .ui-jqgrid .ui-jqgrid-title').css({'font-size':'14px','font-weight':'bold','white-space':'normal'});
						$('#widgetElement_'+widgetID+' .ui-jqgrid .ui-jqgrid-titlebar').css({'background':'none'});
					};
					trafficIn.gridId = 'fwa_InterfaceTrafficIn'+currentWidgetData.id; //No I18N
					trafficIn.data = (apiResponse.tableData != undefined ? apiResponse.tableData.data : []);
					trafficIn.onSelectFunction = '';
					trafficIn.setGridWidthPerc = 50;
					trafficIn.colModels = [
					                     { name: '2', index: '2', classes:"pointer"}, //No I18N
					                     { name: '0', index: '0', classes:"pointer"}, //No I18N
					                     { name: '4', index: '4', classes:"pointer"} //No I18N
					                     ]; 
					trafficIn.colNames = [Ember.I18n.t('webclient.reports.tags.min',this),Ember.I18n.t('webclient.reports.tags.max',this),Ember.I18n.t('webclient.reports.tags.avg',this)]; //No I18N
					validateGridColumnDetails(trafficIn.colModels,trafficIn.colNames);
					tableParams.trafficDetailIn=trafficIn;
					
					
					var trafficOut = {};
					if(apiResponse.yAxis != undefined){
						trafficOut.captionTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this)+" ("+apiResponse.yAxis+")";
					}else{
						trafficOut.captionTitle = Ember.I18n.t('webclient.reports.TrafficOUT',this);//NO I18N
					}
					
					trafficOut.defaultOptions = {};
					trafficOut.defaultOptions.loadCompleteFunction=function(){
						$('#widgetElement_'+widgetID+' .ui-jqgrid .ui-jqgrid-title').css({'font-size':'14px','font-weight':'bold','white-space':'normal'});
						$('#widgetElement_'+widgetID+' .ui-jqgrid .ui-jqgrid-titlebar').css({'background':'none'});
					};
					trafficOut.gridId = 'fwa_InterfaceTrafficOut'+currentWidgetData.id; //No I18N
					trafficOut.data = (apiResponse.tableData != undefined ? apiResponse.tableData.data : []);
					trafficOut.onSelectFunction = '';
					trafficOut.setGridWidthPerc = 50;
					trafficOut.colModels = [
					                      { name: '8', index: '8', classes:"pointer"}, //No I18N
					                      { name: '6', index: '6', classes:"pointer"}, //No I18N
					                      { name: '10', index: '10', classes:"pointer"} //No I18N
					                      ]; 
					trafficOut.colNames = [Ember.I18n.t('webclient.reports.tags.min',this),Ember.I18n.t('webclient.reports.tags.max',this),Ember.I18n.t('webclient.reports.tags.avg',this)]; //No I18N
					validateGridColumnDetails(trafficOut.colModels,trafficOut.colNames);
					tableParams.trafficDetailOut=trafficOut;
					self.set('tableParams',tableParams);//No I18N
					self.set('showTrafficInOutTable',true);//No I18N
					
					var fwaZoomEvent =  function(event,chartObj){
						if (currentWidgetData.expandView || (chartObj.systemConf.chart.brush.x!==null && chartObj.systemConf.chart.brush.x[0]) === chartObj.backupZoomX) {
					        return;
					    }
					    if(chartObj.systemConf.chart.brush.x === null || chartObj.systemConf.chart.brush.x[0] === undefined) {
					    	fwaZoomGraphWidgets(true);
						}else {
							chartObj.backupZoomX = chartObj.systemConf.chart.brush.x[0];
							if(!OPMClient.InventoryDeviceDetailsController.fwaBandwidthGraphZoom) {
						   		OPMClient.FWAGlobalDataController.zoomResetTimePeriod = OPMClient.FWAGlobalDataController.timePeriod;
						   		OPMClient.FWAGlobalDataController.zoomResetStartTime = OPMClient.FWAGlobalDataController.startTime;
								OPMClient.FWAGlobalDataController.zoomResetEndTime = OPMClient.FWAGlobalDataController.endTime;
						   	}

							OPMClient.InventoryDeviceDetailsController.fwaBandwidthGraphZoom = true;
							OPMClient.FWAGlobalDataController.startTime = nfa_getFormattedDate(chartObj.systemConf.chart.brush.x[0].minRange);
							OPMClient.FWAGlobalDataController.endTime = nfa_getFormattedDate(chartObj.systemConf.chart.brush.x[0].maxRange);
						   	
							OPMClient.FWAGlobalDataController.timePeriod = 'custom'; //No I18N
							$('#snapshottimeFrameTitle').text(Ember.I18n.t('webclient.reports.timeframe.custom')); //No I18N
							fwaZoomGraphWidgets(false);
							opm_infoMsgs("successMsg",Ember.I18n.t('webclient.fwa.inventory.livetraffic.timeperiod.msg',this)); //No I18N
							var startTime=OPMClient.FWAGlobalDataController.startTime
							var endTime=OPMClient.FWAGlobalDataController.endTime
							if(startTime != undefined){
								var sDateTime = startTime.split(" ");
								var sDate = sDateTime[0];
								var sTime2 = sDateTime[1];
								
								var sTimeSpl = sTime2.split(":");
								var sHrs = sTimeSpl[0];
								var sMns = sTimeSpl[1];
								$("#once_startat").val(sDate);
								$("#onceonly_from_hrs_sel").val(sHrs);
								$("#onceonly_from_mins_sel").val(sMns);
								$("#onceonly_from_hrs_sel").select2().val();
								$("#onceonly_from_mins_sel").select2().val();
							}
							
							if(endTime != undefined){
								var eDateTime = endTime.split(" ");
								var eDate = eDateTime[0];
								var eTime2 = eDateTime[1];
								
								var eTimeSpl = eTime2.split(":");
								var eHrs = eTimeSpl[0];
								var eMns = eTimeSpl[1];
								$("#once_endat").val(eDate);
								$("#onceonly_to_hrs_sel").val(eHrs);
								$("#onceonly_to_mins_sel").val(eMns);
								$("#onceonly_to_hrs_sel").select2().val();
								$("#onceonly_to_mins_sel").select2().val();
							}
						}
					    var widZoomId=self.get('widgetData').id;
					    reloadExcludingWidgetID(widZoomId);
					}
					
					var fwaInterfaceZoomEvent =  function(event,chartObj){
						if (currentWidgetData.expandView || (chartObj.systemConf.chart.brush.x!==null && chartObj.systemConf.chart.brush.x[0]) === chartObj.backupZoomX) {
					        return;
					    }
					    if(chartObj.systemConf.chart.brush.x === null || chartObj.systemConf.chart.brush.x[0] === undefined) {
					    	fwaZoomInterfaceGraphWidgets(true);
						}else {
							chartObj.backupZoomX = chartObj.systemConf.chart.brush.x[0];
							if(!OPMClient.InventoryDeviceDetailsController.fwaInterafceGraphZoom) {
						   		OPMClient.FWAGlobalDataController.zoomResetTimePeriod = OPMClient.FWAGlobalDataController.timePeriod;
						   		OPMClient.FWAGlobalDataController.zoomResetStartTime = OPMClient.FWAGlobalDataController.startTime;
								OPMClient.FWAGlobalDataController.zoomResetEndTime = OPMClient.FWAGlobalDataController.endTime;
						   	}

							OPMClient.InventoryDeviceDetailsController.fwaInterafceGraphZoom = true;
							OPMClient.FWAGlobalDataController.startTime = nfa_getFormattedDate(chartObj.systemConf.chart.brush.x[0].minRange);
							OPMClient.FWAGlobalDataController.endTime = nfa_getFormattedDate(chartObj.systemConf.chart.brush.x[0].maxRange);
						   	
							OPMClient.FWAGlobalDataController.timePeriod = 'custom'; //No I18N
							$('#snapshottimeFrameTitle').text(Ember.I18n.t('webclient.reports.timeframe.custom')); //No I18N
							fwaZoomInterfaceGraphWidgets(false);
						}
					    var widZoomId=self.get('widgetData').id;
					    reloadExcludingWidgetID(widZoomId);
					}
					
					if(currentWidgetData.name == 'fwa.device.bandwidth'){
						graphParams.onclickEvent = 'fwaDeviceGraphDetails';//No I18N
						graphParams.zoomEvent = fwaZoomEvent;//No I18N
						if(OPMClient.ApplicationController.currentPath.indexOf("ShortSummary") == -1){
							setInvSnapBandwidthGrphTitle(graphParams);
						}
					}
					
					if(currentWidgetData.name == 'fwa.interface.bandwidth'){
						graphParams.onclickEvent = 'fwaInterfaceGraphDetails';//No I18N
						graphParams.zoomEvent = fwaInterfaceZoomEvent;//No I18N
						if(OPMClient.ApplicationController.currentPath.indexOf("ShortSummary") == -1){
							setInvSnapBandwidthGrphTitle(graphParams);
						}
					}
					self.set('widgetData.sizey',14);//No I18N
				}else{
					self.set('widgetData.sizey',11);//No I18N
				}
				self.set('showWidget',true);//No I18N
				self.set('showGraph',true);//No I18N
				self.set('chartType','timeseries');//No I18N
				self.set('graphParams',graphParams);//No I18N
				self.set('widgetData.noData',false);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);//No I18N
			}else{
				self.set('showWidget',false);//No I18N
				self.set('widgetData.noData',true);//No I18N
				self.set('widgetData.sizey',2);//No I18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);// NO i18N
				self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
			}
		}else{
			self.set('showWidget',false);//No I18N
			self.set('widgetData.noData',true);//No I18N
			self.set('widgetData.sizey',2);//No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1);// NO i18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1);// NO i18N
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
		OPMClient.InventoryFWAController.snapshotDeviceWidget={"loaded":false,"graphUnit":""};//No I18N
		$('#'+this.elementId).find('*').remove();
	}
});



OPMClient.FwaMultiSelectionViewComponent = Ember.Component.extend({
	templateName: "components/fwa-multi-selection-view", //No I18N 
	didInsertElement: function() {
		if(this.selDeviceList == undefined){
			this.set("selDeviceList",[]); //No I18N
		}
	},
	changeInputCheckedVal:function(routerObj,checkedVal){
		routerObj.allIntfSelected = checkedVal;
		routerObj.selectedIntfCount = (checkedVal === "checked")?routerObj.intfList.length:0; //No I18N

		for(var i=0;i<routerObj.intfList.length;i++){
			routerObj.intfList[i][2] = checkedVal;
		}
		return routerObj;
	},
	getAvailDeviceList:function() {
		return jQuery.extend(true,[],this.get("availDeviceList")); //No I18N
	},
	setAllCollectorSelectedVal:function() {
		this.set("isAllCollectorSelected",(this.get("totalSelDevCount") == this.get("totalAvailDevCount"))?"checked":""); //No I18N
	},
	setSelDevCount:function(){
		var collLst = this.getAvailDeviceList();
		var selDevCount=0;
		var selectedCollCount=0;
		for (var ij=0;ij < collLst.length;ij++){
			var collObj = collLst[ij];
			for(var i=0;i<collObj.intfList.length;i++) {
				if(collObj.intfList[i][2] === "checked"){
					selDevCount++;
				}
			}
		}
		for (var ij=0;ij < collLst.length;ij++){
				if(collLst[ij].selectedIntfCount > 0){
					selectedCollCount++;
				}
		}
		this.set("selectedCollCount",selectedCollCount);//No I18N
		this.set("selectedDevCount",selDevCount);//No I18N
	},
	actions:{
		allCollSelectedChanged: function(){
			var collList = this.getAvailDeviceList();
			this.set("isAllCollectorSelected",(this.get("isAllCollectorSelected") === "checked")?"":"checked"); //No I18N
			var totalSelDevCount = 0;
			for(var i=0;i<collList.length;i++) {
				collList[i] = this.changeInputCheckedVal(collList[i],this.get("isAllCollectorSelected")); //No I18N
				totalSelDevCount += collList[i].selectedIntfCount;
			}
			this.set("totalSelDevCount",totalSelDevCount); //No I18N
			this.set("availDeviceList",collList); //No I18N
			this.setSelDevCount();
		},
		allDevSelectedChanged: function(devListId){
			var index = devListId.split("_")[1]; //No I18N
			var deviceList = this.getAvailDeviceList();
			var totalSelDevCount = deviceList[index].selectedIntfCount;

			deviceList[index].allIntfSelected = (deviceList[index].allIntfSelected === "")?"checked":""; //No I18N
			deviceList[index] = this.changeInputCheckedVal(deviceList[index],deviceList[index].allIntfSelected);

			if(deviceList[index].allIntfSelected === "checked") { //No I18N
				totalSelDevCount = (this.get("totalSelDevCount") - totalSelDevCount) + deviceList[index].intfList.length; //No I18N
			}else {
				totalSelDevCount = this.get("totalSelDevCount") - totalSelDevCount; //No I18N
			}

			this.set("totalSelDevCount",totalSelDevCount); //No I18N
			this.set("availDeviceList",deviceList); //No I18N
			this.setSelDevCount();
			this.setAllCollectorSelectedVal();
		},
		childDevSelectionChanged:function(devLstId,deviceID) {
			var index = devLstId.split("_")[1]; //No I18N
			var collLst = this.getAvailDeviceList();
			var collObj = collLst[index];
			for(var i=0;i<collObj.intfList.length;i++) {
				if(collObj.intfList[i][1] === deviceID){
					break;
				}
			}
			if(collObj.intfList[i][2] === "checked") { //No I18N
				collObj.intfList[i][2] = ""; //No I18N
				collObj.selectedIntfCount -= 1;
				this.set("totalSelDevCount",this.get("totalSelDevCount")-1); //No I18N
			}else {
				collObj.intfList[i][2] = "checked"; //No I18N
				collObj.selectedIntfCount += 1;
				this.set("totalSelDevCount",this.get("totalSelDevCount")+1); //No I18N
			}
			collObj.allIntfSelected = (collObj.selectedIntfCount == collObj.intfList.length)?"checked":""; //No I18N
			collLst[index] = collObj;
			this.set("availDeviceList",collLst); //No I18N
			this.setSelDevCount();
			this.setAllCollectorSelectedVal();
		},
		mainListViewChanged:function(collId) {
			var index = collId.split("_")[1]; //No I18N
			var collList = this.getAvailDeviceList();
			for(var i=0;i<collList.length;i++){
				collList[i].className = "chkParentChild"; //No I18N
			}
			collList[index].className += " active"; //No I18N
			if(index != 0) {
				collList[0].className += " noActive"; //No I18N
			}
			this.set("availDeviceList",collList); //No I18N
		}
	}
});


OPMClient.FwaCustomizedSelectComponent = Ember.Component.extend({
	templateName: "components/Fwa-Customized-Select",//No I18N
	didInsertElement: function(){
		var self = this;
		self.set('modifiedData',[]);//NO I18N
		var data = this.get('data');
		var dispTxt = this.get('dispTxt');
		var dispVal = this.get('dispVal');
		var evntListner = this.get('onchange');
		$.each(data, function (i, value) {
			data[i].dispTxt=value[dispTxt];
			data[i].dispVal=value[dispVal];
	    });                   
		data.onChangeFn=evntListner;
		self.set("modifiedData",data);//NO I18N
		$("#selectId").select2();
	}
});

OPMClient.FwaReportsTimePeriodFiltersListComponent = Ember.Component.extend({
	templateName: "components/Fwa-Reports-Time-Period-Filters-List",//No I18N
	initDefaults: function() {
		setfwaCustomTimeFromTimeFrame();
		OPMClient.FWAReportsTimePeriodsFilterController.set("timePeriod",[{"key":"LastHour","value":Ember.I18n.t("webclient.reports.timeframe.lasthrs"),"className":""},{"key":"today","value":Ember.I18n.t("webclient.reports.timeframe.today"),"className":"active"},{"key":"24Hour","value":Ember.I18n.t("webclient.reports.timeframe.last24hrs"),"className":""},{"key":"7Days","value":Ember.I18n.t("webclient.reports.timeframe.last7days"),"className":""},{"key":"30Days","value":Ember.I18n.t("webclient.reports.timeframe.last30days"),"className":""},{"key":"LastMonth","value":Ember.I18n.t("webclient.Last.Month"),"className":""},{"key":"LastQuarter","value":Ember.I18n.t("webclient.reports.timeframe.lastquarter"),"className":""},{"key":"custom","value":Ember.I18n.t("webclient.reports.timeframe.custom"),"className":""}]); //NO I18N 
		if(!OPMClient.FWAReportsDetailsController.fromInvPage && !OPMClient.FWAReportsDetailsController.fromSettPage){
			OPMClient.FWAGlobalDataController.timePeriod="today"; //NO I18N
		}
		this.set("selTimePeriod",this.selTimePeriodVal()); //NO I18N
		OPMClient.FWAReportsDetailsController.set("selTimePeriod","today"); //NO I18N
	}.on("init"), //NO I18N 
	didInsertElement: function(){
		$(document).bind("mouseup",this.toggleEventListener); //NO I18N
		this.setTimePeriod();
	},
	selTimePeriodVal:function(){
		var selTimePrd = "";
		for(i=0; i<OPMClient.FWAReportsTimePeriodsFilterController.timePeriod.length; i++){
		    if(OPMClient.FWAReportsTimePeriodsFilterController.timePeriod[i].key == OPMClient.FWAGlobalDataController.timePeriod){
		    	OPMClient.FWAReportsTimePeriodsFilterController.timePeriod[i].className = "active";
		    	selTimePrd = OPMClient.FWAReportsTimePeriodsFilterController.timePeriod[i].value;
		    }else{
		    	OPMClient.FWAReportsTimePeriodsFilterController.timePeriod[i].className = "";
		    }
		}
		return selTimePrd;
	},
	toggleEventListener:function(e){
		var container = $(".ddType1__view"); //NO I18N
		if (!container.is(e.target) && container.has(e.target).length === 0) {
			container.removeClass("active"); //NO I18N
		}
	},
	setTimePeriod:function(){
		$("#fwaFromDate").text(": "+OPMClient.FWAGlobalDataController.startTime); //NO I18N
		$("#fwaToDate").text(": "+OPMClient.FWAGlobalDataController.endTime); //NO I18N
	},
	loadFwaGrphTable:function(){
		if(OPMClient.FWAGlobalDataController.timePeriod == "custom"){
			$('#fwaTimeSelect').show();
			$('#fwaExportPdf').hide();
			$('#fwaReportProfileActions').hide();
			$("#timePeriodsList").hide();
			slideIn(5);
			$("input[value=customperiod]").trigger("click");
		}else{
			setfwaCustomTimeFromTimeFrame();
			showCustomTimePeriod(OPMClient.FWAGlobalDataController.startTime,OPMClient.FWAGlobalDataController.endTime);
			if(OPMClient.FWAReportsDetailsController.isExpandView){
				if(OPMClient.FWAReportsDetailsController.isVpnUsage){
					var selTimePeriod = OPMClient.FWAGlobalDataController.timePeriod;
					if(selTimePeriod == "today" || selTimePeriod == "24Hour"){
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option><option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option>");
					}else if(selTimePeriod == "LastHour"){ //No I18N
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option>");
					}else if(selTimePeriod == "7Days"){ //No I18N
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option><option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
					}else if(selTimePeriod == "30Days"){ //No I18N
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
					}	
					$("#timeIntervalExpandView").html(OPMClient.FWAReportsDetailsController.timeInterval);
				}else if(OPMClient.FWAReportsDetailsController.isVPNStatusReport){
					var selTimePeriod = OPMClient.FWAGlobalDataController.timePeriod;
					if(selTimePeriod == "today" || selTimePeriod == "24Hour"){
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option><option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option>");
					}else if(selTimePeriod == "LastHour"){ //No I18N
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option>");
					}else if(selTimePeriod == "7Days"){ //No I18N
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option><option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
					}else if(selTimePeriod == "30Days" || selTimePeriod == "LastMonth" || selTimePeriod == "LastQuarter"){ //No I18N
						OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
					}	
				}
				loadFWAReportExpandTable();
			}else{
				OPMClient.FWAReportWidgetLoadingController.set('widList',[]);//No I18N
				OPMClient.FWAReportWidgetLoadingController.set('FirstDivList',[]);//No I18N
				OPMClient.FWAReportWidgetLoadingController.set('SecDivList',[]);//No I18N
				OPMClient.FWAReportWidgetLoadingController.set('isRawReport',false);//No I18N
				$('#fwaReportGraphData').show();
				$('#fwaExpandGridData').hide();
				if(OPMClient.FWAReportsDetailsController.rtype ==  "MyRep"){
					if($("#tabList").find("option:selected").attr('repType') == "raw"){
						$('#fwaRawRepTabList').find('.list a').each(function(){
							if($(this).hasClass('active')){
								drawFirewallReportGraph($(this).attr('repType'));
								return ;
							}
						});
					}else{
				drawFirewallReportGraph(); //No I18N
					}
				}else{
				drawFirewallReportGraph(); //No I18N
				}
			}
			this.setTimePeriod();
		}
	},
	vpnUsageTimePeriodChanged:function(selTimePeriod){
		if(OPMClient.FWAReportsDetailsController.isVpnUsage){
			if(selTimePeriod == "today"){
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option><option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option>");
			}else if(selTimePeriod == "LastHour"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option>");
			}else if(selTimePeriod == "24Hour"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option><option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option>");
			}else if(selTimePeriod == "7Days"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option><option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
			}else if(selTimePeriod == "30Days" || selTimePeriod == "LastMonth" || selTimePeriod == "LastQuarter"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
			}
		}else if(OPMClient.FWAReportsDetailsController.isVPNStatusReport){ 
			var selTimePeriod = OPMClient.FWAGlobalDataController.timePeriod;
			if(selTimePeriod == "today"){
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option><option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option>");
			}else if(selTimePeriod == "LastHour"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option>");
			}else if(selTimePeriod == "24Hour"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='5'>"+Ember.I18n.t('webclient.cctv.time300')+"</option><option value='15'>"+Ember.I18n.t('webclient.common.sesstimeout.15min')+"</option><option value='30'>"+Ember.I18n.t('webclient.common.sesstimeout.30min')+"</option><option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option>");
			}else if(selTimePeriod == "7Days"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='60'>"+Ember.I18n.t('webclient.common.sesstimeout.60min')+"</option><option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
			}else if(selTimePeriod == "30Days" || selTimePeriod == "LastMonth" || selTimePeriod == "LastQuarter"){ //No I18N
				OPMClient.FWAReportsDetailsController.set("timeInterval","<option value='1440'>"+Ember.I18n.t('webclient.1.Day')+"</option>");
			}	
		}

		if((OPMClient.FWAReportsDetailsController.isVpnUsage || OPMClient.FWAReportsDetailsController.isVPNStatusReport) && (selTimePeriod != "custom")){
			OPMClient.FWAReportsDetailsController.set("selTimePeriod",selTimePeriod); //No I18N
		}
	},
	actions:{
		timePeriodChanged:function(selTimePeriod){
			var list = jQuery.extend(true,[],this.timePeriod);
			for(var i=0;i<list.length;i++) {
				if(list[i].key==selTimePeriod) {
					if(selTimePeriod != "custom"){
						list[i].className = "active"; //NO I18N
						$("#timePrd").text(list[i].value);
					}
					OPMClient.FWAGlobalDataController.timePeriod = list[i].key;
				}else {
					list[i].className = ""; //NO I18N
				}
			}
			if(selTimePeriod != "custom"){
				this.set("timePeriod",list); //NO I18N
			}
			OPMClient.FWAReportsDetailsController.set("selTimePeriod",selTimePeriod); //No I18N
			this.loadFwaGrphTable();
			this.vpnUsageTimePeriodChanged(selTimePeriod);
		},
		showTimePeriodList:function(time,timeValue) {
			$("#"+this.elementId+" .ddType1 .ddType1__view").toggleClass("active"); //NO I18N
		}
	},
	willDestroyElement:function() {
		$(document).unbind("mouseup",this.toggleEventListener); //NO I18N
	}
});


OPMClient.FwaMultiProbeDeviceSelectionViewComponent = Ember.Component.extend({
	templateName: "components/fwa-multi-probe-device-selection-view", //No I18N 
	availableList: [],
	selectedList: [],
	initDefaults: function() {
		this.set("reportList",[]);//NO I18N
		this.set("totalAvailWidgetCount",[]);//NO I18N
		this.set("isAllReportTypeSelected",false); //No I18N
		OPMClient.FWAReportProfileController.multiSelectReportList = [];
		var availableList = this.get("availableList");
		var selectedList = (this.get("selectedList") == undefined || this.get("selectedList") == null) ? [] : this.get("selectedList");
		var self = this;
		fwa_getModelForProbeDeviceMultiSelect(availableList,self);
		fwa_selectModelForProbeDeviceMultiSelect(selectedList,self);
	}.on("init"), //NO I18N 
	didInsertElement: function() {
		
	},
	changeInputCheckedVal:function(reportObj,checkedVal){
		Ember.set(reportObj, "allWidgetsSelected", checkedVal); //No I18N
		Ember.set(reportObj, "selWidgetCount", (checkedVal === "checked")?reportObj.widgetList.length:0); //No I18N
		for(var i=0;i<reportObj.widgetList.length;i++){
			var widgetObj=reportObj.widgetList.objectAt(i);
			Ember.set(widgetObj, "ischecked",checkedVal); //No I18N
		}
		return reportObj;
	},
	getAvailReportList:function() {
		return jQuery.extend(true,[],this.get("reportList")); //No I18N
	},
	setAllWidgetSelectedVal:function() {
		this.set("isAllReportTypeSelected",(this.get("totalSelWidgetCount") == this.get("totalAvailWidgetCount"))?"checked":""); //No I18N
	},
	actions:{
		allReportSelectedChanged: function(){
			var reportLst = this.get("reportList");
			this.set("isAllReportTypeSelected",(this.get("isAllReportTypeSelected") === "checked")?"":"checked"); //No I18N
			var totalSelWidgetCount = 0;
			for(var i=0;i<reportLst.length;i++) {
				reportLst[i] = this.changeInputCheckedVal(reportLst[i],this.get("isAllReportTypeSelected")); //No I18N
				totalSelWidgetCount += reportLst[i].selWidgetCount;
			}
			OPMClient.FWAReportProfileController.multiSelectReportList=reportLst;
			this.set("totalSelWidgetCount",totalSelWidgetCount); //No I18N
		},
		allWidgetsSelectedChanged: function(widgetLstId){
			var index = widgetLstId.split("_")[2]; //No I18N
			var reportLst = this.getAvailReportList();
			var reportObj = this.get("reportList").objectAt(index);
			var totalSelWidgetCount = reportObj.selWidgetCount;

			Ember.set(reportObj, "allWidgetsSelected", (reportObj.allWidgetsSelected === "")?"checked":""); //No I18N
			reportLst[index] = this.changeInputCheckedVal(this.get("reportList").objectAt(index),this.get("reportList").objectAt(index).allWidgetsSelected);

			if(reportLst[index].allWidgetsSelected === "checked") { //No I18N
				totalSelWidgetCount = (this.get("totalSelWidgetCount") - totalSelWidgetCount) + reportLst[index].widgetList.length; //No I18N
			}else {
				totalSelWidgetCount = this.get("totalSelWidgetCount") - totalSelWidgetCount; //No I18N
			}

			this.set("totalSelWidgetCount",totalSelWidgetCount); //No I18N
			this.setAllWidgetSelectedVal();
			OPMClient.FWAReportProfileController.multiSelectReportList=this.getAvailReportList();
		},
		childWidgetSelectionChanged:function(widgetLstId,id) {
			var index = widgetLstId.split("_")[2]; //No I18N
			var reportObj = this.get("reportList").objectAt(index);
			for(var i=0;i<reportObj.widgetList.length;i++) {
				if(reportObj.widgetList[i].id === id){
					break;
				}
			}
			var widgetObj=reportObj.widgetList.objectAt(i);
			if(widgetObj.ischecked === "checked") { //No I18N
				Ember.set(widgetObj, "ischecked", ""); //No I18N
				var selWidgetCount=reportObj.selWidgetCount-1;
				Ember.set(reportObj, "selWidgetCount", selWidgetCount); //No I18N
				this.set("totalSelWidgetCount",this.get("totalSelWidgetCount")-1); //No I18N
			}else {
				Ember.set(widgetObj, "ischecked", "checked"); //No I18N
				var selWidgetCount=reportObj.selWidgetCount+1;
				Ember.set(reportObj, "selWidgetCount", selWidgetCount); //No I18N
				this.set("totalSelWidgetCount",this.get("totalSelWidgetCount")+1); //No I18N
			}
			var allWidgetsSelected = (reportObj.selWidgetCount == reportObj.widgetList.length)?"checked":""; //No I18N
			Ember.set(reportObj, "allWidgetsSelected", allWidgetsSelected); //No I18N
			this.setAllWidgetSelectedVal();
			OPMClient.FWAReportProfileController.multiSelectReportList=this.getAvailReportList();
		},		
		mainListViewChanged:function(index) {
			var reportLst = this.get("reportList");
			for(var i=0;i<reportLst.length;i++){
				var reportObj = this.get("reportList").objectAt(i);
				Ember.set(reportObj, "className", "chkParentChild"); //No I18N
			}
			var reportObj = this.get("reportList").objectAt(index);
			var cname=reportObj.className+" active"; //No I18N
			Ember.set(reportObj, "className", cname); //No I18N
			if(index != 0) {
				var reportObj = this.get("reportList").objectAt(0);
				var cname=reportObj.className+" noActive"; //No I18N
				Ember.set(reportObj, "className", cname); //No I18N
			}
			OPMClient.FWAReportProfileController.multiSelectReportList=this.getAvailReportList();
		}
	}
});


OPMClient.FwaMultiReportSelectionViewComponent = Ember.Component.extend({
	templateName: "components/fwa-multi-report-selection-view", //No I18N 
	initDefaults: function() {
		this.set("isAllReportTypeSelected",false); //No I18N
		var apiURL = window.OPM.apiUrlPattern+"/fwareporttab/getAllReportList?loadRbbDetails=true"; //No I18N
		var callBckFunc = function(jsonData,paramsObj){
			fwa_getModelForReportMultiSelect(jsonData,paramsObj.self);
			if(OPMClient.FWAReportProfileController.selMultiReportList != undefined && OPMClient.FWAReportProfileController.selMultiReportList.length > 0){
				fwa_selectModelForReportMultiSelect(OPMClient.FWAReportProfileController.selMultiReportList,paramsObj.self);
				OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
			}
		};
		fwa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,{self:this});
	}.on("init"), //NO I18N 
	didInsertElement: function() {
		
	},
	changeInputCheckedVal:function(reportObj,checkedVal){
		Ember.set(reportObj, "allWidgetsSelected", checkedVal); //No I18N
		Ember.set(reportObj, "selWidgetCount", (checkedVal === "checked")?reportObj.widgetList.length:0); //No I18N
		for(var i=0;i<reportObj.widgetList.length;i++){
			var widgetObj=reportObj.widgetList.objectAt(i);
			Ember.set(widgetObj, "ischecked",checkedVal); //No I18N
		}
		return reportObj;
	},
	getAvailReportList:function() {
		return jQuery.extend(true,[],this.get("reportList")); //No I18N
	},
	setAllWidgetSelectedVal:function() {
		this.set("isAllReportTypeSelected",(this.get("totalSelWidgetCount") == this.get("totalAvailWidgetCount"))?"checked":""); //No I18N
	},
	fwaMultiSelectObserver:function(){
		this.set("isAllReportTypeSelected",false); //No I18N
		var apiURL = window.OPM.apiUrlPattern+"/fwareporttab/getAllReportList?loadRbbDetails=true"; //No I18N
		var callBckFunc = function(jsonData,paramsObj){
			fwa_getModelForReportMultiSelect(jsonData,paramsObj.self,OPMClient.FWAReportProfileController.createdRbbgID);
			fwa_selectModelForReportMultiSelect(OPMClient.FWAReportProfileController.selMultiReportList,paramsObj.self);
			OPMClient.FWAReportProfileController.createdRbbgID="";//NO I18N
		};
		fwa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,{self:this});
		OPMClient.Reports.hideReportTypeDiv();
		OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
	}.observes("OPMClient.FWAReportProfileController.reloadMultiSelectWidgetloading"), //NO I18N
	actions:{
		allReportSelectedChanged: function(){
			var reportLst = this.get("reportList");
			this.set("isAllReportTypeSelected",(this.get("isAllReportTypeSelected") === "checked")?"":"checked"); //No I18N
			var totalSelWidgetCount = 0;
			for(var i=0;i<reportLst.length;i++) {
				reportLst[i] = this.changeInputCheckedVal(reportLst[i],this.get("isAllReportTypeSelected")); //No I18N
				totalSelWidgetCount += reportLst[i].selWidgetCount;
			}
			OPMClient.FWAReportProfileController.multiSelectReportList=reportLst;
			this.set("totalSelWidgetCount",totalSelWidgetCount); //No I18N
			OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
		},
		allWidgetsSelectedChanged: function(widgetLstId){
			var index = widgetLstId.split("_")[2]; //No I18N
			var reportLst = this.getAvailReportList();
			var reportObj = this.get("reportList").objectAt(index);
			var totalSelWidgetCount = reportObj.selWidgetCount;

			Ember.set(reportObj, "allWidgetsSelected", (reportObj.allWidgetsSelected === "")?"checked":""); //No I18N
			reportLst[index] = this.changeInputCheckedVal(this.get("reportList").objectAt(index),this.get("reportList").objectAt(index).allWidgetsSelected);

			if(reportLst[index].allWidgetsSelected === "checked") { //No I18N
				totalSelWidgetCount = (this.get("totalSelWidgetCount") - totalSelWidgetCount) + reportLst[index].widgetList.length; //No I18N
			}else {
				totalSelWidgetCount = this.get("totalSelWidgetCount") - totalSelWidgetCount; //No I18N
			}

			this.set("totalSelWidgetCount",totalSelWidgetCount); //No I18N
			this.setAllWidgetSelectedVal();
			OPMClient.FWAReportProfileController.multiSelectReportList=this.getAvailReportList();
			OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
		},
		childWidgetSelectionChanged:function(widgetLstId,rbbname) {
			var index = widgetLstId.split("_")[2]; //No I18N
			var reportObj = this.get("reportList").objectAt(index);
			for(var i=0;i<reportObj.widgetList.length;i++) {
				if(reportObj.widgetList[i].rbbname === rbbname){
					break;
				}
			}
			var widgetObj=reportObj.widgetList.objectAt(i);
			if(widgetObj.ischecked === "checked") { //No I18N
				Ember.set(widgetObj, "ischecked", ""); //No I18N
				var selWidgetCount=reportObj.selWidgetCount-1;
				Ember.set(reportObj, "selWidgetCount", selWidgetCount); //No I18N
				this.set("totalSelWidgetCount",this.get("totalSelWidgetCount")-1); //No I18N
			}else {
				Ember.set(widgetObj, "ischecked", "checked"); //No I18N
				var selWidgetCount=reportObj.selWidgetCount+1;
				Ember.set(reportObj, "selWidgetCount", selWidgetCount); //No I18N
				this.set("totalSelWidgetCount",this.get("totalSelWidgetCount")+1); //No I18N
			}
			var allWidgetsSelected = (reportObj.selWidgetCount == reportObj.widgetList.length)?"checked":""; //No I18N
			Ember.set(reportObj, "allWidgetsSelected", allWidgetsSelected); //No I18N
			this.setAllWidgetSelectedVal();
			OPMClient.FWAReportProfileController.multiSelectReportList=this.getAvailReportList();
			OPMClient.Reports.fwaLoadCusomRepRowCountMsg();
		},		
		mainListViewChanged:function(index) {
			var reportLst = this.get("reportList");
			for(var i=0;i<reportLst.length;i++){
				var reportObj = this.get("reportList").objectAt(i);
				Ember.set(reportObj, "className", "chkParentChild"); //No I18N
			}
			var reportObj = this.get("reportList").objectAt(index);
			var cname=reportObj.className+" active"; //No I18N
			Ember.set(reportObj, "className", cname); //No I18N
			if(index != 0) {
				var reportObj = this.get("reportList").objectAt(0);
				var cname=reportObj.className+" noActive"; //No I18N
				Ember.set(reportObj, "className", cname); //No I18N
			}
			OPMClient.FWAReportProfileController.multiSelectReportList=this.getAvailReportList();
		}
	}
});

OPMClient.FwaRuleCompReportViewComponent = Ember.Component.extend({
	templateName: "components/fwa-rule-comp-report-view", //No I18N
	initDefaults: function() {
		this.set("currentIndex",-1); //No I18N
		this.set("diffData",{});//NO I18N
		this.set("deviceName","");//NO I18N
	}.on("init"), //NO I18N 
	didInsertElement: function() {
		
	},
	fwaRuleCompObserver:function(){
		this.set("currentIndex",-1); //No I18N
		this.set("diffData",OPMClient.FWAReportRuleCompController.compRepDetail);//NO I18N
		if(!$('#Added_Chk').prop('checked')){
			$("#Added_Chk").prop("checked",true);
		}
		if(!$('#Modified_Chk').prop('checked')){
			$("#Modified_Chk").prop("checked",true);
		}
		if(!$('#Deleted_Chk').prop('checked')){
			$("#Deleted_Chk").prop("checked",true);
		}
		if(OPMClient.FWAReportRuleCompController.compRepDetail != undefined && OPMClient.FWAReportRuleCompController.compRepDetail.isDiffOnly != undefined){
			if(OPMClient.FWAReportRuleCompController.compRepDetail.isDiffOnly == "true"){
				$("#diffTypeCheck").prop("checked",true);
			}else{
				$("#diffTypeCheck").prop("checked",false);
			}
			
		}
		this.set("deviceName",$('#RunnVersdevList').find('option:selected').text());//NO I18N	
	}.observes("OPMClient.FWAReportRuleCompController.compRepDetail"), //NO I18N
	actions:{
		closeDiv:function(){
			$('#fwaRuleCompReportDiv').hide();
			$('#fwaRuleCompSettingsDiv').show();
		},
		viewTypeChange:function(){
			OPMClient.Reports.generateFWAConfigDiffDetail($("#diffTypeCheck").prop("checked"));
		},
		genPdf:function(){
			OPMClient.Reports.generateFWAConfigDiffDetailPDF();
		},
		genXLS:function(){
			OPMClient.Reports.generateFWAConfigDiffDetailPDF('xls');//NO I18N
		},
		mailExport:function(){
			openFWARuleCompMailOption();
		},
		showDiff:function(rowDiff) {
			var lineDiff=rowDiff.lineDiff;
			var ruleName=rowDiff.ruleName1;
			var ruleName2=rowDiff.ruleName2;
			var modType=rowDiff.rowClass;
			var embText=(modType == "staticTable__row diffModifiedLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.modified',{ param0: ruleName} ,this) : (modType == "staticTable__row diffNewLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.added',{ param0: ruleName2} ,this):(modType == "staticTable__row diffDeletedLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.deleted',{ param0: ruleName} ,this):ruleName)));//No I18N
			OPMClient.FWAReportRuleCompController.set("ruleDrillDetail",{});//NO I18N
			OPMClient.Reports.loadFWADiffClassDetail(lineDiff);
			OPMClient.FWAReportRuleCompFileDetailController.set("compDetailHeader",embText);//No I18N
			slideIn(1);
		},
		nextPrevDiff: function(navigate) {
			if(OPMClient.FWAReportRuleCompController.compRepDetail != undefined && OPMClient.FWAReportRuleCompController.compRepDetail.diffContent != undefined){
				var jsonData = OPMClient.FWAReportRuleCompController.compRepDetail.diffContent;
				var currentIndex = this.get("currentIndex");
				var diffArray = OPMClient.FWAReportRuleCompController.compRepDetail.diffArray;
				if(diffArray.length > 0) {
					if(navigate == "next") {
						var nextIndex = currentIndex+1;
						if(nextIndex < diffArray.length) {
							this.set("currentIndex",nextIndex); //No I18N
							$(".fwaDiffContent").scrollTop($(".fwaDiffContent div[data-lineno='"+diffArray[nextIndex]+"']").offset().top - $(".fwaDiffContent .staticTable__row:first").offset().top);
						}
					} else {
						var prevIndex = currentIndex-1;
						if(prevIndex > -1) {
							this.set("currentIndex",prevIndex); //No I18N
							$(".fwaDiffContent").scrollTop($(".fwaDiffContent div[data-lineno='"+diffArray[prevIndex]+"']").offset().top - $(".fwaDiffContent .staticTable__row:first").offset().top);
						}
					}
				}
			}
			
		}
	}
});



OPMClient.FwaConfigRuleCompReportViewComponent = Ember.Component.extend({
	templateName: "components/fwa-rule-comp-report-view", //No I18N
	initDefaults: function() {
		this.set("currentIndex",-1); //No I18N
		this.set("diffData",{});//NO I18N
		this.set("deviceName","");//NO I18N
	}.on("init"), //NO I18N 
	didInsertElement: function() {
//		if(OPMClient.ApplicationController.isFWA){
//			$('.configDiffActions .icon-remove').hide();
//		}
	},
	fwaRuleCompObserver:function(){
		this.set("currentIndex",-1); //No I18N
		this.set("diffData",OPMClient.FWAReportRuleCompController.compRepDetail);//NO I18N
		if(!$('#Added_Chk').prop('checked')){
			$("#Added_Chk").prop("checked",true);
		}
		if(!$('#Modified_Chk').prop('checked')){
			$("#Modified_Chk").prop("checked",true);
		}
		if(!$('#Deleted_Chk').prop('checked')){
			$("#Deleted_Chk").prop("checked",true);
		}
		if(OPMClient.FWAReportRuleCompController.compRepDetail != undefined && OPMClient.FWAReportRuleCompController.compRepDetail.isDiffOnly != undefined){
			if(OPMClient.FWAReportRuleCompController.compRepDetail.isDiffOnly == "true"){
				$("#diffTypeCheck").prop("checked",true);
			}else{
				$("#diffTypeCheck").prop("checked",false);
			}
			
		}
		this.set("deviceName",$('#configdeviceList').find('option:selected').text());//NO I18N	
		$(".select2").select2();
	}.observes("OPMClient.FWAReportRuleCompController.compRepDetail"), //NO I18N
	actions:{
		closeDiv:function(){
			$('#ruleComparisonDiv').hide();
			$('#compareClickDiv').show();
		},
		viewTypeChange:function(){
			OPMClient.Reports.generateConfigCompareReport($("#diffTypeCheck").prop("checked"));
		},
		showDiff:function(rowDiff) {
			var lineDiff=rowDiff.lineDiff;
			var ruleName=rowDiff.ruleName1;
			var ruleName2=rowDiff.ruleName2;
			var modType=rowDiff.rowClass;
			var embText=(modType == "staticTable__row diffModifiedLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.modified',{ param0: ruleName} ,this) : (modType == "staticTable__row diffNewLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.added',{ param0: ruleName2} ,this):(modType == "staticTable__row diffDeletedLine" ? Ember.I18n.t('webclient.fwa.rule.comp.rule.deleted',{ param0: ruleName} ,this):ruleName)));//No I18N
			OPMClient.FWAReportRuleCompController.set("ruleDrillDetail",{});//NO I18N
			OPMClient.Reports.loadFWADiffClassDetail(lineDiff);
			OPMClient.FWAReportRuleCompFileDetailController.set("compDetailHeader",embText);//No I18N
			$('#fwaScheduleAddEditSlide').hide();
			$('#fwaConfigStatusSlide').hide();
			$('#fwaConfigCompareSlide').hide();
			$('#fwaConfigCompareRuleDrillSlide').show();
			slideIn(1);
		},
		nextPrevDiff: function(navigate) {
			if(OPMClient.FWAReportRuleCompController.compRepDetail != undefined && OPMClient.FWAReportRuleCompController.compRepDetail.diffContent != undefined){
				var jsonData = OPMClient.FWAReportRuleCompController.compRepDetail.diffContent;
				var currentIndex = this.get("currentIndex");
				var diffArray = OPMClient.FWAReportRuleCompController.compRepDetail.diffArray;
				if(diffArray.length > 0) {
					if(navigate == "next") {
						var nextIndex = currentIndex+1;
						if(nextIndex < diffArray.length) {
							this.set("currentIndex",nextIndex); //No I18N
							$(".fwaDiffContent").scrollTop($(".fwaDiffContent div[data-lineno='"+diffArray[nextIndex]+"']").offset().top - $(".fwaDiffContent .staticTable__row:first").offset().top);
						}
					} else {
						var prevIndex = currentIndex-1;
						if(prevIndex > -1) {
							this.set("currentIndex",prevIndex); //No I18N
							$(".fwaDiffContent").scrollTop($(".fwaDiffContent div[data-lineno='"+diffArray[prevIndex]+"']").offset().top - $(".fwaDiffContent .staticTable__row:first").offset().top);
						}
					}
				}
			}
			
		},
		genPdf:function(){
			OPMClient.Reports.generateFWAConfigBackupCompareDiffDetailPDF();
		},
		genXLS:function(){
			OPMClient.Reports.generateFWAConfigBackupCompareDiffDetailPDF('xls');//NO I18N
		},
		mailExport:function(){
			openFWARuleCompMailOption();
		}
	}
});

OPMClient.FwaConfigConfigurationCompReportViewComponent = Ember.Component.extend({
	templateName: "FWAConfigCompareDiffView", //No I18N
	initDefaults: function() {
		this.set("currentIndex",-1); //No I18N
		this.set("diffData",{});//NO I18N
	}.on("init"), //NO I18N 
	didInsertElement: function() {
//		if(OPMClient.ApplicationController.isFWA){
//			$('.configDiffActions .icon-remove').hide();	
//		}
	},
	fwaRuleCompObserver:function(){
		this.set("currentIndex",-1); //No I18N
		OPMClient.InventoryDeviceDetailsController.currentDiffIndex = -1;
		var jsonData = OPMClient.FWAReportConfigCompareController.compRepDetail;
		OPMClient.InventoryDeviceDetailsController.configDiffJSONData = jsonData;
		if(jsonData.isSuccess != null && jsonData.isSuccess == false) {
			// Diff is too large/unavailable (e.g. HUGE_DIFF) - show the message centered in the report
			// area itself instead of a top warning banner, and skip the diff-array processing below
			// since no diffLeft/allLeft/diffArray data is available for this case.
			$("#configadded").text("N/A"); //No I18N
			$("#configmodified").text("N/A"); //No I18N
			$("#configdeleted").text("N/A"); //No I18N
			this.set("deviceName",$('#configdeviceList').find('option:selected').text());//NO I18N
			this.set("diffData",'<div class="staticTable__row grid-row m0">' + //No I18N
				'<div class="staticTable__col grid-col p-sm" style="text-align:center;padding:20px;font-weight:bold;">' + //No I18N
				jsonData.statusMsg + '</div></div>'); //No I18N
			return;
		}
		
		if(jsonData.isSuccess != null && jsonData.isSuccess == true) {
			opm_infoMsgs("successMsg",jsonData.statusMsg);//NO I18N
		}
			
		OPMClient.FWAComplianceDetailsController.diffArray = jsonData.diffArray;
		var left_Table ="FirstTable_DiffAlone", right_Table="SecondTable_DiffAlone"; //No I18N
		var addedRow=0;
		var modifiedRow=0;
		var deletedRow=0;
		
		if(jsonData.diffLimitExceeds != true) {
			$("#configadded").text(jsonData.addedCount);
			$("#configmodified").text(jsonData.modifiedCount);
			$("#configdeleted").text(jsonData.deltedCount);
			if(!$("#condif_Deleted_Chk").prop("checked")) {
				$("#condif_Deleted_Chk").prop("checked",true);
			}
			if(!$("#condif_Modified_Chk").prop("checked")) {
				$("#condif_Modified_Chk").prop("checked",true);
			}
			if(!$("#condif_Added_Chk").prop("checked")) {
				$("#condif_Added_Chk").prop("checked",true);
			}
			if(OPMClient.FWAReportConfigCompareSlideController.diffOnly != undefined && OPMClient.FWAReportConfigCompareSlideController.diffOnly != undefined){
				if(OPMClient.FWAReportConfigCompareSlideController.diffOnly == true){
					$("#configdiffTypeCheck").prop("checked",true);
				}else{
					$("#configdiffTypeCheck").prop("checked",false);
				}
				
			}
			if(OPMClient.FWAReportConfigCompareController.lineno != undefined && OPMClient.FWAReportConfigCompareController.lineno != undefined){
				$("#configdiffTypeCheck").val(OPMClient.FWAReportConfigCompareController.lineno);
			}
			
			var htmlContent='';
			if($("#configdiffTypeCheck").prop("checked")) {
				if(jsonData.diffLeft != undefined){
					for (var intex = 0; intex < jsonData.diffLeft.length; intex++) {
						var array_element11 = jsonData.diffLeft[intex];
						var array_element12 = jsonData.diffRight[intex];
						
						var rowClass = "diffNormalLine";  //No I18N
						if(array_element11.styleClass == "diffModifiedLine" || array_element12.styleClass == "diffModifiedLine") {
							rowClass = "diffModifiedLine";  //No I18N
						}
						if(array_element11.styleClass == "diffDeletedLine" || array_element12.styleClass == "diffDeletedLine") {
							rowClass = "diffDeletedLine";  //No I18N
						}
						if(array_element11.styleClass == "diffNewLine" || array_element12.styleClass == "diffNewLine") {
							rowClass = "diffNewLine";  //No I18N
						}

						var rowHtml='<div class="staticTable__row '+rowClass+' noBeforeAfter grid-row m0" data-lineno="'+array_element11.rowCount+'"><div class="staticTable__col grid-col-1 p-sm">'+array_element11.rowCount+'</div><div class="staticTable__col grid-col p-sm" id="diffOnlyLeft'+intex+'">'+array_element11.rowData+'</div><div class="staticTable__col grid-col p-sm" id="diffOnlyRight'+intex+'">'+array_element12.rowData+'</div></div>'
						htmlContent=htmlContent+rowHtml;
					}
				}else{
					opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.fwa.backupconfig.config.nochange',this));//No I18N
					htmlContent='<div></div>';//No I18N
				}
				
			} else {
				for (var intex = 0; intex < jsonData.allLeft.length; intex++) {
					var array_element11 = jsonData.allLeft[intex];
					var array_element12 = jsonData.allRight[intex];
					var rowClass = "diffNormalLine";  //No I18N
					if(array_element11.styleClass == "diffModifiedLine" || array_element12.styleClass == "diffModifiedLine") {
						rowClass = "diffModifiedLine";  //No I18N
					}
					if(array_element11.styleClass == "diffDeletedLine" || array_element12.styleClass == "diffDeletedLine") {
						rowClass = "diffDeletedLine";  //No I18N
					}
					if(array_element11.styleClass == "diffNewLine" || array_element12.styleClass == "diffNewLine") {
						rowClass = "diffNewLine";  //No I18N
					}

					var rowHtml='<div class="staticTable__row '+rowClass+' noBeforeAfter grid-row m0" data-lineno="'+array_element11.rowCount+'"><div class="staticTable__col grid-col-1 p-sm">'+array_element11.rowCount+'</div><div class="staticTable__col grid-col p-sm" id="diffOnlyLeft'+intex+'">'+array_element12.rowData+'</div><div class="staticTable__col grid-col p-sm" id="diffOnlyRight'+intex+'">'+array_element12.rowData+'</div></div>'
					htmlContent=htmlContent+rowHtml;
				}
			}
		}else {
			opm_infoMsgs("errorMsg", jsonData.diffLimitMsg);//No I18N
		} 
		this.set("deviceName",$('#configdeviceList').find('option:selected').text());//NO I18N	
		this.set("diffData",htmlContent);//NO I18N		
	}.observes("OPMClient.FWAReportConfigCompareController.compRepDetail"), //NO I18N
	actions:{
		genPdf:function(){
			OPMClient.Reports.generateFWAConfigBackupCompareDiffDetailPDF();
		},
		genXLS:function(){
			OPMClient.Reports.generateFWAConfigBackupCompareDiffDetailPDF("xls"); //No I18N
		},
		mailExport:function(){
			openFWARuleCompMailOption();
		},
		showAdded: function(sel) {
			if($("#Config_"+sel+"_Div").hasClass('active')) {
				$("#Config_"+sel+"_Div").removeClass('active');
				$("."+sel+"Row").hide();
			} else {
				$("#Config_"+sel+"_Div").addClass('active');
				$("."+sel+"Row").show();
			}
		},nextPrevDiff: function(navigate) {
			var jsonData = OPMClient.InventoryDeviceDetailsController.configDiffJSONData;
			var currentIndex = OPMClient.InventoryDeviceDetailsController.currentDiffIndex;
			var diffArray = jsonData.diffArray;
			if(diffArray.length > 0) {
				if(navigate == "next") {
					var nextIndex = currentIndex+1;
					if(nextIndex < diffArray.length) {
						OPMClient.InventoryDeviceDetailsController.currentDiffIndex = nextIndex;
						$(".fwaConfigChangeDiffContent").scrollTop($(".fwaConfigChangeDiffContent div[data-lineno='"+diffArray[nextIndex]+"']").offset().top - $(".fwaConfigChangeDiffContent .staticTable__row:first").offset().top);
					}
				} else {
					var prevIndex = currentIndex-1;
					if(prevIndex > -1) {
						OPMClient.InventoryDeviceDetailsController.currentDiffIndex = prevIndex;
						$(".fwaConfigChangeDiffContent").scrollTop($(".fwaConfigChangeDiffContent div[data-lineno='"+diffArray[prevIndex]+"']").offset().top - $(".fwaConfigChangeDiffContent .staticTable__row:first").offset().top);
					}
				}
			}
		},
		changeLineNo:function()
		{
			OPMClient.FWAReportConfigCompareController.lineno=$('#configlineNo').val();
			OPMClient.Reports.generateConfigCompareReport(OPMClient.FWAReportConfigCompareSlideController.diffOnly);
		},
		changeDiffType:function()
		{
			if($('#configdiffTypeCheck').prop("checked")){
				OPMClient.FWAReportConfigCompareSlideController.diffOnly=true;
			}else{
				OPMClient.FWAReportConfigCompareSlideController.diffOnly=false;
			}
			OPMClient.Reports.generateConfigCompareReport(OPMClient.FWAReportConfigCompareSlideController.diffOnly);
		},
		closeDiffView:function()
		{
			window.history.back();
		},
		closeDiv:function(){
			$('#configComparisonDiv').hide();
			$('#compareClickDiv').show();
		}
	
	}
});
OPMClient.FwaRuleTrackHistSubgridComponent = Ember.Component.extend({
	templateName: "FWARuleTrackHistSubGrid",//No I18N
	initDefaults: function() {
		var widgetObj = this.get('obj');
		var i18nResp = this.get('i18nfields');
		var i18nMap=[];
		
		var i18nList=['ruleName','policyName','sourceList','destinationList','serviceList','applicationList','fromZoneList','toZoneList','action','log','ruleStatus'];//NO I18N
		if(!widgetObj.haspolicy){
			if(!widgetObj.hasApplication){
				i18nList=['ruleName','sourceList','destinationList','serviceList','fromZoneList','toZoneList','action','log','ruleStatus'];//NO I18N
			}else{
				i18nList=['ruleName','sourceList','destinationList','serviceList','applicationList','fromZoneList','toZoneList','action','log','ruleStatus'];//NO I18N
			}
		}else{
			if(!widgetObj.hasApplication){
				i18nList=['ruleName','policyName','sourceList','destinationList','serviceList','fromZoneList','toZoneList','action','log','ruleStatus'];//NO I18N
			}else{
				i18nList=['ruleName','policyName','sourceList','destinationList','serviceList','applicationList','fromZoneList','toZoneList','action','log','ruleStatus'];//NO I18N
			}
		}
		for(var i=0;i<i18nList.length;i++){
			var temp={"key":i18nList[i],"val":i18nResp[i18nList[i]]};
			i18nMap.push(temp);
		}
		if(widgetObj.CHANGE_TYPE == 2){
			var MODIFIED_FIELDS = JSON.parse(widgetObj.MODIFIED_FIELDS);
			var PREVIOUS_RULE_DETAILS = JSON.parse(widgetObj.PREVIOUS_RULE_DETAILS);
			var RULE_DETAILS = JSON.parse(widgetObj.RULE_DETAILS);
			var detailMap=[];
			var oldRow=[{"className":"boldTxt","value":Ember.I18n.t('webclient.fwa.ruletrack.old.content',this),"type":"string"}];//NO I18N
			var newRow=[{"className":"boldTxt","value":Ember.I18n.t('webclient.fwa.ruletrack.new.content',this),"type":"string"}];//NO I18N
			var headerVal=[''];
			
			for(var ij=0;ij<i18nMap.length;ij++){
				var tempmap=i18nMap[ij];
				var key=i18nMap[ij].key;
				var val=i18nMap[ij].val;

				headerVal.push(val);
				var prevValFinal="";
				var currValFinal="";
				var cellClass="";
				
				var prevsingVal={type:"string"};//NO I18N
				var currsingVal={type:"string"};//NO I18N
				if(MODIFIED_FIELDS.indexOf(key) >= 0){
					cellClass="fwaDiffModifiedRow";//NO I18N
				}
				if(PREVIOUS_RULE_DETAILS[key] != undefined){
					var prevVal=PREVIOUS_RULE_DETAILS[key];
					if(prevVal != undefined && Array.isArray(prevVal)){
						prevsingVal.value = prevVal;
						prevsingVal.type = "array";
					}else{
						prevValFinal=(prevVal == undefined ? "" : prevVal);
						prevsingVal.value = prevValFinal;
					}
				}
				oldRow.push({"className":cellClass,"value":prevsingVal.value,"type":prevsingVal.type});
				if(RULE_DETAILS[key] != undefined){
					var currVal=RULE_DETAILS[key];
					
					if(currVal != undefined && Array.isArray(currVal)){
						currsingVal.value = currVal;
						currsingVal.type = "array";
					}else{
						currValFinal=(currVal == undefined ? "" : currVal);
						currsingVal.value = currValFinal;
					}
				}
				newRow.push({"className":cellClass,"value":currsingVal.value,"type":currsingVal.type});
			
			}
			detailMap.push(oldRow);
			detailMap.push(newRow);
			this.set("ruleModifiedHeaderDetail",headerVal);//NO I18N
			this.set("ruleChangeDetail",detailMap);//NO I18N
		}else if(widgetObj.CHANGE_TYPE == 3){
			var headerVal=[''];
			var finVal=[];
			var tableVal={"value":Ember.I18n.t('webclient.fwa.ruletrack.old.content',this),"type":"string"};//NO I18N
			finVal.push(tableVal);
			var PREVIOUS_RULE_DETAILS = JSON.parse(widgetObj.PREVIOUS_RULE_DETAILS);
			for(var ij=0;ij<i18nMap.length;ij++){
				var tempmap=i18nMap[ij];
				var key=i18nMap[ij].key;
				var val=i18nMap[ij].val;
				headerVal.push(val);
				if(PREVIOUS_RULE_DETAILS[key] != undefined){
					var prevVal=PREVIOUS_RULE_DETAILS[key];
					var prevValFinal="";
					if(prevVal != undefined && Array.isArray(prevVal)){
						tableVal={"value":prevVal,"type":"array"};//NO I18N
					}else{
						prevValFinal=(prevVal == undefined ? "" : prevVal);
						tableVal={"value":prevValFinal,"type":"string"};//NO I18N
					}
				}else{
					tableVal={"value":"","type":"string"};//NO I18N
				}
				finVal.push(tableVal);
			}
			this.set("ruleDeletedHeaderDetail",headerVal);//NO I18N
			this.set("ruleDeletedTableDetail",finVal);//NO I18N
		}else if(widgetObj.CHANGE_TYPE == 1){
			var headerVal=[''];
			var RULE_DETAILS = JSON.parse(widgetObj.RULE_DETAILS);
			var finVal=[];
			var tableVal={"value":Ember.I18n.t('webclient.fwa.ruletrack.new.content',this),"type":"string"};//NO I18N
			finVal.push(tableVal);
			for(var ij=0;ij<i18nMap.length;ij++){
				var tempmap=i18nMap[ij];
				var key=i18nMap[ij].key;
				var val=i18nMap[ij].val;
				
				headerVal.push(val);
				if(RULE_DETAILS[key] != undefined){
					var currVal=RULE_DETAILS[key];
					var currValFinal="";
					if(currVal != undefined && Array.isArray(currVal)){
						tableVal={"value":currVal,"type":"array"};//NO I18N
					}else{
						currValFinal=(currVal == undefined ? "" : currVal);
						tableVal={"value":currValFinal,"type":"string"};//NO I18N
					}
				}else{
					tableVal={"value":"","type":"string"};//NO I18N
				}
				finVal.push(tableVal);
			}
			this.set("ruleAddedHeaderDetail",headerVal);//NO I18N
			this.set("ruleAddedTableDetail",finVal);//NO I18N
		}
	}.on("init"), //NO I18N 
	didInsertElement: function(){
		var widgetObj = this.get('obj');
		
	},
	actions :{
		
	}
});

OPMClient.FwaRuleMgmtAlrtSubgridComponent = Ember.Component.extend({
	templateName: "FWARuleMgmtAlertSubGrid",//No I18N
	initDefaults: function() {
		var widgetObj = this.get('obj');
		this.set("gridID","RuleMgmtAlrtSubGrid"+widgetObj.rid);//NO I18N
	}.on("init"), //NO I18N 
	didInsertElement: function(){
		var widgetObj = this.get('obj');
		var gridId = this.get('gridID');
		var colNamesList = ['','',Ember.I18n.t('dashboard.name.nwconfig',this),Ember.I18n.t('webclient.fwa.rulemgmt.alarm.optimization',this),Ember.I18n.t('webclient.fwa.standards.cleanup',this),Ember.I18n.t('fwa.rule.expiry',this),Ember.I18n.t('fwa.risk.analysis',this),Ember.I18n.t("webclient.rightpanel.Actions",this)]; //No I18N
		var colModelList = [
		                    { name: 'rid', index: 'rid' , hidden: true}, //No I18N
		                    { name: 'alertNotificationFields', index: 'alertNotificationFields' , hidden: true}, //No I18N
		                    { name: 'overviewTxt', index: 'overviewTxt' ,width:20, formatter: RuleMgmtAlrtFormatter}, //No I18N
		                    { name: 'optimizationTxt', index: 'optimizationTxt' ,width:18, formatter: RuleMgmtAlrtFormatter}, //No I18N
		                    { name: 'unusedTxt', index: 'unusedTxt' ,width:18, formatter: RuleMgmtAlrtFormatter}, //No I18N
		                    { name: 'expiryTxt', index: 'expiryTxt' ,width:15, formatter: RuleMgmtAlrtFormatter}, //No I18N
		                    { name: 'riskTxt', index: 'riskTxt' ,width:20, formatter: RuleMgmtAlrtFormatter}, //No I18N
		                    { name: 'Edit', index: 'Edit',width:9,formatter:RuleMgmtAlrtActionFormatter,sortable:false,search:false,hidden:(window.OPM.isFWAServer || !window.OPM.isAdministrator)} //No I18N
		                    ];
		 $('#'+gridId).jqGrid('GridUnload');//No I18N
		 opm_loadJQgridWithData('#'+gridId, [widgetObj], colNamesList, colModelList, "", "", "RuleMgmtAlrtProfile",""); //No I18N
		 $('#'+gridId).jqGrid('setGridWidth', $("#fwaRuleMgmtAlrtListAccordian").width()-20);

	}
});

OPMClient.FwaRuleTrackRuleNameFilterComponent = Ember.Component.extend({
	didInsertElement: function(){
		var ruleTrackObj=OPMClient.FWAComplianceRuleTrackingController.selRuleDetail;
		$('#'+OPMClient.FWAComplianceRuleTrackingController.msgUniqId).remove();
	}
});
OPMClient.FwaHighAvailabilityConfigureComponent = Ember.Component.extend({
	templateName: "FwaHighAvailabilityConfigure",//No I18N
	initDefaults: function() {
		OPMClient.FWAReportConfigOptionController.set("vendorSelectList",[]);//No I18N
		 var ha_id = this.get('ha_id');
		 var data ={};
		 if(ha_id != 'Add'){
			 data.ha_id = ha_id;
		 }
		 var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/fwasettings/getFirewallResourcesForHAMapping',data); //No I18N
		 var devList = (response != undefined && response.resourcesMap != undefined) ? response.resourcesMap : [];
		 this.set("deviceListMap",devList);
		 this.set("primaryDevIpAddress","");
		 this.set("secondaryDevIpAddress","");
		 this.set("haDisplayName","");
		 if(ha_id != 'Add'){
			 var gridData = (OPMClient.FWAHighAvailabilityAddSettingsController.highAvailabilityDetail != undefined && OPMClient.FWAHighAvailabilityAddSettingsController.highAvailabilityDetail.gridData != undefined )?OPMClient.FWAHighAvailabilityAddSettingsController.highAvailabilityDetail.gridData : [];
			 if(gridData != undefined){
				 for(var i=0;i<gridData.length ;i++){
					 if(gridData[i].ha_id == ha_id){
						 var haProfileDetail = gridData[i];
						 this.set("haDisplayName",haProfileDetail.dispName);
						 if(haProfileDetail.primaryDeviceDetails != undefined){
							 if(haProfileDetail.primaryDeviceDetails.rid != undefined){
								 this.set("primaryDevId",haProfileDetail.primaryDeviceDetails.rid);
							 }else{
								 this.set("primaryDevIpAddress",haProfileDetail.primaryDeviceDetails.primaryDeviceId); //NO I18N
							 }
						 }
						 if(haProfileDetail.secondaryDeviceDetails != undefined){
							 if(haProfileDetail.secondaryDeviceDetails.rid != undefined){
								 this.set("secondaryDevId",haProfileDetail.secondaryDeviceDetails.rid);
							 }else{
								 this.set("secondaryDevIpAddress",haProfileDetail.secondaryDeviceDetails.secondaryDeviceId); //NO I18N
							 }
						 }
						 break;
					 }
				 }
			 }
		 }else{
			 this.set("primaryDevId",(devList[0] != undefined)? devList[0].RESOURCEID : '');
			 this.set("secondaryDevId",(devList[0] != undefined)? devList[0].RESOURCEID : '');
		 }
	}.on("init"), //NO I18N 
	actions:{
		showPrimaryDiv:function(type){
			if(type == "manual"){
				$('#primaryManualDiv').show();
				$('#primaryExistingDiv').hide();
			}else{
				$('#primaryExistingDiv').show();
				$('#primaryManualDiv').hide();
			}
		},
		showSecondaryDiv:function(type){
			if(type == "manual"){
				$('#secondaryManualDiv').show();
				$('#secondaryExistingDiv').hide();
			}else{
				$('#secondaryExistingDiv').show();
				$('#secondaryManualDiv').hide();
			}
		},
		saveHAConf:function(){
			OPMClient.Settings.saveHighAvailabilityConfiguration(this.get('ha_id'));
		}
	},
	didInsertElement: function(){
		var ha_id = this.get('ha_id');
		if(ha_id == 'Add'){
			$('#primaryExistingDiv').show();
			$('#secondaryExistingDiv').show();
			$('#primaryManualDiv').hide();
			$('#secondaryManualDiv').hide();
		}else{
			 var gridData = (OPMClient.FWAHighAvailabilityAddSettingsController.highAvailabilityDetail != undefined && OPMClient.FWAHighAvailabilityAddSettingsController.highAvailabilityDetail.gridData != undefined )?OPMClient.FWAHighAvailabilityAddSettingsController.highAvailabilityDetail.gridData : [];
			 if(gridData != undefined){
				 for(var i=0;i<gridData.length ;i++){
					 if(gridData[i].ha_id == ha_id){
						 var haProfileDetail = gridData[i];
						 if(haProfileDetail.primaryDeviceDetails != undefined){
							 if(haProfileDetail.primaryDeviceDetails.rid != undefined){
								 $('#primaryExistingDiv').show();
								 $('#primaryManualDiv').hide();
							 }else{
								 $('#primaryManualDiv').show();
								 $('#primaryExistingDiv').hide();
							 }
						 }
						 if(haProfileDetail.secondaryDeviceDetails != undefined){
							 if(haProfileDetail.secondaryDeviceDetails.rid != undefined){
								 $('#secondaryExistingDiv').show();
								 $('#secondaryManualDiv').hide();
							 }else{
								 $('#secondaryManualDiv').show();
								 $('#secondaryExistingDiv').hide();
							 }
						 }
						 break;
					 }
				 }
			 }
		}
	}
});
OPMClient.FwaRulemgmtDetailTableComponent = Ember.Component.extend({
	templateName: "FWAComplianceRuleMgmtDetailTable",//No I18N
	headerTitle: '',//No I18N
	initDefaults: function() {
		var self = this;
		var filterId = this.get('filterId');
		var category = this.get('category');
		var reportType = this.get('reportType') || 'ruleMgmtOverview'; //No I18N
		
		if(reportType == 'riskAnalysis'){//No I18N
			var searchTypes = [];
			var critMap = {};
			var isDefault = category == 0;
			// First get the filter options
			$.ajax({
				url:window.OPM.apiUrlPattern + '/fwarulemgmt/getCustomRiskFilterOptions',//No I18N  
				type: 'GET', //No I18N
				async:false,
				success: function(response){
					if(response != undefined){
						searchTypes = response.searchTypes || [];
						critMap = response.critMap || {};
					}
				}
			});
			
			var data = {"riskId" : filterId, "isDefault" : isDefault};//No I18N
			$.ajax({
				url:window.OPM.apiUrlPattern + '/fwarulemgmt/getCustomRiskDetails',//No I18N  
				type: 'GET', //No I18N
				async:false,
				data:data,
				success: function(response){
					if(response != undefined && response.isSuccess != undefined && response.isSuccess == true && response.riskDetails != undefined){
						var riskDetails = response.riskDetails;
						var widData = [];
						
						widData.push({
							type: "string",//No I18N
							col1: Ember.I18n.t('webclient.fwa.risk.custom.risk.name'),//No I18N
							col2: riskDetails.riskName || ''
						});
						self.set("headerTitle", Ember.I18n.t('webclient.fwa.risk.details'));//No I18N
						var severityColors = {"Critical":"red","Low":"green","High":"orange","Medium":"#b3b315","Attention":"violet"}; //No I18N
						var severityColor = severityColors[riskDetails.riskSeverity] || '';
						widData.push({
							type: "coloredString",//No I18N
							col1: Ember.I18n.t('webclient.map.filemonitor.alarmseverity'),//No I18N
							col2: riskDetails.riskSeverity || '',
							colorStyle: severityColor ? "color:" + severityColor : ""//No I18N
						});
						
						widData.push({
							type: "string",//No I18N
							col1: Ember.I18n.t('webclient.fwa.risk.custom.profiles.desc'),//No I18N
							col2: riskDetails.riskDescription || ''
						});
						
						widData.push({
							type: "string",//No I18N
							col1: Ember.I18n.t('fwa.compliance.Comp_Recommendation'),//No I18N
							col2: riskDetails.recommendation || ''
						});
						
						if(riskDetails.query && riskDetails.query !== '1'){
							widData.push({
								type: "string",//No I18N
								col1: Ember.I18n.t('ncm.complianceiq.rule.criteria_pattern'),//No I18N
								col2: riskDetails.query
							});
						}
						
						// Parse criteriaData and create criteria table
						if(riskDetails.criteriaData){
							var criteriaDataArr = [];
							try {
								criteriaDataArr = typeof riskDetails.criteriaData === 'string' ? JSON.parse(riskDetails.criteriaData) : riskDetails.criteriaData;//NO I18N
							} catch(e) {
								criteriaDataArr = [];
							}
							
							if(Array.isArray(criteriaDataArr) && criteriaDataArr.length > 0){
								var criteriaTableData = [];
								
								for(var i = 0; i < criteriaDataArr.length; i++){
									var item = criteriaDataArr[i];
									var fieldValue = item.field;
									var conditionValue = item.condition;
									
									// Get field dispName from searchTypes
									var fieldDispName = fieldValue;
									for(var j = 0; j < searchTypes.length; j++){
										if(searchTypes[j].value === fieldValue){
											fieldDispName = searchTypes[j].dispName;
											break;
										}
									}
									
									// Get condition dispText from critMap
									var conditionDispText = conditionValue;
									var type = '';
									var criteriaTypes = critMap[fieldValue] || [];
									for(var k = 0; k < criteriaTypes.length; k++){
										if(criteriaTypes[k].value === conditionValue){
											conditionDispText = criteriaTypes[k].dispText;
											type = criteriaTypes[k].type;
											break;
										}
									}
									
									// Get value based on type
									var valueStr = '';
									if(type === 'ipaddress' || type === 'nonEmptyString' || type === 'objectSingleSelect'){
										valueStr = item.value || '';
									} else if(type === 'iprange'){//NO I18N
										if(item.valueObj){
											valueStr = (item.valueObj.start || '') + ' - ' + (item.valueObj.end || '');
										}
									} else if(type === 'ipaddresscommaseperated' || type === 'objectMultiSelect'){//NO I18N
										if(item.valueArray){
											valueStr = item.valueArray.join(', ');
										}
									} else if(type === 'singlePort'){//NO I18N
										if(item.valueObj){
											var portType = item.valueObj.type == 1 ? 'Source' : (item.valueObj.type == 2 ? 'Destination' : 'Any');
											valueStr = (item.valueObj.protocol || 'TCP') + ' | ' + portType + ' | ' + (item.valueObj.port || '');//No I18N
										}
									} else if(type === 'multiPort'){//NO I18N
										if(item.valueObj){
											var portType = item.valueObj.type == 1 ? 'Source' : (item.valueObj.type == 2 ? 'Destination' : 'Any');
											valueStr = (item.valueObj.protocol || 'TCP') + ' | ' + portType + ' | ' + (item.valueObj.value ? item.valueObj.value.join(', ') : '');//No I18N
										}
									} else if(type === 'rangePort'){//NO I18N
										if(item.valueObj){
											var portType = item.valueObj.type == 1 ? 'Source' : (item.valueObj.type == 2 ? 'Destination' : 'Any');
											valueStr = (item.valueObj.protocol || 'TCP') + ' | ' + portType + ' | ' + (item.valueObj.startPort || '') + ' - ' + (item.valueObj.endPort || '');//No I18N
										}
									} else if(type === 'logStatus'){//NO I18N
										valueStr = item.value == 1 ? 'Enabled' : 'Disabled';//NO I18N
									} else if(type === 'ruleStatus'){//NO I18N
										valueStr = item.value == 1 ? 'Enabled' : 'Disabled';//NO I18N
									} else if(type === 'ruleDirection'){//NO I18N
										valueStr = item.value || '';
									} else if(type === 'singleTime'){//NO I18N
										valueStr = item.value || '';
									} else if(type === 'rangeTime'){//NO I18N
										if(item.valueObj){
											valueStr = (item.valueObj.startTime || '') + ' - ' + (item.valueObj.endTime || '');
										}
									} else {
										valueStr = item.value || '';
									}
									
									criteriaTableData.push({
										field: fieldDispName,
										condition: conditionDispText,
										value: valueStr
									});
									if(riskDetails.query && riskDetails.query !== '1'){
										criteriaTableData[criteriaTableData.length - 1].index = item.keyName;
									}
								}
								
								// Add criteria table to widData with type table
								var tableHeaders = [Ember.I18n.t('webclient.fwa.filter.field'), Ember.I18n.t('webclient.admin.syslogrules.condition'), Ember.I18n.t('webclient.devices.snapshot.editprocessmonitor.thresvalue')];//NO I18N
								if(riskDetails.query && riskDetails.query !== '1'){
									tableHeaders.unshift('#');
								}
								widData.push({
									type: "table",//No I18N
									col1: Ember.I18n.t('webclient.fwa.risk.criteria'),//No I18N
									tableHeaders: tableHeaders,
									showIndex: (riskDetails.query && riskDetails.query !== '1'),
									tableRows: criteriaTableData
								});
							}
						}
						self.set('widgetData', { widData: widData });//No I18N
					}
				}
			});
		}
	}.on("init"), //NO I18N
	didInsertElement:function(){
		$('#FWAComplianceRuleMgmtDetailTableTitle').text(this.get('headerTitle') || '');//No I18N
	},
	actions:{
		closeSlide:function(){
			window.history.back();
		}
	}
});
OPMClient.FwaRulemgmtOverviewSearchCriteriaComponent = Ember.Component.extend({
	templateName: "FWAComplianceRuleMgmtOverviewSearchCriteria",//No I18N
	filterDataEnabled: false,
	criteria: [],
	showCriteriaPattern: false,
	filterName: "",
	riskName: "",
	riskDescription: "",
	recommendation: "",
	riskCategory: "Critical",//No I18N
	initDefaults: function() {
		var self = this;
		var filterId = this.get('filterId');
		var reportType = this.get('reportType') || 'ruleMgmtOverview'; //No I18N

		var data ={"riskId" : filterId};//No I18N
		if(reportType == 'riskAnalysis' && filterId != 'none'){//No I18N
			$.ajax({
				url:window.OPM.apiUrlPattern + '/fwarulemgmt/getCustomRiskDetails',//No I18N  
				type: 'GET', //No I18N
				async:false,
				data:data,
				success: function(response){
					if(response != undefined && response.isSuccess != undefined && response.isSuccess == true && response.riskDetails != undefined){
						var riskDetails = response.riskDetails;
						self.set('riskName', riskDetails.riskName || ''); //No I18N
						self.set('riskDescription', riskDetails.riskDescription || '');//No I18N
						self.set('recommendation', riskDetails.recommendation || '');//No I18N
						self.set('riskCategory', riskDetails.riskSeverity || 'Critical');//No I18N
						OPMClient.FWAOverviewFilterCriteriaController.set('filterParamValue', JSON.parse(riskDetails.criteriaData) || []);//No I18N
						OPMClient.FWAOverviewFilterCriteriaController.set('filterPatternValue', riskDetails.query || '');//No I18N
					}
				}
			});
		}
		this.set("reportType", reportType); //No I18N
		var url = window.OPM.apiUrlPattern + ((reportType == 'ruleMgmtOverview') ? '/fwacompliance/getAdvancedSearchFilterOptions' : '/fwarulemgmt/getCustomRiskFilterOptions'); //No I18N
		var data = {};
		if(reportType == 'ruleMgmtOverview'){
			data ={"isDeviceGroup":OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected};//No I18N  
		}
		$.ajax({
			url:url,
			type: 'GET', //No I18N
			async:false,
			data:data,
			success: function(response){
				var searchTypes = response.searchTypes || [];
				var critMap = response.critMap || {};
				self.set("searchTypes", searchTypes); //No I18N
				self.set("critMap", critMap); //No I18N
				var isEdit = (filterId == "none") ? false : true; //No I18N
				var filterParamValue = OPMClient.FWAOverviewFilterCriteriaController.filterParamValue;
				if(!isEdit){
					if(filterParamValue && filterParamValue !== ''){
						// Parse filterParamValue and create criteria array
						self.loadCriteriaFromFilterParamValue(filterParamValue, critMap);
					} else {
						self.set("criteria",[]); //No I18N
						self.addNewCriteriaObj();
					}
				}else{
					self.set("filterName",OPMClient.FWAOverviewFilterCriteriaController.filterName);//No I18N
					if(filterParamValue && filterParamValue !== ''){
						// Parse filterParamValue and create criteria array for edit mode
						self.loadCriteriaFromFilterParamValue(filterParamValue, critMap);
					} else {
						self.set("criteria",[]); //No I18N
						self.addNewCriteriaObj();
					}
				}
			}
		});

	}.on("init"), //NO I18N 
	loadCriteriaFromFilterParamValue: function(filterParamValue, critMap) {
		var self = this;
		var parsedData = [];
		try {
			parsedData = typeof filterParamValue === 'string' ? JSON.parse(filterParamValue) : filterParamValue;//NO I18N
		} catch(e) {
			this.set("criteria", []); //No I18N
			this.addNewCriteriaObj();
			return;
		}
		
		if(!Array.isArray(parsedData) || parsedData.length === 0) {
			this.set("criteria", []); //No I18N
			this.addNewCriteriaObj();
			return;
		}
		
		// Sort parsedData by keyName to maintain order
		parsedData.sort(function(a, b) {
			return (a.keyName || 0) - (b.keyName || 0);
		});
		
		var criteriaArray = [];
		
		for(var i = 0; i < parsedData.length; i++) {
			var item = parsedData[i];
			var filterType = item.field;
			var criteriaTypeValue = item.condition;
			
			// Find the criteria type definition from critMap
			var criteriaTypes = critMap[filterType] || [];
			var criteriaTypeDef = null;
			for(var j = 0; j < criteriaTypes.length; j++) {
				if(criteriaTypes[j].value === criteriaTypeValue) {
					criteriaTypeDef = criteriaTypes[j];
					break;
				}
			}
			
			if(!criteriaTypeDef) {
				continue;
			}
			
			var type = criteriaTypeDef.type;
			var criteriaObj = {
				index: i,
				rowNumber: i + 1,
				filterTypeValue: filterType,
				criteriaTypeValue: criteriaTypeValue,
				criteriaValue: '',
				valueObj: null,
				startIp: '',
				endIp: '',
				port: '',
				startPort: '',
				endPort: '',
				protocol: 'TCP',//NO I18N
				portType: 'Source',//NO I18N
				logStatus: 'enabled',//NO I18N
				ruleStatus: 'enabled',//NO I18N
				ruleDirection: 'inbound',//NO I18N
				singleTime: '',//NO I18N
				startTime: '',//NO I18N
				endTime: '',//NO I18N
				count: '',//NO I18N
				andOr: item.andOr || 'AND',//NO I18N
				showAddButton: false,
				showDeleteButton: true,
				showAndOr: true
			};
			
			// Parse value based on type
			if(type === 'ipaddress' || type === 'nonEmptyString' || type === 'objectSingleSelect') {
				criteriaObj.criteriaValue = item.value || '';
			} else if(type === 'iprange') {//NO I18N
				if(item.valueObj) {
					criteriaObj.startIp = item.valueObj.start || '';
					criteriaObj.endIp = item.valueObj.end || '';
				}
			} else if(type === 'ipaddresscommaseperated' || type === 'objectMultiSelect') {//NO I18N
				if(item.valueArray) {
					criteriaObj.criteriaValue = item.valueArray.join(',');
				}
			} else if(type === 'singlePort') {//NO I18N
				if(item.valueObj) {
					criteriaObj.port = item.valueObj.port ? item.valueObj.port.toString() : '';
					criteriaObj.protocol = item.valueObj.protocol || 'TCP';//NO I18N
					criteriaObj.portType = item.valueObj.type == 1 ? 'Source' : (item.valueObj.type == 2 ? 'Destination' : 'Any');
					if(item.valueObj.count !== undefined && item.valueObj.count !== null) {
						criteriaObj.count = item.valueObj.count.toString();
					} else if(item.value !== undefined && item.value !== null) {
						criteriaObj.count = item.value.toString();
					}
				}
			} else if(type === 'count') {//NO I18N
				if(item.value !== undefined && item.value !== null) {
					criteriaObj.count = item.value.toString();
					criteriaObj.criteriaValue = criteriaObj.count;
				}
			} else if(type === 'multiPort') {//NO I18N
				if(item.valueObj) {
					criteriaObj.port = item.valueObj.value ? item.valueObj.value.join(',') : '';
					criteriaObj.protocol = item.valueObj.protocol || 'TCP';//NO I18N
					criteriaObj.portType = item.valueObj.type == 1 ? 'Source' : (item.valueObj.type == 2 ? 'Destination' : 'Any');
				}
			} else if(type === 'rangePort') {//NO I18N
				if(item.valueObj) {
					criteriaObj.startPort = item.valueObj.startPort ? item.valueObj.startPort.toString() : '';
					criteriaObj.endPort = item.valueObj.endPort ? item.valueObj.endPort.toString() : '';
					criteriaObj.protocol = item.valueObj.protocol || 'TCP';//NO I18N
					criteriaObj.portType = item.valueObj.type == 1 ? 'Source' : (item.valueObj.type == 2 ? 'Destination' : 'Any');
				}
			} else if(type === 'logStatus') {//NO I18N
				criteriaObj.logStatus = item.value == 1 ? 'enabled' : 'disabled';//NO I18N
			} else if(type === 'ruleStatus') {//NO I18N
				criteriaObj.ruleStatus = item.value == 1 ? 'enabled' : 'disabled';//NO I18N
			} else if(type === 'ruleDirection') {//NO I18N
				criteriaObj.ruleDirection = item.value === 'Inbound' ? 'inbound' : 'outbound';//NO I18N
			} else if(type === 'singleTime') {//NO I18N
				criteriaObj.singleTime = item.value || '';
				criteriaObj.criteriaValue = item.value || '';
			} else if(type === 'rangeTime') {//NO I18N
				if(item.valueObj) {
					criteriaObj.startTime = item.valueObj.startTime || '';
					criteriaObj.endTime = item.valueObj.endTime || '';
					criteriaObj.valueObj = item.valueObj;
				}
			}
			
			criteriaArray.push(criteriaObj);
		}
		
		// Fix showAddButton, showDeleteButton, showAndOr for the array
		if(criteriaArray.length > 0) {
			// First item: no delete button if only one item
			if(criteriaArray.length === 1) {
				criteriaArray[0].showDeleteButton = false;
				criteriaArray[0].showAndOr = false;
			}
			// Last item has add button, no showAndOr
			criteriaArray[criteriaArray.length - 1].showAddButton = true;
			criteriaArray[criteriaArray.length - 1].showAndOr = false;
			
			// Show criteria pattern if more than 1 criteria
			if(criteriaArray.length >= 2) {
				this.set('showCriteriaPattern', true); //No I18N
			}
		}
		
		// Use filterPatternValue from controller if available and extract andOr values
		var filterPatternValue = OPMClient.FWAOverviewFilterCriteriaController.filterPatternValue;
		if(criteriaArray.length >= 2 && filterPatternValue && filterPatternValue !== '') {
			// Extract operators from the pattern and assign to criteria
			var andOrValues = filterPatternValue.toUpperCase().match(/\bAND\b|\bOR\b/g) || [];
			for(var k = 0; k < andOrValues.length && k < criteriaArray.length - 1; k++) {
				criteriaArray[k].andOr = andOrValues[k];
			}
			this.set('criteriaPattern', filterPatternValue); //No I18N
		}
		
		this.set("criteria", criteriaArray); //No I18N
		this.set("filterDataEnabled", true); //No I18N
		
		if(criteriaArray.length >= 2 && filterPatternValue && filterPatternValue !== '') {
			Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
				$('#criteriaPattern').val(filterPatternValue);
				// Update radio buttons to reflect the correct andOr values
				var criteriaList = this.getCriteriaList();
				for(var m = 0; m < criteriaList.length - 1; m++) {
					$("input[name='andOr" + m + "']").prop('checked', false);
					$("input[name='andOr" + m + "'][value='" + criteriaList[m].andOr + "']").prop('checked', true);
				}
			});
		}
	}, 
	getCriteriaList:function() {
		return jQuery.extend(true,[],this.get("criteria")); //No I18N
	},
	generateCriteriaPattern:function() {
		var criteriaList = this.getCriteriaList();
		if(criteriaList.length < 2) {
			return '';
		}
		var pattern = '1';
		for(var i = 1; i < criteriaList.length; i++) {
			var rowNum = i + 1;
			var andOr = criteriaList[i-1].andOr || 'AND';//NO I18N
			pattern = '( ' + pattern + ' ' + andOr + ' ' + rowNum + ' )';
		}
		return pattern;
	},
	updateCriteriaPatternDisplay:function() {
		var pattern = this.generateCriteriaPattern();
		$('#criteriaPattern').val(pattern);
		this.set('criteriaPattern', pattern); //No I18N
	},
	validateCriteriaPattern:function(criteriaPattern) {
		var criteriaList = this.getCriteriaList();
		var noOfRows = criteriaList.length;
		
		if(noOfRows === 1){
			return { valid: true};
		}
		if((!criteriaPattern || criteriaPattern.trim() === '')) {
			return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error1',this) }; //No I18N
		}
		
		criteriaPattern = criteriaPattern.trim();
		var arr = criteriaPattern.split(/(\(|\)|\d+|AND|OR)/g);
		var operArr = [];
		var prevNum = 0;
		var brackets = [];
		var numbersFound = [];
		
		for(var i = 0; i < arr.length; i++) {
			var token = arr[i].trim();
			if(token.length === 0) {
				continue;
			} else if(token === '(') {
				brackets.push('(');
			} else if(token === ')') {
				if(brackets.length === 0) {
					return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error2',this) }; //No I18N
				}
				brackets.pop();
			} else if(token === 'AND' || token === 'OR') {//NO I18N
				operArr.push(token);
			} else if(!isNaN(parseInt(token))) {
				var num = parseInt(token);
				if(num < 1 || num > noOfRows) {
					return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error3',this)+" "+num }; //No I18N
				}
				if(numbersFound.indexOf(num) !== -1) {
					return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error4',this)+" "+num }; //No I18N
				}
				numbersFound.push(num);
				if(num === prevNum + 1) {
					prevNum++;
				}
			} else {
				return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error5',this)+" "+token }; //No I18N
			}
		}
		
		if(brackets.length > 0) {
			return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error6',this) }; //No I18N
		}
		
		if(numbersFound.length !== noOfRows) {
			return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error7',this) }; //No I18N
		}
		
		if(operArr.length !== noOfRows - 1) {
			return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error8',this) }; //No I18N
		}
		
		// Check for )( pattern which is invalid (with or without spaces)
		if(criteriaPattern.match(/\)\s*\(/g)) {
			return { valid: false, message: Ember.I18n.t('webclient.fwa.overview.search.pattern.error9',this) }; //No I18N
		}
		
		return { valid: true, operators: operArr, numbers: numbersFound };
	},
	addNewCriteriaObj:function() {
		var criteriaList = this.getCriteriaList();
		if(criteriaList.length > 0) {
			criteriaList[criteriaList.length-1].showAddButton = false;
			criteriaList[criteriaList.length-1].showDeleteButton = true;
			criteriaList[criteriaList.length-1].showAndOr = true;
			this.set('showCriteriaPattern',true);//No I18N
		}
		criteriaList.pushObject({
			index:criteriaList.length,
			rowNumber:criteriaList.length+1,
			showAddButton:true,
			showDeleteButton:(criteriaList.length == 0) ? false : true,
			showAndOr:false,
			filterTypeValue:"none", //No I18N
			criteriaTypeValue:"",
			criteriaValue:"", //No I18N
			valueObj:null, 
			startIp:"", //No I18N
			endIp:"", //No I18N
			port:"", //No I18N
			startPort:"", //No I18N
			endPort:"", //No I18N
			protocol:"TCP", //No I18N
			portType:"Source", //No I18N
			logStatus:"enabled", //No I18N
			ruleStatus:"enabled", //No I18N
			ruleDirection:"inbound", //No I18N
			singleTime:"", //No I18N
			startTime:"", //No I18N
			endTime:"", //No I18N
			andOr:"AND" //No I18N
		});
		this.set("criteria",criteriaList); //No I18N
		Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
			$(".select2").select2();
			if(criteriaList.length > 1){
				// Preserve existing pattern and append new criteria instead of regenerating
				var existingPattern = $("#criteriaPattern").val() || this.get('criteriaPattern');
				if(existingPattern && existingPattern.trim() !== ''){
					// Append new criteria with AND operator to existing pattern
					var newCriteriaIndex = criteriaList.length;
					var newPattern = '( ' + existingPattern.trim() + ' AND ' + newCriteriaIndex + ' )';//NO I18N
					$('#criteriaPattern').val(newPattern);
					this.set('criteriaPattern', newPattern); //No I18N
				} else {
					this.updateCriteriaPatternDisplay();
				}
			}
		});
		if(criteriaList.length <= 1){
			this.set('showCriteriaPattern',false);//No I18N
			$("#criteriaPattern").val("");//No I18N
		}

		this.set("filterDataEnabled", true);//NO I18N
	},
	validateSearchCriteriaFields:function(criteriaList, critMap) {
		var self = this;
		var fieldsToValidate = {};
		var customValidations = [];
		
		for(var v = 0; v < criteriaList.length; v++){
			var criteria = criteriaList[v];
			var filterType = criteria.filterTypeValue;
			var criteriaTypeValue = criteria.criteriaTypeValue;
			if(filterType === 'none' || !filterType){
				alert(Ember.I18n.t('webclient.fwa.overview.search.field.empty',{ param0: (v+1)}));//NO I18N
				return { valid: false };
			}
			
			var criteriaTypes = critMap[filterType] || [];
			var criteriaTypeDef = null;
			for(var j = 0; j < criteriaTypes.length; j++){
				if(criteriaTypes[j].value === criteriaTypeValue){
					criteriaTypeDef = criteriaTypes[j];
					break;
				}
			}
			
			if(!criteriaTypeDef){
				continue;
			}
			var type = criteriaTypeDef.type;
			var idx = criteria.index;
			
			if(type === 'ipaddress'){
				if(!fieldsToValidate.ipV4){ fieldsToValidate.ipV4 = []; }
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.ipV4.push('criteriaValue_' + idx);
				fieldsToValidate.empty.push('criteriaValue_' + idx);
			} else if(type === 'iprange'){//NO I18N
				if(!fieldsToValidate.ipV4){ fieldsToValidate.ipV4 = []; }
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.ipV4.push('startIp_' + idx);
				fieldsToValidate.ipV4.push('endIp_' + idx);
				fieldsToValidate.empty.push('startIp_' + idx);
				fieldsToValidate.empty.push('endIp_' + idx);
			} else if(type === 'ipaddresscommaseperated'){//NO I18N
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.empty.push('criteriaValue_' + idx);
				// Custom validation for comma-separated IPs
				var ipValues = criteria.criteriaValue ? criteria.criteriaValue.split(',') : [];
				for(var k = 0; k < ipValues.length; k++){
					var trimmedIp = ipValues[k].trim();
					if(trimmedIp && !opm_isIpV4Address(trimmedIp)){
						customValidations.push({
							condition: true,
							identifier: 'criteriaValue_' + idx,//NO I18N
							message: Ember.I18n.t('webclient.invalidip', self)//NO I18N
						});
						break;
					}
				}
			} else if(type === 'singlePort'){//NO I18N
				if(!fieldsToValidate.port){ fieldsToValidate.port = []; }
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.port.push('port_' + idx);
				fieldsToValidate.empty.push('port_' + idx);
			} else if(type === 'multiPort'){//NO I18N
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.empty.push('port_' + idx);
				// Custom validation for comma-separated ports
				var portValues = criteria.port ? criteria.port.split(',') : [];
				for(var k = 0; k < portValues.length; k++){
					var trimmedPort = portValues[k].trim();
					var portNum = parseInt(trimmedPort);
					if(trimmedPort && (isNaN(portNum) || portNum < 0 || portNum > 65535)){
						customValidations.push({
							condition: true,
							identifier: 'port_' + idx,//NO I18N
							message: Ember.I18n.t('webclient.admin.invalidport', self)//NO I18N
						});
						break;
					}
				}
			} else if(type === 'rangePort'){//NO I18N
				if(!fieldsToValidate.port){ fieldsToValidate.port = []; }
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.port.push('startPort_' + idx);
				fieldsToValidate.port.push('endPort_' + idx);
				fieldsToValidate.empty.push('startPort_' + idx);
				fieldsToValidate.empty.push('endPort_' + idx);
			} else if(type === 'nonEmptyString'){//NO I18N
				if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
				fieldsToValidate.empty.push('criteriaValue_' + idx);
				} else if(type === 'singleTime'){//NO I18N
					if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
					fieldsToValidate.empty.push('singleTime_' + idx);
				} else if(type === 'rangeTime'){//NO I18N
					if(!fieldsToValidate.empty){ fieldsToValidate.empty = []; }
					fieldsToValidate.empty.push('startTime_' + idx);
					fieldsToValidate.empty.push('endTime_' + idx);
			}else if(type === 'count'){//NO I18N
				if(!fieldsToValidate.positive){ fieldsToValidate.positive = []; }
				fieldsToValidate.positive.push('count_' + idx);
			}
		}
		
		// Add custom validations if any
		if(customValidations.length > 0){
			fieldsToValidate.custom = customValidations;
		}
		// Validate fields
		if(Object.keys(fieldsToValidate).length > 0){
			var isValid = opm_validateFields(fieldsToValidate);
			if(!isValid){
				return { valid: false };
			}
		}
		return { valid: true };
	},
	buildSearchCriteriaResult:function(criteriaList, critMap) {
		var result = [];
		
		for(var i = 0; i < criteriaList.length; i++){
			var criteria = criteriaList[i];
			var filterType = criteria.filterTypeValue;
			var criteriaTypeValue = criteria.criteriaTypeValue;
			
			if(filterType === 'none' || !filterType){
				continue;
			}
			
			// Find the criteria type definition from critMap
			var criteriaTypes = critMap[filterType] || [];
			var criteriaTypeDef = null;
			for(var j = 0; j < criteriaTypes.length; j++){
				if(criteriaTypes[j].value === criteriaTypeValue){
					criteriaTypeDef = criteriaTypes[j];
					break;
				}
			}
			
			if(!criteriaTypeDef){
				continue;
			}
			
			var type = criteriaTypeDef.type;
			var obj = {
				keyName: i+1,
				field: filterType,
				condition: criteriaTypeValue
			};
			
			// Build value based on type
			if(type === 'ipaddress' || type === 'nonEmptyString'){
				obj.value = criteria.criteriaValue;
			} else if(type === 'iprange'){//NO I18N
				obj.valueObj = {
					start: criteria.startIp,
					end: criteria.endIp
				};
			} else if(type === 'ipaddresscommaseperated'){//NO I18N
				obj.valueArray = criteria.criteriaValue ? criteria.criteriaValue.split(',') : [];
			} else if(type === 'objectSingleSelect'){//NO I18N
				if(criteria.criteriaValue == undefined || criteria.criteriaValue === ''){
					alert(Ember.I18n.t('webclient.fwa.overview.object.field.empty',{ param0: (i+1)}));//NO I18N
					return { valid: false, result: null };
				}
				obj.value = criteria.criteriaValue;
			} else if(type === 'objectMultiSelect'){//NO I18N
				if(criteria.criteriaValue == undefined || criteria.criteriaValue === ''){
					alert(Ember.I18n.t('webclient.fwa.overview.object.field.empty',{ param0: (i+1)}));//NO I18N
					return { valid: false, result: null };
				}
				obj.valueArray = criteria.criteriaValue ? criteria.criteriaValue.split(',') : [];
			} else if(type === 'singlePort'){//NO I18N
				var portTypeValue = criteria.portType === 'Source' ? 1 : (criteria.portType === 'Destination' ? 2 : 0);//NO I18N
				obj.valueObj = {
					port: parseInt(criteria.port) || 0,
					protocol: criteria.protocol,
					type: portTypeValue
				};
				if(filterType === 'serviceportcount' && criteria.count !== undefined && criteria.count !== '') {//NO I18N
					obj.valueObj.count = parseInt(criteria.count) || 0;
				}
			} else if(type === 'multiPort'){//NO I18N
				var portValues = criteria.port ? criteria.port.split(',') : [];
				var portTypeValue = criteria.portType === 'Source' ? 1 : (criteria.portType === 'Destination' ? 2 : 0);//NO I18N
				obj.valueObj = {
					value: portValues,
					protocol: criteria.protocol,
					type: portTypeValue
				};
			} else if(type === 'rangePort'){//NO I18N
				var portTypeValue = criteria.portType === 'Source' ? 1 : (criteria.portType === 'Destination' ? 2 : 0);//NO I18N
				obj.valueObj = {
					startPort: parseInt(criteria.startPort) || 0,
					endPort: parseInt(criteria.endPort) || 0,
					protocol: criteria.protocol,
					type: portTypeValue
				};
			} else if(type === 'logStatus'){//NO I18N
				obj.value = criteria.logStatus === 'enabled' ? 1 : 0;//NO I18N
			} else if(type === 'ruleStatus'){//NO I18N
				obj.value = criteria.ruleStatus === 'enabled' ? 1 : 0;//NO I18N
			} else if(type === 'ruleDirection'){//NO I18N
				obj.value = criteria.ruleDirection === 'inbound' ? 'Inbound' : 'Outbound';//NO I18N
				} else if(type === 'singleTime'){//NO I18N
					obj.value = criteria.singleTime || '';
				} else if(type === 'rangeTime'){//NO I18N
					obj.valueObj = {
						startTime: criteria.startTime || '',
						endTime: criteria.endTime || ''
					};
			} else if(type === 'count'){//NO I18N
				obj.value = criteria.count || 1;
			} 
			
			result.push(obj);
		}
		return { valid: true, result: result };
	},
	actions:{
		closeSlide:function(){
			var reportType = this.get('reportType') || 'ruleMgmtOverview'; //No I18N
			if(reportType === 'ruleMgmtOverview') {//No I18N
				OPMClient.Reports.closeRuleManagementSlides();
			}else{
				location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARiskAnalysis/RuleList";//No I18N
			}
		},
		saveCustomSection:function() {
			var self = this;
			var criteriaList = this.getCriteriaList();
			if(criteriaList.length == 0){
				opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.fwa.ruletrack.criteria.validation',this));//No I18N
				return;
			}

			var critMap = this.get('critMap');

			// Validate fields
			var validationResult = this.validateSearchCriteriaFields(criteriaList, critMap);
			if(!validationResult.valid){
				return;
			}

			// Build result param
			var buildResult = this.buildSearchCriteriaResult(criteriaList, critMap);
			if(!buildResult.valid){
				return;
			}
			var result = buildResult.result;

			var criteriaList = this.getCriteriaList();
			var criteriaPattern = $("#criteriaPattern").val();
			if(criteriaPattern != undefined){
				var validation = this.validateCriteriaPattern(criteriaPattern);
				if(!validation.valid) {
					$("#criteriaPattern").addClass('validateField error');
					opm_infoMsgs('errorMsg', validation.message); //No I18N
					return;
				}
			}else{
				criteriaPattern='1';//NO I18N
			}


			var fields = {'empty':['riskName','riskDescription'],'alphaNumericWithBasicSpecialChars':['riskName','riskDescription']};//No I18N
			var isEdit = this.get('filterId') && this.get('filterId') != "none"; //No I18N
			var isValid = opm_validateFields(fields);
			if(!isValid)
			{
				return;
			}
			var data={};
			if(isEdit){
				data.riskId = this.get('filterId');
			}
			data.riskName = $('#riskName').val();//No I18N
			data.description = $('#riskDescription').val();//No I18N
			data.riskSeverity = $('#riskSeverity').val();//No I18N
			data.recommendation = $('#recommendation').val();//No I18N
			data.criteriaList=JSON.stringify(result);
			data.query=criteriaPattern;
			$.ajax({
				url:window.OPM.apiUrlPattern + '/fwarulemgmt/addOrEditCustomRiskDetails',//No I18N  
				type: 'POST', //No I18N
				data:data,
				async:false,
				success: function(response){
					if(response != undefined && response.isSuccess != undefined && response.isSuccess){
						opm_infoMsgs("successMsg",response.message);//No I18N
						location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARiskAnalysis/RuleList";//No I18N
					}else{
						opm_infoMsgs("errorMsg",response.message);//No I18N
					}
				}
			});


		},
		saveSearchCriteria:function(method) {
			var self = this;
			var criteriaList = this.getCriteriaList();
			if(criteriaList.length == 0){
				opm_infoMsgs("errorMsg", Ember.I18n.t('webclient.fwa.ruletrack.criteria.validation',this));//No I18N
				return;
			}
			
			var critMap = this.get('critMap');
			
			// Validate fields
			var validationResult = this.validateSearchCriteriaFields(criteriaList, critMap);
			if(!validationResult.valid){
				return;
			}
			
			// Build result param
			var buildResult = this.buildSearchCriteriaResult(criteriaList, critMap);
			if(!buildResult.valid){
				return;
			}
			var result = buildResult.result;

			var criteriaList = this.getCriteriaList();
			var criteriaPattern = $("#criteriaPattern").val();
			if(criteriaPattern != undefined){
				var validation = this.validateCriteriaPattern(criteriaPattern);
				if(!validation.valid) {
					$("#criteriaPattern").addClass('validateField error');
					opm_infoMsgs('errorMsg', validation.message); //No I18N
					return;
				}
			}else{
				criteriaPattern='1';//NO I18N
			}
			
			if(OPMClient.FWAOverviewFilterCriteriaController.filterId == "none") { //No I18N
				OPMClient.FWAOverviewFilterCriteriaController.set("filterParamValue", result);//NO I18N
				OPMClient.FWAOverviewFilterCriteriaController.set("filterPatternValue", criteriaPattern);//NO I18N
				OPMClient.FWAOverviewFilterController.set("filterParamValue", result);//NO I18N
				OPMClient.FWAOverviewFilterController.set("filterPatternValue", criteriaPattern);//NO I18N
				if(method == "apply"){				
					OPMClient.FWAOverviewFilterCriteriaController.set("applyFilterCriteria", false);//NO I18N
					Ember.run.next(function() {
						OPMClient.FWAOverviewFilterCriteriaController.set("applyFilterCriteria", true);//NO I18N
						Ember.run.next(function() {
							OPMClient.FWAOverviewFilterController.updateFilterDisplayTokens();
						});
						OPMClient.FWAOverviewFilterCriteriaController.set("filterName", $('#searchFilterName').val());//NO I18N
						if(OPMClient.FWAOverviewFilterController.filterId != "none") { //No I18N
							OPMClient.FWAOverviewFilterController.set('filterId',"none");//NO I18N
							OPMClient.FWAOverviewFilterController.set('filterName', Ember.I18n.t('webclient.devices.customfields.selectNone',this));//NO I18N
							$('#overDropDownList .filterListli').attr('selected',false);//NO I18N
							$('#overDropDownList #none').attr('selected',true);//NO I18N
						}
						OPMClient.Reports.closeRuleManagementSlides();
						OPMClient.Reports.fwaPolicyOverviewDivChange('allPolicy');//No I18N
					});
					
				}else if(method == "saveApply"){//NO I18N
					$('#fwaRuleMgmtFilter').show();
					$('#fwaCustomTimeDiv').hide();
					$('#fwaCustomPolicies').hide();
					$('#searchaddFilterName').val('');
					slideIn(5);
				}
			}else{
				OPMClient.FWAOverviewFilterCriteriaController.set("filterParamValue", result);//NO I18N
				OPMClient.FWAOverviewFilterCriteriaController.set("filterPatternValue", criteriaPattern);//NO I18N
				OPMClient.FWAOverviewFilterController.set("filterParamValue", result);//NO I18N
				OPMClient.FWAOverviewFilterController.set("filterPatternValue", criteriaPattern);//NO I18N
				OPMClient.FWACompliance.saveOverviewFilterDetail(true);
			}
		},
		hideEditCriteria:function() {
			$(".deleteBtn").prop('disabled',true);
			$(".btnPlus").prop('disabled',true);
			$("#criteriaPattern").attr('readonly', false);
			$("#criteriaPattern").focus();
			$("#criteriaPattern").css('cursor', 'text');//NO I18N
			$("#editPattern").hide();
			$("#savePattern").show();
			$("#resetPattern").show();
			this.set('criteriaPatternBackup', $("#criteriaPattern").val());//NO I18N
		},
		showEditCriteria:function() {
			$("#criteriaPattern").attr('readonly', true);
			$("#criteriaPattern").css('cursor', 'default');
			$("#editPattern").show();
			$("#savePattern").hide();
			$("#resetPattern").hide();
			$(".deleteBtn").prop('disabled',false);
			$(".btnPlus").prop('disabled',false);
		},
		saveCriteriaPattern:function() {
			var criteriaList = this.getCriteriaList();
			var criteriaPattern = $("#criteriaPattern").val();
			
			// Normalize pattern - trim and handle multiple spaces
			if(criteriaPattern) {
				criteriaPattern = criteriaPattern.trim();
				// Add spaces around parentheses
				criteriaPattern = criteriaPattern.replace(/\(/g, ' ( ');
				criteriaPattern = criteriaPattern.replace(/\)/g, ' ) ');
				// Add space between number and adjacent text (e.g., "1and" -> "1 and", "and2" -> "and 2")
				criteriaPattern = criteriaPattern.replace(/(\d)([A-Za-z(])/g, '$1 $2');
				criteriaPattern = criteriaPattern.replace(/([A-Za-z)])(\d)/g, '$1 $2');
				// Now replace AND/OR with uppercase (after adding spaces so word boundaries work)
				criteriaPattern = criteriaPattern.replace(/\bAND\b/gi, ' AND ');
				criteriaPattern = criteriaPattern.replace(/\bOR\b/gi, ' OR ');
				// Normalize multiple spaces to single space
				criteriaPattern = criteriaPattern.replace(/\s+/g, ' ').trim();
			}
			
			var validation = this.validateCriteriaPattern(criteriaPattern);
			if(!validation.valid) {
				$("#criteriaPattern").addClass('validateField error');
				opm_infoMsgs('errorMsg', validation.message); //No I18N
				return;
			}
			
			// Extract operators and update criteria andOr values
			var andOrValues = criteriaPattern.toUpperCase().match(/\bAND\b|\bOR\b/g) || [];
			
			// Validate that we have the correct number of operators
			if(andOrValues.length !== criteriaList.length - 1) {
				$("#criteriaPattern").addClass('validateField error');
				opm_infoMsgs('errorMsg', Ember.I18n.t('webclient.fwa.overview.search.pattern.error8',this)); //No I18N
				return;
			}
			
			for(var i = 0; i < andOrValues.length; i++) {
				criteriaList[i].andOr = andOrValues[i];
				// Update radio buttons
				$("input[name='andOr" + i + "']").prop('checked', false);
				$("input[name='andOr" + i + "'][value='" + andOrValues[i] + "']").prop('checked', true);
			}
			
			this.set('criteria', criteriaList); //No I18N
			this.set('criteriaPattern', criteriaPattern); //No I18N
			$("#criteriaPattern").val(criteriaPattern); // Update input with normalized pattern
			$(".deleteBtn").prop('disabled', false);
			$(".btnPlus").prop('disabled', false);
			this.send('showEditCriteria'); //NO I18N
			$("#criteriaPattern").removeClass('validateField error');
		},
		resetCriteriaPattern:function(isReset) {
			if(isReset) {
				// Restore the backup pattern
				var backupPattern = this.get('criteriaPatternBackup');
				if(backupPattern) {
					$("#criteriaPattern").val(backupPattern);
					this.set('criteriaPattern', backupPattern); //No I18N
				} else {
					this.updateCriteriaPatternDisplay();
				}
			}
			this.send('showEditCriteria'); //NO I18N
			$("#criteriaPattern").removeClass('validateField error');
			Ember.run.scheduleOnce('afterRender', this, function() {//NO I18N
				$('.reportCriteria .filter').select2();
			});
		},
		childActions:function(functionName,param1,param2){
			this.send(functionName,param1,param2);
		},
		updateCriteriaPattern:function(index, newOperator) {
			var existingPattern = $("#criteriaPattern").val() || this.get('criteriaPattern');
			if(existingPattern && existingPattern.trim() !== '' && index !== undefined && newOperator){
				// Update the specific operator between index+1 and index+2 in the pattern
				var rowNum = index + 1;
				var nextRowNum = index + 2;
				
				// Find and replace the operator between these two row numbers
				// Pattern could be "rowNum AND nextRowNum" or "rowNum OR nextRowNum" with parentheses in between
				var newPattern = existingPattern;
				
				// Replace operator between the two numbers (handling possible parentheses between them)
				var regex = new RegExp('(\\b' + rowNum + '\\b\\s*\\)*\\s*)\\b(AND|OR)\\b(\\s*\\(*\\s*\\b' + nextRowNum + '\\b)', 'gi');//NO I18N
				newPattern = newPattern.replace(regex, '$1' + newOperator.toUpperCase() + '$3');
				
				$('#criteriaPattern').val(newPattern);
				this.set('criteriaPattern', newPattern); //No I18N
			} else {
				this.updateCriteriaPatternDisplay();
			}
		},
		addCriteria:function() {
			this.addNewCriteriaObj();
		},
		deleteCriteria:function(index) {
			var criteriaList = this.getCriteriaList();
			// Save existing pattern before modifying criteriaList
			var existingPattern = $("#criteriaPattern").val() || this.get('criteriaPattern');
			
			if(index==criteriaList.length-1 && criteriaList.length!==1){
				criteriaList[index-1].showAndOr=false;
				criteriaList[index-1].showAddButton=true;
			}
			// Handle deleting index 0 when there are exactly 2 criteria
			if(index === 0 && criteriaList.length === 2){
				Ember.set(criteriaList[1], 'showDeleteButton', false);
				Ember.set(criteriaList[1], 'showAndOr', false);
				Ember.set(criteriaList[1], 'showAddButton', true);
			}
			if(criteriaList.length>=2){
				// Don't update andOr values when we have a custom pattern - let the pattern dictate the operators
				criteriaList.removeAt(index);
			}
			for(var i=index;i<criteriaList.length;i++) {
				criteriaList[i].index = i;
				criteriaList[i].rowNumber = i+1;
			}
			
			this.set("criteria",criteriaList); //No I18N
			
			if(criteriaList.length < 2){
				this.set('showCriteriaPattern',false);//No I18N
				$("#criteriaPattern").val("");//No I18N
			} else {
				// Preserve existing pattern and update it instead of regenerating
				if(existingPattern && existingPattern.trim() !== ''){
					var deletedRowNum = index + 1; // Convert 0-based index to 1-based row number
					var newPattern = existingPattern;
					
					newPattern = newPattern.replace(new RegExp('\\b(AND|OR)\\s+' + deletedRowNum + '\\b', 'gi'), '');
					newPattern = newPattern.replace(new RegExp('\\b' + deletedRowNum + '\\s+(AND|OR)\\b', 'gi'), '');
					newPattern = newPattern.replace(new RegExp('\\b' + deletedRowNum + '\\b', 'g'), '');
					newPattern = newPattern.replace(/\(\s*\)/g, '');
					newPattern = newPattern.replace(/\b(AND|OR)\s+(AND|OR)\b/gi, '$1');
					newPattern = newPattern.replace(/\(\s*(AND|OR)\s+/gi, '( ');
					newPattern = newPattern.replace(/\s+(AND|OR)\s*\)/gi, ' )');
					newPattern = newPattern.replace(/\s+/g, ' ').trim();
					
					// Renumber: decrease all indices greater than deleted index by 1
					for(var j = deletedRowNum + 1; j <= criteriaList.length + 1; j++){
						var newNum = j - 1;
						newPattern = newPattern.replace(new RegExp('\\b' + j + '\\b', 'g'), '__TEMP_' + newNum + '__');//NO I18N
					}
					// Replace temp markers with actual numbers
					newPattern = newPattern.replace(/__TEMP_(\d+)__/g, '$1');
					
					$('#criteriaPattern').val(newPattern);
					this.set('criteriaPattern', newPattern); //No I18N
					
					// Update andOr values from the new pattern
					var andOrValues = newPattern.toUpperCase().match(/\bAND\b|\bOR\b/g) || [];
					for(var k = 0; k < andOrValues.length && k < criteriaList.length - 1; k++) {
						criteriaList[k].andOr = andOrValues[k];
					}
					this.set("criteria", criteriaList); //No I18N
				} else {
					this.updateCriteriaPatternDisplay();
				}
			}
		}
	},
	willDestroyElement: function(){
	},
	didInsertElement: function(){
		var reportType = this.get('reportType') || 'ruleMgmtOverview'; //No I18N
		if(reportType === 'riskAnalysis') {//No I18N
			var riskId = this.get('filterId');
			$('#riskName').val(this.get('riskName'));//No I18N
			$('#riskDescription').val(this.get('riskDescription'));//No I18N
			$('#recommendation').val(this.get('recommendation'));//No I18N
			$('#riskSeverity').val(this.get('riskCategory')).select2();//No I18N
			$('#srchProfileNameDiv').hide();
		}else{
			var filterId = OPMClient.FWAOverviewFilterCriteriaController.filterId;
			$('#searchFilterName').val('');//No I18N
			if(OPMClient.FWAOverviewFilterCriteriaController.filterName != Ember.I18n.t('webclient.devices.customfields.selectNone',this)){
				var filterName = OPMClient.FWAOverviewFilterCriteriaController.filterName;
				$('#searchFilterName').val(filterName);//No I18N
			}
			if(OPMClient.FWAOverviewFilterCriteriaController.filterId == "none"){
				$('#srchProfileNameDiv').hide();
			}else{
				$('#srchProfileNameDiv').show();
			}
		}
		
	}
});

OPMClient.FwaOverviewFilterSearchCriteriaComponent = Ember.Component.extend({
	templateName: "FWAComplianceRuleMgmtOverviewFilterSearchCriteria",//No I18N
	criteriaTypes: [],
	searchTypes: [],
	selectedCriteriaType: null,
	criteriaTypeVersion: 0, 
	initDefaults: function() {
		this.reloadCriteriaTypes();
	}.on("init"), //NO I18N 
	reloadCriteriaTypes:function(completeLoad){
		var criteria = this.get('criteria');
		if(criteria != undefined && (criteria.filterTypeValue != undefined && criteria.filterTypeValue != "none")){
			var criteriaTypes = this.get('critMap')[criteria.filterTypeValue]; //No I18N
			this.set("criteriaTypes", criteriaTypes); //No I18N
			if((completeLoad != undefined && completeLoad == true) || criteria.criteriaTypeValue == undefined || criteria.criteriaTypeValue == ""){
				var criteriaTypeValue = criteriaTypes[0].value;
				var criteriaTypeObj = criteriaTypes[0];
				this.set("criteria.criteriaTypeValue", criteriaTypeValue); //No I18N
				this.set("selectedCriteriaType", criteriaTypeObj.type); //No I18N
				this.initSelect2IfNeeded();
			} else {
				this.updateSelectedCriteriaType();
				this.initSelect2IfNeeded();
			}
		}
	},
	updateSelectedCriteriaType: function(){
		var criteriaTypes = this.get('criteriaTypes');
		var criteriaTypeValue = this.get('criteria.criteriaTypeValue');
		if(criteriaTypes && criteriaTypeValue){
			for(var i = 0; i < criteriaTypes.length; i++){
				if(criteriaTypes[i].value === criteriaTypeValue){
					this.set("selectedCriteriaType", criteriaTypes[i].type); //No I18N
					break;
				}
			}
		}
	},
	didInsertElement: function(){
		this.initSelect2IfNeeded();
	},
	initSelect2IfNeeded: function(){
		var self = this;
		var criteria = this.get('criteria');
		Ember.run.scheduleOnce('afterRender', this, function(){//NO I18N
			if(self.get('showLogStatusSelect')){
				self.$('.criteriaLogStatus').select2().val(criteria.logStatus || 'enabled').trigger('change');//NO I18N
				self.$('.criteriaLogStatus').on('change', function(){
					self.set('criteria.logStatus', $(this).val());//NO I18N
				});
			}
			if(self.get('showRuleStatusSelect')){
				self.$('.criteriaRuleStatus').select2().val(criteria.ruleStatus || 'enabled').trigger('change');//NO I18N
				self.$('.criteriaRuleStatus').on('change', function(){
					self.set('criteria.ruleStatus', $(this).val());//NO I18N
				});
			}
			if(self.get('showRuleDirectionSelect')){
				self.$('.criteriaRuleDirection').select2().val(criteria.ruleDirection || 'inbound').trigger('change');//NO I18N
				self.$('.criteriaRuleDirection').on('change', function(){
					self.set('criteria.ruleDirection', $(this).val());//NO I18N
				});
			}
			if(self.get('showPortInput') || self.get('showRangePortInput')){
				self.$('.criteriaProtocol').select2().val(criteria.protocol || 'TCP').trigger('change');//NO I18N
				self.$('.criteriaProtocol').on('change', function(){
					self.set('criteria.protocol', $(this).val());//NO I18N
				});
				self.$('.criteriaPortType').select2().val(criteria.portType || 'Source').trigger('change');//NO I18N
				self.$('.criteriaPortType').on('change', function(){
					self.set('criteria.portType', $(this).val());//NO I18N
				});
			}
			if(self.get('showSingleTime')){
				var singleTimeId = self.get('singleTimeInputId');
				$('#' + singleTimeId).datepicker({
					dateFormat: 'yy-mm-dd',//NO I18N
					onSelect: function(dateText){
						self.set('criteria.singleTime', dateText);//NO I18N
						self.set('criteria.criteriaValue', dateText);//NO I18N
					}
				});
				if(criteria.singleTime){
					$('#' + singleTimeId).val(criteria.singleTime);
				}
			}
			if(self.get('showRangeTime')){
				var startTimeId = self.get('startTimeInputId');
				var endTimeId = self.get('endTimeInputId');
				$('#' + startTimeId).datepicker({
					dateFormat: 'yy-mm-dd',//NO I18N
					onSelect: function(dateText){
						self.set('criteria.startTime', dateText);//NO I18N
						self.updateRangeTimeCriteriaValue();
					}
				});
				$('#' + endTimeId).datepicker({
					dateFormat: 'yy-mm-dd',//NO I18N
					onSelect: function(dateText){
						self.set('criteria.endTime', dateText);//NO I18N
						self.updateRangeTimeCriteriaValue();
					}
				});
				if(criteria.startTime){
					$('#' + startTimeId).val(criteria.startTime);
				}
				if(criteria.endTime){
					$('#' + endTimeId).val(criteria.endTime);
				}
			}
		});
	},
	updateRangeTimeCriteriaValue: function(){
		var startTime = this.get('criteria.startTime') || '';
		var endTime = this.get('criteria.endTime') || '';
		this.set('criteria.valueObj', {//No I18N
			startTime: startTime,
			endTime: endTime
		});
	},
	fwaSearchFieldObserver:function(){
		this.incrementProperty('criteriaTypeVersion'); //No I18N
		this.clearCriteriaValues();
		this.reloadCriteriaTypes(true);
	}.observes("criteria.filterTypeValue"), //NO I18N
	fwaCriteriaTypeObserver:function(){
		this.incrementProperty('criteriaTypeVersion'); //No I18N
		this.updateSelectedCriteriaType();
		// Clear all criteria values when criteria type changes
		this.clearCriteriaValues();
		this.initSelect2IfNeeded();
	}.observes("criteria.criteriaTypeValue"), //NO I18N
	clearCriteriaValues: function(){
		var criteria = this.get('criteria');
		if(criteria){
			this.set('criteria.criteriaValue', ''); //No I18N
			this.set('criteria.valueObj', null); //No I18N
			this.set('criteria.startIp', ''); //No I18N
			this.set('criteria.endIp', ''); //No I18N
			this.set('criteria.port', ''); //No I18N
			this.set('criteria.startPort', ''); //No I18N
			this.set('criteria.endPort', ''); //No I18N
			this.set('criteria.logStatus', 'enabled'); //No I18N
			this.set('criteria.ruleStatus', 'enabled'); //No I18N
			this.set('criteria.ruleDirection', 'inbound'); //No I18N
			this.set('criteria.protocol', 'TCP'); //No I18N
			this.set('criteria.portType', 'Source'); //No I18N
			this.set('criteria.singleTime', ''); //No I18N
			this.set('criteria.startTime', ''); //No I18N
			this.set('criteria.endTime', ''); //No I18N
			this.set('criteria.count', 1); //No I18N
		}
	},
	// Computed properties for input type display
	showSingleInput: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'ipaddress' || type === 'ipaddresscommaseperated' || type === 'nonEmptyString' || type === null;//NO I18N
	}),
	showCountInput: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'count';//NO I18N
	}),
	showIpRangeInput: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'iprange';//NO I18N
	}),
	showPortInput: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'singlePort' || type === 'multiPort';//NO I18N
	}),
	showRangePortInput: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'rangePort';//NO I18N
	}),
	showLogStatusSelect: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'logStatus';//NO I18N
	}),
	showRuleStatusSelect: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'ruleStatus';//NO I18N
	}),
	showRuleDirectionSelect: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'ruleDirection';//NO I18N
	}),
	showObjectSelect: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'objectSingleSelect' || type === 'objectMultiSelect';//NO I18N
	}),
	showSingleTime: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'singleTime';//NO I18N
	}),
	showRangeTime: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'rangeTime';//NO I18N
	}),
	isMultiSelect: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		return type === 'objectMultiSelect';//NO I18N
	}),
	objectSelectUrl: Ember.computed('criteria.criteriaTypeValue', 'criteriaTypeVersion', function(){//NO I18N
		var criteriaTypes = this.get('criteriaTypes');
		var criteriaTypeValue = this.get('criteria.criteriaTypeValue');
		if(criteriaTypes && criteriaTypeValue){
			for(var i = 0; i < criteriaTypes.length; i++){
				if(criteriaTypes[i].value === criteriaTypeValue && criteriaTypes[i].url){
					return criteriaTypes[i].url;
				}
			}
		}
		return '';
	}),
	filterTypeValue: Ember.computed('criteria.filterTypeValue', function(){//NO I18N
		return this.get('criteria.filterTypeValue');
	}),
	// Placeholder text based on type
	inputPlaceholder: Ember.computed('selectedCriteriaType', 'criteriaTypeVersion', function(){//NO I18N
		var type = this.get('selectedCriteriaType');
		if(type === 'ipaddress'){
			return Ember.I18n.t('webclient.fwa.risk.criteria.enter.ip',this); //No I18N
		} else if(type === 'ipaddresscommaseperated'){//NO I18N
			return Ember.I18n.t('webclient.fwa.risk.criteria.enter.ips',this); //No I18N
		}
		return Ember.I18n.t('webclient.fwa.risk.criteria.enter.value',this); //No I18N
	}),
	startIpPlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.discovery.startip',this); //No I18N
	}),
	endIpPlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.discovery.endip',this); //No I18N
	}),
	portPlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.admin.appmanager.port',this); //No I18N
	}),
	startPortPlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.fwa.overview.filter.start.port',this); //No I18N
	}),
	endPortPlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.fwa.overview.filter.end.port',this); //No I18N
	}),
	selectDatePlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.fwa.overview.filter.select.date',this); //No I18N
	}),
	startDatePlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.fwa.overview.filter.start.date',this); //No I18N
	}),
	endDatePlaceholder: Ember.computed(function(){
		return Ember.I18n.t('webclient.fwa.overview.filter.end.date',this); //No I18N
	}),
	// Computed IDs for inputs and selects
	filterTypeSelectId: Ember.computed('criteria.index', function(){//NO I18N
		return 'filterType_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	criteriaTypeSelectId: Ember.computed('criteria.index', function(){//NO I18N
		return 'criteriaType_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	criteriaValueInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'criteriaValue_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	startIpInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'startIp_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	endIpInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'endIp_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	portInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'port_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	startPortInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'startPort_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	endPortInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'endPort_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	singleTimeInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'singleTime_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	startTimeInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'startTime_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	endTimeInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'endTime_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	countInputId: Ember.computed('criteria.index', function(){//NO I18N
		return 'count_' + (this.get('criteria.index') || '0'); //No I18N
	}),
	willDestroyElement: function(){
		this._super();
		this.$('.criteriaLogStatus').off('change');
		this.$('.criteriaRuleStatus').off('change');
		this.$('.criteriaRuleDirection').off('change');
		this.$('.criteriaProtocol').off('change');
		this.$('.criteriaPortType').off('change');
		// Destroy datepickers
		var singleTimeId = this.get('singleTimeInputId');
		var startTimeId = this.get('startTimeInputId');
		var endTimeId = this.get('endTimeInputId');
		if($('#' + singleTimeId).hasClass('hasDatepicker')){
			$('#' + singleTimeId).datepicker('destroy');
		}
		if($('#' + startTimeId).hasClass('hasDatepicker')){
			$('#' + startTimeId).datepicker('destroy');
		}
		if($('#' + endTimeId).hasClass('hasDatepicker')){
			$('#' + endTimeId).datepicker('destroy');
		}
	},
	actions:{
		subChildActions:function(functionName,param1,param2) {
			this.sendAction('action',functionName,param1,param2); //No I18N
		},
		andOr:function(index) {
			var selectedValue = $('input[name="andOr' + index + '"]:checked').val();
			this.set('criteria.andOr', selectedValue); //No I18N
			this.sendAction('action', 'updateCriteriaPattern', index, selectedValue); //No I18N
		}
	}
});

OPMClient.FwaObjectTagInputComponent = Ember.Component.extend({
	templateName: "components/fwa-object-tag-input",//No I18N
	inputText: '',
	currentlyInfield: false,
	customId: null,
	attributeBindings: ['elementId'], //NO I18N
	tags: [],
	visibleTags: [],
	moretags: [],
	isRestrictedOpen: false,
	tagName: 'div', //No I18N
	classNameBindings: ['isMouseActive:zindex9999 positionRelative'], //NO I18N
	classNames: ['inputTags'], //No I18N
	
	// Loading
	isLoading: false,
	searchText: '',
	
	style: Ember.computed('isRestrictedOpen', function () { //NO I18N
		return this.get('isRestrictedOpen') ? '' : 'display:none';
	}).property('isRestrictedOpen'), //NO I18N
	
	tagstyle: Ember.computed('visibleTags', function () { //NO I18N
		return this.get('visibleTags').length >= 1 ? '' : 'display:none';
	}),
	
	// Show badge count when isMultiSelect and at least 1 tag is selected
	showBadgeCount: Ember.computed('isMultiSelect', 'tags.length', function () { //NO I18N
		return this.get('isMultiSelect') && this.get('tags').length >= 1;
	}),
	
	// Show ellipsis when there are hidden tags (overflow) and dropdown is closed
	hasOverflow: Ember.computed('moretags.length', 'isRestrictedOpen', function () { //NO I18N
		return this.get('moretags').length > 0 && !this.get('isRestrictedOpen');
	}),
	
	inputid: function () {
		var criteria = this.get('criteria') || {};
		return "fwaFilterValue" + (criteria.index || '0'); //NO I18N
	}.property('criteria.index'), //NO I18N
	
	dropdownId: function () {
		var criteria = this.get('criteria') || {};
		return "fwaDropdown_" + (criteria.index || '0'); //NO I18N
	}.property('criteria.index'), //NO I18N
	
	searchId: function () {
		var criteria = this.get('criteria') || {};
		return "fwaSearch_" + (criteria.index || '0'); //NO I18N
	}.property('criteria.index'), //NO I18N
	
	listId: function () {
		var criteria = this.get('criteria') || {};
		return "fwaDropdownList_" + (criteria.index || '0'); //NO I18N
	}.property('criteria.index'), //NO I18N
	
	tags: Ember.computed(function () {
		return Ember.A();
	}),
	visibleTags: Ember.computed(function () {
		return Ember.A();
	}),
	moreTags: Ember.computed(function () {
		return Ember.A();
	}),
	tagValues: Ember.computed(function () {
		return Ember.A();
	}),
	selectedData: Ember.computed(function () {
		return Ember.A();
	}),
	dropDownList: Ember.computed(function () {
		return Ember.A();
	}),
	allDropDownList: Ember.computed(function () {
		return Ember.A();
	}),
	getSelectedTypeParam: function(searchType){
		if(searchType == "srcObj" || searchType == "dstObj"){
			return "Network";//NO I18N
		} else if(searchType == "serviceObj"){//NO I18N
			return "Service";//NO I18N
		} else if(searchType == "srcIface" || searchType == "dstIface"){//NO I18N
			return "Interface";//NO I18N
		}
	},
	getSelectedTypeUrl:function(searchType){
		return 'fwacompliance/getRuleBasedObjectList';//NO I18N
	},
	didInsertElement: function () {
		this.set('inputText', ''); //NO I18N
		this._super();
		// Initialize previous values for observers
		this.set('_previousSearchType', this.get('searchType')); //No I18N
		this.set('_previousObjectSelectUrl', this.get('objectSelectUrl')); //No I18N
		this.set('_previousCriteriaTypeValue', this.get('criteria.criteriaTypeValue')); //No I18N
		
		var tags = Ember.A();
		var tagValues = Ember.A();
		var selectedData = Ember.A();
		
		// Restore selections from criteria.criteriaValue if it exists
		var criteria = this.get('criteria') || {};
		var existingValue = criteria.criteriaValue;
		if(existingValue && existingValue !== ''){
			var values = existingValue.split(',');
			for(var i = 0; i < values.length; i++){
				var val = values[i].trim();
				if(val !== ''){
					tagValues.pushObject(val);
				}
			}
		}
		
		this.set('tags', tags); //NO I18N
		this.set('tagValues', tagValues); //NO I18N
		this.set('selectedData', selectedData); //NO I18N
		this.set('dropDownList', Ember.A()); //NO I18N
		this.set('allDropDownList', Ember.A()); //NO I18N
		
		// Load data once
		this.loadObjectData();
		
		Ember.run.scheduleOnce('afterRender', this, this.calculateTagVisibility); //NO I18N
	},
	
	willDestroyElement: function () {
		this._super();
		var customId = this.get('elementId');
		$('#' + customId).off('mousedown');
		$(document).off('mousedown.fwaObjectTagInput_' + customId);
	},
	
	loadObjectData: function(){
		var self = this;
		var searchType = this.get('searchType');
		
		// Handle predefined dropdown values for zone and action types
		var predefinedValues = null;
		if(searchType === 'srcZone' || searchType === 'dstZone'){
			predefinedValues = ['LAN', 'WAN', 'DMZ', 'PCI DSS']; //No I18N
		} else if(searchType === 'action'){//No I18N
			predefinedValues = ['allow', 'accept', 'permit', 'pass', 'admit', 'forward', 'grant', 'deny', 'drop', 'block', 'reject', 'discard', 'refuse', 'filter', 'prohibit']; //No I18N
		}
		
		if(predefinedValues){
			var items = [];
			var tagValues = this.get('tagValues');
			var tags = this.get('tags');
			var selectedData = this.get('selectedData');
			
			for(var i = 0; i < predefinedValues.length; i++){
				var value = predefinedValues[i];
				var isSelected = tagValues.indexOf(value) !== -1;
				var item = {
					value: value,
					displayName: value,
					isSelected: isSelected
				};
				items.push(item);
				
				// Restore tags and selectedData for pre-selected items
				if(isSelected && tags.indexOf(value) === -1){
					tags.pushObject(value);
					selectedData.pushObject(item);
				}
			}
			
			var allDropDownList = this.get('allDropDownList');
			var dropDownList = this.get('dropDownList');
			allDropDownList.clear();
			allDropDownList.pushObjects(items);
			dropDownList.clear();
			dropDownList.pushObjects(items);
			
			Ember.run.scheduleOnce('afterRender', this, this.calculateTagVisibility); //NO I18N
			return;
		}
		
		var url = this.getSelectedTypeUrl(searchType);
		var typeParam = this.getSelectedTypeParam(searchType);
		
		if(!url || url === ''){
			return;
		}
		
		this.set('isLoading', true); //No I18N
		
		var apiUrl = window.OPM.apiUrlPattern + '/' + url;
		apiUrl = appendFWACollectorDetailsString(apiUrl);
		
		var data = {};
		if(OPMClient.ApplicationController.currentPath != 'FWANewCompliance.FWARiskAnalysis.ConfigRule'){
			if(!OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected){
				data.rId=$('#ruleDeviceList option:selected').val(); //No I18N  
				data.type = typeParam;
			}
		}else{
			data.type = typeParam;
		}
		
		$.ajax({
			url: apiUrl,
			type: 'GET', //No I18N
			data: data,
			dataType: 'json', //No I18N
			success: function(response){
				self.set('isLoading', false); //No I18N
				
				if(response && response.dataArray){
					var items = [];
					var tagValues = self.get('tagValues');
					var tags = self.get('tags');
					var selectedData = self.get('selectedData');
					
					for(var i = 0; i < response.dataArray.length; i++){
						var value = response.dataArray[i];
						if(response.dataArray[i].value != undefined){
							value = response.dataArray[i].value; 
						}
						var itemValue = value;
						var itemDisplayName = value;
						var isSelected = tagValues.indexOf(itemValue) !== -1;
						var item = {
							value: itemValue,
							displayName: itemDisplayName,
							isSelected: isSelected
						};
						items.push(item);
						
						// Restore tags and selectedData for pre-selected items
						if(isSelected && tags.indexOf(itemDisplayName) === -1){
							tags.pushObject(itemDisplayName);
							selectedData.pushObject(item);
						}
					}
					
					// Add "Any" option at the beginning if not multiSelect
					if(!self.get('isMultiSelect')){
						var anyItem = {
							value: 'Any', //No I18N
							displayName: 'Any', //No I18N
							isSelected: tagValues.indexOf('Any') !== -1 //No I18N
						};
						items.unshift(anyItem);
						
						// Restore tags and selectedData for pre-selected Any item
						if(anyItem.isSelected && tags.indexOf('Any') === -1){ //No I18N
							tags.pushObject('Any'); //No I18N
							selectedData.pushObject(anyItem);
						}
					}
					
					var allDropDownList = self.get('allDropDownList');
					var dropDownList = self.get('dropDownList');
					allDropDownList.clear();
					allDropDownList.pushObjects(items);
					dropDownList.clear();
					dropDownList.pushObjects(items);
					
					Ember.run.scheduleOnce('afterRender', self, self.calculateTagVisibility); //NO I18N
				} else {
					self.get('dropDownList').clear();
					self.get('allDropDownList').clear();
				}
			},
			error: function(){
				self.set('isLoading', false); //No I18N
			}
		});
	},
	
	searchTypeObserver: function(){
		var currentSearchType = this.get('searchType');
		var previousSearchType = this.get('_previousSearchType');
		
		// Only clear selections if searchType actually changed
		if(previousSearchType !== undefined && previousSearchType !== currentSearchType){
			this.clearAndReloadTags();
		}
		this.set('_previousSearchType', currentSearchType); //No I18N
	}.observes('searchType'), //NO I18N
	
	objectSelectUrlObserver: function(){
		var currentUrl = this.get('objectSelectUrl');
		var previousUrl = this.get('_previousObjectSelectUrl');
		
		// Clear selections if objectSelectUrl changed (criteria type changed)
		if(previousUrl !== undefined && previousUrl !== currentUrl){
			this.clearAndReloadTags();
		}
		this.set('_previousObjectSelectUrl', currentUrl); //No I18N
	}.observes('objectSelectUrl'), //NO I18N
	
	criteriaTypeValueObserver: function(){
		var currentCriteriaType = this.get('criteria.criteriaTypeValue');
		var previousCriteriaType = this.get('_previousCriteriaTypeValue');
		
		// Clear selections if criteriaTypeValue changed
		if(previousCriteriaType !== undefined && previousCriteriaType !== currentCriteriaType){
			this.clearAndReloadTags();
		}
		this.set('_previousCriteriaTypeValue', currentCriteriaType); //No I18N
	}.observes('criteria.criteriaTypeValue'), //NO I18N
	
	clearAndReloadTags: function(){
		this.set('searchText', ''); //No I18N
		this.get('dropDownList').clear();
		this.get('allDropDownList').clear();
		this.get('tags').clear();
		this.get('tagValues').clear();
		this.get('selectedData').clear();
		this.get('visibleTags').clear();
		this.get('moretags').clear();
		this.loadObjectData();
		Ember.run.next(this, this.calculateTagVisibility);
	},
	
	updateCriteriaValue: function(){
		var tagValues = this.get('tagValues');
		if(this.get('isMultiSelect')){
			this.set('criteria.criteriaValue', tagValues.join(','));//NO I18N
		} else {
			this.set('criteria.criteriaValue', tagValues.length > 0 ? tagValues[0] : '');//NO I18N
		}
	},
	
	actions: {
		performSearch: function () {
			var searchId = this.get('searchId');
			var searchText = ($('#' + searchId).val() || '').toLowerCase();
			this.set('searchText', searchText); //No I18N
			
			var allItems = this.get('allDropDownList');
			var dropDownList = this.get('dropDownList');
			dropDownList.clear();
			
			if(searchText === ''){
				dropDownList.pushObjects(allItems.slice());
			} else {
				var filteredItems = allItems.filter(function(item){
					return item.displayName.toLowerCase().indexOf(searchText) !== -1;
				});
				dropDownList.pushObjects(filteredItems);
			}
		},
		
		addOrRemoveTagFromDropDown: function (item) {
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			var self = this;
			var criteria = this.get('criteria') || {};
			var checkboxId = 'fwaCheckbox_' + item.value + '_' + (criteria.index || '0'); //NO I18N
			
			if (this.$('input[id="' + checkboxId + '"]').prop("checked")) { //No I18N
				// Add item
				if (!this.get('isMultiSelect')) {
					// Single select - clear previous selections and uncheck all checkboxes
					this.get('tags').clear();
					this.get('tagValues').clear();
					this.get('selectedData').clear();
					// Unmark all items and uncheck checkboxes
					var dropDownList = this.get('dropDownList');
					dropDownList.forEach(function(listItem){
						Ember.set(listItem, 'isSelected', false);//NO I18N
						var otherCheckboxId = 'fwaCheckbox_' + listItem.value + '_' + (criteria.index || '0'); //NO I18N
						self.$('input[id="' + otherCheckboxId + '"]').prop('checked', false);
					});
					// Re-check the current item
					this.$('input[id="' + checkboxId + '"]').prop('checked', true);
				}
				
				if (this.get('tags').length == 0) {
					this.set('tags', Ember.A()); //NO I18N
				}
				if (this.get('tagValues').length == 0) {
					this.set('tagValues', Ember.A()); //NO I18N
				}
				
				this.get('tags').pushObject(item.displayName);
				this.get('tagValues').pushObject(String(item.value));
				if (this.get('selectedData') === undefined) {
					this.set('selectedData', Ember.A()); //NO I18N
				}
				this.get('selectedData').push(item);
				Ember.set(item, 'isSelected', true);//NO I18N
			} else {
				// Remove item
				var index = -1;
				var totalSelList = this.get('selectedData'); //No I18N
				for (var i = 0; i < totalSelList.length; i++) {
					if (String(totalSelList[i].value) === String(item.value)) {
						index = i;
						break;
					}
				}
				if (index !== -1) {
					this.get("selectedData").removeAt(index); //No I18N
				}
				this.get('tags').removeObject(item.displayName);
				this.get('tagValues').removeObject(String(item.value));
				this.get('moretags').removeObject(item.displayName);
				Ember.set(item, 'isSelected', false);//NO I18N
			}
			
			this.updateCriteriaValue();
			
			// Show restricted tags when checkbox is clicked only if there are selected tags
			if (this.get('tags') && this.get('tags').length > 0) {
				this.set('isRestrictedOpen', true); //NO I18N
				this.set('style', ''); //NO I18N
			} else {
				this.set('isRestrictedOpen', false); //NO I18N
				this.set('style', 'display:none'); //NO I18N
			}
			
			Ember.run.next(this, this.calculateTagVisibility);
		},

		removeTag: function (tagToRemove) {
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			var criteria = this.get('criteria') || {};
			var index = -1;
			var selectedData = this.get('selectedData');
			
			for (var i = 0; i < selectedData.length; i++) {
				if (selectedData[i].displayName === tagToRemove) {
					var tagValue = String(selectedData[i].value);
					index = i;
					this.get('tagValues').removeObject(tagValue);
					
					// Uncheck in dropdown
					var checkboxId = 'fwaCheckbox_' + tagValue + '_' + (criteria.index || '0'); //NO I18N
					$('[id="' + checkboxId + '"]').removeAttr('checked');
					
					// Update isSelected in dropDownList
					var dropDownList = this.get('dropDownList');
					var listItem = null;
					for(var j = 0; j < dropDownList.length; j++){
						if(String(dropDownList[j].value) === tagValue){
							listItem = dropDownList[j];
							break;
						}
					}
					if(listItem){
						Ember.set(listItem, 'isSelected', false);//NO I18N
					}
					break;
				}
			}
			if (index !== -1) {
				selectedData.removeAt(index);
			}
			
			this.get('tags').removeObject(tagToRemove);
			this.get('visibleTags').removeObject(tagToRemove);
			this.get('moretags').removeObject(tagToRemove);

			this.updateCriteriaValue();
			
			// Show restricted tags only if there are selected tags
			if (this.get('tags') && this.get('tags').length > 0) {
				this.set('isRestrictedOpen', true); //NO I18N
				this.set('style', ''); //NO I18N
			} else {
				this.set('isRestrictedOpen', false); //NO I18N
				this.set('style', 'display:none'); //NO I18N
			}
			
			Ember.run.next(this, this.calculateTagVisibility);
		},

		toggleRestrictedTags: function () {
			$('.OpMToolBar,.OpMToolBarStyle,.opmMask').remove();
			this.toggleProperty('isRestrictedOpen'); //NO I18N
		},

		hideRestrictedTags: function () {
			this.set('isRestrictedOpen', false); //NO I18N
			this.set('style', 'display:none'); //NO I18N
		}
	},

	calculateTagVisibility: function () {
		var self = this;
		var customId = this.get('elementId');
		var tags = this.get('visibleTags');
		
		// Show dropdown when clicking inside the component
		$('#' + customId).off('mousedown').on('mousedown', { self: self }, function (e) {
			e.stopPropagation();
			$('.inputTags').removeClass('zindex9999');
			$('.inputTags').removeClass('positionRelative');
			$('#' + customId).addClass('zindex9999');
			$('#' + customId).addClass('positionRelative');
			
			// Show search input when clicking inside
			$('#' + customId).find('.fwaObjectSearchInput').show();
			
			// Show restricted tags by default when dropdown opens only if some checkbox is selected
			if (self.get('tags') && self.get('tags').length > 0) {
				self.set('isRestrictedOpen', true); //NO I18N
				self.set('style', ''); //NO I18N
			}
			
			var dropdownId = self.get('dropdownId');
			var searchElement = $('#' + dropdownId);
			if (!searchElement.hasClass('block')) {
				searchElement.addClass('block');
			}
			
			setTimeout(function () {
				self.set('currentlyInfield', true); //NO I18N
			}, 100);
		});

		// Hide dropdown when clicking outside THIS component
		$(document).off('mousedown.fwaObjectTagInput_' + customId).on('mousedown.fwaObjectTagInput_' + customId, { self: self }, function (e) {
			var $clickedElement = $(e.target);
			var $thisComponent = $('#' + customId);
			
			if (!$clickedElement.closest($thisComponent).length) {
				$("#" + customId + ' .multi_value_input_container').each(function () {
					self.set('currentlyInfield', false); //NO I18N
					var $container = $(this);
					if ($container.find('.multiValue_badge').length > 0) {
						$container.find('.fwaObjectSearchInput').hide();
						self.set('isRestrictedOpen', false); //NO I18N
						self.set('style', 'display:none'); //NO I18N
					}
					var dropdownId = self.get('dropdownId');
					var searchElement = $('#' + dropdownId);
					if (searchElement.hasClass('block')) {
						searchElement.removeClass('block');
					}
					$('.validateField').trigger('focusout');
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
		}
		if (!container) { return; }

		var tags = this.get('tags').slice() || [];
		var visibleTags = [];
		var moretags = [];

		// Calculate available width for tags
		var containerWidth = $(container).width();
		var isMultiSelect = this.get('isMultiSelect');
		// Reserve space for count badge (approx 30px) and ellipsis (approx 25px) if multiselect
		var reservedWidth = isMultiSelect ? 55 : 25;
		var availableWidth = containerWidth - reservedWidth;
		var currentWidth = 0;
		var avgBadgeWidth = 80; // Approximate width per badge including margins
		
		// Try to fit as many tags as possible from the beginning
		if(tags.length > 0){
			for(var i = 0; i < tags.length; i++){
				// Estimate badge width based on text length (roughly 8px per char + 40px for padding/close button)
				var estimatedBadgeWidth = Math.min((tags[i].length * 8) + 40, 150);
				if(currentWidth + estimatedBadgeWidth <= availableWidth || visibleTags.length === 0){
					// Always show at least one tag, or add if it fits
					visibleTags.push(tags[i]);
					currentWidth += estimatedBadgeWidth + 5; // 5px gap between badges
				} else {
					// Remaining tags go to moretags (overflow)
					moretags.push(tags[i]);
				}
			}
		}
		this.set('visibleTags', visibleTags); //NO I18N
		this.set('moretags', moretags); //NO I18N
		
		// Hide search input if there are badges and user is not in field
		// Show search input if there are no badges
		if(visibleTags.length > 0 && !this.get('currentlyInfield')){
			this.$('.fwaObjectSearchInput').hide();
		} else if(visibleTags.length === 0){
			this.$('.fwaObjectSearchInput').show();
		}
	}
});

OPMClient.FwaObjUsageSingleReportWidgetComponent = Ember.Component.extend({
	templateName: "FwaObjUsageSingleReportWidget",//No I18N
	didInsertElement: function(){
		var widgetObj = this.get('obj');
        if(widgetObj.id1 == "reprtgrap_4" || widgetObj.id1 == "reprtgrap_5"){
            if(widgetObj.tableData != undefined){
                var temp1 = widgetObj.tableData;
                for(i=0; i<temp1.length; i++){
                    var desc = temp1[i].Description;
                    desc = desc.replaceAll("|_|",",");
                    temp1[i].Description = desc;
                }
            }
            loadFwaObjUsageRepWidget(widgetObj);
        }else{
            loadFwaObjUsageRepWidget(widgetObj);
        }

	},
	getParams:function(rowdata,obj){
		var formData = {};
		formData.reportName = rowdata.reportname;
		formData.suggestReportId = rowdata.suggestReportId;
		formData.rid = OPMClient.FWAReportsDetailsController.devID;
		formData.rptType = "objectusage"; //No I18N
		formData.viewAll = false;
		formData.isRefresh = true;
		formData.rowCount = $("#objUsageRowCount").val();
		formData.widgetName = obj.dispName;
		return formData;
	},
	actions :{
		fwaObjUsageWidExpand:function(obj){
			if(!window.OPM.isFWA){
				$("#fwaExpandGridData .reportGraphContainer").css("top","75px");
			}
			$("#objExpandTable").html("");
			$("#objExpandTable").html('<div id="fwaObjUsageExpandPager"></div><table class="ut ut-Grid" id="fwaObjExpandTable"></table>');
			$("#fwaReportGraphData").hide();
			$("#fwaExpandGridData").show();
			$("#optExportIcons .icons").hide();
			var data = {};
			data.viewAll = true;
			data.isRefresh = false;
			data.widgetName = obj.dispName;
			data.reportName = OPMClient.FWAComplianceObjUsageDetailsController.rowdata.reportname;
			data.suggestReportId = OPMClient.FWAComplianceObjUsageDetailsController.rowdata.suggestReportId;
			data.rid = OPMClient.FWAReportsDetailsController.devID;
			data.rptType = "objectusage"; //No I18N
			var grid1 = $("#fwaObjExpandTable");
			var colNamesList = obj.colNameList;
			var colModelList = getFWAColModels(colNamesList.length);
			if(colModelList != undefined && colModelList[0] !=undefined && (obj.dispName !== "Unused Network Objects" && obj.dispName !== "Unused Service Objects")){
				colModelList[0].formatter =  function(cellvalue, options) {
					return '<span data-val="'+cellvalue+'" style="color:blue;cursor:pointer">'+cellvalue+'</span>';
				}
				colModelList[0].unformat =  function(cellvalue, options, cell) {
					return $('span', cell).attr('data-val');
				}
			}
			OPMClient.FWAComplianceObjUsageDetailsController.set("singleWidData",obj); //No I18N
			

			var Url = window.OPM.apiUrlPattern + '/fwacompliance/getRuleSuggestionReport'; //No I18N
			Url=appendFWACollectorDetailsString(Url);
			grid1.jqGrid({
				url: Url,
				mtype:'GET', //No I18N
				postData:data,
				datatype:"json", //No I18N
				colNames: escapeGridColumnNames(colNamesList), 
				colModel: colModelList,
				prmNames: {page:"page",rows:"rows", sort:"sortByColumn", order:"sortByType",totalrows:null}, //No I18N
				pager: '#fwaObjUsageExpandPager', //No I18N
				rowList: [50,100,500,1000,5000],
				sortorder :"desc", //No I18N
				sortname  :'Starton', //No I18N
				rownumbers: true,
				rowNum: 50,
				rownumWidth:80,
				viewrecords: true,
				gridview: true,
				caption: '', 
				height: "auto",//No I18n
				multiselect:false,
				autowidth: true,
				shrinkToFit: true,
				hidegrid: false,
				ignoreCase: true,
				page: 1,
				sortByType: "desc",//No I18N
				sortByColumn: "Starton", //No I18N
				rows : 50,
				onPaging: function (pgButton){
					
				},
				jsonReader : 
				{
					root: "data", //No I18N
					page: "page",//No I18N
					total: "total",//No I18N
					records: "records",  //No I18N
					repeatitems: false//No I18N
				},
				onCellSelect: function(row, col, content, event) 
				{
					var selEntity = grid1.jqGrid('getCell', row, '1'); //No I18N
					if(obj.dispName != undefined){
						if(obj.dispName === "Top Most Used Network Objects" || obj.dispName === "Top Least Used Network Objects"){
							widType = "Network"; //No I18N
							OPMClient.FWAComplianceObjUsageDetailsController.set("drillWidTitle","Usage details of "+selEntity); //No I18N
							OPMClient.FWAComplianceObjUsageDetailsController.set("drillTitle", Ember.I18n.t("webclient.fwa.user.ruleusage")); //No I18N
							OPMClient.FWAComplianceObjUsageDetailsController.set("drillDesc", Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity})); //No I18N
							var drillDet = [{colNameList:  [Ember.I18n.t("webclient.admin.alarmesc.RuleName"), Ember.I18n.t("webclient.fwa.hits")], isSelected: true, desc: Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity}),drillType:"topRule",  tabName:Ember.I18n.t("webclient.fwa.user.ruleusage"),id:"0"}, //No I18N
							                {colNameList:  [Ember.I18n.t("opstor.inventory.ipaddress"), Ember.I18n.t("webclient.fwa.hits")], isSelected: false, desc: Ember.I18n.t("fwa.object.usage.drill.top.ip.desc",{objName: selEntity}), drillType:"topIP", tabName:Ember.I18n.t("webclient.devices.details.top")+" "+Ember.I18n.t("opstor.inventory.ipaddress"),id:"1"}]; //No I18N
						}else if(obj.dispName === "Top Most Used Service Objects" || obj.dispName === "Top Least Used Service Objects"){ //No I18N
							widType = "Service"; //No I18N
							OPMClient.FWAComplianceObjUsageDetailsController.set("drillWidTitle","Usage details of "+selEntity); //No I18N
							OPMClient.FWAComplianceObjUsageDetailsController.set("drillTitle", Ember.I18n.t("webclient.fwa.user.ruleusage")); //No I18N
							OPMClient.FWAComplianceObjUsageDetailsController.set("drillDesc", Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity})); //No I18N
							var drillDet = [{colNameList:  [Ember.I18n.t("webclient.admin.alarmesc.RuleName"), Ember.I18n.t("webclient.fwa.hits")], isSelected: true, desc: Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity}), drillType:"topRule", tabName:Ember.I18n.t("webclient.fwa.user.ruleusage"),id:"0"}, //No I18N
							                {colNameList:  [Ember.I18n.t("opu.views.PORT"), Ember.I18n.t("webclient.fwa.hits")], isSelected: false, desc: Ember.I18n.t("fwa.object.usage.drill.top.port.desc",{objName: selEntity}),  drillType:"topPort", tabName:Ember.I18n.t("webclient.devices.details.top")+" "+Ember.I18n.t("opu.views.PORT"),id:"1"}]; //No I18N
						}
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillData",{type:widType,objName:selEntity}); //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillDetails",drillDet); //No I18N
						if(obj.dispName !== "Unused Network Objects" && obj.dispName !== "Unused Service Objects"){
							location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Optimization/ObjDetails/"+selEntity; //No I18N
						}
					}
				},
				loadComplete: function(data){
					var postData=grid1.jqGrid("getGridParam", "postData");//NO I18N
					OPMClient.FWAComplianceObjUsageDetailsController.widData = postData;//No I18N
				}
			});
			
			if(window.OPM.isFWA){
				$('#objUsageExpandWidTitle').css("width",$(".Optimization .tab1").width());
				$('#fwaObjExpandTable').jqGrid('setGridWidth', $(".Optimization .tab1").width());
			}else{
				$('#objUsageExpandWidTitle').css("width", $(".settingsContent").find(".title").width());
				$("#fwaObjExpandTable").jqGrid('setGridWidth', $(".settingsContent").find(".title").width());
			}
		},
		fwaObjUsageWidgetRefresh:function(obj){
			$("#content_"+obj.count+" #expandButtonFWAReportGraphs_"+obj.count).hide();
			$("#"+obj.count+"_List").jqGrid("GridUnload");
			$("#"+obj.id1).empty();
			var apiURL = window.OPM.apiUrlPattern + '/fwacompliance/getRuleSuggestionReport'; //No I18N
			var rowdata = OPMClient.FWAComplianceObjUsageDetailsController.rowdata;
			var formData = this.getParams(rowdata,obj);
			
			var callBckFunc = function(jsonData,paramsObj){
				var data = [];
				data[obj.count] = jsonData;
				data[obj.count].ListID = obj.count+"_List"; //No I18N
				data[obj.count].PagerID = obj.count+"_Pager"; //No I18N
				data[obj.count].contentID = "content_"+obj.count; //No I18N
				data[obj.count].count = obj.count; //No I18N
				data[obj.count].csvId = "csvIcon_"+obj.count; //No I18N
				data[obj.count].expandButtonID = "expandButtonFWAReportGraphs_"+obj.count; //No I18N
				data[obj.count].exportButtonID = "exportButtonFWAReportGraphs_"+obj.count; //No I18N
				data[obj.count].graphContentID = "GrphContent_reprtgrap_"+obj.count; //No I18N
				data[obj.count].id1 = "reprtgrap_"+obj.count; //No I18N
				data[obj.count].tableContentID = "TableContent_reprtgrap_"+obj.count; //No I18N
				data[obj.count].viewIconID = "viewIcon_"+obj.count; //No I18N
				data[obj.count].xlsId = "xlsIcon_"+obj.count; //No I18N
				
				data[obj.count].graphDivContentID="GrphDivContent_"+obj.count;//No I18N
				data[obj.count].tableDivContentID="TableDivContent_"+obj.count;//No I18N
				data[obj.count].graphContentID="GrphContent_"+data[obj.count].id1;//No I18N
				data[obj.count].tableContentID="TableContent_"+data[obj.count].id1;//No I18N
				loadFwaObjUsageRepWidget(data[obj.count]);
			}
			fwa_getAjaxResponseWithAsync(apiURL,formData,callBckFunc,{});
		},
		exportPDF:function(obj){
			var apiURL = window.OPM.apiUrlPattern + '/fwacompliance/getRuleSuggestionReport'; //No I18N
			var formElements = OPMClient.Reports.getUnusedObjExportParams(obj);
			var rowdata = OPMClient.FWAComplianceObjUsageDetailsController.rowdata;
			var reportTitle = obj.dispName;
			var pdfReqFrom = "FWAObjUsageSingleReport"; //No I18N
			apiURL=appendFWACollectorDetailsString(apiURL);
			fwa_exportPDFReport(apiURL,pdfReqFrom,reportTitle,formElements,false);
		},
		sendMail:function(obj){
			OPMClient.FWAComplianceObjUsageDetailsController.set("isSinglewidSendMail",true); //No I18N
			OPMClient.FWAComplianceObjUsageDetailsController.set("singleWidData",obj); //No I18N
			location.href+="/FWAMail"; //No I18N
		},
		exportCSV: function(obj){
			var apiURL = window.OPM.apiUrlPattern + '/fwacompliance/getRuleSuggestionReport'; //No I18N
			var formElements = OPMClient.Reports.getUnusedObjExportParams(obj);
			formElements.push({name:'exportFileType',value:"csv"}); //No I18N
			var rowdata = OPMClient.FWAComplianceObjUsageDetailsController.rowdata;
			var reportTitle = obj.dispName;
			var pdfReqFrom = "FWAObjUsageSingleReport"; //No I18N
			apiURL=appendFWACollectorDetailsString(apiURL);
			fwa_exportPDFReport(apiURL,pdfReqFrom,reportTitle,formElements,false);
		},
		exportXLS: function(obj){
			var apiURL = window.OPM.apiUrlPattern + '/fwacompliance/getRuleSuggestionReport'; //No I18N
			var formElements = OPMClient.Reports.getUnusedObjExportParams(obj);
			formElements.push({name:'exportFileType',value:"xls"}); //No I18N
			var rowdata = OPMClient.FWAComplianceObjUsageDetailsController.rowdata;
			var reportTitle = obj.dispName;
			var pdfReqFrom = "FWAObjUsageSingleReport"; //No I18N
			apiURL=appendFWACollectorDetailsString(apiURL);
			fwa_exportPDFReport(apiURL,pdfReqFrom,reportTitle,formElements,false);
		}
	},
	willDestroyElement: function(){
		
	}
});

/*---------------------------------------------------------------
				FWA Snapshot Ends here
---------------------------------------------------------------*/

OPMClient.FwaRuleMgmtFineTuningWidgetComponent = Ember.Component.extend({
	templateName: "FWARuleMgmtFineTuningWidget",//No I18N
	tagName:'li',//NO I18N
	initDefaults: function() {
		var widgetObj = this.get('obj');
		
		this.set("ruleName",widgetObj.ruleName);//NO I18N
		var dataAvail = false;
		if(widgetObj.data != undefined && widgetObj.data.msg != undefined){
			this.set("emptyMsg",widgetObj.data.msg);//NO I18N
		}
		if(widgetObj.data != undefined && widgetObj.data != undefined && widgetObj.data.explainTable != undefined && widgetObj.data.fineTuneData != undefined){
			dataAvail = true;
		}
		var tempRuleName = widgetObj.ruleName.replace(/[()]/g,"").replace(/[- .]/g,"_");//NO I18N
		this.set("dataAvail",dataAvail);//NO I18N
		this.set("startTime",widgetObj.startDate);//NO I18N
		this.set("endTime",widgetObj.endDate);//NO I18N
		this.set("gridID1","policyFineTune1_"+tempRuleName);//NO I18N
		this.set("gridID2","policyFineTune2_"+tempRuleName);//NO I18N
		this.set("gridID3","policyFineTune3_"+tempRuleName);//NO I18N
		this.set("accordId","accordion1__nav_"+tempRuleName);//NO I18N
		this.set("accordCont","accordion1__cont"+tempRuleName);//NO I18N
	}.on("init"), //NO I18N 
	actions: {
		changeAccordianStatus:function(){
			var accordId = this.get("accordId");
			var accordCont = this.get("accordCont");
			if($('#'+accordId).hasClass('active')){
				$('#'+accordId).removeClass('active');
	            $('#'+accordCont).slideUp();
			}else{
				$('#'+accordId).addClass('active');
	            $('#'+accordCont).slideDown();
			}
		}
	},
	didInsertElement: function(){
		var widgetObj = this.get('obj');
		var dataAvail = this.get("dataAvail");
		var grid1 =  this.get("gridID1");
		var grid2 =  this.get("gridID2");
		var grid3 =  this.get("gridID3");
		var accordId = this.get("accordId");
		var accordCont = this.get("accordCont");
		var isFirst = (widgetObj.isFirst != undefined ) ? widgetObj.isFirst : false;
		if(isFirst){
			$('#'+accordId).addClass('active');
            $('#'+accordCont).show();
		}
		

		var gridData=(widgetObj.ruleDetail != undefined)? widgetObj.ruleDetail : [];
		
	    var colNames =[Ember.I18n.t('jsp.commonstr.RuleName',this),Ember.I18n.t('webclient.fault.event.displayName',this),Ember.I18n.t('webclient.ipsla.rttDashboard.Destination',this),Ember.I18n.t('nfa.apm.service',this),Ember.I18n.t('webclient.admin.traps.action',this)];//No I18N
	    var colModel =[
	      { name: 'ruleName', index: 'ruleName',hidden:true},//NO I18N
	      { name: 'source', index: 'source',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	        	var text1=''
	        		jQuery(cell).find('span').each(function(i,e){
	        			text1+=jQuery(e).text()+"\n";//No I18N
	        		});
	        	return text1;
	          }}, 
	      { name: 'destination', index: 'destination',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	        	var text1=''
	        		jQuery(cell).find('span').each(function(i,e){
	        			text1+=jQuery(e).text()+"\n";//No I18N
	        		});
	        	return text1;
	          }}, 
	      { name: 'service', index: 'service',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	        	var text1=''
	        		jQuery(cell).find('span').each(function(i,e){
	        			text1+=jQuery(e).text()+"\n";//No I18N
	        		});
	        	return text1;
	          }}, 
	      { name: 'action',index:'action',formatter:function setPolicyRuleStatus(cellValue, options, rowdata, action){//No I18N
				var logTitle=Ember.I18n.t("webclient.fwa.policy.allow",this);//NO I18N
				if(cellValue!=null && cellValue== 'deny'){
					logTitle=Ember.I18n.t("deny",this);//NO I18N
				}	
				return logTitle;
			}}
	      ];
	    if($('#ruleDeviceList option:selected').attr("vendorname") == "Paloalto"){
	    	colNames.splice(3, 0, Ember.I18n.t('webclient.snapshot.application',this)); //No I18N
	    	var applc = { name: 'application', index: 'application',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
	        	var text1=''
	        		jQuery(cell).find('span').each(function(i,e){
	        			text1+=jQuery(e).text()+"\n";//No I18N
	        		});
	        	return text1;
	        }}
	    	colModel.splice(3, 0, applc);
	    }
	    var defOptions={"autoencode":true};//NO I18N
	    opm_loadJQgridWithData("#"+grid3, gridData, colNames, colModel, '', "", "",defOptions,""); //No I18N
	    $("#"+grid3).setGridWidth($('#policyFineTuneCnt').width()-50);
	    
		if(dataAvail){
			var resp = widgetObj.data.fineTuneData;
			var resp1 = widgetObj.data.explainTable;
			var colNames =[Ember.I18n.t('webclient.fault.event.displayName',this),Ember.I18n.t('webclient.ipsla.rttDashboard.Destination',this),Ember.I18n.t('nfa.apm.service',this)];//No I18N
			var colModel =[
				{ name: 'usedsrc', index: 'usedsrc',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}}, 
				{ name: 'useddst', index: 'useddst',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}}, 
				{ name: 'usedser', index: 'usedser',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}} 
				];
			if($('#ruleDeviceList option:selected').attr("vendorname") == "Paloalto"){
				colNames.splice(3, 0, Ember.I18n.t('webclient.snapshot.application',this)); //No I18N
				var applc = { name: 'usedapp', index: 'usedapp',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}}
				colModel.splice(3, 0, applc);
			}
			opm_loadJQgridWithData("#"+grid1, resp, colNames, colModel, '', "", "","",""); //No I18N

			var colNames1 =["",Ember.I18n.t('webclient.fwa.policy.fine.tune.existing.config',this),Ember.I18n.t("webclient.fwa.policy.fine.tune.used.object",this),Ember.I18n.t('webclient.fwa.policy.fine.tune.unused.object',this)];//No I18N
			var colModel1 =[
				{ name: 'header', index: 'header'}, //No I18N
				{ name: 'exist', index: 'exist',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}}, 
				{ name: 'used', index: 'used',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}},
				{ name: 'unused', index: 'unused',formatter:ruleRecommListFormatter,unformat:function(cellvalue, options, cell) {//No I18N
					var text1=''
						jQuery(cell).find('span').each(function(i,e){
							text1+=jQuery(e).text()+"\n";//No I18N
						});
					return text1;
				}} 
				];
			opm_loadJQgridWithData("#"+grid2, resp1, colNames1, colModel1, '', "", "","",""); //No I18N
			$("#"+grid1).setGridWidth($('#policyFineTuneCnt').width()-50);
			$("#"+grid2).setGridWidth($('#policyFineTuneCnt').width()-50);
			
		}
	}
});

OPMClient.FwaMultiRuleSelectionViewComponent = Ember.Component.extend({
	templateName: "components/fwa-multi-rule-selection-view", //No I18N 
	initDefaults: function() {
		var self = this;
		this.set("isAllRuleTypeSelected",false); //No I18N
		var apiURL = window.OPM.apiUrlPattern+"/fwarulemgmt/getRiskAnalysisRiskLists"; //No I18N
		var callBckFunc = function(jsonData,paramsObj){			
			var response = jsonData.riskList || [];
			var ruleCategories = {
					interfaceSpecific: {
						repName: Ember.I18n.t('webclient.fwa.risk.interface.specific',this), //No I18N
						repId: 0,
						rules: []
					},
					nonInterfaceSpecific: {
						repName: Ember.I18n.t('webclient.fwa.risk.non.interface.specific',this), //No I18N
						repId: 1,
						rules: []
					}
			};
			var customRisks = [];
			OPMClient.FWARuleMgmtRiskProfileController.set('intfUnsupportedVendors', jsonData.intfUnsupportedVendors || []); //No I18N
			var intfUnsupportedVendorsStr = '';
			var intfUnsupportedVendors = jsonData.intfUnsupportedVendors || [];
			if (intfUnsupportedVendors.length === 1) {
				intfUnsupportedVendorsStr = intfUnsupportedVendors[0];
			} else if (intfUnsupportedVendors.length === 2) {
				intfUnsupportedVendorsStr = intfUnsupportedVendors.join(' and '); //No I18N
			} else if (intfUnsupportedVendors.length > 2) {
				intfUnsupportedVendorsStr = intfUnsupportedVendors.slice(0, -1).join(', ') + ' and ' + intfUnsupportedVendors[intfUnsupportedVendors.length - 1]; //No I18N
			}
			$('.intfSpecificRiskNoteSpan').text(Ember.I18n.t('webclient.fwa.risk.interface.specific.risk.selected',{ param0: intfUnsupportedVendorsStr} ,this)); //No I18N
			for(var i = 0; i < response.length; i++) {
				var rule = response[i];
				var ruleObj = {
						ruleId: rule.riskId,
						ruleName: rule.riskName,
						criteriaPattern: rule.criteriaPattern,
						criteria: rule.criteria,
						isIntfSpecific: rule.isIntfSpecific || false
				};
				if(rule.category == 0) {
					// Default risks - split based on isIntfSpecific
					if(rule.isIntfSpecific) {
						ruleCategories.interfaceSpecific.rules.push(ruleObj);
					} else {
						ruleCategories.nonInterfaceSpecific.rules.push(ruleObj);
					}
				} else {
					// Custom risks - store in separate array
					customRisks.push(ruleObj);
				}
			}
			paramsObj.self.set("customRiskNotAvailable", (customRisks.length === 0 ? true : false)); //No I18N
			var selRuleList = paramsObj.self.get("selRuleList") || [];
			var defaultSelRiskId = [];
			var customSelRiskId = [];
			for(var m = 0; m < selRuleList.length; m++) {
				if(selRuleList[m].isDefault) {
					defaultSelRiskId.push(selRuleList[m].riskId);
				} else {
					customSelRiskId.push(selRuleList[m].riskId);
				}
			}
			var availableRiskList = [];
			var selectedRiskList = [];
			for(var j = 0; j < customRisks.length; j++) {
				var customRisk = customRisks[j];
				var isSelected = false;
				for(var k = 0; k < customSelRiskId.length; k++) {
					if(customSelRiskId[k] == customRisk.ruleId) {
						isSelected = true;
						break;
					}
				}
				if(isSelected) {
					selectedRiskList.push(customRisk);
				} else {
					availableRiskList.push(customRisk);
				}
			}
			paramsObj.self.set("availableRiskList", availableRiskList); //No I18N
			paramsObj.self.set("selectedRiskList", selectedRiskList); //No I18N
			$('#totalSelectedCustomRules').text("("+selectedRiskList.length+")"); //No I18N
			fwa_getModelForRuleMultiSelect(ruleCategories, paramsObj.self, null, defaultSelRiskId);
		};
		fwa_getAjaxResponseWithAsync(apiURL,{},callBckFunc,{self:self});
	}.on("init"), //NO I18N 
	didInsertElement: function() {
		
	},
	changeRuleCheckedVal:function(ruleObj,checkedVal){
		Ember.set(ruleObj, "allRulesSelected", checkedVal); //No I18N
		Ember.set(ruleObj, "selRuleCount", (checkedVal === "checked")?ruleObj.ruleItemList.length:0); //No I18N
		for(var i=0;i<ruleObj.ruleItemList.length;i++){
			var ruleItemObj=ruleObj.ruleItemList.objectAt(i);
			Ember.set(ruleItemObj, "ischecked",checkedVal); //No I18N
		}
		return ruleObj;
	},
	getAvailRuleList:function() {
		return jQuery.extend(true,[],this.get("ruleList")); //No I18N
	},
	setAllRuleSelectedVal:function() {
		this.set("isAllRuleTypeSelected",(this.get("totalSelRuleCount") == this.get("totalAvailRuleCount"))?"checked":""); //No I18N
	},
	updatePredefinedRulesCount:function() {
		$('#totalSelectedPredefinedRules').text('('+this.get("totalSelRuleCount")+')'); //No I18N
	},
	updateIntfSpecificNoteVisibility:function() {
		var ruleList = this.get("ruleList");
		var hasIntfSpecificSelected = false;
		for(var i=0; i<ruleList.length; i++) {
			for(var j=0; j<ruleList[i].ruleItemList.length; j++) {
				if(ruleList[i].ruleItemList[j].ischecked === "checked" && ruleList[i].ruleItemList[j].isIntfSpecific) { //No I18N
					hasIntfSpecificSelected = true;
					break;
				}
			}
			if(hasIntfSpecificSelected) {
				break;
			}
		}
		if(hasIntfSpecificSelected) {
			$('.intfSpecificRiskNote').show(); //No I18N
		} else {
			$('.intfSpecificRiskNote').hide(); //No I18N
		}
	},
	actions:{
		allRuleSelectedChanged: function(){
			var ruleLst = this.get("ruleList");
			this.set("isAllRuleTypeSelected",(this.get("isAllRuleTypeSelected") === "checked")?"":"checked"); //No I18N
			var totalSelRuleCount = 0;
			for(var i=0;i<ruleLst.length;i++) {
				ruleLst[i] = this.changeRuleCheckedVal(ruleLst[i],this.get("isAllRuleTypeSelected")); //No I18N
				totalSelRuleCount += ruleLst[i].selRuleCount;
			}
			OPMClient.FWARiskAnalysisConfigProfileController.multiSelectRuleList=ruleLst;
			this.set("totalSelRuleCount",totalSelRuleCount); //No I18N
			this.updatePredefinedRulesCount();
			this.updateIntfSpecificNoteVisibility();
		},
		allRulesSelectedChanged: function(ruleItemLstId){
			var index = ruleItemLstId.split("_")[2]; //No I18N
			var ruleLst = this.getAvailRuleList();
			var ruleObj = this.get("ruleList").objectAt(index);
			var totalSelRuleCount = ruleObj.selRuleCount;

			Ember.set(ruleObj, "allRulesSelected", (ruleObj.allRulesSelected === "")?"checked":""); //No I18N
			ruleLst[index] = this.changeRuleCheckedVal(this.get("ruleList").objectAt(index),this.get("ruleList").objectAt(index).allRulesSelected);

			if(ruleLst[index].allRulesSelected === "checked") { //No I18N
				totalSelRuleCount = (this.get("totalSelRuleCount") - totalSelRuleCount) + ruleLst[index].ruleItemList.length; //No I18N
			}else {
				totalSelRuleCount = this.get("totalSelRuleCount") - totalSelRuleCount; //No I18N
			}

			this.set("totalSelRuleCount",totalSelRuleCount); //No I18N
			this.setAllRuleSelectedVal();
			this.updatePredefinedRulesCount();
			OPMClient.FWARiskAnalysisConfigProfileController.multiSelectRuleList=this.getAvailRuleList();
			this.updateIntfSpecificNoteVisibility();
		},
		childRuleSelectionChanged:function(ruleItemLstId,ruleId) {
			var index = ruleItemLstId.split("_")[2]; //No I18N
			var ruleObj = this.get("ruleList").objectAt(index);
			for(var i=0;i<ruleObj.ruleItemList.length;i++) {
				if(ruleObj.ruleItemList[i].ruleId === ruleId){
					break;
				}
			}
			var ruleItemObj=ruleObj.ruleItemList.objectAt(i);
			if(ruleItemObj.ischecked === "checked") { //No I18N
				Ember.set(ruleItemObj, "ischecked", ""); //No I18N
				var selRuleCount=ruleObj.selRuleCount-1;
				Ember.set(ruleObj, "selRuleCount", selRuleCount); //No I18N
				this.set("totalSelRuleCount",this.get("totalSelRuleCount")-1); //No I18N
			}else {
				Ember.set(ruleItemObj, "ischecked", "checked"); //No I18N
				var selRuleCount=ruleObj.selRuleCount+1;
				Ember.set(ruleObj, "selRuleCount", selRuleCount); //No I18N
				this.set("totalSelRuleCount",this.get("totalSelRuleCount")+1); //No I18N
			}
			var allRulesSelected = (ruleObj.selRuleCount == ruleObj.ruleItemList.length)?"checked":""; //No I18N
			Ember.set(ruleObj, "allRulesSelected", allRulesSelected); //No I18N
			this.setAllRuleSelectedVal();
			this.updatePredefinedRulesCount();
			OPMClient.FWARiskAnalysisConfigProfileController.multiSelectRuleList=this.getAvailRuleList();
			this.updateIntfSpecificNoteVisibility();
		},		
		mainRuleListViewChanged:function(index) {
			var ruleLst = this.get("ruleList");
			for(var i=0;i<ruleLst.length;i++){
				var ruleObj = this.get("ruleList").objectAt(i);
				Ember.set(ruleObj, "className", "chkParentChild"); //No I18N
			}
			var ruleObj = this.get("ruleList").objectAt(index);
			var cname=ruleObj.className+" active"; //No I18N
			Ember.set(ruleObj, "className", cname); //No I18N
			if(index != 0) {
				var ruleObj = this.get("ruleList").objectAt(0);
				var cname=ruleObj.className+" noActive"; //No I18N
				Ember.set(ruleObj, "className", cname); //No I18N
			}
			OPMClient.FWARiskAnalysisConfigProfileController.multiSelectRuleList=this.getAvailRuleList();
		}
	}
});

OPMClient.FWARuleMgmtPolicyDetailSelectionComponent = Ember.Component.extend({
	templateName: "FWARuleMgmtPolicyDetailSelection", //No I18N
	classNames:['opmFormRow autoHeight UnusedPolicyDetailSelectionDiv'],
	updatePoliciesFromController: function() {
		OPMClient.FWAComplianceUnusedRulePolicyObjectController.isAllSelected = true;
		var allArray = new Array();
		var selArray = new Array();
		var policies = OPMClient.FWAComplianceDetailsController.allPolicyDet;
		if(policies && policies.length > 0) {
			for (var index = 0; index < policies.length; index++) {
				var array_element = policies[index];
				if(array_element.POLICYID != 'All Policies') {
					allArray.push(array_element.POLICYID);
					selArray.push(array_element.POLICYID);
				}
			}
		}
		OPMClient.FWAComplianceUnusedRulePolicyObjectController.allPolicies = allArray;
		OPMClient.FWAComplianceUnusedRulePolicyObjectController.selPolicies = selArray;
		OPMClient.FWACompliance.loadUnusedRuleSeletedPolicyCount();
	},
	initDefaults: function() {
		this.updatePoliciesFromController();
	}.on("init"), //NO I18N
	allPolicyDetObserver: function() {
		this.updatePoliciesFromController();
	}.observes('OPMClient.FWAComplianceDetailsController.allPolicyDet'), //NO I18N
	onSelectionChange: null,
	actions: {
		policyListSelection: function(polid) {
			var li = $('#fwaunusedRuleReportTypeList li[polid="' + polid + '"]');
			var isChecked = li.find('input').prop('checked');//No I18N
			if(polid == 'All Policies') { //No I18N
				if(isChecked) {
					$('#fwaunusedRuleReportTypeList li').addClass("checked"); //No I18N
					$('#fwaunusedRuleReportTypeList li input').prop("checked", true);
				} else {
					$('#fwaunusedRuleReportTypeList li').removeClass("checked"); //No I18N
					$('#fwaunusedRuleReportTypeList li input').prop("checked", false);
				}
			} else {
				if(isChecked) {
					li.addClass("checked"); //No I18N
				} else {
					li.removeClass("checked"); //No I18N
				}
				if($('#fwaunusedRuleReportTypeList li input.singleChk').length == $('#fwaunusedRuleReportTypeList li input.singleChk:checked').length) {
					$('#fwaunusedRuleReportTypeList li.allChkLi').addClass("checked"); //No I18N
					$('#fwaunusedRuleReportTypeList li input.allChk').prop("checked", true);
				} else {
					$('#fwaunusedRuleReportTypeList li.allChkLi').removeClass("checked"); //No I18N
					$('#fwaunusedRuleReportTypeList li input.allChk').prop("checked", false);
				}
			}
			OPMClient.FWAComplianceUnusedRulePolicyObjectController.selPolicies = [];
			if($('#fwaunusedRuleReportTypeList li input.allChk').prop('checked')) {
				OPMClient.FWAComplianceUnusedRulePolicyObjectController.isAllSelected = true;
				OPMClient.FWAComplianceUnusedRulePolicyObjectController.selPolicies = OPMClient.FWAComplianceUnusedRulePolicyObjectController.allPolicies;
			} else {
				OPMClient.FWAComplianceUnusedRulePolicyObjectController.isAllSelected = false;
				if($('#fwaunusedRuleReportTypeList li input.singleChk:checked').length == 0) {
					alert(Ember.I18n.t("webclient.fwa.select.one.policy", this)); //No I18N
				}
				$('#fwaunusedRuleReportTypeList li input.singleChk:checked').each(function() {
					var id = $(this).attr("id");
					OPMClient.FWAComplianceUnusedRulePolicyObjectController.selPolicies.push(id);
				});
			}
			var onSelectionChange = this.get('onSelectionChange');
			if(onSelectionChange && typeof onSelectionChange === 'function') {
				onSelectionChange();
			}
		}
	},
	didInsertElement: function() {
		OPMClient.FWACompliance.loadUnusedRuleSeletedPolicyCount();
	},
	willDestroyElement: function() {
	}
}); 