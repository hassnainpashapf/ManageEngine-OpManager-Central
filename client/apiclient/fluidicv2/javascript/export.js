var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};
var colorCodeArray=[
    "#00c6e4","#faa43a","#5da5da","#60bd68","#f17cb0","#b2912f","#307d99","#0093D8","#fc7c63","#a0bf60","#bf6060","#be9b89",//NO I18N
    "#5cbc69","#f15272","#006cb7","#784949","#9592b0","#a957c9","#0093d8","#71cfeb","#9467ac","#478ed9","#746ecf","#ffc10f",//NO I18N
    "#8f9ff2","#e9519a","#969a28","#d83bff","#646a6a","#c776b0","#ee5655","#596663","#4f57c3","#93888b","#4761ae","#89928f",//NO I18N
    "#ff44c8","#99795b","#15568b","#617b94","#00df9a","#a19279","#a6cf38","#237dbc","#00e06e","#7d889e","#e9c991","#b8b7cc",//NO I18N
    "#0fa8d1","#99b2e1","#0dea41","#ac4a72","#5c577d","#3abdb7","#cd833a","#badb26","#a84014","#fbd60c","#56b64b","#d9896c",//NO I18N
    "#9e8b21","#a2ec60","#5b853b","#d36e5c","#816b1f","#f99837","#506d33","#d270a6","#c27f00"//NO I18N
];
var availColors = ['#77d283','#afafaf','#ffee00','#ffc0cb','#f47272','#5DA5DA','#9E4B4B','#FFC10F','#746ECF','#A957C0','#716398','#A3AFC7'];//No I18N
var graphParamsMapping = {
                graphPlottingType:{min:0,max:1,avg:2},
                graphStyle:{area:0,line:1,bar:2},
                legendPlacement:{bottom:0,right:1},
                scaleType:{linear:0,log:1},
                xAxisFormat:{xAxisFormat_default:0,minute:1,hourly:2,daily:3,weekly:4,monthly:5,quarterly:6,yearly:7},
                yAxisPlacement:{left:0,right:1},
                showThresholdLines:{never:0,always:1},
                showPoints:{never:0,always:1},
                tableViewGroupingOnExport:{never:0,always:1},
                smoothEdges:{never:0,always:1},
                show95thPercentile:{never:0,always:1},
                legendPlacement:{bottom:0,right:1},
                showLegendForSingleGraph:{never:0,always:1}
            };
// Regex containing the keys listed immediately above.
var htmlEscaper = /[&<>"'\/]/g;

// Escape a string for HTML interpolation.
function escapeHTML(string) {
    if(string===undefined){
        return "";
    }else{
  return ('' + string).replace(htmlEscaper, function(match) {
    return htmlEscapes[match];
  });
    }
};
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
function addValue(object, keySet, value) {
    keySet = keySet.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    keySet = keySet.replace(/^\./, ''); // strip a leading dot
    var keys = keySet.split('.');
    var add = function(obj) {
        var key = keys.shift();
        if (key === null || keys.length === 0) {
            obj[key] = value;
            return false;
        } else if (obj[key] === null || typeof obj[key] !== "object") {
            obj[key] = !isNaN(parseInt(keys[0])) ? [] : {};
        }
        add(obj[key]);
    };
    add(object);
    return object;
}
function sortAscByObjKey(data, key) {
    return data.sort(function (a, b) {
        var x = a[key].toUpperCase();
        var y = b[key].toUpperCase();
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function getGraphSettings(graphSettings,fromPage,noDataText){
    var isSummaryPage = (fromPage === 'summary');//No I18N
    var isHardwareGraph = (fromPage === 'Hardware');//No I18N
    var defaultSettings = {graphStyle:'0',yAxisPlacement:'0',xAxisFormat:'0',scaleType:'0',legendPlacement:'0',graphHeight:'400',showPoints:'1',showThresholdLines:'1',tableViewGroupingOnExport:'0',smoothEdges:'1',show95thPercentile:'1',showLegendForSingleGraph:'1'};
    if(!Object.keys(graphSettings).length){
        graphSettings = defaultSettings;
    }
    var graphHeight = isSummaryPage ? 450 : (Number(graphSettings.graphHeight));
    var parsedSettings = {
        graphHeight:graphHeight,
        showGridlines:true,
        showPoints:(graphSettings.showPoints === '1'),
        showThresholdLines:(graphSettings.showThresholdLines === '1'),
        tableViewGroupingOnExport:(graphSettings.tableViewGroupingOnExport === '1'),
        smoothEdges:(graphSettings.smoothEdges === '1'),
        show95thPercentile:isHardwareGraph ? false : (graphSettings.show95thPercentile === '1'),
        showLegendForSingleGraph:(graphSettings.showLegendForSingleGraph === '1')
    };
    //Once backend handling done, this check will be removed
    if(graphSettings.showLegendForSingleGraph === undefined){
        parsedSettings.showLegendForSingleGraph = true;
    }
    if('reportBuilderIndividual' === fromPage || 'reportBuilderNormal' === fromPage || 'monitorGraphs' === fromPage || 'atAGlance' === fromPage || isSummaryPage || isHardwareGraph){
        parsedSettings.legendNeeded = false;
    }/*else if('reportBuilderOthers' === fromPage){//No I18N
        parsedSettings.legendNeeded = true;
    }*/
    $.each(['graphStyle','yAxisPlacement','xAxisFormat','scaleType','legendPlacement'],function(){//No I18N
        var mappedNumber = Number(graphSettings[this] || defaultSettings[this]);
        parsedSettings[this] = Object.keys(graphParamsMapping[this])[mappedNumber];
    });
    if(noDataText !== undefined){
        parsedSettings.noDataText = noDataText;
    }
    return parsedSettings;
}
function getZChartObjectForExport(graphId,xTitle,yTitle,minRange,maxRange,timeFormat,tooltip,jsonData,graphSettings,isInterfaceGraph){
    graphSettings.graphId = graphId;
    graphSettings.xTitle = xTitle;
    graphSettings.yTitle = yTitle;
    graphSettings.minRange = minRange;
    graphSettings.maxRange = maxRange;
    graphSettings.timePeriod = timeFormat || 'Today';//No I18N
    graphSettings.tooltip = tooltip;
    // graphSettings.fromPage = fromPage;
    // graphSettings.isSummaryPage = isSummaryPage;
    graphSettings.totalSeries = (jsonData.graphData && jsonData.graphData.length) || 0;
    graphSettings.isMultipleInstanceGraph = (graphSettings.totalSeries > 1);
    graphSettings.isExportPDF = true;
    graphSettings.showSharedSeriesInfo = false;
    graphSettings.showGridlines = true;
    graphSettings.xAxisGrouping = false;
    graphSettings.series = 'multi';//No I18N
    graphSettings.datatype_1 = 'time';//No I18N
    graphSettings.datatype_2 = 'numeric';//No I18N
    graphSettings.summaryGridId = 'consolidatedData';//No I18N
    if(graphSettings.noDataText !== undefined){
        graphSettings.noDataHandler = {htmlEl:"<div class='flex-center style3'><em class='svgIcon size64'><svg><use xlink:href='/apiclient/fluidicv2/img/sprite-opm.svg#no-schedule'></use></svg></em></div><div><p style='font-family:LatoBold;font-size: 20px;'>"+graphSettings.noDataText+"</p></div>"};//No I18N
    }

    return getZChartProps({graphData:jsonData.graphData,consolidatedValues:jsonData.consolidatedValues},graphSettings);
}
//Using this function is not advisable
function appendHTMLElement(htmlElement,elementSelectorName,isClassSelector){
    elementSelectorName = escapeHTML(elementSelectorName);
    $((isClassSelector ? '.' : '#')+elementSelectorName).append(htmlElement);
}
function createGridTableWithContainer(containerClass,tableTitle,gridTableId){
    containerClass = escapeHTML(containerClass)
    var returnString = '<div class="'+containerClass+' containerWidth">';//No I18N
    if(tableTitle !== undefined){
        tableTitle = escapeHTML(tableTitle) 
        returnString += '<div style="font-family:latoBold;font-size:14px">'+tableTitle+'</div>';//No I18N
    }
    if(gridTableId !== undefined){
        gridTableId=escapeHTML(gridTableId);
        returnString += '<div class="opm_jqGridUI opmReportsGridview containerWidth" style="margin-top:8px;margin-bottom:24px"><table id="'+gridTableId+'" class="containerWidth" ><tr><td></td></tr></table></div>';//No I18N
    }
    return returnString += '</div>';//No I18N
}
function setHeaders(reportName,timePeriod,additionalData,jsonData,isForecast,isReportBuilder){
    var headerContents = [];
    $('#reportNameContent').text(reportName);//No I18N
    $('#generatedAtHeader').text(additionalData.i18NKeys.genAT);//No I18N
    $('#generatedAtContent').text(additionalData.genATDate);//No I18N
    if(additionalData !== undefined){
        if(jsonData.category !== undefined){
            headerContents.push({key:additionalData.i18NKeys.category,value:jsonData.category});
        }
        if(jsonData.type){
            headerContents.push({key:additionalData.i18NKeys.type,value:jsonData.type});
        }
        headerContents.push({key:additionalData.i18NKeys.period,value:timePeriod});
        if(additionalData.graphType !== undefined && !isReportBuilder){
            headerContents.push({key:(isForecast ? additionalData.i18NKeys.graphType : additionalData.i18NKeys.graphAggregate),value:additionalData.graphType});
        }
        if(isReportBuilder){
            if(additionalData.chartType){
                headerContents.push({key:additionalData.i18NKeys.reportType,value:additionalData.chartType});
            }
            // if(additionalData.reportType){
            //     headerContents.push({key:'Entity Type',value:additionalData.reportType});
            // }
            if(additionalData.tableView){
                headerContents.push({key:additionalData.i18NKeys.tableView,value:additionalData.tableView});
            }
            if(additionalData.timeWindow){
                headerContents.push({key:additionalData.i18NKeys.timeWindow,value:additionalData.timeWindow});
            }
            if(additionalData.startTime){
                headerContents.push({key:additionalData.i18NKeys.startTime,value:additionalData.startTime});
            }
            if(additionalData.endTime){
                headerContents.push({key:additionalData.i18NKeys.endTime,value:additionalData.endTime});
            }
            if(additionalData.graphAggregate){
                headerContents.push({key:additionalData.i18NKeys.graphAggregate,value:additionalData.graphAggregate});
            }
        }
    }
    var headerElement = '<tr>';//No I18N
    $.each(headerContents,function(key,value){
        value.key = escapeHTML(value.key);
        value.value = escapeHTML(value.value) 
        headerElement += '<td style="width:30%"><Strong style="font-family:latoBold">'+value.key+':&nbsp;</Strong><span>'+value.value+'</span></td>';//No I18N
        if(((key+1)%3 === 0) && (headerContents[key+1] !== undefined)){
            headerElement+='</tr><tr>';//No I18N
        }
    });
    headerElement += '</tr>';//No I18N
    appendHTMLElement(headerElement,'tblBody',false);//No I18N
}
function setAdditionalHeaders(headerData){
    $('.intfDetailsContainer').show();
    var htmlString = "<div class='row'>";//No I18N
    var index = 0;
    $.each(headerData,function(key,val){
        if(index && (index%3 === 0)){
            htmlString+= "</div><div class='row'>";
        }
        htmlString += "<div class='col'>";
        htmlString += "<div>"+escapeHTML(key)+"</div>";
        htmlString += "<div>"+escapeHTML(val)+"</div>";
        htmlString += "</div>";
        index++;
    });
    htmlString += "</div>";
    appendHTMLElement(htmlString,'intfDetailsContainer',true);//No I18N
}
function generatePDF(jsonParams)
{
    if(jsonParams!==undefined && Object.keys(jsonParams).length>0 && jsonParams.module!==undefined)
    {
        //clearing localstorage
        localStorage.clear();
        switch(jsonParams.module)
        {
            case "1" : //No I18N
                drawRCAGraph(JSON.parse(jsonParams.rcaGraphData),JSON.parse(jsonParams.rcaEventsData),jsonParams.rcaName,jsonParams.rcaDescription,jsonParams.generatedTime,jsonParams.timePeriod,jsonParams.dis);
                break;
            case "2" : //No I18N
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys),genATDate:(jsonParams.genATDate || ''),graphType:jsonParams.graphType,graphReportType:jsonParams.graphReportType,reportType:jsonParams.reportType,timeWindow:jsonParams.timeWindow,startTime:jsonParams.startTime,endTime:jsonParams.endTime,graphAggregate:jsonParams.graphAggregate,chartType:jsonParams.chartType,graphSettings:(jsonParams.graphSettings || '{}')};
                drawChart1(JSON.parse(jsonParams.data),jsonParams.repname,jsonParams.timeperiod,jsonParams.genString,jsonParams.timekey,jsonParams.dis,jsonParams.graphType,jsonParams.reportBuilderLegendPosition,jsonParams.graphWidthInPx,jsonParams.reportType,jsonParams.reportBuilderLegendWrap,jsonParams.graphReportType,jsonParams.ignoreHeaderFilters,jsonParams.addDayInXAxis,additionalData);
                break;
            case "3" : //No I18N
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys),tableView:jsonParams.tableView,timeWindow:jsonParams.timeWindow,startTime:jsonParams.startTime,endTime:jsonParams.endTime,graphAggregate:jsonParams.graphAggregate,genATDate:(jsonParams.genATDate || '')};
                drawTable(JSON.parse(jsonParams.response),jsonParams.repname,jsonParams.timeperiod,jsonParams.tableView,jsonParams.genString,jsonParams.dis,jsonParams.list,additionalData);
                break;
        case "4": //No I18N INTF_AT_AGLANCE
                // drawAtaGlancePDF(JSON.parse(jsonParams.data), jsonParams.width, jsonParams.height, jsonParams.plotOnly,jsonParams.repName,jsonParams.repTime,jsonParams.policyName,jsonParams.reptimeperiod,jsonParams.inventorysnapType,jsonParams.genAT,jsonParams.dis);
               var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys || '{}'),genATDate:(jsonParams.genATDate || ''),category:jsonParams.category,type:jsonParams.type,isInterfaceGraph:(jsonParams.isInterfaceGraph === 'true'),graphSettings:(jsonParams.graphSettings || '{}')};
                drawAtAGlanceEnhancedPDF(JSON.parse(jsonParams.data),jsonParams.repName,jsonParams.repTime,jsonParams.policyName,jsonParams.reptimeperiod,jsonParams.inventorysnapType,jsonParams.genAT,jsonParams.dis,{InterfaceDetails:jsonParams.InterfaceDetails,Time:jsonParams.Time},additionalData);
                break;
            case "5": //No I18N AVAILABILITY_GRAPH
                // availabilityGraph(JSON.parse(jsonParams.data), jsonParams.width, jsonParams.height, jsonParams.plotOnly,jsonParams.repName,jsonParams.genAT,JSON.parse(jsonParams.tableDataJson),jsonParams.dis);
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys || '{}'),genATDate:(jsonParams.genATDate || ''),category:jsonParams.category,type:jsonParams.type,graphSettings:(jsonParams.graphSettings || '{}'),tableData:JSON.parse(jsonParams.tableDataJson),reportName:jsonParams.repName,dis:jsonParams.dis};
                drawAvailabilityGraph(JSON.parse(jsonParams.data),additionalData);
                break; 
            case "6": //No I18N DEVICEDEPENDENCY_TREE_EXPORT
                exportDevDependencyTreePDF(JSON.parse(jsonParams.jsonData),jsonParams.genString,jsonParams.repHeader);
                break; 
            case "7": //No I18N VPN_SUMMARY_REPORT
                exportVPNSummaryReport(JSON.parse(jsonParams.jsonData),jsonParams.genString,jsonParams.repHeader,JSON.parse(jsonParams.header),JSON.parse(jsonParams.subGridHeader));
                break;   
            case "8": //No I18N DEV_AT_A_GLANCE
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys || '{}'),genATDate:(jsonParams.genATDate || ''),category:jsonParams.category,type:jsonParams.type,isInterfaceGraph:(jsonParams.isInterfaceGraph === 'true'),graphSettings:(jsonParams.graphSettings || '{}')};
                drawAtAGlanceEnhancedPDF(JSON.parse(jsonParams.data),jsonParams.repName,jsonParams.repTime,jsonParams.policyName,jsonParams.reptimeperiod,jsonParams.inventorysnapType,jsonParams.genAT,jsonParams.dis,{InterfaceDetails:jsonParams.InterfaceDetails,Time:jsonParams.Time},additionalData);
                break;
            case "9": //No I18N MONITOR_SNAPSHOT_DETAILS
                // monitorSnapshotDetails(JSON.parse(jsonParams.data),jsonParams.repName,jsonParams.genAT,JSON.parse(jsonParams.tableDataJson));
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys || '{}'),genATDate:(jsonParams.genATDate || ''),category:jsonParams.category,type:jsonParams.type,graphSettings:(jsonParams.graphSettings || '{}'),tableData:JSON.parse(jsonParams.tableDataJson),reportName:jsonParams.repName,dis:jsonParams.dis};
                drawAvailabilityGraph(JSON.parse(jsonParams.data),additionalData);
                break;
            case "10": //No I18N DEFAULT_POLICYNAME
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys),genATDate:(jsonParams.genATDate || ''),graphType:jsonParams.graphType};
                drawSnapshotGraph(JSON.parse(jsonParams.data),jsonParams.repName,jsonParams.repTime,jsonParams.policyName,jsonParams.reptimeperiod,jsonParams.inventorysnapType,jsonParams.genAT,jsonParams.dis,jsonParams.module, jsonParams.startTime, jsonParams.endTime,additionalData);
                break;
            case "11":
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys),genATDate:(jsonParams.genATDate || ''),graphType:jsonParams.graphType};
                drawSnapshotGraph(JSON.parse(jsonParams.data),jsonParams.repName,jsonParams.repTime,jsonParams.policyName,jsonParams.reptimeperiod,jsonParams.inventorysnapType,jsonParams.genAT,jsonParams.dis,jsonParams.module,jsonParams.startTime, jsonParams.endTime,additionalData);
                break;
             case "12": 
                var responseData = JSON.parse(jsonParams.data);
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys),genATDate:jsonParams.genATDate,category:responseData.category,type:responseData.type,isInterfaceGraph:(responseData.isInterfaceGraph === 'true'),graphSettings:(responseData.graphSettings || '{}')};
                drawSnapshotSummaryGraphs(responseData.DataArray,jsonParams.repName,jsonParams.reptimeperiod,jsonParams.genAT,jsonParams.dis,additionalData);
                break;
            case "13": 
                drawAvailPieChart(JSON.parse(jsonParams.data),jsonParams.repname,jsonParams.timeperiod,jsonParams.genString,jsonParams.dis);
                break;
            case "14":
                var responseData = JSON.parse(jsonParams.data);
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys),genATDate:jsonParams.genATDate,category:responseData.category,type:responseData.type,isInterfaceGraph:(responseData.isInterfaceGraph === 'true'),graphSettings:(responseData.graphSettings || '{}'),isBGPGraph:true};
                drawSnapshotSummaryGraphs(responseData.DataArray,jsonParams.repName,jsonParams.reptimeperiod,jsonParams.genAT,jsonParams.dis,additionalData);
                break;
            case "15":
                drawOverviewReport(JSON.parse(jsonParams.data),jsonParams.repName,jsonParams.repTime,jsonParams.genAT,jsonParams.dis,JSON.parse(jsonParams.i18NKeys),jsonParams.startTime, jsonParams.endTime);
                break;
            case "16":
                drawLineChartAsImage(JSON.parse(jsonParams.data),jsonParams.repname);
                break;
            case "17":
                var additionalData = {i18NKeys:JSON.parse(jsonParams.i18NKeys || '{}'),genATDate:(jsonParams.genATDate || ''),category:jsonParams.category,type:jsonParams.type,graphSettings:(jsonParams.graphSettings || '{}'),tableData:JSON.parse(jsonParams.tableDataJson),reportName:jsonParams.repName,dis:jsonParams.dis};
                drawBVAvailabilityGraph(JSON.parse(jsonParams.data),additionalData);
                break;
            default:
                console.log("Module number not given :");
                break;
        }
    }
}

function drawOverviewReport(jsonData,repName,repTime,genAT,dis,i18NKeys,startTime,endTime) {
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    if(repName!==undefined&&repName!==""&&repName!==null&&repName!=="null")
    {
        $('#pdfheadervalue').empty().text(escapeHTML(repName)); //No I18N
    }
    else
    {
        $('#pdfheadervalue').empty().text("Report"); //No I18N
    }
    $("#disclaimer").empty();
    if(dis!==undefined&&dis!==null&&dis!==""&&dis!=="null")
    {
        $("#disclaimer").text(dis);
    }
    else
    {
        $("#disclaimer").hide();
    }
    if(repTime!==undefined)
    {
        if(startTime !== undefined && endTime !== undefined)
        {
            $('#timeDataval').empty().text(repTime+"["+startTime+" - "+endTime+"]");
        }
        else
        {
            $('#timeDataval').empty().text(repTime);
        }
    }
    $('#genAT').empty().text(genAT);

    $(".reportGraphContainer").empty();
    $(".reportGraphContainer").append("<div id='healthGraph' class='healthGraphs'></div>");
    var id=0;
    var arraObj={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    };
    $.each(jsonData, function(i,map) {
        var gDiv="<div id='healthGraphDiv_"+id+"'><div class='clearfix'><div class='grid-col-12'><div style='height: 20px;margin-bottom: 10px;margin-top: 10px;'><div class='title-text' style='text-align:center;font-family:LatoBold' id='graphTitle_"+id+"'></div></div></div></div><div id='"+id+"'></div></div>";
        $("#healthGraph").append(gDiv);
        $("#graphTitle_"+id).text(i);
        var maxRange = null;
        var minRange = null;
        if(map.unit!==undefined && map.unit.indexOf("%")!==-1) { //No I18N
            maxRange = 100;
            minRange = 0;
        }
        if (map.graphData && map.graphData.length > 0 && map.graphData[0].data && Array.isArray(map.graphData[0].data)) {
            map.graphData[0].data.forEach(function(item, i) {
                if (item && item.length > 1) {
                    item[1] = Number(item[1]) || 0;
                }
            });
        }
        var x_axes=i18NKeys.deviceName;
        var colours=["#00ff00","#faa43a","#5da5da","#60bd68","#f17cb0","#b2912f","#307d99","#0093D8","#fc7c63","#a0bf60","#bf6060","#be9b89","#5cbc69","#f15272","#006cb7","#784949" ]; // No I18N
        var perfChartObj = {}
        if(id===0) {
            perfChartObj = {
                id : id,
                type : 'bar', //No I18N
                jsonData : map.graphData,
                series : "multi", //No I18N
                height: 300,
                columns:{
                    datatype_1:'ordinal',datatype_2:'numeric',columnname_1:x_axes,columnname_2:i //No I18N
                },
                tooltip: [0,1],
                canvas:{
                    title:{
                        show:false,
                        text:"dispName" //No I18N
                    }
                },
                legend: {
                    "enabled": false, //No I18N
                    "colors": [colours[id]]
                },
                "axes": { //No I18N
                    "rotated": "auto", //No I18N
                    "xaxis": { //No I18N
                        "label": { //No I18N
                            "text": x_axes //No I18N
                        },
                        "ticklabel": { //No I18N
                            "alignMode": "rotate(270)", //No I18N
                            "textOverflow": "ellipsis", //No I18N
                            "events": { //No I18N
                                "enabled":false //No I18N
                            },
                            "maxHeight": 75 //No I18N
                        }
                    },
                    "yaxis": [ //No I18N
                        {
                            "label": { //No I18N
                                "text": map.unit //No I18N
                            },
                            "minRange":minRange,//No I18N
                            "maxRange":maxRange,//No I18N
                            "events": { //No I18N
                                "enabled":false //No I18N
                            }
                        }
                    ]
                },
                chart : {
                    stacked : false
                },
                "plot": { //No I18N
                    "plotoptions": { //No I18N
                        "bar": { //No I18N
                            "levelMarker": { //No I18N
                                "enabled": true, //No I18N
                                "color": "#FF0000", //No I18N
                                "fillOpacity": 1 //No I18N
                            },
                            "legendHighlightEffect": { // No I18N
                                "selectedSeries": "none" // No I18N
                            }
                        }
                    },
                    "events": { //No I18N
                        "cursor": "default" //No I18N
                    }
                },
                showToolTip:false,
                noDataHandler : {
                    htmlEl: '<div class="noDataInfo mt-lg" data-bindattr-15153="15153"><svg class="svgIcon size48 m-auto mb-md" style="fill:#7a7f82;"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#no-data"></use></svg><div>'+i18NKeys.noDataText+'</div></div>' //No I18N
                }
            }
        } else {
            perfChartObj = {
                id : id,
                type : 'bar', //No I18N
                jsonData : map.graphData,
                series : "multi", //No I18N
                height: 300,
                columns:{
                    datatype_1:'ordinal',datatype_2:'numeric',columnname_1:x_axes,columnname_2:i //No I18N
                },
                tooltip: [0,1],
                canvas:{
                    title:{
                        show:false,
                        text:"dispName" //No I18N
                    }
                },
                legend: {
                    "enabled": false, //No I18N
                    "colors": [colours[id]]
                },
                "axes": { //No I18N
                    "rotated": "auto", //No I18N
                    "xaxis": { //No I18N
                        "label": { //No I18N
                            "text": x_axes //No I18N
                        },
                        "ticklabel": { //No I18N
                            "alignMode": "rotate(270)", //No I18N
                            "textOverflow": "ellipsis", //No I18N
                            "events": { //No I18N
                                "enabled":false //No I18N
                            },
                            "maxHeight": 75 //No I18N
                        }
                    },
                    "yaxis": [ //No I18N
                        {
                            "label": { //No I18N
                                "text": map.unit //No I18N
                            },
                            "minRange":minRange,//No I18N
                            "maxRange":maxRange,//No I18N
                            "events": { //No I18N
                                "enabled":false //No I18N
                            }
                        }
                    ]
                },
                chart : {
                    stacked : false
                },
                "plot": { //No I18N
                    "plotoptions": { //No I18N
                        "bar": { //No I18N
                            "legendHighlightEffect": { // No I18N
                                "selectedSeries": "none" // No I18N
                            }
                        }
                    },
                    "events": { //No I18N
                        "cursor": "default" //No I18N
                    }
                },
                showToolTip:false,
                noDataHandler : {
                    htmlEl: '<div class="noDataInfo mt-lg" data-bindattr-15153="15153"><svg class="svgIcon size48 m-auto mb-md" style="fill:#7a7f82;"><use xlink:href="/apiclient/fluidicv2/img/sprite-opm.svg#no-data"></use></svg><div>'+i18NKeys.noDataText+'</div></div>' //No I18N
                }
            }
        }
        arraObj.chartobj.push(perfChartObj);
        arraObj.placeholder.push(id);
        id++;
    });
    zChart(arraObj);
}


function drawSnapshotSummaryGraphs(dataArray,repname,timeperiod,genString,dis,additionalData){
    var temparrval;
    var count = 0;
    var arraObj = {placeholder:[],chartobj:[],seriesNameVsColorCodeArray:[],isStackedGraph:true,isExport:true};
    var mappingobj = {};
    var disclaimerId = 'disclaimerNewReport';//No I18N
    var containerID = 'zGraphContainer';//No I18N
    var reportName = 'Report';//No I18N
    var timePeriod = (timeperiod || 'Today');//No I18N
    var graphSettings = getGraphSettings(JSON.parse(additionalData.graphSettings),'summary',additionalData.i18NKeys.noDataText);//No I18N
    var reportWidth = ($('#zchartgraph').width())+55;
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N

    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $('.newDSPReport').empty();

    if(repname !== undefined && repname !== "" && repname !== null && repname !== 'null'){
        reportName = repname;
    }
    if(dataArray.length && !(additionalData.isBGPGraph || additionalData.isSDWANGraph || additionalData.isInterfaceGraph)){
        sortAscByObjKey(dataArray,'displayName');//No I18N
    }

    setHeaders(reportName,timePeriod,additionalData,additionalData,false);

    $('#'+disclaimerId).empty();
    if(dis !== undefined && dis !== null && dis !=='' && dis !== 'null'){
        $('#'+disclaimerId).text(dis);
    }else{
        $('#'+disclaimerId).hide();
    }

    $.each(dataArray,function(key,val){
        var height = 'auto';//No I18N
        var marginTop = 24;
        var data = val.graphData;
        var id1 = 'reportgrap_'+count;//No I18N
        var isAvailabilityGraph = (val.displayName === undefined);
        var graphHeaderid = 'graphHeaderid_'+count;//No I18N
        count++;
        if(key > 0){
            marginTop = 50;
            if(key%3 === 0){
                marginTop = 70;
            }
        }
        height = escapeHTML(height)
        graphHeaderid = escapeHTML(graphHeaderid)
        id1 = escapeHTML(id1)
        appendHTMLElement("<div class='containerWidth avoidPageBreak' style='border:1px solid #ddd;border-radius:4px;margin-top:"+marginTop+"px;height:"+height+"px;'><div style='font-family:latoBold;font-size:14px;margin-top:15px;margin-left:15px' id="+graphHeaderid+"></div><div id='"+id1+"' class='perfExportPdfGraph' style='margin-top:24px;margin-bottom:24px;'></div></div>",containerID,false);//No I18N
        $("#"+graphHeaderid).empty().text(val.displayName || 'Availability');
        $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N

        var minRange = null;
        var maxRange = null;
        var xyTitles = val.xyTitles;
        if((additionalData.isBGPGraph || additionalData.isSDWANGraph) && xyTitles === undefined){
            xyTitles = ['Time','Availability'];//No I18N
            val.seriesName = xyTitles[1];
            if(data && data[0]){
                data[0].seriesname = '__AVAILABILITY__';//No I18N
            }
        }
        if(xyTitles !== undefined && xyTitles[1] !== undefined && (xyTitles[1].toLowerCase().indexOf("utilization") !== -1 || xyTitles[1].toLowerCase().indexOf('percentage') !== -1 || xyTitles[1].indexOf('%') !== -1)){
            minRange = 0;
            maxRange = 105;
        }
        var unit = (xyTitles === undefined || xyTitles[1] === undefined) ? '' : xyTitles[1];
        var chartObj = getZChartObjectForExport(id1,'Time',unit,minRange,maxRange,(timeperiod || 'Hours'),'',{graphData:data,consolidatedValues:[]},graphSettings,additionalData.isInterfaceGraph);//No I18N
        if((additionalData.isBGPGraph || additionalData.isSDWANGraph) && isAvailabilityGraph){
            chartObj.type = 'line';//No I18N
            chartObj.columns.format = {customFormat:function(value){return opm_AvailGraphValueToString(value);}};
        }
        chartObj.columns.suffix = '';
        arraObj.seriesNameVsColorCodeArray.push(chartObj.seriesNameVsColorCodeArray);
        arraObj.chartobj.push(chartObj);
        arraObj.placeholder.push(id1);
        mappingobj[id1]=chartObj;
    });
    zChart(arraObj);
    var timeRequiredForRender = [(dataArray.length / 5) + 2 ] * 1000;
    setTimeout(function(){
        window.canvasLoded = true;
    },timeRequiredForRender);
}
function drawTable(response,repname,timeperiod,tableView,genString,dis,list,additionalData)
{
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N


    var disclaimerId = 'disclaimerNewReport';//No I18N
    var containerID = 'zGraphContainer';//No I18N
    var reportName = 'Report';//No I18N
    var timePeriod = (timeperiod || 'Today');//No I18N
    var reportWidth = ($('#zchartgraph').width())+55;

    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $('.newDSPReport').empty();

    if(repname !== undefined && repname !== "" && repname !== null && repname !== 'null'){
        reportName = repname;
    }

    setHeaders(reportName,timePeriod,additionalData,additionalData,false,true);

    $('#'+disclaimerId).empty();
   if(dis !== undefined && dis !== null && dis !=='' && dis !== 'null'){
        $('#'+disclaimerId).text(dis);
    }else{
        $('#'+disclaimerId).hide();
    }
    var monitorcount=0;
    var defaultOptions = {};
    var colNamesList = ["Device Name","Instance","Min","Max","Avg","Device Name"]; //No I18N
    var colModelList = [{
        name: 'deviceDisplayName', //No I18N
        index: 'deviceDisplayName',//No I18N
        sorttype:'text',//No I18N
        classes:"pointer"//No I18N
    }, //No I18N

    {
        name: 'instance', //No I18N
        index: 'instance', //No I18N
        sorttype:'text'//No I18N
    }, //No I18N

    {
        name: 'min', //No I18N
        index: 'min',//No I18N
        sorttype:'int'//No I18N
    }, //No I18N

    {
        name: 'max', //No I18N
        index: 'max',//No I18N
        sorttype:'int'//No I18N
    }, //No I18N

    {
        name: 'avg', //No I18N
        index: 'avg', //No I18N
        sorttype:'int'//No I18N
    }, //No I18N

    {
        name: 'deviceName', //No I18N
        index: 'deviceName', //No I18N
        hidden:true
    } //No I18N
    ];
    if(tableView === "monitor") {
       var colNamesList = ["Device Name","Min","Max","Avg","Device Name"]; //No I18N
       var colModelList = [{
        name: 'deviceDisplayName', //No I18N
        index: 'deviceDisplayName',//No I18N
        sorttype:'text',//No I18N
        classes:"pointer"//No I18N
    }, //No I18N
    
    {
        name: 'min', //No I18N
        index: 'min',//No I18N
        sorttype:'int'//No I18N
    }, //No I18N

        {
            name: 'max', //No I18N
            index: 'max',//No I18N
            sorttype:'int'//No I18N
        }, //No I18N

        {
            name: 'avg', //No I18N
            index: 'avg',//No I18N
            sorttype:'int'//No I18N
        }, //No I18N

        {
            name: 'deviceName', //No I18N
            index: 'deviceName', //No I18N
            hidden:true
        } //No I18N
        ];
    }
    else if(tableView === "device"){
        var colNamesList = ["Device Name","DeviceName"]; //No I18N
        var colModelList = [{
            name: 'deviceDiplayName', //No I18N
            index: 'deviceDiplayName', //No I18N
            sorttype:'text', //No I18N
            width:200, 
            classes:"pointer"//No I18N
        }, //No I18N

        {
            name: 'deviceName', //No I18N
            index: 'deviceName', //No I18N
            hidden:true
        }]; //No I18N
        $.each(response.headers, function(key,val){
            if(key !==  "deviceName")   {
                colNamesList.push(val);
                var modelObj = {};
                modelObj.name = val;
                modelObj.index = val;
                modelObj.width = 200;
                modelObj.sorttype = 'int'; //No I18N
                colModelList.push(modelObj);
                 monitorcount++;
            }
        });
        var result=response.result
        response={};
        response["Monitors Report"]=result;//No I18N
         defaultOptions= {"headertitles":true};//No I18N
    }
    if(list !== undefined && list === "Interface")
    {
        var colNamesList = ["Interface Name","Device Name","Min","Max","Avg","95th PercVal"]; //No I18N
        var colModelList = [
            {
                name: 'instance', //No I18N
                index: 'instance',//No I18N
                sorttype:'text',//No I18N
                classes:"pointer"//No I18N
            }, //No I18N
            {
                name: 'deviceDisplayName', //No I18N
                index: 'deviceDisplayName', //No I18N
                sorttype:'text'//No I18N
            }, //No I18N
            {
                name: 'min', //No I18N
                index: 'min', //No I18N
                sorttype:'int'//No I18N
            }, //No I18N
            {
                name: 'max', //No I18N
                index: 'max',//No I18N
                sorttype:'int'//No I18N
            }, //No I18N
            {
                name: 'avg', //No I18N
                index: 'avg', //No I18N
                sorttype:'int'//No I18N
            }, //No I18N
            {
                name: 'perc95th', //No I18N
                index: 'perc95th', //No I18N
                sorttype:'int'//No I18N
            }
        ];
        if(tableView === "interface") {
            var colNamesList = ["Monitor Name","","Device Name","Min","Max","Avg","95th PercVal"]; //No I18N
            var colModelList = [
                {
                    name: 'instance', //No I18N
                    index: 'instance',//No I18N
                    sorttype:'text',//No I18N
                    classes:"pointer"//No I18N
                }, //No I18N
                {
                    name: 'intfDisplayName', //No I18N
                    index: 'intfDisplayName',//No I18N
                    hidden:true
                },
                {
                    name: 'deviceDisplayName', //No I18N
                    index: 'deviceDisplayName', //No I18N
                    sorttype:'text'//No I18N
                }, //No I18N
                {
                    name: 'min', //No I18N
                    index: 'min',//No I18N
                    sorttype:'int'//No I18N
                }, //No I18N
                {
                    name: 'max', //No I18N
                    index: 'max',//No I18N
                    sorttype:'int'//No I18N
                }, //No I18N
                {
                    name: 'avg', //No I18N
                    index: 'avg',//No I18N
                    sorttype:'int'//No I18N
                }, //No I18N
                {
                    name: 'perc95th', //No I18N
                    index: 'perc95th',//No I18N
                    sorttype:'int'//No I18N
                } //No I18N
            ];
        }
        var intfAvailColName = ["Interface Name","Device Name","Interface Availability (%)"]; //No I18N
        var intfAvailColmodel = [
            {
                name: 'interfaceDisplayName', //No I18N
                index: 'interfaceDisplayName',//No I18N
                sorttype:'text',//No I18N
                classes:"pointer"//No I18N
            }, //No I18N
            {
                name: 'deviceDiplayName', //No I18N
                index: 'deviceDiplayName',//No I18N
                sorttype:'text',//No I18N
                classes:"pointer"//No I18N
            }, //No I18N
            {
                name: 'Availability', //No I18N
                index: 'Availability',//No I18N
                sorttype:'int'//No I18N
            }
        ];
    }
    var cnt = 0;
    window.countval=0;
    $.each(response, function(key,val){
        if(tableView === "interface" && val!==undefined && val[0].intfDisplayName) {
            key = val[0].intfDisplayName;
        }
        cnt=cnt+1;
        var containerClass = 'rbTableViewGrid';//No I18N
        if(cnt === 1){
            containerClass += ' mTop24px';//No I18N
        }
        appendHTMLElement(createGridTableWithContainer(containerClass,escapeHTML(key),cnt+"_List"),containerID,false);//No I18N
        $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N

        if(list === "Interface" && (key === "InterfacesAvailability" || val[0].instance === "InterfacesAvailability")) //No I18N
        { 
            colNames = intfAvailColName;
            colModels = intfAvailColmodel;
        } else if(tableView !== 'device' && val!=undefined && val[0].hwMonitor!==undefined) {
            colNames = colNamesList.slice();
            colModels = colModelList.slice();
            if(tableView === 'monitor') {
                colNames.splice(1,2);
                colModels.splice(1,2);
            } else {
                colNames.splice(2,2);
                colModels.splice(2,2);
            }
        }
        else
        {
            colNames = colNamesList;
            colModels = colModelList;
        }

        pdf_loadJQgridWithData("#"+cnt+"_List", val, colNames, colModels, "", "#"+cnt+"_Pager", "deviceList",defaultOptions); //No I18N
        $('#'+cnt+'_List').jqGrid('setGridWidth',($('.rbTableViewGrid').width()));//No I18n
    });
    var test = setInterval(function(){
        if(Object.keys(response).length===window.countval){
            clearInterval(test)
            window.canvasLoded = true;
        }
    }, 1000/60)
}
function pdf_loadJQgridWithData(gridTable, jsonData, colNamesList, colModelList, captionTitle, gridNavigator, onSelectFunction, defaultOptions,page)
{
window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    var defaultSortName = ""; //No I18N
    var defaultSortOrder = "asc"; //No I18N
    var multiselectVal = false; // No I18N
    var rowNumNeeded = false; //No I18N
    var minRowsPerPage = 50;
    var grouping = false;
    var groupingField = "";
    var groupingText = '<b>{0} </b>'; //No I18n
    var subGrid = false;
    var rowList = [10,25,50,100,500,1000];
    var headertitles=false;
    if (defaultOptions != undefined)
    {
        if(defaultOptions.subGrid !== undefined)
        {
            subGrid = defaultOptions.subGrid; //No I18n
        }
        if (defaultOptions.searchOption != undefined)
        {
            searchOption = defaultOptions.searchOption; //No I18N
        }
        if (defaultOptions.sortName != undefined)
        {
            defaultSortName = defaultOptions.sortName; //No I18N
        }
        if (defaultOptions.sortOrder != undefined)
        {
            defaultSortOrder = defaultOptions.sortOrder; //No I18N
        }
        if (defaultOptions.widthOfTable != undefined)
        {
            widthOfTable = defaultOptions.widthOfTable; //No I18N
        }
        if (defaultOptions.multiselect != undefined)
        {
            multiselectVal = defaultOptions.multiselect; //No I18N
        }
        if (defaultOptions.apiUrl != undefined)
        {
            apiUrl = defaultOptions.apiUrl; //No I18N
        }
        if (defaultOptions.urlParameter != undefined)
        {
            urlParameter = defaultOptions.urlParameter; //No I18N
        }
        if (defaultOptions.deleteName != undefined)
        {
            deleteName = defaultOptions.deleteName; //No I18N
        }
        if (defaultOptions.rowNumNeeded != undefined)
        {
            rowNumNeeded = defaultOptions.rowNumNeeded; //No I18N
        }
        if (defaultOptions.addIcon != undefined)
        {
            addIcon = defaultOptions.addIcon; //No I18N
        }
        if (defaultOptions.delIcon != undefined)
        {
            delIcon = defaultOptions.delIcon; //No I18N
        }
        if (defaultOptions.selectedMonitorTab != undefined)
        {
            selectedMonitorTab = defaultOptions.selectedMonitorTab; //No I18N
        }
        if (defaultOptions.deviceName != undefined)
        {
            deviceName = defaultOptions.deviceName; //No I18N
        }
        if (defaultOptions.deviceNameParameter != undefined)
        {
            deviceNameParameter = defaultOptions.deviceNameParameter; //No I18N
        }
        if (defaultOptions.delConfirmMsg != undefined)
        {
            delMsg = defaultOptions.delConfirmMsg; //No I18N
        }
        if (defaultOptions.minRowsPerPage != undefined)
        {
            minRowsPerPage = defaultOptions.minRowsPerPage; //No I18N
        }
        if (defaultOptions.grouping != undefined)
        {
            grouping = defaultOptions.grouping; //No I18N
        }
        if(defaultOptions.groupingField !== undefined)
        {
            groupingField = defaultOptions.groupingField.split(","); //No I18N
        }
        if(defaultOptions.groupingText !== undefined)
        {
            groupingText = defaultOptions.groupingText; //No I18N
        }
        if (defaultOptions.toggleSearch !== undefined)
        {
            toggleSearch = defaultOptions.toggleSearch; //No I18N
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
            headertitles=defaultOptions.headertitles
        }
        if(defaultOptions.disableRowSelect !== undefined){
            disableRowSelect=defaultOptions.disableRowSelect;
        }



    }
    gridTable = escapeHTML(gridTable);
    var grid = $(gridTable);
    var gridDivId = "#gbox_"; //No I18N
    var gridTableIdAlone = gridTable.substring(1); //No I18N
    gridDivId = gridDivId+gridTableIdAlone; //No I18N
    gridDivId = escapeHTML(gridDivId);
    var gridDiv = $(gridDivId); //No I18N
    if (gridDiv.length > 0)
    {
        grid.jqGrid('clearGridData'); //No I18N
        grid.jqGrid('setGridParam', { datatype: "jsonstring", datastr: jsonData }); //No I18N
        grid.trigger('reloadGrid'); //No I18N
    }
    else
    {
        if(defaultOptions!==undefined && defaultOptions.skipNullData && jsonData!==undefined && jsonData.length>0)
        {
            jsonData =  jsonData.filter(function(row) { 
                return row!==undefined && row.length>0 && row[defaultOptions.nullColumnIndex]!==undefined && row[defaultOptions.nullColumnIndex]!==null;
            });
        }
        var gridviewVal = false;
        grid.jqGrid(
        {
            colNames:((onSelectFunction === 'monitorsSummary') ? colNamesList : escapeGridColumnNames(colNamesList)),//No I18N
            colModel: colModelList,
            rowList:rowList,
            datatype: "jsonstring", //No I18N
            datastr: jsonData,
            multiselect: multiselectVal,
            loadOnce: true,
            headertitles:headertitles,
            jsonReader: { root: function (obj) { return obj; }, repeatitems: false },
            rownumbers: rowNumNeeded,
            rowNum: -1,
            rownumWidth:25, //minor ui issue in number column width
            viewrecords: true,
            grouping: grouping,
            autoencode: true,
            groupingView:
            {
                groupField: groupingField,
                groupColumnShow: [false],
                groupText:[groupingText]
            },
            caption: escapeHTML(captionTitle),
            height: '100%', //No I18N
            autowidth: true,
            shrinkToFit: true,
            hidegrid: false,
            ignoreCase: true,
            sortable:true,
            subGrid:subGrid,
            sortname: defaultSortName, //No I18N
            sortorder: defaultSortOrder, //No I18N
            gridview: gridviewVal, // If set to true, the event below doesn't fire!
            onSelectAll: function(rowIds, allChecked) {
                $("input.groupHeader").attr('checked', allChecked);
                allChecked && defaultOptions.showActionDiv ? $(".opmActionsIcons").slideDown() : $(".opmActionsIcons").slideUp() ;
                defaultOptions.showActionDiv ? $(".opmForm").addClass("opmFormType5") : '';//No I18N
            },
            afterInsertRow: function(rowId, rowData, rowElem)
            {
            },
            rowattr: function (rd)
            {
               
            },
            beforeSelectRow: function(rowId, rowElem){

              
            },
            onSelectRow: function(id,status)
            {
            },
            onCellSelect: function(row, col, content, event)
            {
            },
            subGridOptions:
            {
                "plusicon"  : "ui-icon-triangle-1-e",//No I18N
                "minusicon" : "ui-icon-triangle-1-s", //No I18N
                "openicon"  : "ui-icon-arrowreturn-1-e", //No I18N
                "reloadOnExpand" : false, //No I18N
                "selectOnExpand" : false, //No I18N
                "expandOnLoad" : true //No I18N
            },
            subGridRowExpanded:function(subgrid_id, row_id)
            {
                var subgrid_table_id = subgrid_id+"_t"; //No I18N
                var subgrid_table1_id = subgrid_id+"_t1"; //No I18N
                var subgrid_table2_id = subgrid_id+"_t2"; //No I18N

                var subgridFun =defaultOptions.subGridFunction;
                $("#"+subgrid_id).addClass('opm_jqGridUI themeOne');
                var tableHtml ="<table id='"+subgrid_table_id+"'></table>";
                $("#"+subgrid_id).html(tableHtml);
                if(subgridFun === "vpnSummaryReport")
                {
                    pdf_loadJQgridWithData("#"+subgrid_table_id, defaultOptions.Data[row_id-1].vpnDetails, defaultOptions.colNamesList, defaultOptions.colModelList , "", "", "VPNDetails",{noPaginationShowAll: true,lastExpandedRowID:row_id}); //No I18N
                }
                $("#"+subgrid_table_id).addClass('ut ut-Grid');
                if(subgridFun === "vpnSummaryReport")
                {
                    var rowCnt = defaultOptions.Data[row_id-1].vpnDetails.length;
                    //var tHeigth = (rowCnt*60);
                    $('#'+subgrid_id+'_expandedContent').css({overflow:'visible'});//No I18N
                    $('#'+subgrid_id).css({overflow:'visible'});//No I18N
                }
            },
            loadComplete: function ()
            {
                var $this = $(this);
                $(this).removeClass('gridnodata');
                var checkboxes = $(this).find("input.cbox");
                checkboxes.after("<i></i>");
            }

        });
    }
    window.countval=window.countval+1
}
function drawChart1(data1,repname,timeperiod,genString,timekey,dis,graphType,reportBuilderLegendPosition,graphWidthInPx,reportType,reportBuilderLegendWrap,graphReportType,ignoreHeaderFilters,addDayInXAxis,additionalData){
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    var data;
    count=0;

    var htmlString = '';
    var containerID = 'zGraphContainer';//No I18N
    var disclaimerId = 'disclaimerNewReport';//No I18N
    var reportName = repname || 'Report';//No I18N
    var timePeriod = (timeperiod || 'Today');//No I18N
    var reportWidth = ($('#zchartgraph').width())+55;
    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $(".newDSPReport").empty();

    $('#'+disclaimerId).empty();
    if(dis !== undefined && dis !== null && dis !=='' && dis !== 'null'){
        $('#'+disclaimerId).text(dis);
    }else{
        $('#'+disclaimerId).hide();
    }

    if(ignoreHeaderFilters === 'true'){
        $('.headerTable, .exportPDFLogo, .exportPDFTitle').hide();
    }else{
        setHeaders(reportName,timePeriod,additionalData,additionalData,false,true);
    }

    var arrayObj = {placeholder:[],chartobj:[]};

    var mappingobj={};
    var temparrval;
    var unit = "";
    if(data1.AllTrafficDetails !== undefined){
        data1 = data1.AllTrafficDetails;
    }

    
    var xAxisText = additionalData.i18NKeys.time;
    if(xAxisText===undefined){
        xAxisText='Time';//NO I18N
    }
    if(data1.individualGraphs!==undefined) {
        var graphSettings = getGraphSettings(JSON.parse(additionalData.graphSettings),'reportBuilderIndividual',additionalData.i18NKeys.noDataText);//No I18N
        var arrayObj = {placeholder:[],chartobj:[],isIndividualGraph:true,consolidatedValuesArray:[],isExport:true,seriesNameVsColorCodeArray:[],customFieldsArray:[],customFieldsMap:{},customFieldNamesArrayMap:{},i18NKeys:additionalData.i18NKeys};
        $.each(data1.individualGraphs,function(index,graphsMap){

            var deviceName = graphsMap.deviceName;
            var monitorName = graphsMap.monitorName;
            var graphName = deviceName+" - "+monitorName;
            if(graphsMap.interfaceName!==undefined) {
                if(graphsMap.policyName==='Traffic Utilization' || graphsMap.policyName==='All Traffic') {
                    graphName = graphsMap.interfaceName+" (" +deviceName+")";
                    isTrafficUtil = true;
                } else {
                    graphName = graphsMap.interfaceName+ " - " + monitorName+" (" +deviceName+")";
                }
            }
            var yAxisText = graphsMap.yAxisText;
            if(yAxisText===undefined){
                yAxisText='';//NO I18N
            }
            var graphsForMonitor = graphsMap.graphs;
            var consolidatedValues=[];
            if(graphsMap.consolidatedValues!==undefined){
                consolidatedValues= graphsMap.consolidatedValues;
                // legend.enabled=false;
                if((monitorName==='Traffic Utilization' || monitorName==='All Traffic')) {
                    // legend.enabled=true;
                }
            } else {
                // legend.enabled=true;
            }
            // var newLegend = jQuery.extend(true, {}, legend);
            count++
            id1="reportgrap_"+count;//No I18N
            var maxRange = null;
            var minRange = null;
            var needExactMinMaxInGraph = false;
            $.each(consolidatedValues,function(index,eachConsolidatedObject) {
                if(eachConsolidatedObject.exactMinVal!==undefined && eachConsolidatedObject.exactMaxVal!==undefined) {
                    needExactMinMaxInGraph = true;
                    if(maxRange < eachConsolidatedObject.exactMaxVal) {
                        maxRange = eachConsolidatedObject.exactMaxVal;
                    }
                }
            })
            if(yAxisText!==undefined && (yAxisText.toLowerCase().indexOf("percentage")!=-1 || yAxisText.toLowerCase().indexOf("utilization")!=-1 || yAxisText.indexOf("%")!=-1)){//No I18N
                maxRange = 105;
                minRange = 0;
            }
            var format = undefined;
            if(reportType!==undefined && reportType==="Interface"){
                minRange = 0;
                format = {"type":"SIprefix"};//NO I18N
            }

            var height = 'auto';//510; //NO I18N
            var marginTop = 24;
            var graphHeaderid = 'graphHeaderid_'+count;//No I18N
            id1 = escapeHTML(id1)
            graphHeaderid = escapeHTML(graphHeaderid)
            var reportDiv = "<div class='containerWidth avoidPageBreak' style='border:1px solid #ddd;border-radius:4px;margin-top:"+marginTop+"px;height:auto;'><div style='font-family:latoBold;font-size:14px;margin-top:15px;margin-left:15px' id='"+id1+"_headerDiv'><span id='"+id1+"_graphSerialNumber' class='mr-sm'></span><span id='"+graphHeaderid+"'></span></div><div id='"+id1+"' class='perfExportPdfGraph avoidPageBreak' style='margin-top:24px;margin-bottom:24px;'></div></div>";
            appendHTMLElement(reportDiv,containerID,false);
            $("#"+graphHeaderid).empty().text(graphName);
            $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N

            if(graphsMap.graphSerialNumber!==undefined){
                $('#'+id1+'_graphSerialNumber').text(graphsMap.graphSerialNumber+'.');
              } else {
                $('#'+id1+'_graphSerialNumber').hide();
            }
            var tempheight=400;
            if(addDayInXAxis){
                timekey='dayInMonth';//NO I18N
            }
            var testObj = getZChartObjectForExport(id1,xAxisText,yAxisText,minRange,maxRange,(timekey || 'Hours'),'',{graphData:graphsForMonitor,consolidatedValues:[]},graphSettings,additionalData.isInterfaceGraph);//No I18N
            testObj.headerUnit = getUnitFortheGraph(graphsMap);
            if(format!==undefined) {
            testObj.columns.format = {"type":"SIprefix"};//NO I18N
            }
            if(needExactMinMaxInGraph) {
                hideBlinkIcon = [];
                showBlinkIcon = [];
                testObj.notes = opm_setCustomNotesExport(consolidatedValues,undefined,testObj.seriesNameVsColorCodeArray);
            }
            arrayObj.consolidatedValuesArray.push(consolidatedValues);
            arrayObj.chartobj.push(testObj);
            arrayObj.placeholder.push(id1);
            arrayObj.seriesNameVsColorCodeArray.push(testObj.seriesNameVsColorCodeArray);
            arrayObj.reportWidth = reportWidth;
            if(graphsMap.customFields!==undefined) {
                arrayObj.customFieldsArray.push(graphsMap.customFields);
                arrayObj.customFieldNamesArrayMap[id1] = graphsMap.customFieldNames;
                arrayObj.customFieldsMap[id1]=graphsMap.customFields;
            }
       });
        zChart(arrayObj);
        return;
    }
    var graphSettings = getGraphSettings(JSON.parse(additionalData.graphSettings),(('Normal' === graphReportType) ? 'reportBuilderNormal' : 'reportBuilderAverage'),additionalData.i18NKeys.noDataText);//No I18N
    arrayObj.isStackedGraph = ('Normal' === graphReportType);//No I18N
    arrayObj.isExport = true;
    arrayObj.seriesNameVsColorCodeArray = [];
    $.each(data1,function(key,val){
        data=val;
        if(val.policyName !== "AllTrafficPolicy"){
            var reportHeader;
            var graphUnit;
            if(graphReportType === 'Individual') { //No I18N
                // Multi-group Individual report: key is "Monitor - Unit - GroupName".
                // Use the full key as the header (preserves group name, mirrors UI behaviour in opmComponents.js).
                // Extract the unit from the second-to-last " - " segment so the y-axis label is correct.
                reportHeader = key;
                var lastDelimIdx = key.lastIndexOf(' - '); //No I18N
                var secondLastDelimIdx = key.lastIndexOf(' - ', lastDelimIdx - 1); //No I18N
                graphUnit = secondLastDelimIdx !== -1 ? key.slice(secondLastDelimIdx + 3, lastDelimIdx) : (lastDelimIdx !== -1 ? key.slice(lastDelimIdx + 3) : key);
            } else {
                var lastIndex = key.lastIndexOf('-');
                reportHeader = key.slice(0,lastIndex);
                if(lastIndex === -1){
                    reportHeader = key;
                }
                graphUnit = key.slice(lastIndex+1);
            }
            $.each(data,function(key1,val1){
                 if(val1.data[0]===undefined)
                {
                    return true;
                }
            temparrval=val1.data[0][2];
            if(val1.suffix !== undefined)
                {
                    unit = val1.suffix;
                }
            if(reportType!==undefined && reportType==="Interface"){
                    if(val1.unit !== undefined && val1.unit !== null){
                        graphUnit = val1.unit;
                
                    }
                }
            })
        }else{
            reportHeader = val.InterfaceDisplayName; //No I18N
        }
        count++
        id1="reportgrap_"+count;//No I18N

        var height = 'auto';//510; //NO I18N
        var marginTop = 24;
        graphHeaderid = escapeHTML(graphHeaderid)
        id1 = escapeHTML(id1)
        var graphHeaderid = 'graphHeaderid_'+count;//No I18N
        var reportDiv = "<div class='containerWidth avoidPageBreak' style='border:1px solid #ddd;border-radius:4px;margin-top:"+marginTop+"px;height:auto;'><div style='font-family:latoBold;font-size:14px;margin-top:15px;margin-left:15px' id="+graphHeaderid+"></div><div id='"+id1+"' class='perfExportPdfGraph' style='margin-top:24px;margin-bottom:24px;'></div></div>";
        appendHTMLElement(reportDiv,containerID,false);
        $("#"+graphHeaderid).empty().text(reportHeader);
        $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N

        // var tempheight=400;
		// var heightVariable = 'height';//NO I18N
		/*if(reportBuilderLegendPosition === 'bottom' && graphReportType!==undefined &&graphReportType!=='Normal') {
            var seriesNameLength = 0;
            if(data.length>0) {
            $.each(data,function(index,eachSeriesMap){
                var seriesName = eachSeriesMap.seriesname;
                    if(seriesName!==undefined) {
                seriesNameLength = seriesNameLength + (seriesName.length);
                    }
            });
            }
            tempheight = ((parseInt(seriesNameLength/(152))+1)*29)+401;
			heightVariable='containerHeight';//NO I18N
		} else {
			if(reportBuilderLegendWrap === 'true'){
				var length = 0;
				for(i=0; i<data.length;i++){
					if(data[i].seriesname!==undefined && data[i].seriesname!==null){
						length = length + data[i].seriesname.length;
					}
				}
				var tempValue = length/35;
				if(tempValue < data.length){
					tempValue = data.length;
				}else{
					tempValue+= (data.length/2);
				}
				tempheight= Math.floor(tempValue)*25;
				if(tempheight<395)
				{
					tempheight=395;
				}	
            }else{
				var heightVal = 34.12;
				tempheight=data.length*heightVal;
				if(tempheight<400)
				{
					tempheight=400;
				}
			}
		}*/
        if(val.policyName === "AllTrafficPolicy"){
             drawAtaGlanceGraph(data.graphData,id1,timeperiod,360,data.consolidatedValues,data.suffix,data.seriesNames);
        }else{
            var maxRange = null;
            var minRange = null;
            if(key.toLowerCase().indexOf("percentage")!=-1 || key.indexOf("%")!=-1 || key.toLowerCase().indexOf("utilization")!=-1){//No I18N
                maxRange=105;
                minRange = 0;
            }
            if(reportType!==undefined && reportType==="Interface"){
                minRange = 0;
            }
            var testObj = getZChartObjectForExport(id1,xAxisText,graphUnit,minRange,maxRange,(timekey || 'Hours'),'',{graphData:data,consolidatedValues:[]},graphSettings,additionalData.isInterfaceGraph);//No I18N
            testObj.columns.format = {"type":"SIprefix"};//NO I18N
            //if legend is at bottom, We should not have height variable in testObject.
			//because, when there are more than 400 instances, instances at the bottom will overlap the graph and pdf will be broken
			//this is a workaround we are making due to limitations in zoho chart(legend.maxHeight didnt work for this case)
			// testObj[heightVariable]=tempheight;
            arrayObj.seriesNameVsColorCodeArray.push(testObj.seriesNameVsColorCodeArray);
			if(unit !== "")
            {
                testObj.columns.suffix = unit;
            }
            arrayObj.chartobj.push(testObj);
                arrayObj.placeholder.push(id1);
                mappingobj[id1]=testObj;
        }
            });
            zChart(arrayObj);
}
function drawChart(data, width, height, plotOnly) {
   
    /*
     * Change plot mode to svg
     */
    
    addValue(data, "chart.plot.renderer.mode", "svg");//No I18N
    data = disableAnimation(data);

//    addValue(data, "canvas.events.onload", function() {
//        window.canvasLoded = true;
//    });
    

    /*
     * Chart Holder
     */

    var container = document.getElementById('container');
    container.style.width = width + "px";
    container.style.height = height + "px";

    /* Draw The Chart */
    var chartObj = new $ZC.charts(container, data);
    window.chartObj = chartObj;
    return chartObj
}

function getChartDetails(type) {
    if (type == null) {
        return
    }
    var chartType,
        isInt = !(isNaN(parseInt(type)));
    var chartType = {};
    chartType.value = (isInt) ? parseInt(type) : ($ZC.charttype[type.toString().toLowerCase()]);
    chartType.name = (isInt) ? $ZC.charttypenames.get(parseInt(type)) : type.toString().toLowerCase();
    return chartType;
}

function disableAnimation(data) {
    var charttype, chartdata = data.seriesdata.chartdata;
    chartdata.forEach(function(seriesdata, i) {
        charttype = chartdata[i].type || data.seriesdata.type;
        addValue(data, "chart.plot.animation.enabled", 'false');//No I18N
        addValue(data, "chart.plot.plotoptions." + getChartDetails(charttype).name + ".animation.enabled", 'false');//No I18N

    });
    return data;
}

function drawSnapshotGraph(jsonData,repname,timeperiod,policyName,period,inventorysnapType,genString,dis,module,startTime,endTime,additionalData){
    var isForecast = (module === '11');
    var tableViewTitle = 'Table View';//No I18n
    var instanceCount = jsonData.graphData.length;
    var isMultipleInstanceGraph = (instanceCount > 1);
    var isBandwidthReport = (repname === 'Interface Bandwidth');//No I18n
    var isMonitoringInterface = (inventorysnapType === 'MonitoringInterface');//No I18n
    var disclaimerId = 'disclaimerNewReport';//No I18N
    var reportName = 'Report';//No I18N
    var containerID = 'zGraphContainerClass';//No I18N
    var graphId = 'perfGraphPDF';//No I18N
    var instancePerTable = 8;
    var colModels = [];
    var colModels = [];
    var timePeriod = timeperiod;
    var htmlString = '';
    var unit = '';
    var unitText = '';
    var xTitle = jsonData.xyTitles !== undefined ? jsonData.xyTitles[0] : '';
    var yTitle = jsonData.xyTitles !== undefined ? jsonData.xyTitles[1] : '';
    var maxRange = null;
    var minRange = null;
    var chartObj = {};
    var arrayObj = {placeholder:[],chartobj:[]};
    var reportWidth = ($('#zchartgraph').width())+55;
    window.OPM = {};
    window.OPM.pattern='d MMM yyyy hh:mm:ss a z';//No I18N
    window.OPM.severTimeZone = 'exportPDF';//No I18N

    if(jsonData.graphSettings === undefined){
        jsonData.graphSettings = '{}';
    }
    if(jsonData.thresholds === undefined){
        jsonData.thresholds = '{}';
    }
    var graphSettings = getGraphSettings(JSON.parse(jsonData.graphSettings),((policyName === 'Hardware') ? 'Hardware' : 'monitorGraphs'),additionalData.i18NKeys.noDataText);//No I18N
    var enableGroupedGrid = (graphSettings.tableViewGroupingOnExport && !isForecast);
    if(repname !== undefined && repname !== '' && repname !== null && repname !== 'null'){
        reportName = repname;
    }
    if(timePeriod !== undefined){
        if(startTime !== undefined && endTime !== undefined){
            timePeriod += '['+startTime+' - '+endTime+']';
        }
    }
    $('#'+disclaimerId).empty();
    if(dis !==undefined && dis !== '' && dis !== null && dis !== 'null'){
        $('#'+disclaimerId).text(dis);
    }else{
        $('#'+disclaimerId).hide();
    }

    if(isMonitoringInterface){
        if(jsonData.suffix !== undefined){
            unit = jsonData.suffix;
        }
        if(jsonData.interfaceDetails !== undefined || jsonData.interfaceDetails !== null){
            setAdditionalHeaders(jsonData.interfaceDetails);
        }
    }

    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $(".newDSPReport").empty();

    setHeaders(reportName,timePeriod,additionalData,jsonData,isForecast);
    graphId = escapeHTML(graphId)
    htmlString = "<div id="+graphId+" class='perfExportPdfGraph perfExportPdfGraphContainer'></div>";
    if(jsonData.lookval !== undefined){
        htmlString += createGridTableWithContainer('lookupTableHolder',additionalData.i18NKeys.lookUpValues,'lookupData');//No I18N
    }
    if(jsonData.consolidatedValues !== undefined && Object.keys(jsonData.consolidatedValues).length){
        htmlString += createGridTableWithContainer('consolidatedDataHolder',additionalData.i18NKeys.summary,'consolidatedData');//No I18N
    }
    htmlString += createGridTableWithContainer('tableDataHolder',((enableGroupedGrid && isMultipleInstanceGraph && !isBandwidthReport) ? tableViewTitle : undefined));//No I18N
    $('.'+containerID).empty();
    appendHTMLElement(htmlString,containerID,true);
    $('.'+containerID).css({width:reportWidth+'px'});//No I18N

    if(yTitle !== '' && (yTitle.toLowerCase().indexOf('percentage') !== -1  || yTitle.toLowerCase().indexOf('utilization') !== -1 || yTitle.indexOf('%') !== -1)){
        maxRange = 105;
        minRange = 0;
    }
    maxRange = (jsonData.exactMaxRange !== undefined && jsonData.exactMaxRange !== '') ? jsonData.exactMaxRange : maxRange;

    if(policyName === 'packetLoss'){//No I18N
        xTitle = 'Time';//No I18N
    }else if(policyName === 'MerakiUplinkUsage' && jsonData.suffix !== undefined){//No I18n
        unit = jsonData.suffix;
    }

    chartObj = getZChartObjectForExport(graphId,xTitle,yTitle,minRange,maxRange,period,'',{graphData:jsonData.graphData,consolidatedValues:jsonData.consolidatedValues},graphSettings,isMonitoringInterface);
    
    if(unit !== undefined && unit !== ''){
        chartObj.columns.suffix = unit;
    }
    chartObj.headerUnit = getUnitFortheGraph(jsonData);

    unitText = (!isMonitoringInterface) ? '<i style="font-family:LatoRegular">'+chartObj.headerUnit+'</i>' : '';//No I18N
    arrayObj.thresholds = JSON.parse(jsonData.thresholds);
    arrayObj.i18NKeys = additionalData.i18NKeys;
    arrayObj.chartobj.push(chartObj);
    arrayObj.placeholder.push(graphId);
    arrayObj.reportWidth = reportWidth;
    if(jsonData.consolidatedValues !== undefined){
        if(isMonitoringInterface){
            var newConsolidatedValues = [];
            $.each(jsonData.consolidatedValues,function(seriesName,seriesData){
                newConsolidatedValues.push(seriesData);
            });
            jsonData.consolidatedValues = newConsolidatedValues;
        }
        if(jsonData.exactMaxRange !== undefined && jsonData.exactMaxRange !== ""){
            if(jsonData.seriesNames !== undefined){
                chartObj.notes = opm_setCustomNotesExport(jsonData.consolidatedValues,jsonData.seriesNames);
            }else{
                chartObj.notes = opm_setCustomNotesExport(jsonData.consolidatedValues);
            }
        }
        arrayObj.consolidatedValues = jsonData.consolidatedValues;
        arrayObj.showLegendinTable = true;
    }else{
        arrayObj.showLegendinTable = false;
        arrayObj.chartobj[0].legend.enable = true;
    }
    arrayObj.seriesNameVsColorCodeArray = chartObj.seriesNameVsColorCodeArray;

    arrayObj.graphSeries = [];
     if(jsonData.seriesNames !== undefined)
    {
        arrayObj.graphSeries = jsonData.seriesNames;
    }
    arrayObj.isMonitoringInterface = isMonitoringInterface;
    zChart(arrayObj);
    var nullColumnIndex = 1,skipNullData = true;

    if(isForecast){
        colNames =[additionalData.i18NKeys.dateAndTime,additionalData.i18NKeys.value+unitText];
        if(isMonitoringInterface){
            colModels = [{ name: 3, index: 3 ,sortable:true},{ name: 2, index: 2}];
            nullColumnIndex = 2;
        }else{
            colModels = [{ name: 2, index: 2 ,sortable:true,width:60},{ name: 1, index: 1,width:40}];
        }
    }else{
        var val = 0;
        if(jsonData.graphData[0] !== undefined){
            var le = jsonData.graphData[0].data[0];
            val = le[0].length-1;
        }
        colNames = [additionalData.i18NKeys.dateAndTime,additionalData.i18NKeys.value+unitText];
        colModels = [{ name: val, index: val ,sortable:true,width:60},{ name: (val-1), index: (val-1),width:40}];
        nullColumnIndex = val-1;
    }

    if(isBandwidthReport){
        if(jsonData !== undefined && jsonData.graphData !== undefined && jsonData.graphData[0] !== undefined){
            skipNullData = false;
            /** Showing Raw data for Interface's Bandwidth export */
            if(jsonData.graphData[0].isRaw){
                colNames = [additionalData.i18NKeys.dateAndTime,additionalData.i18NKeys.value];
                colModels = [{name:val,index:val,sortable:true},{name:(val-1),index:(val-1)}];
            }else{
                /** Showing Min,Max and Avg value for Interface's Bandwidth export */
                colNames = [additionalData.i18NKeys.dateAndTime,additionalData.i18NKeys.min,additionalData.i18NKeys.max,additionalData.i18NKeys.avg];
                colModels = [{name:val,index:val,sortable:true},{name:(val-2),index:(val-2)},{name:(val-1),index:(val-1)},{name:(val-3),index:(val-3)}];
            }
            var defaultOptions = {"sortName":"0","sortOrder":"desc","skipNullData":skipNullData,"nullColumnIndex":nullColumnIndex};//No I18N
            if(jsonData.graphData[0].data !== undefined){
                $.each(jsonData.graphData, function(key, val){
                    if(val.seriesname !== undefined && val.seriesname.indexOf("95th") === -1 && val.data.length > 0){
                        var pageWidth = $('.newPDFReport').width() - 24;
                        var tableWidth = (pageWidth/2);
                        tableViewTitle = escapeHTML(tableViewTitle)
                        appendHTMLElement('<div class="summary-data avoidPageBreak" style="width:'+tableWidth+'px;float:left;margin-bottom:12px;"><div><strong style="font-family:latoBold;font-size:14px;margin-bottom:12px">'+((key === 0) ? tableViewTitle : (key === 1) ? "&nbsp;" : '')+'</strong></div></br><div><span class="size9 inline-block mr-xs" style="background:'+arrayObj.seriesNameVsColorCodeArray[jsonData.graphData[key].seriesname]+'"></span><strong style="font-family:latoBold;font-size:14px;margin-bottom:12px">'+val.seriesname+'</strong></div><div class="opm_jqGridUI opmReportsGridview" style="float:left;width:'+tableWidth+'px;margin-top:12px;"><table id="tableData_'+key+'" style="float:left;width:'+tableWidth+'px"><tr><td></td></tr></table></div></div>','tableDataHolder',true);
                        arrayObj.seriesNameVsColorCodeArray[jsonData.graphData[key].seriesname] = escapeHTML(arrayObj.seriesNameVsColorCodeArray[jsonData.graphData[key].seriesname])
                        val.seriesname = escapeHTML(val.seriesname)
                        
                        pdf_loadJQgridWithData('#tableData_'+key,val.data[0],colNames,colModels,val.seriesname,'','monitorsSummary',defaultOptions);//No I18N
                    }
                });
            }
            if(chartObj.isCustomLegendEnabled){
                opm_drawLegendForStackedGraph(graphId,arrayObj.seriesNameVsColorCodeArray);
            }
            $('.ui-jqgrid-titlebar').hide();
        }
        return;
    }

    var defaultOptions = {"sortName":"0","sortOrder":"desc","skipNullData":false,"nullColumnIndex":nullColumnIndex};//No I18N
    if(jsonData.lookval !== undefined){
        var lookupArray = [];
        $.each(jsonData.lookval,function(key,value){
            lookupArray.push({key:key,value:((jsonData.lookupType === '2' && value === 'others') ? 'Others (Other then configured value(s))' : value)});//No I18N
        });
        pdf_loadJQgridWithData("#lookupData",lookupArray,[additionalData.i18NKeys.value,additionalData.i18NKeys.description],[{name:'key',index:'key'},{name:'value',index:'value'}],'Lookup Values','','',{multiselect:false,minRowsPerPage:100,Search:false,hideCSV:true,hideExcel:true});//No I18N
        $('#lookupData').jqGrid('setGridWidth',(reportWidth));//No I18n
    }
    if(jsonData !== undefined && jsonData.graphData !== undefined && jsonData.graphData.length && jsonData.graphData[0].data !== undefined){
        if(!isMultipleInstanceGraph){
            $.each(jsonData.graphData, function(key, val){
                if(val.seriesname !== undefined && val.seriesname.indexOf("95th") === -1 && val.data.length > 0){
                    colNames[1] = '<div class="fs14 mb-xs"><span class="size9 inline-block mr-xs" style="background:'+arrayObj.seriesNameVsColorCodeArray[escapeHTML(jsonData.graphData[key].seriesname)]+'"><strong></strong></span><strong>'+escapeHTML(val.seriesname)+unitText+'</strong></div>';//No I18N
                    appendHTMLElement(createGridTableWithContainer('summary-data',tableViewTitle,'tableData_0'),'tableDataHolder',true);//No I18N
                    pdf_loadJQgridWithData('#tableData_0',val.data[0],colNames,colModels,escapeHTML(val.seriesname),'','monitorsSummary',defaultOptions); //No I18N
                    $('#tableData_0').jqGrid('setGridWidth',(reportWidth));//No I18n
                }
            });
        }else{
            if(enableGroupedGrid){
                var currentTableIndex = 0;
                var gridData = [];
                var timestampData = [];
                var dateIndex = (inventorysnapType === 'MonitoringInterface' ? 3 : 2);//No I18N
                var modDataIndex = (inventorysnapType === 'MonitoringInterface' ? 2 : 1);//No I18N
                var highestWidth = 250;
                var duplicateEntries = [];
                colNames = [additionalData.i18NKeys.dateAndTime];
                colModels = [{name:'dateAndTime',index:'dateAndTime',width:250,frozen:true}];//No I18N
                defaultOptions = {sortName:"0",sortOrder:"desc",shrinkToFit:true};//No I18N
                /*Duplicate data need to displayed in the grouped grid*/
                $.each(jsonData.graphData,function(key,instanceDetails){
                    $.each(instanceDetails.data[0],function(dataIndex,dataValue){
                        if(dateIndex === 3 && dataValue[dateIndex] === undefined){
                            dateIndex -=1;
                            modDataIndex -=1;
                        }
                        if(timestampData.indexOf(dataValue[dateIndex]) < 0){
                            gridData.push({dateAndTime:dataValue[dateIndex]});
                            timestampData.push(dataValue[dateIndex]);
                        }else if((dataIndex !== 0) && (dataValue[dateIndex] === instanceDetails.data[0][dataIndex-1][dateIndex])){
                            var arrIndex = duplicateEntries.map(function(obj){return obj.key;}).indexOf(dataValue[dateIndex]);
                            if(arrIndex > -1){
                                if(duplicateEntries[arrIndex][instanceDetails.seriesname]){
                                    duplicateEntries[arrIndex][instanceDetails.seriesname]++;
                                }else{
                                    duplicateEntries[arrIndex][instanceDetails.seriesname] = 1;
                                }
                            }else{
                                var duplicateData = {key:dataValue[dateIndex]};
                                duplicateData[instanceDetails.seriesname] = 1;
                                duplicateEntries.push(duplicateData);
                            }
                        }
                    });
                });
                if(duplicateEntries.length){
                    var mostCount = 0;
                    $.each(duplicateEntries,function(index,timeObj){
                        $.each(timeObj,function(key,value){
                            if(key !== 'key' && (value > mostCount)){
                                mostCount = value;
                            }
                        });
                        for(var i=1; i<=mostCount; i++){
                            var timestampDataIndex = timestampData.indexOf(timeObj.key);
                            timestampData.splice((timestampDataIndex+i),0,timeObj.key);
                            gridData.splice((timestampDataIndex+i),0,{dateAndTime:timeObj.key});
                        }
                        mostCount = 0;
                    });
                }
                /**/

                $.each(jsonData.graphData,function(key,instanceDetails){
                    if(instanceDetails.seriesname !== undefined && instanceDetails.seriesname.indexOf("95th") === -1 && instanceDetails.data.length > 0){
                        var valueKey = 'polledValue_'+key;//No I18N
                        colNames.push('<div class="fs14 mb-xs"><span class="size9 inline-block mr-xs" style="background:'+arrayObj.seriesNameVsColorCodeArray[escapeHTML(instanceDetails.seriesname)]+'"><strong></strong></span><strong>'+escapeHTML(instanceDetails.seriesname)+unitText+'</strong></div>');//No I18N
                        var colWidth = (instanceDetails.seriesname.length + (chartObj.headerUnit).length) * 12;
                        colWidth = colWidth > 100 ? colWidth : 100;
                        highestWidth = ((highestWidth > colWidth) ? highestWidth : colWidth);
                        colModels.push({name:valueKey,index:valueKey,width:colWidth});
                        var duplicateIndex = 0;
                        $.each(instanceDetails.data[0],function(dataIndex,dataValue){
                            var currentIndex = timestampData.indexOf(dataValue[dateIndex]);
                            if(currentIndex > -1){
                                var currentValue = gridData[currentIndex][valueKey];
                                var currentData = (dataValue[modDataIndex] !== undefined ? dataValue[modDataIndex] : dataValue[1]);
                                if(currentValue === undefined){
                                    gridData[currentIndex][valueKey] = currentData;
                                    duplicateIndex = 0;
                                }else{
                                    gridData[currentIndex + (++duplicateIndex)][valueKey] = currentData;
                                }
                            }
                        });
                        if(((key+1)%instancePerTable === 0)|| key === (instanceCount -1)){
                            if(highestWidth > 250){
                                colModels[0].width = 350;
                            }
                            appendHTMLElement('<div class="opm_jqGridUI opmReportsGridview containerWidth" style="padding:10px 0px 40px 0px"><table id="tableData_'+currentTableIndex+'" class="containerWidth"><tr><td></td></tr></table></div>','tableDataHolder',true);
                            pdf_loadJQgridWithData('#tableData_'+currentTableIndex,gridData,colNames,colModels,'','','monitorsSummary',defaultOptions); //No I18N
                            $('#tableData_'+currentTableIndex).jqGrid('setGridWidth',(reportWidth));//No I18n
                            highestWidth = 250;
                            colNames = [additionalData.i18NKeys.dateAndTime];
                            colModels = [{name:'dateAndTime',index:'dateAndTime',width:250,frozen:true}];//No I18N
                            currentTableIndex++;
                        }
                    }
                });
            }else{
                var totalTables = (jsonData.graphData[0].data.length > 0 && jsonData.graphData[0].data[0][0].length > 0 && jsonData.graphData[1].data.length > 0 && jsonData.graphData[1].data[0][0].length > 0) ? 2 :1;
                var htmlElement = '';
                $.each(jsonData.graphData, function(key, val){
                    if(val.seriesname !== undefined && val.seriesname.indexOf("95th") === -1 && val.data.length > 0 && val.data[0][0].length > 0){
                        var pageWidth = $('.newPDFReport').width() - 24;
                        var tableWidth = (pageWidth/totalTables);
                        colNames[1] = '<div class="fs14 mb-xs"><span class="size9 inline-block mr-xs" style="background:'+arrayObj.seriesNameVsColorCodeArray[escapeHTML(jsonData.graphData[key].seriesname)]+'"><strong></strong></span><strong>'+escapeHTML(val.seriesname)+unitText+'</strong></div>';//No I18N
                        if(totalTables === 1){
                            htmlElement = createGridTableWithContainer('summary-data',tableViewTitle,('tableData_'+key));//No I18N
                        }else{
                            tableViewTitle = escapeHTML(tableViewTitle);
                            htmlElement = '<div class="summary-data" style="width:'+tableWidth+'px;float:left;margin-bottom:24px;"><div><strong style="font-family:latoBold;font-size:14px;margin-bottom:12px">'+((key === 0) ? tableViewTitle : (key === 1) ? "&nbsp;" : '')+'</strong></div><div class="opm_jqGridUI opmReportsGridview" style="float:left;width:'+tableWidth+'px;margin-top:12px;"><table id="tableData_'+key+'" style="float:left;width:'+tableWidth+'px"><tr><td></td></tr></table></div></div>';//No I18n
                        }
                        appendHTMLElement(htmlElement,'tableDataHolder',true);//No I18N
                        pdf_loadJQgridWithData('#tableData_'+key,val.data[0],colNames,colModels,escapeHTML(val.seriesname),'','monitorsSummary',defaultOptions); //No I18N
                        if(totalTables === 1){
                            $('#tableData_'+key).jqGrid('setGridWidth',(reportWidth));//No I18n
                        }
                    }
                });
                if(instanceCount === 2){
                    $('#gbox_perfGraph_MMA1').css({left:'260px'});
                }
            }
        }
        if(chartObj.isCustomLegendEnabled){
            opm_drawLegendForStackedGraph(graphId,arrayObj.seriesNameVsColorCodeArray);
        }
    }
    $('.ui-jqgrid-titlebar').hide();
}
// function convertDateAndTime(cellValue, options, rowdata, action) {
//     var d=new Date(cellValue)
//     var month=parseInt(d.getMonth())+1;
//     var dateString=d.getDate()+"-"+month+"-"+d.getFullYear()+" "+d.getHours()+":"+(d.getMinutes()<10?'0':'') + d.getMinutes()
//     return dateString;
// }
function opm_drawMMAValuesEnhancedGraph(yaxis,consolidatedValues,chartID,legColors,series,arrayObj,isReportBuilder,graphIndex){
    var threshold_obj = {values:[],colors:[],labels:[]};
    var consolidatedModData = [];
    var show95thPercentile = arrayObj.chartobj[0].show95thPercentile;
    var i18NKeys = arrayObj.i18NKeys;
    var gridId = 'consolidatedData';//No I18N
    if(isReportBuilder){
        gridId = chartID+'_consolidatedData';//No I18N
    }else{
         graphIndex = 0;
    }
    var unitText = !arrayObj.isMonitoringInterface ? '<i style="font-family:LatoRegular">'+arrayObj.chartobj[graphIndex].headerUnit+'</i>' : '';//No I18N
    var getLegendColor = function(cellValue, options, rowdata, action){
        return "<span class='size9 inline-block' style='background-color:"+rowdata.legColor+"'/></span><span style='padding-left:5px'>"+escapeHTML(rowdata.seriesName)+"</span>";
    }
    var colNames = [i18NKeys.name,i18NKeys.min+unitText,i18NKeys.max+unitText,i18NKeys.avg+unitText,''];
    var colModel = [{name:'seriesName',index:'seriesName',formatter:getLegendColor,width:40},{name:'minVal',index:'minVal',width:15},{name:'maxVal',index:'maxVal',width:15},{name:'avgVal',index:'avgVal',width:15},{name:'legColor',index:'legColor',hidden:true}];//No I18N
    if(show95thPercentile){
        if(arrayObj.isMonitoringInterface){
            colNames.push(i18NKeys['95thPercentile']+' '+i18NKeys.avg,i18NKeys['95thPercentile']+' '+i18NKeys.value);//No I18N
            colModel.push({name:'95thperc',index:'95thperc',width:15},{name:'95thpercentileValue',index:'95thpercentileValue',width:15});//No I18N
        }else{
            colNames.push(i18NKeys['95thPercentile']+unitText);
            colModel.push({name:'95thperc',index:'95thperc',width:15});
        }
    }
    if(Object.keys(consolidatedValues).length > 0){
        var legColor = '';
        $.each(consolidatedValues,function(key,instanceDetails){
            if(!isReportBuilder){
                if(show95thPercentile){
                    if(instanceDetails['95thpercVal'] !== undefined){
                        var thresh_lineVal = Number(instanceDetails['95thpercVal']);
                        if(thresh_lineVal !== 0){
                            threshold_obj.values.push(thresh_lineVal);
                            threshold_obj.colors.push("#0088f5");//No I18N
                            threshold_obj.labels.push('95th ('+instanceDetails.seriesName+')');//No I18N
                        }
                    }
                }
                legColor = arrayObj.seriesNameVsColorCodeArray[instanceDetails.seriesName];
            }else{
                legColor = arrayObj.seriesNameVsColorCodeArray[graphIndex][instanceDetails.seriesName];
            }
            var currentData = {seriesName:instanceDetails.seriesName,minVal:instanceDetails.minVal,maxVal:instanceDetails.maxVal,avgVal:instanceDetails.avgVal,'95thperc':instanceDetails['95thperc'],legColor:legColor};//No I18N
            if(arrayObj.isMonitoringInterface){
                currentData['95thpercentileValue'] = instanceDetails['95thpercentileValue'];//No I18N
            }
            consolidatedModData.push(currentData);
        });
        if(!isReportBuilder){
            if(arrayObj.chartobj[graphIndex].showThresholdLines && arrayObj.thresholds !== undefined && Object.keys(arrayObj.thresholds).length){
                $.each(arrayObj.thresholds,function(objKey,objValue){
                    threshold_obj.values.push(objValue.value);
                    threshold_obj.colors.push(objValue.colorCode);
                    threshold_obj.labels.push(objValue.i18nText);
                });
            }
        }
        pdf_loadJQgridWithData('#'+gridId,consolidatedModData,colNames,colModel,'','','monitorsSummary',{multiselect:false,minRowsPerPage:500,Search:false,hideCSV:true,hideExcel:true});//No I18N
        if(!isReportBuilder){
            $('#'+gridId).jqGrid('setGridWidth',(arrayObj.reportWidth));//No I18n
        }else{
            $('#'+gridId).jqGrid('setGridWidth',(arrayObj.reportWidth-20));//No I18n
        }
    }
    if(!isReportBuilder){
        yaxis.threshold = {
            line:{
                show:true,values:threshold_obj.values,color:threshold_obj.colors,dashStyle:'1',
                label:{text:threshold_obj.labels,hAlign:'left',fontColor:'rgb(97, 97, 97)',fontSize:10,'font-family':'LatoRegular'},//No I18N
                events:{enabled:false}
            }
        };
    }
}
function opm_drawMMAValuesEnhancedGraphTable(consolidatedValues,chartID,isExport,seriesNameVsColorCodeMap,arrayObj){
    if(Object.keys(consolidatedValues).length > 0){
        var i18NKeys = arrayObj.i18NKeys;
        i18NKeys.name = escapeHTML(i18NKeys.name)
        i18NKeys.minimum = escapeHTML(i18NKeys.minimum)
        i18NKeys["95thPercentile"] = escapeHTML(i18NKeys["95thPercentile"])
        i18NKeys.value = escapeHTML(i18NKeys.value)

        var htmlElement = "<div class='graph_export_min-max-tableView avoidPageBreak'><div class='graph_export_min-max-table-body'><div class='graph_export_min-max-table-header'><div>"+i18NKeys.name+"</div>";//No I18N
        htmlElement += "<div>"+i18NKeys.minimum+"</div><div>"+i18NKeys.maximum+"</div><div>"+i18NKeys.average+"</div><div>"+i18NKeys['95thPercentile']+'&nbsp;'+i18NKeys.value+"</div></div>";//No I18N
        $.each(consolidatedValues,function(index,insData){
            var seriesName = escapeHTML(insData.seriesName);
            insData.minVal = escapeHTML(insData.minVal)
            insData.maxVal = escapeHTML(insData.maxVal)
            insData.avgVal = escapeHTML(insData.avgVal)
            insData["95thpercentileValue"] = escapeHTML(insData["95thpercentileValue"])
            seriesNameVsColorCodeMap[insData.seriesName] = escapeHTML(seriesNameVsColorCodeMap[insData.seriesName])
            htmlElement += "<div><div title='"+seriesName+"'><div class='size9 inline-block' style='background-color:"+seriesNameVsColorCodeMap[insData.seriesName]+"'></div>";//No I18N
            htmlElement += "<span style='padding-left:5px'>"+seriesName+"</span></div><div title="+insData.minVal+">"+insData.minVal+"</div>";//No I18N
            htmlElement += "<div title="+insData.maxVal+">"+insData.maxVal+"</div><div title="+insData.avgVal+">"+insData.avgVal+"</div>";//No I18N
            htmlElement += "<div title="+insData['95thpercentileValue']+"}}>"+insData['95thpercentileValue']+"</div></div>";//No I18N
        });
        htmlElement += "</div></div>";//No I18N
        appendHTMLElement(htmlElement,chartID,false);
    }
}
function opm_drawLegendForStackedGraph(chartID,seriesNameVsColorCodeMap){
    var htmlElement = "<ul class='customLegSeries'>";//No I18N
    $.each(seriesNameVsColorCodeMap,function(key,value){
        if(key === 'undefined' || !key){
            key = '';
        }else if(key === '__AVAILABILITY__'){//No I18N
            return true;
        }
        value = escapeHTML(value)
        htmlElement += "<li><div class='size9 inline-block' style='background-color:"+value+"'></div><span style='padding-left:5px'>"+escapeHTML(key)+"</span></li>";//No I18N
    });
    if(htmlElement !== "<ul class='customLegSeries'>"){
        htmlElement += "</ul>";//No I18N
        appendHTMLElement(htmlElement,chartID,false);
    }
}

function opm_drawMMAValues(yaxis,consolidatedValues,chartID,legColors,series,arrayObj)
{
    var threshold_obj = {values:[],colors:[],labels:[]};
    if(Object.keys(consolidatedValues).length > 0)
    {
        $('#opmRamUsageInfo').empty();
        chartID = escapeHTML(chartID);
        $("#"+chartID).append('<div class="opmRamUsageInfoHolder" style="margin-top:50px;"><div class="opmRamUsageInfoContainer" id="'+chartID+'_opmRamUsageInfoContainer"></div></div>');
        $.each(consolidatedValues,function(key,instanceDetails)
        {
            if(instanceDetails['95thpercVal'] !== undefined)
            {
                 var thresh_lineVal = Number(instanceDetails['95thpercVal']);
                if(thresh_lineVal > 0)
                {
                    threshold_obj.values.push(thresh_lineVal);
                    threshold_obj.colors.push("#ef7e7d");//No I18N
                    threshold_obj.labels.push("95th");//No I18N
                }
            }
            if(instanceDetails['95thpercentileValue'] !== undefined)
            {
                   if(instanceDetails.legendType !== undefined && instanceDetails.legendType === "intfGraph")  
                   {
                     var colorIndx = (series !== undefined ? series.indexOf(instanceDetails.seriesName) : -1);
                   }
                   else{
                     var colorIndx = (series !== undefined ? series.indexOf(key) : -1);
                    }
                   var color = "#262626";//No I18N
                   if(colorIndx !== -1 && legColors !== undefined && legColors.length > 0)
                    {
                        color = legColors[colorIndx];
                    }
                    var nanVal = "N/A";//No I18N
                    var minVal = (instanceDetails.minVal!==undefined?instanceDetails.minVal:nanVal);
                    var maxVal = (instanceDetails.maxVal!==undefined?instanceDetails.maxVal:nanVal);
                    var avgVal = (instanceDetails.avgVal!==undefined?instanceDetails.avgVal:nanVal);
                    var percAvg = (instanceDetails['95thperc']!==undefined?instanceDetails['95thperc']:nanVal);
                    var percVal = instanceDetails['95thpercentileValue'];
                    nanVal = escapeHTML(nanVal);
                    minVal = escapeHTML(minVal);
                    maxVal = escapeHTML(maxVal);
                    avgVal = escapeHTML(avgVal);
                    percAvg = escapeHTML(percAvg);
                    percVal = escapeHTML(percVal);
                    color = escapeHTML(color);
                    if($("#"+chartID+"_opmRamUsageInfoContainer .opmDivTableFormate .tHdr").length >= 1)
                    {
                       $("#"+chartID+"_opmRamUsageInfoContainer").addClass("legendType2");
                        var MMAUsageInfo = "<div class='opmDivTableFormate legendType'><div><div style='color:"+color+"'>"+escapeHTML(instanceDetails.seriesName)+"</div><div>"+minVal+"</div><div>"+maxVal+"</div><div>"+avgVal+"</div><div>"+percAvg+"</div><div>"+percVal+"</div></div></div>"; //No I18n
                    }
                    else
                    {
                        var MMAUsageInfo = "<div class='opmDivTableFormate legendType'><div class='tHdr'><div> </div><div>Min</div><div>Max</div><div>Avg</div><div>95th PercAvg</div><div>95th PercVal</div></div><div><div style='color:"+color+"'>"+escapeHTML(instanceDetails.seriesName)+"</div><div>"+minVal+"</div><div>"+maxVal+"</div><div>"+avgVal+"</div><div>"+percAvg+"</div><div>"+percVal+"</div></div></div>"; //No I18n
                    }
            } 
            else
            {
                    var legend = "";//No I18N
                    if(arrayObj.showLegendinTable)
                    {
                        var color = arrayObj.seriesNameVsColorCodeArray[0][instanceDetails.seriesName];
                        color = escapeHTML(color);
                        legend = "<span style='background-color:"+color+"'/></span>"//No I18N
                    }
                   Object.keys(instanceDetails).forEach(function (key) {
                        if (typeof instanceDetails[key] === 'string' || typeof instanceDetails[key] === 'number') {
                            instanceDetails[key] = escapeHTML(instanceDetails[key]);
                        }
                    });
                var MMAUsageInfo =   '<div class="opmRamUsageInfo" id="opmRamUsageInfo">'+legend+'<span class="ramheader">'+escapeHTML(instanceDetails.seriesName)+' -</span> <span>Min: '+instanceDetails.minVal +'</span><span>  Max: '+instanceDetails.maxVal +'</span><span>   Avg: '+instanceDetails.avgVal +'</span><span>   95thperc: '+instanceDetails['95thperc']+'</span></div>'; //No I18n
            }
            $("#"+chartID+"_opmRamUsageInfoContainer").append(MMAUsageInfo);
        });
    }
     yaxis.threshold = {
        "line": {//No I18N
            "show": true,//No I18N
            "values": threshold_obj.values,//No I18N
            "color": threshold_obj.colors,//No I18N
            "dashStyle":"1",//No I18N
            "label": {//No I18N
                "text": threshold_obj.labels,//No I18N
                "hAlign": "left",//No I18N
                "fontColor": "rgb(97, 97, 97)",//No I18N
                "fontSize":10,//No I18N
                "font-family": "LatoRegular"//No I18N
            },
            "events": {//No I18N
                "enabled": false//No I18N
            }
        }
    }
}
//Common to all the availabilty pages (Including Monitors -> process, service, windows service, ad,exchange,mssql service)
function drawAvailabilityGraph(jsonData,additionalData){
    var count = 0;
    var arrayObj = {placeholder:[],chartobj:[],seriesNameVsColorCodeArray:[],isStackedGraph:false,isExport:true};
    var mappingobj = {};
    var disclaimerId = 'disclaimerNewReport';//No I18N
    var containerID = 'zGraphContainer';//No I18N
    var reportName = additionalData.reportName || 'Report';//No I18N
    var timePeriod = 'Today';//No I18N
    var graphSettings = getGraphSettings(JSON.parse(additionalData.graphSettings),'processService',additionalData.i18NKeys.noDataText);//No I18N
    var reportWidth = ($('#zchartgraph').width())+55;
    var htmlString = '';
    var height = 'auto';//No I18N
    var marginTop = 24;
    var isOutageAvailable = false;
    var graphData = {};
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    var createHTMLElement = function(graphHeaderId,graphId,graphHeader,graphIndex){
        marginTop = 24;
        if(graphIndex !== undefined && graphIndex === 0 && isOutageAvailable){
            marginTop = 6;
        }
        appendHTMLElement("<div class='containerWidth avoidPageBreak' style='border:1px solid #ddd;border-radius:4px;margin-top:"+marginTop+"px;height:"+height+"px;'><div style='font-family:latoBold;font-size:14px;margin-top:15px;margin-left:15px' id="+graphHeaderId+"></div><div id='"+graphId+"' class='perfExportPdfGraph' style='margin-top:24px;margin-bottom:24px;'></div></div>",containerID,false);
        $("#"+graphHeaderId).empty().text(graphHeader);
        $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N
    }

    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $('.newDSPReport').empty();
    
    $('#'+disclaimerId).empty();
    if(additionalData.dis && additionalData.dis !== 'null'){
        $('#'+disclaimerId).text(additionalData.dis);
    }else{
        $('#'+disclaimerId).hide();
    }
    $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N
    
    if(additionalData.tableData !== undefined){
        setAdditionalHeaders(additionalData.tableData);
    }

    if(jsonData !== undefined && jsonData.outageHistoryMap !== undefined && jsonData.outageHistoryMap.timeRange !== undefined){
        timePeriod = jsonData.outageHistoryMap.timeRange;
        if(jsonData.outageHistoryMap.fromTime !== undefined && jsonData.outageHistoryMap.toTime !== undefined){
            timePeriod += " ( "+jsonData.outageHistoryMap.fromTime+" - "+jsonData.outageHistoryMap.toTime+" )";
        }
    }

    setHeaders(reportName,timePeriod,additionalData,additionalData,false);

    if(jsonData !== undefined){
        var xTitle = jsonData.translatedKeys.time !== undefined ? jsonData.translatedKeys.time : 'Time';//No I18N
        var chartObj = {};
        isOutageAvailable = (jsonData.outageHistoryMap !== undefined && jsonData.outageHistoryMap.stateHistoryProps !== undefined && jsonData.outageHistoryMap.stateHistoryProps.length);
        graphSettings.graphHeight = 400;
        if(jsonData.Availability !== undefined){
            var graphId = 'availPieChart';//No I18n
            createHTMLElement(graphId+'Header',graphId,(jsonData.translatedKeys.availability || 'Availability'));//No I18n
            chartObj = getZChartPropsForPieChart(jsonData.Availability,{graphId:graphId,graphHeight:400},true);
            chartObj.seriesNameVsColorCodeArray = {};
            zChart({chartobj:[chartObj],placeholder:[graphId]});
        }
        //Availability statistics/history graph - due to consolidated data, it's rendered separately
        if(jsonData.availGraphData !== undefined){
            var graphId = 'availStatGraph';//No I18n
            createHTMLElement('availStatGraphHeader',graphId,(jsonData.translatedKeys.availStat || reportName));//No I18n
            if('Availability History' === reportName){
                var period = availTimeFormat[jsonData.outageHistoryMap.timeRange];
                chartObj = getZChartObjectForExport(graphId,xTitle,'',null,null,period,'',{graphData:jsonData.availGraphData,consolidatedValues:[]},graphSettings,false);//No I18N;
                chartObj.type = 'line';//No I18N
                chartObj.columns.format = {customFormat: function(value){return opm_AvailGraphValueToString(value);}};
                if(jsonData.uptimeData !== undefined){
                    createHTMLElement('uptimeStatGraphHeader','availUptimeContent','Uptime Statistics');//No I18n
                    opm_drawAvailHBarChart("#availUptimeContent",jsonData.uptimeData); //No I18n
                }
            }else{
                chartObj = getZChartPropsForBarChart('Period','Percentage',jsonData.availGraphData,{graphId:graphId,graphHeight:400},true);//No I18N
            }
            zChart({chartobj:[chartObj],placeholder:[graphId]});
        }
        if(jsonData.histAvailGraphData!==undefined )
        {
            graphId = 'availHistGraph';//No I18n
            createHTMLElement('availHistGraphHeader',graphId,(jsonData.translatedKeys.availHist || reportName));//No I18n
            var period = availTimeFormat[jsonData.outageHistoryMap.timeRange];
            chartObj = getZChartObjectForExport(graphId,xTitle,'',null,null,period,'',{graphData:jsonData.histAvailGraphData,consolidatedValues:[]},graphSettings,false);//No I18N;
            chartObj.type = 'line';//No I18N
            chartObj.columns.format = {customFormat: function(value){return opm_AvailGraphValueToString(value);}};
            if(jsonData.uptimeData !== undefined){
                createHTMLElement('uptimeStatGraphHeader','availUptimeContent','Uptime Statistics');//No I18n
                opm_drawAvailHBarChart("#availUptimeContent",jsonData.uptimeData); //No I18n
            }
            zChart({chartobj:[chartObj],placeholder:[graphId]});
        }
        if(isOutageAvailable){
            $.each(jsonData.outageHistoryMap.stateHistoryProps,function(index,value){
                var outageGridId = 'outageGrid_'+index;//No I18N
                var topClass = (index == 0) ? 'mTop24px ' : '';//No I18N
                appendHTMLElement(createGridTableWithContainer('outageGridHolder '+topClass+'avoidPageBreak',value.tableDispName,outageGridId),containerID,false);//No I18N
                var colNames = [jsonData.translatedKeys.from,jsonData.translatedKeys.to,jsonData.translatedKeys.reason];
                var colModels = [
                    { name: 'StartTime', index: 'StartTime'}, //No I18N
                    { name: 'EndTime', index: 'EndTime'}, //No I18N
                    { name: 'Reason', index: 'Reason'}//No I18N
                ];
                pdf_loadJQgridWithData('#'+outageGridId,value.histData,colNames,colModels,'','','','');
                $('#'+outageGridId).jqGrid('setGridWidth',(reportWidth));//No I18n
            });
        }
        if(jsonData.monitorData !== undefined && jsonData.monitorData.graphData !== undefined){
            if(jsonData.monitorType !== undefined){
                var xTitle = jsonData.translatedKeys.time !== undefined ? jsonData.translatedKeys.time : 'Time';//No I18N
                chartObj = {};
                graphSettings.graphHeight = 400;

                if(jsonData.monitorType === 'process'){
                    $.each(jsonData.monitorData.graphData,function(key,value){
                        var graphId = 'processGraph'+count;//No I18n
                        var graphHeaderId = 'graphHeaderid_'+count;//No I18N
                        var yTitle = '';
                        var minRange = null;
                        var maxRange = null;
                        yTitle =  value[0].seriesname;
                        createHTMLElement(graphHeaderId,graphId,key,count);
                        count ++;
                        
                        if(yTitle !== undefined && (yTitle.toLowerCase().indexOf("percentage") !== -1 || yTitle.toLowerCase().indexOf("utilization")!=-1 || yTitle.indexOf("%") !== -1)){//No I18N
                            maxRange = 105;
                            minRange = 0;
                        }
                        
                        chartObj = getZChartObjectForExport(graphId,xTitle,yTitle,minRange,maxRange,'hours','',{graphData:value,consolidatedValues:[]},graphSettings,false);//No I18N
                        arrayObj.chartobj.push(chartObj);
                        arrayObj.placeholder.push(graphId);
                        arrayObj.seriesNameVsColorCodeArray.push(chartObj.seriesNameVsColorCodeArray);
                    });

                    if(jsonData.monitorData.perfProp !== undefined && jsonData.monitorData.perfProp.legendProps !== undefined){
                        appendHTMLElement(createGridTableWithContainer('processPerfStatGridHolder mTop24px avoidPageBreak',additionalData.i18NKeys.summary,'processPerfStatGrid'),containerID,false);//No I18N
                        var legendOpt = [{'displayName':jsonData.translatedKeys.cpuPerc,'minVal':jsonData.monitorData.perfProp.legendProps.CPUMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.CPUMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.CPUAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.CPU95thPercent}, //No I18N
                        {'displayName':jsonData.translatedKeys.memPerc,'minVal':jsonData.monitorData.perfProp.legendProps.MemMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.MemMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.MemAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.Mem95thPercent},//No I18N
                        {'displayName':jsonData.translatedKeys.memBytes,'minVal':jsonData.monitorData.perfProp.legendProps.absMemMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.absMemMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.absMemAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.absMem95thPercent},//No I18N
                        {'displayName':jsonData.translatedKeys.instances,'minVal':jsonData.monitorData.perfProp.legendProps.ICMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.ICMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.ICAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.IC95thPercent}];//No I18N

                        var colNames = [additionalData.i18NKeys.name,jsonData.translatedKeys.Min,jsonData.translatedKeys.Max,jsonData.translatedKeys.Avg,jsonData.translatedKeys.NinFivePerc]; 
                        var colModels =
                        [
                            { name: 'displayName', index: 'displayName'}, //No I18N
                            { name: 'minVal', index: 'minVal'}, //No I18N
                            { name: 'maxVal', index: 'maxVal'}, //No I18N
                            { name: 'avgVal', index: 'avgVal'}, //No I18N
                            { name: 'percentailVal', index: 'percentailVal'} //No I18N
                        ];
                        pdf_loadJQgridWithData("#processPerfStatGrid",legendOpt,colNames,colModels,"","","",""); //No I18N
                        $('#processPerfStatGrid').jqGrid('setGridWidth',(reportWidth));//No I18n
                    }

                    if(jsonData.monitorData.perfProp !== undefined && jsonData.monitorData.perfProp.dataList !== undefined){
                        appendHTMLElement(createGridTableWithContainer('processDataListHolder avoidPageBreak',additionalData.i18NKeys.tableView,'processDataList'),containerID,false);//No I18N
                        var colNames =[jsonData.translatedKeys.dateTime,jsonData.translatedKeys.cpuPerc,jsonData.translatedKeys.memPerc,jsonData.translatedKeys.memBytes,jsonData.translatedKeys.instances]; 
                        var colModels =
                        [
                            { name: 'time', index: 'time'}, //No I18N
                            { name: 'cpu', index: 'cpu'}, //No I18N
                            { name: 'memory', index: 'memory'}, //No I18N
                            { name: 'absmemory', index: 'absmemory'}, //No I18N
                            { name: 'ic', index: 'ic'} //No I18N
                        ];
                        pdf_loadJQgridWithData("#processDataList",jsonData.monitorData.perfProp.dataList,colNames,colModels,'','','',''); //No I18N
                        $('#processDataList').jqGrid('setGridWidth',(reportWidth));//No I18n
                    }
                }else if(jsonData.monitorType === 'service'){//No I18N
                    var graphId = 'serviceResponseGraph';//No I18n
                    var graphHeaderId = 'serviceGraphHeader';//No I18N
                    if(jsonData.monitorData.xyTitles !== undefined){
                        xTitle = jsonData.monitorData.xyTitles[0] || xTitle;
                        yTitle = jsonData.monitorData.xyTitles[1] || '';
                    }
                    createHTMLElement(graphHeaderId,graphId,jsonData.translatedKeys.responseTime,0);
                    chartObj = getZChartObjectForExport(graphId,xTitle,yTitle,null,null,'hours','',{graphData:jsonData.monitorData.graphData,consolidatedValues:jsonData.monitorData.consolidatedValues || []},graphSettings,false);//No I18N
                    chartObj.headerUnit = '';//getUnitFortheGraph(jsonData.monitorData);
                    arrayObj.chartobj.push(chartObj);
                    arrayObj.placeholder.push(graphId);
                    arrayObj.consolidatedValues = jsonData.monitorData.consolidatedValues;
                    arrayObj.i18NKeys = additionalData.i18NKeys;
                    arrayObj.seriesNameVsColorCodeArray = chartObj.seriesNameVsColorCodeArray;
                    arrayObj.reportWidth = reportWidth;
                    if(jsonData.monitorData.consolidatedValues !== undefined && Object.keys(jsonData.monitorData.consolidatedValues).length){
                        appendHTMLElement(createGridTableWithContainer('consolidatedDataHolder mTop24px avoidPageBreak',additionalData.i18NKeys.summary,'consolidatedData'),containerID,false);//No I18N
                    }
                }
                zChart(arrayObj);
            }
        }
    }
}

function monitorSnapshotDetails(jsonData,repname,genString,tableData){
    var monitorSnapshotDiv = "<div class='deviceMonitorSnaps'><div class='DI-Grid'><div class='DIG-List' id='monitorInfo'></div></div></div><div id='monitorGraphDiv'></div><div class='opmFormTitle' style='margin-top:15px;'>"+escapeHTML(jsonData.translatedKeys.availStat)+"</div><div class='reportGraphSingle'><section id='AvailGraph'></section><div class='opm_jqGridUI' id='perfTables'><div class='opmPerformanceMonitor'><div id='perfGraph_gridPager'></div><table id='perfGraph_MMA'><tr><td></td></tr></table></div></div><div>";
    $(".reportGraphContainer").append(monitorSnapshotDiv);
    var monitorInfoDiv = "";
    if(tableData !== undefined){
        $.each(tableData, function(key,val){
            monitorInfoDiv += "<div class='DIGL-Row'><div>"+escapeHTML(key)+"</div><div>"+escapeHTML(val)+"</div></div>";
        });
        $("#monitorInfo").append(monitorInfoDiv);
    }
    if(jsonData !== undefined && jsonData.outageHistoryMap !== undefined && jsonData.outageHistoryMap.timeRange !== undefined){
        var timePeriod = jsonData.outageHistoryMap.timeRange;
        if(jsonData.outageHistoryMap.fromTime !== undefined && jsonData.outageHistoryMap.toTime !== undefined){
            timePeriod += " ( "+jsonData.outageHistoryMap.fromTime+" - "+jsonData.outageHistoryMap.toTime+" )";
        }
        $("#timeDataval").text(timePeriod);

    }
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    if(jsonData !== undefined && jsonData.monitorData !== undefined && jsonData.monitorData.graphData !== undefined){
        if(jsonData.monitorType !== undefined){
            var monitorGraphDiv = "";
            
            var x_axes = jsonData.translatedKeys.time !== undefined ? jsonData.translatedKeys.time : "Time";//No I18N
            var y_axes = "";
            if(jsonData.monitorType === "service"){
                monitorGraphDiv = "<div class='opmFormTitle'>"+escapeHTML(jsonData.translatedKeys.responseTime)+"</div><div id='serviceGraph'></div>";
                x_axes = jsonData.monitorData.xyTitles !== undefined ? jsonData.monitorData.xyTitles[0] : "";//No I18N
                y_axes = jsonData.monitorData.xyTitles !== undefined ? jsonData.monitorData.xyTitles[1] : "";//No I18N
                var maxRange = null;
                var minRange = null;
                if(y_axes!=="" && (y_axes.toLowerCase().indexOf("percentage")!=-1 || y_axes.toLowerCase().indexOf("utilization")!=-1 || y_axes.indexOf("%")!=-1)){//No I18N
                    maxRange = 100;
                    minRange = 0;
                }
                $("#monitorGraphDiv").append(monitorGraphDiv);
                var legendsTemp={
                            "colorBox": { //No I18N
                                "shape": "circle", //No I18N
                                "strokeOpacity": 1 //No I18N
                            },
                            "fontFamily": "'LatoRegular'", //No I18N
                            "fontSize": 16, //No I18N
                            "hAlign": "right", //No I18N
                            "vAlign": "top" //No I18N
                        };
                var chartObj = {
                    id : "serviceGraph", //No I18N
                    type : 'area', //No I18N
                    jsonData : jsonData.monitorData.graphData,
                    series : 'multi', //No I18N
                    height : 250,
                    columns:{
                        datatype_1:'time', //No I18N
                        datatype_2:'numeric', //No I18N
                        columnname_1:x_axes, 
                        columnname_2:y_axes, 
                        timeFormat:'hours' //No I18N
                    },
                    canvas:{
                        title:{
                            show:false
                        }
                    },
                    legend : legendsTemp,
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
                                "minRange":minRange,//No I18N
                                "maxRange":maxRange//No I18N
                            }
                        ]
                    },
                    chart : {
                        stacked : true
                    }
                }
                var arraObj={
                    "placeholder":[],//No I18N
                    "chartobj":[]//No I18N
                }
                arraObj.chartobj.push(chartObj);
                arraObj.placeholder.push("serviceGraph"); //No I18N
                if(jsonData.monitorData.consolidatedValues !== undefined)
                {
                    arraObj.consolidatedValues = jsonData.monitorData.consolidatedValues; 
                }
                zChart(arraObj);
            }else if(jsonData.monitorType === "process"){ //No I18N
                var graphCnt = 0;
                monitorGraphDiv = "<div style='width:100%;height:200px' ></div><div id='processMonGraph'></div><div id='processPerfStat' style='display:none;float:left;width:100%;padding:0 30px;'><div class='opm_jqGridUI'><table id='processPerfStatGrid'><tr><td/></tr></table></div></div><div id='processDataStatDiv' class='opm_jqGridUI' style='float:left;width:100%;padding:20px 30px;margin-bottom:15px;'><div id='processData_gridPager'></div><table id='processDataList'><tr><td></td></tr></table></div>";
                $("#monitorGraphDiv").append(monitorGraphDiv);
                $.each(jsonData.monitorData.graphData,function(k,v){
                    var array_element = v[0];
                    graphCnt ++;
                    var graph_id = "process_snap_"+graphCnt;//No I18n
                    var appendingStr = "<div class='opmFormTitle'>"+escapeHTML(k)+"</div><div style='width:100%;height:40px'></div><div id='"+graph_id+"'></div>";
                    $("#processMonGraph").append(appendingStr);
                    var dispName = k;
                    var jsonDataGraph = v;
                            var arraObj={
                                "placeholder":[],//No I18N
                                "chartobj":[]//No I18N
                            }
                            y_axes =  array_element.seriesname;
                            var maxRange = null;
                            var minRange = null;
                            if(y_axes!==undefined && (y_axes.toLowerCase().indexOf("percentage")!=-1 || y_axes.toLowerCase().indexOf("utilization")!=-1 || y_axes.indexOf("%")!=-1)){//No I18N
                                maxRange = 100;
                                minRange = 0;
                            }
                            var perfChartObj = {
                                id : graph_id, 
                                type : 'area', //No I18N
                                jsonData : jsonDataGraph,
                                series : "multi", //No I18N
                                height : 250,
                                columns:{
                                    datatype_1:'time',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Value", timeFormat:'hours' //No I18N
                                }, 
                                canvas:{
                                    title:{
                                        show:false,
                                        text:dispName
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
                                            "minRange":minRange,//No I18N
                                            "maxRange":maxRange//No I18N
                                        }
                                    ]
                                },
                                chart : {
                                    stacked : true
                                }
                            }
                            arraObj.chartobj.push(perfChartObj);
                            arraObj.placeholder.push(graph_id); 
                            zChart(arraObj);
                });
                if(jsonData.monitorData.perfProp !== undefined && jsonData.monitorData.perfProp.dataList !== undefined){
                    var colNames =[jsonData.translatedKeys.dateTime,jsonData.translatedKeys.cpuPerc,jsonData.translatedKeys.memPerc,jsonData.translatedKeys.memBytes,jsonData.translatedKeys.instances]; 
                    var colModels =
                    [
                        { name: 'time', index: 'time'}, //No I18N
                        { name: 'cpu', index: 'cpu'}, //No I18N
                        { name: 'memory', index: 'memory'}, //No I18N
                        { name: 'absmemory', index: 'absmemory'}, //No I18N
                        { name: 'ic', index: 'ic'} //No I18N
                    ];
                    pdf_loadJQgridWithData("#processDataList", jsonData.monitorData.perfProp.dataList, colNames, colModels, "", "", "",""); //No I18N
                }
               

                if(jsonData.monitorData.perfProp !== undefined && jsonData.monitorData.perfProp.legendProps !== undefined){
                    $('#processPerfStat').show();
                    var legendOpt = [{'displayName':jsonData.translatedKeys.cpuPerc,'minVal':jsonData.monitorData.perfProp.legendProps.CPUMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.CPUMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.CPUAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.CPU95thPercent}, //No I18N
                    {'displayName':jsonData.translatedKeys.memPerc,'minVal':jsonData.monitorData.perfProp.legendProps.MemMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.MemMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.MemAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.Mem95thPercent},//No I18N
                    {'displayName':jsonData.translatedKeys.memBytes,'minVal':jsonData.monitorData.perfProp.legendProps.absMemMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.absMemMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.absMemAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.absMem95thPercent},//No I18N
                    {'displayName':jsonData.translatedKeys.instances,'minVal':jsonData.monitorData.perfProp.legendProps.ICMinVal,'maxVal':jsonData.monitorData.perfProp.legendProps.ICMaxVal,'avgVal':jsonData.monitorData.perfProp.legendProps.ICAvgVal,'percentailVal':jsonData.monitorData.perfProp.legendProps.IC95thPercent}];//No I18N

                    var colNames =['',jsonData.translatedKeys.Min,jsonData.translatedKeys.Max,jsonData.translatedKeys.Avg,jsonData.translatedKeys.NinFivePerc]; 
                    var colModels =
                    [
                        { name: 'displayName', index: 'displayName'}, //No I18N
                        { name: 'minVal', index: 'minVal'}, //No I18N
                        { name: 'maxVal', index: 'maxVal'}, //No I18N
                        { name: 'avgVal', index: 'avgVal'}, //No I18N
                        { name: 'percentailVal', index: 'percentailVal'} //No I18N
                    ];
                    pdf_loadJQgridWithData("#processPerfStatGrid",legendOpt, colNames, colModels, "", "", "",""); //No I18N
                }
            }
        }
         
    }
    if(repname!==undefined&&repname!==""&&repname!==null)
    {
       $('#pdfheadervalue').empty().text(repname);
    }
    else
    {
        $('#pdfheadervalue').empty().text("Report");//No I18N
    }
    $('#genAT').empty().text(genString);
    var arraObj1={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    }
    var mappingobj={};
    var data=jsonData.availGraphData;
    var OutageData = jsonData.outageHistoryMap.stateHistoryProps;

    var testObj = {
        id : 'AvailGraph', //No I18N
        type : 'bar', //No I18N
        jsonData : data,
        series : "multi", //No I18N
        height : 400,
        columns:{
            datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Percentage" //No I18N
        },
        canvas:{
            title:{
                show:false,
                text:""
            }
        },
        legend : {
            "colorBox": { //No I18N
                "shape": "circle", //No I18N
                "strokeOpacity": 1 //No I18N
            },
            "colors": ["#77d283","#afafaf","#ffee00","#ffc0cb","#f47272","#31A5F0","#6b0000"], //No I18n
            "fontFamily": "'LatoRegular'", //No I18N
            "fontSize": 16, //No I18N
            "hAlign": "right", //No I18N
            "vAlign": "top" //No I18N
        },
        "axes": { //No I18N 
            "rotated": true, //No I18N  
            "xaxis": { //No I18N    
                "label": { //No I18N    
                    "text": "" //No I18N    
                }
            },
            "yaxis": [ //No I18N    
                {
                    "label": { //No I18N    
                        "text": "Availability(%)" //No I18N   
                    },
                    "minRange":0,//No I18N
                    "maxRange":100//No I18N
                }
            ]
        },
        chart : {
            stacked : true
        }
    }
    arraObj1.chartobj.push(testObj);
    arraObj1.placeholder.push('AvailGraph');  //No I18n    
    mappingobj.AvailGraph=testObj;
    zChart(arraObj1);
    if(OutageData !== undefined && OutageData.length !== 0)
    {
        $("#perfTables").empty();
        $.each(OutageData,function(index,value)
        {            
            var colNames =[jsonData.translatedKeys.from,jsonData.translatedKeys.to,jsonData.translatedKeys.reason]; 
            var colModels =
            [
                { name: 'StartTime', index: 'StartTime'}, //No I18N 
                { name: 'EndTime', index: 'EndTime'}, //No I18N 
                { name: 'Reason', index: 'Reason'}//No I18N
            ];
            $("#perfTables").append('<div class="opmPerformanceMonitor" style="width:100%"><div id="perfGraph_gridPager_'+index+'"></div><table id="perfGraph_MMA_'+index+'" class="inventoryGraphDataGrid" ><tr><td></td></tr></table></div>');
            pdf_loadJQgridWithData("#perfGraph_MMA_"+index, value.histData, colNames, colModels,value.tableDispName,"perfGraph_gridPager_"+index); //No I18N
        });
    }
}

function opm_AvailGraphValueToString(value)
{
    var toRet="";
    if(value === 0){
        toRet = '  Down'; //No I18n
    }else if(value === 1){
        toRet = '  Up'; //No I18n
    }
    return toRet;
}

var availTimeFormat = 
{
    "onehour":"onehour",//No I18n
    "twohours":"twohours",//No I18n
    "fourhours":"fourhours",//No I18n
    "sixhours":"sixhours",//No I18n
    "eighthours":"eighthours",//No I18n
    "Today":"Today", //No I18n
    "today":"Today", //No I18n
    "Yesterday":"Yesterday", //No I18N
    "Last 12 hours":"twelvehours", //No I18N
    "Last 24 hours":"twfourhours", //No I18N
    "Last 7 days":"Last_7_Days", //No I18N
    "This week":"thisweek", //No I18N
    "Last week":"thisweek", //No I18N
    "Last 30 days":"Last_30_Days", //No I18N
    "Last month":"Last_Month", //No I18N
    "This month":"thismonth", //No I18N
    "Last 60 days":"Last_30_Days", //No I18N
    "Last 90 days":"Last_90_Days", //No I18N
    "Last 3 months":"Last_3_Months", //No I18N
    "Last 6 months":"Last_6_Months", //No I18N
    "Last Quarter":"Last_Quarter", //No I18N
    "This Quarter":"This_Quarter", //No I18N
    "custom":"custom", //No I18N
    "Custom":"custom" //No I18N
}   

function availabilityGraph(jsonData, width, height, plotOnly,repname,genString,tableData,dis)
{
     window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    if(repname!==undefined&&repname!==""&&repname!==null&&repname!=="null")
    {
       $('#pdfheadervalue').empty().text(repname); 
    }
    else
    {
        $('#pdfheadervalue').empty().text("Report"); //No I18N
    }


    $('#genAT').empty().text(genString);
    var data;
    $(".reportGraphContainer").empty();

    var arraObj={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    }
    var mappingobj={};
    data=jsonData.availGraphData;
    var OutageData = jsonData.outageHistoryMap.stateHistoryProps;
    var timeperiod = availTimeFormat[jsonData.outageHistoryMap.timeRange];
    var uptimeData = jsonData.uptimeData;

    var reportDiv="<div><div id='availTableData'></div><section id='AvailGraph'></section><div id='UptimeStatics' class='accordion1 oneView pull-left mb-lg' style='display:none'><div class='accordion1__nav small'>Uptime Statistics</div><div class='accordion1__cont' id='AvailUptimeContent'></div></div><div class='opm_jqGridUI pull-left width100' id='perfTables'><div class='opmPerformanceMonitor'><div id='perfGraph_gridPager'></div><table id='perfGraph_MMA'><tr><td></td></tr></table></div></div>";//No I18N

    $(".reportGraphContainer").append(reportDiv); 
    $("#disclaimer").empty();
    if(dis!==undefined&&dis!==null&&dis!==""&&dis!=="null")
    {
     $("#disclaimer").append(dis);   
    }
    else
    {
         $("#disclaimer").hide(); 
    }
    if(tableData !== undefined ){
        var availTable="<div><table cellpadding='5' cellspacing = '5' style='width:100%;margin-left:4px'>";//No I18N
        $.each(tableData,function(key,val){
            availTable += "<tr style='float:left;width:50%'>";
            availTable += "<td style='float:left;width:50%;font-weight:bold'>"+escapeHTML(key)+"</td>";
            availTable += "<td style='float:left;width:50%'>"+escapeHTML(val)+"</td>";
            availTable += "</tr>";
        });
        availTable += "</table></div>";
        $("#availTableData").empty().append(availTable);   
    } 
      

    if(repname === "Availability Statistics")
    {
        $('#timeData').empty(); 
       var testObj = {
        id : 'AvailGraph', //No I18N
        type : 'bar', //No I18N
        jsonData : data,
        series : "multi", //No I18N
        height : 400,
        columns:{
            datatype_1:'ordinal',datatype_2:'numeric',columnname_1:"Time",columnname_2:"Percentage" //No I18N
        }, //No I18N
        canvas:{
            title:{
                show:false,
                text:""
            }
        },//No I18N
        legend : {
            "colorBox": { //No I18N
                "shape": "circle", //No I18N
                "strokeOpacity": 1 //No I18N
            },
            "colors": ["#77d283","#afafaf","#ffee00","#ffc0cb","#f47272","#31A5F0","#6b0000"], //No I18n
            "fontFamily": "'LatoRegular'", //No I18N
            "fontSize": 16, //No I18N
            "hAlign": "right", //No I18N
            "vAlign": "top" //No I18N
        },
        "axes": { //No I18N 
            "rotated": true, //No I18N  
            "xaxis": { //No I18N    
                "label": { //No I18N    
                    "text": "" //No I18N    
                }
            },
            "yaxis": [ //No I18N    
                {
                    "label": { //No I18N    
                        "text": "Availability(%)" //No I18N   
                    },
                    "minRange":0,//No I18N
                    "maxRange":100//No I18N
                }
            ]
        },
        chart : {
            stacked : true
        }
    }

    }
    else if(repname === "Availability History")
    {
        $('#timeDataval').empty().text(jsonData.outageHistoryMap.timeRange);
        var testObj = {
            id : 'AvailGraph', //No I18N
            type : 'line', //No I18N
            jsonData : jsonData.availGraphData,
            series : "multi", //No I18N
            height : 400,
           columns:{
                datatype_1:'time',  //No I18N
                datatype_2:'numeric',  //No I18N
                columnname_1:"Time",  //No I18N
                columnname_2:"",   //No I18N
                timeFormat:timeperiod,
                format: {customFormat: function(value) {return opm_AvailGraphValueToString(value);}}
            }, 
            canvas:{
                title:{
                    show:false,
                    text:""
                }
            },
            legend : {
                "colorBox": { //No I18N
                    "shape": "circle", //No I18N
                    "strokeOpacity": 1 //No I18N
                },
                "colors": ["#04c7e4"], //No I18n
                "fontFamily": "'LatoRegular'", //No I18N
                "fontSize": 16, //No I18N
                "hAlign": "right", //No I18N
                "vAlign": "top" //No I18N
            },
            "axes": { //No I18N 
                "rotated": false, //No I18N  
                "xaxis": { //No I18N    
                    "label": { //No I18N    
                        "text": "Time" //No I18N    
                    }
                },
                "yaxis": [ //No I18N    
                    {
                        "label": { //No I18N    
                            "text": " " //No I18N   
                        }
                    }
                ]
            },
            chart : {
                stacked : false
            }
        }
    }
    arraObj.chartobj.push(testObj);
    arraObj.placeholder.push('AvailGraph');  //No I18n    
    mappingobj.AvailGraph=testObj;
    zChart(arraObj);

    $("#UptimeStatics").hide();
    if(uptimeData !== undefined && uptimeData.length !== 0)
    {
        $("#UptimeStatics").show();
        $('#UptimeStatics.accordion1.oneView .accordion1__nav').addClass('active');
        $('#UptimeStatics.accordion1.oneView .accordion1__nav').next('.accordion1__cont').slideDown();
        opm_drawAvailHBarChart("#AvailUptimeContent",uptimeData); //No I18n
    }

    if(OutageData !== undefined && OutageData.length !== 0)
    {
        $("#perfTables").empty();
        $.each(OutageData,function(index,value)
        {            
            var colNames =[jsonData.translatedKeys.from,jsonData.translatedKeys.to,jsonData.translatedKeys.reason]; 
            var colModels =
            [
                { name: 'StartTime', index: 'StartTime'}, //No I18N 
                { name: 'EndTime', index: 'EndTime'}, //No I18N 
                { name: 'Reason', index: 'Reason'}//No I18N
            ];
            $("#perfTables").append('<div class="opmPerformanceMonitor" style="width:100%"><div id="perfGraph_gridPager_'+index+'"></div><table id="perfGraph_MMA_'+index+'" class="inventoryGraphDataGrid" ><tr><td></td></tr></table></div>');
            pdf_loadJQgridWithData("#perfGraph_MMA_"+index, value.histData, colNames, colModels,value.tableDispName,"perfGraph_gridPager_"+index); //No I18N
        });
    }
}

//At-a-glance report old code
function drawAtaGlancePDF(jsonData, width, height, plotOnly,repname,timeperiod,policyName,period,inventorysnapType,genString,dis)
{
    if(repname!==undefined&&repname!==""&&repname!==null&&repname!=="null")
    {
       $('#pdfheadervalue').empty().text(repname); 
    }
    else
    {
        $('#pdfheadervalue').empty().text("Report"); //No I18N
    }
    if(timeperiod!==undefined)
    {
    $('#timeDataval').empty().text(timeperiod);  
    }
    $('#genAT').empty().text(genString);
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N

    $('.reportGraphContainer').empty();


    var unit = "";
    var x_axes;
    var y_axes;
    var intfDetails = "<div class='interfaceInfoGrid' id='intfDetailstable'></div>"
     $('.reportGraphContainer').prepend(intfDetails);
     $("#disclaimer").empty();
    if(dis!==undefined&&dis!==null&&dis!==""&&dis!=="null")
    {
     $("#disclaimer").text(dis);   
    }
    else
    {
         $("#disclaimer").hide(); 
    }
    $.each(jsonData.graphData,function(graphName,chartData)
    {
        $.each(chartData,function(key,value)
        {
            x_axes = value.xyTitles !== undefined ? value.xyTitles[0] : "";//No I18N
            y_axes = value.xyTitles !== undefined ? value.xyTitles[1] : "";//No I18N
            unit = value.suffix !== undefined ? value.suffix:""; //No I18n
        });
        var graphUnit = y_axes !== undefined &&  y_axes !== "" ? ' (' + y_axes + ')' : ""; //No I18N
        var maxRange = null;
        var minRange = null;
        if(y_axes!=="" && (y_axes.toLowerCase().indexOf("percentage")!=-1 || y_axes.toLowerCase().indexOf("utilization")!=-1 || y_axes.indexOf("%")!=-1)){//No I18N
            maxRange = 100;
            minRange = 0;
        }
        var appendingStr = '<div class="AtaGlanceRep"><header>'+escapeHTML(graphName)+escapeHTML(graphUnit)+'</header><div class="graph-divs-small-blkgrad" id="IntfGlance_'+escapeHTML(graphName)+'" title="'+escapeHTML(graphName)+'"></div></div>'; //No I18n
        $('.reportGraphContainer').append(appendingStr);

        var tempheight=chartData.length*25;
        if(tempheight<400)
        {
            tempheight=400;
        }
       
        var chartObj = {
            id : "IntfGlance_"+graphName, //No I18N
            type : 'area', //No I18N
            jsonData : chartData,   
            series : "multi", //No I18N
            height : tempheight,
            columns:{
                datatype_1:'time', //No I18N
                datatype_2:'numeric', //No I18N
                columnname_1:x_axes,
                columnname_2:y_axes,
                timeFormat:(period !== undefined ? period : 'Today'), //No I18N
                suffix:unit
            },
            canvas:{
                title:{
                    show:false
                    //text:yAxis
                }
            },
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
                        "text": x_axes //No I18N
                    },
                     "ticklabel": {//No I18N
                        "rotation": 'auto'//No I18N
                    },
                    "show": true//No I18N

                },
                "yaxis": [ //No I18N    
                    {
                        "label": { //No I18N    
                            "text": y_axes //No I18N    
                        },
                        "minRange":minRange,//No I18N
                        "maxRange":maxRange//No I18N
                    }
                ]
            },
            chart : {
                stacked : true
            }
        }
        
        var arraObj={
            "placeholder":[],//No I18N
            "chartobj":[]//No I18N
        }
        arraObj.chartobj.push(chartObj);
        arraObj.placeholder.push("IntfGlance_"+graphName); //No I18N
        zChart(arraObj); 
    });
    if(jsonData.Details !== undefined || jsonData.Details !== null)
    {
        var intfDetails="<div class='row'>";//No I18N
        $.each(jsonData.Details,function(key,val){
            intfDetails += "<div class='col'>";
            intfDetails += "<div>"+escapeHTML(key)+"</div>";
            intfDetails += "<div>"+escapeHTML(val)+"</div>";
            intfDetails += "</div>";
        });
        intfDetails += "</div>";
        $("#intfDetailstable").empty().append(intfDetails); 
    }
}

function drawAtAGlanceEnhancedPDF(response,repname,timeperiod,policyName,period,inventorysnapType,genString,dis,objI18N,additionalData){
    var count = 0;
    var arrayObj = {placeholder:[],chartobj:[],seriesNameVsColorCodeArray:[],isStackedGraph:true,isExport:true};
    var mappingobj = {};
    var disclaimerId = 'disclaimerNewReport';//No I18N
    var containerID = 'zGraphContainer';//No I18N
    var reportName = 'At-a-Glance Report';//No I18N
    var timePeriod = (timeperiod || 'Today');//No I18N
    var graphSettings = getGraphSettings(JSON.parse(additionalData.graphSettings),'atAGlance',additionalData.i18NKeys.noDataText);//No I18N
    var reportWidth = ($('#zchartgraph').width())+55;
    var htmlString = '';
    var graphData = {};
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N

    if(response.Details){
        setAdditionalHeaders(response.Details);
    }
    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $('.newDSPReport').empty();
    
    $('#'+disclaimerId).empty();
    if(dis !==undefined && dis !== '' && dis !== null && dis !== 'null'){
        $('#'+disclaimerId).text(dis);
    }else{
        $('#'+disclaimerId).hide();
    }

    if(repname !== undefined && repname !== "" && repname !== null && repname !== 'null'){
        reportName = repname;
    }
    setHeaders(reportName,timePeriod,additionalData,additionalData,false);

    if(response.NameVsData !== undefined){
        graphData = response.NameVsData;
    }else if(response.graphData !== undefined){
        graphData = response.graphData;
    }

    if(!$.isEmptyObject(graphData)){
        var appendingStr = '';
        var graphCount = 0;
        $.each(graphData, function(key,val){
            var height = 'auto';//No I18N
            var marginTop = 24;
            var id1 = 'atAGlanceGraph_'+count;//No I18N
            var isAvailabilityGraph = (val.displayName === undefined);
            var graphHeaderid = 'graphHeaderid_'+count;//No I18N
            count++;

            if(val === "NODATA"){//No I18N
                val = [];
            }else{
                $.each(val,function(k,v){
                    if(v.xyTitles !== undefined){
                        val.xyTitles = v.xyTitles;
                    }
                });
            }

            var id =  key.replace(/\W/g, '');//No I18n
            var chartObj = {};
            var classNames = 'perfExportPdfGraph';//No I18N
            if('Availability' === id){
                classNames += ' ataGlancepieChart';//No I18N
            }
            appendHTMLElement("<div class='containerWidth avoidPageBreak' style='border:1px solid #ddd;border-radius:4px;margin-top:"+marginTop+"px;height:"+height+"px;'><div style='font-family:latoBold;font-size:14px;margin-top:15px;margin-left:15px' id="+graphHeaderid+"></div><div id='"+id1+"' class='"+classNames+"' style='margin-top:24px;margin-bottom:24px;'></div></div>",containerID,false);
            $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N
            if(id !== 'Availability'){
                var maxRange = null;  
                var minRange = null;
                var xTitle = '';
                var yTitle = '';

                if(val.xyTitles !== undefined){
                    if(val.xyTitles[1] !== undefined){
                        if(val.xyTitles[1].toLowerCase().indexOf("percentage") !== -1 || val.xyTitles[1].toLowerCase().indexOf("utilization") !== -1 || val.xyTitles[1].indexOf("%") != -1){
                            maxRange = 105;
                            minRange = 0;
                        }
                        yTitle = val.xyTitles[1];
                    }
                    if(val.xyTitles[1] !== undefined){
                        xTitle = val.xyTitles[0];
                    }else{
                        xTitle = objI18N.Time;
                    }
                }
                var modGraphData = val;
                if(val !== undefined && val[0] !== undefined && val[0].graphData !== undefined){
                    modGraphData = val[0].graphData;
                }
                graphSettings.graphHeight = 400;
                if('MonitoringInterface' === inventorysnapType && yTitle){
                    $("#"+graphHeaderid).empty().text(key+' ('+yTitle+')');
                }else{
                    $("#"+graphHeaderid).empty().text(key);
                }
                chartObj = getZChartObjectForExport(id1,xTitle,yTitle,minRange,maxRange,(period || 'Hours'),'',{graphData:modGraphData,consolidatedValues:[]},graphSettings,additionalData.isInterfaceGraph);//No I18N
            }else{
                $("#"+graphHeaderid).empty().text(key);
                chartObj = getZChartPropsForPieChart(val,{graphId:id1,graphHeight:400},true);
                chartObj.seriesNameVsColorCodeArray = {};
            }
            arrayObj.seriesNameVsColorCodeArray.push(chartObj.seriesNameVsColorCodeArray);
            arrayObj.chartobj.push(chartObj);
            arrayObj.placeholder.push(id1);
        });
        zChart(arrayObj);

        if(response.IF_Headers !== undefined && response.IF_Data !== undefined && response.IF_Data.length){
            appendHTMLElement(createGridTableWithContainer('interfaceDataHolder mTop24px avoidPageBreak',escapeHTML(objI18N.InterfaceDetails),'interfaceData'),containerID,false);//No I18N
            var colNames = []; 
            $.each(response.IF_Headers,function(k,v){
                colNames.push(v);
            });
            colNames.push('');//No I18N
            var colModels =
            [
                { name: 'ifIndex', index: 'ifIndex',width:10}, //No I18N
                { name: 'displayName', index: 'displayName', classes:'cursorPointer',width:30}, //No I18N
                { name: 'inSpeed', index: 'inSpeed',width:20},//No I18N
                { name: 'outSpeed', index: 'outSpeed',width:20}, //No I18N
                { name: 'inTraffic', index: 'inTraffic',width:20}, //No I18N
                { name: 'outTraffic', index: 'outTraffic',width:20},//No I18N
                { name: 'errors', index: 'errors',width:20}, //No I18N
                { name: 'name', index: 'name', hidden:true} //No I18N
            ];
            var defaultOptions = {sortName:'displayName',sortOrder:'asc'};//No I18N
            pdf_loadJQgridWithData('#interfaceData',response.IF_Data,colNames,colModels,"","interfaceData_Pager","opm_interfacesList",defaultOptions); //No I18N
            $('#interfaceData').jqGrid('setGridWidth',(reportWidth));//No I18n
            // $('#interfaceData').trigger('reloadGrid');//No I18n
        }
        // canvasLoded is set by opmZChart.js polling when zobj.chartRendered becomes true.
        // Safety fallback: if chartRendered never fires (edge case), force after 40s to prevent hang.
        setTimeout(function(){
            if(!window.canvasLoded) {
                window.canvasLoded = true;
            }
        },40000);
    } else {
        window.canvasLoded = true;
    }
}

//At-a-glance report old code
function addDeviceAtAGlanceObject(graphID,obj,timeFormat,height,objI18N)
{
        
    var chartObj = {};
    var data = undefined;
    if(obj !== undefined && obj[0] !== undefined && obj[0].graphData !== undefined){
        data = obj[0].graphData;
    }
    if(graphID === "device_Availability"){//No I18N
    var availColors = ['#77d283','#afafaf','#ffee00','#ffc0cb','#f47272','#5DA5DA','#9E4B4B','#FFC10F','#746ECF','#A957C0','#716398','#A3AFC7'];//No I18N
            
        chartObj = {
            id:graphID,
            type:'pie',//No I18N
            subType:"simplePie",//No I18N
            customClass:"opm_pie opm_legend2Col",//No I18N
            jsonData:obj,
            height:height,
            columns:{
                datatype_1:'ordinal',//No I18N
                datatype_2:'numeric',//No I18N
                columnname_1:"Label",//No I18N
                columnname_2:"%",//No I18N
                columnname_3:'',
                timeFormat:(timeFormat !== undefined? timeFormat : 'hours')//No I18N
            },
                
            canvas:{
                title:{
                    show:false,
                    text:""
                }
            },
            chart:{
                stacked:true
            },
            area:{
                marker:true
            },
            legend:{
               "enabled":true,//No I18N
               colors:availColors,
               "layout":"horizontal",//No I18N
                "hAlign": "center",//No I18N//No I18N
                "vAlign": "bottom",//No I18N//No I18N
                "fontSize":12//No I18N
            },
            bar:{
                rotated:false,
                levelMarker:true
            },
            pie:{innerLabel:false}
        }
    }else{
        var maxRange = null;  
        var minRange = null;
        if(obj.xyTitles!==undefined && obj.xyTitles[1]!==undefined && (obj.xyTitles[1].toLowerCase().indexOf("percentage")!=-1 || obj.xyTitles[1].toLowerCase().indexOf("utilization")!=-1 || obj.xyTitles[1].indexOf("%")!=-1)){//No I18N
            maxRange=100;
            minRange = 0;
        }
        chartObj = {
            id : graphID, 
            type : 'area', //No I18N
            jsonData : (data !== undefined ? data : obj),
            series : 'multi', //No I18N
            height : height,
            columns:{
                datatype_1:'time', //No I18N
                datatype_2:'numeric', //No I18N
                
                columnname_1:(obj.xyTitles !== undefined ? obj.xyTitles[0] : objI18N.Time),
                columnname_2:(obj.xyTitles !== undefined ? obj.xyTitles[1] : ""),//No I18N
                timeFormat:(timeFormat !== undefined? timeFormat : 'hours') //No I18N
            },
        
            canvas:{
                title:{
                    show:true
                }
            },
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
                    
                    "text": (obj.xyTitles !== undefined ? obj.xyTitles[0] : objI18N.Time) //No I18N
                    }
                },
                "yaxis": [ //No I18N    
                    {
                        "label": { //No I18N    
                            "text": (obj.xyTitles !== undefined ? obj.xyTitles[1] : "") //No I18N   
                        },
                        "minRange":minRange,//No I18N
                        "maxRange":maxRange//No I18N
                    }
                ]
            },
            chart : {
                stacked : false
            }
        }
    }
    return chartObj;
}

function exportDevDependencyTreePDF(jsonData,genString,repHeader)
{
    $("#graphdivelement").addClass('jsTreeType1 plusMinus  dashBorder');//NO I18N
    $('#graphdivelement').wrapInner("<div id='DependencyDetailsTree' class='DependencyDetailsTreePDF'></div>");//NO I18N
    $('#pdfheadervalue').empty().text(repHeader); //NO I18N
    $('#genAT').empty().text(genString);//NO I18N
    $('.opmBtnHldrTop').hide();

    (function ($, undefined) {
        $.jstree.plugins.noclose = function () {
            this.close_node = $.noop;
        };
    })(jQuery);
 (function ($, undefined) { //disable href link in PDF
        $.jstree.plugins.nohref = function (options, parent) {
            this.redraw_node = function (obj, deep, callback, force_draw) {
                var el = parent.redraw_node.apply(this, arguments),nd = el.querySelector('.jstree-anchor'); //No I18n
                nd.removeAttribute('href');  //No I18n                
                return el;
            };
        }
    })(jQuery);

    $('#DependencyDetailsTree').jstree('destroy');//NO I18N
    $('#DependencyDetailsTree').on('ready.jstree', function(e, data){
        data.instance.open_all();
    }).jstree({
        'plugins':['noclose','nohref'],//NO I18N
        "core": {//NO I18N
            'data': jsonData, //NO I18N
            'force_text':true //No I18n
        }
    });
    window.canvasLoded = true;
}

function drawAtaGlanceGraph(graphData,graphID,timeFormat,height,consolidatedValues,unit,seriesNames)
{
    var x_axes;
    var y_axes
    $.each(graphData,function(key,value)
    {
        x_axes = value.xyTitles !== undefined ? value.xyTitles[0] : "";//No I18N
        y_axes = value.xyTitles !== undefined ? value.xyTitles[1] : "";//No I18N
    }); 
    var maxRange = null;
    var minRange = null;
    if(y_axes!=="" && y_axes!==undefined && (y_axes.toLowerCase().indexOf("percentage")!=-1 || y_axes.toLowerCase().indexOf("utilization")!=-1 || y_axes.indexOf("%")!=-1)){//No I18N
        maxRange = 100;
        minRange = 0;
    }
    if(timeFormat === undefined && timeFormat === "")
    {
        timeFormat = 'today'; //No I18n
    }
    var chartObj = {
        id : graphID, //No I18N
        type : 'area', //No I18N
        jsonData : graphData,
        series : 'multi', //No I18N
        height : height,
        columns:{
            datatype_1:'time', //No I18N
            datatype_2:'numeric', //No I18N
            columnname_1:x_axes, //No I18N
            columnname_2:y_axes, //No I18N
            timeFormat:timeFormat //No I18N
        },
        canvas:{
            title:{
                show:true
                //text:graphData[0].seriesname
            }
        },//No I18N
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
                    "text": x_axes //No I18N    
                }
            },
            "yaxis": [ //No I18N    
                {
                    "label": { //No I18N    
                        "text": y_axes //No I18N    
                    },
                    "minRange":minRange,//No I18N
                    "maxRange":maxRange//No I18N
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
    if(unit !== undefined)
    {
        chartObj.columns.suffix = unit;
    }
    else
    {
        $.each(graphData,function(graphName,graphValue)
        {
            chartObj.columns.suffix = graphValue.suffix;
        });
    }
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push(graphID); //No I18N
    if(consolidatedValues !== undefined)
    {
        arraObj.consolidatedValues = consolidatedValues; //No I18N
    }
    if(seriesNames !== undefined)
    {
        arraObj.graphSeries = seriesNames; //No I18N
    }    
    zChart(arraObj);
}
function exportVPNSummaryReport(jsonData,genString,repHeader,tableHeaders,subgridHeader)
{
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    $('.opmBtnHldrTop').hide();
    if(repHeader!==undefined&&repHeader!==""&&repHeader!==null&&repHeader!=="null")
    {
       $('#pdfheadervalue').empty().text(repHeader);//No I18N
    }
    else
    {
        $('#pdfheadervalue').empty().text("Report");//No I18N
    }
    $("#disclaimer").empty();
    $('#genAT').empty().text(genString);

    var monitorcount=0;
    $(".reportGraphContainer").empty();
     var defaultOptions = {};
    var colNamesList = tableHeaders;
    var colModelList = [
        {name: 'displayName',index: 'displayName',sorttype:'text'}, //No I18N
        {name: 'statusStr',index: 'statusStr',sorttype:'text'}, //No I18N
        {name: 'ipAddress',index: 'ipAddress',sorttype:'int'}, //No I18N
        {name: 'type',index: 'type',sorttype:'int'}, //No I18N
        {name: 'tunnelCount',index: 'tunnelCount',sorttype:'int'}, //No I18N
        {name: 'interfaces',index: 'interfaces',sorttype:'int'} //No I18N
        ];
    defaultOptions.subGrid=true;
    defaultOptions.tableName="reportsReportList_subgrid";//No I18n
    defaultOptions.colNamesList=subgridHeader;
    defaultOptions.colModelList = [{name:'0', index:'0'},//No I18N
        { name: '3', index: '3'}, //NO I18N
        { name: '1', index: '1'},//No I18N
        { name: '2', index: '2'},//No I18N
        { name: '4', index: '4'},//No I18N
        { name: '5', index: '5'},//No I18N
        { name: '6', index: '6'}//No I18N
     ];
    defaultOptions.subGridFunction='vpnSummaryReport';   //No I18N
    defaultOptions.Data=jsonData;
    defaultOptions.onSelectFunctionName="opmVPNSummaryRep"; //No I18n
    defaultOptions.subgrid_id="pdfsummary_PagerubgridList"; //No I18n
    defaultOptions.expandOnLoad=true;
    var str = '<div class="reportGridUI"><div class="opm_jqGridUI themeOne"><table id="vpnsummary_List"><tr><td/></tr></table></div></div>' //No I18N
    $(".reportGraphContainer").append(str);
    pdf_loadJQgridWithData("#vpnsummary_List", jsonData, colNamesList, colModelList, "", "#pdfsummary_Pager", "VPNSummaryReport",defaultOptions); //No I18N
    $("#vpnsummary_List").jqGrid("setGridWidth",$('.pdfReportGraph').width()-20);
    window.canvasLoded = true;

}

function opm_drawAvailHBarChart(elm,arr)
{
    $(elm).empty();
    $(elm).addClass("ut minMaxWidget");
    var str = "<div class='left'> <div style='font:15px BitterRegular;position:relative;top: 0;left: 0;right: 0;border:none' class='title'>Time Period</div>";//No I18N
    var str1 = " <div class='right'> <div style='font:15px BitterRegular;position:relative;top: 0;left: 0;right: 0;border:none' class='title'>Uptime(%)</div>";//No I18N

    $.each(arr, function(ind,val)
    {
       var value = Number(val);
       if(value > 100)
       {
            value = 100;
       }
               
      value=Math.round(value);
      var statusClass = 'severity_5';//No I18N
        str += "<div class='ut-row opmToolTipDesc'>"+ind+"</div>";//No I18N
        str1 += "<div class='ut-row opmToolTipDesc "+statusClass+"' data-value='"+value+"' style='width:0%;'><span>"+value+"%</span></div>";//No I18N
    });
    str += "</div>";//No I18N
    str1 += "</div>";//No I18N
        
    $(elm).wrapInner(str+str1);

    $(elm+' .ut-row').each(function() {
        wd = $(this).data('value')+'%';
        $(this).css({width:wd});
    });
}

var zChartColors = ["#E46C2B","#ECBE41","#AFD049","#4092EB","#021897","#B92976","#E79336","#A6A600","#4C9F2E", "#2965C2", "#451393", "#DD3022", "#E78B4F", "#EDCD5A", "#C0D96A", "#61ABEC", "#404DAD", "#C54D95", "#E9AB56", "#B8B806", "#6AB54F", "#5289D0", "#6F44AA", "#DF4E46", "#EAAE82", "#EFD987", "#D2E395", "#8DC2EE", "#7C84C4", "#D181B3", "#EDC487", "#B2B22E", "#94C983", "#85ADDA", "#997EC1", "#E4817E"];//No I18N
function drawRCAGraph(rcaGraphData,rcaEventsData,rcaName,rcaDescription,generatedTime,timePeriod,disclaimerText)
{
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    var repName = "Report";//No I18N
    if(rcaName!==undefined && rcaName!==""){//No I18N
       repName = rcaName; 
    }
    $('#pdfheadervalue').text(repName); //No I18N
    if(disclaimerText!==undefined && disclaimerText!==""){
        $("#disclaimer").text(disclaimerText); //No I18N
    }
    if(timePeriod!==undefined){
        $('#timeDataval').text(timePeriod);  //No I18N
    }
    if(generatedTime){
        var subTxt = "";
        if(rcaDescription!==undefined && rcaDescription!==""){
            subTxt = rcaDescription+" | ";
        }
        subTxt += "Generated at "+new Date(Number(generatedTime)).toLocaleString();//No I18N
        $('#genAT').text(subTxt);//No I18N
    }   
    $(".reportGraphContainer").empty();//No I18N
    var reportDiv = '<div class="rcaReportView"><div class="chartRightBox viewReport"><div class="middleChartSection"><div class="chartContainer"><div class="rcaGraphSection" style="width:100%;margin-right:20px"></div></div></div></div></div>';
    $(".reportGraphContainer").append(reportDiv);//No I18N
    if(rcaGraphData!==undefined)
    {
        var maxRange = null, minRange = null, notesMinRangeTime = null, notesMaxRangeTime = null;
        $.each(rcaGraphData.rcaData,function(key,value)
        {
            if(value.graphData!==undefined)
            {
                for(var i=0;i<value.graphData.length;i++)
                {
                    var seriesData = value.graphData[i].data;
                    if(minRange===null || seriesData[0][0] < minRange){
                        minRange = seriesData[0][0];
                    }
                    if(maxRange===null || seriesData[seriesData.length-1][0] > maxRange){
                        maxRange = seriesData[seriesData.length-1][0];
                    }
                }
            }
            if(value.notesData!==undefined)
            {
                for(var i=0;i<value.notesData.length;i++)
                {
                    var seriesData = value.notesData[i].data;
                    if(notesMinRangeTime===null || seriesData[0] < notesMinRangeTime){
                        notesMinRangeTime = seriesData[0];
                    }
                    if(notesMaxRangeTime===null || seriesData[0] > notesMaxRangeTime){
                        notesMaxRangeTime = seriesData[0];
                    }
                }
            }
    });
        if(maxRange===null){
            maxRange = rcaGraphData.maxRange;
        }else{
            if(notesMaxRangeTime>maxRange){
                maxRange = notesMaxRangeTime;
            }
        }
        if(minRange===null){
            minRange = rcaGraphData.minRange;
        }else{
            if(notesMinRangeTime!==null && notesMinRangeTime<minRange){
                minRange = notesMinRangeTime;
            }
        }
        var customRCAData = [];
        $.each(rcaGraphData.rcaData,function(key,value)
    {
            var params = value;
            params.key = key;
            customRCAData.push(params);
        });
        customRCAData.sort(function(x,y){
            return x.key < y.key ? -1 : 1;
        });
        var zChartIndex = 0;
        for(var i=0;i<customRCAData.length;i++)
        {
            $('.rcaGraphSection').append('<div class="zohoCharts-Container chartBox" name="'+escapeHTML(customRCAData[i].key)+'"><div class="chartArea" id="'+escapeHTML(customRCAData[i].key)+'"></div></div>');//No I18N
            var graphColors = zChartColors.slice(zChartIndex,zChartIndex+customRCAData[i].graphData.length);
            zChartIndex = zChartIndex+customRCAData[i].graphData.length;
            var arraObj={"placeholder":[],"chartobj":[]};//No I18N
            var chartObj = {
                id:customRCAData[i].key,
                type:'line',//No I18N
                jsonData:customRCAData[i].graphData,
                series:"multi",//No I18N
                height:220,
                width:"calc(100% - 30px)",//No I18N
                columns:{
                    datatype_1:'time',//No I18N
                    datatype_2:'numeric',//No I18N
                    columnname_1:"Time",//No I18N
                    columnname_2:"Value",//No I18N
                    timeFormat:(timePeriod===undefined)?"Today":timePeriod//No I18N
                },
                canvas:{
                    title:{
                        show:false,
                        text:""//No I18N
                    }
                },
                line:{
                    mode:"monotone",//No I18N
                    strokeWidth:2,
                    marker:{enabled:false,size:1},
                    hoveroptions:{size:1,outerFillOpacity:0}
                },
                chart:{stacked:false,rendererMode:"canvas",marginTop:10,marginBottom:10},//No I18N
                legend:{enabled:true,layout:"horizontal",vAlign:"top",hAlign:"left",marginTop:20,colors:graphColors,"shapes":["circle"]},//No I18N
                axes:{
                    "xaxis": {//No I18N
                        "label": {//No I18N
                            "text":""//No I18N
                        },
                        "axisline": {//No I18N
                            "style": "longdash",//No I18N
                            "color":"#D5D5D5"//No I18N
                        },
                        "ticklabel": {//No I18N
                            "rotation": "auto",//No I18N
                            "fontColor": "#909090"//No I18N
                        },
                        "minRange":minRange,//No I18N
                        "maxRange":maxRange,//No I18N
                        "show":true//No I18N
                    },
                   "yaxis": [//No I18N
                        {   
                            "label": {//No I18N
                                "text": ""//No I18N
                            },
                            "ticklabel": {//No I18N
                                "fontColor": "#909090"//No I18N
                            },
                            "grid": {//No I18N
                                "style": "longdash",//No I18N
                                "show": true,//No I18N
                                "color":"#D5D5D5"//No I18N
                            },
                            "axisline": {//No I18N
                                "show": false//No I18N
                            },
                            "show": true,//No I18N
                            "minRange":0//No I18N
                        }
                    ]
                }
            }
            arraObj.chartobj.push(chartObj);
            arraObj.placeholder.push(customRCAData[i].key);
            zChart(arraObj);
        }
    }
    if(rcaEventsData!==undefined && rcaEventsData.allEventsCount > 0)
    {
        $('.rcaGraphSection').append('<div class="alarmSection"><div class="alarmSection__info expand"><div class="alarmSection__heading"><span>'+escapeHTML(rcaEventsData.allEventsCount)+'</span> Alarms</div><div class="alarmSection__desc">Represents the total number of alarms raised for the selected monitors altogether.</div></div><div class="alarmSection__table" style="display: block;"><div class="opm_jqGridUI RCA__AlarmsTable"><table id="rcaEventsList"></table><div id="rcaEventsPager"></div></div></div></div>');  //No I18N  
        var colNamesList = ["Message","Source","Severity","Last Updated Time",""];//No I18N
        var colModelList = [
            {name:'MESSAGE',index:'MESSAGE',width:300}, //No I18N
            {name:'DISPLAYNAME',index:'DISPLAYNAME'}, //No I18N
            {name:'SEVERITY',index:'SEVERITY',formatter:rcaEventsColorIcon}, //No I18N
            {name:'TIME',index:'TIME',formatter:getFormattedDateTime},//No I18N
            {name:'id',index:'id',hidden:true,sortable:false} //No I18N 
        ];
        $.jgrid.gridUnload('#rcaEventsList');//No I18N 
        pdf_loadJQgridWithData("#rcaEventsList",rcaEventsData["All Events"],colNamesList,colModelList,"","#rcaEventsPager");//No I18N
    }
    setTimeout(function(){
        window.canvasLoded = true;
    },1000);
}
function rcaEventsColorIcon(cellValue,options,rowdata, action)
{
    return "<i class='icon-status"+rowdata.STATUS+"'></i>"+escapeHTML(cellValue);//No I18N
}
function getFormattedDateTime(cellValue, options, rowdata, action){
    return new Date(cellValue).toLocaleString();
}

 var minMx_blinkColors = [
    '#00c6e4', //No I18N
    '#faa43a' //No I18N
    //'#faa43a', //No I18N
    //'#5da5da', //No I18N
    //'#60bd68', //No I18N
    //'#b2912f', //No I18N
]
function opm_setCustomNotesExport(consolidatedObj,series,seriesNameVsColorCodeMap)
{ 
    var plotValues = [];
    var s_index = 0;
     $.each(consolidatedObj,function(key,instance)
    {
        if(instance.exactMinVal !== undefined)
        {
            var minVal = Number((instance.exactMinVal));
            var maxVal = Number((instance.exactMaxVal));
           var colorIndx = (series !== undefined ? series.indexOf(key) : -1);
           var color = minMx_blinkColors[s_index];
           if(colorIndx !== -1 )
            {
                color = minMx_blinkColors[colorIndx];
            }
            if(seriesNameVsColorCodeMap!==undefined && seriesNameVsColorCodeMap[instance.seriesname]!==undefined) {
                color = seriesNameVsColorCodeMap[instance.seriesname];
            }
            plotValues .push({
                    "data": [//No I18N
                       
                        Number(instance.minCollectionTime),
                        minVal,
                        instance.exactMinVal
                    ],
                    "fontColor":color,//No I18N
                     "text": key,//No I18N
                     "class":"Min"//No I18N
                },
                {
                    "data": [//No I18N
                        Number(instance.maxCollectionTime),
                        maxVal,
                        instance.exactMinVal
                    ],
                    "fontColor":color,//No I18N
                    "text": key,//No I18N
                    "class":"Max"//No I18N
                }
            )
           s_index++;
        }
    });

var cmNotes = {
            "enabled": true,//No I18N
            "type": "customNote",//No I18N
            "plotValues": plotValues,//No I18N
            "options":{//No I18N
                "customNote": {//No I18N
                     "htmlEl": function(chart, note){//No I18N
                      
                        var classname = note['class'];//No I18N
                        return "<div class='opmPulse_circle "+classname+"'><div class='pulse_circleRed'></div></div>";//No I18N
                     
                     },
                     "transform": function(chart, val, ele, coordinate){    //No I18N
                        return [coordinate[0], coordinate[1]];
                    }
                
                }
            }
        }

    return cmNotes;
}


function setImageModeCss(width) {
    if(width===undefined) {
        width='550px'; //NO I18N
    }
    $("html, body").css("min-width", "unset");//NO I18N
    $('#logoDiv').hide();
    $('#headerDiv').hide();
    $('#pdfheadervalue').hide();
    $('#genAT').hide();
    $('#timeData').hide();
    $('#disclaimer').hide();
    $('#zchartgraph').css({'width':width});
    $('#graphdivelement').css({'margin-top':'0px'});
    $('#zchartgraph').addClass('p-none');
    $('.reportGraphContainer').addClass('p-none');
    $('#upperDiv').css({'border-width':0});
}

function drawLineChartAsImage(data,titleText) {
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    setImageModeCss('850px'); //NO I18N
    $(".reportGraphContainer").empty();
    var repDetails = "<div id='hardwareHealthDiv'></div>";  //No I18N
    $(".reportGraphContainer").append(repDetails);
    opm_loadHardwareReportGraph(data,'hardwareHealthDiv',titleText); //NO I18N
}

function opm_loadHardwareReportGraph(jsonData,divId,titleText)
{
	$("#"+divId).show();
	$('#'+divId).empty();
	var x_axes;
	var y_axes;
	if(jsonData)
	{
		$.each(jsonData.chartData,function(key,value)
		{
			x_axes = value.xyTitles !== undefined ? value.xyTitles[0] : "";//No I18N
			y_axes = value.xyTitles !== undefined ? value.xyTitles[1] : "";//No I18N
		});
	}

	var chartObj = {
		id : divId,
		type : 'line', //No I18N
		jsonData : jsonData.chartData,
		series : 'multi', //No I18N
		height : 400,
		columns:{
			datatype_1:'time', //No I18N
			datatype_2:'numeric', //No I18N
			columnname_1:x_axes,
			columnname_2:y_axes,
			timeFormat:'hours' //No I18N
		},
		canvas:{
			title:{
				show:true,
				text:titleText,
                hAlign:"center" //No I18N
			}
		},
		legend : {
			"colorBox": { //No I18N
				"shape": "circle", //No I18N
				"strokeOpacity": 1 //No I18N
			},
			"fontFamily": "'LatoRegular'", //No I18N
			"fontSize": 16, //No I18N
			"hAlign": "center", //No I18N
			"vAlign": "bottom", //No I18N
            "layout": "horizontal" //No I18N
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
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(divId);
	zChart(arraObj);
}



function drawAvailPieChartAsImage(data1,titleText) {
    setImageModeCss();
    var availabilityColors = ['#46bb7d','#5DA5DA','#7f7f7f','#ffc0cb','#e8de65','#ffb505','#fa5b5a'];//No I18N
    $(".reportGraphContainer").empty();
    var repDetails = "<div id='devAvailSummaryDiv'></div>";  //No I18N
    $(".reportGraphContainer").append(repDetails);
    var arraObj={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    }
    var legendsTemp={
        "layout": "horizontal",//No I18N
        "textOverflow": "wrap",//No I18N
        "colorBox": { //No I18N
            "shape": "circle", //No I18N
            "strokeOpacity": 1 //No I18N
        },
        colors:availabilityColors,
        "fontColor":"#312e2e",//NO I18N
        "fontSize": 10, //No I18N
        "hAlign": "center", //No I18N
        "vAlign":  "bottom" //No I18N
    };
    var graphData = data1.graphData;
    var chartObj = {
        id:'devAvailSummaryDiv',//No I18N
        type:'pie',//No I18N
        subType:"deviceAvailabilitySchedule",//No I18N
        jsonData:graphData,
        height:300,
        'width':'550px',//NO I18N
        columns:
        {
            datatype_1:'ordinal',//No I18N
            datatype_2:'numeric',//No I18N
            columnname_1:'State',//No I18N
            columnname_2:'Percentage',//No I18N
            columnname_3:'',
            timeFormat:'hours',//No I18N
            suffix:' %'//No I18N
        },
        canvas:{
            title:{
                show:true,
                text:titleText,
                "fontColor":"#312e2e",//NO I18N
                "fontSize": 12, //No I18N
                "fontWeight":"bold"//NO I18N
            }
        },
        legend:legendsTemp,
        datalabels: {
            handleOverlapping: false,
            show: true,
            boundBox: {
                strokeColor: null,
                show: false,
                radius: 3,
                padding: 4,
                hook: {
                    enabled: true,
                    width: 8
                }
            }
        }
    }
    arraObj.chartobj.push(chartObj);
    arraObj.placeholder.push('devAvailSummaryDiv'); //No I18N
    zChart(arraObj);
}

function drawAvailPieChart(data1,repname,timeperiod,genString,dis)
{
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    if(data1.imageMode) {
        drawAvailPieChartAsImage(data1,repname);
        return;
    }
    if(repname!==undefined&&repname!==""&&repname!==null&&repname!=="null")
    {
       $('#pdfheadervalue').empty().text(escapeHTML(repname)); //No I18N
    }
    else
    {
        $('#pdfheadervalue').empty().text("Report"); //No I18N
    }
    if(timeperiod!==undefined)
    {
    $('#timeDataval').empty().text(timeperiod);  
    }
    $('#genAT').empty().text(genString);
    if(dis!==undefined&&dis!==null&&dis!==""&&dis!=="null")
    {
     $("#disclaimer").text(dis);   
    }
    else
    {
         $("#disclaimer").hide(); 
    }
    var data;
    count=0;
    $(".reportGraphContainer").empty();
    var repDetails = "<div id='devAvailSummaryDiv'></div>";  //No I18N   
    $(".reportGraphContainer").append(repDetails);
    var arraObj={
        "placeholder":[],//No I18N
        "chartobj":[]//No I18N
    }
    var mappingobj={};
    var temparrval;
    var unit = "";
    var timeFormat;
    var legendsTemp={
        "colorBox": { //No I18N
            "shape": "circle", //No I18N
            "strokeOpacity": 1 //No I18N
        },
        colors:['#77d283','#f47272'],//No I18N
        "fontFamily": "'LatoRegular'", //No I18N
        "fontSize": 16, //No I18N
        "hAlign": data1.hAlign ? data1.hAlign : "right", //No I18N
        "vAlign": data1.vAlign ? data1.vAlign : "center" //No I18N
    };
    if(data1.type==="4") {
        legendsTemp.colors=['#77d283','#f47272']; //No I18N
        var graphData = data1.chartData.chartData[0].data;
        var chartObj = {
            id:'devAvailSummaryDiv',//No I18N
            type:'pie',//No I18N
            subType:"simpleDonut",//No I18N
            customClass:"opm_pie",//No I18N
            jsonData:graphData,
            height:data1.height ? data1.height : 250,
            columns:
            {
                datatype_1:'ordinal',//No I18N
                datatype_2:'numeric',//No I18N
                columnname_1:'State',//No I18N
            columnname_2:'Percentage',//No I18N
                columnname_3:'',
                timeFormat:(timeFormat !== undefined? timeFormat : 'hours'),//No I18N
                suffix:' %'//No I18N
            },
            canvas:{
                title:{
                    show:true,
                    text:""
                }
            },
            legend:legendsTemp,
            plotoptions: {
                type:'pie',//No I18N
                subType:"simpleDonut",//No I18N
                pie: {
                        innerRadius: "65%",
                        datalabels: {
                        type: 'doubleside',//No I18N
                        showAs: 'y',//No I18N
                        line: {
                            strokeColor: 'gray',//No I18N
                            strokeWidth: 0.5
                        },
                        innerLabel: {
                            show: false,
                            showAs: "y"//No I18N
                        }
                    }
                }
            },
            datalabels: {
                handleOverlapping: false,
                show: true,
                boundBox: {
                    strokeColor: null,
                    show: false,
                    radius: 3,
                    padding: 4,
                    hook: {
                        enabled: true,
                        width: 8
                        }
                }
            }
        }
    }
    else {
        var x_axes = data1.chartData.xyTitles !== undefined ? data1.chartData.xyTitles[0] : "";//No I18N
        var y_axes = data1.chartData.xyTitles !== undefined ? data1.chartData.xyTitles[1] : "";//No I18N
            graphData = data1.chartData.chartData;
            graphView = 'bar'; //No I18n
            legendsTemp.colors=["#31B404","#9ACD32","#8000FF","#D2ACF9","#e75480","#ffb6c1","#FFF300","#ffff94","#ffa500","#ff8c00","#ff4500","#ff0000","#307d99"]; //No I18n
            if(data1.type==="2") {
                datatype="ordinal"; //No I18N
            } else {
                datatype = 'time'; //No I18N
            }
            timeFormat = (timeFormat !== undefined? timeFormat : 'hours');//No I18N
            var chartObj = {
            id : 'devAvailSummaryDiv', //No I18N
            type : graphView,
            jsonData : graphData,
            series : 'multi', //No I18N
            height : 350,
            columns:{
                datatype_1:datatype,
                datatype_2:'numeric', //No I18N
                columnname_1:x_axes,
                columnname_2:y_axes,
                timeFormat:data1.timeFormat ? data1.timeFormat : timeFormat
            },
            canvas:{
                title:{
                    show:true
                    //text:data1[0].seriesname
                }
            },
            legend : legendsTemp,
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
                stacked : true
            }
        };

        if(data1.autoRotation){
            chartObj.axes.xaxis.ticklabel = {"rotation": 'auto'};//No I18N
            chartObj.axes.xaxis.show = true;
        }

        if(data1.consolidatedValues !== undefined)
        {
            arraObj.consolidatedValues = data1.consolidatedValues;
        }
    }
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push('devAvailSummaryDiv'); //No I18N
	zChart(arraObj);

    if(data1.tableData!==undefined && (data1.tableData).length > 0)
    {
        
        $(".reportGraphContainer").append('<div class="reportGridUI"><div class="opm_jqGridUI" ><div id="deviceAvailSummary_Pager"></div><table id="deviceAvailSummary_List"><tr><td/></tr></table></div></div>');  //No I18N  
        var colNamesList = data1.tableHeaders;
        var colModel = [
            { name: 'displayName', index: 'displayName'}, //No I18N
            { name: 'downtime', index: 'downtime'}, //No I18N
            { name: 'availpercent', index: 'availpercent'} //No I18N
        ];
        $.jgrid.gridUnload('#deviceAvailSummary_List');//No I18N 
        pdf_loadJQgridWithData("#deviceAvailSummary_List",data1.tableData,colNamesList,colModel,"","#deviceAvailSummary_Pager");//No I18N
   
    
    }
    setTimeout(function(){
        window.canvasLoded = true;
    },1000);
}

function drawBVAvailabilityGraph(jsonData,additionalData)
{
    var arrObj = {placeholder:[],chartobj:[],seriesNameVsColorCodeArray:[],isStackedGraph:false,isExport:true};
    var disclaimerId = 'disclaimerNewReport';//No I18N
    var containerID = 'zGraphContainer';//No I18N
    var reportName = additionalData.reportName || 'Report';//No I18N
    var timePeriod = 'Today';//No I18N
    var graphSettings = getGraphSettings(JSON.parse(additionalData.graphSettings),'processService',additionalData.i18NKeys.noDataText);//No I18N
    var reportWidth = ($('#zchartgraph').width())+55;
    var htmlString = '';
    var height = 'auto';//No I18N
    var marginTop = 24;
    window.OPM = {};
    window.OPM.pattern="d MMM yyyy hh:mm:ss a z";//No I18N
    window.OPM.severTimeZone = "exportPDF";//No I18N
    var createHTMLElement = function(graphHeaderId,graphId,graphHeader,graphIndex){
        marginTop = 24;
        if(graphIndex !== undefined && graphIndex === 0){
            marginTop = 6;
        }
        appendHTMLElement("<div class='containerWidth avoidPageBreak' style='border:1px solid #ddd;border-radius:4px;margin-top:"+marginTop+"px;height:"+height+"px;'><div style='font-family:latoBold;font-size:14px;margin-top:15px;margin-left:15px' id="+graphHeaderId+"></div><div id='"+graphId+"' class='perfExportPdfGraph' style='margin-top:24px;margin-bottom:24px;'></div></div>",containerID,false);
        $("#"+graphHeaderId).empty().text(graphHeader);
        $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N
    }

    $('.oldPDFReport').hide();
    $('.newPDFReport').show();
    $('.newDSPReport').empty();
    
    $('#'+disclaimerId).empty();
    if(additionalData.dis && additionalData.dis !== 'null'){
        $('#'+disclaimerId).text(additionalData.dis);
    }else{
        $('#'+disclaimerId).hide();
    }
    $('.containerWidth, #'+containerID).css({width:reportWidth+'px'});//No I18N
    
    if(additionalData.tableData !== undefined){
        setAdditionalHeaders(additionalData.tableData);
    }

    if(jsonData !== undefined && jsonData.timePeriodMap !== undefined && jsonData.timePeriodMap.timeRange !== undefined){
        timePeriod = jsonData.timePeriodMap.timeRange;
    }

    setHeaders(reportName,timePeriod,additionalData,additionalData,false);

    if(jsonData!=null)
    {
        if(jsonData.BVAvailGraphData!==undefined)
        {
            $.each(jsonData.BVAvailGraphData,function(key,value){
                if(key==='AvailStats')
                {
                    createHTMLElement(key+'GraphHeader','bv_chart_AvailStats',value.displayName);//No I18n
                    opm_drawAvailHBarChart('#bv_chart_AvailStats',value.data);//No I18N
                }
                else
                {
                    graphId = key;
                    createHTMLElement(key+'GraphHeader',graphId,value.displayName);//No I18n
                    chartObj = getZChartPropsForBarChart('Period','Percentage',value.data.chartData,{graphId:graphId,graphHeight:400},true);//No I18N
                    chartObj.axes.rotated=false;
                    var datatype = "time";//No I18N
			        var colr = ['#46bb7d','#268633','#EF87CD','#ffee00','#F4B172','#fa5b5a','#31A5F0'];//No I18N
			        if(key === 'Least')
			        {
				        datatype = "ordinal"//No I18N
				        colr = ['#46bb7d','#fa5b5a'];//No I18N
        	        }
        	        else if(key === 'Average')
			        {
				        colr = ['#46bb7d','#fa5b5a','#31A5F0'];//No I18N
        	        }
                    chartObj.columns.timeFormat='hours';//No I18N
                    chartObj.columns.datatype_1=datatype;
                    chartObj.legend.colors=colr;
                    arrObj.chartobj.push(chartObj);
                    arrObj.placeholder.push(graphId);
                }
            });
        }
        zChart(arrObj);
    }
}
