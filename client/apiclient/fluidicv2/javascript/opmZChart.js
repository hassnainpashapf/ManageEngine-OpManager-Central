//$Id$
function zChart(arrayObj)
{
    var dataarr=[];
    var elementIDarr=[];
    var chartID;
    var jsonDataValues = [];
    $.each(arrayObj.chartobj,function(ind,val)
    {
        chartID = val.id;
        var tempobj=opm_customChartObject(val);
        dataarr.push(tempobj);
        var wid = (val.width !== undefined ? val.width : "95%");
        try{
            d3.select('#'+chartID).selectAll('rect').remove();
            d3.select('#'+chartID).select('svg').selectAll('*').remove();
            d3.select('#'+chartID).selectAll('*').remove();
        }
        catch(err){
            var errMsg = err;
        }
		if(val.containerHeight!==undefined) {
			val.height=val.containerHeight;
		}
        $("#"+val.id).html('<div class="container" id="zcContain_'+val.id+'" style=" height: '+val.height+'px;width: '+wid+';"></div>'); //No I18N //create chart element //No I18N
        $("#zcContain_"+val.id).addClass((val.customClass !== undefined ? val.customClass:""));//No I18N   
        jsonDataValues.push(val.jsonData);
    });
	if(arrayObj.isIndividualGraph!==undefined && arrayObj.isIndividualGraph) {
		$.each(arrayObj.consolidatedValuesArray,function(ind,consolidatedValues){
			if(consolidatedValues !== undefined && !$.isEmptyObject(consolidatedValues)){
				var chartObj = arrayObj.chartobj[ind];
				if(arrayObj.isExport!==undefined && arrayObj.isExport){
					opm_drawMMAValuesEnhancedGraphTable(consolidatedValues,chartObj.id,true,arrayObj.seriesNameVsColorCodeArray[ind],arrayObj);
				}
			}
		});
	}else if(arrayObj.isStackedGraph !== undefined && arrayObj.isStackedGraph && arrayObj.isExport !== undefined && arrayObj.isExport){
		$.each(arrayObj.placeholder,function(index,graphId){
			if(arrayObj.chartobj[index].isCustomLegendEnabled){
				opm_drawLegendForStackedGraph(graphId,arrayObj.seriesNameVsColorCodeArray[index]);
			}
		});
	} else {
		if(arrayObj.consolidatedValuesArray!==undefined && arrayObj.consolidatedValuesArray!==null && arrayObj.consolidatedValuesArray.length!==0) {
			var sstime = Date.now();
			$.each(arrayObj.consolidatedValuesArray,function(index,consolidatedValues){
				if (consolidatedValues !== undefined && !$.isEmptyObject(consolidatedValues)) {
					var chartObj = arrayObj.chartobj[index];
					opm_drawMMAValues(chartObj.axes.yaxis[0],consolidatedValues,chartObj.id,chartObj.legend.colors,arrayObj.graphSeries,arrayObj);
				}
			})
        }
	    else {
            if(arrayObj.consolidatedValues !== undefined && arrayObj.consolidatedValues!==null){
	        	if(typeof Ember !== 'undefined' && arrayObj.chartobj && arrayObj.chartobj[0].isEnhancedGraph){
        			if(!arrayObj.chartobj[0].isReportBuilderGraph){
        				opmPerf_drawMMAValues(arrayObj.chartobj[0].axes.yaxis[0],arrayObj.consolidatedValues,chartID,arrayObj.chartobj[0].legend.colors,arrayObj.graphSeries, arrayObj);
        			}
	        	}else if(typeof Ember !== 'undefined' && (['MonitoringURL','MonitoringDevice'].contains(OPMClient.InventoryDeviceDetailsController.inventorysnapType)) && arrayObj.placeholder && arrayObj.placeholder[0] === 'perfGraph'){//No I18N
	                opmPerf_drawMMAValues(arrayObj.chartobj[0].axes.yaxis[0],arrayObj.consolidatedValues,chartID,arrayObj.chartobj[0].legend.colors,arrayObj.graphSeries, arrayObj);
	            }else{
	            	if(typeof Ember === 'undefined' && arrayObj.chartobj && arrayObj.chartobj[0].isEnhancedGraph){
	                	opm_drawMMAValuesEnhancedGraph(arrayObj.chartobj[0].axes.yaxis[0],arrayObj.consolidatedValues,chartID,arrayObj.chartobj[0].legend.colors,arrayObj.graphSeries, arrayObj);
	            	}else{
	                	opm_drawMMAValues(arrayObj.chartobj[0].axes.yaxis[0],arrayObj.consolidatedValues,chartID,arrayObj.chartobj[0].legend.colors,arrayObj.graphSeries, arrayObj);
	                }
	            }
	    	}
	    }
	}
	if(arrayObj.customFieldsMap!==undefined) {
		$.each(arrayObj.chartobj,function(ind,chartObject){
			if(chartObject!==undefined) {
				var id = chartObject.id
				var customFields = arrayObj.customFieldsMap[id];
				var customFieldNames = arrayObj.customFieldNamesArrayMap[id];
				opm_drawCustomFieldsTable(customFields,id,customFieldNames);
			}
		})
	}

    $.each(arrayObj.placeholder,function(ind,val)
    {
        elementIDarr.push(document.getElementById('zcContain_'+val));//No I18N
    });
    //Axes should be present only in meta key and not in chart key, but using condition to remove.
	if(arrayObj.chartobj && arrayObj.chartobj[0] && arrayObj.chartobj[0].noChartAxes && dataarr[0] && dataarr[0].chart && dataarr[0].chart.axes) {
		dataarr[0].metadata.axes = Object.assign({},dataarr[0].chart.axes);
		delete dataarr[0].chart.axes;
	}
    var zobj=new $ZC.charts(elementIDarr, dataarr);
    //OPMClient and Application Controllers will not be available during pdf export
    if(arrayObj.sourcePage !== undefined && arrayObj.sourcePage !== '' && OPMClient!==undefined && OPMClient.ApplicationController!==undefined){
      var currentChartObject={};
      currentChartObject[arrayObj.sourcePage] = zobj;
      if(OPMClient.ApplicationController.zChartObjects===undefined) {
        OPMClient.ApplicationController.zChartObjects = currentChartObject;
      } else {
        if(OPMClient.ApplicationController.zChartObjects[arrayObj.sourcePage] === undefined || OPMClient.ApplicationController.zChartObjects[arrayObj.sourcePage].length === 0) {
          OPMClient.ApplicationController.zChartObjects[arrayObj.sourcePage] = zobj;
        } else {
          OPMClient.ApplicationController.zChartObjects[arrayObj.sourcePage] = OPMClient.ApplicationController.zChartObjects[arrayObj.sourcePage].concat(zobj);
        }
      }
    }
    var test = setInterval(function(){
        if(zobj.chartRendered === true){
            clearInterval(test)
            window.canvasLoded = true;
        }
        $('.d3container .canvas-component .xychart .nodatahandler .nodata').closest('.graph-divs-small-blkgrad').addClass('zChartNoData');//No I18N
    }, 1000/60);
 	return zobj;
}
function zChartForRealTime(obj)
{
    var tempobj=opm_customChartObject(obj);
    $("#"+obj.id).html('<div class="container" id="zcContain_'+obj.id+'" style=" height: '+obj.height+'px;width: 95%;"></div>'); //No I18N //create chart element //No I18N
    $("#zcContain_"+obj.id).addClass((obj.customClass !== undefined ? obj.customClass:""));//No I18N   
   var element = document.getElementById('zcContain_'+obj.id);//No I18N
    tempobj.legend.hAlign = 'center'; //No I18N
    tempobj.legend.vAlign = 'bottom'; //No I18N
    tempobj.chart.plot.plotoptions.line.marker.enabled=false;
    tempobj.chart.plot.plotoptions.line.marker.size=1;
    var zobj = new $ZC.charts(element, tempobj);
    return zobj;
}

function opm_customChartObject(chartObj)
{
	if(chartObj.columns === undefined) {
		chartObj.columns = {};
		chartObj.columns.datatype_1 = "time";//No I18N
		chartObj.columns.datatype_2 = "numeric";//No I18N
		chartObj.columns.datatype_3 = "ordinal";//No I18N
	}

	var columnname_1 = (chartObj.columns.columnname_1) === undefined?"":chartObj.columns.columnname_1;//No I18N
	var columnname_2 = (chartObj.columns.columnname_2) === undefined?"":chartObj.columns.columnname_2;//No I18N
	var columnname_3 = (chartObj.columns.columnname_3) === undefined?"":chartObj.columns.columnname_3;//No I18N
	var columnname_4 = (chartObj.columns.columnname_4) === undefined?"":chartObj.columns.columnname_4;//No I18N
	var columnname_5 = (chartObj.columns.columnname_5) === undefined?"":chartObj.columns.columnname_5;//No I18N
	var columnname_6 = (chartObj.columns.columnname_6) === undefined?"":chartObj.columns.columnname_6;//No I18N

	if(chartObj.canvas === undefined) {
		chartObj.canvas = {
			title:{}
		}
	}

	var timeObj = {
		"subfunction":"ABSHOUR",//No I18N
		"specifier":"HH"//No I18N
	};

	if(chartObj.columns.timeFormat !== undefined)    
	{
		var frmt = (timePeriodformat[chartObj.columns.timeFormat] !== undefined ? timePeriodformat[chartObj.columns.timeFormat] : 'hours');//No I18N
		timeObj.subfunction = timeFormatObj[frmt].subfunction;
		if(window.OPM.severTimeZone !== undefined && window.OPM.severTimeZone === "exportPDF")
		{
			timeObj.specifier = timeFormatObj[frmt].specifier_pdf;    
		}
		else
		{
			timeObj.specifier = timeFormatObj[frmt].specifier;
		}
	}

	var data = {};
	data.canvas = {
		"title":{},
		"subtitle":{},
		"border":{},
		"shadow":{}
	};

	if(chartObj.noDataHandler !== undefined) {
		data.noDataHandler = chartObj.noDataHandler;
	}/*else if(Ember != undefined && Ember.I18n != undefined){
		data.noDataHandler = {text:Ember.I18n.t("webclient.dials.nodata",this)};//NO I18N
	}*/

	data.canvas.title.show = (chartObj.canvas.title.show !== undefined ? chartObj.canvas.title.show : false);
	data.canvas.title.text = (chartObj.canvas.title.text !== undefined ? chartObj.canvas.title.text : "");//No I18N
	data.canvas.title.hAlign = (chartObj.canvas.title.hAlign !== undefined ? chartObj.canvas.title.hAlign : "left");//No I18N
	data.canvas.title.vAlign = (chartObj.canvas.title.vAlign !== undefined ? chartObj.canvas.title.vAlign : "top");//No I18N
	if(chartObj.canvas.title.fontColor !== undefined) {
		data.canvas.title.fontColor = chartObj.canvas.title.fontColor;
	}
	if(chartObj.canvas.title.fontSize!==undefined) {
		data.canvas.title.fontSize = chartObj.canvas.title.fontSize;
	}
	if(chartObj.canvas.title.fontStyle!==undefined) {
		data.canvas.title.fontStyle = chartObj.canvas.title.fontStyle;
	}
	if(chartObj.canvas.title.fontWeight!==undefined) {
		data.canvas.title.fontWeight = chartObj.canvas.title.fontWeight;
	}
	data.canvas.subtitle.show = false;
	data.canvas.subtitle.text = "";//No I18N
	data.canvas.border.show = false;
	data.canvas.shadow.show = false;
	data.canvas.background = {"alpha": 0}//No I18N

	if(chartObj.canvas.events!==undefined && chartObj.canvas.events.onload!== undefined)
	{
		data.canvas.events = {};
		data.canvas.events.onload = chartObj.canvas.events.onload;
	}

	data.seriesdata =  {//No I18N
		"type": chartObj.type //No I18N // bar || pie || line || funnel || pyramid || area || web || scatter || bubble //No I18N
	}

	if(chartObj.series !== undefined && chartObj.series === 'single')
	{
		data.seriesdata.chartdata = [{
			"yaxiscolumnorder": [0],//No I18N
			"data":[chartObj.jsonData]// dataindex in the metadata.columns refers this index of the array //No I18N
		}]
	}
	else if(chartObj.series !== undefined && chartObj.series === 'multi')
	{
		var added = false;
		data.seriesdata.chartdata = [];
		if(chartObj.jsonData!==undefined && chartObj.jsonData.length>1) {
			//if any one series has data and other series empty dataarray, then add the dataarray which has data
			$.each(chartObj.jsonData,function(index,eachJsonData){
				if(eachJsonData.data!==undefined && eachJsonData.data.length!==0) {
					added = true;
					data.seriesdata.chartdata.push(eachJsonData);
				}
			});
			if(!added) {
				//all datamaps are empty, hence add the orignal data to show No Data Handler
				data.seriesdata.chartdata = chartObj.jsonData;
			}
		} else {
			data.seriesdata.chartdata = chartObj.jsonData;
		}
	}
	else
	{
		data.seriesdata.chartdata = [{
			"yaxiscolumnorder": [0],//No I18N
			"data":[chartObj.jsonData]//No I18N
		}]
	}

	var timePatrnStr = window.OPM.pattern;
	if(window.OPM.pattern.match(/d/g) !== null && window.OPM.pattern.match(/d/g).length === 1)
	{
		timePatrnStr = (timePatrnStr).replace('d', 'dd');//No I18N    
	}
	if(window.OPM.pattern.match(/M/g) !== null && window.OPM.pattern.match(/M/g).length === 1)
	{
		timePatrnStr = (timePatrnStr).replace('M', 'MM');//No I18N    
	}
	if(window.OPM.pattern.match(/h/g) !== null && window.OPM.pattern.match(/h/g).length === 1)
	{
		timePatrnStr = (timePatrnStr).replace('h', 'hh');//No I18N    
	}

	timePatrnStr = timePatrnStr.replace(/yy/gi,"YY");//No I18N

	var format = {
		// "thousandSeperator": ",",//No I18N
		//"decimalSeperator": ".",
		//"decimalPlaces": 2,
		//"signEnabled": false,
		//"prefix": "$"
		"suffix":(chartObj.columns.suffix !== undefined?chartObj.columns.suffix:"")//No I18N
	}

	if(chartObj.columns.format != null) {
		format = chartObj.columns.format;
	}

	var tooltipformat = {
		"customFormat": function(value, datatype, columnInfo) {
			var currentZone = (window.OPM.severTimeZone !== undefined ? window.OPM.severTimeZone : moment.tz.guess());
			var tz_time = moment.tz(value,currentZone);
			return tz_time.format(mtz_pattern);
		}
	};

	var col3TooltipFmt = {customFormat: function(value) {return value}};
	if (chartObj.columns.ordinal != undefined && chartObj.columns.ordinal.tooltipformat != undefined) 
	{
		col3TooltipFmt = chartObj.columns.ordinal.tooltipformat; 
	}
	if(chartObj.columns.tooltipformat != null) {
		tooltipformat = chartObj.columns.tooltipformat;
	}

	var timeConfig = {
		"subfunction": timeObj.subfunction,//No I18N
		"format" : {//No I18N
			"specifier" : timePatrnStr//No I18N
		},
		"axisformat": {//No I18N
			"specifier": timeObj.specifier//No I18N
		},
		"tooltipformat": tooltipformat//No I18N
	};
	
	if (!(navigator.userAgent.toLowerCase().indexOf('firefox') !== -1 && (chartObj.policyName && (chartObj.policyName === 'discardRate' || chartObj.policyName === 'errorRate' || chartObj.policyName === 'utilization' || chartObj.policyName === 'rxutilization' || chartObj.policyName === 'txutilization')))) {
		timeConfig.inputformat = 'MILLI';//No I18N
	}

	data.metadata = {
	    // Define the column details in the column object
		"columns": [{//No I18N
			"dataindex": 0,// array position of the data given in seriesdata.(Ex: index of P1)//No I18N
			"columnname": columnname_1,	//No I18N
			"datatype": chartObj.columns.datatype_1,//No I18N
			"time": timeConfig //No I18N
		},
		{
			"dataindex": 1, //No I18N// array position of the data given in seriesdata.(Ex: index of 495881.0458)//No I18N
			"columnname": columnname_2,//No I18N
			"datatype": chartObj.columns.datatype_2,//No I18N
			"numeric": {//No I18N
				"format": format//No I18N
			}
		},
		{
			"columnname": columnname_3,//No I18N
			"datatype":(chartObj.columns.datatype_3 === undefined ) ? "":chartObj.columns.datatype_3, //No I18N
			"ordinal": {"tooltipformat": col3TooltipFmt} //No I18N
		},
		{
			"dataindex": 2, //No I18N
			"columnname": columnname_4//No I18N
		},
		{
			"dataindex": 3, //No I18N
			"columnname": columnname_5//No I18N
		},
		{
			"dataindex": 4, //No I18N
			"columnname": columnname_6//No I18N
		}],

		// Map the column position given in the columns array with the respective axis.
		"axes": {//No I18N
			"x": [0],//No I18N
			"y": [//No I18N
				[1]
			],
			"clr": [2],//No I18N
			"tooltip": (chartObj.tooltip !== undefined ? chartObj.tooltip : [0,1]) //No I18N
		}
	}

	if (chartObj.dataTypeObj) {
		Object.keys(chartObj.dataTypeObj).forEach(function(index) {
			data.metadata.columns.forEach(function(column) {
				if (column.dataindex === parseInt(index, 10)) {
					Object.keys(chartObj.dataTypeObj[index]).forEach(function(key) {
						var value = chartObj.dataTypeObj[index][key];
						column[key] = value;
					});
				}
			});
		});
	}

	if(window.OPM.severTimeZone !== undefined && window.OPM.severTimeZone !== "exportPDF")
	{
		data.metadata.columns[0].time.axisformat = {
			"specifier": timeObj.specifier,//No I18N
			customFormat : function(value, datatype, columnInfo, type, chartObj) {
				var currentZone = (window.OPM.severTimeZone !== undefined ? window.OPM.severTimeZone : moment.tz.guess());
				var tz_time = moment.tz(value, currentZone);
				return tz_time.format(timeObj.specifier);
			}
		}
	}

	data.tooltip = {
		"backgroundColor": "#000",//No I18N
		"enabled": (chartObj.showToolTip === false ? false : true)//No I18N
	}
        //Added min with for BV overAll severity Barcharts tooltip.
        if(chartObj !== undefined && chartObj.id === "bv_barchart"){
		data.tooltip = {
			"backgroundColor": "#000",//No I18N
			"maxWidth": "200%"//No I18N
		}
	}

	/* ... added Min,Max and Avg value in interface BW graph ... */
	if(chartObj !== undefined && chartObj.id === "intfBWOutageRep") 
	{
		data.tooltip.content = IntfBWCustomTooltip;
	}

	data.chart = opm_chartPlotOptions(chartObj);
	if(chartObj !== undefined && chartObj.chart !== undefined && chartObj.chart.brush !== undefined){
		data.chart.brush = chartObj.chart.brush;
	}else{
		data.chart.brush = {
			"enabled":(chartObj.showToolTip === false ? false : true),//No I18N
			"type":"xy", //NO I18N
			"resetButton":{//NO I18N
		      	"label":{//NO I18N
		          "text":"Reset Zoom",//NO I18N
		            "fontSize":11//NO I18N
		        },
		        "border":{//No I18N
		            "radius":6//NO I18N
		        },
		        "fillColor": "grey"//NO I18N
		    },
		    "selectionArea": {//NO I18N
	            "fillColor": "grey",//NO I18N
	            "strokeColor":"grey",//NO I18N
	            "dashStyle":"shortdash"//NO I18N
	        }
		};
	}

	if(chartObj.brush_options!==undefined) {
		if(chartObj.brush_options.actions !== undefined) {
			data.chart.brush.actions = chartObj.brush_options.actions;
		}
	}

	/*............ NetFlow Time Series Graph Related Changes Starts ............*/
	if(chartObj.isNFATimeSeriesGraph) {
		data.chart.plot.border = {
			show:true,
			color:"#eee" //NO I18N
		}

		var minTimeStamp = maxTimeStamp = 0;
		if(data.seriesdata.chartdata!==undefined && data.seriesdata.chartdata[0]!==undefined) {
			var tmpSeriesData = data.seriesdata.chartdata[0].data;
			if(tmpSeriesData[0]!==undefined && tmpSeriesData[0][0]!==undefined) {
				minTimeStamp = tmpSeriesData[0][0];
				maxTimeStamp = tmpSeriesData[tmpSeriesData.length-1][0];
			}
		}

		var i18nTextVal = chartObj.axes.xaxis.label.text.split(" ( ")[0]; //NO I18N
		var tFormatObj = nfa_getTimeFormatObject(maxTimeStamp-minTimeStamp);
		var graphTimeZone = data.nfaGraphTimeZone = (chartObj.timeZone!==undefined)?chartObj.timeZone:(window.OPM.userTimeZone!=null?window.OPM.userTimeZone:window.OPM.severTimeZone);
		var tooltopPattern = chartObj.timePatternString ? chartObj.timePatternString :"DD MMM YYYY HH:mm:ss z";//NO I18N
		//var tooltopPattern = chartObj.timePatternString ? chartObj.timePatternString : timeFormat;
		var lang = window.OPM.language;
		if(lang === undefined){
        	lang = "en-US";//NO I18N
        }
        lang = lang.replace("_","-").replace("sp","es");
        var formatter;
        if((chartObj.isFromExportPDF === undefined || chartObj.isFromExportPDF === false) && (chartObj.isFromSchedulePDF === undefined)){
            formatter = new Intl.DateTimeFormat(lang, {
                weekday: 'long',     //NO I18N
                year: 'numeric',     // "2025"
                month: 'long',       //NO I18N
                day: 'numeric',      // "23"
                hour: 'numeric',     // "11"
                minute: '2-digit',   // "13"
                second: '2-digit',   // "00"
                hour12: true,        // AM/PM format
                timeZone: graphTimeZone, // optional: specify desired timezone
                timeZoneName: 'long'  //NO I18N
            });
        }
		data.metadata.columns[0].time = {
			subfunction: tFormatObj.subFunction,
			inputformat: "MILLI", //NO I18N
			axisformat: {
				customFormat:function(value,datatype,columnInfo,type,chartObj) {
					return moment.tz(value,graphTimeZone).format(timeObj.specifier);
				}
			},
			tooltipformat: {
				customFormat:function(value,datatype,columnInfo) {
				    return ((chartObj.isFromExportPDF && chartObj.isFromSchedulePDF) || typeof mtz_pattern === 'undefined') ? "" : i18nTextVal+": "+((mtz_pattern.indexOf("zzzz") != -1) ? formatter.format(value) : moment.tz(value,graphTimeZone).format(mtz_pattern));
					//return i18nTextVal+": "+moment.tz(value,graphTimeZone).format(mtz_pattern);
				}
			}
		}

		var arr = chartObj.axes.yaxis[0].label.text.split(" ");
		var yAxisSuffix = (arr.length>1)?(arr[arr.length-2]):arr[0];

//DO NOT delete the below commented code, it may be useful in future
//This block will set the yaxis to 0-100 if the suffix is %
//        var maxValue = 100;
//        if(yAxisSuffix == '%')
//        {
//            if(chartObj.axes.yaxis[0].threshold !== 'undefined'){
//                var inPerc = chartObj.axes.yaxis[0].threshold.line.values[0];
//                var outPerc = chartObj.axes.yaxis[0].threshold.line.values[1];
//                if(inPerc > outPerc){
//                    maxValue = inPerc > 100 ? inPerc * 1.25 : 100;
//                }else{
//                    maxValue = outPerc > 100 ? outPerc * 1.25 : 100;
//                }
//
//            }
//            chartObj.axes.yaxis[0].minRange = 0;
//            chartObj.axes.yaxis[0].maxRange = maxValue;
//        }

		data.metadata.columns[1].numeric = {
			tooltipformat: {
				customFormat:function(value,datatype,columnInfo) {
					return parseFloat(value).toFixed(window.OPM.nfaDecimalCount)+" "+yAxisSuffix;
				}
			}
		}
		chartObj.axes.xaxis.label.text = i18nTextVal+" ( "+timeObj.specifier.toLocaleUpperCase()+" )"; //NO I18N
		chartObj.axes.xaxis.tickmark = {color:"grey",size:4,strokeWidth:4}; //NO I18N
		chartObj.axes.xaxis.grid = {show:true,color:"#ececec",style:"shortdashdotdot"}; //NO I18N

		chartObj.axes.yaxis[0].outerPadding=0.2;
		chartObj.axes.yaxis[0].grid = {show:true,color:"#ececec",style:"shortdashdotdot"}; //NO I18N

		data.tooltip =  {
			crosshair:{
				type:"x", //NO I18N
				color:"#D3D3D3", //NO I18N
				dashStyle:"dashed" //NO I18N
			},
			backgroundColor:"#000", //NO I18N
			sharedSeriesInfo:true
		}
	}
	/*............ NetFlow Time Series Graph Related Changes Ends ............*/
	if(chartObj.sharedSeriesInfo){
		data.tooltip =  {
			sharedSeriesInfo:true,
	        crosshair:{type:'x',color:'#7f7f7f',dashStyle:'dashed',strokeWidth:1},//No I18N
	        maxHeight: '100%'
	    }
	}
	if(chartObj.xAxisFormat !== undefined && chartObj.xAxisFormat !== 'xAxisFormat_default'){
		var subFunction = 'AUTO';//No I18N
		var specifier = 'timestamp';//No I18N
		var lowerTimeFormats = ['onehour','twelvehours','twfourhours','Today','Yesterday'];//No I18N
		var graphTimeZone = (window.OPM.userTimeZone!=null?window.OPM.userTimeZone:window.OPM.severTimeZone);
		switch(chartObj.xAxisFormat){
			case 'minute'://No I18N
				subFunction = 'ABSMINUTE';//No I18N
				// specifier = 'MILLI';//No I18N
			break;
			case 'hourly'://No I18N
				subFunction = 'ABSHOUR';//No I18N
			break;
			case 'daily'://No I18N
				if(lowerTimeFormats.indexOf(chartObj.timePeriod) > -1){
					subFunction = 'AUTO';//No I18N
				}else{
					subFunction = 'ABSDAY';//No I18N
				}
			break;
			case 'weekly'://No I18N
				lowerTimeFormats.push('thisweek','Last_7_Days');//No I18N
				if(lowerTimeFormats.indexOf(chartObj.timePeriod) > -1){
					subFunction = 'AUTO';//No I18N
				}else{
					subFunction = 'ABSWEEK';//No I18N
				}
			break;
			case 'monthly'://No I18N
				lowerTimeFormats.push('thisweek','Last_7_Days','Last_30_Days');//No I18N
				if(lowerTimeFormats.indexOf(chartObj.timePeriod) > -1){
					subFunction = 'AUTO';//No I18N
				}else{
					subFunction = 'ABSMONTH';//No I18N
				}
			break;
			case 'quarterly'://No I18N
				lowerTimeFormats.push('thisweek','Last_7_Days','Last_30_Days','Last_60_Days');//No I18N
				if(lowerTimeFormats.indexOf(chartObj.timePeriod) > -1){
					subFunction = 'AUTO';//No I18N
				}else{
					subFunction = 'ABSQUARTER';//No I18N
				}
			break;
		}
		data.metadata.columns[0].time.inputformat = specifier;
		data.metadata.columns[0].time.subfunction = subFunction;
		data.metadata.columns[0].time.format = {specifier:'timestamp'};
	}
	if(chartObj.scaleType){
		data.metadata.columns[1].scaleType = chartObj.scaleType;
	}
	if(chartObj.addNotesTooltip!==undefined){
		data.tooltip = chartObj.addNotesTooltip;
		if(chartObj.sharedSeriesInfo)
		{
		    data.tooltip.sharedSeriesInfo = true;
		    data.tooltip.crosshair = {"type":"x","color":"#7f7f7f","dashStyle":"dashed","strokeWidth":2};//No I18N
		}
	}
	if(chartObj.legend == undefined) {
		var leg={
			"colorBox": {//No I18N
				"shape": "circle",//No I18N
				"strokeOpacity": 1//No I18N
			},
			"fontFamily": "'LatoRegular'",//No I18N
			"colors":fluidicv2,//No I18N
			"fontSize": 16//No I18N
		}
		data.legend = leg;
	}else {
		if(chartObj.legend.colors===undefined)
		{
			chartObj.legend.colors=fluidicv2
		}
		data.legend = chartObj.legend;
		if(data.legend.selectAllBox!==undefined && data.legend.selectAllBox.shape===undefined){
			data.legend.selectAllBox.shape = "square";//No I18N
		}
	}
	if(data.legend.layout===undefined && (chartObj.type==="area" || chartObj.type==="bar" || chartObj.type==="line") && data.legend.vAlign!=="bottom"){//No I18N
		data.legend.layout = "vertical";//No I18N
	}
	data.legend.tooltip="true";//No I18N
	if(chartObj.isRealTime === undefined) {
		data = dashboardWidgetChartProperties(data,chartObj);
	}
	if(chartObj.notes !== undefined) {
		data.notes = chartObj.notes;
	}
	if(chartObj.isEnhancedGraph){
		if(chartObj.columns.suffix === undefined && data.metadata.columns[1].numeric !== undefined){
			data.metadata.columns[1].numeric.tooltipformat = {
				customFormat:function(value,datatype,columnInfo){
					return value+" "+ ((chartObj.columns.unit_suffix !== undefined) ? chartObj.columns.unit_suffix : chartObj.columns.columnname_2);
				}
			}
		}
		data.tooltip.fontSize = 11;
		data.tooltip.maxWidth = '100%';
	}
	
	if(chartObj.noChartAxes) {
		data.metadata.axes = chartObj.axes;
		data.metadata.columns = chartObj.columns;
	}
	
	return data;
}

function IntfBWCustomTooltip(event, data, chartObj)
{
	var currentZone = (window.OPM.severTimeZone !== undefined ? window.OPM.severTimeZone : moment.tz.guess());
	var tz_time = moment.tz(data.actData[0],currentZone);
	var timeData = tz_time.format(mtz_pattern);

	var unit = data.metaInfo[1].columnname;

	if(data.actData !== undefined && data.actData[3] !== undefined){
		return Ember.I18n.t('webclient.reports.time',this)+" : "+timeData+"<br/>"+Ember.I18n.t('webclient.devices.intftypes.min',this)+" : "+data.actData[3]+" ( "+unit+" )"+"<br/>"+Ember.I18n.t('webclient.devices.intftypes.max',this)+" : "+data.actData[4]+" ( "+unit+" )"+"<br/>"+Ember.I18n.t('webclient.devices.intftypes.avg',this)+" : "+data.actData[2]+" ( "+unit+" )"; //No I18n
	} 
	else {
		return Ember.I18n.t('webclient.reports.time',this)+" : "+timeData+"<br/>"+Ember.I18n.t('webclient.widget.value',this) +" : "+data.actData[2]+" ( "+unit+" )";	//No I18n
	}
}

function opmPerf_drawMMAValues(yaxis, consolidatedValues, chartID, legColors, series, arrayObj) {
    var self = window.OPM.currentView.handler.controller;
    var gridData = consolidatedValues;
    var threshold_obj = {values:[],colors:[],labels:[]};
    var confThresholdValues = [];
    var consolidatedVals = [];
    var summaryGridId = arrayObj.chartobj[0].summaryGridId;
    var colNames = [];
    var colModel = [];
    var defaultOptions = {multiselect:false,minRowsPerPage:10,skipNameEscapeCheck:true,Search:false,hideCSV:true,hideExcel:true};
   	var isClassicGrid = true;
   	var isMonitoringInterface = (OPMClient.InventoryDeviceDetailsController.inventorysnapType === 'MonitoringInterface');//No I18N
   	var show95thPercentile = arrayObj.chartobj[0].show95thPercentile;
   	var helpIconContent = [{title:(Ember.I18n.t('opu.common.MINIMUM')+'/'+Ember.I18n.t('webclient.reports.max')+'/'+Ember.I18n.t('webclient.availability.datatype.average')),description:Ember.I18n.t('webclient.opm.snapshot.monitors.graph.minmaxavg.help.card.desc')}];//No I18N
   	var policyName = self.get('policyName') || arrayObj.chartobj[0].policyName;
    var sortTypeFormat = ((isMonitoringInterface && policyName && (policyName !== 'discardRate' && policyName !== 'errorRate' && policyName !== 'utilization' && policyName !== 'rxutilization' && policyName !== 'txutilization')) || policyName === 'MerakiUplinkUsage') ? opm_customKMGTSort : 'number';//No I18N
    var getLegendColor = function(cellValue, options, rowdata, action){
    	if(isClassicGrid){
        	return "<span class='size9 inline-block' style='background-color:"+rowdata.legColor+"'/></span><span style='padding-left:5px'>"+escapeHTML(rowdata.seriesName)+"</span>";
    	}
    	return '';
    }
    if(self.get('isEnhancedGraph') && !isClassicGrid){
	    colNames = [Ember.I18n.t('webclient.opm.valueType')];
	    colModel = [{name:'valueType',index:'valueType',width:250,frozen:!self.get('gridShrinkToFit')}];//No I18N
	    gridData = [{valueType:Ember.I18n.t('opu.common.MINIMUM')},{valueType:Ember.I18n.t('webclient.reports.max')},{valueType:Ember.I18n.t('webclient.availability.datatype.average')},{valueType:Ember.I18n.t('webclient.devices.intftypes.95percentile')}];//No I18N
		defaultOptions.shrinkToFit = self.get('gridShrinkToFit');
	}else if(isClassicGrid){
		var unitText = !isMonitoringInterface ? '<i style="font-family:LatoRegular">'+arrayObj.chartobj[0].headerUnit+'</i>' : '';//No I18N
		colNames = [Ember.I18n.t('jsp.commonstr.Name'),(Ember.I18n.t('opu.common.MINIMUM')+unitText),(Ember.I18n.t('webclient.reports.max')+unitText),(Ember.I18n.t('webclient.availability.datatype.average')+unitText),''];//No I18N
		colModel = [
	        {name:'seriesName',index:'seriesName',width:20,search:false,formatter:getLegendColor},//No I18N
	        {name:'minVal',index:'minVal',sortable:true,sorttype:sortTypeFormat,width:13,search:false,formatter:isMonitoringInterface ? lastCollectedTimeMin : emptyHyphenFormatter},//No I18N
	        {name:'maxVal',index:'maxVal',sortable:true,sorttype:sortTypeFormat,width:13,search:false,formatter:isMonitoringInterface ? lastCollectedTimeMax : emptyHyphenFormatter},//No I18N
	        {name:'avgVal',index:'avgVal',sortable:true,sorttype:sortTypeFormat,width:13,search:false,formatter:emptyHyphenFormatter},//No I18N
	        {name:'legColor',index:'legColor',hidden:true,search:false}//No I18N
	    ];
	    if(show95thPercentile){
		    if(isMonitoringInterface){
		    	if(window.OPM.use95thPercentileValue){
		    		colNames.push(Ember.I18n.t('webclient.opm.snapshot.interface.95th.value'),'','');//No I18N
		    		colModel.push({name:'95thpercentileValue',index:'95thpercentileValue',sortable:true,sorttype:sortTypeFormat,width:13,formatter:emptyHyphenFormatter},{name:'minCollectionTime',index:'minCollectionTime',hidden:true},{name:'maxCollectionTime',index:'maxCollectionTime',hidden:true});//No I18N
		    	}else{
		    		colNames.push(Ember.I18n.t('webclient.billing.percentile')+' '+Ember.I18n.t('webclient.availability.datatype.average'),Ember.I18n.t('webclient.opm.snapshot.interface.95th.value'),'','');//No I18N
		    		colModel.push({name:'95thperc',index:'95thperc',sortable:true,sorttype:sortTypeFormat,width:13,search:false,formatter:emptyHyphenFormatter},{name:'95thpercentileValue',index:'95thpercentileValue',sortable:true,sorttype:sortTypeFormat,width:13,formatter:emptyHyphenFormatter},{name:'minCollectionTime',index:'minCollectionTime',hidden:true},{name:'maxCollectionTime',index:'maxCollectionTime',hidden:true});//No I18N
		    	}
		    }else{
		    	colNames.push((Ember.I18n.t('webclient.billing.percentile'))+unitText);//No I18N
		    	colModel.push({name:'95thperc',index:'95thperc',sortable:true,sorttype:sortTypeFormat,width:13,search:false,formatter:emptyHyphenFormatter});//No I18N
		    	helpIconContent.push({title:Ember.I18n.t('webclient.billing.percentile'),description:Ember.I18n.t('webclient.opm.snapshot.monitors.graph.percentile.help.card.desc')});//No I18N
		    }
		}
	}
	if(arrayObj.chartobj[0].showThresholdLines && arrayObj.chartobj[0].thresholds !== undefined){
		$.each(arrayObj.chartobj[0].thresholds,function(objKey,objValue){
			threshold_obj.values.push(objValue.value);
			confThresholdValues.push(objValue.value);
            threshold_obj.colors.push(objValue.colorCode);
            threshold_obj.labels.push(objValue.i18nText);
		});
	}
	if(consolidatedValues !== undefined && consolidatedValues.length > 0 && !self.get('isForecastGraph')){
		var consolidatedModData = [];
        $.each(consolidatedValues,function(key,instanceDetails){
        	if(self.get('isEnhancedGraph') && !isClassicGrid){
	        	var valueKey = 'polledValue_'+key;//No I18N
	        	colNames.push('<div class="fs14 mb-xs"><span class="size9 inline-block mr-xs" style="background:'+instanceDetails.legColor+'"></span><strong>'+escapeHTML(instanceDetails.seriesName)+'</strong></div>');//No I18N
	        	var colWidth = instanceDetails.seriesName.length * 10;
	        	colWidth = colWidth > 100 ? colWidth : 100;
	        	colModel.push({name:valueKey,index:valueKey,width:colWidth});
	            gridData[0][valueKey] = instanceDetails.minVal;
	            gridData[1][valueKey] = instanceDetails.maxVal;
	            gridData[2][valueKey] = instanceDetails.avgVal;
	            gridData[3][valueKey] = instanceDetails['95thperc'];
	        }else if(isClassicGrid){
            	if(isMonitoringInterface){
            		consolidatedModData.push({seriesName:instanceDetails.seriesName,minVal:instanceDetails.minVal,minCollectionTime:instanceDetails.minCollectionTime,maxVal:instanceDetails.maxVal,maxCollectionTime:instanceDetails.maxCollectionTime,avgVal:instanceDetails.avgVal,'95thperc':instanceDetails['95thperc'],'95thpercentileValue':instanceDetails['95thpercentileValue'],legColor:instanceDetails.legColor});
            	}else{
            		consolidatedModData.push({seriesName:instanceDetails.seriesName,minVal:instanceDetails.minVal,maxVal:instanceDetails.maxVal,avgVal:instanceDetails.avgVal,'95thperc':instanceDetails['95thperc'],legColor:instanceDetails.legColor});
            	}

	        }

            if(show95thPercentile){
	            if(instanceDetails['95thpercVal'] !== undefined){
	                var thresh_lineVal = Number(instanceDetails['95thpercVal']);
	                if(thresh_lineVal !== 0){
	                    threshold_obj.values.push(thresh_lineVal);
	                    threshold_obj.colors.push('#0088f5');//#ef7e7d//arrayObj.chartobj[0].seriesNameVsColorCodeArray[instanceDetails.seriesName]
	                    threshold_obj.labels.push('95th ('+instanceDetails.seriesName+')');//No I18N
	                }
	                consolidatedVals.push(instanceDetails['95thpercVal']);
	            }
	        }
        });
        if(show95thPercentile){
	        if(arrayObj !== undefined){
	            arrayObj.chartobj[0].legend.events = {
	                click:function (e,d,i,chartObj){
	                	var otherThresholdsSize = confThresholdValues.length;
	                    var thresholdValues = chartObj.userdata.chart.axes.yaxis[0].threshold.line.values;
	                    if(!d.disabled && ((thresholdValues.length - otherThresholdsSize) !== 0)){
	                        thresholdValues[i+otherThresholdsSize] = null;
	                    }else{
	                    	var thresh_lineVal = (consolidatedValues[i] !== undefined) ? Number(consolidatedValues[i]['95thpercVal']) : 0;
	                        thresholdValues[i+otherThresholdsSize] = (thresh_lineVal !== 0) ? thresh_lineVal : null;
	                    }
	                    chartObj.legend.component.toggleItemNUpdateChart(e.currentTarget, d, i, chartObj.systemConf.legend);
	                }
	            };
	            arrayObj.chartobj[0].legend.selectAllBox.events = {
	                click:function (e, selected, chartObj){
	                	var selectedValues = cloneObject(confThresholdValues);
	                    if(selected){
	                    	$.each(consolidatedVals,function(){
	                    		var currentValue = Number(this);
	                    		if(currentValue !== 0){
	                    			selectedValues.push(currentValue);
	                    		}
	                    	});
	                    }
	                    chartObj.userdata.chart.axes.yaxis[0].threshold.line.values = selectedValues;
	                    chartObj.legend.component.toggleSelectAll();
	                }
	            };
	        }
	    }
    }
    yaxis.threshold = {
    	line:{
    		show:true,values:threshold_obj.values,color:threshold_obj.colors,dashStyle:'1',
    		label:{text:threshold_obj.labels,hAlign:'left',fontColor:'rgb(97, 97, 97)',fontSize:10,'font-family':'LatoRegular'},//No I18N
    		events:{enabled:false}
    	}
    };
    if(isClassicGrid){
    	gridData = consolidatedModData;
    }
    Ember.run.scheduleOnce('afterRender',this,function(){//No I18N
        opm_loadJQgridWithData('#'+summaryGridId, gridData, colNames, colModel, "", "", "", defaultOptions);//No I18N
        if(!isMonitoringInterface){
        	self.setProperties({helpIconNeeded:true,helpIconContent:helpIconContent});
	    }else{
	    	if(arrayObj.chartobj[0].legendPlacement !== 'bottom'){
	    		$('.opmIntfGraph-details').addClass('legendRight');
	    	}
	    }
        if(self.get('isMultipleInstanceGraph') && !isClassicGrid){
        	$('#'+summaryGridId).jqGrid('setFrozenColumns');
        }
    });
}
//Report builder old code
function opm_drawMMAValuesForReportBuilder(consolidatedValues,chartID,isExport,seriesNameVsColorCodeMap) {
    if(Object.keys(consolidatedValues).length > 0)
    {
        $('#'+chartID+' .opmRamUsageInfo').empty();
        $("#"+chartID).append('<div class="opmRamUsageInfoHolder ml-none"><div class="opmRamUsageInfoContainer legendType2 fullCol" id="'+chartID+'_opmRamUsageInfoContainer"></div></div>');
		if(isExport){
			$('#graphdivelement .opmRamUsageInfoContainer.legendType2').css({'max-height':'100%'});
		}
		$.each(consolidatedValues,function(index,instanceDetails)
        {
            if(instanceDetails['95thpercentileValue'] !== undefined)
            {
                var nanVal = 'NAN';//No I18N
                var minVal = (instanceDetails.minVal!==undefined?instanceDetails.minVal:nanVal);
                var maxVal = (instanceDetails.maxVal!==undefined?instanceDetails.maxVal:nanVal);
                var avgVal = (instanceDetails.avgVal!==undefined?instanceDetails.avgVal:nanVal);
                var percVal = instanceDetails['95thpercentileValue'];

                if($("#"+chartID+"_opmRamUsageInfoContainer .opmDivTableFormate .tHdr").length >= 1)
                {
                    var MMAUsageInfo = "<div class='opmDivTableFormate left-align'><div><div id='sname_"+chartID+"_"+index+"'>"; //No I18n
					MMAUsageInfo=MMAUsageInfo+"<div class='flex'><span class='size15 inline-block mr-xs' style='background:";//NO I18N
					MMAUsageInfo=MMAUsageInfo+seriesNameVsColorCodeMap[instanceDetails.seriesName];
					MMAUsageInfo=MMAUsageInfo+";margin-top:2px !important'></span><span id='text'></span></div></div>";//NO I18N
					MMAUsageInfo=MMAUsageInfo+"<div id='min_"+chartID+"_"+index+"'></div><div id='max_"+chartID+"_"+index+"'></div><div id='avg_"+chartID+"_"+index+"'></div><div id='perc_"+chartID+"_"+index+"'></div></div></div>";//NO I18N
				}
                else
                {
                    var MMAUsageInfo = "<div class='opmDivTableFormate legendType left-align'><div class='tHdr'><div>Series Name</div><div>MIN</div><div>MAX</div><div>AVG</div><div>95th PercVal</div></div></div>"; //No I18n
					MMAUsageInfo=MMAUsageInfo+"<div class='opmDivTableFormate left-align'><div><div id='sname_"+chartID+"_"+index+"'>";//NO I18N
					MMAUsageInfo=MMAUsageInfo+"<div class='flex'><span class='size15 inline-block mr-xs' style='background:";//NO I18N
					MMAUsageInfo=MMAUsageInfo+seriesNameVsColorCodeMap[instanceDetails.seriesName];
					MMAUsageInfo=MMAUsageInfo+";margin-top:2px !important'></span><span id='text'></span></div></div>";//NO I18N
					MMAUsageInfo=MMAUsageInfo+"<div id='min_"+chartID+"_"+index+"'></div><div id='max_"+chartID+"_"+index+"'></div><div id='avg_"+chartID+"_"+index+"'></div><div id='perc_"+chartID+"_"+index+"'></div></div></div>";//NO I18N
				}
            }
            $("#"+chartID+"_opmRamUsageInfoContainer").append(MMAUsageInfo);
			$("#sname_"+chartID+"_"+index+" #text").text(instanceDetails.seriesName);
			$("#min_"+chartID+"_"+index).text(minVal);
			$("#max_"+chartID+"_"+index).text(maxVal);
			$("#avg_"+chartID+"_"+index).text(avgVal);
			$("#perc_"+chartID+"_"+index).text(percVal);
        });
    }
}

function opm_drawCustomFieldsTable(customFields,chartID,customFieldNames) {
	$("#"+chartID+"_headerDiv").after('<div class="opmRamUsageInfoContainer legendType2 width100 fs12" style="border-color:#f5f5f5;margin-top:15px" id="'+chartID+'_customFields_opmRamUsageInfoContainer"></div>');
	var index=1;
	var columnIndex=1;
	var rowIndex=1;
	$.each(customFieldNames,function(index,customFieldName) {
		var customFieldValue = customFields[customFieldName];
		if(customFieldValue!==undefined) {
			if(columnIndex==1 || columnIndex==4) {
				columnIndex=1;
				rowIndex++;
				var rowDiv = "<div class='opmDivTableFormate'><div id='"+chartID+"_"+rowIndex+"_rowData' class='background:#fff'></div></div>";
				$("#"+chartID+"_customFields_opmRamUsageInfoContainer").append(rowDiv);
			}
			var divData="<div id='customFieldName_"+chartID+"_customFields_"+index+"'></div>";//NO I18N
			$("#"+chartID+"_"+rowIndex+"_rowData").append(divData);
			$("#customFieldName_"+chartID+"_customFields_"+index).text(customFieldName+" : "+customFieldValue);
			index++;
			columnIndex++;
		}
	})
}

function opm_drawMMAValues(yaxis,consolidatedValues,chartID,legColors,series)
{
    
     var threshold_obj = {values:[],colors:[],labels:[]};
    if(Object.keys(consolidatedValues).length > 0)
    {
        $('#'+chartID+' .opmRamUsageInfo').empty();
        $("#"+chartID).append('<div class="opmRamUsageInfoHolder"><div class="opmRamUsageInfoContainer" id="'+chartID+'_opmRamUsageInfoContainer"></div></div>');
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
                var nanVal = Ember.I18n.t('webclient.devices.details.service.resalert');//No I18N
                var minVal = (instanceDetails.minVal!==undefined?instanceDetails.minVal:nanVal);
                var maxVal = (instanceDetails.maxVal!==undefined?instanceDetails.maxVal:nanVal);
                var avgVal = (instanceDetails.avgVal!==undefined?instanceDetails.avgVal:nanVal);
                var percAvg = (instanceDetails['95thperc']!==undefined?instanceDetails['95thperc']:nanVal);
                var percVal = instanceDetails['95thpercentileValue'];

                var minCollectedTime = (instanceDetails.minCollectionTime!==undefined?convertDateAndTime(parseInt(instanceDetails.minCollectionTime)):nanVal)
                var maxCollectedTime = (instanceDetails.maxCollectionTime!==undefined?convertDateAndTime(parseInt(instanceDetails.maxCollectionTime)):nanVal);

                if($("#"+chartID+"_opmRamUsageInfoContainer .opmDivTableFormate .tHdr").length >= 1)
                {
                   $("#"+chartID+"_opmRamUsageInfoContainer").addClass("legendType2");
                    var MMAUsageInfo = "<div class='opmDivTableFormate legendType'><div><div style='color:"+color+"'>"+instanceDetails.seriesName+"</div><div style='cursor:default' title='"+Ember.I18n.t('opm.intfdata.collectedtime',this)+" : "+minCollectedTime+"'>"+minVal+"</div><div style='cursor:default' title='"+Ember.I18n.t('opm.intfdata.collectedtime',this)+" : "+maxCollectedTime+"'>"+maxVal+"</div><div>"+avgVal+"</div><div>"+percAvg+"</div><div>"+percVal+"</div></div></div>"; //No I18n
                }
                else
                {
                    var MMAUsageInfo = "<div class='opmDivTableFormate legendType'><div class='tHdr'><div> </div><div>"+Ember.I18n.t('webclient.reports.tags.min',this)+"</div><div>"+Ember.I18n.t('webclient.reports.tags.max',this)+"</div><div>"+Ember.I18n.t('webclient.reports.tags.avg',this)+"</div><div>95th PercAvg</div><div>95th PercVal</div></div><div><div style='color:"+color+"'>"+instanceDetails.seriesName+"</div><div style='cursor:default' title='"+Ember.I18n.t('opm.intfdata.collectedtime',this)+" : "+minCollectedTime+"'>"+minVal+"</div><div style='cursor:default' title='"+Ember.I18n.t('opm.intfdata.collectedtime',this)+" : "+maxCollectedTime+"'>"+maxVal+"</div><div>"+avgVal+"</div><div>"+percAvg+"</div><div>"+percVal+"</div></div></div>"; //No I18n
                }
            } 
            else
            {
                var MMAUsageInfo = '<div class="opmRamUsageInfo" id="opmRamUsageInfo">'+opm_escapeHTML(instanceDetails.seriesName)+' - '+Ember.I18n.t('webclient.reports.tags.min',this)+': '+(instanceDetails.minVal!==undefined?instanceDetails.minVal:Ember.I18n.t('webclient.devices.details.service.resalert')) +'  '+Ember.I18n.t('webclient.reports.tags.max',this)+': '+(instanceDetails.maxVal!==undefined?instanceDetails.maxVal:Ember.I18n.t('webclient.devices.details.service.resalert')) +'   '+Ember.I18n.t('webclient.reports.tags.avg',this)+': '+ (instanceDetails.avgVal!==undefined?instanceDetails.avgVal:Ember.I18n.t('webclient.devices.details.service.resalert'))+ '   ' + (instanceDetails['95thperc']!==undefined? Ember.I18n.t('webclient.billing.percentile',this) +': '+instanceDetails['95thperc']: ''+'</div>'); //No I18n
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

function opm_chartPlotOptions(chartObj)
{

    var innerLabel = false;
    if(chartObj.pie !== undefined && chartObj.pie.innerLabel !== undefined)
    {
        var innerLabel = chartObj.pie.innerLabel;
    }

    var stacked = true;
    if(chartObj.chart !== undefined && chartObj.chart.stacked !== undefined)
    {
        stacked = chartObj.chart.stacked;
    }

    var levelMarker = false;
    if(chartObj.bar !== undefined && chartObj.bar.levelMarker !== undefined)
    {
        levelMarker = chartObj.bar.levelMarker;
    }

    var marker = true;
    if(chartObj.area !== undefined && chartObj.area.marker !== undefined)
    {
        marker = chartObj.area.marker;
    }

    var axes = true;
    axes = (chartObj.axes !== undefined && chartObj.axes.show !== undefined ? chartObj.axes.show : true);

    var chart = {
        "plot": {
            "plotoptions": {},
            "animation":{enabled:false},//No I18N
            "datalabels":(chartObj.datalabels !== undefined)?chartObj.datalabels:{}//No I18N
        }
    };

	var appendOption = {};
	switch(chartObj.type)
	{
		case "treemap"://No I18N
			appendOption = {
				"treemap": {//No I18N
					"outerPadding": 0,//No I18N
					"strokeColor": "#FFFFFF",//No I18N
					"strokeOpacity": 0.6,//No I18N
					"colorScheme": "solid",//No I18N
					"parent": {//No I18N
						"interPadding": 2//No I18N
					},
					"datalabels": {//No I18N
						"fontSize": 12,//No I18N
						"show": true,//No I18N
						"padding": 4,//No I18N
						"showAs": "x",//No I18N
						"textOverlap": "ellipsis"//No I18N
					}
				}
			}
			if(chartObj.clickEvent) {
				appendOption.treemap.events = {
					"click": chartObj.clickEvent,//No I18N
					"cursor": "pointer" //No I18N
				}
			}
			break;
	    case "pie"://No I18N
	                    
	        appendOption = {pie:{}}
	        if(chartObj.subType === "simplePie")
	        {
	           appendOption = {"pie": {//No I18N
	                             "gradients": {//No I18N
	                              //  "type": "linear"
	                             },
	                             "outerPadding": "0",//No I18N
	                            "sliceOutHeight": "3"//No I18N
	                     }
	                 }
	        }
	        else if(chartObj.subType === "simpleDonut")
	        {
	            appendOption =  {"pie": {"outerPadding": "10", "sliceOutHeight": "3"}};//No I18N
	            appendOption.pie.innerRadius = ((chartObj.pie !== undefined && chartObj.pie.innerRadius !== undefined)?chartObj.pie.innerRadius:"65%");

	        }
	        else if(chartObj.subType === "semiDonut")
	        {
	           appendOption =  {"pie": {"innerRadius": "50%",//No I18N
	                            "startAngle": -1.57,//No I18N
	                            "endAngle": 1.57,//No I18N
	                            "datalabels": {//No I18N
	                                "show": true,//No I18N
	                                "type": "circular"//No I18N
	                            }
	                        }
	                    }
	        }
	        else if(chartObj.subType === "boundBox") {
	            appendOption = {
	                   "pie": {//No I18N
	                        "datalabels": {//No I18N
								"handleOverlapping": (chartObj.datalabels !== undefined)?chartObj.datalabels.handleOverlapping:false,//No I18N
	                            "handleOverlapping": false,//No I18N
	                            "type": "doubleside",//No I18N
	                            "showAs": "y",//No I18N
	                            "show":true,//No I18N
	                            "padding":10,//No I18N
	                            "line": {//No I18N
	                                "strokeColor": null,//No I18N
	                                "strokeWidth": null//No I18N
	                            },
	                            "innerLabel":{"show":innerLabel}//No I18N
	                        }
	                        // "maxRadius":70
	                    }
	        	}
	    	}
	        else if(chartObj.subType === "doubleSideBoundBox")
	    	{
	        	chart.plot = {"datalabels": {"handleOverlapping": chartObj.datalabels ? chartObj.datalabels.handleOverlapping : false,"show": true,"boundBox": {"strokeColor": null,"show": true,"radius": 3,"padding": 4}}};		//No I18N
	        	appendOption = {
	        			"pie": {	//No I18N
	        				"datalabels": {	//No I18N
	        					"show": true,	//No I18N
	        					"showAs": "y",	//No I18N
	                            "type": "doubleside",	//No I18N
	                            "fontSize": chartObj.datalabels ? chartObj.datalabels.fontSize : "15"	//No I18N
	        				}
	        			}
	        	}
			}else if(chartObj.subType === "boundBoxType2")//No I18N
	    	{
	        	chart.plot = {"datalabels": {"handleOverlapping": true,"show": true,"boundBox": {"strokeColor": null,"show": true,"radius": 3,"padding": 4,"hook":{"enabled": true,"width": 8}}}};		//No I18N
	        	appendOption = {
        			"pie": {	//No I18N
        				"datalabels": {	//No I18N
        					"show": true,	//No I18N
        					"showAs": "y",	//No I18N
                            "type": "doubleside",	//No I18N
                            "fontSize":"15",	//No I18N
                            "line":{"strokeColor": null,"strokeWidth": null}//No I18N
        				}
        			}
	        	}
			}else if(chartObj.subType==="nfaSchedulePie") { //NO I18N
				appendOption = {
					pie: {
						datalabels: {
							handleOverlapping:false,
							type:"doubleside", //NO I18N
							showAs: "x", //NO I18N
							show:true,
							padding:10,
							line: {
								strokeColor: null,
								strokeWidth: null
							}
						}
					}
				}
			} else if(chartObj.subType==="deviceAvailabilitySchedule") { //NO I18N
				appendOption = {
					pie: {
						datalabels: {
							fontColor:"#000000",
							fontSize:10,
							handleOverlapping:true,
							type:"doubleside", //NO I18N
							showAs: ["{{val(0)}} - {{per(1)}}"],//NO I18N
							show:true,
							padding:10,
							line: {
								strokeColor: null,
								strokeWidth: null
							}
						}
					}
				}
			}

	        if(chartObj.subType !== "boundBox" && chartObj.subType !== "doubleSideBoundBox" && chartObj.subType!=="nfaSchedulePie" && chartObj.subType!=="boundBoxType2" && chartObj.subType!=="deviceAvailabilitySchedule"){//No I18N
	        appendOption.pie.datalabels = {"innerLabel":{"show":innerLabel}};//No I18N
	        appendOption.pie.datalabels = {"innerLabel":{"show":innerLabel,"showAs": "y"}};//No I18N
	        appendOption.pie.maxRadius = ((chartObj.pie !== undefined && chartObj.pie.maxRadius !== undefined)?chartObj.pie.maxRadius:"250");
	        appendOption.pie.strokeWidth = ((chartObj.pie !== undefined && chartObj.pie.strokeWidth !== undefined)?chartObj.pie.strokeWidth:"1");
	        appendOption.pie.outerPadding = ((chartObj.pie !== undefined && chartObj.pie.outerPadding !== undefined)?chartObj.pie.outerPadding:"10");//No I18N
	     }
		 if(chartObj.subType === "simpleDonut" && chartObj.plotoptions !== undefined && chartObj.plotoptions.pie!== undefined && chartObj.plotoptions.pie.datalabels !== undefined && chartObj.plotoptions.pie.datalabels.type !== undefined){
			appendOption.pie.datalabels = chartObj.plotoptions.pie.datalabels;
		}
	    break;
	    case "area"://No I18N
	        appendOption = {
	            area:{}
	        };
	        if(chartObj.subType === "smootharea")
	        {
	        	appendOption.area = {
	        		"mode": "cardinal",
	        		"animation": {
	        			"type": "pointTween"
	        		}
	        	}
				if(chartObj.subTypeOptions) {
					for(var option in chartObj.subTypeOptions) {
						appendOption.area[option] = chartObj.subTypeOptions[option];
					}
				}
				if(chartObj.mode) {
					appendOption.area.mode = chartObj.mode;
				}
				if(chartObj.area && chartObj.area.marker) {
					appendOption.area.marker = chartObj.area.marker;
				}
	        }else if(chartObj.subType === "steparea")
	        {
	        	appendOption.area = {
	        		"mode": "step-before",
	        		"animation": {
	        			
	        		},
	        		"stacked": {//No I18N
	        	        "enabled": stacked//No I18N
	        	    },
	        	    "marker": {//No I18N
	        	        "enabled": marker,//No I18N
	        	        "size": 1,//No I18N
	        	        "innerStrokeWidth": 0,//No I18N
	        	        "outerStrokeWidth": 1,//No I18N
	        	        "outerFillColor": "white",//No I18N
	        	        "outerStrokeOpacity": 0,//No I18N
	        	        "innerFillColor": null//No I18N
	        	    }
	        	}
	        } else {
	        	appendOption.area = {
	                            "fillOpacity": 0.3,
	        		    "stacked": {//No I18N
	        		        "enabled": stacked//No I18N
	        		    },
	        		    "marker": {//No I18N
	        		        "enabled": marker,//No I18N
	        		        "size": 1,//No I18N
	        		        "innerStrokeWidth": 0,//No I18N
	        		        "outerStrokeWidth": 1,//No I18N
	        		        "outerFillColor": "white",//No I18N
	        		        "outerStrokeOpacity": 0,//No I18N
	        		        "innerFillColor": null//No I18N
	        		    }
	        		}
	        }
			if(chartObj.hoveroptions) {
				appendOption.area.hoveroptions = chartObj.hoveroptions;
			}
	        if(chartObj.isFWAChart){
	            appendOption.area.datalabels = {"show":true,"labelPos":"top","fontSize":10}; //No I18N 
	        }
	        break;
	    case "line"://No I18N
	        appendOption = {
	            "line": {//No I18N
	                "marker": {//No I18N
	                    "enabled": "true"//No I18N
	                }
	            }
	        }
	        if(chartObj.line !== undefined){
	        	if(chartObj.line.strokeWidth !== undefined) {
		            appendOption.line.strokeWidth = chartObj.line.strokeWidth;
		        }
		        if(chartObj.line.mode !== undefined) {
		            appendOption.line.mode = chartObj.line.mode;
		        }
		        if(chartObj.line.events !== undefined) {
		            appendOption.line.events = chartObj.line.events;
		        }
		        if(chartObj.line.marker !== undefined) {
		            appendOption.line.marker = chartObj.line.marker;
		        }
		        if(chartObj.line.hoveroptions !== undefined) {
		            appendOption.line.hoveroptions = chartObj.line.hoveroptions;
		        }
	        }
	        if(chartObj.subType === "step-after") {
	        	appendOption.line.mode="step-after";
	    	} else if(chartObj.subType === "smoothLine") {//No I18N
	        	appendOption.line.mode="cardinal";//No I18N
			}
	        if(chartObj.isFWAChart){
	            appendOption.line.datalabels = {"show":true,"labelPos":"top","fontSize":10}; //No I18N 
	        }
			if(chartObj.mode) {
				appendOption.line.mode = chartObj.mode;
			}
	        break;
	    case "bar"://No I18N
	        appendOption = {
	            "bar": {//No I18N
	                "levelMarker": {//No I18N
	                    "enabled": levelMarker//No I18N
	                },
	                "stacked": {//No I18N
	                    "enabled": stacked//No I18N
	                }
	            }
	        }
	        if(chartObj.isOputilsBarChart){
	            appendOption.bar.maxBandWidth=45; //No I18N 
	        }
			if(chartObj.bar && chartObj.bar.maxBandWidth) {
	            appendOption.bar.maxBandWidth = chartObj.bar.maxBandWidth;
			}
	        if(chartObj.isFWAChart){
	            appendOption.bar.datalabels = {"show":false,"labelPos":"top","fontSize":12,"stackLabels":{"show":true}}; //No I18N
	            appendOption.bar.stacked = {"enabled":true}; //No I18N
	        }
	        if(chartObj.bar !== undefined && chartObj.bar.levelMarkerObj !== undefined)
    		{
        		$.each(chartObj.bar.levelMarkerObj,function(key,val){
        			appendOption.bar.levelMarker[key]=val;
        		});
   	 		}
	        break;
	    case "dial"://No I18N
	        if(chartObj.subType === "simpleDial")
	        {
	            appendOption = {
	                "dial": {//No I18N
	                    "outerPadding": 50//No I18N
	                }
	            }
	        }
	        else if(chartObj.subType === "gaugeDial")
	        {
	            appendOption = {
	                "dial": {//No I18N
	                    "startAngle": -3.14,//No I18N
	                    "endAngle": 3.14,//No I18N
	                    "innerRadius": "75%",//No I18N
	                    "maxRange": 100,//No I18N
	                    "needle": {//No I18N
	                        "show": false,//No I18N
	                        "width": 10,//No I18N
	                        "padding": 5//No I18N
	                    },
	                    "minmaxlabels": {//No I18N
	                        "show": false//No I18N
	                    }
	                }
	            }
	        }
	        break;   
	    case 'packedbubble':    //No I18N
	        appendOption = {
	            packedbubble: {
	                mode: "flat",
	                interPadding: 1,
	                fillOpacity: 0.6
	            }
	        }
	    break;
	    case 'scatter':    //No I18N
	        appendOption = {
	           "scatter": {//No I18N
	                    "marker": {//No I18N
	                        "innerFillColor": null//No I18N
	                    }
	                }
	        }
	    break;
	    default: break;
	}

	if(chartObj.axes == undefined) {
		chart.axes = {
	        "xaxis": {//No I18N
	            "label": {//No I18N
	                "text": "",//No I18N
	                "show": "false"//No I18N
	            },
	             "ticklabel": {//No I18N
	                "rotation": "auto"//No I18N
	            },
	            "show":axes//No I18N
	        },
	        "yaxis": [//No I18N
	            {
	                "label": {//No I18N
	                    "text": "",//No I18N
	                    "show": "false"//No I18N
	                },
	                "show": axes//No I18N
	            }
	        ]
	    }

	} else {
		chart.axes = chartObj.axes;
		if(chartObj.yaxis && chartObj.yaxis.showThresholdLine) {
			chart.axes.yaxis[0].threshold = chartObj.yaxis.threshold;
		}
	}

	if(chartObj.type === 'bar' && chartObj.bar !== undefined && chartObj.bar.rotated !== undefined)
	{   
	    chart.axes.rotated = chartObj.bar.rotated;
	}
	if(chartObj.type === 'pie' && chartObj.margin != undefined)
	{   
		chart.marginTop = chartObj.margin;
		chart.marginRight = chartObj.margin;
		chart.marginBottom = chartObj.margin;
		chart.marginLeft = chartObj.margin;
	}

	if(chartObj.chart !== undefined)
	{
		if(chartObj.chart.marginLeft !== undefined){   
	    	chart.marginLeft = chartObj.chart.marginLeft;
		}
		if(chartObj.chart.rendererMode !== undefined){   
	    	chart.plot.renderer = {"mode":chartObj.chart.rendererMode};//No I18N
		}
		if(chartObj.chart.marginTop !== undefined){   
	    	chart.marginTop = chartObj.chart.marginTop;
		}
		if(chartObj.chart.marginBottom !== undefined){   
	    	chart.marginBottom = chartObj.chart.marginBottom;
		}
		if(chartObj.chart.marginRight !== undefined){
	    	chart.marginRight = chartObj.chart.marginRight;
		}
	}
	
	if(chartObj.height > 400){
		if(!chartObj.isEnhancedGraph){
			chart.marginBottom = chartObj.height - 400;
		}
		chart.fontSize = 14;
	}
	chart.plot.plotoptions = appendOption;
	if(chartObj.type === 'dial' && chartObj.chart === undefined && chartObj.marginLeft != undefined && chartObj.marginRight != undefined){//No I18N
		chart.marginLeft = chartObj.marginLeft;
		chart.marginRight = chartObj.marginRight;
	}
	if(appendOption!==undefined && appendOption.pie!==undefined && appendOption.pie.datalabels!==undefined && appendOption.pie.datalabels.handleOverlapping) {
	    chart.plot.datalabels = {handleOverlapping:true};
	}
	if(chartObj.plot !== undefined) {
	    if(chartObj.plot.events !== undefined) {
	        chart.plot.events = chartObj.plot.events;
	    }
	    if(chartObj.plot.animation !==undefined){
	        chart.plot.animation = chartObj.plot.animation;
	    }
	    if(chartObj.plot.plotoptions!==undefined){
	        chart.plot.plotoptions = chartObj.plot.plotoptions;
	    }
	}
	return chart; 
}
//the below is duplicated as OPMClient.ApplicationController.colorCodeArray, if any changes done here, add the same in colorCodeArray as well
var fluidicv2 = [
	'#00c6e4', //No I18N
	'#faa43a', //No I18N
	'#5da5da', //No I18N
	'#60bd68', //No I18N
	'#f17cb0', //No I18N
	'#b2912f', //No I18N
	'#307d99', //No I18N
	'#0093D8', //No I18N
	'#fc7c63', //No I18N
	'#a0bf60', //No I18N
	'#bf6060', //No I18N
	'#be9b89', //No I18N
	'#5cbc69', //No I18N
	'#f15272', //No I18N
	'#006cb7', //No I18N
	'#784949', //No I18N
	'#9592b0', //No I18N
	'#a957c9', //No I18N
	'#0093d8', //No I18N
	'#71cfeb', //No I18N
	'#9467ac', //No I18N
	'#478ed9', //No I18N
	'#746ecf', //No I18N
	'#ffc10f', //No I18N
	'#8f9ff2', //No I18N
	'#e9519a', //No I18N
	'#969a28', //No I18N
	'#d83bff', //No I18N
	'#646a6a', //No I18N
	'#c776b0', //No I18N
	'#ee5655', //No I18N
	'#596663', //No I18N
	'#4f57c3', //No I18N
	'#93888b', //No I18N
	'#4761ae', //No I18N
	'#89928f', //No I18N
	'#ff44c8', //No I18N
	'#99795b', //No I18N
	'#15568b', //No I18N
	'#617b94', //No I18N
	'#00df9a', //No I18N
	'#a19279', //No I18N
	'#a6cf38', //No I18N
	'#237dbc', //No I18N
	'#00e06e', //No I18N
	'#7d889e', //No I18N
	'#e9c991', //No I18N
	'#b8b7cc', //No I18N
	'#0fa8d1', //No I18N
	'#99b2e1', //No I18N
	'#0dea41', //No I18N
	'#ac4a72', //No I18N
	'#5c577d', //No I18N
	'#3abdb7', //No I18N
	'#cd833a', //No I18N
	'#badb26', //No I18N
	'#a84014', //No I18N
	'#fbd60c', //No I18N
	'#56b64b', //No I18N
	'#d9896c', //No I18N
	'#9e8b21', //No I18N
	'#a2ec60', //No I18N
	'#5b853b', //No I18N
	'#d36e5c', //No I18N
	'#816b1f', //No I18N
	'#f99837', //No I18N
	'#506d33', //No I18N
	'#d270a6', //No I18N
	'#c27f00' //No I18N
];


var timeFormatObj = {
    "HMS":{
        subfunction:"DATETIME",
        specifier:"HH:mm:ss",//No I18N
        specifier_pdf:"HH:mm:ss"//No I18N
    },//No I18N
     "seconds":{
        subfunction:"DATETIME",
        specifier:"mm:ss",//No I18N
        specifier_pdf:"mm:ss"//No I18N
    },//No I18N
    "minutes":{
        subfunction:"DATETIME",
        specifier:"mm:ss",//No I18N
        specifier_pdf:"mm:ss"//No I18N
    },//No I18N
    "hours":{
        subfunction:"DATETIME",
        specifier:"HH:mm",//No I18N
        specifier_pdf:"HH:mm"//No I18N
    },//No I18N
    "thisweek":{
        subfunction:"DATETIME",
        specifier:"DD MMM HH:mm",//No I18N
        specifier_pdf:"dd MMM HH:mm"//No I18N
    },//No I18N
    "custom":{
        subfunction:"DATETIME",
        specifier:"DD MMM YY HH:mm",//No I18N
        specifier_pdf:"dd MMM YY HH:mm"//No I18N
    },//No I18N
    "week":{
        subfunction:"ABSDAY",
        specifier:"ddd",//No I18N
        specifier_pdf:"EEE"//No I18N
    },//No I18N
    "date":{
        subfunction:"DATETIME",
        specifier:"DD HH",//No I18N
        specifier_pdf:"dd HH"//No I18N
    },//No I18N
    "month":{
        subfunction:"ABSMONTH",
        specifier:"MMM",//No I18N
        specifier_pdf:"MMM"//No I18N
    },//No I18N
    "year":{
        subfunction:"YEAR",
        specifier:"YYYY",//No I18N
        specifier_pdf:"YYYY"//No I18N
    },
    "datewise":{
        subfunction:"DATE",
        specifier:"DD - MM - YYYY",//No I18N
        specifier_pdf:"dd - MM - YYYY"//No I18N
    },
    "daywise":{
        subfunction:"DATE",
        specifier:"MMM DD",//No I18N
        specifier_pdf:"MMM dd"//No I18N
    },
    "weekwise":{//No I18N
        subfunction:"ABSWEEK",//No I18N
        specifier:"Week EE, YYYY",//No I18N
        specifier_pdf:"Week EE, YYYY"//No I18N
    },
    "monthwise":{//No I18N
        subfunction:"ABSMONTH",//No I18N
        specifier:"MMM YYYY",//No I18N
        specifier_pdf:"MMM YYYY"//No I18N
    },
    "fulltime":{
    	subfunction:"DATETIME",
        specifier:"DD - MM - YYYY HH:mm",//No I18N
        specifier_pdf:"dd - MM - YYYY HH:mm"//No I18N
    },
    "dayanddate":{
    	subfunction:"ABSDAY",
        specifier:"ddd DD",//No I18N
        specifier_pdf:"EEE dd"//No I18N
    },
    "hourOnly":{
        subfunction:"ABSHOUR",
        specifier:"HH",//No I18N
        specifier_pdf:"HH"//No I18N
    },
    "dateOnly":{
        subfunction:"ABSMONTH",//NO I18N
        specifier:"DD MMM",//NO I18N
        specifier_pdf:"dd MMM"//NO I18N
    },
    "monthOnly":{
        subfunction:"ABSMONTH",
        specifier:"MMM",//No I18N
        specifier_pdf:"MMM"//No I18N
    },
    "monthly":{
    	subfunction:"DATE",
        specifier:"DD-MMM",//No I18N
    	specifier_pdf:"dd-MMM"//No I18N
    },
    "quarterly":{
        subfunction:"DATE",
        specifier:"MMM-YYYY",//No I18N
        specifier_pdf:"MMM-YYYY"//No I18N
    },
	"yearly":{ //NO I18N
		subfunction:"DATE", //NO I18N
		specifier:"DD MMM YY", //NO I18N
		specifier_pdf:"DD MMM YY" //NO I18N
	},
	//this formatter will show day component in x-axis and customFormat will be disabled for the below formatter
	"dayInMonth":{//NO I18N
		subfunction:"DATE",//NO I18N
		specifier:"dd",//No I18N
        specifier_pdf:"dd"//No I18N
	}
}

var timePeriodformat = {
    "HMS":"HMS", //No I18N
    "seconds":"seconds", //No I18N
    "onehour":"hours", //No I18N
    "twohours":"hours", //No I18N
    "fourhours":"hours", //No I18N
    "sixhours":"hours", //No I18N
    "eighthours":"hours", //No I18N
    "twelvehours":"hours", //No I18N
    "twfourhours":"hours", //No I18N
    "Today":"hours", //No I18N
    "Yesterday":"hours", //No I18N
    "thisweek":"thisweek", //No I18N
    "lastweek":"week", //No I18N
    "thismonth":"thisweek", //No I18N
    "Last_7_Days":"thisweek", //No I18N
    "Last_30_Days":"thisweek", //No I18N
    "Last_60_Days":"thisweek", //No I18N
    "Last_90_Days":"thisweek", //No I18N
    "Last_Month":"thisweek", //No I18N
    "Last_3_Months":"thisweek", //No I18N
    "Last_6_Months":"thisweek", //No I18N
    "Last_Quarter":"thisweek", //No I18N
    "This_Quarter":"thisweek", //No I18N
    "Datewise": "datewise", //No I18N
    "Daywise": "daywise",//NO I18N
    "custom":"custom",//NO I18N
    "Next_12_hours":"hours",//NO I18N
	"Next_24_hours":"hours",//NO I18N
	"This_Week":"thisweek",//NO I18N
	"Next_7_days":"thisweek",//NO I18N
	"Next_14_days":"thisweek",//NO I18N
    "fulltime":"fulltime",//NO I18N
    "dayanddate":"dayanddate",//NO I18N
    "hourOnly":"hourOnly",//NO I18N
    "dateOnly":"dateOnly",//NO I18N
    "monthOnly":"monthOnly",//NO I18N
    "24Hour": "hours",//No I18N
    "7Days": "dayanddate",//No I18N
    "30Days": "datewise",//No I18N
    "monthly":"monthly",//NO I18N
    "quarterly":"quarterly",//NO I18N
    "yearly":"yearly", //NO I18N
	"dayInMonth":"dayInMonth",//NO I18N
	"weekwise":"weekwise",//NO I18N
	"monthwise":"monthwise"//NO I18N
};
function dashboardWidgetChartProperties(data,chartObj)
{
	var pathname = location.pathname;
	if(chartObj.isInstantWidget )
	{
		data.legend.enabled = false;
		data.chart.axes.xaxis.label.show = false;
		data.chart.axes.xaxis.ticklabel={}
		data.chart.axes.xaxis.tickmark.align ="between";//NO I18N
		data.chart.axes.xaxis.ticklabel.alignMode = "rotate(0)"; //NO I18N
		chartObj.height =120;
		return data;
	}
	if(chartObj.isDashboardWidget )
	{
		if(data.chart.plot)
		{
			data.chart.plot = {}
		}		
		data.chart.plot.renderer = {};
		data.chart.plot.renderer.mode = "CANVAS";//NO I18N
		data.chart.axes.xaxis.ticklabel={}
		data.chart.axes.xaxis.ticklabel.rotation = undefined;
		data.chart.axes.xaxis.ticklabel.textOverflow="ellipsis";//NO I18N
		data.chart.axes.xaxis.tickmark.align ="left";//NO I18N
		data.chart.axes.xaxis.ticklabel.alignMode = "rotate(0)"; //NO I18N
		if (chartObj.type == "bar" && chartObj.isSummaryReport) {
			var jsonData = chartObj.jsonData;
			if (jsonData && jsonData.length && jsonData[0].data && jsonData[0].data[0].length) {
				var liElement = $("#" + chartObj.id.replace("perfGraph", "li"));
				if (liElement.length) {
					var barWidth = liElement.width() / (jsonData[0].data[0].length + 2);
					var maxWidth = isNaN(barWidth) || barWidth < 30 ? undefined : Math.min(barWidth, 1500);
					data.chart.axes.xaxis.ticklabel.alignMode = "rotate(0)"; //NO I18N
					data.chart.axes.xaxis.ticklabel.maxWidth = maxWidth;
				}
			}
		}
		chartObj.height =320;
		return data;
	}
	if(chartObj.isCCTVWidget)
	{
		if(data.chart.plot)
		{
			data.chart.plot = {}
		}		
		data.chart.plot.renderer = {};
		data.chart.plot.renderer.mode = "CANVAS";//NO I18N
		data.chart.axes.xaxis.ticklabel={}
		data.chart.axes.xaxis.ticklabel.rotation = undefined;
		if (data.chart.axes.yaxis && data.chart.axes.yaxis[0].label.text == "%" && chartObj.type == "line" )//No I18N
		{
			data.chart.axes.yaxis[0].maxRange = 105;
		}
		data.chart.axes.xaxis.ticklabel.textOverflow="ellipsis";//NO I18N
		data.chart.axes.xaxis.tickmark.align ="left";//NO I18N
		data.chart.axes.xaxis.ticklabel.alignMode = "rotate(0)"; //NO I18N
		if (chartObj.type == "bar" && chartObj.isSummaryReport) {
			var jsonData = chartObj.jsonData;
			if (jsonData && jsonData.length && jsonData[0].data && jsonData[0].data[0].length) {
				var liElement = $("#" + chartObj.id.replace("perfGraph", "li"));
				if (liElement.length) {
					var barWidth = liElement.width() / (jsonData[0].data[0].length + 2);
					var maxWidth = isNaN(barWidth) || barWidth < 30 ? undefined : Math.min(barWidth, 1500);
					data.chart.axes.xaxis.ticklabel.alignMode = "rotate(0)"; //NO I18N
					data.chart.axes.xaxis.ticklabel.maxWidth = maxWidth;
				}
			}
		}
		
		data.chart.marginBottom = 0;
		data.chart.marginTop =30;
		chartObj.height =250;
		return data;
	}
	if(chartObj.isPerformanceMetricWidget){
		return data;
	}

		
	if(pathname.indexOf("/apiclient/ember/index.jsp") == -1)
	{
		return data;
	}
	if(OPMClient.ApplicationController.currentPath.indexOf("Home.Dashboard") >= 0 )
	{
	    switch(chartObj.type)
	    {
	    case "area"://No I18N
	        data.legend.vAlign="top";//No I18N
	        data.legend.hAlign="right";//No I18N
			if(!chartObj.isInstantWidget) {
				if(data.chart.plot.plotoptions.area && data.chart.plot.plotoptions.area.marker){
					data.chart.plot.plotoptions.area.marker.enabled = true;
				}
			}
			if(chartObj.marginBottom) {
				data.chart.marginBottom = chartObj.marginBottom;
			} else {
				data.chart.marginBottom = -30;
			}
			if(chartObj.marginRight) {
				data.chart.marginRight = chartObj.marginRight;
			} else {
				data.chart.marginRight =-20;
			}
	        data.chart.axes.xaxis.label.show = true;
			chartObj.height=250;
			if(chartObj.isInstantWidget){
	        	chartObj.height=110;
			}
	        break;
	    case "line"://No I18N
	    	data.legend.vAlign="top";//No I18N
	        data.legend.hAlign="right";//No I18N
	        // data.chart.plot.plotoptions.line.marker.enabled=false;
	        data.chart.marginBottom = -50;
	        data.chart.marginRight =-20;
	        data.chart.axes.xaxis.label.show = false;
	        chartObj.height=180;
			if(chartObj.isInstantWidget){
	        	chartObj.height=70;
			}
	        break;
			case "bar"://No I18N
			if(chartObj.isInstantWidget){
				
	        data.chart.marginBottom = -0;
	        data.chart.marginRight =-0;
			
			data.legend.enabled = false;
	        data.chart.axes.xaxis.label.show = false;
	        chartObj.height=130;
			

			}
	        break;
	    }
	}
	else if(OPMClient.ApplicationController.currentPath.indexOf("CCTVSlide") >= 0 )
	{
		//var height = $(".grid-stack-item-content").eq(0).height() / parseInt($(".grid-stack-item-content").eq(0).attr("data-gs-height"));
		switch(chartObj.type)
	    {
	    case "area"://No I18N
	        data.legend.vAlign="top";//No I18N
	        data.legend.hAlign="right";//No I18N
			if(data.chart.plot.plotoptions.area.marker) {
				data.chart.plot.plotoptions.area.marker.enabled=true;
			}
	        //data.chart.marginBottom = -90;
	        data.chart.axes.xaxis.label.show = true;
	        //chartObj.height=height-height/2;
	        break;
	    case "line"://No I18N
	        data.legend.vAlign="top";//No I18N
	        data.legend.hAlign="right";//No I18N
	        data.chart.plot.plotoptions.line.marker.enabled=true;
	        data.chart.axes.xaxis.label.show = true;
	        //data.chart.marginBottom = -50;
	        //chartObj.height=height-height/2;
	        break;
	    }
	}
	return data;
}

function nfa_milliSecondToAbsoluteTime(ms) {
	var seconds = Math.floor(ms / 1000),
		minute = Math.floor(seconds / ( 60)),
		hour = Math.floor(minute / (60)),
		day = Math.floor(hour / (24)),
		month = Math.floor(day / (30.436854166666667)),
		years = Math.floor(day / 365.24225);

	return {
		seconds: seconds,
		minute: minute,
		hour: hour,
		day: day,
		month: month,
		years: years
	}
}

function nfa_getTimeFormatObject(milliseconds) {
	var timeFrmtObj = {},absoluteTime = nfa_milliSecondToAbsoluteTime(milliseconds);
	if(absoluteTime.years > 1) {
		timeFrmtObj.subFunction = "YEAR"; //No I18N
		timeFrmtObj.specifier = "MMM YYYY"; //No I18N
	}
	else if(absoluteTime.month > 1) {
		timeFrmtObj.subFunction = "ABSMONTH"; //No I18N
		timeFrmtObj.specifier = "DD-MMM"; //No I18N
	}
	else if(absoluteTime.day > 1) {
		timeFrmtObj.subFunction = "ABSDAY"; //No I18N
		timeFrmtObj.specifier = "DD-MMM"; //No I18N
	}
	else if(absoluteTime.hour > 1 || absoluteTime.minute > 1) {
		timeFrmtObj.subFunction = "ABSMINUTE"; //No I18N
		timeFrmtObj.specifier = "HH:mm"; //No I18N
	}
	else {
		timeFrmtObj.subFunction = "ABSSECOND"; //No I18N
		timeFrmtObj.specifier = "mm:ss"; //No I18N
	}
	return timeFrmtObj;
}
function synchronizedEvents_mousemove(e, d, chart)
{
	// $('.__baseZC_Container__ > div').removeClass("showAnnotation");
	// $($(chart.tooltip.element._groups[0])).addClass("showAnnotation");
	if($(chart.tooltip.element._groups[0]).find('input[name="timeValue"]').val()!=d.point[0]){
		$('.__baseZC_Container__ > div').removeClass("showAddAction");
	}
	var dependentChartInstances = [];
	var seriesIndex = d.seriesIndex;
	// var subseriesIndex = d.subSeriesIndex;
	// var itemIndex = d.itemIndex;
	var selectedTime = d.point[0];
	var chartId = chart.chartParentElement._parents[0].id;
	$.each(OPMClient.RCAController.chartEntities,function(key,value){
		if(("zcContain_"+key)!==chartId){
			dependentChartInstances.push(value.chartObj);
		}
	});
     var defaultZCBehaviour = $ZC.getPlotDefaultBehaviour();
     dependentChartInstances.map(function(_chart, i)
     {
          //FLATTEN POINTS
          if(_chart!==undefined)
          {
               var chartName = "line";//No I18N
               var paneid = 'pane0_0';//No I18N
               var flattenPoints = _chart.dataObject.flattenPoints.get(paneid);
               var itemIndexObj = {};
               for (var key in flattenPoints.get(chartName))
               {
                    if(flattenPoints.get(chartName).hasOwnProperty(key))
                    {
                         var seriesData = flattenPoints.get(chartName)[key];
                         for(var i=0;i<seriesData.length;i++)
                         {
                              if(seriesData[i][0]===selectedTime)
                              {
                                   itemIndexObj[key]=i;
                                   break;
                              }
                         }
                    }
               }
               for (var key in flattenPoints.get(chartName))
               {
                    if(flattenPoints.get(chartName).hasOwnProperty(key))
                    {
                         var data = flattenPoints.get(chartName)[key][itemIndexObj[key]];
                         if(data!==undefined)
                         {

	                         //SELECTION MANAGER
	                         var eventManager = _chart.eventHandler.eventManager;
	                         var selectionManager = eventManager.selectionManager;

	                         //MOUSE POSITION
	                         //get trackerelement boundbox
	                         var bbox = _chart.eventHandler.trackerElement.node().getBoundingClientRect();
	                         //assign chart.eventHandler.mousePos = data.x,data.y
	                         var mouse = {
	                              x: data._data()._x,
	                              y: data._data()._y
	                         };
	                         //Need to change the clientX,Y position as tooltip needs this. In future we need to change the dependency of clientX,clientY for tooltipPosition
	                         var clientEvent = {
	                              clientX: mouse.x + bbox.left,
	                              clientY: mouse.y + bbox.top
	                         };
	                         _chart.eventHandler.targetEvent = clientEvent;
	                         _chart.eventHandler.targetEvent.type = chart.eventHandler.targetEvent.type;
	                         eventManager.targetEvent = _chart.eventHandler.targetEvent;

	                         //UPDATE SELECTION MANAGER
	                         selectionManager.nearest = data;

	                         selectionManager.nearby = [];
	                         if(flattenPoints.get(chartName)["0_0"]!==undefined  && itemIndexObj["0_0"]!==undefined){
	                             selectionManager.nearby.push(flattenPoints.get(chartName)["0_0"][itemIndexObj["0_0"]]); 
	                         }
	                         if(flattenPoints.get(chartName)["1_0"]!==undefined  && itemIndexObj["1_0"]!==undefined){
	                             selectionManager.nearby.push(flattenPoints.get(chartName)["1_0"][itemIndexObj["1_0"]]); 
	                         }
	                         if(flattenPoints.get(chartName)["2_0"]!==undefined  && itemIndexObj["2_0"]!==undefined){
	                             selectionManager.nearby.push(flattenPoints.get(chartName)["2_0"][itemIndexObj["2_0"]]);
	                         }
	                         if(flattenPoints.get(chartName)["3_0"]!==undefined  && itemIndexObj["3_0"]!==undefined){
	                             selectionManager.nearby.push(flattenPoints.get(chartName)["3_0"][itemIndexObj["3_0"]]);
	                         }
	                         if(flattenPoints.get(chartName)["4_0"]!==undefined  && itemIndexObj["4_0"]!==undefined){
	                             selectionManager.nearby.push(flattenPoints.get(chartName)["4_0"][itemIndexObj["4_0"]]);
	                         }
	                         eventManager.updateSelectionManager(selectionManager);
	                         defaultZCBehaviour.mousemove.map(function(d, i) {
	                              d.action().call(eventManager, mouse, selectionManager);
	                         });
	                    }
                    }
               }
          }
     });
     e.allowDefault = true;
}
function removeSyncTooltip(_chart)
{
	var eventManager = _chart.eventHandler.eventManager;
	var selectionManager = eventManager.selectionManager;
	eventManager.selectionManager.remove();
}
function synchronizedEvents_mouseout(e, d, chart)
{
     var id = chart.id;
     var seriesIndex = d.seriesIndex;
     // var subseriesIndex = d.subSeriesIndex;
     // var itemIndex = d.itemIndex;
     var dependentChartInstances = [];
     var selectedTime = d.point[0];
     var chartId = chart.chartParentElement._parents[0].id;
     $.each(OPMClient.RCAController.chartEntities,function(key,value){
     	//if(("zcContain_"+key)!==chartId){
     		dependentChartInstances.push(value.chartObj);
     	//}
     });
     //MOUSE POSITION
     var mouse = {
          x: chart.eventHandler.mousePos[0],
          y: chart.eventHandler.mousePos[1]
     };
     var defaultZCBehaviour = $ZC.getPlotDefaultBehaviour();
     dependentChartInstances.map(function(_chart, i) 
     {
          if(_chart!==undefined)
          {
          	removeSyncTooltip(_chart);
               //FLATTEN POINTS
               var chartName = "line";//No I18N
               var paneid = 'pane0_0';//No I18N
               var flattenPoints = _chart.dataObject.flattenPoints.get(paneid);
               var itemIndexObj = {};
               for (var key in flattenPoints.get(chartName))
               {
                    if(flattenPoints.get(chartName).hasOwnProperty(key))
                    {
                         var seriesData = flattenPoints.get(chartName)[key];

                         for(var i=0;i<seriesData.length;i++)
                         {
                              if(seriesData[i][0]===selectedTime)
                              {
                                   itemIndexObj[key]=i;
                                   break;
                              }
                         }
                    }
               }
               for (var key in flattenPoints.get(chartName))
               {
                    if(flattenPoints.get(chartName).hasOwnProperty(key))
                    {
                         var data = flattenPoints.get(chartName)[key][itemIndexObj[key]];
                         //SELECTION MANAGER
                         var eventManager = _chart.eventHandler.eventManager;
                         var selectionManager = eventManager.selectionManager;

                         //UPDATE SELECTION MANAGER
                         // selectionManager.nearest = currentSubseriesData[newItemIndex];
                         eventManager.selectionManager.remove();

                         defaultZCBehaviour.mouseout.map(function(d, i) {
                         d.action().call(eventManager, mouse, selectionManager);
                         });
                    }
               }
          }
     });
     e.allowDefault = true;
}

function zMap(arrayObj,count,columnname){
	var data = [];
	if(arrayObj !=undefined && arrayObj.chartobj != undefined && arrayObj.chartobj[0] != undefined && arrayObj.chartobj[0].jsonData != undefined){
		data = arrayObj.chartobj[0].jsonData;	
	}
    var dataarr=[];
    var elementIDarr=[];
    var chartID;
    var jsonDataValues = [];
    $.each(arrayObj.chartobj,function(ind,val)
    {
        chartID = val.id;
        var tempobj=opm_customChartObject(val);
        dataarr.push(tempobj);
        var wid = (val.width !== undefined ? val.width : "95%");
        try{
            d3.select('#'+chartID).selectAll('rect').remove();
            d3.select('#'+chartID).select('svg').selectAll('*').remove();
            d3.select('#'+chartID).selectAll('*').remove();
        }
        catch(err){
            var errMsg = err;
        }
        if(navigator.appVersion.indexOf('Win')!=-1){
        	$("#"+val.id).html('<div class="container" id="zcContain_'+val.id+'" style="height: 530px;width:98%;"></div>'); //No I18N //create chart element //No I18N
        }else{
        	$("#"+val.id).html('<div class="container" id="zcContain_'+val.id+'" style="height: 600px;width:98%;"></div>'); //No I18N //create chart element //No I18N	
        }
        $("#zcContain_"+val.id).addClass((val.customClass !== undefined ? val.customClass:""));//No I18N   
        jsonDataValues.push(val.jsonData);
    });
    
    $.each(arrayObj.placeholder,function(ind,val)
    {
        elementIDarr.push(document.getElementById('zcContain_'+val));//No I18N
    });

	var ranges = [];
    for (var i = data.length - 1; i >= 0; i--) {
    	ranges[i] = [data[i][1],data[i][1]];
    }

    var colorBand = {
			"height": 10, //No I18N
			"ranges": ranges //No I18N
		}


    var dataarr = {
    	    "canvas": { //No I18N
    	        "fontSize": 12, //No I18N
    	        "fontFamily": "Roboto", //No I18N
    	        "title": { //No I18N
    	            "text": "" //No I18N
    	        },
    	        "subtitle":{ //No I18N
    	            "text":"" //No I18N
    	        },
    	        "theme": "map_theme", //No I18N
    	        "events": { //No I18N
					"onload": "MapDemo.addNavigationButtonsNotes" //No I18N
				}
    	    },
    	    "seriesdata": { //No I18N
    	        "chartdata": [ //No I18N
    	            {
    	                "type": "geoheatmap", //No I18N
    	                "seriesname": "Heatmap", //No I18N
    	                "data": [data] //No I18N
    	            }
    	        ]
    	    },
    	    "metadata": { //No I18N
    	        "axes": { //No I18N
    	            "geo": [ //No I18N
    	                0
    	            ],
    	            "clr": [ //No I18N
    	                1
    	            ]
    	        },
    	        "columns": [ //No I18N
    	            {
    	                "dataindex": 0, //No I18N
    	                "columnname": "Country", //No I18N
    	                "datatype": "geo", //No I18N
    	                "joinBy": "zc-key", //No I18N
    	                "geo": { //No I18N
    	                    "format": { //No I18N
    	                        "mapBy": "name" //No I18N
    	                    }
    	                }
    	            },
    	            {
    	                "dataindex": 1, //No I18N
    	                "columnname": columnname, //No I18N
    	                "datatype": "numeric" //No I18N
    	            }
    	        ]
    	    },
    	    "map": { //No I18N
    	        "allAreas": true, //No I18N
    	        "scope": "world", //No I18N
    	        "extent": { //No I18N
    	            "top": 0, //No I18N
    	            "right": 0, //No I18N
    	            "bottom": 0, //No I18N
    	            "left": 0 //No I18N
    	        }, 
    	        "scope": "world", //No I18N
    	        "labels": { //No I18N
    	            "show": true, //No I18N
    	            "showAs": "" //No I18N
    	        },
    	        "excludeAreas": [ //No I18N
 					"ata", //No I18N
 					"sgs", //No I18N
 					"atf", //No I18N
 					"flk" //No I18N
 				]
    	    },
    	    "chart": { //No I18N
    	    	"zoom": { //No I18N
			"enabled": true //No I18N
		},
    	        "plot": { //No I18N
    	            "border": { //No I18N
    	                "show": false //No I18N
    	            },
    	            "plotoptions": { //No I18N
    	                "geoheatmap": { //No I18N
    	                    "strokeColor": "#444", //No I18N
    	                    "datalabels": { //No I18N
    	                        "show": true, //No I18N
    	                        "fontSize": 13, //No I18N
    	                        "strokeWidth": 2 //No I18N
    	                    }
    	                }
    	            },
    	            
    	            "events": { //No I18N		
    	            	"click": function (e, d) { //No I18N		
	    	            	var rbbid = OPMClient.FWAReportWidgetLoadingController.CntryRbbList[count];		
	    	            	var CntryName = d.data[2].value;		
	    	            	redirectFWADrillDown($("#deviceList").val(),CntryName,"RBB",rbbid); //No I18N		
	    	            }
    	            }
    	        }
    	    },
    	    "legend": { //No I18N
    	    	"enabled":false, //No I18N
    			"vAlign": "bottom", //No I18N
    			"hAlign": "center", //No I18N
    			"colors": [ //No I18N
    				"#6B8E23", //No I18N
    				"#556B2F", //No I18N
    				"#808000", //No I18N
    				"#2E8B57", //No I18N
    				"#20B2AA", //No I18N
    				"#3CB371", //No I18N
    				"#8FBC8F", //No I18N
    				"#98FB98", //No I18N
    				"#90EE90", //No I18N
    				"#00FA9A", //No I18N
    				"#00FF7F", //No I18N
    				"#9ACD32", //No I18N
    				"#ADFF2F", //No I18N
    				"#006400", //No I18N
    				"#008000", //No I18N
    				"#228B22", //No I18N
    				"#00FF00", //No I18N
    				"#32CD32", //No I18N
    				"#7FFF00", //No I18N
    				"#7CFC00" //No I18N

    			],
    			"colorBand":colorBand //No I18N
    		},
    		"buttonOptions": { //No I18N
				"vAlign": "top", //No I18N
				"buttons": { //No I18N
					"zoomOut": { //No I18N
						"class": "map-button-border-separate" //No I18N
					}
				}
			}
    	}
    var zobj = new $ZC.maps(elementIDarr[0], dataarr);
    var test = setInterval(function(){
        if(zobj.chartRendered === true){
            clearInterval(test)
            window.canvasLoded = true;
        }
        $('.d3container .canvas-component .xychart .nodatahandler .nodata').closest('.graph-divs-small-blkgrad').addClass('zChartNoData');//No I18N
    }, 1000/60)
    if(count == $("#cntryWidList").val()){
		$("#map_"+count).parent().parent().show();
	}else{
		$("#map_"+count).parent().parent().hide();
	}
}
function customAnnotationX2(chartObj, conf, ele) {
    var bound = ele.getBoundingClientRect();
    return chartObj.plotarea.left + (chartObj.plotarea.width / 2) - (bound.width / 2);
}
function customAnnotationY2(chartObj, conf, ele) {
    var bound = ele.getBoundingClientRect();
    return chartObj.plotarea.top + (chartObj.plotarea.height / 2) - (bound.height / 2);
}
function customAnnotationHTML2(chartObj, conf) {
    var d = chartObj.seriesdata[0].data[0],
        dataset = chartObj.dataset,
        ycol = chartObj.systemConf.metadata.axes.y[0][0],
        col = chartObj.systemConf.metadata.columns[ycol],
        description = conf.description || "";//No I18N
    var total = d.reduce(function(prev, cur, i) {
        return prev + (cur.disabled ? 0 : Math.abs(dataset.getY(cur, 0)))
    }, 0);
    total = $ZC.getFormattedValue(col[col.datatype], total, col.datatype);
    var eleID;
    var zType;
    if(chartObj.chartParentElement["_parents"][0].id.indexOf("inventoryVBarChart")!==-1)//No I18N
    {	
    	eleID = chartObj.chartParentElement["_parents"][0].id.split("_")[3];
    	zType = "cctv";//No I18N
    }else if(chartObj.chartParentElement["_parents"][0].id.indexOf("_snapDialWidget")!==-1){
    	eleID = chartObj.chartParentElement["_parents"][0].id.split("_snapDialWidget")[1];//No I18N
    	zType = "snapshot";//No I18N
    	total += ' '+conf.unit;
    }else{
    	eleID = chartObj.chartParentElement["_parents"][0].id.split("_gwidget")[1];//No I18N
    	zType = "dashboard";//No I18N
    }
    return "<div style='text-align: center;width:50px;'><div id='heatMapDeviceCount_"+eleID+"' style='font-size:24px;margin-bottom:5px;font-family:\"LatoBold\"'>" + total + "</div><div id='heatMapTotal_"+eleID+"' class='textOverflow' style='font-size:14px;font-family:\"LatoBold\"'>"+Ember.I18n.t("webclient.devices.details.avail.total",this)+"</div><div id='heatMapReset_"+eleID+"' onclick='filterZDonutDial(\""+zType+"\","+eleID+")' class='opm_link textOverflow' style='font-size:13px;display:none;font-family:\"LatoBold\"'>"+Ember.I18n.t("webclient.topo.addnode.clearbutton",this)+"</div></div>";//No I18N
}
function filterZDonutDial(zType,id)
{
	if(zType==="cctv"){//No I18N
		OPMClient.CCTV.CCTVLoadSlideOneByOne(id,'refresh');//No I18N
	}else if(zType === 'snapshot'){//No I18N
		resetDialFilter(id);
	}else{
		reloadDashWidget(id);
	}
}
function filterSeverity(id, indexArr) {
	if(indexArr.length===0)
	{
		$('#'+id+' path[id^="arc_"]').css("opacity", "1");//No I18N
		$('#'+id+' .legseries').children().css("opacity", "1");//No I18N
	}else{
		$('#'+id+' path[id^="arc_"]').css("opacity", "0.5");//No I18N
		$('#'+id+' .legseries').children().css("opacity", "0.5");//No I18N
		for(var i=0;i<indexArr.length;i++)
		{
			$('#'+id+' path[id^="arc_' + indexArr[i] + '"]').css("opacity", "1");//No I18N
	    	$('#'+id+' .legseries').children().eq(indexArr[i]).css("opacity", "1");//No I18N
		}
	}
}
function getUnitFortheGraph(jsonData,isText){
	var headerUnit = '';
	if(jsonData.suffix !== undefined && jsonData.suffix !== ''){
		headerUnit = jsonData.suffix;
	}else if(jsonData.unit_suffix !== undefined && jsonData.unit_suffix !== ''){
		headerUnit = jsonData.unit_suffix;
	}else if(jsonData.xyTitles !== undefined && jsonData.xyTitles.length){
		headerUnit = jsonData.xyTitles[1];
	}else if(jsonData.yAxisText !== undefined && jsonData.yAxisText !== ''){
		headerUnit = jsonData.yAxisText;	
	}
	if(headerUnit){
		headerUnit = (isText ? ' ' : '&nbsp;')+'('+escapeHTML(headerUnit)+')';//No I18N
	}
	return headerUnit;
}
function getZChartProps(jsonData,graphSettings){
	var seriesNameVsColorCodeMap = {};
    var colorsArray = [];
    var chartObj = {};
    var chartColors = ['#1890FF','#13C2C2','#27A965','#FAAD14','#F5222D','#722ED1','#2F54EB','#F2CC0C','#73BF69','#705DA0','#8AB8FF','#FF780A','#F2495C','#5794F2','#B877D9','#705DA0'];//fluidicv2; //No I18N
    if(graphSettings.graphColor) {
        chartColors[0] = graphSettings.graphColor;
    }
    var totalColors = chartColors.length;
	var timeFormat = graphSettings.timePeriod;
	var dataCount = (jsonData.graphData.length > 0 && jsonData.graphData[0].data) ? jsonData.graphData[0].data.length : 0;
	var outerPadding = (dataCount === 1) ? 0.04 : 0;
    var isCustomLegendEnabled = (graphSettings.showLegendForSingleGraph || graphSettings.isMultipleInstanceGraph);
    var isLegendEnabled = isCustomLegendEnabled && ((graphSettings.legendNeeded === undefined) ? (!(graphSettings.isMultipleInstanceGraph && graphSettings.isExportPDF)) : graphSettings.legendNeeded);
	isLegendEnabled = jsonData.graphData.length == 1 ? false : isLegendEnabled;
	var showSelectAll = (graphSettings.isMultipleInstanceGraph && !graphSettings.isExportPDF);
    var isStacked = !!graphSettings.stacked;
	var plotoptions = {
	    area:{area:{mode:(graphSettings.smoothEdges ? 'monotone' : 'linear'),strokeWidth:2,fillOpacity:0.1,//No I18N
				animation:{type:'pointTween'},//No I18N
				marker:{enabled:graphSettings.showPoints},
				outerPadding:outerPadding,
				stacked:{enabled:isStacked}
			}
		},
		line:{line:{mode:(graphSettings.smoothEdges ? 'monotone' : 'linear'),strokeWidth:1,//No I18N
				animation:{type:'pointTween'},//No I18N
				marker:{enabled:graphSettings.showPoints},
				outerPadding:outerPadding,
				stacked:{enabled:isStacked}
			}
		},
		bar:{bar:{interPadding:0.07,outerPadding:outerPadding,
				stacked:{enabled:isStacked}}}
    };
    var isBaselineNeeded = function(baselineValue){
    	var baselineNeeded = false;
    	$.each(jsonData.graphData,function(arrIndex,instanceData){
    		//when some instances having no data then legend not shown fix
    		instanceData.data = [instanceData.data];
    		//---
    		if(!baselineNeeded){
	    		$.each(instanceData.data[0],function(instDataIndex,instDataValues){
	    			baselineNeeded = (instDataValues[1] < baselineValue);
	    		});
	    	}
    	});
    	return baselineNeeded;
    };
	chartObj = {
        id:graphSettings.graphId,
        summaryGridId:graphSettings.summaryGridId,
        type:graphSettings.graphStyle,
        jsonData:jsonData.graphData,
        series:graphSettings.series,
        height:graphSettings.graphHeight,
        columns:{datatype_1:graphSettings.datatype_1,datatype_2:graphSettings.datatype_2,columnname_1:graphSettings.xTitle,columnname_2:graphSettings.yTitle,timeFormat:timeFormat},
        tooltip:graphSettings.tooltip,
        legend:{enabled:isLegendEnabled,fontFamily:'LatoRegular',layout:'horizontal',vAlign:'bottom',hAlign:'center',useChartEffect:false,textOverflow:'ellipsis',fontSize:12,//No I18N
        	selectAllBox:{show:showSelectAll,selected:true,shape:'square',size:10},//No I18N
			title:{show:showSelectAll,text:!graphSettings.isExportPDF ? Ember.I18n.t('webclient.admin.configurecriteria.selectall') : '',margin:3,fontSize:12},//No I18N
			colorBox:{shape:'square',size:8,strokeOpacity: 1},//No I18N
			colors:chartColors
        },
	    axes:{rotated: false,
            xaxis:{show:true,
            	label:{text:graphSettings.xTitle,fontSize:12},
                ticklabel:{rotation:((dataCount > 1) ? '60' : 'auto'),textOverflow:'none',minmaxlabels:{show:(dataCount > 1),excludeIntervals:false},fontSize:11,tooltip:true},//No I18N
                grid:{show:graphSettings.showGridlines,style:'longdash',strokeWidth:1},//No I18N
                tickmark:{size:7}
            },
            yaxis:[{
            	show:true,
            	orient:graphSettings.yAxisPlacement,
        		minRange:graphSettings.minRange,
                maxRange:graphSettings.maxRange,
                label:{text:graphSettings.yTitle,marginLeft:0,fontSize:12},
                ticklabel:{fontSize:11,tooltip:true},
                grid:{show:graphSettings.showGridlines,style:'longdash',strokeWidth:1},//No I18N
                baseline:{show:isBaselineNeeded(0),value:0,color:'#eee'}//No I18N
            }]
		},
        plot:{
	      plotoptions:plotoptions[graphSettings.graphStyle]
	    },
	    chart:{
			stacked:false,
			marginBottom:0,
			marginTop:10,
			marginRight:((['onehour','twohours','fourhours','sixhours','eighthours','twelvehours','twfourhours','Today','Yesterday'].indexOf(timeFormat) > -1) ? 25 : 100)//NO I18N
		},
	    xAxisFormat:graphSettings.xAxisFormat,
        showThresholdLines:graphSettings.showThresholdLines,
        show95thPercentile:graphSettings.show95thPercentile,
        scaleType:graphSettings.scaleType,
        timePeriod:graphSettings.timePeriod,
        legendPlacement:graphSettings.legendPlacement,
	    xAxisGrouping:graphSettings.xAxisGrouping,
        isEnhancedGraph:true,
        allPlotOptions:plotoptions,
        isCustomLegendEnabled:isCustomLegendEnabled
        // stacked:false
    };
    if(graphSettings.legendPlacement === 'right'){
    	chartObj.legend.layout = 'vertical';//No I18N
    	chartObj.legend.vAlign = 'top';//No I18N
    	chartObj.legend.hAlign = 'right';//No I18N
    }
    if(!graphSettings.isExportPDF){
    	chartObj.sharedSeriesInfo = graphSettings.showSharedSeriesInfo;
    	chartObj.chart.brush = {enabled:true,type:'x',//No I18N
			resetButton:{
		      	label:{
		        	text:Ember.I18n.t('webclient.zcharts.resetzoom'),//NO I18N
		        	fontSize:12,
		        	fontColor:'#27a965'//No I18N
		        },
		        border:{radius:2,color:'#27a965'},//No I18N
		        fillColor:'#d4eee0'//NO I18N
		    },
		    selectionArea:{
	            fillColor:'#fff7ef',//'#eff8ff',//NO I18N
	            strokeColor:'#ffa442',//'#42aaff',//NO I18N
	            dashStyle:'solid'//NO I18N
	        }
    	}	
    }
    if(graphSettings.noDataHandler !== undefined){
    	chartObj.noDataHandler = graphSettings.noDataHandler;
    }
    if(graphSettings.format !== undefined){
    	chartObj.columns.format = graphSettings.format;
    }
    //we have totalColors of unique color codes to render graphs, if number of series are more than 69, those 69 colors will be repeated
    if(graphSettings.totalSeries > totalColors){
        var quotient = parseInt(graphSettings.totalSeries/totalColors);
        var reminder = (graphSettings.totalSeries%totalColors);
        for(i = 0; i < quotient; i++) {
            colorsArray = colorsArray.concat(chartColors);
        }
        if(reminder !== 0){
            colorsArray = colorsArray.concat(chartColors.slice(0,reminder));
        }
    }
    if(colorsArray.length === 0){
        colorsArray = chartColors;
    }
    $.each(jsonData.graphData,function(index,eachSeries){
        seriesNameVsColorCodeMap[eachSeries.seriesname] = colorsArray[index];
        //Required for consolidated grid and summary page table view
        if(jsonData.consolidatedValues !== undefined && jsonData.consolidatedValues.length && !graphSettings.isExportPDF){
        	var arrIndex = jsonData.consolidatedValues.map(function(seriesObj){return seriesObj.seriesName}).indexOf(eachSeries.seriesname);
        	if(arrIndex > -1){
        		jsonData.consolidatedValues[arrIndex].legColor = colorsArray[index];
        	}
        }
    });
    chartObj.seriesNameVsColorCodeArray = seriesNameVsColorCodeMap;
    return chartObj;
}
function getZChartPropsForPieChart(jsonData,graphSettings,isExport){
	var chartObj = {
		id:graphSettings.graphId,
		type:'pie',//No I18N
		subType:'simplePie',//simplePie , semiDount, simpleDonut,gaugeDial,simpleDial//No I18N
		customClass:'opm_pie opm_legend2Col',//No I18N
		jsonData:jsonData,
		height:graphSettings.graphHeight,
		columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:'Label',columnname_2:'%',columnname_3:'',//No I18N
			timeFormat:(graphSettings.selectedPeriod !== undefined ? graphSettings.selectedPeriod : 'hours')//No I18N
		},
		canvas:{title:{show:false,text:''}},
		chart:{stacked:true},
		area:{marker:true},
		legend:{enabled:true,colors:availColors,layout:'horizontal',hAlign:'center',vAlign:'bottom','fontSize':12},//No I18N
		bar:{rotated:false,levelMarker:true},
		pie:{innerLabel:false}
	}
	if(!isExport){
		chartObj.tooltip = [Ember.I18n.t('webclient.map.flash.label')+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value')+" : {{val(1)}} ({{col(1)}})"];//No I18N	
	}
	return chartObj;
}
function getZChartPropsForBarChart(xTitle,yTitle,jsonData,graphSettings){
	var isLegendEnabled = (graphSettings.isLegendEnabled !== undefined ? graphSettings.isLegendEnabled : true);
	var availStatColors = ['#77d283','#afafaf','#ffee00','#ffc0cb','#f47272','#31A5F0','#6b0000'];//No I18n
	var chartObj = {
		id:graphSettings.graphId,
		type:'bar',//No I18N
		series:'multi',//No I18N
		jsonData:jsonData,
		height:graphSettings.graphHeight,
		columns:{datatype_1:'ordinal',datatype_2:'numeric',columnname_1:xTitle,columnname_2:yTitle},//No I18N
		// tooltip:[Ember.I18n.t('webclient.map.flash.label')+" : {{val(0)}}",Ember.I18n.t('webclient.devices.intftypes.value')+" : {{val(1)}} ({{col(1)}})"],//No I18N
		canvas:{title:{show:false,text:''}},
		chart:{stacked:true},
		legend:{enabled:isLegendEnabled,colors:availStatColors,fontFamily:'LatoRegular',fontSize:12,hAlign:'center',vAlign:'bottom',colorBox:{shape:'square',size:8,strokeOpacity:1}},//No I18N
		axes:{rotated:true,xaxis:{label:{text:''}},yaxis:[{label:{text:jsonData.seriesname}}]}
	}
	if (graphSettings.axes) {
		chartObj.axes = graphSettings.axes;
	}
	return chartObj;
}

