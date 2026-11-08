function nfa_loadArtWidgetDrillDownGraph(divElement,jsonData,timeFrame) {
	var chartObj = {
		id : divElement,
		type : 'area', //No I18N
		jsonData : jsonData.graphData,
		series : "multi", //No I18N
		height : 350,
		columns:{
			datatype_1:'time', //No I18N
			datatype_2:'numeric', //No I18N
			columnname_1: Ember.I18n.t('NFAWidget.Time'), //No I18N
			columnname_2: Ember.I18n.t('NFAWidget.trfc'), //No I18N
			timeFormat: OPMClient.InventoryDateTimeLegends.get(timeFrame)
		},
		tooltip:[0,1],
		canvas : {
			title : {
				text :jsonData.granularity,
				show :true,
				hAlign : "center", //No I18N
				vAlign : "top" //No I18N
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
				},
				ticklabel: {rotation: 'auto'}, //No I18N
				show: true
			},
			yaxis: [{
				label: {
					text: nfa_getYAxisString((jsonData.yAxis)?jsonData.yAxis:jsonData.YAxis)
				}
			}]
		},
		noDataHandler : {
	        text: Ember.I18n.t('webclient.common.nodata') //No I18N	
	    },
		chart : {
			stacked : false
		},
		isNFATimeSeriesGraph : true
	}

	var arraObj={
		"placeholder":[],//No I18N
		"chartobj":[]//No I18N
	}
	var mappingobj={};
	arraObj.chartobj.push(chartObj);
	arraObj.placeholder.push(divElement);
	zChart(arraObj);
}

function nfa_loadTPAnalysisGraph(chartID, chartData, yAxis) {
	var graphTimeZone = (window.OPM.userTimeZone!=null?window.OPM.userTimeZone:window.OPM.severTimeZone);
	var numericColObj = {
		dataindex:1,
		columnname:"traffic", //NO I18N
		datatype:"numeric", //NO I18N
		numeric:{
			tooltipformat:{
				customFormat:function(value,datatype,columnInfo) {
					return parseFloat(value).toFixed(window.OPM.nfaDecimalCount)+" "+yAxis; //NO I18N
				}
			}
		}
	};
	var scatterPlotOps = {
		marker: {
			symbol:"triangle-up", //NO I18N
			size:1.5,
			innerFillColor:"#FE5C5A", //NO I18N
			innerFillOpacity:1
		},
		events:{
			cursor:"pointer", //NO I18N
			click:function (e, d, chartObj) {
				nfa_getAnomalyReport(chartID.split("tpAnalysis")[1], d.data[0].value); //NO I18N
			}
		}
	};
	chartData[2].plotoptions = $.extend(true,{},scatterPlotOps);
	chartData[2].plotoptions.marker.symbol = "triangle-up"; //NO I18N

	chartData[3].plotoptions = $.extend(true,{},scatterPlotOps);
	chartData[3].plotoptions.marker.symbol = "triangle-down"; //NO I18N
	var dateFormatter;
	if (!window.OPM.isPDF) {
		dateFormatter = new Intl.DateTimeFormat("en-US", {//NO I18N
			weekday: 'long',     // "Wednesday"//NO I18N
			year: 'numeric',     // "2025"
			month: 'long',       // "April"//NO I18N
			day: 'numeric',      // "23"
			hour: 'numeric',     // "11"
			minute: '2-digit',   // "13"
			second: '2-digit',   // "00"
			hour12: true,        // AM/PM format
			timeZone: graphTimeZone, // optional: specify desired timezone
			timeZoneName: 'long' // Full name like "India Standard Time"//NO I18N
		});
	}
	var chartObj = {
		metadata:{
			axes:{
				x:[0],
				y:[
					[1,2,3,4]
				],
				tooltip:[0,1,2,3,4]
			},
			columns:[
				{
					dataindex: 0,
					columnname:"Time", //NO I18N
					datatype:"time", //NO I18N
					time: {
						inputformat:"MILLI", //NO I18N
						subfunction:"ABSMINUTE", //NO I18N
						axisformat: {
							customFormat:function(value,datatype,columnInfo,type,chartObj) {
								return moment.tz(value,graphTimeZone).format("HH:mm"); //NO I18N
							}
						},
						tooltipformat: {
							customFormat:function(value,datatype,columnInfo) {
							return Ember.I18n.t("NFAWidget.Time")+": "+((mtz_pattern.indexOf("zzzz") != -1) ? dateFormatter.format(value) : moment.tz(value,graphTimeZone).format(mtz_pattern));//NO I18N
							}
						}
					}
				},
				numericColObj,
				numericColObj,
				numericColObj,
				numericColObj
			]
		},
		seriesdata:{chartdata:chartData},
		canvas:{
			title:{show:false},
			subtitle:{show:false},
			border:{show:false},
			shadow:{show:false},
			background:{alpha:0}
		},
		legend:{
			enabled:true,
			shapes: [
				"circle","circle","triangle-up","triangle-down" //NO I18N
			],
			colorBox:{
				shape:"circle", //NO I18N
				strokeOpacity:1
			},
			colors:["#84C0FE","#F8A44C","#FE5C5A","#FE5C5A"], //NO I18N
			fontFamily:"LatoRegular", //NO I18N
			fontSize:16,
			hAlign:"center", //left|right|center //NO I18N
			vAlign:"bottom" //top|center|bottom //NO I18N
		},
		tooltip:{
			crosshair:{
				type:"x", //NO I18N
				color:"#D3D3D3", //NO I18N
				dashStyle:"dashed" //NO I18N
			},
			backgroundColor:"#000", //NO I18N
			sharedSeriesInfo:true
		},
		chart:{
			plot:{
				border:{
					show:true,
					color:"#eee" //NO I18N
				},
				animation:{enabled:false},
				plotoptions:{
					arearange:{
						mode:"monotone", //NO I18N
						strokeColor:"#84C0FE", //NO I18N
						strokeWidth:2,
						fillColor:"#84C0FE", //NO I18N
						fillOpacity:0.2,
						marker:{enabled:false}
					},
					line:{
						marker:{enabled:false}
					}
				}
			},
			axes:{
				rotated:false,
				xaxis:{
					label:{text:Ember.I18n.t("NFAWidget.Time")+" ( HH:MM )"}, //NO I18N
					grid:{show:true,color:"#ececec",style:"shortdashdotdot"}, //NO I18N
					tickmark:{color:"grey",size:4,strokeWidth:4} //NO I18N
				},
				yaxis:[{
					label:{text:nfa_getYAxisString(yAxis)},
					outerPadding:0.2,
					grid:{show:true,color:"#ececec",style:"shortdashdotdot"} //NO I18N
				}]
			},
			brush:{
				enabled:true,
				type:"xy", //NO I18N
				resetButton:{
					label:{
						text:Ember.I18n.t("webclient.zcharts.resetzoom"), //NO I18N
						fontSize:11
					},
					border:{radius:6},
					fillColor:"grey" //NO I18N
				},
				selectionArea: {
					fillColor:"grey", //NO I18N
					strokeColor:"grey", //NO I18N
					dashStyle:"shortdash" //NO I18N
				}
			}
		}
	};
	d3.select("#"+chartID).selectAll("rect").remove(); //NO I18N
	d3.select("#"+chartID).select("svg").selectAll("*").remove(); //NO I18N
	d3.select("#"+chartID).selectAll("*").remove(); //NO I18N
	var chartResult = new $ZC.charts([document.getElementById(chartID)], [chartObj]);
}

function nfa_getTPAnomalyGraphParams(chartID,timeInMS,rtData,lLimit,uLimit,yAxis) {
	var anomalyGparams = {
		id:chartID,
		width:"98%", //NO I18N
		data:[{seriesname:"Anomaly",data:[[timeInMS,rtData]],yaxiscolumnorder:[0]}], //NO I18N
		yAxis:nfa_getYAxisString(yAxis),
		isAnomaly:true,
		yAxisThresholdArray:[lLimit,uLimit],
		TimeFrame:"hourly", //NO I18N
		graphPlotType:"scatter", //NO I18N
		legend:{
			enabled:false,
			colors:["#FE5C5A"] //NO I18N
		},
		plot:{
			plotoptions:{
				scatter:{
					marker: {
						symbol:((rtData<=lLimit)?"triangle-down":"triangle-up"), //NO I18N
						size:1.5,
						innerFillColor:"#FE5C5A", //NO I18N
						innerFillOpacity:1
					}
				}
			}
		}
	};
	return anomalyGparams;
}

function NFA_getJQGridDateFormat()
{
	var jqGridDateFormats = {
		"EEEE, MMMM d, y 'at' h:mm:ss a zzzz": "DD, MM d, yyyy 'at' h:i:s A TTTT",//NO I18N
    	"M/d/yy, h:mm a": "M/d/yy, h:i A",//NO I18N
    	"MMM d, y, h:mm:ss a": "M d, yyyy, h:i:s A",//NO I18N
    	"MMMM d, y 'at' h:mm:ss a z": "MM d, yyyy 'at' h:i:s A T",//NO I18N
		"d MMM yyyy hh:mm:ss a z": "d M Y h:i:s A T",//NO I18N
		"dd MM yy hh:mm:ss a z": "d m y h:i:s A T",//NO I18N
		"dd-MM-yy HH:mm:ss": "d-m-y H:i:s",//NO I18N
		"dd-MM-yy HH:mm:ss z": "d-m-y H:i:s T",//NO I18N
		"dd-MM-yy hh:mm:ss a z": "d-m-y h:i:s A T",//NO I18N
		"dd/MM/yy HH:mm": "d/m/y H:i",//NO I18N
		"dd/MM/yyyy hh:mm:ss a": "d/m/Y h:i:s A",//NO I18N
		"dd/MM/yyyy hh:mm:ss a z": "d/m/Y h:i:s A T",//NO I18N
		"dd.MM.yyyy HH:mm": "d.m.Y H:i",//NO I18N
		"MM/dd/yyyy HH:mm": "m/d/Y H:i",//NO I18N
		"MM/dd/yyyy hh:mm:ss a z": "m/d/Y h:i:s A T",//NO I18N
		"MM/dd/yyyy hh:mm:ss a": "m/d/Y h:i:s A",//NO I18N
		"yyyy/MM/dd HH:mm:ss": "Y/m/d H:i:s",//NO I18N
		"yyyy/MM/dd hh:mm:ss a z": "Y/m/d h:i:s A T",//NO I18N
		"yyyy MM dd hh:mm a": "Y m d h:i A",//NO I18N
		"yy-MM-dd HH:mm:ss z": "y-m-d H:i:s T",//NO I18N
		"yy-MM-dd hh:mm:ss a z": "y-m-d h:i:s A T",//NO I18N
		"HH:mm:ss,yyyy.MM.dd": "H:i:s,Y.m.d",//NO I18N
		"HH:mm:ss,dd.MM.yyyy": "H:i:s,d.m.Y",//NO I18N
		"EEE, dd MMM yyyy HH:mm:ss z": "D, d M Y H:i:s T",//NO I18N
		"EEE,MMM d HH:mm:ss z yyyy": "D,M d H:i:s T Y",//NO I18N
		"yyyy-MM-dd'T'hh:mm:ss": "Y-m-d\\Th:i:s",//NO I18N
		"yyyy-MM-dd HH:mm": "Y-m-d H:i"//NO I18N
	};
	return jqGridDateFormats[window.OPM.tooltipTimeFormat];
}

function nfa_customSort(cell)
{
	var kiloVol, kiloSpeed, megaVol, megaSpeed, gigaVol, gigaSpeed, teraVol, teraSpeed, multiplierValue;
	if(window.OPM.isNFAVolumeCalcWith1024){
		kiloVol = "KiB"; kiloSpeed = "Kibps"; megaVol = "MiB"; megaSpeed = "Mibps"; gigaVol = "GiB"; gigaSpeed = "Gibps"; teraVol = "TiB"; teraSpeed = "Tibps"; multiplierValue = 1024; //NO I18N
	}else{
		kiloVol = "KB"; kiloSpeed = "Kbps"; megaVol = "MB"; megaSpeed = "Mbps"; gigaVol = "GB"; gigaSpeed = "Gbps"; teraVol = "TB"; teraSpeed = "Tbps"; multiplierValue = 1000; //NO I18N
	}

	if(cell.indexOf(kiloVol) > 0 || cell.indexOf(kiloSpeed) > 0)
	{
		return parseFloat(cell) * multiplierValue;
	}
	else if(cell.indexOf(megaVol) > 0 || cell.indexOf(megaSpeed) > 0)
	{
		return parseFloat(cell) * multiplierValue * multiplierValue;
	}
	else if(cell.indexOf(gigaVol) > 0 || cell.indexOf(gigaSpeed) > 0)
	{
		return parseFloat(cell) * multiplierValue * multiplierValue * multiplierValue;
	}
	else if(cell.indexOf(teraVol) > 0 || cell.indexOf(teraSpeed) > 0)
	{
		return parseFloat(cell) * multiplierValue * multiplierValue * multiplierValue * multiplierValue;
	}
	else if(cell.indexOf("Bytes") > 0 || cell.indexOf("bps") > 0) //NO I18N
	{
		return parseFloat(cell);
	}
	else if(cell.indexOf("-") != -1) //NO I18N
	{
		return 0;
	}
	else
	{
		return parseFloat(cell);
	}
}

function indvTrafficGraph(cellValue, options, rowdata, action) {
	if(rowdata.Name === 'Others' || rowdata[0] === 'Others') {
		return "";
	}
	return "<div><img src='/apiclient/fluidicv2/img/graph_enable.png'/></div>"; //No I18N
}
function nfa_utilizationSort(cell){
	if(cell.indexOf(">") > -1){
		return parseFloat(cell.replace(">", "")); //NO I18N
	}
	else{
		return parseFloat(cell);
	}
}
