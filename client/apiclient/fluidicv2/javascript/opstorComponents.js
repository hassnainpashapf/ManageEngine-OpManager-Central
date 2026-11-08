OPMClient.OpmStorageSummaryComponent = Ember.Component.extend({
	classNames:['heightAuto'],
	templateName: "components/opm-storage-summary",//No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		this.set('widgetData.containerSize',14); //No I18N
		this.set('widgetData.gridCount',widgetData.storageData.length); //No I18N
		this.set('widgetData.gridLoadCount',0); //No I18N
		this.set('adjustedHeight',20);//No I18N
		if(widgetData.apiData.summaryData.productInfo['opstor.inventory.productinfo']!==undefined) {
			this.set('productInfo',widgetData.apiData.summaryData.productInfo['opstor.inventory.productinfo'][0]); //No I18N
		}
		if(window.OPM.isNewSnapshotPage){
			this.set('customStorageSummaryHt','height:360px');//No I18N
			this.set('adjustedHeight',20);//No I18N
		}
	}
});

OPMClient.OpmStorageDialComponent = Ember.Component.extend({
	templateName: "components/opm-associated-dials", //No I18N
	classNames:['customDials','opmStorageGridTitle'], //No I18N
	holderId:'',
	jsonData:{},
	showPage:true,
	didInsertElement: function(){
		var currentWidgetData = this.widgetData;
		var self = this;
		self.set('holderId','snapHolder_'+currentWidgetData.snapid); //No I18N
		self.set('widgetData.apiDataArray',[]); //No I18N
		var jsonData = this.get('widgetData.apiData');
		var cellCount = Math.ceil(Math.ceil(jsonData.length/3)*6.5);
		if(cellCount<=2 || cellCount.toString()==="NaN"){
			cellCount=2;
		}
		if(cellCount===2 && self.get('widgetData.ondemandWidget')!==true){
			self.set('widgetData.noData',true);	 //No I18N
		}
		else{
			self.set('widgetData.noData',false);		//No I18N
			if(window.OPM.isNewSnapshotPage){
				cellCount = (Math.ceil(jsonData.length/4)*10)+3;
			}
		}
		self.set('widgetData.sizey',cellCount); //No I18N
		this.set('snapshotObj.currentCount',this.get('snapshotObj.currentCount')+1); //No I18N
		if(jsonData!==null && jsonData.length>0 && self!==undefined && self!==null){
			var dialClickFunc = function(params){
				//addDialClickEvent(params.dialDivName,params.pdName,params.pollKey);
				var index = params.pollKey;
				var pdName = params.pdName;
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
				jsonData[i].snapHolderId = "opm_"+currentWidgetData.snapid+"_"+jsonData[i].pollId+"_"+i; //No I18N
				jsonData[i].dialEditEnabled = jsonData[i].diagnosticsEnabled;
				jsonData[i].dialEditFunc = dialEditFunc;
				jsonData[i].dialEditParams = dialEditParams;
				jsonData[i].iconTitle = jsonData[i].displayName+" ("+jsonData[i].protocol+")";
				jsonData[i].wIndex = i;
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
				var dialColor = "#76d284";	//No I18N
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
						dialColor = "#fa5b5a"; //No I18N
					}
					else if(severity !== undefined && severity == 2)
					{
						dialColor = "#faad5a"; //No I18N
					}
					else if(severity !== undefined && severity == 3)
					{
						dialColor = "#e8de65"; //No I18N
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
				}
				else{
					jsonData[i].dialClickEnabled = true;
					jsonData[i].dialClickFunc = availDialClick;
					jsonData[i].dialClickParams = "AvailabilityGraph"; //No I18N
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
				self.set('showPage',false); //No I18N
			}
		}
		//opm_widgetSuccessCall(currentWidgetData,self,this.snapIndex,callBackFunc,this.snapshotObj,this.additionalProps);
	}
})

OPMClient.OpmStorageGridComponent = Ember.Component.extend({
	classNames:['heightAuto'],
	templateName: "components/opm-storage-grid",//No I18N
	didInsertElement: function(){
		var widgetData = this.get('widgetData');
		this.set('widgetData.containerSize',0); //No I18N
		this.set('widgetData.gridCount',widgetData.storageData.length); //No I18N
		this.set('widgetData.gridLoadCount',0); //No I18N
	}
});

OPMClient.OpmStorageCommonGridComponent = Ember.Component.extend({
	templateName: "components/opm-storage-common-grid",//No I18N
	classNames:['opmStorageGridTitle'],
	didInsertElement: function(){
		var obj = this.get('obj');
		var key = obj.name;
		var self = this;
		var widgetData = this.get('widgetData');
		var gridData = widgetData.apiData[key];
		var colModel = [];
		var colNames = [];
		var pcolNames = [];
		$.each(widgetData.storageData, function(i,val){
			if(val.name===key){
				colModel = val.colModelList;
		 		pcolNames = val.colNamesList;
			}
		});
		$.each(pcolNames, function(index,name){
			colNames.push(Ember.I18n.t(name));
		});

		var gridCallBack = function(gridID,paramsObj){
			var holderHeight = $("#gbox_"+gridID).height()+40;
			var newsizeY = Math.round(holderHeight / 36);
			if(window.OPM.isNewSnapshotPage){
				newsizeY = Math.round(holderHeight/18);
			}
			if(widgetData.type==="StorageSummary"){
				paramsObj.self.set('widgetData.containerSize',paramsObj.self.get('widgetData.containerSize')+newsizeY);//No i18N
			}
			paramsObj.self.set('widgetData.gridLoadCount',paramsObj.self.get('widgetData.gridLoadCount')+1);//No i18N		
			if(paramsObj.self.get('widgetData.gridLoadCount')===paramsObj.self.get('widgetData.gridCount')){
				paramsObj.self.set('widgetData.sizey',paramsObj.self.get('widgetData.containerSize'));//No i18N
				paramsObj.self.set('snapshotObj.currentCount',paramsObj.self.get('snapshotObj.currentCount')+1);//No i18N
			}
		}

		var sendObj = {};
		
		if(gridData.componentId){
			sendObj.gridId = key.split('.').join(''); 
			sendObj.onSelectFunction = "storageSelectGrid";//No I18N
			sendObj.id = '#' + sendObj.gridId
			if(window.OPM.isCentralServer){
				sendObj.apiUrl = widgetData.url;
				sendObj.data = {
					"records":gridData.records,//No I18N
					"componentId":gridData.componentId//No I18N
				};
			}else{
				sendObj.data = {
					"records":gridData.records,//No I18N
					"name":OPMClient.InventoryDeviceDetailsController.deviceName,//No I18N
					"componentId":gridData.componentId//No I18N
				};
				sendObj.apiUrl = window.OPM.apiUrlPattern + "/storage/getV2OpStorDeviceDetails";//No I18N
			}
			sendObj.colNamesList = colNames;
			sendObj.colModelList = colModel;
			sendObj.rowNum = 5;
			sendObj.enableColChooser = false;
	        sendObj.enableTopColChooser = false;
	        sendObj.searchOption = true;
			sendObj.toggleSearch = true;
			sendObj.showPagerSearch = true;
			sendObj.showPagerColumnChooser = false;
			var defaultOptions={"multiselect":false,pagination: true,minRowsPerPage: 5};//No I18N
			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};
			sendObj.defaultOptions = defaultOptions;
			sendObj.caption = Ember.I18n.t(key);
			sendObj.rowList = [5,10,50,100,500];
			sendObj.sortorder = "asc";//No I18N
			sendObj.sortType = opm_customSortType;//No I18N
			sendObj.ExportCSV=true;
    		sendObj.ExportXLS=false;
			sendObj.sortName = colNames[0];
			sendObj.sortColName = colNames[0];
			sendObj.page = gridData.page;
			var gridNavigatorId = (sendObj.gridId)+"StoragePager";//No I18N
			var parentElem = $(sendObj.id).parent().get(0);
			opm_createDiv(parentElem,gridNavigatorId);
			sendObj.pagerId= gridNavigatorId;
			if(gridData.exportFileName){
				sendObj.exportFileName = gridData.exportFileName;
			}
		} else{
			sendObj.gridId = key.split('.').join('');
			sendObj.pagerId = "";
			sendObj.data = gridData;
			sendObj.page = "";
			var defaultOptions={
			pagination: true,
			minRowsPerPage: 5,
			rowList: [5,10,50,100,500]
			};

			defaultOptions.gridCallBack=gridCallBack;
			defaultOptions.gridCallBackParams={self:self};

			sendObj.defaultOptions = defaultOptions;
			sendObj.colModels = colModel;
			sendObj.colNames = colNames;
			sendObj.captionTitle = Ember.I18n.t(key);
			sendObj.gridNavigator = "";
			sendObj.onSelectFunction = "";
		}		
		self.setProperties({'showGrid':true,'gridData':sendObj}); //No I18N
	}
});
OPMClient.OpmStorageMapComponent = Ember.Component.extend({
	templateName: "components/opm-storage-map",//No I18N
	classNames:['heightAuto'],
	didInsertElement: function() {
		var self = this;
		var storageMapData = this.get('widgetData.apiData');
		$(".storageMap").empty();
		if(Object.keys(storageMapData).length>0){
			$.each(storageMapData, function(key,value) {
				//row
				var $row = $("<div class='row'></div>"); //No I18N
				//header
				var $header = $("<div>"+Ember.I18n.t(key,this)+" ("+value.length+")</div>"); //No I18N
				//content
				var $content = $("<div></div>"); //No I18N
				//console.log($content);
				//var tooltipData = '';
				if(value.length > 0) {
					$.each(value, function(key1,value1) {
						if(value1.hostName!==undefined) {
							var displayName = value1.hostName;
						}
						if(value1.displayName!==undefined) {
							var displayName = value1.displayName;
						}
						if(value1.serverName!==undefined) {
							var displayName = value1.serverName;
						}
						var tooltipData = '{"'+Ember.I18n.t('opu.views.NAME',this)+'":"'+encodeURIComponent(displayName)+'"';//No I18N
						if(value1.powerState!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.vimonitor.devices.snapshot.powerstate',this)+'":"'+value1.powerState+'"';//No I18N
						}
						if(value1.lastUpdatedTime!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.vmware.lastupdatedtime',this)+'":"'+value1.lastUpdatedTime+'"';//No I18N
						}
						if(value1.connectionState!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.vimonitor.devices.snapshot.ConnectionState',this)+'":"'+value1.connectionState+'"';//No I18N
						}
						if(value1.osType!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.addServer.ostype',this)+'":"'+value1.osType+'"';//No I18N
						}
						if(value1.osName!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.vimonitor.devices.snapshot.osname',this)+'":"'+value1.osName+'"';//No I18N
						}
						if(value1.os!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.devices.details.os',this)+'":"'+value1.os+'"';//No I18N
						}
						if(value1.linkSpeed!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('fwa.livetraffic.uplinkspeed',this)+'":"'+value1.linkSpeed+'"';//No I18N
						}
						if(value1.uplinkDriver!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.storage.map.uplinkdriver',this)+'":"'+value1.uplinkDriver+'"';//No I18N
						}
						if(value1.uplinkName!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.storage.map.uplinkname',this)+'":"'+value1.uplinkName+'"';//No I18N
						}
						if(value1.macAddress!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.devices.details.mac',this)+'":"'+value1.macAddress+'"';//No I18N
						}
						if(value1.hbaModel!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('opstor.inventory.raid.hostportmap.hbamodel',this)+'":"'+value1.hbaModel+'"';//No I18N
						}
						if(value1.hbaType!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.storage.map.hbatype',this)+'":"'+value1.hbaType+'"';//No I18N
						}
						if(value1.hbaDevice!==undefined) {
							tooltipData+=',"'+Ember.I18n.t('webclient.storage.map.hbadevice',this)+'":"'+value1.hbaDevice+'"';//No I18N
						}
						if(value1.capacityMB) {
							tooltipData+=',"'+Ember.I18n.t('webclient.reports.capacitymb',this)+'":"'+value1.capacityMB+'"';//No I18N
						}
						if(value1.freespaceMB) {
							tooltipData+=',"'+Ember.I18n.t('webclient.reports.freespacemb',this)+'":"'+value1.freespaceMB+'"';//No I18N
						}
						if(value1.fileSystemType) {
							tooltipData+=',"'+Ember.I18n.t('opstor.inventory.vnxfile.filesystem.type',this)+'":"'+value1.fileSystemType+'"';//No I18N
						}
						if(value1.datastoreUrl) {
							tooltipData+=',"'+Ember.I18n.t('webclient.vmware.datastoreurl',this)+'":"'+value1.datastoreUrl+'"';//No I18N
						}
						tooltipData+="}";//No I18N

						if(key === "webclient.storage.vmwareHBAList") {
							switch(value1.status) {
								case 5:
									statusClass = "up"; //No I18N
									break;
								case 7:
									statusClass = ""; //No I18N
									break;
								case 3:
									statusClass = "down"; //No I18N
									break;
							}
							var $data = $("<i class='spmswitchportstatus "+statusClass+" opmToolTipDesc' data-obj='"+escapeHTML(tooltipData)+"'></i>");
						} else {
							var statusClass = "iconStatusRed"; //No I18N
							if(value1.status!==undefined) {
								switch(value1.status) {
										case 5:
											statusClass = "iconStatusGreen"; //No I18N
											break;
										case 7:
											statusClass = "iconStatusGrey"; //No I18N
											break;
										case 3:
											statusClass = "iconStatusYellow"; //No I18N
											break;
								}
								var $data = $("<i class='iconStatusColor "+statusClass+" opmToolTipDesc' data-obj='"+escapeHTML(tooltipData)+"'></i>");
							} else {
								var $data = $("<i class='iconStatusColor iconStatusGrey opmToolTipDesc' data-obj='"+escapeHTML(tooltipData)+"'></i>");
							}
						}
						$content.append($data);
					});
				} else {
					var $data = $("<div>No data available</div>");
					$content.append($data);
				}
				$row.append($header);
				$row.append($content);
				$(".storageMap").append($row);
			});

			var gridH = $('.storageMap').height();
			var cellCount = Math.ceil((gridH)/(self.snapshotObj.snapDetails.yScale+2));
			self.set('widgetData.sizey',cellCount); //No I18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')-1); // NO i18N
			self.set('snapshotObj.currentCount',self.get('snapshotObj.currentCount')+1); //No I18N
			opm_customTooltip();
			self.set('widgetData.noData',false);	 //No I18N
		} else {
			self.set('widgetData.noData',true);	 //No I18N
			self.set('widgetData.sizey',2); //No I18N
		}
	}
});
