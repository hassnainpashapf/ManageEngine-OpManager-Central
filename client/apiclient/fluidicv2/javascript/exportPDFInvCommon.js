//$Id$
var nfaPieColors = ["#04C36B", "#3A92E9", "#FDC33A", "#D65587", "#FC7C63", "#51A5A9", "#BFBFBF", "#91CD6A", "#BE9B89", "#7D8DB0", "#B68E2E", "#C6D5B0", "#D1ACCE", "#E0AE60", "#5CD29F", "#716398", "#AD8686", "#FF99A8", "#A0C0C0", "#2D7094", "#553D4E", "#B2449D", "#FED577", "#D3D159", "#AAAAAA", "#7ED9D9", "#F7A26D", "#8ABFA2", "#767676", "#E36068", "#A3AFC7"]; //No I18n

function validateGridColumnDetails(colModelList, colNamesList) {
	if (colModelList == null) {
		return;
	}
	for (var i = 0; i < colModelList.length; i++) {
		try {
			if (colNamesList[i] != "") {
				var i18str = Ember.I18n.t(colNamesList[i], this);
				colNamesList[i] = (i18str.indexOf("Missing translation") != -1) ? colNamesList[i] : i18str;
			}
			if (colModelList[i].formatter != null && colModelList[i].formatter != "") {
				var tmpFunc = new Function('return ' + colModelList[i].formatter);
				colModelList[i].formatter = tmpFunc();
			}
			if (colModelList[i].datefmt != null && colModelList[i].datefmt === "NFA_getJQGridDateFormat") {
				colModelList[i].datefmt = NFA_getJQGridDateFormat();
			}
			if (colModelList[i].sorttype != null && colModelList[i].sorttype != "") {
				var sorttypeVal = colModelList[i].sorttype;
				if (sorttypeVal === 'int' || sorttypeVal === 'integer' || sorttypeVal === 'number') {
					colModelList[i].sorttype = opm_customSortType;
				} else if (sorttypeVal !== 'text' && sorttypeVal !== 'float' && sorttypeVal !== 'date' && sorttypeVal !== 'currency') { //NO I18N
					var tmpFunc = new Function('return ' + sorttypeVal);
					colModelList[i].sorttype = tmpFunc();
				}
			}
		} catch (e) {
			// ignore formatter undefined exceptions as of now. Remove once
			// finalized
		}
	}
	var gridObj = {};
	gridObj.colModelList = colModelList;
	gridObj.colNamesList = colNamesList;
	return gridObj;
}
function opm_createDiv(parentElem,childDivId)
{
	if (parentElem != undefined)
	{
		var childDiv = document.createElement("div");//No I18N
		childDiv.setAttribute("id",childDivId);
		parentElem.appendChild(childDiv);
	}
}
function getBVFormattedTimeFrame(timeVal){
	var timeObj={};
	timeObj.Hrs=timeVal.slice(0,2);
	timeObj.Mins=timeVal.slice(2,4);
	timeObj.timeStr=timeObj.Hrs+':'+timeObj.Mins;
	return timeObj;
}
function setHiddenColumn(colModel,colNames,status) {
	for(var i=0;i<colModel.length;i++) {
		if(colModel[i] && colNames.contains(colModel[i].name)) {
			colModel[i].hidden = status;
			colModel[i].hidedlg = status;
		}
	}
}
function nfaDeviceRepFormatter(cellValue, options, rowdata, action) {
	return '<div class="nfaDataStatus" style="background:'+nfaPieColors[options.rowId-1]+'"></div>';
}
function nfaReportsClrCodeFormatter(cellValue, options, rowdata, action) {
	return '<div class="nfaDataStatus" style="background:'+fluidicv2[options.rowId-1]+'"></div>';
}
//var nfaDataStatusGridColor=['','#04C36B','#3A92E9','#FDC33A','#D65587','#FC7C63','#51A5A9','#BFBFBF','#91CD6A','#BE9B89','#7D8DB0','#B68E2E'];
function appPercentageFormatter(cellValue, options, rowdata, action)
{
	cellValue = htmlEncode(cellValue);
	var style = "";
	if(rowdata != null && rowdata.colorBar != null && rowdata.colorBar != '') {
		style="background:"+rowdata.colorBar+";";//No I18N
	}
	return '<div class="right dataStatus"><div class="ut-row dataStatus-'+Math.ceil(cellValue/20)+'" data-value="'+cellValue+'" style="'+style+'width:'+((cellValue>100)?100:cellValue)+'%;"><span>'+cellValue+'%</span></div></div>';

};
function ncmAppPercentageFormatter(cellValue, options, rowdata, action)
{
	var style = "";
	if(rowdata != null && rowdata.colorBar != null && rowdata.colorBar != '') {
		style="background:"+rowdata.colorBar+";";//No I18N
	}
	return '<div class="right dataStatus"><div class="ut-row dataStatus-'+Math.ceil(cellValue/20)+'" data-value="'+cellValue+'" style="'+style+'width:'+((cellValue>100)?100:cellValue)+'%;"></div></div>';

};
function setNFAAvailBgr(cellValue, options, rowdata, action)
{
	if(cellValue != undefined)
	{
		var availability = parseInt(cellValue);
		if(availability>0 && availability <= 25) {
		var color = "ut-row severity_5"; //No I18N
		} else if(availability > 25 && availability<=50) {
			var color = "ut-row severity_3"; //No I18N
		} else if(availability > 50 && availability<=75) {
			var color = "ut-row severity_2"; //No I18N
		} else {
			var color = "ut-row severity_1"; //No I18N
		}
		return '<div class="right"><div class="'+color+'" data-value="'+availability+'" style="width: '+availability+'%;"><span class="pointer">'+availability+'%</span></div></div>'; //No I18n
	}
}
function nfa_IPV4Sorting(cell) {
	var ipBlocks = cell.split('.');
	for(var i=0;i<ipBlocks.length;i++) {
		ipBlocks[i] = ("000" + ipBlocks[i]).slice(-3);
	}
	return ipBlocks.join('.');
}
function opm_checkIfAValIsValid(val,type)
{
	if (type == "string")
	{
		if (val != undefined && val != null && val != "null" && val != "")
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else if (type == "array")
	{
		if (val != undefined && val != null && val.length != undefined && val.length != 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else if (type == "json")
	{
		if (val != undefined && val != null && val != 'null' && val != "")
		{
			var count = Object.keys(val).length;
			if (count == 0)
			{
				return false;
			}
			else
			{
				return true;
			}
		}
		else
		{
			return false;
		}
	}
	else if (type == "includeEmptyJson")
	{
		if (val != undefined && val != null && val != 'null' && val != "")
		{

				return true;
		}
		else
		{
			return false;
		}
	}
	else
	{
		return true;
	}
}

function opm_getCountOfJson(jsonData)
{
	var count = 0;
	if (opm_checkIfAValIsValid(jsonData,'json'))
	{
		count = Object.keys(jsonData).length;
	}
	return count;
}
function snapshotRemotegridCallback(snapId, fulldata, gridTable, isremote, reload, reloadMsgId, subgrid) {
//	if(reloadMsgId != "") {
//		setTimeout(function(){$("#"+reloadMsgId).remove();},3000);
//	}

	var snapshotDataObj = OPMClient.InventoryDeviceDetailsController.snapshotData;
	var sizeY = 2;
	var fullLen = 0;
	if(isremote) {
		if(fulldata.records != undefined && fulldata.records > 0) {
			fullLen = parseInt(fulldata.records);
		} else if(fulldata.rows != null) {
			fullLen = fulldata.rows.length;
		}
	} else {
		fullLen = fulldata;
	}
	if(fullLen < 0) {
		fullLen = 0;
	}
	
	if(!window.OPM.isPDF && subgrid != true  && !OPMClient.InventoryNFAController.isNFASnapshot) {
		var text = $("#li_"+snapId+" .opm_widget_title .headerTitleSpan").text();
		if(text.indexOf(" ( ") != -1 && text.indexOf(" )") != -1 ) {
			text = text.substr(0, text.indexOf(" ( ")+3) + fullLen + text.substr(text.indexOf(" )"));
			$("#li_"+snapId+" .opm_widget_title .headerTitleSpan").text(text);
		} else {
			$("#li_"+snapId+" .opm_widget_title .headerTitleSpan").text(text.replace(text, text +" ( "+fullLen+" )"));
		}
	}


	if(fullLen <= 10 || window.OPM.isPDF) {
		$("#li_"+snapId+" .widgetListMore").hide();
	} else {
		$("#li_"+snapId+" .widgetListMore").show();
	}
	
	if(subgrid || fullLen > 0 && $(gridTable).height() > 0) {
		$("#li_"+snapId+" .content .opm_jqGridUI").show();
//		fullLen = (fullLen >= 0)? fullLen : 0;
//		if(fullLen > 25) {
//			var datalen = 25;
//			sizeY =  5 + datalen + Math.round(datalen / 10);
//			var gridHeight = $(gridTable).height();
//			sizeY1 = 5 + Math.floor(gridHeight / 38);
//			sizeY = (sizeY1<sizeY)?sizeY1:sizeY;
//		} else {
			var gridHeight = $(gridTable).height();
			sizeY = 5 + Math.floor(gridHeight / 38);
//		}
		if(sizeY > 25) {
			sizeY = 25;
		}
		$("#li_"+snapId).attr("data-gs-height", sizeY);
		reloadGridsterUl(snapId, reload);
		$("#li_"+snapId+" .content .opm_jqGridUI").removeClass("nodata");
	} else {
		$("#li_"+snapId+" .content .opm_jqGridUI").hide();
		reloadGridsterUl(snapId, reload);
		$("#li_"+snapId+" .content .opm_jqGridUI").addClass("nodata");
	}
}
var jgGridTableID = "";
function opm_loadJQgridWithData(gridTable, jsonData, colNamesList, colModelList, captionTitle, gridNavigator, onSelectFunction, defaultOptions, page){
	if(defaultOptions == undefined) {
		defaultOptions = {}; // @elango There are so many references for defaultOptions variable but in few places developers not passing defaultOptions which may lead to undefined error and create breakages. 
	}
	if(defaultOptions != null && (defaultOptions.savePagination || defaultOptions.enableColChooser == true) && defaultOptions.gridTableId != null) {
		$.ajax({
			url:window.OPM.apiUrlPattern + '/ncmclient/getGridColumnChoosers', //No I18N
			type:'GET',//No I18N
			data:{
				"GRID_ID":defaultOptions.gridTableId//No I18N
			},
			async: false,
			success:function(jsonData){
			    if(jsonData != null && jsonData != undefined) {
			        if(jsonData.page_size != null ) {
                        defaultOptions.minRowsPerPage = jsonData.page_size;
                    }
                    if(jsonData.sort_obj != null ) {
                        var sort_obj = jsonData.sort_obj;
                        defaultOptions.sortName = sort_obj.index;
                        defaultOptions.sortOrder = sort_obj.sortOrder;
                    }
					if(jsonData[defaultOptions.gridTableId] != null && jsonData[defaultOptions.gridTableId].length > 0) {
						var visibleCols = jsonData[defaultOptions.gridTableId];
						for (var index = 0; index < colModelList.length; index++) {
							var column1 = colModelList[index];
							if(column1.hidedlg == null || column1.hidedlg != true) {
								if(visibleCols.indexOf(column1.index) != -1) {
									column1.hidden=false;
								} else {
									column1.hidden=true;
								}
							}
						}
					}
			    }
			}
		});
		//(colModelList.length > 0 && $(gridTable+"_colChooserIndex").find("#colChooserIcon").length ==0) ::>>> avoid to add dupicate th in grid.
		if(defaultOptions.gridTableId != 'config_srchList'){
            if(defaultOptions.enableTopColChooser && colModelList.length > 0 && $(gridTable+"_colChooserIndex").find("#colChooserIcon").length ==0){
                colNamesList.push("");
                colModelList.push({index:"colChooserIndex",name:"colChooserIndex",width:40,search:false,sortable:false,hidedlg:true,hidden:true});//No I18N
            }
		}
	}
	

/**	if(defaultOptions.isNCM != null && defaultOptions.isNCM == true)
	{
		if(jsonData.colModelList!=null)
		{
			for(var i = 0; i < jsonData.colModelList.length; i++) 
			{
				var columnModel = jsonData.colModelList[i];
				if(columnModel.formatter != null && columnModel.formatter != "") 
				{
					var tmpFunc = new Function('return '+columnModel.formatter);
					columnModel.formatter = tmpFunc();
				}
				else 
				{
					var tmpFunc = new Function('return cellValueEscapeFormat');
					columnModel.formatter = tmpFunc();
				}
			}
		
		}

	}**/
	onSelectFunction = (onSelectFunction!==undefined)?onSelectFunction:""; //NO I18N
	var hidegrid =false;
	var defaultSortName = ""; //No I18N
	var defaultSortOrder = "asc"; //No I18N
	var widthOfTable = "100"; //No I18N
	var multiselectVal = false; 
	var hideCSV = false; 
	var hideExcel = false;
	var showPdf = false;
	var Search = true; 
	var apiUrl = "";// No I18N
	var urlParameter ="";// No I18N// No I18N
	var deleteName = "";// No I18N
	var rowNumNeeded = false; 
	var addIcon = false;
	var delIcon = false;
	var selectedMonitorTab = "";
	var deviceName = "";// No I18N
	var deviceNameParameter = "";// No I18N
	var delMsg = "Are you sure you want to delete?";// No I18N
	var minRowsPerPage = 50;
	var searchOption = true;
	var grouping = false;
	var toggleSearch = false;
	var groupingField = "";
	var groupingText = '<b>{0} </b>'; //No I18n
	var subGrid = false;
	var subGridWidth = 20; // jqGrid default
	var rowList = [10,25,50,100,500,1000];
	var columnChooser = false;
	var csvReport = false;
	var xlsReport = false;
	var pagination = true;
	var headertitles=false;
	var disableRowSelect = false;
	var noPaginationShowAll = false;
	var isVirtualNonMOEntity = false;
	var gridCallBack = null;
	var gridCallBackParams = null;
	var shrinkToFit = true;
	var autowidth=true;
	var height="auto"; //No I18N
	var groupCollapse = false;
	var plusicon = "ui-icon-circlesmall-plus";// No I18N
	var minusicon = "ui-icon-circlesmall-minus";// No I18N
	var showPagerColumnChooser = false;
	var autoencode = true;
	var multiselectWidth = 25;
	var storeDefaultOptions = false;
	var reloadOnExpand = false;
	var selectOnExpand = true;
	var retainSelection = false;
	var reloadGridTrigger = false;
	var multiboxonlyVal = false;
	var sortable = true;
	var forceSingleSelection = false;
	var reloadAfterFirstLoad = false;
	var isLazyLoadingGrid = false;
	var setPagerDynamically = false;
	var lazyLoadParams = {};
	var loadRCAEntitySelections = false;
	var loadTrapMibSelections = false;
	var ignoreRowCountAndShowPager = false;
	if (defaultOptions != undefined)
	{
		if(defaultOptions.retainSelection !== undefined){
			retainSelection = defaultOptions.retainSelection;
			reloadGridTrigger = true;
			gridSelectedRows[gridTable]={};
		}
		if(defaultOptions.plusicon !== undefined)
		{
			plusicon = defaultOptions.plusicon; 
		}
		if(defaultOptions.minusicon !== undefined)
		{
			minusicon = defaultOptions.minusicon; 
		}
		if(defaultOptions.subGrid !== undefined)
		{
			subGrid = defaultOptions.subGrid;
		}
		if(defaultOptions.subGridWidth !== undefined)
		{
			subGridWidth = defaultOptions.subGridWidth;
		}
		if(defaultOptions.groupCollapse !== undefined)
		{
			groupCollapse = defaultOptions.groupCollapse; 
		}
		if(defaultOptions.hideCSV !== undefined)
		{
			hideCSV = defaultOptions.hideCSV; 
		}
		if(defaultOptions.hideExcel !== undefined)
		{
			hideExcel = defaultOptions.hideExcel; 
		}
		if(defaultOptions.showPdf !== undefined)
		{
			showPdf = defaultOptions.showPdf;
		}
		if(defaultOptions.Search !== undefined)
		{
			Search = defaultOptions.Search; 
		}
		if (defaultOptions.searchOption != undefined)
		{
			searchOption = defaultOptions.searchOption; 
		}
		if(defaultOptions.height!==undefined) {
			height=defaultOptions.height;
		}
		if (defaultOptions.sortName != undefined)
		{
			defaultSortName = defaultOptions.sortName;
		} else if(defaultOptions.sortname != undefined) {
			defaultSortName = defaultOptions.sortname;
		}
		if (defaultOptions.sortOrder != undefined)
		{
			defaultSortOrder = defaultOptions.sortOrder; 
		}
		if (defaultOptions.widthOfTable != undefined)
		{
			widthOfTable = defaultOptions.widthOfTable; 
		}
		if (defaultOptions.multiselect != undefined)
		{
			multiselectVal = defaultOptions.multiselect;
		}
		if (defaultOptions.apiUrl != undefined)
		{
			apiUrl = defaultOptions.apiUrl; 
		}
		if (defaultOptions.urlParameter != undefined)
		{
			urlParameter = defaultOptions.urlParameter; 
		}
		if (defaultOptions.deleteName != undefined)
		{
			deleteName = defaultOptions.deleteName; 
		}
		if (defaultOptions.rowNumNeeded != undefined)
		{
			rowNumNeeded = defaultOptions.rowNumNeeded; 
		}
		if (defaultOptions.addIcon != undefined)
		{
			addIcon = defaultOptions.addIcon; 
		}
		if (defaultOptions.delIcon != undefined)
		{
			delIcon = defaultOptions.delIcon; 
		}
		if (defaultOptions.selectedMonitorTab != undefined)
		{
			selectedMonitorTab = defaultOptions.selectedMonitorTab; 
		}
		if (defaultOptions.deviceName != undefined)
		{
			deviceName = defaultOptions.deviceName; 
		}
		if (defaultOptions.deviceNameParameter != undefined)
		{
			deviceNameParameter = defaultOptions.deviceNameParameter; 
		}
		if (defaultOptions.delConfirmMsg != undefined)
		{
			delMsg = defaultOptions.delConfirmMsg; 
		}
		if (defaultOptions.minRowsPerPage != undefined)
		{
			minRowsPerPage = defaultOptions.minRowsPerPage; 
		}
		if (defaultOptions.grouping != undefined)
		{
			grouping = defaultOptions.grouping; 
		}
		if(defaultOptions.groupingField !== undefined)
		{
			groupingField = defaultOptions.groupingField.split(","); 
		}
		if(defaultOptions.groupingText !== undefined)
		{
			groupingText = defaultOptions.groupingText; 
		}
		if (defaultOptions.toggleSearch !== undefined)
		{
			toggleSearch = defaultOptions.toggleSearch; 
		}
		if (defaultOptions.rowList !== undefined)
		{
			rowList=defaultOptions.rowList;
		}
		if (defaultOptions.columnChooser !== undefined)
		{	
			columnChooser=defaultOptions.columnChooser;
		}
		if (defaultOptions.csvReport !== undefined)
		{	
			csvReport=defaultOptions.csvReport;
		}
		if (defaultOptions.xlsReport !== undefined)
		{	
			xlsReport=defaultOptions.xlsReport;
		}
		if(defaultOptions.headertitles!==undefined)
		{
			headertitles=defaultOptions.headertitles;
		}
		if(defaultOptions.hidegrid!==undefined)
		{
			hidegrid=defaultOptions.hidegrid
		}
		if(defaultOptions.disableRowSelect !== undefined){
			disableRowSelect=defaultOptions.disableRowSelect;
		}
		if(defaultOptions.gridCallBack !== undefined){
			gridCallBack=defaultOptions.gridCallBack;
		}
		if(defaultOptions.gridCallBackParams !== undefined){
			gridCallBackParams=defaultOptions.gridCallBackParams;
		}
		if((jsonData !== undefined && jsonData.length <= 10 && !defaultOptions.pagination && page !== "SyslogViewer") || jsonData == undefined || jsonData.length == 0)
		{
			pagination = false;
			gridNavigator = "";
		}
		if(defaultOptions.pagination !== undefined) {
			pagination=defaultOptions.pagination;
		}
		if(defaultOptions.noPaginationShowAll) {
			noPaginationShowAll = defaultOptions.noPaginationShowAll;
		}
		if(defaultOptions.isVirtualNonMOEntity !== undefined){
			isVirtualNonMOEntity = defaultOptions.isVirtualNonMOEntity;
		}
		if(defaultOptions.shrinkToFit !== undefined) {
			shrinkToFit = defaultOptions.shrinkToFit;
		}
		if(defaultOptions.showPagerColumnChooser!==undefined){
			showPagerColumnChooser = defaultOptions.showPagerColumnChooser
		}
		if(defaultOptions.autoencode !== undefined){
			autoencode = defaultOptions.autoencode;
		}
		if(defaultOptions.multiselectWidth !== undefined){
			multiselectWidth = defaultOptions.multiselectWidth;
		}
		if(defaultOptions.storeDefaultOptions !== undefined){
			storeDefaultOptions = defaultOptions.storeDefaultOptions;
		}
		if(defaultOptions.reloadOnExpand !== undefined) {
			reloadOnExpand = defaultOptions.reloadOnExpand;
		}
		if(defaultOptions.selectOnExpand !== undefined) {
			selectOnExpand = defaultOptions.selectOnExpand;
		}
		if(defaultOptions.multiboxonly !== undefined){
			multiboxonlyVal = defaultOptions.multiboxonly;
		}
		if(defaultOptions.forceSingleSelection !== undefined) {
		    forceSingleSelection = defaultOptions.forceSingleSelection;
		}
		if(defaultOptions.reloadAfterFirstLoad !== undefined) {
		    reloadAfterFirstLoad = defaultOptions.reloadAfterFirstLoad;
		}
		if(defaultOptions.sortable !== undefined) {
			sortable = defaultOptions.sortable;
		}
		if(defaultOptions.lazyLoadParams !== undefined) {
			lazyLoadParams = defaultOptions.lazyLoadParams;
			isLazyLoadingGrid = true;
		}
		if(defaultOptions.ignoreRowCountAndShowPager !== undefined) {
			ignoreRowCountAndShowPager = defaultOptions.ignoreRowCountAndShowPager;
		}
	}
	var onPagingCall = false;
	var onSearchCall = false;
    lazyLoadParams.isPrevDataLoaded = true;
    lazyLoadParams.isNextDataLoaded = true;
    lazyLoadParams.isPageLoaded = false;
    lazyLoadParams.isPrevDataFetched = false;
    lazyLoadParams.isNextDataFetched = false;
	var countOfRows = opm_getCountOfJson(jsonData);
	if(window.OPM.isPDF || noPaginationShowAll) {
		minRowsPerPage = countOfRows;
		rowList=[countOfRows];
	}
	var grid = $(gridTable);
	var gridDivId = "#gbox_"; //No I18N
	var gridTableIdAlone = gridTable.substring(1); 
	gridDivId = gridDivId+gridTableIdAlone; 
	if(window.OPM.isOPM && (onSelectFunction !== undefined && onSelectFunction === "interfaceDiscoveredData")){
		grid = $(gridTable+'.intfDiscAccTab');
		gridTable = gridTable+'.intfDiscAccTab'; //No I18N
	}

	var gridDiv = $(gridDivId); 
	if (gridDiv.length > 0)
	{
		grid.jqGrid('clearGridData'); //No I18N
		grid.jqGrid('setGridParam', { datatype: "jsonstring", datastr: jsonData }); //No I18N
		grid.trigger('reloadGrid'); //No I18N
	}
	else
	{
		if ((pagination && (gridNavigator == null || gridNavigator == undefined || gridNavigator == "") && ((countOfRows > minRowsPerPage)||onSelectFunction==="SDPOPCISyncReportsList" ||onSelectFunction==="ServiceNowCISyncReportsList" ||onSelectFunction==="AECISyncReportsList")) || ignoreRowCountAndShowPager)
		{
			var gridNavigatorId = gridTableIdAlone+"Pager";//No I18N
			var parentElem = $(gridTable).parent().get(0);
			opm_createDiv(parentElem,gridNavigatorId);
			gridNavigator = "#"+gridNavigatorId;//No I18N
		}
		if (onSelectFunction === "editRouter" && (gridNavigator == null || gridNavigator == undefined || gridNavigator == ""))
		{
			var gridNavigatorId = gridTableIdAlone+"Pager";//No I18N
			var parentElem = $(gridTable).parent().get(0);
			opm_createDiv(parentElem,gridNavigatorId);
			gridNavigator = "#"+gridNavigatorId;//No I18N
		}
		if(onSelectFunction === "opm_interfacesList" && (gridNavigator == null || gridNavigator == undefined || gridNavigator == "")){//No I18N
			var gridNavigatorId = gridTableIdAlone+"Pager";//No I18N
			var parentElem = $(gridTable).parent().get(0);
			opm_createDiv(parentElem,gridNavigatorId);
			gridNavigator = "#"+gridNavigatorId;//No I18N
		}
		if(onSelectFunction === "ipam_switchportList"||onSelectFunction === "ipam_switchList" ||onSelectFunction === "ipam_DHCP_Scopes"){//No I18N
			var gridNavigatorId = gridTableIdAlone+"Pager";//No I18N
			var parentElem = $(gridTable).parent().get(0);
			opm_createDiv(parentElem,gridNavigatorId);
			gridNavigator = "#"+gridNavigatorId;//No I18N			
			if(onSelectFunction === "ipam_DHCP_Scopes"){
                 	if(OPMClient.InventoryDeviceDetailsController.inventorysnapType!="DiscoveredV6Subnet"){
                 	 	if($(".oputilsSnapshot .ipam .grid-stack-item").length==1){
            		     	if(!($('.oputilsSnapshot .ipam').hasClass('ipamGrid'))){//No I18N
            					$("#quicklinks").remove();
            					$('.oputilsSnapshot .ipam').addClass('ipamGrid');//No I18N
            				}
            			}else{
            				$('.oputilsSnapshot .ipam').removeClass('ipamGrid');//No I18N
            			}
            		}
            		setTimeout(function(){
            			if($(".oputilsSnapshot .ipam .grid-stack-item").length!=1){
            				$('.oputilsSnapshot .ipam').removeClass('ipamGrid');//No I18N
            			}
            	    },1000);
                 }
		}
		var gridviewVal = false;
		grid.jqGrid(
				{
					colNames: (defaultOptions!==undefined && defaultOptions.skipNameEscapeCheck)?colNamesList:escapeGridColumnNames(colNamesList),
					colModel: colModelList,
					pager: gridNavigator, 
					rowList:rowList,
					datatype: "jsonstring", //No I18N
					datastr: jsonData,
					multiselect: multiselectVal,
					multiselectWidth: multiselectWidth,
					multiboxonly: multiboxonlyVal,
					loadOnce: true,
					headertitles:headertitles,
					jsonReader: { 
						root: function (obj) { return obj; }, 
						repeatitems: false,
                        id: (onSelectFunction == "downtimeScheduler" || onSelectFunction === "opm_advancedReport") ? false : "id"  //No I18N
					},
					rownumbers: rowNumNeeded,
					rowNum: minRowsPerPage,
					rownumWidth:25, //minor ui issue in number column width
					viewrecords: true,
					sortname: defaultSortName, 
					sortorder: defaultSortOrder, 
					grouping: grouping,
					autoencode: autoencode,
					groupingView:(defaultOptions.groupingView != undefined) ? defaultOptions.groupingView :
					{
						plusicon: plusicon,
    					minusicon: minusicon,
						groupField: groupingField,
						groupColumnShow: [false],
						groupCollapse:groupCollapse,
						groupText:[groupingText]
					},
					caption: escapeHTML(captionTitle),
					height: height, //No I18N
					autowidth: autowidth,
					shrinkToFit: shrinkToFit,
					hidegrid: hidegrid,
					ignoreCase: true,
					sortable:sortable,
					subGrid:subGrid,
					subGridWidth:subGridWidth,
					gridview: gridviewVal, // If set to true, the event below doesn't fire!
					defaultOptions: storeDefaultOptions ? defaultOptions:"",
					expandedGroups:{},
        			beforeRequest:function(){
					    if(isLazyLoadingGrid)
					    {
					    	if(lazyLoadParams.clientSorting){
					    		lazyLoadParams.clientSorting = false;
					    	}else{
					    		lazyLoadParams.page++;
					    		if(setPagerDynamically){
						    		grid.jqGrid('setGridParam',{page:Math.ceil(lazyLoadParams.data.length/lazyLoadParams.viewRecords)});//No I18N
						    		setPagerDynamically = false;
						    	}
						    	var page = grid.getGridParam().page;
						    	lazyLoadParams.isPageLoaded=false;
						    	var currentDataset = Math.ceil(page/lazyLoadParams.pagesPerDataset);
						    	if(currentDataset===3 && lazyLoadParams.isNextDataLoaded)
						    	{
						    		if(lazyLoadParams.totalDataset>=(lazyLoadParams.datasetIndex+1))
						    		{
							    		var params = {
											fetchFromRowNumber:((lazyLoadParams.fetchRows)*(lazyLoadParams.datasetIndex))+1,
											rowsToFetch:lazyLoadParams.fetchRows
							    		}
							    		if(lazyLoadParams.apiParams!==undefined){
							    			lazyLoadParams.apiParams
							    			params = $.extend({},params,lazyLoadParams.apiParams);
							    		}
							    		var sendType ="GET"; //No I18N
							    		if(lazyLoadParams.postRequest){
							    			sendType ="POST"; //No I18N
							    		}
							    		lazyLoadParams.isNextDataLoaded =false;
							    		lazyLoadParams.isPageLoaded=false;
							    		lazyLoadParams.isNextDataFetched=false;
				 						$.ajax(
										{
											url: lazyLoadParams.apiUrl,
											data: params,
											type: sendType,
											dataType:'json', //No I18n
											beforeSend: function(XMLHttpRequest,settings)
									  		{
									  			opm_progressBarInit();
									  			appendCollectorDetails(XMLHttpRequest,settings);
									  			appendFWACollectorDetails(XMLHttpRequest,settings);
									  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
									  		},
											success: function(jsonData)
											{
												if(Object.values(jsonData)[0].CustomWidget) {
													jsonData.rows=Object.values(jsonData)[0].WidgetData;
												}
							  					lazyLoadParams.isNextDataFetched=true;
							  					lazyLoadParams.nextData=jsonData;
							  					if(lazyLoadParams.isPageLoaded){
													lazyLoadParams.isNextDataFetched = false;
									    			lazyLoadParams.isNextDataLoaded = true;
									    			lazyLoadParams.isPrevDataLoaded = true;
									    			lazyLoadParams.isPageLoaded = false;
									    			lazyLoadParams.datasetIndex++;
									    			lazyLoadParams.data.splice(0,lazyLoadParams.fetchRows);
									    			lazyLoadParams.data = lazyLoadParams.data.concat(lazyLoadParams.nextData.rows);
									    			$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
									    				datatype: 'local',//No I18N
												   		page: lazyLoadParams.pagesPerDataset+1,
												   		data: lazyLoadParams.data
												     });
								       	 			$(gridTable).jqGrid('setGridParam', { //No I18N
												          page:lazyLoadParams.pagesPerDataset*2
												     });
								       	 			lazyLoadParams.page--;
								       	 			$(gridTable).trigger('reloadGrid');//No I18N
							  					}
											}

						       			});
						    		}
						    	}
						    	if(currentDataset===1 && lazyLoadParams.isPrevDataLoaded)
						    	{
						    		if(lazyLoadParams.datasetIndex > 3)
						    		{
							    		var params = {
											fetchFromRowNumber:((lazyLoadParams.fetchRows)*(lazyLoadParams.datasetIndex-4))+1,
											rowsToFetch:lazyLoadParams.fetchRows
							    		}
							    		if(lazyLoadParams.apiParams!==undefined){
							    			lazyLoadParams.apiParams
							    			params = $.extend({},params,lazyLoadParams.apiParams);
							    		}
							    		var sendType = "GET"; //No I18N
							    		if(lazyLoadParams.postRequest){
							    			sendType="POST"; //No I18N
							    		}
							    		lazyLoadParams.isPrevDataLoaded =false;
							    		lazyLoadParams.isPageLoaded=false;
							    		lazyLoadParams.isPrevDataFetched=false;
							    		$.ajax(
										{
											url: lazyLoadParams.apiUrl,
											data: params,
											type: sendType,
											dataType:'json', //No I18n
											beforeSend: function(XMLHttpRequest,settings)
									  		{
									  			opm_progressBarInit();
									  			appendCollectorDetails(XMLHttpRequest,settings);
									  			appendFWACollectorDetails(XMLHttpRequest,settings);
									  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
									  		},
											success: function(jsonData)
											{
											    lazyLoadParams.isPrevDataFetched=true;
												lazyLoadParams.prevData=jsonData;
												if(Object.values(jsonData)[0].CustomWidget) {
													lazyLoadParams.prevData.rows=Object.values(jsonData)[0].WidgetData;
												}
							  					if(lazyLoadParams.isPageLoaded){
													lazyLoadParams.isPrevDataFetched = false;
									    			lazyLoadParams.isPrevDataLoaded = true;
									    			lazyLoadParams.isNextDataLoaded = true;
									    			lazyLoadParams.isPageLoaded = false;
									    			lazyLoadParams.data.splice(2*lazyLoadParams.fetchRows,lazyLoadParams.fetchRows);
							  						lazyLoadParams.data = lazyLoadParams.prevData.rows.concat(lazyLoadParams.data);
									    			lazyLoadParams.datasetIndex--;
									    			$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
									    				datatype: 'local',//No I18N
												   		page: lazyLoadParams.pagesPerDataset+1,
												   	    data: lazyLoadParams.data
												     });
								       	 			lazyLoadParams.page--;
								       	 			$(gridTable).trigger('reloadGrid');
							  					}
											}

						       			});

						    		}
						    	}

         						var currentSet = Math.ceil((page+1)/lazyLoadParams.pagesPerDataset);
						    	if(currentSet===4 && lazyLoadParams.totalDataset >= (lazyLoadParams.datasetIndex))
						    	{
						    		if(lazyLoadParams.isNextDataFetched )
						    		{
						    			lazyLoadParams.isNextDataFetched = false;
						    			lazyLoadParams.isNextDataLoaded = true;
						    			lazyLoadParams.isPrevDataLoaded = true;
						    			lazyLoadParams.isPageLoaded=false;
						    			lazyLoadParams.datasetIndex++;
						    			lazyLoadParams.data.splice(0,lazyLoadParams.fetchRows);
						    			lazyLoadParams.data = lazyLoadParams.data.concat(lazyLoadParams.nextData.rows);
						    			$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
						    				datatype: 'local',//No I18N
									   		page: lazyLoadParams.pagesPerDataset+1,
									   	    data: lazyLoadParams.data
									     });
					       	 			$(gridTable).jqGrid('setGridParam', { //No I18N
									          page:lazyLoadParams.pagesPerDataset*2
									     });
						    		}else{
						    			lazyLoadParams.isPageLoaded=true;
						    		}
						    	}
					    		currentSet = Math.ceil((page-1)/lazyLoadParams.pagesPerDataset);
						    	if(currentSet===0 && lazyLoadParams.datasetIndex > 2 && lazyLoadParams.page!==1)
						    	{
						    		if(lazyLoadParams.isPrevDataFetched)
						    		{
						    			lazyLoadParams.isPageLoaded=false;
						    			lazyLoadParams.isPrevDataFetched = false;
						    			lazyLoadParams.isPrevDataLoaded = true;
						    			lazyLoadParams.isNextDataLoaded = true;
						    			lazyLoadParams.datasetIndex--;
						    			lazyLoadParams.data.splice(2*lazyLoadParams.fetchRows,lazyLoadParams.fetchRows);
							  			lazyLoadParams.data = lazyLoadParams.prevData.rows.concat(lazyLoadParams.data);
						    			$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
					    				    datatype: 'local',//No I18N
								            page: lazyLoadParams.pagesPerDataset+1,
								   			data: lazyLoadParams.data
									     });
						    		}else{
						    			lazyLoadParams.isPageLoaded=true;
						    		}

						    	}

								if (lazyLoadParams.isFirstTimeLoad){
									 currentSet = Math.ceil((lazyLoadParams.page+1)/lazyLoadParams.pagesPerDataset);
									if(currentSet===2 && lazyLoadParams.isFirstDataFetched && !lazyLoadParams.isFirstDataLoaded ){
										lazyLoadParams.isFirstDataLoaded=true;
										$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
									    		datatype: 'local',//No I18N
												page: lazyLoadParams.pagesPerDataset,
												data: lazyLoadParams.data
										});
										if(lazyLoadParams.isSecondDataFetched){
											lazyLoadParams.isSecondDataLoaded=true;
										}

									}else if(currentSet===3 && lazyLoadParams.isFirstDataLoaded && lazyLoadParams.isSecondDataFetched && !lazyLoadParams.isSecondDataLoaded){
										lazyLoadParams.isFirstTimeLoad=false;
										lazyLoadParams.isSecondDataLoaded=true;
										$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
									    		datatype: 'local',//No I18N
												page: lazyLoadParams.pagesPerDataset*2,
												data: lazyLoadParams.data
									     });
									}

								}
					    	}
					    }
					    return true;
        			},		
					onPaging: function(pgButton){
						onPagingCall = true;
						if(onSelectFunction === "addMonitorList_1") //No I18N
						{
							setTimeout(function(){
								var selCnt = 1;
								$.each(jsonData, function(key,obj){
									if(obj.isSelected === true)
									{
										$("#addMonitorList_1").jqGrid('setSelection', selCnt, true);
									}
									selCnt = selCnt+1;
								});
								var selectedArray = $("#addMonitorList_1").jqGrid('getGridParam', 'selarrrow');
								$.each(selectedArray,function(index, item){
									$("#jqg_addMonitorList_1_"+item).attr('disabled','disabled');
								});

							},300);

						}
						if(onSelectFunction === "opm_interfacesList"){//No I18N
							setTimeout(function(){
								reloadGridsterUl(OPMClient.InventoryDeviceDetailsController.interfaceSnapIndex,true);
							},300);
						}
						if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile"){
							Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
								doJqGridSelection(grid,onSelectFunction);
							});

							var self = window.OPM.currentView.handler.controller;
							if(self.get('currentMonitorType') === 'appmonitor'){
								if(self.get('isValidationFailed')){
									return 'stop';//NO I18N
								}
							}
						}

						if(pgButton=="records"){ //NO I18N
							var selectedPageNo = $(".ui-pg-selbox",this.p.pager).val(); //NO I18N
							if(onSelectFunction!=undefined && !onSelectFunction.indexOf("nfaInvList_")){ //NO I18N
								localStorage.setItem("nfaInvListPageCount",selectedPageNo); //NO I18N
							}
                            if((defaultOptions.enableColChooser == true || defaultOptions.savePagination) && defaultOptions.gridTableId != null) {
                                setTimeout(function() {
                                    var rowSize = grid.jqGrid('getGridParam', 'rowNum'); //NO I18N
                                    var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridRowsCount?GRID_ID='+defaultOptions.gridTableId + '&GRID_PAGE_SIZE='+rowSize;//No I18N
                                    $.ajax(
                                    {
                                        url: url,
                                        type: 'POST', //No I18N
                                        success: function(response){}
                                    });
                                }, 0);
                            }
						}
						if(onSelectFunction == "ipmiHwGraphList"){
							var self = OPMClient.ApplicationController.get('ipmiHWGraphData');//No I18N
							self.set('widgetData.changeHeight',!self.get('widgetData.changeHeight'));//No I18N
						}
						if(onSelectFunction === "merakiReportList"){

					        $('td[rowspan="1"]', grid).each(function () {
					            var spans = $('td[rowspanid="' + this.id + '"]', grid).length + 1;
					            if (spans > 1) {
					                $(this).attr('rowspan', spans);
					            }
					        });
         				}
         				if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "VendorMonitor"){
							window.OPM.currentView.handler.controller.set('showViewReasons',false);//No I18N
						}
         				if(isLazyLoadingGrid)
					    {
					    	if(pgButton==="records" || pgButton==="first")
         					{
         						if(pgButton==="first"){
         							lazyLoadParams.page = 0;
         							return false;
         						}
         						var viewRecords = $(gridNavigator+" .ui-pg-selbox").val();//No I18N
	         					var totalDataset = Math.ceil(lazyLoadParams.totalRecords/lazyLoadParams.fetchRows);
	         					var page = 0;
						       	if(lazyLoadParams.viewRecords > parseInt(viewRecords)){
						       		page = Math.round(lazyLoadParams.page*(lazyLoadParams.viewRecords/viewRecords))-(lazyLoadParams.viewRecords/viewRecords);
						       	}else{
						       		page = Math.ceil(lazyLoadParams.page*(lazyLoadParams.viewRecords/viewRecords))-1;
								}
	         					var resetLazyLoadparams = {
	         						viewRecords:viewRecords,
						       		totalPages:Math.ceil(lazyLoadParams.totalRecords/viewRecords),
						       		totalDataset:totalDataset,
						       		pagesPerDataset: Math.ceil(lazyLoadParams.fetchRows/viewRecords)
						       	};

						       	lazyLoadParams = $.extend({},lazyLoadParams,resetLazyLoadparams);
						       	lazyLoadParams.page=page;

         					}
         					else if(pgButton==="prev"){
         						if(lazyLoadParams.page===1){
         							return false;
         						}
         						lazyLoadParams.page = lazyLoadParams.page-2;
         						if(lazyLoadParams.page<0){
         							lazyLoadParams.page = 0;
         						}
         					}
         					else if(pgButton==="last")
         					{
         						if(lazyLoadParams.page===lazyLoadParams.totalPages){
         							return false;
         						}
         						if(lazyLoadParams.isFirstTimeLoad && !lazyLoadParams.isSecondDataLoaded){
         							lazyLoadParams.isFirstTimeLoad=false;
         							lazyLoadParams.isFirstDataLoaded=true;
         							lazyLoadParams.isSecondDataLoaded=true;
         							$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
							    		datatype: 'local',//No I18N
										page: lazyLoadParams.pagesPerDataset*3,
										data: lazyLoadParams.data
									});
         						}

         						if(lazyLoadParams.totalRecords<=(lazyLoadParams.fetchRows*3)){
         						    var resetLazyLoadparams = {
						       				page:lazyLoadParams.totalPages-1
						       			};
						       		lazyLoadParams = $.extend({},lazyLoadParams,resetLazyLoadparams);

         						}
							    setPagerDynamically = true;
         					}
					    }
					},
					onSortCol: function(ind,icol,sortorder){
					    if(defaultOptions.enableColChooser == true && defaultOptions.gridTableId != null) {
                            setTimeout(function() {
                                var sort_data_obj = {};
                                sort_data_obj.index = index;
                                sort_data_obj.columnIndex = columnIndex;
                                sort_data_obj.sortOrder = sortOrder;
                                var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridColumnChooser';//No I18N
                                $.ajax(
                                {
                                    url: url,
                                    type: 'POST', //No I18N
                                    data : {'GRID_ID': defaultOptions.gridTableId ,'COLUMN_SORTING':JSON.stringify(sort_data_obj)},//No I18N
                                    success: function(response){}
                                });
                            }, 0);
                        }
						if(isLazyLoadingGrid)
					    {
					    	lazyLoadParams.clientSorting = true;
						    var currentDataset = Math.ceil(lazyLoadParams.page/lazyLoadParams.pagesPerDataset);
						    var gridPageNum = 1;
						    if(lazyLoadParams.totalDataset<=3 && lazyLoadParams.currentDataset<=3){
						    	gridPageNum = lazyLoadParams.page = 1;
						    }else{
						    	if(currentDataset===1){
						    		gridPageNum = lazyLoadParams.page = 1;
						    	}else if(currentDataset===2){
						    		gridPageNum = lazyLoadParams.page = lazyLoadParams.pagesPerDataset+1;
						    	}else if(currentDataset===lazyLoadParams.totalDataset){
						    		gridPageNum = (2*lazyLoadParams.pagesPerDataset)+1;
									lazyLoadParams.page = ((currentDataset-1)*lazyLoadParams.pagesPerDataset)+1;
						    	}else{
									gridPageNum = lazyLoadParams.pagesPerDataset+1;
									lazyLoadParams.page = ((currentDataset-1)*lazyLoadParams.pagesPerDataset)+1;
						    	}
						    }
						    $(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
						        datatype: 'local',//No I18N
						        data: lazyLoadParams.data,
						        page: gridPageNum
						    });
					    }
						if(onSelectFunction === "addMonitorList_1") //No I18N
						{
							setTimeout(function(){
								var selCnt = 1;
								$.each(jsonData, function(key,obj){
									if(obj.isSelected === true)
									{
										$("#addMonitorList_1").jqGrid('setSelection', selCnt, true);
									}
									selCnt = selCnt+1;
								});
								var selectedArray = $("#addMonitorList_1").jqGrid('getGridParam', 'selarrrow');
								$.each(selectedArray,function(index, item){
									$("#jqg_addMonitorList_1_"+item).attr('disabled','disabled');
								});
							},300);
						}
						if(onSelectFunction === "opm_DevNGlobalProfileList") {
							setTimeout(function(){
								var rowCount = 1;
								$.each(jsonData, function(key,obj){
									if(obj.hasSelected === true)
									{
										$("#jqg_opm_DevNGlobalProfileList_" + rowCount).attr('checked', true);
				                        $("#jqg_opm_DevNGlobalProfileList_" + rowCount).attr('disabled', true);
				                        $("#jqg_opm_DevNGlobalProfileList_" + rowCount).closest('tr').click(function () {
				                            return false;
				                        });
									}
									rowCount++;
								});
								var count = $('#opm_DevNGlobalProfileList').find('.cbox:checked').length;
				                if(count == rowCount-1) {
				                    $('#cb_opm_DevNGlobalProfileList').prop('checked', true);
				                    $('#cb_opm_DevNGlobalProfileList').attr('disabled', true);
				                }
							},10);
						}
						if(onSelectFunction === "opm_rediscoverInterfaces")
						{
						    grid.jqGrid('setGridParam', { "deselectAfterSort": false}); //No I18N
						}
						if(onSelectFunction === "merakiReportList"){

					        $('td[rowspan="1"]', grid).each(function () {
					            var spans = $('td[rowspanid="' + this.id + '"]', grid).length + 1;
					            if (spans > 1) {
					                $(this).attr('rowspan', spans);
					            }
					        });
         				}
         				if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile"){
						    //grid.jqGrid('setGridParam',{"deselectAfterSort": false}); //No I18N
						    Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
         						doJqGridSelection(grid,onSelectFunction);
         					});
						}
						//Handled a minor glitch in the Eventlogs/Process grid headers. (used id as colModel, generally it's used for enabling search)
		 				if(onSelectFunction === 'snapshot_eventlogMonitors' || onSelectFunction === 'snapshot_processMonitors'){
		 					$('#opm_'+onSelectFunction.split('_')[1]+'List_id').addClass('vmdisplayNone');//No I18N
		 				}

					},
					onSelectAll: function(rowIds, allChecked) {
					    if(onSelectFunction == 'ncmNotificationTrigger') {
                            OPMClient.NCMNotificationTriggerController.updateGridSelection(gridTableIdAlone, rowIds, allChecked);
                        }
					    if(onSelectFunction === "apEntityListGroup") {
                            // Defer so jqGrid finishes toggling all checkboxes before we push/rebuild - running
                            // this re-entrantly mid select-all left only alternate rows checked.
                            setTimeout(function () {
                                var $g = $("#entityList");
                                var rows = $g.jqGrid('getRowData'); //No I18N
                                // Rows already in selectedEntities (e.g. from an earlier page) must stay checked even if another row on this page is rejected.
                                var isAlreadySelected = function (rowData) {
                                    var selectedModule = $("#moduleSelect").val();
                                    var selectedEntities = OPMClient.APController.get("selectedEntities");
                                    if (selectedModule === "ipsla") {
                                        return OPMClient.APController.isElementPresentInObject(selectedEntities, "moid", rowData.moid); //No I18N
                                    }
                                    var groupName = (rowData.groupName !== undefined && rowData.groupName !== null && rowData.groupName !== "") ? rowData.groupName : rowData.name;
                                    return OPMClient.APController.isElementPresentInObject(selectedEntities, "name", groupName); //No I18N
                                };
                                if (allChecked) {
                                    var maxReached = false;
                                    for (var i = 0; i < rows.length; i++) {
                                        if (isAlreadySelected(rows[i])) {
                                            // Already selected before this click - keep checked, skip the push entirely.
                                            $g.jqGrid('setSelection', rowIds[i], false, "_sp_"); //No I18N
                                            continue;
                                        }
                                        if (OPMClient.APController.pushSelectedEntity(rows[i]) === false) {
                                            // Max reached: deselect this + remaining not-yet-selected rows only.
                                            maxReached = true;
                                            // resetSelection fires no callbacks; then re-select only the rows within the limit.
                                            // Toggling over-limit rows individually via setSelection fires onSelectRow -> loadSelectedEntities
                                            // mid-loop, altering jqGrid's internal state and leaving the last over-limit row selected.
                                            $g.jqGrid('resetSelection'); //No I18N
                                            for (var j = 0; j < rows.length; j++) {
                                                if (isAlreadySelected(rows[j])) { $g.jqGrid('setSelection', rowIds[j], false, "_sp_"); }
                                            }
                                            break;
                                        }
                                        // setSelection toggles by default - force-select via "_sp_" so pre-selected rows aren't flipped off.
                                        $g.jqGrid('setSelection', rowIds[i], false, "_sp_"); //No I18N
                                    }
                                    // "_sp_" skips jqGrid's own header-checkbox sync, so set it ourselves.
                                    $("#cb_entityList").prop("checked", !maxReached && rows.length > 0); //No I18N
                                } else {
                                    // Batch de-select: strip all from the model, then refresh the selected
                                    // grid ONCE (per-row removeSelectedEntity does a full GridUnload+reload).
                                    for (var i = 0; i < rows.length; i++) {
                                        OPMClient.APController.removeSelectedEntity(rows[i], true);
                                    }
                                    // Deterministically clear checkboxes: deselect only rows currently selected.
                                    var selArr = ($g.jqGrid('getGridParam', 'selarrrow') || []).slice(); //No I18N
                                    for (var s = 0; s < selArr.length; s++) { $g.jqGrid('setSelection', selArr[s], false); }
                                    if (OPMClient.APController.selectedEntities.length === 0) {
                                        $('.selectedBox .nodataMsg').show();
                                        $('.selectedBox .opm_jqGridUI').hide();
                                    } else {
                                        OPMClient.APController.loadSelectedEntities();
                                    }
                                    OPMClient.APController.set("entityCount", OPMClient.APController.selectedEntities.length); //No I18N
                                    $("#cb_entityList").prop("checked", false); //No I18N
                                }
                            }, 0);
                        }
						if(onSelectFunction === "ipam_Ping"){
							var selectedIPs = getEmberSelectedRows("opm_Devices","ip-address");//NO I18N
							if(selectedIPs !== ""){
								$("#OpUtilsPing").css("display","flex");
								$('.opmInventoryHolder').addClass('AETIDRowChecked');
								$("#OpUtilsPingAlert").css("display","none");

							}else{
								$("#OpUtilsPing").css("display","none");
								$('.opmInventoryHolder').removeClass('AETIDRowChecked');
								$("#OpUtilsPingAlert").css("display","none");
							}
						}
						else if(onSelectFunction === "ipam_NWMAlerts"){
							var selectedIPs = getEmberSelectedRows("opm_Devices","ip-address");//NO I18N
							if(selectedIPs !== ""){
								$("#oputilsaddbutton").hide();
								$("#ipamSreachIcon").hide();
								$("#OpUtilsPing").css("display","none");
								$("#OpUtilsPingAlert").css("display","flex");
							}else{
								$("#OpUtilsPing").css("display","none");
								$("#OpUtilsPingAlert").css("display","none");
								$("#oputilsaddbutton").show();
								$("#ipamSreachIcon").show();
							}
						}
						else if(onSelectFunction === "OnselectsensorList"){
							if(allChecked){
								$("#gridsensorList tr.jqgroup input[name='sensorGroup']").prop("checked",true);//No I18N
								$('.actionDropDown').removeClass('disabledBlock');//No I18N
							}else{
								$("#gridsensorList tr.jqgroup input[name='sensorGroup']").prop("checked",false);//No I18N
								$('.actionDropDown').addClass('disabledBlock');//No I18N
							}
						}else if(onSelectFunction ==="opmEntitySelectionEntityList"){//No I18N
							var entityDataList = [];
			            	for (var i=0;i<rowIds.length;i++)
			            	{
			                	if(allChecked) {
			                		var entityData =  $(gridTable).jqGrid("getRowData",rowIds[i]);//No I18N
			                		entityDataList.push(entityData);
					    			gridSelectedRows[gridTable][rowIds[i]] = entityData;
			                	} else {
			                		var entityData =  $(gridTable).jqGrid("getRowData",rowIds[i]);//No I18N
			            			entityDataList.push(entityData);
			                		delete gridSelectedRows[gridTable][rowIds[i]];
			                	}
			            	}
			            	if(entityDataList.length > 0){
			            		if(allChecked){
									OPMClient.entitySelectionController.pushAllEntity(entityDataList);
			            		}else{
									OPMClient.entitySelectionController.removeAllEntity(entityDataList);
			            		}
			            	}
						}
						if(onSelectFunction === "OwnerDetailsFunc"){
							var monArr = OPMClient.SettingsOpUtilConfigController.adUserOwnerId;
							if(allChecked){
								$.each(rowIds,function(i,id){
									var ownerId = grid.jqGrid('getCell',id,'owner-id'); //No I18N
									if(($.inArray(rowIds, monArr) === -1)){
										OPMClient.SettingsOpUtilConfigController.adUserOwnerId.push(ownerId);
									}
								});
							}else{
								$.each(rowIds,function(i,id){
									var ownerId = grid.jqGrid('getCell',id,'owner-id'); //No I18N
									OPMClient.SettingsOpUtilConfigController.adUserOwnerId.splice( $.inArray(ownerId, OPMClient.SettingsOpUtilConfigController.adUserOwnerId), 1);
								});
							}
							var userIdLen = OPMClient.SettingsOpUtilConfigController.adUserOwnerId;
							if(userIdLen.length == 0 || allChecked === false){
								OPMClient.SettingsOpUtilConfigController.set('adUserOwnerId',[]);//No I18N
								$("#ownerTabDeleteBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
								$("#ownerTabDeleteAllBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
								$("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
							}
							else if(userIdLen.length != 0){
								$("#ownerTabDeleteBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
								$("#ownerTabDeleteAllBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
								$("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
							}
						}
						if(onSelectFunction === "credentialsList"){//No I18N
							if(OPMClient.VMwareDiscoveryController.isVMwareDiscoveryWizard)
							{
								OPMClient.VMwareDiscoveryController.IsUserSelectedCredetials = true;
								OPMClient.VMwareDiscoveryController.userSelectedCredetials = $('#DECredProfList').jqGrid('getGridParam','selarrrow'); 
							}
						}
						if (onSelectFunction == "snapshotMonitorList" && defaultOptions.MailboxStoreLocation == true ) {
							allChecked ? $('#mailStoreDiv').show() : $('#mailStoreDiv').hide();//No I18N
						}
						if (onSelectFunction == "snapshotMonitorList" && defaultOptions.PublicStoreLocation == true ) {
							allChecked ? $('#publicStoreDiv').show() : $('#publicStoreDiv').hide();//No I18N
						}
						$("input.groupHeader").attr('checked', allChecked);
						allChecked && defaultOptions.showActionDiv ? $(".opmActionsIcons").slideDown() : $(".opmActionsIcons").slideUp() ;
						defaultOptions.showActionDiv ? $(".opmForm").addClass("opmFormType5") : '';//No I18N
						if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile"){
							var self = window.OPM.currentView.handler.controller;
							var monitorsList = self.get('monitorsList');
							var monitorType = onSelectFunction.split("_")[1];
							var arrIndex = monitorsList.map(function(obj){return obj.monitorTypeKey;}).indexOf(monitorType);
							var monitorTypeId = monitorsList[arrIndex].monitorTypeId;
							var selectedIds = monitorsList[arrIndex].selectedIds;
							self.set('showSelectedCount',false);//No I18N

							if(allChecked){
								var isValid = true;
								$.each(rowIds,function(i,id){
									var selectedId = grid.jqGrid('getCell',id,monitorTypeId); //No I18N
									if(selectedIds.indexOf(selectedId) < 0){
										if(self.get('selectedMonitorsCount') >= self.get('monitorsMaxCount')){
											Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
												grid.jqGrid('setSelection',id,false);//No I18N
											});
											self.set('showSelectedCount',true);//No I18N
											isValid = false;
										}
										if(isValid){
											selectedIds.push(selectedId);
											saveSelectedRowData(grid.jqGrid("getRowData",id),id,monitorType,monitorTypeId,selectedId,self,true);//No I18N
										}
									}
								});
								if(!isValid){
									var okCallback = function(){
										self.setProperties({showInfoDialog:false,okCallback:'',confirmMessage:''});//No I18n
									}
									self.setProperties({showSelectedCount:false,showInfoDialog:true,okCallback:okCallback,
														confirmMessage:(Ember.I18n.t('webclient.opm.settings.confign.monitor.profile.selection.limit',//No I18N
														{param0:self.get('monitorsMaxCount')},this))});//No I18N
								}
							}else{
								$.each(rowIds,function(i,id){
									var selectedId = grid.jqGrid('getCell',id,monitorTypeId); //No I18N
									selectedIds.splice(selectedIds.indexOf(selectedId),1);
									saveSelectedRowData(grid.jqGrid("getRowData",id),id,monitorType,monitorTypeId,selectedId,self,false);//No I18N
								});
							}
							Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
								self.set('showSelectedCount',true);//No I18N
							});
						}else if(onSelectFunction === 'VirtualMonitorsList'){//No I18n
							var self = window.OPM.currentView.handler.controller;
							var selectedIds = self.get('selectedMonitors');
							$.each(rowIds,function(index,graphId){
								if(allChecked){
									if(!selectedIds.contains(graphId)){
										selectedIds.pushObject(graphId);
									}
								}else{
									selectedIds.removeObject(graphId);
								}
							});
						}else if(onSelectFunction !== undefined && onSelectFunction === 'devicePartitionList'){//No I18n
							var self = window.OPM.currentView.handler.controller;
							var selectedPartitions = self.get('selectedPartitions');
							var previouslySelectedPartitions = self.get('previouslySelectedPartitions');
							if(allChecked){
								var maxPartitionAssociationUILimit = self.get('maxPartitionAssociationUILimit');
								var isValid = true;
								$.each(rowIds,function(i,id){
									var selectedPartition = grid.jqGrid('getCell',id,'2');//No I18N
									var currentRowData = grid.jqGrid('getRowData',id);//No I18N
									var dataLength = (Object.keys(currentRowData)).length-1;
									var currentStatus = grid.jqGrid('getCell',id,(dataLength.toString()));//No I18N
									if(!selectedPartitions.contains(selectedPartition)){
										if(maxPartitionAssociationUILimit !== undefined && ((selectedPartitions.length+1) > maxPartitionAssociationUILimit)){
											showParitionSelectionMessage(self);
											Ember.run.scheduleOnce('afterRender',function(){//No I18N
												grid.jqGrid('setSelection',id,false);//No I18N
											});
											isValid = false;
										}
										if(isValid){
											selectedPartitions.pushObject(selectedPartition);
										}
									}
									if('false' === currentStatus){
										grid.jqGrid('setCell',id,(dataLength.toString()),'true');//No I18N
									}
								});
							}else{
				            	$.each(rowIds,function(i,id){
									var selectedPartition = grid.jqGrid('getCell',id,'2');//No I18N
									var currentRowData = grid.jqGrid('getRowData',id);//No I18N
									var dataLength = (Object.keys(currentRowData)).length-1;
									var currentStatus = grid.jqGrid('getCell',id,(dataLength.toString()));//No I18N
									if(currentRowData !== undefined && 'object' === typeof(currentRowData)){
							            if(currentRowData[dataLength-1] === 'true' && previouslySelectedPartitions.contains(selectedPartition)){
							            	grid.jqGrid('setSelection',id,false);//No I18N
						            	}else{
											selectedPartitions.removeObject(selectedPartition);
											if('true' === currentStatus){
												grid.jqGrid('setCell',id,(dataLength.toString()),'false');//No I18N
											}
						            	}
						            }
								});
							}
						}else if(onSelectFunction !== undefined && onSelectFunction === 'credentialAssociation'){//No I18n
							if(window.OPM.userPermissions.discoveryWrite){
								var self = window.OPM.currentView.handler.controller;
								var selectedDevicesArray = self.get('selectedDevices');
								if(allChecked){
									$.each(rowIds,function(i,id){
										var selectedDevName = grid.jqGrid('getCell',id,'name');//No I18N
										if(!selectedDevicesArray.contains(selectedDevName)){
											selectedDevicesArray.pushObject(selectedDevName);
										}
									});
								}else{
									$.each(rowIds,function(i,id){
										var selectedDevName = grid.jqGrid('getCell',id,'name');//No I18N
										selectedDevicesArray.removeObject(selectedDevName);
									});
								}
							}
						}else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "ApplicationServices"){//No I18n
							if(window.OPM.userPermissions.monitoringWrite){
								var self = window.OPM.currentView.handler.controller;
								var selectedServicesArray = self.get('selectedServices');
								if(allChecked){
									$.each(rowIds,function(i,id){
										var selectedServiceId = grid.jqGrid('getCell',id,'serviceid');//No I18N
										if(!selectedServicesArray.contains(selectedServiceId)){
											selectedServicesArray.pushObject(selectedServiceId);
										}
									});
								}else{
									$.each(rowIds,function(i,id){
										var selectedServiceId = grid.jqGrid('getCell',id,'serviceid');//No I18N
										selectedServicesArray.removeObject(selectedServiceId);
									});
								}
							}
						}
                                                else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "VendorMonitor"){
							var self = window.OPM.currentView.handler.controller;
							var selectedMonitorsArray = self.get('selectedMonitors');
							var partitionDirectSelectionList = self.get('partitionDirectSelectionList');
							if(allChecked){
								var isValid = true;
								$.each(rowIds,function(i,id){
									var selectedGraphId = Number(grid.jqGrid('getCell',id,'GRAPHID'));//No I18N
									var rowContent = grid.jqGrid('getRowData',id);//No I18N
									if(!selectedMonitorsArray.contains(selectedGraphId)){
										if(self.get('allowedMonitorsCount') !== undefined && (selectedMonitorsArray.length >= self.get('allowedMonitorsCount'))){
											Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
												grid.jqGrid('setSelection',id,false);//No I18N
											});
											isValid = false;
										}else{
											selectedMonitorsArray.pushObject(selectedGraphId);
											grid.jqGrid('setCell',id,'isSelected','true');//No I18N
											grid.jqGrid('setCell',id,'testStatus','aa');//No I18N
											$.each(self.get('performanceData'),function(){
												var arrIndex = this.content.map(function(obj){return obj.GRAPHID;}).indexOf(Number(selectedGraphId));
												if(arrIndex > -1){
													this.content[arrIndex].isSelected = 'true';//No I18N
													this.selectedIds.push(selectedGraphId);
													this.selectedCount = this.selectedIds.length;
													return false;
												}
											});
										}
									}
									if(rowContent.showAddPartitionOption === 'true' && rowContent.isSelected === 'false' && self.get('graphIdVsPartitionMapping')){
										var graphIdVsPartitionMapping = Object.keys(self.get('graphIdVsPartitionMapping'));
										if(!(partitionDirectSelectionList.contains(rowContent.GRAPHID) || graphIdVsPartitionMapping.contains(rowContent.GRAPHID))){
											partitionDirectSelectionList.pushObject(rowContent.GRAPHID);
										}
									}
								});
								if(!isValid){
									showAlertInfo(false,self.get('allowedMonitorsCount'));
								}
							}else{
								$.each(rowIds,function(i,id){
									var selectedGraphId = Number(grid.jqGrid('getCell',id,'GRAPHID'));//No I18N
									var rowContent = grid.jqGrid('getRowData',id);//No I18N
									if(self.get('prevSelectedIds').contains(selectedGraphId.toString())){
										grid.jqGrid('setSelection',id,false);//No I18N
										return true;
									}
									selectedMonitorsArray.removeObject(selectedGraphId);
									grid.jqGrid('setCell',id,'isSelected','false');//No I18N
									grid.jqGrid('setCell',id,'testStatus','aa');//No I18N
									$.each(self.get('performanceData'),function(){
										var arrIndex = this.content.map(function(obj){return obj.GRAPHID;}).indexOf(Number(selectedGraphId));
										if(arrIndex > -1){
											this.content[arrIndex].isSelected = 'false';//No I18N
											this.selectedIds.splice($.inArray(selectedGraphId,this.selectedIds),1);
											this.selectedCount = this.selectedIds.length;
											return false;
										}
									});
									var graphIdString = selectedGraphId.toString();
									if(rowContent.showAddPartitionOption === 'true'){
										if(partitionDirectSelectionList && partitionDirectSelectionList.contains(graphIdString)){
											partitionDirectSelectionList.removeObject(graphIdString);
										}
									}
								});
							}
						}
						else if(onSelectFunction === "opm_rediscoverInterfaces")
						{
							if(allChecked) {
								var postData = grid.jqGrid('getGridParam', 'postData'); //No I18N
								var isSearchActive = postData && postData.filters;
								
								if(isSearchActive) {
									reDisIntJson = [];
									var allData = grid.jqGrid('getGridParam', 'data'); //No I18N
									var searchFilters = JSON.parse(postData.filters);
									allData.forEach(function(row) {
											var matchesFilter = true;
											if (searchFilters.rules) {
												for (var i = 0; i < searchFilters.rules.length; i++) {
													var rule = searchFilters.rules[i];
													var cellValue = (row[rule.field] || '').toString().toLowerCase();
													var searchValue = rule.data.toLowerCase();
													var ruleMatches = false;
													switch (rule.op) {
															case 'cn': ruleMatches = cellValue.indexOf(searchValue) !== -1; break; //No I18N
															case 'eq': ruleMatches = cellValue === searchValue; break; //No I18N
															case 'bw': ruleMatches = cellValue.indexOf(searchValue) === 0; break; //No I18N
															case 'ew': ruleMatches = cellValue.lastIndexOf(searchValue) === (cellValue.length - searchValue.length); break; //No I18N
															case 'ne': ruleMatches = cellValue !== searchValue; break; //No I18N
															default: ruleMatches = true; break;
													}
													if (!ruleMatches) {
														matchesFilter = false;
														break;
													}
												}
											}
											if (matchesFilter){
												reDisIntJson.push(row.id);
											} 
									});
								} else {
									// If no search is active, get only the currently visible rows
									reDisIntJson = [];
									var dataIds = grid.jqGrid('getDataIDs'); //No I18N
									$.each(dataIds, function(key, rowId) {
										var listId = grid.jqGrid('getCell', rowId, 'id'); //No I18N
										reDisIntJson.push(listId);
									});
								}
							} else{
								reDisIntJson = [];
							}
						}
						else if(onSelectFunction == 'VMwareEvents'){ //No I18N
							if(!allChecked){
								$("tr.jqgrow > td > input.cbox:disabled", grid[0]).prop("checked",true);//No I18n
								grid[0].p.selarrrow = grid.find("tr.jqgrow:has(td > input.cbox:checked)").map(function(){//No I18n
									return this.id;
								}).get();
							}
						}else if(onSelectFunction === "sdwanEvents"){//No I18N
						    	var isEventAssociated = grid.jqGrid('getCell', rowIds, 'ISEVENTASSOCIATED'); //No I18N
					    		if(!allChecked && isEventAssociated === "true"){
						            grid.jqGrid("setSelection",rowIds,true);//No I18N
						        }
						        else{
						        	 grid.jqGrid("setSelection",rowIds,allChecked);//No I18N
						        }
							
						}
						else if(onSelectFunction === "DT_performanceMonitorAssociation") {
							var prevSelectedMonitors = OPMClient.SettingsDeviceTemplateController.customScriptGraphIds;							
							$.each(rowIds, function(k , rowId) {
								var currentRowData = grid.jqGrid('getRowData', rowId);
								var isPrevSelected = prevSelectedMonitors && prevSelectedMonitors.contains(currentRowData.GRAPHID);
								
								if (!isPrevSelected) {
									var $checkbox = $('#jqg_' + grid[0].id + '_' + rowId);
									$checkbox.prop('checked', allChecked);
								} else {
									var $checkbox = $('#jqg_' + grid[0].id + '_' + rowId);
									$checkbox.prop('checked', true);
								}
							});
						}
						else if(onSelectFunction==='CustomFieldsTable'){
                             var gridProps = this.p;
							var rowIds = $('#SNOWCustomFieldsTable').jqGrid('getDataIDs');
							if(allChecked){
							for (var rowIter = 1; rowIter <= rowIds.length; rowIter++) {
								 var rowData1 =gridProps.data[gridProps._index[rowIter]];
			                       rowData1.cb=true;
								}
						
						}
						else{

							for (var rowIter = 1; rowIter <= rowIds.length; rowIter++) {

								 var rowData1 =gridProps.data[gridProps._index[rowIter]];
								 rowData1.cb=undefined;
							}
						}

						}
						if(onSelectFunction === "L2DevicesList")
                        			{
                        				var cbs = $("tr.isLayerDevExist > td > input.cbox:disabled", grid[0]);//No I18n
                        				cbs.prop("checked",true);//No I18n
                        			}
            				if(retainSelection){
		                    	for (var i=0;i<rowIds.length;i++){
		                        		if(allChecked){
			                    		gridSelectedRows[gridTable][rowIds[i]] = $(gridTable).jqGrid("getRowData",rowIds[i]);//No I18N
			                    	}else{
			                    		delete gridSelectedRows[gridTable][rowIds[i]];
			                    	}
		                    	}
						}
						if(onSelectFunction === 'licenseMgmtFunction') {//No I18N
							OPMClient.__container__.lookup('controller:SettingsBasicLicenseMgmt').send('enableDisableActions');//No I18N
						}
						else if(onSelectFunction === 'licenseExceedFunction') {
							enableDisableLicenseActions(gridTable);
						}
						if(onSelectFunction === "opm_DevNGlobalProfileList") {
							if(!allChecked) {
								$("tr > td > input.cbox:disabled", grid[0]).prop("checked",true);//No I18n
							}
						}
						if(onSelectFunction === "fileIntegritySettingsList"){
         					var settingsRowCount = $("#FileIntegritySettingsList").jqGrid('getGridParam','selarrrow'); //No I18N
		 					if(settingsRowCount.length > 0){
		 						$('#externalFilesActionId').removeClass('jiraBlur');
		 					}else{
		 						$('#externalFilesActionId').addClass('jiraBlur');
		 					}
		 				}
		 				if(onSelectFunction === "fileIntegrityReportsList"){
		 					var reportsRowCount = $("#FileIntegrityReportsList").jqGrid('getGridParam','selarrrow'); //No I18N
		 					if(reportsRowCount.length > 0){
		 						$('#externalFilesActionIdInReport').removeClass('jiraBlur');
		 					}else{
		 						$('#externalFilesActionIdInReport').addClass('jiraBlur');
		 					}
		 				}
						 if(onSelectFunction === "interfaceDiscoveredData"){
							var isEnabled = $(".importIntfBtn.addIntfBtn").prop("disabled"); //No I18N
							if(!isEnabled){
								return true;
							}else{
								$(".importIntfBtn.addIntfBtn").prop("disabled", false); //No I18n
								$('.importIntfBtn.addIntfBtn').css('opacity', '1'); //No I18n
							}
						}
						if(onSelectFunction === "opm_DevNGlobalProfileList"){
							grid.find("tr").each(function () {
								var checkBoxId = "#jqg_opm_DevNGlobalProfileList_" + $(this).attr("id"); //No I18n
								if($(this).hasClass("onlyGreyOut")) {
									$(checkBoxId).prop("checked", false);
									$(this).removeClass("ui-state-highlight");
									$(this).attr("aria-selected", false);
								}
								
							});
						}
						if(onSelectFunction === "wanIPLinkList")
						{
							wanLinksByCSV = [];
							if(allChecked) {
								$.each(rowIds,function(i,id){
									var siteName = grid.jqGrid('getCell', id, 'wanLinkSiteName'); //No I18N
									var ip = grid.jqGrid('getCell', id, 'targetIP'); //No I18N	
									var displayName = grid.jqGrid('getCell', id, 'displayName'); //No I18N
									var obj = {};
									obj.wanLinkSiteName = siteName;
									obj.targetIP = ip;
									obj.displayName = displayName;
									wanLinksByCSV.pushObject(obj);
								});
							}else{
								wanLinksByCSV = [];
							}
						}

						// Common jqgrid onSelectAll handling
						if(defaultOptions.onSelectAll && typeof defaultOptions.onSelectAll == "function"){//No I18n
							defaultOptions.onSelectAll(rowIds, allChecked);
						}
					},
					subGridOptions:
					{
						"plusicon"  : "ui-icon-triangle-1-e",//No I18N
						"minusicon" : "ui-icon-triangle-1-s", //No I18N
						"openicon"  : "ui-icon-arrowreturn-1-e", //No I18N
						"reloadOnExpand" : reloadOnExpand, //No I18N
						"selectOnExpand" : selectOnExpand //No I18N
					},
					subGridBeforeExpand: function(subgrid_id, row_id)
					{
						if(defaultOptions.lastExpandedRowID !== undefined) {
							grid.collapseSubGridRow(defaultOptions.lastExpandedRowID);
						}
					},
					subGridRowColapsed:function(subgrid_id, row_id){
						if(onSelectFunction ==="widgetList" || onSelectFunction==="APM_v3MonitorsList" || onSelectFunction==="CustomWidget"){
							dashcallbackNew(gridTableIdAlone);
						}
					},
					subGridRowExpanded: function(subgrid_id, row_id)
					{
						var subgrid_table_id = subgrid_id+"_t"; //No I18N
						var subgrid_table1_id = subgrid_id+"_t1"; //No I18N
						var subgrid_table2_id = subgrid_id+"_t2"; //No I18N

						var choice =defaultOptions.subGridFunction;
						$("#"+subgrid_id).addClass('opm_jqGridUI');
						var tableHtml ="<table id='"+subgrid_table_id+"'></table>";
						$("#"+subgrid_id).html(tableHtml);
						switch(choice)
						{
						case "notifyProfileList": //No I18N
							defaultOptions.colModels[4] = { name: 'actions', index: 'actions',formatter:notificationActionsSubGrid,width:25}; //No I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.data[row_id-1].subProfiles, defaultOptions.colNames, defaultOptions.colModels, "", "", "",""); //No I18N
							$(".ui-jqgrid-hdiv", "#gbox_" +subgrid_table_id).hide();
							break;
						case "nfaCbqosSubGrid":  //No I18N
							defaultOptions.lastExpandedRowID = row_id;
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].classes, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "",defaultOptions.onselectfunction,{'snapId':defaultOptions.snapId,'policy':defaultOptions.Data[row_id-1].policy,'parentclass':defaultOptions.Data[row_id-1].parentclass}); //No I18N
							$("#"+subgrid_table_id).addClass('ut ut-Grid'); 
							break;
//						case "nfaTopSitesSub": //No I18N
//							var appName = grid.jqGrid('getCell', row_id, 'Name');//NO I18N 
//							var subGridData = defaultOptions.Data[appName];
//							defaultOptions.lastExpandedRowID = row_id;
//							if(subGridData != undefined && subGridData != null) {
//								opm_loadJQgridWithData("#"+subgrid_table_id,subGridData, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",{sortName:"1",sortOrder:"desc",minRowsPerPage:subGridData.length}); //No I18N
//								$("#"+subgrid_table_id).addClass('ut ut-Grid').trigger('reloadGrid');
//							}
//							break;
						case "nfaGeolocationSub": //NO I18N
						case "nfaTopSrcDstGeoLocSub":  //No I18N
							var location = grid.jqGrid('getCell', row_id, 'Name'); //No I18N
							//defaultOptions.lastExpandedRowID = row_id;
							if(location == 'Others') {return;} //No I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[location], defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", defaultOptions.onselectfunction,{'snapId':defaultOptions.snapId,minRowsPerPage:defaultOptions.Data[location].length}); //No I18N
							$("#"+subgrid_table_id).addClass('ut ut-Grid'); 
							break;
						case "nfaTopQosSub":  //No I18N
							var subGridData = defaultOptions.Data[row_id-1].subApp;
							opm_loadJQgridWithData("#"+subgrid_table_id,subGridData, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",{"minRowsPerPage":subGridData.length}); //No I18N
							// defaultOptions.lastExpandedRowID = row_id;
							$("#"+subgrid_table_id).addClass('ut ut-Grid');
							$('#'+subgrid_table_id).setGridParam({sortname:'1',sortorder:'desc'}).trigger('reloadGrid');
							break;
						case "devGrpList": //No I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].dev, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",""); //No I18N
							break;
						case "fwaProtocolSubList": //No I18N
							var proGroupName = grid.jqGrid('getCell', row_id, 'proGroupName'); //No I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[proGroupName], defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "fwaProtocolSubList",""); //No I18N
							break;
						case "intfGrpList": //No I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].Asso_Device, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",""); //No I18N
							break;
						case "IPGroupList": //No I18N
							var GroupName =$("#NFAList").getRowData(row_id).Name; 
							var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/nfaipgroup/listIPGroup?GroupName="+GroupName); //No I18N
							if(jsonData.IPGroup_List[0].dstip != undefined && jsonData.IPGroup_List[0].dstip.length > 0){
								defaultOptions.colModelList[0].hidden = true;
								defaultOptions.colModelList[1].hidden = false;
								defaultOptions.colModelList[2].hidden = false;
							}else{
								defaultOptions.colModelList[0].hidden = false;
								defaultOptions.colModelList[1].hidden = true;
								defaultOptions.colModelList[2].hidden = true;
							}
							var DOptions={};
							DOptions.rowNumNeeded=false;
							opm_loadJQgridWithData("#"+subgrid_table_id, jsonData.IPGroup_List, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "",DOptions); //No I18N
							break;
						case "SSIDGroupList": //No I18N
							var GroupID = $("#NFAList").getRowData(row_id).ID; //No I18n
							$.ajax({
								url: window.OPM.apiUrlPattern + "/nfaadmin/listSSIDGroup", //No I18n
								type: "GET", //No I18n
								dataType: "json", //No I18n
								data: {"GroupID":GroupID}, //No I18n
								async: false,
								beforeSend: function(XMLHttpRequest,settings) {
					                appendCollectorDetails(XMLHttpRequest, settings);
					            },
					            success: function(jsonData){
					            	opm_loadJQgridWithData("#"+subgrid_table_id, jsonData.Group_List, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",""); //No I18N
					            }
							});
							break;
						case "nfaSNMPSchedulerListSubGrid": //NO I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.data[row_id-1].snmpStatus, defaultOptions.colNamesList, defaultOptions.colModelList); //No I18N
							break;
						case "fwaStandardObjDetail": //No I18N
							if(defaultOptions.Data[row_id-1].subGridData != undefined){
								var subgridOptions = {"subGridFunction":"fwaSubGridStandardObjDetail"};//NO I18N
								subgridOptions.minRowsPerPage = 10;
								opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].subGridData, defaultOptions.colNamesList, defaultOptions.colModelList ,"", "", "",subgridOptions); //No I18N
								$("#"+subgrid_table_id+' .ui-jqgrid-hdiv').hide();
							}

							break;
						case "nfaLicenseGrid": //NO I18N
							var sub_grid_data = grid.jqGrid("getLocalRow",row_id).interfaceList; //NO I18N
							defaultOptions.colNamesList[3] = Ember.I18n.t((grid.jqGrid("getLocalRow",row_id).isWlc) ? "webclient.general.accesspoints.tab":"NFAWidget.routVia"); //NO I18N
							nfa_loadJQgridWithData("#"+subgrid_table_id, sub_grid_data, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "", {minRowsPerPage:sub_grid_data.length,pagination:false}); //NO I18N
							break;
						case "nbaLicenseGrid": //NO I18N
							var sub_grid_data = grid.jqGrid("getLocalRow",row_id).interfaceList; //NO I18N
							nfa_loadJQgridWithData("#"+subgrid_table_id, sub_grid_data, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "", {minRowsPerPage:sub_grid_data.length,pagination:false}); //NO I18N
							break;
						case "nbaThresholdGrid": //NO I18N
							var sub_grid_data = grid.jqGrid("getLocalRow",row_id).childList; //NO I18N
							nfa_loadJQgridWithData("#"+subgrid_table_id, sub_grid_data, defaultOptions.colNamesList, defaultOptions.colModelList, "", "", "nbaAdvSettingsGrid", {minRowsPerPage:sub_grid_data.length,pagination:false}); //NO I18N
							break;
						case "intfList": //No I18N
							$("#"+subgrid_id).append("<table id='"+subgrid_table1_id+"'></table><table id='"+subgrid_table2_id+"'></table>");
							var defOpts1 = {"planID":defaultOptions.Data[row_id-1].planid,"type":defaultOptions.Data[row_id-1].type};//No I18N  
							if(defaultOptions.Data[row_id-1].intfList.length!==0) {
								opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].intfList, defaultOptions.colNamesList1, defaultOptions.colModelList1 ,"", "", "billingInterfaceOnDemandReport",defOpts1); //No I18N
							}
							if(defaultOptions.Data[row_id-1].ipgList.length!==0) {
								opm_loadJQgridWithData("#"+subgrid_table1_id, defaultOptions.Data[row_id-1].ipgList, defaultOptions.colNamesList2, defaultOptions.colModelList2 , "", "", "billingIPGroupOnDemandReport",defOpts1); //No I18N
							}
							if(defaultOptions.Data[row_id-1].bussList.length!==0) {
								opm_loadJQgridWithData("#"+subgrid_table2_id, defaultOptions.Data[row_id-1].bussList, defaultOptions.colNamesList3, defaultOptions.colModelList3 , "", "", "billingIntfGroupOnDemandReport",defOpts1); //No I18N
							}
							break;
						case "billRepList": //No I18N
							defaultOptions.colNamesList1[5]=htmlEncode(defaultOptions.Data[row_id-1].percHead);
							defaultOptions.colNamesList1[11]="";
							defaultOptions.colNamesList1[12]="";
							defaultOptions.colNamesList1[13]="";
							defaultOptions.colNamesList1[14]="";
							defaultOptions.colNamesList1[15]=""; //NO I18N
							defaultOptions.colNamesList1[16]=""; //NO I18N
							defaultOptions.colModelList1[11]={ name: "devPercText", index: "devPercText",hidden:true,formatter:function(){return htmlEncode(defaultOptions.Data[row_id-1].percHead);}}; //No I18N
							defaultOptions.colModelList1[12]={ name: "baseCostStr", index: "baseCostStr",hidden:true,formatter:function(){return htmlEncode(defaultOptions.Data[row_id-1].baseCostStr);}}; //No I18N
							defaultOptions.colModelList1[13]={ name: "addCostStr", index: "addCostStr",hidden:true,formatter:function(){return htmlEncode(defaultOptions.Data[row_id-1].addCostStr);}}; //No I18N
							defaultOptions.colModelList1[14]={ name: "percText", index: "percText",hidden:true,formatter:function(){return htmlEncode(defaultOptions.Data[row_id-1].updown);}}; //No I18N
							defaultOptions.colModelList1[15]={ name: "usageCost", index: "usageCost", hidden:true}; //NO I18N
							defaultOptions.colModelList1[16]={ name: "percentile", index: "percentile", hidden:true}; //NO I18N
							var subgridOptions = {};
							subgridOptions.minRowsPerPage = 10;
							subgridOptions.searchOption = false;
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].dev, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "BillReportSubGrid",subgridOptions); //No I18N
							break;
						case "schList"://No I18N
							$.ajax({
								url:window.OPM.apiUrlPattern+"/nfasch/getScheduleReportList", //NO I18N
								type:'GET', //No I18N
								data:{
									"schName":$("#scheduleList").getRowData(row_id).name, //NO I18N
									"schID":row_id //NO I18N
								},
								success:function(repList) {
									var colNamesList = [Ember.I18n.t("webclient.billing.reportTime")]; //NO I18N
									var colModelList = [{ name:"name",index:"name",classes:"pointer"}]; //NO I18N
									var defaultOptions = {};
									defaultOptions.subGrid = true;
									defaultOptions.colNamesList1 = ["",Ember.I18n.t("webclient.appmanager.reports")]; //NO I18N
									defaultOptions.colModelList1 = [
										{name:1, index:1, hidden:true}, //NO I18N
										{name:0, index:0, formatter:OPMClient.Reports.schReportLink} //NO I18N
									];
									defaultOptions.subGridFunction = "schRepList"; //NO I18N
									defaultOptions.Data = repList;
									opm_loadJQgridWithData("#"+subgrid_table_id,repList,colNamesList,colModelList,"","","nfaSchSubList",defaultOptions); //NO I18N
								}
							});
							break;
						case "schRepList": //NO I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].Dev, defaultOptions.colNamesList1, defaultOptions.colModelList1,"","","",""); //NO I18N
							break;
						case "nfaProfileList"://No I18N
								var parentRow = grid.jqGrid("getCell",row_id,"name"); //NO I18N
								var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern+"/nfareportProfile/getRepProfileInfo?profileID="+row_id); //NO I18N
								var colNamesList = [Ember.I18n.t("webclient.reports.header"),"",""]; //NO I18N
								var colModelList = [
									{name:"reportType", index:"reportType",	formatter:OPMClient.Reports.subProfileReports}, //NO I18N
									{name:"parentRow",	index:"parentRow",	hidden:true}, //NO I18N
									{name:"id",			index:"id", 		hidden:true} //NO I18N
								];
								var tabledata = [];
								response[0].reptype.forEach(function(index,item){
									var strToArr = {'reportType':'','parentRow':'','id':''};//NO I18N
									strToArr.reportType = index;
									strToArr.parentRow = parentRow;
									strToArr.id = row_id;
									tabledata.push(strToArr);
								});
								opm_loadJQgridWithData("#"+subgrid_table_id,tabledata,colNamesList,colModelList,"","","",{searchOption:false}); //No I18N
							break;
						case "APMMonitorTreeViewSubGrid"://No I18N
								var groupId = grid.jqGrid("getCell",row_id,"RESOURCEID");//NO I18N
								var url = "";
								var data = {};
								if(window.OPM.isEmbed)
								{
									url = "/embedWidget";//NO I18N
									data.type = window.OPM.Embedtype;
									data.authKey = window.OPM.authKey;
									data.apiKey = "EmbedView";//NO I18N
									if(window.OPM.Embedtype === 'cctv'){//NO I18N
										data.cctvID = window.OPM.cctvID;
									}
								}else{
									url = window.OPM.apiUrlPattern+"/v2/dashboard/getWidgetData";//NO I18N
								}
								
								data.widgetID = defaultOptions.widgetID;
								data.monitorGroupId = groupId;
								var response = opm_ajaxGetResponse(url,data);
								var subGridResp = [];
								if(response[defaultOptions.widgetID]!==undefined && response[defaultOptions.widgetID].WidgetData!==undefined && response[defaultOptions.widgetID].WidgetData.length>0){
									if(response[defaultOptions.widgetID].WidgetData[0].SubMonitorGroup!==undefined){
										var subGrpsList = JSON.parse(response[defaultOptions.widgetID].WidgetData[0].SubMonitorGroup);
										for(var i=0;i<subGrpsList.length;i++)
										{
											subGrpsList[i].subGridStatus = true;
										}
										subGridResp = subGrpsList;
									}
									if(response[defaultOptions.widgetID].WidgetData[0].Monitors!==undefined){
										var monitorsList = JSON.parse(response[defaultOptions.widgetID].WidgetData[0].Monitors);
										for(var i=0;i<monitorsList.length;i++)
										{
											monitorsList[i].subGridStatus = false;
										}
										subGridResp = subGridResp.concat(monitorsList);
									}
																	
								}								
								var subgridOptions = {subGrid:true,widgetID:defaultOptions.widgetID,subGridFunction:"APMMonitorTreeViewSubGrid",colNamesList:defaultOptions.colNamesList,colModelList:defaultOptions.colModelList};//No I18N
								subgridOptions.gridCallBack = function(gridTableIdAlone){	
									gridWidthAlignment(gridTableIdAlone);
								};
								opm_loadJQgridWithData("#"+subgrid_table_id,subGridResp, defaultOptions.colNamesList, defaultOptions.colModelList ,"", "", "APM_v3MonitorsList",subgridOptions); //No I18N
							break; 
						case "verticalBarGrid"://No I18N
							var subgridOptions = {};
//							subgridOptions.minRowsPerPage = 10;
							subgridOptions.searchOption=true;
							subgridOptions.toggleSearch=true;
							if(defaultOptions.timePeriod != undefined){
								subgridOptions.timePeriod=defaultOptions.timePeriod;
							}
							if(defaultOptions.subGridOnselectFunction != undefined){
								opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].subGridData, defaultOptions.colNamesList, defaultOptions.colModelList ,"", "", defaultOptions.subGridOnselectFunction,subgridOptions); //No I18N		
							}else{
								opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].subGridData, defaultOptions.colNamesList, defaultOptions.colModelList ,"", "", "",subgridOptions); //No I18N
							}
							break;
						case "Ncmdevicetype"://No I18N
							var deviceType = grid.jqGrid('getCell', row_id, 'devicetypeParam'); //No I18N
							var osType = grid.jqGrid('getCell', row_id, 'OsType'); //No I18N
							var osVersion = grid.jqGrid('getCell', row_id, 'OsVersion'); //No I18N
							var defaultGridOpts = {noPaginationShowAll:true,isNCM: true};
							$.ajax({
								url:window.OPM.apiUrlPattern + "/ncmreports/getFirmwareInvInnerData?DEVICE_TYPE="+encodeURIComponent(deviceType)+"&OSTYPE="+encodeURIComponent(osType)+"&OSVERSION="+encodeURIComponent(osVersion)+"&DG_ID="+$('#DEVICEGROUPS option:selected').val(), //No I18N
								type:'GET', //No I18N
								success:function(repList){
									opm_loadJQgridWithData("#"+subgrid_table_id, repList.rows,defaultOptions.colNamesList,defaultOptions.colModelList, "", "", "",defaultGridOpts); //No I18N
								}
							});
							break;
						case "NcmdeviceTypeIP"://No I18N
							var deviceType = grid.jqGrid('getCell', row_id, 'devicetypeParam'); //No I18N
							var model = grid.jqGrid('getCell', row_id, 'Model'); //No I18N
							var series = grid.jqGrid('getCell', row_id, 'Series'); //No I18N
							var defaultGridOpts = {noPaginationShowAll:true,searchOption: true,toggleSearch:false,isNCM: true};
							
							$.ajax({
								url:window.OPM.apiUrlPattern + "/ncmreports/getDeviceInvInnerData?DEVICE_TYPE="+encodeURIComponent(deviceType)+"&MODEL="+encodeURIComponent(model)+"&SERIES="+encodeURIComponent(series)+"&DG_ID="+$('#DEVICEGROUPS option:selected').val(), //No I18N
								type:'GET', //No I18N
								success:function(repList){
									opm_loadJQgridWithData("#"+subgrid_table_id, repList.rows,defaultOptions.colNamesList,defaultOptions.colModelList, "", "", "",defaultGridOpts); //No I18N
								}
							});
							break;
						case "nfaDevicesTree": //NO I18N
							var routerID = grid.jqGrid("getCell",row_id,"ID"); //NO I18N
							var wlcStatus = grid.jqGrid("getCell",row_id,"wlcStatus"); //NO I18N
							$("#opm_Devices").jqGrid("resetSelection"); //NO I18N

							if(wlcStatus==1) {
								loadNFAWlcDeviceTree(routerID,subgrid_table_id);
								return;
							}
							if(grid.jqGrid("getCell",row_id,"IntfCount") < 1) { //NO I18N
								return;
							}
							nfa_loadInvDeviceTree(routerID,subgrid_table_id,(wlcStatus === "4")); //NO I18N
							break;
						case "wolGroupSubgrid"://No I18N
							var groupId = grid.jqGrid('getCell', row_id, 'group-id'); //No I18N
							if(grid.jqGrid('getCell', row_id, 'device-count') < 1) { //No I18N
								return;
							}
							var url = window.OPM.apiUrlPattern + '/wol/getWOLDevices?groupId='+groupId;//No I18N
							$.ajax({
								url: url,
								dataType: 'json',//No I18N
								type: 'GET',//No I18N
								async:false,
								success: function(response)
								{	
									colNamesList = ['resource-id',Ember.I18n.t('opu.views.IP_ADDRESS', this),Ember.I18n.t('opu.views.DNS_NAME', this),Ember.I18n.t('opu.views.MAC_ADDRESS', this),Ember.I18n.t('opu.views.STATUS', this),Ember.I18n.t('opu.wol.last_wake_on_time', this),Ember.I18n.t('opu.views.REMARKS',this)];//No I18N
									colModelList = [{name: 'resource-id', index: 'resource-id', hidden:true},//No I18N
										{name: 'ip-address', index: 'ip-address', width: 60, sortable: true, sorttype: 'text',classes:'pointer'}, //No I18N
										{name: 'dns-name', index: 'dns-name', sortable: true, sorttype: 'text', width: 80,classes:'pointer' }, //No I18N
										{name: 'mac-address', index: 'mac-address', width: 60, sortable: true, sorttype: 'text',classes:'pointer'}, //No I18N
										{name: 'status', index: 'status',formatter:opu_WOLStatusColorIcon, width: 40, sortable: true, sorttype: 'text',classes:'pointer'}, //No I18N
										{name: 'last-scan-time', index: 'subnet-mask', sortable: true, sorttype: 'text', width: 100,classes:'pointer' }, //No I18N
										{name: 'last-update-time', index: 'last-update-time', width: 60, sortable: true, sorttype: 'text',classes:'pointer'} //No I18N
									];
									var gridData = [];
									if(response.result !== undefined) {
										gridData = response.result;
									}
									var defaultOptions = {minRowsPerPage:gridData.length,pagination:false};
									opm_loadJQgridWithData("#"+subgrid_table_id,gridData,colNamesList,colModelList, "", "", "",defaultOptions); //No I18N
								}
							});
							break;
						case "nfaWlcDevicesTree"://No I18N
							$("#opm_Devices").jqGrid("resetSelection"); //NO I18N
							loadNFAWlcDeviceTree(grid.jqGrid("getCell",row_id,"ID"),subgrid_table_id); //NO I18N
							break;
						case "DEConfigChangeTrendInnerData"://No I18N

							var datefromGrid = grid.jqGrid('getCell', row_id, 'DATE'); //No I18N
							var startTimeTimestamp=(new Date(datefromGrid)).getTime();
							var endTime = new Date(datefromGrid); // To make it to midnight of today
							endTime.setHours( 23 );
							endTime.setMinutes( 59 );
							endTime.setSeconds( 59 );
							var endTimeTimestamp=(new Date(endTime)).getTime();
							var timeDuration=startTimeTimestamp+","+endTimeTimestamp;
							var timeDurationId=startTimeTimestamp+"_"+endTimeTimestamp;
							$("#"+subgrid_id).addClass('opm_jqGridUI');
							var tablesHtml ="<table id='DEChangeTrendInnerReport_"+timeDurationId+"'></table>";
							$("#"+subgrid_id).html(tablesHtml);
							var dgId=$('#DEVICEGROUPS').val();
							var defOpts = {"Data":"","subGrid":true,"subGridFunction":"DEChangesReport","timeDuration":timeDuration,noPaginationShowAll:true}; //No I18N
							populateRemoteGridDuplicateId("DEChangeTrendInnerReport_"+timeDurationId, "DEChangeTrendInnerReport","&TIME_DURATION="+timeDuration+"&DG_ID="+dgId, "", "DEConfigChangeTrendInnerList", defOpts); //No I18N
							break;
							
						case "VirtualEntityStorageReport"://No I18N
							var subgridOptions = {};
							subgridOptions.minRowsPerPage = 10;
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].ChildLists, defaultOptions.colNamesList, defaultOptions.colModelList ,"", "", "",subgridOptions); //No I18N
							break;
						case "windowsADSelectedGroups": //NO I18N
							if(defaultOptions.Data[row_id-1].SELECTEDGROUPS != undefined && defaultOptions.Data[row_id-1].SELECTEDGROUPS.length != 0){
								opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].SELECTEDGROUPS, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "windowsADSelectedGroups","",""); //NO I18N
							}
							break;

						case "nfa_configureCBQoS_expand": //NO I18N
						case "nfa_configureNBAR_expand": //NO I18N
							var dOptions = grid.jqGrid('getGridParam','defaultOptions'); //No I18N
							var defaultSubGridOptions = {};
							var intfData = [];
							var routerID = dOptions.Data.deviceDetails[row_id-1].RouterID;
							if(dOptions.Data.intfDetails[routerID].length == 1 && dOptions.Data.intfDetails[routerID][0].error != undefined){
								defaultSubGridOptions.noDataText = dOptions.Data.intfDetails[routerID][0].error;
							}else{
								intfData = dOptions.Data.intfDetails[routerID];
								defaultSubGridOptions.minRowsPerPage = intfData.length;
								defaultSubGridOptions.pagination = false;
							}
							defaultSubGridOptions.skipNameEscapeCheck=true;
							opm_loadJQgridWithData("#"+subgrid_table_id, intfData, dOptions.columnName, dOptions.columnModel, "", "", "", defaultSubGridOptions, ""); //NO I18N
							(subgrid_table_id.indexOf("CBQoS") != -1) ? $("#nfaCBQoSList").jqGrid("setSelection", row_id, false) : $("#nfaNBARList").jqGrid("setSelection", row_id, false);
							nfa_qosNbarPollingCheckBoxEvent();
							if(($("#"+subgrid_table_id+" input[class=qosNbarCBox]:checked").length == $("#"+subgrid_table_id+" .qosNbarCBox").length) && defaultSubGridOptions.noDataText == undefined){ //NO I18N
					            $("#"+subgrid_table_id).closest("#gview_"+subgrid_table_id).find(".qosNbarPollingEnableCheckBox").addClass("checked"); //NO I18N
					        }
							break;
						case "nfaFlowTemplateSub": //NO I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].fieldInfo, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "", {noPaginationShowAll: true}, ""); //NO I18N
							break;
						case "opmWLCAccesspointsList": //NO I18N
							var ssidName = grid.jqGrid('getCell', row_id, 'displayName');//NO I18N 
							var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
							var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/wireless/getClientDetails",{'deviceName':deviceName,'ssidName':ssidName}); //No I18N
							if(response != undefined && response != null) {
								opm_loadJQgridWithData("#"+subgrid_table_id,response, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",{"sortName":"ClientCount","sortOrder":"desc",'minRowsPerPage':100,'searchOption':true,'toggleSearch':false,headertitles:true},""); //No I18N
								$("#"+subgrid_table_id).addClass('ut ut-Grid').trigger('reloadGrid');
							}
							//$("#"+subgrid_table_id).jqGrid('setGridWidth',$("#widgetElement_"+defaultOptions.snapId).width()-100,true);//No I18N
							var gridH = $('#gbox_opm_DeviceSnapList'+defaultOptions.snapId).height()+30;//No I18N
							var cellCount = Math.ceil((gridH+42)/22);
							$("#widgetElement_"+defaultOptions.snapId).attr("data-gs-height",cellCount);//No I18N
							break;
						case "WLCSitesVSChildListSubGrid": //NO I18N
							var siteMoid = grid.jqGrid('getCell', row_id, 'siteMoid');//NO I18N 
							var moID = OPMClient.InventoryDeviceDetailsController.moID;
							var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/wireless/getWLCSiteDetails",{'moID':moID,'siteID':siteMoid}); //No I18N
							if(response != undefined && response != null) {
								opm_loadJQgridWithData("#"+subgrid_table_id,response, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",{noPaginationShowAll:true},""); //No I18N
								$("#"+subgrid_table_id).addClass('ut ut-Grid').trigger('reloadGrid');
								$("#gbox_"+subgrid_table_id).addClass('opmWlcSiteSubGrid');//No I18N
							}
							var gridH = $('#gbox_opm_DeviceSnapList'+defaultOptions.snapId).height()+30;//No I18N
							var cellCount = Math.ceil((gridH+42)/22);
							$("#widgetElement_"+defaultOptions.snapId).attr("data-gs-height",cellCount);//No I18N
							break;
						case "opmMerakiAccesspointsList": //NO I18N
							var networkName = grid.jqGrid('getCell', row_id, 'networkMOName');//NO I18N 
							var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
							var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/wireless/getMerakiClientsForNetwork",{'deviceName':deviceName,'networkMOName':networkName}); //No I18N
							if(response != undefined && response != null) {
								opm_loadJQgridWithData("#"+subgrid_table_id,response, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "",{"sortName":"1","sortOrder":"desc","minRowsPerPage":response.length,'searchOption':true,'toggleSearch':false},""); //No I18N
								$("#"+subgrid_table_id).addClass('ut ut-Grid').trigger('reloadGrid');
							}
							break;
						case "kempVSChildListSubGrid": //NO I18N
							var vsMoId = grid.jqGrid('getCell', row_id, 'moId');//NO I18N 
							var subVsData = {'vsMoId':vsMoId,'deviceName':OPMClient.InventoryDeviceDetailsController.deviceName};//No I18N
							if(window.OPM.isCentralServer){
								subVsData.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
							}
							var subresponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/device/getKempSubVSList",subVsData); //No I18N
							if(defaultOptions.colModelList1!==undefined && defaultOptions.colModelList1[5]!==undefined)
							{
								defaultOptions.colModelList1[5].hidden = !(OPMClient.ApplicationController.showSuppressAlarm);
							}
							opm_loadJQgridWithData("#"+subgrid_table_id,subresponse,defaultOptions.colNamesList1,defaultOptions.colModelList1, "", "", "",{'searchOption':false},""); //No I18N
							$("#"+subgrid_table_id).jqGrid('setGridWidth',$("#widgetElement_"+defaultOptions.snapId).width()-100,true);//No I18N
							var gridH = $('#gbox_opm_DeviceSnapList'+defaultOptions.snapId).height()+30;//No I18N
							var cellCount = Math.ceil((gridH+42)/22);
							$("#widgetElement_"+defaultOptions.snapId).attr("data-gs-height",cellCount);//No I18N
							break;
						case "nfaGeolocationReportSub":  //NO I18N
							var location = grid.jqGrid("getCell", row_id, "Name"); //NO I18N
							if(location === "Others"){return;} //NO I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[location], defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "", {noPaginationShowAll: true}); //NO I18N
							$("#"+subgrid_table_id).addClass("ut ut-Grid"); 
							break;
						case "flowInterfacesForLicense": //No I18n
							var subGridOptions = {minRowsPerPage: 25, multiselect: true};
							defaultOptions.colNamesList1[0] = (grid.jqGrid("getLocalRow",row_id).isWlc) ? Ember.I18n.t("webclient.general.accesspoints.tab") : Ember.I18n.t("NFAWidget.routVia"); //NO I18N
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].interfaceList, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "flowInterfacesForLicenseFun", subGridOptions); //NO I18N
							$("#cb_"+$('#' + subgrid_table_id)[0].id).hide()
							break;
						case "probeUploadPrecheckFail": //No I18n
							var gridData = $('#upgradeInfo_table').jqGrid('getGridParam', 'data');
							var rowIndex = gridData.findIndex(function(row) {
								return row_id == row._id_
							});
							var serverID = gridData[rowIndex].SERVERID;
							var serverMode = gridData[rowIndex].SERVERMODE;
							var subGridOptions = {minRowsPerPage: 25, serverID: serverID, storeDefaultOptions: true};
							var data = {
								contextID: serverID,
								serverMode: serverMode
							}
							var failureResponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/ShowUpgradeHealthCheckFailure", data); //No I18n
							opm_loadJQgridWithData("#"+subgrid_table_id, failureResponse.gridData, defaultOptions.colNamesForFail, defaultOptions.colModelForFail, "", "", "", subGridOptions); //NO I18N
							break;
						case "subgridForDeviceCount": //No I18n
							defaultOptions.colNamesList1 = [Ember.I18n.t("webclient.attacks.criteria.resource"),Ember.I18n.t("webclient.fwa.used"), Ember.I18n.t("webclient.msp.customer.allocated"),""]; //No I18n
							defaultOptions.colModelList1 = [
								{name: 'displayName', index: 'displayName',width:'30', search: false}, //No I18n
								{name: 'addedCount', index: 'addedCount',width:'30',sorttype:'int',formatter:function(cellValue, options, rowdata, action){ return rowdata.isLimitExceed ? '<span class="text-red">'+opm_escapeHTML(rowdata.addedCount)+'</span>': opm_escapeHTML(rowdata.addedCount); }, search: false},//No I18N
								{name: 'allocatedCount', index: 'allocatedCount',width:'30', search: false,sorttype:'int',hidden: !defaultOptions.Data[row_id-1].isAllocationEnabled},//No I18N
								{name: 'isLimitExceed', index: 'isLimitExceed', hidden: true} //No I18n
							]
							var subGridOptions = {minRowsPerPage: 25,searchOption:false};
							opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].elementDetails, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "", subGridOptions); //NO I18N
							$("#cb_"+$('#' + subgrid_table_id)[0].id).hide();
							break;
						case "apsForLicense": //No I18n
							var subGridOptions = {minRowsPerPage: 25, multiselect: true};
							var data = grid.jqGrid ('getCell', row_id, 'name'); //No I18n
							var postObj = {deviceName: data};
							if(defaultOptions.page === 'licenseExceed') {
								postObj.isManaged = true;
							}
							var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/wireless/getDiscoveredAPsInWLC", postObj); //No I18N
							if(response != undefined && response != null) {
								opm_loadJQgridWithData("#"+subgrid_table_id,response, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", onSelectFunction, subGridOptions); //No I18N
								$("#"+subgrid_table_id).addClass('ut ut-Grid').trigger('reloadGrid');
							}
							break;
							case "elementsPurchased": //No I18n
								var subGridOptions = {minRowsPerPage: 25, multiselect: false};
								var addonID = grid.jqGrid ('getCell', row_id, 'addonID'); //No I18n
								var path = grid.jqGrid ('getCell', row_id, 'path'); //No I18n
								var response = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/admin/getProbeComponentUsageDetails?licenseComponent=" + addonID); //No I18N
								if(response != undefined && response != null) {
									response = response.map(function(obj) {
										return $.extend({}, obj, {path: path});
									})
									opm_loadJQgridWithData("#"+subgrid_table_id,response, defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "", subGridOptions); //No I18N
									$("#"+subgrid_table_id).addClass('ut ut-Grid').trigger('reloadGrid');
								}
								break;
							case "nfa_loadCloudProfilesSubGrid": //NO I18N
								var profileID = grid.jqGrid("getCell", row_id, "id"); //NO I18N
								opm_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[profileID], defaultOptions.colNamesList1, defaultOptions.colModelList1, "", "", "", {noPaginationShowAll: true}); //NO I18N
								break;
							case "SDWANSitesVSChildListSubGrid": //NO I18N
								var siteID = grid.jqGrid('getCell', row_id, 'siteMOID');//NO I18N 
								var subVsData = {"siteMOID":siteID};//No I18N
								if(defaultOptions.isDashboardWidget){
									subVsData.sdwanID = grid.jqGrid('getCell', row_id, 'sdwanID'); //No I18N
								}else{
									subVsData.sdwanID = OPMClient.InventoryDeviceDetailsController.moID;
								}
								if(window.OPM.isCentralServer && !defaultOptions.isDashboardWidget){
									subVsData.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
								}
								var subresponse = opm_ajaxGetResponse(window.OPM.apiUrlPattern + "/v2/device/getSDWANSiteDevices",subVsData); //No I18N
								opm_loadJQgridWithData("#"+subgrid_table_id,subresponse,defaultOptions.colNamesList1,defaultOptions.colModelList1, "", "", "",{'searchOption':true,"onSelectFunction":"sdwanSitesGrid"},""); //No I18N
								$("#"+subgrid_table_id).jqGrid('setGridWidth',$("#widgetElement_"+defaultOptions.snapId).width()-100,true);//No I18N
								var gridH = $('#gbox_opm_DeviceSnapList'+defaultOptions.snapId).height()+30;//No I18N
								var cellCount = Math.ceil((gridH+42)/22);
								$("#widgetElement_"+defaultOptions.snapId).attr("data-gs-height",cellCount);//No I18N
								break;
						}
						if(defaultOptions.onSelectFunctionName === "DeviceSummaryWidget")
						{
							var assocID = grid.jqGrid('getCell', row_id, 'assocID'); //No I18N
							var vendorid = grid.jqGrid('getCell', row_id, 'vendorId'); //No I18N

							$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
							var vendorUrl = window.OPM.apiUrlPattern + "/dashboard/getWidgetDeviceListForVendor?assocID="+assocID+"&vendorid="+vendorid;//No I18N
							if(window.OPM.isEmbed)
							{
								if(window.OPM.Embedtype === 'cctv')
								{
									vendorUrl = "/embedWidget?type=cctv&cctvID="+window.OPM.cctvID+'&authKey='+window.OPM.authKey+"&widgetID="+embed_widgetID+"&methodCall=getWidgetDeviceListForVendor&assocID="+assocID+"&vendorid="+vendorid;//No I18N
								}
								else
								{
									vendorUrl = "/embedWidget?type="+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+"&widgetID="+embed_widgetID+"&methodCall=getWidgetDeviceListForVendor&assocID="+assocID+"&vendorid="+vendorid;//No I18N
								}
							}
							if(window.dashboardGlobalFilterValues && window.dashboardGlobalFilterValues.globalLogicalGroup) {
								vendorUrl += "&globalLogicalGroup=" + window.dashboardGlobalFilterValues.globalLogicalGroup; //No I18N
							}
							$.getJSON(vendorUrl,function(subGridJson) 
									{
								$.each(subGridJson,function(kk,vvv)
										{
											vvv.displayName = escapeHtmlTags(vvv.displayName);
											var _dsIconHtml = "";
											if(window.OPM.isNewStatusPropagation && vvv.state !== undefined){
												_dsIconHtml = "<i class='--fault-severity icon-status --dual-status status-" + vvv.status + " " + opm_getStateCls(vvv.state) + "'></i>";
											} else {
												_dsIconHtml = "<i class='--fault-severity icon-status"+vvv.status+"'></i>";
											}
											$("#"+subgrid_table_id).append("<tr><td>"+_dsIconHtml+"</td><td><a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+vvv.name+"'>"+vvv.displayName+"</a></td></tr>"); //No I18n
										});
									});
						}
						else if (defaultOptions.onSelectFunctionName === "logFolder") {
							var colNames = [
								'', //No I18N
								Ember.I18n.t('opmanagerclient.mapdata.sortby.name', this), //No I18N
								Ember.I18n.t('webclient.alert.time.lastmodified', this) //No I18N
							];
							var colModel = [
								{ name: 'url', index: 'url', hidden: true }, //No I18N
								{ name: 'fileName', index: 'fileName', classes: 'pointer' }, //No I18N
								{ name: 'time', index: 'time' } //No I18N
							];
							var subGridData = OPMClient.SettingsConfigurationController.logDetails[grid.jqGrid('getCell', row_id, 'folderName')]; //No I18N
							subgridOptions = { "sortName": "time", "sortOrder": "asc", "searchOption": true, "toggleSearch": true, "minRowsPerPage": subGridData.length };//No I18N						
							opm_loadJQgridWithData("#" + subgrid_table_id, subGridData, colNames, colModel, "", "", "logsList", subgridOptions); //No I18N
						}
						else if(defaultOptions.onSelectFunctionName === "SDWANSitesDashBoardSelFn"){
							var colNames = [
								Ember.I18n.t('webclient.common.intro.Hostname',this),// No I18N
								Ember.I18n.t('webclient.topo.ipAddress',this),// No I18N
								Ember.I18n.t('opstor.inventory.smi.raid.component.hstate',this),// No I18N
								Ember.I18n.t('webclient.reports.devicestate',this),// No I18N
								Ember.I18n.t('webclient.storage.devicemodel',this),// No I18N
								'',
								''
							];
							var colModel = [
								{ name:"hostName", index:"hostName",classes:"pointer",formatter:function(cellValue, options, rowdata, action){ //No I18N
									if(rowdata.deviceMOName !== undefined) {
										return "<i class='--fault-severity icon-status"+rowdata.status+"'></i> <a onclick='redirectToDeviceSnapshot(\""+rowdata.deviceMOName+"\")' class='textBlue'>"+escapeHTML(rowdata.hostName)+"</a>";//No I18N
									}
									else{
										return cellValue;
									}
								}},
								{ name:"systemIP", index:"systemIP"},//No I18N
								{ name:"healthState", index:"healthState"},//No I18N
								{ name:"deviceState", index:"deviceState"},//No I18N
								{ name:"model", index:"model"},//No I18N
								{ name:"status", index:"status", hidden:"true"},//No I18N
								{ name:"deviceMOName", index:"deviceMOName", hidden:"true"}//No I18N
							];
							var siteID = grid.jqGrid('getCell', row_id, 'siteMOID'); //No I18N
							var subVsData = {"siteMOID":siteID};//No I18N
							var sdWanId = grid.jqGrid('getCell', row_id, 'sdwanID');//No I18N
							subVsData.sdwanID = sdWanId;
							if(window.OPM.isCentralServer && !defaultOptions.isDashboardWidget){
								subVsData.eeProbeID = OPMClient.InventoryDeviceDetailsController.eeProbeID;
							}
							var apiUrl = window.OPM.apiUrlPattern + "/v2/device/getSDWANSiteDevices?siteMOID="+siteID+"&sdwanID="+sdWanId;//No I18N
							if(window.OPM.isEmbed)
							{
								if(window.OPM.Embedtype === 'cctv')
								{
									apiUrl = "/embedWidget?type=cctv&cctvID="+window.OPM.cctvID+'&authKey='+window.OPM.authKey+"&widgetID="+subgrid_id.split("_")[0]+"&methodCall=getSDWANSiteDevices&siteMOID="+siteID+"&sdwanID="+sdWanId;//No I18N
								}
								else
								{
									apiUrl = "/embedWidget?type="+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+"&widgetID="+embed_widgetID+"&methodCall=getSDWANSiteDevices&siteMOID="+siteID+"&sdwanID="+sdWanId;//No I18N
								}
							}
							$("#"+subgrid_id).addClass('opm_jqGridUI');
							$("#"+subgrid_id).addClass('wansiteSubgridHht');
							var subGridData = opm_ajaxGetResponse(apiUrl);
							opm_loadJQgridWithData("#"+subgrid_table_id,subGridData,colNames,colModel, "", "", "",{'searchOption':true,"onSelectFunction":"sdwanSitesGrid"},""); //No I18N
						}
						else if(defaultOptions.onSelectFunctionName === "BVSummary")
						{
							var bv_name = grid.jqGrid('getCell', row_id, 'bvName'); //No I18N
							//var bvName =bv_name.split('_bv'); //No I18N

							$("#"+subgrid_id).html("<table id='"+subgrid_table_id+"' class='scroll' style='text-align:left;' cellpadding='2'></table>");
							var devUrl = window.OPM.apiUrlPattern + "/businessview/getBusinessViewDeviceList?bvName="+bv_name+"&isMapView=false";//No I18N
							if(window.OPM.isEmbed)
							{
								if(window.OPM.Embedtype === 'cctv')
								{
									devUrl = "/embedWidget?type=cctv&cctvID="+window.OPM.cctvID+'&authKey='+window.OPM.authKey+"&widgetID="+subgrid_id.split("_")[0]+"&methodCall=getBusinessViewDeviceList&bvName="+bv_name+"&isMapView=false";//No I18N
								}
								else
								{
									devUrl = "/embedWidget?type="+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+"&widgetID="+embed_widgetID+"&methodCall=getBusinessViewDeviceList&bvName="+bv_name+"&isMapView=false";//No I18N
								}
							}

							$.getJSON(devUrl,function(subGridJson) 
							{
								$.each(subGridJson,function(k,o)
								{
									o.displayName = escapeHtmlTags(o.displayName);
									var elemType = o.type;
									var devLink = o.displayName;
									switch(elemType)
								    {
								        case "Device" : //No I18N
								            devLink = "<a href='"+window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+o.deviceName+"'>"+o.displayName+"</a>";//No I18N
								            break;
								        case "MOGroup" : //No I18N
								            devLink = "<a href='"+window.OPM.apiclientUrl+"Maps/BusinessView/"+o.deviceName+"'>"+o.displayName+"</a>";//No I18N
								            break;
								        case "Floor" : //No I18N
								            devLink = "<a href='"+window.OPM.apiclientUrl+"Maps/ThreeDMaps/"+o.moid+"'>"+o.displayName+"</a>";//No I18N
								            break;
								        case "Rack" : //No I18N
								            devLink = "<a href='"+window.OPM.apiclientUrl+"Maps/ThreeDRacks/View/"+o.moid+"'>"+o.displayName+"</a>";//No I18N
								            break;
								        case "IpSlaTarget" : //No I18N
								            devLink = o.displayName;
								            break;
								        case "null" : //No I18N
								            devLink = o.displayName;
								            break;
								    }
									var _bvIconHtml = "";
									if(window.OPM.isNewStatusPropagation && o.state !== undefined){
										_bvIconHtml = "<i class='--fault-severity icon-status --dual-status status-" + o.statusNum + " " + opm_getStateCls(o.state) + "'></i>";
									} else {
										_bvIconHtml = "<i class='--fault-severity icon-status"+o.statusNum+"'></i>";
									}
									$("#"+subgrid_table_id).append("<tr><td>"+_bvIconHtml+"</td><td>"+devLink+"</td></tr>"); //No I18N
								});
							});
						}
						else if(defaultOptions.onSelectFunctionName === "MerakiRogueList"){
								opm_loadJQgridWithData("#" + subgrid_table_id, defaultOptions.Data[row_id-1].rogueSSID, defaultOptions.colNamesList, defaultOptions.colModelList , "", "", "MerakiRougeAPs",{noPaginationShowAll: true}); //No I18N
						}
						else if(defaultOptions.onSelectFunctionName === "opmVPNSummaryRep"){
								opm_loadJQgridWithData("#" + subgrid_table_id, defaultOptions.Data[row_id-1].vpnDetails, defaultOptions.colNamesList, defaultOptions.colModelList , "", "", "VPNDetails",{noPaginationShowAll: true}); //No I18N
						}
					},
					subGridRowColapsed:function(subgrid_id, row_id)
					{
						var choice =defaultOptions.subGridFunction;
						var subgrid_table_id = subgrid_id+"_t"; //No I18N
						if(defaultOptions.subGrid && defaultOptions.isDashboardWidget){
							dashcallbackNew(gridTableIdAlone);
						}
						if(defaultOptions.subGridFunction==="kempVSChildListSubGrid")//No I18N
						{
							setTimeout(function()
							{
								var gridH = $('#gbox_opm_DeviceSnapList'+defaultOptions.snapId).height()+30;//No I18N
								var cellCount = Math.ceil((gridH+42)/22);
								$("#widgetElement_"+defaultOptions.snapId).attr("data-gs-height",cellCount);//No I18N
							},100);
							}
							if(choice === "opmWLCAccesspointsList"){
							setTimeout(function(){
								var gridH = $('#gbox_opm_DeviceSnapList'+defaultOptions.snapId).height()+30;//No I18N
								var cellCount = Math.ceil((gridH+42)/22);
								$("#widgetElement_"+defaultOptions.snapId).attr("data-gs-height",cellCount);//No I18N
							},100);
							}
						},
						onClickGroup:function(headerId,isCollapsed){
						if(onSelectFunction === 'OnselectsensorList'){
							grid.getGridParam().expandedGroups[headerId] = !isCollapsed;
						}
					},
					afterInsertRow: function(rowId, rowData, rowElem)
					{
						if(onSelectFunction === "notifyProfileList" && rowData.hasSubProfiles !== undefined && !rowData.hasSubProfiles)
						{
							$('#' + rowId).children("td.sgcollapsed").unbind().html("");//No I18N
						}
						if(onSelectFunction === "usersList" && rowData.isCentralUser && !rowData.isLoginAllowed) {
							$('#' + rowId).children("td").attr("title",Ember.I18n.t("webclient.probe.userMgmt.disabledTitle"));
						}
						if(onSelectFunction === "usersList" && rowData.uAuth === 'domain' && !rowData.isADUserLoginAllowed) {
							$('#' + rowId).children("td").attr("title",Ember.I18n.t("webclient.domain.userMgmt.disabledTitle"));
							$('#' + rowId).children("td").not('.actions').addClass("onlyGreyOut");
						}
						if(onSelectFunction === "usersList" && (rowData.accountActive === false || rowData.accountActive === "false")) {
                            $('#' + rowId).children("td").attr("title",Ember.I18n.t("webclient.usermgmt.user.deactivated.tooltip"));
                            $('#' + rowId).children("td").not('.actions').addClass("deactivatedUserCell");
                        }
						if(onSelectFunction === "opm_DevNGlobalProfileList" && rowData.isIgnoredGroupProfile) {
							$('#' + rowId).attr("title",Ember.I18n.t("webclient.admin.notification.ignoreGroups.noassociation"));
							$('#' + rowId).children("td").attr("title",Ember.I18n.t("webclient.admin.notification.ignoreGroups.noassociation"));
							$('#' + rowId).addClass("onlyGreyOut");
						}
					},
					rowattr: function (rd)
					{
						if(onSelectFunction === "opmCustomFields" && rd.editable!==undefined && (!rd.editable))
						{
							return{"class" : "disabledCheckBox"} //No I18N
						}
						if(onSelectFunction === "opm_groupsElements" && rd.isDisabled)
						{
							return{"class" : "disabledBlock"} //No I18N
						}
						if(onSelectFunction == "opm_alarmList") //No I18N
						{
							if (OPMClient.AlarmDetailsController.viewType === "Colored") //No I18N
							{
								return {"class": "--fault-severity severityLite_"+rd.statusNum};	 //No I18N
							}
						}
						if(onSelectFunction == "profileCriteria") //No I18N
						{
							if (!rd.isVisible) { 
								return {"hidden":true}; //No I18N
							}
						}else if(onSelectFunction === "notifyProfileList" && rd.hasSubProfiles !== undefined && rd.hasSubProfiles)//No I18N	
						{
							return {"class": "subGridHdr"};	 //No I18N	
						}
						else if(onSelectFunction === "L2DevicesList" && rd.discovered !== undefined)//No I18N	
						{
							if(rd.discovered === "true")
							{
								return {"class": "isLayerDevExist ui-state-disabled"};	 //No I18N	
							}
						}
						if(onSelectFunction === "usersList" && rd.isCentralUser && !rd.isLoginAllowed) {
							return {"class": "onlyGreyOut"};	 //No I18N
						}
						if(onSelectFunction === "license_exceed_probeSelect_function" && !rd.isProbeUp) {
							return {"class": "ui-state-disabled"};	 //No I18N
						}

						if(rd.showHighlightMsg){
							return {"class": "animate"};	 //No I18N	
						}
						
						if(onSelectFunction==="userTable" )
						{
							if(rd.uName === 'admin' || (parseInt(rd.uID) === parseInt(window.OPM.userId)))
						    {
						    	return{"class":"disabledCheckBox"} //No I18N
						    }
						}
						if(onSelectFunction==="OnselectsensorList")//No I18N
						{
							return {"data-sensorType": "'sensor_"+rd.sensorType+"'"};//No I18N
						}
						if(onSelectFunction==="ziaWidget")//No I18N
						{
							var isDarkTheme = sessionStorage.getItem("Theme")!=="WhiteTheme";//No I18N
							if((window.OPM.isEmbed || OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide") !=-1) && isDarkTheme){//No I18N
								return {"class": "ziaForecastAlarm","data-theme":"dark"};//No I18N
							}else{
								return {"class": "ziaForecastAlarm"};//No I18N
							}
						}
						if(onSelectFunction==="credentialsList" && !OPMClient.VMwareDiscoveryController.isVMwareDiscoveryWizard) {
							if(rd.isCentralCred) {
								return {"class": "ui-state-disabled"};	 //No I18N
							}
						}
						/*if(onSelectFunction==="downtimeScheduler" && rd.isCentralBasedDTS!== undefined && rd.isCentralBasedDTS === "true"){
							return {"class": "ui-state-disabled"}; //No I18N
						}*/
					},
					beforeSelectRow: function(rowId, rowElem){
						if(forceSingleSelection === true) {
							grid.jqGrid('resetSelection');//No I18N	
						}
						i = $.jgrid.getCellIndex($(rowElem.target).closest('td')[0]);
                        cm = grid.jqGrid('getGridParam', 'colModel'); //No I18N
                        if(OPMClient.InventoryDeviceDetailsController.monitorsName=='eventlogMonitors' && OPMClient.InventoryDeviceDetailsController.monitorAction=='Associate')
                        {
                        	var rowdata = grid.jqGrid("getRowData", rowId)//No I18N
                        	var result =  rowdata.isalready == "true" ||  !$("#eventlog_active").prop('checked') ? false : true ;
                        	return result;
                        }

                        if(onSelectFunction !== undefined && onSelectFunction === 'opmCustomFields'){
							var gridProps = this.p;
							if(gridProps)
							{
							 	var rowData = gridProps.data[gridProps._index[rowId]];
							 	rowData.checked = $("#"+rowId+"_checked").prop("checked");//No I18N	
							}
						}

                        if(!disableRowSelect && onSelectFunction === "profileCriteria" && cm[i].name !== "cb")
                        {
                            return false;
                        }else if((onSelectFunction === "FWA_Devices")  && cm[i].name !== "cb" && cm[i].name !== "rImg"){//No I18N
                        	jQuery("#opm_Devices").jqGrid('resetSelection');//No I18N
                        	return true;
                        }else if((onSelectFunction === "FWA_Interfaces")  && cm[i].name !== "cb") { //No I18N
                        	jQuery("#opm_Devices").jqGrid('resetSelection');//No I18N
                        	return true;
                        }
                        else if(onSelectFunction === "editRouter" && cm[i].name != "cb"){
                        	if(cm[i].name !== 'gridAction'){
                        		var routerID = grid.jqGrid('getCell',rowId,'router-id');//No I18N
						   		var moid = grid.jqGrid('getCell',row,'moid');//No I18N
								if(routerID !== null && routerID !== "" && moid === "")
								{
									OPMClient.SettingsOpUtilConfigController.set('uniqueID',routerID);//No I18N
									settingsGlobalRoute.transitionTo('Settings.OpUtils.Discovery.Router.Operation','Edit');//No I18N
								}
                        	}
							return;	
						}
						else if(onSelectFunction === "ipam_WOLDevice" && cm[i].name != "cb"){
							if(cm[i].name == 'action'){
								return;
							}
							if(window.OPM.userPermissions.networkToolsWrite){
								var devId = grid.jqGrid('getCell',rowId,'resource-id');//No I18N
								if(devId !== null && devId !== ""){
									OPMClient.SettingsOpUtilConfigController.set('uniqueID',devId);//No I18N
									opmGlobalRoute.transitionTo('Inventory.List.OpUtils.Sub.EditDevices');//No I18N
								}
							}
							return;
						}
						else if(onSelectFunction === "ipam_WOLGroup" && cm[i].name != "cb"){
							if(cm[i].name == 'action'){
								return;
							}
							if(window.OPM.userPermissions.networkToolsWrite){
								var groupId = grid.jqGrid('getCell',rowId,'group-id');//No I18N
								var groupName = grid.jqGrid('getCell',rowId,'group-name');//No I18N
								var description = grid.jqGrid('getCell',rowId,'description');//No I18N
								if(groupId !== null && groupId !== ""){
									OPMClient.InventoryOpUtilsController.set('wolGroupName',groupName);//No I18N
									OPMClient.InventoryOpUtilsController.set('wolGroupDesc',description);//No I18N
									OPMClient.SettingsOpUtilConfigController.set('uniqueID',groupId);//No I18N
									opmGlobalRoute.transitionTo('Inventory.List.OpUtils.Sub.EditGroups');//No I18N
								}
							}
							return;
						}
						else if(onSelectFunction === "editWOLTask" && cm[i].name !== 'gridAction' && cm[i].name != "cb"){
							var taskID = grid.jqGrid('getCell',rowId,'taskId');//No I18N
							var taskName = grid.jqGrid('getCell',rowId,'task_name');//No I18N
							if(taskID !== null && taskID !== "")
							{
								OPMClient.SettingsOpUtilConfigController.set('wolTaskName',taskName);//No I18N
								OPMClient.SettingsOpUtilConfigController.set('uniqueID',taskID);//No I18N
								settingsGlobalRoute.transitionTo(OPMClient.SettingsTabController.backtoParantRoute+'.Operation','Edit');//No I18N
							}
							return;	
						}
                        else if((onSelectFunction === "ipam_BWM")  && cm[i].name !== "cb") { //No I18N
                        	var rowContent = grid.jqGrid("getRowData", rowId)//No I18N
                        	if(event.target.className.indexOf("oputilsippingicon") !== -1){
								var selDevice = $(grid.jqGrid('getCell', rowId, 'hostname')).attr("title"); //No I18N
								OPMClient.InventoryOpUtilsController.pingtooltipip=selDevice;
								OPMClient.InventoryOpUtilsController.set('IPRelatedToolActionPage','BWM'); //No I18N
								opUtilsIPToolTip();
							}
							else{
								if(cm[i].name == "hostname") { //No I18N
									var deviceIdList = jQuery(gridTable).getCol('hostId',false,''); //No I18N
									var host = rowContent.hostId;
									if (deviceIdList != null && deviceIdList != "")
									{
										var hostIds = new Array();
										$.each(deviceIdList, function (i,params)
									    {
									    	params=params.split("/")[0];//NO I18N 
									    	hostIds.push(params)
									    });
										window.OPM.deviceListForNextPrev = hostIds;
									}
									if (host != null && host != "")
									{
										OPMClient.InventoryDeviceDetailsController.inventorysnapType="OPUBWHost"; //No I18N
										window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(host);
										redirectToSnapshot("OPUBWHost",host); //No I18N

									}	
								}
								if(cm[i].name == "ifname" || cm[i].name == "ifindex") { //No I18N
									var intfIdList = jQuery(gridTable).getCol('interfaceid',false,''); //No I18N
									var intfId = rowContent.interfaceid;
									var ifName = $(grid.jqGrid('getCell', row, 'ifname')).attr("title"); //No I18N
									if (intfIdList != null && intfIdList != "")
									{
										var intfIds = new Array();
										$.each(intfIdList, function (i,params)
									    {
									    	params=params.split("/")[0];//NO I18N 
									    	intfIds.push(params)
									    });
										window.OPM.deviceListForNextPrev = intfIds;
									}
									if($(event.target).hasClass('icon-configedit')){
										OPMClient.InventoryOpUtilsController.opuBwmActionsObj.ifName = ifName; 
										OPMClient.InventoryOpUtilsController.opuBwmActionsObj.intfId =intfId;
										location.href=window.OPM.apiclientUrl+"Inventory/List/OpUtils/BWM/EditIfName";//No I18N
									}
									else if (intfId != null && intfId != "")
									{
										OPMClient.InventoryDeviceDetailsController.inventorysnapType="OPUBWInterface"; //No I18N
										window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(intfId);
										redirectToSnapshot("OPUBWInterface",intfId); //No I18N
									}	
								}
							}
							return false;
						}
						else if((onSelectFunction === "ipam_CFM") && cm[i].name !== "cb") { //No I18N
							var selDevice = $(grid.jqGrid('getCell', rowId, 'ip-address')).attr("title"); //No I18N
							var desc = grid.jqGrid('getCell', rowId, 'description');//No I18N
							if(cm[i].name == "ip-address"){
								ipam_CFM_ipAddress(selDevice,rowElem);
							}
							if($(event.target).hasClass('icon-configedit')){
								ipam_CFM_editIP(selDevice,desc);
							}
							return false;
						}else if(onSelectFunction === "cfmHistoryList"  && cm[i].name !== "cb"){//No I18N
							return false
						}else if((onSelectFunction === "ipam_switchportList" || onSelectFunction === "nfaPortInfoTbl")  && cm[i].name === "connected-mac") { //No I18N
							var rowData = grid.jqGrid("getRowData", rowId);//No I18N
							if(cm[i].name==="connected-mac" && $(rowData["connected-mac"]).find("span").attr("id")==="moreIcon"){
								loadMacAddressDetailsTable(rowData);
							}else if(colMod[col].name==="connected-ip" && ($(rowData["connected-ip"]).find("span").attr("id")==="moreIcon")){
								loadMacAddressDetailsTable(rowData);
							}else if(colMod[col].name==="connected-dns" && ($(rowData["connected-dns"]).find("span").attr("id")==="moreIcon")){
								loadMacAddressDetailsTable(rowData);
							}
							return false;
						}else if((onSelectFunction === "ScheduleReportsList")  && cm[i].name === "reports-name"){
							var row = grid.jqGrid("getRowData", rowId);//No I18N
							editSchReportOPU(row['reports-id']);//No I18N
						}
						else if((onSelectFunction === "ipam_subnetList")  && cm[i].name === "subnetid"){
							return false;
						}
						else if((onSelectFunction === "ipam_ipsList")  && cm[i].name != "cb"){
							var deviceIdList = grid.getCol('ip-address',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', rowId, 'ip-address'); //No I18N
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if(cm[i].name=="ipameditip" || cm[i].name == "phone-number" || cm[i].name == "asset-tag" || cm[i].name == "alias-name" || cm[i].name == "location" || cm[i].name == "status" || cm[i].name == "reserved-status")
							{
								OPMClient.InventoryOpUtilsController.pingtooltipip = selDevice;
								OPMClient.InventoryOpUtilsController.widgetID = parseInt(grid[0].id.split('opm_DeviceSnapList')[1]);
								location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/EditIP/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
							}
							else if(event.target.className.indexOf("oputilsippingicon") !== -1){
								OPMClient.InventoryOpUtilsController.pingtooltipip=selDevice;
								opUtilsIPToolTip();
							}
							else if (selDevice != null && selDevice != "")
							{
								redirectToSnapshot("IPAMIP", selDevice);//No I18N
							}
						}else if(onSelectFunction === "VMwareEvents" && cm[i].name !== "cb"){ //No I18N
							if(!$("#jqg_VmwareAddEventsList_"+rowId).prop("disabled")){
								return true;
							}
						}
						else if(onSelectFunction === "sdwanEvents" && cm[i].name !== "cb"){ //No I18N
							return false;
						}
						else if(onSelectFunction === "apmActionProfile" &&cm[i].name !== "cb"&& cm[i].name !== "NAME"){//No I18N
							return false;				
						}
						else if(onSelectFunction === "OnselectsensorList" && cm[i].name !== "cb" && cm[i].name !== "sensorname"){//No I18N
							return false;				
						}
						else if(onSelectFunction === "upgradeManager" && cm[i].name !== "cb"){//No I18N
							return false;
						}
						else{
							return true;
						}
					},
					onSelectRow: function(id,status)
					{
					    if(onSelectFunction == 'ncmNotificationTrigger') {
                            OPMClient.NCMNotificationTriggerController.updateGridSelection(gridTableIdAlone, [id], status);
					    }
						var sortColumnName = grid.jqGrid('getGridParam','sortname'); //No I18N
						var sortOrder = grid.jqGrid('getGridParam','sortorder'); //No I18N
						if(onSelectFunction === "apEntityListGroup") {
                            var selectedRow = $("#entityList").jqGrid('getRowData', id);
                            var rows = $("#entityList").jqGrid('getRowData');
							var selectedModule = $("#moduleSelect").val();//No I18N

							if(selectedModule === "ipsla"){//No I18N
								for (var i = 0; i < rows.length; i++) {
									if (rows[i].moid === selectedRow.moid) {
										if (status) {
											if (OPMClient.APController.pushSelectedEntity(rows[i]) === false) {
												$("#entityList").jqGrid('setSelection', id, false);//No I18N
											}
										} else {
											OPMClient.APController.removeSelectedEntity(rows[i]);
										}
									}
								}
							} else{
								for (var i = 0; i < rows.length; i++) {
									if (rows[i].groupID === selectedRow.groupID) {
                                        if (status) {
											if (OPMClient.APController.pushSelectedEntity(rows[i]) === false) {
												$("#entityList").jqGrid('setSelection', id, false);//No I18N
											}
										} else {
											OPMClient.APController.removeSelectedEntity(rows[i]);
										}
									}
								}
							}
                        }
						if(onSelectFunction === "ipam_Ping"){
							var selectedIPs = getEmberSelectedRows("opm_Devices","ip-address");//NO I18N
							if(selectedIPs !== ""){
								$("#oputilsaddbutton").hide();
								$(".oputilsPingTimeIntIcon").hide();
								$("#ipamSreachIcon").hide();
								$("#OpUtilsPing").css("display","flex");
								$("#OpUtilsPingAlert").css("display","none");
								$('#DeviceList,.opmInventoryHolder').addClass('AETIDRowChecked');
							}else{
								$("#OpUtilsPing").css("display","none");
								$("#oputilsaddbutton").show();
								$("#ipamSreachIcon").show();
								$("#OpUtilsPingAlert").css("display","none");
								$(".oputilsPingTimeIntIcon").show();
								$('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
							}
						}
						else if(onSelectFunction === "ipam_NWMAlerts"){
							var selectedIPs = getEmberSelectedRows("opm_Devices","ip-address");//NO I18N
							if(selectedIPs !== ""){
								$("#oputilsaddbutton").hide();
								$("#ipamSreachIcon").hide();
								$("#OpUtilsPing").css("display","none");
								$("#OpUtilsPingAlert").css("display","flex");
								$('#DeviceList,.opmInventoryHolder').addClass('AETIDRowChecked');
							}else{
								$("#OpUtilsPing").css("display","none");
								$("#oputilsaddbutton").show();
								$("#ipamSreachIcon").show();
								$("#OpUtilsPingAlert").css("display","none");
								$('#DeviceList,.opmInventoryHolder').removeClass('AETIDRowChecked');
							}
						}
						else if(onSelectFunction === "OwnerDetailsFunc"){
							var ownerId = grid.jqGrid('getCell',id,'owner-id'); //No I18N
							var monArr = OPMClient.SettingsOpUtilConfigController.adUserOwnerId;
							if($.inArray(ownerId, monArr) === -1)
								{
									OPMClient.SettingsOpUtilConfigController.adUserOwnerId.push(ownerId);
								}else{
									OPMClient.SettingsOpUtilConfigController.adUserOwnerId.splice( $.inArray(ownerId, OPMClient.SettingsOpUtilConfigController.adUserOwnerId), 1);
								}
							
							var userIdLen = OPMClient.SettingsOpUtilConfigController.adUserOwnerId;
							if(userIdLen.length != 0){
								$("#ownerTabDeleteBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
								$("#ownerTabDeleteAllBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
								$("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
							}else{
								$("#ownerTabDeleteBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn').addClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock');
								$("#ownerTabDeleteAllBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
								$("#ownerTabScanBtns").removeClass('opmBtn addUserBtn deviceInnerSlide1Btn disabledBlock').addClass('opmBtn addUserBtn deviceInnerSlide1Btn');
							}
						}
						else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile"){
							var self = window.OPM.currentView.handler.controller;
							//Since onCellSelect is somewhat slow, so it's implemented here!!!
							if(!self.get('notFromCB')){
								var monitorsList = self.get('monitorsList');
								var monitorType = onSelectFunction.split("_")[1];
								var arrIndex = monitorsList.map(function(obj){return obj.monitorTypeKey;}).indexOf(monitorType);
								var monitorTypeId = monitorsList[arrIndex].monitorTypeId;
								var selectedId = grid.jqGrid('getCell',id,monitorTypeId); //No I18N
								var selectedIds = monitorsList[arrIndex].selectedIds;
								self.set('showSelectedCount',false);//No I18N

								if(status){
									if(selectedIds.indexOf(selectedId) < 0){
										if(self.get('selectedMonitorsCount') >= self.get('monitorsMaxCount')){
											grid.jqGrid('setSelection',id,false);//No I18N
											var okCallback = function(){
												self.setProperties({showInfoDialog:false,okCallback:'',confirmMessage:''});//No I18n
											}
											self.setProperties({showSelectedCount:true,showInfoDialog:true,okCallback:okCallback,
																confirmMessage:(Ember.I18n.t('webclient.opm.settings.confign.monitor.profile.selection.limit',//No I18N
																{param0:self.get('monitorsMaxCount')},this))});//No I18N
											return;
										}
										selectedIds.push(selectedId);
										saveSelectedRowData(grid.jqGrid('getRowData',id),id,monitorType,monitorTypeId,selectedId,self,true);//No I18N
									}
								}else{
									selectedIds.splice(selectedIds.indexOf(selectedId),1);
									saveSelectedRowData(grid.jqGrid('getRowData',id),id,monitorType,monitorTypeId,selectedId,self,false);//No I18N
								}

								Ember.run.scheduleOnce('afterRender', this, function(){//No I18N
									self.set('showSelectedCount',true);//No I18N
								});
							}
							self.set('notFromCB',false);//No I18N
						}else if(onSelectFunction === 'VirtualMonitorsList'){
							var self = window.OPM.currentView.handler.controller;
							var selectedIds = self.get('selectedMonitors');
							if(status){
								if(!selectedIds.contains(id)){
									selectedIds.pushObject(id);
								}
							}else{
								selectedIds.removeObject(id);	
							}
						}else if(onSelectFunction !== undefined && onSelectFunction === 'devicePartitionList'){//No I18n
							var self = window.OPM.currentView.handler.controller;
							var selectedPartition = grid.jqGrid('getCell',id,'2');//No I18N
							var selectedPartitions = self.get('selectedPartitions');
							var previouslySelectedPartitions = self.get('previouslySelectedPartitions');
							var currentRowData = grid.jqGrid('getRowData',id);//No I18N
							var dataLength = (Object.keys(currentRowData)).length-1;
							var currentStatus = grid.jqGrid('getCell',id,(dataLength.toString()));//need to verify //No I18N
							if(status){
								var maxPartitionAssociationUILimit = self.get('maxPartitionAssociationUILimit');
								if(!selectedPartitions.contains(selectedPartition)){
									if(maxPartitionAssociationUILimit !== undefined && ((selectedPartitions.length+1) > maxPartitionAssociationUILimit) && !(previouslySelectedPartitions.contains(currentRowData['1'])) ){
										showParitionSelectionMessage(self);
										grid.jqGrid('setSelection',id,false);//No I18N
										return;
									}
									selectedPartitions.pushObject(selectedPartition);
								}
								if('false' === currentStatus){
									grid.jqGrid('setCell',id,(dataLength.toString()),'true');//No I18N
								}
							}else{
								if(currentRowData !== undefined && 'object' === typeof(currentRowData)){
						            if(currentRowData[dataLength-1] === 'true' && previouslySelectedPartitions.contains(selectedPartition)){
						            	grid.jqGrid('setSelection',id,false);//No I18N
					            	}else{
										selectedPartitions.removeObject(selectedPartition);
										if('true' === currentStatus){
											grid.jqGrid('setCell',id,(dataLength.toString()),'false');//No I18N
										}
					            	}
					            }
							}
						}else if(onSelectFunction !== undefined && onSelectFunction === 'credentialAssociation'){//No I18n
							if(window.OPM.userPermissions.discoveryWrite){
								var self = window.OPM.currentView.handler.controller;
								var selectedDevName = grid.jqGrid('getCell',id,'name');//No I18N
								var selectedDevicesArray = self.get('selectedDevices');
								if(status){
									if(!selectedDevicesArray.contains(selectedDevName)){
										selectedDevicesArray.pushObject(selectedDevName);
									}
								}else{
									selectedDevicesArray.removeObject(selectedDevName);
								}
							}
						}
						else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "ApplicationServices"){
							if(window.OPM.userPermissions.monitoringWrite){
								var self = window.OPM.currentView.handler.controller;
								var selectedServiceId = grid.jqGrid('getCell',id,'serviceid');//No I18N
								var selectedServicesArray = self.get('selectedServices');
								if(status){
									if(!selectedServicesArray.contains(selectedServiceId)){
										selectedServicesArray.pushObject(selectedServiceId);
									}
								}else{
									selectedServicesArray.removeObject(selectedServiceId);
								}
							}
						}
						else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "VendorMonitor"){
							var self = window.OPM.currentView.handler.controller;
							var partitionDirectSelectionList = self.get('partitionDirectSelectionList');
							var selectedGraphId = Number(grid.jqGrid('getCell',id,'GRAPHID'));//No I18N
							var selectedMonitorsArray = self.get('selectedMonitors');
							var rowContent = grid.jqGrid('getRowData',id);//No I18N
							if(self.get('notFromCB')){
								self.set('notFromCB',false);//No I18N
								return;
							}
							if(status){
								if(!selectedMonitorsArray.contains(selectedGraphId)){
									if(self.get('allowedMonitorsCount') !== undefined && (selectedMonitorsArray.length >= self.get('allowedMonitorsCount'))){
										showAlertInfo(false,self.get('allowedMonitorsCount'));
										grid.jqGrid('setSelection',id,false);//No I18N
									}else{
										selectedMonitorsArray.pushObject(selectedGraphId);
										grid.jqGrid('setCell',id,'isSelected','true');//No I18N
										grid.jqGrid('setCell',id,'testStatus','aa');//No I18N
										$.each(self.get('performanceData'),function(){
											var arrIndex = this.content.map(function(obj){return obj.GRAPHID;}).indexOf(Number(selectedGraphId));
											if(arrIndex > -1){
												this.content[arrIndex].isSelected = 'true';//No I18N
												this.selectedIds.push(selectedGraphId);
												this.selectedCount = this.selectedIds.length;
												return false;
											}
										});
									}
								}
								if(rowContent.showAddPartitionOption === 'true' && rowContent.isSelected === 'false' && self.get('graphIdVsPartitionMapping')){
									var graphIdVsPartitionMapping = Object.keys(self.get('graphIdVsPartitionMapping'));
									if(!(partitionDirectSelectionList.contains(rowContent.GRAPHID) || graphIdVsPartitionMapping.contains(rowContent.GRAPHID))){
										partitionDirectSelectionList.pushObject(rowContent.GRAPHID);
									}
								}
							}else{
								if(self.get('prevSelectedIds').contains(selectedGraphId.toString())){
									grid.jqGrid('setSelection',id,false);//No I18N
									return;
								}
								selectedMonitorsArray.removeObject(selectedGraphId);
								grid.jqGrid('setCell',id,'isSelected','false');//No I18N
								grid.jqGrid('setCell',id,'testStatus','aa');//No I18N
								$.each(self.get('performanceData'),function(){
									var arrIndex = this.content.map(function(obj){return obj.GRAPHID;}).indexOf(Number(selectedGraphId));
									if(arrIndex > -1){
										this.content[arrIndex].isSelected = 'false';//No I18N
										this.selectedIds.splice($.inArray(selectedGraphId,this.selectedIds),1);
										this.selectedCount = this.selectedIds.length;
										return false;
									}
								});
								var graphIdString = selectedGraphId.toString();
								if(rowContent.showAddPartitionOption === 'true'){
									if(partitionDirectSelectionList && partitionDirectSelectionList.contains(graphIdString)){
										partitionDirectSelectionList.removeObject(graphIdString);
									}
								}
							}
						}
						else if(onSelectFunction ==="widgetList" || onSelectFunction==="APM_v3MonitorsList" || onSelectFunction==="CustomWidget"){
							dashcallbackNew(gridTableIdAlone);
						}
						else if(onSelectFunction === "device")
						{
							var redirectType = 'MonitoringDevice';//No I18N
							if(window.OPM.isNFA) {
								redirectType = 'FlowDevice';//No I18N
							}
							var deviceName = grid.jqGrid('getCell',id,'deviceName'); //No I18N
							redirectToSnapshot(redirectType,deviceName);
						}
						else if(onSelectFunction === "discoveryReport")
						{
							var deviceName = grid.jqGrid('getCell',id,'moName'); //No I18N
							var action = grid.jqGrid('getCell',id,'action'); //No I18N
							if(action === "ADD")
							{
								redirectToSnapshot('MonitoringDevice',deviceName);	//No I18n			
							}
						}
						else if(onSelectFunction === "url_alarmsList")
						{
							var entity = grid.jqGrid('getCell',id,'alarmId'); //No I18N
							redirectToAlarm(entity);
						}
						else if(onSelectFunction === "alarm")
						{
							var entity = grid.jqGrid('getCell',id,'alarmId'); //No I18N
							redirectToAlarm(entity);
						}else if(onSelectFunction === "opm_EC_ProblemAlarms")//No I18N
						{
							OPMClient.AlarmDetailsController.set("isRedirectedFromProblem",true) ;//No I18N
                      		var entity = grid.jqGrid('getCell',id,'alarmId'); //No I18N
							redirectToAlarm(entity);
						}
						else if(onSelectFunction === "search_fwa_clouds"){
							var device = grid.jqGrid('getCell',id,'Service'); //No I18N
							redirectToSnapshot("FirewallService", device); //NO I18N
						}
						else if(onSelectFunction === "search_fwa_devices"){
							var device = grid.jqGrid('getCell',id,'rid'); //No I18N
							redirectToSnapshot("FirewallDevice", device); //NO I18N
						}
						else if(onSelectFunction === "search_fwa_interfaces"){
							var device = grid.jqGrid('getCell',id,'id'); //No I18N
							redirectToSnapshot("FirewallInterface", device); //NO I18N
						}
						else if(onSelectFunction === "search_fwa_rules"){
							var device = grid.jqGrid('getCell',id,'Rule'); //No I18N
							redirectToSnapshot("FirewallRules", device); //NO I18N
						}
						else if(onSelectFunction === "search_ipam_Subnets"){
							var device = grid.jqGrid('getCell',id,'ip-address'); //No I18N
							location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMIP/"+device;//NO I18N
						}else if(onSelectFunction === "search_ipam_Switches"){//No I18N
							var infindex = grid.jqGrid('getCell',id,'connected-port-ifindex'); //No I18N
							var switchname = grid.jqGrid('getCell',id,'switch-name'); //No I18N
							location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMPort/"+switchname+" "+infindex;//NO I18N
						}
						else if(onSelectFunction === "search_spm_Switches"){//No I18N
							var switchname = grid.jqGrid('getCell',id,'switch-name'); //No I18N
							location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMSwitch/"+switchname;//NO I18N
						}
						else if(onSelectFunction === "search_ipam_Subnets1"){//No I18N
							var gid = grid.jqGrid('getCell',id,'snapshot-id'); //No I18N
							location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPAMSubnet/SUBNET_"+gid;//NO I18N
						}
						else if(onSelectFunction === "TrapFromSettings"){
							var trapID = grid.jqGrid('getCell',id,'tid');//No I18N
							getTrapDetailsInfo(trapID,1,onSelectFunction);
						}
						else if(onSelectFunction === "TrapFromAlarm"){
							var trapID = grid.jqGrid('getCell',id,'tid');//No I18N
							getTrapDetailsInfo(trapID,2,onSelectFunction);
						}
						else if(onSelectFunction === "search_ncm_compliance"){
							var policyId = grid.jqGrid('getCell',id,'ID'); //No I18N
							// redirectToSnapshot("ConfigPolicy", policyId); //NO I18N
							location.href = OPMClient.NCMComplianceListController.baseUrl + "/Policies"; // No I18N
							setTimeout(function (){
								OPMClient.NCMCompliancePolicyController.policyCompInstance.selectNodeAction(OPMClient.NCMCompliancePolicyController.policyCompInstance.getNodeData('policyGroup_ALL_policy_'+policyId));// No I18N
							}, 100);
						}
						else if(onSelectFunction === "search_ncm_devices"){
							var device = grid.jqGrid('getCell',id,'ID'); //No I18N
							redirectToSnapshot("ConfigDevice", device); //NO I18N
						} else if(onSelectFunction === "search_ncm_configs"){//NO I18N
							var device = grid.jqGrid('getCell',id,'ID'); //No I18N
							redirectToSnapshot("ConfigChange", device); //NO I18N
						}
						else if(onSelectFunction === "search_ncm_device_groups"){
							var deviceGName = grid.jqGrid('getCell',id,'Name'); //No I18N
							var deviceGID = grid.jqGrid('getCell',id,'ID'); //No I18N
							redirectToSnapshot("ConfigDGroup", encodeURIComponent(deviceGID+' '+deviceGName)); //NO I18N
						}
						else if(onSelectFunction === "search_nfa_devices"){
							var device = grid.jqGrid('getCell',id,'ID'); //No I18N
							redirectToSnapshot("FlowDevice", device); //NO I18N
						}
						else if(onSelectFunction === "search_nfa_interfaces"){
							var deviceIdList = grid.getCol("ID",false,""); //No I18N
							window.OPM.deviceListForNextPrev = (deviceIdList!=null && deviceIdList!="")?deviceIdList:""; //No I18N
							OPMClient.InventoryDeviceDetailsController.subFilterType='Interfaces'; //NO I18N
							OPMClient.InventoryDeviceDetailsController.gridRowData=grid.jqGrid("getRowData", id); //No I18N
							if(OPMClient.InventoryDeviceDetailsController.gridRowData.state !== '1') {
								nfa_setInvListToSnapshotTimeFrame();
								var snapType = (grid.jqGrid("getCell", id, "isVPCInterface") === "true" ? "FlowCloudInterface" : "FlowInterface"); //NO I18N
								redirectToSnapshot(snapType, OPMClient.InventoryDeviceDetailsController.gridRowData.ID); //NO I18N
							}
						}else if(onSelectFunction === "nfa_wlc_AccessPoint"){ //No I18N
							var deviceIdList = grid.getCol("ID",false,""); //No I18N
							window.OPM.deviceListForNextPrev = (deviceIdList!=null && deviceIdList!="")?deviceIdList:""; //No I18N
							OPMClient.InventoryDeviceDetailsController.gridRowData=grid.jqGrid("getRowData", id); //No I18N
							if(OPMClient.InventoryDeviceDetailsController.gridRowData.state !== '1') {
								nfa_setInvListToSnapshotTimeFrame();
								redirectToSnapshot("FlowAPMAC", OPMClient.InventoryDeviceDetailsController.gridRowData.ID); //NO I18N
							}
						}else if(onSelectFunction === "search_nfa_ipgroups"){ //No I18N
							var device = grid.jqGrid('getCell',id,'ID'); //No I18N
							redirectToSnapshot("FlowIPGroup", device); //NO I18N
						}
						else if(onSelectFunction === "BillProfileList")
						{
							$('.opm_jqGridUI .ui-jqgrid-bdiv tr').click(function(){
								if(!$(this).hasClass('expandView')){
									$(this).addClass('expandView');
									trId=$(this).attr('id');
									$("#BillingList").expandSubGridRow(trId);
								}else{
									$(this).removeClass('expandView');
									trId=$(this).attr('id');
									$("#BillingList").collapseSubGridRow(trId);
								}
							});
						}
						else if(onSelectFunction === "BillingReportList")
						{
							$("#listBillReports").expandSubGridRow(id); 
						}
						else if(onSelectFunction === "reportsReportList") //No I18N
						{
							$("#reportsReportList").expandSubGridRow(id); 
						}
						else if(onSelectFunction==="nfa_interface_alarm_list") { //NO I18N
							var alarmID = grid.jqGrid("getCell", id, "alarmId"); //NO I18N
							if(alarmID!==null && alarmID!=="") { //NO I18N
								redirectToAlarm(alarmID);
							}
						}

						/*else if(onSelectFunction  === 'opm_interfacesList')
			     {

					var selInterface = grid.jqGrid('getCell', id, 'name'); //No I18N		
					if (selInterface !== null && selInterface !== "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringInterface"; //No I18N
						redirectToSnapshot("MonitoringInterface", selInterface); //No I18N
					}
				}*/
						/*else if(onSelectFunction  === 'opm_DeviceAlarmsList' && (colMod[col].name !== "cb"))
			     {

					var selEntity = grid.jqGrid('getCell', id, 'entity'); //No I18N		
					if (selEntity !== null && selEntity !== "")
					{
						redirectToAlarm(selEntity);
					}
				}*/
						else if(onSelectFunction === "interface")
						{
							var deviceID = grid.jqGrid('getCell',id,'id'); //No I18N
							var inferfaceName = grid.jqGrid('getCell',id,'inferfaceName'); //No I18N
							if(window.OPM.isNFA){
								redirectToNFASnapshot(deviceID);
							}else {
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringInterface"; //No I18N
								redirectToSnapshot("MonitoringInterface", inferfaceName); //No I18N
							}
						}
						else if(onSelectFunction === "url")
						{
							var urlName = grid.jqGrid('getCell',id,'NAME'); //No I18N
							location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+urlName;//No I18N
						}
						else if(onSelectFunction === "reports")
						{
						    var reportId = grid.jqGrid('getCell', id, 'reportId'); //No I18N
							var reportType = grid.jqGrid('getCell', id, 'reportType'); //No I18N
							var reportName = grid.jqGrid('getCell', id, 'reportName'); //No I18N
                            var isCustom = grid.jqGrid('getCell', id, 'isCustom'); //No I18N
                            var isEdit = grid.jqGrid('getCell', id, 'isEdit'); //No I18N
                            var isAPMReport = grid.jqGrid('getCell', id, 'isAPMReport'); //No I18N
                            redirectToReportsPage(reportId,reportType,reportName,isCustom,isEdit,isAPMReport);
						}
						else if(onSelectFunction === "addNTMonitorList_1"){
							var serviceName = grid.jqGrid('getCell', id, 'serviceName'); //No I18N
							var displayName = grid.jqGrid('getCell', id, 'displayName'); //No I18N
							var tempObj={};
							tempObj.serviceName=serviceName;
							tempObj.displayName=displayName;
							if(status===true){
								var flag=true;
								$.each(addNTServiceMonitorsList, function(i,val){
									if(val.serviceName===tempObj.serviceName){
										flag=false;
									}
								});
								if(flag===true){
									addNTServiceMonitorsList.push(tempObj);
								}
							}
							else{
								addNTServiceMonitorsList = addNTServiceMonitorsList.filter(function (el) {
									return el.serviceName !== serviceName;
								});					
							}
						}
						else if(onSelectFunction==="processListwkfw")
						{
							var path = grid.jqGrid('getCell', id, 'path'); //No I18N
							var args = grid.jqGrid('getCell', id, 'args'); //No I18N
							var name = grid.jqGrid('getCell', id, 'name'); //No I18N
							$('#processName').val(name);
							$('#path').val(path);
							$('#arguments').val(args);
							opm_hideAndShowDiv('wkfwGetProcessDiv',false);//No I18N
						}
						else if(onSelectFunction==="opu_bwmHostInterfaces")
						{
							var intfIdList = jQuery(gridTable).getCol('interfaceid',false,''); //No I18N
								var intfId = grid.jqGrid('getCell', id, 'interfaceid'); //No I18N
								if (intfIdList != null && intfIdList != "")
								{
									var intfIds = new Array();
									$.each(intfIdList, function (i,params)
								    {
								    	params=params.split("/")[0];//NO I18N 
								    	intfIds.push(params)
								    });
									window.OPM.deviceListForNextPrev = intfIds;
								}
								if (intfId != null && intfId != "")
								{
									OPMClient.InventoryDeviceDetailsController.inventorysnapType="OPUBWInterface"; //No I18N
									window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(intfId);
									redirectToSnapshot("OPUBWInterface",intfId); //No I18N


								}
						}
						else if(onSelectFunction === "opm_rediscoverInterfaces" && !onPagingCall && !onSearchCall)
						{
							var intfId = grid.jqGrid('getCell', id, 'id'); //No I18N							
							if(status) {
								reDisIntJson.push(intfId);
							} else {
								var index = reDisIntJson.indexOf(intfId);
								if (index > -1) {
								  reDisIntJson.splice(index, 1);
								}
							}
						}
						else if(onSelectFunction === 'licenseMgmtFunction' || onSelectFunction === 'licenseExceedFunction') {//No I18N
							if(gridTable === '#Flow-table' || (onSelectFunction === 'licenseMgmtFunction' && OPMClient.__container__.lookup('controller:SettingsBasicLicenseMgmt').model.currentModule.id === 'Flow') || (onSelectFunction === 'licenseExceedFunction' && OPMClient.__container__.lookup('controller:LicenseExceed') != undefined && OPMClient.__container__.lookup('controller:LicenseExceed').model != undefined && OPMClient.__container__.lookup('controller:LicenseExceed').model.currentModule != undefined && OPMClient.__container__.lookup('controller:LicenseExceed').model.currentModule.id === 'Flow')) {
								grid.expandSubGridRow(id);
								var childid = $(gridTable + "_" + id + "_t");//No I18N
								if(!status && childid.jqGrid('getGridParam','selarrrow').length !== childid.jqGrid('getGridParam', 'reccount')) {
									return;
								}
								var dataIds = childid.jqGrid('getDataIDs'); //No I18N
								childid.jqGrid('resetSelection'); //No I18n
								$.each(dataIds,function(k,rowId){
									if(status) {
										childid.jqGrid('setSelection', rowId, true);//No I18N
									}
									else {
										childid.jqGrid('resetSelection'); //No I18n
									}
								});
							}
							if(onSelectFunction === 'licenseMgmtFunction') {
								OPMClient.__container__.lookup('controller:SettingsBasicLicenseMgmt').send('enableDisableActions');//No I18N
							}
							else {
								enableDisableLicenseActions(gridTable);
							}
						}
						else if(onSelectFunction === "flowInterfacesForLicenseFun") {
							var parentRowID = gridTable.split('_')[1];
							var parentGridID = gridTable.split('_')[0];
							var parentSelected = false;
							parentSelected = $(parentGridID).jqGrid("getGridParam", "selarrrow").indexOf(parentRowID) > -1 ? true: false;
							if(!status && parentSelected) {
								$(parentGridID).jqGrid('setSelection', parentRowID);
							}
							if(parentGridID === '#licenseMgmtTable') {
								OPMClient.__container__.lookup('controller:SettingsBasicLicenseMgmt').send('enableDisableActions');//No I18N
							}
							else {
								enableDisableLicenseActions(gridTable);
							}
						}
						if(onSelectFunction === "fwaAlertProfile"){ //No I18N
							fwaAlertCriteriaUpdated();
						}
						else if(onSelectFunction == 'dcReportFilter')
						{
							var selRowIds = jQuery(gridTable).jqGrid('getGridParam','selarrrow'); //No I18N
							var selMonLength = OPMClient.DiagnosticDataCollectionController.availableMonitors; //No I18N
							$('#cb_filterMonitorTypeTable').prop('checked', selMonLength == undefined || selRowIds.length == selMonLength); //No I18N
						 }
						else if('CustomFieldsTable' === onSelectFunction){
							var gridProps = this.p;
							 var rowData = gridProps.data[gridProps._index[id]];
							rowData.cb = (rowData.cb === undefined) || !rowData.cb;

							
						
						}
						
						if(defaultOptions.subGrid && defaultOptions.isDashboardWidget){
							dashcallbackNew(gridTableIdAlone);
						}
						if(retainSelection){
			            	if(status){
			            		var isDataPushed = true;
			            		var entityData = $(gridTable).jqGrid("getRowData",id);//No I18N
			            		if(onSelectFunction === "rcaEntityList"){//No I18N
				            		isDataPushed = OPMClient.RCAController.pushSelectedEntity(entityData);
				            	}else if(onSelectFunction === 'opmEntitySelectionEntityList'){//No I18N
				            		isDataPushed = OPMClient.entitySelectionController.pushSelectedEntity(entityData);
				            	}

				            	if(isDataPushed){
				            		gridSelectedRows[gridTable][id] = entityData;
				            	}else{
				            		$(gridTable).jqGrid('setSelection',id,false);//No I18N
				            	}
			                }else{
			               		var entityData = $(gridTable).jqGrid("getRowData",id);//No I18N
			            		if(onSelectFunction === "rcaEntityList"){//No I18N
				            		OPMClient.RCAController.removeSelectedEntity(entityData);
				            	}else if(onSelectFunction === 'opmEntitySelectionEntityList'){//No I18N
				            		OPMClient.entitySelectionController.removeSelectedEntity(entityData);
				            	}

								delete gridSelectedRows[gridTable][id];
			               	}
						}
						if(onSelectFunction === "fileIntegritySettingsList"){
         					var settingsRowCount = $("#FileIntegritySettingsList").jqGrid('getGridParam','selarrrow'); //No I18N
		 					if(settingsRowCount.length > 0){
		 						$('#externalFilesActionId').removeClass('jiraBlur');
		 					}else{
		 						$('#externalFilesActionId').addClass('jiraBlur');
		 					}
		 				}
		 				if(onSelectFunction === "fileIntegrityReportsList"){
		 					var reportsRowCount = $("#FileIntegrityReportsList").jqGrid('getGridParam','selarrrow'); //No I18N
		 					if(reportsRowCount.length > 0){
		 						$('#externalFilesActionIdInReport').removeClass('jiraBlur');
		 					}else{
		 						$('#externalFilesActionIdInReport').addClass('jiraBlur');
		 					}
		 				}
						if(onSelectFunction === "interfaceDiscoveredData"){
							var isEnabled = $(".importIntfBtn.addIntfBtn").prop("disabled"); //No I18N
							if(!isEnabled){
								return true;
							}else{
								$(".importIntfBtn.addIntfBtn").prop("disabled", false); //No I18n
								$('.importIntfBtn.addIntfBtn').css('opacity', '1'); //No I18n
							}
						}
					
						if(onSelectFunction === "ncmVendorOnClick"){//No I18N
							OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {};
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {}; 
							var probeName = grid.jqGrid('getCell', id, 'Probe'); //No I18N
							var Vendor = grid.jqGrid('getCell', id, 'Vendor'); //No I18N							
							
							OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;
		 					var obj = {};
			 				var obj1 = {};

    						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMVendor__DISPLAYNAME":[Vendor],"RegionalServerInfo__NAME":[probeName]};
	   		 				obj[Vendor]=Vendor;
							obj1[probeName]=probeName;
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMVendor__DISPLAYNAME":obj,"RegionalServerInfo__NAME":obj1}; //No I18N
    						if(OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget == true)
    						{
    							location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
    						}
						}
						if(onSelectFunction === "ncmOsTypeOsVersionOnClick"){//No I18N
							
							OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {};
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {};
							var probeName = grid.jqGrid('getCell', id, 'Probe'); //No I18N
							var Vendor = grid.jqGrid('getCell', id, 'Vendor'); //No I18N							
							var OsType = grid.jqGrid('getCell', id, 'OsType'); //No I18N							
							var OsVersion = grid.jqGrid('getCell', id, 'OsVersion'); //No I18N							
							
							OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;
		 					var obj = {};
			 				var obj1 = {};
			 				var obj2 = {};
			 				var obj3 = {};

    						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMVendor__DISPLAYNAME":[Vendor],"NCMResource__OSTYPE":[OsType],"NCMResource__OSVERSION":[OsVersion],"RegionalServerInfo__NAME":[probeName]};
	   		 				obj[Vendor]=Vendor;
							obj1[probeName]=probeName;
							obj2[OsType]=OsType;
							obj3[OsVersion]=OsVersion;
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMVendor__DISPLAYNAME":obj,"NCMResource__OSTYPE":obj2,"NCMResource__OSVERSION":obj3,"RegionalServerInfo__NAME":obj1}; //No I18N
    						if(OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget == true)
    						{
    							location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
    						}
						}
						if(onSelectFunction === "ncmDTOnClick"){//No I18N
							OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {};
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {}; 
							var probeName = grid.jqGrid('getCell', id, 'Probe'); //No I18N
							var deviceType = grid.jqGrid('getCell', id, 'DeviceType'); //No I18N							
							
							OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;
		 					var obj = {};
			 				var obj1 = {};

    						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMDeviceTemplate__DISPLAYNAME":[deviceType],"RegionalServerInfo__NAME":[probeName]};
	   		 				obj[deviceType]=deviceType;
							obj1[probeName]=probeName;
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMDeviceTemplate__DISPLAYNAME":obj,"RegionalServerInfo__NAME":obj1}; //No I18N
    						if(OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget == true)
    						{
    							location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
    						}
						}
						if(onSelectFunction === "ncmSeriesModelOnClick"){//No I18N
							//"NCMDeviceTemplate__DISPLAYNAME":["Cisco IOS Router"]
							OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {};
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {}; 
							var probeName = grid.jqGrid('getCell', id, 'Probe'); //No I18N
							var Vendor = grid.jqGrid('getCell', id, 'Vendor'); //No I18N							
							var Series = grid.jqGrid('getCell', id, 'Series'); //No I18N							
							var Model = grid.jqGrid('getCell', id, 'Model'); //No I18N							
							
							OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;
		 					var obj = {};
			 				var obj1 = {};
			 				var obj2 = {};
			 				var obj3 = {};

    						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMVendor__DISPLAYNAME":[Vendor],"NCMResource__SERIES":[Series],"NCMResource__MODEL":[Model],"RegionalServerInfo__NAME":[probeName]};
	   		 				obj[Vendor]=Vendor;
							obj1[probeName]=probeName;
							obj2[Series]=Series;
							obj3[Model]=Model;
	   		 				OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMVendor__DISPLAYNAME":obj,"NCMResource__SERIES":obj2,"NCMResource__MODEL":obj3,"RegionalServerInfo__NAME":obj1}; //No I18N
    						if(OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget == true)
    						{
    							location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
    						}
						}

						if(onSelectFunction === "OnselectsensorList"){//No I18N
							var isRowSelected = $('#gridsensorList').jqGrid('getGridParam', 'selarrrow').length>0;
							if(isRowSelected){
								$('.actionDropDown').removeClass('disabledBlock');//No I18N
							}else{
								$('.actionDropDown').addClass('disabledBlock');//No I18N
							}
							if(!status)
							{
								var sensortype = $("#gridsensorList #"+id).attr("data-sensortype");//No I18N		
								$("#gridsensorList tr.jqgroup input[name='sensorGroup'][value='"+sensortype+"']").prop("checked",false);//No I18N	
							}
						}
						else if(onSelectFunction === "wanIPLinkList" && !onPagingCall)
						{
							var siteName = grid.jqGrid('getCell', id, 'wanLinkSiteName'); //No I18N
							var ip = grid.jqGrid('getCell', id, 'targetIP'); //No I18N	
							var displayName = grid.jqGrid('getCell', id, 'displayName'); //No I18N
							var obj = {};
							obj.wanLinkSiteName = siteName;
							obj.targetIP = ip;
							obj.displayName = displayName;
							wanLinksByCSV.pushObject(obj);
						}
						if(onSelectFunction === "upgradeManager" && defaultOptions.isFailOverInstalledAny){//No I18N
							var rowData = grid.jqGrid("getRowData", id);//No I18N
							if(defaultOptions.isFailOverInstalledAny && rowData.SERVERMODE === "PRIMARY") {
								var rowIds = grid.jqGrid("getDataIDs");//No I18N
								rowIds.forEach(function(rowId) {
									var currentRowData = grid.jqGrid("getRowData", rowId);//No I18N
									if (currentRowData.SERVERID === rowData.SERVERID && currentRowData.SERVERMODE === "STANDBY") {
										if(status) {
											grid.jqGrid('setSelection', rowId);//No I18N
										} else {
											grid.jqGrid('resetSelection', rowId);//No I18N
										}
									}
								});
							}
						}
						if(onSelectFunction === "interfaceMonitorsList" && cm[i].name === "monitorName")
						{
							var policyName = grid.jqGrid('getCell',id,'policyName'); //No I18N
							openPerformanceMonEnhancedGraph(policyName,policyName,false,true,grid.jqGrid('getCell',id,'displayName'));//No I18N
						}
						if(onSelectFunction === "opm_LiteDevice") { //No I18n
							//opm_LiteDeviceListCommonOptions();
							DeviceListCommonOptions();
						}
						if(onSelectFunction === "sdwanSitesGrid" || onSelectFunction === "sdwanEdgeDevicesGrid" ||onSelectFunction === "sdwanControllerGrid"){
							var selDevice = grid.jqGrid('getCell', row, 'deviceMOName'); //No I18N
							if (selDevice != null && selDevice != "")
							{
							redirectToDeviceSnapshot(selDevice);	
							}
						}
						if(onSelectFunction === "opm_DevNGlobalProfileList"){
							grid.find("tr").each(function () {
								var checkBoxId = "#jqg_opm_DevNGlobalProfileList_" + $(this).attr("id"); //No I18n
								if($(this).hasClass("onlyGreyOut")) {
									$(checkBoxId).prop("checked", false);
									$(this).removeClass("ui-state-highlight");
									$(this).attr("aria-selected", false);
								}
								
							});
						}
						if (onSelectFunction === "Api_Hit_Details") {
							var html = grid.jqGrid('getCell', id, 'apiPath'); //No I18N
							var api = $('<div>').html(html).text();
                            var ctrl = OPMClient.__container__.lookup("controller:SupportAnalysis.ApiPerformanceAnalyzer"); //No I18n
                            ctrl.model.selectedApis = api;
                            ctrl.set("showingChild",true); //No I18N
                            opm_transitionToTheRoute("SupportAnalysis.ApiPerformanceAnalyzer.ApiHitDetails"); //NO I18N
                        }
						if (onSelectFunction === "Histogram_Api_Details") {
							var html = grid.jqGrid('getCell', id, 'displayName'); //No I18N
							var range = $('<div>').html(html).text();
							var ctrl = OPMClient.__container__.lookup("controller:SupportAnalysis.ApiPerformanceAnalyzer");   //No I18N
							var slideDetails = {
								id: "histogram_api_details",                                                                  //No I18N
								componentName: "OPMClient.SupportAnalysisHistogramApiDetailsComponent",                       //No I18N
								slideHeader: ctrl.get("model.histogramColumn1Title") + " : " + range,                 //No I18N
								isFull : true
							};
							ctrl.set("range",range);																		  //No I18N
							ctrl.set("slideDetails", slideDetails);                                                           //No I18N
                        }
						
						// Common jqgrid onSelectRow handling
						if(defaultOptions.onSelectRow && typeof defaultOptions.onSelectRow == "function"){//No I18n
							defaultOptions.onSelectRow(id, status);
						}
					},	
					afterShowForm: function(form) {
    form.closest('div.ui-jqdialog').center(); //No I18N
},
					onCellSelect: function(row, col, content, event)
					{
						
						var colMod = jQuery(gridTable).jqGrid("getGridParam", "colModel");	//No I18N
						var rowMod = jQuery(gridTable).jqGrid("getGridParam", "data");	//No I18N
						var rowContent = $(gridTable).jqGrid('getRowData',row);
						if(onSelectFunction.indexOf("VendorMonitor_") >= 0 ){
							if(rowContent.showAddPartitionOption == 'true' && $(event.target).hasClass('textLink')){
								var selectedRows = grid.jqGrid('getGridParam', 'selarrrow');//No I18N
								var isSelected = selectedRows.indexOf(row) !== -1;
								if(isSelected){
        							grid.jqGrid('setSelection', row, true);  //No I18N
								}
								showPartitionList(rowContent);
							}
						}
						switch(onSelectFunction)
						{
						case "opm_advancedReport" ://No I18N
						case "CustomWidget" ://No I18N
							if(colMod[col].name === Ember.I18n.t("webclient.reports.tags.devDispName",this) && colMod[col].cellattr!==undefined){
								var moName = grid.jqGrid('getCell', row, 'moName'); //No I18N
								redirectToSnapshot('MonitoringDevice',moName); //No I18N
							}
							else if(colMod[col].name === Ember.I18n.t("webclient.topo.actions.deviceinfo.intfname",this) && colMod[col].cellattr!==undefined){
								var moName = grid.jqGrid('getCell', row, 'moName'); //No I18N
								redirectToSnapshot('MonitoringInterface',moName); //No I18N
							}
							else if(colMod[col].name === Ember.I18n.t("webclient.common.intro.Hostname",this) && colMod[col].cellattr!==undefined){
								var resourceid = grid.jqGrid('getCell', row, 'resourceid'); //No I18N
								redirectToSnapshot('ConfigDevice',resourceid); //No I18N
							}
							else if(colMod[col].name === Ember.I18n.t("opu.views.SWITCH_NAME",this) && colMod[col].cellattr!==undefined){
								var switchname = grid.jqGrid('getCell', row, 'switchname'); //No I18N
								redirectToSnapshot('IPAMSwitch',switchname); //No I18N
							}
							else if(colMod[col].name === Ember.I18n.t("webclient.admin.appmanager.serverip",this) && colMod[col].cellattr!==undefined){
								var ipaddress = grid.jqGrid('getCell', row, 'ipaddress'); //No I18N
								redirectToSnapshot('IPAMIP',ipaddress); //No I18N
							}
							else if(colMod[col].name === Ember.I18n.t("opu.views.SUBNET_ADDRESS",this) && colMod[col].cellattr!==undefined){
								var gid = grid.jqGrid('getCell', row, 'gid'); //No I18N
								redirectToSnapshot('IPAMSubnet','SUBNET_'+gid); //No I18N
							}
							else if(colMod[col].name === 'DHCP Server Address' && colMod[col].cellattr!==undefined){
								var serveraddress = grid.jqGrid('getCell', row, 'serveraddress'); //No I18N
								redirectToSnapshot('IPAMDHCP',serveraddress); //No I18N
							}
                            break;
						case "IPSLATopCallPaths" ://No I18N
							OPMClient.InventoryDeviceDetailsController.sourceDeviceName = window.OPM.isCentralServer ?  rowContent.SOURCE_DEVICENAME : undefined;
							colMod[col].name == "SOURCENAME" ? location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPSLAVoIP/"+rowContent.PROBE_ID:'';	//No I18N	
							break;
						case "ipslaExisting_Monitors" ://No I18N
							     grid.jqGrid('editRow',row,true);//No I18N
							break;
						case "forecastRules":
						
						OPMClient.SettingsConfigurationsCentralizedConfigController.RuleData = rowContent;
							colMod[col].name == "actions" ? location.href = window.OPM.apiclientUrl+"Settings/Configurations/ForecastAlertSettings/Edit/"+rowContent.ruleID:'';	//No I18N	
							break;
						case "forecastRules":
						
						OPMClient.SettingsConfigurationsCentralizedConfigController.RuleData = rowContent;
							colMod[col].name == "actions" ? location.href = window.OPM.apiclientUrl+"Settings/Configurations/ForecastAlertSettings/Edit/"+rowContent.ruleID:'';	//No I18N	
							break;
						case "databaseList" ://No I18N
							if(colMod[col].name == "actions")//No I18N
							{
								if(OPMClient.ApplicationController.isDemoUser){
									demoUserMessage();
								}else{
									deleteSQLDatabase(rowContent);
								}
							}
							break;
						case "snapshotMonitorList"://No I18N
							if(rowContent.name == "ISPUsedDiskSpace")//No I18N
							{									
								var selIds = $('#MonitorList').jqGrid('getGridParam', 'selarrrow');//No I18N
								var ischecked = selIds.indexOf(row) >=0;
								!ischecked ? $('#publicStoreDiv').show() : $('#publicStoreDiv').hide();//No I18N
							}
							else if(rowContent.name == "ISMUsedDiskSpace")//No I18N
							{									
								var selIds = $('#MonitorList').jqGrid('getGridParam', 'selarrrow');//No I18N
								var ischecked = selIds.indexOf(row) >=0;
								!ischecked ? $('#mailStoreDiv').show() : $('#mailStoreDiv').hide();//No I18N
							}
						break;
						case "agents" ://No I18N
							if(colMod[col].name == "AGENTTYPE" && $(event.target).hasClass('associateAgent'))
							{
								associateAgent(rowContent);
								return;
							}
							if(colMod[col].name == "AGENTTYPE" && $(event.target).hasClass('convertToAgent'))
							{
								convertAgentDialog(rowContent);
								return;
							}
							if(colMod[col].name == "actions" && $(event.target).is( "i" ))
							{
								 OPMClient.Settings.deleteAgent(rowContent)
							}
							else if(colMod[col].name != 'AGENT_MODISPLAYNAME')
							{
								return false;
							}
							break;						
						case "agentsSupport" ://No I18N
							if(colMod[col].name == "actions")
							{
								 OPMClient.Settings.deleteAgent(rowContent)
							}
							else
							{
								return false;
							}
						case "WANLeast" ://No I18N
							OPMClient.InventoryDeviceDetailsController.sourceDeviceName = window.OPM.isCentralServer ?  rowContent.SOURCE_DEVICENAME : undefined;
						 	colMod[col].name == "SOURCENAME" ? location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/IPSLAWAN/"+rowContent.PROBE_ID:'';	//No I18N	
						 	break;	
						// case "Attacks.AdvanceSettings" ://No I18N
						// 	colMod[col].name == "4" ? OPMClient.Settings.ShowNBAADSettings(row,gridTable):'';	//No I18N	
						// 	break;
						case "billingInterfaceOnDemandReport": //No I18N
							if(colMod[col].name == 'onDemandLink') {
								OPMClient.Reports.loadBillingOnDemandReport(defaultOptions.planID,rowContent.intfid,defaultOptions.type,'Interface'); //No I18N
							}
							break;
						case "billingIPGroupOnDemandReport": //No I18N
							if(colMod[col].name == 'onDemandLink') {
								OPMClient.Reports.loadBillingOnDemandReport(defaultOptions.planID,rowContent[1],defaultOptions.type,'IPGroup'); //No I18N
							}
							break;
						case "billingIntfGroupOnDemandReport": //No I18N
							if(colMod[col].name == 'onDemandLink') {
								OPMClient.Reports.loadBillingOnDemandReport(defaultOptions.planID,rowContent[1],defaultOptions.type,'IntfGroup'); //No I18N
							}
							break;
						case "nfaListAlertProfilesGrid" : //NO I18N
							if(colMod[col].name==="Name") { //NO I18N
								nfa_redirectAlertProfile((rowContent.isLinkDown==="true"),(rowContent.isRealTimeAlert==="true"),"Modify",rowContent.ID); //NO I18N
							}
							break;
						case "nfaTPAlertProfilesGrid" : //NO I18N
							if(colMod[col].name==="name") { //NO I18N
								nfa_redirectTPAlertProfile("Modify",rowContent.id); //NO I18N
							}
							break;
						case "nfaSecurityAlertProfilesGrid" : //NO I18N
							if(colMod[col].name==="name") { //NO I18N
								nfa_redirectSecurityAlertProfile("Modify",rowContent.id); //NO I18N
							}
							if(colMod[col].name==="alert_count") { //NO I18N
								OPMClient.SettingsNFAConfigController.gridRowData = rowContent;
								opmGlobalRoute.transitionTo("Settings.NetflowConfig.AlertProfiles.Security.Events"); //NO I18N
							}
							break;
						case "nfaNDRAlertProfilesGrid": //NO I18N
							if(colMod[col].name === "PROFILE_NAME") { //NO I18N
								nfa_NDRAlertProfileAction("Edit", rowContent.PROFILE_ID); //NO I18N
							}
							break;
						case "nfaReportProfileListTbl" : //NO I18N
							if(colMod[col].name==="name") { //NO I18N
								$(this).toggleSubGridRow(row);
							}
							break;
						case "NotificationTemplatesTbl": //NO I18N
						 	if(colMod[col].name==="profileName" && !$("#npEditField").hasClass('validateField error') && !$("#npEditField").is(":visible")) { //NO I18N
						 		nt_getNotificationTemplateActions("Edit",rowContent.templateID,rowContent.profileTypeKey,rowContent.profileName); //NO I18N
						 	}
						 	break;
						case "nfa_appsOnSelect": //NO I18N
							if(colMod[col].name == "9" && !window.iscollector){
								opmGlobalRoute.transitionTo("Settings.NetflowConfig.Map.AppList.Edit", {ID: rowContent["0"]}); //NO I18N
							}
							break;
						case "nfa_servicesOnSelect": //NO I18N
							if(colMod[col].name == "9" && !window.iscollector){
								opmGlobalRoute.transitionTo("Settings.NetflowConfig.Map.Services.Edit", {ID: rowContent["0"]}); //NO I18N
							}
							break;
						case "NFAList" ://No I18N
							if(window.OPM.isProbe && rowContent.fromCentral == 1) {
								return;
							}
							colMod[col].name == "Name" || colMod[col].name == "name" ? OPMClient.Settings.editGroupsAction(row,"NFAList") :'';	//No I18N
							break;
						case "IPGroupList" ://No I18N
							if(window.OPM.isProbe && rowContent.fromCentral == 1) {
								return;
							}
							var task;
							if(colMod[col].name == 'displayName') { //No I18N
								task='Edit'; //No I18N
							}else if(colMod[col].name == 'Copy'){ //No I18N
								task=colMod[col].name;
							}else{
								return;
							}
							OPMClient.SettingsNFAConfigController.GrpsEditRow = grid.jqGrid("getRowData", row); //No I18N
							settingsGlobalRoute.transitionTo("Settings.NetflowConfig.Groups.IP.Operation", task); //No I18N
							break;	
						case "FWAProfileList" ://No I18N
							colMod[col].name == "PROFILENAME" ? OPMClient.Settings.FWProfileList(row,gridTable) :'';	//No I18N	
							break;
						// case "nbaAlarmProfileList"://No I18N
						// 	colMod[col].name == "profname" ? OPMClient.Settings.NBAeditAlertProfiles(row,gridTable):'';	//No I18N	
						// 	break;	
						case "criteriaTableforDG" ://No I18N 
							colMod[col].name == "gridAction" ? NCMRowDelete('criteriaTableforDG',row):''; //No I18N 
							hideData('criteriaTableforDG');//No I18N 
							break;
						case "criteriaTableforRule" ://No I18N 
							colMod[col].name == "gridAction" ? NCMRowDelete('criteriaTableforRule',row):''; //No I18N 
							hideData('criteriaTableforRule');//No I18N 
							break;
						case "FWDeviceGroup" ://No I18N
							colMod[col].name == "grpName" ? OPMClient.Settings.FWEditDevGroup(row,gridTable) :'';	//No I18N	
							break;
						case "NFAWidget.EE.IntfStats": //NO I18N
							if(colMod[col].name==="probeName") { //NO I18N
								nfa_opmee_redirectToInvList(rowContent.probeId, "Interfaces"); //NO I18N
							}
							break;
						case "NFAWidget.EE.FlowTypeStats": //NO I18N
							if(colMod[col].name==="probeName") { //NO I18N
								nfa_opmee_redirectToInvList(rowContent.probeId, "Devices"); //NO I18N
							}else {
								nfa_opmee_redirectToInvList(rowContent.probeId, "Devices", colMod[col].index); //NO I18N
							}
							break;
						case "NFAWidget.EE.GroupsStats": //NO I18N
							if(colMod[col].name==="ipGroup" || colMod[col].name==="intfGroup") { //NO I18N
								nfa_opmee_redirectToInvList(rowContent.probeId, "Groups", colMod[col].index); //NO I18N
							}
							break;
						case "NFAWidget.EE.AppsStats": //NO I18N
							if(colMod[col].name==="layer4" || colMod[col].name==="layer7" || colMod[col].name==="Services") { //NO I18N
								nfa_opmee_redirectToInvList(rowContent.probeId, "Apps", colMod[col].index); //NO I18N
							}else if(colMod[col].name==="as") { //NO I18N
								nfa_opmee_redirectToInvList(rowContent.probeId, "ASView"); //NO I18N
							}
							break;
						case "NFAWidget.EE.AlertsStats": //NO I18N
							if(colMod[col].name==="real_alert_profile_count" || colMod[col].name==="agg_alert_profile_count") { //NO I18N
								nfa_opmee_redirectToAlertProfiles(rowContent.probeId, colMod[col].index);
							}
							break;
						case "NFAWidget.EE.AttacksStats": //NO I18N
							if(colMod[col].name==="probeName") { //NO I18N
								nfa_opmee_redirectToInvList(rowContent.probeId, "Attacks"); //NO I18N
							}
							break;
						case "NFAWidget.EE.AgentsStats": //NO I18N
							if(colMod[col].name==="probeName") { //NO I18N
								nfa_opmee_redirectToNPS(rowContent.probeId);
							}
							break;
						case "nfaL4AppsDashWidget": //No I18N
							if(colMod[col].name == "AppName") { //No I18N
								nfa_setTimeFrameForDashboardDrillDown(defaultOptions.timeFrame);
								redirectToNFAL4APPS(rowContent.AppName);
							}
							break;
						case "nfaL7AppsDashWidget": //No I18N
							if(colMod[col].name == "AppName") { //No I18N
								nfa_setTimeFrameForDashboardDrillDown(defaultOptions.timeFrame);
								redirectToNFAL7APPS(rowContent.AppID);
							}
							break;
						case "nfaServicesDashWidget": //NO I18N
							if(colMod[col].name === "AppName") { //NO I18N
								nfa_setTimeFrameForDashboardDrillDown(defaultOptions.timeFrame);
								redirectToNFAServices(rowContent.AppName);
							}
							break;
						case "ipam_CFM": //No I18N
							//var selDevice = $(grid.jqGrid('getCell', row, 'ip-address')).attr("title"); //No I18N
							// if(event.srcElement.className.indexOf("oputilsippingicon") !== -1){
							// 	OPMClient.InventoryOpUtilsController.pingtooltipip=selDevice;
							// 	OPMClient.InventoryOpUtilsController.set('IPRelatedToolActionPage','CFM'); //No I18N
							// 	return;
							// }
							// if($(event.target).hasClass('icon-configedit')){
							// 	OPMClient.InventoryOpUtilsController.cfmInvListActionObj.ipAddress = selDevice;
							// 	OPMClient.InventoryOpUtilsController.cfmInvListActionObj.action = "Edit";//No I18N
							// 	// location.href=window.OPM.apiclientUrl+"Inventory/List/OpUtils/BWM/Edit/"+rowContent.interfaceid;//No I18N
							// 	redirectList('OpUtils',"AddCFMDevice");//No I18N
							// }
							// if(colMod[col].name == "ip-address") { //No I18N 
							// 	$(gridTable).jqGrid('resetSelection');
							// 		OPMClient.InventoryOpUtilsController.cfmInvListActionObj.ipAddress = selDevice;
							// 	OPMClient.InventoryOpUtilsController.cfmInvListActionObj.action = "Edit";//No I18N
							// 	redirectList('OpUtils',"History");//No I18N
							// }
							break;
						case "ipam_BWM": //No I18N
							
							
							break;

							case "nfa_invReportDetails": //NO I18N
								if(colMod[col].name == "advDetails"){
									nfa_loadViolationReport(rowContent);
								}
							break;
							
						case "nfaScheduleList": //NO I18N
						case "nfaSchSubList": //NO I18N
							if(colMod[col].name!=="actions" && colMod[col].name!=="statusBtn") { //NO I18N
								$(this).toggleSubGridRow(row);
							}
							break;
						case "nfa_asGroupsOnSelect": //NO I18N
							if(colMod[col].name === "Name"){ //NO I18N
								opmGlobalRoute.transitionTo("Settings.NetflowConfig.Groups.AS.Edit", rowContent.id); //NO I18N
							}else if(colMod[col].name === "actions"){ //NO I18N
								nfa_deleteASGroup(rowContent.Name, rowContent.id);
							}
							break;
						case "nfa_devGroupOnSelect": //NO I18N
							OPMClient.SettingsNFAConfigController.GrpsEditRow = rowContent;
							if(!window.iscollector && rowContent.name !== "ALL DEVICES GROUP" && !(window.OPM.isProbe && rowContent.fromCentral == 1)){ //NO I18N
								switch(colMod[col].name){
									case "name": 		opmGlobalRoute.transitionTo("Settings.NetflowConfig.Groups.Device.Edit", {groupID: rowContent.devGrpID}); break; //NO I18N
									case "actions": 	nfa_deleteDeviceGroup(rowContent); break; //NO I18N
								}
							}
							break;
						case "nfaInvList_CloudServices": //NO I18N
						case "nfaInvList_Users": //NO I18N
							var snapType, filterType;
							if(onSelectFunction === "nfaInvList_CloudServices"){ //NO I18N
								snapType = "FlowCloudService"; filterType = "CloudServices"; //NO I18N
								window.OPM.deviceListForNextPrev = ""; //NO I18N
							}else{
								snapType = "FlowUser"; filterType = "Users"; //NO I18N
								window.OPM.deviceListForNextPrev = grid.getCol("IPName", false); //NO I18N
							}
							var gridRowData = grid.jqGrid("getRowData", row); //NO I18N
							var selectedCloudUser = gridRowData.IPName;
							OPMClient.InventoryDeviceDetailsController.set("inventorysnapType", snapType); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("nfaDeviceID", selectedCloudUser); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("gridRowData", gridRowData); //NO I18N
							if(onSelectFunction === "nfaInvList_CloudServices"){
								OPMClient.InventoryDeviceDetailsController.gridRowData.filterDeviceID = $("#nfaCloudServices .opmRadioBtn input[type='radio']:checked").data("key");
							}else{
								OPMClient.InventoryDeviceDetailsController.gridRowData.filterDeviceID = $("#cloudUsersDeviceFilter .SingleBar.active").data("key"); //NO I18N
							}
							nfa_setInvListToSnapshotTimeFrame();
							if(colMod[col].name === "traffic"){ //NO I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selectedCloudUser);
								shortSummaryRowKeydownNew();
								opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary", filterType, selectedCloudUser); //NO I18N
							}else{
								opmGlobalRoute.transitionTo("Inventory.Device.index", snapType, selectedCloudUser); //NO I18N
							}
							break;

							case "nfa_forensicsReport": //NO I18N
								var drilldownData = {value: true, rowData: rowContent};
								delete drilldownData.rowData.indvTrafficGraph;
								switch(colMod[col].name){
									case "indvTrafficGraph"		: 	drilldownData.type = "toIndividualGraph"; break; //NO I18N
									case "appflow"				: 	drilldownData.type = "toAppFlowSlide"; break; //NO I18N
									default 					: 	drilldownData.type = "toConversation"; break; //NO I18N
								}
								OPMClient.NFAReportsController.set("forensicsDrillDown", drilldownData); //NO I18N
								break;

							case "nfa_favoriteReport": //NO I18N
								if(colMod[col].name !== "actions"){ //NO I18N
									nfa_favoriteReportAction("redirect", rowContent.id, rowContent.type); //NO I18N
								}
								break;

							case "dpi_forensicsReport": //NO I18N
								OPMClient.NFAReportsController.set("forensicsDrillDown", {value: true, rowData: rowContent}); //NO I18N
								break;
							case "fwaDeviceWidget": //NO I18N
								fwa_Opmee_RedirectToInvList(rowContent["0"], "Devices"); //NO I18N
								break;
							case "fwaAlarmsbycategory": //NO I18N
								fwa_Opmee_RedirectToAlarmList(rowContent["0"]); //NO I18N
								break;
							case "fwaVpnReport": //NO I18N
								fwa_Opmee_RedirectToReport(rowContent.probeid,"Reports.FWAReports/VpnReports"); //NO I18N
								break;
							case "fwaSecurityReport": //NO I18N
								fwa_Opmee_RedirectToReport(rowContent.probeid,"Reports.FWAReports/FireReports"); //NO I18N
								break;
							case "fwaRulesView": //NO I18N
								fwa_Opmee_RedirectToReport(rowContent.probeid,"Reports.FWAReports/RuleManagement/Overview"); //NO I18N
								break;
							case "fwaObjView": //NO I18N
								fwa_Opmee_RedirectToReport(rowContent.probeid,"Reports.FWAReports/RuleManagement/Overview"); //NO I18N
								break;
							case "fwaConfView": //NO I18N
								fwa_Opmee_RedirectToFwaTab(rowContent.probeid); 
								break;
							case "fwaAnomalyView": //NO I18N
								fwa_Opmee_RedirectToReport(rowContent.probeid,"Reports.FWAReports/RuleManagement/Optimization"); //NO I18N
								break;
							case "ipam_DHCP_Scopes"://NO I18N
                                 if(colMod[col].name === "dhcp-scope-address"){
                                     var tabs=gridCallBackParams.self.snapshotObj.totalSnapData.tabs.tabs;
                                     var tabid;
                                     var scopeId = rowContent["dhcp-scope-id"];//NO I18N
                                     OPMClient.InventoryOpUtilsController.set("dhcpFilterReload",scopeId);//NO I18N
                                     for( var i=0;i<tabs.length;i++){
                                         if(tabs[i].name==='webclient.admin.appmanager.serverip'){
                                             tabid=tabs[i].tabid;
                                             break;
                                         }
                                     }
                                     $(".intfSubTabs li[data-tabid="+tabid+"]").click();
                                 }
                                 break;

							case "dpi_detailedWidget": //NO I18N
								nfa_getModelForDetailedWidgetThirdLevel(gridCallBackParams.self, rowContent);
								break;
							case "dpi_dashboardWidget": //NO I18N
								var columnName = defaultOptions.onSelectParams && defaultOptions.onSelectParams.gridParam ? defaultOptions.onSelectParams.gridParam : ""; //NO I18N
								if (!columnName || colMod[col].name !== columnName) {
									return;
								}
								OPMClient.InventoryDeviceDetailsController.gridRowData = {dpiEngineID: defaultOptions.onSelectParams.dpiEngineID};
								opmGlobalRoute.transitionTo("Inventory.Device.index", defaultOptions.onSelectParams.snapType, encodeURIComponent(rowContent[columnName])); //NO I18N
								break;
                            case "ipam_scopes_selected"://NO I18N
                                 if(colMod[col].name === "scopeaddr"){
                                    var selfData = window.OPM.currentView.handler.controller;
                                    if(selfData != undefined){
                                        var tabs = selfData.model.totalSnapData.tabs.tabs;
                                        var tabid;
                                        var scopeId = rowContent.scopeid;
                                        OPMClient.InventoryOpUtilsController.set("dhcpFilterReload",scopeId);//NO I18N
                                        for( var i=0;i<tabs.length;i++){
                                            if(tabs[i].name==='webclient.admin.appmanager.serverip'){
                                                tabid=tabs[i].tabid;
                                                break;
                                            }
                                        }
                                        if(tabid != undefined){
                                            backToDevSnapshotPage();
                                            deviceSlideOut(2);
                                        }
                                        $(".intfSubTabs li[data-tabid="+tabid+"]").click();
                                    }
                                 }
                                 break;
						}
						var invColName = colMod[col].name;
						if(['nfaIntfTopSrcTbl','nfaIntfTopDestTbl'].contains(onSelectFunction) && invColName === "modifyDNS" && rowContent.Name !== "Others"){ //No I18N
							OPMClient.InventoryDeviceDetailsController.resolveDNS = $("#param_"+defaultOptions.snapId+"_ResolveDNS").prop('checked'); //No I18N
							OPMClient.InventoryDeviceDetailsController.snapIndex = defaultOptions.snapIndex;
						}else if(['nfaIntfTopAppTbl','nfaIntfTopSrcTbl','nfaIntfTopDestTbl','nfaIntfTopQosTbl','nfaIntfTopConvTbl','nfaAppGrpWidget','avcNbar2AppConDetails',"nfaGeolocationSubTbl","nfaCloudUserConvTable"].contains(onSelectFunction) && invColName === "indvTrafficGraph" && rowContent.Name !== "Others") {//No I18N
							OPMClient.InventoryDeviceDetailsController.showGraphAll = false;
							OPMClient.InventoryDeviceDetailsController.convRowData = rowContent;
							OPMClient.InventoryDeviceDetailsController.Data = $('input[name="Data_'+defaultOptions.snapId+'"]:checked').val();
							OPMClient.InventoryDeviceDetailsController.resolveDNS = $("#param_"+defaultOptions.snapId+"_ResolveDNS").prop('checked');
							OPMClient.InventoryDeviceDetailsController.groupBy = $("#param_"+defaultOptions.snapId+"_GroupBy").val(); //No I18N
							OPMClient.InventoryDeviceDetailsController.entity = rowContent.Name;
							OPMClient.InventoryDeviceDetailsController.snapId = defaultOptions.snapId;
							switch(onSelectFunction) {
								case "nfaAppGrpWidget" : OPMClient.InventoryDeviceDetailsController.widgetType = "AppGrp";break; //NO I18N
								case "avcNbar2AppConDetails": 	OPMClient.InventoryDeviceDetailsController.widgetType = "NBAR2Application"; //NO I18N
																OPMClient.InventoryDeviceDetailsController.entity = rowContent["1"]; //NO I18N
																break;
								case "nfaIntfTopAppTbl":
								case "nfaIntfTopQosTbl":OPMClient.InventoryDeviceDetailsController.widgetType=$('#param_'+defaultOptions.snapId+'_Type').val();break;//No I18N
								case "nfaIntfTopSrcTbl":OPMClient.InventoryDeviceDetailsController.widgetType = $("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")?"SrcNetwork":"Source";break; //NO I18N
								case "nfaIntfTopDestTbl":OPMClient.InventoryDeviceDetailsController.widgetType = $("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")?"DstNetwork":"Destination";break; //NO I18N
								case "nfaIntfTopConvTbl":OPMClient.InventoryDeviceDetailsController.widgetType = $("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")?"ConvNetWork":"Conversation";break; //NO I18N
								case "nfaGeolocationSubTbl": 	OPMClient.InventoryDeviceDetailsController.groupBy = ""; //NO I18N
																OPMClient.InventoryDeviceDetailsController.entity = rowContent.src+" - "+rowContent.dst+" - "+rowContent.app+" - "+rowContent.prot; //NO I18N
																OPMClient.InventoryDeviceDetailsController.widgetType = "Conversation"; //NO I18N
																break;
								case "nfaCloudUserConvTable": 	OPMClient.InventoryDeviceDetailsController.widgetType = "cloudUser"; //NO I18N
																OPMClient.InventoryDeviceDetailsController.entity = rowContent["0"]+" - "+rowContent["1"]+" - "+rowContent["2"]; //NO I18N
																break;
							}
							if(['Source','Destination'].contains(OPMClient.InventoryDeviceDetailsController.entity)) {
								OPMClient.InventoryDeviceDetailsController.entity = rowContent.ip;
							}
							
							if(onSelectFunction === "nfaIntfTopConvTbl") {
								OPMClient.InventoryDeviceDetailsController.entity = rowContent.src+" - "+rowContent.dst+" - "+rowContent.app+" - "+rowContent.prot;//No I18N
								var groupBy = $('#param_'+defaultOptions.snapId+'_GroupBy').val();
								if(groupBy !=="" && groupBy !=="dscp") { //No I18N
									OPMClient.InventoryDeviceDetailsController.convRowData.dscpCode='Any'; //No I18N
								}
							}
							if(deviceBasicDetails && deviceBasicDetails.snapType === "FlowInterface" && deviceBasicDetails.isNFG){ //NO I18N
								OPMClient.InventoryDeviceDetailsController.Data = "IN"; //NO I18N
							}
							redirectSnapShot('IndividualGraph');//No I18N
						}else if(onSelectFunction === "nfaDrillDownTopConvTbl"  && invColName === "indvTrafficGraph" && rowContent.Name!=="Others") { //No I18N
							if(deviceBasicDetails != undefined && deviceBasicDetails.snapType == "FlowL7"){
								rowContent.appID = rowContent.app;
								rowContent.app = deviceBasicDetails.AppName;
							}
							if(OPMClient.InventoryDeviceDetailsController.defaultOptions !== undefined){
								rowContent.parentWidget = OPMClient.InventoryDeviceDetailsController.defaultOptions.parentWidget;
								rowContent.sourceType = OPMClient.InventoryDeviceDetailsController.defaultOptions.sourceType;
								rowContent.destinationType = OPMClient.InventoryDeviceDetailsController.defaultOptions.destinationType;
							}
							OPMClient.InventoryDeviceDetailsController.showGraphAll = false;
							OPMClient.InventoryDeviceDetailsController.convRowData = rowContent;
							OPMClient.InventoryDeviceDetailsController.widgetType = defaultOptions.widgetType; 
							OPMClient.InventoryDeviceDetailsController.Data = defaultOptions.inOutVal;
							OPMClient.InventoryDeviceDetailsController.resolveDNS = defaultOptions.resolveDNS; 
							OPMClient.InventoryDeviceDetailsController.groupBy = defaultOptions.groupBy;
							OPMClient.InventoryDeviceDetailsController.entity = rowContent.src+" - "+rowContent.dst+" - "+rowContent.app+" - "+rowContent.prot;//No I18N
							var groupBy = $('#groupByDiv .select2').val();
							if(groupBy !=="" && groupBy !=="dscp") { //No I18N
								OPMClient.InventoryDeviceDetailsController.convRowData.dscpCode='Any'; //No I18N
							}
							OPMClient.InventoryDeviceDetailsController.snapId = defaultOptions.snapId;
							redirectSnapShot('IndividualGraph');//No I18N
						}else if(["wlcSnapClientsWidget", "wlcSnapSSIDWidget", "wlcSnapApMacWidget", "wlcSnapAppTraffic", "wlcSnapQosTraffic", "WlcApMacSnapClients", "WlcApMacSnapSSID", "wlcApMacAppTraffic", "wlcApMacQosTraffic", "ssidClientSnapApMacWidget", "ssidSnapClientsWidget", "wlcSSIDGroupSnapAP", "clientSnapSSIDWidget", "ssidClientSnapAppsWidget", "ssidClientSnapQoSWidget", "ClientIPSnapClientMACWidget", "ClientMACSnapClientIPWidget", "apmacConversationTbl"].contains(onSelectFunction) && invColName === "indvTrafficGraph" && rowContent.Name !== "Others"){ //NO I18N
							OPMClient.InventoryDeviceDetailsController.showGraphAll = false;
							OPMClient.InventoryDeviceDetailsController.convRowData = rowContent;
							OPMClient.InventoryDeviceDetailsController.entity = rowContent.Name;
							if(OPMClient.InventoryDeviceDetailsController.entity  == undefined && rowContent["1"] != undefined){
								OPMClient.InventoryDeviceDetailsController.entity = rowContent["1"];
							}
							OPMClient.InventoryDeviceDetailsController.widgetType = defaultOptions.reportType; 
							OPMClient.InventoryDeviceDetailsController.Data = $('input[name="type_'+defaultOptions.snapId+'"]:checked').val();
							OPMClient.InventoryDeviceDetailsController.snapId = defaultOptions.snapId;
							redirectSnapShot('IndividualGraph');//NO I18N
						}else if(onSelectFunction === "nfaSNMPSchedulerList" && colMod[col].name === 'taskName') { //No I18N
							var taskID = grid.jqGrid('getCell', row, 'taskID');//No I18N
							if (taskID !== null && taskID !== "") {
								opm_transitionToParentRoute("Settings.Discovery.AutoSNMP.Profile",{task:"Edit",taskID:taskID}); //No I18N
							}
						}else if(onSelectFunction == "nfaPortInfoTbl" && ["connected-port-ifindex","connected-port-ifname","connected-port-ifdesc"].contains(colMod[col].name)) { //NO I18N
							var interfaceID = grid.jqGrid("getCell",row,"NFAIFIndex"); //NO I18N
							if(interfaceID!=-1) {
								redirectToSnapshot("FlowInterface",interfaceID); //NO I18N
							}
						}
						if(onSelectFunction === "userReportsList" &&colMod[col].name === 'displayName')
						{
							var selReportId = grid.jqGrid('getCell', row, 'id');//No I18N
							var reportname = grid.jqGrid('getCell', row, 'displayName'); //No I18N	
							OPMClient.ReportsDetailsController.isCustomReport = grid.jqGrid('getCell', row, 'isCustom'); //No I18N
							opm_showUserReportsView(selReportId,reportname);

						}
						if(onSelectFunction === "defReportsList" &&colMod[col].name === 'displayName')
						{
							var selReportId = grid.jqGrid('getCell', row, 'id'); //No I18N	
							OPMClient.ReportsDetailsController.isCustomReport = grid.jqGrid('getCell', row, 'isCustom'); //No I18N
							goToReportsPageLink(selReportId,OPMClient.ReportsDetailsController.reportName);
						}
						if(onSelectFunction === "apmReportsList" &&colMod[col].name === 'displayName')
						{
							var apmUrl = grid.jqGrid('getCell', row, 'url'); //No I18N	
							OPMClient.APMReportsController.apmUrl = apmUrl;
							if(OPMClient.APMReportsController.reportType==="TREND_ANALYSIS"){//No I18N
								var selectedMonitor = $("#reportTypeFilter").val();
								if(selectedMonitor==null){
									opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.common.widgets.selectamonitor",this));//No I18N
									return;
								}
								OPMClient.APMReportsController.apmUrl += "&resid="+selectedMonitor+"&resourceid="+selectedMonitor;//No I18N
							}else if(OPMClient.APMReportsController.reportType==="MONITOR_GROUP"){//No I18N
								OPMClient.APMReportsController.apmUrl += "&haid="+$("#reportTypeFilter").val();//No I18N
							}
							if(window.OPM.isEEProbeSelected){
								var url = localStorage.getItem("ProbeURL") + window.OPM.apiclientUrl + "APM/List"; //No I18N
								window.open(url, '_blank'); //No I18N
							}else{
								opmGlobalRoute.transitionTo('Reports.Applications.Report',OPMClient.APMReportsController.reportType);//No I18N
							}
						}
						if(onSelectFunction === "AdvancedReportsList" &&colMod[col].name === 'Name')
						{
							OPMClient.ReportsDetailsController.set('isViewReport',true); //No I18N
							var selReportId = grid.jqGrid('getCell', row, 'ReportId'); //No I18N
							var Name = grid.jqGrid('getCell', row, 'Name'); //No I18N
							var isCustom = grid.jqGrid('getCell', row, 'isCustom'); //No I18N
							var isEdit = grid.jqGrid('getCell', row, 'isEdit'); //No I18N
							var isAPMReport = grid.jqGrid('getCell', row, 'isAPMReport'); //No I18N
							if(isEdit==='true' && isCustom ==='true'){
								$("#editReport").show();
							}else{
								$("#editReport").hide();
							}
							if(isAPMReport ==='true'){
								$("#addwidget").hide()
							}
							OPMClient.ReportsArrayController.AdvancedReportsId=selReportId;
							OPMClient.ReportsDetailsController.set("isCustomAdvancedReport",OPMClient.ReportsDetailsController.isCustomReport); //No I18N
							OPMClient.ReportsDetailsController.set("reportRequestId",undefined); //No I18N
							viewAdvanceReport(selReportId,Name);
						}
						else if(onSelectFunction === "downloadCreatedReport" && colMod[col].name === 'fileName') {
							var fileId = grid.jqGrid('getCell', row, 'fileId'); //No I18N
							var data = {fileId:fileId};
							downloadAdvancedReport(data);
						}
						else if(onSelectFunction === "opm_VLANs" && colMod[col].name === 'vlanName')
						{
							var VLANName = grid.jqGrid('getCell',row,'name'); //No I18N
							redirectToSnapshot("MonitoringVLAN",VLANName); //No I18n
							var VLANList = grid.getCol('name',false,''); //No I18n
							OPMClient.InventoryOpmDeviceListController.set("VLANFrmList",true); //No I18n
							if (VLANName !== null && VLANName !== "")//No I18n
							{
								window.OPM.deviceListForNextPrev = VLANName;
								window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringVLAN"; //No I18N
								redirectToSnapshot("MonitoringVLAN", VLANName); //No I18N
							}
							if(VLANList !== null || VLANList !== "")
							{
								window.OPM.deviceListForNextPrev = VLANList;
							}
						}
						else if(onSelectFunction === "OPMTenant")
						{
							var tenantName = grid.jqGrid('getCell',row,'tenantMOName'); //No I18N
							//redirectToSnapshot("MonitoringTenant",tenantName); //No I18n
							var tenantList = grid.getCol('tenantMOName',false,''); //No I18n
							if (tenantName !== null && tenantName !== "")//No I18n
							{
								window.OPM.deviceListForNextPrev = tenantName;
								window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringTenant"; //No I18N
								redirectToSnapshot("MonitoringTenant", tenantName); //No I18N								
							}
							if(tenantList !== null || tenantList !== "")
							{
								window.OPM.deviceListForNextPrev = tenantList;
							}
						}
						else if((onSelectFunction === "ipam_Ping") && colMod[col].name !== "cb") //No I18N
						{
							var deviceIdList = grid.getCol('ip-address',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', row, 'ip-address'); //No I18N
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if (selDevice != null && selDevice != "")
							{
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMPing"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								redirectToSnapshot("IPAMPing", selDevice); //No I18N
								// shortSummaryRowKeydownNew();
								// opmGlobalRoute.transitionTo('Inventory.List.OpUtils.Sub.ShortSummary','Ping',selDevice); //No I18N
							}
						}
						else if((onSelectFunction === "ipam_NWMAlerts") && colMod[col].name !== "cb" && colMod[col].name == "ip-address") //No I18N
						{
							var deviceIdList = grid.getCol('ip-address',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', row, 'ip-address'); //No I18N
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList;
							}
							if (selDevice != null && selDevice != "")
							{
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMPing"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								redirectToSnapshot("IPAMPing", selDevice); //No I18N
								// shortSummaryRowKeydownNew();
								// opmGlobalRoute.transitionTo('Inventory.List.OpUtils.Sub.ShortSummary','Ping',selDevice); //No I18N
							}
						}

						if(onSelectFunction === "QueryReportsList" &&colMod[col].name === 'Name')
						{
                            OPMClient.ReportsDetailsController.set('isViewQueryReport',true); //No I18N
                            var selReportId = grid.jqGrid('getCell', row, 'ReportId'); //No I18N
                            var name = grid.jqGrid('getCell', row, 'Name'); //No I18N
                            OPMClient.ReportsArrayController.EditQueryReportID=selReportId;
                            OPMClient.ReportsArrayController.EditReportName=name;
                            viewQueryReport(false);
						}

						if(onSelectFunction === "defReportsList" && (colMod[col].name === "displayName"))
						{
							var selReportId = grid.jqGrid('getCell', row, 'id'); //No I18N	
							OPMClient.ReportsDetailsController.isCustomReport = grid.jqGrid('getCell', row, 'isCustom'); //No I18N
							goToReportsPageLink(selReportId); 
						}
						
						if(onSelectFunction  === 'opm_DeviceAlarmsList' && (colMod[col].name !== "cb"))
						{

							var selEntity = grid.jqGrid('getCell', row, 'alarmId'); //No I18N
							if (selEntity !== null && selEntity !== "")
							{
								redirectToAlarm(selEntity);
							}
						}

						if(onSelectFunction === "profileCriteria" && (colMod[col].name == "cb") )
						{
							var name = grid.jqGrid('getCell', row, 'monitorName'); //No I18N
							getCountTextForCriteria(name,'grid',row); //No I18N
							return true;
						}
						if(colMod[col].name ==='cb' && defaultOptions.showActionDiv)
						{
							var id = row;
							var tableName = gridTable.replace("#",'');
							var chkId = "#jqg_"+tableName+"_"+id ;//No I18N 
							var isChecked = $(chkId).is(":checked");
							var anySelectedB4 = $(gridTable).jqGrid('getGridParam','selarrrow').length > 1; 
							isChecked || anySelectedB4 ? $(".opmActionsIcons").slideDown(): $(".opmActionsIcons").slideUp() ;
							$(".opmForm").addClass("opmFormType5")
						}

						 if(onSelectFunction === "credentialsList"){//No I18N
							if(OPMClient.VMwareDiscoveryController.isVMwareDiscoveryWizard)
							{
								OPMClient.VMwareDiscoveryController.IsUserSelectedCredetials = true;
								OPMClient.VMwareDiscoveryController.userSelectedCredetials = $('#DECredProfList').jqGrid('getGridParam','selarrrow'); 
							}
						}

//						if(colMod[col] !== undefined && colMod[col].name !== undefined && colMod[col].name != "cb")
//						{
//							grid.jqGrid('resetSelection');//No I18N
//							grid.jqGrid('setSelection', row);//No I18N
//						}
						if ((onSelectFunction === "opm_alarmList") && colMod[col] !== undefined && colMod[col].name === "cb") { 
							if(!OPMClient.ApplicationController.isOPM) { 
								$('.opmSplActions').hide() 
								AlarmListCommonOptions();
							}
							if(OPMClient.ApplicationController.isNCM){
	       						$('.clear.opmSplActions').show();
	       					}
						}
						if ((onSelectFunction === "opm_alarmList") && colMod[col] !== undefined && colMod[col].name !== "cb" && colMod[col].name !== "prettyTime")
						{
							var selDevCate = grid.jqGrid('getCell', row, 'category'); //No I18N
							OPMClient.AlarmDetailsController.alarmCategory=selDevCate;
							var alarmIdList = grid.getCol('alarmId',false,''); //No I18N
							var selEntity = grid.jqGrid('getCell', row, 'alarmId'); //No I18N
							if (alarmIdList != null && alarmIdList != "")
							{
								window.OPM.alarmListForNextPrev = alarmIdList;
							}
							if (selEntity != null && selEntity != "")
							{
								//redirectToAlarm(selEntity);
								//opm_alarmShortSummaryView(row,rowMod[row-1]);

								//$('#opm_Alarms tr').click(function(){
								$('#opm_Alarms tr').removeClass('active');
								$("#"+row).addClass('active');
								var rowData=jQuery('#opm_Alarms').jqGrid('getGridParam','data');//No I18N
								if($(window).width() >= '1920')
								{
									var alarmProperties = OPMClient.Alarms.getAlarmDetails(rowMod[row-1].alarmId);
									opm_alarmShortSummaryView(rowMod[row-1],alarmProperties);
									opm_loadDiscussWithAlarm(rowMod[row-1].alarmId,alarmProperties);

								}
								else
								{
									redirectToAlarm(rowMod[row-1].alarmId);
								}
								

								ALRowKeydown();
								$('body').click(function(e){
									if(!$(e.target).closest('#AlarmList').length){
										$('#opm_Alarms tr').removeClass('active');
									}
								});

								$('#TabHolder .alarmShrtView li').off('click');
								$('#TabHolder .alarmShrtView li').click(function(e){
									redirectToAlarm(OPMClient.AlarmDetailsController.currentAlarmEntity);
									$(this).removeClass("active");
									OPMClient.AlarmDetailsController.alarmSubTab = $(this).attr('class');
								
								});

								$('.deviceslideActionBtn').hide();
								OPMClient.AlarmOptionsController.set('isShortsummary',true);//No I18N
								OPMClient.AlarmOptionsController.set('isMultipleAlarmSelected',false);//No I18N
								OPMClient.AlarmOptionsController.set('isListView',false);//No I18N
							}

						}
						else if(onSelectFunction === "infrasnapWidget" && ['displayName','total','error'].contains(colMod[col].name)) //No I18N
						{
							var catgory = grid.jqGrid('getCell', row, 'name'); //No I18N
							var error=grid.jqGrid('getCell', row, 'error');//No I18N
							var rwData = grid.jqGrid("getRowData", row);//No I18N
							 isFilterReset = true;	
							 opm_deviceListFilterReset();
							 localStorage.removeItem("opm_mapView");//No I18N
							 if(rwData.redirectTo !== undefined && rwData.redirectTo === "URL")
							 {
							 	redirectToInventorySub('Server/Url');//No I18N
							 }
							 else{
								var filterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
								filterObj.category.push(catgory);
								filterObj['group'] = new Array();
								filterObj['bv'] = new Array();
								var selectedSev;
								if(OPMClient.HomeDetailsController.widgetAditnlDetails[gridTable.split('#')[1]] !== undefined){
									var widgetFilterObj = OPMClient.HomeDetailsController.widgetAditnlDetails[gridTable.split('#')[1]];
									if(widgetFilterObj.bview !== undefined){
										filterObj.bv.push(widgetFilterObj.bview);
									}else if(widgetFilterObj.groupName !== undefined){
										filterObj.group.push(widgetFilterObj.groupName);
									}if(widgetFilterObj.selectedSev !== undefined){
										selectedSev = widgetFilterObj.selectedSev
									}
								}

								if(colMod[col].name === "error" &&  error !== "0"){
									if(selectedSev != null &&  selectedSev!= undefined){
										filterObj.severity.push(selectedSev.replace(/5,/g, '').replace(/^5$/, '').replace(',5','').replace('5','').split(","));
									}else{
									filterObj.severity.push(1,2,3,4,7);	
								}
								}
								localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
								redirectToInventorySub('Summary/Devices');//No I18N
							}

						}
						else if(onSelectFunction === "siteSnapshotWidget" && ['errDevCount','alertCount'].contains(colMod[col].name)) //No I18N
						{
							var probeName = grid.jqGrid('getCell', row, 'probeName'); //No I18N
							var error=grid.jqGrid('getCell', row, 'errDevCount');//No I18N
							 isFilterReset = true;	
							 opm_deviceListFilterReset();
							 localStorage.removeItem("opm_mapView");//No I18N
														
							if(colMod[col].name === 'alertCount')
							{
								var filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
								filterObj.probeName = probeName;
								initAlarmListFilters();
								redirectToAlarmList('Active');//No I18N

							}
							else{
								var filterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
								filterObj.probe.push(probeName);
								if(error !== "0"){
									filterObj.severity.push(1,2,3,4);	
								}
								localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
								redirectToInventorySub('Summary/Devices');//No I18N
							}

						
						}else if(onSelectFunction === "siteWiseSummaryWdiget" && ['4','5','6'].contains(String(colMod[col].name))) //No I18N
						{
							var probeName = grid.jqGrid('getCell', row, '0'); //No I18N
							var error=grid.jqGrid('getCell', row, '6');//No I18N
							var alarms=grid.jqGrid('getCell', row, '4');//No I18N
							var devices=grid.jqGrid('getCell', row, '5');//No I18N
							isFilterReset = true;	
							opm_deviceListFilterReset();
							localStorage.removeItem("opm_mapView");//No I18N
							
							if(String(colMod[col].name) === '4' && alarms !== '0')
							{
								var filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
								filterObj.probeName = probeName;
								initAlarmListFilters();
								redirectToAlarmList('Active');//No I18N
							}														
							else if((String(colMod[col].name) === '5' && devices !== '0') || (String(colMod[col].name) === '6' && error !== '0')){
								var filterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
								filterObj.probe.push(probeName);							
								if(error !== "0" && String(colMod[col].name) !== '5'){
									filterObj.severity.push(1,2,3,4,7);	
								}

								if(OPMClient.HomeDetailsController.dashboardName == "opmee.summary.network")
								{
								localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
									redirectToInventorySub('Monitoring/Devices');//No I18N	

								}else if(OPMClient.HomeDetailsController.dashboardName == "opmee.summary.storage") //No I18N
								{
									localStorage.setItem('RAIDfilterObj',JSON.stringify(filterObj)); //No I18N
									redirectToInventorySub('OpStor/RAID');//No I18N
								}
								else
								{
									localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
									redirectToInventorySub('Summary/Devices');//No I18N
								}								
							}
						}						
						else if((onSelectFunction === "deviceTypeSummaryWidget" || onSelectFunction === "vendorSummaryWidget" || onSelectFunction === "vmosSummaryWidget") && ['1','2','3'].contains(String(colMod[col].name))) //No I18N
						{
							var type = grid.jqGrid('getCell', row, '0'); //No I18N
							var error=grid.jqGrid('getCell', row, '3');//No I18N
							var alarms=grid.jqGrid('getCell', row, '1');//No I18N
							 var devices=grid.jqGrid('getCell', row, '2');//No I18N
							 isFilterReset = true;	
							 opm_deviceListFilterReset();
							 localStorage.removeItem("opm_mapView");//No I18N
								
							if(String(colMod[col].name) === '1' && alarms !== '0')
							{
								//var filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
								//filterObj.probeName = probeName;
								initAlarmListFilters();
								redirectToAlarmList('Active');//No I18N
							}
							else if((String(colMod[col].name) === '2' && devices !== '0') || (String(colMod[col].name) === '3' && error !== '0')){

								var filterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
								if(onSelectFunction === "vendorSummaryWidget")
								{
									filterObj.vendor.push(type);
								}
								else{
									filterObj.type.push(type);
								}
								if(error !== "0" && String(colMod[col].name) !== '2'){
									filterObj.severity.push(1,2,3,4,7);	
								}
								if(OPMClient.HomeDetailsController.dashboardName == "opmee.summary.storage")
								{
									var category = grid.jqGrid('getCell', row, '4');//No I18N
									localStorage.setItem(category+'filterObj',JSON.stringify(filterObj)); //No I18N
									redirectToInventorySub('OpStor/'+category);//No I18N
								}
								else
								{
								localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
								redirectToInventorySub('Summary/Devices');//No I18N									
							}
						
							}

						}else if(onSelectFunction === "interfaceSummaryWidget") //No I18N
						{
							var type = grid.jqGrid('getCell', row, '0'); //No I18N
							 isFilterReset = true;	
							 opm_deviceListFilterReset();
							 localStorage.removeItem("opm_mapView");//No I18N
	
							var filterObj = JSON.parse(localStorage.getItem('invIntfFilterObj')); //No I18N
							filterObj.category = [];
							filterObj.category.push(type);
							localStorage.setItem('invIntfFilterObj',JSON.stringify(filterObj)); //No I18N
							redirectToInventorySub('Summary/Interfaces');//No I18N
							
						
						}else if(onSelectFunction === "appserverSummaryWidget" && ['1','2','3'].contains(String(colMod[col].name))) //No I18N
						{
							var type = grid.jqGrid('getCell',row,'0'); //No I18N
							var currentCellName = String(colMod[col].name);
							isFilterReset = true;
							opm_deviceListFilterReset();
							localStorage.removeItem("opm_mapView");//No I18N
							if(grid.jqGrid('getCell', row, currentCellName) !== '0'){
								if(currentCellName === '1'){
									var filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
									filterObj.probeName = probeName;
									initAlarmListFilters();
									redirectToAlarmList('Active');//No I18N
								}else{
									var filterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
									filterObj.apps.push(type);
									if(currentCellName === '3'){
										filterObj.severity.push(1,2,3,4,7);
									}
									localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
									redirectToInventorySub('Server/Devices');//No I18N
								}
							}
						}else if(onSelectFunction === 'virtualVendorSummaryWidget' && 'vendor' !== String(colMod[col].name)){//No I18N
							var currentCellName = String(colMod[col].name);
							var vendorName = $($.parseHTML(grid.jqGrid('getCell',row,'vendor'))).text();//No I18N
							var filterObj = JSON.parse(localStorage.getItem(vendorName+'filterObj')); //No I18N
							localStorage.removeItem("opmVirt_mapView");//No I18N
							opm_VMListFilterReset();
							if(grid.jqGrid('getCell', row, currentCellName) !== '0'){
								if('alertCount' !== currentCellName){
									if(filterObj === null){
										filterObj = $.extend(true,{},OPMClient.InventoryDeviceDetailsController.deviceFilterObj);
										filterObj.subFilter = 'selectedVTypes';//No I18N
									}else{
										filterObj.selectedVTypes = [];
									}
									if('vcenter' === currentCellName){
										filterObj.selectedVTypes.push('vCenter');//No I18N
										localStorage.setItem('virtualEntityType','VCENTER');//No I18N
									}else if('hosts' === currentCellName){//No I18N
										if('VMware' === vendorName){
											filterObj.selectedVTypes.push('ESX Servers');//No I18N
											localStorage.setItem('virtualEntityType','VHOST');//No I18N
										}else{
											filterObj.selectedVTypes.push('HyperV' === vendorName ? 'Hyper-V Servers' : 'Xen' === vendorName ? 'XenServers' : 'Nutanix-Host');//No I18N
											localStorage.setItem('virtualEntityType',vendorName+'-Host');//No I18N
										}
									}else{
										filterObj.selectedVTypes.push('Nutanix' === vendorName ? 'Nutanix-VM' : 'Virtual Machines');//No I18N
										localStorage.setItem('virtualEntityType','VMware' === vendorName ? 'VM' : vendorName+'-VM');//No I18N
									}
									localStorage.setItem(vendorName+'filterObj',JSON.stringify(filterObj));//No I18N
									redirectToInventorySub('Virtualization/'+vendorName);//No I18N
								}else{
									filterObj = OPMClient.AlarmDetailsController.alarmFilterObj;
									filterObj.probeName = probeName;
									initAlarmListFilters();
									redirectToAlarmList('Active');//No I18N
								}
							}
						}else if(onSelectFunction === "severitySummaryWidget" && ['2'].contains(String(colMod[col].name))) //No I18N
						{
							var severity = grid.jqGrid('getCell', row, '1'); //No I18N
							 isFilterReset = true;	
							 opm_deviceListFilterReset();
							 localStorage.removeItem("opm_mapView");//No I18N
							var filterObj = JSON.parse(localStorage.getItem('filterObj')); //No I18N
							filterObj.severity.push(severity);	
							localStorage.setItem('filterObj',JSON.stringify(filterObj)); //No I18N
							if(OPMClient.HomeDetailsController.dashboardName == "opmee.summary.network")
							{
								redirectToInventorySub('Monitoring/Devices');//No I18N
							}
							else{
								redirectToInventorySub('Summary/Devices');//No I18N
							}
						
						}
						else if(onSelectFunction === "AdExMssqlMonitors") // No I18N
						{
							var policyName = grid.jqGrid('getCell', row, 'policyName'); //No I18N
							var rowData = grid.jqGrid('getRowData', row); //No I18N
							var showGraph = true;
							if(OPMClient.ApplicationController.currentRouteName.indexOf('Inventory.Device.MSSQL') >=0 )
							{
								OPMClient.DeviceMonitorsActionController.fromMSSQLsnapshotSubTab = true;
								OPMClient.DeviceMonitorsActionController.instancename = $('#mssqlInstances').val();
								if(OPMClient.DeviceMonitorsActionController.instancename === Ember.I18n.t('webclient.map.flash.Loading')){
									showGraph = false;	
								}
							}
							OPMClient.DeviceMonitorsActionController.set('pollID',rowData.pollId);//No I18N
							OPMClient.InventoryDeviceDetailsController.set('fromMSSQLTab','Inventory.Device.MSSQL.index' === window.OPM.currentView.name);//No I18N
							if(showGraph){
								openPerformanceMonEnhancedGraph(policyName,policyName,false,true,rowData.displayName);
							}
						}
						else if(onSelectFunction === "infrasnapWidget" && colMod[col].name === 'alarms')
						{
							var category = grid.jqGrid('getCell', row, 'name'); //No I18N
							initAlarmListFilters();
							OPMClient.AlarmDetailsController.set('infrastructureAlarmCategory',category);//No I18N
							if(OPMClient.HomeDetailsController.widgetAditnlDetails[gridTable.split('#')[1]] !== undefined){
								var widgetFilterObj = OPMClient.HomeDetailsController.widgetAditnlDetails[gridTable.split('#')[1]];
								if(widgetFilterObj.selectedSev !== undefined){
									OPMClient.AlarmDetailsController.set('infrastructureAlarmSeverity',widgetFilterObj.selectedSev);//No I18N
								}
							}
							redirectToAlarmList('Active');//No I18N

						}
						else if(onSelectFunction === "AlarmsTab" && colMod[col].name === 'message')
						{

							var sortColumnName = grid.jqGrid('getGridParam','sortname'); //No I18N
							var sortOrder = grid.jqGrid('getGridParam','sortorder'); //No I18N
							var alarmIdList = grid.getCol('entity',false,''); //No I18N
							var selEntity = grid.jqGrid('getCell', id, 'entity'); //No I18N

							if (selEntity !== null && selEntity !== "")
							{
								goToAlarmLink(selEntity);
							}

						}
						else if ((onSelectFunction === "ipam_opmDevices") && colMod[col].name !== "cb")//No I18N
						{
							var deviceIdList = grid.getCol('deviceName',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', row, 'deviceName'); //No I18N
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if (selDevice != null && selDevice != "")
							{
								redirectToDeviceSnapshot(selDevice);
							}
						} else if ((onSelectFunction === "snap_ucschassis") && colMod[col].name !== "cb")//No I18N
						{
							if(!OPMClient.ApplicationController.isCentralServer){
								var deviceIdList = grid.getCol('chassisID',false,''); //No I18N
								var selDevice = grid.jqGrid('getCell', row, 'chassisID'); //No I18N
								if (deviceIdList != null && deviceIdList != "")
								{
									window.OPM.deviceListForNextPrev = deviceIdList; 
								}
								if (selDevice != null && selDevice != "")
								{
									redirectToSnapshot("UCSChassis", selDevice); //No I18N
								}
							}
						} else if ((onSelectFunction === "snap_ucsfabric") && colMod[col].name !== "cb")//No I18N
						{
							if(!OPMClient.ApplicationController.isCentralServer){
								var deviceIdList = grid.getCol('fabricID',false,''); //No I18N
								var selDevice = grid.jqGrid('getCell', row, 'fabricID'); //No I18N
								if (deviceIdList != null && deviceIdList != "")
								{
									window.OPM.deviceListForNextPrev = deviceIdList; 
								}
								if (selDevice != null && selDevice != "")
								{
									redirectToSnapshot("UCSFabric", selDevice); //No I18N
								}
							}
						}
						else if ((onSelectFunction === "opm_DevicesList") && colMod[col].name !== "cb" && colMod[col].name !== "rImg")
						{
							var deviceIdList = grid.getCol('deviceName',false,''); //No I18N

							var selDevice = grid.jqGrid('getCell', row, 'deviceName'); //No I18N
							var selDevType = grid.jqGrid('getCell', row, 'type'); //No I18N
							var selDevCate = grid.jqGrid('getCell', row, 'category'); //No I18N
							
							var selPoolID = grid.jqGrid('getCell',row, 'POOLID');//No I18N
							if(selPoolID !== false){
								OPMClient.InventoryDeviceDetailsController.set("poolID",selPoolID);//No I18N
							}else{
								OPMClient.InventoryDeviceDetailsController.set("poolID","");//No I18N
							}

							
							
							if (onSelectFunction == "topTrapsList")
							{
								selDevice = grid.jqGrid('getCell', row, 'moname'); //No I18N
							}

							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if (selDevice != null && selDevice != "")
							{
								$('#opm_Devices tr').removeClass('active');
								$("#"+row).addClass('active');
								var rowData=jQuery('#opm_Devices').jqGrid('getGridParam','data');//No I18N
								if(selPoolID!==undefined && selPoolID!=="" && selPoolID!==false){
									OPMClient.InventoryDeviceDetailsController.inventorysnapType="XenPool"; //No I18N
								}
								else{
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringDevice"; //No I18N
								}
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(rowMod[row-1].deviceName, "MonitoringDevice"); //No I18N
								if(selPoolID!==undefined && selPoolID!=="" && selPoolID!==false){
									redirectToDeviceSnapshot(selPoolID,'',OPMClient.InventoryDeviceDetailsController.inventorysnapType);
								}
								else{
									redirectToDeviceSnapshot(selDevice,'',OPMClient.InventoryDeviceDetailsController.inventorysnapType);
								}
								
								/******* Short Summary Entries Removing 
								if(selPoolID!==undefined && selPoolID!=="" && selPoolID!==false){
									opmGlobalRoute.transitionTo('Inventory.List.Virtualization.Sub.ShortSummary',OPMClient.InventoryDeviceDetailsController.subFilterType,selPoolID); //No I18N
								}
								else{
									opmGlobalRoute.transitionTo('Inventory.List.Virtualization.Sub.ShortSummary',OPMClient.InventoryDeviceDetailsController.subFilterType,selDevice); //No I18N
								}
								**********/
								// $('#deviceShortSummary #DetailedContent').off('click');
								// if(selPoolID!==undefined && selPoolID!=="" && selPoolID!==false){
								// 	$('#deviceShortSummary #DetailedContent').click(function(e){
								// 		redirectToDeviceSnapshot(selPoolID,'',OPMClient.InventoryDeviceDetailsController.inventorysnapType);
								// 	});
								// }
								// else{
								// 	$('#deviceShortSummary #DetailedContent').click(function(e){
								// 		redirectToDeviceSnapshot(selDevice,'',OPMClient.InventoryDeviceDetailsController.inventorysnapType);
								// });
								// }

							}

						}
						else if(onSelectFunction === "DEDeviceConfigletv2") { //No I18N
							var ExceutionId = grid.jqGrid('getCell', row, 'ExceutionId'); //No I18N
							OPMClient.SettingsNCMConfigController.executionId=ExceutionId;
							OPMClient.SettingsNCMConfigController.deviceId=OPMClient.InventoryDeviceDetailsController.selDevice;
							redirectSnapShot('NCMConfigletDetails');//No I18N
						}else if(onSelectFunction === "devIntfToIntfTbl") { //No I18N
							var routerID = grid.jqGrid('getCell',row,'3'); //No I18N
							var deviceIdList = grid.getCol('3',false,''); //No I18N
							if (deviceIdList != null && deviceIdList != "") {
								window.OPM.deviceListForNextPrev = deviceIdList;
							}
							redirectToNFASnapshot(routerID, "FlowInterface"); //NO I18N
						}else if(onSelectFunction === "appsToIntfTbl") { //No I18N
							var routerID = grid.jqGrid('getCell',row,'0'); //No I18N
							if(colMod[col].index == "1") {
								var deviceIdList = grid.getCol('0',false,''); //No I18N
								if (deviceIdList != null && deviceIdList != "") {
									window.OPM.deviceListForNextPrev = deviceIdList;
								}
								redirectToNFASnapshot(routerID, (rowContent["4"] === "1" ? "FlowCloudInterface" : "FlowInterface")); //NO I18N
							}else{
								var entity = OPMClient.InventoryDeviceDetailsController.selDevice;
								OPMClient.InventoryDeviceDetailsController.deviceName = routerID;
								deviceBasicDetails.deviceName = routerID;
								OPMClient.Inventory.showWidgetToConvTbl('Application',entity,defaultOptions.snapId,deviceBasicDetails.AppName,'',false);//No I18N
							}
						}else if(onSelectFunction === "qosToIntfTbl") { //No I18N
							var routerID = grid.jqGrid('getCell',row,'0'); //No I18N
							var deviceIdList = grid.getCol('0',false,''); //No I18N
							if (deviceIdList != null && deviceIdList != "") {
								window.OPM.deviceListForNextPrev = deviceIdList;
							}
							redirectToNFASnapshot(routerID);
						}
						else if(onSelectFunction === "opm_Groups" && colMod[col].name !== "cb" && colMod[col].name !== "Action") { //No I18N
							var groupNameList = grid.getCol('groupName',false,''); //No I18N
							var groupName = grid.jqGrid('getCell',row,'groupName'); //No I18N
							var gElemType = grid.jqGrid('getCell',row,'groupType'); //No I18N
							if (groupNameList != null && groupNameList != "")
								{
									window.OPM.deviceListForNextPrev = groupNameList; 
								}
							redirectotGroupsSnapshot(groupName,gElemType);
						}
						else if(onSelectFunction === "sdwanEvents"){
							var eventName = grid.jqGrid('getCell', row, 'ENTITY'); //No I18N
							var rowIds = grid.jqGrid('getDataIDs');//No I18N
							rowIds.forEach(function(rowId) {
								var rowData = grid.jqGrid("getRowData", rowId);//No I18N
								if(row !== rowId && rowData.ENTITY === eventName){
									grid.jqGrid('setSelection', rowId, true);//No I18N
								}
							});
						}
						
						/*--------------------------------------------------------------
						 * 				AVC Conversation Details
				 --------------------------------------------------------------*/
						else if(onSelectFunction === "avcNbar2AppConDetails" && deviceBasicDetails.snapType !== "FlowIPGroup") { //No I18N
							var colMod = jQuery(gridTable).jqGrid("getGridParam", "colModel");	//No I18N
							var entity = grid.jqGrid('getCell',row,'0'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'1'); //No I18N
							OPMClient.InventoryDeviceDetailsController.entity = displayValue;
							var snapId = defaultOptions.snapId;
							var Data = $("input:radio[name='Data_"+snapId+"']:checked").val();
							OPMClient.InventoryDeviceDetailsController.Data = Data;
							OPMClient.InventoryDeviceDetailsController.type = "NBAR2Application"; //No I18N
							if(colMod[col].name!=="indvTrafficGraph") {
								OPMClient.Inventory.showWidgetToAVCConvTbl("avcNbar2AppConDetails",snapId,displayValue,entity);//No I18N
							}

						} else if(onSelectFunction === "avcHttpHostConDetails") { //No I18N
							var entity = grid.jqGrid('getCell',row,'0'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'0'); //No I18N
							var snapId = defaultOptions.snapId;
							var Data = $("input:radio[name='Data_"+snapId+"']:checked").val();
							OPMClient.InventoryDeviceDetailsController.Data = Data;
							OPMClient.Inventory.showWidgetToAVCConvTbl("avcHttpHostConDetails",snapId,displayValue,entity);//No I18N
						} else if(onSelectFunction === "avcQoSConDetails") { //No I18N
							var entity = grid.jqGrid('getCell',row,'3'); //No I18N
							var entity1 = grid.jqGrid('getCell',row,'4'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'0'); //No I18N
							var snapId = defaultOptions.snapId;
							var Data = $("input:radio[name='Data_"+snapId+"']:checked").val();
							OPMClient.InventoryDeviceDetailsController.Data = Data;
							OPMClient.Inventory.showWidgetToAVCConvTbl("avcQoSConDetails",snapId,displayValue,entity,entity1);//No I18N
						} else if(onSelectFunction === "avcArtConDetails") { //No I18N
							var snapId = defaultOptions.snapId;
							var entity = grid.jqGrid('getCell',row,'0'); //No I18N
							if($('#param_'+snapId+'_GraphType').val() !== '') {
								entity = grid.jqGrid('getCell',row,'4'); //No I18N
							}
							var displayValue = grid.jqGrid('getCell',row,'1'); //No I18N
							var Data = $("input:radio[name='Data_"+snapId+"']:checked").val();
							OPMClient.InventoryDeviceDetailsController.Data = Data;
							OPMClient.Inventory.showWidgetToAVCConvTbl("avcArtConDetails",snapId,displayValue,entity);//No I18N
						}

						//--------------------------------------------------------------

						else if(onSelectFunction==="nfaLanWanReportTbl") { //NO I18N
							if(colMod[col].name==="indvTrafficGraph") { //NO I18N
								OPMClient.NFAReportsController.gridRowData=grid.jqGrid("getRowData",row); //NO I18N
								delete OPMClient.NFAReportsController.gridRowData.indvTrafficGraph;
								opmGlobalRoute.transitionTo("Reports.Netflow.LANWANReport.IndividualGraph"); //NO I18N
							}
						}else if(onSelectFunction==="nfaLANIPListGrid") { //NO I18N
							if(colMod[col].name==="DeviceName" || colMod[col].name==="edit") { //NO I18N
								var deviceID = grid.jqGrid("getCell",row,"DeviceID"); //NO I18N
								OPMClient.NFAReportsController.gridRowData=grid.jqGrid("getRowData",row); //NO I18N
								opmGlobalRoute.transitionTo("Settings.NetflowConfig.LANIPSettings.Edit",{"DeviceID":deviceID}); //NO I18N
							}
						}else if(onSelectFunction === "asViewTrafficTbl") { //NO I18N
							if(colMod[col].name ==="indvTrafficGraph"){ //NO I18N
								OPMClient.InventoryDeviceDetailsController.snapId = defaultOptions.snapId;
								OPMClient.InventoryDeviceDetailsController.gridRowData=grid.jqGrid("getRowData", row); //No I18N
								opmGlobalRoute.transitionTo("Inventory.Device.AsViewTraffic.index"); //NO I18N
							}else{
								var entity = grid.jqGrid('getCell',row,'1'); //No I18N
								var asName = grid.jqGrid('getCell',row,'0');//+"-"+grid.jqGrid('getCell',row,'2');//No I18N
								OPMClient.Inventory.showWidgetToASConvTbl("ASView",entity,defaultOptions.snapId,asName,"IN",false,"All");//NO I18N
							}
						}else if(onSelectFunction === "asGroupTrafficTbl"){ //NO I18N
							if(colMod[col].name ==="indvTrafficGraph"){ //NO I18N
								OPMClient.InventoryDeviceDetailsController.snapId = defaultOptions.snapId;
								OPMClient.InventoryDeviceDetailsController.gridRowData = rowContent;
								opmGlobalRoute.transitionTo("Inventory.Device.AsViewTraffic.index"); //NO I18N
							}else{
								OPMClient.Inventory.showWidgetToASConvTbl("ASGroup",rowContent["0"],defaultOptions.snapId,rowContent["1"],"IN",false,"All"); //NO I18N
							}
						}else if(onSelectFunction==="nfaDashBoardASViewWidget" && colMod[col].name==="asName") { //NO I18N
							var asnumber = grid.jqGrid("getCell",row,"1"); //NO I18N
							var dOptions = grid.jqGrid("getGridParam","defaultOptions"); //NO I18N
							nfa_setTimeFrameForDashboardDrillDown(dOptions.timeFrame);
							if(window.isserver) {
								nfa_setCollectorID(dOptions.collOpt);
							}
							opmGlobalRoute.transitionTo("Inventory.Device.index","FlowASView",asnumber); //NO I18N
						}else if(onSelectFunction==="asToASTbl") { //NO I18N
							if(colMod[col].name==="indvTrafficGraph"){ //NO I18N
								OPMClient.InventoryDeviceDetailsController.snapId = defaultOptions.snapId;
								OPMClient.InventoryDeviceDetailsController.Data = $("input:radio[name='Data_"+defaultOptions.snapId+"']:checked").val(); //NO I18N
								OPMClient.InventoryDeviceDetailsController.convRowData=grid.jqGrid("getRowData",row); //NO I18N
								redirectSnapShot("AStoASTraffic",OPMClient.InventoryDeviceDetailsController.inventorysnapType,defaultOptions.gridCallBackParams.self.snapshotObj.deviceName); //NO I18N
							}else{
								var asnumber = grid.jqGrid("getCell",row,"asnumber"); //NO I18N
								opmGlobalRoute.transitionTo("Inventory.Device.index","FlowASView",asnumber); //NO I18N
							}
						}else if(onSelectFunction==="asInterfaceTrafficTbl" && colMod[col].name==="1") { //NO I18N
							var interfaceID = grid.jqGrid("getCell",row,"0"); //NO I18N
							opmGlobalRoute.transitionTo("Inventory.Device.index","FlowInterface",interfaceID); //NO I18N
						}else if(onSelectFunction === "nfaShowPortsAppMappingTbl" && colMod[col].name ==="addMapping") { //No I18N
							var gridData=grid.jqGrid("getRowData", row); //No I18N
							opmGlobalRoute.transitionTo("Inventory.Device.NFAShowPorts.AddMapping", gridData.protocolName, gridData.protocolId, gridData.port, gridData.dstPort); //NO I18N
						}else if(onSelectFunction == 'nfaDashBoardTrafficWidgetInterface') {  //No I18N
							var rowData = grid.jqGrid("getRowData", row);  //No I18N
							if(colMod[col].name =='0') {  //No I18N
								redirectToSnapshot('FlowDevice',rowData[7]);  //No I18N
							}else if(colMod[col].name =='1'){  //No I18N
								nfa_setDashDrillDownParams(defaultOptions);
								redirectToSnapshot('FlowInterface',rowData[6]);  //No I18N
							}
						}else if(onSelectFunction == 'nfaDashBoardTrafficWidgetIPGrp' && colMod[col].name =='0') {  //No I18N
							var rowData = grid.jqGrid("getRowData", row);  //No I18N
							nfa_setDashDrillDownParams(defaultOptions);
							redirectToSnapshot('FlowIPGroup',rowData[4]);  //No I18N
						}else if(onSelectFunction == 'nfaDashBoardTrafficWidgetIntfGrp' && colMod[col].name =='0') {  //No I18N
							var rowData = grid.jqGrid("getRowData", row);  //No I18N
							nfa_setDashDrillDownParams(defaultOptions);
							redirectToSnapshot('FlowInterfaceGroup',rowData[4]);  //No I18N
						}else if(onSelectFunction === "nfaCbqosPolicyGraph" && colMod[col].name == "indvTrafficGraph") { //No I18N
							OPMClient.InventoryDeviceDetailsController.cbqosClassData={};
							OPMClient.InventoryDeviceDetailsController.cbqosClassData.className=grid.jqGrid('getCell',row,'0'); //No I18N
							OPMClient.InventoryDeviceDetailsController.cbqosClassData.policyName=defaultOptions.policy;
							OPMClient.InventoryDeviceDetailsController.cbqosClassData.parentClassName=defaultOptions.parentclass;
							OPMClient.InventoryDeviceDetailsController.cbqosClassData.snapId=defaultOptions.snapId;
							OPMClient.InventoryDeviceDetailsController.cbqosClassData.inOutVal=$("input:radio[name='Data_"+defaultOptions.snapId+"']:checked").val(); 
							redirectSnapShot('CBQoSClassBasedGraph');//No I18N
						}else if(onSelectFunction === "nfaIntfTopAppTbl" && invColName !== 'indvTrafficGraph') { //No I18N
							var entity = grid.jqGrid('getCell',row,'Name'); //No I18N
							OPMClient.InventoryDeviceDetailsController.entity = entity;
							var type = $("#param_"+defaultOptions.snapId+"_Type").val();  //No I18N
							var inOutVal = $("input:radio[name='Data_"+defaultOptions.snapId+"']:checked").val();  //No I18N
							if(OPMClient.InventoryDeviceDetailsController.inventorysnapType === "FlowMeraki") { //No I18N
								inOutVal = 'OUT';  //No I18N
							}
							OPMClient.InventoryDeviceDetailsController.Data =inOutVal;
							if(invColName !== 'nameWithPort') {  //No I18N
								OPMClient.Inventory.showWidgetToConvTbl(type,entity,defaultOptions.snapId,entity,inOutVal,false);
							}
						}else if(['nfaIntfTopSrcTbl','nfaSrcGeoLocTbl'].contains(onSelectFunction) && !['modifyDNS','indvTrafficGraph','cidr'].contains(invColName)) { //No I18N
							if(onSelectFunction === "nfaIntfTopSrcTbl" && deviceBasicDetails.snapType === "FlowInterface" && deviceBasicDetails.isCIDREnabled && $("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")) return;
							var resolveDNS =$("#param_"+defaultOptions.snapId+"_ResolveDNS").is(':checked');
							var entity = grid.jqGrid('getCell',row,'ip'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'Name'); //No I18N
							if(onSelectFunction === "nfaSrcGeoLocTbl") { //No I18N
								entity = displayValue = grid.jqGrid('getCell',row,'0'); //No I18N
							}
							var Data = $("input:radio[name='Data_"+defaultOptions.snapId+"']:checked").val();
							var type='Source'; //No I18N
							if($("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")) { //No I18N
								type='SrcNetwork'; //No I18N
								entity=displayValue;
							}
							OPMClient.Inventory.showWidgetToConvTbl(type,entity,defaultOptions.snapId,displayValue,'',resolveDNS, "", (resolveDNS ? "DNS" : "IP"));//No I18N
						}else if(['nfaIntfTopDestTbl','nfaDstGeoLocTbl'].contains(onSelectFunction) && !['modifyDNS','indvTrafficGraph','cidr'].contains(invColName)) { //No I18N
							if(onSelectFunction === "nfaIntfTopDestTbl" && deviceBasicDetails.snapType === "FlowInterface" && deviceBasicDetails.isCIDREnabled && $("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")) return;
							var resolveDNS =$("#param_"+defaultOptions.snapId+"_ResolveDNS").is(':checked');
							var entity = grid.jqGrid('getCell',row,'ip'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'Name'); //No I18N
							if(onSelectFunction === "nfaDstGeoLocTbl") { //No I18N
								entity = displayValue = grid.jqGrid('getCell',row,'0'); //No I18N
							}
							var type='Destination'; //No I18N
							if($("#param_"+defaultOptions.snapId+"_isNetwork").prop("checked")) { //No I18N
								type='DstNetwork'; //No I18N
								entity=displayValue;
							}
							OPMClient.Inventory.showWidgetToConvTbl(type,entity,defaultOptions.snapId,displayValue,'',resolveDNS, "", (resolveDNS ? "DNS" : "IP"));//No I18N
						}else if(onSelectFunction === "nfaIntfTopQosTbl" && invColName !== 'indvTrafficGraph') { //No I18N
							var entity = grid.jqGrid('getCell',row,'dscpCode'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'Name'); //No I18N
							var type = $('#param_'+defaultOptions.snapId+'_Type').val();
							if(type == 'Grp') {
								type = 'DSCPGrp'; //No I18N
								entity = displayValue;
							} 
							OPMClient.Inventory.showWidgetToConvTbl(type,entity,defaultOptions.snapId,displayValue,'',false); //No I18N
						}else if(onSelectFunction === "nfaDevInfSnapAttacksTbl" && !isAllCollectorSelected() && !window.OPM.isCentralServer){ //No I18N
							var eventID = grid.jqGrid('getCell',row,'evid'); //No I18N
							redirectToSnapshot('FlowAttacks',eventID); //No I18N
						}else if(onSelectFunction === "nbaTrfSrcTbl"){//No I18N
							OPMClient.Inventory.getNBATroubleShootReport(defaultOptions.snapId,grid.jqGrid('getCell',row,'0'));//No I18N
						}else if(onSelectFunction === "nfaAppGrpWidget" && invColName !== 'indvTrafficGraph') { //No I18N
							var entity = grid.jqGrid('getCell',row,'Name'); //No I18N
							OPMClient.Inventory.showWidgetToConvTbl('AppGrp',entity,defaultOptions.snapId,entity,'',false);//No I18N
						}else if(onSelectFunction === "clientSnapSSIDWidget" && !isAllCollectorSelected() && invColName !== "indvTrafficGraph") { //No I18N
							var SSID = grid.jqGrid('getCell',row,'Name'); //No I18N
							redirectToSnapshot('FlowSSID',SSID); //No I18N
						}else if(onSelectFunction === "ssidSnapClientsWidget" && !isAllCollectorSelected() && invColName !== "indvTrafficGraph") { //No I18N
							var clientName = grid.jqGrid('getCell',row,'Name'); //No I18N
							var redirectSnap = checkIsIPV4(clientName)?"FlowClient":"FlowClientMAC"; //No I18N
							redirectToSnapshot(redirectSnap,clientName);
						}else if(onSelectFunction === "ssidClientSnapApMacWidget" && invColName !== "indvTrafficGraph") { //No I18N
							var accessPoint = grid.jqGrid('getCell',row,'apmacID'); //No I18N
							redirectToSnapshot('FlowAPMAC',accessPoint); //No I18N
						}else if(['wlcSnapClientsWidget','wlcSnapSSIDWidget','WlcApMacSnapClients','WlcApMacSnapSSID'].contains(onSelectFunction) && invColName !== "indvTrafficGraph") { //No I18N
							var entity = grid.jqGrid('getCell',row,'Name'); //No I18N
							var getWhat = defaultOptions.reportType;
							var snapId = defaultOptions.snapId;
							OPMClient.Inventory.showWidgetToWlcConvTbl(getWhat,entity,snapId);
						}else if(['wlcSnapAppTraffic','wlcSnapQosTraffic','wlcApMacAppTraffic','wlcApMacQosTraffic'].contains(onSelectFunction) && invColName !== "indvTrafficGraph") { //No I18N
							var entity = grid.jqGrid('getCell',row,'valueID'); //No I18N
							var displayValue = grid.jqGrid('getCell',row,'Name'); //No I18N
							OPMClient.Inventory.showWidgetToWlcConvTbl(defaultOptions.reportType,entity,defaultOptions.snapId,displayValue);
						}else if(["wlcSSIDGroupSnapAP","wlcSnapApMacWidget"].contains(onSelectFunction) && invColName !== "indvTrafficGraph"){ //NO I18N
							var entity = grid.jqGrid("getCell", row, "apMac"); //NO I18N
							var displayValue = grid.jqGrid("getCell", row, "Name"); //NO I18N
							OPMClient.Inventory.showWidgetToWlcConvTbl(defaultOptions.reportType, entity, defaultOptions.snapId, displayValue);
						}else if(onSelectFunction=="nfaInvList_WLC" && colMod[col].name!=="cb") { //NO I18N
							var gridRowData = grid.jqGrid("getRowData",row); //NO I18N
							if(gridRowData.state!=="1") { //NO I18N
								var colName,snapType;
									var subFilterType = OPMClient.Inventory.getWlcSelectedFilterVal();
									switch(subFilterType) {
									case 'Controllers'			: 	colName='ID';snapType='FlowWLC';break; //No I18N
										case 'APMAC_ID' 			: 	//NO I18N
									case 'APMAC'				: 	colName='ID';snapType='FlowAPMAC';break; //No I18N
									case 'WIRELESS_SSID'		: 	colName='Name';snapType='FlowSSID';break; //No I18N
									case 'CLIENTIP'				: 	colName='Name';snapType='FlowClient';break; //No I18N
									case 'CLIENTMAC'			: 	colName='Name';snapType='FlowClientMAC';break; //No I18N
									case 'AccessPointGroups'	: 	colName='ID';snapType='FlowAccessPointGroup';break; //No I18N
									case 'SSIDGroups'			: 	colName='ID';snapType='FlowSSIDGroup';break; //No I18N
								}
								var selDeviceID = grid.jqGrid("getCell",row,colName); //NO I18N
								window.OPM.deviceListForNextPrev = grid.getCol(colName,false,""); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("selDevice",selDeviceID); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("inventorysnapType",snapType); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("gridRowData",gridRowData); //NO I18N
								nfa_setInvListToSnapshotTimeFrame();
								var redirectRoute = "Inventory.List."+nfa_getInvListName()+".Sub.ShortSummary"; //NO I18N
								if(colMod[col].name=="traffic") { //NO I18N
									window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDeviceID);
									shortSummaryRowKeydownNew();
									opmGlobalRoute.transitionTo(redirectRoute,OPMClient.InventoryDeviceDetailsController.subFilterType,selDeviceID); //NO I18N
								}else{
									opmGlobalRoute.transitionTo("Inventory.Device.index",snapType,selDeviceID); //NO I18N
								}
							}
						} else if(onSelectFunction != undefined && !onSelectFunction.indexOf('dpiSnap') && onSelectFunction !== 'dpiSnapConvWidget') { //No I18N
							var entity = grid.jqGrid('getCell',row,0); //No I18N
							var type='Application'; //No I18N
							switch(onSelectFunction){
								case 'dpiSnapURLHitsWidget':type='urlHost';break; //No I18N
								case 'dpiSnapSrcWidget':type='SrcAddr';break; //No I18N
								case 'dpiSnapDstWidget':type='DstAddr';break; //No I18N
							}
							var resolveDNS = $("#param_"+defaultOptions.snapId+"_ResolveDNS").prop('checked');
							OPMClient.Inventory.showDPIWidgetToConvTbl(type,entity,defaultOptions.snapId,entity,resolveDNS);
						}else if(["DPI_apps","DPI_URL","DPI_src","DPI_dst","DPI_server","DPI_aitraffic"].contains(onSelectFunction) && colMod[col].name!=="cb") { //NO I18N
							var gridRowData = grid.jqGrid("getRowData",row); //NO I18N
							var selDeviceID = gridRowData[0];
							var redirectCol = onSelectFunction.split("_")[1]; //NO I18N
							var protocol = OPMClient.DPIInventoryController.protocol;
							var snapType;
							switch(redirectCol){
								case "aitraffic": //NO I18N
								case "URL"	: 	snapType="DPILayer7";break; //NO I18N
								case "apps"	: 	snapType="DPILayer4";break; //NO I18N
								case "src"	: 	snapType="DPISource";break; //NO I18N
								case "dst"	: 	snapType="DPIDestination";break; //NO I18N
								case "server": 	snapType="DPI"+protocol;break; //NO I18N
							}
							if (protocol === "DNS" || protocol === "DHCP") { //NO I18N
								window.OPM.deviceListForNextPrev = grid.getCol(1,false,""); //NO I18N
							} else {
								window.OPM.deviceListForNextPrev = grid.getCol(2,false,""); //NO I18N
							}
							OPMClient.InventoryDeviceDetailsController.set("gridRowData",gridRowData); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("inventorysnapType",snapType); //NO I18N
							OPMClient.InventoryDeviceDetailsController.gridRowData.dpiEngineID = $("#DPIEnginesFilterList .SingleBar.active").data("key"); //NO I18N

							if(colMod[col].name=="traffic") { //NO I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(gridRowData[0]);
								shortSummaryRowKeydownNew();
								opmGlobalRoute.transitionTo("Inventory.List.PacketAnalysis.Sub.ShortSummary",redirectCol,encodeURIComponent(gridRowData[0])); //NO I18N
							}else{
								opmGlobalRoute.transitionTo("Inventory.Device.index",snapType,encodeURIComponent(gridRowData[0])); //NO I18N
							}
						}else if((onSelectFunction === "nfaInvList_Attacks") && colMod[col].name!=="cb") { //NO I18N
							var evid = grid.getCol("evid",false,""); //NO I18N
							var selDevice = grid.jqGrid("getCell",row,"evid"); //NO I18N
							OPMClient.InventoryDeviceDetailsController.gridRowData=grid.jqGrid("getRowData",row); //NO I18N
							if(evid!==null && evid!=="") { //NO I18N
								window.OPM.deviceListForNextPrev = evid; 
							}
							if(selDevice!==null && selDevice!=="" && colMod[col].name!=="fullViewIcon") { //NO I18N
								nfa_setInvListToSnapshotTimeFrame();
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="FlowAttacks"; //NO I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								shortSummaryRowKeydownNew();
								opmGlobalRoute.transitionTo("Inventory.List."+nfa_getInvListName()+".Sub.ShortSummary","Attacks",selDevice); //NO I18N
							}
						}else if(onSelectFunction=="nfaInvList_Devices" && colMod[col].name!=="cb") { //NO I18N
							var wlcStatus = grid.jqGrid("getCell",row,"wlcStatus"); //NO I18N
							if(wlcStatus === "4"){ //NO I18N
								grid.jqGrid("expandSubGridRow", row); //NO I18N
								return;
							}
							var selDeviceID = grid.jqGrid("getCell",row,"ID"); //NO I18N
							var deviceIdList,snapType;
							switch(wlcStatus) {
								case "1"	: 	snapType = "FlowWLC"; deviceIdList=[]; break; //NO I18N
								case "2" 	: 	snapType = "FlowMeraki"; //NO I18N
												deviceIdList = grid.getCol("MerakiID",false,""); //NO I18N
												selDeviceID = grid.jqGrid("getCell",row,"MerakiID"); //NO I18N
												break;
								default 	: 	snapType = "FlowDevice"; //NO I18N
												deviceIdList = grid.getCol("ID",false,""); //NO I18N
							}

							window.OPM.deviceListForNextPrev = deviceIdList; 
							OPMClient.InventoryDeviceDetailsController.set("nfaDeviceID",selDeviceID); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("inventorysnapType",snapType); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("gridRowData",grid.jqGrid("getRowData",row)); //NO I18N
							nfa_setInvListToSnapshotTimeFrame();
							if(colMod[col].name=="traffic") { //NO I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDeviceID);
								shortSummaryRowKeydownNew();
								opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary","Devices",selDeviceID); //NO I18N
							}else{
								opmGlobalRoute.transitionTo("Inventory.Device.index",snapType,selDeviceID); //NO I18N
							}
						}else if((onSelectFunction === "nfaInvList_Interfaces") && colMod[col].name !== "cb") { //NO I18N
							var gridRowData = grid.jqGrid("getRowData",row); //NO I18N
							if(gridRowData.state!=="1") { //NO I18N
								var selDeviceID = grid.jqGrid("getCell",row,"ID"); //NO I18N
								var snapType = (gridRowData.isVPCInterface === "true" ? "FlowCloudInterface" : "FlowInterface"); //NO I18N
								window.OPM.deviceListForNextPrev = grid.getCol("ID",false,""); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("nfaDeviceID",selDeviceID); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("inventorysnapType", snapType); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("gridRowData",gridRowData); //NO I18N
								nfa_setInvListToSnapshotTimeFrame();
								if(colMod[col].name=="traffic") { //NO I18N
									window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDeviceID);
									shortSummaryRowKeydownNew();
									opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary","Interfaces",selDeviceID); //NO I18N
								}else{
									opmGlobalRoute.transitionTo("Inventory.Device.index", snapType, selDeviceID); //NO I18N
								}
							}
						}else if(onSelectFunction=="nfaInvList_Groups" && colMod[col].name!=="cb") { //NO I18N
							switch(OPMClient.Inventory.getGroupsSelectedFilterVal()) {
								case "IPGroups" 		: 	snapType="FlowIPGroup"; break; //NO I18N
								case "InterfaceGroups" 	: 	snapType="FlowInterfaceGroup"; break; //NO I18N
								case "AccessPointGroups": 	snapType="FlowAccessPointGroup"; break; //NO I18N
								case "SSIDGroups" 		: 	snapType="FlowSSIDGroup"; break; //NO I18N
							}
							var selDeviceID = grid.jqGrid("getCell",row,"ID"); //NO I18N
							window.OPM.deviceListForNextPrev = grid.getCol("ID",false,""); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("inventorysnapType",snapType); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("gridRowData",grid.jqGrid("getRowData",row)); //NO I18N
							nfa_setInvListToSnapshotTimeFrame();
							if(colMod[col].name=="traffic") { //NO I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDeviceID);
								shortSummaryRowKeydownNew();
								opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary","Groups",selDeviceID); //NO I18N
							}else{
								opmGlobalRoute.transitionTo("Inventory.Device.index",snapType,selDeviceID); //NO I18N
							}
						}else if((onSelectFunction === "nfaInvList_Apps") && colMod[col].name !== "cb"){//NO I18N
							if(window.OPM.isAuthorized && !isAllCollectorSelected()) {
								var snapType,selDeviceID;
								switch(OPMClient.InventoryDeviceDetailsController.invListFilterObjects.NFA_Apps[0]){
									case "Layer4": 		snapType = "FlowL4"; //NO I18N
														selDeviceID = grid.jqGrid("getCell",row,"AppName"); //NO I18N
														window.OPM.deviceListForNextPrev = grid.getCol("AppName",false,""); //NO I18N
														break;
									case "Layer7": 		snapType = "FlowL7"; //NO I18N
														selDeviceID = grid.jqGrid("getCell",row,"AppID"); //NO I18N
														window.OPM.deviceListForNextPrev = grid.getCol("AppID",false,""); //NO I18N
														break;
									case "Services": 	snapType = "FlowServices"; //NO I18N
														selDeviceID = grid.jqGrid("getCell",row,"AppName"); //NO I18N
														window.OPM.deviceListForNextPrev = grid.getCol("AppName",false,""); //NO I18N
														break;
								}
								OPMClient.InventoryDeviceDetailsController.set("nfaDeviceID",selDeviceID); //NO I18N
								OPMClient.InventoryDeviceDetailsController.set("inventorysnapType",snapType); //NO I18N
								nfa_setInvListToSnapshotTimeFrame();
								if(colMod[col].name=="traffic") { //NO I18N
									window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDeviceID);
									shortSummaryRowKeydownNew();
									opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary","Apps",selDeviceID); //NO I18N
								}else{
									opmGlobalRoute.transitionTo("Inventory.Device.index",snapType,selDeviceID); //NO I18N
								}
							}
						}else if((onSelectFunction === "nfaInvList_QOS") && colMod[col].name !== "cb"){//NO I18N
							if(isAllCollectorSelected()) {
								return;
							}
							var selQoSName = grid.jqGrid("getCell",row,"2"); //NO I18N
							if(selQoSName!=="Others") { //NO I18N
								var deviceID = nfa_getInvListQoSSelectedDeviceID();
								var idsForNextPrev = grid.getCol("2",false,""); //NO I18N
								for(var i=0;i<idsForNextPrev.length;i++) {
									idsForNextPrev[i] = idsForNextPrev[i]+'_'+deviceID;
								}
								selQoSName = selQoSName+'_'+deviceID;
								window.OPM.deviceListForNextPrev = idsForNextPrev;
								OPMClient.InventoryDeviceDetailsController.set("inventorysnapType","FlowQOS"); //NO I18N
								nfa_setInvListToSnapshotTimeFrame();
								if(colMod[col].name=="traffic") { //NO I18N
									window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selQoSName);
									shortSummaryRowKeydownNew();
									opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary","QOS",selQoSName); //NO I18N
								}else {
									opmGlobalRoute.transitionTo("Inventory.Device.index","FlowQOS",selQoSName); //NO I18N
								}
							}
						}else if(window.isASViewEnabled && onSelectFunction==="nfaInvList_ASView" && colMod[col].name!=="cb") { //NO I18N
							var selDeviceID = rowContent["1"]; //NO I18N
							window.OPM.deviceListForNextPrev = grid.getCol("4",false,""); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("nfaDeviceID",selDeviceID); //NO I18N
							OPMClient.InventoryDeviceDetailsController.set("inventorysnapType","FlowASView"); //NO I18N
							nfa_setInvListToSnapshotTimeFrame();
							if(colMod[col].name=="traffic") { //NO I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDeviceID);
								shortSummaryRowKeydownNew();
								opmGlobalRoute.transitionTo("Inventory.List.FlowAnalysis.Sub.ShortSummary","ASView",selDeviceID); //NO I18N
							}else{
								opmGlobalRoute.transitionTo("Inventory.Device.index","FlowASView",selDeviceID); //NO I18N
							}
						}
						else if((onSelectFunction === "opm_ipsla_VoIP") && colMod[col].name !== "cb") { //No I18N
							var deviceIdList = grid.getCol('probeId',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', row, 'probeId'); //No I18N
							var deviceName = grid.jqGrid('getCell', row, 'deviceName'); //No I18N
							var sourceDeviceName = grid.jqGrid('getCell', row, 'sourceDeviceName'); //No I18N
							OPMClient.InventoryDeviceDetailsController.sourceDeviceName=sourceDeviceName;
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if (selDevice != null && selDevice != "")
							{
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPSLAVoIP"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								shortSummaryRowKeydownNew();
								redirectToSnapshot("IPSLAVoIP", selDevice); //No I18N
								/******* Short Summary Entries Removing 
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPSLAVoIP"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "IPSLAVoIP",{deviceName:deviceName}); //No I18N
								opmGlobalRoute.transitionTo('Inventory.List.IPSLA.Sub.ShortSummary','VoIP',selDevice); //No I18N
								OPMClient.InventoryDeviceDetailsController.set("ipslaID",selDevice);//No I18N
//								redirectToSnapshot("IPSLAVoIP", selDevice); //No I18N
**********/
							}
						}  else if((onSelectFunction === "opm_ipsla_WAN") && colMod[col].name !== "cb") { //No I18N
							var deviceIdList = grid.getCol('probeId',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', row, 'probeId'); //No I18N
							var sourceDeviceName = grid.jqGrid('getCell', row, 'sourceDeviceName'); //No I18N
							OPMClient.InventoryDeviceDetailsController.sourceDeviceName=sourceDeviceName;
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if (selDevice != null && selDevice != "")
							{
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPSLAWAN"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								shortSummaryRowKeydownNew();
								redirectToSnapshot("IPSLAWAN", selDevice); //No I18N

								/******* Short Summary Entries Removing 
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPSLAWAN"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "IPSLAWAN"); //No I18N
								opmGlobalRoute.transitionTo('Inventory.List.IPSLA.Sub.ShortSummary','WAN',selDevice); //No I18N
								OPMClient.InventoryDeviceDetailsController.set("ipslaID",selDevice);//No I18N
//								redirectToSnapshot("IPSLAWAN", selDevice); //No I18N
									**********/
							}
						}  else if((onSelectFunction === "opm_ipsla_Video") && colMod[col].name !== "cb") { //No I18N
							var deviceIdList = grid.getCol('probeId',false,''); //No I18N
							var selDevice = grid.jqGrid('getCell', row, 'probeId'); //No I18N
							var sourceDeviceName = grid.jqGrid('getCell', row, 'sourceDeviceName'); //No I18N
							OPMClient.InventoryDeviceDetailsController.sourceDeviceName=sourceDeviceName;
							if (deviceIdList != null && deviceIdList != "")
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							if (selDevice != null && selDevice != "")
							{
								OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPSLAVideo"; //No I18N
								window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
								redirectToSnapshot("IPSLAVideo", selDevice); //No I18N
								shortSummaryRowKeydownNew();
								/******* Short Summary Entries Removing 

								//opm_deviceShortSummaryView(selDevice, "IPSLAVideo"); //No I18N
								opmGlobalRoute.transitionTo('Inventory.List.IPSLA.Sub.ShortSummary','Video',selDevice); //No I18N
								OPMClient.InventoryDeviceDetailsController.set("ipslaID",selDevice);//No I18N
//								redirectToSnapshot("IPSLAVideo", selDevice); //No I18N **********/
							}
						} /*else if((onSelectFunction === "ipam_IPs") && colMod[col].name !== "cb") { //No I18N
					var deviceIdList = grid.getCol('ipaddress-in-long',false,''); //No I18N
					var selDevice = grid.jqGrid('getCell', row, 'ipaddress-in-long'); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
					}
					if (selDevice != null && selDevice != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMIP"; //No I18N
						shortSummaryRowKeydownNew();opm_deviceShortSummaryView(selDevice, "IPAMIP"); //No I18N
//						redirectToSnapshot("IPAMIP", selDevice); //No I18N
					}
				}*/ /*else if((onSelectFunction === "ipam_ipsList") && colMod[col].name !== "cb") { //No I18N
					var deviceIdList = grid.getCol('ip-address',false,''); //No I18N
					var selDevice = grid.jqGrid('getCell', row, 'ip-address'); //No I18N
					console.log(event.srcElement.className.indexOf("oputilsippingicon"))
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					if(colMod[col].name=="ipameditip")
					{
						OPMClient.InventoryOpUtilsController.pingtooltipip = selDevice;
        				location.href=window.OPM.apiclientUrl+"Inventory/Snapshot/"+OPMClient.InventoryDeviceDetailsController.inventorysnapType+"/"+OPMClient.InventoryDeviceDetailsController.selDevice+"/EditIP/"+OPMClient.InventoryOpUtilsController.pingtooltipip;//No I18N
					}
					else if(event.srcElement.className.indexOf("oputilsippingicon") !== -1){
						OPMClient.InventoryOpUtilsController.pingtooltipip=selDevice;
						opUtilsIPToolTip();
					}
					else if (selDevice != null && selDevice != "")
					{
						redirectToSnapshot("IPAMIP", selDevice);//No I18N
					}
				}*/
				
				else if((onSelectFunction === "ipam_switchportList") && colMod[col].name !== "cb") { //No I18N
					var switchList = grid.getCol('switch-name',false,''); //No I18N
					var ifindexList = grid.getCol('connected-port-ifindex',false,''); //No I18N
					var deviceIdList = new Array();
					for (var indexVal = 0; indexVal < switchList.length; indexVal++) {
						var array_element = switchList[indexVal];
						var array_element1 = ifindexList[indexVal];
						deviceIdList.push(array_element+" "+array_element1);
					}
					var selSwitch = grid.jqGrid('getCell', row, 'switch-name'); //No I18N
					var selIndex = grid.jqGrid('getCell', row, 'connected-port-ifindex'); //No I18N

					var selDevice = selSwitch+ " " + selIndex; //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					if (selDevice != null && selDevice != "")
					{
						redirectToSnapshot("IPAMPort", selDevice); //No I18N
					}
				}
				else if((onSelectFunction === "ipam_Subnets") && colMod[col].name !== "cb") { //No I18N
					var deviceIdList = grid.getCol('subnet-address',false,''); //No I18N
					var selDevice = grid.jqGrid('getCell', row, 'subnet-address'); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					if (selDevice != null && selDevice != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMSubnet"; //No I18N
						OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetIPType = "IPv4";//No I18N
						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
						shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "IPAMSubnet"); //No I18N
//						redirectToSnapshot("IPAMSubnet", selDevice); //No I18N
					}
				} else if((onSelectFunction === "ipam_Switches") && colMod[col].name !== "cb") { //No I18N
					var deviceIdList = grid.getCol('switch-name',false,''); //No I18N
					var selDevice = grid.jqGrid('getCell', row, 'switch-name'); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					if (selDevice != null && selDevice != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMSwitch"; //No I18N
						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
						shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "IPAMSwitch"); //No I18N
//						redirectToSnapshot("IPAMSwitch", selDevice); //No I18N
					}
				}
				else if(onSelectFunction === "ipam_linktoIpsnapPg" && colMod[col].name == "ipv6-address"){
					var ipAddList = grid.getCol('ipv6-details-id',false,''); //No I18N
					var selIP = grid.jqGrid('getCell', row, 'ipv6-details-id'); //No I18N
					if (ipAddList != null && ipAddList != "")
					{
						window.OPM.deviceListForNextPrev = ipAddList;
					}
					if (selIP != null && selIP != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMV6SubnetIPSummary"; //No I18N
						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selIP);
						shortSummaryRowKeydownNew();
						redirectToSnapshot("IPAMV6SubnetIPSummary", selIP); //No I18N
					}
				}
				else if(onSelectFunction === "ipam_V6_Subnets" && colMod[col].name !== "cb")
				{
					var deviceIdList = grid.getCol('subnetid',false,''); //No I18N
					var selDevice = grid.jqGrid('getCell', row, 'subnetid'); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					if (selDevice != null && selDevice != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMV6Subnet"; //No I18N
						OPMClient.InventoryOpUtilsController.invListActionsParamsObj.subNetIPType = "IPv6";//No I18N
						window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
						shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "IPAMSubnet"); //No I18N
						opm_deviceShortSummaryView(selDevice,"IPAMV6Subnet",'true'); //No I18N
					}
				}
				 /*else if((onSelectFunction === "ipam_Ports") && colMod[col].name !== "cb") { //No I18N
					var switchList = grid.getCol('switch-name',false,''); //No I18N
					var ifindexList = grid.getCol('connected-port-ifindex',false,''); //No I18N
					var deviceIdList = new Array();
					for (var indexVal = 0; indexVal < switchList.length; indexVal++) {
						var array_element = switchList[indexVal];
						var array_element1 = ifindexList[indexVal];
						deviceIdList.push(array_element+" "+array_element1);
					}
					var selSwitch = grid.jqGrid('getCell', row, 'switch-name'); //No I18N
					var selIndex = grid.jqGrid('getCell', row, 'connected-port-ifindex'); //No I18N

					var selDevice = selSwitch+ " " + selIndex; //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; //No I18N
						}
					if (selDevice != null && selDevice != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="IPAMPort"; //No I18N
						shortSummaryRowKeydownNew();opm_deviceShortSummaryView(selDevice, "IPAMPort"); //No I18N
//						redirectToSnapshot("IPAMPort", selDevice); //No I18N
					}
				}*/
				else if((onSelectFunction === "opm_Urls") && colMod[col].name !== "cb") { //No I18N
					var deviceIdList = grid.getCol('name',false,''); //No I18N
					var selDevice = grid.jqGrid('getCell', row, 'name'); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					if (selDevice != null && selDevice != "")
					{
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringURL"; //No I18N
						redirectToDeviceSnapshot(selDevice,'','MonitoringURL'); //No I18N

					/******* Short Summary Entries Removing **********/
						//window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
						//shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "MonitoringURL"); //No I18N
						// $('#deviceShortSummary #DetailedContent').off('click');
						// $('#deviceShortSummary #DetailedContent').click(function(e){
						 //redirectToDeviceSnapshot(selDevice,'','MonitoringURL'); //No I18N
						// });
						//opmGlobalRoute.transitionTo('Inventory.List.Monitoring.Sub.ShortSummary','Url',selDevice); //No I18N
//						redirectToOPMUrlSnapshot(selDevice);
					}
				}
				else if(onSelectFunction === 'alarmEscalation' && colMod[col].name !== 'gridAction')
				{
					var ruleName = grid.jqGrid('getCell',row,'ruleName');//No I18N
					if(ruleName !== null && ruleName !== "")
					{
						opm_editAlarmEscalation(ruleName);
					}
				}
				else if(onSelectFunction === 'ruleEngineList' && colMod[col].name !== 'gridAction' && colMod[col].name !== 'status' && colMod[col].name !== 'cb' && OPMClient.DiscoveryWizardAddEditController.isWizardPage !== true)
				{
					var ruleId = grid.jqGrid('getCell',row,'ruleid');//No I18N
					if(ruleId !== null && ruleId !== "" && window.OPM.userPermissions.discoveryWrite)
					{
						opm_editRuleEngine(ruleId);
					}
				}
				else if(onSelectFunction === "editRouter" && colMod[col].name !== 'gridAction' && colMod[col].name != "cb"){
					var routerID = grid.jqGrid('getCell',row,'router-id');//No I18N
					var moid = grid.jqGrid('getCell',row,'moid');//No I18N
					if(routerID !== null && routerID !== "" && moid === "")
					{
						OPMClient.SettingsOpUtilConfigController.set('uniqueID',routerID);//No I18N
						settingsGlobalRoute.transitionTo('Settings.OpUtils.Discovery.Router.Operation','Edit');//No I18N
					}
				}
				else if(onSelectFunction === 'downtimeScheduler' && colMod[col].name !== 'actions')
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData; 
					var dtName = rowData.name;//No I18N
					var dtStatus = rowData.statusNum;//No I18N
					
					OPMClient.SettingsConfigurationController.set("dtRunningStatus",dtStatus);//No I18N
					if(dtName !== null && dtName !== "")
					{
						opm_editDowntimeSchedule(dtName);
					}
				}
				else if(onSelectFunction === 'MonitorProfiles'){
					var rowData = grid.jqGrid('getRowData',row);//No I18N
					if(colMod[col].name === 'associatedDeviceCount'){
						if(rowData.associatedDeviceCount !== '0'){
							window.OPM.currentView.handler.controller.set('monitorGroupID',rowData.monitorGroupID);//No I18N
							opm_transitionToTheRoute('Settings.Configurations.MonitorProfile.AssociatedDevices');//No I18N
						}
					}else if(colMod[col].name === 'monitorGroupName'){
						editMonitorProfile(rowData.monitorGroupID);
					}
				}
				else if(onSelectFunction === 'MonitorProfilesAssoDevices' && (colMod[col].name === 'displayName')){
					redirectToSnapshot('MonitoringDevice',grid.jqGrid('getRowData',row).moName);//No I18N
				}
				else if((onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile") && (colMod[col].name === 'actions' || colMod[col].name === 'DISPLAYNAME' || colMod[col].name === 'displayName' || colMod[col].name === 'serviceName' || colMod[col].name === 'graphName' || colMod[col].name === 'templateName')){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					var currController = OPMClient.SettingsAddEditController;
					var monitorType = onSelectFunction.split("_")[1];
					var self = window.OPM.currentView.handler.controller;
					self.set('notFromCB',true);//No I18N
					/*Made a selection check. Can only edit the selected row*/
					var monitorsList = self.get('monitorsList');
					var arrIndex = monitorsList.map(function(obj){return obj.monitorTypeKey;}).indexOf(monitorType);
					if(['appmonitor','appservice','eventlog'].indexOf(monitorType) < 0 && arrIndex > -1){
						var selectedIds = monitorsList[arrIndex].selectedIds;
						if(selectedIds.indexOf(rowData[getMonitorTypeIdforMonitorType(monitorType)].toString()) < 0){
							grid.jqGrid('setSelection',row,false);//No I18N
							return;
						}
					}
					/*-----*/
					currController.set('pageObj',rowData);//No I18N
					if(monitorType === 'performance'){
						self.set('editThresholdHeader',rowData.DISPLAYNAME);//No I18N
					}else if(monitorType === 'ntservice'){//No I18N
						currController.setProperties({slidePageHeader:Ember.I18n.t('webclient.action.edit') + " - " + rowData.name,//No I18N
														sourceName:rowData.name,serviceID:rowData.serviceID});
					}else if(monitorType === 'service'){//No I18N
						var svcName = rowData.serviceName;
				    	var svcSettings = self.get(monitorType+'Settings');
				    	var isExisting = svcSettings.map(function(obj){return obj.monitorId;}).indexOf(svcName);
				    	var data = {name:rowData.serviceName,port:rowData.portNo,thresholdTime:rowData.failureThreshold,
									timeOut:rowData.timeout,discovery:rowData.autoDiscovery};

				    	if(isExisting > -1){
				    		var existingData = svcSettings[isExisting].data;
				    		data = {name:existingData.serviceName,port:rowData.portNo,thresholdTime:existingData.failureThreshold,
									timeOut:existingData.timeOut,discovery:existingData.autoDiscovery.toString()};
				        }

						currController.setProperties({slidePageHeader:Ember.I18n.t('webclient.action.edit') + " - " + rowData.serviceName,//No I18N
														sourceName:rowData.serviceName,pageObj:data});
					}else if(monitorType === 'eventlog'){//No I18N
						currController.setProperties({slidePageHeader:Ember.I18n.t('webclient.action.edit') + " - " + rowData.name, //No I18N
														sourceName:rowData.name,pageObj:{name:rowData.name,logFileName:rowData.logName,
														ruleId:rowData.ruleId,orgRuleID:rowData.orgRuleID}});
					}else if(monitorType === 'file' || monitorType === 'folder'){//No I18N
						currController.setProperties({sourceID:rowData.templateId,slidePageHeader:Ember.I18n.t('webclient.admin.devicetype.edit.template',this)}); //No I18N
					}else if(monitorType === 'process'){//No I18N
						currController.set('slidePageHeader',Ember.I18n.t('webclient.action.edit') + " - " + rowData.templateName); //No I18N
					}else if(monitorType === 'url'){//No I18N
						currController.set('pageObj.urlName',rowData.displayName); //No I18N
					}
					var columnName = colMod[col].name;
					if(columnName === 'actions' || columnName === 'DISPLAYNAME' || columnName === 'displayName' || columnName === 'serviceName' || columnName === 'graphName' || columnName === 'templateName'){
						if(monitorType !== 'appmonitor' && monitorType !== 'appservice' && monitorType !== 'eventlog'){
							editPerfThresholdorOtherMonitor();
						}
					}
					grid.jqGrid('setSelection',row,false);//No I18N
				}
				else if((onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile") && colMod[col].name !== 'cb'){
					var self = window.OPM.currentView.handler.controller;
					self.set('notFromCB',true);//No I18N
					grid.jqGrid('setSelection',row,false);//No I18N
				}else if((onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "ApplicationServices") && (colMod[col].name !== 'cb' && colMod[col].name !== 'serviceName' && colMod[col].name !== 'serviceDisplayName' && colMod[col].name !== 'serviceDesc')){
					grid.jqGrid('setSelection',row,false);//No I18N
				}else if(onSelectFunction !== undefined && onSelectFunction === 'VirtualMonitorsList' && colMod[col].name === 'isThresholdEnabled'){
					grid.jqGrid('setSelection',row,false);//No I18N
				}
                else if((onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "VendorMonitor") && (colMod[col].name === 'testStatus')){
					var self = window.OPM.currentView.handler.controller;
					self.set('notFromCB',true);//No I18N
					grid.jqGrid('setSelection',row,false);//No I18N
				}else if(onSelectFunction === 'OnselectsensorList' && colMod[col].name !== 'cb' && colMod[col].name !== 'actions'){//No I18N
					var self = window.OPM.currentView.handler.controller;
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if(rowData.value){
						var paramsList = self.get('sensorComponents').map(function(obj){return obj.parameterName});
						openPerformanceMonEnhancedGraph(rowData.parameterUnitName,rowData.sensorType,'hardware',true,(getCurrentSensorDetails(self,rowData.sensorType)).displayName,'','','',{paramsList:paramsList,selectedParam:rowData.parameterUnitName,IPMIData:{sensorComponents:self.get('sensorComponents'),sensorInfo:self.get('sensorInfo'),selectedSensor:rowData.sensorNameCopy}});//No I18N
					}
				}else if(onSelectFunction === 'TestCredentialProfiles' && colMod[col].name === 'profileName') {
					var profileId = grid.jqGrid('getCell',row,'profileId');//No I18N
					var statusCode = grid.jqGrid('getCell',row,'statusCode');//No I18N
					if (profileId !== undefined && profileId !== "" && window.OPM.userPermissions.discoveryWrite && statusCode != 1) {
						editTestCredentialProfile(profileId);
					}
				}
				else if((onSelectFunction === 'opUtilsScheduler' || onSelectFunction === 'opuScheduler')&& colMod[col].name !== 'gridAction')//No I18N
				{
					var taskName = grid.jqGrid('getCell',row,'task_name');//No I18N
					var tool = grid.jqGrid('getCell',row,'tool-id');//No I18N
					var taskID = grid.jqGrid('getCell',row,'task-id');//No I18N
					if(taskName==="Default Task"){
                        taskName = "Default Group"//No I18N
                    }

					if(taskName !== null && taskName !== "" && tool !== null && tool !== "" && taskID !== null && taskID !== ""){//No I18N
						if(onSelectFunction === 'opuScheduler'){
							openEditTask(tool, taskName, taskID, true);
						}else{
							openEditTask(tool, taskName, taskID);
						}
					}
					if(tool !== undefined && tool === "IP_ADDRESS_MANAGER"){
						var tasktype = grid.jqGrid('getCell',row,'feature_id');//No I18N
						OPMClient.SettingsOpUtilConfigController.set("taskType",tasktype);//No I18N
					}
				}
				else if(onSelectFunction === 'opu_EditAD' && colMod[col].name !== 'gridAction')//No I18N
				{
					var domainID = grid.jqGrid('getCell',row,'ad-domain-id');//No I18N

					if(domainID !== null && domainID !== ""){//No I18N
						OPMClient.SettingsOpUtilConfigController.set("uniqueID",domainID);//NO I18N
						settingsGlobalRoute.transitionTo("Settings.OpUtils.Discovery.AD.Operation","Edit");//NO I18N
					}
				}
				else if(onSelectFunction === 'oputils_editAWSCredential' && colMod[col].name !== 'gridAction')//No I18N
				{
					var credId = grid.jqGrid('getCell',row,'CRED_ID');//No I18N
					var credName = grid.jqGrid('getCell',row,'CRED_NAME');//No I18N
					if(credId !== null && credId !== ""){//No I18N
						oputils_editAWSCredential(credId, credName);
					}
				}
				else if(onSelectFunction === 'editFailover' && colMod[col].name !== 'gridAction' && colMod[col].name !== 'connectUrl')//No I18N
				{
					slideIn(5);
					var protocol = grid.jqGrid('getCell',row,'Protocol');//No I18N
					var host = grid.jqGrid('getCell',row,'Host');//No I18N
					var port = grid.jqGrid('getCell',row,'Port');//No I18N
					var type = grid.jqGrid('getCell',row,'type');//No I18N
					$('#natProtocol').select2().val(protocol).trigger("change");//No I18N
					$('#natName').val(host);
					$('#natPort').val(port);
					OPMClient.SettingsConfigurationController.set("type",type);//No I18N
				}
				else if(onSelectFunction === "opm_IntfTemplateList" )
				{
					var intfType = grid.jqGrid('getCell', row, 'typeid'); //No I18N
					var typeName = grid.jqGrid('getCell', row,'ifname'); //No I18N
					//editIntfTemplate(intfType,typeName);
					OPMClient.SettingsAddEditController.sourceName = typeName;
					OPMClient.SettingsAddEditController.sourceID = intfType;
					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.admin.devicetype.edit.template')+" - "+typeName;
					settingsGlobalRoute.transitionTo('Settings.Configurations.InterfaceTemplate.Types.Edit'); //No I18N
				}
				else if(onSelectFunction === "UrlTemplateList" && colMod[col].name !== "actions"){
					if(window.OPM.userPermissions.monitoringWrite)
					{
					var urlName = grid.jqGrid('getCell', row, 'name'); //No I18N
					var dispName = grid.jqGrid('getCell', row, 'urlName'); //No I18N
					OPMClient.SettingsAddEditController.operation = false;
					OPMClient.SettingsAddEditController.sourceName = urlName;
					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.admin.devicetype.edit.template')+" - "+extractContentFrmHtml(dispName);
					settingsGlobalRoute.transitionTo('Settings.Monitors.UrlTemplate.AddEdit'); //No I18N
					}
				}
				else if(onSelectFunction === "windowsServices" && colMod[col].name !== "actions" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){
					var monName = OPMClient.SettingsTabController.monitorName;
					OPMClient.SettingsAddEditController.operation = false;
					var name = grid.jqGrid('getCell', row, 'name'); //No I18N
					
					// To get the SerivceID and Save it in OPMClient.SettingsAddEditController.set
					//Changes are done to work with NTServiceID instead of Service Displayname
					var serviceID = grid.jqGrid('getCell', row, 'serviceID'); //No I18N

					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.action.edit') + " - " + extractContentFrmHtml(name); //No I18N
					OPMClient.SettingsAddEditController.sourceName = name;
					OPMClient.SettingsAddEditController.set('serviceID',serviceID);//No I18N
					if(colMod[col].name === "associatedDeviceCount"){//No I18N
					    // To get the SerivceID and Save it in OPMClient.SettingsAddEditController.set. Changes are done to work with NTServiceID instead of Service Displayname
						var serviceID = grid.jqGrid('getCell', row, 'serviceID'); //No I18N
						OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{'header':extractContentFrmHtml(name),'serviceID':serviceID});//No I18N
					}else if(window.OPM.userPermissions.monitoringWrite){
						settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', monName); //No I18N
					}
					
				}
				else if(onSelectFunction === "services" && colMod[col].name !== "actions" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){
					var monName = OPMClient.SettingsTabController.monitorName;
					var eName = grid.jqGrid('getCell', row, 'EncodedServiceName'); //No I18N
					var name = grid.jqGrid('getCell', row, 'serviceName'); //No I18N
					var port = grid.jqGrid('getCell', row, 'portNo'); //No I18N
					var thresh = grid.jqGrid('getCell', row, 'failureThreshold'); //No I18N
					var timeOutSec = grid.jqGrid('getCell', row, 'timeout'); //No I18N
					var autoDisc = grid.jqGrid('getCell', row, 'autoDiscovery'); //No I18N

					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.action.edit') + " - " + name; //No I18N
					OPMClient.SettingsAddEditController.sourceName = eName;
					OPMClient.SettingsAddEditController.pageObj = {'name':name,'port':port,'thresholdTime':thresh,'timeOut':timeOutSec,'discovery':autoDisc};//No I18N
					if(colMod[col].name === "associatedDeviceCount"){//No I18N
						var serviceName = grid.jqGrid('getCell', row, 'serviceName'); //No I18N
						OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{'header':extractContentFrmHtml(name),'serviceName':serviceName});//No I18N
					}
				}
				else if(onSelectFunction === "eventLogs" && colMod[col].name !== "actions"  && colMod[col].name !== "associatedDeviceCount" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){
					if(window.OPM.userPermissions.monitoringWrite)
					{
					var monName = OPMClient.SettingsTabController.monitorName;
					var logName = grid.jqGrid('getCell', row, 'logName'); //No I18N
					var ruleName = grid.jqGrid('getCell', row, 'name'); //No I18N

					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.title.edit',this)+" - " + extractContentFrmHtml(grid.jqGrid('getCell', row, 'displayName')); //No I18N
					OPMClient.SettingsAddEditController.sourceName = ruleName;
					OPMClient.SettingsAddEditController.pageObj = {'name':ruleName,'logName':logName,'orgRuleID':grid.jqGrid('getCell', row, 'orgRuleID'),'logFileID':grid.jqGrid('getCell', row, 'logFileID')}; //No I18N
					settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', monName); //No I18N
					}
				}
				else if(onSelectFunction === "eventLogs" && colMod[col].name !== "actions" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){

					var monName = OPMClient.SettingsTabController.monitorName;
					var logName = grid.jqGrid('getCell', row, 'logFileName'); //No I18N
					var ruleName = grid.jqGrid('getCell', row, 'name'); //No I18N
					if(colMod[col].name === "associatedDeviceCount" ){
						var ruleId = grid.jqGrid('getCell', row, 'orgRuleID'); //No I18N
						OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{'header':extractContentFrmHtml(ruleName),'ruleID':ruleId});//No I18N
					}else{
						OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.action.edit') + " - " + extractContentFrmHtml(ruleName); //No I18N
						OPMClient.SettingsAddEditController.sourceName = ruleName;
						OPMClient.SettingsAddEditController.pageObj = {'name':ruleName,'logName':logName}; //No I18N
						settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', monName); //No I18N
					}
				}
				else if(onSelectFunction === "sysLogs" && colMod[col].name !== "actions" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){

					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.action.edit') + " - " + extractContentFrmHtml(rowData.RuleName); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData; 
					settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', OPMClient.SettingsTabController.monitorName);  //No I18N
				}
				else if(onSelectFunction === "processes" && colMod[col].name !== "actions" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){

					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.slidePageHeader = Ember.I18n.t('webclient.action.edit') + " - " + extractContentFrmHtml(rowData.templateName); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData; 
					if(colMod[col].name === "associatedDeviceCount" ){
						var serviceName = grid.jqGrid('getCell', row, 'serviceName'); //No I18N
						OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{'header':extractContentFrmHtml(rowData.templateName),'templateId':rowData.templateId,'protocol':rowData.protocol});//No I18N
					}else if(window.OPM.userPermissions.monitoringWrite){
						settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', OPMClient.SettingsTabController.monitorName);  //No I18N
					}
				}else if((onSelectFunction === "files" || onSelectFunction === "folders") && colMod[col].name !== "actions"){//No I18N
					var templateId = grid.jqGrid('getCell', row, 'templateId'); //No I18N
					if(colMod[col].name === "devicesCnt"){
						var templateName = grid.jqGrid('getCell', row, 'templateName'); //No I18N
						OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{'header':extractContentFrmHtml(templateName),'templateId':templateId});//No I18N
					}else if(window.OPM.userPermissions.monitoringWrite){
						OPMClient.SettingsAddEditController.set('sourceID',templateId); //No I18N
						OPMClient.SettingsAddEditController.set('slidePageHeader',Ember.I18n.t('webclient.admin.devicetype.edit.template',this)); //No I18N
						opm_transitionToTheRoute("Settings.Monitors.SubMonitors.Edit"); //No I18N
					}
				}
				else if((onSelectFunction === "urlMons" || onSelectFunction == "urlMonsAll" || onSelectFunction == "urlMonsDevSpecific") && colMod[col].name === "urlName" && colMod[col].name !=="cb"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					var deviceIdList = grid.getCol('name',false,''); //No I18N
                    var selDevice = grid.jqGrid('getCell', row, 'name'); //No I18N
                    if (deviceIdList != null && deviceIdList != "")
                    {
                        window.OPM.deviceListForNextPrev = deviceIdList;
                    }
					OPMClient.SettingsAddEditController.pageObj = rowData;
					location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+rowData.name;//No I18N
				}
				else if((onSelectFunction === "urlMonsAll" ||  onSelectFunction == "urlMonsDevSpecific") && colMod[col].name === "parentDispName" && colMod[col].name !=="cb"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if(rowData.parentDispName != '-'){
						location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+rowData.parentName;//No I18N
					}
				}
				else if((onSelectFunction == "urlTemplates") && colMod[col].name == "urlName" && colMod[col].name !="cb"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					editUrlMonitor(rowData.name,rowData.urlName,'template'); //No I18N
				}
				else if(onSelectFunction === "traps" &&colMod[col].name !== "cb"&& colMod[col].name !== "actions" && OPMClient.SettingsGlobalMonitors[OPMClient.SettingsTabController.monitorName].isEditable){
					
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					var checkBox=grid.jqGrid('getCell', row, 'cb'); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData; 
					settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', OPMClient.SettingsTabController.monitorName); //No I18N
					checkBox.prop("selected",false); //No I18N
					
				}
				else if(onSelectFunction === "TrapMibsList"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.sourceName = rowData.name;
					OPMClient.SettingsAddEditController.outputSlideView = "loadTrapsFromMib"; //No I18N
					OPMClient.SettingsAddEditController.outputSlideHeader = Ember.I18n.t('webclient.admin.loadfrommibs.trap.header',{ param0: extractContentFrmHtml(rowData.name)}); //No I18N
					settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.AddCustom.Output', OPMClient.SettingsTabController.monitorName); //No I18N
				}
				else if(onSelectFunction === "scriptMonitors" && colMod[col].name !== "actions"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData;
					if(colMod[col].name !== 'associatedDeviceCount'){
						if(window.OPM.userPermissions.adminAccess){
							settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Edit', OPMClient.SettingsTabController.monitorName); //No I18N
						}
					}else{
						OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{header:extractContentFrmHtml(rowData.graphName),graphName:extractContentFrmHtml(rowData.graphName)});//No I18N
					}
				}
				else if(onSelectFunction === "InterfaceTemplateTypesList"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData; 
					OPMClient.SettingsAddEditController.slidePageHeader=rowData.ifname; //No I18N
					settingsGlobalRoute.transitionTo('Settings.Configurations.InterfaceTemplate.Types.Edit');  //No I18N
				}
				else if(onSelectFunction === "InterfaceTemplateGroupsList" && colMod[col].name === "count"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData;
					OPMClient.SettingsAddEditController.slidePageHeader=Ember.I18n.t('webclient.opm.grouping.intflist',this)+" - "+rowData.groupDisplayName; //No I18N
					settingsGlobalRoute.transitionTo('Settings.Configurations.InterfaceTemplate.Groups.IntfList');  //No I18N
				}
				else if(onSelectFunction === "InterfaceTemplateGroupsList" && colMod[col].name !== "count"){
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData;
					OPMClient.SettingsAddEditController.slidePageHeader=Ember.I18n.t('Event_List.Threshold_Settings'); //No I18N
					settingsGlobalRoute.transitionTo('Settings.Configurations.InterfaceTemplate.Groups.Apply');  //No I18N
				}
				else if(onSelectFunction === "logicalGrouplist" && colMod[col].name !== "Actions" && colMod[col].name !== "cb"){
					var groupName = grid.jqGrid('getCell',row,'groupName'); //No I18N
					var gElemType = grid.jqGrid('getCell',row,'groupType'); //No I18N
					redirectotGroupsSnapshot(groupName,gElemType);
				} else if(onSelectFunction === "usersList" && colMod[col].name !== "uID" && colMod[col].name !== "actions" && !(rowContent.isCentralUser == "true" && rowContent.isLoginAllowed == "false")) //No I18n
				{
					// Block edit when the account is deactivated. The grey-out wrapper is
					// rendered by showNotSupportedUsers; here we make sure clicks on a
					// disabled row do not open the edit slide-in.
					if(rowContent.accountActive === false || rowContent.accountActive === "false") {
						return;
					}
					OPMClient.SettingsAddEditController.pageObj = grid.jqGrid('getRowData', row); //No I18N
					var userN = grid.jqGrid('getCell', row, 'uName'); //No I18N
					var uAuth = grid.jqGrid('getCell', row, 'uAuth'); //No I18N
                    if (userN.indexOf('</span>') !== -1 && grid.jqGrid('getCell', row, 'isCentralUser') !== "true" && $(userN).length !== 0) {
                        userN = $(userN).text(); //No I18N
                    }
					if(window.OPM.isOPMStandardEdition && (uAuth === 'domain' || uAuth === 'radius')){
						return;
					}
					if(uAuth === 'domain' && grid.jqGrid('getCell', row, 'isADUserLoginAllowed') === "false") {
						return;
					}
					if(grid.jqGrid('getCell', row, 'isCentralUser') === "true" && grid.jqGrid('getCell', row, 'isLoginAllowed') === "false") {
						return;
					}
					if(window.OPM.userPermissions.userMgmtWrite){
						if(userN === OPMClient.ApplicationController.superadminuser && window.OPM.userName !== OPMClient.ApplicationController.superadminuser) { //No I18N
							opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.user.cannotedit',this));//No I18N
							return true;
						} else {
							OPMClient.SettingsAddEditController.operation = false;
							settingsGlobalRoute.transitionTo('Settings.Basic.UserMgmt.List.Add'); //No I18N
						}
					}
				} 
				else  if((onSelectFunction === "domainList" || onSelectFunction === "windowsADSelectedGroups") && colMod[col].name !== "REFRESH_SYNC" && colMod[col].name !== "ACTION" ) {
					if(window.OPM.userPermissions.generalSettingsWrite) {
						var rowData = grid.jqGrid('getRowData', row); //No I18N
						OPMClient.SettingsAddEditController.pageObj = rowData;
						OPMClient.SettingsAddEditController.operation = false;
						if(onSelectFunction === "windowsADSelectedGroups") {
							OPMClient.SettingsAddEditController.pageObj.domainSubGrid = true; 
						}
						settingsGlobalRoute.transitionTo('Settings.Basic.Authentication.Domain.AddEdit'); //No I18N
					}
				}
				else if(onSelectFunction === "user_roles") {
					var roleId = grid.jqGrid('getCell', row, 'roleId'); //No I18N
					var defaultRoles = grid.jqGrid('getCell', row, 'editable') == "true" ? true : false; //No I18N
					var isRoleFromCentral = grid.jqGrid('getCell', row, 'isRoleFromCentral') == "true" ? true : false; //No I18N
					if(!defaultRoles) {
						if (isRoleFromCentral) {
							opm_infoMsgs('infoMsg',Ember.I18n.t('opm.infoMsg.role.central.noaccess',this));//No I18N
							return true;
						}
						opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.role.cannotedit',this));//No I18N
						return true;
					} else if (!window.OPM.userPermissions.userMgmtWrite) {
						opm_infoMsgs('infoMsg',Ember.I18n.t('webclient.common.restrictionMsg',this));//No I18N
						return true;
					}
					else {
						opm_transitionToParentRoute('Settings.Basic.UserMgmt.Roles.Edit', roleId);//No I18n
					}

 				}
				else if(onSelectFunction == "logsList" && (colMod[col].name == 'fileName'))
				{
					var fileURL = grid.jqGrid('getCell', row, 'url'); //No I18N
					if (fileURL != null && fileURL != "") {
						window.open(window.OPM.opmUrl + fileURL);
					}
				}
				else if ((onSelectFunction == "customerRow" && colMod[col].name == 'CustomerName') || (onSelectFunction == "ProbeDetailsList" && (colMod[col].name == 'name')) && OPMClient.ApplicationController.currentPath !== 'MspGettingStarted' && window.OPM.userPermissions.generalSettingsWrite) {					
					grid.toggleSubGridRow(row);
				}
				else if(onSelectFunction === "AllWorkflowList" && colMod[col].name === 'wfName')
				{
					var wrkflwList = grid.getCol('name',false,''); //No I18N
					var wrkflwId = grid.getCol('rbID',false,''); //No I18N


					if (wrkflwList !== null && wrkflwList !== "")
					{
						window.OPM.workflowListForNextPrev = wrkflwList;
						window.OPM.workflowIdForNextPrev = wrkflwId;
					}

					var wrkflwName = grid.jqGrid('getCell', row, 'name'); //No I18N
					var wrkflwDesc = grid.jqGrid('getCell', row, 'description'); //No I18N	
					var wfId = grid.jqGrid('getCell', row, 'rbID'); //No I18N	
					if (wrkflwName !== null && wrkflwName !== ""  && !window.isoperator)				
					{
						goToWorkflowPage(wrkflwName,wrkflwDesc,wfId);
					}
				}
                else if(onSelectFunction !== undefined && ((onSelectFunction === "apList" && colMod[col].name === 'name') || (onSelectFunction === "defaultAlarmRule" && colMod[col].name === 'profileName')))
                {
                    var rowData = grid.jqGrid('getRowData', row); //No I18N
                    if(rowData.isCentralManaged) {
                        return; // Central-managed profiles cannot be edited on probe
                    }
					if(onSelectFunction === "defaultAlarmRule" && parseInt(rowData.module) === -1) {
                        return; // Static/Global default alarm rules (module=-1) are not editable
                    }
                    if (OPMClient.ApplicationController.isOPM && OPMClient.ApplicationController.isCentralServer) {
                        editAP(rowData.ruleType,rowData.profileID,rowData.regionID);
                    } else if(window.OPM.isMSPCentral){
                        editAP(rowData.ruleType,rowData.profileID,rowData.regionID,rowData.customerID);
                    } else {
                        editAP(rowData.ruleType,rowData.profileID);
                    }
                }
				else if(onSelectFunction !== undefined && (onSelectFunction === 'AD' || onSelectFunction === 'MSSQL' || onSelectFunction.indexOf('Exchange') > -1)){
					var checked = $("#jqg_GlobalMonitorsList_"+row).prop("checked");
					var inputBox = $("#GlobalMonitorsList tr#"+row+" input[type=text]");
					inputBox[0].disabled = !inputBox[0].disabled;
					inputBox[1].disabled = !inputBox[1].disabled;
				}
				else if(onSelectFunction == "BVList" && colMod[col].name === 'bvLabel')

				{
					var bvNameList = grid.getCol('bvName',false,''); //No I18N
					var selBVName = grid.jqGrid('getCell',row,'bvName'); //No I18N
					if (bvNameList != null && bvNameList != "")	//No I18N
					{	
						window.OPM.bvMapListForNextPrev = bvNameList; 
					}
					if (selBVName !== null && selBVName !== "")
					{
						goToBVMapLink(selBVName); 
					} 
				}
				else if(onSelectFunction == "notifyProfileList" && colMod[col].name === "profileName")
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.SettingsAddEditController.pageObj = rowData;
					OPMClient.SettingsAddEditController.operation = false;
					if(rowData.hasSubProfiles && rowData.deviceName !== undefined && $("#np_TypeDrpdwn").val() === "deviceSpecific")
					{
						OPMClient.SettingsAddEditController.fromSnapshotPage = true;
						location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+rowData.deviceName+"/Notification/Edit";//No I18N
					}else if(rowData.hasSubProfiles !== "true" && window.OPM.userPermissions.notificationProfileWrite && !$("#npEditField").hasClass('validateField error') && !$("#npEditField").is(":visible"))
					{
						opm_transitionToTheRoute("Settings.Notification.Edit");//No I18N
					}
				}
				else if(onSelectFunction == "RacksList" && colMod[col].name === 'displayName')

				{
					var rackNameList = grid.getCol('name',false,''); //No I18N
					var selRackName = grid.jqGrid('getCell',row,'name'); //No I18N
					if (rackNameList != null && rackNameList != "")	//No I18N
					{	
						window.OPM.rackListForNextPrev = rackNameList; 
					}
					if (selRackName !== null && selRackName !== "")
					{
						goToRackLink(selRackName);
					} 
				}
				else if(onSelectFunction == "floorList" && colMod[col].name === 'displayName')
				{
					var floorNameList = grid.getCol('name',false,''); //No I18N
					var selFloorName = grid.jqGrid('getCell',row,'name'); //No I18N
					if (floorNameList != null && floorNameList != "")	//No I18N
					{	
						window.OPM.floorListForNextPrev = floorNameList; 
					}
					if (selFloorName !== null && selFloorName !== "")
					{
						goToFloorLink(selFloorName); 
					} 
				}
				else if(onSelectFunction == "L2MapsList" && colMod[col].name === 'mapName' && colMod[col].name !== "cb")
				{
					var layer2NameList = grid.getCol('mapId',false,''); //No I18N
					var selLayer2Name = grid.jqGrid('getCell',row,'mapId'); //No I18N
					if (layer2NameList != null && layer2NameList != "")	//No I18N
					{	
						window.OPM.layer2MapListForNextPrev = layer2NameList;
					}
					goToMapLink(selLayer2Name);
					
				}
				else if(onSelectFunction == "BillReportSubGrid" && colMod[col].name === 'detail')
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.Reports.openBillReportDiv(rowData);
					OPMClient.Reports.getBillReportDetail(rowData.tabName,rowData.stIndex,rowData.edIndex,rowData.per95thVal, rowData.totalCost, rowData.id);
				}
				else if(onSelectFunction === "agents" && colMod[col].name === 'AGENT_MODISPLAYNAME' /*colMod[col].name !== 'actions'*/)
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					rowData.AGENT_MONAME!==undefined && rowData.AGENT_MONAME!=="" ? redirectToDeviceSnapshot(rowData.AGENT_MONAME,'','MonitoringDevice') : '';
					// Disabling onSelect for agent
					// var rowData = grid.jqGrid('getRowData', row); //No I18N
					// OPMClient.SettingsAddEditController.pageObj = rowData; 
					// settingsGlobalRoute.transitionTo('Settings.Monitors.SubMonitors.Actions', OPMClient.SettingsTabController.monitorName); //No I18N
				}
				// else if(onSelectFunction === "agentsSupport" && colMod[col].name == 'AGENTTYPE')
				// {
				// 	var rowData = grid.jqGrid('getRowData', row); //No I18N
				// 	OPMClient.SettingsAddEditController.pageObj = rowData; 
				// 	if (rowData.AGENTTYPE.indexOf("Idle Agent") >= 0  && rowData.STATUS == "5" && window.OPM.userPermissions.discoveryWrite) {
				// 		settingsGlobalRoute.transitionTo('Settings.Agents.AgentList.Actions'); //No I18N
				// 	}
				// }
				else if((onSelectFunction === "FWA_Devices")  && colMod[col].name !== "cb" && colMod[col].name !== "rImg") { //No I18N
					var isOfflineDevice = grid.jqGrid('getCell', row, 'isOfflineDevice'); //No I18N
					if(isOfflineDevice == true || isOfflineDevice == "true"){
						OPMClient.FWAComplianceDetailsController.selrid=grid.jqGrid('getCell', row, 'rid'); //No I18N
						OPMClient.FWAReportsRuleMgmtController.selDevice=grid.jqGrid('getCell', row, 'resName'); //No I18N
						location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Overview";//No I18N
						return false;
					}
					
					if(colMod[col].name == "UnassignedAction"){
						if(OPMClient.InventoryFWAController.UnassignedProt[row-1]){
							$('#jqg_opm_Devices_'+row).prop("checked",true);
							OPMClient.Inventory.redirectUnassignedProtocol(grid.jqGrid('getCell', row, 'reportID'),grid.jqGrid('getCell', row, 'dispName'),grid.jqGrid('getCell', row, 'resName'));//NO I18N
							return false;
						}
					}
					
					var rows = grid.jqGrid('getRowData');  // No I18N
					var deviceIdList = [];
					$.each(rows, function(index, row) {
					  if (row.isOfflineDevice !== 'true') {
					    deviceIdList.push(row.rid);
					  }
					});
					
					if (deviceIdList != null)
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					var selDevice = grid.jqGrid('getCell', row, 'rid'); //No I18N
					if(colMod[col].name == "trafficIcon"){ 
						var fwaresType = grid.jqGrid('getCell', row, 'resType'); //No I18N
						var fwadispName = grid.jqGrid('getCell', row, 'dispName'); //No I18N
						var fwaddid = grid.jqGrid('getCell', row, 'DDID'); //No I18N
						OPMClient.InventoryFWAController.selDeviceId=selDevice;
						OPMClient.InventoryFWAController.fwaresType=fwaresType;
						OPMClient.InventoryFWAController.selDeviceDispName=fwadispName;
						OPMClient.InventoryFWAController.editDeviceDDID=fwaddid;
						OPMClient.InventoryFWAController.selDeviceName=grid.jqGrid('getCell', row, 'resName'); //No I18N
						OPMClient.InventoryFWAController.selDeviceLicStatus=grid.jqGrid('getCell', row, 'licenseStatus'); //No I18N
						OPMClient.InventoryFWAController.snmpSettAvail=grid.jqGrid('getCell', row, 'SnmpSettConf'); //No I18N
						OPMClient.InventoryFWAController.selectedRow=row;
						if (selDevice != null && selDevice != "")
						{
							OPMClient.InventoryDeviceDetailsController.inventorysnapType="FirewallDevice"; //No I18N
							window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selDevice);
							shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selDevice, "FirewallDevice"); //No I18N
							$('#jqg_opm_Devices_'+row).prop("checked",true);
//							OPMClient.Inventory.showHideFWADeviceIntfOptions(grid);
							opmGlobalRoute.transitionTo('Inventory.List.LogMgmt.Sub.ShortSummary','Devices',selDevice); //No I18N
//							redirectToSnapshot("FirewallDevice", selDevice); //No I18N
						}
						return false;
					}
					redirectToSnapshot("FirewallDevice",selDevice); //No I18N
				}else if((onSelectFunction === "FWA_Interfaces")  && colMod[col].name !== "cb") { //No I18N
					var InterfaceIdList = grid.getCol('id',false,''); //No I18N
					if (InterfaceIdList != null && InterfaceIdList != "")
					{
						window.OPM.deviceListForNextPrev = InterfaceIdList; 
					}
					var selInterface = grid.jqGrid('getCell', row, 'id'); //No I18N
					if(colMod[col].name == "trafficIcon"){
						OPMClient.InventoryFWAController.editDeviceID=$('#opm_Devices').jqGrid('getCell', row, 'rid');
						OPMClient.InventoryFWAController.editInterfaceID=$('#opm_Devices').jqGrid('getCell', row, 'id');
						OPMClient.InventoryFWAController.editInterfaceName=$('#opm_Devices').jqGrid('getCell', row, 'name');
						OPMClient.InventoryFWAController.snmpSettAvail=$('#opm_Devices').jqGrid('getCell', row, 'SnmpSettConf');
						OPMClient.InventoryFWAController.selectedRow=row;
						if (selInterface != null && selInterface != "")
						{
							OPMClient.InventoryDeviceDetailsController.inventorysnapType="FirewallInterface"; //No I18N
							window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selInterface);
							shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selInterface, "FirewallInterface"); //No I18N
							$('#jqg_opm_Devices_'+row).prop("checked",true);
	//						OPMClient.Inventory.showHideFWADeviceIntfOptions(grid);
							opmGlobalRoute.transitionTo('Inventory.List.LogMgmt.Sub.ShortSummary','Interfaces',selInterface); //No I18N
	//						redirectToSnapshot("FirewallInterface", selInterface); //No I18N
						}
						return false;
					}
					redirectToSnapshot("FirewallInterface",selInterface); //No I18N
					
				}else if(onSelectFunction === "fwaReportDrillDown")//No I18N
				{
					var InterfaceDetail = jQuery(gridTable).jqGrid('getRowData', row);//No I18N
					var selEntity="";//NO I18N
					if(defaultOptions.selColIndex != undefined){
						for(var i=0;i<defaultOptions.selColIndex.length;i++){
							if(i==0){
								selEntity=InterfaceDetail[defaultOptions.selColIndex[i]];
							}else{
								selEntity=selEntity+"&&"+InterfaceDetail[defaultOptions.selColIndex[i]];
							}
						}
					}else{
						selEntity=InterfaceDetail[0];
					}
					if(defaultOptions.criteria != undefined){
						OPMClient.FWAReportsDetailsController.selCriteria=defaultOptions.criteria;
					}else{
						OPMClient.FWAReportsDetailsController.selCriteria="";//NO I18n
					}
					OPMClient.Inventory.redirectFWAReportDrillDown(OPMClient.InventoryDeviceDetailsController.deviceName,selEntity,defaultOptions.rbbtext,defaultOptions.rbbid);
				}
				else if(onSelectFunction === "fwaReportDrillDownReports")//No I18N
				{
					var InterfaceDetail = jQuery(gridTable).jqGrid('getRowData', row);//No I18N
					var selEntity="";//NO I18N
					if(defaultOptions.selColIndex != undefined){
						for(var i=0;i<defaultOptions.selColIndex.length;i++){
							if(i==0){
								selEntity=InterfaceDetail[defaultOptions.selColIndex[i]];
							}else{
								selEntity=selEntity+"&&"+InterfaceDetail[defaultOptions.selColIndex[i]];
							}
						}
					}
					else{
						selEntity=InterfaceDetail[0];
					}
					if(defaultOptions.criteria != undefined){
						OPMClient.FWAReportsDetailsController.selCriteria=defaultOptions.criteria;
					}else{
						OPMClient.FWAReportsDetailsController.selCriteria="";//NO I18n
					}
					if(InterfaceDetail[0] != undefined && InterfaceDetail[0] != 'Others' && InterfaceDetail[0] != 'Total'){
						if(OPMClient.FWAReportsDetailsController.rtype ==  "MyRep"){
							redirectFWADrillDown($("#deviceList option:selected").attr("repid"),selEntity,defaultOptions.rbbtext,defaultOptions.rbbid);
						}else{
							redirectFWADrillDown($("#deviceList").val(),selEntity,defaultOptions.rbbtext,defaultOptions.rbbid);
						}
					}

				}
				else if((onSelectFunction === "fwaRuleChangeSelect")  && colMod[col].name == "changedOn") { //No I18N
					var versionNo = grid.jqGrid('getCell', row, 'versionNo'); //No I18N
					var prevversionNo = grid.jqGrid('getCell', row, 'prevVersionNo'); //No I18N
					OPMClient.Reports.showRuleChangeHistory(versionNo,prevversionNo);
				}
				else if((onSelectFunction === "FWA_Clouds")  && colMod[col].name !== "cb") { //No I18N
					var serviceList = grid.getCol('Service',false,''); //No I18N
					var selservice = grid.jqGrid('getCell', row, 'Service'); //No I18N
					if (serviceList != null && serviceList != "")
					{
						window.OPM.deviceListForNextPrev = serviceList; 
					}
					if(colMod[col].name == "trafficIcon"){
						if (selservice != null && selservice != "")
						{
							OPMClient.InventoryDeviceDetailsController.inventorysnapType="FirewallService"; //No I18N
							window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selservice);
							shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selservice, "FirewallService"); //No I18N
							opmGlobalRoute.transitionTo('Inventory.List.LogMgmt.Sub.ShortSummary','Clouds',selservice); //No I18N
	//						redirectToSnapshot("FirewallService", selservice); //No I18N
						}
						return false;
					}
					redirectToSnapshot("FirewallService",selservice); //No I18N
				} else if((onSelectFunction === "FWA_Rules")  && colMod[col].name !== "cb") { //No I18N
					var RuleList = grid.getCol('Rule',false,''); //No I18N

					var selrule = grid.jqGrid('getCell', row, 'Rule'); //No I18N
					if (RuleList != null && RuleList != "")
					{
						window.OPM.deviceListForNextPrev = RuleList; 
					}
					if(colMod[col].name == "trafficIcon"){
						if (selrule != null && selrule != "")
						{
							OPMClient.InventoryDeviceDetailsController.inventorysnapType="FirewallRules"; //No I18N
							window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(selrule);
							shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(selrule, "FirewallRules"); //No I18N
							opmGlobalRoute.transitionTo('Inventory.List.LogMgmt.Sub.ShortSummary','Rules',selrule); //No I18N
	//						redirectToSnapshot("FirewallRules", selrule); //No I18N
						}
						return false;
					}
					redirectToSnapshot("FirewallRules",selrule); //No I18N
				} else if((onSelectFunction === "FWA_Users")  && colMod[col].name !== "cb") { //No I18N
					var UserList = grid.getCol('UserName',false,''); //No I18N
					var seluser = grid.jqGrid('getCell', row, 'UserName'); //No I18N
					if (UserList != null && UserList != "")
					{
						window.OPM.deviceListForNextPrev = UserList; 
					}
					if(colMod[col].name == "trafficIcon"){
						if (seluser != null && seluser != "")
						{
							OPMClient.InventoryDeviceDetailsController.inventorysnapType="FirewallUsers"; //No I18N
							window.OPM.shortSummaryIndex = window.OPM.deviceListForNextPrev.indexOf(seluser);
							shortSummaryRowKeydownNew();//opm_deviceShortSummaryView(seluser, "FirewallUsers"); //No I18N
							opmGlobalRoute.transitionTo('Inventory.List.LogMgmt.Sub.ShortSummary','Users',seluser); //No I18N
	//						redirectToSnapshot("FirewallUsers", encodeURIComponent(seluser)); //No I18N
						}
						return false;
					}
					redirectToSnapshot("FirewallUsers",seluser); //No I18N
				} else if((onSelectFunction === "FWA_Rulemgmt")  && colMod[col].name == "dispName") { //No I18N
					var type="Device"; //No I18N
					if(OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type != undefined && OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type[0] != undefined && OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type[0] == "DevGrp"){
						type=OPMClient.InventoryDeviceDetailsController.invListFilterObjects.type[0];
					}
					if(type == "Device"){
						var isdevRuleConfigured = grid.jqGrid('getCell', row, 'isdevRuleConfigured'); //No I18N
						if(isdevRuleConfigured == "false" || isdevRuleConfigured == false){
							location.href=window.OPM.apiclientUrl+"Settings/FirewallConfig/FWA/DeviceRule";//No I18N
							return false;
						}else{
							var rows = grid.jqGrid('getRowData');  // No I18N
							var deviceIdList = [];
							$.each(rows, function(index, row) {
								if (row.isdevRuleConfigured == true || row.isdevRuleConfigured == "true") {
									deviceIdList.push(row.rid);
								}
							});
							
							if (deviceIdList != null)
							{
								window.OPM.deviceListForNextPrev = deviceIdList; 
							}
							var selDevice = grid.jqGrid('getCell', row, 'rid'); //No I18N
							redirectToSnapshot("FWADeviceRuleMgmt",selDevice); //No I18N
						}
					}else{
						var devGrpList = grid.getCol('devGrpId',false,''); //No I18N
						if (devGrpList != null && devGrpList != "")
						{
							window.OPM.deviceListForNextPrev = devGrpList; 
						}
						var selDevice = grid.jqGrid('getCell', row, 'devGrpId'); //No I18N
						redirectToSnapshot("FWADevGrpRuleMgmt",selDevice); //No I18N
					}
					
				} else if((onSelectFunction === "unusedObjectCountList")  && colMod[col].name == "rulename") { //No I18N
					var rulename = grid.jqGrid('getCell', row, 'rulename'); //No I18N
					var rowDat =OPMClient.FWAComplianceDetailsController.unusedObjDetail.data[row-1];
					OPMClient.Reports.showUnusedRuleCountDrillDetail(rulename,rowDat);
				}
				
				else if ((onSelectFunction === "snapshot_performanceMonitors" || onSelectFunction === "snapshot_exchangeMonitors" || onSelectFunction === "snapshot_adMonitors" || onSelectFunction === "snapshot_mssqlMonitors" || onSelectFunction === "snapshot_storageMonitors") && colMod[col].name != "actions" && colMod[col].name != "cb" && colMod[col].name !== "pollingStatus") { //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.DeviceMonitorsActionController.set('snapshotObj',rowData);//No I18N
					OPMClient.DeviceMonitorsActionController.set('pollID',rowData.pollId);//No I18N

					if(onSelectFunction === "snapshot_performanceMonitors" && colMod[col].name=="thresholdStatus")
					{
						var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
						if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite){
							doMonitorActions(row,'perfedit');//No I18N
						}
						return;
					}
					if((onSelectFunction === "snapshot_adMonitors" || onSelectFunction === "snapshot_exchangeMonitors" || onSelectFunction === "snapshot_mssqlMonitors") && colMod[col].name=="thresholdStatus")
					{
						var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
						if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite){
							doMonitorActions(row,'perfedit');//No I18N
						}					
						return;
					}
					if (rowData.sSave !== undefined && rowData.sSave === 'true') {
						if (onSelectFunction === "snapshot_performanceMonitors" || onSelectFunction === "snapshot_storageMonitors") { //No I18N
							if (rowData.checkNumeric === "true") { //No I18N
								openPerformanceMonEnhancedGraph(rowData.policyName,rowData.name,false,false,rowData.displayNameCopy);
							}
						}
						else if(onSelectFunction === "snapshot_mssqlMonitors" )
						{
							if(colMod[col].name != "data")
							{
								openPerformanceMonEnhancedGraph(rowData.policyName,rowData.name,false,false,rowData.displayNameCopy);
							}
						}
						else {
							openPerformanceMonEnhancedGraph(rowData.policyName,rowData.name,false,false,rowData.displayNameCopy);
						}
					}
				} else if (onSelectFunction === "snapshot_scriptMonitors" && colMod[col].name != "actions" && colMod[col].name != "cb" && colMod[col].name != "data" && colMod[col].name !== "pollingStatus") { //No I18N
					if(colMod[col].name=="thresholdSeverity")
					{
						var deviceName = OPMClient.InventoryDeviceDetailsController.deviceName;
						var rowData = grid.jqGrid('getRowData', row); //No I18N
						if (!window.OPM.isCentralServer && window.OPM.userPermissions.adminAccess){
							doMonitorActions(row,'scriptedit');//No I18N
						}	
						return;
					}
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if(rowData.checkNumeric !== undefined && rowData.checkNumeric === "true")
					{
					OPMClient.DeviceMonitorsActionController.set('snapshotObj',rowData);//No I18N
						openPerformanceMonEnhancedGraph(rowData.displayName,rowData.displayName,false,false,rowData.displayName);
					}
				}
				else if ((onSelectFunction === "snapshot_serverMonitors" || onSelectFunction === "snapshot_ntServiceMonitors" || onSelectFunction === "snapshot_mssqlServices" || onSelectFunction === "snapshot_exchangeServices" || onSelectFunction === "snapshot_adServices") && colMod[col].name != "actions" && colMod[col].name != "cb") {
					var rowData = grid.jqGrid('getRowData', row); //No I18N					
					if(colMod[col].name=="thresholdStatus" && onSelectFunction === "snapshot_serverMonitors")
					{
						if(!window.OPM.isCentralServer && window.OPM.userPermissions.monitoringWrite)
						{
							editDeviceServerMonitor(encodeURIComponent(rowData.name),rowData.portNo);
						}
						return;
					}
					rowData.monType = onSelectFunction.split("snapshot_")[1];
					OPMClient.DeviceMonitorsActionController.set('snapshotObj', rowData);//No I18N
					
					if('snapshot_serverMonitors' === onSelectFunction){
						redirectSnapShot('Monitors/ServiceGraph/'+(rowData.moid)+'/'+encodeURIComponent(rowData.name)+'/'+rowData.portNo);// No I18N
					}else{
						var instanceName = ('snapshot_ntServiceMonitors' === onSelectFunction) ? 'winService' : 'service';// No I18N
						redirectSnapShot('Monitors/AvailabilityGraph/'+(rowData.moid || rowData.serviceMOID)+'/'+instanceName+'/'+encodeURIComponent(rowData.name || rowData.displayName));// No I18N
					}
					// opm_transitionToParentRoute('Inventory.Device.Monitors.Details');//No I18N
				}
				else if (onSelectFunction === "snapshot_urlMonitors" && colMod[col].name != "actions" && colMod[col].name != "compactURL" && colMod[col].name != "cb")
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					var deviceIdList = grid.getCol('name',false,''); //No I18N
                    var selDevice = grid.jqGrid('getCell', row, 'name'); //No I18N
                    if (deviceIdList != null && deviceIdList != "")
                    {
                        window.OPM.deviceListForNextPrev = deviceIdList;
                    }
					OPMClient.InventoryURLController.set('deviceName',OPMClient.InventoryDeviceDetailsController.deviceName); //No I18N
					location.href = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+encodeURIComponent(rowData.name);//No I18N
				}
				else if(onSelectFunction === "snapshot_processMonitors" && colMod[col].name != "actions" && colMod[col].name != "cb")
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					rowData.monType=onSelectFunction.split("snapshot_")[1];
					OPMClient.DeviceMonitorsActionController.set('snapshotObj',rowData);//No I18N
					redirectSnapShot('Monitors/ProcessGraph/'+(rowData.id)+'/'+encodeURIComponent(rowData.name));// No I18N
				}
				else if((onSelectFunction === "snapshot_folderMonitors" || onSelectFunction === "snapshot_fileMonitors") && colMod[col].name != "actions" && colMod[col].name != "cb")
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					rowData.monType=onSelectFunction.split("snapshot_")[1];
					OPMClient.DeviceMonitorsActionController.set('snapshotObj',rowData);//No I18N
					redirectSnapShot('Monitors/FileFolderGraph/'+rowData.monType+'/'+(rowData.filemonitorid || rowData.foldermonitorid)+'/'+encodeURIComponent(rowData.monitorname));// No I18N
				}
				else if (onSelectFunction === "virtual_snap" && colMod[col].name == "DISPLAYNAME") //No I18N
				{

					var deviceIdList = grid.getCol('NAME',false,''); //No I18N

					var selDevice = grid.jqGrid('getCell', row, 'NAME'); //No I18N
					if (deviceIdList != null && deviceIdList != "") //No I18N
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					if (selDevice != null && selDevice != "") //No I18N
					{
						$('#opm_DeviceSnapList'+defaultOptions.snapId+' tr').removeClass('active'); 
						$("#"+row).addClass('active'); 
						var rowData=jQuery('#opm_DeviceSnapList'+defaultOptions.snapId).jqGrid('getGridParam','data');//No I18N

						redirectToSnapshot("MonitoringDevice",selDevice); //No I18N

					}  
				}
				else if (onSelectFunction === "proxmox_snap" && ["mo_name", "container_name", "vm_name", "host_name"].includes(colMod[col].name)) //No I18N
				{
					var selDevice = grid.jqGrid('getCell', row, "mo_name"); //No I18N
					if (selDevice) {
						redirectToSnapshot("MonitoringDevice",selDevice); //No I18N
					}  
				}
				else if (onSelectFunction === "optmizationList")//No I18N
				{
					var DrillDownID = grid.jqGrid('getCell', row, 'DrillDownID'); //No I18N
					var PolicyName = grid.jqGrid('getCell', row, 'PolicyName'); //No I18N
					var RuleName = grid.jqGrid('getCell', row, 'Rule'); //No I18N
					var paramdata = {'rID':OPMClient.FWAReportsDetailsController.devID};//No I18N
					if(OPMClient.FWARuleMgmtDeviceSelectionController.isDevGrpSelected){
						paramdata.rID= grid.jqGrid('getCell', row, 'rid'); //No I18N
						OPMClient.FWARuleMgmtDeviceGroupController.drillRid= grid.jqGrid('getCell', row, 'rid'); //No I18N
					}
					paramdata.policyName=PolicyName;
					paramdata.drillDownID =DrillDownID;
					$.ajax({
						url:window.OPM.apiUrlPattern + '/fwacompliance/getPolicyAnomalyDetails', //No I18N
						type:'GET',//No I18N
						data:paramdata,
						async: false,
						success:function(jsonData){
							OPMClient.Reports.closeFWAComplianceSlideDiv();
							slideIn(2);
							OPMClient.FWACompliance.loadAnamolyDetail(jsonData,RuleName);
						}
					});
				}else if (onSelectFunction === "fwaComplianceSchList" && colMod[col].name !== "Action")//No I18N
				{
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.Reports.closeFWAComplianceSlideDiv();
					OPMClient.Reports.openComplianceScheduleEditPage(rowData);
				}else if(onSelectFunction === "forwarderList" && colMod[col].name !== "gridAction" && window.OPM.userPermissions.toolsetWrite){//No I18N
					var host = grid.jqGrid('getCell',row,'Dest_Addr');//No I18N

					var port = grid.jqGrid('getCell',row,'Dest_Port');//No I18N
					if(host !== undefined && host !== "" && port !== undefined && port !== "" ){//No I18N
						OPMClient.SettingsTrapController.set("destHost",host);//No I18N
						OPMClient.SettingsTrapController.set('destPort',port);//No I18N
						opm_transitionToParentRoute("Settings.Tools.ToolForward.Operation","Edit");//No I18N
					}
				}
				else if(onSelectFunction === "wncmconfigchanges" )
				{
					var deviceIdList = grid.getCol('VersionId',false,''); //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigChange/"+rowData.VersionId; //No I18N
				}
				else if(onSelectFunction === "wncmrecentbackup" )
				{
					var deviceIdList = grid.getCol('ResourceId',false,''); //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList; 
					}
					location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+rowData.ResourceId; //No I18N
				}
				else if(onSelectFunction === "wncmcompliance" )
				{
					var deviceIdList = grid.getCol('ResPolicyId',false,''); //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N 
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigResCompliance/"+rowData.ResPolicyId; //No I18N
				}
				else if(onSelectFunction === "wncmeolandannounced" )
				{
					var deviceIdList = grid.getCol('ResourceId',false,''); //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					redirectToMSPSnapshot(rowData.ResourceId);
//					location.href = window.apiclientUrl+"Inventory/Snapshot/ConfigDevice/"+rowData.ResourceId; //No I18N
				}
				else if(onSelectFunction === "wncmpendingconfiguploadreq" )
				{
					var deviceIdList = grid.getCol('id',false,'');//No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					OPMClient.SettingsNCMConfigController.reqId=rowData.id;
					if(OPMClient.ApplicationController.isNCM) {
						location.href = window.apiclientUrl+"NCMConfigAutomation/UploadRequests/PendingRequests/"+rowData.id; //No I18N
					}
					else {
						location.href = window.apiclientUrl+"Settings/NcmConfig/UploadRequests/Pending/"+rowData.id; //No I18N
					}
				}
				else if(onSelectFunction == "fwadevListWidget") { //No I18N
					var deviceIdList = grid.getCol('rid',false,''); //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					if (deviceIdList != null && deviceIdList != "")
					{
						window.OPM.deviceListForNextPrev = deviceIdList;
					}
					if(defaultOptions!= undefined && (defaultOptions.wName == "widget.name.firewallprotocoltrafficreport" || defaultOptions.wName == "widget.name.firewallsecurityoverview" )){
						OPMClient.FWAGlobalDataController.timePeriod=(defaultOptions.timePeriod != undefined )?defaultOptions.timePeriod:"today";//No I18N
						if(defaultOptions.wName == "widget.name.firewallsecurityoverview"){
							OPMClient.InventoryFWAController.selInvTabOrder=7;
						}
					}
					window.OPM.currentView = OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
					if(!window.OPM.isEmbed){
						location.href = window.apiclientUrl+"Inventory/Snapshot/FirewallDevice/"+rowData.rid; //No I18N
					}
				}
				else if(onSelectFunction == "fwadevListSubGridClick") { //No I18N
					var rowData = grid.jqGrid('getRowData', row); //No I18N
					OPMClient.FWAGlobalDataController.timePeriod=defaultOptions.timePeriod;
					OPMClient.InventoryFWAController.selDeviceID=rowData.RESOURCEID;
					window.OPM.currentView = OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
					if(!window.OPM.isEmbed){
						redirectToSnapshot("traffic_Protocol",encodeURIComponent(rowData.ProtocolGroup));//NO I18N
					}
				}
				else if(onSelectFunction  === 'opm_interfacesList' &&  colMod[col].name !== "gridAction" &&  colMod[col].name !== "cb" && colMod[col].name !== "pollingStatus")//No I18n
				{
					if(colMod[col].name === "connected-device"){
						return false;
					}
					var selInterface = grid.jqGrid('getCell', row, 'name'); //No I18N
					var interfaceList = grid.getCol('name',false,''); //No I18n
					if (selInterface !== null && selInterface !== "")//No I18n
					{
						window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringInterface"; //No I18N
						redirectToSnapshot("MonitoringInterface", selInterface); //No I18N
						window.OPM.deviceListForNextPrev = interfaceList;
					}
				}
				else if(onSelectFunction  === "VlanList" &&  colMod[col].name !== "gridAction" &&  colMod[col].name !== "cb")//No I18n
				{
					var selVLAN = grid.jqGrid('getCell', row, 'name'); //No I18N
					var VLANList = grid.getCol('name',false,''); //No I18n

					if (selVLAN !== null && selVLAN !== "")//No I18n
					{
						window.OPM.deviceListForNextPrev = selVLAN;
						window.OPM.prevView=OPMClient.Router.router.currentHandlerInfos[OPMClient.Router.router.currentHandlerInfos.length-1];
						OPMClient.InventoryDeviceDetailsController.inventorysnapType="MonitoringVLAN"; //No I18N
						redirectToSnapshot("MonitoringVLAN", selVLAN); //No I18N
					}
					if(VLANList !== null || VLANList !== "")
					{
						window.OPM.deviceListForNextPrev = VLANList;
					}
					if($('body').hasClass('deviceMenuSlideIn')) {
						$('.deviceslideActionBtn').click();
					}
				}
				else if(onSelectFunction==="performanceMonitors" && colMod[col].name === 'displayName')	
				{
					if(!(window.OPM.isMSPEdition && OPMClient.ApplicationController.isMSPCentralSelected) && window.OPM.userPermissions.monitoringWrite){
			    		var rowData = grid.jqGrid('getRowData',row);//No I18N
			    		OPMClient.Settings.openEditPerformanceMonitorsSlide(rowData.graphName,rowData.graphId,rowData.customGraph);
					}
				}else if(onSelectFunction==="performanceMonitors" && colMod[col].name === 'associatedDeviceCount'){
					var policyName = grid.jqGrid('getCell', row, 'graphName'); //No I18N
					var displayName = grid.jqGrid('getCell', row, 'displayName'); //No I18N
					OPMClient.SettingsMonitoringController.set('monitorDetailsForAssociatedList',{'header':extractContentFrmHtml(displayName),'policyName':policyName});//No I18N
				}else if(onSelectFunction==="searchConfig")	//No I18n
				{
					OPMClient.NCMInventoryConfigSearchController.selectedVersionId = grid.jqGrid('getCell', row, 'VERSION_ID'); //No I18N
					OPMClient.NCMInventoryConfigSearchController.selectedHostName = grid.jqGrid('getCell',row,'ADDRESS'); //No I18N
//					OPMClient.NCMInventoryConfigSearchController.selectedHostName = grid.jqGrid('getCell',row,'RESOURCENAME'); //No I18N
					OPMClient.NCMInventoryConfigSearchController.selectedFileType = grid.jqGrid('getCell',row,'FILE_TYPE'); //No I18N
					OPMClient.NCMInventoryConfigSearchController.selectedVersionNo = grid.jqGrid('getCell',row,'VERSION_NO'); //No I18N
					location.href = location.href +'/NCMConfigSearchResults'; //No I18N	
				}else if(onSelectFunction==="sharedDT" && colMod[col].name != 'action')	//No I18n
				{
					OPMClient.SettingsNCMConfigController.sharedDTRecordID = grid.jqGrid('getCell', row, 'RECORDID'); //No I18N
					location.href = location.href +'/Details'; //No I18N	
				}
				else if(onSelectFunction==="SystemDetailsList" && colMod[col].name === 'sysdetailsedit')
				{
					location.href = window.OPM.apiclientUrl+"Settings/Tools/Network/SystemDetails/Edit/"+grid.jqGrid('getCell', row, 'ip-address'); //No I18n
				}
				else if(onSelectFunction === 'schedulesList' && colMod[col].name !== 'actions' && colMod[col].name !== 'Status' && colMod[col].name !== 'cb')
				{
					var schName = grid.jqGrid('getCell',row,'ScheduleName');//No I18N
					var typeid = grid.jqGrid('getCell',row,'typeid');//No I18N
					if((schName !== null && schName !== "") && (typeid !== null && typeid !== "12"))
					{
						//editScheduleReport(schName,typeid);
						OPMClient.ReportsDetailsController.schName = extractContentFrmHtml(schName);
						OPMClient.ReportsDetailsController.typeid = typeid;
						OPMClient.ReportsDetailsController.isEditSch = true;

						opm_transitionToParentRoute('Reports.Opmanager.CreateScheduleReport'); //No I18N
					}
				}
				else if(onSelectFunction === 'unSupportedLogs' && colMod[col].name == 'recomm')
				{		
						slideIn(1);
						$('#deviceDetNotify').show();
						$("#fwaDevType").text('<'+Ember.I18n.t('snapshot.desc.firewall')+' '+Ember.I18n.t('opstor.inventory.type')+'>');
						$("#fwaSampleRec").text(grid.jqGrid('getCell', row, 'SampleRecord')); //No I18N
				}
				else if(onSelectFunction === 'policyOptTable')
				{	
					var selOpt=grid.jqGrid('getCell', row, 'keyValue');//No I18N
					var selOptText=grid.jqGrid('getCell', row, 'text');//No I18N
					var selVal = grid.jqGrid('getCell', row, 'Value');//No I18N
					if(parseInt(selVal) > 0){
						$('#fwaPolicyOptList').show();
						$('#fwaPolicyOverviewList').hide();
						$('#fwaOverviewSrchCriteriaDiv').hide();
						OPMClient.FWAOverviewFilterCriteriaController.set("showFilterCriteria",false);//No I18N
						$('#fwaRuleDetailDiv').hide();
						$('#policyOptCountDet').text(Ember.I18n.t('webclient.common.widgets.eventcount')+" : "+selVal);
						$('#policyOptHeader').text(selOptText);
						OPMClient.FWAReportsDetailsController.selOptType=selOpt;
						$("#fwaPolicyOptList").parent().css("maxWidth","100%");
						slideIn(1);
						OPMClient.FWACompliance.listPolicyOpt(selOpt);
					}
				}
				else if(onSelectFunction === 'businessRulesList' && colMod[col].name!=='description' && colMod[col].name!=='delAction') {
					var ruleName = grid.jqGrid('getCell',row,'ruleName');//No I18N
					var ruleID = grid.jqGrid('getCell',row,'ruleID');//No I18N
					if((ruleName !== null && ruleName !== ""))
					{
						OPMClient.ReportsDetailsController.ruleName = ruleName;
						OPMClient.ReportsDetailsController.ruleID = ruleID;
						OPMClient.ReportsDetailsController.isEditBusinessRule = true;
						opm_transitionToParentRoute('Reports.Opmanager.Settings.BusinessHourRules.BusinessHourRule'); //No I18N
					}
				}
				else if(onSelectFunction === 'policyOverviewStatTable')
				{	
					var rbbName=grid.jqGrid('getCell', row, 'rbbName');//No I18N
					var selOptText=grid.jqGrid('getCell', row, 'i18Ntitle');//No I18N
					var selVal = grid.jqGrid('getCell', row, 'Count');//No I18N
					if(parseInt(selVal) > 0){
						$('#fwaPolicyOptList').hide();
						$('#fwaPolicyOverviewList').show();
						$('#fwaOverviewSrchCriteriaDiv').hide();
						OPMClient.FWAOverviewFilterCriteriaController.set("showFilterCriteria",false);//No I18N
						$('#fwaRuleDetailDiv').hide();
						$('#policyOverviewCountDet').text(Ember.I18n.t('webclient.common.widgets.eventcount')+" : "+selVal);
						$('#policyOverviewHeader').text(selOptText);
						$("#fwaPolicyOverviewList").parent().css("maxWidth","100%");
						OPMClient.FWAReportsDetailsController.set("drillSearch",false); //No I18N
						slideIn(1);
						OPMClient.FWACompliance.listOverview(OPMClient.FWAReportsDetailsController.devID,rbbName,true);
					}
				}else if(onSelectFunction === 'standardScheduleList')//NO I18N
				{	
					if(colMod[col].name == 'Actions'){
						var selResDetail = standardMainObject.get("selResDetail");
						if($(event.target).hasClass('editSchedule')){
							var repDetail={};
							repDetail.repname = $(event.target).attr('repname');
							repDetail.reptype = $(event.target).attr('reptype');
							repDetail.time = $(event.target).attr('time');
							repDetail.email = $(event.target).attr('email');
							OPMClient.Reports.showStandardScheduleProfile(repDetail);
						}else if($(event.target).hasClass('deleteSchedule')){
							var data = 'reportName='+$(event.target).attr('report')+'&rid='+selResDetail.RID; //NO I18N
							jQuery.ajax({
								url:window.OPM.apiUrlPattern + "/fwacompliance/deleteSingle", //NO I18N
								data:data,
								type:'POST',//No I18N
								success:function(res)
								{
									opm_infoMsgs("successMsg", Ember.I18n.t('webclient.general.Schedule_Delete',this));	//NO I18N
									OPMClient.Reports.loadComplianceStandardScheduleList(selResDetail.RID);
								},
								error:function(jqXHR, exception)
								{
									var errors = jQuery.ajaxError(jqXHR, exception)
									opm_infoMsgs('errorMsg', errors); //No I18N
								}
							});
						}
					}
				}
				else if(onSelectFunction === 'cveSearchTool')//No I18N
				{
					var cveId = grid.jqGrid('getCell', row, 'CVEID'); //No I18N
					OPMClient.NCMFirmwareVulnerability.cveIdForDetails = cveId;
                    if(!window.OPM.isNCM){
                        updateCveDetSlide(cveId);
                    }
					else{
					    location.href = window.OPM.apiclientUrl+'NCMFirmwareVulnerability/CveSearch/CveSearchSlide';//No I18N
					}
				}
				else if(onSelectFunction === "monitorHealthList" && colMod[col].name !== "gridAction") {
					var rowdata = $(gridTable).jqGrid('getRowData', row);
					var formatoptions;
					for(var i=0; i < colMod.length; i++) {
						if(colMod[i].formatoptions) {
							formatoptions = colMod[i].formatoptions;
							break;
						}
					}
					if(formatoptions) {
						rowdata.categoryBy = formatoptions.categoryBy;
						rowdata.time = formatoptions.time;
						if(!rowdata.monitorName && rowdata.categoryBy === 'device') {
							rowdata.monitorName = formatoptions.monitorName;
						}
						OPMClient.ReportsController.selectedMonitorObj = rowdata;
						opm_transitionToTheRoute("SupportAnalysis.MonitorHealthReports.FailureLogs"); //No I18n
					}
				}
				else if(onSelectFunction === 'fwadeviceRuleOnSelect')
				{
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'executionCommandsDrill'){
						fwa_RuleAdminLocObjShowComm(rowdet); 
					}
					if(colMod[col].name == 'ruleNameTxt'){
						if(rowdet.changeType != "delete"){
							fwaRuleAdminObjectDetailsSlide(rowdet);
						}
					}
					if(colMod[col].name == 'statusTxt'){
						if(rowdet.status == "3"){
							fwa_RuleAdminLocObjStatusDrill(rowdet); 
						}
					}
				}
				else if(onSelectFunction === 'fwaCommmitAuditOnSelect')
				{
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'commitOutputTxt'){
						rowdet.headerTxt=Ember.I18n.t("webclient.fwa.rule.admin.commit.output",this);//NO I18N
						fwa_RuleAdminCommitAuditOutput(rowdet); 
					}
				}
				else if(onSelectFunction === 'FWAReviewListDrill' ||onSelectFunction == 'FWARuleApprovalListDrill')
				{
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'executionCommandsDrill'){
						fwa_RuleAdminLocObjShowComm(rowdet); 
					}
					if(colMod[col].name == 'statusTxt'){
						if(rowdet.status == "3"){
							fwa_RuleAdminLocObjStatusDrill(rowdet); 
						}
					}
					if(colMod[col].name == 'objNameTxt'){
						if(rowdet.changeType != "delete"){
							fwaRuleAdminObjectDetailsSlide(rowdet);
						}
					}
					if(colMod[col].name == 'remarksDrill'){
						var remark="";
						if($("input[name='requestCategory']:checked").val() == "2" || $("input[name='requestCategory']:checked").val() == "3"){
							remark = rowdet.reviewRemarks;
						}else{
							remark = rowdet.remarks;
						}
						if(remark != "" && remark != undefined){
							fwaRuleAdminRemarkDetailsSlide(rowdet);
						}
					}
					if(colMod[col].name == 'reviewStatusTxt'){
						if(rowdet.reviewStatus == 0){
							fwaRaisePushRequest(true);
						}
					}
				}
				else if(onSelectFunction === 'FWAServiceObjectDrill')
				{
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'executionCommandsDrill'){
						fwa_RuleAdminLocObjShowComm(rowdet); 
					}
					if(colMod[col].name == 'statusTxt'){
						if(rowdet.status == "3"){
							fwa_RuleAdminLocObjStatusDrill(rowdet); 
						}
					}
					if(colMod[col].name == 'objNameTxt'){
						if(rowdet.changeType != "delete"){
							fwaRuleAdminObjectDetailsSlide(rowdet);
						}
					}
				} 
				else if(onSelectFunction === 'RuleAdminChangeHistoryList')
				{
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'oldChange'){
						if(rowdet.existingData != undefined){
							rowdet.headerTxt=Ember.I18n.t("webclient.fwa.ruleadmin.history.oldchange",this);//NO I18N
							rowdet.drillParam="old";//NO I18N
							fwa_RuleAdminHistoryDrill(rowdet); 
	                   	}
					}
					if(colMod[col].name == 'newChange'){
						if(rowdet.completeObjData != undefined){
							rowdet.headerTxt=Ember.I18n.t("webclient.fwa.ruleadmin.history.newchange",this);//NO I18N
							rowdet.drillParam="new";//NO I18N
							fwa_RuleAdminHistoryDrill(rowdet); 
	                   	}
					}
					if(colMod[col].name == 'diffview'){
						if(rowdet.type!="policyObject"){
							var objid=rowdet.objId;
							fwa_loadDiffViewChangeHist(objid);							
						}
					}
					if(colMod[col].name == 'objNameTxt'){
						if(rowdet.changeType != "delete"){
							fwaRuleAdminObjectDetailsSlide(rowdet);
						}
					}
				}else if(onSelectFunction === "opmstacksensorinfogrid" && colMod[col].name === "sensor"){

					var snpashotTabs = OPMClient.InventoryDeviceDetailsController.deviceSummaryObj.snapDetails.tabs.tabs;
					var tabId ;
					$.each(snpashotTabs,function(k,obj){if(obj.name === "opu.common.HARDWARE"){tabId = obj.tabid;}});//NO I18N
					$('.intfSubTabs li[data-tabid="'+tabId+'"]').click();//NO I18N
				}
				else if(onSelectFunction === "ruleRecTableDivPager"){
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'rulename'){
						if(rowdet != undefined){
							fwa_RuleRecRuleDetails(rowdet); 
	                   	}
					}
				}
				else if(onSelectFunction === "fwaRuleExpirySelect"){
					var rowdet=grid.jqGrid("getLocalRow", row);//NO I18N
					if(colMod[col].name == 'ruleNumberTxt'){
						$('.ruleExpiryDetailDiv').show();
						$('.ruleExpiryScheduleListDiv').hide();
						$('.ruleExpiryDetailDiv').parent().css({'max-width':'100%'});
						slideIn(1);
						OPMClient.Reports.loadFWARuleExpiryDetailSlide(row);
					}
					
				}
				else if(onSelectFunction === "fwaObjUsageDrillDownReports")//No I18N
				{
					var InterfaceDetail = jQuery(gridTable).jqGrid('getRowData', row);//No I18N
					var type = gridTable.replace("_List","");
					var widType;
					type = parseInt(type.replace("#",""));
					var selEntity=InterfaceDetail["ObjName"]; 
					if(type === 0 || type === 1){
						widType = "Network"; //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillWidTitle","Usage details of "+selEntity); //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillTitle", Ember.I18n.t("webclient.fwa.user.ruleusage")); //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillDesc", Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity})); //No I18N
						var drillDet = [{colNameList:  [Ember.I18n.t("webclient.admin.alarmesc.RuleName"), Ember.I18n.t("webclient.fwa.hits")], isSelected: true, desc: Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity}),drillType:"topRule",  tabName:Ember.I18n.t("webclient.fwa.user.ruleusage"),id:"0"}, //No I18N
						                {colNameList:  [Ember.I18n.t("opstor.inventory.ipaddress"), Ember.I18n.t("webclient.fwa.hits")], isSelected: false, desc: Ember.I18n.t("fwa.object.usage.drill.top.ip.desc",{objName: selEntity}), drillType:"topIP", tabName:Ember.I18n.t("webclient.devices.details.top")+" "+Ember.I18n.t("opstor.inventory.ipaddress"),id:"1"}]; //No I18N
					}else if(type === 2 || type === 3){
						widType = "Service"; //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillWidTitle","Usage details of "+selEntity); //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillTitle", Ember.I18n.t("webclient.fwa.user.ruleusage")); //No I18N
						OPMClient.FWAComplianceObjUsageDetailsController.set("drillDesc", Ember.I18n.t("webclient.fwa.user.ruleusage")); //No I18N
						var drillDet = [{colNameList:  [Ember.I18n.t("webclient.admin.alarmesc.RuleName"), Ember.I18n.t("webclient.fwa.hits")], isSelected: true, desc: Ember.I18n.t("fwa.object.usage.drill.top.rules.desc",{objName: selEntity}), drillType:"topRule", tabName:Ember.I18n.t("webclient.fwa.user.ruleusage"),id:"0"}, //No I18N
						                {colNameList:  [Ember.I18n.t("opu.views.PORT"), Ember.I18n.t("webclient.fwa.hits")], isSelected: false, desc: Ember.I18n.t("fwa.object.usage.drill.top.port.desc",{objName: selEntity}),  drillType:"topPort", tabName:Ember.I18n.t("webclient.devices.details.top")+" "+Ember.I18n.t("opu.views.PORT"),id:"1"}]; //No I18N
					}
					OPMClient.FWAComplianceObjUsageDetailsController.set("drillData",{type:widType,objName:selEntity}); //No I18N
					OPMClient.FWAComplianceObjUsageDetailsController.set("drillDetails",drillDet); //No I18N
					if(type != 4 && type != 5){
						location.href=window.OPM.apiclientUrl+"FWANewCompliance/RuleManagement/Optimization/ObjDetails/"+encodeURIComponent(selEntity); //No I18N
					}
				}
				else if(onSelectFunction==="selectedRCAEntity" && colMod[col].name==="actions"){//NO I18N
					if(OPMClient.RCAController.selectedEntities.length===1){
						opm_infoMsgs("infoMsg",Ember.I18n.t("webclient.opm.rca.profile.minimum.oneentity",this));//No I18N
						return;
					}
					OPMClient.RCAController.removeElementFromObject(OPMClient.RCAController.selectedEntities,"name",rowContent.name);//No I18N
					$('#selectedEntityList').jqGrid('delRowData',row);//No I18N
					OPMClient.RCAController.removeAssociatedEntities(rowContent.name);
					$.each(gridSelectedRows["#entityList"],function(key,value){//No I18N
						if(rowContent.entityType==="Devices" && value.deviceName===rowContent.name){
							delete gridSelectedRows["#entityList"][key];//No I18N
						}else if(value.name===rowContent.name){
							delete gridSelectedRows["#entityList"][key];//No I18N
						}
					});
					var availableEntities = $('#entityList').jqGrid("getGridParam","data");//No I18N
					if(availableEntities!==undefined){
					for(var i=0;i<availableEntities.length;i++)
					{
						if(rowContent.entityType==="Devices" && availableEntities[i].deviceName===rowContent.name){//No I18N
							$('#entityList').jqGrid('setSelection',availableEntities[i]["_id_"],false);//No I18N
						}else if(availableEntities[i].name===rowContent.name){
							$('#entityList').jqGrid('setSelection',availableEntities[i]["_id_"],false);//No I18N
							}
						}
					}
					if(OPMClient.RCAController.selectedEntities.length===0){
						$('.selectedBox .nodataMsg').show();//No I18N
						$('.selectedBox .opm_jqGridUI').hide();//No I18N
					}
				}else if(onSelectFunction === 'opmEntitySelectionSelectedEntityList' && colMod[col].name === 'actions'){
				    $.each($('#entityList').jqGrid('getGridParam','data'),function(){
				    	if(this.id === rowContent.id){
				    		$('#entityList').jqGrid('setSelection',this.id,false);//No I18N
				    		return false;
				    	}
				    });
				    $.each(gridSelectedRows["#entityList"],function(key,value){//No I18N
						if(value.id===rowContent.id){
							delete gridSelectedRows["#entityList"][key];//No I18N
							return false;
						}
					});
				    OPMClient.entitySelectionController.removeSelectedEntity(rowContent);
				}

				//Alarm Profile Selected entity removal
				else if (onSelectFunction === "selectedAPEntity" && colMod[col].name === "actions") {//NO I18N
					OPMClient.APController.removeElementFromObject(OPMClient.APController.selectedEntities, "moid", rowContent.moid);//No I18N
					$('#selectedEntityList').jqGrid('delRowData', row);//No I18N
					$.each(gridSelectedRows["#entityList"], function (key, value) {//No I18N
						if ((rowContent.entityType === "Devices" || rowContent.entityType === "Interfaces" || rowContent.entityType === "ipsla") && rowContent.moid === value.moid) {
							delete gridSelectedRows["#entityList"][key];//No I18N
						} else {
							delete gridSelectedRows["#entityList"][key];//No I18N
						}
					});
					var availableEntities = $('#entityList').jqGrid("getGridParam", "data");//No I18N
					if (availableEntities !== undefined) {
						for (var i = 0; i < availableEntities.length; i++) {
							if ((rowContent.entityType === "Devices" || rowContent.entityType === "Interfaces") && rowContent.moid == availableEntities[i].moid) {//No I18N
								$('#entityList').jqGrid('setSelection', availableEntities[i]["id"], false);//No I18N
							} else if (rowContent.entityType === "Groups" && rowContent.moid == availableEntities[i].groupID) {
                                $('#entityList').jqGrid('setSelection', availableEntities[i]._id_, false);//No I18N
                            } else if (rowContent.entityType === "ipsla" && rowContent.moid == availableEntities[i].moid) {
                                $('#entityList').jqGrid('setSelection', availableEntities[i]._id_, false);//No I18N
                            } else {
								var groupID = availableEntities[i]["groupID"];//No I18N
								$("input[name=groups_groupSelectorRadio][value='"+groupID+"']").prop('checked',false);//No I18N
							}
						}
					}
					if (OPMClient.APController.selectedEntities.length === 0) {
						$('.selectedBox .nodataMsg').show();//No I18N
						$('.selectedBox .opm_jqGridUI').hide();//No I18N
					}
					OPMClient.APController.set("entityCount", OPMClient.APController.selectedEntities.length); //No I18N
				}

				//Alarm Profile Selected entity removal for Select Device
				else if (onSelectFunction === "selectedAPEntitySelDev" && colMod[col].name === "actions") {//NO I18N
					OPMClient.APController.removeElementFromObject(OPMClient.APController.selectedEntitiesSelDev, "moid", rowContent.moid);//No I18N
					$('#selectedEntityListSelDev').jqGrid('delRowData', row);//No I18N
					$.each(gridSelectedRows["#entityListSelDev"], function (key, value) {//No I18N
						if (rowContent.moid == value.moid) {
							delete gridSelectedRows["#entityListSelDev"][key];//No I18N
						}
					});
					var availableEntities = $('#entityListSelDev').jqGrid("getGridParam", "data");//No I18N
					if (availableEntities !== undefined) {
						for (var i = 0; i < availableEntities.length; i++) {
							if (rowContent.moid == availableEntities[i].moid) {
								$('#entityListSelDev').jqGrid('setSelection', availableEntities[i]["id"], false);//No I18N
							}
						}
					}
					if (OPMClient.APController.selectedEntitiesSelDev.length === 0) {
						$('.selectedBoxSelDev .nodataMsg').show();//No I18N
						$('.selectedBoxSelDev .opm_jqGridUI').hide();//No I18N
					}
				}

				else if(onSelectFunction==="rcaList" && colMod[col].name==="NAME"){//NO I18N
					if(window.OPM.isMSPCentral && (OPMClient.ApplicationController.isMSPCentralSelected || OPMClient.ApplicationController.isMSPAllProbeSelected)){
						modifyMSPCustomerSelector(rowContent.CUSTOMERID, true,true,false,true, rowContent.PROBEID);
					}else if(window.OPM.isCentralServer){
						OPMClient.RCAController.eeProbeID = rowContent.PROBEID
					}
					opmGlobalRoute.transitionTo('Alarms.Alarm.RCA.ViewReport',rowContent.ID);//No I18N
				}
				else if(onSelectFunction === "fwaRiskDrilldownReport" && colMod[col].name==="risk")//No I18N
				{
					var rowData = jQuery(gridTable).jqGrid('getRowData', row);//No I18N
					var ruleName = rowData.ruleName;
					var policyName = rowData.policyName;
					OPMClient.FWAComplianceRiskAnalysisController.set("selRuleName",ruleName); //No I18N
					OPMClient.FWAComplianceRiskAnalysisController.set("selPolicyName",policyName); //No I18N
					location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARiskAnalysis/RiskLevel"; //No I18N
				}
				else if(onSelectFunction === "fwaRuleDrilldownReport" && colMod[col].name==="info")//No I18N
				{
					var rowData = jQuery(gridTable).jqGrid('getRowData', row);//No I18N
					var info = rowData.info;
					var id = rowData.riskid; 
					var severity = rowData.level;
					location.href=window.OPM.apiclientUrl+"FWANewCompliance/FWARiskAnalysis/Rule/"+encodeURIComponent(info)+"/"+id+"/"+severity; //No I18N
				}
				else if(onSelectFunction === "apmActionProfile" &&colMod[col].name !== "cb"&& colMod[col].name !== "NAME"){//No I18N
					return false;				
				}
									
				if(onSelectFunction === "ncmConfigBackupSummaryOnClick")
				{
					
					var probeName = grid.jqGrid('getCell', row, 'Probe'); //No I18N
					
					var filter="";
					var filterLabel="";
					OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {};
					OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {}; 
					OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget=true;
					var obj = {};
					var obj1 = {};
					obj1[probeName]=probeName;
					
					if((colMod[col].name === 'Success') || (colMod[col].name === 'Failure') ||(colMod[col].name === 'NotBackedUp'))
					{
						if(colMod[col].name === 'Success')
						{
							filter = "SUCCESS";//No I18N
							filterLabel = "Backup Success";//No I18N
						}
						if(colMod[col].name === 'Failure')
						{
							filter = "FAILURE";//No I18N
							filterLabel = "Backup Failed";//No I18N
	
						}
						if(colMod[col].name === 'NotBackedUp')
						{
							filter = "NOTSTARTED";//No I18N
							filterLabel = "Not BackedUp";//No I18N
	
						}
						obj[filter]=filterLabel;
						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"NCMBackupStateHolder__BACKUP_STATUS":[filter],"RegionalServerInfo__NAME":[probeName]};
						OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"NCMBackupStateHolder__BACKUP_STATUS":obj,"RegionalServerInfo__NAME":obj1}; //No I18N
					}
					else
					{
						OPMClient.InventoryDeviceDetailsController.ncmDrillListFilterObjects = {"RegionalServerInfo__NAME":[probeName]};
						OPMClient.InventoryDeviceDetailsController.ncmDrillSubFilterObjects = {"RegionalServerInfo__NAME":obj1}; //No I18N
					}
						
					if(OPMClient.InventoryDeviceDetailsController.isFromDashBoardWidget == true)
					{
						location.href=window.OPM.apiclientUrl+"Inventory/List/ConfigMgmt/Devices";//No I18N
					}


				}
				},
					loadComplete: function ()
					{
					    if(onSelectFunction == 'ncmNotificationTrigger') {
					        var data = OPMClient.NCMNotificationTriggerController.gridData;
					        var selectedRowIds = data ? data[gridTableIdAlone] : null;
					        var ids = grid.jqGrid("getDataIDs");  //No I18N
					        if(selectedRowIds) {
					            for (var i = 0; i < ids.length; i++) {
                                    var rowData = grid.jqGrid("getRowData", ids[i]);
                                    if (selectedRowIds.hasOwnProperty(rowData[gridTableIdAlone + "_id"])) {
                                        grid.jqGrid("setSelection", ids[i], false);
                                    }
                                }
                            }
							if(defaultOptions && defaultOptions.removeGridPagerActions) { // Remove only search and reload - ColChooser is not removed but hidden
								try {
									$(gridNavigator + "_left").remove();
								} catch (e) {}
							}
							if(defaultOptions.multiselect && !$('#gbox_'+ (gridTable.replace("#",''))).hasClass('opmCusGrid')) {
								$('#gbox_'+ (gridTable.replace("#",''))).addClass('opmCusGrid');
							}
                        }
					    if(onSelectFunction == 'NCMNotificationActions') {
							if(defaultOptions.multiselect && !$('#gbox_'+ (gridTable.replace("#",''))).hasClass('opmCusGrid')) {
								$('#gbox_'+ (gridTable.replace("#",''))).addClass('opmCusGrid');
							}
                        }
						jgGridTableID=gridTable;
						if (onSelectFunction === "virtual_snap")
						{
							
		                    var dataIds = grid.jqGrid('getDataIDs'); //No I18N
							$.each(dataIds,function(k,rowId){
								 var rowData =  grid.jqGrid('getRowData',rowId);//No I18N
			                    if (parseInt(rowData.MOID) < 0 || !rowData.IPADDRESS) {//update this to have your own check
			                        var checkbox = $("#jqg_"+gridTableIdAlone + "_"+rowId);//update this with your own grid name
			                        checkbox.css("visibility", "hidden");
			                    }
			                    
							});
                		}
						
						if(reloadAfterFirstLoad) {
							reloadAfterFirstLoad = false;
							if(grid == undefined) {
								grid = $(gridTable);
							}
							setTimeout(function(){
								grid.trigger('reloadGrid');//No I18N
							},100);
						}
						if(forceSingleSelection === true) {
							$(gridTable+'_cb').find("input.cbox").remove();
						}
						if($(gridTable).jqGrid('getGridParam','groupHeader')!== null && !defaultOptions.forceGroupHeadersAtEachLoad) {
							$(gridTable).jqGrid('destroyGroupHeader');
						}
						// For NCM set grid width
						if(defaultOptions != undefined){
							var width1 = $(gridTable).closest('.opmFormHolder').width()-30;
							var width2 = $(gridTable).closest('.opmTabCont').width()-60;
							if(isNaN(width1)) {
								width1 = 0;
							}
							if(isNaN(width2)) {
								width2 = 0;
							}
							if(onSelectFunction == "PolicyRuleDevices") {
								width1 = $("#complianceContent").width();
							}
							if(onSelectFunction!=undefined && onSelectFunction.indexOf("FirmwareVulnerabilityGridAllList_") === 0)
							{
								width1 = defaultOptions.widthOfTable;
							}
							defaultOptions.setWidth ? $(gridTable).jqGrid('setGridWidth',(width1>width2)?width1:width2 ) :'' ;//No I18N
					    }
						if(defaultOptions.groupsList != undefined && defaultOptions.groupsList.length > 0 && (defaultOptions.groupsAdded == undefined || defaultOptions.groupsAdded != true)) {
							defaultOptions.groupsAdded = true;
							var colgroupsList = defaultOptions.groupsList;
							$(gridTable).jqGrid('setGroupHeaders', { // No i18n
								useColSpanStyle: true,
								groupHeaders:colgroupsList
							});
						}
						if (onSelectFunction == 'SDPOPCISyncReportsList' || onSelectFunction == 'ServiceNowCISyncReportsList' || onSelectFunction == 'AECISyncReportsList') {
							var $jqgrid = $(gridTable);
							$(".jqgrow", $jqgrid).each(function (index, row) {
								var cellValue = $(row).find('td[aria-describedby="' + onSelectFunction + '_moId"').text();
								var $row = $(row);
								if (cellValue === '-1') {
									$row.find("input:checkbox").attr("disabled", "disabled");// No i18n
									$row.addClass("ui-state-disabled");
									$row.css("opacity", 1);// No i18n
								}
							});
                        }
					    if(onSelectFunction==="ipam_subnetList" || onSelectFunction==="ipam_dhcpList" || OPMClient.InventoryDeviceDetailsController.opuNewSnapshot){
					  //   	$(gridTable).jqGrid('setGridWidth',$("#widgetElement_"+defaultOptions.snapId).width()-10,true)
							// //fix for scroll bar which is caused by grid border
							// var gview = grid.parents("div.ui-jqgrid-view"); //No I18n
							// $(gview).width($(gview).width()+2)
					    }
						else if('CustomFieldsTable' === onSelectFunction){
							var gridProps = this.p;
							var data = gridProps.data, index = gridProps._index, rowid;
							for (rowid in index) {
								if (index.hasOwnProperty(rowid)) {
									var rowData = data[index[rowid]];
									if (typeof (rowData.cb) === "boolean" && rowData.cb) {
                                         grid.jqGrid('setSelection', rowid, false); //No I18n
									}
								}
							}
						}

                     
						

						//for OpUtils BWMlist actions
						opUtilsIPToolTip();
						var $this = $(this);
						if(window.OPM.isOPUtils && window.OPM.currentView.name=="Inventory.List.OpUtils.Sub.index"){
							$("#grid_nodata").hide();
						}
						$(this).removeClass('gridnodata');
						var checkboxes = $(this).find("input.cbox");
						if(!(OPMClient.InventoryDeviceDetailsController.subFilterType == 'Url' && window.OPM.isCentralServer && OPMClient.ApplicationController.currentPath.indexOf('Inventory.List.Server.') >= 0)){
						checkboxes.after("<i></i>");
						}
						if(defaultOptions != undefined && defaultOptions.isSnapshotGrid) {
							snapshotRemotegridCallback(defaultOptions.snapId, countOfRows, gridTable, false, defaultOptions.reload);

						}
						if(defaultOptions != undefined && defaultOptions.loadCompleteFunction != undefined) {
							defaultOptions.loadCompleteFunction();
						}
						if(gridCallBack!==undefined && gridCallBack!==null){
							if(gridCallBackParams!==undefined && gridCallBackParams!==null){
								gridCallBack(gridTableIdAlone,gridCallBackParams);
							}
							else{
								gridCallBack(gridTableIdAlone);
							}
						}
						if(isLazyLoadingGrid)
						{
							var recEndCount = ((lazyLoadParams.page)*lazyLoadParams.viewRecords);
							if(recEndCount > lazyLoadParams.totalRecords){
								recEndCount = lazyLoadParams.totalRecords;
							}
							var recText = "View "+(((lazyLoadParams.page-1)*lazyLoadParams.viewRecords)+1)+" - "+recEndCount+" of "+ lazyLoadParams.totalRecords;//No I18N
							$(gridTable).jqGrid('setGridParam', { //No I18N
						        recordtext:recText

							});
							$(gridTable)[0].updatepager(false, true);
							$(gridNavigator+' .ui-pg-input').val(Math.floor(lazyLoadParams.page));//No I18N
							$(gridNavigator+" td[dir='ltr']:first span").text(lazyLoadParams.totalPages);//No I18N

							if($(gridNavigator+" .ui-icon-seek-end").hasClass("fielddisable")){
								$("#last_"+gridNavigator.substring(1,gridNavigator.length)).addClass("ui-state-disabled");
							}
							var totalDataset = Math.ceil(lazyLoadParams.totalRecords/lazyLoadParams.fetchRows);
							if(lazyLoadParams.isLazyReport){
							    lazyLoadParams.isLazyReport = false;
							    if(totalDataset>1){
								if(lazyLoadParams.totalRecords > (lazyLoadParams.fetchRows*3)){
									$("#first_"+gridNavigator.substring(1,gridNavigator.length)).hide();
									$("#last_"+gridNavigator.substring(1,gridNavigator.length)).hide();
								}
								$(gridNavigator+" .ui-icon-seek-end").addClass("fielddisable");//No I18N
								$("#last_"+gridNavigator.substring(1,gridNavigator.length)).addClass("ui-state-disabled");
								lazyLoadParams.isFirstTimeLoad=true;
						       	lazyLoadParams.datasetIndex++;
						       	 lazyLoadParams.isFirstDataFetched=false;
						       	 lazyLoadParams.isFirstDataLoaded=false;
						       	 lazyLoadParams.isSecondDataLoaded=false;
						       	 lazyLoadParams.isSecondDataFetched=false;
						 		 var apiParams = {
									fetchFromRowNumber:((lazyLoadParams.fetchRows)*(lazyLoadParams.datasetIndex-1))+1,
									rowsToFetch:lazyLoadParams.fetchRows
					    		}
					    		if(lazyLoadParams.apiParams!==undefined){
					    			apiParams = $.extend({},apiParams,lazyLoadParams.apiParams);
					    		}
					    		var sendType ="GET"; //No I18N
					    		if(lazyLoadParams.postRequest){
							    	sendType ="POST"; //No I18N
							    }
						       	$.ajax(
								{
									url: lazyLoadParams.apiUrl,
									data: apiParams,
									type: sendType,
									dataType:'json', //No I18n
									beforeSend: function(XMLHttpRequest,settings)
							  		{
							  			opm_progressBarInit();
							  			appendCollectorDetails(XMLHttpRequest,settings);
							  			appendFWACollectorDetails(XMLHttpRequest,settings);
							  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
							  		},
									success: function(jsonData)
									{
										setAdditionalParamsForLazyLoading(lazyLoadParams,jsonData);
										lazyLoadParams.isFirstDataFetched=true;
										if(Object.values(jsonData)[0].CustomWidget) {
                                        	jsonData.rows=Object.values(jsonData)[0].WidgetData;
                                        }
										lazyLoadParams.data = lazyLoadParams.data.concat(jsonData.rows);
										var currentSet = Math.ceil((lazyLoadParams.page+1)/lazyLoadParams.pagesPerDataset);
										if (currentSet===2 ){
											lazyLoadParams.page--;
											lazyLoadParams.isFirstDataLoaded=true;
											$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
									    		datatype: 'local',//No I18N
												page: lazyLoadParams.pagesPerDataset,
												data: lazyLoadParams.data
											});
											$(gridTable).trigger('reloadGrid');//No I18N
										}
					       				if(totalDataset>2){
									    	lazyLoadParams.datasetIndex++;
							 				apiParams = {
												fetchFromRowNumber:((lazyLoadParams.fetchRows)*(lazyLoadParams.datasetIndex-1))+1,
												rowsToFetch:lazyLoadParams.fetchRows
					    						}
								    		if(lazyLoadParams.apiParams!==undefined){
								    			apiParams = $.extend({},apiParams,lazyLoadParams.apiParams);
								    		}
											$.ajax(
												{
													url: lazyLoadParams.apiUrl,
													data: apiParams,
													type: sendType,
													dataType:'json', //No I18n
													beforeSend: function(XMLHttpRequest,settings)
											  		{
											  			opm_progressBarInit();
											  			appendCollectorDetails(XMLHttpRequest,settings);
											  			appendFWACollectorDetails(XMLHttpRequest,settings);
											  			appendNCMProbeDetailsToURL(XMLHttpRequest, settings);
											  		},
													success: function(jsonData)
													{
														setAdditionalParamsForLazyLoading(lazyLoadParams,jsonData);
													    lazyLoadParams.isSecondDataFetched=true;
														if(Object.values(jsonData)[0].CustomWidget) {
															jsonData.rows=Object.values(jsonData)[0].WidgetData;
														}
														lazyLoadParams.data = lazyLoadParams.data.concat(jsonData.rows);
														var currentSet = Math.ceil((lazyLoadParams.page+1)/lazyLoadParams.pagesPerDataset);
														if (currentSet===3){
															lazyLoadParams.page--;
															lazyLoadParams.isSecondDataLoaded=true;
															$(gridTable).jqGrid('clearGridData').jqGrid('setGridParam', { //No I18N
															    datatype: 'local',//No I18N
																page: lazyLoadParams.pagesPerDataset*2,
																data: lazyLoadParams.data
															});
														    	$(gridTable).trigger('reloadGrid');//No I18N
															}
														if(lazyLoadParams.totalRecords < (lazyLoadParams.fetchRows*3)){
															$(gridNavigator+" .ui-icon-seek-end").removeClass("fielddisable");//No I18N
															$("#last_"+gridNavigator.substring(1,gridNavigator.length)).removeClass("ui-state-disabled");
														}
													}

											});
										}else{
											$(gridNavigator+" .ui-icon-seek-end").removeClass("fielddisable");//No I18N
											$("#last_"+gridNavigator.substring(1,gridNavigator.length)).removeClass("ui-state-disabled");

										}
									}

					       			});

						       	}
						    }
						}
						if(onSelectFunction === "AddSubnetValuesTable"){
							var selectOpts = {};
							$("select[name='cFldDrop']").map(function(){selectOpts[$(this).attr('id')] = $(this).val();}).get();
							OPMClient.InventoryOpUtilsController.set("importOpUFldsOptList",selectOpts);//No I18N
							$.each(selectOpts,function(k,v){
								var selVal = $("#"+k).val();//No I18N
								$('select[id!="' +k+ '"]').each(function(index) {
				                    $(this).find('option[value="' + OPMClient.InventoryOpUtilsController.importOpUFldsOptList[k] + '"]').removeAttr('disabled');//No I18N
				                    OPMClient.InventoryOpUtilsController.importOpUFldsOptList[k] = selVal;
				                });
							});
						}
						if(onSelectFunction === "AddValuesTable")
						{
							var selectOpts = {};
							$("select[name='cFldDrop']").map(function(){ selectOpts[$(this).attr('id')] = $(this).val();}).get();
							OPMClient.SettingsConfigurationController.set("importFldsOptList",selectOpts);//No I18N

							$.each(selectOpts,function(k,v){
								var selVal = $("#"+k).val();//No I18N
								$('select[id!="' +k+ '"]').each(function(index) {
				                    $(this).find('option[value="' + OPMClient.SettingsConfigurationController.importFldsOptList[k] + '"]').removeAttr('disabled');//No I18N
				                    if (selVal !== 'null') {
				                        $(this).find('option[value="' + selVal + '"]').attr('disabled',true);//No I18N
				                    }
				                    OPMClient.SettingsConfigurationController.importFldsOptList[k] = selVal;
				                });
							});

						}
						if(onSelectFunction === "opm_rediscoverInterfaces" && onPagingCall)
						{
							var dataIds = grid.jqGrid('getDataIDs'); //No I18N
							$.each(dataIds,function(k,rowId){
								 var listId = grid.jqGrid('getCell',rowId,'id');//No I18N
								 if(reDisIntJson.length > 0 && reDisIntJson.indexOf(listId) > -1){
								 	grid.jqGrid('setSelection', rowId, true);//No I18N
								 	grid.jqGrid('setGridParam', { "deselectAfterSort": false}); //No I18N
								 }
							});
							onPagingCall = false;
						}
						if(onSelectFunction === "addNTMonitorList_1")
						{
							var selCnt = 1;
							$.each(jsonData, function(key,obj){

								if(obj.isSelected === true){
									$this.jqGrid('setSelection', selCnt, true);//No I18N
								}
								selCnt = selCnt+1;
							});
							var selectedArray = $("#addMonitorList_1").jqGrid('getGridParam', 'selarrrow');
							$.each(selectedArray,function(index, item){
								$("#jqg_addMonitorList_1_"+item).attr('disabled','disabled');
							});
						}
						if(onSelectFunction === "snapshotMonitorList")
						{
							var selCnt = 1;
							$.each(jsonData, function(key,obj){
								if(obj.associated === true){
									$this.jqGrid('setSelection', selCnt, true);//No I18N
									$("#"+obj.name+"_INTERVAL").attr("disabled", "disabled");
									$("#"+obj.name+"_THRESHOLDVALUE").attr("disabled", "disabled");
								}
								if(obj.name == "ISPUsedDiskSpace" && obj.associated === true)//No I18N
								{
									$('#publicStoreDiv').show()
								}
								else if(obj.name == "ISMUsedDiskSpace" && obj.associated === true)//No I18N
								{
									$('#mailStoreDiv').show();
								}
							selCnt = selCnt+1;
							});

						}
						if(onSelectFunction === "snapshotServicesList")
						{
							var selCnt = 1;
							$.each(jsonData, function(key,obj){
								if(obj.associated === true){
									$this.jqGrid('setSelection', selCnt, true);//No I18N
								}
							selCnt = selCnt+1;
							});
						}
						if(onSelectFunction === "FWLoadDeviceRule")
						{
							var searchFilter = $(gridTable).getGridParam("postData");
							var selCnt = 1;
							var finishedLoad = false;
							$.each(jsonData, function(key,obj){
								if(obj.STATUS == 0){
									finishedLoad=true;
									return false;
								}
							});
							clearTimeout(fwaDeviceRuleListReload);
							if(finishedLoad && (searchFilter != undefined && searchFilter._search == false)){
								fwaDeviceRuleListReload = setTimeout(function(){
									OPMClient.Settings.FWLoadDeviceRule();
								},7000);
							}
						}
						if(onSelectFunction === "fwaConfigVersionCleanup")
						{
							var selCnt = 1;
							var finishedLoad = false;
							$.each(jsonData, function(key,obj){
								if(obj.status == "progress"){
									finishedLoad=true;
									return false;
								}
							});
							if(finishedLoad){
								clearTimeout(fwaConfigVersionCleanupListReload);
								fwaConfigVersionCleanupListReload = setTimeout(function(){
									fwaConfigVersionCleanup();
								},5000);
							}
						}
						if(onSelectFunction === "FWACollectorList")
						{
							clearTimeout(fwaCollectorTimer);
							var finishedLoad = true;
							$.each(jsonData, function(key,obj){
								if(obj.collectionStatus == 3){
									finishedLoad=false;
									return false;
								}
							});
							if(!finishedLoad){
								fwaCollectorTimer = setTimeout(function(){
									OPMClient.Settings.FWloadCollectorList();
								},5000);
							}
						}
						if(onSelectFunction === "BulkApproveSubnetsList"){
							$('.select2').select2();
						}
						if(onSelectFunction === "opm_alarmList")
						{
							opm_tooltip();
							opm_alarmsActionsInit();

						}
						else if(onSelectFunction === "opm_AlarmEvents" || onSelectFunction === "opm_AlarmWrkflws" || onSelectFunction === "opm_AlarmNotes" || onSelectFunction === "opm_EC_ProblemAlarms")
						{
							setTimeout(function(){
								opm_setHeightAlarmView();
							},500);
						}
						else if(onSelectFunction === 'opm_DevicesList' || onSelectFunction === "opm_Urls" || onSelectFunction==="opm_Groups" || onSelectFunction==="opm_VLANs")
						{
							opm_tooltip();
							if(isVirtualNonMOEntity === true){
				     			opm_devlistInit(isVirtualNonMOEntity);
				     			$("#virtualMonitoringInterval").hide();
				     		}else{
				     			opm_devlistInit();
				     			$("#virtualMonitoringInterval").show();
				     		}
						}else if(onSelectFunction === "credentialsList"){//No I18N
							if(OPMClient.DiscoveryWizardAddEditController.operation === 'Edit'){//No I18N
								setSelectedProfileCredentials();
							}
							else if(OPMClient.VMwareDiscoveryController.isVMwareDiscoveryWizard )
							{
								if (OPMClient.VMwareDiscoveryController.IsUserSelectedCredetials == true) {
									$.each(OPMClient.VMwareDiscoveryController.userSelectedCredetials, function(_, rowId) {
					                	$("#DECredProfList").setSelection(rowId, false);
					            	});
								} else {
									$.each(OPMClient.VMwareDiscoveryController.entities.selectedCredentials, function(_, rowId) {
					                	$("#DECredProfList").setSelection(rowId, false);
					            	});
								}

							}
						}else if(onSelectFunction === "ruleEngineList"){//No I18N
							if(OPMClient.DiscoveryWizardAddEditController.operation === 'Edit'){//No I18N
								setSelectedRuleEngines();
							}
						}else if(onSelectFunction === "ipam_switchportList"){//No I18N
							oputilsPortLegentColor(this);
							colChooserWidthScrollerForSPM(defaultOptions.snapId);
						}
						else if(onSelectFunction === "configureIntfList")
						{
							setTimeout(function(){
								$this.setGridParam({ datatype: 'local' }); //No I18N
								var ids = $this.jqGrid('getDataIDs');//No I18N
								$.each(ids,function(i){
									$this.jqGrid('editRow', ids[i], //No I18N
											{
										keys: true,
										oneditfunc: function() {
										}
											});
								});
								//$(".deviceSlideDivIn-6.noSlideEffects .opmFormHolder > section").scrollTop(0);
								$(".deviceSlideDivIn-6.noSlideEffects .mt-md").scrollTop(0);
							}, 300);
						}else if(onSelectFunction === "VMwareEvents"){//No I18N
							if(OPMClient.SettingsTabController.monitorName === "vmwareEvents"){
								var vmgrid = $("#vmwareEventsList");//No I18N
    							var vmgridData = vmgrid.jqGrid("getGridParam","data");//No I18N

								var gridData = $("#VmwareAddEventsList").jqGrid("getGridParam","data");//No I18N
							    $.each(gridData,function(k,v){
							    	$.each(vmgridData,function(){
							    		if(v.EVENT_NAME == this.EVENT_NAME){
								            $("#VmwareAddEventsList").jqGrid("setSelection",gridData[k]._id_,true);//No I18N
								            $("#jqg_VmwareAddEventsList_"+gridData[k]._id_).prop("disabled",true);//No I18N
								        }
							    	});
							    });
							}else{
							checkAssociatedVMwareEvents();
							}
						}else if(onSelectFunction === 'OnselectsensorList'){//No I18N
							var self = window.OPM.currentView.handler.controller;
							$.each(grid.getGridParam().expandedGroups,function(groupId,isExpanded){
								if(isExpanded){
									grid.jqGrid('groupingToggle',groupId);//No I18N
								}
							});
							$.each($('#gridsensorList tr.jqgroup b'),function(){
								if(getCurrentSensorDetails(self,$(this).text().split(' ')[0])){
									$(this).addClass('pointer');
								}
							});
							$this.click(function(event){
								if($(event.target).is('tr.jqgroup b')){
									var sensorType = $(event.target).text().split(' ')[0];
									var sensorDetails = getCurrentSensorDetails(self,sensorType);
									if(sensorDetails){
										var sensorComponents = self.get('sensorComponents');
										var parameterUnitName = sensorDetails.selected;
										var sensorName = '';
										var arrayIndex = sensorComponents.map(function(obj){return obj.parameterName;}).indexOf(parameterUnitName);
										if(sensorComponents[arrayIndex] !== undefined && sensorComponents[arrayIndex].availableSensors !== undefined && sensorComponents[arrayIndex].availableSensors.length){
											sensorName = sensorComponents[arrayIndex].availableSensors[0].sensorName;
										}
										var paramsList = self.get('sensorComponents').map(function(obj){return obj.parameterName});
										openPerformanceMonEnhancedGraph(parameterUnitName,sensorType,'hardware',true,sensorDetails.displayName,'','','',{paramsList:paramsList,selectedParam:parameterUnitName,IPMIData:{sensorComponents:self.get('sensorComponents'),sensorInfo:self.get('sensorInfo'),selectedSensor:sensorName}});//No I18N
									}
								}
							});
						}else if(onSelectFunction !== undefined && (onSelectFunction === 'AD' || onSelectFunction === 'MSSQL' || onSelectFunction.indexOf('Exchange') > -1)){//No I18N
							$.each(grid.getGridParam().data,function(rowIndex,rowValue){
			                    $('#GlobalMonitorsList [id='+rowValue.name+'_INTERVAL],[id='+rowValue.name+'_THRESHOLDVALUE]').attr('disabled',true);//No I18N
			                });
						}else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "MonitorProfile"){
							if(window.OPM.currentView.handler.controller.get('doJqGridSelection')){
								doJqGridSelection(grid,onSelectFunction);
							}
						}else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "VendorMonitor"){
							var self = window.OPM.currentView.handler.controller;
							var selectedMonitorsArray = self.get('selectedMonitors');
							var partitionDirectSelectionList = self.get('partitionDirectSelectionList');
					        var monitorsGridData = grid.jqGrid('getGridParam','data'); //No I18N
					        var selectionDone = 0;
					        $.each(monitorsGridData,function(index,rowObject){
					            var currentRowData = grid.jqGrid('getRowData',index+1);  //No I18N
					            if(selectedMonitorsArray.contains(Number(currentRowData.GRAPHID))){
					            	grid.jqGrid('setSelection',index+1,true);//No I18N
					            	if(self.get('prevSelectedIds') !== undefined && self.get('prevSelectedIds').contains(currentRowData.GRAPHID)){
					            		$('#jqg_'+(grid[0].id)+'_'+(index+1)).prop('disabled',true);//No I18n
					            		if(currentRowData.showAddPartitionOption === 'true' && self.get('graphIdVsPartitionMapping')){
											var graphIdVsPartitionMapping = Object.keys(self.get('graphIdVsPartitionMapping'));
											if(!(partitionDirectSelectionList.contains(currentRowData.GRAPHID) || graphIdVsPartitionMapping.contains(currentRowData.GRAPHID))){
												partitionDirectSelectionList.pushObject(currentRowData.GRAPHID);
											}
										}
					            	}
					                selectionDone++;
					            }
					            return !(selectedMonitorsArray.length === selectionDone);
					        });
					        if(!self.get('startBackgroundActions')){
								//To improve the page loading performance, it's handled here
								setTimeout(function(){
									self.set('startBackgroundActions',true);//No I18n
								},300);
							}
						}
						else if(onSelectFunction !== undefined && onSelectFunction === "DT_performanceMonitorAssociation"){
							var self = window.OPM.currentView.handler.controller;
							var selectedMonitorsArray = OPMClient.SettingsDeviceTemplateController.customScriptGraphIds;
							self.set('prevSelectedMonitors', OPMClient.SettingsDeviceTemplateController.customScriptGraphIds);//No I18n
							var monitorsGridData = grid.jqGrid('getGridParam','data'); //No I18N
					        var selectionDone = 0;
							if(selectedMonitorsArray && selectedMonitorsArray.length > 0){
								$.each(monitorsGridData,function(index,rowObject){
									var currentRowData = grid.jqGrid('getRowData',index+1);  //No I18N
									if(selectedMonitorsArray.contains(currentRowData.GRAPHID)){
										grid.jqGrid('setSelection',index+1,true);//No I18N
										if(self.get('prevSelectedMonitors') !== undefined && self.get('prevSelectedMonitors').contains(currentRowData.GRAPHID)){
											$('#jqg_'+(grid[0].id)+'_'+(index+1)).prop('disabled',true);//No I18n
										}
										selectionDone++;
									}
									return !(selectedMonitorsArray.length === selectionDone);
								});
							}
						}
						else if(onSelectFunction === 'VirtualMonitorsList'){
							$.each(window.OPM.currentView.handler.controller.get('selectedMonitors'),function(index,graphId){
							    grid.jqGrid('setSelection',graphId,false);//No I18N
							});
						}else if(onSelectFunction !== undefined && onSelectFunction === 'devicePartitionList'){//No I18n
							var self = window.OPM.currentView.handler.controller;
							var selectedPartitions = self.get('selectedPartitions');
							var previouslySelectedPartitions = self.get('previouslySelectedPartitions');
					        var currentGridData = grid.jqGrid('getGridParam','data'); //No I18N
					        $.each(currentGridData,function(index,rowObject){
					            var currentRowData = grid.jqGrid('getRowData',index+1);  //No I18N
								if(currentRowData !== undefined && 'object' === typeof(currentRowData)){
					            	var dataLength = (Object.keys(currentRowData)).length-1;
						            if(currentRowData[dataLength-1] === 'true'){
						            	grid.jqGrid('setSelection',index+1,true);//No I18N
						            	if(previouslySelectedPartitions.contains(currentRowData['1'])){
					            			$('#jqg_'+(grid[0].id)+'_'+(index+1)).prop('disabled',true);//No I18n
						            	}
					            	}else if(selectedPartitions.contains(currentRowData['1'])){
						            	grid.jqGrid('setSelection',index+1,true);//No I18N
						            }
						        }
					        });
						}else if(onSelectFunction !== undefined && onSelectFunction === 'credentialAssociation'){//No I18n
							if(window.OPM.userPermissions.discoveryWrite){
								var self = window.OPM.currentView.handler.controller;
								var selectedDevicesArray = self.get('selectedDevices');
						        var crdGridData = grid.jqGrid('getGridParam','data'); //No I18N
						        var selectionDone = 0;
						        $.each(crdGridData,function(index,rowObject){
						            var currentRowData = grid.jqGrid('getRowData',index+1);  //No I18N
						            if(selectedDevicesArray.contains(currentRowData.name)){
						            	grid.jqGrid('setSelection',index+1,true);//No I18N
						                selectionDone++;
						            }
						            return !(selectedDevicesArray.length === selectionDone);
						        });
						    }
						}else if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === "ApplicationServices"){
							if(window.OPM.userPermissions.monitoringWrite){
								var self = window.OPM.currentView.handler.controller;
								var selectedServicesArray = self.get('selectedServices');
						        var crdGridData = grid.jqGrid('getGridParam','data'); //No I18N
						        var selectionDone = 0;
						        $.each(crdGridData,function(index,rowObject){
						            var currentRowData = grid.jqGrid('getRowData',index+1);  //No I18N
						            if(selectedServicesArray.contains(currentRowData.serviceid)){
						            	grid.jqGrid('setSelection',index+1,true);//No I18N
						                selectionDone++;
						            }
						            return !(selectedServicesArray.length === selectionDone);
						        });
						    }	
						}else if(onSelectFunction === "ipam_CFM"){//No I18N
							opUtilsIPToolTip();
						}
						else if (onSelectFunction === "ipam_Ping"){
							if(OPMClient.SettingsOpUtilConfigController.nwmaddcred){
								// opm_transitionToParentRoute("Inventory.List.OpUtils.Sub.AddNWMdevice","Ping");//No I18N
								location.href = window.OPM.apiclientUrl+"Inventory/List/OpUtils/Ping/AddNWMdevice"; //No I18n
								OPMClient.SettingsOpUtilConfigController.set("nwmaddcred",false);//No I18n
						}

						}
//						else if(onSelectFunction === "ncmNonInventoryDevices"){
//                            ncmInventoryInitHeader();
//						}

						if(gridTable == "#monitoringIntervalList" || gridTable == "#additionalFieldsList")//No I18n
						{
							setTimeout(function(self){
								var $this = $(self), ids = $this.jqGrid('getDataIDs'), i, l = ids.length; //No I18n
								for (i = 0; i < l; i++)
								{
									$this.jqGrid('editRow', ids[i], true);//No I18n
									$('#'+ids[i]+'_INTERVAL').blur();//No I18n
								}
								setTimeout(function(gridTable){
									if(window.OPM.currentView.name==="Inventory.Device.AdditionalFields.index"){//No I18n
										$(gridTable).closest("section").scrollTop(0);//No I18n
									}else{
										$(gridTable).closest(".opmFormHolder").scrollTop(0);//No I18n
									}
								},0,gridTable);
							},100,this);
						}
						if(gridTable == "#objDet_List")
						{
							$.each(defaultOptions.Data, function(key,val){
								if(val.subGridData == undefined){
									var trid=parseInt(key)+1;
									$('#objDet_List').find("tr#"+trid).find("td:first").find(".ui-icon").hide();
								}
							});
							$('#fwaobjOverviewTabDetail').find('.ui-jqgrid-hdiv').hide();
						}
						if(gridTable == "#natobjDet_List")
						{
							$.each(defaultOptions.Data, function(key,val){
								if(val.subGridData == undefined){
									var trid=parseInt(key)+1;
									$('#objDet_List').find("tr#"+trid).find("td:first").find(".ui-icon").hide();
								}
							});
							$('#fwaNatRuleOverviewDetails').find('.ui-jqgrid-hdiv').hide();
						}
						if(defaultOptions !== undefined && defaultOptions.subGridFunction == "fwaSubGridStandardObjDetail"){
							$('#fwaobjOverviewTabDetail').find('.ui-jqgrid-hdiv').hide();
						}
						if(onSelectFunction=="ipam_CFM" || onSelectFunction=="ipam_BWM" || onSelectFunction=="ipam_Ping"){
							$("#opm_devListHolder").removeClass('opupromoAdjustClass');
							OPMClient.ApplicationController.set('showGridNoData',false);//No I18N
							$("#gridNoDataPromoMessage").hide();
						}
						if(countOfRows===0||countOfRows===1)
						{
							if($(gridTable).getGridParam("reccount")===0 && (defaultOptions === undefined || defaultOptions.disableNoDataText != true))
							{
								if(defaultOptions != undefined && defaultOptions.noDataText!==undefined){
									if(OPMClient.ApplicationController.currentRouteName.indexOf('Inventory.Device.Monitors') != -1 )
									{
										if(window.OPM.userPermissions.monitoringWrite)
										{
											$(gridTable).show().text(defaultOptions.noDataText); //No I18n
										}
										else
										{
											$(gridTable).show().text(Ember.I18n.t('webclient.jqgrid.no.data.found') + "    "+Ember.I18n.t('webclient.unauthorizedpage.submsg')); //No I18n
										}
									}
									else
									{
										$(gridTable).show().text(defaultOptions.noDataText); 
									}
								}else{
									$(gridTable).show().text(Ember.I18n.t('webclient.jqgrid.no.data.found')); //No I18n
								}

								$(gridTable).addClass("gridnodata");
//								var gview = grid.parents("div.ui-jqgrid-view"); //No I18n
//								gview.children("div.ui-jqgrid-hdiv").hide(); //No I18n

								//  $('div.ui-pager-control').hide();
							}
						}
						/*if(onSelectFunction == "profileCriteria")
				{
					var $this = $(this), ids = $this.jqGrid('getDataIDs'), i, len = ids.length; //No I18n
					for (i = 0; i < len; i++)
					{
	        			var rowData = $this.jqGrid('getRowData',i); //No I18N
	        			if(rowData.isVisible === 'false'){
				         $("#"+i).hide();
				        }
				        if(rowData.monitorName === "urlMonitor" && OPMClient.SettingsNotificationsController.isGlobalAssociation)
				        {
				        	 $("#"+i).hide();
				        }
				        if(rowData.monitorName === "globalUrlMonitor" && !OPMClient.SettingsNotificationsController.isGlobalAssociation)
				        {
				        	 $("#"+i).hide();
				        }
	    			}
				}*/
						if(onSelectFunction === "opm_ipsla_VoIP" || onSelectFunction === "opm_ipsla_WAN" || onSelectFunction === "opm_ipsla_Video"){//No I18N
							ipslaBulkAction(onSelectFunction);
						}
						if(onSelectFunction === "ipslaExisting_Monitors")
						{
							var ids = grid.jqGrid('getDataIDs');//No I18N
							var ipslatempRowId = null;
				            for (var i = 0; i < ids.length; i++) {
				                grid.jqGrid('editRow',ids[i],true);//No I18N
				                ipslatempRowId = ids[i];
				            }
				            setTimeout(function(){
                              if(ipslatempRowId !== null)  
				          	  {
                                  $('#'+ipslatempRowId+'_monitorName').blur();//No I18n
                                }
				        	},300);
						}
						if(searchOption && onSelectFunction != "FWA_Interfaces" && onSelectFunction !== "qryResultList" && onSelectFunction !== "NCMNotificationActions"){
							$(gridTable+"_id").show();
							$(gridTable+"_id").css({'position':'relative','left':'-50px'});
							if($(gridTable).getGridParam("reccount") > 1)
							{
								if($(gridTable+"_id>div .jqSearchIcon").length===0 && toggleSearch){
								$(gridTable+"_id>div ").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ToggleSearch(false,\''+gridTable+'\')" class="icon-search devsearchicon"></i></div>');
								}
								else if($(gridTable+"_id>div .jqSearchIcon").length===0){
									$(gridTable+"_id>div ").append('<div class="jqSearchIcon"><i id="searchIcon" onclick="ToggleSearch(true,\''+gridTable+'\')" class="icon-search devsearchicon"></i></div>');
								}
								$('tr.ui-jqgrid-labels').sortable({ items: "th:not("+gridTable+"_id)" });
							}
						}
                        jqgridHeaderHeight();
						if(OPMClient.ApplicationController.currentPath.indexOf("Inventory.List.IPSLA") == -1)
						{
							$(gridTable).jqGrid('filterToolbar',{ //No I18n
								beforeSearch: function () {
	   								 $(gridTable).jqGrid('setGridParam',{search:false});
							    },
							       stringResult: true,
	    							searchOnEnter: false,
	    											defaultSearch: 'cn',//No I18n

								afterSearch: function(){
									onSearchCall = true;
							        var rowsFiltered = jQuery(gridTable).getRowData();
		         					if(rowsFiltered.length == 0)
		         					{
		         						$(gridTable).prev().text(Ember.I18n.t('webclient.jqgrid.no.data.found')); //No I18n
										$(gridTable).prev().addClass("gridnodata");
		         					}
		         					else
		         					{
		         						$(gridTable).prev().text(''); //No I18n
										$(gridTable).prev().removeClass("gridnodata");
		         					}
                                if(onSelectFunction === "ipslaExisting_Monitors"){
                                    setTimeout(function(){
                                         $(".ipslaSlideContainer .ipslaSlideSection").scrollTop(0);
                                        
                                    },300);
                                }
                                if(onSelectFunction === "opm_rediscoverInterfaces")
		         				{
		         					var dataIds = grid.jqGrid('getDataIDs'); //No I18N
									$.each(dataIds,function(k,rowId){
										var listId = grid.jqGrid('getCell',rowId,'id');//No I18N
										if(reDisIntJson.length > 0 && reDisIntJson.indexOf(listId) > -1){
											grid.jqGrid('setSelection', rowId, true);//No I18N
											grid.jqGrid('setGridParam', { "deselectAfterSort": false}); //No I18N
										}
									});
									onSearchCall = false;
		         				}
	         				
							 }});
						}
						if(onSelectFunction === "L2DevicesList")
						{
							var cbs = $("tr.isLayerDevExist > td > input.cbox", $(gridTable)[0]); //No I18n
         					cbs.attr({"disabled":"disabled","title":Ember.I18n.t("webclient.map.layer2map.device.discovered",this)}); //No I18n
         					cbs.prop("checked", true);//No I18n
         				}
         				if(onSelectFunction === "merakiReportList"){
					        $('td[rowspan="1"]', grid).each(function () {
					            var spans = $('td[rowspanid="' + this.id + '"]', grid).length + 1;
					            if (spans > 1) {
					                $(this).attr('rowspan', spans);
					            }
					        });

         				}
         				if(onSelectFunction === "sdwanEvents"){//No I18N
							var sdwanGrid = $("#VMWareEventsList");//No I18N
							var dataIds = sdwanGrid.jqGrid('getDataIDs'); //No I18N
						    $.each(dataIds,function(k,id){
						    	var isEventAssociated = sdwanGrid.jqGrid('getCell', id, 'ISEVENTASSOCIATED'); //No I18N
					    		if(isEventAssociated === "true"){
						            sdwanGrid.jqGrid("setSelection",id,true);//No I18N
						        }
						    });
							
						}
						if(onSelectFunction === "opmEntitySelectionSelectedEntityList"){
							Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
         						$(".gridnodata").hide();
         					});
         				}

         				if(retainSelection){
         					if(window.OPM.isOPM && (onSelectFunction !== undefined && onSelectFunction === "interfaceDiscoveredData")){
	         					gridTable = gridTable.split('.')[0];
	         				}
         					if(reloadGridTrigger){
         						reloadGridTrigger = false;
								setTimeout(function(){
	         						$(gridTable).trigger('reloadGrid');//No I18N
	         					},100);
         					}
         					if(onSelectFunction === "rcaEntityList" && !loadRCAEntitySelections){//No I18N
         						loadRCAEntitySelections = true;
         						var selectedEntities = OPMClient.RCAController.selectedEntities;
         						var availableEntities = $('#entityList').jqGrid("getGridParam","data");//No I18N
         						for(var j=0;j<selectedEntities.length;j++)
         						{
         							if(selectedEntities[j].entityType===OPMClient.RCAController.selectedEntityType){
         								var entityName = selectedEntities[j].name;
         								for(var k=0;k<availableEntities.length;k++)
         								{
         									if(OPMClient.RCAController.selectedEntityType==="Devices" && entityName===availableEntities[k].deviceName){//No I18N
         										gridSelectedRows["#entityList"][availableEntities[k]["_id_"]] = $.extend(true,{},availableEntities[k]);//No I18N
         									}else if(entityName===availableEntities[k].name){
         										gridSelectedRows["#entityList"][availableEntities[k]["_id_"]] = $.extend(true,{},availableEntities[k]);//No I18N
         									}
         								}
         							}
         						}
         					}
         					if(onSelectFunction === 'opmEntitySelectionEntityList'){
     							var selectionDone = 0;
								var selectedEntitiesList= OPMClient.entitySelectionController.get('selectedEntities');
								$.each(selectedEntitiesList,function(availIndex,availObject){
						            	gridSelectedRows["#entityList"][availObject.id] = availObject;
						                selectionDone++;
						            return !(selectedEntitiesList.length === selectionDone);
     							});
     							$('#grid_nodata').hide();
         					}
							if(onSelectFunction==="ListMibsList" && !loadTrapMibSelections) {
								loadTrapMibSelections = true;
								$.each(jsonData, function(key,obj){
									if(obj.isSelected === true) {
										gridSelectedRows["#ListMibsList"][key+1]=obj; //No I18N
									}
								});
							}

         					var tempArr = Object.keys(gridSelectedRows[gridTable]);
			                for(var i=0;i<tempArr.length;i++){
			                    $(gridTable).jqGrid('setSelection',tempArr[i],true);//No I18N
			                }
         				}
						 if(onSelectFunction === "domainList") {
							for(var i=1; i<=jsonData.length; i++){
								if($("#domainList").jqGrid("getRowData", i).LOGINTYPE != 2){ //NO I18N
									$("#domainList tr#"+i+" td:first-child").removeClass("ui-sgcollapsed sgcollapsed").empty(); //NO I18N
								}
							}
						}
						if(onSelectFunction === "fileIntegritySettingsList"){
         					$('#FileIntegritySettingsList .select2').select2();
		 				}
		 				if(onSelectFunction === "fileIntegrityReportsList"){
		 					$('#FileIntegrityReportsList .select2').select2();
		 				}
                        if(onSelectFunction === "defaultAlarmRule"){
                            $('#defaultAlarmRuleTable .select2').select2();
                        }
		 				//Handled a minor glitch in the Eventlogs/Process grid headers. (used id as colModel, generally it's used for enabling search)
		 				if(onSelectFunction === 'snapshot_eventlogMonitors' || onSelectFunction === 'snapshot_processMonitors'){
		 					$('#opm_'+onSelectFunction.split('_')[1]+'List_id').addClass('vmdisplayNone');//No I18N
		 				}

		 				if(onSelectFunction==="APM_v3MonitorsList"){
		 					var $this = $(this),ids = $this.jqGrid('getDataIDs'),i,l = ids.length; //No I18n
							for (i=0;i<l;i++)
							{
								var subGridStatus = $this.jqGrid('getRowData', ids[i])['subGridStatus'];//No I18n
								if(subGridStatus!=="false")
								{
									$(this).find("#"+ids[i]).addClass("showSubGridExpandIcon");
								}
							}
		 				}
						if(onSelectFunction === "licenseMgmtFunction" && defaultOptions.gridAlias === "elementsPurchased") {
							for(var i=1; i<=jsonData.length; i++){
								if(!(grid.jqGrid("getRowData", i).showProbeUsage == "true")){ //NO I18N
									$("#licenseMgmtTable tr#"+i+" td:first-child").removeClass("ui-sgcollapsed sgcollapsed").empty(); //NO I18N
								}
							}
						}
						if(onSelectFunction === "opm_AlarmEvents")
						{
							Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
								setTimeout(function(){
									$("#opm_AlarmEvents").setGridWidth($("#TabHolder").width()); //NO I18N
								},500);
							});
                         }
                         if(onSelectFunction === "forecastRules")//NO I18N
						{
							if(!defaultOptions.firstCall){
								defaultOptions.firstCall = true
								Ember.run.scheduleOnce('afterRender', this, function() {//No I18N
									$("#rulesList").jqGrid('sortGrid','ruleName', true, 'asc');//No I18N
					 			});
							}
                         }
						if(onSelectFunction === "kempVSChildListSelFn") {
							for(var i=1; i<=jsonData.length; i++){
								if(grid.jqGrid("getRowData", i).subVsCount==0){ //NO I18N
									$(gridTable+" tr#"+i+" td:first-child").removeClass("ui-sgcollapsed sgcollapsed").empty(); //NO I18N
								}
							}
						}
						if(onSelectFunction === "apEntityListGroup") {
							var selectedEntities = OPMClient.APController.selectedEntities;
							var availableEntities = $('#entityList').jqGrid("getGridParam", "data");//No I18N
							var selectedModule = $("#moduleSelect").val();//No I18N
							for (var j = 0; j < selectedEntities.length; j++) {
								var entityName = selectedEntities[j].moid;
								for (var k = 0; k < availableEntities.length; k++) {
									var chkEntityName = "";
									if(selectedModule === "ipsla"){//No I18N
										chkEntityName = availableEntities[k].moid;
									} else {
										chkEntityName = availableEntities[k].groupID;
									}
									// Both sides must carry a value - an undefined-to-undefined match would check every row in the grid.
									if (entityName !== undefined && entityName !== null && chkEntityName !== undefined && chkEntityName !== null && entityName == chkEntityName) {
									        var rowId = availableEntities[k]._id_;
                                            var selectedRows = $('#entityList').jqGrid('getGridParam', 'selarrrow');
                                            if (rowId !== undefined && selectedRows.indexOf(rowId.toString()) === -1) {
                                                // setSelection toggles by default - force-select via "_sp_" so this stays idempotent across page-turns.
                                                $('#entityList').jqGrid('setSelection', rowId, true, "_sp_");//No I18N
                                            }
									}
								}
							}
						}
            //Clear search text is not working in sub grid, hence adding event manually
						$(".clearsearchclass").off("click").on("click", function(){
							$(this).closest("tr").find("input").val("").keydown();
						});
						if(onSelectFunction==="reportsReportList" && (defaultOptions.reportName==="lbAvailReport" || defaultOptions.reportName==="lbConsolidateReport"))//No I18N
		 				{
		 					prevlbCellVal = {};
		 					if(defaultOptions.reportName==="lbConsolidateReport")//No I18N
		 					{
		 						if(defaultOptions.reportResponseType==="lbRSConsolidate")//No I18N
		 						{
		 							$("#reportsReportList").jqGrid('setGroupHeaders',{useColSpanStyle:false,groupHeaders:[//No I18N
										{startColumnName:'rsTotalConnection',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('webclient.enduser.Connections',this)+"</div>"},//No I18N
										{startColumnName:'rsInBytes',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('webclient.opm.kemplb.graphdata.traffic',this)+"</div>"},//No I18N
										{startColumnName:'rsInPackets',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('opu.views.PACKETS',this)+"</div>"}//No I18N
									]});//No I18N
		 						}
		 						else if(defaultOptions.reportResponseType==="lbVSConsolidate" || defaultOptions.reportResponseType==="f5lbVSConsolidate"){//No I18N
		 							$("#reportsReportList").jqGrid('setGroupHeaders',{useColSpanStyle:false,groupHeaders:[//No I18N
										{startColumnName:'vsTotalConnection',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('webclient.enduser.Connections',this)+"</div>"},//No I18N
										{startColumnName:'vsInBytes',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('webclient.opm.kemplb.graphdata.traffic',this)+"</div>"},//No I18N
										{startColumnName:'vsInPackets',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('opu.views.PACKETS',this)+"</div>"}//No I18N
									]});//No I18N
		 						}
		 						else if(defaultOptions.reportResponseType==="f5lbPMConsolidate"){//No I18N
		 							$("#reportsReportList").jqGrid('setGroupHeaders',{useColSpanStyle:false,groupHeaders:[//No I18N
										{startColumnName:'pmTotalConnection',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('webclient.enduser.Connections',this)+"</div>"},//No I18N
										{startColumnName:'pmInBytes',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('webclient.opm.kemplb.graphdata.traffic',this)+"</div>"},//No I18N
										{startColumnName:'pmInPackets',numberOfColumns:2,titleText:"<div align='center'>"+Ember.I18n.t('opu.views.PACKETS',this)+"</div>"}//No I18N
									]});//No I18N
		 						}
		 					}
		 				}
						 if(onSelectFunction==="SDWANSitesListSelFn" || onSelectFunction==="SDWANTunnelsListSelFn")//No I18N
		 				{
							$(".ui-jqgrid-hdiv input:checkbox").hide();
						}
		 				
		 				//To disable Jqgrid colum drag and Drop functionality the below line added. 
						$(gridDivId + " tr.ui-jqgrid-labels").sortable({cancel: ".disable-sort"});
						$(gridDivId + " tr.ui-jqgrid-labels").sortable( "disable"); // No I18N
						
						if(defaultOptions!==undefined && defaultOptions.skipNullData)
						{
							var gridParams = $(gridTable).jqGrid("getGridParam");//No I18N
							gridParams.postData.filters = JSON.stringify({
							    groupOp: "AND",//No I18N
							    groups: [],
							    rules: [{field: defaultOptions.nullColumnIndex, op: "ne", data: null}]//No I18N
							});
							gridParams.search = true;
							$(gridTable).trigger("reloadGrid");//No I18N
						}
						if(onSelectFunction === 'perfTopNWidget'){
		 					Ember.run.scheduleOnce('afterRender',function(){//No I18N
								opm_customTooltip();
							});
		 				}
						if(defaultOptions.expandFormatter) {
							$(gridTable + " .show-more").off().on('click', function() {
								var fullId = $(this).closest('.expand-short').data('full-id');
								$('#' + fullId).show();
								$(this).closest('.expand-short').hide();
							});
							
							$(gridTable + " .show-less").off().on('click' , function() {
								var shortId = $(this).closest('.expand-full').data('short-id');
								$('#' + shortId).show();
								$(this).closest('.expand-full').hide();
							});

							$(gridTable + " .expand-short").each(function() {
								var $this = $(this);
								var $text = $this.find('.gridTruncatedText');
								if ($text[0].scrollHeight <= $text[0].clientHeight) {
									$this.find('.show-more').hide();
								}
							});
						}
					}
				});
		if(grid!==undefined && grid[0]!==undefined && (gridNavigator!==null || gridNavigator!==undefined || gridNavigator!=="")) //NO I18N
		{
			grid.jqGrid('navGrid',gridNavigator, //NO I18N
			{
				add:addIcon,edit:false,del:delIcon,refresh:false,cloneToTop:true,search:Search,
				addfunc: function(rowid)
				{
					if(onSelectFunction == "monitorsInAccordion")
					{
						var disp = document.getElementById('addMonitorDiv').style.display;
						if(disp == 'none' && (selectedMonitorTab == "ntServiceMonitors") )//No I18N
						{getNTServiceMonitorsList(grid);}
						else if(disp == 'none' && (selectedMonitorTab == "serverMonitors") )//No I18N
						{getServerMonitorsList(grid);}
					}
				},
				delfunc: function(rowid)
				{
					
					var rows = (String(rowid)).split(',');
					var dataStr = new Array();
					var name = "";
					var extraParams="";
					if (rows.length > 0 && apiUrl != "")
					{
						var jqgridDeleteCallback = function(){
							for(var r=0;r<rows.length;r++)
							{
								var ret = grid.jqGrid('getRowData', rows[r]);
								if(ret[deleteName] != undefined)
								{
									if(onSelectFunction==="snapshot_exchangeMonitors"){
										extraParams=extraParams+'&'+ret[deleteName]+'='+ret.graphType;
									}
									if(onSelectFunction==="snapshot_performanceMonitors"){//No I18N
										if(OPMClient.InventoryDeviceDetailsController.isKempLoadBalancer)
										{
										if(defaultKempGraphs.indexOf(ret.policyName)===-1){
									dataStr.push(ret[deleteName]);
								}
										}
										else if(OPMClient.InventoryDeviceDetailsController.isInDepthLoadBalancer)
										{
											if(defaultF5Graphs.indexOf(ret.policyName)===-1){
												dataStr.push(ret[deleteName]);
											}
										}
										else{
											dataStr.push(ret[deleteName]);
										}
									}else{
										dataStr.push(ret[deleteName]);
									}									
								}
							}
							if(dataStr.length > 0)
							{
								name = dataStr.toString();
								
								var postDta = {};
								postDta[urlParameter] = name;
								
								if(deviceName == "" && deviceNameParameter == "")
								{
									var url = apiUrl;
								}
								else if(onSelectFunction==="snapshot_exchangeMonitors" || onSelectFunction === "snapshot_performanceMonitors" || onSelectFunction === "snapshot_mssqlMonitors"){
									var url = apiUrl;
									postDta[deviceNameParameter] = deviceName;
								}
								else
								{
									var url = apiUrl+deviceNameParameter+"="+deviceName;//No I18N
								}
								$.ajax(
								{
									url: url,
									type: 'POST', //No I18N
									data:postDta,
									async:false,
									success: function(response)
									{
										//opm_showResponseMessage(response);
										if(onSelectFunction === "snapshot_scriptMonitors"){//No I18N
											if(response.message !== undefined){
												opm_infoMsgs("successMsg",response.message);//No I18N
											}else if(response.error !== undefined){
												opm_infoMsgs("errorMsg",response.error);//No I18N
											}
										}
										if(onSelectFunction === "vcenterVMEvents")
										{
											if(response.message!= undefined)
											{
												opm_infoMsgs("successMsg",response.message); //No I18n
												OPMClient.Inventory.loadVmWareEvents();
											}
											else if(response.error != undefined)
											{
												opm_infoMsgs("errorMsg",response.error.message); //No I18n
											}	
										}else{
											showMessage(response);
										}
										if(onSelectFunction === "vmwareEvents"){
											opm_SettingsGlobalMonitorsGridLoad("vmwareEvents"); //No I18n
										}
										if(onSelectFunction === "snapshot_mssqlServices" ||onSelectFunction === "snapshot_ntServiceMonitors" ||onSelectFunction === "snapshot_urlMonitors" ||onSelectFunction === "snapshot_folderMonitors" || onSelectFunction === "snapshot_fileMonitors" || onSelectFunction === "snapshot_serverMonitors" || onSelectFunction === "snapshot_processMonitors" || onSelectFunction === "snapshot_mssqlMonitors" || onSelectFunction === "snapshot_adServices" || onSelectFunction === "snapshot_adMonitors" 
										|| onSelectFunction === "snapshot_exchangeServices" || onSelectFunction === "snapshot_exchangeMonitors" || onSelectFunction === "snapshot_scriptMonitors" || onSelectFunction === "snapshot_performanceMonitors" || onSelectFunction === "snapshot_eventlogMonitors"){//No I18N
											OPMClient.Inventory.getDeviceMonitorsDetails(OPMClient.InventoryDeviceDetailsController.deviceName);
											OPMClient.Inventory.getSelectedMonitors(OPMClient.InventoryDeviceDetailsController.monitorsName);
											return;
										}
										if(onSelectFunction === "opm_interfacesList"){//No I18N
											$(".dashboardWidgetIcons").find('i[data-name="opm.device.interfaces"]').trigger("click");
											return;
										}
										if(deviceBasicDetails.deviceName!==undefined){
											OPMClient.Inventory.getDeviceMonitorsDetails(deviceBasicDetails.deviceName);
										}
									}
								});
							}
						}
						if(['snapshot_performanceMonitors','snapshot_adMonitors','snapshot_exchangeMonitors','snapshot_mssqlMonitors','snapshot_scriptMonitors'].indexOf(onSelectFunction) > -1){
							if(onSelectFunction==="snapshot_performanceMonitors" && OPMClient.InventoryDeviceDetailsController.isKempLoadBalancer)//No I18N
							{
								var isDefaultKempMonitorSelected = 0;
								var useDefaultConfirmPopup = true;
								for(var rec=0;rec<rows.length;rec++)
								{
									var rowRec = grid.jqGrid('getRowData', rows[rec]);//No I18N
									if(defaultKempGraphs.indexOf(rowRec.policyName)!=-1){
					                    isDefaultKempMonitorSelected++;
					                }
								}
								var confirmPopupkempMsg = Ember.I18n.t('webclient.snp.monitors.wishtodelete',this);//No I18N
								if(isDefaultKempMonitorSelected>0)
								{	
									if(rows.length>isDefaultKempMonitorSelected)
									{
										confirmPopupkempMsg = Ember.I18n.t("webclient.opm.kemp.permonitors.delactionmsg",this);//No I18N
									}else{
										confirmPopupkempMsg = Ember.I18n.t("webclient.opm.kemp.default.permonitors.delactionmsg",this);//No I18N
										useDefaultConfirmPopup = false;
									}
								}
								if(useDefaultConfirmPopup)
								{
									opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),confirmPopupkempMsg,'',jqgridDeleteCallback,Ember.I18n.t('webclient.action.ok'),'',Ember.I18n.t('webclient.action.cancel'),'','dialogStyle2','','','');//No I18N
									showAlertInfo(true,false);
								}
								else{
									opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),confirmPopupkempMsg,undefined,undefined,Ember.I18n.t("js.commonstr.close",this),undefined,undefined,undefined,'dialogStyle2',false,true);//No I18N
									showAlertInfo(true,false);
								}
							}else if(onSelectFunction==="snapshot_performanceMonitors" && OPMClient.InventoryDeviceDetailsController.isInDepthLoadBalancer)//No I18N
							{
								var isDefaultF5MonitorSelected = 0;
								var useDefaultConfirmPopup = true;
								for(var rec=0;rec<rows.length;rec++)
								{
									var rowRec = grid.jqGrid('getRowData', rows[rec]);//No I18N
									if(defaultF5Graphs.indexOf(rowRec.policyName)!=-1){
					                    isDefaultF5MonitorSelected++;
					                }
								}
								var confirmPopupkempMsg = Ember.I18n.t('webclient.snp.monitors.wishtodelete',this);//No I18N
								if(isDefaultF5MonitorSelected>0)
								{	
									if(rows.length>isDefaultF5MonitorSelected)
									{
										confirmPopupkempMsg = Ember.I18n.t("webclient.opm.f5.permonitors.delactionmsg",this);//No I18N
									}else{
										confirmPopupkempMsg = Ember.I18n.t("webclient.opm.f5.default.permonitors.delactionmsg",this);//No I18N
										useDefaultConfirmPopup = false;
									}
								}
								if(useDefaultConfirmPopup)
								{
									opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),confirmPopupkempMsg,'',jqgridDeleteCallback,Ember.I18n.t('webclient.action.ok'),'',Ember.I18n.t('webclient.action.cancel'),'','dialogStyle2','','','');//No I18N
									showAlertInfo(true,false);
								}
								else{
									opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),confirmPopupkempMsg,undefined,undefined,Ember.I18n.t("js.commonstr.close",this),undefined,undefined,undefined,'dialogStyle2',false,true);//No I18N
									showAlertInfo(true,false);
								}
							}else{
								var isBGPMonSelected = 0;
								var useDefaultConfirmPopup = true;
								for(var rec=0;rec<rows.length;rec++)
								{
									var rowRec = grid.jqGrid('getRowData', rows[rec]);//No I18N
									if(rowRec.isBGPMonitor!==undefined && rowRec.isBGPMonitor==="true") {
										isBGPMonSelected++;
									}
								}
								if(isBGPMonSelected>0) {
									if(rows.length>isBGPMonSelected)
									{
										confirmPopupkempMsg = Ember.I18n.t("webclient.opm.bgp.permonitors.delactionmsg",this);//No I18N
									}else{
										confirmPopupkempMsg = Ember.I18n.t("webclient.opm.bgp.default.permonitors.delactionmsg",this);//No I18N
										useDefaultConfirmPopup = false;
									}
									if(useDefaultConfirmPopup)
									{
										opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),confirmPopupkempMsg,'',jqgridDeleteCallback,Ember.I18n.t('webclient.action.ok'),'',Ember.I18n.t('webclient.action.cancel'),'','dialogStyle2','','','');//No I18N
										showAlertInfo(true,false);
									}
									else{
										opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),confirmPopupkempMsg,undefined,undefined,Ember.I18n.t("js.commonstr.close",this),undefined,undefined,undefined,'dialogStyle2',false,true);//No I18N
										showAlertInfo(true,false);
									}
								} else {
									opmConfirm(Ember.I18n.t('webclient.admin.syslogrules.alert'),delMsg,'',jqgridDeleteCallback,Ember.I18n.t('webclient.action.ok'),'',Ember.I18n.t('webclient.action.cancel'),'','dialogStyle2','','','');//No I18N
									showAlertInfo(true,false);
								}
							}
						}else{
							if(confirm(delMsg)){
								jqgridDeleteCallback();
							}
						}
					}
				}
			},
			{ /* edit options */ },
			{ /* add options */ },
			{ /* delete options */ },
			{
				//search options
				sopt: ['eq','ne','bw','ew','cn'] //NO I18N
			});
		}
		
		if(searchOption && toggleSearch)
		{
			if($(gridTable)[0] != undefined){
				$(gridTable).jqGrid('filterToolbar',{ stringResult: true, searchOnEnter: false, defaultSearch: 'cn'});//No I18N
				var trow = $("tr.ui-search-toolbar",$(gridTable)[0].grid.hDiv);
				trow.show();
			}
//			$(".ui-search-toolbar").show();
		}
		else if (searchOption && !toggleSearch)
		{
			if($(gridTable)[0] != undefined){
				$(gridTable).jqGrid('filterToolbar',{ stringResult: true, searchOnEnter: false, defaultSearch: 'cn',afterSearch:function(){
					if(onSelectFunction !== undefined && onSelectFunction.split("_")[0] === 'MonitorProfile'){
						doJqGridSelection(grid,onSelectFunction);
					}
				}});
				var trow = $("tr.ui-search-toolbar",$(gridTable)[0].grid.hDiv);
				trow.hide();
			}
//			$(".ui-search-toolbar").hide();
		}
		else{
			if($(gridTable)[0] != undefined){
				var trow = $("tr.ui-search-toolbar",$(gridTable)[0].grid.hDiv);
				trow.hide();
			}
//			$(".ui-search-toolbar").hide();
		}
		if(defaultOptions.logicalSearchOptions) {
			addCustomLogicalFilters(gridTable);
		}
		if(grid!==undefined && grid[0]!==undefined)
		{
		if(columnChooser)
		{
			grid.jqGrid('navButtonAdd', gridNavigator, {   // No I18N
				caption: "",
				buttonicon: (showPagerColumnChooser)?"ui-icon-calculator":"",   // No I18N
				title: Ember.I18n.t('webclient.grid.selectcolumn',this),   // No I18N
				jqModal : true,
				onClickButton: function ()
				{
					var a = grid.width();
					grid.jqGrid('columnChooser',{    // No I18N
						done:function (perm)
						{
							if (perm)
							{
								grid.setGridWidth(a);
							}
						}
					});
				}
			});
		}
		var oputilsExport = false;
		if(!hideCSV && window.OPM.isOPUtils && (onSelectFunction==="ipam_CFM" || onSelectFunction==="ipam_Ping" || onSelectFunction==="ipam_BWM" || onSelectFunction==="ipam_WOLDevice" || onSelectFunction==="ipam_WOLGroup" || onSelectFunction==="ipam_NWMAlerts")){
			oputilsExport = true;
		}
		if(!hideCSV && !oputilsExport) {
			grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
				caption:"", //NO I18N
				buttonicon:"ui-icon ui-icon-newwin", //NO I18N
				title:Ember.I18n.t("webclient.grid.exportcsv"), //NO I18N
				jqModal:true,
				onClickButton:function() {
					opm_generateCSV(grid,captionTitle);
				}
			});
		}
		if(oputilsExport) {
			grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
				caption:"", //NO I18N
				buttonicon:"ui-icon-newwin", //NO I18N
				title:Ember.I18n.t("webclient.grid.exportcsv"), //NO I18N
				jqModal:true,
				onClickButton:function() {
					opUtils_generateCSV(grid,captionTitle);
				}
			});
		}
		if(!hideExcel && !oputilsExport) {
			grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
				caption:"", //NO I18N
				buttonicon:"ui-icon ui-icon-document", //NO I18N
				title:Ember.I18n.t("webclient.grid.exportxls"), //NO I18N
				jqModal:true,
				onClickButton:function() {
					opm_generateXLSFromServer(grid,captionTitle);
				}
			});
		}
		if(showPdf) {
			grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
				caption:"", //NO I18N
				buttonicon:"ui-icon ui-icon-pdf", //NO I18N
				title:Ember.I18n.t("webclient.grid.exportpdf"), //NO I18N
				jqModal:true,
				onClickButton:function() {
					if (defaultOptions.exportPdfCallback !== undefined) {
						defaultOptions.exportPdfCallback();
					}
				}
			});
		}
		if(oputilsExport) {
			grid.jqGrid("navButtonAdd",gridNavigator,{ //NO I18N
				caption:"", //NO I18N
				buttonicon:"ui-icon-document", //NO I18N
				title:Ember.I18n.t("webclient.grid.exportxls"), //NO I18N
				jqModal:true,
				onClickButton:function() {
					opUtils_generateXLSFromServer(grid,captionTitle);
				}
			});
		}
		if(defaultOptions != null && defaultOptions.enableColChooser == true && defaultOptions.gridTableId != null) {
			if(defaultOptions.enableTopColChooser) {
				//if condition for avoid duplication icon(column chooser)
				if(!$(gridTable+"_colChooserIndex #colChooserIcon").hasClass("icon-table")){
					$(gridTable+"_colChooserIndex").show();
					$(gridTable+"_colChooserIndex").css({'width':'40px','position':'absolute','right':'0','top':'0','left':'auto','height':'36px'});
					$(gridTable+"_colChooserIndex>div ").append('<div><i id="colChooserIcon" onclick="openJQGridColChooser(\''+gridTable.replace("#","")+'\')" class="icon-table"></i></div>');
				}
			}
			grid.jqGrid('navButtonAdd', gridNavigator, {   // No I18N
				caption: "",
				buttonicon: "ui-icon-calculator "+gridTable.replace("#","")+"_opmGridColChooser",   // No I18N
				title: Ember.I18n.t('webclient.grid.selectcolumn',this),   // No I18N
				jqModal : true,
				onClickButton: function ()
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
		                        	var url = window.OPM.apiUrlPattern + '/ncmclient/updateGridColumnChooser?GRID_ID='+defaultOptions.gridTableId + '&VISIBLE_COLUMNS='+JSON.stringify(colArray);//No I18N
			        		 		$.ajax(
									{
										url: url,
										type: 'POST', //No I18N
										async:false,
										success: function(response)
										{
											if(onSelectFunction === "ipam_switchportList"){
												colChooserWidthScrollerForSPM(defaultOptions.snapId);
											}
											ncmInvJQGridHt();
										}
									});
		                        }
		                    } 
		                }
					});
					$('#colchooser_'+ gridTable.substring(1)+' > div').css('padding' , '0');
					$('#colchooser_'+ gridTable.substring(1) + ' option').mousedown(function(e) { // No I18N
						e.preventDefault();
						$(this).prop('selected', !$(this).prop('selected'));
						return false;
					});
				}
			});
			}
		}
	}
}

function reloadGridsterUl(snapId, reload) {
	if(!window.OPM.isPDF){
		if(reload) {
			reloadGridsterUl_1(reload, snapId);
		} else {
			reloadNeededWidgets.push(snapId);
		}
	}
}

function addSnapshotChart(shortSummary, chartObj, placeHolder,consolidatedValues) {

//	if(snapshotChartObj == undefined || shortSummary) 
//	{
	setTimeout(function(){
		var chartobj = {
			    "placeholder":[],//No I18N
			    "chartobj":[]//No I18N
			}
			chartobj.chartobj.push(chartObj);
			chartobj.placeholder.push(placeHolder); 
			if(consolidatedValues !== undefined)
			{
				chartobj.consolidatedValues = consolidatedValues; 
			}
			zChart(chartobj); 
	},0);
//	}
//	else
//	{
//		snapshotChartObj.chartobj.push(chartObj);
//		snapshotChartObj.placeholder.push(placeHolder); 
//		if(consolidatedValues !== undefined)
//		{
//			snapshotChartObj.consolidatedValues = consolidatedValues; 
//		}
//	}
}
function nfaCBQosTriGraph(graphDiv,graphData,graphTitle,yAxis,reload,shortSummary,timeZone) {
	var chartObj = {
		id:graphDiv, 
		type:'area', //No I18N
		jsonData:graphData,
		series:"multi", //No I18N
		height:350,
		columns:{datatype_1:'time',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Traffic", timeFormat:OPMClient.InventoryDateTimeLegends.get(OPMClient.FWAGlobalDataController.timePeriod)}, //No I18N
		canvas : {
			title: {
				text: graphTitle,
				show: true,
				hAlign: "center", //No I18N
				vAlign: "top" //No I18N
			}
		},
		legend : {
			colorBox: {
				shape: "circle", //No I18N
				strokeOpacity: 1
			},
			fontFamily: "'LatoRegular'", //No I18N
			fontSize: 16,
			hAlign: "right", //No I18N
			vAlign: "top" //No I18N
		},
		axes: {
			rotated: false,
			xaxis: {
				label: { 
					text: Ember.I18n.t('NFAWidget.Time') //No I18N
				}
			},
			yaxis: [{
				label: {
					text: nfa_getYAxisString(yAxis)
				}
			}]
		},
		chart:{
			stacked:false
		},
		area:{
			marker:true
		},
		timeZone : timeZone,
		isNFATimeSeriesGraph : true
	}

	if(reload) {
		var arraObj={
		    "placeholder":[],//No I18N
		    "chartobj":[]//No I18N
		}
		var mappingobj={};
		arraObj.chartobj.push(chartObj);
		arraObj.placeholder.push(graphDiv); 
		zChart(arraObj); 
	} else {
		addSnapshotChart(shortSummary,chartObj,graphDiv); 
	}
}

function jqgridHeaderHeight() 
{ 
	$('#opmCusGridHdrHtTempStyle').remove(); 
	opmCusGridHdrHt=$('.opmCusGrid .ui-jqgrid-hbox').outerHeight(); 
	if(opmCusGridHdrHt > '40' && $('.ui-search-toolbar').length == 0){ 
	opmCusGridHdrHtSrch=opmCusGridHdrHt+55; 
	$('.opmCusGrid .ui-jqgrid-bdiv').css({'top':+opmCusGridHdrHt+'px'});//No I18N 
		$('body').append('<style id="opmCusGridHdrHtTempStyle">#AlrmEvtTrapInvDev.Grid .opmCusGrid .ui-jqgrid-view.gridSearchActive .ui-jqgrid-bdiv,#AlrmEvtTrapInvDev.Colored .opmCusGrid .ui-jqgrid-view.gridSearchActive .ui-jqgrid-bdiv{top:'+opmCusGridHdrHtSrch+'px !important}</style>');//No I18N 
	} 
}

function goToVLANListPage() {
	location.href = window.OPM.apiclientUrl+"Inventory/List/Monitoring/VLAN"; //NO I18N
}

function nfa_getYAxisString(yAxisUnit) {
	return Ember.I18n.t("NFAWidget.trfc")+" ( "+yAxisUnit+" )"; //NO I18N
}

function nfa_getYAxisUnit(yAxisText) {
	var arr = yAxisText.split(" "); //NO I18N
	return (arr.length>1)?(arr[arr.length-2]):arr[0];
}

function nfa_getTrafficThreshold(jsonData) {
    return (jsonData.thresholdLine !== undefined)?jsonData.thresholdLine:[];
 }
function nfa_addThresholdLineInfo(chartobj,yAxisThresholdArray,yAxisThresholdText,isAnomaly) {
    chartobj.axes.yaxis[0].threshold = {
        "line": { //No I18N
            "show": true, //No I18N
            "values": yAxisThresholdArray, //No I18N
            "strokeWidth": 1, //No I18N
            "color": ["red","#a347a2"], //No I18N
            "label": { //No I18N
                "text":yAxisThresholdText,//No I18N
                "hAlign": ["left","right"], //No I18N
                "fontColor": "#000000", //No I18N
                "fontSize":12, //No I18N
                "font-family": "LatoRegular" //No I18N
            }
        }
    }
    if(isAnomaly) {
		var yAxis = chartobj.axes.yaxis[0].label.text;
		chartobj.axes.yaxis[0].threshold.line.color = ["#84C0FE", "#84C0FE"]; //NO I18N
		chartobj.axes.yaxis[0].threshold.line.label.text = [
			Ember.I18n.t("Threshold.Lower_Limit")+": "+yAxisThresholdArray[0]+" "+nfa_getYAxisUnit(yAxis), //NO I18N
			Ember.I18n.t("Threshold.Upper_Limit")+": "+yAxisThresholdArray[1]+" "+nfa_getYAxisUnit(yAxis) //NO I18N
		];
		chartobj.axes.yaxis[0].threshold.line.label.hAlign = ["right","left"]; //NO I18N
	}
	return chartobj;
}

function wlc_stringSort(cell) {
	return cell.toUpperCase();
}

function nfa_getDeviceSummaryArray(devInfo) {
	var column1 = [
		["opu.views.IP_ADDRESS",devInfo["ip-address"]], //NO I18N
		["opu.views.MAC_ADDRESS",devInfo["mac-address"]], //NO I18N
		["opu.views.SYS_DESCR",devInfo["system-description"]], //NO I18N
		["opu.views.SUBNET_ADDRESS",devInfo["subnet-address"]], //NO I18N
		["jsp.commonstr.Vendor",devInfo["switch-type"]], //NO I18N
		["jsp.admin.sharedprofile.SharedProfileAdd.SnmpVer","v"+devInfo["snmp-version"]], //NO I18N
		["nfa.snmpCredential.name", devInfo.credentialname] //NO I18N
	];
	var column2 = [
		["opu.views.DNS_NAME",devInfo["ip-to-dns"]], //NO I18N
		["opu.views.SYS_NAME",devInfo["system-name"]], //NO I18N
		["jsp.commonstr.SystemLocation",devInfo["system-location"]], //NO I18N
		["webclient.hyperv.lastsystemuptime",devInfo["sysuptime-original"]], //NO I18N
		["opu.views.LAST_SCAN_TIME",devInfo["last-scan-time"]], //NO I18N
		["opu.views.SCAN_STATUS",devInfo["scan-status"]], //NO I18N
		["nfa.device.addedTime", devInfo.devAddedTime] //NO I18N
	];
	var summaryArr = [];
	for(var i=0;i<column1.length;i++) {
		summaryArr.push({
			title1:Ember.I18n.t(column1[i][0]),value1:column1[i][1],
			title2:Ember.I18n.t(column2[i][0]),value2:column2[i][1]
		})
	}
	return summaryArr;
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

function addCustomLogicalFilters(gridID) {
    var colModel = $(gridID).jqGrid("getGridParam", "colModel");
    var originalData = $(gridID).jqGrid('getGridParam', 'data');
    var logicalLabels = {
        "eq": "= " + Ember.I18n.t("webclient.equals"), //No I18n
        "ne": "!= " + Ember.I18n.t("webclient.not.equals"), //No I18n
        "lt": "< " + Ember.I18n.t("webclient.option.lesserthan"), //No I18n
        "le": ">= " + Ember.I18n.t("webclient.option.lesserthan") + " " + Ember.I18n.t("webclient.nfa.geoLocation.or") + " " + Ember.I18n.t("webclient.equals"), //No I18n
        "gt": "> " + Ember.I18n.t("webclient.option.greaterthan"), //No I18n
        "ge": ">= " + Ember.I18n.t("webclient.option.greaterthan") + " " + Ember.I18n.t("webclient.equals") //No I18n
    };

    function customLogicalSearchFunction(searchValue, searchColumn, searchOperator, originalData) {
        var filteredData = [];

        if (searchValue === "") {
            // If the search input is cleared, reset the grid data to the original data
            filteredData = originalData;
        } else {
            for (var i = 0; i < originalData.length; i++) {
                var rowData = originalData[i];
                var cellValue = rowData[searchColumn];

                switch (searchOperator) {
                    case 'eq'://No I18n
                        if (cellValue == searchValue) {
                            filteredData.push(rowData);
                        }
                        break;
                    case 'ne'://No I18n
                        if (cellValue != searchValue) {
                            filteredData.push(rowData);
                        }
                        break;
                    case 'lt'://No I18n
                        if (Number(cellValue) < Number(searchValue)) {
                            filteredData.push(rowData);
                        }
                        break;
                    case 'le'://No I18n
                        if (Number(cellValue) <= Number(searchValue)) {
                            filteredData.push(rowData);
                        }
                        break;
                    case 'gt'://No I18n
                        if (Number(cellValue) > Number(searchValue)) {
                            filteredData.push(rowData);
                        }
                        break;
                    case 'ge'://No I18n
                        if (Number(cellValue) >= Number(searchValue)) {
                            filteredData.push(rowData);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        $(gridID).jqGrid('clearGridData').jqGrid('setGridParam', { data: filteredData }).trigger('reloadGrid');//No I18n
    }

    function handleSelectChange($input, col, originalData) {
        return function () {
            var searchValue = $input.val();
            var searchColumn = col.name;
            var searchOperator = $(this).val();
            customLogicalSearchFunction(searchValue, searchColumn, searchOperator, originalData);
        };
    }

    function handleInputChange($input, $select, col, originalData) {
        return function () {
            var searchValue = $input.val();
            var searchColumn = col.name;
            var searchOperator = $select.val();
            customLogicalSearchFunction(searchValue, searchColumn, searchOperator, originalData);
        };
    }

    function createSelectOptions(options) {
        var optionsHtml = '';
        for (var i = 0; i < options.length; i++) {
            var value = escapeHTML(options[i]);
            optionsHtml += '<option value="' + value + '">' + logicalLabels[value] + '</option>';
        }
        return optionsHtml;
    }

    for (var i = 0; i < colModel.length; i++) {
        var col = colModel[i];
        var nameID = escapeHTML(col.name.replace(/\s/g, ""));
        var selectID = "gs_select_" + nameID; //No I18n
        if (col.searchoptions && col.searchoptions.sopt && col.logicalSearchOptions) {
            var $input = $("#gs_" + $.jgrid.jqID(nameID));
            if ($input.length) {
                var selectHtml = '<select class="ui-search-oper select2" id="' + selectID + '">' + createSelectOptions(col.searchoptions.sopt) + '</select>';
                $input.before(selectHtml);
                $input.closest("td").addClass("flex"); //No I18n
                $("#" + selectID).select2({ width: '25%' });
                $("#" + selectID).on("change", handleSelectChange($input, col, originalData));
                $input.off().on("input", handleInputChange($input, $("#" + selectID), col, originalData));
            }
        }
    }
}

function nfa_sortLeaseStartTime(cellValue, rowObject) {
	return parseInt(rowObject["4"]); //NO I18N
}
