function drawDashboardLineGraph(graphParams)
{
	graphParams.height = (graphParams.height!=undefined)?graphParams.height:250;
	graphParams.x_axes = (graphParams.x_axes!=undefined)?graphParams.x_axes:"";
	graphParams.y_axes = (graphParams.y_axes!=undefined)?graphParams.y_axes:"";
	graphParams.timeFormat = (graphParams.timeFormat!=undefined)?graphParams.timeFormat:'hours';//No I18N
	if((graphParams.interfaceWidgets !== undefined && graphParams.interfaceWidgets) || (graphParams.customWidget!==undefined && graphParams.customWidget))
	{
		graphParams.tooltip = (graphParams.tooltip!=undefined)?graphParams.tooltip:[0,1,2];
	}
	else
	{
		graphParams.tooltip = [0,"{{val(2)}} : {{val(1)}} ({{col(1)}})"];//No I18N
	}
	
	var arraObj={"placeholder":[],"chartobj":[]};//No I18N
    	var chartObj = {
        id:graphParams.id,
        type:'line',//No I18N
        jsonData:graphParams.graphData,
        series:"multi",//No I18N
        height:graphParams.height,
        columns:{
            datatype_1:'time',//No I18N
            datatype_2:'numeric',//No I18N
            datatype_3:'ordinal', //No I18N
            columnname_1:graphParams.x_axes,
            columnname_2:graphParams.y_axes,
            columnname_3:Ember.I18n.t("webclient.map.flash.label",this),//No I18N
            timeFormat:graphParams.timeFormat,
           	ordinal: {tooltipformat: {customFormat: function(value, datatype, columnInfo, type, chartObj) {return value.split('-')[0]}}} //No I18N
        	  },
        canvas:{
        	title:{
        		show:false,text:""
        	},
        	events:{
        		onload:function(){
        			if(graphParams.saveWID !== undefined && OpmDashwidgetComponentArray[graphParams.saveWID]!==undefined && OpmDashwidgetComponentArray[graphParams.saveWID].widgetParams!==undefined)
        			{
        				OpmDashwidgetComponentArray[graphParams.saveWID].widgetParams.apiRendered = true;
        			}
        			}
        		}
        },
	   	chart:{stacked:false},
	    legend:{enabled:true},
	    axes:{
			rotated: false,
			xaxis: {label: {text: graphParams.x_axes},
			 ticklabel: {
	                rotation: "auto"//No I18N
	            },
	            show:true
		},
			yaxis: [{label: {text:graphParams.y_axes},minRange:(graphParams.minRange!==undefined)?graphParams.minRange:null,maxRange:(graphParams.maxRange!==undefined)?graphParams.maxRange:null}]
		},
		tooltip:graphParams.tooltip, 
		isRealTime:true 
	}

	if(graphParams.consolidatedValues !== undefined)
	{
		chartObj.consolidatedValues = graphParams.consolidatedValues;
	}
	if(graphParams.legendLayout!==undefined){
		chartObj.legend.layout = graphParams.legendLayout;
	}
	if(window.OPM.isOPM && graphParams.interfaceWidgets !== undefined && graphParams.interfaceWidgets)
	{
		if(graphParams.suffix !== undefined && graphParams.suffix !== ""){
			chartObj.columns.suffix = graphParams.suffix;
		}
		if( graphParams.tooltipformat !== undefined && graphParams.tooltipformat !== "" )  {
		   	chartObj.columns.tooltipformat = graphParams.tooltipformat;
		}
	}
	else
	{
	 	chartObj.columns.format = {customFormat: function(value, datatype, columnInfo, type, chartObj) 
            	{
            			return (graphParams.WidgetForwardPage=='RealTimeGraph')?value:opm_formatKMBT(value);//No I18N
            	}
        }
    }
    if(graphParams.isForecast)
    {
    	chartObj.legend = graphParams.legend || chartObj.legend;
    }

	if(graphParams.customLegend) {
		chartObj.legend = graphParams.customLegend || chartObj.legend;
	}

	if(graphParams.notes) {
		chartObj.notes = graphParams.notes;
	}

	if(graphParams.columnFormat!==undefined && graphParams.columnFormat!="") {
		chartObj.columns.format = graphParams.columnFormat;
	}
	if(graphParams.strokeWidth!==undefined && graphParams.strokeWidth!=="") {
		chartObj.line ={"strokeWidth":graphParams.strokeWidth};//NO I18N
	}
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(graphParams.id);
	zChart(arraObj); 

	if(graphParams.saveWID!==undefined){
		var widgetRTGraph = zChartForRealTime(chartObj,true);
		opmWidget_RTGraphArr[graphParams.saveWID] = widgetRTGraph; 
	}
}
function drawDashboardPieChart(graphParams)
{
	graphParams.height = (graphParams.height!=undefined)?graphParams.height:300;
	graphParams.x_axes = (graphParams.x_axes!=undefined)?graphParams.x_axes:"";
	graphParams.y_axes = (graphParams.y_axes!=undefined)?graphParams.y_axes:"";
	graphParams.timeFormat = (graphParams.timeFormat!=undefined)?graphParams.timeFormat:'hours';//No I18N
	graphParams.suffix = (graphParams.suffix!=undefined)?graphParams.suffix:"";
	graphParams.color =(graphParams.color!=undefined)?graphParams.color:availColors;
	graphParams.legendShowAs =(graphParams.legendShowAs!=undefined)?graphParams.legendShowAs:null;
	graphParams.fontSize =(graphParams.fontSize!=undefined)?graphParams.fontSize:"15";
	graphParams.handleOverlapping = (graphParams.handleOverlapping!=undefined)?graphParams.handleOverlapping:false;
	var arraObj={"placeholder":[],"chartobj":[]};//No I18N
    var chartObj = {
        id:graphParams.id,
        type:'pie',//No I18N
        subType:'simplePie',//No I18N
        customClass:"opm_pie opm_legend2Col",//No I18N
        jsonData:graphParams.graphData,
        height:graphParams.height,
        columns:{
            datatype_1:'ordinal',//No I18N
            datatype_2:'numeric',//No I18N
            columnname_1:graphParams.x_axes,
            columnname_2:graphParams.y_axes,
            columnname_3:'',//No I18N
            timeFormat:graphParams.timeFormat,
            suffix:graphParams.suffix
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
            colors:graphParams.color,
            "layout":"horizontal",//No I18N
            "hAlign": "center",//No I18N
			"vAlign": "bottom",//No I18N
			"fontSize":16,//No I18N
			"colorBox": {//No I18N
	        	"shape": "circle",//No I18N
	            "strokeOpacity": 1//No I18N
	        },
	        "showAs":graphParams.legendShowAs//No I18N
	    },
	    bar:{
	        rotated:false,
	        levelMarker:true
	    },
		pie:{innerLabel:false},
		datalabels : {
			"fontSize" : graphParams.fontSize,//No I18N
			"handleOverlapping": graphParams.handleOverlapping//No I18N
		}	
	}

	if(graphParams.customClass) {
		chartObj.customClass = graphParams.customClass; 
	}
	if(graphParams.customLegend) {
		if(graphParams.customLegend.layout) {
			chartObj.legend.layout = graphParams.customLegend.layout;
		}
		if(graphParams.customLegend.vAlign) {
			chartObj.legend.vAlign = graphParams.customLegend.vAlign;
		} 
		if(graphParams.customLegend.colorBox) {
			chartObj.legend.colorBox = graphParams.customLegend.colorBox;
		}
		if(graphParams.customLegend.maxWidth) {
			chartObj.legend.maxWidth = graphParams.customLegend.maxWidth;
		}
		if(graphParams.customLegend.maxHeight) {
			chartObj.legend.maxHeight = graphParams.customLegend.maxHeight;
		}
		if(graphParams.customLegend.fontSize) {
			chartObj.legend.fontSize = graphParams.customLegend.fontSize;
		}
	}
	if(graphParams.chart) {
		chartObj.chart = graphParams.chart;
	}
	if(graphParams.width) {
		chartObj.width = graphParams.width;
	}

	if(graphParams.tooltip!=undefined){
		chartObj.tooltip=graphParams.tooltip;
	}
	if(graphParams.legend != undefined) {
		chartObj.legend = graphParams.legend;
	}
	if(graphParams.legendshowAs!=undefined){
		chartObj.legend.showAs=graphParams.legendshowAs;
	}
	if(graphParams.isNCMWidgetDrillDownEvent)
	{
		chartObj.plot={
			"events" : {//NO I18N
				"click" : function(event, data, chartObj){//No I18N
				    event.allowDefault = true;
					var id = graphParams.id;
					id = id.match(/\d+/g);
					ncmdashboardWidgetDrillDownEvent(event, data, chartObj,graphParams.Name,id[0]);
				}
			}
		};
	}
	if(graphParams.nfaReportFromWidget)
	{
    	chartObj.legend.events = {
    		"doubleclick" : function(e,d,i,chartObj){//No I18N
    			nfa_getReportFromDashboardWidgets(graphParams.apiResponse,'Legend',d);//No I18N
    		}
    	};
    	chartObj.plot={
       		"events": {//No I18N
				"click" : function (event,data,chartObj) { //NO I18N
					nfa_getReportFromDashboardWidgets(graphParams.apiResponse,'chart',data.data);//No I18N
				}
			}
    	};
	}
	if(graphParams.isFWAStdPolicy)
	{
		chartObj.plot={
			"events" : {//NO I18N
				"click" : function(event, data, chartObj){//No I18N
					fwaStandardDashboardClick(event, data, chartObj,graphParams.Name)
				}
			}
		};
	}
	else if(graphParams.isFWASecurityEvt)
	{
    	chartObj.plot={
			"events" : {//NO I18N
				"click" : function(event, data, chartObj){//No I18N
					fwaSecurityEventDashboardClick(event,data,chartObj,graphParams.wid)
				}
			}
		};
	}
	if(graphParams.redirectToDeviceSnapshot) {
		chartObj.plot={
			"events" : {//NO I18N
				"click" : function(event, data, chartObj){//No I18N
					event.allowDefault = true;
					var devName=(data.data[2] != undefined ? data.data[2].value:"");
					redirectToDeviceSnapshot(devName);
				}
			}
		};
	}
	if(graphParams.pieType !== undefined && graphParams.pieType != null) {
		chartObj.subType = graphParams.pieType//No I18N
	}
	if(graphParams.margin !== undefined){
		chartObj.margin = graphParams.margin;
	}
	if(graphParams.notes !== undefined){
		chartObj.notes = graphParams.notes;
	}
	if(graphParams.events !== undefined){
		chartObj.plot = graphParams.events;
	}
	if(graphParams.legendEvents !== undefined){
		chartObj.legend.events = graphParams.legendEvents;
	}
	if(graphParams.dataLabels !== undefined){
		chartObj.datalabels = graphParams.dataLabels;
	}
	if(graphParams.legend !== undefined){
		chartObj.legend = graphParams.legend;
	}
	if(graphParams.columnFormat!==undefined && graphParams.columnFormat!="") {
		chartobj.columns.format = graphParams.columnFormat;
	}
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(graphParams.id);
	zChart(arraObj); 
}
function drawDashboardGraphArea(graphParams)
{
	graphParams.height = (graphParams.height!=undefined)?graphParams.height:300;
	graphParams.stacked = (graphParams.stacked!=undefined)?graphParams.stacked:false;
	graphParams.x_axes = (graphParams.x_axes!=undefined)?graphParams.x_axes:"";
	graphParams.y_axes = (graphParams.y_axes!=undefined)?graphParams.y_axes:"";
	graphParams.timeFormat = (graphParams.timeFormat!=undefined)?graphParams.timeFormat:'hours';//No I18N
	graphParams.tooltip = (graphParams.tooltip!=undefined)?graphParams.tooltip:[0,1,2];

	var arraObj={"placeholder":[],"chartobj":[]};//No I18N
    var chartObj = {
        id:graphParams.id,
        type:'area',//No I18N
        jsonData:graphParams.graphData,
        series:"multi",//No I18N
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
		                "text":graphParams.x_axes,//No I18N
		                "marginBottom": graphParams.x_axes_margin_bottom ? graphParams.x_axes_margin_bottom : 10//No I18N
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
		tooltip:graphParams.tooltip 
	}

	if(graphParams.suffix !== undefined && graphParams.suffix !== ""){
		chartObj.columns.suffix = graphParams.suffix;
	}
	if( graphParams.tooltipformat !== undefined && graphParams.tooltipformat !== "" )  {
	   	chartObj.columns.tooltipformat = graphParams.tooltipformat;
	}
	if(graphParams.isNFATimeSeriesGraph !==undefined && graphParams.isNFATimeSeriesGraph){
		chartObj.isNFATimeSeriesGraph = graphParams.isNFATimeSeriesGraph;
	}
	if(graphParams.WidgetForwardPage == "sysPerfomance") {
		arraObj.consolidatedValues = graphParams.consolidatedValues;
	}
	if(graphParams.columnFormat!==undefined && graphParams.columnFormat!="") {
		chartObj.columns.format = graphParams.columnFormat;
	}
	if(graphParams.subType!=undefined){
		chartObj.subType = graphParams.subType;
	}
	if(graphParams.subTypeOptions!=undefined){
		chartObj.subTypeOptions = graphParams.subTypeOptions;
	}
	if(graphParams.legendEnabled != undefined && chartObj.legend.enabled) {
		chartObj.legend.enabled = graphParams.legendEnabled;
	}
	if(graphParams.mode != undefined) {
		chartObj.mode = graphParams.mode;
	}
	if(graphParams.dataTypeObj) {
		chartObj.dataTypeObj = graphParams.dataTypeObj;
	}
	if(graphParams.hoveroptions) {
		chartObj.hoveroptions = graphParams.hoveroptions;
	}
	if(graphParams.marginBottom) {
		chartObj.marginBottom = graphParams.marginBottom;
	}
	if(graphParams.marginRight) {
		chartObj.marginRight = graphParams.marginRight;
	}
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(graphParams.id);
	zChart(arraObj); 
}
function drawDashboardBarGraph(graphParams)
{
	graphParams.height = (graphParams.height!=undefined)?graphParams.height:300;
	graphParams.x_axes = (graphParams.x_axes!=undefined)?graphParams.x_axes:"";
	graphParams.y_axes = (graphParams.y_axes!=undefined)?graphParams.y_axes:"";
	graphParams.timeFormat = (graphParams.timeFormat!=undefined)?graphParams.timeFormat:'hours';//No I18N
	//graphParams.color = (graphParams.color!=undefined)?graphParams.color:ipamSeverityColors1;
	graphParams.datatype1 = (graphParams.datatype1!=undefined)?graphParams.datatype1:'ordinal';//No I18N
	graphParams.legendEnabled = (graphParams.legendEnabled!=undefined)?graphParams.legendEnabled:false;
	graphParams.axesEnabled = (graphParams.axesEnabled!=undefined)?graphParams.axesEnabled:false;
	graphParams.stacked = (graphParams.stacked!=undefined)?graphParams.stacked:true;
	graphParams.tooltip = (graphParams.tooltip!=undefined)?graphParams.tooltip:[0,1,2];
	graphParams.ticklabel = (graphParams.ticklabel != undefined)? graphParams.ticklabel : {};
	graphParams.rotated = (graphParams.rotated != undefined) ? graphParams.rotated : false;
	var arraObj={"placeholder":[],"chartobj":[]};//No I18N
    var chartObj = {
        id:graphParams.id,
        type:'bar',//No I18N
        series:"multi",//No I18N
        jsonData:graphParams.graphData,
        height:graphParams.height,
        width:"100%",
        columns:{
           datatype_1:graphParams.datatype1,
			datatype_2:'numeric',//No I18N
            columnname_1:graphParams.x_axes,
            columnname_2:graphParams.y_axes,
            columnname_3:Ember.I18n.t("webclient.map.flash.label",this),//No I18N
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
	        "enabled":graphParams.legendEnabled//No I18N
	        //colors:graphParams.color
	    },
	    axes:{	
			"rotated": false, //No I18N
			show:graphParams.axesEnabled,
			"xaxis": { //No I18N	
				"label": { //No I18N	
					"text": graphParams.x_axes//No I18N
				},
				
				"ticklabel": graphParams.ticklabel //No I18N
			},
			"yaxis": [ //No I18N	
				{
					"label": { //No I18N	
						"text":graphParams.y_axes//No I18N
					},
					"minRange":(graphParams.minRange!==undefined)?graphParams.minRange:null,//No I18N
					"maxRange":(graphParams.maxRange!==undefined)?graphParams.maxRange:null//No I18N
				}
			]
	    },
		yaxis : 
		{
			showThresholdLine : graphParams.showThresholdLine ? graphParams.showThresholdLine : false, //Threshold line shown with given values
			threshold : 
				{
					"line": {//No I18N
						"show": true,//No I18N
						"values": graphParams.thresholdValue,//No I18N
						"color": ["#fa5b5a","#f6f400"],//No I18N
						"dashStyle": "1",//No I18N
						"label": {//No I18N
							"text": graphParams.thresholdLabel,//No I18N
							"hAlign": "left",//No I18N
							"fontColor": "rgb(97, 97, 97)",//No I18N
							"fontSize": 10,//No I18N
							"font-family": "LatoRegular"//No I18N
						},
						"events": {//No I18N
							"enabled": false//No I18N
						}
					}
				}
		},
	    bar:{
	        rotated:graphParams.rotated,
	        levelMarker:true
	    },
	   tooltip:graphParams.tooltip 
	}

	if(graphParams.alignMode!==undefined && graphParams.alignMode!==null && graphParams.alignMode==="rotate") {
		chartObj.axes.xaxis.ticklabel = {"alignMode":graphParams.alignMode}; //No I18N
	}
	if(graphParams.color!=undefined){
		chartObj.legend.colors = graphParams.color;
	}
	if(graphParams.subType!=undefined){
		chartObj.subType = graphParams.subType;
	}
	if(graphParams.tooltip!=undefined){
		chartObj.tooltip = graphParams.tooltip;
	}
	if(graphParams.columnname3!= undefined)
	{
		chartObj.columns.columnname_3 = graphParams.columnname3;
	}
	if(graphParams.customClass) {
		chartObj.customClass = graphParams.customClass; 
	}
	if(!graphParams.axesEnabled)
	{
		chartObj.axes={
	    	 "xaxis":{"show":false},//No I18N
	    	 "yaxis":[{"show":false}]//No I18N
	    };
	}
	if(graphParams.hAlign!=undefined){
		chartObj.legend.hAlign = graphParams.hAlign;
	}
	if(graphParams.vAlign!=undefined){
		chartObj.legend.vAlign = graphParams.vAlign;
	}
	if(graphParams.innerLabel!=undefined){
		chartObj.pie = {"innerLabel":graphParams.innerLabel};//No I18N
	}

	if(graphParams.isFWAProtocoTrafficWidget!=undefined && graphParams.isFWAProtocoTrafficWidget)
	{
		if(chartObj.plot != undefined){
			if(chartObj.plot.events != undefined){
				chartObj.plot.events.click =function(event, data, chartObj){//No I18N
					fwaProtocolTrafficClick(event, data, chartObj,graphParams.period)
				};
			}else{
				chartObj.plot.events= {//NO I18N
						"click" : function(event, data, chartObj){//No I18N
							fwaProtocolTrafficClick(event, data, chartObj,graphParams.period)
						}
				};
			}
		}else{
			chartObj.plot={
					"events" : {//NO I18N
						"click" : function(event, data, chartObj){//No I18N
							fwaProtocolTrafficClick(event, data, chartObj,graphParams.period)
						}
					}
				};
		}
  		
  		if(chartObj.axes != undefined){
			if(chartObj.axes.xaxis != undefined){
				chartObj.axes.xaxis.ticklabel={//No I18N
						"rotation": "auto",//No I18N
						"marginLeft":0,//No I18N
						"marginRight":0//No I18N
				};
			}else{
				chartObj.axes.xaxis={ //No I18N	
						"ticklabel": {//No I18N
							"rotation": "auto",//No I18N
							"marginLeft":0,//No I18N
							"marginRight":0//No I18N
						}
				};

			}
		}else{
			chartObj.axes={
					"xaxis": { //No I18N	
						"ticklabel": {//No I18N
							"rotation": "auto",//No I18N
							"marginLeft":0,//No I18N
							"marginRight":0//No I18N
						}
					}
			};
		}
	}
	if(graphParams.isFWASecurityTrafficWidget!=undefined && graphParams.isFWASecurityTrafficWidget)
	{
		if(chartObj.axes != undefined){
			if(chartObj.axes.xaxis != undefined){
				chartObj.axes.xaxis.ticklabel={//No I18N
						"rotation": "auto",//No I18N
						"marginLeft":0,//No I18N
						"marginRight":0//No I18N
				};
			}else{
				chartObj.axes.xaxis={ //No I18N	
						"ticklabel": {//No I18N
							"rotation": "auto",//No I18N
							"marginLeft":0,//No I18N
							"marginRight":0//No I18N
						}
				};

			}
		}else{
			chartObj.axes={
					"xaxis": { //No I18N	
						"ticklabel": {//No I18N
							"rotation": "auto",//No I18N
							"marginLeft":0,//No I18N
							"marginRight":0//No I18N
						}
					}
			};
		}
	}
	if(graphParams.isRedirectDeviceName) {
		chartObj.plot={
				"events" : {//NO I18N
					"click" : function(event, data, chartObj){//No I18N
						event.allowDefault = true;
						var devName=(graphParams.graphData[0] != undefined ? graphParams.graphData[0].name:"");
						redirectToDeviceSnapshot(devName);
					}
				}
			};
	}
	if(window.OPM.isOPM)
	{
		if(graphParams.suffix !== undefined && graphParams.suffix !== ""){
			chartObj.columns.suffix = graphParams.suffix;
		}
		if( graphParams.tooltipformat !== undefined && graphParams.tooltipformat !== "" )  {
		   	chartObj.columns.tooltipformat = graphParams.tooltipformat;
		}

	}
	if(graphParams.columnFormat!==undefined && graphParams.columnFormat!="") {
		chartObj.columns.format = graphParams.columnFormat;
	}
	if(graphParams.maxBandWidth) {
		chartObj.bar.maxBandWidth = graphParams.maxBandWidth;
	}
	if(graphParams.levelMarker) {
		chartObj.bar.levelMarker = graphParams.levelMarker;
	}
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(graphParams.id);
	zChart(arraObj); 
}

function drawDashboardScatterGraph(graphParams)
{
	graphParams.height = (graphParams.height!=undefined)?graphParams.height:300;
	graphParams.x_axes = (graphParams.x_axes!=undefined)?graphParams.x_axes:"";
	graphParams.y_axes = (graphParams.y_axes!=undefined)?graphParams.y_axes:"";
	graphParams.timeFormat = (graphParams.timeFormat!=undefined)?graphParams.timeFormat:'hours';//No I18N
	//graphParams.color = (graphParams.color!=undefined)?graphParams.color:ipamSeverityColors1;
	graphParams.tooltip = (graphParams.tooltip!=undefined)?graphParams.tooltip:[0,1,2];
	graphParams.datatype1 = 'time';//No I18N
	graphParams.legendEnabled = (graphParams.legendEnabled!=undefined)?graphParams.legendEnabled:false;
	graphParams.axesEnabled = (graphParams.axesEnabled!=undefined)?graphParams.axesEnabled:false;
	var arraObj={"placeholder":[],"chartobj":[]};//No I18N
    var chartObj = {
        id:graphParams.id,
        type:'scatter',//No I18N
        series:"multi",//No I18N
        jsonData:graphParams.graphData,
        height:graphParams.height,
        width:"100%",
        columns:{
           datatype_1:graphParams.datatype1,
			datatype_2:'numeric',//No I18N
            columnname_1:graphParams.x_axes,
            columnname_2:graphParams.y_axes,
            columnname_3:Ember.I18n.t("webclient.map.flash.label",this),//No I18N
            timeFormat:graphParams.timeFormat
        },
        canvas:{
            title:{
                show:false,
                text:""
            }
        },
    	chart:{stacked:false},
    	legend:{
	        "enabled":true//No I18N
	        //colors:graphParams.color
	    },
	    axes:{	
			"rotated": true, //No I18N
			show:true,
			"xaxis": { //No I18N	
				"show":true,//No I18N
				"label": { //No I18N	
					"text": graphParams.x_axes//No I18N
				}
			},
			"yaxis": {//No I18N
					"show":true,//No I18N
					"label": { //No I18N	
						"text": graphParams.y_axes//No I18N	
					}
				}
	    },
	    tooltip:graphParams.tooltip 
	}
	if(graphParams.color!=undefined){
		chartObj.legend.colors = graphParams.color;
	}
	if(graphParams.subType!=undefined){
		chartObj.subType = graphParams.subType;
	}
	if(graphParams.tooltip!=undefined){
		chartObj.tooltip = graphParams.tooltip;
	}
	if(graphParams.suffix !== undefined && graphParams.suffix !== ""){
		chartObj.columns.suffix = graphParams.suffix;
	}
	if( graphParams.tooltipformat !== undefined && graphParams.tooltipformat !== "" )  {
	   	chartObj.columns.tooltipformat = graphParams.tooltipformat;
	}

	
			chartObj.axes= {
					"rotated": false,//No I18N
					"xaxis": {//No I18N
						"label": {//No I18N
							"text": graphParams.x_axes//No I18N
						},
						"ticklabel": {//No I18N
							"alignMode": "rotate"//No I18N
						}
					},
					"yaxis": [//No I18N
						{
							"label": {//No I18N
								"text": graphParams.y_axes//No I18N
							}
						}
					]
				}

	
		
	if(graphParams.hAlign!=undefined){
		chartObj.legend.hAlign = graphParams.hAlign;
	}
	if(graphParams.vAlign!=undefined){
		chartObj.legend.vAlign = graphParams.vAlign;
	}
	if(graphParams.innerLabel!=undefined){
		chartObj.pie = {"innerLabel":graphParams.innerLabel};//No I18N
	}
	if(graphParams.columnFormat!==undefined && graphParams.columnFormat!="") {
		chartObj.columns.format = graphParams.columnFormat;
	}

	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(graphParams.id);
	zChart(arraObj); 
}
function preModifyWidgetResponse(jsonDatas,widgetParams)
{
	var widgetName = widgetParams.name;
	var jsonData = jsonDatas[widgetParams.id];
	widgetParams.success = false;
	if(jsonDatas.result !== undefined)
	{
		widgetParams.failureMsg = jsonDatas.result.message;
		return jsonData;
	}
	if(OPMClient.HomeDetailsController.dashboardName !== "dashboard.name.systemPerformancedashboard")
	{
		var isSample = $('.opmDashboardLinks .links a[data-dname="'+OPMClient.HomeDetailsController.dashboardType+'"]').attr("data-issample");
		if(isSample === "true" && widgetSampleData[OPMClient.HomeDetailsController.dashboardType+"_"+jsonData.Name] !== undefined)
		{
			jsonData = widgetSampleData[OPMClient.HomeDetailsController.dashboardType+"_"+jsonData.Name];
		}
	}
	else if(OPMClient.HomeDetailsController.dashboardName === "dashboard.name.systemPerformancedashboard")
	{
		dashboardSlideOut(6);
		removeSampleVideo();
	}
	if(jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.DCReportId !== undefined && jsonData.WidgetAdditionalData.DCReportId !== null)
	{
		OPMClient.ReportsDetailsController.set("dcReportId",jsonData.WidgetAdditionalData.DCReportId); //No I18N
	}
	if(jsonData.WidgetForwardPage === "dataCollectionLog" || jsonData.WidgetForwardPage === "sysPerfomance"){
		$("#wName").attr("disabled",true);
	}
	// if($("#"+widgetParams.id+" tr").length > 1)
	// {
	// 	$("#"+widgetParams.id).jqGrid("GridUnload");
	// 	$("#"+widgetParams.id).empty();
	// }
	// if(window.OPM.isCentralServer && (widgetName==="widget.name.firewalldevList" || widgetName==="widget.name.ncmtrapalarms")){
	// 	var parentElem = $("#"+widgetParams.id).closest('.opm_jqGridUI');
	// 	$("#"+widgetParams.id).closest('.ui-jqgrid').remove();
	// 	$(parentElem).append('<table id="'+widgetParams.id+'"><tr><td></td></tr></table>');
	// }
	$("#widget"+widgetParams.id).empty();	//No I18n
	if(jsonData.WidgetType === "Live" && opmWidget_RTGraphArr !== undefined && Object.keys(opmWidget_RTGraphArr).indexOf(widgetParams.id) !== -1)
	{
		delete opmWidget_RTGraphArr[widgetParams.id];
	}
	if(jsonData === undefined)
	{
		widgetParams.failureMsg = opm_getjsonStatusMsg(jsonDatas);
	}
	else
	{
		if(jsonData.WidgetName != undefined )
		{
			var dispName = Ember.I18n.t(jsonData.WidgetName,this);
			if (!opm_checkIfAValIsValid(dispName,'string') || (dispName).indexOf("Missing translation:") !== -1)
			{
				dispName = jsonData.WidgetName;
			}
			if(jsonData.Name === "widget.name.gpu.monitor" && jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.widgetTitle !== undefined){//No I18N
				dispName = dispName + " - " + jsonData.WidgetAdditionalData.widgetTitle;//No I18N
			}
			widgetParams.dispName = dispName;
		}
		widgetParams.subLink = false;
		if(jsonData.WidgetAdditionalData !== undefined)
		{
			setWidgetSubTitleValues(jsonData.WidgetAdditionalData,widgetParams);
		}
		
		//Subtitle for NFA widgets
		var tileWidgets = ["NFADB.AI.topService", "NFADB.AI.totalBytes", "NFADB.AI.uniqueServices", "NFADB.AI.uniqueUsers", "NFADB.AI.percentage"]; //NO I18N
		if(jsonData.WidgetData!==undefined && (jsonData.WidgetData.DevName!==undefined || jsonData.WidgetData.TimeFrame!==undefined) && tileWidgets.indexOf(jsonData.Name) === -1){
			var devName = jsonData.WidgetData.DevName;
			var timeFrame = nfa_getTimeFrameString(jsonData.WidgetData.TimeFrame);
			if(jsonData.Name==="NFA.dash.asview") { //NO I18N
				widgetParams.subTitle = (devName !== undefined) ? (devName+" | "+timeFrame) : timeFrame; //NO I18N
				widgetParams.subTitle += (jsonData.WidgetData.entity !== "-") ? (" | "+jsonData.WidgetData.entity) : ""; //NO I18N
			}else{
				widgetParams.subTitle = (devName !== undefined) ? (devName+" | "+timeFrame+ (jsonData.WidgetData.dataDirection ? " | "+jsonData.WidgetData.dataDirection : "")) : timeFrame; //NO I18N
			}
			if (jsonData.Name === "NFADB.AI.responseTime") {
				widgetParams.subTitle += (jsonData.WidgetData.data && jsonData.WidgetData.data.urlName) ? (" | "+jsonData.WidgetData.data.urlName) : ""; //NO I18N
			}
			widgetParams.nfaSubLink = (jsonData.Name==="NFA.dash.asview")?(window.isASViewEnabled?true:(jsonData.WidgetData.devTypeText==="Across")) : ((window.OPM.isAuthorized && ["NFAWidget.App","webclient.dashboard.qos","NFADB.L4Apps","NFADB.L7Apps","NFAWidget.Services"].contains(jsonData.Name) && jsonData.WidgetData.widgetParam!=="NBAR" && jsonData.WidgetData.widgetParam!=="layer7") || (["NFAWidget.trfc","NFAWidget.Src","NFAWidget.Dst","NFAWidget.proto","NFAWidget.Conversation","webclient.dashboard.cbqos","webclient.snapshot.desc.controller"].contains(jsonData.Name) && jsonData.WidgetData.devTypeText!=="Across")); //NO I18N
		}

		//Subtitle for FWA widgets
		if(jsonData.Name != undefined && jsonData.Name.indexOf('widget.name.firewall') !== -1)
		{
			if(jsonData.WidgetAdditionalData !== undefined)
			{
				if(jsonData.Name == "widget.name.firewallInterfaceLiveTraffic"){
					if(jsonData.WidgetAdditionalData.Interface!= undefined && jsonData.WidgetAdditionalData.deviceId != undefined && jsonData.WidgetAdditionalData.Interface != 'none' && jsonData.WidgetAdditionalData.deviceId != 'none'){
						widgetParams.subTitle=jsonData.WidgetAdditionalData.interfaceName+' | '+jsonData.WidgetAdditionalData.deviceName;
						if(jsonData.WidgetAdditionalData.timePeriod != undefined){
							if(widgetParams.subTitle != undefined){
								widgetParams.subTitle=widgetParams.subTitle+" | "+nfa_getTimeFrameString(jsonData.WidgetAdditionalData.timePeriod); //NO I18N
							}else{
								widgetParams.subTitle=nfa_getTimeFrameString(jsonData.WidgetAdditionalData.timePeriod);
							}
						}
					}
					else{
						widgetParams.subTitle='';	//No I18n
					}
				}else if(jsonData.Name == "widget.name.firewallLiveTraffic"){//No I18N
					if(jsonData.WidgetAdditionalData.deviceId!=undefined && jsonData.WidgetAdditionalData.deviceId!='none'){
						widgetParams.subTitle=jsonData.WidgetAdditionalData.deviceName;
						if(jsonData.WidgetAdditionalData.timePeriod != undefined){
							if(widgetParams.subTitle != undefined){
								widgetParams.subTitle=widgetParams.subTitle+" | "+nfa_getTimeFrameString(jsonData.WidgetAdditionalData.timePeriod); //NO I18N
							}else{
								widgetParams.subTitle=nfa_getTimeFrameString(jsonData.WidgetAdditionalData.timePeriod);
							}
						}
					}
					else{
						widgetParams.subTitle='';	//No I18n
					}
				}else{
					if(jsonData.WidgetAdditionalData.deviceName != undefined){
						widgetParams.subTitle=jsonData.WidgetAdditionalData.deviceName;
					}
					if(jsonData.WidgetAdditionalData.deviceGrpName != undefined){
						widgetParams.subTitle=jsonData.WidgetAdditionalData.deviceGrpName;
					}
					if(jsonData.WidgetAdditionalData.timePeriod != undefined){
						if(widgetParams.subTitle != undefined){
							widgetParams.subTitle=widgetParams.subTitle+" | "+nfa_getTimeFrameString(jsonData.WidgetAdditionalData.timePeriod); //NO I18N
						}else{
							widgetParams.subTitle=nfa_getTimeFrameString(jsonData.WidgetAdditionalData.timePeriod);
						}
					}
				}
				widgetParams.fwaSubLink = false;
				// var titleDiv = $('#widget_holder_'+widgetId).find(".opm_widget_title .wid_subTitle");  //No I18N
				// $(titleDiv).text(widgetParams.subTitle).attr('title',widgetParams.subTitle);//No I18N
				if(jsonData.Name != "widget.name.firewallprotocoltrafficreport" && jsonData.Name != "widget.name.firewallsecurityoverview" && widgetParams.subTitle!="" && widgetParams.subTitle != undefined){
					// $(titleDiv).addClass('linkTo').off().click(function(){  //No I18N
					// 	fwa_RedirectToSnapshotPage(jsonData,'WidgetHeader');//No I18N
					// });
					widgetParams.fwaSubLink = true;
				}
				
			}
		}
		if(jsonData.WidgetAdditionalData != null && jsonData.WidgetAdditionalData.type === "remoteGrid" && jsonData.WidgetData.length > 0 && jsonData.WidgetData[0].apiUrl != null) 
		{
			jsonData.WidgetType = "RemoteGrid";//No I18N
		}	
		else if((jsonData !== undefined && jsonData.WidgetType !== undefined) && (['Grid','Summary','GridBar','SummaryWithBar'].indexOf(jsonData.WidgetType) !== -1) && (jsonData.GridWidget!==undefined && jsonData.GridWidget.colModelList !== undefined))
		{
			$.each(jsonData.GridWidget.colModelList,function(ind,obj)
			{
				if(obj.formatter !== undefined)
				{
					obj.formatter = setFormatterforGridWidget(obj.formatter);
				}
				if(obj.hidden !== undefined)
				{
					obj.hidden = true;
				}
				if(obj.name !== undefined)
				{
					obj.index = obj.name;
				}
				if(obj.sorttypefunction !== undefined){
				 	obj.sorttype = window[obj.sorttypefunction]; 
				}
			});
		}
		if(jsonData.WidgetAdditionalData != undefined && jsonData.WidgetAdditionalData.type==="OpmRemoteGrid"){//No I18N
			jsonData.WidgetType = "OpmRemoteGrid";//No I18N
		}
		if(jsonData.WidgetAdditionalData != undefined && jsonData.WidgetAdditionalData.widgetDispName!= undefined && jsonData.WidgetAdditionalData.widgetDispName!= null)
		{
			var dispName = Ember.I18n.t(jsonData.WidgetAdditionalData.widgetDispName,this);
			if (!opm_checkIfAValIsValid(dispName,'string') || (dispName).indexOf("Missing translation:") !== -1)
			{
				dispName = jsonData.WidgetAdditionalData.widgetDispName;
			}
			widgetParams.dispName = dispName;
		}
		if(jsonData.Name == "widget.name.firewallLiveTraffic" && jsonData.WidgetAdditionalData != undefined && jsonData.WidgetAdditionalData.interval != undefined){
			if(jsonData.WidgetAdditionalData.deviceId != undefined  && jsonData.WidgetAdditionalData.deviceId != "none"){
				if(OPMClient.HomeDetailsController.unlessNocView){
					OPMClient.Home.reloadLiveTraffDashWidget(widgetParams.id,jsonData.WidgetAdditionalData.interval);
				}
			}
		}
		if(jsonData.Name == "widget.name.firewallInterfaceLiveTraffic" && jsonData.WidgetAdditionalData != undefined && jsonData.WidgetAdditionalData.interval != undefined){
			if(jsonData.WidgetAdditionalData.deviceId != undefined && jsonData.WidgetAdditionalData.Interface != undefined  && jsonData.WidgetAdditionalData.deviceId != "none" && jsonData.WidgetAdditionalData.Interface != "none" ){
				if(OPMClient.HomeDetailsController.unlessNocView){
					OPMClient.Home.reloadLiveTraffDashWidget(widgetParams.id,jsonData.WidgetAdditionalData.interval);
				}
			}
		}
		if(jsonData.Name === 'widget.name.NutanixTopN' && jsonData.WidgetAdditionalData !== undefined && (jsonData.WidgetAdditionalData.graphUnit === 'Percentage' || jsonData.WidgetAdditionalData.graphUnit === '%')){
			if(jsonData.GridWidget !== undefined && jsonData.GridWidget.colModelList !== undefined){
				var valueIndex = jsonData.GridWidget.colModelList.map(function(modelObj){return modelObj.name}).indexOf('value');
				if(valueIndex > -1){
					var valueObject = jsonData.GridWidget.colModelList[valueIndex];
					valueObject.formatter = createBarChartForTopNGrid;
					valueObject.title = false;
				}
			}
		}
		if(jsonData.Name === "nfadb.collDetails"){
			jsonData.WidgetType = "NFATable";//No I18N
		}
		if (jsonData.Name === "widget.name.spmsummaryheatmap" && jsonData.WidgetAdditionalData.switchAddress !== undefined) {
            widgetParams.subTitle = jsonData.WidgetAdditionalData.switchAddress;
        }else if (jsonData.Name === "widget.name.ipavailabilityheatmap" && jsonData.WidgetAdditionalData.SubnetAddress !== undefined) {//No I18N
        	widgetParams.subTitle = jsonData.WidgetAdditionalData.SubnetAddress;
        }else if(jsonData.Name === "widget.name.treeView" && jsonData.WidgetAdditionalData.groupBy !== undefined){//No I18N
        	switch(jsonData.WidgetAdditionalData.groupBy)
        	{
        		case "category"://No I18N
        			widgetParams.subTitle = Ember.I18n.t('webclient.inventory.treeview.grpby.category',this);//No I18N
        			break;
        		case "vendor"://No I18N
        			widgetParams.subTitle = Ember.I18n.t('webclient.inventory.treeview.grpby.vendor',this);//No I18N
        			break;
        		case "bv"://No I18N
        			widgetParams.subTitle = Ember.I18n.t('webclient.inventory.treeview.grpby.bussview',this);//No I18N
        			break;
        		case "group"://No I18N
        			widgetParams.subTitle = Ember.I18n.t('webclient.inventory.treeview.grpby.groups',this);//No I18N
        			break;
        		case "probe"://No I18N
        			widgetParams.subTitle = Ember.I18n.t('webclient.inventory.treeview.grpby.probe',this);//No I18N
        			break;
        	}
        }
		if(jsonData.WidgetData === undefined && jsonData.WidgetForwardPage !== "sampleBusinessView" && jsonData.WidgetType !== "GoogleMap"){
			widgetParams.failureMsg = Ember.I18n.t("webclient.reports.view.nodata",this);//No I18N			
		}
		else if((jsonData.WidgetType === "NetworkPath" || jsonData.WidgetType === "customNetworkPath") && jsonData.WidgetData !== undefined && jsonData.WidgetData.ERROR !== undefined && jsonData.WidgetData.ERROR == "NO_DATA_FOUND")
		{
			widgetParams.success = false;
		}
		else if(jsonData.message === undefined)
		{
			//showWidgetDeviceLink(widgetParams.id,jsonData);
			if(jsonData.GridWidget !== undefined && jsonData.GridWidget.execFunction !== undefined && jsonData.WidgetAdditionalData.graphUnit !== undefined)
			{
				window[jsonData.GridWidget.execFunction](jsonData);
			}
			if(jsonData.WidgetData !== undefined && jsonData.WidgetData.xyTitles !== undefined)
			{
				$("#widget_holder_"+widgetParams.id).data("xyTitles", jsonData.WidgetData.xyTitles);
			}
			widgetParams.success=true;
		}
		if(anomalyWidgets.includes(jsonData.Name)) {
			var isNoData = false;
			switch(jsonData.Name) {
				case "widget.zia.dashboard.name.anomalies.overall": //No I18N	
					if(!jsonData.WidgetAdditionalData || !jsonData.WidgetAdditionalData.tileHeader) {
						isNoData = true;
					}
					;break;
				case "widget.zia.dashboard.name.anomalies.trend.group"://No I18N	
				case "widget.zia.dashboard.name.anomalies.trend.overall"://No I18N	
				case "widget.zia.dashboard.name.anomalies.top10.groups": //No I18N	
				case "widget.zia.dashboard.name.anomalies.top10.devices"://No I18N	
					if(!jsonData.WidgetData || Object.keys(jsonData.WidgetData).length === 0 || (Array.isArray(jsonData.WidgetData) && jsonData.WidgetData.length === 0)) {
						isNoData = true;
					}
					;break;
				case "widget.zia.dashboard.name.anomalies.recent": //No I18N	
					if(!jsonData.WidgetData || !jsonData.WidgetData.List || jsonData.WidgetData.List.length === 0) {
						isNoData = true;
					}
					;break;
				case "widget.zia.dashboard.name.anomalies.group.highest": //No I18N	
				case "widget.zia.dashboard.name.anomalies.device.highest": //No I18N	
				if(jsonData.WidgetData === undefined || !jsonData.WidgetAdditionalData || !jsonData.WidgetAdditionalData.tileHeader) {
					isNoData = true;
				}
				;break;
			}
			if(isNoData) {
				widgetParams.success = false;
				widgetParams.failureMsg = Ember.I18n.t("webclient.zia.dashboard.no.anomalies"); //No I18n
			}
			widgetParams.isAnomalyWidget = true;
		}
	}
	return jsonData;
}
function clearGridMemory(div)
{
	try
	{
		var grids = $(div).find('.ui-jqgrid-btable');
		$.each(grids, function(index, grid)
		{
			var gridId = $(grid).attr('id');
			if(gridId!==undefined && gridId!==null && gridId!=="")
			{
				$("#"+gridId).jqGrid('destroyFilterToolbar');
				$("#"+gridId).jqGrid('GridDestroy');
				$("#"+gridId).unbind();
				$("#"+gridId).remove();
				$("#alertmod_"+gridId).remove();
			}
		});
		grids=null;
		$(div).find('*').remove();
	}
	catch(err){}
}
function clearGraphMemory(div)
{
	d3.select(div).selectAll('rect').remove();//No I18N
	d3.select(div).select('svg').selectAll('*').remove();//No I18N
	d3.select(div).select('.container').remove();//No I18N
	d3.select(div).selectAll('*').remove();
	$(div).find('*').remove();
}
function clearMorrisElements(div)
{
	$(div).find('.morris-hover').remove();
	$(div).unbind('mouseleave');
	$(div).unbind('mousemove');
	$(div).unbind('touchstart touchmove touchend');
	$(div).unbind('click');
	$(div).unbind('mouseup');
	$(div).unbind('mousedown');
	$(div).unbind('resize');
}

function generateHtmlForHeatMap(heatMapDetails,widgetId)
{
	var html = '';
	var widid = "deviceInfoToolTip_"+widgetId; //No I18n
	function replaceWidClassName(className) {
	  return className.replace(/wid_(\d+)/, function(match, p1) {
	    return 'wid_heatmap_' + p1;//NO I18N
	  });
	}
    // Only render heatMapDetails.data if interactiveView is false
    if (heatMapDetails.data && heatMapDetails.interactiveView == false) {
      for (var i = 0; i < heatMapDetails.data.length; i++) {
        var obj = heatMapDetails.data[i];
		  obj.className = replaceWidClassName(obj.className);

        html += '<div tabindex="-1" data-status="' + obj.datastatus + '" style="' + obj.style + '" data-obj=\'' + obj.tooltipData + '\' data-devicename="' + obj.ID + '" id="' + obj.divid + '" onclick="' + obj.onClickFunc + '" class="' + obj.className + '">';
        
        if (heatMapDetails.heatmapGraphLabel === "true") {
          html += '<h4>' + obj.groupDisplayName + '</h4>';
        }

        html += '</div>';
      }
    }

    // interactiveView
    if (heatMapDetails.interactiveView) {
      html += '<div class="opmGraph-summary-breadcrumb p0 mb-xm">';
	  html += '<ul> <li><a href="javascript:void(0)" class="opm_link" data-devicename="Reset" id="Reset" onclick="OPMClient.CCTV.CCTVLoadSlideOneByOne(\'' + widgetId + '\',\'refresh\')">'+Ember.I18n.t('webclient.menu.home',this)+'</a></li>';

      for (var j = 0; j < heatMapDetails.parentsData.length; j++) {
        var parent = heatMapDetails.parentsData[j];
        if (parent.isLeaf) {
          html += '<li>' + escapeHtmlTags(parent.groupDisplayName)+ '</li>';
        } else {
          html += '<li><a href="javascript:void(0)" class="opm_link" onclick="' + parent.onClickFunc + '">' +escapeHtmlTags(parent.groupDisplayName)+ '</a></li>';
        }
      }

      html += '</ul></div>';

      if (heatMapDetails.parentsData && heatMapDetails.parentsData.length) {
        html += '<br>';
      }
      // unless heatMapDetails.filterView
      if (!heatMapDetails.filterView) {
        html += '<div class="heatmapHolder" id="childDiv">';
        function replaceWidClassName(className) {
		  return className.replace(/wid_(\d+)/, function(match, p1) {
		    return 'wid_heatmap_' + p1;//NO I18N
		  });
		}
        for (var k = 0; k < heatMapDetails.ChildrenData.length; k++) {
          var child = heatMapDetails.ChildrenData[k];
		   child.className = replaceWidClassName(child.className);
          html += '<div tabindex="-1" data-status="' + child.datastatus + '" style="' + child.style + '" data-obj=\'' + child.tooltipData + '\' data-devicename="' + child.groupDisplayName + '" id="' + child.groupName + '" onclick="' + child.onClickFunc +';setTimeout(function(){opm_resizeHeatmap();},200);" class="' + child.className + '" data-moname="'+child.groupName+'" data-groupName="'+child.groupName+'" data-isGroup="Group" data-heatmapwidid="'+widid+'">';

          if (heatMapDetails.heatmapGraphLabel === "true") {
            html += '<h4>' + (child.groupDisplayName) + '</h4>';
          }

          html += '</div>';
        }

        for (var d = 0; d < heatMapDetails.deviceData.length; d++) {
          var device = heatMapDetails.deviceData[d];
			if (widgetId) {
				device.className = device.className.replace(/wid_undefined/, "wid_heatmap_" + widgetId);
			}
			device.childrenType = 'MonitoringDevice';//No I18N 
			if(device.type === 'interface' || device.type === "MonitoringInterface"){
				device.childrenType = "MonitoringInterface";//No I18N
			}
			if(device.monitorType !== undefined && (device.monitorType === "voip" || device.monitorType === "wan" || device.monitorType === "video")){
				device.childrenType = "IpslaMon";//No I18N 
			}
          html += '<div tabindex="-1" data-status="' + device.datastatus + '" style="' + device.style + '" data-obj=\'' + device.tooltipData + '\' data-devicename="' + device.id + '" id="' + device.divid + '" onclick="' + device.onClickFunc + ';setTimeout(function(){opm_resizeHeatmap();},200);" class="' + device.className + '" data-moname="'+device.id+'" data-heatmapwidid="'+widid+'" data-memberType="'+device.childrenType+'">';

          if (heatMapDetails.heatmapGraphLabel === "true") {
            html += '<h4>' + device.groupDisplayName + '</h4>';
          }

          html += '</div>';
        }

        html += '</div>';
      }
    }

    // if filterView
    if (heatMapDetails.filterView) {
    	// Function outside the loop
		function replaceWidClassName(className) {
		  return className.replace(/wid_(\d+)/, function(match, p1) {
		    return 'wid_heatmap_' + p1; //NO I18N
		  });
		}
      html += '<div class="heatmapHolder">';
      for (var f = 0; f < heatMapDetails.filterdata.length; f++) {
        var filter = heatMapDetails.filterdata[f];
		  filter.className = replaceWidClassName(filter.className);

        html += '<div tabindex="-1" data-status="' + filter.datastatus + '" style="' + filter.style + '" data-obj=\'' + filter.tooltipData + '\' data-devicename="' + filter.deviceName + '" id="' + filter.divid + '" onclick="' + filter.onClickFunc + '" class="' + filter.className + '">';
        html += '<h4>' + filter.groupDisplayName + '</h4>';
        html += '</div>';
      }
      html += '</div>';
    }
	return html;
}
function setHeapMapSelf(widgetId,holderId)
{
	var apiData  = localStorage.getItem("cctvheatmap_"+widgetId); //NO I18N
	apiData = JSON.parse(apiData);
	var heatMapDetails = {};
	
	heatMapDetails.groupByGroups = true;
	heatMapDetails.id = widgetId;
	heatMapDetails.name = apiData.WidgetName;
	heatMapDetails.data = apiData.WidgetData.List;
	var self = Ember.ArrayController.create({
		widgetParams: {},
		heatMapDetails:{}
	});
	var params = {};
	params.id = 'inventoryVBarChart_widget_'+widgetId;//No I18N
	params.details = apiData.WidgetData.Details;
	params.widgetname = apiData.Name;
	params.showLabelCount=true;
	self.set('polarChartDetails',params);//No I18N
	var url = window.OPM.apiUrlPattern + "/device/getDeviceTree?groupBy=group&pageName=groups"; //NO I18N
	
	if(window.OPM.isEmbed) 
	{
		if(window.OPM.Embedtype === 'cctv')
		{
			url = '/embedWidget?type=cctv&cctvID='+window.OPM.cctvID+'&authKey='+window.OPM.authKey+'&widgetID='+widgetId+"&apiKey=EmbedView&methodCall=getDeviceTree&groupBy=group&pageName=groups"; //No I18N
		}
		else
		{
			url = '/embedWidget?type='+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+'&widgetID='+widgetId+"&apiKey=EmbedView&methodCall=getDeviceTree&groupBy=group&pageName=groups"; //No I18N
		}
	}
	var groupTree = opm_ajaxGetResponse(url); 

	self.set('groupTree',groupTree);//No I18N
	for(var i=0; i<groupTree.length; i++){
			recursiveGroup(groupTree[i],self);
	}
	var widgetParams = {};
	widgetParams.apiData = apiData;
	self.set('widgetParams',widgetParams) //NO I18N
	self.set('holderId'	,holderId); //NO I18N
	
	self.set("heatMapDetails.groupByGroups",true); //NO I18N
	opm_loadHeatChart(heatMapDetails,self);
	window.widgetStore = window.widgetStore || {};  // Ensure global storage exists
	window.widgetStore[heatMapDetails.id] = self;

}
function heatMapDrilllDown(groupName,groupType,widgetId,holderId,groupDisplayName)
{
	
	openHeatMapInfo(groupName,groupType,widgetId,groupDisplayName);
	// var heatMapDetails = self.get('heatMapDetails');
	// html = generateHtmlForHeatMap(heatMapDetails,widgetId);
    // $("#"+holderId).empty();
    // var elem = document.getElementById(holderId);
    // elem.innerHTML = '<div class="heatmapHolder" >'+html+'</div>';

}
function drawDOMForHeatMap(heatMapDetails,widgetId,holderId,fromPolarClick)
{
	html = generateHtmlForHeatMap(heatMapDetails,widgetId);
    $("#"+holderId).empty();
    var elem = document.getElementById(holderId);
    elem.innerHTML = '<div class="heatmapHolder" >'+html+'</div>';
	if(!fromPolarClick)
	{
		changeHeatMapPolarChart(widgetId);
	}
}

function openWanSiteHeatMapInfo(siteName, widgetId, siteDisplayName)
{
	$('.opmToolTipDescBar').remove();

	var self = window.widgetStore && window.widgetStore[widgetId];
	if(!self) { return; }

	var widgetParams = self.get('widgetParams'); //No I18N
	var heatMapDetails = self.get('heatMapDetails'); //No I18N
	var enableRedirection = widgetParams && widgetParams.apiData && widgetParams.apiData.WidgetAdditionalData &&
	                        widgetParams.apiData.WidgetAdditionalData.enableRedirection; 

	self.set("heatMapDetails.filterView", false); //NO I18N
	setTimeout(function(){ $('[id*="deviceInfoToolTip_"]').hide(); }, 500);

	// Use getDeviceTree API with siteName filter — same pattern as openHeatMapInfo uses
	// getDeviceTree?groupBy=group&groupName=X for devices under a group.
	var url = window.OPM.apiUrlPattern + '/device/getDeviceTree?groupBy=wanLinks&wanSiteName=' + encodeURIComponent(siteName); //No I18N
	var jsonData = opm_ajaxGetResponse(url);

	var alarmSeverityText = [
		Ember.I18n.t('webclient.admin.threshold.Critical',this), //NO I18N
		Ember.I18n.t('webclient.admin.threshold.Trouble',this), //NO I18N
		Ember.I18n.t('webclient.admin.threshold.Attention',this), //NO I18N
		Ember.I18n.t('webclient.admin.alarmesc.servicedown',this), //NO I18N
		Ember.I18n.t('webclient.map.view.clear',this), //NO I18N
		Ember.I18n.t('webclient.admin.threshold.Unknown',this), //NO I18N
		Ember.I18n.t('webclient.map.view.unmanaged',this) //NO I18N
	]; 

	var deviceData = [];
	$.each(jsonData, function(i, obj) {
		// icon last char = severity digit, same as openHeatMapInfo device processing
		var lastChar = obj.icon ? obj.icon[obj.icon.length - 1] : '5'; //No I18N
		obj.displayName = obj.text || obj.groupDisplayName;
		obj.tooltipData = '{"'+Ember.I18n.t('webclient.devices.details.devicename')+'":"'+escapeHtmlTags(obj.text)+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.devices.details.ipaddress')+'":"'+(obj.ipAddress)+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.opm.wanlinks.sitename')+'":"'+escapeHtmlTags(obj.siteName)+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.topo.actions.deviceinfo.status')+'":"'+(alarmSeverityText[lastChar - 1] || '')+'",' + //No I18N
						'"'+Ember.I18n.t('webclient.map.type')+'":"'+(obj.type)+'"}'; //No I18N
		obj.datastatus = lastChar;
		obj.className = 'heatmapStatus opmToolTipDesc alignCenterTxt --fault-severity severity_' + obj.datastatus + ' wid_' + widgetId; //No I18N
		obj.divid = 'HeatMapDiv_wanlink_' + i; //No I18N
		if(enableRedirection === "true") { //No I18N
			obj.onClickFunc = "opm_hideHeatmapTooltip();redirectWanLinkSnapshot('" + escapeHtmlTags(obj.siteName || obj.id || '') + "','" + escapeHtmlTags(obj.siteMoName || '') + "');setTimeout(function(){opm_resizeHeatmap();},200);"; //No I18N
		} else {
			obj.style = 'cursor:not-allowed'; //No I18N
			obj.onClickFunc = 'return false;'; //No I18N
		}
		deviceData.push(obj);
	});

	// Build breadcrumb parents data (same pattern as openHeatMapInfo)
	var parentsData = self.get('heatMapDetails.parentsData') || []; //No I18N
	var existingLeafIdx = parentsData.length - 1;
	if(existingLeafIdx >= 0) { parentsData[existingLeafIdx].isLeaf = false; }
	parentsData.push({ groupDisplayName: siteDisplayName, groupName: siteName, isLeaf: true });

	self.set('heatMapDetails.deviceData', $.extend(true, [], deviceData)); //NO I18N
	self.set('heatMapDetails.ChildrenData', []); //NO I18N
	self.set('heatMapDetails.parentsData', $.extend(true, [], parentsData)); //NO I18N
	self.set('heatMapDetails.interactiveView', true); //NO I18N

	setTimeout(function() {
		opm_customTooltip();
		try {
			// Build severity count map directly from the loaded deviceData (avoids DOM-timing issues)
			var severityCountMap = {};
			$.each(deviceData, function(i, obj) {
				var s = String(obj.datastatus);
				severityCountMap[s] = (severityCountMap[s] || 0) + 1;
			});
			// Update the simpleDonut dial (graphParams path, used when showZDial=true)
			var graphParams = self.get('graphParams'); //No I18N
			if(graphParams && graphParams.graphData) {
				var newGraphData = [];
				for(var gi = 0; gi < graphParams.graphData.length; gi++) {
					var d = graphParams.graphData[gi];
					newGraphData.push([d[0], severityCountMap[String(d[2])] || 0, d[2]]);
				}
				graphParams.graphData = newGraphData;
				self.set('graphParams', $.extend(true, {}, graphParams)); //No I18N
			}
			// Also update polarChartDetails for the non-ZDial (polarchart) path
			var polarChartDetails = self.get('polarChartDetails'); //No I18N
			if(polarChartDetails && polarChartDetails.details) {
				var details = polarChartDetails.details;
				for(var i = 0; i < details.length; i++) {
					details[i].Count = severityCountMap[String(details[i].Status)] || 0;
				}
				self.set('heatMapDetails.filterView', false); //NO I18N
				polarChartDetails.details = details;
				self.set('polarChartDetails', $.extend(true, [], polarChartDetails)); //NO I18N
			}
		} catch(e) {}
	}, 200);

	if(OPMClient.ApplicationController.currentPath === 'CCTVSlide.Index' || window.OPM.isEmbed) { //No I18N
		var _holderId = self.get('holderId');
		if(_holderId) {
			heatMapDetails.heatmapGraphLabel = widgetParams.apiData.WidgetAdditionalData.heatmapGraphLabel;
			drawDOMForHeatMap(heatMapDetails, widgetId, _holderId);
			changeHeatMapPolarChart(widgetId);
		}
	}
}

function openHeatMapInfo(groupName,groupType,id,displayName)
{	
	//Close the currently open tooltip
	$('.opmToolTipDescBar').remove();

	var self = self || window.widgetStore[id];  // Retrieve self object
	var widgetParams = self.get('widgetParams');
	var showLeafNode = widgetParams.apiData.WidgetAdditionalData.showLeafNode;
	var enableRedirection = widgetParams.apiData.WidgetAdditionalData.enableRedirection;
	self.set("heatMapDetails.filterView",false); //NO I18N
	setTimeout(function(){
		$("[id*='deviceInfoToolTip_']").hide();
	}, 500);

	if (groupType === "group") {
		self.set('heatMapDetails.ChildrenData', []); // No I18N
		var heatMapDetails = self.get('heatMapDetails.data');
		var childrenOfthisGroup = self.get('childrenOf' + groupName);
		var groupTree = self.get('groupTree');
		var parents = findParentPath(groupTree, groupName);
		var ChildrenData =  [];

		for (var i = 0; i < childrenOfthisGroup.length; i++) {
			var thisGroupName = childrenOfthisGroup[i];
			for (var j = 0; j < heatMapDetails.length; j++) {
				var heatMapDetailsData = heatMapDetails[j];
				if (thisGroupName === heatMapDetailsData.groupName) {
					if(heatMapDetails[j].groupType != "group")
					{
						clickEvnt = "redirectotGroupsSnapshot"; //No I18N
						var obj = heatMapDetails[j];
						if(showLeafNode == "false")
						{
							if(enableRedirection == "true")
							{
								heatMapDetails[j].onClickFunc = clickEvnt+'(\''+obj.groupName+'\',\''+obj.groupType+'\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
							}
							else
							{
								heatMapDetails[j].style = "cursor:not-allowed" //No I18N
								heatMapDetails[j].onClickFunc = "return false"; //No I18N
							}
						}
					}
						
					ChildrenData.pushObject(heatMapDetails[j]);
				}
			}
		}
		var parentsData = []
		for (var i = 0; i < parents.length; i++) {
			var thisGroupName = parents[i];
			for (var j = 0; j < heatMapDetails.length; j++) {
				var heatMapDetailsData = heatMapDetails[j];
				if (thisGroupName === heatMapDetailsData.groupName) {
					heatMapDetails[j].isLeaf = false;
					parentsData.pushObject(heatMapDetails[j]);
				}
			}
		}
		parentsData[parentsData.length-1].isLeaf = true;
		self.set("heatMapDetails.deviceData",$.extend(true,[],[])); //NO I18N
		self.set("heatMapDetails.parentsData", $.extend(true,[],parentsData)); //NO I18N
		self.set("heatMapDetails.ChildrenData", $.extend(true,[],ChildrenData)); //NO I18N
		self.set("heatMapDetails.interactiveView", true); //NO I18N
	}
	else
	{
var url = window.OPM.apiUrlPattern + "/device/getDeviceTree?groupBy=group&pageName=groups&groupName="+groupName; //NO I18N
		if(window.OPM.isEmbed) 
		{
			if(window.OPM.Embedtype === 'cctv')
				{
					url = '/embedWidget?type=cctv&cctvID='+window.OPM.cctvID+'&authKey='+window.OPM.authKey+'&widgetID='+id+"&apiKey=EmbedView&groupBy=group&methodCall=getDeviceTree&pageName=groups&groupName="+groupName; //No I18N
				}
				else
				{
					url = '/embedWidget?type='+window.OPM.Embedtype+'&authKey='+window.OPM.authKey+'&widgetID='+id+"&pageName=groups&apiKey=EmbedView&methodCall=getDeviceTree&groupBy=group&groupName="+groupName; //No I18N
				}
		}
		var jsonData = opm_ajaxGetResponse(url); 
		var heatMapDetails = self.get('heatMapDetails');
		var alarmSeverityText=[Ember.I18n.t('webclient.admin.threshold.Critical',this),Ember.I18n.t('webclient.admin.threshold.Trouble',this),Ember.I18n.t('webclient.admin.threshold.Attention',this),Ember.I18n.t('webclient.admin.alarmesc.servicedown',this),Ember.I18n.t('webclient.map.view.clear',this),Ember.I18n.t('webclient.admin.threshold.Unknown',this),Ember.I18n.t('webclient.map.view.unmanaged',this),Ember.I18n.t('webclient.device.status.notmonitored',this)];;//No I18N
		var deviceData = [];
			clickEvnt = "";//No I18N
			deviceData =[];
			$.each(jsonData, function(i,deviceListData)
	    	{
	    		var obj = jsonData[i];
				var lastChar = obj.icon[obj.icon.length - 1];
				obj.groupDisplayName=obj.text;
				obj.tooltipData = '{"Device Name":"'+escapeHtmlTags(obj.text)+'","'+Ember.I18n.t('opstor.inventory.status',this)+'":"'+alarmSeverityText[lastChar-1]+'","'+Ember.I18n.t('webclient.opm.grouptype',this)+'":"'+obj.type+'"}';//No I18N
				obj.datastatus = lastChar;
	            obj.className = "heatmapStatus opmToolTipDesc --fault-severity severity_"+obj.datastatus+" wid_"+heatMapDetails.id;//No I18N
				obj.divid = "HeatMap"+ obj.id;//NO I18N
				obj.childrenType = 'MonitoringDevice';//No I18N 
				obj.type = obj.type== 'device'?'MonitoringDevice':obj.type;//No I18N
				var clickEvnt = 'redirectToSnapshot';//No I18N
				if(obj.type === 'interface' || obj.type === "MonitoringInterface"){
					obj.childrenType = "MonitoringInterface";//No I18N
					obj.type = "MonitoringInterface";//No I18N
				}
				if(enableRedirection == "true")
				{
					if(obj.monitorType === "voip" || obj.monitorType === "wan" || obj.monitorType === "video"){
						obj.type = obj.monitorType === "voip"? "IPSLAVoIP":obj.monitorType === "wan"? "IPSLAWAN":"IPSLAVideo"; //No I18N
						obj.id = obj.probeId;
						obj.childrenType = "IpslaMon";//No I18N 
					}
					obj.onClickFunc = clickEvnt+'(\''+obj.type+'\',\''+obj.id+'\');setTimeout(function(){opm_resizeHeatmap();},200);';
				}
				else
				{
					if(obj.monitorType === "voip" || obj.monitorType === "wan" || obj.monitorType === "video"){
						obj.type = obj.monitorType === "voip"? "IPSLAVoIP":obj.monitorType === "wan"? "IPSLAWAN":"IPSLAVideo"; //No I18N
						obj.id = obj.probeId;
						obj.childrenType = "IpslaMon";//No I18N 
					}
					obj.style = "cursor:not-allowed" //No I18N
					obj.onClickFunc = "return false"; //No I18N
				}
				deviceData.pushObject(obj);
	       	});
			   var parentsData = self.get("heatMapDetails.parentsData") || [];
			   var interfaceGroup = $.extend(true,[],deviceData[0]);
			   interfaceGroup.groupDisplayName = displayName;
			   interfaceGroup.groupType = "interfaceGroup"; //NO I18N
			   function isGroupExistInArray(details, groupDisplayName) {
				for (var i = 0; i < details.length; i++) {
				  if (details[i].groupDisplayName === groupDisplayName || details[i].groupType == "interfaceGroup") {
					return true; // Status found
				  }
				}
				return false; // Status not found
			  }
			   if(isGroupExistInArray(parentsData,displayName) == false)
			   {
					parentsData.pushObject(interfaceGroup);
			   }
			   else
			   {
					parentsData.pop();
					parentsData.pushObject(interfaceGroup);
			   }
			   for (var i = 0; i < parentsData.length; i++) {
				   parentsData[i].isLeaf = (i === parentsData.length - 1);
			   }
			   
			  
			  self.set("heatMapDetails.parentsData",$.extend(true,[],parentsData)); //NO I18N
			  self.set("heatMapDetails.ChildrenData",[]); //NO I18N
			  self.set("heatMapDetails.deviceData",$.extend(true,[],deviceData)); //NO I18N
			  self.set("heatMapDetails.interactiveView",true); //NO I18N
	}
	setTimeout(function(){
					opm_customTooltip();
					var polarChartDetails = self.get('polarChartDetails');
					var details = self.get('polarChartDetails').details;
					function isStatusExistInArray(details, statusId) {
						for (var i = 0; i < details.length; i++) {
						  if (details[i].Status === statusId) {
							return true; // Status found
						  }
						}
						return false; // Status not found
					  }
					if(self.get('heatMapDetails.ChildrenData').length == 0)
					{
						if(isStatusExistInArray(details, 5) == false)
						{
							details[details.length] = {
								"Status": 5, //NO I18N
								"Count": 0, //NO I18N
								"Label": Ember.I18n.t('webclient.map.view.clear',this), //NO I18N
								"StatusClass": "severity_5", //NO I18N
								"StatusColor": "#2B8820" //NO I18N
							}
						}
						if(isStatusExistInArray(details, 7) == false)
						{
							details[details.length] = {
								"Status": 7, //NO I18N
								"Count": 0, //NO I18N
								"Label": Ember.I18n.t('webclient.map.view.unmanaged',this), //NO I18N
								"StatusClass": "severity_7", //NO I18N
								"StatusColor": "#2B8820" //NO I18N
							}
						}
					}
						else if(details[details.length-1].Status ==7)
						{
							details.pop();
							details.pop();
						}
					for (var i = 0; i < details.length; i++) {
						details[i].Count = parseInt($('.heatmapHolder[id="childDiv"] div.severity_'+details[i].Status).length);
					}

					self.set("heatMapDetails.filterView",false); //NO I18N
					polarChartDetails.details = details;
					self.set("polarChartDetails", $.extend(true,[],polarChartDetails)); //NO I18N
		},200);
	if(OPMClient.ApplicationController.currentPath==="CCTVSlide.Index" == true || window.OPM.isEmbed)
	{
		var heatMapDetails  = self.get('heatMapDetails');
		var holderId = self.get('holderId');
		heatMapDetails.heatmapGraphLabel = widgetParams.apiData.WidgetAdditionalData.heatmapGraphLabel;
		drawDOMForHeatMap(heatMapDetails,id,holderId);
		changeHeatMapPolarChart(id);
	}
}
function changeHeatMapPolarChart(widgetId)
{
	var self = window.widgetStore[widgetId];  // Retrieve self object
	setTimeout(function(){
		opm_customTooltip();
		var polarChartDetails = self.get('polarChartDetails');
		var details = self.get('polarChartDetails').details;
		function isStatusExistInArray(details, statusId) {
			for (var i = 0; i < details.length; i++) {
			  if (details[i].Status === statusId) {
				return true; // Status found
			  }
			}
			return false; // Status not found
		  }
		if(self.get('heatMapDetails.ChildrenData') && self.get('heatMapDetails.ChildrenData').length == 0)
		{
			if(isStatusExistInArray(details, 5) == false)
			{
				details[details.length] = {
					"Status": 5, //NO I18N
					"Count": 0, //NO I18N
					"Label": "Up", //NO I18N
					"StatusClass": "severity_5", //NO I18N
					"StatusColor": "#2B8820" //NO I18N
				}
			}
			if(isStatusExistInArray(details, 7) == false)
			{
				details[details.length] = {
					"Status": 7, //NO I18N
					"Count": 0, //NO I18N
					"Label": "un Managed", //NO I18N
					"StatusClass": "severity_7", //NO I18N
					"StatusColor": "#2B8820" //NO I18N
				}
			}
		}
			else if(details[details.length-1].Status ==7)
			{
				details.pop();
				details.pop();
			}
		for (var i = 0; i < details.length; i++) {
			details[i].Count = parseInt($('.heatmapHolder[id="childDiv"] div.severity_'+details[i].Status).length);
		}
		self.set("heatMapDetails.filterView",false); //NO I18N
		polarChartDetails.details = details;
		self.set("polarChartDetails", $.extend(true,[],polarChartDetails)); //NO I18N
		if(self.get('heatMapDetails.groupByGroups')===true)
			{
				var chartParams = self.polarChartDetails;
				if(chartParams!=undefined){
					var options = {};
					if(chartParams.showLabelCount!==undefined){
						options.showLabelCount = chartParams.showLabelCount;
					}
					if(chartParams.isOPMAvailabilityData!==undefined){
						options.isOPMAvailabilityData = chartParams.isOPMAvailabilityData;
					}
				   options.widgetname = chartParams.widgetname;
					
				 if(self.get("heatMapDetails.interactiveView") == true)
				  {
					opm_setPolarchartValues('#'+chartParams.id,chartParams.details,undefined,options,self);
				  }
				}
			}
},200);
}
function opm_loadHeatChart(heatMapDetails,self)
{
	//var clickEvnt = 'opm_deviceShortSummaryView';//No I18N
	var widgetName = heatMapDetails.name;
	//if($("#"+heatMapDetails.id).hasClass('widgetHeatmap')){
		var clickEvnt = 'redirectToDeviceSnapshot';//No I18N
	//}
	var widgetParams = self.get('widgetParams');
	var groupTree = self.get('groupTree');
    var deviceListData = heatMapDetails.data;
    var heatMapDetailsParams = [];
    
	if(widgetName === 'NFA_HeatMAP')
	{
		$.each(deviceListData, function(i,obj)
		{
			var obj = deviceListData[i];
			obj.tooltipData = JSON.stringify(nfa_getToolTipData(obj, heatMapDetails.isWLC,widgetParams.apiData.WidgetData.isUtilization));
			obj.status = obj.status;
			obj.divid = "HeatMapDiv_"+i;//NO I18N
			obj.className = "heatmapStatus opmToolTipDesc severity_"+obj.status+" wid_"+heatMapDetails.id; //No I18N
			obj.onClickFunc = 'redirectToNFASnapshot(\''+obj.deviceName+'\',\''+((heatMapDetails.isWLC) ? "FlowAPMAC" : "FlowInterface")+'\');setTimeout(function(){opm_resizeHeatmap();},200);'; //No I18N
			heatMapDetailsParams.pushObject(obj);
		});
	}
    else if(widgetName === 'NCM')
    {
    	$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.status = 2;
            if(obj.cell[21] == "SUCCESS"){
                obj.status = 5;
            }else if(obj.cell[21] == "FAILURE"){
                obj.status = 1;
            }
            obj.deviceName = obj.cell[0];
            obj.divid = "HeatMapDiv_"+i;//NO I18N
            obj.onClickFunc = "redirectList(\'ConfigMgmt\', \'ShortSummary/'+obj.cell[0]+'\');setTimeout(function(){opm_resizeHeatmap();},200);";
            obj.className = "heatmapStatus opmToolTipDesc severity_"+obj.status+" wid_"+heatMapDetails.id;//No I18N
            obj.tooltipData = '{"DeviceName":"'+obj.cell[4]+'","Category":"'+obj.cell[6]+'","Backup Status":"'+obj.cell[21]+'","Series / Model":"'+obj.cell[7]+'"}';//No I18N
    		heatMapDetailsParams.pushObject(obj);
    	});
    }
    else if(widgetName === "IPAMIPs")
    {
    	$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.dns = obj['ip-to-dns'];//NO I18N
            if(obj.dns === ""){obj.dns="&nbsp;";}
            obj.datastatus = obj['scan-status-int'];//No I18N
            obj.deviceName = obj['ip-address'];//No I18N
            obj.divid = "HeatMapDiv_"+i;//NO I18N
            obj.onClickFunc = clickEvnt+'(\''+obj['ip-address']+'\',\'IPAMIP\',\'true\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N			
            obj.tooltipData = '{"'+Ember.I18n.t('opu.views.IP_ADDRESS',this)+'":"'+obj['ip-address']+'","'+Ember.I18n.t('opu.views.DNS_NAME',this)+'":"'+obj.dns+'","'+Ember.I18n.t('opu.views.STATUS',this)+'":"'+obj.status+'"}';//No I18N
            obj.className = "heatmapStatus opmToolTipDesc severity_"+obj['scan-status-int']+" wid_"+heatMapDetails.id;//No I18N
    		heatMapDetailsParams.pushObject(obj);
    	});
    }
    else if(widgetName === "SPMPorts")
    {
    	$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
	        obj.dns = obj['connected-dns'];//NO I18N
	        if(obj.dns === ""){obj.dns="&nbsp;";}
	        obj.mac = obj['connected-mac'];//NO I18N
	        if(obj.mac === ""){obj.mac="&nbsp;";}
	        obj.tooltipData =  '{"'+Ember.I18n.t('opu.views.SWITCH_NAME',this)+'":"'+obj['switch-name']+'","'+Ember.I18n.t('opu.views.IFINDEX',this)+'":"'+obj['connected-port-ifindex']+'","'+Ember.I18n.t('opu.views.STATUS',this)+'":"'+obj['scan-status']+'","'+Ember.I18n.t('webclient.vimonitor.snapshot.macaddress',this)+'":"'+obj.mac+  '","'+Ember.I18n.t('opu.views.DNS_NAME',this)+'":"'+obj.dns+'"}';//No I18N
	        obj.className = "heatmapStatus opmToolTipDesc severity_"+obj['scan-status-int']+" wid_"+heatMapDetails.id;//No I18N
	        obj.deviceName = obj['ip-address'];//No I18N
	        obj.datastatus = obj['scan-status-int'];//No I18N
	        obj.divid = "HeatMapDiv_"+i;//NO I18N
	        obj.onClickFunc='opm_deviceShortSummaryView(\''+obj['switch-name']+' '+obj['connected-port-ifindex']+'\',\'IPAMPort\',\'true\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
	        heatMapDetailsParams.pushObject(obj);
    	});
    }
    else if(widgetName === "IPAMSubnets")
    {
    	$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.tooltipData = '{"'+Ember.I18n.t('opu.views.SUBNET_ADDRESS',this)+'":"'+obj['subnet-address']+'","'+Ember.I18n.t('opu.views.SUBNET_MASK',this)+'":"'+obj['subnet-mask']+'","'+Ember.I18n.t('webclient.map.flash.size',this)+'":"'+obj['subnet-size']+'","'+Ember.I18n.t('opu.views.STATUS',this)+'":"'+obj['scan-status']+'"}';//No I18N
    		obj.datastatus = +obj.subnetid;
    		obj.deviceName = obj['ip-address'];//No I18N
    		obj.divid = "HeatMapDiv_"+i;//NO I18N 
    		obj.onClickFunc=clickEvnt+'(\''+obj['subnet-address']+'\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
    		obj.className = "heatmapStatus opmToolTipDesc severity_"+obj.subnetid+" wid_"+heatMapDetails.id;//No I18N
    		heatMapDetailsParams.pushObject(obj);
    	});
    }
    else if(widgetName === "SPMSwitches")
    {
    	$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.tooltipData = '{"'+Ember.I18n.t('opu.views.SWITCH_NAME',this)+'":"'+obj['switch-name']+'","'+Ember.I18n.t('opu.views.SYS_NAME',this)+'":"'+obj['system-name']+'","'+Ember.I18n.t('opu.views.IP_ADDRESS',this)+'":"'+obj['ip-address']+'","'+Ember.I18n.t('opu.views.STATUS',this)+'":"'+obj['scan-status']+'"}';//No I18N
    		obj.datastatus = obj['switch-id'];//No I18N
    		obj.deviceName = obj['ip-address'];//No I18N
    		obj.divid = "HeatMapDiv_"+i;//NO I18N
    		obj.className = "heatmapStatus opmToolTipDesc severity_1 wid_"+heatMapDetails.id;//No I18N
    		obj.onClickFunc=clickEvnt+'(\''+obj['switch-name']+'\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
    		heatMapDetailsParams.pushObject(obj);
    	});
    }
    else if(widgetName === 'widget.name.ipavailabilityheatmap')
    {
    	if(deviceListData!=undefined){
	    	$.each(deviceListData, function(i,obj)
	    	{
	    		var obj = deviceListData[i];
	            obj.dns = obj.displayName;
	            if(obj.deviceName === obj.displayName){obj.dns="---";}
	            obj.datastatus = obj.statusNum;
	            obj.divid = "HeatMapDiv_"+i;//NO I18N
		    	obj.href= redirectToSnapshot('IPAMIP',obj.deviceName, undefined, undefined, true); //No I18N
	            obj.onClickFunc='setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
	            obj.className = "heatmapStatus opmToolTipDesc severity_"+obj.statusNum+" wid_"+heatMapDetails.id;//No I18N
	            obj.tooltipData = '{"'+Ember.I18n.t('opu.views.IP_ADDRESS',this)+'":"'+obj.deviceName+'","'+Ember.I18n.t('opu.views.DNS_NAME',this)+'":"'+obj.dns+'","'+Ember.I18n.t('opu.views.STATUS',this)+'":"'+obj.statusStr+'"}';//No I18N
	            heatMapDetailsParams.pushObject(obj);
	        });
	    }
    }
    else if(widgetName === 'widget.name.spmsummaryheatmap')
    {
    	if(deviceListData!=undefined){
    		$.each(deviceListData, function(i,obj)
	    	{
	    		var obj = deviceListData[i];
	            obj.macaddr = obj['connected-mac'];//NO I18N
	            if(obj.macaddr === ""){obj.macaddr = "&nbsp;";}
	            obj.divid = "HeatMapDiv_"+i;//NO I18N
	            obj.tooltipData = '{"'+Ember.I18n.t('opu.views.IFINDEX',this)+'":"'+obj.ifIndex+'","'+Ember.I18n.t('webclient.devices.details.mac',this)+'":"'+obj.macaddr+'","'+Ember.I18n.t('opu.views.STATUS',this)+'":"'+obj.statusStr+'"}';//No I18N
	            obj.datastatus = obj.statusNum;
				obj.className = "heatmapStatus opmToolTipDesc severity_"+obj.statusNum+" wid_"+heatMapDetails.id;//No I18N
				obj.divid = "HeatMapDiv_"+i;//NO I18N
				obj.href = redirectToSnapshot('IPAMPort', OPMClient.HomeDetailsController.spmheatmapswitchname+' '+obj.ifIndex, undefined, undefined, true); //No I18N
				obj.onClickFunc='setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
				heatMapDetailsParams.pushObject(obj);
	        });
    	}
    }
	else if(widgetName === 'widget.name.wanip.wanipHeatMap')
	{
		window.isHeatMapClicked = false;
		var isOPMAvailabilityData = false; //No I18N - use fault severity colors (1=Critical=red)
		 clickEvnt = "redirectWanLinkSnapshot"; //NO I18N

		$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.tooltipData = '{"'+Ember.I18n.t('webclient.devices.details.devicename',this)+'":"'+escapeHtmlTags(obj.displayName)+'","'+Ember.I18n.t('webclient.devices.details.ipaddress',this)+'":"'+obj.ipAddress+'","'+Ember.I18n.t('webclient.opm.wanlinks.sitename',this)+'":"'+escapeHtmlTags(obj.siteName)+'","'+Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+'":"'+obj.statusStr+'","'+Ember.I18n.t('webclient.map.type',this)+'":"'+obj.type+'"}';//No I18N
          	var severityClass = isOPMAvailabilityData?"availseverity_":"--fault-severity severity_";//No I18N
            obj.datastatus = obj.statusNum;
            obj.className = "heatmapStatus opmToolTipDesc alignCenterTxt "+severityClass+obj.statusNum+" wid_"+heatMapDetails.id;//No I18N
			obj.divid = "HeatMapDiv_"+i;//NO I18N
			obj.onClickFunc = 'opm_hideHeatmapTooltip();'+clickEvnt+'(\''+obj.deviceName+'\',\''+obj.siteMoName+'\');setTimeout(function(){opm_resizeHeatmap();},200);window.isHeatMapClicked=true;'; //No I18N
			heatMapDetailsParams.pushObject(obj);
       	});
	}
	else if(widgetName === 'widget.name.wanip.siteHeatMap')
	{
		window.isHeatMapClicked = false;
		var isOPMAvailabilityData = false; 
		var _wparams = self.get('widgetParams'); //No I18N
		var _showLeafNode = _wparams && _wparams.apiData && _wparams.apiData.WidgetAdditionalData &&
		                    _wparams.apiData.WidgetAdditionalData.showLeafNode === "true"; //No I18N

		if(_showLeafNode) {
			// Register self so openWanSiteHeatMapInfo can retrieve it via window.widgetStore
			window.widgetStore = window.widgetStore || {};
			window.widgetStore[heatMapDetails.id] = self;
		}
		$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.siteMoName = obj.siteMoName || obj.deviceName;
    		obj.deviceName = obj.siteMoName || obj.deviceName;
    		var tooltipObj = {};
    		tooltipObj[Ember.I18n.t('webclient.Site.Name',this)] = escapeHtmlTags(obj.displayName);
    		tooltipObj[Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)] = obj.statusStr;
    		tooltipObj[Ember.I18n.t('webclient.map.type',this)] = obj.type;
    		if(obj.members !== undefined) { tooltipObj[Ember.I18n.t('webclient.grouping.summary.members',this)] = obj.members; } //No I18N
    		obj.tooltipData = JSON.stringify(tooltipObj);
          	var severityClass = isOPMAvailabilityData?"availseverity_":"--fault-severity severity_";//No I18N
            obj.datastatus = obj.statusNum;
            obj.className = "heatmapStatus opmToolTipDesc alignCenterTxt "+severityClass+obj.statusNum+" wid_"+heatMapDetails.id;//No I18N
			obj.divid = "HeatMapDiv_"+i;//NO I18N
			if(_showLeafNode) {
				// Leaf-node mode: call openWanSiteHeatMapInfo to drill into child WANIPs via treeview API
				var _siteName = obj.siteMoName || obj.deviceName; 
				var _siteDisplay = obj.displayName || obj.siteName || obj.deviceName;
				obj.onClickFunc = "opm_hideHeatmapTooltip();openWanSiteHeatMapInfo('" + escapeHtmlTags(_siteName) + "','" + heatMapDetails.id + "','" + escapeHtmlTags(_siteDisplay) + "');"; //No I18N
			} else {
				obj.onClickFunc = 'opm_hideHeatmapTooltip();redirectWanSiteSnapshot(\''+obj.siteMoName+'\');setTimeout(function(){opm_resizeHeatmap();},200);window.isHeatMapClicked=true;'; //No I18N
			}
			heatMapDetailsParams.pushObject(obj);
       	});
	}
    else
    {
    	window.isHeatMapClicked = false;
    	if(heatMapDetails.groupByGroups){
			var widgetParams = self.get('widgetParams');
			var IsDefaultDrillDownType = widgetParams.apiData.WidgetAdditionalData.selectedDrillDownType == "0"
			clickEvnt =IsDefaultDrillDownType ? "redirectotGroupsSnapshot" : "openHeatMapInfo"; //NO I18N
			window.widgetStore = window.widgetStore || {};  // Ensure global storage exists
			window.widgetStore[heatMapDetails.id] = self;
			$.each(deviceListData, function(i,obj)
	    	{
	    		var obj = deviceListData[i];
	    		obj.tooltipData = '{"'+Ember.I18n.t('webclient.opm.groupname.header',this)+'":"'+escapeHtmlTags(obj.groupDisplayName)+'","'+Ember.I18n.t('opstor.inventory.status',this)+'":"'+obj.statusStr+'","'+Ember.I18n.t('webclient.opm.grouptype',this)+'":"'+obj.groupType+'","'+Ember.I18n.t('webclient.grouping.summary.members',this)+'":"'+obj.problematicMembers+' / '+obj.totalMembers+'"}';//No I18N
				obj.datastatus = obj.statusNum;
	            obj.className = "heatmapStatus opmToolTipDesc --fault-severity severity_"+obj.groupStatus+" wid_"+heatMapDetails.id;//No I18N
				obj.divid = "HeatMap"+ obj.groupName;//NO I18N
				obj.onClickFunc = clickEvnt+'(\''+obj.groupName+'\',\''+obj.groupType+'\');setTimeout(function(){opm_resizeHeatmap();},200);window.isHeatMapClicked=true;';//No I18N
				obj.isGroup = "Group"; //No I18n
				if(IsDefaultDrillDownType)
				{
					obj.onClickFunc = clickEvnt+'(\''+obj.groupName+'\',\''+obj.groupType+'\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
				}
				else
				{
					obj.datastatus = obj.groupStatus;
					if(obj.groupType == "group"){
						clickEvnt="openHeatMapInfo"; //NO I18N
						obj.onClickFunc = clickEvnt + "('" + obj.groupName + "', '" + obj.groupType + "', '"+heatMapDetails.id+"','"+obj.groupDisplayName+"'); setTimeout(function(){ opm_resizeHeatmap(); }, 200);";
					}
					else
					{
						var showLeafNode = widgetParams.apiData.WidgetAdditionalData.showLeafNode;
						var enableRedirection = widgetParams.apiData.WidgetAdditionalData.enableRedirection;
					
						if(showLeafNode == "false")
						{
							if(enableRedirection == "true")
							{
								clickEvnt = "redirectotGroupsSnapshot" ; //NO I18N
								obj.onClickFunc = clickEvnt+'(\''+obj.groupName+'\',\''+obj.groupType+'\');setTimeout(function(){opm_resizeHeatmap();},200);';//No I18N
							}
							else
							{
								obj.style = "cursor:not-allowed;"; //No I18N
								obj.onClickFunc = "return false;"; //No I18N
							}
						}
						else
						{
							obj.onClickFunc = clickEvnt + "('" + obj.groupName + "', '" + obj.groupType + "', '"+heatMapDetails.id+"','"+obj.groupDisplayName+"'); setTimeout(function(){ opm_resizeHeatmap(); }, 200);";
						}
						
					}
				}
				heatMapDetailsParams.pushObject(obj);
	       	});
    	}else{
		var isOPMAvailabilityData = false;
		var isGroupByMembers = "false"; //No I18N
    	if(heatMapDetails.name==="widget.name.heatmap" && self!==undefined && self.widgetParams!==undefined && self.widgetParams.apiData!==undefined && self.widgetParams.apiData.WidgetAdditionalData!==undefined && self.widgetParams.apiData.WidgetAdditionalData.heatMapType==="availability"){//No I18n
    		isOPMAvailabilityData = true;
    	}
    	if(heatMapDetails.groupByMembers){
    		isGroupByMembers = "true"; //No I18N
    	}
    	$.each(deviceListData, function(i,obj)
    	{
    		var obj = deviceListData[i];
    		obj.isGroupByMembers = isGroupByMembers;
    		if(obj.ipaddress !== undefined)
    		{
    			obj.tooltipData = '{"'+Ember.I18n.t('webclient.devices.details.devicename',this)+'":"'+escapeHtmlTags(obj.displayName)+'","'+Ember.I18n.t('webclient.devices.details.ipaddress',this)+'":"'+obj.ipaddress+'","'+Ember.I18n.t('webclient.common.widgets.category',this)+'":"'+obj.category+'","'+Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+'":"'+obj.statusStr+'","'+Ember.I18n.t('webclient.map.type',this)+'":"'+obj.type+'"}';//No I18N
    		}
    		else
    		{
    			obj.tooltipData = '{"'+Ember.I18n.t('webclient.devices.details.devicename',this)+'":"'+escapeHtmlTags(obj.displayName)+'","'+Ember.I18n.t('webclient.common.widgets.category',this)+'":"'+obj.category+'","'+Ember.I18n.t('webclient.topo.actions.deviceinfo.status',this)+'":"'+obj.statusStr+'","'+Ember.I18n.t('webclient.map.type',this)+'":"'+obj.type+'"}';//No I18N
    		}
          	var severityClass = isOPMAvailabilityData?"availseverity_":"--fault-severity severity_";//No I18N
            obj.datastatus = obj.statusNum;
            obj.className = "heatmapStatus opmToolTipDesc alignCenterTxt "+severityClass+obj.statusNum+" wid_"+heatMapDetails.id;//No I18N
			obj.divid = "HeatMapDiv_"+i;//NO I18N
			obj.onClickFunc = clickEvnt+'(\''+obj.deviceName+'\');setTimeout(function(){opm_resizeHeatmap();},200);window.isHeatMapClicked=true;';
			heatMapDetailsParams.pushObject(obj);
       	});
	    }
    }
	var heatMapDetails = self.get('heatMapDetails');
	heatMapDetails.data = heatMapDetailsParams;
	self.set('heatMapDetails', $.extend(true, {}, heatMapDetails));//NO I18N
	self.notifyPropertyChange('heatMapDetails');//NO I18N
}
function recursiveGroup(data,self)
{
	if(data.children && data.children.length >0)
	{
		var childrenofthisgroup = [];
		for(var j=0; j<data.children.length; j++){
			var children = data.children[j];
			var div ='#HeatMap'+children.groupName; //NO I18N
			childrenofthisgroup.push(children.groupName);
			if ($(div).attr("childrenOf") === undefined) {
				$(div).attr("childrenOf", data.groupName);
			}

			recursiveGroup(children,self);
		}
		if(data.children && data.children.length >0)
		{
			self.set('childrenOf'+data.groupName,childrenofthisgroup); //NO I18N
		}
	}
	
	return ;
}
function findParentPath(data, targetGroupName, path) {
    var path = path || [];
    for (var i = 0; i < data.length; i++) {
        var node = data[i];
        path.push(node.groupName);

        if (node.groupName === targetGroupName) {
            return path;
        }

        if (node.children && node.children !== true) {
            var result = findParentPath(node.children, targetGroupName, path.slice());
            if (result) 
            	{
            		return result;
            	}
        }

        path.pop();
    }

    return null;
}
function postHeatChartRenderer(id,isOPMAvailabilityData,heatmapGraphLabel)
{
	opm_customTooltip();
	opm_resizeHeatmap(id,heatmapGraphLabel);
	$('#'+id+' .heatmapHolder .heatmapStatus').hover(function(){
		var num = parseInt($(this).attr('data-status'));
		var dataColor =  isOPMAvailabilityData?availabiltyStatusColors[num-1]:statusColors[num-1];
		var color = opm_lightToDarkColor(dataColor, -0.08);
		var ht = $(this).height();
		$(this).attr('style','background:'+color+' !important;width:'+ht+'px;height:'+ht+'px');

	},
	 function(){
	 	var num = parseInt($(this).data('status'));
		var ht = $(this).height();
		$(this).attr('style','width:'+ht+'px;height:'+ht+'px');
	 }		
	);
	$('#'+id+' .heatmapHolder .heatmapStatus').click(function(){
		var ht = $(this).height();
		$(this).attr('style','width:'+ht+'px;height:'+ht+'px');
		$('.opmToolTipDescBar').remove();
	});
	// if($('#DeviceList').hasClass('deviceShortSummaryActive') && deviceListData[0] !== undefined && heatMapDetails.id.indexOf('opm_devListHolder') !== -1)
	// {
	// 	if(widgetName === 'NCM'){
	// 		setHeatMapFocus(heatMapDetails.id,deviceListData[0].cell[0]);
	// 		opm_deviceShortSummaryView(deviceListData[0].cell[0],"ConfigDevice"); //No I18N	
	// 	}else{
	// 		var devFlag=false;
	// 		$.each(deviceListData, function(index, value){
 //    	        if(value.deviceName == OPMClient.InventoryDeviceDetailsController.deviceName){
 //    	        	devFlag=true;
 //    	        	return;
 //    	        }
 //    	    });
	// 		if(devFlag){
	// 			setHeatMapFocus(heatMapDetails.id,OPMClient.InventoryDeviceDetailsController.deviceName);
	// 			opm_deviceShortSummaryView(OPMClient.InventoryDeviceDetailsController.deviceName,"MonitoringDevice"); //No I18N
	// 		}else{
	// 			setHeatMapFocus(heatMapDetails.id,deviceListData[0].deviceName);
	// 			opm_deviceShortSummaryView(deviceListData[0].deviceName,"MonitoringDevice"); //No I18N
	// 		}
			
	// 	}
	// }
}
function constructHBarChartWidget(self)
{
	var widgetParams = self.widgetParams;
	var jsonData = widgetParams.apiData;
	var wObj = jsonData.WidgetAdditionalData;
	var wname = jsonData.Name;
	var dataParams = [];
	var isMinMax = false;
  	var isVolume = false;
  	self.set('dataParams',{});//No I18N
  	self.set('dataParams.id',widgetParams.id);//No I18N
  	self.set('dataParams.isMinMax',false);//No I18N
  	self.set('dataParams.isVolume',false);//No I18N
  	if (wname == "widget.name.NutanixTopN" || wname == "widget.name.topncpu" || wname == "webclient.reports.alldevices.diskutil" || wname == "widget.name.topnmem" || wname == "widget.name.overncpu" || wname == "widget.name.overnmem" || wname == "widget.name.topminmaxcpu" || wname == "widget.name.topminmaxmem" || wname == "widget.name.virtualTopN" || wname === 'widget.name.ipamTopTenScopesOccupied')
  	{
  		self.set('dataParams.showPercentage',true);//No I18N
  	}
	$.each(jsonData.WidgetData,function(ind,obj)
	{
		obj.value = Number(obj.value);
        if(obj.value>100){obj.value=100;}
        obj.value=Math.round(obj.value*100)/100; //Rounding off two digits because of space constraint in the UI
        obj.text = obj.displayName;
		obj.statusClass = 'utrow opmToolTipDesc ';//No I18N
		if(obj.value >= wObj.criticalValue){
			obj.statusClass += 'severity_1';//No I18N
		}else if(obj.value >= wObj.attentionValue){
			obj.statusClass += 'severity_3';//No I18N
		}else{
			obj.statusClass += 'severity_5';//No I18N
		}
		if(obj.hoverDetails != undefined)
		{
			obj.tooltipData = '{"'+Ember.I18n.t('opu.views.NAME',this)+'":"'+encodeURIComponent(obj.text)+'"';//No I18N
			$.each(obj.hoverDetails, function(k1,val1){
				obj.tooltipData+=',"'+k1+'":"'+val1+'"';//No I18N
	 		});
			obj.tooltipData+="}";//No I18N
		}
		else
		{
			obj.volumeTxt = "";//No I18N
			if(obj.volume !== undefined){
				obj.volumeTxt = ',"'+Ember.I18n.t('webclient.reports.volume',this)+'":"'+encodeURIComponent(obj.volume)+'"';//No I18N
			}
			obj.suffixText = "";//No I18N
			if(wname == "widget.name.ipamTopTenSubnetsOccupied" || wname == "widget.name.ipamTopTenGroupsOccupied" || wname == "widget.name.spmTopTenSwitchesOccupied" || wname == "widget.name.spmTopTenSwitchesWithFree" || wname == "widget.name.spmTopTenGroupsOccupied" || wname=="widget.name.spmTopTenGroupsWithFree" || wname == "widget.name.firewallstandardnerccip" || wname == "widget.name.firewallstandardsans" || wname == "widget.name.firewallstandardpcidss" || wname == "widget.name.firewallstandardnist" || wname=="widget.name.firewallstandardiso"){
				obj.suffixText="%25";//No 18N
			}
			obj.tooltipData = '{"'+Ember.I18n.t('opu.views.NAME',this)+'":"'+encodeURIComponent(obj.text)+'","'+Ember.I18n.t('webclient.devices.intftypes.value',this)+'":"'+obj.value+""+obj.suffixText+'"'+obj.volumeTxt+'}';//No I18N
		}
		if(obj.min !== undefined && obj.max !== undefined){
			self.set('dataParams.isMinMax',true);//No I18N
		}
		if(obj.volume !== undefined){
			self.set('dataParams.isVolume',true);//No I18N
		}
		if(obj.name != undefined){
			obj.onClickFunc="opm_topnLinkClickEvent(\""+wname+"\",\""+escapeHtmlTags(obj.name)+"\","+JSON.stringify(obj)+","+widgetParams.id+","+JSON.stringify(wObj)+");";//No I18N
		}
		if(obj.customValue != undefined)
		{
			obj.displayValue=obj.customValue ;
			obj.displayValueStyle='';//No I18N
		}
		else
		{
			obj.displayValue=obj.value;
			obj.displayValueStyle='';
		}

		dataParams.pushObject(obj);
	});
	self.set('dataParams.data',dataParams);//No I18N
}
function loadDeviceTreeGrid(gridID,gridData,gridPager)
{
	var colNamesList = ['','','','','','','','']; //No I18N
	var colModelList = [{ name: 'rImg', index: 'rImg',width:10, formatter: nfa_deviceImgFormatter}, //No I18N
	    { name: 'Name', index: 'Name', width: 25,formatter:nfa_deviceSnapshot }, //No I18N
		{ name: 'IntfCount', index: 'IntfCount',width:10,formatter:nfa_intfCount },//No I18N	
		{ name: 'PktCount', index: 'PktCount',width:10,formatter:nfa_intfCount },//No I18N	
		{ name: 'wlcStatus', index: 'wlcStatus',classes:"hideJqGridCell", hidden:true},//No I18N
		{ name: 'rType', index: 'rType', classes:"hideJqGridCell", hidden: true}, //NO I18N
		{ name: 'ID', index: 'ID' , classes:"hideJqGridCell", hidden:true},//No I18N
		{ name: 'IP', index: 'IP',width: 25,formatter:nfa_intfCount }//No I18N
	];
	$("#"+gridID).jqGrid("GridUnload");
	// var defaultOptions = {"multiselect":false,"minRowsPerPage":10,"rowNumNeeded":false,"searchOption":false,"toggleSearch":false};//No I18N
	var defaultOptions = {"minRowsPerPage":10,"searchOption":false,"Search":false,"hideCSV":true,"hideExcel":true}; //NO I18N

	defaultOptions.gridCallBack = function(gridTableIdAlone){	
		gridWidthAlignment(gridTableIdAlone);
	};
	opm_loadJQgridWithData("#"+gridID,gridData,colNamesList,colModelList,"","#"+gridPager,"",defaultOptions); //No I18N
	$("#"+gridPager+"_right").css({width:"150px"});; //NO I18N
	$("#"+gridPager+"_left").css({width:"0px"});; //NO I18N
	$("#"+gridPager+"_center").css({width:"auto"});; //NO I18N
}

function dragAndResizeEvents()
{
	// $('.grid-stack').off('resizestart');
	// $('.grid-stack').off('dragstop');
	// $('.grid-stack').off('resizestop');
	if(!$(".grid-stack")[0]) {
		return;
	}
	var grid = $(".grid-stack")[0].gridstack;
	var draggedElement=null;
	var prevElePos=null;
	grid.on('dragstart', function(event, items) {
		var node = items.gridstackNode;
		prevElePos = {x:node.x,y:node.y};
		$(node.el).css('z-index', 999999); //to move over and above other widgets.
	});
	grid.on('resizestart', function(event, items) {
		var node = items.gridstackNode;
		draggedElement={w:node.w,h:node.h};
	});
	grid.on('dragstop', function(event, items) {
		var node = items.gridstackNode;
		if(node!==undefined){
			if(node.x!==prevElePos.x || node.y!==prevElePos.y){
				$('.dashboardWidgetButtonHdr').show();
				$("body").addClass("dashboardWidgetReArrangeSaveBtn");//NO I18N
				isChangeLayout=true;
			}
		}
		prevElePos=null;
		$(node.el).css('z-index', ""); //to reset after drag
	});
	grid.on('resizestop', function(event, items) {
		var node = items.gridstackNode;
		if(node!==undefined && draggedElement!==undefined && draggedElement!==null){
			//new_height = Math.ceil((items.size.height + grid.opts.verticalMargin) / grid.opts.cellHeight);
			//grid.update("#"+items.element[0].id, node.x, node.y, node.w, new_height);
			var gridParams = {x:node.x,y:node.y,h:node.h,w:node.w};
			grid.update("#"+node.el.id,gridParams);

			if(node.w !== draggedElement.w || node.h !== draggedElement.h){
				$('.dashboardWidgetButtonHdr').show();
				$("body").addClass("dashboardWidgetReArrangeSaveBtn");
				isChangeLayout=true;
				var widgetId=parseInt(node.el.id.replace("li_",''));//No I18N
				if(OpmDashwidgetComponentArray[widgetId]!==undefined){
					var widgetInstance = OpmDashwidgetComponentArray[widgetId].widgetParams;
					var wType = OpmDashwidgetComponentArray[widgetId].widgetParams.type;
					if (
						OpmDashwidgetComponentArray[widgetId] &&
						OpmDashwidgetComponentArray[widgetId].widgetParams &&
						(
							wType === "Live" || wType === "Rack" ||
							(OpmDashwidgetComponentArray[widgetId].widgetParams.apiData &&
							 OpmDashwidgetComponentArray[widgetId].widgetParams.apiData.WidgetType === "KpiGraph")
						)
					) {
						OpmDashwidgetComponentArray[widgetId].widgetParams.width = node.w;
						reloadDashWidget(widgetId);
					}else{
						OpmDashwidgetComponentArray[widgetId].rerender();
						dashcallbackNew(widgetId,widgetInstance);
					}
					
				}
			}
		}
		draggedElement=null;
	});
}
function setWidgetSubTitleValues(data,widgetParams)
{
	widgetParams.subLink = false;
	if(data.type !== undefined)
	{
		widgetParams.subLink = true;
		if(data.type === 'Device')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringDevice/"+data.source;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === 'Interface')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringInterface/"+data.source;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === 'URL')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Inventory/Snapshot/MonitoringURL/"+data.source;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === 'BV')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Maps/BusinessView/"+data.mapName;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === 'Layer2')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Maps/Layer2MapDevices/"+data.mapId;//No I18N
			widgetParams.subTitle = data.mapName;
		}
		else if(data.type === 'Floor')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Maps/ThreeDMaps/"+data.floorId;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === 'Rack')
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Maps/ThreeDRacks/View/"+data.rackId;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === "LOGICALGROUP" && data.groupType === "interface")
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Inventory/Snapshot/LogicalIntfGroup/"+data.groupName;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === "LOGICALGROUP" && data.groupType === "device")
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Inventory/Snapshot/LogicalDeviceGroup/"+data.groupName;//No I18N
			widgetParams.subTitle = data.displayName;
		}
		else if(data.type === "NetworkPath")
		{
			widgetParams.hrefValue = window.OPM.apiclientUrl+"Settings/Monitors/NetworkPathAnalysis/Profile/"+data.moID;//No I18N
			var collectedTime = "";
			if(data.collectedTime !== undefined)
			{
				var currentZone = (window.OPM.severTimeZone !== undefined ? window.OPM.severTimeZone : moment.tz.guess());
				var tz_time = moment.tz(data.collectedTime,currentZone);
				collectedTime = tz_time.format(mtz_pattern);
				widgetParams.tooltip = Ember.I18n.t('webclient.reports.healthreport.lastcoltime',this)+" : "+collectedTime;//No I18N
			}
			widgetParams.subTitle = data.displayName+" - "+collectedTime+"";//No I18N
		
		}
		else if(data.displayName !== undefined)
		{
			widgetParams.subLink = false;
			widgetParams.subTitle = data.displayName;
		}else{
			widgetParams.subLink = false;
		}
		
	}
	else if(data.displayName !== undefined)
	{
		widgetParams.subTitle = data.displayName;
	}
	else if(data.graphName !== undefined && data.graphUnit !== undefined && data.virtualType === undefined)
	{
		widgetParams.subTitle = data.graphName+" ("+data.graphUnit+")";
	}
}
function gridWidthAlignment(gridTableIdAlone)
{
	var contentWd = $("#widget"+gridTableIdAlone).width();
    $("#"+gridTableIdAlone).jqGrid("setGridWidth",contentWd-2);//No I18N
    if(contentWd <= $("#"+gridTableIdAlone).width()){
        $("#"+gridTableIdAlone).css({"width":contentWd-2});//No I18N
    }
}
function loadAgeMatrixFirmVul(jsonDataOne) {
    var loadValues = [];
    OPMClient.NCMFirmwareVulnerability.data = jsonDataOne;
    var jsonData = jsonDataOne.get('0');

    loadValues.push(jsonData.low['90']);
    loadValues.push(jsonData.low['6090']);
    loadValues.push(jsonData.low['3060']);
    loadValues.push(jsonData.low['30']);

    loadValues.push(jsonData.moderate['90']);
    loadValues.push(jsonData.moderate['6090']);
    loadValues.push(jsonData.moderate['3060']);
    loadValues.push(jsonData.moderate['30']);

    loadValues.push(jsonData.important['90']);
    loadValues.push(jsonData.important['6090']);
    loadValues.push(jsonData.important['3060']);
    loadValues.push(jsonData.important['30']);

    loadValues.push(jsonData.critical['90']);
    loadValues.push(jsonData.critical['6090']);
    loadValues.push(jsonData.critical['3060']);
    loadValues.push(jsonData.critical['30']);

    // OPMClient.NCMFirmwareVulnerability.data = loadValues;

    // zoho chart heat map setting colors will depends only on ranges, to differentiate colors based on two values {range,severity} ranges are appended with constant values
    var rangeCriZeroto30 = [0,30];
    var rangeCri30to60 = [30,60];
    var rangeCri60to90 = [60,90];
    var rangeCrimorThan90 = [90,20000]; // it will check till 20000 as count wont exceed 20000

    // appending 20000 for severity 'important' for differentiation
    var rangeImpZeroto30 = [20000,20030];
    var rangeImp30to60 = [20030,20060];
    var rangeImp60to90 = [20060,20090];
    var rangeImpmorThan90 = [20090,40000]; // it will check till 40000

    // appending 40000 for severity 'moderate' for differentiation
    var rangeModZeroto30 = [40000,40030];
    var rangeMod30to60 = [40030,40060];
    var rangeMod60to90 = [40060,40090];
    var rangeModmorThan90 = [40090,60000]; // it will check till 60000

    // appending 60000 for severity 'low' for differentiation
    var rangeLowZeroto30 = [60000,60030];
    var rangeLow30to60 = [60030,60060];
    var rangeLow60to90 = [60060,60090];
    var rangeLowmorThan90 = [60090,80000]; // it will check till 80000


    var data = {
        "width":'75%',//No I18N
        "majortooltip": {//No I18N
            "fontColor": "#FFFFFF",//No I18N
            "backgroundColor": "#000000",//No I18N
            "opacity": 0.8,//No I18N
            "borderRadius": 5//No I18N
        },
        "canvas":{},//No I18N
        "type": "heatmap",//No I18N
        // added new key 'charType' for handling key 'axes' which is duplicated {two 'axes' keys are found}
        "charType" : "heatMapChart",//No I18N
        "jsonData":loadValues,//No I18N
        "metadata":{//No I18N
            "axes": {//No I18N
                "x": [//No I18N
                    0
                ],
                "y": [//No I18N
                    [
                        1
                    ]
                ],
                "clr": [//No I18N
                    3
                ],
                "tooltip":[//No I18N
                    0,
                    1,
                    2
                ]
            }
        },

        "columns": [//No I18N
            {
                "dataindex": 0,//No I18N
                "columnname": Ember.I18n.t('webclient.ncm.firmvuln.age',this),//No I18N
                "datatype": "ordinal"//No I18N
            },
            {
                "dataindex": 1,//No I18N
                "columnname": Ember.I18n.t('webclient.admin.traps.severity',this),//No I18N
                "datatype": "ordinal"//No I18N
            },
            {
                "dataindex": 2,//No I18N
                "columnname": Ember.I18n.t('webclient.ncm.firmvuln.count',this),//No I18N
                "datatype": "numeric"//No I18N
            },
            {
                "dataindex": 3,//No I18N
                "columnname": Ember.I18n.t('webclient.ncm.firmvuln.count',this),//No I18N
                "datatype": "numeric"//No I18N
            }
        ],
        "legend": {//No I18N
            "colors": [//No I18N
                "#F8D5D5",//No I18N
                "#F0ABAB",//No I18N
                "#E88181",//No I18N
                "#D92E2E",//No I18N

                "#FBE7DD",//No I18N
                "#F6D0BB",//No I18N
                "#F2B899",//No I18N
                "#E98956",//No I18N

                "#FEF1E0",//No I18N
                "#FDE2C1",//No I18N
                "#FCD4A2",//No I18N
                "#FBB765",//No I18N

                "#FBF9E0",//No I18N
                "#F6F2C1",//No I18N
                "#F2EBA2",//No I18N
                "#E9DE65"//No I18N
            ],
            "colorBand": {//No I18N
                "type": "continuousDiscrete",//No I18N
                "ranges": [//No I18N
                    rangeCriZeroto30,
                    rangeCri30to60,
                    rangeCri60to90,
                    rangeCrimorThan90,

                    rangeImpZeroto30,
                    rangeImp30to60,
                    rangeImp60to90,
                    rangeImpmorThan90,

                    rangeModZeroto30,
                    rangeMod30to60,
                    rangeMod60to90,
                    rangeModmorThan90,

                    rangeLowZeroto30,
                    rangeLow30to60,
                    rangeLow60to90,
                    rangeLowmorThan90
                ]
            },
            "colorBox": {//No I18N
                "borderRadius": 5//No I18N
            },
            "hAlign": "center",//No I18N
            "vAlign": "bottom",//No I18N
            "marginTop": 0//No I18N
        },
        "axes": {//No I18N
            "xaxis": {//No I18N
                "orient": "top",//No I18N
                "label": {//No I18N
                    "show": false//No I18N
                },
                "axisline": {//No I18N
                    "color": "transparent"//No I18N
                },
                "tickmark": {//No I18N
                    "color": "transparent"//No I18N
                },
                "ticklabel": {//No I18N
                    "fontFamily" : "latoRegular",//No I18N
                    "fontSize": 13,//No I18N
                    "marginLeft": 0,//No I18N
                    "marginRight": 0//No I18N
                }
            },
            "yaxis": [//No I18N
                {
                    "label": {//No I18N
                        "show": false//No I18N
                    },
                    "grid": {//No I18N
                        "color": "transparent"//No I18N
                    },
                    "axisline": {//No I18N
                        "color": "transparent"//No I18N
                    },
                    "tickmark": {//No I18N
                        "color": "transparent"//No I18N
                    },
                    "ticklabel": {//No I18N
                        "fontFamily" : "latoRegular",//No I18N
                        "fontSize": 13//No I18N
                    }
                }
            ]
        },
        "plotoptions": {//No I18N
            "heatmap": {//No I18N
                "borderRadius": 10,//No I18N
                "datalabels": {//No I18N
                    "show": true,//No I18N
                    "showAs": "{{val(2)}}",//No I18N
                    "fontWeight": "600",//No I18N
                    "boundBox": {//No I18N
                        "show": true,//No I18N
                        "fillColor": null,//No I18N
                        "strokeColor": null//No I18N
                    }
                }
            }
        },
        "canvas": {//No I18N
            "title": {//No I18N
                "text": ""//No I18N
            }
        }
    };
    data.id = 'ageMatrixContainer';//No I18N
    var mappingobj={};
    var arraObj = {
        chartobj : [],
        placeholder : []
    };
    arraObj.chartobj.push(data);
    arraObj.placeholder.push('ageMatrixContainer');//No I18N
    ncmZChart(arraObj);
}

function constructTreeMapObj(jsonData) {
	return {
		type: 'treemap', //No I18n
		jsonData: [{"seriesname": Ember.I18n.t("webclient.anomaly.yaxis.widget"), data: jsonData.WidgetData}], //No I18n
		height: 300,
		columns: [
			{
				"dataindex": 0,//No I18N
				"datatype": "ordinal"//No I18N
			}, 
			{
				"dataindex": 1,//No I18N
				"datatype": "ordinal"//No I18N
			}, 
			{
				"dataindex": 2,//No I18N
				"datatype": "ordinal"//No I18N
			},
			{
				"dataindex": 3,//No I18N
				"datatype": "numeric"//No I18N
			}
		],
		series: "multi",//No I18N
		axes: {
			"x": [[2]],//No I18N
			"y": [[3]],//No I18N
      		"tooltip": ["<div class='center pl-xs pr-xs '><span class='fs16'>{{val(2)}}: {{val(3)}} " + Ember.I18n.t("nfa.anomalies.title") + "</span></div>"]

		},
		legend: {
			enabled: false,
			colors: ["#cfe2ff"]//No I18N
		},
		noChartAxes: true
	}
}

constructHeatDevDetails = function(self){
	var params = {};
	params.id = 'inventoryVBarChart_widget_'+widgetParams.id;//No I18N
	params.details = jsonData.WidgetData.Details;
	params.widgetname = jsonData.Name;
	if(((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices") && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatMapType==="availability")){
		this.set('isAvailabilityData', true); //No I18N
		params.isOPMAvailabilityData = true;
		mapParams.isOPMAvailabilityData = true;
	}
	params.showLabelCount=true;
	self.set('polarChartDetails',params);//No I18N
	if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices") && jsonData.WidgetData.List!==undefined && jsonData.WidgetData.List.length>1000)//No I18N
	{
			self.set('showDeviceCount',jsonData.WidgetData.List.length);//No I18N
	}
	if(jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.type==="Groups"){
		mapParams.groupByGroups = true;
		self.set('isGroupHeatMap',true);//No I18N
	}
	if(jsonData.WidgetAdditionalData !== undefined && jsonData.WidgetAdditionalData.heatMapType === "GroupMembers"){ //No I18N
		mapParams.groupByMembers = true;
	}
	var renderZChart = true;
	if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices") && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatMapGraphType==="radial"){
		renderZChart = false;
	}
	if((jsonData.Name==="widget.name.heatmap" || jsonData.Name === "widget.name.logicalGroupDevices" || jsonData.Name==="widget.name.wanip.wanipHeatMap" || jsonData.Name==="widget.name.wanip.siteHeatMap") && renderZChart)
	{
		var totalData = [];
		var graphColor = [];
		var totalCount = 0;
		for(var i=0;i<jsonData.WidgetData.Details.length;i++)
		{
			var data = [];
			data.push((jsonData.WidgetData.Details[i].Label==="Unknown")?Ember.I18n.t("UnManaged",this):jsonData.WidgetData.Details[i].Label);//No I18N
			data.push(jsonData.WidgetData.Details[i].Count);
			data.push(jsonData.WidgetData.Details[i].Status);
			totalData.push(data);
			totalCount += jsonData.WidgetData.Details[i].Count;
			graphColor.push(params.isOPMAvailabilityData?availabiltyStatusColors[jsonData.WidgetData.Details[i].Status-1]:statusColors[jsonData.WidgetData.Details[i].Status-1]);
		}

		var graphParams = {};
		graphParams.id = "gwidget"+widgetParams.id;
		graphParams.graphType = "pie";//No I18N
		graphParams.graphData = totalData;
		graphParams.color = graphColor;
		graphParams.tooltip = ["{{val(0)}} ({{val(1)}})"];//No I18N
		graphParams.pieType = "simpleDonut";//No I18N
		graphParams.height=(totalData.length>6)?290:270;
		graphParams.margin=0;
		graphParams.legendShowAs="<label>{{val(0)}}</label> <span>{{val(1)}}</span>";//No I18N
		graphParams.notes= {
			"enabled": true,//No I18N
			"chartValues": [//No I18N
				{
					"x": "customAnnotationX2",//No I18N
					"y": "customAnnotationY2",//No I18N
					"type": "customNote",//No I18N
					"htmlEl": "customAnnotationHTML2",//No I18N
					"description": "",//No I18N
					"id": "heatmapNotes_"+widgetParams.id//No I18N
				}
			]
		};
		graphParams.legendEvents={
			"click": function(e, d, i, chartObj) {//No I18N
				if(chartObj.cache.filter===undefined){
					chartObj.cache.filter = [];
					chartObj.cache.filter.push(i);
				}else{
					if(chartObj.cache.filter.contains(i)){
						chartObj.cache.filter.removeObject(i);
					}else{
						chartObj.cache.filter.push(i);	
					}
				}

				if(chartObj.cache.filter.length===totalData.length){
					chartObj.cache.filter = [];
				}

				var url = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData'; //No I18N
				var params  = {};
				params.widgetID = widgetParams.id;
				if(chartObj.cache.filter.length>0)
				{
					var severityArr = [];
					var severityCount = 0;
					for(var i=0;i<chartObj.cache.filter.length;i++)
					{
						severityArr.push(totalData[chartObj.cache.filter[i]][2]);
						severityCount += totalData[chartObj.cache.filter[i]][1];
					}
					params.severity = severityArr.toString();
					$("#heatMapTotal_"+widgetParams.id).hide();//No I18N
					$("#heatMapReset_"+widgetParams.id).show();//No I18N
					$("#heatMapDeviceCount_"+widgetParams.id).text(severityCount);//No I18N
				}else{
					$("#heatMapTotal_"+widgetParams.id).show();//No I18N
					$("#heatMapReset_"+widgetParams.id).hide();//No I18N
					$("#heatMapDeviceCount_"+widgetParams.id).text(totalCount);//No I18N
				}
				callbackGetWidgetData = function(jsonData) {      
					var options = {};
					if(mapParams.isOPMAvailabilityData){
						options.isOPMAvailabilityData = true;
					}         
					if(mapParams.groupByGroups){
						options.groupByGroups = true;
					}      
					if(mapParams.heatmapGraphLabel!==undefined) {
						options.heatmapGraphLabel = mapParams.heatmapGraphLabel;
					}
					opm_loadHeatMap('heatmap_'+widgetParams.id,jsonData[widgetParams.id].WidgetData.List,jsonData[widgetParams.id].Name,undefined,options);//No I18N
					filterSeverity(graphParams.id, chartObj.cache.filter);
				}
				opm_getJSONcallback(url,callbackGetWidgetData,'',params); 
			}
		};
		graphParams.events={
			"events" : {//NO I18N
				"click" : function(event, data, chartObj){//No I18N
					if(data!==undefined && data.point!==undefined){
						var url = window.OPM.apiUrlPattern + '/v2/dashboard/getWidgetData'; //No I18N
						var params  = {};
						params.widgetID = widgetParams.id;

						if(chartObj.cache.filter===undefined){
							chartObj.cache.filter = [];
							chartObj.cache.filter.push(data.itemIndex);
						}else{
							if(chartObj.cache.filter.contains(data.itemIndex)){
								chartObj.cache.filter.removeObject(data.itemIndex);
							}else{
								chartObj.cache.filter.push(data.itemIndex);	
							}
						}

						if(chartObj.cache.filter.length===totalData.length){
							chartObj.cache.filter = [];
						}

						if(chartObj.cache.filter.length>0)
						{
							var severityArr = [];
							var severityCount = 0;
							for(var i=0;i<chartObj.cache.filter.length;i++)
							{
								severityArr.push(totalData[chartObj.cache.filter[i]][2]);
								severityCount += totalData[chartObj.cache.filter[i]][1];
							}
							params.severity = severityArr.toString();
							$("#heatMapTotal_"+widgetParams.id).hide();//No I18N
							$("#heatMapReset_"+widgetParams.id).show();//No I18N
							$("#heatMapDeviceCount_"+widgetParams.id).text(severityCount);//No I18N
						}else{
							$("#heatMapTotal_"+widgetParams.id).show();//No I18N
							$("#heatMapReset_"+widgetParams.id).hide();//No I18N
							$("#heatMapDeviceCount_"+widgetParams.id).text(totalCount);//No I18N
						}
						
						callbackGetWidgetData = function(jsonData) {         
							var options = {};
							if(mapParams.isOPMAvailabilityData){
								options.isOPMAvailabilityData = true;
							}       
							if(mapParams.groupByGroups){
								options.groupByGroups = true;
							}       
							if(mapParams.heatmapGraphLabel!==undefined) {
								options.heatmapGraphLabel = mapParams.heatmapGraphLabel;
							}

//set(self.heatMapDetails,'data',jsonData[widgetParams.id].WidgetData.List);

						//	self.heatMapDetails = (heatMapDetails.data,data:jsonData[widgetParams.id].WidgetData.List);
							
						
							//	self.heatMapDetails = {'id':widgetParams.id,'heatMapWidID':'deviceInfoToolTip_'+widgetParams.id,'isHieraricalGrp':false,'name':jsonData[widgetParams.id].Name,'data':jsonData[widgetParams.id].WidgetData.List};
							//var allDevData = self.heatMapDetails.data;
								//allDevData.replace(0,allDevData.length,jsonData[widgetParams.id].WidgetData.List);
							//self.set('heatMapDetails.data',allDevData);
							var heatMapDetails = self.get('heatMapDetails');
							heatMapDetails.data = jsonData[widgetParams.id].WidgetData.List;
							self.set('heatMapDetails', heatMapDetails);//NO I18N
							self.notifyPropertyChange('heatMapDetails');//NO I18N
						//	self.rerender();				//self.set('heatMapDetails',{self.heatMapDetails,data:jsonData[widgetParams.id].WidgetData.List});
								//opm_loadHeatMap('heatmap_'+widgetParams.id,jsonData[widgetParams.id].WidgetData.List,jsonData[widgetParams.id].Name,undefined,options);//No I18N
							opm_loadHeatChart('heatmap_'+widgetParams.id,jsonData[widgetParams.id].WidgetData.List,jsonData[widgetParams.id].Name,undefined,options);//No I18N
								filterSeverity(graphParams.id, chartObj.cache.filter);
						}
						opm_getJSONcallback(url,callbackGetWidgetData,'',params); 
					}
				}
			}
		};
		if(jsonData.Name==="widget.name.heatmap" && jsonData.WidgetAdditionalData!==undefined && jsonData.WidgetAdditionalData.heatMapGraphType==="none"){ //No I18N
			this.set("showGraph", false); //No I18N
		}
		this.set("showZDial",true);//No I18N
		this.set('graphParams',graphParams);//No I18N
		$("#widget"+widgetParams.id).addClass('heatmapZChart');//No I18N
		if(totalData.length===1)
		{
			$("#widget"+widgetParams.id).addClass('singleData');//No I18N
		}
	}
}

function drawDialChart(chartData){
	var arrObj={"placeholder":[],"chartobj":[]};//No I18N
	var val = opm_escapeHTML(chartData.data.value);
	var attributeName = opm_escapeHTML(chartData.data.displayname);
	var unit = opm_escapeHTML(chartData.data.unit);
	var maxRange = 100;
	if(val > 100 ){
		var power = Math.pow(10, Math.floor(Math.log10(val)));
		maxRange =  Math.ceil(val / power) * power ;
	}
	var dialChartConfig = {
		id: chartData.id,
		type: 'dial', //No I18N
		height: 250,
		jsonData: [
                ['i10', val, val]//No I18N
		],
		plot: {
            plotoptions: {
                dial: {
                    fillOpacity: 0,
                    targetMarker: {
                        enabled: true,
                        dataindex: 2,
                        outerStrokeWidth: 3,
                        lineCap: 'round',//No I18N
                        outerStrokeColor: '#808080',//No I18N
                        label: {
                            padding: 8
                        }
                    },
					outerPadding: -0.60,
                    levelMarker: {
                        color: ['#76D284'],//No I18N
						cornerRadius : 'DialEdgeRadius' //No I18N
                    },
                    strokeWidth: 0,
                    startAngle: -1.5707963267948966,
                    endAngle: 1.5707963267948966,
                    innerRadius: '88%',//No I18N
		    		outerRadius: '100%',//No I18N
                    maxRadius: 390,
                    minmaxlabels: {
                        show: false
                    },
                    datalabels: {
                        padding: 10,
						showAs: attributeName+' - {{val(1)}}'+unit,//No I18N
						fontSize: 14
                    },
                    needle: {
                        type: 'round',//No I18N
                        width: 15,
                        padding: 15,
                        strokeColor: "#808080",//No I18N
                        strokeWidth: 0
                    }
                }
            }
        },
        axes: {
            yaxis: [
                {
                    show: true,
                    orient: 'inner',//No I18N
                    tickOrient: 'inner',//No I18N
                    maxRange: maxRange,
                    minRange: 0,
		    tickmark: {
		    color: "#acacac",//No I18N
		    size: 8
		    },
                    axisline: {
                        show: false
                    },
                    grid: {
                        color: 'transparent'//No I18N
                    }
                }
            ]
        },
		marginLeft: '40',
		marginRight: '20',
    metadata: {
        axes: {
            x: [0],
            y: [
                [1]
            ],
            tooltip: [0, 1]
        },
        columns: [
            {
                dataindex: 0,
                columnname: 'Year(Date)',//No I18N
                datatype: 'ordinal'//No I18N
            },
            {
                dataindex: 1,
                columnname: 'Sum(Sales)',//No I18N
                datatype: 'numeric'//No I18N
            }
        ]
	}
	};


	arrObj.chartobj.push(dialChartConfig);
	arrObj.placeholder.push(chartData.id);
	zChart(arrObj);
}

function opm_getDashboardExportScheduleList()
{
	var jsonData = opm_ajaxGetResponse(window.OPM.apiUrlPattern + '/dashboard/listDashboardExportSchedules' + (window.__showAllDashboardSchedules ? '?showAll=' + window.__showAllDashboardSchedules : ''));//No I18N
	var scheduleList = (jsonData && Array.isArray(jsonData.Schedules)) ? jsonData.Schedules : [];
	window.__dashboardScheduleListCache = scheduleList; 

	var colNames = ['',Ember.I18n.t('webclient.admin.schedulereports.schname'), Ember.I18n.t('webclient.dashboard.scheduleDashboard.lastScheduleStatus'), Ember.I18n.t('nfa.settings.nextSchedule'), Ember.I18n.t('webclient.opm.kemplb.child.status'), '' ,'' ,Ember.I18n.t('widget.mytickets.CreatedBy'), Ember.I18n.t('webclient.action.actions'), '']; //No I18N
	var colModel = [
		{ name: 'scheduleId', index: 'scheduleId', hidden:true}, //No I18N
		{ name: 'scheduleName', index: 'scheduleName', width: 180, formatter: opm_dashboardScheduleNameFormatter }, //No I18N
		{ name: 'lastRunStatus', index: 'lastRunStatus', width: 100, formatter: opm_dashboardScheduleLastRunFormatter },  //No I18N
		{ name: 'nextExecutionTime', index: 'nextExecutionTime', width: 100}, //No I18N
		{ name: 'enabled', index: 'enabled', width: 100, search: true,stype:"select",searchoptions: {value: alarmProfileStateSearch,defaultValue:""}, formatter: opm_dashboardScheduleStatusFormatter },//No I18N
		{ name: 'createdBy', index: 'createdBy', hidden : true, sortable: false},//No I18N
		{ name: 'lastRunStatusCode' , index: 'lastRunStatusCode', hidden : true, sortable: false},//No I18N
		{ name: 'createdUserName', index: 'createdUserName', width: 100 , hidden : !window.__showAllDashboardSchedules},//No I18N
		{ name: 'action', index: 'action', width: 80, sortable: false, search:false, formatter: opm_dashboardScheduleActionsFormatter },//No I18N
		{ name: 'id', index: 'id',sortable:false,hidden:true} //No I18N
	];
	$("#dashboardScheduleList").jqGrid('GridUnload');//No I18N
	var defaultOptions = {"multiselect": true, "sortName": "scheduleName", "sortOrder": "asc", searchOption: true, minRowsPerPage: 50, jsonReader: {id: 'scheduleId'}}; //No I18N
	opm_loadJQgridWithData("#dashboardScheduleList", scheduleList, colNames, colModel, "", "#dashboardSchedulePager", "dashboardScheduleList", defaultOptions); //No I18N
	$('#dashboardScheduleList').jqGrid('sortGrid', defaultOptions.sortName, true, defaultOptions.sortOrder); //No I18N

	$('#dashboardScheduleList').jqGrid('setGridParam', { //No I18N
		onSelectRow: function() {
			opm_updateDashboardScheduleBulkButtons();
		},
		onSelectAll: function() {
			opm_updateDashboardScheduleBulkButtons();
		}
	});
	$('.ui-jqgrid-hdiv select').select2();
	opm_updateDashboardScheduleBulkButtons(); /* selection is cleared on reload - reset toolbar button state */
}

function opm_dashboardScheduleNameFormatter(cellValue, options, rowObject)
{
	var container = document.createElement('div'); //No I18N
	container.className = 'truncate'; //No I18N
	container.textContent = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
	return container.outerHTML;
}

function opm_dashboardScheduleLastRunFormatter(cellValue, options, rowObject)
{
	var status = cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
	var colorClass = (rowObject.lastRunStatusCode === 1) ? 'textGreen' : rowObject.lastRunStatusCode === -1 ? 'textOrange' : 'textRed'; //No I18N
	var span = document.createElement('span'); //No I18N
	span.className = colorClass;
	span.textContent = status;
	return span.outerHTML;
}

function opm_dashboardScheduleStatusFormatter(cellValue, options, rowObject)
{
	var scheduleId = rowObject && rowObject.scheduleId !== undefined && rowObject.scheduleId !== null ? String(rowObject.scheduleId) : '';
	var isChecked = (cellValue === true || cellValue === 'true');
	if(isChecked) {
		return "<div class='chkRoundBtn'><input type='checkbox' tabindex='0' role='checkbox' class='dashboardScheduleStatusToggle' data-schedule-id='"+scheduleId+"' checked name=''><label></label></div>"; //No I18N
	}else{
		return "<div class='chkRoundBtn'><input type='checkbox' tabindex='0' role='checkbox' class='dashboardScheduleStatusToggle' data-schedule-id='"+scheduleId+"' name=''><label></label></div>"; //No I18N
	}
}

function opm_dashboardScheduleActionsFormatter(cellValue, options, rowObject)
{
	var html = "<div class='dashboardScheduleActions'>";
	var disabledClass = window.__showAllDashboardSchedules && rowObject.createdBy != window.OPM.userId ? "disabledBlock" : "" ; //No I18N
	html +=  "<span title='" + (disabledClass ? Ember.I18n.t('webclient.dashboard.editScheduleDashboard.editDisabledMsg') : Ember.I18n.t('webclient.title.edit')) + "'><em class='svgIcon size16 pointer dashboardScheduleEdit " + disabledClass + " 'tabindex='0' role='button' data-schedule-id='" + rowObject.scheduleId + "'><svg><use xlink:href='../../apiclient/fluidicv2/img/sprite-opm.svg#edit'></use></svg></em></span>" ; //No I18N
	html += "<span title='" + Ember.I18n.t('webclient.devices.customfields.delete') + "'><em class='svgIcon size16 pointer dashboardScheduleDelete' tabindex='0' role='button' data-schedule-id='" + rowObject.scheduleId + "'><svg><use xlink:href='../../apiclient/fluidicv2/img/sprite-opm.svg#delete'></use></svg></em></span>"; //No I18N
	html += "</div>";
	return html;
}

function opm_enableDisableDashboardExportSchedule(selectedRows, enable, callback, cancelCallback)
{
	var message = enable ? Ember.I18n.t("webclient.dashboard.editScheduleDashboard.manageErrorMsg") : Ember.I18n.t("webclient.dashboard.editScheduleDashboard.disableErrorMsg"); // No I18N
	opmConfirm('', message, '', function() {
		var postUrl = window.OPM.apiUrlPattern + '/dashboard/enableDisableDashboardExportSchedule'; //No I18N
		var postData = { scheduleId: JSON.stringify(selectedRows), enable: enable };
		opm_ajaxPostRequestWithMsg(postUrl, postData, '', function(response) {
			showMessage(response);
			if(response && response.error === undefined) {
				// opm_getDashboardExportScheduleList();
				if(typeof callback === 'function') {
					callback();
				}
			} else if(typeof cancelCallback === 'function') {  //No I18N
				cancelCallback();
			}
		});
	}, '', function() {
		if(typeof cancelCallback === 'function') {
			cancelCallback();
		}
	}, '', '', 'dialogStyle2');
}

function opm_deleteDashboardExportSchedule(selectedRows) {
	var message = Ember.I18n.t("webclient.dashboard.editScheduleDashboard.deleteErrorMsg"); // No I18N
	opmConfirm('', message, '', function() {
		var postUrl = window.OPM.apiUrlPattern + '/dashboard/deleteDashboardExportSchedule'; // No I18N
		opm_ajaxPostRequestWithMsg(postUrl, {scheduleId: JSON.stringify(selectedRows)}, '', function(response) {
			showMessage(response);
			if(response && response.error === undefined) {
				opm_getDashboardExportScheduleList();
			}
		});
	}, '', '','', '', 'dialogStyle2');
}

function opm_updateDashboardScheduleBulkButtons() {
	var selectedRows = $('#dashboardScheduleList').jqGrid('getGridParam', 'selarrrow');
	var disable = selectedRows == null || selectedRows.length === 0;
	['dashScheduleEnableBtn', 'dashScheduleDisableBtn', 'dashScheduleDeleteBtn'].forEach(function(buttonId) { //No I18N
		var actionButton = $("#"+buttonId);
		actionButton.toggleClass('disabledBlock', disable);//No I18N
	});
}

function opm_getSelectedDashboardScheduleIds() {
	var scheduleGrid = $(document.getElementById('dashboardScheduleList')); // jqGrid requires jQuery. //No I18N
	var selectedRows = scheduleGrid.jqGrid('getGridParam', 'selarrrow') || []; //No I18N
	return selectedRows.map(function(rowId) {
		return scheduleGrid.jqGrid('getCell', rowId, 'scheduleId'); //No I18N
	});
}
