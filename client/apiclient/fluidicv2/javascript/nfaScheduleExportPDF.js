var snapId = 0;
window.OPM={"isPDF":true,"pattern":"d MMM yyyy hh:mm:ss a z"};//No I18N
function nfa_drawSchedulePDF(pdfData) {
	//clearing localstorage
	localStorage.clear();
	if(pdfData !== undefined && pdfData.widData !== undefined && pdfData.contentWidth !== undefined) {
		var widData = JSON.parse(pdfData.widData);
		var contentWidth = JSON.parse(pdfData.contentWidth);

		$(function() {
			//For time series graphs
			window.OPM.userTimeZone = widData.timeZone;
			window.OPM.timeFrame = widData.timeFrame;
			$("#zchartgraph2").width(contentWidth);
			if(widData.widgetList!==undefined) {
				for(var i=0;i<widData.widgetList.length;i++) {
					var widget = widData.widgetList[i];
					switch(widget.type) {
						case "Headings"	: 	nfa_getReportHeaders(widData,widget);break; //NO I18N
						case "Grid"		: 	nfa_getGridReport(widData,widget);break; //NO I18N
						case "SubGrid"	: 	nfa_getSubGridReport(widData,widget);break; //NO I18N
						case "Graph"	: 	nfa_getTimeSeriesGraphReport(widData,widget);break; //NO I18N
						case "PairGraph": 	nfa_getPairTimeSeriesGraphReport(widData,widget);break; //NO I18N
						case "PieTable1": 	nfa_getSinglePieTableReport(widData,widget);break; //NO I18N
						case "PieTable2": 	nfa_getPairPieTableReport(widData,widget);break; //NO I18N
					}
				}
			}
			setTimeout(function() {
				window.canvasLoded = true;
			},5000);
		});
	}
}

function nfa_getReportHeaders(widData,header) {
	$("#reportTitleDiv").text(widData.reportTitle); //NO I18N
	if(widData.reportSubTitle!==undefined) {
		$("#reportSubTitleDiv").text(widData.reportSubTitle); //NO I18N
	}else {
		$("#reportSubTitleDiv").remove();
	}
	for(var i=1;i<=4;i++) {
		if(header["title"+i]!==undefined) { //NO I18N
			$(".title"+i).text(header["title"+i]); //NO I18N
			$(".value"+i).text(header["value"+i]); //NO I18N
		}else {
			$(".info"+i).remove();
		}
	}
	if(header.timeFrame!==undefined) {
		$("#timeDiv .timeFrame").show();
		$("#timeDiv .timeFrame .title").text(header.timeFrameLbl); //NO I18N
		$("#timeDiv .timeFrame .value").text(header.timeFrame); //NO I18N
	}
	if(header.startTime!==undefined && header.endTime!==undefined) {
		$("#timeDiv .startTime,#timeDiv .endTime").show();
		$("#timeDiv .startTime .title").text(header.startTimeLbl); //NO I18N
		$("#timeDiv .startTime .value").text(header.startTime); //NO I18N
		$("#timeDiv .endTime .title").text(header.endTimeLbl); //NO I18N
		$("#timeDiv .endTime .value").text(header.endTime); //NO I18N
	}
	if(header.bussHour!=="-") { //NO I18N
		$("#timeDiv .bussHour").show();
		$("#timeDiv .bussHour .title").text(header.bussHourLbl); //NO I18N
		$("#timeDiv .bussHour .value").text(header.bussHour); //NO I18N
	}
	if(header.timeZone!==undefined && header.repGenTime!==undefined) {
		$("#timeDiv .timeZone,#timeDiv .genTime").show();
		$("#timeDiv .timeZone .title").text(header.timeZoneLbl); //NO I18N
		$("#timeDiv .timeZone .value").text(header.timeZone); //NO I18N
		$("#timeDiv .genTime .title").text(header.repGenTimeLbl); //NO I18N
		$("#timeDiv .genTime .value").text(header.repGenTime); //NO I18N
	}
	$(".nfaPdfLogo").attr("src",widData.pdfLogoURL); //NO I18N
	$(".infoBoxBlue p").text(widData.privacyMsg); //NO I18N

	if(widData.deviceInfo!==undefined) {
		nfa_getSelectedDeviceInfo(widData.deviceInfo);
	}
	getCriteriaInfo(widData);
}

function nfa_getSelectedDeviceInfo(deviceInfo) {
	var devInfoStr = ""; //NO I18N
	if(deviceInfo.deviceString!==undefined) {
		for(var i=0; i<deviceInfo.deviceString.length; i++) {
			var parts = deviceInfo.deviceString[i].split("@@@"); //NO I18N
			devInfoStr += "<div class='pdfInfo__row'><strong>"+parts[0]+"</strong>:<span>"+parts[1]+"</span></div>"; //NO I18N
		}
	}
	$("#multiDevInfoDiv").html(devInfoStr); //NO I18N
}

function getCriteriaInfo(widData) {
	if(widData.criteriaList===undefined) {return;}
	var criteriaStr = "<div><h4>"+widData.criteriaListI18n+" - <span>"+widData.criteriaMatch+"</span></h4></div>"; //NO I18N
	for(var criteriaKey in widData.criteriaList) {
		var criteria = widData.criteriaList[criteriaKey];
		if(criteria.includeList.length>1) {
			criteriaStr += "<div class='pdfInfo__row'><strong>"+criteria.name+" - "+criteria.includeList.shift()+"</strong>:<span>"+criteria.includeList.toString()+"</span></div>"; //NO I18N
		}
		if(criteria.excludeList.length>1) {
			criteriaStr += "<div class='pdfInfo__row'><strong>"+criteria.name+" - "+criteria.excludeList.shift()+"</strong>:<span>"+criteria.excludeList.toString()+"</span></div>"; //NO I18N
		}
	}
	$("#criteriaInfoDiv").html(criteriaStr); //NO I18N
}

function nfa_getGridReport(widData,widget) {
	var widParams = (widget.snapshotData)?widget.snapshotData:widData.snapshotData;
	widParams.title = widget.title;
	widParams.gridData = widget.data;
	widParams.gridClassName = widget.gridClassName;

	if(widParams.groupHeaders!==undefined) {
		for(var i=0;i<widParams.groupHeaders.length;i++) {
			widParams.groupHeaders[i].titleText = "<div align='center'>"+widParams.groupHeaderNames[i]+"</div>"; //NO I18N
		}
		widParams.GridGroups = widParams.groupHeaders;
	}
	nfa_drawPDFTableReport(widParams);
}

function nfa_getSubGridReport(widData,widget) {
	var widParams = (widget.snapshotData)?widget.snapshotData:widData.snapshotData;
	widParams.title = widget.title;
	widParams.gridClassName = widget.gridClassName;

	var data = widget.data;
	if(data.result!==undefined) {
		widParams.gridData = data.result;
	}else {
		widParams.gridData = data;
	}
	widParams.dOptions = widParams.subgrid;
	widParams.dOptions.gridData = (data.location!==undefined)?data.location:data;
	widParams.dOptions.subGrid = true;
	widParams.dOptions.gridCallBack = function(tblGridID) {
		setTimeout(function(){
			var rowIds = $("#"+tblGridID).getDataIDs(); //NO I18N
			$.each(rowIds,function(index,rowId) {
				$("#"+tblGridID).expandSubGridRow(rowId); //NO I18N
			});
		},100);
	};
	nfa_drawPDFTableReport(widParams);
}

function nfa_getTimeSeriesGraphHtmlDiv(snapId,title) {
	var $contentdiv = $("<div id='contentWidget"+snapId+"' class='content graphWidget'></div>"); //NO I18N
	$("#contentDiv").append($contentdiv);
	var htmlStr = ""; //NO I18N
	if(title!==undefined && title!=="") { //NO I18N
		htmlStr += nfa_getWidgetTitleDiv(title);
	}
	htmlStr += "<div class='outletSubDiv'><div id='nfaGraph"+snapId+"' class='perfGraph'></div></div>"; //NO I18N
	$contentdiv.append(htmlStr);
}

function nfa_getTimeSeriesGraphReport(widData,widget) {
	snapId++;
	var jsonData = widget.data?widget.data:{};
	nfa_getTimeSeriesGraphHtmlDiv(snapId,widget.title);
	if($.isEmptyObject(jsonData.graphData)) {
		return;
	}
	nfa_loadTimeSeriesGraph(widData,widget,jsonData);
}

function nfa_getPairGraphHtmlDiv(snapId,graphArray,title) {
	var htmlStr = "<div class='content graphWidget'>"; //NO I18N
	htmlStr += nfa_getWidgetTitleDiv(title);
	htmlStr += "<div class='zohoChartRow'>"; //NO I18N
	for(var i=0; i<graphArray.length; i++) {
		snapId++;
		htmlStr += "<div class='zohoChartColumn'>"; //NO I18N
		htmlStr += "<div class='outletSubDiv'><div id='nfaGraph"+snapId+"' class='perfGraph'></div></div>"; //NO I18N
		htmlStr += "</div>"; //NO I18N
	}
	htmlStr += "</div></div>"; //NO I18N
	$("#contentDiv").append(htmlStr); //NO I18N
}

function nfa_getPairTimeSeriesGraphReport(widData,widget) {
	var graphArray = (widget.data)?widget.data:[];
	nfa_getPairGraphHtmlDiv(snapId,graphArray,widget.title);
	for(var i=0; i<graphArray.length; i++) {
		snapId++;
		var jsonData = graphArray[i];
		if($.isEmptyObject(jsonData.graphData)) {
			return;
		}
		nfa_loadTimeSeriesGraph(widData,widget,jsonData);
	}
}

function nfa_loadTimeSeriesGraph(widData,widget,jsonData) {
	var graphParams = {};
	graphParams.data = jsonData.graphData;
	graphParams.id = "nfaGraph"+snapId; //NO I18N
	graphParams.graphPlotType = (widget.graphPlotType)?widget.graphPlotType:"area"; //NO I18N
	graphParams.timeFrame = window.OPM.timeFrame;
	graphParams.yAxis = jsonData.yAxis;
	graphParams.xAxis = widData.xAxis;

	if(jsonData.graphTitle!==undefined) {
		graphParams.graphTitle = jsonData.graphTitle;
	}else if(jsonData.granularity!==undefined) {
		graphParams.graphTitle = jsonData.granularity;
	}
	graphParams.yAxisThresholdArr = (jsonData.thresholdLine!==undefined)?jsonData.thresholdLine:[];
	graphParams.yAxisThresholdText = jsonData.thresholdText;
	nfa_loadPDFGraphs(graphParams);
	
	if(jsonData.trafficSummaryData!==undefined) {
		var $contentdiv = $("#contentWidget"+snapId); //NO I18N
		if(jsonData.spdString) {
			var tbleMsgDiv = $("<div><div class='trafficTbleMsgDiv'>"+jsonData.spdString+"</div></div>"); //NO I18N
			$contentdiv.append(tbleMsgDiv);
		}
		var snapshotData = (widget.snapshotData)?widget.snapshotData:widData.snapshotData;
		var colNamesList1 = jQuery.extend([],snapshotData.colNamesList1);
		var colModelList1 = jQuery.extend([],snapshotData.colModelList1);
		var gridObj = nfa_getDevTrafficTblDetails(colNamesList1,colModelList1,jsonData.showGranularity,jsonData.granularity);
		var defaultOptions = {"gridCallBack":gridObj.gridCallBackFunc}; //NO I18N

		var gridID = "nfaSummaryTable"+snapId; //NO I18N
		var $tblDiv = $("<div class='opm_jqGridUI nfaPDF groupHeading'><table id='"+gridID+"' class='ut ut-Grid'></table></div>"); //NO I18N
		$contentdiv.append($tblDiv);
		sch_validateColumnModelList(gridObj.colModelList,gridObj.colNamesList);
		nfa_loadPDFJQgridWithData("#"+gridID,jsonData.trafficSummaryData,gridObj.colNamesList,gridObj.colModelList,"","","",defaultOptions); //NO I18N
	}
	if(jsonData.speedSummaryData!==undefined) {
		var $contentdiv = $("#contentWidget"+snapId); //NO I18N
		if(jsonData.spdString) {
			var tbleMsgDiv = $("<div><div class='trafficTbleMsgDiv'>"+jsonData.spdString+"</div></div>"); //NO I18N
			$contentdiv.append(tbleMsgDiv);
		}
		var snapshotData = (widget.snapshotData)?widget.snapshotData:widData.snapshotData;
		var colNamesList1 = jQuery.extend([],snapshotData.colNamesList1);
		var colModelList1 = jQuery.extend([],snapshotData.colModelList1);

		var gridID = "nfaSummaryTable"+snapId; //NO I18N
		var $tblDiv = $("<div class='opm_jqGridUI nfaPDF groupHeading'><table id='"+gridID+"' class='ut ut-Grid'></table></div>"); //NO I18N
		$contentdiv.append($tblDiv);
		sch_validateColumnModelList(colModelList1,colNamesList1);
		nfa_loadPDFJQgridWithData("#"+gridID,jsonData.speedSummaryData,colNamesList1,colModelList1,"","","",""); //NO I18N
	}
}

function nfa_getSinglePieTableReport(widData,widget) {
	snapId++;
	nfa_getSinglePieTableHtmlDiv(widget);
	var dataArray = (widget.data)?widget.data:[];
	var widParams = (widget.snapshotData)?widget.snapshotData:widData.snapshotData;
	widParams.title = widget.title;
	widParams.gridData = dataArray;
	widParams.graphData = nfa_getPieArray(dataArray);
	nfa_getSchedulePieTable(snapId,widParams);
}

function nfa_getSinglePieTableHtmlDiv(widget) {
	var htmlStr = "<div class='content graphWidget'>"; //NO I18N
	if(widget.title!==undefined && widget.title!=="") { //NO I18N
		htmlStr += nfa_getWidgetTitleDiv(widget.title);
	}
	htmlStr += "<div id='nfaPieChart"+snapId+"' style='padding-top:44px;'></div>"; //NO I18N
	htmlStr += "<div class='opm_jqGridUI nfaPDF nfaPieTbl'><table id='nfaTable"+snapId+"'></table></div>"; //NO I18N
	htmlStr += "</div>"; //NO I18N
	$("#contentDiv").append(htmlStr); //NO I18N
}

function nfa_getPairPieTableReport(widData,widget) {
	var pieArray = (widget.data)?widget.data:[];
	nfa_getPairPieTableHtmlDiv(snapId,pieArray);
	for(var i=0; i<pieArray.length; i++) {
		var pieWidget = pieArray[i];
		var widParams = (pieWidget.snapshotData)?pieWidget.snapshotData:widData.snapshotData;
		widParams.title = pieWidget.title;
		widParams.gridData = pieWidget.data;
		widParams.graphData = nfa_getPieArray(pieWidget.data);
		nfa_getSchedulePieTable(++snapId,widParams);
	}
}

function nfa_getPairPieTableHtmlDiv(snapId,pieArray) {
	var htmlStr = "<div class='content graphWidget'>"; //NO I18N
	htmlStr += "<div class='zohoChartRow'>"; //NO I18N
	for(var i=0; i<pieArray.length; i++) {
		snapId++;
		htmlStr += "<div class='zohoChartColumn'>"; //NO I18N
		htmlStr += nfa_getWidgetTitleDiv(pieArray[i].title);
		htmlStr += "<div id='nfaPieChart"+snapId+"' style='padding-top:44px;'></div>"; //NO I18N
		htmlStr += "<div class='opm_jqGridUI nfaPDF nfaPieTbl'><table id='nfaTable"+snapId+"'></table></div>"; //NO I18N
		htmlStr += "</div>"; //NO I18N
	}
	htmlStr += "</div></div>"; //NO I18N
	$("#contentDiv").append(htmlStr); //NO I18N
}

function nfa_getPieArray(data) {
	if(data.length===0) { return data;}
	var dataArray = (data.length<=10)?data:data.slice(0,10);
	if(dataArray[dataArray.length-1][0]==="Others") { //NO I18N
		dataArray.pop();
	}
	return dataArray;
}

function nfa_getSchedulePieTable(snapId,widParams) {
	var chartObj = {
		id:"nfaPieChart"+snapId, //NO I18N
		type:"pie", //NO I18N
		subType:"nfaSchedulePie", //NO I18N
		jsonData: widParams.graphData,
		height:350,
		margin:25,
		columns:{
			datatype_1:"ordinal",  //NO I18N
			datatype_2:"numeric",  //NO I18N
			columnname_1:"", //NO I18N
			columnname_2:"",  //NO I18N
			suffix:"%"  //NO I18N
		},
		legend:{
			enabled:false
		}
	}
	var arraObj={ placeholder:[],chartobj:[] }
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push("nfaPieChart"+snapId); //NO I18N
	zChart(arraObj);

	var gridData = (widParams.gridData!==undefined)?widParams.gridData:[];
	sch_validateColumnModelList(widParams.colModelList);
	nfa_loadPDFJQgridWithData("#nfaTable"+snapId,gridData,widParams.colNamesList,widParams.colModelList); //NO I18N
}

function nfa_getWidgetTitleDiv(title) {
	return "<div><header class='widHeader'><h2>"+title+"</h2></header></div>"; //NO I18N
}

function nfa_getGridTableDiv(gridClassName,isGroupHeaders) {
	var gridClassName = (gridClassName!==undefined)?gridClassName:"opm_jqGridUI nfaPDF"; //NO I18N
	if(isGroupHeaders) {
		gridClassName += " groupHeading"; //NO I18N
	}
	return "<div class='"+gridClassName+"'><table id='nfaTable"+snapId+"' class='ut ut-Grid'></table></div>"; //NO I18N
}

function nfa_drawPDFTableReport(widParams) {
	snapId++;
	var htmlStr = "<div class='content'>"; //NO I18N
	if(widParams.title!==undefined && widParams.title!=="") { //NO I18N
		htmlStr += nfa_getWidgetTitleDiv(widParams.title);
	}
	htmlStr += nfa_getGridTableDiv(widParams.gridClassName,(widParams.GridGroups!==undefined));
	htmlStr += "</div>"; //NO I18N
	$("#contentDiv").append(htmlStr);

	var dOptions = (widParams.dOptions!==undefined)?widParams.dOptions:{snapId:snapId};
	if(widParams.GridGroups!==undefined) {
		dOptions.gridCallBack = function(tblDivID) {
			$("#"+tblDivID).jqGrid("setGroupHeaders",{ //NO I18N
				useColSpanStyle:true,
				groupHeaders:widParams.GridGroups
			});
			$("#gview_"+tblDivID+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove();
		}
	}
	var gridData = (widParams.gridData!==undefined)?widParams.gridData:[];
	sch_validateColumnModelList(widParams.colModelList);
	nfa_loadPDFJQgridWithData("#nfaTable"+snapId,gridData,widParams.colNamesList,widParams.colModelList,"","","",dOptions); //NO I18N
}

function nfa_getDevTrafficTblDetails(colNamesList,colModelList,showGranularity,granularity) {
	if(showGranularity===undefined || showGranularity) {
		setHiddenColumn(colModelList,["minHR","maxHR"],true); //NO I18N
	}else {
		var maxHeader = colNamesList[2];
		var minHeader = colNamesList[4];
		var gridCallBackFunc = function(gridTableID) {
			$("#"+gridTableID).jqGrid("setGroupHeaders", { //NO I18N
				useColSpanStyle:true,
				groupHeaders:[
					{startColumnName:"max",numberOfColumns:2,titleText:"<div align='center'>"+maxHeader+"</div>"}, //NO I18N
					{startColumnName:"min",numberOfColumns:2,titleText:"<div align='center'>"+minHeader+"</div>"} //NO I18N
				]
			});
			$("#gview_"+gridTableID+" > div.ui-state-default > div > table > thead > tr.jqg-first-row-header").remove(); //NO I18N
		}
		colNamesList[2]=colNamesList[3];
		colNamesList[3]=granularity;
		colNamesList[4]=colNamesList[5];
		colNamesList[5]=granularity;
		setHiddenColumn(colModelList,["minHR","maxHR"],false); //NO I18N
	}
	return {colNamesList:colNamesList,colModelList:colModelList,gridCallBackFunc:gridCallBackFunc};
}

function nfa_loadPDFJQgridWithData(gridTable,jsonData,colNamesList,colModelList,captionTitle,gridNavigator,onSelectFunction,defaultOptions) {
	var defaultSortName = ""; //NO I18N
	var defaultSortOrder = "asc"; //NO I18N
	var rowNumNeeded = false;
	var minRowsPerPage = jsonData.length;
	var subGrid = false;
	var headertitles=false;
	var gridCallBack;
	if(defaultOptions!==undefined) {
		if(defaultOptions.subGrid!==undefined) {
			subGrid = defaultOptions.subGrid;
		}
		if(defaultOptions.sortName!==undefined) {
			defaultSortName = defaultOptions.sortName;
		}
		if(defaultOptions.sortOrder!==undefined) {
			defaultSortOrder = defaultOptions.sortOrder;
		}
		if(defaultOptions.rowNumNeeded!==undefined) {
			rowNumNeeded = defaultOptions.rowNumNeeded;
		}
		if(defaultOptions.headertitles!==undefined) {
			headertitles=defaultOptions.headertitles
		}
		if(defaultOptions.gridCallBack!==undefined) {
			gridCallBack=defaultOptions.gridCallBack;
		}
	}
	var grid = $(gridTable);
	var gridDivId = "#gbox_"; //NO I18N
	var gridTableIdAlone = gridTable.substring(1);
	gridDivId = gridDivId+gridTableIdAlone;
	var gridDiv = $(gridDivId);


	if(gridDiv.length>0) {
		grid.jqGrid("clearGridData"); //NO I18N
		grid.jqGrid("setGridParam",{datatype:"jsonstring",datastr:jsonData}); //NO I18N
		grid.trigger("reloadGrid"); //NO I18N
	}else {
		grid.jqGrid({
			colNames: escapeGridColumnNames(colNamesList),
			colModel: colModelList,
			datatype: "jsonstring", //NO I18N
			datastr: jsonData,
			loadOnce: true,
			prmNames:{totalrows:null},
			headertitles:headertitles,
			jsonReader: {root:function(obj){return obj;},repeatitems:false},
			rownumbers: rowNumNeeded,
			rowNum: minRowsPerPage,
			rownumWidth:25,
			viewrecords: true,
			caption: escapeHTML(captionTitle),
			height: "auto", //NO I18N
			autowidth: true,
			shrinkToFit: true,
			hidegrid: false,
			ignoreCase: true,
			sortable:true,
			subGrid:subGrid,
			sortname: defaultSortName,
			sortorder: defaultSortOrder,
			onSelectAll:function(rowIds,allChecked) {
			},
			subGridRowExpanded:function(subgrid_id,row_id) {
				var subgrid_table_id = subgrid_id+"_t"; //NO I18N
				var choice =defaultOptions.subGridFunction;
				$("#"+subgrid_id).addClass("opm_jqGridUI"); //NO I18N
				var tableHtml ="<table id='"+subgrid_table_id+"'></table>"; //NO I18N
				$("#"+subgrid_id).html(tableHtml);
				switch(defaultOptions.subGridFunction) {
					case "nfaGeolocationSub": //NO I18N
						var location = grid.jqGrid("getCell",row_id,"Name"); //NO I18N
						if(location=="Others") {return;} //NO I18N
						nfa_loadPDFJQgridWithData("#"+subgrid_table_id,defaultOptions.gridData[location],defaultOptions.colNamesList,defaultOptions.colModelList,"","","",""); //NO I18N
						break;
					case "nfaCbqosSubGrid": //NO I18N
						nfa_loadPDFJQgridWithData("#"+subgrid_table_id,defaultOptions.gridData[row_id-1].classes,defaultOptions.colNamesList,defaultOptions.colModelList,"","","",""); //NO I18N
						break;
				}
			},
			afterInsertRow:function(rowId,rowData,rowElem) {
			},
			rowattr:function(rd) {
			},
			beforeSelectRow:function(rowId,rowElem) {
			},
			onSelectRow:function(id,status) {
			},
			onCellSelect:function(row,col,content,event) {
			},
			loadComplete:function() {
				if(minRowsPerPage===0 || minRowsPerPage===1) {
					if($(gridTable).getGridParam("reccount")===0 && (defaultOptions===undefined || defaultOptions.disableNoDataText!==true)) {
						if(defaultOptions != undefined && defaultOptions.noDataText!==undefined){
							$(gridTable).show().text(defaultOptions.noDataText);
						}else{
							$(gridTable).show().text("No Data"); //NO I18N
						}
						$(gridTable).addClass("gridnodata"); //NO I18N
					}
				}
				if(gridCallBack!==undefined && gridCallBack!==null) {
					gridCallBack(gridTableIdAlone);
				}
			}
		});
	}
}

function setHiddenColumn(colModel,colNames,status) {
	for(var i=0;i<colModel.length;i++) {
		if(colNames.indexOf(colModel[i].name)!==-1) {
			colModel[i].hidden = status;
		}
	}
}

function jqGridHTMLEncode(cellValue,options,rowdata,action) {
	return $.jgrid.htmlEncode(cellValue);
}

function sch_validateColumnModelList(colModelList) {
	if(colModelList===null) {
		return;
	}
	for(var i=0;i<colModelList.length;i++) {
		try {
			if(colModelList[i].formatter!==null && colModelList[i].formatter!=="") { //NO I18N
				var tmpFunc = new Function('return '+colModelList[i].formatter); //NO I18N
				colModelList[i].formatter = tmpFunc();
			}
			if(colModelList[i].sorttype!==null && colModelList[i].sorttype!=="") { //NO I18N
				var tmpFunc = new Function('return '+colModelList[i].sorttype); //NO I18N
				colModelList[i].sorttype = tmpFunc();
			}
			if(colModelList[i].hidden!==null && colModelList[i].hidden!=="") { //NO I18N
				colModelList[i].hidden = Boolean(colModelList[i].hidden);
			}
		}catch(e) {
			// ignore formatter undefined exceptions as of now. Remove once
			// finalized
		}
	}
	return colModelList;
}

function setNFAAvailBgr(cellValue,options,rowdata,action) {
	if(cellValue!==undefined) { //NO I18N
		var color = ""; //NO I18N
		var value = parseInt(cellValue);
		if(value>0 && value<=25) {
			color = "ut-row severity_5"; //NO I18N
		}else if(value>25 && value<=50) {
			color = "ut-row severity_3"; //NO I18N
		}else if(value>50 && value<=75) {
			color = "ut-row severity_2"; //NO I18N
		}else {
			color = "ut-row severity_1"; //NO I18N
		}
		return '<div class="right"><div class="'+color+'" data-value="'+value+'" style="width:'+value+'%;"><span class="pointer">'+value+'%</span></div></div>'; //NO I18N
	}
}

function sch_getPieTableColorBar(cellValue,options,rowdata,action) {
	return (options.rowId>10)?"":"<div class='nfaDataStatus' style='background:"+fluidicv2[options.rowId-1]+"'></div>"; //NO I18N
}

function nfa_loadPDFGraphs(graphData) {
	var chartObj = {
		id: graphData.id,
		type: graphData.graphPlotType,
		jsonData: graphData.data,
		series:"multi", //NO I18N
		height:350,
		columns: {
			datatype_1:"time", //NO I18N
			datatype_2:"numeric", //NO I18N
			columnname_1:"Time", //NO I18N
			columnname_2:"Traffic", //NO I18N
			columnname_3:"Value", //NO I18N
			timeFormat:nfa_getTimeFormat(graphData.timeFrame.toLowerCase())
		},
		legend: {
			colorBox: {
				shape: "circle", //NO I18N
				strokeOpacity: 1
			},
			fontFamily: "'LatoRegular'", //NO I18N
			fontSize: 14,
			hAlign: "center", //NO I18N
			vAlign: "bottom" //NO I18N
		},
		axes:{
			rotated:false,
			xaxis: {
				label:{
					text:graphData.xAxis
				}
			},
			yaxis:[{
				label:{
					text:graphData.yAxis
				}
			}]
		},
		noDataHandler: {
			text:graphData.noDataText
		},
		chart: {
			stacked:false
		},
		isNFATimeSeriesGraph:true,
		isFromSchedulePDF:true
	};
	if(graphData.graphTitle != undefined) {
		chartObj.canvas = {
			title:{
				text: graphData.graphTitle,
				show: true,
				hAlign: "center", //NO I18N
				vAlign: "top" //NO I18N
			}
		}
	}
	if(graphData.yAxisThresholdArr !== undefined) {
		chartObj = nfa_addThresholdLineInfo(chartObj,graphData.yAxisThresholdArr,graphData.yAxisThresholdText);
	}
	var arraObj={placeholder:[],chartobj:[]};
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(graphData.id);
	zChart(arraObj);
}

function nfa_getTimeFormat(timeFormat) {
	var timeFormats = {
		"yesterday"	: "onehour", //NO I18N
		"15minute"	: "onehour", //NO I18N
		"30minute"	: "onehour", //NO I18N
		"lasthour"	: "onehour", //NO I18N
		"hourly"	: "onehour", //NO I18N
		"6hour"		: "onehour", //NO I18N
		"today"		: "onehour", //NO I18N
		"daily"		: "onehour", //NO I18N
		"24hour"	: "onehour", //NO I18N
		"7days"		: "monthly", //NO I18N
		"weekly"	: "monthly", //NO I18N
		"preweek"	: "monthly", //NO I18N
		"prevweek"	: "monthly", //NO I18N
		"30days"	: "monthly", //NO I18N
		"monthly"	: "monthly", //NO I18N
		"prevmonth"	: "monthly", //NO I18N
		"quarterly"	: "quarterly", //NO I18N
		"lastquarter": "quarterly", //NO I18N
		"custom"	: "custom" //NO I18N
	}
	return timeFormats[timeFormat];
}

function nfa_addThresholdLineInfo(chartobj,yAxisThresholdArr,yAxisThresholdText) {
	chartobj.axes.yaxis[0].threshold = {
		"line": { //NO I18N
			"show": true, //NO I18N
			"values": yAxisThresholdArr, //NO I18N
			"strokeWidth": 1, //NO I18N
			"color": ["red","#a347a2"], //NO I18N
			"label": { //NO I18N
				"text": yAxisThresholdText, //NO I18N
				"hAlign": ["left","right"], //NO I18N
				"fontColor": "#000000", //NO I18N
				"fontSize":12, //NO I18N
				"font-family": "LatoRegular" //NO I18N
			}
		}
	};
	return chartobj;
}
function escapeGridColumnNames(colNamesList)
{
    var formatterColumnNames = [];
	if(colNamesList!==undefined)
	{
        formatterColumnNames = $.extend(true,[],colNamesList);
        for(var i=0;i<formatterColumnNames.length;i++)
		{
            formatterColumnNames[i] = escapeHTML(formatterColumnNames[i]);
		}			
	}
    return formatterColumnNames;
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
};
