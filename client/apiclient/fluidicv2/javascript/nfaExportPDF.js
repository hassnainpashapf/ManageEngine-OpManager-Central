window.OPM={'isPDF':true,pattern:'d MMM yyyy hh:mm:ss a z'};//No I18N
mtz_pattern = window.OPM.pattern;
mtz_pattern = mtz_pattern.replace(/yy/gi,"YY");//No I18N
mtz_pattern = mtz_pattern.replace(/d/gi,"D");//No I18N
mtz_pattern = mtz_pattern.replace(/E/gi,"d");//No I18N
OPMClient=Ember.Application.create();
function nfa_generatePDF(pdfData) {
	//clearing localstorage
	localStorage.clear();
	if(pdfData !== undefined && pdfData.widData !== undefined && pdfData.threadVal !== undefined) {
		drawPDFWidgets(JSON.parse(pdfData.widData), JSON.parse(pdfData.threadVal));
	}
}

function drawPDFWidgets(widData,threadVal) {
    widData.TimeZone = threadVal.userTimeZone;
    OPMClient = (OPMClient != undefined)? OPMClient : Ember.Application.create();
    
    window.OPM = (window.OPM != undefined)? window.OPM : {};
    window.OPM.productName = threadVal.productName;
    window.OPM.productImgSrc = threadVal.reportimage;
    window.OPM.userTimeZone = threadVal.userTimeZone
    window.OPM.nfaPercentile = threadVal.nfaPercentile;
	window.OPM.percentileInformation = (threadVal.percentileInformation === "true");
        
    OPMClient.NFAReportsPDFCurrentApiurl='';
    OPMClient.InventoryDeviceDetailsController={'snapshotData':{'snapList':[],'reqParams':[],'widData':[widData]}};//NO I18N
    OPMClient.FWAGlobalDataController={'startTime':'','endTime':'','timePeriod':'today'};//No I18N
    
    var reqParams = threadVal.reqParams;
    var snapDetails = threadVal.snapDetails;
    var snapId = (threadVal.snapDetails)?snapDetails.id:0;

    OPMClient.InventoryDeviceDetailsController.snapshotData.snapList.push(snapDetails);
    OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams.push(reqParams);
    OPMClient.FWAGlobalDataController.timePeriod = (reqParams.TimeFrame!==undefined)?reqParams.TimeFrame:'today'; //No I18N

    var imported = document.createElement('script');
    imported.src ="/apiclient/fluidicv2/javascript/OPMI18N_12300_"+htmlEncode(threadVal.userLocale)+".js"; //No I18N
    document.head.appendChild(imported);

    imported.onload = function() {
		if(["nfaDevSummary","ConsolidatedReport","CapacityPlanning"].contains(reqParams.pdfReqFrom)) { //No I18N
			$("#contentDiv").removeClass("dashboardWidget fullCol pdfReportGraph");
		}
		$("#contentDiv").attr("id","widgetElement_"+snapId);
		$("#inventoryGridStyle .grid-stack-item").attr("id",snapId);
		$("#inventoryGridStyle .grid-stack-item").attr("data-gs-id",snapId);

		nfa_drawPDFHeaderInfo(snapId,widData,reqParams);

		switch(reqParams.pdfReqFrom) {
			case "IndividualGraph"			:	nfa_drawPDFIndividualGraph(snapId,widData,reqParams);break; //NO I18N
			case "nfaDevSummary"			:	nfa_drawPDFDeviceSummary(snapId,widData,reqParams);break; //NO I18N
			case "SearchReport"				:	nfa_drawPDFSearchReport(snapId,widData,reqParams);break; //NO I18N
			case "ReportProfiles"			:	nfa_drawPDFReportProfile(snapId,widData,reqParams);break; //NO I18N
			case "Forensics"				:	nfa_drawPDFForensicsReport(snapId,widData,reqParams);break; //NO I18N
			case "ProtocolDistribution"		:	nfa_drawPDFProtocolDistributionReport(snapId,widData,reqParams);break; //NO I18N
			case "ConsolidatedReport"		:	nfa_drawPDFConsolidatedReport(snapId,widData,reqParams);break; //NO I18N
			case "CapacityPlanningReport"	:	nfa_drawPDFCapacityPlanningReport(snapId,widData,reqParams);break; //NO I18N
			case "CompareReports"			:	nfa_drawPDFCompareReports(snapId,widData,reqParams);break; //NO I18N
			case "snapWidget"				:	nfa_drawPDFInventoryWidgetReport(snapId,widData,reqParams,snapDetails);break; //NO I18N
			case "dpiDrillDown"				:	nfa_drawPDFDPIDrillDownReport(snapId,widData,reqParams);break; //NO I18N
			case "interfaceDrillDown"		:	nfa_drawPDFInterfaceDrillDownReport(snapId,widData,reqParams);break; //NO I18N
			case "wlcDrillDown"				:	nfa_drawPDFWLCDrillDownReport(snapId,widData,reqParams);break; //NO I18N
			case "asDrillDown"				:	nfa_drawPDFASDrillDownReport(snapId,widData,reqParams);break; //NO I18N
			case "billingOnDemand"			:	//NO I18N
			case "billingReport"			:	nfa_drawBillingPDF(snapId,widData,reqParams);break; //NO I18N
			case "UniqueConv"				:	nfa_drawUniqueConvPDF(snapId,widData,reqParams);break; //NO I18N
			case "InventoryReport"			:	nfa_drawPDFInventoryReport(snapId, widData, reqParams); break; //NO I18N
			case "ViolationReport"			:	nfa_drawPDFInventoryViolationReport(snapId, widData, reqParams); break; //NO I18N
			case "Forecast"					:	nfa_drawForecastReport(snapId,widData,reqParams);break; //NO I18N
			case "appForecast"				:	nfa_drawForecastReport(snapId,widData,reqParams,true);break; //NO I18N
			case "GeolocationReport"		:	nfa_drawGeolocationReport(snapId,widData,reqParams); break; //NO I18N
			case "LANWANReport"				:	nfa_drawLANWANReport(snapId,widData,reqParams);break; //NO I18N
			case "LANWANInvGraph"			:	nfa_drawLANWANReportInvGraph(snapId,widData,reqParams);break; //NO I18N
			case "PercentileReport"			:	nfa_drawPercentileReport(snapId,widData,reqParams);break; //NO I18N
			case "avcArtConDetails"			:	//NO I18N
			case "avcQoSConDetails"			:	//NO I18N
			case "avcNbar2AppConDetails"	:	//NO I18N
			case "avcHttpHostConDetails"	:	nfa_drawPDFAVCDrillDownReport(snapId,widData,reqParams);break; //NO I18N
			case "NetworkSpeedReport"		:	nfa_drawNetworkSpeedReport(snapId,widData,reqParams);break; //NO I18N
			case "tpAnalysisReport"			:	nfa_drawTPatternAnalysisReport(snapId,widData,reqParams);break; //NO I18N
			case "tpAnomalyReport"			:	nfa_drawTPatternAnomalyReport(snapId,widData,reqParams);break; //NO I18N
			case "DetailedWidget"			:	//NO I18N
			case "DetailedWidgetLevel3"		:	nfa_drawDetailedWidgetReport(snapId,widData,reqParams,snapDetails);break; //NO I18N
		}
	}
	setTimeout(function(){
		window.canvasLoded = true;
	},5000);
}

function nfa_drawPDFHeaderInfo(snapId,widData,reqParams) {
    var paramsInfoString = nfa_getPDFParamsInfo(reqParams);
    $('#reportTitleDiv').text(reqParams.reportTitle); //NO I18N
    $('#paramsInfoDiv').html(paramsInfoString); //NO I18N
    var privacyMsgHtmlString = "<i>"+Ember.I18n.t("webclient.advance.settings.note")+":</i> "+Ember.I18n.t("nfa.GDPRalert.csvPDFMsg"); //NO I18N
    $('#nfaPDFPrivacyMsgDiv').html(privacyMsgHtmlString); //No I18N
    
    (reqParams.reportSubTitle == undefined) ? $('#reportSubTitleDiv').remove():$('#reportSubTitleDiv').text(reqParams.reportSubTitle); //NO I18N
    
    if(reqParams.title1 != undefined) {
        $('#deviceInfoDiv .info1').show();
        $('#deviceInfoDiv .title1').text(getI18nValue(reqParams.title1)); //NO I18N
        $('#deviceInfoDiv .value1').text(reqParams.value1); //NO I18N
    }
    if(reqParams.title2 != undefined) {
        $('#deviceInfoDiv .info2').show();
        $('#deviceInfoDiv .title2').text(getI18nValue(reqParams.title2)); //NO I18N
        $('#deviceInfoDiv .value2').text(reqParams.value2); //NO I18N
    }
    if(reqParams.title3 != undefined) {
        $('#deviceInfoDiv .info3').show();
        $('#deviceInfoDiv .title3').text(getI18nValue(reqParams.title3)); //NO I18N
        $('#deviceInfoDiv .value3').text(reqParams.value3); //NO I18N
    }
    if(reqParams.title4 != undefined) {
        $('#deviceInfoDiv .info4').show();
        $('#deviceInfoDiv .title4').text(getI18nValue(reqParams.title4)); //NO I18N
        $('#deviceInfoDiv .value4').text(reqParams.value4); //NO I18N
    }
    
    if(reqParams.evid !== undefined) {return;}

    if(reqParams.timeFrameString != undefined) {
        $('#timePeriodDiv').html("<div>"+Ember.I18n.t('timeperiod')+"</div><div>"+htmlEncode(reqParams.timeFrameString)+"</div>"); //NO I18N
        $('#timeZoneDiv').html("<div>"+Ember.I18n.t('webclient.reports.timezone')+"</div><div>"+htmlEncode(window.OPM.userTimeZone)+"</div>"); //NO I18N
    }
    if(widData.startTime != undefined) {
        $('#startTimeDiv').html("<div>"+Ember.I18n.t('webclient.devices.details.starttime')+"</div><div>"+htmlEncode(widData.startTime)+"</div>"); //NO I18N
        $('#endTimeDiv').html("<div>"+Ember.I18n.t('webclient.devices.details.endtime')+"</div><div>"+htmlEncode(widData.endTime)+"</div>"); //NO I18N
    }
    if(window.OPM.productName.toLowerCase()!=="netflow analyzer") { //NO I18N
        $('.nfaPdfLogo').attr("src","/apiclient/fluidicv2/img/opmanager_logo_report.gif"); //NO I18N
    }
}

function nfa_getPDFParamsInfo(reqParams) {
    var paramsInfoString=[];
    var snapDetail=OPMClient.InventoryDeviceDetailsController.snapshotData.snapList[0];
    var snapParams = (snapDetail != undefined)?snapDetail.parameters:[];
    for(var i=0; i<snapParams.length; i++) {
        var paramObj = snapParams[i];
        var userSelParam = '';
        if(paramObj.paramType == 'boolean') { //No I18N
            if(reqParams.hasOwnProperty(paramObj.param) && reqParams[paramObj.param] === 'true'){ //No I18N
                userSelParam = getI18nValue(paramObj.name);
            }
        }else if(paramObj.paramType == 'radio' || paramObj.paramType == 'combo') { //No I18N
            if(reqParams.hasOwnProperty(paramObj.param)) {
                for(var j=0; j<paramObj.paramData.length; j++) {
                    if(paramObj.paramData[j].key == reqParams[paramObj.param] && (reqParams[paramObj.param] !== 'false')) { //No I18N
                        userSelParam = getI18nValue(paramObj.name)+' : '+getI18nValue(paramObj.paramData[j].value); //No I18N
                    }
                }
            }
        }
        if(userSelParam != '') {
            paramsInfoString.push(userSelParam);
        }
    }

	var bvStartTime,bvEndTime;
	if(reqParams.pdfReqFrom!=="snapWidget") { //NO I18N
		var groupByVals = {"dscp":"NFAWidget.dscp","application":"NFAWidget.App","source":"NFAWidget.Src","destination":"NFAWidget.Dst","srcdst":"webclient.snapshot.srcdst","srcas":"nfa.asview.srcas","dstas":"nfa.asview.dstas"}; //NO I18N
		if(reqParams.ResolveDNS!==undefined && reqParams.ResolveDNS==="true") { //NO I18N
			paramsInfoString.push(Ember.I18n.t("nfa.resolveIP")); //NO I18N
		}
		if(reqParams.isNetwork!==undefined && reqParams.isNetwork==="true"){ //NO I18N
			paramsInfoString.push(Ember.I18n.t("opstor.inventory.network")); //NO I18N
		}
		if (reqParams.isMacAddress !== undefined && reqParams.isMacAddress === "true") { //NO I18N
			paramsInfoString.push(Ember.I18n.t("opu.views.MAC_ADDRESS")); //NO I18N
		}
		var groupBy = (reqParams.groupBy || reqParams.GroupBy);
		if(groupBy) {
			var groupByI18N = groupByVals[groupBy.toLowerCase()];
			if(groupByI18N!==undefined) {
				paramsInfoString.push(Ember.I18n.t("nfa.forensics.groupby")+" : "+Ember.I18n.t(groupByI18N)); //NO I18N
			}
		}
		if(reqParams.GeoBasedOn!==undefined) {
			paramsInfoString.push(Ember.I18n.t("nfa.geoLocation.basedOn")+" : "+Ember.I18n.t(groupByVals[reqParams.GeoBasedOn])); //NO I18N
		}
		if(reqParams.Data!==undefined) {
			paramsInfoString.push(Ember.I18n.t("webclient.nfa.widget.flowtype")+" : "+reqParams.Data); //NO I18N
		}

		if(reqParams.typeOfGraph!==undefined) {
			paramsInfoString.push(Ember.I18n.t("webclient.Report.Type")+" : "+reqParams.typeOfGraph); //NO I18N
		}else if(reqParams.Type!==undefined) {
			var tTypeVal = nfa_getTrafficTypeValue(reqParams.Type);
			if(tTypeVal==="") { //NO I18N
				paramsInfoString.push(Ember.I18n.t("webclient.graph.type")+" : "+reqParams.Type); //NO I18N
			}else {
				paramsInfoString.push(Ember.I18n.t("webclient.Traffic.Type")+" : "+tTypeVal); //NO I18N
			}
		}
		if(reqParams.exweekend==="true" || reqParams.isExWeekend==="true") { //NO I18N
			paramsInfoString.push(Ember.I18n.t("webclient.Exclude.weekends")+" : "+Ember.I18n.t("jsp.commonstr.Enabled")); //NO I18N
		}
		if(reqParams.granularity!==undefined) {
			paramsInfoString.push(Ember.I18n.t("nfa.reports.granularity")+" : "+reqParams.granularity); //NO I18N
		}
		if(reqParams.IPType !== undefined){
			var IPTypeLabel;
			switch(reqParams.IPType){
				case "ALL"	: 	IPTypeLabel = Ember.I18n.t("opu.common.ALL"); break; //NO I18N
				case "V4"	: 	IPTypeLabel = Ember.I18n.t("nfa.ipv4"); break; //NO I18N
				case "V6"	: 	IPTypeLabel = Ember.I18n.t("nfa.ipv6"); break; //NO I18N
			}
			paramsInfoString.push(Ember.I18n.t("webclient.nfa.ipGrp.ipData")+" : "+IPTypeLabel); //NO I18N
		}
		if(reqParams.filterStTime!==undefined) {
			bvStartTime = reqParams.filterStTime;
			bvEndTime = reqParams.filterEdTime;
		}
		if(reqParams.reportTypeLabel!==undefined) {
			paramsInfoString.push(Ember.I18n.t("webclient.graph.type")+" : "+reqParams.reportTypeLabel); //NO I18N
		}
	}

	if(reqParams.isCloud !== undefined || reqParams.isFrom === "cloudUser"){ //NO I18N
		paramsInfoString = [];
		var flowType, isCloud;
		if(reqParams.pdfReqFrom === "IndividualGraph"){ //NO I18N
			flowType = reqParams.userCloudData;
			isCloud = (reqParams.SrcCloudCategory !== undefined || reqParams.DstCloudCategory !== undefined);
		}else if(reqParams.pdfReqFrom === "snapWidget"){ //NO I18N
			flowType = reqParams.Data;
			isCloud = (reqParams.isCloud === "true"); //NO I18N
		}
		if(reqParams.GroupBy !== undefined){
			var groupByParam;
			switch(reqParams.GroupBy){
				case "none"			: 	groupByParam = Ember.I18n.t("jsp.commonstr.None"); break; //NO I18N
				case "IPName"		: 	if(isCloud){ //NO I18N
											groupByParam = (flowType === "IN" ? Ember.I18n.t("NFAWidget.Dst") : Ember.I18n.t("NFAWidget.Src")); //NO I18N
										}else{
											groupByParam = (flowType === "IN" ? Ember.I18n.t("NFAWidget.Src") : Ember.I18n.t("NFAWidget.Dst")); //NO I18N
										}
										break;
				case "Application"	: 	groupByParam = Ember.I18n.t("NFAWidget.App"); break; //NO I18N
				case "dscp"			: 	groupByParam = Ember.I18n.t("NFAWidget.dscp"); break; //NO I18N
			}
			paramsInfoString.push(Ember.I18n.t("webclient.snapshot.grpby")+": "+groupByParam); //NO I18N
		}
		if(flowType !== undefined){
			paramsInfoString.push(Ember.I18n.t("webclient.nfa.widget.flowtype")+": "+(flowType === "IN" ? Ember.I18n.t("webclient.fwa.received") : Ember.I18n.t("webclient.fwa.sent"))); //NO I18N
		}
		if(reqParams.typeOfGraph !== undefined){
			paramsInfoString.push(Ember.I18n.t("webclient.Report.Type")+": "+reqParams.typeOfGraph); //NO I18N
		}
	}
	if(reqParams.BussStartTime != undefined) {
		bvStartTime = getBVFormattedTimeFrame(reqParams.BussStartTime).timeStr;
		bvEndTime = getBVFormattedTimeFrame(reqParams.BussEndTime).timeStr;
	}else if(reqParams.bussStartTime != undefined) {
		bvStartTime = reqParams.bussStartTime;
		bvEndTime = reqParams.bussEndTime;
	}
	if(bvStartTime!==undefined && bvEndTime!==undefined) {
		bvStartTime = (bvStartTime.indexOf(":")===-1)?bvStartTime+":00":bvStartTime; //NO I18N
		bvEndTime = (bvEndTime.indexOf(":")===-1)?bvEndTime+":00":bvEndTime; //NO I18N
        $('#bvTimeDiv').html("<div>"+Ember.I18n.t('webclient.inventory.businesshour')+'</div><div>'+htmlEncode(bvStartTime)+' - '+htmlEncode(bvEndTime)+'</div>'); //No I18N
	}
	return paramsInfoString = paramsInfoString.join(" | "); //NO I18N
}

function getI18nValue(key) {
    if(key == 'Data') {
        return Ember.I18n.t('webclient.nfa.widget.flowtype'); //NO I18N
    }
    return ((Ember.I18n.t(key)).indexOf('Missing translation')!= -1)?key:Ember.I18n.t(key);
}

function nfa_drawPDFIndividualGraph(snapId,jsonData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	widParams.title = reqParams.widgetTitle;

	var graphData ={};
	graphData.data = jsonData.graphData;
	graphData.yAxis = nfa_getYAxisString(jsonData.yaxis);
	graphData.grapPlotType = reqParams.grapPlotType;
	graphData.graphTitle = (jsonData.granularity!==undefined)?jsonData.granularity:""; //NO I18N

	var tableData = {};
	if(reqParams.isFrom === "FlowAPMAC" && reqParams.ReportType === "Conversation"){ //NO I18N
		tableData.gridDetails = nfa_getIndividualGraphGridDetails(reqParams.ReportType, false, "FlowAPMAC"); //NO I18N
	}else{
		tableData.gridDetails = nfa_getIndividualGraphGridDetails(reqParams.Type,reqParams.isNBAR,reqParams.exportReqFrom,reqParams.isFrom);
	}

	if(reqParams.exportReqFrom==="ASView" || reqParams.exportReqFrom==="AStoASTraffic") { //NO I18N
		graphData.data = jsonData.GraphData;
		graphData.yAxis = nfa_getYAxisString(jsonData.yAxis);
	}

	if(reqParams.isFrom === "cloudUser"){ //NO I18N
		if(reqParams.SrcCloudCategory !== undefined || reqParams.DstCloudCategory !== undefined){
			tableData.gridDetails.colNamesList[0] = (reqParams.userCloudData === "IN" ? Ember.I18n.t("NFAWidget.Dst") : Ember.I18n.t("NFAWidget.Src")); //NO I18N
		}else{
			tableData.gridDetails.colNamesList[0] = (reqParams.userCloudData === "IN" ? Ember.I18n.t("NFAWidget.Src") : Ember.I18n.t("NFAWidget.Dst")); //NO I18N
		}
	}

	if(reqParams.exportReqFrom==="CBQoS") { //NO I18N
		graphData.data = jsonData.GraphData;
		graphData.yAxis = jsonData.yAxis;
		tableData.data = jsonData.tableData[0].classes;
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
	}else if(reqParams.exportReqFrom==="ASView") { //NO I18N
		tableData.data = jsonData.Data.trafficdata;
		tableData.gridDetails = nfa_getColumnNameModelDetails("trafficSummary"); //NO I18N
		var tempObj = nfa_getDevTrafficTblDetails(tableData.gridDetails.colNamesList,tableData.gridDetails.colModelList,jsonData.Data.showGranularity,jsonData.Data.granularity);
		tableData.gridDetails.colNamesList = tempObj.colNamesList;
		tableData.gridDetails.colModelList = tempObj.colModelList;
		tableData.gridClassName = "opm_jqGridUI nfaPDF groupHeading"; //NO I18N
		tableData.defaultOptions = {gridCallBack:tempObj.gridCallBackFunc};
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
		delete widParams.title;
		widParams.gridDetails = OPMClient.InventoryPDFParams.get("nfaTShootTraffTbl"); //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,jsonData.TrafficData);
	}else if(reqParams.ShowAll===undefined) {
		var rowData = {};
		for(var i = 0; i<tableData.gridDetails.colModelList.length; i++) {
			var objVal = tableData.gridDetails.colModelList[i].index;
			rowData[objVal] = reqParams["IndividualGraph"+objVal]; //NO I18N
		}
		tableData.data = [rowData];
		if(reqParams.isConv && (reqParams.isFrom !== "cloudUser")){ //NO I18N
			var hiddenCollArr = [];
			if(tableData.data[0].dscp===undefined) {
				hiddenCollArr.push("dscp"); //NO I18N
			}
			if(!jsonData.fromRaw) {
				hiddenCollArr.push("dstport"); //NO I18N
				tableData.gridDetails.colNamesList[3] = Ember.I18n.t("opu.views.PORT"); //NO I18N
			}
			setHiddenColumn(tableData.gridDetails.colModelList,hiddenCollArr,true);
		}
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
	}else {
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);
	}
}

function nfa_drawPDFDeviceSummary(snapId,jsonData,reqParams) {
	if(jsonData.deviceSummary!==undefined && !(jsonData.deviceSummary.isSnmpDevice!==undefined && jsonData.deviceSummary.isSnmpDevice===false)) {
		var summaryArray = nfa_getDeviceSummaryArray(jsonData.deviceSummary);
		var headerHtml=""; //NO I18N
		for(var i=0;i<summaryArray.length;i++) {
			headerHtml+="<div class='row'><div class='col'>"; //NO I18N
			headerHtml+="<div class='cell'><div>"+htmlEncode(summaryArray[i].title1)+"</div><div>"+htmlEncode(summaryArray[i].value1)+"</div></div></div>"; //NO I18N
			headerHtml+="<div class='col'>"; //NO I18N
			headerHtml+="<div class='cell'><div>"+htmlEncode(summaryArray[i].title2)+"</div><div>"+htmlEncode(summaryArray[i].value2)+"</div></div></div></div>"; //NO I18N
		}
		nfa_getHtmlForPDF("#deviceInfoDiv",headerHtml); //NO I18N
	}
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	widParams.title = Ember.I18n.t("webclient.snapshot.name.Device.Traffic"); //NO I18N
	widParams.gridDetails = OPMClient.InventoryPDFParams.get("nfaDevSummaryIntf"); //NO I18N

	var tableData = {};
	tableData.data = [[jsonData.max,jsonData.avgSpeed,jsonData.volume]];
	tableData.gridDetails = OPMClient.InventoryPDFParams.get("nfaDevSummaryTraffic"); //NO I18N

	var graphData ={};
	graphData.grapPlotType = reqParams.grapPlotType;
	if(jsonData.granularity !== undefined) {
		graphData.graphTitle = jsonData.granularity;
	}

	if(!reqParams.isNFGDevice){
		graphData.data = jsonData.devTraffic;
		graphData.yAxis = nfa_getYAxisString(jsonData.YAxis);
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
	}

	widParams.title = ((reqParams.isNFGDevice) ? Ember.I18n.t("nfa.devsummary.topVolume") : Ember.I18n.t("nfa.devsummary.topspeed"))+" - "+Ember.I18n.t("NFAWidget.IN"); //NO I18N
	graphData.data = jsonData.intfTrafficIN;
	graphData.yAxis = nfa_getYAxisString(jsonData.IntfyaxisIN);
	nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);

	if(!reqParams.isNFGDevice){
		widParams.title = Ember.I18n.t("nfa.devsummary.topspeed")+" - "+Ember.I18n.t("NFAWidget.OUT"); //NO I18N
		graphData.data = jsonData.intfTrafficOUT;
		graphData.yAxis = nfa_getYAxisString(jsonData.IntfyaxisOUT);
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);
	}else{
		widParams.title = Ember.I18n.t("nfa.devsummary.topVolume"); //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,jsonData.topIntfVol);
	}

	widParams.title = Ember.I18n.t("nfa.devsummary.topspeed"); //NO I18N
	nfa_drawPDFTableReport(snapId++,widParams,jsonData.topIntfSpd);

	widParams.title = Ember.I18n.t("nfa.devsummary.toputil"); //NO I18N
	nfa_drawPDFTableReport(snapId++,widParams,jsonData.topIntfUtil);

	if(!reqParams.isNFGDevice){
		widParams.title = Ember.I18n.t("nfa.devsummary.topVolume"); //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,jsonData.topIntfVol);
	}

	var titleArr = ["nfa.devsum.topapp","nfa.devsum.topproto","webclient.snapshot.name.Top.Source","webclient.snapshot.name.Top.Destination","webclient.snapshot.name.Top.QoS"]; //NO I18N
	var repTypeArr = ["topApp","topProt","source","destination","dscp"]; //NO I18N
	for (var i=0; i < titleArr.length; i++) {
		widParams.title = Ember.I18n.t(titleArr[i]);
		reqParams.ReportType = repTypeArr[i];
		nfa_getPDFSnapPieChartReport(snapId++,jsonData,reqParams,widParams);
	}

	widParams.title = Ember.I18n.t("webclient.snapshot.name.Top.Conversation"); //NO I18N
	widParams.gridDetails = OPMClient.InventoryPDFParams.get("nfaDevSummaryConv"); //NO I18N
	nfa_drawPDFTableReport(snapId++,widParams,jsonData.topConv);

	if(!reqParams.isNFGDevice){
		widParams.title = Ember.I18n.t("webclient.nfa.asview.traffic"); //NO I18N
		widParams.gridDetails = OPMClient.InventoryPDFParams.get("asViewGridDetails"); //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,(jsonData.ASViewIN)?jsonData.ASViewIN:[]);
	}

	if (jsonData.attackrows !== undefined) {
		widParams.title = Ember.I18n.t("dashboard.name.firewallsecurity"); //NO I18N
		widParams.gridDetails = nfa_getColumnNameModelDetails("attacksEventList"); //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,(jsonData.attackrows)?jsonData.attackrows:[]);
	}

	var titleArr = [Ember.I18n.t("nfa.cloudService.top")+" - "+Ember.I18n.t("webclient.fwa.sent"), Ember.I18n.t("nfa.cloudService.top")+" - "+Ember.I18n.t("webclient.fwa.received"), Ember.I18n.t("nfa.user.top")+" - "+Ember.I18n.t("webclient.fwa.sent"), Ember.I18n.t("nfa.user.top")+" - "+Ember.I18n.t("webclient.fwa.received")]; //NO I18N
	var repTypeArr = ["topCloudSent", "topCloudReceived", "topUserSent", "topUserReceived"]; //NO I18N
	for(var i=0; i<titleArr.length; i++){
		widParams.title = titleArr[i];
		reqParams.ReportType = repTypeArr[i];
		nfa_getPDFSnapPieChartReport(snapId++, jsonData, reqParams, widParams);
	}
	
	tableData.data = [[jsonData.averageReceivedFlow, jsonData.lastReceivedFlow]];
	tableData.gridDetails.colNamesList = ["nfa.average.receivedFlow", "nfa.last.receivedFlow"]; //NO I18N
	tableData.gridDetails.colModelList = [{name: 0, index: 0}, {name: 1, index: 1}];
	widParams.title = Ember.I18n.t("nfa.receivedFlows"); //NO I18N
	graphData.graphTitle = jsonData.flowGranularity;
	graphData.data = jsonData.receivedFlows;
	graphData.yAxis = Ember.I18n.t("nfa.receivedFlows"); //NO I18N
	nfa_drawPDFGraphTableReport("ReceivedFlows",widParams,graphData,tableData); //NO I18N


	tableData.data = [[jsonData.averageDroppedFlow, jsonData.lastDroppedFlow]];
	tableData.gridDetails.colNamesList = ["nfa.average.droppedFlow", "nfa.last.droppedFlow"]; //NO I18N
	tableData.gridDetails.colModelList = [{name: 0, index: 0}, {name: 1, index: 1}];
	widParams.title = Ember.I18n.t("nfa.droppedFlows"); //NO I18N
	graphData.graphTitle = jsonData.flowGranularity;
	graphData.data = jsonData.droppedFlows;
	graphData.yAxis = Ember.I18n.t("nfa.droppedFlows"); //NO I18N
	nfa_drawPDFGraphTableReport("DroppedFlows",widParams,graphData,tableData); //NO I18N


	var tempSnapDetails = {snapshotData: {subgrid: {}}};
	var columnDetails = nfa_getColumnNameModelDetails("flowTemplate"); //NO I18N
	tempSnapDetails.snapshotData.colNamesList = columnDetails.colNamesList;
	tempSnapDetails.snapshotData.colModelList = columnDetails.colModelList;

	columnDetails = nfa_getColumnNameModelDetails("flowTemplateSubGrid"); //NO I18N
	tempSnapDetails.snapshotData.subgrid.colNamesList = columnDetails.colNamesList;
	tempSnapDetails.snapshotData.subgrid.colModelList = columnDetails.colModelList;
	tempSnapDetails.snapshotData.subgrid.subGridFunction = "nfaFlowTemplateSub"; //NO I18N
	nfa_getPDFSubgrid(snapId++, {gridData: jsonData.flowTemplateDetails.gridData, contentHeaderName: Ember.I18n.t("nfa.templateDetails")}, reqParams, tempSnapDetails, widParams.widgetElement); //NO I18N
}

function nfa_drawPDFSearchReport(snapId,jsonData,reqParams) {
	var widParams = {};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N

	if(jsonData.deviceInfo!==undefined) {
		nfa_getSelectedDeviceInfo(jsonData.deviceInfo);
	}
	widParams.gridDetails = nfa_getColumnNameModelDetails(((jsonData.isWLC)?"wlcSearchReport":"searchReport")); //NO I18N
	if((reqParams.ResolveDNS==="false" || !reqParams.ResolveDNS) && (reqParams.reportSubTitle === "Interface"  ||  (reqParams.BussView == undefined || reqParams.BussView === "true" || reqParams.BussView))){
		widParams.gridDetails.colNamesList.splice(10, 2);
		widParams.gridDetails.colModelList.splice(10, 2);
	}
	if(reqParams.IPGroup==="true" || reqParams.IPGroup) { //NO I18N
		widParams.gridDetails.colNamesList.splice(0, 2); 
		widParams.gridDetails.colModelList.splice(0, 2); 
		if(reqParams.ResolveDNS==="false" || !reqParams.ResolveDNS){
			widParams.gridDetails.colNamesList.splice(6, 4);
			widParams.gridDetails.colModelList.splice(6, 4);
		}else{
			widParams.gridDetails.colNamesList.splice(6, 6);
			widParams.gridDetails.colModelList.splice(6, 6);
		}
	}
	if(reqParams.cloudInterface==="true" || reqParams.cloudInterface) { //NO I18N
		widParams.gridDetails.colNamesList[0] = Ember.I18n.t("nfa.region.name"); //NO I18N
		if(reqParams.ResolveDNS==="false" || !reqParams.ResolveDNS ){
			widParams.gridDetails.colModelList.splice(7, 5);
			widParams.gridDetails.colNamesList.splice(7, 5);
		}else{
			widParams.gridDetails.colModelList.splice(7, 7);
			widParams.gridDetails.colNamesList.splice(7, 7);
		}
		
	}
	if(jsonData.trafficIN!==undefined) {
		widParams.title = Ember.I18n.t("webclient.IN.Traffic")+" ( "+jsonData.totalIN+" )"; //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,jsonData.trafficIN);
	}
	if(jsonData.trafficOUT!==undefined) {
		widParams.title = Ember.I18n.t("webclient.OUT.Traffic")+" ( "+jsonData.totalOUT+" )"; //NO I18N
		nfa_drawPDFTableReport(snapId++,widParams,jsonData.trafficOUT);
	}
	if(reqParams.Criteria!==undefined && reqParams.Criteria!=="{}") { //NO I18N
		var criteriaList = JSON.parse(reqParams.Criteria);
		getCriteriaInfo(criteriaList,reqParams.Oper);
	}
}

function nfa_drawPDFReportProfile(snapId,jsonData,reqParams) {
    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    
    if(jsonData.deviceInfo!==undefined) {
        nfa_getSelectedDeviceInfo(jsonData.deviceInfo);
    }
    
    if(['Conversation','ConversationNetwork'].contains(reqParams.ReportType)) {
        widParams.gridDetails = OPMClient.InventoryPDFParams.get('nfaRepProfileConv'); //NO I18N
        nfa_drawPDFTableReport(snapId,widParams,jsonData.data);
    }else {
        widParams.gridDetails = OPMClient.InventoryPDFParams.get('nfaDevSummaryPie'); //NO I18N

        var graphData ={};
        graphData.data = jsonData.data;

        var dataArr =[];
        for(var i=0;i<graphData.data.length;i++) {
            var tempArr = [];
            tempArr.push(graphData.data[i].Name);
            tempArr.push(graphData.data[i].Traffic);
            tempArr.push(graphData.data[i].util);
            dataArr.push(tempArr);
        }
        graphData.data = dataArr;
        nfa_drawPDFPieTable(snapId,widParams,graphData);
    }
}

function nfa_drawPDFForensicsReport(snapId,jsonData,reqParams) {
	var tableData={}, graphData={}, widParams={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	graphData.grapPlotType = reqParams.grapPlotType;

	if(reqParams.isFromDPI!==undefined) {
		if(reqParams.type==="traffic") { //NO I18N
			graphData.data = jsonData.graphData;
			graphData.yAxis = nfa_getYAxisString(jsonData.yAxis);
			nfa_drawPDFGraphTableReport(snapId,widParams,graphData);
			widParams.gridDetails = nfa_getColumnNameModelDetails("dpiTrafficGridDetails"); //NO I18N
		}else {
			widParams.gridDetails = nfa_getDPIForensicsGridDetails(reqParams.type, reqParams.protocol); 
		}
		if(jsonData.tableData === undefined) jsonData.tableData = [];
		nfa_drawPDFTableReport(snapId,widParams,jsonData.tableData);

		if(reqParams.Criteria !== "") { //NO I18N
			var dpiCriteriaArr = reqParams.Criteria.substring(1, reqParams.Criteria.length-1).split(")@@("), dpiCriteria, criteriaObj = {includeList: []}, tempObj; //NO I18N
			for(var i=0,len=dpiCriteriaArr.length; i<len; i++) {
				tempObj = {}; dpiCriteria = dpiCriteriaArr[i].split(","); //NO I18N
				if(["SrcSetNodes","DstSetNodes"].indexOf(dpiCriteria[0]) > -1) { //NO I18N
					tempObj[dpiCriteria[0]] = [dpiCriteria[1],dpiCriteria[2],dpiCriteria[3]];
				}else if(["SrcEntNet","DstEntNet","SPortRange","DPortRange"].indexOf(dpiCriteria[0]) > -1) { //NO I18N
					tempObj[dpiCriteria[0]] = [dpiCriteria[1],dpiCriteria[2]];
				}else {
					tempObj[dpiCriteria[0]] = dpiCriteria[1];
				}
				criteriaObj.includeList.push(tempObj);
			}
			reqParams.Criteria = JSON.stringify(criteriaObj);
		}else {
			reqParams.Criteria = "{}"; //NO I18N
		}
	}
	else if(reqParams.ReportType==="traffic") { //NO I18N
		tableData.data = jsonData.trafficSummaryData;
		tableData.gridDetails = nfa_getTrafficSummaryGridDetails();
		if (!window.OPM.percentileInformation) {
			tableData.gridDetails.colModelList[6].hidden = true;
		}
		graphData.data = jsonData.dataset;
		graphData.yAxis = nfa_getYAxisString(jsonData.yaxis);
		graphData.yAxisThresholdArray = nfa_getTrafficThreshold(jsonData);
		graphData.yAxisThresholdText =jsonData.thresholdText;
		nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);

		widParams.gridDetails = OPMClient.InventoryPDFParams.get("nfaTShootTraffTbl"); //NO I18N
		nfa_drawPDFTableReport(snapId,widParams,jsonData.trafficData);
	}
	else if(reqParams.ReportType==="multicast") { //NO I18N
		tableData.data = (jsonData.trafficSummaryData===undefined)?[]:jsonData.trafficSummaryData;
		tableData.gridDetails = nfa_getMulticastSummaryGridDetails();
		graphData.data = jsonData.graphData;
		graphData.yAxis = (jsonData.yAxis===undefined)?"":jsonData.yAxis; //NO I18N
		nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);

		widParams.gridDetails = nfa_getMulticastGridDetails(reqParams.GroupBy,(reqParams.ResolveDNS==="true")); //NO I18N
		nfa_drawPDFTableReport(snapId,widParams,jsonData.tableData);
	}
	else if(reqParams.ReportType==="medianet") { //NO I18N
		graphData.data = jsonData.graphData;
		graphData.yAxis = jsonData.yAxis;

		tableData.data = jsonData.tableData;
		tableData.gridDetails = nfa_getMedianetGridDetails(reqParams.GroupBy,reqParams.SortBy);
		tableData.defaultOptions = {
			gridCallBack:function() {
				$("#opm_grapTbl"+snapId).jqGrid("setGroupHeaders",tableData.gridDetails.groupHeaders); //NO I18N
				$("#gview_opm_grapTbl"+snapId+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //NO I18N
			}
		};
		tableData.gridClassName = "opm_jqGridUI nfaPDF groupHeading"; //NO I18N
		nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);
	}
	else if(["application","source","destination","DSCP","TCP_FLAGS","nextHop","conversation","asview"].contains(reqParams.ReportType) && !jsonData.isWLC) { //NO I18N
		widParams.gridDetails = nfa_getForensicsGridDetails(reqParams.ReportType,(reqParams.isTOS==="true"),jsonData.data,(reqParams.cloudInterface==="true")); //NO I18N
		nfa_drawPDFTableReport(snapId,widParams,jsonData.data);
	}
	else if(["application","SSID","Host","IPHost","DSCPIn","DSCPOut","conversation"].contains(reqParams.ReportType) && jsonData.isWLC) { //NO I18N
		widParams.gridDetails = nfa_getWlcForensicsGridDetails(reqParams.ReportType,(reqParams.alwaysAllConv==="true")); //NO I18N
		nfa_drawPDFTableReport(snapId,widParams,jsonData.data);
	}
	if(reqParams.Criteria!==undefined && reqParams.Criteria!=="{}") { //NO I18N
		var criteriaList = JSON.parse(reqParams.Criteria);
		getCriteriaInfo(criteriaList,reqParams.Oper);
	}
}

function getCriteriaInfo(criteriaList,matchCriteria) {
	var includeCriteriaList={};
	var excludeCriteriaList={};
	if(criteriaList.includeList!==undefined) {
		nfa_getCriteriaFromList(criteriaList.includeList,includeCriteriaList);
	}
	if(criteriaList.excludeList!==undefined) {
		nfa_getCriteriaFromList(criteriaList.excludeList,excludeCriteriaList);
	}
	var criteriaKeyVsI18nKeyMap = {
		urlHost:"fwa.report.url",APMac:"webclinet.inventory.wlc.apmac",SSID:"webclient.reports.SSID",Application:"NFAWidget.App",NBARApplication:"webclient.reports.NBARApplication", //NO I18N
		SrcAddr:"webclient.Source.Address",DstAddr:"webclient.Destination.Address",IPHost:"NFAWidget.CliIP",Host:"webclinet.inventory.wlc.clientmac", //NO I18N
		SrcEntNet:"webclient.Source.Nework",DstEntNet:"webclient.Destinatin.Network",IPHostNet:"webclient.iphost.network", //NO I18N
		SrcSetNodes:"webclient.Source.Nodes",DstSetNodes:"webclient.Destination.Nodes",IPHostNodes:"webclient.iphost.nodes", //NO I18N
		DSCP:"NFAWidget.dscp",DSCPIn:"webclient.reports.PreDSCP",DSCPOut:"webclient.reports.PostDSCP", //NO I18N
		TOS:"sch.tos",TCP_FLAGS:"webclient.TCP_FLAGS",NextHop:"nfa.reports.NextHop",Port:"opu.views.PORT",SPort:"showPorts.SourcePort", //NO I18N
		DPort:"webclient.admin.forward.destinationport",PortRange:"opu.ipam.PORT_RANGE",SPortRange:"nfa.dpi.srcportrange",DPortRange:"nfa.dpi.dstportrange", //NO I18N
		Protocol:"NFAWidget.proto",TranslatedSRCIP:"webclient.nfa.srcnat",TranslatedDSTIP:"webclient.nfa.dstnat",SrcAS:"nfa.asview.srcas",DstAS:"nfa.asview.dstas",SrcCategory:"nfa.cloud.srccategory",DstCategory:"nfa.cloud.dstcategory",SrcResolvedBy:"nfa.cloud.srcresolvedby",DstResolvedBy:"nfa.cloud.dstresolvedby"//NO I18N
	}
	var operationStr = ""; //NO I18N
	if(matchCriteria!==undefined) {
		operationStr = (matchCriteria==="OR")?Ember.I18n.t("webclient.attacks.criteria.any"):Ember.I18n.t("webclient.attacks.criteria.all"); //NO I18N
	}
	var criteriaHtmlStr = "<div><h4>"+Ember.I18n.t("webclient.admin.re.criteriaslist")+" - <span>"+operationStr+"</span></h4></div>"; //NO I18N
	for(var criteriaKey in includeCriteriaList) {
		criteriaHtmlStr += "<div><b>"+Ember.I18n.t(criteriaKeyVsI18nKeyMap[criteriaKey])+" - "+Ember.I18n.t("webclient.Include")+"</b> : "+includeCriteriaList[criteriaKey].join(",")+"</div>"; //NO I18N
	}
	for(var criteriaKey in excludeCriteriaList) {
		criteriaHtmlStr += "<div><b>"+Ember.I18n.t(criteriaKeyVsI18nKeyMap[criteriaKey])+" - "+Ember.I18n.t("webclient.Exclude")+"</b> : "+excludeCriteriaList[criteriaKey].join(",")+"</div>"; //NO I18N
	}
	nfa_getHtmlForPDF("#criteriaInfoDiv",criteriaHtmlStr); //NO I18N
}

function nfa_getCriteriaFromList(criteriaArray,list) {
	var criteriaObj,criteriaKey,criteriaValue,tempArr;
	for(var i=0,n=criteriaArray.length; i<n; i++) {
		criteriaObj = criteriaArray[i];
		criteriaKey = Object.keys(criteriaObj)[0]; //Each criteria object has only one key
		if(["SrcEntNet","DstEntNet","IPHostNet"].indexOf(criteriaKey)!==-1) { //NO I18N
			tempArr = criteriaObj[criteriaKey];
			criteriaValue = tempArr[0]+"("+tempArr[1]+")"; //NO I18N
		}else if(["PortRange","SPortRange","DPortRange"].indexOf(criteriaKey)!==-1) { //NO I18N
			tempArr = criteriaObj[criteriaKey];
			criteriaValue = tempArr[0]+"-"+tempArr[1]; //NO I18N
		}else if(["SrcSetNodes","DstSetNodes","IPHostNodes"].indexOf(criteriaKey)!==-1) { //NO I18N
			tempArr = criteriaObj[criteriaKey];
			criteriaValue = tempArr[1]+"-"+tempArr[2]+"("+tempArr[0]+")"; //NO I18N
		}else if(["SrcAS","DstAS"].indexOf(criteriaKey)!==-1) { //NO I18N
			criteriaValue = criteriaObj[criteriaKey][1];
		}else if(["SrcResolvedBy","DstResolvedBy"].indexOf(criteriaKey)!==-1){ //NO I18N
			var value = criteriaObj[criteriaKey];
			criteriaValue = (value === "AD") ? Ember.I18n.t("webclient.reports.createreport.ad") : (value === "DHCP") ? Ember.I18n.t("opu.common.DHCP") : (value === "ManualMapping") ? Ember.I18n.t("webclient.manualmapping") : Ember.I18n.t("nfa.cloudService");//NO I18N
		}
		else {
			criteriaValue = criteriaObj[criteriaKey];
		}
		if(!list.hasOwnProperty(criteriaKey)) {
			list[criteriaKey] = [];
		}
		list[criteriaKey].push(criteriaValue);
	}
}

function nfa_getSelectedDeviceInfo(deviceInfo) {
	var devInfoStr = ""; //NO I18N
	if(deviceInfo.deviceString!==undefined) {
		for(var i=0; i<deviceInfo.deviceString.length; i++) {
			var parts = deviceInfo.deviceString[i].split("@@@"); //NO I18N
			devInfoStr += "<div><b>"+htmlEncode(parts[0])+"</b> : "+htmlEncode(parts[1])+"</div>"; //NO I18N
		}
	}
    $('#multiDevInfoDiv').html(devInfoStr); //NO I18N
}

function nfa_drawPDFProtocolDistributionReport(snapId,jsonData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N

	var tableData = {};
	tableData.data = jsonData.result;
	tableData.gridDetails = OPMClient.InventoryPDFParams.get(reqParams.pdfReqFrom);

	var graphData ={};
	graphData.data = jsonData.GraphData;
	graphData.yAxis = nfa_getYAxisString(jsonData.yAxis);
	graphData.grapPlotType = reqParams.grapPlotType;
	graphData.graphTitle = (jsonData.granularity!==undefined)?jsonData.granularity:""; //NO I18N
	nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);
}

function nfa_drawPDFConsolidatedReport(snapId,jsonData,reqParams,widParams) {
	var graphData = {};
	if(widParams===undefined) {
		widParams={};
		widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	}else {
		if(jsonData.trafficGraph.graphData.length===1) { //For Anomaly Report
			graphData.legend = {enabled:false};
		}
	}
	if(widParams.title===undefined) {
		widParams.title = Ember.I18n.t("webclient.Traffic.Report"); //NO I18N
	}
	var tableData = {};
	tableData.data = jsonData.trafficGraph.trafficSummaryData;
	tableData.gridDetails = nfa_getColumnNameModelDetails("trafficSummary"); //NO I18N

	var tempObj = nfa_getDevTrafficTblDetails(tableData.gridDetails.colNamesList,tableData.gridDetails.colModelList,jsonData.trafficGraph.showGranularity,jsonData.trafficGraph.granularity);
	tableData.gridDetails.colNamesList = tempObj.colNamesList;
	tableData.gridDetails.colModelList = tempObj.colModelList;
	if(!window.OPM.percentileInformation) {
		tableData.gridDetails.colNamesList[8] = ""; //NO I18N
		tableData.gridDetails.colModelList[8].hidden = true;
	}
	tableData.gridClassName = "opm_jqGridUI nfaPDF groupHeading"; //NO I18N
	tableData.defaultOptions = {gridCallBack:tempObj.gridCallBackFunc};

	graphData.data = jsonData.trafficGraph.graphData;
	graphData.yAxis = jsonData.trafficGraph.yAxis;
	graphData.graphTitle = jsonData.trafficGraph.graphTitle;
	graphData.grapPlotType = reqParams.grapPlotType;
	graphData.yAxisThresholdArray = nfa_getTrafficThreshold(jsonData.trafficGraph);
	graphData.yAxisThresholdText = jsonData.trafficGraph.thresholdText;
	graphData.infoMsg = jsonData.trafficGraph.spdString;

	nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);

	if(jsonData.pieDataList!==undefined && jsonData.pieDataList.length>0) {
		var arrayObj = {placeholder:[],chartobj:[]};
		for(var i=0;i<jsonData.pieDataList.length;i++) {
			for(var j=0;j<jsonData.pieDataList[i].data.length;j++) {
				var pieID = "nfaPieGraph"+i+""+j; //NO I18N
				jsonData.pieDataList[i].data[j].pieID = pieID;
				jsonData.pieDataList[i].data[j].pieTblID = "nfaPieTbl"+i+""+j; //NO I18N
				var graphParams = {id:pieID,data:nfa_getPieArray(jsonData.pieDataList[i].data[j].data)};
				arrayObj.placeholder.push(pieID);
				arrayObj.chartobj.push(nfa_getPieChartObject(graphParams));
			}
		}
		jsonData.pieArrayObj = arrayObj;
	}
	nfa_getPieArrayDiv(snapId++,widParams,jsonData.pieDataList);
	if(jsonData.pieArrayObj!==undefined) {
		zChart(jsonData.pieArrayObj);
	}

	var colNamesList = ["",Ember.I18n.t("webclient.dashboards.name"),Ember.I18n.t("webclient.Traffic"),Ember.I18n.t("NFAWidget.perctraf")]; //NO I18N
	var colModelList = [
		{name:"colorBar",index:"colorBar",width:10,sortable:false,formatter:nfa_getPieTableColorBar}, //NO I18N
		{name:"0", index:"0"}, //No I18N
		{name:"2", index:"2"},//No I18N	
		{name:"3", index:"3",formatter:nfa_severityBar} //No I18N
	];
	for(var i=0;i<jsonData.pieDataList.length;i++) {
		for(var j=0;j<jsonData.pieDataList[i].data.length;j++) {
			colNamesList[1] = jsonData.pieDataList[i].data[j].colName;
			var pieTblID = "#nfaPieTbl"+i+""+j; //NO I18N
			nfa_loadPDFJQgridWithData(pieTblID,jsonData.pieDataList[i].data[j].data,colNamesList,colModelList,"","","",""); //NO I18N
		}
	}
	if(jsonData.gridDataList!==undefined && jsonData.gridDataList.length>0) {
		widParams.gridDetails = nfa_getColumnNameModelDetails((jsonData.isWLC)?"wlcConsReportConvList":"nfaConsReportConvList"); //NO I18N
		if(jsonData.isWLC && reqParams.isApGrp==="false" && reqParams.isSSIDGrp==="false") { //NO I18N
			widParams.gridDetails.colModelList[1].hidden = true;
		}
		for(var i=0;i<jsonData.gridDataList.length;i++) {
			widParams.title = jsonData.gridDataList[i].title;
			nfa_drawPDFTableReport(snapId++,widParams,jsonData.gridDataList[i].data);
		}
	}
}

function nfa_getPieArrayDiv(snapId,widParams,pieArray) {
	var htmlStr = ""; //NO I18N
	for(var i=0;i<pieArray.length;i++) {
		htmlStr += "<div class='content nfaPieChart'><div class='zohoChartRow'>"; //NO I18N
		for(var j=0;j<pieArray[i].data.length;j++) {
			htmlStr += "<div class='zohoChartColumn'>"; //NO I18N
			htmlStr += "<header class='widHeader'><h2>"+htmlEncode(pieArray[i].data[j].title)+"</h2></header>";
			htmlStr += "<div id='"+htmlEncode(pieArray[i].data[j].pieID)+"'></div>"; //NO I18N
			htmlStr += "<div class='opm_jqGridUI nfaPDF'><table id='"+htmlEncode(pieArray[i].data[j].pieTblID)+"' class='ut ut-Grid'></table></div>"; //NO I18N
			htmlStr += "</div>"; //NO I18N
		}
		htmlStr += "</div></div>"; //NO I18N
	}
    widParams.widgetElement.append(htmlStr);
}

function nfa_drawPDFCapacityPlanningReport(snapId,jsonData,reqParams) {
	var widParams = {};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	if(reqParams.billPlanData) {
		nfa_drawHeaderDetailsInBilling(reqParams,JSON.parse(reqParams.billPlanData));
	}
	var graphData = {
		data:jsonData.TrafficDetails.graphData,
		graphTitle:jsonData.TrafficDetails.graphTitle,
		yAxis:jsonData.TrafficDetails.yAxis,
		yAxisThresholdArray:nfa_getTrafficThreshold(jsonData.TrafficDetails),
		yAxisThresholdText:jsonData.TrafficDetails.thresholdText,
		grapPlotType:reqParams.grapPlotType,
		infoMsg:jsonData.TrafficDetails.spdString
	}
	var tableData = {};
	tableData.data = jsonData.TrafficDetails.trafficSummaryData;
	tableData.gridDetails = nfa_getColumnNameModelDetails("trafficSummary"); //NO I18N

	var tempObj = nfa_getDevTrafficTblDetails(tableData.gridDetails.colNamesList,tableData.gridDetails.colModelList,jsonData.showGranularity,jsonData.granularity);
	tableData.gridDetails.colNamesList = tempObj.colNamesList;
	tableData.gridDetails.colModelList = tempObj.colModelList;
	tableData.gridClassName = "opm_jqGridUI nfaPDF groupHeading"; //NO I18N
	tableData.defaultOptions = {gridCallBack:tempObj.gridCallBackFunc};
	tableData.gridDetails.colNamesList[8] = window.OPM.percentileInformation ? tableData.gridDetails.colNamesList[8] : "" ; //NO I18N
	tableData.gridDetails.colModelList[8].hidden = window.OPM.percentileInformation ? false : true ;
	nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);

	if(jsonData.TrafficSummary!==undefined) {
		widParams.title = jsonData.TrafficSummary.title
		widParams.gridDetails = jsonData.TrafficSummary.gridDetails;
		var defaultOptions = {
			searchOption:true,
			gridCallBack:function(gridTableID) {
				$("#"+gridTableID).jqGrid("setGroupHeaders",{ //NO I18N
					useColSpanStyle:true,
					groupHeaders:nfa_getGroupHeaders(widParams.gridDetails.groupHeaders,widParams.gridDetails.groupHeaderNames)
				});
				$("#gview_"+gridTableID+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //NO I18N
			},
			gridClassName:"opm_jqGridUI nfaPDF groupHeading" //NO I18N
		};
		nfa_drawPDFTableReport(snapId++,widParams,jsonData.TrafficSummary.data,defaultOptions);
	}
	if(jsonData.AverageUsage!==undefined) {
		graphData = {
			data:jsonData.AverageUsage.graphData,
			yAxis:jsonData.AverageUsage.yAxis,
			grapPlotType:"bar" //NO I18N
		};
		widParams.title = jsonData.AverageUsage.title;
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);
	}
	if(jsonData.StandardDeviation!==undefined) {
		graphData = {
			data:jsonData.StandardDeviation.graphData,
			yAxis:jsonData.StandardDeviation.yAxis,
			grapPlotType:"line" //NO I18N
		};
		widParams.title = jsonData.StandardDeviation.title;
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);
	}

	if(jsonData.ApplicationIN!==undefined) {
		jsonData.ApplicationIN.pieID = "nfaPieGraphIN"; //NO I18N
		jsonData.ApplicationIN.pieTblID = "nfaPieTblIN"; //NO I18N
		jsonData.ApplicationOUT.pieID = "nfaPieGraphOUT"; //NO I18N
		jsonData.ApplicationOUT.pieTblID = "nfaPieTblOUT"; //NO I18N

		var pieArray = [{"data":[jsonData.ApplicationIN,jsonData.ApplicationOUT]}]; //NO I18N
		nfa_getPieArrayDiv(snapId++,widParams,pieArray);
		
		var arrayObj = {placeholder:[],chartobj:[]};
		arrayObj.placeholder.push(jsonData.ApplicationIN.pieID);
		arrayObj.chartobj.push(nfa_getPieChartObject({id:jsonData.ApplicationIN.pieID,data:nfa_getPieArray(jsonData.ApplicationIN.data)}));
		arrayObj.placeholder.push(jsonData.ApplicationOUT.pieID);
		arrayObj.chartobj.push(nfa_getPieChartObject({id:jsonData.ApplicationOUT.pieID,data:nfa_getPieArray(jsonData.ApplicationOUT.data)}));
		zChart(arrayObj);

		var colNamesList = ["",Ember.I18n.t("NFAWidget.App"),Ember.I18n.t("webclient.Traffic"),Ember.I18n.t("NFAWidget.perctraf")]; //NO I18N
		var colModelList = [
			{name:"colorBar",index:"colorBar",width:5,sortable:false,formatter:nfa_getPieTableColorBar}, //NO I18N
			{name:"0", index:"0",width:85}, //NO I18N
			{name:"2", index:"2",width:55, sorttype:nfa_customSort}, //NO I18N
			{name:"3", index:"3",width:70, sorttype:"number",formatter:nfa_severityBar} //NO I18N
		];
		nfa_loadPDFJQgridWithData("#nfaPieTblIN",jsonData.ApplicationIN.data,colNamesList,colModelList,"","","",""); //NO I18N
		nfa_loadPDFJQgridWithData("#nfaPieTblOUT",jsonData.ApplicationOUT.data,colNamesList,colModelList,"","","",""); //NO I18N
	}

	if(jsonData.AppGrowthGraphIN!==undefined) {
		graphData = {
			data:jsonData.AppGrowthGraphIN.graphData,
			yAxis:jsonData.AppGrowthGraphIN.yAxis,
			grapPlotType:"bar" //NO I18N
		}
		var tableData = {
			data:jsonData.AppGrowthGraphIN.gridData,
			gridDetails:jsonData.AppGrowthGridDetails
		};
		widParams.title = jsonData.AppGrowthGraphIN.title;
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
	}

	if(jsonData.AppGrowthGraphOUT!==undefined) {
		graphData = {
			data:jsonData.AppGrowthGraphOUT.graphData,
			yAxis:jsonData.AppGrowthGraphOUT.yAxis,
			grapPlotType:"bar" //NO I18N
		}
		var tableData = {
			data:jsonData.AppGrowthGraphOUT.gridData,
			gridDetails:jsonData.AppGrowthGridDetails
		};
		widParams.title = jsonData.AppGrowthGraphOUT.title;
		nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
	}
}

function nfa_drawPDFCompareReports(snapId,jsonData,reqParams) {
    var widParams = {};
    widParams.widgetElement = $("#widgetElement_"+snapId); //No I18N

    var tableData = {};
    var colNamesList = ['webclient.reports.tags.Category','opu.views.TOTAL','webclient.devices.intftypes.max','webclient.availability.datatype.average','webclient.devices.intftypes.95percentile','traffic.StandardDeviation']; //No I18N
    var colModelList = [];
    for(var i=0;i<colNamesList.length;i++) {
        colModelList.push({name:i, index:i});
    }
	if(!window.OPM.percentileInformation){
		colNamesList[4] = "";
		colModelList[4].hidden = true;
	}	
    tableData.gridDetails = {colNamesList:colNamesList,colModelList:colModelList};
    
    var graphData ={};
    graphData.grapPlotType = reqParams.grapPlotType;
    var sortedDev = jsonData.sortedDevice;
    var resultData = jsonData.data;
    if(reqParams.TimeType==="sametime") { //NO I18N
    	for(var i=0; i<sortedDev.length; i++) {
    		var index = sortedDev[i];
            widParams.title = resultData[index].DevInfo;
            tableData.data = resultData[index].TrafficData;

            graphData.data = resultData[index].DataSet;
            graphData.graphTitle = resultData[index].granularity;
            graphData.yAxis = resultData[index].YAxis;
            graphData.yAxisThresholdArray = nfa_getTrafficThreshold(resultData[index]);
            graphData.yAxisThresholdText = resultData[index].thresholdText;
            nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
        }
    }else {
        var index = reqParams.period1;
        for(var i=0;i<reqParams.period2;i++) {
            widParams.title = Ember.I18n.t('webclient.devices.details.starttime')+' : '+resultData[index+i].From+' | '+Ember.I18n.t('webclient.devices.details.endtime')+' : '+resultData[index+i].End; //No I18N
            tableData.data = resultData[index+i].TrafficData;

            graphData.data = resultData[index+i].DataSet;
            graphData.graphTitle = resultData[index+i].granularity;
            graphData.yAxis = resultData[index+i].YAxis;
            graphData.yAxisThresholdArray = nfa_getTrafficThreshold(resultData[index+i]);
            graphData.yAxisThresholdText = resultData[index+i].thresholdText;
            nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
        }
    }
}

function nfa_drawPDFDPIDrillDownReport(snapId,jsonData,reqParams) {
    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    widParams.gridDetails = nfa_getColumnNameModelDetails("dpiDrillDown"); //NO I18N
    if(reqParams.protocol == "17"){ //NO I18N
        widParams.gridDetails.colNamesList.splice(2, 1); widParams.gridDetails.colModelList.splice(2, 1); widParams.gridDetails.colNamesList.splice(6, 2); widParams.gridDetails.colModelList.splice(6, 2); widParams.gridDetails.colNamesList.splice(8, 1); widParams.gridDetails.colModelList.splice(8, 1);
    }
    nfa_drawPDFTableReport(snapId,widParams,jsonData.tableData);
}

function nfa_drawPDFInterfaceDrillDownReport(snapId,jsonData,reqParams) {
    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    widParams.gridDetails = OPMClient.InventoryPDFParams.get(reqParams.pdfReqFrom);
    var colNameIndex=''; //No I18N
    var hiddenCollArr = ['indvTrafficGraph']; //No I18N
    if(["Source", "SrcNetwork"].contains(reqParams.Type)) {
        colNameIndex = 0; 
    }else if(["Destination", "DstNetwork"].contains(reqParams.Type)) { //No I18N
        colNameIndex = 1;
    }else if(reqParams.Type === 'Application') { //No I18N
        colNameIndex = 2;
    }else if(reqParams.Type === 'Protocol') { //No I18N
        colNameIndex = 5;
    }else if(["DSCP","TOS"].contains(reqParams.Type)) { //No I18N
        colNameIndex = 6;
    }
    if(colNameIndex !== ''){ //No I18N
        hiddenCollArr.push(widParams.gridDetails.colModelList[colNameIndex].name);
    }
    if(!jsonData.fromRaw) {
        hiddenCollArr.push('dstport'); //No I18N
         widParams.gridDetails.colNamesList[3] = Ember.I18n.t("opu.views.PORT"); //No I18N
    }
    setHiddenColumn(widParams.gridDetails.colModelList,hiddenCollArr,true);
    nfa_drawPDFTableReport(snapId,widParams,jsonData.resultVector);
}

function nfa_drawPDFWLCDrillDownReport(snapId,jsonData,reqParams) {
    var hiddenCollArr = [];
    var getWhatList = ['topIPHost','topAP','topHost','topSrc','topDst','topApp','topSSID','topDSCPIN','topDSCPOUT']; //No I18N
    if(reqParams.apMacID != undefined) {
        hiddenCollArr.push('1'); //No I18N
    }
    var hiddenColumn = (reqParams.getWhat !== 'topDSCP')?reqParams.getWhat:(reqParams.getWhat+''+reqParams.type); //No I18N
    hiddenCollArr.push(getWhatList.indexOf(hiddenColumn).toString());

    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    widParams.gridDetails = OPMClient.InventoryPDFParams.get(reqParams.pdfReqFrom);
    setHiddenColumn(widParams.gridDetails.colModelList,hiddenCollArr,true);
    nfa_drawPDFTableReport(snapId,widParams,jsonData.resultdata);
}

function nfa_drawPDFASDrillDownReport(snapId,jsonData,reqParams) {
	var widParams={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	widParams.gridDetails =  nfa_getColumnNameModelDetails(reqParams.pdfReqFrom);
	nfa_drawPDFTableReport(snapId,widParams,jsonData.resultdata);
}

function nfa_drawBillingPDF(snapId,jsonData,reqParams) {
    nfa_drawHeaderDetailsInBilling(reqParams);

    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
      
    var tableData = {};
    tableData.data = jsonData.trafficData;
    tableData.gridDetails = OPMClient.InventoryPDFParams.get('nfaTShootTraffTbl'); //No I18N
    
    var graphData ={};
    graphData.data = jsonData.GraphData;
    graphData.yAxis = nfa_getYAxisString(jsonData.yaxis);
    OPMClient.FWAGlobalDataController.timePeriod = "yearly"; //NO I18N
    nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);
}

function nfa_drawUniqueConvPDF(snapId,jsonData,reqParams) {
    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    var tableData = {};
    tableData.data = JSON.parse(reqParams.rowObj);
    if(reqParams.isAccessPoint==="true") { //NO I18N
        tableData.gridDetails = nfa_getWlcForensicsGridDetails(reqParams.redirectFrom,true);
        widParams.gridDetails = nfa_getColumnNameModelDetails("wlcUniqueConv"); //NO I18N
    }else {
        var isTos = (reqParams.isTos!==undefined && reqParams.isTos==="true"); //NO I18N
        tableData.gridDetails = nfa_getForensicsGridDetails(reqParams.redirectFrom,isTos,tableData.data);
        widParams.gridDetails = nfa_getColumnNameModelDetails("uniqueConv"); //NO I18N
    }
    var graphData ={};
    graphData.data = jsonData.GraphData;
    graphData.yAxis = nfa_getYAxisString(jsonData.yaxis);
    graphData.grapPlotType = reqParams.grapPlotType;
    nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);
    nfa_drawPDFTableReport(snapId++,widParams,jsonData.data);
}

function nfa_drawPDFAVCDrillDownReport(snapId,jsonData,reqParams) {
    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    if(jsonData.resultData == undefined || jsonData.resultData == null ) {
        return;
    }
    var getWhat = reqParams.pdfReqFrom;
    var gridData = jsonData.resultData;
    if(reqParams.ShowApp == 'true') { //No I18N
        gridData = jsonData.resultData.appVect;
        getWhat = 'avcQoSConDetailsApp'; //No I18N
    }else if(reqParams.pdfReqFrom == 'avcQoSConDetails') { //No I18N
        getWhat = 'avcQoSConDetailsConv'; //No I18N
    }
    widParams.gridDetails = OPMClient.InventoryPDFParams.get(getWhat);

    if(reqParams.pdfReqFrom==="avcArtConDetails") { //No I18N
        var graphData ={};
        graphData.data = jsonData.graphData;
        graphData.yAxis = nfa_getYAxisString(jsonData.yAxis);
        graphData.grapPlotType = reqParams.grapPlotType;
        graphData.graphTitle = jsonData.granularity;
        nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);
    }
    nfa_drawPDFTableReport(snapId,widParams,gridData);
}

function nfa_drawPDFInventoryWidgetReport(snapId,jsonData,reqParams,snapDetails) {
    var isNFAGeoLocation = (reqParams.isLocation !== undefined && reqParams.isLocation == 'true'); //No I18N
    var isGridViewNfaSubgrid = (snapDetails.name==='nfa.intf.cbqos' || snapDetails.type == 'NFASubGrid' || isNFAGeoLocation); //No I18N

    var widgetElement = $("#widgetElement_"+snapId); //No I18N

    if(reqParams.isLocation === "true" || reqParams.showapp === "true") { //No I18N
        nfa_getPDFSubgrid(snapId,jsonData,reqParams,snapDetails,widgetElement);
    }else if(['Conversation','Grid'].contains(snapDetails.type)) { //No I18N
        nfa_getSnapGridReport(snapId,jsonData,reqParams,snapDetails,widgetElement);
    }else if(['Application','NFADevReport'].contains(snapDetails.type)) { //No I18N
        nfa_getPDFSnapPieChartReport(snapId,jsonData,reqParams,{widgetElement:widgetElement});
    }else if(snapDetails.type == 'NFAGraphTable') { //No I18N
        nfa_getPDFTriGraph(snapId,jsonData,reqParams,snapDetails,widgetElement);
    }else if(snapDetails.type == 'NFASubGrid') { //No I18N
        nfa_getPDFSubgrid(snapId,jsonData,reqParams,snapDetails,widgetElement);
    }else if(['NFAGraph','DeviceTraffic','InterfaceTraffic'].contains(snapDetails.type)) { //No I18N
        nfa_getSnapLineGraphReport(snapId,jsonData,reqParams,snapDetails,widgetElement);
        nfa_getSnapGridReport(snapId,jsonData,reqParams,snapDetails,widgetElement);
    }
}

function nfa_drawForecastReport(snapId,jsonData,reqParams,isAppForecast) {
    if(isAppForecast && jsonData.appNames !== undefined){ //NO I18N
        $('#criteriaInfoDiv').append("<div><b>"+Ember.I18n.t("webclient.nfa.selectedappln")+"</b>: "+htmlEncode(jsonData.appNames)+"</div>"); //NO I18N
    }
    var widParams ={};
    widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
    widParams.title = reqParams.widgetTitle;

    var graphData ={};
    graphData.data = jsonData.GraphData;
    graphData.yAxis = nfa_getYAxisString(jsonData.yAxis);
    graphData.grapPlotType = "line"; //NO I18N
    graphData.legendColors = ["#079cb2","#079cb2","#faa43a","#faa43a"]; //NO I18N
    OPMClient.FWAGlobalDataController.timePeriod = "yearly"; //NO I18N

    var tableData = {};
    if(isAppForecast){
        tableData.gridDetails = {};
        tableData.gridDetails.colNamesList = jsonData.tableheader;
        tableData.gridDetails.colModelList = [];
        for(var i=0; i<jsonData.tableheader.length; i++){
            tableData.gridDetails.colModelList.push({name: jsonData.tableheader[i], index: jsonData.tableheader[i], sortable: false});
        }
    }else{
        tableData.gridDetails = OPMClient.InventoryPDFParams.get('nfaTShootTraffTbl'); //NO I18N
    }
    tableData.data = jsonData.TrafficData;
    nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);
}

function nfa_drawPDFInventoryReport(snapId, jsonData, reqParams){
    if(reqParams.Criteria != undefined && reqParams.Criteria != "") { //NO I18N
        $('#criteriaInfoDiv').append("<div><b>"+Ember.I18n.t("webclient.admin.re.criteria")+"</b>: "+htmlEncode(jsonData.criteriaString)+"</div>"); //NO I18N
    }

    var widParams = {
        widgetElement: $("#widgetElement_"+snapId), //NO I18N
        gridDetails: {}
    };

    var colModelList = [];
    for(var i=0; i<jsonData.TableHeadings.length; i++){
        colModelList.push({name: i, index: i, align: "center", sortable: false}); //NO I18N
    }
    colModelList[0].hidden = !reqParams.isAS;
    widParams.gridDetails.colNamesList = jsonData.TableHeadings;
    widParams.gridDetails.colModelList = colModelList;

    if(jsonData.deviceInfo!==undefined) {
        nfa_getSelectedDeviceInfo(jsonData.deviceInfo);
    }

    var gridCallBackFunc = function(gridTableID){
        $("#"+gridTableID).jqGrid("setGroupHeaders", { //NO I18N
            useColSpanStyle: true,
            groupHeaders: jsonData.GridGroups
        });
        $("#gview_"+gridTableID+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //NO I18N
    }

    var defaultOptions = {snapId: snapId, gridCallBack: gridCallBackFunc, gridClassName: "opm_jqGridUI nfaPDF groupHeading"}; //NO I18N

    nfa_drawPDFTableReport(snapId, widParams, jsonData.Data, defaultOptions);
}

function nfa_drawPDFInventoryViolationReport(snapId, jsonData, reqParams){
    var widParams = {
        widgetElement: $("#widgetElement_"+snapId) //NO I18N
    };

    var tableData = {
        data: jsonData.FilteredData,
        gridDetails: {}
    };
    tableData.gridDetails.colNamesList = jsonData.FilteredTableHeadings;
    tableData.gridDetails.colModelList = [
        {name: 0, hidden: true},
        {name: 1, index: 1},
        {name: 2, index: 2},
        {name: 3, index: 3}
    ];

    var graphData ={
        data: jsonData.FilteredGraphData,
        yAxis: nfa_getYAxisString(jsonData.yaxis),
        grapPlotType: "bar" //NO I18N
    };

    nfa_drawPDFGraphTableReport(snapId, widParams, graphData, tableData);
}

function nfa_drawGeolocationReport(snapId, jsonData, reqParams){
	var snapDetails = {snapshotData: {subgrid: {}}};
	var columnDetails = nfa_getColumnNameModelDetails("geolocation"); //NO I18N
	snapDetails.snapshotData.colNamesList = columnDetails.colNamesList;
	snapDetails.snapshotData.colModelList = columnDetails.colModelList;

	columnDetails = nfa_getColumnNameModelDetails("geolocationSubGrid"); //NO I18N
	snapDetails.snapshotData.subgrid.colNamesList = columnDetails.colNamesList;
	snapDetails.snapshotData.subgrid.colModelList = columnDetails.colModelList;
	snapDetails.snapshotData.subgrid.subGridFunction = "nfaGeolocationSub"; //NO I18N

	if(jsonData.deviceInfo!==undefined) {
		nfa_getSelectedDeviceInfo(jsonData.deviceInfo);
	}
	nfa_getPDFSubgrid(snapId, jsonData, reqParams, snapDetails, $("#widgetElement_"+snapId));
}

function nfa_drawLANWANReport(snapId,jsonData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	widParams.gridDetails = nfa_getColumnNameModelDetails("LANWANReport"); //NO I18N
	nfa_drawPDFTableReport(snapId,widParams,jsonData.Data);
}

function nfa_drawLANWANReportInvGraph(snapId,jsonData,reqParams) {
	var widParams ={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	widParams.title = reqParams.widgetTitle;

	var graphData ={};
	graphData.data = jsonData.graphData;
	graphData.yAxis = nfa_getYAxisString(jsonData.yaxis);
	graphData.grapPlotType = reqParams.grapPlotType;
	graphData.graphTitle = (jsonData.granularity!==undefined)?jsonData.granularity:""; //NO I18N

	var tableData = {};
	tableData.gridDetails = nfa_getColumnNameModelDetails("LANWANReport"); //NO I18N
	tableData.data = JSON.parse(reqParams.rowObj);
	nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);   
}

function nfa_drawPercentileReport(snapId,jsonData,reqParams) {
	var widParams={};
	var defaultOptions = {gridClassName:"opm_jqGridUI nfaPDF groupHeading"}; //NO I18N
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N
	var sourceType = reqParams.BussView === "true" ? "2": reqParams.IPGroup === "true" ? "3": reqParams.isSSIDGrp === "true" ? "6": reqParams.isApGrp === "true" ? "5": (reqParams.isWLC === "true" && reqParams.isSSIDGrp === "false" && reqParams.isApGrp === "false") ? "4": "1";
    widParams.gridDetails = nfa_getPercentileReportGridDetails("percentileList",sourceType); //NO I18N
	defaultOptions.gridCallBack = widParams.gridDetails.gridCallBackFunc;
	nfa_drawPDFTableReport(snapId,widParams,jsonData.data,defaultOptions);
}

function nfa_drawNetworkSpeedReport(snapId,jsonData,reqParams) {
	var widParams={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N

	var tableData = {};
	tableData.data = jsonData.tableData;
	tableData.gridClassName = "opm_jqGridUI nfaPDF groupHeading"; //NO I18N
	tableData.gridDetails = nfa_getColumnNameModelDetails("NetworkSpeedSummary"); //NO I18N

	var graphData ={};
	graphData.data = jsonData.GraphData;
	graphData.yAxis = nfa_getYAxisString(jsonData.yAxis);
	graphData.grapPlotType = reqParams.grapPlotType;
	//graphData.graphTitle = (jsonData.granularity!==undefined)?jsonData.granularity:""; //NO I18N
	nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tableData);

	var defaultOptions = {gridClassName:"opm_jqGridUI"}; //NO I18N
	widParams.gridDetails = nfa_getColumnNameModelDetails("NetworkSpeedReport"); //NO I18N
	nfa_drawPDFTableReport(snapId++,widParams,jsonData.trafficData,defaultOptions);
}

function nfa_drawTPatternAnalysisReport(snapId,jsonData,reqParams) {
	var widParams={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N

	widParams.title = Ember.I18n.t("webclient.IN.Traffic"); //NO I18N
	var tableData = {};
	tableData.data = jsonData.IN.TableData;
	tableData.gridDetails = nfa_getColumnNameModelDetails("tpAnalysisReport"); //NO I18N

	var graphData = {};
	graphData.data = jsonData.IN.GraphData;
	graphData.yAxis = jsonData.IN.yAxis;
	graphData.tpAnalysis = true
	nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);

	widParams.title = Ember.I18n.t("webclient.OUT.Traffic"); //NO I18N
	tableData.data = jsonData.OUT.TableData;

	graphData.data = jsonData.OUT.GraphData;
	graphData.yAxis = jsonData.OUT.yAxis;
	nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
}

function nfa_drawTPatternAnomalyReport(snapId,jsonData,reqParams) {
	var widParams={};
	widParams.widgetElement = $("#widgetElement_"+snapId); //NO I18N

	var chartID = "perfGraph"+htmlEncode(snapId); //NO I18N
	var tpaArr = JSON.parse(reqParams.tpaData);
	var graphData = nfa_getTPAnomalyGraphParams(chartID,Number(tpaArr[0]),Number(tpaArr[1]),Number(tpaArr[2]),Number(tpaArr[3]),tpaArr[4]);
	graphData.grapPlotType = graphData.graphPlotType;

	var time = moment.tz(new Date(tpaArr[0]), window.OPM.userTimeZone).format("MMM-DD-YY HH:mm"); //NO I18N
	var yAxis = tpaArr[4];
	var tableData = {};
	tableData.data = [["", time, tpaArr[1]+yAxis, tpaArr[2]+yAxis, tpaArr[3]+yAxis]];
	tableData.gridDetails = nfa_getColumnNameModelDetails("tpAnalysisReport"); //NO I18N
	nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);

	widParams.title = (tpaArr[5]==="IN")?Ember.I18n.t("webclient.IN.Traffic"):Ember.I18n.t("webclient.OUT.Traffic"); //NO I18N
	nfa_drawPDFConsolidatedReport(snapId++,jsonData,reqParams,widParams);
}

function nfa_drawDetailedWidgetReport(snapId,jsonData,reqParams,snapDetails) {
	var widParams = {
		widgetElement: $("#widgetElement_"+snapId) //NO I18N
	};
	if (reqParams.pdfReqFrom === "DetailedWidgetLevel3") { //NO I18N
		if (reqParams.ServerType === "dns") { //NO I18N
			widParams.gridDetails = nfa_getColumnNameModelDetails("dnsThirdLevel"); //NO I18N
		}else if (reqParams.ServerType === "dhcp") { //NO I18N
			widParams.gridDetails = nfa_getColumnNameModelDetails("dhcpThirdLevel"); //NO I18N
			if(snapDetails.name === "webclient.dpi.dhcp.topclients.byerrorvolume") { //NO I18N
				widParams.gridDetails.colNamesList[5] = Ember.I18n.t("webclient.nak.count"); //NO I18N
			}else if(snapDetails.name === "webclient.dpi.dhcp.topclients.byresponsetime") { //NO I18N
				widParams.gridDetails.colNamesList[5] = Ember.I18n.t("nfa.dpi.responsetime"); //NO I18N
			}
		}
		nfa_drawPDFTableReport(snapId, widParams, jsonData.data);
	} else {
		if(["webclient.dpi.dns.topdomains", "webclient.dpi.dns.topclients", "webclient.dpi.dns.querytypes", "webclient.dpi.dhcp.topclients.byrequests", "webclient.dpi.dhcp.topclients.byerrorvolume", "webclient.dpi.dhcp.topclients.byresponsetime", "webclient.dpi.dhcp.recent.leasedclients"].indexOf(snapDetails.name) !== -1) { //NO I18N
			widParams.gridDetails = {
				colNamesList: snapDetails.snapshotData.colNamesList,
				colModelList: snapDetails.snapshotData.colModelList
			};
			if(snapDetails.name === "webclient.dpi.dhcp.topclients.byerrorvolume") {
				widParams.gridDetails.colNamesList[2] = Ember.I18n.t("webclient.nak.count"); //NO I18N
			} else if (snapDetails.name === "webclient.dpi.dhcp.topclients.byresponsetime") { //NO I18N
				widParams.gridDetails.colNamesList[2] = Ember.I18n.t("nfa.dpi.responsetime"); //NO I18N
			}
			nfa_drawPDFTableReport(snapId, widParams, jsonData.data);
		}else if(snapDetails.name === "webclient.dpi.dns.responsetime" || snapDetails.name === "webclient.dpi.dhcp.responsetime") { //NO I18N
			var gparams = {
				id: "perfGraph"+snapId, //NO I18N
				data: jsonData.graphData,
				grapPlotType: "area", //NO I18N
				timePeriod: OPMClient.FWAGlobalDataController.timePeriod,
				yAxis: jsonData.graphData[0].seriesname+" ( "+jsonData.yAxis+" )",
				legend: {enabled: false},
				yAxisThresholdArray: jsonData.yAxisThresholdArray !== undefined ? jsonData.yAxisThresholdArray : [],
				yAxisThresholdText: jsonData.yAxisThresholdText !== undefined ? jsonData.yAxisThresholdText : []
			};
			widParams.title = Ember.I18n.t("nfa.dpi.responsetime"); //NO I18N
			nfa_drawPDFGraphTableReport(snapId, widParams, gparams);

			snapId++;
			gparams = {
				id: "perfGraph"+snapId, //NO I18N
				data: jsonData.data,
				grapPlotType: "bar", //NO I18N
				timePeriod: OPMClient.FWAGlobalDataController.timePeriod,
				datatype_1: "ordinal", //NO I18N
				yAxis: jsonData.data[0].yAxis,
				xAxis: jsonData.data[0].seriesname,
				legend: {enabled: false},
				isNFATimeSeriesGraph: false
			};
			widParams.title = Ember.I18n.t("art.RespTimeDist"); //NO I18N
			nfa_drawPDFGraphTableReport(snapId, widParams, gparams);
		}else if(snapDetails.name === "webclient.dpi.dns.responsecodes" || snapDetails.name === "webclient.dpi.dns.failedresponses") { //NO I18N
			var gparams = {
				id: "perfGraph"+snapId, //NO I18N
				data: jsonData.graphData,
				grapPlotType: "area", //NO I18N
				timePeriod: OPMClient.FWAGlobalDataController.timePeriod,
				yAxis: jsonData.yAxis
			};
			widParams.title = Ember.I18n.t("webclient.graphview"); //NO I18N
			nfa_drawPDFGraphTableReport(snapId, widParams, gparams);

			snapId++;
			widParams.gridDetails = {
				colNamesList: snapDetails.snapshotData.colNamesList,
				colModelList: snapDetails.snapshotData.colModelList
			};
			widParams.title = Ember.I18n.t("webclient.tableview"); //NO I18N
			nfa_drawPDFTableReport(snapId, widParams, jsonData.data);
		}
	}
}

function nfa_drawPDFTableReport(snapId,widParams,tableData, defaultOptions) {
    var reqParams=OPMClient.InventoryDeviceDetailsController.snapshotData.reqParams[0];
    var $contentdiv = $("<div class='content'></div>");
    widParams.widgetElement.append($contentdiv);
    if(widParams.title != undefined) {
        var $contentHeader = $('<div><header class="widHeader"><h2>'+htmlEncode(widParams.title)+'</h2></header></div>'); //NO I18N
        $contentdiv.append($contentHeader);
    }
    
    if(defaultOptions == undefined){
        defaultOptions = {snapId:snapId};
    }
    
    var gridClass = (defaultOptions.gridClassName != undefined) ? defaultOptions.gridClassName : "opm_jqGridUI nfaPDF"; //NO I18N
    var $tblDiv = $("<div class='"+htmlEncode(gridClass)+"'><table class='ut ut-Grid' id='opm_DeviceSnapList"+htmlEncode(snapId)+"'></table></div>");
    $contentdiv.append($tblDiv);

    var colNamesList,colModelList;
    if(widParams.gridDetails != undefined) {
        colNamesList = widParams.gridDetails.colNamesList;
        colModelList = widParams.gridDetails.colModelList;
    }else {
        colNamesList = OPMClient.InventoryPDFParams.get(widParams.repType).colNamesList;
        colModelList = OPMClient.InventoryPDFParams.get(widParams.repType).colModelList;
    }

    var hiddenCollArr = ["indvTrafficGraph"]; //NO I18N
    setHiddenColumn(colModelList,hiddenCollArr,true);
    validateGridColumnDetails(colModelList,colNamesList);
    nfa_loadPDFJQgridWithData("#opm_DeviceSnapList"+snapId,tableData,colNamesList,colModelList, "", "", "",defaultOptions); //No I18N
}

function nfa_drawPDFPieTable(snapId,widParams,graphData) {
    widParams =  nfa_getPDFPieChartFormattedData(graphData.data,widParams);
    widParams.colorArray = fluidicv2;
    nfa_drawSnapPDFPieChart(snapId,widParams);
}

function nfa_getPDFTriGraph(snapId,jsonData,reqParams,snapDetails,widgetElement) {
    var widParams ={};
    widParams.widgetElement = widgetElement;
   
    var graphData ={};
    graphData.grapPlotType = reqParams.grapPlotType;
    if(reqParams.TypeOFGraph == 'queue') {
        widParams.title = Ember.I18n.t('webclient.snapshot.queue'); //NO I18N
        graphData.data = jsonData.GraphData;
        graphData.yAxis = jsonData.yAxis;

        var tableData = {};
        tableData.data = jsonData.tableData;
        tableData.gridDetails = {};
        tableData.gridDetails.colNamesList = snapDetails.snapshotData.colNamesList1;
        tableData.gridDetails.colModelList = snapDetails.snapshotData.colModelList1;
        nfa_drawPDFGraphTableReport(snapId++,widParams,graphData,tableData);
    }else {
        widParams.title = Ember.I18n.t('webclient.nfa.cbqos.prepolicy'); //NO I18N
        graphData.data = jsonData.preDS;
        graphData.yAxis = jsonData.preyAxis;
        nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);

        widParams.title = Ember.I18n.t('webclient.nfa.cbqos.postpolicy'); //NO I18N
        graphData.data = jsonData.postDS;
        graphData.yAxis = jsonData.postyAxis;
        nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);

        widParams.title = Ember.I18n.t('webclient.nfa.cbqos.dropped'); //NO I18N
        graphData.data = jsonData.dropDS;
        graphData.yAxis = jsonData.dropyAxis;
        nfa_drawPDFGraphTableReport(snapId++,widParams,graphData);
        nfa_getPDFSubgrid(snapId++,jsonData,reqParams,snapDetails,widgetElement);
    }
}

function nfa_getPDFSnapPieChartReport(snapId,jsonData,reqParams,widParams) {
    var colName,getVal;
    widParams.isCloud = false;
    switch(reqParams.ReportType) {
        case 'topApp'			: colName = 'NFAWidget.App'; getVal = 'topApp'; break; //NO I18N
        case 'topProt'			: colName = 'NFAWidget.proto'; getVal = 'topProt'; break; //NO I18N
        case 'source'			: colName = 'NFAWidget.Src'; getVal = 'topSrc'; break; //NO I18N
        case 'destination'		: colName = 'NFAWidget.Dst'; getVal = 'topDst'; break; //NO I18N
        case 'dscp'				: colName = 'nfa.reports.qos'; getVal = 'topDscp'; break; //NO I18N
        case 'topHost'			: colName = 'webclinet.inventory.wlc.clientmac'; getVal = 'resultdata'; break; //NO I18N 
        case 'topIPHost'		: colName = 'NFAWidget.CliIP'; getVal = 'resultdata'; break; //NO I18N
        case 'topSSID'			: colName = 'webclient.snapshot.name.SSID'; getVal = 'resultdata'; break; //NO I18N
        case 'topAP'			: colName = 'NFAWidget.AccessPoint'; getVal = 'resultdata'; break; //NO I18N
        case 'topApp'			: colName = 'webclient.snapshot.name.App.Traffic'; getVal = 'resultdata'; break; //NO I18N
        case 'topDSCP'			: colName = 'webclient.snapshot.name.Qos'; getVal = 'resultdata'; break; //NO I18N
        case 'topCloud'			: colName = 'nfa.cloudService'; getVal = ("topCloud"+(reqParams.Data === "IN"?"Received":"Sent")); widParams.isCloud = true; break; //NO I18N
        case 'topCloudReceived'	: colName = 'nfa.cloudService'; getVal = "topCloudReceived"; widParams.isCloud = true; break; //NO I18N
        case 'topCloudSent'		: colName = 'nfa.cloudService'; getVal = "topCloudSent"; widParams.isCloud = true; break; //NO I18N
        case 'topUser'			: colName = 'webclient.Users'; getVal = ("topUser"+(reqParams.Data === "IN"?"Received":"Sent")); break; //NO I18N
        case 'topUserReceived'	: colName = 'webclient.Users'; getVal = "topUserReceived"; break; //NO I18N
        case 'topUserSent'		: colName = 'webclient.Users'; getVal = "topUserSent"; break; //NO I18N
    }
    if(widParams.isCloud){
        var colNames = ["", colName, "webclient.common.widgets.category", "", "NFAWidget.trfc"]; //NO I18N
        var colModel = [
            {name: "colorBar", index: "colorBar", width: 5, sortable: false, formatter:nfaDeviceRepFormatter}, //NO I18N
            {name: "APP", index: "APP", width: 50, sortable: false}, //NO I18N
            {name: "CATEGORY", index: "CATEGORY", width: 50, sortable: false}, //NO I18N
            {name: "CHART", index: "CHART", formatter: appPercentageFormatter}, //NO I18N
            {name: "TRAFFIC", index: "TRAFFIC", width: 30, sortable: false} //NO I18N
        ];
    }else{
        var colNames = ['',colName,'','','NFAWidget.trfc']; // No I18N
        var colModel =  [
            { name: 'colorBar', index: 'colorBar',width:5, sortable: false, formatter:nfaDeviceRepFormatter}, //NO I18N
            { name: '0', index:'0', width:50,sortable: false}, //No I18N
            { name: '1', index:'1', formatter: appPercentageFormatter}, //No I18N
            { name: '2', index:'2', hidden: true}, //No I18N
            { name: '3', index:'3', width:30,sorttype: nfa_customSort} // No I18N
        ];
    }
    widParams = nfa_getPDFPieChartFormattedData(jsonData[getVal],widParams);
    widParams.colorArray = nfaPieColors;
    widParams.gridDetails = {
        colNamesList : colNames,
        colModelList : colModel
    }
    nfa_drawSnapPDFPieChart(snapId,widParams);
}

function nfa_getPDFPieChartFormattedData(jsonData,widParams) {
    widParams.graphData = [];
    if(jsonData == undefined){return};
    if(widParams.isCloud){
        var gridData = [];
        for(var index=0; index<jsonData.length; index++){
            gridData.push({"APP": jsonData[index][0], "CATEGORY": jsonData[index][1], "CHART": jsonData[index][3], "TRAFFIC": jsonData[index][2]}); //NO I18N
            widParams.graphData.push([jsonData[index][0], jsonData[index][3]]);
        }
        jsonData = gridData;
    }else{
        for(var index = 0; index < jsonData.length; index++) {
            var tempArr = [];
            tempArr[0] = jsonData[index][0]+' : '+jsonData[index][1]; // No I18N
            tempArr[1] = jsonData[index][2];
            widParams.graphData.push(tempArr);

            var percentVal = jsonData[index][2];
            jsonData[index].splice(1,0,percentVal,percentVal+' %'); // No I18N
        }
    }
    widParams.gridData = jsonData;
    return widParams;
}

function nfa_getPieChartObject(gparams) {
	var chartObj = {
		id:gparams.id,
		type:"pie", //NO I18N
		subType:"nfaSchedulePie", //NO I18N
		jsonData:gparams.data,
		height:300,
		margin:25,
		columns:{datatype_1:"ordinal",columnname_1:"",columnname_4:""}, //NO I18N
		tooltip:[0,3],
		legend:{enabled:false},
		noDataHandler:{text:Ember.I18n.t("webclient.common.nodata")} //NO I18N
	}
	return chartObj;
}

function nfa_drawSnapPDFPieChart(snapId,widParams) {
    var $contentdiv = $("<div class='content graphWidget'></div>");
    widParams.widgetElement.append($contentdiv);
    if(widParams.title != undefined) {
        var $headerDiv = $('<div><header class="widHeader"><h2>'+htmlEncode(widParams.title)+'</h2></header></div>'); //NO I18N
        $contentdiv.append($headerDiv);
    }
    var $grapDiv = $('<div id="perfGraph1'+htmlEncode(snapId)+'" style="padding-top:44px;"></div>');
    $contentdiv.append($grapDiv);

    $tblDiv = $("<div class='opm_jqGridUI nfaPieTbl'><table class='ut ut-Grid' id='opm_grapTbl"+htmlEncode(snapId)+"'></table></div>");
    $contentdiv.append($tblDiv);

    var chartObj = {
        id:"perfGraph1"+snapId, //No I18N
        type:'pie', //No I18N
        subType:"simplePie", //No I18N
        customClass:"opm_pie", //No I18N
        jsonData: widParams.graphData,
        height:350,
        margin: 30,
        columns:{
            datatype_1:'ordinal',  //No I18N
            datatype_2:'numeric',  //No I18N
            columnname_1:'', //No I18N
            columnname_2:'',  //No I18N
            suffix:"%"  //No I18N
        },
        legend: {
            colors:widParams.colorArray,
            enabled: false
        },
        pie:{innerLabel:true}
    }
    var arraObj={ placeholder:[],chartobj:[] }
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push("perfGraph1"+snapId); //No I18N
    zChart(arraObj);

    var colNamesList = widParams.gridDetails.colNamesList;
    var colModelList = widParams.gridDetails.colModelList;
    validateGridColumnDetails(colModelList,colNamesList);

    nfa_loadPDFJQgridWithData("#opm_grapTbl"+snapId,widParams.gridData,colNamesList,colModelList,"","","",""); //NO I18N
	if(widParams.gridData.length) {
		$('#opm_grapTbl'+snapId).setGridParam({sortname:'3', sortorder: 'desc'}).trigger('reloadGrid'); //No I18N
	}
}

function nfa_drawPDFGraphTableReport(snapId,widParams,graphData,tblObj) {
    var $contentdiv = $("<div class='content graphWidget'></div>");
    widParams.widgetElement.append($contentdiv);

    if(widParams.title != undefined) {
        var $headerDiv = $('<div><header class="widHeader"><h2 class="timeInfo">'+htmlEncode(widParams.title)+'</h2></header></div>'); //NO I18N
        $contentdiv.append($headerDiv);
    }
    var $graphs = $("<div class='outletSubDiv'><div id='perfGraph"+htmlEncode(snapId)+"' class='perfGraph'></div></div>");
    $contentdiv.append($graphs);

	graphData.id = "perfGraph"+snapId; //No I18N
	graphData.grapPlotType = (["area","bar","line","scatter"].contains(graphData.grapPlotType))?graphData.grapPlotType:"area"; //NO I18N
	graphData.timePeriod = OPMClient.FWAGlobalDataController.timePeriod;

	if(graphData.data!==undefined && graphData.data.length!==0) {
		if(graphData.tpAnalysis) {
			var graphDiv = "perfGraph"+htmlEncode(snapId); //NO I18N
			$("#"+graphDiv).width("98%").height("350px"); //NO I18N
			nfa_loadTPAnalysisGraph("perfGraph"+htmlEncode(snapId), graphData.data, graphData.yAxis); //NO I18N
		}else {
			nfa_loadPDFGraphs(graphData);
		}
	}

    if(graphData.infoMsg !== undefined) {
        var tbleMsgDiv = $("<div><div class='trafficTbleMsgDiv'>"+htmlEncode(graphData.infoMsg)+"</div></div>"); //No I18N
        $contentdiv.append(tbleMsgDiv);
    }

    if(tblObj !== undefined) {
        var gridClassName = (tblObj.gridClassName)?tblObj.gridClassName:"opm_jqGridUI"; //No I18N
        $tblDiv = $("<div class='"+htmlEncode(gridClassName)+"'><table class='ut ut-Grid' id='opm_grapTbl"+htmlEncode(snapId)+"'></table></div>"); //No I18N
        $contentdiv.append($tblDiv);
        
        tblObj.defaultOptions = (tblObj.defaultOptions)?tblObj.defaultOptions:""; //NO I18N
        var hiddenCollArr = ["indvTrafficGraph"]; //NO I18N
        setHiddenColumn(tblObj.gridDetails.colModelList,hiddenCollArr,true);
        validateGridColumnDetails(tblObj.gridDetails.colModelList,tblObj.gridDetails.colNamesList);
        nfa_loadPDFJQgridWithData("#opm_grapTbl"+snapId,tblObj.data,tblObj.gridDetails.colNamesList,tblObj.gridDetails.colModelList,"","","",tblObj.defaultOptions); //No I18N
    }
}

function nfa_getSnapLineGraphReport(snapId,jsonData,reqParams,snapDetails,widgetElement) {
    var graphParams = {};
    graphParams.data = (jsonData.graphData !== undefined)?jsonData.graphData :((jsonData.GraphData !== undefined) ? jsonData.GraphData : ((jsonData.devTraffic !== undefined)?jsonData.devTraffic:jsonData.dataset));
    if(graphParams.data == null || graphParams.data == undefined || graphParams.data.length <= 0) {
        return;
    }

    var snapshotData = snapDetails.snapshotData;
    var $contentdiv = $("<div class='content graphWidget'></div>");
    widgetElement.append($contentdiv);

    var $graphs = $("<div class='outletSubDiv'><div id='perfGraph"+htmlEncode(snapId)+"' class='perfGraph'></div></div>");
    $contentdiv.append($graphs);

    var yAxis = (jsonData.YAxis)?jsonData.YAxis:((jsonData.yAxis)?jsonData.yAxis:jsonData.yaxis);
    graphParams.id = 'perfGraph'+snapId; //No I18N
    graphParams.grapPlotType = (reqParams.grapPlotType == undefined)?'area':reqParams.grapPlotType; //No I18N
    graphParams.timePeriod = OPMClient.FWAGlobalDataController.timePeriod;
    graphParams.yAxis = (snapDetails.name === "nfa.widget.flowDetails") ? yAxis : nfa_getYAxisString(yAxis); //NO I18N
        
    if(jsonData.granularity !== undefined) {
        graphParams.graphTitle = jsonData.granularity;
    }else if(jsonData.flowGranularity !== undefined){
        graphParams.graphTitle = jsonData.flowGranularity;
    }
    if(["opm.interface.traffic", "nfa.cloudInterface.traffic","wlc.apmacsnap.traffic"].indexOf(snapDetails.name) !== -1) { //No I18N
        if(jsonData.Data.trafficdata !== undefined) {
            graphParams.yAxisThresholdArray = nfa_getTrafficThreshold(jsonData);
            graphParams.yAxisThresholdText=jsonData.thresholdText;
        }
        if(reqParams.isNFGInterface){
            graphParams.data = [graphParams.data[0]];
            jsonData.Data.trafficdata = [jsonData.Data.trafficdata[0]];
        }
    }
    nfa_loadPDFGraphs(graphParams);
    if(snapDetails.snapshotData.graphTableData!==undefined) {
        nfa_drawNFAGraphSubTable(snapId,jsonData,snapDetails,$contentdiv);
    }
}

function nfa_drawNFAGraphSubTable(snapId,jsonData,snapDetails,$contentdiv) {
    var gridID = 'opm_grapTbl'+snapId; //No I18N
    var gridData = [];
    var colModelList = snapDetails.snapshotData.graphTableData.colModelList;
    var colNamesList = snapDetails.snapshotData.graphTableData.colNamesList;
    var defaultOptions = {};
    var gridClassName = "opm_jqGridUI"; //No I18N
    if(snapDetails.type == "DeviceTraffic") { //No I18N
        if(snapDetails.name === "nfa.widget.flowDetails"){ //NO I18N
            var tableDataArr;
            if(jsonData.averageReceivedFlow !== undefined){
                tableDataArr = [jsonData.averageReceivedFlow, jsonData.lastReceivedFlow];
            }else{
                tableDataArr = [jsonData.averageDroppedFlow, jsonData.lastDroppedFlow];
                colNamesList = ["nfa.average.droppedFlow", "nfa.last.droppedFlow"]; //NO I18N
            }
            gridData.push(tableDataArr);
        }else{
            gridData.push([jsonData.max,jsonData.avgSpeed,jsonData.volume]);
        }
    }else {
        gridClassName += " groupHeading"; //NO I18N
        if(jsonData.spdString) {
            var tbleMsgDiv = $("<div><div class='trafficTbleMsgDiv'>"+htmlEncode(jsonData.spdString)+"</div></div>"); //NO I18N
            $contentdiv.append(tbleMsgDiv);
        }
        if(snapDetails.name==="NFA.interface.MCasttraffic") { //NO I18N
            gridData = jsonData.trafficSummaryData;
        }else if(["opm.interface.traffic", "nfa.cloudInterface.traffic"].indexOf(snapDetails.name)!==-1) { //NO I18N
            gridData = jsonData.Data.trafficdata;
            var tempObj = nfa_getDevTrafficTblDetails(colNamesList,colModelList,jsonData.Data.showGranularity,jsonData.Data.granularity);
            colNamesList = tempObj.colNamesList;
            colModelList = tempObj.colModelList;
            colNamesList[8] = window.OPM.percentileInformation ? Ember.I18n.t("nfa.report.nthPercentail",{n:window.OPM.nfaPercentile}) : "" ; //NO I18N
	    	colModelList[8].hidden = window.OPM.percentileInformation ? false : true ;
			defaultOptions.gridCallBack = tempObj.gridCallBackFunc;
        }else if(jsonData.Data.trafficdata !== undefined) {
			gridData = jsonData.Data.trafficdata;
		}
    }
    $tblDiv = $("<div class='"+htmlEncode(gridClassName)+"'><table class='ut ut-Grid' id='"+htmlEncode(gridID)+"'></table></div>"); //NO I18N
    $contentdiv.append($tblDiv);
    validateGridColumnDetails(colModelList,colNamesList);
    nfa_loadPDFJQgridWithData('#'+gridID,gridData,colNamesList,colModelList,'','','',defaultOptions); //NO I18N
}

function nfa_loadPDFGraphs(graphData) {
	var timeFormat = (OPMClient.InventoryDateTimeNFAController.get(graphData.timePeriod)!==undefined)?OPMClient.InventoryDateTimeNFAController.get(graphData.timePeriod):"hourly"; //NO I18N
	var chartObj = {
		id : graphData.id,
		type : graphData.grapPlotType,
		jsonData : graphData.data,
		series : "multi", //NO I18N
		height : 350,
		columns:{
			datatype_1: graphData.datatype_1 ? graphData.datatype_1 : "time", //NO I18N
			datatype_2:"numeric", //NO I18N
			columnname_1:"", //Ember.I18n.t('NFAWidget.Time'), //NO I18N
			columnname_2:"", //Ember.I18n.t('NFAWidget.trfc'), //NO I18N
			columnname_3:"", //Ember.I18n.t('webclient.widget.value'), //NO I18N
			timeFormat:OPMClient.InventoryDateTimeLegends.get(timeFormat)
		},
		legend: {
			colorBox: {shape:"circle",strokeOpacity:1}, //NO I18N
			fontFamily:"'LatoRegular'", //NO I18N
			fontSize:14,
			hAlign:"center", //NO I18N
			vAlign:"bottom" //NO I18N
		},
		axes: {
			xaxis: {
				label:{text:graphData.xAxis ? graphData.xAxis : Ember.I18n.t("NFAWidget.Time")}, //NO I18N
				grid:{show:true,color:"#ececec",style:"shortdashdotdot"}, //NO I18N
				tickmark:{color:"grey",size:4,strokeWidth:4} //NO I18N
			},
			yaxis:[{
				label:{text:graphData.yAxis},
				grid:{show:true,color:"#ececec",style:"shortdashdotdot"} //NO I18N
			}]
		},
		noDataHandler:{text: Ember.I18n.t("webclient.common.nodata")}, //NO I18N
        chart:{stacked:false},
        isNFATimeSeriesGraph: graphData.isNFATimeSeriesGraph !== undefined ? graphData.isNFATimeSeriesGraph : true,
        isFromExportPDF:true
    }
    if(graphData.legendColors!==undefined) {
        chartObj.legend.colors = graphData.legendColors;
    }
    if(graphData.graphTitle!==undefined) {
        chartObj.canvas={
            title:{text:graphData.graphTitle,show:true,hAlign:"center",vAlign:"top"} //NO I18N
        }
    }
	if(graphData.legend) {
		chartObj.legend = graphData.legend;
	}
	if(graphData.plot) {
		chartObj.plot = graphData.plot;
	}
    if(graphData.yAxisThresholdArray !== undefined) {
        chartObj = nfa_addThresholdLineInfo(chartObj,graphData.yAxisThresholdArray,graphData.yAxisThresholdText,graphData.isAnomaly);
    }
    var arraObj={placeholder:[],chartobj:[]}
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push(graphData.id);
    zChart(arraObj);
}

function nfa_getSnapGridReport(snapId,jsonData,reqParams,snapDetails,widgetElement) {
    var colModelNameVal = 0;
    var hiddenCollArr = ['indvTrafficGraph','modifyDNS','nameWithPort']; //No I18N
    if((snapDetails.name == 'NFA.interface.Art' && ['client','server'].contains(reqParams.GraphType)) || ["nfa.wlcsnap.clients", "nfa.wlcsnap.ssid", "nfa.wlcsnap.apmac", "nfa.wlcsnap.qos", "wlc.apmacsnap.clients", "wlc.apmacsnap.ssid", "wlc.apmacsnap.qos", "wlc.ssidgroup.accesspoint"].contains(snapDetails.name)) { //No I18N
        colModelNameVal = 1;
    }
    switch(colModelNameVal) {
        case 0 : colModelList = snapDetails.snapshotData.colModelList;colNamesList = snapDetails.snapshotData.colNamesList;break;
        case 1 : colModelList = snapDetails.snapshotData.colModelList1;colNamesList = snapDetails.snapshotData.colNamesList1;break;
        case 2 : colModelList = snapDetails.snapshotData.colModelList2;colNamesList = snapDetails.snapshotData.colNamesList2;break;
    }
    if(colModelList == undefined){
        return;
    }
    var defaultOptions = {minRowsPerPage:-1/*,pagination:false,noPaginationShowAll:true*/};
    var gridClassName = "opm_jqGridUI nfaPDF"; //NO I18N
    if(snapDetails.name == 'NFA.interface.MNettraffic') {
        gridClassName += " groupHeading"; //NO I18N
        var gridObj = nfa_getMedianetGridDetails(reqParams.GroupBy,reqParams.SortBy);
        colNamesList = gridObj.colNamesList;
        colModelList = gridObj.colModelList;
        defaultOptions.gridCallBack = function() {
            $("#opm_DeviceSnapList"+snapId).jqGrid('setGroupHeaders',gridObj.groupHeaders);
            $('#gview_opm_DeviceSnapList'+snapId+' > div.ui-state-default > div > table > thead > tr.jqg-first-row-header').remove();
        }
    } 
    if(snapDetails.name == 'dpi.application.conv') { //No I18N
        hiddenCollArr.push((reqParams.isLayer7 == 'true')?'11':'2'); //No I18N
    }else if(snapDetails.name === 'dpi.srcdst.conv')  { //No I18N
        hiddenCollArr.push((reqParams.isFrom == 'SrcAddr')?'0':'1'); //No I18N
    }else if(snapDetails.name==="opm.interface.topconv" || snapDetails.name==="nfa.meraki.conv")  { //No I18N
        if(!jsonData.fromRaw) {
            hiddenCollArr.push("dstport"); //NO I18N
            hiddenCollArr.push("AvgSpd"); //NO I18N
            colNamesList[3] = Ember.I18n.t("opu.views.PORT"); //NO I18N
        }
    }else if(reqParams.isNFGInterface){
        hiddenCollArr.push("OUT"); //NO I18N
    }else if(snapDetails.name === "nfa.cloudUser.Conversation"){ //NO I18N
		if(reqParams.isCloud === "true"){ //NO I18N
			colNamesList[0] = (reqParams.Data === "IN" ? "NFAWidget.Dst" : "NFAWidget.Src"); //NO I18N
		}else{
			colNamesList[0] = (reqParams.Data === "IN" ? "NFAWidget.Src" : "NFAWidget.Dst"); //NO I18N
		}
	}

    var gridData = jsonData;
    if(jsonData.gridData != null) {
        gridData = jsonData.gridData;
    }else if(jsonData.topConv != null) {
        gridData = jsonData.topConv;
    }else if(jsonData.TrafficData != null) {
        gridData = jsonData.TrafficData;
    }else if(jsonData.result != null) {
        gridData = jsonData.result; 
    }else if(jsonData.Data != null) {
        gridData = jsonData.Data; 
    }else if(jsonData.tableData != null) {
        gridData = jsonData.tableData; 
    }else if(jsonData.Offenders != null) {
        gridData = jsonData.Offenders; 
    }else if(jsonData.Targets != null) {
        gridData = jsonData.Targets; 
    }else if(jsonData.data != null) {
        gridData = jsonData.data; 
    }else if(jsonData.resultdata != null) {
        gridData = jsonData.resultdata; 
    }else if(jsonData.resultData != null) {
        gridData = jsonData.resultData; 
    }else if(jsonData.resultVector != null) {
        gridData = jsonData.resultVector; 
    }else if(jsonData.rows != null) {
        gridData = jsonData.rows; 
    }else if(jsonData.eData != null) {
        gridData = jsonData.eData;
    }else if(jsonData.ConnList != null) {
        gridData = jsonData.ConnList;
    }else if(jsonData.RouterField != null) {
        gridData = jsonData.RouterField;
    }
    
    var $contentdiv = $("<div class='content'></div>");
    widgetElement.append($contentdiv);
    
    var $tblDiv = $("<div class='"+htmlEncode(gridClassName)+"'><table class='ut ut-Grid' id='opm_DeviceSnapList"+htmlEncode(snapId)+"'></table></div>");
    $contentdiv.append($tblDiv);

    setHiddenColumn(colModelList,hiddenCollArr,true);
    validateGridColumnDetails(colModelList,colNamesList);
    nfa_loadPDFJQgridWithData("#opm_DeviceSnapList"+snapId,gridData,colNamesList,colModelList,"","","",defaultOptions); //No I18N
    
//    if(['opm.interface.traffic','wlc.apmacsnap.traffic'].contains(snapDetails.name)) {
//        $('#opm_DeviceSnapList'+snapId).setGridParam({sortname:'Time', sortorder: 'desc'}).trigger('reloadGrid');
//    }
}

function nfa_getPDFSubgrid(snapId,jsonData,reqParams,snapDetails,widgetElement) {

    var colNamesList = snapDetails.snapshotData.colNamesList;
    var colModelList = snapDetails.snapshotData.colModelList;

    if(snapDetails.name !== "nfa.widget.geolocation" && reqParams.isLocation !== undefined && reqParams.isLocation == 'true') {
        colNamesList = snapDetails.snapshotData.colNamesList1;
        colModelList = snapDetails.snapshotData.colModelList1;
    }

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
    
    var defaultOptions = {};
    defaultOptions.colNamesList1 = snapDetails.snapshotData.subgrid.colNamesList;
    defaultOptions.colModelList1 = snapDetails.snapshotData.subgrid.colModelList;
    defaultOptions.subGridFunction = snapDetails.snapshotData.subgrid.subGridFunction;
    defaultOptions.Data = (jsonData.loc !== undefined)?jsonData.loc.location:(jsonData.result!== undefined)?jsonData.result :gridData;
    defaultOptions.subGrid = true;
    defaultOptions.snapId = snapId;
    
    $contentdiv = $("<div class='content'></div>"); //No I18N
    widgetElement.append($contentdiv);
    if(jsonData.contentHeaderName !== undefined){
        var $contentHeader = $('<div><header class="widHeader"><h2>'+htmlEncode(jsonData.contentHeaderName)+'</h2></header></div>'); //NO I18N
        $contentdiv.append($contentHeader);
    }
    var $tablediv = $("<div class='opm_jqGridUI nfaPDF'><table id='opm_DeviceSnapList"+htmlEncode(snapId)+"'></table></div>"); //No I18N
    $contentdiv.append($tablediv);

    setHiddenColumn(snapDetails.snapshotData.colModelList,['indvTrafficGraph'],true); //No I18N
    setHiddenColumn(snapDetails.snapshotData.subgrid.colModelList,['indvTrafficGraph'],true); //No I18N
    validateGridColumnDetails(colModelList,colNamesList);
    validateGridColumnDetails(snapDetails.snapshotData.subgrid.colModelList,snapDetails.snapshotData.subgrid.colNamesList);
    nfa_loadPDFJQgridWithData("#opm_DeviceSnapList"+snapId,gridData,colNamesList,colModelList,"","","",defaultOptions); //No I18N
    
    setTimeout(function(){
        var rowIds = $("#opm_DeviceSnapList"+snapId).getDataIDs();
        $.each(rowIds, function (index, rowId) {
            $("#opm_DeviceSnapList"+snapId).expandSubGridRow(rowId);
        });
    },100);

    // if(snapDetails.name === 'nfa.app.topsite') { //No I18N
    //     $("#opm_DeviceSnapList"+snapId).setGridParam({sortname:'traffic', sortorder: 'desc'}).trigger('reloadGrid'); //No I18N
    // }
}

function nfa_loadPDFJQgridWithData(gridTable,jsonData,colNamesList,colModelList,captionTitle,gridNavigator,onSelectFunction,defaultOptions) 
{
    var defaultSortName = ""; //No I18N
    var defaultSortOrder = "asc"; //No I18N
    var rowNumNeeded = false;
	var minRowsPerPage = (jsonData === undefined) ? 50 : jsonData.length;
    var subGrid = false;
    var headertitles=false;
    var gridCallBack;
    if(defaultOptions!==undefined) {
        if(defaultOptions.subGrid !== undefined) {
            subGrid = defaultOptions.subGrid;
        }
        if(defaultOptions.sortName != undefined) {
            defaultSortName = defaultOptions.sortName;
        }
        if(defaultOptions.sortOrder != undefined) {
            defaultSortOrder = defaultOptions.sortOrder;
        }
        if(defaultOptions.rowNumNeeded != undefined) {
            rowNumNeeded = defaultOptions.rowNumNeeded;
        }
        if(defaultOptions.headertitles!==undefined) {
            headertitles=defaultOptions.headertitles
        }
        if(defaultOptions.gridCallBack !== undefined){
            gridCallBack=defaultOptions.gridCallBack;
        }
    }
    var grid = $(gridTable);
    var gridDivId = "#gbox_"; //No I18N
    var gridTableIdAlone = gridTable.substring(1);
    gridDivId = gridDivId+gridTableIdAlone;
    var gridDiv = $(gridDivId);

    if(gridDiv.length > 0) {
        grid.jqGrid('clearGridData'); //No I18N
        grid.jqGrid('setGridParam', { datatype: "jsonstring", datastr: jsonData}); //No I18N
        grid.trigger('reloadGrid'); //No I18N
    }else {

        var gridviewVal = false;
        grid.jqGrid({
            colNames: escapeGridColumnNames(colNamesList),
            colModel: colModelList,
            datatype: "jsonstring", //No I18N
            datastr: jsonData,
            loadOnce: true,
            prmNames:{totalrows:null},
            headertitles:headertitles,
            jsonReader: { root: function (obj) { return obj; }, repeatitems: false },
            rownumbers: rowNumNeeded,
            rowNum: minRowsPerPage,
            rownumWidth:25, //minor ui issue in number column width
            viewrecords: true,
            caption: escapeHTML(captionTitle),
            height: "auto", //No I18N
            autowidth: true,
            shrinkToFit: true,
            hidegrid: false,
            ignoreCase: true,
            sortable:true,
            subGrid:subGrid,
            sortname: defaultSortName,
            sortorder: defaultSortOrder,
            cmTemplate: {sortable:false},
            subGridRowExpanded: function(subgrid_id, row_id)
            {
                var subgrid_table_id = subgrid_id+"_t"; //No I18N
                var subgrid_table1_id = subgrid_id+"_t1"; //No I18N
                var subgrid_table2_id = subgrid_id+"_t2"; //No I18N
                var choice =defaultOptions.subGridFunction;

                $("#"+subgrid_id).addClass('opm_jqGridUI');
                var tableHtml ="<table id='"+htmlEncode(subgrid_table_id)+"'></table>";
                $("#"+subgrid_id).html(tableHtml);
                switch(choice) 
                {
                    case "nfaCbqosSubGrid":  //No I18N
                        nfa_loadPDFJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].classes, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "",defaultOptions.onselectfunction,{'snapId':defaultOptions.snapId,'policy':defaultOptions.Data[row_id-1].policy,'parentclass':defaultOptions.Data[row_id-1].parentclass}); //No I18N
                        $("#"+subgrid_table_id).addClass('ut ut-Grid'); 
                        break;
                    case "nfaGeolocationSub": //NO I18N
                    case "nfaTopSrcDstGeoLocSub":  //No I18N
                        var location = grid.jqGrid('getCell', row_id, 'Name'); //No I18N
                        if(location == 'Others') {return;} //No I18N
                        nfa_loadPDFJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[location], defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", defaultOptions.onselectfunction,{'snapId':defaultOptions.snapId}); //No I18N
                        $("#"+subgrid_table_id).addClass('ut ut-Grid'); 
                        break;

                    case "nfaTopQosSub":  //No I18N
                        var subGridData = defaultOptions.Data[row_id-1].subApp;
                        nfa_loadPDFJQgridWithData("#"+subgrid_table_id,subGridData, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",{"minRowsPerPage":subGridData.length}); //No I18N
                        defaultOptions.lastExpandedRowID = row_id;
                        $("#"+subgrid_table_id).addClass('ut ut-Grid');
                        $('#'+subgrid_table_id).setGridParam({sortname:'1',sortorder:'desc'}).trigger('reloadGrid');
                        break;

                    case "nfaFlowTemplateSub": //NO I18N
                        nfa_loadPDFJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].fieldInfo, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",""); //NO I18N
                        $("#"+subgrid_table_id).addClass('ut ut-Grid');
                        break;
                }
            },    
			loadComplete:function() {
				if($(gridTable).getGridParam("reccount")===0) { //NO I18N
					if(defaultOptions.noDataText!==undefined) {
						$(gridTable).show().text(defaultOptions.noDataText);
					}else {
						$(gridTable).show().text(Ember.I18n.t("webclient.jqgrid.no.data.found")); //NO I18N
					}
					$(gridTable).addClass("gridnodata"); //NO I18N
				}else {
					$(gridTable).removeClass("gridnodata"); //NO I18N
				}
				if(gridCallBack!==undefined && gridCallBack!==null) {
					gridCallBack(gridTableIdAlone);
				}
			}
        });
    }
}

function nfa_drawHeaderDetailsInBilling(reqParams,billPlanData) {
	if(billPlanData) {
		$("#billingInfo,#taxDetails,#capacityPlanBillHeader").show(); //NO I18N
		$("#billingTimeInfo").hide(); //NO I18N
		$("#billPlanName").text(Ember.I18n.t("webclient.nfa.billing.details")); //NO I18N
		$("#baseCostTitle").text(Ember.I18n.t("webclient.billing.basecost")); //NO I18N
		$("#baseCostValue").text(billPlanData.baseCostStr); //NO I18N
		$("#addCostTitle").text(Ember.I18n.t("webclient.reports.additionalcost")); //NO I18N
		$("#addCostValue").text(billPlanData.addCostStr); //NO I18N
		$("#dataTransTitle").text(Ember.I18n.t("webclient.nfa.billing.billedValue")); //NO I18N
		$("#dataTransValue").text(billPlanData.billedValStr); //NO I18N
		$("#usageCostTitle").text(Ember.I18n.t("webclient.nfa.billing.usageCost")); //NO I18N
		$("#usageCostValue").text(billPlanData.usageCost); //NO I18N

		billPlanData.taxList.push({taxName:Ember.I18n.t("webclient.billing.totalcost"), taxValueString:billPlanData.totalCost}); //NO I18N

		for(var i=0; i<billPlanData.taxList.length; i++) {
			$("#tax"+(i+1)).show(); //NO I18N
			$("#taxTitle"+(i+1)).text(billPlanData.taxList[i].taxName); //NO I18N
			$("#taxValue"+(i+1)).text(billPlanData.taxList[i].taxValueString); //NO I18N
		}
		$("#taxValue"+i).addClass("txt-green"); //NO I18N
	}else {
		$("#billingInfo,#taxDetails,#billingTimeInfo").show(); //NO I18N
		$("#capacityPlanBillHeader").hide(); //NO I18N

		$("#billPeriodTitle").text(Ember.I18n.t("webclient.nfa.billing.cycle")); //NO I18N
		$("#billPeriodValue").text(reqParams.billPeriodValue); //NO I18N

		if(reqParams.reportType==="billingReport"){
			$("#reportTimeTitle").text(Ember.I18n.t("nfa.reports.sch.lastreptime")); //NO I18N
		}else{
			$("#reportTimeTitle").text(Ember.I18n.t("webclient.nfa.billing.generationOn")); //NO I18N
		}
		$("#reportTimeValue").text(reqParams.reportTimeValue); //NO I18N

		$("#baseCostTitle").text(Ember.I18n.t("webclient.billing.basecost")); //NO I18N
		$("#baseCostValue").text(reqParams.baseCostValue); //NO I18N

		$("#dataTransTitle").text(reqParams.dataTransTitle); //NO I18N
		$("#dataTransValue").text(reqParams.dataTransValue); //NO I18N

		$("#addCostTitle").text(Ember.I18n.t("webclient.reports.additionalcost")); //NO I18N
		$("#addCostValue").text(reqParams.addCostValue); //NO I18N

		$("#usageCostTitle").text(Ember.I18n.t("webclient.nfa.billing.usageCost")); //NO I18N
		$("#usageCostValue").text(reqParams.usageCostValue); //NO I18N
		for(var i=1;i<=5;i++) {
			if(reqParams["taxTitle"+i]!==undefined) {
				$("#tax"+i).show(); //NO I18N
				$("#taxTitle"+i).text(reqParams["taxTitle"+i]); //NO I18N
				$("#taxValue"+i).text(reqParams["taxValue"+i]); //NO I18N
			}else {
				$("#tax"+i).show(); //NO I18N
				$("#taxTitle"+i).text(Ember.I18n.t("webclient.billing.totalcost")); //NO I18N
				$("#taxValue"+i).text(reqParams.totalCost); //NO I18N
				$("#taxValue"+i).addClass("txt-green"); //NO I18N
				break;
			}
		}
	}
}

function jqGridHTMLEncode(cellValue,options,rowdata,action) {
	return $.jgrid.htmlEncode(cellValue);
}

function nfa_getHtmlForPDF(divID,htmlString) {
	$(divID).empty();
	$(divID).html(htmlString);
}
function nfa_getGroupHeaders(groupHeaders,groupHeaderNames) {
	for(var i=0;i<groupHeaders.length;i++) {
		groupHeaders[i].titleText = "<div align='center'>"+groupHeaderNames[i]+"</div>"; //NO I18N
	}
	return groupHeaders;
}
function nfa_getTrafficTypeValue(type) {
	var typeVal=""; //NO I18N
	switch(type) {
		case "volume" 		: typeVal = Ember.I18n.t("webclient.widget.disk.volume");break; //NO I18N
		case "speed" 		: typeVal = Ember.I18n.t("webclient.map.flash.speed");break; //NO I18N
		case "percentage" 	: typeVal = Ember.I18n.t("webclient.devices.intftypes.utilization");break; //NO I18N
		case "packets" 		: typeVal = Ember.I18n.t("opu.views.PACKETS");break; //NO I18N
	}
	return typeVal;
}

function nfa_attacksAlgorithmTypeFormatter(cellvalue, options, rowObject) {
	switch(rowObject.AlgorithmId) {
		case 1: return "<i class='icon-nfa icon-source_agg mb-sm'></i>"; //NO I18N
		case 2: return "<i class='icon-nfa icon-destination_agg mb-sm'></i>"; //NO I18N
		case 5: return "<i class='icon-nfa icon-router_agg mb-sm'></i>"; //NO I18N
		case 8: return "<i class='icon-nfa icon-source_net_agg mb-sm'></i>"; //NO I18N
		case 9: return "<i class='icon-nfa icon-des_net_agg mb-sm'></i>"; //NO I18N
	}
}

function htmlEncode(value) {
	return $('<div/>').text(value).html(); //No I18N
}

function escapeHTML(string){
	if(string===undefined){
        return "";
    }else{
    var htmlEscapes = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '/': '&#x2F;'
    };
    var htmlEscaper = /[&<>"'\/]/g;
    return ('' + string).replace(htmlEscaper, function(match) {
        return htmlEscapes[match];
    });
	}
}
